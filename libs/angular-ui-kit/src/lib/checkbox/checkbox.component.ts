import {
  Component,
  input,
  model,
  signal,
  computed,
  effect,
  inject,
  untracked,
  ChangeDetectionStrategy,
  forwardRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CHECKBOX_GROUP } from './checkbox-group.token';

export type CheckboxSize = 'xs' | 'sm' | 'md' | 'lg';

let nextUniqueId = 0;

@Component({
  selector: 'lc-checkbox',
  standalone: true,
  imports: [],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
/**
 * Checkbox component for boolean or indeterminate selections.
 *
 * Features:
 * - Checked, unchecked, and indeterminate states
 * - Multiple size variants (sm, md, lg)
 * - Validation error display with error message
 * - Help text support
 * - Full accessibility with ARIA attributes
 * - ControlValueAccessor integration for reactive forms
 * - Inside an `lc-checkbox-group` (3.41): size, disabled and the invalid state
 *   come from the group, and `value` makes the checkbox part of the group's value
 *
 * @example
 * ```html
 * <lc-checkbox label="Accept terms" />
 * <lc-checkbox label="Select all" [(checked)]="allSelected" [indeterminate]="someSelected" />
 * ```
 */
export class CheckboxComponent implements ControlValueAccessor, OnChanges {
  // Inputs
  /**
   * id of the native input (and prefix of the help and error ids).
   * @default generated (lc-checkbox-<n>)
   */
  readonly id = input<string>(`lc-checkbox-${nextUniqueId++}`);

  /**
   * Visible label text.
   * @default ''
   */
  readonly label = input<string>('');

  /**
   * Error state: error border and `aria-invalid`. Inside an `lc-checkbox-group`
   * the group's `error` sets it as well (without a message per checkbox).
   * @default false
   */
  readonly error = input<boolean>(false);

  /**
   * Message below the checkbox while `error` is set.
   * @default ''
   */
  readonly errorMessage = input<string>('');

  /**
   * Help text below the checkbox (hidden while `error` is set).
   * @default ''
   */
  readonly helpText = input<string>('');

  /**
   * Size of the box and label. Inside an `lc-checkbox-group` the group's `size`
   * applies unless this input is bound; a bound `size` wins.
   * @default 'md'
   */
  readonly size = input<CheckboxSize>('md');

  /**
   * The checkbox must be checked: native `required`, `aria-required` and `*`
   * after the label. A required `lc-checkbox-group` does not set it.
   * @default false
   */
  readonly required = input<boolean>(false);

  /**
   * Disables the checkbox. Inside an `lc-checkbox-group` the group's
   * `disabled` disables it as well.
   * @default false
   */
  readonly disabled = input<boolean>(false);

  /**
   * Accessible name when there is no visible label.
   * @default ''
   */
  readonly ariaLabel = input<string>('');

  /**
   * id(s) of the element(s) that name the checkbox.
   * @default ''
   */
  readonly ariaLabelledBy = input<string>('');

  /**
   * Extra id(s) for `aria-describedby`, before the help and error text.
   * @default ''
   */
  readonly ariaDescribedBy = input<string>('');

  /**
   * The value this checkbox adds to its `lc-checkbox-group`'s `value` while
   * checked. Without a group it has no effect.
   * @default ''
   */
  readonly value = input<string>('');

  /**
   * Checked state (two-way bindable). Emits `checkedChange` whenever the
   * value changes — on user toggle as well as on form writes. Inside an
   * `lc-checkbox-group` with a `value`, the group's value sets it.
   * @default false
   */
  readonly checked = model<boolean>(false);

  /**
   * Indeterminate ("partially checked") state (two-way bindable). Cleared
   * automatically on the next user interaction; emits `indeterminateChange`.
   * @default false
   */
  readonly indeterminate = model<boolean>(false);

  /** The `lc-checkbox-group` around this checkbox, if any. */
  private readonly group = inject(CHECKBOX_GROUP, { optional: true });

  /** Disabled state pushed by a form control (`setDisabledState`). */
  private readonly formDisabled = signal(false);

  /** Whether `size` was ever bound (then it wins over the group's size). */
  private readonly sizeBound = signal(false);

  /** Effective disabled state: `disabled` input OR form control OR group disabled. */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled() || !!this.group?.groupDisabled());

  /** Error state here or on the group. */
  readonly isInvalid = computed(() => this.error() || !!this.group?.groupInvalid());

  /** The rendered size: a bound `size`, else the group's, else `size`. */
  readonly effectiveSize = computed(() =>
    this.group && !this.sizeBound() ? this.group.groupSize() : this.size(),
  );

  readonly labelClasses = computed(() => {
    const classes = ['checkbox-label', `checkbox-${this.effectiveSize()}`];

    if (this.checked()) {
      classes.push('checkbox-checked');
    }

    if (this.isDisabled()) {
      classes.push('checkbox-disabled');
    }

    if (this.indeterminate()) {
      classes.push('checkbox-indeterminate');
    }

    if (this.isInvalid()) {
      classes.push('checkbox-error');
    }

    if (this.required()) {
      classes.push('checkbox-required');
    }

    if (this.group) {
      classes.push('checkbox-in-group');
    }

    return classes.join(' ');
  });

  /** id of the rendered help text (only while it is shown). */
  readonly helpTextId = computed(() =>
    this.helpText() && !this.error() ? `${this.id()}-help` : null,
  );

  /** id of the rendered error message (only while it is shown). */
  readonly errorMessageId = computed(() =>
    this.error() && this.errorMessage() ? `${this.id()}-error` : null,
  );

  /** aria-describedby: consumer-supplied ids plus the rendered help/error text. */
  readonly describedBy = computed(() => {
    const ids = [this.ariaDescribedBy(), this.helpTextId(), this.errorMessageId()].filter(Boolean);
    return ids.length ? ids.join(' ') : null;
  });

  constructor() {
    // Inside a group: a checkbox with a value is checked exactly when the group's value holds it.
    // Reading `checked` too makes the group win over a `[checked]` binding on the checkbox.
    const group = this.group;
    if (group) {
      effect(() => {
        const v = this.value();
        if (!v) return;
        const on = group.selectedValues().includes(v);
        this.checked();
        untracked(() => this.checked.set(on));
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Signal inputs trigger ngOnChanges too: a bound `size` wins over the group's.
    if (changes['size']) {
      this.sizeBound.set(true);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean | null): void {
    this.checked.set(value ?? false);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  // Event handlers
  handleChange(event: Event): void {
    if (this.isDisabled()) {
      event.preventDefault();
      return;
    }

    const target = event.target as HTMLInputElement;
    const newValue = target.checked;

    // Clear indeterminate state when user interacts
    this.indeterminate.set(false);

    // model.set() emits `checkedChange` exactly once per actual change
    this.checked.set(newValue);
    this.onChange(newValue);
    this.group?.toggle(this.value(), newValue);
  }

  handleBlur(): void {
    this.onTouched();
    this.group?.touch();
  }

  // Control Value Accessor callbacks (private)
  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;
}
