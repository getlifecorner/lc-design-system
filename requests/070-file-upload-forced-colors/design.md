# Design 070: lc-file-upload image grounds in forced colours

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-8 · kit 3.49.0 (main 6005a88) → 3.49.1 (patch)
- **Prototype (3.49.0 build, rule injected):** `tmp/070/proto-fc2.log` + `tmp/story-shots/070/proto-fc2/` (*Image Backgrounds*, `--forced-colors`, 360 · 1280, L · D); before values `tmp/070/measure-test.log`; contrast math `tmp/070/math.log`
- **Baselines (3.49.0):** `tmp/story-shots/070/baseline` (normal) and `baseline-fc` (`--forced-colors`): the 12 file-upload stories, 360 · 1024 · 1280, L · D, `--full`, 72 shots each

## 1. Approach

Extend the existing forced-colours block of `file-upload.component.scss` (l. 249, "one block, the file's last") with one rule. Pattern: the CSS Color Adjust advice to opt out only where the colours are the content (colour swatches, previews), as the kit already does for the image itself (`.file-upload-image__img`, 3.49) and the line-chart / bar-chart swatches. The edge and the ring stay system colours, so the tile still follows the user's palette where it is UI.

| D | Decision | Why |
|---|---|---|
| D-1 | `forced-color-adjust: none` on tiles `--light`, `--dark`, `--checkered` that are **not** `--empty` | The ground exists to judge an image on (spec Need). Explicit list, not `:not(--surface)`, so a future ground is not opted out by accident. |
| D-2 | **Empty tiles keep the system colours** (agrees with the spec's assumption) | There is nothing to judge yet; the only content is the hint text, which must follow the user's palette (Canvas / CanvasText, 21:1). Keeping the ground would also pin the hint to `--color-text-tertiary` in the tile's scope and override the user's text colour. The ground appears as soon as an image is chosen. |
| D-3 | `surface` keeps the system colours | `surface` means "the page's surface", which is Canvas in forced colours: the image is judged on what the page will really show. |
| D-4 | Border stays `CanvasText`, drag ring stays `Highlight` (existing rules, unchanged) | Measured with the prototype: both keywords still resolve to the system palette inside the opted-out tile (§5). |
| D-5 | A failed image (`__img--failed`, tile not `--empty`) keeps the ground | Same as normal mode ("a URL that fails to load shows the tile's ground"). |

`forced-color-adjust` inherits, so it reaches the tile's children only (the `<img>`, already `none`). The buttons, hint, accepted/max lines and error are siblings of the tile, not descendants: no leak (measured `auto` on all of them, §5).

## 2. Public API

No change: no input, output, slot, class, hook or type. Normal mode renders byte-identical (the rule sits inside `@media (forced-colors: active)`; AC-5 compare).

**SCSS** (inside the existing forced block, directly after `.file-upload-image__tile { border-color: CanvasText; }`; update the block comment to name 3.49.1 / request 070):

```scss
  // 3.49.1 (request 070, 069-s1): a chosen ground is what the tile shows, so
  // light, dark and checkered keep it once there is an image. The edge above
  // stays CanvasText and the drag ring Highlight; surface and empty tiles keep
  // the system colours.
  .file-upload-image__tile--light:not(.file-upload-image__tile--empty),
  .file-upload-image__tile--dark:not(.file-upload-image__tile--empty),
  .file-upload-image__tile--checkered:not(.file-upload-image__tile--empty) {
    forced-color-adjust: none;
  }
```

No raw colour (the image section's `#hex|rgba(` assertion in `file-upload.image.spec.ts` l. 217 stays green), no second forced block.

## 3. Anatomy and layout

Geometry unchanged (tile 160 × 96, 1 px border, radius `--border-radius-md`, padding `--spacing-2`; actions 16 px beside, or under at 360). The new story's layout:

### 360 px (story canvas 328, one column)

```
English                          14/600 text-primary
 12
light                            12 text-secondary, 8 below
┌──────────────┐ 160×96, 1 px CanvasText (FC) / --color-border (normal)
│  ground      │ white silhouette, object-fit contain, 8 px padding
└──────────────┘
 16
[ Replace image ]  outline lg 48.5
 8
[ Remove image  ]  ghost lg 48.5
 24  (grid gap) → dark · checkered · dark, empty ("No image", dashed, 1 button)
 32
Deutsch  → the same four cells with IMAGE_DE (hint, Erlaubt, Höchstens lines)
```

### 1024 / 1280 px

```
grid repeat(auto-fill, minmax(min(100%, 22rem), 1fr)), gap 24
1024: 2 columns (484 each)   1280: 3 columns (400 each), tiles at x 16 / 440 / 864
row 1: light | dark | checkered        row 2: dark, empty
actions beside the tile at tile x + 176
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Group label | margin 0 0 12 | 0.875rem / 600 | `--color-text-primary` |
| Cell caption | margin 0 0 8 | 0.75rem | `--color-text-secondary` (as *Image Backgrounds*) |
| Groups | gap 32 | — | — |

## 4. States (forced colours; normal mode unchanged)

| State | `light` / `dark` / `checkered` | `surface` |
|---|---|---|
| with image | own ground, image as drawn, border CanvasText | Canvas, image as drawn, border CanvasText |
| empty | Canvas, dashed CanvasText border, hint CanvasText | same |
| image failed | own ground (D-5), nothing on it | Canvas |
| drag-over | + 2 px dashed `Highlight` outline, offset 2 | same |
| disabled | as "with image" (the tile is never dimmed, 3.49) | same |
| hover / focus / active / loading / error | n/a: the tile is not a control; buttons and error line untouched (system colours) | — |
| overflow | n/a (no text in a filled tile; the empty hint is the existing one) | — |

## 5. Theming (measured, Chromium `--forced-colors` emulation; L = light FC: Canvas #fff / CanvasText #000, D = dark FC: Canvas #000 / CanvasText #fff)

| Tile (with image) | Ground L · D, 3.49.0 → 3.49.1 | White logo on ground | Edge vs Canvas |
|---|---|---|---|
| `light` | Canvas → rgb(255,255,255) both | 1.00 (by design: shows where white fails; = normal mode) | L border 21; D ground 21 |
| `dark` | Canvas → **rgb(7,14,21)** both (`--color-sidebar`) | **19.4** (was 1.00 in L) | L ground 19.4; D border 21 (ground 1.08) |
| `checkered` | checks dropped → `repeating-conic-gradient` L (209,213,219)/#fff, D (75,85,99)/(16,28,38) (page theme, as normal mode) | L 1.47 / 1.00, D 7.56 / 17.27 (= normal mode) | border 21 |
| `surface`, any empty | Canvas (unchanged) | — ; empty hint CanvasText **21** | border 21 |

- The three grounds differ: `#fff` + no image · `#070e15` + no image · transparent + gradient (AC-2).
- Border: `CanvasText` = rgb(0,0,0) L / rgb(255,255,255) D on every tile, before and after (D-4).
- **Drag ring:** `Highlight` resolves in the tile's colour scheme (`.lc-theme-dark` sets `color-scheme: dark`): the dark tile reads `rgba(55, 0, 110, 0.8)` L / `rgba(26, 235, 255, 0.8)` D, a `surface` tile `rgba(5, 0, 73, 0.8)` / `rgba(0, 230, 255, 0.8)`, as in 3.49.0. Not a regression; review compares to these values.
- No new token. Contrast is the WCAG formula, computed in `tmp/070/math.log`.

## 6. Accessibility

- Semantics, roles, ARIA, names, keyboard order, focus and announcements: unchanged (no markup or text touched).
- Targets: unchanged (buttons `lg` 48.5).
- **forced-colors:** the fix itself; the opted-out part is only the preview tile; its edge stays CanvasText and the drag ring Highlight; text (empty hint) stays system (D-2).
- Reduced motion: n/a (no motion).

## 7. Texts

No component text. Story-only strings:

| Where | EN | DE |
|---|---|---|
| Group label | English | Deutsch |
| Captions | `light`, `dark`, `checkered`, `dark, empty` | `light`, `dark`, `checkered`, `dark, leer` |
| `imageAlt` | Company logo (white) | Firmenlogo (weiß) |
| Field labels | component defaults | `IMAGE_DE` (existing const; „Bild auswählen“ 175.7 px fits at 360, 069) |

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| **Image Grounds White Logo** (new, export `ImageGroundsWhiteLogo`, `controls: { disable: true }`) | `form-file-upload--image-grounds-white-logo` | none (render only) | §3 layout; `WHITE_LOGO` = LOGO's three shapes in `#ffffff` without the L: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect x="2" y="6" width="28" height="28" rx="7" fill="#ffffff"/><rect x="38" y="11" width="78" height="8" rx="4" fill="#ffffff"/><rect x="38" y="24" width="54" height="6" rx="3" fill="#ffffff"/></svg>` as a data URI; EN group `lang="en"`, DE group `lang="de"` |
| *Image*, *Image Backgrounds*, *Image German*, *Image Rejected German*, all others | unchanged | — | byte-identical (AC-5) |

Story description (docs): "3.49.1 (request 070, 069-s1): a white logo on the `light`, `dark` and `checkered` grounds, EN and DE, plus an empty `dark` field. On `light` the white logo vanishes by design: the ground shows where it won't work. In forced colours (Windows high contrast; DevTools → Rendering → `forced-colors: active`) these grounds keep their colours once an image is shown: white on `dark` 19.4:1 against #070e15. The edge stays CanvasText and the drag ring Highlight; empty tiles and `surface` follow the system colours."

## 9. Verification

Review measure: `tmp/story-shots/070/fc-measure.js` (brace-free, paste inline as `--measure`; tested on 3.49.0). It returns `system` (Canvas, CanvasText, Highlight probes), `tiles` [ground, fca, bg, bgImage, border, white-on-ground, img fca | hint colour + ratio], `leak` (fca set of buttons/hint/accept/error), `drag` (first filled dark tile) and `rest`.

| AC | How | Expected |
|---|---|---|
| AC-1 | Unit (new `file-upload.forced-colors.spec.ts`): the last forced block contains the three-selector rule with exactly `forced-color-adjust: none;`; jsdom `tile.matches(<selector list>)` over grounds × with/without `imageSrc`. Story: `fc-measure.js` on the new story, `--forced-colors`, 360 · 1280, L · D | light/dark/checkered filled: `none`, `rgb(255, 255, 255)` / `rgb(7, 14, 21)` / `rgba(0, 0, 0, 0)` + `repeating-conic-gradient(rgb(209, 213, 219)` L · `(rgb(75, 85, 99)` D; img `none` |
| AC-2 | same run | dark white-on-ground **19.4** (≥ 3); the three bg/bgImage pairs distinct; dark ≠ Canvas probe |
| AC-3 | Unit: `.file-upload-image__tile { border-color: CanvasText; }`, `--drag-over { outline-color: Highlight; }`, `__img { forced-color-adjust: none; }` still in the block; exactly one `@media (forced-colors: active)`; `forced-color-adjust` nowhere outside it. Measure `tiles[].border`, `drag` | border `rgb(0, 0, 0) solid` L / `rgb(255, 255, 255) solid` D (`dashed` when empty); drag `true`, `rgba(55, 0, 110, 0.8) dashed` L / `rgba(26, 235, 255, 0.8) dashed` D; rest `false` |
| AC-4 | Unit: `matches()` false for `surface` (with image) and for every empty tile; `querySelectorAll(<list>)` inside the host returns only the tile. Measure + shot: new story 360 FC L (the `dark, empty` cells) | empty/surface: `auto`, Canvas bg, hint CanvasText **21**; leak `["auto"]` |
| AC-5 | `--compare=tmp/story-shots/070/baseline` (12 stories, 360 · 1024 · 1280, L · D, `--full`); extra: `--forced-colors --compare=…/baseline-fc` | normal 72/72 identical; FC 66 identical, 6 different = *Image Backgrounds* × 3 widths × 2 themes (the fix). The FC baseline is hash-stable (re-run `stability-fc`: 72/72 identical) |
| AC-6 | Full file-upload specs; `git diff main -- libs/angular-ui-kit/src/lib/file-upload` touches only `.scss`, `.stories.ts` and the new spec; no compat change | green, existing assertions untouched |
| AC-7 | `story-shots --list=file-upload` | lists `form-file-upload--image-grounds-white-logo` |
| AC-8 | Release step (changelog diff): Known line of 3.49.0 replaced by a 3.49.1 *Fixed* entry naming 069-s1 and 19.4:1 (was 1.00) | — |

Review shots to open (4): new story 360 · 1280 FC L, 360 FC D, 360 normal L. Everything else by measure and hash.

**Prototype pitfall:** a `forced-color-adjust: none` rule injected after first paint updates the computed background, but Chromium repaints only the gradient; the colour fills stay Canvas until the tile is re-laid out (`display` toggle). The built rule is present from the first paint, so this does not affect the review.
