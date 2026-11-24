# Spec 073: lc-combobox clearable, lc-stat-trend header arrangement, lc-select visible label

- **Status:** ready
- **Type:** extension of `lc-combobox`, `lc-stat-trend`, `lc-select` (bundle of 3 items, all from finance-intelligence)
- **Affected:** `lib/combobox/`, `lib/stat-trend/`, `lib/select/` (component, html, scss, spec, stories), CHANGELOG, MCP manifest (derived)
- **Semver impact:** minor: only new optional inputs and one slot; every default renders as before.

BACKLOG.md was grepped for combobox, stat-trend and select: no rows to fold.

## Need

finance-intelligence (IT finance controlling) builds on kit 3.41.0 and meets three gaps in its measures and cockpit pages. Each has a local workaround until the release.

- **A. Massnahmen row 5:** the form "Maßnahme anlegen" has the required single choice "Status". `lc-combobox` always shows the clear button once a single value is selected, so a required field can be emptied. The consumer wants a look and default unchanged (ADR-0009).
- **B. Cockpit KPI tiles:** the `lc-stat-trend` host is `display: inline-flex` and as wide as its value, so the header (`justify-content: space-between`) puts the `icon` at the right edge of the value, never after the label and never at the card edge. The header cannot reach the container edge, and no state badge fits at its right. The consumer builds its own header from `lc-text`, `lc-icon` and `lc-badge`.
- **C. Simulation row 1:** `lc-select` has `ariaLabel`, `helperText` and `errorMessage`, but no visible `label`, unlike `lc-combobox`, `lc-input` and `lc-number-input`.

## What the kit has today

- Combobox: `@else if (!multiple() && selectedSingle())` renders `.lc-combobox__clear` (named by `clearAriaLabel`); no input switches it off. `lc-select` already has `clearable` (default true, `booleanAttribute`, spec `select.clearable.spec.ts`): the new combobox input mirrors it.
- Stat-trend: inputs `label`, `icon`, `value`, `change`, `sentiment`, …; header only when `label() || icon()`; `.lc-stat-trend__header` is flex with `space-between`. No placement input, no fill, no slot.
- Select: no `label`. Combobox renders `<label class="lc-combobox__label" [for]="inputId">`; the select trigger is a `div role="combobox"` with `[attr.aria-label]`.

## Scope

- In: A `clearable` on `lc-combobox`; B `iconPlacement`, `fill` and a header-end slot on `lc-stat-trend`; C `label` on `lc-select`.
- Not in: a `clearable` change on `lc-select`; other stat-trend inputs or visuals; label changes on other components; a required marker redesign.

## Acceptance criteria

### Item A: lc-combobox `clearable` (massnahmen-prove-2026-11-22 row 5)

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | New input `clearable` (boolean, `booleanAttribute`, default `true`, JSDoc with `@default`). With `false` and a single value selected, no `.lc-combobox__clear` is in the DOM; the selected label stays in the input and can still be changed by typing. | unit test |
| AC-2 | With the default (no binding, or `true`) the DOM, classes and the clear behaviour are identical to 3.51: all existing combobox specs (`combobox.targets`, `open-on-focus`, `component`) pass unchanged. | existing specs, run unchanged |
| AC-3 | With `clearable=false`: `multiple` chip removal is unaffected, the spinner state is unaffected, `writeValue(null)` and `[(selectedValue)]` reset still clear the value, and `disabled` still works. The input's right padding/layout without the button shows no gap or overlap (measured at sm, md, lg). | unit test + story at 360 px, md and lg |
| AC-4 | Story "required single choice" with `clearable=false` in German text ("Status" with long option labels), light and dark, 360 and 1024 px; argType has `description` and `table.defaultValue`. | story + screenshots |
| AC-5 | Keyboard: tab order input then (no clear button) the next control; Escape and option selection behave as before. | unit test |

