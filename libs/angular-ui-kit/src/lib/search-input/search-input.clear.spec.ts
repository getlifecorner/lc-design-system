import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SearchInputComponent } from './search-input.component';

/**
 * Request 068 (3.48, usm-x row 62, design §2, §9): a clear (× or Escape)
 * emits `''` at once and cancels the pending debounced value, also when `''`
 * was the last emitted value.
 */
@Component({
  standalone: true,
  imports: [SearchInputComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-search-input
      ariaLabel="Suchen"
      [(value)]="value"
      (searchChange)="changes.push($event)"
      (searchSubmit)="submits.push($event)"
    ></lc-search-input>
  `,
})
class HostComponent {
  readonly value = signal('');
  readonly changes: string[] = [];
  readonly submits: string[] = [];
}

describe('lc-search-input clear inside the debounce (3.48)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const field = (): HTMLInputElement => fixture.nativeElement.querySelector('input');
  const type = (text: string) => {
    field().value = text;
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const key = (k: string) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
    field().dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    jest.useRealTimers();
  });

  it('the default debounce is still 300 ms', () => {
    type('abc');
    jest.advanceTimersByTime(299);
    expect(host.changes).toEqual([]);
    jest.advanceTimersByTime(1);
    expect(host.changes).toEqual(['abc']);
  });

  it('typing, Enter, then Escape inside 300 ms ends with one "" and no later stale value', () => {
    // a search was applied and cleared before: the last emitted value is ''
    type('x');
    jest.advanceTimersByTime(300);
    key('Escape');
    expect(host.changes).toEqual(['x', '']);

    type('abc');
    key('Enter');
    expect(host.submits).toEqual(['abc']);
    jest.advanceTimersByTime(100);
    const escape = key('Escape');
    expect(escape.defaultPrevented).toBe(true);
    expect(host.changes).toEqual(['x', '', '']);
    expect(field().value).toBe('');
    expect(host.value()).toBe('');
    jest.advanceTimersByTime(1000);
    expect(host.changes).toEqual(['x', '', '']);
  });

  it('the × button does the same', () => {
    type('x');
    jest.advanceTimersByTime(300);
    key('Escape');
    type('abc');
    key('Enter');
    (fixture.nativeElement.querySelector('.search-input__clear') as HTMLButtonElement).click();
    fixture.detectChanges();
    jest.advanceTimersByTime(1000);
    expect(host.changes).toEqual(['x', '', '']);
  });

  it('typing still dedupes: the same text twice emits once', () => {
    type('abc');
    jest.advanceTimersByTime(300);
    type('abcd');
    type('abc');
    jest.advanceTimersByTime(300);
    expect(host.changes).toEqual(['abc']);
  });
});
