# Design 068: USM X menu, tabs, palette and form gaps, lc-table hidden actions head, 067 follow-ups, backlog

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1…42 (usm-x rows 47–70, F7, 067-s1…s3, 066-n1, 067-n1…n5, 054-n2)
- **Measured on:** `main` da2c82c (3.47.0), Storybook rebuilt 2026-11-18 20:55, Chromium headless shell 156. Probes: `tmp/story-shots/068/{probe-lh,probe-lh2,grid}.log`, measures `lh-measure.js`, `grid-measure.js`.

## 1. Approach

Extend 17 components; no new component, no new entry. One version (owner 2026-11-18 18:28). About 22 new stories: the review opens the new stories at 360 and 1280 px in one theme and checks the rest by `--measure` (§9). Every default renders as today (§9 *Compare*).

| Row | Pick (where the row offers "or") | Why |
|---|---|---|
| U47 | `activeId` **model** on `lc-command-palette` | Settable and readable in one member; the palette writes it on every cursor move. |
| U48 | `CommandPaletteItem.badge` (+ `badgeVariant`), an `lc-badge` xs | Same badge as the rail's "56/60" (sidenav 3.44); a word like "count" would limit it to numbers. |
| U50 | `lc-tab` **`tooltip`** + `disabledReason` + `muted`, not `title` | The `ItemRowState` contract (3.44 list/sidenav): kit tooltip on hover **and** focus. A native `title` never shows on focus, and an input named `title` leaves a static `title` on the `<lc-tab>` host (pitfall 016). |
| U51 | `replaceUrl` boolean on `lc-tabs` | Maps 1:1 to `RouterLink.replaceUrl`; RouterLink already leaves Ctrl/Cmd/Shift/middle clicks to the browser. A `navigationExtras` object has no other extra USM X needs. |
| U53 | **`anchor` input** (an element or a point), not `openAt(x, y)` | `isOpen` stays the app's (controlled, as today); declarative; the MCP manifest has no methods (pitfall 052). §3A. |
| U54 | **`maxHeight` input** | Beside `minWidth`/`maxWidth`; USM X's two caps are per instance (`min(56vh, 420px)`, `min(55vh, 480px)`). |
| U56 | A disabled item **with** a reason stays in the arrow order (`aria-disabled`, not native `disabled`) | Reason readable by keyboard and screen reader; items without a reason keep today's native `disabled` (DOM unchanged). |
| U57 | `emphasis` = bold, **documented as visual-only** | ARIA has no "default item"; as in desktop context menus the bold item is a visual hint. The label carries meaning. |
| U68 | **`MenuItem.swatch`**, not a leading template or a control row | A toolbar or segmented control inside `role="menu"` breaks the menu's children rules and its arrow keys. The fixture: theme radios with swatches; density as a 3-item radio section. **Left out:** the segmented *look* of density (same semantics as radios). |
| U69 | **`lc-tab` `hint`** (second quiet text), not `lcTabLabel` | Same field as `NavigationItem.hint` and `CommandPaletteItem.hint`; the tab name stays text (no interactive content inside `role="tab"`); same DOM in both modes and prerender. Fixture: label "Ticket", hint "12 Status", badge "3 Treffer". |
| U60 | hooks padding-block / padding-inline / border-bottom + `busy` | One padding shorthand would wipe the sortable 32 px arrow reserve. |
| U61 | `--line-height-base: var(--line-height-normal)` (1.5) + 2 textarea hooks | Measured: textarea and list labels render 1.5 × font today (inherited from `body`), see §5. |
| U62 | A clear always emits `''` | Root cause: Enter applies "abc" through `searchSubmit`, so the deduped `''` never reaches `searchChange`. |
| U64 | `panelRole: 'auto' \| 'tooltip'` on `lc-popover` | No widening of `PopoverTriggerKind` (`Record<…>` maps, pitfall 065). |
| U67 | `mode` + `valueType` on `lc-datepicker` | Mirrors `lc-number-input` `valueType` (row 13). §3B. |
| U70 | Pressed look on `outline` and `ghost` only, with hooks | The toggle variants; a filled variant is already the emphasised state (bind `variant`). |
| 067-n2 | **Docs branch** of AC-31 | finance-intelligence renders the waterfall only on `desktop()` (`costs-causes.html` l. 64); any thin/rotate rule changes the SVG of existing chart stories (pitfalls 028, 067). *Five Causes* already is the supported 360 case. |
| 066-n1 | Total rules as `::before`/`::after` borders on **clickable** total rows | Straight to the row ends, hover fill and ring keep radius 10; borders (not backgrounds) survive forced colours. |
| 067-n4 | `NavigationItem.action.hasPopup` + `lc-sidenav` `expandedActionId` | Declarative and prerendered; *Deep Tree* uses it with the new menu `anchor`. |
| 054-n2 | Run it | WebKit is now in the Playwright cache (`~/Library/Caches/ms-playwright/webkit-2370`). |

## 2. Public API

