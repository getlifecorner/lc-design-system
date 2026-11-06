# Log 055: lc-textarea / lc-combobox focus(), backlog sweep (9 rows)

## Owner decisions

2026-11-06 21:28: The whole backlog (9 rows) runs in this one bundle with the other inbox items; no row goes back to the inbox for bundle size. Fix what is a defect; a known limit may be resolved as documented with a reason. 054-n2 needs WebKit, which is not installed here: if it can't be checked, keep it in the backlog and say so. (From bundle item 2.)

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-06 21:30 | spec-writer → ui-ux-designer | done | Spec is ready; design is the next pipeline step. | Design the API and visuals for AC-1…15 of requests/055-textarea-combobox-focus-backlog/spec.md. This covers `focus()` on textarea and combobox, `returnFocusTo` on drawer, gallery and the sidenav overlay, the narrow-width alert stacking (AC-13), and the story and doc fixes. Record the design in design.md. |
| 2026-11-06 22:03 | ui-ux-designer → web-developer | done | The design is complete with measured values, prototype compares and baselines; implementation is the next pipeline step. | Implement design.md of request 055 (focus() on textarea and combobox, returnFocusTo on drawer and sidenav with the shared helper, the combobox ring, the alert width band, the gallery WebKit test, the docs, story and spec cleanups, and the new stories in §8), then record the gates and the CDP AX tree check (AC-8) in build.md. |
| 2026-11-06 22:34 | web-developer → ui-ux-designer | done | Implementation and all gates are green; the design review of the stories is the next pipeline step. | Review request 055 (stories form-textarea--focus-on-open, form-combobox--focus-on-open, form-combobox--focus-on-open-list-opens, feedback-alert--inline-action-narrow, feedback-drawer--return-focus-to, navigation-sidenav--return-focus-to; changed: form-tag-input--keyboard-focus, the four toast-outlet demo stories' controls, navigation-bottom-nav--more-badge-three-characters text) against design.md, using build.md and the shots in tmp/story-shots/055/build-new, and rule on the five deviations listed in build.md. |
| 2026-11-06 22:44 | ui-ux-designer → release-manager | done | Review r1 approved: every AC passes, there is no must-fix, and deviations 1, 2, 3 and 5 are accepted (4 was a design error, fixed in design.md §3). | Prepare the release for request 055 (3.35.0). Route N-1, N-2, F-1, F-2 from review.md to the backlog; 054-n2 stays there; delete the 8 folded rows. |
| 2026-11-06 22:58 | release-manager → none | done | All gates were green, CI and the publish run succeeded, and the tag `v3.35.0` is on the release commit `a90b918`. | Request 055 is released as 3.35.0 and staged on npm; the owner approves the stage with 2FA (`npm stage approve <id>`). No `queue` items; `055-n1` to `055-n4` and `054-n2` are in `requests/BACKLOG.md`. |
