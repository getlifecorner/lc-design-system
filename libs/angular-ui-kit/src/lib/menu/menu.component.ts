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
  viewChild,
  viewChildren,
  ChangeDetectionStrategy,
  HostListener,
  ElementRef,
  Injector,
  Renderer2,
  OnDestroy,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { OverlayModule, type ConnectedPosition } from '@angular/cdk/overlay';
import { IconComponent, ɵprovideKitIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_CHECK } from '@lifecorner/angular-ui-kit/icons';
import { OverlayStackService } from '@lifecorner/angular-ui-kit/internal/overlay';
import { openPanelLang } from '@lifecorner/angular-ui-kit/internal/a11y';
import { SpinnerComponent } from '@lifecorner/angular-ui-kit/spinner';
import { TooltipDirective } from '@lifecorner/angular-ui-kit/tooltip';

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
  /**
   * 3.48 (usm-x row 56): a kit tooltip on hover and keyboard focus of the item
   * (`aria-describedby` while it shows). A disabled item with a
   * `disabledReason` shows the reason instead.
   */
  tooltip?: string;
  /**
   * 3.48 (usm-x row 56): why a `disabled` item can't be used ("Öffnet … im
   * Rich Client"). The item then stays in the arrow-key order
   * (`aria-disabled="true"` instead of native `disabled`, activation is
   * ignored) and shows the reason as its tooltip on hover and focus. Without
   * it a disabled item is skipped as before.
   */
  disabledReason?: string;
  /**
   * 3.48 (usm-x row 57): a bold label, for the default member of a group.
   * Visual only: screen readers get no state for it, so put any meaning into
   * the label.
   */
  emphasis?: boolean;
  /**
   * 3.48 (usm-x row 68): a 20 px colour sample before the label (sm 16, lg 24
   * px), e.g. a theme in an appearance choice. Any CSS colour (or `var()`);
   * two colours draw the left and right halves. Decorative (`aria-hidden`):
   * the label carries the meaning.
   */
  swatch?: string | readonly [string, string];
}

/** 3.48 (usm-x row 53): a viewport point (`clientX` / `clientY`) the menu opens at. */
export interface MenuPoint {
  x: number;
  y: number;
}

/** 3.48 (usm-x row 53): where an overlay menu opens: at an element or at a viewport point. */
export type MenuAnchor = HTMLElement | MenuPoint;

/** Natively focusable elements a projected trigger may be or contain. */
const INTERACTIVE_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]';

/** Whether an anchor is an element (checked without `HTMLElement`, which the server lacks). */
function isAnchorElement(anchor: MenuAnchor): anchor is HTMLElement {
  return typeof (anchor as HTMLElement).nodeType === 'number';
}

type Horizontal = 'start' | 'end';
type Vertical = 'top' | 'bottom';

/** A panel below (`bottom`) or above (`top`) an element, aligned at its `h` edge. */
function besideElement(h: Horizontal, v: Vertical): ConnectedPosition {
  return { originX: h, originY: v, overlayX: h, overlayY: v === 'bottom' ? 'top' : 'bottom' };
}

/**
 * 3.48 (design §3A): the overlay positions of an element anchor per
 * `position`: the preferred pair, its vertical flip, then the other
 * horizontal alignment.
 */
const ELEMENT_POSITIONS: Record<'bottom-left' | 'bottom-right' | 'top-left' | 'top-right', ConnectedPosition[]> = {
  'bottom-left': [besideElement('start', 'bottom'), besideElement('start', 'top'), besideElement('end', 'bottom'), besideElement('end', 'top')],
  'bottom-right': [besideElement('end', 'bottom'), besideElement('end', 'top'), besideElement('start', 'bottom'), besideElement('start', 'top')],
  'top-left': [besideElement('start', 'top'), besideElement('start', 'bottom'), besideElement('end', 'top'), besideElement('end', 'bottom')],
  'top-right': [besideElement('end', 'top'), besideElement('end', 'bottom'), besideElement('start', 'top'), besideElement('start', 'bottom')],
};

