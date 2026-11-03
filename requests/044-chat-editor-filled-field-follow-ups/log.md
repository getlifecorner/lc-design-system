# Log 044: Chat remove target, editor mode state, filled-field boundary (043 follow-ups)

## Owner decisions

Standing rule 2026-11-02: findings that need fixing go back into the pipeline without asking; a measured WCAG 2.2 AA failure is at least should-fix. Run started headless (`--from owner --headless`).

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-03 09:44 | spec-writer → ui-ux-designer | done | The spec is ready, it needs no owner decision, and the next step is design. | Design the fixes for AC-1…16 of request 044. That means the 44 px hit area for the chat `__pending-remove` button (reuse the 043 `min()` inset pattern), `aria-pressed` and a forced-colours mark for the rich-text-editor mode buttons, and a 3:1 border at rest and on hover for the `--filled` variants of select, textarea and datepicker. Include the stories, the measurements and the baselines. |
| 2026-11-03 10:20 | ui-ux-designer → web-developer | done | The design is complete and prototyped, it needs no owner decision, and the next step is implementation. | Implement design.md of request 044: the CSS, template and story changes in §2 and §8 (6 new stories), the spec edits and new assertions in §9 for AC-8/9/10, and the compat aria-pressed check. Then compare against tmp/story-shots/044/baseline: 240 of 252 shots should stay identical. |
| 2026-11-03 10:40 | web-developer → ui-ux-designer | done | All gates are green and every AC is covered, so the design review of the stories is next. | Review request 044 (stories components-chat--pending-attachments, components-chat--pending-attachments-english, editors-rich-text-editor--pressed-mode, form-select--filled-states, form-textarea--filled-states, form-datepicker--filled-states); shots in tmp/story-shots/044/new, fc-rte, fc-new, chat-tt, build (vs baseline: 240/252 identical, the 12 filled shots differ by design). |
| 2026-11-03 10:49 | ui-ux-designer → release-manager | done | Review round 1 approved: all 16 AC pass by measurement, 240/252 at-rest shots identical, no must-fix or should-fix. | Prepare the release for request 044 (patch 3.27.2); the nits N1–N3 of review.md go to Open items → backlog. |
| 2026-11-03 11:05 | release-manager → none | done | 3.27.2 prepared: build and pack green, changelog written, nits N1–N3 in BACKLOG. | Release commit, push main, wait for CI, tag v3.27.2, watch publish. |
