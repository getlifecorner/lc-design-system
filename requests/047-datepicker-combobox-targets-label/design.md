# Design 047: datepicker and combobox clear targets, combobox lg input, datepicker label, selected day, day panel targets

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-12. Built on main `bbd1b74` (3.29.0); every value below was measured on a CSS prototype in that build (`tmp/story-shots/047/proto-*`).
- **Change note (review r1, 2026-11-04):** three values were wrong and are corrected from the build (`review.md` deviations 1–3): `.lc-datepicker-calendar` is `position: relative` (in the CDK pane's flow; push needs the pane's size), so a panel without room below opens above the field; the pushed panel is at x 8 (*Day Panel*) or end-aligned at x 2 (*Default*, field ending at 344), not x 10, because CDK 22.2 checks the fit against `[0, vw − 16]`; the 158 px compound label takes 2 lines (42), not 3 (63). 200 % text: 360 × 626 at x 8.

## 1. Approach

Extend, no new component. Each item reuses a kit pattern that already passed review:

| Item | Pattern reused | Why |
|---|---|---|
| A, C clear targets | lc-select × (043 r2): **24 px box** with `margin: -2px; padding: 2px; background-clip: content-box`, radius + 2 px; plus a `::before` hit area (lc-file-upload remove, 042) for 44 px | axe `target-size` reads the box, not `::before`; the recipe was hash-identical in 043 and is again here (84/84) |
| D combobox lg | input box grows into the wrapper padding (`margin-block: -0.25rem`), frame unchanged; frame click forwards focus | the line box stays 36, so the frame stays 46 and chip rows keep their 4 px padding |
| B selected day | the month cell's inset ring (046): `inset 0 0 0 2px var(--color-primary-500)`, both themes | one look for "selected" in both modes; no token change, so other `--color-primary-fill` users are untouched |
| E label | lc-combobox label (14/500, text-primary, 2 px margin + 4 px gap); `aria-label` dropped while it is set (lc-number-input) | the requester's „Gilt ab“ sits beside a combobox and a number input |
| 046-n3 day panel | month mode's 44 px nav/quick action; app-shell breakpoint 1023.98 px | targets grow only below 1024 px (touch layouts); the desktop panel stays byte-identical |
| 046-n4 | day mode's Enter (`selectDate(selected)` rewrites the text) | parity |

No required marker (`*`) on the label: lc-combobox and lc-number-input, its neighbours on the requester's page, show none. `required` stays `aria-required`.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (`lc-datepicker`) | `label` | `string` | `''` | Visible label above the field (3.30, regeln row 7): a `<label for>` in day and month mode that names the field, so `ariaLabel` is not used while it is set. Empty: no label element, as before. `@default ''` |
| input (`lc-datepicker`) | `ariaLabel` | unchanged | `undefined` | JSDoc gains: "Ignored while `label` is set." |
| template (`lc-datepicker`) | overlay | — | — | `[cdkConnectedOverlayPush]="true"`, `[cdkConnectedOverlayViewportMargin]="8"` |
| behaviour (`lc-combobox`) | clear button | — | — | in the tab order (drop `tabindex="-1"`; keep `(mousedown)` `preventDefault`) |
| behaviour (`lc-combobox`) | frame | — | — | `(mousedown)` + `(click)` on `.lc-combobox__input-wrapper` (§6) |

No CSS hook, slot or type. Story argType `label`: `control: 'text'`, `table.defaultValue.summary: "''"`, description as the JSDoc.

