# Build 022: bank-account kit gaps (BA-1, BA-3, BA-4, BA-5, TD-3, TD-4)

- **Branch:** `feat/3.16-bank-accounts-kit-gaps` (3.15.0 → minor)
- **Commit:** see `git log -1` (one commit, amended; gates below ran on the code of `9a397eb`)

## Files changed

| Area | Change |
|---|---|
| `switch/` | `helpText` (help row + `aria-describedby`), 44 px labelled rows via `--lc-switch-min-height`; 3 stories; `switch.help-text.spec.ts` |
| `table/` | `clickable`, `caption`, `showCaption`; row ring on every variant + forced-colors; 2 stories; `table.clickable.spec.ts` |
| `money/` (new entry) | `lc-money`, `formatMoney`, types; stub, `src/index.ts` line; 5 stories; `money.component.spec.ts` |
| `next-step-card/` | `actionsStyle` (`'default'` \| `'equal'`) + dev warning; 3 stories; `next-step-card.actions-style.spec.ts` |
| `list/` | `ListItem.href`, `linkClick` (`ListLinkClickEvent`), link-row styles, dev warning; 3 stories; `list.link-rows.spec.ts` |
| icons | `wallet`, `building-bank`, `shield-lock` in the inline set (generator list, data, index, catalog JSDoc), `ICON_WALLET`, `ICON_BUILDING_BANK`, `ICON_SHIELD_LOCK(_SOLID)`; `icon.finance-icons.spec.ts`; Finance Icons story + solid note; bottom-nav / sidenav Finance Destination |
| specs, docs, compat | `theme-contrast.spec.ts` (8 ring checks), `i18n-labels.spec.ts` (money); `internationalization.mdx`, both READMEs; `probe-316.ts`, `EXPECT_IN_HTML` money check, `check-entries.mjs` 120 |

Changed assertions (design TD-3 / new entry): `icons.spec` 133 → 137 glyphs; `icon.trusted-types.spec` 133/134 → 137/138; `entries.spec` 113 → 114 public (+ `money`); `check-entries.mjs` 119 → 120. No other existing assertion changed.

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1, 4 | `switch.help-text.spec.ts` (ids, describedby, no help/describedby without `helpText`, 3.15 DOM pinned); compare: only the 7 expected switch stories differ |
| 2–3 | measure: rows ≥ 44 (1280: 45 / 46.5 / 48.5; 360 md 2-line DE help 66.5), no text or page overflow; contrast design §5 |
| 5–7 | `table.clickable.spec.ts` (tab stops, Enter/Space, Space prevented, nested link/button/switch emit 0, tree unchanged, caption first child, axe name „Umsätze Oktober 2026“); `theme-contrast.spec.ts` ring ≥ 3:1 on 4 row fills × 2 themes; caption 36 px |
| 8 | existing table specs unchanged; 3.15 class list pinned; 19 table stories identical except noise (below) |
| 9–13 | `money.component.spec.ts` (EUR/USD/JPY/KWD/HUF, zero, ±safe-integer limit, invalid → null, spoken per sign mode, LOCALE_ID, rtl, CSS); measure 1.111,11 € = 8.888,88 € = 81.42 px, one line |
| 14 | compat 22: `money: de-DE and LOCALE_ID amounts with their spoken text before JS` ok |
| 15–16 | `next-step-card.actions-style.spec.ts`; buttons 48.5 px; 14 card stories identical |
| 17–18 | `icon.finance-icons.spec.ts` (inline, exact generator markup, 0 requests, solid fetch for `wallet`); stories |
| 19–22 | `list.link-rows.spec.ts` (anchor, contents, `linkClick` plain clicks only, not prevented, disabled = plain row, action dropped + warning, axe 0); sm link rows 59–60 px; 17 list + 3 density + 6 app-shell stories identical |
| 23–25 | 114 new shots L/D at 360/1024/1280, axe 0 violations; tools tests; build (`money` entry); compat 22 |

## Gates

