# Review 032: lc-skeleton applies a percentage width twice

## Round 1 — 2026-11-02, commit caa6773 (libs/tools = gate commit 9508977)

Screenshots: `tmp/story-shots/032/r1/` (widths 360 · 1024 · 1280, light · dark). Storybook build of the developer, not stale. Unchanged set: 6 stories × 3 × 2 `--full --compare=baseline` → **36/36 identical** (incl. `today-loading` 360 dark). Changed set: 6 stories × 3 × 2 with `--measure` (host/fill boxes, rows, card, gaps, fill colour, scroll width), `--compare=build` → 36/36 identical to the developer's shots. Opened 6: percentage-widths 360 L/D + 1280 L, table-loading 360 L, user-card 360 L, dashboard-grid 360 L.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | text-block (400 px block) at 1024: 70 % host = fill = 280, 45 % = 180 (3.22.1 fills 196 / 81, `before-changed.log`); percentage-widths ratios 0.6000 / 0.3000 / 0.8000 / 0.1500 at all widths; table-loading 30 % of 328 = 98.39 |
| AC-2 | pass | max \|fill − host\| = 0 px in all 36 changed shots (14 skeletons per percentage-widths shot); `skeleton.width.spec.ts` matrix (host `30%` … `calc(100% - 2rem)`, defaults `100%`/`40px`; fill `100%`) |
| AC-3 | pass | `skeleton.component.spec.ts` l. 31/47 → `'100%'` with the reason as comment, l. 22 was already `'100%'`; host lines unchanged |
| AC-4 | pass | 36/36 identical to `baseline` (line, circle, rectangle, height-from-container, today-loading, state-page-loading) |
| AC-5 | pass | 360: row 294 (x 33–327), A 176.39 / 88.19, B 235.19 / 44.09, second right 327, end gap 0, page scroll 360. 1024/1280: row 446 (x 33–479), A 267.59 / 133.8, B 356.8 / 66.89, right 479. Card 328/480 × 236, gaps 12 / 8 — all = design §9 |
| AC-6 | pass | height spec: height/radius/class/host width unchanged (circle fill width see deviation 1); styles spec unchanged; height-from-container hash-identical; fill computed `rgb(230,239,241)` light, `rgba(132,199,212,.07)` dark = tokens |
| AC-7 | pass | user-card circle 48 × 48 at 360, hosts identical to 3.22.1 (93.59 / 152.09 / 117); spec: circle host `40px`, `flex-shrink: 0`, fill `100%` |
| AC-8 | pass | spec: host `style="width: 30%; flex-shrink: 0;"`, fill `…; width: 100%;` (finding 2) |
| AC-9 | n/a | no text, no semantics |
| §8 Table Rows Loading | pass | last host right = row right 344 (360) / 516 (1024); spaces 10.94 / 16.67 px; no overflow |
| §2 API | pass | JSDoc of `width` = §2 sentence; `@default` on all 4 inputs; argTypes `table.defaultValue` ×4, `width` description, docs paragraph **Width (3.22.2)**; story name and id as §8 |

### Deviations in build.md

| # | Decision |
|---|---|
| 1 | **Confirmed.** The circle row of AC-17 in `skeleton.height.spec.ts` asserts the fill `width`; AC-2 (and design §9 AC-2) require `100%` on every fill, so §9 AC-6 "unchanged" contradicted AC-2. The changed line is the fix itself; height, radius, class, host width and `flex-shrink` stay asserted, and the circle story is hash-identical. design.md §9 AC-6 has a change note. |
| 2 | **Confirmed.** Angular writes the `[style]` map as `border-radius; height; width` (same keys as 3.22.1, same order). Declaration order of distinct properties has no rendering effect. design.md §2 sketch corrected with a change note. |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | nit | build.md changelog draft | The "`px`, `rem` and the defaults render byte-identical (36 shots …)" bullet under *Compatibility* (it states what did not change) | Under *Fixed*. Release-manager may move it |
| 2 | nit | AC-8 evidence | A server render or an `EXPECT_IN_HTML` line | TestBed (jsdom) serialisation; compat prerender has `lc-skeleton` (`home`, `tt-today width="200px"`) but asserts no skeleton style. Static host/style bindings serialise the same on the server; no action for this patch |

**Verdict:** approved
