# Log 033: lc-description-list resets the browser's dd margin

## Owner decisions

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-02 | spec-writer → ui-ux-designer | done | The spec is ready and the fix is a small visual change that needs a story and a before/after measurement. | Design the fix for AC-1…10 (margin reset on .lc-dl__value and .lc-dl__term, plus a BA-8 story at 360 px with short German values and a measurement plan). |
| 2026-11-02 | ui-ux-designer → web-developer | done | Style-only patch with no API change; design, baseline (42 shots) and expected diffs (20/22) are fixed. | Implement design.md: `margin: 0` in `&__term` and `&__value`, the Jest stylesheet test, the new story `ShortValuesAtPhoneWidth`, the CHANGELOG draft (§9 AC-10), and a `--compare` against `tmp/story-shots/033/baseline`. |
