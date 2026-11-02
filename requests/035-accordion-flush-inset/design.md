# Design 035: lc-accordion flush form without inline padding

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-13
- **Prototype:** CSS injected into `components-accordion--flat-variant` / `--sizes` at 3.22.4 (`tmp/story-shots/035/proto*`): title x 0, body x 0, chevron end 0, ring 2 px at −8…−6 px, sm header 44, collapsed panel 0 px, bleed hit-tests to the header.

## 1. Approach

Extend `lc-accordion` with a third **`variant` value `'plain'`**: no border, no background, no inline inset.

- A value, not an `inset` input: zero inset only makes sense without a border and surface (with `outlined` the text would sit on the border), so a separate input would have a meaningless combination. The consumer's migration is one attribute (`variant="flat"` → `"plain"`).
- Follows lc-button `[flush]` (3.9, AS-26): inline padding 0, block padding and the 44 px target kept, the focus ring reaches past the edge, and the consumer leaves room for it. Ring look as today's header ring (2 px `--color-primary`, offset −2, radius md); forced colours use `Highlight` as lc-button does.
- The plain header paints its hover background and focus ring on a `::before` **bleed box** that reaches `--lc-accordion-header-bleed` (8 px) past the text on both inline sides and stays inside the header vertically. The text box sits at the edge, yet neither paint touches glyphs or neighbouring content.
- No template or logic change: `lc-accordion--plain` already follows from `` `lc-accordion--${variant}` ``. Every new rule is scoped under `.lc-accordion--plain`.
- Rejected: negative margin plus padding on the button (padding would not be 0, and a hook with inline 0 would move the text 8 px out); `outline-offset: +6px` on the button (the ring would reach 8 px above and below the header into the content around it).

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (type widened) | `variant` | `AccordionVariant` | `'outlined'` | Visual variant. `'outlined'`: border and surface. `'flat'`: no border or background; header and body keep their inset. `'plain'`: no border, background or inline inset, so the title, chevron and body line up with the content edge of the sheet or card around it; the hover background and focus ring reach 8 px past that edge (`--lc-accordion-header-bleed`), so keep that much room before a clipping edge. @default 'outlined' |
| type (new export) | `AccordionVariant` | `'outlined' \| 'flat' \| 'plain'` | — | Visual variant of `lc-accordion`. |
| CSS hook (new) | `--lc-accordion-header-bleed` | `<length>` | `var(--spacing-2)` (8 px) | `plain` only: how far the header's hover background and focus ring reach past the text into the gutter. From 4 px the ring keeps ≥ 2 px from the glyphs; `0px` puts it on the text. Must be a length: a unitless `0` makes the `calc()` invalid and removes the box, ring and hover included (review r1, finding 1). Read at the use site, never declared on the host (020 pitfall). |
| CSS hooks (existing) | `--lc-accordion-header-padding`, `--lc-accordion-body-padding` | shorthand | plain fallbacks in §3 | Still win when set. In `plain`, set only block values (inline ≠ 0 moves the text off the edge, and the body would shift while expanding). |
| CSS hooks (existing) | `--lc-accordion-header-bg`, `-hover-bg`, `-border` | — | as today | In `plain` they paint the bleed box instead of the button, so a tint or border never touches or moves the text. |

Default rendering unchanged: the default stays `'outlined'`, the template is untouched, and all new CSS sits under `.lc-accordion--plain` (with no `::before` on other variants). The 90 baseline shots must stay hash-identical (§9, AC-8). `lc-accordion-group` has no `variant` input, so there is nothing to forward; plain children work as they are. Semver: minor (3.23.0).

## 3. Anatomy and layout

