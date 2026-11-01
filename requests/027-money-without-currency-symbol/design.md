# Design 027: lc-money and formatMoney without the currency symbol, and toast/alert icon contrast

- **Status:** ready
- **Spec:** [spec.md](spec.md), AC-1 to AC-19 (Part A: AC-1 to AC-11, Part B: AC-12 to AC-19)
- **Baseline:** `tmp/story-shots/027/baseline`, 57 stories at 360/1280 px, light/dark, `--full` (228 shots, main 321214d). The stories are in `tmp/027/baseline-stories.txt` and the icon colours of each shot in `tmp/027/baseline-shots.log`.

## 1. Approach

| Part | Kind | Pattern followed |
|---|---|---|
| A | Extend `formatMoney` and `lc-money` | Boolean `show*` inputs with default `true`, a plain `input<boolean>(true)` without a transform (`showIcon` on error-display, `showHeader` on chat, `showCopy` on code-block). The option name is the same on the function and the component, as with `signDisplay`. |
| A | Algorithm | Filter `formatToParts`, don't use a second `style: 'decimal'` formatter. Decimal style gives different grouping in 1,012 of 153,216 cases (de-AT `11.111,11` with the symbol but `11 111,11` in decimal; en-DE uses `,` against `.`). That would break AC-3. |
| B | Bug fix, no new token | Each variant icon reads its variant's **ink** `--color-on-<variant>-subtle`. `colors.mdx` already defines these tokens as "ink for text/icons on the tints (badges, alerts)", and the kit already uses them for status glyphs: lc-list badges, the lc-stat-trend arrows (`--color-text-*` aliases), the password requirement icons and typography info. They are the `-dark` step of each ramp in light and the light step in dark, so no new value enters the palette. `--color-text-info` doesn't exist, so all four use the `on-*-subtle` names. |

Rejected for B: a new `--color-<variant>-icon` family that keeps the old fill wherever it passes. It would add 8 values next to existing tokens that already fit, and a 3:1 amber or sage needs new raw hexes outside the ramp.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| option | `MoneyFormatOptions.showCurrency` | `boolean` | `true` | Whether the visible `text` shows the currency symbol (or code). `false` leaves out the symbol and the space that belongs to it („−42,17“), for a column or title that already names the unit („Kosten in €“). Digits, grouping, sign and minor units stay. The `spoken` text still names the currency. `@default true` |
| input | `lc-money` `showCurrency` | `boolean` | `true` | Shows the currency symbol in the visible amount. `false` leaves out the symbol and its space („−42,17“) for a table column or a title that already names the unit („Kosten in €“). Screen readers still hear the currency („minus 42,17 Euro“), and `currency` still sets the minor units. Use it only where the unit is visible next to the amount. `@default true` |
| JSDoc | `MoneyText.text` | — | — | Add: „−42,17“ with `showCurrency: false`. |
| JSDoc | class `MoneyComponent` | — | — | Add a bullet: "`showCurrency=false`: no symbol in the visible amount (a column headed „Kosten in €“); the spoken text keeps the currency." |
| Part B | — | — | — | No API change (AC-16). Only the values in the four `.lc-<c>--<v> .lc-<c>__icon { color }` rules of each component change. |

**Algorithm (normative for AC-1 to AC-5).** This applies only when `showCurrency === false`. `undefined` and `true` run today's code unchanged, which gives AC-5 byte for byte.
1. Take the `formatToParts` result as today. Let `i` be the index of the part whose `type === 'currency'` (always exactly one).
2. In the parts at `i − 1` and `i + 1`, if their `type === 'literal'`, remove every whitespace character (`/\s/g`, which covers U+0020, U+00A0, U+202F and U+2009). Keep bidi marks (U+200E, U+200F, U+061C).
3. Drop part `i` and any part left empty. Then apply the U+2212 mapping and `join('')` as today. The `spoken` pass is untouched.

- **Never** strip whitespace from the whole string. fr-FR groups with U+202F: `1 111,11 €` must give `1 111,11`.
- Checked in Node 24 over 1,596 locales × 6 currencies × 4 `signDisplay` values × 4 amounts (153,216 cases). Every case had exactly one currency part, no leading or trailing space, the sign directly before the digits (bidi marks aside), and no other characters left.

