# Design 011: lc-icon without inline styles, and footer sections at 320 px with 200 % text

- **Status:** ready
- **Spec:** [spec.md](spec.md), AC-1 to AC-12 · patch **3.11.1**, no API break
- **Prototype (main ccfd164):** the CSS below, injected with `--measure` into 59 stories at 320/360/1024/1280 in light and dark (472 shots), compared by hash with `tmp/story-shots/011/baseline`: **464 identical**. The 8 that differ are all `data-display-document-viewer--image-preview`, whose picture is a random `picsum.photos` image, so they would differ on any run.

## 1. Approach

| Gap | Change | Pattern followed |
|---|---|---|
| G-37 | Remove `[style.width]`/`[style.height]` from `icon.component.html`. The `.icon-<size>` classes, which the container already has, carry the px size in `icon.component.scss`. With the default colour, `decorateSvg` no longer touches `style` at all, and the stylesheet's `svg { color: inherit }` does the work. A custom `color` keeps its current path: `svg.style.color` through CSSOM, written only when the value is not the default. | Class modifiers instead of bound styles, as in `lc-badge` and `lc-button` sizes. The svg's `width`/`height` attributes stay. They are presentation attributes, which the CSP allows, and they size the glyph even if the component CSS is missing. |
| G-36 | `.footer__sections`: `repeat(auto-fit, minmax(min(10rem, 100%), 1fr))` plus `overflow-wrap: anywhere` | 3.11 reflow (request 010): `anywhere` only in a box whose tracks don't size from content (the grid tracks have a definite minimum). It is not set on `.footer`, because it would inherit into projected content and the bottom row, where it lowers min-content (pitfall 010). |

Why `min()` alone is not enough: I measured at 320 px with 200 % text and SF (fullscreen). With `min()` alone the column is 224 px, but the title "UNTERNEHMEN" is 225 px wide and "Datenschutzerklärung" is 266 px. Neither causes a horizontal scroll, but both run past the column. With `anywhere` added, nothing overflows, in SF or in DejaVu Sans (the life-os CI font). Why not `hyphens: auto`: it also changes how multi-word labels wrap at 100 % ("Allgemeine Geschäfts-/bedingungen"), which is an unannounced change for consumers. Consumers can put a soft hyphen (U+00AD) into a compound ("Unter­nehmen"); the browser breaks there only when it has to. The story shows this.

## 2. Public API

No new or removed input, output, selector, slot, hook or type. The JSDoc changes:

| Kind | Name | Type | Default | Description (JSDoc, new wording) |
|---|---|---|---|---|
| input | `size` | `IconSize` | `'md'` | Unchanged list (xs 16 · sm 20 · md 24 · lg 32 · xl 40 px). Add: "Set by the `icon-<size>` class in the component stylesheet; `lc-icon` writes no inline size." |
| input | `color` | `string` | `'currentColor'` | "Icon colour. By default the icon takes the text colour of its parent (`currentColor`, through the stylesheet) and `lc-icon` renders **no `style` attribute**, so it works under a `style-src 'self'` CSP. Any other value, a CSS colour (`#FF5733`, `rgb(…)`) or a variable (`var(--color-primary-500)`), becomes the `<svg>`'s inline `color`, set through CSSOM, which such a CSP allows in the browser. In prerendered HTML it is a `style` attribute, which that CSP blocks until the app hydrates, so the icon shows the parent's colour until then. Under a strict CSP, colour the icon from your stylesheet instead: set `color` on `lc-icon` or on its parent. `currentColor` in any letter case, and an empty string, mean the default." |
| story argType | `color`, `size` | — | `currentColor`, `md` | Add `table.defaultValue`; the `color` description says "default: inherits the text colour through CSS, no style attribute; other values are an inline colour". |

The internal members `sizeInPixels` and `colorStyle` stay; `sizeInPixels` still feeds the svg's `width`/`height` attributes. Default rendering is unchanged: the box comes from the same px values and the colour is the inherited one (measured below and in the prototype compare).

