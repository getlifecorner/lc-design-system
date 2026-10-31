import {
  Component,
  input,
  output,
  computed,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { NgClass } from '@angular/common';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'danger'
  | 'warning'
  | 'info'
  | 'inverse';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * Colour tone of `variant="outline"` (3.15). `primary`: text and border in the
 * primary colour. Other variants ignore it.
 */
export type ButtonTone = 'neutral' | 'primary';

@Component({
  selector: 'lc-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  encapsulation: ViewEncapsulation.None, // Required for dynamic variant class styling
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Button component for user actions and form submissions.
 *
 * Features:
 * - Multiple variants (primary, secondary, outline, ghost, link, danger,
 *   warning, info, inverse)
 * - Size options (xs, sm, md, lg)
 * - Loading state with spinner
 * - Icon-only mode
 * - Full-width layout option
 * - Keyboard and focus handling
 * - Accessible with ARIA attributes
 *
 * CSS hook `--lc-btn-overflow-wrap` (`break-word | anywhere`, default
 * `break-word`): `anywhere` lets a single word wider than the button's line
 * break inside the word, so the button stays inside its container (WCAG 1.4.10
 * at 320 px or 200 % text). Set it on the button, the `lc-button` host or an
 * ancestor that is a wrapping row or a column. In a non-wrapping row it lets a
 * one-word button shrink with its neighbours, which is why the default stays
 * `break-word`. The kit sets it in `lc-footer`'s link row, the page-header
 * actions, the next-step-card's narrow actions and the narrow alert's actions.
 *
 * @example
 * ```html
 * <lc-button variant="primary" size="md">Save</lc-button>
 * ```
 */
export class ButtonComponent {
  /**
   * Visual variant. `inverse` is a white pill with dark ink and a white focus
   * ring for dark, coloured or image backgrounds that don't follow the theme,
   * such as the default `lc-hero` bands (primary, neutral, info, accent-purple,
   * accent-violet). It looks the same in both themes. Not for light backgrounds
   * or `variant="light"` heroes. CSS hook `--lc-button-inverse-fg` (default
   * `#0d353d`) sets its ink; keep 4.5:1 on white.
   * @default 'primary'
   */
  readonly variant = input<ButtonVariant>('primary');

  /**
   * Colour tone of `variant="outline"`: `'primary'` sets text and border to
   * the primary colour (`--color-primary-700` / `-600`; hover
   * `--color-surface-selected`, active `--color-primary-200`). Other variants
   * ignore it.
   * @default 'neutral'
   */
  readonly tone = input<ButtonTone>('neutral');
  readonly size = input<ButtonSize>('md');

  /**
   * Natively disabled: the button leaves the focus order and ignores clicks.
   * For a temporary busy state that keeps focus, use `loading`.
   * @default false
   */
  readonly disabled = input(false);

  /**
   * Shows a spinner in place of the icon slots and makes the button
   * unavailable without removing it from the focus order (3.17). The inner
   * `<button>` gets `aria-disabled="true"` and `aria-busy="true"` instead of
   * the native `disabled`, so a focused button keeps focus. While it is
   * loading, click, Enter and Space are ignored: `clicked` is not emitted, the
   * click event stops at the button (a `(click)` on the host doesn't fire),
   * and a `type="submit"`/`"reset"` button doesn't submit or reset its form.
   * The look is unchanged: spinner, 50 % opacity, no hover. Screen readers may
   * announce the state change ("unavailable"/"dimmed"), but the button doesn't
   * announce the outcome: the page does that, for example with a polite live
   * region ("USM wird geladen.", then the result). `disabledReason` also
   * applies while loading. If `disabled` is set too, the native `disabled`
   * wins.
   * @default false
   */
  readonly loading = input(false);
  readonly iconOnly = input(false);
  readonly fullWidth = input(false);
  readonly ariaLabel = input('');
  readonly type = input<ButtonType>('button');

  /**
   * Native tooltip (title attribute) on the button.
   */
  readonly title = input('');

  /**
   * Reason shown as tooltip while the button is disabled (or loading).
   * Takes precedence over `title` in that state. The tooltip also appears
   * over the disabled button — the component guarantees the inner button
   * never gets `pointer-events: none`.
   */
  readonly disabledReason = input('');

  /**
   * Render as an inline text button that inherits font size, weight and
   * line-height from the surrounding text (for links inside copy, clickable
   * row titles, linked counters). Pair with `variant="link"`.
   * @default false
   */
  readonly inline = input(false);

  /**
   * Drop the inline padding so a `variant="link"` button sits flush with the
   * content edge: the label starts at the edge, and the button keeps its height
   * and a 44 × 44 px minimum target. At the end edge of a row, set the CSS
   * hook `--lc-btn-flush-align: end` (default `start`) on the host or an
   * ancestor: every line of the label then ends at the edge. Ignored on other
   * variants and with `iconOnly` (3.9, AS-26).
   * @default false
   */
  readonly flush = input(false);

  readonly clicked = output<void>();
  readonly focused = output<void>();
  readonly blurred = output<void>();

  @ViewChild('buttonElement') buttonElement!: ElementRef<HTMLButtonElement>;

  readonly isDisabled = computed(() => this.disabled() || this.loading());

  /**
   * Tooltip actually applied to the button: `disabledReason` while disabled,
   * `title` otherwise.
   */
  readonly effectiveTitle = computed(() => {
    if (this.isDisabled() && this.disabledReason()) {
      return this.disabledReason();
    }
    return this.title() || null;
  });

  /**
   * Emits `clicked` unless the button is disabled or loading. While loading
   * (and not natively disabled) the event is cancelled and stopped, so a form
   * isn't submitted and a host `(click)` doesn't fire. The parameter is
   * optional, so callers without an argument still work.
   */
  handleClick(event?: Event): void {
    if (this.loading() && !this.disabled()) {
      event?.preventDefault();
      event?.stopImmediatePropagation();
      return;
    }
    if (!this.isDisabled()) {
      this.clicked.emit();
    }
  }

  handleFocus(): void {
    this.focused.emit();
  }

  handleBlur(): void {
    this.blurred.emit();
  }

  focus(): void {
    this.buttonElement?.nativeElement.focus();
  }

  blur(): void {
    this.buttonElement?.nativeElement.blur();
  }
}
