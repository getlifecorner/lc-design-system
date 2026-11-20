import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { fn, expect, userEvent, within } from 'storybook/test';
import { FormsModule } from '@angular/forms';
import type { NavigationItem, NavigationItemActionEvent, NavigationRailItemEvent } from '@lifecorner/angular-ui-kit/models';
import { SidenavComponent } from './sidenav.component';
import { IconComponent } from '../icon/icon.component';
import { SidenavLabelDirective } from './sidenav-label.directive';
import { SidenavRailDirective } from './sidenav-rail.directive';
import { HeaderComponent } from '../header/header.component';
import { MenuComponent, type MenuItem } from '../menu/menu.component';
import { SelectComponent, type SelectOption } from '../select/select.component';
import { SearchInputComponent } from '../search-input/search-input.component';

/**
 * Sidenav provides a vertical navigation panel for application-level routing.
 * Supports docked (always visible) and drawer (overlay) modes with left/right
 * positioning. Automatically switches to drawer on narrow viewports.
 *
 * Items can have icons, nested children, section headlines, action buttons,
 * badges, active-route highlighting, and an integrated logo header for
 * sidebar-first layouts.
 */
const meta: Meta<SidenavComponent> = {
  title: 'Navigation/Sidenav',
  component: SidenavComponent,
  args: {
    closed: fn(),
    itemClicked: fn(),
    itemAction: fn(),
  },
  argTypes: {
    closed: { action: 'closed', description: 'Emitted when the sidenav is closed (drawer mode)' },
    itemClicked: { action: 'itemClicked', description: 'Emitted with the NavigationItem when an item is clicked' },
    itemAction: { action: 'itemAction', description: 'Emitted with the NavigationItem when an action button is clicked' },
    mode: {
      control: 'select',
      options: ['drawer', 'docked'],
      description: 'Docked stays visible, drawer overlays content',
    },
    position: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Which side of the viewport the nav appears on',
    },
    isOpen: { description: 'Whether the sidenav is currently visible' },
    collapsed: { description: 'Collapse to 56px icon-rail mode' },
    activeRoute: {
      description:
        'The current route. Set: the first link whose `route` equals it is the current item (`aria-current="page"` and the current look), whatever the router matches. Empty: the link whose route equals the router URL\'s path, otherwise the longest route the path starts with (`/` only on `/`). Routes are compared as written, so give them as absolute paths (`\'/household\'`)',
      table: { defaultValue: { summary: "''" } },
    },
    width: { description: 'Custom width (CSS value, e.g. "280px")' },
    showLogo: { description: 'Show the logo at the top of the sidenav (for sidebar-first layouts)' },
    logoSize: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description:
        'Size of the brand logo when `showLogo=true`. The logo area grows automatically so the logo is never clipped. Default is `md` (64px) which aligns with `<lc-header size="md">`. Use `lg`/`xl` for an extra-prominent brand block.',
      table: { defaultValue: { summary: 'md' } },
    },
    mobileBreakpoint: {
      control: 'number',
      description: 'Viewport width (px) below which docked mode switches to drawer',
    },
    theme: {
      control: 'select',
      options: ['auto', 'light', 'dark'],
      description: 'Theme variant — sets internal tokens (--lc-sidenav-bg, --lc-sidenav-fg, etc.)',
    },
    variant: {
      control: 'select',
      options: ['default', 'transparent'],
      description:
        '`default`: the rail with background and border. `transparent`: no background or border when docked, items as 48 px pills (radius full, 16 px labels), the current one on `--color-surface-selected`; a drawer keeps its surface',
      table: { defaultValue: { summary: 'default' } },
    },
    items: {
      control: 'object',
      description:
        'Navigation items (`NavigationItem[]`): `id`, `icon`, `label`, `route`, `displayOrder`; optional `children` (collapsible group), `isSection` (section headline), `collapsible` (3.45, on a section: a disclosure heading, see `collapsedSections`), `badge { value, variant?, ariaLabel?, tooltip? }` (3.45: on the rail a value longer than 2 characters shows as a dot), `action { icon, ariaLabel? }` (emits `itemAction`), `requiredRole` (for the app\'s own filtering). 3.44: `kind` (`link` | `action`), `current`, `hasChildren`, `childrenLoading`, `hint`, `matchRoutes`, `iconUrl`, `muted`, and the row states `busy`, `disabled`, `disabledReason`, `tooltip`',
      table: { defaultValue: { summary: '[]' } },
    },
    collapsedSections: {
      control: 'object',
      description:
        '3.45 (backlog 064-n2): ids of the folded `collapsible` sections (two-way). The heading holds a disclosure button (`aria-expanded`, `aria-controls`); the list is hidden while folded. The rail ignores folding; the current item moving into a folded section unfolds it',
      table: { defaultValue: { summary: '[]' } },
    },
    contextMenuOnLongPress: {
      control: 'boolean',
      description:
        '3.45 (backlog 064-n2): a 500 ms touch hold on an item emits `itemContextMenu` (iOS fires no `contextmenu`). A 10 px move cancels it; the callout and the click after the hold are suppressed; Android\'s own `contextmenu` in the same press is not emitted twice',
      table: { defaultValue: { summary: 'false' } },
    },
    brandName: {
      control: 'text',
      description:
        'Product name shown as a text brand at the top: an icon tile and the name, one link to home. Replaces the image logo (`showLogo`). As high as the image logo (`logoSize`, 64 px for `md` = `lc-header size="md"`); the name wraps to two lines at most and stays the accessible name; collapsed, only the tile shows. Never toggles the rail. Empty: no text brand',
      table: { defaultValue: { summary: "''" } },
    },
    brandIcon: {
      control: 'text',
      description: '`lc-icon` name in the brand tile (decorative). Empty: the tile shows the name\'s first letter. Renders nothing without `brandName`',
      table: { defaultValue: { summary: "''" } },
    },
    brandHref: {
      control: 'text',
      description: 'Plain URL of the brand link (a native `<a href>`, no router). Empty: `routerLink="/"`, as `lc-header`\'s `homeHref`',
      table: { defaultValue: { summary: "''" } },
    },
    brandAriaLabel: {
      control: 'text',
      description: "Accessible name of the brand link. Empty: the brand name. Start it with the visible name, e.g. `'Finance Intelligence – home'`",
      table: { defaultValue: { summary: "''" } },
    },
    showCollapseToggle: {
      control: 'boolean',
      description:
        'Docked mode: a button at the bottom of the rail collapses and expands it, on the icon column in both states. Independent of the brand. With `showLogo` the image logo toggles already, so use one of the two',
      table: { defaultValue: { summary: 'false' } },
    },
    expandAriaLabel: {
      control: 'text',
      description: 'Accessible name of the collapse button while the rail is collapsed. Expanded, it uses `collapseAriaLabel`',
      table: { defaultValue: { summary: "'Expand navigation'" } },
    },
    badgeAriaLabel: {
      control: 'text',
      description:
        "Text read after an item's label when it has a badge, at every level. On the collapsed rail, where labels are hidden, the label and this text name the item. `{value}` is replaced with the badge value, e.g. `'{value} offen'` → \"Stammdaten 1 offen\". The badge itself is hidden from screen readers. Empty: the badge isn't read. 3.44: `badge.ariaLabel` on an item wins",
      table: { defaultValue: { summary: "'{value}'" } },
    },
    busyLabel: {
      control: 'text',
      description: '3.44: read after a `busy` item\'s text („Berichte Wird geladen“). German „Wird geladen“',
      table: { defaultValue: { summary: "'Loading'" } },
    },
    childrenLoadingLabel: {
      control: 'text',
      description: '3.44: text of the loading row of an open group whose children load (`childrenLoading`). German „Wird geladen …“',
      table: { defaultValue: { summary: "'Loading…'" } },
    },
    brandSubtitle: {
      control: 'text',
      description: '3.44: a second line under `brandName` (the name then keeps one line); joins the link name. Hidden on the rail',
      table: { defaultValue: { summary: "''" } },
    },
    brandLetter: {
      control: 'text',
      description: '3.44: the brand tile\'s letter instead of the name\'s first one; `brandIcon` wins',
      table: { defaultValue: { summary: "''" } },
    },
    brandRoute: {
      control: 'text',
      description: '3.47 (usm-x row 39): `routerLink` of the brand when `brandHref` is empty, e.g. `\'/start\'`',
      table: { defaultValue: { summary: "'/'" } },
    },
    brandLink: {
      control: 'boolean',
      description:
        '3.47 (usm-x row 39): `false` draws the brand as a plain block (a `<div>`, no link, no tab stop) with the same tile, name and subtitle; `brandHref`, `brandRoute` and `brandAriaLabel` are then ignored',
      table: { defaultValue: { summary: 'true' } },
    },
    brandLogoSrc: {
      control: 'text',
      description:
        '3.47 (usm-x row 39): an image in the brand tile (decorative, `alt=""`, 24 × 24 contained), over `brandIcon` and `brandLetter`. The CSS hook `--lc-sidenav-brand-logo-filter` (default `none`) filters it, e.g. `brightness(0) invert(1)` for a white silhouette; `--lc-sidenav-brand-tile-bg: transparent` drops the tile',
      table: { defaultValue: { summary: "''" } },
    },
    brandLogoFit: {
      control: 'inline-radio',
      options: ['tile', 'natural'],
      description:
        "3.50 (usm-x row 75): `'natural'` draws `brandLogoSrc` at its own aspect ratio, `--lc-sidenav-brand-logo-height` high (default 24 px; a 4:1 wordmark is 96 × 24), without the tile, at most the brand's width; the collapsed rail shows the tile with `brandIcon` or the letter. `'tile'`: 24 px in the 32 px tile, as before",
      table: { defaultValue: { summary: "'tile'" } },
    },
    brandToggle: {
      control: 'boolean',
      description:
        '3.50 (usm-x row 74): docked, the brand is a `<button>` that collapses and expands the rail, whatever it shows; named „{brand}, {what a press does}“ (`collapseAriaLabel` / `expandAriaLabel`), 44 px, the brand\'s focus ring, the focus stays on it. Drawer: as `brandLink` says',
      table: { defaultValue: { summary: 'false' } },
    },
    railItems: {
      control: 'object',
      description:
        '3.50 (usm-x row 74): `NavigationItem[] | null`, what the collapsed docked rail draws instead of `items`: one icon each, by `displayOrder` (`children`, `isSection`, `action` ignored), in the rail\'s look; current: the first with `current`, else by `route` / `matchRoutes`. A press emits `railItemClick` `{ item, event, element }` (and `itemClicked`). A `kind: \'action\'` entry with `hasPopup` gets `aria-haspopup` / `aria-expanded` (from `expandedActionId`). The `[sidenav-rail-top]` slot shows on the same rail only. `null`: the rail draws `items`',
      table: { defaultValue: { summary: 'null' } },
    },
    railGroupMenu: {
      control: 'boolean',
      description:
        '3.51 (request 072, backlog 071-n1): on the docked, collapsed rail a `railItems` entry with `children` (or `hasChildren`) is a menu button: a press, Enter, Space or the arrow towards the menu opens its children in an `lc-menu` beside the rail (8 px outside its edge, top aligned with the item, on the side away from the nearer viewport edge), named by the entry\'s label, at most `--lc-sidenav-rail-menu-max-width` wide (default `20rem`). Label, icon, disabled / reason, tooltip, busy, hint, badge, current and nested groups are kept; a link entry navigates with the router and emits `itemClicked`. Escape closes and returns the focus to the rail item; `railItemClick` is still emitted. Not with `lcSidenavRail`. `false`: as before',
      table: { defaultValue: { summary: 'false' } },
    },
    expandedGroups: {
      control: 'object',
      description:
        '3.47 (usm-x row 41): ids of the open groups at any depth (two-way). A value seeds and replaces the open set; every change (a toggle, the current item\'s groups opening, a write to `expandedItems`) is reported as the full list. Unknown ids stay and apply when the group arrives; opening by input emits no `expandRequested`. The first render (also prerendered) opens these ids and the current item\'s groups; later those open only when the current item changes, not on an `items` update',
      table: { defaultValue: { summary: '[]' } },
    },
    expandedActionId: {
      control: 'text',
      description:
        '3.48 (backlog 067-n4): id of the item whose action popup is open: its action button (with `action.hasPopup: \'menu\' | \'dialog\'`, which renders `aria-haspopup` and `aria-expanded`, also prerendered) gets `aria-expanded="true"` and stays visible. `itemActionClick` is unchanged. Row actions always show on touch screens (`hover: none`, 067-s1)',
      table: { defaultValue: { summary: 'null' } },
    },
    highlight: {
      control: 'text',
      description:
        '3.47 (usm-x row 46): text marked in every label (case-insensitive, every match, trimmed) with `<mark class="lc-sidenav__mark">`: bold and underlined in the label\'s ink. Ignored with an `lcSidenavLabel` template (it gets the text in its context)',
      table: { defaultValue: { summary: "''" } },
    },
    itemActionClick: {
      action: 'itemActionClick',
      description:
        '3.47 (usm-x row 42): `{ item, event, element }` for every action button press (rows at any level, section headings), after `itemAction`; `element` is the button, to anchor a menu and to return the focus to. While the menu is open set `aria-haspopup="menu"` and `aria-expanded="true"` on `element` (`"false"` on close): a row action shows on hover, keyboard focus and `aria-expanded="true"`. In the drawer render the menu inside the panel (default slot)',
    },
    expandRequested: { action: 'expandRequested', description: '3.44: a `hasChildren` group was opened while it has no children: load them' },
    itemContextMenu: { action: 'itemContextMenu', description: '3.44: `{ item, event }` for a `contextmenu` event on an item (not prevented; not for disabled items)' },
    returnFocusTo: {
      control: false,
      description:
        '3.35, drawer mode only: the element that gets the focus back after the drawer closed, instead of the one that had it at open. Set it to the trigger: WebKit (Safari, every iOS browser) does not focus a tapped button, so the captured element is `body`. Applied after the render that removes the panel, on every close (×, Escape, backdrop, an item or brand tap on a phone, `isOpen` false) and when the sidenav is destroyed while open. An `<lc-button>` host hands the focus to its `<button>`. Ignored when the element is gone; `null` keeps the 3.34 behaviour.',
      table: { defaultValue: { summary: 'null' } },
    },
  },

  parameters: {
    docs: {
      description: {
        component: `
Sidenav component for application navigation sidebar.

**Key Features:**
- **Drawer** (overlay) and **docked** (persistent) modes
- **Responsive mobile mode** — docked automatically switches to drawer below \`mobileBreakpoint\` (default 768px); auto-closes after navigation
- **Collapsed icon-rail** mode (56px narrow sidebar with icons only and hover tooltips); clicking a collapsible parent auto-expands the sidebar
- **Integrated logo** area (\`showLogo\`) with full logo / emblem toggle and a dedicated collapse chevron in the brand row (docked + expanded). Click the logo or chevron to collapse/expand in sidebar-first layouts. Use \`logoSize\` (\`xs | sm | md | lg | xl\`) to scale the brand block — the area grows automatically to fit the logo.
- **Hierarchical navigation** with collapsible groups (3.47: nested to any depth, 12 px more indent per level; see *Deep Tree*)
- **Section headlines** for item grouping with optional action buttons (\`item.action\`)
- **Action buttons** on any item — hover-reveal icon buttons that emit \`itemAction\`
- **Badges** on items (\`item.badge\`) for counts or status indicators with color variants, read after the label with \`badgeAriaLabel\` (on the collapsed rail the label and the badge text name the item)
- **One current item** — the link for \`activeRoute\` (or, without it, the one the router's URL matches) gets \`aria-current="page"\` and the current look, every other link neither; the current item keeps its color on hover
- **Keyboard navigation** — Escape closes drawer mode
- Configurable **width** and **position** (left/right)
- Optional **backdrop overlay**
- **Theme** input (\`auto\` | \`light\` | \`dark\`) — dark mode uses teal accent for active items
- Accessible with ARIA \`navigation\` role; the current item has \`aria-current="page"\` and the selected tint's own ink (\`--color-on-surface-selected\`, AA)
- Items at least 44 px high in every density
- \`variant="transparent"\` — the side navigation on the page ("Weite"): no rail, 48 px pill items

**Inputs:**
| Input | Type | Default | Description |
|---|---|---|---|
| \`isOpen\` | \`boolean\` | \`false\` | Whether the sidenav is visible |
| \`mode\` | \`'drawer' \\| 'docked'\` | \`'drawer'\` | Overlay or persistent sidebar |
| \`position\` | \`'left' \\| 'right'\` | \`'left'\` | Side of viewport |
| \`width\` | \`string\` | \`'320px'\` | CSS width |
| \`collapsed\` | \`boolean\` | \`false\` | Icon-rail mode |
| \`showLogo\` | \`boolean\` | \`false\` | Show logo area at top |
| \`logoSize\` | \`'xs' \\| 'sm' \\| 'md' \\| 'lg' \\| 'xl'\` | \`'md'\` | Size of the brand logo (logo area grows automatically) |
| \`mobileBreakpoint\` | \`number\` | \`768\` | Viewport width (px) below which docked → drawer |
| \`items\` | \`NavigationItem[]\` | \`[]\` | Navigation items |
| \`activeRoute\` | \`string\` | \`''\` | The current route. Set: the first link (display order) whose \`route\` equals it is the current item — it alone gets \`aria-current="page"\` and the current look, whatever the router matches. Empty: the sidenav follows the router — the link whose route equals the URL's path, otherwise the one with the longest route the path starts with (\`/household\` on \`/household/members\`; \`/\` only on \`/\`). Routes are compared as written, so give them as absolute paths (\`'/household'\`) |
| \`hasOverlay\` | \`boolean\` | \`true\` | Show backdrop in drawer mode |
| \`ariaLabel\` | \`string\` | \`'Side navigation'\` | ARIA label |
| \`theme\` | \`'auto' \\| 'light' \\| 'dark'\` | \`'auto'\` | Theme variant |
| \`variant\` | \`'default' \\| 'transparent'\` | \`'default'\` | Rail surface, or none with pill items (docked) |
| \`brandName\` | \`string\` | \`''\` | Text brand: icon tile + product name, one link to home (replaces the image logo) |
| \`brandIcon\` | \`string\` | \`''\` | Icon in the brand tile; empty: the name's first letter |
| \`brandHref\` | \`string\` | \`''\` | Plain URL of the brand link; empty: \`routerLink="/"\` |
| \`brandAriaLabel\` | \`string\` | \`''\` | Accessible name of the brand link; empty: the name |
| \`showCollapseToggle\` | \`boolean\` | \`false\` | Collapse button at the bottom of the docked rail |
| \`expandAriaLabel\` | \`string\` | \`'Expand navigation'\` | Name of that button while collapsed |
| \`badgeAriaLabel\` | \`string\` | \`'{value}'\` | Text read after a badged item's label; \`{value}\` is the badge value |
| \`brandRoute\` | \`string\` | \`'/'\` | 3.47: \`routerLink\` of the brand without \`brandHref\` |
| \`brandLink\` | \`boolean\` | \`true\` | 3.47: \`false\`: the brand is a plain block, no link |
| \`brandLogoSrc\` | \`string\` | \`''\` | 3.47: an image in the brand tile (decorative) |
| \`expandedGroups\` | \`readonly string[]\` | \`[]\` | 3.47: ids of the open groups, any depth (two-way) |
| \`highlight\` | \`string\` | \`''\` | 3.47: text marked in every label (\`<mark>\`) |
| \`railGroupMenu\` | \`boolean\` | \`false\` | 3.51: \`railItems\` groups open their children in an \`lc-menu\` beside the rail |

**Slots:** the default slot below the items; 3.47 \`[sidenav-top]\` between the brand and the items (an area picker, a search), in the docked rail and the drawer, hidden on the collapsed rail, no box without content. 3.51 \`[sidenav-brand-mark]\`: the app's mark instead of the brand tile (32 × 32, decorative; the brand keeps its name). **Rail template (3.51):** \`<ng-template lcSidenavRail let-entries let-current="current" let-railWidth="railWidth">\` (\`SidenavRailDirective\`) draws the docked, collapsed rail's navigation; \`lc-sidenav__rail-item\` gives a link or button the rail item's look. **Label template (3.47):** \`<ng-template lcSidenavLabel let-item let-level="level" let-highlight="highlight">\` (\`SidenavLabelDirective\`) replaces every label; it must show the label text (the link's name). A label cut by its ellipsis gets its full text as \`title\` when the pointer enters the item (not on the rail, not with a row tooltip).

**Outputs:**
| Output | Payload | Description |
|---|---|---|
| \`closed\` | \`void\` | Sidenav close requested (overlay click, Escape). 3.47: Escape only while the drawer is the top-most layer (no modal, command palette, menu, popover or tooltip above it) and not \`defaultPrevented\` |
| \`itemClicked\` | \`NavigationItem\` | Item navigated |
| \`itemAction\` | \`NavigationItem\` | Item action button clicked |
| \`itemActionClick\` | \`NavigationItemActionEvent\` | 3.47: \`{ item, event, element }\` of the same press, to anchor a menu; set \`aria-haspopup="menu"\` and \`aria-expanded\` on \`element\` while it is open |

**NavigationItem shape:**
\`\`\`ts
interface NavigationItem {
  id: string;
  icon: string;
  label: string;
  route: string;
  displayOrder: number;
  isSection?: boolean;           // renders as section headline
  children?: NavigationItem[];   // nested items
  action?: { icon: string; ariaLabel?: string };  // hover-reveal button
  badge?: { value: string | number; variant?: BadgeVariant };  // count badge
}
\`\`\`

**Theming tokens:** \`--lc-sidenav-bg\`, \`--lc-sidenav-fg\`, \`--lc-sidenav-fg-active\`, \`--lc-sidenav-border\`, \`--lc-sidenav-hover-bg\`, \`--lc-sidenav-section-fg\`

Dark mode adds: \`--lc-sidenav-active-bg\`, \`--lc-sidenav-active-fg\`, \`--lc-sidenav-active-icon\`; the collapsed rail's badge ring is \`--lc-sidenav-badge-ring\` (default: the rail's background).

Set them on \`lc-sidenav\` or any ancestor (3.15; until 3.14 only on the element): a value on the element wins over an ancestor's, and both win over \`theme="light"\` / \`"dark"\` (3.14), so a themed rail can be recoloured. A rule on a shared ancestor recolours \`lc-sidenav-placeholder\` the same way. Theme-stable hooks, read where used (set them on any ancestor): \`--lc-sidenav-active-indicator\` (the current item's 2 px bar, default \`var(--color-primary-500)\`; on a \`theme="light"\` rail \`#208497\` on any page, the colour of its focus rings: 4.37:1 on the rail, 4.06:1 on the current item), \`--lc-sidenav-brand-tile-bg\` (default \`var(--color-primary-fill)\`) and \`--lc-sidenav-brand-tile-fg\` (default \`var(--color-on-primary)\`). 3.47 (usm-x rows 39, 43, 45), read where used too: \`--lc-sidenav-focus-ring\` (every focus ring of the rail; default the theme accent, then \`--color-primary-500\`), \`--lc-sidenav-muted-fg\` (\`muted\` items at rest; default \`--lc-sidenav-section-fg\`), \`--lc-sidenav-icon-size\` (item icons, images and spinners; default \`20px\`, the rail box 2 px more), \`--lc-sidenav-backdrop\` (the drawer's backdrop; default \`rgba(0, 0, 0, 0.5)\`), \`--lc-sidenav-brand-height\` (the brand block; default by \`logoSize\`: 56, 56, 64, 80, 112 px) and \`--lc-sidenav-brand-logo-filter\` (on \`brandLogoSrc\`; default \`none\`).

**Icon-column geometry:** \`--lc-sidenav-rail-width\` (56px), \`--lc-sidenav-nav-padding-x\` (8px),
\`--lc-sidenav-item-padding-x\` (10px). Expanded and collapsed share the gutters, so the icon
column sits at 28px in both states and the icons do not shift when toggling — which is what an
\`lc-header\` hamburger aligns to. When overriding, keep
\`nav-padding-x + item-padding-x + icon-size / 2 == rail-width / 2\` and set the header's
\`--lc-header-hamburger-slot\` to the same rail width.
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<SidenavComponent>;

const standardItems = [
  { id: '1', icon: 'home', label: 'Dashboard', route: '/dashboard', displayOrder: 1 },
  { id: '2', icon: 'folder', label: 'Projects', route: '/projects', displayOrder: 2 },
  { id: '3', icon: 'users', label: 'Team', route: '/team', displayOrder: 3 },
  { id: '4', icon: 'chart-bar', label: 'Analytics', route: '/analytics', displayOrder: 4 },
  { id: '5', icon: 'cog-6-tooth', label: 'Settings', route: '/settings', displayOrder: 5 },
];

export const Docked: Story = {
  name: 'Docked Mode',
  args: {
    isOpen: true,
    mode: 'docked',
    items: standardItems,
    activeRoute: '/dashboard',
  },
};

export const DrawerMode: Story = {
  name: 'Drawer Mode',
  args: {
    isOpen: true,
    mode: 'drawer',
    items: standardItems,
    activeRoute: '/projects',
  },
};

export const RightPosition: Story = {
  name: 'Right Position',
  args: {
    isOpen: true,
    mode: 'docked',
    position: 'right',
    items: standardItems,
    activeRoute: '/team',
  },
};

export const WithNestedItems: Story = {
  name: 'With Nested Children',
  args: {
    isOpen: true,
    mode: 'docked',
    items: [
      { id: '1', icon: 'home', label: 'Dashboard', route: '/dashboard', displayOrder: 1 },
      { id: '2', icon: 'folder', label: 'Projects', route: '/projects', displayOrder: 2, children: [
        { id: '2a', icon: 'document', label: 'Active', route: '/projects/active', displayOrder: 1 },
        { id: '2b', icon: 'archive-box', label: 'Archived', route: '/projects/archived', displayOrder: 2 },
      ]},
      { id: '3', icon: 'users', label: 'Team', route: '/team', displayOrder: 3, children: [
        { id: '3a', icon: 'user-plus', label: 'Members', route: '/team/members', displayOrder: 1 },
        { id: '3b', icon: 'shield-check', label: 'Roles', route: '/team/roles', displayOrder: 2 },
      ]},
      { id: '4', icon: 'cog-6-tooth', label: 'Settings', route: '/settings', displayOrder: 4 },
    ],
    activeRoute: '/projects/active',
  },
};

export const FullApplication: Story = {
  name: 'Full App Layout (Composition)',
  args: {
    isOpen: true,
    mode: 'docked',
    items: [
      { id: '1', icon: 'home', label: 'Home', route: '/', displayOrder: 1 },
      { id: '2', icon: 'clipboard-document-list', label: 'Tasks', route: '/tasks', displayOrder: 2 },
      { id: '3', icon: 'calendar', label: 'Calendar', route: '/calendar', displayOrder: 3 },
      { id: '4', icon: 'chart-bar', label: 'Reports', route: '/reports', displayOrder: 4 },
      { id: '5', icon: 'bell', label: 'Notifications', route: '/notifications', displayOrder: 5 },
      { id: '6', icon: 'cog-6-tooth', label: 'Settings', route: '/settings', displayOrder: 6 },
    ],
    activeRoute: '/tasks',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; height: 400px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
        <lc-sidenav [isOpen]="isOpen" [mode]="mode" [items]="items" [activeRoute]="activeRoute"></lc-sidenav>
        <div style="flex: 1; padding: 24px;">
          <h3 style="margin: 0 0 8px; font-weight: 600;">Tasks</h3>
          <p style="color: var(--color-text-secondary); font-size: 14px;">Main content area next to the sidenav.</p>
        </div>
      </div>`,
  }),
};

