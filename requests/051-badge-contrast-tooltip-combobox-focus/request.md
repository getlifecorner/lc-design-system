# Request 051: Badge contrast on nav pills and light rail, tooltip on lc-button focus, lc-combobox openOnFocus

- **From:** bundle (owner, finance-intelligence)
- **Received:** 2026-11-05
- **Gap IDs:** 050-f1, 050-f2, 050-f3; stammdaten-2026-11-05 row 3
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/050-overlay-lang-nav-badges/release.md (Open items); /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/stammdaten-2026-11-05.md (row 3)
- **Kit version at intake:** 3.31.0

## Requirement (verbatim)

Bundle `tmp/lc-request/bundles/20261105-174747.md`, started by the owner on 2026-11-05 17:47: one request and one version for all items.

### Item 1 (20261105-144900-follow-ups-050)

- **From:** owner
- **Dir:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system
- **Date:** 2026-11-05 14:49

Follow-ups 050-f1, 050-f2, 050-f3 of request 050: `lc-bottom-nav` badge on the current pill in dark fails contrast (warning 4.03:1 floating / 4.26:1 docked, success 4.49:1 floating, WCAG 1.4.3); `lc-sidenav` `theme="light"` rail on a dark page shows badges at 1.22–1.97:1 (WCAG 1.4.3); `lcTooltip` on `lc-button` never shows on keyboard focus, puts `aria-describedby` on the host instead of the focused button, and anchors to the 18 px host box so a bottom tooltip overlaps the button by 4 px (WCAG 1.4.13, 1.3.1); all pre-existing, should-fix; details in requests/050-overlay-lang-nav-badges/release.md Open items.

### Item 2 (20261105-163149-37319)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-05 16:31
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/stammdaten-2026-11-05.md

Row 3 (stammdaten-2026-11-05): lc-combobox opens its list on every focus; please add an input openOnFocus (default true) so programmatic focus can leave the list closed. Found in /prove of the master data page on the phone (form focus on open and after a 422). Rows 1-2 of this file were collected earlier today.

Row 3 of the referenced file, verbatim:

| #   | Component       | Gap | Proposal | Accepted when | Our transition until the release |
| --- | --------------- | --- | -------- | ------------- | -------------------------------- |
| 3   | `lc-combobox`   | The list opens whenever the field gets focus. A form that puts focus into its first field on open, or into the first invalid field after a server rejection (422), pops the list over the form on a phone; after a 422 it covers the field's own error text. There is no way to focus the field without opening the list. | An input `openOnFocus: boolean`, default `true` (as today). With `false` the list opens only on typing, the arrow keys or a tap or click on the field; programmatic `focus()` leaves it closed. | With `openOnFocus = false`, `focus()` on the field opens no listbox and `aria-expanded` stays `false`; typing, ArrowDown or a tap opens it; with the default nothing changes; there is a story at 360 px. | Focus goes to the form title when the first field, or the first invalid field after a 422, is a combobox (concept „Stammdaten“, section 8). |
