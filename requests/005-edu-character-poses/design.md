# Design 005: Edu's character poses as kit assets (G-4)

- **Status:** ready
- **Change 2026-10-19 (review r1):** §5 band rule: t is taken at the box centre, and a short, wide band is too light at its right end. §8 OnDarkSurface: the card is `--color-surface` (white or `#101c26`, like the website's next-step card), not a white card, and Hallo stands on its top-left corner (the top-right one is at t 0.82–0.85 from 1024).
- **Spec:** [spec.md](spec.md) — AC-1 … AC-21

## 1. Approach

New and additive. There are three deliveries built from one set of files. Nothing that exists today changes its rendering.

| Delivery | Where | Pattern followed | Why |
|---|---|---|---|
| 28 files `<pose>-light.svg` / `<pose>-dark.svg` (14 poses) | `src/assets/character/`, plus `exports` key `./assets/character/*` → `./src/assets/character/*` | `lc-logo`'s `src/assets/lifecorner-*.svg` | `<img>` / `<picture>` without JS (AS-15). `ng-package.json` already copies `src/assets/**` |
| SVG strings | new entry `@lifecorner/angular-ui-kit/character-svg` (folder `src/lib/character-svg/`, imports nothing from Angular) | the `tokens` entry (plain TS) | A partially compiled Angular FESM throws when plain Node imports it (`ɵɵngDeclare*` needs the JIT facade). So the strings can't share an entry with a component (AC-4) |
| `lc-character` | new entry `@lifecorner/angular-ui-kit/character` | `lc-logo`: two `<img>`, the root theme picks one with the same selectors, and a base-path token | No `[innerHTML]` and no Trusted Types policy (AC-13). It prerenders as plain `<img>` (AC-14). No SVG string ever reaches an app bundle through the component |
| `.lc-horizon__figure` | `src/styles/_horizon.scss` | `.lc-horizon__land`: a child class plus custom-property inputs with breakpoint defaults | Spec assumption; CSS only, so it works on the static page |

Decisions (recorded; none needs the owner):

- **D1** `lc-character` renders `<img>`, not inline SVG. The cost is that `colorMode="auto"` requests both drawings (about 1.3 KB each), as `lc-logo` does.
- **D2** `size` is a px union `48 | 64 | 80 | 96 | 128`, and the string forms are accepted (`size="96"`). The five steps the concepts name don't fit `lc-logo`'s names: md 48, lg 64 and xl 96 leave no name for 80 or 128. Every consumer document gives the sizes in px.
- **D3** `pose` defaults to `calm`, the neutral Edu (open eyes, small smile).
- **D4** The dark rule is attribute-based (§5), not a colour map, because `#ffffff` and `#84c7d4` each play three roles. Checked by hand: the rule reproduces all 4 drawn dark files (hello, shows-the-way, happy, calm) byte for byte, and the peeks-around-corner pair for the wall colours.
- **D5** An accent *fill* in `#84c7d4` that has no ring and no opacity becomes `#4f9aaa`, like the accent lines. This covers thinking's thought dots and connection-paused's arrow head. The README names only lines, but a dot or arrow head belongs to the same accent. The 5 later poses ship (spec assumption).
- **D6** Feet: in the standing poses the points end at y 87.5 (cy 82 + r 5.5). The slot therefore puts the box bottom 12.5 % of its size below the line, which is the same rule as the website's card corner ("box top 87.5 % above the card"). One rule covers every pose. in-his-corner's own floor line (y 92) then lies 4.5 % below the horizon line (2.9 px at 64, 5.8 px at 128), so he sits in his corner in front of the line. No per-pose API.
- **D7** Forced colours: a decorative figure is hidden with `visibility: hidden` and keeps its box (app-shell 5.4 rule 4; `.lc-horizon` drops its decoration too). A labelled figure (`ariaLabel`) stays visible, and browsers never recolour an image.
- **D8** A generator `scripts/generate-character-assets.mjs` sits next to `generate-icon-names.mjs`, the existing precedent for generated library data. It writes the 10 rule-made dark files and `src/lib/character-svg/character-svg.data.ts`, and fails on any colour or attribute pattern that §5 doesn't list. The 14 light files and 4 drawn dark files are copied from `life-os/docs/brand/character/` unchanged, once. Record their sha256 values in build.md.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | `pose` | `CharacterPose` | `'calm'` | Which pose to draw: hello, shows-the-way, happy, welcomes-member, resting, in-his-corner, comforts, all-done, calm, connects, discovered, thinking, connection-paused, see-you. |
| input | `size` | `CharacterSize`; also accepts `` `${CharacterSize}` `` (transform `Number`) | `64` | Edge of the square box in px. `--lc-character-size` overrides it; set that hook per breakpoint in CSS. |
| input | `colorMode` | `CharacterColorMode` | `'auto'` | `auto`: both drawings in the DOM; the root theme shows one (light, dark, system). `dark`: only the on-dark drawing, in both themes, for a fixed dark surface such as the hero band. |
| input | `ariaLabel` | `string` | `''` | Empty: decorative (`aria-hidden="true"`). Set: `role="img"` with this name. This is your own translated text; the kit ships none. |
| token | `LC_CHARACTER_BASE_PATH` | `InjectionToken<string>` | `inject(LC_LOGO_BASE_PATH)` (trailing `/` removed) + `'/character'` → `/assets/character` | The URL folder that holds the pose files. It follows your logo setup unless you set it. |
| CSS hook | `--lc-character-size` | `<length>` (not %) | unset → the `size` input | Width and height of the box. Inherits, so it can be set on a wrapper inside a media query. |
| CSS hook | `--lc-horizon-figure-size` | `<length>` | 64 px; 96 px from 1024; 128 px from 1920 | Figure size in `.lc-horizon__figure` (app-shell 5.4 A). |
| CSS hook | `--lc-horizon-figure-gap` | `<length>` | 16 px; 24 px from 1024 | Distance from the figure's right edge to the sun's left edge. |
| class | `.lc-horizon__figure` | — | — | Goes on a **direct child** of `.lc-horizon`: `lc-character`, `<img>`, `<picture>`, or an element that holds an inline `<svg>`. |
| types (`character`) | `CharacterSize`, `CharacterColorMode` | `48 \| 64 \| 80 \| 96 \| 128`, `'auto' \| 'dark'` | — | `CharacterPose` is re-exported as a type only (`export type {…}`), so there is no runtime edge to `character-svg`. |
| types (`character-svg`) | `CharacterPose`, `CharacterDrawing`, `CharacterSvgPair` | the 14 names in §8 order; `'light' \| 'dark'`; `{ readonly light: string; readonly dark: string }` | — | — |
| consts (`character-svg`) | `CHARACTER_POSES`, `CHARACTER_SVG`, `CHARACTER_SVG_<POSE>` (14, e.g. `CHARACTER_SVG_COMFORTS`, `CHARACTER_SVG_SHOWS_THE_WAY`) | `readonly CharacterPose[]`, `Readonly<Record<CharacterPose, CharacterSvgPair>>`, `CharacterSvgPair` | — | Plain object literals, **no `Object.freeze` call**, so an unused pose tree-shakes away (`sideEffects` already excludes JS). Each string equals its file, including the trailing newline. |

No outputs and no content slots. Host classes: `lc-character`, `lc-character--<size>`. Host attributes: `aria-hidden="true"`, or `role="img"` + `aria-label`. `src/index.ts` gets two lines (`character`, `character-svg`). The `character` entry imports only `@angular/core` and the `logo` token; `header`, `logo` and `empty-state` don't import it (AC-5).
Default rendering unchanged: the entries and files are new. `.lc-horizon` only gains custom properties and a `:has(> .lc-horizon__figure)` rule, so a block without the figure keeps its current CSS result (AC-15, AC-20).

## 3. Anatomy and layout

### Component (any width)

```
lc-character  display:block · flex:none · width = height = var(--lc-character-size, <size>px) · aspect-ratio:1
├─ img.lc-character__img.lc-character__img--light   only with colorMode auto
│     src = {base}/{pose}-light.svg · alt="" · aria-hidden="true" · width="100" height="100"
│     decoding="async" · fetchpriority="low" · display:block · 100 % × 100 % · object-fit:contain · pointer-events:none
└─ img.lc-character__img.lc-character__img--dark    display:none unless the root theme is dark (same 3 selectors as lc-logo)
```

The theme selectors are copied verbatim from `logo.component.scss`: dark under `:root.dark`, `:root:not(.light):not(.system)`, and `:root.system` with OS dark. With `colorMode="dark"` the template renders only the dark `<img>`, without the modifier, so it is always shown. Sizes come from host classes, not a `style` attribute (strict CSP, prerender).

### `.lc-horizon__figure` at 360 px (default geometry, block 360 wide)

```
x 0              121.2        185.2  201.2          259.2                       360
┌────────────────────────────────────────────────────────────────────────────────┐ ─┬─
│ sky                                                                            │  │ above the line ≥ max(r+22, s+8)
│                  ┌── s 64 ──┐  gap 16  ╭──── sun r 58 ────╮                   │  │ = max(80, 72) = 80 px
│                  │   Edu    │◄────────►│        ·          │                   │  │
│━━━━━━━━━━━━━━━━━━│━━ feet ━━│━━━━━━━━━━┷━━━━━━━━━━━━━━━━━━━┷━━━━━━━━━━━━━━━━━━━│ ─┼─ line (2 px, centred on the land's top)
│ land 112         └──────────┘  8 px = 12.5 % of s below the line              │  │
└────────────────────────────────────────────────────────────────────────────────┘ ─┴─ block min-height 192 (unchanged)
```

### 1024 / 1280 / 1440 / 1920 px (block = viewport width, sun-x 72 %)

| Width | land | r | gap | s | sun left | fig right · left | box bottom above block bottom | above line max(r+22, s+8) | min-height with figure · without |
|---|---|---|---|---|---|---|---|---|---|
| 360 | 112 | 58 | 16 | 64 | 201.2 | 185.2 · 121.2 | 104 | 80 | 192 · 192 |
| 1024 | 100 | 70 | 24 | 96 | 667.3 | 643.3 · 547.3 | 88 | **104** | **204** · 192 |
| 1280 | 120 | 90 | 24 | 96 | 831.6 | 807.6 · 711.6 | 108 | 112 | 232 · 232 |
| 1440 | 140 | 120 | 24 | 96 | 916.8 | 892.8 · 796.8 | 128 | 142 | 282 · 282 |
| 1920 | 184 | 166 | 24 | 128 | 1216.4 | 1192.4 · 1064.4 | 168 | 188 | 372 · 372 |

| Element | Rule | Value |
|---|---|---|
| `.lc-horizon` (added) | `--_lc-horizon-fig: var(--lc-horizon-figure-size, 64px)`, `--_lc-horizon-fig-gap: var(--lc-horizon-figure-gap, 16px)`; inside the existing media blocks: 96px / 24px at 1024, 128px at 1920 | px, not rem: at 200 % text the figure keeps its size |
| `.lc-horizon:has(> .lc-horizon__figure)` | `min-height: calc(var(--_lc-horizon-land) + max(var(--_lc-horizon-r) + 22px, var(--_lc-horizon-fig) + 8px))` | only blocks with the figure |
| `.lc-horizon__figure` | `position:absolute; right: calc(100% - var(--_lc-horizon-x) + var(--_lc-horizon-r) + var(--_lc-horizon-fig-gap)); bottom: calc(var(--_lc-horizon-land) - var(--_lc-horizon-fig) * 0.125); width/height: var(--_lc-horizon-fig); --lc-character-size: var(--_lc-horizon-fig); pointer-events:none` | in the slot, the slot sizes the figure; the `size` input doesn't |
| `.lc-horizon__figure > :is(img, svg)` | `display:block; width:100%; height:100%` | for `<picture>` and inline SVG |
| DOM order | put the figure **before** `.lc-horizon__land` | the land's content paints over the figure's lowest 12.5 % |

## 4. States

| State | Behaviour |
|---|---|
| default | still drawing; nothing animates or transitions, in any file or rule |
| hover · focus-visible · active · disabled | none: never focusable, no `tabindex`, no pointer target (`pointer-events:none` on the images and the slot) |
| loading | the box is reserved before the file arrives (fixed width/height from prerendered CSS); an empty square, no placeholder |
| error (404, wrong base path) | `alt=""` means no broken-image icon; the box stays empty and the page reads the same |
| empty | n/a; an unknown pose from untyped code is the error case above |
| overflow | the box never grows or shrinks (`flex:none`). At 360 in the slot the figure's left edge is 121.2 (s 64) or 89.2 (s 96), so there's no horizontal overflow. No text, so German length is n/a |
| forced colours | decorative: `visibility:hidden`, box kept (D7); the slot does the same; labelled: visible, as drawn |
| reduced motion | identical render (there is no motion) |

## 5. Theming

| Element | Light drawing | Dark drawing | Contrast (WCAG formula, computed by hand at 4 decimals; the AC-11 spec recomputes it) |
|---|---|---|---|
| body, arms, rings | `#1a6a79` (= primary-600) | `#84c7d4` (= primary-400) | light: on `#ffffff` **6.21**, on `--color-background-low` `#f6fafb` **5.91**. Dark: on `--color-background-low` `#0f1c26` **9.14**, on `--color-background` `#0a121b` **9.95**, on `--color-surface` `#101c26` **9.13** |
| `colorMode="dark"` on the hero band (`#0d353d` → `#208497`, 135°, t = (x+y)/(w+h)) | — | `#84c7d4` in both themes | **6.97** at t 0, **3.55** at t 0.60 (the concept's 3.5–3.6), **3.01** at t 0.75, **2.31** at t 1. Rule for the docs: keep the box centre at t ≤ 0.75. The top-right corner of a band is at t = w / (w + h) (0.88 at 1280 × 168), so on a short, wide band put him left of the right end |
| eyes, mouth `#0c1722`; gold `#e8b04a`; eye whites `#ffffff` | as drawn | unchanged | decorative |

Dark rule (D4, D5). Each line reads the attributes of **one tag** in the light file, before any replacement. A colour or combination not listed here makes the generator and the spec fail.

| # | Light attribute | Condition on the same tag | Dark |
|---|---|---|---|
| 1 | `stroke="#1a6a79"` | — | `#84c7d4` |
| 2 | `fill="#1a6a79"` | — | `#84c7d4` |
| 3 | `fill="#ffffff"` | `opacity="0.14"` (head highlight) | fill kept, `opacity="0.22"` |
| 4 | `fill="#ffffff"` | `stroke="#1a6a79"` (open point) | `#0a121b` |
| 5 | `fill="#ffffff"` | otherwise (eye white) | kept |
| 6 | `fill="#84c7d4"` | `opacity="0.55"` (cheek) | `#1a6a79` |
| 7 | `fill="#84c7d4"` | `stroke="#1a6a79"` (lit point) | kept |
| 8 | `fill="#84c7d4"` | otherwise (accent dot, arrow head) | `#4f9aaa` |
| 9 | `stroke="#84c7d4"` | — (dashes, arcs) | `#4f9aaa` |
| 10 | `stroke="#cfe0e4"`, `stroke="#d3e2e6"` | — (corner, wall lines) | `#2a4250` |
| 11 | `fill="#e9f1f3"` | — (wall) | `#13222e` |
| 12 | `#0c1722`, `#e8b04a`, `none`, every other attribute | — | kept |

Drawn dark files (copied): hello, shows-the-way, happy, calm. Made by the rule: welcomes-member, resting, in-his-corner, comforts, all-done, connects, discovered, thinking, connection-paused, see-you. **No new tokens.** The files are artwork with literal colours, like the logo files, and the component CSS uses no colour at all.

## 6. Accessibility

- **Semantics:** decorative by default: host `aria-hidden="true"`, no `role`, no `tabindex`, no `<title>`; each `<img>` has `alt=""` and `aria-hidden="true"`. With `ariaLabel`, the host is `role="img"` with `aria-label` and without `aria-hidden`, and the images stay `alt=""`, so the name is read once. A visible figure never carries meaning alone (docs).
- **Keyboard and focus:** never focusable. In the slot the figure is outside the tab order, and the land footer's links keep their order (AC-16).
- **44 px targets:** n/a (not interactive). **Announcements:** none.
- **forced-colors:** `@media (forced-colors: active) { :host([aria-hidden='true']) { visibility: hidden } }`, and `.lc-horizon__figure { visibility: hidden }`.
- **prefers-reduced-motion:** nothing to reduce. Neither the files nor the CSS has an `animation`, `transition`, `<animate*>` or `<set>`.

## 7. Texts

| Key / input | EN default | DE |
|---|---|---|
| — | none: the component has no built-in text (AC-18) | — |
| `ariaLabel` (consumer text, example in the stories) | "Edu waves" | „Edu winkt" |

The pose names in the docs table carry the German brand names (Hallo, Zeigt den Weg, …, Bis bald). They are documentation, not UI.

## 8. Stories

`Components/Character` (beside Logo). Every argType has a `description` and a `table.defaultValue`. The component description is the docs page: it covers the 5 delivery forms (copy with Angular `assets`, `<img>`, `<picture>` with `prefers-color-scheme` (OS only, not the app theme class), bundler import `@lifecorner/angular-ui-kit/assets/character/<file>` (Angular `loader` `.svg: file|text`, Node `createRequire().resolve`), and the `character-svg` string), the pose table (id, DE name, drawn/rule), sizes, the card-corner recipe (wrapper `position:relative` with the room as `padding-top`; figure absolute, `right:16px`, `top: calc(room - 0.875 * size)`), the static-page recipe (inline both strings in `aria-hidden` spans plus a `prefers-color-scheme` rule), the band rule t ≤ 0.75, and forced colours.

| Story (export) | Expected ID | Args | Shows |
|---|---|---|---|
| Playground | `components-character--playground` | calm, 64, auto, '' | the controls |
| AllPoses | `components-character--all-poses` | — | 14 poses at 64 in a wrapping grid, gap `--spacing-6`, caption `id · DE name` in `--font-size-xs` |
| Hello, ShowsTheWay, Happy, WelcomesMember, Resting, InHisCorner, Comforts, AllDone, Calm, Connects, Discovered, Thinking, ConnectionPaused, SeeYou | `components-character--hello` … `--shows-the-way`, `--happy`, `--welcomes-member`, `--resting`, `--in-his-corner`, `--comforts`, `--all-done`, `--calm`, `--connects`, `--discovered`, `--thinking`, `--connection-paused`, `--see-you` | `pose` | the pose at 64 and 96 side by side (gap `--spacing-6`, bottoms aligned); light and dark through the theme |
| Sizes | `components-character--sizes` | — | 48 · 64 · 80 · 96 · 128 with px captions, `flex-wrap`, gap `--spacing-4` |
| ResponsiveSize | `components-character--responsive-size` | — | a wrapper sets `--lc-character-size` 64 → 96 (≥ 1024) → 128 (≥ 1920) in a media query; no input |
| OnDarkSurface | `components-character--on-dark-surface` | hello, `dark` | `lc-hero` default primary `size="sm"` `borderRadius="none"`, a `--color-surface` card in `[hero-media]` with Hallo at 64 on its top-left corner (24 px room, left 16 px): box centre t 0.35 · 0.59 · 0.66 at 360 · 1024 · 1280 |
| WithLabel | `components-character--with-label` | `ariaLabel="Edu waves"` | the semantic variant |
| StaticFiles | `components-character--static-files` | — | a plain `<img>` and a `<picture>` from `/assets/character/` next to `lc-character`, all hello at 64 |
| Horizon: WithFigure | `design-tokens-horizon--with-figure` | pose comforts | default geometry, full width, no fixed height (the block is at its min-height); the figure is an `lc-character.lc-horizon__figure` |
| Horizon: FigureAndFooter | `design-tokens-horizon--figure-and-footer` | pose in-his-corner | phone, `--lc-horizon-land:136px`, the figure before a `.lc-horizon__land` footer with 2 links; the block is not `aria-hidden` |

The existing stories stay byte-identical: Horizon `--phone`, `--footer-on-the-land`, `--desktop`, Logo, Header, Empty State, App Shell.

## 9. Verification

**Baseline (developer, step 0):** I could not capture it. In this headless run `npx nx run angular-ui-kit:*` resolves the life-os workspace ("Cannot find project 'angular-ui-kit'"), and story-shots refuses the stale build. Before changing any file, on `main` at 87e45ba: `npx nx run angular-ui-kit:build-storybook`, then `node tools/agents/story-shots.mjs --stories=design-tokens-horizon--phone,design-tokens-horizon--footer-on-the-land,design-tokens-horizon--desktop,layout-app-shell--today-phone,layout-app-shell--today-desktop,components-logo--light-and-dark,components-logo--sizes,components-logo--on-dark-background,navigation-header--default,navigation-header--public-site-phone,feedback-empty-state--no-results,feedback-empty-state--sizes --widths=360,1024,1280,1920 --out=tmp/story-shots/005/baseline`. Don't open the shots.

| AC | How | Expected value |
|---|---|---|
| AC-1 | Jest over `src/assets/character/`; list `dist/libs/angular-ui-kit/src/assets/character/` after the build | 28 files; each has `width="100" height="100" viewBox="0 0 100 100"`; 0 hits for `<script`, `<style`, ` on[a-z]+=`, `<animate`, `<set`, `href=`, `<text`; largest ≤ 30 720 B (light sources 1035–1737 B) |
| AC-2 | Jest: rule §5 applied to each light file === its dark file (the 4 drawn ones prove the rule); build.md: sha256 of the 18 copied files = life-os sources | 14 / 14 equal |
| AC-3 | compat consumer: an angular.json `assets` glob `node_modules/@lifecorner/angular-ui-kit/src/assets/character` → `compat-logo/character`; Node `createRequire(consumer).resolve('@lifecorner/angular-ui-kit/assets/character/hello-light.svg')` | file in the browser output; resolve succeeds through `exports` |
| AC-4 | Jest: `CHARACTER_SVG[p][d]` === file; compat Node step `import('@lifecorner/angular-ui-kit/character-svg')` prints `CHARACTER_SVG_HELLO.light.slice(0, 4)`; grep the entry's FESM | prints `<svg`; 0 imports of `@angular` |
| AC-5 | build (no TS6059); grep the `header`, `logo`, `empty-state` FESMs for `character`; `tools/compat/bundle-size.mjs` header-only before / after | 0 hits; 0 B difference |
| AC-6 | unit test; axe on `--hello`, `--with-label` | as §6; 0 violations |
| AC-7 | `--sizes` at 360 and 1280: `[...document.querySelectorAll('lc-character')].map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height]})`; on `--hello`, the rect before and after `host.querySelectorAll('img').forEach(i=>i.remove())` | `[[48,48],[64,64],[80,80],[96,96],[128,128]]`; rects equal |
| AC-8 | unit test (host class per size, string `'96'` → class `lc-character--96`); `--responsive-size` at 360, 1024, 1920 | widths 64 / 96 / 128 |
| AC-9 | `--hello`, themes light and dark: the `src` of the images with computed `display` ≠ `none`, then the same with `document.documentElement.className` set to `system` and to `''` | light → 2 × `-light.svg`; dark → 2 × `-dark.svg`; `system` follows the emulated scheme; `''` → `-dark` (dark-first); hidden images `display:none` |
| AC-10 | unit test; `--on-dark-surface` in both themes | 1 `<img>` per figure, `src` ends `hello-dark.svg`, host `aria-hidden="true"` |
| AC-11 | Jest contrast spec with the real theme values | §5 numbers ± 0.01; band ≥ 3 for t ≤ 0.75 |
| AC-12 | grep files + component SCSS for `animation\|transition\|@keyframes\|<animate\|<set`; unit test of the compiled styles for the `forced-colors` rule | 0 hits; rule present |
| AC-13 | spec: rendering creates no Trusted Types policy (`createPolicy` spy not called) and the template has no `innerHTML` | 0 calls |
| AC-14 | `EXPECT_IN_HTML`: `<lc-character` with `aria-hidden="true"` and class `lc-character--64`, followed by `<img` with `src="/compat-logo/character/hello-light.svg"`, `alt=""`, `width="100"`; the component style with `aspect-ratio` | matches on 21 and 22 |
| AC-15 | `design-tokens-horizon--with-figure` at 360, 1024, 1280, 1920 (light): `sunLeft = B.left + 0.72*B.width - r` (r from `getComputedStyle(block).getPropertyValue('--_lc-horizon-r')`) → `sunLeft - F.right`, `[F.width, F.height]`, `(B.bottom - land) - (F.top + 0.875*F.height)`, `B.height`; the unchanged stories `--compare` against the baseline | gap 16 / 24 / 24 / 24; size 64 / 96 / 96 / 128; foot offset 0; height 192 / 204 / 232 / 372; 0 differing shots |
| AC-16 | `--figure-and-footer` at 360: `getComputedStyle(fig).pointerEvents`, the figure's `tabIndex`, and the order of `[...document.querySelectorAll('a,button,[tabindex]')]` | `none`; −1 / not listed; exactly the 2 footer links |
| AC-17 | `node tools/agents/story-shots.mjs --list=character`, `--list=horizon` | 21 + 5 IDs as in §8 |
| AC-18 | the component has no text node; docs statement | — |
| AC-19 | `--with-figure` at 360 with `document.querySelector('.lc-horizon').style.setProperty('--lc-horizon-figure-size','96px')`: `document.documentElement.scrollWidth`, figure left | 360; 89.2 |
| AC-20 | full Jest, production build, `test:tools`, bundle-size, baseline compare | green; 0 B; 0 differing shots |
| AC-21 | `npm run test:tools`; the manifest entry | `lc-character` with 4 inputs and their `@default`; the 14 pose names in `pose`'s JSDoc; README (both) and CHANGELOG list them |
