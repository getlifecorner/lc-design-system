# Log 032: lc-skeleton applies a percentage width twice

## Owner decisions

none

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-02 13:11 | dispatcher → spec-writer | new | Start of the request | Write the spec for this request |
| 2026-11-02 13:13 | spec-writer → ui-ux-designer | done | A fix that changes no look or API still needs the designer's story and shot baselines, and the build then follows. | Design the API and visuals for AC-1…9 of request 032. The API is unchanged and the look must not change; the design is the story with the two skeletons at 60 % / 30 % in a space-between row at 360 px, plus baseline shots for the AC-4 hash comparison. |
| 2026-11-02 13:23 | ui-ux-designer → web-developer | done | The design, the prototype that proves the approach and the AC-4 baselines are ready, and no question remains for the spec or the owner. | Implement design.md for request 032: put the width only on the host with an inline width: 100% on the fill, cover AC-1…9 with the spec and story changes in §2/§8 (new story percentage-widths, the Table Rows Loading row fix, JSDoc and argTypes), and draft the changelog entry from the points in §1. |
| 2026-11-02 13:32 | web-developer → ui-ux-designer | done | All AC are covered and every gate passed on 9508977; the design review and the deviations need the designer's sign-off before the release. | Review request 032 (stories feedback-skeleton--percentage-widths, --table-loading, --text-block, --user-card, --article-card, --dashboard-grid; shots in tmp/story-shots/032/build/, measures in tmp/032/measure.log) and confirm the two deviations in build.md (the circle row in skeleton.height.spec.ts now expects a 100% fill; Angular's style order). |
| 2026-11-02 13:37 | ui-ux-designer → release-manager | done | Every AC passes, both build deviations are confirmed with change notes in design.md, and there are no must-fix findings. | Prepare the release for request 032 (patch 3.22.2); the two nits in review.md round 1 stay visible (move the byte-identical px/rem bullet from Fixed to Compatibility in the changelog draft; AC-8 is shown by DOM serialisation in a unit test, which is fine for this patch). |
| 2026-11-02 14:05 | release-manager → owner | done | Release commit made; main push, CI, tag and publish follow, and the npm stage needs 2FA. | Approve the npm stage of 3.22.2 with `npm stage approve <id>` once the publish run is green. |
| 2026-11-02 14:16 | release-manager → owner | done | Only the owner's 2FA approval makes the staged package public. | 1. Approve the 3.22.2 npm stage with 2FA (`npm stage approve <id>`); the publish run 41446880222 is green. After that the request is finished and needs no further agent step. |
