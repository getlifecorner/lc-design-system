# Log 025: Review findings follow-up 2: toast wrapping and host layout, drawer close targets, axe findings, unlabelled icons

## Owner decisions

2026-10-31: the owner asked for this follow-up of the open findings of request 024 (headless run, `--from owner`).

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-31 13:40 | dispatcher → spec-writer | new | Start of the request | Write the spec for this request |
| 2026-10-31 13:42 | spec-writer → ui-ux-designer | done | Spec is ready; next is the design of the visuals and the per-icon decisions. | Design the API and visuals for AC-1…13 of requests/025-review-findings-follow-up-2/spec.md. Take the before-baselines first. For each of the 30 icons, decide between `decorative` and an `ariaLabel`, preferring `decorative` so no input is needed. Check whether the toast outlet depends on the dead host rule. |
| 2026-10-31 14:07 | ui-ux-designer → web-developer | done | Every change is prototyped and measured, the baselines are captured, and nothing needs the owner or the spec-writer. | Implement design.md (request 025): toast host rule and message hyphenation, drawer close and heading, notification-center chip and badge tokens plus the forced-colors rule, 29 decorative icons with the kit-wide scan, the story changes in §8 and the compat check in §9 (AC-12); then re-shoot against tmp/story-shots/025/baseline and baseline-open with the same flags. |
| 2026-10-31 14:29 | web-developer → ui-ux-designer | done | Everything in design.md is built and measured and every gate passed, so the stories are ready for the design review. | Review request 025 (stories feedback-toast--with-action, --success, --all-variants, feedback-toast-outlet--service-call; feedback-drawer--german-heading (new), --filter-panel, --large-form, --without-heading; feedback-notification-center--default, --compact; one icon story each of log-viewer, document-viewer, gallery, combobox, file-upload, field-group). Shots are in tmp/story-shots/025/after and after-open, with gate results and measures in build.md. |
| 2026-10-31 14:40 | ui-ux-designer → release-manager | done | All 13 acceptance criteria pass by measurement and screenshot comparison with no must-fix, and every gate passed on 763d8f3, which the libs and tools on HEAD still match. | Prepare the release for request 025 (3.19.1, patch). Correct the chip-contrast sentence in the changelog draft as review finding 2 says, and list should-fix 1 (toast close × 1.47/1.22:1 in dark, a follow-up request) and nit 3 as open items in release.md. |
