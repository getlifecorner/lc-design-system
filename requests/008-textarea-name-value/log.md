# Log 008: lc-textarea name and value for no-script posts

## Owner decisions

2026-10-21 (from the requester's concept): G-CF1 is fixed in the kit first, as 3.10; life-os's form build waits for the release. Run is headless.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-21 | dispatcher → spec-writer | new | Start | Write the spec for this request |
| 2026-10-21 | spec-writer → ui-ux-designer | done | Spec is complete and has no owner questions; the next step is the API and visual design. | Design the API and visuals for AC-1…12 of request 008 (lc-textarea `name`, `value` as model or input, `requiredIndicator`/`requiredAriaLabel`). Decide the `valueChange`/`writeValue` emission behaviour (AC-9) and the `*` ARIA treatment (AC-8). Specify the prerender checks for textarea and `lc-input` (AC-2, AC-6). |
| 2026-10-21 | ui-ux-designer → web-developer | done | The API, states, accessibility and verification are fixed with measured values and the baselines are captured; nothing needs the owner or the spec-writer. | Implement design.md for request 008 (lc-textarea name, value as model, requiredIndicator/requiredAriaLabel, server-only leading-newline guard, 4 stories, compat probe-310 with the 4 EXPECT_IN_HTML rows); record the JS-disabled post and the hydration check in build.md. |
| 2026-10-21 | web-developer → ui-ux-designer | done | Built on `feat/3.10-textarea-name-value`, all gates green (compat 21.0/21/22.0/22); one deviation needs the designer's agreement. | Review request 008 (stories `form-textarea--prefilled-value`, `--prefilled-german`, `--required-without-indicator`, `--no-script-contact-form`); decide build.md Deviation 1 (`valueChange` kept as a class property to avoid an API break). |
| 2026-10-21 | ui-ux-designer → release-manager | done | Review round 1 approved: all 12 AC pass with measurements; Deviation 1 accepted (no API break), design.md rev. 1; no must-fix. | Prepare the release for request 008 (3.10.0); add the `valueChange` type line to Compatibility (review finding 1) and keep nit 2 and the follow-ups listed. |
| 2026-10-21 | release-manager → none | done | Release commit 3.10.0 made; gates from build.md hold (libs/tools unchanged since 921167b), build and pack rechecked. | Pushed through the pipeline; see release.md. |
