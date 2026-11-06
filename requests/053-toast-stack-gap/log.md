# Log 053: lc-toast-outlet stack gap

## Owner decisions


## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-06 12:13 | dispatcher → spec-writer | — | Bundle of 1 item (052-s2) started by the owner | Write the spec for this request |
| 2026-11-06 12:14 | spec-writer → ui-ux-designer | done | Normal route: the spec is ready, and the designer decides the technique and the visuals. | Design the fix for AC-1…12 in request 053. Choose a pure-CSS technique that gives an 8 px (`--spacing-2`) gap across both live regions with no extra space from an empty region or after the last toast, and that works with the bottom-stack `--latest` order. Add a story showing a stack of at least three toasts across both regions, and take baselines. |
| 2026-11-06 12:36 | ui-ux-designer → web-developer | done | design.md is ready: margin-top on outlet toasts plus a compensated stack top padding (D-1, D-2), prototyped on all AC; baselines (90 rest + 8 opened) are in tmp/story-shots/053. | Implement design.md: D-1 to D-3 in toast-outlet.component.scss and the docs, the new Stack Spacing story, and the gap spec; leave the order spec and the template unchanged. |
| 2026-11-06 13:33 | web-developer → ui-ux-designer | done | All gates are green on fix/3.33.1-toast-stack-gap and the measured geometry matches design §9, so the build is ready for design review. | Review request 053 (stories feedback-toast-outlet--stack-spacing, feedback-toast-outlet--bottom-stack-order, layout-app-shell--toasts-in-the-shell-large-text); shots in tmp/story-shots/053/build*, measures in tmp/053/ac*.log, gap-measure.js is still in dist/storybook/angular-ui-kit/zz-053/. |
| 2026-11-06 13:38 | ui-ux-designer → release-manager | done | The review approved all 12 AC with measurements and the shot compare matches the design exactly, so there is no must-fix and the gates are recorded green in build.md. | Prepare the release for request 053 (patch 3.33.1, fix/3.33.1-toast-stack-gap); route the three open nits in review.md (gap spec sha1 pin, top-stack order wording, inert controls on fixed outlet demos) to the backlog. |
| 2026-11-06 13:50 | release-manager → none | done | Build and pack green; release commit made, pushed through the pipeline as 3.33.1. | Approve the npm stage with 2FA. |
