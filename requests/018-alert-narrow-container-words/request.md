# Request 018: lc-alert in a narrow container: long words and a narrow layout

- **From:** life-os
- **Received:** 2026-10-27
- **Gap IDs:** G-WL4
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/003-join-waitlist/docs/ux/concepts/website-waitlist.md (section 7 "Design system gaps", row G-WL4, line 300; FR-017, board 20; T092)
- **Kit version at intake:** 3.13.0

## Requirement (verbatim)

/Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/003-join-waitlist/docs/ux/concepts/website-waitlist.md --from life-os G-WL4: lc-alert in a narrow container at 200 % text - long words neither break nor shrink, so the text runs past the alert box and the 320 px viewport (gap table row G-WL4; T092 measured it in lc-next-step-card [slot='body'] on the DE 503 answer). Needed: word breaking in title and content, min-width 0 on the text column, and a narrow layout below a px width like lc-next-step-card TD-1. Kit 3.13.0 in use. --headless

### Gap table row G-WL4 (from the referenced concept, line 300)

| G-WL4 | `lc-alert` in a narrow container with large text: in card B's `[slot='body']` at 320 px and 200 % text (FR-017, board 20) the alert is 123 px wide, its padding, icon and gap leave the text about 30 px, and `.lc-alert__title` / `.lc-alert__content` neither break a long word nor shrink below it. On the DE 503 answer "Nicht eingetragen" and "gespeichert." run up to 127 px past the alert box and 30 px past the viewport (T092, 2026-10-27; EN fits the viewport but also leaves the box) | long words break inside the alert (`overflow-wrap: break-word` and `hyphens: auto` on title and content, `min-width: 0` on the text column), and a narrow layout below a width in px as `lc-next-step-card` TD-1 (icon in the title row, smaller padding) | none locally (iron rule 6); measured: `overflow-wrap` + `hyphens` alone removes both overflows | **kit first** (owner 2026-10-27): T092's FR-017 row for the DE 503 page waits for the release |
