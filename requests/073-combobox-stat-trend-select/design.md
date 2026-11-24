# Design 073: lc-combobox clearable, lc-stat-trend header arrangement, lc-select visible label

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-20
- **Change note (review r1, 2026-11-24):** build.md X-1 and X-2 accepted and written in. §2 and §6 were wrong about the slot text: axe 4.14 `label-content-name-mismatch` joins text nodes with no separator, also across a custom element (`lc-badge`) and a flex box. The browser probe `tmp/story-shots/073/r1-x1.log` (tile A, 360) passes with the space and has 1 violation without it. So **every** slot text starts with a space (§2, §6). §7 and §8: the *Required single choice* fields are labelled „Status (sm|md|lg)“ and „Status (md, mit ×)“.
- **Prototypes:** `tmp/story-shots/073/proto*/` (stat-trend rules injected into *Card Dashboard* at 360/1024/1280, RTL, 200 %; select label injected into *Registration Form*; contrast grids). Baseline: `tmp/story-shots/073/baseline/` (main 0548efb, 49 stories × 3 widths × 2 themes = 294 shots: 13 stat-trend, 16 select, 18 combobox, `form-search-input--combobox`, `navigation-tabs--default`).

## 1. Approach

Extend three components; every new rule and node is keyed to a new input or to projected content, so defaults keep their CSS, elements and attributes.