AC-2 expectations (EUR unless named; ⍽ = U+00A0, `−` = U+2212):

| Locale | −4217 auto | 0 auto | 4217 always | 0 always | 0 exceptZero | −4217 never |
|---|---|---|---|---|---|---|
| de-DE, fr-FR | `−42,17⍽€` → `−42,17` | `0,00` | `+42,17` | `+0,00` | `0,00` | `42,17` |
| en-US (USD) | `−$42.17` → `−42.17` | `0.00` | `+42.17` | `+0.00` | `0.00` | `42.17` |
| en-GB (GBP) | `−£42.17` → `−42.17` | `0.00` | `+42.17` | `+0.00` | `0.00` | `42.17` |
| nl-NL | `€⍽−42,17` → `−42,17` | `0,00` | `+42,17` | `+0,00` | `0,00` | `42,17` |
| de-CH (CHF) | `CHF−42.17` → `−42.17` | `0.00` | `+42.17` | `+0.00` | `0.00` | `42.17` |

AC-3, de-DE: JPY 123456 gives `123.456`, KWD 123456 gives `123,456`, and `MAX_SAFE_INTEGER` EUR gives `90.071.992.547.409,91`. In each case `text(false) === text(true)` with the currency part and its adjacent whitespace removed. AC-1 gives `{ text: '−42,17', spoken: 'minus 42,17 Euro' }`.

## 3. Anatomy and layout

Part A doesn't change the component's DOM or styles. The two spans, `aria-hidden`, `dir`, `tabular-nums` and `nowrap` stay. The new story uses `lc-table` md, as the requester does from 1024 px. Measured in the current build: td 14/21 px with padding 12/16, th 14 px/600 uppercase nowrap, and an `align: 'end'` label whose right edge equals the cell's.

### 360 px (story canvas 328 px)

```
Kosten je Service, Oktober 2026                (caption, lc-table)
SERVICE                              KOSTEN IN €   ← th, end column: label right = cell right
Arbeitsplatz und                        1.111,11   ← td 14/21, pad 12/16, tabular, amount right = td right - 16
Endgeräte                                             (the service wraps at spaces, the amount never wraps)
Rechenzentrum und Hosting               8.888,88   ← same width as 1.111,11 (60.03 px at 14 px)
Netzwerk und Telefonie                123.456,78
Kollaboration und E-Mail                    0,00
Gutschrift Lizenzrückgabe                 −42,17
                     24 px gap
Cost per service, October 2026  (the same table, lang="en", en-US: 1,111.11 … −42.17)
```

### From 1024 px (1280 shown)

Same structure, with the tables at the canvas width (1248 px at 1280). Every service fits on one line, and the amount column keeps its end alignment.

Prototype at 360 px (lc-table *Clickable Rows* reduced to the two columns, DE strings): wrapper 328 with scroll 328; service column 202.09 and cost column 125.91 (label 93.91 + 2 × 16); amounts 60.03 / 60.03 / 77.36 (`123.456,78`) / 47.36 (`−42,17`); the first two service rows wrap to 2 lines (row 68 px against 46).

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Amount | from the td (12/16 padding) | 14/21, tabular | inherits `--color-text-primary` |
| Header "Kosten in €" | th | 14/600 uppercase, `--color-text-secondary` | lc-table |
| Toast / alert icon (B) | unchanged 24 px md | — | `--color-on-<variant>-subtle` |

## 4. States

| State | Part A | Part B |
|---|---|---|
| default | as in §2 | the icon is in the ink colour; the toast border, alert tint, text and × are unchanged |
| hover / focus-visible / active / disabled / loading | not interactive | the icon isn't interactive; the hover tints and the × are unchanged (026) |
| empty / error | invalid amount or currency: `null` / nothing rendered (AC-7), as today | — |
| zero, signs | `0,00`; `+0,00` with `always`; no sign with `exceptZero` and `never` | — |
| overflow | `MAX_SAFE_INTEGER` stays one line (`nowrap`); a column that is too narrow makes the lc-table wrapper scroll (`overflow-x: auto`), and the amount is never cut | long German alert titles: unchanged (018 rules) |

## 5. Theming

**Part A:** no colour; `lc-money` inherits it.

