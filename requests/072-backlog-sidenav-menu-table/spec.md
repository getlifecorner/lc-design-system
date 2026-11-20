# Spec 072: Backlog bundle — sidenav rail menu, brand mark, rail template, tooltip description; menu side positions, popup control rows, inline part names; table RTL head; WebKit focus return

- **Status:** ready
- **Type:** extension of `lc-sidenav`, `lc-menu`, `lc-table` (+ one check, docs)
- **Affected:** `lib/sidenav/` (ts, html, scss, stories, spec), `lib/menu/` (ts, html, scss, stories, spec), `lib/table/` (`_sortable-head.scss`, `table.component.scss`, stories, spec; the byte-identical head pin), `lib/modal`, `lib/confirm-dialog` (check only), CHANGELOG, README lists if an input is listed, `requests/BACKLOG.md`
- **Semver impact:** minor — only optional inputs, slots and values added; defaults render as before. The RTL head fix changes only RTL.

## Need

All nine rows of `requests/BACKLOG.md` (owner, 2026-11-20, one version, no split). They are findings that 071 left out on purpose or reviewed as nits. The consumer is mainly usm-x (collapsed rail, account panel, Finance tables) and RTL users of `lc-table`. Today an app must wire a group menu on the rail by hand, cannot project its own brand mark, cannot put a menu beside the rail by a position, cannot use control rows in a popup menu, has unnamed inline menu parts, hears a cut rail label twice, and has a table head that stays left in RTL. 054-n2 is a standing manual check.

## What the kit has today

- Sidenav: `railItems` + `railItemClick {item, event, element}`, `returnFocusTo`, a point `anchor` on `lc-menu` at the element's edge (071 workaround); `brandLogoSrc` + `brandLogoFit="natural"`; `[sidenav-rail-top]` slot; row tooltip „{label} · {tooltip}“ for a cut label (`rowTooltip`).
- Menu: overlay positions per `lc-menu` (`position`, `anchor` element or point), inline control rows (`MenuItem.control`, `lcMenuControl`), only a first part carries `ariaLabel`.
- Table: 3.45 shared `_sortable-head.scss` (`text-align: left` line 8); 071 made reserve, arrow and busy ring logical.

## Scope

- In: all nine rows below, one AC group each. Names and API are the designer's job.
- Not in: new runtime dependency, peer range change, changes to existing defaults, a new menu component.

## Acceptance criteria

