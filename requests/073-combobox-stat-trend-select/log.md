# Log 073: lc-combobox clearable, lc-stat-trend header arrangement, lc-select visible label

## Owner decisions

Empty.

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-24 13:10 | dispatcher → spec-writer | new | Bundle 20261124-130957 (3 items, finance-intelligence) started by the owner | Write the spec for this request |
| 2026-11-24 13:12 | spec-writer → ui-ux-designer | done | The spec is ready and the work is minor and additive, so the designer comes next. | Design the API and visuals for AC-1…20 in requests/073-combobox-stat-trend-select/spec.md. Decide the `stat-trend-end` slot selector, the icon and slot order, and the slot-only header case. Also decide the `lc-select` label markup and its `ariaLabel` rule, and how a narrow 360 px KPI header behaves with a long German badge. |
| 2026-11-24 13:37 | ui-ux-designer → web-developer | done | The API, layout rules, accessibility rules and baselines are fixed and prototyped, so the work can be built. | Implement design.md for request 073: combobox `clearable`, stat-trend `iconPlacement`/`fullWidth`/`[stat-trend-end]`, select `label`/`requiredIndicator`, with the stories in design.md §8. |
| 2026-11-24 14:01 | web-developer → ui-ux-designer | done | Built on `feat/3.52-combobox-stat-trend-select`, all gates green; two deviations (X-1 slot text space for axe, X-2 story labels) need the designer's agreement. | Review request 073 (stories charts-stat-trend--kpi-tile, --header-arrangement, --header-rtl, form-combobox--required-single-choice, form-select--with-label, --label-states-de, --labels-in-a-form-de, changed --select-in-form) and decide build.md X-1 and X-2. |
| 2026-11-24 14:13 | ui-ux-designer → release-manager | done | Review round 1 approved every AC with no must-fix finding, and deviations X-1 and X-2 are agreed and written into design.md. | Prepare the release for request 073 (3.52.0): run the compat check on Angular 21 as well (build.md ran only --only=22), and list review F-1 (should-fix → queue) and F-2 to F-5 (nits → backlog) under Open items. |
