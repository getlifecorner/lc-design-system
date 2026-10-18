# Build 005: Edu's character poses as kit assets (G-4)

- **Branch:** `feat/3.8-edu-character-poses`
- **Commits:** `acf0e7c` feat(character): Edu's poses as files, SVG strings and lc-character; horizon figure slot · `b32be26` docs(character): the review r1 fix · then request-document commits (`build.md`, `log.md`). `git commit --amend` was denied in the r1 session, so these are separate commits: squash everything after `acf0e7c` into it before release (`git reset --soft acf0e7c~1` and one commit with the feat message)

## Files changed

| File | Change |
|---|---|
| `src/assets/character/*.svg` (28) | 14 light + 4 drawn dark copied unchanged (`cmp` = life-os, 18/18); 10 dark by the rule |
| `scripts/generate-character-assets.mjs` | New generator (design D8): rule §5 per tag, fails on unknown colour/opacity/attribute or unread tag; checks the 4 drawn darks; writes the 10 darks and `character-svg.data.ts` |
| `src/lib/character-svg/` + stub | New entry: `CharacterPose`, `CHARACTER_POSES`, 14 `CHARACTER_SVG_<POSE>`, `CHARACTER_SVG`, `CharacterDrawing`, `CharacterSvgPair` |
| `src/lib/character/` + stub | New entry: `lc-character`, `LC_CHARACTER_BASE_PATH`, `CharacterSize`, `CharacterColorMode`, type re-export `CharacterPose`; 3 specs; 21 stories |
| `src/index.ts` · `package.json` | 2 re-export lines · `exports["./assets/character/*"]` |
| `src/styles/_horizon.scss` · `horizon.figure.spec.ts` | Figure custom properties (64/16 → 96/24 at 1024 → 128 at 1920), `:has(> .lc-horizon__figure)` min-height, `.lc-horizon__figure`, `> :is(img, svg)` · new spec (11 tests) |
| `src/docs/horizon.stories.ts` | Docs table + figure section; stories With Figure, Figure and Footer |
| `entries.spec.ts` | 111 → 113 public entries (the two new ones; same edit as 3.6) |
| READMEs (root, lib, `src/assets/README.md`) | `character` in the lists; asset folder section |
| `tools/compat/template/*` | `assets` glob → `compat-logo/character`; `probe-38.ts` (slot figure + dark named figure) on `''` |
| `tools/compat/check-angular-majors.mjs` | 3 `EXPECT_IN_HTML` + 2 checks (file copied; exports resolve + plain-Node `import()` equals the file) |
| `tools/compat/check-entries.mjs` | 116 → 118 entries; `./assets/character/*` not an entry; "one public entry per symbol" now compares declarations, so `character`'s type re-export of `CharacterPose` isn't a duplicate (design §2) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | `character.assets.spec` (29): 28 files exactly, 100×100 header, no script/style/text/animate/set/href/on*/url/style, ≤ 30 KB (max 1737 B); dist has 28 |
| AC-2 | `assets.spec`: rule reproduces the 4 drawn darks byte for byte, the 10 others = rule(light), colour sets closed. Generator also reproduces peeks-around-corner and amazed. Sources: hello-light `ba6e0b1254c8`, shows-the-way-light `15c317282d22`, happy-light `3d6a43e8cf01`, welcomes-member-light `6a6da71f246a`, resting-light `fb01fef6e23b`, in-his-corner-light `639677b9fff9`, comforts-light `b79adbc6c965`, all-done-light `6d724b8081d4`, calm-light `b3f51496d924`, connects-light `853efb9203eb`, discovered-light `070232ea29a4`, thinking-light `53b80cf940f3`, connection-paused-light `8717370aa0f2`, see-you-light `78beb890f5a5`, hello-dark `3e3c6b48ed8b`, shows-the-way-dark `b9e05e3c0a88`, happy-dark `e11bcc492b84`, calm-dark `f79138532f51` (sha256, 12 hex) |
| AC-3 | compat 22: `ok character: the assets config copied the pose files`, `ok … resolves through exports`; check-entries `ok the pose files resolve through ./assets/character/*`; docs table (5 forms) |
| AC-4 | `assets.spec`: 14 × string = file, no Angular import / `Object.freeze`; compat: plain-Node `import('…/character-svg')` → `<svg`, 14 poses, equals resolved file; FESM has 0 imports |
| AC-5 | build (no TS6059); header/logo/empty-state FESMs 0 × `character`; 116 FESMs byte-identical to 3.7.0 (npm), primary +2 `export *` lines → header-only bundle 0 B |
| AC-6 | `component.spec` (2); axe 0 violations: hello, with-label, all-poses, with-figure, figure-and-footer (360, both themes) |
| AC-7 | CSS test; `--sizes` 360/1280: `[[48,48],[64,64],[80,80],[96,96],[128,128]]`; `--hello` rects equal after removing the images |
| AC-8 | `component.spec` (6, incl. `'96'`); `--responsive-size` 64 / 96 / 128 at 360 / 1024 / 1920 |
| AC-9 | `--hello`: light → 2× `-light`, dark → 2× `-dark`, `system` follows the emulated scheme, `''` → `-dark`; hidden ones `display:none` |
| AC-10 | `component.spec`; `--on-dark-surface` both themes: 1 img `hello-dark.svg`, host `aria-hidden` |
| AC-11 | `character.contrast.spec` (11): 6.21, 5.91 · 9.14, 9.95, 9.13 · band 6.97 / 3.55 / 3.01 / 2.31; ≥ 3 for t ≤ 0.75. r1: `--on-dark-surface` box centre t 0.351 / 0.587 / 0.660 at 360 / 1024 / 1280 (both themes), figure x 36 / 624 / 880 = card x + 16, feet on the card (0) |
| AC-12 | no motion in files/CSS (specs), computed `animation-name: none`; forced-colors rules tested on compiled CSS (story-shots can't emulate forced colours) |
| AC-13 | `component.spec`: no kit policy under a fake `trustedTypes`, no `innerHTML` in template/source |
| AC-14 | compat 22: 3 new `EXPECT_IN_HTML` ok (host `aria-hidden`, `lc-character--64`, `lc-horizon__figure`, 2 × `<img alt="" width="100">` from `/compat-logo/character/`; style `aspect-ratio: 1`) |
| AC-15 | `--with-figure`: gap 16 / 24 / 23.99 / 23.99 / 23.99, size 64 / 96 / 96 / 96 / 128, foot 0, height 192 / 204 / 232 / 282 / 372 (360 / 1024 / 1280 / 1440 / 1920); one visible image in the slot |
| AC-16 | `--figure-and-footer` 360: `pointer-events: none`, `tabIndex -1`, tab stops = the 2 links, both hit by `elementFromPoint` |
| AC-17 | `--list=character` 21, `--list=horizon` 5 (as §8); argTypes with description + default |
| AC-18 | no text node; docs + ariaLabel JSDoc say it's consumer text |
| AC-19 | `--with-figure` 360 at 96 px: `scrollWidth` 360, figure left 89.2 |
| AC-20 | baseline `--compare`: 96/96 identical (hash list diff; the tool hit ENOTEMPTY before its count line); primary-entry fixture build has 0 hits of `lc-character` or the SVG paths |
| AC-21 | manifest: `lc-character`, 4 inputs with defaults, the 14 pose names; READMEs; changelog draft below |

## Gates

Round 0 ran on `34f188f`. Round 1 changed only `character.stories.ts` (excluded from the library build and from the specs' source scans) and ran on commit `b32be26` (later agents skip a gate while `git diff --quiet b32be26 -- libs tools` holds). Logs: `tmp/005/r1/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | r1: 149/149 suites, 3906 passed, 8 skipped (3914); +4 suites, +109 tests against 3.7.0 |
| `npx nx run angular-ui-kit:lint` | r1: 0 errors, 162 warnings (same as 3.7.0), none in new files |
| `npx nx run angular-ui-kit:build` | `34f188f`: green; `character`, `character-svg` built; FESM 7.2 kB / 43.6 kB raw (1.7 / 3.1 kB gzip). r1 not rerun: stories are excluded by `tsconfig.lib.json` |
| `npm run test:tools` | r1: 22/22 |
| `npx nx run angular-ui-kit:build-storybook` | r1: green (`--skip-nx-cache`: the cached run restored the old story) |
| Story screenshots | `tmp/story-shots/005/` (21 Character stories at 360/1280, 2 Horizon at 360/1024/1280/1920, both themes); baseline `tmp/story-shots/005/baseline`, after `…/after`. r1: `tmp/story-shots/005/r1/` (on-dark-surface at 360/1024/1280, both themes) |
| `node tools/compat/check-angular-majors.mjs --only=22` | `34f188f`: PASS, 42 of 42 checks (5 new for G-4, csp build included). r1: nothing server-rendered changed |
| `node tools/compat/check-entries.mjs` (changed) | `34f188f`: 24/24 |

## Deviations from the design

None. Review r1 settled the two points raised in round 0 (design.md change note 2026-10-19): Hallo stands on the card's top-left corner (finding 1), and the card is `--color-surface` in both themes. The docs band rule names the box centre and the short band's right end; the card-corner recipe names `left: 16px` (finding 2).

## Changelog draft

### Added

- **Edu, the LifeCorner character** (G-4; life-os app-shell 7.2: offline, empty and done pages, the horizon; website: Hallo on the band, calm at the page end, Tröstet on the 404). 14 still poses (`hello`, `shows-the-way`, `happy`, `welcomes-member`, `resting`, `in-his-corner`, `comforts`, `all-done`, `calm`, `connects`, `discovered`, `thinking`, `connection-paused`, `see-you`), each with a light and a dark drawing, 1.0 to 1.7 KB, 100 × 100:
  - **Files** in `src/assets/character/<pose>-<light|dark>.svg`, also `@lifecorner/angular-ui-kit/assets/character/<file>` through `exports` (`<img>`, `<picture>`, Angular `assets`, bundler `loader`).
  - **`@lifecorner/angular-ui-kit/character-svg`**: `CHARACTER_SVG_<POSE>` (`.light`, `.dark`), `CHARACTER_SVG`, `CHARACTER_POSES`; plain TypeScript, Node imports it; unused poses tree-shake away.
  - **`lc-character`** in `@lifecorner/angular-ui-kit/character`: `pose` (default `calm`), `size` 48 · 64 (default) · 80 · 96 · 128, `colorMode` `auto` | `dark`, `ariaLabel`. Prerenders as two `<img>`; the root theme picks one (light, dark, system), no JavaScript. Decorative by default (`aria-hidden`); a square box sized by CSS, so nothing shifts. `--lc-character-size` sets it per breakpoint; files come from `LC_CHARACTER_BASE_PATH` (default `LC_LOGO_BASE_PATH` + `/character`).
- **`.lc-horizon__figure`**: Edu on the horizon line, 16 px (24 px from 1024) left of the sun, feet on the line; 64 · 96 · 128 px (`--lc-horizon-figure-size`, `--lc-horizon-figure-gap`). A block with him is at least max(sun + 22, figure + 8) px above the land (204 px instead of 192 px at 1024).
- Contrast (computed): light body 6.21:1 on white, 5.91:1 on `--color-background-low`; dark body 9.14:1 on the night sky; Hallo on the hero band 6.97:1 at its dark start to 3.01:1 at 75 %: keep his box's centre where t = (x + y) / (width + height) ≤ 0.75. A band's top-right corner is at t = w / (w + h) (0.88 on a 1280 × 168 band), so on a short, wide band stand him left of the right end, for example on a card's top-left corner (`left: 16px`: t 0.35 / 0.59 / 0.66 at 360 / 1024 / 1280).

### Compatibility

- No API breaks. New entries, files and an optional class; `lc-logo`, `lc-header` and `lc-empty-state` don't import the character (their code is byte-identical to 3.7.0), and a horizon without the figure renders as before (96 of 96 screenshots identical).
