import type { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { fn, expect, userEvent, within } from 'storybook/test';
import { DatepickerComponent } from './datepicker.component';

/**
 * A date selection input with a dropdown calendar. Supports date formatting,
 * min/max date constraints, disabled dates, weekend disabling, and both
 * outline and filled visual variants.
 */
const meta: Meta<DatepickerComponent> = {
  title: 'Form/Datepicker',
  component: DatepickerComponent,
  args: {
    dateChange: fn(),
    opened: fn(),
    closed: fn(),
  },
  argTypes: {
    dateChange: { action: 'dateChange', description: 'Emitted when a date is selected (Date | null)' },
    opened: { action: 'opened', description: 'Emitted when the calendar dropdown opens' },
    closed: { action: 'closed', description: 'Emitted when the calendar dropdown closes' },
    variant: {
      control: 'select',
      options: ['outline', 'filled'],
      description: 'Visual style of the input field',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Input field size',
    },
    placeholder: { description: 'Placeholder text when no date is selected' },
    format: { description: 'Date display format (e.g. YYYY-MM-DD, DD/MM/YYYY)' },
    helperText: { description: 'Help text displayed below the input' },
    error: { description: 'Shows error styling' },
    errorMessage: { description: 'Error message displayed below the input' },
    disabled: { description: 'Prevents interaction' },
    readonly: { description: 'Shows value but prevents editing' },
    required: { description: 'Marks the field as required' },
    disableWeekends: { description: 'Prevents selecting Saturday/Sunday' },
    granularity: {
      control: 'inline-radio',
      options: ['day', 'month'],
      description:
        "3.29: pick a day or a month. `month`: a 12-month grid with year navigation; `dateChange` and the forms value are the 1st of the month (local midnight); use a month `format` (`'YYYY-MM'`). `minDate`/`maxDate` keep a month selectable when any of its days is in range, a `disabledDates` entry disables its whole month, `disableWeekends` is ignored.",
      table: { defaultValue: { summary: 'day' } },
    },
    previousYearAriaLabel: {
      control: 'text',
      description: '3.29: accessible name of the previous-year button (month mode)',
      table: { defaultValue: { summary: 'Previous year' } },
    },
    nextYearAriaLabel: {
      control: 'text',
      description: '3.29: accessible name of the next-year button (month mode)',
      table: { defaultValue: { summary: 'Next year' } },
    },
    monthDialogAriaLabel: {
      control: 'text',
      description: "3.29: accessible name of the month dialog (month mode; `dialogAriaLabel` stays the day dialog's)",
      table: { defaultValue: { summary: 'Choose month' } },
    },
    currentMonthLabel: {
      control: 'text',
      description: '3.29: label of the quick action that shows the current year (month mode; day mode keeps `todayLabel`)',
      table: { defaultValue: { summary: 'This month' } },
    },
    label: {
      control: 'text',
      description:
        '3.30 (regeln row 7): visible label above the field: a `<label for>` in day and month mode that names the field, so `ariaLabel` is not used while it is set. Empty: no label element, as before.',
      table: { defaultValue: { summary: "''" } },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
Datepicker component for date selection with calendar overlay.

**Key Features:**
- Calendar popup with month and year navigation
- Min/max date constraints
- Disabled specific dates and weekends
- Configurable date format string
- Variant styles (outline, filled)
- Size presets (xs, sm, md, lg)
- Disabled and readonly states
- ControlValueAccessor integration for reactive forms
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<DatepickerComponent>;

export const Default: Story = {
  args: { variant: 'outline', size: 'md', placeholder: 'Select a date' },
};

export const FilledVariant: Story = {
  name: 'Filled Variant',
  args: { variant: 'filled', size: 'md', placeholder: 'Select a date' },
};

export const WithHelperText: Story = {
  name: 'With Helper Text',
  args: { variant: 'outline', size: 'md', placeholder: 'Select a date', helperText: 'Choose your preferred start date' },
};

export const WithError: Story = {
  name: 'Error State',
  args: { variant: 'outline', size: 'md', placeholder: 'Select a date', error: true, errorMessage: 'Start date must be in the future' },
};

export const Required: Story = {
  args: { variant: 'outline', size: 'md', placeholder: 'Select a date', required: true },
};

export const Disabled: Story = {
  args: { variant: 'outline', size: 'md', placeholder: 'No date available', disabled: true },
};

export const DisableWeekends: Story = {
  name: 'Weekends Disabled',
  args: { variant: 'outline', size: 'md', placeholder: 'Select a weekday', disableWeekends: true, helperText: 'Only business days are selectable' },
};

export const Sizes: Story = {
  name: 'Size Comparison',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 300px;">
        <lc-datepicker size="xs" placeholder="Extra small"></lc-datepicker>
        <lc-datepicker size="sm" placeholder="Small"></lc-datepicker>
        <lc-datepicker size="md" placeholder="Medium (default)"></lc-datepicker>
        <lc-datepicker size="lg" placeholder="Large"></lc-datepicker>
      </div>`,
  }),
};

/** 3.27.2 (request 044, F-31): the filled field's boundary in every size and state, in German. */
export const FilledStates: Story = {
  name: 'Filled States (DE)',
  parameters: {
    docs: {
      description: {
        story:
          '3.27.2 (request 044, F-31): `variant="filled"` in every size, with an error, disabled and read-only. The filled field now draws the field boundary of the outline variant (its border was transparent at rest and `--color-border` under the pointer, 1.23:1 light, 1.29:1 dark): `--color-field-border` at rest, 4.83:1 light and 7.31:1 dark on the page, 4.39:1 / 7.02:1 on its own sunken fill; `--color-text-secondary` on hover, 6.86:1 light and at least 8.17:1 dark on the hover fill (WCAG 1.4.11). The border was already 1 px, so the heights (xs to lg 24/32/40/44) do not change. A filled error field now shows its `--color-error-600` border (it was transparent: the filled rule came after the error rule), also on focus; disabled shows the muted `--color-border` of the outline variant; read-only keeps the boundary with no hover change.',
      },
    },
  },
  render: () => ({
    props: { sizes: ['xs', 'sm', 'md', 'lg'] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 300px;">
        @for (size of sizes; track size) {
          <lc-datepicker variant="filled" [size]="size" placeholder="Datum wählen" [ariaLabel]="'Datum (' + size + ')'"></lc-datepicker>
        }
        <lc-datepicker variant="filled" placeholder="Datum wählen" ariaLabel="Datum (Fehler)" [error]="true" errorMessage="Bitte ein gültiges Datum wählen"></lc-datepicker>
        <lc-datepicker variant="filled" placeholder="Datum wählen" ariaLabel="Datum (deaktiviert)" [disabled]="true"></lc-datepicker>
        <lc-datepicker variant="filled" placeholder="Datum wählen" ariaLabel="Datum (schreibgeschützt)" [readonly]="true"></lc-datepicker>
      </div>`,
  }),
};

/** Opens the panel of the story's datepicker with a click (focus stays in the field), after ngModel wrote its value. */
const openByClick: Story['play'] = async ({ canvasElement, viewMode }) => {
  if (viewMode !== 'story') return;
  await new Promise((resolve) => setTimeout(resolve, 50));
  canvasElement.querySelector<HTMLInputElement>('lc-datepicker input')?.click();
};

/** 3.29 (request 046, regeln row 1): month granularity. */
export const Month: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '3.29 (request 046, finance-intelligence rules page, "Gilt ab"): `granularity="month" format="YYYY-MM"` picks a month, so the day does not seem to matter. The panel (opened here) has the same 310 px width as the day calendar: the year with previous/next-year buttons, a "This month" quick action that shows the current year, and twelve months in a 3 × 4 grid, every target at least 44 px high. Choosing July 2026 emits `dateChange` with 1 July 2026 (local midnight); the field shows "2026-07"; typing "2026-07" commits too. Keyboard: ArrowDown, Enter or Space on the closed field open the panel with focus in the grid (ArrowDown also from the open field); arrows move by month and row, PageUp/PageDown by year, Home/End to the first/last month, Enter/Space select, Escape closes, focus returns to the field. Each month is named with its year ("July 2026"); the selected one is `aria-selected` and has an inset ring (its fill alone is 2.78:1 on the dark surface), the current month is `aria-current="date"`.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [DatepickerComponent, FormsModule] },
    template: `
      <div style="max-width: 400px;">
        <lc-datepicker granularity="month" format="YYYY-MM" placeholder="Select a month" ariaLabel="Valid from" [ngModel]="'2026-07'"></lc-datepicker>
      </div>`,
  }),
  play: openByClick,
};