**Part B:** the icon on the lowest background. Toast: both ends of `--gradient-surface` over `--color-surface`. Alert: its own tint (`rgba(…, .12/.14/.14/.16)`) over `--color-background`, `-low`, `--color-surface`, `-2` and `-sunken`. Old → new values, computed with WCAG relative luminance. The background column is the story canvas.

| Theme | Variant | Icon colour | Toast min | Alert on the background | Alert min (base) |
|---|---|---|---|---|---|
| light | success | `#8ea475` → `#5f7150` | 2.60 → **5.07** | 2.45 → 4.78 | 2.25 → **4.38** (sunken) |
| light | error | `#9d0e0e` → `#6b0909` | 8.03 → 12.05 | 6.46 → 9.69 | 5.90 → 8.85 (sunken) |
| light | warning | `#e1a040` → `#855a22` | 2.16 → 5.77 | 2.03 → 5.42 | 1.86 → 4.98 (sunken) |
| light | info | `#3b6588` → `#27445c` | 5.91 → 9.72 | 4.92 → 8.09 | 4.50 → 7.41 (sunken) |
| dark | success | `#8ea475` → `#a9bb93` | 5.27 → 6.97 | 5.86 → 7.75 | 4.34 → 5.74 (surface-2) |
| dark | error | `#9d0e0e` → `#f7a1a1` | 1.71 → 7.21 | 2.17 → 9.16 | 1.72 → 7.24 (surface-2) |
| dark | warning | `#e1a040` → `#e1a040` (same) | 6.35 → **6.35** | 6.71 | 4.97 → **4.97** (surface-2) |
| dark | info | `#3b6588` → `#b8cee0` | 2.32 → 8.83 | 2.70 → 10.26 | 2.05 → 7.80 (surface-2) |

- The spec's 026 list misses **toast warning light, 2.16 to 2.26**. The full grid had 4 failing cells per component (success L, warning L, error D, info D).
- The new minimum is 5.07 L and 6.35 D for the toast, and 4.38 L and 4.97 D for the alert.
- The toast's 4 px `border-left` keeps `--color-<variant>`, so the rail stays the fill and the icon is the darker (light) or lighter (dark) step of the same hue. The prototype (`tmp/story-shots/027/proto`) shows the brown warning icon next to the amber rail as one family.
- **New tokens:** none. **`--color-success/error/warning/info`:** unchanged (AC-15).

**Follow-up candidates.** These use the same fills as foreground and are out of scope (spec non-goals). Ratios on `--color-surface`, light / dark, with "tint" meaning the 0.18 fill over the surface. The fix is the same ink swap.

| Component | Element | Token | Below the target |
|---|---|---|---|
| lc-notification-center | `.lc-nc__item-icon--*` (type icon) | `--color-<v>-default` plus raw fallbacks (`#3b82f6` …) | success 2.72 and warning 2.26 in light (3:1) |
| lc-notification-center | `.lc-nc__item-priority--high/urgent` (10 px text) | `--color-warning` / `--color-error` on the tint | warning L 1.97, urgent D 1.98 (**text, 4.5:1**) |
| lc-card | status chip `--success/--warning/--error` (text on the tint) | `--color-<v>` | success L 2.33, warning L 1.97, error D 1.98 (**text**) |
| lc-status-dot | `--done/--wait/--blocked` | `--color-<v>` | success L 2.72, warning L 2.26, error D 2.06 |
| lc-pipeline | warning / error node border and glyph | `--color-<v>` | warning L 2.26, error D 2.06 |
| lc-markdown | `__mermaid-error` text | `--color-error` | D 2.06 (**text**) |
| lc-file-upload | remove × on hover | `--color-error` on the tint | D 1.98 |
| lc-rating | filled star | `--color-warning` | L 2.26 |
| log-viewer, diff-viewer, dependency-viewer, kanban-board | level and diff text | `--color-<v>-default` | success L 2.72, warning L 2.26 (dark passes: `-default` is the light step there) |
| lc-progress | fill against the track | `--color-<v>` | known from 021: success L 2.47, warning L 2.05, error D 1.84, info D 2.5 |

## 6. Accessibility

