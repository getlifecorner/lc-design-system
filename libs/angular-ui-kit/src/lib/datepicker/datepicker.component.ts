import {
  Component,
  input,
  output,
  signal,
  computed,
  linkedSignal,
  ChangeDetectionStrategy,
  forwardRef,
  ElementRef,
  viewChild,
  inject,
  DOCUMENT,
  Injector,
  afterNextRender,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { openPanelLang } from '@lifecorner/angular-ui-kit/internal/a11y';

export type DateValue = Date | string | null;

/** What `lc-datepicker` picks: a day (`'day'`) or a month (`'month'`). */
export type DatepickerGranularity = 'day' | 'month';

/** One cell of the month grid (`granularity="month"`). */
interface MonthCell {
  /** 0–11. */
  month: number;
  /** Visible name („Juli“). */
  name: string;
  /** Accessible name with the year („Juli 2026“). */
  label: string;
  selected: boolean;
  current: boolean;
  disabled: boolean;
}

/**
 * Datepicker component for date selection with calendar overlay.
 *
 * Features:
 * - Calendar popup with month and year navigation
 * - Month granularity (3.29): `granularity="month"` picks a month in a
 *   12-month grid with year navigation and emits its first day
 * - Manual date entry in the configured format
 * - Min/max date constraints
 * - Disabled specific dates and weekends
 * - Configurable date format string
 * - Variant styles (outline, filled)
 * - Size presets (xs, sm, md, lg)
 * - Disabled and readonly states
 * - ControlValueAccessor integration for reactive forms
 *
 * @example
 * ```html
 * <lc-datepicker placeholder="Select date" [(ngModel)]="selectedDate" />
 * <lc-datepicker granularity="month" format="YYYY-MM" placeholder="Select a month" [(ngModel)]="validFrom" />
 * ```
 */
@Component({
  selector: 'lc-datepicker',
  standalone: true,
  imports: [OverlayModule],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true,
    },
  ],
})
export class DatepickerComponent implements ControlValueAccessor {
  private static nextId = 0;

  /** Per-instance id for the input; helper/error text ids derive from it. */
  readonly inputId = `lc-datepicker-${++DatepickerComponent.nextId}`;

  private readonly datepickerInput = viewChild<ElementRef<HTMLInputElement>>('datepickerInput');
  private readonly calendarPanel = viewChild<ElementRef<HTMLElement>>('calendarPanel');

  /**
   * Visual variant of the datepicker
   */
  readonly variant = input<'outline' | 'filled'>('outline');

  /**
   * Size of the datepicker
   */
  readonly size = input<'xs' | 'sm' | 'md' | 'lg'>('md');

  /**
   * Whether the datepicker is disabled
   */
  readonly disabled = input<boolean>(false);

  /**
   * Whether the datepicker is in error state
   */
  readonly error = input<boolean>(false);

  /**
   * Whether the datepicker is required
   */
  readonly required = input<boolean>(false);

  /**
   * Whether the datepicker is readonly
   */
  readonly readonly = input<boolean>(false);

  /**
   * Placeholder text
   */
  readonly placeholder = input<string>('Select a date');

  /**
   * Helper text displayed below the datepicker
   */
  readonly helperText = input<string>('');

  /**
   * Error message displayed when error is true
   */
  readonly errorMessage = input<string>('');

  /**
   * ARIA label for accessibility. Ignored while `label` is set.
   * @default undefined
   */
  readonly ariaLabel = input<string | undefined>(undefined);

  /**
   * Visible label above the field (3.30, regeln row 7): a `<label for>` in
   * day and month mode that names the field, so `ariaLabel` is not used
   * while it is set. Empty: no label element, as before.
   * @default ''
   */
  readonly label = input<string>('');

  /**
   * Date format string (e.g., 'YYYY-MM-DD', 'MM/DD/YYYY')
   */
  readonly format = input<string>('YYYY-MM-DD');

  /**
   * Minimum selectable date (compared by calendar day, time of day is ignored)
   */
  readonly minDate = input<Date | undefined>(undefined);

