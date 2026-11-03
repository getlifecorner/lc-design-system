# Log 041: lc-button ariaDescribedBy; lc-description-list short values never break inside

## Owner decisions

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-03 02:25 | dispatcher → spec-writer | new | Request registered (headless) | Write the spec for this request |
| 2026-11-03 02:26 | spec-writer → ui-ux-designer | done | The spec is ready and the next step in the pipeline is design. | Design the API and visuals for AC-1…12 in spec.md. Cover the `ariaDescribedBy` input and its stories, and the description-list wrap rule (the term wraps at word boundaries first, short values never break inside, long unbroken values still wrap). Plan the new 280/312 px card story with leaders, and take baseline shots of the existing description-list stories for AC-10. |
| 2026-11-03 02:55 | ui-ux-designer → web-developer | done | The design covers AC-1…12; the rule was prototyped with 60/60 existing shots identical, and the baselines are captured. | Implement design.md (lc-button ariaDescribedBy + 2 stories + argType; lc-description-list equal-share rule and first-line leader in SCSS + story LongTermsShortValues; ButtonLink docs sentence); verify AC-10 with --compare=tmp/story-shots/041/baseline --full (60) and the button stories with --compare=tmp/story-shots/041/baseline-button (20). |
