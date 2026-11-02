# Review 038: lc-accordion bleed hook robust to a unitless 0, scroll-container note

## Round 1 — 2026-11-02, commit 8db1ef7 (libs/tools = ae8abba, the gate commit)

Screenshots: `tmp/story-shots/038/` — `build` (108, hash compare), `measure` (360 · 1280, L · D), `measure-fc` (360 L · D), `r1` (1024 L, this review). Measure: `bleed-measure.js` + hover-rule read (`r1.log`). The Storybook build (23:25) is newer than the sources (23:19), so it was not rebuilt. Opened 4 shots: plain-in-card 360 L (focus, `0`), plain-variant 360 L (focus, `0`), plain-in-card 1280 D, measure-fc plain-in-card 360 L.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `--lc-accordion-header-bleed: 0` → `::before` = header: plain-variant `328px 0px` (360), `560px 0px` (1024, 1280); plain-in-card `278px 0px` / `430px 0px`, L and D (`tmp/038/shots-measure.log`, `r1.log`). Registered rule `--_lc-accordion-header-bleed <length-percentage> false 0px`. Focus with `0`: `fv: true`, box 328 × 50.5 / 278, ring `solid 2px rgb(32, 132, 151) -2px`. Hover rule `var(--lc-accordion-header-hover-bg, var(--color-surface-hover))` is in the built CSS and now paints a non-zero box. Shots show the ring around both headers |
| AC-2 | pass (dropped) | Dropped per design D-1/D-3 because AC-1 is met. `0px` is still named in the JSDoc, the docs bullet, the story text and the changelog draft (grep) |
| AC-3 | pass | All valid values equal the `before` column of `proto.log` at 360, 1024 and 1280, L and D: unset 344/−8 · 576, `0px` 328/0 · 560, `4px` 336/−4 · 568, `1rem` 360/−16 · 592, `var(--spacing-2)` 344/−8 · 576, `5%` 360.781/−16.3906 · 616, `-4px` 320/4 · 552, `0.5em` 343/−7.5 · 575, `initial` 344/−8 · 576 (card: 294/446 default). `diff -rq baseline build`: no difference, 108/108 |
| AC-4 | pass | `clipping or scrolling edge`: `accordion.component.ts` 1, `accordion.stories.ts` 2 (l. 77, l. 297), changelog draft 1. New spec `toContain`. The text is in the built story bundle `lib-accordion-accordion-stories.944806df` |
| AC-5 | pass (finding 1) | build.md draft: Fixed (bare `0`, BA-9, review 035 finding 1), Changed (scroll containers, finding 2), Compatibility ("No API break", `@property` support, fallback) |
| AC-6 | pass | The ring colours match 035, so the computed contrasts still hold: L `rgb(32, 132, 151)` (3.97 over the hover fill), D `rgb(132, 199, 212)` (≥ 6.69). Forced colours with `0`: `rgba(5, 0, 73, 0.8)` L / `rgba(0, 230, 255, 0.8)` D, box 278 (`shots-fc.log`; shot shows a Highlight ring). The reduced-motion block is not in the diff |
| AC-7 | pass | build.md: `--testFile=accordion` 4 suites / 61 tests; full suite 5115 passed. Changed assertions (`::before` list, before-cut selector filter skips exactly the one `@property`) are listed with their reasons under Deviations. I accept the filter change: the new test pins the at-rule as the only `@property` |
| AC-8 | pass | plain-in-card 360 L: the ring runs around the 2-line DE title "Herkunft und Abrufzeitpunkt der Buchung", box 278 = header. EN plain-variant 328. The diff has no template, ARIA or markup change |
| AC-9 | pass (22; finding 2) | compat `--only=22`: 92 HTML checks, including the new "plain accordion bleed @property" check. Angular 21 was not run |

API check against design §2: no input, output, slot, type or class change. The `variant` JSDoc (`@default 'outlined'`), the docs bullet and the story text match §7 word for word. The public hook stays unregistered and is read once and never declared (spec l. 244–245). The private property is declared once and read once.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix | Changelog draft (build.md, Compatibility); my design §7 wording, corrected in design.md with a change note | "Closes the two *Known* items of 3.23.0: the bare `0` is fixed; the 8 px sideways scroll in a scroll container without inline padding stays and is now documented." | "Resolves the two *Known* items of 3.23.0." This reads as if the 8 px scroll were gone, but the behaviour is unchanged (design §6) |
| 2 | nit | AC-9, build.md Gates | compat green on Angular 21 and 22 (design §9), with the new `@property` check on both | Only `--only=22` was run. The style shim's `@property` pass-through is long-standing, so the risk is low; confirm the 21 leg in the release gates or the CI matrix |

**Verdict:** approved
