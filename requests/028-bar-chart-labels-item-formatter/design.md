# Design 028: lc-bar-chart label band and item-aware value formatter

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-15
- **Baseline:** `tmp/story-shots/028/baseline` (8 bar-chart stories, 360/1024/1280, light/dark, `--full`, 48 shots, main 6bf394b), log `tmp/story-shots/028/baseline.log` with an SVG hash per shot (measure in §9)
- **Change note (review r1, 2026-11-02):** the zero line was specified as a 1 px `--color-border` line inside the track only. Every bar starts or ends at zero, so the bar covered it, and the build showed no zero line at all (4× zoom: 0.5 px slivers at the rounded corners). Corrected in §3, §4, §5 and §9: the line reaches 25 % of the bar size past the track at both ends (`y1="-25%"`, `y2="125%"`), in `--color-text-tertiary`. Prototyped in `tmp/story-shots/028/r1-zero-proto2`.

## 1. Approach

Extend `lc-bar-chart` with one opt-in input, `labelLayout`, for both orientations, plus `valueText` and an item argument for `formatValue`.

- **Why HTML labels.** SVG text can't wrap, and a wrap point needs the DOM. That rules out prerendering (AC-13), and at 200 % text the rem-sized labels outgrow the fixed px bands (AC-3). HTML text wraps by itself, follows text zoom and is in the server HTML. Measured today at 360 in a card: horizontal labels start at x −30 (63 px left of the card content), and vertical labels overlap by 13.3 px.
- **Why not `labelWidth`.** At 360 a side band costs the bars about a third of 294 px, and the 14 px "Demo Arbeitsplatz" (119.5 px) still wraps. With the label above each bar, the bar gets the full width. This is the requester's own layout (`cockpit.md` §5.1: name and amount on a line, bar below).
- **Why opt-in for vertical too.** An automatic fix needs a measurement (it would overlap before JS and run on every chart) or a guess at the character width. Moving the labels out of the SVG for everyone would break AC-9. Opt-in keeps every existing chart byte-identical.
- **Patterns followed.** Wrapping text: `hyphens: auto` + `hyphenate-limit-chars: 12 4 3` + `overflow-wrap: break-word` (lc-toast, lc-drawer). Forced colours: bar `Highlight` (lc-progress-bar 3.17). Row typography: the donut-chart legend's `--typography-font-size-sm`. Bar size `0.75rem`: lc-progress-bar `lg`, which is what the requester used.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | `labelLayout` | `BarChartLabelLayout` | `'axis'` | How the category labels are set. `'axis'`: one line of SVG text on the category axis, in a fixed 40 px band left of a horizontal bar or centred under a vertical column. Long labels can run out of the chart. `'wrap'`: HTML text that wraps to the room it needs and follows the text size. A horizontal chart becomes a list of rows: the label and the value on one line (the value moves under the label when both don't fit), and below them the bar across the full width. The longest bar fills the width, and `height`, `barGap` and `showGrid` don't apply. A vertical chart keeps its plot and wraps each label within its column, under the chart. `@default 'axis'` |
| input (changed type) | `formatValue` | `BarChartValueFormatter` | `formatChartValue` | Formats the value labels and the axis ticks. For a bar it gets the bar's item as the second argument; for an axis tick it gets the tick only (`item` is `undefined`). An item's `valueText` takes precedence. `@default` float-safe `String(value)` |
| item field | `BarChartItem.valueText?` | `string` | `undefined` | The text shown as this bar's value and read in the generated aria label, instead of `formatValue(value, item)`, for example "313.000,00 · 54,8 %". The kit shows it as given and never formats or computes it. An empty string shows no value for this bar. |
| type | `BarChartLabelLayout` | `'axis' \| 'wrap'` | — | exported from `@lifecorner/angular-ui-kit/bar-chart` |
| type | `BarChartValueFormatter` | `(value: number, item?: BarChartItem) => string` | — | exported from the same entry; `ChartValueFormatter` (internal, 10 other charts) is unchanged |
| CSS hook | `--lc-bar-chart-bar-size` | length | `0.75rem` | Thickness of a bar in the horizontal `'wrap'` rows |
| CSS hook | `--lc-bar-chart-row-gap` | length | `var(--spacing-4)` | Space between the horizontal `'wrap'` rows |

