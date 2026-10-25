import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  OutputRef,
  PLATFORM_ID,
  afterRenderEffect,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Counter for generated ids: they follow creation order, so prerendered HTML is the same in every build. */
let nextUniqueId = 0;

/**
 * Textarea component for multi-line text input.
 *
 * Features:
 * - Variant styles (outline, filled)
 * - Size presets (xs, sm, md, lg)
 * - Auto-resize with configurable min/max rows
 * - Character count display with maxLength
 * - Validation error message and helper text
 * - Disabled and readonly states
 * - ControlValueAccessor integration for reactive forms
 * - Plain form posts without JavaScript: `name`, and a `value` that is
 *   prerendered into the native `<textarea>`
 *
 * @example
 * ```html
 * <lc-textarea placeholder="Enter message" [autoResize]="true" [(ngModel)]="message" />
 * <lc-textarea label="Message" name="message" [required]="true" [value]="draft" />
 * ```
 */
@Component({
  selector: 'lc-textarea',
  standalone: true,
  imports: [],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent implements ControlValueAccessor {
  private readonly textareaElement = viewChild<ElementRef<HTMLTextAreaElement>>('textarea');

  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));

  /**
   * Visual variant of the textarea
   * @default 'outline'
   */
  readonly variant = input<'outline' | 'filled'>('outline');

  /**
   * Size of the textarea
   * @default 'md'
   */
  readonly size = input<'xs' | 'sm' | 'md' | 'lg'>('md');

  /**
   * Whether the textarea is disabled
   * @default false
   */
  readonly disabled = input<boolean>(false);

  /**
   * Whether the textarea is in error state
   * @default false
   */
  readonly error = input<boolean>(false);

  /**
   * Whether the textarea is required
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
   * Deprecated, no effect (it never had one in `lc-textarea`). The `*` is
   * decorative and hidden from assistive technology, because the native
   * `required` state is announced already, in the screen reader's language; a
   * name on the `*` would make the field say "required" twice. Kept so
   * existing bindings compile.
   * @deprecated No effect: the native `required` state is announced instead.
   * @default 'required'
   */
  readonly requiredAriaLabel = input<string>('required');

  /**
   * Id of the native `<textarea>`. The label's `for`, the error
   * (`<id>-error`), the helper text (`<id>-helper`) and `aria-describedby`
   * derive from it, so an error summary can link to the field
   * (`<a href="#contact-message">`) and prerendered HTML is the same in every
   * build. Unique in the document, no spaces. Unset (or empty) = a generated
   * `lc-textarea-<n>`, which follows creation order (on the server it keeps
   * counting across prerendered routes): set it on prerendered pages.
   * @default generated (lc-textarea-<n>)
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
   * Whether the textarea is readonly
   * @default false
   */
  readonly readonly = input<boolean>(false);

  /**
   * Placeholder text
   * @default ''
   */
  readonly placeholder = input<string>('');

  /**
   * Label text displayed above the textarea
   * @default ''
   */
  readonly label = input<string>('');

  /**
   * Helper text displayed below the textarea
   * @default ''
   */
  readonly helperText = input<string>('');

  /**
   * Error message displayed when error is true
   * @default ''
   */
  readonly errorMessage = input<string>('');

  /**
   * ARIA label for accessibility
   * @default undefined
   */
  readonly ariaLabel = input<string | undefined>(undefined);

  /**
   * Native `name` of the inner `<textarea>`, so a form posts the text without
   * JavaScript. Unset = no attribute. A `disabled` textarea is not posted
   * (HTML); use `readonly` to post a fixed text.
   * @default undefined
   */
  readonly name = input<string>();

  /**
   * Number of visible text rows
   * @default 3
   */
  readonly rows = input<number>(3);

  /**
   * Maximum number of characters allowed
   * @default undefined
   */
  readonly maxLength = input<number | undefined>(undefined);

  /**
   * Whether to show character count
   * @default false
   */
  readonly showCharacterCount = input<boolean>(false);

  /**
   * Whether to automatically resize based on content
   * @default false
   */
  readonly autoResize = input<boolean>(false);

  /**
   * Minimum number of rows for auto-resize
   * @default 3
   */
  readonly minRows = input<number>(3);

  /**
   * Maximum number of rows for auto-resize
   * @default undefined
   */
  readonly maxRows = input<number | undefined>(undefined);

  /**
   * Current text, two-way bindable (`[value]` / `[(value)]`). It pre-fills the
   * native textarea, in prerendered HTML too, so a server-rendered page can
   * keep a visitor's text. Emits `valueChange` whenever it changes: once per
   * keystroke that changes the text, and when a bound form control or code
   * sets a different text. With a form control, the control's value wins;
   * don't bind both.
   * @default ''
   */
  readonly value = model<string>('');

  /**
   * The model's change output as a class property, so code that subscribes to
   * it (`textarea.valueChange.subscribe(…)`, `outputToObservable(…)`) keeps
   * compiling as in 3.9. Template bindings `(valueChange)` use the model.
   */
  readonly valueChange: OutputRef<string> = this.value;

  /** Generated id, taken once per instance (also with `controlId`), so later ids don't shift. */
  private readonly generatedId = `lc-textarea-${nextUniqueId++}`;

  private readonly resolvedId = computed(() => this.controlId() || this.generatedId);

  /** Id of the native textarea: `controlId`, or the generated `lc-textarea-<n>`. Links label, error and helper text to it. */
  get textareaId(): string {
    return this.resolvedId();
  }

  /** Id of the error message: `<textareaId>-error`. */
  get errorId(): string {
    return `${this.resolvedId()}-error`;
  }

  /** Id of the helper text: `<textareaId>-helper`. */
  get helperId(): string {
    return `${this.resolvedId()}-helper`;
  }

  /**
   * The native textarea's value. On the server a leading line break gets one
   * extra `\n`: the HTML parser drops the first line break after `<textarea>`,
   * and the server's DOM serialiser doesn't add the one the HTML
   * serialisation rules require, so the prerendered page would lose it.
   */
  protected readonly renderedValue = computed(() => {
    const value = this.value();
    return this.isServer && /^[\r\n]/.test(value) ? `\n${value}` : value;
  });

  // Internal disabled state (for ControlValueAccessor)
  private readonly formDisabled = signal<boolean>(false);

  /**
   * Computed disabled state from both input and form control
   */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  // Computed values
  readonly currentCharacterCount = computed(() => this.value().length);

  readonly characterCountText = computed(() => {
    const current = this.currentCharacterCount();
    const max = this.maxLength();
    return max !== undefined ? `${current} / ${max}` : `${current}`;
  });

  readonly isOverLimit = computed(() => {
    const max = this.maxLength();
    return max !== undefined && this.currentCharacterCount() > max;
  });

  /** Whether an error message is shown (drives aria-describedby) */
  readonly showsError = computed(() => this.error() && !!this.errorMessage());

  /** Whether the helper text is shown (error message takes precedence) */
  readonly showsHelper = computed(() => !this.showsError() && !!this.helperText());

  readonly describedBy = computed(() => {
    const ids: string[] = [];
    if (this.showsError()) ids.push(this.errorId);
    if (this.showsHelper()) ids.push(this.helperId);
    return ids.length ? ids.join(' ') : null;
  });

  /**
   * Computed classes for the textarea element
   */
  readonly textareaClasses = computed(() => {
    const classes = ['lc-textarea', `lc-textarea--${this.variant()}`, `lc-textarea--${this.size()}`];

    if (this.isDisabled()) {
      classes.push('lc-textarea--disabled');
    }

    if (this.error()) {
      classes.push('lc-textarea--error');
    }

    if (this.readonly()) {
      classes.push('lc-textarea--readonly');
    }

    if (this.autoResize()) {
      classes.push('lc-textarea--auto-resize');
    }

    return classes.join(' ');
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  constructor() {
    // Re-measure after every render in which the value or the resize
    // constraints changed — this covers typing, form writes and input changes
    // without timers, and runs once the DOM already holds the new value.
    afterRenderEffect(() => {
      this.value();
      this.minRows();
      this.maxRows();
      if (this.autoResize()) {
        this.adjustHeight();
      }
    });
  }

  /**
   * Handle input changes
   */
  onInput(value: string): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }

    // model.set() emits `valueChange` exactly once per actual change
    this.value.set(value);
    this.onChange(value);
  }

  /**
   * Handle blur event
   */
  onBlur(): void {
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: string | null | undefined): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  // Private helper methods
  private adjustHeight(): void {
    const textarea = this.textareaElement()?.nativeElement;
    if (!textarea) {
      return;
    }

    // Reset height to get accurate scrollHeight
    textarea.style.height = 'auto';

    const minHeight = this.rowsToHeight(textarea, this.minRows());
    const maxHeight = this.rowsToHeight(textarea, this.maxRows());
    let newHeight = textarea.scrollHeight;

    // Apply constraints
    if (minHeight !== undefined) {
      newHeight = Math.max(newHeight, minHeight);
    }
    if (maxHeight !== undefined) {
      newHeight = Math.min(newHeight, maxHeight);
    }

    textarea.style.height = `${newHeight}px`;
  }

  /** Pixel height for `rows` lines incl. vertical padding; undefined when it cannot be measured. */
  private rowsToHeight(textarea: HTMLTextAreaElement, rows: number | undefined): number | undefined {
    if (rows === undefined) {
      return undefined;
    }

    const style = getComputedStyle(textarea);
    const lineHeight = parseFloat(style.lineHeight);
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;

    // 'normal' / unmeasurable line-height (e.g. jsdom) → no constraint
    if (!Number.isFinite(lineHeight)) {
      return undefined;
    }

    return lineHeight * rows + paddingTop + paddingBottom;
  }

  protected getInputValue(event: Event): string {
    return (event.target as HTMLTextAreaElement).value;
  }
}
