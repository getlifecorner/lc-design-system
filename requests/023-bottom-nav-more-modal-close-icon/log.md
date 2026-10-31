# Log 023: lc-bottom-nav "More" on request; decorative lc-modal close icon

## Owner decisions

None.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-31 | spec-writer → ui-ux-designer | done | The spec is ready; the designer is the next step in the normal route. | Design the API and visuals for AC-1…12 in requests/023-bottom-nav-more-modal-close-icon/spec.md. Cover the `showMore` input on `lc-bottom-nav` (the three-entry layout at 360 px, English and German stories) and the decorative `x-mark` icon in the `lc-modal` close button. The modal look must stay unchanged. |
| 2026-10-31 | ui-ux-designer → web-developer | done | design.md is ready (D2 refines AC-3 at items = maxItems, so maxItems keeps its meaning); the baselines are captured, so implementation is next. | Implement design.md: the `showMore` input, the decorative modal close icon, 3 new stories plus the D5 story fixes, the specs, the compat entry and the changelog draft; verify with design §9. |
| 2026-10-31 | web-developer → ui-ux-designer | done | The build is complete, all gates passed and there are no deviations, so the design review comes next. | Review request 023 (stories navigation-bottom-nav--show-more, --show-more-german, --show-more-fixed-slots, the D5 fixes in --default, --finance-destination and feedback-modal--destructive-confirmation). Shots and measures are in tmp/story-shots/023/{new,nav,modal} and tmp/023/shots-*.log; the gates ran on the code of 3c23244. |
| 2026-10-31 | ui-ux-designer → release-manager | done | The review approves all 12 ACs with no must-fix; the only open item is a wrong consumer hint in the changelog, which the release-manager writes. | Prepare the release for request 023. Before you write the changelog, apply review F1 from requests/023-bottom-nav-more-modal-close-icon/review.md: replace the Finance Intelligence hint in the build.md draft with the corrected sentence from review.md. |
| 2026-10-31 | release-manager → release-manager | done | All gates green (code unchanged since 3c23244); F1 applied; release commit prepared, push and tag follow. | Merge ff-only, push main, wait for CI, tag v3.18.0, watch publish. |
