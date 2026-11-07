# Log 056: lc-state-strip, description-list badge and total, list chevron, header contextBadge, hero headingLevel and focusTitle(), stacked-bar band, table footerRow and action ariaLabel, card collapsible, button inverse variant, backlog sweep (5 rows)

## Owner decisions

2026-11-07 13:27: bundle size → all collected requests and the whole backlog run in this one request and one version; the bundle-size limit of about 8 items does not apply, so no item goes back to the inbox for size. Fix what is a defect; a known limit may be resolved as documented with a reason. 054-n2 needs WebKit, which is not installed here: if it can't be checked, keep it in the backlog and say so. (Item 7 of the bundle.)

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-07 13:30 | spec-writer → ui-ux-designer | done | The spec is ready and has no owner decisions pending; the next step in the normal route is design. | Design the API, anatomy, states, tokens and accessibility for AC-1 to AC-34 of requests/056-state-strip-footer-collapse-backlog/spec.md. Settle the open design choices: state-strip keyboard model and non-hue distinction, `inverse-outline` versus `inverse-ghost`, card toggle and header-action nesting, and how `badge` relates to `value`. Provide story baselines at 360 and 1280 px, light and dark. |
| 2026-11-07 15:28 | ui-ux-designer → web-developer | done | design.md is complete with prototyped values, every open choice is decided (D-1 to D-11), and the 768 baseline shots are captured. | Implement design.md (request 056) on a branch `feat/3.36-state-strip-footer-collapse`; the baselines in tmp/story-shots/056/baseline (192 stories, 360/1280 L/D, 800 ms wait measure) must stay identical except the 6 unstable table shots listed in design §9. |
| 2026-11-07 16:31 | web-developer → ui-ux-designer | done | All gates are green, 762 of 768 baseline shots are identical (the 6 others are the known random table shots), and the new stories wait for the design review. | Review request 056 (stories: state-strip default/all-states/german/keyboard-focus/many-segments/empty, description-list badge-values/total-row, list chevron-rows, header context-badge/hamburger-focus-return, hero heading-level/focus-title/stage-actions, button and button-link inverse-outline, stacked-bar-chart band, table footer-row/row-action-names, card collapsible, combobox error-after-submit; shots in tmp/story-shots/056/build-new) and agree or object to the deviations in build.md (D-11 render fallbacks, rowheader in tree mode, mark inset, head cursor). |
| 2026-11-07 16:52 | ui-ux-designer → release-manager | done | The review found no must-fix, the gates are green on 4d8d21a (`git diff --quiet 4d8d21a -- libs tools` holds), and the unchanged stories match the baseline. | Prepare the release for request 056 (3.36.0). Route S-1, F-1 and F-2 to the queue and N-1 and N-2 to the backlog (review.md → Findings), and add to the 054-n2 row "still open after 056 (2026-11-07): no Playwright/WebKit installed". |
| 2026-11-07 17:20 | release-manager → none | done | Release commit made; gates green; CI, tag and publish follow. | Queue 056-s1 (S-1 state-strip dense targets), 056-s2 (F-2 list nested action), 056-s3 (F-1 chart palette contrast) for the next bundle. |
