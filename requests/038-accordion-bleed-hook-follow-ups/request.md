# Request 038: lc-accordion bleed hook robust to a unitless 0, scroll-container note

- **From:** owner
- **Received:** 2026-11-02
- **Gap IDs:** none (follow-ups of request 035: review.md findings 1 and 2; consumer gap BA-9)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/035-accordion-flush-inset/review.md
- **Kit version at intake:** 3.24.0

## Requirement (verbatim)

Follow-ups of request 035 (queued by the dispatcher under the owner's standing rule of 2026-11-02 that fixable findings go into the pipeline without asking; details in requests/035-accordion-flush-inset/review.md findings 1 and 2). 1) lc-accordion --lc-accordion-header-bleed: a unitless 0 makes calc(-1 * 0) a number, so inset-inline is invalid and the ::before box is 0 px wide, which removes the focus ring and the hover area of variant plain. Make the hook robust to a unitless 0 if CSS allows it; otherwise document in the JSDoc of variant, the docs bullet and the changelog that it takes a length (0px, not 0) (finding 1, should-fix). 2) The changelog and docs sentence 'Keep 8 px of room before a clipping edge' should also name scroll containers: a plain accordion in an overflow-x auto box with 0 inline padding scrolls 8 px horizontally (finding 2). No API break; a patch.
