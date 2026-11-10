# Log 059: lc-device-frame and lc-picture, lc-select clearable, lc-description-list total whitespace, lc-list item ariaLabel

## Owner decisions

- 2026-11-10 23:59: resume → Owner 2026-11-10 23:59: continue. The headless run was killed at about 23:58 while web-developer was implementing (no build.md yet). Branch feat/3.39-device-frame-picture-select-list holds its uncommitted partial work (select, list, description-list, table, specs, check-angular-majors.mjs, designer memory, BACKLOG.md); continue from it, don't discard it. lc-device-frame and lc-picture are not started yet.

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-10 22:56 | dispatcher → spec-writer | new | Bundle of 3 items started by the owner (headless) | Write the spec for this request |
| 2026-11-10 22:58 | spec-writer → ui-ux-designer | done | The spec is ready and testable; the design step comes next. | Design the API and visuals for AC-1…20 in requests/059-device-frame-picture-select-list/spec.md: lc-device-frame (bezel tokens, notch, size, 2 x 248 px frames), lc-picture (sources, light/dark variants with no flash in prerendered HTML, required inputs), lc-select `clearable`, lc-list `ariaLabel`, and the dl whitespace and amount-wrap fixes. |
| 2026-11-10 23:44 | ui-ux-designer → web-developer | done | The API, layout, contrast and expected diffs are designed and prototyped in the browser, and the baselines are captured on 3.38.0. | Implement design.md for request 059 (lc-device-frame, lc-picture, lc-select clearable, ListItem.ariaLabel, dl whitespace and narrow-row wrap), including the table page-size clearable=false, the listed spec pin changes and the compat probe; compare the 74 baseline stories against tmp/story-shots/059/baseline (800 ms measure wait). |
| 2026-11-10 23:59 | dispatcher → web-developer | resume | Headless run killed at about 23:58 during the build; owner says continue from the uncommitted partial work | Same task as the row above; continue from the partial work on the branch (lc-device-frame and lc-picture not started yet). |
| 2026-11-11 00:36 | web-developer → ui-ux-designer | done | All gates are green on 16f91b6; the design review and one deviation that needs the designer's agreement are what remain. | Review request 059 (stories data-display-device-frame--default, --sizes, --notch, --screenshot-row, --card-and-frame, --custom-bezel, --any-media; data-display-picture--default, --sources, --theme-variants, --in-a-card, --load-error; form-select--without-clear-button; data-display-list--jump-marks; components-description-list--narrow-column; layout-hero--fill), shots in tmp/story-shots/059/new-*. Confirm or reject build.md Deviation 1: list word breaks for rows with an ariaLabel, without which the designed jump marks fail axe label-content-name-mismatch. |
| 2026-11-11 00:46 | ui-ux-designer → web-developer | changes-requested | A must-fix axe violation (scrollable-region-focusable, WCAG 2.1.1) in a new story; everything else passes and Deviation 1 is accepted. | Fix review.md round 1: F-1 (Card and Frame wrapper flex-wrap: wrap without overflow-x, adjust its description), F-2 (Screenshot Row ring outline-offset -2px below 1024 px) and F-3 (lang="de" wrappers on the 7 listed stories); story-only changes, then rebuild Storybook and hand back for round 2. |
