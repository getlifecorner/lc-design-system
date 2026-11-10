# Design 057: select clear area and focus, table action size, dl whitespace, hero slot colour and fill, list action, chart palette, dense strip, backlog

- **Status:** ready (2026-11-09 23:57) · change notes 2026-11-10 (review r1): §3 D1 separator also after a badge, §8 *In a Labelled Card* time + suffix instead of link + suffix
- **Spec:** [spec.md](spec.md) — AC-1 … AC-25 · target **3.37.0** (minor)
- **Shots (3.36.0 `main` build, 360/1024/1280 × L/D):** `tmp/story-shots/057/baseline` (173 stories, 1038 shots). Prototypes injected into that build, kept as the **expected build** where the hash must change: `proto-select` (select, 66), `proto-hero` (hero + inverse buttons + character, 126), `proto-list` (list + header focus-context, 150). `proto-dl` (120) and `proto-strip` (36) are hash-identical to the baseline. Measures: `tmp/story-shots/057/*.js`.

## 1. Approach

All extensions; no new component, token, CSS hook or dependency.

| Item | Decision | Pattern followed |
|---|---|---|
| S1 | **D-1** lg with a value only: the × box moves 8 px toward the text (`margin-right` 6 px instead of −2 px) and gets a `::before` 44 × 44 centred on it, which ends exactly at the chevron's left edge. No overlap, so no priority rule is needed. The value text ends where the area starts | combobox lg clear (3.30), alert × `inset: min(0px, …)` (3.33) |
| S2 | **D-2** `close(returnFocus)`: a single-select choice and every Escape hand the focus to the trigger when it is on `body`/`html`/none or in the panel; backdrop and detach keep today's rule | `restoreFocusFromPanel`, 3.34 focus return |
| T1 | **D-3** `TableAction.size?: ButtonSize`, bound as `action.size ?? 'xs'`; the icon stays `lc-icon size="sm"` (20 px) at every size, the kit's pairing in all button stories | `lc-list` `actionSize` |
| D1 | **D-4** `&ngsp;` between `dt` / leader / `dd`, after each row and after the hidden total prefix; inside the `dd` (inline text) separators that render 0 px: a leading space in the badge's text, a `font-size: 0` span before a suffix that follows a link or time | stat-trend (031) |
| H1 | **D-5** `.hero__body` gets `color: rgba(#fff, .85)` (light variant `rgba(neutral-800, .75)`) instead of `opacity`, so slotted components keep full opacity; badges inside a hero take the light palette in both themes | sidenav light-rail badges (051) |
| H2 | **D-6** `fill`: the host becomes a flex column and `.hero` grows | card `height: 100%` |
| L1 | **D-7** a `clickable` row with an `action`: the row loses `role`/`tabindex`; a native empty `<button>` stretched over the row (named by the row) takes them; the action area sits above it | dl row button (039), card stretched link (037) |
| C1 | **D-8** palette entries 3 and 4 → `--color-text-success`, `--color-text-warning` | state-strip marks (056) |
| SS1 | **D-9** a transparent `aria-hidden` scrub layer over the strip's row is the one pointer target; it picks the run under the pointer; a pressed finger slides along it | — |
| B | **D-10** list label `hyphens: auto` + `hyphenate-limit-chars: 12 4 3`; Collapsible story gets a footer; WebKit stays in the backlog | card title (037) |

**Why D-1 and not A-1's "chevron keeps priority":** at 360 the × is 277–301 and the chevron 303–323. A 44 px area centred on today's × (267–311) covers 8 px of the chevron, and with priority only 36 × 44 px would clear, which fails AC-1. Moving the × is the only way to meet "44 × 44 centred" and "no overlap" together. The field box (320 × 44), xs/sm/md and the no-value state stay as they are (prototype: the other 60 select shots are identical). The × in lg with a value moves 8 px; that is the fix, not a new look.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| field | `TableAction.size?` | `ButtonSize` | `'xs'` | Size of the action's `lc-button` (3.37, services row 3). `'lg'` is 48.5 px high with a label and 45.6 px icon-only, for touch rows; the icon stays 20 px. Pass another size per breakpoint yourself. `@default 'xs'` |
| input | `lc-hero` `fill` | `boolean` (`booleanAttribute`) | `false` | Fill the height the container gives the hero (3.37, cockpit row 1): in a grid or flex row that stretches its items, the band ends at the row's bottom edge; the content stays at the top and `[hero-footer]` sits at the bottom. Without it the hero is as tall as its content. `@default false` |

