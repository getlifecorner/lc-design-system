# Design 018: lc-alert in a narrow container: long words and a narrow layout

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-12
- **Prototyped** with injected CSS on the 3.13.0 Storybook build (main 5faaaf5); logs in `tmp/018/`, shots in `tmp/story-shots/018/`.

## 1. Approach

Extend `lc-alert` with **SCSS only**: no template change, no new input, slot, type or hook, so this is a **patch**. Three changes:

1. **Every alert is a size container** (`container: lc-alert / inline-size` on `.lc-alert`). Since 3.3 (stacked) and 3.12 (text link) this applied only to some alerts. The host is already `display: block; width: 100%`, so in block, flex or grid flow its size stays the same (measured in §9 AC-6).
2. **Narrow layout below 16rem of alert width**, following `lc-next-step-card` TD-1 and AS-32. The body becomes `display: contents`, so the icon and the title share the first row of a wrapping flex row. Content and actions take full-width rows below. The padding drops one density step (`--lc-density-padding-md` → `-sm`). As in AS-32, the title moves below the icon only when its smallest unbreakable piece doesn't fit next to it.
3. **Word breaking (`overflow-wrap: break-word` + `hyphens: auto`) only inside the narrow layout.** I measured (§9 AC-7) that both properties change existing wide alerts:
   - `hyphens: auto` on every alert changed 6 of 81 light shots in 5 stories at 360 (all-variants, with-action, 3 error-display stories).
   - `break-word` alone breaks the *With Action* title at 360 into "fehlgeschlage|n". The body there is 101.7 px, squeezed by the inline button, and the word overflowed it by only 1.3 px.

   In the wide layout the text column is at least 186 px at 100 % and at least 398 px at 200 % text, so long words don't matter there. All of G-WL4's overflows happen in the narrow layout.

**Threshold `@container lc-alert (width < 16rem)`**, because rem in a container query follows the root text size. The query measures the content box inside the 1 px border, so alerts narrower than **258 px at 100 %** and **514 px at 200 %** use the narrow layout (measured: 257 narrow, 258 wide; 513 narrow, 514 wide). The 3.3 and 3.12 36rem queries have the same 2 px offset. Below the threshold, the wide layout's text column (alert − 70 px at 100 %, − 114 px at 200 %) would be under about 13em, roughly 26 characters, which is too short for German compounds.

| Case | Alert width | Layout |
|---|---|---|
| G-WL4 reproduction, 200 % | 123 | narrow |
| phone 360 / 320, 200 % (story padding 32) | 296 / 256 | narrow |
| phone 360, 150 % (padding 24) | 312 < 386 | narrow |
| phone 360 / 320, 100 % | 328 / 288 | wide, unchanged |
| side column, 100 % | 240 | narrow |
| kit stories, 100 % (sweep of 899 stories, §9) | ≥ 270, except density docs at 51.3 | wide, unchanged |

20rem would also have switched the density docs story at 1024 (272.7) and at 360 (*stacked*, 270), plus every alert at 320 px and 100 % text.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input / output / slot / type / hook | — | — | — | none new |
| class JSDoc (`AlertComponent`, Features) | new bullet | — | — | "Narrow layout below 16rem inside the border (alerts under 258 px at 100 % text, 514 px at 200 %): the icon shares the first row with the title, message and actions take the full width below, the padding is one density step smaller (`--lc-density-padding-sm`), and long words hyphenate (`hyphens: auto`, needs the page's `lang`) or break instead of leaving the box." |
| `AlertActionsLayout` JSDoc | add one line | — | — | "In the narrow layout (below 16rem) the actions start at the alert's inner edge, not under the text." |

**Default rendering unchanged:** at or above the threshold (258 px at 100 % text), the only new declaration that applies is `container`. 160 of 162 baseline shots are hash-identical; the only differences are the density docs alerts, which are 51.3 px wide (§9 AC-7).

