# Request 072: All backlog rows — sidenav rail menu and brand slot, menu side positions and control rows, table RTL head, inline menu part names, tooltip description, WebKit focus return

- **From:** bundle (owner)
- **Received:** 2026-11-20
- **Gap IDs:** backlog 071-n1, 071-n2, 071-n3, 071-n4, 071-n5, 071-n6, 071-n7, 071-n8, 054-n2
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/BACKLOG.md; bundle /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/tmp/lc-request/bundles/20261120-224306.md
- **Kit version at intake:** 3.50.0

## Requirement (verbatim)

### Item 1 (20261120-224306-backlog-all)

from: owner
dir: /Users/eric/Documents/Projekte/life-cockpit/lc-design-system
date: 2026-11-20

All 9 rows of requests/BACKLOG.md (as of 2026-11-20): 071-n1, 071-n2, 071-n3, 071-n4, 071-n5, 071-n6, 071-n7, 071-n8, 054-n2. Owner decision 2026-11-20: everything in one version; the about-8-items bundle limit does not apply, so do not split the bundle or return anything to the inbox. 054-n2 stays in the backlog if WebKit cannot check it here. Details per row in requests/BACKLOG.md.

## Backlog rows at intake (snapshot of requests/BACKLOG.md, 2026-11-20)

| ID | Component | Finding | Source |
|---|---|---|---|
| 071-n1 | sidenav | Built-in group menu on the collapsed rail (a `railItems` group opening its children in an `lc-menu` beside the rail). Left out of 071 (usm-x row 74, minimum scope): needs a NavigationItem → MenuItem map and routing; 071 gives `railItemClick` with the element, a point `anchor` and `returnFocusTo`. | 071 design §1 |
| 071-n2 | sidenav | Projected brand-mark slot (`[sidenav-brand-mark]`). Left out of 071: `brandLogoSrc` (also an SVG data URI) with `brandLogoFit="natural"` carries an app's own mark. | 071 design §1 |
| 071-n3 | menu | Positions beside an element (`right-start`, `left-start`) for a menu next to a rail. Left out of 071: a point `anchor` at the element's edge covers it. | 071 design §1 |
| 071-n4 | menu | Control rows (`MenuItem.control`) in a popup menu. Left out of 071: Tab closes a popup, so a control row would be unreachable by keyboard; inline only. | 071 design §1 |
| 071-n5 | sidenav | A free template for the collapsed rail (`ng-template` instead of `railItems` data). Left out of 071: `railItems` keeps the kit's rail look, names, current mark and badge dot. | 071 design §1 |
| 071-n6 | table | Sortable head `text-align: left` and `lc-table`'s own head stay physical in RTL (071 made only the sortable head's reserve, arrow and busy ring logical; `lc-table`'s compiled head is pinned byte-identical). | 071 design §1 |
| 071-n7 | menu | Inline menu: the second and later `role="menu"` parts have no accessible name (only a first section names a part). Add an optional part name or a docs line. Account Panel story. | 071 review N-1 |
| 071-n8 | sidenav | *Cut Label With Tooltip*: `aria-describedby` reads „{label} · {tooltip}“, so the label is heard twice. Describe with the tooltip text only. | 071 review N-2 |
| 054-n2 | modal, confirm-dialog | AC-6: WebKit not automated; manual Safari/iOS check of the *Focus return (3.34)* stories (`document.activeElement` = the trigger's `<button>` after close). Still open after 055: WebKit is not installed here. Still open after 056 (2026-11-07): no Playwright/WebKit installed. Still open after 057 (2026-11-10): WebKit not installed, not checkable here. Folded into 065 AC-24 (2026-11-17); stays here if still not checkable. Still open after 068 (2026-11-18): no Playwright/WebKit. Still open after 071 (2026-11-20, 065 AC-24 folded again): no Playwright library for WebKit here. | 054 build.md, Deviations |