/** 3.29 (request 046, regeln row 1): month granularity in German, with a range. */
export const MonthDe: Story = {
  name: 'Month DE',
  parameters: {
    docs: {
      description: {
        story:
          '3.29 (request 046): `locale="de-DE"` names the months („Juli“, read „Juli 2026“), and the story sets every built-in string in German: `previousYearAriaLabel` „Vorheriges Jahr“, `nextYearAriaLabel` „Nächstes Jahr“, `monthDialogAriaLabel` „Monat wählen“, `currentMonthLabel` „Dieser Monat“, `clearAriaLabel` and `placeholder`. `minDate` 1 March 2026 and `maxDate` 28 February 2027 keep a month selectable when any of its days is in range: January and February 2026 are disabled (`aria-disabled`, skipped by the keys), and so is every month after February 2027 behind the next-year button.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [DatepickerComponent, FormsModule] },
    props: { monthMin: new Date(2026, 2, 1), monthMax: new Date(2027, 1, 28) },
    template: `
      <div lang="de" style="max-width: 400px;">
        <lc-datepicker
          granularity="month"
          format="YYYY-MM"
          locale="de-DE"
          placeholder="Monat wählen"
          ariaLabel="Gilt ab"
          clearAriaLabel="Monat löschen"
          previousYearAriaLabel="Vorheriges Jahr"
          nextYearAriaLabel="Nächstes Jahr"
          monthDialogAriaLabel="Monat wählen"
          currentMonthLabel="Dieser Monat"
          [minDate]="monthMin"
          [maxDate]="monthMax"
          [ngModel]="'2026-07'"
        ></lc-datepicker>
      </div>`,
  }),
  play: openByClick,
};

/** 3.30 (request 047, regeln row 7): a visible label. */
export const WithLabel: Story = {
  name: 'With Label',
  parameters: {
    docs: {
      description: {
        story:
          '3.30 (request 047, finance-intelligence rules page, row 7): `label="Start date"` renders a visible `<label for>` above the field, styled like the labels of lc-combobox and lc-number-input (14 px, medium, `--color-text-primary`: 17.74:1 light, 17.29:1 dark; 6 px above the field). It names the field in day and month mode, so `ariaLabel` is not used while it is set. A click on it focuses the field and opens the calendar. With the default `\'\'` there is no label element and the field renders as before.',
      },
    },
  },
  args: {
    variant: 'outline',
    size: 'md',
    label: 'Start date',
    placeholder: 'Select a date',
    helperText: 'The first day of the booking',
  },
};

/** 3.30 (request 047, regeln row 7): German labels, month and day mode, a long compound in a narrow column. */
export const LabelDe: Story = {
  name: 'Label (DE)',
  parameters: {
    docs: {
      description: {
        story:
          '3.30 (request 047, finance-intelligence rules page, row 7): the field „Gilt ab“ (`granularity="month"`) and „Buchungsdatum“ (day mode) with visible German labels; at 360 px „Gilt ab“ is one 21 px line over a 328 px field. In the two-column row of `size="sm"` fields (158 px each at 360 px), „Leistungsverrechnungsschlüssel ab“ breaks with a hyphen over two lines (42 px) instead of overflowing. The clear buttons are named „Monat löschen“ and „Datum löschen“. The open panel of „Buchungsdatum“ has German texts only (3.30.1): „Heute“, the dialog „Datum wählen“, „Vorheriger Monat“ and „Nächster Monat“, and the selected day is named „Mittwoch, 4. November 2026, ausgewählt“.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [DatepickerComponent, FormsModule] },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
        <lc-datepicker
          label="Gilt ab"
          granularity="month"
          format="YYYY-MM"
          locale="de-DE"
          placeholder="Monat wählen"
          clearAriaLabel="Monat löschen"
          [ngModel]="'2026-07'"
        ></lc-datepicker>
        <lc-datepicker
          label="Buchungsdatum"
          locale="de-DE"
          placeholder="Datum wählen"
          clearAriaLabel="Datum löschen"
          todayLabel="Heute"
          selectedAriaLabel="ausgewählt"
          dialogAriaLabel="Datum wählen"
          previousMonthAriaLabel="Vorheriger Monat"
          nextMonthAriaLabel="Nächster Monat"
          helperText="Nur Werktage"
          [ngModel]="'2026-11-04'"
        ></lc-datepicker>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <lc-datepicker size="sm" label="Leistungsverrechnungsschlüssel ab" locale="de-DE" placeholder="Datum wählen" clearAriaLabel="Datum löschen"></lc-datepicker>
          <lc-datepicker size="sm" label="Leistungsverrechnungsschlüssel bis" locale="de-DE" placeholder="Datum wählen" clearAriaLabel="Datum löschen"></lc-datepicker>
        </div>
      </div>`,
  }),
};

/** 3.30 (request 047, 046-f1): the clear button's hit area in every size, day and month mode. */
export const ClearTargets: Story = {
  name: 'Clear Targets',
  parameters: {
    docs: {
      description: {
        story:
          '3.30 (request 047, follow-up 046-f1, WCAG 2.5.8): the clear button is a 24 × 24 px box in every size (it was 20 × 20); the glyph (16 px), the 20 px hover fill and the focus ring stay where they were, and the field heights stay 24/32/40/44 px. In md and lg a transparent hit area makes it 44 × 44 px: it reaches 18 px towards the text and ends at the calendar icon (at md 2 px past the 40 px frame). After a clear, focus returns to the field. Day fields xs to lg, month fields md and lg.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [DatepickerComponent, FormsModule] },
    props: { sizes: ['xs', 'sm', 'md', 'lg'] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 300px;">
        @for (size of sizes; track size) {
          <lc-datepicker [size]="size" [label]="'Day ' + size" [ngModel]="'2026-07-15'"></lc-datepicker>
        }
        <lc-datepicker size="md" label="Month md" granularity="month" format="YYYY-MM" placeholder="Select a month" [ngModel]="'2026-07'"></lc-datepicker>
        <lc-datepicker size="lg" label="Month lg" granularity="month" format="YYYY-MM" placeholder="Select a month" [ngModel]="'2026-07'"></lc-datepicker>
      </div>`,
  }),
};

/** 3.30 (request 047, 046-f2, 046-n3): the open day panel: selected-day ring, 44 px targets below 1024 px. */
export const DayPanel: Story = {
  name: 'Day Panel',
  parameters: {
    docs: {
      description: {
        story:
          '3.30 (request 047): the selected day has the inset 2 px `--color-primary-500` ring of the month cells (follow-up 046-f2): 4.37:1 on the light panel, 9.13:1 on the dark one, where the fill alone is 2.78:1; its text stays 6.21:1 on the fill. Below 1024 px (follow-up 046-n3) every target is 44 px: the month buttons 44 × 44, "Today" 44 high and the days 44 × 44 without gaps, so the panel is 342 × 448 px at 360 px and is pushed into the viewport, 8 px from its left edge here (at 320 px the days are 38.56 px). From 1024 px the panel keeps its 310 × 395 px. The wrapper puts the field at x 24, as in lc-app-page. Without `locale`, each day is named with its long English date ("Wednesday, July 15, 2026, selected"), so the visible number is part of the name (WCAG 2.5.3, 3.30.1).',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [DatepickerComponent, FormsModule] },
    template: `
      <div style="max-width: 400px; padding-inline: 8px;">
        <lc-datepicker ariaLabel="Booking date" [ngModel]="'2026-07-15'"></lc-datepicker>
      </div>`,
  }),
  play: openByClick,
};

export const BookingForm: Story = {
  name: 'Booking Form (Composition)',
  render: () => ({
    template: `
      <div style="max-width: 380px;">
        <h4 style="margin: 0 0 16px; font-weight: 600;">Book a Meeting</h4>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <lc-datepicker
            placeholder="Select date"
            helperText="Available Monday through Friday"
            [disableWeekends]="true"
            [required]="true"
          ></lc-datepicker>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <lc-datepicker
              placeholder="Start time"
              size="sm"
            ></lc-datepicker>
            <lc-datepicker
              placeholder="End time"
              size="sm"
            ></lc-datepicker>
          </div>
        </div>
      </div>`,
  }),
};
