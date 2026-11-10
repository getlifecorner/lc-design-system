# Build 059: lc-device-frame and lc-picture, lc-select clearable, lc-description-list total whitespace, lc-list item ariaLabel

- **Branch:** `feat/3.39-device-frame-picture-select-list` (from `main` 9bab9d1; resumed from the killed run's uncommitted work)
- **Commit:** one commit `feat(device-frame,picture,select,list,description-list): request 059` (amended; round 1 gates on `16f91b6`, round 2 on `48decdc`)

## Files changed

| File | Change |
|---|---|
| `device-frame/` (new entry: stub, `index.ts`, component, scss, spec, stories) | §2 API, §3 boxes, D-1/D-2; host classes, registered `--_lc-device-frame-bezel/-radius`, forced colours; 7 stories (§8) |
| `picture/` (new entry, same files) | §2 API and DOM: 1 or 2 `<picture>` in an `@for`, `<img>` in an `@if` after the sources; logo's theme selectors; dev warning; 5 stories |
| `src/index.ts`, `entries.spec.ts`, `tools/compat/check-entries.mjs`, both READMEs | 2 public entries (117 + 6 internal, 123 subpaths), listed |
| `select/select.component.{ts,html,scss}`, `select.clearable.spec.ts` (new), `select.stories.ts` | `clearable` (D-5), xs/sm/md `:has(.lc-select__clear)` room, hook doc; AC-19/20; *Without Clear Button*, `clearable` argType |
| `list/list.component.{ts,html}`, `list.aria-label.spec.ts` (new), `list.stories.ts` | `ListItem.ariaLabel` on `<a>`, `role="button"` row, split button (`splitRowName`, D-6), dev warning; **word breaks** (Deviation 1); unused eslint-disable removed; AC-14–16 + axe; *Jump Marks* |
| `description-list/description-list.component.{ts,html,scss}`, `description-list.{single-space,narrow-row}.spec.ts` (new), `description-list.stories.ts` | AC-17 single spaces (D-7), narrow rows appended (D-8); AC-17/18; *Narrow Column* |
| `table/table.component.{html,scss}` | page size `[clearable]="false"` (D-5) |
| Changed pins (reason 059) | design §9 list: `badge-total`, `semantics`, `whitespace` l.117/124, `list.split-row`, `list.chevron`, `table.pagination`, compat dl regex; **also** `whitespace` sep-at-end pin and `wrap` AC-7 (`hyphens` only before the appended rules) and its appended-selector list, `select.tap-area-focus` `:has` count 1 → 4 (appended rules, D-5/D-8) |
| `tools/compat/template/…/probe-339.ts`, `home.{ts,html}`, `check-angular-majors.mjs` | §9 probe (secondary entries) + 3 `EXPECT_IN_HTML` checks |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1, 3, 7 | `device-frame.component.spec` (14): defaults, classes, attribute forms, notch span `aria-hidden` before the screen, no role/tabindex/aria, axe 0, only name = img `alt`; manifest: `device`/`size`/`notch` with defaults |
| AC-2, 6 | spec: no hex but `#111827`/`#374151` token defaults, hooks only read, `@property`. Rim measured `rgb(107,114,128)` L / `rgb(147,164,173)` D (§5 contrast); `--forced-colors`: rim CanvasText, bezel Canvas, shadow none |
| AC-4, 5 | md 248 × 518.66, screen 232 × 502.66 r24, img ratio 0.46155; sm 200 × 419.33 / 188 × 407.33 r18; lg 320 × 670 / 300 × 650 r32; notch 63.97 × 8 at 92.02/8, frame 534.66; *Screenshot Row* x 16/280 (360), 16/252/488/724 at 220 × 474 (1024/1280), short shot 392.88 / 349.33; no page `hscroll` in 66 shots |
| AC-8, 9b | compat 22: frame classes + notch + screen, 2 pictures, dark `<source>`, img `loading/decoding/width/height/alt/src`, no `fetchpriority`, `--dark` rule in page CSS |
| AC-9a, 10 | `picture.component.spec` (19): source order/attrs, `sizes` default, MutationObserver (all `srcset` before `src`), attribute order, `alt=""`, rounding, 4 dev-warning cases; strictTemplates compile (compat) |
| AC-9b | spec: pair rules, `darkSrc`/`darkSrcset`, logo selectors; *Theme Variants* „hell · source“ L / „dunkel · source“ D |
| AC-11, 13 | *Load Error* 248 × 537.33 = *Sources* / *Theme Variants* after load; 120-char alt and caption wrap, no hscroll |
| AC-12 | *Card and Frame*, *In a Card* (radius 23px only with the hook; 0px default) |
| AC-14–16 | `list.aria-label.spec` (17) per row kind, trim, plain/disabled rows, warning, axe pass + 2 negative controls; *Jump Marks* names as §9, `--axe` full tags 0 violations (4 shots); temp old/new: href/button/plain rows **byte-identical** (4 cases) |
| AC-17 | `single-space.spec` exact strings (§9) in 4 layouts/sizes; `/\s{2,}/` and edge spaces never |
| AC-18 | *Narrow Column* / hero *Fill* 360: every value 1 line, on its own line, right edge = row; „Rechenzen-trum“ 2 lines (row 80), others 59/58; *Fill* 1280 identical |
| AC-19, 20 | `select.clearable.spec` (13); *Without Clear Button* exactly §3: lg box 21–203 → 21–231, text end 219.22; sm 13–129 → 13–155, end 133.16; xs/sm/md box ends 4 px before × (257 / 261); tab stops 2 → 1; temp old/new: 6 select cases identical |

## Review round 1 fixes (stories only, `48decdc`)

| # | Change | Measured (`tmp/story-shots/059/r2-fix`, `--axe`, module `tmp/059/measure/r2.mjs`) |
|---|---|---|
| F-1 | *Card and Frame*: wrapper `flex-wrap: wrap`, no `overflow-x`; description says it wraps | axe **0 violations** (12 shots, both stories). 360: wrapper scrollWidth = clientWidth = 328, card 16/16, frame 16/596 (below). 1024/1280: x 16 / 280, frame y 32.34, as r1. Hash vs `r1-frame`: 1024/1280 differ only by Δ ≤ 2 px at the card corners and the frame shadow's tails beyond the wrapper (it no longer clips them); geometry identical |
| F-2 | *Screenshot Row*: `.shots__row:focus-visible` `outline-offset: -2px`; `2px` again inside `min-width: 1024px` | 360 L/D: ring left 0–2, right 358–360, top 122–124, bottom 787–789 (all four sides in view), figures from x 16, page scrollWidth 360. 1024: offset 2px, ring 12–948. 1280 L/D focused: **hash-identical** to `r1-focus`. Note: the row has no top padding, so at 360 the top line crosses the top rim of frames 2–4 (frame top 0.34 px below the region top) |
| F-3 | `lang="de"` on the existing wrapper (*Sizes*, *Custom Bezel*, *Sources*, *Theme Variants*) or a new `<div lang="de">` (frame *Default*, *Notch*, picture *Default*; hosts are `display: block`) | All 7 stories × 3 widths × L/D **hash-identical** to `r1-frame` / `r1-rest` (frame 36/42, the 6 others are *Card and Frame*; picture 30/30) |

## Gates

Round 1 gates ran on `16f91b6`; round 2 on `48decdc` (`git diff 16f91b6 48decdc -- libs tools`: the two story files only, so compat 22 and test:tools stand from round 1). Skip a gate while `git diff --quiet 48decdc -- libs tools` holds. Logs in `tmp/059/` (round 2: `tmp/059/r2/`).

| Gate | Round 2 (`48decdc`) | Round 1 (`16f91b6`) |
|---|---|---|
| `npx nx run angular-ui-kit:test` | 305 suites, 6351 passed, 8 skipped (full run 302 suites; card.collapsible, spinner, hero.contrast hit the known worker SIGSEGV and pass alone: 18 + 5 + 34) | 305 suites, 6351 passed, 8 skipped (was 299 / 6273: +6 suites, +78 tests) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 160 warnings | 0 errors, 160 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | green, 124 entries | green, 124 entries built |
| `npm run test:tools` | not rerun (tools unchanged) | 22 passed |
| `npx nx run angular-ui-kit:build-storybook` | green, 1132 stories | green, 1132 stories (+15) |
| Baseline compare | see *Review round 1 fixes* | `tmp/story-shots/059/build-{a,b,c,d}` vs `baseline`: **286/292 identical**; differ: hero *Fill* 360 L/D (expected, dl rows), table *With Pagination* 1280 L/D (random, differs from my own rerun too), *Focus After Tap* 360/1280 L (1 px at 14,27, Δ 5; designer's unstable list). New stories: `new-frame` (42, 360/1024/1280), `new-picture` (24), `new-rest` (20, axe 0 violations), `forced` (4), `ws` (4) |
| `check-angular-majors.mjs --only=22` | not rerun (no server-rendered change) | PASS, 113 checks ok (110 + 3) |

## Deviations from the design (all four accepted in review r1, design.md change notes 1–5)

1. **List word breaks.** As designed, the 3 named rows of *Jump Marks* **failed** axe `label-content-name-mismatch` in Chromium (`tmp/059/axe-jump.log`): axe 4.14 joins the row's text nodes without spaces („Lücken3 offen“), so no `ariaLabel` can contain it. Fix: with an `ariaLabel`, label, subtitle, description, badge and metadata start with a space in the same text node (`{{ wordBreak(item) }}{{ item.badge }}`, `''` without it). Measured: 8 spaced spans, 0 boxes or text ranges moved when trimmed (360/1280 L·D); axe 0 violations; default rows byte-identical.
2. Sources stand-ins keep the exact 6 : 13 ratio (560 × 1213.333); shots are 2x, so *Sources* shows „AVIF · 560w“ (§8 says 280w at 1x; description names both).
3. *Screenshot Row*: `scroll-snap-align: start` + `scroll-padding-inline: 16px` (else the snap put the first figure at x 0); the frame slot is 474 px from 1024 px (§3 gives only 535 at 360). The EN caption of §7 is not built (no string in §8).
4. `lc-picture` host is `display: block` (not in §2/§3); no visible effect in the measured boxes.

## Changelog draft

### Added

- **`lc-device-frame`** (`@lifecorner/angular-ui-kit/device-frame`; life-os website screenshots, G-SS1): a phone bezel around any projected media. `size` `sm`/`md`/`lg` = 200/248/320 px (never wider than the container; bezel 6/8/10, radius 24/32/42), `notch` (a decorative camera pill in a deeper top bezel, never over the media), `device` (`'phone'`). Black glass in both themes inside a 1 px `--color-field-border` rim (3:1 or more on every page and surface: light 4.39–4.83, dark 5.56–7.31); forced colours draw a `CanvasText` border. The media keeps its ratio (a 360 × 780 image: screen 232 × 502.67 at `md`); markup and size are in prerendered HTML. Hooks `--lc-device-frame-width`, `-bezel` (a bare `0` works), `-radius`, `-bezel-color`, `-rim-color`, `-notch-color`, `-shadow`, `-screen-bg`. No role, no Tab stop.
- **`lc-picture`** (`@lifecorner/angular-ui-kit/picture`; G-SS2): a native `<picture>` with `sources` (`{ srcset, type?, sizes?, media?, theme? }`) before the `<img>`, required `src`, `alt` (`''` = decorative), `width`, `height`; `loading` (`lazy`), `decoding` (`async`), `fetchpriority`, `srcset`, `sizes`. `darkSrc`, `darkSrcset` or a `theme: 'dark'` source render a second picture that the root theme shows (as `lc-logo`): no flash in prerendered HTML, and with `lazy` only the visible one is fetched. The box is reserved before load (248 × 537.33 in a 248 px column, loaded or failed). Hooks `--lc-picture-radius`, `--lc-picture-min-width`.
- **`lc-select` `clearable`** (finance-intelligence services-prove-2026-11-10 row 1): `false` renders no clear button for selects that always have a value: one Tab stop fewer, and the text gets the room (280 px `lg` field: „Mit enthaltenen Services“ whole instead of „Mit enthaltenen Se…“; 192 px `sm`: „Sortierung: Kosten“ no longer under the ×). Default `true` renders as 3.38.
- **`ListItem.ariaLabel`** (stammdaten-prove-2026-11-10 row 1): the accessible name of an `href` row's link, a `clickable` row, or a row action's row button, for jump marks („Zu Lücken, 3 offen“). The row's text parts then get word breaks, so a name holding the visible text passes axe `label-content-name-mismatch`. Ignored on plain rows (dev warning).

### Fixed

- **`lc-description-list` spaces** (services-prove bug, 3.37/3.38): one space per break in `textContent` and names: „Summe, Gesamtkosten Ist 522.530,00 €“ (was two spaces after the comma and three before the amount); compare it without normalising.
- **`lc-description-list` narrow columns** (057-n3): in `rows`, a value that can't keep 6em beside its term moves onto its own line, right-aligned; „214.300,00 €“ no longer breaks inside the number in a 156 px card. Long terms hyphenate (12+ letters). Rows that fit are unchanged (1280 px identical).
- **`lc-select` xs/sm/md** (057-n1): a long value ends 4 px before the × (it ran under it).
- **`lc-list` row with an action** (057-n5): its row button is named by the parts joined by commas, without the action („SAP-Ist, Heute, 06:00, Geladen“).
- **`lc-table` page size**: no clear button in the DOM any more (`clearable="false"`).

### Compatibility

- No API breaks; peer range unchanged. Exact `textContent` of description lists changes (single spaces). `rows` lists in narrow parents wrap values (min-content is the larger part, not the sum). `--lc-select-clear-display: none` now keeps the ×'s room at xs/sm/md too (22 px less text); use `clearable="false"`. An existing `ariaLabel` key in `ListItem` data now names the row.
