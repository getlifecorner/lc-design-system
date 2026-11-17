# Design 065: USM X fourth batch (command palette, menu, popover, timeline, avatar, search, sortable head) and the whole backlog

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-47 (usm-x rows 31–37, 24 backlog rows). One version (owner, 2026-11-17 22:05).

## 1. Approach

**Scope and review load.** 17 new stories, about 25 changed ones. The review opens 12 shots (palette ×3 at 360/1280 L, column-choice 360, timeline selectable 360, popover placement 360, sidenav foldable 1280, rail states 1280, tabs badges/vertical 360) and checks everything else by `--measure` and the hash compare against `tmp/story-shots/065/baseline` (279 stories, 1,674 shots, 360/1024/1280 L/D, `--full`, main 5dd20b9: menu, search-input, popover, timeline, avatar(-group), table, header, select, radio, line-chart, list, tabs, sidenav, hero, device-frame, chip, textarea, area-map).

**Patterns followed.**
- **Palette (new entry `command-palette`)** = `lc-modal` (`placement="top"`, overlay stack, focus trap, `returnFocusTo`, scroll lock, Escape) + `lc-search-input` as the combobox (3.44 `inputRole` inputs) + a grouped listbox in the APG shape (`listbox > group[aria-labelledby] > option`, heading `role="presentation"`). It fetches nothing (Assumption 2): the app passes groups with `loading`/`error`. Option rows reuse the `lc-select` option look (hover fill, active = fill + 2 px inset ring), headings the `lc-menu` section recipe. Our own design over usm-x's `usm-command-palette` (read: `frontend/libs/ui/src/command-palette.ts`), with its two lessons kept: the cursor is tracked by key, and keys are taken before the document sees them.
- **`lc-menu` toggles:** ARIA `menuitemcheckbox`/`menuitemradio` with `aria-checked`; controlled (the app owns `checked`); a new output so an existing `(itemClick)="close()"` doesn't fire on toggles.
- **Popover:** `PopoverTrigger` stays (a wider union breaks `Record<PopoverTrigger, …>` maps, pitfall 063); the input takes a new `PopoverTriggerKind` or an array of them (usm-x info cards need hover + focus + long press together). Flip/shift in a few lines of JS after open, as CDK would, without moving the panel out of the host.
- **Timeline:** stretched `<button>` per item (pattern of the clickable card heading, 3.36/3.44), roving tabindex, `aria-current`. `title` stays `string`: making it optional breaks consumers who read it (pitfall 064 `route`); `''` now means "no title" (AC-19 "source-compatible").
- **Sortable head:** attribute component `th[lcSortableHead]` (a directive can't carry styles). Shared with `lc-table` through a SCSS mixin and two pure helpers; `lc-table`'s template and compiled CSS stay byte-identical (AC-7).
- **Avatar hooks:** read at the use site with the old value as fallback, never declared on the host (pitfall 020), so they work on the avatar or any ancestor.

**Backlog decisions (open in the spec).**
- **AC-34 chip target:** measured bodies 24/32/40 px (sm/md/lg), × 14 × 14. Chips keep their size: in wrapping rows (8 px gap, pitch 40) a 44 px area overlaps the next row (pitfall 044). Documented exception: chip bodies meet WCAG 2.5.8 by size; the × gets a 24 × 24 hit area (`::before`, `inset: -5px`, fits sm 24 px, 1 px clear of the split chip's action at x 71.5/72.5). Touch-first rows: `size="lg"` + `row-gap ≥ 4px`.
- **AC-39 sidenav:** foldable sections and long press are built. A second collapsible level below a section's sub-group is **not**: the sidenav is a `nav` of lists with disclosure buttons; deeper levels need a recursive template and tree semantics (`role="tree"`, `aria-level`, arrow keys) that would change every sidenav's AT model; `lc-tree-view` covers deep trees. 064-n2 stays in the backlog reworded to that part.
- **AC-40 tabs:** opt-in `showIcons` on `lc-tabs` (16 px icon, +24 px per tab); off by default, so no layout moves. *With Icons* opts in.
- **AC-28 hero:** slim and light don't combine (`variant` is one value; density and colour would need a second input nobody asked for). *Light Slim* renders `variant="light"` `size="sm"` and says so.
- **AC-37 line chart:** a luminance step ≥ 3:1 between two series that each keep 3:1 on the page needs Plan L ≈ 0.30 exactly in light (computed), so not a palette fix. New `LineChartSeries.dotted` (round dots, also in the legend): Plan dotted, Ist solid, Prognose dashed.
- **AC-25:** `CHART_PALETTE[1]` → `var(--color-secondary-graphic)` (L `#5a798c`, D `#7097af`, the 3.23 bar/ring token).
- **Spec wording changed on purpose:** AC-1 `closeOnSelect` unset keeps plain items as before (lc-menu never closed itself; a default `true` would emit `closed` in every existing menu, AC-3). AC-9 the debounced output is `searchChange` (a `query` model already owns `queryChange`). AC-19 `title` stays `string` with `''` = no title (source-compatible for readers too). AC-14 the keyboard alternative of `longpress` is the context-menu keys (Enter/Space belong to the trigger's own action).
- **AC-31:** cap at **62 %** (review r1, D7; was 60 %), not 50 %: `min(…, 50%)` would shrink area-map's documented 34rem media at 1024/100 % from 544 to 456 px; *Two Instances* has an 880 px grid at 1024, so keeping every 100 % layout needs ≥ 61.8 %.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| component | `lc-command-palette` (`CommandPaletteComponent`) | — | — | Command palette: a search field over grouped results in a top-anchored dialog. Shows what the app passes; fetches nothing. |
| model | `open` | boolean | `false` | Whether the palette is open. Closing (Escape on an empty field, backdrop, Cancel, a selection) sets it false. |
| input | `groups` | `readonly CommandPaletteGroup[]` | `[]` | Result groups in display order. A group with no items, not loading and no `error` is hidden unless it has `emptyText`. Put async groups after sync ones. |
| model | `query` | string | `''` | The field's text, two-way; `queryChange` on every keystroke (for local filtering). |
| input | `debounceMs` | number | `300` | Delay of `searchChange` and of the status announcement (0 = none). |
| input | `shortcut` | `string \| null` | `null` | Global key that toggles the palette, e.g. `'mod+k'` (`mod` = ⌘ on Apple, Ctrl elsewhere; also `ctrl`, `meta`, `alt`, `shift`, one key). A key without ctrl/meta/alt is ignored in editable fields. `null`: the app opens it. |
| input | `labels` | `Partial<CommandPaletteLabels>` | EN (§7) | Built-in texts; `COMMAND_PALETTE_LABELS_DE` is exported. |
| input | `highlightMatches` | boolean | `true` | Marks the trimmed query in labels (`<mark>`, case-insensitive). |
| input | `returnFocusTo` | `HTMLElement \| null` | `null` | As `lc-modal` (set the trigger: WebKit doesn't focus tapped buttons). |
| output | `searchChange` · `itemSelect` · `groupRetry` | string · `CommandPaletteSelectEvent` · `CommandPaletteGroup` | — | Debounced query (server search) · Enter/click on an option · Enter/click on a group's "Try again". Not `queryChange`: the model owns that name. |
| type | `CommandPaletteItem<T>` | `{ id; label; description?; icon?; hint?; shortcut?; disabled?; disabledReason?; keepOpen?; data?: T }` | — | `id` unique in its group; `hint` trailing quiet text; `shortcut` display text in a `<kbd>`; `disabledReason` replaces the hint; `keepOpen` keeps the palette open after selection. |
| type | `CommandPaletteGroup<T>` · `CommandPaletteSelectEvent<T>` · `CommandPaletteLabels` | `{ id; heading; items; loading?; error?: boolean \| string; emptyText? }` · `{ item; group }` · §7 keys | — | `error: true` shows `labels.error`, a string shows itself. |
| CSS hook | `--lc-command-palette-width` · `--lc-command-palette-max-height` | length | `40rem` · `32rem` | Panel width from 640 px (never wider than viewport − 32 px) · cap of the panel height (the top placement's room is the other cap). |
| type | `MenuItemType` · `MenuItemToggleEvent` | `'item' \| 'checkbox' \| 'radio'` · `{ item: MenuItem; checked: boolean }` | — | |
| field | `MenuItem.type` · `checked` · `radioGroup` · `closeOnSelect` | `MenuItemType` · boolean · string · boolean | `'item'` · `false` · `''` · see text | Checkbox/radio item, its state, its radio set (same name in one menu = exclusive). `closeOnSelect: true` makes the menu emit `closed` after the item acts; unset: plain items as before (your `itemClick` closes), toggles stay open. |
| output | `lc-menu` `itemToggle` | `MenuItemToggleEvent` | — | A checkbox/radio item was activated (click, Enter, Space); `checked` is the new state. Radios emit only when they become checked. `itemClick` is not emitted for toggles. |
| input | `lc-search-input` `clearOnEscape` · `description` | boolean · string | `true` · `''` | Escape with text clears it (one `''` on `searchChange`/`valueChange`, focus stays, the key is consumed); on an empty field Escape passes on (a modal closes). · Text linked by `aria-describedby` (visually hidden); empty renders nothing. |
| component | `th[lcSortableHead]` (`SortableHeadComponent`, entry `table`) | — | — | A header cell outside `lc-table` with its look, arrows, `aria-sort` and keys. |
| input | `lcSortableHead` · `sortDirection` · `sortable` · `align` · `size` | string · `TableSortDirection \| null` · boolean · `TableColumnAlign` · `TableSize` | `''` · `null` · `true` · `'start'` · `'md'` | Column key (in the event) · this column's state · `false` = the look only (no tabindex/aria-sort) · arrow before an end label · padding per table size. |
| input/output | `sortedAscendingLabel` · `sortedDescendingLabel` · `sortChange` | string · string · `SortEvent` | `'sorted ascending'` · `'sorted descending'` · — | As `lc-table`. Click/Enter/Space emit the next direction (`asc` unless `asc` → `desc`); the app sets `sortDirection`. New type `TableSortDirection = 'asc' \| 'desc'`. |
| input | `lc-popover` `trigger` | `PopoverTriggerKind \| readonly PopoverTriggerKind[]` | `'click'` | `PopoverTriggerKind = 'click' \| 'hover' \| 'focus' \| 'longpress'`; `PopoverTrigger` unchanged. `focus` = keyboard focus (`:focus-visible`); `longpress` = a hold of `longPressMs` (cancels on 10 px move), right click, Shift+F10 or the Menu key. Interactive content needs `click` or `longpress`. |
| input | `openDelay` · `closeDelay` · `longPressMs` · `align` | ms · ms · ms · `PopoverAlign = 'start' \| 'center' \| 'end'` | `0` · `0` · `500` · `'center'` | Delays for hover/focus. `align`: panel edge on the trigger's start/end edge (`center` = today). The panel flips and shifts to stay 8 px inside the viewport. |
| method | `open()` · `close()` · `toggle()` | — | — | Programmatic; `openChange` emits once per real change (no `false` while closed). |
| field | `TimelineItem.ariaLabel` | string | — | Name of a selectable item; default: `title`, else `description`, else `timestamp`. `title: ''` = no title element. |
| input/model/output | `lc-timeline` `selectable` · `selectedId` · `itemClick` | boolean · `string \| null` · `{ item; index }` | `false` · `null` · — | Items become buttons (one tab stop, arrows move, Enter/Space/click emit `itemClick` and set `selectedId` to the item's `id`). Default DOM unchanged. |
| CSS hook | `--lc-avatar-bg` · `--lc-avatar-color` | colour | neutral `--color-surface-hover` / `--color-text-secondary`; member: `--color-member-N` / `--color-on-member` | Disc and initials of the initials avatar (not the `person` fallback), on the avatar or any ancestor. Pick a pair ≥ 4.5:1. |
| function | `avatarInitials(name)` | `(string \| undefined) => string` | — | The kit rule (lc-avatar, lc-avatar-group, lc-header): first letter of the first and last whitespace-separated word, upper case; one word → its first letter; empty → `?`. `ɵavatarInitials` stays as a deprecated alias. |
| slot/input/output | `lc-header` `[slot='middle']` · `userMenuItems` · `userMenuItemClick` · `homeLink` | — · `readonly MenuItem[]` · `MenuItem` · boolean | — · `[]` · — · `true` | Between brand/nav and the end group · entries between Profile and Logout (plain items; ids `profile`/`logout` reserved) · their clicks · `false`: the logo is not a link (`<span>`, named by its `alt`). |
| field/model/input | `NavigationItem.collapsible` · `lc-sidenav` `collapsedSections` · `contextMenuOnLongPress` | boolean · `readonly string[]` · boolean | — · `[]` · `false` | A section heading becomes a disclosure · ids of folded sections (two-way) · a 500 ms touch hold emits `itemContextMenu` (iOS), suppresses the callout and the click after it. |
| input | `lc-tabs` `showIcons` | boolean | `false` | Renders each `lc-tab` `icon` (16 px) before the label; adds 24 px per tab. |
| field | `LineChartSeries.dotted` | boolean | `false` | Round dots (diameter = `strokeWidth`, every 2 × `strokeWidth`), also in the legend. Wins over `dashed`. |

**Default rendering unchanged** for every new input: new DOM only inside the new branches (fold the timeline title condition into its existing `@switch`, pitfall 045 r1); listeners for popover kinds and sidenav long press are added in code, not in the template (no `jsaction` in prerendered HTML, pitfall 051). Changed on purpose: see §4 *Changed*.

## 3. Anatomy and layout

### Command palette, 360 px (top sheet below 640 px)

```
y 0 ┌──────────────────────── 360 ─────────────────────────┐ env(safe-area-inset-top) padding
    │12┌ lc-search-input md 42 ────────────┐ 8 [Abbrechen]12│ header pad 12; Cancel = lc-button ghost lg (45.6), < 640 only
    ├───────────────────────────────────────────────────────┤ 1 px --color-divider
    │ 8 / 12  SEITEN                       12/600 caps .05em │ heading pad 4/12/4 (first), 12/12/4 (others)
    │  ┌──────────────────────────────────────────────────┐  │ option x 12, w 336: min-h 44, pad 8/12, gap 12, r 12
    │  │ [ic20] Kostenstellen              Stammdaten  ⌘K │  │ label 14/500/20; hint 12 sec, ≤ 40 %, ellipsis; kbd 12 px
    │  │        Leistungsverrechnung verwalten           │  │ description 12/400/16 sec (2-line row 52)
    └──┴──────────────────────────────────────────────────┴──┘ r 0 0 24 24, border-bottom only, max-h 100dvh − 48
       backdrop (tap closes)
```

### From 640 px (1024 / 1280)

```
          ┌────────── min(40rem, 100% − 32) = 640 ──────────┐  x 192 (1024) / 320 (1280), top 10dvh (90 at 900)
          │12┌ search md 42 ─────────────────────────────┐12│  header 67 (no Cancel)
          ├──────────────────────────────────────────────────┤
          │ groups … options as at 360 (x panel + 12)        │  body pad 8/12, scrolls; panel max-h min(32rem, 100dvh − top − 16)
          └──────────────────────────────────────────────────┘  r 18 (lc-modal), elevation-4
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Group message rows (loading, error) | min-h 44, pad 8/12, gap 12; spinner `xs`, icon 20 | 14/400/20 | text-secondary · text-error |
| Retry option | as an option, icon `arrow-path` | 14/500 | text-primary |
| Global empty | pad 24/12, centred | 14/20 | text-secondary |
| `<mark>` | pad 0 1, r 2 | inherit | `--color-warning-subtle`, ink inherited |
| kbd | h 20, min-w 20, pad 0 6, 1 px border, r sm | 12/18 | bg surface-2, border `--color-border-strong`, ink text-secondary |

Labels and descriptions wrap (`overflow-wrap: break-word; hyphens: auto; hyphenate-limit-chars: 12 4 3`, in the palette's `lang`); the hint keeps its width up to **33 %** (`flex-shrink: 0; max-width: 33%`), then ellipsises (full text in the name and `title`); a disabled reason wraps instead (`white-space: normal; text-align: end`). **Scroller (r1):** the `role="listbox"` element scrolls (`flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 8px 12px`); `.lc-modal__body` and `.lc-command-palette__body` are flex columns with `min-height: 0`, the modal body `overflow: hidden; padding: 0`. Pinning and scrolling act on the listbox. Keyboard scrolling: the first option of a group brings its heading into view (first group: scrollTop 0); the last option scrolls to the end. Selectors on the dialog are (0,3,0) (`.lc-command-palette__modal > .lc-modal.lc-modal--placement-top`) to beat lc-modal's (0,2,0); the palette is `ViewEncapsulation.None` with every rule under `.lc-command-palette`, as lc-modal.

### Menu toggles, timeline, popover, tabs, others

```
Menu md (column choice, 360)          Timeline selectable (vertical, 360)        Tabs vertical < 31rem container
┌ Spalten ein-/ausblenden ┐           ol pad 4/8                                  ┌ General ──────────────┐ list full width,
│ ✓  Name                 │ 44        ┌─────────────────────────────────┐        │ Security              │ border-bottom divider,
│    Status               │ 44        │ (●) Antrag eingereicht    09:12 │ box =   │▌Notifications         │ selected line at the
│ ✓  Leistungsverrech-    │ 64        │      Beschreibung …            │ li − gap└───────────────────────┘ inline start (2 px)
│    nungsschlüssel       │           └─────────────────────────────────┘ ±4/8   panel below, ≥ 280 (328 at 360)
│ ZEILENHÖHE              │ 30        ▌selected: surface-selected + 3 px bar
│ ●  Standard             │ 44        min box 44 (content min-block 36)
```

| Element | Rule |
|---|---|
| Menu indicator | 20 px slot at the item start, gap 12 to icon/label: `check` (ICON_CHECK, 16 px) or an SVG dot r 4, both `currentColor`. A menu with any toggle gives every item the slot (`lc-menu__dropdown--has-toggles`). |
| Timeline box | `button::before` (z −1, li `isolation: isolate`): vertical `inset: -4px -8px calc(var(--_lc-tl-gap) - 4px)` (gap 24 / compact 12 / last 0); horizontal `inset: -4px calc(2rem - 4px) -4px -4px` (last −4 all). `button::after` = transparent hit area over the same box, z 1; `.timeline__body` z 2 (its links stay clickable). Marker background transparent in this mode. r 12. **List padding (r2):** `.timeline--selectable { padding: 4px 8px }`, horizontal `padding: 4px`, so every box, its 3 px bar and the focus ring lie inside the `ol` (the horizontal `ol` is an `overflow-x: auto` scroller and clipped them). |
| Popover | `align` start/end: `inset-inline-start: 0` / `-end: 0`, no translate. JS after open and on resize: flip main axis (left/right fall back to bottom, then top), shift cross axis into [8, vw − 8] via `--_lc-popover-shift`, arrow at the trigger centre via `--_lc-popover-arrow` (clamped 16 px from the panel edges; CSS default 50 %). `max-inline-size: calc(100vw - 16px)`. Enter animation on `scale`/`opacity`, not `transform`. Hover/focus kinds: `::after` bridge over the 8 px gap. |
| Tabs fade | horizontal list with overflow: `mask-image` 24 px at the side(s) that hide tabs (`--fade-start/-end` classes from scroll + ResizeObserver). A focused tab scrolls fully in plus 24 px (`scrollLeft` only). |
| Tabs vertical | `container: lc-tabs / inline-size` on the vertical host; `@container lc-tabs (width < 31rem)`: column, list `min-width: 0` full width, `border-right` → `border-bottom`, selected line inline start. 31rem = list 200 + gap 16 + panel 280. |
| Sidenav fold | `<h2><button aria-expanded aria-controls>` label + 16 px chevron at the end (−90° folded); min-h 44, heading type unchanged; `ul` `hidden` when folded; the rail ignores folding. |
| Rail badge | on the rail a value longer than 2 characters becomes an 8 px dot (`border: 4px solid` fill, r 50 %, the badge ring) at the badge's top-right spot; text stays in the hidden name and tooltip. Measured 3.44: „56/60“ 36.3 px at x 23.7 over a 22 px icon at 33.5. |
| Sortable head | `:host` = lc-table `thead th` + `.sortable` (pad md 12/32/12/16, 14/600 caps .04em, text-secondary, bg surface-2, border-bottom 2 px border-strong, hover/sorted surface-hover + text-primary, arrow `xs` at right 12, end variant as lc-table). |
| Small fixes | textarea `display: block` (host 133 → 127 at 360 default); radio-group = checkbox-group markup (`*` `aria-hidden` + hidden text, error after options); select group label `-webkit-line-clamp: 2` + `title`; list `multiColumn` wraps each heading + its rows in a plain `div.lc-list__group` (`break-inside: avoid`, last row no divider) and sets `overflow: visible`; device-frame base `border-width: min(1px, var(--_lc-device-frame-base-height))` + no shadow at 0; hero title `hyphens: auto; hyphenate-limit-chars: 10 4 3; overflow-wrap: break-word`, media column `min(var(--lc-hero-media-width, 23rem), 62%)`; chip × `::before` 24 × 24; header middle slot `flex: 0 1 auto; min-width: 0` on the brand row. |

## 4. States

| Part | default · hover · focus-visible · active · disabled · loading · empty · error · overflow |
|---|---|
| Palette | Opens with the field focused, text selected. Hover = fill only (never moves the cursor). Active option (`aria-selected="true"`) = fill + 2 px inset ring; first enabled option on each query change, then **pinned by key**: arriving groups keep it, and the list scrolls by the active option's offset change. Disabled: text-disabled, reason readable, skipped by arrows. Loading group: `aria-busy`, a spinner row (aria-hidden), status "Searching…". Error: message row + Retry option (`aria-describedby` = message). Empty group hidden unless `emptyText`; all empty: global "No results for …". Overflow: body scrolls; DE compounds hyphenate. |
| Menu toggles | As items; `aria-checked` flips on toggle, focus stays (track by `id`). Disabled: as items. |
| Search | Escape: text → cleared (one emission, focus stays, `preventDefault` + `stopPropagation`); empty → untouched. |
| Popover | hover/focus: open after `openDelay`, close after `closeDelay` when pointer/focus left trigger + panel; Escape closes and the same hover/focus doesn't reopen it until it leaves. Long press: opens at 500 ms, the following click is cancelled. |
| Timeline | hover fill surface-hover; focus ring 2 px primary-500 offset −2 on the box; selected surface-selected + 3 px primary-500 bar (vertical inline start, horizontal block end), `aria-current="true"`. Untitled item: no title element. Long DE titles wrap inside the button. |
| Sortable head | rest · hover · sorted (arrow) · focus ring 2 px −2 — all as lc-table. |
| Sidenav | folded section: chevron right, items hidden; a current item moving into a folded section unfolds it. |

**Changed (consumer-visible, listed in the changelog):** search Escape clears (opt-out); hover-only popovers lose `aria-haspopup`/`aria-expanded` (they can't be activated) and get `aria-describedby` + panel `role="tooltip"`; popover panels that left the viewport now flip/shift; chart series 2 colour; textarea host −6 px; vertical tabs stack below 31rem; overflowing tab lists fade; rail badges > 2 chars become dots; busy rail items lose `title` (AC-47, as badged ones since 3.33); radio-group error below the options; select group labels ≤ 2 lines; list `multiColumn` keeps groups whole (DOM wrappers); hero media ≤ 62 %, title hyphenates (also English titles at 360); laptop base hidden at height 0; timeline success/warning markers use the text inks (r1).

## 5. Theming

All values computed in both themes on the build (`--measure`, composite on the real base).

| Element | Light | Dark | Contrast L / D |
|---|---|---|---|
| Option text on active/hover fill (`--color-surface-hover` over the panel ends) | text-primary | text-primary | 16.12 / 14.17 |
| Hint, description, heading on fill / panel | text-secondary | text-secondary | 6.87 / 8.18 (fill) · 7.23 / 9.26 (surface-2) |
| Active ring on fill | primary-500 | primary-500 | 3.97 / 6.69 |
| `<mark>` | warning-subtle under text-primary | same | 16.25 / ≥ 11.5 |
| Timeline selected: title · description/time · ring · bar on surface | surface-selected | surface-selected | 15.25 / 11.94 · 5.02 / 5.05 · 3.76 / 6.88 · 4.37 / 9.13 |
| Timeline tone markers (r1): `success` → `--color-text-success`, `warning` → `--color-text-warning` (were `-default`: 2.72 / 2.26 L on the page, 2.34 / 1.94 on the selected fill) | page · selected fill | page · selected fill | success 5.30 · 4.55 / 8.40 · 6.33; warning 6.03 · 5.18 / 7.65 · 5.76 |
| Timeline hover: description/time | surface-hover | surface-hover | 5.30 / 5.99 |
| Avatar hook demo pairs | secondary-fill + on-secondary · surface-selected + on-surface-selected | same | 4.62 / 4.62 · 7.85 / 8.14 |
| `CHART_PALETTE[1]` = secondary-graphic on surface-2 · sunken · surface · page | `#5a798c` | `#7097af` | 4.42 / 4.60 · 4.20 / 5.80 · 4.62 / 5.54 · 4.62 / 6.04 (was 2.98 / 2.83 light) |

Known: graphic vs info-default (entry 6) is 1.34 light (was 1.98), 1.92 dark (was 1.09); series are told apart by the legend and patterns. Sortable head reuses lc-table's values. **Forced colours** (rule needed for each, pitfalls 037 r1/062 r1): active option `outline-color: Highlight`; `mark { background: Mark; color: MarkText; forced-color-adjust: none }`; timeline ring Highlight, selected bar `border-color: Highlight`; rail dot drawn by `border` (visible as CanvasText); menu check/dot and line-chart dots use `currentColor`; tabs selected line in the stacked layout `CanvasText` like 3.44's FC rule (r1, D2; this line said Highlight). Popover panel `text-align: start` (r1: a static `align="end"` attribute on the host is a presentational hint in Chrome and right-aligned the content). No new tokens.

## 6. Accessibility

| Part | Semantics, keys, announcements |
|---|---|
| Palette | `role="dialog"` named `labels.dialogLabel`; input `role="combobox"`, `aria-expanded` (≥ 1 option), `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`, `aria-label` = `searchLabel`. Options are `div role="option"` (not focusable; `pointerdown` prevented so focus stays in the field). **Name (r1, D1):** all visible parts in DOM order, `aria-labelledby` = label, description, hint or reason, kbd ids, no `aria-describedby`, an `&ngsp;` between the parts (axe reads glued DOM text); the retry option keeps name „Try again“ + the message as description. The scrolling listbox is a combobox popup, so it needs no tab stop (axe exempts it once the listbox itself scrolls). Keys at the host before the document: ↓/↑ (wrap, skip disabled), Home/End without modifiers (first/last; Shift/Ctrl+Home/End stay caret keys, APG option 1), PageDown/Up ±10 clamped, Enter selects (`preventDefault` + `stopPropagation`, ignored while `isComposing`), Escape as AC-4 then lc-modal closes. One sr-only `role="status"` (absolute, outside the flex gap): loading / "{count} results" / no results, after `debounceMs`. Cancel and options ≥ 44 px. Reduced motion: no sheet/scale animation. |
| Menu | `menuitemcheckbox`/`menuitemradio` + `aria-checked`; radios grouped by their section (`role="group"`). Space/Enter toggle (links are never toggles). md/lg rows 44/52; sm 36 as every sm item (pre-existing). |
| Search | `description` → `aria-describedby` on the input (with the combobox attributes). |
| Sortable head | `th` (columnheader), `aria-sort` when sorted, `tabindex=0`, Enter/Space `preventDefault`; arrow `aria-hidden`, state as visually hidden text (same name as lc-table, without an `aria-label` on a span). |
| Popover | click/longpress: `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`, panel `role="dialog"`. hover/focus only: trigger `aria-describedby` → panel while open, panel `role="tooltip"`. 1.4.13: hoverable (bridge), dismissible (Escape, top of the overlay stack), persistent. `-webkit-touch-callout: none` only with `longpress`. |
| Timeline | `ol > li` kept; button per item (inside `hN` with `headingLevel`), `aria-current="true"`, `aria-describedby` = description + time. One tab stop (selected, else first); ↑/↓ and ←/→ in both orientations, Home/End; focus moves, Enter/Space select. Box ≥ 44 px. **r3:** the focused item comes fully into view: button `(focus)` → its `li.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })`, `scroll-margin` on the selectable items = the box outset (4/8 px, horizontal 4 px); Chromium's `focus()` leaves a partly visible button where it is. |
| Header | middle slot after the nav in DOM and focus order; caller entries are `menuitem`s; a non-link brand is not a tab stop. |
| Sidenav | fold button in the `h2`, `aria-expanded`, `aria-controls` → the section `ul`. Long press only with the input; Android's own `contextmenu` in the same press is not emitted twice. Rail busy item named „Berichte Wird geladen“, no description. |
| Radio | `*` `aria-hidden`, hidden "required" text in the legend; error `role="alert"` after the options (axe clean). |

## 7. Texts

| Key / input | EN default | DE |
|---|---|---|
| palette `dialogLabel` · `searchLabel` · `placeholder` | Command palette · Search commands and pages · Search or jump to… | Befehlspalette · Befehle und Seiten durchsuchen · Suchen … (r1: „Suchen oder springen …“ needs 157 px, the 360 field beside „Abbrechen“ has 123) |
| `noResults` · `empty` | No results for “{query}” · `''` | Keine Treffer für „{query}“ · `''` |
| `loading` · `error` · `retry` | Searching… · Couldn’t load these results. · Try again | Wird gesucht … · Diese Ergebnisse konnten nicht geladen werden. · Erneut versuchen |
| `results` · `oneResult` · `clear` · `cancel` | {count} results · 1 result · Clear search · Cancel | {count} Treffer · 1 Treffer · Suche leeren · Abbrechen |
| sortable head labels | sorted ascending · sorted descending | aufsteigend sortiert · absteigend sortiert |
| search `description` sample | Searches names, numbers and cost centres. | Durchsucht Namen, Nummern und Kostenstellen. |

Story strings: column choice „Spalten ein-/ausblenden“, items Name, Status, Kostenstelle, Verantwortlich, Erstellt am, Geändert am, Betrag, Leistungsverrechnungsschlüssel; section „Zeilenhöhe“: Kompakt, Standard, Großzügig. Hero *Badges in the Body*: „Monatsstand · Petrol / Blaugrau / Neutral / Erfolg / Info / Warnung / Orange / Purpur / Violett“. *Stage Actions*: „at least 9.36:1“ → „9.3:1 or more“. At 360 the DE Cancel (lg, 142.6 px) leaves the field 185.4 px, its text box 123 px: the DE placeholder must fit that (r1).

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Default | `navigation-command-palette--default` | open, 3 groups (Pages, Actions with hints/kbd/description/disabled reason, Recent) | AC-9, 11, 12 |
| Async Groups | `…--async-groups` | query „inc“; server group loading, one `error` group, one `emptyText` group | AC-10 |
| German | `…--german` | `COMMAND_PALETTE_LABELS_DE`, `lang="de"`, long compounds | AC-12 DE at 360 |
| No Results | `…--no-results` | query „xyz“, all empty | global empty + status |
| Shortcut And Trigger | `…--shortcut-and-trigger` | closed, `shortcut="mod+k"`, trigger button „Search ⌘K“, `returnFocusTo` | AC-8 |
| Column Choice | `navigation-menu--column-choice` | DE, open at load, 8 checkbox items, section radio group, `maxWidth` | AC-1–3 |
| Description | `form-search-input--description` | EN + DE field with `description`, preset value | AC-4/5 |
| Sortable Head Outside The Table | `data-display-table--sortable-head-outside-the-table` | app `<table>` (DE labels, one column sorted asc, one end-aligned) above an `lc-table` with the same columns | AC-6 parity |
| Triggers | `feedback-popover--triggers` | focus, hover with 300/200 ms delays, longpress, buttons calling `open()`/`close()` | AC-14–16, 18 |
| Placement | `feedback-popover--placement` | align start/center/end + triggers at the 360 edges, opened by a demo `open()` at load | AC-17 |
| Selectable | `data-display-timeline--selectable` | DE, vertical, `selectedId`, one untitled item (`title: ''`, `ariaLabel`) | AC-19–21 |
| Selectable Compact · Selectable Horizontal | `…--selectable-compact` · `…--selectable-horizontal` | EN | AC-21 |
| Identity Colours · Initials Rule | `data-display-avatar--identity-colours` · `…--initials-rule` | hooks on the avatar and on a wrapper; names → initials | AC-22/23 |
| Middle Slot And Menu Entries | `navigation-header--middle-slot-and-menu-entries` | middle search trigger, 2 `userMenuItems`, a second header with `homeLink=false` | AC-38 |
| Foldable Sections | `navigation-sidenav--foldable-sections` | DE, 3 sections (one folded), `contextMenuOnLongPress` | AC-39 |

Every new story binds all args or sets `controls.include` (pitfall 055 r1); fixed local dates only. Changed stories: tabs *With Icons* (`showIcons`), hero *Light Slim*, *Badges in the Body*, *Stage Actions* text, table *Action Sizes* (lg table: first column only, so the actions show at 360), line-chart *Gaps And Forecast* (+DE) Plan `dotted`, device-frame *Screenshot Row* (`padding: 4px 16px 8px` below 1024), *Laptop Hooks* (unchanged text, now true), sidenav `items` argType (all 3.44 fields + `collapsible`; same list in the input JSDoc).

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1–2 | unit: roles, `aria-checked`, `itemToggle` payload, no `itemClick`, focus stays, radio exclusivity, `closeOnSelect` | — |
| 3 | menu specs unchanged; compare 9 menu stories vs baseline; column-choice 360/1280 L/D + `--forced-colors`; row height | identical; md rows 44, no `scrollWidth > clientWidth` |
| 4–5 | unit: value `''`, one emission, `defaultPrevented` true with text / false empty, `clearOnEscape=false`; description id | 6 search stories identical |
| 6–7 | unit; story measure th vs lc-table th: height, padding, colour, bg, arrow x; compiled table CSS diff | 46 / 32 px / rgb(75,85,99) equal; table CSS byte-identical; 29 of 30 table stories identical (*Action Sizes* changes, AC-26) |
| 8 | unit + manifest test + `src/index.ts`/READMEs/stub | entry exported |
| 9–11 | unit (keys, pinning, hover, `aria-busy`, retry, option names) + `--axe` on the 5 stories; story measure: a group inserted above a scrolled active option | 0 violations; active option top ± 1 px; first heading fully visible after End → Home |
| 12 | measure at 360/1024/1280: panel x/w/top, option heights, contrasts §5 | 360: x 0 w 360 top 0; 1024: x 192 w 640; 1280: x 320 w 640 |
| 13 | compat prerender (closed palette, no `window`) | no error, no markup but hosts |
| 14–16, 18 | unit with fake timers (500 ms, move cancel, delays, once-per-change, Escape no-reopen); axe on *Triggers* | — |
| 17 | *Placement* at 360/1280: every panel rect inside [8, vw − 8]; arrow centre = trigger centre ± 1 | 4 popover stories identical (closed at load) |
| 19–21 | unit (no title element, names, keys, `aria-current`); stories L/D; box ≥ 44; each item's box inside the `ol` (margins ≥ 0, horizontal at scroll 0 and end), bar 3 px visible; r3: *Selectable Horizontal* 360 keyboard walk (→ →, Home, End, ← ←): the focused box's margins ≥ 0 at every step, page `scrollY` unchanged | 7 timeline stories identical; scrollLeft 0, 0, 64 / 0 / 64 |
| 22–23 | unit (helper, header/group use it); contrast §5 | 19 avatar stories identical |
| 24 | developer: WebKit available? else row stays (dated) | note in build.md |
| 25 | `theme-contrast.spec.ts`: entry 2 ≥ 3 on surface-2 and sunken, both themes | 4.20 L / 4.60 D minimum |
| 26 · 27 · 29 | story at 360: lg action right edge ≤ 344 · story text | — |
| 28 | *Light Slim* 1280: band is the light gradient | — |
| 30 · 33 | measure: frame rim top − row top ≥ 4 · `::after` border-top 0 and height 0 | — |
| 31–32 | *area-map large-text* at 320/1024/1280 (200 %): media right ≤ grid right, title not overlapped; „organisiert“ hyphenated; area-map at 100 % identical | 1024/100 %: 544 px media unchanged |
| 34 | measure × hit 24 × 24 via `elementFromPoint`; chip stories identical; JSDoc note | — |
| 35 | *Grouped Options (DE)* 360: label ≤ 2 lines (≤ 48 px), `title` = full text | was 3 lines / 66 |
| 36 | unit + axe on radio stories | `*` no `aria-label`; error after options |
| 37 | *Gaps And Forecast* (+DE) L/D: Plan dotted in plot and legend | — |
| 38 · 39 · 47 | unit + stories; accessible name/description via dom-accessibility-api | rail busy: description empty |
| 40 | *With Icons*: 3 `lc-icon`; other tabs stories identical | +24 px per tab |
| 41 | textarea stories: host bottom = field bottom | −6 px |
| 42–43 | *Headings In Columns* 1280: every column starts with a heading; no divider at a column foot; no corner clip | — |
| 44 · 46 | *With Badges* 360: end fade only; *Vertical* 360: list above panel, panel ≥ 280; 1024/1280 identical | panel 328 at 360 |
| 45 | rail stories: no badge wider than 18 px over the icon; argType lists the fields | — |

Assertions that move, with the AC as the stated reason (grep `src/lib` for more before writing "unchanged", pitfall 048): `hero.component.spec.ts:251` (grid string, AC-31), `select.groups.spec.ts:286` (group-label block, AC-35), `theme-contrast.spec.ts` 3.37 block gains the surface-2/sunken pages (AC-25).

Expected compare diffs (everything else in `065/baseline` identical): textarea multi-line stories; tabs *With Icons*, *With Badges* 360, *Vertical* 360 (+ any tabs story overflowing at 360); sidenav rail stories with values > 2 chars; hero *Light Slim*, *Badges in the Body*, DE heroes at 360 only where a hyphen appears; device-frame *Screenshot Row* < 1024, *Laptop Hooks*; list *Headings In Columns* ≥ 1024; select *Grouped Options (DE)* / *Search (DE)* 360; radio *With Error*; table *Action Sizes* (all widths); line-chart *Gaps And Forecast* (+DE) and every series-2 default. Known flakes: memory list (sidenav 3.44 set, tabs AA).

## Change notes

- **2026-11-18, review r1** (proofs in `review.md`; my design was wrong where marked ✗): D1 (palette naming and scroller, §3, §6, §9; the as-built naming was what §6 said ✗) · D7 cap 62 % ✗ (§1, §3, §4) · D2 forced-colours line CanvasText ✗ (§5) · hint ≤ 33 % + wrapping reason (§3) · DE placeholder „Suchen …“ ✗ (§7) · popover panel `text-align: start` (§5) · timeline tone markers on text inks (§4, §5) · measured on the build, not §5's estimates: active ring dark 8.16, `<mark>` dark 10.22.
- **2026-11-18, review r2** (M5): selectable timeline list padding 4/8 px, horizontal 4 px (§3, §9) ✗: the wireframe's „ol pad 4/8“ was missing from the §3 rule, and I didn't see that the horizontal `ol` scrolls and clips the 4 px outset box (bar and ring top/bottom 0 px visible). Accepted r2 additions: heading `transition-property: none`, *No Results* spacing, new query → list at its top (as §4 "first enabled option on each query change").
- **2026-11-18, review r3** (M6): selectable timeline, focused item into view (§6, §9) ✗: I specified the list padding for the box at rest but not that keyboard focus must reveal a partly hidden item in the horizontal scroller.
