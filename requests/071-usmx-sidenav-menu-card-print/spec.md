# Spec 071: USM X sidenav, menu, card and badge gaps, toggle-group touch target, print rules, backlog rows

- **Status:** ready
- **Type:** extension of `lc-sidenav`, `lc-menu`/`MenuItem`, `lc-split-button`, `lc-card`, `lc-badge`, `lc-avatar`, `th[lcSortableHead]`, `lc-tabs`, `lc-toggle-group`, `lc-header`, `lc-app-shell`; backlog fixes in `lc-file-upload`, `lc-menu`, sortable head
- **Affected:** `lib/sidenav`, `lib/menu`, `lib/split-button`, `lib/card`, `lib/badge`, `lib/avatar`, `lib/table` (sortable head; locate in design), `lib/tabs`, `lib/toggle-group`, `lib/header`, `lib/app-shell`, `lib/file-upload` (stories), `modal`/`confirm-dialog` stories (054-n2), CHANGELOG, MCP manifest
- **Semver impact:** minor. Every new input is optional and its default renders as before. Three behaviour changes (U-13 Enter, U-12 muted hover, U-5 print) are bug-fix class; the owner rule is one version for all (2026-11-20 12:43).

## Need

| Group | Requester | Page and failure today |
|---|---|---|
| A. Sidenav | usm-x 74–76 | Collapsed rail drops `[sidenav-top]` and draws items only as icons; brand toggles the rail only as `lc-logo` image; `brandLogoSrc` is forced into a 24 px square; a cut label with a kit tooltip shows its full text nowhere. |
| B. Menu | usm-x 77, 78, 79, 80, 84 | Account panel (identity, radio items, switches, density) is a menu in place, but `lc-menu` is popup only; `MenuItem` has no `current`/`busy`, one nesting level, plain-text badge; `lc-split-button` passes no `maxHeight`; items carry no id/data; Enter submits a form behind the menu. |
| C. Small parts | usm-x 81, 82, 83, 85, 86 | Square avatar cannot take a key ("IN"); sortable heads reserve 32 px for the arrow unsorted; `lc-badge maxWidth` cuts the end of a label; muted tab takes normal ink on hover; at 390 px a 220 px search in `card-header-action` pushes the title to about 40 px. |
| D. Touch target | finance-intelligence vertraege row 2 | Page "Verträge" at 360 px: `lc-toggle-group size="lg"` options are 38 px high; product rule is 44 px below 1024 px. |
| E. Print | finance-intelligence app-shell row 1 | A4 prints `lc-header` and keeps the bottom clearance (~112 px) and background image of `lc-app-shell`; one content-only A4 page is impossible. |
| F. Backlog | owner | 054-n2, 068-n1, 068-n3, 069-n1, 069-n2 (below). |

The requesters' workarounds (own column, `::ng-deep`, local print CSS) go away when this ships; none is to be kept in the kit.

## What the kit has today

- `lc-sidenav`: `brandLogoSrc`, `showCollapseToggle`, `[sidenav-top]` slot (3.47), `collapsed` model; print rule hides the container only. No slot for the collapsed rail.
- `MenuItem` (`menu.component.ts:48`): `id`, `label`, `icon`, `metadata.badge` (string), `children` (one level, sections), no `current`, `busy`, `badgeVariant`, `attrs`. `lc-menu` has `maxHeight` (incl. `"room"`, 3.49) and `ariaLabel`.
- `lc-split-button` has `menuAriaLabel` (**row 79: already covered for the label**) and `menuMaxWidth`; no `menuMaxHeight`.
- `lc-badge` has `maxWidth` (3.49, cuts the end). `lc-avatar` has `name`, no `initials`. `lc-tabs` has `muted` ink at rest (`.lc-tabs__tab--muted`, 3.48). `lc-toggle-group` has `size: sm|md|lg` only. `lc-card` has `card__header-action` without wrap.

## Scope

