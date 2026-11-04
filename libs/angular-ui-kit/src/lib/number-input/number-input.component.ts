import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  computed,
  signal,
  forwardRef,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent, ɵprovideKitIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_PLUS } from '@lifecorner/angular-ui-kit/icons';

/** Number of decimals a number is written with (`0.001` → 3, `1e-7` → 7, `5` → 0). */
function decimalsOf(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const [mantissa, exponent] = String(n).split('e');
  const decimals = (mantissa.split('.')[1]?.length ?? 0) - (exponent ? Number(exponent) : 0);
  return Math.max(0, decimals);
}

/**
 * Reduces raw text to digits, one leading minus and one decimal separator.
 * A comma and a point are both taken as the decimal separator, so a German
 * keyboard layout does not silently lose the fraction; the separator is
 * written as `separator` (the locale's, a point by default).
 */
function sanitizeNumericText(raw: string, separator: '.' | ','): string {
  let out = '';
  let seenPoint = false;
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') {
      out += ch;
    } else if (ch === '-' && out.length === 0) {
      out += ch;
    } else if ((ch === '.' || ch === ',') && !seenPoint) {
      seenPoint = true;
      out += separator;
    }
  }
  return out;
}

/** The decimal separator of `locale`: `,` or `.`; any other separator, `''` and an invalid locale give `.`. */
function decimalSeparatorOf(locale: string): '.' | ',' {
  if (!locale) return '.';
  try {
    const part = new Intl.NumberFormat(locale).formatToParts(1.5).find((p) => p.type === 'decimal')?.value;
    return part === ',' ? ',' : '.';
  } catch {
    return '.';
  }
}

/** Height of `lc-number-input`'s field and steppers: `xs` 24, `sm` 32, `md` 40 (the default), `lg` 44 px. */
export type NumberInputSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'lc-number-input',
  standalone: true,
  imports: [IconComponent],
  viewProviders: [ɵprovideKitIcons([ICON_PLUS])],
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
      multi: true,
    },
  ],
})
/**
 * Number input component with increment/decrement controls.
 *
 * Features:
 * - Increment and decrement buttons (also ArrowUp / ArrowDown)
 * - Configurable min, max, and step values
 * - Value clamping within bounds; stepping is rounded to the step's precision
 * - Non-numeric characters are rejected as they are typed; a comma and a
 *   point are both accepted as the decimal separator, in every locale
 * - The value is shown in `locale` („7,5“ in `de-DE`), with an optional unit
 *   after it (`suffix`, „7,5 %“), read once (`suffixAriaLabel`)
 * - Sizes `xs`, `sm`, `md` (default), `lg` (44 px touch targets)
 * - Disabled state support
 * - ControlValueAccessor integration for reactive forms; the model is
 *   always a `number`, clamped to `min`/`max` on blur
 *
 * @example
 * ```html
 * <lc-number-input label="Quantity" [min]="0" [max]="100" [step]="1" />
 * <lc-number-input label="Anteil" locale="de-DE" suffix="%" suffixAriaLabel="Prozent"
 *                  size="lg" [step]="0.5" [(ngModel)]="share" />
 * ```
 */
export class NumberInputComponent implements ControlValueAccessor {
  private static nextId = 0;

  /** Minimum value */
  min = input<number | undefined>(undefined);

  /** Maximum value */
  max = input<number | undefined>(undefined);

  /** Step increment */
  step = input<number>(1);

  /** Label text */
  label = input<string>();

  /** Accessible name for the field when no visible `label` is rendered. */
  ariaLabel = input<string>();

  /** Placeholder */
  placeholder = input<string>('0');

  /** Helper text shown below the control (linked via `aria-describedby`). */
  helperText = input<string>();

  /** Error message shown below the control; marks the field `aria-invalid`. */
  error = input<string>();

  /** Disabled state */
  disabled = input<boolean>(false);

  /** Accessible name of the minus button. */
  decrementAriaLabel = input('Decrease value');

  /** Accessible name of the plus button. */
  incrementAriaLabel = input('Increase value');

  /**
   * BCP 47 locale of the shown number (3.29, regeln row 3). Only the decimal
   * separator follows it: `de-DE` shows „7,5“, `en-US` "7.5"; a locale whose
   * separator is neither `,` nor `.` shows a point. No grouping. `''`: a
   * point, as before. Typing accepts `,` and `.` in every locale and shows
   * the locale's separator; the model stays a `number`; blur clamps to
   * `min`/`max`.
   * @default ''
   */
  locale = input<string>('');

  /**
   * Unit shown after the value inside the field („7,5 %“, 3.29). Not typed
   * and not part of the model; with a suffix the value aligns to the end.
   * Screen readers read `suffixAriaLabel` (or the suffix) once after the value.
   * @default ''
   */
  suffix = input<string>('');

  /**
   * Spoken unit („Prozent“), read once after the value as the field's
   * description (before the helper or error text). `''`: the `suffix`.
   * @default ''
   */
  suffixAriaLabel = input<string>('');

  /**
   * Height of the field and the steppers (3.29, regeln row 4): `xs` 24,
   * `sm` 32, `md` 40 (as before), `lg` 44 px (touch: field and both
   * steppers at least 44 × 44 px).
   * @default 'md'
   */
  size = input<NumberInputSize>('md');

  /** Emits value on change */
  valueChange = output<number>();

  /** Per-instance id wiring the label, hint and error to the field. */
  readonly inputId = `lc-number-input-${++NumberInputComponent.nextId}`;

  protected value = signal<number | null>(null);

