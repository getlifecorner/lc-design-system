# Review 059: lc-device-frame and lc-picture, lc-select clearable, lc-description-list total whitespace, lc-list item ariaLabel

## Round 1 — 2026-11-11, commit 211477e (gate tree 16f91b6)

Screenshots: `tmp/story-shots/059/` — `r1-frame` (7 stories), `r1-rest` (8 stories), both at 360 · 1024 · 1280 and light · dark with `--axe` (wcag2a/aa, 21a/aa, 22aa); `r1-list`, `r1-focus`; measures in `r1-measures.js` (developer module `/zz-059/m.mjs` + rim contrast, notch gap, axe rule runs). The Storybook build (00:29:39) is newer than every source file.

**Unchanged stories:** the developer's `build-{a,b,c,d}` against `baseline` with `diff -rq`: 286/292 identical. The 6 that differ are all expected: hero *Fill* 360 L/D (the AC-18 change), table *With Pagination* 1280 L/D (random salaries, a known flake) and select *Focus After Tap* 360/1280 L (on the unstable list in design §9). Since then only the device-frame and picture stories have changed.

| AC | Result | Evidence |
|---|---|---|
| AC-1, 3, 7 | pass | Unit tests (build.md). Manifest: `device`/`size`/`notch` with JSDoc and defaults. Notch 63.97 × 8 at 92.02/8, **8 px above the screen** (`notch` gap), `aria-hidden`; axe 0 violations on 42 frame shots except F-1 |
| AC-2, 6 | pass | Rim vs canvas, computed in the browser: **4.83 L / 7.31 D** (Default, Notch, Sizes, Screenshot Row); Custom Bezel ancestor hooks 7.56 L / 12.17 D. Forced colours (`forced`, current build): rim CanvasText, bezel Canvas, shadow none |
| AC-4 | pass | md 248 × 518.66, screen 232 × 502.66 r24; img ratio 0.46155 vs 6/13 = 0.46154 (< 0.01 px); sm 200 × 419.33 / 188 × 407.33 r18; lg 320 × 670 / 300 × 650 r32 |
| AC-5 | pass | No page hscroll in any shot. *Sizes* lg fits at 360 (320 ≤ 328). *Screenshot Row*: x 16/280/544/808 at 360, x 16/252/488/724 at 220 × 474 at 1024/1280, every frame bottom at 657 / 551 (one baseline). 2 × 248 side by side from 1024 (*Card and Frame*, x 16 / 280) |
| AC-8, 9b | pass | `tmp/059/compat-22.log` (113 checks). Angular 21 runs in the release gates or in CI |
| AC-9a, 10 | pass | Unit tests (19). *Sources*: „AVIF · 560w“ chosen at 2x, 248 × 537.33 |
| AC-9b | pass | *Theme Variants*: L „hell · source“ (`--light` block, `--dark` none), D „dunkel · source“ (reversed), at all 3 widths. With data URIs the hidden img loads anyway, so lazy-by-theme can't be shown in the story (measured in design D-3) |
| AC-11, 13 | pass | *Load Error* 248 × 537.33, the same as loaded; the 120-character alt wraps inside the box (shot 360 L); the 4-line caption in *Screenshot Row* is 84 px at 360 |
| AC-12 | pass | *In a Card* and *Card and Frame*: img radius 23px with the hook, 0px without it (Default, Sources) |
| AC-14, 16 | pass | Names exactly as in §9: `A` „Zu Lücken, 3 offen“, „Zu Zuordnungen, keine“; `DIV` „Zu Prüfregeln, 2 offen“; `BUTTON` „SAP-Ist, Heute, 06:00, Geladen“ (without „Laden“); the plain row has no `aria-label`. Rows 48–78 px |
| AC-15 | pass | `tmp/059/old-new.txt`: href, role=button and plain rows byte-identical to 3.38 |
| AC-17 | pass | `description-list.single-space.spec` (exact strings, build.md gates) |
| AC-18 | pass | *Narrow Column* / hero *Fill* 360: every value on its own line, right edge = row (0), rows 59 / last 58, „Rechenzen-trum“ 80 (2 lines); EN card the same; hero *Fill* 1024/1280 beside, and 1280 identical to the baseline |
| AC-19, 20 | pass | Exactly as §3: lg 21–203 (truncated) → 21–231, text end 219.22, whole; sm 13–129 → 13–155, end 133.16; xs/sm/md box end 257, 4 px before the × (261); tab stops 2 → 1 |

**Deviation 1 (list word breaks): accepted.** The design was wrong: in the real row DOM the parts are adjacent text nodes, so the §6 probe didn't apply (now corrected in design.md §6 with a change note). Measured on *Jump Marks*, 360/1280 L/D, with axe 4.14 `label-content-name-mismatch` run alone: **3 passes, 0 violations**. After trimming the 8 spaced spans (the negative control): 0 passes, 3 violations. The shots taken after the trim are **byte-identical** to the developer's untrimmed at-rest shots (4/4 `cmp`), so the spaces render nothing. This is the only form that keeps AC-15 (`&ngsp;` or an `@if` would add nodes to the default rows). The leading space in `textContent` of named rows is new behaviour only and is in the changelog draft. **Deviations 2–4: accepted** (design.md change notes 2, 3, 5).

