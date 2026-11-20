# Log 072: All backlog rows — sidenav, menu, table, modal focus return

## Owner decisions

2026-11-20 22:43: (from the bundle item) everything in one version; the about-8-items bundle limit does not apply, so do not split the bundle or return anything to the inbox. 054-n2 stays in the backlog if WebKit cannot check it here.

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-20 22:44 | spec-writer → ui-ux-designer | done | The spec is complete and testable, and the design step comes next. | Design the API, anatomy, states and accessibility for AC-1 to AC-22 of requests/072-backlog-sidenav-menu-table/spec.md (sidenav rail group menu, brand-mark slot, rail template and tooltip description; menu side positions, popup control-row keyboard model and inline part names; table RTL head). State the choices the spec leaves to you: RTL meaning of right-start and left-start, how control rows are reached by keyboard in a popup, and the part-name field. |
| 2026-11-20 23:10 | ui-ux-designer → web-developer | done | The design is complete with measured values, an RTL prototype and baselines; the spec conflict (AC-9 vs AC-20) is resolved by the popupControls opt-in. | Implement design.md for request 072 (sidenav railGroupMenu, [sidenav-brand-mark], lcSidenavRail, tooltipDescription; menu MenuPosition side values, popupControls, partLabel/partAriaLabel; lc-table and sortable-head RTL rules appended as specified), then check WebKit for AC-19 and compare against tmp/story-shots/072/baseline. |
| 2026-11-21 00:02 | web-developer → ui-ux-designer | done | All gates are green on a428df6 (code 73e8851), so the stories need the design review next. | Review request 072 (stories navigation-sidenav--rail-group-menu and --rail-group-menu-rtl [shoot without --full], --brand-mark-slot, --rail-template, navigation-menu--side-positions, --popup-control-rows, --part-names, --account-panel, data-display-table--rtl-head, feedback-tooltip--description) and decide build.md D-1 to D-3 and O-1/O-2. |
| 2026-11-21 00:24 | ui-ux-designer → release-manager | done | All 22 ACs pass and the stories were checked in the browser with 0 axe violations; only nits remain, and the gates are green on 73e8851. | Prepare the release for request 072 (3.51.0 minor, everything in one version per the owner decision of 2026-11-20 22:43); put review F-1 … F-5 (all nits) into the backlog, keep 054-n2 there with "still open after 072", and fold in the change notes of design.md. |
| 2026-11-21 00:26 | release-manager → none | done | Review approved, gates green, release commit made; the pipeline (CI, tag, publish) follows. | Release 3.51.0 through the pipeline; the owner approves the npm stage. Backlog 072-n1 … n5 and 054-n2 stay open. |
| 2026-11-21 00:36 | release-manager → owner | done | The pipeline has staged 3.51.0 (CI green, tag v3.51.0 on 4603182, publish run 44837539628 green), and only the owner's 2FA approval makes it public. | Approve the staged npm package with 2FA: find the stage ID with `npm stage list @lifecorner/angular-ui-kit` after logging in, then run `npm stage approve <id>`. After that, `/lc-release --verify 3.51.0` checks provenance. The open items are backlog only (072-n1 … n5 and 054-n2), so there is nothing to queue. |
