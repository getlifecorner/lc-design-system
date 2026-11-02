# Request 035: lc-accordion flush form without inline padding

- **From:** life-os
- **Received:** 2026-11-02
- **Gap IDs:** BA-9
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/004-connect-bank-accounts/tmp/prove/kit-request-ba9-only.txt; /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/004-connect-bank-accounts/specs/004-connect-bank-accounts/kit-gaps.md (row BA-9)
- **Kit version at intake:** 3.22.4

## Requirement (verbatim)

One gap from life-os (feature 004, second proof, 2026-11-02). Row BA-9 of life-os specs/004-connect-bank-accounts/kit-gaps.md. (BA-10, the lc-description-list follow-ups, is already queued as the follow-up of request 033; not part of this request.)
lc-accordion (BA-9): variant="flat" keeps its header's inline padding, so a disclosure inside content (a bottom sheet, a card) starts indented against the text above it (life-os booking sheet „Quelle ansehen": at 360 px the header text starts about 43 px from the sheet edge, the description list above it at 24 px, so it sits about 19 px further in). Proposal: a flush form (for example variant="plain" or an input inset="none") with no inline padding on header and body, keeping the 44 px touch height, the chevron at the end edge and a visible focus ring. Acceptance: in a 328 px wide container the header text starts at the container's start edge; touch height ≥ 44 px; focus ring visible, also in forced colours; existing variants unchanged.
No API break wanted; patch or minor release.
