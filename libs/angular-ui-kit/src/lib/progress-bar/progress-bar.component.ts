import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
} from '@angular/core';

export type ProgressBarColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ProgressBarSize = 'xs' | 'sm' | 'md' | 'lg';
export type ProgressBarVariant = 'linear' | 'circular';

/**
 * Progress bar component for displaying completion status.
 *
 * Features:
 * - Linear and circular progress variants
 * - Color theme options (primary, secondary, success, warning, error)
 * - Multiple size presets (xs, sm, md, lg)
 * - Animated value transitions
 * - Accessible with ARIA progressbar role
 *
 * The bar is a visual aid; the text next to it carries the meaning. Write the
 * status as text ('USM wird geladen …') and announce changes from a live
 * region (`role="status"`). Screen readers don't announce a progress bar's
 * changes by themselves. Give `ariaLabel` the same words as the status. Under
 * `forced-colors: active` the fill is `Highlight`, the linear track gets a
 * 1 px `CanvasText` outline and the circle's track is `GrayText` (3.17).
 *
 * @example
 * ```html
 * <lc-progress-bar [value]="75" color="primary" size="md"></lc-progress-bar>
 * <lc-progress-bar [value]="50" variant="circular" color="success"></lc-progress-bar>
 *
 * <!-- thin bar inside a list row: fixed width, flows with the line -->
 * <lc-progress-bar [value]="60" size="sm" [inline]="true"
 *                  style="--lc-progress-bar-height: 6px"></lc-progress-bar>
 * ```
 */
@Component({
  selector: 'lc-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.lc-progress-bar--inline]': 'inline()',
  },
})
export class ProgressBarComponent {
  /**
   * Progress value between 0 and 100.
   * @default 0
   */
  value = input<number>(0);

  /**
   * Color theme.
   * @default 'primary'
   */
  color = input<ProgressBarColor>('primary');

  /**
   * Height/thickness of the bar.
   * @default 'md'
   */
  size = input<ProgressBarSize>('md');

  /**
   * Visual variant.
   * @default 'linear'
   */
  variant = input<ProgressBarVariant>('linear');

  /**
   * Whether to show the percentage label.
   * @default false
   */
  showLabel = input<boolean>(false);

  /**
   * Inline mode for list rows: the bar flows with the surrounding line at a
   * fixed width instead of filling its container. Width is settable via
   * `--lc-progress-bar-inline-width` (default 5rem), the track height via
   * `--lc-progress-bar-height` (e.g. 6px), which also works in block mode.
   * @default false
   */
  inline = input<boolean>(false);

  /**
   * Progress of unknown length: no value (`aria-valuenow` is absent) and no
   * label. The linear bar moves a 40 % segment across the track, and the
   * circle spins. Under `prefers-reduced-motion: reduce` nothing moves: the
   * linear bar shows a full-width striped fill and the circle a dashed ring,
   * so it still reads as busy, not as a value (3.17).
   * @default false
   */
  indeterminate = input<boolean>(false);

  /**
   * Accessible label for screen readers.
   */
  ariaLabel = input<string>('Progress');

  protected clampedValue = computed(() => Math.max(0, Math.min(100, this.value())));

  protected barClasses = computed(() => {
    return [
      'progress-bar',
      `progress-bar--${this.color()}`,
      `progress-bar--${this.size()}`,
      this.indeterminate() ? 'progress-bar--indeterminate' : '',
    ]
      .filter(Boolean)
      .join(' ');
  });

  // Circular variant helpers
  protected readonly circleRadius = 40;
  protected readonly circleCircumference = 2 * Math.PI * 40;

  protected strokeDashoffset = computed(() => {
    return this.circleCircumference * (1 - this.clampedValue() / 100);
  });
}
