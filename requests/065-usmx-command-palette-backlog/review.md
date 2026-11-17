# Review 065: USM X fourth batch (command palette, menu, popover, timeline, avatar, search, sortable head) and the whole backlog

## Round 1 — 2026-11-18, commit 0916a31 (code c978e81)

Shots: new stories `065/build-new2` (current build) + my measure runs `tmp/story-shots/065/r1-*`, logs `tmp/065/r1-*.log` (names below = log names); prototypes `r1-d1b`, `r1-d1e`, `r1-hint2`. Compare: the developer's `build-c1…c4` stand except files changed after them (popover, hero): re-compared in `065/r1-c` (22 stories, 132 shots: 120 identical, 12 = *Badges in the Body*, *Light Slim*, expected). Table *Full Featured*/*With Filtering*/*With Pagination* 1024/1280 differ from the baseline and from the developer's run (`r1-tab`): random content, not a change. Shots opened: 11.

**Decisions asked for:** D1 (a) option 1, with spaces → M1; D1 (b) neither option: the listbox itself scrolls, which axe exempts as a combobox popup → M2. D2 agreed (3.44 uses CanvasText). D3 agreed. D7 agreed: 62 % meets §1's own criterion, my 60 % came from one story's grid. design.md updated (change note 2026-11-18).

