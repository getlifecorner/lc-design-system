# Log 060: Area icons, hero area map, laptop device frame, lc-chip wrap and on-band palette

## Owner decisions

<YYYY-MM-DD HH:MM: question → answer. Empty when none.>

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-11 22:18 | spec-writer → ui-ux-designer | done | The spec is ready and the kit has none of the five items, so the designer is the next step. | Design the API and visuals for AC-1…21 in requests/060-area-icons-area-map-laptop-chip/spec.md. Decide the area-map form (component or hero recipe) and how it avoids shared anchor names across instances. Decide how the three on-band chip names map to chip inputs, and the laptop anatomy. |
| 2026-11-11 23:13 | ui-ux-designer → web-developer | done | design.md is complete and prototyped (heights, anchor isolation, contrast, laptop); baselines for the unchanged stories are in tmp/story-shots/060/baseline. | Implement design.md. |
| 2026-11-12 00:01 | web-developer → ui-ux-designer | done | All 21 ACs are built and measured; the gates are green except compat 22, which the local Node 23.10 blocks (release gate on Node 24). | Review request 060 (stories data-display-area-map--*, data-display-chip--wrap, --wrap-large-text, --emphasis-and-quiet, --on-hero-bands, --on-light-hero, --hooks-on-an-ancestor, data-display-device-frame--laptop, --laptop-sizes, --laptop-and-phone, --laptop-hooks, components-icon--area-icons); build.md has the measures and 2 deviations. |
| 2026-11-12 00:16 | ui-ux-designer → release-manager | done | Review round 1 approved: 21/21 AC pass, no must-fix; 1 should-fix (HooksOnAnAncestor dark 4.01) and 3 nits stay open. | Prepare the release for request 060 (open items in review.md round 1: finding 1 → queue, 2–4 → backlog; run compat on Node 24 and check the icon generator leaves the generated files unchanged). |
| 2026-11-12 00:19 | release-manager → owner | blocked | This session is not allowed to run Node 24 or the icon generator, and the pipeline's release gates require both before any push. | 1. Run `node tools/compat/check-angular-majors.mjs` on Node 24 (nvm v24.21.0) after the library build and confirm all four majors pass (expect 115 checks). 2. Run `npm run generate:icon-names` and confirm `git diff --stat` shows no change in the three generated icon files. Both green (recommended): re-run `/lc-release` for 060 and the release-manager commits, pushes, waits for CI and tags v3.40.0. Either red: hand it to web-developer with the output. |
