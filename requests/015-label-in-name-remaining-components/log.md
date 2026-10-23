# Log 015: Label in Name (WCAG 2.5.3) for the remaining eight components under axe-core 4.14

## Owner decisions

2026-10-23: The follow-up itself was approved by the owner (low priority), as stated in the requirement. Headless run: no further questions possible.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-23 14:08 | spec-writer → ui-ux-designer | done | The spec is ready and the wording of the names, including how abbreviated visible text maps to the name, is a design decision. | Design the API and visuals for AC-1…11. For each of the eight controls, define the accessible-name rule so it contains the visible text, in EN and DE. Cover the abbreviated forms (calendar "Mo., 19.", rich-text "H1" and "1.") and long text (AC-6). Keep existing labels as the prefix where possible (AC-5). List old and new default names for the changelog. Plan the Jest axe specs following `header.axe.spec.ts`. |
| 2026-10-23 14:37 | ui-ux-designer → web-developer | done | design.md is complete; the browser prototype was hash-identical in 372/372 shots with 0 label-content-name-mismatch violations, and the baselines (shots and the 898-story axe sweep) are captured. | Implement design.md. |
| 2026-10-23 15:16 | web-developer → ui-ux-designer | done | All gates are green (Jest 177 / 4282, lint 0 errors, build, test:tools, compat 22, shots 372/372 identical, axe sweep 0 label hits in 899 stories × 4 with no other rule changed); deviations are build consequences only. | Review request 015 (stories components-accordion--rich-header, components-accordion-group--rich-header-list, navigation-stepper--localized). |
| 2026-10-23 15:21 | ui-ux-designer → release-manager | done | The review approved all eleven AC and the four deviations, with no must-fix; the open items are a changelog line and a pointer to the list. | Prepare the release for request 015 (patch 3.11.5); add the Compatibility line for rich accordion headers whose ariaLabel/title repeats the template text (review finding 1), and point to the per-story before list for the 31 failing stories (nit 2). |