| Part (plain) | sm | md | lg | Token / note |
|---|---|---|---|---|
| Header padding (hook fallback) | `0.625rem 0` | `0.875rem 0` | `1.125rem 0` | block as today, inline 0 |
| Header min-height | 44 | 44 | 44 | `var(--size-min-touch-height)`; heights 44 / 50.5 / 61.5 (sm today 40) |
| Title | 13/19.5 | 15/22.5 | 17/25.5 | unchanged, 600, −0.01em |
| Chevron | 20 × 20 | 20 × 20 | 20 × 20 | end inset 0 (trailing); x 0 with `leading`; gap 12 (`0.75rem`) unchanged |
| Body padding, collapsed | `0` | `0` | `0` | today `0 0.875/1.125/1.375rem` |
| Body padding, expanded (hook fallback) | `0.625rem 0 0.75rem` | `0.875rem 0 1rem` | `1rem 0 1.25rem` | block as today |
| Bleed box `::before` | | | | `inset-block: 0`, `inset-inline: calc(-1 * var(--lc-accordion-header-bleed, var(--spacing-2)))`, `border-radius: var(--border-radius-md)` (12), `z-index: -1` in a header with `position: relative; isolation: isolate` |
| Focus ring | | | | 2 px solid `--color-primary` on the `::before`, offset −2: band at −8…−6 px before the title box and +6…+8 px after the chevron; vertically inside the header box |

