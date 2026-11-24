# Review 073: lc-combobox clearable, lc-stat-trend header arrangement, lc-select visible label

## Round 1 — 2026-11-24, commit 0fac13f (libs/tools = gate commit 2220cc2)

Screenshots: `tmp/story-shots/073/r1/` (8 new or changed stories, 360 · 1024 · 1280, light · dark, 48 shots, all byte-identical to the developer's `build-new`; log `r1.log`, measure = the developer's `zz-073/m.mjs` plus label fonts, computed contrast and a slot-space width probe), `r1-x1.log` (axe label-in-name probe, KPI Tile 360 L), forced colours from the developer's `build-fc`. The Storybook build was current (no source newer than the build or the shots).

**Unchanged stories:** I re-checked the developer's `build-a/b/c` against `baseline` with `diff -rq`. Of 294 shots, 280 are identical. The 6 *Registration Form* shots differ as planned. *Focus After Tap* ×6 and *Grouped Options, Search (DE)* ×2 differ only under the 800 ms measure wait, and they are identical in `build-play` (12/12). That makes 288 identical.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | unit `combobox.clearable.spec` (14); *Required single choice* sm/md/lg: `.lc-combobox__clear` absent, value in the input |
| AC-2 | pass | no existing spec edited (`git show --stat`: 3 new spec files only); 18 combobox stories + `form-search-input--combobox` × 6 identical |
| AC-3 | pass | frame end − input end 9.00 at sm/md/lg (33.00 with ×), frame overflow 0 at 360/1024/1280 L/D; unit: multiple chips, spinner, `writeValue(null)`, disabled |
| AC-4 | pass | story DE, L/D, 360/1024/1280; argType `clearable` with description and default `true` |
| AC-5 | pass | unit (Tab input → next control, Escape, Enter) |
| AC-6 | pass | glyph → icon 8.00 in *Header Arrangement* cards 3 and 5 and KPI A and C, at all widths; RTL 8.00 |
| AC-7 | pass | card 2: host and header 33 → 399 = content (1024/1280), 33 → 327 (360), icon right = content right; row x 33; sparkline 33 → 153, 120 × 28 in all six cards |
| AC-8 | pass | badge end = content end (card 4, KPI B and C at all widths, KPI A at 1280: 404.33), Δcentre 0.00; no node without content (unit) |
| AC-9 | pass | order label, icon, badge: card 4 and KPI B have the icon 8.00 before the badge; card 6 header = row width 184.44, overflow 0; slot only → no header (unit, D-4) |
| AC-10 | pass | 13 stat-trend stories × 6 identical; specs unedited; host without `class` by default (unit) |
| AC-11 | pass | browser probe on tile A (clickable, „Offene Maßnahmen: Teilweise umgesetzt, 27“): rule passes (1 node) as built, 1 violation with the space removed, passes again when restored; `--axe` 48 shots 0 violations (build.md) |
| AC-12 | pass | KPI 360: tile A header 48 (33 → 81), badge at content start (x 33, top 57), overflow 0, page 360; 1024: A wraps, B and C one row (24); 1280: one row each. RTL 360/1280: label end 327/399, badge 33 → 107.47, icon 8.00 from badge/label |
| AC-13 | pass | compat 22: 144 prerender checks, regexes unchanged (build.md); the new rules need no JS (`:has()`, host classes) |
| AC-14 | pass | *Labels in a Form (DE)* 1024/1280: select and combobox labels 14 px / 21 / 500, tops 16/16, 6.00 to the field, field tops 43/43 |
| AC-15 | pass | trigger `aria-labelledby="lc-select-N-label"`, no `aria-label` (every select in the 24 select shots); unit: `ariaLabel` wins, click focuses (not disabled), `*` aria-hidden; contrast label 17.74 L / 17.29 D, `*` 8.39 / 9.48 (computed, = design §5) |
| AC-16 | pass | 15 select stories × 6 identical; *Registration Form* now „Industry“ / „Company size“ (planned) |
| AC-17 | pass | *Label States (DE)* 360/1024/1280 L/D: 10 labels, 1 line each, overflow 0, 6.00 to the trigger; triggers xs 24 · sm 32 · md 40 · lg 44; error and disabled labels stay text-primary; `build-fc`: labels and `*` in the system text colour |
| AC-18 | pass | unit (list and search names from `ariaLabel` or `label`, unchanged without them) |
| AC-19 | pass | JSDoc `@default` on all 5 new inputs and `ariaLabel`; argTypes with description and default; `StatTrendIconPlacement` exported (`export *`) |
| AC-20 | pass (22) | build and compat Angular 22 green (build.md). Angular 21 was not run (`--only=22`): the release-manager runs it |

### Deviations (build.md)

| # | Decision | Why |
|---|---|---|
| X-1 | **agreed** | The browser probe confirms it: without the leading space, axe reads „MaßnahmenTeilweise“ (1 violation), also inside `lc-badge`. My §2 and §6 were wrong, and design.md now has a change note. Badge widths with and without the space are equal (152.14, 66.33, 68.39, 74.47), so the space is invisible. A kit-side `&ngsp;` before the slot also passes (probe; header stays 48). It would add a text node to every default header against AC-10, so it goes to the backlog (F-5) |
| X-2 | **agreed** | Four fields named „Status“ can't be told apart. All labels are 1 line at 360 (21 px) |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F-1 | should-fix (pre-existing) | lc-select `multiple`, *Label States (DE)* all widths | the count summary can be changed through a label input (e.g. `{count}` template), English default, German verified (Conventions → Texts) | hard-coded English `${count} selected` (`select.component.ts:311`): „2 selected“ under „Art der Änderung (mehrere)“ |
| F-2 | nit (pre-existing) | lc-stat-trend `change`, *Header RTL* 360/1280 | „+12.5%“ stays one LTR run in RTL (isolate the change text) | the bidi algorithm moves the `+` to the right: „12.5%+“ |
| F-3 | nit (pre-existing) | lc-number-input label, *Labels in a Form (DE)* 1024/1280 row 2 | same top and colour as the select/combobox label | top 103 vs 101; `--color-text-secondary` (7.56 L) vs text-primary (17.74) |
| F-4 | nit | lc-combobox | `required` + `requiredIndicator` like lc-select 3.52 and lc-input (`*`, `aria-required`) | no input: in *Labels in a Form (DE)* only the select shows `*`, and the requester's required „Status“ has no cue |
| F-5 | nit | lc-stat-trend `[stat-trend-end]` | reconsider a kit-side `&ngsp;` before the slot when the default DOM may change, so consumers don't need the X-1 space | consumer rule (JSDoc, docs, changelog) |

**Verdict:** approved. There is no must-fix. F-1 goes to the queue, and F-2 to F-5 go to the backlog.
