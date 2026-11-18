# Design 066: description-list item icon, accordion nested open state, timeline horizontal overflow

- **Status:** ready
- **Spec:** [spec.md](spec.md), AC-1 … AC-16. Target version 3.46.0 (minor).
- **Prototypes (in the browser, on the 3.45.0 build):** `tmp/story-shots/066/proto-{dl,dl2,acc,acc-rest,tl,fc}.log`. Every rule in §3 was applied in one of them, and every number below comes from those runs.
- **Change note r1 (2026-11-18, review round 1):** the design was wrong for wrapped `rows` values. §3 drew the icon 4 px before line 1, but its rules put it at the start of a text box that fills the row, while line 1 is right-aligned: 13.6–69.8 px apart (build Deviation 1). New D-6 and D-7, prototyped on the 3.46 build (`tmp/story-shots/066/r1-dlproto{,2}.log`); §2, §3, §4 and §9 AC-2 are updated to match.

## 1. Approach

| Part | Kind | Pattern followed | Why |
|---|---|---|---|
| A, dl icon | extends `DescriptionListItem` | `lc-badge`'s icon (`--lc-icon-size: 1em`, `size="xs"`, decorative); the consumer's own variance line (`gap: var(--spacing-1)`, cost-stage.ts) | It looks the same as the hero and tiles, and the icon scales with the text at 200 % |
| B, accordion | SCSS fix | each open-state, size, chevron and plain rule goes from `.lc-accordion--x .lc-accordion__part` to a child chain, with `:where()` for the intermediate parts | `:where()` adds no weight, so specificity and order stay as they are and every winner stays the same. The prototype rewrote all 28 rules on 18 stories: **108/108 shots hash-identical** |
| C, timeline | new optional input + overflow state | `lc-dependency-viewer` (scroll semantics only while it scrolls, a ResizeObserver in an effect, a localised label input) | It meets WCAG 2.1.1 only where needed. Without overflow the DOM stays as it is (AC-13) |

**Design decisions**

