import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { computeAccessibleName } from 'dom-accessibility-api';
import { audit, violations } from '../../testing/axe-jsdom';
import {
  DatepickerComponent,
  parseDatepickerTime,
  type DatepickerMode,
  type DatepickerValueType,
} from './datepicker.component';

/**
 * Request 068 (3.48, usm-x row 67, design §3B): `mode` `time` / `datetime`
 * and `valueType="string"` with ISO 8601 local text and validators.
 */
@Component({
  standalone: true,
  imports: [DatepickerComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div lang="de">
      <lc-datepicker
        [label]="label()"
        [mode]="mode()"
        [valueType]="valueType()"
        format="DD.MM.YYYY"
        [minDate]="minDate()"
        [minTime]="minTime()"
        [maxTime]="maxTime()"
        dateAriaLabel="Datum"
        timeAriaLabel="Uhrzeit"
        timeListAriaLabel="Uhrzeit wählen"
        [formControl]="control"
        (stringValueChange)="strings.push($event)"
        (dateChange)="dates.push($event)"
      />
    </div>
  `,
})
class Host {
  readonly label = signal('Termin');
  readonly mode = signal<DatepickerMode>('time');
  readonly valueType = signal<DatepickerValueType>('date');
  readonly minDate = signal<Date | undefined>(undefined);
  readonly minTime = signal('');
  readonly maxTime = signal('');
  readonly control = new FormControl<Date | string | null>(null);
  readonly strings: (string | null)[] = [];
  readonly dates: (Date | null)[] = [];
}

describe('parseDatepickerTime (3.48)', () => {
  it.each([
    ['9', '09:00'],
    ['09', '09:00'],
    ['930', '09:30'],
    ['0930', '09:30'],
    ['9:30', '09:30'],
    ['9.30', '09:30'],
    ['09:30', '09:30'],
    [' 23:59 ', '23:59'],
    ['0', '00:00'],
  ])('%p → %p', (text, time) => expect(parseDatepickerTime(text)).toBe(time));

  it.each([['24:00'], ['12:61'], ['abc'], [''], ['9:3'], ['12345'], ['-1']])('%p → null', (text) =>
    expect(parseDatepickerTime(text)).toBeNull(),
  );
});

describe('lc-datepicker modes (3.48)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const el = (): HTMLElement => fixture.nativeElement;
  const timeField = () => el().querySelector('input[aria-haspopup="listbox"]') as HTMLInputElement;
  const dateField = () => el().querySelector('input[aria-haspopup="dialog"]') as HTMLInputElement | null;
  const list = () => document.querySelector('.cdk-overlay-container [role="listbox"]') as HTMLElement | null;
  const options = () => Array.from(list()?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
  const activeText = () => document.getElementById(timeField().getAttribute('aria-activedescendant') ?? '')?.textContent?.trim();
  const type = (field: HTMLInputElement, text: string) => {
    field.value = text;
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const key = (field: HTMLElement, k: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init });
    field.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };
  const blur = (field: HTMLElement) => {
    field.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    document.body.appendChild(el());
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    el().remove();
  });

  describe('time', () => {
    it('renders one combobox field named by the label, no date field', () => {
      expect(dateField()).toBeNull();
      expect(timeField().getAttribute('role')).toBe('combobox');
      expect(timeField().getAttribute('aria-autocomplete')).toBe('none');
      expect(timeField().getAttribute('inputmode')).toBe('numeric');
      expect(timeField().getAttribute('placeholder')).toBe('HH:MM');
      expect(computeAccessibleName(timeField())).toBe('Termin');
      expect(el().querySelector('.lc-datepicker-wrapper')?.hasAttribute('role')).toBe(false);
    });

    it.each([['930'], ['9.30'], ['0930'], ['9:30']])('typed %p becomes 09:30 on blur (always a string)', (text) => {
      type(timeField(), text);
      expect(host.control.value).toBeNull();
      blur(timeField());
      expect(host.control.value).toBe('09:30');
      expect(timeField().value).toBe('09:30');
      expect(host.strings).toEqual(['09:30']);
      expect(host.dates).toEqual([]);
      expect(host.control.valid).toBe(true);
    });

    it('typed text is committed on Enter too', () => {
      type(timeField(), '14');
      expect(key(timeField(), 'Enter').defaultPrevented).toBe(true);
      expect(host.control.value).toBe('14:00');
    });

    it('invalid text is kept, the model is null and the control has lcDatepickerParse', () => {
      host.control.setValue('08:00');
      fixture.detectChanges();
      type(timeField(), '24:00');
      blur(timeField());
      expect(host.control.value).toBeNull();
      expect(timeField().value).toBe('24:00');
      expect(host.control.errors).toEqual({ lcDatepickerParse: { text: '24:00' } });
      type(timeField(), '7');
      blur(timeField());
      expect(host.control.value).toBe('07:00');
      expect(host.control.errors).toBeNull();
    });

    it('ArrowDown opens the list at the selected time; arrows, PageDown, Home, End move; Enter selects and closes', () => {
      host.control.setValue('09:30');
      fixture.detectChanges();
      key(timeField(), 'ArrowDown');
      expect(timeField().getAttribute('aria-expanded')).toBe('true');
      expect(timeField().getAttribute('aria-controls')).toBe(list()?.id);
      expect(list()?.getAttribute('aria-label')).toBe('Uhrzeit wählen');
      expect(list()?.getAttribute('lang')).toBe('de');
      expect(options()).toHaveLength(96);
      expect(activeText()).toBe('09:30');
      expect(options().find((o) => o.textContent?.trim() === '09:30')?.getAttribute('aria-selected')).toBe('true');
      key(timeField(), 'ArrowDown');
      expect(activeText()).toBe('09:45');
      key(timeField(), 'PageDown');
      expect(activeText()).toBe('10:45');
      key(timeField(), 'ArrowUp');
      expect(activeText()).toBe('10:30');
      key(timeField(), 'Home');
      expect(activeText()).toBe('00:00');
      key(timeField(), 'End');
      expect(activeText()).toBe('23:45');
      key(timeField(), 'Enter');
      expect(host.control.value).toBe('23:45');
      expect(timeField().getAttribute('aria-expanded')).toBe('false');
      expect(list()).toBeNull();
    });

    it('Escape closes the list only (preventDefault, stopPropagation)', () => {
      const outer: string[] = [];
      el().addEventListener('keydown', (e) => outer.push(e.key));
      key(timeField(), 'ArrowDown');
      const escape = key(timeField(), 'Escape');
      expect(escape.defaultPrevented).toBe(true);
      expect(outer).toEqual(['ArrowDown']);
      expect(list()).toBeNull();
      // closed: Escape passes on
      expect(key(timeField(), 'Escape').defaultPrevented).toBe(false);
    });

    it('options out of minTime / maxTime are aria-disabled and skipped; a typed one reports min / max', () => {
      host.minTime.set('08:00');
      host.maxTime.set('18:00');
      fixture.detectChanges();
      key(timeField(), 'ArrowDown');
      expect(options().find((o) => o.textContent?.trim() === '07:45')?.getAttribute('aria-disabled')).toBe('true');
      expect(options().find((o) => o.textContent?.trim() === '08:00')?.hasAttribute('aria-disabled')).toBe(false);
      key(timeField(), 'Home');
      expect(activeText()).toBe('08:00');
      key(timeField(), 'End');
      expect(activeText()).toBe('18:00');
      key(timeField(), 'Escape');
      type(timeField(), '7');
      blur(timeField());
      expect(host.control.value).toBe('07:00');
      expect(host.control.errors).toEqual({ lcDatepickerMin: { min: '08:00', actual: '07:00' } });
    });

    it('a click on an option selects it; the clear button clears the time', () => {
      key(timeField(), 'ArrowDown');
      options().find((o) => o.textContent?.trim() === '12:15')?.click();
      fixture.detectChanges();
      expect(host.control.value).toBe('12:15');
      const clear = el().querySelector('.lc-datepicker-time-wrapper .lc-datepicker-clear') as HTMLButtonElement;
      expect(clear.getAttribute('aria-label')).toBe('Clear time');
      clear.click();
      fixture.detectChanges();
      expect(host.control.value).toBeNull();
      expect(timeField().value).toBe('');
    });
  });

  describe('datetime', () => {
    beforeEach(() => {
      host.mode.set('datetime');
      host.valueType.set('string');
      fixture.detectChanges();
    });

    it('is a group named by the label; each field is „<label> <part>“', () => {
      const group = el().querySelector('.lc-datepicker-wrapper') as HTMLElement;
      expect(group.getAttribute('role')).toBe('group');
      expect(computeAccessibleName(group)).toBe('Termin');
      expect(computeAccessibleName(dateField() as HTMLInputElement)).toBe('Termin Datum');
      expect(computeAccessibleName(timeField())).toBe('Termin Uhrzeit');
      expect((el().querySelector('label') as HTMLLabelElement).htmlFor).toBe(dateField()?.id);
    });

    it('writes and emits YYYY-MM-DDTHH:mm; the date shows in `format`', () => {
      host.control.setValue('2026-11-18T14:30');
      fixture.detectChanges();
      expect(dateField()?.value).toBe('18.11.2026');
      expect(timeField().value).toBe('14:30');
      type(timeField(), '930');
      blur(timeField());
      expect(host.control.value).toBe('2026-11-18T09:30');
      type(dateField() as HTMLInputElement, '19.11.2026');
      expect(host.control.value).toBe('2026-11-19T09:30');
      expect(host.strings).toEqual(['2026-11-18T09:30', '2026-11-19T09:30']);
      expect(host.dates).toEqual([]);
    });

    it('one part only: null and lcDatepickerIncomplete', () => {
      type(dateField() as HTMLInputElement, '19.11.2026');
      expect(host.control.value).toBeNull();
      expect(host.control.errors).toEqual({ lcDatepickerIncomplete: true });
      type(timeField(), '8');
      blur(timeField());
      expect(host.control.value).toBe('2026-11-19T08:00');
      expect(host.control.errors).toBeNull();
    });

    it('a date before minDate reports lcDatepickerMin', () => {
      host.minDate.set(new Date(2026, 10, 18));
      fixture.detectChanges();
      host.control.setValue('2026-11-17T10:00');
      expect(host.control.errors).toEqual({ lcDatepickerMin: { min: '2026-11-18', actual: '2026-11-17' } });
    });

    it('valueType date: a Date with the time of day', () => {
      host.valueType.set('date');
      fixture.detectChanges();
      host.control.setValue(new Date(2026, 10, 18, 14, 30));
      fixture.detectChanges();
      expect(timeField().value).toBe('14:30');
      type(timeField(), '16');
      blur(timeField());
      expect(host.control.value).toEqual(new Date(2026, 10, 18, 16, 0));
      expect(host.dates).toEqual([new Date(2026, 10, 18, 16, 0)]);
      expect(host.strings).toEqual([]);
      expect(host.control.errors).toBeNull();
    });

    it('axe: no violations', async () => {
      expect(violations(await audit(el()))).toEqual([]);
    });
  });

  describe('date with valueType string', () => {
    beforeEach(() => {
      host.mode.set('date');
      host.valueType.set('string');
      fixture.detectChanges();
    });

    it('reads and emits YYYY-MM-DD, no Date; dateChange is silent', () => {
      host.control.setValue('2026-11-18');
      fixture.detectChanges();
      expect(dateField()?.value).toBe('18.11.2026');
      type(dateField() as HTMLInputElement, '20.11.2026');
      expect(host.control.value).toBe('2026-11-20');
      expect(host.strings).toEqual(['2026-11-20']);
      expect(host.dates).toEqual([]);
    });

    it('invalid text on blur: kept, null, lcDatepickerParse', () => {
      host.control.setValue('2026-11-18');
      fixture.detectChanges();
      type(dateField() as HTMLInputElement, '31.02.2026');
      blur(dateField() as HTMLInputElement);
      expect(host.control.value).toBeNull();
      expect(dateField()?.value).toBe('31.02.2026');
      expect(host.control.errors).toEqual({ lcDatepickerParse: { text: '31.02.2026' } });
    });
  });

  describe('date (default)', () => {
    it('validates nothing and emits a Date, as before', () => {
      host.mode.set('date');
      fixture.detectChanges();
      type(dateField() as HTMLInputElement, '20.11.2026');
      expect(host.control.value).toEqual(new Date(2026, 10, 20));
      expect(host.dates).toEqual([new Date(2026, 10, 20)]);
      expect(host.strings).toEqual([]);
      type(dateField() as HTMLInputElement, 'kaputt');
      blur(dateField() as HTMLInputElement);
      expect(host.control.errors).toBeNull();
      expect(el().querySelector('.lc-datepicker-time-wrapper')).toBeNull();
    });
  });
});
