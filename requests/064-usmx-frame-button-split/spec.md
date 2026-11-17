# Spec 064: USM X frame rows, search-input combobox, modal keys and top placement, stat-trend, button outline/row/access keys, badge icon, split button

- **Change note (2026-11-17 19:10, spec-writer, owner decision 19:08):** scope is all 16 rows again, one version 3.44.0; the about-8-items limit does not apply. Rows 11 (`lc-tabs`), 14 (`lc-sidenav`) and 20 (`lc-list`) are back: AC-2…7 and AC-15 are restored, rewritten from the requester's rows (the earlier wording was not kept; same IDs, so `design.md` references stay valid), plus new AC-32 for backlog row 064-n2 (deleted from the backlog). Earlier: AC-12 and AC-21 use the "scoped accent" definition of `design.md` §1; split button is new `lc-split-button` (AC-26).
- **Status:** ready
- **Type:** extension of `lc-header`, `lc-page-header`, `lc-card`, `lc-search-input`, `lc-modal`, `lc-stat-trend`, `lc-button`, `lc-badge`, `lc-tabs`, `lc-sidenav`, `lc-list`; new component `lc-split-button` (AC-26)
- **Affected:** `lib/{header,page-header,card,search-input,modal,stat-trend,button,badge,tabs,sidenav,list}`, a new folder for the split button if chosen (stub `ng-package.json`, `index.ts`, line in `src/index.ts`), `tokens.json`/`styles/` only if a tint token is needed, CHANGELOG, both READMEs (new component), MCP manifest (inputs/JSDoc)
- **Semver impact:** minor. Every input, slot, hook and mode is optional and defaults render as before. Exceptions to settle in design, each must stay non-breaking: header `z-index` (AC-1), hook declarations moved to `:where()`/`:host` (AC-1), card divider token (AC-17), outline tint (AC-26: the default colour must stay `#84c7d40f` visually, within rounding, in the default theme).

## Need

**usm-x** (Angular 21, kit 3.41/3.42, under `/usmx/`) replaces hand-drawn frame and controls with kit components. Where the kit lacks a function it keeps local markup (a client-drawn top row, ResizeObserver moves marks, own split-button markup, attributes set after render). Pages: app shell (header, page-header), start page (cards, stat-trend), command palette (search-input, modal), toolbars (buttons, badges, split button). The kit closes the gaps. The requester's table (16 rows) is in `request.md`; **this request builds all 16: rows 4, 11, 14, 16, 17, 20-30 (one version, 3.44.0).**

## What the kit has today (checked in source)

| Row | State |
|---|---|
| 4 | `header.component.scss`: `--lc-header-*` declared on `.lc-header` (line 15-25, so an ancestor value never wins); `background-color: var(--lc-header-bg)` (l.36); `z-index: 1000` (l.41); `lc-modal` backdrop 999, container 1000 (`modal.component.scss` l.23, l.40). |
| 11 | `lc-tabs`: `selectedIndex = model(0)`, panes are children (`lc-tab`). No router or external-content mode. |
| 14 | `lc-sidenav`: `NavigationItem[]` in `items`, router links with a required `route`, `activeRoute` input, one badge value; outputs `itemClicked`, `itemAction`. No busy, lazy children, disabled reason or hint. |
| 16 | `lc-page-header`: overline uses `--color-overline`; `title-suffix` is rendered inside the heading (`page-header.component.html` l.28-50). |
| 17 | `lc-card`: brand tile from `--gradient-brand-tile`, `--shadow-brand-glow`, `subtle` hard-coded. |
| 20 | `lc-list`: `ListItem[]` has `disabled`, `selected`, `badge`; no per-item busy, tooltip (item or badge), heading item or indent level. |
| 21 | `lc-search-input`: inner `<input>` has no combobox attributes. |
| 22 | `modal.component.ts` ~l.241-253: `stopPropagation` on Escape, no `preventDefault`; no placement input. |
| 26-30 | `lc-button` has `ariaControls`, `ariaLabel`, `flush`, `inline`; no `accessKey`, `ariaKeyShortcuts`, shape or group mode. `lc-chip` has `--lc-chip-gap`, `lc-badge` has neither icon nor gap hook. No split-button component exists. |

