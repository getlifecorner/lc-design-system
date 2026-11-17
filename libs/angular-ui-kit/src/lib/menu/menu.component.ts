import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  untracked,
  afterNextRender,
  afterRenderEffect,
  viewChildren,
  ChangeDetectionStrategy,
  HostListener,
  ElementRef,
  Injector,
  Renderer2,
  OnDestroy,
  inject,
} from '@angular/core';
import { IconComponent, ɵprovideKitIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_CHECK } from '@lifecorner/angular-ui-kit/icons';
import { OverlayStackService } from '@lifecorner/angular-ui-kit/internal/overlay';

/**
 * Kind of a menu item (3.45, usm-x row 31): an action (`item`), or a
 * `checkbox` / `radio` that the app keeps `checked`.
 */
export type MenuItemType = 'item' | 'checkbox' | 'radio';

/** Payload of `itemToggle` (3.45): the item and its new state. */
export interface MenuItemToggleEvent {
  item: MenuItem;
  checked: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  variant?: 'default' | 'danger';
  dividerAfter?: boolean;
  disabled?: boolean;
  metadata?: {
    subtitle?: string;
    badge?: string;
  };
  /**
   * Makes the item a section (3.43, usm-x row 12). Its `label` is a heading
   * that cannot be focused or activated, and `children` are its items, in a
   * group named by the heading. One level: `children` of a member are
   * ignored. On a section, `icon`, `href`, `variant`, `disabled` and
   * `metadata` are ignored, and `dividerAfter` draws the divider after the
   * whole group.
   */
  children?: MenuItem[];
  /**
   * Indents the section's items by one step (md 16, sm 12, lg 20 px). Only
   * on a section (3.43).
   * @default false
   */
  indentChildren?: boolean;
  /**
   * 3.45 (usm-x row 31): `checkbox` or `radio` makes the item a
   * `menuitemcheckbox` / `menuitemradio` with `aria-checked` and a check mark
   * (or a dot) at its start; every item of such a menu gets that slot, so the
   * labels share an edge. Activating it (click, Enter, Space) emits
   * `itemToggle`, not `itemClick`, and the menu stays open with the focus on
   * the item. Controlled: the app sets `checked`. An item with `href` is
   * always a link.
   * @default 'item'
   */
  type?: MenuItemType;
  /**
   * State of a `checkbox` / `radio` item (3.45).
   * @default false
   */
  checked?: boolean;
  /**
   * Radio set of a `radio` item (3.45): items with the same name in one menu
   * are exclusive. The menu emits only the item that becomes checked; the app
   * sets it `checked` and the others of the set unchecked. Put a set in a
   * section, so it is a `role="group"` named by the heading.
   * @default ''
   */
  radioGroup?: string;
  /**
   * 3.45: `true` makes the menu emit `closed` after the item acts. Unset:
   * plain items as before (the app's `itemClick` closes the menu), toggles
   * keep it open.
   */
  closeOnSelect?: boolean;
}

/** Natively focusable elements a projected trigger may be or contain. */
const INTERACTIVE_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]';

/**
 * Menu Component - Dropdown menu for navigation and actions
 *
 * Features:
 * - Customizable menu items with icons
 * - Support for links and buttons
 * - Dividers between menu sections
 * - 3.43: sections with a heading (`MenuItem.children`), a `role="group"`
 *   named by the heading; the arrow keys run over the items of every section
 * - Optional subtitle/metadata for items
 * - Danger variant for destructive actions
 * - Click outside to close (top-most overlay only)
 * - Keyboard navigation: focus moves into the menu on open, Arrow keys /
 *   Home / End move between items (roving tabindex), Enter / Space activate,
 *   Escape closes and returns focus to the trigger, Tab closes
 * - ARIA menu semantics (`aria-haspopup` / `aria-expanded` / `aria-controls`
 *   on the projected trigger, `role="menu"` / `role="menuitem"` on the panel)
 * - OnPush change detection for performance
 *
 * @example
 * ```html
 * <lc-menu
 *   [items]="menuItems"
 *   [isOpen]="isMenuOpen"
 *   (itemClick)="handleMenuClick($event)"
 *   (closed)="isMenuOpen = false"
 * >
 *   <button trigger>Open Menu</button>
 *   <div header>User Profile</div>
 * </lc-menu>
 * ```
 */
