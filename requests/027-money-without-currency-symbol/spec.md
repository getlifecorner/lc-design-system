# Spec 027: lc-money and formatMoney without the currency symbol, and toast/alert icon contrast

> Change note 2026-11-01 14:20: scope widened by the owner (log.md, Owner decisions 14:15). Part B (AC-12 to AC-19) adds the variant icon contrast of `lc-toast` and `lc-alert` (026 review.md finding 2). Part A (AC-1 to AC-11) is unchanged.

- **Status:** ready
- **Type:** A: extension of `lc-money` and `formatMoney`. B: colour bug fix in `lc-toast` and `lc-alert`
- **Affected:** `libs/angular-ui-kit/src/lib/money/` (`money-format.ts`, `money.component.ts`, spec, stories), `libs/angular-ui-kit/src/lib/toast/` and `alert/` (scss, specs, stories), `src/styles/theme-contrast.spec.ts` (and `_theme-*.scss` only if a new icon token is chosen), `CHANGELOG.md`; the MCP manifest picks up the new input from JSDoc
- **Semver impact:** minor. A: one new optional input and option, default unchanged. B: no input, output, slot, hook or type changes; only the rendered icon colour of four variants changes (a fix, patch-level on its own). Visual change goes under Changed/Fixed with the measured values. No major: no API break.

## Need

Finance Intelligence services page (concept `services.md` §5.1 and §7): amounts in lists and in `lc-table` columns whose header or title already names the unit („Kosten in €“). Today `lc-money` and `formatMoney` always add „€“, so every row repeats it. There is no way to drop the symbol and keep the rest (minor units, sign, tabular figures, spoken text). The page works around it with its own `Intl.NumberFormat` on cents / 100 plus a visually hidden „Euro“. Not urgent.

## What the kit has today

| Piece | State |
|---|---|
| `lc-money` inputs | `amountMinor`, `currency`, `locale`, `signDisplay`, `minusLabel`, `plusLabel`. No way to leave the symbol out. |
| `formatMoney(amountMinor, currency, options)` | Options `locale`, `signDisplay`, `minusLabel`, `plusLabel`. It builds `text` from `formatToParts` (style `currency`) and `spoken` from a second pass with `currencyDisplay: 'name'`. The text always contains the currency part. |
| `signDisplay: 'never'` | Only the sign; not related. |

Nothing covers the request. The currency is still needed for the minor-unit digits (JPY 0, KWD 3) and for the spoken word, so `currency` stays required.

## Scope

- In: option `showCurrency` (default `true`) on `formatMoney` (`MoneyFormatOptions`) and input `showCurrency` on `lc-money`. With `false`, the visible `text` omits the currency part and the literal (space) that belonged to it. The spoken text is unchanged and still names the currency.
- Not in (non-goals): no change to the spoken text or to `minusLabel` / `plusLabel`; no new currency display modes (code, name); no column header or unit slot; no table integration; no other money API.

### Part B: variant icon contrast (added 2026-11-01)

Source: 026 review.md finding 2 (nit, pre-existing, out of scope there) and the owner's widening. The variant icon (`.lc-toast__icon`, `.lc-alert__icon`) uses `var(--color-<variant>)` and misses 3:1 (WCAG 1.4.11) against the surface on part of the variant/theme grid. Measured at the gradient ends (026 `r1/probe`): toast error dark 1.71 / 2.06, info dark 2.32 / 2.80, success light 2.72 / 2.60. `lc-alert` (018 numbers): success light 2.45, warning light 2.03, info dark 2.70, error dark 2.17. Both components are affected for all four variants; the full grid is re-measured, not only these cells. The toast icon is `decorative` (the message carries the meaning), so this is a good-practice and consistency fix, not a text-contrast failure.

