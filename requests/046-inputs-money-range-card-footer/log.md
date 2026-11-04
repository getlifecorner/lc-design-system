# Log 046: Month datepicker, two-way combobox, number-input locale and size, money range, equal card footer

## Owner decisions

2026-11-04 00:33: none recorded in the pipeline. The requesters' documents carry their own owner decisions (finance-intelligence ADR-0009: functions only, no look change; life-os 2026-11-04: kit first for CC-1, CC-2).

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-04 00:35 | spec-writer → ui-ux-designer | done | The spec is ready with checkable criteria and no owner decision is needed, so the next step is the design. | Design the API and visuals for AC-1…35 in requests/046-inputs-money-range-card-footer/spec.md. Name the new combobox two-way input (see A-2, keep `valueChange` unchanged). Decide the card footer behavior between 480 and 1023 px (A-3). Give a baseline story and screenshot per item at 360 and 1280 px. |
| 2026-11-04 14:01 | ui-ux-designer → web-developer | done | The design fixes every API name, value and story for AC-1…35, with baselines captured, and needs no owner decision. | Implement design.md (requests/046-inputs-money-range-card-footer/design.md): the five extensions, the nine stories in §8 and the unit tests in §9; the unchanged stories must stay identical to tmp/story-shots/046/baseline and baseline-open. |
| 2026-11-04 14:36 | web-developer → ui-ux-designer | done | The build and all gates are green and the baselines are identical, so the design review is next, plus two small deviations that need the designer's agreement. | Review request 046 (stories form-datepicker--month, form-datepicker--month-de, form-combobox--starts-with-a-choice, form-number-input--locale-de-with-suffix, form-number-input--sizes, data-display-money--range, components-card--equal-footer, components-card--equal-footer-german, components-card--equal-footer-link-card) using tmp/story-shots/046/new and build.md, and confirm or reject deviations 1–2. |
| 2026-11-04 14:46 | ui-ux-designer → release-manager | done | Review round 1 approved: every AC passes, 216/216 baseline shots identical, deviations 1–2 confirmed; no must-fix. | Prepare the release for request 046 (route review.md findings 1–2 as queue, 3–4 as backlog). |
| 2026-11-04 14:52 | release-manager → none | done | 3.29.0 is prepared, build and pack are green; the release commit goes through the pipeline. | Queue 046-f1 (datepicker clear target 20 px) and 046-f2 (day-mode dark selected fill 2.78:1) for the next bundle. |
