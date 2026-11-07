# Build 056: lc-state-strip, dl badge/total, list chevron, header contextBadge, hero headingLevel/focusTitle, band, table footerRow/action ariaLabel, card collapsible, inverse-outline, backlog

- **Branch:** `feat/3.36-state-strip-footer-collapse` (from main 6dd4cdc)
- **Commit:** see `git log -1` on the branch, `feat(state-strip,description-list,…): …` (one commit, amended)

## Files changed

| File | Change |
|---|---|
| `state-strip/` (new: component ts/html/scss, spec, stories, `index.ts`), stub `libs/angular-ui-kit/state-strip/ng-package.json`, `src/index.ts` | new entry (§2, §3, §6); both READMEs list it |
| `description-list` ts/html/scss | `badge`, `badgeVariant`, `total` on items, `totalAriaLabel` input (D-2) |
| `list` ts/html/scss | `showChevron`, `ɵprovideKitIcons([ICON_CHEVRON_RIGHT])` |
| `header` ts/html/scss | `contextBadge` (+ `HeaderContextBadge`), name with the badge word, 340 px cap (D-4); `hamburgerClick: output<HTMLElement>` (D-10) |
| `hero` ts/html/scss | `headingLevel` (+ `HeroHeadingLevel`), `focusTitle()` with `aria-labelledby` (D-5), two-tone ring |
| `stacked-bar-chart` ts/html/scss | `variant` (+ `StackedBarVariant`), `%` band, gap hooks, dev warning (D-6) |
| `table` ts/html/scss, `table-cell.directive.ts` | `footerRow` in `<tfoot>` (D-7), `TableAction.ariaLabel` |
| `card` ts/html/scss | `collapsible`, `expanded = model(true)`, toggle in the heading, chevron (D-8) |
| `button` ts/html/scss, `button-link.component.ts` | `inverse-outline`; `inverse` ring gets the dark band (D-9) |
| `combobox` ts/html | `announceError` (`@if`, so the default `<span role="alert">` keeps its attribute order) |
| stories: all §8 stories; tag-input (D-11), sidenav (description) | argTypes with description + default |
| specs new (10 files, 126 tests): `state-strip.component`, `description-list.badge-total`, `list.chevron`, `header.context-badge`, `hero.heading-focus`, `stacked-bar-chart.band`, `table.footer-row`, `card.collapsible`, `button.inverse-outline`, `combobox.announce-error` | |
| specs changed: `alert.close-target` (055-n2), `description-list.wrap`, `entries`, `theme-contrast` (+056 block) | see Deviations 4 |
| `tools/compat`: `probe-336.ts`, `home.ts/html`, `EXPECT_IN_HTML` (+8), `check-entries.mjs` (120 → 121) | |

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1–3 | `state-strip.component.spec` (16): order, empty host, names EN/DE, roving keys, caption, axe; compat probe |
| 4–6 | `theme-contrast` 056 block (marks L 4.81/5.47/11.43/4.39, D 6.97/6.34/7.21/5.56, floored); shots: 240 × 32 at 360, marks 4/11, 17/11, 8/16, 15/2; 30 runs 10.92 px cells, 60 runs 5.45 px, overflow 0; empty `display: none`; manifest (temp test) |
| 7, 11, 12 | `description-list.badge-total.spec` (14); shots: badge row 38.5 (md), 27 (sm); total 1 px solid / 3 px double `#6b7280`; „Summe, Gesamtkosten Ist 522.530,00 €“ |
| 8 | `list.chevron.spec` (8): clickable + href rows only, after trailing, `aria-hidden`; 20 px, `--color-text-tertiary` |
| 9, 10 | `header.context-badge.spec` (12); shots: button 352 × 49.61 (360 below), 303–340 × 49.61 (800–1280), long name 240/422 px with ellipsis, header overflow 0 |
| 13, 14 | `hero.heading-focus.spec` (17); shots: every hero title `sameAsH1` (font, weight, line height, margins, letter spacing, height) on 9 bands, sm/md/lg/slim/light; one `h1` in *Heading Level* |
| 15, 16 | `stacked-bar-chart.band.spec` (8); shots: left/right gap 0/0 at 328 and 928 px, parts 41.2 … 6.8 %, h 24; band parts ≥ 3:1 (contrast spec) |
| 17–20 | `table.footer-row.spec` (11): tfoot last under sort/filter/page/collapse, not selected, `rowheader`/`gridcell` in tree mode, footer context, names per row; shots 800/1024/1280: footer label x = level-0 label x (52) |
| 21–24 | `card.collapsible.spec` (17): model, ids, `hidden`, no nested button, footer `display: none` + axe; shots: head 45.6 (closed, no subtitle wrap) … 123.6 px, `elementFromPoint` centre and start = toggle, action = action; prerender `hidden` |
| 25, 26 | spec (tabindex −1, activeElement, labelledby); *Focus Title* shot: focused, `aria-labelledby="lc-hero-label-2 lc-hero-title-1"`, ring white 2 px + `#111827` 2 px; ring ≥ 4.23 (spec) |
| 27, 28 | `button.inverse-outline.spec` (13): text 4.66 / 6.19, keyline and ring 3.56 / 4.23, white alone 2.01 / 2.26; shots: `inverse` = `inverse-outline` 48.5 / 42 / 35.5 (lg/md/sm), icon-only 45.59 |
| 29 | tag-input *Keyboard Focus*, *Touch Targets (DE)*, *Long Tags* bind the five args; 12 shots identical |
| 30 | `alert.close-target.spec`: per-rule pins + mutation test (unrelated rule added: assertions hold) |
| 31 | `header.context-badge.spec` (native `<button>`, `$event` and no-`$event` handlers); compat probe under strictTemplates |
| 32 | `combobox.announce-error.spec` (3); *Error After Submit*: no role, `aria-describedby`, focus in the input |
| 33 | No Playwright/WebKit in `node_modules` (checked 2026-11-07 16:19): 054-n2 stays in BACKLOG (row untouched here, see Deviations 6) |
| 34 | gates below |

