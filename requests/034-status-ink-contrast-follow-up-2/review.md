# Review 034: Status ink contrast follow-up 2 (F-1 to F-7 of 029)

## Round 1 — 2026-11-02, commit 69ed3f8 (libs/tools equal to 36f8c94)

Screenshots: `tmp/story-shots/034/` — `r1/` (5 new stories, 360 · 1024 · 1280, L · D, 30/30 identical to the developer's `new/`), `r1-old/` (8 changed existing stories `--full` vs `build/`), `r1-state/` (log search open, query "e"), `r1-fc/` (forced colours). Measures: `r1-measure.js`, `r1-state-measure.js`; logs `r1*.log`. Contrast is the WCAG formula on computed colours, composited over the real backdrop (gradients interpolated at the element's y), floored.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | *Priority On Unread Rows* 360/1024/1280: unread high 5.55 D / 5.52 L on every row (the opaque base makes the panel gradient irrelevant), urgent 8.37 / 10.97, low + category 5.99 / 5.30. Read rows on the gradient: high 5.21–5.30 D (*With Priority*: 4.97) ≥ 4.60; light unchanged |
| AC-2 | pass | no change in `_theme-light/-dark.scss` or `tokens.json`; spec "AC-2: the shared status values keep their 3.22.3 hex" |
| AC-3 | pass | *All Colors* + *Dashboard*, arc vs track L 3.96 / 4.19 / 4.81 / 5.47 / 11.43 / 9.22 (primary … info), D 9.04 / 11.29 / 8.32 / 7.58 / 8.61 / 10.54 on the canvas; vs page ≥ 4.36 L; centre text 17.73 / 17.28 |
| AC-4 | pass | *Inline*, *Side By Side*: numbers L 6.91 added / 6.58 removed / 7.55 context, D 9.24 / 11.57 / 12.16; `+` 4.85 L / 6.96 D, `−` 10.97 / 9.01; content ≥ 15.46 / 13.14. Chat *With Diff Viewer*: `+` 4.85 / 6.24 |
| AC-5 | pass | *Primary Badge States*: text 8.48 L on all three (selected too), 6.34–7.63 D; border vs card 3.75 (selected) – 4.36 L, 7.60–9.12 D; vs chip fill 4.05 L / 6.34 D. *Section Cards* same |
| AC-6 | pass | hit area 40 tall (toolbar inner y17–57) × (w + 4) at 360/1024/1280, EN (*App Registers No Icons*) and DE; pill edges ± 1.5 hit a pill, below the toolbar hits the content; line count 4 px after the last pill, hits itself; tool buttons hit themselves; toolbar scrollWidth = clientWidth (326 / 990 / 1246) |
| AC-7 | pass | spec "AC-7: no opacity dims log text"; computed opacity 1 on every text element up to the viewer, both variants and themes |
| AC-8 | pass | log L: meta 5.60, debug message 6.92, debug level and debug meta 5.34, count 5.83, placeholder 5.83 (opacity 1); D 8.29 / 10.18 / 6.12 / 6.70 / 6.70. Terminal: meta 5.85, debug message 6.70, debug level and meta 5.28, count and placeholder 6.21. Level colours unchanged; on their tinted lines under hover warn 10.38, error 5.62, info 7.08 |
| AC-9 | pass | *All Relation Types* + *Complex Relationships*: labels `uses` 5.83 L / 6.70 D, `extends` 9.13 / 9.12; cross-ref lines (0.8) 3.75 / 4.76 and 5.32 / 6.29; arrow markers equal the labels; legend 5.58 / 5.56, 8.74 / 7.57; edges dashed `6px, 3px`, legend `4px, 2px` |
| AC-10 | pass | CSS plus 2 marker `fill` values, no new focusable element. `--forced-colors`: unread chips CanvasText on Canvas, gradient `none`; pressed pill 2 px solid Highlight outline; log meta CanvasText, opacity 1 |
| AC-11 | pass | DE at 360: pills wrap to 2 lines (26 tall), as EN *App Registers No Icons* (26), no overflow; NC "DRINGEND" / "HOCH" chips on one line, nothing clipped (shots `r1/…--360-*`) |
| AC-12 | pending | the local Node 23.10 blocks the prerender (build.md); the release gates and CI (Node 24) run it. The change is CSS plus 2 marker attribute values |
| AC-13 | pass | `git diff main`: no component spec, input, output, slot or locale key touched |
| AC-14 | pass | 029 "F-1 (known)" → "F-1 (fixed in 3.22.4)" with a reason comment, `[5.52, 5.55]`, ≥ 4.5 |
| AC-15 | pass | build.md draft: F-1 … F-7 with old → new values, "No API breaks", F-8 … F-12 under Known |

**Unchanged stories.** `diff -rq baseline build`: exactly the design §9 set, 96 differ / 258 identical / 6 unstable (chat clock). Re-shot of 8 changed stories against `build/`: 41 identical, 6 chat (clock), 1 *With Priority* 360 light, the light two-state raster flake known since 025 (it also differs from the baseline; colours measured equal: 5.52 / 10.97 / 5.30).

**API (§2).** Selectors and values as designed; no token, input or hook added; the terminal rules are flat; JSDoc and argTypes untouched. Story IDs as in §8, each with a `docs.description.story`.

**Shots opened (11).** NC 360 D, log 360 L / D and 1280 L, ring 360 L / D, card 360 L and 1280 D, dependency 360 L and 1280 D, diff *Inline* 360 L. Nothing clipped or overlapping; hierarchy reads in three steps; the light diff tints are pale but `+` / `−` and the numbers carry the line kind.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | nit | log search match on debug lines (state shot `r1-state`) | 4.5:1 (F-10 scope) | log dark 3.25 at rest / 3.04 under hover (main with 0.6 opacity: 3.14), terminal 3.29 (main 3.30); light improved 3.78 → 5.03. Not a regression; F-10 should name debug-line and terminal matches too (terminal non-debug 4.52) |
| 2 | nit | *Priority On Unread Rows*, all widths | one language in a DE story | `clearAllLabel`, `searchPlaceholder`, `filter{All,Error,Warning,Info}Label` stay English ("Clear all", "Search notifications…"); design §7 did not list them (design gap). The low unread row sits below the fold at 360 (measured, not visible). Fix when the story is next touched |
| 3 | nit | ring *All Colors*, dark | variants tell apart | secondary `#c3d5db` and info `#b8cee0` are 1.07:1 apart (secondary-600 is lighter in dark). The value text carries the number; accept, or revisit with F-11 |
| 4 | nit (out of scope) | log `.ansi-gray` | 4.5:1 | latte `#9ca0b0` on white 2.60, Mocha `#6c7086` 3.35 on the terminal (pre-existing; debug lines no longer dim ANSI spans, so they read better than before). Candidate F-13 |

**Verdict:** approved. No must-fix; nits 1–4 go to the release notes as known follow-ups (1 extends F-10, 4 is a new F-13).