No new outputs, slots, hooks or types. `fill` stays the requester's name (boolean like `rounded`; `lc-page-layout`'s `fill: 'screen' \| 'parent'` is another component). Private classes: `lc-hero--fill` (host), `lc-list__item--split`, `lc-list__item-button`, `lc-state-strip__scrub`, `lc-state-strip__cell--hovered`, `lc-dl__sep`.

**Default rendering unchanged:** host class only with `fill`; `size` falls back to `xs`; the select rules are scoped to `.lc-select--lg` with a clear button; the list split applies only to clickable rows with an `action`. Proven by the prototypes (see header); hero shots differ from 3.36 by glyph anti-aliasing only (D-5, §9 AC-16).

## 3. Anatomy and layout

**S1, lg with a value, 360 px** (field x 16–336, y 160–204, border 1; measured on the prototype):
```
|16 pad 16| value text ……… ends 259 |   area 259–303 (44 × 44, y 160–204)   | chevron 303–323 | 12 |336
                                    |   [ × box 269–293, 24 × 24, y 170–194 ] |
padding-right 76 px = 12 + 20 chevron + 44 area (today 48; text ended at 287, 10 px under the ×)
```
```scss
.lc-select--lg .lc-select__clear {
  margin-right: max(-0.125rem, (44px - 1.5rem) / 2 - 0.25rem);    // 6 px at 100 %, −2 px at 200 %
  &::before { content: ''; position: absolute; inset: min(0px, (100% - 44px) / 2); }  // = the box at 200 %
}
.lc-select--lg:has(.lc-select__clear) {                          // 76 px at 100 %
  padding-right: calc(var(--spacing-3) + 1.25rem + var(--spacing-1)
    + max(-0.125rem, (44px - 1.5rem) / 2 - 0.25rem) + 1.5rem + max(0px, (44px - 1.5rem) / 2));
}
```
44 px is CSS `px`, not `--size-min-touch-height` (rem, 88 px at 200 %). With `--lc-select-clear-display: none` the lg text still ends at 76 px (documented in the hook comment).

**T1** (lc-button, class swap measured in the table): label + icon xs 30 / sm 38 / md 42 / **lg 48.5**; icon-only 20 / 30 / 36 / **45.59** px. A row with lg actions at 1024: 55.5 → 74 px (label), 50.5 → 71.09 px (icon-only). Cell, gap and alignment unchanged.

**H2, from 1024 px** (story *Fill*; 2 columns at every width, gap 16):
```
┌ lc-hero fill (sm) ───────────┐ ┌ lc-card, taller ─────────┐
│ pad 48 · label · title · body │ │ 8 rows                   │
│ .hero__inner flex 1 (top)     │ │                          │
│ [hero-footer] (bottom)        │ │                          │
│ pad 48                        │ │                          │
└───────────────────────────────┘ └──────────────────────────┘  bottom Δ 0
```
`:host(.lc-hero--fill) { display: flex; flex-direction: column }` · `:host(.lc-hero--fill) > .hero { flex: 1 1 auto }` · `:host(.lc-hero--fill) .hero__inner { align-content: start }` (the media grid ≥ 1024 would centre otherwise). Prototype (default, with-media, large, slim, light × 360/1024/1280): Δ 0, content top = top padding, footer bottom = bottom padding.

**L1** (only `@else if (clickable() && item.action && !itemTemplate())`, a branch of the existing chain, no new anchor in other rows):
```html
<div class="lc-list__item-wrapper" role="listitem">
  <div class="lc-list__item lc-list__item--split …" [id]="rowId(i)" (click)="onItemClick(item)">
    <button type="button" class="lc-list__item-button" [attr.aria-labelledby]="rowId(i)"
            [attr.tabindex]="item.disabled ? -1 : null" [attr.aria-disabled]="…" [attr.aria-current]="…"></button>
    …row content as today, action area inside the trailing column…
```
Prototyped exactly so (`proto-list-btn`: 6/6 identical, name unchanged, `nested-interactive` and `button-name` pass). `.lc-list__item--split { position: relative; isolation: isolate }` · button: `position: absolute; inset: 0; border-radius: inherit;` UA reset (no background, border, padding, margin; `font`/`color`/`cursor: inherit`; `outline: none`) · `.lc-list__item--split .lc-list__action-area { position: relative; z-index: 1 }` · ring on the row: `.lc-list__item:has(> .lc-list__item-button:focus-visible)` = today's `inset 0 0 0 2px var(--color-primary-500)`; forced colours `outline: 2px solid Highlight; outline-offset: -2px`. Row ids from a module counter. `focusItem(id, 'row')` also matches `.lc-list__item-button:not([aria-disabled=true])`.

