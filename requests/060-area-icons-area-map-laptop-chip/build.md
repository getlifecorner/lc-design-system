# Build 060: area icons, `lc-area-map`, laptop device frame, `lc-chip` wrap and on-band palette

- **Branch:** `feat/3.40-area-icons-area-map-laptop-chip` (from `main` 51586aa)
- **Commit:** one commit `feat(area-map,chip,device-frame,icons): request 060` (amended; gates on `c169242`)

## Files changed

| File | Change |
|---|---|
| `scripts/generate-icon-names.mjs`, `icons/icons.data.ts`, `icon/icon-inline-index.data.ts`, `internal/icon-set/icon-inline-tabler.data.ts`, `icons/index.ts`, `bundle-size.mdx` | D-1: 4 keys appended, 6 glyphs (+ filled heart, gift), 150 → 156 (see Deviation 1) |
| `icon.area-icons.spec.ts` (new, 21), `icons.spec.ts`, `icon.trusted-types.spec.ts`, `icon.stories.ts` | glyphs = generator transform of the Tabler files; counts 150 → 156 (§9 list); *Area Icons* |
| `area-map/` (new entry: stub, `index.ts`, component ts/html/scss, spec 28, 8 stories), `src/index.ts`, `entries.spec.ts` 117 → 118, `check-entries.mjs` 124 subpaths | D-2/D-3, §2–§7 |
| `chip/chip.component.{ts,scss}`, `chip.wrap.spec.ts`, `chip.on-band.spec.ts` (new), `chip.stories.ts` (+6, all argTypes with defaults) | `wrap`, `emphasis`/`quiet`, private `--_lc-chip-*` (hooks win from ancestors), in-hero palette |
| `hero/hero.component.scss`, `_theme-light.scss`, `theme-contrast.spec.ts` (060 block), `theme-modes.spec.ts`, `hero.slot-fill.spec.ts` | private `--_lc-hero-ink/-glass/-ring-gap/-band-from`; `lc-hero lc-chip` appended to the light list (D-5) |
| `device-frame/device-frame.component.{ts,html,scss}`, `device-frame.laptop.spec.ts` (new), `device-frame.component.spec.ts`, stories (+4) | D-6 laptop on `::before`/`::after`, notch phone only |
| `tools/compat/template/…/probe-340.ts`, `home.{ts,html}`, `check-angular-majors.mjs` | area map in a hero, 2 `EXPECT_IN_HTML` checks |
| `README.md`, `libs/angular-ui-kit/README.md`, `internationalization.mdx` | Area Map listed; chip, device-frame rows; `ariaLabel` default |

Changed assertions (no weakening): icon counts 150 → 156 and trusted-types 156/157 (new glyphs); `LIGHT_RAIL` and slot-fill selector lists gain `lc-hero lc-chip` (D-5, plus a new "only once" test); device-frame raw-colour list gains the laptop's bezel/hinge/base token values after the phone's two (D-6). Contrast pins are the measured values floored to 2 decimals (design quotes rounded ones, e.g. 17.74 → 17.73).

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1, 3 | `icon.area-icons.spec` + `icons.spec`: 4 `ICON_*` outline, `currentColor`, no size; `*_SOLID` heart/gift; names resolve (`isValidIconName`, inline index). MCP has no icon list; `test:tools` 22 green |
| 2 | spec: glyph = `compact(readFileSync(tabler))`; *Area Icons* 20 and 24 px, 24 labelled, 0 placeholders, axe 0 (L/D) |
| 4, 6 | area-map stories 360/1024/1280 L/D: line centre vs chip centre, line top vs chip bottom, line end vs layer top, max \|Δ\| **0.01** (DE, EN, light hero, two instances); 0 chips over |
| 5 | spec: one `ul role=list` named, links `aria-hidden` empty, no `style`, nothing focusable, axe 0; compat checks written (gate blocked, see Gates) |
| 7 | CSS test of `@supports not` + forced colours; *Without Lines* group/layer rects identical to *On Hero Band* (360: 0/120/308.19/411.19, layer 184+110.19) |
| 8 | `theme-contrast.spec`: white on glass over 18 band ends 6.40–17.73, light hero 12.51; *All Bands* glass `rgba(17,24,39,.24)` on 9 bands L/D |
| 9 | spec anchors per instance + `anchor-scope: all`; *Two Instances* Δ 0.01 in both maps |
| 10 | *On Hero Band* 360 DE: column **320**, height **581.19** (≤ 590); EN 551.19; 1024/1280: 544 × 491 / 459. *Large Text* 200 %: 0 over, no hscroll |
| 11 | `chip.wrap.spec`; *Wrap* one line 24/32/40, sm two lines 41.5, 0 over; *Wrap Large Text* 0 over |
| 12, 16, 19 | `--compare` vs `tmp/story-shots/060/baseline`: **330/330 identical** (hero *Focus Title* 1024 D differed once, identical on rerun: `tmp/060/recheck.log`); default-DOM tests in chip/device-frame specs |
| 13, 14 | *On Hero Bands* L = D: emphasis 9 band fills, min 8.10; default 6.87, primary 8.49, success 4.85 (1 opaque fill each); quiet white ink, border 32 %; spec rows of §5 |
| 15 | *Hooks On An Ancestor*: the wrapper's info pair wins for every variant, off-band and in a hero |
| 17, 18 | `device-frame.laptop.spec`; 360: md/lg 328 wide (screens 280 × 175, 260 × 162.5), sm 320 × 197.5; 1280: 480 × 298, 640 × 393.5; notch 0; rim spec ≥ 4.83/7.31; forced colours: rims CanvasText |
| 20 | axe 0 violations on all 19 new stories (L/D); `--forced-colors`: 0 of 5 lines shown; argTypes complete |
| 21 | READMEs; changelog draft below |