Default DOM: a temp spec rendered 21 input sets of the 9 changed templates with main's template and the branch's: all identical apart from comment anchors (`tmp/056/old-new.txt`).

## Gates

All gates ran on the tree of commit `4d8d21a4c626533a35e27b1be2f7e4b009a62c2c` (later agents skip a gate while `git diff --quiet 4d8d21a -- libs tools` holds; the amend after it adds only `requests/`). Logs in `tmp/056/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 292 suites, 6152 passed, 8 skipped (`--maxWorkers=4`, clean; +10 suites, +126 tests) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | green, 122 entries built (+1) |
| `npm run test:tools` | 22 / 22 (+ a temp manifest test: every new input extracted with its default, deleted) |
| `npx nx run angular-ui-kit:build-storybook` | green, 1109 stories (+21) |
| Story screenshots | baselines: `build-1…4`, 762 / 768 identical; the 6 others are the unstable table shots of §9 (pixel diff only in the Salary column, x 1031–1102, `table-diff.log`). New: `build-new` (21 stories × 360/1280 L/D, + footer row and context badge at 800/1024), `--axe`: 0 violations except *Chevron Rows* (F-2) |
| `node tools/compat/check-angular-majors.mjs --only=22` | all ok, 110 HTML checks (+8) |

## Deviations from the design

1. D-11: the five tag-input args are bound with the component defaults as fallbacks in each `render` (`behaviour(args)`), not as meta `args`: meta args would also bind the 6 other stories, and `maxTags: Infinity` doesn't survive a JSON args round trip. Same result: every control works, 12/12 shots identical.
2. AC-19: in tree mode the footer's `th` is `role="rowheader"` (§6 says gridcells; AC-19 verifies `rowheader`); its `td`s are gridcells.
3. Strip marks inset `min(3px, 25%)` as §3: at 30 runs in the 328 px story the mark is 5.48 px (§4's 3.8 equals a plain 3 px inset at 294).
4. Specs changed with reason: `description-list.wrap` cuts the appended 3.36 block before its 3.25.2 hash (pinned values unchanged; the cut part holds only badge/total/sr-only selectors); `entries.spec` 114 → 115 public; `theme-contrast` pins floored values (warning 5.47/6.34, error 11.43, ring 3.96/7.57, caption 17.73/15.85 vs §5's rounded).
5. `.card-collapsible .card__header` also gets `cursor: pointer` (the toggle's `::after` covers the head anyway).
6. `requests/BACKLOG.md` already holds the spec-writer's uncommitted edits, so 054-n2 is not touched here; release-manager: add „still open after 056 (2026-11-07): no Playwright/WebKit installed“.
7. Story fix found by shots: *Band* passes its data as constants, since args left out of `controls.include` reached the custom template undefined (blank shot before).

Follow-ups for `release.md`: F-1 (design §1) chart palette success/warning < 3:1; **F-2 (queue, should-fix)** `lc-list` `clickable` row with a built-in `action` is a button inside `role="button"` (axe `nested-interactive`, WCAG 4.1.2), since 3.3; DOM identical to main (temp spec), surfaced by *Chevron Rows*; 054-n2 (backlog).

## Changelog draft

```markdown
## [3.36.0] - 2026-11-07

Finance Intelligence's model pages without workarounds: a state strip for load runs, badges and a sum row in fact lists, chevrons on list rows, the snapshot state in the header, a quieter action and a focusable title on the hero stage, a distribution band, a table footer row with row-specific action names, and cards that close. No API breaks.

### Added