Default rendering unchanged: the prototype of every CSS rule in §3 gave **84/84 identical** shots against `047/baseline` (all 21 datepicker and combobox stories, 360/1280, L/D) and 4/4 identical opened day panels at 1024/1280. The label is inside `@if (label())`: with `''` no element is added (only Angular's comment anchor).

## 3. Anatomy and layout

### 360 px (story canvas, field 16–344)

```
Datepicker md (40 high), value set              Combobox lg (frame 46, inner 44)
 Gilt ab                  14/500/21 text-primary  Gilt ab (lg)
 ↕ 6 (wrapper gap 4 + label margin-bottom 2)      ↕ 6 (unchanged)
┌──────────────────────────────────┬────┬──┬──┐  ┌─────────────────────────────┬────────┐ y 286
│ 2026-07                          ┊[×] ┊  │📅│  │ Juli 2026  input 25–299     ┊  [×]   │
│                                  ┊24px┊  │20│  │ 274 × 44 (y 287–331)        ┊ 24 box │
└──────────────────────────────────┴────┴──┴──┘  └─────────────────────────────┴────────┘ y 332
 hit area x 240–284 × y 14–58 (44 × 44, 2 px      hit area x 299–343 × y 287–331 (44 × 44)
 past the frame), right edge = icon left edge     = input end … inner border edge
```

Day panel below 1024 px (Day Panel story, field at x 24): 342 × 448 (measured), pushed to x 8, 10 px from the right edge (r1: measured; the design's x 10 was computed). A field ending at 344 (16 px page padding) gets it end-aligned at x 2 without push. Without push it would end at 366 (lc-app-page x 24) or 383 (field in a card, x 41).

```
┌ pad 16 ───────────────────────────────────┐
│ [‹]44×44       July 2026 16/600     [›]44 │ header 44, margin 16
│              [ Today ] 65.6 × 44          │ margin 12
│ Su  Mo  Tu  We  Th  Fr  Sa   12/600, 26   │ margin 8
│ 44  44  44  44  44  44  44   gap 0        │ 6 rows × 44 = 264, grid 308
└───────────────────────────────────────────┘ 320 px: 304 wide, cells 38.56 squares
```

### From 1024 px (1280 the same)

Fields as at 360 (wider). Day panel unchanged from 3.29: 310 × 395, nav 32, today 65.6 × 31, days 36, gap 4, grid 276 × 236; only the selected day gains the ring.

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| dp clear (all sizes) | box 24 × 24 (`1.5rem`), `margin: -0.125rem`, `padding: 0.125rem`, `background-clip: content-box`, `position: relative`; glyph 16 at the 3.29 spot | — | radius `calc(var(--border-radius-sm) + 0.125rem)` |
| dp clear hit, md + lg | `.lc-datepicker--md ~ .lc-datepicker-icons .lc-datepicker-clear::before` (lg alike): `content: ''; position: absolute; inset: -0.625rem -0.125rem -0.625rem -1.125rem` | — | — |
| dp clear ring | `outline-offset: -1px` (was 1 px on the 20 box: same ring) | — | `--color-primary-500` |
| cb clear (all sizes) | the same 24 box recipe; ring `@include mix.focus-ring($offset: 0)` | — | `--color-primary-500` |
| cb clear lg | `margin-inline-start: 0.625rem` (input ends 12 px earlier); `::before { content: ''; position: absolute; inset: -0.625rem -0.375rem -0.625rem -0.875rem }` | — | — |
| cb input lg | `height: 2.75rem; margin-block: -0.25rem` (xs–md unchanged) | 18 px | `--font-size-lg` |
| dp label | `display: block; margin-bottom: 0.125rem; overflow-wrap: break-word; hyphens: auto; hyphenate-limit-chars: 12 4 3` | 14/500, lh 1.5 | `--font-size-sm`, `--font-weight-medium`, `--line-height-normal`, `--color-text-primary` |
| day panel < 1024 (`@media (max-width: 1023.98px)`) | nav `2.75rem` square; today `min-height: 2.75rem`; `.lc-datepicker-weekdays` and `.lc-datepicker-days`: `gap: 0; grid-template-columns: repeat(7, minmax(0, 1fr)); inline-size: 19.25rem; max-inline-size: calc(100vw - 3.125rem)`; day `width: 100%; height: auto; aspect-ratio: 1` | — | — |
| selected day | `box-shadow: inset 0 0 0 2px var(--color-primary-500)` (all widths) | 14/600 | fill `--color-primary-fill` unchanged |

The new `.lc-combobox__input-wrapper` rules go into the existing block or after it: `combobox.component.spec.ts` reads the first `.lc-combobox__input-wrapper {` block.

## 4. States

| State | Datepicker clear | Combobox clear | Day cell (< 1024) | Label |
|---|---|---|---|---|
| default | glyph 16, `--color-text-secondary` | glyph 16, `--color-text-tertiary` | 44 square, text 14 | 14/500 |
| hover | 20 px circle `--color-surface-hover` (content box, as 3.29) | the same | `--color-surface-hover`, 44 square r 12 | — |
| focus-visible | ring 2 px at the 3.29 place | ring 2 px round the 24 box (new; it had none) | outline 2/2 (unchanged), may cover 4 px of a neighbour | — |
| active | clear → value `null`, `dateChange(null)`, **focus moves to the field** (it dropped to `<body>`) | clear → focus to the input (opens the list, as any focus does) | select + close | click focuses the field and opens the panel (the label forwards the click) |
| disabled / read-only | not rendered (unchanged) | rendered disabled (unchanged), not focusable | GrayText look, `opacity .5` (unchanged) | colour unchanged |
| error | unchanged | unchanged | — | unchanged |
| selected / today | — | — | fill + inset ring; today tint `--color-primary-50` | — |
| overflow | text runs under the 20 px (md) / 12 px (lg) left of the × only in fields narrower than ≈ 180 px (a `YYYY-MM-DD` value is ≈ 90 px) | a long value ends 12 px before the hit area (lg) | 320 px: cells 38.56; no room below: the panel opens above (gap 0, as lc-combobox) | 30-char compound breaks with a hyphen in a 158 px column (2 lines, 42 high; r1) |
| loading | — | spinner replaces the × (no hit area, no margin) | — | — |

## 5. Theming

| Element | Light | Dark | Contrast (computed in the prototype) |
|---|---|---|---|
| selected-day ring vs panel `--color-surface` | `#208497` on `#fff` | `#84c7d4` on `rgb(16,28,38)` | **4.37 / 9.13** (≥ 3) |
| selected-day text on fill / on hover fill | white on `#1a6a79` / on `--color-primary-fill-hover` | the same | 6.21 / 9.13 (both themes) |
| selected-day fill vs panel (no longer the only cue) | 6.21 | 2.78 | ring carries the state in dark |
| ring vs fill (inner edge) | 1.42 | 3.28 | decorative |
| combobox clear ring vs field `--color-surface-2` | `#208497` on `#f9fafb` | `#84c7d4` on surface-2 | 4.18 / 7.58 (measured 037) |
| datepicker clear ring | unchanged: 4.37 / 9.13 on surface, 3.96 / 9.55 on the filled sunken fill | | |
| label `--color-text-primary` on the canvas | `rgb(17,24,39)` | `#f1f6f8` | 17.74 / 17.29 |

No new token.

## 6. Accessibility

- **Names:** label set → `<label class="lc-datepicker__label" [for]="inputId">` and `[attr.aria-label]="label() ? null : (ariaLabel() || null)"`; the field is named by the label in day and month mode. Clear names stay `clearAriaLabel`.
- **Keyboard:** datepicker order field → × (unchanged); combobox field → × (new; one more stop while a value is selected, as lc-select and lc-datepicker). Enter/Space on × clears and focuses the field. Pointer on the combobox × keeps focus in the input (`mousedown` prevented).
- **Combobox frame** (all sizes): `(mousedown)`: if the target is not the input and not inside a `button`, `preventDefault()` (no blur, so the list doesn't close). `(click)`: same test, not disabled → `input.focus()`. Chip × and clear keep their handlers. ESLint disable comment with the reason "pointer shortcut; the input is the keyboard target".
- **Targets:** datepicker × 44 × 44 md/lg, 24 × 24 xs/sm; combobox × 44 × 44 lg, 24 × 24 xs–md; combobox lg input 44 high; day panel below 1024 px: every target 44. Hit areas never cover another control: the datepicker area stops at the calendar icon (decorative, a click there still opens), the combobox lg area starts where the input ends.
- **Forced colours:** both clears `:focus-visible { outline-color: Highlight }`; day cells as month cells: selected `forced-color-adjust: none; background-color: Highlight; color: HighlightText`, today `text-decoration: underline`, disabled `GrayText`, `:focus-visible` Highlight.
- **Motion:** nothing new animates.

## 7. Texts

| Key / input | EN default | DE (stories) |
|---|---|---|
| dp `label` | `''` (story: "Start date") | „Gilt ab“, „Buchungsdatum“, „Leistungsverrechnungsschlüssel ab“ |
| dp `clearAriaLabel` | Clear date | „Datum löschen“ (day), „Monat löschen“ (month) |
| cb `clearAriaLabel` | Clear | „Auswahl löschen“ |

Only the labels are visible; at 360 „Gilt ab“ is 1 line (21 high) over a 328 field.

## 8. Stories

| Story | Expected ID | Args / template | Shows |
|---|---|---|---|
| With Label | `form-datepicker--with-label` | args `label: 'Start date'`, `placeholder: 'Select a date'`, `helperText: 'The first day of the booking'` | AC-5, label toggle in Controls |
| Label (DE) | `form-datepicker--label-de` | `lang="de"`, max-width 400: month „Gilt ab“ (`granularity="month" format="YYYY-MM" locale="de-DE"`, placeholder „Monat wählen“, `clearAriaLabel` „Monat löschen“, ngModel `'2026-07'`); day „Buchungsdatum“ (locale de-DE, placeholder „Datum wählen“, „Datum löschen“, ngModel `'2026-11-04'`, helper „Nur Werktage“); a 2-column grid of sm fields labelled „Leistungsverrechnungsschlüssel ab“ / „bis“ (no value) | AC-5, AC-7 |
| Clear Targets | `form-datepicker--clear-targets` | max-width 300: day xs/sm/md/lg (labels "Day xs" …, ngModel `'2026-07-15'`), month md/lg (labels "Month md", "Month lg", `format="YYYY-MM"`, ngModel `'2026-07'`) | AC-1, AC-11 |
| Day Panel | `form-datepicker--day-panel` | ngModel `'2026-07-15'`, ariaLabel "Booking date", wrapper `max-width: 400px; padding-inline: 8px` (field at x 24 like lc-app-page), `play: openByClick` | AC-2, AC-9, push |
| Clear Targets (DE) | `form-combobox--clear-targets-de` | `lang="de"`, max-width 400: xs/sm/md/lg with `monthOptions`, `[selectedValue]="'2026-07'"`, labels „Gilt ab (xs)“ …, `clearAriaLabel` „Auswahl löschen“, placeholder „Monat suchen …“, `emptyMessage` „Keine Treffer“; plus lg „Schlüssel (langer Wert)“ with one option „Leistungsverrechnungsschlüssel Kostenstelle 4711 Verwaltung“ selected | AC-3, AC-4, AC-7 |

Story descriptions name the request, the measured sizes and the contrast values above.

## 9. Verification

Measures: `tmp/story-shots/047/proto-hit-measure.js` (values + 4-way `elementFromPoint` scan from the box centre, ±1 px; pass `""` as CSS on the build), `proto-panel-measure.js` (panel boxes, ring contrast), `open-day-measure.js` (opens Default at July 2026).

| AC | How | Expected value |
|---|---|---|
| AC-1 | Clear Targets, 360/1280, hit scan + `--axe=wcag22aa` | dp xs/sm box 24 × 24 (scan 13/12/13/12); md/lg scan L 31 R 14 U 23 D 22 = 44 × 44, beyond right = the `INPUT` (icon area); fields 24/32/40/44; axe 0 violations, 0 incomplete |
| AC-2 | Day Panel L/D + `--forced-colors`; `theme-contrast.spec.ts` block (primary-500 vs surface ≥ 3 both themes) | ring 4.37 L / 9.13 D; text 6.21; FC selected bg = Highlight, ≠ panel bg |
| AC-3 | Clear Targets (DE), 360/1280, scan + axe; focus ring shot | xs–md 24 × 24; lg scan 27/18/23/22 → x 299–343 × y 287–331 at 360, left neighbour `INPUT`; axe 0; ring 4.18 / 7.58 |
| AC-4 | measure + unit test | lg input 44 high (y 287–331), frame 46; xs–md inputs 24/28/32, frames 34/38/42; spec: `mousedown` (defaultPrevented) + `click` on the wrapper focuses the input for xs/sm/md/lg; not when disabled; clicking the input unchanged |
| AC-5 | unit test + With Label | `<label for>` = input `id`, text, no `aria-label` while `label` is set (ariaLabel also set), accessible name = label; month mode too |
| AC-6 | unit test + compare | `label` `''` → no `label` element (count 0); 84/84 identical vs `047/baseline` |
| AC-7 | Label (DE), Clear Targets (DE) at 360 | „Gilt ab“ 1 line, label width ≤ field; compound 2 lines with hyphen in the 158 column (r1); `scrollWidth − clientWidth` 0 on every label |
| AC-8 | unit tests | Tab: field → × (both); Enter/Space on × → value `null`, focus = field; names = `clearAriaLabel`; existing specs unedited |
| AC-9 | Day Panel 320/360/1024/1280 | 360: panel 342 × 448 at x 8 (right 350; r1), cells/nav 44, today 65.6 × 44; 320: 304 wide, cells 38.56; 1024/1280: 310 × 395, `baseline-open` 4/4 identical, 360 2/2 differ (intended) |
| AC-10 | unit test (month spec) | type „2026-1“ in the open month field with July 2026 selected, Enter → text „2026-07“, panel closed; with no selection Enter keeps the text (as day mode) |
| AC-11 | `--compare=tmp/story-shots/047/baseline` (21 stories, 360/1280 L/D, 800 ms wait) + `baseline-open` (`open-day-measure.js`) | 84/84 identical; open 1024/1280 identical |
| AC-12 | compat probe: `<lc-datepicker label="Gilt ab" granularity="month" format="YYYY-MM">` and `<lc-combobox size="lg" label="Konto">` | `/<label[^>]*for="lc-datepicker-[0-9]+"[^>]*>\s*Gilt ab\s*<\/label>/`, `/class="lc-combobox lc-combobox--lg/` and `/class="lc-combobox__input-wrapper"/` in the prerendered HTML |

**Known limits** (for the changelog, backlog rows):
- 200 % text at 360: the day panel is 360 × 626 at x 8 (r1; 3.29: 618 wide), 8 px past the right edge inside its padding; the title wraps and the day cells are 37 px.
- The panel can sit 2 px from the left edge where an end-aligned position fits by the CDK's `[0, vw − 16]` check (field ending 8–16 px from the right edge).
- The md datepicker hit area reaches 2 px above and below the 40 px frame; an `overflow: hidden` ancestor flush with the field cuts it to 44 × 40.
- With push, a panel that fits neither below nor above now covers the field instead of being cut off.

**Compatibility lines:** combobox × is a tab stop; combobox lg input is 12 px narrower while a value is selected (frame 46 unchanged, input box 36 → 44); datepicker focus returns to the field after a clear; the selected day has a ring in both themes and at all widths; the day panel below 1024 px is 342 × 448 and is pushed into the viewport.

**Risks (memory):** axe reads the box (043 r1); every `@if` adds an anchor (045 r1): test elements, not raw HTML; injected-rule weight; `button:focus { outline: none }` reset needs the new combobox ring (039); FC rings need explicit Highlight (037 r1); max 2 parallel story-shots runs (046).
