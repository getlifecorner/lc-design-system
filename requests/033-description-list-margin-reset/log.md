# Log 033: lc-description-list resets the browser's dd margin

## Owner decisions

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-02 | spec-writer → ui-ux-designer | done | The spec is ready and the fix is a small visual change that needs a story and a before/after measurement. | Design the fix for AC-1…10 (margin reset on .lc-dl__value and .lc-dl__term, plus a BA-8 story at 360 px with short German values and a measurement plan). |
| 2026-11-02 | ui-ux-designer → web-developer | done | Style-only patch with no API change; design, baseline (42 shots) and expected diffs (20/22) are fixed. | Implement design.md: `margin: 0` in `&__term` and `&__value`, the Jest stylesheet test, the new story `ShortValuesAtPhoneWidth`, the CHANGELOG draft (§9 AC-10), and a `--compare` against `tmp/story-shots/033/baseline`. |
| 2026-11-02 | web-developer → ui-ux-designer | done | Implementation matches design.md with all gates green and the expected 20/22 diff; the design review is the next step before release. | Review request 033 (stories components-description-list--short-values-at-phone-width plus the 20 expected diffs in components-description-list--with-leaders, --stacked, --long-values-and-times, --with-value-suffix 360); shots in tmp/story-shots/033/build and tmp/story-shots/033/compare, measures in tmp/033/shots-new.log and tmp/033/shots-compare.log. |
| 2026-11-02 | ui-ux-designer → release-manager | done | The review is approved with no must-fix, all AC pass, and the library code is unchanged since the gate commit 628200a. | Prepare the release for request 033 (patch 3.22.3). In the changelog Compatibility bullet, use "16 of 36 description-list story shots" and drop "a card footer" (review.md finding 1); findings 2–4 stay listed as follow-ups. |
