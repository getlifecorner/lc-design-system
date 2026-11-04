# Build 047: datepicker and combobox clear targets, combobox lg input, datepicker label, selected day, day panel targets

- **Branch:** `feat/3.30-datepicker-combobox-targets-label`
- **Commit:** `feat(datepicker): clear targets, label, selected-day ring, day panel targets; combobox clear and lg input (047)` (one commit, amended)

## Files changed

| File | Change |
|---|---|
| `lib/datepicker/datepicker.component.ts` | `label` input (`@default ''`); `ariaLabel` JSDoc "Ignored while `label` is set"; `onClearClick()` clears and focuses the field (`clear()` itself stays focus-neutral); month field Enter rewrites the text to the committed month before closing (046-n4) |
| `lib/datepicker/datepicker.component.html` | `@if (label())` `<label class="lc-datepicker__label" [for]="inputId">`; `aria-label` only without `label`; clear `(click)="onClearClick($event)"`; overlay `[cdkConnectedOverlayPush]="true"`, `[cdkConnectedOverlayViewportMargin]="8"` |
| `lib/datepicker/datepicker.component.scss` | `.lc-datepicker__label` (§3); clear 24 box recipe, ring offset −1, md/lg `::before` hit area; `.lc-datepicker-calendar` `position: relative` (deviation 1); selected-day inset ring; `@media (max-width: 1023.98px)` day panel (§3); forced colours for the clear ring and day cells |
| `lib/combobox/combobox.component.{ts,html,scss}` | clear in the tab order (no `tabindex="-1"`), 24 box recipe, `mix.focus-ring($offset: 0)`, lg margin + `::before` hit area; lg input `2.75rem` + `margin-block: -0.25rem`; frame `(mousedown)`/`(click)` → `onFrameMousedown`/`onFrameClick` (skip the input and buttons; ESLint disable with the §6 reason); forced colours for the clear ring |
| `datepicker.stories.ts`, `combobox.stories.ts` | *With Label*, *Label (DE)*, *Clear Targets*, *Day Panel*, *Clear Targets (DE)* (IDs as §8); argType `label` |
| `datepicker.targets-label.spec.ts` (new, 26), `combobox.targets.spec.ts` (new, 14), `theme-contrast.spec.ts` (+3, block "3.30 (request 047)") | see AC table; no existing assertion changed |
| `tools/compat/…/probe-330.ts`, `home.{ts,html}`, `check-angular-majors.mjs` | `<lc-datepicker label="Gilt ab" ariaLabel="Gültig ab" granularity="month">` + `<lc-combobox size="lg" label="Konto">` prerendered; `EXPECT_IN_HTML` "datepicker label and lg combobox frame before JS" |
| `requests/BACKLOG.md` | 046-n3, 046-n4 removed (folded in by the spec as AC-9, AC-10) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1 | spec (24 box, ring, md/lg hit rule, no xs/sm rule, heights); *Clear Targets* hit scan (below) |
| 2 | spec + `theme-contrast` block (ring 4.36 / 9.12 floored, text 6.21, fill 6.21 / 2.78); *Day Panel* measured ring 4.37 L / 9.13 D; forced colours |
| 3 | spec (box, ring, lg hit rule); *Clear Targets (DE)* hit scan, rings |
| 4 | spec: frame press on xs/sm/md/lg → `mousedown` prevented, input focused; disabled not; input press and chip × untouched; lg input box measured |
| 5 | spec: `<label for>` = input id, text, no `aria-label` with `ariaLabel` set, axe name = label (day + month), click opens |
| 6 | spec (no label element, wrapper children, aria-label kept); DOM proof (below); 84/84 shots identical |
| 7 | *Label (DE)*, *Clear Targets (DE)* at 360: label lines and overflow (below) |
| 8 | spec: Tab order field → ×, no `tabindex`, names, clear → `null` + focus on the field (both components) |
| 9 | spec (media block, in-flow panel, push config); *Day Panel* at 320/360/1024/1280 (below) |
| 10 | spec: „2026-1“ + Enter → „2026-07“, closed, no change; no selection: text and panel kept |
| 11 | `--compare` 84/84 `047/baseline`, `baseline-open` 1024/1280 4/4 identical |
| 12 | compat 22: `ok datepicker label and lg combobox frame before JS` |

