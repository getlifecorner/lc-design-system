# Backlog

Open findings that don't need a request of their own: nits, known limits, wording and consistency (routing in [CLAUDE.md → Follow-ups](../CLAUDE.md#agent-pipeline)). The `release-manager` appends rows from *Open items* in `release.md`. The `spec-writer` folds the rows on the components a request touches into its spec and deletes them here. To take rows into the next bundle on purpose: `scripts/lc-request.sh --file requests/BACKLOG.md "<component or IDs>"`.

| ID | Component | Finding | Source |
|---|---|---|---|
| 054-n2 | modal, confirm-dialog | AC-6: WebKit not automated; manual Safari/iOS check of the *Focus return (3.34)* stories (`document.activeElement` = the trigger's `<button>` after close). Still open after 055: WebKit is not installed here. Still open after 056 (2026-11-07): no Playwright/WebKit installed. | 054 build.md, Deviations |
| 056-n1 | list | `lc-list` label has `overflow-wrap: anywhere` without `hyphens: auto`: German compounds break mid-word at 360 px („USM-Leistungsverre / chnung“, md; „…verrechnu / ng“, sm), more often with the 32 px chevron. The card title hyphenates. Pre-existing. | 056 review.md N-1 |
| 056-n2 | card | *Collapsible* story: no card has a `[card-footer]`, so the footer hiding (AC-22) is covered only by the unit test. Give one closed card a footer. | 056 review.md N-2 |
