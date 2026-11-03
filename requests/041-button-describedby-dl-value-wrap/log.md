# Log 041: lc-button ariaDescribedBy; lc-description-list short values never break inside

## Owner decisions

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-03 02:25 | dispatcher → spec-writer | new | Request registered (headless) | Write the spec for this request |
| 2026-11-03 02:26 | spec-writer → ui-ux-designer | done | The spec is ready and the next step in the pipeline is design. | Design the API and visuals for AC-1…12 in spec.md. Cover the `ariaDescribedBy` input and its stories, and the description-list wrap rule (the term wraps at word boundaries first, short values never break inside, long unbroken values still wrap). Plan the new 280/312 px card story with leaders, and take baseline shots of the existing description-list stories for AC-10. |
| 2026-11-03 02:55 | ui-ux-designer → web-developer | done | The design covers AC-1…12; the rule was prototyped with 60/60 existing shots identical, and the baselines are captured. | Implement design.md (lc-button ariaDescribedBy + 2 stories + argType; lc-description-list equal-share rule and first-line leader in SCSS + story LongTermsShortValues; ButtonLink docs sentence); verify AC-10 with --compare=tmp/story-shots/041/baseline --full (60) and the button stories with --compare=tmp/story-shots/041/baseline-button (20). |
| 2026-11-03 03:07 | web-developer → ui-ux-designer | done | All gates are green on 0bfaf8e and the existing stories are hash-identical, so the build is ready for design review. | Review request 041 (stories components-button--disabled-with-visible-reason, components-button--loading-with-description, components-description-list--long-terms-short-values; shots in tmp/story-shots/041/build-new-button and build-new-dl); confirm the accordion line-height values and the row-4 term in build.md, and check the button's accessible description in the browser. |
| 2026-11-03 03:13 | ui-ux-designer → release-manager | done | Review round 1 approved all 12 ACs with no must-fix or should-fix findings, and the gates in build.md (e0aff08) still match the libs tree of 0bfaf8e. | Prepare the release for request 041 (3.26.0, minor): lc-button ariaDescribedBy and the lc-description-list short-value wrap fix, using the changelog draft in build.md; the one nit (design values) is already fixed in design.md. |
