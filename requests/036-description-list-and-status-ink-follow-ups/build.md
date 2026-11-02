# Build 036: Description-list contrast and targets, 033 story and comment fixes, 034 status-ink follow-ups

- **Branch:** `fix/3.23.1-description-list-and-status-ink-follow-ups`
- **Commit:** see `git log -1` on the branch (one commit, amended), `fix(description-list): BA-10 inks, 44 px clickable rows and focus outline; 033 and 034 follow-ups F-8 to F-13`

## Files changed

| File | Change |
|---|---|
| `styles/_theme-light.scss`, `_theme-dark.scss` | new `--color-secondary-graphic` (L `$color-secondary-600`, D `$color-secondary-500`, in the shared dark mixin) |
| `description-list.component.scss` | design §2 exactly: link/primary inks, `mix.focus-ring`, 2 padding rules, forced-colours Highlight, `&__term` comment |
| `notification-center.component.scss` | unread message + time → `--color-text-secondary`; r1: `.lc-nc__header` `flex-wrap: wrap; row-gap: var(--spacing-1)`, `.lc-nc__header-actions` `margin-inline-start: auto`, design §2 comment |
| `dependency-viewer.component.{ts,html}` | `depends`, structural edge, `#arrow-default`/`#arrow-depends` → text-secondary; tree edges ×2 → field-border; comment above `RELATION_STYLES` |
| `log-viewer.component.scss` | opaque match + terminal pair, forced colours `Mark`/`MarkText`, `.ansi-gray` Mocha/Latte, F-12 comment on `__tool-btn` |
| `progress-bar.component.scss`, `progress-ring.component.scss` | secondary → `var(--color-secondary-graphic)` |
| stories: description-list, log-viewer, card, notification-center, progress-ring | §8: 4 new, 3 changed; dl argTypes get description + default, `itemClick` action |
| `docs/colors.mdx` | "Data marks" table with the new token |
| specs | `theme-contrast.spec.ts` new 036 block + 5 updated assertions; `log-viewer.component.spec.ts` 1 updated; new `description-list.clickable.spec.ts` (padding rules, order, unchanged non-clickable padding, focus, markup); r1: `notification-center.component.spec.ts` +2 (header wrap rule, no column gap, padding and `space-between` kept, actions `margin-inline-start: auto`) |

## Acceptance criteria

Measures: `tmp/036/measure/m.mjs` (modes `dl`, `state`, `match`, `nc`, `tb`), `revert.mjs`, `probe.mjs`; logs in `tmp/036/*.log`.

| AC | Covered by | Result |
|---|---|---|
| 1 | 036 block (tokens) + `new-dl.log` | page/hover L 5.94/5.64, D 8.96/7.92; primary 8.74/8.29, 7.57/6.69. Browser on the card: link 6.21 L / 10.80 D, primary 9.13 / 9.12 |
| 2 | 036 block, clickable spec, `focus.log`, `forced.log` | 2px solid primary-500, offset 2, no box-shadow; 4.36 L / 9.12 D vs the card; forced colours: outline `Highlight` |
| 3 | `new-dl.log` 360/1024/1280 L+D, DE + EN | rows md/sm 45 45 44; stacked md 62, sm 48; page scroll 0 |
| 4 | compare + `revert.log` | non-clickable rows 38/27 unchanged; the 4 dl link stories 24/24 hash-identical with the old ink injected; other 3 dl stories identical |
| 5 | `new-dl.log` | footer-slot: 3 rows, `lc-button` present, link `btn-link btn-flush` 44 px, 5.97 L / 10.57 D; other 16 card stories identical |
| 6 | diff | `&__term`: "No browser margin: the row gap is the only space (BA-8)."; `&__value` keeps the dd wording |
| 7 | 036 block, `state.log` | unread 6.49 L / ≥ 7.45 D (was 4.23); read rows unchanged (tertiary) |
| 8 | 036 block, `state.log` | depends label/line/legend 7.55/7.55/7.23 L, 11.15/11.15/9.25 D; cross-ref 4.52 / 7.55; tree 4.83 L / 6.70 D (S2 4.62 / 5.56); dash arrays unchanged |
| 9 | 036 block, `match.log` | log 7.85 every line incl. debug and hover (L+D); terminal 12.90; forced colours Mark/MarkText in log and terminal |
| 10, 11 | 036 block, `state.log` | bar/ring secondary vs track 4.19 L / 4.05 D (min over pages), vs page 4.41 / 4.59; secondary vs info 2.19 / 1.92 (was 1.07) |
| 12 | `state.log` (`tb`) | toolbar 326 × 41 at 360, 1246 × 41 at 1280, buttons 28 × 28, scroll 0 (unchanged); 2.5.8 by size, comment in SCSS |
| 13 | 036 block, `state.log` | Latte 6.25 plain / 4.63 worst (hover); Mocha terminal 5.81 / 4.61; dark log 4.55 worst; other ANSI colours unchanged |
| 14 | `state.log` (`nc`); r1: `r2-nc.log` (`measure/nchead.mjs`) | *Priority On Unread Rows*: no English string at 360/1280 L+D. r1 header 93 / 75 / 51 / 51 at 320/360/1024/1280, header and page scroll 0 in all 64 NC shots; "Alle löschen" 240.9–327 at 360 (panel ends 344); item boxes equal the designer's `r1-nc-proto2` measure |
| 15 | Jest, `git diff c21feeb -- libs/angular-ui-kit/src/styles/_theme-*.scss` | only the new token; shared status hexes pinned; six assertions updated (below) |
| 16 | forced-colors shots, compat | see AC-2/9; compat 22 passes |
| 17 | changelog draft below | — |