| # | Decision | Why |
|---|---|---|
| D-1 | Combobox `clearable` mirrors `lc-select.clearable` (3.39): one more condition on the existing `@else if` branch. | Same name, type and meaning in both pickers; no new anchor, no CSS. |
| D-2 | The width input is **`fullWidth`**, not the requested `fill`. | `fullWidth` means "full width" in lc-button, lc-button-link, lc-provider-button and lc-stack; `fill` on lc-hero (3.37, same consumer) means "fill the *height*". AC-7 is verified against `fullWidth`. |
| D-3 | Slot selector `[stat-trend-end]` (requester's name, `[hero-media]`/`[card-badge]` pattern). Visual and DOM order are always **label, icon, slot**: the slot is the last item at the end edge; `iconPlacement` moves only the icon (`end` = just before the slot, `after-label` = 8 px after the label). | One rule ("end slot = end edge"), no `order`, so reading and focus order equal the visual order. |
| D-4 | Slot only (no `label`, no `icon`): not rendered, because the slot lives in the header and the header still needs a label or icon (3.44 rule). | A state badge without a label has no context; no default DOM change. |
| D-5 | Narrow header: when label (one line) + icon + slot don't fit, the **slot moves to a second header row at the start**; the label wraps (hyphenated) only when it alone is wider than its row. | At the requester's 360 px tile (278 px content) "OFFENE MASSNAHMEN" 148 + icon 28 + badge 160 = 336 px; even a two-line label (longest word 94) needs 282 px. So the badge can't share the row; under the label it stays whole and aligned with the value. |
| D-6 | Select label is a `<label id>` (no `for`: the trigger is a `div role="combobox"`, not labelable) + `aria-labelledby` on the trigger + a click handler that focuses the trigger. `ariaLabel` wins when both are set. | Same element, tokens and spacing as `lc-combobox__label`; `ariaLabel` beats the visible label in lc-input too (`aria-label` > `<label for>`), and finance-intelligence today sets the same text in both. |
| D-7 | Select gets `requiredIndicator` (default `true`) next to `label`, as in lc-input. | Forms that switch lc-input stars off must be able to do the same on a select in the same form. |

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | combobox `clearable` | `boolean` (`booleanAttribute`) | `true` | Whether a selected single value shows the clear (×) button (3.52). `false` for required single choices such as a status: no button is rendered, the input reaches the frame's end padding, and the tab order loses that stop. Typing still filters, choosing another option replaces the value, and `clear()`, `writeValue(null)` and `[(selectedValue)]` still clear it. No effect with `multiple` (chips keep their ×). `@default true` |
| input | stat-trend `iconPlacement` | `StatTrendIconPlacement` | `'end'` | Where the header `icon` sits (3.52): `'end'` at the end of the header, before a `[stat-trend-end]` element (as before); `'after-label'` 8 px after the label, also in a wide (`fullWidth`) header. `@default 'end'` |
| input | stat-trend `fullWidth` | `boolean` (`booleanAttribute`) | `false` | Whether the tile takes the full width of its container (3.52): the host becomes `display: block; inline-size: 100%`, so the header reaches the container's end edge. The value row, the change and the 120 px sparkline keep their size and start position. `@default false` |
| slot | stat-trend `[stat-trend-end]` | — | empty | One element at the end of the header (a state `lc-badge`), vertically centred on the label row. It moves to a second header row when the row is too narrow. Rendered only with a `label` or `icon`. Start the slot's text with a space (`&ngsp;` or the text on its own line), also inside an `lc-badge`, so axe's WCAG 2.5.3 check reads two words (r1, X-1). |
| type | `StatTrendIconPlacement` | `'end' \| 'after-label'` | — | Exported from `@lifecorner/angular-ui-kit/stat-trend`. |
| input | select `label` | `string` | `''` | Visible label above the trigger (3.52), styled like the `lc-combobox` label (14 px, weight 500, 6 px above the field). It names the trigger and the list (§6), and a click on it focuses the trigger (not when disabled). If `ariaLabel` is set too, `ariaLabel` names the trigger; keep it equal to or starting with the label (WCAG 2.5.3). `@default ''` |
| input | select `requiredIndicator` | `boolean` | `true` | Whether `required` adds a `*` after the `label` (hidden from screen readers; `aria-required` already says it), as in lc-input. No effect without `label`. `@default true` |
| JSDoc | select `ariaLabel` | — | — | Add: "Wins over `label` when both are set." Add `@default undefined`. |

No CSS hooks. Default rendering unchanged because: combobox adds `&& clearable()` to an existing branch; stat-trend binds host classes only when true (`host: { '[class.lc-stat-trend--full-width]': 'fullWidth()', '[class.lc-stat-trend--icon-after-label]': "iconPlacement() === 'after-label'" }`, no `class` attribute by default) and `<ng-content>` creates no node when empty; select renders the label inside a new `@if (label())` (default DOM gains only that block's comment anchor, no element or attribute).

## 3. Anatomy and layout

### 360 px — *KPI Tile (DE)*, tile A (card content 294 px; requester's tile 278 px)

```
┌ lc-card outlined md (16 + 1) ───────────────────┐
│ OFFENE MASSNAHMEN (i)                            │ label 12/18 px tertiary, uppercase; icon 20 px, 8 px after the glyph
│                     ↕ 4 (row-gap)                │
│ [Teilweise umgesetzt]                            │ lc-badge sm 152 × 24, x = content start (row 2)
│                     ↕ 4 (column gap, as before)  │ header 48 px (20 + 4 + 24)
│ 27                                               │ value 24 px / 28.8
└──────────────────────────────────────────────────┘
```

### From 1024 px — *KPI Tile* tile A at 1280 (content 371 px) and *Header Arrangement* (cards max 400, content 366)

```
KPI A (1280)   OFFENE MASSNAHMEN (i) ..................... [Teilweise umgesetzt]   one row, badge right = content right, Δcentre 0
1 default      REVENUE ($)                     header as wide as the tile content (unchanged)
2 fullWidth    REVENUE ........................................... ($)   icon right = card content right
3 + after-lbl  REVENUE ($) ...........................................   icon 8 px after the label glyph
4 + slot       REVENUE ................................... ($) [On track]   icon 8 px before the badge
5 + al + slot  REVENUE ($) ................................... [On track]
6 slot only    REVENUE ($) [On track]          no fullWidth: free space only if the row/sparkline is wider
```
At 1024 (three tiles, content 286) tile A wraps as at 360 (336 > 286); tiles B and C stay on one row.

| Element | Rule (SCSS, appended after the existing rules) | Value |
|---|---|---|
| host, fullWidth | `:host(.lc-stat-trend--full-width) { display: block; inline-size: 100%; }` | proto: host = container content at 360/1024/1280 |
| column, fullWidth | `:host(.lc-stat-trend--full-width) > .lc-stat-trend { display: flex; }` | header right = content right (0.00 px) |
| icon, after-label | `:host(.lc-stat-trend--icon-after-label) .lc-stat-trend__header-icon { margin-inline-end: auto; }` | glyph → icon 8 px (`gap: 0.5rem`) |
| slot element | `.lc-stat-trend__header > ::ng-deep [stat-trend-end] { display: flex; }` | kills the inline-host strut: badge host 25 → 24 px |
| header with slot | `.lc-stat-trend__header:has(> [stat-trend-end]) { flex-wrap: wrap; row-gap: 0.25rem; }` | column gap stays 0.5rem |
| label with slot | `… :has(> [stat-trend-end]) > .lc-stat-trend__label { overflow-wrap: anywhere; hyphens: auto; hyphenate-limit-chars: 12 4 3; }` | 30-char compound breaks "…ÜBER-/SICHT", no overflow |
| label + icon with slot | `… :has(> [stat-trend-end]) > .lc-stat-trend__label:has(+ .lc-stat-trend__header-icon) { max-inline-size: calc(100% - 20px - 0.5rem); }` | keeps the icon on the label row |
| label, icon at end, with slot | `:host(:not(.lc-stat-trend--icon-after-label)) .lc-stat-trend__header:has(> [stat-trend-end]) > .lc-stat-trend__label { margin-inline-end: auto; }` | icon + slot grouped at the end |

Angular's shim scopes only inside `:where()`/`:is()`, never inside `:has()` (compiler `_cssPrefixWithPseudoSelectorFunction = /:(where|is)\(/`), so `:has(> [stat-trend-end])` matches the consumer's projected element. Use logical properties only (RTL proto: mirrored at 1280).

### Select label, 360 px (stacked) and from 1024 px (two columns, *Labels in a Form (DE)*)

```
Simulationsszenario auswählen *        label 14/21, weight 500, text-primary; * error-600, margin-inline-start 4 px
   ↕ 6 (label margin-bottom 0.125rem + wrapper gap 4)          = lc-combobox (2 + 4) and lc-number-input (gap 6)
┌──────────────────────────────┐       trigger xs 24 · sm 32 · md 40 · lg 44 (unchanged)
│ Basisszenario 2027         ⌄ │
└──────────────────────────────┘
   ↕ 8  helper / error 12 px (unchanged)
1024+: [select label | combobox label] tops equal; field tops equal (21 + 6); md field bottoms differ by 2 px (select 40, combobox 42, pre-existing).
```
`.lc-select__label { font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-primary); margin-bottom: 0.125rem; overflow-wrap: break-word; hyphens: auto; hyphenate-limit-chars: 12 4 3; }` and `.lc-select__required { color: var(--color-error-600); margin-inline-start: var(--spacing-1); }` (lc-input values). Template: no space before the `*` (it can't wrap alone).

Combobox without ×: input end = frame end − 9 px (1 border + 8 padding) at xs/sm/md/lg, exactly the empty-field layout today (measured 9 at all sizes).

## 4. States

| State | Combobox `clearable=false` | Stat-trend header | Select label |
|---|---|---|---|
| default | value text, no × | per §3 | label above trigger |
| hover / focus-visible / active | frame as today | header not interactive; slot content keeps its own states | label: no hover style, cursor default; trigger ring as today |
| disabled | as today (frame .6) | — | label unchanged (as combobox); click does nothing |
| loading | spinner as today (wins over ×) | — | trigger spinner as today |
| empty | placeholder | no slot content = 3.51 layout | `label=''` = 3.51 DOM |
| error | frame/outline as today | — | label stays text-primary; message below as today |
| overflow | value wider than the input is cut at the input end (native field, as today); the input gains the × room (md 24 px) | slot to row 2; long compound label hyphenates (`lang="de"`); a nowrap badge wider than the row overflows (200 % at 360: "Teilweise umgesetzt" 285 > 214 px, 71 px) → stories use `lc-badge [wrap]="true"`; the value row overflows at 200 % in narrow tiles as before (73 px, pre-existing) | long label wraps at spaces; one compound hyphenates (`lang="de"`) |

Known limits (record, no fix): a wrapping `after-label` label fills its row, so the icon sits at the row end (30-char compound at 360: 37 px from the last glyph). Tiles in one grid row align their values only when their headers have the same height (label + icon 20, + sm badge 24, wrapped 48 px).

## 5. Theming

No new colours or tokens. Computed WCAG (canvas `rgb(255,255,255)` L / `rgb(10,18,27)` D; card `rgb(16,28,38)` D):

| Element | Light | Dark | Contrast L / D |
|---|---|---|---|
| select label `--color-text-primary` on canvas | rgb(17,24,39) | rgb(241,246,248) | 17.74 / 17.29 |
| select `*` `--color-error-600` | rgb(157,14,14) | rgb(247,161,161) | 8.39 / 9.48 |
| stat-trend label (unchanged, 031) | tertiary | tertiary | 5.83 / 6.70 |
| lc-badge sm text on its tint over the card (composited) | warning · success · error | same | 5.52 · 4.85 · 10.98 / 5.55 · 6.25 · 8.38 |

Forced colours: all new parts are text or existing components (system colours apply); no rule needed.

## 6. Accessibility

- **Combobox:** with `clearable=false` the Tab after the input leaves the field (no × stop). Escape closes the list, Enter/Tab choose as before.
- **Stat-trend:** icon stays `decorative`. Text order: label, slot, (S1 space) value, change. axe joins adjacent text nodes with no separator, also across a custom element and a flex box. Every slot text, also inside an `lc-badge`, therefore starts with a space (`&ngsp;`), so that axe reads "Offene Maßnahmen Teilweise umgesetzt 27" (JSDoc, r1 X-1). A kit-side `&ngsp;` before the slot would also pass (probe r1-x1, header still 48), but it adds a text node to every default header (AC-10). In a clickable `lc-card`, the card's `ariaLabel` must include the badge text in order ("Offene Maßnahmen: Teilweise umgesetzt, 27"), and the slot must not hold a control (nested-interactive). An interactive slot element is in DOM order after the label (keyboard reachable; ≥ 24 px per 2.5.8 is the consumer's).
- **Select:** trigger `aria-labelledby="<selectId>-label"` when `label` is set and `ariaLabel` is empty; otherwise `aria-label` as today. Listbox `aria-label` = `ariaLabel || label || null`. Search field fallback = `searchAriaLabel || ('Search ' + (ariaLabel || label))` or `'Search options'` (AC-18). `*` is `aria-hidden`; `aria-required` unchanged. The `<label>` has no `for`; add `<!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control, … -->` with the reason. Click target is the trigger (≥ 44 at lg as today); the label is an extra pointer shortcut.
- Reduced motion: nothing animated. Prerender: host classes, slot and label are server-rendered; `:has()` needs no JS.

## 7. Texts

No new built-in strings. Story strings:

| Story | DE text |
|---|---|
| KPI Tile | labels "Offene Maßnahmen", "Einsparung 2026", "Budgetabweichung"; badges "Teilweise umgesetzt" (warning), "Im Plan" (success), "Kritisch" (error); card `ariaLabel` "Offene Maßnahmen: Teilweise umgesetzt, 27" |
| Required single choice | labels "Status (sm)", "Status (md)", "Status (lg)", "Status (md, mit ×)" (r1, X-2); options "Offen", "In Umsetzung", "Teilweise umgesetzt (Restaufwand in Klärung)", "Umgesetzt", "Zurückgestellt bis zur Budgetfreigabe"; placeholder "Status wählen"; `emptyMessage` "Keine Treffer"; `clearAriaLabel` "Auswahl löschen" |
| Select DE stories | labels "Simulationsszenario auswählen", "Art der Änderung", "Ab (Monat)"; placeholder "Bitte wählen"; `clearAriaLabel` "Auswahl löschen"; `searchPlaceholder` "Suchen …"; `searchAriaLabel` "Szenario suchen"; `noOptionsLabel` "Keine Treffer"; helper "Gilt für alle Verträge"; error "Bitte ein Szenario wählen"; combobox "Vertrag oder Leistung"; number-input "Änderung in Prozent" (suffix "%") |

The search fallback stays English ("Search …"): DE pages set `searchAriaLabel` (as today with `ariaLabel`).

## 8. Stories

Composition stories set `parameters.controls.disable: true`; every new story imports what it renders (Card, Badge, Combobox, NumberInput).

| Story | Expected ID | Args / content | Shows |
|---|---|---|---|
| KPI Tile (DE) | `charts-stat-trend--kpi-tile` | `lang="de"`, grid `repeat(auto-fit, minmax(200px, 1fr))` gap 1rem; A clickable card: `fullWidth iconPlacement="after-label" icon="info-circle"` value "27" + warning badge `[wrap]`; B `fullWidth icon="chart-bar"` "1,2 Mio. €" "+4,0 %" `sentiment="positive"` + success badge; C `fullWidth after-label icon="info-circle"` "−3,4 %" + error badge (all badges `size="sm" [rounded]`) | AC-7, 8, 9, 11, 12; wrap at 360/1024, one row at 1280 |
| Header Arrangement | `charts-stat-trend--header-arrangement` | column `max-width: 400px`, six outlined cards per §3 (EN, label "Revenue", icon `currency-dollar`, badge "On track") | AC-6, 7, 9 combinations |
| Header RTL | `charts-stat-trend--header-rtl` | `dir="rtl"`, cards 4 and 5 of *Header Arrangement* | AC-12 mirroring |
| Required single choice (DE) | `form-combobox--required-single-choice` | `lang="de"`, `clearable=false` at sm, md, lg with a long preset value (`[selectedValue]`), plus one md default (with ×) for comparison; labels per §7 (X-2) | AC-1, 3, 4 |
| With Label | `form-select--with-label` | args only: `label: 'Country'`, `required: true`, `helperText`, `options` (all controls live) | AC-14, 15 |
| Label States (DE) | `form-select--label-states-de` | `lang="de"`: xs, sm, md, lg with labels; required (`*`); error + message; helper; disabled; searchable; multiple; long label "Simulationsszenario auswählen" | AC-17, 18 |
| Labels in a Form (DE) | `form-select--labels-in-a-form-de` | `lang="de"`, grid `repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`, `max-width: 45rem`, gap 1rem (1 column at 360, 2 from 1024): select "Art der Änderung" (required) · combobox "Vertrag oder Leistung" · select "Ab (Monat)" · number-input "Änderung in Prozent" | AC-14 alignment |
| *changed:* Registration Form | `form-select--select-in-form` | the two selects get `label="Industry"` / `label="Company size"` (they had no name) | composition fix |

argTypes (description + `table.defaultValue`): combobox `clearable`; stat-trend `iconPlacement` (select: end, after-label), `fullWidth`; select `label`, `requiredIndicator`. Stat-trend docs description lists the slot and D-3/D-4/D-5.

## 9. Verification

| AC | How | Expected |
|---|---|---|
| 1, 5 | unit (`combobox.clearable.spec.ts`, new) | no `.lc-combobox__clear` with a value; typing filters; Tab from input goes to next control; Escape/Enter as before |
| 2 | existing combobox specs unedited; baseline `--compare` | pass; 18 combobox stories + `form-search-input--combobox` × 6 identical |
| 3 | unit + *Required single choice* 360, `--measure` | `wrapper.right − input.right` = 9 at sm/md/lg; multiple chips keep ×; spinner wins; `writeValue(null)` clears |
| 4 | story 360/1024 L/D | no `scrollWidth > clientWidth` on the frame |
| 6 | unit + *Header Arrangement* 1280 | after-label: icon.left − label glyph right = 8.00 ±0.5 in cards 3 and 5 |
| 7 | *Header Arrangement*, *KPI Tile* 360/1024/1280 | host and header right = card content right (±0.5); value row and sparkline x = content start, sparkline 120 × 28 |
| 8 | unit (no slot → header children and text nodes as 3.51; prerender) + *KPI Tile* 1280 | badge right = content right; \|centre(badge) − centre(label)\| ≤ 0.5 |
| 9 | stories + unit | order label, icon, slot in cards 4–6; slot-only renders no header and no badge |
| 10 | existing stat-trend specs unedited; baseline `--compare` | 13 stories × 6 identical; host has no `class` attribute by default |
| 11 | new axe spec host (badge in slot, clickable card) + `--axe` on *KPI Tile* L/D | 0 violations, rule passes |
| 12 | *KPI Tile* 360/1024/1280 L/D, *Header RTL* 360/1280 | 360: header 48, badge x = content start, overflow 0; 1280: one row; RTL: label at the right edge, badge at the left |
| 13 | compat (unchanged regexes) | header + label in prerendered HTML |
| 14 | *Labels in a Form* 1024 | label 21 px, label→trigger 6.0 (= combobox 6.0); label tops and field tops equal per row |
| 15 | unit + axe | name = label text; `ariaLabel` set → `aria-label`, no `aria-labelledby`; label click focuses trigger (not when disabled); `*` with `required` |
| 16 | existing select specs unedited; baseline `--compare` | 15 stories × 6 identical (*Registration Form* differs as planned) |
| 17 | *Label States* 360/1024 L/D + `--forced-colors` | no clipping; label lines ≤ 2 at 360 |
| 18 | unit | listbox and search names use the label; unchanged without it |
| 19, 20 | lint, tests, tools, build, compat | green |

Expected diffs: only *Registration Form* (6 shots). `navigation-tabs--default` has `<lc-select label="Visibility">` in its hidden third tab (shots identical; the tab now shows a label). The compat app's `<lc-select label="Wahl">` now renders a label (no regex pins it): changelog **Compatibility** line "A `label` attribute on `lc-select` that did nothing before now shows a label and names the field."

Risks: host bindings must not write `class=""`; prove computed rules on the built story, not in jsdom (`:has`); stories need `lang="de"` for hyphens; new SCSS goes after the existing rules (`indexOf` pins in `stat-trend.sentiment.spec`, `filled-field-boundary.spec`).
