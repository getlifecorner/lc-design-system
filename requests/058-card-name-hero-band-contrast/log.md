# Log 058: lc-card accessible name, lc-hero band contrast

## Owner decisions

- 2026-11-10 11:28: Q1 look of the success and warning hero bands → **1a**: darker success and warning bands with white text, like the other seven (design.md option H1). Also add the *Light Slim* hero story finding from design.md (N-1) to `requests/BACKLOG.md`.

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-10 09:55 | spec-writer → ui-ux-designer | done | The spec is ready, and the hero look needs a design decision before it is built. | Design the API and visuals for AC-1…12. For the card, decide where the DOM whitespace goes with no visible change. For the hero, pick the fix (darker end stops or a CSS scrim) and give the contrast table for all 9 colours in both variants. Flag it if any band moves beyond a shade step. |
| 2026-11-10 10:27 | ui-ux-designer → owner | needs-owner | Spec Assumption 1 sends it to the owner when the band fix moves beyond a shade step, and every darker-band or scrim fix does that for success and warning. Everything else is designed and prototyped. | 1. Look of the success and warning hero bands (design.md §1, §5): (a) recommended: darker bands with white text like the other seven (success #46543b→#697957, warning #68481d→warning-dark); moves both beyond a shade step (1.72 / 2.05 vs the kit's 1.42–1.54) and makes white content on them pass, including the inverse button. (b) Dark text (#111827) on those two bands: both stay within a step (dark end lightened to #738961 / #ae7830), but changes the documented "dark gradient, white text" rule and white content on them keeps failing. (c) Ship the card fix and the other seven bands now and leave success and warning below AA until a later bundle. Then the designer hands off to web-developer with "Implement design.md (option H1 or H2)". Headless run stopped. |
| 2026-11-10 11:29 | ui-ux-designer → web-developer | done | The owner settled Q1 as 1a (H1), so the design is complete and the baselines exist; nothing else needs a decision. | Implement design.md (option H1). |
