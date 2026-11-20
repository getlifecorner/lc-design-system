# Backlog

Open findings that don't need a request of their own: nits, known limits, wording and consistency (routing in [CLAUDE.md → Follow-ups](../CLAUDE.md#agent-pipeline)). The `release-manager` appends rows from *Open items* in `release.md`. The `spec-writer` folds the rows on the components a request touches into its spec and deletes them here. To take rows into the next bundle on purpose: `scripts/lc-request.sh --file requests/BACKLOG.md "<component or IDs>"`.

| ID | Component | Finding | Source |
|---|---|---|---|
| 054-n2 | modal, confirm-dialog | AC-6: WebKit not automated; manual Safari/iOS check of the *Focus return (3.34)* stories (`document.activeElement` = the trigger's `<button>` after close). Still open after 055, 056, 057, 065 AC-24, 068, 071, 072 AC-19 (2026-11-21): WebKit not installed here, no Playwright library in the session. Still open after 072. | 054 build.md, Deviations |
| 072-n1 | menu | Side positions (`right-start`/`left-start`) at 360 px: CDK's fit test reserves both 8 px viewport margins (16 px), so a panel with less than 16 px to spare is pushed to gap 0.2 px (edge 24) and a centred anchor's panel overlaps it. Known limit; add a line to the `position` JSDoc. | 072 review F-1, build O-1 |
| 072-n2 | sidenav | In `dir="rtl"` every sidenav makes the page 1 px wider (`scrollWidth` 361/1025/1281): the CDK focus-trap anchors (`.cdk-visually-hidden`, `margin: -1px`, `right: 0`) reach past the edge. Pre-existing, no content lost. Clip or place the anchors. | 072 review F-2, build O-2 |
| 072-n3 | menu | A single word wider than the label room (44-letter compound, 365 px in a 286 px label, panel 320) is clipped at the panel edge without ellipsis (`overflow-wrap: normal`). Pre-existing in every `lc-menu`; try `overflow-wrap: anywhere` on `.lc-menu__item-label`. | 072 review F-3 |
| 072-n4 | sidenav (stories) | Rail Group Menu stories: the status line „Letzte Auswahl“ shows „Stammdaten“ after the play, because a group press emits `itemClicked` (3.50 contract, correct). Log only entries without children, or name the line „Letztes Ereignis“. | 072 review F-4 |
| 072-n5 | tooltip (stories) | Tooltip Description story: `tooltipPosition="bottom"` opens on the right at 360/1280 because the 30 px button sits 16 px from the edge and CDK flips. Give the story more inline padding (e.g. `72px 64px`). | 072 review F-5 |