/** 3.48: at a point the panel opens below and after it, else flips like a native context menu. */
const POINT_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
  { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
];

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
 * - 3.48 (usm-x rows 53–59, 68): `anchor` opens the panel in an overlay at an
 *   element or a point (a context menu), `maxHeight` caps it, `loading` shows
 *   a busy row, `ariaLabel` names it; items take `tooltip`, `disabledReason`,
 *   `emphasis` and `swatch`; every handled key is `preventDefault`ed and
 *   stopped
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
  imports: [IconComponent, NgTemplateOutlet, OverlayModule, SpinnerComponent, TooltipDirective],
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

  /**
   * 3.48 (usm-x row 53): opens the panel in an overlay (rendered under
   * `<body>`, so a scrolling or `overflow: hidden` container can't clip it) at
   * an element (below or above it as `position` says, 8 px apart) or at a
   * viewport point (`{ x: clientX, y: clientY }`, a context menu). The panel
   * flips and shifts to stay 8 px inside the viewport, and closes on Escape,
   * Tab, a click outside the panel and the anchor element, and any scroll
   * outside the panel (the app's `closed` handler sets `isOpen` false). Focus
   * returns to the projected trigger, else the anchor element, else the
   * element focused before; Tab moves on from there (Shift+Tab before it).
   * The kit writes no ARIA onto an anchor element.
   * `isOpen` stays the app's. Limits: the overlay follows the page theme, not
   * a theme scope around the menu, and it sits below `lc-drawer` and a modal
   * sidenav drawer (use the default mode in those).
   * `null`: the panel opens at the projected trigger, as before.
   * @default null
   */
  readonly anchor = input<MenuAnchor | null>(null);

  /**
   * 3.48 (usm-x row 54): caps the panel's height (any CSS length, e.g.
   * `min(56vh, 420px)`, border-box); the items scroll inside, the header and
   * footer stay, and the item focused by keyboard is scrolled into view.
   * Empty: no cap (with `anchor`: the viewport height less 16 px).
   * @default ''
   */
  readonly maxHeight = input('');

  /**
   * 3.48 (usm-x row 55): a busy row after the items (spinner and
   * `loadingLabel`, announced politely) and `aria-busy="true"` on the menu.
   * Items that arrive while the menu is open take the focus (the first
   * enabled one) unless the focus is already inside the panel.
   * @default false
   */
  readonly loading = input(false);

  /**
   * 3.48: text of the busy row (`loading`). German: „Wird geladen …“.
   * @default 'Loading…'
   */
  readonly loadingLabel = input('Loading…');

  /**
   * 3.48 (usm-x row 58): accessible name of the `role="menu"` element ("Was
   * diese Liste anbietet"). Empty renders no `aria-label`.
   * @default ''
   */
  readonly ariaLabel = input('');

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

  /** 3.48: the overlay origin while `anchor` is set (an element, or a point of size 0). */
  protected readonly overlayOrigin = computed(() => {
    const anchor = this.anchor();
    if (!anchor) return null;
    return isAnchorElement(anchor) ? anchor : { x: anchor.x, y: anchor.y };
  });

  /** 3.48: whether the panel opens at a point (no gap to the anchor). */
  protected readonly atPoint = computed(() => {
    const anchor = this.anchor();
    return !!anchor && !isAnchorElement(anchor);
  });

  /** 3.48: overlay positions, preferred first (design §3A). */
  protected readonly overlayPositions = computed(() =>
    this.atPoint() ? POINT_POSITIONS : ELEMENT_POSITIONS[this.position()] ?? ELEMENT_POSITIONS['bottom-right']
  );

  /** 3.48: the panel is a column whose items scroll (capped or in the overlay). */
  protected readonly scrolls = computed(() => !!this.maxHeight() || !!this.anchor());

  /** 3.48: `lang` of the overlay panel (the host's closest `[lang]`; WCAG 3.1.2). */
  protected readonly panelLang = openPanelLang(computed(() => this.isOpen() && !!this.anchor()));

  /** 3.48: text of the polite status, set one frame after the busy row renders (so it is announced). */
  protected readonly statusText = signal('');

  private readonly itemElements = viewChildren<ElementRef<HTMLElement>>('menuItem');
  private readonly panelElement = viewChild<ElementRef<HTMLElement>>('dropdown');
  private readonly listElement = viewChild<ElementRef<HTMLElement>>('list');
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly injector = inject(Injector);
  private readonly overlayStack = inject(OverlayStackService);

  /** 3.48: the element focused when the menu opened (the last focus-return target). */
  private openedFrom: HTMLElement | null = null;
  /**
   * 3.48 (review r1, F-2): the element anchor given at open. An app that
   * clears `anchor` in its `closed` handler still gets the focus back on it.
   */
  private openedAnchor: HTMLElement | null = null;
  /** 3.48: the document listeners added while the menu is open. */
  private listening = false;

  /**
   * 3.48 (usm-x row 59): Escape is taken in the capture phase on `document`,
   * so the menu sees it before any handler of the page, and is consumed with
   * `preventDefault()` and `stopPropagation()`.
   */
  private readonly escapeListener = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.onEscapeKey(event);
  };

  /** 3.48: in overlay mode any scroll outside the panel closes the menu (the anchor moved). */
  private readonly scrollListener = (event: Event): void => {
    if (!this.isOpen() || !this.anchor()) return;
    const target = event.target;
    if (target instanceof Node && this.panelElement()?.nativeElement.contains(target)) return;
    this.close();
  };

  constructor() {
    // Whether the menu has been through its first open-state evaluation; a menu
    // that is already open when it renders (demo pages) must not steal focus.
    let initialized = false;
    let wasOpen = false;
    let hadItems = false;
    effect(() => {
      const open = this.isOpen();
      // 3.48 (usm-x row 55): tracked so items that arrive while open take the focus
      const hasItems = this.firstEnabledIndex() >= 0;
      untracked(() => {
        if (open && !wasOpen) {
          this.overlayStack.push(this.menuId);
          this.openedFrom = this.currentFocus();
          this.openedAnchor = this.anchorElement();
          this.listen(true);
          this.activeIndex.set(this.firstEnabledIndex());
          // Move focus into the menu once the panel has rendered
          if (initialized) {
            afterNextRender(() => this.focusActiveItem(), { injector: this.injector });
          }
        } else if (!open && (wasOpen || !initialized)) {
          this.overlayStack.remove(this.menuId);
          this.listen(false);
          this.restoreFocus();
          this.openedAnchor = null;
          this.activeIndex.set(-1);
        } else if (open && hasItems && !hadItems) {
          // 3.48: the first items arrived while open (after `loading`)
          this.activeIndex.set(this.firstEnabledIndex());
          if (!this.focusInPanel()) {
            afterNextRender(() => this.focusActiveItem(), { injector: this.injector });
          }
        }
        wasOpen = open;
        hadItems = hasItems;
        initialized = true;
      });
    });

    // 3.48: the polite status gets its text one frame after the busy row has
    // rendered (a region that arrives with its text is often not announced)
    effect((onCleanup) => {
      const busy = this.loading() && this.isOpen();
      const label = this.loadingLabel();
      untracked(() => this.statusText.set(''));
      if (!busy) return;
      let frame: ReturnType<typeof setTimeout> | undefined;
      const ref = afterNextRender(
        () => {
          frame = setTimeout(() => this.statusText.set(label), 16);
        },
        { injector: this.injector },
      );
      onCleanup(() => {
        ref.destroy();
        clearTimeout(frame);
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
    this.listen(false);
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
    if (target instanceof Node) {
      if (this.elementRef.nativeElement.contains(target)) return;
      // 3.48: the overlay panel is outside the host; the opening click on an
      // anchor element is not "outside" either
      if (this.panelElement()?.nativeElement.contains(target)) return;
      const anchor = this.anchor();
      if (anchor && isAnchorElement(anchor) && anchor.contains(target)) return;
    }
    if (!this.overlayStack.claim(this.menuId, event)) return;
    this.close();
  }

  /**
   * Escape closes the menu (top-most overlay only) and returns focus to the
   * trigger; the event is consumed so overlays underneath stay open. 3.48
   * (usm-x row 59): called from a capture-phase listener on `document`, and
   * the key is also `preventDefault`ed, so a page listener can tell it was
   * used.
   */
  onEscapeKey(event: Event): void {
    if (!this.isOpen()) return;
    if (!this.overlayStack.claim(this.menuId, event)) return;
    event.preventDefault();
    event.stopPropagation();
    this.returnFocus();
    this.close();
  }

  /**
   * Keyboard navigation inside the `role="menu"` panel. 3.48 (usm-x row 59):
   * every handled key is `preventDefault`ed and stopped; Tab is not prevented
   * (in overlay mode the focus returns to the anchor first, so Tab moves on
   * from there).
   */
  protected onPanelKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        this.consume(event);
        this.focusIndex(this.nextEnabledIndex(this.activeIndex(), 1));
        break;
      case 'ArrowUp':
        this.consume(event);
        this.focusIndex(this.nextEnabledIndex(this.activeIndex(), -1));
        break;
      case 'Home':
        this.consume(event);
        this.focusIndex(this.nextEnabledIndex(-1, 1));
        break;
      case 'End':
        this.consume(event);
        this.focusIndex(this.nextEnabledIndex(0, -1));
        break;
      case ' ': {
        // Buttons activate on Space natively, links only on Enter
        const target = event.target as HTMLElement | null;
        if (target?.matches('a[role="menuitem"]')) {
          this.consume(event);
          target.click();
        }
        break;
      }
      case 'Tab':
        // Focus leaves the menu — let it move on naturally, but close the menu.
        // 3.48 (review r2, F-4): the overlay panel is the last node of <body>,
        // so the browser's Tab would leave the document (CD runs after it).
        // Return the focus first, without preventDefault: Tab then moves on
        // from the anchor (Shift+Tab before it).
        if (this.anchor()) this.returnFocus();
        this.close();
        break;
    }
  }

  /** Roving tabindex: only the active item is in the tab sequence. */
  protected tabindexFor(index: number, item: MenuItem): number {
    return this.isReachable(item) && index === this.activeIndex() ? 0 : -1;
  }

  /**
   * 3.48 (usm-x row 56): a disabled item with a reason keeps its focus
   * (`aria-disabled`) so the reason can be read; one without stays natively
   * `disabled`, as before.
   */
  protected hasReason(item: MenuItem): boolean {
    return !!item.disabled && !!item.disabledReason;
  }

  /** Native `disabled` of a button item: only without a reason (3.48). */
  protected nativeDisabled(item: MenuItem): boolean | undefined {
    return this.hasReason(item) ? false : item.disabled;
  }

  /** The item's tooltip (3.48): the reason while disabled, else `tooltip`. */
  protected tooltipOf(item: MenuItem): string {
    return (item.disabled ? item.disabledReason : item.tooltip) ?? '';
  }

  /** Background of a swatch (3.48): one colour, or two halves. */
  protected swatchBackground(swatch: string | readonly [string, string]): string {
    return typeof swatch === 'string' ? swatch : `linear-gradient(90deg, ${swatch[0]} 50%, ${swatch[1]} 50%)`;
  }

  /** 3.48 (design §3A): the overlay detached on its own (navigation): tell the app. */
  protected onOverlayDetach(): void {
    if (this.isOpen()) this.close();
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
    const item = this.itemElements()[this.activeIndex()]?.nativeElement;
    if (!item) return;
    // 3.48: in the overlay the page must not scroll (a scroll closes the menu)
    if (this.anchor()) item.focus({ preventScroll: true });
    else item.focus();
    if (this.scrolls()) this.revealItem(item);
  }

  /**
   * 3.48 (usm-x row 54): scrolls the capped item list so the focused item is
   * fully visible (`focus()` leaves a partly visible one where it is), without
   * scrolling the page.
   */
  private revealItem(item: HTMLElement): void {
    const list = this.listElement()?.nativeElement;
    if (!list || list.scrollHeight <= list.clientHeight) return;
    const box = list.getBoundingClientRect();
    const rect = item.getBoundingClientRect();
    if (rect.top < box.top) list.scrollTop -= box.top - rect.top;
    else if (rect.bottom > box.bottom) list.scrollTop += rect.bottom - box.bottom;
  }

  private firstEnabledIndex(): number {
    return this.actions().findIndex((item) => !item.disabled);
  }

  /** 3.48: an item the arrow keys reach: enabled, or disabled with a reason. */
  private isReachable(item: MenuItem): boolean {
    return !item.disabled || !!item.disabledReason;
  }

  /** Index of the next reachable item in `direction`, wrapping around; -1 if none. */
  private nextEnabledIndex(from: number, direction: 1 | -1): number {
    const items = this.actions();
    for (let step = 1; step <= items.length; step++) {
      const index = (from + direction * step + items.length) % items.length;
      const item = items[index];
      if (item && this.isReachable(item)) return index;
    }
    return -1;
  }

  /** `preventDefault()` and `stopPropagation()` for a key the menu handles (3.48, usm-x row 59). */
  private consume(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /** 3.48: adds (or removes) the Escape and scroll listeners on `document` while open. */
  private listen(on: boolean): void {
    if (typeof document === 'undefined' || on === this.listening) return;
    this.listening = on;
    if (on) {
      document.addEventListener('keydown', this.escapeListener, true);
      document.addEventListener('scroll', this.scrollListener, true);
    } else {
      document.removeEventListener('keydown', this.escapeListener, true);
      document.removeEventListener('scroll', this.scrollListener, true);
    }
  }

  private currentFocus(): HTMLElement | null {
    if (typeof document === 'undefined') return null;
    const active = document.activeElement;
    return active instanceof HTMLElement && active !== document.body ? active : null;
  }

  private focusInPanel(): boolean {
    const panel = this.panelElement()?.nativeElement;
    return typeof document !== 'undefined' && !!panel?.contains(document.activeElement);
  }

  /**
   * Where the focus goes when the menu closes from inside (3.48, design §3A):
   * the projected trigger, else an anchor element that takes focus (the
   * current one, else the one given at open: review r1, F-2), else the
   * element focused when the menu opened.
   */
  private returnFocus(): void {
    const trigger = this.triggerElement();
    if (trigger) {
      trigger.focus();
      return;
    }
    const anchor = this.anchorElement() ?? this.openedAnchor;
    if (anchor) {
      anchor.focus();
      if (anchor.ownerDocument.activeElement === anchor) return;
    }
    if (this.openedFrom?.isConnected) this.openedFrom.focus();
  }

  /** 3.48: the `anchor` input when it is an element (not a point), else `null`. */
  private anchorElement(): HTMLElement | null {
    const anchor = this.anchor();
    return anchor && isAnchorElement(anchor) ? anchor : null;
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
    if (this.focusInPanel()) this.returnFocus();
  }
}
