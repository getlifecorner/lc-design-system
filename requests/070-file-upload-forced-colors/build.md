# Build 070: lc-file-upload image grounds in forced colours

- **Branch:** `fix/3.49.1-file-upload-forced-colors` (from main 6005a88)
- **Commit:** `fix(file-upload): keep the light, dark and checkered image grounds in forced colours` (one commit, amended with this file)

## Files changed

| File | Change |
|---|---|
| `libs/angular-ui-kit/src/lib/file-upload/file-upload.component.scss` | design §2 rule in the existing (last) forced block, after the tile's CanvasText edge; block comment names 3.49.1 / request 070 |
| `libs/angular-ui-kit/src/lib/file-upload/file-upload.forced-colors.spec.ts` | new, 22 tests (AC-1/3/4 + default pins) |
| `libs/angular-ui-kit/src/lib/file-upload/file-upload.stories.ts` | new story *Image Grounds White Logo* (`WHITE_LOGO`, design §3/§7/§8) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | Spec: the forced block holds exactly one rule with the three-selector list (read from the compiled CSS) and `forced-color-adjust: none;`; jsdom `matches()` true for light/dark/checkered with an image, also failed (D-5) and drag-over. Measure (`tmp/070/new-fc.log`, 6 shots): `none`, `rgb(255, 255, 255)` / `rgb(7, 14, 21)` / transparent + `repeating-conic-gradient(rgb(209, 213, 219)` L · `(rgb(75, 85, 99)` D; img `none` |
| AC-2 | Measure: three distinct bg/bgImage pairs; dark ≠ Canvas (L #fff, D #000); white on dark **19.4** in L and D (was 1.00 in L) |
| AC-3 | Spec: the 3.49 rules (edge CanvasText, drag Highlight, img `none`, remove ring Highlight) still in the block; one forced block, the file's last; `forced-color-adjust` only inside it (2 rules). Measure: border `rgb(0, 0, 0) solid` L / `rgb(255, 255, 255) solid` D (`dashed` empty); drag `rgba(55, 0, 110, 0.8) dashed` L / `rgba(26, 235, 255, 0.8) dashed` D; rest `false` |
| AC-4 | Spec: `matches()` false for surface with image and every empty ground; `querySelectorAll(list)` = the tile only; its only descendant is the img; 6 buttons/lines beside it are outside. Measure: empty dark `auto`, Canvas, hint CanvasText **21**; leak `["auto"]` |
| AC-5 | Normal compare vs `baseline`: **72/72 identical**. FC compare vs `baseline-fc`: 66 identical, 6 different = *Image Backgrounds* 360/1024/1280 × L/D (the fix), as design §9 expects |
| AC-6 | Only `.scss`, `.stories.ts` and the new spec change; all existing file-upload specs pass untouched; no template/class change (spec pins the tile classes per ground, filled and empty, and the five normal-mode tile rules); compat `EXPECT_IN_HTML` untouched (it pins the drop zone only) |
| AC-7 | `--list=file-upload` lists `form-file-upload--image-grounds-white-logo` |
| AC-8 | Changelog draft below (release step) |

The new spec fails on the 3.49.0 SCSS (15 of 22; `tmp/070/fc-spec-old.log`) and passes on the new one.

## Gates

All gates ran on commit `50914b8d622ba1e227ad88f7882fbf9981a1b35d` (later agents skip a gate while `git diff --quiet 50914b8 -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 377 suites, 7386 passed, 8 skipped (was 376 / 7364; +1 suite, +22 tests) · `tmp/070/test.log` |
| `npx nx run angular-ui-kit:lint` | 0 errors, 159 warnings (unchanged; none in the changed files) · `tmp/070/lint.log` |
| `npx nx run angular-ui-kit:build` | green, 127 entry points · `tmp/070/build.log` |
| `npm run test:tools` | tools unchanged |
| `npx nx run angular-ui-kit:build-storybook` | green (`--skip-nx-cache`), no preview error · `tmp/070/storybook.log` |
| Story screenshots | new story `tmp/story-shots/070/new` (360/1024/1280 × L/D, `--axe`: 0 violations) and `new-fc` (`--forced-colors` + design's `fc-measure.js`); compares `build` (72/72) and `build-fc` (66 + 6) |
| `node tools/compat/check-angular-majors.mjs` | not run: no markup change; the only CSS change is inside `@media (forced-colors: active)`, which no `EXPECT_IN_HTML` pin reads |

Shots opened: new story FC 360 L, FC 360 D, FC 1280 L, normal 360 L (design §9 list). The other 2 new normal shots and the 6 *Image Backgrounds* FC diffs are for the designer.

## Deviations from the design

None.

## Changelog draft

Header line for 3.49.1: "Image grounds of `lc-file-upload` in forced colours (069-s1, found in the review of request 069). No API breaks."

### Fixed

- **`lc-file-upload variant="image"` in forced colours** (Windows high contrast; 069-s1, usm-x row 71, the logo in the settings): a tile with the `light`, `dark` or `checkered` ground keeps that ground once it shows an image, so a logo can still be judged on it. Before, all three were painted Canvas and a white logo on `dark` measured 1.00:1 in a light palette; now it measures 19.4:1 against #070e15. The tile's edge stays CanvasText and its drag ring Highlight; `surface` tiles and empty tiles (the hint is CanvasText, 21:1) keep the system colours. The buttons and lines beside the tile are not affected.

### Compatibility

- No API breaks, no new input, class or token. Only forced colours change: the 72 shots of the 12 existing file-upload stories (360/1024/1280, light/dark) are hash-identical to 3.49.0 outside forced colours. New story *Image Grounds White Logo*.

Release step: remove the 3.49.0 *Known* line about the forced-colours grounds (AC-8).
