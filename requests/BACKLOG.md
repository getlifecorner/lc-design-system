# Backlog

Open findings that don't need a request of their own: nits, known limits, wording and consistency (routing in [CLAUDE.md → Follow-ups](../CLAUDE.md#agent-pipeline)). The `release-manager` appends rows from *Open items* in `release.md`. The `spec-writer` folds the rows on the components a request touches into its spec and deletes them here. To take rows into the next bundle on purpose: `scripts/lc-request.sh --file requests/BACKLOG.md "<component or IDs>"`.

| ID | Component | Finding | Source |
|---|---|---|---|
| 054-n2 | modal, confirm-dialog | AC-6: WebKit not automated; manual Safari/iOS check of the *Focus return (3.34)* stories (`document.activeElement` = the trigger's `<button>` after close). Still open after 055: WebKit is not installed here. Still open after 056 (2026-11-07): no Playwright/WebKit installed. Still open after 057 (2026-11-10): WebKit not installed, not checkable here. | 054 build.md, Deviations |
| 057-n2 | charts | F-3: `CHART_PALETTE` secondary-500 reaches 2.98 / 2.83:1 on surface-2 / sunken (3:1 needed). | 057 review F-3 |
| 057-n4 | table | N-2: *Action Sizes* story at 360: the actions column is off-screen (the table scrolls, as before); the lg actions are not visible on a phone. | 057 review N-2 |
| 057-n6 | hero | N-4: *Badges in the Body* story labels use token names („Monatsstand · primary“); use German labels. | 057 review N-4 |
| 058-n1 | hero | N-1: *Light Slim* story passes `variant="slim light"` (`hero.stories.ts`); `HeroVariant` is one value, so the host gets the classes `hero--slim light` and renders the dark info band, not a light one. Fix the story (or decide whether slim + light should combine). Pre-existing. | 058 design.md §8 N-1 (owner 2026-11-10) |
| 058-n2 | button | N-1: `button.stories.ts` *Inverse* (l. 290) and *Inverse Outline* (l. 330), `button-link.stories.ts` (l. 175–176, 214) and `button.component.scss` (l. 217–250) still quote 3.36 values under the old 85 % body opacity (3.62, 9.28, 4.66, 3.56); *Inverse* says the pill passes only on neutral, info, purple and violet. Now: `inverse` label 13.17, fill and ring 4.58 or more on all nine bands; `inverse-outline` text 9.3 or more, border and ring 4.58 or more. | 058 review N-1 |
| 058-n3 | hero | N-2: *Stage Actions* story description says „at least 9.36:1“ for the `inverse-outline` text; the 8-bit composite on the build is 9.30 (secondary) to 9.34 (purple). Write „9.3:1 or more“. | 058 review N-2 |
