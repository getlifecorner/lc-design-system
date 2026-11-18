# Design 067: lc-number-input without steppers, lc-waterfall-chart long labels, USM X lc-sidenav gaps

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-N1…N4, AC-W1…W5, AC-S1…S12
- **Measured on:** `main` 77f89b5 (3.46.0), Storybook built 2026-11-18; probes and logs in `tmp/story-shots/067/`.

## 1. Approach

Extend three components; no new component, token or dependency. Patterns followed:

| Need | Pattern reused | Why |
|---|---|---|
| N: no steppers | size modifier classes of `lc-number-input` (`number-input--lg`) | a class only when the input is `false`: default DOM unchanged |
| W: long labels | `<tspan>` lines in one `<text>`, SVG `<title>`; a pure layout function | `role="img"` on the SVG keeps lines and titles out of the a11y tree |
| S1 slot | attribute slots (`[hero-media]`, `[shell-nav]`) | kit convention |
| S6 open groups | `collapsedSections` model (3.45) | same shape (`readonly string[]`, two-way) |
| S11 template | `lcListItem` content-child directive (`lc-list`) | typed context, works in strict templates |
| S11 highlight | `lc-command-palette` `parts()` (case-insensitive, every match) | same matching rule in the kit |
| S9 Escape | `OverlayStackService` (`lc-modal`, `lc-drawer`, `lc-menu`, `lc-popover`, `lcTooltip`) | the kit's existing "top-most layer" source |
| S8/S10 hooks | `var(--lc-sidenav-X, <today's value>)`, read where used, never declared | ancestor values reach the rail (020) |

