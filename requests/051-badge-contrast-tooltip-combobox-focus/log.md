# Log 051: Badge contrast on nav pills and light rail, tooltip on lc-button focus, lc-combobox openOnFocus

## Owner decisions

none

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-05 17:49 | spec-writer → ui-ux-designer | done | The spec is ready, and the next step is design of the API and visuals. | Design the API and visuals for AC-1…15 in requests/051-badge-contrast-tooltip-combobox-focus/spec.md. That covers the badge colour fixes for the bottom-nav current pill and the light sidenav rail, tooltip focus and anchoring on `lc-button`, and the combobox `openOnFocus` input with its stories. |
| 2026-11-05 18:14 | ui-ux-designer → web-developer | done | The design covers AC-1…15. The colour fixes and the expected shot changes were measured on prototypes against fresh baselines, and the reading of AC-3's outline clause is recorded as D-2. | Implement design.md for request 051 (bottom-nav current-pill badge rule, themed-rail badge rules in both theme files with a theme-modes.spec block, tooltip focusin/focusout + control/anchor resolution, combobox `openOnFocus` via the frame click handler, the five new stories and the argType), with the unit tests in design §9. |
