# Log 072: All backlog rows — sidenav, menu, table, modal focus return

## Owner decisions

2026-11-20 22:43: (from the bundle item) everything in one version; the about-8-items bundle limit does not apply, so do not split the bundle or return anything to the inbox. 054-n2 stays in the backlog if WebKit cannot check it here.

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-20 22:44 | spec-writer → ui-ux-designer | done | The spec is complete and testable, and the design step comes next. | Design the API, anatomy, states and accessibility for AC-1 to AC-22 of requests/072-backlog-sidenav-menu-table/spec.md (sidenav rail group menu, brand-mark slot, rail template and tooltip description; menu side positions, popup control-row keyboard model and inline part names; table RTL head). State the choices the spec leaves to you: RTL meaning of right-start and left-start, how control rows are reached by keyboard in a popup, and the part-name field. |
| 2026-11-20 23:10 | ui-ux-designer → web-developer | done | The design is complete with measured values, an RTL prototype and baselines; the spec conflict (AC-9 vs AC-20) is resolved by the popupControls opt-in. | Implement design.md for request 072 (sidenav railGroupMenu, [sidenav-brand-mark], lcSidenavRail, tooltipDescription; menu MenuPosition side values, popupControls, partLabel/partAriaLabel; lc-table and sortable-head RTL rules appended as specified), then check WebKit for AC-19 and compare against tmp/story-shots/072/baseline. |
| 2026-11-21 00:00 | web-developer → ui-ux-designer | done | All 9 rows are built (WebKit not runnable, 054-n2 stays) and every gate is green; the stories need the design review. | Review request 072: stories navigation-sidenav--rail-group-menu, -rail-group-menu-rtl (shoot without --full), -brand-mark-slot, -rail-template, navigation-menu--side-positions, -popup-control-rows, -part-names, -account-panel, data-display-table--rtl-head, feedback-tooltip--description; decide build.md D-1 to D-3 and O-1/O-2. |
