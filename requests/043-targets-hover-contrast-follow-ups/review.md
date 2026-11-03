# Review 043: Targets, hover borders and contrast follow-ups of 042

## Round 1 — 2026-11-03, commit 2744fe3 (libs/tools = 682cade)

Screenshots: developer `tmp/story-shots/043/new` (72) and `build` (522, vs `baseline`); mine `tmp/story-shots/043/r1-*` (logs beside them). 12 shots opened: RTE TT 360 L / 1280 D, doc TT 360 L, NC TT 360 L, log TT 360 D, log output focus 1280 L, header scope 360 D / 1280 L, tag TT 360 L, chat TT 360 L, input error hover 360 L, table TT 1280 D.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | **fail** (F1, F2) | `hit.mjs` (logic reviewed) 0 fails at 360/1024/1280 L/D + 320 for NC, log, callout, select, RTE, doc, chat (`tmp/043/new.log`, `w320.log`; NC 320 "Erfolg" only scrolled out of its chip row). Table md: area = cell 44 × 45.5 net; the −21 probe lands on the row border because the box sits 2.25–3 px above the middle, as in 3.27.0 (Deviation 1) → pass by area. Table sm 44 × 37 → exception, undocumented (F2). Tag ×: the new story has no chips (F1); KF story, 1 chip: ± 11 in / ± 13 out pass (`r1-taghit.log`) |
| AC-2 | pass | `diff -rq baseline build`: 174 differ = the design §9 set exactly; tag KF dark ×3 re-shot 3/3 identical (`r1-tag.log`, raster); 276 identical; 72 chat (clock). `scrollWidth − clientWidth` 0 on every row and page at 320/360 |
| AC-3 | pass | `hover.log`: outline hover 7.55 L / 12.16 D in input, select, textarea, datepicker (was 1.89 L). Filled variants: transparent → 1.23 / 1.29, never below rest (design §4; F7) |
| AC-4 | pass | 4 error fields rest = hover 8.39 L / 9.47 D, message colour SAME |
| AC-5 | pass | RTE frame 4.83 / 4.83 L, 7.31 outside / 6.70 inside D (`r1-extra.log`); spec asserts the token |
| AC-6 / AC-7 | pass | `scope.log`: each header identical on a light and a dark page; light header 6.21 / 17.12 / 6.21, dark header 6.21 / 16.32 / 12.13, toggle 7.55 / 12.53; shots 360 D, 1280 L |
| AC-8 | **fail** (F3) | Named stories 40 shots 0 violations (`axe.log`). New stories 66/72 clean; `form-select--touch-targets` target-size ×6 (also `form-select--keyboard-focus` since 042). Prototype of F3: 0 violations in 12 shots (`r1-select2.log`) |
| AC-9 | pass | `log-viewer.output-region.spec.ts` (6); `ring.log`: content `:focus-visible`, inset −2 px, 4.36 L / 9.12 D, one stop after the pills; forced `Highlight` (`ring-forced.log`) |
| AC-10 | pass | Over-limit title 6.58 L / 11.57 D, limit 10.97 / 9.01, count 6.86 / 10.49 (`r1-extra.log`); card inset ring 4.36 / 9.12; axe clean |
| AC-11 | pass | `042/release.md` line 43; both IDs in `index.json` |
| AC-12 | pass | No `*.component.ts` in the diff; hooks unchanged; at rest as AC-2 |
| AC-13 | pass | `ring.log` (11 stories): rings round the visible box (callout 24, checkbox 16, select 20, doc 44); `--forced-colors` 7 stories `Highlight` |
| AC-14 | pass | build.md: compat 22, 94 prerender checks; CSS and static attributes only |
| AC-15 | **fail** (F2, F4) | Changelog draft: see F2, F4 |

### Deviations and findings of build.md

