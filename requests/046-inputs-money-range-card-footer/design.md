# Design 046: Month datepicker, combobox value, number-input locale/suffix/size, money range, card equal footer

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-35. Measured on main f76e9cb (3.28.0), Storybook rebuilt 2026-11-04.

## 1. Approach

All five are **extensions**; every new input is optional and its default keeps today's DOM elements, attributes and text.

| Item | Pattern followed | Decision |
|---|---|---|
| Datepicker month | APG date-picker grid (focus in the grid, roving `tabindex`), the panel's header/today row, `locale` via `Intl` as today | D-1: 3 × 4 grid in the same 276 px content box; month mode only: nav and quick action 44 px (day mode keeps 32/31 px, see Known); D-8: the selected month adds a 2 px inset `--color-primary-500` ring, because the fill is 2.78:1 on the dark surface (§5) |
| Combobox value | `model()` like `lc-tree-view` `selectedId` | D-2 (A-2): **`selectedValue`** / **`selectedValueChange`** (`string \| null`), single mode only; `valueChange` untouched. Fix the class JSDoc example `[(value)]="assignee"` (does not compile today) → `[(selectedValue)]="assigneeId"` |
| Number-input | `lc-input` / `lc-combobox` sizes (`--size-interactive-*` tokens) | D-3: `locale` swaps only the decimal separator; D-4: suffix after the value, value end-aligned; D-5: the control no longer stretches past the + button under a long label (`align-self: flex-start`) |
| Money range | the existing two spans (visible `aria-hidden`, spoken sr-only) | D-6: the separator is glued to the second amount (U+00A0), so a wrap happens only before „bis“ |
| Card footer | `lc-next-step-card` TD-1 (size container on the host, `30rem`) | D-7 (A-3): side by side as soon as the **card** is ≥ 480 px wide, at any viewport. life-os column: 688 px at 1024, 568 at 1280 (memory 045), so the boards get "side by side from 1024"; a 768 px tablet (card 702) is side by side too. AC-27 needs no change note (A-3's recommendation) |

## 2. Public API

| Kind | Component | Name | Type | Default | JSDoc (first sentence, then details) |
|---|---|---|---|---|---|
| input | datepicker | `granularity` | `DatepickerGranularity` | `'day'` | Pick a day (`'day'`) or a month (`'month'`). Month: 12-month grid with year navigation, `dateChange` emits the 1st of the month (local midnight), `format` should be a month format (`'YYYY-MM'`; a `DD` token shows `01`); `minDate`/`maxDate` keep a month selectable when any of its days is in range; a `disabledDates` entry disables its whole month; `disableWeekends` is ignored. Set `placeholder` (e.g. "Select a month"). |
| input | datepicker | `previousYearAriaLabel` / `nextYearAriaLabel` | `string` | `'Previous year'` / `'Next year'` | Accessible names of the year buttons (month mode). |
| input | datepicker | `monthDialogAriaLabel` | `string` | `'Choose month'` | Accessible name of the month dialog (`dialogAriaLabel` stays the day dialog's). |
| input | datepicker | `currentMonthLabel` | `string` | `'This month'` | Label of the quick action that shows the current year (month mode; day mode keeps `todayLabel`). |
| type | datepicker | `DatepickerGranularity` | `'day' \| 'month'` | — | exported from `@lifecorner/angular-ui-kit/datepicker` |
| model | combobox | `selectedValue` | `string \| null` | `null` | The `value` of the selected option, two-way: `[(selectedValue)]="month"`. Shows the matching option's label (from `options`, or the current selection); unknown → empty, filled in when `options` arrive. Page writes never emit; every user choice or clear emits (`selectedValueChange`), next to the unchanged `valueChange` (option object). Single mode only (ignored with `multiple`, dev warning). Use it or a forms binding, not both. |
| input | number-input | `locale` | `string` | `''` | BCP 47 locale of the shown number. `''`: a point, as before. Only the decimal separator follows the locale (`de-DE` „7,5“; separators other than `,`/`.` fall back to `.`); no grouping. Typing accepts `,` and `.` in every locale and shows the locale's separator; the model stays a `number`; blur clamps to `min`/`max`. |
| input | number-input | `suffix` | `string` | `''` | Unit shown after the value inside the field („7,5 %“). Not typed, not in the model; with a suffix the value aligns to the end. |
| input | number-input | `suffixAriaLabel` | `string` | `''` | Spoken unit („Prozent“), read once after the value as the field's description. `''` = `suffix`. |
| input | number-input | `size` | `NumberInputSize` | `'md'` | Height of field and steppers: `xs` 24, `sm` 32, `md` 40 (as before), `lg` 44 px (touch). |
| type | number-input | `NumberInputSize` | `'xs' \| 'sm' \| 'md' \| 'lg'` | — | exported |
| input | money | `rangeToMinor` | `number \| null \| undefined` | `undefined` | Upper amount of a range in minor units (same `currency`, `locale`, `signDisplay`, `showCurrency`): „9,99 € bis 12,99 €“, read once („9,99 Euro bis 12,99 Euro“). Rendered as given (no sorting; equal values show a range). Not a safe integer: dev warning, single amount. |
| input | money | `rangeSeparatorLabel` | `string` | `''` | Word between the amounts, shown and spoken. `''`: from the locale, `de` → „bis“, everything else → "to". |
| function | money | `formatMoneyRange(fromMinor, toMinor, currency, options?)` | `MoneyText \| null` | — | Range text for table `formatter`s: `text` „9,99 € bis 12,99 €“, `spoken`; `null` if either amount fails `formatMoney`. |
| type | money | `MoneyRangeFormatOptions` | `MoneyFormatOptions & { separatorLabel?: string }` | — | exported |
| input | card | `footerLayout` | `CardFooterLayout` | `'default'` | `'equal'`: the `[card-footer]` children share the row at equal width (≥ 480 px card width), stacked full width 8 px apart below. Put `lc-button variant="outline" size="lg" [fullWidth]="true"` in it (primary answer first); the card adds layout only. The card becomes a size container and takes its parent's full width. |
| type | card | `CardFooterLayout` | `'default' \| 'equal'` | — | exported |
| host class | card | `lc-card--footer-equal` | — | absent | Only with `equal`; in the prerendered HTML (AC-31). |

No new CSS hooks and no new tokens. **Default rendering unchanged:** card, number-input and datepicker add classes only for non-default values (`lc-card--footer-equal`, `number-input--xs|sm|lg`, `lc-datepicker-calendar--month`); new attributes are `[attr.*]` bindings that are `null` by default; the stepper icons bind `[size]` to the same `'sm'`. New `@if` blocks add invisible `<!---->` anchors only: money 1 (`@if (range()) {…} @else if (formatted()) {…}`; the compat regex already allows comments, check-angular-majors l. 321), number-input 2 (visible suffix, spoken unit), the datepicker panel 2 (`@if month {grid} @else {weekdays + days}`). Elements, attributes and text stay equal. Combobox: no template change.
**Change note (review r1, 2026-11-04, build deviation 1 accepted):** the bound `[size]` drops the static `size="sm"` host attribute of the two stepper `lc-icon`s (Angular sets no attribute for a property binding). No kit selector reads `lc-icon[size]` (grep), icons and the 216 baseline shots are identical; the changelog names it under Compatibility.

## 3. Anatomy and layout

### 360 px (≙ 1280: the panel, field and footer rows are content-sized; values measured)

```
Datepicker month (panel 310 wide like day mode: border 1, padding 16, content 276; height 350)
┌──────────────────────────────────────┐
│ [‹]          2026           [›]      │ nav 44×44 (month mode), title 16/24 600, header 44, mb 16
│          [ Dieser Monat ]            │ min-height 44, 14/500, mb 12
│ [ Januar ] [ Februar ] [  März   ]   │ 3 cols (276−2·8)/3 = 86.67, rows 44, gap 8 / 8
│ [  April ] [   Mai   ] [  Juni   ]   │ 4 rows = 200 px
│ [ ■Juli■ ] [ August  ] [September]   │ widest name 74.6 (EN/DE), 78.3 (pl) at 14/600
│ [ Oktober] [ November] [ Dezember]   │
└──────────────────────────────────────┘
Number-input lg + suffix: [−44│   7,5 %│+44]  control 190.63 × 46: 1+44+72+28.63+44+1
  input 72×44 (stretch, 18 px, end-aligned, pad-end 0); suffix pad 0.25em/0.5rem → ink gap 4.5 px
Money range in 160 px:  1.234,56 €        (81.42, nowrap)
                        bis 12.345,67 €   (91.19), line 24, scrollWidth 160
Card equal (card 328, footer 294 at x 33): divider, 12, [ Stimmt 294×48.5 ], 8, [ Kein Vertrag 294×48.5 ]
```

### 768 / 1024 / 1280 px (card ≥ 480 px)

```
┌ card 736 | 992 | 1248 ─────────────────────────────────────┐
│ …                                                          │
│ ─────────────────────────────────────────────── divider     │
│ [        Stimmt  347 | 475 | 603        ] 8 [  Kein Vertrag  ] │ 48.5 high
└────────────────────────────────────────────────────────────┘
480 px card, long DE label: columns 219 / 219; „Das ist kein Vertrag für mich“ wraps, both buttons 71 high
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Month grid | `inline-size: 17.25rem; max-inline-size: calc(100vw - 4.125rem)`; rows `display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-2)`; column of rows gap `--spacing-2` | — | — |
| Month cell | `min-height: 2.75rem`, `padding: 0 var(--spacing-1)`, centred, `overflow-wrap: anywhere; hyphens: auto` | 14 / 21, 400 (selected, current 600) | `--font-size-sm`, `--border-radius-md` |
| Month nav / quick action | `.lc-datepicker-calendar--month` only: nav 2.75rem square; quick action `min-height: 2.75rem` | as day mode | — |
| Number-input sizes | button = `--size-interactive-{xs,sm,lg}-height` (24/32/44) square; input width 3 / 3.5 / 4.5rem, `align-self: stretch`, font `--size-interactive-*-font-size` (12/14/18); icon `xs` (16) for xs/sm, `sm` (20) for md/lg. md: no class, today's rules (146 × 42, buttons 40, input 64 × 40) | — | — |
| Suffix | `padding-inline: 0.25em var(--spacing-2)`, `flex-shrink: 0`, `(mousedown)` focuses the input | field font | `--color-text-secondary` |
| Money range | `:host(.lc-money--range) { white-space: normal }`; `.lc-money__amount { white-space: nowrap }` (after the `:host` block: the spec reads the first block) | inherited, tabular | — |
| Card equal | `:host(.lc-card--footer-equal) { container: lc-card / inline-size; inline-size: 100% }`; `:host(.lc-card--footer-equal) > .card > ::ng-deep :is([card-footer], .card-footer) { display: grid; grid-template-columns: minmax(0, 1fr); align-items: stretch }`; `@container lc-card (width >= 30rem)` → `grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr)`; `… > lc-button > .btn { block-size: 100% }` (equal heights, prototyped 71/71 vs 48.5/71). Gap, margin, padding, divider: the default footer rule | — | `--lc-density-gap-sm` (8) |

The `> .card >` chain keeps nested cards' footers out. All layout values above except the month grid were prototyped in the stories (`tmp/story-shots/046/proto-*`).

## 4. States

| State | Month cell | Number-input | Money / card |
|---|---|---|---|
| default | text-primary, transparent | as today per size | — / outline buttons |
| hover | `--color-surface-hover` (not disabled) | buttons as today | buttons' own |
| focus-visible | 2 px `--color-primary-500`, offset 2 (room: gap 8) | existing field ring and inset stepper ring | button ring, 12 px room in md padding (`padding="none"` clips: documented) |
| selected | `--color-primary-fill`, `--color-on-primary`, 600 + `box-shadow: inset 0 0 0 2px var(--color-primary-500)` (D-8, dark fill/surface is 2.78) | — | — |
| current month | `--color-primary-600` on `--color-primary-50`, 600, `aria-current="date"` | — | — |
| disabled | `aria-disabled`, text-disabled, opacity .5, no hover, skipped by keys | as today | — |
| empty | no selection: tab stop on the current month (if in the year), else the first enabled | placeholder end-aligned with a suffix | — |
| error | field as today | as today | invalid `rangeToMinor` → single amount |
| overflow | 78.3 px pl names fit 78.67; longer wrap (`anywhere`); 200 % text: grid narrows to the viewport | long label wraps; control stays content-wide (D-5) | range wraps before „bis“; long DE button text wraps inside the button |

## 5. Theming

All pairs computed (WCAG formula in `--measure`, page canvas as base; `tmp/story-shots/046/proto-money`). No new tokens.

| Pair | Light | Dark |
|---|---|---|
| month text `--color-text-primary` / `--color-surface` | 17.74 | 15.85 |
| current `--color-primary-600` / `--color-primary-50` | 5.77 | 11.17 |
| selected `--color-on-primary` / `--color-primary-fill` | 6.21 | 6.21 |
| selected fill / surface (state boundary) | 6.21 | **2.78** → inset ring primary-500 / surface 4.37 / 9.13 |
| hover text / `--color-surface-hover` | 16.12 | 15.71 |
| focus ring primary-500 / surface | 4.37 | 9.13 |
| nav icons and quick action text (as day mode) | 7.56 / 6.21 | 11.16 / 10.81 |
| suffix `--color-text-secondary` / `--color-surface-2` | 7.23 | 9.26 |

Forced colours: month focus ring → `Highlight` (own outline); selected `forced-color-adjust: none; background: Highlight; color: HighlightText`; current `text-decoration: underline`; disabled `GrayText`.

## 6. Accessibility

- **Month grid:** `role="grid"` `aria-labelledby` = year title (`[attr.id]`, `aria-live="polite"` as today); 4 `role="row"`; 12 focusable `div role="gridcell"` (`aria-selected` is not allowed on `button`), `aria-label` = `Intl {month:'long', year:'numeric'}` („Juli 2026“; empty locale: "July 2026"), visible text `{month:'long'}` (label-in-name passes, the visible word is in the name). `aria-selected="true"` on the selected cell only (absent elsewhere, APG), `aria-current="date"`, `aria-disabled="true"`.
- **Keys (month):** field closed: ArrowDown/Enter/Space open and focus the grid; a click opens with focus kept in the field (typing „2026-07“ commits like day mode); ArrowDown from the open field focuses the grid. In the grid: ←/→ ±1 month, ↑/↓ ±3, PageUp/PageDown ±12 (view year follows), Home/End first/last enabled month of the year; keys skip disabled months (continue in the direction; PageUp/Down: nearest enabled month of that year; none → stay); Enter/Space/click select, emit, close, focus the field; Escape closes, focus to the field (`stopPropagation` as today). Tab: nav ‹ › → quick action → one grid stop (non-modal, as day mode). Arrows only move focus, never select.
- **Combobox:** unchanged roles; page writes are silent (no `valueChange`, no `onChange`).
- **Number-input:** visible suffix `aria-hidden="true"`; `<span hidden id="…-suffix">` with `suffixAriaLabel || suffix`, first id in `aria-describedby` (before helper/error) → "7,5, Anteil in %, … Prozent". lg: field 72 × 44 and steppers 44 × 44.
- **Money:** one `.lc-money__range` (`aria-hidden`, `dir` = locale) with two `.lc-money__amount` (`dir` isolates) and the joint text; one spoken span. Separate the element from adjacent text with a space (as today).
- **Card:** buttons keep their semantics and order (primary first = DOM first); link cards: the existing `:where(.card-linked … button …)` lift keeps them above the overlay.
- Reduced motion: no new transition (the panel's existing one).
- **Change note (review r1, 2026-11-04, build deviation 2 accepted):** month mode, Enter in the open field closes the panel when a month is selected and emits nothing (the month is already committed by the grid or by typing; day mode's re-commit would emit a duplicate); no selection → nothing. §6 had left this key open.

## 7. Texts

| Input / string | EN default | DE (stories) | Fit at 360 |
|---|---|---|---|
| `previousYearAriaLabel` / `nextYearAriaLabel` | Previous year / Next year | Vorheriges Jahr / Nächstes Jahr | names only |
| `monthDialogAriaLabel` | Choose month | Monat wählen | name only |
| `currentMonthLabel` | This month | Dieser Monat | button in 276 px |
| `placeholder` (story) | Select a month | Monat wählen | field 328 |
| `suffix` / `suffixAriaLabel` | '' / '' | % / Prozent | 190.63 control |
| `rangeSeparatorLabel` | '' → to | bis | — |
| Combobox story | Reset · Set to September · Value: | Zurücksetzen · Auf September setzen · Wert: | 2 buttons wrap |
| Card story | Looks right · Not a contract | Stimmt · Kein Vertrag (+ „Das ist kein Vertrag für mich“ in the 480 px card) | 294 stacked |

Number-input steppers keep `decrementAriaLabel`/`incrementAriaLabel`; DE stories set „Wert verringern“ / „Wert erhöhen“.

## 8. Stories

Every story DE where stated sets `lang="de"` and every visible built-in string. Panels open through `play` in `viewMode === 'story'`.

| Story (export) | Expected ID | Args / content | Shows (AC) |
|---|---|---|---|
| `Month` | `form-datepicker--month` | `granularity="month" format="YYYY-MM" placeholder="Select a month"`, value 2026-07, open | grid, selected July, year nav (AC-2, 6, 7) |
| `MonthDe` ('Month DE') | `form-datepicker--month-de` | `locale="de-DE"`, all four DE labels, `minDate` 2026-03-01, `maxDate` 2027-02-28, value 2026-07, open | „Juli 2026“, Jan/Feb disabled, year buttons (AC-5, 7) |
| `StartsWithAChoice` | `form-combobox--starts-with-a-choice` | 12 options `2026-01…12` / „Januar 2026…“, `[(selectedValue)]` = `'2026-07'`, buttons Zurücksetzen / Auf September setzen, `Wert: …` line | AC-12 |
| `LocaleDeWithSuffix` ('Locale DE with suffix %') | `form-number-input--locale-de-with-suffix` | `locale="de-DE" suffix="%" suffixAriaLabel="Prozent" size="lg" [step]="0.5"`, `ngModel` 7.5; second field label „Anteil an den Gesamtkosten in Prozent“ | AC-13, 15, 18 |
| `Sizes` | `form-number-input--sizes` | xs, sm, md, lg; EN row and DE row (`locale="de-DE"`, value 7.5) | AC-16, 18 |
| `Range` | `data-display-money--range` | en-US „€9.99 to €12.99“, de-DE „9,99 € bis 12,99 €“, fr-FR (to), negative, he-IL ILS, 160 px box with 123456 → 1234567 | AC-19…23, 25 |
| `EqualFooter` | `components-card--equal-footer` | outlined `borderRadius="xl"` card, EN, two outline lg fullWidth buttons | AC-26…28 |
| `EqualFooterGerman` | `components-card--equal-footer-german` | full-width DE card + a `max-width: 480px` card with „Ja, das stimmt“ / „Das ist kein Vertrag für mich“ | AC-30 |
| `EqualFooterLinkCard` | `components-card--equal-footer-link-card` | `href` card, DE, footer buttons | AC-29 |

argTypes with `description` and `table.defaultValue` for every new input (AC-32).

## 9. Verification

Baselines (unchanged stories, main f76e9cb): `tmp/story-shots/046/baseline` = all 53 stories of the five components, 360/1280 L/D, 212 shots, `--measure='new Promise(r => setTimeout(r, 800)).then(() => 1)'`; `baseline-open` = `form-datepicker--default` opened (measure clicks `lc-datepicker input`, waits 800 ms, returns 42 day cells), 4 shots. Expected: all identical.

| AC | How | Expected |
|---|---|---|
| 1, 11, 24, 26 | existing specs untouched; baseline compare | 216/216 identical |
| 2–5 | unit: month grid text, `dateChange` = `new Date(2026, 6, 1)`, `writeValue('2026-07' / Date / null)`, key table §6, min/max/disabledDates | as §2/§6 |
| 4, 6 | `Month`, `MonthDe` 360/1024/1280 L/D + `--axe` + `--forced-colors` | cells ≥ 86.67 × 44, nav 44, panel 310 × 350 at x 16, scrollWidth = viewport, axe 0 new |
| 8–10 | unit: initial label, late `options`, page set/null silent, user pick emits both, `[(selectedValue)]` host test, CVA spec untouched | — |
| 13, 14 | unit: „7,5“ typed/blur/step in de-DE, „7.5“ en-US, `writeValue(7.5)`, `-0,5`, step precision | — |
| 15 | unit + `--measure` AX description | name label, description „Prozent“; visible „7,5 %“ |
| 16, 18 | `Sizes` 360/1280 `--measure` | lg buttons 44 × 44, input 72 × 44; md 146 × 42 as baseline |
| 19–23 | unit (DE, EN, fr-FR fallback, RTL `dir`, invalid → single + warning, equal) | „9,99 € bis 12,99 €“, spoken „9,99 Euro bis 12,99 Euro“ |
| 22 | `Range` 360 `--measure` on the 160 px box | 2 lines, amount tops differ by 24, scrollWidth 160 |
| 27–30 | `EqualFooter*` at 360/768/1024/1280 | 360: 294 × 48.5 stacked, gap 8; ≥ 768: two equal columns, gap 8; 480 card: 219/219, heights equal |
| 29 | unit: footer button `elementFromPoint` above `.card__link::after` | the button |
| 31 | compat template card `footerLayout="equal"` + `EXPECT_IN_HTML` `lc-card--footer-equal` | present in prerendered HTML |
| 32–35 | `npm run test:tools`, manifest, gates, changelog | listed |

**Known / follow-ups (for release.md):** pre-existing, not changed here (ADR-0009): day-mode panel targets nav 32 px, today 31 px, day cells 36 px (AA 2.5.8 passes, kit 44 px rule not) → backlog; day-mode selected fill vs dark surface **2.78:1** (WCAG 1.4.11) → should-fix, queue. Month names at 200 % text break inside the word in the narrowed grid. Risks named from memory: control-flow anchors (045 r1), `container-type` raster only on equal cards (018 r1), `indexOf` spec pins (041), FC rings need `Highlight` (037 r1), no `aria-selected` on `button`.
