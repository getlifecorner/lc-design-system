# Spec 068: USM X menu, tabs, palette and form gaps, lc-table hidden actions head, 067 follow-ups, backlog

- **Status:** ready
- **Type:** extension of many components (menu, tabs, command-palette, table, sortable head, textarea, search-input, split-button, popover, avatar, avatar-group, datepicker, button, sidenav, number-input) + theme token + bug fixes + stories/docs
- **Affected:** `libs/angular-ui-kit/src/lib/{menu,tabs,command-palette,table,textarea,search-input,split-button,popover,avatar,avatar-group,datepicker,button,sidenav,number-input,waterfall-chart,description-list,notification-center}`, `src/styles/_theme-*.scss` (+ `theme-contrast.spec.ts`), CHANGELOG, READMEs
- **Semver impact:** minor. Every input, hook and variant is optional and its default renders as before. Two behaviour fixes (AC-12 Escape `preventDefault`, AC-19 debounce cancel) and one token (AC-18) are bug-class and called out in *Assumptions*.

Owner decision 2026-11-18: one version, no split, nothing back to the inbox. Names (inputs, hooks) are the designer's; the names below are the requester's proposals.

## Need

USM X (Angular client, adopting kit 3.45 to 3.47) keeps workarounds for 24 gaps: `::ng-deep` caps on menus, post-render DOM edits for names and titles, its own click capture for `replaceUrl`, its own long-press timer, own tab buttons and an own account panel. finance-intelligence lists of open rows need an actions column head that is named for screen readers but shows no text. Request 067 left three queued findings (sidenav touch actions, `de-DE` number parsing, dark story contrast) and six backlog rows. The kit closes them so no consumer keeps local copies.

## What the kit has today (checked in the source)

- `lc-menu`: inputs `items`, `isOpen`, `position`, `size`, `minWidth`, `maxWidth`; outputs `itemClick`, `closed`, `itemToggle`; absolute panel. No anchor, `maxHeight`, `ariaLabel`, `loading`.
- `lc-table`: `showCaption` (default true) and `actionsLabel` (default `''`) exist; `showActionsLabel` does not.
- `lc-popover`: `longpress` is in `interactive()` with `click` (dialog role); no description-only variant.
- `--line-height-base` is read by `textarea.component.scss:27` and `list.component.scss:108` but defined nowhere.
- Command palette has no `activeId`; `lc-tabs` has no list name; no `replaceUrl`. Not found: `lcTabLabel`, `busy`, `shape`. No row is fully covered today, so there is no *Resolution*.

## Scope

- In: all rows below, and the backlog rows 066-n1, 067-n1..n5 (deleted from `BACKLOG.md`; rows are now ACs).
- Not in: redesign of any component; moving `.sbmenu`/account panel into the kit; new runtime dependency; peer range change; new `lc-menu` features beyond the rows. 054-n2 stays in `BACKLOG.md` (see AC-42).

## Acceptance criteria

Source tags: U = usm-x row, F = finance-intelligence row, S = 067-s, B = backlog.

### A. lc-command-palette (U47, U48)

| ID | Criterion | Verified by |
|---|---|---|
| AC-1 | U47: the active option is settable and readable (`activeId` model). After a `keepOpen` item the app sets the id of the line that took its place; the active line has `aria-activedescendant` on the input and scrolls into view. An unknown id falls back to the first enabled line. Without it, behaviour is unchanged. | unit test + story |
| AC-2 | U48: `CommandPaletteItem` takes an optional count/badge drawn at the line's end ("56/60"), after `hint`, never wrapped away at 360 px, included in the option's accessible name. Absent: DOM and spacing identical. | unit test, story 360 and 1024, DE |

### B. lc-tabs, lc-tab (U49, U50, U51, U52, U69)