Row 23 and 24 and the outline tint literal (row 26) are confirmed by the requester; the designer and developer re-verify them when they touch the file.

## Scope

- In: rows 4, 11, 14, 16, 17, 20-30, limited to what the row's **Needed** column asks, plus backlog row 064-n2 (row 14 "Further") as AC-32. ACs carry the row number.
- Rows 11, 14 and 20 were briefly split off (design.md §1: new item model, about 45 stories) and are back by owner decision. Rows 14 and 20 should share one row model (busy, tooltip, indent, disabled reason); the designer decides how. If the stories are too many for one review, the designer says so, but nothing goes back to the inbox.
- Not in (non-goals):
  - Row 4 "Further" items not in *Needed*: a slot between brand and end group, caller entries in the account menu, a brand that is not a link. Row 17: nothing dropped. Backlog row `064-n1` (header) holds them.
  - No new look for any default.

## Acceptance criteria

Always, for every AC that changes visuals: 360 px and 1024/1280 px, light and dark, `forced-colors`, EN and DE text lengths. Defaults unchanged: all existing specs and stories pass unmodified (AC-31).

### A. Frame rows (first batch)

| ID | Criterion | Verified by |
|---|---|---|
| AC-1 | **Row 4.** `--lc-header-bg`, `--lc-header-fg` and the other documented hooks can be set on any ancestor (`:root`, app shell) and win over the defaults; set on the `lc-header` element they still win. The header paints `background` (a `linear-gradient` value works). An open `lc-modal` (backdrop and dialog) is above the header: `elementFromPoint` over the header returns the backdrop. Sticky header and the account menu still layer above page content. | story at 360/1280 + `getComputedStyle` + `elementFromPoint`; unit test |
| AC-2 | **Row 11.** `lc-tabs` tab-list-only mode (opt-in; default unchanged): tabs that are `routerLink` or `href` links and carry `aria-controls` pointing at content rendered elsewhere (router outlet); the current tab is set by the app, not by click; the kit renders no panes. Semantics: `role="tablist"`/`tab` with `aria-selected` on the current one, or a navigation pattern the designer records with reason; arrow keys, Home/End and focus as in today's tabs. A reload or shared link with `?tab=` shows the same current tab (also in prerendered HTML). | unit test (attributes, current from input, no click-driven change) + story at 360/1280, EN/DE, keyboard, axe |
| AC-3 | **Row 14.** `lc-sidenav` action items: an item without `route` renders as a button, emits `itemClicked` only, and the app sets its `current` state; items with `route` behave as before. Enter/Space and accessible name as for links. | unit test + story |
| AC-4 | **Row 14.** Per-item `busy`: spinner replaces or accompanies the icon, `aria-busy`, item stays in place and ignores repeated activation; screen-reader text from a label input (EN default, DE verified); works in the collapsed rail and the 360 px drawer. | unit test + story, light/dark |
| AC-5 | **Row 14.** Lazy children: expanding an item emits `expandRequested`; `loading` shows a loading state in the child area (`aria-busy`); the app then supplies children; `aria-expanded` and focus stay correct; one level as today. | unit test + story |
| AC-6 | **Row 14.** `disabled` item with a `reason`: stays in place, not activatable, `aria-disabled`; the reason is reachable by keyboard and AT (tooltip plus `aria-describedby`, or visible text). | unit test + story at 360, DE |
| AC-7 | **Row 14.** Right-aligned `hint` text beside the label: ellipsis with the full text in a title/tooltip, never pushes badge or chevron out at 360 px, hidden in the collapsed rail (name kept for AT), DE length; contrast at least 4.5:1, both themes. | story with measured widths + contrast check |
| AC-8 | **Row 16.** Overline colour hook `--lc-page-header-overline-color` (name per design) with default `--color-overline`. | unit test + computed style |
| AC-9 | **Row 16.** A slot beside the heading (not inside it): content placed there is not part of the heading's accessible name; `title-suffix` keeps its current behaviour and position (no break). | unit test (accessible name of the `h1`) + story |
| AC-10 | **Row 16.** A title-size hook with a default of today's value (24 px for `size="default"`). | computed style |
| AC-11 | **Row 25.** A wrap-order hook: the title's suffix wraps below the title before the actions wrap (default order unchanged). Works with the new beside-heading slot (AC-9). | story at 360, 768 and 1280 px, measured wrap order, DE title |
| AC-12 | **Row 17.** The icon tile's `brand` and `subtle` looks come from semantic theme tokens derived from the `--color-primary-*` scale (design.md §1), not from a component-level scale step; in the default theme the rendered colours are the same as today within one RGB step, light and dark. **Scoped accent** = a customer theme written on `<html>` or a `.lc-theme-*` scope, or a subtree that re-points the semantic tokens (as usm-x's `.usmx-custom-scope`); the tile follows each. Overriding only the scale on a subtree is not claimed (pitfall 043). | story with each scoped accent, sampled pixel; unit test |
| AC-13 | **Row 17.** One rule token for `[card-header]` and the built-in head (default stays what each draws today unless design merges them with an identical default and says so). The head draws no rule and no bottom margin on a card with no body. | story + computed style |
| AC-14 | **Row 17.** The collapsible head has a dense option; the touch target stays at least 44 px (hit area, also when the visible head is shorter) or the design records why not. | measured hit area |
| AC-15 | **Row 20.** `lc-list`, all opt-in, defaults unchanged: per-item `busy` (spinner, `aria-busy`, no activation); a tooltip for an item and for its badge (keyboard-reachable, `aria-describedby`); heading items inside one list (non-interactive, correct list semantics; one list can flow into CSS columns across sub-headings without splitting a heading from its first item); an `indent` level per item (token step, works with dividers and `clickable`). Same row model as AC-4/AC-6 where design merges them. | unit tests + story at 360/1280 (columns), light/dark, DE, axe |

