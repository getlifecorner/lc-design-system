# Log 053: lc-toast-outlet stack gap

## Owner decisions


## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-06 12:13 | dispatcher → spec-writer | — | Bundle of 1 item (052-s2) started by the owner | Write the spec for this request |
| 2026-11-06 12:14 | spec-writer → ui-ux-designer | done | Normal route: the spec is ready, and the designer decides the technique and the visuals. | Design the fix for AC-1…12 in request 053. Choose a pure-CSS technique that gives an 8 px (`--spacing-2`) gap across both live regions with no extra space from an empty region or after the last toast, and that works with the bottom-stack `--latest` order. Add a story showing a stack of at least three toasts across both regions, and take baselines. |
| 2026-11-06 12:36 | ui-ux-designer → web-developer | done | design.md is ready: margin-top on outlet toasts plus a compensated stack top padding (D-1, D-2), prototyped on all AC; baselines (90 rest + 8 opened) are in tmp/story-shots/053. | Implement design.md: D-1 to D-3 in toast-outlet.component.scss and the docs, the new Stack Spacing story, and the gap spec; leave the order spec and the template unchanged. |