**Default-render proof** (temp spec, removed; `tmp/047/dom-proof.txt`): 3.29 templates vs new, datepicker 7 input sets (default, ariaLabel, value, month, helper/lg/filled, error, disabled): identical but one leading `<!--container-->` anchor (the `@if (label())`); combobox 4 sets: identical, with a value only the clear's `tabindex="-1"` is gone (intended, §2).

**Measured** (`tmp/047/measure/{hit,panel}.mjs`; scan = first miss from the box centre L/R/U/D, so 44 px areas read 45):

| Story (360 and 1280, L/D) | Values |
|---|---|
| *Clear Targets* (dp) | xs/sm box 24 × 24, scan 13/12/13/12; md/lg/month md/lg scan 31/14/23/22 (44 × 44), beyond right and left = the field `INPUT`; glyph 16 at the 3.29 spot; fields 24/32/40/44; ring 2 px primary-500, offset −1 |
| *Clear Targets (DE)* (cb) | xs–md 24 × 24, scan 13/12/13/12; lg scan 27/18/23/22 → x 299–343 × y 287–331, left neighbour `INPUT`; lg input 274 × 44 (y 287–331), frames 34/38/42/46, inputs 24/28/32/44; ring 2 px offset 0 |
| *Label (DE)*, *With Label* | labels 14/500/21, 6 px above the field, overflow 0 everywhere; „Gilt ab“ 1 line 328 wide; compound 2 lines (42) in 158 px with „Leistungsverrech-“; `scrollWidth` = viewport |
| *Day Panel* | 360: 342 × 448 at x 8 (right gap 10), nav 44 × 44, today 65.59 × 44, days 44 × 44; 320: 304 × 415.47 at x 8 (gap 8), days 38.56; 1024/1280: 310 × 395 at x 24, nav 32, today 31, days 36; ring 4.37 L / 9.13 D, text 6.21, fill 6.21 / 2.78; `--forced-colors` 360 L/D: selected fill = `Highlight` (headless `rgba(5, 0, 73, .8)` / `rgba(0, 230, 255, .8)`), ≠ panel |
| axe (`--axe`) | 16/16 field shots 0 violations; *Day Panel* 8/8 only the pre-existing `label-content-name-mismatch` (below) |

## Gates

