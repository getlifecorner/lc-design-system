# Spec 063: lc-table lazy tree rows, lc-line-chart gaps and dashed series, USM X form, alert, menu, icon and theme-scope gaps

- **Status:** ready
- **Type:** extension of `lc-table`, `lc-line-chart`, `lc-textarea`, `lc-alert`, `lc-menu`, `lc-number-input`, `lc-icon`; global style (light theme scope)
- **Affected:** `lib/table`, `lib/line-chart` (and `internal/chart` if the null handling lives there), `lib/textarea`, `lib/alert`, `lib/menu`, `lib/number-input`, `lib/icon`, `styles/_theme-light.scss` (+ `_theme-dark.scss` for the yellow accent), `tokens.json`, `docs/*.mdx` (theme scoping), CHANGELOG, both READMEs if a component list changes
- **Semver impact:** minor. Every new input and hook is optional with an unchanged default. `LineChartSeries.data` only widens (`number[]` to `(number | null)[]`), which cannot break a consumer who passes numbers.

## Need

Two consumers.

- **finance-intelligence, page "Kosten" (spec 018, Angular 22):** budget rows load their plan items on the first expand (hundreds of budgets per customer). `lc-table` shows the arrow only for rows that already have children, so the page uses a placeholder child row. The chart must draw actuals up to a cutoff date and the forecast after it. `data: number[]` allows neither a gap nor a dashed series. Functions only, no new look (ADR-0009).
- **usm-x (Angular 21, kit 3.41.0, under `/usmx/`):** it replaced its hand-drawn controls with kit components and keeps native or local markup where the kit lacks a function: chat textarea (row 6), blocking question and a fifth alert colour (7, 8), grouped menus (12), a decimal as text (13), an 18 px icon in a dense rail (18), a light popover inside a dark scope (19).

## What the kit has today

| Row | State in the kit (checked in source) |
|---|---|
| kosten 1 | `table.component.ts` ~742: `hasChildren = children.length > 0`; the arrow and `aria-expanded` follow it. `rowToggle` exists (`{id, expanded, row}`). `idKey`, `parentKey`, `treeColumn`, `expandedIds`, `indentSize` exist. |
| kosten 2 | `LineChartSeries {label, data: number[], color?}`; `toFinite` maps every value, so no gap. The summary (`line 254–260`) uses `Math.min/max(...s.data)`. No dash. |
| 6 | `lc-textarea` already has `rows`, `minRows`, `maxRows`, `autoResize`. Missing: `min-height` is 4–7 rem per size and overrides one row; `.lc-textarea-footer` is always rendered. |
| 7 | `role` is computed (`alert` for error/warning, else `status`); no input. |
| 8 | No `--lc-alert-*` hooks (the badge and chip have them). No `--color-accent-yellow` in either theme (orange, purple, red, rust, violet exist). |
| 12 | `MenuItem` is flat (`id, label, icon, href, variant, dividerAfter, disabled, metadata`). |
| 13 | `lc-number-input`: model is `number`, `valueChange = output<number>()`, text is re-derived from the model on blur. |
| 18 | `IconSize` is `xs|sm|md|lg|xl`; sizes come from `icon-<size>` classes and the `sizeInPixels` map; no size property. |
| 19 | `dark-theme-tokens` is public; the light counterpart `-light-theme-colors` is private and emitted only for `:root.light`. |

## Scope

- In: kosten rows 1 and 2; usm-x rows 6, 7, 8, 12, 13, 18, 19.
- Not in (non-goals): any new look; a cutoff-date marker in the chart; async loading inside the table (the page adds the children, the table only shows the arrow); a custom `Decimal` type; row 14's sidenav action items.
- **Returned to the inbox, unchanged (bundle would be too big for one design and review, 15 rows over 12 components):** usm-x rows 4 (`lc-header`), 11 (`lc-tabs`), 14 (`lc-sidenav`), 16 (`lc-page-header`), 17 (`lc-card`), 20 (`lc-list`). They stay in `requests/062-checkbox-select-usmx-gaps/request.md` Item 3 and in the usm-x source file. The dispatcher puts them back as one item "usm-x frame rows 4, 11, 14, 16, 17, 20". No BACKLOG rows exist for the in-scope components (checked: only 057-n4 for table, an unrelated 360 px actions-column note, stays).

## Acceptance criteria

### A. `lc-table` lazy tree rows (finance-intelligence, kosten row 1)

| ID | Criterion | Verified by |
|---|---|---|
| AC-1 | A new optional input names a row field (`hasChildrenKey`). A row whose field is truthy and which has no loaded children shows the expand arrow, with `aria-expanded="false"` on the row. | unit test |
| AC-2 | Opening such a row emits `rowToggle` (`expanded: true`) once, and the row is `aria-expanded="true"`. While no children exist it adds no empty gap and no extra row height. When the page adds the children (`rows` changes), they render under it, indented, without a second `rowToggle`. | unit test + story, DOM row count and measured row height |
| AC-3 | Closing it emits `rowToggle` (`expanded: false`). Keyboard: ArrowRight/ArrowLeft/Enter/Space work as for rows with children (as the existing tree keys at table.component.ts ~1062). | unit test |
| AC-4 | A row with a truthy field and loaded children behaves as today. When the loaded children are removed, the row returns to the lazy state and the arrow stays. | unit test |
| AC-5 | Without the input nothing changes: the existing table, tree and a11y specs pass unmodified. | existing specs |
| AC-6 | Story at `sm` with German texts ("Budget mit Planposten", "Planposten werden geladen"): the arrow is there, the page adds the children after `rowToggle`, 360 and 1280 px, light and dark. axe passes. | story + axe spec |