- **JSDoc additions on existing inputs** (text only, no change in behaviour): `height` ("A horizontal `'wrap'` chart takes the height of its rows; a vertical `'wrap'` chart adds its label row below this height"), `barGap` and `showGrid` ("Not used by horizontal `'wrap'` rows"), `showValues` ("In horizontal `'wrap'` rows the value sits at the end of the label line").
- **Hooks** are never declared on `:host`. Read them only at the point of use: `var(--lc-bar-chart-bar-size, 0.75rem)` (pitfall 020).
- **Precedence per bar (AC-8):** `text = item.valueText ?? fmt(value, item)`. Bar value labels, `'wrap'` rows and `effectiveAriaLabel` all use this one text. Each aria part is `` `${label || `Bar ${i + 1}`} ${text}` ``, or the label alone when `text === ''`. Ticks stay `fmt(tick)`, with one argument.
- **Default rendering unchanged:** with `'axis'` the template takes the existing SVG branch with the same bindings, and `PADDING_BOTTOM` stays 30. `formatChartValue` ignores the second argument. The label `@if` becomes `@if (showLabels() && !wrapColumns())`: it stays **one** block, so the SVG's `<!---->` anchors stay identical. Don't nest a new block inside the `<svg>`, because the baseline hash includes the comments.
- **Compatibility (changelog line):** a formatter whose second parameter means something else, such as `(v: number, digits?: number) => …`, now receives the item there. Under `strict`, TypeScript flags it, because the parameter types don't match. One-argument formatters, `Intl.NumberFormat#format` and `String` are unaffected.

## 3. Anatomy and layout

### Horizontal `'wrap'`, 360 px: `lc-card variant="outlined" padding="md"` (content x 33–327, 294 wide; measured prototype)

```
x 16 17   33                                                  327   343 344
   │card│pad│                                                    │pad│card│
          Teuerste Services                  (card title, header divider)
          Plan 2026 in €
          Demo Applikation           313.000,00 · 54,8 %   ← head 21 (14/21); label 113.8, value 137.4 (600)
          ↕ 4 (spacing-1)
          ████████████████████████████████████████████████   bar 294 × 12, rx 2, x 33
          ↕ 16 (--lc-bar-chart-row-gap)
          Demo Arbeitsplatz          180.000,00 · 31,5 %
          █████████████████████████████                       169.1
          Demo Netz                   78.000,00 · 13,7 %
          ████████████                                        73.3
          row 37 = 21 + 4 + 12 · chart 143 = 3 × 37 + 2 × 16 · value right edge = 327 = bar max
```

| Case | Measured (prototype) |
|---|---|
| Long label, 360: "Betriebsmittelverwaltung Standort Nord" (256.6) + gap 8 + value (146.1) > 294 | label 1 line full width; value on its own line, right-aligned (x 171.4–327); row 58 |
| 200 % text, 360 (story pad 32, card pad 32): content x 65–295, 230 wide | label 1 line (42); value 2 lines, breaking after "·" (84); bar 24; row 158; gap 32; chart 538; card `scrollWidth = clientWidth` (294) |
| 200 %, long label | label 3 lines, hyphenated (`lang="de"`); no scrolling |
| 1024 / 1280: story card `max-width: 46rem` (736, content 702 at x 33) | label left, value right (592.9–735); bars 702 / 403.6 / 174.8; row 37 |

Geometry (no DOM, server-safe): `lo = min(0, …values)`, `hi = max(0, …values)`, `range = hi − lo || 1`. Bar `x = (min(v,0) − lo) / range × 100 %` and `width = |v| / range × 100 %`, written as SVG attributes on a `<svg width="100%">` per row. Use no inline `style`, because under CSP the server writes `style=""` (pitfall 011). When `lo < 0`, every track draws a zero line at `(0 − lo) / range × 100 %` under the bar.

### Vertical `'wrap'`, 360 px in the same card (host 294, plot x 73–317, 3 slots × 81.3)

