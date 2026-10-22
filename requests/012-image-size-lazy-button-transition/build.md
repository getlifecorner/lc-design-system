# Build 012: Intrinsic image size and lazy loading for logo, character and avatar, and a narrower button transition

- **Branch:** `fix/3.11.2-image-size-lazy-button-transition` (from `main` `3974660`, 3.11.1)
- **Commit:** branch tip, `fix(logo): intrinsic image size for logo and avatar, lazy loading for character and avatar, colour-only button transitions`

## Files changed

| File | Change |
|---|---|
| `lib/logo/logo.component.{ts,html}` | inputs `srcWidth`, `srcHeight`, `emblemSrcWidth`, `emblemSrcHeight` (transform `toIntrinsicSize`, design §2); `[attr.width]`/`[attr.height]` per `<img>` from the file it shows (`lightSize`/`darkSize`: lockup 485 × 100, emblem 24…96 squared, custom pair or none); JSDoc of the class and `size` |
| `lib/character/character.component.{ts,html}` | type `CharacterLoading`, input `loading` (default `'eager'`); `[attr.loading]` (only `lazy`) placed before `[attr.src]` on all three `<img>` |
| `lib/avatar/avatar.component.{ts,html}` | type `AvatarLoading`, input `loading`; `<img>` gets `[attr.width]`/`[attr.height]` = 24/32/40/48/64 from `size`, `[attr.loading]` before `[attr.src]`; JSDoc of `size` (+ `@default 'md'`) |
| `lib/button/button.component.scss` | `.btn`: `transition: all …` → `transition-property: color, background-color, border-color, box-shadow` + `transition-duration`/`-timing-function` longhands (same tokens) |
| stories: `logo`, `avatar`, `character`, `button` | §8: `CustomLockupWithSize`, `CustomEmblemWithSize`, `ImageSizes`, `LazyImage`, `LazyLoading`; argTypes for the 4 logo inputs and both `loading`; logo docs "Intrinsic size" + table; one line in the button docs |
| new `logo.intrinsic-size.spec.ts`, `character.loading.spec.ts`, `avatar.image.spec.ts`; `button.styles.spec.ts` (+4) | see AC table; no existing assertion changed |
| `tools/compat/`: `check-angular-majors.mjs`, new `probe-3112.ts`, `home.{ts,html}` | `imagesCarry()` + 4 `EXPECT_IN_HTML` rows; probe with `#compat-avatar` and `#compat-character-lazy`; `id="compat-logo"` on the home page's `<lc-logo />` |
| r2: `lib/logo/logo.stories.ts` | review finding 1, design §8 (r1): `CustomEmblemWithSize` uses `emblemSrc` `/assets/lifecorner-emblem.svg` + `darkEmblemSrc` `/assets/lifecorner-emblem-on-dark.svg`, pair 100/100; story text: the kit's emblem files stand in for a brand file, the dark `<img>` shares the pair, plus a usage snippet |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | `logo.intrinsic-size.spec.ts`: xs…xl × 2 imgs (`auto`) = 485/100, ratio 4.85; `light`/`dark` 1 img; both lockup SVGs are 485 × 100 |
| AC-2 | same spec: emblem xs…xl × 2 imgs = 24/32/48/64/96 squared (normal and small drawing); emblem files 100 × 100 viewBox |
| AC-3 | same spec: custom src without inputs → no attributes; pair on light and dark; one value → none; `'160'`, 159.6, `' 42 '` accepted; 0, −10, NaN, ∞, `''`, `'abc'`, null, undefined → none; pairs follow the variant; dark emblem shares the pair; mixed `darkSrc`-only case |
| AC-4 | design §9 probe, `components-logo--sizes`, `--emblem-sizes`, `navigation-header--logo-sizes`, 360/1280, light/dark: pending = loaded = baseline at every size (lockup 116.391 / 155.188 / 232.797 / 310.391 / 465.594 × 24…96; emblem 24…96 squared) |
| AC-5 | `character.loading.spec.ts`: default eager, no attribute; `auto` 2 imgs / `dark` 1 img lazy; `loading` before `src` on first render (both modes) and in the template; back to eager removes it; width/height/decoding/fetchpriority/alt/aria unchanged |
| AC-6 | `avatar.image.spec.ts`: 24/32/40/48/64 per size, default md 40; compiled SCSS box rem × 16 = attribute; story `image-sizes` 360/1280 light/dark: boxes 24…64 = attributes |
| AC-7 | same spec: default no attribute; `lazy` before `src`; `(error)` → initials "TE"; no `src` → initials, no img |
| AC-8 | `button.styles.spec.ts` (G-41, 4 tests: list, duration/timing tokens, no `transition: all`/shorthand left, inline list kept); computed on `components-button--all-variants`: `color, background-color, border-color, box-shadow` / `ease-in-out` |
| AC-9 | protocol below: t0 = t500 and card0 = card500 at 360/1024/1280, DE and EN; colour toggle still animates `background-color color` |
| AC-10 | compat 22: 4 new rows ok (home logo 2 × 485/100; header emblem 48/48; avatar 48/48 lazy; character 2 × lazy) |
| AC-11 | unit: no `loading` by default, attribute lists pinned (logo, avatar, character); hash compare: 516 / 516 identical to 3.11.1 |
| AC-12 | §8 stories with argTypes (`description`, `table.defaultValue`); JSDoc + `@default` on all 6 inputs; `test:tools` 22/22 |
| AC-13 | unit: alt, role, aria-label, aria-hidden, decorative unchanged with `lazy` and sizes; no `style` attribute; no SCSS change in logo/avatar/character (no new forced-colors rule). r2: `custom-emblem-with-size` shows `lifecorner-emblem.svg` in light and `-on-dark.svg` in dark (360/1280), both `<img>` 100/100, visible one 64 × 64 |
| AC-14 | changelog draft below |

