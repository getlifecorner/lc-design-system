# Build 027: lc-money and formatMoney without the currency symbol, and toast/alert icon contrast

- **Branch:** `feat/3.20-money-without-currency-symbol` (from `main` 321214d)
- **Commit:** `git log -1` on the branch (`feat(money,toast,alert): showCurrency on lc-money and formatMoney; variant icons in the status inks`)

## Files changed

| File | Change |
|---|---|
| `lib/money/money-format.ts` | `MoneyFormatOptions.showCurrency` (`@default true`); `withoutCurrency()` drops the currency part and the whitespace of the adjacent literals only (design §2 algorithm); JSDoc of `MoneyText.text` and `formatMoney` |
| `lib/money/money.component.ts` | input `showCurrency = input<boolean>(true)` with JSDoc, passed to `formatMoney`; class JSDoc bullet |
| `lib/money/money.stories.ts` | story **Number Column** (`data-display-money--number-column`, two `lc-table`s DE/EN); `showCurrency` argType; `Default` arg `showCurrency: true`; Key Features bullet and code line |
| `lib/money/money.show-currency.spec.ts` | new, 27 tests (AC-1 to AC-7) |
| `lib/toast/toast.component.scss`, `lib/alert/alert.component.scss` | the 4 `.lc-<c>--<v> .lc-<c>__icon` rules: `var(--color-<v>)` → `var(--color-on-<v>-subtle)` (8 lines) |
| `styles/theme-contrast.spec.ts` | `describe('Component pairings of 3.20 (request 027)')`, 7 tests |
| `docs/colors.mdx` | one sentence under "Ink on the status tints" (design §8) |
| `tools/compat/template/src/app/probe-316.ts`, `tools/compat/check-angular-majors.mjs` | `compat-money-bare` probe and its `EXPECT_IN_HTML` clause (AC-10) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | spec `AC-1`: `toEqual({ text: '−42,17', spoken: 'minus 42,17 Euro' })` |
| AC-2 | spec `it.each` over the §2 table: 6 locales × 6 sign cases; no `^\s`/`\s$`, no symbol; sign directly before the digits (nl-NL, de-CH); fr-FR keeps its U+202F grouping; he/ar/fa keep every bidi mark |
| AC-3 | spec `it.each`, 9 cases (JPY 0, KWD 3, EUR 2, `1.111,11`, `8.888,88`, ±MAX_SAFE): `text(false)` = expected = `text(true)` minus symbol and adjacent whitespace |
| AC-4 | spec: 39 cases × {default labels, `Soll`/`Haben`}: `spoken` equal for `true`/`false` |
| AC-5 | `money.component.spec.ts` unchanged (all pass); spec pins `true` = unset (function and rendered `innerHTML`); 20 money shots identical to the baseline |
| AC-6 | component spec: `.lc-money__amount` `−42,17`, `aria-hidden`, `dir=ltr`; one `.lc-money__spoken` `minus 42,17 Euro`; name "Kosten minus 42,17 Euro in €" |
| AC-7 | spec (default `true`, null / nothing for invalid amount or currency); manifest extraction lists `@Input() showCurrency: boolean = true` (temporary `test:tools` probe, removed) |
| AC-8 | shots + `tmp/027/measure/column.mjs`, 360/1280 × L/D: each amount 1 line box, right edge = td content edge (gap 0), `1.111,11` = `8.888,88` = `1,111.11` = `8,888.88` = 60.03 px, wrapper 328/328 at 360, columns 202.09 / 125.91 (DE) at 360, header label end gap 0 |
| AC-9 | same run: each cost td has the amount `aria-hidden` and one spoken span (`minus 42,17 Euro` / `minus 42.17 euros`), th `Kosten in €` / `Cost in €`; axe 0 violations (4 shots) |
| AC-10 | `compat-money-bare` in `EXPECT_IN_HTML`: `−42,17</span>` then `minus 42,17 Euro` |
| AC-12, AC-13, AC-14 | `theme-contrast.spec.ts` 3.20 block: rule bodies exactly `color: var(--color-on-<v>-subtle);`, no other icon colour; toast min 5.07 L / 6.35 D, alert min 4.38 L / 4.97 D (all ≥ 3); 3.19.2 fills 2.16 L / 1.71 D (< 3) |
| AC-15 | compare runs (see Gates); `_theme-*.scss` diff empty |
| AC-16 | `toast/alert.component.ts`, templates, `index.ts` untouched (`git diff --quiet main`); existing toast/alert specs unchanged and green |
| AC-17 | `--forced-colors` 360 L/D on both All Variants stories: each icon 24 × 24, system colour (rgb(0,0,0) L / rgb(255,255,255) D), SVG drawn; no `forced-color-adjust` (spec) |
| AC-18 | existing a11y specs green; axe 0 violations on the 4 forced shots |
| AC-11, AC-19 | changelog draft below |

## Gates