**API vs §2:** names, types, defaults and JSDoc `@default` match for the frame, the picture, `clearable` and `ariaLabel`. Types are exported from both entries, `src/index.ts` and both READMEs list the components, and every argType has a `description` and a `table.defaultValue`. The hooks are only read (picture), the frame hooks feed `@property` lengths, and a bare `0` works (*Custom Bezel*: screen 246 × 533 at 1/1).

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F-1 | must-fix | Device Frame *Card and Frame*, 360 L/D (story template l. 248, description l. 241) | axe 0 violations. At 360 the wrapper wraps (`flex-wrap: wrap`, no `overflow-x`): the frame sits below the card, and the two sit side by side once the container is 512 px wide (a 544 px viewport). Update the description | axe `scrollable-region-focusable` (WCAG 2.1.1, level A) on `div[lang="de"]`: 2 × 248 + 16 scrolls inside the 328 px canvas with no focusable child; the frame at x 280–528 is cut off at 344 |
| F-2 | should-fix | Device Frame *Screenshot Row*, 360 L/D (`ROW_STYLE`) | The region ring shows on all four sides. Below 1024 px, `.shots__row:focus-visible { outline-offset: -2px }` (the ring inside the region; the figures start at x 16). From 1024 px it stays at +2 | Region at x 0, w 360 (the bleed); the 2 px ring at offset +2 falls at x −4…−2 and 362…364, so only the top and bottom lines show (`r1-focus` 360 L). life-os copies this pattern |
| F-3 | nit | Device Frame *Default*, *Sizes*, *Notch*, *Custom Bezel*; Picture *Default*, *Sources*, *Theme Variants* | Content with a German `alt` sits in a `lang="de"` wrapper, as *Screenshot Row*, *Any Media*, *In a Card* and *Load Error* already do (WCAG 3.1.2 for the docs) | No `lang`: the German alt is read in the page's language |

**Verdict:** changes requested (F-1). F-2 and F-3 are story-only and cost almost nothing, so do them in the same round. Round 2 re-shoots *Card and Frame* and *Screenshot Row* (with the focus measure and `--axe`) and compares the F-3 stories against `r1-frame` / `r1-rest` by hash (lang alone should leave them identical).

## Round 2 — 2026-11-11, commit 4704c86 (gate tree 48decdc, `git diff --quiet 48decdc -- libs tools` holds)

Since r1 only `device-frame.stories.ts` and `picture.stories.ts` changed (`git diff --stat 16f91b6 48decdc -- libs tools`), so the r1 results for all other stories and the API stand. Shots: `r2-review` (*Card and Frame*, *Screenshot Row* at 360 · 543 · 544 · 1024 · 1280, L · D, `--axe`, region focused; measure MA in `r2-measures.js`), `r2-review-f3` / `r2-review-f3p` (F-3 stories, 3 widths, L · D, measure MB). The 12 shots that the developer also took are byte-identical to `r2-fix`. Opened: *Screenshot Row* 360 L and 544 L, *Card and Frame* 360 L and 1280 D.

| AC | Result | Evidence (r2) |
|---|---|---|
| AC-1, 3, 7 | pass | axe 4.14 (full tags): **0 violations in 20 shots** (r1: F-1). `incomplete` only `color-contrast` over the stand-in images and `bypass` |
| AC-5 | pass | *Card and Frame*: wrapper `flex-wrap: wrap`, `overflow-x: visible`, scrollWidth = clientWidth (328 / 511 / 512 / 992 / 1248); 360 and 543: card 16/16, frame 16/596 (below); 544 and up: x 16 / 280 (side by side), so the description's 512 px container / 544 px page is exact. No page hscroll in any shot |
| AC-12 | pass | radius 23px on both card imgs (light and dark picture), 0px on the frame's |
| AC-9b | pass | Pictures in *Card and Frame*: all 4 imgs `complete`, the theme's one shown (shot 1280 D „dunkel“) |

**Findings r1:** F-1 **fixed** (above). F-2 **fixed**: at 360 / 543 / 544 the ring is inset (offset −2): left 0–2, right W−2…W, top and bottom in view, figures from x 16, page scrollWidth = viewport; from 1024 offset +2 (ring 12–948 × 73–700), 12 px below the h2, 2 px below the lowest caption. Ring vs canvas **4.37 L / 9.95 D**, vs bezel **4.06 L / 9.38 D** (WCAG formula, in the browser). F-3 **fixed**: every img of the 7 stories sits in a `DIV lang="de"` (measure MB), and all 42 shots are **hash-identical** to r1 (frame 24/24 vs `r1-frame`, picture 18/18 vs `r1-rest`).

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F-4 | nit (backlog) | Device Frame *Screenshot Row* below 1024 px (`ROW_STYLE`, l. 192) | The inset ring clears the media frames: `.shots__row { padding: 4px 16px 8px }` below 1024 px (frame tops 2.34 px below the ring's inner edge); from 1024 px unchanged | The row has no top padding: the tall frames start 0.34 px below the region top, so the ring (122–124 at 360) covers their 1 px top rim and 0.66 px of bezel (**1.66 px**) along the straight top edge (x 312–360 at 360, 312–496 at 544), only while the region has keyboard focus. Not a WCAG failure: the ring keeps ≥ 3:1 on both sides (values above), notch (+8) and media (+24) stay uncovered, frame 1 is 142 px lower. A design gap of r1's F-2 value, noted in design.md change note 7 |

**Verdict:** approved. No must-fix or should-fix open; F-4 goes to `requests/BACKLOG.md` (life-os copies this pattern, so the row should name the 4 px top padding).
