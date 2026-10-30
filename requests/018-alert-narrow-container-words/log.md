# Log 018: lc-alert in a narrow container: long words and a narrow layout

## Owner decisions

2026-10-27 (from the requester's concept, row G-WL4): kit first; T092's FR-017 row for the DE 503 page waits for the release.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-27 07:45 | dispatcher → spec-writer | new | Request registered | Write the spec for this request |
| 2026-10-27 07:47 | spec-writer → ui-ux-designer | done | The spec is ready and the open points (threshold, layout details) are design decisions, not owner decisions. | Design the API and visuals for AC-1…12 of request 018. Choose the narrow-layout threshold and the word-break values, and take the narrow-layout geometry from lc-next-step-card TD-1 (icon in the title row, density-token padding). Make plain alerts size containers without changing their size, and take the 123 px DE/EN reproduction as the baseline story at 200 % text. |
| 2026-10-27 08:08 | ui-ux-designer → web-developer | done | The design is complete and prototyped against the 3.13.0 Storybook build, with only the 2 expected baseline differences; nothing needs the owner or the spec-writer. | Implement design.md for request 018 (SCSS narrow layout under `@container lc-alert (width < 16rem)`, container on every alert, JSDoc and docs text, 3 new stories, Jest for AC-1/AC-4, changelog draft); mind risks R1–R3 in design.md §9 and compare against `tmp/story-shots/018/baseline` (expect exactly 2 diffs). |
| 2026-10-27 08:23 | web-developer → ui-ux-designer | done | Implementation is complete with all gates green and measurements matching design.md §9, so the design review is next. | Review request 018 (stories feedback-alert--narrow-container, feedback-alert--narrow-layout, feedback-alert--narrow-column; shots in tmp/story-shots/018/final and /new100), including build.md deviations 1–3 (button-doc setter list, the DE string for the alert without a title, the 100 % wide-layout overflow note). |
| 2026-10-27 08:35 | ui-ux-designer → release-manager | done | The review is approved with no must-fix, and the gates in build.md hold on commit 2a742f1, so the request can be released. | Prepare the release for request 018 (patch 3.13.1). Open items are review.md S1 (add a Known line: at 320 px and 100 % text a long compound title runs under the ×), S2 and S3 (follow-up gaps), and N1 (the containment can change text anti-aliasing elsewhere on the page in screenshot tests). |
| 2026-10-27 08:46 | release-manager → owner | done | The release is staged with provenance and the tag points at the release commit; only the owner's 2FA approval makes it public. | 1. Approve the npm stage for @lifecorner/angular-ui-kit 3.13.1 with `npm stage approve 2a195337-f469-490b-8f5c-7233c703b450` (ID from publish run 40468169783). 2. Have the follow-up gaps S1, S2 and S3 opened as new requests. |
