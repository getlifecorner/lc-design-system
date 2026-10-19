# Design 006: F1 shell review gaps (LK-12, AS-25, AS-26, AS-27, AS-29)

- **Status:** ready, rev. 1 (2026-10-20, review round 1: §2, §3, §4, §8, §9; see Change notes)
- **Spec:** [spec.md](spec.md), AC-1 to AC-20
- **Prototyped on main b616423** (inline styles via `--measure`, `tmp/story-shots/006/probe*`). Baseline: `tmp/story-shots/006/baseline` (46 stories × 360/1024/1280 × light/dark, `--full`, 276 shots).

## 1. Approach

Everything extends what is already there. No new component, entry or runtime dependency, and no JavaScript measuring. Everything is in the prerendered HTML.

| Gap | Extends | Pattern followed |
|---|---|---|
| LK-12 defaults | `_horizon.scss` media steps | the existing `--_lc-horizon-land` fallbacks; only four numbers change |
| LK-12 auto-grow | `lc-app-shell` grid | with the horizon on, the footer moves to its **own last grid row** under the horizon and paints `--color-land-3`. The land then reads as D (gradient) + F (flat land-3) with no visible seam (the gradient already ends in land-3; prototype at 360/1024/1280/1920 in both themes). CSS can't read F, so the gradient isn't stretched: it differs by at most 6 of 255 per channel, which nobody can see |
| AS-29 slot | `lc-app-shell` template + `.lc-horizon__figure` (3.8) | an attribute slot like `[shell-footer]`. The attribute alone places the figure. The global rules are written for `:where([shell-horizon-figure])` through a shared mixin, so the 3.8 `.lc-horizon__figure` rules stay byte-identical |
| AS-25 | `PageHeaderSize` | a new member with the `compact` rhythm and a 20 px title. That is exactly the life-os interim (`compact` + `--font-size-lg: --font-size-xl`), so the swap is pixel-neutral |
| AS-26 | `lc-button` / `a[lcButton]` boolean modifiers (`inline`, `fullWidth`) | `flush` → class `btn-flush`, active with `variant="link"` only |
| AS-27 | skeleton hooks (`--lc-skeleton-bg`) | `--lc-skeleton-height`, applied through `min-height`/`max-height` on the fill. The inline styles stay exactly as in 3.8 (existing assertions untouched), and the hook still wins over them |

**Assumptions** (no owner question needed):
- **A1.** The new horizon defaults change the look of any `.lc-horizon` at ≥ 1024 px that relies on the defaults. This is the requested behaviour (LK-12; owner, life-os D11, 2026-10-18). There is no API change. It goes in the changelog under Compatibility, with a Migration line: to keep 3.8, set `--lc-horizon-land: 100px / 120px / 140px / 184px` from 1024 / 1280 / 1440 / 1920.
- **A2.** The auto-grow applies at every width, so on the phone the total is 112 + F. With a shell footer, `--lc-horizon-land` becomes the land **above** the footer. AC-8 holds for every page without a shell footer, which covers all of life-os's overrides (`shell-land-free`).
- **A3. Spec corrections.** `horizon` defaults to `false`, not `true`, and stays `false`. `level` accepts 1–3, not 1–6, so AC-10 covers 1, 2 and 3. The skeleton fill class is `.lc-skeleton`, and its variants are `line | circle | rect`.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| slot | `[shell-horizon-figure]` (lc-app-shell) | — | — | Edu (or any decorative figure) on the horizon line, left of the sun: `lc-character`, `<img>`, `<picture>` or an element holding an inline `<svg>`. Projected as a direct child of `.lc-horizon`, sized and placed by the horizon (`--lc-horizon-figure-size` / `-gap`). Decorative: `alt=""`, never a target. Shown only when `horizon` is on. |
| type | `PageHeaderSize` | `… \| 'secondary'` | — | `secondary`: a second title under the page's main one, e.g. the other language of a bilingual page (20 px, `--font-size-xl`; the `compact` spacing). |
| input | `size` (lc-page-header) | `PageHeaderSize` | `'default'` | JSDoc list gains `secondary` (20 px). Default unchanged. |
| input | `flush` (lc-button, a[lcButton]) | `boolean` | `false` | Drop the inline padding so a `variant="link"` button sits flush with the content edge. It keeps its height and a 44 × 44 px minimum target, and the label starts at the edge (or ends at it with `--lc-btn-flush-align: end`, rev. 1). Ignored on other variants and with `iconOnly`. `@default false` |
| CSS hook | `--lc-btn-flush-align` (rev. 1) | `start \| end` | `start` | Which edge a `flush` button's label sits on: `start` (the label and every wrapped line at the start edge) or `end`, for a link at the end edge of a row such as `justify-content: space-between`. Set it on the `a[lcButton]`, on the `lc-button` host or on an ancestor; it inherits, so no `::ng-deep`. |
| CSS hook | `--lc-skeleton-height` | `<length>` | unset → the `height` input, else the variant default | The fill's height from CSS, e.g. in a container query or as `cqi`/`cqw`. It wins over the `height` input. Set it **on the `lc-skeleton` element** (a class): on a wrapper it reaches every skeleton inside. It changes only the height, so a circle becomes an oval. |
| CSS hook | `--lc-horizon-land` (existing) | `<length>` | **112 · 72 · 80 · 96 · 128 px** (phone · 1024 · 1280 · 1440 · 1920) | Docs: "inside `lc-app-shell` with a `[shell-footer]` the footer's height is added below it". |

