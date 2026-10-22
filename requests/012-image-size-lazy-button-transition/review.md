# Review 012: Intrinsic image size and lazy loading for logo, character and avatar, and a narrower button transition

## Round 1 — 2026-10-23, commit da19f10

Screenshots: `tmp/story-shots/012/r1` (5 new stories, 360 · 1024 · 1280, light · dark, measures: attributes, boxes, fetched files, pending-box probe, label contrast), `r1-ac9-review` (AC-9 spot check), `r1-proto` (fix prototype for finding 1). The Storybook build was current (no stale warning); `libs`/`tools` are clean against the branch tip.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `logo.intrinsic-size.spec.ts` (build.md); compat 22 "logo: both built-in lockup images 485 × 100" |
| AC-2 | pass | unit; `tmp/012/shots-ac4.log`: emblem `--emblem-sizes` and `navigation-header--logo-sizes` attributes 24…96 = boxes |
| AC-3 | pass | unit; `custom-lockup-with-size`: both `<img>` 485/100 at 360/1024/1280 L/D; `custom-emblem-with-size`: 100/100, box 64 × 64 |
| AC-4 | pass | `shots-ac4.log` (12 shots): pending = loaded = baseline, lockup 116.391/155.188/232.797/310.391/465.594 × 24…96, emblem squares. r1 probe on the 2 new logo stories: pending 232.797 × 48 = loaded; 64 × 64 = loaded |
| AC-5 | pass | unit; `character--lazy-loading` r1: both `<img>` `loading="lazy"`, attribute order `… class loading src`, width/height 100, `decoding`, `fetchpriority` kept; dark: only `hello-dark.svg` fetched (light `<img>` not complete) |
| AC-6 | pass | `avatar--image-sizes` r1, 360/1024/1280 L/D: attributes 24/32/40/48/64 = boxes = pending boxes; baseline avatar stories identical |
| AC-7 | pass | unit (`(error)` → initials); `avatar--lazy-image`: `… width height loading src`, 48/48, `lazy` |
| AC-8 | pass | `shots-ac8.log`: computed `color, background-color, border-color, box-shadow` / `ease-in-out`; SCSS longhands keep `--animation-duration-base`, `--animation-timing-ease` |
| AC-9 | pass | build.md table (DE + EN, 360/1024/1280); own spot check `r1-ac9-review` (DE 360/1024): t0 = t500 (291 × 48.5 ×2; 264.86 + 134.31 × 48.5), card0 = card500 (242.38; 82.5); a size toggle starts **no** `.btn` transition; colour toggle: `background-color/150 color/150` |
| AC-10 | pass (22) | `tmp/012/compat-22.log`: 4 new rows ok. Angular 21 runs in the release gate |
| AC-11 | pass | `diff -rq tmp/story-shots/012/baseline tmp/story-shots/012/r1-compare`: no difference, 516 / 516; unit: no `loading` by default |
| AC-12 | pass | 5 stories with the §8 IDs; argTypes with `description` + `table.defaultValue`; JSDoc + `@default` on the 6 inputs and on `size` (logo, avatar); `test:tools` 22/22 |
| AC-13 | **fail** | `custom-emblem-with-size` in dark (the Storybook default theme): see finding 1. Otherwise pass: no SCSS change in logo/avatar/character; `ImageSizes` labels 11 px 7.56:1 (light), 12.17:1 (dark) |
| AC-14 | pass | changelog draft: names from §2, values 485 × 100, 0 px → Δ 0, avatar 24–64, +26 px → 0, life-os drops `G-41` |

API against design §2: names, types (`number \| undefined` with `toIntrinsicSize`, `CharacterLoading`, `AvatarLoading`), defaults, JSDoc, `[attr.*]` bindings and the `loading`-before-`src` order all match.

### Deviations in build.md

| # | Decision |
|---|---|
| 1 | Accepted. The token follows the theme and passes in both (7.56 / 12.17 at 11 px). |
| 2 | Accepted; the design was wrong. Toggling and reading each CTA in turn measures a half-toggled row. design §9 now toggles all CTAs first and counts only `.btn` transitions (change note r1). The `font-size@LC-ICON` entry is the 0.01 ms reduced-motion rule on `*`, not a kit transition. |
| 3 | Not accepted as a note: a design error, now finding 1 (design §8 corrected, change note r1). |
| 4 | Accepted, a Storybook artefact: the preview starts `dark` and the decorator sets `.light` after the first frame, so in light both drawings are fetched, in dark only `hello-dark.svg`. A figure below the fold isn't near the viewport in the first frame, so G-39 is unaffected. |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix | `components-logo--custom-emblem-with-size`, dark, 360–1280 | args per design §8 (r1): `emblemSrc: '/assets/lifecorner-emblem.svg'`, `darkEmblemSrc: '/assets/lifecorner-emblem-on-dark.svg'`, pair 100/100, `size: 'lg'`, alt `'Acme Inc.'`; story text: the kit's emblem files stand in for a brand file, and the dark `<img>` shares the pair. Prototype (`r1-proto`, 360): both `<img>` `100`/`100`, visible one 64 × 64 in light and in dark | the mono emblem has no dark partner: body `#111827` on the canvas `#0a121b` = 1.06:1, only the eyes and arm dots show (`r1/…--360-dark.png`). Cause: design §8 named that file |

**Verdict:** changes requested

## Round 2 — 2026-10-23, commit 52eb5cc (r1 amended)

Scope: finding 1 only. `git diff da19f10 52eb5cc -- libs tools` = `logo.stories.ts` alone; `libs`/`tools` clean against the tip. Storybook build 00:57:43 is newer than the story (00:57:30). Shots: `r2-new` (developer, 360/1280 L/D, 3 opened), `r2-review` (360 L/D, contrast measure).

| AC | Result | Evidence |
|---|---|---|
| AC-13 | pass | `custom-emblem-with-size`: light shows `lifecorner-emblem.svg` (teal `#1a6a79` on canvas `#ffffff` = 6.21:1), dark shows `lifecorner-emblem-on-dark.svg` (white on `#0a121b` = 18.83:1, computed in `--measure`); the r1 failure (1.06:1) is gone |
| AC-3 | pass (re-checked) | `shots-r2-new.log`, 360/1280 L/D: both `<img>` `100`/`100`, visible one `block` 64 × 64, hidden one `none`, both complete, naturalWidth 100 |
| AC-12 | pass (re-checked) | args = design §8 (r1) row: `emblem`, `lg`, the emblem pair, 100/100, alt `'Acme Inc.'`; story text says the kit's files stand in for a brand file and the dark `<img>` shares the pair, plus a usage snippet with the §2 input names |
| AC-1…11, AC-14 | pass | unchanged since round 1 (no `libs`/`tools` change outside the story) |

Gates: the r2 change touches no spec, library or compat file, so build.md's r2 row (lint, `test:tools`, `build-storybook`) is enough; the release gate runs the full set.

### Findings

| # | Severity | Status |
|---|---|---|
| 1 | must-fix | resolved in r2 (evidence above) |

No new findings. No open `should-fix` or `nit` items.

**Verdict:** approved
