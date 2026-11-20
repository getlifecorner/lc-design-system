import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  output,
  model,
  effect,
  untracked,
  HostListener,
  OnDestroy,
  inject,
  afterNextRender,
  EnvironmentInjector,
  ElementRef,
  WritableSignal,
  contentChild,
  linkedSignal,
  ChangeDetectorRef,
  Injector,
  afterRenderEffect,
  viewChild,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet, NgStyle } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { A11yModule } from '@angular/cdk/a11y';
import {
  NavigationItem,
  NavigationItemActionEvent,
  NavigationItemContextMenuEvent,
  NavigationRailItemEvent,
} from '@lifecorner/angular-ui-kit/models';
import {
  currentItemParents,
  currentNavigationItem,
  isNavigationGroup,
  navigationLinks,
  navigationPath,
  sortNavigationItems,
} from '@lifecorner/angular-ui-kit/internal/navigation';
import { IconComponent, ɵprovideKitIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_CHEVRON_DOWN, ICON_CHEVRON_LEFT, ICON_CHEVRON_RIGHT } from '@lifecorner/angular-ui-kit/icons';
import { BadgeComponent } from '@lifecorner/angular-ui-kit/badge';
import { LogoComponent } from '@lifecorner/angular-ui-kit/logo';
import { MenuComponent, type MenuItem, type MenuPosition } from '@lifecorner/angular-ui-kit/menu';
import { SpinnerComponent } from '@lifecorner/angular-ui-kit/spinner';
import { TooltipDirective, type TooltipPosition } from '@lifecorner/angular-ui-kit/tooltip';
import { OverlayStackService, focusReturnTarget } from '@lifecorner/angular-ui-kit/internal/overlay';
import { SidenavLabelDirective } from './sidenav-label.directive';
import { SidenavRailDirective, type SidenavRailContext } from './sidenav-rail.directive';

export type SidenavPosition = 'left' | 'right';
export type SidenavMode = 'drawer' | 'docked';

/**
 * Surface of the docked sidenav: `default` is the rail on `--color-sidebar`
 * with a border; `transparent` has no background and no border and draws the
 * items as 48 px pills (the side navigation on the page, "Weite"). A drawer
 * keeps its surface in both.
 */
export type SidenavVariant = 'default' | 'transparent';

/**
 * How `brandLogoSrc` is drawn (3.50, usm-x row 75): `tile` (24 px in the
 * 32 px tile) or `natural` (its own aspect ratio, `--lc-sidenav-brand-logo-height`
 * high, no tile).
 */
export type SidenavBrandLogoFit = 'tile' | 'natural';

let nextSidenavId = 0;
/** Hold time of a long press (3.45), as iOS and Android. */
const LONG_PRESS_MS = 500;
/** A move farther than this cancels a long press (3.45). */
const LONG_PRESS_SLOP_PX = 10;
/** How long after an emitted long press a native `contextmenu` counts as its echo (3.45). */
const LONG_PRESS_ECHO_MS = 1500;

/** Whether `target` is `item` or below it. */
function containsItem(item: NavigationItem, target: NavigationItem): boolean {
  return !!item.children?.some((child) => child === target || containsItem(child, target));
}

/** Whether a list of ids and a set hold the same ids (3.47). */
function sameIds(ids: readonly string[], set: ReadonlySet<string>): boolean {
  const unique = new Set(ids);
  return unique.size === set.size && ids.every((id) => set.has(id));
}

/** 3.51 (071-n1): the links of a rail group's menu, in menu order (sections and nested groups opened). */
function menuLinks(items: readonly NavigationItem[]): NavigationItem[] {
  return sortNavigationItems(items).flatMap((item) => (item.isSection || isNavigationGroup(item) ? menuLinks(item.children ?? []) : [item]));
}

/** 3.51: the entry with this id below `items`, at any depth. */
function findNavigationItem(items: readonly NavigationItem[], id: string): NavigationItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    const found = findNavigationItem(item.children ?? [], id);
    if (found) return found;
  }
  return null;
}

/** 3.51: the rail group menu's default `maxWidth` (`--lc-sidenav-rail-menu-max-width`). */
const RAIL_MENU_MAX_WIDTH = '20rem';
/** 3.51: the rail width when it can't be read (the server; `--lc-sidenav-rail-width`). */
const RAIL_WIDTH = 56;

/** A label split into marked and plain parts (3.47, `highlight`). */
interface LabelPart {
  text: string;
  mark: boolean;
}

/**
 * Sidenav component for application navigation sidebar.
 *
 * Features:
 * - Drawer (overlay) and docked (persistent) modes
 * - Responsive mobile mode — docked automatically switches to drawer below a configurable breakpoint
 * - Collapsed icon-rail mode (narrow 56px sidebar with icons only and hover tooltips)
 * - Integrated logo area with collapse-toggle (sidebar-first layouts)
 * - Text brand (`brandName`, `brandIcon`): an icon tile and the product name,
 *   one link to home (`brandHref`, else `routerLink="/"`), as high as the
 *   `lc-header` next to it; the rail shows only the tile. It never toggles:
 *   `showCollapseToggle` adds a collapse button at the bottom of the rail
 * - Hierarchical navigation with collapsible groups (3.47: any depth)
 * - Section headlines for item grouping with optional action buttons
 * - Action buttons on any item (hover-reveal)
 * - Badge support on items (count / status indicator), read after the label
 *   through `badgeAriaLabel` (3.31); on the collapsed rail the label and the
 *   badge text name the item
 * - One current item, announced and painted alike: the link for `activeRoute`
 *   (or, without it, the one the router's URL matches) gets
 *   `aria-current="page"` and the current look, every other link neither
 *   (AS-16). No hover color change on the current item
 * - Keyboard navigation support (Escape closes drawer)
 * - Configurable width and position (left/right)
 * - Optional backdrop overlay
 * - Theme variants: auto, light, dark (with teal accent for dark mode). The
 *   theming hooks (`--lc-sidenav-bg`, `-fg`, `-fg-active`, `-border`,
 *   `-hover-bg`, `-section-fg`, `-active-bg`, `-active-fg`, `-active-icon`,
 *   `-badge-ring`) can be set on `lc-sidenav` or any ancestor (3.15); a value
 *   on the element wins over an ancestor's, and both win over `theme` (3.14).
 *   Set the same ones for `lc-sidenav-placeholder`, e.g. on a shared ancestor;
 *   `--lc-sidenav-active-indicator`
 *   (the current item's 2 px bar, default `--color-primary-500`; on a
 *   `theme="light"` rail #208497 on any page, like its focus rings),
 *   `--lc-sidenav-brand-tile-bg` (default `--color-primary-fill`) and
 *   `--lc-sidenav-brand-tile-fg` (default `--color-on-primary`) can be set on
 *   any ancestor
 * - `variant="transparent"`: no rail background or border, items as 48 px
 *   pills with 16 px labels, the current one on `--color-surface-selected`
 * - Items are at least 44 px high in every density; the current item's ink is
 *   `--color-on-surface-selected` (AA on the selected tint)
 * - Accessible: the inner `<nav>` is the navigation landmark; in drawer mode
 *   the panel is a modal dialog (`role="dialog"`, focus moved to the close
 *   button on open, trapped while open, restored on close); `returnFocusTo`
 *   (3.35) names the element that gets the focus back after the drawer
 *   closed (WebKit doesn't focus a tapped button)
 * - 3.44 (usm-x row 14): action items (`kind: 'action'`, a button that emits
 *   `itemClicked` only; the app sets `current`), the row states of
 *   `ItemRowState` (`busy`, `disabled` with a `disabledReason`, `tooltip`),
 *   children on demand (`hasChildren`, `childrenLoading`, `expandRequested`),
 *   a right-aligned `hint`, `matchRoutes`, `iconUrl`, `muted`, a badge with
 *   its own `ariaLabel` and `tooltip`, `itemContextMenu`, and a brand
 *   `brandSubtitle` and `brandLetter`. Busy and disabled items ignore click,
 *   Enter and Space (also router links: a capture listener stops the click
 *   before `RouterLink` sees it)
 * - 3.47 (usm-x rows 38–46): a `[sidenav-top]` slot between the brand and
 *   the items, `brandRoute`, `brandLink`, `brandLogoSrc`, groups nested to
 *   any depth, `expandedGroups` (two-way), `itemActionClick` with the action
 *   button, an `lcSidenavLabel` template and `highlight`, a `title` on a
 *   truncated label, Escape only when the drawer is the top-most layer, and
 *   the CSS hooks `--lc-sidenav-focus-ring`, `--lc-sidenav-muted-fg`,
 *   `--lc-sidenav-icon-size` (default 20px), `--lc-sidenav-backdrop`
 *   (default `rgba(0, 0, 0, 0.5)`), `--lc-sidenav-brand-height` (default by
 *   `logoSize`: 56, 56, 64, 80, 112 px) and `--lc-sidenav-brand-logo-filter`
 *   (default `none`), read where used (set them on any ancestor)
 * - 3.50 (usm-x rows 74–76): a `[sidenav-rail-top]` slot on the collapsed
 *   rail only (between the brand and the items, centred, at most 44 px
 *   wide, e.g. the area picker as an icon button), `railItems` (what the
 *   rail draws instead of `items`) with `railItemClick`, `hasPopup` on action
 *   items, `brandToggle` (the brand collapses and expands the rail),
 *   `brandLogoFit="natural"` (a wordmark at its own ratio, hook
 *   `--lc-sidenav-brand-logo-height`, default `24px`), and a cut label's full
 *   text in the row's kit tooltip („{label} · {tooltip}“)
 * - 3.51 (request 072, backlog 071-n1, -n2, -n5, -n8): `railGroupMenu` (a
 *   `railItems` group opens its children in an `lc-menu` beside the rail,
 *   hook `--lc-sidenav-rail-menu-max-width`, default `20rem`), the
 *   `[sidenav-brand-mark]` slot (the app's mark instead of the tile), an
 *   `ng-template[lcSidenavRail]` for the collapsed rail with the class
 *   `lc-sidenav__rail-item`, and a cut label's tooltip described without the
 *   label (`tooltipDescription`)
 *
 * @example
 * ```html
 * <lc-sidenav
 *   [isOpen]="isOpen"
 *   mode="docked"
 *   [(collapsed)]="isCollapsed"
 *   [showLogo]="true"
 *   logoSize="md"
 *   [mobileBreakpoint]="768"
 *   [items]="navItems"
 *   activeRoute="/dashboard"
 *   theme="dark"
 *   (closed)="isOpen = false"
 *   (itemClicked)="navigate($event)"
 *   (itemAction)="onAction($event)" />
 * ```
 */
