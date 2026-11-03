# Log 044: Chat remove target, editor mode state, filled-field boundary (043 follow-ups)

## Owner decisions

Standing rule 2026-11-02: findings that need fixing go back into the pipeline without asking; a measured WCAG 2.2 AA failure is at least should-fix. Run started headless (`--from owner --headless`).

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-03 09:44 | spec-writer → ui-ux-designer | done | The spec is ready, it needs no owner decision, and the next step is design. | Design the fixes for AC-1…16 of request 044. That means the 44 px hit area for the chat `__pending-remove` button (reuse the 043 `min()` inset pattern), `aria-pressed` and a forced-colours mark for the rich-text-editor mode buttons, and a 3:1 border at rest and on hover for the `--filled` variants of select, textarea and datepicker. Include the stories, the measurements and the baselines. |
| 2026-11-03 10:20 | ui-ux-designer → web-developer | done | The design is complete and prototyped, it needs no owner decision, and the next step is implementation. | Implement design.md of request 044: the CSS, template and story changes in §2 and §8 (6 new stories), the spec edits and new assertions in §9 for AC-8/9/10, and the compat aria-pressed check. Then compare against tmp/story-shots/044/baseline: 240 of 252 shots should stay identical. |
