# Request 064: USM X frame rows (header, tabs, sidenav, page-header, card, list), lc-search-input combobox, lc-modal keys and top placement, lc-stat-trend, lc-button outline tint, row shape and access keys, lc-badge icon, split button

- **From:** bundle (usm-x)
- **Received:** 2026-11-17
- **Gap IDs:** usm-x 2026-11-17 rows 4, 11, 14, 16, 17, 20 (first batch, returned to the inbox by 063); rows 21–25 (second batch); rows 26–30 (third batch)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/062-checkbox-select-usmx-gaps/request.md (Item 3, rows 4, 11, 14, 16, 17, 20; copied verbatim below); /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/063-usmx-gaps-lazy-tree-chart/spec.md (scope split); bundle file /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/tmp/lc-request/bundles/20261117-154805.md; requester directory /Users/eric/Documents/Projekte/usm/usm-x
- **Kit version at intake:** 3.43.0

## Requirement (verbatim)

Started by the owner on 2026-11-17 15:48: one request and one version for all items. Each item keeps its requester (from:), its directory (dir:) and its date.

## Item 1 (20261117-103144-usmx-frame-rows)

from: usm-x
dir: /Users/eric/Documents/Projekte/usm/usm-x
date: 2026-11-17 10:31
file: /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/062-checkbox-select-usmx-gaps/request.md

usm-x frame rows 4, 11, 14, 16, 17, 20 (usm-x 2026-11-17): lc-header (row 4), lc-tabs (row 11), lc-sidenav (row 14), lc-page-header (row 16), lc-card (row 17), lc-list (row 20). Rows unchanged in Item 3 of requests/062-checkbox-select-usmx-gaps/request.md (same row numbers, also copied verbatim into requests/063-usmx-gaps-lazy-tree-chart/request.md); returned to the inbox by the spec of request 063 (scope split: requests/063-usmx-gaps-lazy-tree-chart/spec.md).

## Item 2 (20261117-140333-75478)

from: usm-x
dir: /Users/eric/Documents/Projekte/usm/usm-x
date: 2026-11-17 14:03

# Kit requests from USM X, second batch (2026-11-17)

From usm-x, after building a command palette, a start page with figures and keyboard work in lists on `@lifecorner/angular-ui-kit` 3.41. Adds to the first batch collected earlier today (rows 1-20 there).

