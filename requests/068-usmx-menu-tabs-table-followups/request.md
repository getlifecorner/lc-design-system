# Request 068: USM X menu, tabs, palette and form gaps, lc-table hidden actions head, 067 follow-ups, all backlog rows

- **From:** bundle (usm-x, finance-intelligence, owner)
- **Received:** 2026-11-18 (bundle `tmp/lc-request/bundles/20261118-182805.md`, started by the owner 2026-11-18 18:28)
- **Gap IDs:** usm-x 2026-11-17 rows 47–70; kosten-prove-2026-11-18 row 7; 067-s1, 067-s2, 067-s3; backlog 054-n2, 066-n1, 067-n1, 067-n2, 067-n3, 067-n4, 067-n5
- **Referenced files:** /Users/eric/Documents/Projekte/usm/usm-x/frontend/kit-gaps/2026-11-17-lifecorner-kit.md (rows 47–70); /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/kosten-prove-2026-11-18.md (row 7); requests/067-number-waterfall-usmx-sidenav/release.md (Open items); requests/BACKLOG.md
- **Kit version at intake:** 3.47.0

## Requirement (verbatim)

Owner note in the bundle (item 6): everything in this bundle ships as one version. The about-8-items bundle limit does not apply, so do not split the bundle or return anything to the inbox. 054-n2 stays in the backlog if WebKit cannot check it here.

### Item 1 (20261118-144008-93675)

- **From:** usm-x (`/Users/eric/Documents/Projekte/usm/usm-x/frontend`), 2026-11-18 14:40
- **File:** /Users/eric/Documents/Projekte/usm/usm-x/frontend/kit-gaps/2026-11-17-lifecorner-kit.md

Rows 47-67 only (rows 1-37 are closed; 38-46 are already in request 067). Found adopting kit 3.45 across lc-command-palette, lc-tabs, lc-menu, the sortable head, lc-textarea, lc-search-input, lc-split-button, lc-popover, lc-avatar, AvatarGroupItem and lc-datepicker in the USM X client. Each row says what is missing, what the client needs and what it does meanwhile.

### Item 2 (20261118-144326-97290)

- **From:** usm-x (`/Users/eric/Documents/Projekte/usm/usm-x/frontend`), 2026-11-18 14:43
- **File:** same as item 1

Rows 68-69 only, in addition to the usm-x item collected just before (rows 47-67): MenuItem leading swatch / a control row inside lc-menu, and an lc-tab label template.

### Item 3 (20261118-155327-58093)

- **From:** usm-x (`/Users/eric/Documents/Projekte/usm/usm-x/frontend`), 2026-11-18 15:53
- **File:** same as item 1

Row 70 only, in addition to the usm-x items collected before (rows 47-69): lc-button with ariaPressed has no pressed look.

#### Rows 47–70 of the usm-x file (copied verbatim)

