# Log 069: external description-list links, single-image upload, badge labels, menu height

## Owner decisions

none

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-19 00:03 | spec-writer → ui-ux-designer | done | The spec is ready and every item is an extension that needs an API and visual design before the build. | Design the API and visuals for AC-1…23 in spec.md. Cover the `external` link icon and registration, the single-image mode (input names, backgrounds, remove output), the badge label element and `maxWidth`, and the room-based `lc-menu` height with its side rule and minimum. |
| 2026-11-19 00:38 | ui-ux-designer → web-developer | done | The design covers AC-1…23 with prototyped geometry, computed contrast and baselines, so the build can start. | Implement design.md for request 069 (D-1…D-8, §2 API, §3 rules, the 9 stories in §8), then compare unchanged stories against tmp/story-shots/069/baseline and baseline-b; record the listed spec-pin updates with their reasons in build.md. |
