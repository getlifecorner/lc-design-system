# Review 031: lc-stat-trend label and value without a separator

## Round 1 — 2026-11-02, commit df5d8c3

Screenshots: `tmp/story-shots/031/` (widths 360 · 1024 · 1280, light · dark). Storybook build of the branch (not stale); `git diff --quiet 0cf895e df5d8c3 -- libs tools` holds, so the developer's gates stand. Runs: `r1` (11 existing stories, 66 shots vs `baseline`), `r1-new` (new story, 6 shots, `--axe`, at rest, vs the developer's `new/`), `r1-long` (costs with the long German label vs `baseline-long`), `r1-probe` (axe 4.14.0 rule probe and negative control, 360 light; `r1-cc.log` colour contrast). Measure: `review-measure.js`. Shots opened: new story at 360 light, 360 dark and 1280 light.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | Unit S1 (`stat-trend.component.spec.ts`, `separators (031)`). Browser tile 2: `header.nextSibling` = Text `" "`; normalised text "Gesamtkosten Plan 2026 571.000,00 €" |
| AC-2 | pass | Unit S2/S3 and sentiment. Browser tile 3: value `nextSibling` = `" "`; text "… 1.234.567,89 € ↑ +3,1 %, gestiegen, ungünstig"; costs text "… ungünstig Sparkline: 10 points, …" (S3) |
| AC-3 | pass | Browser, axe 4.14.0, rule run by id: 3/3 cards `pass`, 0 violations, 0 incomplete. Negative control (4 separators removed): 2 violations, text "Gesamtkosten Plan 2026571.000,00 €"; restored → 3 pass. The rule is in tag `wcag21a` and not experimental, so `--axe` covers it: 6/6 shots 0 violations. Jest: `stat-trend.axe.spec.ts` (5 rows + control) |
| AC-4 | pass | `r1` vs `baseline`: 66 identical, 0 different (the developer's `build/` also `diff -rq`-identical) |
| AC-5 | pass (with limit) | Unit "adds text nodes only". Browser: `innerText` tile 2 "GESAMTKOSTEN PLAN 2026\n571.000,00 €" (= probe B1); each card `role="button"`, `tabIndex` 0, accessible name = `ariaLabel`. Limit: no audible VoiceOver/NVDA run in this environment; the separators create no element and no box, so no extra AX node or pause is expected |
| AC-6 | pass | `EXPECT_IN_HTML` entry in `tools/compat/check-angular-majors.mjs` (design §9 regex, `#compat-costs`); compat gate PASS on Angular 22.2.4 (build.md) |
| AC-7 | pass | `r1-long` vs `baseline-long`: 3 identical; label 294 × 36 (360) and 426.34 × 18 (1024/1280), header 36/18, row 31.38, root 294 × 103.38 / 426.34 × 85.38, card 328 × 142.38 / 460.34 × 124.38, card and page overflow 0 = design §3. New story tile 3: label 36 px (2 lines) at 360, 1024 and 1280; every card and the page overflow 0 at all widths |
| AC-8 | pass | `stat-trend.component.spec.ts` +84/−0, `stat-trend.sentiment.spec.ts` untouched; 36 stat-trend tests green (build.md) |
| AC-9 | pass | `baseline-fc` vs `build-fc`: `diff -rq` identical (2 shots); no SCSS changed |
| AC-10 | pass | `charts-stat-trend--inside-a-clickable-card`: 3 tiles (EN, DE, DE long + sentiment), `icon="wallet"`, `[clickable]="true"`; JSDoc and `docs.description.story` state the naming rule and the sparkline caveat |
| AC-11 | pass | build.md changelog draft: finance-intelligence cockpit, gap file row 2, `label-content-name-mismatch`, WCAG 2.5.3, "No API breaks", naming rule, sparkline caveat, migration note |

API (design §2): no input, output, class, hook or type changed; the template diff is three `&ngsp;` plus a comment, as in design §3. The new story is render-only (no args, so no argTypes to check).

Colour contrast of the new story (axe, computed): label 5.83 light / 6.70 dark, value 17.73 / 15.85, pill 10.97 / 8.41. The only `color-contrast` incomplete is the `↑` glyph (non-text), as in 3.22.0.

Layout of the new story (measured): cards 328 wide at 360 (one column), 320 at 1024 and 405.33 at 1280 (three columns, gap 16); at 1024/1280 the cards stretch to the row's height of 110.38 px.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | nit (design doc, fixed) | design.md §3 wireframe and table | Wallet at the card's right content edge; value row 31.38 px | Tiles 1–2: the wallet sits next to the label (`.lc-stat-trend` is `inline-flex`), 109.86 / 84.38 px left of the content edge at 360 and 187.19 / 161.70 px at 1280; tile 3 (wrapping label) has it at the edge (gap 0). Value row 28.8 px without a pill, 31.38 px with one. Same in 3.22.0 (Card Wrapped); design.md corrected with a change note |
| 2 | nit (follow-up, not this request) | `lc-stat-trend` in a card | In a row of KPI tiles the icons line up at the right edge | The icon's x depends on the label length (see #1). Fixing it changes the rendering of every existing stat-trend story, so it can't go in this patch (AC-4, spec "no visual change"). A follow-up request could make the tile fill its container behind an opt-in input. The requester asked for no look change |
| 3 | nit | build.md "Gates" | Gate commit = branch HEAD `df5d8c3` | build.md names `0cf895e` (before the amend). The libs and tools trees are identical (`git diff --quiet 0cf895e df5d8c3 -- libs tools`), so the gates stand. The release-manager should use `df5d8c3` as the reference, because `0cf895e` is not on the branch and may be garbage-collected |

**Verdict:** approved