@Component({
  selector: 'lc-sidenav',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgStyle,
    RouterLink,
    A11yModule,
    IconComponent,
    BadgeComponent,
    LogoComponent,
    MenuComponent,
    SpinnerComponent,
    TooltipDirective,
  ],
  viewProviders: [ɵprovideKitIcons([ICON_CHEVRON_DOWN, ICON_CHEVRON_LEFT, ICON_CHEVRON_RIGHT])],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.lc-sidenav-container]': 'true',
    '[class.lc-sidenav-container--docked]': "effectiveMode() === 'docked'",
    '[class.lc-sidenav-container--open]': 'isOpen()',
    // `theme` on the host (019): the themed values are private host variables
    // that the public `--lc-sidenav-*` hooks fall back to, so an app's hooks
    // on `lc-sidenav` win over `theme="dark"` / `"light"`.
    '[class.lc-sidenav-container--light]': "theme() === 'light'",
    '[class.lc-sidenav-container--dark]': "theme() === 'dark'",
  },
})
export class SidenavComponent implements OnDestroy {
  private readonly router = inject(Router);

  /**
   * The router's URL, updated on every `NavigationEnd`. Before the first
   * navigation it is the router's initial URL (`/`). Read only when
   * `activeRoute` is empty.
   */
  private readonly routerUrl = signal(this.router.url);

  /** Whether the sidenav is collapsed to icon-only rail (two-way bindable) */
  readonly collapsed = model(false);

  /** Whether to show the logo at the top of the sidenav */
  readonly showLogo = input(false);

  /** Custom URL for the full brand logo (forwarded to inner `<lc-logo>`). */
  readonly logoSrc = input('');
  /** Custom URL for the emblem-only brand logo. */
  readonly logoEmblemSrc = input('');
  /** Optional dark-theme URL for the full brand logo. */
  readonly logoDarkSrc = input('');
  /** Optional dark-theme URL for the emblem-only brand logo. */
  readonly logoDarkEmblemSrc = input('');
  /** Alt text for the brand logo. */
  readonly logoAlt = input('');

  /** Size of the brand logo (forwarded to inner `<lc-logo>`). Defaults to `md` for a prominent brand block aligned with `<lc-header size="md">` (both 64px). Also sets the height of the text brand (`brandName`). */
  readonly logoSize = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');

  /**
   * Product name shown as a text brand at the top: an icon tile and the name,
   * one link to home. Replaces the image logo (`showLogo`). The block is as
   * high as the image logo (`logoSize`: 64 px for `md`, matching
   * `lc-header size="md"`); the name wraps to two lines at most, and the full
   * name stays the link's accessible name. Collapsed, only the tile shows.
   * The brand toggles the rail only with `brandToggle` (3.50; see also
   * `showCollapseToggle`). Under
   * `@defer`, give the `lc-sidenav-placeholder` `[showLogo]="true"` and the
   * same `logoSize` to reserve the block. Empty: no text brand.
   * @default ''
   */
  readonly brandName = input('');

  /**
   * `lc-icon` name in the brand tile (decorative). Empty: the tile shows the
   * name's first letter. Renders nothing without `brandName`.
   * @default ''
   */
  readonly brandIcon = input('');

  /**
   * Plain URL of the brand link (a native `<a href>`, works without the
   * router). Empty: `routerLink="/"`, as `lc-header`'s `homeHref`.
   * @default ''
   */
  readonly brandHref = input('');

  /**
   * Accessible name of the brand link. Empty: the brand name. Start it with
   * the visible name, e.g. `'Finance Intelligence – home'`.
   * @default ''
   */
  readonly brandAriaLabel = input('');

  /**
   * A second line under `brandName` (3.44, usm-x row 14), e.g. the area
   * ("Customizing"); the name then keeps one line, each with an ellipsis, and
   * the block keeps its height. Joins the link's name after the brand name
   * (`brandAriaLabel` still wins). Hidden on the rail. Empty: one name of up
   * to two lines, as before.
   * @default ''
   */
  readonly brandSubtitle = input('');

  /**
   * The brand tile's letter (3.44) instead of the name's first one, e.g.
   * `'X'` for "USM X". `brandIcon` wins over it.
   * @default ''
   */
  readonly brandLetter = input('');

  /**
   * `routerLink` of the brand when `brandHref` is empty (3.47, usm-x
   * row 39), e.g. `'/start'`.
   * @default '/'
   */
  readonly brandRoute = input('/');

  /**
   * `false`: the brand is a plain block (a `<div>`, no link, no tab stop)
   * with the same tile, name and subtitle (3.47, usm-x row 39), for an app
   * whose brand leads nowhere. `brandHref`, `brandRoute` and
   * `brandAriaLabel` are then ignored.
   * @default true
   */
  readonly brandLink = input(true);

  /**
   * Image in the brand tile (3.47, usm-x row 39), decorative (`alt=""`),
   * 24 × 24 px contained; wins over `brandIcon` and `brandLetter`. The CSS
   * hook `--lc-sidenav-brand-logo-filter` (default `none`) filters it, e.g.
   * `brightness(0) invert(1)` for a white silhouette on a dark rail; pair it
   * with `--lc-sidenav-brand-tile-bg: transparent` for a logo without a tile.
   * @default ''
   */
  readonly brandLogoSrc = input('');

  /**
   * How `brandLogoSrc` is drawn (3.50, usm-x row 75). `'tile'`: 24 × 24 px
   * contained in the 32 px tile, as before. `'natural'`: at its own aspect
   * ratio, `--lc-sidenav-brand-logo-height` high (default `24px`; a 4:1
   * wordmark is 96 × 24 px), without a tile, at most the brand's width; the
   * collapsed rail shows the tile with `brandIcon` or the letter instead.
   * `--lc-sidenav-brand-logo-filter` applies in both.
   * @default 'tile'
   */
  readonly brandLogoFit = input<SidenavBrandLogoFit>('tile');

  /**
   * Docked mode (3.50, usm-x row 74): the brand is a `<button>` that collapses
   * and expands the rail, whatever it shows (letter, `brandIcon`,
   * `brandLogoSrc`); 44 px target, the brand's focus ring, the name as a
   * tooltip on the rail, and the focus stays on it across both states. Its
   * name: „{brandAriaLabel or brandName [brandSubtitle]}, {what a press
   * does}“ (`expandAriaLabel` / `collapseAriaLabel`). In drawer mode the brand
   * stays as `brandLink` says. Works beside `showCollapseToggle`.
   * @default false
   */
  readonly brandToggle = input(false);

