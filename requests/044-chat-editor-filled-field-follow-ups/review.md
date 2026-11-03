# Review 044: Chat remove target, editor mode state, filled-field boundary

## Round 1 — 2026-11-03, commit 59fb40c (libs/tools = eba7ac1)

Screenshots: developer `tmp/story-shots/044/new` (36), `fc-rte`, `fc-new`, `chat-tt`, `build`; mine `tmp/story-shots/044/r1-*` (logs beside them; measures `r1-chat-measure.js`, `r1-fields-measure.js`, the RTE one inline in `r1-rte.log`'s command). Storybook build 10:34 = current source. 9 shots opened: chat DE 360 L / 1280 L, chat EN 360 D, RTE pressed 360 L, RTE pressed forced colours 360 D, select filled 360 L, textarea filled 360 L / D, datepicker filled 360 D.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `r1-chat.log`, both stories, 360/1024/1280 L/D (12): every × 20 × 20; hit scan L/R/T/B 23/22/23/22 (first miss, 0.5 px steps) = 44 × 44. At 360 the stacked × of chips 1–2 meet at y 325 (scan 21.5 below × 1 = shared half pixel, within the ±0.5 snapping); 0 px² over any other chip; areas inside the composer, ≥ 5 px above the input; no overlap at 1024/1280 |
| AC-2 | pass | Chips 254.44×30 / 251.86×30 / 256×46 / 172.58×38, names 144/144/144/56.64 (scroll 270/245/265/57) in all 12 shots, EN = DE = design §9; rows y 288/332/376/436 (14 apart). No `min-inline-size` in the diff. Touch-targets compare vs `baseline-chat`: build.md (1280 identical, 360/1024 differ by the row gap) |
| AC-3 | pass | First × focused: `:focus-visible`, 2px solid offset 2, #208497 L / #84c7d4 D, ring box inside chip 1 (chip `overflow: visible`). `--forced-colors` (`r1-chat-fc.log`): ring = `Highlight` (rgba(5,0,73,.8) L / rgba(0,230,255,.8) D); `::before` transparent, no border, outline or shadow; scan unchanged |
| AC-4, AC-5 | pass | `rich-text-editor.pressed-mode.spec.ts` (13, build.md). Story `play` phase `finished` in 6/6; measured `aria-pressed` [T,F,F] [F,T,F] [F,F,T] = `.active`; `type="button"`; titles "Formatierter Text" / "Markdown" / "Geteilte Ansicht"; focus on "Geteilt" `:focus-visible` (`r1-rte.log`) |
| AC-6 | pass | `r1-rte-fc.log` (default, markdown, split, pressed; 360 L/D): only the pressed button is underlined, `Highlight` 2 px, offset 4 px; its fill is removed; the focus ring (`Highlight` 2 px, offset 2) on "Geteilt" is a separate shape (shot 360 D) |
| AC-7 | pass | Pressed fill pair rgb(26,106,121) / #fff 6.21:1 in L and D, buttons 76.66 / 75.86 / 54.34 × 44. All 11 RTE baseline stories (44 shots) hash-identical (AC-12 run) |
| AC-8 | pass | `r1-fields.log` + `r1-fields-select.log`, 3 stories × 360/1024/1280 L/D: rest `--color-field-border` #6b7280 / #93a4ad, vs fill 4.39 L / 7.02 D, vs canvas 4.83 / 7.31 in every size. Surface/surface-2 in the `theme-contrast.spec.ts` 044 block (build.md) |
| AC-9 | pass | Hover by cloned `:hover` rules: `--color-text-secondary` #4b5563 / #c4d2d9, vs hover fill 6.86 L / 11.05 D, vs canvas 7.55 / 12.16; hover ≥ rest in every field |
| AC-10 | pass | Error border #9d0e0e / #f7a1a1 at rest = hover (7.62 / 8.39 L, 9.09 / 9.47 D) in all three, datepicker included (D-4). Focus md: select and datepicker primary border + 2 px solid ring; textarea primary border + 20 % halo, as its outline variant (N1). Disabled 0.6 (select/datepicker `--color-border`, textarea field-border); read-only keeps the boundary, no hover change. Spec edits = design §9 (build.md) |
| AC-11 | pass | Select and datepicker xs–lg 24/32/40/44; textarea rows 2 64/80/96/112, all widths. The 1 px border existed before (transparent) |
| AC-12 | pass | `r1-a.log` + `r1-b.log` vs `baseline`: 240 identical, 12 different = `form-select--filled`, `form-textarea--filled-variant`, `form-datepicker--filled-variant` × 4, exactly as design §9 |
| AC-13 | pass | `r1-fields-fc.log`: border CanvasText (black L / white D) at rest and hover in every field; native disabled fields GrayText |
| AC-14 | pass | 6 stories, IDs as design §8, each with a `docs.description`; 36 shots in `new/` |
| AC-15 | pass | Diff: no `*.component.ts`, no hook or input; compat 22 PASS with the `aria-pressed` prerender check (build.md, not re-run) |
| AC-16 | pass | Gates on eba7ac1, `git diff --quiet eba7ac1 -- libs tools` holds; changelog draft names F-28/29/31, and its values match the measurements above |

**API check (design §2):** every file change matches the table (chat `gap: 0.875rem 0.375rem` + `::before` inset; RTE `[attr.aria-pressed]` ×3 + forced-colours underline; filled rest/hover/disabled/error rules). No new input, output, slot, hook or type. Story names and IDs as §8.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| N1 | nit (backlog) | `lc-textarea` focus, outline and filled, L/D | One focus pattern for every field: select and datepicker add a 2 px solid ring | Textarea focus = border hue change only (`--color-field-border` → `--color-primary-500`, 1.10:1 L / 1.36:1 D between the states) + the 20 % halo (1.28 / 1.50). With F-31 the filled textarea now equals the outline one (before: transparent → teal). Not an AA failure: the focused border is 3.96 L / 9.55 D against the fill (1.4.11), and state-change contrast is 2.4.13 (AAA) |
| N2 | nit (backlog) | chat pending chip, all widths | Size label localised and on one line | "240.0 KB" is not localised and wraps in the 256 px chip (pre-existing, design §7) |
| N3 | nit (backlog) | NC filters, log pills, forced colours | Pressed mark a different shape from the focus ring (as D-2 for the RTE) | 2 px `Highlight` outline, the same shape as the focus ring (design §9 follow-ups) |

**Verdict:** approved. No must-fix or should-fix; N1–N3 go to `requests/BACKLOG.md` through release.md.