There are no outputs, no new texts and no new exported types beyond the union member. Default rendering is unchanged, for these reasons:
- `flush` and `secondary` are opt-in classes.
- The skeleton min/max fall back to `0px` / `none`.
- The figure rules match only the attribute.
- The footer row exists only under `.lc-app-shell--horizon`, and an empty footer has `display: none`, so its row is 0 px.
- The only intended visual change is AC-1 (A1).

## 3. Anatomy and layout

### lc-app-shell with the horizon and a footer (story `footer-on-the-horizon`)

```
360 px                                     1280 px (1024 alike: land 72; 1920: land 128, figure 128)
┌───────────────────────────── 360 ┐       ┌──────────────────────────────────────────── 1280 ┐
│ header · page                    │       │ header · page (no nav column on a public frame)  │
├──────────── .lc-app-shell__horizon (area end, 1fr; .lc-horizon, aria-hidden) ───────────────┤
│ sky fade        ╭ring╮           │       │ sky                      ╭── ring r+46 ──╮       │
│   [Edu 64]  ╭ sun r58 ╮          │       │      [Edu 96]─24─╭ sun r90 ╮ x 72 %          │
│━━━━ line 2 px ━━━━━━━━━━━━━━━━━━━│       │━━━━━━━━━━━━━━━━ line (feet on it) ━━━━━━━━━━━━━━━│
│ land D 112 (land-1 → land-3)     │       │ land D 80                                        │
├──── .lc-app-shell__footer (row 4, auto, col 1/-1, bg --color-land-3) ───────────────────────┤
│ 16 [Privacy policy 164.7×46.5]   │       │ 16  [Privacy policy] 8 [Legal notice] 8 © 2026   │
│ 8 [Legal notice 149.7] © 2026 …  │       │     LifeCorner — one centred row, F 78.5         │
│ 16                    F = 133    │       └──────────────────── total land 80+78.5 = 158.5 ┘
└──────────── total land 112+133 = 245 ┘
```

| Element | Value (measured in the prototype) | Token |
|---|---|---|
| Land D (no footer: the whole land) | 112 · 72 · 80 · 96 · 128 px | `--_lc-horizon-land` |
| Footer row F (compact `lc-footer`, 2 × link lg, copyright) | 133 at 360; 78.5 at 1024 / 1280 / 1920 | `lc-footer` unchanged |
| Line above the shell's bottom edge = D + F | 245 · 150.5 · 158.5 · 206.5 (360 · 1024 · 1280 · 1920) | — |
| Horizon min-height (with figure) | 192 · 176 · 192 · 316 | `max(r + 22, fig + 8)` + D |
| Figure box (Today page, 1280) | x 711.6, 96 × 96, bottom = line + 12 | `--_lc-horizon-fig` |
| Shell grid with the horizon | rows `auto auto 1fr auto`; footer `grid-row: 4; grid-column: 1 / -1` | — |

Without `horizon`, the footer keeps 3.8's placement (area `end`, `align-self: end`).

### lc-page-header `size="secondary"` (all widths alike)

