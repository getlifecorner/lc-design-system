import type { ItemRowState } from './item-row-state.interface';

/**
 * Kind of a sidenav item (3.44): `link` (a router link, as before) or `action`
 * (a button that emits `itemClicked` only; the app sets `current`).
 */
export type NavigationItemKind = 'link' | 'action';

/**
 * NavigationItem interface for sidenav navigation
 *
 * Represents a navigation item with icon, label, route, and optional role requirement.
 * Can also represent a section header (group) when `isSection` is true.
 *
 * 3.44 (usm-x row 14): the shared row states of `ItemRowState` (`busy`,
 * `disabled`, `disabledReason`, `tooltip`) and action items, an app-set
 * `current`, children on demand, a `hint`, `matchRoutes`, `iconUrl` and
 * `muted`.
 */
export interface NavigationItem extends ItemRowState {
  /**
   * Unique identifier for the navigation item
   */
  id: string;

  /**
   * Icon name from lc-icons library (e.g., 'home', 'paint-brush')
   */
  icon: string;

  /**
   * Display label for the navigation item
   */
  label: string;

  /**
   * Angular route path (e.g., '/', '/trading'). Ignored on `kind: 'action'`
   * (pass `''`).
   */
  route: string;

  /**
   * Optional required Cognito role (e.g., 'LC.Trader')
   * If specified, item only visible to users with this role
   */
  requiredRole?: string;

  /**
   * Display order in sidebar (1 = first)
   */
  displayOrder: number;

  /**
   * Optional nested navigation items for multi-level navigation. In
   * `lc-sidenav` they nest to any depth (3.47): a child with children is a
   * group of its own.
   */
  children?: NavigationItem[];

  /**
   * When true, this item acts as a non-clickable section header/headline.
   * Children are displayed beneath it with the label as a group title.
   */
  isSection?: boolean;

  /**
   * On a section (`isSection`, 3.45): its heading becomes a disclosure button
   * that folds the section's items (`lc-sidenav` `collapsedSections`). The
   * rail ignores folding.
   */
  collapsible?: boolean;

  /**
   * Optional action button displayed on the right side of the item.
   * Emits `itemAction` when clicked (e.g. to open a modal or context menu).
   */
  action?: {
    /** Icon name from lc-icons library (e.g., 'plus', 'ellipsis-horizontal') */
    icon: string;
    /** Accessible label for the action button */
    ariaLabel?: string;
    /**
     * 3.48 (backlog 067-n4): the action opens a popup: `aria-haspopup` on the
     * button and `aria-expanded` (`true` while `lc-sidenav`
     * `expandedActionId` is this item's id), also in prerendered HTML.
     */
    hasPopup?: 'menu' | 'dialog';
  };

  /**
   * Optional badge displayed on the right side of the item (e.g. count).
   * Rendered as a small pill badge.
   */
  badge?: {
    /** Text or number to display inside the badge */
    value: string | number;
    /** Badge color variant */
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
    /**
     * Read after the label instead of the sidenav's `badgeAriaLabel` (3.44),
     * e.g. "56/60" → "56 von 60 geladen".
     */
    ariaLabel?: string;
    /** The badge's text in the row tooltip, after " · " (3.44). */
    tooltip?: string;
  };

  /**
   * `'action'` (3.44): a `<button>` that emits `itemClicked` only; `route` is
   * ignored and routes never make it current (the app sets `current`).
   * Default `'link'`.
   */
  kind?: NavigationItemKind;

  /**
   * The current item (3.44): `aria-current="page"` and the current look. The
   * first such item in display order wins over `activeRoute` and the router.
   */
  current?: boolean;

  /**
   * A group whose children load on demand (3.44): it shows the chevron with
   * no children yet, and opening it emits `expandRequested` while it has none.
   */
  hasChildren?: boolean;

  /** The open group's children are loading (3.44): a loading row and `aria-busy`. */
  childrenLoading?: boolean;

  /**
   * Right-aligned text beside the label (3.44), e.g. where an editor lives
   * instead ("Rich Client"). In the item's accessible name; hidden on the
   * rail; ellipsis with the full text in `title`.
   */
  hint?: string;

  /**
   * Further routes the item is current for (3.44), matched like `route`
   * (exact, then the longest prefix), e.g. every address an area owns.
   */
  matchRoutes?: string[];

  /** An image URL instead of `icon` (3.44): `alt=""`, 20 px, 22 px on the rail. */
  iconUrl?: string;

  /** A quieter ink at rest (3.44); the item is still a link. */
  muted?: boolean;

  /**
   * 3.50 (usm-x row 74): a `kind: 'action'` item opens a popup (e.g. a group
   * menu beside the rail): `aria-haspopup` on its button and `aria-expanded`
   * (`true` while `lc-sidenav` `expandedActionId` is this item's id). Ignored
   * on links.
   */
  hasPopup?: 'menu' | 'dialog';
}

/** Payload of `lc-sidenav`'s `railItemClick` (3.50, usm-x row 74). */
export interface NavigationRailItemEvent {
  /** The `railItems` entry that was pressed. */
  item: NavigationItem;
  /** The `click` event. */
  event: MouseEvent;
  /**
   * The rail item's link or button, to anchor a menu beside the rail and to
   * pass as the menu's `returnFocusTo`.
   */
  element: HTMLElement;
}

/** Payload of `lc-sidenav`'s `itemContextMenu` (3.44). */
export interface NavigationItemContextMenuEvent {
  /** The item the context menu was requested on. */
  item: NavigationItem;
  /**
   * The `contextmenu` event (the kit doesn't call `preventDefault`). For a
   * long press (`contextMenuOnLongPress`, 3.45) the kit's own `contextmenu`
   * event at the press point.
   */
  event: MouseEvent;
}

/** Payload of `lc-sidenav`'s `itemActionClick` (3.47, usm-x row 42). */
export interface NavigationItemActionEvent {
  /** The item whose `action` button was pressed. */
  item: NavigationItem;
  /** The button's `click` event. */
  event: MouseEvent;
  /** The action button, to anchor a menu to it (and to return the focus to). */
  element: HTMLButtonElement;
}
