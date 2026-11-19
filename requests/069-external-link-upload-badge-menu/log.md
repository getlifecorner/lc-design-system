# Log 069: external description-list links, single-image upload, badge labels, menu height

## Owner decisions

none

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-19 00:03 | spec-writer → ui-ux-designer | done | The spec is ready and every item is an extension that needs an API and visual design before the build. | Design the API and visuals for AC-1…23 in spec.md. Cover the `external` link icon and registration, the single-image mode (input names, backgrounds, remove output), the badge label element and `maxWidth`, and the room-based `lc-menu` height with its side rule and minimum. |
| 2026-11-19 00:38 | ui-ux-designer → web-developer | done | The design covers AC-1…23 with prototyped geometry, computed contrast and baselines, so the build can start. | Implement design.md for request 069 (D-1…D-8, §2 API, §3 rules, the 9 stories in §8), then compare unchanged stories against tmp/story-shots/069/baseline and baseline-b; record the listed spec-pin updates with their reasons in build.md. |
| 2026-11-19 01:39 | web-developer → ui-ux-designer | done | Every gate passed on 2727438 and all 23 ACs are covered, but the menu geometry departs from design §3D because of CDK's fit check, which needs the designer's agreement. | Review request 069 (stories components-description-list--external-links, form-file-upload--image, --image-backgrounds, --image-german, --image-rejected-german, data-display-badge--mixed-label, --max-width, navigation-menu--long-menu-room, --long-menu-room-flips-up; plus the AC-5 stories clickable-rows, clickable-rows-english, item-icons) and accept or reject build.md deviations 1–5, mainly the 16 px bottom margin under a room overlay (702 instead of 710 px). |
| 2026-11-19 01:56 | ui-ux-designer → release-manager | done | Round 1 passes all 23 ACs with no must-fix, and deviations 1–5 are accepted, with design.md updated to match the build. | Prepare the release for request 069 (3.49.0). Open items in review.md: F-1 should-fix (queue: forced-colours image backgrounds, design §5 r1), F-2 and F-3 nits (backlog). |
| 2026-11-19 02:09 | release-manager → none | done | All gates are green, CI and the publish run passed, and the tag points at the release commit. | Request 069 is released as 3.49.0 and staged on npm (publish run 44434201129 passed). The owner approves the stage with 2FA. The dispatcher queues 069-s1 (forced-colours grounds of `lc-file-upload variant="image"`, review F-1) for the next bundle. 069-n1 and 069-n2 are already in `requests/BACKLOG.md`. |