- Container `.lc-accordion--plain`: `border: none`, `background: transparent`, `overflow: visible` (today's `hidden` would clip the bleed).
- Panel and body in plain: `overflow-x: visible; overflow-y: clip`. The 0fr collapse still clips (prototype: panel 0 px), and focus rings of body content (a flush link reaches 4 px out) are not cut at the start edge.
- Title in plain: `min-width: 0; overflow-wrap: break-word; hyphens: auto; hyphenate-limit-chars: 12 4 3; text-align: start` (lc-alert and 025 pattern). Logical properties for all new rules.
- **Specificity:** the size rules (`.lc-accordion--sm.lc-accordion--expanded .lc-accordion__body`, 0,3,0 plus `_ngcontent`) beat a plain rule of equal weight placed earlier. In the prototype, sm and lg bodies kept 14 / 22 px. Put the plain block after the size rules and give it at least the same weight, per size.

### 360 px — *Plain in a Card* (card `padding="lg"`, `lang="de"`)

```
x  16 17       33     41                                   299  319    327   343 344
   |card|      |bleed |content 278 ─────────────────────────────────|bleed|  |card|
              Betrag              −42,90 €                     ← dt x 41
              Datum               2. Nov. 2026
           ╭──────────────────────────────────────────────────────────╮ ← hover/ring box 33–327, r 12
           │  Quelle ansehen                                   [^]    │  header 41–319, h 50.5; chevron 299–319
           ╰──────────────────────────────────────────────────────────╯
              Quelle: Sparkasse KölnBonn (FinTS)            ← body x 41, top padding 14, 14 px / 1.6
              Abgerufen am 2.11.2026, 08:15
              Abrufprotokoll öffnen                         ← lc-button link [flush], text x 41, ring from 37
           ╭──────────────────────────────────────────────────────────╮
           │  Herkunft und Abrufzeitpunkt der                  [v]    │  2 lines (230 px + "Buchung"), h 73
           │  Buchung                                                 │
           ╰──────────────────────────────────────────────────────────╯
```

*Plain Variant* at 360: wrapper 16–344 (328), title x 16, chevron 324–344, ring box 8–352, body x 16.

### From 1024 px (1280 shown)

```
x  8 16                                                        576 584
   ╭──────────────────────────────────────────────────────────────╮   Plain Variant: wrapper max-width 560
   │ Show source                                            [^]   │   header 16–576, ring box 8–584
   ╰──────────────────────────────────────────────────────────────╯
     LifeCorner keeps the bank's raw data for 90 days …              body x 16
```

*Plain in a Card* at 1024 and 1280: wrapper max-width 480, card 16–496, content 41–471; the long German title fits one line (296 of 398 px).

## 4. States

| State | Plain |
|---|---|
| Default | transparent; title `--color-text-primary`, chevron `--color-text-secondary` |
| Hover | bleed box `var(--lc-accordion-header-hover-bg, var(--color-surface-hover))`; chevron → text-primary (as today). The button's own background stays transparent. |
| Focus-visible | button `outline: none`; ring on the bleed box (§3). With hover, the ring is drawn over the hover fill. |
| Active | no own style (as flat) |
| Disabled | container opacity 0.5 and `pointer-events: none` (as today); not focusable |
| Loading / lazy | `[lazy]` body absent until the first open; header unchanged |
| Empty | `title=''`: chevron only, still 44 px high |
| Error | n/a |
| Expanded / collapsed | chevron −180° (as today); body inline start constant at 0 in both and in between |
| Overflow | long DE title wraps at spaces, compounds ≥ 12 letters hyphenate; 30-letter compound 227 px fits 246. Many items: the bleed is inline only, so stacked headers never overlap (group gap 8). |

## 5. Theming

Contrast computed in the browser with the WCAG formula on resolved tokens (`tmp/story-shots/035/contrast`); translucent hover composited over the surface.

| Element | Light | Dark | Contrast L / D (computed) |
|---|---|---|---|
| Ring vs page / surface (`--color-primary` #208497 / #84c7d4) | on #ffffff | on #0a121b / #101c26 | 4.37 / 9.95 (page), 9.13 (surface) |
| Ring vs `--color-surface-2` (card and sheet gradient end) | #f9fafb | #1a2c3a | 4.18 / 7.58 |
| Ring vs hover fill (worst adjacent) | #f3f4f6 | rgba(132,199,212,.06) over surface-2 | **3.97 / 6.69** (min, ≥ 3 ✓) |
| Title `--color-text-primary` | surface / hover | surface-2 / hover | 17.74 / 16.12 · 13.16 / 11.62 |
| Body `--color-text-secondary` | surface / surface-2 | surface / surface-2 | 7.56 / 7.23 · 11.16 / 9.26 |
| Chevron `--color-text-secondary` | surface-2 | surface-2 | 7.23 / 9.26 |
| Hover fill vs surface | | | 1.10 / 1.12 (hover is a non-essential cue, as flat today) |
| Forced colours | ring `outline-color: Highlight` | same | system |

No new colour token.

## 6. Accessibility

- **Semantics, ARIA, keyboard:** unchanged (heading > `button`, `aria-expanded`/`aria-controls`, `region`, `inert` collapsed panel; Enter/Space). No DOM change.
- **Target:** header ≥ 44 × full width at every size; the bleed box is part of the button's hit area (prototype: `elementFromPoint` 4 px before the header → header).
- **Focus:** ring per §3, ≥ 6 px from the glyphs inline and ≥ 10 px vertically (sm: title top 12.25), never clipped by the accordion. Focus order unchanged.
- **Forced colours:** `@media (forced-colors: active)` → `.lc-accordion--plain .lc-accordion__header:focus-visible::before { outline-color: Highlight }`. Without it Chromium forces CanvasText (measured), so the rule keeps the kit convention.
- **Reduced motion:** in plain, `transition: none` on panel, body, icon, header and `::before`. The global rule only shortens durations to 0.01 ms and leaves the body's 50–300 ms delays.
- **Announcements:** none new. axe: one plain case in `accordion.axe.spec.ts`.

## 7. Texts

No built-in strings (the title is consumer content). Story strings:

| Story | EN | DE (`lang="de"`) |
|---|---|---|
| Plain Variant | above: "Booked on 2 Nov 2026 from the household account." · title "Show source" · body "LifeCorner keeps the bank's raw data for 90 days, then only the booking itself." | — |
| Plain Sizes | "Small plain accordion", "Medium plain accordion", "Large plain accordion", "Leading chevron"; body "Body text starts at the same edge as the title." | — |
| Plain in a Card | — | dl: Betrag "−42,90 €", Datum "2. Nov. 2026", Konto "Gemeinsames Girokonto" · "Quelle ansehen" · body "Quelle: Sparkasse KölnBonn (FinTS)", "Abgerufen am 2.11.2026, 08:15", link "Abrufprotokoll öffnen" · "Herkunft und Abrufzeitpunkt der Buchung" · body "Die Bank hat diese Buchung beim täglichen Abruf geliefert." |

## 8. Stories (`accordion.stories.ts`)

| Story (export / name) | Expected ID | Args / template | Shows |
|---|---|---|---|
| `PlainVariant` / "Plain Variant" | `components-accordion--plain-variant` | args **all bound ones declared** (023 pitfall): `title: 'Show source', variant: 'plain', size: 'md', disabled: false, expanded: true, chevronPosition: 'trailing'`; `<div style="max-width: 560px">`, a `<p style="margin: 0 0 4px; font-size: 14px; color: var(--color-text-secondary)">` above | AC-1/2/5/6/7/12: alignment, ring, toggle |
| `PlainSizes` / "Plain Sizes and Chevron" | `components-accordion--plain-sizes` | max-width 560, column gap 8: sm, md, lg `[expanded]="true"`, then md `chevronPosition="leading"` collapsed | AC-1/3/4 |
| `PlainInCard` / "Plain in a Card (Sheet Alignment)" | `components-accordion--plain-in-card` | `moduleMetadata({ imports: [CardComponent, DescriptionListComponent, ButtonComponent] })` (033 r1: without imports nothing renders); `<div lang="de" style="max-width: 480px">` › `<lc-card padding="lg">` › `<lc-description-list [items]>` (3 rows), plain "Quelle ansehen" `[expanded]="true"` with 2 `<p style="margin: 0">` + `<lc-button variant="link" [flush]="true">`, plain long title collapsed | AC-2/10/13: alignment with the text above, DE wrap, body ring room |

Meta: `variant` argType `options: ['outlined', 'flat', 'plain']`, description "Visual style — `outlined` adds a border, `flat` blends with the page, `plain` also drops the inline inset so the text lines up with the content around it", `table: { defaultValue: { summary: "'outlined'" } }`. Add a "Plain" bullet to the docs description. Existing stories unchanged.

## 9. Verification

Baseline: `tmp/story-shots/035/baseline` (90 shots: the 9 accordion + 6 accordion-group stories × 360/1024/1280 × L/D, no `--full`, 3.22.4 af12033).

| AC | How | Expected value |
|---|---|---|
| AC-1 | spec: `variant="plain"` → `lc-accordion--plain`, no `--flat`/`--outlined`; story measure *Plain Sizes* 360: header `padding-inline-*`, body `padding-inline-*` expanded, then after a header click (collapsed) | all `0px` at sm, md, lg |
| AC-2 | *Plain Variant* 360: title box x − wrapper x; body `p` x − wrapper x | 0 ± 0.5; wrapper width 328 |
| AC-3 | header height, *Plain Sizes* 360 and 1280 | 44 / 50.5 / 61.5; leading row 50.5 |
| AC-4 | wrapper right − chevron right (trailing); leading: chevron x − wrapper x, title x − chevron right | 0; 0, 12 (title x 32) |
| AC-5 | focus header (`focus()`, `:focus-visible` true), `getComputedStyle(h, "::before")`; shot 360 L/D; `--forced-colors` shot | outline `solid 2px` rgb(32,132,151) L / rgb(132,199,212) D, offset −2px, left/right −8px; ring inside the viewport (x 8–352); forced: Highlight; contrast ≥ 3.97 L / 6.69 D |
| AC-6 | body `p` x collapsed, expanded, and at mid-transition (inject `transition-duration: 300ms !important` on the body, click, read at 150 ms) | 0 in all three |
| AC-7 | rule check: plain `:hover::before` background = `--color-surface-hover`, inset −8; under emulated reduced motion `transitionProperty` of body, panel, icon, header = `none` | glyphs 8 px from the fill edge; `none` |
| AC-8 | `--compare=tmp/story-shots/035/baseline` on the 15 existing stories | 90/90 identical; existing specs unchanged and green |
| AC-9 | `accordion.component.spec.ts` + new plain case in `accordion.axe.spec.ts` | green, 0 violations |
| AC-10 | *Plain in a Card* 360: long title line count, header `scrollWidth ≤ clientWidth`, height, chevron end | 2 lines ("…der" / "Buchung"), no overflow, 73 px, chevron end = content end (319) |
| AC-11 | compat: add `<lc-accordion variant="plain" title="Quelle ansehen">Quelle</lc-accordion>` to `tools/compat/template/src/app/home.html` and `['plain accordion', /class="[^"]*lc-accordion--plain/]` to `EXPECT_IN_HTML` | match on 21 and 22 |
| AC-12 | shots of the 3 new stories at 360/1024/1280 L/D; focused shot from AC-5 | rings visible in both themes; group: n/a (no `variant` forwarding) |
| AC-13 | JSDoc `@default 'outlined'`, argType §8, `PlainInCard`: dt x = title x = body x = link text x | 41 at 360 |

**Change note (review r1, 2026-11-02):** §2 said a bleed of "0" puts the ring on the text. Measured: only `0px` does; unitless `0` gives a 0 px wide `::before` (no ring, no hover). Corrected in §2; the CHANGELOG states it. Code unchanged.

Changelog hint for life-os (BA-9): replace `variant="flat"` and the interim `style` with `variant="plain"`; the interim hook values equal the plain md defaults, so leftovers render the same.
