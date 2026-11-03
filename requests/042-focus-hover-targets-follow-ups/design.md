# Design 042: Focus indicators, focus over hover, dependency-viewer at 360 px, file-upload remove target

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-15
- **Semver:** **minor (3.27.0)**: F-20 needs one new optional input (`regionLabel`, D-7); spec exception applies. Everything else is a fix.
- **Change r1 (review round 1, 2026-11-03):** kanban card ring **offset −2 (inset)**, not 2: on an over-limit column (`--color-error-50` = `#f7a1a1` light) the outside ring measured 2.19:1; inset it sits on the card, 4.36 / 9.12 in every column (§3, §5). D-7 wheel and stage element as built (build.md deviations 1–2, §3). New follow-ups F-26, F-27 (§9).

## 1. Approach

Fix, no new component. Every ring reuses the kit pattern of 039 (`mix.focus-ring`, 2 px `--color-primary-500`, forced colours `outline-color: Highlight`).

| ID | Decision | Why |
|---|---|---|
| D-1 | **Narrow the reset** (`_reset.scss:174`) to `button:focus:not(:focus-visible) { outline: none; }` | Mouse focus stays ring-free as today; a keyboard-focused button that has no rule of its own (consumer buttons, and the 6 story-owned raw buttons the sweep found) now gets the browser ring instead of none. Every kit button keeps its own ring because all kit `:focus-visible` rules declare `outline` (after D-2/D-3), so kit focus looks are unchanged (proved by the sweep re-run, §9). Keeping the reset would leave every future or consumer button without an indicator. |
| D-2 | **Pattern R** on the 21 classes of §6.1 rows B–D (plus kanban, D-3; remove, D-8; dep canvas, D-7): `@include mix.focus-ring($offset: 2px \| -2px)` + `@media (forced-colors: active) { …:focus-visible { outline-color: Highlight } }`. Inset (−2 px) where a clipping ancestor leaves < 4 px (§3) | Same look as every other kit ring; ≥ 3:1 measured (§5). |
| D-3 | **Pattern F** (forced colours only) for indicators that are box-shadow, bar or SVG paint: toggle-group, list link rows, gantt bar, split-pane separator: `@media (forced-colors: active) { …:focus-visible { outline: 2px solid Highlight; outline-offset: -2px } }` (gantt `2px`); scatter dot `stroke: Highlight`. Kanban card gets Pattern R instead (its 20 % halo is 1.28:1; ring **inset −2** (r1), border change kept) | Normal-mode look already ≥ 3:1 and stays hash-identical; forced colours drop box-shadow/backgrounds, so today these show nothing there. |
| D-4 | `lc-header theme="light"` on a dark page: header-owned rings (nav link, logo, context, profile trigger) read `var(--_lc-header-ring, var(--color-primary-500))`; `.lc-header--light { --_lc-header-ring: #208497 }` (literal, like the block's other values) | Measured 1.89:1 → 4.36:1. Same fix as the sidenav light rail (019). |
| D-5 | Three stories paint raw light panels that stay light in dark (ring 1.72–1.89): use tokens (§8) | Story artefacts, not kit; cheap. |
| D-6 | **F-19:** each field hover rule excludes the focused state: `:not(:focus)` on fields that take focus, `:not(:focus-within)` on wrappers, `:not(.lc-tag-input__container--focused)` (§4) | Focus then renders exactly its own rule; unfocused hover keeps its selector and look (AC-7). |
| D-7 | **F-20:** in `fitMode="fit-width"`, when `minNodeSize` stops the shrink, pin the graph to the start and let the **canvas scroll sideways** (native, touch-friendly); while it scrolls the canvas is a named, focusable region (`regionLabel`). Phone recipe: `fitMode="fit-width"` + `minNodeSize={200}` (+ `direction="vertical"` for process views) | No existing input combination is readable *and* unclipped at 360 (§3 table); pan is mouse-only (`mousedown`), so on a phone the clipped part was unreachable. `autoFit`/`contain` untouched (AC-9). |
| D-8 | **F-21:** `::before` hit area 44 × 44 centred on the 20 px remove button, ring Pattern R, and the per-file name `"<removeFileAriaLabel> <file name>"` | Row height stays 42; spec premise corrected: the button had **no** ring, no forced-colours rule and one shared name ("Remove file") — added here (tag-input pattern). |
| D-9 | Rich-text editor editing surface: field ring on the frame via `:has()` (§3) | The surface is 60 px tall inside a 300 px scroller; a frame ring reads as "this field", like lc-input. |

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (`lc-dependency-viewer`) | `regionLabel` | `string` | `'Dependency graph'` | Accessible name of the canvas while it scrolls sideways (`fitMode="fit-width"` with a `minNodeSize` the frame can't hold). It is then a focusable `role="region"`, scrolled with the arrow keys. Set a short, localised name that is unique on the page. Not used otherwise. @default 'Dependency graph' |
| global CSS | `button:focus` reset | — | — | narrowed (D-1) |

No other input, output, slot, hook or type changes. **Default rendering unchanged:** every change is under `:focus-visible`, `:hover` + focus, forced colours, the clamped `fit-width` state (no existing story uses it) or a pseudo-element without paint (D-8); at-rest baseline in §9. JSDoc text updates (no API change): `fitMode` ("the graph itself never scrolls internally" → "past `minNodeSize` a graph wider than the frame scrolls sideways inside it"), `minNodeSize` ("fit-width turns into page scroll" → "into sideways scrolling of the frame; `200` keeps 12 px labels ≥ 10 px whatever the node width (160–240 px)"); stories *Layered — Fit Width* / *Minimum Node Size* descriptions the same.

## 3. Anatomy and layout

**Ring geometry (360 = 1280 unless noted; room = distance to the nearest clipping ancestor, an outside ring needs 4):**

| Element | Box | Room | Ring |
|---|---|---|---|
| RTE `__toolbar-btn` / `__mode-btn` | 32×32 / 41×26 | 8 / 11 | offset 2 |
| RTE frame `.lc-rich-text-editor:has(.lc-rich-text-editor__rich:focus-visible, .lc-rich-text-editor__textarea:focus-visible)` | frame | — | `border-color` + `outline: 2px solid` `--color-primary-500`, offset 0 (lc-input pattern); the surfaces keep `outline: none` |
| doc-viewer `__btn` / `__download-btn` | 32×32 / 146×39 | 8 / 43 | offset 2 |
| filter-bar `__toggle-btn` | 41×37 | **0** (group `overflow: hidden`) | offset −2 |
| select `__clear` · gallery `__filter-btn` · callout `__dismiss` | 20 / 42×35 / 24 | ≥ 999 | offset 2; callout dismiss also `opacity: 1` on focus (rest 0.6 dims the ring) |
| log `__level-pill` | 62×15 | 12.5 | offset 2 (the pressed pill's forced-colours rule already excludes `:focus-visible`) |
| NC `__action-btn` / `__filter` | 91×26 / 54×27 | 12 / 8 | offset 2, radius as the element |
| tabs `__panel` (`tabindex 0`) | 328×204 | 999 | offset −2 (panels often sit flush in cards) |
| chat `__attachment` (a) / `__attach-btn` / `__send-btn` / `__pending-remove` | 192×128, 161×26 / 32 / 32 / — | 54 / 21 / 21 | offset 2 |
| dl `__link` · color-picker `__native` · table `__checkbox` | 105×17 / 40 / 16 | 999 / 999 / 8 | offset 2 |
| number-input `__button` | 40×40 | **0** | offset −2 |
| tag-input `__tag-remove` | 16×16 | 999 | offset 2 + `opacity: 1` on focus (rest 0.7) |
| file-upload `__file-remove` | 20×20 | 11 | offset 2 (circle, radius 50 %) |
| kanban `__card` | 264×73 | 16 | **offset −2** (r1: the column tint varies, over-limit `#f7a1a1` gave 2.19 outside); the 20 % halo goes (border change stays) |
| dep `__canvas--scroll` | 326 × graph | 0 (host `overflow: hidden`) | offset −2, radius 0 |

**F-21 remove target (row unchanged, 42 high, 8 gap):**
```
360: row x 16–344 (328), y 222–264      button 20×20 at x 311, y 233
 ┌──────────────────────────────────────────────┐
 │ [doc] bericht-2026.csv ……… 12,4 KB  ┌──44──┐ │  ::before inset −12 px → 44×44,
 │                                      │ (×)  │ │  x 299–343 (right edge = row inner edge),
 └──────────────────────────────────────└──────┘─┘  y 221–265 (1 px into the 8 px gap)
   next row's hit area starts 6 px lower → no overlap; covers 4 px of the size text (not a target)
```
`.file-upload__file-remove { position: relative; } ::before { content: ''; position: absolute; inset: calc((1.25rem - var(--size-min-touch-height, 2.75rem)) / 2); }` (= −12 px; the token is 2.75rem in both themes). Hit test, not `getBoundingClientRect`, proves it (a pseudo-element has no rect).

**F-20 at 360 (`PhoneWidthDe`: layered, vertical, fit-width, minNodeSize 200):**
```
┌ host 328 (1 px border) ───────────────────────┐
│ [+] 100 % [−] [⟲]  ↓          toolbar 45      │
├───────────────────────────────────────────────┤ canvas 326 wide, ~644 high, scrollWidth ≈ 680 (2.1 screens)
│ 20┌Antrag erfassen┐ ┌Belege hochl.┐ ┌Kostenst…  → scrolls sideways (touch, Shift+wheel, arrows when focused)
│   └──200×45──────┘ └─────────────┘ └──           nodes 240 → 200 px (scale .833), label 10.0 px, stroke 1.25
│        ↓ … 5 layers, page scrolls vertically …
└───────────────────────────────────────────────┘ host height auto ≈ 720 (EN 694)
```
From 1024: the same story fits at scale 1 (graph 768 × 724), centred as today, no scroll, no region attributes. **Existing inputs at 360 (measured, scale / label px / stroke px / clipped nodes):** *Node statuses* autoFit or fit-width .47 / 5.69 / .71 / 0; layered fit-width vertical .53 / 6.35 / .79 / 0; fit-width + minNodeSize 134 .84 / 10.05 / 1.26 / 7 of 10 (horizontal) and 4 of 10 (vertical), centred with both ends cut.

**Scroll state (developer):** class `dep-viewer__canvas--scroll` when `fit-width` and natural scale < floor: `overflow-x: auto; overflow-y: hidden`; panX = −box.x·scale (first node at 24·scale, today's top inset); scroll width = ⌈box.width · current scale⌉ (the svg's own unscaled box must not add overflow — measured 1200 vs 978 in the prototype); scrollLeft 0 after each fit; horizontal mouse drag sets `scrollLeft` instead of panX; zoom buttons and the vertical wheel zoom as before, Shift + wheel and a mostly sideways wheel scroll natively (r1); the sizer follows the zoom. The svg sits in a box-less `div.dep-viewer__stage` (`display: contents`), which only in the scroll state becomes a block of the scroll width that clips the svg's unscaled box (r1, build deviation 1). Server render: no canvas size → no fit → host keeps `height` and no region attributes (AC-10).

## 4. States

| Element | Rest / hover | Focus-visible (Tab) | Mouse click | Forced colours |
|---|---|---|---|---|
| D-2 targets | unchanged | ring §3 | none (`:focus-visible`; text surfaces show it on click, as all fields) | Highlight |
| D-3 targets | unchanged | unchanged | unchanged | Highlight outline / stroke |
| Remove (F-21) | unchanged (hover tint) | ring | none | Highlight; hit area works in every mode |
| Dep canvas | not scrolling: today's DOM | scrolling: inset ring | drag scrolls, no ring | Highlight |

**F-19 (D-6), border of the field box, measured with hover forced (stylesheet `:hover` → class clone), page backdrop:**

| Field (hover selector today) | Fix | Focus | Focus + hover before → after (L / D) |
|---|---|---|---|
| textarea `--outline` / `--filled` `:hover:not(:disabled):not(:read-only)` | `:not(:focus)` | 4.36 / 9.95 | **1.89** / 4.31 (`--color-primary-400`) → 4.36 / 9.95; error 1.89 / 4.31 → 8.39 / 9.47 |
| datepicker base / `--filled` `:hover:not(:disabled):not([readonly])` | `:not(:focus)` | 4.36 / 9.95 | **1.89** / 4.31 → 4.36 / 9.95; error → 8.39 / 9.47 |
| input `.input-container:hover:not(.input-disabled):not(.input-readonly)` | `:not(:focus-within)` | 4.36 / 9.95 | 7.55 / 12.16 (`--color-text-secondary`, not the focus colour) → 4.36 / 9.95; error → 8.39 / 9.47 |
| select base / `--filled` `:hover:not(.lc-select--disabled)` | `:not(:focus)` | 4.36 / 9.95 | 7.55 / 12.16 (filled: `--color-border` 1.23) → 4.36 / 9.95 |
| search-input `:hover:not(.search-input--disabled)` | `:not(:focus-within)` | 4.36 / 9.95 | 7.55 / 12.16 → 4.36 / 9.95 |
| tag-input `__container:hover` | `:not(.lc-tag-input__container--focused)` | 4.36 / 9.95 | 7.55 / 12.16 → 4.36 / 9.95 |
| date-range-picker `__field:hover:not(&--disabled)` | `:not(:focus-within)` | 4.36 / 9.95 | 7.55 / 12.16 → 4.36 / 9.95 |
| combobox, number-input, password, color hex, digits, copy-field | none | — | already SAME |

Unfocused hover, rest, `--filled`, `--error`, disabled and readonly keep their selectors' look (AC-7). Overflow: no box changes size; DE dep labels wrap to 2 lines (node f) with no ellipsis (prototype).

## 5. Theming (computed, WCAG formula, primary-500 `#208497` L / `#84c7d4` D)

| Ring / indicator | Light | Dark |
|---|---|---|
| Pattern R on page / surface / surface-2 | 4.17 / 4.36 / 4.17 | 9.95 / 9.12 / 7.57 |
| filter-bar toggle inset (group `surface-hover` / active surface-2) | 3.96 / 4.17 | 9.04 / 7.57 |
| callout dismiss on info / success / warning / error tint | 3.47 / 3.80 / 3.86 / **3.23** | 8.80 / 7.85 / 7.68 / 9.54 |
| tag-input remove on its chip · chat image attachment on bubble | 3.43 · 3.70 | 6.34 · 6.13 |
| kanban card inset ring on the card (any column) · outside ring on over-limit column (rejected, r1) | 4.36 · 2.19 | 9.12 · 9.46 |
| D-3 kept indicators: toggle inset (inactive / active white on `#1a6a79`), list inset, gantt outer, split bar, scatter stroke (text-primary) | 4.17 / 6.21, 4.36, 4.36, 4.36, 17.74 | 7.57 / 6.21, 9.12, 9.95, 9.95, 17.29 |
| Header `theme="light"` on a dark page | 4.36 (unchanged) | 1.89 → **4.36** |
| F-19 focus border (§4) | 4.36 (error 8.39) | 9.95 (error 9.47) |
| Existing kit rings (sweep, 1280) | min 3.01 (petrol rail, 019), alerts 3.36 | min 4.36, except D-4/D-5 |

No new tokens. Gradient backdrops (hero `inverse` rings) read 1.00 in the sweep only because gradients compute as `none`; their values are 017's.

## 6. Accessibility

### 6.1 Sweep (AC-1): every focusable element in 997 stories, focused by script, styles diffed (1280 L/D, 360 L)

| Row | Status today | Elements | Fix |
|---|---|---|---|
| A | own `:focus-visible` rule, ≥ 3:1 | accordion, alert, bottom-nav, breadcrumbs, button / button-link, calendar, card (+ link), checkbox / radio (box; input hidden), chip, choice-prompt, code-block, color swatches, datepicker + calendar, date-range-picker, dependency toolbar, dl action, drawer close, file-upload zone, footer, gallery item + lightbox, header, log tool / body / lines / jump, markdown links, menu items, modal close, NC item title / action / dismiss, pagination, password toggle, pipeline, provider-button, rating, search clear, select + options, sidenav, slider (thumb), stage-list, stepper, switch, table th / rows / chevron / pager, tab, textarea & all fields (border + outline/halo), toast, tree-view, verification code | none |
| B | **no indicator** | RTE toolbar-btn, mode-btn, rich surface (contenteditable), textarea; doc-viewer btn, download-btn; filter-bar toggle-btn; select clear; gallery filter-btn; log level-pill; callout dismiss; NC action-btn, filter; tabs panel; tag-input tag-remove; file-upload file-remove; chat send-btn, pending-remove | D-2 / D-8 / D-9 |
| C | browser ring only (`auto`, 2.29–3.14 D) | dl link; chat attachment (image, file); color-picker native; table checkbox | D-2 |
| D | only the wrapper rings (which control is unclear) | chat attach-btn; number-input steppers | D-2 |
| E | box-shadow / bar / SVG only (nothing in forced colours) | toggle-group btn, list link row, gantt bar, kanban card, split-pane separator, scatter dot | D-3 |
| F | ring < 3:1 | header `theme="light"` in dark (1.89); story panels: button *Destructive Action* 1.72, tooltip *Toolbar* 1.79, toolbar *Inside Card* 1.89 | D-4 / D-5 |
| G | story-owned raw controls (not kit) | menu / popover triggers, page-layout, stack, markdown interactive, icon gallery buttons; story inputs | D-1 gives raw buttons the browser ring |
| — | not focusable by design / known | tree chevron, combobox clear (`tabindex="-1"`) · provider-button *Appearances* brand light panel in dark (1.89), kept | — |

- **Keyboard:** no tab order changes except the dep canvas, which becomes a tab stop after the toolbar only while it scrolls (arrow keys scroll it).
- **Names:** remove button "Remove file bericht.csv" / "Datei entfernen bericht.csv" (Compatibility: tests that match the exact old name). Dep region "<regionLabel>".
- **Targets:** remove hit area 44 × 44 (F-21). Others stay (follow-up F-22, §9).
- **Forced colours:** every D-2 rule Highlight; `:has()` frame ring (D-9) needs its own Highlight rule (ancestor rings compute to CanvasText); scatter `stroke: Highlight` (SVG paint isn't forced).
- **Reduced motion:** no transition added.

## 7. Texts

| Key / input | EN default | DE |
|---|---|---|
| `regionLabel` (dep) | Dependency graph | Abhängigkeitsgraph (story: Freigabeprozess) |
| remove name (`removeFileAriaLabel` + name) | Remove file bericht-2026.csv | Datei entfernen bericht-2026.csv |
| DE dep story toolbar / panel | — | Vergrößern · Verkleinern · Zurücksetzen · Tiefe: · Untergeordnet: · Hängt ab von: · Abhängigkeiten: |

DE graph (labels): Antrag erfassen · Belege hochladen · Kostenstelle zuordnen · Unterlagen prüfen · Budgetprüfung · Freigabe durch Kostenstellenverantwortliche · Buchung vorbereiten · Zahlung freigeben · Export an die Finanzbuchhaltung · Archivieren (EN: Capture request · Upload receipts · Assign cost centre · Check documents · Budget check · Approval by the cost centre owner · Prepare booking · Release payment · Export to accounting · Archive). Statuses a–c success, d–e active, h warning, rest default; `dependsOn` d←a,b · e←c · f←d,e · g,h←f · i←g,h · j←i.

## 8. Stories

New `KeyboardFocus` stories (360-ready, `play`: if `viewMode === 'story'`, focus the element with `{ preventScroll: true }`; description names the ring and its contrast):

| Story | Expected ID | Focuses |
|---|---|---|
| Rich text: keyboard focus | `editors-rich-text-editor--keyboard-focus` | rich surface (frame ring) |
| Document viewer | `data-display-document-viewer--keyboard-focus` | first toolbar btn |
| Filter bar | `data-display-filter-bar--keyboard-focus` | active toggle-btn |
| Select clear | `form-select--keyboard-focus` (clearable, value set) | `__clear` |
| Gallery | `data-display-gallery--keyboard-focus` (categories) | 2nd filter-btn |
| Log viewer | `data-display-logviewer--keyboard-focus` | error pill |
| Callout | `feedback-callout--keyboard-focus` (error, dismissible) | dismiss |
| Notification center | `feedback-notification-center--keyboard-focus` | 2nd filter chip |
| Tabs | `navigation-tabs--keyboard-focus` | active panel |
| Chat | `components-chat--keyboard-focus` (with attachments) | file attachment link |
| Description list | `components-description-list--keyboard-focus` | first link |
| Color picker | `form-color-picker--keyboard-focus` | native input |
| Table | `data-display-table--keyboard-focus` (selection) | first row checkbox |
| Number input | `form-number-input--keyboard-focus` | increment |
| Tag input | `form-tag-input--keyboard-focus` (play adds "Kostenstellenverantwortung") | its × |
| Kanban | `data-display-kanban-board--keyboard-focus` | first card |
| File upload: remove targets | `form-file-upload--remove-targets` (`multiple: true`; play drops 3 files: bericht-2026.csv, Kostenstellen-Übersicht-2026-final.xlsx, a.txt) | 2nd remove |
| Dependency viewer: phone width | `data-display-dependency-viewer--phone-width` / `--phone-width-de` (§7, `height: '480px'`, `showEdgeLabels: false`) | — |

D-5 story edits: `button.stories.ts:693` panel `background: var(--color-error-subtle); border-color: var(--color-border)`; `tooltip.stories.ts:85/89` `var(--color-surface-2)` / `var(--color-border)`; `toolbar.stories.ts:325` `var(--color-border)` / `var(--color-surface)`. F-19, D-3 and D-4 are verified on existing stories with forced focus/hover in `--measure` (hover can't be forced by a story; forced colours by flag) — the AC-15 exception.

## 9. Verification

Baseline: `tmp/story-shots/042/baseline` = 260 stories of every touched component (list `baseline-ids.txt`), 360 / 1280 L/D, 1,040 shots + dependency-viewer 1024 L/D, measure = 1 s wait (`--measure='(async () => (await new Promise(r => setTimeout(r, 1000)), 1))()'`; the file-upload play drops need it). Excluded as unstable: log-viewer, chat message-status / user-avatar, doc image-preview, table pagination / filtering / full-featured. Reusable measures and before-logs in `tmp/story-shots/042/`: `sweep-measure.js` (`sweep-1280-{light,dark}.log`, `sweep-360-light.log`), `hover-measure.js` (`hover-{light,dark}.log`), `proto-ring-measure.js` (`proto-ring.log`), `dep-measure.js`, prototypes `dep-proto*`, `fu-proto`.

| AC | How | Expected |
|---|---|---|
| AC-1 | §6.1 + `sweep-measure.js` re-run 1280 L/D, 360 L | no `NONE` / `auto` row for kit elements (rows G and hidden checkbox/radio inputs excepted) |
| AC-2 | `proto-ring-measure.js` with the injected CSS removed, on the build | §5 values ± 0.02, all ≥ 3 |
| AC-3 | `--forced-colors` run of the same measure | every D-2/D-3/D-9 indicator `outlineColor`/`stroke` = Highlight (emulated rgba(5,0,73,.8) L / rgba(0,230,255,.8) D), none box-shadow-only |
| AC-4 | measure: `focus()` → `:focus-visible` true + ring (§9 AC-2 run); unit guard spec (`focus-indicators.spec.ts`) reading the SCSS sources: each §3 class has a `:focus-visible` rule (never bare `:focus`, except the D-6/D-9 field surfaces) and `_reset.scss` has the narrowed selector. Synthetic clicks don't set the browser's pointer heuristic, so mouse behaviour is proved by the selector, not a shot | guard green |
| AC-5 | sweep before/after diff: only §6.1 B–F rows change; at-rest compare against baseline | identical except §8 D-5 stories (dark and light) and the new stories |
| AC-6 | `hover-measure.js` L/D | every row `SAME`; values §4 |
| AC-7 | same measure: rest and hover columns equal `hover-{light,dark}.log`; at-rest compare | identical |
| AC-8 | `dep-measure.js`-style measure on `--phone-width(-de)` at 360 | scale ≥ .833, label ≥ 10.0 px, stroke ≥ 1.25 px, every node inside `[0, scrollWidth]`, first node x = 24·scale, `pageX` 0 |
| AC-9 | baseline compare of all dep stories at 1024 / 1280 (and 360) | identical |
| AC-10 | new stories L/D, EN/DE; DE label bbox ≤ node width; unit test: before a fit (no canvas size) the host has the `height` style and the canvas no `tabindex`/`role` | no overlap, no ellipsis |
| AC-11 | `fu-proto` measure on `--remove-targets` + `--german-locale` at 360/1024/1280: `elementFromPoint` at centre ± 21.5 = button, ± 23 ≠; `::before` 44 × 44; rows 42; hit areas of adjacent rows 6 px apart | all pass |
| AC-12 | unit test: names "Remove file <name>" / with `removeFileAriaLabel="Datei entfernen"`; ring + FC measure | pass |
| AC-13 | API diff: only `regionLabel` (JSDoc, `@default`, argType, story) | — |
| AC-14 | `--axe` on touched + new stories, 360/1280 L/D | 0 violations (beyond the 3 isolated-story landmark rules) |
| AC-15 | §8 stories; CHANGELOG 3.27.0: Added `regionLabel`; Fixed F-18 (rows B–F), F-19 (§4), F-20, F-21; Changed: reset narrowed; Compatibility: consumer buttons without a focus style now show the browser ring on keyboard focus; remove-button name; clamped fit-width now scrolls | — |

**Risks (my pitfalls):** prototype CSS needed ×3 classes against `[_ngcontent]` — the real rules don't; ancestor `:has()` rings need forced-colours Highlight (037 r1); opacity dims rings (callout, tag ×: `opacity: 1` on focus); SVG paint isn't forced (scatter); the dep scroll width must ignore the svg's unscaled box.

**Follow-ups (not here):** **F-22** 44 px targets found by the sweep: NC action 26, NC filter chips 27, log pills 15 (hit 40), callout ×, select ×, tag × (16–24), RTE toolbar 32 / mode 26, doc-viewer 32, chat 32, table checkbox 16. **F-23** unfocused hover: textarea/datepicker border `--color-primary-400` 1.89 L; error fields lose the error colour on hover (input, select, textarea, datepicker). **F-24** RTE frame border `--color-border` 1.23 L (field boundary < 3:1). **F-25** `theme="light"` header: child `lc-button`s and primary inks follow the page in dark. **F-26** (r1) pre-existing axe findings the new stories expose: RTE mode `.active` contrast, gallery `__filter-btn--active` contrast, chat monogram and tag chip text contrast (light), log-viewer `scrollable-region-focusable`. **F-27** (r1) kanban over-limit column uses `--color-error-50` (`#f7a1a1` light): column title 3.80:1 (axe); `--color-error-subtle` gives 6.58 (dark already 5.42); rest-look change.
