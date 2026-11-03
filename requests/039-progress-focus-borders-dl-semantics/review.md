# Review 039: Progress-bar dark fill, focus halos, dependency-viewer borders, description-list row semantics

## Round 1 — 2026-11-03, commit eaa8688 (libs/tools = 7daee89, the gate commit)

Screenshots: `tmp/story-shots/039/` — `r1-rest` (8 stories, 360 · 1280, L · D, `--full`, hash compare), `r1-dl`, `r1-dep`, `r1-log`, `r1-progress` (360 · 1024 · 1280, L · D, with measures), `r1-fc` (forced colours, 360), `r1-select`, `r1-hold` (360, focus held). Measures: `r1-{dl,dep,log,progress}-measure.js`. The developer's compare folders `build-{a,b,c}` were re-checked with `diff -rq` against `baseline`. The Storybook build was current, so it was not rebuilt. Opened 12 shots: node-statuses 360 L, 360 D and 1280 L; clickable-rows 360 L; -english 1280 D; colors 360 D; text-hierarchy 360 L; fc clickable-rows 360 L and fc node-statuses 360 D; select (hover) 360 L; NC unread (DE) 360 L; code-block 360 D.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | *Colors* primary fill L `rgb(32, 132, 151)` 3.96, D `rgb(132, 199, 212)` 9.04 on the canvas track (the surface-2 floor 6.69 is pinned in theme-contrast 039). *Circular* gives the same values. The other fills are unchanged: L 4.19 / 4.81 / 5.47 / 11.43 / 9.22, D 5.48 / 8.32 / 7.58 / 8.61 / 10.54. In `r1-rest`, only *Colors* dark differs (2 shots) |
| AC-2 | pass | `r1`: dl button 2 px, offset 2, 4.36 / 9.12 on the card, room 999. Dep toolbar 4.17 / 7.57, room 8. Log tool button (opacity 1) 4.36 / 9.12, terminal toolbar 4.02 / 9.28, room 6. Jump pill 158×30, 4.36 / 9.12 (terminal 3.75 / 8.67), room 16. Code copy offset −2, inside the header (shot). NC title ring on an unread DE row is unclipped (shot). Developer `focus.log` (17 stories, 360/1024, L/D): every §3 row is solid 2 px with `box-shadow: none` |
| AC-3 | pass | `r1-fc`: dl button and dep toolbar ring `rgba(5, 0, 73, 0.8)` L / `rgba(0, 230, 255, 0.8)` D. Developer `focus-fc.log`: all 18 rows per theme are Highlight, and the slider input has offset 8 |
| AC-4 | pass | `:focus-visible` is true after `focus()` on every row, and the rules use `:focus-visible` (text fields keep `:focus`, as designed). The dl button takes no pointer events: the hit test at each row centre lands on the row or the `dd`, never on the button. Limit: no real key presses here; the semantics spec covers Enter and Space emitting once |
| AC-5 | pass | A grep after the change finds only keep rows (password 58, textarea 39/78/93, number 28, combobox 36, date-range 30, search 25, tag-input 34, color-picker 69, kanban 96) and n/a rows (stepper 99, chat), as in design §9. The spec guard is in theme-contrast 039 |
| AC-6 | pass | *Node statuses*, *Horizontal* and *Vertical* at 360/1024/1280, L/D. Default and muted borders: 4.83 / 6.70 against the canvas, and against their own fill 4.62 and 4.39 L, 6.88 and 5.69 D. Active: 6.21 / 10.80 (5.77 / 11.16 against its fill). Status inks are ≥ 3.52 against their fill. Toggle ring: 4.83 / 6.70 (4.39 / 5.69 against its fill), glyph 6.86 / 9.48. No node falls outside the SVG |
| AC-7 | pass | `r1-dl`, 12 shots: 12 rows and 12 buttons; no `role` or `tabindex` on a row, `dt` or `dd`. axe roles: `dt:term`, `dd:definition`, `button:button`. CDN axe 4.14: `definition-list` passes on 4 nodes, `dlitem` 24, `button-name` 12, `nested-interactive` 12, `duplicate-id-aria` 24; `--axe` finds 0 violations. Names: "Bank Sparkasse KölnBonn" and "Bank Northwind Savings". 12 tab stops for 12 rows. Limit: no audible screen-reader run (accessibility tree via axe) |
| AC-8 | pass | Row min 44 px; the button equals the row's padding box (Δ ≤ 1 px, the hairline). Full suite 5173 passed (build.md). I read the edited assertions (dl spec l. 103–104, clickable spec l. 51–52 and 88–89); each one states the F-17 reason |
| AC-9 | pass | *Text Hierarchy* is German throughout ("Log leeren", "Zum Ende springen" 158×30 at 360). Toolbar and page overflow 0 in both variants. NC DE unread rows overflow 0, and the title ring is visible |
| AC-10 | pass (nit 4) | `r1-rest`: 30 identical, 2 differ (*Colors* dark). `diff -rq`: A 18 / B 96 / C 24 (log clock digits) = 114 / 282, as design §9. compat 22: 93 checks, including the dl one |
| AC-11 | pass | The diff adds no `transition` line and no input |
| AC-12 | pass (nit 3) | Changelog draft in build.md: Changed (dl), Fixed (F-14…F-16, D-4 buttons), Compatibility. The *Known* line is untouched |

**API check (design §2):** the `clickable` JSDoc matches §2 word for word. Ids are `lc-dl-<n>-t<i>` / `-v<i>`, and the button is `button.lc-dl__action[type=button][aria-labelledby]`, last in the `dd`. There are no input, output, hook or type changes. The `clickable` argType keeps `defaultValue: 'false'`. The new story has a docs description and the §8 id `data-display-dependency-viewer--node-statuses`.

**Design corrected (change notes in design.md):**
- §5: the light log-tint ring is 3.49, not 3.23. The tint rule beats `:hover`; I measured 3.49 L and 7.47 D.
- §4: dependency nodes keep their SVG paint in forced colours, measured.
- §4: the select's `mouseenter` sets the highlight, so the inset ring follows the pointer too (`r1-select`, shot). I accept this: there is only one highlight, and it marks the option Enter picks.
- §6: new follow-up F-20.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | nit | `description-list.stories.ts` l. 58 (`clickable` argType) and l. 268 (*Clickable rows* text) | "Each row holds a native button, named term + value, …" | "Each row holds a native button per row …" / "each row holds a native button per row" (repeats "row") |
| 2 | nit | `log-viewer.stories.ts` *Text Hierarchy* docs | "at least 3.49 / 7.47 on the line tints" (design §5, corrected) | "at least 3.23 / 7.47": still true, but it quotes my wrong lower bound |
| 3 | nit | Changelog draft (build.md), Compatibility | Consumer facts only. Add: "Safari with default settings skips native buttons on Tab (Option-Tab reaches them), as it does for every button; the old `tabindex="0"` row was in its plain Tab order." | "114 of 396 story shots differ …" is review data, not consumer information; the Safari Tab difference is missing |
| 4 | nit | AC-10, build.md Gates | compat green on Angular 21 and 22 with the new dl HTML check | Only `--only=22` ran. The release gates or the CI matrix cover the 21 leg |

Follow-ups stay open (design §6): F-18 (buttons with no focus style of their own under the global reset), F-19 (textarea outline hover beats focus), F-20 (`autoFit` at 360: 0.71 px strokes, ~5.6 px labels in the dependency viewer).

**Verdict:** approved
