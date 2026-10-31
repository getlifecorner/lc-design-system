# Review 026: Review findings follow-up 3: toast close colour, notification-center comment, drawer story lang

## Round 1 — 2026-10-31, commit 1275009 (code = gate commit 80f5747, `git diff --quiet 80f5747 -- libs tools` holds)

Screenshots: `tmp/story-shots/026/r1/` (`rest` 90, `open` 16, `revert` 36, `measure` 44, `forced` 4, `focus` 1, `probe` 2; widths 360 · 1024 · 1280, light · dark). Logs: `tmp/story-shots/026/r1-*.log`. Developer's Storybook build reused (not stale).

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `toast.component.scss` base rule: `color: var(--color-text-secondary)`, no raw colour (diff). Computed on all 100 closes (6 toast stories + 4 outlet stories opened, 360/1280 L/D): × and svg stroke rgb(75,85,99) L / rgb(196,210,217) D (was rgb(0,0,0)). Unit test in `theme-contrast.spec.ts` (+7, additions only) |
| AC-2 | pass | `r1-measure-*.log`: × on the gradient ends 7.56 / 7.23 L and 9.26 / 11.16 D on every close (50 + 50), standalone and outlet, 360 and 1280. Matches design §5 |
| AC-3 | pass | `:focus-visible` true 100/100 after `focus()`; ring `solid 2px −2px` in the × colour, 7.56 / 7.23 L, 9.26 / 11.16 D. Shot `r1/focus/…with-action--360-dark` shows the ring. `--forced-colors` (`r1/forced`, 12 closes): × and stroke black on white (L), white on black (D); ring solid 2 px in the forced focus colour (computed 11.3:1 / 8.7:1); 0 of 32 toast rules use `forced-color-adjust` |
| AC-4 | pass | × and ring on the hover tints, min over both ends: success 6.66 / 7.89, error **6.02** / 9.32, warning 6.73 / **7.82**, info 6.30 / 8.57 (L / D). Tint lines unchanged (diff) |
| AC-5 | pass | Hash proof, own run: 6 toast stories × 3 widths × 2 themes re-shot with `button.lc-toast__close { color: buttontext }` injected → **36/36 identical** to `baseline` (`r1-revert.log`). Developer's `revert` (66) and `revert-open` (16) folders: `diff -rq` against `baseline` / `baseline-open` reports nothing. At rest: toast 36 differ (× only), without-close 6 + outlet 24 identical. Boxes 44×44, svg 20 at +12: (295, 21) at 360, (367, 21) at 1024/1280, (1215, …) in the outlet; positions equal the baseline-open log |
| AC-6 | pass (with D1) | Diff of `notification-center.component.scss`: comment lines 110–115 only, wording exactly design §7.2. Lowest value 1.44 (Warning, dark) instead of the spec's "1.89", as designed (D1, measured in `tmp/026/probe-nc.log`) |
| AC-7 | pass | German Heading, 360/1280 L/D: 8/8 text nodes and 3/3 `aria-label`s (aside, close "Schließen", avatar "Alice Johnson") resolve to `lang="de"`, all German or a name; only `HTML:en` and `LC-DRAWER:de` carry `lang`. h2 2 lines, `hyphens: auto`, no overflow; breaks at syllables: "…verwaltungsein-/stellungen" (360), "…verwal-/tungseinstellungen" (1280). Header 73, close (302, 14) / (1222, 14), gap 6, description 3 lines at 327 / 287 px, `scrollWidth` 360 / 1280 |
| AC-8 | pass | Story description: 65 → 73 px header, 44 × 44 close, 6 px gap, `closeAriaLabel`, plus the 3.19.2 sentence. All four values match the measure |
| AC-9 | pass | build.md: 208 suites, 4728 passed (+7), lint 0 errors, build green on 80f5747. No existing assertion changed (spec diff adds lines only). Other 5 drawer stories: 19/20 identical; `large-form` 1280 L differs from `baseline` but is byte-identical to the developer's `build` shot, and `025/after` (same drawer code) equals `baseline`: two raster states of one story, 4 px at row 437, max Δ 15 (`tmp/026/diff2.log`). Noise, as in 025 r1 |

API (design §2): no input, output, slot, hook or type changed; `toast.component.ts`, `drawer.component.ts` and `notification-center.component.ts` are not in the diff.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix (release-manager, changelog) | build.md changelog draft, Compatibility | Tell consumers how to override the new colour correctly. Use this sentence: "The kit's toast styles are added after your global stylesheet, so a plain `.lc-toast__close` rule there (0,1,0) now loses; use a stronger selector such as `lc-toast .lc-toast__close`." Before 3.19.2 such a rule beat the UA colour, so a consumer who patched the black × gets the kit grey without notice | "an override of your own wins if it is stronger or loaded later". An app can't load a global rule after the component styles, so "loaded later" points the wrong way (memory 011 r1: an equal-specificity global rule loses) |
| 2 | nit (follow-up, pre-existing, out of scope) | `lc-toast` variant icons, every story, 360/1280 | ≥ 3:1 would be good practice, although the icon is `decorative` (the message text carries the meaning) | Variant icon on the gradient ends: error **1.71 / 2.06** D, info **2.32 / 2.80** D, success **2.72 / 2.60** L (`r1/probe`). lc-alert uses the same `--color-<variant>` icon colours (018: success L 2.45, warning L 2.03, info D 2.70, error D 2.17). A candidate for a kit-wide follow-up request; not caused by 026 |

Observation, not a finding: in *Service Call* (opened, 360) a rounded box shows under the first toast. It is the story's own outline trigger button (66–108, x 16–168) under the fixed outlet (`elementsFromPoint`), and it is the same in `baseline-open`.

Design correction (no code impact): design §4 said the forced-colours ring becomes ButtonText. The emulation shows a solid 2 px ring in the forced focus colour instead, and it is still visible. A change note was added to design.md §4.

**Verdict:** approved. Finding 1 is a changelog wording fix for the release-manager; finding 2 stays visible as a follow-up candidate.
