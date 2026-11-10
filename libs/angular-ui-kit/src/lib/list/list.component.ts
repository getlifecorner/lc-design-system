import {
  AfterRenderRef,
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Injector,
  input,
  computed,
  contentChild,
  effect,
  inject,
  isDevMode,
  output,
  viewChild,
  afterNextRender,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent, ɵprovideKitIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_CHEVRON_RIGHT } from '@lifecorner/angular-ui-kit/icons';
import { ButtonComponent, ButtonSize, ButtonVariant } from '@lifecorner/angular-ui-kit/button';
import { ListItemTemplateDirective } from './list-item-template.directive';
import type { AvatarColor } from '@lifecorner/angular-ui-kit/avatar';

/** Counter for generated row ids: they follow creation order, so prerendered HTML is the same in every build. */
let nextListId = 0;

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
   * Accessible name of the row's control (3.39): the `<a>` of an `href` row,
   * the `role="button"` row, or the split row's native button (a `clickable`
   * row with an `action`). Include all the row's visible text in order (WCAG
   * 2.5.3; axe `label-content-name-mismatch`), e.g. „Zu Lücken, 3 offen“ for
   * a row that shows „Lücken“ and „3 offen“. Ignored on rows that are neither
   * `href` nor `clickable` (a dev warning). Unset, the row's text names it;
   * a split row then reads its parts joined by „, “ (label, subtitle,
   * description, badge, metadata), without the action's name.
   */
  ariaLabel?: string;
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
  /**
   * Whether the item is the current choice: a tinted row and, since 3.33,
   * `aria-current="true"` on the row element (the button with `clickable`,
   * the link with `href`, the row otherwise). Pair it with a visible mark such
   * as a badge; the tint alone is colour.
   */
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
 * The part of a row that `focusItem()` focuses (3.34): `row`, the row's
 * button (`clickable`) or link (`href`), or `action`, its built-in action
 * button.
 */
export type ListItemPart = 'row' | 'action';

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
 * - `focusItem(id, part)` (3.34): moves the focus to a row's button or link,
 *   or to its action, e.g. when the sheet that action opened closes
 *   (WCAG 2.4.3)
 * - `showChevron` (3.36): a decorative chevron at the end of every
 *   `clickable` or `href` row
 * - 3.37: a `clickable` row with an `action` holds a native button stretched
 *   over the row (named by the row) beside its action, so no control sits
 *   inside another (WCAG 4.1.2); one Tab stop for the row, then the action
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
  viewProviders: [ɵprovideKitIcons([ICON_CHEVRON_RIGHT])],
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

  /**
   * Ends every row that opens something, a `clickable` row or an `href` row,
   * with the kit's `chevron-right` (20 px, `--color-text-tertiary`) after its
   * badge, metadata and action (3.36, quellen row 3). Decorative: hidden from
   * screen readers. Plain rows get none, and neither do rows drawn by an
   * `lcListItem` template (add the icon to the template there). Row height,
   * target size, focus ring, badge and `actionClick` don't change.
   * @default false
   */
  showChevron = input<boolean>(false);

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

  private readonly injector = inject(Injector);

  /** The `role="list"` element; each item renders exactly one child of it. */
  private readonly listEl = viewChild<ElementRef<HTMLElement>>('listEl');

  /** The `focusItem()` hook waiting for the next render. */
  private pendingItemFocus?: AfterRenderRef;

  constructor() {
    effect(() => {
      if (!isDevMode()) return;
      // `items` may be bound to undefined (tolerated since 3.2).
      for (const item of this.items() ?? []) {
        if (this.isLinkRow(item) && item.action) {
          console.warn(`[lc-list] item "${item.label}" has href and action: the action is not rendered inside a link`);
        }
        // 3.39 (request 059, AC-16): a plain row has no control to name.
        if (this.ariaLabelOf(item) && !item.href && !this.clickable()) {
          console.warn(`lc-list: ariaLabel names only href or clickable rows; "${item.label}" is neither.`);
        }
      }
    });
  }

  /**
   * Moves the focus into the row of the first item with this `id` after the
   * next render (3.34). `'row'`: the row's button (`clickable`) or link
   * (`href`). `'action'`: its built-in action button. Does nothing for an
   * unknown `id`, for a row without that part (a plain row, a disabled row for
   * `'row'`, no `action`, an `lcListItem` template's own controls), or when
   * the list is destroyed first. A second call before that render replaces the
   * first.
   * @param id The `ListItem.id` of the row.
   * @param part Which part of the row gets the focus.
   */
  focusItem(id: string, part: ListItemPart = 'row'): void {
    this.pendingItemFocus?.destroy();
    this.pendingItemFocus = afterNextRender(
      () => {
        this.pendingItemFocus = undefined;
        const index = (this.items() ?? []).findIndex((item) => item.id === id);
        const row = index < 0 ? null : this.listEl()?.nativeElement.children.item(index);
        // querySelector skips the row element itself, so a plain row matches nothing.
        const target = row?.querySelector<HTMLElement>(
          part === 'action'
            ? '.lc-list__action-area button'
            : 'a.lc-list__item, .lc-list__item[role=button]:not([aria-disabled=true]), .lc-list__item-button:not([aria-disabled=true])',
        );
        target?.focus();
      },
      { injector: this.injector },
    );
  }

  /** Generated id prefix, taken once per instance (module counter, the same in every prerender). */
  private readonly uid = `lc-list-${nextListId++}`;

  /**
   * Id of row `index` of a `clickable` row with an `action` (3.37). Since
   * 3.39 the row's button is named by `aria-label` (`splitRowName`), not by
   * this id; the id stays on the row.
   */
  protected rowId(index: number): string {
    return `${this.uid}-row-${index}`;
  }

  /** The item's `ariaLabel`, trimmed; null (no attribute) when unset or blank (3.39). */
  protected ariaLabelOf(item: ListItem): string | null {
    return typeof item.ariaLabel === 'string' ? item.ariaLabel.trim() || null : null;
  }

  /**
   * The space each text part of a row starts with when the row has an
   * `ariaLabel` (3.39, AC-14): it gives the row's visible text word breaks
   * („Lücken 3 offen“), so a name that holds that text passes axe
   * `label-content-name-mismatch` (WCAG 2.5.3). It starts a flex item's line
   * and renders nothing. `''` without `ariaLabel`: the text is that of 3.38.
   */
  protected wordBreak(item: ListItem): string {
    return this.ariaLabelOf(item) ? ' ' : '';
  }

  /**
   * Name of a split row's button (3.39, AC-14, folds 057-n5): `ariaLabel`, or
   * the row's text parts joined by „, “, so they don't run together and the
   * action (its own control) is not part of it.
   */
  protected splitRowName(item: ListItem): string {
    return (
      this.ariaLabelOf(item) ??
      [item.label, item.subtitle, item.description, item.badge, item.metadata]
        .map((part) => (typeof part === 'string' ? part.trim() : ''))
        .filter(Boolean)
        .join(', ')
    );
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
