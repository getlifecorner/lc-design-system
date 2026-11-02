# Log 035: lc-accordion flush form without inline padding

## Owner decisions

<Date: question → answer. Empty when none.>

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-02 | spec-writer → ui-ux-designer | done | Spec is ready; the existing padding hooks are only a workaround, so an API and visual design is needed. | Design the API and visuals for AC-1…13 (flush form of lc-accordion: input shape, zero inline padding for header and body at all sizes, focus ring that does not sit on the glyphs and works in forced-colors, no sideways shift of the body on expand, stories incl. a sheet/card alignment story and DE text at 360 px). |
| 2026-11-02 | ui-ux-designer → web-developer | done | The design is complete, with prototype-checked values for AC-1 to AC-13 and no owner decision needed. | Implement design.md for request 035 (variant="plain", --lc-accordion-header-bleed, the three stories, the plain axe case, the compat fixture line and EXPECT_IN_HTML entry); keep the 90 baseline shots in tmp/story-shots/035/baseline hash-identical. |
