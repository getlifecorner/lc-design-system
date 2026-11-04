# Build 046: Month datepicker, combobox value, number-input locale/suffix/size, money range, card equal footer

- **Branch:** `feat/3.29-inputs-money-range-card-footer`
- **Commit:** `feat(inputs): month datepicker, combobox selectedValue, number-input locale/suffix/size, money range, card equal footer (046)` (one commit, amended)

## Files changed

| File | Change |
|---|---|
| `lib/datepicker/datepicker.component.{ts,html,scss}` | `granularity` (`DatepickerGranularity`), `previousYearAriaLabel`, `nextYearAriaLabel`, `monthDialogAriaLabel`, `currentMonthLabel`; month grid (`role=grid`, 4 rows, 12 `gridcell`s, roving tab stop reset on open, §6 keys), month parse/format (`YYYY-MM`, `DD` → 01), `isMonthDisabled`; `.lc-datepicker-calendar--month` 44 px nav/quick action, cell states, D-8 inset ring, forced colours |
| `lib/combobox/combobox.component.ts` | `selectedValue = model<string \| null>(null)`; an effect applies page writes silently and fills a pending value in when `options` arrive; user choice/clear also emit it; class JSDoc example `[(selectedValue)]` |
| `lib/number-input/number-input.component.{ts,html,scss}` | `locale` (separator only, typing shows the locale's), `suffix` + `suffixAriaLabel` (visible `aria-hidden` unit, `mousedown` focuses the field; hidden description first in `aria-describedby`), `size` (`NumberInputSize`; `--xs/--sm/--lg`, md no class), D-5 `align-self: flex-start`; value end-aligned via `:has(.number-input__suffix)` |
| `lib/money/{money-format.ts,money.component.ts,money.component.scss,index.ts}` | public `formatMoneyRange` + `MoneyRangeFormatOptions`; `rangeToMinor`, `rangeSeparatorLabel`; `.lc-money__range` (aria-hidden, `dir`) with two `dir` amounts, word glued by U+00A0; host class `lc-money--range` (`white-space: normal`), amounts `nowrap` |
| `lib/card/card.component.{ts,scss}` | `footerLayout` (`CardFooterLayout`), host class `lc-card--footer-equal`, container `lc-card`, grid, `@container lc-card (width >= 30rem)`, `> lc-button > .btn { block-size: 100% }` |
| 5 × `*.stories.ts` | the 9 stories of §8 (IDs as designed) + argTypes with description and default for all 13 new inputs |
| 5 new specs | `datepicker.month` 28, `number-input.locale-size` 23, `money.range` 17, `card.footer-layout` 11, `combobox.selected-value` 10 (89 tests); no existing spec or assertion changed |
| `tools/compat/…/probe-329.ts`, `home.{ts,html}`, `check-angular-majors.mjs` | equal-footer card prerendered; `EXPECT_IN_HTML` "card: equal footer class, footer and container query before JS" |

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1, 11, 24, 26 | existing specs untouched and green; default-render proofs (below); "day mode unchanged", "without a range", "defaults" tests; 216/216 baseline shots identical |
| 2–5 | `datepicker.month.spec` (panel, value, keyboard §6, min/max/disabledDates) |
| 6, 7 | `Month`, `MonthDe` at 360/768/1024/1280 L/D: panel 310 × 350 at x 16, cells ≥ 86.66 × 44, nav 44 × 44, "This month" 44 high, `scrollWidth` = viewport; forced colours: selected `Highlight`/`HighlightText`, current underlined, disabled `GrayText` |
| 8–12 | `combobox.selected-value.spec`; `StartsWithAChoice` shows „Juli 2026“, „Wert: 2026-07“ |
| 13–15, 17 | `number-input.locale-size.spec`; `LocaleDeWithSuffix`: „7,5“ + „%“, description „Prozent“, ink gap 4.5 px, suffix 7.23:1 |
| 16, 18 | `Sizes`: xs 98 × 26 (24 steppers), sm 122 × 34 (32), md 146 × 42 (as 3.28), lg 162 × 46 (44 × 44 steppers, field 72 × 44); suffix lg 190.63 × 46; no overflow at 360 |
| 19–23, 25 | `money.range.spec`; `Range`: en-US „€9.99 to €12.99“, de-DE „9,99 € bis 12,99 €“, fr-FR „to“, he-IL `dir=rtl`; 160 px box: 2 lines, amount tops +24 px, `scrollWidth` 160 |
| 27–30 | `card.footer-layout.spec`; `EqualFooter*`: 360 stacked 294 × 48.5, gap 8; 768/1024/1280 columns 347/475/603, gap 8; 480 px card 219/219, both 71 high (long label wraps); link card: both button centres hit the button, the body hits `card__link`; divider 1 px, 12/16 px as default |
| 31 | compat: `<lc-card … footerlayout="equal" class="lc-card--footer-equal">` + container query in the prerendered page |
| 32 | JSDoc `@default` on every new input; argTypes; `test:tools` 22/22 |
| 33 | no new colour or token; contrast as design §5 (selected text 6.21, dark fill 2.78 + ring, current 5.77/11.17, text 17.74/15.85) |
| 34, 35 | gates below; changelog draft below; README lists unchanged (no new component) |

**Default-render proofs** (temp specs, removed; `tmp/046/proof.txt`): datepicker 3.28 vs 3.29 template, 5 input sets, closed and open in day mode: normalized DOM identical (comments aside). Number-input, 5 input sets: identical except the two stepper `lc-icon`s, which lose the static host attribute `size="sm"` (deviation 1). Money: pinned in `money.range.spec`. Card: no template change; the host gets no attribute or class by default (pinned).

## Gates

All gates ran on commit `226c56d5decab90907609597a6c894e4306594f0` (later agents skip a gate while `git diff --quiet 226c56d5 -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 239 suites, 5602 passed, 8 skipped (+5 suites, +89 tests). `--runInBand` printed no Jest output twice; `--maxWorkers=2 --verbose` ran clean |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | 122 "Built", success |
| `npm run test:tools` | 22/22 |
| `npx nx run angular-ui-kit:build-storybook` | success, 1050 stories (+9) |
| Story screenshots | new: `tmp/story-shots/046/new` (9 stories × 360/768/1024/1280 × L/D = 72, `--measure`, `--axe`); baseline compare: `cmp-a`, `cmp-b`, `cmp-c` 212/212 and `cmp-open` 4/4 identical; `recheck` 12/12 identical on the gate build; `forced` (MonthDe) |
| `node tools/compat/check-angular-majors.mjs --only=22` | PASS, 98 HTML checks (+1) |

axe: 56 of 72 new shots clean; the 16 `Month`/`MonthDe` shots report `target-size` on `.lc-datepicker-clear` only. Pre-existing: the day-mode `Default` story with a typed date reports the same (`tmp/story-shots/046/day-clear`); the new stories are the first with a value, so the 20 px clear button shows.

## Deviations from the design

1. Number-input steppers: binding `[size]` (design §2) drops the static `size="sm"` host attribute of the two `lc-icon`s; §2 assumed attributes stay equal. Nothing reads it (no kit CSS, compat check or spec); icons and shots identical. Designer to confirm.
2. Month mode, Enter in the open field (not in §6): closes the panel when a month is selected and emits nothing (day mode re-commits the date).

**Findings for routing (not fixed here):** `lc-datepicker` clear button 20 × 20 px, axe `target-size` (WCAG 2.5.8), both modes, pre-existing → should-fix, queue. Design §9 Known: day-mode targets (nav 32, today 31, days 36 px) → backlog; day-mode selected fill 2.78:1 on dark → should-fix, queue.

## Changelog draft

### Added

- **`lc-datepicker` `granularity="month"`** (finance-intelligence rules page "Gilt ab", regeln row 1; type `DatepickerGranularity`): picks a month, so the day no longer seems to matter. A 3 × 4 month grid in the same 310 × 350 px panel as the day calendar (fits 360 px), with the year, previous/next-year buttons and a "This month" quick action, all 44 px; months 86.67 × 44 px, named with their year („Juli 2026“, `locale`). `dateChange` and the forms value are the 1st of the month at local midnight; `format="YYYY-MM"` shows „2026-07“, and typing „2026-07“ commits. Keyboard: arrows by month and row, PageUp/PageDown by year, Home/End, Enter/Space select, Escape closes; one tab stop. `minDate`/`maxDate` keep a month with any day in range; a `disabledDates` entry disables its month. The selected month has a 2 px inset ring besides the fill (the fill is 2.78:1 on the dark surface). New labels `previousYearAriaLabel`, `nextYearAriaLabel`, `monthDialogAriaLabel`, `currentMonthLabel`. Stories *Month*, *Month DE*.
- **`lc-combobox` `[(selectedValue)]`** (regeln row 2): the `value` string of the chosen option, two-way. The field starts with that option's label, also when `options` arrive later; the page sets or resets it (also to `null`) without events; each user choice or clear emits `selectedValueChange`, next to the unchanged `valueChange`. Single mode. Story *Starts with a choice*.
- **`lc-number-input` `locale`, `suffix`, `suffixAriaLabel`, `size`** (regeln rows 3 and 4; type `NumberInputSize`): `locale="de-DE"` shows „7,5“ (typing accepts `,` and `.` in every locale; the model stays a number; blur clamps to `min`/`max`). `suffix="%"` shows „7,5 %“ (not typed, not in the model), read once as „Prozent“ with `suffixAriaLabel`. `size`: xs 24, sm 32, md 40 (default, unchanged), lg 44 px: field 72 × 44 and both steppers 44 × 44. Stories *Locale DE with suffix %*, *Sizes*.
- **`lc-money` `rangeToMinor`, `rangeSeparatorLabel` and `formatMoneyRange()`** (life-os contract candidates, CC-1; type `MoneyRangeFormatOptions`): „9,99 € bis 12,99 €“ / "€9.99 to €12.99" in one element, read once („9,99 Euro bis 12,99 Euro“); the word comes from the locale („bis“ for German, "to" otherwise) or the input. The range wraps only before the word, never inside an amount (160 px: two lines, no overflow); each amount stays a `dir` isolate. Shown as given; an invalid `rangeToMinor` shows the single amount with a dev warning. Story *Range*.
- **`lc-card` `footerLayout="equal"`** (life-os contract discovery, CC-2; type `CardFooterLayout`): two answers of equal weight in `[card-footer]` get the same width: stacked full width 8 px apart below a 480 px card, side by side from 480 px (the card's width, any viewport: 347/475/603 px columns in 768/1024/1280 px pages). With `lc-button variant="outline" size="lg" [fullWidth]="true"` they are 48.5 px high; a long German label wraps inside its button and both take the row's height. Buttons stay clickable in link cards; CSS only, also in prerendered HTML. Stories *Equal Footer*, *(German)*, *(link card)*.

### Compatibility

- New optional inputs, a model, types and a function only; no API breaks. Defaults render as in 3.28: 216/216 at-rest shots of the five components' stories and the open day calendar are hash-identical. DOM: comment anchors only (money, number-input, datepicker panel); the number-input stepper icons lose a static `size="sm"` host attribute (same icons).
- A number-input control under a label wider than itself now stays content-wide (was stretched to the label's width).
- `footerLayout="equal"` makes the card a size container that takes its parent's full width.
- Checked on Angular 22 (AOT, strictTemplates, prerender).

### Known

- The datepicker clear button is 20 × 20 px (axe `target-size`), in day and month mode; day-mode panel targets and the selected day's dark fill are unchanged.
