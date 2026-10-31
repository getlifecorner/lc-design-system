# Design 022: Bank accounts kit gaps

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-25 · measured on main 55e65ed (Chromium 156, SF), probes in `tmp/story-shots/022/probe*`
- **Change note (TD-3):** life-os's `kit-gaps.md` now lists **`shield-lock`** too (the Today card „Neue Daten für Claude bestätigen“; outline and filled exist in Tabler 3.44.0). It is added with the other two; AC-17/18 apply to all three.
- **Spec premise corrected:** `@angular/router` *is* a peer dependency, used by `lc-sidenav` and `lc-bottom-nav`. The `list` entry still gets no router import (AC-20): lc-list is used outside routed apps.
- **021:** not designed yet. Both touch `table.component.*` and `list.component.scss`, with no API overlap (021: `TableColumn.align`, list badge tokens). Whichever is built second rebases. If `align` exists, the amount column in §8 uses `align: 'end'`; otherwise `cellClass` plus `text-align: end` in the story.

## 1. Approach

| Gap | Extend / new | Pattern followed |
|---|---|---|
| BA-1 | `lc-switch` + `helpText` | lc-checkbox `helpText`: id `<id>-help`, `aria-describedby`, 14/20 secondary, 4 px gap. Min-height through the kit token `--size-min-touch-height` (header, sidenav). |
| BA-3 | `lc-table` + `clickable`, `caption`, `showCaption` | lc-list `clickable`: the same name and contract (a tab stop, Enter/Space emit, nested controls keep their keys, set it when you handle the event). Visibility as a `show…` boolean (`showLabel`, `showLabels`). |
| BA-4 | **new** `lc-money` (`@lifecorner/angular-ui-kit/money`) | `locale` input like datepicker/calendar; hidden spoken text like lc-stat-trend's `__sr-only`. Exact decimal strings into `Intl`, ISO 4217 minor units. |
| BA-5 | `lc-next-step-card` + `actionsStyle` | A sibling of `actionsLayout`; the 3.15 `outline` + `tone="primary"` button; a dev warning like `primaryDisabled`. |
| TD-3 | inline set | `INLINE_TABLER_NAMES` in `scripts/generate-icon-names.mjs` + `wallet`, `building-bank`, `shield-lock`; regenerate. |
| TD-4 | `ListItem.href` + output `linkClick` | The clickable row's structure (`listitem` wrapper, the row element carries all row styles), with `<a>` instead of `div[role=button]`. |

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (switch) | `helpText` | `string` | `''` | Description below the label, linked to the switch by `aria-describedby`. Wraps; 14 px secondary text. |
| CSS hook (switch) | `--lc-switch-min-height` | length | `var(--size-min-touch-height)` (44 px) | Minimum height of a switch row with a label or help text. `0` restores the 3.15 row (21/24/28 px). Read at the use site, never declared on `:host` (020). |
| input (table) | `clickable` | `boolean` | `false` | Rows are interactive: each data row is a tab stop, Enter and Space emit `rowClick`, pointer and hover as `hoverable`. Clicks and keys on controls inside a row (buttons, links, inputs, switches) stay theirs and emit no `rowClick`. Set it whenever you handle `rowClick`. Tree mode keeps its roving tab stop. |
| input (table) | `caption` | `string` | `''` | Title of the table, rendered as its `<caption>`, so it also names the table for screen readers. |
| input (table) | `showCaption` | `boolean` | `true` | Show the caption above the table; `false` keeps it for screen readers only. |
| input (card) | `actionsStyle` | `NextStepCardActionsStyle` | `'default'` | `default`: filled primary, ghost secondary with a chevron, primary last. `equal`: two answers of the same weight, both `outline` in the primary tone at `actionSize`, primary first, no chevron. Use `actionSize="lg"` (44 px; dev warning otherwise). No effect on `[slot='actions']`. |
| type | `NextStepCardActionsStyle` | `'default' \| 'equal'` | — | |
| field (list) | `ListItem.href?` | `string` | — | URL of the row link. The row renders as an `<a>` over its full area (≥ 44 px). Not rendered with `href`: `action` (no control inside a link; dev warning). Not emitted: `itemClick` (see `linkClick`). With `disabled` the row is the plain disabled row, no link. |
| output (list) | `linkClick` | `ListLinkClickEvent` | — | A plain click (or Enter) on an `href` row: primary button, no Ctrl/Cmd/Shift/Alt. Emitted before the browser follows the link; call `event.preventDefault()` and navigate with your router for an in-app route. The kit never prevents the default; modifier and middle clicks are never emitted. |
| type | `ListLinkClickEvent` | `{ item: ListItem; event: MouseEvent }` | — | |
| component | `lc-money` / `MoneyComponent` | — | — | Displays an amount of money: locale, currency, sign, tabular figures, spoken text. Display only. |
| input (money) | `amountMinor` | `number` (required) | — | Amount in minor units of `currency` (cents, yen, fils), a safe integer (±9,007,199,254,740,991). Formatted exactly, never through a float. Anything else renders nothing (dev warning). |
| input (money) | `currency` | `string` (required) | — | ISO 4217 code. Minor units per ISO 4217: 2, except 0 (BIF CLP DJF GNF ISK JPY KMF KRW PYG RWF UGX UYI VND VUV XAF XOF XPF), 3 (BHD IQD JOD KWD LYD OMR TND), 4 (CLF UYW). Not `Intl`'s digits: CLDR gives 0 for HUF, IDR, RSD, IQD (measured). |
| input (money) | `locale` | `string` | `''` | BCP 47 locale. Empty: the app's `LOCALE_ID` (Angular's default `en-US`), the same on server and browser. |
| input (money) | `signDisplay` | `MoneySignDisplay` | `'auto'` | As `Intl.NumberFormat`: `auto` (negative only), `always`, `exceptZero`, `never`. |
| input (money) | `minusLabel` / `plusLabel` | `string` | `'minus'` / `'plus'` | Spoken words for the signs (EN = DE). |
| type | `MoneySignDisplay` | `'auto' \| 'always' \| 'exceptZero' \| 'never'` | — | |
| function | `formatMoney(amountMinor, currency, options?)` | `MoneyText \| null` | — | The component's formatter for table `formatter`s and texts. `options: MoneyFormatOptions` (`locale` default `'en-US'`, `signDisplay`, `minusLabel`, `plusLabel`); `MoneyText = { text, spoken }`; `null` for invalid input. |