  /**
   * Maximum selectable date (compared by calendar day, time of day is ignored)
   */
  readonly maxDate = input<Date | undefined>(undefined);

  /**
   * Array of disabled dates
   */
  readonly disabledDates = input<Date[]>([]);

  /**
   * Whether to disable weekends
   */
  readonly disableWeekends = input<boolean>(false);

  /**
   * BCP 47 locale for month and weekday names and the day buttons' accessible
   * names (e.g. `'de-DE'`). Empty keeps the built-in English names; the days
   * are then named in `en-US` ("Wednesday, July 1, 2026"). Also the open
   * panel's `lang` when the host has no `[lang]` ancestor (3.30.2).
   * @default ''
   */
  readonly locale = input('');

  /** First column of the grid: 0 Sunday (default) … 6 Saturday — 1 for Monday. */
  readonly firstDayOfWeek = input(0);

  /** Accessible name of the clear button. */
  readonly clearAriaLabel = input('Clear date');

  /** Accessible name of the calendar dialog. */
  readonly dialogAriaLabel = input('Choose date');

  /** Accessible name of the previous-month button. */
  readonly previousMonthAriaLabel = input('Previous month');

  /** Accessible name of the next-month button. */
  readonly nextMonthAriaLabel = input('Next month');

  /** Label of the "go to today" button. */
  readonly todayLabel = input('Today');

  /** Appended to the selected day's accessible name (`…, selected`). */
  readonly selectedAriaLabel = input('selected');

  /**
   * Pick a day (`'day'`) or a month (`'month'`, 3.29, regeln row 1). Month:
   * a 12-month grid with year navigation; `dateChange` and the forms value
   * are the 1st of the month (local midnight, as day mode); `format` should
   * be a month format (`'YYYY-MM'`; a `DD` token shows `01`), and typing
   * „2026-07“ commits like a day. `minDate`/`maxDate` keep a month
   * selectable when any of its days is in range; a `disabledDates` entry
   * disables its whole month; `disableWeekends` is ignored. Set
   * `placeholder` (e.g. "Select a month"). Keys in the grid: arrows move by
   * month and row, PageUp/PageDown by year, Home/End to the first/last month
   * of the year, Enter/Space select, Escape closes.
   * @default 'day'
   */
  readonly granularity = input<DatepickerGranularity>('day');

  /**
   * Accessible name of the previous-year button (month mode).
   * @default 'Previous year'
   */
  readonly previousYearAriaLabel = input('Previous year');

  /**
   * Accessible name of the next-year button (month mode).
   * @default 'Next year'
   */
  readonly nextYearAriaLabel = input('Next year');

  /**
   * Accessible name of the month dialog (month mode; `dialogAriaLabel`
   * stays the day dialog's).
   * @default 'Choose month'
   */
  readonly monthDialogAriaLabel = input('Choose month');

  /**
   * Label of the quick action that shows the current year (month mode; day
   * mode keeps `todayLabel`).
   * @default 'This month'
   */
  readonly currentMonthLabel = input('This month');

  /**
   * Emitted when date selection changes
   */
  readonly dateChange = output<Date | null>();

  /**
   * Emitted when calendar opens
   */
  readonly opened = output<void>();

  /**
   * Emitted when calendar closes
   */
  readonly closed = output<void>();

  // Internal state
  readonly selectedDate = signal<Date | null>(null);
  readonly isOpen = signal<boolean>(false);
  readonly currentMonth = signal<number>(new Date().getMonth());
  readonly currentYear = signal<number>(new Date().getFullYear());

  /** Disabled state pushed in by the forms API (setDisabledState). */
  private readonly formDisabled = signal<boolean>(false);

  /** Effective disabled state: the `disabled` input OR the form control's disabled state. */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /** Month granularity (3.29). */
  protected readonly isMonthMode = computed(() => this.granularity() === 'month');

  /** The host's closest `[lang]` while the panel is open, kept live (3.33, 049-n3). */
  private readonly hostLang = openPanelLang(this.isOpen);

