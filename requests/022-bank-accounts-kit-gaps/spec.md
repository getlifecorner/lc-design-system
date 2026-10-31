# Spec 022: Bank accounts kit gaps

- **Status:** ready
- **Type:** new component (`lc-money`) + extensions of `lc-switch`, `lc-table`, `lc-next-step-card`, `lc-list`, the inline icon set
- **Affected:** `lib/switch/`, `lib/table/`, `lib/next-step-card/`, `lib/list/`, `lib/icon/` (inline index, `icon-catalog.ts`), new `lib/money/` (+ `libs/angular-ui-kit/money/ng-package.json`, `index.ts`, line in `src/index.ts`), stories, both READMEs, CHANGELOG, MCP manifest
- **Semver impact:** minor. All new inputs are optional and default to today's rendering; one new entry point.

## Need

Spec 004 "Connect bank accounts" in life-os (UX gate 2, owner decision 2026-10-31: kit first, the screens wait for the release; life-os is pinned to 3.11.4). The Finances, connection, account and Today screens need six parts the kit lacks. Each has a local workaround today; the owner does not want these rebuilt locally.

| Gap | Page | Fails today |
|---|---|---|
| BA-1 | Connection page "Andere Erwachsene dürfen verwalten"; settings health sharing | Switch has no description linked by `aria-describedby`; row height not guaranteed 44 px |
| BA-3 | Account page transactions from 1024 px | Rows react to mouse only; no table caption |
| BA-4 | Every Finances board, Today sources line | No money display: locale, currency, sign, tabular figures, spoken reading |
| BA-5 | One-time health question card | `primaryLabel` and `secondaryLabel` are styled by weight; a question with two equal answers looks like a primary and a secondary |
| TD-3 | `lc-bottom-nav`, `lc-sidenav`, connect cards | `wallet` and `building-bank` are not in the inline set, so they are fetched or need `provideLcIcons` |
| TD-4 | Today sources line, account rows on Finances | A list row cannot be a real link |

## What the kit has today

