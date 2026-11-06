# Review 052: lc-next-step-card focusTitle(), lc-header contextPlacement, lc-list aria-current, backlog sweep (20 rows)

## Round 1 — 2026-11-06, commit 8a8dbb0

Screenshots: `tmp/story-shots/052/r1*` (logs `r1-*.log`, measures `r1-*-measure.js`). Storybook build 11:16 (current; tree = gate commit `99a2eaf`). At rest: `r1` (A 460 + B 284 shots, 360/1280 L/D) and `r1c` (header 192 at 360/641/1024/1280) vs `baseline`: 71 + 1 differ, all explained (build.md *Compares*); extra diffs `themed-rail-badges` ×3 and `header--above-sidenav` 360 D were identical on re-shoot (`r1c`, `r1c2`), `toasts-in-the-shell` 1280 D = the developer's bytes (4 px Δ 1). New stories `r1-new` (360/1024/1280 L/D, `--axe` 0 violations); states `r1-state`; 200 % `r1-200`; FC `r1-fc`; `r1-wide`, `r1-640`, `r1-ring`, `r1-chip`.

| AC | Result | Evidence |
|---|---|---|
| 1–3 | pass | *Focus After Action*: focus `H2` „Monatsstand eingefroren“, `tabindex -1`, `:focus-visible`, ring 2 px offset 2; title rect 88/41 239×20 at rest and focused; page 360/1024/1280 no overflow. Ring on every tone (`r1-ring`): default 4.37 L / 9.13 D; soft L 3.85–4.01, D 7.27–8.76 (warning 8.31, info 8.48 composited). FC: Highlight |
| 4 | pass | JSDoc = §2; component-description bullet + story snippet (the manifest reads both from the stories file; not generated locally) |
| 5 | pass | input, `HeaderContextPlacement` (`export *`), JSDoc `@default 'inline'`, argType inline-radio + description + default |
| 6 | pass | 360: button 4–356 × 49.58 at y 56, label x 16 = title x 16, label over name (gap 1), trigger 296/4 48×48 in row 1, header 113.58 (sm) / 121.58 (md); long name ellipsis + `title`; name „Monatsstand wählen, Monatsstand September 2026 · Fassung 1“ (label in name) |
| 7 | pass | 640: row (4–636); 641/1024/1280: inline 216.14 × 49.58 (= §3); default headers 192/192 identical |
| 8 | pass | 200 %: button 8–352 × 99.19, name ellipsis, no overflow; FC ring Highlight L/D; prerender check in compat (build.md) |
| 9 | pass | `aria-current="true"` on row 1 of both lists only (DIV button row, A link row); axe 0 |
| 10 | pass | with-selection md: offsets −0.5 / +0.25 / 0 (360, 1280) |
| 11 | pass (see #1) | 3 / 2 / 1 lines, nothing cut, × area 5 px from the chip end, × centred (32.39 of 64.78) |
| 12 | pass | error ink `rgb(157, 14, 14)` 8.39 L, `rgb(247, 161, 161)` 9.48 D |
| 13 | pass | field 118.38 at 360, first chip 45.19 (2 lines), × area 5 px = description |
| 14 | pass | filled/outline/error/read-only: outline 2 px offset 0, no shadow; ring 4.37 L / 9.95 D, border on fill 4.37 / 9.13; no size change (read-only „moved“ = focus scroll 193 px); FC Highlight |
| 15 | pass | „1,2 MB“, „5,0 KB“, „240,0 KB“, chips 30 high, size 1 line (360) |
| 16 | pass | FC: NC „Alle (5)“ pressed + focused = underline 2 px Highlight + ring (L/D); log „3 Fehler“ the same (`tmp/052/m-fc3.log`) |
| 17 | pass | 1280/1440/1920: table 928 in a 928 region, no scroll, „Kontostand“ right = region right |
| 18 | pass | edge → Success, Error, Warning (360/1024/1280); 200 % + 420 px offset: stack scrolls (814/480), Success + close in view; DOM order and live levels unchanged |
| 19 | pass | gap 4 below and above: datepicker (*Opens Above*, *Default*), combobox (*Opens Above*, *Panel Language*) |
| 20 | pass | *Default* 360: x 10, right 352 (D-5 reading); *Day Panel* x 10 |
| 21 | pass | 200 % 360: x 16, right 344, scrollWidth = clientWidth, panel 626 tall fits |
| 22 | pass | *Label (DE)* all 3 panels `lang="de"`, „Juli 2026“, „Samstag, 1. August 2026“; no English string |
| 23 | pass | combobox 328 / 400, select 328 / 400 / 1248 = field (360/1280) |
| 24 | pass | `openPanelLang()` (one observer while open, disconnected on close); `content-lang.open-panel.spec.ts` |
| 25 | pass | class JSDoc, docs page, *Offsets* text |
| 26 | pass | collapsed badged items: name „One digit 3“, description "" (dom-accessibility-api), `data-tooltip` set |
| 27 | pass (see #3) | „99+“ right 351 = entry edge (docked), 350 (floating), bar 359; „2“ stays at pill centre + 6 |
| 28 | pass | `aria-describedby` on „Kursiv“ only after focus moved; tooltip `lang="de"` |
| 29–31 | pass | widths/themes above; gates build.md (`git diff --quiet 99a2eaf -- libs tools` holds) |

**Deviations (build.md):** 1 confirmed: at 100 % equal to 4/8/16 px; at 200 % gap 8 (= 3.32's rem gap) and margins 16 (AC-21 holds, no horizontal overflow). 2 confirmed: D-2's "declaration dropped keeps today's position" was wrong (with `direction: rtl` a dropped value is `normal` = the entry's end); design.md amended. 3 confirmed: header and bottom-nav stories already use `fullscreen` (6 and 4 stories). 4–6 accepted.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix | `tag-input.component.scss` `.lc-tag-input__tag`; *Long Tags (DE)*, *Touch Targets (DE)*, 360/1280 L/D | Design amended (D-8, change note): wrapped chips are rounded rectangles: `border-radius: var(--border-radius-full)` then `border-radius: calc(0.5lh + 3px)` (= half a one-line chip, 12.8 px at 100 %). Text line-box corners 3.2 / 3.8 px inside the outline, as on one-line chips; one-line chips unchanged (prototype `r1-chip`: Q3 12.8 → 12.8) | Pill radius 32.4 / 22.6 px on 3- / 2-line chips: first-line box corner 4.4 px, last-line 3.9 px outside the curved outline („L“ of „Leistungsverrech-“ touches the border); 2-line −0.4 / 0 |
| 2 | should-fix | toast-outlet, any stack with ≥ 2 toasts (*Bottom Stack Order*, *Toasts in the shell (large text)*); before 3.33 too | 8 px (`--spacing-2`) between toasts, also across the two live regions, none for an empty region | 0 px: y 690–748, 748–826, 826–884 at 360; cards and shadows touch (pre-existing, not WCAG) |
| 3 | nit | bottom-nav *More Badge, Three Characters* 360 | known limit of D-2: a 37.4 px badge can't fit the 34.2 px from pill centre to entry edge | „99+“ starts 3.2 px left of the pill centre (was +6): it covers 2 of the 3 dots of the More glyph; the label names the entry |
| 4 | nit | sidenav collapsed rail, non-badged items | name only once | label stays in the AX tree (`display: block`), so the name comes from content („No badge“) and the identical `title` may be read as description; check the CDP AX tree, and if so drop `title` on all rail items (`data-tooltip` already carries the tooltip) |
| 5 | nit | story texts | measured, visible values | *More Badge, Three Characters* names „3“, „12“ (the story shows „2“) and „3.6 px past the floating bar“ (design §3: 1.39 px; also in the changelog draft); *Focus After Action* snippet has no `@Component`, no `state`, an unused `Component` import |

**Verdict:** changes requested (#1). After the fix: re-shoot tag-input stories against `baseline` (only stories with a chip over 150 px may differ) and measure the clearance with `r1-chip-measure.js` minus its prototype line.

## Round 2 — 2026-11-06, commit 2e29f95

Gate tree `66e903d` (`git diff --quiet 66e903d -- libs tools` holds; r1 changed the tag-input SCSS + spec and two story texts only). Storybook build 11:50 (current). `tmp/story-shots/052/r2` (10 tag-input stories incl. chip *Tag Input*, 360/1280 L/D vs `baseline`, log `r2.log`, chip measure + computed radius): 28 identical, 8 different = *Keyboard Focus*, *Touch Targets (DE)* (the two with a chip over 150 px), 4 missing = *Long Tags (DE)* (new). `r2-m` (200 % text on the chips, bottom-nav badge geometry, log `r2-m.log`). Opened 4: *Long Tags (DE)* 360 L / 1280 L, *Touch Targets (DE)* 360 D, *Keyboard Focus* 360 L.

| AC / finding | Result | Evidence |
|---|---|---|
| #1 → AC-11, 13 | pass | computed radius 12.7969 px on every chip (1, 2, 3 lines) in all three stories, 360/1280 L/D (1024 L/D: developer's `r1fix-new`, same values); line-box clearance first / last 3.2 / 3.8 px on every chip (r1: −4.4 / −3.9 on 3 lines, −0.4 / 0 on 2); heights 64.78 / 45.19 / 25.59 and field unchanged; one-line chips unchanged (6 stories + chip *Tag Input* byte-identical to `baseline`). 200 %: radius 22.6, clearance 1.1 / 1.3 on every chip = the one-line pill's own, scrollWidth 360 = clientWidth. Shots: rounded rectangles, text and × inside the curve, × ring unchanged |
| #5 → AC-27 story text | pass | „1.2 / 1.4 px“ (= design §3); „3“ in *More Badge* at pill centre + 6.0, „2“ on Contracts + 6.0 on both bars; „99+“ right 351 / 350 = entry right (docked / floating). Changelog draft 1.2 / 1.4 |
| #5 → AC-4 snippet | pass | `@Component` with template, `frozen` signal, every import used; `titleTag` 'h2' ∈ `NextStepCardTitleTag`, `announce`, `tone`, `cardTitle`, `primaryLabel`, `primaryClick` exist |
| 1–31 otherwise | pass (r1) | tree unchanged apart from the above |

### Findings (round 2)

| # | Severity | Status / where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix | fixed | see above | — |
| 2 | should-fix | open → *Open items* (`queue`) | 8 px between toasts | 0 px (pre-existing) |
| 3 | nit | open, known limit of D-2 (`backlog`) | — | „99+“ −3.2 / −3.4 px from pill centre, covers 2 of 3 dots |
| 4 | nit | open (`backlog`) | name once | non-badged rail items: `title` = name |
| 5 | nit | fixed | — | — |
| 6 | nit (new) | tag-input *Keyboard Focus* (3.27 story), 360/1280 | German tag in a story with `lang="de"` (as *Touch Targets (DE)*, *Long Tags (DE)*), so the review surface shows the hyphenated wrap | no `lang`: „Kostenstellenverantwo / rtung“ breaks mid-word with no hyphen (the component does what D-8 documents; story only) |

Note for the release: the released 3.32.0 *Known limits* line still says „3.6 px past the floating bar“; leave history as is, the 3.33 *Fixed* entry gives the measured 1.2 / 1.4 px.

**Verdict:** approved. No must-fix; #2 (`queue`) and #3, #4, #6 (`backlog`) go to `release.md` → *Open items*.