| ID | Criterion | Verified by |
|---|---|---|
| AC-3 | U49: `lc-tabs` takes an accessible name for its `role="tablist"` (`ariaLabel`); without it no `aria-label` attribute is rendered. In links mode the same name sits on the list. | unit test, axe |
| AC-4 | U50: `lc-tab` takes `title`, `disabledReason` and a `muted` state. `disabledReason` is the tab's tooltip and is exposed to screen readers (`aria-describedby`) also when the tab is disabled; a disabled tab still takes hover/focus for it. `muted` uses quiet ink with contrast ≥ 4.5:1 light and dark (computed) and stays distinguishable from disabled and from the active tab. | unit test, theme-contrast, story light/dark |
| AC-5 | U51: in links mode a tab can navigate with `replaceUrl` (or router extras). A plain click replaces the history entry; Ctrl/Cmd/Shift/middle click stays the browser's. Default: unchanged push. | unit test with Router spy |
| AC-6 | U52: hooks for the panel padding (`--lc-tabs-panel-padding`) and the list-to-panel gap. Defaults render the current values (measured equal). Flush panel = 0 both. | unit test + story, measured at 360/1280 |
| AC-7 | U69: a tab takes a label template (`lcTabLabel`) or a second quiet text next to the badge, so "Ticket · 12 Status · 3 Treffer" fits. Roving tabindex, arrow keys, and the tab's accessible name (the template's text) are unchanged. The default label and badge DOM are unchanged. Long DE text at 360 px: the list scrolls or wraps without clipping the focus ring. | unit test, story 360/1280, DE, axe |

### C. lc-menu and MenuItem (U53–U59, U68)

