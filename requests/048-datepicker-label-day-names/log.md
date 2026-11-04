# Log 048: lc-datepicker Label (DE) story description and day button names

## Owner decisions

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-04 19:54 | spec-writer → ui-ux-designer | done | The spec is ready and testable; the designer confirms the format and sets the measurement baselines before the build. | Design the API and visuals for AC-1…9. No API change is expected, so keep design.md short. Confirm the English day-name format, take the 360 px baseline measurements for AC-5 and AC-7, and note that the axe check in AC-4 needs a story-level run. |
| 2026-11-04 20:01 | ui-ux-designer → web-developer | done | design.md is ready: no API change, the en-US format is confirmed by measurement and a DOM prototype (axe 0, 8/8 shots identical); the baselines are in tmp/story-shots/048/. | Implement design.md. |
| 2026-11-04 20:14 | web-developer → ui-ux-designer | done | All gates are green and the build matches design.md §9; the one deviation (an i18n-labels.spec assertion that pinned the old form) needs the designer's review. | Review request 048 (stories form-datepicker--label-de, form-datepicker--day-panel, form-datepicker--default); shots in tmp/story-shots/048/build and build-open, logs tmp/048/shots-{rest,open}.log, values in build.md. |
| 2026-11-04 20:18 | ui-ux-designer → release-manager | done | Review round 1 is approved with no must-fix; all AC pass and the gates on a7b725db still hold. | Prepare the release for request 048 (patch 3.30.1). Fix the Compatibility sentence in the changelog draft (review F-3), route F-1 (overlay panel lang, should-fix) to the queue and F-2 (German strings on the other Label (DE) fields) to the backlog. |
| 2026-11-04 20:20 | release-manager → none | done | Build and pack are green, the changelog is fixed, the release commit is made; main is pushed and tagged after CI. | 3.30.1 released through the pipeline. Queue 048-f1 (overlay panel lang) for the next bundle; 048-n2 is in the backlog. |
