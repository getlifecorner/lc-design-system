# Build 028: lc-bar-chart label band and item-aware value formatter

- **Branch:** `feat/3.21-bar-chart-labels-item-formatter` (from `main` 6bf394b)
- **Commit:** `git log -1` on the branch (`feat(bar-chart): labelLayout wrap, valueText and the item formatter`)

## Files changed

| File | Change |
|---|---|
| `lib/bar-chart/bar-chart.component.ts` | `BarChartItem.valueText?`; types `BarChartLabelLayout`, `BarChartValueFormatter`; input `labelLayout` (`'axis'`); `formatValue` typed `BarChartValueFormatter`; `wrapRows`/`wrapColumns`, `paddingBottom` (30, or 2/18 for vertical `'wrap'`), `rows`/`rowZero` (% geometry), one `textOf()` for bars, rows and the aria label; JSDoc per design §2, `@default` on every input |
| `lib/bar-chart/bar-chart.component.html` | `@if (wrapRows())` rows branch (zero line `y1="-25%"` → `y2="125%"`, r2); the SVG unchanged in `@else`, label block `@if (showLabels() && !wrapColumns())` (one block); vertical label row after the SVG |
| `lib/bar-chart/bar-chart.component.scss` | rows, head, label, value, track, zero line (`--color-text-tertiary`, r2), column labels (design §3 table, tokens only, `line-height-tight` = 1.25); `forced-colors` block |
| `lib/bar-chart/bar-chart.label-layout.spec.ts` | new, 30 tests (r2: zero line `y1`/`y2` and its stroke token; revert proof: `y1="0"` + `--color-border` fail 2) |
| `lib/bar-chart/bar-chart.stories.ts` | 5 stories (design §8); argTypes `data`, `labelLayout`, `formatValue` (+ description/default on `orientation`); 2 Key Features bullets and the CSS hooks line |
| `tools/compat/template/src/app/probe-321.ts`, `home.ts`, `home.html`, `tools/compat/check-angular-majors.mjs` | probe (horizontal and vertical `'wrap'`, a one- and a two-argument formatter) and its `EXPECT_IN_HTML` clause |

