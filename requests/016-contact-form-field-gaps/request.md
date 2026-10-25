# Request 016: Contact form field and alert gaps

- **From:** life-os
- **Received:** 2026-10-25
- **Gap IDs:** G-CF4, G-CF3 (reopened), G-CF6, G-CF7, G-CF8
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/002-contact-form/docs/ux/concepts/website-contact-form.md (section 7 "Design system gaps", rows G-CF3, G-CF4, G-CF6, G-CF7, G-CF8)
- **Kit version at intake:** 3.11.5

## Requirement (verbatim)

/Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/002-contact-form/docs/ux/concepts/website-contact-form.md --from life-os Website contact form, found in the 002 proof (2026-10-25), section 7 'Design system gaps': G-CF4 a stable id input on lc-input and lc-textarea (like lc-search-input inputId) or a deterministic default - the random lc-input-… ids make every prerendered build differ; G-CF3 reopened - lc-textarea requiredAriaLabel never reaches the accessible name; G-CF6 the lc-input asterisk is announced twice and its gap differs from lc-textarea (8 vs 4 px); G-CF7 field errors under an lc-alert summary should render without role=alert (three alerts on a 422 page); G-CF8 an lc-alert action/link slot with a 44 px target for the one way forward (503/429 address link). None blocks the feature.