```
   ticks │      ███                                        SVG: height input (200), PADDING_BOTTOM 2
   (0–40)│      ███          ███                                (18 when showValues and a value < 0)
         │      ███          ███          ███
         └──────────────────────────────────────┘ ← plot bottom = SVG bottom − 2
           ↕ 4 (label row padding-top, spacing-1)
              Demo           Demo        Demo Netz       11 px / LH 1.25 (13.75), text-secondary, centred
          Applikation    Arbeitsplatz                    2 / 2 / 1 lines, row 31.5; ink gaps 20.5 / 20.5
   x 33 │40│ 73 ─ 81.3 ─┼─ 81.3 ─┼─ 81.3 ─ 317 │10│ 327   label centres 113.7 / 195 / 276.3 = bar centres
```

Label row: `display: flex; padding-inline: 40px 10px` (= `PADDING_LEFT`/`PADDING_RIGHT`). Cells: `flex: 1 1 0%; min-width: 0; padding-inline: 2px`. Before the ResizeObserver runs, the SVG is scaled from its 400 viewBox, so the label centres can be up to about 10 px off for that first frame. Nothing overflows, and they align once the observer runs. At 200 % the three labels take 5 / 5 / 3 lines with gaps of 9.3 / 11, and nothing overlaps.

| Element | Size | Type | Token |
|---|---|---|---|
| row head | flex wrap, `align-items: baseline`, column-gap 8 | 14/21 | `--typography-font-size-sm`, `--typography-line-height-normal`, `--spacing-2` |
| row label | `flex: 1 1 auto; min-width: 0`, wraps | 400 | `--color-text-primary`, `--typography-font-weight-normal` |
| row value | `margin-inline-start: auto; min-width: 0; text-align: end`, `tabular-nums`, `break-word` | 600 | `--color-text-primary`, `--typography-font-weight-semibold` |
| head → bar | 4 | — | `--spacing-1` |
| bar | 100 % track × `--lc-bar-chart-bar-size`, rx 2, `fill` = `color` / `item.color` / palette | — | as the default bars |
| zero line | 1 px, `y1="-25%"` → `y2="125%"` of the track (3 px past each end at the 12 px default, 6 px at 200 %; the track is `overflow: visible`), under the bar, only when `lo < 0`. At 360 the top end is 1 px below the head's line box (129.6 vs 128.6) | — | stroke `--color-text-tertiary` (r1; was `--color-border`) |
| column label | `padding-top: 4`, cell padding 2 | 0.6875rem / 1.25 | `--color-text-secondary` (the same as the SVG label) |

## 4. States

| State | Horizontal `'wrap'` | Vertical `'wrap'` |
|---|---|---|
| default | as in §3 | as in §3 |
| hover / focus-visible / active / disabled / loading | none: a static image, no tab stop, no hover dimming on the row bars | unchanged SVG (bar hover opacity as today) |
| empty (`data = []`) | the `role="img"` container named "Bar chart: no data", with no rows (height 0); the page shows its own empty state | SVG axes as today, no label row |
| error / NaN | `toFinite` → 0: zero-width bar, value text as resolved | as today |
| `showLabels=false` / `showValues=false` | the head shows only the other one; with both false, no head (the row is the bar alone) | no label row; padding as above |
| empty `valueText` / label | no value span / no label span; aria uses "Bar n" | empty cell |
| negative values | zero line as a tick 3 px above and below every track (visible next to every bar, r1); bars grow left from it; the sign is in the text (U+2212 in stories) | as today, plus 16 px room for the value labels below |
| long German words | `hyphens: auto` + limit `12 4 3` (needs `lang`), then `break-word` | the same in the cell |
| long value text | wraps at its spaces ("313.000,00 ·" / "54,8 %"), then `break-word` | — |
| many items | rows stack (53 px each at 100 %); the chart grows | slot = plot / n; with fewer than about 20 px per column even "Jan" breaks inside the word (known limit; keep `'axis'` for many short labels) |

## 5. Theming