### B. `lc-line-chart` gaps and dashed series (finance-intelligence, kosten row 2)

| ID | Criterion | Verified by |
|---|---|---|
| AC-7 | `LineChartSeries.data` accepts `(number | null)[]`. A `null` (also `undefined` and non-finite, as defined by the design) draws no point and no segment: the line breaks there, and a lone point between two gaps is still drawn as a dot when dots are on. | unit test (SVG path segments) |
| AC-8 | The y-scale, the tooltip and the legend ignore `null`: min, max and the nice scale are computed from the finite values only. A series that is all `null` renders no path and does not throw. The tooltip lists no entry for a `null` index. | unit test |
| AC-9 | `LineChartSeries.dashed?: boolean`. A dashed series uses a dash pattern from a kit token or constant, in the series' colour, in the plot and as a dashed swatch in the legend. The pattern also works with `smooth`. | unit test + story, measured `stroke-dasharray` |
| AC-10 | The accessible label or table reads `null` as "no value" (and the summary no longer reads min/max from `null`). The text can be changed through the existing locale or label input, EN default, DE verified. | unit test |
| AC-11 | Defaults unchanged: a chart with numbers only and without `dashed` renders the same SVG (existing specs and stories unchanged). | existing specs |
| AC-12 | Story: twelve months, actuals through October solid, the forecast dashed, `null` where a series is absent; 360 and 1280 px, light and dark, the dash and the colour keep 3:1 against the surface; axe passes. Dash is not the only carrier of meaning: the legend names the series. | story + axe + contrast |

### C. usm-x form and alert gaps

| ID | Criterion | Verified by |
|---|---|---|
| AC-13 | (row 6) `lc-textarea` with `rows=1` (min 1) and `autoResize` renders one line: measured height of the field equals one line plus padding at `md`, with no `min-height` of 4 rem. It grows with the text up to `maxRows`. Whether `minRows` or `rows` carries the one-line case is the designer's call; `rows`/`minRows` of 1 must work. | story + `--measure` at 360 px |
| AC-14 | (row 6) The footer row is rendered only when there is a character counter, helper text or a visible error. Without them the DOM has no `.lc-textarea-footer` and the field keeps no reserved space. The existing `aria-describedby` and error announcement are intact. | unit test |
| AC-15 | (row 6) Defaults unchanged: a textarea with the default `rows` and any helper, counter or error renders at the same heights as before (measured at `xs`–`lg`). Where a default textarea has no footer content today, the footer's removal is the one visible change; the design states the height difference and adds it to *Changed* in the changelog. | story + measurement |
| AC-16 | (row 7) `lc-alert` takes an optional `role` input (`alert | status | alertdialog`, default: the current computed role). With `alertdialog` the alert takes `aria-labelledby` (title) and `aria-describedby` (message), and focus moves into it on open and returns to the opener on close. Whether focus handling is built in or documented is the designer's call; it must be testable. | unit test + axe |
| AC-17 | (row 7) Without the input the role stays `alert` for error/warning and `status` otherwise (existing assertions unchanged). | existing spec |
| AC-18 | (row 8) Public hooks `--lc-alert-bg`, `--lc-alert-fg`, `--lc-alert-border` with documented defaults equal to today's variant values; set on an ancestor, they win (declared with `:where()` or on `:host`, see how badge and chip do it). Icon colour follows. | unit test (computed style) + story |
| AC-19 | (row 8) New semantic token `--color-accent-yellow` in `_theme-light.scss` and `_theme-dark.scss` and in `tokens.json`, with contrast of text on a tint of it computed in `theme-contrast.spec.ts` (4.5:1, text; 3:1, border). Recommended: documented in the token page, but no variant is added. | theme-contrast spec |
| AC-20 | (row 8) Story with a fifth meaning (violet via the hooks, yellow via the token) in light and dark, 360 px; `forced-colors` still shows a border. | story + contrast |
| AC-21 | (row 13) `lc-number-input` has a string value mode that keeps what was typed: `1.50` stays `1.50`, an id of 20 digits is not rounded, and nothing is converted through a double. The model and the output carry a string in this mode. The `+`/`-` steppers work on the string (decimal arithmetic on the string, scale kept: `1.50` + step `0.5` gives `2.00`). Min and max clamp by numeric comparison without changing the text of a value in range. `ControlValueAccessor` round-trips the string. | unit test (values from the request, a 20-digit id) |
| AC-22 | (row 13) Without the mode, `number | null` behaviour and the existing specs are unchanged. The locale input in string mode: the design decides whether it formats; the text typed is never altered unless a stepper or a clamp acts. | existing specs + unit test |
| AC-23 | (row 13) Story at 360 px with German decimals (comma), invalid and disabled; axe passes. | story + axe |