  /**
   * Docked mode: a button at the bottom of the rail collapses and expands it
   * (`collapsed`). Independent of the brand. With `showLogo` the image logo
   * toggles already, so use one of the two.
   * @default false
   */
  readonly showCollapseToggle = input(false);

  /**
   * Accessible name of the collapse button (`showCollapseToggle`) while the
   * rail is collapsed. Expanded, it uses `collapseAriaLabel`.
   * @default 'Expand navigation'
   */
  readonly expandAriaLabel = input('Expand navigation');

  /** Whether the sidenav is open */
  readonly isOpen = input(false);

  /** Display mode: 'drawer' (overlay) or 'docked' (persistent sidebar) */
  readonly mode = input<SidenavMode>('drawer');

  /** Mobile breakpoint in pixels. Below this width, docked mode switches to drawer. */
  readonly mobileBreakpoint = input(768);

  /** Whether the viewport is below the mobile breakpoint */
  readonly isMobile = signal(false);

  /** Effective mode: switches docked → drawer on mobile */
  readonly effectiveMode = computed(() => {
    if (this.isMobile() && this.mode() === 'docked') {
      return 'drawer' as SidenavMode;
    }
    return this.mode();
  });

  private mediaQuery: MediaQueryList | null = null;
  private mediaHandler = (e: MediaQueryListEvent) => this.isMobile.set(e.matches);

  /** Position of the sidenav (left or right) */
  readonly position = input<SidenavPosition>('left');

  /** Width of the sidenav drawer */
  readonly width = input('320px');

  /**
   * ARIA label of the navigation landmark (the inner `<nav>`) and, in drawer
   * mode, of the dialog panel.
   */
  readonly ariaLabel = input('Side navigation');

  /** Whether to show the overlay backdrop */
  readonly hasOverlay = input(true);

  /**
   * Drawer mode only (`mode="drawer"`, or `docked` below `mobileBreakpoint`):
   * element that gets the focus back after the drawer closed (3.35), instead
   * of the one that had it at open. Set it to the trigger: WebKit (Safari,
   * every iOS browser) doesn't focus a tapped button, so the captured element
   * is `body`. Applied after the next render, once the panel has left the DOM
   * and the focus trap has restored its captured element. Holds on ×,
   * Escape, backdrop, an item or brand tap on a phone (they close it through
   * `closed`), `isOpen` false, and when the sidenav is destroyed while open.
   * A custom-element host that can't take focus (`<lc-button>`) hands it to
   * its first focusable descendant. Ignored when the element is no longer in
   * the document or can't take focus; the captured element then keeps it.
   * `null`: as before.
   * @default null
   */
  readonly returnFocusTo = input<HTMLElement | null>(null);

  /**
   * Navigation items (`NavigationItem[]`): `id`, `icon`, `label`, `route`,
   * `displayOrder` (sort order, 1 = first); optional `children`
   * (`NavigationItem[]`, a collapsible group; 3.47: nested to any depth, a
   * child with children or `hasChildren` is a group of its own), `isSection`
   * (renders `label` as a section headline over its `children`),
   * `collapsible` (3.45: a section heading becomes a disclosure button, see
   * `collapsedSections`), `badge` (`{ value: string | number; variant?:
   * 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
   * ariaLabel?: string; tooltip?: string }`; on the rail a value longer than
   * 2 characters shows as a dot), `action` (`{ icon: string; ariaLabel?:
   * string }`, a button that emits `itemAction`), `requiredRole` (for the
   * app's own filtering; not evaluated here). 3.44: `kind` (`'link'` or
   * `'action'`), `current`, `hasChildren`, `childrenLoading`, `hint`,
   * `matchRoutes`, `iconUrl`, `muted`, and the row states `busy`, `disabled`,
   * `disabledReason`, `tooltip`. Items link with `routerLink`; exactly one
   * link, the current item (see `activeRoute`), gets `aria-current="page"`.
   * @default []
   */
  readonly items = input<NavigationItem[]>([]);

  /**
   * What the collapsed rail draws instead of `items` (3.50, usm-x row 74):
   * one icon per entry, by `displayOrder` (`children`, `isSection` and
   * `action` are ignored), in the rail's look (tooltip, badge dot, busy
   * spinner, current bar), e.g. „Übersicht“ plus one icon per area group. The
   * current entry: the first with `current`, else by `route` / `matchRoutes`
   * as for `items`; a `kind: 'action'` entry (e.g. a group icon that opens a
   * menu) is current only by `current`, never by a route. A press emits `railItemClick` with the element (and
   * `itemClicked`); a `kind: 'action'` entry with `hasPopup` opens the app's
   * menu beside the rail. Expanded and in the drawer, `items` show as before.
   * `null`: the rail draws `items`, as before.
   * @default null
   */
  readonly railItems = input<NavigationItem[] | null>(null);

  /**
   * 3.51 (request 072, backlog 071-n1): on the docked, collapsed rail a
   * `railItems` entry with `children` (or `hasChildren`) is a menu button
   * (`aria-haspopup="menu"`, `aria-expanded`); a press, Enter, Space or the
   * arrow towards the menu opens its children in an `lc-menu` beside the rail
   * (8 px outside its edge, top aligned with the item, on the side away from
   * the nearer viewport edge), named by the entry's label, at most
   * `--lc-sidenav-rail-menu-max-width` wide (read when it opens, default
   * `20rem`). Map: `label`, `icon`, `disabled` / `disabledReason`, `tooltip`,
   * `busy`, `hint` (subtitle), `badge` (value, variant), current (`current` or
   * the current `route` / `matchRoutes`; the group then gets
   * `aria-current="true"`), nested groups and sections as sections. A link
   * child navigates with the router and emits `itemClicked`; an action child
   * emits `itemClicked`. Escape closes; the focus returns to the rail item.
   * `hasChildren` without children emits `expandRequested` and the menu shows
   * its busy row (`childrenLoadingLabel`) until they arrive. `railItemClick`
   * is still emitted on a press (drop your own menu). Entries are buttons
   * (no "open in new tab"); groups in `items` are not menus. Not with
   * `lcSidenavRail` (the template wins). `false`: as before.
   * @default false
   */
  readonly railGroupMenu = input(false);

  /**
   * 3.48 (backlog 067-n4): id of the item whose action popup is open. Its
   * action button gets `aria-expanded="true"` (and stays visible); the other
   * buttons with `action.hasPopup` get `"false"`, also in prerendered HTML.
   * The `itemAction` event and its `button` (to anchor an `lc-menu`) are
   * unchanged. `null`: none open. 3.50: also the `kind: 'action'` item (in
   * `items` or `railItems`) with `hasPopup` whose popup is open.
   * @default null
   */
  readonly expandedActionId = input<string | null>(null);

  /**
   * Ids of the folded sections (3.45, backlog 064-n2; two-way). Only sections
   * with `collapsible: true` fold: their heading holds a disclosure button
   * (`aria-expanded`, `aria-controls`) and their list is hidden while folded.
   * The rail ignores folding. When the current item moves into a folded
   * section, the section unfolds.
   * @default []
   */
  readonly collapsedSections = model<readonly string[]>([]);

  /**
   * A 500 ms touch hold on an item emits `itemContextMenu` (3.45, backlog
   * 064-n2), for iOS, which fires no `contextmenu` on a long press. Moving
   * 10 px cancels it; the system callout and the click after the hold are
   * suppressed, and Android's own `contextmenu` in the same press is not
   * emitted a second time.
   * @default false
   */
  readonly contextMenuOnLongPress = input(false);

  /**
   * The current route. When set, the first link (in display order) whose
   * `route` equals it is the current item: it alone gets `aria-current="page"`
   * and the current look, whatever the router matches. When empty, the
   * sidenav follows the router: the link whose route equals the URL's path is
   * current, otherwise the one with the longest route the path starts with
   * (`/household` on `/household/members`; `/` only on `/`). Routes are
   * compared as written, so give them as absolute paths (`'/household'`).
   * @default ''
   */
  readonly activeRoute = input('');

  /** Theme variant for the sidenav */
  readonly theme = input<'light' | 'dark' | 'auto'>('auto');

  /**
   * Surface of the docked sidenav: `default` (the rail with background and
   * border) or `transparent` (no background, no border, items as 48 px pills
   * with radius full and 16 px labels; the current one on
   * `--color-surface-selected`). A drawer keeps its surface.
   */
  readonly variant = input<SidenavVariant>('default');

  /** Accessible name of the logo button that collapses/expands the sidebar. */
  readonly toggleAriaLabel = input('Toggle sidebar');

  /** Accessible name of the collapse button. Empty: "Collapse navigation to the left/right" by `position`. */
  readonly collapseAriaLabel = input('');

  /** Tooltip of the collapse button. */
  readonly collapseTitle = input('Collapse sidebar');