- **A:** the visible amount stays `aria-hidden`, and the hidden span keeps the full spoken text with the currency („minus 42,17 Euro“, en-US „minus 42.17 euros“). A screen reader therefore hears the unit even when the user hasn't read the header. Visually, the column header or title must name the unit; the JSDoc says so. Nothing interactive, no focus, no motion.
- **B:** the toast icon stays `decorative` (`aria-hidden`). The alert icon stays decorative unless `iconAriaLabel` is set, in which case it's a named image and 1.4.11 now holds for it. There are no `forced-color-adjust` rules: in forced colours the UA forces `color`, the SVG paints `currentColor` as CanvasText and stays visible. The variants keep different shapes: check-circle, x-circle, exclamation-triangle and information-circle (AC-17). No new text or names (AC-18).

## 7. Texts

No new built-in strings: the spoken text comes from `Intl`, and `minusLabel` / `plusLabel` are unchanged. Story strings:

| Use | EN (`lang="en"`, en-US) | DE (`lang="de"`, de-DE) |
|---|---|---|
| caption | Cost per service, October 2026 | Kosten je Service, Oktober 2026 |
| column labels | Service · Cost in € | Service · Kosten in € |
| rows | Workplace and devices · Data centre and hosting · Network and telephony · Collaboration and email · Licence return credit | Arbeitsplatz und Endgeräte · Rechenzentrum und Hosting · Netzwerk und Telefonie · Kollaboration und E-Mail · Gutschrift Lizenzrückgabe |
| amounts (minor) | 111111 · 888888 · 12345678 · 0 · −4217 | same |

At 360 px the longest DE word, „Lizenzrückgabe“ (about 100 px), fits in the service column (170 px of content, from the prototype in §3), and the services wrap only at spaces.

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Number Column (new) | `data-display-money--number-column` | none (fixed `[showCurrency]="false"`) | Two `lc-table`s (DE, then EN, 24 px gap), each with columns `service` and `cost` (`align: 'end'`), and `lc-money` in an `lcTableCell="cost"` template. Imports `TableComponent` and `TableCellDirective` from the table folder through `moduleMetadata`. The description says that the header names the unit, that screen readers still hear the currency, and the option for `formatMoney`. AC-8, AC-9 |
| Default | `data-display-money--default` | add `showCurrency: true` | the control. Renders unchanged |
| meta argTypes | — | `showCurrency`: `control: 'boolean'`, description "Show the currency symbol; false leaves it out (the spoken text keeps the currency)", `table.defaultValue.summary: 'true'` | AC-8 |
| meta docs | — | a Key Features bullet and a `formatMoney(-4217, 'EUR', { locale: 'de-DE', showCurrency: false })` line in the code example | |
| B | existing `feedback-toast--all-variants`, `feedback-alert--all-variants` | unchanged | the review surfaces for AC-12, AC-13 and AC-17 |

Also for B: add one sentence under "Ink on the status tints" in `src/docs/colors.mdx`: "Since 3.20 the lc-toast and lc-alert variant icons use these inks, at least 4.38:1 (light) and 4.97:1 (dark); the plain `--color-{success,…}` are fills for rails and borders."

