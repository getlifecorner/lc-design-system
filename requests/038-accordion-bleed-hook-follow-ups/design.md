# Design 038: lc-accordion bleed hook robust to a unitless 0, scroll-container note

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-9
- **Change note (review r1, 2026-11-02):** §7 changelog Compatibility said "Resolves the two *Known* items of 3.23.0", but the 8 px scroll (item 2) is documented, not removed; the sentence now says so (review finding 1). No code impact.

## 1. Approach

Extend, CSS only. **Decision: AC-1 is achieved with a private registered property; AC-2 is dropped as a requirement**, but the docs still name `0px` as the form that works in every browser (D-3).

| # | Decision | Why |
|---|---|---|
| D-1 | Register a **private** `--_lc-accordion-header-bleed` with `@property` (`syntax: '<length-percentage>'`, `inherits: false`, `initial-value: 0px`), declare it on the `::before` from the public hook, and read only it in `inset-inline` | A registered `<length-percentage>` parses a bare `0` as a length, so `calc(-1 * var(…))` stays a length. Registering the private name instead of the public hook avoids all three drawbacks from the spec's assumption: the default keeps the token (`var(--spacing-2)` is a declared value, not the `initial-value`), the public hook keeps its type (unregistered, ancestor-settable), and the registration is a single at-rule that Angular's style shim passes through unscoped (`ShadowCss._scopeSelectors` scopes only `@media/@supports/@document/@layer/@container/@scope/@starting-style`; `@property` keeps its content). The private `--_lc-<component>-<x>` pattern exists already (character, header, table). |
| D-2 | `<length-percentage>`, not `<length>` | `5%` works today (measured 360.781 px at 360); `<length>` would turn it into 0. |
| D-3 | `initial-value: 0px` | Every value that does not parse (`0` in a browser that rejected unitless zero, `8`, `auto`, `calc(0)`, a missing `--spacing-2`) computes to 0 px: ring and fill on the header edge, never a 0 px box and never more bleed than asked. Browsers without `@property` (Chrome < 85, Safari < 16.4, **Firefox < 128**) ignore the at-rule and run today's `calc`, so default and lengths still work there and a bare `0` breaks as in 3.24.0: the docs keep saying "a length; `0px` puts them on the edge" (precedent: the `lh` note in 3.23.1). |
| D-4 | No new story | At rest the plain bleed box is transparent, so a "bleed values" story shows identical headers. AC-1/3/8 are verified with `--measure` on the existing plain stories (§9). |

Prototype (`tmp/story-shots/038/proto.log`, CSS injected into the 3.24.0 build): with the rule, `0` gives the header width; all 11 valid values give the same width and offset as without it, at 4 setups.

## 2. Public API

No input, output, slot, type, class or template change. Semver: patch.

| Kind | Name | Type | Default | Description (JSDoc / docs) |
|---|---|---|---|---|
| input | `variant` | `AccordionVariant` | `'outlined'` | JSDoc text in §7 (adds "clipping or scrolling edge" and the `0px` note) |
| CSS hook | `--lc-accordion-header-bleed` | length or percentage (unregistered) | `var(--spacing-2)` (8 px) | How far hover fill and ring reach past the text on both inline sides (plain only). `0` and `0px` put them on the edge |
| private | `--_lc-accordion-header-bleed` | registered `<length-percentage>` | declared on `::before` | Not documented for consumers; SCSS comment only |

**SCSS** (`accordion.component.scss`), placed right before the `::before` rule (l. 248):

```scss
// Private and registered, so a unitless `0` (a valid <length>) still gives a
// 0 px bleed: unregistered, calc(-1 * 0) is a number, inset-inline is dropped
// and the box is 0 px wide (no ring, no hover fill; request 038). The public
// hook stays unregistered and keeps its token default. A value that is not a
// length or percentage computes to 0px, so the ring never disappears. Without
// @property (Firefox < 128) this is the plain calc again: write 0px there.
@property --_lc-accordion-header-bleed {
  syntax: '<length-percentage>';
  inherits: false;
  initial-value: 0px;
}
```

In `.lc-accordion--plain .lc-accordion__header::before`: add as the **first** declaration `--_lc-accordion-header-bleed: var(--lc-accordion-header-bleed, var(--spacing-2));` and change l. 252 to `inset-inline: calc(-1 * var(--_lc-accordion-header-bleed));`. Every other declaration stays. Header comment l. 204–206: replace "a length, `0px` not `0`). From 4px … 0px puts it on the text." with "a length or percentage; `0` and `0px` put the box on the header). From 4px the ring keeps 2 px from the glyphs; 0 puts it on the text."

Default rendering unchanged: the declared value is the same `var(--lc-accordion-header-bleed, var(--spacing-2))` as today, now through a property that computes it to the same length (proto: unset 344 px / −8 px at 360, as before). The 108 baseline shots must stay hash-identical.

## 3. Anatomy and layout

Only the bleed box geometry for values that failed before changes. *Plain Variant* (canvas padding 16, header = content box):

### 360 px

