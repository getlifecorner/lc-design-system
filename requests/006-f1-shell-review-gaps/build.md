# Build 006: F1 shell review gaps (LK-12, AS-25, AS-26, AS-27, AS-29)

- **Branch:** `feat/3.9-f1-shell-review-gaps` (from `main` b616423) · **Commit:** one, `feat(app-shell): …`, amended for round 2 (review finding 1, design rev. 1); the r2 gates ran on `2b151d1`, amended again only to record that hash here (libs/tools unchanged)

## Files changed

| File | Change |
|---|---|
| `styles/_horizon.scss` | Land steps 72 · 80 · 96 · 128 px; the 3.8 figure rules moved into mixins (compiled CSS byte-identical except the 4 land values); `[shell-horizon-figure]` rules (`.lc-horizon > :where([shell-horizon-figure])`, `:has(> [shell-horizon-figure])`); header docs |
| `app-shell/app-shell.component.{html,ts,scss}` | Slot `[shell-horizon-figure]` inside the horizon, `aria-hidden="true"` on it; with `horizon`, rows `auto auto 1fr auto`, footer `grid-row: 4; grid-column: 1 / -1`, `--color-land-3`; JSDoc (`@default false` added to `horizon`) |
| `page-header/page-header.component.{ts,scss}` | `PageHeaderSize` + `'secondary'`; `--size-secondary` = compact rhythm, title `var(--font-size-xl, 1.25rem)` |
| `button/button.component.{ts,html}`, `button-link.component.ts`, `button.component.scss` | `flush` input (`@default false`) → `btn-flush`; rule `.btn-link.btn-flush:not(.btn-icon-only, .btn-inline)`; r2: `justify-content` / `text-align: var(--lc-btn-flush-align, start)`, hook in both JSDocs and the SCSS comment |
| r2: `button.stories.ts`, `button-link.stories.ts` | `flush` argType text names the hook; `--lc-btn-flush-align` argType (category CSS hooks, default `start`) on `flush-link` and `flush`; `flush` gains the end-edge row of design §8 rev. 1 (`margin-top: 24px` as in the prototype `r1-row`) and a play check (`text-align` / `justify-content` `end`) |
| `skeleton/skeleton.component.{ts,scss}` | `min-height` / `max-height: var(--lc-skeleton-height, 0px / none)` on `.lc-skeleton`; docs |
| Stories: app-shell, page-header, button, button-link, skeleton, `docs/horizon.stories.ts` | The 8 stories of design §8; `flush` argTypes, `secondary` option, slot table, land values. Today's template became `today(figure = '')` (the manifest extractor can't follow `.replace()`; `todayTemplate = today()` is the same string) |
| Specs (new) | `horizon.shell.spec.ts`, `app-shell.horizon.spec.ts`, `page-header.secondary.spec.ts`, `button.flush.spec.ts`, `skeleton.height.spec.ts` |
| r2: `button.flush.spec.ts` (own, unreleased) | `justify-content: flex-start` / `text-align: start` → the two hook declarations (design rev. 1; `start` ≡ `flex-start` in a row: `flush-link` shots hash-identical to r1). The JSDoc check compares the comment as one line of text (wrapping-independent, same sentence and `@default false`) and also requires the hook |
| `styles/horizon.spec.ts` | **Assertion changed** (reason LK-12, design §9 AC-1): the land table 100/120/140/184 → 72/80/96/128; radii unchanged |
| `tools/compat/…` | `probe-39.ts` (shell + figure, secondary h2, flush link) on the home page; 3 `EXPECT_IN_HTML` checks (`shellFigurePrerendered` uses `emptyAttr`) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1 | `horizon.spec.ts` + `horizon.shell.spec.ts` (112/72/80/96/128); measured D 112 / 72 / 80 at 360 / 1024 / 1280 |
| 2 | `horizon.spec.ts` radius assertions unchanged (58 · 70 · 90 · 120 · 166) |
| 3, 8 | `horizon.shell.spec.ts` (every step only a `var(--lc-horizon-land, …)` fallback); horizon phone/desktop/footer-on-the-land/figure-and-footer shots identical to the baseline at all widths |
| 4 | `app-shell.horizon.spec.ts` (row contract); `footer-on-the-horizon`: land under the line = D + F = 245 / 150.5 / 158.5 (F 133 / 78.5), seam 0 px, row fill = land-3 in both themes |
| 5 | `figure-on-the-horizon`: footer `display: none`, land = D (112 / 72 / 80); spec: empty footer `:empty` |
| 6, 20 | spec: figure is a direct child of `.lc-app-shell__horizon.lc-horizon` with `aria-hidden="true"`, footer outside; compat 22 / 22.0 `shell figure…` ok |
| 7 | both shell stories: 64 / 96 / 96 px, bottom 8 / 12 / 12 px below the line (12.5 %), gap to the sun 16 / 24 / 24, x 711.6 at 1280 |
| 9, 11 | `page-header.secondary.spec.ts` (class, `--font-size-xl`, compact spacing, default and compact rules pinned); measured 20 px / 25 px, 700; all 13 page-header baseline stories identical |
| 10 | `secondary-levels`, `bilingual-page` at 360 / 1024: h1/h2/h3, 20 px, "Haushaltsmitgliederverwaltung" 296.5 px on one line, no overflow; spec for levels 1–3 ± subtitle |
| 12, 13 | `button.flush.spec.ts` (r2: pins both `var(--lc-btn-flush-align, start)` declarations, the hook read only there, and the hook in both JSDocs); at 360: x = paragraph x, width = non-flush − 48.0, h 46.5, "Ja" 44, `:focus-visible` 2 px `--color-primary-500`, offset 2, radius 10; disabled opacity .5, spinner at x. **r2 end row** (all 6 width × theme shots): row 16–328, "Anders anmelden" box 183.5–328, h 69, lines 267.7–328 / 245.2–328 (prototype 328 / 328). Probe with the hook on an `lc-button` host in a 260 px row: 3 lines, all end at 276 = row edge |
| 14 | spec: no `btn-flush` by default, `.btn-lg` rule pinned; 13 button + button-link baseline stories identical |
| 15, 16 | `skeleton.height.spec.ts` (rule on `.lc-skeleton`, no variant rule); story: tiles 59 (stacked) / 88, line 14 / 20 at 360 / 1024 |
| 17 | spec: inline styles of all 3 variants and explicit `height` unchanged; 8 skeleton baseline stories identical |
| 18, 19 | Shots 360/1024/1280 × light/dark; forced colours: figure rule hidden (spec); reduced motion: nothing new animates — for the designer's review |

