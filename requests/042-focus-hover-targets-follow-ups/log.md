# Log 042: Focus indicators, focus over hover, dependency-viewer at 360 px, file-upload remove target

## Owner decisions

2026-11-02: standing rule — fixable review and release findings go into the pipeline without asking; releases may bundle requests.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-03 03:30 | dispatcher → spec-writer | new | headless run from owner | Write the spec for this request |
| 2026-11-03 03:32 | spec-writer → ui-ux-designer | done | The spec is ready and the kit's API and visuals now need designing. | Design the fixes for AC-1…15. Sweep and measure focus indicators (F-18), measure the hover-versus-focus contrast in every field component with that pattern (F-19), choose a 360 px layout for the dependency-viewer (F-20), and design the 44 px hit area for the file-upload remove button (F-21). Decide whether the global button reset should be kept or narrowed. |
| 2026-11-03 04:07 | ui-ux-designer → web-developer | done | The design is complete with measured values, the decisions are inside agent authority (a minor release because of one new optional input), and the at-rest baseline is captured. | Implement design.md (D-1…D-9: narrowed button reset, rings for the §6.1 B–F elements, forced-colours rules, F-19 hover exclusions, dependency-viewer sideways scroll with the new regionLabel input, 44 px remove hit area with per-file name, the §8 stories and story token edits). Run the §9 checks and record them in build.md. |
| 2026-11-03 04:53 | web-developer → ui-ux-designer | done | All gates are green and every §9 check is recorded; the design review and one design decision (the kanban ring offset) remain. | Review request 042 (stories *--keyboard-focus ×16, form-file-upload--remove-targets, data-display-dependency-viewer--phone-width and --phone-width-de, plus the D-5 edits in button destructive-action, tooltip toolbar, toolbar inside-card); decide the kanban over-limit ring (2.19:1 light, inset −2 px gives 4.36) and accept or reject build.md deviations 1–3 and follow-up F-26. |
| 2026-11-03 05:08 | ui-ux-designer → web-developer | changes-requested | One must-fix (kanban ring 2.19:1 on the over-limit column, AC-2); design.md changed to an inset ring (change r1). | Fix review.md round 1: finding 1 (kanban card `outline-offset: -2px`, guard spec, story description, changelog line) and the story-only findings 2–5; re-run the kanban ring measure on *With WIP Overflow* and *Keyboard Focus*, `--axe` on the touched stories, and record in build.md. |