```
x  0    8   16                                       344  352  360
        ┌───┬─────────────────────────────────────────┬───┐          unset / 8px: box 8–352 (344 = 328 + 2×8)
        │   │ Show source                           ⌃ │   │
        └───┴─────────────────────────────────────────┴───┘
            ┌─────────────────────────────────────────┐              0 or 0px: box 16–344 (328 = header)
            │Show source                            ⌃│               3.24.0 with bare 0: box 0 px, no ring, no fill
            └─────────────────────────────────────────┘
```

### From 1024 px (1280 shown)

```
x  8   16                                                    576  584
   ┌───┬───────────────────────────────────────────────────────┬───┐  unset: 8–584 (576)
   │   │ Show source  (header max 560)                       ⌃ │   │
   └───┴───────────────────────────────────────────────────────┴───┘
       ┌───────────────────────────────────────────────────────┐      0 / 0px: 16–576 (560)
```

| Element | Value | Token |
|---|---|---|
| bleed box, default | header + 2 × 8 px, inset-block 0 | `--spacing-2` |
| bleed box, `0` / `0px` | = header (328 / 560; in a card 278 / 430) | — |
| ring | 2 px, offset −2 px, radius md | `--color-primary`, `--border-radius-md` |

## 4. States

| State | Unset / length | Bare `0` (was) | Bare `0` (now) |
|---|---|---|---|
| default | unchanged | box 0 px (invisible) | box = header, transparent |
| hover | fill on the box, unchanged | no fill | fill on the header box (`--color-surface-hover`) |
| focus-visible | ring on the box, unchanged | no ring (2.4.7 loss) | ring on the header box, measured 278 px around the 2-line DE title (`proto/…plain-in-card--360-light.png`) |
| active / disabled | unchanged (no plain rule) | — | — |
| loading / empty / error | n/a (accordion has none) | — | — |
| invalid hook (`8`, `auto`, `calc(0)`) | — | box 0 px | box = header (initial 0px) |
| overflow: long DE title | wraps inside the header; box width = header, independent of title length | — | — |

## 5. Theming

No colour change. Ring and fill tokens as in 035 (computed there, colours unchanged): ring `#208497` L vs page 4.37, over hover `#f3f4f6` 3.97; D `#84c7d4` vs page 9.95, min 6.69 over hover on surface-2. All ≥ 3:1. No new token.

## 6. Accessibility

- No markup, role or ARIA change; keyboard and focus order unchanged.
- With `0`, the 2 px ring now renders (WCAG 2.4.7 / 2.4.11 restored for that setting); header ≥ 44 px unchanged.
- Forced colours: existing `outline-color: Highlight` on `::before` applies; proto with `0`: emulated Highlight `rgba(5,0,73,.8)` L / `rgba(0,230,255,.8)` D, box 278 (`proto-fc.log`).
- Reduced motion: the registered property is not transitioned; the reduced-motion block is untouched.
- Scroll containers: a bleed past the content edge adds 8 px of horizontal scroll in an `overflow-x: auto` box without inline padding (035 `r1-scroll`); documented (§7), no CSS change.

## 7. Texts

No built-in UI string, so no locale input and no DE. Developer-facing texts (English):

| Place | New text |
|---|---|
| `variant` JSDoc (l. 94–102); keep the substrings asserted at spec l. 103–104 | "Visual variant. `'outlined'`: border and surface. `'flat'`: no border or background; header and body keep their inset. `'plain'`: no border, background or inline inset, so the title, chevron and body line up with the content edge of the sheet or card around it; the hover background and focus ring reach 8 px past that edge (`--lc-accordion-header-bleed`), so keep that much room before a clipping or scrolling edge (`overflow: hidden` or `overflow-x: auto`). The hook takes a length; `0px` puts them on the edge." + `@default 'outlined'` |
| docs bullet (stories l. 77) | "- Plain: \`variant="plain"\` drops the border, background and inline inset, so title, chevron and body line up with the content edge of a sheet or card; the hover background and focus ring reach 8 px into the gutter (\`--lc-accordion-header-bleed\`, a length; \`0px\` puts them on the edge), so keep 8 px of room before a clipping or scrolling edge (an \`overflow: hidden\` or \`overflow-x: auto\` box without inline padding)" |
| *Plain Variant* story text (l. 297) | "… its hover background and focus ring reach 8 px past the text (`--lc-accordion-header-bleed`, a length; `0px` puts them on the text), so leave that much room before a clipping or scrolling edge: an `overflow-x: auto` box without inline padding would scroll 8 px sideways." (first two sentences unchanged) |
| CHANGELOG (patch, draft for build.md) | **Fixed:** "`--lc-accordion-header-bleed: 0` (unitless) now puts the hover background and focus ring of `variant="plain"` on the header edge, like `0px` (BA-9, review 035 finding 1). In 3.23.0–3.24.0 `calc(-1 * 0)` was a number, the bleed box lost `inset-inline` and was 0 px wide: no ring, no hover fill. A value that is neither a length nor a percentage (`8`, `auto`) now also gives 0 px instead of no box. Measured in *Plain Variant*: `0` 328 / 560 px at 360 / 1280 (= header, was 0); default 344 / 576 and `0px`, `4px`, `1rem`, `5%`, `-4px`, `0.5em` unchanged." **Changed:** "The `variant` JSDoc, the accordion docs and the *Plain Variant* story say to keep 8 px of room before a clipping or scrolling edge: in an `overflow-x: auto` box with 0 inline padding a plain accordion scrolls 8 px sideways, with 8 px of padding it does not (review 035 finding 2)." **Compatibility:** "No API break: no input, output, class, template or default changed; the hook stays unregistered with default `var(--spacing-2)`. The fix registers a private `--_lc-accordion-header-bleed` with `@property` (Chrome 85, Safari 16.4, Firefox 128); older browsers render as 3.24.0, where only `0px` zeroes the hook. Closes the two *Known* items of 3.23.0: the bare `0` is fixed; the 8 px sideways scroll in a scroll container without inline padding stays and is now documented. The 108 story shots of lc-accordion and lc-accordion-group are hash-identical." |