## 3. Anatomy and layout

### lc-icon (every width; the sizes are px and stay px at 200 % text)

```
<lc-icon>  :host inline-flex, centred                (unchanged)
  <div class="icon-container icon-md icon-outline">  24 × 24 from .icon-md (was style="width: 24px; height: 24px;")
    <svg width="24px" height="24px" aria-hidden|role…>  100 % × 100 %, display block, color: inherit (was style="color: currentcolor;")
```

| Class | width = height | Notes |
|---|---|---|
| `.icon-xs` / `-sm` / `-md` / `-lg` / `-xl` | 16 / 20 / 24 / 32 / 40 px | One SCSS map with `@each`, commented as "same values as `sizeInPixels`". Emulated specificity is (0,2,0). |
| `.icon-container ::ng-deep svg` | 100 % | Add `color: inherit` (0,2,1). It keeps the old precedence: global rules such as `svg { color }` or `lc-icon svg { color }` still don't reach the glyph. |

Decorating (`icon-dom.ts`), in the same order as today (width, height, colour, ARIA):

| `color` | What is written |
|---|---|
| default (`currentColor` in any case, `''`, after `trim`) | Nothing. If the svg has a `style` attribute (it was custom before), `style.removeProperty('color')`, and if the attribute is then empty, `removeAttribute('style')`. |
| anything else | `svg.style.color = value` (CSSOM). Never `setAttribute('style', …)`, never markup. |

### lc-footer sections, 360 px and 320 px at 200 % text (story fullscreen; padding 48 inline, 64 top)

```
| 48 |<-------- 264 (360) / 224 (320) -------->| 48 |
|    | PRODUKT                     28/42, 600   |    |  ← one column, min(10rem, 100%) = 100 %
|    | Funktionen                  min-h 88     |    |
|    |   … gap 64 …                             |    |
|    | UNTER-                      (U+00AD)     |    |  ← 320 only
|    | NEHMEN                                   |    |
|    | Datenschutzerkl|ärung       (anywhere)   |    |  ← breaks inside the word at 320 and 360
```

### From 1024 px (100 % text): identical to 3.11.0

| Story | 1024 | 1280 |
|---|---|---|
| `layout-footer--default` (4 sections) | `212px ×4` + 1 collapsed, sections width 944 | `276px ×4` + 2 collapsed, width 1200 |
| `layout-footer--public-site` (3 sections) | `293.33 ×3` | `378.66 ×3` |

The columns change only where the content box is narrower than 10rem: below 208 px at 100 % text, or below 416 px at 200 %.

## 4. States

| State | lc-icon | lc-footer |
|---|---|---|
| default / hover / focus-visible / active | Unchanged; the icon has no interaction states | Unchanged. The link focus ring (2 px, offset 2) falls in the 48 px padding at 224 px, so it is not clipped |
| loading (fetched icon) | The empty container keeps its size from the class, as it did from the inline style | — |
| error (placeholder) | Same box and classes | — |
| custom → default colour, size change | No stale `style`; `[class]` replaces the size class (AC-6) | — |
| overflow | — | A word wider than the column breaks inside the word, with no hyphen unless the consumer puts in U+00AD. Many sections stack in one column below 13rem + padding |

## 5. Theming

No colour changes, so no new tokens. The icon ink is the parent's. The inks used in the new story, on `--color-background` (contrast with the WCAG formula, computed in the browser):

| Ink | Light | Dark | Contrast L / D (3:1 needed for graphics) |
|---|---|---|---|
| `--color-text-primary` (page ink) | #111827 | #f1f6f8 | 17.74 / 17.29 |
| `--color-text-secondary` | #4b5563 | #c4d2d9 | 7.56 / 12.17 |
| `--color-link` | #1a6a79 | #a3d5df | 6.21 / 11.78 |
| `--color-error-default` | #9d0e0e | #f7a1a1 | 8.39 / 9.48 |
| opt-in `var(--color-primary-500)` (icon only) | #208497 | #84c7d4 | 4.37 / 9.95 |
| opt-in `#FF5733` (icon only) | #ff5733 | #ff5733 | 3.15 / 5.97 |

