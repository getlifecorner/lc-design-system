# Backlog

Open findings that don't need a request of their own: nits, known limits, wording and consistency (routing in [CLAUDE.md → Follow-ups](../CLAUDE.md#agent-pipeline)). The `release-manager` appends rows from *Open items* in `release.md`. The `spec-writer` folds the rows on the components a request touches into its spec and deletes them here. To take rows into the next bundle on purpose: `scripts/lc-request.sh --file requests/BACKLOG.md "<component or IDs>"`.

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
