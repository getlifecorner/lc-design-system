# Spec 046: Month datepicker, combobox value, number-input locale/suffix/size, money range, card equal footer

- **Status:** ready
- **Type:** extension of `lc-datepicker`, `lc-combobox`, `lc-number-input`, `lc-money`, `lc-card` (5 components, 6 items)
- **Affected:** `lib/datepicker/`, `lib/combobox/`, `lib/number-input/`, `lib/money/` (+ `money-format.ts`), `lib/card/`; their stories and specs; CHANGELOG; `tools/compat` only if a prerender check is added
- **Semver impact:** minor. Only optional inputs, defaults render as before. One trap (see Assumption A-2): `[(value)]` on `lc-combobox` must not change the type of the existing `valueChange`.

Backlog: no rows on these components.

## Need

**finance-intelligence, rules page (regeln-2026-11-03, ADR-0009: functions only, no look change).** The form is a bottom sheet on phones and a dialog from 640 px.

- Row 1: "Gilt ab" is a month (`YYYY-MM`); `lc-datepicker` only picks days, which suggests the day matters.
- Row 2: `lc-combobox` cannot start with the current choice or be reset by the page.
- Row 3: the number field's decimal handling and unit are unclear; they need "7,5 %".
- Row 4: the number field and its buttons are 40 px (2.5rem); their rule is 44 px (ADR-0006, WCAG 2.2 2.5.8).

**life-os, contract discovery (spec 005, CC-1, CC-2; kit first, owner decision 2026-11-04).** Candidate cards and the candidate page (boards 1, 2, 3, 13, 14, 18-22).

- CC-1: a varying series amount needs "9,99 € bis 12,99 €" in one element with one spoken reading; today two `lc-money` plus a hand-made word.
- CC-2: a card footer with two answers of equal weight ("Stimmt" / "Kein Vertrag") needs app CSS; `lc-next-step-card` has `actionsStyle="equal"`, `lc-card` has nothing.

## What the kit has today

| Item | Today | Gap |
|---|---|---|
| Datepicker | `format` (default `YYYY-MM-DD`), `locale`, month names via `Intl`, `dateChange: Date \| null`, CVA | No month-only grid |
| Combobox | `valueChange: ComboboxValue` (option object(s)); CVA `writeValue` takes option objects; no `value` input | No input that takes an option's `value` string |
| Number-input | Typing: `,` is already accepted and turned into `.` (`sanitizeNumericText`); display is `String(val)` (always `.`); buttons 2.5rem, input 4rem wide; no `size`, `locale`, `suffix` | Display/locale, unit, size |
| Money | `amountMinor`, `currency`, `locale`, `signDisplay`, `showCurrency`; visible amount `aria-hidden`, spoken span | No second amount |
| Card | `[card-footer]` slot: right-aligned flex row, divider | No layout for two equal answers |

## Scope

- In: items 1-6 below, stories, MCP-visible JSDoc with `@default`, README/CHANGELOG mentions.
- Not in: any look change (tokens, colours, radii) to existing defaults; changing the blur clamp of `lc-number-input` (documented, stays; only state it in the docs); combobox `multiple` two-way value (single mode only); loading unknown values from `loadOptions` by value; a range for `lc-datepicker`; a footer layout other than `equal`; changing `lc-next-step-card`.

## Acceptance criteria

### Item 1: finance-intelligence row 1, `lc-datepicker` month granularity