export const CollapsedIconRail: Story = {
  name: 'Collapsed Icon Rail',
  parameters: {
    docs: { description: { story: 'Collapsed mode shows only icons in a narrow 56px rail. Hover over an icon to see the label tooltip.' } },
  },
  args: {
    isOpen: true,
    mode: 'docked',
    collapsed: true,
    items: standardItems,
    activeRoute: '/dashboard',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; height: 400px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
        <lc-sidenav [isOpen]="isOpen" [mode]="mode" [collapsed]="collapsed" [items]="items" [activeRoute]="activeRoute"></lc-sidenav>
        <div style="flex: 1; padding: 24px;">
          <h3 style="margin: 0 0 8px; font-weight: 600;">Dashboard</h3>
          <p style="color: var(--color-text-secondary); font-size: 14px;">The sidenav is collapsed to a narrow icon rail. Hover icons for labels.</p>
        </div>
      </div>`,
  }),
};

export const CollapsedVsExpanded: Story = {
  name: 'Collapsed vs Expanded',
  parameters: {
    docs: { description: { story: 'Side-by-side comparison of collapsed icon rail and full expanded sidenav.' } },
  },
  render: () => ({
    template: `
      <div style="display: flex; gap: 24px;">
        <div style="display: flex; height: 400px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; flex: 0 0 auto;">
          <lc-sidenav [isOpen]="true" mode="docked" [collapsed]="true"
            [items]="[
              { id: '1', icon: 'home', label: 'Dashboard', route: '/dashboard', displayOrder: 1 },
              { id: '2', icon: 'folder', label: 'Projects', route: '/projects', displayOrder: 2 },
              { id: '3', icon: 'users', label: 'Team', route: '/team', displayOrder: 3 },
              { id: '4', icon: 'chart-bar', label: 'Analytics', route: '/analytics', displayOrder: 4 },
              { id: '5', icon: 'cog-6-tooth', label: 'Settings', route: '/settings', displayOrder: 5 }
            ]"
            activeRoute="/dashboard">
          </lc-sidenav>
          <div style="padding: 16px; font-size: 13px; color: var(--color-text-secondary);">Collapsed</div>
        </div>
        <div style="display: flex; height: 400px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; flex: 1;">
          <lc-sidenav [isOpen]="true" mode="docked" [collapsed]="false" width="240px"
            [items]="[
              { id: '1', icon: 'home', label: 'Dashboard', route: '/dashboard', displayOrder: 1 },
              { id: '2', icon: 'folder', label: 'Projects', route: '/projects', displayOrder: 2 },
              { id: '3', icon: 'users', label: 'Team', route: '/team', displayOrder: 3 },
              { id: '4', icon: 'chart-bar', label: 'Analytics', route: '/analytics', displayOrder: 4 },
              { id: '5', icon: 'cog-6-tooth', label: 'Settings', route: '/settings', displayOrder: 5 }
            ]"
            activeRoute="/dashboard">
          </lc-sidenav>
          <div style="padding: 16px; font-size: 13px; color: var(--color-text-secondary); flex: 1;">Expanded</div>
        </div>
      </div>`,
  }),
};

export const DarkTheme: Story = {
  name: 'Dark Theme',
  parameters: {
    docs: { description: { story: 'Sidenav with explicit dark theme via `[theme]="dark"`. Uses internal tokens for background, text, and hover colors.' } },
  },
  args: {
    isOpen: true,
    mode: 'docked',
    theme: 'dark',
    items: standardItems,
    activeRoute: '/dashboard',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; height: 400px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
        <lc-sidenav [isOpen]="isOpen" [mode]="mode" [theme]="theme" [items]="items" [activeRoute]="activeRoute"></lc-sidenav>
        <div style="flex: 1; padding: 24px; background: var(--color-surface-2);">
          <h3 style="margin: 0 0 8px; font-weight: 600;">Content Area</h3>
          <p style="color: var(--color-text-secondary); font-size: 14px;">The sidenav uses its own dark tokens, independent of the page theme.</p>
        </div>
      </div>`,
  }),
};

