# Log 045: Toast offsets in the app shell, reserved aside column, wide page content

## Owner decisions

none

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-03 18:48 | spec-writer → ui-ux-designer | done | The spec is ready and has no open owner questions, so design is the next step. | Design the API and visuals for AC-1…20 in requests/045-toast-offsets-page-aside-width/spec.md. For AS-34, choose how the shell's clearance and header height reach the fixed toast outlet. For AS-35, design `reserveAside` (aria-hidden, no landmark). For AS-36, design `contentWidth` wide, and state how it combines with an aside that has content. |
| 2026-11-03 22:58 | ui-ux-designer → web-developer | done | design.md is complete, prototyped (wide child 928 px at 1280–1920, reserved column = named geometry, stack overflow CSS), and baselines are captured on main 7d0bd2b (045/baseline 234, 045/baseline-open 8). | Implement design.md: outlet hooks and stack scroll via OverlayInsetsService written by lc-app-shell; lc-app-page `reserveAside`, `contentWidth` and `[page-wide]`; the seven stories in §8. |
| 2026-11-03 23:32 | web-developer → ui-ux-designer | done | All gates are green and the measured values match design §9; the design review and one template-structure deviation need the designer. | Review request 045 (stories layout-app-shell--toasts-in-the-shell, --toasts-in-the-shell-large-text, --reserved-right-column, --reserved-and-named-right-column, --wide-page, --wide-page-with-right-column, feedback-toast-outlet--offsets; shots and measures in tmp/story-shots/045/build-*), and agree or object to build.md deviation 1 (nested @if instead of @if … @else if: the chain renders 2 anchors; nested keeps unnamed pages byte-identical, a named aside gains 2 comment nodes). |
| 2026-11-03 23:47 | ui-ux-designer → release-manager | done | Review round 1 approved: all 20 AC pass by measurement, deviation 1 agreed (design.md fixed with a change note), only 4 nits open. | Prepare the release for request 045 (minor 3.28.0); review.md findings 1–4 are nits for the backlog, and finding 3 rewords the changelog draft's compatibility line. |
| 2026-11-03 23:59 | release-manager → none | done | All gates and CI are green and the package is staged; only the owner's 2FA approval remains. | Request 045 is released as 3.28.0 (tag v3.28.0 on f76e9cb, publish run 41734882117 green, docs live). The owner approves the npm stage with 2FA (`npm stage approve <id>`). No queue items; backlog rows 045-n1, 045-n2 and 045-n4 are in requests/BACKLOG.md. |
