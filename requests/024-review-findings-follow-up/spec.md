# Spec 024: Review findings follow-up

- **Status:** ready
- **Type:** bug fix (with one optional input, `lc-table` `pageSizeLabel`)
- **Affected:** `lc-table` (ts, html, scss, stories, spec), `lc-toast` (scss, stories), `lc-drawer` (html), `lc-notification-center` (html), `lc-menu` (scss), CHANGELOG, README rows if inputs are listed
- **Semver impact:** minor. One new optional input; every other change is a fix. Defaults render as before except the listed visual fixes (touch targets, contrast), which are the bug.

## Need

Five defects found in reviews of 020, 021 and 023 and left open on main (3.18.0). Consumer pages: life-os sources page and bank accounts (table), service-call toasts, the app shell and user menu ("Abmelden", the only item in finance-intelligence's no-role menu), drawer and notification-center pages. Problems:

| # | Defect | Source |
|---|---|---|
| 1 | `TableColumn.cellClass` colour and font size never apply: the kit's `td` rule has specificity (0,5,3). "Cell Formatting and Styling" renders rgb(17,24,39). | 021 review F1 |
| 2 | Pagination: "/ page" hard-coded English (`table.component.ts:755`); the clearable inner select's "Clear selection" × (20x20, x 1063-1083) sits over "5 / page" (x 1020-1079) at 1280; prev/next 28x28; page is 546 px wide at 200 % zoom and 360 px. Shows in the German "Number Columns" story. | 021 review F2 |
| 3 | `lc-toast` close 28x28 and action 94x29, under 44 px ("Service Call" story). | 021 review |
| 4 | axe `svg-img-alt`: `lc-icon` without `[decorative]` in `drawer.component.html:35,45` (close) and `notification-center.component.html:83,103` (empty state, item icons). Fixed for `lc-modal` in 3.18.0. | 023 review |
| 5 | `lc-menu` `--danger` text uses `--color-error` (#9d0e0e): 2.06:1 on the dark menu (rgb(16,28,38)); hover tint is raw `rgba(157,14,14,.14)`. | 020 review S2 |

## What the kit has today

- `lc-icon` has `[decorative]` (used in `modal.component.html:32`): the fix for 4 exists, only the call sites are missing. If an icon carries meaning without a text sibling, keep it labelled.
- `--color-text-error` measures 12.59 (dark) / 8.69 (light) per the 020 review: the token for 5 exists.
- The table has `rowsPerPageAriaLabel`, `previousPageAriaLabel`, `nextPageAriaLabel`, `rangeOfLabel` but no label for the "/ page" suffix. The select's clear affordance is not controlled by the table.

## Scope

- In: items 1-5 above, with stories for the changed states, CHANGELOG entry (Fixed, Added, Compatibility).
- Not in: other `svg-img-alt` sites outside drawer and notification-center (if the developer finds more, list them in `build.md`, fix only if the same one-line change); table redesign; toast API changes; 022 review S2.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | A column `cellClass` that sets `color` and `font-size` takes effect on its `td` (computed style equals the class value), in light and dark. Kit defaults for cells without `cellClass` are unchanged; `cellStyle` still wins over `cellClass`. | unit test (computed style) + "Cell Formatting and Styling" story `--measure` |
| AC-2 | The "/ page" text comes from a new optional input `pageSizeLabel` (default `'/ page'`, JSDoc with `@default`). Default render is identical to today. German story sets it (e.g. `'/ Seite'`). | unit test + DE story |
| AC-3 | The page-size select in the pagination does not show a clear (×) control, and no element overlaps the displayed value at 1280, 1024 and 360 px (bounding boxes of value and any control do not intersect). Selecting a size still works. | story + `--measure` at 360/1024/1280, unit test |
| AC-4 | Pagination prev/next buttons are at least 44x44 px (hit area; the visible glyph may stay smaller). Focus ring visible, forced-colors ring present. | `--measure` at 360 and 1280 |
| AC-5 | At 360 px, and at 200 % zoom equivalent (180 px CSS viewport is not required; use 360 px at deviceScaleFactor 2 as in the 021 review), the "Number Columns" German story has `document.scrollWidth` equal to the viewport width; pagination wraps instead of overflowing. At 1280 it stays on one row where it did before. | `--measure` of `scrollWidth` at 360/1024/1280, light and dark |
| AC-6 | `lc-toast` close button and action button are at least 44x44 px (hit area) at 360 and 1280, light and dark; toast text is not clipped in EN and DE; the toast does not exceed the viewport at 360. | "Service Call" story `--measure`, DE strings |
| AC-7 | `lc-drawer` close icons (both sites) and `lc-notification-center` empty-state and item icons are decorative (`aria-hidden`, no `role="img"`); the buttons keep their accessible names. axe reports no `svg-img-alt` for these stories. | unit tests on the DOM + axe over drawer and notification-center stories (as in 023) |
| AC-8 | `lc-menu` `--danger` item text has at least 4.5:1 against the menu surface in light and dark, in rest, hover and focus states; the hover tint uses a token (no raw `rgba`). Assert in a spec in the style of `theme-contrast.spec.ts` or by a computed measurement. | contrast computation, story measure in both themes |
| AC-9 | Keyboard and screen reader: tab order and accessible names of table pagination, toast and menu unchanged; focus-visible on all changed controls. `prefers-reduced-motion` and forced-colors unchanged or working. | story check, unit tests |
| AC-10 | Prerendered HTML: the table pagination renders its default texts ("/ page") and layout without JavaScript; compat check passes on Angular 21 and 22. | `check-angular-majors.mjs` |
| AC-11 | No API break: all existing assertions in the specs of table, toast, drawer, notification-center, menu pass unchanged except where a stated reason is recorded in `build.md`. Only `pageSizeLabel` is new. | full test run |
| AC-12 | CHANGELOG entry lists each fix with its source (021 F1/F2, 023 follow-up, 020 S2), measured values, and the new input. MCP manifest picks up `pageSizeLabel`. | changelog review, manifest test |

Always covered: 360 px and desktop widths, light and dark, keyboard and screen reader, EN and DE lengths, prerendered HTML, unchanged defaults.

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Tokens only, no raw colours.

## Assumptions

- Assumption: no consumer gap ID exists; the owner's request of 2026-10-31 is the source.
- Assumption: the page-size select is meant to be non-clearable (a page size cannot be empty). Removing the clear control is a fix, not a break. If the designer finds `lc-select` has no input to turn the control off, an optional input on `lc-select` is acceptable (minor) and goes into the design.
- Assumption: how to win specificity in item 1 (lower the kit rule, `:where()`, or apply the class later) is the designer's decision, as long as AC-1 holds and `cellStyle` still wins.
- Assumption: the 44 px requirement is for the hit area; the visible size may stay smaller if the pseudo-element or padding expands the target without causing overlap.
- Assumption: all items go in one release (3.19.0).

## Open questions

None.
