# Review 028: lc-bar-chart label band and item-aware value formatter

## Round 1 — 2026-11-02, commit 4887883

Screenshots: the developer's `tmp/story-shots/028/new` (5 stories × 360/1024/1280 × L/D) and `after` (48 baseline shots); mine are `r1` (360 L/D, hooks/AX/forced-colors measure in `r1-measure.js`), `r1-200` (200 %, 360 L), `r1-zero` (4× zoom) and `r1-zero-proto2` (the fix prototype). Storybook build 23:46 = tree of `da6302b` = HEAD for `libs tools`.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `labelLayout` `'axis'` default (ts, JSDoc `@default 'axis'`); spec; 42/48 baseline shots identical |
| AC-2 | pass | ranking-in-a-card 360 (`tmp/028/new.log`): labels 1 line from x 33, values end at 327, bars 294 / 169.1 / 73.3 (rect widths 100 % / 57.508 % / 24.920 %), rows 37, chart 143; host 294/294, card, page 360/360 |
| AC-3 | pass | 200 %: content 65–295; labels 1 line, values 2 lines; my run: card scroll = client (296/296), doc 360/360 (`r1-200`) |
| AC-4 | pass | long labels 360: value on its own line, 171.4–327, row 58; 1024/1280 one line each (shot 1280 D); 200 %: "Betriebsmittelver-/waltung Standort/Nord", "Rechenzentrums-/infrastruktur Süd" (3/2 lines, hyphenated), nothing outside (shot `r1-200`) |
| AC-5 | pass | wrapped-column-labels 360: 0 SVG labels, lines 2/2/1, gaps 20.5/20.5, centre deltas 0; 200 %: 5/5/3, gaps 9.3/11 (see finding 3) |
| AC-6, 7, 8 | pass | DE name "Teuerste Services: Demo Applikation 313.000,00 · 54,8 %, …" (explicit), EN generated "Bar chart: Demo application 313,000.00 · 54.8%, …", negative "…Demo Arbeitsplatz −45.000,00, …"; spec + compat for the formatter types |
| AC-9 | pass | 42/48 identical by PNG and SVG hash; Custom Format: deviation 1 accepted (below) |
| AC-10 | pass | 5 story IDs as design §8; argTypes `data`, `labelLayout`, `formatValue`, `orientation` with description and `table.defaultValue` |
| AC-11 | pass | value right 327 = longest bar right 327 (360) |
| AC-12 | pass | text on the card 17.74 L / 15.85 D (rows), column labels 7.56 L / 11.16 D; `@media (forced-colors)`: track `forced-color-adjust: none`, bar `Highlight`, zero line `CanvasText` (stylesheet scan, `r1`) |
| AC-13 | pass | rect `x`/`width` in %, 0 `[style]` in the host (`r1`); compat clause (build.md) |
| AC-14 | pass | one `role="img"` per chart (DIV rows / SVG columns), no `title` attribute, SVG `<title>` = name, 0 tab stops, tracks `aria-hidden="true"`/`focusable="false"`, label row `aria-hidden` |
| AC-15 | pass | Added (gap row 1, cockpit-2026-11-01), Compatibility "No API breaks" + formatter caveat; see finding 2 |

API vs design §2: names, types, defaults and JSDoc match; `BarChartLabelLayout` and `BarChartValueFormatter` exported through `export *`. Hooks read at the point of use: on the card (an ancestor) `--lc-bar-chart-bar-size: 1.5rem` → track 24, `--lc-bar-chart-row-gap: 0px` → gap 0; defaults 12 / 16, restored after removal.

**Deviation 1 (Custom Format):** accepted as a story fix. The story now shows what its description says ("42%", "100%", ticks "0%"–"100%"; shot `after/…custom-format--360-light`); the SVG grows by 5 characters (2823 → 2828 at 360) for the formatted strings only, and Jest renders 3.20.0 and 3.21 identically for equal inputs. Keep the Fixed entry. **Deviation 2** (`@default` on the untouched inputs, `orientation` argType text, Key Features): accepted.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix (design error, corrected in design.md §3/§4/§5/§9) | ranking-negative-values, all widths, L/D | A visible zero line at every negative-value track: `y1="-25%"`, `y2="125%"` (3 px past both ends at the default 12 px bar), `stroke: var(--color-text-tertiary)`: 5.84 L / 6.71 D on the card. Prototype `r1-zero-proto2`: line 129.6–147.6 around the bar 132.6–144.6, 1 px below the head line box (128.6). Update the spec (y1/y2, token) | `y1="0"`, `y2="100%"`, `--color-border` #d7ebef: every bar starts or ends at zero and covers it; no zero line in the 1× shots, at 4× only 0.5 px slivers at the rounded corners (`r1-zero`). The story text "a zero line runs through every track" is untrue |
| 2 | should-fix | changelog draft, Added | After the fix, name the zero tick for negative values; for vertical `'wrap'`, add that at 200 % text three columns in a 294 px card are 56 px wide and words break inside | Neither is mentioned |
| 3 | nit (known limit, design §4) | wrapped-column-labels, 360, 200 % | — | "Dem/o/Appli/katio/n", "Dem/o/Arbei/tsplat/z", "Dem/o/Netz" (5/5/3 lines, `r1-200`). No overlap, full names in the SVG's accessible name. A horizontal `'wrap'` chart is the answer for long names on narrow cards; no change in behaviour |

