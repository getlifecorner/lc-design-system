import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type SkeletonVariant = 'line' | 'circle' | 'rect';

/** Per-variant defaults: width (on the host), height and border radius (on the fill). */
const SKELETON_DEFAULTS: Record<SkeletonVariant, { w: string; h: string; r: string }> = {
  line: { w: '100%', h: '0.875rem', r: '0.25rem' },
  circle: { w: '40px', h: '40px', r: '50%' },
  rect: { w: '100%', h: '100px', r: '0.5rem' },
};

/**
 * Skeleton loader component for placeholder loading states.
 *
 * Features:
 * - Variant shapes (text, rect, circle)
 * - Shimmer animation effect; a static fill under `prefers-reduced-motion`
 * - Colours from `--color-skeleton` / `--color-skeleton-highlight`, overridable
 *   with the `--lc-skeleton-bg` / `--lc-skeleton-highlight` hooks
 * - Custom width, height, and border radius
 * - `--lc-skeleton-height` hook: the height from CSS (a container query, `cqi`),
 *   winning over the `height` input; set it on the `lc-skeleton` element (on a
 *   wrapper it reaches every skeleton inside)
 * - Composable for building complex loading layouts
 * - Dark mode compatible
 *
 * @example
 * ```html
 * <lc-skeleton />
 * <lc-skeleton variant="circle" width="40px" height="40px" />
 * <lc-skeleton variant="rect" width="100%" height="400px" />
 * ```
 */
@Component({
  selector: 'lc-skeleton',
  standalone: true,
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // The host takes the width once, so the skeleton sizes correctly inside
    // flex layouts and never shrinks below it; the fill spans it (3.22.2:
    // before, the fill took the width again, so a percentage applied twice).
    '[style.width]': 'hostWidth()',
    '[style.flex-shrink]': '"0"',
  },
})
export class SkeletonComponent {
  /**
   * Shape variant.
   * @default 'line'
   */
  readonly variant = input<SkeletonVariant>('line');

  /**
   * Width (CSS value), applied once, to the host: a percentage is a share of the
   * containing block and the fill always spans the host (since 3.22.2; before, a
   * percentage applied twice, so `30%` drew 9 %).
   * @default '100%' for line and rect, '40px' for circle
   */
  readonly width = input<string>();

  /**
   * Height (CSS value). Defaults to '0.875rem' for line, '40px' for circle, '100px' for rect.
   * The `--lc-skeleton-height` custom property, when set, wins over it.
   * @default '0.875rem' for line, '40px' for circle, '100px' for rect
   */
  readonly height = input<string>();

  /**
   * Border radius override (CSS value).
   * @default '0.25rem' for line, '50%' for circle, '0.5rem' for rect
   */
  readonly borderRadius = input<string>();

  protected readonly variantClass = computed(() => `lc-skeleton--${this.variant()}`);

  private readonly defaults = computed(() => SKELETON_DEFAULTS[this.variant()]);

  /** The fill's inline styles: it always spans the host, which holds the width. */
  protected readonly styles = computed(() => {
    const d = this.defaults();
    return {
      width: '100%',
      height: this.height() ?? d.h,
      'border-radius': this.borderRadius() ?? d.r,
    };
  });

  protected readonly hostWidth = computed(() => this.width() ?? this.defaults().w);
}
