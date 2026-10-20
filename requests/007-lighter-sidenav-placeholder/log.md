# Log 007: A lighter lc-sidenav-placeholder in the initial chunk (AS-28)

## Owner decisions

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-20 | spec-writer → ui-ux-designer | done (reported "ready") | Spec is complete with measurement-first approach and clear criteria; designer must choose the implementation strategy and simplified logic. | Design the optimization approach for AC-2 through AC-5: the simplified expansion logic that replaces the navigation helpers, and decide question A vs B for the Router fallback (recommend A for maximum bundle reduction in the controlled shell context). |
| 2026-10-20 | ui-ux-designer → spec-writer | changes-requested | The measurement shows AC-5 (≥ 50 %) can't be reached and option A contradicts AC-7, so the spec has to change before anyone implements; the design for path (b) and the 3.9.0 baselines are ready. | Resolve Q1 in design.md §1 using the measured values (whole placeholder 2.50 kB gzip, removable Router+helpers part 0.33 kB): 1) recommended (a) close AS-28 with no kit change, "measured, not worth it", and give life-os the numbers; 2) (b) ship path A, with AC-5 changed to "saves ≥ 0.3 kB", AC-7 allowing the line-150 router-fallback test to be replaced, and a Changed entry for the dropped empty-activeRoute fallback; 3) (c) path B, not recommended. |
| 2026-10-20 | spec-writer → none | done | AS-28 resolved by measurement: optimization not worthwhile per requester's "if it is worth it" condition | — |
