import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { DatepickerComponent } from './datepicker.component';

/**
 * 3.30.1 (request 048, follow-up 047-f2, WCAG 2.5.3 Label in Name): without
 * `locale` the day buttons are named with the long en-US date, which contains
 * the visible day number as a word ("Wednesday, July 1, 2026"; it was
 * `toDateString()`, "Wed Jul 01 2026"). Design 048 §1, §4, §9; AC-1 … AC-3,
 * AC-6 and the unchanged rendering (AC-5, AC-8).
 */
const panel = (): HTMLElement | null => document.querySelector('.lc-datepicker-calendar');
const days = (): HTMLButtonElement[] => [...(panel()?.querySelectorAll<HTMLButtonElement>('.lc-datepicker-day') ?? [])];
const name = (b: HTMLElement): string => b.getAttribute('aria-label') ?? '';
/** The words of a name, without punctuation (how axe's label-in-name rule tokenises). */
const words = (text: string): string[] => text.split(/[^0-9\p{L}]+/u).filter(Boolean);
const visible = (b: HTMLElement): string => (b.textContent ?? '').trim();
const LONG: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };

describe('lc-datepicker 3.30.1 day button names (request 048)', () => {
  let fixture: ComponentFixture<DatepickerComponent>;

  /** Opens the day panel on `month` of `year` (July 2026 by default: 28 June … 8 August, Sunday first). */
  const openAt = (inputs: Record<string, unknown> = {}, year = 2026, month = 6) => {
    TestBed.configureTestingModule({ imports: [DatepickerComponent] });
    fixture = TestBed.createComponent(DatepickerComponent);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    fixture.componentInstance.currentYear.set(year);
    fixture.componentInstance.currentMonth.set(month);
    fixture.componentInstance.open();
    fixture.detectChanges();
  };
  const select = (date: Date) => {
    fixture.componentInstance.writeValue(date);
    fixture.detectChanges();
  };
  const day = (text: string, monthIndex = 0) => days().filter((b) => visible(b) === text)[monthIndex];

  afterEach(() => fixture?.destroy());

  describe('AC-1: the name contains the visible day number (no locale)', () => {
    it('names every one of the 42 buttons with a word equal to its visible number', () => {
      openAt();
      expect(days()).toHaveLength(42);
      const misses = days().filter((b) => !words(name(b)).includes(visible(b)));
      expect(misses.map(visible)).toEqual([]);
    });

    it('uses the long en-US date: day 1, day 15 and the leading and trailing days of other months', () => {
      openAt();
      expect(name(day('1'))).toBe('Wednesday, July 1, 2026');
      expect(name(day('15'))).toBe('Wednesday, July 15, 2026');
      expect(name(days()[0])).toBe('Sunday, June 28, 2026');
      expect(name(day('1', 1))).toBe('Saturday, August 1, 2026');
      expect(name(days()[41])).toBe('Saturday, August 8, 2026');
    });

    it('the word check fails for the old toDateString() names (17 buttons of July 2026), so it can catch a revert', () => {
      const shown = Array.from({ length: 42 }, (_, i) => new Date(2026, 5, 28 + i));
      expect(new Date(2026, 6, 1).toDateString()).toBe('Wed Jul 01 2026');
      expect(shown.filter((d) => !words(d.toDateString()).includes(String(d.getDate())))).toHaveLength(17);
    });
  });

  describe('AC-2: the selected day', () => {
    it('appends ", selected" to the long date, on that button only', () => {
      openAt();
      select(new Date(2026, 6, 1));
      expect(name(day('1'))).toBe('Wednesday, July 1, 2026, selected');
      expect(days().filter((b) => name(b).endsWith(', selected'))).toHaveLength(1);
      expect(day('1').classList).toContain('lc-datepicker-day--selected');
    });

    it('uses a custom selectedAriaLabel', () => {
      openAt({ selectedAriaLabel: 'ausgewählt' });
      select(new Date(2026, 6, 1));
      expect(name(day('1'))).toBe('Wednesday, July 1, 2026, ausgewählt');
    });
  });

  describe('AC-3: locale', () => {
    it('keeps the de-DE names', () => {
      openAt({ locale: 'de-DE', selectedAriaLabel: 'ausgewählt' });
      select(new Date(2026, 6, 15));
      expect(name(day('1'))).toBe('Mittwoch, 1. Juli 2026');
      expect(name(day('15'))).toBe('Mittwoch, 15. Juli 2026, ausgewählt');
      expect(days().filter((b) => !words(name(b)).includes(visible(b)))).toEqual([]);
    });

    it('gives an explicit locale="en-US" the same names as the default', () => {
      openAt();
      const byDefault = days().map(name);
      fixture.destroy();
      TestBed.resetTestingModule();
      openAt({ locale: 'en-US' });
      expect(days().map(name)).toEqual(byDefault);
      expect(byDefault[3]).toBe('Wednesday, July 1, 2026');
    });
  });

  describe('AC-6: today', () => {
    it('keeps aria-current="date" on today only, named with its long en-US date', () => {
      const today = new Date();
      openAt({}, today.getFullYear(), today.getMonth());
      const current = days().filter((b) => b.getAttribute('aria-current') === 'date');
      expect(current).toHaveLength(1);
      expect(visible(current[0])).toBe(String(today.getDate()));
      expect(name(current[0])).toBe(today.toLocaleDateString('en-US', LONG));
      expect(current[0].classList).toContain('lc-datepicker-day--today');
    });
  });

  describe('unchanged rendering (AC-5, AC-8): only the aria-label value changed', () => {
    it('renders the same visible numbers, attributes and classes for July 2026', () => {
      openAt();
      const july = Array.from({ length: 31 }, (_, i) => String(i + 1));
      expect(days().map(visible)).toEqual(['28', '29', '30', ...july, '1', '2', '3', '4', '5', '6', '7', '8']);
      const attrs = (b: HTMLElement) => b.getAttributeNames().filter((n) => !n.startsWith('_ng')).sort();
      expect(attrs(day('15'))).toEqual(['aria-label', 'class', 'type']);
      expect(day('15').getAttribute('type')).toBe('button');
      expect(day('15').className).toBe('lc-datepicker-day');
      expect(days()[0].className).toBe('lc-datepicker-day lc-datepicker-day--other-month');
      expect(days().every((b) => !b.disabled && !b.hasAttribute('tabindex'))).toBe(true);
    });
  });
});
