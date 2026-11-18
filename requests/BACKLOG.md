# Backlog

Open findings that don't need a request of their own: nits, known limits, wording and consistency (routing in [CLAUDE.md → Follow-ups](../CLAUDE.md#agent-pipeline)). The `release-manager` appends rows from *Open items* in `release.md`. The `spec-writer` folds the rows on the components a request touches into its spec and deletes them here. To take rows into the next bundle on purpose: `scripts/lc-request.sh --file requests/BACKLOG.md "<component or IDs>"`.

| ID | Component | Finding | Source |
|---|---|---|---|
| 054-n2 | modal, confirm-dialog | AC-6: WebKit not automated; manual Safari/iOS check of the *Focus return (3.34)* stories (`document.activeElement` = the trigger's `<button>` after close). Still open after 055: WebKit is not installed here. Still open after 056 (2026-11-07): no Playwright/WebKit installed. Still open after 057 (2026-11-10): WebKit not installed, not checkable here. Folded into 065 AC-24 (2026-11-17); stays here if still not checkable. | 054 build.md, Deviations |
| 066-n1 | description-list | A total row's 1 px rule above and double rule below run to the row ends, so they bend at the clickable row's rounded corners (`--border-radius-sm`; *Item Icons* rows md clickable, 1280 L). Pre-existing. | 066 review F-6 |
| 067-n1 | sidenav | *Deep Tree* 360: the status line (open ids, last action) wraps below the 560 px frame (`overflow: hidden`) and is not visible. | 067 review F-4 |
| 067-n2 | waterfall-chart | 9 bars at 360: value labels „+25200/-2400“ and „+6370/43830“ overlap (pre-existing); category labels shrink to 2–3 letters. Docs could advise ≤ 5 bars below about 480 px. | 067 review F-5 |
| 067-n3 | number-input | Forced colours: a focused field shows only the caret (halo dropped, border forced, input `outline: none`). Add `:focus-within` `outline: 2px solid Highlight` as for the error state. Pre-existing, all stories. | 067 review F-6 |
| 067-n4 | sidenav | `itemActionClick` leaves the popup state to the app (`aria-expanded` on `element`). An `action.hasPopup` plus an open-id input would make it declarative and prerenderable. | 067 review F-7 |
| 067-n5 | notification-center | `notification-center.icons.spec.ts` failed once under load (flake). | 067 review F-8 |
