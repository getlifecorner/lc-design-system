# Request 029: Status ink contrast follow-up of 027 and the money Number Column caveat

- **From:** owner
- **Received:** 2026-11-02
- **Gap IDs:** none (follow-up of request 027: review.md finding 2, design.md §5 follow-up candidates)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/027-money-without-currency-symbol/review.md, /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/027-money-without-currency-symbol/design.md, /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/libs/angular-ui-kit/src/lib/money/money.stories.ts
- **Kit version at intake:** 3.21.0

## Requirement (verbatim)

Follow-up of request 027 (no consumer gap file; the owner asked for it on 2026-11-01). 1) The Number Column story description in money.stories.ts needs the caveat from requests/027-money-without-currency-symbol/review.md finding 2: a formatMoney(...).text string in a table formatter has no spoken text, so lc-money in a cell template is the way to drop the hidden currency name. 2) Status colours used as foreground: apply the same ink swap as 027 (the variant colour replaced by --color-on-<variant>-subtle or the fitting status ink) to the follow-up candidates in requests/027-money-without-currency-symbol/design.md section 5 so that text reaches 4.5:1 and icons, glyphs and boundaries reach 3:1 in both themes. Text below 4.5:1 first: lc-notification-center priority labels high and urgent (warning light 1.97, urgent dark 1.98), lc-card status chips success, warning and error (2.33, 1.97, 1.98), the lc-markdown mermaid error text (dark 2.06). Then graphics below 3:1: the lc-notification-center type icons (also drop their raw hex fallbacks), lc-status-dot, lc-pipeline warning and error nodes, the lc-file-upload remove x on hover, the lc-rating filled star, the level and diff colours in log-viewer, diff-viewer, dependency-viewer and kanban-board, and the lc-progress fill against its track. The shared --color-success, --color-error, --color-warning and --color-info values must not change. No API break; the spec decides whether this is a patch or a minor.
