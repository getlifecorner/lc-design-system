# Build 063: lazy tree rows, chart gaps and dashes, USM X form, alert, menu, icon and theme-scope gaps

- **Branch:** `feat/3.43-usmx-gaps-lazy-tree-chart` · **Commit:** one `feat(table,line-chart,textarea,alert,menu,number-input,icon): …` commit (`git log -1`); code = `bc926d2` (round 2: review F1–F3)

## Files changed

| Area | Change |
|---|---|
| `table/` | `hasChildrenKey`; lazy rows start collapsed (`isExpanded(id, loaded)`), → on an open childless row is a no-op, `expandedIdsChange` lists lazy ids; chevron `::before` hit area (turned back when rotated) |
| `line-chart/`, `internal/chart/chart-path.ts` | `data: (number \| null)[]`, `dashed`; segments, lone dots, gap summary; `chartDashArray()`; dashed swatch, forced-colours swatches |
| `textarea/` | `oneLine`, `rowsAttr`, `showsFooter`; `--one-line { min-height: 0; display: block }` (r2, F1); auto-resize border + `overflow-y` when capped |
| `alert/` | `role` input, `AlertRole`, focus in/out, ids on title/content in dialog mode; hooks `--lc-alert-bg/-border/-fg/-icon`; dialog focus ring |
| `menu/` | `MenuItem.children`, `indentChildren`; `actions()` flat list for keys; section markup, heading and indent rules |
| `number-input/` | `valueType`, `NumberInputValueType`, `stringValueChange`; BigInt decimal helpers; (r2, F3) hook `--lc-number-input-value-width` on the value box (fallbacks 3/3.5/4/4.5 rem), class + `size` JSDoc, docs and `size` argType |
| `icon/` | `@property --lc-icon-size` (`*`, not inherited), host bridge `--_lc-icon-size`, sizes as fallbacks |
| `tokens.json`, `styles/_theme-*.scss`, `tokens/*`, `docs/colors.mdx` | `--color-accent-yellow`; public `light-theme-tokens`; `.lc-theme-light` / `.lc-theme-dark` join the header scope lists (+199 / +232 bytes; `:root` rules gain only the yellow line, `tmp/063/root-diff.txt`); docs: yellow tile + recipe, *Theme scopes (3.43)* |
| stories | the 14 of design §8 (+ argTypes `hasChildrenKey`, `series`, `ariaLabel`, `role`, `items`, `valueType`, `rows/minRows/maxRows`, `size`); r2: *One Line Chat (DE)* button `size="lg"` (F2), *String Mode* case number and *String Mode (DE)* wrapper set the hook (F3) |
| new specs | `table.lazy-tree` (12), `line-chart.gaps` (16), `textarea.one-line` (14), `alert.dialog-hooks` (16), `menu.sections` (12), `number-input.string-mode` (18), `icon.size-hook` (3) |
| `tools/compat` | `probe-343.ts`, 3 `EXPECT_IN_HTML` rows (AC-33) |

## Acceptance criteria