export const WithGroupsAndActions: Story = {
  name: 'Groups with Actions',
  parameters: {
    docs: { description: { story: 'Section headers and collapsible items can have action buttons (visible on hover). Useful for "Add project", context menus, etc.' } },
  },
  args: {
    isOpen: true,
    mode: 'docked',
    theme: 'dark',
    items: [
      { id: '1', icon: 'chart-bar', label: 'Dashboard', route: '/dashboard', displayOrder: 1 },
      { id: '2', icon: 'cpu-chip', label: 'Agent Runs', route: '/agent-runs', displayOrder: 2 },
      {
        id: 'projects-section', icon: '', label: 'Projects', route: '', displayOrder: 3,
        isSection: true,
        action: { icon: 'plus', ariaLabel: 'Add project' },
        children: [
          {
            id: 'p1', icon: 'folder', label: 'Project Alpha', route: '/projects/alpha', displayOrder: 1,
            action: { icon: 'ellipsis-horizontal', ariaLabel: 'Project Alpha options' },
            children: [
              { id: 'p1a', icon: 'clipboard-document-list', label: 'Specs & Epics', route: '/projects/alpha/specs', displayOrder: 1 },
              { id: 'p1b', icon: 'building-library', label: 'ADRs', route: '/projects/alpha/adrs', displayOrder: 2 },
              { id: 'p1c', icon: 'document-text', label: 'Policies', route: '/projects/alpha/policies', displayOrder: 3 },
              { id: 'p1d', icon: 'link', label: 'Context Sources', route: '/projects/alpha/context', displayOrder: 4 },
              { id: 'p1e', icon: 'chart-bar-square', label: 'Metrics', route: '/projects/alpha/metrics', displayOrder: 5 },
            ],
          },
          {
            id: 'p2', icon: 'folder', label: 'Project Beta', route: '/projects/beta', displayOrder: 2,
            action: { icon: 'ellipsis-horizontal', ariaLabel: 'Project Beta options' },
            children: [
              { id: 'p2a', icon: 'clipboard-document-list', label: 'Specs & Epics', route: '/projects/beta/specs', displayOrder: 1 },
            ],
          },
          {
            id: 'p3', icon: 'folder', label: 'Project Gamma', route: '/projects/gamma', displayOrder: 3,
            action: { icon: 'ellipsis-horizontal', ariaLabel: 'Project Gamma options' },
            children: [
              { id: 'p3a', icon: 'clipboard-document-list', label: 'Specs & Epics', route: '/projects/gamma/specs', displayOrder: 1 },
            ],
          },
        ],
      },
      { id: '10', icon: 'cog-6-tooth', label: 'Org Settings', route: '/settings', displayOrder: 10 },
    ],
    activeRoute: '/projects/alpha/specs',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; height: 500px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
        <lc-sidenav [isOpen]="isOpen" [mode]="mode" [theme]="theme" [items]="items" [activeRoute]="activeRoute" (itemAction)="itemAction($event)"></lc-sidenav>
        <div style="flex: 1; padding: 24px; background: var(--color-surface-2);">
          <h3 style="margin: 0 0 8px; font-weight: 600;">Specs &amp; Epics</h3>
          <p style="color: var(--color-text-secondary); font-size: 14px;">Hover over section headers or items to see action buttons.</p>
        </div>
      </div>`,
  }),
};

export const WithBadges: Story = {
  name: 'With Badges',
  parameters: {
    docs: {
      description: {
        story:
          'Navigation items can display a badge with a count or label on the right side. Badges support all color variants. Screen readers hear the label and then the badge through `badgeAriaLabel` (default `{value}`, 3.31): "Tasks 12", "Messages New"; the badge itself is hidden from them.',
      },
    },
  },
  args: {
    isOpen: true,
    mode: 'docked',
    items: [
      { id: '1', icon: 'home', label: 'Dashboard', route: '/dashboard', displayOrder: 1 },
      { id: '2', icon: 'clipboard-document-list', label: 'Tasks', route: '/tasks', displayOrder: 2, badge: { value: 12, variant: 'primary' } },
      { id: '3', icon: 'bell', label: 'Notifications', route: '/notifications', displayOrder: 3, badge: { value: 3, variant: 'error' } },
      { id: '4', icon: 'envelope', label: 'Messages', route: '/messages', displayOrder: 4, badge: { value: 'New', variant: 'success' } },
      { id: '5', icon: 'users', label: 'Team', route: '/team', displayOrder: 5, children: [
        { id: '5a', icon: 'user-plus', label: 'Pending Invites', route: '/team/invites', displayOrder: 1, badge: { value: 2, variant: 'warning' } },
        { id: '5b', icon: 'shield-check', label: 'Roles', route: '/team/roles', displayOrder: 2 },
      ]},
      { id: '6', icon: 'cog-6-tooth', label: 'Settings', route: '/settings', displayOrder: 6 },
    ],
    activeRoute: '/tasks',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; height: 400px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
        <lc-sidenav [isOpen]="isOpen" [mode]="mode" [items]="items" [activeRoute]="activeRoute"></lc-sidenav>
        <div style="flex: 1; padding: 24px;">
          <h3 style="margin: 0 0 8px; font-weight: 600;">Tasks</h3>
          <p style="color: var(--color-text-secondary); font-size: 14px;">Items can show badges for counts, status, or labels.</p>
        </div>
      </div>`,
  }),
};

export const CollapsedWithGroups: Story = {
  name: 'Collapsed with Groups & Actions',
  parameters: {
    docs: { description: { story: 'Collapsed icon rail with section groups, collapsible items, actions, and badges. Groups are separated by dividers, labels/chevrons/children are hidden.' } },
  },
  args: {
    isOpen: true,
    mode: 'docked',
    collapsed: true,
    theme: 'dark',
    items: [
      { id: '1', icon: 'chart-bar', label: 'Dashboard', route: '/dashboard', displayOrder: 1 },
      { id: '2', icon: 'cpu-chip', label: 'Agent Runs', route: '/agent-runs', displayOrder: 2, badge: { value: 3, variant: 'primary' } },
      {
        id: 'projects-section', icon: '', label: 'Projects', route: '', displayOrder: 3,
        isSection: true,
        action: { icon: 'plus', ariaLabel: 'Add project' },
        children: [
          { id: 'p1', icon: 'folder', label: 'Project Alpha', route: '/projects/alpha', displayOrder: 1 },
          { id: 'p2', icon: 'folder', label: 'Project Beta', route: '/projects/beta', displayOrder: 2 },
          { id: 'p3', icon: 'folder', label: 'Project Gamma', route: '/projects/gamma', displayOrder: 3 },
        ],
      },
      { id: '10', icon: 'cog-6-tooth', label: 'Org Settings', route: '/settings', displayOrder: 10 },
    ],
    activeRoute: '/projects/alpha',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; height: 400px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
        <lc-sidenav [isOpen]="isOpen" [mode]="mode" [collapsed]="collapsed" [theme]="theme" [items]="items" [activeRoute]="activeRoute" (itemAction)="itemAction($event)"></lc-sidenav>
        <div style="flex: 1; padding: 24px; background: var(--color-surface-2);">
          <h3 style="margin: 0 0 8px; font-weight: 600;">Project Alpha</h3>
          <p style="color: var(--color-text-secondary); font-size: 14px;">Collapsed sidenav with section groups. Hover icons for labels.</p>
        </div>
      </div>`,
  }),
};

export const CollapsedRailBadges: Story = {
  name: 'Collapsed Rail — Badges',
  parameters: {
    docs: {
      description: {
        story:
          'Badge rendering on the 56px icon rail, across variants and value widths. ' +
          'The badge sits on the item\'s top-right corner as a compact count bubble ' +
          'and keeps an opaque backdrop plus a ring in the rail color, so it stays ' +
          'readable where a wider value ("99+") reaches over the icon. Shown on both ' +
          'themes because the ring follows `--lc-sidenav-bg`. The labels are hidden on ' +
          'the rail, so the badge text read to screen readers starts with the label ' +
          '(3.31): "One digit 3".',
      },
    },
  },
  args: {
    isOpen: true,
    mode: 'docked',
    collapsed: true,
  },
  render: () => ({
    props: {
      items: [
        { id: '1', icon: 'home', label: 'One digit', route: '/a', displayOrder: 1, badge: { value: 3, variant: 'primary' } },
        { id: '2', icon: 'bell', label: 'Two digits', route: '/b', displayOrder: 2, badge: { value: 12, variant: 'error' } },
        { id: '3', icon: 'mail', label: 'Overflow value', route: '/c', displayOrder: 3, badge: { value: '99+', variant: 'warning' } },
        { id: '4', icon: 'folder', label: 'Text value', route: '/d', displayOrder: 4, badge: { value: 'New', variant: 'success' } },
        { id: '5', icon: 'chart-bar', label: 'Default variant', route: '/e', displayOrder: 5, badge: { value: 7 } },
        { id: '6', icon: 'settings', label: 'No badge', route: '/f', displayOrder: 6 },
      ],
    },
    template: `
      <div style="display: flex; gap: 32px; align-items: flex-start;">
        <div>
          <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--color-text-secondary);">Dark (default)</p>
          <div style="height: 340px; border-radius: 8px; overflow: hidden;">
            <lc-sidenav [isOpen]="true" mode="docked" [collapsed]="true" theme="dark" [items]="items" activeRoute="/b"></lc-sidenav>
          </div>
        </div>
        <div>
          <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--color-text-secondary);">Light</p>
          <div style="height: 340px; border-radius: 8px; overflow: hidden;">
            <lc-sidenav [isOpen]="true" mode="docked" [collapsed]="true" theme="light" [items]="items" activeRoute="/b"></lc-sidenav>
          </div>
        </div>
      </div>`,
  }),
};

/** Every badge variant once, the warning one on the current item (request 051). */
const themedRailItems = [
  { id: 'dashboard', icon: 'home', label: 'Dashboard', route: '/dashboard', displayOrder: 1, badge: { value: 7, variant: 'default' } },
  { id: 'tasks', icon: 'clipboard-document-list', label: 'Tasks', route: '/tasks', displayOrder: 2, badge: { value: 12, variant: 'primary' } },
  { id: 'messages', icon: 'envelope', label: 'Messages', route: '/messages', displayOrder: 3, badge: { value: 'New', variant: 'success' } },
  { id: 'approvals', icon: 'check', label: 'Approvals', route: '/approvals', displayOrder: 4, badge: { value: 3, variant: 'warning' } },
  { id: 'notifications', icon: 'bell', label: 'Notifications', route: '/notifications', displayOrder: 5, badge: { value: 2, variant: 'error' } },
  { id: 'documents', icon: 'folder', label: 'Documents', route: '/documents', displayOrder: 6, badge: { value: 5, variant: 'info' } },
];

/** 3.32 (request 051, 050-f2): a themed rail's badges take the rail's palette, on either page theme. */
export const ThemedRailBadges: Story = {
  name: 'Themed Rail Badges',
  parameters: {
    docs: {
      description: {
        story:
          '3.32 (request 051, follow-up 050-f2, WCAG 1.4.3): with `theme="light"` or `"dark"` the badges take the rail\'s palette, not the page\'s, like the slot content of a themed `lc-header`. A light rail on a dark page measured 1.11–1.96:1 badge text before; now 4.85–10.97:1, as on a light page. A dark rail on a light page shows the dark badges (lowest 5.63:1, warning on the current item). On a page of the same theme nothing changes. A root-level token override does not reach a themed rail\'s badges. Switch the toolbar theme to see both pages.',
      },
    },
  },
  render: () => ({
    props: { items: themedRailItems },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; gap: 16px;">
          <div style="display: flex; height: 320px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
            <lc-sidenav [isOpen]="true" mode="docked" width="240px" [mobileBreakpoint]="0" theme="light" [items]="items" activeRoute="/approvals" ariaLabel="Light rail"></lc-sidenav>
          </div>
          <div style="display: flex; height: 320px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
            <lc-sidenav [isOpen]="true" mode="docked" [collapsed]="true" [mobileBreakpoint]="0" theme="light" [items]="items" activeRoute="/approvals" ariaLabel="Light rail, collapsed"></lc-sidenav>
          </div>
        </div>
        <div style="display: flex; gap: 16px;">
          <div style="display: flex; height: 320px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
            <lc-sidenav [isOpen]="true" mode="docked" width="240px" [mobileBreakpoint]="0" theme="dark" [items]="items" activeRoute="/approvals" ariaLabel="Dark rail"></lc-sidenav>
          </div>
          <div style="display: flex; height: 320px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
            <lc-sidenav [isOpen]="true" mode="docked" [collapsed]="true" [mobileBreakpoint]="0" theme="dark" [items]="items" activeRoute="/approvals" ariaLabel="Dark rail, collapsed"></lc-sidenav>
          </div>
        </div>
      </div>`,
  }),
};

/** German badge names at every level (request 050): Finance Intelligence's open assignments, expanded and on the rail. */
const badgeNameItems = [
  { id: 'cockpit', icon: 'presentation-chart-line', label: 'Cockpit', route: '/cockpit', displayOrder: 1 },
  {
    id: 'assignments', icon: 'clipboard-document-list', label: 'Offene Zuordnungen', route: '/zuordnungen', displayOrder: 2,
    badge: { value: 12, variant: 'warning' },
  },
  {
    id: 'master-data', icon: 'folder', label: 'Stammdaten', route: '', displayOrder: 3, badge: { value: 1, variant: 'warning' },
    children: [
      { id: 'accounts', icon: 'building-bank', label: 'Konten', route: '/stammdaten/konten', displayOrder: 1, badge: { value: 1, variant: 'warning' } },
      { id: 'cost-centres', icon: 'calculator', label: 'Kostenstellen', route: '/stammdaten/kostenstellen', displayOrder: 2 },
    ],
  },
  {
    id: 'areas', icon: '', label: 'Bereiche', route: '', displayOrder: 4, isSection: true,
    children: [
      { id: 'finances', icon: 'wallet', label: 'Finanzen', route: '/finanzen', displayOrder: 1, badge: { value: 3, variant: 'primary' } },
      {
        id: 'banks', icon: 'building-bank', label: 'Banken', route: '', displayOrder: 2, badge: { value: 2, variant: 'error' },
        children: [
          { id: 'statements', icon: 'document-text', label: 'Kontoauszüge', route: '/banken/auszuege', displayOrder: 1, badge: { value: 2, variant: 'error' } },
        ],
      },
    ],
  },
];

/** 3.31 (request 050): `badgeAriaLabel` at all six badge sites, expanded and on the collapsed rail. */
export const BadgeAccessibleNameGerman: Story = {
  name: 'Badge Accessible Name (German)',
  parameters: {
    docs: {
      description: {
        story:
          '`badgeAriaLabel="{value} offen"` (3.31, request 050): every badged item reads its badge after the label from a visually hidden text, at every level (open „Banken“ for the third level); the badge itself is hidden from screen readers, so nothing is read twice and nothing moves. Left expanded: „Offene Zuordnungen 12 offen“. Right the collapsed rail, where the labels are hidden: the hidden text starts with the label, so the rail item is also named „Offene Zuordnungen 12 offen“ (until 3.30 only „12“). The default `{value}` reads „Offene Zuordnungen 12“.',
      },
    },
  },
  render: () => ({
    props: { items: badgeNameItems, activeRoute: '/stammdaten/konten' },
    template: `
      <div lang="de" style="display: flex; flex-wrap: wrap; gap: 24px;">
        ${brandRail('badgeAriaLabel="{value} offen" ariaLabel="Hauptnavigation"', '240px', 'overflow: visible; position: relative; z-index: 2;')}
        ${brandRail('[collapsed]="true" badgeAriaLabel="{value} offen" ariaLabel="Hauptnavigation"', '240px', 'overflow: visible; position: relative; z-index: 1;')}
      </div>`,
  }),
};

export const SidebarFirstLayout: Story = {
  name: 'Sidebar-First Layout',
  parameters: {
    docs: { description: { story: 'The sidenav takes full height beside the header. Logo is shown at the top with default `logoSize="md"` (64px brand block, aligned with `<lc-header size="md">`). In docked + expanded mode, the brand row also shows a dedicated chevron button to collapse quickly. For an extra-prominent brand, see *Sidebar-First Layout (Prominent Brand)* below.' } },
    layout: 'fullscreen',
  },
  render: () => ({
    moduleMetadata: { imports: [HeaderComponent] },
    template: `
      <div style="display: flex; height: 500px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
        <lc-sidenav
          [isOpen]="true"
          mode="docked"
          [showLogo]="true"
          theme="dark"
          width="240px"
          [items]="[
            { id: '1', icon: 'chart-bar', label: 'Dashboard', route: '/dashboard', displayOrder: 1 },
            { id: '2', icon: 'cpu-chip', label: 'Agent Runs', route: '/agent-runs', displayOrder: 2, badge: { value: 3, variant: 'primary' } },
            {
              id: 'projects', icon: '', label: 'Projects', route: '', displayOrder: 3,
              isSection: true,
              action: { icon: 'plus', ariaLabel: 'Add project' },
              children: [
                { id: 'p1', icon: 'folder', label: 'Project Alpha', route: '/projects/alpha', displayOrder: 1,
                  action: { icon: 'ellipsis-horizontal', ariaLabel: 'Options' },
                  children: [
                    { id: 'p1a', icon: 'clipboard-document-list', label: 'Specs & Epics', route: '/projects/alpha/specs', displayOrder: 1 },
                    { id: 'p1b', icon: 'building-library', label: 'ADRs', route: '/projects/alpha/adrs', displayOrder: 2 },
                    { id: 'p1c', icon: 'document-text', label: 'Policies', route: '/projects/alpha/policies', displayOrder: 3 }
                  ]
                },
                { id: 'p2', icon: 'folder', label: 'Project Beta', route: '/projects/beta', displayOrder: 2,
                  action: { icon: 'ellipsis-horizontal', ariaLabel: 'Options' } },
                { id: 'p3', icon: 'folder', label: 'Project Gamma', route: '/projects/gamma', displayOrder: 3,
                  action: { icon: 'ellipsis-horizontal', ariaLabel: 'Options' } }
              ]
            },
            { id: '10', icon: 'cog-6-tooth', label: 'Org Settings', route: '/settings', displayOrder: 10 }
          ]"
          activeRoute="/projects/alpha/specs">
        </lc-sidenav>
        <div style="display: flex; flex-direction: column; flex: 1; min-width: 0;">
          <lc-header
            title="LifeCorner"
            subtitle="Specs & Epics"
            userName="Sarah Connor"
            userEmail="sarah@example.com"
            contextName="Acme Corp"
            contextLabel="Organization"
            [showThemeButton]="true"
            [showLogo]="false"
          ></lc-header>
          <main style="flex: 1; padding: 24px; overflow-y: auto; background: var(--color-surface-2);">
            <h2 style="margin: 0 0 12px; font-weight: 600; font-size: 1.25rem;">Specs & Epics</h2>
            <p style="color: var(--color-text-secondary); font-size: 14px;">Content area with header above. The sidenav owns the full height and logo. Use the logo or the chevron in the brand row to toggle collapsed state.</p>
          </main>
        </div>
      </div>`,
  }),
};

