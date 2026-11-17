# Request 062: lc-checkbox contrast follow-ups, lc-select option groups, USM X kit gaps

- **From:** bundle (owner, finance-intelligence, usm-x)
- **Received:** 2026-11-17
- **Gap IDs:** 061-s1, 061-s2, 061-s3 (owner); services-prove-2026-11-15 row 1 (finance-intelligence); usm-x 2026-11-17 rows 1–20 (usm-x)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/061-checkbox-group-chip-story-contrast/release.md (Open items), /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/061-checkbox-group-chip-story-contrast/review.md (F-1 to F-3), /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/services-prove-2026-11-15.md (row 1); bundle file /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/tmp/lc-request/bundles/20261117-012300.md
- **Kit version at intake:** 3.41.0

## Requirement (verbatim)

Bundle of 3 collected requirements, started by the owner on 2026-11-17 01:23: one request and one version for all items. Each item keeps its requester (from:), its directory (dir:) and its date.

## Item 1 (20261113-142300-061-follow-ups)

from: owner
dir: /Users/eric/Documents/Projekte/life-cockpit/lc-design-system
date: 2026-11-13 14:23

Follow-ups 061-s1, 061-s2, 061-s3 of request 061: a disabled checked lc-checkbox looks unchecked in light (check mark 1.02:1, keep the fill visible when disabled); lc-chip hover inside lc-hero ignores --lc-chip-bg and drops to 1.05–1.11:1 text contrast with a custom ink (component fix); the lc-checkbox box border is 2.54:1 at rest in light and 2.24:1 in the error state in dark, under the 3:1 of WCAG 1.4.11 (lc-radio uses --color-field-border); details in requests/061-checkbox-group-chip-story-contrast/release.md Open items and review.md F-1 to F-3.

## Item 2 (20261115-142212-79083)

from: finance-intelligence
dir: /Users/eric/Documents/Projekte/usm/finance-intelligence
date: 2026-11-15 14:22
file: /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/services-prove-2026-11-15.md

row 1 (services-prove-2026-11-15): lc-select renders SelectOptionGroup without group headers in 3.41.0 although the docs promise 'Option groups with headers' (flattenOptions); documented function missing

## Item 3 (20261117-011711-85316)

from: usm-x
dir: /Users/eric/Documents/Projekte/usm/usm-x
date: 2026-11-17 01:17

# Kit requests from moving the USM X client onto the LifeCorner kit (2026-11-17)

- **From:** usm-x (a dense back-office client for an ITSM product: catalogs of 30-row pages, forms
  with six sections and thirty-odd fields, a tree navigation; Angular 21, `@lifecorner/angular-ui-kit`
  3.41.0, served under the sub-path `/usmx/`). Checked against the installed
  `fesm2022/lifecorner-angular-ui-kit-*.mjs` and `types/*.d.ts` and the `lc-design-system` MCP.
- **Found by:** replacing every hand-drawn control of the client with kit components (about 190
  buttons, 50 inputs, a dozen dialogs and menus) and then restyling the frame after the kit's business
  look (dark rail, tinted ground, outlined section cards) as the reference app finance-intelligence
  wears it.
- **Look:** none requested beyond what each row names; the kit's look is the target.
- **Status:** collected in the design system's inbox on 2026-11-17.

Each row says what is missing, where in the kit, what the client needs, and what it does until then.
Rows 1-15 were checked against the kit's source by the requester; rows 16-20 were found by the builders
while restyling the frame and are stated as they found them.