**Default rendering unchanged:** switches without label and help text, tables without `clickable`/`caption`, cards without `actionsStyle`, lists without `href` render the 3.15 DOM. The one intended visual change: labelled switches grow to 44 px (AC-4; 7 stories, §9).

**Formatter (money):** (1) `Number.isSafeInteger`, else null. (2) `d` from the ISO table (upper-cased code). (3) Decimal string from the integer: `String(Math.abs(n)).padStart(d + 1, '0')`, point `d` from the end, `-` prefix if `n < 0` (−0 → `0`). (4) `new Intl.NumberFormat(locale, { style: 'currency', currency, signDisplay, minimumFractionDigits: d, maximumFractionDigits: d }).formatToParts(decimalString)`; in the `minusSign` part replace U+002D by **U+2212** (keeps bidi marks). (5) Spoken: the same with `currencyDisplay: 'name'`, `minusSign` → `minusLabel + ' '`, `plusSign` → `plusLabel + ' '`, all whitespace → one U+0020, trimmed. (6) Invalid locale → retry `en-US`; invalid currency → null. `dir`: `rtl` for the primary subtags ar, ckb, dv, fa, he, iw, ks, ps, sd, ug, ur, yi, else `ltr` (a fixed list, the same on Node and browser).

## 3. Anatomy and layout