### B. Second batch (rows 21-25)

| ID | Criterion | Verified by |
|---|---|---|
| AC-16 | **Row 21.** `lc-search-input` forwards `role`, `aria-expanded`, `aria-controls`, `aria-activedescendant` (and `aria-autocomplete`, `aria-haspopup` if design adds them) to the inner `<input>`. Not set: no attribute in the DOM. | unit test (attributes on inner input) |
| AC-17 | **Row 22.** `lc-modal` calls `preventDefault` on Escape and on every key it handles; `defaultPrevented` is true for a page listener. Enter on its own × button does not reach page listeners or a form's default action behind it. | unit test (event flags) |
| AC-18 | **Row 22.** `placement="top"` (default `center`): the dialog is anchored at a fixed offset from the top, so the top edge does not move when the body height grows. Works at 360 px (no clipping, scrolls inside), with `size` variants, light/dark. | story, measured `top` before and after growing the body |
| AC-19 | **Row 23.** `lc-stat-trend` renders no header row (no element, no gap) when it has neither label nor icon; otherwise as before. | unit test + measured height in story |
| AC-20 | **Row 24.** `lc-card` clickable: an option keeps the title to one line with ellipsis (full title in a tooltip or `title`). The heading is outside `role="button"` (e.g. stretched link): the page's heading outline lists it, the card remains one tab stop, Enter/Space/click behave as today. Without the options nothing changes. | unit test (`getByRole('heading')`) + story, 360 px, DE |

### C. Third batch (rows 26-30)

