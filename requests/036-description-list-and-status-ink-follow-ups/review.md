# Review 036: Description-list contrast and targets, 033 story and comment fixes, 034 status-ink follow-ups

## Round 1 — 2026-11-02, commit 8d02e77 (code = e0bcc68, gates in build.md)

Screenshots: the developer's `tmp/story-shots/036/build-{a,b,c,new,state,match,focus,forced,revert}` (current Storybook build) plus mine: `r1-focus` (row 2 focused, 360/1280 L/D), `r1-forced` (forced colours, 360 L/D), `r1-nc-proto` and `r1-nc-proto2` (NC header prototype, 320–1280). I reviewed the developer's measure module `tmp/036/measure/m.mjs` (gradient-aware backdrop, 0–1 `color()` scaling) and reused its logs.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `new-dl.log`, *Link and primary values* md + sm, 360/1024/1280: link 6.21 L / 10.80 D, primary 9.13 / 9.12 on the card; *Rows* on the canvas 6.21 / 11.78 and 9.13 / 9.95. Page and hover values are pinned from tokens in the 036 block (5.94 / 5.64 L) |
| AC-2 | pass | `r1-focus`: `:focus-visible` true, `solid 2px` rgb(32,132,151) L / rgb(132,199,212) D, offset 2, r 10, no box-shadow, no clipping ancestor; 4.36 L / 9.12 D against the card (`focus.log`); shots checked. `r1-forced`: outline rgba(5,0,73,.8) L / rgba(0,230,255,.8) D (emulated Highlight), shot checked |
| AC-3 | pass | `new-dl.log`, DE + EN, 360/1024/1280, L + D: rows md 45 45 44, sm 45 45 44; stacked md 62, sm 48; page scroll 0 |
| AC-4 | pass | `revert.log`: with the old link ink injected, the 4 link stories are 24/24 identical; the other 3 dl stories are identical in the compare; no existing dl spec edited |
| AC-5 | pass | footer-slot: 3 rows, `lc-button` present, flush link 44 px, 5.97 L / 10.57 D; shots 360 L and 1280 D checked; 16 other card stories identical |
| AC-6 | pass | diff: `&__term` "No browser margin: the row gap is the only space (BA-8)."; the `&__value` wording is kept |
| AC-7 | pass | `state.log`: unread message/time 6.49 L, ≥ 7.45 D (was 4.23); read rows tertiary ≥ 5.58 L / 6.07 D |
| AC-8 | pass | depends label/line/arrow 7.55 L / 11.15 D, legend 7.23 / 9.25; tree 4.83 / 6.70; cross-refs at 0.8 opacity ≥ 3.50 L / 4.76 D; `uses`/`extends` 5.83 / 9.13 L (as in 034); dash arrays unchanged |
| AC-9 | pass | `match.log`: 7.85 on every line incl. debug, at rest and with hover composited, L + D; terminal 12.90; forced colours Mark/MarkText (19.55) in both variants |
| AC-10 | pass | bar secondary vs track 4.19 L / 5.48 D (canvas); other variants as in 3.22.4 |
| AC-11 | pass | ring secondary vs info 1.92 D (was 1.07), 2.19 L; vs track 5.48 D / 4.19 L; *All Colors* 360 D checked |
| AC-12 | pass | toolbar 326×41 (360) / 1246×41 (1280), buttons 28×28, scroll 0; 2.5.8 by size, SCSS comment present; DE overflow evidence in design §6 |
| AC-13 | pass | ANSI gray worst in the story: Latte 5.00, terminal 5.08, dark log 5.01 (design worst incl. hover 4.63 / 4.61 / 4.55); *With Ansi Colors* other inks equal to 034 |
| AC-14 | pass (strings) | `state.log` `nc.english: []` at 360/1280 L/D. **But the German header clips at 360: finding 1** |
| AC-15 | pass | removed assertion lines = exactly the six in design §9 (diff checked); `_theme-*.scss` add only `--color-secondary-graphic` |
| AC-16 | pass | forced colours for the dl row and the log match measured; no transitions added; compat 22 PASS (build.md) |
| AC-17 | fail (wording) | finding 2 |

**Compare:** `compare-{a,b,c}.log` give 240 different and 240 identical. The differing set is exactly design §9: dl 4, card footer-slot, ring all-colors D, NC 6, log with-ansi-colors plus the 5 unstable stories, bar colors L, and 22 dependency stories.

**API vs §2:** the one new token is set in both themes, and the declarations match §2. The dl argTypes `description` and `table.defaultValue` values match the inputs' `@default` values. Story IDs are as in §8.

**Deviations:** (1) the forced-colours selector also names the terminal match: accepted, because the 0,2,0 terminal rule would otherwise win. (2) dl argTypes and the `itemClick` action: accepted, per the CLAUDE.md story convention. (3) the dark log gray is pinned at 6.11: accepted as an additive assertion.