| Gap | Found | Why it falls short |
|---|---|---|
| BA-1 | `lc-switch` inputs: `label`, `labelPosition`, `ariaLabel`, `size`, `loading`, … (`switch.component.ts:51-96`); no help text | Gap is real |
| BA-3 | `lc-table` has `rowClick` (`table.component.ts:355`), `(click)` on every `tr`; `tabindex` only in tree mode (roving, `rowTabindex`, :885). No `caption` in `table.component.html` | Flat rows are not keyboard stops. Gap is real |
| BA-4 | No money/currency formatting in the kit. `lc-stat-trend` shows a trend, not an amount. Request 021 adds `TableColumn.align: 'end'` with tabular figures | Gap is real; `lc-money` complements 021, does not depend on it |
| BA-5 | `lc-next-step-card`: `actionsLayout`, `actionSize`, `primaryLabel`, `secondaryLabel`, `linkLabel`, `primaryClick`, `secondaryClick`; styling fixed by role | Gap is real. The `actions` slot (requester's interim) gives up the card's `announce` and disabled-reason behaviour |
| TD-3 | `icon-aliases.ts:18` maps alias `account_balance` to `building-bank`, but neither `wallet` nor `building-bank` is in the inline index (`isInlineIconName` decides; AC-17 checks it) | Gap is real |
| TD-4 | `lc-list` has `clickable` + `itemClick` (rows operable, but a `div`/button, not a link) and `ListItem` has no `href` | Gap is real. No middle-click, "open in new tab", or link semantics |

## Scope

- In: the six gaps below, with stories, tests, docs and changelog.
- Not in: number-column alignment in `lc-table` (request 021); a currency conversion or exchange-rate logic; parsing user input of amounts (`lc-money` is display only); an `@angular/router` dependency; changing `lc-stat-trend`.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `lc-switch` has optional `helpText` (JSDoc, `@default` ''). When set, the text renders below the label and the switch control has `aria-describedby` pointing to its element id. Ids are unique with several switches on a page. | unit test + story |
| AC-2 | A switch with a label, with or without `helpText`, has a host/row height of at least 44 px for `size` sm, md, lg (and with `labelPosition="left"`). | story + `--measure` at 360 and 1280 |
| AC-3 | `helpText` wraps (no truncation) with the DE sentence "Andere Erwachsene dürfen Verbindungen und Konten verwalten" at 360 px and at 200 % text; no horizontal scroll. Colour contrast of the help text is at least 4.5:1 in light and dark. | story + `--measure`; `theme-contrast.spec.ts` or computed ratio |
| AC-4 | Switch without `helpText`: DOM has no `aria-describedby` and no empty help element; every existing switch spec passes unchanged. If the 44 px minimum changes the size of existing `sm` switches, this is recorded in the changelog and counted as the single intended visual change. | existing specs + hash compare of existing switch stories |
| AC-5 | `lc-table` has an opt-in way to make data rows keyboard stops in flat mode (name chosen by the designer; default off). When on: rows are in the tab order, Enter and Space emit `rowClick` with the row, a focus ring is visible (`:focus-visible`, 3:1 in both themes, forced-colors), and Space does not scroll the page. | unit tests + story + contrast |
| AC-6 | With the opt-in on, Enter or Space on an action button, link, switch or other control inside a row does not emit `rowClick` (as clicks today, `table.component.ts:69`). Tree mode keeps its roving tabindex and is unchanged. | unit test |
| AC-7 | `lc-table` has optional `caption` (JSDoc, default empty), plus a way to show it visibly or visually hidden (designer decides: input or value). It renders as a `<caption>` first in the `<table>`, so the table's accessible name is the caption. | unit test (`<caption>`, accessible name) + story |
| AC-8 | Without the opt-in and without `caption`, the table DOM is identical to today: no new `tabindex`, no `<caption>`, and all existing table specs pass unchanged. | existing specs + hash compare |
| AC-9 | New `lc-money` (selector `lc-money`, entry `@lifecorner/angular-ui-kit/money`) takes `amountMinor` (integer, required), `currency` (ISO 4217, required), `locale` (optional; default as the kit's other locale-aware parts, designer decides), `signDisplay` (at least `auto`, `always`, `never`, `exceptZero`, same meaning as `Intl.NumberFormat`). Minor-unit exponent follows the currency (EUR 2, JPY 0, KWD 3), not a fixed 100. | unit tests for EUR, USD, JPY, KWD, negative, zero |
| AC-10 | Output in `de-DE`: `-4217`, EUR gives "-42,17 €" visually (sign style per the designer); in `en-GB`/`en-US`: "-€42.17" / "-$..." per `Intl`. Large values: 123456789 minor EUR renders with the locale's grouping. No float rounding errors (e.g. 1 minor unit, 99999999999999 minor units stay exact or the limit is documented and tested). | unit tests |
| AC-11 | Spoken reading: the element has an accessible text in words, "minus 42,17 Euro" (DE) and "minus 42.17 euros" (EN), via a visually-hidden text or `aria-label` on a role that supports it (designer decides; must read correctly in VoiceOver and NVDA, with the visual text not read twice). The sign word is part of it for `signDisplay` `auto` (negative), `always`, `exceptZero`; none for `never`. | unit test (accessible name) + manual SR note in `review.md` |
| AC-12 | Tabular figures: the digits use `font-variant-numeric: tabular-nums`; "1111,11" and "8888,88" render with equal width. Text is not wrapped inside the amount at 360 px (non-breaking space between number and currency symbol). Amounts are right-to-left safe (`dir=ltr` isolate for the number in `rtl`). | story + `--measure` of two widths |
| AC-13 | `lc-money` follows the text colour of its context by default; an optional sentiment/tone (e.g. negative, positive, neutral) is allowed only if every tone reaches 4.5:1 in light and dark, and colour is never the only carrier of the sign. | contrast + story |
| AC-14 | `lc-money` is correct in prerendered HTML before JavaScript (formatted string and spoken text present) and gives the same string on server and browser (no hydration mismatch with `Intl` on Node vs. browser for `de`, `en`). | compat check (`EXPECT_IN_HTML`) or SSR spec |
| AC-15 | `lc-next-step-card` can render the two actions with equal visual weight (API per designer: `secondaryVariant` or `actionsStyle="equal"`). Both buttons are the same variant and size, both are 44 px high, they keep order (primary first), and stack at 360 px (full width) and sit side by side from the width where `actionsLayout` allows it. `primaryClick` and `secondaryClick` keep firing; `announce` and `primaryDisabled` still work. | unit test + story at 360 / 1024 / 1280, light and dark |
| AC-16 | Without the new input, the next-step card renders exactly as before. Existing specs unchanged. DE labels "Ja, teilen" / "Nein, nicht teilen" fit at 360 px and 200 % text. | existing specs + hash compare |
| AC-17 | `wallet` and `building-bank` are in the inline set: `isInlineIconName('wallet')` and `isInlineIconName('building-bank')` are true; `<lc-icon name="wallet">` and `name="building-bank"` render the SVG with no network request and no `provideLcIcons` registration, in `outline` (and `solid` if the set provides it for other names; if Tabler has no solid, the fallback is documented). Alias `account_balance` still resolves. | `icon-catalog.spec.ts`, `kit-icons.spec.ts`, icon spec with no fetch |
| AC-18 | The two icons appear in `lc-bottom-nav` and `lc-sidenav` stories (item with `icon="wallet"`), including the active state, and in the icon story/catalog. Inline index growth is stated in the changelog (bytes, gzip); `ICON_NAMES` dev warning does not fire for them. | stories + size note |
| AC-19 | `ListItem` has optional `href` (JSDoc). When set, the row renders as an `<a>` that covers the full row area (target at least 44 px high), with real link semantics (role link, middle-click, "open in new tab", focus ring, `:focus-visible`). The row's contents (label, subtitle, badge, metadata, avatar) stay inside the link. | unit test + story |
| AC-20 | A router-friendly route exists without a kit dependency on `@angular/router`: either the consumer's `routerLink` on a projected link, or an `itemClick`-compatible way where a plain click on an `href` row does not do a full page load when the consumer prevents it. The designer states which; the doc page shows a snippet. Modifier-clicks (Ctrl/Cmd/Shift, middle) are never intercepted by the kit. | unit test (event not default-prevented by the kit) + docs |
| AC-21 | A row with `href` and an `action`/second control: no interactive element nested in the `<a>` (invalid HTML). The designer defines the combination (e.g. the action is a sibling, or the combination is not allowed and documented). `disabled` with `href` renders no link (`aria-disabled`, not focusable as link). | unit test + axe |
| AC-22 | List without `href` (also `clickable`): DOM and behaviour unchanged, existing specs unchanged. | existing specs |
| AC-23 | For all new parts: light and dark, `forced-colors`, `prefers-reduced-motion`, no raw colours; verified at 360, 1024 and 1280 px with English and German text. | stories + `story-shots.mjs` |
| AC-24 | Every new input has JSDoc with `@default`; every new input, slot or variant has a story with argType description and `table.defaultValue`; `lc-money` has a docs entry. READMEs list `lc-money`; CHANGELOG (Added, Compatibility) names the gap IDs and the life-os pages; `get_changelog` and the MCP manifest show `lc-money` and the new inputs (`npm run test:tools`). | tools tests + review |
| AC-25 | New entry point `@lifecorner/angular-ui-kit/money` builds; `src/index.ts` re-exports it; imports across folders use package paths. Consumer check on Angular 21 and 22 (AOT, strictTemplates, prerender) passes. | library build + `check-angular-majors.mjs` |

Always covered unless not applicable: 360 px and desktop widths · light and dark · keyboard and screen reader · EN and DE lengths · prerendered HTML before JavaScript · unchanged defaults. All of these are in the rows above.

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency (`Intl` is built in), no API break.
- Strict CSP with Trusted Types for life-os: no inline `style` attributes or scripts from the new parts (see the lc-icon CSP history, 3.11.1).
- Bundle: life-os has a 150 kB gzip initial JS budget. `lc-money` is its own entry point, and the icon growth is small and measured (AC-18).

## Assumptions

- Assumption: all six gaps are real and go into one minor release (they share one consumer spec and one deadline). One request, no split.
- Assumption: opt-in for focusable table rows (not "always on"), because adding tab stops to every existing flat table would change keyboard behaviour for current consumers. This keeps AC-8 true.
- Assumption: `lc-money` is display only and takes integer minor units; the exponent follows ISO 4217 via `Intl`, not a fixed 100.
- Assumption: `lc-money`'s default locale follows what the kit does for other locale-aware parts; the designer checks `lib/` and picks the same mechanism.
- Assumption: where the requester proposes two names (BA-5 `secondaryVariant` or `actionsStyle="equal"`; TD-4 `href` plus a router variant) the designer picks one; the AC test the behaviour, not the name.
- Assumption: no `@angular/router` import in the kit (it is not a peer dependency for the other parts); TD-4's router case is solved with the consumer's `routerLink` or event handling (AC-20).
- Assumption: the 44 px switch minimum is a bug-class fix and not a break, but is called out in the changelog if an existing `sm` switch gets taller (AC-4).
- Assumption: request 021 and this request both touch `lc-table`. 021 adds `TableColumn.align`; 022 adds row focus and `caption`. They do not overlap in the API. The later one to be built rebases on the earlier one. `lc-money` inside an `end`-aligned column should be shown as a story once both are in.

## Open questions

None for the owner. The decisions above change names and details, not what gets built.

## Resolution

Not applicable: nothing here is covered by the kit today.
