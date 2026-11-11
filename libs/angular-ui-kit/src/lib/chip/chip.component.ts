import { Component, ChangeDetectionStrategy, booleanAttribute, input, output, computed } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '@lifecorner/angular-ui-kit/icon';

/**
 * Colour of a chip. 3.40 (G-HV4) adds `emphasis` (solid fill, white ink) and
 * `quiet` (transparent fill, thin border); inside `lc-hero` they follow the
 * band (emphasis: the band's dark stop; quiet: the band's ink), and every
 * other variant takes the light, opaque palette.
 */
export type ChipVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'emphasis' | 'quiet';
export type ChipSize = 'sm' | 'md' | 'lg';

/**
 * Chip component for displaying tags, filters, or selections.
 *
 * Features:
 * - Color variants (primary, secondary, success, warning, error, info, neutral)
 * - Multiple size options (sm, md, lg)
 * - Optional leading icon
 * - Removable with a labelled close button and `remove` event
 * - Clickable variant that renders as a button and emits `chipClick`;
 *   clickable + removable renders two sibling buttons (activate / remove) so
 *   no interactive control is ever nested in another
 * - Disabled state support
 * - `wrap` (3.40): a long label wraps onto centred lines (WCAG 1.4.10)
 * - In `lc-hero` (3.40): an on-band palette, opaque fills in both themes
 * - CSS hooks `--lc-chip-bg`, `--lc-chip-fg`, `--lc-chip-border` and
 *   `--lc-chip-gap`, set on the chip or any ancestor (since 3.40 an ancestor
 *   wins over the variant too)
 *
 * @example
 * ```html
 * <lc-chip variant="primary" [removable]="true" (remove)="onRemove()">
 *   Tag Name
 * </lc-chip>
 *
 * <lc-chip [clickable]="true" (chipClick)="onNavigate()">
 *   Linked item
 * </lc-chip>
 * ```
 */
@Component({
  selector: 'lc-chip',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet],
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {
  /**
   * Visual variant of the chip. `emphasis`: a solid fill with white ink (the
   * primary fill; in `lc-hero` the band's dark stop). `quiet`: a transparent
   * fill with a thin border and secondary ink (white on a band, dark on a light
   * hero). In `lc-hero` the other variants take the light palette with opaque
   * fills, in both themes.
   * @default 'default'
   */
  variant = input<ChipVariant>('default');

  /**
   * Size of the chip
   * @default 'md'
   */
  size = input<ChipSize>('md');

  /**
   * Icon name from Tabler Icons
   * @default undefined
   */
  icon = input<string>();

  /**
   * Whether the chip can be removed
   * @default false
   */
  removable = input<boolean>(false);

  /**
   * Accessible name of the remove button (`removable`).
   * @default 'Remove chip'
   */
  removeAriaLabel = input('Remove chip');

  /**
   * Whether the chip acts as a button (e.g. for navigation). Renders the chip
   * as a `<button type="button">` with hover / active / focus-visible states.
   * @default false
   */
  clickable = input<boolean>(false);

  /**
   * Whether the chip is disabled
   * @default false
   */
  disabled = input<boolean>(false);

  /**
   * Lets a long label wrap onto centred lines instead of overflowing its
   * container (WCAG 1.4.10 at 320 px and 200 % text). A one-line chip keeps
   * its height; the icon and the remove button stay on the first line.
   * @default false
   */
  wrap = input(false, { transform: booleanAttribute });

  /** Emitted when the chip is removed */
  readonly remove = output<void>();

  /** Emitted when a clickable chip is activated (click, Enter or Space). */
  readonly chipClick = output<void>();

  /**
   * Computed CSS classes for the chip
   */
  chipClasses = computed(() => {
    const classes = ['lc-chip'];

    classes.push(`lc-chip--${this.variant()}`);
    classes.push(`lc-chip--${this.size()}`);

    if (this.removable()) {
      classes.push('lc-chip--removable');
    }

    if (this.clickable()) {
      classes.push('lc-chip--clickable');
    }

    if (this.disabled()) {
      classes.push('lc-chip--disabled');
    }

    if (this.wrap()) {
      classes.push('lc-chip--wrap');
    }

    return classes.join(' ');
  });

  /**
   * Handle activation of a clickable chip
   */
  onChipClick(): void {
    if (!this.disabled()) {
      this.chipClick.emit();
    }
  }

  /**
   * Handle remove button click. The remove button is a real, labelled
   * `<button>` (Enter / Space work natively), so no extra key handling here.
   */
  onRemove(event: Event): void {
    event.stopPropagation();

    if (!this.disabled()) {
      this.remove.emit();
    }
  }
}
