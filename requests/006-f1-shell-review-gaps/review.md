# Review 006: F1 shell review gaps (LK-12, AS-25, AS-26, AS-27, AS-29)

## Round 1 — 2026-10-20, commit 5b0ae5a (gates on 97df945; `git diff --quiet 97df945 5b0ae5a -- libs tools` holds)

Screenshots: the developer's `build/` and `compare/` (252 of 276 identical to `baseline/`; the 24 that differ are the 6 default-land stories at 1024 / 1280, AC-1). Mine: `r1/` (the 8 new stories plus `feedback-skeleton--circle`, 360 · 1024 · 1280, light · dark, with measures), `r1-axe/`, `r1-probe/`, `r1-row/` (end-edge prototype). I opened 12 shots: footer-on-the-horizon 360 light, 360 dark, 1280 light; figure-on-the-horizon 360 light, 1280 dark; compare today-desktop 1024 light; button-link flush 360 light; button flush-link 360 dark; r1-row flush 360 light; bilingual-page 360 light; secondary-levels 360 dark; height-from-container 360 light.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `--_lc-horizon-land` 112 / 72 / 80 / 96 / 128 at 360 / 1024 / 1280 / 1440 / 1920 (figure-on-the-horizon); compare today-desktop 1024: land 72, sun and ring clear |
| AC-2 | pass | `--_lc-horizon-r` 58 / 70 / 90 / 120 / 166; `horizon.spec.ts` radius assertions unchanged |
| AC-3, AC-8 | pass | build.md: the 4 horizon override stories identical to the baseline at all widths; `horizon.shell.spec.ts` |
| AC-4 | pass | footer-on-the-horizon, both themes: land under the line D + F = 245 / 150.5 / 158.5 (F 133 / 78.5 / 78.5), seam 0 px, footer bottom = shell bottom, row fill `#fafcfc` / `#0a131c` = land-3; no visible seam in the 3 shots |
| AC-5 | pass | figure-on-the-horizon: footer row 0 px, land = D 112 / 72 / 80 |
| AC-6, AC-20 | pass | figure's parent `.lc-app-shell__horizon.lc-horizon`, `aria-hidden="true"`; build.md compat 22 / 22.0 `shell figure…` ok |
| AC-7 | pass | both shell stories: 64 / 96 / 96 (128 at 1920), bottom 8 / 12 / 12 (16) below the line, gap to the sun 16 / 24 / 24, x 121.2 / 547.3 / 711.6; `pointer-events: none` |
| AC-9 | pass | secondary: h2 20 px / 25 px, 700, pad 12 / 12 (360) and 12 / 32; contrast 17.74 light, 17.29 dark; subtitle 14 px, 7.56 / 12.17 |
| AC-10 | pass | secondary-levels h1 / h2 / h3 at 360 · 1024 · 1280, ± subtitle; "Haushaltsmitgliederverwaltung" 296.5 px, 1 line; bilingual h2 "Can't reach LifeCorner right now" 305.5 px in 328, 1 line; no overflow anywhere. Levels 4–6 don't exist (design A3) |
| AC-11 | pass | `secondary` = `compact` + life-os interim to the pixel (block 74, title 25, gap 4, subtitle 21); build.md: 13 page-header baseline stories identical |
| AC-12 | pass | at 360 / 1024 / 1280, both themes: label x 16 = paragraph x 16; width 170 = text (non-flush 218, −48); h 46.5; "Ja" 44 × 46.5; icon link: icon at 16, label 44 |
| AC-13 | pass, see finding 1 | `:focus-visible` true, 2 px solid `--color-primary-500`, offset 2, radius 10; ring 4.37 light / 9.95 dark; disabled .5; spinner at x 16. Hover rule unchanged (flush sets no colour or decoration) |
| AC-14 | pass | build.md: 13 button + button-link baseline stories identical; spec pins `.btn-lg` |
| AC-15, AC-16 | pass | height-from-container: tiles 59 / 88 / 88, line 14 / 20 / 20 at 360 / 1024 / 1280; live resize of the container 328 → 700 → 300 px: 14/59 → 20/88 → 14/59. Circle with the hook 30 px: 48 × 30 (oval, as documented) |
| AC-17 | pass | inline `height` styles unchanged in the DOM (`height: 88px`, `14px`, `48px`); hook unset = 3.8 heights; build.md: 8 skeleton baseline stories identical |
| AC-18 | pass | all 8 stories at 360 / 1024 / 1280 in both themes; no `scrollWidth` overflow |
| AC-19 | pass | axe (4.10.2) on the 8 stories, 360, both themes: 0 violations on the shell stories (incl. `aria-hidden-focus`), only the isolated-story trio elsewhere. Forced colours: `visibility: hidden` for both `.lc-horizon__figure` and `:where([shell-horizon-figure])` (stylesheet scan). Reduced motion: nothing new animates; the skeleton fill is static |