| #   | Component | Gap | Needed | Meanwhile |
| --- | --------- | --- | ------ | --------- |
| 1   | `lc-icon` | Every name outside the inline set is fetched from the absolute path `/tabler-icons/<variant>/<name>.svg` (`fesm2022/lifecorner-angular-ui-kit-icon.mjs`, the asset-path function). An app served under a sub-path (`<base href="/usmx/">`) asks the server root, gets nothing, and shows the placeholder; in production the glyph is simply broken. `LC_LOGO_BASE_PATH` exists for logos, nothing for icons. | An `LC_ICON_BASE_PATH` token (or resolving the path against `document.baseURI`), documented beside `provideLcIcons`. | Each non-inline glyph is registered with `provideLcIcons` from copied Tabler path data. |
| 2   | `lc-number-input` | The decrement button renders `<lc-icon name="minus">`, but the component registers only `ICON_PLUS`; `minus` is not in the inline set, so the button shows the placeholder in every app that does not serve `/tabler-icons/` (see 1). | Register `minus` with the component, as `plus` is. | `minus` registered app-wide. |
| 3   | `lc-button` | No `ariaPressed`, `ariaExpanded`, `ariaHasPopup`, `ariaControls` inputs, and attributes on the host do not reach the inner `<button>`. A toggle (assistant panel on/off, a column's visibility eye) or a menu trigger therefore cannot be an `lc-button` without failing WCAG 4.1.2. | Those four inputs, forwarded to the inner `<button>`. | About 30 toggles and menu triggers stay native buttons drawn to look like `lc-button`. |
| 4   | `lc-header` | `--lc-header-bg`, `--lc-header-fg` and the other documented hooks are declared on the inner `.lc-header` element itself, so a value set on any ancestor (`:root`, the app shell) never wins; the header also paints `background-color`, which cannot take a gradient. Its sticky layer has `z-index: 1000`, above `lc-modal`'s backdrop (`999`), so an open modal leaves the header bright and clickable above the veil. It also has no slot between the brand and the end group (for app content such as a row of open-window tabs or a search field), its account menu takes no entries from the caller (a choice group, switches), and its brand is always a link home. | Declare the hook defaults with `:where()` or on `:host` so an ancestor can set them; paint `background`; put the header below the modal layer. | The client draws its own top row. |
| 5   | `lc-spinner` | The smallest size (`sm`) is a 20 px circle inside a block with `padding: 1rem 0` - about 52 px tall - so it cannot sit inline in a list row, a tab or a button-sized slot. | An inline size (`xs`, 12-16 px, no padding, `display: inline-block`). | A pulsing dot drawn by the client. |
| 6   | `lc-textarea` | `min-height` is 4-7 rem by size and a footer row is always rendered, so it cannot be the one-line, auto-growing input of a chat (beside a 30 px send button, growing with the text). | `rows` (min 1) with `autoResize`, and the footer only when there is a counter or helper text. | A native textarea styled like the kit field. |
| 7   | `lc-alert` | The component sets its own `role` (`alert`/`status`); a blocking question ("close anyway?") needs `role="alertdialog"` with focus management. | A `role` input (or an `alertdialog` mode). | The question is the client's own markup in the alert's look. |
| 8   | `lc-alert` | Colour comes only from the four variants and there are no hooks (`lc-badge` and `lc-chip` have `--lc-*-bg/-fg/-border`, the alert has none), so a fifth meaning - in this client violet for "yours, being recorded" - cannot be drawn with the component. Severity scales also miss a yellow between warning and neutral. | `--lc-alert-bg/-fg/-border` hooks like the badge's; a `--color-accent-yellow` accent. | The recording state is the client's own markup in the alert's shape; a local yellow marked as a kit gap. |
| 9   | `lc-input` | `error` is a string that is always printed under the field; there is no way to mark a field invalid (border, `aria-invalid`) while the message stands elsewhere - a form that lists its missing mandatory fields once below the form. | An `invalid` boolean input separate from the message. | Mandatory fields that are empty lose their red edge; the label and the summary carry it. |
| 10  | `lc-checkbox` | Disabled is `opacity: .5` with no hook; a read-only value (a yes/no the user may not change) reads as unavailable rather than as "yes". | A `readonly` state that shows the tick at full contrast without being operable. | Read-only boxes look dimmed. |
| 11  | `lc-tabs` | The selected tab is the component's own state and its panes are its children (lazily rendered, which is fine); there is no mode in which the tab strip is the navigation for content rendered elsewhere - the router outlet, with the open tab in the URL (`?tab=`), so that a reload or a shared link lands on the same tab. | A tab-list-only mode: tabs with `routerLink` (or an `href`) and `aria-controls` pointing at external content, the current one set by the app. | Router-link facet bars drawn like the kit's tabs. |
| 12  | `lc-menu` | `MenuItem[]` is a flat list; menus with group headings ("This view", a group of actions with indented members) cannot be built. | Section headings in `MenuItem` (e.g. `isSection` with `children`, as `NavigationItem` has). | The client's own menu panels in the kit's look. |
| 13  | `lc-number-input` | The value is `number | null`. A field whose backend validates the text itself - a decimal whose scale matters (`1.50` is not `1.5`), an id longer than a double holds - cannot round-trip through it. | A string value mode that keeps what was typed (the steppers still work on it). | Native inputs styled like the kit field for decimal, date and time fields. |
| 14  | `lc-sidenav` | Items are router links only (`route` is required, the current item is found by route), so a navigation whose entries *start an action* - open a window through a workflow - cannot use it. There is no busy state for an entry whose action is running, no children loaded on demand (an expand event with a loading state), no disabled item that stays in place with its reason, and no right-aligned hint text beside the label (e.g. where an editor lives instead). Further: an item owns one route, so an area cannot be current for all the addresses it owns; sections cannot fold; icons take Tabler names only, not an image URL; the badge is one plain value (no tooltip, no way to show two numbers such as "56/60"); there is no per-item tooltip, no context-menu or long-press hook, no dimmed-but-clickable state, one level of children only, and the brand cannot take a second line or a chosen letter. | Action items (no `route`; `itemClicked` only, the app sets `current`), `busy` per item, `expandRequested` + `loading` for lazy children, `disabled` with a `reason`, a `hint` text. | Two rails built by the client to match the dark sidenav's shape (work area in petrol, customizing in violet). |
| 15  | `lc-badge` | The colour hooks exist (`--lc-badge-bg/-fg/-border`) but every variant class declares them on the inner element (`.lc-badge--primary { --lc-badge-bg: … }`), so a value set on the host or an ancestor never wins. `lc-chip` (3.40) does this right: variants set private variables and the public hooks win from any ancestor. | The chip's pattern for the badge. | Marks that need a colour of their own are `lc-chip`s. |
| 16  | `lc-page-header` | The overline colour is `--color-overline` with no hook of its own; the `title-suffix` slot renders *inside* the heading element, so status chips and live regions placed there (`role="status"`) become part of the heading's accessible name; `size="default"` is 24 px at every width with no title-size hook. | An overline colour hook; a slot beside the heading rather than inside it; a title-size hook. | The theme writes `--color-overline`; chips sit in `title-suffix` as documented. |
| 17  | `lc-card` | The icon tile's `brand` look is `--gradient-brand-tile` and `--shadow-brand-glow`, compiled from fixed petrol, and `subtle` hard-codes `#20849724` - a themed app keeps petrol tiles. A projected `[card-header]` draws its rule in `--color-divider`, the built-in titled head in `--color-border`. The head always draws its rule and bottom margin, even on a card with no body. The collapsible head is at least 44 px with no dense variant. | Tiles derived from `--color-primary-*` (or tone hooks), one rule token, no rule without a body, a dense collapsible head. | The theme writes the two tile tokens; our own section-head rule uses the border colour. |
| 18  | `lc-icon` | Sizes are 16, 20 and 24 px with no documented size property; a dense rail wants 18 px. | An 18 px size or a size hook. | 20 px; pictures from the backend are drawn as 18 px masks. |
| 19  | Theme scoping | `dark-theme-tokens` is a public mixin, so a dark panel inside a light page works; its light counterpart is private and bound to `:root.light`, so a light popover (a menu with a search field) cannot sit inside a dark scope. | A public light mixin, or theme-scope classes. | The dark scope covers only the rail's lower part, so the area menu above it stays light. |
| 20  | `lc-list` | No per-item busy state, no item or badge tooltip, no heading items inside one list (so one list cannot flow into columns across sub-headings), no indent level. | Those four. | Our own rows in the list's look on the start page. |