  /**
   * `lang` of the open panel (3.30.2, WCAG 3.1.2): the overlay renders under
   * `<body>`, so it takes the host's closest `[lang]`, else `locale`, else none.
   * Read at every opening and, since 3.33, again when a `lang` changes while
   * the panel is open; `null` while closed, so the server never reads the DOM.
   */
  protected readonly panelLang = computed(() => (this.isOpen() ? (this.hostLang() ?? (this.locale() || null)) : null));

  // Computed values
  readonly formattedDate = computed(() => {
    const date = this.selectedDate();
    if (!date) return '';
    // Month mode shows the month: a `DD` token is the 1st.
    const shown = this.isMonthMode() ? new Date(date.getFullYear(), date.getMonth(), 1) : date;
    return this.formatDate(shown, this.format());
  });

  /**
   * Text currently shown in the input. Follows the selected date, but the user
   * can type freely; only a complete, valid date is committed to the model.
   */
  readonly inputValue = linkedSignal(() => this.formattedDate());

  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  /** Month name in the header: `locale` when set, the English names otherwise. */
  readonly currentMonthName = computed(() => {
    const locale = this.locale();
    return locale
      ? new Date(this.currentYear(), this.currentMonth(), 1).toLocaleDateString(locale, { month: 'long' })
      : this.monthNames[this.currentMonth()];
  });

  /** Weekday headers in grid order, starting at `firstDayOfWeek`. */
  readonly weekdayLabels = computed(() => {
    const locale = this.locale();
    const first = this.gridStart();
    // 1 Jan 2023 was a Sunday, so day d of that week has getDay() === d.
    const names = locale
      ? Array.from({ length: 7 }, (_, d) =>
          new Date(2023, 0, 1 + d).toLocaleDateString(locale, { weekday: 'short' }).replace(/\.$/, ''),
        )
      : this.weekDays;
    return Array.from({ length: 7 }, (_, i) => names[(first + i) % 7]);
  });

  /** Header title: „July 2026“ (day mode) or the year „2026“ (month mode). */
  protected readonly headerTitle = computed(() =>
    this.isMonthMode() ? String(this.currentYear()) : `${this.currentMonthName()} ${this.currentYear()}`,
  );

  /** The twelve months of the shown year (month mode). */
  protected readonly monthCells = computed<MonthCell[]>(() => {
    const year = this.currentYear();
    const locale = this.locale();
    const selected = this.selectedDate();
    const today = new Date();
    return Array.from({ length: 12 }, (_, month) => {
      const first = new Date(year, month, 1);
      return {
        month,
        name: locale ? first.toLocaleDateString(locale, { month: 'long' }) : this.monthNames[month],
        label: first.toLocaleDateString(locale || 'en-US', { month: 'long', year: 'numeric' }),
        selected: !!selected && selected.getFullYear() === year && selected.getMonth() === month,
        current: today.getFullYear() === year && today.getMonth() === month,
        disabled: this.isMonthDisabled(year, month),
      };
    });
  });

  /** The month grid's four rows of three. */
  protected readonly monthRows = computed(() => [0, 3, 6, 9].map((i) => this.monthCells().slice(i, i + 3)));

  /**
   * The month cell that is the grid's one tab stop (roving `tabindex`): the
   * selected month in the shown year, else the current month, else the first
   * enabled one; `-1` when the whole year is disabled. Keys move it.
   */
  protected readonly monthTabStop = linkedSignal(() => this.defaultMonthTabStop());

  /** `firstDayOfWeek` clamped to 0–6. */
  private readonly gridStart = computed(() => {
    const day = Math.trunc(Number(this.firstDayOfWeek()));
    return Number.isFinite(day) ? ((day % 7) + 7) % 7 : 0;
  });

  /** id of the helper/error text the input is described by (aria-describedby) */
  readonly describedBy = computed(() => {
    if (this.error() && this.errorMessage()) {
      return `${this.inputId}-error`;
    }
    return this.helperText() ? `${this.inputId}-helper` : null;
  });