**Deviation (build.md): confirmed.** `.btn-link.btn-flush:not(.btn-icon-only, .btn-inline)` is (0,3,0) like the design's selector. Measured: inline + flush = inline alone, `lc-button` inline-block 163.8 × 24 (min 0), `a[lcButton]` 16.8 × 24. design.md §3 updated (rev. 1).

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix (design gap, design.md rev. 1) | `button.component.scss` flush rule; story `components-button-link--flush`, 360 | A flush link at the **end** edge of a row (life-os code page: `justify="between"`, "Anders anmelden" on the right, named in the AS-26 row) can sit on that edge without out-specifying the kit: `justify-content: var(--lc-btn-flush-align, start); text-align: var(--lc-btn-flush-align, start)`; `--lc-btn-flush-align: end` puts every line at the edge (prototype `r1-row`: lines end at 328 / 328) | Alignment fixed to `flex-start` / `start` at (0,3,0). In a 312 px row at 360 "Anders anmelden" wraps to 2 lines (69 px), box 183.5–328, lines end at 243.8 / 266.3: 84 / 62 px short of the edge; only `::ng-deep` or a 4-class selector can change it, which AS-26 was meant to remove. Implement design.md §2 hook row, §3 alignment row, §4, §8 (end row in the Flush story), §9 (spec pins both declarations); JSDoc of `flush` (both components), argTypes, SCSS comment and the changelog draft mention the hook |
| 2 | nit | design.md §3 page-header wireframe | — | Said "8 gap"; measured 4, the same as `compact`. Fixed in design.md, no code change |

**Verdict:** changes requested (finding 1). Everything else is approved as built; after the fix, round 2 only re-measures the Flush stories and compares the other button stories by hash.

## Round 2 — 2026-10-20, commit 06c6042 (gates on 2b151d1; `git diff --quiet 2b151d1 -- libs tools` holds)

Scope as announced in round 1: finding 1 only. Screenshots: the developer's `r2/` (both flush stories, 360 · 1024 · 1280, light · dark, measures in `tmp/006/shots-r2.log`) and `r2-compare/` (the other 13 button and button-link stories, 78 / 78 identical to `baseline/`). Mine: `r2-review/` (Flush 360 dark with the focus on the end link). `cmp`: all 6 `flush-link` shots identical to the approved r1 shots. I opened 3 shots: flush 360 light, 1280 light, and r2-review 360 dark.

| AC | Result | Evidence |
|---|---|---|
| AC-12 | pass | `components-button-link--flush`, all 6 width × theme shots: the start column is unchanged from r1 (x 16, "Code erneut senden" 170 wide, h 46.5, "Ja" 44). End row 16–328: "Neu senden in 25 s" 16–175.5 on one line; "Anders anmelden" box 183.5–328, h 69, `justify-content` / `text-align` `end`, lines 267.7–328 and 245.2–328, so both end at the row edge as in the prototype (328 / 328; finding 1 measured 243.8 / 266.3). build.md probe: on an `lc-button` host in a 260 px row, 3 lines all end at 276 (life-os uses both host forms) |
| AC-13 | pass | End link at 360 dark: `:focus-visible` true, 2 px solid `rgb(132,199,212)` (#84c7d4, 9.95:1), offset 2. The ring runs 179.5–332 and stays 4 px clear of "Neu senden" (175.5). No overflow (`scrollWidth` 360 = `clientWidth`). `flush-link` default / disabled / loading are identical to r1 |
| AC-14 | pass | Every default declaration is a `var(--lc-btn-flush-align, start)` fallback; `start` matches r1's `flex-start` here (the `flush-link` hashes are unchanged); 13 button stories are identical to the baseline (78 / 78) |
| API (§2) | pass | SCSS `.btn-link.btn-flush:not(.btn-icon-only, .btn-inline)` with both hook declarations. JSDoc of `flush` on `lc-button` ("host or an ancestor") and `a[lcButton]` ("link or an ancestor") names the hook, its default `start` and `@default false`. argType `--lc-btn-flush-align` (category CSS hooks, default `start`) on both stories. The play step checks `end`. The spec pins both declarations, says the hook is read only there, and requires it in both JSDocs. The changelog draft explains the hook with the 84 / 62 px before-and-after |

Findings 1 and 2 from round 1 are closed.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 3 | nit | `button-link.stories.ts` Flush, end row `<div>` | `align-items: center`, like the consumer's row (`lc-stack align="center"`, life-os `code.page.ts`), so the one-line start link keeps its 46.5 px box and ring | The row uses the default `stretch`, so "Neu senden in 25 s" is 69 px high (`align-self: auto`), and its focus ring and hit area are 69 px. The label is centred either way, and the shots at rest would not change |

**Verdict:** approved. All 20 AC pass (AC-1–AC-11 and AC-15–AC-20 as in round 1). Nit 3 is open for the release-manager's list.