```
┌ host: padding-block 12 · padding-inline 12 (360) / 32 (from 1024) · 0 with noPaddingX ┐
│ Can't reach LifeCorner right now          ← title 20 px / 25 px, 700, text-primary    │
│ ↕ 4 gap (compact's; rev. 1, was "8")                                                    │
│ Optional subtitle                          ← 14 px, secondary (compact's)              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
"Haushaltsmitgliederverwaltung" at 20 px is 296.5 px wide and fits the 304 px row at 360 on one line. A longer word hyphenates (`hyphens: auto`, already in place).

### Flush link (`a[lcButton] variant="link" size="lg" flush`)

```
content edge x
│Wir haben dir einen Code geschickt.      ← paragraph, same x
│Code erneut senden          ← padding 12 / 0; height 46.5; width = 3.8 width − 48.0
│[←] Anderen Weg wählen      ← icon-before: the icon at x, gap 8
│Ja··                        ← min-width 44, label at x (justify-content: flex-start)
│   Ohne flush               ← comparison row: label at x + 24
```
| Property | flush | Token |
|---|---|---|
| padding-inline | 0 (block padding kept: lg 12 → 46.5 px) | — |
| min-width × min-height | 44 × 44 | `--size-min-touch-width` / `-height` |
| alignment (rev. 1) | `justify-content: var(--lc-btn-flush-align, start); text-align: var(--lc-btn-flush-align, start)`: wrapped lines start at the edge; with `end` every line ends at the end edge | `--lc-btn-flush-align` |
| radius (focus-ring shape) | 10 px | `--border-radius-sm` (as `.btn-inline`) |
| selector (rev. 1) | `.btn-link.btn-flush:not(.btn-icon-only, .btn-inline)` (0,3,0 beats `.btn-lg`). The `.btn-inline` exclusion (build deviation, confirmed) makes "inline wins" hold for `lc-button`, whose `<button>` stays inline-block | — |

### Skeleton hook (story `height-from-container`)

`.lc-skeleton { min-height: var(--lc-skeleton-height, 0px); max-height: var(--lc-skeleton-height, none) }`. In the prototype, the inline `height: 120px` stays in the DOM: no hook gives 120, the hook at 59px gives 59 (host 59), and `25cqi` in a 360 container gives 90. In the story: tile rects `height="88px"`, with `--lc-skeleton-height: 59px` on `.tile` under `@container (max-width: 21.5rem)`. One line skeleton gets 14 → 20 px from `@container (min-width: 40rem)`.

## 4. States

| Part | States |
|---|---|
| Shell footer row | No footer: no row (0 px, AC-5). Long footer (wraps to more rows): F grows and so does the land, so the line never meets the footer. Footer with its own background (`variant="primary"`): it paints over land-3, and D stays above it. Footer plus the phone bottom bar (life-os never combines them): the bar covers the footer at the page end, as in 3.8. |
| Figure slot | Empty: no `:has()` match, the block renders as 3.8 (new D aside). Two projected nodes: both get the same box, so project one. A short screen: min-height keeps the figure clear of the page. Forced colours: hidden, box kept (3.8). |
| Page header secondary | Hover and focus: none (not interactive). Long German: hyphenates. With actions, icon, badge, overline: the same as compact. |
| Flush link | Hover: underline + `--color-primary-700`. Active: `-800`. `:focus-visible`: 2 px `--color-primary-500` ring, offset 2, radius 10, so it extends 4 px beyond the content edge (keep 4 px of room; never `overflow: hidden` at the edge). Disabled (`lc-button`): opacity .5, as 3.8. Loading (`lc-button`): the spinner at the edge. `inline` + `flush`: inline wins (inline display, no box). `fullWidth`: the label starts at the edge. Long German label at 360: wraps, every line starts at x. End edge of a row (rev. 1): `--lc-btn-flush-align: end`, every line ends at the row's edge (prototype: "Anders anmelden" wraps to 2 lines, right edges 328 / 328 in a 16–328 row). |
| Skeleton | Hook unset: 3.8. Hook + `height` input: the hook wins. Reduced motion: static fill (unchanged). Circle: an oval if the hook differs from `width` (documented). |

## 5. Theming

No new tokens. All ratios computed with the WCAG formula (Node). Footer link on land-1 = 5.50:1, which matches the concept and verifies the formula.

| Element | Light | Dark | Contrast (computed) |
|---|---|---|---|
| Footer row fill | `--color-land-3` #fafcfc | #0a131c | seam with the land's end: 1.00 (the same colour) |
| Footer link on the footer row | #1a6a79 | #a3d5df | 6.03 / 11.70 (3.8 on land-1: 5.50 / 10.42) |
| Footer link hover (700) | #144f5b | #c1e3e9 | 8.87 / 13.74 |
| Copyright (`--color-text-secondary`) | #4b5563 | #c4d2d9 | 7.34 / 12.08 |
| Flush focus ring (`--color-primary-500`) on page / land-3 | #208497 | #84c7d4 | 4.37 / 4.24 · 9.95 / 9.89 (≥ 3:1) |
| Flush link at rest on the page | #1a6a79 | #a3d5df | 6.21 / 11.78 |
| Secondary title (`--color-text-primary`) on the page | #111827 | #f1f6f8 | 17.74 / 17.29 (20 px bold = large text) |

## 6. Accessibility

- **Horizon:** the shell adds `aria-hidden="true"` to `.lc-app-shell__horizon`. It's decorative only, and the footer is its sibling, so the footer stays reachable. A projected figure is therefore hidden even with a non-empty `alt`. Docs: `alt=""`, no focusable content (axe `aria-hidden-focus`). Keep `pointer-events: none` and the forced-colours `visibility: hidden` from 3.8 on the attribute rule.
- **Footer:** DOM and tab order are unchanged (page → footer → bottom bar). Its 44 px targets are unchanged.
- **Page header:** semantics come from `level` (h1–h3), independent of `secondary`. `lang` on the host for a bilingual page (story).
- **Flush link:** native `<a>` / `<button>`, with a target of at least 44 × 44 even for a 2-letter label. `:focus-visible` as above. Forced colours: the outline shows as `Highlight` (UA). No new motion; the existing `transition` follows the reduced-motion utility.
- **Skeleton:** unchanged (decorative; the consumer's `aria-busy` region). The prerendered HTML is identical for 3.8 usages.

## 7. Texts

No new built-in strings: a slot, a size, a flag and a hook. The story texts are EN + DE, checked at 360: "Haushaltsmitgliederverwaltung" 296.5 px at 20 px fits 304, and the flush labels "Code erneut senden" and "Anderen Weg wählen" wrap at the start edge if they need to.

## 8. Stories

| Story (export) | Expected ID | Args / content | Shows |
|---|---|---|---|
| App Shell `FooterOnTheHorizon` | `layout-app-shell--footer-on-the-horizon` | `horizon: true`, header, a short sign-in page, `lc-footer shell-footer variant="default" [compact]="true" [showBorder]="false" copyright="© 2026 LifeCorner"` with 2 × `a[lcButton] variant="link" size="lg"` ("Privacy policy", "Legal notice"), `<img shell-horizon-figure alt="">` (`hello-<theme>.svg`, src from the `theme` global), no nav, no bottom bar | AC-4, AC-7, AC-20 |
| App Shell `FigureOnTheHorizon` | `layout-app-shell--figure-on-the-horizon` | the TodayDesktop page + `<lc-character shell-horizon-figure pose="comforts" />`, no footer | AC-5, AC-6, AC-7 |
| Page Header `Secondary` | `layout-page-header--secondary` | `size: 'secondary', level: 2, title: 'Household members', subtitle: 'Two people share this household'` | AC-9 (controls) |
| Page Header `BilingualPage` | `layout-page-header--bilingual-page` | DE `level 1 size title` "LifeCorner ist gerade nicht erreichbar" + EN `level 2 size secondary` "Can't reach LifeCorner right now", both `noPaddingX`, `lang` on each | AC-9, AC-10 |
| Page Header `SecondaryLevels` | `layout-page-header--secondary-levels` | level 1 EN "Settings" (no subtitle); level 2 DE "Haushaltsmitgliederverwaltung" + "Wer gehört zu deinem Haushalt?"; level 3 EN "Notifications" + "Choose what we tell you about" | AC-10 |
| Button Link `Flush` | `components-button-link--flush` | 312 px column: paragraph, then flush lg links "Code erneut senden", "Anderen Weg wählen" (icon-before `arrow-left`), "Ja", then a non-flush comparison link; **rev. 1:** below, a 312 px row `display: flex; justify-content: space-between; gap: 8px` with flush lg "Neu senden in 25 s" (`flex: 0 0 auto`) and "Anders anmelden" (`flex: 0 1 auto; min-width: 0; --lc-btn-flush-align: end`) | AC-12, AC-13 |
| Button `FlushLink` | `components-button--flush-link` | `lc-button variant="link" size="lg" [flush]="true"`: default, `disabled`, `loading` | AC-12, AC-13 |
| Skeleton `HeightFromContainer` | `feedback-skeleton--height-from-container` | the container story from §3 (tiles 88 / 59, line 14 / 20) | AC-15, AC-16 |

`argTypes`: add `secondary` to `size` options (page header); `flush` (boolean, `table.defaultValue: false`) on both button metas. Docs updates: the slot table and JSDoc in app-shell; the land row in `horizon.stories.ts` and the `_horizon.scss` header; the `--lc-skeleton-height` description in the skeleton docs and SCSS header.

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1 | `horizon.spec.ts` media steps (assertion changed, reason LK-12) + `--measure` `--_lc-horizon-land` on `design-tokens-horizon--with-figure` | 112 / 72 / 80 (360 / 1024 / 1280); 96 / 128 in spec |
| 2 | `horizon.spec.ts` radius assertions unchanged | 58 · 70 · 90 · 120 · 166 |
| 3, 8 | spec: every step `var(--lc-horizon-land, …)`; baseline compare `design-tokens-horizon--{phone,desktop,footer-on-the-land,figure-and-footer}` | identical hashes |
| 4 | `footer-on-the-horizon` at 360/1024/1280: shell bottom − (horizon bottom − D) = D + F(footer wrapper height) | 245 / 150.5 / 158.5 (± 0.5) |
| 5 | `today-desktop` / `figure-on-the-horizon`: no footer row; horizon bottom = shell bottom | 0 px row; land = D |
| 6, 20 | app-shell spec: projected node is a direct child of `.lc-app-shell__horizon`, which has `aria-hidden="true"`. Compat app: `<img shell-horizon-figure>` in its shell + `EXPECT_IN_HTML` entry | present in prerendered HTML |
| 7 | `--measure` figure box in both new shell stories | 64 / 96 / 96 square, bottom = line + 12.5 % of size, right = sun left − 16 / 24 |
| 9, 11 | page-header spec: host class `lc-page-header--size-secondary`; compiled SCSS title `var(--font-size-xl, 1.25rem)`; the default class and rules unchanged. Baseline compare: all 13 page-header stories | 20 px / 25 px; hashes identical |
| 10 | `secondary-levels`, `bilingual-page` at 360 / 1024 | h1/h2/h3 tags; title 20 px; no `scrollWidth > clientWidth` |
| 12, 13 | `components-button-link--flush`, `components-button--flush-link` at 360: x = paragraph x; width = non-flush − 48; h 46.5; "Ja" 44 wide; focus via `.focus()`: outline 2 px, radius 10. Rev. 1: end row, line right edges = row right; spec pins both `var(--lc-btn-flush-align, start)` declarations | as stated; end row 328 / 328 at 360 |
| 14 | button specs: no `btn-flush` by default; baseline compare of the 13 button stories | identical hashes |
| 15, 16 | `height-from-container` at 360 / 1024: tile height; line height; spec: compiled rule on `.lc-skeleton` (variant-independent) | 59 / 88; 14 / 20 |
| 17 | existing skeleton assertions unchanged + baseline compare of the 8 skeleton stories | identical |
| 18, 19 | review at 360/1024/1280 light/dark; axe via CDN on the new stories; forced-colours rules by stylesheet scan | no new axe violations (isolated-story trio excepted) |

**Risks for the developer:**
- Don't change the 3.8 `.lc-horizon__figure` selectors (`horizon.figure.spec.ts` looks them up by exact selector): use a mixin.
- `:has()` and `:where()` in the global file, not in the emulated shell SCSS.
- `.btn.btn-inline` specificity (memory).
- Read `--size-min-touch-*` before you use it.

## Change notes

| Rev. | Date | Change | Why |
|---|---|---|---|
| 1 | 2026-10-20 | §2, §3, §4, §8, §9: new hook `--lc-btn-flush-align` (`start` default, `end`) on the flush alignment | Design gap found in review r1: the fixed `start` alignment at (0,3,0) leaves the code page's end-edge link ("Anders anmelden", `justify="between"`, AS-26 row) 62–84 px short of the edge when it wraps at 360, and a consumer could only fix that by out-specifying the rule (`::ng-deep` again). Prototyped: `end` puts both lines at 328 |
| 1 | 2026-10-20 | §3 selector: `:not(.btn-icon-only, .btn-inline)` | Build deviation confirmed: inline + flush measures as inline alone (lc-button 163.8 × 24, a 16.8 × 24) |
| 1 | 2026-10-20 | §3 page-header wireframe: title–subtitle gap 4, not 8 | Measured: `secondary` = `compact` + interim to the pixel (block 74, gap 4); the "8" was a wrong annotation, no code change |
