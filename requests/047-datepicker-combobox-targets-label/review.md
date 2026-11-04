# Review 047: datepicker and combobox clear targets, combobox lg input, datepicker label, selected day, day panel targets

## Round 1 — 2026-11-04, commit 1e5223a (gates on f60cec39; `git diff f60cec39 HEAD -- libs tools` empty)

Screenshots: `tmp/story-shots/047/` — developer: `build-new` (360/1280 L/D, `--axe`), `build-panel` (320/360/1024/1280), `build-forced`, `build-open`, `build-rest`; review: `r1-fields` (1024 L/D, `--axe=wcag22aa`, focus on the md/lg clear), `r1-flip` (field 120 px above the viewport bottom), `r1-200` (200 % text), `r1-multi` (lg multiple, 2 chip rows). Measures: `/zz-047/hit.mjs` + `r1-*-measure.js`. 8 shots opened.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | *Clear Targets* 360/1024/1280 L/D: xs/sm box 24 × 24 (scan 13/12/13/12), md/lg and month md/lg 44 × 44 (scan 31/14/23/22), beyond = the field `INPUT`; fields 24/32/40/44; axe `wcag22aa` 0 violations, 0 incomplete (`r1-fields.log`) |
| AC-2 | pass | *Day Panel*: ring 4.37 L / 9.13 D on the panel, text 6.21, dark fill 2.78 (ring carries it); `--forced-colors` selected = `Highlight` ≠ panel (`build-forced` 360 L opened) |
| AC-3 | pass | *Clear Targets (DE)*: xs–md 24 × 24; lg scan 27/18/23/22 = x 299–343 × y 287–331 at 360, left neighbour `INPUT`; ring 2 px offset 0, `:focus-visible` true, round the 24 box (`r1-fields` 1024 L opened) |
| AC-4 | pass | lg input 274 × 44 in the 46 frame, xs–md 24/28/32 in 34/38/42; spec `frame (AC-4)`; lg multiple with 2 chip rows: input top 102 = row 2 bottom, 0 overlaps, every chip × hit at its bottom edge, frame 104 as 3.29 (`r1-multi.log`) |
| AC-5 | pass | spec `label (AC-5)`; *With Label* 14/500/21, 6 px above the field; `label` JSDoc `@default ''`, argType with description and `"''"` |
| AC-6 | pass | spec `unchanged default (AC-6)`; `diff -rq baseline build-rest`: 84/84 identical |
| AC-7 | pass | *Label (DE)* 360: „Gilt ab“ 1 line × 328; compound 2 lines (42) in 158 with „Leistungsverrech-“, overflow 0 on every label at 360/1024/1280; *Clear Targets (DE)* labels 1 line, long value ends at the input (360 D opened) |
| AC-8 | pass | spec (Tab field → ×, names, clear → `null` + focus on the field, both components); every clear `:focus-visible` with a 2 px primary-500 ring |
| AC-9 | pass | *Day Panel* 360: 342 × 448 at x 8, nav/days 44, today 65.59 × 44; 320: 304 at x 8, days 38.56; 1024/1280: 310 × 395; `diff -rq baseline-open build-open`: 1024/1280 identical, 360 differ (intended) |
| AC-10 | pass | spec `Enter in the open month field (AC-10)` |
| AC-11 | pass | as AC-6 plus `build-open` 4/4; frame heights unchanged in every measure |
| AC-12 | pass | `build.md`: compat 22 `ok datepicker label and lg combobox frame before JS` (not re-run) |

### Deviations (build.md 1–3)

| # | Decision | Reason |
|---|---|---|
| 1 in-flow panel | **confirmed** | Push needs the pane to have the panel's size. New state, measured: with the field 120 px above the bottom it opens above at 360 (panel y 348–796, field y 796) and 1280 (401–796), as lc-combobox's list; 3.29 ran off the viewport. At-rest and 1024/1280 open shots identical |
| 2 x 8, not 10 | **confirmed** | CDK 22.2.2 checks the fit against `[0, vw − 2 × margin]` (`_getOverlayFit`, `_overlay-module-chunk.mjs` l.1378–1379) and pushes to `≥ margin` on the left (l.1413–1420). My x 10 was computed, not prototyped. Within the viewport in both cases (AC-9); see finding 4 |
| 3 2 lines, not 3 | **confirmed** | Better than designed; my prototype value was wrong. `design.md` corrected (change note) |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix | `datepicker.stories.ts` l.260, *Label (DE)* description (Storybook + MCP) | „…breaks with a hyphen over two lines (42 px)…“ | „over three lines (63 px)“; measured 2 lines, 42 px at 360/1024/1280 |
| 2 | should-fix (pre-existing, WCAG 2.5.3 A) | `dayAriaLabel()` without `locale`, *Day Panel* and every open day panel, all widths, both themes | the name contains the visible day: the long `Intl` date the `locale` branch already builds (`day: 'numeric'`), in English by default → "Wednesday, July 1, 2026" | `toDateString()` → "Wed Jul 01 2026" for visible "1"–"9": axe `label-content-name-mismatch` (`build-panel.log`); English for every locale-less field |
| 3 | nit (backlog) | datepicker panel opened above the field (`r1-flip` 360/1280) | 4 px gap, as below | gap 0: the 4 px `margin-top` sits inside the pane, so above it is on the far side; lc-combobox's list does the same |
| 4 | nit (Known in changelog) | *Default* open at 360 (field 16–344) | ≥ 8 px from the viewport edge | panel end-aligned at x 2 (2–344): any field whose end lies 8–16 px from the right edge (16 px page padding) fits by the CDK check, so no push. lc-app-page fields (x 24) get x 8 |
| 5 | nit (changelog draft, Known) | 200 % text, 360 (`r1-200`) | the 3.30 values | panel 360 × 626 at x 8, 8 px past the right edge inside its padding, title on 2 lines, day cells 37.14 (grid 260); 3.29: 618 wide. Replace "403 px wide" |
| 6 | nit (backlog) | `datepicker.component.ts` `ariaLabel` JSDoc (edited here) | `@default undefined` (CLAUDE.md: every input) | no `@default` (pre-existing) |

**Verdict:** approved. No must-fix; findings 1–2 go to the queue, 3–6 to the backlog or the changelog's Known section.