## 8. Stories

No new or changed canvas (D-4); only the two description texts above. Review surfaces, all existing:

| Story | Expected ID | Shows |
|---|---|---|
| Plain Variant | `components-accordion--plain-variant` | EN, header 328 / 560; measure + focus with `0` |
| Plain in a Card (Sheet Alignment) | `components-accordion--plain-in-card` | DE 2-line title, header 278 / 430; focus shot with `0` |
| all 18 accordion + accordion-group stories | `components-accordion--*`, `components-accordion-group--*` | hash compare vs `tmp/story-shots/038/baseline` (108 shots, 360/1024/1280 L/D, 87e148b) |

## 9. Verification

Measure: paste `tmp/story-shots/038/bleed-measure.js` inline (last accordion of the story; `table` = `::before` width + left per hook value, `rules` = the registered `CSSPropertyRule`s, then focus with `0`).

| AC | How | Expected value |
|---|---|---|
| AC-1 | measure on plain-variant and plain-in-card, 360 + 1280 L; spec on `rule('@property --_lc-accordion-header-bleed')` and the `::before` rule | `table["0"]` = `328px 0px` / `560px 0px` (card `278px 0px` / `430px 0px`); `rules` = `["--_lc-accordion-header-bleed <length-percentage> false 0px"]`; focus `fv: true`, `w` = header, `solid 2px rgb(32, 132, 151) -2px` |
| AC-2 | dropped (AC-1 met, D-3); grep `0px` in the four places | JSDoc, docs bullet, story text, changelog each name `0px` |
| AC-3 | same measure; `--compare=tmp/story-shots/038/baseline` on all 18 stories | every valid value equals the `before` column of `proto.log` (360: unset 344/−8, `0px` 328/0, `4px` 336/−4, `1rem` 360/−16, `var(--spacing-2)` 344/−8, `5%` 360.781/−16.3906, `-4px` 320/4, `0.5em` 343/−7.5, `initial` 344/−8; 1280: 576, 560, 568, 592, 576, 616, 552, 575, 576); 108/108 identical |
| AC-4 | grep `clipping or scrolling edge` | ts 1, stories 2 (l. 77, l. 297), CHANGELOG new section ≥ 1; plus a new `toContain('clipping or scrolling edge')` in the spec's JSDoc test |
| AC-5 | changelog draft in build.md | Fixed + Changed + Compatibility as §7, names BA-9 and 035, "No API break" |
| AC-6 | measure ring colour L / D at 360; `--forced-colors` L / D with `0` | L `rgb(32, 132, 151)`, D `rgb(132, 199, 212)` (035 contrasts hold); forced `rgba(5, 0, 73, 0.8)` / `rgba(0, 230, 255, 0.8)`; reduced-motion block byte-identical |
| AC-7 | `--testFile=accordion.plain.spec.ts`, then full suite | Changed: the `::before` list (l. 222–234: new first line `--_lc-accordion-header-bleed: var(--lc-accordion-header-bleed, var(--spacing-2));`, l. 227 → `inset-inline: calc(-1 * var(--_lc-accordion-header-bleed));`). Added: `@property` block = `syntax: "<length-percentage>"` (Sass quote style) / `inherits: false` / `initial-value: 0px`, exactly one `@property`. l. 236–237 still hold (1 read of the public hook, never declared). Reason in build.md |
| AC-8 | focus shot plain-in-card 360 L with `0` (measure leaves it focused) | ring around the 2-line DE title, box 278 = header; EN plain-variant 328 |
| AC-9 | `check-angular-majors.mjs` + new `EXPECT_IN_HTML` entry `/@property\s+--_lc-accordion-header-bleed\s*\{[^}]*initial-value:\s*0(?:px)?/` next to "plain accordion" (l. 386) | 21 and 22 green; markup unchanged, the inlined component style keeps the at-rule (Angular's critical-CSS pass runs with `reduceInlineStyles: false`) |