All gates ran on commit `30d328b` (code; the amend adds only `requests/027-…`), so later agents skip a gate while `git diff --quiet 30d328b -- libs tools` holds. Logs in `tmp/027/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 209 suites, 4762 passed, 8 skipped (was 208 / 4728: +27 money, +7 contrast). A first run beside Chromium lost `textarea.control-id.spec.ts` to a worker SIGSEGV; that suite alone and the full rerun are green |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | ok, 122 "Built" lines |
| `npm run test:tools` | 22/22; a temporary probe (removed) showed the manifest entry `@Input() showCurrency: boolean = true` and the Number Column snippet |
| `npx nx run angular-ui-kit:build-storybook` | ok, 963 stories (+1) |
| Story screenshots | New story: `tmp/story-shots/027/new/` (360/1280 × L/D, `--full --axe`, 0 violations). AC-15 compare of the 57 baseline stories (228 shots, `--full`): `tmp/story-shots/027/build/` **130 different, 98 identical**; the identical shots are exactly the design's list (22 icon-free stories incl. the 5 money stories, dark warning toast/alert/stacked-actions/error-display), plus density side-by-side at 360. Revert proof (3.19.2 fills injected, `tmp/027/measure/icons.mjs`): `tmp/story-shots/027/revert/` **225 identical, 3 different**: `design-tokens-density--side-by-side` 1280 L/D and `--stacked` 1280 D, all reproducible noise: 14-row runs at y 74 (and 801, 1572 in stacked), x 91–242 / 91–1074, i.e. the known breadcrumb web-font line; build and revert side-by-side shots are byte-identical. So design §9's "128 / 100" is 130 / 98 here only through those two side-by-side shots. Forced colours: `tmp/story-shots/027/forced/` (4 shots, 0 axe violations) |
| `node tools/compat/check-angular-majors.mjs --only=22` | install, build + prerender ok; 85 HTML checks ok, incl. the extended money check (`compat-money-bare`) |

## Deviations from the design

None. (The AC-15 counts differ from design §9 by two noise shots; see Gates.)

## Changelog draft

```markdown
## [3.20.0] - 2026-11-01

`lc-money` and `formatMoney` without the currency symbol (finance-intelligence services page), and variant icons that reach 3:1 in `lc-toast` and `lc-alert`. No API breaks.

### Added

- **`lc-money showCurrency` and `formatMoney(…, { showCurrency })`** (finance-intelligence services page, gap row 1 of services-2026-11-01, concept `services.md` §5.1 and §7): `false` leaves the currency symbol and the space that belongs to it out of the visible amount, for a list or table column whose header already names the unit („Kosten in €“). `formatMoney(-4217, 'EUR', { locale: 'de-DE', showCurrency: false })` returns `{ text: '−42,17', spoken: 'minus 42,17 Euro' }`. Digits, grouping, sign, minor units (JPY 0, KWD 3) and tabular figures stay, and the spoken text keeps the currency, so a screen reader still hears „minus 42,17 Euro“. The symbol is taken out of `Intl`'s parts, never by trimming the string: symbol-after (de-DE; fr-FR keeps its U+202F grouping), symbol-before (en-US, en-GB) and symbol-before-with-space locales (nl-NL `€ −42,17` → `−42,17`, de-CH) leave no stray space, checked over 1,596 locales × 6 currencies × 4 `signDisplay` values × 4 amounts (153,216 cases). Also in the prerendered HTML. Default `true`: the output is unchanged. The page can drop its own `Intl.NumberFormat` and the hidden „Euro“.
- Story: Data Display/Money "Number Column" (a German and an English `lc-table`, "Kosten in €" / "Cost in €"): at 360 px `1.111,11` and `8.888,88` are both 60.03 px wide, no amount wraps or is cut, 0 axe violations.

### Fixed

- **`lc-toast` and `lc-alert` variant icons** (026 review finding 2, the 3.19.2 Known entry; WCAG 1.4.11): the icon uses its variant's ink `--color-on-<variant>-subtle` (the text and icon colour of the status tints) instead of the fill `--color-<variant>`. Lowest contrast on the toast gradient, light: success 2.60 → 5.07, warning 2.16 → 5.77, error 8.03 → 12.05, info 5.91 → 9.72; dark: success 5.27 → 6.97, error 1.71 → 7.21, info 2.32 → 8.83, warning 6.35 (unchanged, the dark ink is the fill). `lc-alert` on its tint over the lowest surface, light: success 2.25 → 4.38, warning 1.86 → 4.98, error 5.90 → 8.85, info 4.50 → 7.41; dark: success 4.34 → 5.74, error 1.72 → 7.24, info 2.05 → 7.80, warning 4.97 (unchanged). The 3.19.2 note missed toast warning in light (2.16:1). `lc-error-display` renders `lc-alert` and gets the same icons. The toast's 4 px rail, the alert tint and border, the text, the × and the layout are unchanged: the shots are hash-identical once the old icon colour is put back. `--color-success/error/warning/info` are unchanged. In forced colours the icons take the system colour.

### Compatibility

- No API breaks: one new optional input and option, default `true`, output unchanged. The variant icons of `lc-toast` and `lc-alert` are darker in light and lighter in dark (dark warning unchanged). The selectors are unchanged (`.lc-toast--<variant> .lc-toast__icon`, `.lc-alert--<variant> .lc-alert__icon`, 0-2-0, global). To keep the old fill, set `color: var(--color-<variant>)` with a selector of at least 0-3-0, for example `.lc-toast.lc-toast--warning .lc-toast__icon`.
```