**SS1:** `.lc-state-strip__row { position: relative }` + last child `<div class="lc-state-strip__scrub" aria-hidden="true">` (`position: absolute; inset: 0; touch-action: pan-y pinch-zoom`). At 360: 328 × 32 over 30 cells of 10.92 px and 60 of 5.45 px; 10 runs: 240 px of cells, the rest of the row picks nothing (as today).

**D1 separators:** `<dt>…</dt>&ngsp;<span leader>&ngsp;<dd>`, `&ngsp;` after each row `div`, `<span sr-only>…</span>&ngsp;{{ term }}` (line start, collapsed), `<lc-badge>&ngsp;{{ badge }}</lc-badge>` (flex item start, collapsed), `<span class="lc-dl__sep"> </span>` (`font-size: 0`, 0 px) before `.lc-dl__value-suffix` after `<a>`, `<time>` **or a badge** (change note, review r1: without it a badge + suffix read „Geladenvollständig“; build Deviation 1).

## 4. States

| Item | default · hover · focus-visible · active | disabled · loading · empty · error | overflow |
|---|---|---|---|
| S1 | area invisible; hover anywhere in it fills the 20 px box as today; ring unchanged (2 px, offset 0 on the 24 px box) | disabled/loading: no × → padding 48 | long DE value ends at 259 (ellipsis), never under the × |
| S2 | tap/click on an option (single) → closed, focus on the trigger (field ring shows, like after the opening click) | multi: open, focus untouched | — |
| T1 | per action; `disabled`/`hidden` functions as today | — | lg labels widen the column; the table scrolls at 360 as today |
| H1 | body text composite as today; slotted badges, buttons, links at full opacity | — | — |
| H2 | taller than content only with `fill` | empty body: unchanged | content taller than the row: the row grows (min-height auto) |
| L1 | hover/active fill on the row as today (the button is inside it); ring on the row | disabled row: button `tabindex -1`, `aria-disabled`, pointer events off (inherited) | action column as today |
| SS1 | hovered run: `--hovered` class = today's `surface-hover` fill; caption as today | empty: nothing rendered | 30/60 runs: the scrub picks by x; a pressed finger slides, lifting it focuses that run |
| B | DE labels break with a hyphen (`lang` from the page) | — | EN: words < 12 letters never hyphenate |

## 5. Theming

| Element | Light | Dark | Contrast (computed, min over the band t 0–1) |
|---|---|---|---|
| Badge sm/xs in the hero body, 6 variants | light tokens, opaque fills | **light tokens** (re-declared) | after: default 6.87, primary 8.49, success **4.85**, warning 5.52, error 10.98, info 9.08 on every band, both themes. Today L: success 3.83–4.16, warning 4.23–4.67 (dark bands, `.85`); success 3.00, warning 3.30, default 3.76, primary 4.44 (pastels, `.75`). Today D: 1.00–5.18 (translucent fills over the bands) |
| Hero body text | `rgba(255,255,255,.85)`; light variant `rgba(31,41,55,.75)` | same (bands are fixed) | unchanged: neutral 6.02, info 4.99, violet 6.94; light variant 5.39–6.15 — **but** primary 3.62, purple 3.81, secondary 2.70, orange 2.61, success 2.39, warning 2.01 (finding F-1) |
| Palette entry 3 | `--color-text-success` #5f7150 | #a9bb93 | bg/surface 5.30 (sunken 4.81) · D 8.40 (s2 6.97); was 2.72 / 11.51 |
| Palette entry 4 | `--color-text-warning` #855a22 | #e1a040 | 6.03 (sunken 5.48) · D 7.65 (s2 6.35); was 2.26 / 12.02 |
| Other entries | unchanged | unchanged | L min secondary-500 3.12 on bg/surface (s2 2.98, sunken 2.83: F-3); D ≥ 7.21 |

