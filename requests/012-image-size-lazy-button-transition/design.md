# Design 012: Intrinsic image size and lazy loading for logo, character and avatar, and a narrower button transition

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-14
- **Baseline:** `tmp/story-shots/012/baseline` — 86 stories (§9 AC-11), 360/1024/1280, light/dark, `--full`, 516 shots, main `3974660` (3.11.1). Logs with the box measures: `tmp/story-shots/012/logs/baseline-{a,b,c,d}.log`.
- **Changes r1 (review round 1, 2026-10-23):** §8 `CustomEmblemWithSize` uses the kit's emblem pair (`lifecorner-emblem.svg` + `-on-dark.svg`): the mono emblem had no dark partner and was 1.06:1 on the dark canvas, the Storybook default. §9 AC-9 protocol toggles every CTA before reading and counts only `.btn` transitions: toggling and reading in turn measured a half-toggled row (build.md deviation 2).

## 1. Approach

Extend three components, fix one rule. No new component, entry, token or hook.

| Part | Decision | Why (measured at 1280, fresh `<img>`, uncached `src`, box read before and after `decode()`) |
|---|---|---|
| Built-in lockup | `width="485" height="100"` at **every** size, both drawings | The file's own size (both lockup SVGs: viewBox and `width`/`height` 485 × 100), and what concept §13 asks ("from the file"). Pending box = loaded box at every size (Δ 0 px). Rounded per-size pairs (116×24, 155×32, 233×48, 310×64, 466×96) reserve 116/155/233/310/466 against the loaded 116.391/155.188/232.797/310.391/465.594, a 0.19–0.41 px jump. Today the pending box is 0 px wide. |
| Built-in emblem | `width` = `height` = the size's px (24/32/48/64/96), normal and small drawing | AC-2. 1:1 is exact, so the pending box equals the loaded box (Δ 0 measured). |
| Custom sources | Two optional pairs: one for the lockup files, one for the emblem files. A dark file shares the pair of its light partner | `lc-header` and `lc-sidenav` switch the variant (emblem when collapsed), so one pair can't describe both files. A brand's dark partner has the same drawing size. |
| `loading` | `'eager' \| 'lazy'` on `lc-character` and `lc-avatar`, default `'eager'`; the attribute is written **only** for `lazy` | Default markup stays byte-identical (AC-11, designer's call). The name mirrors the native attribute that budget checks look for. The union type turns `[loading]="true"` (the kit's busy flag on button and select) into a compile error. |
| `.btn` | Longhands: `transition-property: color, background-color, border-color, box-shadow`, with the duration and timing as before | The list that `.btn.btn-inline` already uses (`button.styles.spec.ts:63`). |

Patterns followed: `[attr.*]` for optional attributes (null means absent), as lc-avatar does for `aria-*`; `input<T, TIn>` with a transform, as lc-character's `size` does.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (logo) | `srcWidth` | `number \| undefined` (also accepts `'160'`) | `undefined` | Intrinsic width in px of your `src` file (and `darkSrc`), written as the `<img>` `width`. Set it together with `srcHeight` so the browser reserves the logo's box before the file loads; `size` still sets the rendered height. Without both, no size attributes are written. |
| input (logo) | `srcHeight` | same | `undefined` | Intrinsic height in px of your `src` file (and `darkSrc`). See `srcWidth`. |
| input (logo) | `emblemSrcWidth` | same | `undefined` | Intrinsic width in px of your `emblemSrc` file (and `darkEmblemSrc`), written as the `<img>` `width`; set it together with `emblemSrcHeight`. |
| input (logo) | `emblemSrcHeight` | same | `undefined` | Intrinsic height in px of your `emblemSrc` file (and `darkEmblemSrc`). See `emblemSrcWidth`. |
| input (character) | `loading` | `CharacterLoading` | `'eager'` | How the browser loads the drawings. `lazy`: for a figure below the fold (such as the horizon); writes `loading="lazy"` on every drawing, and in `auto` only the drawing of the current theme is fetched. `eager` writes no attribute (the browser default). Keep `eager` above the fold. |
| input (avatar) | `loading` | `AvatarLoading` | `'eager'` | How the browser loads the image. `lazy`: for an avatar below the fold; writes `loading="lazy"`. `eager` writes no attribute. The initials still replace an image that fails. |
| type | `CharacterLoading` | `'eager' \| 'lazy'` | — | Exported from `@lifecorner/angular-ui-kit/character`. |
| type | `AvatarLoading` | `'eager' \| 'lazy'` | — | Exported from `@lifecorner/angular-ui-kit/avatar`. The same union as `CharacterLoading`, kept separate because entries don't import each other. |
| attributes | `width`/`height` on `lc-logo` `<img>` | — | see the table below | Not an input. One sentence in the JSDoc of `size`, plus the docs table (§8). |
| attributes | `width`/`height` on `lc-avatar` `<img>` | — | xs 24 · sm 32 · md 40 · lg 48 · xl 64 | From `size`. One sentence in the JSDoc of `size` ("the `<img>` carries the size's px as `width`/`height`; CSS sizes the box, so at 200 % text the box grows and the attributes only give the 1:1 ratio"). |