- **D-1 (A).** The icon and the value sit in an `inline-flex` wrapper, not inline in the text. An atomic inline always gives a soft wrap opportunity, even next to NBSP or WJ, so an inline icon could end up alone on line 1 ("↑" / "Überschreitungsbetrag"). In the wrapper, line 2 hangs after the icon. Prototype, 150 px card: icon on line 1, 2 lines, no overflow.
- **D-2 (A).** The default DOM stays byte-identical, comment anchors included, for items with neither `icon` nor `badge`. The icon branch is nested inside the existing first branch (`@if (item.badge || item.icon) { @if (item.icon) {…} @else {badge as today} }`), as in pitfall 045 r1. Badge rows gain comment anchors only. Nothing new renders outside `<dl>`.
- **D-3 (B).** Inherited text values still reach a nested accordion: line-height 1.6 and the body colour come from the parent's body. The md head is 52 px nested, 50.5 px alone (the title line is 24 instead of 22.5). This is inheritance, not a leaked rule, and the kit leaves it as it is.
- **D-4 (C), refines AC-12.** The scroller is the `<ol>`. `role="region"` on it would remove the list role (axe `listitem`), and a region wrapper would change the DOM and the scroll geometry of every timeline. So the `ol` keeps its native **list** role and gets `tabindex="0"` plus `aria-label` while it overflows. That meets AC-12's "a role and a name" (screen readers read "Zeitleiste, Liste, 4 Einträge"), and axe `scrollable-region-focusable` has 0 violations (prototype, 360 px).
- **D-5 (C), AC-14 vs AC-16.** Centring the titles changes horizontal timelines that already fit (1280 px *Horizontal*, *Selectable Horizontal* from 1024 px). AC-16's "unchanged" therefore means unchanged apart from AC-14. The expected diffs are listed in §9.
- **D-6 (A, r1), `rows`: the icon is glued to line 1.** CSS can't shrink a wrapped box to its longest line, so in `rows` the icon row becomes inline (`white-space: nowrap`), and the text inside it gets `white-space: normal` back. The break between the icon and the first glyph is then governed by the `nowrap` row (their nearest common ancestor), and the text still wraps and breaks long words (`anywhere`). The icon stands 4 px before line 1 and the lines stay right-aligned, like every other wrapped `rows` value. `stacked` keeps D-1: it is left-aligned, so its lines hang after the icon. Prototype: gap 4 on all 23 icon rows at 360, 1024 and 1280 (as built: up to 69.8). Row heights are unchanged, and a long first word („Budgetüberschreitung“) keeps its first part beside the icon.
- **D-7 (A, r1), `rows`: the icon adds to the value's basis.** The 3.39 basis `min(100%, 6em)` is what keeps a short value from breaking inside. With the icon in it, the value's text got only 6em − 18 px, so „+12.400,00 €“ broke before „€“ at 1280 (build Deviation 2). A value with an icon gets `min(100%, calc(7em + var(--spacing-1)))`. That is the 6em of text plus the 1em icon and its gap, so term text and value text share equally again. Prototype at 1280: the total fits on one line (dd 112.3); 360 `sm`: „6,7 % über Budget“ fits on one line. Terms next to an icon value get up to 9 px less („Letzter / Abgleich“ wraps at 1280; the row height stays 59). A value that needs more than its share still wraps, as any longer value does (156 px card: „2,1 % unter / Plan“, row 79 instead of 58). Items without an icon are untouched.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| item field | `DescriptionListItem.icon` | `string` (optional) | `undefined` | Kit icon name (`lc-icon`'s `name`), drawn before the value on its first line, in the value's colour and at the size of its text (1em) (3.46, finance-intelligence kosten row 3). Always decorative (`aria-hidden`), so the value's text must say what the icon shows („6,7 % über Budget“ with `arrow-up`). It is not part of a link and comes before a badge. Register it as for any `lc-icon`. `@default undefined` |
| input | `TimelineComponent.scrollLabel` | `string` | `'Timeline'` | Accessible name of the list while a horizontal timeline without `selectable` is wider than its box (3.46, 065-s1, WCAG 2.1.1). The list then becomes a tab stop with this name, the arrow keys scroll it, and it shows the kit's focus ring. Set a short, localised name that is unique on the page („Zeitleiste“). `''` omits the name. Not used otherwise. `@default 'Timeline'` |
| accordion | none | — | — | Selector scoping only (B) |
| CSS hook | none | — | — | — |

- **Template, A** (`description-list.component.html`): the dd chain becomes `@if (item.badge || item.icon) { @if (item.icon) { ICON-ROW } @else { badge content as in 3.45 } } @else if (item.href) … @else {plain}`. `ICON-ROW` = `<span class="lc-dl__icon-row"><lc-icon class="lc-dl__icon" [name]="item.icon" size="xs" [decorative]="true" aria-hidden="true" /><span class="lc-dl__icon-text">` + the full 3.45 chain (badge, href, datetime, plain) + the suffix block + `</span></span>`, with no whitespace text nodes at the dd edges (3.39 AC-17). The dd-level suffix block becomes `@if (item.valueSuffix && !item.icon)`, which keeps the same anchor count. `@if (clickable())` stays last in the dd. r1 (D-7): `valueClass(item)` appends ` lc-dl__value--icon` when `item.icon` is set (an item without an icon keeps its class string). Import `IconComponent`. Kit glyphs are not registered, because the name comes from the consumer, as with `TimelineItem.icon`.
- **TS, C:** `private readonly overflowing = signal(false)`. `protected readonly scrollable = computed(() => orientation() === 'horizontal' && !selectable() && overflowing())`. An `afterRenderEffect` that tracks `items()`, `orientation()` and `selectable()`: when horizontal, not selectable, and `typeof ResizeObserver !== 'undefined'`, one RO observes the `ol` (`viewChild('list')`) and each `li`, and its callback sets `overflowing(ol.scrollWidth > ol.clientWidth)`. Otherwise it sets `false`. It disconnects on re-run and on destroy. `timelineClasses` appends `timeline--scroll` when `scrollable()`. On the `ol`: `[attr.tabindex]="scrollable() ? 0 : null"` and `[attr.aria-label]="scrollable() ? (scrollLabel() || null) : null"`. On the server and in jsdom there is no RO, so none of this renders.
- **Default rendering unchanged:** A uses D-2. B keeps the same declarations and weights (proved 108/108). C adds nothing unless the list overflows in a browser. Vertical timelines and selectable ones never get these attributes.

## 3. Anatomy and layout

### 360 px

```
A  card padding lg, list 278 px (story Item Icons)
   rows · md                                        row 37 px = 8 + 21 + 8 (unchanged)
   Abweichung zum Budget ······ [↑]·6,7 % über Budget
                                 14 4  text 14/21, the icon centred on the 21 px line
   stacked · md                 [↑]·6,7 % über Budget   (dd start, x of the dd)
   rows, wrapped (r1, D-6)      Abweichung zum ···· [↑]·6,7 % über    icon 4 px before line 1,
                                Budget                       Budget    lines right-aligned
   narrow, list 122 px          Abweichung zum
                                Budget
                                     [↑]·6,7 % über      value on its own line (3.39 rule),
                                             Budget      right-aligned, icon glued to line 1
   stacked, wrapped             [↑]·6,7 % über           left-aligned: line 2 hangs after
                                    Budget               the icon (D-1)

B  Verschachtelt (plain lg leading), max 560
   [⌄] Kostenstelle 4711 · IT-Betrieb                     head 18 + 1lh + 18 (lg)
       3 Budgets, eines über Plan.
       ⟶ children indented 32 px (chevron 20 + gap 12 = parent title x)
       [›] Budget Software-Lizenzen        closed: host = head height, panel 0, chevron 0°
       [⌄] Budget Cloud-Dienste            open: own body padding 16/20
           Plan 120.000,00 € · Ist 128.040,00 €
       [›] Budget Hardware                 closed
   [›] Kostenstelle 4712 · Netze           closed parent; its open child stays hidden

C  Horizontal, 360: canvas padding 16, ol x 16, w 328, content 512 (184 hidden)
   ┌╌╌ ring 2 px, offset 2 px: x 12–348, y 12–104.5 ╌╌┐
   │ (●)────────(●)────────(●)──…    marker tops touch y 0 (an inset ring would cover them)
   │ Step 1      Step 2      Step 3   titles centred over their markers (64 / 192 / 320)
   │ Kickoff  Development  Testing
   └╌╌ tab stop „Timeline“ (DE story: „Zeitleiste“), arrow keys scroll ╌╌┘
```

### From 1024 px (1280 px the same)

```
A  cards in the auto-fill grid; a value wraps only when term + 32 + value > row (as 3.45)
B  same as at 360 (max-width 560)
C  ol 992 / 1248 wide, content fits (992/992, 1248/1248): no tab stop, no name, no ring
   titles: item 2 centre 173.7 → 192.0 = marker 192.0 (all 4 items equal, ±0.0)
```

| Element | Rule (as prototyped) | Value |
|---|---|---|
| `.lc-dl__icon-row` | `display: inline-flex; align-items: baseline; gap: var(--spacing-1); max-width: 100%; vertical-align: top` | gap 4 px. The text item sets the baseline, so term and value stay on one baseline (row heights 37 / 62 / 26 and 38.5 / 62.5 / 27 with a badge are unchanged) |
| `lc-icon.lc-dl__icon` | `--lc-icon-size: 1em; align-self: flex-start; height: 1lh; flex-shrink: 0` | md 14 × 14, sm 12 × 12. Centred on line 1 (±0.5 px). Digit ink centre within 0.57 px (md) / 0.23 px (sm) |
| `.lc-dl__icon-text` | `min-width: 0` | inherits `text-align` (rows right, stacked left) and `overflow-wrap: anywhere` |
| r1, D-6: `.lc-dl--rows .lc-dl__icon-row` | `display: inline; white-space: nowrap; vertical-align: baseline` | (0,2,0) beats the rule above; `gap`, `align-items` and `max-width` then don't apply |
| r1, D-6: `.lc-dl--rows .lc-dl__icon-text` | `white-space: normal` | the value wraps and breaks long words as before |
| r1, D-6: `.lc-dl--rows lc-icon.lc-dl__icon` | `vertical-align: top; margin-inline-end: var(--spacing-1)` | `height: 1lh` stays, so the icon is centred on line 1 (±0.9 px). 4 px before the first glyph |
| r1, D-7: `.lc-dl--rows > .lc-dl__row > .lc-dl__value.lc-dl__value--icon` | `flex-basis: min(100%, calc(7em + var(--spacing-1)))` | (0,4,0) beats the 3.39 basis (0,3,0) without moving after it. md 102 px, sm 88 px |
| Placement in SCSS (r1 rules too) | a new section **before** `// ── word breaks (3.37 …)` | `whitespace.spec` pins `.lc-dl__sep` directly before the narrow block, and `narrow-row.spec` pins exactly 4 rules from there to the file end |
| B selector map (compiled, before → after) | `.M .lc-accordion__header` → `.M > :where(.lc-accordion__heading) > .lc-accordion__header`; `.M .lc-accordion__icon`/`__title` → `.M > :where(.lc-accordion__heading) > :where(.lc-accordion__header) > .lc-accordion__icon`; `.M .lc-accordion__panel` → `.M > .lc-accordion__panel`; `.M .lc-accordion__body` → `.M > :where(.lc-accordion__panel) > .lc-accordion__body` (pseudo suffixes stay on the last compound) | `.M` = every modifier compound (`--sm/--md/--lg`, `--expanded`, `--chevron-leading`, `--plain`, combinations). All 28 rules, the reduced-motion list and the forced-colours rule included. `.lc-accordion__header:hover .lc-accordion__icon` stays. Angular's shim scopes inside a compound that is only `:where(…)` and adds no attribute outside it (compiler `_pseudoFunctionAwareScopeSelectorPart`), so the weight stays (0,4,0) etc. Write `:where()` for **each** intermediate level: `:where(.a > .b)` would anchor `.M` to the wrong element |
| `.timeline--horizontal .timeline__header` | `justify-content: center` (inside the horizontal block) | a title and badge group is centred over the marker. A header with `meta` keeps title at the start and meta at the end (the auto margin absorbs the space) |
| `.timeline--scroll` | `@include mix.focus-ring` (2 px `--color-primary-500`, offset 2 px) + `@media (forced-colors: active) { .timeline--scroll:focus-visible { outline-color: Highlight } }` | an outside ring: the list has no padding and its markers touch y 0. It needs 4 px of room (16 in the story) |

## 4. States

| State | A dl icon | B nested accordion | C timeline |
|---|---|---|---|
| default | icon + value on line 1 | each level reads only its own classes | fits: as 3.45 (titles centred) |
| hover / active | clickable row hover as 3.45 (icon in the value ink, 16.12:1 on hover light) | as 3.45, per level | — |
| focus-visible | the row button and link rings as 3.45; the icon is never focused | each head has its own ring | overflowing: 2 px outside ring, 4.37 L / 9.95 D |
| disabled | — | a disabled parent dims its children (opacity of the ancestor), as before | — |
| loading / empty | `value: ''` + `icon`: the icon shows alone (decorative); unknown or unloaded name: `lc-icon`'s own placeholder in a 1em box | lazy bodies as 3.45 | `items: []`: no overflow, nothing added |
| error | — | — | — |
| overflow | long German first word: breaks beside the icon (`anywhere`), the icon stays on line 1, 4 px before it (also in `rows`, D-6); a value that needs more than its share (icon included, D-7) wraps as any longer value; 200 %: the icon grows with the text (1em) | long titles wrap per level (plain hyphenates) | resized while focused and it stops overflowing: tabindex goes and focus falls to `body` (rare, accepted) |

## 5. Theming

| Element | Light | Dark | Contrast (computed, `grid.log`) |
|---|---|---|---|
| dl icon (decorative, 1.4.11 exempt) | the value's ink: primary `#111827`, muted `#5c6672`, `primary` emphasis `#144f5b` | `#f1f6f8` / `#93a4ad` / `#84c7d4` | surface L 17.74 / 5.84 / 9.13; D 15.85 / 6.71 / 9.13 |
| dl icon, forced colours | CanvasText (svg `color: inherit`, measured black/white = dd text) | same | system |
| timeline ring | `--color-primary-500` `#208497` | `#84c7d4` | page/surface L 4.37 / 4.37; D 9.95 / 9.13 |
| timeline ring, forced colours | Highlight (measured `rgba(5,0,73,.8)` L, `rgba(0,230,255,.8)` D) | — | system |

No new tokens.

## 6. Accessibility

- **A:** `lc-icon` has static `aria-hidden="true"` on the host (also in SSR) plus decorative, so the svg gets `aria-hidden`. No tab stop. The dd `textContent` stays the same, so the clickable row name (`aria-labelledby` term + value) is unchanged. The icon is outside the `<a>`. Under forced colours it uses CanvasText.
- **B:** no ARIA change. A collapsed parent panel stays `inert` and `aria-hidden`, so its children can't be reached. Tab order is DOM order (parent head, then the child heads of an open parent), and each `aria-expanded` follows its own state.
- **C:** while it scrolls, the `ol` is a list with a name and a tab stop. Native arrow, Home and End scroll it, so no key handler is needed. Its `:focus-visible` ring is 2 px with 2 px offset, Highlight in forced colours. Selectable and vertical timelines are unchanged (their buttons are the tab stops). There is no motion and nothing is announced. There is no 44 px concern, because the list is a scroll region and not a pointer target.

## 7. Texts

| Key / input | EN default | DE | Checked |
|---|---|---|---|
| `scrollLabel` (lc-timeline) | Timeline | Zeitleiste | aria-label only, not visible, so no width impact |
| dl, accordion | no built-in text | — | — |

## 8. Stories

| Story (export, name) | Expected ID | Args / setup | Shows |
|---|---|---|---|
| `ItemIcons`, „Item Icons“ | `components-description-list--item-icons` | `lang="de"`. Cards as in *Badge Values* (rows·md, stacked·md, rows·sm, rows·md `clickable`) plus a 156 px card. Items: Abweichung zum Budget / 6,7 % über Budget / `arrow-up`, strong. Prognose / 2,1 % unter Plan / `arrow-down`. Fassung / 1 + badge Freigegeben (success) / `check`. Beleg / FC-2026-0412 / `href`, primary / `file-text`. Letzter Abgleich / heute 06:00 / `datetime` + suffix automatisch, muted / `clock`. Überschreitung gesamt / +12.400,00 € / `total` / `arrow-up`. Clickable card: items 1, 2, 6 only (no nested link). 156 px card: items 1, 2. `controls.include: ['items']` | AC-2, AC-4, AC-5: placement in every layout and size, emphasis inks, badge, link, time + suffix, total, clickable, the narrow wrap |
| `Nested`, „Verschachtelt“ | `components-accordion--nested` | §3 B, all `plain lg leading`, `lang="de"`, max-width 560. Children in a `div` with `padding-inline-start: 32px`. `controls.disable` | AC-7 to AC-9: the requester's case, an open child, and a closed parent with an open child |
| `NestedVariants`, „Nested Variants“ | `components-accordion--nested-variants` | 3 open parents with closed or open children: outlined·lg·trailing ⊃ flat·sm·leading (closed), plain·md·trailing (closed), outlined·sm (open). flat·sm·leading ⊃ outlined·lg·trailing (closed), plain·lg·leading (closed). plain·md·leading ⊃ outlined·md·trailing (closed), flat·lg·trailing (closed). Each title names its config. `controls.disable` | AC-7: every variant, size and chevron mismatch |
| `HorizontalGerman`, „Horizontal, German“ | `data-display-timeline--horizontal-german` | `lang="de"`, `orientation: 'horizontal'`, `scrollLabel: 'Zeitleiste'`, items Antrag / Eingereicht · Prüfung / Fachbereich · Freigabe / Controlling · Auszahlung / Buchhaltung. Play (story view only): poll up to 1 s for `ol[tabindex="0"]`, then `focus({ preventScroll: true })` | AC-12, AC-15, AC-16: German name, the ring at 360, no tab stop from 1024 |
| meta argTypes | — | timeline `scrollLabel`: control text, description from the JSDoc, `table.defaultValue "'Timeline'"`. dl `items` description: "3.46: `icon`" | MCP and docs |

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| AC-1 | Unit test: dd `innerHTML` (only `_ngcontent` stripped, comments kept) of plain, href, datetime and suffix items without `icon` equals the 3.45 strings (captured on `main` before the change). Badge items compared with comments stripped. `--compare` of the 16 dl stories | equal; 96/96 identical |
| AC-2 | *Item Icons* at 360/1024/1280 L: icon box vs the first text line; svg `color` vs dd `color`. r1: the gap is icon right → **first glyph of line 1** (Range rects, not the text box), on every icon row, wrapped ones included; `rows` heights; the total row's lines | 14 × 14 (md) and 12 × 12 (sm); centre − line-1 centre within ±1 px; glyph gap 4 ± 0.5 on all 23 rows (r1 proto: 4.0 everywhere); colours equal per emphasis. Rows (r1 proto) 360: 59/38/38.5/38/59/62 · 62/62/62.5/62/62/66 · 45/27/27/27/45/30 · 66/45/69 · 101/79; 1280: the same, except `sm` 45/27/27/27/45/48. 1280 total „+12.400,00 €“ on one line (rows md and clickable). Equal to the rows without an icon except where value + icon exceed the share (D-7: `sm` „heute 06:00 automatisch“ 27 → 45 at 360, 156 px „2,1 % unter Plan“ 58 → 79) |
| AC-3 | Unit test | `lc-icon[aria-hidden="true"]`, svg `aria-hidden`; dd `textContent` with and without icon equal (5 shapes); no new `[tabindex]` or `button` |
| AC-4 | One unit test each: badge (DOM order icon, value, badge), href (`lc-icon.closest('a') === null`), datetime, total, clickable (labelled-by ids and their text unchanged) | as stated |
| AC-5 | *Item Icons* 360 L/D: `iconTop − firstLineTop` ≤ 4 and glyph gap 4 ± 0.5 on every icon row (r1); `--forced-colors` svg stroke = dd colour. Compat: probe-336 gets item `{ term: 'Abweichung zum Budget', value: '6,7 % über Budget', icon: 'arrow-up' }`; `EXPECT`: `<span class="lc-dl__icon-row"><lc-icon` with `aria-hidden="true"` and class `lc-dl__icon` inside that dd | on line 1; CanvasText; regex passes on 21 and 22 |
| AC-6 | Unit test: unknown name renders `lc-icon` with it, no throw; dl axe spec with icon items | 0 violations |
| AC-7 | *Nested* + *Nested Variants* 360/1280: each closed child | panel 0; body padding 0/0, `visibility: hidden`; icon `transform: none`; head padding = its own size (sm 10, md 14, lg 18 px block); icon `order` −1 leading / 0 trailing; host = head height. Prototype: before fix 18 / 60 / visible / rotated, after fix 14 / 0 / hidden / none |
| AC-8, AC-9 | Unit test: compile the SCSS, strip `:where(`, and for every rule containing `--expanded` check `element.matches()` against the rendered nested DOM (parent open with child closed, and the reverse). A regex guard: no compiled selector `.lc-accordion--… .lc-accordion__…` with a descendant space remains. Story measure: click child open, then closed, then close the parent | the child's parts match only their own state; child open panel 52.4, closed again 0, parent unchanged |
| AC-10 | `--compare=tmp/story-shots/066/baseline` of 18 accordion stories × 360/1024/1280 × L/D `--full` | 108/108 identical (the prototype already gives 108/108) |
| AC-11 | Unit test (Tab order of the non-inert heads, each `aria-expanded`) + axe spec with nested accordions | DOM order; 0 violations |
| AC-12 | *Horizontal, German* 360 L/D `--axe`: `ol` sw/cw, attributes, ring box, `:focus-visible` outline; overflow-x computed `auto` (native arrow scrolling) | 512 > 328; `tabindex="0"`, `aria-label="Zeitleiste"`, role list; outline 2 px solid, offset 2, ring x 12–348 inside 360; `scrollable-region-focusable` 0 |
| AC-13 | Unit test with a fake `ResizeObserver` and stubbed `scrollWidth`/`clientWidth`: overflow on, then off. No RO: nothing. Story at 1024/1280: none of the three. *Selectable Horizontal* 360: none on the `ol`. Compat: a horizontal timeline `id="compat-timeline-346"` (4 items) | attributes on, then removed; server `<ol class="timeline timeline--horizontal">` without `tabindex`/`aria-label` |
| AC-14 | *Horizontal* 1280 (and 360/1024): title centre vs marker centre for every item | diff ≤ 1 px (proto 0.0: 64 / 192 / 320 / 464); *Selectable Horizontal* 1024: 109.4 / 342.5 / 552.5 equal |
| AC-15 | Unit test: default `'Timeline'`; `'Zeitleiste'` → `aria-label`; `''` → no `aria-label`; vertical and selectable stay without it even when overflowing | as stated |
| AC-16 | `--compare` of all 264 baseline shots; `--forced-colors` focus run on *Horizontal, German* 360 | 254 identical, 10 differ: `data-display-timeline--horizontal` ×6, `--selectable-horizontal` 1024/1280 × L/D ×4. Ring Highlight |

**Baseline:** `tmp/story-shots/066/baseline` (264 shots, `--full`, 360/1024/1280 × L/D: 16 dl, 10 timeline and 18 accordion stories), from `main` d6cdc79 (3.45.0), Storybook rebuilt with `--skip-nx-cache`.

**Existing assertions that change (stated reason: the B fix):** in `accordion.plain.spec.ts`, the 3.22.4 length and sha1 of the pre-plain CSS (3873, `ad6152…`) get the new values with a 3.46 comment; every `rule()`/`at()` selector string becomes its child-chain form; the reduced-motion list and the forced-colours regex change too. Nothing else is expected. If `kit-icons.spec` flags a dl literal once the dl imports `IconComponent`, add a `NOT_ICONS` entry (it prints them).

**Changelog notes:** under Fixed, B. Under Compatibility: (1) the description list now imports `lc-icon`; give the dl entry's size delta in `build.md`. (2) Horizontal timelines centre their titles (065-n1).

**Risks named (agent memory):** comment anchors per branch (045 r1); appending to the dl pins (`whitespace`/`narrow-row`); the ring on an overflowing scroller without padding (059 r1/r2); keyboard paths in scrollers (065 r3); forced-colour rings on own elements vs ancestors (037 r1); story args and controls (055 r1).