## Gates

Ran on the working tree committed as the branch tip; later agents skip a gate while `git diff --quiet fix/3.11.2-image-size-lazy-button-transition -- libs tools` holds. Logs in `tmp/012/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 164 suites, 4118 passed, 8 skipped (new: 3 suites + 4 tests in `button.styles.spec.ts`, 62 tests) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (unchanged) |
| `npx nx run angular-ui-kit:build` | ok, 119 entries |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | ok |
| Story compare, 86 baseline stories × 360/1024/1280 × light/dark, `--full`, vs `tmp/story-shots/012/baseline` | **516 of 516 identical** (`tmp/story-shots/012/r1-compare`), incl. the 3 network stories |
| New stories | `tmp/story-shots/012/r1-new/` (5 stories, 360/1280, light/dark, with attribute measures) |
| `check-angular-majors.mjs --only=22` | PASS, Angular 22.2.3; 62 HTML checks ok (58 + 4 new) |
| **r2** (story-only change, amended into the same commit) | lint 0 errors, 162 warnings; `test:tools` 22/22; `build-storybook` ok; `tmp/story-shots/012/r2-new/` (`custom-emblem-with-size`, 360/1280, light/dark; `tmp/012/shots-r2-new.log`). Test, build and compat 22 not repeated: no `*.stories.ts` is in a spec (only `code-block`'s), the library or the compat app |

AC-9 (`tmp/story-shots/012/r1-ac9-all`, `r1-ac9-en`; light, 150 ms restored), boxes w × h:

| Story, width | rest | t0 = t500 | card → card0 = card500 |
|---|---|---|---|
| default DE 360 | 291×35.5 ×2 | 291×48.5 ×2 | 216.38 → 242.38 |
| default DE 1024/1280 | 203.02×35.5, 93.59×35.5 | 264.86×48.5, 134.31×48.5 | 78.88 → 82.5 |
| default EN 360 | 183.36×35.5, 99.64×35.5 | 291×48.5 ×2 | 172.88 → 242.38 |
| default EN 1024/1280 | 166.28×35.5, 82.55×35.5 | 219.19×48.5, 120.67×48.5 | 78.88 → 82.5 |
| large-built-in DE 360 | 291×48.5 ×2 | 114.95×35.5, 168.05×38 | 220.69 → 153.69 |
| large-built-in DE 1024/1280 | 130.03×48.5, 195.63×48.5 | 94.94×35.5, 148.02×38 | 82.5 → 78.88 |

## Deviations from the design

None in what renders. For the designer:

1. `ImageSizes` labels use `color: var(--color-text-secondary)` instead of `AllSizes`' `#666` (readable in dark); otherwise labelled as `AllSizes`.
2. AC-9 protocol: the §9 version toggles and reads each CTA in turn, so at 360 in `--large-built-in-actions` the first CTA is read while the second is still `lg` (291 wide, stacked): t0 291 vs t500 114.95, a layout of the half-toggled row, not a transition. The table above toggles all CTAs first, then reads (`r1-ac9` keeps the §9 output). `props` lists only `font-size@LC-ICON`: the icon in a CTA "transitions" for 0.01 ms because story-shots emulates reduced motion and the global rule sets `transition-duration: 0.01ms` on `*` (initial `transition-property: all`); lc-icon has no transition of its own. No `padding-*`, and no `.btn` size property.
3. Resolved in r2 (review finding 1, design §8 r1): the story now uses the kit's emblem pair, so it reads in dark.
4. `LazyLoading` in light: the hidden dark drawing is fetched too, because Storybook's root has no theme class before the decorator sets `.light` (dark-first default shows the dark drawing in the first frame). In dark, the hidden light drawing stays unfetched (`complete` false).

