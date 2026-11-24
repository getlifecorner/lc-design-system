# Build 073: lc-combobox clearable, lc-stat-trend header arrangement, lc-select visible label

- **Branch:** `feat/3.52-combobox-stat-trend-select`
- **Commit:** see `git log -1` on the branch (one commit, amended), `feat(combobox,stat-trend,select): request 073 — …`

## Files changed

| File | Change |
|---|---|
| `lib/combobox/combobox.component.{ts,html}` | `clearable` (booleanAttribute, default true); `&& clearable()` on the × branch |
| `lib/stat-trend/stat-trend.component.{ts,html,scss}` | `StatTrendIconPlacement`, `iconPlacement`, `fullWidth`; host class bindings; `<ng-content select="[stat-trend-end]">` after the icon; 8 rules appended (design §3) |
| `lib/select/select.component.{ts,html,scss}` | `label`, `requiredIndicator`, `ariaLabel` JSDoc; `<label id>` + click → trigger focus; `aria-labelledby`; list/search names from `ariaLabel \|\| label`; `.lc-select__label`, `.lc-select__required` |
| `*.stories.ts` (3) | argTypes `clearable`, `iconPlacement`, `fullWidth`, `label`, `requiredIndicator`; the 7 new stories of design §8; *Registration Form* labels |
| `combobox.clearable.spec.ts`, `stat-trend.header.spec.ts`, `select.label.spec.ts` | new: 14 + 16 + 15 tests |

No existing spec changed. Not changed: tokens, themes, READMEs (no new component), `tools/` (compat regexes hold as they are).

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1, 5 | `combobox.clearable.spec`: no × at sm/md/lg, label stays, attribute form, typing filters + Enter replaces, tab stops `input → next`, Escape/Enter as before |
| 2, 10, 16 | Existing specs pass unedited; temp proof `tmp/073/zz-073-default-dom.spec.ts.txt`: 5 cases (combobox closed/open, select closed/open, stat-trend variants) byte-identical to main's templates apart from comment anchors; host has no `class` attribute by default (unit); 288/294 baseline shots identical |
| 3 | unit (multiple chips keep ×, spinner, `writeValue(null)`, `selectedValue` null, `clear()`, disabled); story: frame end − input end = 9.00 at sm/md/lg (33.00 with ×), frame overflow 0 at 360/1024/1280 |
| 4 | *Required single choice (DE)*, L/D, 360/1024/1280 |
| 6 | unit (host class, order); *Header Arrangement* cards 3, 5: glyph → icon 8.00 at 360/1024/1280 |
| 7 | *Header Arrangement* card 2: host and header 33 → 399 = card content (1024/1280), 33 → 327 at 360; *KPI Tile* host = content at all widths; row and sparkline x 33, sparkline 120 × 28 |
| 8 | unit (last child, no wrapper, no node without content); *KPI Tile* 1280: badge end = content end, Δcentre 0; *Header Arrangement* card 4: icon 8 px before the badge |
| 9 | unit: order label/icon/slot for both placements, label-only, slot-only → no header, no badge (D-4); stories cards 4–6 |
| 11 | `stat-trend.header.spec` axe: clickable card + badge passes (0 violations, label-in-name pass), negative control without the space fails; `--axe` on all 48 new shots: 0 violations |
| 12 | *KPI Tile* 360: tile A header 48, badge x = content start, overflow 0, page 360; 1024: A wraps, B/C one row; 1280: one row. *Header RTL*: label end = right content edge, badge at 33 (left), after-label gap 8.00 |
| 13 | compat (unchanged regexes), see Gates |
| 14 | *Labels in a Form (DE)* 1024/1280: select and combobox labels top 16/16, 21 px high, 6.0 px to the field; field tops 43/43; CSS pinned in `select.label.spec` |
| 15 | unit: `<label id>` without `for`, `aria-labelledby`, name = label (axe `computedName`), `ariaLabel` wins, click focuses (not when disabled), `*` aria-hidden, `requiredIndicator=false`; axe 0 violations |
| 17 | *Label States (DE)* 360 L/D: every label 1 line, overflow 0, 6.0 px to the trigger, triggers 24/32/40/44; `--forced-colors` shots |
| 18 | unit: list `aria-label` and search fallback without label (3.51), with `ariaLabel`, with `label`, `searchAriaLabel` wins |
| 19 | JSDoc `@default` on every new input; argTypes with description + default; lint 0 errors; manifest reads the JSDoc (no tools change) |
| 20 | build, compat 22 (below); changelog draft below |

## Gates