All inputs carry JSDoc with `@default`; all are optional.

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| model (palette) | `activeId` | `string \| null` | `null` | Id of the item under the cursor. Setting it moves the cursor to the first enabled option with that item id (visual order), sets `aria-activedescendant` and scrolls it into view. An unknown or disabled id falls back to the first enabled option and writes that id back. The palette writes it on every cursor move (arrows, a new query, arriving groups); `null` on a retry option or no option. Set it in the same change as the groups that hold the id. |
| field (`CommandPaletteItem`) | `badge` · `badgeVariant` | `string` · `BadgeVariant` | — · `'default'` | A count at the line's end ("56/60"), after `hint`, before `shortcut`; never shrinks; part of the option's name. |
| input (`lc-tabs`) | `ariaLabel` | string | `''` | Name of the `role="tablist"` (both modes); empty renders no attribute. |
| input (`lc-tabs`) | `replaceUrl` | boolean | `false` | `mode="links"`: route tabs navigate with `replaceUrl`, so Back leaves the tool. A modified or middle click stays the browser's. `href` tabs ignore it. |
| input (`lc-tab`) | `tooltip` · `disabledReason` | string | `''` | Kit tooltip on hover and keyboard focus (`aria-describedby` while shown). `disabledReason` is the tooltip while `disabled` and keeps the tab reachable by the arrow keys (`aria-disabled`, never selected or followed). |
| input (`lc-tab`) | `muted` | boolean | `false` | Quiet ink (`--color-text-tertiary`, weight 400): a tab that names a place edited elsewhere. Still selectable. |
| input (`lc-tab`) | `hint` | string | `''` | Quiet 12 px text after the label, before the badge ("12 Status"); in the tab's name. |
| CSS hook | `--lc-tabs-gap` · `--lc-tabs-panel-padding` | length | `var(--lc-density-gap-md, var(--spacing-4))` (16) · `var(--lc-density-padding-md, var(--spacing-4))` (16) | List-to-panel gap and panel padding; read at the site, never declared (settable on any ancestor). Flush pane: both `0`. |
| input (`lc-menu`) | `anchor` | `MenuAnchor \| null` | `null` | Opens the panel in an overlay at an element or a viewport point (§3A). `null`: the absolute panel at the projected trigger (as before). |
| type | `MenuAnchor` · `MenuPoint` | `HTMLElement \| MenuPoint` · `{ x: number; y: number }` | — | `MenuPoint` = `clientX`/`clientY`. |
| input (`lc-menu`) | `maxHeight` | string (CSS length) | `''` | Caps the panel's height (border-box); the items scroll inside, header and footer stay. Empty: no cap (overlay mode: `calc(100dvh - 16px)`). |
| input (`lc-menu`) | `loading` · `loadingLabel` | boolean · string | `false` · `'Loading…'` | Busy row after the items, `aria-busy="true"` on `role="menu"`, a polite status. Items that arrive while open take the focus (first enabled) unless it is already inside the panel. |
| input (`lc-menu`) | `ariaLabel` | string | `''` | Name of the `role="menu"` element; empty renders none. |
| fields (`MenuItem`) | `tooltip` · `disabledReason` | string | — | Kit tooltip on hover and focus. A `disabled` item with a `disabledReason` stays in the arrow order (`aria-disabled="true"`, activation ignored). |
| field (`MenuItem`) | `emphasis` | boolean | — | Bold label (the group's default member). Visual only: put meaning in the label. |
| field (`MenuItem`) | `swatch` | `string \| readonly [string, string]` | — | A 20 px colour sample (two colours: left/right halves) before the label; decorative; the label stays. |
| behaviour (`lc-menu`) | keys | — | — | Every handled key calls `preventDefault()` **and** `stopPropagation()`: arrows, Home, End, Space on a link item, and Escape (now a capture-phase `keydown` listener on `document`, added in code while open, claimed through the overlay stack). Tab is not handled. `dividerAfter` now also draws between members of a section. |
| input (`lc-table`) | `showActionsLabel` | boolean | `true` | `false`: the actions head keeps `actionsLabel` as visually hidden text (its name), shows none, keeps `actionsWidth`. |
| input (`th[lcSortableHead]`) | `busy` | boolean | `false` | `aria-busy="true"`, a 12 px ring in the arrow slot, `cursor: progress`; clicks still emit `sortChange`. |
| CSS hook | `--lc-sortable-head-padding-block` · `-padding-inline` · `--lc-sortable-head-border-bottom` | length · length · `border` value | size values (sm 8/12, md 12/16, lg 16/20) · `2px solid var(--color-border-strong)` | The 32 px arrow reserve stays. `none` drops the rule. Sortable-head SCSS only (lc-table's compiled head stays byte-identical). |
| token | `--line-height-base` | number | `var(--line-height-normal)` = 1.5, both themes | Defined beside `--line-height-normal` in `_theme-light.scss` / `_theme-dark.scss`. |
| CSS hook | `--lc-textarea-padding` · `--lc-textarea-min-height` | `padding` value · length | per size (xs 8/12 … lg 14/20) · per size (4/5/6/7rem; one-line `0`) | Read at each size rule. One line at 36 px (md): `--lc-textarea-padding: 5px 12px`. |
| behaviour (`lc-search-input`) | clear | — | — | × or Escape emits `''` on `searchChange` at once, also when `''` was the last emitted value, and cancels a pending debounced value. |
| inputs (`lc-split-button`) | `accessKey` · `ariaKeyShortcuts` · `tone` | string · string · `ButtonTone` | `''` · `''` · `'neutral'` | Passed to the face; `tone` also to the caret (`btn-tone-*`). |
| inputs (`lc-split-button`) | `menuSize` · `menuMinWidth` · `menuMaxWidth` | `SplitButtonSize` · string · string | `'md'` · `'220px'` · `''` | Passed to the menu (its defaults today). |
| input (`lc-popover`) | `panelRole` | `PopoverPanelRole` = `'auto' \| 'tooltip'` | `'auto'` | `tooltip`: with `longpress` (or hover/focus) and **without** `click`, the panel stays `role="tooltip"`, the trigger gets no `aria-haspopup`/`expanded`/`controls`, only `aria-describedby` while open; a tap outside or Escape closes it. Ignored with `click`. |
| input (`lc-avatar`) | `shape` | `AvatarShape` = `'circle' \| 'square'` | `'circle'` | `square`: radius `--lc-avatar-square-radius` (default `25%`: 6/8/10/12/16 px for xs…xl), also on image, ring and person glyph box. |
| fields (`AvatarGroupItem`) | `bg` · `fg` | string (colour or `var()`) | — | Set as `--lc-avatar-bg` / `--lc-avatar-color` on that avatar; pick a 4.5:1 pair (as `lc-avatar` 3.45). |
| inputs (`lc-datepicker`) | `mode` · `valueType` · … | §3B | `'date'` · `'date'` | §3B. |
| CSS hook | `--lc-button-pressed-bg` · `-fg` · `-border` · `--lc-button-pressed-hover-bg` | colour | `--color-surface-selected` · `--color-primary-700` · `--color-primary-600` · `--color-primary-200` | Look of `variant="outline"`/`"ghost"` with `ariaPressed` `true` (§3). `false`, `'mixed'`, `null` and other variants: unchanged. |
| field (`NavigationItem.action`) | `hasPopup` | `'menu' \| 'dialog'` | — | Renders `aria-haspopup` and `aria-expanded` on the action button, prerendered. |
| input (`lc-sidenav`) | `expandedActionId` | `string \| null` | `null` | Id of the item whose action popup is open: its button gets `aria-expanded="true"` (and stays visible). Only items with `hasPopup`. |

Default rendering unchanged: every new branch is opt-in; template additions that must exist when off are comment anchors only (`@if`), which no screenshot sees. Opened default menus get one comment more (`@if (isOpen()) { @if (anchor()) … @else … }`, pitfall 045 r1).

## 3. Anatomy and layout

### 360 px

```
Tabs (links, DE, 328 list scrolls since 3.44)        Palette option (sheet 360)
│ Ticket 12 Status [3 Treffer] │ Problem 4… ▒        │ ⓘ Offene Tickets ….. Stammd… (56/60) ⌘K │ 44 high
  14/500  12/400 tert.  badge xs, gap 8                pad 8/12 · gap 12 · hint ≤ 33 % · badge no-shrink

Menu, capped (26 items, 360×640, maxHeight min(56vh,420px) = 358.4)
┌─ header ───────────────┐  panel border-box 358.4, pad 8/0
│ Item 1             44  │  items scroll inside (overflow-y auto, overscroll contain)
│ …                      │  focused item scrolled in with block 'nearest'
└────────────────────────┘

Datetime (§3B)                    Account menu row (swatch)
Termin                             │ ●  ◐ Hell        │ indicator 20 · gap 12 · swatch 20 · gap 12 · label
[18.11.2026   × 📅] [14:30 × 🕑]   │    ◐ Dunkel      │ md 44 rows; sm swatch 16, lg 24
 flex 1 1 11rem  8  0 1 8rem
```

### From 1024 px (1280 shown)

```
Button pressed (md 42)          Sortable head busy (md 46)          Textarea one line beside a button
( Master/Detail )  off          │ BETRAG              ◠ │           [Nachricht …       ] [➤]
(▓Master/Detail▓) on: fill +    ring 12×12, 2 px stroke, end 12,     field 36 = 24 + 2×5 + 2; button icon-only md 36
 2 px border (1 + inset 1)      centred; arrow hidden while busy     bottoms equal (one-line host = field)
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| tab hint | gap 8 after the label | 12/400 (`--font-size-xs`) | `--color-text-tertiary` |
| muted tab | as other tabs | 14/400 | `--color-text-tertiary`; hover `--color-text-primary` |
| palette badge | after hint, gap 12, `flex-shrink: 0` | lc-badge xs | badge variant |
| menu swatch | 20 (sm 16, lg 24), radius 50 %, 1 px rim; `forced-color-adjust: none` | — | rim `--color-field-border`; halves `linear-gradient(90deg, a 50%, b 50%)` |
| menu loading row | pad as an item, spinner xs + text, gap 8 | 14/400 | `--color-text-secondary` |
| menu reason item | children at `opacity: .5` (not the item, so the ring stays full) | — | as disabled |
| menu emphasis | — | label `--font-weight-bold` | — |
| sortable busy ring | 12 × 12, 2 px, end 12 px, 3/4 arc; no spin under reduced motion | — | `--color-primary` |
| pressed button | border 1 px + `inset 0 0 0 1px` | as the variant | §2 hooks |
| table hidden head | `th` text in `.lc-table__sr-only` (the caption's hidden recipe); the actions `th` is its containing block while the label is hidden (`position: relative`, change note r1) | — | — |
| dl clickable total | row `border-block: 0` + `margin-block: 1px 3px` (sep variants `0 3px`); `::before` top −1, 1 px solid; `::after` bottom −3, 3 px, `border-block: 1px solid`; `inset-inline: 0`, `pointer-events: none` | — | `--color-field-border` |
| avatar square | radius `--lc-avatar-square-radius` (25 %) | — | unchanged colours |
| number-input FC | `.number-input__control:focus-within { outline: 2px solid Highlight; outline-offset: 0 }` in `forced-colors` | — | — |
| sidenav touch | `@media (hover: none) { .lc-sidenav__nav-item-row .lc-sidenav__action-btn { opacity: 1 } }`, same weight as the rest rule, after it | — | — |

## 3A. Menu overlay (AC-8)

- **When:** `anchor` is not `null`. The panel renders through `cdkConnectedOverlay` (as `lc-datepicker`/`lc-select`; `OverlayModule` is already a dependency) under `<body>`; it escapes `overflow: hidden/auto` ancestors. `OverlayStackService` (internal/overlay) keeps Escape and outside clicks top-most-only, `focusReturnTarget` returns focus, `closestLang` gives the panel the host's `lang`.
- **Positions, element:** `position` maps to the first pair (`bottom-right`: origin end/bottom → overlay end/top, …); fallbacks: the vertical flip, then the other horizontal alignment. **Point:** start/top at the point; fallbacks end/top, start/bottom, end/bottom (a native context menu). `cdkConnectedOverlayPush` on, `viewportMargin` 8, `flexibleDimensions` off, **no offsets** (pitfall 052).
- **Gap:** element mode: panel `margin-block: 8px` inside the pane, so the flipped panel keeps 8 px too (pitfall 047 r1); point mode (`--at-point`): margin 0. The pane is in flow (no `position: absolute` panel inside it, pitfall 047 r1).
- **Height:** `maxHeight`, else `calc(100dvh - 16px)`; panel `display: flex; flex-direction: column`, items `flex: 1 1 auto; min-height: 0; overflow-y: auto`.
- **Closes on:** Escape (§2 keys), a click outside the panel **and** outside the anchor element (the opening click is not "outside"), Tab, any `scroll` event (capture listener on `document`, added in code while open) whose target is not inside the panel, and an item that closes. **Resize:** CDK repositions.
- **Focus:** on open with items, first enabled item (as today). On close with focus inside the panel or on Escape: the projected trigger if any, else the anchor element if it can take focus, else the element focused when the menu opened. The anchor element is the one given at open: an app that clears `anchor` in its `closed` handler (the story's pattern) still gets the focus back on it (r1). **Tab in overlay mode (r2):** the panel is the last node of `<body>`, so the browser's Tab would leave the document (WCAG F85, 2.4.3; zoneless CD runs after the default action). In the keydown, before `close()`, call the same focus return synchronously and do **not** `preventDefault`: Tab then continues from the anchor (the next row), Shift+Tab before it. In-place mode unchanged (its panel follows the trigger in the DOM).
- **ARIA:** the kit writes no attributes onto an anchor element (the app owns it; sidenav uses `expandedActionId`). A projected trigger keeps today's `aria-haspopup`/`expanded`/`controls`.
- **Limits (JSDoc):** the overlay follows the page theme, not a subtree scope (as tooltips); it sits in the CDK container (z 1000), so inside `lc-drawer`/a sidenav drawer (1100/1002, modal) use the default mode.
- **Keyboard context menu:** the app passes the focused row element (Shift+F10, Menu key) or a point; documented in the story.

At 360 × 640 a point at (340, 600) with a 220 × 300 panel → end/bottom pair: x 120–340, y 300–600; at 1280 × 900 a point at (1270, 880) → x 1050–1270. Expected: panel rect inside `[8, vw − 8] × [8, vh − 8]` whenever the panel fits.

## 3B. Datepicker modes (AC-24)

| Input / output | Type | Default | Description |
|---|---|---|---|
| `mode` | `DatepickerMode` = `'date' \| 'time' \| 'datetime'` | `'date'` | `time`: one time field (24 h). `datetime`: a date field and a time field in one host and one value. `date`: as before (`granularity` applies). |
| `valueType` | `DatepickerValueType` = `'date' \| 'string'` | `'date'` | `string`: the forms value and `stringValueChange` are ISO 8601 local text, no `Date` and no zone: `YYYY-MM-DD`, `HH:mm`, `YYYY-MM-DDTHH:mm`; `dateChange` does not emit. `mode="time"` always uses strings. The shown text still follows `format`. |
| `stringValueChange` | output `string \| null` | — | Every model change in string mode. |
| `timeStep` | number (minutes) | `15` | Options of the time list; typed times need not match it. |
| `minTime` · `maxTime` | string `HH:mm` | `''` | Inclusive; in `datetime` they bound the time of every day; `minDate`/`maxDate` bound the day (as today). |
| `timePlaceholder` · `dateAriaLabel` · `timeAriaLabel` · `timeListAriaLabel` · `clearTimeAriaLabel` | string | `'HH:MM'` · `'Date'` · `'Time'` · `'Choose time'` · `'Clear time'` | §7. |
| validation | `NG_VALIDATORS`, string mode only | — | `{ lcDatepickerParse: { text } }` for text that is not a complete valid value, `lcDatepickerMin` / `lcDatepickerMax` out of range, `lcDatepickerIncomplete` (datetime with one part). Date mode: always `null` (unchanged forms). The visible error stays the app's (`error`, `errorMessage`). |

- **Time field:** the date field's look (variant, size, `--lc` field tokens), clock icon (`ICON_CLOCK` glyph inline as the calendar is), clear × (20, same hit area as today's ×). `<input type="text" role="combobox" aria-autocomplete="none" aria-haspopup="listbox" inputmode="numeric">`. Typed `9`, `09`, `930`, `0930`, `9:30`, `9.30`, `09:30` → `09:30` on Enter or blur; `24:00`, `12:61`, letters → model `null`, text kept, `lcDatepickerParse`.
- **Time list:** CDK overlay as the day panel (push, flip, margin 8), width = field (min 8rem, max 16rem), listbox scrolls itself (pitfall 065 r1), max 6 rows: 6 × 44 + 8 = 272. Options 44 high, 16/400 tabular; selected `--color-primary-fill` / `--color-on-primary` + check; active (cursor) `--color-surface-hover`; out of `min`/`maxTime` `aria-disabled`, skipped. Opens scrolled to the selected time, else the nearest step at or after the current time (or `minTime`).
- **Keys (field focused, `aria-activedescendant`):** ArrowDown/Up open or move; PageDown/Up ± 1 h; Home/End first/last when open; Enter selects and closes; Escape closes (`preventDefault` + `stopPropagation`, as the day panel); Alt+ArrowDown opens; typing stays text.
- **Datetime:** `role="group"` named by the visible label; the label's `for` is the date input; each input is named "<label> <part>" through `aria-labelledby` (label id + a hidden part span: "Termin Datum", "Termin Uhrzeit"). Row: `display: flex; flex-wrap: wrap; gap: 8px`; date `flex: 1 1 11rem`, time `flex: 0 1 8rem; min-width: 7rem`. 360 (328): 192 + 8 + 128 one row; 320 (288): wraps, both full width. Each field opens its own panel; the day panel is the existing one. Helper/error text below the row.

## 4. States

| Component | default | hover | focus-visible | disabled / reason | loading / busy | empty / error | overflow |
|---|---|---|---|---|---|---|---|
| tab | as today | text-primary + hover fill (muted too) | 2 px ring, inset | reason tab: dimmed, arrow-reachable, tooltip on hover/focus, never selected | — | — | DE label + hint: list scrolls, 24 px fade, ring inset (3.44/3.45) |
| menu item | as today | hover fill | ring −2 px, full opacity on reason items; scrolled in | reason item as above; plain disabled as today | busy row + `aria-busy`; focus to first item on arrival | 0 items + not loading: panel shows header/footer only (as today) | 26 items: `maxHeight` scroll; DE labels hyphenate (3.45) |
| palette badge | — | row fill | (activedescendant) | in a disabled row: badge as the row (disabled ink) | — | — | badge never wraps; hint ellipsises first, label wraps |
| pressed button | off = today | pressed: `--lc-button-pressed-hover-bg`; off: today | kit ring (3.76 L on pressed fill) | opacity .5 (as today) | loading: spinner, look kept | — | label wraps as today |
| sortable head | as today | as today | as today | — | ring, `cursor: progress`, arrow hidden | — | — |
| time field | as date field | as date field | 2 px ring (date field's) | as date field | — | parse error: text kept, model `null` | — |
| datetime | — | — | each field | both | — | incomplete → validator | 320: wraps |
| dl clickable total | rules straight | rounded fill under straight rules | ring radius 10 (as today) | — | — | — | — |

## 5. Theming

`tmp/story-shots/068/grid.log` (WCAG formula on computed tokens, translucent layers composited, fresh probe per token).

| Element | Light | Dark | Contrast (computed) |
|---|---|---|---|
| muted tab / tab hint / menu tertiary on page · surface · surface-2 · hover fill | `--color-text-tertiary` #5c6672 | #93a4ad | L 5.84 / 5.84 / 5.58 / 5.30 · D 7.31 / 6.71 / 5.56 / 6.65 (menu hover on surface-2 4.92) |
| disabled tab (for comparison, 50 %) | `--color-text-disabled` | same | L 1.53 · D 2.00 (exempt) |
| pressed ink on fill (page · surface-2) | `--color-primary-700` on `--color-surface-selected` | same tokens | L 7.85 / 7.85 · D 10.57 / 8.02 |
| pressed border vs page · surface-2 · on its fill | `--color-primary-600` | same | L 6.21 / 5.94 / 5.34 · D 11.78 / 8.97 / 9.00 (off border `--color-border-strong` 1.60 L / 1.85 D) |
| pressed hover ink on `--color-primary-200` | | | 6.71 L / 6.71 D |
| ring on pressed · pressed hover | `--color-primary-500` | | L 3.76 / 3.21 · D 7.60 / 4.83 |
| sortable busy ring on surface-2 · hover | `--color-primary` | | L 4.18 / 3.97 · D 7.58 / 9.05 |
| swatch rim on surface · surface-2 | `--color-field-border` | | L 4.83 / 4.63 · D 6.71 / 5.56 |
| menu loading text on surface-2 | `--color-text-secondary` | | 7.23 L · 9.26 D |
| time option selected · active | on-primary on primary-fill · text-primary on hover fill | | 6.21 both · 16.12 L / 11.62 D |
| avatar-group demo pairs (theme-independent) | white on `#0f5e74` · `#9a4a14` · `#4b3f8f` | same | 7.31 · 6.24 · 8.73 |
| palette badge | lc-badge default (list measure 021) | | ≥ 6.87 L · ≥ 8.18 D |

No new colour token. `theme-contrast.spec.ts` gets the pressed pairs, the muted/hint pair and the busy ring pair above (new block, no edited assertion).

**Forced colours:** pressed `outline`/`ghost` with `aria-pressed="true"`: `forced-color-adjust: none; background: Highlight; color: HighlightText; border-color: Highlight`, ring `Highlight` (the inset shadow is dropped). Muted tab: CanvasText (as all text). Busy ring: border → CanvasText (transparent arc forced opaque: a full static ring). Swatch: `forced-color-adjust: none` (a colour sample), rim CanvasText. Menu reason item: GrayText via opacity as today. dl total rules: pseudo borders → CanvasText. Number-input: Highlight outline (§3).

## 6. Accessibility

- **Semantics:** tablist named by `ariaLabel`; reason tabs `aria-disabled="true"` with roving `tabindex="-1"` (panels: no native `disabled`; links: `<a>` without `href`); in panels mode arrows move focus over enabled + reason tabs, selection follows only onto enabled tabs, the tab stop stays on the selected tab. Menu: reason items `aria-disabled` in the roving order; swatch `aria-hidden`; busy row outside `role="menu"`, its text in `role="status"` set one frame after the row renders (so it is announced), `aria-busy="true"` on the menu (axe skips `aria-required-children` while busy). Table hidden head: real text in the `th` (axe `empty-table-header` passes, best-practice tag). Popover `tooltip` role: no popup state. Datepicker time: combobox + listbox (`aria-selected`, `aria-disabled`).
- **Names:** palette option = label + description + hint + **badge** + shortcut (`aria-labelledby`, `&ngsp;` between parts). Tab = label + hint + badge (`&ngsp;` before the hint span). Menu emphasis: visual only (JSDoc).
- **Keyboard:** §2 keys (menu), §3B (time). Escape order: an item tooltip above the menu closes first (it is top of the stack), then the menu.
- **Targets:** time options 44; menu md items 44 (sm 36 as today); sidenav action 44 × 44 now visible on touch.
- **Reduced motion:** busy ring static (`animation: none`); overlay menu keeps `slideDown` only without reduced motion (global rule).
- **Announcements:** menu loading (polite); palette count via name; no announcement for pressed (state is `aria-pressed`).

## 7. Texts

| Key / input | EN default | DE |
|---|---|---|
| `lc-menu` `loadingLabel` | Loading… | Wird geladen … |
| `lc-datepicker` `timePlaceholder` | HH:MM | HH:MM |
| `dateAriaLabel` · `timeAriaLabel` | Date · Time | Datum · Uhrzeit |
| `timeListAriaLabel` · `clearTimeAriaLabel` | Choose time · Clear time | Uhrzeit wählen · Uhrzeit löschen |
| story fixtures (DE) | — | Tabs: „Facetten“, „Ticket“ + „12 Status“ + „3 Treffer“, reason „Wird im Rich Client bearbeitet“; menu: „Was diese Liste anbietet“, „Öffnet … im Rich Client“; table: „Aktionen“, „Erklären“, „Als einmalig kennzeichnen“, „Zurückziehen“ |

Narrowest checks: the DE time field placeholder fits 7rem; „Wird geladen …“ fits a 220 menu; the DE action buttons at 360 come from 3.37 action sizes (measure `scrollWidth` per story).

## 8. Stories

Every new input gets an argType (`description`, `table.defaultValue`). Demo stories that ignore meta args hide the meta controls (pitfall 055).

| Story | Expected ID | Args / setup | Shows (AC) |
|---|---|---|---|
| Active Id And Counts | `navigation-command-palette--active-id-and-counts` | DE, open, items with `badge` "56/60", a `keepOpen` item that is replaced and sets `activeId` | 1, 2 |
| Tab States (DE) | `navigation-tabs--tab-states-german` | `ariaLabel="Facetten"`, `muted`, `tooltip`, `disabledReason`, `hint` | 3, 4, 7 |
| Router Links Replace Url | `navigation-tabs--router-links-replace-url` | story router, `replaceUrl` | 5 |
| Flush Panel | `navigation-tabs--flush-panel` | hooks `0` around a card pane | 6 |
| Anchored Overlay | `navigation-menu--anchored-overlay` | 240 × 300 scrolling rail, "⋯" per row (element), right-click / Shift+F10 on a row (point) | 8 |
| Long Menu Capped | `navigation-menu--long-menu-capped` | 26 DE items, `maxHeight="min(56vh, 420px)"` | 9 |
| Loading Items | `navigation-menu--loading-items` | opens loading, items after 1.5 s (button "Erneut laden") | 10 |
| Reasons And Emphasis (DE) | `navigation-menu--reasons-and-emphasis-de` | `ariaLabel`, `disabledReason`, `tooltip`, `emphasis`, `dividerAfter` in a section | 11, 13, 14 |
| Account Menu Swatches | `navigation-menu--account-menu-swatches` | header identity, theme radios with `swatch`, density radio section, checkbox items | 15 |
| Hidden Actions Head | `data-display-table--hidden-actions-head` | DE, `actionsLabel="Aktionen"` `[showActionsLabel]="false"` `actionsWidth` | 16 |
| Sortable Head Hooks And Busy | `data-display-table--sortable-head-hooks-and-busy` | own sticky head shadow, border hook `none`, one `busy` column | 17 |
| One Line Beside A Button | `form-textarea--one-line-beside-a-button` | md one-line, `--lc-textarea-padding: 5px 12px` + icon-only md button | 18 |
| Tone And Menu Size | `components-split-button--tone-and-menu-size` | `tone="primary"`, `menuSize="sm"`, `accessKey="o"` | 20 |
| Long Press Description | `feedback-popover--long-press-description` | relation chip link, `trigger="longpress"`, `panelRole="tooltip"` | 21 |
| Square Shape | `data-display-avatar--square-shape` | all sizes × image / initials / person | 22 |
| Identity Colours | `data-display-avatar-group--identity-colours` | §5 demo pairs | 23 |
| Time · Time (DE) · Date And Time (DE) · String Value | `form-datepicker--time`, `--time-de`, `--date-and-time-de`, `--string-value` | §3B; string story prints the model below the field | 24 |
| Pressed Look | `components-button--pressed-look` | outline neutral/primary, ghost icon-only, off/on/disabled, a hook override | 25 |
| German Grouping | `form-number-input--german-grouping` | de-DE amount, en-US amount, string mode de-DE | 27 |
| *Deep Tree* (changed) | `navigation-sidenav--deep-tree` | status line above the frame; menu via `anchor` + `expandedActionId`, `hasPopup: 'menu'` | 29, 30, 8 |
| sidenav stories (changed) | the 11 with `#f9fafb`/`#666`/`#999`/`#333` | tokens: `--color-surface-2`, `--color-text-secondary`, `--color-border` | 28 |
| *Five Causes* (description) | `charts-waterfall-chart--five-causes` | ≤ 5 bars below about 480 px (also in the component JSDoc) | 31 |

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1 | spec: set id → `aria-activedescendant`, scrollTop reveals; unknown → first enabled + model write; no binding → old specs pass | — |
| 2 | spec (name contains "56/60"); story 360/1024 DE: badge right ≤ option right − 12, badge width = max-content | no wrap, overflow 0 |
| 3 | spec + axe | `aria-label` only when set |
| 4 | spec (`aria-describedby` on focus of a disabled reason tab, no selection); story L/D | ink 5.84 L / 7.31 D |
| 5 | spec with Router spy: `navigateByUrl(…, { replaceUrl: true, … })`; Ctrl/Meta/Shift click not navigated by RouterLink | default `replaceUrl: false` |
| 6 | probe default gap/padding 16/16 (measured), story with `0` | 0 / 0; defaults hash-identical |
| 7 | spec name "Ticket 12 Status 3 Treffer"; story 360 DE: list `scrollWidth > clientWidth`, focused tab ring inside the list (inset) | axe 0 |
| 8 | spec (positions, outside click, scroll close, focus return; r2: Tab in overlay mode → anchor focused synchronously during the keydown, `defaultPrevented` false; in-place Tab unchanged); story 360 and 1280: dispatch `contextmenu` at (vw − 20, vh − 40), element anchor in the scrolled rail | rect within [8, vw − 8] × [8, vh − 8]; panel not clipped by the rail |
| 9 | story 360 × 640 | panel height 358.4, items scroll, ArrowDown to item 26 keeps it fully visible |
| 10 | spec (busy, status text a frame later, focus to first item on arrival, not when focus inside) | — |
| 11 | spec + axe; story L/D: reason on hover and focus | tooltip shown on `focus()` |
| 12 | spec: a later capture listener on `document` sees `defaultPrevented`; a bubbling `document` listener is not called; arrows `defaultPrevented` + stopped | — |
| 13 | spec (`hr` inside a section, `font-weight` 700); FC shot | — |
| 14 | spec | none by default |
| 15 | spec (radio semantics, arrows); story 360/1280 L/D + FC | swatch 20 × 20, rim ≥ 4.63 |
| 16 | spec; axe with `best-practice`; `th` width = `actionsWidth` | name „Aktionen“, `empty-table-header` pass |
| 17 | spec (hook defaults = 12/16 md, measured; `aria-busy`; click emits while busy) | defaults identical |
| 18 | computed line-height in all textarea/list stories | today 12/18, 14/21, 16/24, 18/27 (= 1.5, inherited from `body`); after: same; field 36 in the new story |
| 19 | fake-timer spec: type "abc", Enter, Escape within 300 ms | emits `''` once, no later "abc" |
| 20, 21, 22, 23, 30 | specs (attributes, classes, style vars, prerender) | — |
| 24 | specs (parsing table §3B, keys, min/max, validators, ISO strings); stories 360/1280 DE | datetime one row at 360, wraps at 320 |
| 25 | spec (class/attr); story L/D/FC | §5 values; off-state hashes identical |
| 26 | measure: insert the `(hover: none)` rule's contents unconditionally (headless reports `hover: none` = false) | opacity 1 at levels 0–4 |
| 27 | spec table: de-DE „2.960,00“ → 2960, „1.234“ → 1234, „7.5“ → 7.5, „1.23“ → 1.23, „0.500“ → 0.5; en-US „1,234“ → 1234, „7,5“ → 7.5; `''`/fr-FR/de-CH unchanged; paste = typing | **2 assertions change** (`locale-size.spec` l. 92, 99): the typed separator shows as typed until blur, canonical after (the live rewrite is what destroyed „2.960“) |
| 28 | axe `color-contrast` on all 36 sidenav stories L/D | 0; h3 ≥ 4.5 |
| 29 | *Deep Tree* 360 | status line fully in the viewport above the frame |
| 31 | docs + story text | — |
| 32 | CSS spec as the error state; FC story | outline 2 px Highlight |
| 33 | *Item Icons* md clickable 1280 shot + rect measure | rules 1 px / 3 px at the same y as today, x = row left…right |
| 34 | 10 runs of the spec, also with the full suite in parallel | 10/10 green |
| 35–40 | story-shots measure (overflow, 44 px), contrast spec, argTypes, `npm run test:tools`, compat strings `lc-avatar--square`, `aria-haspopup="menu"` (sidenav action), the hidden „Aktionen“ head | — |
| 42 | Playwright WebKit (2370 cached; `npx -y playwright@1.64.0` needs the network) on *Focus return (3.34)*; else the row stays with the date | `activeElement` = trigger `<button>` |

**Number-input rule (AC-27):** per input event keep digits, a leading `-`, `.` and `,` as typed. If the locale's group separator is `.` or `,` (the other one is its decimal): both present → the last separator is the decimal, the others are dropped; only the group char present and the text matches `^-?[1-9]\d{0,2}(g\d{3})+$` → grouping (dropped); otherwise the first separator is the decimal (today). Other locales and `''`: today's rule. Blur writes the canonical text (locale decimal, no grouping). String mode uses the same parse.

**Compare (review):** `--compare=tmp/story-shots/068/baseline` (265 stories: menu, tabs, palette, table, textarea, list, search-input, split-button, popover, avatar(-group), datepicker, button, sidenav, number-input, waterfall, dl; 360/1280 L/D `--full`, measure waits 800 ms; logs `baseline-{a,b}.log`). **Expected to differ:** the 11 sidenav stories of AC-28 and *Deep Tree* (48 shots); dl *Item Icons* and *Total Row* shots that render a clickable total row (measure `.lc-dl__row--total.lc-dl__row--clickable` > 0). Everything else identical, apart from the known flakes (memory: sidenav sidebar-first-* / prominent-brand / collapsed-rail-badges / drawer-mode, table full-featured/with-filtering/with-pagination 1280).

**Change notes (review r1, 2026-11-18).** (1) Design error, §3 table hidden head: the caption's `position: absolute` recipe has `<body>` as containing block, so in a scrolled table (360 px) the span escapes `.lc-table-wrapper`'s `overflow-x: auto` and widens the page (scrollWidth 725 at 360). The actions `th` must be the span's containing block while the label is hidden. (2) Accepted build deviations: D-1 element-anchored overlay `max-height: calc(100dvh - 32px)` (pane margins 8 + panel margins 8 on both sides; point mode keeps − 16); D-3 `dividerAfter` on a section's last member draws nothing; D-5 a focused reason tab is drawn at opacity 1 (its label is a bare text node, so the menu's "dim the children" rule can't apply); D-6 wrapped datetime rows keep the wrapper's 4 px row gap (§3B said 8).

**Change note (review r2, 2026-11-18).** Design gap, §3A Tab: r1 named Tab only as a close reason. Emulated in *Anchored Overlay* (Storybook is zoneless, `typeof Zone` undefined): Tab is not prevented, no tabbable follows the panel, focus ends on `<body>` / outside the page; the next tabbable after the anchor is the row „Verträge“. §3A now returns the focus synchronously on Tab in overlay mode.

**Risks named for the build:** CDK push + in-flow pane, no offsets (047, 052); capture Escape + stack claim order with item tooltips; `focus()` doesn't scroll a partly visible item (065 r3); `&ngsp;` between name parts (015); tooltip on a dimmed item: dim children, not the item (021); FC transparent borders become opaque (064 r1); `[style.--x]` null renders no style (check host DOM); one-line host = field bottom (063 r1); kit pressed rule (0,2,0) loses to a consumer's `lc-button .btn[aria-pressed="true"]` (0,2,1) at rest — say so under Compatibility; `--line-height-base` changes textarea/list only where an ancestor sets another line-height (e.g. accordion body 1.6 → 1.5): Compatibility line.