export const SidebarFirstCollapsed: Story = {
  name: 'Sidebar-First Layout (Collapsed)',
  parameters: {
    docs: { description: { story: 'Same sidebar-first layout but with the sidenav collapsed to an icon rail. The logo switches to the emblem automatically.' } },
    layout: 'fullscreen',
  },
  render: () => ({
    moduleMetadata: { imports: [HeaderComponent] },
    template: `
      <div style="display: flex; height: 500px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
        <lc-sidenav
          [isOpen]="true"
          mode="docked"
          [showLogo]="true"
          [collapsed]="true"
          theme="dark"
          [items]="[
            { id: '1', icon: 'chart-bar', label: 'Dashboard', route: '/dashboard', displayOrder: 1 },
            { id: '2', icon: 'cpu-chip', label: 'Agent Runs', route: '/agent-runs', displayOrder: 2, badge: { value: 3, variant: 'primary' } },
            {
              id: 'projects', icon: '', label: 'Projects', route: '', displayOrder: 3,
              isSection: true,
              children: [
                { id: 'p1', icon: 'folder', label: 'Project Alpha', route: '/projects/alpha', displayOrder: 1 },
                { id: 'p2', icon: 'folder', label: 'Project Beta', route: '/projects/beta', displayOrder: 2 },
                { id: 'p3', icon: 'folder', label: 'Project Gamma', route: '/projects/gamma', displayOrder: 3 }
              ]
            },
            { id: '10', icon: 'cog-6-tooth', label: 'Org Settings', route: '/settings', displayOrder: 10 }
          ]"
          activeRoute="/projects/alpha">
        </lc-sidenav>
        <div style="display: flex; flex-direction: column; flex: 1; min-width: 0;">
          <lc-header
            title="LifeCorner"
            userName="Sarah Connor"
            userEmail="sarah@example.com"
            contextName="Acme Corp"
            contextLabel="Organization"
            [showThemeButton]="true"
            [showLogo]="false"
          ></lc-header>
          <main style="flex: 1; padding: 24px; overflow-y: auto; background: var(--color-surface-2);">
            <h2 style="margin: 0 0 12px; font-weight: 600; font-size: 1.25rem;">Project Alpha</h2>
            <p style="color: var(--color-text-secondary); font-size: 14px;">Collapsed sidebar with emblem logo. Click the emblem to expand. Header sits beside the sidenav.</p>
          </main>
        </div>
      </div>`,
  }),
};

export const ResponsiveMobile: Story = {
  name: 'Responsive (Mobile View)',
  parameters: {
    docs: { description: { story: 'On narrow screens (below 768px), the docked sidenav automatically switches to drawer mode with overlay. The hamburger button in the header toggles it. Resize the browser or use Storybook viewport controls to test.' } },
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => ({
    moduleMetadata: { imports: [HeaderComponent] },
    props: {
      sidebarOpen: false,
      toggleSidebar() { this['sidebarOpen'] = !this['sidebarOpen']; },
    },
    template: `
      <div style="display: flex; height: 100vh; overflow: hidden;">
        <lc-sidenav
          [isOpen]="sidebarOpen"
          mode="docked"
          [mobileBreakpoint]="9999"
          [showLogo]="true"
          theme="dark"
          width="280px"
          [items]="[
            { id: '1', icon: 'chart-bar', label: 'Dashboard', route: '/dashboard', displayOrder: 1 },
            { id: '2', icon: 'cpu-chip', label: 'Agent Runs', route: '/agent-runs', displayOrder: 2, badge: { value: 3, variant: 'primary' } },
            {
              id: 'projects', icon: '', label: 'Projects', route: '', displayOrder: 3,
              isSection: true,
              action: { icon: 'plus', ariaLabel: 'Add project' },
              children: [
                { id: 'p1', icon: 'folder', label: 'Project Alpha', route: '/projects/alpha', displayOrder: 1 },
                { id: 'p2', icon: 'folder', label: 'Project Beta', route: '/projects/beta', displayOrder: 2 },
                { id: 'p3', icon: 'folder', label: 'Project Gamma', route: '/projects/gamma', displayOrder: 3 }
              ]
            },
            { id: '10', icon: 'cog-6-tooth', label: 'Settings', route: '/settings', displayOrder: 10 }
          ]"
          activeRoute="/dashboard"
          (closed)="sidebarOpen = false">
        </lc-sidenav>
        <div style="display: flex; flex-direction: column; flex: 1; min-width: 0;">
          <lc-header
            title="LifeCorner"
            userName="Sarah Connor"
            userEmail="sarah@example.com"
            [showHamburger]="true"
            [showLogo]="false"
            (hamburgerClick)="toggleSidebar()"
          ></lc-header>
          <main style="flex: 1; padding: 16px; overflow-y: auto; background: var(--color-surface-2);">
            <h2 style="margin: 0 0 12px; font-weight: 600; font-size: 1.25rem;">Dashboard</h2>
            <p style="color: var(--color-text-secondary); font-size: 14px;">On mobile, the sidenav becomes a drawer overlay. Use the hamburger menu to open it. Resize to desktop to see it dock.</p>
          </main>
        </div>
      </div>`,
  }),
};

export const SidebarFirstProminentBrand: Story = {
  name: 'Sidebar-First Layout (Prominent Brand)',
  parameters: {
    docs: {
      description: {
        story:
          'Extra-prominent brand block via `logoSize="lg"` (80px). Pair with `<lc-header size="lg">` so the header lines up with the taller brand area. The brand row keeps the dedicated chevron collapse button for quick toggling. The default `md` size (64px) is shown in *Sidebar-First Layout* above.',
      },
    },
    layout: 'fullscreen',
  },
  render: () => ({
    moduleMetadata: { imports: [HeaderComponent] },
    template: `
      <div style="display: flex; height: 520px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
        <lc-sidenav
          [isOpen]="true"
          mode="docked"
          [showLogo]="true"
          logoSize="lg"
          theme="dark"
          width="256px"
          [items]="[
            { id: '1', icon: 'chart-bar', label: 'Dashboard', route: '/dashboard', displayOrder: 1 },
            { id: '2', icon: 'cpu-chip', label: 'Agent Runs', route: '/agent-runs', displayOrder: 2, badge: { value: 3, variant: 'primary' } },
            {
              id: 'projects', icon: '', label: 'Projects', route: '', displayOrder: 3,
              isSection: true,
              action: { icon: 'plus', ariaLabel: 'Add project' },
              children: [
                { id: 'p1', icon: 'folder', label: 'Project Alpha', route: '/projects/alpha', displayOrder: 1 },
                { id: 'p2', icon: 'folder', label: 'Project Beta', route: '/projects/beta', displayOrder: 2 }
              ]
            },
            { id: '10', icon: 'cog-6-tooth', label: 'Org Settings', route: '/settings', displayOrder: 10 }
          ]"
          activeRoute="/dashboard">
        </lc-sidenav>
        <div style="display: flex; flex-direction: column; flex: 1; min-width: 0;">
          <lc-header
            userName="Sarah Connor"
            userEmail="sarah@example.com"
            contextName="LifeCorner"
            contextLabel="Organization"
            size="lg"
            [showHamburger]="true"
            [showLogo]="false"
          ></lc-header>
          <main style="flex: 1; padding: 24px; overflow-y: auto; background: var(--color-surface-2);">
            <h2 style="margin: 0 0 8px; font-weight: 700; font-size: 1.5rem;">Dashboard</h2>
            <p style="color: var(--color-text-secondary); font-size: 14px;">Overview of project activity, agent runs, and key metrics.</p>
          </main>
        </div>
      </div>`,
  }),
};

/** The side navigation on the page ("Weite", LK-8): no rail, 48 px pills, the current one on the selected tint. */
export const TransparentOnThePage: Story = {
  name: 'Transparent (on the page)',
  args: {
    isOpen: true,
    mode: 'docked',
    variant: 'transparent',
    width: '248px',
    mobileBreakpoint: 0,
    ariaLabel: 'Hauptnavigation',
    items: [
      { id: 'today', icon: 'sun', label: 'Heute', route: '/', displayOrder: 1 },
      { id: 'household', icon: 'home', label: 'Haushalt', route: '/household', displayOrder: 2 },
    ],
    activeRoute: '/',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; height: 320px; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden;">
        <lc-sidenav [isOpen]="isOpen" [mode]="mode" [variant]="variant" [width]="width" [mobileBreakpoint]="mobileBreakpoint"
                    [ariaLabel]="ariaLabel" [items]="items" [activeRoute]="activeRoute" />
        <div style="flex: 1; padding: 48px 24px; color: var(--color-text-secondary);">Page</div>
      </div>`,
  }),
};

/** An empty routed page for the story's own router. */
@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class RouterMatchedPageComponent {}

/**
 * No `activeRoute`: the sidenav follows the router (AS-16). The story has its
 * own router on the iframe's hash, so the links really navigate.
 */
export const RouterMatched: Story = {
  name: 'Router-matched current item',
  decorators: [
    applicationConfig({
      providers: [provideRouter([{ path: '**', component: RouterMatchedPageComponent }], withHashLocation())],
    }),
  ],
  args: {
    isOpen: true,
    mode: 'docked',
    variant: 'transparent',
    width: '248px',
    mobileBreakpoint: 0,
    ariaLabel: 'Hauptnavigation',
    items: [
      { id: 'today', icon: 'sun', label: 'Heute', route: '/', displayOrder: 1 },
      { id: 'household', icon: 'home', label: 'Haushalt', route: '/household', displayOrder: 2 },
      { id: 'members', icon: 'users', label: 'Mitglieder', route: '/household/members', displayOrder: 3 },
      { id: 'settings', icon: 'settings', label: 'Einstellungen', route: '/settings', displayOrder: 4 },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Without `activeRoute` the sidenav follows the router: the link whose route equals the URL\'s path is the current item, otherwise the one with the longest route the path starts with (`/` only on `/`). Exactly one link is current, and it is both painted current and announced with `aria-current="page"`. Click *Mitglieder*: only it is current — 3.4 painted *Haushalt* too.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; height: 360px; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden;">
        <lc-sidenav [isOpen]="isOpen" [mode]="mode" [variant]="variant" [width]="width" [mobileBreakpoint]="mobileBreakpoint"
                    [ariaLabel]="ariaLabel" [items]="items" />
        <div style="flex: 1; padding: 48px 24px; color: var(--color-text-secondary);">Page</div>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('link', { name: 'Mitglieder' }));
    await new Promise((resolve) => setTimeout(resolve, 50));
    const current = canvasElement.querySelectorAll('a[aria-current="page"]');
    await expect(current).toHaveLength(1);
    await expect(current[0].textContent?.trim()).toBe('Mitglieder');
    const painted = canvasElement.querySelectorAll('.lc-sidenav__nav-item--active');
    await expect(painted).toHaveLength(1);
    await expect(painted[0]).toBe(current[0]);
    // Leave the current item without the click's focus ring, so the canvas shows its plain look.
    (current[0] as HTMLElement).blur();
  },
};

/** German destinations of the text-brand stories (request 019). */
const germanItems = [
  { id: 'overview', icon: 'home', label: 'Übersicht', route: '/', displayOrder: 1 },
  { id: 'costs', icon: 'banknotes', label: 'Kosten', route: '/kosten', displayOrder: 2 },
  { id: 'cost-centres', icon: 'calculator', label: 'Kostenstellen', route: '/kostenstellen', displayOrder: 3 },
  { id: 'contracts', icon: 'document-text', label: 'Verträge', route: '/vertraege', displayOrder: 4 },
  { id: 'reports', icon: 'chart-pie', label: 'Berichte', route: '/berichte', displayOrder: 5 },
  { id: 'settings', icon: 'cog-6-tooth', label: 'Einstellungen', route: '/einstellungen', displayOrder: 6 },
];

/**
 * A docked rail of 240 px (or `width`) in a 480 px frame: tall enough for the
 * brand, six items and the collapse button (the panel scrolls when shorter).
 * `frame` styles the frame: a collapsed rail's tooltips need `overflow: visible`
 * and a z-index above the frame to its right.
 */
const brandRail = (attrs: string, width = '240px', frame = 'overflow: hidden;') => `
  <div style="display: flex; height: 480px; border: 1px solid var(--color-border); border-radius: 8px; ${frame} flex: 0 0 auto;">
    <lc-sidenav [isOpen]="true" mode="docked" width="${width}" [mobileBreakpoint]="0" [items]="items" [activeRoute]="activeRoute"
                ${attrs} />
  </div>`;

/** 3.14 (request 019): the text brand on the light and the dark rail. */
export const TextBrand: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`brandName="Finance Intelligence" brandIcon="presentation-chart-line"`: one link to home (`routerLink="/"`, or a plain `brandHref`) with a 32 px tile on the icon column and the name. The block is as high as the image logo (`logoSize="md"`: 64 px, the height of `lc-header size="md"`). The tile takes `--lc-sidenav-brand-tile-bg` / `-fg` (defaults `--color-primary-fill` / `--color-on-primary`, the same in both themes). Left `theme="light"`, right `theme="dark"`.',
      },
    },
  },
  render: () => ({
    props: { items: standardItems, activeRoute: '/dashboard' },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 24px;">
        ${brandRail('theme="light" brandName="Finance Intelligence" brandIcon="presentation-chart-line" brandAriaLabel="Finance Intelligence – home" ariaLabel="Main navigation"')}
        ${brandRail('theme="dark" brandName="Finance Intelligence" brandIcon="presentation-chart-line" brandAriaLabel="Finance Intelligence – home" ariaLabel="Main navigation"')}
      </div>`,
  }),
};

