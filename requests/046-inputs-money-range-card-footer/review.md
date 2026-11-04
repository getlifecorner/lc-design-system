# Review 046: Month datepicker, combobox value, number-input locale/suffix/size, money range, card equal footer

## Round 1 — 2026-11-04, commit c1f0efb

Screenshots: `tmp/story-shots/046/new` (developer, 9 stories × 360/768/1024/1280 × L/D, `--measure`, `--axe`, log `tmp/046/new.log`), `forced` (MonthDe). Review runs in `tmp/story-shots/046/review/`: `dp.log` (month focus, keys, hover contrast), `ni.log` (AX name/description, focus rings), `card.log` (footer rings, clip), `axe.log` (the axe `incomplete`), compares `r1-a.log`, `r1-b.log`, `r1-open.log`. Storybook build of 14:33 = libs of the gate commit 226c56d5 (`git diff --quiet` holds). 11 shots opened.

| AC | Result | Evidence |
|---|---|---|
| AC-1, 11, 24, 26 | pass | Baseline compare `r1-a` 104/104 + `r1-b` 108/108 (all 53 stories of the five components, 360/1280 L/D) + `r1-open` 4/4 identical; existing specs untouched (build.md) |
| AC-2 | pass | `Month`: field „2026-07“, title 2026, 12 cells, year buttons „Previous year“/„Next year“, DE „Vorheriges Jahr“/„Nächstes Jahr“, names follow `locale` (`new.log`) |
| AC-3 | pass | `datepicker.month.spec` (build.md) |
| AC-4 | pass | `dp.log`: grid labelled by the year title, 4 rows, 12 gridcells, 1 `aria-selected`, 1 `aria-current`; tab order ‹ › quick action, one grid stop („July 2026“); → moves to September with the tab stop; PageDown → 2027, PageUp → 2026; ring 2 px offset 2, `:focus-visible`, 4.37 L / 9.13 D; names „Juli 2026“. axe: only the pre-existing clear `target-size` (finding 1); the `aria-valid-attr-value` incomplete is the open field's `aria-controls` + `aria-haspopup`, and the id resolves |
| AC-5 | pass | `MonthDe` (min 2026-03-01, max 2027-02-28): Januar/Februar 2026 disabled; PageDown from September lands on Februar 2027 (10 disabled), PageUp from there on März 2026 |
| AC-6 | pass | 360–1280: panel 310 × 350 at x 16, cells ≥ 86.66 × 44, nav 44 × 44, quick action 44 high, `scrollWidth` = viewport; forced colours: selected Highlight/HighlightText, current underlined, disabled GrayText (shot opened); no new transition |
| AC-7 | pass | Stories `form-datepicker--month`, `--month-de` (shots 360 L, 360 D, 1280 D opened) |
| AC-8–10 | pass | `combobox.selected-value.spec` (build.md); API = §2 (`model<string \| null>(null)`, JSDoc `@default null`) |
| AC-12 | pass | `StartsWithAChoice` 360/1280: field „Juli 2026“, „Wert: 2026-07“, buttons 42 high, no overflow, axe 0 |
| AC-13, 14, 17 | pass | `number-input.locale-size.spec`; JSDoc names comma/point, locale display and blur clamping |
| AC-15 | pass | `ni.log`: name „Anteil“, description „Prozent“, value „7,5“; visible „7,5 %“; suffix 7.23:1; a press on the „%“ focuses the field |
| AC-16 | pass | `Sizes` 360/1280: xs 98 × 26, sm 122 × 34, md 146 × 42 (as 3.28), lg 162 × 46 with steppers 44 × 44 and field 72 × 44 |
| AC-18 | pass | `LocaleDeWithSuffix`: control 190.63 under a 254.95 px label (D-5), no overflow at 360; field focus border primary-500 4.37 L / 9.95 D (kit pattern), stepper ring 2 px inset 4.18 L / 7.58 D; axe 0 |
| AC-19–21, 23 | pass | `money.range.spec`; `Range`: „€9.99 to €12.99“, „9,99 € bis 12,99 €“ (spoken „9,99 Euro bis 12,99 Euro“), fr-FR „to“, he-IL `dir=rtl` |
| AC-22 | pass | 160 px box: 2 lines (tops 199 / 223), amounts 81.42 / 91.19 in one rect each, `scrollWidth` 160, `tabular-nums` |
| AC-25 | pass | Story `data-display-money--range` (360 L opened) |
| AC-27 | pass | 360: grid 294 stacked, gap 8; 768/1024/1280: columns 347/475/603, gap 8 (D-7: card ≥ 480 px) |
| AC-28 | pass | buttons 48.5 high; ring 2 px offset 2, 4.37 L / 9.13 D on the card, no clipping ancestor (`card.log`) |
| AC-29 | pass | link card: both button centres hit the button, the body hits `card__link`; divider 1 px, 12 / 16 px |
| AC-30 | pass | 360: „Das ist kein Vertrag für mich“ 294 × 48.5 stacked; 480 card at 768+: 219 / 219, both 71 high (1024 D opened) |
| AC-31 | pass | compat PASS, 98 HTML checks incl. the equal-footer class and container query (build.md) |
| AC-32 | pass | JSDoc `@default` on all 13 inputs; argTypes with description and `table.defaultValue` (stories diff); `test:tools` 22/22 |
| AC-33 | pass | No token or theme file changed; month pairs 17.74/15.85, current 5.77/11.17, selected text 6.21, dark fill 2.78 + inset ring 9.13; hover on the current month 5.64 L / 9.66 D |
| AC-34, 35 | pass | Gates on 226c56d5 (build.md); changelog draft names regeln rows 1–4, CC-1, CC-2 and the pages; README unchanged (no new component) |

**Deviations:** 1 (stepper icons lose the static `size="sm"` attribute) **confirmed**: no kit selector reads `lc-icon[size]`, shots identical. 2 (month mode, Enter in the open field closes without emitting) **confirmed**: the month is already committed, so day mode's re-commit would only emit a duplicate. Both recorded as change notes in design.md §2 and §6.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix (queue) | `lc-datepicker` clear button, day and month mode, all widths | target ≥ 24 × 24 px (WCAG 2.5.8; kit rule 44) | 20 × 20 px, axe `target-size` in the 16 Month/MonthDe shots and in day mode with a value (pre-existing) |
| 2 | should-fix (queue) | `lc-datepicker` day grid, dark | selected day distinguishable at ≥ 3:1 (1.4.11), e.g. the month mode's inset ring | fill vs surface 2.78:1 (pre-existing, design §9) |
| 3 | nit (backlog) | `lc-datepicker` day panel | nav, today and day targets 44 px (kit rule) | 32 / 31 / 36 px (pre-existing, AA passes) |
| 4 | nit (backlog) | `lc-datepicker` month mode, Enter in the open field after a half-typed „2026-1“ | the field shows the committed „2026-07“ again, as day mode's Enter does | the half text stays until blur |

**Verdict:** approved
