import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SearchInputComponent } from './search-input.component';

/** Request 065 (usm-x row 32): Escape clears (AC-4), `description` (AC-5). */
describe('lc-search-input Escape and description (3.45)', () => {
  let fixture: ComponentFixture<SearchInputComponent>;
  let values: string[];
  let searches: string[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SearchInputComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(SearchInputComponent);
    fixture.componentRef.setInput('debounceMs', 0);
    values = [];
    searches = [];
    fixture.componentInstance.value.subscribe((v) => values.push(v));
    fixture.componentInstance.searchChange.subscribe((v) => searches.push(v));
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  const input = (): HTMLInputElement => fixture.nativeElement.querySelector('input');
  const type = (text: string): void => {
    input().value = text;
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const escape = (init: KeyboardEventInit = {}): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true, ...init });
    input().dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  describe('AC-4: Escape', () => {
    it('clears a non-empty field once, keeps the focus and consumes the key', () => {
      type('Kosten');
      input().focus();
      values.length = 0;
      searches.length = 0;
      const outside = jest.fn();
      document.addEventListener('keydown', outside);
      const event = escape();
      document.removeEventListener('keydown', outside);
      expect(fixture.componentInstance.value()).toBe('');
      expect(input().value).toBe('');
      expect(values).toEqual(['']);
      expect(searches).toEqual(['']);
      expect(event.defaultPrevented).toBe(true);
      expect(outside).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(input());
    });

    it('passes Escape on when the field is empty (a dialog around it closes)', () => {
      const outside = jest.fn();
      document.addEventListener('keydown', outside);
      const event = escape();
      document.removeEventListener('keydown', outside);
      expect(event.defaultPrevented).toBe(false);
      expect(outside).toHaveBeenCalledTimes(1);
      expect(searches).toEqual([]);
    });

    it('leaves Escape alone with clearOnEscape=false', () => {
      fixture.componentRef.setInput('clearOnEscape', false);
      type('Kosten');
      const event = escape();
      expect(event.defaultPrevented).toBe(false);
      expect(fixture.componentInstance.value()).toBe('Kosten');
    });

    it('ignores Escape while an IME composes', () => {
      type('Kosten');
      expect(escape({ isComposing: true }).defaultPrevented).toBe(false);
      expect(fixture.componentInstance.value()).toBe('Kosten');
    });
  });

  describe('AC-5: description', () => {
    it('renders nothing and no aria-describedby by default', () => {
      expect(input().hasAttribute('aria-describedby')).toBe(false);
      expect(fixture.nativeElement.querySelector('.search-input__description')).toBeNull();
    });

    it('links a hidden description by aria-describedby (EN and DE)', () => {
      for (const text of ['Searches names, numbers and cost centres.', 'Durchsucht Namen, Nummern und Kostenstellen.']) {
        fixture.componentRef.setInput('description', text);
        fixture.detectChanges();
        const id = input().getAttribute('aria-describedby') as string;
        expect(id).toBe(`${input().id}-description`);
        expect(document.getElementById(id)?.textContent).toBe(text);
      }
    });
  });
});