All gates ran on commit `2220cc2e396e7b8ea65f7dbef5a7fe5b9553a899` (later agents skip a gate while `git diff --quiet 2220cc2 -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 396 suites, 7618 passed, 8 skipped (`--maxWorkers=4`; `combobox.targets` SIGSEGV worker crash, rerun alone: 14/14) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 159 warnings (baseline 0/159) |
| `npx nx run angular-ui-kit:build` | green, 127 entries |
| `npm run test:tools` | tools unchanged |
| `npx nx run angular-ui-kit:build-storybook` | green |
| Story screenshots | baseline compare `tmp/story-shots/073/build-{a,b,c}` (294: 288 identical, *Registration Form* ×6 as planned; *Focus After Tap* ×6 and *Grouped Options, Search (DE)* ×2 differed only under the 800 ms measure wait, identical when shot like the baseline: `build-play`, 12/12); new `build-new` (48, `--axe`, measure `tmp/073/measure/m.mjs`); forced colours `build-fc` (12) |
| `node tools/compat/check-angular-majors.mjs --only=22` | green: install, AOT build + prerender, 144 prerendered-HTML checks (as 3.51; `tmp/073/compat.log`) |

## Deviations from the design

| # | Deviation | Why | Needs |
|---|---|---|---|
| X-1 | Slot docs (§2 JSDoc, §6): **every** slot text starts with a space (`&ngsp;` or the text on its own line), also inside `lc-badge`; the stories do so | axe 4.14 `label-content-name-mismatch` reads visible text with `visibleVirtual`, which joins text nodes with no separator (no extra space for custom elements; that is only `accessibleText`). Tile A as designed: „Offene MaßnahmenTeilweise umgesetzt 27“ → violation (unit negative control). A kit-side space would add a text node to the default header (AC-8) or need JS detection | designer's agreement in review |
| X-2 | *Required single choice*: labels „Status (sm)“ … „Status (md, mit ×)“ instead of four „Status“ | four fields of one name are not distinguishable in the review (as *Clear Targets (DE)*) | designer's agreement |

Seen, pre-existing, not changed (backlog candidates): `lc-number-input`'s label is text-secondary and starts 2 px lower than select/combobox labels (row 2 of *Labels in a Form*: 103 vs 101; designer proto `fields.log` shows the same 2 px); `lc-select multiple` shows the English „2 selected“ with no label input.

## Changelog draft

### Added

- **`lc-combobox clearable`** (finance-intelligence massnahmen-prove-2026-11-22 row 5, form „Maßnahme anlegen“): `false` leaves out the × of a selected single value, so a required status can't be emptied by a click and Tab goes from the input to the next control. The input then reaches the frame's end padding (9 px from the edge at sm, md and lg, as an empty field). Typing still filters, another option replaces the value, and `clear()`, `writeValue(null)` and `[(selectedValue)]` still clear it; `multiple` chips keep their ×.
- **`lc-stat-trend fullWidth`, `iconPlacement` and the slot `[stat-trend-end]`** (cockpit-prove-2026-11-22, cockpit KPI tiles): `fullWidth` lets the tile fill its container (header end = card content end); `iconPlacement="after-label"` (type `StatTrendIconPlacement`) puts the icon 8 px after the label; `[stat-trend-end]` takes one element, such as a state `lc-badge`, at the end of the header, centred on the label. Order is always label, icon, slot, and RTL mirrors. When they don't fit on one row (at 360 px „OFFENE MASSNAHMEN“, icon and „Teilweise umgesetzt“ need 336 of 294 px), the badge moves to a second header row at the start (header 48 px). Start the slot's text with a space (`&ngsp;`), also inside an `lc-badge`, so axe's WCAG 2.5.3 check reads two words.
- **`lc-select label` and `requiredIndicator`** (simulation-2026-11-24 row 1): a visible label above the trigger with the `lc-combobox` label's tokens (14 px, weight 500, 6 px to the field), so label and field tops line up beside a combobox. It names the trigger (`aria-labelledby`), the list and the search fallback („Search {label}“), and a click focuses the trigger. `required` adds a `*` hidden from screen readers unless `requiredIndicator` is false. `ariaLabel` wins when both are set.

### Compatibility

- No API breaks; every new input defaults to the 3.51 rendering (DOM identical apart from comment anchors). A `label` attribute on `lc-select` that did nothing before now shows a label and names the field. Known limits: a wrapping `after-label` label fills its row, so the icon sits at the row end; tiles in one grid row align their values only when their headers have the same height. Tested: 7618 unit tests, compat check on Angular 22 (144 checks), axe 0 violations on 48 story shots.