/** 3.14 (request 019): the collapse button at the bottom of the rail; collapsed, the brand shows only its tile. */
export const TextBrandCollapsedVsExpanded: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`showCollapseToggle`: a 44 px button at the bottom of the rail, on the icon column in both states, collapses and expands it; the brand stays a link and never toggles. Collapsed, the brand shows only its tile (the name stays the accessible name and shows as a tooltip on hover and focus). Right: no `brandIcon`, so the tile shows the first letter.',
      },
    },
  },
  render: () => ({
    props: { items: standardItems, activeRoute: '/dashboard' },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 24px;">
        ${brandRail('brandName="Finance Intelligence" brandIcon="presentation-chart-line" brandAriaLabel="Finance Intelligence – home" [showCollapseToggle]="true" ariaLabel="Main navigation"', '240px', 'overflow: visible; position: relative; z-index: 3;')}
        ${brandRail('[collapsed]="true" brandName="Finance Intelligence" brandIcon="presentation-chart-line" brandAriaLabel="Finance Intelligence – home" [showCollapseToggle]="true" ariaLabel="Main navigation"', '240px', 'overflow: visible; position: relative; z-index: 2;')}
        ${brandRail('[collapsed]="true" brandName="Finance Intelligence" brandAriaLabel="Finance Intelligence – home" [showCollapseToggle]="true" ariaLabel="Main navigation"', '240px', 'overflow: visible; position: relative; z-index: 1;')}
      </div>`,
  }),
};

/** 3.14 (request 019): long German brand names on the 240 px dark rail. */
export const TextBrandGerman: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`lang="de"`: "Finanz-Controlling Cockpit" wraps to two lines at 240 px; "Haushaltsmitgliederverwaltung" is hyphenated (`hyphens: auto` needs the `lang`) and clamped at two lines. Neither overflows, and the full name stays the accessible name. The collapse button and the brand take German labels (`collapseAriaLabel`, `expandAriaLabel`, `brandAriaLabel`).',
      },
    },
  },
  render: () => ({
    props: { items: germanItems, activeRoute: '/kosten' },
    template: `
      <div lang="de" style="display: flex; flex-wrap: wrap; gap: 24px;">
        ${brandRail('theme="dark" brandName="Finanz-Controlling Cockpit" brandIcon="presentation-chart-line" brandAriaLabel="Finanz-Controlling Cockpit – Startseite" [showCollapseToggle]="true" collapseAriaLabel="Navigation nach links einklappen" expandAriaLabel="Navigation ausklappen" ariaLabel="Hauptnavigation"')}
        ${brandRail('theme="dark" brandName="Haushaltsmitgliederverwaltung" brandIcon="users" ariaLabel="Hauptnavigation"')}
      </div>`,
  }),
};

/** 3.14 (request 019): the text brand in the drawer, German, with the close button beside it. */
export const TextBrandDrawerGerman: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'In the drawer the brand and the 44 px close button share the 64 px block (brand first in the DOM, then close, then the items; focus starts on close). A click on the brand closes the drawer on a phone, as the items do.',
      },
    },
  },
  render: () => ({
    props: { items: germanItems },
    template: `
      <div lang="de" style="min-height: 100vh;">
        <lc-sidenav [isOpen]="true" mode="drawer" theme="dark" [items]="items" activeRoute="/kosten"
                    brandName="Finanz-Controlling Cockpit" brandIcon="presentation-chart-line"
                    brandAriaLabel="Finanz-Controlling Cockpit – Startseite"
                    closeAriaLabel="Navigation schließen" ariaLabel="Hauptnavigation" />
      </div>`,
  }),
};

/** The *Focus return (3.35)* destinations. */
const focusReturnItems = [
  { id: 'overview', icon: 'home', label: 'Übersicht', route: '/uebersicht', displayOrder: 1 },
  { id: 'month', icon: 'calendar', label: 'Monatsstand', route: '/monatsstand', displayOrder: 2 },
  { id: 'cost-centres', icon: 'folder', label: 'Kostenstellen', route: '/kostenstellen', displayOrder: 3 },
  { id: 'settings', icon: 'cog-6-tooth', label: 'Einstellungen', route: '/einstellungen', displayOrder: 4 },
];

/**
 * 3.35 (request 055, 054-n3): the trigger is passed as `returnFocusTo`, so the
 * focus returns to it after the drawer closed, also in WebKit, where a tap
 * doesn't focus a button.
 */
export const ReturnFocusTo: Story = {
  name: 'Focus return (3.35)',
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.35 (request 055, 054-n3): drawer mode. The bar\'s icon button „Navigation öffnen“ is passed as `returnFocusTo`, so after „Navigation schließen“, Escape or the backdrop the focus is on the trigger\'s button again; on a phone an item or brand tap closes the drawer through `closed` and returns the focus the same way. Without it, a WebKit tap leaves `body` focused at open, and the focus falls to `body` on close. The trigger is the `<lc-button>` host (`$event.currentTarget` of its click); the sidenav hands the focus to the `<button>` inside it. Since 3.36 `lc-header`\'s `hamburgerClick` carries the hamburger\'s `<button>` to pass the same way (see *Navigation / Header / Hamburger Focus Return*).',
      },
      story: { inline: false, height: '480px' },
    },
  },
  render: () => ({
    props: { items: focusReturnItems, navOpen: false, navTrigger: null },
    template: `
      <div lang="de" style="min-height: 100vh;">
        <div style="display: flex; align-items: center; padding: 8px 16px; border-bottom: 1px solid var(--color-border);">
          <lc-button variant="ghost" [iconOnly]="true" ariaLabel="Navigation öffnen"
            (click)="navTrigger = $any($event.currentTarget); navOpen = true">
            <lc-icon name="bars-3" size="sm" [decorative]="true"></lc-icon>
          </lc-button>
        </div>
        <lc-sidenav [isOpen]="navOpen" mode="drawer" [items]="items" activeRoute="/monatsstand"
          ariaLabel="Hauptnavigation" closeAriaLabel="Navigation schließen"
          [returnFocusTo]="navTrigger" (closed)="navOpen = false" />
      </div>`,
  }),
};

/** 3.16 (TD-3): the finance destinations in a section; `wallet` and `building-bank` are in the inline set. */
export const FinanceDestination: Story = {
  name: 'Finance Destination',
  parameters: {
    docs: {
      description: {
        story:
          'The section „Bereiche“ with Finanzen (`wallet`, current) and Banken (`building-bank`). Both glyphs are in the inline set since 3.16, so they render without a request, in prerendered HTML too.',
      },
    },
  },
  render: () => ({
    props: {
      items: [
        {
          id: 'areas', icon: '', label: 'Bereiche', route: '', displayOrder: 1,
          isSection: true,
          children: [
            { id: 'finances', icon: 'wallet', label: 'Finanzen', route: '/finanzen', displayOrder: 1 },
            { id: 'banks', icon: 'building-bank', label: 'Banken', route: '/banken', displayOrder: 2 },
          ],
        },
      ],
      activeRoute: '/finanzen',
    },
    template: `
      <div lang="de">
        ${brandRail('theme="light" ariaLabel="Hauptnavigation"')}
      </div>`,
  }),
};

// ── 3.44 (request 064, usm-x row 14 and backlog 064-n2) ─────────────────────

/** A 20 px glyph as an image icon (`iconUrl`) for the stories. */
const IMAGE_ICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" rx="4" fill="#7c5cc4"/><path d="M6 10h8M10 6v8" stroke="#fff" stroke-width="2"/></svg>',
  );

/** The frame of the 3.44 stories: docked (a drawer below 768 px, open). */
const rowStatesFrame = (attrs: string, frame = 'overflow: hidden;') => `
  <div style="display: flex; height: 520px; border: 1px solid var(--color-border); border-radius: 8px; ${frame}">
    <lc-sidenav [isOpen]="true" mode="docked" width="280px" [items]="items" ${attrs} />
    <div style="flex: 1; padding: 24px; color: var(--color-text-secondary);">{{ status }}</div>
  </div>`;

/** 3.44 (usm-x row 14): entries that start an action, one current, one busy. */
export const ActionItems: Story = {
  name: 'Action Items',
  parameters: {
    docs: {
      description: {
        story:
          '3.44 (usm-x row 14): `kind: \'action\'` items are buttons that emit `itemClicked` only (pass `route: \'\'`); the app sets `current` („Fenster öffnen“ is current, `aria-current="page"`). „Berichte erzeugen“ is `busy`: the spinner replaces its icon, it has `aria-busy` and `aria-disabled`, keeps its place and focus, ignores click, Enter and Space, and reads „Berichte erzeugen Wird geladen“ (`busyLabel`). Kostenstellen and Leistungsverrechnung are router links as before. Docked at 1024 px and wider, the open drawer at 360 px.',
      },
    },
  },
  render: () => ({
    props: {
      status: 'Arbeitsbereich',
      items: [
        { id: 'kst', icon: 'building-bank', label: 'Kostenstellen', route: '/kostenstellen', displayOrder: 1 },
        { id: 'lv', icon: 'arrow-path', label: 'Leistungsverrechnung', route: '/leistungsverrechnung', displayOrder: 2 },
        { id: 'open', icon: 'file', label: 'Fenster öffnen', route: '', kind: 'action', current: true, displayOrder: 3 },
        { id: 'reports', icon: 'chart-bar', label: 'Berichte erzeugen', route: '', kind: 'action', busy: true, displayOrder: 4 },
        { id: 'import', icon: 'arrow-down', label: 'Daten importieren', route: '', kind: 'action', displayOrder: 5 },
      ],
    },
    template: `<div lang="de">${rowStatesFrame('ariaLabel="Bereiche" busyLabel="Wird geladen" closeAriaLabel="Navigation schließen" (itemClicked)="status = $event.label"')}</div>`,
  }),
};

/** 3.44 (usm-x row 14): the row states on the 56 px rail. */
export const CollapsedRailStates: Story = {
  name: 'Collapsed Rail States',
  parameters: {
    docs: {
      description: {
        story:
          '3.44: on the collapsed rail the busy spinner sits in the 22 px icon box, a disabled item is dimmed (not its focus ring) and shows its reason as the kit tooltip below it on hover and focus (the label tooltip stays on the right), the hint is hidden (the name keeps it out, as on the rail today), and the badge „56/60“ is read as „Incidents 56 von 60 geladen“ (`badge.ariaLabel`). The frame is `overflow: visible` so the tooltips can leave it.',
      },
    },
  },
  render: () => ({
    props: {
      status: '',
      items: [
        { id: 'start', icon: 'home', label: 'Start', route: '/start', displayOrder: 1 },
        { id: 'reports', icon: 'chart-bar', label: 'Berichte', route: '/berichte', busy: true, displayOrder: 2 },
        { id: 'views', icon: 'eye', label: 'Darstellungen', route: '/darstellungen', disabled: true, disabledReason: 'Kein Recht für diesen Bereich', displayOrder: 3 },
        { id: 'kst', icon: 'building-bank', label: 'Kostenstellen', route: '/kostenstellen', hint: 'Rich Client', displayOrder: 4 },
        { id: 'inc', icon: 'bell', label: 'Incidents', route: '/incidents', badge: { value: '56/60', variant: 'primary', ariaLabel: '56 von 60 geladen' }, displayOrder: 5 },
      ],
    },
    template: `
      <div lang="de" style="display: flex; height: 400px; border: 1px solid var(--color-border); border-radius: 8px; overflow: visible;">
        <lc-sidenav [isOpen]="true" mode="docked" [collapsed]="true" [mobileBreakpoint]="0" [items]="items" ariaLabel="Bereiche"
                    busyLabel="Wird geladen" expandAriaLabel="Navigation ausklappen" />
        <div style="flex: 1;"></div>
      </div>`,
  }),
};

/** The app side of children on demand (3.44): load on `expandRequested`. */
@Component({
  selector: 'lc-sidenav-lazy-children-demo',
  standalone: true,
  imports: [SidenavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de" style="display: flex; height: 480px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
      <lc-sidenav [isOpen]="true" mode="docked" width="280px" [items]="items()" ariaLabel="Bereiche"
                  childrenLoadingLabel="Wird geladen …" closeAriaLabel="Navigation schließen" (expandRequested)="load($event)" />
      <p role="status" style="flex: 1; margin: 0; padding: 24px; color: var(--color-text-secondary);">{{ status() }}</p>
    </div>
  `,
})
class SidenavLazyChildrenDemoComponent {
  protected readonly status = signal('');
  protected readonly items = signal<NavigationItem[]>([
    { id: 'start', icon: 'home', label: 'Start', route: '/start', displayOrder: 1 },
    { id: 'contracts', icon: 'file', label: 'Verträge', route: '', hasChildren: true, displayOrder: 2 },
    { id: 'archive', icon: 'clipboard', label: 'Archiv', route: '', hasChildren: true, displayOrder: 3 },
  ]);

  protected load(item: NavigationItem): void {
    this.patch(item.id, { childrenLoading: true });
    // „Verträge“ stays loading (the story's open group); „Archiv“ loads after 600 ms.
    if (item.id !== 'archive') return;
    setTimeout(() => {
      this.patch(item.id, {
        childrenLoading: false,
        children: ['2024', '2025', '2026'].map((year, i) => ({ id: `archive-${year}`, icon: 'file', label: year, route: `/archiv/${year}`, displayOrder: i + 1 })),
      });
      this.status.set('Archiv: 3 Einträge geladen');
    }, 600);
  }

  private patch(id: string, change: Partial<NavigationItem>): void {
    this.items.update((items) => items.map((i) => (i.id === id ? { ...i, ...change } : i)));
  }
}

/** 3.44 (usm-x row 14): groups whose children load on demand. */
export const LazyChildren: Story = {
  name: 'Lazy Children',
  parameters: {
    docs: {
      description: {
        story:
          '3.44: `hasChildren` groups show the chevron before they have children. Opening one emits `expandRequested`; the app sets `childrenLoading` (a loading row „Wird geladen …“ and `aria-busy` on the children area) and then supplies `children`. „Verträge“ is open and still loading; open „Archiv“: its three children arrive after 600 ms, the focus stays on the group, and the app announces the result in its own `role="status"`.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [SidenavLazyChildrenDemoComponent] },
    template: `<lc-sidenav-lazy-children-demo />`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    const group = [...canvasElement.querySelectorAll<HTMLButtonElement>('.lc-sidenav__nav-item--parent')].find((b) => b.textContent?.includes('Verträge'));
    group?.click();
  },
};

/** 3.44 (usm-x row 14): hints, disabled items with a reason and a muted item, German. */
export const HintsAndReasonsGerman: Story = {
  name: 'Hints And Reasons (German)',
  parameters: {
    docs: {
      description: {
        story:
          '3.44: a right-aligned `hint` beside the label (12 px, the section ink at rest, the item ink on hover and when current): „Rich Client“ beside Kostenstellen and its badge; „Editor im Rich Client“ shrinks first with an ellipsis (full text in `title`) next to a badge and a chevron, which never move out. Two `disabled` items with a `disabledReason` stay in place, dimmed, focusable, and show „Kein Recht für diesen Bereich“ as the tooltip on hover and focus (`aria-describedby`). „Verträge“ is `muted`: quieter at rest, still a link. Open drawer at 360 px.',
      },
    },
  },
  render: () => ({
    props: {
      status: '',
      items: [
        { id: 'kst', icon: 'building-bank', label: 'Kostenstellen', route: '/kostenstellen', hint: 'Rich Client', badge: { value: 3 }, displayOrder: 1 },
        {
          id: 'nav', icon: 'settings', label: 'Navigation', route: '', hint: 'Editor im Rich Client', badge: { value: 3 }, displayOrder: 2,
          children: [{ id: 'nav-1', icon: 'file', label: 'Menüs', route: '/navigation/menues', displayOrder: 1 }],
        },
        { id: 'lv', icon: 'arrow-path', label: 'Leistungsverrechnung', route: '/leistungsverrechnung', hint: 'kein Recht', disabled: true, disabledReason: 'Kein Recht für diesen Bereich', displayOrder: 3 },
        { id: 'views', icon: 'eye', label: 'Darstellungen', route: '/darstellungen', disabled: true, disabledReason: 'Kein Recht für diesen Bereich', displayOrder: 4 },
        { id: 'contracts', icon: 'file', label: 'Verträge', route: '/vertraege', muted: true, displayOrder: 5 },
        { id: 'reports', icon: 'chart-bar', label: 'Berichte', route: '/berichte', displayOrder: 6 },
      ],
    },
    template: `<div lang="de">${rowStatesFrame('ariaLabel="Bereiche" activeRoute="/kostenstellen" closeAriaLabel="Navigation schließen"')}</div>`,
  }),
};

/** 3.44 (backlog 064-n2): an area rail with a brand second line, a chosen letter, extra routes, tooltips and an image icon. */
export const AreaRailGerman: Story = {
  name: 'Area Rail (German)',
  parameters: {
    docs: {
      description: {
        story:
          '3.44 (064-n2): `theme="dark"`, `brandName="USM X"` with `brandSubtitle="Customizing"` (one line each; the link reads „USM X Customizing“) and `brandLetter="X"` in the tile. Sections „Arbeit“ and „Customizing“. „Klassen“ is current through one of its `matchRoutes` (`activeRoute="/vorgang"`), the area owning several addresses. „Oberfläche“ has a `tooltip`; „Erweiterungen“ an `iconUrl` image (`alt=""`, 20 px).',
      },
    },
  },
  render: () => ({
    props: {
      status: '',
      items: [
        {
          id: 'work', icon: '', label: 'Arbeit', route: '', isSection: true, displayOrder: 1,
          children: [
            { id: 'inc', icon: 'bell', label: 'Incidents', route: '/incidents', displayOrder: 1 },
            { id: 'cls', icon: 'clipboard', label: 'Klassen', route: '/klassen', matchRoutes: ['/vorgang', '/fenster'], displayOrder: 2 },
          ],
        },
        {
          id: 'custom', icon: '', label: 'Customizing', route: '', isSection: true, displayOrder: 2,
          children: [
            { id: 'ui', icon: 'device-desktop', label: 'Oberfläche', route: '/oberflaeche', tooltip: 'Masken, Menüs und Darstellungen', displayOrder: 1 },
            { id: 'ext', icon: '', iconUrl: IMAGE_ICON, label: 'Erweiterungen', route: '/erweiterungen', displayOrder: 2 },
          ],
        },
      ],
    },
    template: `<div lang="de">${rowStatesFrame('theme="dark" activeRoute="/vorgang" ariaLabel="Bereiche" brandName="USM X" brandSubtitle="Customizing" brandLetter="X" brandHref="/" closeAriaLabel="Navigation schließen"', 'overflow: visible;')}</div>`,
  }),
};

/** 3.44 (backlog 064-n2): a badge with two numbers and a tooltip; the context-menu hook. */
export const CountsAndContextMenu: Story = {
  name: 'Counts And Context Menu',
  parameters: {
    docs: {
      description: {
        story:
          '3.44 (064-n2): the badge „56/60“ has its own `ariaLabel` („56 of 60 loaded“, read instead of `badgeAriaLabel`) and a `tooltip` that joins the item’s tooltip after „ · “. Right-click an item, or press Shift+F10 or the Menu key on it: `itemContextMenu` emits `{ item, event }` once and the kit prevents nothing (the line on the right shows the last one). iOS fires no `contextmenu`: pair it with the item’s `action` button.',
      },
    },
  },
  render: () => ({
    props: {
      status: 'Context menu: –',
      items: [
        { id: 'inc', icon: 'bell', label: 'Incidents', route: '/incidents', tooltip: 'Loaded today, 06:00', badge: { value: '56/60', variant: 'primary', ariaLabel: '56 of 60 loaded', tooltip: '4 still loading' }, displayOrder: 1 },
        { id: 'orders', icon: 'shopping-bag', label: 'Orders', route: '/orders', badge: { value: 12 }, action: { icon: 'dots', ariaLabel: 'Orders actions' }, displayOrder: 2 },
        { id: 'settings', icon: 'settings', label: 'Settings', route: '/settings', displayOrder: 3 },
      ],
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; height: 400px; border: 1px solid var(--color-border); border-radius: 8px; overflow: visible;">
        <lc-sidenav [isOpen]="true" mode="docked" width="260px" [mobileBreakpoint]="0" [items]="items" activeRoute="/orders"
                    (itemContextMenu)="status = 'Context menu: ' + $event.item.label" />
        <p role="status" style="flex: 1; margin: 0; padding: 24px; color: var(--color-text-secondary);">{{ status }}</p>
      </div>`,
  }),
};

