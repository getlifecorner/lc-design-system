# Request 026: Review findings follow-up 3: toast close colour, notification-center comment, drawer story lang

- **From:** owner
- **Received:** 2026-10-31
- **Gap IDs:** none (review findings 1–3 of 025)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/025-review-findings-follow-up-2/review.md
- **Kit version at intake:** 3.19.1

## Requirement (verbatim)

Follow-up of the open findings from request 025 that exist on main (no consumer gap file; the owner asked for it on 2026-10-31; see requests/025-review-findings-follow-up-2/review.md findings 1 to 3). 1) lc-toast close button in the dark theme: .lc-toast__close has no color rule, so the browser's black buttontext renders the x at 1.47:1 and 1.22:1 on the toast gradient ends, and its currentColor focus ring is black too; both need at least 3:1 (WCAG 1.4.11) in both themes, standalone and in the outlet; the review measured var(--color-text-secondary) at 7.56 / 7.23 light and 9.26 / 11.16 dark; this changes the look of the toast outlet, which the owner accepts (finding 1, should-fix). 2) The comment at notification-center.component.scss:112 states the old contrast range wrongly (finding 2). 3) The story feedback-drawer--german-heading puts lang=de on lc-drawer, which marks its English body text as German (finding 3). No API break; a patch release. --from owner --headless
