import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { resolve } from 'path';
import { compile } from 'sass';
import { NumberInputComponent, type NumberInputValueType } from './number-input.component';

/**
 * Request 068 (3.48, 067-s2 and 067-n3, design §9): a locale whose group
 * separator is `.` or `,` reads the typed separators as a whole; a focused
 * field shows a Highlight outline in forced colours.
 */
@Component({
  standalone: true,
  imports: [NumberInputComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<lc-number-input label="Betrag" [locale]="locale()" [valueType]="valueType()" [step]="0.01" [formControl]="control" />`,
})
class HostComponent {
  readonly locale = signal('de-DE');
  readonly valueType = signal<NumberInputValueType>('number');
  readonly control = new FormControl<number | string | null>(null);
}

describe('lc-number-input grouping separators (3.48, 067-s2)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const field = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const type = (text: string) => {
    field().value = text;
    field().dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  };
  const blur = () => {
    field().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  };
  const create = (locale: string, valueType: NumberInputValueType = 'number') => {
    TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideHttpClient(withXhr())] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    host.locale.set(locale);
    host.valueType.set(valueType);
    fixture.detectChanges();
  };

  afterEach(() => fixture?.destroy());

  it.each<[string, string, number, string]>([
    ['de-DE', '2.960,00', 2960, '2960'],
    ['de-DE', '1.234', 1234, '1234'],
    ['de-DE', '12.345.678', 12345678, '12345678'],
    ['de-DE', '1.234,5', 1234.5, '1234,5'],
    ['de-DE', '7.5', 7.5, '7,5'],
    ['de-DE', '1.23', 1.23, '1,23'],
    ['de-DE', '0.500', 0.5, '0,5'],
    ['de-DE', '7,5', 7.5, '7,5'],
    ['de-DE', '-1.234', -1234, '-1234'],
    ['en-US', '1,234', 1234, '1234'],
    ['en-US', '1,234.50', 1234.5, '1234.5'],
    ['en-US', '7,5', 7.5, '7.5'],
    ['en-US', '7.5', 7.5, '7.5'],
    ['', '1.234', 1.234, '1.234'],
    ['', '1,5', 1.5, '1.5'],
    ['fr-FR', '1.234', 1.234, '1,234'],
    ['de-CH', '1.234', 1.234, '1.234'],
  ])('%s: typed %p → %p, shown %p after blur', (locale, text, value, shown) => {
    create(locale);
    type(text);
    expect(host.control.value).toBe(value);
    blur();
    expect(host.control.value).toBe(value);
    expect(field().value).toBe(shown);
  });

  it('de-DE: the typed separators show as typed until blur', () => {
    create('de-DE');
    type('2.960,00');
    expect(field().value).toBe('2.960,00');
    blur();
    expect(field().value).toBe('2960');
  });

  it('de-DE: pasted text is read the same way (letters dropped)', () => {
    create('de-DE');
    type('EUR 2.960,00');
    expect(host.control.value).toBe(2960);
  });

  it.each<[string, string, string, string]>([
    ['de-DE', '2.960,00', '2960.00', '2960,00'],
    ['de-DE', '1.234', '1234', '1234'],
    ['en-US', '1,234.50', '1234.50', '1234.50'],
  ])('string mode, %s: typed %p → %p, shown %p after blur', (locale, text, value, shown) => {
    create(locale, 'string');
    type(text);
    expect(host.control.value).toBe(value);
    blur();
    expect(field().value).toBe(shown);
  });
});

describe('lc-number-input forced colours (3.48, 067-n3)', () => {
  it('a focused field shows a 2 px Highlight outline, as the error state', () => {
    const css = compile(resolve(__dirname, 'number-input.component.scss')).css;
    const forced = css.slice(css.indexOf('@media (forced-colors: active)')).replace(/\s+/g, ' ');
    expect(forced).toMatch(/^@media \(forced-colors: active\) \{ \.number-input__control:focus-within \{ outline: 2px solid Highlight; outline-offset: 0; \}/);
    expect(forced).toContain('.number-input--error .number-input__control:focus-within, .number-input__button:focus-visible { outline-color: Highlight; }');
  });
});