  /**
   * Computed classes for the datepicker input element
   */
  readonly datepickerClasses = computed(() => {
    const classes = [
      'lc-datepicker',
      `lc-datepicker--${this.variant()}`,
      `lc-datepicker--${this.size()}`,
    ];

    if (this.isDisabled()) {
      classes.push('lc-datepicker--disabled');
    }

    if (this.error()) {
      classes.push('lc-datepicker--error');
    }

    if (this.readonly()) {
      classes.push('lc-datepicker--readonly');
    }

    if (this.isOpen()) {
      classes.push('lc-datepicker--open');
    }

    return classes.join(' ');
  });

  // Private properties
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: Date | null) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  // Public methods
  /**
   * Toggle calendar open/closed
   */
  toggle(): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open calendar
   */
  open(): void {
    if (this.isDisabled() || this.readonly() || this.isOpen()) {
      return;
    }
    this.isOpen.set(true);

    // Set calendar to selected date's month/year or current
    const date = this.selectedDate();
    if (date) {
      this.showMonthOf(date);
    }
    // Month mode: the grid's tab stop starts on the selected (or current) month again.
    if (this.isMonthMode()) {
      this.monthTabStop.set(this.defaultMonthTabStop());
    }

    this.opened.emit();
  }

  /**
   * Close calendar. Idempotent: the overlay's `detach` re-enters here after
   * `isOpen` flips, and that second call must not emit `closed` again.
   */
  close(): void {
    if (!this.isOpen()) {
      return;
    }
    // A day button inside the panel may hold focus; it is about to be removed,
    // so hand focus back to the input instead of letting it drop to <body>.
    this.restoreFocusFromPanel();
    this.isOpen.set(false);
    this.closed.emit();
  }

  /**
   * Select a date
   */
  selectDate(date: Date): void {
    if (this.isDisabled() || this.readonly() || this.isDateDisabled(date)) {
      return;
    }

    this.commitDate(date);
    this.close();
  }

  /**
   * Clear selected date
   */
  clear(): void {
    this.selectedDate.set(null);
    this.inputValue.set('');
    this.onChange(null);
    this.dateChange.emit(null);
  }

  /**
   * The clear button (3.30, request 047): clears and moves focus to the
   * field, since the button leaves the DOM (focus dropped to `<body>`).
   */
  protected onClearClick(event: Event): void {
    event.stopPropagation();
    this.clear();
    this.datepickerInput()?.nativeElement.focus();
  }

  /**
   * Check if a date is disabled
   */
  isDateDisabled(date: Date): boolean {
    // min/max are compared by calendar day: consumers typically pass `new Date()`
    // (which carries the current time) while calendar cells sit at midnight.
    const day = this.startOfDay(date);

    const min = this.minDate();
    if (min && day < this.startOfDay(min)) {
      return true;
    }

    const max = this.maxDate();
    if (max && day > this.startOfDay(max)) {
      return true;
    }

    // Check disabled dates
    if (this.disabledDates().some((d) => this.isSameDate(d, date))) {
      return true;
    }

    // Check weekends
    if (this.disableWeekends()) {
      const weekday = date.getDay();
      if (weekday === 0 || weekday === 6) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if date is today
   */
  isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDate(date, today);
  }

  /**
   * Accessible name of a day button: the long `Intl` date in `locale`, else
   * `en-US` (3.30.1, 047-f2: contains the visible day number, WCAG 2.5.3),
   * plus `selectedAriaLabel` when selected.
   */
  protected dayAriaLabel(date: Date): string {
    const name = date.toLocaleDateString(this.locale() || 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return this.isSelectedDate(date) ? `${name}, ${this.selectedAriaLabel()}` : name;
  }

  /**
   * Check if date is selected
   */
  isSelectedDate(date: Date): boolean {
    const selected = this.selectedDate();
    return selected ? this.isSameDate(date, selected) : false;
  }

  /**
   * Generate calendar days for current month
   */
  generateCalendarDays(): Date[] {
    const year = this.currentYear();
    const month = this.currentMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: Date[] = [];

    // Add previous month's days, so the first column is `firstDayOfWeek`.
    const leadingDays = (firstDay.getDay() - this.gridStart() + 7) % 7;
    for (let i = leadingDays - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push(date);
    }

    // Add current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days.slice(0, 42); // Ensure exactly 42 days (6 weeks)
  }

  /**
   * Navigate to next month
   */
  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.set(this.currentYear() + 1);
    } else {
      this.currentMonth.set(this.currentMonth() + 1);
    }
  }

  /**
   * Navigate to previous month
   */
  previousMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.set(this.currentYear() - 1);
    } else {
      this.currentMonth.set(this.currentMonth() - 1);
    }
  }

  /**
   * Navigate to today
   */
  goToToday(): void {
    this.showMonthOf(new Date());
  }

  /** Month mode: show the previous year. */
  protected previousYear(): void {
    this.currentYear.update((year) => year - 1);
  }

  /** Month mode: show the next year. */
  protected nextYear(): void {
    this.currentYear.update((year) => year + 1);
  }

  /** Month mode's quick action: show the current year. */
  protected showCurrentYear(): void {
    this.currentYear.set(new Date().getFullYear());
  }

  /** Month mode: select `month` of the shown year (its 1st), emit, close and focus the field. */
  protected selectMonth(month: number): void {
    const year = this.currentYear();
    if (this.isDisabled() || this.readonly() || this.isMonthDisabled(year, month)) {
      return;
    }
    this.commitDate(new Date(year, month, 1));
    this.close();
  }

  /**
   * Keys on a month cell (APG date grid): arrows ±1 month and ±3 (a row),
   * PageUp/PageDown ±1 year (the nearest enabled month of that year),
   * Home/End the first/last enabled month of the year; disabled months are
   * skipped, and with none left focus stays. Enter/Space select, Escape
   * closes. Arrows only move focus.
   */
  protected onMonthKeydown(event: KeyboardEvent, month: number): void {
    const year = this.currentYear();
    const at = year * 12 + month;
    let target: number | null;
    switch (event.key) {
      case 'ArrowLeft':
        target = this.nextEnabledMonth(at, -1);
        break;
      case 'ArrowRight':
        target = this.nextEnabledMonth(at, 1);
        break;
      case 'ArrowUp':
        target = this.nextEnabledMonth(at, -3);
        break;
      case 'ArrowDown':
        target = this.nextEnabledMonth(at, 3);
        break;
      case 'PageUp':
        target = this.nearestEnabledMonth(year - 1, month);
        break;
      case 'PageDown':
        target = this.nearestEnabledMonth(year + 1, month);
        break;
      case 'Home':
        target = this.edgeEnabledMonth(year, 1);
        break;
      case 'End':
        target = this.edgeEnabledMonth(year, -1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectMonth(month);
        return;
      case 'Escape':
        event.preventDefault();
        // Only this datepicker should react; keep the key from reaching enclosing overlays.
        event.stopPropagation();
        this.close();
        return;
      default:
        return;
    }
    event.preventDefault();
    if (target !== null) {
      this.moveMonthFocus(target);
    }
  }

  /**
   * Handle input change (manual date entry). Partial input is kept as text
   * only; the model changes once the text is a complete, valid, selectable date.
   */
  onInputChange(value: string): void {
    this.inputValue.set(value);

    if (value.trim() === '') {
      if (this.selectedDate() !== null) {
        this.clear();
      }
      return;
    }

    const date = this.parseDate(value, this.format());
    if (date && !this.isUnavailable(date) && !this.isSameSelection(date)) {
      this.commitDate(date);
      this.showMonthOf(date);
    }
  }

  /**
   * Handle keyboard navigation
   */
  onKeyDown(event: KeyboardEvent): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }

    if (
      !this.isOpen() &&
      (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')
    ) {
      this.open();
      event.preventDefault();
      // Month mode: the keys work in the grid, so focus moves there once it is rendered.
      if (this.isMonthMode()) {
        afterNextRender(() => this.focusMonthCell(this.monthTabStop()), { injector: this.injector });
      }
      return;
    }

    if (!this.isOpen()) return;

    if (this.isMonthMode()) {
      this.onMonthFieldKeyDown(event);
      return;
    }

    // While the text differs from the model the user is mid-edit: arrows must
    // move the caret, not the calendar selection.
    const editing = this.inputValue() !== this.formattedDate();
    const currentDate = this.selectedDate() || new Date();
    let newDate: Date | null = null;

    switch (event.key) {
      case 'Escape':
        this.close();
        event.preventDefault();
        // Only this datepicker should react; keep the key from reaching enclosing overlays.
        event.stopPropagation();
        break;

      case 'ArrowRight':
        if (editing) break;
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        event.preventDefault();
        break;

      case 'ArrowLeft':
        if (editing) break;
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        event.preventDefault();
        break;

      case 'ArrowDown':
        if (editing) break;
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        event.preventDefault();
        break;

      case 'ArrowUp':
        if (editing) break;
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        event.preventDefault();
        break;

      case 'Enter': {
        const selected = this.selectedDate();
        if (selected) {
          this.selectDate(selected);
        }
        event.preventDefault();
        break;
      }
    }

    if (newDate && !this.isDateDisabled(newDate)) {
      this.selectedDate.set(newDate);
      this.showMonthOf(newDate);
    }
  }

  /**
   * Handle blur event: mark touched and drop any partial text that never became a date.
   */
  onBlur(): void {
    this.onTouched();
    this.inputValue.set(this.formattedDate());
  }

  /**
   * Handle click outside
   */
  onClickOutside(): void {
    this.close();
  }

  // ControlValueAccessor implementation
  writeValue(value: DateValue): void {
    let date: Date | null = null;
    if (value instanceof Date) {
      date = isNaN(value.getTime()) ? null : value;
    } else if (typeof value === 'string') {
      date = this.parseDate(value, this.format());
    }
    this.selectedDate.set(date);
    this.inputValue.set(this.formattedDate());
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /**
   * Check if date is in current month
   */
  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth() && date.getFullYear() === this.currentYear();
  }

  // Private helper methods

  /** The selected month of the shown year, else the current month, else the first enabled one; `-1` if none. */
  private defaultMonthTabStop(): number {
    const cells = this.monthCells().filter((c) => !c.disabled);
    return (cells.find((c) => c.selected) ?? cells.find((c) => c.current) ?? cells[0])?.month ?? -1;
  }

  /**
   * Keys in the field while the month panel is open: ArrowDown moves focus
   * into the grid, Escape closes, Enter closes when a month is selected and
   * shows its text again over half-typed text (3.30, 046-n4, as day mode);
   * the other keys stay with the text (caret, typing „2026-07“).
   */
  private onMonthFieldKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusMonthCell(this.monthTabStop());
        break;
      case 'Escape':
        this.close();
        event.preventDefault();
        // Only this datepicker should react; keep the key from reaching enclosing overlays.
        event.stopPropagation();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedDate()) {
          this.inputValue.set(this.formattedDate());
          this.close();
        }
        break;
    }
  }

  /**
   * Month mode: a month is disabled when all its days are before `minDate`
   * or after `maxDate` (compared by day), or when `disabledDates` holds one
   * of its days. `disableWeekends` does not apply.
   */
  private isMonthDisabled(year: number, month: number): boolean {
    const min = this.minDate();
    if (min && new Date(year, month + 1, 0).getTime() < this.startOfDay(min)) {
      return true;
    }
    const max = this.maxDate();
    if (max && new Date(year, month, 1).getTime() > this.startOfDay(max)) {
      return true;
    }
    return this.disabledDates().some((d) => d.getFullYear() === year && d.getMonth() === month);
  }

  /** A typed date that cannot be committed: its day (day mode) or its month (month mode) is disabled. */
  private isUnavailable(date: Date): boolean {
    return this.isMonthMode() ? this.isMonthDisabled(date.getFullYear(), date.getMonth()) : this.isDateDisabled(date);
  }

  /** Whether `date` is the current selection: the same day, or in month mode the same month. */
  private isSameSelection(date: Date): boolean {
    if (!this.isMonthMode()) return this.isSelectedDate(date);
    const selected = this.selectedDate();
    return !!selected && selected.getFullYear() === date.getFullYear() && selected.getMonth() === date.getMonth();
  }

  /** Year and month (0–11) of a month index `year * 12 + month`. */
  private monthAt(index: number): { year: number; month: number } {
    return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 };
  }

  /** The next enabled month from `index` in steps of `step` (up to ten years), or `null`. */
  private nextEnabledMonth(index: number, step: number): number | null {
    for (let i = 1; i * Math.abs(step) <= 120; i++) {
      const { year, month } = this.monthAt(index + step * i);
      if (!this.isMonthDisabled(year, month)) return index + step * i;
    }
    return null;
  }

  /** `month` of `year` if enabled, else the enabled month of that year nearest to it, or `null`. */
  private nearestEnabledMonth(year: number, month: number): number | null {
    for (let d = 0; d < 12; d++) {
      for (const m of d === 0 ? [month] : [month - d, month + d]) {
        if (m >= 0 && m < 12 && !this.isMonthDisabled(year, m)) return year * 12 + m;
      }
    }
    return null;
  }

  /** The first (`dir` 1) or last (`dir` -1) enabled month of `year`, or `null`. */
  private edgeEnabledMonth(year: number, dir: 1 | -1): number | null {
    for (let i = 0; i < 12; i++) {
      const month = dir === 1 ? i : 11 - i;
      if (!this.isMonthDisabled(year, month)) return year * 12 + month;
    }
    return null;
  }

  /** Moves the grid's tab stop and focus to the month `index`; the shown year follows. */
  private moveMonthFocus(index: number): void {
    const { year, month } = this.monthAt(index);
    if (year !== this.currentYear()) {
      this.currentYear.set(year);
    }
    this.monthTabStop.set(month);
    this.focusMonthCell(month);
  }

  /** Focuses the month cell `month` (0–11) of the open panel; the cells are kept across years. */
  private focusMonthCell(month: number): void {
    if (month < 0) return;
    this.calendarPanel()
      ?.nativeElement.querySelectorAll<HTMLElement>('.lc-datepicker-month')
      [month]?.focus();
  }

  private commitDate(date: Date): void {
    this.selectedDate.set(date);
    this.inputValue.set(this.formatDate(date, this.format()));
    this.onChange(date);
    this.dateChange.emit(date);
  }

  private showMonthOf(date: Date): void {
    this.currentMonth.set(date.getMonth());
    this.currentYear.set(date.getFullYear());
  }

  private restoreFocusFromPanel(): void {
    const panel = this.calendarPanel()?.nativeElement;
    const active = this.document.activeElement;
    if (panel && active && panel.contains(active)) {
      this.datepickerInput()?.nativeElement.focus();
    }
  }

  private startOfDay(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  private formatDate(date: Date, format: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return format.replace('YYYY', String(year)).replace('MM', month).replace('DD', day);
  }

  /**
   * Strict parse: the text must match the format's length, carry digits at the
   * YYYY/MM/DD positions and round-trip through formatDate (which rejects
   * things like month 13 or Feb 31 that `new Date` would silently roll over).
   * Returns null for partial or invalid input. Month mode also takes a format
   * without `DD` (`YYYY-MM`) and returns the 1st of the month.
   */
  private parseDate(value: string, format: string): Date | null {
    if (value.length !== format.length) {
      return null;
    }

    const monthMode = this.isMonthMode();
    const yearIndex = format.indexOf('YYYY');
    const monthIndex = format.indexOf('MM');
    const dayIndex = format.indexOf('DD');
    if (yearIndex < 0 || monthIndex < 0 || (dayIndex < 0 && !monthMode)) {
      return null;
    }

    const yearText = value.substring(yearIndex, yearIndex + 4);
    const monthText = value.substring(monthIndex, monthIndex + 2);
    const dayText = dayIndex < 0 ? '01' : value.substring(dayIndex, dayIndex + 2);
    if (!/^\d{4}$/.test(yearText) || !/^\d{2}$/.test(monthText) || !/^\d{2}$/.test(dayText)) {
      return null;
    }

    const date = new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
    if (this.formatDate(date, format) !== value) {
      return null;
    }
    return monthMode ? new Date(date.getFullYear(), date.getMonth(), 1) : date;
  }

  protected getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
