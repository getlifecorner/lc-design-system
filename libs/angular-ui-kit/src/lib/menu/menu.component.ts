import {
  Component,
  input,
  output,
  signal,
  computed,
  contentChildren,
  effect,
  untracked,
  afterNextRender,
  afterRenderEffect,
  viewChild,
  ChangeDetectionStrategy,
  HostListener,
  ElementRef,
  Injector,
  Renderer2,
  OnDestroy,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Directionality } from '@angular/cdk/bidi';
import {
  CdkConnectedOverlay,
  OverlayModule,
  type ConnectedPosition,
  type FlexibleConnectedPositionStrategy,
} from '@angular/cdk/overlay';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { BadgeComponent, type BadgeVariant } from '@lifecorner/angular-ui-kit/badge';
import { IconComponent, ɵprovideKitIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_CHECK } from '@lifecorner/angular-ui-kit/icons';
import { OverlayStackService } from '@lifecorner/angular-ui-kit/internal/overlay';
import { openPanelLang } from '@lifecorner/angular-ui-kit/internal/a11y';
import { SpinnerComponent } from '@lifecorner/angular-ui-kit/spinner';
import { TooltipDirective } from '@lifecorner/angular-ui-kit/tooltip';
import { MenuControlDirective } from './menu-control.directive';
import { MenuItemAttrsDirective } from './menu-item-attrs.directive';

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
   * group named by the heading. 3.50 (usm-x row 78): a member with
   * `children` is a section again, to any depth: a `role="group"` named by
   * its heading (12 px semibold, no capitals), heading and items indented one
   * step per level (md 16, sm 12, lg 20 px: items at 16 / 32 / 48 px on
   * levels 1 / 2 / 3). On a section, `icon`, `href`, `variant`, `disabled`
   * and `metadata` are ignored, and `dividerAfter` draws the divider after
   * the whole group.
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
  /**
   * 3.50 (usm-x row 78): the item is the current place or choice:
   * `aria-current="true"`, a 3 px bar at its start, the selected fill and a
   * semibold label (not colour alone). A disabled item keeps
   * `aria-current` but shows the disabled look only.
   */
  current?: boolean;
  /**
   * 3.50 (usm-x row 78): the item's action is running: a 16 px spinner at
   * the end (in the badge's place; the badge hides), `aria-busy="true"` and
   * `aria-disabled="true"`, and `busyLabel` read after the label. It stays in
   * the arrow-key order; click, Enter and Space are ignored.
   */
  busy?: boolean;
  /**
   * 3.50 (usm-x row 78): the badge (`metadata.badge`) as an `lc-badge`
   * (`xs`, rounded, 20 px high) in this variant (`default`, `primary`,
   * `success`, `warning`, `error`, `info`; text 4.61:1 or more in both
   * themes). Unset: the badge as before.
   */
  badgeVariant?: BadgeVariant;
  /**
   * 3.50 (usm-x row 80): attributes on the item element, for tests and app
   * hooks: `id` and `data-*` names only (lower case,
   * `/^(id|data-[a-z0-9][a-z0-9._-]*)$/`); any other name (event handlers,
   * `class`, `style`, `href`, `aria-*`) is dropped, with a `console.warn` in
   * dev mode. Not on sections.
   */
  attrs?: Readonly<Record<string, string>>;
  /**
   * 3.50 (usm-x row 77): in an `inline` menu, on a top-level entry only: the
   * entry is a control row (outside `role="menu"`, at least 44 px high)
   * filled by the `ng-template[lcMenuControl]` of this name, e.g. a
   * `lc-toggle-group` or an `lc-switch`; `label` is drawn before the control
   * (give the control `aria-labelledby` = the template's `labelId`), `''`
   * lets the template fill the row. The rows split the menu into several
   * `role="menu"` parts: Tab moves from a part to the row's controls and on
   * to the next part (one stop per part). Only a part with a checkbox or
   * radio item reserves the check-mark slot; the labels of the other parts
   * start on the rows' label line (md 16 px). Ignored in a popup menu (Tab
   * would close it before the control is reached), unless the menu sets
   * `popupControls` (3.51).
   */
  control?: string;
  /**
   * 3.51 (request 072, backlog 071-n7): on the first top-level entry of a
   * `role="menu"` part that follows a control row: the part's name
   * (`aria-label`), e.g. „Konto“. The first part keeps `ariaLabel` when set.
   * Elsewhere ignored. Unset: a part that starts with a section is named by
   * its heading, any other later part by `partAriaLabel`.
   */
  partLabel?: string;
}

/**
 * Where a popup menu opens (3.51, request 072, backlog 071-n3, adds
 * `right-start` and `left-start`): below or above the trigger or anchor at
 * its left or right edge, or beside it on the right or left with the top
 * edges aligned. `right` and `left` are physical in LTR and RTL.
 */
export type MenuPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'right-start' | 'left-start';