| ID | Criterion | Verified by |
|---|---|---|
| AC-8 | U53: the menu opens at a point (`openAt(x, y)`) or an element (anchor input), in an overlay (`lib/internal/overlay`) that escapes a scrolling or `overflow: hidden` container and flips/shifts at the screen edge. A context menu at the pointer stays inside the viewport at 360 px and 1280 px, incl. near the right/bottom edge. Closes on Escape, outside click, scroll or resize policy as the designer decides; focus returns to the trigger or the previously focused element. Default (projected trigger, absolute panel) is unchanged. | unit test, story with scrolling rail, measured rect inside viewport |
| AC-9 | U54: the panel height is capped (`maxHeight` input or `--lc-menu-max-height`) and scrolls inside, with a visible focus ring on every item and the active item scrolled into view by keyboard. 26 entries at 360×640 stay on screen. No cap by default. | story 360/1280, measured panel height |
| AC-10 | U55: `lc-menu` has a `loading` state (busy indicator, `aria-busy`, a polite announcement) and moves focus to the first enabled item when items arrive while open, unless focus is already inside the panel. Closed or default: unchanged. | unit test, story |
| AC-11 | U56: `MenuItem` takes `tooltip` and `disabledReason`, shown on hover and keyboard focus also for a disabled item (disabled items stay in the arrow-key order or are reachable otherwise, the designer decides, but the reason must be readable by keyboard and screen reader). | unit test, axe, story light/dark |
| AC-12 | U59: every key the menu handles calls `preventDefault` as well as `stopPropagation` (same as `lc-modal` since row 22). A document listener sees `defaultPrevented` after Escape. | unit test |
| AC-13 | U57: `dividerAfter` also draws between members of one section; `MenuItem` has an `emphasis` flag (bold, default member) that does not rely on weight alone for the accessible state (also exposed in a non-visual way or documented as visual-only). | unit test, story, forced-colors |
| AC-14 | U58: `ariaLabel` for the `role="menu"` panel; none rendered by default. | unit test |
| AC-15 | U68: `MenuItem` leads with a colour swatch or a leading template (`leading`/`swatch`), or the menu projects a control row between items (designer picks one; the account menu's theme swatches and 3-way density choice are the fixture). Radio/checkbox semantics and arrow keys stay intact; a swatch never carries meaning by colour alone (label stays). | unit test, story 360/1280, light/dark, forced-colors |

### D. lc-table, sortable head (F7, U60)

| ID | Criterion | Verified by |
|---|---|---|
| AC-16 | F7: `showActionsLabel` (default `true`). With `actionsLabel="Aktionen"` and `[showActionsLabel]="false"` the actions `th` shows no text, has the accessible name "Aktionen" (visually hidden text, not `aria-label` on an empty cell), keeps its width from `actionsWidth`; sorting, other heads and row actions unchanged; axe passes (no empty table header). Without the input nothing changes. | unit test, axe, DE story |
| AC-17 | U60: `th[lcSortableHead]` exposes hooks for padding and border-bottom (defaults equal today's), and a `busy` input (`aria-busy="true"`, a quiet non-motion-only indicator, respects `prefers-reduced-motion`; sort click not lost). | unit test, story, light/dark |

### E. lc-textarea, lc-search-input, lc-split-button, lc-popover (U61–U64)

| ID | Criterion | Verified by |
|---|---|---|
| AC-18 | U61: `--line-height-base` is defined in the theme (both themes or `:root`), and `lc-textarea` gets padding and min-height hooks. A one-row textarea can be set to 36 px to match a button. The defined value must equal what textarea and list render today; if not, say so in the changelog. | computed value on both consumers, story |
| AC-19 | U62: clear (× or Escape) emits `''` at once and cancels the pending debounced value; typing then Enter then Escape inside 300 ms ends with `''` and no later stale emit. Default debounce unchanged. | unit test with fake timers |
| AC-20 | U63: `lc-split-button` takes `accessKey`, `ariaKeyShortcuts`, `tone` and passes `size`, `minWidth`, `maxWidth` to the face and the menu. Defaults render as before. | unit test, story |
| AC-21 | U64: a long-press popover can keep a tooltip/description role: the trigger is not announced "has popup dialog" and the panel is not a dialog; the trigger's own click is untouched. Existing `longpress` default (dialog) unchanged. | unit test (aria attributes), axe |

### F. lc-avatar, AvatarGroupItem, lc-datepicker, lc-button (U65, U66, U67, U70)

| ID | Criterion | Verified by |
|---|---|---|
| AC-22 | U65: `lc-avatar` `shape="square"` (rounded square) at all sizes, with image, initials and icon content; contrast of initials unchanged. Default round. | story all sizes, DOM test |
| AC-23 | U66: `AvatarGroupItem` takes a per-item colour (value or CSS variable) with the same contrast rules as `lc-avatar`'s identity colours (3.45); default six member colours unchanged. | unit test, contrast, story light/dark |
| AC-24 | U67: `lc-datepicker` has a time mode and a date-time mode (24 h, DE and EN, keyboard operable, min/max, timezone-free local value) and a text value mode like `lc-number-input` (value as string in a documented format, no `Date` conversion; invalid text reports a validation error). Existing `Date` mode unchanged. | unit tests, story 360/1280, DE |
| AC-25 | U70: `lc-button` with `aria-pressed="true"` draws a pressed look (tint behind the outline or a documented hook). Contrast 3:1 against the surround, light and dark, forced colours distinguishable (not by tint alone). Off state and buttons without `ariaPressed` are pixel-identical to today. | unit test, theme-contrast, story light/dark/forced |

### G. 067 follow-ups and backlog (S1–S3, B)

| ID | Criterion | Verified by |
|---|---|---|
| AC-26 | S1: under `@media (hover: none)` sidenav row actions are visible at every level (as the 44 × 44 box answers taps). Hover devices unchanged. | story with `hover: none` emulation, measured opacity |
| AC-27 | S2: `lc-number-input` with `locale="de-DE"` reads "2.960,00" as 2960 and "1.234" as 1234; en-US reads "1,234" as 1234; the decimal comma/point behaviour in other locales stays; pasted text is handled the same. | unit test table of inputs |
| AC-28 | S3: sidenav stories use theme tokens for content boxes; no `#f9fafb`, `#666`, `#333`; *With Groups And Actions* dark h3 ≥ 4.5:1; axe `color-contrast` passes in all sidenav stories light and dark. | story-shots, axe |
| AC-29 | B 067-n1: sidenav *Deep Tree* status line is visible at 360 (frame or line resized). | story 360 |
| AC-30 | B 067-n4: sidenav item action `hasPopup` plus an open-id input sets `aria-haspopup`/`aria-expanded` declaratively, prerendered; the existing `itemActionClick` path and its defaults are unchanged. | unit test, prerendered HTML |
| AC-31 | B 067-n2: waterfall-chart at 360 with 9 bars: value labels no longer overlap (thin or rotate or hide by rule) and categories are not cut to 2–3 letters, or the docs state the ≤ 5-bar guidance and the story shows the supported case. Fewer bars: unchanged. | story 360, measured label rects |
| AC-32 | B 067-n3: forced colours, a focused `lc-number-input` shows `outline: 2px solid Highlight` on `:focus-within`. | CSS spec like the error state, story forced-colors |
| AC-33 | B 066-n1: description-list total row rules follow the clickable row's rounded corners (no bend at `--border-radius-sm`). | story *Item Icons* md clickable 1280, screenshot |
| AC-34 | B 067-n5: `notification-center.icons.spec.ts` is stable (cause fixed; no retry hack): 10 runs green, also with the full suite in parallel. | test log |

### Cross-cutting (apply to every AC above)

| ID | Criterion | Verified by |
|---|---|---|
| AC-35 | 360 px and 1024/1280 px: no horizontal overflow, touch targets ≥ 44 px, focus visible. | story-shots measure |
| AC-36 | Light and dark: text 4.5:1, UI boundaries 3:1, computed; `forced-colors` and `prefers-reduced-motion` handled. | contrast spec, story |
| AC-37 | EN and DE strings for every new built-in text (loading, reasons), changeable by `locale`/label inputs; DE verified in stories. | story |
| AC-38 | Each new input, slot, hook and variant has a story and argType (`description`, `table.defaultValue`) and JSDoc `@default`; the MCP manifest builds (`npm run test:tools`). | story, tools test |
| AC-39 | Unchanged defaults: all existing specs pass unchanged (a changed assertion needs a reason in `build.md`); no `@default` changed. | full suite |
| AC-40 | Layout-relevant new features (tabs hooks, table head, sidenav `hasPopup`, avatar shape) hold in prerendered HTML before JavaScript; add strings to `EXPECT_IN_HTML` where sensible; compat check passes on Angular 21 and 22. | `check-angular-majors.mjs` |
| AC-41 | CHANGELOG (Added/Changed/Fixed/Compatibility) names each usm-x row, F7, S1–S3 and B ids with the measured values; READMEs updated where a component listing changes. | review |
| AC-42 | B 054-n2: if WebKit is available, run the *Focus return (3.34)* stories on Safari/iOS (`document.activeElement` = the trigger `<button>` after close) and delete the row; otherwise the row stays in `BACKLOG.md` with the date. | `build.md` |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break. Menu overlay reuses `lib/internal/overlay`. Selectors that need a new folder follow the entry-point rule.
- One review and one version for everything: group commits by component.

## Assumptions

- Assumption: `lc-menu` anchor/overlay (U53) is opt-in; the default stays the absolute panel, so existing consumers keep their layout and no break results.
- Assumption: U59 (`preventDefault` on handled keys) is a bug fix in line with the `lc-modal` row 22 fix, not an API break; no known consumer relies on `defaultPrevented === false`. The designer checks the CHANGELOG for row 22 wording.
- Assumption: U61 defining `--line-height-base` may change the textarea height from the browser default; the value is chosen to match the list's current computed line height, and the diff is measured and noted.
- Assumption: U70's pressed look changes the look of `aria-pressed="true"` buttons only (additive, since 3.42 drew nothing); it is minor, and a `pressed` hook lets consumers who tint themselves (USM X via `--lc-button-outline-bg`) keep their own look.
- Assumption: U67 text mode follows `lc-number-input`'s text-value pattern (row 13); the designer fixes the text format, ISO 8601 by default.
- Assumption: where a row offers alternatives ("or"), the designer picks the one that fits the kit best and records why.
- Assumption: U68 and U69 solve the fixture (account menu, status-model tab) completely or the designer says in `design.md` which part is left out and why.
- Assumption: AC-34 root cause is probably timing under load; if it needs a test-only change, that is fine.

## Open questions

None for the owner. 054-n2 is decided (stays if WebKit is missing).