**Compatibility (changelog line, no API break):** a plain alert is now a size container, so it gets layout and inline-size containment. 3.3 (stacked) and 3.12 (link) alerts already had this. Three consequences:
1. In a shrink-to-fit box (`inline-block`, float, an absolutely positioned box without a width, `width: fit-content`, or a grid `auto`/`max-content` track) the alert no longer takes its width from its text. Give that box a width.
2. A `position: fixed` or `absolute` descendant is placed relative to the alert.
3. The alert has no baseline for `align-items: baseline`.

## 3. Anatomy and layout

### 360 px, 200 % text (alert 296, padding 24 = `--lc-density-padding-sm` @200 %)

```
x=32                                         x=328
┌──────────────────────────────────────────────┐ border 1 · padding 24 · inner x 57–303 (246)
│ [ic] Nicht                             (×)   │ row 1, align flex-start (as wide): icon 24 @ x 57,
│ 24   eingetragen                             │ column-gap 24 (spacing-3), title x 105 w 198 (146 with ×)
│                                              │ row-gap 8 (spacing-1)
│ Wir haben nichts gespeichert. Versuch        │ row 2 (order 1): content x 57 w 246, hyphens auto
│ es später noch einmal.                       │
│                                              │ row-gap 8 + action margin-top 24 (spacing-3) = 32
│ ( Erneut versuchen )                         │ row 3 (order 1): action x 57, no indent, ≤ 246
└──────────────────────────────────────────────┘
```

### The reproduction: 123 px box, 200 % text (inner 73)

```
x=32        x=155
┌───────────┐ padding 24 · inner x 57–130
│ [ic]      │ row 1: icon only, because 24 + 24 + "Nicht" (68.4, its smallest piece) > 73
│ Nicht     │ row 2: title x 57 w 73, hyphenated "ein-ge-tra-gen"
│ ein-…     │
│ Wir ha-…  │ row 3: content x 57 w 73
└───────────┘ height 895 (DE) / 566 (EN). 3.13: 522 / 438, body 9 px wide, text up to 111.4 px outside
```

### 1024 / 1280 px, and every alert at or above the threshold

Unchanged 3.13 wide layout: padding 16, icon column, body `flex: 1; min-width: 0`, title margin-bottom 4. The 123 px story box stays narrow at every viewport, and the 200 % phone story is wide at 1024 (960 ≥ 514).

### 240 px side column, 100 % text (padding 12)

```
x=16                          x=256
┌───────────────────────────────┐ inner x 29–243 (214)
│ [ic] Nicht eingetragen   (×)  │ icon x 29, title x 65 (w 178; 142 with ×), × box 28, right edge 247 (−4 overhang as wide)
│ Wir haben nichts gespeichert. │ content x 29 w 214 (row-gap 4)
│ ( Erneut versuchen )          │ action x 29 (16 below the content: 4 + 12)
└───────────────────────────────┘ height 96 plain (3.13: 118.5); with an lg inline button the 3.13 body was 0 px wide
```

| Element | Narrow value (100 % / 200 %) | Rule |
|---|---|---|
| `.lc-alert` | `container: lc-alert / inline-size` (all alerts) | in the `.lc-alert` block; the existing stacked and link `container` declarations stay (specs l. 345, 124) |
| `.lc-alert__container` | `flex-wrap: wrap; column-gap: var(--spacing-3)` (12/24); `row-gap: var(--spacing-1)` (4/8); `padding: var(--lc-density-padding-sm, var(--spacing-3))` (12/24; compact 8, comfortable 16) | `align-items` stays `flex-start` |
| `.lc-alert__body` | `display: contents` | — |
| `.lc-alert__title`, `.lc-alert__content` | `overflow-wrap: break-word; hyphens: auto` | narrow only (§1) |
| `.lc-alert__title` | `flex: 1 1 0%; max-width: 100%; margin-bottom: 0` | the AS-32 wrap |
| `.lc-alert__content` | `order: 1; flex: 1 1 100%; min-width: 0` | — |
| `.lc-alert__content:first-child` (no title) | `order: 0; flex: 1 1 0%; min-width: auto; max-width: 100%` | beside the icon like a title (spec assumption); without the `auto` reset it sat in 25 px |
| `.lc-alert__action` (every action layout) | `order: 1; flex: 1 1 100%; min-width: 0; max-width: none; align-self: auto; margin-top: var(--spacing-3); padding-inline-start: 0; --lc-btn-overflow-wrap: anywhere` | must beat (0,5,1), see R1 |
| `.lc-alert__action > a:where(:not(.btn))` | `min-width: min(var(--size-min-touch-width), 100%)` | 2.75rem is 88 px at 200 %, wider than a 73 px line |
| `.lc-alert__close` | `margin-inline-start: auto` | after the base rule; the other margins stay −4 |