`bar-chart.component.spec.ts` is unchanged; no existing assertion changed.

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1, AC-9 | spec: default `'axis'`, host has one child (the SVG), no rows/label row; 3.20.0 SVG markup pinned by length + hash (vertical and horizontal, before and after measuring), taken from the 3.20.0 component run side by side in Jest over 224 input combinations (`tmp/028/zz-orig-proof.log`, temp files removed). Revert proof: nesting the label `@if` fails 3 pins. Shots: 42/48 identical to the baseline, the SVG hash equal in all 42; the 6 Custom Format shots: see Deviations |
| AC-2, AC-11 | `tmp/028/measure/wrap.mjs`, Ranking In A Card 360 L/D: content 33–327, labels 1 line from x 33, values end at 327, bars 294 / 169.1 / 73.3, rows 37, chart 143; host 294/294, card 326/326, page 360/360 |
| AC-3 | same at root 32 px: content 65–295 (230), label 1 line, value 2 lines, rows 158, chart 538, all ink inside, no scrolling |
| AC-4 | Ranking Long Labels: 360 value on its own line (171.4–327, row 58); 1024 one line each; 200 % at 360 label 3 lines (hyphenated), value 2; nothing outside the content box |
| AC-5 | Wrapped Column Labels 360: 0 SVG labels, lines 2/2/1, ink gaps 20.5/20.5, label − bar centre 0; 200 %: lines 5/5/3, gaps 9.3/11; spec: plot bottom 198 (182 with a negative value label) |
| AC-6, AC-7, AC-8 | spec: `valueText` wins (both layouts); spy: bars `(value, item)` with the data item, ticks one argument; one-argument formatter; aria "Bar chart: Demo Applikation 313.000,00 · 54,8 %, Demo Arbeitsplatz 180k 17"; explicit `ariaLabel` wins; `''` → label alone. Compat: both formatters compile under strictTemplates and run on the server |
| AC-10 | 5 stories with the design's IDs; argTypes with description and `table.defaultValue` |
| AC-12 | computed on the card: rows 17.74 L / 15.85 D, column labels 7.56 / 11.16; spec on compiled CSS: tokens, `forced-colors` (bar Highlight, zero line CanvasText) |
| AC-13 | spec: rect `x`/`width` in %, unchanged after measuring 294/702, no `[style]`; compat clause: rows, „Demo Arbeitsplatz“, „313.000,00 · 54,8 %“, bar 0% → 100%, no inline style, vertical label row (`aria-hidden`), no SVG labels |
| AC-14 | spec: one `role="img"` with a name in both layouts, tracks `aria-hidden`/`focusable=false`, no `tabindex`/`title`; manifest probe (temp `test:tools` test, removed): `@Input() labelLayout: BarChartLabelLayout = 'axis'`, the new types, 5 story snippets |
| AC-15 | changelog draft below (r2: zero tick and the 200 % column limit, review finding 2) |
| zero line (review r1 #1, design §3/§5/§9) | spec: `y1="-25%"`, `y2="125%"` in every track, stroke `var(--color-text-tertiary)`, track `overflow: visible`. Ranking Negative Values, all 6 shots (`tmp/028/r2/new.log`): line 129.6–147.6 around the bar 132.6–144.6, head bottom 128.6 (1 px gap); 200 %: 346–382 around 352–376 (6 px); stroke rgb(92,102,114) 5.84 L / rgb(147,164,173) 6.71 D on the card; hit test halfway between each bar edge and the line end = the line in all 3 rows at every width/theme. Shots `tmp/story-shots/028/r2-new/…ranking-negative-values--360-light`, `--1280-dark` (tick visible at every bar) |

## Gates

Round 2: all gates on the tree of commit `62014b3` (libs and tools; the amend adds only `requests/028-…`). Later agents skip a gate while `git diff --quiet HEAD -- libs tools` holds. r1 ran on `da6302b`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 210 suites, 4792 passed, 8 skipped (r1 4791; was 209 / 4762 before 028: +1 / +30) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | 122 "Built" lines |
| `npm run test:tools` | r1: 22 passed; not rerun (`tools/` unchanged since `da6302b`) |
| `npx nx run angular-ui-kit:build-storybook` | 968 stories (+5) |
| Story screenshots (r2) | 48 baseline-story shots vs r1 `after`: 48/48 identical, 48/48 SVG hashes equal to r1 (`tmp/story-shots/028/r2-after`, `tmp/028/r2/after.log`). 4 other new stories (24 shots): measures equal to r1 line for line (`tmp/028/r2/new.log` vs `tmp/028/new.log`); Ranking Negative Values: equal to r1 apart from the new `zeroLine` field (re-run with `default(false)`, `tmp/028/r2/neg-check.log`) |
| `check-angular-majors.mjs --only=22` | r1: 86 HTML checks ok, csp build ok; not rerun: the zero line renders only for negative values and the compat probe has none, so its prerendered HTML is unchanged |

## Deviations from the design

1. **Custom Format story:** accepted in review r1 as a story fix (Fixed entry kept).
2. Docs only, beyond design §2 (accepted in r1): `@default` tags on the untouched inputs, description and default on the `orientation` argType, two Key Features bullets and the hooks line in the component description.

## Changelog draft

### Added

- **`lc-bar-chart labelLayout="wrap"`** (finance-intelligence cockpit, gap row 1 of cockpit-2026-11-01, concept `cockpit.md` §5.1 and §7): category labels as HTML text that wraps and follows the text size, instead of one line of SVG text in a fixed 40 px band. A horizontal chart becomes a ranking: per bar the label and its value on one line (the value moves under the label when both don't fit), and below them the bar across the full width. The longest bar fills the width; `height`, `barGap` and `showGrid` don't apply. At 360 px in `lc-card padding="md"` (294 px content), „Demo Applikation“, „Demo Arbeitsplatz“ and „Demo Netz“ show in full on one line each, the values end at the card's content edge, and the bars are 294 / 169.1 / 73.3 px; at 200 % text the value takes 2 lines and nothing scrolls. „Betriebsmittelverwaltung Standort Nord“ puts its value on its own line at 360 px and hyphenates to 3 lines at 200 % (needs `lang`). With negative values every bar grows from a zero line that shows as a 1 px tick 3 px above and below the bar (6 px at 200 % text), in `--color-text-tertiary` (5.84:1 light / 6.71:1 dark on the card); the sign is in the value text. A vertical chart keeps its plot and wraps each label within its column under the chart: no overlap at 360 px (gaps 20.5 px; 9.3 / 11 px at 200 %). Known limit: at 200 % text in a 360 px card each of three columns has 56 px for its label, so words break inside („Dem/o/Appli/katio/n“, 5 lines; the full names stay in the accessible name); for long names on narrow cards use a horizontal `'wrap'` chart. The bars are percentages of their track, so the rows are final in the prerendered HTML. Text contrast on the card: 17.74 / 15.85:1 (rows), 7.56 / 11.16:1 (column labels); in forced colours the bars are Highlight and the zero line CanvasText. CSS hooks `--lc-bar-chart-bar-size` (default `0.75rem`) and `--lc-bar-chart-row-gap` (default `var(--spacing-4)`).
- **`BarChartItem.valueText` and `formatValue(value, item)`** (same gap): a bar can show „313.000,00 · 54,8 %“ with the share from the data, as the item's `valueText` (shown as given, never formatted) or through a formatter that reads the item (`BarChartValueFormatter`, exported; axis ticks pass no item). The generated aria label reads the same text per bar; an explicit `ariaLabel` still wins; an empty `valueText` shows no value.
- Stories: Charts/Bar Chart "Ranking In A Card" (German, 360 px card), "Ranking In A Card English", "Ranking Long Labels", "Ranking Negative Values", "Wrapped Column Labels".

### Fixed

- Story Charts/Bar Chart "Custom Format" now receives its formatter and shows "42%" instead of "0.42".

### Compatibility

- No API breaks: one optional input (default `'axis'`), one optional item field and an optional second formatter argument. With `'axis'` the SVG is byte-identical to 3.20 (every bar-chart story at 360/1024/1280 px in both themes). `formatValue` is typed `BarChartValueFormatter` = `(value: number, item?: BarChartItem) => string`: one-argument formatters, `Intl.NumberFormat#format` and `String` work unchanged. A formatter whose second parameter means something else, such as `(v: number, digits?: number) => …`, now receives the item there, and TypeScript flags it under `strict`. A formatter that returns `''` now leaves the label alone in the generated aria label (before: the label and a trailing space).