## Gates

Round 2: all gates ran on the libs/tools tree of commit `2b151d1` (later agents skip a gate while `git diff --quiet 2b151d1 -- libs tools` holds). Round 1 ran on `97df945`. Logs: `tmp/006/`.

| Gate | Round 2 result | Round 1 |
|---|---|---|
| `npx nx run angular-ui-kit:test` | 154 suites, 3945 passed, 8 skipped, 0 failed | same (5 new suites) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings, none in a changed file | same |
| `npx nx run angular-ui-kit:build` | ok, 9.6 s | ok, 8.8 s |
| `npm run test:tools` | 22 / 22 (story texts changed) | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | ok, 19.4 s | ok, 18 s |
| Story screenshots | `tmp/story-shots/006/r2` (`flush`, `flush-link` × 360/1024/1280 × light/dark, measures in `tmp/006/shots-r2.log`; the measure focuses the first link, as in r1). `flush-link` 360 light + dark hash-identical to r1 `build/`; `flush` differs only by the new row. The other 13 button + button-link stories vs `baseline` (`--full`, `r2-compare`): 78 / 78 identical | `build/` 34 shots; vs baseline 252 / 276 identical (the 24 = default-land stories at 1024 / 1280, AC-1) |
| `check-angular-majors.mjs --only=22` | PASS (22.2.3, 45 checks; the stylesheet the server inlines changed) | PASS 22 (45) and 22.0 (44) |