## 4. States

| State | Narrow layout |
|---|---|
| default | §3 |
| hover, focus-visible, active (×, link, buttons) | unchanged rules and rings |
| no title | content beside the icon while its smallest piece fits, otherwise below it |
| no icon (`showIcon=false`) | title (or content) starts at the inner edge |
| dismissible | × in DOM order after the title, pushed to the row end. Where icon + title piece + × don't fit (alert < about 212 px at 200 %), the title and × move to row 2. Below about 164 px the × takes its own right-aligned row before the content (123 px: × at x 102). Never outside the box. |
| inline action (3.2) | own row, natural width, start-aligned. Labels wider than the line break (`--lc-btn-overflow-wrap: anywhere`), as TD-1. |
| text link (3.12) | own row, no indent, `fit-content`, breaks anywhere (as 3.12) |
| stacked (3.3) | the 3.3 phone look (one per line, full width, 8 apart) without the indent |
| dismissed, empty action | unchanged (`--hidden`; `.lc-alert__action:empty` hidden, so no row gap) |
| overflow | DE hyphenates with `lang="de"`. Without `lang` (or with `lang=""`) a word wider than the line breaks at the last letter that fits. At a 73 px line, a word with no hyphenation point that is wider than the line still breaks ("nicht\|s", 75 px). |
| loading, disabled, error | n/a (the alert has no such states) |

## 5. Theming