| #   | Component | Gap | Needed | Meanwhile |
| --- | --------- | --- | ------ | --------- |
| 47  | `lc-command-palette` | No way to set the active option (an `activeId` model). After a `keepOpen` item, the app cannot put the cursor on the line that arrived in its place. | An `activeId` input/model. | The first line that arrives takes over the chosen line's id. |
| 48  | `CommandPaletteItem` | No count or badge slot: a navigation entry's count ("56/60", as the rail shows it) has nowhere to go. | A `badge` (or `count`) on the item, drawn at the line's end. | The count is text at the front of `hint`. |
| 49  | `lc-tabs` | The tab list takes no accessible name ("Facetten", "Was aufgenommen wird"). | An `ariaLabel` input for the list. | Set on the drawn list after render. |
| 50  | `lc-tab` | No `title` or `disabledReason`, and no muted state for a tab whose editor lives elsewhere. Such a tab still names the place, so it is not disabled. | `title`, `disabledReason` and a `muted` (quiet ink) state. | Title set after render, plus a global class for the ink. |
| 51  | `lc-tab` (links mode) | No `replaceUrl` and no other router extras. A tool's tabs should replace the address, so the browser's way back leaves the tool instead of walking back through its tabs. | `replaceUrl` (or a `navigationExtras` input). | A plain click is caught in the capture phase and navigated with `replaceUrl`; a click with a modifier stays the browser's. |
| 52  | `lc-tabs` (panels) | No hook for the panel padding or the gap between list and panel. A pane that is a card of its own wants it flush. | `--lc-tabs-panel-padding` and a gap hook. | A global `lc-tabs.usmx-tabs--flush` rule. |
| 53  | `lc-menu` | It opens only against its projected trigger, as an absolute panel inside its own box. There is no x/y or anchor input, no overlay layer that escapes a scrolling container, and no flip at the screen edge. A row's context menu belongs at the pointer, and a menu in a scrolling rail gets clipped. | Open at a point or an element (`openAt(x, y)` / an anchor input), in an overlay with flip and shift. | The catalog places an empty trigger at the pointer. The rail's menu (`.sbmenu`) stays ours. |
| 54  | `lc-menu` | No height cap and no scroll hook. A menu of about 26 entries ("Weitere" on a ticket) runs off the screen. | A `maxHeight` input or `--lc-menu-max-height`, with the panel scrolling inside. | `::ng-deep` caps on the panel: `min(56vh, 420px)` in `catalog-grid.scss` and `min(55vh, 480px)` in `view-form.scss`. These are the only `::ng-deep` in the client. |
| 55  | `lc-menu` | Focus is placed only at the moment it opens: items that arrive later get no tab stop, and there is no loading state. A menu of a row's actions has to ask the server first. | A `loading` state, with focus moving to the first item when items arrive. | The menu opens only once the actions are read. |
| 56  | `MenuItem` | No tooltip and no `disabledReason`, and a disabled item takes no pointer at all, so the reason for a refused entry cannot be shown on hover. | `tooltip` / `disabledReason`, shown on hover and focus of a disabled item. | The reason ("Öffnet … im Rich Client") is the item's subtitle. |
| 57  | `lc-menu` (sections) | `dividerAfter` is ignored between members of one section, and no item can be emphasised. USM's break inside a group and its bold default member are lost. | Dividers inside a section; an `emphasis` (bold) flag on `MenuItem`. | The break is left out; the default member is not marked. |
| 58  | `lc-menu` | The panel takes no accessible name ("Was diese Liste anbietet"). | An `ariaLabel` input for the `role="menu"` panel. | Unnamed. |
| 59  | `lc-menu` | Escape is consumed with `stopPropagation` but not `preventDefault` (as in row 22 for `lc-modal`). A listener on the document cannot tell it was used, and a form behind it closes. | `preventDefault` on every key the menu handles. | The grid and the form mark the key themselves, and check for an open `[role="menu"]` inside them. |
| 60  | Sortable head (`th[lcSortableHead]`) | Brings its own padding and `border-bottom` with no hook for either, so a table that draws its own head rule (sticky, as a shadow) gets two. It has no busy state while a sort asks the server. | Padding and border hooks; a `busy` input (`aria-busy`, a quiet indicator). | Padding and border overridden; a `th--busy` progress cursor. |
| 61  | `lc-textarea` | Reads `--line-height-base`, which the kit's theme never defines, and has no padding or height hook. A one-row field cannot be matched to a 36 px button beside it. | Define `--line-height-base` in the theme; padding/min-height hooks. | Set in the assistant's stylesheet. |
| 62  | `lc-search-input` | With the 300 ms debounce, typing, Enter and then Escape inside the debounce can swallow the `''`. The field is empty while the search stays applied. An edge case. | A clear (× or Escape) emits at once and cancels the pending debounced value. | Accepted. |
| 63  | `lc-split-button` | The face takes no `accessKey` / `ariaKeyShortcuts`, it has no `tone` (a group's face is a neutral outline beside brand-outline single buttons), and it does not pass `size` / `minWidth` / `maxWidth` to its menu (md beside our sm menus). | Those inputs, passed through to the face and the menu. | A directive sets the access key on the face after render; tone and menu size accepted. |
| 64  | `lc-popover` | The `longpress` trigger makes the panel a dialog and announces the trigger as "has popup dialog". That is wrong where the trigger's own click opens something else (a relation chip opens the object) and the long press only shows a card. | A long-press trigger that keeps the panel's role (tooltip or description). | Our own long-press timer calls `open()`. |
| 65  | `lc-avatar` | Round only. A thing (a ticket, a CI) wears a rounded square with its key letters, beside the round person avatar. | A `shape="square"` (rounded) option. | Things keep our own square. |
| 66  | `AvatarGroupItem` | Only the six member colours: the identity colours `lc-avatar` takes since 3.45 (`--lc-avatar-bg`) cannot be given per item, so presence cannot wear the same tone as the person's chip. | A per-item colour (or CSS variable) on `AvatarGroupItem`. | The presence group is unchanged. |
| 67  | `lc-datepicker` | No time of day, and it holds a `Date` rather than the text the backend validates. Date, time and date-time fields of a dialog cannot use it. | A time (and date-time) mode, and a text value mode like `lc-number-input`'s (row 13). | Those fields stay native inputs in the kit's look. |
| 68  | `MenuItem` | An item can lead only with a glyph (`icon`), and the menu takes no control between its items. An account menu's appearance choice shows each theme as a two-colour swatch, and its density is a segmented choice of three. Since 3.45 the rest of it fits `lc-menu`: the identity in `[header]`, the appearance as radio items in a section, and the switches as checkbox items. | A leading template or colour swatch per item (`leading`/`swatch`), or a projected control row inside the item list. | The account menu stays our own panel in the menu's look, with `lc-toggle-group` for the density. |
| 69  | `lc-tab` | A tab is a label plus one badge. A tab that names a part of a status model also says its size and its hits ("Ticket · 12 Status · 3 Treffer"), so the facet's part tabs cannot be `lc-tab`. | A label template (`lcTabLabel`), or a second quiet text beside the badge. | Our own `role="tab"` buttons in the tabs' look. |
| 70  | `lc-button` | `ariaPressed` (3.42) sets the state but draws nothing for it: a toggle that is on looks like one that is off, apart from the tone the app switches itself. A mode switch in a list's head ("Master/detail view") cannot be told on at a glance. | A pressed look for `aria-pressed="true"` - the brand's tint behind the outline, or a `pressed` style hook. | Our own tint through `--lc-button-outline-bg` and a check glyph before the label. |

### Item 4 (20261118-162137-86202)

- **From:** finance-intelligence (`/Users/eric/Documents/Projekte/usm/finance-intelligence`), 2026-11-18 16:21
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/kosten-prove-2026-11-18.md

row 7 (kosten-prove-2026-11-18): lc-table has no way to keep the actions column head for screen readers only (showActionsLabel=false like showCaption)

#### Row 7 of the finance-intelligence file (copied verbatim)

| # | Component | Gap | Proposal | Accepted when | Our transition until the release |
| --- | --- | --- | --- | --- | --- |
| 7   | `lc-table` | A named head for the actions column without visible text. `actionsLabel` is either visible in the head or empty; an empty head has no name for screen readers. Our lists of open rows carry one button per row („Erklären“, „Als einmalig kennzeichnen“, „Zurückziehen“), so a visible „Aktionen“ repeats what the buttons say and takes a column's width. | An optional input `showActionsLabel: boolean` (default `true`), like `showCaption`: with `false` the head keeps `actionsLabel` as its accessible name but shows no text (visually hidden). Without the input nothing changes. | With `actionsLabel="Aktionen"` and `showActionsLabel="false"` the head shows no text, has the accessible name „Aktionen“ and keeps its width from `actionsWidth`; sorting, the other heads and the row actions are unchanged; axe passes (no empty table header); story with German texts. | The head stays empty, as on Services, Regeln and Benutzer; every action keeps its name per row (`TableAction.ariaLabel`). After the release the head gets „Aktionen“ with `showActionsLabel="false"`, no new design. |

### Item 5 (20261118-162912-067-follow-ups)

- **From:** owner, 2026-11-18 16:29

Follow-ups 067-s1, 067-s2, 067-s3 of request 067: lc-sidenav row actions are invisible on touch (`hover: none`) at every level while their 44 × 44 box still answers taps; lc-number-input with `locale="de-DE"` misreads the grouping point (typed „2.960,00“ becomes 2,96, „1.234“ becomes 1,234), which hits the euro amount of kosten row 5; sidenav stories hard-code content box colours (`#f9fafb`, `#666`, `#333`), so *With Groups And Actions* in dark has a heading at 1.04:1 (axe `color-contrast`); details in requests/067-number-waterfall-usmx-sidenav/release.md Open items.

### Item 6 (20261118-182803-backlog-all)

- **From:** owner, 2026-11-18

All 7 rows of requests/BACKLOG.md (as of 2026-11-18): 054-n2, 066-n1, 067-n1, 067-n2, 067-n3, 067-n4, 067-n5. Owner decision 2026-11-18: everything in this bundle ships as one version: the usm-x rows 47-70, finance-intelligence row 7, the 067 follow-ups 067-s1..s3 and these backlog rows. The about-8-items bundle limit does not apply, so do not split the bundle or return anything to the inbox. 054-n2 stays in the backlog if WebKit cannot check it here. Details per row in requests/BACKLOG.md.
