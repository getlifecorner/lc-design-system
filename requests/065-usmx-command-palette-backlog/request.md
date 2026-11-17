# Request 065: USM X fourth batch (command palette, menu, popover, timeline, avatar, search, sortable head) and the whole backlog

- **From:** bundle (usm-x, owner)
- **Received:** 2026-11-17
- **Gap IDs:** usm-x 2026-11-17 rows 31–37; backlog 054-n2, 057-n2, 057-n4, 057-n6, 058-n1, 058-n3, 059-n1, 060-n1, 060-n2, 060-n3, 060-n5, 062-n1, 061-n3, 063-n1, 064-n1, 064-n2, 064-n3, 063-n2, 064-n4, 064-n5, 064-n6, 064-n7, 064-n8, 064-n9
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/tmp/lc-request/bundles/20261117-220510.md (the bundle); /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/BACKLOG.md (details of item 2); requester directory /Users/eric/Documents/Projekte/usm/usm-x
- **Kit version at intake:** 3.44.0

## Requirement (verbatim)

# Bundle of 2 collected requirements

Started by the owner on 2026-11-17 22:05: one request and one version for all items. Each item keeps its requester (from:), its directory (dir:) and its date.

## Item 1 (20261117-194412-1096)

from: usm-x
dir: /Users/eric/Documents/Projekte/usm/usm-x
date: 2026-11-17 19:44

# Kit requests from USM X, fourth batch (2026-11-17)

From usm-x on 3.42.0, after building a catalog quick search with sorting and column choice, a command palette with a server search, a history timeline and relation info cards.

| #   | Component | Gap | Needed | Meanwhile |
| --- | --------- | --- | ------ | --------- |
| 31  | `lc-menu` | No checkbox items, so a column choice (show/hide each column) cannot be a menu. | Checkbox (and radio) menu items. | An `lc-modal` with `lc-checkbox`es. |
| 32  | `lc-search-input` | Escape does not clear it, and there is no input for a description of what is searched. | Escape clears; a `description` input. | Handled outside; the host's `title`. |
| 33  | Table head | A table drawn by the app (not `lc-table`) has no sortable header part with `aria-sort` and the kit's arrows. | A sortable header cell/directive usable outside `lc-table`. | `lc-table`'s look copied. |
| 34  | Command palette | The kit has no command palette (⌘K: grouped sources, async groups, keyboard over groups). | An `lc-command-palette`. | Our own on `lc-modal` + `lc-search-input`. |
| 35  | `lc-popover` | Opens on click or hover only: no focus trigger, no open delay, no long press, no programmatic open; the panel is always centred on the trigger. | Focus/long-press triggers, a delay, `open()` and placement. | Our own floating panel in its look. |
| 36  | `lc-timeline` | No item click, selection or focusable items; `title` is required, so an entry without text needs a placeholder. | Selectable, focusable items with an item event; optional title. | Clicks resolved by index, keys on the body. |
| 37  | `lc-avatar` | No hook for an app's identity colours, and its initials rule differs from other places. | A colour input/hook and one initials rule. | The chip's own disc reused. |

## Item 2 (20261117-220507-backlog-all)

from: owner
dir: /Users/eric/Documents/Projekte/life-cockpit/lc-design-system
date: 2026-11-17 22:05

All 24 rows of requests/BACKLOG.md (as of 2026-11-17 22:05): 054-n2, 057-n2, 057-n4, 057-n6, 058-n1, 058-n3, 059-n1, 060-n1, 060-n2, 060-n3, 060-n5, 062-n1, 061-n3, 063-n1, 064-n1, 064-n2, 064-n3, 063-n2, 064-n4, 064-n5, 064-n6, 064-n7, 064-n8, 064-n9. Owner decision 2026-11-17: everything in one version together with the usm-x fourth batch (rows 31-37); the about-8-items bundle limit does not apply, so do not split the bundle or return anything to the inbox. 054-n2 stays in the backlog if WebKit cannot check it here. Details per row in requests/BACKLOG.md.
