import {
  Component,
  ChangeDetectionStrategy,
  computed,
  forwardRef,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextUniqueId = 0;

/**
 * Switch component for boolean toggle functionality.
 *
 * Features:
 * - Color variants (primary, secondary, success, warning, danger)
 * - Size options (sm, md, lg)
 * - Loading state with spinner
 * - Configurable label positioning (left/right)
 * - Help text below the label, linked by `aria-describedby` (`helpText`, 3.16)
 * - Rows with a label or help text are at least 44 px high
 *   (`--lc-switch-min-height`, default `var(--size-min-touch-height)`; `0`
 *   restores the 3.15 rows of 21/24/28 px)
 * - Keyboard toggle support
 * - Disabled and required states
 * - ControlValueAccessor integration for reactive forms
 *
 * @example
 * ```html
 * <lc-switch label="Enable notifications" [(ngModel)]="isEnabled" />
 * ```
 */
@Component({
  selector: 'lc-switch',
  standalone: true,
  imports: [],
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true,
    },
  ],
})
export class SwitchComponent implements ControlValueAccessor {
  /**
   * Visual variant of the switch
   */
  readonly variant = input<'primary' | 'secondary' | 'success' | 'warning' | 'danger'>('primary');

  /**
   * Size of the switch
   */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /**
   * Whether the switch is checked (template-driven usage; forms write via `writeValue`)
   */
  readonly checked = input<boolean>(false);

  /**
   * Whether the switch is disabled
   */
  readonly disabled = input<boolean>(false);

  /**
   * Whether the switch is required
   */
  readonly required = input<boolean>(false);

  /**
   * Whether the switch is in loading state
   */
  readonly loading = input<boolean>(false);

  /**
   * Label text
   */
  readonly label = input<string>('');

  /**
   * Label position relative to switch
   */
  readonly labelPosition = input<'left' | 'right'>('right');

  /**
   * ARIA label for accessibility (overrides the visible label as accessible name)
   */
  readonly ariaLabel = input<string | undefined>(undefined);

  /**
   * Description below the label, linked to the switch by `aria-describedby`
   * (read after the name and state). Wraps; 14 px secondary text. A tap on it
   * toggles the switch like the label. Empty renders no element and no
   * `aria-describedby` (3.15).
   * @default ''
   */
  readonly helpText = input<string>('');

  /**
   * Emitted when checked state changes
   */
  readonly checkedChange = output<boolean>();

  /** Per-instance id so the visible `<label for>` points at this switch. */
  readonly switchId = `lc-switch-${nextUniqueId++}`;

  /** id of the rendered help text (only while `helpText` is set). */
  readonly helpTextId = computed(() => (this.helpText() ? `${this.switchId}-help` : null));

  /**
   * Effective checked state: follows the `checked` input, overridden by
   * form writes (`writeValue`) and user toggles.
   */
  readonly checkedState = linkedSignal(() => this.checked());

  // Internal disabled state (for ControlValueAccessor)
  private readonly formDisabled = signal<boolean>(false);

  /**
   * Computed disabled state from both input and form control
   */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /**
   * Computed classes for the switch element
   */
  readonly switchClasses = computed(() => {
    const classes = ['lc-switch', `lc-switch--${this.variant()}`, `lc-switch--${this.size()}`];

    if (this.checkedState()) {
      classes.push('lc-switch--checked');
    }

    if (this.isDisabled()) {
      classes.push('lc-switch--disabled');
    }

    if (this.loading()) {
      classes.push('lc-switch--loading');
    }

    return classes.join(' ');
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: boolean) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  /**
   * Toggle the switch state
   */
  toggle(): void {
    if (this.isDisabled() || this.loading()) {
      return;
    }

    const next = !this.checkedState();
    this.checkedState.set(next);
    this.onChange(next);
    this.onTouched();
    this.checkedChange.emit(next);
  }

  /**
   * Handle click event (the control is a native button, so Space/Enter arrive here too)
   */
  onClick(): void {
    this.toggle();
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean | null | undefined): void {
    this.checkedState.set(!!value);
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
}
