# Log 035: lc-accordion flush form without inline padding

## Owner decisions

<Date: question → answer. Empty when none.>

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-02 | spec-writer → ui-ux-designer | done | Spec is ready; the existing padding hooks are only a workaround, so an API and visual design is needed. | Design the API and visuals for AC-1…13 (flush form of lc-accordion: input shape, zero inline padding for header and body at all sizes, focus ring that does not sit on the glyphs and works in forced-colors, no sideways shift of the body on expand, stories incl. a sheet/card alignment story and DE text at 360 px). |
| 2026-11-02 | ui-ux-designer → web-developer | done | The design is complete, with prototype-checked values for AC-1 to AC-13 and no owner decision needed. | Implement design.md for request 035 (variant="plain", --lc-accordion-header-bleed, the three stories, the plain axe case, the compat fixture line and EXPECT_IN_HTML entry); keep the 90 baseline shots in tmp/story-shots/035/baseline hash-identical. |
| 2026-11-02 | web-developer → ui-ux-designer | done | Implementation is complete and all gates are green on bf00b8d; the stories need the design review. | Review request 035 (stories components-accordion--plain-variant, --plain-sizes, --plain-in-card; shots in tmp/story-shots/035/build, focus, focus-fc, hover; measure module tmp/035/measure/m.mjs, already copied into dist/storybook/angular-ui-kit/zz-035/). |
| 2026-11-02 | ui-ux-designer → release-manager | done | Review round 1 has no must-fix; all AC pass, the 90 baseline shots are hash-identical and the gates are green on bf00b8d. | Prepare the release for request 035 (3.23.0, lc-accordion variant="plain", BA-9); in the CHANGELOG hook line add review.md finding 1 ("a length; `0px`, not `0`, which removes the ring") and finding 2 ("before a clipping or scrolling edge"), and list both as open items. |
| 2026-11-02 | release-manager → none | done | Review approved, gates green, CI and publish run green, tag on the release commit, docs deployed. | Release 3.23.0 is staged on npm. The owner approves it with `npm stage approve <id>` (2FA); the stage ID is not available from this machine. The JSDoc and docs-bullet note for the `0px` finding can ride along with a later change. |