## Deviations from the design

- **Flush selector** `.btn-link.btn-flush:not(.btn-icon-only, .btn-inline)` instead of `:not(.btn-icon-only)`: same (0,3,0). It makes §4 "inline + flush: inline wins" hold for `lc-button`, whose `<button>` lays out as inline-block even with `display: inline` and would otherwise take the 44 × 44 box. Confirmed in review r1 (design §3 rev. 1).
- r2: none. The end row's `margin-top: 24px` is not in design §8; it reproduces the prototype `r1-row` (the lines sit at the same y).

## Changelog draft

## [3.9.0] - 2026-10-20

The F1 shell's review gaps from life-os (app-shell 7.1): slimmer horizon land, the footer on it without overrides, Edu on the shell's horizon, a 20 px second title, flush links and a container-driven skeleton height. No API breaks.

### Added

- **`[shell-horizon-figure]` on `lc-app-shell`** (AS-29; life-os T365, 9 of 12 moments): Edu (`lc-character`, `<img alt="">`, `<picture>`, inline `<svg>`) on the shell's horizon line, placed like `.lc-horizon__figure` (64 · 96 · 128 px, 16 / 24 px left of the sun, feet on the line). The horizon is now `aria-hidden="true"`.
- **The shell footer on the land** (LK-12; T367): with `horizon`, `[shell-footer]` takes a row of its own below the horizon in `--color-land-3`, so the land grows by the footer: 245 / 150.5 / 158.5 px at 360 / 1024 / 1280 with a compact two-link footer, no `--lc-horizon-land` override. Footer links 6.03:1 light, 11.70:1 dark.
- **`size="secondary"` on `lc-page-header`** (AS-25; the bilingual error page 6.9): a 20 px title (line 25 px) with the `compact` spacing, at `level` 1–3. Replaces the `--font-size-lg` interim pixel for pixel.
- **`flush` on `lc-button` and `a[lcButton]`** (AS-26; account settings, sign-in): a `variant="link"` button without inline padding, the label at the content edge (48 px narrower at `lg`), height kept (46.5 px), at least 44 × 44 px. For a link at the end edge of a row (the code page's "Anders anmelden" with `justify="between"`), the CSS hook `--lc-btn-flush-align: end` (default `start`) puts the label and every wrapped line at that edge: both lines end at the row's edge at 360 px, where they stopped 84 / 62 px short before. It inherits, so set it on the link, the `lc-button` host or an ancestor. Replaces `padding-inline: 0` and `::ng-deep .btn`.
- **`--lc-skeleton-height`** (AS-27; Today's tile skeletons, T358): the fill's height from CSS (container query, `cqi`), winning over `height`: tiles 88 px across, 59 px stacked below 21.5rem.

### Changed

- **`.lc-horizon` land from 1024 px** (LK-12): 72 · 80 · 96 · 128 px at 1024 · 1280 · 1440 · 1920 (was 100 · 120 · 140 · 184). Phone (112 px) and sun radii unchanged.

### Compatibility

- No API breaks. A horizon relying on the defaults is lower from 1024 px; 252 of 276 screenshots are identical, the others are those stories at 1024 / 1280. In `lc-app-shell` with a `[shell-footer]`, `--lc-horizon-land` is now the land above the footer.

### Migration

- To keep 3.8's land: `--lc-horizon-land: 100px / 120px / 140px / 184px` from 1024 / 1280 / 1440 / 1920. In a shell with a footer, remove the footer's height from a `--lc-horizon-land` override. life-os can drop the interims labelled LK-12, AS-25, AS-26 and AS-27.
