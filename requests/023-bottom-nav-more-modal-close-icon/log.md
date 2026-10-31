# Log 023: lc-bottom-nav "More" on request; decorative lc-modal close icon

## Owner decisions

None.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-31 | spec-writer → ui-ux-designer | done | The spec is ready; the designer is the next step in the normal route. | Design the API and visuals for AC-1…12 in requests/023-bottom-nav-more-modal-close-icon/spec.md. Cover the `showMore` input on `lc-bottom-nav` (the three-entry layout at 360 px, English and German stories) and the decorative `x-mark` icon in the `lc-modal` close button. The modal look must stay unchanged. |
| 2026-10-31 | ui-ux-designer → web-developer | done | design.md is ready (D2 refines AC-3 at items = maxItems, so maxItems keeps its meaning); the baselines are captured, so implementation is next. | Implement design.md: the `showMore` input, the decorative modal close icon, 3 new stories plus the D5 story fixes, the specs, the compat entry and the changelog draft; verify with design §9. |
