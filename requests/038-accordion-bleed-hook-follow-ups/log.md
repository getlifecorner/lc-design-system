# Log 038: lc-accordion bleed hook robust to a unitless 0, scroll-container note

## Owner decisions

Empty.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-02 23:10 | dispatcher → spec-writer | new | Start of the request | Write the spec for this request |
| 2026-11-02 23:12 | spec-writer → ui-ux-designer | done | The spec is ready and the open design choice (CSS fix or documentation) belongs to the designer. | Design the fix for AC-1…9 in requests/038-accordion-bleed-hook-follow-ups/spec.md. Quickly decide whether `@property` with `<length>` (or another CSS-only approach) handles a bare `0` without side effects. If it doesn't, take the documentation route (AC-2) in the `variant` JSDoc, the docs bullet, the story text and the changelog. Either way, add the "clipping or scrolling edge" wording (AC-4) and record the decision in design.md. |
| 2026-11-02 23:20 | ui-ux-designer → web-developer | done | The design is ready; the CSS-only fix works without side effects in the prototype, so the AC-1 route is taken and the remaining work is implementation. | Implement design.md for request 038 (SCSS `@property` + `::before` declarations, SCSS comment, `variant` JSDoc, docs bullet and Plain Variant story text, plain spec assertion change + new assertions, EXPECT_IN_HTML entry), and draft the changelog entry from design §7 in build.md. |
| 2026-11-02 23:50 | web-developer → ui-ux-designer | done | Implemented as designed and all gates are green; the design review of the existing plain stories is next. | Review request 038 (stories components-accordion--plain-variant, components-accordion--plain-in-card; text-only changes in the docs bullet and the Plain Variant description; 108/108 shots hash-identical to the baseline). |
