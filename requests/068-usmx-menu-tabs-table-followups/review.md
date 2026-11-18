# Review 068: USM X menu, tabs, palette and form gaps, lc-table hidden actions head, 067 follow-ups

## Round 1 — 2026-11-18, commit d548ed4

Screenshots and logs: `tmp/story-shots/068/r1*` (measures `r1-tabs.js`, `r1-menu.js`, `r1-misc.js`; 360 · 1280, light · dark, 320 for the datepicker, 360 × 640 for the menus, `--forced-colors` in `r1-fc`). Storybook build 22:24 is current (no source newer).

**Unchanged stories.** The developer's `build-cmp` ran menu, table and split-button on a build older than their story edits (22:18), so I re-compared those 44 stories (`r1-cmp`, 176 shots): 170 identical, 6 differ = the known random table *Full Featured* / *With Filtering* / *With Pagination* 1280. With `build-cmp` + `build-cmp2` every other difference is the expected set of design §9 (11 sidenav stories + *Deep Tree*, dl *Item Icons*).

| AC | Result | Evidence |
|---|---|---|
| 1, 2 | pass | `aria-activedescendant` → „Offene Tickets Stammdaten 56/60“; option names end with the badge; badge end gap 12, width = scrollWidth, 20 high; hint ellipsises first (13 px clipped at 360); badge ink composited 6.87/8.49/5.52 L, 8.83/7.64/5.55 D; overflow 0 |
| 3, 4, 7 | pass | tablist „Facetten“; reason tab `aria-disabled`, tabindex −1, not native, arrow-reached, tooltip + describedby on focus, selection stays; muted 5.84 L / 7.31 D, weight 400; hint 12/400, 8 px to the badge; name „Ticket 12 Status 3 Treffer“; list 800/328 scrolls, ring inset (−2), inside the list |
| 5 | pass | spec (Router spy); links story named „Bereiche“, roving focus |
| 6 | pass | defaults gap 16 / padding 16; *Flush Panel* 0 / 0, card 0 px under the list |
| 8 | **fail** (F-2, F-3) | overlay in `.cdk-overlay-container`, 8 px under „⋯“ (360 × 640: 35,143–255,354); point (340, 600) → 120,389–340,600, margin 0; 1280 (1270, 880) → 1044,669–1264,880; Escape → focus on „⋯“; rail scroll closes. Scroll-close with focus in the panel → `<body>`; panel `lang="en"` |
| 9 | pass | 360 × 640: panel 358.4, list 1144/340; 25 × ArrowDown → „Löschen“ fully visible (389–433 in 93–433.4), ring inset; 1280 × 900: 420 |
| 10 | pass | busy row 44 high, `aria-busy`, status „Wird geladen …“; after 2.2 s items, no busy, focus „Mir zuweisen“ |
| 11–14 | pass | reason item `aria-disabled`, children .5, item 1, ring full, tooltip on focus; first Escape closes only the tooltip; emphasis 700; „Neu > In Arbeit > HR > Erledigt > Abgebrochen“; `aria-label` set |
| 15 | pass | radios/checkboxes 44; swatch 20 × 20, indicator 12 swatch 12 label; rim 4.83 L / 6.71 D; halves gradient; FC rim CanvasText, colours kept |
| 16 | **fail** (F-1) | name „Aktionen“ hidden, `th` 420 at 1280; at 360 the page scrolls sideways: scrollWidth 725 (ovf 365) L and D |
| 17 | pass | busy `aria-busy`, `cursor: progress`, ring 12 × 12, 12 from the end, 3/4 arc, 4.18 L / 7.58 D, FC full CanvasText ring; hooks: block 8, border none |
| 18 | pass | field 36 (45–81) = button 36 (45–81), padding 5/12, lh 24 |
| 19–21 | pass | specs; split face + caret `btn-tone-primary`, `accesskey="o"`, `Alt+O`, menu `--sm`; popover: no haspopup/expanded/controls, describedby = card, panel `role="tooltip"` |
| 22, 23 | pass | radius 25 % at 24–64 px, images inherit; group pairs 7.31 / 6.24 / 8.73 |
| 24 | pass | datetime 360: 192 + 8 + 128 one row, 320: wraps (4 px, D-6), group „Termin“, parts „Termin Datum/Uhrzeit“, value `2026-11-18T14:30`; list 272 = 6 × 44 + 8, scrolls itself, selected 6.21, 47 out-of-range options `aria-disabled`; string models `"2026-11-18"`, `"09:30"` |
| 25 | pass | on: ink 7.85 L / 10.57 D, border 6.21 / 11.78, inset 1 px; off unchanged (compare); FC Highlight/HighlightText |
| 26, 28–30 | pass | `@media (hover: none)` rule compiled, all levels; axe 0 in all 36 sidenav stories 1280 L/D (72 shots); no raw colours in story styles; *Deep Tree* 360 status line above the frame; `aria-haspopup="menu"` `aria-expanded="false"` |
| 27, 32 | pass | „2.960,00“ kept while typing, model 2960, blur „2960“; „1.234“ → 1234; „7.5“ → „7,5“; FC focus outline 2 px Highlight |
| 31, 33, 34 | pass | docs text; dl clickable total `::before` −1/1 px, `::after` −3/3 px, margin 0/3 (sep), shot height unchanged; spec runs (build.md) |
| 35 | **fail** (F-1) | overflow 0 in every new story except *Hidden Actions Head* 360 |
| 36–41 | pass | contrast above; FC checks; DE texts; argTypes (lc-tab and sortable-head inputs in the parent descriptions, as before); compat PASS (build.md) |
| 42 | pass | not run, row stays (owner rule) |