Global rule (in `_theme-light.scss`, where the private mixin lives): extend `.lc-sidenav-container--light .lc-sidenav__nav-badge` to `…, lc-hero lc-badge { @include -light-theme-colors; }` (custom properties only; a no-op in light). Comment: the bands don't follow the theme. It covers badges in every slot of the hero (body, `[hero-media]`, `[hero-footer]`), so a badge looks the same anywhere on a band; that is the only change in those two slots (AC-16), and only in dark.

**Findings outside this spec (pre-existing, measured):** **F-1 should-fix → queue:** hero body text below 4.5:1 on 6 of 9 colours and the title (large) below 3:1 on success 2.72 and warning 2.26; it needs darker band ends or a scrim, a look decision. AC-15's "still ≥ 4.5" holds only for neutral, info, violet and the light variant. **F-2 nit → backlog:** a long select value runs under the × in xs/sm/md (text ends 303/299/295, × starts 277). **F-3 nit → backlog:** palette secondary-500 on surface-2/sunken 2.98/2.83.

## 6. Accessibility

- **S1:** the button's own box stays 24 × 24 (axe `target-size`); the `::before` has no paint, so forced colours show nothing extra.
- **S2:** guard order: `selectionChange`, focus, then `closed`, as today. Focus is never taken from an element a `selectionChange` handler focused. Escape on `body`: `(overlayKeydown)` closes with `close(true)` before the CDK's own Escape detach (that one then finds it closed).
- **L1:** one Tab stop per row (the button), then the action; Enter/Space are native button clicks that bubble to the row's click; the name stays from the row (measured unchanged: „SAP-Ist (Kostenstellen-Einzelposten, Buchungskreis 1000) Heute, 06:00 Geladen Laden“). axe `nested-interactive` 1 → 0.
- **SS1:** cells keep `gridcell`, roving `tabindex`, names and keys; the scrub is out of the AX tree. axe `target-size`: 90 incomplete → 90 pass (`obscured`: the cells are no pointer targets; the strip, 328 × 32, is). A dense strip is one scrub control, like a slider track: the caption follows the pointer; no pointer action activates anything. `touch-action` keeps vertical scroll and pinch zoom.
- **D1:** the space reaches `textContent`, the accessible name and axe; axe `label-content-name-mismatch` 1 violation → pass (probe; also with link + suffix and the 0 px separator).
- **H1/H2, C1, B:** no change to semantics; legends and labels of the charts unchanged.

## 7. Texts

No new built-in strings. `clearAriaLabel`: EN „Clear selection“, DE „Auswahl löschen“. New stories in German where the requester's pages are German (§8).

## 8. Stories

| Story | Expected ID | Args / content | Shows |
|---|---|---|---|
| Clear Tap Area (new) | `form-select--clear-tap-area` | `lang="de"`, two lg selects with values „SAP-Ist“ and „SAP-Ist (Kostenstellen-Einzelposten, Buchungskreis 1000)“, `clearAriaLabel="Auswahl löschen"`, placeholder „Quelle wählen“ | AC-1–3 at 360 |
| Focus After Tap (new) | `form-select--focus-after-tap` | play: `trigger.click()`, option `.click()` (no focus, as a WebKit tap), `expect(activeElement).toBe(trigger)`; reopen, `body.focus()`, Escape on `body`, expect the trigger | AC-5, AC-6 |
| Touch Targets (text) | `form-select--touch-targets` | description: lg 44 × 44 area, × 8 px further from the chevron | AC-2 |
| Action Sizes (new) | `data-display-table--action-sizes` | DE rows; actions „Herkunft“ (icon + label, `ariaLabel: row => 'Herkunft von ' + row.name`) and icon-only „Details“, one table `size: 'sm'`, one `size: 'lg'` | AC-9 at 360/1024 |
| In a Labelled Card (new) | `components-description-list--in-a-labelled-card` | `[clickable]="true"` card, `ariaLabel` = the visible text; rows: plain, badge after a value, **time + suffix**, total (change note, review r1: a link inside a `role="button"` card nests a control, so the link + suffix path is a unit test only; build Deviation 2). No card `title`: see review F-4 | AC-11, AC-12 |
| Badges in the Body (new) | `layout-hero--badges-in-the-body` | 9 colours + one light variant, `size="sm"`; body „September 2026“ + seal `rounded` sm warning „Entwurf“ / success „Freigegeben“ + the 6 variants at xs | AC-14, AC-15 |
| Fill (new) | `layout-hero--fill` | args `fill` (true), `size`, `color`, `variant` bound; 2-column grid beside a card with 8 rows | AC-17, AC-18 |
| German Labels (new) | `data-display-list--german-labels` | `lang="de"`, sm and md × `showChevron` on/off, labels „USM-Leistungsverrechnung“, „SAP-Ist (Kostenstellen-Einzelposten, Buchungskreis 1000)“ | AC-23 at 360 |
| Many Segments (text) | `data-display-state-strip--many-segments` | description: limit and pointer path | AC-21 |
| Collapsible (footer) | `components-card--collapsible` | second card (closed) gets `<div card-footer><lc-button variant="outline" size="sm">Regeln bearbeiten</lc-button></div>` | AC-24 |