All gates ran on commit `9a397eb` (later agents skip a gate while `git diff --quiet 9a397eb -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 198 suites, 4606 passed, 8 skipped (main: 192 / 4493 / 8) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (unchanged) |
| `npx nx run angular-ui-kit:build` | 121 "Built" (120 entries + primary); `money` fesm 7,387 B |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | ok |
| Story screenshots | new: `tmp/story-shots/022/new` (19 stories, 114 shots, `--axe` 0 violations); compare: `tmp/story-shots/022/compare` (328 shots: 294 identical, 28 = the 7 expected switch stories, 6 noise) |
| `node tools/compat/check-angular-majors.mjs --only=22` | PASS, 80 HTML checks (+1 money) |

Noise: `data-display-table--with-pagination`, `--with-filtering`, `--full-featured` at 1280 L/D differ only in the Salary column (x 1031–1098): `largeDataset` uses `Math.random()` (pre-existing; at 360 the column is scrolled off).

## Deviations from the design

None in API, anatomy or tokens. Implementation details for the designer's review:

1. *Clickable Rows* amount column: `cssClass` (header and cells) instead of `cellClass`, so the header aligns at the end too (021's `align` is not built).
2. `lc-money` host `position: relative`: the clipped words otherwise escape a scrolling table (page 575 px wide at 360); now 360.
3. Table nested-control selector uses unquoted role values (`[role=link]`): `kit-icons.spec.ts` read `'link'` as an icon literal.
4. *Locales and Currencies*: the 360 px scroll boxes are named, focusable regions (axe `scrollable-region-focusable`).

## Changelog draft

**Added**
- **`lc-money`** (`@lifecorner/angular-ui-kit/money`, BA-4, every Finances board and the Today sources line): `amountMinor` (integer minor units, exact up to ±9,007,199,254,740,991), `currency` (ISO 4217 minor units: EUR 2, JPY 0, KWD 3), `locale` (default `''` = the app's `LOCALE_ID`), `signDisplay`, `minusLabel` / `plusLabel`. Shows `−42,17 €` (U+2212, no-break space) with tabular figures (1.111,11 € and 8.888,88 € both 81.42 px), never wraps, is a `dir` isolate, inherits colour; screen readers hear „minus 42,17 Euro“ once. `formatMoney()` gives the same text and words for table formatters. Prerendered before JS.
- **`lc-switch helpText`** (BA-1, connection page, health sharing): a description below the label, linked by `aria-describedby`; 7.56 / 11.16:1.
- **`lc-table clickable`**, **`caption`**, **`showCaption`** (BA-3, account transactions from 1024 px): rows become tab stops, Enter and Space emit `rowClick`, controls inside a row never do; the caption names the table (36 px, or visually hidden). Ring 2 px `--color-primary-500`, ≥ 3.76:1 on every row fill, `Highlight` in forced colours.
- **`lc-next-step-card actionsStyle="equal"`** (BA-5, health question card): both answers outline primary at `actionSize="lg"` (48.5 px), primary first, `announce` and disabled reasons kept.
- **`ListItem.href`** and **`linkClick`** (TD-4, Today sources line, account rows): the row is a real `<a href>` (≥ 44 px, middle click, new tab); `linkClick` reports plain clicks for `router.navigateByUrl`. An `href` row renders no `action`; a disabled one stays a plain row.
- **Inline icons `wallet`, `building-bank`, `shield-lock`** (TD-3, bottom nav, sidenav, connect cards) and `ICON_WALLET`, `ICON_BUILDING_BANK`, `ICON_SHIELD_LOCK`, `ICON_SHIELD_LOCK_SOLID`: no request, prerendered. The lazy inline set grows by 1,771 B raw, 4,417 → 4,613 B gzip; constants cost only when registered. `wallet` and `building-bank` have no filled glyph (`variant="solid"` shows the placeholder).

**Changed**
- Labelled `lc-switch` rows are at least 44 px high (`--lc-switch-min-height`, default `var(--size-min-touch-height)`; `0` restores the 3.15 rows of 21 / 24 / 28 px). The only intended visual change: 7 switch stories are taller.
- The table row focus ring applies to every variant: tree rows in default and bordered tables had none.

**Compatibility**
- No API breaks: every input is optional; defaults render as 3.15 (Jest pins the DOM). 294 of 328 screenshots of 82 switch, card, icon, table, nav, list, density and app-shell stories are identical; the rest are the 28 taller switch shots and 6 random-data table shots.
- Consumer check (AOT, strictTemplates, prerender) passes on Angular 22.
