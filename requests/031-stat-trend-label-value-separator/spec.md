# Spec 031: lc-stat-trend label and value without a separator

- **Status:** ready
- **Type:** bug fix (accessibility of the rendered text)
- **Affected:** `libs/angular-ui-kit/src/lib/stat-trend/` (`.html`, specs, `.stories.ts`), `CHANGELOG.md`
- **Semver impact:** patch. No input, class or visual change; only whitespace in the DOM text is added.

## Need

finance-intelligence cockpit: KPI tiles are `lc-card variant="outlined" clickable` around `lc-stat-trend label value`. axe-core 4.14 `label-content-name-mismatch` (WCAG 2.5.3 Label in Name) reads the tile's visible text as one word, "Gesamtkosten Plan 2026571.000,00 €", because label (`.lc-stat-trend__label`) and value (`.lc-stat-trend__value`) sit in two sibling `div`s with no text node between them (the compiled template drops the whitespace). The card name "Gesamtkosten Plan 2026: 571.000,00 €. Herkunft anzeigen" starts with the visible label and holds the value, but no `ariaLabel` can match the glued text, so every tile fails. The same glued text is read by any tool that uses `textContent`/`innerText`-like extraction (copy, translation, search-in-page, voice control). Requester's workaround: exclude the rule on `fi-kpi-tile` in e2e.

## What the kit has today

`stat-trend.component.html`: header `div` (label span, optional icon), row `div` (value span, optional change pill), optional sparkline. Block-level `div`s separate them visually only. The change pill already has a documented text-node contract (`" +3.1% "` without sentiment, pinned in `stat-trend.sentiment.spec.ts:45`; with sentiment `", up, unfavourable"` follows the change without a space, pinned at lines 82-108). Nothing else gives the text a separator; `lc-card` has no say in it. Not solvable by the consumer.

## Scope

- In: a separator in the rendered text between label and value, and between value and change, in `lc-stat-trend`; a story with a stat trend inside a clickable card; specs.
- Not in: any visual change, new inputs, the `lc-card` component, `lc-bar-chart` (028, released), `lc-skeleton` (row 3 of the gap file, not requested yet).

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | With `label="Gesamtkosten Plan 2026" value="571.000,00 €"` the host's `textContent`, whitespace-normalised, equals `Gesamtkosten Plan 2026 571.000,00 €` (a whitespace character between the two, not glued). | unit test |
| AC-2 | With `change="+3,1 %"` the normalised text is `… 571.000,00 € ↑ +3,1 %` (separator between value and change pill); with `sentiment` it ends `+3,1 %, gestiegen, ungünstig` (no space before the comma, as pinned today). | unit test |
| AC-3 | `lc-card clickable ariaLabel="Gesamtkosten Plan 2026: 571.000,00 €. Herkunft anzeigen"` around `lc-stat-trend label="Gesamtkosten Plan 2026" value="571.000,00 €"` has no `label-content-name-mismatch` violation (axe-core 4.14, rule `label-content-name-mismatch`, tags wcag21a); also without `icon`, with `change`, with `sentiment`, with `sparkline`. | story + axe run, or Jest with axe-core if the repo already runs it (designer/developer decide) |
| AC-4 | The separator is not visible: screenshots of all existing stat-trend stories at 360, 1024, 1280 in light and dark hash-identical to the 3.22.0 baseline (header height, row height, gaps measured equal). | `story-shots.mjs --compare` |
| AC-5 | The separator is not announced as an extra element or pause: no new focusable or `role` node; the accessible name of a standalone `lc-stat-trend` is unchanged except the added space; a screen reader reads "label value" in order. | unit test (no new roles) + manual VoiceOver/NVDA note in review |
| AC-6 | The prerendered HTML (SSR/prerender in `tools/compat`) contains the label, a whitespace and the value (`Label</span></div>[ws]<div …>Value`), checked without JavaScript. | compat prerender `EXPECT_IN_HTML` or string check |
| AC-7 | German and long strings (label of 40+ characters, `Gesamtkosten Plan 2026`, value `1.234.567,89 €`) wrap exactly as before at 360 px; no horizontal overflow. | story at 360 px, `--measure` scrollWidth |
| AC-8 | Unchanged defaults: no new input, no new class, all existing assertions in `stat-trend.component.spec.ts` and `stat-trend.sentiment.spec.ts` pass unchanged (including `textContent` of the pill `"↑ +3.1% "` and the sr-only texts). | existing specs |
| AC-9 | `forced-colors` and `prefers-reduced-motion`: no change in rendering. | story under forced-colors, or reasoning in design.md |
| AC-10 | A story "Inside a clickable card" (title `…/Stat Trend`) shows the tile of AC-3 at 360 px, with `label`, `icon`, `value`, English and German variants. | story exists |
| AC-11 | CHANGELOG entry under Fixed names the consumer (finance-intelligence cockpit, gap file row 2), the rule and WCAG 2.5.3, and states "no API break". | changelog review |

Not applicable: keyboard (no interaction added), light/dark (no colour change, covered by AC-4).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- The solution may not be a CSS-only `::before`/`::after` space (not part of the DOM text) and may not use `display: none`. Real text content (a whitespace text node, or a visually hidden space) is required; how is the designer's choice. It may not introduce a doubled space in the existing pinned text nodes.

## Assumptions

- Assumption: `lc-stat-trend` is the right layer for the fix (the requester's proposal); `lc-card` is not changed.
- Assumption: a separator between value and change is included, since the same glueing ("571.000,00 €↑ +3,1 %") would exist there; the pill's own internal text nodes stay as pinned.
- Assumption: the requester's accepted-when needs no new API; a story plus an axe check is enough evidence.
- Assumption: the "no ariaLabel can contain it" claim holds because 2.5.3 compares the visible text with the name; AC-1 removes the cause.
- Assumption: row 3 (`lc-skeleton`) is out of scope as it is "not requested yet".

## Open questions

None.

## Resolution

Not applicable: the kit has no existing way to achieve this.