@Component({
  selector: 'lc-menu',
  standalone: true,
  imports: [IconComponent],
  viewProviders: [ɵprovideKitIcons([ICON_CHECK])],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnDestroy {
  private static nextId = 0;
  /** Identifies this instance in the overlay stack. */
  private readonly menuId = `lc-menu-${++MenuComponent.nextId}`;

  readonly items = input<MenuItem[]>([]);
  readonly isOpen = input(false);
  readonly position = input<'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'>('bottom-right');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly minWidth = input('220px');
  /**
   * Maximum width of the panel (any CSS width, e.g. `min(18rem, calc(100vw - 2rem))`).
   * Empty leaves it unbounded. Long item labels and header lines wrap within it.
   */
  readonly maxWidth = input('');

  readonly itemClick = output<MenuItem>();
  readonly closed = output<void>();
  /**
   * A `checkbox` / `radio` item was activated (3.45, usm-x row 31): the item
   * and its new `checked` state. A radio emits only when it becomes checked.
   * `itemClick` is not emitted for these items.
   */
  readonly itemToggle = output<MenuItemToggleEvent>();

  /** Id of the `role="menu"` element, referenced by the trigger's `aria-controls`. */
  protected readonly panelId = `${this.menuId}-panel`;

  /**
   * The items that act, in visual order (3.43): top-level items, and in place
   * of a section its members. Section headings are not in it.
   */
  protected readonly actions = computed(() =>
    this.items().flatMap((item) => (item.children ? item.children : [item]))
  );

  /** Position of each acting item in {@link actions}. */
  private readonly actionIndex = computed(() => new Map(this.actions().map((item, i) => [item, i])));

  /** Whether any item is a checkbox or radio (3.45): every item then gets the indicator slot. */
  protected readonly hasToggles = computed(() => this.actions().some((item) => this.isToggle(item)));

  /** Index (into `actions()`) of the item that currently owns the roving tabindex. */
  protected readonly activeIndex = signal(-1);

  private readonly itemElements = viewChildren<ElementRef<HTMLElement>>('menuItem');
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly injector = inject(Injector);
  private readonly overlayStack = inject(OverlayStackService);

  constructor() {
    // Whether the menu has been through its first open-state evaluation; a menu
    // that is already open when it renders (demo pages) must not steal focus.
    let initialized = false;
    effect(() => {
      const open = this.isOpen();
      untracked(() => {
        if (open) {
          this.overlayStack.push(this.menuId);
          this.activeIndex.set(this.firstEnabledIndex());
          // Move focus into the menu once the panel has rendered
          if (initialized) {
            afterNextRender(() => this.focusActiveItem(), { injector: this.injector });
          }
        } else {
          this.overlayStack.remove(this.menuId);
          this.restoreFocus();
          this.activeIndex.set(-1);
        }
        initialized = true;
      });
    });

    // Mirror the open state onto the projected trigger so assistive tech knows
    // it opens a menu (the trigger is caller-supplied, so we set the
    // attributes rather than bind them).
    afterRenderEffect(() => {
      const open = this.isOpen();
      const trigger = this.triggerElement();
      if (!trigger) return;
      this.renderer.setAttribute(trigger, 'aria-haspopup', 'menu');
      this.renderer.setAttribute(trigger, 'aria-expanded', String(open));
      if (open) {
        this.renderer.setAttribute(trigger, 'aria-controls', this.panelId);
      } else {
        this.renderer.removeAttribute(trigger, 'aria-controls');
      }
    });
  }

  ngOnDestroy(): void {
    this.overlayStack.remove(this.menuId);
  }

  /**
   * Handle menu item click
   */
  onItemClick(item: MenuItem, event: Event): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    // Links navigate natively; button items only emit
    if (!item.href) {
      event.preventDefault();
    }

    this.itemClick.emit(item);
    if (item.closeOnSelect === true) this.close();
  }

  /** Whether an item renders as a `menuitemcheckbox` / `menuitemradio` (3.45; links never do). */
  protected isToggle(item: MenuItem): boolean {
    return !item.href && !item.children && (item.type === 'checkbox' || item.type === 'radio');
  }

  /**
   * A checkbox / radio item was activated (3.45): emit its new state, keep the
   * focus on it (the app re-renders it by `id`), and close only with
   * `closeOnSelect: true`.
   */
  protected onToggleClick(item: MenuItem, event: Event): void {
    event.preventDefault();
    if (item.disabled) return;
    const index = this.indexOf(item);
    if (index >= 0) this.activeIndex.set(index);
    if (item.type === 'radio') {
      if (!item.checked) this.itemToggle.emit({ item, checked: true });
    } else {
      this.itemToggle.emit({ item, checked: !item.checked });
    }
    if (item.closeOnSelect === true) this.close();
  }

  /**
   * Close the menu
   */
  close(): void {
    this.closed.emit();
  }

  /**
   * Handle click outside to close menu — only while the menu is the top-most
   * overlay, so a click inside a layer above it (a modal opened from a menu
   * item) is left alone.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) {
      return;
    }

    const target = event.target;
    if (target instanceof Node && this.elementRef.nativeElement.contains(target)) {
      return;
    }
    if (!this.overlayStack.claim(this.menuId, event)) return;
    this.close();
  }

  /**
   * Escape closes the menu (top-most overlay only) and returns focus to the
   * trigger; the event is consumed so overlays underneath stay open.
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event): void {
    if (!this.isOpen()) return;
    if (!this.overlayStack.claim(this.menuId, event)) return;
    event.stopPropagation();
    this.triggerElement()?.focus();
    this.close();
  }

  /** Keyboard navigation inside the `role="menu"` panel. */
  protected onPanelKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusIndex(this.nextEnabledIndex(this.activeIndex(), 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusIndex(this.nextEnabledIndex(this.activeIndex(), -1));
        break;
      case 'Home':
        event.preventDefault();
        this.focusIndex(this.firstEnabledIndex());
        break;
      case 'End':
        event.preventDefault();
        this.focusIndex(this.nextEnabledIndex(0, -1));
        break;
      case ' ': {
        // Buttons activate on Space natively, links only on Enter
        const target = event.target as HTMLElement | null;
        if (target?.matches('a[role="menuitem"]')) {
          event.preventDefault();
          target.click();
        }
        break;
      }
      case 'Tab':
        // Focus leaves the menu — let it move on naturally, but close the menu
        this.close();
        break;
    }
  }

  /** Roving tabindex: only the active item is in the tab sequence. */
  protected tabindexFor(index: number, item: MenuItem): number {
    return !item.disabled && index === this.activeIndex() ? 0 : -1;
  }

  /** Index of an acting item in {@link actions} (its index in `items()` in a flat menu). */
  protected indexOf(item: MenuItem): number {
    return this.actionIndex().get(item) ?? -1;
  }

  /** Id of the heading of the section at `index` in `items()` (3.43). */
  protected headingId(index: number): string {
    return `${this.panelId}-section-${index}`;
  }

  private focusIndex(index: number): void {
    if (index < 0) return;
    this.activeIndex.set(index);
    this.focusActiveItem();
  }

  private focusActiveItem(): void {
    this.itemElements()[this.activeIndex()]?.nativeElement.focus();
  }

  private firstEnabledIndex(): number {
    return this.actions().findIndex((item) => !item.disabled);
  }

  /** Index of the next enabled item in `direction`, wrapping around; -1 if none. */
  private nextEnabledIndex(from: number, direction: 1 | -1): number {
    const items = this.actions();
    for (let step = 1; step <= items.length; step++) {
      const index = (from + direction * step + items.length) % items.length;
      if (!items[index]?.disabled) return index;
    }
    return -1;
  }

  /**
   * The element that carries the menu-button ARIA attributes and receives
   * focus back: the projected `[trigger]` node itself when it is natively
   * interactive, otherwise the first interactive element inside it (e.g. the
   * `<button>` inside an `<lc-button trigger>`).
   */
  private triggerElement(): HTMLElement | null {
    const slot = this.elementRef.nativeElement.querySelector<HTMLElement>('.lc-menu__trigger [trigger]');
    if (!slot) return null;
    return slot.matches(INTERACTIVE_SELECTOR)
      ? slot
      : (slot.querySelector<HTMLElement>(INTERACTIVE_SELECTOR) ?? slot);
  }

  /**
   * Closing removes the panel from the DOM; if focus is inside it (an item was
   * activated by keyboard) it would silently drop to `<body>`, so send it back
   * to the trigger.
   */
  private restoreFocus(): void {
    if (typeof document === 'undefined') return;
    const panel = this.elementRef.nativeElement.querySelector<HTMLElement>('.lc-menu__dropdown');
    if (panel?.contains(document.activeElement)) {
      this.triggerElement()?.focus();
    }
  }
}
