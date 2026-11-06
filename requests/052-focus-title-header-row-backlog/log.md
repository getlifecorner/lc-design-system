# Log 052: lc-next-step-card focusTitle(), lc-header contextPlacement, lc-list aria-current, backlog sweep (20 rows)

## Owner decisions

2026-11-05 23:59: bundle size → all 20 backlog rows run in this request together with the inbox items; the limit of about 8 items does not apply, no row goes back to the inbox for size. Fix what is a defect; a known limit may be resolved as documented with a reason (from the bundle, item 3).

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-06 00:02 | spec-writer → ui-ux-designer | done | The spec is ready and the next step is the API and visual design. | Design the API and visuals for AC-1…31 in `requests/052-focus-title-header-row-backlog/spec.md`. Group the work by component. Record the reasons for the open design choices in `design.md`: the 045-n2 toast order, the 050-n6 clamp versus a real fix, and the 044-n3 forced-colours pressed mark. |
| 2026-11-06 00:48 | ui-ux-designer → web-developer | done | design.md is ready: API, layout, decisions D-1…D-9 (toast order, More badge fix, FC underline) and baselines are in place. | Implement design.md (groups G1–G14) on one branch, one minor version; measure the two computed parts (datepicker origin box, toast reorder) first. |
| 2026-11-06 11:19 | web-developer → ui-ux-designer | done | The build is committed with all gates green and every screenshot difference against the baseline explained, so the design review is next. | Review request 052 (new stories feedback-next-step-card--focus-after-action, navigation-header--context-below, data-display-list--current-choice, form-tag-input--long-tags, navigation-bottom-nav--more-badge-three-characters, feedback-toast-outlet--bottom-stack-order, form-datepicker--opens-above, form-combobox--opens-above, feedback-tooltip--host-with-two-controls; changed: Label (DE), Touch Targets (DE), Pending Attachments (DE), Wide page, Offsets) against design.md, and confirm or reject deviations 1–3 in build.md (token lengths, the `safe` fallback, fullscreen story frames). |
| 2026-11-06 11:47 | ui-ux-designer → web-developer | changes-requested | One must-fix in a visible state this release introduces (wrapped chip text outside the rounded border); everything else passes, and #2 to #4 go to release.md open items. | Fix review.md round 1 finding #1. Give `.lc-tag-input__tag` the radius from design.md D-8 (`border-radius: var(--border-radius-full); border-radius: calc(0.5lh + 3px)`). Re-shoot the tag-input stories against tmp/story-shots/052/baseline (only stories with a chip over 150 px may differ). Measure the text clearance with r1-chip-measure.js without its prototype line (expected radius 12.8, clearance 3.2 / 3.8 px), then update build.md. You may also fix the story texts in nit #5. |