/**
 * 3.45 (backlog 064-n2): foldable sections and the long press on touch. A
 * second collapsible level stays out (tree semantics; see `lc-tree-view`).
 */
export const FoldableSections: Story = {
  name: 'Foldable Sections',
  parameters: {
    docs: {
      description: {
        story:
          'Sections with `collapsible: true` get a disclosure button in their `h2` (`aria-expanded`, `aria-controls` → the list); „Auswertungen“ starts folded through `collapsedSections` (two-way). Navigating to an item in a folded section unfolds it; the rail ignores folding. With `contextMenuOnLongPress` a 500 ms touch hold on an item emits `itemContextMenu` (the line on the right shows the last one), suppresses the iOS callout and the click after it. 3.47: groups nest to any depth (*Deep Tree*) with the same disclosure buttons; the depth is not announced (tree semantics — `role="tree"`, `aria-level`, arrow keys — would change every sidenav’s screen-reader model; `lc-tree-view` covers a tree).',
      },
    },
    controls: { include: ['collapsedSections', 'contextMenuOnLongPress'] },
  },
  args: {
    collapsedSections: ['reports'],
    contextMenuOnLongPress: true,
  },
  render: (args) => ({
    props: {
      ...args,
      status: 'Kontextmenü: –',
      items: [
        {
          id: 'master', icon: '', label: 'Stammdaten', route: '', displayOrder: 1, isSection: true, collapsible: true,
          children: [
            { id: 'cc', icon: 'building-library', label: 'Kostenstellen', route: '/kostenstellen', displayOrder: 1 },
            { id: 'keys', icon: 'percent-badge', label: 'Leistungsverrechnungsschlüssel', route: '/schluessel', displayOrder: 2 },
          ],
        },
        {
          id: 'reports', icon: '', label: 'Auswertungen', route: '', displayOrder: 2, isSection: true, collapsible: true,
          children: [
            { id: 'monthly', icon: 'chart-bar', label: 'Monatsbericht', route: '/monat', displayOrder: 1 },
            { id: 'forecast', icon: 'presentation-chart-line', label: 'Prognose', route: '/prognose', displayOrder: 2 },
          ],
        },
        {
          id: 'admin', icon: '', label: 'Verwaltung', route: '', displayOrder: 3, isSection: true, collapsible: true,
          children: [
            { id: 'users', icon: 'users', label: 'Benutzer und Rollen', route: '/benutzer', displayOrder: 1 },
            { id: 'settings', icon: 'settings', label: 'Einstellungen', route: '/einstellungen', displayOrder: 2 },
          ],
        },
      ],
    },
    template: `
      <div lang="de" style="display: flex; flex-wrap: wrap; height: 520px; border: 1px solid var(--color-border); border-radius: 8px; overflow: visible;">
        <lc-sidenav [isOpen]="true" mode="docked" width="280px" [mobileBreakpoint]="0" [items]="items" activeRoute="/kostenstellen"
                    ariaLabel="Seitennavigation" [(collapsedSections)]="collapsedSections" [contextMenuOnLongPress]="contextMenuOnLongPress"
                    (itemContextMenu)="status = 'Kontextmenü: ' + $event.item.label" />
        <p role="status" style="flex: 1; min-width: 12rem; margin: 0; padding: 24px; color: var(--color-text-secondary);">{{ status }}</p>
      </div>`,
  }),
};

