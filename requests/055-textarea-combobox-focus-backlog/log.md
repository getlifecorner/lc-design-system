# Log 055: lc-textarea / lc-combobox focus(), backlog sweep (9 rows)

## Owner decisions

2026-11-06 21:28: The whole backlog (9 rows) runs in this one bundle with the other inbox items; no row goes back to the inbox for bundle size. Fix what is a defect; a known limit may be resolved as documented with a reason. 054-n2 needs WebKit, which is not installed here: if it can't be checked, keep it in the backlog and say so. (From bundle item 2.)

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-06 21:30 | spec-writer → ui-ux-designer | done | Spec is ready; design is the next pipeline step. | Design the API and visuals for AC-1…15 of requests/055-textarea-combobox-focus-backlog/spec.md. This covers `focus()` on textarea and combobox, `returnFocusTo` on drawer, gallery and the sidenav overlay, the narrow-width alert stacking (AC-13), and the story and doc fixes. Record the design in design.md. |
| 2026-11-06 22:03 | ui-ux-designer → web-developer | done | The design is complete with measured values, prototype compares and baselines; implementation is the next pipeline step. | Implement design.md of request 055 (focus() on textarea and combobox, returnFocusTo on drawer and sidenav with the shared helper, the combobox ring, the alert width band, the gallery WebKit test, the docs, story and spec cleanups, and the new stories in §8), then record the gates and the CDP AX tree check (AC-8) in build.md. |
