# Spec 065: USM X fourth batch and the whole backlog

- **Status:** ready
- **Type:** new component (`lc-command-palette`) + extensions of `lc-menu`, `lc-search-input`, `lc-popover`, `lc-timeline`, `lc-avatar`, table head + 24 backlog rows (fixes, story/docs, small extensions)
- **Affected:** new `command-palette/` entry (stub, `index.ts`, `src/index.ts` line, both READMEs, MCP manifest); `menu`, `search-input`, `popover`, `timeline`, `avatar`, `table` (new sortable head directive), `header`, `sidenav`, `tabs`, `list`, `hero`, `device-frame`, `radio`, `select`, `textarea`, `chip`, `line-chart`/`charts`, `modal`/`confirm-dialog` (054-n2), stories, `_theme-*`/chart palette
- **Semver impact:** minor. Every new input is optional with an unchanged default; the new component and directive are additive. Two backlog rows move pixels by design (AC-40, AC-47), named in *Changed*. No major item found.

## Need

- **usm-x (3.42.0), items 31–37:** catalog quick search with sorting and column choice, command palette with server search, history timeline, relation info cards. Each row in the request lists what fails and the workaround (modal with checkboxes, own palette on `lc-modal`, copied table look, own floating panel, clicks by index, the chip's disc). The kit should replace these.
- **Owner (backlog):** all 24 rows of `requests/BACKLOG.md` as of 2026-11-17, rows deleted from the backlog by this spec (except 054-n2 if WebKit stays unavailable).

## What the kit has today

| Item | Today (grep, 3.44.0) | Missing |
|---|---|---|
| 31 menu | `MenuItem` with `children` sections, `role="menuitem"`, roving tabindex | `menuitemcheckbox` / `menuitemradio`, checked state, stay-open |
| 32 search | `inputRole`, `ariaExpanded`, … (3.44); `onKeydown` only handles Enter; native `type="search"` clears on Escape unless the page cancels it (comment at line ~119) | defined Escape clear, `description` |
| 33 table head | `aria-sort`, arrows and Enter/Space only inside `lc-table` template | usable on a `<th>` outside `lc-table` |
| 34 palette | `lc-search-input` combobox attrs, `lc-modal` (top placement, keys, 3.44), `lc-list` headings, `lc-menu` | the component |
| 35 popover | `position`, `trigger: click \| hover`, `openChange`, overlay stack | focus/long-press, delay, `open()`/`close()`, placement/alignment |
| 36 timeline | `items`, `title` required, `lcTimelineContent` | item event, selection, focusable, optional title |
| 37 avatar | `color` member-1…6, `ɵavatarInitials` (first + last word) | colour hook/input, one documented initials rule (usm-x has its own `tone.ts`/`profile-menu.ts` rule) |

## Scope

- In: items 31–37 and backlog rows below. Backlog rows are folded in as ACs with their ID.
- Not in: `lc-tree-view` changes; server-side search logic of the palette (the app supplies results); a new runtime dependency; peer range change.

## Acceptance criteria

### Item 31 `lc-menu` (usm-x row 31)

| ID | Criterion | Verified by |
|---|---|---|
| AC-1 | `MenuItem` gains optional `type: 'item' \| 'checkbox' \| 'radio'` (default `item`), `checked`, `radioGroup`/value, and `closeOnSelect` (default: true for item, false for checkbox/radio). Roles `menuitemcheckbox`/`menuitemradio` with `aria-checked`; a check mark is the non-colour cue. | unit test + story |
| AC-2 | A new output (e.g. `itemToggle`) emits the item and its new state; Space/Enter toggle, arrow keys and roving tabindex unchanged; the panel stays open on toggle and focus stays on the item. Column-choice story: 8 checkbox items, a `section` with a radio group. | unit test + story |
| AC-3 | Existing `items` without `type` render and behave byte-identical (existing menu specs unchanged); 360/1280, light/dark, forced-colors, DE labels ("Spalten ein-/ausblenden") fit without clipping; targets ≥ 44 px on touch. | spec + story widths + measure |

### Item 32 `lc-search-input` (row 32)

| ID | Criterion | Verified by |
|---|---|---|
| AC-4 | Escape with a non-empty value clears it (emits `''` once, keeps focus, native `type="search"` clear not doubled); with an empty value the event is not stopped, so a parent modal or palette still closes. Opt-out via an optional input only if the designer finds a consumer reason (default: on is a behaviour change, see Assumption 1). | unit test (value, emission count, `defaultPrevented`) |
| AC-5 | Optional `description` input: visible-to-AT help text linked by `aria-describedby` (not only `title`); empty/undefined renders nothing. EN + DE sample at 360 px. | unit test + story |

### Item 33 sortable head outside `lc-table` (row 33)

| ID | Criterion | Verified by |
|---|---|---|
| AC-6 | A new public directive (e.g. `lcSortableHead` on `<th>`) with inputs sort direction/active state and an output; sets `aria-sort`, `tabindex=0`, Enter/Space, and renders the kit's arrows and labelled indicator exactly like `lc-table` (same CSS, `sortedAscendingLabel`-style label inputs, EN/DE). | unit test + story vs `lc-table` head (screenshot hash or measured size/colour) |
| AC-7 | `lc-table`'s own head uses the same shared styling/logic with no visual change (existing table specs pass unchanged); 360 px, light/dark, `forced-colors`, focus-visible. | story + measure |

### Item 34 `lc-command-palette` (row 34)

| ID | Criterion | Verified by |
|---|---|---|
| AC-8 | New entry `@lifecorner/angular-ui-kit/command-palette` (stub, `index.ts`, `src/index.ts`, READMEs, manifest/MCP). Opens in a modal-style layer (top placement, overlay stack, focus return, scroll lock) via `open` model/`isOpen`; the global shortcut is the app's: optional `shortcut` input (default none, Cmd/Ctrl+K only when set). | unit test + manifest test |
| AC-9 | Input: groups of items (`heading`, items with label, icon, hint/shortcut text, `disabled`), `query` model, `queryChange` (debounced like `lc-search-input`), `itemSelect` output; built on `lc-search-input` as a combobox (`aria-activedescendant`, `aria-expanded`, `aria-controls` listbox, options `role="option"` in `role="group"` named by heading). | unit test + axe |
| AC-10 | Async groups: a group may be `loading` (busy cue, `aria-busy`, polite status text), `error` (text + retry output) or empty (no-results text); results arriving never move the active option under the user. | unit test + story |
| AC-11 | Keyboard: ArrowUp/Down over all groups (skipping headings and disabled), Home/End, Enter selects, Escape clears the query first, then closes; PageUp/Down optional. Active option scrolls into view; mouse hover does not steal the keyboard cursor. | unit test |
| AC-12 | All texts (placeholder, no results, loading, error, retry, group aria) via a `locale`/label input, EN defaults, DE verified. 360 px is a full-width sheet, 1024/1280 centred panel ≤ 40rem; max height with inner scroll; light/dark, forced-colors, reduced motion; contrast ≥ 4.5:1 for option text and hint on active row. | story at 360/1024/1280 + contrast |
| AC-13 | Prerendered HTML: closed palette renders nothing (no SSR error, no `window` access); stub in `tools/compat/` EXPECT_IN_HTML if layout matters. | compat check |

### Item 35 `lc-popover` (row 35)

| ID | Criterion | Verified by |
|---|---|---|
| AC-14 | `trigger` accepts `focus` and `longpress` (touch/pointer hold, default 500 ms, cancels on move; keyboard alternative stays: Enter/Space or focus) besides `click`/`hover`. Existing values unchanged. | unit test (fake timers) |
| AC-15 | Optional `openDelay`/`closeDelay` (ms, default 0 = as before) for hover/focus. | unit test |
| AC-16 | Public `open()`, `close()`, `toggle()` methods; `openChange` emits once per change. | unit test |
| AC-17 | Placement: `position` keeps its values; new `align: 'start' \| 'center' \| 'end'` (default `center` = today) and viewport flip/shift so the panel stays inside the viewport at 360 px. Arrow follows the trigger. | story at 360/1280 + measured rect inside viewport |
| AC-18 | Focus/hover panels stay dismissible with Escape, hoverable (WCAG 1.4.13), and Escape returns focus; AT: `aria-describedby`/`aria-expanded` consistent per trigger kind. | unit test + axe |

### Item 36 `lc-timeline` (row 36)

| ID | Criterion | Verified by |
|---|---|---|
| AC-19 | `TimelineItem.title` becomes optional; an entry without title renders no empty heading element, and a name for AT comes from `description`/`date` or a new `ariaLabel` field. Types stay source-compatible. | unit test + type test |
| AC-20 | Optional `selectable`/`interactive` input (default false = today's DOM): items become focusable (roving tabindex or per-item stop, designer decides), `itemClick` emits the item and index, Enter/Space activate, optional `selected` item with `aria-current`/`aria-selected`. | unit test + story |
| AC-21 | Visible `:focus-visible` and selected state in both themes, vertical and horizontal, compact; 44 px targets; EN/DE long titles at 360 px; defaults render identical HTML. | story + spec |

### Item 37 `lc-avatar` (row 37)

| ID | Criterion | Verified by |
|---|---|---|
| AC-22 | A public CSS hook (e.g. `--lc-avatar-bg`, `--lc-avatar-color`) with documented defaults, and/or a `color` extension that accepts a custom value; the initials colour is checked (≥ 4.5:1) by the documented pairing rule or by a `--lc-avatar-color` default. | story + contrast |
| AC-23 | One exported, documented initials rule (public helper, not only `ɵ`): first + last word, upper case, `?` for empty; rule stated in the avatar docs, `lc-header` and `lc-avatar-group` use the same function. Behaviour for one/many words unchanged (existing spec). | unit test |

### Backlog rows folded in

| ID | Criterion | Verified by |
|---|---|---|
| AC-24 | **054-n2** Manual Safari/iOS check of the *Focus return (3.34)* stories if WebKit is available; otherwise the row stays in the backlog with the date. | note in build.md |
| AC-25 | **057-n2** `CHART_PALETTE` secondary-500 reaches ≥ 3:1 on surface-2 and sunken, light and dark (use the next step or a computed fallback); no other series colour changes. Listed in *Changed*. | `theme-contrast.spec.ts` style test |
| AC-26 | **057-n4** *Action Sizes* story: lg actions visible at 360 px (stacked or sticky actions column in the story, no table change). | story 360 |
| AC-27 | **057-n6** *Badges in the Body*: German labels, no token names. | story text |
| AC-28 | **058-n1** *Light Slim* story renders a light slim band (valid `variant`/`light` combination, or story fixed). Decision for slim + light recorded in design. | story 1280 |
| AC-29 | **058-n3** *Stage Actions* description says "9.3:1 or more". | story text |
| AC-30 | **059-n1** *Screenshot Row* below 1024 px: `padding: 4px 16px 8px`; focus ring no longer covers the frame rim. | story + measure |
| AC-31 | **060-n1** `--lc-hero-media-width` default capped (`min(…, 50%)`); at 200 % root text zoom at 1024/1280 the media is not clipped and does not cover the title. | story + measure |
| AC-32 | **060-n2** Hero title hyphenates (`hyphens: auto`, `lang` aware) so "organisiert" is not cut at 320 px + 200 % text. | story DE 320 |
| AC-33 | **060-n3** *Laptop Hooks*: base height 0 hides the base (no 2 px strip) or the story wording is corrected. | story + measure |
| AC-34 | **060-n5** Chip target: measured; interactive chips get a 44 px hit area without changing layout, or the exception is documented in the chip docs and design. | measure + design note |
| AC-35 | **062-n1** Select long group header: ellipsis or 2-line clamp at 360 px with full text in `title`/AT; at most 2 lines. | story 360/1280 |
| AC-36 | **061-n3** `lc-radio-group` required marker and error placed like `lc-checkbox-group` (`*` not an `aria-label` on a bare span; error below options); axe clean. | unit + axe |
| AC-37 | **063-n1** *Gaps And Forecast*: a non-colour cue (dash/marker) or a story palette with a luminance step ≥ 3:1 between Plan and Ist, light and dark. | story + contrast |
| AC-38 | **064-n1** `lc-header`: slot between brand and end group, caller entries in the account menu, brand that is not a link (optional inputs; defaults as before). | unit + story |
| AC-39 | **064-n2** `lc-sidenav`: foldable sections (disclosure button, `aria-expanded`, state model), long press on touch opens `itemContextMenu` (iOS), and a second collapsible level only if tree semantics can be met; otherwise state in design.md why not and keep the row in the backlog. | unit + story |
| AC-40 | **064-n3** `lc-tab` `icon` is rendered only through a new opt-in (default off, so layouts stay), or the input docs are corrected. Not rendered by default. | story + measure |
| AC-41 | **063-n2** `lc-textarea` multi-line: no 6 px gap below the field; the host moves by −6 px, listed in *Changed* with the measurement. | story + measure |
| AC-42 | **064-n4** *Headings In Columns* 1280: continuation columns repeat the heading or the group stays whole. | story 1280 |
| AC-43 | **064-n5** No divider under the last row of a column; no corner clip in `--columns`. | story + measure |
| AC-44 | **064-n6** `lc-tabs` overflow cue (edge fade or scroll buttons) at 360 px, keyboard/AT unchanged. | story 360 |
| AC-45 | **064-n7** Sidenav `items` argType lists the 3.44 fields; rail badge value no longer covers the icon (cap, "99+" or move). | story + measure |
| AC-46 | **064-n8** `lc-tabs` vertical at 360: list stacks above the panel (container width), panel ≥ 280 px; wide layout unchanged. | story 360/1280 |
| AC-47 | **064-n9** Sidenav rail/busy/badge: name is not read twice (`title` dropped or kept out of the description). | unit test on accessible name |

Always covered: 360/1024/1280 px, light/dark, keyboard and screen reader, EN/DE, prerendered HTML (palette, popover, timeline), unchanged defaults. A final AC for all: full tests, lint, build, compat matrix green; changelog lists each AC group by gap ID.

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break, every new input optional.
- Cross-folder imports use package paths; new entry needs the stub.

## Assumptions

- Assumption 1: Escape clearing in `lc-search-input` is on by default (usm-x asked for it; native `type="search"` already clears in most browsers, so the visible change is small). The designer may add an opt-out if a break shows.
- Assumption 2: `lc-command-palette` does no fetching: groups and their `loading`/`error` state come from the app.
- Assumption 3: 063-n2 and 057-n2 change rendering of existing hosts slightly; accepted as bug fixes in a minor, named in *Changed* (owner decided on one version).
- Assumption 4: 064-n3 renders icons only opt-in so consumer layouts do not move.
- Assumption 5: 064-n2's multi-level collapsible is allowed to stay in the backlog if tree semantics exceed the bundle (AC-39); everything else is built.
- Assumption 6: the usm-x directory was not read beyond the row text; its own initials/tone code is the "other place" of row 37.

## Open questions

None for the owner.

## Resolution

Not applicable (new work).
