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
import { ICON_MINUS, ICON_PLUS } from '@lifecorner/angular-ui-kit/icons';

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

/**
 * What the model of `lc-number-input` carries (3.43): a `number`, or the
 * typed decimal as a `string` (`"1.50"`, a 20-digit id), never through a double.
 */
export type NumberInputValueType = 'number' | 'string';

/** A decimal as an integer and a scale: `"1.50"` is `{ int: 150, scale: 2 }`. */
interface Decimal {
  int: bigint;
  scale: number;
}

const TEN = BigInt(10);

/** `"-12.50"`, `".5"`, `"007"` → a {@link Decimal}; `null` for text without a digit. */
function parseDecimal(text: string): Decimal | null {
  const match = /^(-?)(\d*)(?:\.(\d*))?$/.exec(text);
  if (!match || !/\d/.test(match[2] + (match[3] ?? ''))) return null;
  const fraction = match[3] ?? '';
  const int = BigInt(`${match[2] || '0'}${fraction}`);
  return { int: match[1] ? -int : int, scale: fraction.length };
}

/** The decimal's integer at a scale at least its own. */
function atScale(d: Decimal, scale: number): bigint {
  return d.int * TEN ** BigInt(scale - d.scale);
}

/** An integer at `scale` as decimal text with a point: `(150, 2)` → `"1.50"`. */
function formatDecimal(int: bigint, scale: number): string {
  const negative = int < BigInt(0);
  const digits = (negative ? -int : int).toString().padStart(scale + 1, '0');
  const text = scale ? `${digits.slice(0, -scale)}.${digits.slice(-scale)}` : digits;
  return negative ? `-${text}` : text;
}

/** A number (a bound, a step) as decimal text without an exponent. */
function numberToDecimal(n: number): Decimal | null {
  return Number.isFinite(n) ? parseDecimal(n.toFixed(Math.min(100, decimalsOf(n)))) : null;
}

/** Sign of `a - b`. */
function compareDecimal(a: Decimal, b: Decimal): number {
  const scale = Math.max(a.scale, b.scale);
  const diff = atScale(a, scale) - atScale(b, scale);
  return diff > BigInt(0) ? 1 : diff < BigInt(0) ? -1 : 0;
}