  /**
   * Text shown in the field. It is re-derived from the model on `writeValue`,
   * stepping and blur — never while typing — so an in-progress entry such as
   * "1." or "-" is not snapped back to "1" under the user's cursor.
   */
  protected readonly text = signal('');

  /** Disabled through the form control (`setDisabledState`), as opposed to the input. */
  private readonly formDisabled = signal(false);

  /** Disabled by either route — the one flag the template consults. */
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  /** Decimals implied by `step` — stepped results are rounded to it so 0.1 + 0.2 does not drift. */
  private readonly stepPrecision = computed(() => decimalsOf(this.step()));

  /** Fractions need a decimal key on touch keyboards; integers do not. */
  protected readonly inputMode = computed(() => (this.stepPrecision() > 0 ? 'decimal' : 'numeric'));

  /** The decimal separator shown in the field: the `locale`'s `,` or `.`. */
  private readonly separator = computed(() => decimalSeparatorOf(this.locale()));

  /** The spoken unit: `suffixAriaLabel`, else the `suffix`; `''` = none. */
  protected readonly spokenSuffix = computed(() => this.suffixAriaLabel() || this.suffix());

  /** Icon size of the steppers: `xs` (16 px) for the `xs`/`sm` fields, `sm` (20 px) as before. */
  protected readonly iconSize = computed(() => (this.size() === 'xs' || this.size() === 'sm' ? 'xs' : 'sm'));

  protected readonly describedBy = computed(() => {
    const ids: string[] = [];
    if (this.spokenSuffix()) ids.push(`${this.inputId}-suffix`);
    if (this.error()) ids.push(`${this.inputId}-error`);
    else if (this.helperText()) ids.push(`${this.inputId}-helper`);
    return ids.length ? ids.join(' ') : null;
  });

  protected containerClasses = computed(() => {
    const classes = ['number-input'];
    // `md` (the default) keeps the base rules: no class.
    const size = this.size();
    if (size === 'xs' || size === 'sm' || size === 'lg') classes.push(`number-input--${size}`);
    if (this.isDisabled()) classes.push('number-input--disabled');
    if (this.error()) classes.push('number-input--error');
    return classes.join(' ');
  });

  protected canDecrement = computed(() => {
    const val = this.value();
    const minV = this.min();
    if (val === null || minV === undefined) return true;
    return val > minV;
  });

  protected canIncrement = computed(() => {
    const val = this.value();
    const maxV = this.max();
    if (val === null || maxV === undefined) return true;
    return val < maxV;
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (val: number | null) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  decrement(): void {
    this.stepBy(-1);
  }

  increment(): void {
    this.stepBy(1);
  }

  private stepBy(direction: 1 | -1): void {
    const cur = this.value() ?? 0;
    // Keep whatever precision the user typed (1.25 + 0.1 → 1.35), but never
    // less than the step's own — that is what removes the binary drift.
    const precision = Math.max(this.stepPrecision(), decimalsOf(cur));
    const next = this.clamp(Number((cur + direction * this.step()).toFixed(precision)));
    this.setValue(next);
    this.text.set(this.format(next));
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.canIncrement()) this.increment();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.canDecrement()) this.decrement();
    }
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const raw = target.value;
    const text = sanitizeNumericText(raw, this.separator());
    // Property binding alone would not repaint the field when the model does
    // not change (typing "a" after "12" leaves 12 as-is), so the stripped
    // text is written straight back to the element.
    if (text !== raw) {
      const caret = Math.max(0, (target.selectionStart ?? text.length) - (raw.length - text.length));
      target.value = text;
      target.setSelectionRange(caret, caret);
    }
    this.text.set(text);
    // "" would parse as 0; it and the other in-progress entries ("-", ".")
    // mean the model has no number yet.
    const parsed = text === '' ? NaN : Number(text.replace(',', '.'));
    if (Number.isNaN(parsed)) {
      if (this.value() !== null) {
        this.value.set(null);
        this.onChange(null);
      }
      return;
    }
    this.setValue(parsed);
  }

  onBlur(): void {
    this.onTouched();
    // Clamp on blur
    const val = this.value();
    if (val !== null) {
      const clamped = this.clamp(val);
      if (clamped !== val) this.setValue(clamped);
    }
    // Whatever half-typed text is left ("1.", "-", "007") is replaced by the
    // model's canonical form. The element is written directly as well, in
    // case the DOM drifted from the bound text without an input event.
    const canonical = this.format(this.value());
    this.text.set(canonical);
    const el = this.inputEl()?.nativeElement;
    if (el) el.value = canonical;
  }

  /** The model as text: `String(val)` with the locale's decimal separator, no grouping. */
  private format(val: number | null): string {
    if (val === null) return '';
    const text = String(val);
    return this.separator() === ',' ? text.replace('.', ',') : text;
  }

  /** A press on the visible unit puts the caret in the field, as a click on the field would. */
  protected focusField(event: MouseEvent): void {
    event.preventDefault();
    if (!this.isDisabled()) this.inputEl()?.nativeElement.focus();
  }

  private clamp(val: number): number {
    const minV = this.min();
    const maxV = this.max();
    if (minV !== undefined) val = Math.max(minV, val);
    if (maxV !== undefined) val = Math.min(maxV, val);
    return val;
  }

  private setValue(val: number): void {
    if (val === this.value()) return;
    this.value.set(val);
    this.valueChange.emit(val);
    this.onChange(val);
  }

  // ControlValueAccessor
  writeValue(val: number | null): void {
    this.value.set(val);
    this.text.set(this.format(val));
  }

  registerOnChange(fn: (val: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
