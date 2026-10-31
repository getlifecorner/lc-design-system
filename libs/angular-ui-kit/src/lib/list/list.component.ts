import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  contentChild,
  effect,
  isDevMode,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '@lifecorner/angular-ui-kit/icon';
import { ButtonComponent, ButtonSize, ButtonVariant } from '@lifecorner/angular-ui-kit/button';
import { ListItemTemplateDirective } from './list-item-template.directive';
import type { AvatarColor } from '@lifecorner/angular-ui-kit/avatar';

/**
 * List orientation type
 */
export type ListOrientation = 'vertical' | 'horizontal';

/**
 * List visual variant
 *  - default: flat rows (original)
 *  - card: each item rendered as a mini-card with border, radius and shadow on hover
 */
export type ListVariant = 'default' | 'card';

/**
 * List item interface
 */
export interface ListItem {
  /** Item label text (primary line) */
  label: string;
  /** Secondary text shown below the label */
  subtitle?: string;
  /** Description text shown below subtitle (third line) */
  description?: string;
  /** Optional icon identifier */
  icon?: string;
  /** Avatar URL or initials (renders a circular avatar instead of icon) */
  avatar?: string;
  /**
   * Background of avatar initials: `default` or a member colour `member-1` …
   * `member-6` with white initials (as `lc-avatar`'s `color`).
   */
  avatarColor?: AvatarColor;
  /** Badge text (e.g. count, status label) shown on the trailing side */
  badge?: string;
  /** Badge color variant */
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  /** Metadata text shown on the trailing side (e.g. date, size) */
  metadata?: string;
  /** Optional action label */
  action?: string;
  /**
   * Accessible name of this row's action when the visible label repeats on
   * every row (e.g. „Entfernen“ → „iPhone · Safari entfernen“). The visible
   * label must be part of it (WCAG 2.5.3).
   */
  actionAriaLabel?: string;
  /**
   * URL of the row link (3.16, TD-4). The row renders as an `<a>` over its
   * full area (at least 44 px high) with real link semantics (middle click,
   * "open in new tab"). Not rendered with `href`: `action` (no control inside
   * a link; a dev warning). Not emitted: `itemClick` (see `linkClick`). With
   * `disabled` the row is the plain disabled row, no link. A custom
   * `lcListItem` template must not hold controls in `href` rows.
   */
  href?: string;
  /** Item identifier */
  id?: string;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether the item is selected / highlighted */
  selected?: boolean;
  /** Any additional data */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * List item size
 */
export type ListSize = 'sm' | 'md' | 'lg';

/**
 * A plain click (or Enter) on an `href` row (3.16, TD-4): `item` is the row,
 * `event` the click. Call `event.preventDefault()` to navigate with your
 * router instead of a full page load.
 */
export interface ListLinkClickEvent {
  item: ListItem;
  event: MouseEvent;
}

/**
 * List component for displaying structured item collections.
 *
 * Features:
 * - Vertical and horizontal layout orientations
 * - Variant styles (default, bordered, card)
 * - Optional dividers between items
 * - Icon and avatar support per item
 * - Action buttons with click events
 * - Accessible with ARIA list role; `clickable` rows are keyboard-operable
 * - `ListItem.href` rows are real links over the full row (3.16, TD-4);
 *   `linkClick` hands plain clicks to your router
 *
 * @example
 * ```html
 * <lc-list
 *   [items]="listItems"
 *   orientation="vertical"
 *   [showDividers]="true"
 *   (itemClick)="handleItemClick($event)"
 * />
 * ```
 */
@Component({
  selector: 'lc-list',
  standalone: true,
  imports: [NgTemplateOutlet, IconComponent, ButtonComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  /** Custom item template provided via lcListItem directive */
  readonly itemTemplate = contentChild(ListItemTemplateDirective);

  /** Array of list items to display */
  items = input<ListItem[]>([]);

  /** Orientation of the list */
  orientation = input<ListOrientation>('vertical');

  /** Visual variant */
  variant = input<ListVariant>('default');

  /** Size of list items */
  size = input<ListSize>('md');

  /** Whether to show dividers between items */
  showDividers = input<boolean>(false);

  /**
   * Whether rows are interactive. When set, each row is rendered as a
   * focusable button (Enter / Space emit `itemClick`) so `itemClick` is
   * reachable from the keyboard. Set this whenever you handle `itemClick`.
   */
  clickable = input<boolean>(false);

  /**
   * Clamp each item's `description` to two lines (3.2). Set `false` for
   * reading text that must show in full (3.3, G-11).
   * @default true
   */
  clampDescription = input<boolean>(true);

  /**
   * Variant of the built-in row action (`ListItem.action`).
   * @default 'ghost'
   */
  actionVariant = input<ButtonVariant>('ghost');

  /**
   * Size of the built-in row action: `xs` (3.2, about 25 px) … `lg` (48.5 px,
   * the 44 px touch target).
   * @default 'xs'
   */
  actionSize = input<ButtonSize>('xs');

  /** Event emitted when an item is clicked */
  readonly itemClick = output<ListItem>();

  /** Event emitted when an action button is clicked */
  readonly actionClick = output<ListItem>();

  /**
   * A plain click (or Enter) on an `href` row: primary button, no
   * Ctrl/Cmd/Shift/Alt (3.16, TD-4). Emitted before the browser follows the
   * link; call `event.preventDefault()` and navigate with your router for an
   * in-app route (`router.navigateByUrl(item.href)`). The kit never prevents
   * the default; modifier and middle clicks are never emitted, so "open in new
   * tab" keeps working.
   */
  readonly linkClick = output<ListLinkClickEvent>();

  constructor() {
    effect(() => {
      if (!isDevMode()) return;
      // `items` may be bound to undefined (tolerated since 3.2).
      for (const item of this.items() ?? []) {
        if (this.isLinkRow(item) && item.action) {
          console.warn(`[lc-list] item "${item.label}" has href and action: the action is not rendered inside a link`);
        }
      }
    });
  }

  /** Whether a row renders as a link: `href` set and not disabled. */
  protected isLinkRow(item: ListItem): boolean {
    return !!item.href && !item.disabled;
  }

  /**
   * Computed CSS classes for the list
   */
  listClasses = computed(() => {
    const classes = ['lc-list'];

    classes.push(`lc-list--${this.orientation()}`);
    classes.push(`lc-list--${this.variant()}`);
    classes.push(`lc-list--${this.size()}`);

    if (this.showDividers()) {
      classes.push('lc-list--with-dividers');
    }

    if (this.clickable()) {
      classes.push('lc-list--clickable');
    }

    if (!this.clampDescription()) {
      classes.push('lc-list--no-clamp');
    }

    return classes.join(' ');
  });

  /**
   * Get CSS classes for a list item
   */
  getItemClasses(item: ListItem): string {
    const classes = ['lc-list__item'];

    if (item.disabled) {
      classes.push('lc-list__item--disabled');
    }

    if (item.selected) {
      classes.push('lc-list__item--selected');
    }

    return classes.join(' ');
  }

  /** CSS classes of an item's avatar (member colour, LK-7). */
  protected avatarClasses(item: ListItem): string {
    const color = item.avatarColor;
    return color && color !== 'default'
      ? `lc-list__avatar lc-list__avatar--member lc-list__avatar--${color}`
      : 'lc-list__avatar';
  }

  /**
   * Handle item click
   */
  onItemClick(item: ListItem): void {
    if (!item.disabled) {
      this.itemClick.emit(item);
    }
  }

  /**
   * Keyboard activation of a clickable row. Only reacts to keys on the row
   * itself: a nested control (e.g. the action button) handles its own Enter.
   */
  onItemKeydown(event: KeyboardEvent, item: ListItem): void {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onItemClick(item);
    }
  }

  /**
   * Handle action button click
   */
  onActionClick(item: ListItem): void {
    this.actionClick.emit(item);
  }

  /**
   * A click on a link row: only a plain primary click reaches `linkClick`.
   * The default (following the link) is left to the browser and the consumer.
   */
  protected onLinkClick(event: MouseEvent, item: ListItem): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    this.linkClick.emit({ item, event });
  }
}
