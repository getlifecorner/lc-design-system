# Request 066: lc-description-list item icon, lc-accordion nested open state, lc-timeline horizontal overflow at 360 px

- **From:** bundle (finance-intelligence, owner)
- **Received:** 2026-11-18 (bundle `tmp/lc-request/bundles/20261118-115700.md`, started by the owner 2026-11-18 11:57)
- **Gap IDs:** kosten-2026-11-17 row 3, kosten-2026-11-17 row 4, 065-s1
- **Referenced files:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/kosten-2026-11-17.md (rows 3 and 4); /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/065-usmx-command-palette-backlog/release.md (Open items, 065-s1)
- **Kit version at intake:** 3.45.0

## Requirement (verbatim)

### Item 1 (20261117-222026-37269)

- **From:** finance-intelligence (`/Users/eric/Documents/Projekte/usm/finance-intelligence`), 2026-11-17 22:20
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/kosten-2026-11-17.md

row 3 (kosten-2026-11-17, from /prove of spec 018): lc-description-list has no icon in an item; we need DescriptionListItem.icon (kit icon name before the value, aria-hidden) so a fact can carry the decorative arrow beside a variance like lc-hero and the tiles. Rows 1 and 2 were collected earlier (item 20261117-094121-15775).

### Item 2 (20261117-224509-52445)

- **From:** finance-intelligence (`/Users/eric/Documents/Projekte/usm/finance-intelligence`), 2026-11-17 22:45
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/kosten-2026-11-17.md

Row 4 only: the lc-accordion defect (nested accordions take the parent's open state).

### Item 3 (20261118-101300-065-follow-ups)

- **From:** owner (`/Users/eric/Documents/Projekte/life-cockpit/lc-design-system`), 2026-11-18 10:13

Follow-ups 065-s1 of request 065: a horizontal `lc-timeline` that is not selectable overflows at 360 px (184 px hidden) with no focusable element (axe `scrollable-region-focusable`, WCAG 2.1.1, pre-existing), needs a design decision between a focusable named scroller only when it overflows and a stacked layout; details in requests/065-usmx-command-palette-backlog/release.md Open items.