- In: all rows above as the ACs below; one design and one version.
- Not in: a new look for `sm`/`md`/`lg`, a new menu component, changes to the requester apps, any API break, a new dependency.

## Acceptance criteria

Common (apply to every AC that changes rendering): checked at 360 and 1280 px (1024 where the AC says), light and dark, `forced-colors` and `prefers-reduced-motion`, EN and DE labels (DE verified long), unchanged defaults (existing stories and specs unchanged unless stated).

**A. Sidenav**

| ID | Criterion | Verified by |
|---|---|---|
| AC-1 | Collapsed rail keeps projected content: an optional rail-only top slot (or the existing `[sidenav-top]` kept visible by an opt-in input) renders on the collapsed rail; absent content leaves the rail as before (usm-x 74). | story "Collapsed rail with top slot" at 1280 px, measure slot inside the rail width; spec |
| AC-2 | Collapsed rail items can be given a template (icon-only per item or one icon per group); default draws items as today (74). | story + spec on default unchanged |
| AC-3 | The brand toggles the rail whatever it shows (text, `brandLogoSrc`, projected mark) when `showCollapseToggle` is on; Enter/Space work, it is one named button, focus ring visible, 44 px target (74). | spec (click, keys), axe, measured target |
| AC-4 | `brandLogoSrc` draws at its own aspect ratio bound by the brand height (square 24 px tile only as default for an unchanged square logo; a 4:1 wordmark measures width/height about 4 and is not shrunk to 24 px width) (75). Opt-in if the default would change looks; decide in design. | story with 4:1 and 1:1 logos, `--measure` width/height, both themes |
| AC-5 | A label cut by ellipsis shows its full text when the row has a kit tooltip too: inside the tooltip or as `title` beside it; rows without tooltip keep `title` (76). | spec on both row kinds; story at a narrow width |

**B. Menu**

