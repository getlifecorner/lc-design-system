# Log 040: lc-file-upload without nested interactive elements

## Owner decisions

2026-11-02 (standing rule): fixable review and release findings go into the pipeline without asking.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-03 | spec-writer → ui-ux-designer | done | The spec is ready and the structure choice is a design decision. | Design the structure and visuals for AC-1…17 of request 040. Choose a zone structure without nested interactive elements, and state why Enter, Space, the name, the focus ring and the drag handling still work. Keep the look identical to 3.25.1. |
| 2026-11-03 | ui-ux-designer → web-developer | done | The structure is decided and proven by an in-browser prototype (42/42 shots identical to 3.25.1, 0 axe violations), so it is ready to implement. | Implement design.md for request 040: the internal HTML/SCSS/TS changes in §2, the test changes and new unit tests in §9 (AC-1, 3–8, 12, 16), the compat probe for AC-15, the story wording in §7 and the Fixed changelog draft; justify the one changed assertion in build.md. |
| 2026-11-03 | web-developer → ui-ux-designer | done | All gates are green on the branch and the story review and AC-8 note belong to the designer. | Review request 040 (stories form-file-upload--default, --with-restrictions, --disabled, --single-file, --type-rejected-on-drop, --size-rejected, --german-locale); build shots are in tmp/story-shots/040/build, the log is tmp/040/shots.log and the measure is tmp/040/measure/m.mjs (it waits 900 ms; also at /zz-040/m.mjs until the next Storybook build). Add the AC-8 screen-reader note to review.md. |
| 2026-11-03 | ui-ux-designer → release-manager | done | All 17 AC pass, with 42 of 42 shots identical to 3.25.1 and 0 axe violations, and there is no must-fix finding. | Prepare the release for request 040 (patch 3.25.2). Apply review nit 1 to the changelog wording, run the Angular 21 compat leg, and list nit 2 and follow-ups F-18 to F-21 as open in release.md. |
| 2026-11-03 | release-manager → none | done | Review approved, all gates green (Angular 21 and 22 PASS, 424 files, 1.2 MB); 3.25.2 committed, then main, CI, tag. | Nit 2 and F-18 to F-21 stay open (release.md). |