New argTypes: hero `fill` (description, `table.defaultValue: false`). JSDoc of `segments`: „More runs than fit at 24 px (13 and more in 328 px) narrow the cells below 24 px; the pointer then uses the whole strip: pointing at it, or sliding a pressed finger along it, shows that run; the keyboard moves with the arrows.“ Also add the 3.37 lines to the stories' "what's new" text and CHANGELOG (developer).

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1 | *Clear Tap Area* 360, hit scan from the × centre | 23/22/23/22 px (44 ± 1); area right = chevron left 303; chevron left + 0.5 px opens; spec: click on the button clears |
| 2 | select stories vs `proto-select` | 66/66 identical (60 also = baseline); xs/sm/md × 277,·,24,24 |
| 3 | `--axe` 360 L/D, `--forced-colors` | `target-size` pass; `::before` no outline/background; ring 2 px offset 0 |
| 4 | specs | default value back, `clearAriaLabel` name EN/DE, keyboard clear |
| 5–8 | Jest + *Focus After Tap* play | trigger focused after option click with `body` active; search input → trigger; backdrop: not forced; multi: open, focus unchanged; `selectionChange` then `closed`, 1 each; no `mousedown` handler |
| 9 | *Action Sizes* 360/1024 | lg 48.5 / 45.59, sm 38 / 30, icon 20 |
| 10 | 27 table stories vs baseline + specs | 162/162 identical |
| 11, 12 | spec (`textContent.replace(/\s+/g, ' ')`), axe spec, story `--axe` | „Term Value …“ in every case; `label-content-name-mismatch` pass |
| 13 | dl, card, accordion stories vs baseline | 120/120 identical |
| 14, 15 | §5 grid + *Badges in the Body* `--axe` L/D | ≥ 4.85; `color-contrast` 0 violations; body `color` rgba(255,255,255,.85), opacity 1 |
| 16 | hero + inverse button stories vs `proto-hero` | 126/126 identical (vs 3.36 only glyph AA; 360 L pair checked by eye) |
| 17, 18 | *Fill*: `updateStoryArgs` over 3 sizes × 9 colours × 2 variants at 360/1024/1280 | Δ 0; content top = top padding; footer bottom = bottom padding; `fill` false: height = content |
| 19 | *Chevron Rows* 360 + specs; list stories vs `proto-list` | name above; `nested-interactive` 0; Tab row → action; action click no `itemClick`; 150/150 |
| 20 | `theme-contrast.spec.ts` block (8 entries × 2 themes vs bg and surface) + chart stories vs baseline | ≥ 3:1; diffs only in stories that render entries 3 or 4 without own colours |
| 21 | *Many Segments* 360 | axe `target-size` 90 pass, 0 incomplete; `pointermove` at 3 x positions → the cells' captions |
| 22 | strip stories vs baseline + spec | 36/36 identical; keys, caption, names unchanged |
| 23 | *German Labels* 360 (shot) + EN list stories | every break ends in „-“ or a space; EN identical |
| 24 | *Collapsible* measure | closed: footer `display: none`; after a toggle click: shown |
| 25 | `build.md` | WebKit not installed: 054-n2 stays in BACKLOG |

**Risks (from earlier rounds):** an ancestor ring needs an explicit `Highlight` (037 r1); `:has()` adds its argument's weight (055); the empty `<button>` needs the UA reset because `button:focus { outline: none }` is global (039); wait a rAF after class swaps in measures (042 r1); hero hashes change by anti-aliasing, so compare against `proto-hero`.