| ID | Criterion | Verified by |
|---|---|---|
| AC-1 | New input `granularity: 'day' \| 'month'`, default `'day'`; exported union type; with `'day'` all existing specs and stories pass unchanged | unit test, existing spec untouched |
| AC-2 | `granularity="month" format="YYYY-MM"`: field shows "2026-07"; popup shows twelve months of the year with previous/next-year buttons (labels are inputs, EN/DE defaults verified); month names follow `locale` | unit test + story |
| AC-3 | Choosing a month emits `dateChange` with `Date` 2026-07-01 (local midnight, same convention as day mode); CVA `onChange` the same; `writeValue('2026-07')`, a `Date` and `null` show the month or empty | unit test |
| AC-4 | Keyboard in the month grid: arrows move by month (left/right) and by row (up/down), PageUp/PageDown move by year, Home/End first/last month of the year, Enter/Space select, Escape closes with focus back on the field; roving focus, `aria-selected`/`aria-current` on selected/current month, name read by a screen reader ("July 2026") | unit test + axe |
| AC-5 | `minDate`/`maxDate`/`disabledDates` disable months that are fully outside the range; disabled months are not focus targets for selection | unit test |
| AC-6 | Month cells are at least 44 x 44 px at 360 px; popup fits 360 px without horizontal overflow; light/dark, `forced-colors`, `prefers-reduced-motion` | story at 360/1024, `--measure`, axe |
| AC-7 | Story "Month" (EN) and "Month DE" (`locale="de-DE"`, "Juli 2026" in the popup, year navigation) | stories |

### Item 2: finance-intelligence row 2, `lc-combobox` value

| ID | Criterion | Verified by |
|---|---|---|
| AC-8 | A new optional input/model takes the `value` string of an option (`string \| null`, default `null`) and shows that option's label on first render, also with `options` set later; unknown value shows empty | unit test |
| AC-9 | Setting it again from the page (including back to `null`) selects/clears and updates the field; every user choice or clear emits the new value | unit test |
| AC-10 | The existing `valueChange` keeps its type and emissions (`ComboboxValue`); a `[(…)]` binding works with the new name (Assumption A-2); forms binding (CVA) unaffected | unit test, existing spec untouched |
| AC-11 | Without the new input nothing changes (starts empty, same DOM) | existing specs |
| AC-12 | Story "Starts with a choice" with a month list ("2026-07" / "Juli 2026") and a reset button | story |

### Item 3: finance-intelligence rows 3 and 4, `lc-number-input`