  /** Accessible name of the close button (drawer mode). */
  readonly closeAriaLabel = input('Close navigation');

  /**
   * Text read after an item's label when it has a badge, at every level. On
   * the collapsed rail, where labels are hidden, the label and this text name
   * the item. `{value}` is replaced with the badge value, e.g.
   * `'{value} offen'` → "Stammdaten 1 offen". The badge itself is hidden from
   * screen readers. Empty: the badge isn't read. Since 3.33 a badged rail
   * item has no `title` (it repeated the label as a description); its
   * tooltip still shows on hover and focus.
   *
   * @default '{value}'
   */
  readonly badgeAriaLabel = input('{value}');

  /**
   * Read after a busy item's text (3.44): "Berichte Wird geladen". German:
   * „Wird geladen“.
   * @default 'Loading'
   */
  readonly busyLabel = input('Loading');

  /**
   * Text of the loading row in an open group whose children are loading
   * (`childrenLoading`, 3.44). German: „Wird geladen …“.
   * @default 'Loading…'
   */
  readonly childrenLoadingLabel = input('Loading…');

  /**
   * Ids of the open groups, at any depth (3.47, usm-x row 41; two-way). A
   * value seeds and replaces the open set; every change (a toggle, the
   * current item's groups opening, a write to `expandedItems`) is reported as
   * the full list. Ids not yet in `items` stay and apply when the group
   * arrives (lazy loading). Opening a group through this input emits no
   * `expandRequested`. The first render, also prerendered, opens these ids
   * and the current item's groups; later the current item's groups open only
   * when the current item changes, not on an `items` update, so a group the
   * user folded stays folded.
   * @default []
   */
  readonly expandedGroups = model<readonly string[]>([]);

  /**
   * Text marked in every item label (3.47, usm-x row 46), e.g. a search
   * query: case-insensitive, every match, trimmed, in a
   * `<mark class="lc-sidenav__mark">` (bold, underlined, the label's ink).
   * Ignored when an `lcSidenavLabel` template is set (it gets the text in
   * its context). `''`: no marks.
   * @default ''
   */
  readonly highlight = input('');

  /**
   * The `lcSidenavLabel` template (3.47, usm-x row 46): replaces the label
   * text of every item, see `SidenavLabelDirective`.
   */
  protected readonly labelTemplate = contentChild(SidenavLabelDirective);

  /**
   * The `lcSidenavRail` template (3.51, request 072, backlog 071-n5): draws
   * the docked, collapsed rail's navigation, see `SidenavRailDirective`.
   */
  protected readonly railTemplate = contentChild(SidenavRailDirective);

  /**
   * Ids of the expanded parent items — the single source of truth for
   * `isExpanded`. (It used to be OR-ed with `hasActiveChild` at read time, so
   * toggling such a group flipped the set without ever closing it — the set
   * drifted out of sync with what was on screen.) 3.47: linked to
   * `expandedGroups`, which seeds and replaces it; the first value adds the
   * current item's groups, so they are open in the first (also prerendered)
   * render. A write is reported through `expandedGroups`.
   */
  readonly expandedItems: WritableSignal<Set<string>> = linkedSignal<readonly string[], Set<string>>({
    source: this.expandedGroups,
    computation: (ids, previous) => {
      if (!previous) return new Set([...ids, ...untracked(() => this.activeChildParents())]);
      return sameIds(ids, previous.value) ? previous.value : new Set(ids);
    },
  });

  /** Ids of the groups (any depth, 3.47) that contain the current item, top down. */
  private readonly activeChildParents = computed(() => currentItemParents(this.items(), this.currentItem()));

  /** The current item's id (3.47): its groups open when it changes, not on every `items` update. */
  private readonly currentItemId = computed(() => this.currentItem()?.id ?? null);

  /**
   * Computed sorted navigation items by displayOrder
   */
  readonly sortedItems = computed(() => sortNavigationItems(this.items()));

  /**
   * Every item rendered as a link, in display order (depth first): simple
   * items, the children of a group, the children of a section, and the
   * children of a section's sub-group.
   */
  private readonly linkItems = computed(() => navigationLinks(this.sortedItems()));

  /** The router URL's path: primary outlet only, no query, fragment or matrix parameters. */
  private readonly routerPath = computed(() => navigationPath(this.router, this.routerUrl()));

  /**
   * The one current link (or none). The single source of both the current
   * look (`lc-sidenav__nav-item--active`) and `aria-current="page"` (AS-16).
   * With `activeRoute` set: the first link whose route equals it. Without:
   * the router's path — the exact match wins, otherwise the longest link
   * route the path continues with a `/` (`/` matches only `/`); ties go to
   * the first link in display order. The rules live in
   * `internal/navigation` since 3.6, shared with `lc-sidenav-placeholder`.
   */
  private readonly currentItem = computed<NavigationItem | null>(() =>
    currentNavigationItem(this.linkItems(), this.activeRoute(), this.activeRoute() === '' ? this.routerPath() : ''),
  );

  /** Id of the foldable section that holds the current item (3.45), or null. */
  private readonly currentSectionId = computed<string | null>(() => {
    const current = this.currentItem();
    if (!current) return null;
    return this.sortedItems().find((item) => item.isSection && item.collapsible && containsItem(item, current))?.id ?? null;
  });

  /**
   * Event emitted when the sidenav should close
   */
  readonly closed = output<void>();

  /**
   * Event emitted when a navigation item is clicked
   */
  readonly itemClicked = output<NavigationItem>();

  /**
   * Event emitted when an item's action button is clicked
   */
  readonly itemAction = output<NavigationItem>();

  /**
   * An action button was pressed (3.47, usm-x row 42): `{ item, event,
   * element }`, for rows at any level and section headings, right after
   * `itemAction` and in the same cases. `element` is the button, to anchor a
   * menu to it and to return the focus to after the menu closes. While the
   * menu is open, set `aria-haspopup="menu"` and `aria-expanded="true"` on
   * `element` (`"false"` when it closes): a row's action button shows on
   * hover, on keyboard focus and while `aria-expanded="true"`. In the
   * drawer, render the menu inside the panel (the default slot): the drawer
   * is a modal dialog.
   */
  readonly itemActionClick = output<NavigationItemActionEvent>();

  /**
   * A group that loads its children on demand (`hasChildren`) was opened
   * while it has none (3.44): load them, set `childrenLoading` meanwhile.
   */
  readonly expandRequested = output<NavigationItem>();

  /**
   * A `contextmenu` event on an item (3.44): a right click, Shift+F10, the
   * Menu key or an Android long press (iOS fires none: pair it with the
   * item's `action` button, or set `contextMenuOnLongPress`, 3.45). The kit
   * doesn't call `preventDefault`. Not emitted for disabled items.
   */
  readonly itemContextMenu = output<NavigationItemContextMenuEvent>();

  /**
   * A `railItems` entry was pressed (3.50, usm-x row 74): `{ item, event,
   * element }`, right after `itemClicked`. `element` is the rail item's link
   * or button: open an `lc-menu` at a point 8 px beside the rail's edge, level
   * with the item (e.g. `{ x: element.closest('.lc-sidenav').getBoundingClientRect().right
   * + 8, y: element.getBoundingClientRect().top }`; the item itself ends
   * inside the rail) and pass it as the menu's `returnFocusTo`; set the item's
   * `id` as `expandedActionId` while open.
   */
  readonly railItemClick = output<NavigationRailItemEvent>();

  /** 3.50: `railItems` by `displayOrder`, or `null`. */
  protected readonly sortedRailItems = computed(() => {
    const rail = this.railItems();
    return rail ? sortNavigationItems(rail) : null;
  });

  /** 3.50: the docked, collapsed rail (where `[sidenav-rail-top]` and `railItems` show). */
  protected readonly dockedRail = computed(() => this.isRail() && this.effectiveMode() === 'docked');

  /** 3.50: the rail draws `railItems` (collapsed, docked, and set). */
  protected readonly showRailItems = computed(() => this.dockedRail() && this.sortedRailItems() !== null);

  /** 3.50: the current `railItems` entry: the first with `current`, else by route as for `items`. */
  private readonly currentRailItem = computed<NavigationItem | null>(() => {
    const rail = this.sortedRailItems();
    if (!rail) return null;
    return currentNavigationItem(rail, this.activeRoute(), this.activeRoute() === '' ? this.routerPath() : '');
  });

  /** 3.51 (071-n5): the `lcSidenavRail` template while the rail is docked and collapsed, else `null`. */
  protected readonly railTemplateOn = computed(() => (this.dockedRail() ? (this.railTemplate() ?? null) : null));

