# Design 059: lc-device-frame and lc-picture, lc-select clearable, lc-description-list total whitespace, lc-list item ariaLabel

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-20. Prototypes on 3.38.0 (9bab9d1): `tmp/story-shots/059/{frame-proto,dl-proto}-measure.js`, logs `proto-*.log`.

## 1. Approach

| Item | Kind | Follows | Decision |
|---|---|---|---|
| `lc-device-frame` | new entry `device-frame` | badge/avatar sizes; host is the frame (no wrapper div) | **D-1** The bezel is black glass in both themes (`colors.$color-neutral-900`, theme-independent like the hero bands); the **rim** (1 px, outermost) carries the 3:1 boundary per theme (`--color-field-border`). Bezel vs dark page is 1.02–1.24, so a per-theme bezel colour alone can't pass AC-6. **D-2** The notch is a pill in a deeper top bezel (3 × bezel), never over the screen (AC-3). |
| `lc-picture` | new entry `picture` | `lc-logo` / `lc-character` light-dark pair | **D-3** With a dark variant both `<picture>`s are in the DOM and the root theme class shows one (logo's selectors), so the swap follows ThemeService, `system` and the no-flash script with no JS. `media="(prefers-color-scheme)"` was rejected: it ignores a manual theme. Measured: a `loading="lazy"` img in a `display: none` picture is **not fetched**, an eager one is. **D-4** Stories use labelled SVG data-URI stand-ins (720 × 1560), even behind `type: 'image/avif'` sources (measured: the source is chosen and decoded). No binary assets: `src/assets` ships with the package. |
| `lc-select` | input `clearable` | 3.37 lg room rule | **D-5** 057-n1: xs/sm/md reserve the ×'s room only while the × is in the DOM (`:has`), as lg does. The table's page-size select (always valued; its × was hidden by the hook and a click blanked the field) gets `[clearable]="false"`. |
| `lc-list` | field `ListItem.ariaLabel` | `actionAriaLabel` | **D-6** The split row's default name comes from the item's data joined by `", "` (`aria-label`), so parts are separated and the action drops out (057-n5). |
| `lc-description-list` | fix | 3.37 D-4 spaces, 3.26 equal share | **D-7** Single spaces in the text (AC-17). **D-8** A rows-layout row wraps its value onto its own line, right-aligned, when term and value can't each keep `min(100%, 6em)` (or their whole text) beside each other. Terms hyphenate long compounds. AC-18. |

## 2. Public API

**lc-device-frame** (`@lifecorner/angular-ui-kit/device-frame`, `DeviceFrameComponent`, selector `lc-device-frame`)

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | `device` | `DeviceFrameDevice` | `'phone'` | The device drawn around the media. Only `'phone'` today; more may follow. |
| input | `size` | `DeviceFrameSize` | `'md'` | Width step: `sm` 200 px, `md` 248 px, `lg` 320 px (never wider than the container). Bezel and corner radius grow with it. |
| input | `notch` | `boolean` (`booleanAttribute`) | `false` | Draws a decorative camera pill in a deeper top bezel. It never covers the media. |
| slot | default `<ng-content>` | — | — | The media: `lc-picture`, `<img width height>`, `<video>` or any element. It fills the screen width; its own ratio sets the height. |
| CSS hook | `--lc-device-frame-width` | length | 200px / 248px / 320px | Outer width; `max-inline-size: 100%` still applies. |
| CSS hook | `--lc-device-frame-bezel` | length | `--spacing-1-5` 6 / `--spacing-2` 8 / `--spacing-2-5` 10 | Bezel thickness including the 1 px rim. A bare `0` works. |
| CSS hook | `--lc-device-frame-radius` | length | `--border-radius-xl` 24 / `--border-radius-2xl` 32 / `calc(2xl + 2-5)` 42 | Outer radius; the screen radius is `max(0px, radius − bezel)` (18 / 24 / 32, concentric). |
| CSS hook | `--lc-device-frame-bezel-color` | colour | `$color-neutral-900` #111827 (both themes) | The glass around the screen. |
| CSS hook | `--lc-device-frame-rim-color` | colour | `var(--color-field-border)` | The 1 px outer edge; keep it ≥ 3:1 to the page. |
| CSS hook | `--lc-device-frame-notch-color` | colour | `$color-neutral-700` #374151 | The camera pill (decorative). |
| CSS hook | `--lc-device-frame-shadow` | shadow | `var(--elevation-2)` | `none` turns it off (dark: 40 px below, 32 px sideways; mind scroll rows). |
| CSS hook | `--lc-device-frame-screen-bg` | colour | `var(--color-surface)` | Shows until the media has loaded. |
| type | `DeviceFrameDevice` / `DeviceFrameSize` | `'phone'` / `'sm' \| 'md' \| 'lg'` | — | Exported from the entry. |

**lc-picture** (`@lifecorner/angular-ui-kit/picture`, `PictureComponent`, selector `lc-picture`)

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | `src` | `string` (`input.required`) | — | Fallback image URL, used when no source matches. |
| input | `alt` | `string` (`input.required`) | — | Text alternative; `''` marks the image decorative. Say what the image shows, not "screenshot of". |
| input | `width` / `height` | `number` (`input.required`, transform: `number \| string` → positive integer, else dev warning and no attribute) | — | Intrinsic size (CSS px at 1x, e.g. 360 × 780 for a 720 × 1560 file). Reserves the box before load. Every source must have this ratio. |
| input | `sources` | `readonly PictureSource[]` | `[]` | `<source>` elements in this order before the `<img>` (AVIF first, then WebP). |
| input | `srcset` / `sizes` | `string` | `''` (no attribute) | For the `<img>`. `sizes` is also the default `sizes` of every source; set it with `w` descriptors. |
| input | `darkSrc` / `darkSrcset` | `string` | `''` | Dark-theme fallback. With it (or a source with `theme: 'dark'`), the picture follows the app theme. |
| input | `loading` | `PictureLoading` | `'lazy'` | `eager` above the fold. With theme variants `lazy` fetches only the visible one; `eager` fetches both. |
| input | `decoding` | `PictureDecoding` | `'async'` | Written as is. |
| input | `fetchpriority` | `PictureFetchPriority` | `'auto'` (no attribute) | `high` for the LCP image. |
| CSS hook | `--lc-picture-radius` | length | `0px` | Corner radius of the image (e.g. `calc(var(--border-radius-xl) - 1px)` in an outlined `xl` card). |
| CSS hook | `--lc-picture-min-width` | length/% | `0px` | `100%` makes the image fill its container even when that is wider than `width`. `lc-device-frame` sets it on its screen. |
| type | `PictureSource` | `{ srcset: string; type?: string; sizes?: string; media?: string; theme?: PictureTheme }` | — | A source without `theme` serves both themes. |
| type | `PictureTheme` / `PictureLoading` / `PictureDecoding` / `PictureFetchPriority` | `'light' \| 'dark'` / `'lazy' \| 'eager'` / `'async' \| 'sync' \| 'auto'` / `'auto' \| 'high' \| 'low'` | — | Exported. |

DOM: without a dark variant there is one `<picture class="lc-picture__picture">` with all sources. With one there are two pictures, `--light` (sources with `theme !== 'dark'`, `src`/`srcset`) and `--dark` (sources with `theme !== 'light'`, `darkSrc || src`, `darkSrcset`, or `srcset` when there is no `darkSrc`). In each picture the sources come first. The img attributes are written as attributes in this order: `loading`, `decoding`, `fetchpriority`, `width`, `height`, `alt`, `sizes`, `srcset`, `src` (012). **The img's bindings run after the sources' bindings**: the `@for` views refresh after the parent's own bindings, so put the `<img>` in an `@if` after the `@for`. A MutationObserver test pins it. Hooks are read at the img only and never declared on `:host` (020).

**Extensions**

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (select) | `clearable` | `boolean` (`booleanAttribute`) | `true` | Whether a selected value shows the clear (×) button. `false` for selects that always have a value (sort, level, page size): no button is rendered, the value text gets its room and the tab order loses that stop. |
| field (ListItem) | `ariaLabel?` | `string` | none | Accessible name of the row's control: the `<a>` of an `href` row, the `role="button"` row, or the split row's native button. Include all the row's visible text in order (WCAG 2.5.3; axe `label-content-name-mismatch`), e.g. „Zu Lücken, 3 offen" for a row that shows „Lücken" and „3 offen". Ignored on rows that are neither `href` nor `clickable` (dev warning). |
| hook doc (select) | `--lc-select-clear-display` | — | — | Docs: "`none` hides the × but keeps its room at every size (since 3.39; lg since 3.37). Use `clearable="false"` instead." |

Default rendering unchanged: frame and picture are new. `clearable` true keeps the DOM, because the condition is added to the existing `@else if` and no anchor is added. `ariaLabel` uses `[attr.aria-label]="item.ariaLabel?.trim() || null"`, which writes no attribute. The dl and select CSS was prototyped hash-neutral (§9).

## 3. Anatomy and layout

### 360 px (Default story, md, canvas padding 16)

```
x16                               x264   rim 1 px --color-field-border, radius 32
╭────────── bezel 8 #111827 ───────╮      notch (if on): pill 63.96 × 8 at x+92.02, y+8,
│ ╭──── screen 232 × 502.67 ─────╮ │      top bezel 24 → frame 534.67 high
│ │ lc-picture 360×780 → 232 wide│ │      screen radius 24, overflow hidden, bg --color-surface
│ │ (ratio 0.46154 = 6/13)       │ │      shadow --elevation-2
│ ╰──────────────────────────────╯ │
╰──────────────────────────────────╯      frame 248 × 518.67 (no notch)
sm 200: bezel 6, r 24/18, screen 188 × 407.33, frame 419.33 / 431.33 notch
lg 320: bezel 10, r 42/32, screen 300 × 650, frame 670 / 690 notch (fits 328; 312 in app-page)
```

Screenshot row (life-os §6) at 360: the row bleeds to the canvas edges (`margin-inline: -16px; padding-inline: 16px`), with `gap: 16`, `overflow-x: auto`, `scroll-snap-type: x mandatory`, `padding-block-end: 8`. The figures are `flex: 0 0 248px` at x 16 / 280 (80 px of the second figure show). Each figure is a column: a frame slot (`block-size: 535px`, `display: flex; align-items: flex-end`, so the 360 × 560 shot's frame, 248 × 392.89 with the notch, sits on the same baseline), then 8 px, the badge (xs, wrap), 8 px, the caption (14/21, `--color-text-secondary`, 2–4 lines).

### From 1024 px (1280 the same; section width ≤ 928)

```
x16      x236 x252     x472 x488     x708 x724     x944
┌frame 220┐   ┌frame 220┐   ┌frame 220┐   ┌frame 220┐   flex: 1 1 0; max-width 220; no scroll
│screen 204 × 442, notch 56.7 × 8, frame 474 high (short shot 204 × 317.33 → 349.33)│
(● in Erprobung)  …                           (● als Nächstes, noch nicht gebaut)
caption 14/21 secondary, wraps in 220
```

| Element | Size / spacing | Type | Token |
|---|---|---|---|
| frame | width per size, padding `max(0px, bezel − 1px)`, border 1 px; with a notch padding-top `3 × bezel − 1px` | — | spacing / radius tokens above |
| notch | `position: absolute; top: bezel − 1px; inset-inline: 37%; block-size: bezel`, radius full | — | `--border-radius-full` |
| screen | `overflow: hidden`, radius `max(0px, r − b)`; direct children (`> ::ng-deep *`) get `display: block; inline-size: 100%; block-size: auto`; sets `--lc-picture-min-width: 100%` | alt text 14 px | `--color-text-secondary` |
| picture img | `display: block; max-inline-size: 100%; block-size: auto; min-inline-size: var(--lc-picture-min-width, 0px); border-radius: var(--lc-picture-radius, 0px)` | — | — |
| select xs/sm/md `:has(.lc-select__clear)` | `padding-right: calc(var(--spacing-3) + 1.25rem + var(--spacing-1) + 1.5rem - 0.125rem + var(--spacing-1))` = 62 px: the text box ends 4 px before the × box (W − 58) | — | — |
| dl rows layout | row `flex-wrap: wrap; row-gap: 0`; term and value `flex: 1000000 1 min(100%, 6em)` (basis only changes); value `margin-inline-start: auto`; term `hyphens: auto; hyphenate-limit-chars: 12 4 3`; all scoped to `.lc-dl--rows` | md 6em = 84, sm 72 | — |

Lengths: the hooks feed private `@property` registrations (`<length>`, `inherits: false`, `0px`), declared on the host and on the screen, and only those are used in `calc()`/`max()` (038 pattern; a bare `0` works). The per-size defaults live in private host variables, so ancestor-set hooks win (020).

Select at 360 (*Without Clear Button*): lg field 280: default text box 21–203 (182), so „Mit enthaltenen Se…“ (the requester's cut); × 213–237, tap 203–247, chevron 247–267. With `clearable=false` the box is 21–231 (210) and the text (198.2) ends at 219.2, whole. sm field 192: default box 13–129 then × 133–157; `false` box 13–155 (142), and „Sortierung: Kosten“ (120.1) ends at 133.1, whole.

dl, hero *Fill* at 360 (dl 122): each row is the term on line 1 and the value right-aligned on line 2. Rows are 59 (last 58), and „Rechenzentrum“ is drawn „Rechenzen-|trum“ (80). Value right = row right. Rows that fit at 1280 are unchanged.

## 4. States

| State | Frame | Picture | Select / list / dl |
|---|---|---|---|
| default, hover, active, focus | none (not interactive) | none | unchanged; select × keeps its 3.37 ring/tap area when `clearable` |
| loading | screen bg shows in the reserved box; no spinner | box reserved from `width`/`height` before load (equal ratio) | — |
| error / empty | — | broken src: the browser draws `alt` inside the reserved box; box unchanged | `ariaLabel` on a plain row: not rendered, dev warning |
| disabled | — | — | select: no × already; list disabled href row = plain row (no `ariaLabel`) |
| overflow | `max-inline-size: 100%`; tall media just makes the frame taller | 120-char DE/EN `alt`/caption: caption wraps in 248/220; `alt` is clipped to the box | long select value: ellipsis before the ×; narrow dl: value line below |

## 5. Theming (computed with the WCAG formula in the browser, `proto-frame.log`)

| Element | Light | Dark | Contrast |
|---|---|---|---|
| rim `--color-field-border` vs background / bg-low / surface / surface-2 / sunken | #6b7280 | #93a4ad | L 4.83 / 4.60 / 4.83 / 4.63 / **4.39**; D 7.31 / 6.71 / 6.71 / **5.56** / 7.02 |
| bezel #111827 vs the same | — | — | L 17.74 / 16.88 / 17.74 / 16.98 / 16.12; D 1.06 / 1.03 / 1.03 / 1.24 / 1.02 (rim carries AC-6) |
| rim vs bezel | | | 3.67 L / 6.89 D (the edge reads in both) |
| notch #374151 vs bezel | | | 1.72 (decorative, `aria-hidden`) |
| screen bg `--color-surface` + alt text `--color-text-secondary` | #fff | #101c26 | 7.56 L / 11.16 D |
| caption text-secondary on canvas | | | 7.56 L / 12.17 D (memory 030) |

No new token. Forced colours: border `CanvasText` (explicit rule), bezel and notch become Canvas, shadow none, media untouched.

## 6. Accessibility

- **Frame:** no role, no tabindex, no name; the notch `<span class="lc-device-frame__notch" aria-hidden="true">` only with `notch`. AT reads only the projected media (AC-7).
- **Picture:** the `alt` sits on both imgs; the hidden one is `display: none`, so it is out of the AX tree. `alt=""` is decorative. There is no figure; the pattern is the consumer's `<figure>` + `<figcaption>`, and the caption must not repeat the `alt` (docs and stories).
- **Scroll row (story):** `role="region"`, `aria-label`, `tabindex="0"`, the kit focus ring (`mix.focus-ring` look: 2 px `--color-primary-500`, `Highlight` in forced colours). No targets inside.
- **Select:** with `clearable=false` there is one Tab stop fewer; Escape is unchanged and there is no Backspace handler, as before. The name is unchanged.
- **List:** `ariaLabel` replaces the content name. A name passes `label-content-name-mismatch` only if it holds the row's visible text in order (a name over a row that also shows a subtitle it omits **fails**); hence the JSDoc rule. **Changed in review r1:** the row's parts are adjacent text nodes, so axe read „Lücken3 offen" and all 3 named rows failed (the `probe-list` DOM had spaces the real row lacks). With an `ariaLabel`, each part (label, subtitle, description, badge, metadata) starts with a space in its own text node (`{{ wordBreak(item) }}{{ part }}`, `''` without, so default rows stay byte-identical, AC-15). Split default name: `label, subtitle, description, badge, metadata` (non-empty, trimmed, `", "`).
- **Reduced motion:** nothing moves. **44 px:** no new targets.

## 7. Texts

No new built-in strings. The dev warnings are English console text: `lc-list: ariaLabel names only href or clickable rows; "<label>" is neither.` and `lc-picture: width and height must be positive numbers; the box can't be reserved.` The stories are German, with an EN caption in *Screenshot Row* 1280; every visible string is listed in §8.

## 8. Stories (`title` *Data Display/Device Frame*, *Data Display/Picture*; bind all args or `controls.include`)

| Story | Expected ID | Args / content | Shows (AC) |
|---|---|---|---|
| Default | `data-display-device-frame--default` | device, size md, notch false; a theme-pair lc-picture 360 × 780 („Guten Abend" shot) | AC-1, 2, 4, 7; FC via `--forced-colors` (AC-6) |
| Sizes | `…--sizes` | sm, md, lg in a `flex-wrap` row, `align-items: flex-end`, gap 16; `notch` arg | AC-5 steps |
| Notch | `…--notch` | md, notch | AC-3 |
| Screenshot Row | `…--screenshot-row` | `lang="de"`: H2 „So sieht LifeCorner aus", 4 figures (shot 1 short 720 × 1120), notch on, badges „in Erprobung" (info) ×3 and „als Nächstes, noch nicht gebaut" (primary), captions „Einmal verbinden, nichts abtippen." / „Jeden Tag sehen, was zählt." / „Alle Konten auf einen Blick: Girokonto, Tagesgeld und Kreditkarte mit Stand von heute, und eines davon bleibt nur für dich." (≈ 120) / „Welche Zahlung zu welchem Vertrag gehört.", region `aria-label` „Bildschirmfotos der App" | AC-5, 12, 13; §3 layouts at 360/1024/1280 |
| Card and Frame | `…--card-and-frame` | two 248-px figures: `lc-card` outlined, padding none, radius xl + `--lc-picture-radius: calc(var(--border-radius-xl) - 1px)`; `lc-device-frame` md; captions „Übergang: lc-card" / „lc-device-frame" | AC-5 (2 × 248 at 1280), AC-12 |
| Custom Bezel | `…--custom-bezel` | hooks on a wrapper div (light glass `var(--color-surface-2)`, rim `var(--color-text-secondary)`, radius 40px, shadow none, width 280px) and on a host (bezel `0`) | AC-2 hooks, ancestor rule, bare `0` |
| Any Media | `…--any-media` | bare `<img width="360" height="780">`, and a `<div>` with a heading and text | AC-1 |
| Picture Default | `data-display-picture--default` | src, alt, width 360, height 780, loading, decoding, fetchpriority, srcset, sizes args | AC-10, 11 |
| Sources | `data-display-picture--sources` | AVIF + WebP sources 280w/560w, `sizes="(min-width: 1024px) 200px, 248px"` in a 248 box; each stand-in names itself („AVIF · 280w") | AC-9a: the chosen source is visible |
| Theme Variants | `data-display-picture--theme-variants` | light/dark sources + `darkSrc`; labels „hell" / „dunkel" | AC-9b both themes |
| In a Card | `data-display-picture--in-a-card` | figure + `lc-card` + figcaption (DE) | AC-12 pattern |
| Load Error | `data-display-picture--load-error` | `src="/assets/missing-shot.png"`, alt (≈ 120 chars, DE) „Startseite der App am Abend: Begrüßung ‚Guten Abend, Johanna', darunter die Mitglieder und der Hinweis, dass nichts zu tun ist.", 248 box | AC-11, 13 |
| Without Clear Button | `form-select--without-clear-button` | `lang="de"`: lg 280 „Ebene" „Mit enthaltenen Services" default vs `[clearable]="false"`; sm 192 „Sortierung" „Sortierung: Kosten" both; xs/sm/md 320 with „Kostenstelle 4711 Rechenzentrum" (×) | AC-19 |
| Jump Marks | `data-display-list--jump-marks` | `lang="de"`, md, chevron: href rows „Lücken" + badge „3 offen" (warning) `ariaLabel` „Zu Lücken, 3 offen", „Zuordnungen" + „keine" → „Zu Zuordnungen, keine"; clickable „Prüfregeln" + „2 offen" → „Zu Prüfregeln, 2 offen"; plain „Stammdaten" + „vollständig" with an ignored `ariaLabel`; split row „SAP-Ist", „Heute, 06:00", „Geladen", action „Laden" | AC-14–16 |
| Narrow Column | `components-description-list--narrow-column` | two outlined md cards, `max-width: 156px` at every width: DE (the *Fill* 8 items) and EN („Network 214,300.00 €", „Data centre", „Workplace", „Telephony") | AC-18 |

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1, 3, 7 | unit: inputs and defaults; `notch` → one `span[aria-hidden=true]`; host has no role or tabindex; the media is projected | classes `lc-device-frame--phone/--md`, no notch by default |
| 2, 6 | scss regex spec (no hex, hooks with fallbacks); Default L/D + `--forced-colors` | rim rgb(107,114,128) L / rgb(147,164,173) D; FC border CanvasText |
| 4, 5 | *Default*, *Sizes*, *Card and Frame* at 360/1280 `--measure` | §3 boxes; img ratio 0.46154 ± 1 px; no `scrollWidth > clientWidth` at 360; two 248 figures at 1280 |
| 8, 9b | compat probe in `home.html`: `<lc-device-frame id="compat-device-frame" notch><lc-picture id="compat-picture" src="/compat-logo/character/hello-light.svg" alt="Edu" width="100" height="100" [sources]="[{ srcset: '/compat-logo/character/hello-dark.svg', type: 'image/svg+xml', theme: 'dark' }]" /></lc-device-frame>`; `EXPECT_IN_HTML`: host classes, notch span, two pictures (`--light`/`--dark`), img `width="100" height="100" loading="lazy" decoding="async"`, dark `<source srcset=…hello-dark.svg>` | Angular 21 and 22 |
| 9a, 10 | unit: source order and attributes; `sizes` inheritance; required inputs (a strictTemplates compile in compat); `alt=""`; attribute order; MutationObserver (every source `srcset` written before the img `src`); no `fetchpriority` for `auto` | — |
| 9b | unit: pair rendering rules (§2 DOM); story both themes; CSS selectors equal logo's | — |
| 11, 13 | *Load Error* 360/1280 | box 248 × 537.33 with the failing src = after load (*Sources*) |
| 12 | *Card and Frame*, *In a Card* | no border/radius on the img without the hook |
| 14–16 | unit per row kind; split name `computedName`; byte-identical href/button rows without `ariaLabel`; dev warning; *Jump Marks* + `--axe=wcag2a,wcag21a` | 0 violations; split name „SAP-Ist, Heute, 06:00, Geladen" |
| 17 | unit, exact strings | „Summe, Gesamtkosten Ist 522.530,00 €", „Gesamtkosten Ist 522.530,00 €", „Zustand Geladen", „Fassung 1 Freigegeben", „Access Token stored · read only x"; `/\s{2,}/` no match per row |
| 18 | *Fill* and *Narrow Column* at 360: per-line text | §3 dl values; *Fill* 1280 identical |
| 19, 20 | unit: no `.lc-select__clear` with `false`; Tab stops; default DOM equals today's; *Without Clear Button* 360/1280: value box right < × left | §3 select values |

**AC-17 DOM (prototyped):** `totalPrefix` = `"<label>,"` (the existing `&ngsp;` gives the space). Drop the `&ngsp;` between leader and dd. The dd has no leading or trailing whitespace; a plain value is followed by one space only before a suffix (it renders as today's space). The badge text starts with a space only after a value (`badgeShowsValue`), as one interpolation with no new anchor. Pins that change, with reason AC-17: `badge-total.spec` l. 38–45, 134, 136, 146; `semantics.spec` l. 150–158; `whitespace.spec` l. 117 (`[]`), 124 (`'Geladen'`); `check-angular-majors.mjs` l. 316 (`Summe,</span>`). AC-14/D-5: `list.split-row.spec` l. 85, 129, `list.chevron.spec` l. 90 (`aria-label`); `table.pagination.spec` l. 70–71 (no `.lc-select__clear`).

**Baseline** `tmp/story-shots/059/baseline` (3.38.0, 74 stories, 360/1280 L/D, 296 shots, measure = 800 ms wait): 15 dl, hero *Fill*, card footer-slot/link-cards(-german)/collapsible/clickable-named-by-its-text, accordion plain-in-card, state-strip german, 13 select, tabs default, input error-state-on-hover, 6 filter-bar, table with-pagination/pagination-sizes/number-columns, 25 list, header focus-context. **Expected:** only `layout-hero--fill` 360 L/D differ. Prototype compares (`proto-dl-wrap2`, `proto-select`) matched this. Their other diffs were injection or mutation artefacts with identical box and text geometry (0/114 boxes moved): card link-cards(-german) L, dl badge-values, state-strip german L, select keyboard-focus D. Unstable at rest: `form-select--focus-after-tap` (L 360/1280, D 1280) and table with-pagination 1280. Judge any of these by geometry.

**Risks:** dl `flex-wrap` makes a row's min-content the larger part instead of the sum (shrink-to-fit parents can get narrower); terms now hyphenate compounds of 12+ letters (Chromium honours the limit, Safari doesn't); the `--lc-select-clear-display: none` users at xs/sm/md lose 22 px of text (none in life-os or finance-intelligence, grep 2026-11-10); `ListItem` has an index signature, so an existing `ariaLabel` data key becomes a name. All four go under Compatibility.

**Change notes (review r1, 2026-11-11):** (1) §6 list word breaks, see there (build Deviation 1, accepted: 3 passes / 0 violations; trimmed 0 / 3; trimmed shots byte-identical to the untrimmed ones). (2) `lc-picture` host is `display: block`. (3) *Screenshot Row*: `scroll-snap-align: start` + `scroll-padding-inline: 16px`; frame slot 474 px from 1024 px; below 1024 px the region's ring is `outline-offset: -2px` (the row bleeds to x 0 and 360, so a +2 px ring loses both sides); no EN caption (§7 dropped it). (4) *Card and Frame* wraps (`flex-wrap: wrap`, no `overflow-x`): a scroller without a focusable child fails axe `scrollable-region-focusable`. (5) *Sources* shows „AVIF · 560w" at the 2x of the shots. (6) Stories with German `alt` or text carry `lang="de"`.

**Change note (review r2, 2026-11-11):** (7) change note 3 gave the inset ring no clearance: the row has no top padding, so below 1024 px the ring's top line (2 px) covers the 1 px top rim of the tall frames by 1.66 px while the region has focus. Accepted for 3.39 (ring ≥ 3:1 on canvas and bezel, notch and media uncovered); target for the backlog: `.shots__row` `padding: 4px 16px 8px` below 1024 px (frames 2.34 px clear of the ring), from 1024 px unchanged (review r2, F-4).
