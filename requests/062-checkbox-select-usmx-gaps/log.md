# Log 062: lc-checkbox contrast follow-ups, lc-select option groups, USM X kit gaps

## Owner decisions

Run started headless by the owner's bundle command on 2026-11-17 01:23 (bundle 20261117-012300, 3 items).

- 2026-11-17 07:56, owner (resume): continue. The headless run stopped at about 01:58 on the usage limit while ui-ux-designer (design mode) was finishing: design.md is written (01:52, sections 1-9) and the baselines on the 3.41.0 build are in tmp/story-shots/062/ (baseline, baseline-open, baseline-geo and their logs, up to 01:58). Check what is missing, reuse those files instead of re-shooting, and end with the handoff to web-developer.

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-17 01:23 | dispatcher → spec-writer | new | Bundle registered as request 062 | Write the spec for this request |
| 2026-11-17 01:26 | spec-writer → ui-ux-designer | done | The spec is ready and has no open owner questions. | Design the API and visuals for AC-1 to AC-26 in requests/062-checkbox-select-usmx-gaps/spec.md. The AC-17 decision (whether `invalid` also goes on other text fields) is yours, and so is the checkbox 44 px rule (AC-5). |
| 2026-11-17 09:47 | ui-ux-designer → web-developer | done | The design is complete against the template and every AC, the open contrast values are now computed, and the baselines on 3.41.0 are complete and recorded. (Row written late: the dispatcher's first append was refused by the permission check.) | Implement design.md for requests/062-checkbox-select-usmx-gaps (AC-1 to AC-26). The baselines for the review are in tmp/story-shots/062/ (§9 Baselines). List every changed assertion with its reason in build.md (§9 Changed assertions). |
| 2026-11-17 09:47 | web-developer → ui-ux-designer | done | All gates are green on 924479a and the build follows design.md, with four deviations that need the designer's agreement. | Review request 062 (stories form-checkbox--readonly, --readonly-and-disabled, --sizes-with-help-text, form-checkbox-group--readonly, form-select--grouped-options-de, --grouped-options-search-de, components-icon--base-path, components-button--toggle-and-menu-trigger, form-{input,email-input,password-input,number-input,combobox,verification-code-input}--invalid-without-message, data-display-badge--hooks-on-an-ancestor, feedback-spinner--inline-xs; shots in tmp/story-shots/062/new, baseline diffs in tmp/story-shots/062/cmp and cmp2) and rule on build.md Deviations 1–4. |
| 2026-11-17 10:04 | ui-ux-designer → web-developer | changes-requested | AC-22 fails on a measured forced-colours defect in this request's checkbox and radio; everything else passes. | Fix review.md round 1: F-1 (must-fix) add a forced-colours rule to checkbox and radio so every check and dot is CanvasText (GrayText when disabled), including read-only, as design.md §6 now says, and verify with story-shots --forced-colors at 360 px in light and dark; F-2 (should-fix) run npm run generate:icon-names and confirm git diff --exit-code on the 4 generated files (if approval is refused again, say so in build.md for the release-manager). Add the forced-colours fix to the changelog draft. |
