# Build 052: lc-next-step-card focusTitle(), lc-header contextPlacement, lc-list aria-current, backlog sweep (20 rows)

- **Branch:** `feat/3.33-focus-title-header-row-backlog`
- **Commit:** see `git log -1` (one commit, amended after review rounds)

## Files changed

| Group | Files (`libs/angular-ui-kit/src/lib/…`) | Change |
|---|---|---|
| G1 | `next-step-card/*.{ts,html,scss,stories.ts}` | `focusTitle()` (`#titleEl` on the 3 branches), `:focus-visible` ring + FC Highlight; story *Focus After Action* |
| G2 | `header/*.{ts,html,scss,stories.ts}` | `contextPlacement` + `HeaderContextPlacement`; `lc-header--context-below` (only with a name), ≤ 640 px rules §3; argType; story *Context Below* |
| G3 | `list/*.{ts,html,stories.ts}` | `aria-current="true"` on the selected row element (3 row kinds); JSDoc; story *Current Choice* |
| G4 | `table/table.component.scss` | checkbox `display: block; margin: max(2.5px, (1lh − 16px)/2) auto` |
| G5 | `tag-input/*.{scss,stories.ts}` | chip text wraps + hyphens; chip radius `var(--border-radius-full)` then `calc(0.5lh + 3px)` (r1 #1, D-8); *Touch Targets (DE)* text/`lang`; story *Long Tags (DE)* |
| G6 | `textarea/textarea.component.scss` | error ink `--color-error-600`; 2 px primary focus ring (base/outline/filled), FC Highlight |
| G7 | `chat/*.{ts,scss,stories.ts}` | `formatBytes` via `Intl.NumberFormat(closestLang ‖ 'en')`; size `nowrap`; *Pending Attachments (DE)* `lang="de"` |
| G8 | `notification-center`, `log-viewer` SCSS | FC pressed mark = Highlight underline (`[aria-pressed='true']`) |
| G9 | `app-shell/app-shell.stories.ts` | headers „Kontoinhaber/in“, „Aktualisiert“ |
| G10 | `toast/toast-outlet.*` | `latestLive` → `--latest` region; bottom regions `column`, `--latest` `order: -1`; JSDoc + docs (045-n4); story *Bottom Stack Order* |
| G11 | `datepicker/*`, `combobox/*`, `select/*`, `internal/a11y/content-lang.ts` | D-5 origin span + panel margin/max; combobox positions (offset ±4), no `matchWidth`, field-width floor; select field-width floor; `openPanelLang()` (live `lang`, datepicker + combobox); *Label (DE)* labels; stories *Opens Above* ×2 |
| G12 | `sidenav/*.{html,scss,ts}` | badged rail items `title=""`, all rail items `data-tooltip`; tooltip `content: attr(data-tooltip) / ""` |
| G13 | `bottom-nav/*.{ts,scss,stories.ts}` | last-entry badge box (D-2); JSDoc; story *More Badge, Three Characters* |
| G14 | `tooltip/*.{ts,stories.ts}` | describe the focused control; move `aria-describedby` on focus moves; story *Host with Two Controls* |
| compat | `tools/compat/template/src/app/{probe-333.ts,home.ts,home.html}`, `check-angular-majors.mjs` | header `below` probe + `EXPECT_IN_HTML` check |
| specs | 15 new `*.spec.ts` (see AC table); 9 changed (Deviations) | |

## Acceptance criteria

Measures: `tmp/052/measure/{dp,toast,m}.mjs`, logs `tmp/052/m-*.log`. All values on this build, 360/1280 L/D unless noted.

| AC | Covered by | Measured |
|---|---|---|
| 1–3 | `next-step-card.focus-title.spec.ts` (3 tags, 5 tones + announce/blockers/meta, attrs before = `class` / `aria-live class`, ring + FC CSS) | ring 2 px offset 2, 4.37 L / 9.13 D, `:focus-visible` after the keyboard press, page 360/1280 no overflow |
| 4 | JSDoc on `focusTitle()` + class doc bullet + docs page bullet; story *Focus After Action* (snippet, play presses „Einfrieren“) | — |
| 5–8 | `header.context-placement.spec.ts`; compat `EXPECT_IN_HTML` (class, one button, ≤ 640 px rules before JS) | 360: button 4–356 × 49.58 at y 56, label text x 16 = title x 16, trigger 296/4 48×48 in row 1, header 113.58 (sm) / 121.58 (md); 320: button 312 wide; 641/1024/1280: inline 216.14 × 49.58 (= §3); 200 %: button 344 × 99.19, name „…“, no overflow; default: header set C 192/192 identical |
| 9 | `list.current.spec.ts` (3 row kinds, none otherwise, disabled, axe ×3) | story DOM: `true` on row 1 of both lists only; `--axe` 0 violations |
| 10 | `table.checkbox-centre.spec.ts` | \|centre − row middle\| ≤ 0.5 (−0.5 / +0.25 / 0) md and sm, 360/1280; pixel diff only x 30–45 (box), rows unchanged |
| 11, 13 | `tag-input.long-tags.spec.ts` (+ r1: radius pair in order, one fallback); story text | „Kostenstellenverantwortung“ 186 × 45.19 (2 lines), field 118.38 (360) / 59.19 (1280); long tag 3 lines; no cut; × centred, area 5 px from the chip end. r1 (`r1-chip-measure.js` without the prototype line = `tmp/052/measure/r1-chip-now.js`, *Long Tags (DE)* 360/1024/1280 L/D): radius 12.8 on the 3-, 2- and 1-line chip, first/last line-box clearance 3.2 / 3.8 px on all three (was −4.4 / −3.9 and −0.4 / 0), heights 64.78 / 45.19 / 25.59 unchanged; 360 L byte-identical to the designer's prototype shot `r1-chip` |
| 12, 14 | `textarea.focus-ring.spec.ts`; `filled-field-boundary.spec` rows | error `rgb(157,14,14)` 8.39 L, 9.48 D; ring 4.37 L / 9.95 D, border on fill 4.37 / 9.13, no shift, all variants |
| 15 | `chat.size-lang.spec.ts` (en, de, en-US, empty, invalid, no grouping) | DE „240,0 KB“ chip 256 × 30 (1 line), EN „240.0 KB“ also 30 |
| 16 | `theme-contrast.spec` (2 tests updated) | `--forced-colors`: pressed = underline 2 px Highlight; focused + pressed = ring + underline (NC „All (7)“, log „3 Fehler“ L/D) |
| 17 | story data | 1280/1440/1920: table 928 in a 928 region, no scroll, „Kontostand“ right edge = region edge |
| 18, 25 | `toast-outlet.order.spec.ts`; JSDoc/docs/*Offsets* text | edge → Success, Error, Warning (360, 1280); 200 % in a 600 px stack: newest + close in view, oldest scrolled out; DOM/regions unchanged |
| 19–21 | `datepicker.overlay-geometry.spec.ts`, `combobox.panel-width.spec.ts` | DP 360: x 10, right 352, gap 4 below and above (*Opens Above*); 1024/1280 boxes = `baseline-open`; 200 %: x 16, right 344, gap 8; CB gap 4 below and above |
| 22 | story | panel texts German (dp log `english: []` for the DE pickers) |
| 23 | `combobox.panel-width`, `select.panel-width` specs | CB 328/400 (*Panel Language*, *Starts with a choice*); select 328/400/1248 |
| 24 | `datepicker.overlay-geometry`, `combobox.panel-width`, `content-lang.open-panel` specs | — |
| 26 | `sidenav.rail-tooltip.spec.ts`, `badge-name` spec | — |
| 27 | `bottom-nav.badge-edge.spec.ts`; JSDoc | „99+“ right 351/350 = entry edge (bar 359), fullscreen 360; „3“, „1“ stay at pill centre + 6 |
| 28 | `tooltip.two-controls.spec.ts` | story: `aria-describedby` on „Kursiv“ only, tooltip `lang="de"` |
| 29–31 | gates below; compares below | — |

**Compares** (`tmp/story-shots/052/build` vs `baseline`, 936 shots, logs `tmp/052/cmp-{a1,a2,b,c}.log`): 868 identical, 68 different, all explained: table `with-selection`, `keyboard-focus`, `touch-targets` (12, box column only); tag-input `touch-targets`, `keyboard-focus` (8, chip > 150 px wraps); textarea `with-error`, `error-without-alert-role`, `filled-states` light (6, error ink); datepicker `month`, `month-de`, `panel-language`, `day-panel` 360 (8, panel x 10) and 1280 (8, 1–3 px Δ ≤ 8 at the selected-cell ring: the panel is now a scroll container); combobox and select `panel-language` (8, field-wide); app-shell `wide-page`, `wide-page-with-right-column` (8, headers); `toasts-in-the-shell-large-text` (4, reorder); noise: logviewer `streaming` (4, differs from its own re-shoot), sidenav `collapsed-vs-expanded` 360 L (2 px Δ 1), `toasts-in-the-shell` 1280 D (4 px Δ 1). New stories `tmp/story-shots/052/new` (36 shots, `--axe` 0 violations).

**Round 1 compares** (800 ms wait + chip measure, logs `tmp/052/r1/shots-{cmp,new}.log`): `tmp/story-shots/052/r1fix` vs `baseline`, 9 tag-input stories (incl. chip *Tag Input*) × 360/1280 L/D: 28 identical, 8 different = `keyboard-focus`, `touch-targets` (the two with a chip over 150 px; 2-line chip radius 12.8, clearance 3.2 / 3.8). `r1fix-new` *Long Tags (DE)* 360/1024/1280 L/D vs `r1-new`: 6 different (the chip shape, as intended). The nit #5 edits are docs texts (no canvas change).

## Gates

Round 1: all gates ran on the tree of commit `66e903d6b76a2412a18ef773df2644afc6613f3a` (later agents skip a gate while `git diff --quiet 66e903d6b76a2412a18ef773df2644afc6613f3a -- libs tools` holds; the amend that wrote this line changed only `build.md`). Round 0 gates ran on `99a2eaf` (Jest 5894, compat 101).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 270 suites, 5895 passed, 8 skipped (+15 suites, +93 tests; r1: +1, the radius) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings |
| `npx nx run angular-ui-kit:build` | 122 "Built" |
| `npm run test:tools` | 22 passed |
| `npx nx run angular-ui-kit:build-storybook` | 1076 stories (+9) |
| Story screenshots | `tmp/story-shots/052/{build,new,new-200,build-open,build-open-200,build-toast*,fc-*}`; r1: `r1fix`, `r1fix-new` |
| `node tools/compat/check-angular-majors.mjs --only=22` | 101 HTML checks ok (+1, the header probe) on `99a2eaf`. Not rerun in r1: the only server-side change is one CSS declaration on `.lc-tag-input__tag`; the compat page renders an empty tag input (no chip) and no `EXPECT_IN_HTML` check reads tag-input CSS; CI runs compat on `main` |

## Deviations from the design

| # | What | Why |
|---|---|---|
| 1 | D-5/D-6 lengths as tokens: origin `inset: var(--spacing-1) calc(-1 * var(--spacing-2))`, panel `margin: var(--spacing-2)`, max `calc(100vw - 2 * var(--spacing-2))` (also combobox/select) | Kit rule "tokens only"; equal to 4/8/16 px at 100 %. At 200 % the gap is 8 px (as the old `--spacing-1`) and the margins 16 px (AC-21 holds: x 16, right 344). Designer to confirm. |
| 2 | Bottom nav: `justify-content: flex-end` before `safe flex-end` | Without `safe` the declaration drops and `normal` puts the badge at the rtl start (the entry end); the fallback keeps today's position, as D-2 intends. |
| 3 | New-story frames: *Context Below* and *More Badge, Three Characters* use `layout: 'fullscreen'` | So the 360 shot is a 360 px app (button 4–356; the padded frame pushed the bar's end out of view). |
| 4 | *Focus After Action* has a third state („Monatsstand freigegeben“, „Von vorn“) | The demo can repeat; §7's two states unchanged. |
| 5 | Sidenav alt text via `string.unquote('attr(data-tooltip) / ""')` | Sass drops the spaces otherwise; output as designed. |
| 6 | Existing assertions changed (each the designed behaviour): `combobox.panel-lang` ×3 and `select.panel-lang` ×2 (+ `style`, D-6); `datepicker.targets-label` viewportMargin 8 → 0 (D-5); `filled-field-boundary` textarea focus rows (outline none → primary, AC-14); `theme-contrast` NC + log FC mark (outline → underline, AC-16); `log-viewer.output-region` anchor selector; `sidenav.component` anchor `attr(title)` → `attr(data-tooltip)`; `sidenav.badge-name` title label → `''` + `data-tooltip` (AC-26); `tooltip.focus` two controls: first → focused (AC-28). | — |

## Changelog draft

```
## [3.33.0] - 2026-11-06

Focus after an action on the next-step card, the header's context button on the phone, the current choice in lists, and the 20 backlog rows of requests 043–051 (Finance Intelligence Monatsstand and app shell). No API breaks.

### Added

- **`lc-next-step-card` `focusTitle()`** (monatsstand-2026-11-05 row 1, Finance Intelligence „Monatsstand“): after „Einfrieren“, „Freigeben“ or „Verwerfen“ replaced the card's state, call `afterNextRender(() => this.card().focusTitle(), { injector })`: the title gets `tabindex="-1"` (never in the Tab order) and focus, so focus doesn't fall back to `body` (WCAG 2.4.3), and the screen reader reads the new title. Keyboard focus shows a 2 px ring (4.37:1 light, 9.13:1 dark), nothing moves. Without the call nothing changes; your wrapper `div tabindex="-1"` can go. Story *Focus After Action*.
- **`lc-header` `contextPlacement`** (app-shell-2026-11-05 row 1): `contextPlacement="below"` keeps the context button visible up to 640 px as a full-width row under the title (at 360 px 352 × 49.6 px, label over name, „…“ with `title` for long names); title, `end` slot and account menu stay in row 1; from 641 px it is inline as before. CSS only, one button, prerendered. Default `'inline'`: unchanged. New type `HeaderContextPlacement`. Story *Context Below*; your `subtitle` + icon-button transition can go.
- **`lc-list` `aria-current`** (app-shell-2026-11-05 row 2): a `selected: true` row carries `aria-current="true"` on its row element (button, link or plain row), so screen readers announce the current choice; look unchanged, keep your „Gewählt“ badge. Story *Current Choice*.

### Fixed

- **Datepicker panel position** (047-n1, n2, n3): 4 px from the field above it too (was 0), 8 px from every viewport edge after a push (at 360 px x 10, right 352; was x 2), at most the viewport minus 16 px and scrolling inside at 200 % text. 1024/1280 unchanged. Story *Opens Above*.
- **Combobox and select dropdown width** (049-n2, 050-n4): at least as wide as the field (328 px at 360, 400 / 1248 px at 1280; were 85–200 px), wider content still grows it; combobox list 4 px above the field too (047-n1). Story *Opens Above* (Form/Combobox).
- **Live panel language** (049-n3): a host `lang` change while the datepicker or combobox panel is open shows at once.
- **Bottom toasts** (045-n2): the newest toast is nearest the edge (Warning, Error, Success now read Success, Error, Warning from the edge), so at 200 % text it and its close are in view; announcements unchanged. Story *Bottom Stack Order*.
- **Table checkbox** (F-30): on the row middle (±0.5 px; was 2.25–3 px above), rows unchanged.
- **Tag chips** (F-32): long tags wrap (with hyphens under your `lang`) instead of ending in „…“. A wrapped chip is a rounded rectangle (radius 12.8 px, half a one-line chip), so its text keeps 3.2 / 3.8 px from the curve as on one-line chips; one-line chips stay pills. Story *Long Tags (DE)*.
- **Textarea** (043-n7, 044-n1): error text `--color-error-600` in light (8.39:1, as the other fields; was `#6b0909`), focus is the 2 px ring of select and datepicker (4.37:1 light, 9.95:1 dark; the 20 % halo is gone).
- **Chat attachment sizes** (044-n2): in the host's language („240,0 KB“ under `lang="de"`), on one line.
- **Forced colours** (044-n3): the pressed notification-center filters and log-level pills are underlined in Highlight (the rich-text editor's mark), also while focused; they had the focus ring's outline.
- **Sidenav rail** (050-n5): a badged rail item no longer repeats its label as description („Agent Runs 3, link“); the tooltip stays.
- **Bottom nav** (050-n6): a three-character More badge („99+“) ends at the bar's last entry instead of 1.2 / 1.4 px past the docked / floating bar; badges that fit don't move.
- **`lcTooltip` on a host with several controls** (051-n1): the focused control is described; `aria-describedby` follows focus.
- Stories: *Label (DE)* German panel labels (048-n2), *Touch Targets (DE)* measured values (043-n8), *Wide page* table fits the region (045-n1).

### Changed

- **Toast outlet docs** (045-n4): a `top-*` stack lies over the page on purpose and can cover a title right under the header at 360 px; prefer `bottom-*` in the shell (known limit, documented).

### Compatibility

- No API breaks; `contextPlacement` and `focusTitle()` are optional. Visible changes: table checkboxes move ≤ 3 px down; long tag chips wrap into rounded rectangles; textarea error text and focus ring; chat size format follows `lang`; bottom toasts reorder; datepicker panel 8 px from the edges and 4 px above the field; combobox/select panels at least field-wide (a full-width select at 1280 opens 1248 px wide); badged rail items lose `title`; forced-colours pressed pills underline. DOM additions: one empty `aria-hidden` span in the datepicker wrapper, a `style` (private width) on open combobox/select panels, `data-tooltip` on collapsed rail items.
```