/** 3.50: one part of a menu between control rows (inline), or the whole menu. */
interface MenuSegment {
  /** The top-level entries of a `role="menu"` part (empty for a control row). */
  readonly items: readonly MenuItem[];
  /** The control row entry, or `null` for a menu part. */
  readonly control: MenuItem | null;
  /** Index of the first entry in `items()` (for heading and label ids). */
  readonly offset: number;
  /** Whether this is the first `role="menu"` part (it carries the id and `aria-label`). */
  readonly first: boolean;
  /** 3.51: the number of this `role="menu"` part (1, 2 …; 0 for a control row), for `partAriaLabel`. */
  readonly part: number;
  /** The range of this part's acting items in `actions()`: [start, end). */
  readonly start: number;
  readonly end: number;
  /** Whether this part has a checkbox or radio item (inline: only such a part reserves the indicator slot). */
  readonly toggles: boolean;
}

/** 3.50: the acting items of `items`, in visual order: sections are replaced by their members, to any depth. */
function flattenActions(items: readonly MenuItem[], skipControls: boolean): MenuItem[] {
  return items.flatMap((item) => {
    if (item.children) return flattenActions(item.children, false);
    return skipControls && item.control ? [] : [item];
  });
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

/** 3.51: the two side positions (071-n3). */
type SidePosition = 'right-start' | 'left-start';

/** 3.51: whether a position opens beside the anchor (right or left). */
function isSidePosition(position: MenuPosition): position is SidePosition {
  return position === 'right-start' || position === 'left-start';
}

/**
 * 3.51 (design §1, 071-n3): a side position of an element anchor: the panel
 * on the physical right or left, top edges aligned, then the other side. CDK
 * reads `start` / `end` in the overlay's direction, so in RTL the physical
 * sides are its `end` / `start`.
 */
function sidePositions(position: SidePosition, rtl: boolean): ConnectedPosition[] {
  const right: ConnectedPosition = { originX: rtl ? 'start' : 'end', originY: 'top', overlayX: rtl ? 'end' : 'start', overlayY: 'top' };
  const left: ConnectedPosition = { originX: rtl ? 'end' : 'start', originY: 'top', overlayX: rtl ? 'start' : 'end', overlayY: 'top' };
  return position === 'right-start' ? [right, left] : [left, right];
}

/** 3.51: a side panel's height in `maxHeight="room"`: the viewport less this much, px (the overlay's own cap). */
const SIDE_ROOM_INSET = 32;

/**
 * 3.51 (071-n4): what Tab can reach in a popup with control rows (filtered
 * by `tabIndex`, `disabled`, `hidden` / `inert` and, in a browser, visibility).
 */
const TABBABLE_SELECTOR = 'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex], [contenteditable="true"]';

/** 3.48: at a point the panel opens below and after it, else flips like a native context menu. */
const POINT_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
  { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
];

/** 3.49 (design §3D): at a point whose room is above, the panel above it first. */
const POINT_POSITIONS_ABOVE: ConnectedPosition[] = [POINT_POSITIONS[2], POINT_POSITIONS[3], POINT_POSITIONS[0], POINT_POSITIONS[1]];

/** 3.49: the side a `maxHeight="room"` panel opens to. */
type RoomSide = 'below' | 'above';

/** 3.49: the gap between an element (or the trigger) and the panel, px. */
const ROOM_GAP = 8;
/** 3.49: the panel's distance to the viewport edge, px (CDK's viewport margin). */
const ROOM_MARGIN = 8;
/**
 * 3.49: CDK's fit test ends the viewport at its height less both margins (it
 * compares the pane's viewport y with the narrowed height), so an overlay
 * pane that reaches lower is pushed up into the gap. Below an overlay origin
 * the room keeps this much more.
 */
const CDK_BOTTOM_EXTRA = ROOM_MARGIN;
/** 3.49: the preferred side is kept while its room holds this much, px (or the whole panel). */
const ROOM_KEEP = 240;

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
 * - 3.49 (usm-x row 73): `maxHeight="room"` sizes the panel to the room on
 *   the side it opens to, and that room picks the side
 * - 3.50 (usm-x rows 77, 78, 80, 84): `inline` puts the menu in the page (an
 *   account panel) with control rows (`MenuItem.control` +
 *   `ng-template[lcMenuControl]`); items take `current`, `busy`,
 *   `badgeVariant` and `attrs`; sections nest to any depth; Enter and Space
 *   on an item are `preventDefault`ed (a form behind the menu is not
 *   submitted) and activate it once; `returnFocusTo` names the focus target
 *   after closing (068-n3); the CSS hook `--lc-menu-max-height` caps the
 *   panel when `maxHeight` is empty
 * - 3.51 (request 072, backlog 071-n3, -n4, -n7): `position` `right-start` /
 *   `left-start` open the panel beside the trigger or anchor; `popupControls`
 *   draws control rows in a popup (Tab walks parts and controls);
 *   `MenuItem.partLabel` and `partAriaLabel` name the later `role="menu"` parts
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
  imports: [BadgeComponent, IconComponent, MenuItemAttrsDirective, NgTemplateOutlet, OverlayModule, SpinnerComponent, TooltipDirective],
  viewProviders: [ɵprovideKitIcons([ICON_CHECK])],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.lc-menu-host--inline]': 'inline()',
  },
})
export class MenuComponent implements OnDestroy {
  private static nextId = 0;
  /** Identifies this instance in the overlay stack. */
  private readonly menuId = `lc-menu-${++MenuComponent.nextId}`;