Footer: same tokens and variants as 3.11.0; the baseline compare covers light and dark.

## 6. Accessibility

- **lc-icon:** semantics are unchanged (`aria-hidden` or `role="img"` plus `aria-label`). In **forced-colors** the default glyph has no author colour (`color: inherit`, stroke and fill `currentColor`), so it follows CanvasText, or LinkText inside a link. The UA also overrides a custom inline colour there. No motion, no announcements.
- **Footer:** WCAG 1.4.10 is now met at 320 px with 200 % text. Links keep `min-height: 2.75rem` (88 px at 200 %). A two-line link is 84 px, inside that. Headings, nav label, `aria-current` and the external hint are unchanged.

## 7. Texts

No built-in strings change. Story-only strings: DE `navAriaLabel` "Fußzeile", `externalLinkHint` "(öffnet in neuem Tab)"; EN uses the defaults ("Footer", "(opens in a new tab)").

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| **new** `InheritedColor`, name "Inherited color, no inline style (3.11.1)" | `components-icon--inherited-color` | none | (1) `star` xs–xl in the page ink, gap 24. (2) Rows that colour `lc-icon` only through the parent's CSS: secondary text (`information-circle`), a real `<a href="#">` (`external-link`, sm), and error ink set by a class (`exclamation-triangle`). The class `<style>` lives in the template. (3) The opt-in `color`: `check-circle` solid with `var(--color-primary-500)` and with `#FF5733`, with a caption in secondary ink: "inline colour through CSSOM; a style attribute in prerendered HTML". Use `div` rows, not `p` (an lc-icon `div` inside a `p` breaks prerendered HTML). |
| **new** `SectionsLargeText`, name "Sections at 200 % Text (phone)" | `layout-footer--sections-large-text` | `textSize: '200%'` (reuse `textSizeArgType`), `layout: 'fullscreen'` | Two footers in a flex column with a 32 px gap, padding 0, on `--color-background`. **DE** (`lang="de"`, "Fußzeile", "(öffnet in neuem Tab)"): Produkt (Funktionen, Preise, Changelog) · `Unter­nehmen` (Über uns, Karriere, Blog) · Ressourcen (Dokumentation, API-Referenz ext., GitHub ext.) · Rechtliches (Datenschutzerklärung, Impressum, Barrierefreiheit). **EN** (`lang="en"`): Product · Company · Resources · Legal, with the same links translated (Privacy policy, Imprint, Accessibility). Copyright "© 2026 LifeCorner". Root size through `data-lc-story-text` plus the `html:has(…)` rule, as in `LinksLargeText`. The description names G-36, the soft hyphen and the `anywhere` fallback. |
| Every other icon and footer story | unchanged | — | Hash compare with `tmp/story-shots/011/baseline` |

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| AC-1 | Unit test: `it.each` over sizes xs to xl × outline/solid, `home` | No `[style]` inside the host and no `style` on the host; the container has `icon-<size>`; the svg `width`/`height` are `16px` to `40px` |
| AC-2 | `check-angular-majors.mjs` (21 and 22), new `EXPECT_IN_HTML` rows: no `<lc-icon …>…</lc-icon>` on `index.html` (`#compat-registered`, `check`), `tt/index.html` (decorative `clock`, labelled `shield-check`) or `tt/icons/index.html` (>100 bundled-set icons) contains `style=`. Positive control: a probe `<lc-icon id="compat-color" name="check" color="var(--color-primary-500)" />` (new `probe-311.ts`, mounted like probe-310) is excluded from that rule and must have `style="color: var(--color-primary-500)` on its svg only | All rows pass on 21 and 22; the regexes accept the beasties form |
| AC-3 | `--measure` on `components-icon--sizes` and `--inherited-color`, 360/1280, light and dark: container rect and svg `width` attribute | 16/20/24/32/40 for each, the same as measured on 3.11.0 (`tmp/story-shots/011/proto3`). Units assert the class only, because jsdom doesn't apply the component SCSS |
| AC-4 | `--measure` on `--inherited-color`: `getComputedStyle(svg).color === getComputedStyle(host.parentElement).color` for every default icon; scan `document.styleSheets` for svg colour rules | Equal in light and dark (page ink rgb(17,24,39) / rgb(241,246,248)); the only svg colour rule is `color: inherit` |
| AC-5 | Units: the existing custom assertions stay (`rgb(255, 87, 51)`, `var(--color-primary-500)`); new: a spy on `Element.prototype.setAttribute` sees no `'style'` call; the story measures the custom svg colour | rgb(255,87,51); primary-500 rgb(32,132,151) / rgb(132,199,212) |
| AC-6 | Unit: `#FF5733` → `currentColor` → no `style` attribute on the svg; `xl` → `xs` → class `icon-xs`, no `icon-xl`; both for a fetched and an inline icon | `hasAttribute('style') === false` |
| AC-7 | `check-trusted-types.mjs`: the `ICONS` probe also reports `[style]` count and container size. After hydration, on `/tt` and `/tt/icons` at 360 and 1280 | 0 styled descendants in every default-colour lc-icon; every `.icon-md` box is 24 × 24; 0 NG05xx |
| AC-8 | `layout-footer--sections-large-text`, 320 and 360, light: `scrollWidth`/`clientWidth`, `gridTemplateColumns`, each title's and link's right edge against the sections' right edge | `scrollWidth === clientWidth` (320/360); columns `224px` / `264px`; no right edge > 272 / 312; link heights ≥ 88; DE and EN |
| AC-9 | `--compare=tmp/story-shots/011/baseline` for the 13 footer and composite stories, plus `--measure` of the columns at 1024/1280 | 0 differing shots; columns as in §3 |
| AC-10 | Footer spec unchanged and green; covered by the AC-9 compare (light and dark) | — |
| AC-11 | Specs green. Assertions that change, each because it pins the old mechanism: `icon.registry.spec.ts:193-194, 241-248`, `icon.production.spec.ts:98-104`, `icon.set-failure.spec.ts:52` (missing from the spec's list), `icon.trusted-types.spec.ts:73-100` (container `style` → `null`, `style="color: currentcolor;"` dropped from the svg strings), `icon.component.spec.ts:190, 424, 459` (default `style.color` → `''`, no attribute). Each becomes a class, attribute or no-style assertion | Peer range and exports unchanged |
| AC-12 | Changelog 3.11.1 **Fixed** (G-37, G-36, the website's `style-src 'self'`, the measured values above). **Compatibility:** "no API break"; tests that read `container.style.width` or `svg.style.color` now see `''` (read the class or the computed style); a consumer rule of specificity ≥ (0,2,0) on the inner `.icon-container` now applies (the inline size used to win) | Review |

Unchanged-story compare for the review: the 10 icon stories, plus next-step-card (14), empty-state (7), document-viewer (7, ignore `image-preview`), kanban (4) and header (4). Expect 0 differing shots.

## Risks and out-of-scope findings

- **Other inline styles (report only, per the spec):** kit components that pass a custom `color` still produce a server `style`: `lc-empty-state` when `icon` is set (`var(--color-text-tertiary)`), `lc-document-viewer` in the error state, `lc-kanban-board` priority and `lc-chat` status. 44 component files bind `[style…]`; `lc-app-page` always writes `--lc-app-page-content-max` (default 880px). Website v0 uses none of these (concept: no app-page, no skeleton). A follow-up could move empty-state's and document-viewer's static colours into their stylesheets; they would render the same.
- **Component CSS must reach the page.** Without it, the svg attributes still give a 24 px glyph, but an empty fetched box collapses. How the CSS is shipped is out of scope (spec).
- **Forced-colors can't be emulated in story-shots**, so AC-4 is checked through the stylesheet scan.
