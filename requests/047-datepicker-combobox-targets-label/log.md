# Log 047: lc-datepicker and lc-combobox clear targets, combobox lg input height, datepicker label

## Owner decisions

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-04 17:27 | spec-writer → ui-ux-designer | done | The spec is ready and the design step is the normal next route. | Design the API and visuals for AC-1…12 in spec.md: hit-area technique for the datepicker and combobox clear buttons, combobox lg height with whole-frame focus, datepicker `label` input, the dark selected-day ring or fill, and the day panel targets. |
| 2026-11-04 17:53 | ui-ux-designer → web-developer | done | The design is complete and its CSS was prototyped against the 3.29.0 build, so implementation is the next step. | Implement design.md for request 047 (AC-1…12): the clear hit areas, combobox lg input and frame click, the datepicker label input, the selected-day ring, the day panel below 1024 px with overlay push, and the month-mode Enter fix. Then compare against tmp/story-shots/047/baseline (84 identical expected) and baseline-open (1024/1280 identical). |
