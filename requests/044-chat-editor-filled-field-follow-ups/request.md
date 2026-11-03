# Request 044: Chat remove target, editor mode state, filled-field boundary (043 follow-ups)

- **From:** owner
- **Received:** 2026-11-03
- **Gap IDs:** none (follow-ups F-28, F-29, F-31 of request 043)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/043-targets-hover-contrast-follow-ups/design.md (section 6), /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/043-targets-hover-contrast-follow-ups/release.md (Open nits 6), /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/BACKLOG.md
- **Kit version at intake:** 3.27.1

## Requirement (verbatim)

Follow-ups F-28, F-29 and F-31 of request 043 (queued by the dispatcher under the owner's rule of 2026-11-02; measured WCAG 2.2 AA failures count as should-fix). F-28: the lc-chat pending-attachment remove button (__pending-remove) is 20 px and was not in the F-22 target sweep; it needs a 44 px hit area or a documented WCAG 2.5.8 exception (requests/043-targets-hover-contrast-follow-ups/design.md section 6). F-29: the lc-rich-text-editor mode buttons have no aria-pressed, and in forced colours the active mode loses its fill with no other mark (design.md section 6). F-31: filled fields (input, select, textarea, datepicker, wherever a filled variant exists) have a transparent border at rest and 1.23:1 light / 1.29:1 dark on hover, so there is no 3:1 boundary (release.md, Open nits 6). Check requests/BACKLOG.md for rows on the same components. Both themes, 360/1024/1280 px, EN and DE. No API break; the spec decides patch or minor.