**Switch with help text** (md, DE, story padding 16; measured prototype):
```
360: x16 text column w268 ─────────── x284 gap 12 x296 switch 48×24 x344
     │ Andere Erwachsene dürfen verwalten        │ (●───)   label 14/500/21
     │ Andere Erwachsene dürfen Verbindungen     │          help 14/400/20, 4 below, 2 lines
     │ und Konten verwalten                      │          row 66.5
1280: the same column at content width (help on 1 line), switch 12 after it; row 46.5
```
| Element | Size / spacing | Type | Token |
|---|---|---|---|
| row `.lc-switch-wrapper--help` | `align-items: flex-start`, min-height hook (44) | — | `--size-min-touch-height` |
| text column `.lc-switch-text` | flex column, gap 4, `min-width: 0`, `overflow-wrap: anywhere`; `padding-top` (track − 21)/2: md 0.09375rem, lg 0.21875rem; sm: switch `margin-top` 0.03125rem | — | — |
| label | unchanged | 14/500/21 | `--color-text-primary` |
| help `.lc-switch-help` (`<div id>`) | below the label, 4 px | 14/400/20 (0.875rem / 1.25rem) | `--color-text-secondary` |
| switch | top: its track centred on the label's first line | — | unchanged |
| label hit area | `::after` over the whole text column (`position: absolute; inset: 0` on the relative column), so a tap on the help text toggles too; no text in the accessible name | — | — |
| row without help text | min-height 44, `align-items: center`; label `align-self: stretch; display: flex; align-items: center` (44 px label target, same text position) | — | — |

Both `labelPosition` values render the text first and the switch after it (3.15 behaviour, see Notes); the help text sits in the text column. At 200 % (360): column 176, switch 96×48, label 4 lines, help 6 lines, no overflow; 320: column 136.

**Table, clickable rows + caption** (1024, canvas 992, md):
```
x16 Umsätze Oktober 2026                         caption 16/600/24, padding-bottom 12 → box 36, x = table edge
┌──────────────────────────────────────────────────────────────────────────┐ y52
│ DATUM       GEGENPARTEI              VERWENDUNG        BETRAG   STATUS     │ thead unchanged
├──────────────────────────────────────────────────────────────────────────┤
│ 30.10.2026  REWE Markt GmbH          Kartenzahlung      −42,17 €           │ row 46 (12 + 21 + 12 + 1)
╔══════════════════════════════════════════════════════════════════════════╗ focus: outline 2 px
║ 31.10.2026  Stadtwerke Beispielstadt Abschlag Oktober   −89,00 € Vorgemerkt║ --color-primary-500, offset −2
╚══════════════════════════════════════════════════════════════════════════╝ (paints over cells, probe shot)
```
360: the table scrolls in its wrapper (`responsive`); the caption is as wide as the table and scrolls with it. Hidden caption: the kit's clip pattern on `.lc-table__caption--hidden` (component scss, not the global `.sr-only`).

**lc-money** (`:host { display: inline; font-variant-numeric: tabular-nums; white-space: nowrap }`, font and colour inherited):
```
<lc-money class="lc-money">
  <span class="lc-money__amount" aria-hidden="true" dir="ltr">−42,17 €</span>   U+2212, U+00A0 from Intl
  <span class="lc-money__spoken">minus 42,17 Euro</span>                       clipped, user-select: none
</lc-money>
```
16 px SF, tabular: „1.111,11 €“ = „8.888,88 €“ = 81.42 px (proportional 63.77 / 80.08); „−42,17 €“ = „+42,17 €“ = 67.22 (hyphen-minus 64.69: U+2212 aligns with the plus sign).

**Next-step card, `actionsStyle="equal"`, `actionSize="lg"`** (prototype in *Default*):
```
360 (card 328 at x16; actions x36 w291)   1024 / 1280 (actions at the card's end, 8 apart, h48.5)
│▌[shield-lock] Gesundheitsbuchungen teilen?   │▌[shield-lock] Gesundheits…  [Ja, teilen] [Nein, nicht teilen] │
│▌[      Ja, teilen      ] y136, 291×48.5        │                              x658/914 w125.92  x792/1048 w191 │
│▌[  Nein, nicht teilen  ] y193 (8 apart: the narrow wrapping row)
```
At 200 % (card 312 at 360, 272 at 320): labels 36 px; „Ja, teilen“ 1 line (95 high) at 360, „Ja, | teilen“ at 320; „Nein, | nicht | teilen“ 185 high; breaks at spaces only, no overflow. `stacked` and the soft variant keep their gaps (8 / 12).

**List link rows** (md: padding 12/16, gap 12; sm: 8/12, gap 8): `a.lc-list__item.lc-list__item--link` inside `div.lc-list__item-wrapper[role=listitem]`, `color: inherit; text-decoration: none; min-height: var(--size-min-touch-height)`. md label-only rows stay 49; sm label-only rows grow from 38 to 44.
```
360 md, dividers: │ (JA) Girokonto  ING · •••• 4821   2.418,36 € │ 71 (subtitle) · whole row = <a>
360 sm (Today):   │ DKB  Stand heute 18:05       nur für dich │ ≥ 44 · │ und 2 weitere │ 44
```

