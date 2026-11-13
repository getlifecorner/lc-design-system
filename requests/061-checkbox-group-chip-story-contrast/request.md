# Request 061: lc-checkbox-group (new), lc-chip story contrast

- **From:** bundle (owner, finance-intelligence)
- **Received:** 2026-11-13
- **Gap IDs:** 060-s1; benutzer-2026-11-12 row 1 (finance-intelligence, spec 014)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/tmp/lc-request/bundles/20261113-131724.md; /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/benutzer-2026-11-12.md; /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/concepts/benutzer.md (section 7)
- **Kit version at intake:** 3.40.0

## Requirement (verbatim)

### Item 1 (20261112-001900-060-follow-ups)

- **From:** owner
- **Dir:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system
- **Date:** 2026-11-12 00:19

Follow-ups 060-s1 of request 060: the lc-chip story 'Hooks On An Ancestor' drops to 4.01:1 chip text contrast in dark theme over a hero band (needs 4.5:1), so fix the story's hook values to hold in both themes (story only, not the component); details in requests/060-area-icons-area-map-laptop-chip/review.md finding 1 and release.md Open items.

### Item 2 (20261113-020816-67332)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-13 02:08
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/benutzer-2026-11-12.md

row 1 (benutzer-2026-11-12.md): lc-checkbox-group is missing - a group for lc-checkbox on the pattern of lc-radio-group (fieldset with legend, legendHidden, helpText, one error for the group, required, disabled, orientation, size passed to the children); the checkboxes keep their look. Needed for the role choice (multiple) in the forms Benutzer anlegen and Rollen aendern, spec 014.

#### Referenced file, row 1 (verbatim)

From the file header: finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.38.0; checked through the `lc-design-system` MCP and the installed types on 2026-11-13: `lc-radio-group` has `legend`, `legendHidden`, `helpText`, `error`, `required`, `orientation`; there is no group for `lc-checkbox`). Approved concept: /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/concepts/benutzer.md, section 7, for spec 014 (users and roles through the Keycloak admin API, ADR-0023). Look: none requested; the checkboxes keep their look (ADR-0009).

- **Component:** `lc-checkbox` (new: a group)
- **Gap:** A multiple choice has no kit group. Our forms „Benutzer anlegen“ and „Rollen ändern“ pick one or more roles (Administration, Controlling, CFO; roles combine, so `lc-radio-group` does not fit). The group needs a legend, one error for the whole group („Wählen Sie mindestens eine Rolle.“) that is announced once, and `required`, at the phone (`lg`, 44 px targets) and desktop (`md`) sizes.
- **Proposal:** A new `lc-checkbox-group` on the pattern of `lc-radio-group`: rendered as `fieldset` with `legend` (`legend`, `legendHidden`), `helpText`, `error` (text, one message for the group, linked with `aria-describedby`), `required`, `disabled`, `orientation`, `size` passed to the children; the projected `lc-checkbox` stay as they are. Optional: a value as an array through `ControlValueAccessor`.
- **Accepted when:** A group with three `lc-checkbox` renders a `fieldset` with its `legend`; with `error` set, the message shows once below the group, every checkbox is marked invalid and the group is described by the message; axe passes; stories at 360 px (`lg`) and at desktop size (`md`), German texts.
- **Our transition until the release:** A native `fieldset`/`legend` with kit typography from tokens around three `lc-checkbox`; the error goes to every checkbox (`error`) and its text to the last one (`errorMessage`). No override of kit internals.
