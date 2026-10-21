# Build 009: Signed-in shell at 200 % text on a phone

- **Branch:** `fix/3.10.1-signed-in-shell-large-text` (from `main` 5634b0b) · **Commit:** one, `fix(header): signed-in shell at 200 % text on a phone (AS-31)`; r1 gates on `4bd7ca6`, r2 gates on `fd9d7fc`, amended only to add the request docs (libs/tools unchanged)

## Round 2 (review r1)

| Finding | Change |
|---|---|
| 1 must-fix | `.lc-bottom-nav__item`: `justify-content: flex-start; padding-block: 6px 2px; padding-inline: 0` (was `center`, `4px 0`). Every bar, 100 % and 200 %: `pill.top − item.top` = 6 for all items (`tmp/009/r2-new-measure.log`, `r2-compare.log`); item heights 108 / 140 / 172 at 200 %, 64 / 76 at 100 %, unchanged except where finding 2 adds a line |
| 2 must-fix | `--_reach: clamp(-4px, 32px - 1.5rem, 8px)`. Smallest ink gap at 200 % over all bars: 4.6 px (5 floating DE at 320; 6.3 at 360; EN shell 4.9). The review's cases: 360 docked 5 → 13.1 (was 1.2), 320 floating 4 → 11.8 (was 1.4; items 140 → 172, bar 150 → 182 as the prototype). life-os bar (5 floating DE) stays 182. All lists `sw == cw`, 0 labels clipped, `docSW == vw` (`tmp/009/r2-new-measure.log`) |
| 3 should-fix; 4, 5 nits | 3: changelog draft, Compatibility (end group, child selectors) and Fixed (the bar never widened the page). 4, 5: not part of this round |

Note for the designer: with the 4 px gutter, "Haushalt" at 360 (5 floating DE) breaks "Haus|halt" without a hyphen ("Haus-" doesn't fit 58 px at 24 px text), as AC-6 allows. Measuring 100 % by flipping `data-lc-story-text` (or the root's inline `font-size`) inside `--measure` doesn't re-resolve `rem` in descendants in headless Chromium (label stays 24 px), so the 100 % values come from the 100 % stories in the compare.

## Files changed

| File | Change |
|---|---|
| `header/header.component.{html,scss,ts}` | end items in `div.lc-header__end`; every header wraps; brand basis `min-content`; zero-width spacer; JSDoc |
| `bottom-nav/bottom-nav.component.scss` | label `anywhere` + reach `clamp(-4px, 32px - 1.5rem, 8px)` (r2); pill `max-width: 100%`; item top-aligned, `padding-block: 6px 2px` (r2) |
| `app-shell/app-shell.component.{html,scss,ts}` | `--_clearance` max(112, bar + 40) + inset; land + (bar − 72); ResizeObserver in `afterNextRender` |
| `*.stories.ts` (header, bottom-nav, app-shell) | 8 stories at 200 % (root `font-size`), `textSize` argType; shell docs table |
| `header.large-text.spec.ts`, `app-shell.bar-height.spec.ts` (new), `bottom-nav.component.spec.ts` | 11 + 7 + 3 tests (r2: + item alignment; the new reach test pins the r2 clamp); one existing assertion changed (below) |
| `tools/compat/check-angular-majors.mjs` | 3 `EXPECT_IN_HTML` checks (end group, clearance fallback, no server-written bar height) |

## Acceptance criteria

