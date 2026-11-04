import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { resolve } from 'path';
import { compile } from 'sass';
import { DatepickerComponent, type DatepickerGranularity } from './datepicker.component';
import type { DatepickerGranularity as PublicGranularity } from './index';

/**
 * 3.29 (request 046, regeln row 1): `lc-datepicker` `granularity="month"`
 * (design 046 D-1, D-8, §6; AC-1 … AC-7).
 */
@Component({
  standalone: true,
  imports: [DatepickerComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-datepicker
      [granularity]="granularity()"
      [format]="format()"
      [locale]="locale()"
      [minDate]="minDate()"
      [maxDate]="maxDate()"
      [disabledDates]="disabledDates()"
      [formControl]="control"
      (dateChange)="changes.push($event)"
    />
  `,
})
class HostComponent {
  readonly granularity = signal<DatepickerGranularity>('month');
  readonly format = signal('YYYY-MM');
  readonly locale = signal('');
  readonly minDate = signal<Date | undefined>(undefined);
  readonly maxDate = signal<Date | undefined>(undefined);
  readonly disabledDates = signal<Date[]>([]);
  readonly control = new FormControl<Date | string | null>(null);
  readonly changes: (Date | null)[] = [];
}

const panel = (): HTMLElement | null => document.querySelector('.lc-datepicker-calendar');
const cells = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('.lc-datepicker-month')];
const cell = (name: string): HTMLElement => cells().find((c) => c.textContent?.trim() === name) as HTMLElement;

describe('lc-datepicker month granularity (3.29, regeln row 1)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const field = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const picker = () => fixture.debugElement.children[0].componentInstance as DatepickerComponent;

  const create = (patch: Partial<{ locale: string; format: string; min: Date; max: Date; disabled: Date[]; value: Date | string | null }> = {}) => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    if (patch.locale) host.locale.set(patch.locale);
    if (patch.format) host.format.set(patch.format);
    if (patch.min) host.minDate.set(patch.min);
    if (patch.max) host.maxDate.set(patch.max);
    if (patch.disabled) host.disabledDates.set(patch.disabled);
    host.control.setValue(patch.value === undefined ? '2026-07' : patch.value);
    fixture.detectChanges();
  };
  const open = () => {
    field().click();
    fixture.detectChanges();
  };
  const key = (target: HTMLElement, k: string) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };
  const focused = () => (document.activeElement as HTMLElement | null)?.textContent?.trim();

  afterEach(() => fixture?.destroy());

  it('defaults to day and exports the DatepickerGranularity type (AC-1)', () => {
    TestBed.configureTestingModule({ imports: [DatepickerComponent] });
    const plain = TestBed.createComponent(DatepickerComponent);
    expect(plain.componentInstance.granularity()).toBe('day');
    const value: PublicGranularity = 'month';
    expect(value).toBe('month');
    plain.destroy();
  });

  describe('panel (AC-2, AC-4)', () => {
    it('shows the year, year buttons, "This month" and a 3 × 4 grid of the months instead of the days', () => {
      create();
      expect(field().value).toBe('2026-07');
      open();
      const p = panel() as HTMLElement;
      expect(p.classList).toContain('lc-datepicker-calendar--month');
      expect(p.getAttribute('aria-label')).toBe('Choose month');
      const title = p.querySelector('.lc-datepicker-month-year') as HTMLElement;
      expect(title.textContent?.trim()).toBe('2026');
      expect(title.id).toBe(`${field().id}-year`);
      expect([...p.querySelectorAll('.lc-datepicker-nav-button')].map((b) => b.getAttribute('aria-label'))).toEqual([
        'Previous year',
        'Next year',
      ]);
      expect(p.querySelector('.lc-datepicker-today-button')?.textContent?.trim()).toBe('This month');
      expect(p.querySelector('.lc-datepicker-weekdays, .lc-datepicker-days, .lc-datepicker-day')).toBeNull();

      const grid = p.querySelector('[role="grid"]') as HTMLElement;
      expect(grid.getAttribute('aria-labelledby')).toBe(title.id);
      const rows = [...grid.querySelectorAll('[role="row"]')];
      expect(rows.map((r) => r.querySelectorAll('[role="gridcell"]').length)).toEqual([3, 3, 3, 3]);
      expect(cells().map((c) => c.textContent?.trim())).toEqual([
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ]);
      expect(cell('July').getAttribute('aria-label')).toBe('July 2026');
    });

    it('marks the selected month aria-selected (only it) and makes it the one tab stop', () => {
      create();
      open();
      expect(cells().filter((c) => c.hasAttribute('aria-selected')).map((c) => c.textContent?.trim())).toEqual(['July']);
      expect(cell('July').getAttribute('aria-selected')).toBe('true');
      expect(cell('July').classList).toContain('lc-datepicker-month--selected');
      expect(cells().map((c) => c.getAttribute('tabindex')).filter((t) => t === '0')).toHaveLength(1);
      expect(cell('July').getAttribute('tabindex')).toBe('0');
    });

    it('marks the current month aria-current="date" and makes it the tab stop without a selection', () => {
      create({ value: null });
      picker().currentYear.set(new Date().getFullYear());
      open();
      const current = cells()[new Date().getMonth()];
      expect(current.getAttribute('aria-current')).toBe('date');
      expect(current.classList).toContain('lc-datepicker-month--current');
      expect(current.getAttribute('tabindex')).toBe('0');
      expect(cells().filter((c) => c.hasAttribute('aria-current'))).toHaveLength(1);
    });

    it('follows locale: „Juli“, named „Juli 2026“ (AC-2, AC-7)', () => {
      create({ locale: 'de-DE' });
      open();
      expect(cells()[6].textContent?.trim()).toBe('Juli');
      expect(cells()[6].getAttribute('aria-label')).toBe('Juli 2026');
      expect(cells()[2].textContent?.trim()).toBe('März');
    });

    it('moves by year with the year buttons; "This month" shows the current year', () => {
      create();
      open();
      const [prev, next] = [...(panel() as HTMLElement).querySelectorAll<HTMLButtonElement>('.lc-datepicker-nav-button')];
      next.click();
      fixture.detectChanges();
      expect(panel()?.querySelector('.lc-datepicker-month-year')?.textContent?.trim()).toBe('2027');
      expect(cell('July').getAttribute('aria-label')).toBe('July 2027');
      expect(cell('July').hasAttribute('aria-selected')).toBe(false);
      prev.click();
      prev.click();
      fixture.detectChanges();
      expect(panel()?.querySelector('.lc-datepicker-month-year')?.textContent?.trim()).toBe('2025');
      (panel()?.querySelector('.lc-datepicker-today-button') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(panel()?.querySelector('.lc-datepicker-month-year')?.textContent?.trim()).toBe(String(new Date().getFullYear()));
    });
  });

  describe('value (AC-3)', () => {
    it('emits the 1st of the chosen month at local midnight, closes and focuses the field', () => {
      create();
      open();
      cell('September').focus();
      cell('September').click();
      fixture.detectChanges();
      expect(host.changes).toEqual([new Date(2026, 8, 1)]);
      expect(host.control.value).toEqual(new Date(2026, 8, 1));
      expect(field().value).toBe('2026-09');
      expect(picker().isOpen()).toBe(false);
      expect(document.activeElement).toBe(field());
    });

    it('shows writeValue("2026-07"), a Date and null', () => {
      create({ value: '2026-03' });
      expect(field().value).toBe('2026-03');
      host.control.setValue(new Date(2026, 6, 15));
      fixture.detectChanges();
      expect(field().value).toBe('2026-07');
      host.control.setValue(null);
      fixture.detectChanges();
      expect(field().value).toBe('');
      expect(host.changes).toEqual([]);
    });

    it('commits a typed "2026-07" like a day', () => {
      create({ value: null });
      field().value = '2026-07';
      field().dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(host.changes).toEqual([new Date(2026, 6, 1)]);
      expect(host.control.value).toEqual(new Date(2026, 6, 1));
    });

    it('shows 01 for a DD token in month mode', () => {
      create({ format: 'YYYY-MM-DD', value: new Date(2026, 6, 15) });
      expect(field().value).toBe('2026-07-01');
    });
  });

  describe('keyboard (AC-4)', () => {
    it('opens with ArrowDown, Enter or Space on the closed field and focuses the grid', async () => {
      for (const k of ['ArrowDown', 'Enter', ' ']) {
        create();
        field().focus();
        const event = key(field(), k);
        await fixture.whenStable();
        expect(event.defaultPrevented).toBe(true);
        expect(picker().isOpen()).toBe(true);
        expect(focused()).toBe('July');
        fixture.destroy();
        TestBed.resetTestingModule();
      }
    });

    it('keeps focus in the field on a click; ArrowDown from the open field focuses the grid', () => {
      create();
      field().focus();
      open();
      expect(document.activeElement).toBe(field());
      key(field(), 'ArrowDown');
      expect(focused()).toBe('July');
    });

    it('moves focus by month, row, year and to the ends of the year; arrows never select', () => {
      create();
      open();
      cell('July').focus();
      key(document.activeElement as HTMLElement, 'ArrowRight');
      expect(focused()).toBe('August');
      expect(cell('August').getAttribute('tabindex')).toBe('0');
      expect(cell('July').getAttribute('tabindex')).toBe('-1');
      key(document.activeElement as HTMLElement, 'ArrowDown');
      expect(focused()).toBe('November');
      key(document.activeElement as HTMLElement, 'ArrowUp');
      key(document.activeElement as HTMLElement, 'ArrowLeft');
      expect(focused()).toBe('July');
      key(document.activeElement as HTMLElement, 'Home');
      expect(focused()).toBe('January');
      key(document.activeElement as HTMLElement, 'ArrowLeft');
      expect(focused()).toBe('December');
      expect(panel()?.querySelector('.lc-datepicker-month-year')?.textContent?.trim()).toBe('2025');
      key(document.activeElement as HTMLElement, 'PageDown');
      expect(focused()).toBe('December');
      expect(panel()?.querySelector('.lc-datepicker-month-year')?.textContent?.trim()).toBe('2026');
      key(document.activeElement as HTMLElement, 'End');
      expect(focused()).toBe('December');
      key(document.activeElement as HTMLElement, 'PageUp');
      expect(panel()?.querySelector('.lc-datepicker-month-year')?.textContent?.trim()).toBe('2025');
      expect((document.activeElement as HTMLElement).getAttribute('aria-label')).toBe('December 2025');
      expect(host.changes).toEqual([]);
    });

    it.each(['Enter', ' '])('selects the focused month with %p', (k) => {
      create();
      open();
      cell('July').focus();
      key(document.activeElement as HTMLElement, 'ArrowRight');
      const event = key(document.activeElement as HTMLElement, k);
      expect(event.defaultPrevented).toBe(true);
      expect(host.changes).toEqual([new Date(2026, 7, 1)]);
      expect(picker().isOpen()).toBe(false);
      expect(document.activeElement).toBe(field());
    });

    it('starts the tab stop on the selected month again when it reopens', () => {
      create();
      open();
      cell('July').focus();
      key(document.activeElement as HTMLElement, 'ArrowRight');
      key(document.activeElement as HTMLElement, 'ArrowRight');
      key(document.activeElement as HTMLElement, 'Escape');
      open();
      expect(cell('July').getAttribute('tabindex')).toBe('0');
      expect(cell('September').getAttribute('tabindex')).toBe('-1');
    });

    it('closes with Escape, focus back on the field, the key kept from enclosing overlays', () => {
      create();
      open();
      cell('July').focus();
      const outer = jest.fn();
      document.addEventListener('keydown', outer);
      const event = key(document.activeElement as HTMLElement, 'Escape');
      document.removeEventListener('keydown', outer);
      expect(event.defaultPrevented).toBe(true);
      expect(outer).not.toHaveBeenCalled();
      expect(picker().isOpen()).toBe(false);
      expect(document.activeElement).toBe(field());
      expect(host.changes).toEqual([]);
    });
  });

  describe('minDate, maxDate, disabledDates (AC-5)', () => {
    const range = { min: new Date(2026, 2, 15), max: new Date(2027, 1, 28) };

    it('disables the months fully outside the range; a month with any day in range stays', () => {
      create(range);
      open();
      expect(cells().filter((c) => c.getAttribute('aria-disabled') === 'true').map((c) => c.textContent?.trim())).toEqual([
        'January',
        'February',
      ]);
      expect(cell('March').hasAttribute('aria-disabled')).toBe(false);
      expect(cell('January').classList).toContain('lc-datepicker-month--disabled');
      cell('February').click();
      fixture.detectChanges();
      expect(host.changes).toEqual([]);
      cell('March').click();
      fixture.detectChanges();
      expect(host.changes).toEqual([new Date(2026, 2, 1)]);
    });

    it('disables the whole month of a disabledDates entry', () => {
      create({ disabled: [new Date(2026, 9, 3)] });
      open();
      expect(cell('October').getAttribute('aria-disabled')).toBe('true');
      expect(cell('September').hasAttribute('aria-disabled')).toBe(false);
    });

    it('skips disabled months with the keys and stays when none is left', () => {
      create({ ...range, disabled: [new Date(2026, 3, 1)] });
      open();
      cell('March').focus();
      key(document.activeElement as HTMLElement, 'ArrowRight');
      expect(focused()).toBe('May');
      key(document.activeElement as HTMLElement, 'Home');
      expect(focused()).toBe('March');
      key(document.activeElement as HTMLElement, 'ArrowLeft');
      expect(focused()).toBe('March');
      key(document.activeElement as HTMLElement, 'PageUp');
      expect(focused()).toBe('March');
      expect(panel()?.querySelector('.lc-datepicker-month-year')?.textContent?.trim()).toBe('2026');
      key(document.activeElement as HTMLElement, 'PageDown');
      expect((document.activeElement as HTMLElement).getAttribute('aria-label')).toBe('February 2027');
      key(document.activeElement as HTMLElement, 'ArrowRight');
      expect((document.activeElement as HTMLElement).getAttribute('aria-label')).toBe('February 2027');
    });

    it('never makes a disabled month the tab stop', () => {
      create({ ...range, value: null });
      picker().currentYear.set(2026);
      open();
      const stop = cells().find((c) => c.getAttribute('tabindex') === '0') as HTMLElement;
      expect(stop.hasAttribute('aria-disabled')).toBe(false);
    });
  });
});

describe('lc-datepicker day mode unchanged (3.29, AC-1)', () => {
  it('keeps the day panel: "Choose date", month title, month buttons, 7 weekdays, 42 days, no month class', () => {
    TestBed.configureTestingModule({ imports: [DatepickerComponent] });
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.detectChanges();
    fixture.componentInstance.currentMonth.set(6);
    fixture.componentInstance.currentYear.set(2026);
    fixture.componentInstance.open();
    fixture.detectChanges();
    const p = panel() as HTMLElement;
    expect(p.className).toBe('lc-datepicker-calendar lc-datepicker-calendar--open');
    expect(p.getAttribute('aria-label')).toBe('Choose date');
    const title = p.querySelector('.lc-datepicker-month-year') as HTMLElement;
    expect(title.textContent).toBe(' July 2026 ');
    expect(title.hasAttribute('id')).toBe(false);
    expect([...p.querySelectorAll('.lc-datepicker-nav-button')].map((b) => b.getAttribute('aria-label'))).toEqual([
      'Previous month',
      'Next month',
    ]);
    expect(p.querySelector('.lc-datepicker-today-button')?.textContent).toBe(' Today ');
    expect(p.querySelectorAll('.lc-datepicker-weekday')).toHaveLength(7);
    expect(p.querySelectorAll('.lc-datepicker-day')).toHaveLength(42);
    expect(p.querySelector('[role="grid"], .lc-datepicker-month')).toBeNull();
    expect([...p.children].map((c) => c.className)).toEqual([
      'lc-datepicker-header',
      'lc-datepicker-quick-actions',
      'lc-datepicker-weekdays',
      'lc-datepicker-days',
    ]);
    fixture.destroy();
  });
});

describe('lc-datepicker month styles (3.29, AC-6)', () => {
  const css = compile(resolve(__dirname, 'datepicker.component.scss')).css;
  const rule = (selector: string) => {
    const at = css.indexOf(`\n${selector} {`);
    expect(at).toBeGreaterThan(-1);
    return css.slice(at, css.indexOf('}', at));
  };

  it('keeps the day-mode sizes: nav 2rem, quick action without a min-height, day 2.25rem', () => {
    expect(rule('.lc-datepicker-nav-button')).toMatch(/width: 2rem;\n\s*height: 2rem;/);
    expect(rule('.lc-datepicker-today-button')).not.toContain('min-height');
    expect(rule('.lc-datepicker-day')).toMatch(/width: 2\.25rem;\n\s*height: 2\.25rem;/);
  });

  it('gives month mode 44 px year buttons and quick action', () => {
    expect(rule('.lc-datepicker-calendar--month .lc-datepicker-nav-button')).toMatch(/width: 2\.75rem;\n\s*height: 2\.75rem;/);
    expect(rule('.lc-datepicker-calendar--month .lc-datepicker-today-button')).toContain('min-height: 2.75rem');
  });

  it('lays out 3 columns in the 276 px content box, 8 px apart, narrowing with the viewport', () => {
    const grid = rule('.lc-datepicker-months');
    expect(grid).toContain('gap: var(--spacing-2)');
    expect(grid).toContain('inline-size: 17.25rem');
    expect(grid).toContain('max-inline-size: calc(100vw - 4.125rem)');
    expect(rule('.lc-datepicker-month-row')).toMatch(/grid-template-columns: repeat\(3, 1fr\);\n\s*gap: var\(--spacing-2\);/);
  });

  it('makes each month a 44 px target that wraps a long name instead of overflowing', () => {
    const month = rule('.lc-datepicker-month');
    expect(month).toContain('min-height: 2.75rem');
    expect(month).toContain('padding: 0 var(--spacing-1)');
    expect(month).toContain('overflow-wrap: anywhere');
    expect(month).toContain('font-size: var(--font-size-sm)');
    expect(month).not.toContain('transition');
  });

  it('marks the selected month with the fill and an inset primary-500 ring (D-8)', () => {
    const selected = rule('.lc-datepicker-month.lc-datepicker-month--selected');
    expect(selected).toContain('background-color: var(--color-primary-fill)');
    expect(selected).toContain('color: var(--color-on-primary)');
    expect(selected).toContain('box-shadow: inset 0 0 0 2px var(--color-primary-500)');
  });

  it('uses system colours in forced colours', () => {
    const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
    expect(forced).toMatch(/\.lc-datepicker-month:focus-visible \{\n\s*outline-color: Highlight;/);
    expect(forced).toMatch(/\.lc-datepicker-month\.lc-datepicker-month--selected \{\n\s*forced-color-adjust: none;\n\s*background-color: Highlight;\n\s*color: HighlightText;/);
    expect(forced).toMatch(/\.lc-datepicker-month\.lc-datepicker-month--current \{\n\s*text-decoration: underline;/);
    expect(forced).toMatch(/\.lc-datepicker-month\.lc-datepicker-month--disabled \{\n\s*color: GrayText;/);
  });
});