  /** 3.51: the rail width the template gets (`--lc-sidenav-rail-width`, read after render). */
  private readonly railWidth = signal(RAIL_WIDTH);

  /** 3.51: the `lcSidenavRail` template's context. */
  protected readonly railContext = computed<SidenavRailContext>(() => {
    const rail = this.sortedRailItems();
    return {
      $implicit: rail ?? this.sortedItems(),
      current: rail ? this.currentRailItem() : this.currentItem(),
      railWidth: this.railWidth(),
    };
  });

  /** 3.51 (071-n1): the rail draws `railItems` groups as menu buttons (`railGroupMenu`, no template). */
  protected readonly railGroupMenuOn = computed(() => this.railGroupMenu() && this.showRailItems() && !this.railTemplate());

  /** 3.51: id of the `railItems` group whose menu is open, or `null`. */
  protected readonly railMenuGroupId = signal<string | null>(null);

  /** 3.51: the open group: the live entry (`railItems` may be replaced while its menu is open). */
  protected readonly railMenuGroup = computed<NavigationItem | null>(() => {
    const id = this.railMenuGroupId();
    if (id === null || !this.railGroupMenuOn()) return null;
    return this.sortedRailItems()?.find((item) => item.id === id && isNavigationGroup(item)) ?? null;
  });

  /** 3.51: the side the group menu opens to (by the rail's place, set on open). */
  protected readonly railMenuSide = signal<MenuPosition>('right-start');

  /** 3.51: the group menu's `maxWidth` (`--lc-sidenav-rail-menu-max-width`, read on open). */
  protected readonly railMenuMaxWidth = signal(RAIL_MENU_MAX_WIDTH);

  /** 3.51: the current link among the rail groups' entries (the rail rules: `current`, then by route). */
  private readonly railMenuCurrent = computed<NavigationItem | null>(() => {
    const rail = this.sortedRailItems();
    if (!rail || !this.railGroupMenu()) return null;
    const links = rail.filter((item) => isNavigationGroup(item)).flatMap((group) => menuLinks(group.children ?? []));
    return currentNavigationItem(links, this.activeRoute(), this.activeRoute() === '' ? this.routerPath() : '');
  });

  /** 3.51: the open group's children as menu entries. */
  protected readonly railMenuItems = computed<MenuItem[]>(() => {
    const group = this.railMenuGroup();
    return group ? this.toMenuItems(group.children ?? [], this.railMenuCurrent()) : [];
  });

  /** 3.51: the open group loads its children (`childrenLoading`, or `hasChildren` without any yet). */
  protected readonly railMenuLoading = computed(() => {
    const group = this.railMenuGroup();
    return !!group && (!!group.childrenLoading || (!!group.hasChildren && !group.children?.length));
  });

  /** 3.51: the rail's group buttons (any order; sorted by DOM position where used). */
  private readonly railGroupButtons = viewChildren<ElementRef<HTMLElement>>('railGroup');

  /** 3.51: the hidden box the group menu is anchored to. */
  private readonly railAnchor = viewChild<ElementRef<HTMLElement>>('railAnchor');