**Round 2 scope:** re-shoot ranking-negative-values (6 shots) with the zero-line measure of design §9. The other 4 new stories must not change: compare them by measure, not by hash, because two at-rest runs of this build already differ in 3 light shots at 360 (`diff -rq new r1`). The 48 baseline shots must stay identical (the zero line renders only when `lo < 0`).

**Verdict:** changes requested

## Round 2 — 2026-11-02, commit 62014b3 (HEAD 293f69b: same tree for `libs tools`)

Code delta since r1: `y1="-25%"`/`y2="125%"`, stroke `--color-text-tertiary`, 2 spec assertions + 1 test (`git diff 4887883 62014b3 -- libs`). The Storybook build has the fix (story-shots ran without a staleness warning, and the measure finds the line outside the bar). My shots: `tmp/story-shots/028/r2` (ranking-negative-values, 360/1024/1280 × L/D). The measure is in `r2-measure.js`; it covers the line box, ink clearance, 200 %, both hooks and the forced-colors rule.

| AC | Result | Evidence |
|---|---|---|
| AC-1…8, 10, 11, 13, 14 | pass | unchanged from r1: the other 4 new stories have identical measures (24/24 lines, `tmp/028/new.log` vs `tmp/028/r2/new.log`). The only 12 differing lines are the negative-values story, r1 vs r2 |
| AC-9 | pass | `diff -rq baseline r2-after`: only the 6 Custom Format shots differ (deviation 1, accepted in r1). `diff -rq after r2-after`: 48/48 identical |
| AC-12 | pass | zero line rgb(92,102,114) on #fff **5.84** L, rgb(147,164,173) on rgb(16,28,38) **6.71** D (computed). `forced-colors`: `.lc-bar-chart__zero-line { stroke: canvastext }` |
| AC-15 | pass | finding 2 fixed: Added names the zero tick (3 / 6 px, token, 5.84 / 6.71) and the 200 % column limit (56 px, „Dem/o/Appli/katio/n“, the advice to use horizontal `'wrap'`) |
| zero line (r1 #1) | pass | 360/1024/1280 L/D at 100 %: line 129.6–147.6 around the bar 132.6–144.6 (3 px each side), head bottom 128.6 (1 px gap), 3 lines, 1 px. 200 %: 346–382 around 352–376 (6 px), head bottom 344. Ink clearance (descender above / ascender below, worst glyph of the row): 3.4 / 18.6 px at 100 %, 9 / 37.3 px at 200 %. Shots 360 L and 1280 D: a tick shows at every bar, both themes. The story text "a zero line runs through every track" is now true. Restored after the measure: yes |

My light shots differ from the developer's `r2-new` by hash (3/6) but have identical measures. These are the same light-shot raster flips seen in r1, not a change.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | fixed | zero line | design §3/§5/§9 | as designed (table above) |
| 2 | fixed | changelog draft | zero tick + 200 % column limit | both present (build.md, Added) |
| 3 | nit (open, known limit) | wrapped-column-labels, 360, 200 % | — | unchanged from r1 |
| 4 | nit (open, known limit, my design) | `'wrap'` rows with negative values and a large `--lc-bar-chart-bar-size` | the tick stays clear of the label ink | The tick is 25 % of the bar size. The head→bar gap is a fixed 4 px. At `1.5rem` (24 px) the 6 px top tick reaches 2 px into the head's line box. Worst-case ink clearance: 0.4 px above. With `--lc-bar-chart-row-gap: 0px` as well it is −0.4 px below, touching an ascender if one sits exactly at the zero x (the story's x: 3 / 0.7 px). From about `2rem` up, descenders at the zero x touch the tick. The tick is decorative and each value is in text. No change now; if a consumer reports it, cap the tick, e.g. at `min(25 %, gap − 1 px)` |

**Verdict:** approved. No must-fix. Nits 3 and 4 stay open for the release notes.