### Item B: lc-stat-trend header (cockpit-prove-2026-11-22, gap row 6)

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-6 | New input `iconPlacement: 'end' \| 'after-label'` (exported union type `StatTrendIconPlacement`, default `'end'`). `'after-label'` puts the icon directly after the label (gap token, not `space-between`), also when the header is wider than its content. | unit test + story (measured x distance label to icon) |
| AC-7 | New input `fill` (boolean, default `false`). With `true` the host takes the full width of its container (`display: flex`/`width:100%`, mechanism for the designer) and the header's right edge equals the container's right edge; the sparkline and value row stay laid out as before. | story at 360, 1024, 1280 px, `--measure` of the host and header widths |
| AC-8 | New content slot in the header (name `stat-trend-end` as requested) for one element, at the right edge, vertically centred on the label. Empty by default: no wrapper box or gap is rendered without projected content (also in the prerendered HTML). | unit test + story with `lc-badge`, measured vertical centre |
| AC-9 | Combinations work and are shown: `fill` + `after-label` + slot; slot without `fill` (header as wide as the content, no overflow); slot together with `icon` at `'end'` has a defined order (designer decides, documented). Header still appears only with a label or icon, and the slot-only case (no label, no icon) is decided by the designer and recorded. | stories + unit test |
| AC-10 | Defaults unchanged: all existing stat-trend specs (`component`, `sentiment`, `no-header`, `axe`) pass without edits; the default DOM text and layout match 3.51 (no `fill`, `end`, no slot). | existing specs unchanged |
| AC-11 | Accessibility: icon stays decorative; the slot content is reachable by keyboard when interactive and does not change the accessible text of label, value and change (WCAG 2.5.3 text "Label Value +3,1 %" remains in order); axe passes with a badge in the slot, light and dark. | axe spec + story |
| AC-12 | Story "KPI tile" with German texts ("Offene Maßnahmen", long state badge "Teilweise umgesetzt"), at 360 px (no overflow, label truncates or wraps without hiding the badge; designer chooses), 1024 and 1280 px, light and dark. RTL header mirrors correctly. | story screenshots + measure |
| AC-13 | Prerendered HTML contains the header with the label before JavaScript; the layout holds without JS (compat `EXPECT_IN_HTML` extended only if the designer adds a hook there). | prerender check |

### Item C: lc-select `label` (simulation-2026-11-24 row 1)

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-14 | New input `label` (string, default empty, JSDoc with `@default`). When set, a visible label is rendered above the trigger, styled like `lc-combobox__label` (same tokens, size and spacing, so a select and a combobox side by side align). | unit test + story side by side with combobox and input |
| AC-15 | The label names the control for assistive technology: the trigger gets `aria-labelledby` the label's id (or a native `<label for>` equivalent the designer picks). With both `label` and `ariaLabel` set the rule is defined and tested (assumption below). Clicking the label focuses the trigger. With `required`, the visible label shows the same required cue as combobox/input, if they have one. | unit test, axe spec |
| AC-16 | Defaults unchanged: without `label` there is no label element and the DOM, `aria-label` behaviour and wrapper layout match 3.51; all select specs pass unchanged. | existing specs unchanged |
| AC-17 | Label works with `error`, `helperText`, `disabled`, `searchable`, `multiple` and all sizes (xs to lg); long German label ("Simulationsszenario auswählen") at 360 px wraps without clipping; light and dark, forced-colors. | story + screenshots at 360 and 1024 px |
| AC-18 | The panel keeps its `aria-label`/search labels (`searchAriaLabel` fallback may use the label text instead of `ariaLabel`; behaviour unchanged without `label`). | unit test |

### Across all items

| ID | Criterion | Verified by |
|---|---|---|
| AC-19 | Every new input and slot has JSDoc (`@default`), an argType with `description` and `table.defaultValue`, and a story; README component lists and the MCP manifest stay consistent; `npm run test:tools` passes. | lint, tests, tools tests |
| AC-20 | Library build, compat check on Angular 21 and 22 (AOT, strictTemplates) pass. CHANGELOG entry names the three gaps and the consumer pages. | build, compat, changelog |

Always covered where applicable: 360 px and desktop widths · light and dark · keyboard and screen reader · EN and DE lengths · prerendered HTML · unchanged defaults.

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Public CSS hooks, if added, are named `--lc-stat-trend-<property>` or `--lc-select-<property>` with a documented default.

## Assumptions

- Assumption: `clearable` on `lc-combobox` mirrors `lc-select.clearable` (`booleanAttribute`, default true) and only hides the single-choice clear button.
- Assumption: the slot is a named content projection `[stat-trend-end]` (the requester's name), exact selector decided by the designer.
- Assumption: `fill` only widens the host; it does not change the sparkline width (120 px fixed today).
- Assumption: with `label` and `ariaLabel` both set, `ariaLabel` wins for the accessible name (explicit override), as consumers set it today; the designer may refine.
- Assumption: the three items are independent, so they share one design pass and one version.

## Open questions

None.

## Resolution

Not applicable (all three gaps are real).
