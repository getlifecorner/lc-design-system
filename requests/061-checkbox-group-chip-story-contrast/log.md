# Log 061: lc-checkbox-group (new), lc-chip story contrast

## Owner decisions

none

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-13 13:18 | dispatcher → spec-writer | new | Bundle 20261113-131724 started by the owner (2 items) | Write the spec for this request |
| 2026-11-13 13:19 | spec-writer → ui-ux-designer | done | The spec is ready and the kit has neither the group nor a passing story, so design is the next step. | Design the API and visuals for AC-1…19 in requests/061-checkbox-group-chip-story-contrast/spec.md. Decide the group context token and the optional `value` input on `lc-checkbox` for the array CVA (AC-11). Compute chip story hook values that hold 4.5:1 in both themes (AC-18). Decide the fate of the existing `CheckboxGroup` story. |
| 2026-11-13 13:35 | ui-ux-designer → web-developer | done | The design fixes the API, layout, tokens, stories and verification for AC-1 to AC-19 with measured values, so implementation is the next step. | Implement design.md for request 061 (lc-checkbox-group with its group context and array value, plus the new `value` input on lc-checkbox; new stories, compat app row, READMEs and i18n spec row; HooksOnAnAncestor values and text), then run the baseline compare of §9 (expected 96/96 identical). |
| 2026-11-13 13:59 | web-developer → ui-ux-designer | done | All gates are green and the baseline compare is 96/96 identical, so the stories are ready for the design review. | Review request 061 (stories form-checkbox-group--default, --with-error, --required, --disabled, --horizontal, --phone-large, --hidden-legend, --form-control, form-checkbox--checkbox-group, data-display-chip--hooks-on-an-ancestor); confirm build.md deviation 1 (md rows 27 px from the unchanged checkbox host). |
| 2026-11-13 14:09 | ui-ux-designer → release-manager | done | All 19 AC pass with measured evidence, the baseline is 96/96 identical and no must-fix is open, so the request can be released. | Prepare the release for request 061 (review.md round 1 approved; open items: F-1, F-2, F-3 → queue as should-fix; F-4, F-5, F-6 → backlog). |
| 2026-11-13 14:30 | release-manager | done | Release commit 3.41.0 prepared; build and pack green; open items 061-s1..s3 queue, 061-n1..n3 backlog | Push main, wait for CI, tag v3.41.0 |
