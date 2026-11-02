# Review 029: Status ink contrast follow-up of 027 and the money Number Column caveat

## Round 1 — 2026-11-02, commit 3ff8aaf

Screenshots: the developer's `tmp/story-shots/029/build` (540, `--full`, vs `baseline`); mine `r1` (the 21 review stories × 360/1024/1280 × L/D, `--full`, measure `r1`-logs `tmp/029/review-r1-{a,b,c}.log`, script `tmp/story-shots/029/review-measure.js`: computed colour per element, backdrop composited through every ancestor **including the vertical surface gradients**, probes: mermaid error `<p>`, card success/warning clones, a real upload row via `DataTransfer`, rating 3.5 via `detail: 1`, pressed error pill), `r1-streaming`, `r1-terminal-proto` (fix prototype). Storybook build 04:40 = tree of HEAD for `libs`. Shots opened: 6.

| AC | Result | Evidence (light / dark, min over 360/1024/1280) |
|---|---|---|
| AC-1 | pass | NC priority high (read row) 5.52 / **4.97** (1280 D, panel gradient; design min 4.60), urgent (unread) 10.97 / 6.14 |
| AC-2 | pass | card chips success 4.85 / 6.24, warning 5.52 / 5.55, error 10.97 / 8.37; light chip fills = the `-subtle` tokens (243,246,238 · 253,244,228 · 251,236,236) |
| AC-3 | pass | mermaid error 12.58 / 9.47 |
| AC-4 | pass | NC icons min 4.55 (success, unread) / 5.77 (error, unread); every fg = an ink; no hex (diff, spec l. 735) |
| AC-5 | pass | dots done / wait / blocked 5.29 / 6.02 / 12.58 L, 9.16 / 8.34 / 9.47 D |
| AC-6 | pass | pipeline warning glyph 6.02 / 7.65, border 6.02 / 8.34; error 12.58 / 8.68, 12.58 / 9.47; complete glyph 4.36 / **9.12** (D-4); current 4.36 / 9.12 |
| AC-7 | pass | × on hover (rule `var(--color-on-error-subtle)` on rgba(157,14,14,.18), real row) 8.59 / 7.21 |
| AC-8 | pass | full and half star 6.02 / 8.34 (half star rendered: 3.5/5) |
| AC-9 | **fail** | log variant: levels 10.15 / 5.50 / 10.07 L, 10.64 / 6.26 / 8.52 D; pills at rest 5.25 / 8.95 L, 5.55 / 8.37 D, opacity 1; pressed: `rgb(107,9,9) 0 0 0 1px inset`, `aria-pressed=true`, 15 px (shot: ring visible, other pill plain). Diff stat 5.06 / 6.97, `+` 3.52 / 6.96, `−` 6.33 / 9.01. Dependency edges 5.29 / 7.65, node border on fill 3.52 / 5.55, labels 5.29 / 7.65, arrows 5.29 / 7.65, legend 5.06 / 6.34. Kanban priority 5.29–12.58 / 7.65–10.64, limit 6.33 / 9.01. **Terminal variant levels, light: info 1.61, warn 2.40, error 1.13** (finding 1) |
| AC-10 | pass | linear success / warning / error / info 4.81 / 5.47 / 11.43 / 9.22 L, 8.32 / 7.58 / 8.61 / 10.54 D vs track; circular (modifier probe) identical; track unchanged |
| AC-11 | pass | `git diff main` on `_theme-*.scss`, `tokens.json`, `styles/tokens`, `lib/tokens`: empty |
| AC-12 | pass | sentence in `money.stories.ts`; number-column not among the 265 differing shots |
| AC-13 | pass | `tmp/029/forced.log`: pressed pill `solid 2px Highlight`, offset 1, rest none; progress fill Highlight; the diff adds no `forced-color-adjust` |
| AC-14 | pass | diff: no input, output, selector, hook or default; spec edits only `log-viewer.component.spec.ts` l. 490/492 (design §9) |
| AC-15 | pass | `diff -rq baseline build`: 265 files; the differing list equals the prototype's minus the 6 Streaming shots (list diff); Streaming at shot time: 0 lines, 0 pills (12 lines and one pill at opacity 1 after 4.5 s). Deviation accepted, design §9 count corrected to 265 / 275 |
| AC-16 | pending | draft misses the terminal levels and its override note (finding 1) |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix (design error, corrected in design.md §2/§5/§7/§9, change note) | `log-viewer.component.scss` l. 258–263; `data-display-logviewer--terminal` (and Streaming once lines arrive), all widths | Terminal levels in the terminal palette in both themes: replace the block by `.lc-log-viewer--terminal .lc-log-viewer__line--debug & { color: #9399b2; }`, `--info … #89b4fa`, `--warn … #f9e2af`, `--error … #f38ba8` (0,3,0). Prototype `r1-terminal-proto`: debug 5.81, info 7.78, warn 11.43, error 6.19 in L and D. Add the §9 r1 spec checks. Changelog Fixed, appended to the `lc-log-viewer` line: "In the terminal variant the level colours now use the terminal's own palette in both themes (the rule never matched, so they followed the page theme): light info 2.65 → 7.78, warn 6.43 → 11.43, error 1.70 → 6.19, debug 2.81 → 5.81; dark 10.10 → 7.78, 10.11 → 11.43, 7.21 → 6.19, 6.36 → 5.81." Compatibility, after "your overrides still win": "Exception: in the terminal variant, a level-colour override needs `.lc-log-viewer--terminal .lc-log-viewer__line--<level> .lc-log-viewer__level` (0,3,0)." | The block compiles to `.lc-log-viewer__line--warn .lc-log-viewer--terminal .lc-log-viewer__level` and never matched, so the terminal levels take the log rule's ink: on the always-dark terminal in **light** info 1.61, warn **2.40** (3.21.0: 6.43), error 1.13; dark 10.10 / 6.43 / 7.21. The developer's measure skipped `--terminal` levels; the shot differs anyway (timestamps) |
| 2 | nit | `build.md` AC-1–10 evidence, `tmp/029/measure/ink.mjs` | Values as in the table above | NC high in dark quoted 5.55 (backdrop ignores the panel gradient; 4.97 at 1280); kanban with-wip-overflow priority 17.73 / 15.85 (read text-primary, not the icon); rating half star never rendered (`click()` has `detail: 0`, so 4 full stars). No code impact; quote this table in r2 |

