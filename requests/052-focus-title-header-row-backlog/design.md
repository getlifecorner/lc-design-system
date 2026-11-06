# Design 052: lc-next-step-card focusTitle(), lc-header contextPlacement, lc-list aria-current, backlog sweep (20 rows)

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-31
- **Measured on:** main 6a36bb3 (3.32.0), Storybook rebuilt 2026-11-06. Prototypes injected in `--measure`; logs and shots in `tmp/story-shots/052/proto-*`. Values marked *computed* could not be injected (CDK config) and come from CDK 22.2.2 `_getOverlayFit` / `_pushOverlayOnScreen` (`_overlay-module-chunk.mjs` l. 1364–1430).

## 1. Approach

Everything extends existing parts: no new component, entry, token, dependency or CSS hook. One branch, one minor version; commits may follow the groups below.

| Group | AC | Fix | Pattern followed |
|---|---|---|---|
| G1 next-step-card | 1–4 | Public `focusTitle()`: `#titleEl` ref on each of the three `@switch` branches (no DOM change), `setAttribute('tabindex','-1')` + `focus()`. Ring on `.lc-next-step-card__title:focus-visible`. | Header logo ring (`outline 2px` primary-500, offset 2, `--border-radius-sm`) |
| G2 header | 5–8 | Input `contextPlacement`; with `'below'` a class `lc-header--context-below` (only when `contextName` is set). ≤ 640 px: `.lc-header__end { display: contents }`, the button gets `order: 2` and a full row (§3). One button in the DOM, CSS only. | Nav row below 1024 px (`order` + full basis, −12 px text alignment) |
| G3 list | 9 | `[attr.aria-current]="item.selected ? 'true' : null"` on the `a`, the `div role=button` and the `div role=listitem`. | Header nav `aria-current` |
| G4 table | 10 | `.lc-table__checkbox { display: block; margin: 2.5px auto; margin: max(2.5px, calc((1lh - 16px) / 2)) auto; }`: the box is centred in a content box as tall as the line box it sat in (21 px at 100 %, 1lh at 200 %), so no row height changes (prototype F; the second line is dropped by browsers without `lh`). | — (prototype F, §3) |
| G5 tag-input | 11, 13 | `.lc-tag-input__tag-text`: `white-space: normal; overflow-wrap: break-word; hyphens: auto; hyphenate-limit-chars: 12 4 3`, `text-overflow` dropped, `max-width: 150px` kept. Story text corrected. | lc-alert DE wrap (`break-word` + `hyphens`) |
| G6 textarea | 12, 14 | Error message `color: var(--color-error-600)` (as lc-input, select, datepicker). Focus (base, outline, filled): `outline: 2px solid var(--color-primary-500); outline-offset: 0; border-color: var(--color-primary-500); box-shadow: none`; FC rule `outline-color: Highlight`. Error focus unchanged. | lc-select / lc-datepicker focus |
| G7 chat | 15 | `formatBytes` formats with `Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1, useGrouping: false })`, `lang = closestLang(host)`, `'en'` when null, empty or invalid (try/catch). `.lc-chat__pending-size { white-space: nowrap; flex-shrink: 0 }`. | `closestLang` (049) |
| G8 NC + log-viewer | 16 | Forced colours: the two `--active:not(:focus-visible) { outline }` rules are replaced by `[aria-pressed='true'] { text-decoration-line: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; text-decoration-color: Highlight }`. | rich-text-editor mode button (044 F-29), the reference |
| G9 app-shell story | 17 | *Wide page* headers „Kontoinhaber/in“ and „Aktualisiert“ (were „Kontoinhaberin oder Kontoinhaber“, „Letzte Aktualisierung“): the table fits 928 px. | — |
| G10 toast-outlet | 18, 25 | Bottom stacks: newest nearest the edge (D-1). JSDoc + docs text for the `top-*` limit. | — |
| G11 overlays | 19–24 | Datepicker: overlay origin box + panel margin (D-5); combobox: `cdkConnectedOverlayPositions` = the CDK default four with `offsetY: 4` (below) / `-4` (above), `margin-top` removed (no push there, so the transform offset is safe); combobox and select panels at least field-wide (D-6); live `lang` while open (§6); *Label (DE)* labels. | 047 push, 049 `closestLang` |
| G12 sidenav | 26 | Badged rail items: no `title`; tooltip from `data-tooltip` (D-7). | Collapsed brand tile (`data-tooltip`, 050) |
| G13 bottom-nav | 27 | Last entry: the badge ends at the entry's edge when it would pass it (D-2). | — |
| G14 tooltip | 28 | Describe the `focusin` target when it is a control inside the host; move `aria-describedby` when focus moves inside the host while shown. | 051 r1 nit 1 |