### Deviations D-1…D-8

All confirmed. D-1, D-3, D-5, D-6 are written into design.md (change note r1); D-2, D-4, D-7, D-8 need no design change. D-5 measured: a focused reason tab's label reads 2.54 L / 4.46 D (1.53 / 2.00 at rest), still clearly dimmer than a tab (7.56 / 12.17).

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F-1 | must-fix | `table.component.scss` `.lc-table__sr-only`; *Hidden Actions Head* 360 L/D | No page overflow (AC-16, AC-35): `document.scrollWidth` 360 | 725: the absolute span's containing block is `<body>` (offsetParent BODY at x 724.5), so it escapes `.lc-table-wrapper--responsive`'s `overflow-x: auto`; with the span hidden 360. Make the actions `th` its containing block while the label is hidden (`position: relative` on a modifier class), add a spec assertion and re-measure 360 L/D. My design error (design.md change note r1) |
| F-2 | should-fix | `menu.component.ts` `returnFocus()` | Focus returns to the anchor element given at open (§3A, amended r1), also when the app clears `anchor` in `(closed)` | `anchor()` is already `null` when `restoreFocus()` runs after a scroll, outside-click or item close, so the focus goes to `openedFrom`: opened without focus on „⋯“ (as a Safari pointer click) → scroll-close → `<body>`. Keep the element anchor of the current open, use it there; add a spec |
| F-3 | should-fix | *Anchored Overlay* story | Panel `lang="de"` (pitfall 048 r1) | `<lc-menu>` sits outside the `lang="de"` wrapper: the overlay panel gets `lang="en"` for German items. Move it inside |
| N-1 | nit | `sortable-head.component.scss` `.lc-sortable-head__busy` | Logical sides (`inset-inline-end`) like the 32 px reserve (`padding-inline-end`) | `right: var(--spacing-3)` + `border-right-color`: in RTL the ring sits away from the reserve |
| N-2 | nit | dl *Item Icons* 1280, „rows · md · clickable“ | Straight 1 px separators on clickable non-total rows (as 066-n1 now for totals) | `border-bottom` with radius 10 still bends at the row ends (as before 3.48) |
| N-3 | nit | changelog draft | Muted tab 5.84:1 (design §5, measured) | „5.83:1“ |

Owner decision 2026-11-18: nothing goes back to the inbox, so F-2 and F-3 are fixed in round 2 with F-1; N-1…N-3 go to the backlog.

**Verdict:** changes requested

## Round 2 — 2026-11-18, gate commit d492453 (= HEAD 7312780 for `libs tools`)

Storybook build 22:53 is current. Runs: `r2-rev` (at rest, `--compare=build-new2`, measure `r2-rest.js`), `r2-state` (table label toggle), `r2-state2` (menu focus sequence `r2-state2.js`, 360 L/D), `r2-line` (pixel samples). No shot opened: one difference, located by pixels.

| AC | Result | Evidence |
|---|---|---|
| 16, 35 (F-1) | pass | 360 L/D: `documentElement`/`body` scrollWidth 360/360; span `absolute`, offsetParent TH, x 724.5 inside the wrapper (328/725, `overflow-x: auto`); `th` `--label-hidden`, `position: relative`. `showActionsLabel` true → modifier gone, `static`, no span, „Aktionen“ visible; false → back. 1280: 1280, `th` 420 |
| 8 (F-2) | pass | Opened from `<body>` (no focus on „⋯“), app clears `anchor` in `closed`: scroll → „Aktionen für Rechnungen 2026“; outside click with focus in the panel → same; item close → same; Escape → same. Focus on row „Archiv“, opened at „⋯“, scroll → „⋯“ (anchor before opened-from). Point open from row „Archiv“ → scroll → row „Archiv“ (no stale anchor). Shift+F10 at row „Verträge“ → outside click → row. `aria-expanded` false after each close |
| 8 (F-3) | pass | Panel `closest([lang])` „de“, host „de“, 360/1280 L/D; panel rect unchanged |
| 8 (Tab) | **fail** (F-4) | see below |
| others | pass (r1) | 7/8 shots byte-identical to the developer's r1; tree unchanged since r1 except F-1…F-3 |