@Component({
  selector: 'lc-number-input',
  standalone: true,
  imports: [IconComponent],
  viewProviders: [ɵprovideKitIcons([ICON_PLUS, ICON_MINUS])],
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
 * - 3.47: `[showSteppers]="false"` hides the − and + buttons (a typed amount)
 * - Disabled state support
 * - ControlValueAccessor integration for reactive forms; the model is a
 *   `number`, clamped to `min`/`max` on blur
 * - 3.43: `valueType="string"` keeps the typed decimal as text (`"1.50"`, a
 *   20-digit id), steps in decimal and emits `stringValueChange`
 * - 3.43: CSS hook `--lc-number-input-value-width` (on the element or any
 *   ancestor) sets the width of the value box between the steppers. Default:
 *   the size's width (xs 3rem, sm 3.5rem, md 4rem, lg 4.5rem). Size it for
 *   the longest value: `calc(7ch + 0.5rem)` for „1250,00“, `calc(20ch + 0.5rem)`
 *   for a 20-digit id (the digits are tabular, so 1ch is one digit).
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

  /**
   * Marks the field invalid without a message (3.42): error border and
   * `aria-invalid="true"`; `aria-describedby` stays as it is. For a form that
   * lists its errors once (an error summary that names and links the field),
   * so the error is not shown by colour alone. A set `error` implies it; with
   * both, the message shows once.
   * @default false
   */
  invalid = input<boolean>(false);

  /** `error` or `invalid` (3.42): the error border and `aria-invalid`. */
  protected isInvalid = computed(() => !!this.error() || this.invalid());

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
   * steppers at least 44 × 44 px). The value box is xs 3, sm 3.5, md 4 and
   * lg 4.5 rem wide; a longer value needs the CSS hook
   * `--lc-number-input-value-width` (3.43), e.g. `calc(20ch + 0.5rem)`.
   * @default 'md'
   */
  size = input<NumberInputSize>('md');

  /**
   * `'string'` keeps the typed decimal as text (3.43, usm-x row 13). The model
   * (forms) and `stringValueChange` carry a string with `.` as the separator
   * (`"1.50"`, a 20-digit id), and `null` when the field has no digit. No
   * value passes through a double. The steppers add `step` in decimal and
   * keep the larger scale (`"1.50"` + 0.5 → `"2.00"`). Blur clamps an
   * out-of-range value to `min`/`max` at the value's scale and never rewrites
   * a value in range. `locale` only changes the shown separator („1,50“).
   * `valueChange` (number) does not emit in this mode.
   * @default 'number'
   */
  valueType = input<NumberInputValueType>('number');

  /**
   * Draws the − and + buttons (3.47, kosten row 5). `false`: only the value
   * box (and the `suffix`) in the field, as high as with steppers (xs 24,
   * sm 32, md 40, lg 44 px inside the border), for a typed amount where a
   * step of 1 means nothing. ArrowUp/ArrowDown still step by `step`. Size
   * the box for the longest value with `--lc-number-input-value-width`.
   * @default true
   */
  showSteppers = input<boolean>(true);

  /** Emits value on change */
  valueChange = output<number>();

  /** The value in `valueType="string"` mode, on every change (3.43). */
  stringValueChange = output<string | null>();

  /** Per-instance id wiring the label, hint and error to the field. */
  readonly inputId = `lc-number-input-${++NumberInputComponent.nextId}`;

  protected value = signal<number | null>(null);

  /** The model in `valueType="string"` mode (3.43): the typed decimal, `.` as separator. */
  protected readonly stringValue = signal<string | null>(null);

  /** Whether the model is a string (3.43). */
  private readonly isStringMode = computed(() => this.valueType() === 'string');

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
    if (this.isInvalid()) classes.push('number-input--error');
    // 3.47: a class only without steppers, so the default keeps its classes.
    if (!this.showSteppers()) classes.push('number-input--no-steppers');
    return classes.join(' ');
  });

  protected canDecrement = computed(() => {
    if (this.isStringMode()) return this.stringBeyond(this.min(), 1);
    const val = this.value();
    const minV = this.min();
    if (val === null || minV === undefined) return true;
    return val > minV;
  });

  protected canIncrement = computed(() => {
    if (this.isStringMode()) return this.stringBeyond(this.max(), -1);
    const val = this.value();
    const maxV = this.max();
    if (val === null || maxV === undefined) return true;
    return val < maxV;
  });

  /** String mode: whether the value is on the `sign` side of `bound` (true without a value or bound). */
  private stringBeyond(bound: number | undefined, sign: 1 | -1): boolean {
    const val = parseDecimal(this.stringValue() ?? '');
    const b = bound === undefined ? null : numberToDecimal(bound);
    if (!val || !b) return true;
    return compareDecimal(val, b) === sign;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (val: number | string | null) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  decrement(): void {
    this.stepBy(-1);
  }

  increment(): void {
    this.stepBy(1);
  }

  private stepBy(direction: 1 | -1): void {
    if (this.isStringMode()) {
      this.stepString(direction);
      return;
    }
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
    if (this.isStringMode()) {
      // 3.43: the typed text is the model, with `.` as the separator; without
      // a digit ("", "-", ",") there is no value yet.
      this.setStringValue(/\d/.test(text) ? text.replace(',', '.') : null);
      return;
    }
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
    if (this.isStringMode()) {
      // 3.43: only a value out of range is rewritten (to the bound, at its
      // scale); the text of a value in range stays as typed.
      const val = this.stringValue();
      const clamped = val === null ? null : this.clampString(val);
      if (clamped !== null && clamped !== val) {
        this.setStringValue(clamped);
        this.showString(clamped);
      }
      return;
    }
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

  // -- String mode (3.43) -----------------------------------------------------

  /** Adds `direction` × `step` in decimal, at the larger of the two scales, then clamps. */
  private stepString(direction: 1 | -1): void {
    const cur = parseDecimal(this.stringValue() ?? '') ?? { int: BigInt(0), scale: 0 };
    const step = numberToDecimal(this.step()) ?? { int: BigInt(1), scale: 0 };
    const scale = Math.max(cur.scale, step.scale);
    const sum = atScale(cur, scale) + BigInt(direction) * atScale(step, scale);
    const next = this.clampString(formatDecimal(sum, scale));
    this.setStringValue(next);
    this.showString(next);
  }

  /** `val` held to `min`/`max` by decimal comparison; a bound is written at the larger scale. */
  private clampString(val: string): string {
    const d = parseDecimal(val);
    if (!d) return val;
    for (const [bound, sign] of [
      [this.min(), -1],
      [this.max(), 1],
    ] as const) {
      const b = bound === undefined ? null : numberToDecimal(bound);
      if (b && compareDecimal(d, b) === sign) {
        const scale = Math.max(d.scale, b.scale);
        return formatDecimal(atScale(b, scale), scale);
      }
    }
    return val;
  }

  private setStringValue(val: string | null): void {
    if (val === this.stringValue()) return;
    this.stringValue.set(val);
    this.stringValueChange.emit(val);
    this.onChange(val);
  }

  /** Shows a model string in the field with the locale's separator. */
  private showString(val: string | null): void {
    const text = val === null ? '' : this.separator() === ',' ? val.replace('.', ',') : val;
    this.text.set(text);
    const el = this.inputEl()?.nativeElement;
    if (el) el.value = text;
  }

  // ControlValueAccessor
  writeValue(val: number | string | null): void {
    if (this.isStringMode()) {
      // A number written in string mode is taken at its own decimals, without an exponent.
      const fromNumber = typeof val === 'number' ? numberToDecimal(val) : null;
      const text = typeof val === 'number' ? (fromNumber ? formatDecimal(fromNumber.int, fromNumber.scale) : null) : val;
      const model = text === null || text === undefined || text === '' ? null : text;
      this.stringValue.set(model);
      this.showString(model);
      return;
    }
    this.value.set(val as number | null);
    this.text.set(this.format(val as number | null));
  }

  registerOnChange(fn: (val: number | string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