| AC | Result | Evidence |
|---|---|---|
| 1–3 | pass | `r1-new` *Column Choice*: 8 `menuitemcheckbox` + 3 `menuitemradio` with `aria-checked`, group „Zeilenhöhe“; rows 44 (long label 64), no overflow, 360–1280; FC check/dot = CanvasText (`r1-fc`); menu stories identical |
| 4–5 | pass | name + description EN/DE via `aria-describedby`; search stories identical |
| 6–7 | pass | th 46 high, pad 12/32/12/16 (end 12/16/12/32), 14/600 .56px caps, sorted rgb(17,24,39) on rgb(243,244,246), rest rgb(75,85,99): equal to lc-table's th; name „Service aufsteigend sortiert“, `aria-sort`, tabindex 0, ring 2px −2; table stories identical but *Action Sizes* and the 3 random ones |
| 8, 13 | pass | build.md (manifest, entries, compat probe-345) |
| 9–11 | **fail** | axe on *Default*/*Async*/*German* (M1, M2); pinning acts on an element that never scrolls (M2); heading cut after End → Home (S1). Keys, roles, `aria-busy`, status („8 results“, „Searching…“, „No results for “xyz”“), `aria-expanded` false with no options: pass |
| 12 | **fail** | geometry pass: 360 x 0 w 360 top 0 (r 0 0 24 24); 1024 x 192 w 640 top 90; 1280 x 320 w 640. Contrast: text on fill 16.12, hint 6.87 L / 8.18 D, ring 3.97 L / 8.16 D, `<mark>` 16.25 / 10.22, error 12.59; FC ring Highlight, mark Mark. DE placeholder clipped (M3), hints truncated (S2) |
| 14–16, 18 | pass | unit; *Triggers*: kinds with click/longpress `aria-haspopup="dialog"` + `aria-expanded`, focus-only none |
| 17 | **fail** | placement pass: 4/4 panels in [8, vw − 8] at 360/1024/1280 L/D, arrow centre = trigger centre ± 0.3; panel text right-aligned under `align="end"` (M4) |
| 19–21 | pass | one tab stop, `aria-current`, untitled item without title element, names = title/`ariaLabel`; selected title 15.25 L / 13.20 D, secondary 5.02 / 5.58, bar 3 px 3.76 / 7.60, FC bar Highlight; box ≥ 44 (last li 47 + 8); tone markers: S3 |
| 22–23 | pass | 7 pairs ≥ 4.62 (min, white on secondary-fill) both themes; unit |
| 24 | pass | not checkable (no WebKit), 054-n2 stays in the backlog (owner 2026-11-17) |
| 25, 37 | pass | theme-contrast spec; line-chart diffs = §9 |
| 26–33 | pass | compare diffs = §9 (*Action Sizes*, *Badges*, *Light Slim*, *Screenshot Row* 360, *Laptop Hooks*); hero 62 % identical at 100 % (`r1-c`); English hero titles now hyphenate at 360 (accepted, design §4) |
| 34–36, 41–43 | pass | unit specs; textarea, select *Search (DE)* 360, list diffs = §9 |
| 38 | pass | middle slot 101.4 × 44 after the brand, 4 account entries 44 high (N1) |
| 39, 45, 47 | pass | fold button in `h2`, `aria-expanded`, folded `ul` hidden, 44 high, chevron −90°, heading 5.58; rail dot 8 px beside the bell (`c4` 1280) |
| 40, 44, 46 | pass | *Vertical* 360: list above the panel, full width; tabs diffs = §9 |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| M1 | must-fix | palette options (D1 a), *Default*/*Async*/*German* | name = all visible parts in DOM order: `aria-labelledby` = `-label -desc -hint -kbd` (existing ids), no `aria-describedby` on item options, `&ngsp;` after the label, after `.lc-command-palette__text` and after the hint. Retry option unchanged. Proven in `r1-d1b`: 0 `label-content-name-mismatch`, heights Δ 0 | 18 shots fail the rule: name = label only, and the DOM text is glued („DashboardOverview“); option 1 without the spaces still fails 6 options (`r1-d1`) |
| M2 | must-fix | palette scroller (D1 b, AC-10) | the `role="listbox"` scrolls (design §3: modal body `overflow: hidden; padding: 0`, both bodies flex columns `min-height: 0`, listbox `flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain; padding: 8px 12px`); offsets and `scrollTop` compensation use the listbox. Proven in `r1-d1e` with M1: 0 violations on 4 stories at 360/1024, panel heights, option x/y and the 27 px scroll unchanged | `.lc-modal__body` scrolls (`scrollable-region-focusable`), while pinning writes `scrollTop` on `.lc-command-palette__body`, which never scrolls: a group inserted above the scrolled active option moved it +8 px and left it 8 px below the visible edge (bottom 609 vs 601, `r1-pin`) |
| M3 | must-fix | palette *German* 360 | DE `placeholder` „Suchen …“ (63 px) fits the 123 px text box | „Suchen oder springen …“ needs 156.8 px, clipped („Suchen oder sprin“); field 185.4 px beside „Abbrechen“ 142.6 (design said ≥ 200) |
| M4 | must-fix | `lc-popover` `align` (AC-17), *Placement* „Ende“ | `.popover__panel { text-align: start }`; all 4 panels start-aligned | the static `align="end"` attribute is a presentational hint in Chrome: host `text-align: end` (removing the attribute → start, `r1-pal3`); panel lines end at 331, start at 136/109; `align="center"` would centre the content |
| S1 | should-fix | palette keyboard scroll (AC-11), *Default* 1024/1280 | first option of a group → its heading in view (first group: scrollTop 0); last option → scroll to the end (trailing loading/empty rows) | after ↑ (wrap) then Home the „PAGES“ heading sits −11 px under the header, half cut (`r1-pal` 1280 L) |
| S2 | should-fix | palette hints, 360 | hint `flex-shrink: 0; max-width: 33%`; disabled reason `white-space: normal; text-align: end` (`r1-hint2`: short hints whole, reason 2 lines → row 48, long label 2 lines, long hint ellipsis at 103 px) | „Master data“ 55 px, „3 days ago“, „Stammdaten“ 50.7 px truncated with room left; reason „Nur für Administratoren“ cut (its `title` is out of reach on touch) |
| S3 | should-fix | timeline tone markers, light (pre-existing, WCAG 1.4.11) | `success` → `var(--color-text-success)`, `warning` → `var(--color-text-warning)`: 5.30 / 6.03 on the page, 4.55 / 5.18 on the selected fill (dark 8.40 / 7.65, 6.33 / 5.76); listed in *Changed* | ring and icon on `-default`: success 2.72, warning 2.26 on the page; 2.34 / 1.94 on the new selected fill (`r1-tl`, `r1-tl2`) |
| N1 | nit | header *Middle Slot And Menu Entries* (DE) | `homeAriaLabel="Zur Startseite"` | brand link named „Go to home“ |
| N2 | nit | build.md D4 | „62 % cap“ | „60 % cap“ (the AC table already says 62 %) |

