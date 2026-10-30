# Log 020: App shell prove gaps (page spacing, empty state, avatar, outline tone, sidenav theme)

## Owner decisions

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-30 17:30 | spec-writer → ui-ux-designer | done | The spec is ready and all seven rows need API and visual decisions before the build. | Design the API and visuals for AC-1…18 of requests/020-app-shell-prove-gaps/spec.md. Read concept sections 5.4, 7 and 8 of finance-intelligence app-shell.md for the target values. Pick the mechanism for rows 1, 2 and 7. Row 7 must keep the 019 behaviour and the `sidenav.brand.spec.ts` structure. |
| 2026-10-30 18:03 | ui-ux-designer → web-developer | done | The design fixes the API, values, contrast and stories for all seven rows (A1 records the 16/32 vs header-24 conflict), and 676 baseline shots were captured on db2da64. | Implement design.md. |
| 2026-10-30 18:50 | web-developer → ui-ux-designer | done | All gates are green on the final package and the screenshot compare shows no real regressions, so the stories are ready for design review. | Review request 020 (stories layout-app-shell--state-page-aligned, layout-app-shell--state-page-loading, layout-app-shell--page-padding-per-breakpoint, layout-page-header--padding-top, feedback-empty-state--primary-tone, feedback-empty-state--state-page, data-display-avatar--person-fallback, navigation-header--avatar-person-fallback, components-button--outline-primary-tone, components-button-link--outline-primary-tone, navigation-sidenav-placeholder--hooks-on-an-ancestor); shots in tmp/story-shots/020/new, measures and notes in build.md. |
| 2026-10-30 19:03 | ui-ux-designer → release-manager | done | All 18 ACs pass with measurements, the baseline compare shows only known noise, and there is no must-fix. | Prepare the release for request 020 (3.15.0). List review.md findings S1 (md empty-state heading doesn't wrap at 320 px), S2 (pre-existing lc-menu danger item 2.06:1 in dark; needs its own fix request) and N1–N3 as open. |