**The one diff:** *Hidden Actions Head* 1280 dark vs r1: 420 px on y 97, x 844–1263 (= the actions `th`), max Δ 14. The r1 build composited the upper half of the 2 px translucent head line (`rgba(132,199,212,.28)`) over the head fill there (55,86,100). Now it reads 48,75,86 like every other column, so the line is uniform. Light is identical because its border is opaque. Not a regression.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F-4 | must-fix | `menu.component.ts` `onPanelKeydown` `'Tab'`, overlay mode | Tab from the panel continues after the anchor: next tabbable = row „Verträge“; Shift+Tab before it (design §3A, amended r2; WCAG F85 / 2.4.3) | Tab is not prevented (`defaultPrevented` false), and the panel is the last node of `<body>` (no tabbable after it), so the browser's Tab leaves the document. Storybook is zoneless (`typeof Zone` undefined), so the close effect runs after that default action; `focusInPanel()` is then false, and the measured end state is `<body>`. **Fix:** when `anchor()` is set, call `returnFocus()` synchronously before `close()`, without `preventDefault`; in-place mode stays unchanged. Spec: anchor is `activeElement` right after dispatching Tab, `defaultPrevented` false, in-place Tab unchanged. Story description: „Tab moves on from the „⋯“ button“. My design gap (change note r2) |
| N-1…N-3 | nit | r1 | unchanged | backlog |

Limit: real key presses aren't available in story-shots, so the Tab step is emulated. The sequence is keydown → default focus step → zoneless CD (a macrotask).

**Verdict:** changes requested (F-4 only).

## Round 3 — 2026-11-18, F-4 only, gate commit 6d25ea4 (= HEAD 650467a for `libs tools`)

Storybook build current (story-shots accepted it). Runs: `r3-rev` (at rest, `--compare=r2`, `--axe`), `r3-rev-tab` (the developer's `/zz-068/r3-tab.mjs` awaited, plus case E inline), 360/1280 L/D. No shot opened: nothing differs.

| AC | Result | Evidence |
|---|---|---|
| 8 (Tab, F-4) | pass | Zoneless (`typeof Zone` undefined). A: Tab from „Öffnen“ → after the keydown „Aktionen für Rechnungen 2026“, `defaultPrevented` false, step and end row „Verträge“, menu closed. B (opened from `<body>`): Shift+Tab → „⋯“ after the keydown, ends on row „Rechnungen 2026“. C (Shift+F10 at row „Archiv“): row after the keydown → „Aktionen für Archiv“. D (point anchor from the focused row): same as C. `scrollWidth` 360/1280. Same at all 4 shots, equal to `build.md` → Gates „Round 3“ |
| 8 (at rest) | pass | 4/4 identical to `r2`, axe 0 violations (incomplete only `bypass`, `color-contrast`, `label-content-name-mismatch`, as r2) |
| API | pass | `onPanelKeydown` `'Tab'`: `if (this.anchor()) this.returnFocus()` before `close()`, no `preventDefault`; in-place path untouched. JSDoc of `anchor` (l. 243–246) and `onPanelKeydown` (l. 550–551) name the Tab step; story description: „Tab closes it too and moves on from the „⋯“ button (or the row); Shift+Tab goes before it.“ Spec: 4 cases (element anchor Tab/Shift+Tab, point anchor, in-place unchanged) as F-4 asked |
| others | pass (r1, r2) | `git diff 6d25ea4 -- libs tools` empty; r3 changes only `menu.component.ts`, its spec and the story text |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| N-4 | nit | `lc-menu` `anchor` JSDoc, point anchor | A focus target after Tab or Escape also when the menu was opened at a point with nothing focused, or a JSDoc line that the context-menu target must take focus (`tabindex`; Shift+F10 needs that anyway) | Case E (blur, `contextmenu` on row „Archiv“ without focusing it): focus enters „Öffnen“, Tab → no return target, the step leaves the document, end `<body>`. Not a WCAG failure here: F85 needs a trigger in the focus order, and in the story a real right-click focuses the row (`tabindex="0"`), which is case D |
| N-1…N-3 | nit | r1 | N-3 fixed (draft reads 5.84) | N-1, N-2 backlog |

**Verdict:** approved. Open for the release: N-1, N-2, N-4 (nits, backlog).
