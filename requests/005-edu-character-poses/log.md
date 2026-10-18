# Log 005: Edu's character poses as kit assets (G-4)

## Owner decisions

2026-10-18 (from the requester, life-os app-shell D10): static files plus an optional component in its own secondary entry point, not an `lc-logo` variant, so `lc-header` and `lc-logo` stay light.

2026-10-19: CI failed on release commit 580b388 (on origin/main, unpublished) → fix forward: web-developer fixes on a fix branch and lands the fix on main on top of 580b388 (no history rewrite); release-manager then reruns the gates and starts the publish pipeline for 3.8.0 on the new HEAD.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-18 | dispatcher → spec-writer | new | start of the request | Write the spec for this request |
| 2026-10-18 | spec-writer → ui-ux-designer | done | The spec is ready and every open point is recorded as an assumption, so the designer can proceed. | Design the API and visuals for AC-1…21 of requests/005-edu-character-poses/spec.md. Cover the `lc-character` inputs and hooks, the asset path and string-export form, the generated dark rule, the `.lc-horizon__figure` geometry, and the stories. |
| 2026-10-18 | ui-ux-designer → web-developer | done | The API, files, dark rule, horizon geometry, contrast, stories and per-AC checks are fixed; nothing needs the owner, and the baseline could not be captured in this headless session. | Implement design.md for request 005 (AC-1…21). Step 0, before touching any file: build Storybook on main and capture the baseline with the exact story-shots command in design.md §9. |
| 2026-10-19 | web-developer → ui-ux-designer | done | All gates are green on 34f188f and every AC is covered; the visual review of the new stories is the designer's. | Review request 005 (stories components-character--*, design-tokens-horizon--with-figure, design-tokens-horizon--figure-and-footer; shots in tmp/story-shots/005/). Check the on-dark-surface placement at 1280 (t 0.85, 2.71:1) and the dark-theme card. |
| 2026-10-19 | ui-ux-designer → web-developer | changes-requested | One must-fix in a story (Hallo past the band rule at 1024/1280); the design itself was corrected in design.md. | Fix review.md round 1: OnDarkSurface figure `left: 16px` (t 0.351/0.587/0.660 at 360/1024/1280), docs band rule names the box centre and the short-band right end; re-shoot that story only. |
| 2026-10-19 | web-developer → ui-ux-designer | done | Findings 1 and 2 are fixed in `b32be26` and the measured placement equals the review's values; the re-shot story is the designer's to approve. | Review request 005 round 1 fix: story components-character--on-dark-surface (shots in tmp/story-shots/005/r1/, t 0.351 / 0.587 / 0.660, x 36 / 624 / 880) and the docs page's band rule and card-corner recipe. |
| 2026-10-19 | ui-ux-designer → release-manager | done | Round 2 closes findings 1 and 2, the gates passed on b32be26 and nothing in libs or tools has changed since, and only nits are open. | Prepare the release for request 005 (3.8.0). First squash b32be26, c96cd18 and 3c993d8 into acf0e7c as one feat(character) commit, and commit the request documents, including the untracked review.md; nits 3 and 4 from review.md round 2 stay listed in the release. |
| 2026-10-19 | release-manager → owner | blocked | CI run 39174864979 failed on release commit 580b388 (already on origin/main, not published, no tag): compat check "MISSING character: decorative, in the horizon slot, files from the logo base path (G-4)" on all Angular versions; passed locally with --only=22. | Decide how to fix the failing character prerender check; the agent could not investigate further without `git reset --hard`. |
| 2026-10-19 | owner → web-developer | answered | Owner chose fix forward. | Find and fix the cause of the failing compat check "MISSING character: decorative, in the horizon slot, files from the logo base path (G-4)" (CI run 39174864979, all Angular versions) on a fix branch, and land the fix on main on top of 580b388 without rewriting history; then hand to release-manager to rerun the gates and publish 3.8.0. |
