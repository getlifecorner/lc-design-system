# Review 070: lc-file-upload image grounds in forced colours

## Round 1 — 2026-11-19, commit 99fba7c (libs = gate commit 50914b8)

Screenshots: `tmp/story-shots/070/` — `new` (normal, `--axe`), `new-fc` (`--forced-colors` + design `fc-measure.js`, log `tmp/070/new-fc.log`), `build` / `build-fc` (12 existing stories × 360 · 1024 · 1280 × L · D, `--full`). No new run: the developer's folders were reused, because `find libs/angular-ui-kit/src -newer build/<first shot> -not -name '*.spec.ts'` is empty and the Storybook build (07:44) is older than the shots (07:45). They were re-checked byte for byte with `diff -rq` against `baseline` / `baseline-fc`.

Shots opened (7): new-fc 360 L, 360 D, 1280 L; new 360 L; build-fc *Image Backgrounds* 360 L, 360 D; baseline-fc *Image Backgrounds* 360 L.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `new-fc.log`, all 6 shots, both groups: light/dark/checkered filled → fca `none`, bg `rgb(255, 255, 255)` / `rgb(7, 14, 21)` / `rgba(0, 0, 0, 0)` + `repeating-conic-gradient(rgb(209, 213, 2…` L · `(rgb(75, 85, 99)` D; img `none`. Unit: `file-upload.forced-colors.spec.ts` AC-1 block (rule read from the compiled CSS; `matches()` incl. failed + drag-over) |
| AC-2 | pass | Three distinct pairs (#fff + none · #070e15 + none · transparent + gradient); dark ≠ Canvas probe (L #fff, D #000); white on dark **19.4** at 360/1024/1280, L and D (3.49.0: 1.00 in L, baseline-fc shot shows a Canvas tile with a black border). Shots: 360 L dark tile shows the white silhouette, 360 D likewise |
| AC-3 | pass | border `rgb(0, 0, 0) solid` L / `rgb(255, 255, 255) solid` D on every filled tile, `dashed` on empty; drag `true`, `rgba(55, 0, 110, 0.8) dashed` L / `rgba(26, 235, 255, 0.8) dashed` D (= 3.49.0, `tmp/070/measure-test.log`); rest `false`. Unit: AC-3 block (one forced block, the file's last, `forced-color-adjust` only inside it) |
| AC-4 | pass | `dark-empty` (EN and DE): fca `auto`, bg Canvas, hint CanvasText **21** in L and D; leak `["auto"]` (buttons, hint, accept, error). Shot 360 L: "No image" / "Kein Bild" readable on Canvas with a dashed black edge. Unit: AC-4 block (surface with image and all empty grounds don't match) |
| AC-5 | pass | `diff -rq baseline build`: no difference (72/72; `tmp/070/compare.log` `{"identical":72}`). FC: `diff -rq baseline-fc build-fc` shows exactly the 6 *Image Backgrounds* shots (3 widths × L · D) = the fix. Opened 360 L before/after: only the light/dark/checkered tiles and the filter tile change; surface, buttons and captions are the same |
| AC-6 | pass | `git diff --stat main -- libs`: only `.scss` (+1 rule, comment), `.stories.ts` (+1 story), new spec; no `.ts`/`.html` change. Gates green on 50914b8 (build.md); `git diff --quiet 50914b8 -- libs tools` holds |
| AC-7 | pass | `tmp/070/list.log` lists `form-file-upload--image-grounds-white-logo`; EN `lang="en"` + DE `lang="de"` groups with `IMAGE_DE`; `controls: { disable: true }`; story description = design §8; axe 0 violations on 6 shots (`tmp/070/new.log`) |
| AC-8 | pending (release step) | Draft in build.md; the 3.49.0 Known line that must go is `CHANGELOG.md` l. 26 |

API check (design §2): no input, output, slot, class, hook or type changed. The SCSS rule matches §2 to the selector, sits directly after the tile's CanvasText edge, and the block comment names 3.49.1 / request 070. The tile's only children are the `<img>` (hidden with `visibility: hidden` when failed, so no alt text is drawn on the kept ground) or the empty span (never opted out).

Side gain, measured in the shots: the *Image Backgrounds* tile "dark + `--lc-file-upload-image-filter: brightness(0) invert(1)`" was an empty white box in light FC (white on Canvas) and now shows the logo on #070e15.

Notes (no finding):
- The `checkered` "white on ground" column reads 1 (L) / 21 (D) because the measure falls back to Canvas for a transparent background. The real ground is the gradient, with values from design §5: L 1.47 / 1.00, D 7.56 / 17.27, the same as normal mode.
- The DE cells inherit `IMAGE_DE`'s hint, which repeats the accepted and max lines ("höchstens 85 kB" next to "Höchstens: 85,0 KB"). This is backlog row 069-n2 (story wording). The new story follows automatically once that row is fixed.

### Findings

none

**Verdict:** approved
