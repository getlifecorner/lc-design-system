# Request 025: Review findings follow-up 2: toast wrapping and host layout, drawer close targets, axe findings, unlabelled icons

- **From:** owner
- **Received:** 2026-10-31
- **Gap IDs:** none (review findings 1 to 4 of request 024 and its build.md line 59)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/024-review-findings-follow-up/review.md, /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/024-review-findings-follow-up/build.md
- **Kit version at intake:** 3.19.0

## Requirement (verbatim)

Follow-up of the open findings from request 024 that exist on main (no consumer gap file; the owner asked for it on 2026-10-31; see requests/024-review-findings-follow-up/review.md findings 1 to 4 and build.md line 59). 1) lc-toast: a long German compound in the message breaks one letter after the joint with no hyphen at 360 px (Benachrichtigung / seinstellungen); use overflow-wrap with hyphens auto as lc-alert does since 3.13, and take a new baseline for wrapped English toast lines (review finding 1). 2) lc-toast: the :host rule in toast.component.scss (display block, width 100 %, max-width 400 px, margin-bottom) never applies under ViewEncapsulation.None, so a standalone lc-toast is inline and spans the whole canvas (1248 px at 1280) (finding 2). 3) lc-drawer: both close buttons are 32 x 32 px and need at least 44 x 44 like lc-modal (3.18) and lc-toast (3.19) (finding 3). 4) axe: color-contrast on .lc-nc__filter and .lc-nc__filter--active in lc-notification-center, and aria-input-field-name in the drawer form stories (finding 4). 5) 30 lc-icon uses without decorative or ariaLabel: log-viewer 6, document-viewer 10, gallery 7, combobox 3, file-upload 3, field-group 1; each gets decorative or a label, whichever fits. No API break unless the spec finds one is needed.
