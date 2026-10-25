# Log 016: Contact form field and alert gaps

## Owner decisions

Headless run (scripts/lc-request.sh); none.

- 2026-10-25 17:24: request 017 ran headless in the same working tree, also changes lc-input and would take 3.12 too. Owner: stop 017, finish and release 016 (3.12.0) first, then resume 017 on top of it.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-25 01:57 | dispatcher → spec-writer | new | Start of the request | Write the spec for this request |
| 2026-10-25 02:00 | spec-writer → ui-ux-designer | done | The spec is ready, and the API names and visuals are the designer's decisions. | Design the API and visuals for AC-1…15 in requests/016-contact-form-field-gaps/spec.md. You choose the id input name (`inputId` on `lc-input` must stay readable), the name of the error-without-role input, whether `requiredAriaLabel` is documented as having no effect, the single asterisk gap value (recommended 4 px), and the link styling for `a[slot="action"]` in `lc-alert`. |
| 2026-10-25 14:04 | ui-ux-designer → web-developer | done | The API, layout, tokens, contrast and stories are settled in design.md, so the next step is the code. | Implement design.md for request 016 (`controlId`, `announceError`, the asterisk change and `requiredAriaLabel` deprecation on lc-input and lc-textarea; link styles in lc-alert's action slot; the five stories in §8), and record the measurements from §9 in build.md. |
| 2026-10-25 17:29 | web-developer → ui-ux-designer | done | All gates are green (Jest 180 / 4316, lint 0 errors, build, test:tools, compat 22 68/68, shots 168/200 identical, the other 32 differ only at a `*`); the stories need the design review. | Review request 016 (stories form-input--error-summary, form-input--required-asterisk, form-textarea--error-without-alert-role, feedback-alert--link-action, feedback-alert--link-action-stacked) against design.md; build.md lists the §9 measurements and one note (the 503 button at 200 %). |
| 2026-10-25 17:30 | web-developer → ui-ux-designer | done | All gates are green and the stories now need the design review in the browser. | Review request 016 (stories form-input--error-summary, form-input--required-asterisk, form-textarea--error-without-alert-role, feedback-alert--link-action, feedback-alert--link-action-stacked) against design.md, and add the screen-reader pass for AC-11 to review.md. build.md has the §9 measurements and one note to decide on: the button in the stacked 503 story at 200 % text. |
| 2026-10-25 17:45 | ui-ux-designer → web-developer | changes-requested | A story in the kit shows summary links below its own 44 px rule. My design caused it and design.md is corrected, while all ACs and the library code pass. | Fix review.md findings 1 and 3 in input.stories.ts ErrorSummary only. Use `<ul style="list-style: none; margin: 4px 0 0; padding: 0">` with `<a lcButton variant="link" size="sm" [flush]="true" href="#…">` links, and give the textarea the default size md. Rebuild Storybook, shoot `form-input--error-summary` at 360 and 1280 in light and dark, and record in build.md: links x 69 and h ≥ 44, one `[role=alert]`, and focus on `contact-email` / `contact-message` after the click. |