Spec corrections found while measuring (recorded here, no owner question): today's text-brand block at `md` is **64 px**, not 56 (AC-S10); icons are **20 px**, not `1.25rem` (AC-S8; a rem default would double at 200 % text); groups have **no** `aria-controls` today, only foldable sections do (AC-S5); `logoSrc` never reached the brand tile (AC-S4) → new `brandLogoSrc`; the field shows no digit grouping since 3.29, so the AC-N4 story shows „2960,00“, not „2.960,00“.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (number-input) | `showSteppers` | `boolean` | `true` | Draws the − and + buttons (3.47, kosten row 5). `false`: only the value box (and `suffix`) in the field, as high as with steppers (xs 24 · sm 32 · md 40 · lg 44 px inside the border); ArrowUp/ArrowDown still step by `step`. Size the box for the longest value with `--lc-number-input-value-width`. |
| input (waterfall) | `wrapLabels` | `boolean` | `true` | A category label that would run into a neighbour wraps onto a second line at a space, after a hyphen or at a soft hyphen (U+00AD, drawn as „-“); a line still too wide, or a single word, ends in „…“ and gets an SVG `<title>` with the full label. The chart grows by one line (14 px at 11 px text) only when a label wraps. `false`: one line each, as before 3.47. |
| JSDoc (waterfall) | `WaterfallItem.label` | — | — | add: „Give long single words a soft hyphen (U+00AD) where they may break.“ The default `ariaLabel` and `<title>` drop U+00AD. In this document ⟨SHY⟩ stands for U+00AD. |
| slot (sidenav) | `[sidenav-top]` | — | — | Content between the brand and the items (area picker, search), in the docked rail and the drawer; scrolls with the items like the brand; hidden on the collapsed rail. Nothing is drawn without content. |
| input | `brandRoute` | `string` | `'/'` | `routerLink` of the brand when `brandHref` is empty (USM X row 39). |
| input | `brandLink` | `boolean` | `true` | `false`: the brand is a plain block (`<div>`, no link, no tab stop); tile, name and subtitle stay. |
| input | `brandLogoSrc` | `string` | `''` | Image in the brand tile (decorative, `alt=""`), 24 × 24 contained; wins over `brandIcon` and `brandLetter`. Filter: `--lc-sidenav-brand-logo-filter`. |
| model | `expandedGroups` | `readonly string[]` | `[]` | Ids of the open groups, any depth (two-way, USM X row 41). Seeds and replaces the open set; every change (a toggle, the current-item rule, a write to `expandedItems`) is reported as the full list. Ids not yet in `items` stay and apply when the group arrives. Opening by input emits no `expandRequested`. First render (also prerendered): the input's ids plus the current item's ancestor groups; later the ancestors are added only when the current item's id changes (not on an `items` update). |
| input | `highlight` | `string` | `''` | Text marked in every label (case-insensitive, every match, trimmed) with `<mark class="lc-sidenav__mark">`. Ignored when an `lcSidenavLabel` template is set (the template gets it in its context). |
| output | `itemActionClick` | `NavigationItemActionEvent` | — | `{ item, event, element }` for every action button press (rows at any level and section headings), after `itemAction` and in the same cases; `element` is the button, to anchor a menu. Drawer: render the menu inside the panel (default slot), it is a modal dialog. *r1:* while the menu is open, set `aria-haspopup="menu"` and `aria-expanded="true"` on `element` (`"false"` on close); the button then stays visible. |
| directive | `lcSidenavLabel` (`SidenavLabelDirective`, `sidenav/sidenav-label.directive.ts`, exported) | `TemplateRef<SidenavLabelContext>` | — | `<ng-template lcSidenavLabel let-item let-level="level">` replaces the label text at every level, inside `.lc-sidenav__nav-label` (ellipsis kept). Must show the label text (it is the link's name); nothing interactive. `ngTemplateContextGuard`. |
| type | `SidenavLabelContext` | `{ $implicit: NavigationItem; level: number; highlight: string }` | — | `level` 1 = top-level item, +1 per section or group. |
| type (models) | `NavigationItemActionEvent` | `{ item: NavigationItem; event: MouseEvent; element: HTMLButtonElement }` | — | beside `NavigationItemContextMenuEvent`. |
| CSS hook | `--lc-sidenav-focus-ring` | color | `--_lc-sidenav-t-accent`, else `--color-primary-500` | every sidenav outline (9 sites incl. `.lc-sidenav__content a/button`). |
| CSS hook | `--lc-sidenav-muted-fg` | color | `--lc-sidenav-section-fg`, else theme section ink | `muted` items at rest. |
| CSS hook | `--lc-sidenav-icon-size` | length | `20px` | item icon box and glyph (sets `--lc-icon-size` on the `lc-icon` host), image icon, busy and loading spinners; rail box = value + 2 px (22). |
| CSS hook | `--lc-sidenav-backdrop` | color | `rgba(0, 0, 0, 0.5)` | drawer backdrop (the literal becomes the fallback). |
| CSS hook | `--lc-sidenav-brand-height` | length | by `logoSize`: 56 · 56 · 64 · 80 · 112 px | `min-height` of the brand block (text brand and image logo); in the shared `logo` mixin, so `lc-sidenav-placeholder` follows. |
| CSS hook | `--lc-sidenav-brand-logo-filter` | filter | `none` | on the `brandLogoSrc` image, e.g. `brightness(0) invert(1)` for a white silhouette. |

Kept and compatible: `itemAction` (item only), `expandedItems` (`WritableSignal<Set<string>>`; now a `linkedSignal` seeded from `expandedGroups`, so open groups are in the first, also prerendered, render). JSDoc of `items`: children nest to any depth. **Default rendering unchanged:** steppers and the waterfall's one-line text sit in `@if` branches (comment anchors only); the no-stepper class, `<tspan>`, `<title>`, `<mark>`, the static brand and the logo image exist only when their input is set. Hooks fall back to today's literal values. Two DOM differences are expected and normalised in the review (§9): the empty `<div class="lc-sidenav__top"></div>` and the brand's inert `routerlink="/"` attribute (static → bound).

## 3. Anatomy and layout

### lc-number-input, `showSteppers=false` (360 = 1280)

```
Erklärter Betrag                 label 14/500, gap 6
┌───────────────────┐            control: 1 px --color-field-border, radius md; lg 46 high (44 + 2)
│        2960,00 €  │            value box = --lc-number-input-value-width (story calc(7ch + 0.5rem) = 87.2)
└───────────────────┘            suffix pad 0.25em / 8; control 112.6 wide
Höchstens 2960,00 € (Restbetrag) helper 12/1.4
```

| Element | Rule |
|---|---|
| buttons | not rendered (`@if (showSteppers())`); the value box (and suffix) is the whole field, no gap to the border |
| `.number-input--no-steppers .number-input__input` | `height`: xs `--size-interactive-xs-height` · sm `-sm-` · md `2.5rem` · lg `-lg-`; `padding-block: 0` |
| control, input, suffix | unchanged (width, alignment, hover, focus halo, error outline). Measured without the rule: xs 20, sm 23, lg 29 high, so the rule is required |

### lc-waterfall-chart labels (prototype `tmp/story-shots/067/proto/`, 564 px, 9 bars)

```
──┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴──  zero line h − 30 (plot unchanged: PL 50, PR 10, PT 15, PB 30)
 Periodi- Verschie- Unge- Nicht  Preis Menge Einmalig Nicht Summe   line 1 baseline h − 14 (as today)
 sierung   bung   plant eingetr…                  erklärt            line 2 dy 1.2em; svg height h + 14
```

| Step | Rule |
|---|---|
| slot, gap, avail | slot = (W − 60) / n · gap 4 · avail = slot − 4 |
| room `M_i` | 2 × min(left, right), at least avail; left = slot − min(w₍i−1₎, avail)/2 − 4 (first: centre − 2); right = slot − min(w₍i+1₎, avail)/2 − 4 (last: W − 2 − centre) |
| one line | `w_i ≤ M_i` → today's markup. All 3 existing stories at 360/1024/1280 stay one line (Revenue 44.8 ≤ 49.5; a per-slot rule would have cut it) |
| breaks | after a space (dropped), after „-“, at U+00AD („-“ drawn) |
| choice | longest line 1 ≤ M whose line 2 ≤ M; else longest line 1 ≤ M with line 2 cut; no line 1 fits → one line, cut |
| cut | drop characters (and trailing spaces) until text + „…“ ≤ M, at least one character; `<title>` (first child of `<text>`) = full label without U+00AD |
| markup | `<text x y text-anchor="middle" class="lc-waterfall-chart__label"><title>?</title><tspan [x]>l1</tspan><tspan [x] dy="1.2em">l2</tspan></text>` |
| height | any 2-line label: `height` and viewBox height = `height()` + ceil(1.2 × font px) = +14 at 11 px; bars, grid, axis unchanged |
| widths | SSR and first render: estimate = Σ em widths of `tmp/story-shots/067/proto/sf-char-widths.json` × 11 px (unknown 0.7 em, ≥ U+2E80 1 em, U+00AD 0; „Periodisierung“ 75.6 vs 75.4 real). Browser, in the existing `afterNextRender`: a temporary `<text class="lc-waterfall-chart__label">` appended to the SVG, `getComputedTextLength()`, removed; font px from its computed `font-size`; again once after `document.fonts.ready`; cache by text + font. No method (jsdom) → keep the estimate |
| function | pure `layoutWaterfallLabels(labels, width, measure)` → `{ lines, cut }[]`, unit-tested with a mock measure |

### lc-sidenav — 360 (drawer 280 wide) and from 1024 (docked, `width` 320)

```
┌────────────────────────────── 280 ┐   docked 1280: same column, 320 wide, items 303
│ [X] USM X / Arbeitsbereich  [ × ] │   brand block 64 (hook), × 44 at top (h − 44)/2 = 10
├────────────────────────────────────┤
│ ┌ Bereich ▾ ───────────────────┐  │   slot: pad 16 8 0, column gap 8, x 8, w 264 (docked 303)
│ ┌ ⌕ Navigation durchsuchen ────┐  │
│                                    │   nav pad-top 16 after a non-empty slot
│ ▣ Workflows                    ▾  │   level 1: x 8, 264 × 44
│   ▣ Eingangsrechnungen         ▾  │   level 2: +16 → x 24 (unchanged rule)
│      ▣ Prüfung              ▾  ⋯  │   level 3: +12 → x 36; action 28, hit 44 × 44
│         ▣ Freigabe             ▾  │   level 4: x 48
│            ▣ Rechnungsfreig… ⋯    │   level 5: x 60, row 212, label 132 (with action), 160 without
```

| Element | Rule (tokens) |
|---|---|
| `div.lc-sidenav__top` (one line in the template, no whitespace) | after the close button, before `<nav>`; `display: flex; flex-direction: column; gap: var(--spacing-2); flex-shrink: 0; padding: var(--lc-density-padding-md, 1rem) var(--lc-sidenav-nav-padding-x) 0`; `:empty` → `display: none`; `.lc-sidenav--collapsed` → `display: none` |
| slot in a drawer without text brand | `padding-top: 4rem` (room for the ×, as the nav today) |
| nav after the slot | `.lc-sidenav__top:not(:empty) ~ .lc-sidenav__nav { padding-top: var(--lc-density-padding-md, 1rem) }` (also beats the transparent 3rem) |
| transparent variant | slot `padding-inline: var(--spacing-6)` (pill inset 24) |
| nesting | one recursive `ng-template` (context: item, level, optionalIcon). A child with children/`hasChildren` = group row (`div.lc-sidenav__nav-item-row` > `button.lc-sidenav__nav-item--parent` + action); a child with `action` = row (`a/button.--child` + action); else the bare `a/button.--child` of today. `optionalIcon` inherited from the level-1 parent (sections: true) |
| indent | first `.lc-sidenav__nav-children` `padding-left: var(--spacing-4)` (16, unchanged); `.lc-sidenav__nav-children .lc-sidenav__nav-children { padding-left: var(--spacing-3) }` (12), in the `children` mixin |
| `has-active-child` | every ancestor group of the current item (any depth), also while folded |
| action hit area | `.lc-sidenav__nav-item-row .lc-sidenav__action-btn { position: relative }` + `::before { content: ''; position: absolute; inset: -8px }` → 44 × 44; left 8 px over the item's 10 px end padding, right 8 px = nav padding. Section-heading actions stay 28 (a 44 box would cover the first item) |
| static brand | `div.lc-sidenav__brand.lc-sidenav__brand--static`, same box; `cursor: default`, no hover fill; `data-tooltip` kept for the rail |
| logo image | `img.lc-sidenav__brand-img` in the tile: 24 × 24, `object-fit: contain`, `filter: var(--lc-sidenav-brand-logo-filter, none)` |
| `mark.lc-sidenav__mark` | `background: none; color: inherit; font-weight: var(--font-weight-bold, 700); text-decoration: underline; text-underline-offset: 0.15em` |
| drawer × with brand | `top: calc((var(--lc-sidenav-brand-height, 64px) - 44px) / 2)` (px: 10 at every text size by default) |
| label widths (icon 20, gap 12, pad 10/10, chevron 16, action 28) | level 5 in the 360 drawer: leaf 160, leaf + action 132, group 132; in the 280 px story rail (rows 263): 159 / 131 / 131; level 4 group + action 115 |

## 4. States

| Component | State | Behaviour |
|---|---|---|
| number-input | default · hover · focus-within · error · invalid · disabled | as with steppers (border text-secondary on hover, primary-500 + 20 % halo, error-600 outline, opacity .5) |
| | overflow | value longer than the box scrolls; widen with the hook (story `calc(7ch + 0.5rem)`, scroll 87 = client 87) |
| | known limit (pre-existing, not in spec) | no digit grouping; a typed „2.960,00“ becomes 2,96 (first separator = decimal). Listed for the review as a follow-up |
| waterfall | fits / wraps / cut | §3; cut labels show the full text as a native tooltip on hover |
| | very narrow | 9 bars in 328: avail 25.8, every label cut to 2–3 letters + „…“, no overlap; the aria-label keeps the full list |
| | `wrapLabels=false`, empty data | 3.46 drawing |
| sidenav slot | empty / content / rail / drawer | no box / column at x 8 / hidden / between × and items |
| brand | link · static · rail | hover fill + ring / none, no tab stop / tile only, name sr-only, tooltip on hover |
| groups (any level) | folded · open · loading · lazy | chevron 0°/180°; loading row in the group's indent; `expandRequested` when a `hasChildren` group without children opens |
| action | rest · row hover · focus-visible · `aria-expanded="true"` | opacity 0 · 1 · 1 · 1, hit 44. *Change note r1:* „as today" was wrong — inside a row the opacity-0 rule (`_ngcontent` ×2, 0,4,0) beats `:focus-visible` (0,3,0), so a focused row action stayed invisible since 3.0. In the `.lc-sidenav__nav-item-row` block: `.lc-sidenav__action-btn:focus-visible, .lc-sidenav__action-btn[aria-expanded='true'] { opacity: 1; }` |
| highlight | match / none / blank / template | marks / plain / plain / template decides |
| truncated label | pointer enters an item | `title` = full label on `.lc-sidenav__nav-label` when `scrollWidth > clientWidth`, removed when it fits; not on the rail, not when the row has a kit tooltip (`rowTooltip`); never in prerendered HTML |
| Escape (drawer open) | ordered checks | `defaultPrevented` → ignore · not `OverlayStackService.claim(drawerId, event)` (a modal, the palette, a menu, popover or tooltip above) → ignore · else `preventDefault()` and close. The drawer pushes its id while its panel is rendered and removes it on close and destroy. No focus test: a drawer with `hasOverlay=false` and focus on the page must still close as before. `lc-select`/`lc-combobox` panels stop their Escape already |
| long German / many items | | labels end in „…“ (+ title); the panel scrolls, slot and brand scroll with it |

## 5. Theming

No new token. Contrast computed with the WCAG formula in `--measure` (logs `tmp/story-shots/067/probe-sn2`, `probe-contrast`).

| Element | Light | Dark | Contrast L / D |
|---|---|---|---|
| focus ring, default, auto rail | #208497 on #f9fafb | #84c7d4 on #070e15 | 4.18 / 10.25 |
| focus ring, `theme="light"` / `"dark"` rail | #208497 on #fff / on #070e15 | #208497 / #84c7d4 | 4.37 / 4.37 · 4.44 / 10.25 |
| muted item (`--lc-sidenav-muted-fg` default) auto · light rail · dark rail | #5c6672 · #6b7280 · #93a4ad | #93a4ad | 5.58 / 7.53 · 4.83 · 7.53 |
| mark | the label's own ink | | unchanged: 7.23 / 12.53 (auto), current item 7.85 / 9.03 |
| waterfall label | text-secondary #4b5563 on #fff | #c4d2d9 on #0a121b | 7.56 / 12.17 |
| story petrol rail: ring `--color-on-primary` on fill-active / -hover / fill | #fff on #0d353d / #144f5b / #1a6a79 | same | 13.18 / 9.13 / 6.21 |
| story customizing rail: section `--color-text-secondary`, muted `--color-text-tertiary` on sidebar | | | 7.23 / 12.53 · 5.58 / 7.53 |

Forced colours: the mark keeps underline and weight (no fill to lose); the logo image is decorative in an `aria-hidden` tile (logos are exempt); the static brand needs no ring; the no-stepper field keeps its 1 px border.

## 6. Accessibility

- **Number input:** the field is the only tab stop; name, `aria-describedby` (unit, helper, error), `aria-invalid` unchanged; `inputmode="decimal"` from `step` 0.01.
- **Waterfall:** `role="img"` + default `aria-label` with full labels (U+00AD removed) unchanged; `<tspan>`s and `<title>`s are inside the image, so nothing is read twice; axe `svg-img-alt` passes.
- **Slot order:** brand → × (drawer) → slot controls → items → default slot → collapse button; in the drawer the slot is inside the `aria-modal` dialog.
- **Static brand:** no role, no `tabindex`, no `aria-label` (prohibited on a generic `div`); name and subtitle are text.
- **Deep groups:** the level-2 disclosure markup at every depth (`button[aria-expanded]`, no `aria-controls`, children container without role), as since 3.0. Depth is not announced: a `role="group"` + `aria-labelledby` container would change every sidenav's markup → backlog suggestion, not here.
- **Action:** name `action.ariaLabel` or „<label> action“ (unchanged); 44 × 44 hit; the app moves focus into its menu and back to `element`, and (r1) sets `aria-haspopup="menu"` / `aria-expanded` on `element` while the menu is open (*Deep Tree* shows it).
- **Label template / highlight:** the link's name stays its text content; `<mark>` is inline and adds no spaces (expected name „Rechnungseingang“, checked in the AX tree in review). `title` sits on the label span, so it adds no description to the link.
- **Escape:** §4; a row tooltip above the drawer takes the first Escape (WCAG 1.4.13).
- **Motion:** nothing new; chevrons as today. **Targets:** items 44, action hit 44, brand link 44.

## 7. Texts

No new built-in string (the „…“ is a symbol; the slot's texts are the app's). Every visible story string is German (§8; plus „Hauptnavigation“, „Navigation schließen“, „Wird geladen …“ through the existing label inputs).

## 8. Stories

| Story (export) | Expected ID | Args / content | Shows |
|---|---|---|---|
| `AmountWithoutSteppers` (name „Betrag ohne Schrittknöpfe“) | `form-number-input--amount-without-steppers` | `lang="de"`; label „Erklärter Betrag“, `locale="de-DE"`, `suffix="€"`, `suffixAriaLabel="Euro"`, `size="lg"`, `[showSteppers]="false"`, `valueType="string"`, value `"2960.00"`, `min 0`, `max 2960`, `step 0.01`, helper text; `--lc-number-input-value-width: calc(7ch + 0.5rem)` | AC-N2, N4 |
| `SizesWithoutSteppers` | `form-number-input--sizes-without-steppers` | xs/sm/md/lg, `[showSteppers]="false"`, value 12 | AC-N3 |
| `GermanCauseNames` | `charts-waterfall-chart--german-cause-names` | `width 564`, `height 250`; Periodi⟨SHY⟩sierung +6000, Verschie⟨SHY⟩bung +1200, Unge⟨SHY⟩plant +25200, Nicht eingetreten −2400, Preis +2960, Menge +1500, Einmalig +3000, Nicht erklärt +6370, Summe 43830 (total); `wrapLabels` control | AC-W1, W3, W5; at 360 the 9-bar case of AC-W4 |
| `FiveCauses` | `charts-waterfall-chart--five-causes` | fluid; Periodi⟨SHY⟩sierung, Nicht eingetreten, Preis, Nicht erklärt, Summe | AC-W4 |
| `TopSlot` | `navigation-sidenav--top-slot` | docked (drawer < 768, open), `lang="de"`, `brandName="USM X" brandSubtitle="Arbeitsbereich" brandRoute="/start"`; slot: `lc-select` „Bereich“ + `lc-search-input` „Navigation durchsuchen“ `[(value)]="query"` → `[highlight]="query"` (starts „rech“); items incl. „Rechnungseingangsprüfung Lieferantenstammdaten“; `--lc-sidenav-backdrop: color-mix(in srgb, var(--color-primary-fill-active) 60%, transparent)` | AC-S1, S2, S11 highlight + title, S8 backdrop |
| `BrandAndHooks` | `navigation-sidenav--brand-and-hooks` | two 280 px docked rails, `[mobileBreakpoint]="0"`. A „Kunde AG“: app-shell petrol recipe + `--lc-sidenav-focus-ring: var(--color-on-primary)`, `--lc-sidenav-icon-size: 18px`, `--lc-sidenav-brand-height: 48px`, `--lc-sidenav-brand-tile-bg: transparent`, `brandLogoSrc` (data-URI, coloured), `--lc-sidenav-brand-logo-filter: brightness(0) invert(1)`, `[brandLink]="false"`. B „USM X / Customizing“: `--lc-sidenav-section-fg: var(--color-text-secondary)`, `--lc-sidenav-muted-fg: var(--color-text-tertiary)`, muted areas, `lcSidenavLabel` template = code (`item.id`, tabular, section ink) + label | AC-S3, S4, S8, S10, S11 template |
| `DeepTree` | `navigation-sidenav--deep-tree` | docked, `width="280px"`, `[mobileBreakpoint]="0"`, `lang="de"`; Workflows › Eingangsrechnungen › Prüfung (action) › Freigabe › „Rechnungsfreigabe Kostenstelle 4711“ (current, action) + „Freigabe Sammelrechnung“; „Archiv“ (level 4, `hasChildren`, loads after 600 ms); „Ausgangsrechnungen“ (level 2 group) seeded open via `[(expandedGroups)]`; `(itemActionClick)` opens an `lc-menu` (Umbenennen, Verschieben, Löschen) in a `position: fixed` box at `element.getBoundingClientRect()`, `position="bottom-right"`, focus back to `element` on close; status line with the open ids and the last action | AC-S5, S6, S7 |
Each new input: argType with `description` and `table.defaultValue`; the docs table in `sidenav.stories.ts` lists the slot, hooks and outputs.

## 9. Verification

Baseline (main 77f89b5, 900 ms wait): PNGs in `tmp/story-shots/067/baseline` — sidenav 33 + header above-sidenav (204), number-input 14, waterfall 3, sidenav-placeholder 5 (132), at 360/1024/1280 L/D. DOM hashes in `baseline-dom.log` (`domN`, same 56 stories at 360/1280 light; the `dom` values in `baseline-a/b.log` depend on run order, ignore them): innerHTML of `#storybook-root` without comments, `_ngcontent/_nghost` attributes and ` routerlink="…"`, `127.0.0.1:<port>` → `HOST` (random per run), then every `-<digits>` → `-N` (instance counters) — the measure is `tmp/story-shots/067/dom-measure.js` (paste inline); the review adds `.replace(/<div class="lc-sidenav__top"><[/]div>/g, "")` first.

| AC | How | Expected |
|---|---|---|
| N1 | unit; compare the 14 number-input stories | PNG and DOM hash identical |
| N2 | unit: no `button`; typing, `de-DE`, `suffix`, blur clamp, `error` + `aria-describedby`, `helperText`, `invalid`, `disabled`, forms, ArrowUp/Down | as with steppers |
| N3 | `SizesWithoutSteppers` 360, control `getBoundingClientRect().height` | 26 / 34 / 42 / 46 (inner 24 / 32 / 40 / 44) |
| N4 | `AmountWithoutSteppers` 360/1280 L/D, `--axe`, focus, `--forced-colors` | input scroll 87 ≤ client 87; 0 violations; control border = primary-500 + halo on focus; FC border 1 px solid |
| W1 | unit, mock measure: fits, space, „-“, U+00AD, line 2 cut + title, single word cut + title, neighbour room | §3 rules |
| W2 | compare 3 waterfall stories; unit existing specs | PNG + DOM identical |
| W3 | `GermanCauseNames` 1024 (svg 564): lines; min gap between neighbour label boxes; svg height | Periodi-/sierung, Verschie-/bung, Unge-/plant, Nicht/eingetr… [title], Preis, Menge, Einmalig, Nicht/erklärt, Summe; gap ≥ 4 (proto 9.9); 264 |
| W4 | `GermanCauseNames` 360 (W 328) and `FiveCauses` 360; compat prerender | 9 bars: every line ≤ 25.8, gap ≥ 4, all cut with `<title>`; 5 bars (`FiveCauses`, W 328, proto): Periodi-/sierung, Nicht/eingetr… [title], Preis, Nicht/erklärt, Summe, gap ≥ 4 (proto 10.1), height 264; prerendered HTML has `<tspan` and `<title>Nicht eingetreten</title>`, no NG0500 |
| W5 | unit (`wrapLabels=false` = 3.46 markup); aria-label; axe; §5 | „Waterfall chart: Periodisierung +6000, …“ without U+00AD; 7.56 / 12.17 |
| S1 | unit (docked, drawer, empty → no box); `TopSlot` 360/1280 | slot top = brand bottom + 16, x = panel + 8, width 264 / 303; first item top = slot bottom + 16; collapsed: slot hidden |
| S2, S3 | unit | `href="/start"`; `brandLink=false` → no `a`, `div` without role, tabindex, aria-label |
| S4 | `BrandAndHooks`: img box, computed `filter`; unit default | 24 × 24 centred in the 32 tile; `brightness(0) invert(1)`; `none` |
| S5 | unit 5 levels (aria-expanded, loading, `expandRequested` per level, 3-level DOM); `DeepTree` 360 | item x 8/24/36/48/60 (+ frame); labels ≥ 120: level-5 leaf 159, leaf + action 131; sidenav compare DOM-identical |
| S6 | unit: seed, toggle emits, `items` update keeps a folded group, new current item re-opens, `expandedItems.set` emits | as §2 |
| S7 | unit: action at levels 3 and 5, both outputs once, `element` = button; `DeepTree` hit test `elementFromPoint` at centre ± 21 px | button hit on all four sides; menu panel opens under the button; (r1) focused or `aria-expanded="true"` action opacity 1 without hover, rest 0 |
| S8 | unit (computed defaults: outline color, `#00000080`, 20 px); §5 | defaults = 3.46 values; ring ≥ 3:1 (min 4.18) |
| S9 | unit: palette open above, `lc-modal` open above, menu open, tooltip shown, `defaultPrevented`, plain Escape, docked (no push) | only the plain case closes, with `defaultPrevented` true afterwards; the stack is empty after close and destroy |
| S10 | unit computed `min-height`; × top | default 56/56/64/80/112; hook 48 → 48, × top 2 |
| S11 | unit (marks, template context, title on/off via mocked widths); `TopSlot` 360: marks for „rech“, `title` after a `pointerenter` on the long label only | marks in every matching label; title = full label |
| S12 | `--axe` on every story of the three components; `--forced-colors`; Tab walk in `TopSlot` 360; compat `EXPECT_IN_HTML`: slot content, brand, an open group's child | 0 violations; order §6 |

**Risks (from earlier rounds):** projected slot children carry no `_ngcontent` — style only the wrapper (019); `:empty` fails on whitespace — keep the wrapper on one line; hooks read where used, never declared on `.lc-sidenav` (020); `--lc-icon-size` is not inherited — set it on the `lc-icon` host (063); hidden text on rail items kills the `title` name (064 r1) — marks and templates add none; measure prototype values only after layout settles (the 250 → 264 read).