Each new input gets `@default` in its JSDoc. Transform `toIntrinsicSize`: a finite number > 0, or a numeric string, becomes `Math.round(v)`; `''`, `0`, negative values, `NaN`, `null` and `undefined` become `undefined`. A pair is written only when **both** values are defined.

The pair follows the file each `<img>` shows:

| The `<img>` shows | `width` / `height` |
|---|---|
| the built-in lockup (light or dark) | 485 / 100 |
| the built-in emblem (normal or small, light or dark) | the size's px / the size's px |
| `src` or `darkSrc` | `srcWidth` / `srcHeight`, otherwise none |
| `emblemSrc` or `darkEmblemSrc` | `emblemSrcWidth` / `emblemSrcHeight`, otherwise none |

Mixed case: with only `darkSrc` set, the light `<img>` (built-in) gets 485 / 100, and the dark one gets the `src` pair or nothing.

**Binding rules for the developer.**
- Use `[attr.width]` and `[attr.height]`, never `[width]`: a property binding of `undefined` writes `width="0"`.
- On the character and the avatar, write `[attr.loading]="loading() === 'lazy' ? 'lazy' : null"` and move the source from `[src]` to `[attr.src]`, **placed after** `[attr.loading]`. Angular applies every property binding before any attribute binding (`UPDATE_ORDERING`, @angular/compiler 22.2.2), so with `[src]` the source is set before `loading`, and an engine that starts the request when `src` is set (WebKit) loads eagerly in client-rendered views. `[attr.src]` gets the same URL sanitisation. A unit test pins the order: `getAttributeNames()` lists `loading` before `src`.
- The logo keeps `[src]`, because it has no `loading` input.

**Default rendering unchanged.** After load, every box equals 3.11.1: the attributes map to `aspect-ratio: auto w / h`, the natural ratio wins once the file is in, and the CSS `height` + `width: auto` (logo) and `width/height: 100%` (avatar) override the attribute's width hint. Without the new inputs, character and avatar markup has no `loading` attribute. The only default markup that changes is the new `width`/`height` on built-in logo and avatar images. That change is the fix itself.

**Non-goals (recorded as assumptions).** `lc-header` and `lc-sidenav` don't forward the four logo inputs, so a custom logo in a header has no size attributes yet; built-in logos in a header do. `lc-avatar-group` and the header avatars don't forward `loading`, so they stay eager as before. If a consumer needs either, it becomes a follow-up gap.

## 3. Anatomy and layout

Nothing moves after load; the design only fixes the box **before** the file arrives (all values measured on 3.11.1).

### 360 px

```
components-logo--sizes (img x 56; lg 41.625 and xl 40.688, where the label column shrinks)
size  attrs     pending 3.11.1 → loaded        pending 3.11.2 (expected)
xs    485×100   0 × 24  → 116.391 × 24         116.391 × 24
sm    485×100   0 × 32  → 155.188 × 32         155.188 × 32
md    485×100   0 × 48  → 232.797 × 48         232.797 × 48
lg    485×100   0 × 64  → 310.391 × 64         310.391 × 64
xl    485×100   0 × 96  → 465.594 × 96         465.594 × 96
emblem xs…xl: attrs 24…96 squared, pending 0 × h today → h × h

feedback-next-step-card--default (DE)          card 216.38 high
┌──────────────────────────────────────────┐
│ ◷  Wartet auf Freigabe / message         │
│ [ Änderungen anfordern ]  x 36, 291×35.5 │  ← no size transition: 291×35.5 from the first frame
│ [ Freigeben ]             x 36, 291×35.5 │
└──────────────────────────────────────────┘
```