Decisions (the three open choices first):
- **D-1 (045-n2, toast order): newest at the edge, live regions kept.** The DOM keeps both live regions per stack and the append order inside them (announcements, AT reading order and the 3.27.2 specs stay). Only the visual order changes in `bottom-*` stacks: (a) each region lays out `flex-direction: column` there, so its newest toast is next to the edge side; (b) the region that holds the stack's newest toast gets `lc-toast-outlet__region--latest` and `order: -1`, so it is the one at the edge. The newest toast is therefore always at the edge and, in a scrolling stack (200 % text), visible at rest, because a `column-reverse` scroller starts at that end. Rejected: `display: contents` regions with per-toast `order` (live regions with `display: contents` are unreliable in AT); scroll-into-view on insert (scroll script, and the comment would still be wrong). Cost: when the newest toast closes, the regions may swap; accepted. Top stacks unchanged (not in AC-18).
- **D-2 (050-n6, More badge): a real fix, no clamp.** Prototype `proto-bn5`: on the last entry the badge wrapper spans from the pill centre + 6 px to the entry's end edge (`top: 2px; right: 0` with the entry as containing block) and aligns `direction: rtl; justify-content: safe flex-end` (child `direction: ltr`). A badge that fits stays where it is (pill centre + 6: "3" 338 → 338, "12" 338 → 338, "1" German 304.66 → 304.66); one that would pass the entry ends at its edge ("99+": docked 376.19 → 367, bar edge 375; floating 375.39 → 366, bar edge 374). No look change for any badge that fits, and no text clamp (a "9+" clamp would change the consumer's number). Browsers without `safe` keep today's position through a plain `justify-content: flex-end` before the `safe` line. *Change (review r1):* the first version said "declaration dropped" is enough; with `direction: rtl` a dropped value is `normal` = the entry's end, which would move every badge (build.md deviation 2).
- **D-3 (044-n3, FC pressed mark): underline, the rich-text-editor's mark.** In forced colours fills and box shadows are dropped, so 3.27 used a 2 px Highlight outline, the focus ring's shape, and hid it on focus (`:not(:focus-visible)`), so a focused pressed pill showed no pressed state. An underline is a different shape (1.4.1 / 2.4.7), keeps showing with the ring, needs no layout room and is what RTE already uses. Prototype `proto-fc`: NC "All (7)" underline inside the 26.5 px chip; log pill 15 px tall, the line sits just under it; pressed + focused shows both.
- **D-4 (header):** the `below` row bleeds 12 px into the header padding (`margin-inline: calc(-1 * var(--spacing-3))`), as the nav row does, so the label's text starts on the title's left edge (x 16 at 360) instead of 12 px inside it; the box stays inside the header padding box (4–356 at 360). The end group becomes `display: contents` only ≤ 640 px with `below`: row 1 then holds the same items at the same rects as `inline` (prototype: title 92/36.7 104×21.59, trigger 258/25.5 70×44 before and after); when row 1 is too narrow the end items wrap one by one, right-aligned (`justify-content: flex-end` on the header), instead of as a group (320 px with a theme button: the theme button stays in row 1).
- **D-5 (datepicker position):** CDK 22.2 checks fits against `[0, vw − 2m]` (ignores the start margin) and applies `offsetX/Y` as a transform *after* its push. So `viewportMargin` becomes `0` and the margins are built into geometry: a new empty origin `<span class="lc-datepicker-overlay-origin" aria-hidden="true">` in `.lc-datepicker-input-wrapper` (`position: absolute; inset: 4px -8px; visibility: hidden; pointer-events: none`) is the overlay origin, and the panel gets `margin: 8px` (replacing `margin-top: 4px`), `max-width: calc(100vw - 16px)`, `max-height: calc(100dvh - 16px); overflow-y: auto`. Start/end alignment with the field and the 4 px gap stay exact; every fit and push now keeps the panel 8 px inside the viewport on all sides. AC-19's "margin outside the pane" is met in its intent: the gap no longer depends on the side (4 px below and above). AC-20: the 342 px panel has 344 px of room at 360; the CDK prefers start alignment, so it is pushed from the right and lands at **x 10, right edge 352** (*computed*); "x 8" is read as "left margin ≥ 8". *Change (review r1):* the lengths are the spacing tokens (`--spacing-1`, `--spacing-2`; 4/8 px at 100 %), so at 200 % text the gap is 8 px (as 3.32's `margin-top: var(--spacing-1)`) and the margins 16 px (measured x 16, right 344).
- **D-6 (panel width):** `--_lc-select-field-width` / `--_lc-combobox-field-width` (private, `[style.--…px]` on the panel, read from the origin's `getBoundingClientRect().width` at each open); panels `min-width: max(200px | 80px, var(--…, 0px))` and `max-width: calc(100vw - 16px)` (the stated max); content wider than the field still grows the panel. Combobox drops `cdkConnectedOverlayMatchWidth` (a fixed pane width) and its list gets `flex: 1 1 auto`. Select keeps its absolute panel and its positioning.
- **D-7 (sidenav):** a badged collapsed item is named by its hidden text ("Agent Runs 3"); its `title` became the description. It now has `[title]` = `''` (as when expanded) and `[attr.data-tooltip]="collapsed() ? label : null"`; non-badged items keep `title` (it names them) and also get `data-tooltip`. The tooltip CSS reads `content: attr(data-tooltip); content: attr(data-tooltip) / "";` (the alt text keeps the generated tooltip out of the focused item's name). Applies to all four item sites (l. 169, 218, 253, 298).
- **D-8 (tag chip):** wrap, no line limit, no `title`: a tag is one user term; at 150 px a 45-character German tag is 3 lines. `hyphens` needs the language: the stories set `lang="de"`. *Change (review r1):* a wrapped chip with the pill radius puts its text outside the curve (3-line chip: line-box corners 4.4 / 3.9 px outside), so the radius is half a one-line chip: `border-radius: var(--border-radius-full); border-radius: calc(0.5lh + 3px)` (12.8 px at 100 %, `lh` of the chip; 3 px = padding-block 2 + border 1). One-line chips stay pills (12.8 ≥ 25.59 / 2); wrapped chips become rounded rectangles with the one-line clearance (3.2 / 3.8 px, prototype `r1-chip`).
- **D-9 (focus ring on the title):** `:focus-visible` only, like every kit ring: after a keyboard press the ring shows; after a mouse click the focus moves silently (no 2.4.7 need).

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| method | `focusTitle()` (NextStepCardComponent) | `(): void` | — | "Moves focus to the card's title (3.33), e.g. after an action replaced the card's state, so focus doesn't fall back to the page (WCAG 2.4.3). Gives the title `tabindex="-1"` first: it stays out of the Tab order. Call it after the new state has rendered, e.g. `afterNextRender(() => this.card().focusTitle(), { injector })` with `card = viewChild.required(NextStepCardComponent)`. Does nothing while no title is rendered." |
| input | `contextPlacement` (lc-header) | `HeaderContextPlacement` | `'inline'` | "Where the context button sits up to 640 px. `'inline'`: in the end group, hidden up to 640 px (as before). `'below'`: up to 640 px a row of its own under the title, as wide as the header and at least 44 px high; title, `end` slot and account menu stay in the first row. From 641 px both render the button inline. No second row without `contextName`. `@default 'inline'`" |
| type | `HeaderContextPlacement` | `'inline' \| 'below'` | — | Exported from `@lifecorner/angular-ui-kit/header`. |
| JSDoc | `ListItem.selected` | `boolean?` | — | "Whether the item is the current choice: a tinted row and `aria-current="true"` on the row element (the button with `clickable`, the link with `href`, the row otherwise). Pair it with a visible mark such as a badge; the tint alone is colour." |
| JSDoc | `moreBadge` (lc-bottom-nav) | — | `null` | Replace "keep it to two characters (`'9+'`)" with "values up to three characters (`'99+'`) fit: on the last entry a badge that would pass the entry's edge moves left until it ends there." |
| JSDoc | `locale` (lc-chat) | — | `'de-DE'` | Append: "Attachment sizes follow the host's language (closest `lang`), English without one: `240,0 KB` under `lang="de"`." |
| JSDoc | `ToastOutletComponent` class doc | — | — | Add: "Bottom stacks show the newest toast nearest the edge (3.33); top stacks the oldest at the top. A `top-*` stack lies over the page on purpose (a toast stays visible wherever the page is scrolled), so in the shell it can cover a title right under the header (at 360 px a toast at y 72 over an h1 at y 80): prefer `bottom-*` there." (replaces the shorter sentence) |
| JSDoc | `TooltipDirective` class doc | — | — | Add: "On a host with several controls, the one that has focus is described (3.33); on hover, the first." |

No new outputs, slots, CSS hooks or tokens. Default rendering unchanged: `contextPlacement` adds its class only for `'below'` with a name (no class, no CSS change for `'inline'`); `aria-current` only with `selected: true`; `focusTitle()` changes nothing until called; template refs and an `[attr.data-tooltip]` that is `null` when expanded add no markup.

Compatibility lines (no API break): table checkboxes move 2.25–3 px down to the row middle; long tag chips wrap instead of an ellipsis; the textarea error text is `#9d0e0e` in light (was `#6b0909`; dark unchanged) and its focus is the 2 px ring (the 20 % halo is gone); chat sizes follow the page language; bottom toasts reorder (newest at the edge); the datepicker panel keeps 8 px from the viewport edges and has 4 px above the field; combobox and select panels are at least as wide as the field (a full-width select at 1280 opens 1248 px wide); badged rail items no longer carry `title`; FC pressed pills show an underline instead of an outline. The datepicker gets one empty `aria-hidden` span in its wrapper.

## 3. Anatomy and layout

### 360 px — `contextPlacement="below"`, the requester's header (sm, transparent, no logo, avatar)

```
x 0                                                                 360
┌────────────────────────────────────────────────────────────────────┐ y 0
│16 Finance Intelligence  (18/700, lh 1.2, x 16)      [avatar 48] 16│ row 1: 56 (sm row height)
│                                                   x 296–344       │
│ ┌──────────────────────────────────────────────────────────────┐   │ y 56  button x 4–356 (352)
│ │12 MONATSSTAND (12/500 upper, lh 1.2, text x 16)               │   │      h 49.58 = 8+14.4+1+18.19+8
│ │   September 2026 · Fassung 1 (14/600, lh 1.3, ellipsis)       │   │
│ └──────────────────────────────────────────────────────────────┘   │ y 105.58
│                         8 (--spacing-2)                            │
└────────────────────────────────────────────────────────────────────┘ y 113.58 (md: 64 → 121.58)
```

Measured in the prototype (`proto-header-bleed`, with-tenant-info, md, logo, story frame 16 px): row 1 unchanged; button 320 × 49.58 at x 20 (= 4–356 in a 360 px app), label text x 32 = the logo's left edge (content edge), name 192.14 wide (fits), no page or header overflow; without `contextLabel` 44 high; header 64 → 121.58; at 641 the class has no effect (inline 216.14 × 49.58); at 320 the theme button stays in row 1, avatar row 2 (right), button row 3; at 200 % (content 232): title 2 lines, theme + avatar row, button 232 × 99.19, name ellipsis, no horizontal overflow. Rules (≤ 640 px, `.lc-header--context-below`): header `justify-content: flex-end`; `.lc-header__end { display: contents }`; button `display: flex; order: 2; flex: 1 0 calc(100% + 2 * var(--spacing-3)); margin: 0 calc(-1 * var(--spacing-3)) var(--spacing-2); max-width: none; min-height: var(--size-min-touch-height, 2.75rem); align-items: flex-start; justify-content: center; text-align: start`. Without `contextLabel` the button is 34.2 → 44 by `min-height`.

### From 641 px (1024, 1280)

```
[title …………………………………………… spacer]  [ MONATSSTAND  ]  [avatar]
                                     [ September 2026 · Fassung 1 ]   ← inline, right-aligned, max 220, as 3.32
```

### Other geometry (prototype values unless marked)

| Element | Before (3.32) | After |
|---|---|---|
| Table checkbox centre − row middle (header / rows), md, sm, lg | −3 / −2.25 / −2.5 px (200 %: +0.5 … +4.25) | −0.5 / +0.25 / 0 at 100 % and 200 %; rows unchanged: md 46/46.5, sm 38/38.5, lg 57/57.5; 200 %: md 91, sm 69, lg 113 |
| Tag chip "Kostenstellenverantwortung" (DE, 360) | 186 × 25.6, text cut 31 px | 186 × 45.2, 2 lines „Kostenstellenverant-/wortung“, × centred 14.6 from top, 24 px area inside, radius 12.8 (r1); field 98.8 → 118.4 (360), 40 → 59.2 (1280) |
| Select panel under a 328 / 400 / 1248 px field | 200 | 328 / 400 / 1248 |
| Combobox list, *Panel Language* / *Starts with a choice* | 150.31 / 85.92 | 328 (360), 400 (1280) |
| Datepicker *Default* / *Label (DE)* 360, field 16–344 (*computed*) | x 2, right 344 (`baseline-open`: 2,60,342×448 / 2,170) | x 10, right 352; gap 4 below and (flipped) above |
| Datepicker *Day Panel* 360, field 24–336 (*computed*) | x 8 | x 10 (pushed from the right, same rule) |
| Datepicker 1024 / 1280 (*computed*) | x 16 (Day Panel 24), y 60, gap 4 | same boxes (`baseline-open` must match) |
| Datepicker 200 %, 360 (*computed*) | 360 wide at x 8 (right 368) | ≤ 344 wide at x 8, right 352; scrolls inside when taller than 100dvh − 16 |
| More badge "99+", 5 entries, docked / floating | right 376.19 / 375.39 (bar 375 / 374) | 367 / 366 |
| Chat chip with "240,0 KB" (max 256) | 46 high (size wrapped) | 30 high; the name ellipsis starts ≤ 20 px earlier |
| *Wide page* table at 1280–1920 | 1119 in 928 | ≤ 928 (headers sum ≈ 897, *computed* from 10 px/char) |
| Toast bottom stack: Warning, Error, Success shown in this order | edge → Warning, Error, Success | edge → Success, Error, Warning |

## 4. States

| Component | States |
|---|---|
| next-step-card title | rest: no tabindex, no ring; focused by `focusTitle()` after keyboard: 2 px ring, offset 2, radius 10, no layout shift; mouse: focus without ring; FC: Highlight; every tone, soft/default, with blockers, meta, `announce`. |
| header `below` | default; hover (bg `--lc-header-hover-bg`, name ink fg) and focus ring as inline; long name: ellipsis + `title`; no `contextLabel`: 44 high; no `contextName`: no row; `theme` light/dark; transparent; has-nav (nav row, then context row); 200 %. |
| list | `selected` true on button/link/plain row: tint + `aria-current`; disabled + selected keeps both. |
| textarea | focus (outline/filled): 2 px ring; error + focus: error ring (unchanged); hover; disabled; read-only. |
| tag chip | 1–3 lines; × hover/focus as before; disabled (no ×). |
| NC / log pills (FC) | pressed: underline; focused: ring; both: ring + underline. |
| toast stack | 1 toast; mixed levels; 200 % scrolling; newest closed (regions may swap). |
| overlays | open below / above / pushed; 200 %; `lang` changed while open; field narrower than the floor (select 116.8 → 200). |
| bottom-nav badge | 1–3 characters on any entry; current pill (051 backdrop kept). |
| tooltip | hover (first control), focus on control 1 then 2 (description moves), single control and `lc-button` as 3.32. |

## 5. Theming

| Element | Light | Dark | Contrast (computed) |
|---|---|---|---|
| Title ring `--color-primary-500` on default card | #208497 on #fff | #84c7d4 on #101c26 | 4.37 / 9.13 |
| … on soft fills (neutral, primary, success, warning, info) | — | — | L 4.01, 3.85, 3.90, 4.00, 3.90; D 8.76, 7.27, 8.54, 8.31\*, 8.45\* (\*rgba fill composited over the canvas by hand; re-measure in review) |
| Header context ring (`--_lc-header-ring`, primary-500) | on #fff | on surface / canvas | 4.37 / 9.13 (surface), 9.95 (transparent on canvas) |
| Textarea ring vs page | #208497 | #84c7d4 | 4.37 / 9.95 |
| Focused border vs fill (outline / filled) | — | — | 4.37 / 3.97 L; 9.13 / 9.56 D |
| Textarea error text `--color-error-600` on page | #9d0e0e (was #6b0909) | #f7a1a1 (unchanged) | 8.39 / 9.48 |

Unchanged colours elsewhere (list tint, chip ink 7.18 / 6.34, badges, toasts, pills). No new tokens.

## 6. Accessibility

- **focusTitle:** `tabindex="-1"` only after the call (not in Tab order); the title is the region's name, so focus reads it; with `announce`, the live text and the focus read the same title (the call after render avoids reading the old text).
- **header below:** one `<button>`, same name rule (`contextAriaLabel`, label, name), same `contextClick`; DOM and focus order unchanged (end slot → theme → context → avatar), so focus goes from the row-2 button back to the avatar in row 1, as the nav row does; 44 px min; ring and FC as inline.
- **list:** `aria-current="true"` (global ARIA attribute, valid on button, link, listitem; axe clean).
- **tooltip:** the focused control holds `aria-describedby`; moving focus inside the host moves it (old id removed first).
- **sidenav:** badged rail item: name "Agent Runs 3", no description; non-badged: name from `title`, no description; tooltip still on hover and focus.
- **overlays `lang` while open:** a shared internal helper (`internal/a11y`) re-reads `closestLang(host)` through one `MutationObserver` (`attributeFilter: ['lang']`, subtree on `documentElement`) while the panel is open, disconnected on close/destroy; datepicker keeps its `locale` fallback. Select, DRP and tooltip keep "read at open" (not in AC-24).
- **targets:** tag × 24 px area inside the chip (2.5.8 by size, 043 D-3); header row 44+; table cell area unchanged.
- **FC:** title and textarea rings Highlight (explicit rule); pills underline; datepicker origin span is `visibility: hidden`.
- **Reduced motion:** nothing animates newly (the toast reorder is a reflow, no transition).

## 7. Texts

No new built-in strings. Story texts (DE, checked at 360):

| Where | EN / today | DE |
|---|---|---|
| Header story context | — | `contextLabel` „Monatsstand“, `contextName` „September 2026 · Fassung 1“, `contextAriaLabel` „Monatsstand wählen“, title „Finance Intelligence“, `userMenuAriaLabel` „Menü für Johanna Müller“, `logoutLabel` „Abmelden“ |
| Next-step story | — | „Monatsstand einfrieren“ / „Einfrieren“ → „Monatsstand eingefroren“, message „September 2026 · Fassung 1 ist eingefroren.“, primary „Freigeben“ |
| List story | — | title of the sheet „Monatsstand wählen“; rows „September 2026 · Fassung 1“ (selected, badge „Gewählt“), „August 2026 · Fassung 2“, „Juli 2026 · Fassung 1“ |
| Datepicker *Label (DE)* | Today, Choose date, … | „Gilt ab“ (month): `monthDialogAriaLabel` „Monat wählen“, `previousYearAriaLabel` „Vorheriges Jahr“, `nextYearAriaLabel` „Nächstes Jahr“, `currentMonthLabel` „Dieser Monat“, `selectedAriaLabel` „ausgewählt“; both sm fields: `todayLabel` „Heute“, `dialogAriaLabel` „Datum wählen“, `previousMonthAriaLabel` „Vorheriger Monat“, `nextMonthAriaLabel` „Nächster Monat“, `selectedAriaLabel` „ausgewählt“ |
| Chat *Pending Attachments (DE)* | 1.2 MB, 5.0 KB, 240.0 KB | wrapper `lang="de"`: „1,2 MB“, „5,0 KB“, „240,0 KB“; *English* story unchanged |
| Tag-input *Touch Targets (DE)* description | "4 px from its end", "12 px after the last ×" | "5 px …", "13 px …" (043 r2 measure), plus: the first chip wraps to 2 lines (45.2 px), field 118.4 px at 360; host `lang="de"` |
| *Wide page* headers | — | „Kontoinhaber/in“, „Aktualisiert“ |

## 8. Stories

| Story (export → ID) | Args / setup | Shows |
|---|---|---|
| `FocusAfterAction` → `feedback-next-step-card--focus-after-action` | DE card, `titleTag="h2"`, `announce`; primary „Einfrieren“ switches the state and calls `focusTitle()` after render; description has the `viewChild` + `afterNextRender` snippet | AC-1–4; ring after `.click()` |
| `ContextBelow` → `navigation-header--context-below` | `layout: 'fullscreen'` (r1), two headers, `sticky=false`: (1) requester config (§7, `contextPlacement="below"`, sm, transparent, `showLogo=false`, avatar `person` fallback); (2) default variant md with a 60-char `contextName` | AC-5–8; argType `contextPlacement` (inline-radio, description, default `'inline'`) on the header meta |
| `CurrentChoice` → `data-display-list--current-choice` | clickable list with one `selected` row + badge „Gewählt“; second list as link rows (`href`) with one selected | AC-9 |
| `LongTags` → `form-tag-input--long-tags` | host `lang="de"`, seed tags „Leistungsverrechnungsschlüssel Nebenkosten 2026“, „Kostenstellenverantwortung“, „Q3“ | AC-11 |
| `TouchTargets` (changed) | `lang="de"`, description §7 | AC-13 |
| `MoreBadgeThreeCharacters` → `navigation-bottom-nav--more-badge-three-characters` | *More Badge* items, `moreBadge: { value: '99+' }`, one docked and one floating bar; `layout: 'fullscreen'` (r1: as *Context Below*, so the 360 shot is a 360 px app) | AC-27 |
| `BottomStackOrder` → `feedback-toast-outlet--bottom-stack-order` | `bottom-center`, a wrapper component shows Warning, Error, Success (`duration: 0`) on init | AC-18 |
| `Offsets` (changed description) | adds the `top-*` limit text (JSDoc wording) | AC-25 |
| `OpensAbove` → `form-datepicker--opens-above`, `form-combobox--opens-above` | field at the bottom of a `min-height: 100vh` flex column (`justify-content: flex-end`) | AC-19 |
| `LabelDe` (changed) | §7 labels | AC-22 |
| `HostWithTwoControls` → `feedback-tooltip--host-with-two-controls` | `<div lcTooltip="Formatierung" role="group" aria-label="Textformat">` with buttons „Fett“, „Kursiv“ | AC-28 |
| `PendingAttachments` (changed) | wrapper `lang="de"` | AC-15 |
| `WidePage` (changed data) | headers §7 | AC-17 |

## 9. Verification

Baseline (main 6a36bb3, 800 ms wait, one run each; logs `baseline-{a,b,c}.log`): `tmp/story-shots/052/baseline` — A: 115 stories (next-step-card, list, table, tag-input + chip, textarea, NC, 7 stable log-viewer, toast-outlet, tooltip; 460 shots) and B: 71 (datepicker, combobox, select, bottom-nav, 9 sidenav, 6 app-shell; 284) at 360/1280 L/D; C: header 24 at 360/641/1024/1280 L/D (192). `baseline-open` (+ `.log`): datepicker Default / Day Panel / Label (DE), combobox Panel Language / Starts with a choice opened at 360/1024/1280 light with the 049 `open-measure.js` (navigates to July 2026). **Expected to differ:** table `with-selection`, `keyboard-focus`, `touch-targets` (+ any other selectable story the compare shows); tag-input `touch-targets` (+ stories with chips over 150 px); textarea stories with an error at load, light only; app-shell `wide-page`, `wide-page-with-right-column`; and any shot with an open bottom toast stack (`toasts-in-the-shell*` if they open several). Everything else identical (flaky per memory: sidenav collapsed-rail-badges 360, sidebar-first-collapsed 1024).

| AC | How | Expected |
|---|---|---|
| 1, 2 | unit: three `titleTag`s; no `tabindex` before, `-1` after, `activeElement` = title; snapshot/specs unchanged | as stated |
| 3 | unit per tone (+ blockers, meta, announce); story 360/1280 L/D, `--measure` ring after `.click()` | outline 2 px solid, contrast §5, title rect unchanged |
| 4 | story + manifest: the extractor reads no methods, so the component and story descriptions carry `focusTitle()` (grep the generated manifest) | present |
| 5, 6 | unit (class only with `below` + name; one button; `contextClick`); story 360 measure | button x 4–356, h ≥ 44 (49.58), label above name, row 1 rects = `inline` |
| 7 | baseline C compare (default unchanged at 360/641/1024/1280); `below` at 641/1024/1280 = inline rects | identical |
| 8 | story L/D, `--forced-colors`, 200 % (root font) measure; unit: one `.lc-header__context-info` | no overflow, ring visible |
| 9 | unit for 3 row kinds; `--axe` on the story | attribute only on selected; 0 violations |
| 10 | measure 360/1280 (md, sm, lg via class) | \|offset\| ≤ 0.5, rows unchanged |
| 11 | unit: no `title`, no ellipsis rule; story 360 measure | text overflow 0, × area 24 inside chip |
| 12 | computed colour + contrast | `rgb(157, 14, 14)`, 8.39 L / 9.48 D |
| 13 | description vs measure (043 r2 numbers) | agree |
| 14 | measure focus in default/filled L/D, FC shot | ring 2 px, no shift, §5 values |
| 15 | unit en/de (`240.0 KB` / `240,0 KB`, no grouping); story measure | chip 30 high |
| 16 | `--forced-colors` shots of NC default and log touch-targets, pressed / focused / both | underline vs ring |
| 17 | measure 1280/1440/1920 | table ≤ region, „Kontostand“ visible |
| 18 | `BottomStackOrder` at 360, root 200 %, rects; unit: DOM order and regions unchanged | newest toast and its close inside the viewport, at the edge |
| 19 | `OpensAbove` + Default, both components, measure | gap 4 above and below |
| 20, 21 | Default open 360 (100 % and 200 %) | x 10 / right 352; 200 %: x ≥ 8, right ≤ 352 |
| 22 | open panel DOM text in *Label (DE)* (both sm fields, month field) | no English |
| 23 | open *Panel Language*, *Starts with a choice*, select *Default* / *Panel Language* at 360/1280 | panel ≥ field (328 / 400) |
| 24 | unit: change wrapper `lang` with panel open | panel `lang` updates, no reopen |
| 25 | JSDoc + story text | present |
| 26 | unit (dom-accessibility-api name/description), collapsed and expanded | "Agent Runs 3", description "" |
| 27 | new story 360 measure docked/floating; JSDoc | right ≤ entry edge |
| 28 | unit: host with 2 buttons, Tab to the 2nd | `aria-describedby` on the 2nd only |
| 29–31 | developer's gates; review shots per above | — |

Risks to watch (memory): the datepicker origin box and the toast reorder could not be injected (CDK config, outlet template): measure them first on the build (047 r1); grep **all of `src/lib`** for pinned values before "spec unchanged" (048): toast `rule()` regex, header `large-text` spec, datepicker structure specs (new span), textarea halo assertions; FC rings need explicit `Highlight` (037 r1); `safe` keyword support (Chrome 115+, Safari 17.6+), else today's position; combobox without `matchWidth` must still flip/position (047 r1: in-flow pane).