**Round 2 scope:** only `log-viewer.component.scss`, `theme-contrast.spec.ts` and the draft change. Re-shoot the 7 log-viewer stories (42, `--full`) with a level measure: terminal `[5.81, 7.78, 11.43, 6.19]` L and D; log variant unchanged (values above); pills as above. The other 83 stories need no re-shoot while `git diff 3ff8aaf -- libs` lists only those two files.

**Verdict:** changes requested

## Round 2 — 2026-11-02, commit ef908a9 (libs/tools tree = 0c1e511)

Scope held: `git diff --stat 3ff8aaf ef908a9 -- libs tools` lists only `log-viewer.component.scss` (+6/−6) and `theme-contrast.spec.ts` (+33), so AC-1–8 and AC-10–13 keep their r1 evidence. Screenshots: the developer's `r2` (7 log-viewer stories × 3 widths × L/D, `--full`, `tmp/029/r2-shots.log`); mine `r2-review` (terminal + default, 360/1280, L/D, at rest; measure reads every level, text, timestamp, source and line number with the product of all ancestor opacities, plus the log-viewer rules from `document.styleSheets`). Storybook build 05:23 = r2 tree. Shots opened: 2 (terminal 360 L, 1280 L).

| AC | Result | Evidence |
|---|---|---|
| AC-9 | pass | Terminal levels debug / info / warn / error **5.81 / 7.78 / 11.43 / 6.19** in L and D at 360 and 1280 (mine), equal in all 4 terminal stories × 3 widths (developer; streaming info 7.78 after 1.5 s); fg `147,153,178` · `137,180,250` · `249,226,175` · `243,139,168` on `30,30,46` / warn line `41,40,52` / error line `47,39,56`. Stylesheet: the 4 rules `.lc-log-viewer--terminal .lc-log-viewer__line--<lv> .lc-log-viewer__level` with these colours, 0 rules of the dead shape. Log variant unchanged: 10.15 / 5.50 / 10.07 L, 10.64 / 6.26 / 8.52 D. Pills at rest 5.25 / 8.95 L, 5.55 / 8.37 D, terminal 9.56 / 6.07, opacity 1; pressed ring in the ink (L, D, terminal), `aria-pressed=true`. Shots: INFO blue, WARN yellow, ERROR pink on the dark terminal in the light page |
| AC-14 | pass | 2 new tests in the 029 block of `theme-contrast.spec.ts`, as design §9 r1 (exact rule bodies, no dead shape, floored ratios on the terminal and its warn/error tints, ≥ 4.5); no existing assertion changed in r2; Jest 4847 passed (`tmp/029/r2-test.log`), contrast spec 333 |
| AC-15 | pass | r2 changes colour only on terminal level spans; the 42 log-viewer shots differ by timestamp (expected, design §9); the other 83 stories' CSS is unchanged since r1 (265 / 275 there) |
| AC-16 | pass | Draft has the terminal sentence (light 2.65 → 7.78, 6.43 → 11.43, 1.70 → 6.19, 2.81 → 5.81; dark 10.10 → 7.78 …) and the Compatibility exception for the (0,3,0) override; see finding 3 |
| AC-1–8, 10–13 | pass | r1 evidence; no code change in those components |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | resolved | `log-viewer.component.scss` l. 258–263 | r1 finding 1 | as expected, measured above |
| 2 | resolved | `build.md` AC-1–10 | r1 finding 2 | quotes the review r1 values |
| 3 | should-fix (release-manager, changelog) | `CHANGELOG.md` 3.21.1 Known | One line: "`lc-log-viewer`: debug lines (60 % opacity), timestamps and sources (50 %) and line numbers (30 %) are dimmed with `opacity`, so their effective contrast stays below 4.5:1. The debug ratios above are the level colour before the line's opacity; effective: log 2.53 L / 3.25 D, terminal 2.97 (was 1.82 L / 3.18 D). Follow-up." | The draft quotes debug 5.81 with no hint that the line renders at 60 %; a consumer reads it as AA |

**Debug-line opacity (build.md observation) → follow-up F-7, not a fix in 029.** Measured (mine, all widths equal): debug level eff 2.53 L / 3.25 D, terminal 2.97; debug message 4.66 L / 6.41 D / 4.95 T (passes); debug timestamp and source 1.94 L / 2.58 D / 2.24 T; timestamps and sources on every line 3.21 L / 4.43 D / 3.64 T; terminal line numbers 2.20 (1.59 on debug lines). Reasons: the spec scopes the status-ink swap and excludes other changes (spec Scope); the dims are neutral text and pre-date 3.21.0; replacing `opacity` with text tokens changes the log viewer's hierarchy for every line and needs its own design and shots. 029's colour pick moved terminal debug from 1.82 → 2.97 (L) and 3.18 → 2.97 (D): fail to fail, the light gain outweighs the 0.21 dark loss. F-7 is added to design.md §9.

**Verdict:** approved. Open: finding 3 (should-fix, changelog), follow-ups F-1–F-7 (design §9).