| AC | Covered by (200 % = root 32 px; `tmp/009/after-*.log`) |
|---|---|
| AC-1, AC-2 | header EN/DE/signed out at 320/360: brand ∩ end = 0 px²; `docSW == vw` (was 331/320 signed out); title one line; subtitle 208 / 168 px visible (was 80 / 40, wordmark 32.6 / 72.6 px under the avatar); header 177 px, end group at the end of row 2 |
| AC-3, AC-10 | 192 baseline shots (32 stories × 360/1024/1280 × light/dark): 184 identical, 8 intended (Deviations 2); shells with `--full` like the baseline — `tmp/009/compare-4*.log`. r2 (all 32 `--full`): the same 184 identical and the same 8 different, nothing else — `tmp/009/r2-compare.log`, shots `tmp/story-shots/009/r2/` |
| AC-4, AC-5, AC-6 | all bars: list `sw == cw`, `docSW == vw`, label overlap 0 (was 8), 0 labels clipped, pill 54 at 320; items ≥ 54 × 108. r2: pills 6 px below the item top in every bar, smallest ink gap 4.6 px (Round 2) |
| AC-7, AC-8 | shell DE/EN, 320/360, 200 % and 100 %: last block 38 px above the bar (was covered by 69.6 px); bar 180/148/84/72 → padding 220/188/124/112; Today 102 / 215 px; RO unit tests; hook still wins (spec) |
| AC-9 | compat 22: end group after the nav, clearance fallback 112 px, no `--_lc-app-shell-bar` in server HTML |
| AC-11 | no new colour; triggers 96 × 96 at 200 %; end group `align-self: stretch` keeps rings inside |
| AC-12 | spec: DOM/focus order brand → nav → end, no role/`aria-hidden`, full subtitle in DOM + `title` |
| AC-13 | 8 stories: `navigation-header--signed-in-large-text`, `…-signed-in-large-text-german`, `…-signed-out-large-text`, `navigation-bottom-nav--floating-large-text`, `…-item-counts-large-text`, `layout-app-shell--signed-in-large-text`, `…-signed-in-large-text-english`, `…-today-large-text` |
| AC-14 | suite green; `bottom-nav.component.spec.ts` label assertion `break-word` → `anywhere`: AC-6 asks for it (a word still breaks only when it can't fit) |

## Gates

r2 gates ran on the libs/tools tree of commit `fd9d7fced4127b6f6e67701f1062cbe0e1821568` (later agents skip a gate while `git diff --quiet fd9d7fc -- libs tools` holds). r1 ran on `4bd7ca6`; r2 changed only `bottom-nav.component.{scss,spec.ts}`. Logs: `tmp/009/` (r2: `r2-*.log`).

| Gate | r2 on `fd9d7fc` | r1 on `4bd7ca6` |
|---|---|---|
| `npx nx run angular-ui-kit:test` | 157 suites, 3985 passed, 8 skipped | 157 / 3984 / 8 (was 155 / 3964) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) | same |
| `npx nx run angular-ui-kit:build` | ok, 119 entries | ok, 119 |
| `npm run test:tools` | not rerun: `tools/` unchanged, the bar CSS doesn't reach the manifest | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | ok | ok |
| Story screenshots | new: `tmp/story-shots/009/r2-new/` (64: 8 stories × 320/360/1024/1280 × light/dark); compare: `r2/` | `new/`, `after-4/` |
| `check-angular-majors.mjs --only=22` | not rerun: r2 changes only bar CSS values, which no compat check covers; DOM and class names unchanged | PASS, incl. the 3 new checks |
## Deviations from the design

r1's three (header spacer + title margin instead of `brand::after`; the 8 baseline diffs; the bar cause refuted, `tmp/009/cause*.log`) were accepted in review r1 and are now design.md change notes 1–3. r2 builds design.md §3 as written: none.

## Changelog draft

```markdown
## [3.10.1] - 2026-10-21

The signed-in shell at 200 % text on a phone (AS-31; life-os Today and household, U1). No API breaks.

### Fixed

- **`lc-header` no longer covers its brand** (AS-31): the end content (end slot, theme button, context, account menu) is one group that takes the end of a second row when it doesn't fit beside the logo and the title's longest word. At 200 % text, 320 / 360 px: brand and account trigger never overlap (the wordmark ran 72.6 / 32.6 px under the avatar), the subtitle shows 168 / 208 px before "…" (was 40 / 80), and a signed-out header no longer widens the page (+10.8 px at 320). Focus order unchanged.
- **`lc-bottom-nav` labels no longer overlap or run together** at large text: their 8 px reach into neighbouring columns turns into a 4 px gutter from 150 % text, so at 200 % neighbouring labels keep at least 4.6 px apart (they overlapped by 8 px; "Heute" and "Haus-" were 1.2 px apart and read as one word). Labels wrap with `overflow-wrap: anywhere` and hyphenate by `lang`; the pill fits a 54 px column (five floating items at 320 px). Item content is top-aligned, so every icon pill sits on one line even when labels wrap to different line counts (they were up to 48 px apart). The bar itself never widened the page: AS-31's +19 / +59 px is page-wide horizontal overflow on the app side (T387), which moves a fixed bar.
- **`lc-app-shell` keeps the bar's real height free**: at least 112 px plus the inset, the bar's height plus 40 px when it grows (measured in the browser). At 200 % with five German items the last block now ends 38 px above the bar (it was covered by 69.6 px). With `horizon` the land grows by what the bar is taller than 72 px.

### Compatibility

- No API breaks. At 100 % text, 184 of 192 header, bar and shell screenshots are pixel-identical to 3.10.0. Changed: a header whose title ran into its end items now wraps them (FullFeatured, TranslatedLabels at 360 px), the horizon's land grows under a bar with two-line labels (+12 px), and in a bar whose labels wrap to different line counts the pills move up into one line (one-line bars are unchanged).
- The header's end content (end slot, theme button, context, account menu) now sits in `div.lc-header__end`. A child selector such as `.lc-header > [slot='end']` no longer matches; use `.lc-header__end > [slot='end']` or a descendant selector (life-os: `shell.component.css`).
- Before JavaScript (prerendering) the clearance is 112 px plus the inset, as before; `--lc-app-shell-bottom-clearance` still wins.

### Migration

- life-os: remove the AS-30 header interims (`shell.component.css`, `auth-layout`: brand `flex: 1 1 0` and the wrap rules); a zero brand basis keeps the end group from wrapping.
```