| AC | Covered by (measures `tmp/063/new-*.log`, `tmp/063/ta.log`) |
|---|---|
| 1–5 | `table.lazy-tree.spec`; *Tree Lazy Rows (DE)* 360: row 37.5 before and after opening (lazy sibling 37), 4 → 7 rows after 500 ms, child level 2, +20 px; hit 32 × 36 sm / 32 × 44 md, end 0, also rotated; existing table specs unmodified |
| 6 (story DE sm, 360/1024/1280 L/D, axe 0), 7–11 | `line-chart.gaps.spec` (M per segment, lone dot with `showDots` false, area per segment, scale, all-null, summary, DE label, pinned default path and attributes) |
| 12 | *Gaps And Forecast (DE)*: dash `6px, 4px` butt, round on solid, swatch gradient in `rgb(32,132,151)`; 25 dots; axe 0 |
| 13–15 | `textarea.one-line.spec` (r2: pins `display: block` and that no other field rule sets `display`); *One Line*: xs 36 / sm 43 / md 50 / lg 57, `min-height 0px`, capped 146 + `overflow-y: auto`, r2 hosts 65/72/79/86/175, host − field bottom 0; *One Line Chat (DE)* r2: button 45.6 × 45.6, button − field bottom 0 at one line (95/95) and at 3 lines (field 98, 143/143); baseline: hosts −8 (sizes 99/115/131/147, fields 64/80/96/112; default 133, field 98) |
| 16–17 | `alert.dialog-hooks.spec` (roles, ids, no live region, focus in, back on dismiss / hide / destroy, not stolen back, axe); story: focused, ring 2 px; existing role specs unmodified |
| 18–20 | spec pins the hook rules and that the kit declares none; *Custom Colors (DE)* L/D: bg/border/icon from the hooks, text `#111827` / `#f1f6f8`; `theme-contrast` 3.43 block |
| 21–23 | `number-input.string-mode.spec` (`"1.50"`, 20-digit id ±1, `"2.00"`, scale, clamp `"10.00"`, `"007"` kept, DE, partials, number mode, axe; r2: hook per size + never declared); stories: models `"1.50"`, `"12345678901234567890"`, DE „1,50“, invalid, disabled; r2 (`tmp/063/r2/shots-new.log`): id box 209.6, control 291.6, page 360, DE boxes 78.5; every value `scrollWidth` = `clientWidth` |
| 24–26 | `menu.sections.spec`; *Sections (DE)*: heading 30 px, indent +16, items 44, groups named, axe 0 L/D |
| 27 | `icon.size-hook.spec`; *Size Hook*: box + svg 18 × 18, attr `20px`, container hook → 20 |
| 28–29 | `theme-modes.spec` (scopes = root colours, mixins = root sets, yellow); *Light Panel In Dark Scope*: panel `#fff`, items 17.73:1, trigger dark |
| 30–33 | 84 new shots, `scrollWidth` = width everywhere, axe 0 violations; compat probe-343 |

**Default DOM:** temp spec rendered the 3.42 templates of chart, textarea (with content), alert, menu against now: identical without comments; textarea without content differs only by the empty footer. **Changed assertions:** `theme-modes.spec` 172 → 173 / 252 → 253 (new token) · `theme-contrast.spec` alert icon rule and tint regex read the hook fallbacks · `alert.close-target.spec` text colour via `--lc-alert-fg` · `icon.inline-style.spec` `width: var(--_lc-icon-size, <px>)` · r2: `number-input.locale-size.spec` value-box widths read `var(--lc-number-input-value-width, <rem>)`. Same rest values in each.

## Gates

Round 2 gates ran on code commit `bc926d2c68b4e2ec182f8aa500288eab891173ab` (skip while `git diff --quiet bc926d2 -- libs tools` holds); logs `tmp/063/r2/`. Round 1 ran on `4e9a365`.

| Gate | Result |
|---|---|
| test | r2: 326 suites, 6677 passed (+6: textarea 1, number-input 5), 8 skipped; `card.link`, `card.collapsible`, `icon.size-hook` hit the worker SIGSEGV (compat running beside), rerun alone: 35 + 18 + 3 passed |
| lint | r2: 0 errors, 160 warnings (= 3.42) |
| build | r2: 125 entries |
| test:tools | r2: 22 / 22 (compat check file changed) |
| build-storybook | r2: built `--skip-nx-cache` (no new stories; r1: 1189, +14) |
| Round 2 shots | `tmp/story-shots/063/r2-new` (16: *One Line*, *One Line Chat (DE)*, *String Mode*, *String Mode (DE)* × 360/1280 × L/D, `--axe` 0 violations; measure `tmp/063/measure/r2.mjs`, log `tmp/063/r2/shots-new.log`). Baseline compare: number input 48/48 identical (`r2-cmp-ni`); textarea 56/68 identical, the 12 diffs are *Sizes*, *Filled States*, *No Script Contact Form* (the −8 px of AC-15), and all 68 are byte-identical to round 1 (`diff -rq r2-cmp-ta r1-cmp`: 0) |
| Screenshots | new `tmp/story-shots/063/new` (84). Baseline compare `r1-a…d`: 476 shots, 451 identical, 25 different: textarea *Sizes*, *Filled States*, *No Script Contact Form*, input *Required Asterisk* (−8 px, as designed); noise: table *Full Featured*, *With Filtering*, *With Pagination* 1280; icon *All Icons* 1280 (two glyphs not loaded yet, identical after 2.5 s, `r5`); sidenav *Themed Rail Badges* 360 D (identical on rerun, `r2`) |
| compat `--only=22` | r2: 123 checks ok (120 + 3); the one-line check now also pins `display: block` in the prerendered CSS (`tmp/063/r2/compat-22.log`) |