**Change note (review r1, 2026-11-01).** The Number Column description and the changelog must say that a `formatMoney(…).text` string in a table `formatter` has no spoken text, so the unit is then only in the header: "That string has no spoken text, so the unit is then only in the column header; prefer `lc-money` in a cell template, as here." This design missed it (review findings 1 and 2).

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| AC-1 | unit test | `toEqual({ text: '−42,17', spoken: 'minus 42,17 Euro' })` |
| AC-2 | `it.each` over the table in §2 (6 locales × 6 cases) | as in the table; `text` matches neither `/^\s|\s$/` nor `/[€$£]|EUR|CHF/` |
| AC-3 | unit tests | JPY, KWD, EUR, `1.111,11`, `8.888,88` and MAX_SAFE as in §2; `text(false)` equals `text(true)` minus the currency and its adjacent whitespace |
| AC-4 | unit test over the AC-2 and AC-3 cases, plus `minusLabel: 'Soll'`, `plusLabel: 'Haben'` | `spoken` is equal for `true` and `false` |
| AC-5 | existing `money.component.spec.ts`, unchanged; story compare | all pass; the 5 money stories are identical to the baseline (20 shots) |
| AC-6 | component test with `[showCurrency]="false"` | `.lc-money__amount` text `−42,17`, `aria-hidden="true"`, `dir="ltr"`; `.lc-money__spoken` `minus 42,17 Euro` (1 span); host styles unchanged |
| AC-7 | spec; `npm run test:tools` | `input<boolean>(true)` with `@default true`; the manifest lists `showCurrency`; `null` / nothing for an invalid amount or currency |
| AC-8 | `story-shots --stories=data-display-money--number-column --widths=360,1280 --themes=light,dark --axe --measure=…` | per amount: `getClientRects().length === 1`, right = td right − 16; `1.111,11` and `8.888,88` the same width (60.03 px at 14 px, the same for `1,111.11` and `8,888.88`); wrapper `scrollWidth ≤ clientWidth` (328) at 360; header label right = cell right; columns about 202 / 126 at 360 (§3 prototype) |
| AC-9 | same run: text model plus `--axe` | each cost td: amount `aria-hidden`, one `.lc-money__spoken` (`minus 42,17 Euro` / `minus 42.17 euros`), th text `Kosten in €` / `Cost in €`; 0 axe violations |
| AC-10 | `probe-316.ts`: add `<p>Kosten <lc-money id="compat-money-bare" [amountMinor]="-4217" currency="EUR" locale="de-DE" [showCurrency]="false" /> in €</p>`, and extend the existing EXPECT_IN_HTML entry with `money('compat-money-bare', `${minus}42,17`, 'minus 42,17 Euro')` | passes on 21 and 22. The `</span>` right after `42,17` proves there is no trailing NBSP |
| AC-11, AC-19 | changelog review | Added (`showCurrency`, finance-intelligence services page row 1, the 153,216-case check, 60.03 px). Fixed (the §5 grid, old → new per cell, 026 finding 2, toast warning L included). Compatibility: no API break. Override sentence: "The selectors are unchanged (`.lc-toast--<variant> .lc-toast__icon`, `.lc-alert--<variant> .lc-alert__icon`, 0-2-0, global). To keep the old fill, set `color: var(--color-<variant>)` with a selector of at least 0-3-0, for example `.lc-toast.lc-toast--warning .lc-toast__icon`." |
| AC-12, AC-13, AC-14 | new `describe('Component pairings of 3.20 (request 027)')` in `theme-contrast.spec.ts`, built like the 026 block (compiled toast and alert CSS, `rule()` helper) | (1) for 4 variants × 2 components, the icon rule body is exactly `color: var(--color-on-<v>-subtle);` with no hex or rgba. (2) Per palette: toast min over the variants × gradient stops is ≥ 3 and `toBeCloseTo([5.07, 6.35][i], 2)`. (3) The alert tint is parsed from `.lc-alert--<v>` `background-color` and composited over `[...surfaces, '--color-background-low']`; the min is ≥ 3 and `toBeCloseTo([4.38, 4.97][i], 2)`. (4) Optional "why": the 3.19.2 fills give 2.16 L / 1.71 D on the toast (< 3) |
| AC-15 | `story-shots --stories=$(cat tmp/027/baseline-stories.txt) --widths=360,1280 --themes=light,dark --full --compare=tmp/story-shots/027/baseline` | **128 different, 100 identical.** Identical: the 22 stories without an icon (incl. money and outlet at rest), the dark shots of toast--warning, alert--warning, alert--stacked-actions and error-display--warning, and density--side-by-side (icons not painted in the shot). The prototype gave exactly this. Then the revert proof: inject `.lc-toast--<v> .lc-toast__icon.lc-toast__icon, .lc-alert--<v> .lc-alert__icon.lc-alert__icon { color: var(--color-<v>) }` and compare again: 228/228 identical. `git diff main -- libs/angular-ui-kit/src/styles/_theme-*.scss` is empty |
| AC-16 | `git diff --stat` | `toast.component.ts`, `alert.component.ts`, the templates and the index files untouched; existing toast and alert specs pass unchanged |
| AC-17 | `--forced-colors` run on the two All Variants stories at 360 L/D, plus grep | icons painted (non-zero box, `color` resolved); no `forced-color-adjust` in either SCSS |
| AC-18 | existing a11y specs plus `--axe` on the two All Variants stories | toast `lc-icon` `aria-hidden`; alert icon semantics unchanged; 0 violations |
