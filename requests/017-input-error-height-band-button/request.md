# Request 017: lc-input error-state height and a link button on the hero band

- **From:** life-os
- **Received:** 2026-10-25
- **Gap IDs:** G-WL3 (blocking), G-WL1 (wish, not blocking)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/003-join-waitlist/docs/ux/concepts/website-waitlist.md (section 7 "Design system gaps", rows G-WL1 and G-WL3; section 6.10 "Artboards"; decisions D-WL1 and D-WL8)
- **Kit version at intake:** 3.11.5

## Requirement (verbatim)

/Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/003-join-waitlist/docs/ux/concepts/website-waitlist.md --from life-os G-WL3 (blocks the waitlist build): lc-input lg grows from 44 to 49 px in the error state because the field container's input-error class also matches the error text's .input-error { flex: 1 } rule; use distinct class names for the container state and the error text (also visible on the live contact form's 422 answer). G-WL1 (wish, not blocking): no lcButton variant shows a visible button boundary on the lc-hero teal band (primary text 5.17:1 but shape 1.2:1 against the band; secondary, outline, ghost and link fail text contrast); an on-dark/on-band variant for one link button in the hero body. See section 7 'Design system gaps' and 6.10 of the concept. G-CF4 is already in request 016 and not part of this request. --headless