## 4. States

| Part | Default · hover · focus-visible · active | Disabled · loading | Empty · error · overflow |
|---|---|---|---|
| switch help | unchanged control states; the help text never changes colour | disabled: help text stays secondary (no opacity: 0.5 would drop it below 4.5) | no help → no element, no `aria-describedby`; long DE text wraps (`anywhere` in the column only) |
| table clickable | hover `--color-surface-hover` + pointer; focus ring §3; active none | — | empty table: the empty row is not focusable; selected row keeps its fill under the ring |
| caption | static | — | `''` → no `<caption>`; long caption wraps at the table width |
| money | static, inherits | — | invalid amount/currency → empty host + dev warning; 9,007,199,254,740,991 renders exactly; never wraps |
| equal actions | outline primary: hover `--color-surface-selected`, active `--color-primary-200`, ring kit | `primaryLoading`/`primaryDisabled` + reason as today | labels wrap at spaces (§3) |
| link row | hover `--color-surface-hover`, active `--color-surface-sunken` (card: + `--color-border-strong`, `--elevation-1`, as clickable); focus inset ring 2 px `--color-primary-500` (existing rule) | `disabled` → plain row, `aria-disabled`, 0.5 opacity, no link | many rows: one tab stop each; long labels wrap (3.3) |

## 5. Theming

No new tokens. Computed with the WCAG formula on resolved colours (`tmp/story-shots/022/probe-contrast`); translucent fills composited.

| Element | Light | Dark | Contrast (min over its backgrounds) |
|---|---|---|---|
| switch help text | `--color-text-secondary` #4b5563 | #c4d2d9 | 7.56 surface / 6.66 soft-primary · 11.16 surface / 8.40 selected |
| table row ring, link-row ring | `--color-primary-500` #208497 | #84c7d4 | 4.37 surface, 4.18 striped, 3.97 hover, 3.76 selected · 9.13, 7.58, 8.18, 6.87 |
| caption | `--color-text-primary` | same | 17.74 · 17.29 (page) |
| equal buttons (outline primary) | text `--color-primary-700`, border `-600` | flipped scale | text 8.84 card / 8.05 soft-primary, border 6.21 / 5.48, hover text 7.85, active 6.71 · 11.38 / 10.11, 10.81 / 8.61, 9.55, 6.71 |
| link-row subtitle on hover | `--color-text-tertiary` | same | 5.30 · 6.01 |
| money | inherits | inherits | context; no tone input (AC-13: none needed by the requester; colour never carries the sign) |