## Changelog draft

```markdown
## [3.11.2] - 2026-10-23

Intrinsic image size for lc-logo and lc-avatar, lazy loading for lc-character and lc-avatar, and buttons that no longer grow on load (G-38, G-39, G-40, G-41; life-os website v0). No API breaks.

### Added

- **`loading` on `lc-character`** (G-39, `'eager' | 'lazy'`, default `'eager'`, type `CharacterLoading`): `lazy` writes `loading="lazy"` on every drawing, for Edu below the fold such as on the horizon. In `colorMode="auto"` the browser then fetches only the drawing of the current theme. `eager` writes no attribute, as before.
- **`loading` on `lc-avatar`** (G-40, same values, type `AvatarLoading`): `lazy` writes `loading="lazy"` on the image, for an avatar below the fold (the person card). The initials still replace an image that fails.
- **`srcWidth` / `srcHeight` and `emblemSrcWidth` / `emblemSrcHeight` on `lc-logo`** (G-38, default unset): the intrinsic size of your own `src` / `darkSrc` and `emblemSrc` / `darkEmblemSrc` files, written as the `<img>` `width` / `height` when both of a pair are set (`srcWidth="160"` works too). Without them a custom logo has no size attributes, as before.

### Fixed

- **Built-in `lc-logo` images carry `width` and `height`** (G-38): the lockup 485 × 100 (the file's own size) at every size, the emblem the size's px squared (24, 32, 48, 64, 96), on the light and the dark image. The browser now reserves the logo's box before the SVG arrives: pending box = loaded box at every size (lockup 116.391 / 155.188 / 232.797 / 310.391 / 465.594 × 24 / 32 / 48 / 64 / 96 px; before, it was 0 px wide until the file loaded). The loaded logo is the same size as in 3.11.1 (360 / 1280 px, light and dark), also inside `lc-header`.
- **`lc-avatar` images carry `width` and `height`** (G-40): the size's px (xs 24, sm 32, md 40, lg 48, xl 64). CSS still sizes the circle, so the rendered avatar is unchanged; at 200 % text the box grows and the attributes only give the 1:1 ratio.
- **`.btn` animates only `color`, `background-color`, `border-color` and `box-shadow`** (G-41), 150 ms ease-in-out as before. With `transition: all`, the first layout inside `lc-next-step-card` animated padding and font size, so the CTAs grew for 150 ms and the page height depended on timing (measured in 3.11.1: the card at 360 px still 216.38 px high in the first frame of a 242.38 px layout, +26 px over 150 ms). Now the first frame equals the frame 500 ms later (0 px) at 360 / 1024 / 1280 px, German and English. Hover, active and the shadow still animate.

### Compatibility

- No API breaks. A patch by the owner's decision (2026-10-23), although it adds optional inputs. All 516 logo, avatar, avatar-group, character, button, button-link, next-step-card, header and sidenav screenshots (360 / 1024 / 1280, light and dark) are identical to 3.11.1.
- New default markup: built-in `lc-logo` images and every `lc-avatar` image now have `width` / `height`; `lc-character` and `lc-avatar` have no `loading` attribute unless you set `lazy`. A test that pins the exact attribute list of these images sees the two new attributes. `lc-character` and `lc-avatar` now bind the image source as an attribute after `loading` (same URL sanitisation), so a lazy image is never requested before the browser knows it is lazy.
- Buttons: the focus outline, the disabled / loading opacity, padding and font size now change at once instead of fading over 150 ms.
- `lc-header` and `lc-sidenav` don't forward the four logo size inputs (built-in logos in them are sized), and `lc-avatar-group` and the header avatars don't forward `loading`; ask for a follow-up if you need either.
- The attributes are in the prerendered HTML (consumer check on Angular 22; the release gate adds 21), with no inline style or script, so they hold under a strict CSP.

### Migration

- life-os website: drop the page-level `G-41` rule (`transition: none` on the CTA buttons). Set `loading="lazy"` on Edu above the horizon and on the how-we-build person card's avatar; a custom logo gets `srcWidth` / `srcHeight` (and the emblem pair) from its file.
```