| #   | Component | Gap | Needed | Meanwhile |
| --- | --------- | --- | ------ | --------- |
| 21  | `lc-search-input` | No combobox semantics (`role`, `aria-expanded`, `aria-controls`, `aria-activedescendant`), so it cannot be the field of a command palette or an autocomplete without setting them on its inner input after render. | Combobox inputs forwarded to the inner input. | Set after render. |
| 22  | `lc-modal` | Escape is stopped but not marked handled (`preventDefault`), so listeners on the page cannot tell it was used; Enter on its own × still reaches the page (a form's default action behind it); there is no top-anchored placement, so a palette re-centres as its results grow. | `preventDefault` on handled keys, Enter contained, a `placement="top"`. | The palette catches Enter and Escape itself and fixes its body height. |
| 23  | `lc-stat-trend` | Renders an empty header row when it has neither label nor icon. | No header without content. | Accepted. |
| 24  | `lc-card` (clickable) | The title cannot be kept to one line, and the heading sits inside `role="button"`, so it is lost as a heading. | A one-line title option; the heading outside the button role (e.g. a stretched link). | Accepted. |
| 25  | `lc-page-header` | No way to let the title wrap its `title-suffix` before the actions wrap; marks have to move between `title-suffix` and `meta` in code (adds to 16). | A wrap-order hook. | A ResizeObserver moves the marks. |

## Item 3 (20261117-144134-726)

from: usm-x
dir: /Users/eric/Documents/Projekte/usm/usm-x
date: 2026-11-17 14:41

# Kit requests from USM X, third batch (2026-11-17)

From usm-x, after adopting 3.42.0 (thank you for rows 1, 2, 3, 5, 9, 10, 15). Found while turning toggles and menu triggers into `lc-button` and violet marks into `lc-badge`.

| #   | Component | Gap | Needed | Meanwhile |
| --- | --------- | --- | ------ | --------- |
| 26  | `lc-button` (outline) | The outline variant paints a literal `background-color: #84c7d40f`, a petrol tint not taken from tokens, so a scoped accent (our violet customizing area) or a customer theme cannot reach the outline's ground or its pressed tone. | The tint from `--color-primary-*` (or a hook). | Accepted. |
| 27  | `lc-button` | No bare or row shape: the radius is always full, so a button used as a row body draws a pill focus ring; padding, border and hover have to be suppressed from outside. | A `shape="row"` (or radius hook). | Overridden from outside on one row type. |
| 28  | `lc-badge` | No `icon` input and no gap hook (unlike `lc-chip`): an icon plus text inside sits flush. | `icon` input or a gap hook. | A wrapper span with a gap. |
| 29  | `lc-button` | No `accessKey` / `ariaKeyShortcuts` inputs, and attributes on the host never reach the inner button, so a backend-defined access key (USM's `&` letters) cannot be carried. | Both inputs forwarded. | Set after render, or the button stays native. |
| 30  | Split button | No split button (a face plus a menu caret in one outline), which a group of actions with a default needs. | A split-button component or an `lc-button` group mode. | Our own markup in the kit's sm geometry. |

## Referenced rows (verbatim from requests/062-checkbox-select-usmx-gaps/request.md, Item 3)

| #   | Component | Gap | Needed | Meanwhile |
| --- | --------- | --- | ------ | --------- |
| 4   | `lc-header` | `--lc-header-bg`, `--lc-header-fg` and the other documented hooks are declared on the inner `.lc-header` element itself, so a value set on any ancestor (`:root`, the app shell) never wins; the header also paints `background-color`, which cannot take a gradient. Its sticky layer has `z-index: 1000`, above `lc-modal`'s backdrop (`999`), so an open modal leaves the header bright and clickable above the veil. It also has no slot between the brand and the end group (for app content such as a row of open-window tabs or a search field), its account menu takes no entries from the caller (a choice group, switches), and its brand is always a link home. | Declare the hook defaults with `:where()` or on `:host` so an ancestor can set them; paint `background`; put the header below the modal layer. | The client draws its own top row. |
| 11  | `lc-tabs` | The selected tab is the component's own state and its panes are its children (lazily rendered, which is fine); there is no mode in which the tab strip is the navigation for content rendered elsewhere - the router outlet, with the open tab in the URL (`?tab=`), so that a reload or a shared link lands on the same tab. | A tab-list-only mode: tabs with `routerLink` (or an `href`) and `aria-controls` pointing at external content, the current one set by the app. | Router-link facet bars drawn like the kit's tabs. |
| 14  | `lc-sidenav` | Items are router links only (`route` is required, the current item is found by route), so a navigation whose entries *start an action* - open a window through a workflow - cannot use it. There is no busy state for an entry whose action is running, no children loaded on demand (an expand event with a loading state), no disabled item that stays in place with its reason, and no right-aligned hint text beside the label (e.g. where an editor lives instead). Further: an item owns one route, so an area cannot be current for all the addresses it owns; sections cannot fold; icons take Tabler names only, not an image URL; the badge is one plain value (no tooltip, no way to show two numbers such as "56/60"); there is no per-item tooltip, no context-menu or long-press hook, no dimmed-but-clickable state, one level of children only, and the brand cannot take a second line or a chosen letter. | Action items (no `route`; `itemClicked` only, the app sets `current`), `busy` per item, `expandRequested` + `loading` for lazy children, `disabled` with a `reason`, a `hint` text. | Two rails built by the client to match the dark sidenav's shape (work area in petrol, customizing in violet). |
| 16  | `lc-page-header` | The overline colour is `--color-overline` with no hook of its own; the `title-suffix` slot renders *inside* the heading element, so status chips and live regions placed there (`role="status"`) become part of the heading's accessible name; `size="default"` is 24 px at every width with no title-size hook. | An overline colour hook; a slot beside the heading rather than inside it; a title-size hook. | The theme writes `--color-overline`; chips sit in `title-suffix` as documented. |
| 17  | `lc-card` | The icon tile's `brand` look is `--gradient-brand-tile` and `--shadow-brand-glow`, compiled from fixed petrol, and `subtle` hard-codes `#20849724` - a themed app keeps petrol tiles. A projected `[card-header]` draws its rule in `--color-divider`, the built-in titled head in `--color-border`. The head always draws its rule and bottom margin, even on a card with no body. The collapsible head is at least 44 px with no dense variant. | Tiles derived from `--color-primary-*` (or tone hooks), one rule token, no rule without a body, a dense collapsible head. | The theme writes the two tile tokens; our own section-head rule uses the border colour. |
| 20  | `lc-list` | No per-item busy state, no item or badge tooltip, no heading items inside one list (so one list cannot flow into columns across sub-headings), no indent level. | Those four. | Our own rows in the list's look on the start page. |