### D. usm-x menu, icon and theme scope

| ID | Criterion | Verified by |
|---|---|---|
| AC-24 | (row 12) `MenuItem` can be a section: a heading with `children` (as `NavigationItem` has). The heading is not focusable and not an action. It has semantics (e.g. `role="group"` with `aria-labelledby`, or `role="presentation"` heading plus group). Members can be indented. A flat `MenuItem[]` renders exactly as before. | unit test + existing specs |
| AC-25 | (row 12) Arrow keys, Home/End and type-ahead skip headings and move across sections. Disabled members keep their current behaviour. The screen reader announces the group name. | unit test + manual check |
| AC-26 | (row 12) Story: two sections, one with indented members, 360 px and 1280 px, DE labels, light and dark. | story + axe |
| AC-27 | (row 18) A way to draw `lc-icon` at 18 px: either a new size or a documented size hook (`--lc-icon-size`) with the current sizes as defaults. A request to draw 18 px also gives `width`/`height` of the SVG at 18 px (measured), no inline size, no layout shift in the prerendered HTML. `xs`–`xl` render at the same px as before. | unit test + `--measure` |
| AC-28 | (row 19) A public light counterpart to `dark-theme-tokens` (a mixin, or a scope class such as `.lc-theme-light`) that sets the full light semantic colours on any element, so a light popover can sit in a dark scope. The result equals `:root.light` values (test: the same custom properties). It is documented on the theme page, next to the dark scope. | scss/unit test + story: light menu inside a dark container, contrast measured |
| AC-29 | (row 19) The private mixin keeps working; `:root.light` and `:root.dark` output stays byte-compatible for the existing tokens (no change to the compiled `:root` rules beyond the added public scope). | build output diff |

### Always (apply to every group above)

| ID | Criterion | Verified by |
|---|---|---|
| AC-30 | 360 px and 1024/1280 px, light and dark, EN and DE for each new story; no horizontal overflow at 360. | `story-shots` + `--measure` |
| AC-31 | Keyboard and screen reader: each new function is operable with the keyboard, with `:focus-visible`, touch targets of at least 44 px where interactive. | unit tests + axe |
| AC-32 | Every new input has JSDoc with `@default` and an argType description and `table.defaultValue` in its story; the changelog entry names usm-x and kosten-2026-11-17 and states "no API break". The consumer check `check-angular-majors.mjs` is green on 21 and 22 (AOT, strictTemplates, prerender). | review + compat run |
| AC-33 | Prerendered HTML: the lazy tree row, the textarea without a footer and the icon at 18 px show their layout in the server-rendered HTML before JavaScript. | compat prerender / SSR spec |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Table: the table never loads children itself (no async input, no loading state), only the arrow. A spinner or skeleton is the page's job (non-goal).
- Chart: a dashed series uses the kit's own stroke pattern, no new look (ADR-0009).

## Assumptions

- Assumption: bundle size. Fifteen rows over twelve components exceed one design and one review (about 8 items). I kept eight items (kosten 1, kosten 2, usm-x 6, 7+8 as one alert item, 12, 13, 18+19 grouped by the icon/theme gap) and returned rows 4, 11, 14, 16, 17, 20 to the inbox. They are the frame and the largest rewrites (header layering, a tab-list mode, sidenav action items) and need their own design.
- Assumption: `hasChildrenKey` is the name asked for by the requester; the designer may keep it. A truthy value of any type counts.
- Assumption: a stat of "the row stays expanded without an empty gap" means no extra row, no placeholder; `aria-expanded="true"` is kept.
- Assumption: the row 6 request "footer only when there is a counter or helper text" also includes an error message (an error must stay visible).
- Assumption: row 7 `alertdialog` is delivered by a `role` input; focus handling and a focus trap are a design decision, a modal-like trap is not required because a blocking question can sit in `lc-modal`.
- Assumption: row 8's "fifth meaning" is solved by the hooks; the yellow is a token, not a new variant, because adding to `AlertVariant` would widen the union consumers switch over.
- Assumption: row 13 numeric comparison for min/max uses decimal-safe string comparison (no `Number()` of a 20-digit id), a design detail the developer tests with the request's examples.
- Assumption: row 18 and row 19 are small enough to share one design section; if the designer finds the light scope needs more than a mixin and a doc page, it is cut and queued.
- Assumption: the table's `rowToggle` for a lazy row has no new payload; the page reads `row` and `id`.

## Open questions

None for the owner.

## Resolution

Not applicable: no part of the in-scope items is covered by the kit. Rows 6, 7, 8, 12, 13, 18 and 19 were checked against the source (see "What the kit has today"); `lc-textarea` already has `rows`, `minRows`, `maxRows`, `autoResize`, so only the `min-height` and footer parts remain.