| ID | Criterion | Verified by |
|---|---|---|
| AC-21 | **Row 26.** The outline's ground and pressed tone come from semantic theme tokens derived from the `--color-primary-*` scale (design.md §1) or a documented hook; a scoped accent (same definition as AC-12, e.g. violet) and a customer theme change both. Default render equals today's (`#84c7d40f` look) within rounding, light and dark. No literal colour left in the outline rule. | grep of scss + story with scoped accent, sampled pixel; contrast of text on the tint stays at or above 4.5:1 |
| AC-22 | **Row 27.** `lc-button` row shape (`shape="row"` or a radius hook; design decides): radius from a token, no pill focus ring; padding, border and hover suppression without outside overrides. Focus ring visible (3:1) and not clipped. | story + computed style; focus screenshot |
| AC-23 | **Row 28.** `lc-badge` has an `icon` input and a `--lc-badge-gap` hook (as `--lc-chip-gap`); icon and text do not sit flush; the icon is decorative. | unit test + story |
| AC-24 | **Row 29.** `lc-button` has `accessKey` and `ariaKeyShortcuts` inputs forwarded to the inner `<button>`/`<a>`. Unset: no attribute. | unit test |
| AC-25 | **Row 30.** A split button exists (face plus menu caret in one outline, kit `sm` geometry at least): the face emits its own event, the caret opens a menu (uses `lc-menu`), two real buttons, `aria-haspopup="menu"` and `aria-expanded` on the caret, a label input for the caret (EN default, DE verified), disabled and loading states, all button variants and sizes that make sense. Each target is at least 44 px (or the button's existing target rule), one shared focus-visible ring per part. | unit test + story, 360/1280, light/dark, keyboard (Tab, Enter, ArrowDown), axe |
| AC-26 | **Row 30.** Chosen form is recorded in `design.md`: new `lc-split-button` (recommended: the group mode would burden `lc-button`) or group mode. A new folder has stub, `index.ts` and the `src/index.ts` line, and appears in both READMEs and the MCP manifest. | build + manifest test |

### D0. Backlog fold (row 14 "Further")

| ID | Criterion | Verified by |
|---|---|---|
| AC-32 | **Backlog 064-n2 (sidenav).** The designer decides per item which are built; each built one is optional with unchanged defaults, a story and a test: several routes per item (current for all), foldable sections, image-URL icons, badge with tooltip and two numbers (e.g. "56/60", one accessible name), per-item tooltip, context-menu/long-press hook, dimmed-but-clickable state, deeper children, brand second line or chosen letter. Items left out are listed in `design.md` with the reason and re-added to `requests/BACKLOG.md`. | unit tests + stories; design.md list |

### D. Cross-cutting

| ID | Criterion | Verified by |
|---|---|---|
| AC-27 | Unchanged defaults: existing specs, stories and axe checks pass without edits; where an assertion must change, the reason is in `build.md`. | full suite |
| AC-28 | Every new input has JSDoc with `@default`; every new hook is documented with a default; each new input, slot, variant and hook has a story with argType description and `table.defaultValue`. | lint + story review |
| AC-29 | Prerendered HTML (layout before JS): header background/hooks, page-header slot position and wrap order, card head, split button face and caret, badge icon and gap hold before hydration. Add a line to `EXPECT_IN_HTML` only for the split button or tabs mode. | `check-angular-majors.mjs` |
| AC-30 | Compat on Angular 21 and 22 (AOT, strictTemplates). | compat script |
| AC-31 | CHANGELOG entry per row with the usm-x row numbers, measured values and "no API break"; docs (`docs/*.mdx`) mention the hooks (header theming, page-header, card tile, badge gap, outline tint). | changelog review |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Size: 16 rows on 11 components plus one new component, one version (owner decision 19:08). The partial work on the branch (header, page-header, theme scss, specs) is kept.

## Assumptions

- Assumption: from row 4 only the *Needed* items are built; the "Further" items are in backlog row `064-n1`.
- Assumption: row 24's heading fix applies to the clickable card only; a non-clickable card is unchanged.
- Assumption: row 25 is one hook (CSS or input), design decides; the ResizeObserver workaround of the requester is not reproduced in the kit.
- Assumption: the modal needs no `z-index` change (AC-1 moves the header below it) because lowering the header keeps the modal API unchanged.
- Assumption: former AC-2…7 and AC-15 are rewritten from the request rows because the earlier text was not saved (the folder is untracked); the designer may refine them within the requester's *Needed* column.
- Assumption: rows 23 and 24 as described by the requester are current; the developer reproduces each before fixing.

## Open questions

None. No owner decision is needed (no major, no dependency).

## Resolution

Not applicable: nothing in the 16 rows is already solved by the kit (checked in source above).
