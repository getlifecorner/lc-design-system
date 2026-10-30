# Log 019: App shell full-height nav, sidenav text brand, shell background, stat-trend sentiment

## Owner decisions

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-30 12:46 | spec-writer → ui-ux-designer | done | The kit does not cover the four gaps and no owner decision is needed, so the request goes to design. | Design the API and visuals for AC-1…22 in requests/019-app-shell-full-height-nav/spec.md. Decide the full-height DOM and tab order, how the brand link relates to the collapse toggle, and the final input and hook names. |
| 2026-10-30 13:20 | ui-ux-designer → web-developer | done | design.md is ready: API, anatomy, states, computed contrast, stories and verification for AC-1…22; baselines captured (45 stories, 270 shots in tmp/story-shots/019/baseline). | Implement design.md. |
| 2026-10-30 13:51 | web-developer → ui-ux-designer | done | The build is complete with every gate green and committed, so the stories now need the design review. | Review request 019 (stories layout-app-shell--full-height-nav, --full-height-nav-horizon, --tinted-background; navigation-sidenav--text-brand, --text-brand-collapsed-vs-expanded, --text-brand-german, --text-brand-drawer-german; charts-stat-trend--costs, --sentiment). Shots and measurements: tmp/story-shots/019/new and tmp/019/*.log; also decide on the pre-existing 1.89:1 ring of a theme="light" rail on a dark page (build.md). |
| 2026-10-30 14:02 | ui-ux-designer → web-developer | changes-requested | AC-13 fails: the focus ring of a `theme="light"` rail on a dark page measures 1.89:1, below the 3:1 the spec requires for the new brand link. | Fix F1 from review.md round 1 (light-theme `--_lc-sidenav-t-accent: #208497` read by every sidenav `:focus-visible` outline and the active bar's default; docs, plus a changelog Fixed line), and S1, N1 and N2 in the same round. Re-measure with tmp/story-shots/019/r1/ring-measure.js, hash-compare against 019/build and 019/new (expected diffs: collapsed-rail-badges 1024/1280 dark, text-brand dark, full-height-nav-horizon), and run the compat check on Angular 21 and 22. |
