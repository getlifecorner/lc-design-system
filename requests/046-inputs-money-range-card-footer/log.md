# Log 046: Month datepicker, two-way combobox, number-input locale and size, money range, equal card footer

## Owner decisions

2026-11-04 00:33: none recorded in the pipeline. The requesters' documents carry their own owner decisions (finance-intelligence ADR-0009: functions only, no look change; life-os 2026-11-04: kit first for CC-1, CC-2).

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-04 00:35 | spec-writer → ui-ux-designer | done | The spec is ready with checkable criteria and no owner decision is needed, so the next step is the design. | Design the API and visuals for AC-1…35 in requests/046-inputs-money-range-card-footer/spec.md. Name the new combobox two-way input (see A-2, keep `valueChange` unchanged). Decide the card footer behavior between 480 and 1023 px (A-3). Give a baseline story and screenshot per item at 360 and 1280 px. |
| 2026-11-04 14:01 | ui-ux-designer → web-developer | done | The design fixes every API name, value and story for AC-1…35, with baselines captured, and needs no owner decision. | Implement design.md (requests/046-inputs-money-range-card-footer/design.md): the five extensions, the nine stories in §8 and the unit tests in §9; the unchanged stories must stay identical to tmp/story-shots/046/baseline and baseline-open. |
