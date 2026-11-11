# Design 060: Area icons, hero area map, laptop device frame, lc-chip wrap and on-band palette

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-21
- **Prototype:** the real chip and badge CSS of the current build, Chrome 156 headless (`tmp/story-shots/060/proto-areamap.js`, logs `proto*.log`, `grid.log`, `laptop.log`). All values below are measured there.

## 1. Approach

| # | Item | Decision | Follows |
|---|---|---|---|
| D-1 | G-HV1 icons | 4 keys appended to `INLINE_TABLER_NAMES` (`shopping-bag`, `target`, `heart`, `gift`); the script adds the filled `heart` and `gift` itself: 6 glyphs, **150 → 156**. Regenerate, never hand-edit | 3.22 BA-6 (7 keys + 6 filled) |
| D-2 | G-HV2 area map | **New component `lc-area-map`** (folder `area-map`, entry `@lifecorner/angular-ui-kit/area-map`), data-driven. A hero recipe can't ship CSS-only anchors, row placement and the subgrid; the component renders all classes at prerender, so lines need no JS | `lc-hero` slots, `lc-badge`/`lc-chip` composition |
| D-3 | Anchor isolation (AC-9) | Fixed names `--lc-area-map-a1…a8` and `--lc-area-map-layer`, set by classes (no `style`). Each instance root is `position: relative` (the lines' containing block) **and** `anchor-scope: all`. Measured: a fresh relative root isolates on its own (deltas 0); a static root lets instance 1's lines bind to instance 2 (top off by 621 px), the negative control. `anchor-scope` stays static: toggling it at runtime unbound every line in Chrome 156 | concept §3.1, extended |
| D-4 | On-band chip names (AC-15) | `emphasis` → new `variant="emphasis"`; `default` → the existing `variant="default"` (and every status variant) with the light palette in a hero; `quiet` → new `variant="quiet"`. Both new values are opt-in, so no chip changes in light theme | concept §7 G-HV4 names |
| D-5 | Palette mechanism | (a) `lc-hero lc-chip { @include -light-theme-colors }` next to the badge rule (opaque fills, both themes; a no-op in light). (b) `lc-hero` publishes four **private** vars on `.hero`; the chip reads them in `:host-context(lc-hero)` blocks (precedent: logo, character), the area map through `var()` fallbacks and `currentColor`, so nothing is guessed from the DOM. (c) Chip colours move to private vars, so `--lc-chip-bg/-fg/-border/-gap` win from the chip **or any ancestor** (020 pattern; today a hook on an ancestor loses to the variant class) | badge 3.37, hero 3.38, 020 |
| D-6 | Laptop | `device="laptop"` draws lid and base with `::before`/`::after` on the host: **no new DOM**, the phone path untouched. `notch` is phone only (template `@if` and host class both check `device() === 'phone'`) | device-frame 3.39 lengths (`@property`, 038) |
| D-7 | Concept deviations (recorded, AC decides) | Built chips: concept 18 % tint + white ink fails 4.5 at the light end of 7 bands → `default` light palette, dark ink (AC-13). Layer: concept teal tint `.2` measures 3.62–6.01 at the bands' light ends → dark glass, white ≥ 6.40. Sizes 15/13 px → tokens 16/14 (height still 581 ≤ 590) | |

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | `lc-area-map` `groups` | `readonly AreaMapGroup[]` (required) | — | Status groups in visual order. `above` groups sit over the layer and their chips get lines; `below` groups sit under the divider. Rendered above-first, each part in input order. At most 11 groups and 8 lined chips; further chips render without a line. |
| input | `layerTitle` | `string` (required) | — | Title of the layer bar (bold, balanced). |
| input | `layerText` | `string` | `''` | Line under the title; nothing rendered when empty. |
| input | `ariaLabel` | `string` | `'Areas and their status'` | Accessible name of the area list. |
| input | `layerAriaLabel` | `string \| null` | `null` | Accessible name of the layer group; `null` uses `layerTitle`. |
| input | `lines` | `boolean` (booleanAttribute) | `true` | Draws the lines into the layer. `false` renders no line spans: the layout browsers without anchor positioning show. |
| slot | `[area-map-figure]` | — | — | Figure at the layer's start, e.g. `lc-character` (decorative). |
| slot | default | — | — | Free content after the layer text. |
| type | `AreaMapGroup` | `{ status: string; statusVariant?: BadgeVariant; areas: readonly (string \| AreaMapArea)[]; placement?: AreaMapPlacement; chipVariant?: ChipVariant }` | `statusVariant 'default'`, `placement 'above'`, `chipVariant` `'emphasis'` above / `'quiet'` below | `above` groups need opaque chip variants (all but `quiet`), else lines show through. |
| type | `AreaMapArea` | `{ label: string; icon?: string }` | — | A string is a label without icon. |
| type | `AreaMapPlacement` | `'above' \| 'below'` | — | |
| CSS hook | `--lc-area-map-line-color` | color | `color-mix(in srgb, currentColor 50%, transparent)` | Lines. |
| CSS hook | `--lc-area-map-layer-bg` | color | hero: `--_lc-hero-glass`; else `var(--color-surface-secondary)` | Layer fill. A light tint drops white below 4.5 (§5). |
| CSS hook | `--lc-area-map-layer-border` | color | `color-mix(in srgb, currentColor 32%, transparent)` | Layer border. |
| CSS hook | `--lc-area-map-divider-color` | color | `color-mix(in srgb, currentColor 20%, transparent)` | Divider above the first `below` group. |
| input | `lc-chip` `wrap` | `boolean` (booleanAttribute) | `false` | Lets a long label wrap onto centred lines instead of overflowing (WCAG 1.4.10 at 320 px and 200 % text). A one-line chip keeps its height. |
| type | `ChipVariant` | adds `'emphasis' \| 'quiet'` | — | `emphasis`: solid fill, white ink (primary fill; in a hero the band's dark stop). `quiet`: transparent, thin border (secondary ink; white on a band, dark on a light hero). |
| input | `lc-device-frame` `device` | `DeviceFrameDevice = 'phone' \| 'laptop'` | `'phone'` | `laptop`: lid with bezel over a wider base. |
| input | `notch` | `boolean` | `false` | JSDoc adds: phone only, ignored on `laptop`. |
| CSS hook | `--lc-device-frame-base-color` | color | `#374151` (neutral-700, both themes) | Laptop base. |
| CSS hook | `--lc-device-frame-overhang` | length | sm `--spacing-3` · md `--spacing-4` · lg `--spacing-6` | Base overhang per side. Registered (`@property`, `0` works). |
| CSS hook | `--lc-device-frame-base-height` | length | sm `--spacing-2` · md `--spacing-3` · lg `--spacing-4` | Laptop base height. Registered. |
| CSS hook | existing `-width`, `-bezel`, `-radius`, `-rim-color`, `-bezel-color`, `-shadow`, `-screen-bg` | | laptop width sm 320 · md 480 · lg 640; radius (lid top) `--border-radius-sm/md/lg` | Same meaning on the lid; shadow on lid and base. |
| private | `--_lc-hero-ink`, `--_lc-hero-glass`, `--_lc-hero-ring-gap`, `--_lc-hero-band-from` | on `.hero` | `#fff`, `rgba(17,24,39,.24)`, `#111827`, the band's `from` stop; `.hero--light`: neutral-800, `rgba(255,255,255,.5)`, `#fff` | Kit-internal contract, comment in both files. Paint nothing, so heroes render unchanged. |

Default rendering unchanged: new inputs default off; chip colours keep their values through the private vars (same computed styles); hero only gains custom properties; the phone frame keeps its DOM (`@if` anchor unchanged) and rules. Proof: §9 hash compares. Compatibility notes: (1) a `--lc-chip-*` hook set on an ancestor now applies, as the chip SCSS comment already promised; (2) chips in a hero take the light palette in dark theme (today 1.78–10.29:1 over the bands, below 4.5 for every variant; no kit story has one); (3) apps with `unregistered: 'placeholder'` now get the four glyphs.

## 3. Anatomy and layout

### 360 px (DE reference, `[hero-media]`, column 320)

```
 y  ┌──────────────────────── 320 ────────────────────────┐ ul role=list (subgrid, rows 1/span 12)
  0 │                 (● Als Nächstes)        badge xs 20 │ row 1 · group gap 6
 26 │        [▣ Verträge und Versicherungen]   chip sm 24 │ chips centred, gap 6 × 6
 56 │           [▣ Dokumente und Briefe]                  │ emphasis (opaque)
 86 │              [▣ Haushaltsbudget]                    │
120 │                    (● Gebaut)          margin-top 10│ row 2
146 │    [▣ Haushalt und Mitglieder]  [▣ Konten]  default │
    │         │              │             │  lines 1.5 px, chip bottom → layer top
184 │ ╭─────────────────────────────────────────────────╮ │ row 3 layer: margin-top 14,
    │ │ (figure 50)  Verbunden, für dich und KI nutzbar  │ │ pad 12/14, radius 18, gap 14
    │ │              Jede Angabe mit Quelle. Du …        │ │ title 16/700/1.3, text 14/1.45
294 │ ╰─────────────────────────────────────────────────╯ │
308 │ ─────────────────── divider 1 px ─────────────────── │ row 4: margin-top 14, pad-top 12
321 │                    (● Geplant)                       │ quiet chips, no lines
    │   [▣ Kalender und Erinnerungen]  [▣ Einkäufe]        │
411 │                    (● Später)          margin-top 10│ row 5: 5 chip rows,
581 └─────────────────────── … [Und mehr] ─────────────────┘ "Und mehr" no icon · EN 551
```

### From 1024 px (column 544 beside the hero text, `--lc-hero-media-width: 34rem`)

```
  0 ┌──────────────────────────── 544 ────────────────────────────┐ gaps 8 × 8, group gap 8
    │  (● Als Nächstes)  [Verträge und Versicherungen] [Dokumente …]│
 94 │  (● Gebaut) [Haushalt und Mitglieder] [Konten]  margin-top 10 │
174 │ ╭ layer pad 14/16 · figure 60 · title 18/700 · text 14 ╮ mt 28 │
264 │ ╰───────────────────────────────────────────────────────╯     │
292 │ ─ divider ─ (mt 28, pad-top 20) · Geplant · Später (mt 10) ─  │
491 └───────────────────────────────────────────────────────────────┘ EN 459
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| root | grid 1 col, `position: relative`, `anchor-scope: all`, `isolation: isolate`, no padding; the 1024 step is a viewport query, as the hero's media column | inherits ink | — |
| list / rows | `grid-row: 1 / span 12`, subgrid; classes `lc-area-map__row-1…12` computed in TS; list z 1, layer z 2, lines z 0 | — | — |
| group | flex column, centred, gap 6 → 8 (≥ 1024); next group `margin-top` 10 | — | `--spacing-1-5` → `-2`; `--spacing-2-5` |
| badge | `lc-badge size="xs" rounded dot wrap`; **host `display: flex; justify-content: center; max-width: 100%`** (a block host adds a 5 px strut per group: 601 → 581) | 12 px | badge |
| chips | `lc-chip size="sm" wrap [icon]`; host `display: flex; min-width: 0; max-width: 100%`; `li` `display: flex` (anchor on the `li`) | 14/500 | chip |
| layer | margin-top 14 → 28; padding 12/14 → 14/16; radius 18; border 1 px; gap 14; figure slot `flex: none` | title 16 → 18 / 700 / 1.3 `text-wrap: balance`; text 14 / 1.45, `margin-top` 2 | `--spacing-3-5`/`-7`, `-3`/`-3-5`/`-4`, `--border-radius-lg`, `--typography-font-size-base`/`-lg`/`-sm`, `--spacing-0-5` |
| divider | border-top 1 px on the first `below` group; margin-top 14 → 28, padding-top 12 → 20 | — | `--spacing-3-5`/`-7`, `-3`/`-5` |
| lines | `position: absolute; position-anchor: --lc-area-map-aN; left: anchor(center); top: anchor(bottom); bottom: anchor(--lc-area-map-layer top); width: 1.5px; margin-left: -0.75px; border-radius: 1px` | — | — |
| fallback | `@supports not (anchor-name: --a)` and `lines=false` and forced colours: `.lc-area-map__link { display: none }` | — | — |

**Chip `wrap`** (`.lc-chip--wrap`): `height: auto; max-width: 100%; white-space: normal; text-align: center; line-height: var(--line-height-tight, 1.25); overflow-wrap: anywhere; hyphens: auto; hyphenate-limit-chars: 12 4 3; align-items: flex-start`. Per size `min-height` 1.5/2/2.5rem, `padding-block: max(0px, calc((H - 2px) / 2 - var(--line-height-tight, 1.25) * 0.5em))`, `border-radius` H/2 (0.75/1/1.25rem). `__action`, `__content` `min-width: 0; align-items: flex-start`; `__label` `display: block; min-width: 0`; icon `margin-block: calc((var(--line-height-tight, 1.25) * 1em - 20px) / 2)`; × `margin-block-start: calc((var(--line-height-tight, 1.25) - 1) * 0.5em)`. Measured one-line height 24 (sm), 2 lines 41.5.

**Laptop** (md; sm/lg in §2): host `inline-size` 480, `max-inline-size: 100%`, `padding: B (O+B) (H+B)`, no own border/background/shadow, `isolation: isolate`. `::before` lid: `inset: 0 O H`, rim 1 px (no bottom border), radius R R 0 0, bezel colour, shadow. `::after` base: `inset: auto 0 0`, height H, rim 1 px, radius 0 0 H H, `background: radial-gradient(farthest-side at 50% 0, #1f2937 98%, transparent) 50% 0 / 14% 50% no-repeat, base-color`, shadow. Screen radius `R−B R−B 0 0`. Measured: 360 → sm 320×198 (screen 284×178), md/lg scale to 328 (screens 280×175 / 260×163), page overflow 0; 1280 → md 480×298 (432×270), lg 640×394.

## 4. States

| Element | default · hover · focus-visible · active · disabled |
|---|---|
| chip emphasis | fill + white · `brightness(1.06)` · ring 2 px offset 2 (off-band primary-500; in a hero `--_lc-hero-ink` + `box-shadow: 0 0 0 2px var(--_lc-hero-ring-gap)`, as the hero title) · `brightness(.96)` · opacity .5 |
| chip quiet | transparent · off-band bg `--color-surface-hover`, border stays field-border; in a hero bg `--_lc-hero-glass`, border stays ink · same ring · as today · opacity .5 |
| chip default/status in a hero | light palette · today's hover · on-band ring · as today · as today |
| area map | static; nothing focusable, no hover. Loading/error: n/a (data in). Empty: `groups: []` → layer only; no `below` → no divider; `layerText ''` → no `<p>`; no figure → text from padding |
| overflow | DE compounds hyphenate in `wrap` chips; 200 % at 320: 0 of 13 chips overflow; >8 lined chips: no line for the rest; >11 groups: documented limit (unit test) |

## 5. Theming (bands are theme-independent: light = dark; WCAG formula in the browser)

| Element | Light | Dark | Contrast (computed) |
|---|---|---|---|
| emphasis on band | `--_lc-hero-band-from`, ink #fff, border ink 24 % | same | white 8.10 (success) … 17.74 (neutral); fill vs light end 1.65–2.86 |
| emphasis off-band | `--color-primary-fill`, `--color-on-primary`, border transparent | same tokens | 6.21 / 6.21 |
| default + status in a hero (light palette, opaque) | default `#f3f4f6`/`#4b5563` · primary 8.49 · success 4.85 · warning 5.52 · error 10.98 · info 9.08 | same | 4.85–10.98 (today in dark 1.78–10.29) |
| quiet on band | transparent, ink #fff, border ink 32 % (interactive: 100 %) | same | text ≥ 4.58 all 18 band ends; border .32 1.73–2.90 (decorative); interactive ≥ 4.58 |
| quiet in light hero | ink neutral-800, border 32 % (interactive 100 %) | same | ≥ 10.57 |
| quiet off-band | `--color-text-secondary`, border `--color-border`; interactive `--color-field-border` | same tokens | text 7.56 / 12.17 (surface 11.16); field-border 4.83 / 7.31 (6.71) |
| layer on band | glass `rgba(17,24,39,.24)` | same | white ≥ 6.40 (purple light end) … 17.74. Rejected: teal .2 3.62–6.01, white .08 3.94–7.13 |
| layer light hero / off-band | white .5 + neutral-800 · `--color-surface-secondary` + text-primary | same | ≥ 12.51 · 16.12 / 16.60 |
| lines · divider | ink 50 % · ink 20 % | same | 2.30 · 1.41 (decorative; hero media rule is .2 too) |
| laptop rim · base | field-border · `#374151` | same | rim vs page 4.83 / 7.31 (phone rule); base vs page 10.31 / 1.83 (the rim carries dark) |

No new tokens. Raw values only where the bands need them (as hero/badge do).

## 6. Accessibility

| Topic | Rule |
|---|---|
| area map | `<ul role="list" [attr.aria-label]="ariaLabel()">` → group `<li>`: badge text, then `<ul role="list">` of `<li>` + static chip. Layer `<div role="group" [attr.aria-label]="layerAriaLabel() ?? layerTitle()">` **after** the list, title and text as `<p>`. Lines `<span aria-hidden="true">` after the layer. DOM order = list, then layer (WCAG 1.3.2 as concept §3.4) |
| focus | nothing in the area map is focusable; chips there are static |
| chip wrap | semantics unchanged; target boxes as 3.39 (sm 24, md 32, lg 40 tall; × 1em), a wrapped chip only grows. AC-11 "still 44 px": no chip has 44 px today (premise checked) → BACKLOG row, not this request; review measures the × for 2.5.8 |
| forced colours | lines hidden; layer border `CanvasText`; laptop lid/base `border-color: CanvasText; background: Canvas; box-shadow: none`; chips/badges keep their rules |
| motion | none added |

## 7. Texts

| Input | EN default | DE |
|---|---|---|
| `lc-area-map` `ariaLabel` | Areas and their status | Bereiche und ihr Stand |
| `layerAriaLabel` | `null` (title) | story: „Gemeinsame Ebene: die Bereiche, verbunden und nutzbar für dich und eine KI“ |
| story content | website-brief R-068 / R-072 EN | R-068 / R-072 DE (as `proto-areamap.js`) |

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Area Map · OnHeroBand | `data-display-area-map--on-hero-band` | DE reference, `lc-hero` primary md, `[hero-media]`, 34rem, `lc-character` figure, `lang="de"` | AC-4/6/10 |
| English | `…--english` | EN reference | AC-6 (other wraps) |
| TwoInstances | `…--two-instances` | DE + EN maps on one page | AC-9 |
| AllBands | `…--all-bands` | 9 heroes, compact map (2+1 lined, 1 below) | AC-8 |
| LightHero | `…--light-hero` | `variant="light"` | ink/glass swap |
| WithoutLines | `…--without-lines` | `lines=false` | AC-7 layout |
| LargeText | `…--large-text` | DE, root 200 % (badge `WrapLargeText` pattern) | AC-10 |
| OnPage | `…--on-page` | no hero | off-band values |
| Chip · Wrap | `data-display-chip--wrap` | sm/md/lg × icon/removable/clickable, 160 px column, EN + DE | AC-11 |
| WrapLargeText | `data-display-chip--wrap-large-text` | 320 column, root 200 %, EN + DE | AC-11 |
| EmphasisAndQuiet | `data-display-chip--emphasis-and-quiet` | off-band, static/clickable/removable/disabled | new variants |
| OnHeroBands | `data-display-chip--on-hero-bands` | 9 bands: emphasis, default, primary, success, quiet, quiet clickable | AC-13/14 |
| OnLightHero | `data-display-chip--on-light-hero` | light hero | ink swap |
| HooksOnAnAncestor | `data-display-chip--hooks-on-an-ancestor` | hooks on a wrapper, off-band and in a hero | AC-15 |
| Device Frame · Laptop / LaptopSizes / LaptopAndPhone / LaptopHooks | `data-display-device-frame--laptop`, `--laptop-sizes`, `--laptop-and-phone`, `--laptop-hooks` | 1280×800 SVG data-URI screenshot via `lc-picture` (DE alt) | AC-17/18 |
| Icon · AreaIcons | `components-icon--area-icons` | 4 glyphs at 20/24 px, labelled, + heart/gift solid, on page and on a band | AC-2 |

Every new input gets an argType with `description` and `table.defaultValue` (chip `variant`/`wrap`, device-frame `device`, all area-map inputs).

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1, 3 | `icons.spec.ts` (150 → 156 in every pin: `GLYPHS_351`, names, constants, `icon.trusted-types.spec.ts`, `bundle-size.mdx`, `icons/index.ts`, `icon.stories.ts`); `npm run test:tools` | 4 ICON_ outline, `currentColor`, `ICON_HEART_SOLID`, `ICON_GIFT_SOLID`; names in the MCP list |
| 2 | script run clean (`git diff` only the generated file); `components-icon--area-icons` 360 L/D | glyphs 20/24 px |
| 4, 6 | area map stories at 360/1024/1280 L/D; `--measure` line centre − chip centre, line top − chip bottom, line bottom − layer top | all \|Δ\| ≤ 0.5 px (proto: 0.00–0.01) DE and EN |
| 5 | unit test (one `ul[role=list]` with name, links `aria-hidden`, no `style` attr); compat `EXPECT_IN_HTML` gets `lc-area-map__link` + `role="list"` | prerendered |
| 7 | CSS test for the `@supports not` block; `…--without-lines` vs `…--on-hero-band` group/layer rects | identical rects |
| 8 | `theme-contrast.spec.ts`: layer white on band + glass at both ends of 9 bands | ≥ 6.40 |
| 9 | unit test (anchor classes per instance, root `position: relative` + `anchor-scope: all` in CSS); `…--two-instances` measure | Δ 0 in both |
| 10 | `…--on-hero-band` 360 DE height; 320 + 200 % chip overflow | ≤ 590 (proto 581.2); 0 |
| 11 | `chip.wrap.spec.ts` (as `badge.wrap.spec.ts`); Wrap stories 320 / 200 % | one-line wrapped = 24/32/40; no overflow |
| 12, 16, 19 | `--compare=tmp/story-shots/060/baseline` (chip 11, device-frame 7, hero 18, chips in card 2 / table 1 / page-header 4, icon 12) | identical (icon solid/outline-vs-solid may change only through `heart`: explain). Baseline 330 shots (360/1024/1280 L/D, main 51586aa build), re-shot 330/330 identical |
| 13–15 | computed styles in `…--on-hero-bands` L/D; `theme-contrast.spec.ts` rows of §5; HooksOnAnAncestor | §5 values; hooks win |
| 17, 18 | device-frame unit test (`laptop` class, no notch DOM/class on laptop); measure in a 320 column | no overflow; rim ≥ 4.83 / 7.31 |
| 20 | axe on all new stories; forced-colors run | 0 violations; lines hidden, rims visible |
| 21 | CHANGELOG per gap ID with these values; READMEs list `lc-area-map` | review |