No colour, border, radius or type change. The narrow layout uses the same fills, ink and icon colours. Contrast is computed from the colours in the *All Variants* story at 360, composited over the canvas (#fff / rgb(10,18,27)); the values are the same in the narrow layout:

| Element | Light | Dark | Contrast light / dark |
|---|---|---|---|
| text `--color-text-primary` on the fill | #111827 | #f1f6f8 | info 14.13 / 15.28 · success 16.00 / 14.63 · warning 15.95 / 13.90 · error 13.66 / 16.70 |
| icon `--color-info / success / warning / error` on the fill | same values in both themes | — | info 4.92 / **2.70** · success **2.45** / 5.86 · warning **2.03** / 6.71 · error 6.46 / **2.17** |
| padding | `--lc-density-padding-sm` (12 px cosy) | same | — |

**AC-8 premise:** the icon is not at 3:1 in 4 of the 8 variant/theme pairs, and this is already the case in 3.13. The icon is decorative by default, which 1.4.11 exempts. With `iconAriaLabel` it carries meaning, and then those four pairs fail 1.4.11. This request doesn't change the icon colours (spec: no colour changes). Suggested follow-up gap: tune the variant icon colours per theme. New tokens: none.

## 6. Accessibility

- **Semantics:** the DOM is unchanged; `role` and `aria-live` are as before. `display: contents` sits on a `div` without a role, so the accessibility tree is unchanged; the reviewer checks this with an AX tree. The icon stays decorative unless `iconAriaLabel` is set.
- **Order:** content and actions get `order: 1`, the same mechanism 3.3 uses for stacked actions. The × stays at the end of the first row, which is visually before the content, and last in focus order, as in every layout since 3.2. Focus order is unchanged: links in the content, then the action, then the ×.
- **Targets:** the × is 28 × 28 at 100 % and 36 × 36 at 200 %, the same as 3.13 and not reduced (it was already below 44 px; not in scope). The text link keeps 44 px except where its line is narrower than 2.75rem. At 200 % that line is still at least 73 px, so the link is at least 44 CSS px.
- **forced-colors:** no new colour declarations, and the 1 px border stays. **Reduced motion:** no new transition. **Reflow (1.4.10):** at 320 px and 200 % text, `scrollWidth` equals the viewport (320).

## 7. Texts

There are no new built-in strings. The docs are written in English (repository rule). The stories demonstrate DE and EN content with the consumer's real strings (life-os `site.md` R-057), except the EN title, where AC-3's "Not registered" is used because it is longer than the live "Not added".

| Use | EN | DE |
|---|---|---|
| title / message (reproduction) | Not registered / We kept nothing. Please try again later. | Nicht eingetragen / Wir haben nichts gespeichert. Versuch es später noch einmal. |
| story 2 extras | — | „Benachrichtigungseinstellungen gespeichert“ / „Sie gelten ab sofort auf allen Geräten.“, `closeAriaLabel` „Hinweis schließen“; *With Action*, *Link Action* and *Stacked Actions* strings reused |
| story 3 | Export ready / Your CSV file is ready to download. · Storage almost full / You have used 90% of your quota. (dismissible) · Connection failed / Unable to reach the server. + sm outline "Retry" · Your changes have been saved. (no title) | — |

Docs text (AC-11), for the component description and story 1: "When the space inside the alert's border is below 16rem (alerts under 258 px at 100 % text, 514 px at 200 %), the alert switches to a narrow layout (TD-1). There, long words hyphenate with `hyphens: auto`, which needs the page's `lang` (for example `<html lang="de">`). Without a `lang`, a word wider than the line still breaks, without a hyphen, so no text leaves the alert."

## 8. Stories

All three stories use the next-step-card `textSize` pattern where noted (`[attr.data-lc-story-text]` plus the `::ng-deep html:has(…)` style, and an argType with a description and a default of `'200%'`).

| Story (name) | Expected ID | Args | Shows |
|---|---|---|---|
| Narrow Container at 200 % Text (G-WL4) | `feedback-alert--narrow-container` | `textSize: '200%'` | three 123 px boxes (`width: 123px`), column, gap 16: `lang="de"`, `lang="en"` and `lang=""` (DE text), each `variant="error"` + title + message. The G-WL4 reproduction (AC-2, AC-3, AC-11). |
| Narrow Layout (phone at 200 % text) | `feedback-alert--narrow-layout` | `textSize: '200%'` | default padded layout, `lang="de"`, gap 16: plain error · dismissible info with a long compound · inline sm outline button · text link (`CONTACT_LINK`) · stacked (two lg buttons, `iconAriaLabel="Warnung"`) · success without title. At 100 % it shows the wide 3.13 look (AC-4, AC-5). |
| Narrow Layout in a Side Column (100 % text) | `feedback-alert--narrow-column` | none | a 240 px column (EN, `lang="en"`, the 4 alerts of §7), then a 257 px box (narrow) and a 258 px box (wide), each with the first alert: the threshold (AC-4, AC-5 at 100 %) |

The 13 existing alert stories stay unchanged.

## 9. Verification

Baseline: `tmp/story-shots/018/baseline`, 27 stories (13 alert, 8 error-display, `form-input--error-summary`, 3 password-input with an alert at load, 2 density docs), widths 360/1024/1280, light and dark, `--full`, 162 shots, main 5faaaf5. The story list comes from a sweep of all stories for `lc-alert` (`tmp/018/sweep-{360,1024}.log`).

| AC | How | Expected value |
|---|---|---|
| AC-1 | Jest: in `@container lc-alert (width < 16rem)`, title and content `overflow-wrap: break-word` + `hyphens: auto`; `.lc-alert__body { min-width: 0 }` unchanged. Story 1: computed styles. | computed `break-word` / `auto` at 123 px; `normal` / `manual` in wide alerts |
| AC-2 | story 1 at 320 and 360, light, 200 %: `scrollWidth ≤ clientWidth` (alert, title, content); max line-rect right ≤ alert right | DE: 0 px outside (3.13: title +111.4, content +106.7). Icon x = alert x + 25, title and content x = alert x + 25, w 73, alert h 895 (SF). Page `scrollWidth` 320 / 360. |
| AC-3 | same, EN block | 0 px outside (3.13: +87.5 / +54.8); h 566 |
| AC-4 | Jest: the query text `(width < 16rem)`, `display: contents`, `padding: var(--lc-density-padding-sm`, content `order: 1`. Story 2 at 360 / 200 %: boxes. Story 3: 240 vs 256. | 296 alert: padding 24, icon x 57, title x 105 y = icon y, content x 57 w 246. 240 and 257: padding 12, title x = alert x + 49. 258: padding 16, title x = alert x + 53 (wide). Story 2 at 100 %: padding 16, title x 69. |
| AC-5 | story 2 at 320 / 360 (200 %) and story 3: × box, action and link rects | × 36 × 36 (200 %) / 28 × 28 (100 %), right edge = inner right + 4. Every action and link x = inner start, right ≤ inner right. Stacked buttons full width, 8 apart. Over = −1 everywhere (measured in prototype). |
| AC-6 | `--compare` against the baseline plus a measure of `lc-alert` widths | widths as in the sweep (for example 328 / 992 / 1248 alert stories) |
| AC-7 | `story-shots --stories=<27 ids> --widths=360,1024,1280 --themes=light,dark --full --compare=tmp/story-shots/018/baseline` | 160 identical; **2 expected diffs**: `design-tokens-density--side-by-side` at 360, light and dark (51.3 px alerts, narrow) |
| AC-8 | story 2, light and dark; colours computed as in §5; SCSS scan: no `forced-color-adjust`, no new `transition` | colours equal 3.13 (§5 values) |
| AC-9 | Jest: DOM order icon, body (title, content), action, close unchanged; review: AX tree plus Tab order on story 2 | the same role, name and order as at 100 % |
| AC-10 | static SCSS only; release-manager runs `check-angular-majors` | passes on 21 and 22 |
| AC-11 | story 1 description and the component docs bullet (§7) | text present; the `lang=""` block shows breaks without hyphens and nothing outside |
| AC-12 | existing assertions unchanged (alert spec l. 345/353; link spec l. 94–139); new specs for AC-1 and AC-4; changelog names G-WL4, 123 px, +111.4 → 0 | full suite green |

### Risks for the build (from the prototype)

- **R1 specificity.** The narrow action rule must beat four existing rules:
  - link < 36rem `… :has(> .lc-alert__action > a:where(:not(.btn))) > .lc-alert__action`: (0,5,1), margin-top and max-width;
  - link indent: (0,3,1);
  - stacked indent `.lc-alert--actions-stacked.lc-alert--with-icon .lc-alert__action`: (0,3,0);
  - stacked `margin-top`: (0,2,0).

  Repeat classes as in `.btn.btn-inline` and add a comment. The prototype used `.lc-alert.lc-alert .lc-alert__container > .lc-alert__action.lc-alert__action.lc-alert__action` (0,6,0). Don't rewrite the existing indent rules: the specs match them literally.
- **R2 order.** Put the narrow block after the `.lc-alert__close` rule. The link `min-width` cap and the × margin win by source order. The specs' `ruleFor()` reads the *first* rule with a given selector, which must stay the base rule.
- **R3** Keep `hyphens` and `break-word` inside the query (§1, measured). Don't change `.lc-alert__body { flex: 1; min-width: 0 }`.
- **R4 shot noise.** `design-tokens-density--side-by-side` at 1024 differs after any 400 ms wait in a measure, even with no CSS change. Compare it without a measure.
- **R5 out of scope, for the changelog's "known" note.** Between 256 px and about 400 px at 100 %, an inline (3.2) button action still squeezes the text column: at 288 px (320 viewport) the body is 61.7 px wide; it is 101.7 px in *With Action* at 360. This is unchanged from 3.13; `actionsLayout="stacked"` avoids it.