**Assertion updates (design §9, AC-15 assumption):** theme-contrast l. 750 secondary raw → `var(--color-secondary-graphic)`; l. 970 ring secondary token; l. 1025–1026 depends → text-secondary, tree → field-border (comment "out of scope F-9" replaced); 034 `expected.graphic` dark 4.76 → 4.05 and `ringTrack.secondary` [4.19, 8.35] → [4.19, 4.05] (the dark ring secondary moved off the inverted secondary-600). `log-viewer.component.spec.ts` l. 491: `/--color-warning-default/` → `background-color: var(--color-warning); color: var(--color-on-warning)` (stronger than the designer's `/var\(--color-warning\)/`).

## Gates

Round 2 (review r1 fixes) gates ran on the code of commit `cfcccde` (amended into the final commit; `git diff --quiet cfcccde -- libs tools` holds for it). Round 1 ran on `e0bcc68`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 215 suites, 5043 passed, 8 skipped (`--maxWorkers=2`); r1 was 5041 |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | 122 entries built |
| `npm run test:tools` | 22 passed on `e0bcc68`; not repeated (r2 changes no tools or stories) |
| `npx nx run angular-ui-kit:build-storybook` | 987 stories |
| Story screenshots | r1: `tmp/story-shots/036/build-{a,b,c}` vs `baseline` (480, `--full`): 210 different, 240 identical, exactly design §9; new/changed: `build-new`, `-state`, `-match`, `-focus`, `-forced`, `-revert`. r2: `r2-nc` (8 NC stories × 320/360/1024/1280 × L/D, `--full --compare=build-c`): 46 identical, 2 different (*Priority On Unread Rows* 360 L/D), 16 new at 320 |
| `node tools/compat/check-angular-majors.mjs --only=22` | PASS, Angular 22.2.4, 89 prerendered-HTML checks (NC is prerendered in the compat app) |

## Deviations from the design

| # | What | Why |
|---|---|---|
| 1 | Forced-colours match rule names `.lc-log-viewer__match, .lc-log-viewer--terminal .lc-log-viewer__match` | the terminal rule (0,2,0) beat the design's (0,1,0) selector and would be forced to Canvas; measured Mark/MarkText in both variants. Specificity only. |
| 2 | dl argTypes `layout`, `leaders`, `size`, `clickable`, `items` get description + default; `itemClick` action argType | CLAUDE.md story convention; no shot changed (dl compare as expected) |
| 3 | 036 block pins the dark log gray plain 6.11 | the design gives only the worst value (4.55) |

## Review r1 fixes

| Finding | Fix |
|---|---|
| 1 NC header clipped | design §2 r1 row, verbatim (AC-14 row above); shot `r2-nc/…priority-on-unread-rows--360-light.png` checked |
| 2 changelog | 033 findings 2–4 named; NC header moved from Known to Fixed |
| 3 `RELATION_STYLES` | `blocks:     {` aligned at column 12 again |

Note: focus measures must wait two frames after `focus()`; a synchronous read returned a stale 3 px outline (`probe.log`).

## Changelog draft

```
## [3.23.1] - 2026-11-02

`lc-description-list` link and primary values reach 4.5:1, clickable rows are 44 px tall with a visible focus outline (life-os BA-10, bank accounts page), and the follow-ups F-8 to F-13 of 3.22.4 reach WCAG 2.2 AA. No API breaks.

### Fixed

- **`lc-description-list` link and `primary` values** (BA-10 = 033 finding 4) use `--color-link` (hover `--color-link-hover`) and `--color-on-primary-subtle`: light 4.17 → 5.94 (link) and 8.74 (primary) on the page, 3.96 → 5.64 / 8.29 on a hovered row; dark link 7.57 → 8.96.
- **Clickable `lc-description-list` rows** (BA-10) are at least 44 px tall in the `rows` layout (`md` 38 → 45, `sm` 27 → 45; the last row 44), at every width; `stacked` (62 / 48) and non-clickable rows are unchanged. Focus is a 2 px `--color-primary-500` outline 2 px outside the row (4.36:1 light, 9.12:1 dark on a card; the 20 % halo was 1.28 / 1.50) and `Highlight` in forced colours.
- **`lc-notification-center`** (F-8): message and time on unread rows use `--color-text-secondary`: dark 4.23 → 7.05, light 5.01 → 6.49.
- **`lc-notification-center` header**: long (German) actions wrap to a second line, end-aligned, instead of being clipped (360: 13 px, 320: 54 px); the German header is 75 px tall at 360 and 93 at 320. Headers that fit on one line are unchanged (51 px).
- **`lc-dependency-viewer`** (F-9): `depends` (label, line, arrow, legend) and the layered structural edges use `--color-text-secondary`: light 2.53 → 7.55, dark 3.57 → 11.15; tree lines `--color-field-border`: light 1.47 → 4.83, dark 2.28 → 6.70.
- **`lc-log-viewer` search matches** (F-10) are an opaque amber marker with dark ink: 7.85:1 on every line in both themes (dark was 3.82, debug lines 3.25), terminal 12.90:1 (was 3.29); `Mark` / `MarkText` in forced colours.
- **`lc-progress-bar` secondary fill** (F-11) and the **`lc-progress-ring` secondary arc** use the new `--color-secondary-graphic`: bar light 2.83 → 4.19 against the track; ring dark secondary vs info 1.07 → 1.92.
- **`lc-log-viewer` `.ansi-gray`** (F-13): light (Latte) `#5c5f77`, 2.60 → 6.25; terminal (Mocha) `#9399b2`, 3.35 → 5.81. Other ANSI colours are unchanged.
- `lc-description-list` source: the comment on the term no longer speaks of a `dd` margin (033 finding 3); no rendering change.
- Stories: Card "Footer slot" renders its description list again (033 finding 2); Notification Center "Priority On Unread Rows" is fully German; new: Description List "Link and primary values (BA-10)", "Clickable rows (BA-10)", "Clickable rows, English", LogViewer "ANSI gray on every line".

### Added

- Token `--color-secondary-graphic` (light `#5a798c`, dark `#7097af`): secondary data marks, ≥ 3:1 against the track and the page in both themes. Not a text colour.

### Compatibility

- No API breaks: no input, output, slot or class changed; `--color-success/-error/-warning/-info` keep their values. Clickable rows grow (38 → 45 px): a layout with a fixed height around a clickable list gets 7 px per row more. `lh` needs Chrome 109, Safari 16.4, Firefox 120; older browsers keep the 38 px row. Light ring and dark bar secondary keep their colour.
- F-12: the 28 px log tool buttons and the 40 px pill hit areas meet WCAG 2.5.8 by size; 44 px would overflow the 360 px toolbar with German labels by 22 px.

### Known

- F-14 bar primary in dark 2.89 on a surface-2 track; F-15 20 % focus halos as the only indicator (NC title and dismiss, log jump-to-bottom); F-16 dependency toggle and node borders `neutral-300`; F-17 `role="button"` on description-list rows.
```
