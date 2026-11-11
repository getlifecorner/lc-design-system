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
| 059-n1 | device-frame | F-4: *Screenshot Row* below 1024 px: the inset focus ring covers the frames' top rim by 1.66 px; set `.shots__row { padding: 4px 16px 8px }` below 1024 px (life-os copies this pattern). Not a WCAG failure. | 059 review F-4 |
| 060-n1 | hero | `--lc-hero-media-width: 34rem` exceeds the viewport at root text zoom 200 % at 1024/1280 (map 1088 × 886 clipped, over the title); use e.g. `min(var(--lc-hero-media-width), 50%)`. Page zoom holds. Pre-existing. | 060 review finding 2 |
| 060-n2 | hero | Long title words do not hyphenate at 320 px + 200 % text („organisiert“ cut at the edge). Pre-existing. | 060 review finding 3 |
| 060-n3 | device-frame | *Laptop Hooks* right frame: story says „the lid alone“ at base height 0, but the base stays a 2 px strip (its borders); hide the base or reword. | 060 review finding 4 |
| 060-n4 | chip | `.lc-chip--clickable { font: inherit }` makes clickable sm/md chips use the parent font size (16 px, not 14 px). Pre-existing. | 060 build.md |
| 060-n5 | chip | The 44 px target premise (design §6) for chips is unsettled. | 060 build.md |