## Gates

All gates ran on `c169242` (later agents skip a gate while `git diff --quiet c169242 -- libs tools` holds). Logs in `tmp/060/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 310 suites, 6462 passed, 8 skipped (was 305 / 6351: +5 suites, +111 tests) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 160 warnings (= baseline) |
| `npx nx run angular-ui-kit:build` | green, 125 entries built (+ area-map) |
| `npm run test:tools` | 22 passed |
| `npx nx run angular-ui-kit:build-storybook` | green, +19 stories |
| Story screenshots | compare `tmp/story-shots/060/build-{a,b}`; new `new-map2` (30), `new-map` (two instances, all bands, on page), `new-rest` (66), `forced` (4) |
| `check-angular-majors.mjs --only=22` | **blocked by the local Node** v23.10.0 (as in 034): install ok, route extraction fails before the app loads (`reading 'exports'`, `tmp/060/compat.log`); Node 24 needs approval here. Release-manager: run it on Node 24 (expect 115 checks: 113 + 2) |

## Deviations from the design

1. **Icon data written by hand, verified.** `npm run generate:icon-names` needs approval in this session. The three generated files hold exactly what the script's transform makes from the Tabler SVGs (asserted byte for byte in `icon.area-icons.spec`). Open: run the script once and check that `git diff --quiet` holds on the three files.
2. **Story layout:** the four hero stories built from `heroTemplate` are full-width page bands (`layout: 'fullscreen'`, `borderRadius="none"`), so the media column is the 320 px of §3 (with canvas padding it was 288 px and 631.48 high).

Open items for review: pre-existing, not changed: `.lc-chip--clickable { font: inherit }` follows the size rules, so clickable sm/md chips use the parent font size (16 px, not 14 px) → BACKLOG. Chip 44 px target premise (§6) → BACKLOG row.

## Changelog draft

### Added

- **`lc-area-map`** (`@lifecorner/angular-ui-kit/area-map`; life-os website-home-vision G-HV2): status groups (badge plus wrapping, centred chips), straight lines from the upper groups' chips into one layer bar (`[area-map-figure]`, `layerTitle`, `layerText`, free content), quieter groups under a divider. CSS anchor positioning only: no JS, no inline `style`, all in prerendered HTML; lines `aria-hidden`, one named `<ul role="list">` (`ariaLabel`, default „Areas and their status“). Several maps per page (`anchor-scope`). DE reference at 360 px: 320 × 581 px; lines hit chip centre and layer edge within 0.01 px at 360/1024/1280. On the nine bands the layer is a dark glass, white text 6.40:1 or more; on a light hero a white glass, 12.51:1 or more. `lines="false"`, browsers without anchor positioning and forced colours hide the lines and keep the layout. Hooks `--lc-area-map-line-color`, `-layer-bg`, `-layer-border`, `-divider-color`.
- **`lc-device-frame` `device="laptop"`** (G-SS1 extended): lid with bezel over a wider base, `sm`/`md`/`lg` = 320/480/640 px, never wider than the container (md in a 328 px column: screen 280 × 175). Hooks `--lc-device-frame-base-color`, `-overhang`, `-base-height`; `notch` is phone only.
- **`lc-chip` `wrap`** (G-HV3, WCAG 1.4.10): a long label wraps onto centred lines; one-line chips keep 24/32/40 px; no chip overflows at 320 px and 200 % text.
- **`lc-chip` `variant="emphasis"` and `"quiet"`** (G-HV4): emphasis a solid fill, white ink (6.21:1); quiet transparent, thin border.
- **Icons** `ICON_SHOPPING_BAG`, `ICON_TARGET`, `ICON_HEART`, `ICON_GIFT`, `ICON_HEART_SOLID`, `ICON_GIFT_SOLID` (G-HV1; 156 glyphs).

### Changed

- **Chips in `lc-hero`** take an on-band palette in both themes (G-HV4): emphasis the band's dark stop (8.10:1 or more), status variants the light palette (4.85:1 or more), quiet white ink. Before, they measured 1.78–10.29:1 in dark theme.
- **`--lc-chip-bg/-fg/-border` set on an ancestor** now apply, as the chip's style comment always promised (before, the variant class won).

### Compatibility

- No API breaks; peer range unchanged. Chips outside a hero, phone frames and all other stories render as 3.39 (330 screenshots identical). Apps with `unregistered: 'placeholder'` now get the four glyphs.