`forced-colors`: table row and link-row rings `outline: 2px solid Highlight` (the list's box-shadow ring vanishes there; this also fixes clickable rows). Switch help and caption use system text colours.

## 6. Accessibility

- **Switch:** help `<div id="lc-switch-N-help">`; the `role="switch"` button gets `aria-describedby` only when `helpText` is set. VoiceOver/NVDA read name, state, then the help.
- **Table:** `<caption>` is the first child of `<table>` (name of `table` and of the tree mode's `treegrid`). Clickable rows: `tabindex="0"` on flat data rows in DOM order, nested controls follow their row. On the row itself (`event.target === row`): Enter and Space emit `rowClick`, Space `preventDefault()` (no page scroll). In clickable mode a click whose target sits inside `a[href], button, input, select, textarea, summary, label, [contenteditable], [tabindex]:not([tabindex="-1"]), [role=button|link|switch|checkbox|menuitem|tab|option]` (match ≠ row) emits nothing; without `clickable` clicks behave as 3.15. The row ring rule moves from `--striped` to every variant: tree rows in default/bordered tables had no visible ring (fix, behaviour unchanged). Limitation (document it): a focused row is announced by its cells, not as "clickable"; the row action should open something that announces itself (dialog, page).
- **Money:** visual text `aria-hidden`, spoken text in a clipped span, so it reads once: „minus 42,17 Euro“. No role, no `aria-label` (prohibited on a generic span). Copying the visible amount copies no words (`user-select: none`).
- **Equal actions:** two native buttons, primary → secondary in DOM and on screen; names = visible labels. **Link rows:** a real `<a href>` (link role, middle click, context menu); nothing interactive inside it (`action` dropped; templates must not hold controls in `href` rows); disabled → no link, not focusable.
- **Targets:** switch rows ≥ 44, table md rows 46 (sm rows are the consumer's choice), link rows ≥ 44, equal buttons 48.5. `prefers-reduced-motion`: nothing new animates.

## 7. Texts

| Key / input | EN default | DE |
|---|---|---|
| `lc-money` `minusLabel` / `plusLabel` | minus / plus | minus / plus |
| spoken currency names | from `Intl` (`currencyDisplay: 'name'`): „euros“, „US dollars“ | „Euro“ |
| dev warnings (English, dev mode) | `[lc-money] amountMinor must be a safe integer`, `[lc-money] unknown currency "…"`, `[lc-next-step-card] actionsStyle="equal" needs actionSize="lg" (44 px)`, `[lc-list] item "…" has href and action: the action is not rendered inside a link` | — |

No other new built-in strings: `helpText`, `caption` and the answer labels are the consumer's. Docs: `internationalization.mdx` gets the `lc-money` row (`locale`, default `''` = `LOCALE_ID`) and the two labels.

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| With Help Text | `form-switch--with-help-text` | label „Andere Erwachsene dürfen verwalten“, helpText (AC-3 DE sentence), md, argType `helpText` | AC-1, AC-3 |
| Help Text Sizes and Positions | `form-switch--help-text-sizes-and-positions` | sm/md/lg × left/right, EN + DE, one without help | AC-2 (44 px rows) |
| Help Text at 200 % Text | `form-switch--help-text-at-200-text` | `textSize` arg as the card's *LargeText* | AC-3 |
| Clickable Rows | `data-display-table--clickable-rows` | DE transactions, `clickable`, caption „Umsätze Oktober 2026“, `lc-money` amount column (`align: 'end'` if 021 is in), status badge, one icon action + one `lc-switch` cell, `rowClick` action | AC-5, AC-6, AC-7, money in an end column |
| Hidden Caption | `data-display-table--hidden-caption` | `showCaption=false`, `hoverable` | AC-7 |
| Default | `data-display-money--default` | −4217 EUR de-DE, controls for all inputs | AC-9 |
| Locales and Currencies | `data-display-money--locales-and-currencies` | EUR/USD/JPY/KWD × de-DE/en-GB/en-US; −4217, 0, 123456789, 9007199254740991 | AC-9, AC-10 |
| Sign Display | `data-display-money--sign-display` | the 4 values × −4217 / 0 / 4217 | AC-11 |
| Tabular Figures | `data-display-money--tabular-figures` | end-aligned column: 111111, 888888, −4217, +4217 | AC-12 |
| In Text and RTL | `data-display-money--in-text-and-rtl` | a sentence; a `dir="rtl" lang="he"` block with a de-DE amount; 360 nowrap | AC-12 |
| Equal Answers | `feedback-next-step-card--equal-answers` | tone primary, icon shield-lock, „Gesundheitsbuchungen teilen?“, „Ja, teilen“ / „Nein, nicht teilen“, `actionsStyle` equal, lg | AC-15 |
| Equal Answers Stacked | `feedback-next-step-card--equal-answers-stacked` | soft, `actionsLayout` stacked, EN + DE | AC-15 |
| Equal Answers at 200 % Text | `feedback-next-step-card--equal-answers-at-200-text` | `textSize` | AC-16 |
| Link Rows | `data-display-list--link-rows` | accounts (avatars, `lcListItem` with `lc-money`), `href`, one disabled, dividers | AC-19, AC-21 |
| Link Rows Small | `data-display-list--link-rows-small` | Today sources line: sm, subtitles, badge „nur für dich“ | AC-19 (44 px) |
| Link Rows with the Router | `data-display-list--link-rows-with-router` | `(linkClick)` logs and prevents; docs snippet with `router.navigateByUrl` | AC-20 |
| Finance Icons | `components-icon--finance-icons` | 3 names × 5 sizes outline; shield-lock solid; text on the missing filled glyphs | AC-17, AC-18 |
| Finance Destination | `navigation-bottom-nav--finance-destination` | Heute `sun`, Finanzen `wallet` (activeRoute), Haushalt `home` | AC-18 |
| Finance Destination | `navigation-sidenav--finance-destination` | section „Bereiche“: Finanzen `wallet` active, Banken `building-bank` | AC-18 |

Every new argType has `description` and `table.defaultValue`. Money docs: the component description lists the ISO exceptions, the `LOCALE_ID` default and the `formatMoney` snippet.

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1 | unit: describedby = help id; two switches → distinct ids | `lc-switch-N-help` |
| 2 | `--measure` row height, 360/1280, sizes × positions | ≥ 44 every row; md + 2-line DE help at 360: 66.5 |
| 3 | measure 320/360 at 100/200 %: label/help `scrollWidth ≤ clientWidth`, doc `scrollWidth` = width; §5 | no overflow; help 7.56 / 11.16 |
| 4 | specs unchanged; `--compare=022/baseline` | differ only: switch default, checked, loading, disabled, label-left, all-variants, sizes (taller rows); notification-settings and feature-flags identical |
| 5 | unit (Enter/Space emit, Space prevented, tabindex 0); story: focus row 2, shot | ring 2 px #208497 / #84c7d4, ≥ 3.76; forced-colors rule present |
| 6 | unit: keydown/click from a button, link, `lc-switch` in a row → no emit; tree specs unchanged | 0 emits |
| 7 | unit: `table.caption` text, axe `accessibleText(table)` | „Umsätze Oktober 2026“, visible box 36 px / hidden |
| 8 | specs unchanged; compare 19 table stories | all identical |
| 9–10 | unit (Node = server): strings below; story measure (browser) gives the same | `−42,17 €`, `−€42.17`, `−$42.17`, `1.234.567,89 €`, `90.071.992.547.409,91 €`, `−4.217 ¥`, `−4,217 KWD` (U+2212, U+00A0) |
| 11 | unit spoken text per sign mode; axe accessible text of a cell; manual VoiceOver/NVDA note | „minus 42,17 Euro“, „minus 42.17 euros“, „plus …“ for always/exceptZero, none for never |
| 12 | measure widths of 1.111,11 vs 8.888,88; nowrap at 360; `dir` | equal widths (81.42 at 16 px); one line |
| 13 | color = parent color | inherited |
| 14 | compat `EXPECT_IN_HTML`: `de-DE` instance and one on `LOCALE_ID`; accept `&nbsp;` or U+00A0 (domino escapes it, 008) | both spans in the HTML before JS |
| 15–16 | unit (order, variants, outputs, announce, disabled); stories at 360/1024/1280 L/D; compare 14 card stories | §3 boxes; 48.5 px; old stories identical |
| 17–18 | `icon-catalog.spec`, `kit-icons.spec`, `isInlineIconName`; measure: no `resource` entry for `/tabler-icons/outline/{wallet,building-bank,shield-lock}`; changelog bytes (raw, gzip) | true ×3, 0 fetches |
| 19–22 | unit: `<a href>`, contents inside, `linkClick` only for plain clicks, `defaultPrevented` false; disabled → no `a`; action not rendered; axe on link stories; 17 list stories + density + app-shell identical | 0 axe violations; rows ≥ 44 |
| 23–25 | stories 360/1024/1280 L/D, EN + DE; tools tests; library build; compat 21/22 | — |

- **Risks (agent memory):** hooks read at the use site (020); module counter ids (016); no `[style.x]` in new markup (011, CSP); NBSP serialised as `&nbsp;` (008); `anywhere` only on the switch text column, which has `min-width: 0` beside a fixed switch (010); accessible names across adjacent spans need spaces in consumer templates (015).
- **Baselines:** `tmp/story-shots/022/baseline`: 82 stories at 360/1280, light/dark, `--full`, main 55e65ed, 328 shots: switch 9, next-step-card 14, icon 6 (not *All Icons*), table 19, bottom-nav 8, list 17, density 3, app-shell 6 (the stories with `lc-list`).
- **Notes (not in scope):** `labelPosition="right"` renders the label *left* of the switch (row-reverse of [button][label]), so both values look the same. Fixing it changes every default switch, so it needs a separate request. `wallet` and `building-bank` have no Tabler filled glyph: `variant="solid"` requests `filled/<name>.svg` and shows the placeholder, like every inline name without a filled glyph (document it on the icon page).
