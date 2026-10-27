# Log 018: lc-alert in a narrow container: long words and a narrow layout

## Owner decisions

2026-10-27 (from the requester's concept, row G-WL4): kit first; T092's FR-017 row for the DE 503 page waits for the release.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-27 07:45 | dispatcher → spec-writer | new | Request registered | Write the spec for this request |
| 2026-10-27 07:47 | spec-writer → ui-ux-designer | done | The spec is ready and the open points (threshold, layout details) are design decisions, not owner decisions. | Design the API and visuals for AC-1…12 of request 018. Choose the narrow-layout threshold and the word-break values, and take the narrow-layout geometry from lc-next-step-card TD-1 (icon in the title row, density-token padding). Make plain alerts size containers without changing their size, and take the 123 px DE/EN reproduction as the baseline story at 200 % text. |
| 2026-10-27 08:08 | ui-ux-designer → web-developer | done | The design is complete and prototyped against the 3.13.0 Storybook build, with only the 2 expected baseline differences; nothing needs the owner or the spec-writer. | Implement design.md for request 018 (SCSS narrow layout under `@container lc-alert (width < 16rem)`, container on every alert, JSDoc and docs text, 3 new stories, Jest for AC-1/AC-4, changelog draft); mind risks R1–R3 in design.md §9 and compare against `tmp/story-shots/018/baseline` (expect exactly 2 diffs). |
