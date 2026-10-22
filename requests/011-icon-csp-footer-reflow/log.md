# Log 011: lc-icon without inline styles, and footer sections at 320 px with 200 % text

## Owner decisions

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-22 | spec-writer → ui-ux-designer | done | The spec is ready and the designer is the normal next step; no owner decision is needed. | Design the API and visuals for AC-1…12 of requests/011-icon-csp-footer-reflow/spec.md. For lc-icon, move the size into the `icon-<size>` classes, make `currentColor` the default through the stylesheet with no `style` attribute, and decide how a custom `color` is applied. For lc-footer, use `minmax(min(10rem, 100%), 1fr)` or a better minimum. Take baselines at 320, 360, 1024 and 1280 px for both. |
| 2026-10-22 | ui-ux-designer → web-developer | done | design.md is ready. A CSS prototype matched the 3.11.0 baseline in 464 of 472 shots; the 8 that differ are the random-picsum story. | Implement design.md: icon sizes in the `.icon-<size>` classes, the default colour through `svg { color: inherit }` with no style written, a custom colour through CSSOM only. Footer: `minmax(min(10rem, 100%), 1fr)` plus `overflow-wrap: anywhere` on `.footer__sections`. Add the two new stories, the compat rows and the spec changes listed in §9. Baselines: `tmp/story-shots/011/baseline` (59 stories, 472 shots). |
| 2026-10-22 | web-developer → ui-ux-designer | done | Built on `fix/3.11.1-icon-csp-footer-reflow`, all gates green (Jest 161/4056, lint 0 errors, build, test:tools, Storybook, compat 22, Trusted Types 194/194); 464 of 472 shots identical to the baseline, the 8 others the random image. | Review request 011: stories `components-icon--inherited-color` and `layout-footer--sections-large-text` (shots in `tmp/story-shots/011/new/`), and the unchanged-story compare in build.md. |
| 2026-10-22 | ui-ux-designer (review) → release-manager | done | Every AC passes, the unchanged stories match the baseline, and the only finding is a nit with no must-fix. | Prepare the release for request 011 (3.11.1, branch fix/3.11.1-icon-csp-footer-reflow). Apply review nit 1 to the changelog's Compatibility line ("more specific than (0,2,0)"), and run the compat check on Angular 21 too, since the developer ran only --only=22. |
| 2026-10-23 | release-manager → none | done | Review approved, all gates and CI green, tag v3.11.1 pushed, publish run succeeded and the package is staged. | Owner approves the npm stage for @lifecorner/angular-ui-kit 3.11.1 with 2FA (`npm stage approve <id>`). Nothing else is open for request 011. |
