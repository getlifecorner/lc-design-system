# Review 063: lazy tree rows, chart gaps and dashes, USM X form, alert, menu, icon and theme-scope gaps

## Round 1 — 2026-11-17, commit 2e72d9b (code = 4e9a365)

Screenshots: `tmp/story-shots/063/r1-new` (14 stories × 360 · 1024 · 1280, light · dark, `--axe`; measure `r1-measure.js`, logs `r1-new-a/-b.log`). Forced colours `r1-fc`; prototypes `r1-proto`, `r1-num`; baseline re-compare of menu + textarea (story files changed after the developer's compare) `r1-cmp`: 76/88 identical, the 12 diffs are the three textarea stories of build.md (−8 px).

| AC | Result | Evidence |
|---|---|---|
| 1–5 | pass | unit specs; *Tree Lazy Rows (DE)* sm: lazy row 37.5 before and after opening (siblings 37), 4 → 7 rows, child level 2, +20 px; hit 32.5 × 36.5 (sm) / 44.5 (md), end 0, also rotated; table baselines identical |
| 6 | pass | 360/1024/1280 L/D, axe 0, `scrollWidth` = width; EN „IT operations“ wraps at 360 (67.5, same before and after opening) |
| 7–11 | pass | unit specs; EN: `M` per segment 1/2/1, lone May dot; summary EN and DE strings as §6/§7; line-chart baselines identical |
| 12 | pass | dash `6px, 4px` butt, solid round; contrast on the canvas: Plan 3.11 / Ist + Prognose 4.36 (L), 10.66 / 9.95 (D); dashed swatch is a gradient; FC: swatches keep colour, dash kept |
| 13 | pass, F1 | heights 36/43/50/57, `min-height 0px`, capped 146 + `overflow-y: auto`; but the host keeps a 6 px line gap below the field |
| 14–15 | pass | unit spec; diffs only *Sizes*, *Filled States*, *No Script Contact Form*, input *Required Asterisk*: hosts −8, fields unchanged (`tmp/063/ta.log`) |
| 16–17 | pass | role `alertdialog`, labelled by the title, described by the message, no `aria-live`, focused on show; ring 2 px primary-500: 4.36 on the page / 3.92 on the tint (L), 9.95 / 8.00 (D); FC ring Highlight |
| 18–20 | pass | *Custom Colors (DE)*: violet icon 7.30 on its tint, text 14.60 (L) · 5.01 / 13.28 (D); yellow icon 3.87 on its tint, border 4.75 on the page, text 14.46 (L) · 8.13 / 12.53 (D); FC border 1 px solid CanvasText |
| 21–22 | pass, F3 | unit spec; models `"1.50"`, `"12345678901234567890"`; DE „1,50“ → `"1.50"` |
| 23 | pass, F3 | invalid and disabled render, axe 0; „1250,00“ is clipped (71 in 64 px) |
| 24–26 | pass | heading 30 px, label x +16 when indented, items 44 (wrapped 64), groups named; heading 7.55 / 7.23 (L), 9.25 / 11.15 (D); axe 0 (the `aria-controls` + `aria-haspopup` incomplete is pre-existing: *With Dividers* too) |
| 27 | pass | box and svg 18 × 18, attr `20px`; wrapper with the hook → 20 |
| 28–29 | pass | panel `#ffffff → #f9fafb`, `color-scheme: light`, items 17.73 / 16.97 in both page themes; trigger dark 15.85; `:root` diff only the yellow line (`tmp/063/root-diff.txt`) |
| 30–31 | pass | 84 shots, `scrollWidth` = width everywhere, axe 0 violations |
| 32 | pass | JSDoc `@default` on `hasChildrenKey`, `role`, `valueType`, `rows`/`minRows`, `indentChildren`; argTypes with description and default; changelog names usm-x and kosten-2026-11-17, "No API breaks"; compat 22 by the developer, 21 left to the release run |
| 33 | pass | probe-343, 3 `EXPECT_IN_HTML` rows |

**API (§2):** names, types, defaults and exports match. Accepted: Deviation 3 (hooks as `var(--lc-alert-*, <3.42 value>)` in the variant rules: the kit never declares them, so an ancestor value wins as designed).

### Deviations (build.md)

| # | Ruling |
|---|---|
| 1 | Neither (a) nor (b). (a) moves every textarea host by −6 px and breaks AC-15 (heights with footer content pinned); (b) leaves the story claim „both aligned at the end“ false and makes each consumer hack a 6 px offset. **(c)** `display: block` on `.lc-textarea--one-line` only: one-line mode is new, so no baseline changes. Prototype (`r1-proto.log`): hosts 65/72/79/86/175, chat field bottom 95 = button bottom 95, after 3 lines 143 = 143 → F1 |
| 2 | Accepted: rest heights keep 3.42 values (*Auto-Resize*, *Feedback Form* identical) |
| 3 | Accepted (above) |
| 4 | Accepted: 16 % is the documented recipe; design §5 corrected (7.26 over surface, 8.13 over bg) |
| 5 | Accepted: without `maxWidth` the panel stays at its 220 px min-width (pre-existing rule); §4 allows wrapping |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F1 | must-fix | `textarea.component.scss` `.lc-textarea--one-line`; *One Line Chat (DE)*, *One Line* | `display: block` in one-line mode: host bottom = field bottom; chat button bottom = field bottom (Δ 0) at one line and after growing; hosts 65/72/79/86 (capped 175). Pin it in `textarea.one-line.spec`; changelog *Added* line says the host ends at the field | field bottom 95, button bottom 101 (Δ 6); hosts 71/78/85/92/181 |
| F2 | must-fix | *One Line Chat (DE)* story (design error, §3/§8 fixed) | send button `size="lg"`: 45.6 × 45.6 (≥ 44) | `md` icon-only 36 × 36 |
| F3 | must-fix | `number-input.component.scss` value box; *String Mode*, *String Mode (DE)* | public hook `--lc-number-input-value-width` (default xs 3rem / sm 3.5rem / md 4rem / lg 4.5rem, JSDoc + argTypes/docs, *Added* line); stories: case number `calc(20ch + 0.5rem)` (box 210, control 292, page 360), DE fields `calc(7ch + 0.5rem)`; every value `scrollWidth` ≤ `clientWidth`; number-input baselines identical | 4 rem box for every size: id `scrollWidth` 203 in 64 (two thirds hidden), „1250,00“ 71 in 64 (`r1-num.log`) |
| F4 | nit (backlog) | *Gaps And Forecast*, both stories | series told apart by more than hue | Plan (secondary-500) vs Ist (primary-500) differ 1.40:1 (L) and 1.07:1 (D) in luminance; the legend links them by colour only (the default chart palette, pre-existing). Candidates: a non-colour cue for a second solid series, or a story palette with a lightness step |
| F5 | nit (backlog) | `lc-textarea` multi-line modes | host ends at the field, as lc-input | 6 px line gap below every multi-line field (pre-existing; fixing it moves every host −6 px, so it needs its own request) |

**Verdict:** changes requested (F1–F3). Round 2 re-shoots *One Line*, *One Line Chat (DE)*, *String Mode*, *String Mode (DE)* (360/1280 L/D, measures above) and compares the textarea and number-input baselines.
