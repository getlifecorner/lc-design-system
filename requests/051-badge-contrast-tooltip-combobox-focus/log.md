# Log 051: Badge contrast on nav pills and light rail, tooltip on lc-button focus, lc-combobox openOnFocus

## Owner decisions

none

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-05 17:49 | spec-writer → ui-ux-designer | done | The spec is ready, and the next step is design of the API and visuals. | Design the API and visuals for AC-1…15 in requests/051-badge-contrast-tooltip-combobox-focus/spec.md. That covers the badge colour fixes for the bottom-nav current pill and the light sidenav rail, tooltip focus and anchoring on `lc-button`, and the combobox `openOnFocus` input with its stories. |
| 2026-11-05 18:14 | ui-ux-designer → web-developer | done | The design covers AC-1…15. The colour fixes and the expected shot changes were measured on prototypes against fresh baselines, and the reading of AC-3's outline clause is recorded as D-2. | Implement design.md for request 051 (bottom-nav current-pill badge rule, themed-rail badge rules in both theme files with a theme-modes.spec block, tooltip focusin/focusout + control/anchor resolution, combobox `openOnFocus` via the frame click handler, the five new stories and the argType), with the unit tests in design §9. |
| 2026-11-05 18:35 | web-developer → ui-ux-designer | done | The build is complete with all gates green on 989df6c, so the next step is the design review of the stories in the browser. | Review request 051 (stories navigation-bottom-nav--current-pill-badges, navigation-sidenav--themed-rail-badges, feedback-tooltip--keyboard-focus, form-combobox--open-on-focus-off, form-combobox--open-on-focus-off-de, plus the changed more-badge, collapsed-rail-badges, collapsed-with-groups, sidebar-first-* and tooltip language shots); shots in tmp/story-shots/051/build-new and build-nav, measures in tmp/051/m-*.log, write review.md. |
| 2026-11-05 18:45 | ui-ux-designer → release-manager | done | Round 1 is approved with every AC passing and no must-fix or should-fix finding. The gates passed on c5badc4, which matches HEAD 989df6c under libs and tools. | Prepare the release for request 051 (3.32.0, minor: new optional `openOnFocus` input; changelog draft in build.md). Route nit 051-1 (tooltip on a host with several controls describes the first one, not the focused one) to the backlog. |
