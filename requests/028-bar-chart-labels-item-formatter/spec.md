# Spec 028: lc-bar-chart label band and item-aware value formatter

- **Status:** ready
- **Type:** extension of `lc-bar-chart`
- **Affected:** `libs/angular-ui-kit/src/lib/bar-chart/` (ts, html, scss, spec, stories), `internal/chart/chart-scale.ts` (formatter type, only if shared), CHANGELOG, both READMEs only if the component text changes
- **Semver impact:** minor. Only optional inputs and an optional second formatter argument are added; every default renders as before.

## Need

Finance Intelligence cockpit, card "Teuerste Services" (`cockpit.md` §5.1), `lc-card padding="md"` at 360 px, German.

1. Horizontal `lc-bar-chart` reserves a fixed 40 px (`PADDING_LEFT`) for the category labels. „Demo Applikation“, „Demo Arbeitsplatz“ run out of the chart and over the card edge. In the vertical orientation the labels under the columns overlap at 360 px.
2. `formatValue` is `(value) => string`, so a bar can only show its own value. A ranking needs „313.000,00 · 54,8 %“; the share comes from the API and the page must not calculate it.

The requester built the chart from `lc-progress-bar`, `lc-typography` and `lc-stack` and will switch once the kit can do this.

## What the kit has today

- `lc-bar-chart`: `data` (`BarChartItem` = `value`, `label?`, `color?`), `orientation`, `showValues`, `showLabels`, `height`, `width`, `formatValue: ChartValueFormatter`, `ariaLabel`. Label band is the private constant `PADDING_LEFT = 40`; no input changes it. Value labels and the generated aria label both call `formatValue(value)`.
- `formatValue` is also called for the axis ticks (`gridLines`), which have no item. That is why the item cannot simply become a required second argument.
- No other chart takes a label width or item-aware formatter (`ChartValueFormatter` is shared by 10 components, so its type stays unchanged).
- Nothing solves it with existing hooks, so a build is needed.

## Scope

- In: (a) labels that fit in the horizontal orientation, (a2) non-overlapping labels in the vertical orientation at 360 px, (b) per-bar text that can come from the data item and is used in the visible label and in the generated `aria-label`.
- Not in: other chart components, a new shared formatter type for all charts, computing or rounding shares in the kit, number or locale formatting of the item text, new colours or tokens, a changed look of the default chart.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | New optional input for the horizontal orientation that gives the labels room: either a label position (`'start'` default, plus a mode with the label above each bar) or a label width (number or `'auto'`). The designer chooses; the default renders the same as today. | unit test on the default; design.md |
| AC-2 | At 360 px inside `lc-card padding="md"`, a horizontal chart with „Demo Applikation“, „Demo Arbeitsplatz“, „Demo Netz“ shows each label in full (wrapped, not clipped, not overlapping), inside the card; the SVG and the host have `scrollWidth <= clientWidth`. | story + `--measure` at 360 |
| AC-3 | The same at 200 % text size (browser text zoom or root font-size 32 px) without horizontal scrolling on the card; labels stay readable and not clipped. | story + `--measure` |
| AC-4 | Longer German labels (for example „Betriebsmittelverwaltung Standort Nord“) wrap or truncate with the full text still available to assistive technology (`title`/aria), never overflow the card. | story DE at 360 and 1024 |
| AC-5 | Vertical orientation: category labels do not overlap at 360 px with those three labels (designer's choice: wrap, shorten with full text in the aria label, or skip). Default rendering with short labels such as „Q1“ is unchanged. | story + bounding-box overlap measure at 360 |
| AC-6 | `BarChartItem` gets an optional field `valueText?: string`. When set, the bar's visible value label shows it instead of `formatValue(value)`. | unit test |
| AC-7 | `formatValue` may take an optional second argument: `(value: number, item?: BarChartItem) => string`. Bar value labels pass the item; axis ticks pass no item (documented in the JSDoc). Existing one-argument formatters keep working and type-check. | unit test + compat check (strictTemplates) |
| AC-8 | Precedence is `valueText`, then `formatValue(value, item)`, then the default. The generated `aria-label` (when `ariaLabel` is empty) uses the same text per bar, so „Demo Applikation 313.000,00 · 54,8 %“ is read and shown. An explicit `ariaLabel` still wins. | unit test on `aria-label` string |
| AC-9 | Without the new inputs and fields, the rendered SVG of existing stories is identical (same attributes and positions) in both orientations. | existing specs unchanged and green; screenshot compare against the design baselines |
| AC-10 | A story "ranking in a card" at 360 px with value text „313.000,00 · 54,8 %“, 3 bars, DE labels; one story variant in EN. Every new input and field has an argType with `description` and `table.defaultValue`. | story review |
| AC-11 | The value text „313.000,00 · 54,8 %“ at the end of the longest bar still fits inside the card at 360 px (bar length reserves room for it, or the text moves inside or beside the label). | `--measure` at 360 |
| AC-12 | Light and dark: label and value text contrast at least 4.5:1 against the card surface (tokens only); `forced-colors` shows the text. | computed contrast, story in both themes |
| AC-13 | Prerendered HTML: the label layout of the initial render (before the ResizeObserver, `DEFAULT_WIDTH` 400) has no overflow either; the labels' text is in the HTML. | prerender check / compat app |
| AC-14 | The chart keeps its `role="img"` and an accessible name; no new keyboard stop is added. New JSDoc with `@default` on every new input (MCP manifest). | unit test + `npm run test:tools` |
| AC-15 | CHANGELOG entry (Added) for the consumer with the gap reference (finance-intelligence cockpit-2026-11-01 row 1) and "no API break". | review |

Covered: 360 and desktop widths, light and dark, screen reader, EN and DE, prerendered HTML, unchanged defaults. Keyboard: not applicable beyond AC-14 (static chart).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Text measurement must not need the DOM at first render (SSR and prerender have no layout); `'auto'` by measuring is allowed only with a deterministic fallback for the first render.
- Names in the proposal (`labelWidth`, `labelPosition`, `meta`, `valueText`) are suggestions; the designer fixes final names, but `valueText` is kept in the spec unless the designer asks otherwise.

## Assumptions

- Assumption: both gap options for (b) are cheap and compatible, so the kit offers `valueText` (simple, data-driven) and the optional `item` argument (flexible) rather than a free `meta` field; a `meta?: unknown` field is not added.
- Assumption: ticks keep calling `formatValue(tick)` with one argument, because a tick has no item.
- Assumption: the vertical overlap is a defect in the same component and is fixed here (AC-5), as the requester reported it in the same gap.
- Assumption: the requester stays on its own `lc-progress-bar` chart until the release (not urgent); no deadline.
- Assumption: no consumer other than finance-intelligence is known to depend on the 40 px band; the default stays 40 px anyway.

## Open questions

None.
