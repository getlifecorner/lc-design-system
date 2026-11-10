# Backlog

Open findings that don't need a request of their own: nits, known limits, wording and consistency (routing in [CLAUDE.md → Follow-ups](../CLAUDE.md#agent-pipeline)). The `release-manager` appends rows from *Open items* in `release.md`. The `spec-writer` folds the rows on the components a request touches into its spec and deletes them here. To take rows into the next bundle on purpose: `scripts/lc-request.sh --file requests/BACKLOG.md "<component or IDs>"`.

| ID | Component | Finding | Source |
|---|---|---|---|
| 054-n2 | modal, confirm-dialog | AC-6: WebKit not automated; manual Safari/iOS check of the *Focus return (3.34)* stories (`document.activeElement` = the trigger's `<button>` after close). Still open after 055: WebKit is not installed here. Still open after 056 (2026-11-07): no Playwright/WebKit installed. Still open after 057 (2026-11-10): WebKit not installed, not checkable here. | 054 build.md, Deviations |
| 057-n1 | select | F-2: xs/sm/md with a long value: the text ends at 303/299/295 px, the × starts at 277, so text can run under the ×. Pre-existing. | 057 review F-2 |
| 057-n2 | charts | F-3: `CHART_PALETTE` secondary-500 reaches 2.98 / 2.83:1 on surface-2 / sunken (3:1 needed). | 057 review F-3 |
| 057-n3 | table, description-list | N-1: *Fill* story at 360: the dl in the 156 px column breaks amounts mid-number („214.300 / ,00 €“, „Reche / nzentr / um“); 2 columns at every width was the design choice. | 057 review N-1 |
| 057-n4 | table | N-2: *Action Sizes* story at 360: the actions column is off-screen (the table scrolls, as before); the lg actions are not visible on a phone. | 057 review N-2 |
| 057-n5 | list | N-3: the row button's accessible text runs parts together and contains the action's name („…1000)Heute, 06:00 GeladenSAP-Ist laden“). Unchanged from 3.36. | 057 review N-3 |
| 057-n6 | hero | N-4: *Badges in the Body* story labels use token names („Monatsstand · primary“); use German labels. | 057 review N-4 |
