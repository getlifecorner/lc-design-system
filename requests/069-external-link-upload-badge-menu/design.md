# Design 069: external description-list links, single-image upload, badge labels, menu height by room

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-23 · kit 3.48.0 (main 4115f51) → 3.49.0
- **Prototypes (measured in the 3.48 build):** `tmp/story-shots/069/proto-dl.log`, `proto-badge.log`, `proto-btn.log` (button widths, contrast grid)

## 1. Approach

Four extensions, no new component, every default as 3.48.

| D | Item | Decision (pattern followed) |
|---|---|---|
| D-1 | A | `DescriptionListItem.external` plus input **`externalLinkHint`**, not AC-3's `externalLabel`: the kit already has this exact text input on `lc-footer` (`externalLinkHint`, default `'(opens in a new tab)'`, DE `'(öffnet in neuem Tab)'`). One name and one default for the same job. AC-3 is verified against it. |
| D-2 | A | Inside each of the **4** `a.lc-dl__link` of the template (the spec's "5 places" are 4 anchors used by rows/stacked/total/clickable): `[attr.target]`/`[attr.rel]` (null without `external`) and, after `{{ item.value }}`, one `@if` with a glue span `span.lc-dl__external` (`white-space: nowrap; position: relative`) holding `span.lc-dl__sep` (`&ngsp;`, 0 px, existing class), `span.lc-dl__sr-only` (the hint) and the icon. No break can fall before a space or inside the nowrap span, so the icon stays with the last word while the value itself still wraps and breaks long strings (prototype: 5 values × md/sm, gap 4.0 px to the last glyph, same line every time, dd overflow 0, page 360). `position: relative` keeps the hidden text's containing block inside the dd (068 r1). Icon registered as `lc-footer`/`lc-next-step-card` do: `viewProviders: [ɵprovideKitIcons([ICON_EXTERNAL_LINK])]`. |
| D-3 | A | An external item's dd gets `lc-dl__value--external`; in `rows` its basis grows by 1em + 4 px (as 066 D-7 for the leading icon), so the text keeps its 6em share. Other items keep their class string. |
| D-4 | A, AC-5 | Clickable non-total, non-last rows with a separator draw it as `::after` (straight, as 066-n1 did for totals); the row gives the 1 px back as `margin-bottom`. |
| D-5 | B | `lc-file-upload variant="image"`: a preview tile plus `lc-button`s (`outline` and `ghost`, `lg` = 48.5 px, as `lc-copy-field`'s button), the native input shared with the drop zone. The default branch renders as before (only `@if`/`@else` comment anchors are added; no spec reads them). AC-9's premise is off: the list mode shows no rejection text (3.24 JSDoc), so the image mode brings two label inputs for its in-place message; no placeholder icon (no new inline glyph). |
| D-6 | B | Backgrounds through the kit's theme scopes: `dark` = `.lc-theme-dark` + `--color-sidebar` (the dark rail, `#070e15`, in both page themes), `light` = `.lc-theme-light` + `--color-surface`. No new token. |
| D-7 | C | One `span.lc-badge__label` around the default `<ng-content>`; a projected `lc-icon` gets its own slot before it (`<ng-content select="lc-icon" />`), so the requesters' "icon + word" badges (finance-intelligence `fi-state-badge`, usm-x theme tool) keep their flex layout and width. `.lc-badge__label:empty { display: none }` keeps icon-only and dot-only badges' gap. Prototype: 65 existing badges in 8 stories, 0 rect changes; mixed label gap 0 → 3.69 px; icon-only xs badge 26 × 20 with and without the empty label. |
| D-8 | D | `maxHeight="room"` (a keyword of the existing input; any other value as before): height and side from the room, for all three origins (element anchor, point anchor, projected trigger), see §3D. |

Risks to keep (design memory): an `@if` inside `<a>` adds one comment anchor (AC-4 note); `:empty` relies on Angular dropping whitespace-only text; `[style.max-width]` is an inline style (as `lc-menu maxWidth`); measure the panel with `offsetHeight`, never `getBoundingClientRect` (150 ms slideDown transform); focus the inner `<button>` of `lc-button`, not its host (054).

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc, shortened) |
|---|---|---|---|---|
| field | `DescriptionListItem.external` | `boolean` | `false` | Opens `href` in a new tab (3.49, vertraege row 1): `target="_blank"`, `rel="noopener noreferrer"`, a decorative `external-link` icon 4 px after the value's last word (1em, the link's colour, registered by the kit) and `externalLinkHint` read after the value. Ignored without `href`. In a clickable row the row button's name includes the hint too. |
| input | `lc-description-list` `externalLinkHint` | `string` | `'(opens in a new tab)'` | Visually hidden text read after the value of an `external` link (as `lc-footer`). Empty adds none. |
| input | `lc-file-upload` `variant` | `FileUploadVariant` | `'dropzone'` | `'image'`: one image field (preview tile, choose/replace, remove) instead of the drop zone and list. |
| input | `imageSrc` | `string` | `''` | The current image (URL, object URL, data URI), shown in `variant="image"`. Empty: no image. The kit never stores or uploads. |
| input | `imageAlt` | `string` | `''` | Alt text of the preview; empty = decorative (`alt=""`). |
| input | `imageBackground` | `FileUploadImageBackground` | `'surface'` | Ground of the preview: `surface` (page theme), `light`, `dark` (the dark rail), `checkered` (transparency, with an image only). |
| input | `imageHint` | `string` | `''` | Line under the field in `variant="image"` (the drop zone keeps `hint`); with the accepted and max lines it describes the choose button. |
| input | `chooseImageLabel` · `replaceImageLabel` · `removeImageLabel` · `emptyImageLabel` | `string` | see §7 | Button labels (choose without, replace with an image) and the empty tile's text. |
| input | `typeRejectedLabel` · `sizeRejectedLabel` | `string` | see §7 | Shown in place and announced when a file is rejected (`variant="image"`); the size text is followed by `maxSizeLabel` and the size. |
| input (existing) | `accept` · `multiple` | — | `''` · `false` | JSDoc adds: in `variant="image"` an empty `accept` means `image/*`, and `multiple` is ignored (one file; `filesSelected` emits `[file]`; a rejected file keeps the value and emits no `filesSelected`). |
| output | `imageRemoved` | `void` | — | Remove was pressed; the app clears `imageSrc`. Focus moves to the choose button. |
| CSS hook | `--lc-file-upload-image-width` / `-height` | length | `10rem` / `6rem` | Tile size (160 × 96 px), never wider than the field. |
| CSS hook | `--lc-file-upload-image-radius` | length | `var(--border-radius-md)` | Tile radius (e.g. `50%` for an avatar). |
| CSS hook | `--lc-file-upload-image-filter` | filter | `none` | Filter of the preview image (usm-x: `brightness(0) invert(1)` for the rail's white silhouette). |
| type | `FileUploadVariant` / `FileUploadImageBackground` | `'dropzone' \| 'image'` / `'surface' \| 'light' \| 'dark' \| 'checkered'` | — | Exported from `@lifecorner/angular-ui-kit/file-upload`. |
| input | `lc-badge` `maxWidth` | `string` | `''` | Caps the badge (any CSS length, `16rem`, `22ch`): the label is cut on one line with an ellipsis, dot and icon stay, and the badge's `title` is the label's whole text (not when the host has its own `title`); the text stays in the DOM. Ignored with `wrap`. A percentage needs a container of definite width. |
| slot | `lc-badge` `lc-icon` | — | — | A projected `lc-icon` (also as the single root of an `@if`) sits before the label, outside the cut, laid out as today; prefer `icon`. A trailing projected `lc-icon` moves before the label (none in usm-x or finance-intelligence; CHANGELOG *Changed*). |
| input | `lc-menu` `maxHeight` | `string` | `''` | Adds the keyword `'room'`: the panel's height is the room between its origin and the viewport edge on the side it opens to (8 px gap, 8 px margin), at least 3 items plus header/footer; the preferred side is kept while its room ≥ min(240 px, content), else the side with more room. CSS lengths as before. |

Default rendering unchanged: dl anchors without `external` keep text, attributes and classes (one comment anchor more inside `<a>`); file-upload default branch is the 3.48 DOM; badges without `maxWidth` render at identical boxes (prototype) with one extra element (§9 AC-12); menus without `'room'` are untouched.

## 3. Anatomy and layout

### A. Description list (`External Links`, 360 px, rows md in a 328 card)

```
Vertragsdokument                    Rahmenvertrag
                         Rechenzentrumsbetrieb 2026 ⧉   ← icon 14×21 (1em × 1lh), 4 px after the last glyph, same line
Kundenportal        vertraege.example.de/rahmenver
                        trag-2026-0412-anlage-3.pdf ⧉   (values break at spaces or anywhere, never hyphenate; icon glued)
```

| Element | Size / spacing | Token |
|---|---|---|
| icon `lc-icon.lc-dl__external-icon` | `--lc-icon-size: 1em` (md 14, sm 12), `height: 1lh`, `vertical-align: top`, `margin-inline-start: var(--spacing-1)` (4) | colour inherits the link |
| glue `.lc-dl__external` | `white-space: nowrap; position: relative` | — |
| rows basis | `.lc-dl--rows > .lc-dl__row > .lc-dl__value.lc-dl__value--external { flex-basis: min(100%, calc(7em + var(--spacing-1))) }`; with `--icon` too (0,5,0): `calc(8em + 2 * var(--spacing-1))` | — |
| AC-5 separator | `.lc-dl--rows.lc-dl--sep-line` / `--sep-divider` `.lc-dl__row.lc-dl__row--clickable:not(.lc-dl__row--total, :last-child)`: `border-bottom: 0; margin-bottom: 1px`; `::after { content: ''; position: absolute; inset-inline: 0; bottom: -1px; border-bottom: 1px solid` (`dashed` for divider) `var(--color-divider); pointer-events: none }` | `--color-divider` |

New dl rules go before `.lc-dl__sep` (the narrow-row block stays last).

### B. Single image (`variant="image"`)

```
360 (field 328)                        ≥ 1024
┌────────────────┐                     ┌────────────────┐ 16 ┌─────────────────┐
│ pad 8  [logo]  │ 160 × 96            │     [logo]     │    │ Replace image   │ outline lg 172.8 × 48.5
└────────────────┘                     └────────────────┘    └─────────────────┘ 8
↕16 ┌────────────────┐ (x 0)                                 ┌─────────────────┐
    │ Bild ersetzen  │ 159.4 × 48.5                          │ Remove image    │ ghost lg 172.9 × 48.5
    └────────────────┘ 8                                     └─────────────────┘
    ┌────────────────┐                 8
    │ Bild entfernen │ 168.3           SVG or PNG, at most 85 kB.     14 px secondary
    └────────────────┘                 Max: 85.0 KB                   12 px tertiary
8   SVG oder PNG, höchstens 85 kB.     This file is too large. Max: 85.0 KB   12 px text-error (role=alert)
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| root `.file-upload-image` | column, gap `var(--spacing-2)` | — | — |
| row `__row` | `flex; flex-wrap: wrap; align-items: flex-start; gap: var(--spacing-4)` (16): actions wrap under the tile when tile + 16 + widest button > field (360: 160 + 16 + 175.7 > 328) | — | — |
| tile `__tile` | hooks width/height (160 × 96), `max-width: 100%`, `padding: var(--spacing-2)`, border 1 px solid (dashed when empty), radius hook, `box-sizing: border-box` | — | §5 |
| image `__img` | `display: block; width: 100%; height: 100%; object-fit: contain; filter: var(--lc-file-upload-image-filter, none)` | — | — |
| empty text `__empty` | centred in the tile | `--font-size-xs` | `--color-text-tertiary` |
| actions `__actions` | `flex; flex-direction: column; align-items: flex-start; gap: var(--spacing-2)` | lg 18 px | `lc-button` |
| hint / lines | reuse `file-upload__hint` (14 px) and `file-upload__accept` (12 px), `text-align: start`, margin 0 | — | existing |
| error `__error` | always rendered; `margin: 0`, nothing when empty | `--font-size-xs` | `--color-text-error` |

### C. Badge

```
md rounded dot, maxWidth="16rem" (256 px):
┌──────────────────────────────────────────┐ 28
│ ● Aufnahme läuft in USM-1209 Zeitbuchu…  │   pad 10 · dot 7 + 5.6 · label 221.4 (ellipsis) · pad 10
└──────────────────────────────────────────┘
```

| Element | Rule |
|---|---|
| `.lc-badge__label` | no rules by default (flex item; inherits `nowrap`, `line-height: 1`, wrap's `text-align`) ; `:empty { display: none }` |
| `.lc-badge--truncate` (maxWidth set, not wrap) | span `[style.max-width]`; label `min-width: 0; overflow: hidden; text-overflow: ellipsis; padding-block: 0.2em; margin-block: -0.2em` (clip room: the 1em line box clips the glyphs' content area by 1–2 px; proto `proto-badge2.log` xs–lg: text top Δ 0 vs uncut, content area 0.4–2.2 px inside the clip box, `12rem` → 192 px) |
| `title` | `[attr.title]` on `span.lc-badge`: label `textContent`, whitespace collapsed and trimmed, read after render and on content mutation while `maxWidth` is set; null when empty, without `maxWidth`, with `wrap`, or when the host has a `title` attribute |

### D. Menu `maxHeight="room"` (element anchor, 1280 × 1150, `size="sm"`)

```
y 379.5 ┌ Weitere ▾ ┐ trigger 44 high (top at 33vh)
y 423.5 └───────────┘
        8 gap
y 431.5 ┌──────────────────────┐  pad 8 + 1 border
        │ Bearbeiten        36 │
        │ … 19 of 26 rows       │  items scroll (overscroll contain), header/footer stay
y 1142  └──────────────────────┘  max-height 710 = 1150 − 423.5 − 8 − 8
        8 viewport margin
```

| Origin | gap g | room below | room above |
|---|---|---|---|
| element anchor (overlay) | 8 | vh − r.bottom − g − 8 | r.top − g − 8 |
| point anchor | 0 | vh − y − 8 | y − 8 |
| projected trigger (no anchor) | 8 | vh − m.bottom − g − 8 (m = `.lc-menu` box) | m.top − g − 8 |

vh = `ViewportRuler.getViewportSize().height`. In room mode the overlay panel keeps its 8 px margin on the anchor side only (`margin-block: var(--spacing-2) 0` below, `0 var(--spacing-2)` above; class per effective side), so the pane fits CDK's 8 px viewport margin exactly; other overlay menus keep 3.48's both-sided margin. Per open: `chrome` = panel.offsetHeight − list.clientHeight; `H` = chrome + list.scrollHeight; `pitch` = first item's offsetHeight; **MIN** = min(H, chrome + 3·pitch); **T** = min(H, max(240, MIN)). Side = preferred (`position`) if room_pref ≥ T, else the larger room (tie: preferred). `max-height` = max(MIN, ⌊room_side⌋) px; below MIN on a short window CDK's push lets the panel overlap the trigger and the list scrolls. Overlay: `overlayPositions` = the chosen side's list (`ELEMENT_POSITIONS[effective]`, point list reordered above-first). Projected trigger: the position class follows the effective side. Computed before first paint (after render, in the open tick); recomputed on window resize and when `items`/`loading` change while open; on scroll (projected trigger only; the overlay closes on scroll as in 3.48) the height follows, the side stays.

## 4. States

| Item | default | hover | focus-visible | active/disabled | empty / loading | error | overflow |
|---|---|---|---|---|---|---|---|
| A | icon after value | link hover colour + underline (icon follows colour) | existing link ring 2 px primary-500, +2 px, wraps the icon | — | `external` without `href`: nothing | — | long German value / URL wraps, icon glued (proto) |
| B | tile + Replace + Remove | buttons' own; tile none | buttons' ring | `disabled`: both buttons disabled, drop ignored, tile not dimmed (image stays judgeable) | no `imageSrc`: dashed tile, `emptyImageLabel`, Choose only; no loading state (the app may set `disabled` while saving) | rejection text in place (`role="alert"`), cleared on an accepted file or remove; a repeat is cleared and set one frame later (re-announced). Value kept; no `filesSelected` | drag-over on the tile: `outline: 2px dashed var(--color-primary-500); outline-offset: 2px`. A URL that fails to load shows the empty ground (alt ""). Long DE labels wrap under the tile |
| C | label in its element | — | — | — | empty label hidden | — | `maxWidth`: ellipsis, `title`; `wrap` wins over `maxWidth` |
| D | room height | as 3.48 | item ring inside list; arrow keys scroll the item into view (3.48 `revealItem`) | — | `loading` row stays outside the scroll | — | 26 items: 19 visible (sm) at 1280 × 1150 |

## 5. Theming

| Element | Light | Dark | Contrast (computed, `proto-btn.log`) |
|---|---|---|---|
| A icon | `--color-link` / hover `--color-link-hover` (inherited) | same | 6.21 page, 5.64 row hover · 11.78 page, 10.81 surface, 8.97 surface-2 |
| B tile `surface` | `--color-surface` #fff, border `--color-border` | #101c26 | decorative (not a control) |
| B tile `light` | `.lc-theme-light` + `--color-surface` #fff | #fff | tile vs dark surface 17.27 |
| B tile `dark` | `.lc-theme-dark` + `--color-sidebar` #070e15 | #070e15 | vs light page 19.40; on dark page 1.03, so its 1 px `--color-border` (dark scope) marks the edge |
| B `checkered` (image shown) | `repeating-conic-gradient(var(--color-neutral-300) 0 25%, var(--color-surface) 0 50%) 0 0 / 16px 16px` | same tokens | checks 1.47 · 2.28; no text on checks (empty tile shows the surface) |
| B empty text | `--color-text-tertiary` (tile scope) | — | 5.84 (#fff) · 6.71 (surface), 7.53 on the dark tile |
| B drag ring | `--color-primary-500` | — | 4.37 page / 4.18 surface-2 · 9.95 / 9.13 |
| B error | `--color-text-error` | — | 12.59 / 12.05 · 9.48 page, 8.69 surface, 7.21 surface-2 |
| B hint / lines | existing secondary / tertiary | — | 7.56 / 5.84 · 11.16 / 6.71 |
| C, D | unchanged tokens | — | `badge-contrast.spec.ts` unchanged |

No new token. Forced colours: A icon is `currentColor` (LinkText); B tile border CanvasText, drag outline `Highlight` (explicit FC rule), image unforced; C label CanvasText.

## 6. Accessibility

- **A:** name = value + space + hint ("Rahmenvertrag 2026 (öffnet in neuem Tab)", proto `textContent`), no `aria-label` (2.5.3); icon `aria-hidden` + `[decorative]`. Known limit (JSDoc): a clickable row's button name (term + dd) includes the hint.
- **B:** Choose/Replace and Remove are native buttons (Tab, Enter, Space), 48.5 px high. Choose has `ariaDescribedBy` = hint, accepted, max and error ids (instance counter ids, stable in prerender). Native input stays `visibility: hidden` beside the field (3.25.2). Tile: no role, no tab stop, drop target only. After Remove, focus goes to the inner `<button>` of Choose (same element in both states, label switches). Several image fields on a page: give each its own labels ("Logo ersetzen").
- **C:** full text stays in the DOM (clipped visually); `title` on a generic span is a pointer hint only.
- **D:** as 3.48 (roving focus, `revealItem`, overscroll contain); no motion beyond the existing 150 ms slideDown (global reduced-motion rule).

## 7. Texts

| Input | EN default | DE (story) |
|---|---|---|
| `externalLinkHint` | (opens in a new tab) | (öffnet in neuem Tab) |
| `chooseImageLabel` | Choose image | Bild auswählen (175.7 px lg, fits 328) |
| `replaceImageLabel` | Replace image | Bild ersetzen (159.4) |
| `removeImageLabel` | Remove image | Bild entfernen (168.3) |
| `emptyImageLabel` | No image | Kein Bild |
| `typeRejectedLabel` | This file type is not accepted. | Dieser Dateityp wird nicht akzeptiert. |
| `sizeRejectedLabel` | This file is too large. | Diese Datei ist zu groß. (+ " Höchstens: 85,0 KB") |

AC-11's "preview alt fallback" is `imageAlt` (empty = decorative, AC-8); no fallback alt, `emptyImageLabel` is the fourth text.

## 8. Stories

| Story | Expected ID | Args / content | Shows |
|---|---|---|---|
| External Links | `components-description-list--external-links` | `lang="de"`, `externalLinkHint="(öffnet in neuem Tab)"`; contract details in rows md, stacked md and rows sm cards (328 at 360): document (external), portal URL (external, long), long compound value (external), internal link, badge item + href external, icon item + href external | AC-1…3, 6 |
| Image | `form-file-upload--image` | `variant: 'image'`, `imageSrc` (inline SVG data-URI logo), controls for all new inputs | AC-7, 8 |
| Image Backgrounds | `form-file-upload--image-backgrounds` | four fields `surface`/`light`/`dark`/`checkered`, plus `dark` with `--lc-file-upload-image-filter: brightness(0) invert(1)` | AC-8 |
| Image German | `form-file-upload--image-german` | DE labels, empty + filled, `imageHint`, `accept=".svg,.png"`, `maxSizeBytes=87040`, `locale="de-DE"` | AC-10, 11 |
| Image Rejected German | `form-file-upload--image-rejected-german` | play: drops a 200 KB `image/png` on the tile → size message; a disabled filled field beside | AC-9 |
| Mixed Label | `data-display-badge--mixed-label` | `Aufnahme läuft in <strong>USM-1209 Zeitbuchung</strong>` (md, rounded, dot, info); an `lc-icon` + word badge | AC-12, 16 |
| Max Width | `data-display-badge--max-width` | the 60-char name "USM-1209 Zeitbuchung: Quartalsabschluss Kostenstellenplanung" at `16rem`, with dot / `icon`, sizes xs–lg at `12rem`, a short label (no cut), `wrap` + `maxWidth` | AC-13, 14 |
| Long Menu Room | `navigation-menu--long-menu-room` | `lang="de"`, `LONG_MENU`, `size="sm"`, `maxHeight="room"`, `[anchor]` = the `TOKEN_TRIGGER` button (`#t`), wrapper `padding-top: calc(33vh - 16px)` (trigger top 379.5 at 1150) | AC-17, 19, 20 |
| Long Menu Room Flips Up | `navigation-menu--long-menu-room-flips-up` | same, `position="bottom-left"`, `padding-top: calc(75vh - 16px)` (top 862.5: below 227.5 < 240, above 846.5) | AC-18 |

Baselines (unchanged stories, main 4115f51, 360/1280 L/D `--full`): `tmp/story-shots/069/baseline` (152 stories: badge, dl, file-upload, menu, sidenav, header, bottom-nav, tabs, palette; 608 shots) and `tmp/story-shots/069/baseline-b` (137: table, timeline, area-map, accordion(-group), card, hero, device-frame, drawer; 548). Expected to differ (AC-5 only): `components-description-list--clickable-rows`, `--clickable-rows-english`, `--item-icons`.

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1 | unit, per anchor place: rows/stacked × plain, badge, icon, icon+badge; total; clickable | `target="_blank"`, `rel="noopener noreferrer"` |
| 2 | unit: `lc-icon[name=external-link]` decorative, `aria-hidden`; renders the glyph under `provideLcIcons([], { unregistered: 'placeholder' })`; `kit-icons.spec` scan. *External Links* L/D | icon computed colour = link colour |
| 3 | unit: link `textContent` = value + ' ' + hint, no `aria-label`; default `'(opens in a new tab)'`; story `--axe` | DE suffix shown in DOM; 0 violations |
| 4 | unit: without `external` no `target`/`rel`/icon/hint; dd HTML (comments stripped) = 3.48. `description-list.icon.spec` 'href' row keeps comments: one `<!--container-->` before `</a>` (stated reason in build.md) | identical apart from that anchor |
| 5 | *Item Icons* 1280, card "rows · md · clickable", rows 1–2 | row `border-bottom-width` 0, `::after` 1 px, width = row width, row 2 / total y as baseline |
| 6 | *External Links* 360: per external link icon − last glyph (Range); dd and page `scrollWidth`; `focus()` outline | gap 4 ± 0.5, bottoms Δ ≤ 3 (same line); overflow 0, page 360; outline 2 px |
| 7 | unit: variant switch, `imageSrc` preview, Choose ↔ Replace label, Remove only with value, `filesSelected` = `[file]`, `imageRemoved`, effective `accept` `image/*` | — |
| 8 | *Image Backgrounds* L/D: tile background per value; `object-fit` | §5 colours; `contain` |
| 9 | unit: type/size rejection → `fileRejected` + text in `[role=alert]`, value kept, `disabled` blocks pick and drop, `locale` size; *Image Rejected German* | "Diese Datei ist zu groß. Höchstens: 85,0 KB" |
| 10 | unit: drop on tile, Enter/Space on buttons, focus on Choose after Remove; `--axe` 360/1280; button boxes | ≥ 44 px (48.5) |
| 11 | *Image German* 360: label `scrollWidth` ≤ `clientWidth`; all dropzone specs untouched | no clipping |
| 12 | unit: label `textContent` "Aufnahme läuft in USM-1209 Zeitbuchung"; *Mixed Label* Range gap "in"→"USM"; hash compare of all badge stories | gap ≥ 3 px (proto 3.69); 0 diffs |
| 13 | unit: class, style, `title` (and none without / with host `title`); *Max Width* 360 | badge 256 px, label sw > cw, text top Δ 0 vs uncut |
| 14 | unit: label text in DOM; `wrap` + `maxWidth` → no class/style/title | — |
| 15 | `badge-contrast.spec.ts`; *Max Width* `--forced-colors` | green; label visible |
| 16 | hash compare `baseline` + `baseline-b`; stated pin updates: `badge.icon.spec` children (l. 33/36/41), `badge.wrap.spec` (l. 66/103), `description-list.icon.spec` l. 81, compat `EXPECT_IN_HTML` 'badge wrap class' (allow the label tag) | only the AC-5 stories differ |
| 17 | unit, mocked rects, all 3 origins | §3D formulas |
| 18 | unit: below < T and above larger → top; ≥ T → preferred; tie → preferred; *Flips Up* 1280 × 1150 | panel above, bottom = trigger top − 8, max-height 846, 23 of 26 visible |
| 19 | unit: vh 300, element 130–166, sm, no header (below 118, above 114) → below, 126 px = 18 + 3 × 36; *Long Menu Room* `--height=1150` at 1280: items fully inside the list | max-height 710, ≥ 19 visible (> 15) |
| 20 | unit: ArrowDown to item 26 scrolls it into view; header/footer outside the scroller; story 360 L/D | as 3.48 |
| 21 | full suite; compat; prerender of the compat app | only the stated changes |
| 22 | lint; argTypes with `description` + `table.defaultValue`; the stories above | — |
| 23 | review of CHANGELOG | vertraege row 1 (Verträge dialog „Details“), usm-x 71 (settings logo), 72 (recording bar), 73 (catalog row menu) |
