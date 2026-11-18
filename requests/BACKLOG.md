# Backlog

Open findings that don't need a request of their own: nits, known limits, wording and consistency (routing in [CLAUDE.md → Follow-ups](../CLAUDE.md#agent-pipeline)). The `release-manager` appends rows from *Open items* in `release.md`. The `spec-writer` folds the rows on the components a request touches into its spec and deletes them here. To take rows into the next bundle on purpose: `scripts/lc-request.sh --file requests/BACKLOG.md "<component or IDs>"`.

| ID | Component | Finding | Source |
|---|---|---|---|
| 054-n2 | modal, confirm-dialog | AC-6: WebKit not automated; manual Safari/iOS check of the *Focus return (3.34)* stories (`document.activeElement` = the trigger's `<button>` after close). Still open after 055: WebKit is not installed here. Still open after 056 (2026-11-07): no Playwright/WebKit installed. Still open after 057 (2026-11-10): WebKit not installed, not checkable here. Folded into 065 AC-24 (2026-11-17); stays here if still not checkable. | 054 build.md, Deviations |
| 065-n1 | timeline | N3: horizontal timeline, the title is start-aligned in `.timeline__header`; centre it over its marker (`.timeline--horizontal .timeline__header { justify-content: center }`; *Horizontal* 1280 item 2: title centre 173.7 vs marker 192 px). Pre-existing. | 065 review r3 N3 |