| Item | Decision |
|---|---|
| Deviation 1 (label inline) | **Agreed; my design was wrong.** r1 prototypes: `inline-flex; vertical-align: middle` moves the box from −2.5 to +1.8 px of the cell middle and shrinks `sm` rows 38 → 35 (`r1-table.log`); `flex` centring (≤ 0.5 px) shrinks `sm` rows too, even with `min-block-size: 1lh` (`r1-table-flex.log`, `r1-table-lh.log`). Inline keeps the 3.27.0 position and row heights. design.md §3 fixed (change note) |
| Deviation 2 (`blob:` SVG) | Agreed: the viewer accepts http(s)/blob/relative only; the story is hash-stable in `new/` |
| Deviation 3 (assertions) | Agreed: each row changes exactly what F-22/F-23 change (hover token, `:not(<error>)`, pill 40 → 44); `input.error-class` still pins the 2 state rules |
| Finding A (select axe) | Fix, F3 (prototype below) |
| Finding B (sm table) | Accept as WCAG 2.5.8 exception (cell 44 × 37 px; the row height is the consumer's density choice), but document it (F2) |
| Finding C (header border) | Accept, no change: `th.sortable` is `position: relative` already (measured), so the select header cell now paints that border segment like its sortable neighbours |
| Theme CSS +198 B gzip | Agreed; design D-7/AC-15 said 2.46 kB (block compressed alone), corrected |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix | `form-tag-input--touch-targets`, all widths/themes | six DE chips, two rows at 360 (design §8), each × with a 24 × 24 area that overlaps neither row 2 nor the input; `hit.mjs` lists 6 `tag-remove` lines | empty field: 0 `.lc-tag-input__tag` after 3.7 s (`r1-tagprobe.log`; `ng-pristine` present), 0 `tag-remove` lines in `new.log`. Likely the `tags` prop name; rename it (e.g. `seedTags`) or bind a literal array, then re-run `hit.mjs` 360/1024/1280 L/D |
| 2 | must-fix | `data-display-table--touch-targets` description; changelog Fixed (table) | the `sm` exception stated: "`size="sm"` rows are 37–38 px, so the cell area is 44 × 37 px (WCAG 2.5.8 by size); `md` 44 × 45.5" | description says "44 px × the row height (46 px and more in `md`, the `sm` rows too)"; changelog silent on `sm` |
| 3 | must-fix | `select.component.scss` `.lc-select__clear` | axe 0 on both select stories; rest, hover fill and ring unchanged | target-size ×12. Replace the `::before` with a 24 px box: `width: 1.5rem; height: 1.5rem; margin: -0.125rem; padding: 0.125rem; background-clip: content-box; border-radius: calc(var(--border-radius-sm) + 0.125rem)`, `@include mix.focus-ring($offset: 0)`. Proof (`r1-select`, `r1-select2`): TT rest identical to `new/` 6/6, KF (ring) identical to `baseline` 6/6, svg at 281,28 unchanged, hover fill stays the 20 px circle, axe 0 in 12. Update the spec row with the reason |
| 4 | must-fix | changelog draft | "Stories *Touch Targets* in 9 components"; select × text: "a 24 × 24 px button (layout, hover fill and ring unchanged), so axe `target-size` passes too" | "in 10 components"; select described as a hit area |
| 5 | nit | table, every size | box centred in the row without changing `sm` row height (follow-up **F-30**) | 2.25–3 px above the middle (pre-existing) |
| 6 | nit | filled input/select/textarea/datepicker | a 3:1 field boundary (follow-up **F-31**) | border transparent at rest, 1.23 L / 1.29 D on hover (pre-existing, outside F-23) |
| 7 | nit | textarea error message, light | same ink as the other fields | `rgb(107, 9, 9)` vs `rgb(157, 14, 14)` (both ≥ 4.5; pre-existing) |

**Round 2 checks:** select TT vs `new/` and select KF vs `baseline` (identical), `--axe` 0; tag TT shots + `hit.mjs` (6 chips, 0 fails, no overlap); table TT description; changelog text.

**Verdict:** changes requested (F1–F4).
