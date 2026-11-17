import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Spinner component for loading state indication.
 *
 * Features:
 * - Animated spinning indicator
 * - Size variants (sm, md, lg) and, since 3.42, `xs`: a 16 px inline spinner
 *   with no padding for a list row, a tab or a button-sized slot (the message
 *   sits beside it)
 * - Optional message text below spinner
 * - Design system color token integration
 * - Accessible with ARIA status role
 *
 * @example
 * ```html
 * <lc-spinner />
 * <lc-spinner size="lg" message="Loading data..." />
 * ```
 */
@Component({
  selector: 'lc-spinner',
  standalone: true,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.lc-spinner--inline]': "size() === 'xs'" },
})
export class SpinnerComponent {
  /**
   * Size of the spinner. `xs` (3.42): 16 px, inline (`display: inline-flex`,
   * `vertical-align: middle`), no padding, for a list row, a tab or a
   * button-sized slot; a `message` sits beside it.
   * @default 'md'
   */
  readonly size = input<SpinnerSize>('md');

  /**
   * Optional loading message displayed below the spinner
   */
  readonly message = input<string>();

  /** Screen-reader text while no visible `message` is set. */
  readonly loadingLabel = input('Loading');

  protected readonly hostClasses = computed(() => `spinner spinner--${this.size()}`);
}