**Verdict:** changes requested (M1–M4; S1–S3 are cheap and in the same files, so do them in this round).

## Round 2 — 2026-11-18, code 7b58aaf (HEAD d310237, `git diff --quiet 7b58aaf -- libs tools` holds)

Storybook rebuilt with `--skip-nx-cache` (the library build's `build:tokens` had touched `src/styles/tokens/*`; no code change). Code diff r1 → r2: palette, popover (1 rule), timeline (tone map), header story only, so the r1 rows of all other ACs stand. Shots `065/r2-pal` (5 palette stories × 3 widths × L/D, `--axe`), `065/r2-tlp` (9 timeline stories + popover *Placement*, 360/1280 L/D, `--axe`); measures `r2-pin360` (h 560), `r2-pin1024`, `r2-pin400` (h 400), `r2-tlh`, `r2-tlh2`; prototype `r2-tlproto`; logs `tmp/065/r2-*.log`. Shots opened: 8.

| AC | Result | Evidence |
|---|---|---|
| 9–11 | pass | M1: axe 0 violations on 30/30 palette shots; every item option's name = its spaced DOM text („Cost centres Manage cost centres and their allocation keys Master data“), no `aria-describedby` on items, Retry keeps its message as description. M2: listbox `overflow-y: auto`, `overscroll-behavior: contain`, pad 8/12; modal body `hidden`, pad 0. Pin (group of 2 inserted above): „Switch theme“ top 427 → 427 (1024), 325.5 → 325.5 (360, h 560); scrollTop 27 → 149, 60 → 182 (under reduced motion) |
| 11 (S1) | pass | ↑ wrap → scrollTop = max (27 / 60 / 220), last option 8 px above the edge; Home → 0, heading at +8; ↓/↑ through all options at 1024 and at 360 × 400 (max 220): every option inside the listbox, each group's first option with its heading in view (+14 … +340) |
| 12 (M3, S2) | pass | DE placeholder 63.3 px in a 123 px text box (360), EN 125.3 in 158; hints whole: Master data 67.4, 3 days ago 61.7, Stammdaten 71.6; long hint 103 px with ellipsis (≤ 33 %); reason „Nur für Administratoren“ 2 lines → row 48; page overflow 0 at all widths |
| 17 (M4) | pass | *Placement* 360/1280 L/D: 4/4 panels `text-align: start`, every line starts 13 px from the panel edge; panels inside [8, vw − 8] |
| 19–21 (S3) | pass | markers light: success 5.30, warning 6.03, primary 4.37, neutral 5.84, error 8.39; success on the selected fill 4.55; dark 8.40 / 7.65 (9.16 / 8.34 on the selectable page), selected 7.00 |
| 19–21 (box) | **fail** | M5 |

**r2 additions:** (a) heading `transition-property: none`: accepted (scoped to one element; the pin holds under the emulated reduced motion). (b) *No Results* spacing: accepted, shots byte-identical to r1 (`r2-pal` vs `build-new2`, 360 L, 1280 D). (c) new query → list at its top: accepted, it is §4's "first enabled option on each query change" (measured: scrollTop 149 → 0, first option active). design.md change note r2.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| M5 | must-fix | `lc-timeline` selectable (AC-19–21, design §3 r2), *Selectable Horizontal* | `ol.timeline--selectable { padding: 4px 8px }`, horizontal `padding: 4px`: every item box inside the `ol` (margins ≥ 0, horizontal at scroll 0 and at the end), 3 px bar and 2 px ring visible on all sides; heights +8 (Selectable 350 → 358 at 360, Horizontal 106.5 → 114.5 at 1280, 174.5 at 360). Proven in `r2-tlproto` (all margins 0) | the horizontal `ol` scrolls (`overflow-x: auto`) and clips the box's 4 px outset: bar 0 of 3 px visible, ring top/bottom 0 px (first item's left too), so the selected state shows only a 1.16:1 fill in light (WCAG 1.4.11). Vertical: box 8 px outside the `ol` (design wireframe said „ol pad 4/8“, missing in §3: my error) |
| S4 | should-fix | `lc-timeline` *Horizontal* (not selectable) 360 L/D, pre-existing (3.44 has the same `overflow-x: auto`) | a horizontal timeline that overflows can be scrolled by keyboard (axe `scrollable-region-focusable` 0) | 4 × 128 px items in 328 px: 184 px hidden, no focusable element; axe `scrollable-region-focusable` (WCAG 2.1.1). Needs a design decision (focusable named scroller only when it overflows, or a stacked layout): not in this round, release queue |

**Verdict:** changes requested (M5 only; S4 stays open for the release queue).

## Round 3 — 2026-11-18, code 9adb211 (HEAD 95b74cf, `git diff --quiet 9adb211 -- libs tools` holds)

Code diff r2 → r3: `timeline.component.scss` (+8, the two §3 r2 paddings) and 3 CSS pins; nothing else, so all other r2 rows stand. Developer's build reused (not stale). Shots `065/r3-new` (developer, 12, axe 0) + my measures `065/r3-key`, `r3-key2`, `r3-box`, `r3-last`, `r3-hc`, prototype `r3-proto`; logs `tmp/065/r3-*.log`. Shots opened: 3 (*Selectable Horizontal* 360 L, 1280 L; *Selectable* 360 D).

| AC | Result | Evidence |
|---|---|---|
| 19–21 (M5, at rest) | pass | `ol` padding 4px 8px / horizontal 4px; at scroll 0 and at the end every box margin ≥ 0 (top 0, bottom 0–0.5, first left 0, last right 0), bar 3 of 3 px; heights 358 / 317.5, compact 226, horizontal 174.5 (360) / 114.5 (1280) = r2's +8. Boxes: 57.5–119 high (vertical), 53–76.5 (compact; last item's 12 px below = base compact padding, box 4 px past its content), 174.5 (horizontal); hit area = box. axe 0 on 12 shots |
| 21 (focus in the horizontal scroller) | **fail** | M6 |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| M6 | must-fix | `lc-timeline` selectable, *Selectable Horizontal* 360 (AC-20/21, design §6 r3) | the focused item scrolls fully into view: button `(focus)` → `closest('li')?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })` (jsdom guard as combobox/tag-input), `.timeline--selectable .timeline__item { scroll-margin: 0.25rem 0.5rem }`, horizontal `scroll-margin: 0.25rem` (= box outsets). Proven in `r3-proto`: → → item 3 scrollLeft 64, box right 0; Home 0 / box left 0; End 64; ← from the end 64 → 0; page `scrollY` 0 throughout; vertical *Selectable*: no scroll, margins as at rest | Chromium's `focus()` doesn't scroll a partly visible button: → to item 3 at scroll 0 leaves scrollLeft 0, its button 60 px and its box 64 px past the `ol` edge („Appro / reque / 14:3“ in the shot; ring without its end side). Only the item buttons are focusable, so a keyboard user can't bring those 60 px into view (the 2.1.1 intent of S4, now on the new variant), and the changelog's „focus ring stays whole … in a horizontal timeline that scrolls“ is false. My §6 said only „focus moves“ (design error, change note r3) |
| S4 | should-fix | timeline *Horizontal* (not selectable) | as r2 | open, release queue |
| N3 | nit | timeline horizontal, pre-existing | the title centred over its marker like the time (`.timeline--horizontal .timeline__header { justify-content: center }`) | `.timeline__header` is a start-aligned flex row: with a description wider than the title, the title sits left (*Horizontal* 1280 item 2: title centre 173.7 vs marker 192; *Selectable Horizontal* 1280: −25.5 / −33.4 px) → backlog |

**Verdict:** changes requested (M6 only; S4 to the release queue, N3 to the backlog).