  /**
   * 3.51: where the focus returns when the group menu closes: the open
   * group's rail button, looked up in the view (also after a re-render).
   */
  protected readonly railMenuReturn = computed<HTMLElement | null>(() => {
    const group = this.railMenuGroup();
    if (!group) return null;
    const groups = (this.sortedRailItems() ?? []).filter((item) => isNavigationGroup(item));
    // compareDocumentPosition: 4 = the other node follows
    const buttons = this.railGroupButtons()
      .map((ref) => ref.nativeElement)
      .sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1));
    return buttons[groups.indexOf(group)] ?? null;
  });

  /** Whether the drawer panel is rendered (drawer mode and open). */
  private readonly drawerOpen = computed(() => this.isOpen() && this.effectiveMode() === 'drawer');
  /** Whether the drawer panel was shown without a close after it. */
  private drawerShown = false;
  /**
   * The environment injector: a node injector would cancel the focus-return
   * hook when the sidenav is destroyed while open.
   */
  private readonly environmentInjector = inject(EnvironmentInjector);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.routerUrl.set(this.router.url));

    // React to mobileBreakpoint changes
    effect(() => {
      this.mobileBreakpoint(); // track dependency
      this.setupMediaQuery();
    });

    // Navigating into a group opens it: add the active child's parent(s) to
    // the expanded set. Only additive — the user's own collapses/expands of
    // other groups survive a route change. 3.47 (usm-x row 41): only when the
    // current item's id changes; an `items` update (children loaded) keeps a
    // group the user folded over the current item folded.
    effect(() => {
      this.currentItemId();
      untracked(() => {
        const parents = this.activeChildParents();
        if (parents.length === 0) return;
        const expanded = this.expandedItems();
        if (parents.every((id) => expanded.has(id))) return;
        this.expandedItems.set(new Set([...expanded, ...parents]));
      });
    });

    // 3.47: every change of the open set is reported through `expandedGroups`.
    effect(() => {
      const open = this.expandedItems();
      untracked(() => {
        if (!sameIds(this.expandedGroups(), open)) this.expandedGroups.set([...open]);
      });
    });

    // 3.45: the current item moving into a folded section unfolds it. The
    // computed id changes only when the current item's section does, so a
    // section the user folds over the current item stays folded.
    effect(() => {
      const id = this.currentSectionId();
      if (id === null) return;
      const folded = untracked(this.collapsedSections);
      if (folded.includes(id)) this.collapsedSections.set(folded.filter((s) => s !== id));
    });

    // 3.35: `returnFocusTo` after the drawer panel closed. Untracked: a
    // change of the input alone must not schedule anything.
    // 3.47 (usm-x row 44): the open drawer is a layer of the overlay stack,
    // so Escape closes it only while nothing (a modal, the command palette, a
    // menu, popover or tooltip) stands above it.
    effect(() => {
      const open = this.drawerOpen();
      untracked(() => {
        if (open) {
          this.drawerShown = true;
          this.overlayStack.push(this.drawerStackId);
        } else {
          this.overlayStack.remove(this.drawerStackId);
          this.drawerClosed();
        }
      });
    });

    // 3.51 (071-n1): the group menu belongs to the docked, collapsed rail; it
    // is forgotten when the rail expands or turns into the drawer.
    effect(() => {
      if (!this.railGroupMenuOn()) untracked(() => this.railMenuGroupId.set(null));
    });

    // 3.51 (071-n5): the rail width for the `lcSidenavRail` context, read
    // once the template's rail has rendered (56 on the server).
    afterRenderEffect(() => {
      if (!this.railTemplateOn()) return;
      untracked(() => {
        const width = this.readRailWidth();
        if (width !== this.railWidth()) this.railWidth.set(width);
      });
    });

    // 3.44: busy and disabled items (`aria-disabled="true"`) ignore click,
    // Enter and Space. `RouterLink` navigates whatever `defaultPrevented`
    // says, so a capture listener on the host stops the click before it
    // reaches the link (or the button's handler). Code, not a template
    // binding: a template listener only bubbles.
    afterNextRender(() => {
      const host = this.host.nativeElement;
      host.addEventListener('click', this.blockInertClick, true);
      // 3.45: long press (`contextMenuOnLongPress`). In code, not in the
      // template, so prerendered HTML carries no listener markup.
      host.addEventListener('pointerdown', this.onLongPressStart);
      host.addEventListener('pointermove', this.onLongPressMove);
      host.addEventListener('pointerup', this.onLongPressEnd);
      host.addEventListener('pointercancel', this.onLongPressEnd);
      host.addEventListener('contextmenu', this.onNativeContextMenu, true);
      // 3.47: a truncated label gets its full text as `title` when the
      // pointer enters its item (never in prerendered HTML).
      host.addEventListener('pointerover', this.onItemPointerOver);
      // 3.50 (usm-x row 76): and when an item takes the focus (capture: before
      // the item's kit tooltip shows).
      host.addEventListener('focus', this.onItemPointerOver, true);
    });
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlayStack = inject(OverlayStackService);

  /** Prefix of the ids the template links (`aria-controls` of a foldable section). */
  private readonly baseId = `lc-sidenav-${++nextSidenavId}`;

  /** The open drawer's id in the overlay stack (3.47). */
  private readonly drawerStackId = `${this.baseId}-drawer`;

  /**
   * The label whose text is cut by its ellipsis, under the pointer (3.47):
   * it alone carries a `title` with the full label.
   */
  private readonly truncatedLabel = signal<Element | null>(null);

  /** 3.50 (usm-x row 76): the item element whose label is cut (`truncatedLabel`'s row). */
  private readonly truncatedRow = signal<Element | null>(null);

  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);

  /**
   * Pointer over an item (3.47), or (3.50) focus on it: its label's `title`
   * follows whether the label is cut, and so (3.50, usm-x row 76) does the
   * text of a row's kit tooltip. The tooltip reads its text when it shows (on
   * the same `mouseenter` / `focus`), so a change is rendered right away: the
   * pointer events come before the mouse events, and this focus listener
   * runs in the capture phase, before the item's own.
   */
  private readonly onItemPointerOver = (event: Event): void => {
    const item = (event.target as Element | null)?.closest?.('.lc-sidenav__nav-item') ?? null;
    const label = item?.querySelector('.lc-sidenav__nav-label') ?? null;
    if (!label) return;
    const cut = label.scrollWidth > label.clientWidth;
    const row = this.truncatedRow();
    if (cut) {
      this.truncatedLabel.set(label);
      this.truncatedRow.set(item);
    } else if (this.truncatedLabel() === label) {
      this.truncatedLabel.set(null);
      this.truncatedRow.set(null);
    }
    if (this.truncatedRow() !== row) this.changeDetector.detectChanges();
  };

  /** The running long press (3.45): its timer, start point and pointer. */
  private longPress: { timer: ReturnType<typeof setTimeout>; x: number; y: number; pointerId: number } | null = null;
  /** When the last long press emitted (ms), until the next press: Android's own `contextmenu` in it is dropped. */
  private longPressFiredAt: number | null = null;
  /** The click after an emitted long press is swallowed. */
  private suppressNextClick = false;
  /** While the kit dispatches its own `contextmenu`, the capture guard lets it through. */
  private dispatchingLongPress = false;

  private readonly onLongPressStart = (event: PointerEvent): void => {
    this.cancelLongPress();
    this.longPressFiredAt = null;
    this.suppressNextClick = false;
    if (!this.contextMenuOnLongPress() || event.pointerType !== 'touch') return;
    const target = (event.target as Element | null)?.closest?.('.lc-sidenav__nav-item');
    if (!target) return;
    const x = event.clientX;
    const y = event.clientY;
    const timer = setTimeout(() => {
      this.longPress = null;
      this.longPressFiredAt = Date.now();
      this.suppressNextClick = true;
      this.dispatchingLongPress = true;
      try {
        target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
      } finally {
        this.dispatchingLongPress = false;
      }
    }, LONG_PRESS_MS);
    this.longPress = { timer, x, y, pointerId: event.pointerId };
  };

  private readonly onLongPressMove = (event: PointerEvent): void => {
    const press = this.longPress;
    if (!press || event.pointerId !== press.pointerId) return;
    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > LONG_PRESS_SLOP_PX) this.cancelLongPress();
  };

  private readonly onLongPressEnd = (): void => {
    this.cancelLongPress();
  };

  /**
   * Capture guard for `contextmenu` (3.45): Android fires its own on a long
   * press. Before the kit's: the kit's is cancelled (the native one is
   * emitted). After the kit's, in the same press: dropped, so the item is
   * emitted once.
   */
  private readonly onNativeContextMenu = (event: MouseEvent): void => {
    if (this.dispatchingLongPress) return;
    if (this.longPress) {
      this.cancelLongPress();
      return;
    }
    if (this.longPressFiredAt !== null && Date.now() - this.longPressFiredAt < LONG_PRESS_ECHO_MS) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  private cancelLongPress(): void {
    if (this.longPress) clearTimeout(this.longPress.timer);
    this.longPress = null;
  }

  /** Capture-phase click guard for busy and disabled items (3.44). */
  private readonly blockInertClick = (event: MouseEvent): void => {
    const target = event.target as Element | null;
    // 3.45: the click that ends an emitted long press does nothing.
    if (this.suppressNextClick) {
      this.suppressNextClick = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (target?.closest?.('.lc-sidenav__nav-item[aria-disabled="true"]')) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  ngOnDestroy(): void {
    this.teardownMediaQuery();
    this.drawerClosed();
    this.cancelLongPress();
    const host = this.host.nativeElement;
    host.removeEventListener?.('click', this.blockInertClick, true);
    host.removeEventListener?.('pointerdown', this.onLongPressStart);
    host.removeEventListener?.('pointermove', this.onLongPressMove);
    host.removeEventListener?.('pointerup', this.onLongPressEnd);
    host.removeEventListener?.('pointercancel', this.onLongPressEnd);
    host.removeEventListener?.('contextmenu', this.onNativeContextMenu, true);
    host.removeEventListener?.('pointerover', this.onItemPointerOver);
    host.removeEventListener?.('focus', this.onItemPointerOver, true);
    this.overlayStack.remove(this.drawerStackId);
  }

  /** Ends a shown drawer panel; schedules `returnFocusTo` when set. */
  private drawerClosed(): void {
    if (!this.drawerShown) return;
    this.drawerShown = false;
    if (this.returnFocusTo()) this.scheduleFocusReturn();
  }

  /**
   * Focuses `returnFocusTo` after the next render: the template refresh has
   * removed the panel, and `cdkTrapFocus` has restored its captured element
   * on destroy, so this is the last focus write. Reads the input again then,
   * so a trigger re-rendered meanwhile is taken from a fresh query.
   */
  private scheduleFocusReturn(): void {
    afterNextRender(
      () => {
        const target = this.returnFocusTo();
        if (this.drawerShown || !target?.isConnected) return;
        focusReturnTarget(target);
      },
      { injector: this.environmentInjector },
    );
  }

  private setupMediaQuery(): void {
    if (typeof window === 'undefined') return;
    this.teardownMediaQuery();
    this.mediaQuery = window.matchMedia(`(max-width: ${this.mobileBreakpoint()}px)`);
    this.isMobile.set(this.mediaQuery.matches);
    this.mediaQuery.addEventListener('change', this.mediaHandler);
  }

  private teardownMediaQuery(): void {
    this.mediaQuery?.removeEventListener('change', this.mediaHandler);
    this.mediaQuery = null;
  }

  /**
   * Computed CSS classes for the sidenav
   */
  sidenavClasses = computed(() => {
    const classes = ['lc-sidenav'];
    classes.push(`lc-sidenav--${this.position()}`);
    classes.push(`lc-sidenav--${this.effectiveMode()}`);
    if (this.isOpen()) {
      classes.push('lc-sidenav--open');
    }
    if (this.collapsed() && !this.isMobile()) {
      classes.push('lc-sidenav--collapsed');
    }
    if (this.theme() !== 'auto') {
      classes.push(`lc-sidenav--${this.theme()}`);
    }
    if (this.variant() === 'transparent') {
      classes.push('lc-sidenav--transparent');
    }
    return classes.join(' ');
  });

  /**
   * Computed inline styles for the sidenav
   */
  sidenavStyles = computed(() => ({
    width: this.isMobile() ? this.width() : (this.collapsed() ? '56px' : this.width()),
  }));

  /**
   * The brand tile's letter when there is no `brandIcon`: `brandLetter`
   * (3.44), else the name's first character, upper-cased.
   */
  protected readonly brandInitial = computed(
    () => this.brandLetter().trim() || ([...this.brandName().trim()][0] ?? '').toUpperCase(),
  );

  /** Whether the rail shows only icons (as `lc-sidenav--collapsed`). */
  protected readonly isRail = computed(() => this.collapsed() && !this.isMobile());

  /**
   * Visually hidden badge text: `badge.ariaLabel` (3.44), else
   * `badgeAriaLabel` with `{value}`; on the rail, where labels are hidden,
   * after the label.
   */
  protected badgeText(item: NavigationItem): string {
    if (!item.badge) return '';
    const text = item.badge.ariaLabel ?? this.badgeAriaLabel().replace('{value}', String(item.badge.value));
    return this.isRail() ? `${item.label} ${text}` : text;
  }

  /**
   * Visually hidden busy text (3.44): `busyLabel`; on the rail, where labels
   * are hidden, after the label, unless the badge text already leads with it
   * („Berichte Wird geladen“).
   */
  protected busyText(item: NavigationItem): string {
    return this.isRail() && !item.badge ? `${item.label} ${this.busyLabel()}` : this.busyLabel();
  }

  /**
   * An item's `title` on the rail: its label, unless the hidden text already
   * names it with more (a badge since 3.33, busy since 3.45), so the name is
   * not read again as the description (backlog 064-n9).
   */
  protected railTitle(item: NavigationItem): string {
    return this.collapsed() && !item.badge && !item.busy ? item.label : '';
  }

  /**
   * A rail badge whose value is longer than 2 characters becomes a dot (3.45,
   * backlog 064-n7): „56/60“ covered the icon. The value stays in the hidden
   * name and the tooltip.
   */
  protected railBadgeDot(item: NavigationItem): boolean {
    return this.isRail() && !!item.badge && String(item.badge.value).length > 2;
  }

  /**
   * A label's `title` (3.47, usm-x row 46): the full label while its text is
   * cut by the ellipsis (checked when the pointer enters the item), not on
   * the rail (its tooltip names the item) and not when the row has a kit
   * tooltip (`rowTooltip`). `null`: no attribute.
   */
  protected labelTitle(item: NavigationItem, label: Element): string | null {
    return this.truncatedLabel() === label && !this.isRail() && !this.rowTooltip(item) ? item.label : null;
  }

  /** The trimmed `highlight` (3.47). */
  protected readonly highlightText = computed(() => this.highlight().trim());

  /**
   * The label split into marked and plain parts (3.47): every
   * case-insensitive match of `highlight`, as `lc-command-palette` marks.
   */
  protected labelParts(label: string): readonly LabelPart[] {
    const q = this.highlightText();
    if (!q) return [{ text: label, mark: false }];
    const lower = label.toLocaleLowerCase();
    const needle = q.toLocaleLowerCase();
    const out: LabelPart[] = [];
    let from = 0;
    for (let at = lower.indexOf(needle); at !== -1; at = lower.indexOf(needle, from)) {
      if (at > from) out.push({ text: label.slice(from, at), mark: false });
      out.push({ text: label.slice(at, at + needle.length), mark: true });
      from = at + needle.length;
    }
    if (from < label.length) out.push({ text: label.slice(from), mark: false });
    return out;
  }

  /** A `collapsible` section listed in `collapsedSections` (3.45). */
  protected isSectionFolded(item: NavigationItem): boolean {
    return !!item.collapsible && this.collapsedSections().includes(item.id);
  }

  /** Id of a foldable section's list, for its button's `aria-controls` (3.45). */
  protected sectionListId(item: NavigationItem): string {
    return `${this.baseId}-section-${item.id}`;
  }

  /** Folds or unfolds a `collapsible` section (3.45). */
  toggleSection(item: NavigationItem): void {
    if (!item.collapsible) return;
    const folded = this.collapsedSections();
    this.collapsedSections.set(folded.includes(item.id) ? folded.filter((id) => id !== item.id) : [...folded, item.id]);
  }

  /** Where the row tooltip opens (3.44): beside the item, below it on the rail (clear of the label tooltip). */
  protected readonly tooltipSide = computed<TooltipPosition>(() => (this.isRail() ? 'bottom' : 'right'));

  /** Whether the item is a collapsible group (with children, or loading them on demand, 3.44). */
  protected isGroup(item: NavigationItem): boolean {
    return isNavigationGroup(item);
  }

  /** Busy or disabled (3.44): `aria-disabled`, activation ignored. */
  protected isBlocked(item: NavigationItem): boolean {
    return !!item.busy || !!item.disabled;
  }

  /** A disabled item without a reason leaves the tab order (3.44). */
  protected itemTabIndex(item: NavigationItem): number | null {
    return item.disabled && !item.disabledReason ? -1 : null;
  }

  /**
   * The row tooltip (3.44): `disabledReason` while disabled, else `tooltip`,
   * then the badge's `tooltip` after " · ". Empty: no tooltip.
   */
  /** 3.48 (backlog 067-n4): `aria-expanded` of an action button with `hasPopup`; `null` without. */
  protected actionExpanded(item: NavigationItem): string | null {
    return item.action?.hasPopup ? String(this.expandedActionId() === item.id) : null;
  }

  protected rowTooltip(item: NavigationItem, row?: Element): string {
    const text = this.rowTooltipText(item);
    // 3.50 (usm-x row 76): a cut label shows its full text in the tooltip
    // („{label} · {tooltip}“; the row has no `title` then). Not on the rail.
    if (text && this.labelLeadsTooltip(row)) return `${item.label} · ${text}`;
    return text;
  }

  /**
   * 3.51 (request 072, backlog 071-n8): the row tooltip's description while
   * the cut label leads its visible text: the tooltip text without the label,
   * so the label (the row's name) is heard once. `''`: the visible text.
   */
  protected rowTooltipDescription(item: NavigationItem, row?: Element): string {
    return this.labelLeadsTooltip(row) ? this.rowTooltipText(item) : '';
  }

  /** The row tooltip without the label: reason or tooltip, then the badge's tooltip. */
  private rowTooltipText(item: NavigationItem): string {
    const main = item.disabled ? (item.disabledReason ?? '') : (item.tooltip ?? '');
    return [main, item.badge?.tooltip ?? ''].filter(Boolean).join(' · ');
  }

  /** The row's label is cut, so its tooltip leads with the label (not on the rail). */
  private labelLeadsTooltip(row?: Element): boolean {
    return !!row && this.truncatedRow() === row && !this.isRail();
  }

  /** 3.50 (usm-x row 74): `aria-expanded` of a `kind: 'action'` item with `hasPopup`; `null` without. */
  protected itemExpanded(item: NavigationItem): string | null {
    return item.kind === 'action' && item.hasPopup ? String(this.expandedActionId() === item.id) : null;
  }

  /** 3.50: `aria-haspopup` of a `kind: 'action'` item; `null` without. */
  protected itemHasPopup(item: NavigationItem): string | null {
    return item.kind === 'action' && item.hasPopup ? item.hasPopup : null;
  }

  /** 3.50: whether a `railItems` entry is the rail's current one. */
  protected isRailItemActive(item: NavigationItem): boolean {
    return this.currentRailItem() === item;
  }

  /** 3.50 (usm-x row 74): a `railItems` entry was pressed: `itemClicked`, then `railItemClick` with the element. */
  protected handleRailItemClick(event: MouseEvent, item: NavigationItem): void {
    if (this.isBlocked(item)) return;
    this.itemClicked.emit(item);
    this.railItemClick.emit({ item, event, element: event.currentTarget as HTMLElement });
  }

  /** 3.51 (071-n1): a rail group contains the current link of the group menus. */
  protected railGroupHoldsCurrent(item: NavigationItem): boolean {
    const current = this.railMenuCurrent();
    return !!current && containsItem(item, current);
  }

  /** 3.51: `aria-current` of a rail group: `page` when it is current itself, `true` when its menu holds the current link. */
  protected railGroupCurrent(item: NavigationItem): string | null {
    if (this.isRailItemActive(item)) return 'page';
    return this.railGroupHoldsCurrent(item) ? 'true' : null;
  }

  /**
   * 3.51 (071-n1): a press on a rail group (pointer, Enter, Space): emitted
   * as any rail entry (`itemClicked`, `railItemClick`), then its menu opens,
   * or closes when it is open.
   */
  protected onRailGroupClick(event: MouseEvent, item: NavigationItem, button: HTMLElement): void {
    if (this.isBlocked(item)) return;
    this.itemClicked.emit(item);
    this.railItemClick.emit({ item, event, element: button });
    if (this.railMenuGroupId() === item.id) this.railMenuGroupId.set(null);
    else this.openRailMenu(item, button);
  }

  /** 3.51: the arrow towards the menu (right, or left when it opens left) opens it. */
  protected onRailGroupKeydown(event: KeyboardEvent, item: NavigationItem, button: HTMLElement): void {
    const towards = this.railMenuSideFor(button) === 'right-start' ? 'ArrowRight' : 'ArrowLeft';
    if (event.key !== towards || this.isBlocked(item)) return;
    event.preventDefault();
    if (this.railMenuGroupId() !== item.id) this.openRailMenu(item, button);
  }

  /** 3.51: an entry of the group menu was chosen: the menu closes, a link navigates, `itemClicked`. */
  protected onRailMenuItem(entry: MenuItem): void {
    const group = this.railMenuGroup();
    const item = group ? findNavigationItem(group.children ?? [], entry.id) : null;
    if (!item) return;
    this.railMenuGroupId.set(null);
    if (item.kind !== 'action' && item.route) void this.router.navigateByUrl(item.route);
    this.itemClicked.emit(item);
  }

  /**
   * 3.51: opens a group's menu: the anchor box spans the rail's border box
   * at the item's height (so the panel starts 8 px outside the rail), on the
   * side away from the nearer viewport edge. Another open group menu closes
   * first; this one opens after that render, so its pane is placed anew.
   */
  private openRailMenu(item: NavigationItem, button: HTMLElement): void {
    if (this.railMenuGroupId() !== null) {
      this.railMenuGroupId.set(null);
      afterNextRender(() => this.openRailMenu(item, button), { injector: this.injector });
      return;
    }
    this.requestChildren(item);
    this.placeRailAnchor(button);
    this.railMenuSide.set(this.railMenuSideFor(button));
    this.railMenuMaxWidth.set(this.readRailMenuMaxWidth());
    this.railMenuGroupId.set(item.id);
  }

  /** 3.51: the anchor box: the rail's border box (left −clientLeft, its offsetWidth), the item's top and height. */
  private placeRailAnchor(button: HTMLElement): void {
    const anchor = this.railAnchor()?.nativeElement;
    const aside = button.closest<HTMLElement>('.lc-sidenav');
    if (!anchor || !aside) return;
    const box = aside.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    anchor.style.left = `${-aside.clientLeft}px`;
    anchor.style.width = `${aside.offsetWidth}px`;
    anchor.style.top = `${rect.top - box.top - aside.clientTop + aside.scrollTop}px`;
    anchor.style.height = `${rect.height}px`;
  }

  /** 3.51: `right-start` while the rail's centre is in the viewport's left half, else `left-start`. */
  private railMenuSideFor(button: HTMLElement): MenuPosition {
    const rail = (button.closest<HTMLElement>('.lc-sidenav') ?? button).getBoundingClientRect();
    const viewport = button.ownerDocument.documentElement.clientWidth || button.ownerDocument.defaultView?.innerWidth || 0;
    return rail.left + rail.width / 2 <= viewport / 2 ? 'right-start' : 'left-start';
  }

  /** 3.51: `--lc-sidenav-rail-menu-max-width` on the sidenav or an ancestor, else `20rem`. */
  private readRailMenuMaxWidth(): string {
    if (typeof getComputedStyle !== 'function') return RAIL_MENU_MAX_WIDTH;
    return getComputedStyle(this.host.nativeElement).getPropertyValue('--lc-sidenav-rail-menu-max-width').trim() || RAIL_MENU_MAX_WIDTH;
  }

  /** 3.51: `--lc-sidenav-rail-width` in px (56 when it is not a px length). */
  private readRailWidth(): number {
    if (typeof getComputedStyle !== 'function') return RAIL_WIDTH;
    const value = getComputedStyle(this.host.nativeElement).getPropertyValue('--lc-sidenav-rail-width').trim();
    const width = parseFloat(value);
    return value.endsWith('px') && width > 0 ? width : RAIL_WIDTH;
  }

  /**
   * 3.51 (071-n1, design §2): rail group entries as menu entries: label,
   * icon, disabled / reason, tooltip, busy, hint (subtitle), badge (value,
   * variant), current; nested groups and sections become sections.
   */
  private toMenuItems(items: readonly NavigationItem[], current: NavigationItem | null): MenuItem[] {
    return sortNavigationItems(items).map((item): MenuItem => {
      if (item.isSection || isNavigationGroup(item)) {
        return { id: item.id, label: item.label, children: this.toMenuItems(item.children ?? [], current) };
      }
      const entry: MenuItem = { id: item.id, label: item.label };
      if (item.icon) entry.icon = item.icon;
      if (item.disabled) entry.disabled = true;
      if (item.disabledReason) entry.disabledReason = item.disabledReason;
      if (item.tooltip) entry.tooltip = item.tooltip;
      if (item.busy) entry.busy = true;
      if (item.hint || item.badge) {
        entry.metadata = {};
        if (item.hint) entry.metadata.subtitle = item.hint;
        if (item.badge) entry.metadata.badge = String(item.badge.value);
      }
      if (item.badge) entry.badgeVariant = item.badge.variant ?? 'default';
      if (item.current || item === current) entry.current = true;
      return entry;
    });
  }

  /**
   * 3.50 (usm-x row 74): the brand toggle's name: the brand (`brandAriaLabel`,
   * else name and subtitle), then what a press does.
   */
  protected readonly brandToggleLabel = computed(() => {
    const brand = this.brandAriaLabel() || [this.brandName(), this.brandSubtitle()].filter(Boolean).join(' ');
    return `${brand}, ${this.collapseToggleLabel()}`;
  });

  /** 3.50: the brand is the rail toggle (`brandToggle`, docked). */
  protected readonly brandIsToggle = computed(() => this.brandToggle() && this.effectiveMode() === 'docked');

  /** 3.50 (usm-x row 75): `brandLogoSrc` drawn at its own ratio, without the tile (expanded only). */
  protected readonly naturalLogo = computed(
    () => this.brandLogoFit() === 'natural' && !!this.brandLogoSrc() && !this.isRail(),
  );

  /** `contextmenu` on an item (3.44): emitted, never prevented; not for disabled items. */
  protected onContextMenu(event: MouseEvent, item: NavigationItem): void {
    if (item.disabled) return;
    this.itemContextMenu.emit({ item, event });
  }

  /** The collapse button's accessible name: what a press does. */
  protected readonly collapseToggleLabel = computed(() =>
    this.collapsed()
      ? this.expandAriaLabel()
      : this.collapseAriaLabel() ||
        (this.position() === 'right' ? 'Collapse navigation to the right' : 'Collapse navigation to the left'),
  );

  /** The collapse button's chevron points where the rail moves: ⟨ to collapse a left rail, ⟩ to expand it (mirrored on the right). */
  protected readonly collapseToggleIcon = computed(() => {
    const towardsLeft = this.position() === 'right' ? this.collapsed() : !this.collapsed();
    return towardsLeft ? 'chevron-left' : 'chevron-right';
  });

  /**
   * Toggle collapsed state
   */
  toggleCollapsed(): void {
    this.collapsed.set(!this.collapsed());
  }

  /** The brand link closes the drawer on a phone, as the items do. */
  handleBrandClick(): void {
    if (this.isMobile()) {
      this.handleClose();
    }
  }

  /**
   * Handle close action
   */
  handleClose(): void {
    this.closed.emit();
  }

  /**
   * Handle navigation item click
   */
  handleItemClick(item: NavigationItem): void {
    // 3.44: the capture listener stops these clicks first; a direct call too.
    if (this.isBlocked(item)) return;
    this.itemClicked.emit(item);
    // Auto-close drawer on mobile after navigation
    if (this.isMobile()) {
      this.handleClose();
    }
  }

  /**
   * Handle action button click on a navigation item
   */
  handleItemAction(event: Event, item: NavigationItem): void {
    event.stopPropagation();
    this.itemAction.emit(item);
    // 3.47 (usm-x row 42): the same press with its event and button.
    this.itemActionClick.emit({ item, event: event as MouseEvent, element: event.currentTarget as HTMLButtonElement });
  }

  /**
   * Whether the item is the current link (see `currentItem`): it alone is
   * painted current and carries `aria-current="page"`.
   */
  isItemActive(item: NavigationItem): boolean {
    return this.currentItem() === item;
  }

  /**
   * Check if a parent item contains the current link (3.47: at any depth
   * below it, also while folded).
   */
  hasActiveChild(item: NavigationItem): boolean {
    const current = this.currentItem();
    return !!current && containsItem(item, current);
  }

  /**
   * Toggle expansion of a parent item.
   * If the sidenav is collapsed, expand it first.
   */
  toggleExpanded(item: NavigationItem): void {
    if (this.isBlocked(item)) return;
    if (this.collapsed()) {
      this.collapsed.set(false);
      // Expand the clicked item after uncollapsing
      const expanded = new Set(this.expandedItems());
      expanded.add(item.id);
      this.expandedItems.set(expanded);
      this.requestChildren(item);
      return;
    }
    const expanded = new Set(this.expandedItems());
    if (expanded.has(item.id)) {
      expanded.delete(item.id);
    } else {
      expanded.add(item.id);
      this.requestChildren(item);
    }
    this.expandedItems.set(expanded);
  }

  /** 3.44: opening a group that loads on demand and has no children yet asks for them. */
  private requestChildren(item: NavigationItem): void {
    if (item.hasChildren && !item.children?.length) this.expandRequested.emit(item);
  }

  /**
   * Check if an item is expanded
   */
  isExpanded(item: NavigationItem): boolean {
    return this.expandedItems().has(item.id);
  }

  /**
   * Handle keyboard navigation. Keyed on the EFFECTIVE mode: a docked sidenav
   * that has become a drawer below the mobile breakpoint must close on Escape
   * like any drawer. 3.47 (usm-x row 44): an Escape another handler already
   * took (`defaultPrevented`) is ignored, and the drawer closes only while it
   * is the top-most layer of the overlay stack (no modal, command palette,
   * menu, popover or tooltip above it); it then prevents the default.
   */
  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.isOpen() || this.effectiveMode() !== 'drawer') return;
    if (event.defaultPrevented) return;
    if (!this.overlayStack.claim(this.drawerStackId, event)) return;
    event.preventDefault();
    this.handleClose();
  }
}