/** 3.47 (usm-x rows 38, 39, 43, 46): an area picker and a search in the slot, the search marking the labels. */
@Component({
  selector: 'lc-sidenav-top-slot-demo',
  standalone: true,
  imports: [SidenavComponent, SelectComponent, SearchInputComponent, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      lang="de"
      style="display: flex; flex-wrap: wrap; height: 560px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;
             --lc-sidenav-backdrop: color-mix(in srgb, var(--color-primary-fill-active) 60%, transparent);"
    >
      <lc-sidenav [isOpen]="true" mode="docked" [items]="items" activeRoute="/rechnungseingang" [highlight]="query()"
                  brandName="USM X" brandSubtitle="Arbeitsbereich" brandRoute="/start"
                  ariaLabel="Hauptnavigation" closeAriaLabel="Navigation schließen">
        <lc-select sidenav-top ariaLabel="Bereich" [options]="areas" [clearable]="false" [(ngModel)]="area" />
        <lc-search-input sidenav-top ariaLabel="Navigation durchsuchen" placeholder="Navigation durchsuchen" clearAriaLabel="Suche leeren"
                         [debounceMs]="0" [(value)]="query" />
      </lc-sidenav>
      <p role="status" style="flex: 1; min-width: 12rem; margin: 0; padding: 24px; color: var(--color-text-secondary);">Suche: „{{ query() }}“</p>
    </div>
  `,
})
class SidenavTopSlotDemoComponent {
  protected readonly query = signal('rech');
  protected area = 'work';
  protected readonly areas: SelectOption[] = [
    { value: 'work', label: 'Arbeitsbereich' },
    { value: 'custom', label: 'Customizing' },
  ];
  protected readonly items: NavigationItem[] = [
    { id: 'start', icon: 'home', label: 'Start', route: '/start', displayOrder: 1 },
    {
      id: 'invoices', icon: 'file', label: 'Rechnungen', route: '', displayOrder: 2,
      children: [
        { id: 'in', icon: 'file', label: 'Rechnungseingangsprüfung Lieferantenstammdaten', route: '/rechnungseingang', displayOrder: 1 },
        { id: 'out', icon: 'file', label: 'Rechnungsausgang', route: '/rechnungsausgang', displayOrder: 2 },
      ],
    },
    { id: 'contracts', icon: 'clipboard', label: 'Verträge', route: '/vertraege', displayOrder: 3 },
    { id: 'reports', icon: 'chart-bar', label: 'Berichte und Abrechnungen', route: '/berichte', displayOrder: 4 },
    { id: 'settings', icon: 'settings', label: 'Einstellungen', route: '/einstellungen', displayOrder: 5 },
  ];
}

/** 3.47 (usm-x rows 38, 39, 43, 46): the slot between the brand and the items. */
export const TopSlot: Story = {
  name: 'Top Slot',
  parameters: {
    docs: {
      description: {
        story:
          '3.47 (usm-x rows 38, 39, 46): `[sidenav-top]` content sits between the brand and the items: an `lc-select` „Bereich“ and an `lc-search-input` „Navigation durchsuchen“, on the nav gutter (8 px), 8 px apart, 16 px above the items; it scrolls with the items, is hidden on the collapsed rail, and is inside the drawer (at 360 px: brand, ×, slot, items in this tab order). Without content nothing is drawn. The search is bound to `highlight`: every „rech“ in a label is marked (bold, underlined, in the label’s ink). The long label „Rechnungseingangsprüfung Lieferantenstammdaten“ ends in „…“ and gets its full text as `title` when the pointer enters it. The brand links to `brandRoute="/start"`. The drawer’s backdrop is `--lc-sidenav-backdrop: color-mix(in srgb, var(--color-primary-fill-active) 60%, transparent)`. Docked from 768 px, the open drawer below.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [SidenavTopSlotDemoComponent] },
    template: `<lc-sidenav-top-slot-demo />`,
  }),
};

/** A coloured customer mark, drawn white on the petrol rail through `--lc-sidenav-brand-logo-filter`. */
const CUSTOMER_LOGO =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="9" cy="12" r="7" fill="#e4572e"/><rect x="12" y="5" width="10" height="14" rx="2" fill="#2e86ab"/></svg>',
  );

/** 3.47 (usm-x rows 39, 43, 45, 46): a customer's rail and the customizing rail. */
export const BrandAndHooks: Story = {
  name: 'Brand And Hooks',
  parameters: {
    docs: {
      description: {
        story:
          '3.47. Left, „Kunde AG“ (usm-x rows 39, 43, 45): the petrol rail of *App Shell › Full Height Nav* (`theme="dark"`, `--lc-sidenav-bg: var(--color-primary-fill-active)`, `-hover-bg: var(--color-primary-fill-hover)`, `-active-bg: var(--color-primary-fill)`, `-active-fg` / `-active-icon` / `-active-indicator: var(--color-on-primary)`) with the new hooks `--lc-sidenav-focus-ring: var(--color-on-primary)` (13.18:1 on the rail, 6.21:1 on the current item), `--lc-sidenav-icon-size: 18px`, `--lc-sidenav-brand-height: 48px` and a customer logo (`brandLogoSrc`, a coloured data URI) drawn as a white silhouette by `--lc-sidenav-brand-logo-filter: brightness(0) invert(1)` on `--lc-sidenav-brand-tile-bg: transparent`. `[brandLink]="false"`: the brand is a plain block, no link, no tab stop. Right, „USM X / Customizing“ (rows 43, 46): `--lc-sidenav-section-fg: var(--color-text-secondary)` for the headings and `--lc-sidenav-muted-fg: var(--color-text-tertiary)` for the muted areas (Darstellungen, Klassen, Benutzer und Rollen), now two inks; an `lcSidenavLabel` template draws each area’s code before its label (tabular figures, the section ink), at every level.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [SidenavLabelDirective] },
    props: {
      logo: CUSTOMER_LOGO,
      customerItems: [
        { id: 'overview', icon: 'home', label: 'Übersicht', route: '/uebersicht', displayOrder: 1 },
        { id: 'orders', icon: 'clipboard', label: 'Aufträge', route: '/auftraege', displayOrder: 2 },
        { id: 'invoices', icon: 'file', label: 'Rechnungen', route: '/rechnungen', displayOrder: 3 },
        { id: 'reports', icon: 'chart-bar', label: 'Berichte', route: '/berichte', displayOrder: 4 },
      ],
      customizingItems: [
        {
          id: 'C10', icon: '', label: 'Oberfläche', route: '', isSection: true, displayOrder: 1,
          children: [
            { id: 'C11', icon: 'device-desktop', label: 'Masken', route: '/masken', displayOrder: 1 },
            { id: 'C12', icon: 'file', label: 'Menüs', route: '/menues', displayOrder: 2 },
            { id: 'C13', icon: 'eye', label: 'Darstellungen', route: '/darstellungen', muted: true, displayOrder: 3 },
            { id: 'C14', icon: 'clipboard', label: 'Klassen', route: '/klassen', muted: true, displayOrder: 4 },
          ],
        },
        {
          id: 'C20', icon: '', label: 'System', route: '', isSection: true, displayOrder: 2,
          children: [
            { id: 'C21', icon: 'users', label: 'Benutzer und Rollen', route: '/benutzer', muted: true, displayOrder: 1 },
            { id: 'C22', icon: 'settings', label: 'Einstellungen', route: '/einstellungen', displayOrder: 2 },
          ],
        },
      ],
    },
    template: `
      <div lang="de" style="display: flex; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; height: 440px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;
                    --lc-sidenav-bg: var(--color-primary-fill-active); --lc-sidenav-border: transparent;
                    --lc-sidenav-hover-bg: var(--color-primary-fill-hover); --lc-sidenav-active-bg: var(--color-primary-fill);
                    --lc-sidenav-active-fg: var(--color-on-primary); --lc-sidenav-active-icon: var(--color-on-primary);
                    --lc-sidenav-active-indicator: var(--color-on-primary); --lc-sidenav-focus-ring: var(--color-on-primary);
                    --lc-sidenav-icon-size: 18px; --lc-sidenav-brand-height: 48px; --lc-sidenav-brand-tile-bg: transparent;
                    --lc-sidenav-brand-logo-filter: brightness(0) invert(1);">
          <lc-sidenav [isOpen]="true" mode="docked" width="280px" [mobileBreakpoint]="0" theme="dark" [items]="customerItems"
                      activeRoute="/auftraege" brandName="Kunde AG" [brandLink]="false" [brandLogoSrc]="logo" ariaLabel="Kundenbereich" />
        </div>
        <div style="display: flex; height: 440px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;
                    --lc-sidenav-section-fg: var(--color-text-secondary); --lc-sidenav-muted-fg: var(--color-text-tertiary);">
          <lc-sidenav [isOpen]="true" mode="docked" width="280px" [mobileBreakpoint]="0" [items]="customizingItems"
                      activeRoute="/masken" brandName="USM X" brandSubtitle="Customizing" brandLetter="X" ariaLabel="Customizing">
            <ng-template lcSidenavLabel let-item
              ><span style="font-variant-numeric: tabular-nums; color: var(--lc-sidenav-section-fg);">{{ item.id }}</span> {{ item.label }}</ng-template
            >
          </lc-sidenav>
        </div>
      </div>`,
  }),
};

/** 3.47 (usm-x rows 40, 41, 42): a deep tree, open groups from the backend, a menu at the action. */
@Component({
  selector: 'lc-sidenav-deep-tree-demo',
  standalone: true,
  imports: [SidenavComponent, MenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de">
      <!-- 3.48 (067-n1): the status line sits above the frame, so it shows at 360 px too -->
      <p role="status" style="margin: 0 0 12px; color: var(--color-text-secondary);">
        Offene Gruppen: {{ open().join(', ') }}<br />Letzte Aktion: {{ last() }}
      </p>
      <div style="display: flex; height: 560px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
        <lc-sidenav [isOpen]="true" mode="docked" width="280px" [mobileBreakpoint]="0" [items]="items()" activeRoute="/rechnungsfreigabe-4711"
                    ariaLabel="Arbeitsbereich" childrenLoadingLabel="Wird geladen …" [(expandedGroups)]="open"
                    [expandedActionId]="target()?.id ?? null"
                    (expandRequested)="load($event)" (itemActionClick)="openMenu($event)" />
      </div>
      <!-- 3.48 (usm-x row 53, 067-n4): the menu opens in an overlay at the action button (\`anchor\`); the button's
           popup state comes from \`action.hasPopup\` and \`expandedActionId\`, the focus returns to it on close. -->
      <lc-menu [items]="menuItems" [isOpen]="!!target()" [anchor]="target()?.element ?? null" position="bottom-right"
               [ariaLabel]="'Aktionen für ' + (target()?.label ?? '')" (itemClick)="pick($event)" (closed)="closeMenu()" />
    </div>
  `,
})
class SidenavDeepTreeDemoComponent {
  protected readonly open = signal<readonly string[]>(['outgoing']);
  protected readonly last = signal('–');
  protected readonly target = signal<NavigationActionTarget | null>(null);
  protected readonly menuItems: MenuItem[] = [
    { id: 'rename', label: 'Umbenennen', icon: 'pencil' },
    { id: 'move', label: 'Verschieben', icon: 'arrow-right' },
    { id: 'delete', label: 'Löschen', icon: 'trash', variant: 'danger' },
  ];
  protected readonly items = signal<NavigationItem[]>(deepTreeItems());

  protected openMenu(event: NavigationItemActionEvent): void {
    this.target.set({ id: event.item.id, label: event.item.label, element: event.element });
  }

  protected pick(item: MenuItem): void {
    this.last.set(`${item.label}: ${this.target()?.label ?? ''}`);
    this.closeMenu();
  }

  /** Closes the menu; the button's `aria-expanded` follows `expandedActionId`. */
  protected closeMenu(): void {
    this.target.set(null);
  }

  protected load(item: NavigationItem): void {
    if (item.id !== 'archive') return;
    this.items.set(deepTreeItems({ childrenLoading: true }));
    setTimeout(() => {
      this.items.set(
        deepTreeItems({
          children: ['2024', '2025', '2026'].map((year, i) => ({ id: `archive-${year}`, icon: 'file', label: `Archiv ${year}`, route: `/archiv/${year}`, displayOrder: i + 1 })),
        }),
      );
    }, 600);
  }
}

interface NavigationActionTarget {
  id: string;
  label: string;
  element: HTMLButtonElement;
}

/** The deep tree of *Deep Tree*; `archive` patches the lazy „Archiv“ group (level 4). */
function deepTreeItems(archive: Partial<NavigationItem> = {}): NavigationItem[] {
  return [
    { id: 'start', icon: 'home', label: 'Start', route: '/start', displayOrder: 1 },
    {
      id: 'workflows', icon: 'folder', label: 'Workflows', route: '', displayOrder: 2,
      children: [
        {
          id: 'incoming', icon: 'folder', label: 'Eingangsrechnungen', route: '', displayOrder: 1,
          children: [
            {
              id: 'review', icon: 'folder', label: 'Prüfung', route: '', displayOrder: 1, action: { icon: 'dots', ariaLabel: 'Aktionen für Prüfung', hasPopup: 'menu' },
              children: [
                {
                  id: 'approval', icon: 'folder', label: 'Freigabe', route: '', displayOrder: 1,
                  children: [
                    { id: 'approval-4711', icon: 'file', label: 'Rechnungsfreigabe Kostenstelle 4711', route: '/rechnungsfreigabe-4711', displayOrder: 1, action: { icon: 'dots', ariaLabel: 'Aktionen für Rechnungsfreigabe Kostenstelle 4711', hasPopup: 'menu' } },
                    { id: 'collective', icon: 'file', label: 'Freigabe Sammelrechnung', route: '/sammelrechnung', displayOrder: 2 },
                  ],
                },
                { id: 'archive', icon: 'folder', label: 'Archiv', route: '', displayOrder: 2, hasChildren: true, ...archive },
              ],
            },
          ],
        },
        {
          id: 'outgoing', icon: 'folder', label: 'Ausgangsrechnungen', route: '', displayOrder: 2,
          children: [
            { id: 'reminders', icon: 'file', label: 'Mahnungen', route: '/mahnungen', displayOrder: 1 },
            { id: 'credits', icon: 'file', label: 'Gutschriften', route: '/gutschriften', displayOrder: 2 },
          ],
        },
      ],
    },
  ];
}

/** 3.47 (usm-x rows 40, 41, 42): groups at any depth, open groups as a model, a menu anchored at the action. */
export const DeepTree: Story = {
  name: 'Deep Tree',
  parameters: {
    docs: {
      description: {
        story:
          '3.47 (usm-x rows 40–42): `children` nest to any depth, drawn by one recursive template: Workflows › Eingangsrechnungen › Prüfung › Freigabe › „Rechnungsfreigabe Kostenstelle 4711“ (level 5, current; every group above it is open and marked). Each level indents 12 px more (the first 16); each group folds on its own with the same disclosure button (`aria-expanded`). „Archiv“ (level 4) loads its children on demand: open it, „Wird geladen …“ shows, its three years arrive after 600 ms. „Ausgangsrechnungen“ starts open through `[(expandedGroups)]` (the backend’s open folders); the line on the right shows the open ids as the sidenav reports them. Folding „Prüfung“ keeps it folded when the archive loads (an `items` update). The `action` button („…“) now renders at every level, 44 × 44 px to hit: `itemActionClick` gives `{ item, event, element }`. 3.48: the story opens an `lc-menu` (Umbenennen, Verschieben, Löschen) in an overlay at `element` (`[anchor]`, usm-x row 53); `action.hasPopup: \'menu\'` renders `aria-haspopup="menu"` and `aria-expanded` on the button (also prerendered), and `[expandedActionId]` marks the open one `"true"` (it stays visible); the menu returns the focus to the button when it closes. A row action shows on hover, on keyboard focus, while `aria-expanded="true"` and always on touch screens (`hover: none`, 067-s1). The status line sits above the frame, so it shows at 360 px (067-n1).',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [SidenavDeepTreeDemoComponent] },
    template: `<lc-sidenav-deep-tree-demo />`,
  }),
};

/** The USM X rail of 3.50 (usm-x row 74): the full tree for the expanded sidenav and the drawer. */
const USMX_ITEMS: NavigationItem[] = [
  { id: 'start', icon: 'home', label: 'Übersicht', route: '/start', displayOrder: 1 },
  {
    id: 'stamm', icon: 'folder', label: 'Stammdaten', route: '', displayOrder: 2,
    children: [
      { id: 'objekttypen', icon: 'file', label: 'Objekttypen', route: '/stamm/objekttypen', displayOrder: 1 },
      { id: 'felder', icon: 'file', label: 'Felder', route: '/stamm/felder', displayOrder: 2 },
    ],
  },
  {
    id: 'pruef', icon: 'check-circle', label: 'Prüfungen', route: '', displayOrder: 3,
    children: [{ id: 'regeln', icon: 'file', label: 'Prüfregeln', route: '/pruef/regeln', displayOrder: 1 }],
  },
  { id: 'system', icon: 'settings', label: 'System', route: '/system', displayOrder: 4 },
];

/** What the collapsed rail draws instead (usm-x row 74): „Übersicht“ and one icon per area group. */
const USMX_RAIL: NavigationItem[] = [
  { id: 'rail-start', icon: 'home', label: 'Übersicht', route: '/start', displayOrder: 1 },
  // An action entry is current only by `current` (as in `items`: routes never make an action current).
  { id: 'rail-stamm', icon: 'folder', label: 'Stammdaten', route: '', kind: 'action', hasPopup: 'menu', current: true, displayOrder: 2 },
  { id: 'rail-pruef', icon: 'check-circle', label: 'Prüfungen', route: '', kind: 'action', hasPopup: 'menu', badge: { value: 12, variant: 'warning' }, displayOrder: 3 },
  { id: 'rail-system', icon: 'settings', label: 'System', route: '/system', displayOrder: 4 },
];

/** The group menu beside the rail (usm-x rows 74, 78): sections to three levels, current, busy, a badge. */
const RAIL_GROUPS: MenuItem[] = [
  {
    id: 'g-stamm',
    label: 'Stammdaten',
    children: [
      {
        id: 'g-objekte',
        label: 'Objekte',
        children: [
          { id: 'g-objekttypen', label: 'Objekttypen', current: true },
          { id: 'g-felder', label: 'Felder', children: [{ id: 'g-feldgruppen', label: 'Feldgruppen' }] },
        ],
      },
      { id: 'g-zaehler', label: 'Zähler', busy: true },
      { id: 'g-pruefungen', label: 'Prüfungen', badgeVariant: 'warning', metadata: { badge: '12' } },
    ],
  },
];

/** A 44 px icon button for the `[sidenav-rail-top]` slot (the app's area picker). */
const RAIL_TOP_BUTTON =
  'display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; padding: 0; border: 1px solid var(--color-border); border-radius: var(--border-radius-md); background: transparent; color: inherit; cursor: pointer;';

/** 3.50 (usm-x row 74): the collapsed rail with its own top content, railItems and a group menu beside it. */
@Component({
  selector: 'lc-sidenav-rail-top-demo',
  standalone: true,
  imports: [SidenavComponent, MenuComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de">
      <p role="status" style="margin: 0 0 12px; color: var(--color-text-secondary);">Letzte Auswahl: {{ last() }}</p>
      <div style="display: flex; height: 520px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
        <lc-sidenav [isOpen]="true" mode="docked" width="280px" [(collapsed)]="collapsed" [items]="items" [railItems]="rail"
                    activeRoute="/stamm/objekttypen" ariaLabel="Bereiche" brandName="USM X" brandSubtitle="Customizing" brandLetter="X"
                    [showCollapseToggle]="true" collapseAriaLabel="Navigation nach links einklappen" expandAriaLabel="Navigation ausklappen"
                    closeAriaLabel="Navigation schließen" [expandedActionId]="target()?.id ?? null" (railItemClick)="openGroup($event)">
          <div sidenav-top style="padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--border-radius-md);">Bereich: Customizing</div>
          <button sidenav-rail-top type="button" aria-label="Bereich wählen: Customizing" style="${RAIL_TOP_BUTTON}">
            <lc-icon name="target" size="sm" [decorative]="true" />
          </button>
        </lc-sidenav>
        <div style="flex: 1; padding: 24px; color: var(--color-text-secondary);">Objekttypen</div>
      </div>
      <!-- The group menu at a point 8 px beside the rail, level with the item; the focus returns to the rail item. -->
      <lc-menu [items]="groups" [isOpen]="!!target()" [anchor]="target()?.point ?? null" [returnFocusTo]="target()?.element ?? null"
               [ariaLabel]="target()?.label ?? ''" busyLabel="Wird geladen" (itemClick)="pick($event)" (closed)="target.set(null)" />
    </div>
  `,
})
class SidenavRailTopDemoComponent {
  protected readonly items = USMX_ITEMS;
  protected readonly rail = USMX_RAIL;
  protected readonly groups = RAIL_GROUPS;
  protected readonly collapsed = signal(true);
  protected readonly last = signal('–');
  protected readonly target = signal<{ id: string; label: string; element: HTMLElement; point: { x: number; y: number } } | null>(null);

  protected openGroup(event: NavigationRailItemEvent): void {
    if (event.item.kind !== 'action') return;
    // 8 px beside the rail's edge (not the item's), level with the item.
    const rail = (event.element.closest('.lc-sidenav') ?? event.element).getBoundingClientRect();
    const rect = event.element.getBoundingClientRect();
    this.target.set({ id: event.item.id, label: event.item.label, element: event.element, point: { x: rail.right + 8, y: rect.top } });
  }

  protected pick(item: MenuItem): void {
    this.last.set(item.label);
    this.target.set(null);
  }
}

export const CollapsedRailWithTopSlot: Story = {
  name: 'Collapsed Rail With Top Slot',
  parameters: {
    docs: {
      description: {
        story:
          '3.50 (usm-x row 74): the collapsed rail keeps content of its own. `[sidenav-rail-top]` (here the area picker as a 44 px icon button) shows only on the docked, collapsed rail, centred between the brand and the items (x 5.5 … 49.5 on the 56 px rail, the brand\'s column); expanded and in the drawer the full `[sidenav-top]` picker shows instead. `railItems` is what the rail draws instead of `items`: „Übersicht“, one icon per area group and „System“, in the rail\'s look (tooltip, badge dot, current bar); „Stammdaten“ is current by `current: true` (an action entry is never current by a route, as in `items`; a link entry would be by `route` / `matchRoutes`). „Stammdaten“ and „Prüfungen“ are `kind: \'action\'` with `hasPopup: \'menu\'` (`aria-haspopup`, `aria-expanded` from `expandedActionId`): a press emits `railItemClick` with the element, and the page opens an `lc-menu` at a point 8 px beside the rail\'s edge, level with the item (`x` = the rail\'s right + 8, not the item\'s; nested sections, a current, a busy item, a warning badge) with `returnFocusTo` = the rail item, so Escape, Tab or a choice give the focus back. Expand the rail with the button at the bottom. At 360 px the open drawer shows `items`.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [SidenavRailTopDemoComponent] },
    template: `<lc-sidenav-rail-top-demo />`,
  }),
};

/** 3.50 (usm-x row 74): the brand toggles the rail. */
export const BrandToggle: Story = {
  name: 'Brand Toggle',
  parameters: {
    docs: {
      description: {
        story:
          '3.50 (usm-x row 74): `brandToggle`: in docked mode the brand is one `<button>` that collapses and expands the rail, whatever it shows (here the letter „X“). Its name says the brand and what a press does: „USM X Customizing, Navigation nach links einklappen“ expanded, „USM X Customizing, Navigation ausklappen“ collapsed (`collapseAriaLabel` / `expandAriaLabel`). 44 px target, the brand\'s hover fill and focus ring, the name as a tooltip on the rail; the focus stays on the same button across both states. `showCollapseToggle` works beside it. In drawer mode the brand stays as `brandLink` says. Left expanded, right collapsed.',
      },
    },
  },
  render: () => ({
    props: { items: USMX_ITEMS, activeRoute: '/stamm/objekttypen' },
    template: `
      <div lang="de" style="display: flex; flex-wrap: wrap; gap: 24px;">
        ${brandRail('brandName="USM X" brandSubtitle="Customizing" brandLetter="X" [brandToggle]="true" [showCollapseToggle]="true" collapseAriaLabel="Navigation nach links einklappen" expandAriaLabel="Navigation ausklappen" ariaLabel="Bereiche"', '240px', 'overflow: visible; position: relative; z-index: 2;')}
        ${brandRail('[collapsed]="true" brandName="USM X" brandSubtitle="Customizing" brandLetter="X" [brandToggle]="true" [showCollapseToggle]="true" collapseAriaLabel="Navigation nach links einklappen" expandAriaLabel="Navigation ausklappen" ariaLabel="Bereiche"', '240px', 'overflow: visible; position: relative; z-index: 1;')}
      </div>`,
  }),
};

/** A 4:1 wordmark (96 × 24 at the default height). */
const WORDMARK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 24"><rect x="0" y="2" width="20" height="20" rx="5" fill="#208497"/><rect x="26" y="5" width="66" height="6" rx="3" fill="#208497"/><rect x="26" y="14" width="44" height="5" rx="2.5" fill="#7c5cc4"/></svg>',
  );

/** A square mark (24 × 24). */
const SQUARE_MARK =
  'data:image/svg+xml,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="9" cy="12" r="7" fill="#e4572e"/><rect x="12" y="5" width="10" height="14" rx="2" fill="#2e86ab"/></svg>');

/** 3.50 (usm-x row 75): a wordmark at its own ratio. */
export const BrandLogoFit: Story = {
  name: 'Brand Logo Fit',
  parameters: {
    docs: {
      description: {
        story:
          '3.50 (usm-x row 75): `brandLogoFit="natural"` draws `brandLogoSrc` at its own aspect ratio, `--lc-sidenav-brand-logo-height` high (default 24 px), without the tile and at most as wide as the brand: the 4:1 wordmark is 96 × 24 px instead of being shrunk into the 24 px square, and a 1:1 mark is 24 × 24. The default `tile` keeps the 32 px tile (third rail). Collapsed (fourth rail), the rail shows the tile with the letter instead of the wordmark. Light and dark rails; `--lc-sidenav-brand-logo-filter` still applies.',
      },
    },
  },
  render: () => ({
    props: { items: USMX_ITEMS, activeRoute: '/start', wordmark: WORDMARK, square: SQUARE_MARK },
    template: `
      <div lang="de" style="display: flex; flex-wrap: wrap; gap: 24px;">
        ${brandRail('theme="light" brandName="USM X" [brandLogoSrc]="wordmark" brandLogoFit="natural" brandAriaLabel="USM X – Start" ariaLabel="Bereiche (4:1)"')}
        ${brandRail('theme="dark" brandName="USM X" [brandLogoSrc]="square" brandLogoFit="natural" brandAriaLabel="USM X – Start" ariaLabel="Bereiche (1:1)"')}
        ${brandRail('theme="dark" brandName="USM X" [brandLogoSrc]="square" brandAriaLabel="USM X – Start" ariaLabel="Bereiche (tile)"')}
        ${brandRail('theme="light" [collapsed]="true" brandName="USM X" brandLetter="X" [brandLogoSrc]="wordmark" brandLogoFit="natural" brandAriaLabel="USM X – Start" ariaLabel="Bereiche (eingeklappt)"', '240px', 'overflow: visible; position: relative;')}
      </div>`,
  }),
};

