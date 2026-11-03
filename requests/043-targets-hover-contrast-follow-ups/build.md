# Build 043: Targets, hover borders and contrast follow-ups of 042

- **Branch:** `fix/3.27.1-targets-hover-contrast`
- **Commit:** one commit `fix: 44 px targets, field hover and error borders, themed header scope, contrast follow-ups (043)` (amended after review r1; gates on the content of `25165b7`)

## Files changed

| File | Change |
|---|---|
| `notification-center.component.scss` | D-1: transparent `::before` 44 px areas on `__action-btn`, `__filter`; `__filters` padding 9 px |
| `log-viewer.component.{html,scss}` | D-1: pill area 44 × 44, toolbar padding 0.5rem. D-9: root without `tabindex` (eslint-disable with reason), `__content` `[attr.tabindex]="clickableLines() ? null : 0"`, inset ring + forced `Highlight`; dead root ring removed |
| `callout`, `chat` `.scss` | D-1: 44 px `::before` on `__dismiss`, `__send-btn`, `__attach-btn`. D-8: monogram `--color-on-primary-subtle` |
| `select`, `tag-input` `.scss` | D-3: select `__clear` a 24 px box (r2, F3), tag `__tag-remove` a 24 px `::before`. D-5: select hover `:not(.lc-select--error)`. D-8: chip `--color-on-primary-subtle` |
| `table.component.{html,scss}` | D-1: `label.lc-table__select-hit` (stops the click) round both checkboxes; its `::before` covers the 44 px cell; checkbox `position: relative` |
| `rich-text-editor`, `document-viewer` `.scss` | D-2: 44 px buttons; RTE frame `--color-field-border` (D-6), `.active` fill pair (D-8); doc toolbar wraps (§3) |
| `input`, `textarea`, `datepicker` `.scss` | D-5: every hover rule skips the error class; textarea/datepicker hover `--color-text-secondary` |
| `gallery`, `kanban-board` `.scss` | D-8: fill pair, hover `--color-link` / `--color-primary-fill-hover`. D-10: `--color-error-subtle` |
| `_theme-light.scss`, `_theme-dark.scss` | D-7: colours in `-light-theme-colors` / `-dark-theme-colors`; root rules emit the same 252 tokens (old vs new compiled maps equal, temp spec); `.lc-header--light` / `--dark` include them (172 each) |
| 12 stories | §8, IDs as designed (checked in `index.json`) |
| Specs | 48 new tests: `styles/touch-targets-contrast.spec.ts`, `log-viewer.output-region.spec.ts` (6), `table.select-hit.spec.ts` (7), `theme-modes.spec.ts` (+4); changed: Deviation 3. r2: the select row left the `::before` table for its own test (box, no `::before`, ring offset 0, hover keeps the clip) |
| `requests/042-…/release.md` | AC-11 (the designer's edit, D-11) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | `hit.mjs` on the 12 new stories, 360/1024/1280 L/D (+320 L): every control in ± 21.5 (select/tag ± 11), out ± 23 or edge + 3.5 → 0 fails except table `sm` (exception, F2) and chips scrolled out of their box. Tag and select: Round 2. Spec: every `::before` and real size |
| AC-2 | Compare vs baseline: §9 set + 3 raster shots (Gates). Rows: NC filters 45.5, log toolbar 45, RTE 201 (360) / 61, doc 95 (360) / 143 (320) / 61; `scrollWidth − clientWidth` 0 on every row and page at 320/360 (NC chips scroll: 76 / 116 as before) |
| AC-3 / AC-4 | `hover.mjs`: outline hover 7.55 L / 12.16 D (input, select, textarea, datepicker); 4 error fields rest = hover 8.39 / 9.47, message colour SAME. Specs: no hover rule without `:not(<error>)`, contrasts |
| AC-5 | Spec: frame `1px solid var(--color-field-border)`; 4.83 / 7.31 (page), 4.83 / 6.70 (surface) |
| AC-6 / AC-7 | `scope.mjs` *Theme Scope*: per header identical in light and dark page; light header 6.21 / 17.12 / 6.21, dark header 6.21 / 16.32 / 12.13. Spec: header token sets = root colour sets |
| AC-8 | `--axe` gallery ×2, RTE default/split, chat user-avatar, tag KF, kanban ×2, log ×2 (360/1280 L/D): 40 shots, 0 violations. New stories: 66 of 72 clean in r1; r2: select TT + KF 0 in 12, tag TT 0 in 6 |
| AC-9 | Specs (tabindex 0 / none with `clickableLines`, root none, name, `/` bubbles); `ring.mjs`: `:focus-visible`, inset 2 px, 4.36 L / 9.12 D, stop after the pills |
| AC-10 | Spec: title 6.58 L (≥ 4.5 D on page and surface), card ring 4.36 / 9.12; kanban axe clean |
| AC-11 | `release.md` line 43 names `…phone-width-de` (D-11) |
| AC-12 | No `.ts` API change (inputs, outputs, hooks); compare as AC-2 |
| AC-13 | `ring.mjs` on 11 *Keyboard Focus* stories: rings round the visible box (callout 24, checkbox 16, doc 44); `--forced-colors`: 7 stories `Highlight`; tab order unchanged except D-9 |
| AC-14 | Compat 22: 94 checks pass |
| AC-15 | Changelog draft below |

## Gates

Round 2: all gates ran on the content of `25165b72e4928d7fecd1734547cd021ead847c18` (`git diff --quiet 25165b7 -- libs tools` holds). r1 ran on `682cade`.

| Gate | Result |
|---|---|
| `test` (`--runInBand`) | 228 suites, 5389 passed, 8 skipped (73 s); r2 changed files alone: 2 suites, 136 tests |
| `lint` | 0 errors, 162 warnings (= main) |
| `build` | 122 entries built |
| `npm run test:tools` | 22 pass (tools unchanged; stories parse) |
| `build-storybook` | 1028 stories |
| Shots r1 | vs `baseline` (522): 177 differ = the §9 174 + tag KF dark ×3 (raster); 72 chat (clock); 273 identical. New: `tmp/story-shots/043/new/` (72) |
| Shots r2 | `043/r2-select-tt` vs `new/` 6/6 identical, `r2-select-kf` vs `baseline` 6/6 identical, `--axe` 0 in 12; `r2-tag-tt` (6, new content, axe 0); `r2-final`: table + select TT vs `new/` 12/12 identical |
| Compat `--only=22` | PASS, 94 prerender checks (r2 again: `lc-select` is prerendered there) |

## Deviations from the design

1–3 of r1 (table label `inline`, `blob:` image, changed assertions) were agreed in review r1. One more changed assertion (r2, F3): `focus-indicators.spec` select × offset `2px` → `0`: the box grew from 20 to 24 px, so offset 0 draws the ring in the same place (KF shots identical to `baseline`).

## Round 2 (review r1 F1–F4)

| # | Fix | Evidence (`tmp/043/r2/*.log`) |
|---|---|---|
| F1 | Story prop `tags` → `seedTags`: Storybook copies every story prop that is not an input onto the story component, so `tags` replaced the component's `tags` signal | 6 chips, `hit.mjs(6)` 0 fails, 6 `tag-remove` lines per shot (360/1024/1280 L/D); `tagarea.mjs`: 36 areas 24 × 24, 0.8 px below the chip top, 4 px inside the chip end, 0 overlap with another chip or the input; names "Entfernen <tag>"; page and field `sw−cw` 0. At 360 px **three** chip rows (y 48 / 77.6 / 107.2), not the two design §8 estimated with its tag list; the story text says three |
| F2 | Table TT description: `md` 44 × 45.5, `sm` rows 37–38 → cell 44 × 37 (2.5.8 by size); changelog Fixed | description only (shots identical) |
| F3 | Select × CSS as F3; `position: relative` kept (as in the prototype); spec rows above | `hit.mjs`: box 277,·,24,24, in ± 11 Y, out ± 15.5 none, 0 fails in 6 shots |
| F4 | Changelog: "9 components"; select × wording | below |

Theme CSS: +198 B gzip for both theme files (agreed in r1).

## Changelog draft

```markdown
## [3.27.1] - 2026-11-03

44 px touch targets on the controls the 042 sweep found, field hover that keeps 3:1 and the error state, a 3:1 rich-text frame, a themed `lc-header` that keeps its palette inside a page of the other theme, and four contrast and one keyboard finding (042 follow-ups F-22 to F-27). No API breaks.

### Fixed

- **Touch targets (F-22, WCAG 2.5.8):** 44 × 44 px hit areas without a visible change on the `lc-notification-center` header actions (26 px high) and filter chips (26.5 px; filter row 45.5 px, was 43.5), the `lc-log-viewer` level pills (were 40 px high; toolbar 45 px, was 41), the `lc-callout` dismiss (24 px) and the `lc-chat` send and attach buttons (32 px). `lc-table`: the whole selection cell toggles its checkbox (column 44 px at every width, was 40 and 32 at 360 px; the box stays 16 px; a click in the cell never reaches a clickable row): 44 × 45.5 px in `md`; `size="sm"` rows are 37–38 px, so there the cell is 44 × 37 px (WCAG 2.5.8 by size; the row height is the density you chose). Real 44 px buttons where neighbours sit 2–4 px apart: `lc-rich-text-editor` toolbar (were 32) and mode buttons (26 high), `lc-document-viewer` tools (32). `lc-select` clear ×: a 24 × 24 px button (layout, hover fill and ring unchanged), so axe `target-size` passes too. `lc-tag-input` remove ×: a 24 × 24 px area inside the chip. Both meet 2.5.8 by size; 44 px would leave the field or cover the next chip row. Stories *Touch Targets* in 9 components.
- **Field hover (F-23):** the textarea and datepicker hover border was `--color-primary-400` (1.89:1 light); it is `--color-text-secondary` as in input and select (7.55:1 light, 12.16:1 dark). Input, select, textarea and datepicker with an error keep the error border under the pointer (8.39 / 9.47:1; it was replaced by the hover colour). Story *Input / Error State on Hover*.
- **`lc-rich-text-editor` frame (F-24):** `--color-field-border`, 4.83:1 light and 7.31:1 dark on the page (`--color-border` was 1.23 / 1.29).
- **`lc-header theme="light"` / `"dark"` (F-25):** the header re-declares every colour token of its theme, so slot buttons, links, the theme toggle and the account menu use the header palette: a light header on a dark page now reads 6.21 / 17.12 / 6.21:1 (primary, outline, link; outline and link were 1.05 and 1.59), a dark header on a light page 6.21 / 16.32 / 12.13:1 (were 1.00 and 3.12). Story *Header / Theme Scope*.
- **Contrast (F-26):** RTE pressed mode and gallery active filter: white on `--color-primary-fill`, 6.21:1 in both themes (was 4.36 light, 1.89 dark); gallery hover ink `--color-link` (6.21 / 11.78, was 4.36 light); `lc-tag-input` chip text 7.18:1 and `lc-chat` monogram 7.00:1 in light (were 3.43 and 3.34), dark unchanged.
- **`lc-log-viewer` keyboard (F-26):** the scrolling output is the viewer's tab stop (`tabindex="0"`, `role="log"`, `outputAriaLabel`) with an inset ring (4.36 / 9.12:1, `Highlight` in forced colours), so arrow and page keys scroll it (axe `scrollable-region-focusable`); with `clickableLines` the lines are the stops. Story *Output Region Focus*.
- **`lc-kanban-board` over-limit column (F-27):** `--color-error-subtle`; the column title reads 6.58:1 in light (was 3.80); dark unchanged.

### Compatibility

- No input, output, type, CSS hook or default value changed. Sizes grow: RTE toolbar +88 px at 360 px and +12 px from 1024 px (14 actions), document-viewer toolbar +12 px (two rows below about 470 px), NC filter row +2 px, log toolbar +4 px, table selection column 44 px. 273 of 522 at-rest shots of the touched stories are hash-identical; 177 show the growth and colour fixes above, 72 only chat clock times.
- `lc-log-viewer`: the tab stop moved from the whole viewer to its output (after toolbar, pills and search); `/`, `g`, `G` work from any control inside. A test that focuses `.lc-log-viewer` needs `.lc-log-viewer__content`.
- `lc-table`: each selection checkbox sits in a `label.lc-table__select-hit`; a selector like `td > input` needs `td input`.
- A themed header no longer sees token overrides set on `:root`; set them on `.lc-header--light` / `.lc-header--dark` too. Global CSS +0.2 kB gzip.
- Checked on Angular 22 (AOT, strictTemplates, prerender).
```