| ID | Criterion | Verified by |
|---|---|---|
| AC-6 | `lc-menu` has an inline mode (default off): items and semantics in the page, not closing on Tab, Escape, outside click or scroll, no overlay; `role="menu"` semantics and arrow-key navigation kept (77). Popup mode unchanged. | spec, story "Inline", keyboard, axe |
| AC-7 | A projected control row can sit between items (radio items with swatch, switches, a `lc-toggle-group`) without breaking menu keyboard order; Tab behaviour documented (77). | story "Account panel" 360/1280, axe |
| AC-8 | `MenuItem.current` sets `aria-current` plus a visible mark that does not rely on colour alone; `busy` shows a spinner and `aria-busy`, item not activatable (78). Contrast computed. | spec, story, contrast |
| AC-9 | Sections nest more than one level (at least two sub-head levels), with heading semantics and indent per level; existing one-level data renders as before (78). | spec, story |
| AC-10 | `MenuItem.badgeVariant` (the kit's badge variants) colours the badge; no value renders as today; text contrast at least 4.5:1 in both themes (78). | spec, contrast, story |
| AC-11 | `lc-split-button` has `menuMaxHeight` (incl. `"room"`) passed to its menu, and the panel's height has a documented CSS hook; `menuAriaLabel` already exists, add a story/docs line only (79). | spec, story |
| AC-12 | `MenuItem` takes `id`-based `attrs`/`data` map rendered as attributes on the item (`data-*` and `id` only; never event handlers or `class`/`style`) (80). | spec incl. rejected names |
| AC-13 | Enter (and Space) on a menu item calls `preventDefault`, so a form behind the menu is not submitted (84). | spec: form with menu, Enter does not submit |

**C. Small parts**

| ID | Criterion | Verified by |
|---|---|---|
| AC-14 | `lc-avatar` has `initials` (max 2–3 letters, overrides `name` letters); the accessible name still comes from `name`/`alt` (81). Without it unchanged. | spec, story (square, circle) |
| AC-15 | The sortable head reserves arrow space only while sorted, or exposes a CSS hook for it; the busy ring keeps its place; default renders as today unless design decides otherwise and records it (82). | spec, story, measured head width |
| AC-16 | `lc-badge` marks one run that may be cut (directive or class on an inner part): the rest of a long label (end, count) stays visible, the cut run gets an ellipsis; whole text still in `title` (83). | story with 40-char name EN/DE, measured |
| AC-17 | A muted `lc-tab` keeps muted ink on hover (or a documented hook for the hover ink); selected and focus styles unchanged (85). | spec, story hover, contrast |
| AC-18 | `lc-card` head wraps the action onto its own line under the title on a narrow card (input or container query), without `::ng-deep`; at 390 px with a 220 px search the title is not covered and the count does not break; wide cards unchanged (86). | story at 390 and 1280 px, measured title width, DE |

**D. Touch target**

| ID | Criterion | Verified by |
|---|---|---|
| AC-19 | `lc-toggle-group` offers an opt-in (new size or input) giving each option a hit area at least 44 × 44 px at 360 px; look of `sm`/`md`/`lg` unchanged; Arrow/Home/End and radiogroup semantics unchanged (vertraege row 2). | story DE texts, measure, axe, spec on default |

**E. Print**

| ID | Criterion | Verified by |
|---|---|---|
| AC-20 | In `@media print` `lc-header` is `display: none`; `lc-app-shell` has no bottom clearance (`--lc-app-shell-bottom-clearance` resolves to 0) and no background image (`--lc-app-shell-bg-image` none); on screen nothing changes (pixel hash equal to baseline). | print-media emulation at 360 and 1280 px, measured content top and end strip; hash compare |
| AC-21 | A story "Print" or docs section states the print behaviour; MCP manifest shows it. | story, manifest |

**F. Backlog**

| ID | Criterion | Verified by |
|---|---|---|
| AC-22 | 068-n1: `.lc-sortable-head__busy` uses logical properties (`inset-inline-end`, `border-inline-end-color`); in RTL the ring sits over the reserve. LTR unchanged. | story `dir=rtl`, measure |
| AC-23 | 068-n3: `lc-menu` with a point `anchor` and nothing focused has a defined focus target after Tab/Escape (return to a target) or the requirement that the target takes focus is documented in the input JSDoc and story. | spec or docs check |
| AC-24 | 069-n1: image `lc-file-upload` without rejection adds no 8 px gap (`.file-upload-image__error:empty` with negative margin); the `role=alert` region stays. | measured gap, story |
| AC-25 | 069-n2: stories *Image German* and *Image Rejected German* give the hint other content (use of the logo), not the limits again. | story text |
| AC-26 | 054-n2: Safari/iOS check of *Focus return (3.34)* stories if WebKit is available; otherwise the row stays in `BACKLOG.md` with a note and the AC is not a blocker. | build.md note |

Prerendered HTML: the sidenav collapsed rail (AC-1, AC-2) and card head wrap (AC-18) must hold before JS; check in `check-angular-majors.mjs` consumer (extend `EXPECT_IN_HTML` only if a new class is needed). New inputs documented with JSDoc `@default`.

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break; public hooks `--lc-<component>-<property>` with documented defaults; no `::ng-deep` required of consumers.
- Where a fix would change an existing default (AC-4, AC-15), keep the default and add an opt-in unless design shows the old output is a defect; record it in design.md.

## Assumptions

- Assumption: row 79 is half covered (`menuAriaLabel`); only `menuMaxHeight` is built.
- Assumption: rows 74, 77, 78 are the largest items; they stay in this bundle by owner decision, so the designer may fix the minimum (slot, template, inline mode, `current`/`busy`, `badgeVariant`) and record what is left as backlog with a reason.
- Assumption: the print behaviour (AC-20) uses the existing hooks, so apps that already set them in print keep working.
- Assumption: 054-n2 stays in the backlog if WebKit is not installed; check `npx playwright` availability once in the build.
- Assumption: consumers: usm-x pins the kit to adopt rows 74–86 on 3.49.1+; finance-intelligence on its page "Verträge" and spec 022.

## Open questions

None.