### 071-n1 — rail group menu (sidenav)

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | Opt-in: a `railItems` entry with children, on the collapsed docked rail, opens its children in an `lc-menu` beside the rail (item's edge, not covering the rail). Without the opt-in, `railItemClick` behaves as in 3.50. | unit test + story at 1024 |
| AC-2 | The built-in map NavigationItem → MenuItem keeps `label`, `icon`, `disabled`/`disabledReason`, `badge`, `current`, `routerLink` navigation (click and Enter), and nested groups. A chosen entry navigates and emits `itemClicked`. | unit test |
| AC-3 | Keyboard: Enter/Space/ArrowRight open, arrows move, Escape closes and focus returns to the rail item (also when it re-renders); `aria-haspopup="menu"` and `aria-expanded` on the rail item; menu named by the group label. | unit test + story |
| AC-4 | Light and dark, EN and DE labels (menu width follows `maxWidth`, no clipped text), RTL opens on the other side, forced-colors keeps the boundary. | story at 1024 and 1280, measured |

### 071-n2 — brand-mark slot (sidenav)

| ID | Criterion | Verified by |
|---|---|---|
| AC-5 | Slot `[sidenav-brand-mark]` replaces the `brandLogoSrc` mark inside the brand link; the brand link keeps its 44 px target, focus ring, name and rail behaviour. Empty slot and unset slot: unchanged render. | unit test + story at 360 and 1024, rail and expanded |
| AC-6 | A projected mark is decorative unless the app names it; the link name stays `brandName`. Mark is in the prerendered HTML. | unit test, prerender check |

### 071-n3 — side positions (menu)

| ID | Criterion | Verified by |
|---|---|---|
| AC-7 | `right-start` and `left-start` (values of the existing position type, additive) place the panel beside the anchor element/trigger, top edges aligned, 8 px gap, flipping to the other side when there is no room and shifting inside the 8 px viewport margin. | unit test (position list) + story, measured offsets at 1024 |
| AC-8 | In RTL, the meaning of `right`/`left` is documented and tested (physical or logical: the designer decides and states it). Existing positions unchanged. | unit test |

### 071-n4 — control rows in a popup menu (menu)

| ID | Criterion | Verified by |
|---|---|---|
| AC-9 | A popup (overlay) menu with `MenuItem.control` rows renders them and every control is reachable and operable by keyboard alone (the designer chooses how, e.g. arrows enter the row; Tab behaviour of a menu without control rows is unchanged). | unit test + story, keyboard walk |
| AC-10 | Escape closes and returns focus to the trigger; a click in a control does not close the popup; no dev-mode warning/ignore for control rows in a popup. Inline control rows unchanged. | unit test |
| AC-11 | Control rows >= 44 px, labelled, 360 px, EN/DE, light/dark. | story + measure |

### 071-n5 — free rail template (sidenav)

| ID | Criterion | Verified by |
|---|---|---|
| AC-12 | A template input/slot draws the collapsed rail's content instead of `railItems`; `railItems` keeps priority rules stated in the design. Expanded mode and `items` unchanged. | unit test + story |
| AC-13 | The template gets context to reuse the rail look (at least the rail width and the current state); the rail's width, scrolling, focus order and 44 px targets hold with a template at 360 (drawer) and 1024. | story, measured |

### 071-n6 — table head in RTL

| ID | Criterion | Verified by |
|---|---|---|
| AC-14 | Under `dir="rtl"`, a sortable head cell and `lc-table`'s head cells align to the inline start (right); `lc-table__cell--end` goes left. Explicit `align`/`cellClass`/`cellStyle` still win. | unit test (computed style) + RTL story at 360 and 1280 |
| AC-15 | In LTR the computed `text-align` of every head cell is the same as in 3.50, for `lc-table` and the sortable head, sizes sm/md/lg. The head pin test changes only for this stated reason (physical `left` becomes `start`). | existing specs + measured comparison |

### 071-n7 — inline menu part names (menu)

| ID | Criterion | Verified by |
|---|---|---|
| AC-16 | Every `role="menu"` part of an inline menu with control rows has an accessible name: an optional part name (a `MenuItem` field on the control row or a per-part label; designer decides), else a documented, tested fallback derived from `ariaLabel`. No unnamed second/later part in the Account Panel story. | unit test (all menus named) + story |
| AC-17 | No new attribute when nothing is set and no `ariaLabel`: render as 3.50 for menus with a single part. | unit test |

### 071-n8 — cut label description (sidenav)

| ID | Criterion | Verified by |
|---|---|---|
| AC-18 | In *Cut Label With Tooltip* the accessible description is the tooltip text only; the label is announced once (name = label, description = tooltip text without the label). The visible tooltip text („{label} · {tooltip}“) is unchanged. | unit test on `aria-describedby` target text |

### 054-n2 — WebKit focus return

| ID | Criterion | Verified by |
|---|---|---|
| AC-19 | If WebKit (Playwright or Safari) can run here: *Focus return (3.34)* stories of `lc-modal` and `lc-confirm-dialog` show `document.activeElement` = the trigger's `<button>` after close; result in build.md. If it cannot: the row 054-n2 stays in the backlog with a "still open after 072" note. | build.md; backlog row |

### Whole bundle

| ID | Criterion | Verified by |
|---|---|---|
| AC-20 | Defaults unchanged: all existing specs for sidenav, menu, table pass without edit (except AC-15's stated one); no API break; compat check on 21 and 22 green. | full suite, compat check |
| AC-21 | Every new input, slot, value and hook has JSDoc with `@default`, a story with argType description and default, and a CHANGELOG entry per row with the backlog ID. | lint, manifest, review |
| AC-22 | New texts (e.g. menu names) are changeable through a label/locale input, DE verified. | unit test, story |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Cross-folder imports through `@lifecorner/angular-ui-kit/<folder>`; sidenav may use `lc-menu` already (check for cycles).

## Assumptions

- Assumption: all rows are opt-in; none changes a default.
- Assumption: 071-n1 is only for the docked collapsed rail, not the drawer; the group's menu replaces the app's own `railItemClick` wiring only when the opt-in is set.
- Assumption: AC-15 permits compiled-CSS changes when the LTR computed values are equal; the byte-identical pin is updated for this stated reason.
- Assumption: no consumer asked for these; they are kit completeness, so semver is judged by compatibility alone.
- Assumption: 054-n2 follows the owner decision: stays in the backlog when WebKit is not installed (`npx playwright` without a WebKit download is not enough).

## Open questions

None for the owner.

## Resolution

Not applicable (new work).
