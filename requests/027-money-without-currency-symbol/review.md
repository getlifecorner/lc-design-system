# Review 027: lc-money and formatMoney without the currency symbol, and toast/alert icon contrast

## Round 1 — 2026-11-01, commit bb51e50 (code = gate commit 30d328b, `git diff --quiet 30d328b -- libs tools` holds)

Screenshots: `tmp/story-shots/027/r1/` (`new` 6: Number Column 360/1024/1280 L/D `--full --axe`; `changed` 12: toast and alert All Variants 360/1024/1280 L/D `--full --axe`; `control` 1). Logs `r1/new.log`, `r1/changed.log`; measure copies `r1/*-measure.js`. Developer's Storybook build reused (not stale). Developer's folders re-checked with `diff -rq` against `027/baseline`: `build` 130 differ, `revert` 3 differ. Opened 7 shots (Number Column 360 L, 1280 L; toast and alert All Variants 360 L/D; forced toast 360 D).

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `money.show-currency.spec.ts` `toEqual({ text: '−42,17', spoken: 'minus 42,17 Euro' })`; `test-money.log` 54/54 |
| AC-2 | pass | spec `it.each` over the design §2 table (6 locales × 6 cases), plus fr-FR U+202F and bidi-mark tests. `withoutCurrency()` follows the §2 algorithm: drops the `currency` part, strips `\s` only in the adjacent literals, filters empty parts |
| AC-3 | pass | spec, 9 cases. Story: `1.111,11` = `8.888,88` = `1,111.11` = `8,888.88` = 60.03 px at every width and theme |
| AC-4 | pass | spec, 39 cases × default and `Soll`/`Haben` labels |
| AC-5 | pass | `money.component.spec.ts` unchanged and green; spec compares `unset` and `true` `innerHTML`; the 20 money baseline shots are identical (`build`). The Default story control works: `showCurrency=false` → `−42,17` / `minus 42,17 Euro` (`r1/control`) |
| AC-6 | pass | `r1/new.log`: per amount `aria-hidden="true"`, `dir="ltr"`, `tabular-nums`, `nowrap`, 1 `.lc-money__spoken`; the negative row starts with U+2212 (8722), no whitespace in any amount |
| AC-7 | pass | `input<boolean>(true)`, option `showCurrency?: boolean`, both JSDoc as design §2 word for word with `@default true`; manifest probe in `test-tools.log`; null/nothing specs |
| AC-8 | pass | 360/1024/1280 L/D: every amount 1 line box, end gap to the td content edge 0, header label end gap 0 (`text-align: end`), wrapper `scrollWidth` = `clientWidth` (328 / 992 / 1248). Columns at 360: DE 202.09 / 125.91, EN 206.88 / 121.13. Font 14 px. argType: `control: 'boolean'`, description and `defaultValue.summary: 'true'` as §8 |
| AC-9 | pass | th `Kosten in €` / `Cost in €`; the text a screen reader gets per cost td (aria-hidden subtrees removed): `minus 42,17 Euro`, `1.111,11 Euro`, `minus 42.17 euros`, `0.00 euros` …; axe 4.14: 0 violations in 6 shots |
| AC-10 | pass | `compat-22.log`: "ok money: de-DE, LOCALE_ID and symbol-free amounts … (027 AC-10)"; the regex requires `−42,17</span>` directly, then `minus 42,17 Euro` |
| AC-11 | pass, see finding 1 | changelog draft in `build.md`: Added names the services page, gap row 1, the 153,216 cases (= 1,596 × 6 × 4 × 4) and 60.03 px; no API break |
| AC-12 | pass | `r1/changed.log`, icon colour composited over both gradient ends, 3 widths: L success 5.07, error 12.05, warning 5.77, info 9.72; D 6.97, 7.21, 6.35, 8.83. Min 5.07 L / 6.35 D = design §5 |
| AC-13 | pass | alert on the canvas L 4.78 / 9.69 / 5.42 / 8.09, D 7.75 / 9.16 / 6.71 / 10.26 (success/error/warning/info); min over background, -low, surface, -2, sunken: 4.38 L (success) / 4.97 D (warning) = design §5. Icon 24 × 24 (md) at x 33, with title |
| AC-14 | pass | the 8 rules read `var(--color-on-<v>-subtle)` (diff); no new token; `_theme-*.scss` diff empty; `theme-contrast.spec.ts` 3.20 block, `test-contrast.log` 278/278 |
| AC-15 | pass | `build` vs baseline: 130 differ, 98 identical (design §9 said 128/100). With the 3.19.2 fills injected (`icons.mjs`, icon selector only): 225 identical, 3 differ: density side-by-side 1280 L/D and stacked 1280 D, all in 14-px rows at x 91–242/1074, y 74 (801, 1572), the breadcrumb text line, not an alert. Build and revert side-by-side shots are byte-identical (`cmp`), so the 2 extra diffs are that noise. Rail stays `--color-<v>` (measured border colours) |
| AC-16 | pass | `git diff --stat main`: in toast/ and alert/ only the two `.scss` files; no `.ts`, `.html` or `index.ts`; full suite 4762 passed |
| AC-17 | pass | `027/forced` (4 shots, opened toast 360 D): all 4 icons 24 × 24, drawn in the system colour (black L / white D), shapes distinct; no `forced-color-adjust` in either SCSS (grep) |
| AC-18 | pass | templates untouched (AC-16), so the toast icon stays `[decorative]` and the alert icon keeps `iconAriaLabel`; axe 0 violations in the 12 `changed` shots and the 4 forced shots |
| AC-19 | pass | Fixed lists old → new for all 16 cells (= design §5 and the measures above), names 026 finding 2 and the missed toast warning L 2.16, says the icons get darker (L) / lighter (D); Compatibility gives the 0-3-0 override sentence of design §9 |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix | changelog draft (`build.md`), Added, last sentence; for the release-manager | "In a cell template, `<lc-money … [showCurrency]="false" />` replaces the page's own `Intl.NumberFormat` and its hidden „Euro“. A `formatMoney(…).text` string in a table `formatter` has no spoken text, so keep the hidden word there." | "The page can drop its own `Intl.NumberFormat` and the hidden „Euro“." Unconditional: the services concept wants „Euro“ in every row (services.md l. 587), and a formatter string would lose it |
| 2 | should-fix | `money.stories.ts` Number Column description (served by the MCP); follow-up, docs only, no shot changes | after the `formatMoney(…).text` sentence: "That string has no spoken text, so the unit is then only in the column header; prefer `lc-money` in a cell template, as here." | The formatter tip directly follows "Screen readers still hear the currency in every cell", which is true only for `lc-money`. My design §8 missed this caveat (change note added there) |

**Verdict:** approved. No must-fix; findings 1 and 2 stay open for the release.