/** 3.50 (usm-x row 76): a cut label with a kit tooltip shows its full text in the tooltip. */
export const CutLabelWithTooltip: Story = {
  name: 'Cut Label With Tooltip',
  parameters: {
    docs: {
      description: {
        story:
          '3.50 (usm-x row 76): a label cut by its ellipsis shows its full text. On a row with a kit `tooltip` (and a `disabledReason`) the tooltip reads „{label} · {tooltip}“ while the label is cut, checked when the pointer enters the row or the row takes the keyboard focus („Rechnungsfreigabe Kostenstelle 4711 · Wird im Rich Client bearbeitet“); a row without a tooltip keeps the `title` with the full label (3.47); a label that fits shows the tooltip alone. 240 px wide, German labels. 3.51 (backlog 071-n8): the row\'s description is the tooltip text alone („Wird im Rich Client bearbeitet“, the tooltip\'s `tooltipDescription`), so the label is heard once.',
      },
    },
  },
  render: () => ({
    props: {
      status: '',
      items: [
        { id: 'fit', icon: 'home', label: 'Übersicht', route: '/start', tooltip: 'Startseite des Bereichs', displayOrder: 1 },
        { id: 'cut-tip', icon: 'file', label: 'Rechnungsfreigabe Kostenstelle 4711', route: '/rechnungsfreigabe', tooltip: 'Wird im Rich Client bearbeitet', displayOrder: 2 },
        { id: 'cut-reason', icon: 'file', label: 'Lieferantenstammdatenpflege Nord', route: '/lieferanten', disabled: true, disabledReason: 'Kein Recht für diesen Bereich', displayOrder: 3 },
        { id: 'cut-plain', icon: 'file', label: 'Rechnungseingangsprüfung Lieferanten', route: '/eingang', displayOrder: 4 },
      ],
    },
    template: `
      <div lang="de" style="display: flex; height: 400px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
        <lc-sidenav [isOpen]="true" mode="docked" width="240px" [items]="items" activeRoute="/start" ariaLabel="Bereiche" closeAriaLabel="Navigation schließen" />
        <div style="flex: 1; padding: 24px; color: var(--color-text-secondary);">Lieferanten</div>
      </div>`,
  }),
};

/** An entry of a rail group's menu: no icon there (`icon: ''`). */
const groupEntry = (id: string, label: string, route: string, displayOrder: number, extra: Partial<NavigationItem> = {}): NavigationItem => ({
  id,
  icon: '',
  label,
  route,
  displayOrder,
  ...extra,
});

/** The rail of the group-menu stories (3.51, backlog 071-n1): „Übersicht“, two groups and „System“ (German). */
const GROUP_RAIL_DE: NavigationItem[] = [
  { id: 'gm-start', icon: 'home', label: 'Übersicht', route: '/start', displayOrder: 1 },
  {
    id: 'gm-stamm', icon: 'folder', label: 'Stammdaten', route: '', displayOrder: 2,
    children: [
      groupEntry('gm-objekte', 'Objekte', '', 1, {
        children: [groupEntry('gm-objekttypen', 'Objekttypen', '/stamm/objekttypen', 1), groupEntry('gm-felder', 'Felder', '/stamm/felder', 2)],
      }),
      groupEntry('gm-zaehler', 'Zähler', '/stamm/zaehler', 2, { busy: true }),
      groupEntry('gm-pruefungen', 'Prüfungen', '/stamm/pruefungen', 3, { badge: { value: 12, variant: 'warning' } }),
      groupEntry('gm-archiv', 'Archiv', '/stamm/archiv', 4, { disabled: true, disabledReason: 'Kein Recht für diesen Bereich' }),
    ],
  },
  {
    id: 'gm-pruef', icon: 'check-circle', label: 'Prüfungen', route: '', displayOrder: 3,
    children: [groupEntry('gm-regeln', 'Prüfregeln', '/pruef/regeln', 1), groupEntry('gm-laeufe', 'Prüfläufe', '/pruef/laeufe', 2)],
  },
  { id: 'gm-system', icon: 'settings', label: 'System', route: '/system', displayOrder: 4 },
];

/** The same rail in English (the RTL story). */
const GROUP_RAIL_EN: NavigationItem[] = [
  { id: 'gm-start', icon: 'home', label: 'Overview', route: '/start', displayOrder: 1 },
  {
    id: 'gm-stamm', icon: 'folder', label: 'Master data', route: '', displayOrder: 2,
    children: [
      groupEntry('gm-objekte', 'Objects', '', 1, {
        children: [groupEntry('gm-objekttypen', 'Object types', '/stamm/objekttypen', 1), groupEntry('gm-felder', 'Fields', '/stamm/felder', 2)],
      }),
      groupEntry('gm-zaehler', 'Counters', '/stamm/zaehler', 2, { busy: true }),
      groupEntry('gm-pruefungen', 'Checks', '/stamm/pruefungen', 3, { badge: { value: 12, variant: 'warning' } }),
      groupEntry('gm-archiv', 'Archive', '/stamm/archiv', 4, { disabled: true, disabledReason: 'No access to this area' }),
    ],
  },
  {
    id: 'gm-pruef', icon: 'check-circle', label: 'Checks', route: '', displayOrder: 3,
    children: [groupEntry('gm-regeln', 'Check rules', '/pruef/regeln', 1), groupEntry('gm-laeufe', 'Check runs', '/pruef/laeufe', 2)],
  },
  { id: 'gm-system', icon: 'settings', label: 'System', route: '/system', displayOrder: 4 },
];

/** 3.51 (request 072, backlog 071-n1): the rail's own group menu (`railGroupMenu`). */
@Component({
  selector: 'lc-sidenav-rail-group-menu-demo',
  standalone: true,
  imports: [SidenavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (rtl()) {
      <div lang="en" dir="rtl">
        <p role="status" style="margin: 0 0 12px; color: var(--color-text-secondary);">Last choice: {{ last() }}</p>
        <div style="display: flex; height: 560px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
          <lc-sidenav [isOpen]="true" mode="docked" position="right" width="280px" [(collapsed)]="collapsed" [items]="itemsEn" [railItems]="railEn" [railGroupMenu]="true"
                      activeRoute="/stamm/objekttypen" ariaLabel="Areas" brandName="USM X" brandSubtitle="Customizing" brandLetter="X" [showCollapseToggle]="true"
                      collapseAriaLabel="Collapse navigation to the right" busyLabel="Loading" childrenLoadingLabel="Loading …" (itemClicked)="last.set($event.label)" />
          <div style="flex: 1; padding: 24px; color: var(--color-text-secondary);">Object types</div>
        </div>
      </div>
    } @else {
      <div lang="de">
        <p role="status" style="margin: 0 0 12px; color: var(--color-text-secondary);">Letzte Auswahl: {{ last() }}</p>
        <div style="display: flex; height: 560px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
          <lc-sidenav [isOpen]="true" mode="docked" width="280px" [(collapsed)]="collapsed" [items]="items" [railItems]="rail" [railGroupMenu]="true"
                      activeRoute="/stamm/objekttypen" ariaLabel="Bereiche" brandName="USM X" brandSubtitle="Customizing" brandLetter="X" [showCollapseToggle]="true"
                      collapseAriaLabel="Navigation nach links einklappen" expandAriaLabel="Navigation ausklappen" closeAriaLabel="Navigation schließen"
                      busyLabel="Wird geladen" childrenLoadingLabel="Wird geladen …" (itemClicked)="last.set($event.label)" />
          <div style="flex: 1; padding: 24px; color: var(--color-text-secondary);">Objekttypen</div>
        </div>
      </div>
    }
  `,
})
class SidenavRailGroupMenuDemoComponent {
  readonly rtl = input(false);
  protected readonly items = USMX_ITEMS;
  protected readonly rail = GROUP_RAIL_DE;
  protected readonly itemsEn = USMX_ITEMS;
  protected readonly railEn = GROUP_RAIL_EN;
  protected readonly collapsed = signal(true);
  protected readonly last = signal('–');
}

/** Opens the first rail group's menu (the shot shows it open; in the story view only). */
const openFirstRailGroup = async ({ canvasElement, viewMode }: { canvasElement: HTMLElement; viewMode?: string }) => {
  if (viewMode !== 'story') return;
  await new Promise((resolve) => setTimeout(resolve, 100));
  canvasElement.querySelector<HTMLButtonElement>('.lc-sidenav__nav-item--rail-group')?.click();
  await new Promise((resolve) => setTimeout(resolve, 300));
};

/** 3.51 (request 072, backlog 071-n1): a rail group opens its children in a menu beside the rail. */
export const RailGroupMenu: Story = {
  name: 'Rail Group Menu',
  parameters: {
    docs: {
      description: {
        story:
          '3.51 (request 072, backlog 071-n1): `railGroupMenu` on the docked, collapsed rail: „Stammdaten“ and „Prüfungen“ are `railItems` entries with `children`, so they are menu buttons (`aria-haspopup="menu"`, `aria-expanded`). A press, Enter, Space or ArrowRight opens the children in an `lc-menu` beside the rail, 8 px outside its edge and level with the item (anchored to a hidden box over the rail\'s border box), named „Stammdaten“, at most `--lc-sidenav-rail-menu-max-width` (20rem) wide. The map keeps the nested group („Objekte“ as a section), the current link („Objekttypen“ by `activeRoute`; the rail item gets `aria-current="true"` and the current look), busy („Zähler“), the warning badge („Prüfungen“ 12) and the disabled entry with its reason („Archiv“). A link entry navigates with the router and emits `itemClicked` (the line above shows it); Escape closes and returns the focus to the rail item. The story opens „Stammdaten“. At 360 px the open drawer shows `items`.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [SidenavRailGroupMenuDemoComponent] },
    template: `<lc-sidenav-rail-group-menu-demo />`,
  }),
  play: openFirstRailGroup,
};

/** 3.51 (request 072, backlog 071-n1): the rail on the right opens its menus to the left. */
export const RailGroupMenuRtl: Story = {
  name: 'Rail Group Menu RTL',
  parameters: {
    docs: {
      description: {
        story:
          '3.51 (request 072, backlog 071-n1): the same rail in a `dir="rtl"` page with English labels: the rail sits at the right, so the menu opens on its left (`left-start`, 8 px outside the rail\'s edge, top aligned with the item; the side follows the rail\'s place: centre in the right half of the viewport) and ArrowLeft opens it. The story opens „Master data“.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [SidenavRailGroupMenuDemoComponent] },
    template: `<lc-sidenav-rail-group-menu-demo [rtl]="true" />`,
  }),
  play: openFirstRailGroup,
};

/** An app mark drawn in the rail's ink (`currentColor`), 28 × 28 in the 32 px box. */
const BRAND_MARK_SVG =
  '<svg sidenav-brand-mark viewBox="0 0 32 32" width="28" height="28" focusable="false"><rect x="3" y="3" width="26" height="26" rx="7" fill="none" stroke="currentColor" stroke-width="3"/><path d="M10 17l4 4 8-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** A docked rail with the app mark in `[sidenav-brand-mark]`. */
const markRail = (attrs: string, frame = 'overflow: hidden;') => `
  <div style="display: flex; height: 480px; border: 1px solid var(--color-border); border-radius: 8px; ${frame} flex: 0 0 auto;">
    <lc-sidenav [isOpen]="true" mode="docked" width="240px" [mobileBreakpoint]="0" [items]="items" activeRoute="/start" brandName="USM X" brandSubtitle="Customizing" ${attrs}>
      ${BRAND_MARK_SVG}
    </lc-sidenav>
  </div>`;

/** 3.51 (request 072, backlog 071-n2): the app's own mark in the brand. */
export const BrandMarkSlot: Story = {
  name: 'Brand Mark Slot',
  parameters: {
    docs: {
      description: {
        story:
          '3.51 (request 072, backlog 071-n2): `[sidenav-brand-mark]` puts the app\'s mark (here an inline SVG in `currentColor`, so it follows the rail\'s ink) in place of the tile, centred in 32 × 32 px, in every state: expanded on the light and the dark rail, collapsed with `brandToggle` (the brand stays a 44 px button with its ring and tooltip), and beside a `brandLogoSrc` (the mark wins). The mark is decorative (its box is `aria-hidden`): the brand keeps `brandName` as its name. It is in the prerendered HTML. Without content nothing changes.',
      },
    },
  },
  render: () => ({
    props: { items: USMX_ITEMS, square: SQUARE_MARK },
    template: `
      <div lang="de" style="display: flex; flex-wrap: wrap; gap: 24px;">
        ${markRail('theme="light" ariaLabel="Bereiche (hell)"')}
        ${markRail('theme="dark" ariaLabel="Bereiche (dunkel)"')}
        ${markRail('[collapsed]="true" [brandToggle]="true" collapseAriaLabel="Navigation nach links einklappen" expandAriaLabel="Navigation ausklappen" ariaLabel="Bereiche (eingeklappt)"', 'overflow: visible; position: relative;')}
        ${markRail('[brandLogoSrc]="square" ariaLabel="Bereiche (mit Logo)"')}
      </div>`,
  }),
};

/** The template's three rail entries (initials; the name starts with them, WCAG 2.5.3). */
const RAIL_TEMPLATE_ENTRIES = [
  { id: 'em', initials: 'EM', label: 'Einkauf München', name: 'EM, Einkauf München' },
  { id: 'fb', initials: 'FB', label: 'Finanzbuchhaltung', name: 'FB, Finanzbuchhaltung' },
  { id: 'neu', initials: '+', label: 'Bereich hinzufügen', name: 'Bereich hinzufügen' },
];

/** 3.51 (request 072, backlog 071-n5): an app template draws the collapsed rail. */
export const RailTemplate: Story = {
  name: 'Rail Template',
  parameters: {
    docs: {
      description: {
        story:
          '3.51 (request 072, backlog 071-n5): an `ng-template lcSidenavRail` draws the docked, collapsed rail\'s navigation instead of `railItems` (set here too: the template wins), inside the rail\'s `<nav>` „Bereiche“. Three app buttons carry `lc-sidenav__rail-item`: 44 × 44, centred on the brand and collapse column (x 22.5), 2 px apart, the rail\'s ink, hover fill, focus ring, the current look on „Einkauf München“ (`aria-current="page"`) and the label tooltip from `data-tooltip`. Their names start with the visible initials („EM, Einkauf München“, WCAG 2.5.3). The template gets the rail\'s entries, its current entry and the rail width (`let-railWidth`, the line beside the rail). Expanded and in the drawer (360 px) the `items` show as before.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [SidenavRailDirective] },
    props: { items: USMX_ITEMS, rail: USMX_RAIL, entries: RAIL_TEMPLATE_ENTRIES },
    template: `
      <div lang="de" style="display: flex; height: 480px; border: 1px solid var(--color-border); border-radius: 8px; overflow: visible;">
        <lc-sidenav [isOpen]="true" mode="docked" width="280px" [collapsed]="true" [items]="items" [railItems]="rail" activeRoute="/start" ariaLabel="Bereiche"
                    brandName="USM X" brandSubtitle="Customizing" brandLetter="X" [showCollapseToggle]="true" expandAriaLabel="Navigation ausklappen" closeAriaLabel="Navigation schließen">
          <ng-template lcSidenavRail let-railWidth="railWidth">
            @for (entry of entries; track entry.id) {
              <button type="button" class="lc-sidenav__rail-item" [attr.aria-label]="entry.name" [attr.data-tooltip]="entry.label" [attr.aria-current]="entry.id === 'em' ? 'page' : null">{{ entry.initials }}</button>
            }
            <p style="position: absolute; inset-inline-start: calc(100% + 16px); inset-block-end: 16px; margin: 0; white-space: nowrap; color: var(--color-text-secondary); font-size: var(--font-size-sm);">Schienenbreite: {{ railWidth }} px</p>
          </ng-template>
        </lc-sidenav>
        <div style="flex: 1; padding: 24px; color: var(--color-text-secondary);">Einkauf München</div>
      </div>`,
  }),
};
