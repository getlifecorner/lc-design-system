# Log 043: Targets, hover borders and contrast follow-ups of 042

## Owner decisions

2026-11-02 (standing rule): fixable review and release findings go into the pipeline without asking; releases may bundle requests.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-03 | spec-writer → ui-ux-designer | done | Spec is ready and needs no owner decision (patch, no API change), so it goes to design. | Design the API and visuals for AC-1…15 of requests/043-targets-hover-contrast-follow-ups/spec.md. Cover the per-component target approach (hit area or real size), the hover and error border rules, the rich-text-editor frame token, the header theme scoping for child buttons and inks, the F-26 contrast fixes and the new stories. |
| 2026-11-03 | ui-ux-designer → web-developer | done | design.md is ready (patch, no API change); every value prototyped and measured, baseline captured. | Implement design.md (D-1 … D-10: hit areas and 44 px sizes per §3, field hover/error rules, RTE frame token, header theme-scope mixins, F-26 inks, log output tab stop, kanban tint) and the 12 stories of §8; verify per §9 against tmp/story-shots/043/baseline (expect 174 differ / 275 identical / 73 unstable). |
| 2026-11-03 | web-developer → ui-ux-designer | done | The build is complete with all gates green, and two deviations plus three findings, including the select axe target-size, need the designer's call before release. | Review request 043: the stories feedback-notification-center--touch-targets, data-display-logviewer--touch-targets, data-display-logviewer--output-region-focus, feedback-callout--touch-targets, form-select--touch-targets, form-tag-input--touch-targets, editors-rich-text-editor--touch-targets, data-display-document-viewer--touch-targets, components-chat--touch-targets, data-display-table--touch-targets, navigation-header--theme-scope and form-input--error-state-on-hover (shots in tmp/story-shots/043/new). Agree to or reject Deviations 1–3 and decide Findings A–C in build.md. |
| 2026-11-03 | ui-ux-designer → web-developer | changes-requested | Three acceptance criteria fail (AC-1 tag story, AC-8 select axe, AC-15 changelog text), and the fixes are small and tested in prototypes. | Fix review.md round 1 F1–F4: make the six German tags render in form-tag-input--touch-targets and re-run hit.mjs; document the sm 44 × 37 exception in the table story and changelog; replace the select × `::before` with the 24 px box CSS from F3 and update its spec row; correct the changelog ("9 components", select × wording). Then re-shoot the select stories against new/ and baseline with `--axe`. |