## Deviations from the design (for the designer)

Round 1 listed five; all are ruled in review.md *Deviations*: 1 (composer 6 px low) → option (c), built in r2 as F1 (`display: block` on the one-line class only; multi-line hosts keep the gap, F5 backlog); 2 (auto-resize border not in the `minRows` floor), 3 (alert hooks as `var(--lc-alert-*, <3.42 value>)`), 4 (yellow tint 16 %, not 18 %) and 5 (*Sections (DE)* item wraps, 64 px) accepted. Round 2 adds none: every r2 value matches design §9 (r1).

## Changelog draft

### Added

- **`lc-table` `hasChildrenKey`** (kosten-2026-11-17 row 1): a tree row whose field is truthy shows the chevron (`aria-expanded="false"`) before its children are loaded; the first open emits `rowToggle` once and the row stays one row high until the page adds the children (then indented, no second event). The table shows no loading state.
- **`LineChartSeries.data` takes `null`** (no value: the line breaks, a lone value is a dot, the scale and the summary skip it: „8 points, 4 with no value, 38 to 52“) and **`LineChartSeries.dashed`** (6/4 px at the default stroke, in the series colour, also in the legend) (kosten row 2).
- **`lc-textarea` one-line mode** (usm-x row 6): `rows` 1, or `minRows` 1 with `autoResize`: one line plus padding (xs 36, sm 43, md 50, lg 57 px), growing to `maxRows`, then scrolling. The host ends at the field (no line gap below it), so a send button aligned at the end lines up with the field, also as it grows.
- **`lc-alert` `role`** (`AlertRole`, usm-x row 7): `alertdialog` for a blocking question, named by the title, focused when shown, focus back to the opener when hidden. **Hooks** `--lc-alert-bg`, `-border`, `-fg`, `-icon` (row 8), on the alert or any ancestor.
- **`--color-accent-yellow`** (row 8): light `#867200` (4.75:1 on white), dark `#e8c547`; tint 16 %.
- **`MenuItem.children`** (sections with a heading, `role="group"`) and **`indentChildren`** (row 12).
- **`lc-number-input` `valueType="string"`** and `stringValueChange` (row 13): `"1.50"` stays `"1.50"`, a 20-digit id is not rounded; steppers and clamps work in decimal. **`--lc-number-input-value-width`** (on the element or any ancestor) widens the value box for a longer value (default xs 3, sm 3.5, md 4, lg 4.5 rem): `calc(20ch + 0.5rem)` shows all 20 digits of an id (210 px box at md), `calc(7ch + 0.5rem)` fits „1250,00“.
- **`--lc-icon-size`** (row 18): e.g. 18 px on an `lc-icon`; not inherited.
- **Theme scopes** `.lc-theme-light` / `.lc-theme-dark` and the mixin `light-theme-tokens` (row 19).

### Changed

- **`lc-textarea`** renders its footer only with a helper text, a counter or a visible error: a textarea without them is 8 px shorter (md host 141 → 133 px). Auto-resize counts the border, and a field at `maxRows` scrolls instead of clipping.
- Tree chevrons take taps on 32 × 44 px (32 × 36 at `sm`); line-chart legend swatches show in forced colours.

### Compatibility

- No API breaks: new inputs, fields and outputs are optional; `LineChartSeries.data` only widens (`NaN` and `undefined` still draw as 0). An `lc-textarea` with `rows` 1 (or `minRows` 1 and `autoResize`) is now one line high (was 6 rem at md).