**"For the review" item (NC header):** fix it in this request, not as a follow-up. This request made the story German, the clipped "Alle löschen" is a reflow defect at 360 for every German consumer, and the fix is two declarations. My design §7 was wrong ("that stays"); it is corrected with a change note. Prototype (`r1-nc-proto2`, rule injected, `--full --compare=build-c`, 8 NC stories × 360/1024/1280 × L/D): 46 shots identical, and the only 2 that differ are *Priority On Unread Rows* at 360 L/D. The header then measures 75 (was 87), scroll 0 (was 14), and at 320 it is 93 with scroll 0 (was 54).

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix | `notification-center.component.scss`, *Priority On Unread Rows* 360 L/D (and any German NC ≤ 400 px) | design §2 r1 row: `.lc-nc__header` `flex-wrap: wrap; row-gap: var(--spacing-1)`, `.lc-nc__header-actions` `margin-inline-start: auto`; header 75 at 360 / 93 at 320, scroll 0, "Alle löschen" ends at 327; all other NC shots identical to `build-c` | "Alle löschen" spans 295.8–356.9 in a panel that ends at 344, so 13 px are clipped (54 px at 320); header 87 high with 3-line action labels (`ncheader.log`, `r1-nc-proto`) |
| 2 | should-fix | changelog draft (build.md) | AC-17 names 033 findings 2–4. Replace the "Known" NC line with a Fixed bullet: "`lc-notification-center` header: long (German) actions wrap to a second line instead of being clipped (360: 13 px, 320: 54 px)" | the draft names only "033 finding 2"; findings 3 (the `&__term` comment) and 4 (= BA-10) are not named; the NC clip is listed under Known |
| 3 | nit | `dependency-viewer.component.ts` `RELATION_STYLES` | keys aligned at column 12 as before (`blocks:     {`) | `blocks:    {` lost one space |

**Verdict:** changes requested (finding 1). In round 2 I will check only the NC fix: re-shoot the 8 NC stories `--full --compare=tmp/story-shots/036/build-c` and measure the header at 320/360.

## Round 2 — 2026-11-02, commit 4f9e9c3 (code = cfcccde; `git diff cfcccde HEAD -- libs tools` empty)

Storybook: story-shots called the build stale (source mtimes after the amend; the Nx cache hit did not refresh it), so I rebuilt it with `--skip-nx-cache`. My shots: `tmp/story-shots/036/r2-compare` (8 NC stories × 360/1024/1280 × L/D, `--full --compare=build-c`) and `r2` (*Priority On Unread Rows* 320/360 L/D with a measure, `--compare=r2-nc`).

| Check | Result | Evidence |
|---|---|---|
| Finding 1 (AC-14, design §2 r1 row) | pass | SCSS diff = the §2 row verbatim: `flex-wrap: wrap`, `row-gap: var(--spacing-1)` (computed 4px, column gap `normal`), `justify-content: space-between` kept, actions `margin-inline-start: auto`, the comment word for word |
| Compare vs `build-c` | pass | 46 identical, 2 different: *Priority On Unread Rows* 360 L/D, exactly design §9 |
| German header, 360 | pass | header 75, scroll 0, page 0; "Alle als gelesen markieren" 65.9–232.9, "Alle löschen" 240.9–327 (header ends 343, padding 16), both 26 high, `clipX 0 clipY 0`; title row y29, actions y53 (gap 4). Shot 360 L checked: end-aligned second line, nothing clipped |
| German header, 320 | pass | header 93, scroll 0, page 0; the two buttons share the row (33–195.2, 203.2–287) and wrap their labels to 2 lines (44 high, line-height 18, `clipY 0`). Shot 320 D checked; the filter chips scroll (`overflow-x: auto`), as before |
| English headers | pass | 51 at 360/1024/1280 (unchanged, hash-identical); at 320 the actions move to line 2 (75, scroll 0) |
| Developer's evidence | reproduced | my 4 `r2` shots are hash-identical to `r2-nc`, and the measures equal `r2-nc.log` |
| Finding 2 (AC-17) | pass | the draft names BA-10 = 033 finding 4, 033 finding 3 (term comment) and 033 finding 2 (Card *Footer slot*), F-8 to F-13 with old → new values; the NC header is a Fixed bullet with 13 / 54 px and 75 / 93 / 51; Known no longer lists it. Unread NC dark 7.05 is the design §5 token minimum (story ≥ 7.45), correct for a changelog |
| Finding 3 | pass | `blocks:     {` back at column 12, like every other key in `RELATION_STYLES` |

**API vs §2:** round 2 adds no input, output, slot or hook. The two new NC spec cases pin the wrap rule, the missing column gap, the kept padding and `space-between`, and the auto margin.

### Findings

None. Every AC from round 1 stands. Open for the release (from the design, not new): the Known line F-14 to F-17.

**Verdict:** approved.
