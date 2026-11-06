# Request 055: lc-textarea / lc-combobox focus(), backlog sweep (9 rows)

- **From:** bundle (finance-intelligence, owner)
- **Received:** 2026-11-06
- **Gap IDs:** monatsstand-prove-2026-11-06 row 1; BACKLOG 052-n3, 052-n4, 052-n6, 053-n1, 053-n2, 053-n3, 054-n1, 054-n2, 054-n3
- **Referenced files:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/monatsstand-prove-2026-11-06.md (row 1); /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/BACKLOG.md (all 9 rows)
- **Kit version at intake:** 3.34.0

## Requirement (verbatim)

Bundle `tmp/lc-request/bundles/20261106-212803.md`, started by the owner on 2026-11-06 21:28: one request and one version for all items.

### Item 1 (20261106-181514-18588)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-06 18:15
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/monatsstand-prove-2026-11-06.md

Row 1: public focus() on lc-textarea and lc-combobox

Row 1 of the referenced file, verbatim:

| #   | Component                    | Gap | Proposal | Accepted when | Our transition until the release |
| --- | ---------------------------- | --- | -------- | ------------- | -------------------------------- |
| 1   | `lc-textarea`, `lc-combobox` | Neither has a public way to move focus into its native field. A form that opens must put focus into its first field (the month in "Monat einfrieren", the note in "Freigeben"), and after a 422 back into the field with the error (WCAG 2.4.3). Today the page has to look up the inner `textarea` or `input` itself. | A public method `focus()` on both components that focuses the native field; on `lc-combobox` it respects `openOnFocus` (no effect until called). | A consuming app calls `focus()` on a `viewChild` of either component and the native field gets focus; with `openOnFocus=false` the combobox list stays closed; there is a story for a form opening with focus. | The forms query `lc-textarea textarea` and `lc-combobox input` inside their own host and call `focus()` on that element; nothing else is touched. |

File header (context), verbatim:

- **From:** finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.34.0)
- **Approved concept:** [docs/ux/concepts/monatsstand.md](../concepts/monatsstand.md), sections 7 (gap 4) and 8 (focus) (German)
- **Found by:** the code review of spec 011 (monthly snapshot and release), while proving the built page
- **Status:** open, collected on 2026-11-06

### Item 2 (20261106-212803-38239)

- **From:** owner
- **Dir:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system
- **Date:** 2026-11-06 21:28
- **File:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/BACKLOG.md

All 9 rows of the backlog (052-n3, 052-n4, 052-n6, 053-n1..n3, 054-n1..n3). Owner decision 2026-11-06: the whole queue in this one run, together with the other inbox items; no row goes back to the inbox for bundle size. Fix what is a defect; a known limit may be resolved as documented with a reason. 054-n2 needs WebKit, which is not installed here: if it can't be checked, keep it in the backlog and say so.

The 9 rows of the referenced file at intake, verbatim:

| ID | Component | Finding | Source |
|---|---|---|---|
| 052-n3 | bottom-nav | Known limit of D-2: More badge "99+" on a 5-entry bar at 360 px starts 3.2 / 3.4 px left of the pill centre and covers 2 of the 3 dots of the More glyph; the label names the entry. | 052 review r2, nit 3 |
| 052-n4 | sidenav | Collapsed rail, non-badged items: the label stays in the AX tree, so the identical `title` may be read as description; check the CDP AX tree and, if so, drop `title` on all rail items (`data-tooltip` carries the tooltip). | 052 review r2, nit 4 |
| 052-n6 | tag-input (story) | *Keyboard Focus* has a German tag without `lang="de"`, so it breaks mid-word with no hyphen; add `lang="de"` as in *Touch Targets (DE)*. | 052 review r2, nit 6 |
| 053-n1 | toast-outlet (spec) | `toast-outlet.gap.spec.ts` pins length and sha1 of the rest of the compiled outlet CSS (2248, `4a24e1d9…`); fails on any later scss edit with no behaviour change. Drop it or replace it with targeted assertions. | 053 review, nit 1 |
| 053-n2 | toast-outlet | "Top stacks the oldest at the top" holds only within a live region; in a top stack the assertive region comes first. Correct the wording (JSDoc, meta docs) or mirror the `--latest` logic for top stacks. Pre-existing, not WCAG. | 053 review, nit 2 |
| 053-n3 | toast-outlet (stories) | *Stack Spacing*, *Offsets*, *Bottom Stack Order*: the meta's `position` and `duration` controls show but do nothing on the fixed demos. | 053 review, nit 3 |
| 054-n1 | alert | At 360 px an inline `slot="action"` button plus × leaves the message about 70 px (one word per line); the 3.2 layout. Consider stacking below a container width. | 054 review, F-3 |
| 054-n2 | modal, confirm-dialog | AC-6: WebKit not automated; manual Safari/iOS check of the *Focus return (3.34)* stories (`document.activeElement` = the trigger's `<button>` after close). | 054 build.md, Deviations |
| 054-n3 | drawer, sidenav, gallery | No `returnFocusTo`; in WebKit their close leaves `body` focused (as before). | 054 spec, scope |
