# Log 024: Review findings follow-up: table cellClass and pagination, toast targets, decorative icons, menu danger contrast

## Owner decisions

2026-10-31: the owner asked for this follow-up of review findings on main, with no API break (headless run).

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-31 | spec-writer → ui-ux-designer | done | The spec is ready and has no open owner questions, so the next step is design. | Design the API and visuals for AC-1…12 in request 024: how `cellClass` wins over the kit's `td` rule, a non-clearable page-size select, 44 px hit areas for the pagination buttons and the toast, wrapping pagination at 360 px, `pageSizeLabel`, decorative icons in `lc-drawer` and `lc-notification-center`, and a danger colour for `lc-menu` with at least 4.5:1 in both themes. Take baselines before the build. |
| 2026-10-31 | ui-ux-designer → web-developer | done | The design is prototyped in the browser and the baselines are captured; nothing is open for the owner or the spec. | Implement design.md (request 024): `:where()` cell typography, `pageSizeLabel`, the wrapping pager with 44 px hit areas and the hidden ×, the 44 px toast controls, the 4 decorative icons, the menu danger tokens, and the 3 new stories; compare against `tmp/story-shots/024/baseline`. |