  readonly items = input<MenuItem[]>([]);
  readonly isOpen = input(false);
  /**
   * Where the panel opens: below (`bottom-*`) or above (`top-*`) the trigger
   * or anchor, aligned at its left or right edge, 8 px apart. 3.51 (request
   * 072, backlog 071-n3): `right-start` / `left-start` open it beside the
   * anchor or trigger, 8 px apart, top edges aligned; `right` and `left` are
   * physical in LTR and RTL. With `anchor` (an element) it flips to the other
   * side when there is no room and shifts inside the 8 px viewport margin (at
   * the projected trigger it does not flip, as the other values). With
   * `maxHeight="room"` a side panel is the viewport less 32 px high and never
   * flips the side. At a point `anchor`, the point's positions apply.
   * @default 'bottom-right'
   */
  readonly position = input<MenuPosition>('bottom-right');
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
   * 3.49 (usm-x row 73): the keyword `'room'` sizes the panel to the room
   * between its origin (the anchor element, the point, or the projected
   * trigger) and the viewport edge on the side it opens to, less the 8 px gap
   * and the 8 px viewport margin (16 px at the bottom with `anchor`, where
   * CDK's overlay keeps both margins), but at least 3 items plus header and footer
   * (a shorter window scrolls). The room also picks the side: `position`'s
   * side is kept while its room holds min(240 px, the whole panel), else the
   * side with more room opens. Measured on open, on window resize and when
   * `items` or `loading` change; at the projected trigger the height also
   * follows a scroll (the side stays). Any other value is a CSS length as
   * before. 3.50 (usm-x row 79): empty reads the CSS hook
   * `--lc-menu-max-height` (a length or `room`) from the menu or an ancestor
   * when the menu opens, also for an `anchor` overlay; unset: no cap.
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

  /**
   * 3.50 (usm-x row 77): the menu in the page, e.g. an account panel. The
   * panel always renders (also in prerendered HTML), with no trigger slot, no
   * overlay, no border and no shadow, at the width of its container; `isOpen`,
   * `position`, `anchor`, `maxHeight`, `minWidth`, `maxWidth` and
   * `closeOnSelect` are ignored, and Tab, Escape, outside clicks and scrolling
   * never close it (`closed` is not emitted). `role="menu"`, the roving
   * tabindex and Arrow / Home / End stay; the focus is not moved on render.
   * Top-level entries with `control` become control rows between the menu
   * parts (each part one Tab stop). Escape is left to the surrounding panel.
   * @default false
   */
  readonly inline = input(false);

  /**
   * 3.50: hidden text read after the label of a `busy` item. German:
   * „Wird geladen“.
   * @default 'Loading'
   */
  readonly busyLabel = input('Loading');

  /**
   * 3.50 (backlog 068-n3): the element that gets the focus when the menu
   * closes from inside (Escape, Tab, an activated item), before the projected
   * trigger, the anchor element and the element focused at open (the value
   * given at open is kept if the app clears it while closing). Use it with a
   * point `anchor` when nothing was focused (a `contextmenu` on a row), or for
   * a menu opened beside a rail item; it must be focusable. `null`: as before.
   * @default null
   */
  readonly returnFocusTo = input<HTMLElement | null>(null);

  /**
   * 3.51 (request 072, backlog 071-n4): a popup menu draws `MenuItem.control`
   * entries as control rows (as `inline` does), which split it into
   * `role="menu"` parts. The arrows stay inside a part; Tab and Shift+Tab walk
   * the panel's stops (one per part, each control, controls in the header
   * and footer), and Tab past the last stop or Shift+Tab before the first
   * closes the menu as Tab does without control rows. A click in a control
   * keeps the menu open; Escape closes it and returns the focus. On open the
   * focus goes to the first part's item (or the first control of a leading
   * row). Inline: ignored. `false`: a `control` entry is a plain item in a
   * popup, as before.
   * @default false
   */
  readonly popupControls = input(false);

  /**
   * 3.51 (request 072, backlog 071-n7): the name of a later `role="menu"`
   * part (after a control row) that has no `MenuItem.partLabel` and does not
   * start with a section, while `ariaLabel` is set: `{label}` is replaced by
   * `ariaLabel`, `{n}` by the part's number (2, 3 …). German:
   * „{label}, Teil {n}“. `''`: such a part stays unnamed, as in 3.50.
   * @default '{label}, part {n}'
   */
  readonly partAriaLabel = input('{label}, part {n}');

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
   * of a section its members (3.50: to any depth). Section headings are not
   * in it, nor (inline) control rows.
   */
  protected readonly actions = computed(() => flattenActions(this.items(), this.controlsOn()));

  /** 3.51: control entries are control rows (inline, or a popup with `popupControls`). */
  private readonly controlsOn = computed(() => this.inline() || this.popupControls());

  /** 3.51 (071-n4): a popup split into parts by control rows. */
  protected readonly segmentedPopup = computed(
    () => !this.inline() && this.popupControls() && this.items().some((item) => item.control),
  );

  /** 3.51: one roving stop per part and the indicator slot per part (inline, or a segmented popup). */
  private readonly perPart = computed(() => this.inline() || this.segmentedPopup());

  /** Position of each acting item in {@link actions}. */
  private readonly actionIndex = computed(() => new Map(this.actions().map((item, i) => [item, i])));

  /**
   * Whether any item is a checkbox or radio (3.45): every item then gets the
   * indicator slot. 3.50 (inline): the slot is reserved per `role="menu"`
   * part instead (`MenuSegment.toggles`).
   */
  protected readonly hasToggles = computed(() => this.actions().some((item) => this.isToggle(item)));

  /** Index (into `actions()`) of the item that currently owns the roving tabindex. */
  protected readonly activeIndex = signal(-1);

  /**
   * 3.50: the menu parts. One part with every item, unless an inline menu
   * has control rows: then the parts between them and the rows themselves.
   */
  protected readonly segments = computed<MenuSegment[]>(() => {
    const items = this.items();
    if (!this.controlsOn() || !items.some((item) => item.control)) {
      return [{ items, control: null, offset: 0, first: true, part: 1, start: 0, end: this.actions().length, toggles: this.hasToggles() }];
    }
    const segments: MenuSegment[] = [];
    let part: MenuItem[] = [];
    let offset = 0;
    let start = 0;
    let parts = 0;
    const flush = (next: number) => {
      if (part.length) {
        const acting = flattenActions(part, true);
        const end = start + acting.length;
        const toggles = acting.some((item) => this.isToggle(item));
        parts++;
        segments.push({ items: part, control: null, offset, first: parts === 1, part: parts, start, end, toggles });
        start = end;
      }
      part = [];
      offset = next;
    };
    items.forEach((item, i) => {
      if (item.control) {
        flush(i + 1);
        segments.push({ items: [], control: item, offset: i, first: false, part: 0, start, end: start, toggles: false });
      } else {
        part.push(item);
      }
    });
    flush(items.length);
    return segments;
  });

  /** 3.50 (inline): the roving tab stop of each menu part (by `start`), once the arrows moved it. */
  private readonly partStops = signal<ReadonlyMap<number, number>>(new Map());

  /** 3.50: the `lcMenuControl` templates for control rows. */
  private readonly controlTemplates = contentChildren(MenuControlDirective);

  /** 3.50: `--lc-menu-max-height`, read from the host when the menu opens. */
  private readonly hookMaxHeight = signal('');

  /** 3.50: `maxHeight`, else the CSS hook; nothing in an inline menu. */
  protected readonly effectiveMaxHeight = computed(() => {
    if (this.inline()) return '';
    return this.maxHeight().trim() ? this.maxHeight() : this.hookMaxHeight();
  });

  /** 3.50: `anchor`, except in an inline menu (no overlay). */
  protected readonly activeAnchor = computed(() => (this.inline() ? null : this.anchor()));

  /** 3.50: open as a popup (an inline menu is never "open"). */
  protected readonly popupOpen = computed(() => this.isOpen() && !this.inline());

  /** 3.48: the overlay origin while `anchor` is set (an element, or a point of size 0). */
  protected readonly overlayOrigin = computed(() => {
    const anchor = this.activeAnchor();
    if (!anchor) return null;
    return isAnchorElement(anchor) ? anchor : { x: anchor.x, y: anchor.y };
  });

  /** 3.48: whether the panel opens at a point (no gap to the anchor). */
  protected readonly atPoint = computed(() => {
    const anchor = this.activeAnchor();
    return !!anchor && !isAnchorElement(anchor);
  });

  /** 3.49: `maxHeight="room"` (design §3D). */
  protected readonly roomMode = computed(() => this.effectiveMaxHeight().trim() === 'room');

  /** 3.49: the side and height the room gives, once measured in an open room panel. */
  protected readonly room = signal<{ side: RoomSide; height: number } | null>(null);

  /** 3.49: `position` with the vertical side the room chose; `position` itself without `'room'`. */
  protected readonly effectivePosition = computed<MenuPosition>(() => {
    const position = this.position();
    const room = this.roomMode() ? this.room() : null;
    // 3.51: a side panel keeps its side (the room sets its height only)
    if (!room || isSidePosition(position)) return position;
    const vertical = room.side === 'above' ? 'top' : 'bottom';
    return position.endsWith('-left') ? (`${vertical}-left` as const) : (`${vertical}-right` as const);
  });

  /** 3.49: the inline max-height: the room's height in room mode, else `maxHeight` as before. */
  protected readonly panelMaxHeight = computed(() => {
    if (!this.roomMode()) return this.effectiveMaxHeight() || null;
    const room = this.room();
    return room ? `${room.height}px` : null;
  });

  /** 3.49: an overlay room panel at an element keeps its 8 px gap on the anchor's side only. */
  protected readonly roomEdge = computed(() => {
    const anchor = this.activeAnchor();
    if (this.sidePosition()) return null;
    return this.roomMode() && !!anchor && isAnchorElement(anchor) ? (this.room()?.side ?? null) : null;
  });

  /** 3.51 (071-n3): the side position while the panel opens beside an element or the trigger (not at a point). */
  protected readonly sidePosition = computed<SidePosition | null>(() => {
    const position = this.position();
    return !this.inline() && !this.atPoint() && isSidePosition(position) ? position : null;
  });

  /** 3.48: overlay positions, preferred first (design §3A); 3.49: the room's side first. */
  protected readonly overlayPositions = computed(() => {
    if (this.atPoint()) return this.roomMode() && this.room()?.side === 'above' ? POINT_POSITIONS_ABOVE : POINT_POSITIONS;
    // 3.51: beside the anchor, physical in LTR and RTL (CDK's direction is the menu's `Directionality`)
    const side = this.sidePosition();
    if (side) return sidePositions(side, this.directionality?.value === 'rtl');
    const position = this.effectivePosition();
    return (isSidePosition(position) ? null : ELEMENT_POSITIONS[position]) ?? ELEMENT_POSITIONS['bottom-right'];
  });

  /** 3.48: the panel is a column whose items scroll (capped or in the overlay). */
  protected readonly scrolls = computed(() => !!this.effectiveMaxHeight() || !!this.activeAnchor());

  /** 3.48: `lang` of the overlay panel (the host's closest `[lang]`; WCAG 3.1.2). */
  protected readonly panelLang = openPanelLang(computed(() => this.popupOpen() && !!this.activeAnchor()));

  /** 3.48: text of the polite status, set one frame after the busy row renders (so it is announced). */
  protected readonly statusText = signal('');

  private readonly panelElement = viewChild<ElementRef<HTMLElement>>('dropdown');
  private readonly listElement = viewChild<ElementRef<HTMLElement>>('list');
  /** 3.51: the body of a segmented popup (parts and control rows), its scroller. */
  private readonly bodyElement = viewChild<ElementRef<HTMLElement>>('body');
  private readonly directionality = inject(Directionality, { optional: true });
  private readonly connectedOverlay = viewChild(CdkConnectedOverlay);
  private readonly viewportRuler = inject(ViewportRuler);
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
  /** 3.50: `returnFocusTo` given at open (kept if the app clears it while closing). */
  private openedReturnTo: HTMLElement | null = null;
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

  /**
   * 3.48: in overlay mode any scroll outside the panel closes the menu (the
   * anchor moved). 3.49: a room panel at the projected trigger follows it
   * instead (its height; the side stays).
   */
  private readonly scrollListener = (event: Event): void => {
    if (!this.popupOpen()) return;
    const target = event.target;
    if (target instanceof Node && this.panelElement()?.nativeElement.contains(target)) return;
    if (!this.activeAnchor()) {
      if (this.roomMode()) this.measureRoom(true);
      return;
    }
    this.close();
  };

  constructor() {
    // Whether the menu has been through its first open-state evaluation; a menu
    // that is already open when it renders (demo pages) must not steal focus.
    let initialized = false;
    let wasOpen = false;
    let hadItems = false;
    effect(() => {
      // 3.50: an inline menu is never open (no overlay stack, no listeners, no focus moves)
      const open = this.popupOpen();
      // 3.48 (usm-x row 55): tracked so items that arrive while open take the focus
      const hasItems = this.firstEnabledIndex() >= 0;
      untracked(() => {
        if (open && !wasOpen) {
          this.overlayStack.push(this.menuId);
          this.openedFrom = this.currentFocus();
          this.openedAnchor = this.anchorElement();
          this.openedReturnTo = this.returnFocusTo();
          this.hookMaxHeight.set(this.readMaxHeightHook());
          this.listen(true);
          this.activeIndex.set(this.firstEnabledIndex());
          // 3.51: a segmented popup starts with the first item of every part
          this.partStops.set(new Map());
          // Move focus into the menu once the panel has rendered
          if (initialized) {
            afterNextRender(() => this.focusOnOpen(), { injector: this.injector });
          }
        } else if (!open && (wasOpen || !initialized)) {
          this.overlayStack.remove(this.menuId);
          this.listen(false);
          this.restoreFocus();
          this.openedAnchor = null;
          this.openedReturnTo = null;
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
      const busy = this.loading() && (this.isOpen() || this.inline());
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

    // 3.49 (usm-x row 73, design §3D): a room panel is measured once it has
    // rendered in the open tick (its height and side apply before the first
    // paint), and again when its items, `loading` or the anchor change.
    afterRenderEffect(() => {
      const measure = this.popupOpen() && this.roomMode();
      this.items();
      this.loading();
      this.activeAnchor();
      untracked(() => {
        if (measure) this.measureRoom(false);
        else if (this.room()) this.room.set(null);
      });
    });

    // 3.49: and on window resize while it is open (CDK's throttled resize).
    effect((onCleanup) => {
      if (!this.popupOpen() || !this.roomMode()) return;
      const subscription = this.viewportRuler.change().subscribe(() => this.measureRoom(false));
      onCleanup(() => subscription.unsubscribe());
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
    // 3.50: a busy item ignores activation, as a disabled one
    if (item.disabled || item.busy) {
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
    if (item.disabled || item.busy) return;
    const index = this.indexOf(item);
    if (index >= 0) this.setStop(index);
    if (item.type === 'radio') {
      if (!item.checked) this.itemToggle.emit({ item, checked: true });
    } else {
      this.itemToggle.emit({ item, checked: !item.checked });
    }
    if (item.closeOnSelect === true) this.close();
  }

  /**
   * Close the menu (3.50: an inline menu never closes, so nothing is emitted)
   */
  close(): void {
    if (this.inline()) return;
    this.closed.emit();
  }

  /**
   * Handle click outside to close menu — only while the menu is the top-most
   * overlay, so a click inside a layer above it (a modal opened from a menu
   * item) is left alone.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.popupOpen()) {
      return;
    }

    const target = event.target;
    if (target instanceof Node) {
      if (this.elementRef.nativeElement.contains(target)) return;
      // 3.48: the overlay panel is outside the host; the opening click on an
      // anchor element is not "outside" either
      if (this.panelElement()?.nativeElement.contains(target)) return;
      const anchor = this.activeAnchor();
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
    if (!this.popupOpen()) return;
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
  protected onPanelKeydown(event: KeyboardEvent, segment?: MenuSegment): void {
    // 3.50: an inline menu moves within the part that holds the focus
    const part = segment ?? this.segments()[0];
    const start = part?.start ?? 0;
    const end = part?.end ?? this.actions().length;
    const current = this.perPart() ? this.indexOfNode(event.target) : this.activeIndex();
    switch (event.key) {
      case 'ArrowDown':
        this.consume(event);
        this.focusIndex(this.nextEnabledIndex(current, 1, start, end));
        break;
      case 'ArrowUp':
        this.consume(event);
        this.focusIndex(this.nextEnabledIndex(current, -1, start, end));
        break;
      case 'Home':
        this.consume(event);
        this.focusIndex(this.nextEnabledIndex(start - 1, 1, start, end));
        break;
      case 'End':
        this.consume(event);
        this.focusIndex(this.nextEnabledIndex(start, -1, start, end));
        break;
      case 'Enter':
      case ' ': {
        // 3.50 (usm-x row 84): Enter and Space on an item are consumed (a form
        // behind the menu is not submitted, no page handler sees them) and
        // activate the item once, by click(): buttons and links alike.
        const target = event.target as HTMLElement | null;
        if (target?.matches('.lc-menu__item')) {
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
        // from the anchor (Shift+Tab before it). 3.50: from `returnFocusTo`
        // too. An inline menu stays: Tab moves on to the next stop. 3.51: a
        // segmented popup decides on the panel (`onDropdownKeydown`).
        if (this.perPart()) break;
        this.tabOut();
        break;
    }
  }

  /**
   * 3.51 (request 072, backlog 071-n4, design §1): in a popup with control
   * rows Tab and Shift+Tab move natively between the panel's stops (parts,
   * controls, header and footer controls); Tab on the last stop and
   * Shift+Tab on the first close the menu as Tab does without control rows.
   */
  protected onDropdownKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.segmentedPopup() || !this.popupOpen()) return;
    const stops = this.tabStops();
    const edge = event.shiftKey ? stops[0] : stops[stops.length - 1];
    if (edge && event.target !== edge) return;
    this.tabOut();
  }

  /** Tab leaves a popup: the focus returns first (overlay, `returnFocusTo`), then the menu closes; Tab is not prevented. */
  private tabOut(): void {
    // 3.48 (review r2, F-4): the overlay panel is the last node of <body>, so
    // the browser's Tab would leave the document (CD runs after it).
    if (this.activeAnchor() || this.returnFocusTarget()) this.returnFocus();
    this.close();
  }

  /** 3.51: a control in a scrolling segmented popup is revealed when it takes the focus (no page scroll). */
  protected onBodyFocusIn(event: FocusEvent): void {
    const target = event.target;
    if (this.scrolls() && target instanceof HTMLElement) this.revealItem(target);
  }

  /** 3.51: the panel's Tab stops in DOM order (a segmented popup). */
  private tabStops(): HTMLElement[] {
    const panel = this.panelElement()?.nativeElement;
    if (!panel) return [];
    return Array.from(panel.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter((node) => {
      if (node.tabIndex < 0 || node.matches(':disabled') || node.closest('[hidden], [inert]')) return false;
      // a native radio set is one stop: its checked radio (else its first)
      if (node instanceof HTMLInputElement && node.type === 'radio' && node.name) {
        const set = Array.from(panel.querySelectorAll<HTMLInputElement>('input[type="radio"]')).filter((r) => r.name === node.name);
        const checked = set.find((r) => r.checked);
        if (checked ? checked !== node : set[0] !== node) return false;
      }
      const visible = (node as HTMLElement & { checkVisibility?: () => boolean }).checkVisibility;
      return typeof visible === 'function' ? visible.call(node) : true;
    });
  }

  /** 3.51: on open, the first stop: the first part's item, or the first control of a leading control row. */
  private focusOnOpen(): void {
    if (this.segmentedPopup() && this.segments()[0]?.control) {
      const row = this.panelElement()?.nativeElement.querySelector<HTMLElement>('.lc-menu__control');
      const stop = row ? this.tabStops().find((node) => row.contains(node)) : undefined;
      if (stop) {
        // in the overlay the page must not scroll (a scroll closes the menu)
        if (this.activeAnchor()) stop.focus({ preventScroll: true });
        else stop.focus();
        return;
      }
    }
    this.focusActiveItem();
  }

  /**
   * Roving tabindex: only the active item is in the tab sequence. 3.50: in an
   * inline menu, one item per part: the first reachable one until the arrows
   * move the stop.
   */
  protected tabindexFor(index: number, item: MenuItem): number {
    if (!this.isReachable(item)) return -1;
    // 3.51: a segmented popup has one stop per part, as an inline menu
    if (!this.perPart()) return index === this.activeIndex() ? 0 : -1;
    const part = this.segments().find((s) => !s.control && index >= s.start && index < s.end);
    return part && index === this.stopOf(part) ? 0 : -1;
  }

  /** 3.50 (inline): the tab stop of a part: the one the arrows set, else its first reachable item. */
  private stopOf(part: MenuSegment): number {
    const stop = this.partStops().get(part.start);
    if (stop !== undefined && stop >= part.start && stop < part.end && this.isReachable(this.actions()[stop])) return stop;
    return this.nextEnabledIndex(part.start - 1, 1, part.start, part.end);
  }

  /** 3.50: the item at `index` becomes the roving stop (of its part, inline). */
  private setStop(index: number): void {
    this.activeIndex.set(index);
    if (!this.perPart()) return;
    const part = this.segments().find((s) => !s.control && index >= s.start && index < s.end);
    if (part) this.partStops.update((stops) => new Map(stops).set(part.start, index));
  }

  /** 3.50: the template that fills a control row, by `MenuItem.control`. */
  protected controlTemplate(item: MenuItem): MenuControlDirective['template'] | null {
    return this.controlTemplates().find((t) => t.lcMenuControl() === item.control)?.template ?? null;
  }

  /**
   * 3.51 (request 072, backlog 071-n7, design §4): the `aria-label` of a
   * `role="menu"` part. The first part: `ariaLabel`, else the `partLabel` of
   * its first entry when a control row comes before it. A later part: its
   * `partLabel`; none when it starts with a section (named by the heading,
   * 3.50); else `partAriaLabel` with `ariaLabel` and the part's number.
   */
  protected partName(segment: MenuSegment): string | null {
    const own = segment.offset > 0 ? (segment.items[0]?.partLabel ?? '') : '';
    if (segment.first) return this.ariaLabel() || own || null;
    if (own) return own;
    if (segment.items[0]?.children) return null;
    const label = this.ariaLabel();
    const pattern = this.partAriaLabel();
    if (!label || !pattern) return null;
    return pattern.replace(/\{label\}/g, () => label).replace(/\{n\}/g, () => String(segment.part));
  }

  /** 3.50: a later part that starts with a section is named by its heading (3.51: unless it has a `partLabel`). */
  protected partLabelledBy(segment: MenuSegment): string | null {
    if (segment.first || !segment.items[0]?.children || segment.items[0].partLabel) return null;
    return this.headingId(segment.offset);
  }

  /** 3.51: the scrolling list: the body of a segmented popup, else the (first) `role="menu"` part. */
  private scroller(): HTMLElement | undefined {
    return (this.bodyElement() ?? this.listElement())?.nativeElement;
  }

  /** 3.50: id of a control row's label (`labelId` of its template). */
  protected controlLabelId(index: number): string {
    return `${this.panelId}-control-${index}`;
  }

  /** 3.50: id of the heading of a nested section (level 2 and deeper), by its path. */
  protected nestedHeadingId(parentId: string, index: number): string {
    return `${parentId}-${index}`;
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
    this.setStop(index);
    this.focusActiveItem();
  }

  private focusActiveItem(): void {
    const item = this.itemNodes()[this.activeIndex()];
    if (!item) return;
    // 3.48: in the overlay the page must not scroll (a scroll closes the menu)
    if (this.activeAnchor()) item.focus({ preventScroll: true });
    else item.focus();
    if (this.scrolls()) this.revealItem(item);
  }

  /**
   * 3.50: the panel's item elements in DOM order (= `actions()` order). Read
   * from the DOM: items render from one template at any section depth, and a
   * view query lists template instances in creation order, not DOM order.
   * Items of a menu inside a control row are not this menu's.
   */
  private itemNodes(): HTMLElement[] {
    const panel = this.panelElement()?.nativeElement;
    if (!panel) return [];
    return Array.from(panel.querySelectorAll<HTMLElement>('.lc-menu__item')).filter(
      (node) => node.closest('.lc-menu__dropdown') === panel,
    );
  }

  /** 3.50: index (into `actions()`) of an item element; -1 for anything else. */
  private indexOfNode(target: EventTarget | null): number {
    return target instanceof HTMLElement ? this.itemNodes().indexOf(target) : -1;
  }

  /**
   * 3.48 (usm-x row 54): scrolls the capped item list so the focused item is
   * fully visible (`focus()` leaves a partly visible one where it is), without
   * scrolling the page.
   */
  private revealItem(item: HTMLElement): void {
    const list = this.scroller();
    if (!list || list.scrollHeight <= list.clientHeight) return;
    const box = list.getBoundingClientRect();
    const rect = item.getBoundingClientRect();
    if (rect.top < box.top) list.scrollTop -= box.top - rect.top;
    else if (rect.bottom > box.bottom) list.scrollTop += rect.bottom - box.bottom;
  }

  /**
   * 3.49 (design §3D): the panel's height and side from the room around its
   * origin. `chrome` is everything but the item list (padding, border,
   * header, footer, busy row); the minimum is 3 items plus the chrome (or the
   * whole panel). The preferred side stays while its room holds
   * min(240 px, the whole panel), else the larger room wins (a tie keeps the
   * preferred side). `keepSide`: a scroll changes the height only.
   */
  private measureRoom(keepSide: boolean): void {
    const panel = this.panelElement()?.nativeElement;
    const list = this.scroller();
    const viewportHeight = this.viewportRuler.getViewportSize().height;
    const rooms = this.rooms(viewportHeight);
    if (!panel || !list || !rooms) return;
    const chrome = panel.offsetHeight - list.clientHeight;
    const whole = chrome + list.scrollHeight;
    const pitch = this.itemNodes()[0]?.offsetHeight ?? 0;
    const min = Math.min(whole, chrome + 3 * pitch);
    const keep = Math.min(whole, Math.max(ROOM_KEEP, min));
    const preferred: RoomSide = this.atPoint() || this.position().startsWith('bottom') ? 'below' : 'above';
    const other: RoomSide = preferred === 'below' ? 'above' : 'below';
    const previous = this.room();
    const side =
      keepSide && previous ? previous.side : rooms[preferred] >= keep || rooms[preferred] >= rooms[other] ? preferred : other;
    // 3.51 (071-n3): a side panel is the viewport less 32 px high; its side never changes
    const height = this.sidePosition()
      ? Math.max(min, Math.floor(viewportHeight - SIDE_ROOM_INSET))
      : Math.max(min, Math.floor(rooms[side]));
    if (previous?.side === side && previous.height === height) return;
    this.room.set({ side, height });
    // An overlay pane is placed again right away, with the panel at its new
    // height and margin and the side's positions first: CDK places a pane
    // only on open and on resize, and the bindings would follow a render
    // later (the same values; the projected trigger waits for them).
    const overlayRef = this.activeAnchor() ? this.connectedOverlay()?.overlayRef : undefined;
    if (!overlayRef) return;
    this.renderer.setStyle(panel, 'max-height', `${height}px`);
    const edge = this.roomEdge();
    for (const s of ['below', 'above'] as const) {
      if (edge === s) this.renderer.addClass(panel, `lc-menu__dropdown--room-${s}`);
      else this.renderer.removeClass(panel, `lc-menu__dropdown--room-${s}`);
    }
    (overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy | undefined)?.withPositions?.(this.overlayPositions());
    overlayRef.updatePosition();
  }

  /**
   * 3.49: the room below and above the origin, px: an element anchor or the
   * projected trigger's `.lc-menu` box less the 8 px gap and the 8 px
   * viewport margin; a point less the margin only. Below an overlay origin
   * (anchor element or point) 8 px more, so CDK's fit test accepts the pane
   * where it is instead of pushing it into the gap.
   */
  private rooms(viewportHeight: number): Record<RoomSide, number> | null {
    const anchor = this.activeAnchor();
    if (anchor && !isAnchorElement(anchor)) {
      return { below: viewportHeight - anchor.y - ROOM_MARGIN - CDK_BOTTOM_EXTRA, above: anchor.y - ROOM_MARGIN };
    }
    const box = (anchor ?? this.elementRef.nativeElement.querySelector<HTMLElement>('.lc-menu'))?.getBoundingClientRect();
    if (!box) return null;
    return {
      below: viewportHeight - box.bottom - ROOM_GAP - ROOM_MARGIN - (anchor ? CDK_BOTTOM_EXTRA : 0),
      above: box.top - ROOM_GAP - ROOM_MARGIN,
    };
  }

  private firstEnabledIndex(): number {
    return this.actions().findIndex((item) => !item.disabled);
  }

  /** 3.48: an item the arrow keys reach: enabled, or disabled with a reason. */
  private isReachable(item: MenuItem): boolean {
    return !item.disabled || !!item.disabledReason;
  }

  /**
   * Index of the next reachable item in `direction`, wrapping around; -1 if
   * none. 3.50: within [start, end) (one part of an inline menu).
   */
  private nextEnabledIndex(from: number, direction: 1 | -1, start = 0, end = this.actions().length): number {
    const items = this.actions();
    const count = end - start;
    for (let step = 1; step <= count; step++) {
      const index = start + ((((from - start + direction * step) % count) + count) % count);
      const item = items[index];
      if (item && this.isReachable(item)) return index;
    }
    return -1;
  }

  /** 3.50: `--lc-menu-max-height` on the host or an ancestor ('' when unset or on the server). */
  private readMaxHeightHook(): string {
    if (typeof getComputedStyle !== 'function') return '';
    return getComputedStyle(this.elementRef.nativeElement).getPropertyValue('--lc-menu-max-height').trim();
  }

  /** 3.50: `returnFocusTo`, else the one given at open, when it is still in the page. */
  private returnFocusTarget(): HTMLElement | null {
    const target = this.returnFocusTo() ?? this.openedReturnTo;
    return target?.isConnected ? target : null;
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
   * 3.50: `returnFocusTo` when it takes the focus; else the projected
   * trigger, else an anchor element that takes focus (the current one, else
   * the one given at open: review r1, F-2), else the element focused when
   * the menu opened.
   */
  private returnFocus(): void {
    const target = this.returnFocusTarget();
    if (target) {
      target.focus();
      if (target.ownerDocument.activeElement === target) return;
    }
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
    const anchor = this.activeAnchor();
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
