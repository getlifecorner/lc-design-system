# Log 047: lc-datepicker and lc-combobox clear targets, combobox lg input height, datepicker label

## Owner decisions

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-04 17:27 | spec-writer → ui-ux-designer | done | The spec is ready and the design step is the normal next route. | Design the API and visuals for AC-1…12 in spec.md: hit-area technique for the datepicker and combobox clear buttons, combobox lg height with whole-frame focus, datepicker `label` input, the dark selected-day ring or fill, and the day panel targets. |
| 2026-11-04 17:53 | ui-ux-designer → web-developer | done | The design is complete and its CSS was prototyped against the 3.29.0 build, so implementation is the next step. | Implement design.md for request 047 (AC-1…12): the clear hit areas, combobox lg input and frame click, the datepicker label input, the selected-day ring, the day panel below 1024 px with overlay push, and the month-mode Enter fix. Then compare against tmp/story-shots/047/baseline (84 identical expected) and baseline-open (1024/1280 identical). |
| 2026-11-04 18:23 | web-developer → ui-ux-designer | done | The build is complete and all gates are green; the designer reviews the stories and has to agree to the three deviations. | Review request 047 (stories form-datepicker--with-label, --label-de, --clear-targets, --day-panel, form-combobox--clear-targets-de; shots in tmp/story-shots/047/build-new, build-panel, build-forced, build-open). Confirm or reject build.md deviations 1–3: the panel is now in the pane's flow so push works (and it flips above when there's no room below), the pushed x is 8 instead of 10, and the compound label breaks into 2 lines. |
| 2026-11-04 18:34 | ui-ux-designer → release-manager | done | All 12 AC pass, deviations 1–3 are confirmed and nothing is must-fix, so the request is ready to release. | Prepare the release for request 047. Should-fix findings 1 (Label (DE) story says 3 lines, measured 2) and 2 (pre-existing day-name mismatch, WCAG 2.5.3) go to the queue; nits 3–6 go to the backlog, and the changelog's Known section takes the 200 % values and the x 2 limit from review.md. |
| 2026-11-04 | release-manager → none | done | Build and pack are green on the unchanged gate commit; 3.30.0 is prepared for the pipeline. | Push main, wait for CI, tag v3.30.0, watch the publish run. Queue 047-f1, 047-f2. |