- **`lc-state-strip`** (new entry `@lifecorner/angular-ui-kit/state-strip`; quellen-2026-11-06 row 1): the states of the last runs, one segment per run, oldest first (`segments: { state: 'success' | 'warning' | 'error' | 'neutral'; label }[]`). The state is a shape (upper block, lower block, centred block, flat dash) in the state inks, so it reads without hue and in forced colours; every ink keeps 3:1 on every page and surface (light ≥ 4.39, dark ≥ 5.56). An APG grid with one Tab stop: arrows, Home and End move between the runs, each named „label, state“; the strip is named `ariaLabel` plus the counts („Letzte 10 Ladeläufe, 9 geladen, 1 fehlgeschlagen“, words from `stateLabels`, English defaults). Ten runs are 240 × 32 px; 30 or 60 runs share a 328 px column without overflow; without segments nothing renders. Prerendered. Hooks `--lc-state-strip-height` (2rem), `--lc-state-strip-segment-max-width` (1.5rem).
- **`lc-description-list` `badge`, `badgeVariant`** (quellen row 2): an item's value as an `lc-badge` (rounded, `sm`; `xs` in `size="sm"` lists), still one `dt`/`dd` pair. A value equal to the badge (or empty) is not shown; another value stays as text before it. Badge rows are 38.5 px (md).
- **`lc-description-list` `total`, `totalAriaLabel`** (app-shell-2026-11-07 row 2): the sum item, with a 1 px rule above and a 3 px double rule below (`--color-field-border`, 4.39:1 light, 5.56:1 dark), semibold, tabular figures; `totalAriaLabel="Summe"` is read before its term.
- **`lc-list` `showChevron`** (quellen row 3): a decorative `chevron-right` (20 px) ends every `clickable` or `href` row; row height, target, focus ring, badge and `actionClick` unchanged.
- **`lc-header` `contextBadge`** (app-shell row 1): `{ label, variant? }` as an `lc-badge` inside the context button after the name; its word ends the button's name („Monatsstand wählen, Monatsstand Oktober 2026 · Fassung 1, Freigegeben“). The button stays 49.61 px high and may grow to 340 px; a long name ends with „…“.
- **`lc-hero` `headingLevel`** (cockpit-2026-11-07 row 1): the title as `h1`–`h6`, the same look at every level, size and breakpoint (measured on all nine bands). Use 2 under an `lc-page-header`.
- **`lc-hero` `focusTitle()`** (monatsstand-2026-11-07 row 1): focuses the title (`tabindex="-1"`) after an action replaced the stage; with a `label` it is read „label title“. Two-tone ring (white over `#111827`, ≥ 4.23:1 on every band).
- **`lc-stacked-bar-chart` `variant="band"`** (cockpit row 2): one horizontal bar edge to edge (0 px gaps at 360 and 928 px), `height` thick, scaled 0 … sum, parts split by a 2 px surface gap (`--lc-stacked-bar-chart-band-gap`, `-gap-color`); exact in prerendered HTML. One category only.
- **`lc-table` `footerRow`** (services-2026-11-07 row 1): one `<tfoot>` row below all data rows, with the columns, formatters and `lcTableCell` templates (`footer: true`); never sorted, filtered, paged, selected or counted; first cell is the row header; ledger rules as the list total.
- **`TableAction.ariaLabel`** (services row 2): a string or `(row, rowIndex) => string`, so each row's button names its object („Herkunft von Demo Netz“) while the visible label stays.
- **`lc-card` `collapsible`, `[(expanded)]`** (regeln-2026-11-07 row 1): the head becomes one toggle (a button in the heading, `aria-expanded`, `aria-controls`, at least 44 px, the whole head clickable); body and footer close; `[card-header-action]` stays its own control; a chevron shows the state. Open by default; `[expanded]="false"` is closed in prerendered HTML too.
- **`lc-button` / `a[lcButton]` `variant="inverse-outline"`** (monatsstand row 2): the quieter action beside `inverse` on the hero bands: text ≥ 4.66:1, border and ring ≥ 3.56:1 on all nine bands; same heights (48.5 / 42 / 35.5 px).
- **`lc-combobox` `announceError`** (055-n4): `false` drops `role="alert"` (error stays visible and in `aria-describedby`), for a focus moved to the field after a 422 under an error summary.

### Changed

- **`inverse` focus ring**: a 2 px `#111827` band inside the white ring; the white ring alone was 2.01:1 on the warning band (now ≥ 3.56). At rest unchanged.
- **`lc-header` `hamburgerClick`** (055-n3) emits the hamburger's `<button>`, e.g. `(hamburgerClick)="trigger = $event"` with `lc-sidenav [returnFocusTo]="trigger"`.

### Compatibility

- No API breaks: optional inputs, a method, a variant and a model; defaults render as 3.35.0 (DOM identical apart from Angular comment anchors). `hamburgerClick` changes from `output<void>` to `output<HTMLElement>`: template handlers with or without `$event` compile unchanged under strictTemplates; only TypeScript code that types the subscriber's parameter as `void` needs updating.
```
