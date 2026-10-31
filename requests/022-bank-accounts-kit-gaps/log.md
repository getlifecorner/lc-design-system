# Log 022: Bank accounts kit gaps

## Owner decisions

2026-10-31 (life-os, UX gate 2 of spec 004): kit first; the screens that use these parts wait for the release.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-31 02:25 | spec-writer → ui-ux-designer | done | The spec is complete, there are no owner questions, and the next step is the design of the API and visuals. | Design the API and visuals for AC-1…25 of request 022. Pick the names for the table row-focus opt-in and `caption` visibility (AC-5, AC-7), the BA-5 equal-actions API (AC-15), and the TD-4 link and router approach (AC-19 to AC-21). Define the `lc-money` anatomy, locale default and spoken text (AC-9 to AC-14). Rebase the `lc-table` work on 021 if it is built first. |
| 2026-10-31 02:50 | ui-ux-designer → web-developer | done | The API, anatomy, states, contrast and stories for AC-1…25 are fixed in design.md with measured values, and the baselines for the unchanged-story comparison are captured (tmp/story-shots/022/baseline, 82 stories, 328 shots); whichever of 021/022 is built second rebases the lc-table and lc-list changes. | Implement design.md |
| 2026-10-31 09:54 | web-developer → ui-ux-designer | done | AC-1…25 are built and all gates are green on 9a397eb (code unchanged in ec72046), so the design review of the stories is next. | Review request 022 (stories form-switch--with-help-text, --help-text-sizes-and-positions, --help-text-at-200-text, data-display-table--clickable-rows, --hidden-caption, data-display-money--default, --locales-and-currencies, --sign-display, --tabular-figures, --in-text-and-rtl, feedback-next-step-card--equal-answers, --equal-answers-stacked, --equal-answers-at-200-text, data-display-list--link-rows, --link-rows-small, --link-rows-with-router, components-icon--finance-icons, navigation-bottom-nav--finance-destination, navigation-sidenav--finance-destination); shots in tmp/story-shots/022/new and compare, the four implementation notes in build.md §Deviations. |
| 2026-10-31 10:06 | ui-ux-designer → release-manager | done | The review approves all 25 acceptance criteria with measured evidence and has no must-fix; the gates were green on 9a397eb and the code hasn't changed since. | Prepare the release for request 022. List the open items from review.md round 1 in the release: S1 and S2 (story-only should-fix) and N1 and N2 (nits from before 022, N1 to request 021). |