| ID | Criterion | Verified by |
|---|---|---|
| AC-13 | New input `locale` (default `''` = today's behaviour, point display). With `de-DE`: typing "7,5" gives 7.5, field shows "7,5" after blur and after stepping; with `en-US` "7.5". Typing with either separator keeps working in every locale (as today) | unit test |
| AC-14 | Model value stays a `number`; `writeValue(7.5)` with `de-DE` shows "7,5"; no thousands separator in the field; negative values and `step` precision unchanged | unit test |
| AC-15 | New input `suffix` (default `''`): shown after the value in the field's visible text ("7,5 %"), not part of the model and not typed by the user; a screen reader reads value and unit once ("7,5 Prozent" with the spoken text from a second input `suffixAriaLabel`, default = `suffix`) | unit test + story with screen-reader text check |
| AC-16 | New input `size: 'xs' \| 'sm' \| 'md' \| 'lg'` like `lc-input`, default = today's look. `lg`: field and both buttons at least 44 x 44 px at 360 and 1280 px; `md` renders exactly as before | story at 360/1280, `--measure`, existing specs |
| AC-17 | JSDoc and docs state: comma and point are both accepted, the display follows `locale`, blur clamps to `min`/`max` | JSDoc + MCP manifest |
| AC-18 | Stories: "Locale DE with suffix %" and "Sizes" (all four, EN and DE labels); suffix/long label fit at 360 px without overflow; light/dark; focus ring visible on field and buttons | stories, axe |

### Item 4: life-os CC-1, `lc-money` range

| ID | Criterion | Verified by |
|---|---|---|
| AC-19 | New optional input `rangeToMinor` (safe integer, same `currency`/`locale`/`signDisplay`/`showCurrency`). Visible: "9,99 € bis 12,99 €" (`de-DE`), "€9.99 to €12.99" (`en-US`) | unit test |
| AC-20 | One spoken reading in one span, "9,99 Euro bis 12,99 Euro"; the visible text is `aria-hidden` as today; the screen reader reads the range once | unit test |
| AC-21 | The joining word comes from a new input `rangeSeparatorLabel`, default from `locale` (DE "bis", EN "to", other locales EN "to"); the visible and the spoken word are the same input | unit test (DE, EN, `fr-FR` fallback) |
| AC-22 | Tabular figures on both amounts; may wrap between the amounts, never inside one (no-break kept); 360 px with `de-DE` 1.234,56 € bis 12.345,67 € in a 160 px wrapper wraps without overflow | story + `--measure` |
| AC-23 | RTL locale: each amount stays a `dir` isolate; invalid or equal `rangeToMinor`: not safe integer renders a dev warning and the single amount; equal values render the range as given | unit test |
| AC-24 | Without `rangeToMinor` DOM and specs unchanged; `formatMoney` stays the same; if a range helper is exported, it is documented for table formatters | existing specs |
| AC-25 | Story "Range" EN and DE | story |

### Item 5: life-os CC-2, `lc-card` equal footer

| ID | Criterion | Verified by |
|---|---|---|
| AC-26 | New input `footerLayout: 'default' \| 'equal'`, default `'default'`; exported union type; `default` is today's flex row | unit test, existing specs |
| AC-27 | `equal`: the `[card-footer]` slot lays out two children of equal width; stacked full width, 8 px apart, below 480 px card width (container query on the card, not the viewport), side by side from 1024 px viewport... see A-3 for 480 to 1023 px | story + `--measure` at 360/768/1024/1280 |
| AC-28 | Buttons in the footer are not restyled by the card: the app puts `lc-button variant="outline" size="lg" fullWidth` (documented in the story and JSDoc); each target 44 px high; focus ring not clipped | story + measure |
| AC-29 | Works inside link cards (`href`/`route`): footer buttons stay clickable above the overlay; divider and spacing as `default` | unit test + story |
| AC-30 | German button texts ("Kein Vertrag", longer) fit stacked at 360 px without clipping; in a side-by-side layout long text wraps inside the button | story DE |
| AC-31 | Prerendered HTML: the layout is CSS only, so it holds before JavaScript; the host class for `equal` is in the prerendered markup | `check-angular-majors` EXPECT_IN_HTML or SSR test |

### Bundle-wide

| ID | Criterion | Verified by |
|---|---|---|
| AC-32 | All new inputs have JSDoc with `@default`, argType `description` and `table.defaultValue`; the MCP manifest lists them | `npm run test:tools`, manifest |
| AC-33 | Light and dark: no new colours; any new text/boundary pair is a token with computed contrast (4.5:1 text, 3:1 boundary) | `theme-contrast.spec.ts` if tokens are added |
| AC-34 | Full unit suite, lint, production build and the Angular 21/22 compat check pass; no existing assertion is changed | gates |
| AC-35 | CHANGELOG (Added; Compatibility: no API break) names the gap IDs and the consumers' pages; README component list unchanged unless a component is added | review |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency (use `Intl`), no API break.
- ADR-0009 (finance-intelligence): no look change for existing defaults.

## Assumptions

- Assumption A-1: Typing a comma already works in `lc-number-input` (`sanitizeNumericText`), so row 3 needs the `locale` display and `suffix`, plus the documentation. The blur clamp stays.
- Assumption A-2: `valueChange` of `lc-combobox` emits option objects, so `[(value)]` with `valueChange` as the output cannot be added without a break. The designer picks the name of the new two-way input (for example `selectedValue` with `selectedValueChange`) and records it in `design.md`; the requester's `value`/`[(value)]` wish is met in function, not in name. Not an owner question (minor, no break).
- Assumption A-3: CC-2 asks "side by side from 1024 px"; between 480 and 1023 px the designer decides (recommended: side by side as soon as the card is 480 px wide, which also holds for 1024 px viewports). If the designer follows the requester literally, AC-27 is adjusted by a change note.
- Assumption A-4: Month mode emits the first day of the month in local time, like day mode.
- Assumption A-5: `suffix` is not part of the model or the CVA value.
- Assumption A-6: Equal range values are rendered as given.

## Open questions

None.

## Resolution

Not applicable: none of the six items is covered by the kit today.