| Element | Light | Dark | Contrast (computed, WCAG, min over surface, surface-2/neutral-50 gradient end, background) |
|---|---|---|---|
| row label, row value | `--color-text-primary` rgb(17,24,39) | rgb(241,246,248) | 16.98 L (on #f9fafb) / 13.16 D (on surface-2 rgb(26,44,58)) |
| column label | `--color-text-secondary` rgb(75,85,99) | rgb(196,210,217) | 7.23 L / 9.26 D |
| bar fill | palette / `color` (unchanged) | same | — (each value is in text) |
| zero line (r1) | `--color-text-tertiary` rgb(92,102,114) | rgb(147,164,173) | 5.84 L (card #fff) / 6.71 D (card rgb(16,28,38)), 7.31 on the dark page; decorative (each value is in text) |

No new tokens. `forced-colors: active` (new layout only): text uses `color`, so it becomes CanvasText. `.lc-bar-chart__row-track { forced-color-adjust: none }`, with the bar `fill: Highlight` and the zero line `stroke: CanvasText`. Column labels are HTML and become CanvasText.

## 6. Accessibility

- **Horizontal `'wrap'`:** `<div class="lc-bar-chart lc-bar-chart--rows" role="img" [attr.aria-label]="effectiveAriaLabel()">`. Its text children are presentational, so they aren't read twice. Each track `<svg>` has `aria-hidden="true" focusable="false"`. There is no `title` attribute (a different title stutters as the description, pitfall 015).
- **Vertical `'wrap'`:** the SVG keeps `role="img"`, `aria-label` and `<title>`. The label row `<div class="lc-bar-chart__category-labels">` is `aria-hidden="true"`, because its names are already in the SVG's name.
- No new tab stop and no 44 px targets (nothing is interactive). Reduced motion: the rows have no transition. The text follows zoom and `lang`-based hyphenation.

## 7. Texts

No new built-in strings. The existing English ones ("Bar chart: …", "Bar chart: no data", "Bar n") stay replaceable through `ariaLabel`, as in all 13 charts. A chart-wide prefix input is a possible follow-up, not this request.

| Story text | EN | DE |
|---|---|---|
| card title / subtitle | Most expensive services / Plan 2026 in € | Teuerste Services / Plan 2026 in € |
| labels | Demo application, Demo workplace, Demo network | Demo Applikation, Demo Arbeitsplatz, Demo Netz |
| value | 313,000.00 · 54.8% (formatter) | 313.000,00 · 54,8 % (`valueText`, NBSP before %) |
| explicit `ariaLabel` (DE story) | — (generated: "Bar chart: Demo application 313,000.00 · 54.8%, …") | "Teuerste Services: Demo Applikation 313.000,00 · 54,8 %, Demo Arbeitsplatz 180.000,00 · 31,5 %, Demo Netz 78.000,00 · 13,7 %" |

Checked at 360 and at 200 % (§3).

## 8. Stories

All new stories render `lc-card variant="outlined" padding="md" style="max-width: 46rem"` with `lang` on the card, a title and a subtitle, and `orientation`, `labelLayout="wrap"` and `color="var(--color-primary-500)"` (horizontal ones). Bind only args the story declares: an undeclared `[height]` binding passes `undefined` (pitfall 023). argTypes: `labelLayout` (select `axis`/`wrap`), `formatValue`, and `data` (mention `valueText`), each with `description` and `table.defaultValue`. Existing stories stay unchanged.

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Ranking In A Card | `charts-bar-chart--ranking-in-a-card` | DE, 313000/180000/78000 with `valueText`, explicit DE `ariaLabel` | AC-2, 3, 10, 11, 12 |
| Ranking In A Card English | `charts-bar-chart--ranking-in-a-card-english` | EN, items `{ share }` (extends `BarChartItem`), `formatValue: (v, item) => item ? en(v) + ' · ' + pct(item.share) : en(v)` (en-GB, 2 decimals / percent 1 decimal), generated aria | AC-7, 8, 10 |
| Ranking Long Labels | `charts-bar-chart--ranking-long-labels` | DE: "Betriebsmittelverwaltung Standort Nord" 1.234.567,89 · 61,2 %, "Rechenzentrumsinfrastruktur Süd" 512.000,00 · 25,4 %, "Demo Netz" 271.000,00 · 13,4 % | AC-4 |
| Ranking Negative Values | `charts-bar-chart--ranking-negative-values` | DE "Ergebnis je Service": 120000 / −45000 / 30000, `valueText` "120.000,00", "−45.000,00", "30.000,00" | zero line, negative rows |
| Wrapped Column Labels | `charts-bar-chart--wrapped-column-labels` | vertical, DE labels as AC-5, values 313/180/78, subtitle "Plan 2026 in Tsd. €" | AC-5 |

## 9. Verification

Measures at 360/1024/1280 L/D; root font size `32px` for 200 % (wait 700 ms). Content box = the card's padding box.

| AC | How | Expected |
|---|---|---|
| AC-1 | unit: default `labelLayout()` is `'axis'`, so no `.lc-bar-chart__row` or `__category-labels`; existing spec unchanged | pass |
| AC-2 | ranking-in-a-card 360: Range rects of `__row-label`/`__row-value`, `rect` boxes; host and card `scrollWidth ≤ clientWidth` | labels 1 line at x 33; value right 327; bars 294 / 169.1 / 73.3 (±0.5); no scrolling |
| AC-3 | the same at 200 % | content 230; label 1 line, value 2 lines, all ink within 65–295; card scroll = client |
| AC-4 | ranking-long-labels 360 and 1024, 100 % and 200 % | 360: value on its own line, right-aligned; 1024: 1 line each; 200 %: label 3 lines, hyphenated; nothing outside the content box |
| AC-5 | wrapped-column-labels 360: ink gap between neighbour labels; label vs bar centres | gaps ≥ 4 (expected 20.5 / 20.5); centres within 0.5; no `.lc-bar-chart__label` in the SVG |
| AC-6, 7, 8 | unit: `valueText` wins; `formatValue` spy gets `(value, item)` for bars and `(tick)` with `item === undefined` for ticks; aria string "Bar chart: Demo Applikation 313.000,00 · 54,8 %, …"; explicit `ariaLabel` wins; `''` → label only. Compat app: a one-argument and a two-argument formatter pass strictTemplates | pass |
| AC-9 | `story-shots --stories=<8 baseline ids> --widths=360,1024,1280 --themes=light,dark --full --compare=tmp/story-shots/028/baseline` with the baseline's SVG-hash measure (pass the text of `tmp/story-shots/028/svg-hash-measure.js` inline as `--measure='…'`; the baseline values are in `baseline.log`) | 48/48 identical; every `svg.hash` equals the baseline |
| AC-11 | ranking-in-a-card 360 | value right ≤ 327, longest bar right = 327 |
| AC-12 | computed colours in both themes + stylesheet scan for the `forced-colors` rule | ≥ 16.98 L / 13.16 D (rows), 7.23 / 9.26 (column labels) |
| zero line (r1) | unit: `y1="-25%"`, `y2="125%"`; ranking-negative-values 360/1280 L/D: line box top 129.6 / bottom 147.6 around the bar 132.6–144.6, stroke contrast on the card | 5.84 L / 6.71 D; the other 4 new stories and the 48 baseline shots unchanged |
| AC-13 | unit: horizontal `'wrap'` rect `width`/`x` end in `%`, independent of `_containerWidth`; compat `EXPECT_IN_HTML`: row label "Demo Arbeitsplatz" and value "313.000,00 · 54,8" in the prerendered HTML | pass |
| AC-14 | unit: `role="img"` + non-empty name in both layouts, no `[tabindex]`; `npm run test:tools` shows `labelLayout` with `@default` | pass |
| AC-15 | review of the Added and Compatibility entries (gap finance-intelligence cockpit-2026-11-01 row 1, "no API break", formatter caveat §2) | present |

**Risks named for the build:** the SVG comment anchors (§2); no inline `style` in the new layout (CSP); `lang` on the story card for hyphenation; a measure must query `#storybook-root lc-bar-chart`, not the docs table; the forced-colours fill.
