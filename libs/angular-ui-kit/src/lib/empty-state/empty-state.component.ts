import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { IconComponent } from '@lifecorner/angular-ui-kit/icon';

export type EmptyStateSize = 'sm' | 'md' | 'lg';

/** Heading level of `lc-empty-state`'s heading (3.3, G-9). */
export type EmptyStateHeadingLevel = 2 | 3 | 4 | 5 | 6;

/**
 * Look of `lc-empty-state`'s icon (3.15).
 * - `neutral`: the bare 40 px icon in `--color-text-tertiary`
 * - `primary`: a 24 px icon in `--color-primary-700` on a 48 px
 *   `--color-primary-100` circle
 */
export type EmptyStateIconTone = 'neutral' | 'primary';

/**
 * Text scale of `lc-empty-state` (3.15), beside `size` (the padding).
 * - `sm`: 14 px message
 * - `md`: the state-page scale — 16/24 px message, 20 px heading, 16 px below
 *   the icon and 24 px before the projected action
 */
export type EmptyStateMessageSize = 'sm' | 'md';

/**
 * Empty state component for "no data" placeholder displays.
 *
 * Features:
 * - Compact (sm) and page-level (md, lg) size modes
 * - Optional icon from Tabler Icons library
 * - Heading and description text
 * - Action slot for projected CTA buttons
 * - Centered layout with visual hierarchy
 *
 * @example
 * ```html
 * <lc-empty-state
 *   icon="chart-bar"
 *   heading="No Data"
 *   message="No items found.">
 *   <lc-button variant="primary">Get Started</lc-button>
 * </lc-empty-state>
 * ```
 */
@Component({
  selector: 'lc-empty-state',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  /**
   * Size variant
   * - `sm`: compact inline (inside cards), no padding
   * - `md`: standard centered block (default)
   * - `lg`: large page-level with extra padding
   * @default 'md'
   */
  readonly size = input<EmptyStateSize>('md');

  /**
    * Tabler icon name to display above the heading
   */
  readonly icon = input<string>();

  /**
   * Bold heading text
   */
  readonly heading = input<string>();

  /**
   * Heading level of `heading` (`h2`–`h6`), so the empty state fits the
   * page's outline. Semantics only, the look stays the same.
   * @default 3
   */
  readonly headingLevel = input<EmptyStateHeadingLevel>(3);

  /**
   * Description text
   */
  readonly message = input<string>();

  /**
   * `'neutral'`: the bare 40 px icon in `--color-text-tertiary`. `'primary'`:
   * a 24 px icon in `--color-primary-700` on a 48 px `--color-primary-100`
   * circle. Decorative in both tones.
   * @default 'neutral'
   */
  readonly iconTone = input<EmptyStateIconTone>('neutral');

  /**
   * `'sm'`: 14 px message. `'md'`, for a state page: 16/24 px message, 20 px
   * heading, 16 px below the icon and 24 px before the projected action.
   * Wrap several actions in one row element.
   * @default 'sm'
   */
  readonly messageSize = input<EmptyStateMessageSize>('sm');

  protected readonly hostClasses = computed(() => {
    const classes = ['empty-state', `empty-state--${this.size()}`];
    if (this.iconTone() === 'primary') classes.push('empty-state--tone-primary');
    if (this.messageSize() === 'md') classes.push('empty-state--message-md');
    return classes.join(' ');
  });
}
