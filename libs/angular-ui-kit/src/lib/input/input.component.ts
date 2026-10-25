/* eslint-disable @typescript-eslint/member-ordering */
import {
  Component,
  computed,
  input,
  model,
  output,
  signal,
  viewChild,
  ElementRef,
  ChangeDetectionStrategy,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '@lifecorner/angular-ui-kit/icon';

/** Values of the native `autocapitalize` attribute. */
export type InputAutocapitalize = 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';

/** Values of the native `enterkeyhint` attribute (label of the on-screen keyboard's Enter key). */
export type InputEnterKeyHint = 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';

/** Counter for generated ids: they follow creation order, so prerendered HTML is the same in every build. */
let nextUniqueId = 0;

/**
 * Input component for single-line text form data entry.
 *
 * Features:
 * - Type variants (text, email, password, number, tel, url)
 * - Size presets (xs, sm, md, lg)
 * - Leading and trailing icon support
 * - Character count display with maxLength (announced only near the limit)
 * - Validation error message display
 * - Helper text support
 * - Disabled and readonly states (read-only values can wrap: `readonlyWrap`)
 * - Input purpose and keyboard hints: `autocomplete`, `name`, `autocapitalize`,
 *   `spellcheck`, `enterkeyhint`
 * - ControlValueAccessor integration for reactive forms
 *
 * @example
 * ```html
 * <lc-input label="Name" autocomplete="name" autocapitalize="words" [spellcheck]="false" [(ngModel)]="name" />
 * ```
 */
@Component({
  selector: 'lc-input',
  imports: [IconComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  // Input Properties
  /**
   * Input label (displayed above input)
   */
  readonly label = input<string>();

  /**
   * Placeholder text
   * @default ''
   */
  readonly placeholder = input<string>('');

  /**
   * Input type
   * @default 'text'
   */
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'url'>('text');

  /**
   * Size of the input
   * @default 'md'
   */
  readonly size = input<'xs' | 'sm' | 'md' | 'lg'>('md');

  /**
   * Whether the input is disabled
   * @default false
   */
  readonly disabled = input<boolean>(false);

  /**
   * Whether the input is read-only
   * @default false
   */
  readonly readonly = input<boolean>(false);

  /**
   * Read-only values wrap onto more lines instead of being clipped (WCAG 1.4.10):
   * the value is shown as text (a read-only textbox named by the label), and a
   * hidden native input keeps the value, `name` and `autocomplete` for forms and
   * password managers. Only applies while `readonly` is set.
   * @default false
   */
  readonly readonlyWrap = input<boolean>(false);

  /**
   * Whether the input is required
   * @default false
   */
  readonly required = input<boolean>(false);

  /**
   * Show the `*` after the label of a `required` field. `false` keeps the
   * required semantics (`required`, `aria-required`) without the asterisk —
   * for forms where every field is required.
   * @default true
   */
  readonly requiredIndicator = input<boolean>(true);

  /**
   * Error message to display (if validation fails). While it is set, the field
   * container carries the class `input-invalid` and the message renders as
   * `<p class="input-error">`. Before 3.13 the container also carried
   * `input-error` (G-WL3).
   * @default undefined
   */
  readonly error = input<string>();

  /**
   * Helper text to display below input
   */
  readonly helperText = input<string>();

  /**
    * Icon to display before input text (Tabler icon name)
   * @example 'envelope'
   */
  readonly iconBefore = input<string>();

  /**
    * Icon to display after input text (Tabler icon name)
   * @example 'eye'
   */
  readonly iconAfter = input<string>();

  /**
   * Maximum number of characters
   */
  readonly maxLength = input<number>();

  /**
   * Whether to show character count
   * @default false
   */
  readonly showCharCount = input<boolean>(false);

  /**
   * Screen-reader announcement of the character count near the limit;
   * `{remaining}` is replaced.
   * @default 'Characters remaining: {remaining}'
   */
  readonly charCountRemainingLabel = input('Characters remaining: {remaining}');

  /**
   * Remaining characters from which the count is announced (the visible count
   * is always shown). Unset = the last 10 % of `maxLength` (at least 1).
   */
  readonly charCountAnnounceThreshold = input<number>();

  /**
   * ARIA label for accessibility
   */
  readonly ariaLabel = input<string>();

  /**
   * Native `autocomplete` — the input purpose (WCAG 1.3.5), so browsers and
   * password managers fill the field: `name`, `email`, `username`,
   * `username webauthn` (offers passkeys in the field), `current-password`,
   * `new-password`, `one-time-code`, `tel`, `off` … Unset = no attribute.
   */
  readonly autocomplete = input<string>();

  /** Native `name` of the inner `<input>` (form posts, password managers). Unset = no attribute. */
  readonly name = input<string>();

  /**
   * Native `autocapitalize` for on-screen keyboards: `off` for addresses,
   * user names and codes, `words` for names. Unset = no attribute.
   */
  readonly autocapitalize = input<InputAutocapitalize>();

  /** Native `spellcheck`: `false` for names, addresses and codes. Unset = no attribute. */
  readonly spellcheck = input<boolean>();

  /** Native `enterkeyhint`: the label of the on-screen keyboard's Enter key. Unset = no attribute. */
  readonly enterkeyhint = input<InputEnterKeyHint>();

  /**
   * Deprecated, no effect since 3.12. The `*` is decorative and hidden from
   * assistive technology, because the native `required` state is announced
   * already, in the screen reader's language; a name on the `*` made the field
   * say "required" twice. Kept so existing bindings compile.
   * @deprecated No effect since 3.12: the native `required` state is announced instead.
   * @default 'required'
   */
  readonly requiredAriaLabel = input('required');

  /**
   * Id of the native `<input>`. The label's `for`, the error (`<id>-error`),
   * the helper text (`<id>-helper`), the label id (`<id>-label`) and
   * `aria-describedby` derive from it, so an error summary can link to the
   * field (`<a href="#contact-email">`) and prerendered HTML is the same in
   * every build. Unique in the document, no spaces. Unset (or empty) = a
   * generated `lc-input-<n>`, which follows creation order (on the server it
   * keeps counting across prerendered routes): set it on prerendered pages.
   * @default generated (lc-input-<n>)
   */
  readonly controlId = input<string | undefined>(undefined);

  /**
   * Announce the error message the moment it appears (`role="alert"` on the
   * message). Set `false` when an `lc-alert` error summary above the form
   * already announces the errors (a page re-rendered after a failed submit,
   * e.g. 422), so they aren't read twice. The message stays visible, stays
   * linked through `aria-describedby` (read with the field), and the control
   * keeps `aria-invalid`.
   * @default true
   */
  readonly announceError = input<boolean>(true);

  /**
   * Current value (two-way bindable: `[value]` / `[(value)]`). Emits
   * `valueChange` whenever it changes — once per user keystroke, on `clear()`
   * and when a bound form control writes a value.
   */
  readonly value = model<string>('');

  // Output Events
  /**
   * Emitted when input receives focus
   */
  readonly focused = output<void>();

  /**
   * Emitted when input loses focus
   */
  readonly blurred = output<void>();

  /**
   * Emitted when Enter key is pressed
   */
  readonly enterPressed = output<void>();

  // Internal state
  /** Generated id, taken once per instance (also with `controlId`), so later ids don't shift. */
  private readonly generatedId = `lc-input-${nextUniqueId++}`;

  private readonly resolvedId = computed(() => this.controlId() || this.generatedId);

  /**
   * Resolved id of the native control: `controlId`, or the generated
   * `lc-input-<n>`. Read-only, same meaning as before 3.12.
   */
  get inputId(): string {
    return this.resolvedId();
  }

  // ViewChild reference
  private readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('inputRef');
  private readonly readonlyValueElement = viewChild<ElementRef<HTMLElement>>('readonlyValueRef');

  // Internal disabled state (for ControlValueAccessor)
  private readonly _formDisabled = signal<boolean>(false);

  // ControlValueAccessor callbacks
  private onChange: (value: string) => void = () => { /* set by registerOnChange */ };
  private onTouched: () => void = () => { /* set by registerOnTouched */ };

  /** The read-only value is shown as wrapping text (SI-10). */
  protected readonly wrapsReadonlyValue = computed(() => this.readonly() && this.readonlyWrap());

  /** `aria-describedby`: only the texts that are rendered (the error replaces the helper text). */
  protected readonly describedBy = computed(() => {
    if (this.error()) return `${this.inputId}-error`;
    if (this.helperText()) return `${this.inputId}-helper`;
    return null;
  });

  /** Screen-reader text of the character count: empty until the limit is near. */
  protected readonly charCountAnnouncement = computed(() => {
    const max = this.maxLength();
    if (!this.showCharCount() || !max) return '';
    const remaining = Math.max(0, max - this.value().length);
    const threshold = this.charCountAnnounceThreshold() ?? Math.max(1, Math.ceil(max * 0.1));
    if (remaining > threshold) return '';
    return this.charCountRemainingLabel().replace('{remaining}', String(remaining));
  });

  /**
   * Computed disabled state from both input and form control
   */
  protected get isDisabled(): boolean {
    return this.disabled() || this._formDisabled();
  }

  /**
   * Gets current character count
   */
  protected get charCount(): number {
    return this.value().length;
  }

  /**
   * Determines if error state should be shown
   */
  protected get hasError(): boolean {
    return !!this.error();
  }

  /**
   * Programmatically focus the input (the visible value while `readonlyWrap` applies)
   */
  public focus(): void {
    if (this.wrapsReadonlyValue()) {
      this.readonlyValueElement()?.nativeElement.focus();
      return;
    }
    this.inputElement()?.nativeElement.focus();
  }

  /**
   * Programmatically select input text
   */
  public select(): void {
    const shown = this.wrapsReadonlyValue() ? this.readonlyValueElement()?.nativeElement : undefined;
    if (shown) {
      const selection = shown.ownerDocument.getSelection();
      const range = shown.ownerDocument.createRange();
      range.selectNodeContents(shown);
      selection?.removeAllRanges();
      selection?.addRange(range);
      return;
    }
    this.inputElement()?.nativeElement.select();
  }

  /**
   * Clear the input value
   */
  public clear(): void {
    this.value.set('');
    this.onChange('');
  }

  // ControlValueAccessor implementation
  writeValue(value: string | null): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._formDisabled.set(isDisabled);
  }

  /**
   * Handles input value changes
   */
  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    // model.set() emits `valueChange` exactly once per actual change
    this.value.set(newValue);
    this.onChange(newValue);
  }

  /**
   * Handles input focus
   */
  protected onFocus(): void {
    this.focused.emit();
  }

  /**
   * Handles input blur
   */
  protected onBlur(): void {
    this.onTouched();
    this.blurred.emit();
  }

  /**
   * Handles keydown events
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.enterPressed.emit();
    }
  }
}