All gates ran on commit `f60cec391c49f6ff240262c2c60ee622de82a97b` (later agents skip a gate while `git diff --quiet f60cec39 -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 241 suites, 5645 passed, 8 skipped (+2 suites, +43 tests; `--maxWorkers=2`) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | 122 "Built", success |
| `npm run test:tools` | 22/22 |
| `npx nx run angular-ui-kit:build-storybook` | success, 1055 stories (+5) |
| Story screenshots | compare: `tmp/story-shots/047/build-rest` 84/84 identical vs `047/baseline`; `build-open` 1024/1280 4/4 identical vs `baseline-open`, 360 2/2 differ (intended); new: `build-new` (4 stories × 360/1280 × L/D, `--axe`, hit measure), `build-panel` (*Day Panel* 320/360/1024/1280 × L/D, `--axe`), `build-forced` |
| `node tools/compat/check-angular-majors.mjs --only=22` | PASS, 99 HTML checks (+1: "datepicker label and lg combobox frame before JS") |

## Deviations from the design

Designer to confirm 1–3 in review.

1. **`.lc-datepicker-calendar` `position: absolute` → `relative`** (not in §3). Built as written, push did nothing: the panel was out of the CDK pane's flow, the pane measured 0 × 0, so every position "fit" and the 360 px panel stayed at the field's x: 6 px past the viewport in *Day Panel*, 2 px from its edge in *Default* (`tmp/047/probe-push.log`, first `build-open` run). In flow, the pane has the panel's size. Side effect at every width: where the panel does not fit below the field, the CDK now opens it above (as lc-combobox's list); 1024/1280 open shots and the 84 at-rest shots stay identical.
2. **Push position differs from §3's computed x 10.** CDK 22.2 checks the fit against `[0, vw − 16]` (it ignores the left margin) and takes the position with the most visible area, so the result depends on the field: *Day Panel* (field x 24): end-aligned and pushed to x 8, right gap 10; *Default* (field x 16, 328 wide): end-aligned at x 2, right gap 16 (fits by the CDK's check). A margin of 4 was tried: x 4 in *Day Panel*, worse, so `viewportMargin` stays 8 as designed.
3. **Label (DE) compound:** „Leistungsverrechnungsschlüssel ab“ breaks with a hyphen into 2 lines (42 px) in the 158 px column, not 3 (63); no overflow.
4. Implementation details: the forced-colours selected-day rule also names `:hover` (the hover-fill rule would win otherwise); `theme-contrast` pins floored ratios (ring 4.36 / 9.12, clear ring 4.17 / 7.57; §5 rounded 4.37 / 9.13, 4.18 / 7.58).

**Finding for routing (pre-existing, not fixed here):** axe `label-content-name-mismatch` (WCAG 2.5.3, level A) on day buttons 1–9 of the open day panel at every width: name „Wed Jul 01 2026“ (`dayAriaLabel` = `toDateString()`), visible „1“. Code unchanged since before 3.29 → should-fix, queue.

## Changelog draft

Clear buttons you can hit, a 44 px large combobox, a visible datepicker label, a selected day you can see in dark, and touch-sized day panels (finance-intelligence rules page, rows 5 to 7; follow-ups 046-f1, 046-f2, 046-n3, 046-n4). One new optional input; no API breaks.

### Added

- **`lc-datepicker` `label`** (rules page „Gilt ab“, row 7): a visible label above the field, a `<label for>` in day and month mode, styled like lc-combobox's and lc-number-input's (14 px, medium, 6 px above the field). It names the field, so `ariaLabel` is ignored while it is set; a click on it focuses the field and opens the calendar. Default `''`: no label element, as before. Long German compounds hyphenate instead of overflowing. Stories *With Label*, *Label (DE)*.

### Fixed

- **`lc-datepicker` clear button** (046-f1, WCAG 2.5.8): 24 × 24 px in every size (was 20 × 20), with a 44 × 44 px hit area in md and lg that ends at the calendar icon; glyph, hover fill, focus ring and field heights (24/32/40/44 px) unchanged. After a clear, focus returns to the field (it fell to the page). Story *Clear Targets*.
- **`lc-datepicker` selected day** (046-f2, WCAG 1.4.11): the inset 2 px ring of the month cells, in both themes: 4.37:1 on the light panel, 9.13:1 on the dark one (the dark fill alone is 2.78:1); text 6.21:1. Forced colours: selected `Highlight`, today underlined, disabled `GrayText`.
- **`lc-datepicker` day panel below 1024 px** (046-n3): month buttons 44 × 44, "Today" 44 high, days 44 × 44 without gaps: 342 × 448 px at 360 px (304 px with 38.56 px days at 320). The panel is pushed into the viewport instead of running past it. From 1024 px unchanged (310 × 395). Story *Day Panel*.
- **`lc-datepicker` month mode, Enter** (046-n4): Enter in the open field after half-typed text („2026-1“) shows the selected month again („2026-07“) and closes, as in day mode.
- **`lc-combobox` clear button** (rules page, row 5): 24 × 24 px in every size (was 20 × 20), 44 × 44 px hit area at `size="lg"`; now in the tab order (Enter or Space clears, focus returns to the input), with a 2 px focus ring (4.18:1 light, 7.58:1 dark). Story *Clear Targets (DE)*.
- **`lc-combobox` `size="lg"` input** (rules page, row 6): 44 px high (was 36) inside the unchanged 46 px frame; a click anywhere on the frame focuses the input, in every size.

### Compatibility

- One new optional input; no API breaks. Defaults render as in 3.29: 84/84 at-rest shots of both components' stories and the open day panel at 1024 and 1280 px are hash-identical. DOM: one comment anchor in lc-datepicker; the combobox clear button lost `tabindex="-1"`.
- lc-combobox: the clear button is one more tab stop while a value is selected (as lc-select and lc-datepicker); at `lg` the input is 12 px narrower while a value is selected.
- lc-datepicker: the panel now takes its size in the overlay, so where it does not fit below the field it opens above it, and it is pushed into the viewport; a panel that fits neither covers the field.
- Checked on Angular 22 (AOT, strictTemplates, prerender).

### Known

- At 200 % text and 360 px the day panel is 403 px wide (3.29: 618) and still overflows narrow phones.
- The md datepicker hit area reaches 2 px above and below the 40 px field; a flush `overflow: hidden` ancestor cuts it to 44 × 40.
- Day buttons 1–9 have names like "Wed Jul 01 2026" that do not contain the visible "1" (axe `label-content-name-mismatch`, WCAG 2.5.3); not new, queued.
