# Request 024: Review findings follow-up: table cellClass and pagination, toast targets, decorative icons, menu danger contrast

- **From:** owner
- **Received:** 2026-10-31
- **Gap IDs:** none (review findings: 021 review F1, F2 and Service Call story; 023 review svg-img-alt; 020 review S2)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/021-sources-page-kit-gaps/review.md, /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/023-bottom-nav-more-modal-close-icon/review.md, /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/020-app-shell-prove-gaps/review.md
- **Kit version at intake:** 3.18.0

## Requirement (verbatim)

Follow-up of review findings that exist on main (no consumer gap file; the owner asked for it on 2026-10-31). 1) lc-table: TableColumn.cellClass colour and font size never apply, because the kit's td rule wins (requests/021-sources-page-kit-gaps/review.md F1). 2) lc-table pagination: the text '/ page' is hard-coded English (table.component.ts:751) and needs a label input; the clearable inner select's 'Clear selection' x sits over the value at 1280 px; prev and next are 28 x 28 px (under 44); at 200 % zoom and 360 px the page is 546 px wide (021 review F2). 3) lc-toast: the close button (28 x 28) and the action (94 x 29) are under 44 px (021 review, Service Call story). 4) svg-img-alt: the lc-drawer close icons (drawer.component.html:35,45) and the lc-notification-center item and empty-state icons have the same defect as the lc-modal close icon fixed in 3.18.0 (requests/023-bottom-nav-more-modal-close-icon/review.md). 5) lc-menu: the --danger item has 2.06:1 text contrast in the dark theme and needs at least 4.5:1 (requests/020-app-shell-prove-gaps/review.md S2). No API break.