Constraint on the fix: `--color-success/error/warning/info` are shared by borders, fills and other components; changing them is out of scope. The designer picks an icon-only route (an existing readable token such as `--color-on-<variant>-subtle`, or a new semantic token), and checks that the 4 px left border of the toast keeps its look. Non-goals: no change to message/title text colours, the toast close button (026), badges, `lc-next-step-card`, or other components that use the same colours (list them in design.md as follow-up candidates if found).

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `formatMoney(-4217, 'EUR', { locale: 'de-DE', showCurrency: false })` returns exactly `{ text: '−42,17', spoken: 'minus 42,17 Euro' }` (U+2212, no trailing space or no-break space). | unit test |
| AC-2 | `showCurrency: false` leaves no symbol and no dangling space for symbol-after (`de-DE`, `fr-FR`), symbol-before (`en-US`: `-$42.17` gives `−42.17`, `en-GB`), and symbol-before-with-space locales (`nl-NL`, `de-CH`). It also holds for signs `+` and `−`, zero (`0,00`) and `signDisplay` `always`, `exceptZero`, `never`. | unit tests, table of locales and signs |
| AC-3 | Digits, grouping and minor units are the same as with the symbol: JPY gives 0 digits, KWD 3, EUR 2; `1.111,11` and `8.888,88` for `de-DE`; `Number.MAX_SAFE_INTEGER` stays exact. | unit tests comparing with the `true` result minus the symbol |
| AC-4 | The `spoken` value is identical for `showCurrency` `true` and `false` for every case in AC-2 and AC-3, including custom `minusLabel` / `plusLabel`. | unit test |
| AC-5 | Without the option, or with `showCurrency: true`, the output of `formatMoney` and the rendered `lc-money` is byte-identical to 3.19.2; all existing assertions in `money.component.spec.ts` pass unchanged. | existing specs, unchanged |
| AC-6 | `lc-money` with `[showCurrency]="false"` renders `−42,17` in the `aria-hidden` amount span and still holds „minus 42,17 Euro“ in the visually hidden span, exactly once for assistive technology. The `dir` isolate, tabular figures and no-wrap stay. | component test; axe on the story |
| AC-7 | The input is optional, `boolean`, default `true`, with JSDoc and `@default true`; `MoneyFormatOptions.showCurrency` too. An invalid amount or currency still returns `null` / renders nothing. | unit test; manifest check (`npm run test:tools`) |
| AC-8 | A story in Data Display/Money shows a number column ("Cost in €" header, amounts without symbol, right-aligned, tabular, with a negative and a zero row), plus an argType with `description` and `table.defaultValue`. At 360 px the amounts do not wrap or cut; amounts of equal length have equal pixel width. Checked at 360 and 1280 px, light and dark, and with `lang="de"` strings (`de-DE` formatting) and `en-US`. | story-shots with `--measure`, 360 and 1280, both themes |
| AC-9 | The same story keeps the unit reachable without the symbol: the column header names the unit, and a screen reader hears the full „minus 42,17 Euro“ per cell. | axe plus text model of the story |
| AC-10 | Prerendered HTML before JavaScript contains the symbol-free amount and the spoken text. | compat check `EXPECT_IN_HTML` or an SSR render in the spec |
| AC-11 | CHANGELOG entry (Added, Compatibility: no API break) names the finance-intelligence services page and the measured values. | review of the changelog |
| AC-12 | Computed contrast of the variant icon against the surface it sits on is ≥ 3:1 for all 4 variants × light/dark in `lc-toast`, against the lowest end of the toast background gradient (and the surface under it). Values are listed in build.md/review.md. | `theme-contrast.spec.ts` or a toast spec, computed from the tokens; story-shots `--measure` |
| AC-13 | Same for `lc-alert`: 4 variants × light/dark, ≥ 3:1 against the alert's own background (including any subtle tint), with and without title, icon in the `md` size. | spec as AC-12; story-shots |
| AC-14 | The new/used icon colour is a token (`var(--color-…)`), no raw colour. If a new token is added, both themes define it and `theme-contrast.spec.ts` asserts it (≥ 3:1 against its surface). | spec; scss grep |
| AC-15 | Only the icon colour changes. Toast and alert text, border, background, close button and layout are unchanged: same box sizes and positions; screenshot hash compare against the baseline differs only in the icon pixels. `--color-success/error/warning/info` values are unchanged (diff). | story-shots `--compare`, 360 and 1280, both themes |
| AC-16 | No API change: `toast.component.ts`, `alert.component.ts`, public types, inputs, outputs and CSS hooks are untouched in the diff; all existing toast and alert assertions pass unchanged. | existing specs; git diff |
| AC-17 | `forced-colors`: the icon stays visible (system colour, not hidden). Text is not the only carrier of the variant for sighted users: the icon is still distinguishable per variant by shape. | forced-colors emulation shot, toast and alert |
| AC-18 | A decorative toast icon keeps `aria-hidden`; an alert icon keeps its current semantics. No new accessible names, no German/English text change. | existing a11y specs; axe on a toast and an alert story |
| AC-19 | CHANGELOG entry (Changed or Fixed, Compatibility: no API break) names the old and new ratios per cell and says that a visible icon colour changes, with the 026 finding as source. A consumer override such as `.lc-toast__icon { color: … }` is addressed in one sentence (as the 026 finding-1 wording on specificity). | review of the changelog |

Not applicable to Part A: keyboard behaviour (not interactive); `forced-colors` and `prefers-reduced-motion` (no new styles). Part B: no motion or keyboard change; see AC-17 for forced-colors.

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- The amount stays an exact decimal string into `Intl` (no float arithmetic).

## Assumptions

- Assumption: the option name is `showCurrency` on both, as the requester proposes.
- Assumption: "only the symbol and its space are left out" means the currency part and the literal next to it; implementation via `formatToParts` filtering (leading or trailing whitespace trimmed) is up to the developer, as long as AC-2 holds. A currency-less locale pattern that places the sign after the symbol must give the sign directly before the digits.
- Assumption: the spoken text stays "… Euro" because the unit is not visible in the cell; that is the point of the request.
- Assumption: Part B ships in the same release as Part A (one request, one minor).
- Assumption: the icon contrast target is 3:1 (non-text UI, WCAG 1.4.11); the alert and toast icon colours are kept in the same hue family as the variant, only darker/lighter as the theme needs.
- Assumption: the toast icon being decorative does not lower the target; the owner asked for it explicitly.
- Assumption: the `README.md` component lists need no change (no new component).

## Open questions

None.
