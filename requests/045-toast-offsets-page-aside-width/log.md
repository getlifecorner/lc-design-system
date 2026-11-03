# Log 045: Toast offsets in the app shell, reserved aside column, wide page content

## Owner decisions

none

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-03 18:48 | spec-writer → ui-ux-designer | done | The spec is ready and has no open owner questions, so design is the next step. | Design the API and visuals for AC-1…20 in requests/045-toast-offsets-page-aside-width/spec.md. For AS-34, choose how the shell's clearance and header height reach the fixed toast outlet. For AS-35, design `reserveAside` (aria-hidden, no landmark). For AS-36, design `contentWidth` wide, and state how it combines with an aside that has content. |
| 2026-11-03 22:58 | ui-ux-designer → web-developer | done | design.md is complete, prototyped (wide child 928 px at 1280–1920, reserved column = named geometry, stack overflow CSS), and baselines are captured on main 7d0bd2b (045/baseline 234, 045/baseline-open 8). | Implement design.md: outlet hooks and stack scroll via OverlayInsetsService written by lc-app-shell; lc-app-page `reserveAside`, `contentWidth` and `[page-wide]`; the seven stories in §8. |