### From 1024 px (1280 in brackets)

```
feedback-next-step-card--default                card 78.88 high
… message …   [ Änderungen anfordern ] x 678.39 (934.39), 203.02×35.5   [ Freigeben ] x 889.41 (1145.41), 93.59×35.5
--large-built-in-actions (lg)                   card 82.5 high (360: 220.69, 2 × 291×48.5)
              [ Später ] x 649.34 (905.34), 130.03×48.5   [ Mehr erfahren ] x 787.38 (1043.38), 195.63×48.5
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Logo `<img>` | CSS height 24/32/48/64/96 px, `width: auto` (unchanged) | — | — |
| Avatar box | 1.5/2/2.5/3/4 rem = 24/32/40/48/64 px (unchanged) | — | — |
| Character box | `--lc-character-size`, 48–128 px, attributes 100 × 100 (unchanged) | — | — |
| `.btn` transition | 150 ms, ease-in-out, 4 properties | — | `--animation-duration-base`, `--animation-timing-ease` |

## 4. States

| State | Logo | Character | Avatar | `.btn` |
|---|---|---|---|---|
| default | box reserved before load (Δ 0) | eager, no attribute | `<img>` with w/h, eager | — |
| file pending | the loaded box (§3); a custom file without a pair stays 0 px wide, as before | box reserved by CSS (as before) | the circle shows `--color-surface-hover` (as before) | — |
| lazy, below the fold | — | not fetched until near the viewport. In `auto` the hidden theme's drawing (`display: none`) isn't fetched until the theme switches; then it appears in its reserved box after one fetch | not fetched; empty circle until it loads | — |
| error | alt text drawn in the reserved box | as before | `(error)` → initials, unchanged; with `lazy` it fires when the deferred request fails | — |
| hover · active | — | — | — | colours and the shadow animate (150 ms) |
| focus-visible | — | — | — | the outline appears at once (it used to fade in over 150 ms with `all`) |
| disabled · loading | — | — | — | opacity 0.5 and the spinner width change at once (spec assumption) |
| overflow / 200 % text | px sizes, unchanged | unchanged | rem box grows to 48–128; the attributes keep 24–64, CSS 100 % wins (1:1) | size changes never animate |

## 5. Theming

No colour, token or contrast change, so there is no new pair to compute; the 3.11.1 values stand. Each light/dark pair of files shares a viewBox, so both `<img>`s in `auto` carry the same pair.

## 6. Accessibility

- Semantics unchanged: logo `alt`; avatar `role="img"` + `aria-label` on the wrapper (or `decorative`); character `aria-hidden`/`alt=""` or `role="img"` with `ariaLabel`. The new attributes are presentational.
- Focus: the `.btn` ring now shows at once (WCAG 2.4.7), instead of fading in.
- `forced-colors`: no new rule. A decorative character is `visibility: hidden` and keeps its box, so a lazy drawing still loads near the viewport.
- `prefers-reduced-motion`: the global rule in `_utilities.scss` still cuts the four remaining transitions to 0.01 ms.
- No targets, keyboard order or announcements change.

## 7. Texts

No built-in text. AC-9 labels: DE from the stories ("Freigeben", "Änderungen anfordern", "Später", "Mehr erfahren"); EN through args on `--default` (`primaryLabel: 'Approve'`, `secondaryLabel: 'Request changes'`).

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Logo `CustomLockupWithSize`, "Custom Lockup with Intrinsic Size" | `components-logo--custom-lockup-with-size` | variant `full`, size `md`, src `/assets/lifecorner-logo.svg`, darkSrc `/assets/lifecorner-logo-on-dark.svg`, srcWidth 485, srcHeight 100, alt `'Acme Inc.'` | the pair on both `<img>`s; the description says the kit's own files stand in for a brand file, so the story works offline |
| Logo `CustomEmblemWithSize`, "Custom Emblem with Intrinsic Size" | `components-logo--custom-emblem-with-size` | variant `emblem`, size `lg`, emblemSrc `/assets/lifecorner-emblem.svg`, darkEmblemSrc `/assets/lifecorner-emblem-on-dark.svg`, emblemSrcWidth 100, emblemSrcHeight 100, alt `'Acme Inc.'` (r1) | the emblem pair on both `<img>`s (64 × 64 rendered, 100 × 100 attributes); the description says the kit's emblem files stand in for a brand file and the dark `<img>` shares the pair |
| Avatar `ImageSizes`, "Image Size Comparison" | `data-display-avatar--image-sizes` | render: five `<lc-avatar src="/assets/lifecorner-emblem.svg" alt="LifeCorner">`, xs to xl, labelled like `AllSizes` | attributes 24…64 equal to the boxes (a local file, so the shots are stable) |
| Avatar `LazyImage`, "Lazy Image" | `data-display-avatar--lazy-image` | src `/assets/lifecorner-emblem.svg`, alt `'LifeCorner'`, name `'Life Corner'`, size `lg`, loading `'lazy'` | `loading="lazy"` with w/h 48 |
| Character `LazyLoading`, "Lazy Loading (below the fold)" | `components-character--lazy-loading` | pose `hello`, size 96, colorMode `auto`, loading `'lazy'` | both drawings lazy; only the visible one is fetched |

- **argTypes.** For the four logo inputs: `control: 'number'`, a description and `table: { defaultValue: { summary: 'undefined' } }`. For `loading` (avatar, character): `control: 'inline-radio'`, options `['eager', 'lazy']`, a description, and the summary `"'eager'"`.
- **Docs.** The logo's component description gets an "Intrinsic size" paragraph with the table from §2. The button's description gets one line: "Only colours and the shadow animate (150 ms); padding, font size and size change at once, so a button never grows on load (G-41)." The `.btn` change itself is timing only: no static story can show it, so AC-9 is measured on the existing next-step-card stories.
- Every other story stays unchanged and is compared against the baseline.

## 9. Verification

| AC | How | Expected |
|---|---|---|
| AC-1 | unit test per size xs…xl, `colorMode` auto (2 imgs), light and dark | every `<img>` `width="485" height="100"` (ratio 4.85, exact) |
| AC-2 | unit test per size, normal emblem (md/lg/xl) and small emblem (xs/sm), both imgs | `width` = `height` = 24/32/48/64/96 |
| AC-3 | unit test | custom `src` + both inputs → attributes on the light and dark img; one input or none → no `width`/`height` attribute; `'160'` → 160; `0`/`NaN` → none; the emblem pair applies only to emblem files |
| AC-4 | the probe below on `components-logo--sizes`, `--emblem-sizes`, `navigation-header--logo-sizes`, 360/1280, light/dark | loaded box = the baseline log (§3); pending box = loaded box (today: 0 × h) |
| AC-5 | unit test: `auto` (2 imgs) and `dark` (1 img) | `lazy` → `loading="lazy"` on each img, listed before `src`; `eager`/unset → no attribute; `width`, `height`, `decoding`, `fetchpriority` unchanged |
| AC-6 | unit test + `data-display-avatar--image-sizes` at 360/1280 | attributes 24/32/40/48/64; boxes equal them; the baseline avatar boxes are unchanged |
| AC-7 | unit test | as AC-5 for one img; `(error)` → initials; no `src` → initials, no img |
| AC-8 | `button.styles.spec.ts`: `.btn` has the 4-property list, `transition-duration: var(--animation-duration-base)` and `transition-timing-function: var(--animation-timing-ease)`; the compiled CSS has no `transition: all`; the inline assertion stays. Story: computed style on `components-button--all-variants` | `color, background-color, border-color, box-shadow` / `ease-in-out` (3.11.1: `all`) |
| AC-9 | the protocol below on `feedback-next-step-card--default` (DE, then EN args) and `--large-built-in-actions` at 360/1024/1280 | `t0` = `t500`, `card0` = `card500`, `btnProps` empty. 3.11.1: `t0` = the old size, card 216.38 → 242.38 at 360 (+26 px), props "font-size padding-bottom padding-left padding-right padding-top". `colour` (toggling `btn-ghost`/`btn-primary`) lists `background-color` and `color`. A `font-size` entry on `LC-ICON` at 0.01 ms is the reduced-motion rule on `*`, not a kit transition |
| AC-10 | `EXPECT_IN_HTML`: (a) home `<lc-logo />` img `width="485" height="100"`; (b) the `lc-header` logo img (emblem, md) `width="48" height="48"`; (c) a new probe `<lc-avatar id="compat-avatar" src="/compat-logo/character/hello-light.svg" alt="Edu" size="lg" loading="lazy" />` → img `width="48" height="48" loading="lazy"`; (d) `<lc-character id="compat-character-lazy" pose="hello" loading="lazy" />` → both imgs `loading="lazy"`. `characterPrerendered` stays as it is | Angular 21 and 22 |
| AC-11 | unit tests (no `loading` by default) + `--compare=tmp/story-shots/012/baseline --full` on the 86 baseline stories | all identical. These load from the network and may differ by hash; open them only if they do: `components-logo--custom-brand`, `data-display-avatar--with-image`, `data-display-avatar-group--with-images` |
| AC-12 | §8 stories and argTypes; `npm run test:tools` | the manifest lists the 4 logo inputs and both `loading` inputs, with JSDoc and `@default` |
| AC-13 | unit tests: `alt`, `aria-hidden`, `role` unchanged with `lazy` and the attributes; new stories in both themes; scan the stylesheets: no new `forced-colors` rule | unchanged |
| AC-14 | changelog review | names from §2; values 485 × 100 (pending 0 → 116.391–465.594 px wide, now Δ 0), avatar 24–64, card +26 px at 360 in 3.11.1 → 0; life-os drops its page-level `G-41` rule |

**AC-4 probe** (`--measure`; it copies each visible logo `<img>` with all its attributes and a fresh `src`):

```
(async (imgs, bx, probe) => ({ logo: await Promise.all(imgs.map(async i => [i.classList[1], i.getAttribute("width"), i.getAttribute("height"), bx(i), ...(await probe(i, bx))])) }))([...document.querySelectorAll("lc-logo img")].filter(i => getComputedStyle(i).display !== "none"), e => [Math.round(e.getBoundingClientRect().width * 1000) / 1000, e.getBoundingClientRect().height], async (i, bx) => (async c => (c.src = i.src + "?p=" + Math.random(), i.after(c), [bx(c), await c.decode().then(() => bx(c), () => "fail"), c.remove()]))([...i.attributes].reduce((c, a) => (a.name === "src" || c.setAttribute(a.name, a.value), c), document.createElement("img")))).catch(e => ({ err: String(e) }))
```

**AC-9 protocol (r1).** story-shots emulates reduced motion, so the measure first restores the 150 ms. It then toggles `btn-sm`/`btn-lg` on **every** CTA, then reads the boxes in the same frame (`t0`), waits 500 ms and reads them again. The shot keeps the toggled size, so run the protocol with its own `--out` (for example `tmp/story-shots/012/r1-ac9-review`) and never in a compare run. The 3.11.1 output (the r0 protocol) is in `tmp/story-shots/012/proto-3.11.1`.

```
(async (cards, raf, wait, bx, st, bs) => (st.textContent = ".btn { transition-duration: 150ms !important }", document.head.append(st), await raf(), { rest: bs.map(b => bx(b)), card: cards.map(c => bx(c)[1]), t0: (bs.forEach(b => (b.classList.toggle("btn-sm"), b.classList.toggle("btn-lg"))), bs.map(b => bx(b))), card0: cards.map(c => bx(c)[1]), btnProps: document.getAnimations().filter(a => a.effect.target.classList.contains("btn")).map(a => a.transitionProperty).join(" "), t500: (await wait(500), bs.map(b => bx(b))), card500: cards.map(c => bx(c)[1]), colour: (bs[0].classList.toggle("btn-ghost"), bs[0].classList.toggle("btn-primary"), document.getAnimations().filter(a => a.effect.target === bs[0]).map(a => a.transitionProperty).join(" ")) }))([...document.querySelectorAll("lc-next-step-card")], () => new Promise(r => requestAnimationFrame(() => r(0))), ms => new Promise(r => setTimeout(r, ms)), e => [Math.round(e.getBoundingClientRect().width * 100) / 100, Math.round(e.getBoundingClientRect().height * 100) / 100], document.createElement("style"), [...document.querySelectorAll("lc-next-step-card .btn")]).catch(e => ({ err: String(e) }))
```
