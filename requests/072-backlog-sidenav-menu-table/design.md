# Design 072: Backlog bundle — sidenav rail menu, brand mark, rail template, tooltip description; menu side positions, popup control rows, part names; table RTL head

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-22
- **Measured on:** 3.50.0 (`f23fc56`), Storybook rebuilt 2026-11-20; logs `tmp/story-shots/072/design/m1.log` (rail, cut label, parts, popup contrast, table RTL prototype; script `m1.js`), `m2.log` (control rows at 360)

## 1. Approach

Extend only. Patterns: `lcSidenavLabel` / `lcMenuControl` (an `ng-template` directive with a typed context), `[sidenav-rail-top]` (a slot wrapper hidden by `:empty`), `returnFocusTo` + an element `anchor` (071), the 052 origin box (margins in a box, never CDK offsets with push), `lc-badge__cut` (a public class on app elements), `--lc-menu-max-height` (a hook read on open with `getComputedStyle`).

| Row | Decision |
|---|---|
| 071-n1 | Opt-in `railGroupMenu`. The sidenav renders one `lc-menu` (overlay) while the rail is docked and collapsed, anchored to a hidden box that spans the rail's border box at the item's height, so the panel starts 8 px outside the rail (071 r1 F-3: the item ends 9 px inside it). Side by geometry: rail centre in the left half → `right-start`, else `left-start`. |
| 071-n3 | **Physical** meaning, as the names say (also popover `left`/`right`, Floating UI): `right-start` opens on the right in LTR and RTL. `-start` = top edges aligned. In an overlay the kit converts to CDK `start`/`end` with CDK's `Directionality`, so an RTL document doesn't flip it. The four existing values stay as they are (AC-8). |
| 071-n4 | Opt-in `popupControls`: `menu.inline.spec.ts` pins „in a popup, control is ignored“ and AC-20 forbids editing it, so `control` alone keeps 3.50. With the opt-in the popup is split into parts exactly as inline. **Keyboard:** arrows stay inside a part (each part is a `role="menu"`), Tab / Shift+Tab walk the panel's stops (one per part, each control, header/footer controls); Tab on the last stop and Shift+Tab on the first close the menu as today's Tab does (focus back to `returnFocusTo` / trigger / anchor, then the browser moves on). A popup without control rows: unchanged. |
| 071-n7 | Part name field `MenuItem.partLabel` on the **first entry of a part** (the entry after a control row), plus a fallback text `partAriaLabel` derived from `ariaLabel`. |
| 071-n5 | Directive `ng-template[lcSidenavRail]`; it wins over `railItems`/`items` on the docked collapsed rail only; public class `lc-sidenav__rail-item` gives app buttons the rail look. |
| 071-n2 | Slot `[sidenav-brand-mark]` in a 32 × 32 box that takes the tile's place, `aria-hidden` (the brand link keeps its name). |
| 071-n8 | New tooltip input `tooltipDescription`: the described element points at a hidden element with that text; the visible text stays. Sidenav passes the tooltip text without the label. |
| 071-n6 | `lc-table`: RTL rules **appended after** `.lc-table__sr-only`, each `selector:where(:dir(rtl))` = the weight of the LTR rule it mirrors. The byte-identical pin hashes only the CSS before `.lc-table__sr-only`, so **it needs no edit** (AC-15's allowed edit is not used). LTR computed `text-align` stays `left` (`start` would compute to `start`, failing AC-15). Sortable head: `text-align: var(--_lc-sortable-head-align, left)` after the mixin, `:host(:dir(rtl))` sets the private var (keeps (0,1,0), so an app class on the `<th>` still wins). |
| 054-n2 | Check only (AC-19). |

Not in this design (known limits, docs lines): `railGroupMenu` for groups in `items` on the rail; menu entries are buttons (router navigation, no "open in new tab"); stack mode of `lc-table` (`--stack`, body cells, physical `right`/`float: left`) stays physical.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| sidenav input | `railGroupMenu` | `boolean` | `false` | 3.51 (071-n1): on the docked, collapsed rail a `railItems` entry with `children` (or `hasChildren`) is a menu button; a press, Enter, Space or the arrow towards the menu opens its children in an `lc-menu` beside the rail (8 px outside its edge, top aligned with the item, on the side away from the nearer viewport edge), named by the entry's label. Map: `label`, `icon`, `disabled`/`disabledReason`, `tooltip`, `busy`, `hint` (subtitle), `badge` (value, variant), current (`current` or the current `route`/`matchRoutes`), nested groups and sections as sections. A link child navigates with the router and emits `itemClicked`; an action child emits `itemClicked`. Escape closes; the focus returns to the rail item. `railItemClick` is still emitted (drop your own menu). Not with `lcSidenavRail`. `false`: as before. |
| sidenav hook | `--lc-sidenav-rail-menu-max-width` | length | `20rem` | Read from the sidenav when a group menu opens; the menu's `maxWidth`. |
| sidenav slot | `[sidenav-brand-mark]` | — | — | 3.51 (071-n2): the app's mark instead of the tile (`brandLogoSrc`, `brandIcon`, letter, `natural` logo) in every state, centred in 32 × 32 px; decorative (`aria-hidden` wrapper): the brand keeps `brandName` / `brandAriaLabel` as its name. Nothing projected: as before. |
| sidenav directive | `SidenavRailDirective` | `ng-template[lcSidenavRail]` | — | 3.51 (071-n5): draws the docked, collapsed rail's navigation instead of `railItems`/`items`, inside the rail's `<nav>` (same name). Brand, `[sidenav-rail-top]` and the collapse button stay; expanded and drawer: `items` as before. |
| type | `SidenavRailContext` | `{ $implicit: readonly NavigationItem[]; current: NavigationItem \| null; railWidth: number }` | — | The entries the rail would draw (`railItems`, else `items`, by `displayOrder`), the rail's current entry (rail rules; for `items` the current link at any depth), the rail width in px (host's `--lc-sidenav-rail-width`, 56 on the server). |
| sidenav class | `lc-sidenav__rail-item` | on an app link/button in the template | — | 44 × 44, centred content, rail ink, hover fill, focus ring, current look on `aria-current="page"\|"true"`, the rail tooltip from `data-tooltip`. Kit rules weigh (0,1,0) + state, so any app class wins. |
| menu type | `MenuPosition` | `'bottom-left' \| 'bottom-right' \| 'top-left' \| 'top-right' \| 'right-start' \| 'left-start'` | — | Exported; `position` takes it. |
| menu input | `position` | `MenuPosition` | `'bottom-right'` | JSDoc adds: 3.51 (071-n3) `right-start`/`left-start`: beside the anchor or trigger, 8 px apart, top edges aligned, physical in LTR and RTL; with `anchor` it flips to the other side and shifts inside the 8 px viewport margin (at the projected trigger no flip, as the other values). `maxHeight="room"`: the viewport less 32 px, never flips the side. |
| menu input | `popupControls` | `boolean` | `false` | 3.51 (071-n4): a popup menu draws `control` entries as control rows (as `inline`), split into `role="menu"` parts; Tab walks parts and controls, Tab past the last stop closes. Clicks in a control keep it open. Inline: ignored. `false`: a `control` entry is a plain item in a popup, as before. |
| field | `MenuItem.partLabel` | `string` | — | 3.51 (071-n7): on the first top-level entry of a `role="menu"` part (after a control row): the part's name. The first part keeps `ariaLabel` when set. Elsewhere ignored. |
| menu input | `partAriaLabel` | `string` | `'{label}, part {n}'` | Name of a later part without `partLabel` and not starting with a section, while `ariaLabel` is set: `{label}` = `ariaLabel`, `{n}` = the part's number (2, 3 …). German „{label}, Teil {n}“. `''`: unnamed, as 3.50. |
| tooltip input | `tooltipDescription` | `string` | `''` | 3.51 (071-n8): the described element's accessible description while the tooltip shows, instead of the visible text (when the visible text repeats the element's name). `''`: the visible text, as before. |

Default rendering unchanged: every input defaults to a no-op; `railGroupMenu` false renders no menu host and no anchor box; no `lcSidenavRail` template → rail as 3.50; `popupControls` false → popup as 3.50 (pinned spec holds); `tooltipDescription` '' → `aria-describedby` = tooltip id (pinned). Two deliberate non-visual changes (changelog *Changed*): the empty `<span class="lc-sidenav__brand-mark" aria-hidden="true">` (`display: none` by `:empty`) in every text brand; the fallback name of later parts in menus with control rows and `ariaLabel` (no spec pins it: `menu.inline.spec` names part 2 by its heading, which stays). Baseline `tmp/story-shots/072/baseline` (140 stories, §8) must compare identical except `data-display-table--sortable-head-reserve-and-rtl`.

## 3. Anatomy and layout

### 360 px

```
Popup control rows (popupControls, minWidth 280, maxWidth min(20rem,100vw-2rem))   Table RTL (dir=rtl, md), scrolls in its wrapper
┌ trigger [Ansicht ▾]                                                             ┌──────────────────────────────── 328 ┐
├ panel 8 below, ≤ 320 wide, pad 8/0 ───────────────┐                             │ ‹… ‹‹ scroll start at the RIGHT     │
│ ◉ ▣ Hell              part 1 (Darstellung) 44     │                             │  عمليات | المبلغ ↑ | الحالة | الاسم │
│ ○ ▣ Dunkel                                        │                             │  left     16 · label · 32  16·lbl·16 │
├ control: Dichte   [Kompakt|Normal|Weit] 172×28    │  row 52, pad 12/16          │  head text right; reserve + arrow   │
├ control: Töne                         [switch]48  │  row 48                     │  at the inline END (left); end cols │
├ part 2 „Konto“ (partLabel) ───────────────────────┤                             │  and actions --end go LEFT          │
│ ▍Profil  (current)          44                    │                             └─────────────────────────────────────┘
│   Abmelden                  44                    │
└───────────────────────────────────────────────────┘   Rails at 360 = the open drawer: `items`, template and group menu unused.
```

### From 1024 px (1280 identical: the rail is fixed)

```
Rail Group Menu (rail 17…73, border 1 px at 72…73)          Rail template                     Side positions (anchor element)
x 17  22.5 25   64 73  81                                     x 17 22.5        73                 [Anker]┐8┌──────────┐  right-start
┌─────┬──────┬────┐  ┌ lc-menu md, 220…320 (hook) ───┐       ┌─────┬──────┬────┐                       └──┤ panel    │  tops equal
│brand│ 44   │    │  │ OBJEKTE        heading L1      │       │brand│ 44   │    │ brand x 22.5          │          │
│ rail-top 44   │  │ ▍Objekttypen   current         │       │ [EM] 44×44 │    │ template nav:     ┌───┴───┐8[Anker]   left-start
│ [⌂] 39×44 y177│  │   Felder                       │       │ [FB] 44×44 │    │ pad 8/6, gap 2,   │ panel │
│ [▤]•  y223 ───┼8─│ Zähler          ◌ busy         │       │ [+ ] 44×44 │    │ centred: x 22.5   └───────┘
│ [✓]   y269    │  │ Prüfungen      [12] warning    │       │collapse 44 │    │                     right-start at the right edge
│ [⚙]   y315    │  │ Archiv (disabled, reason)      │       └─────┴──────┴────┘                     → flips to the left side
└─────┴──────┴────┘  └────────────────────────────────┘
anchor box = rail border box (x 17, w 56) × item (y 223, h 44) → panel x 81, y 223
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Rail group button | the rail item box as today (39 × 44 at x 25, pitch 46); `aria-expanded="true"` keeps the current/hover fill and hides the label tooltip (`::after` off) | — | rail tokens |
| Anchor box `.lc-sidenav__rail-anchor` | `position: absolute` in the aside (its identity `transform` makes it the containing block), `left: -clientLeft`, `width: offsetWidth` (56), `top`/`height` = the item's (set on open, before `isOpen`); `visibility: hidden; pointer-events: none`; rendered with the menu host, so the menu's `anchor` is an element before it opens | — | — |
| Menu host `.lc-sidenav__rail-menu` | only while `railGroupMenu` and the docked collapsed rail (rendered closed first: a menu born open takes no focus); absolute, 0 × 0, so the empty trigger slot makes no line box (071 pitfall) | — | — |
| Side panel (overlay) | `margin-block: 0; margin-inline: var(--spacing-2)` (both sides: a flipped panel keeps 8 px; never CDK offsets); max-height `calc(100dvh - 32px)` | — | `--spacing-2` |
| Side panel (projected trigger) | `right-start`: `top: 0; left: calc(100% + var(--spacing-2))`; `left-start`: `top: 0; right: calc(100% + var(--spacing-2))` | — | — |
| Popup body `.lc-menu__body` | segmented popup only: wraps parts and rows; in a `--scroll` panel it is the scroller (`flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain`), the `list` that room and reveal read | — | — |
| Popup parts / rows | as inline: toggle slot per part (`lc-menu__items--has-toggles`, no panel-wide `--has-toggles`), control row min-h 44, pad 12/16 (sm 8/12, lg 16/20), gap 12 / row-gap 8 | label 16/500 | as 3.50 |
| Brand mark `.lc-sidenav__brand-mark` | before the tile; `display: grid; place-items: center; flex: none; inline-size: 32px; block-size: 32px`; child `display: block; max-inline-size: 100%; max-block-size: 100%`; `:empty` → `display: none`; `:not(:empty) ~ .lc-sidenav__brand-tile, :not(:empty) ~ .lc-sidenav__brand-logo` → `display: none`. Rail: 44 × 44 brand, mark box at the tile's place (rail x + 11.5; 28.5 in the rail story) | — | — |
| Rail template nav `.lc-sidenav__nav--rail-template` | column, `align-items: center`, gap 2, pad 8 / `--spacing-1-5` (6): 44 px children at x 5.5 in the rail (22.5 in the story) = brand, rail-top, collapse column | — | `--spacing-1-5` |
| `lc-sidenav__rail-item` | `inline-flex`, centre, 44 × 44, pad 0, border 0, radius md, bg none, colour `--lc-sidenav-fg`; hover `--lc-sidenav-hover-bg` + fg-active; focus 2 px ring offset 2; current: active bg/fg + inset 2 px bar (as `.lc-sidenav__nav-item--active`); tooltip `::after` as the rail item's (only with `[data-tooltip]`). *(Change r1, D-2: also `position: relative`, `font: inherit`, `text-decoration: none`, `cursor: pointer`; unscoped, the ring shares the item ring's rule.)* | — | sidenav hooks |
| Table RTL (appended) | `th:where(:dir(rtl))` right; sortable pad-right = size pad (12/16/20), pad-left 32; arrow `right: auto; left: 12px`; actions `--start` right, `--end` left (th + td) | — | as LTR |

## 4. States

| Part | default · hover · focus-visible · active · disabled · loading · empty · error · overflow |
|---|---|
| Rail group | rest/hover/ring/current as rail items; open: `aria-expanded="true"`, tooltip hidden; disabled/busy entry: no menu (blocked, as today); `hasChildren` without children: press emits `expandRequested`, menu opens with `loading` (`childrenLoadingLabel`) and takes the focus when children arrive (3.48); empty `children: []`: plain entry (no menu); a nested `hasChildren` group: heading only (docs). Re-render while open: `returnFocusTo` is bound to the live element (view query by id). |
| Group menu | items as `lc-menu` (current bar, busy spinner, reason tooltip, badge variants); long German labels wrap at spaces inside `maxWidth` (20rem) *(change r1: one word wider than the label room is clipped, an lc-menu limit, review F-3)*; many items: scroll inside 100dvh − 32, CDK shifts the panel up. Light page + `theme="dark"` rail: the panel follows the page theme (menu limit). |
| Side positions | no room on the preferred side → other side; taller than the viewport below the anchor → shifted up inside the margin. *(Change r1, O-1: CDK's fit test reserves both 8 px margins, so a panel with less than 16 px to spare is shifted and may touch or cover its anchor, as at 360 px; known limit, review F-1.)* |
| Popup control rows | Tab walk; a click in a control: stays open; Escape: closes, focus to the trigger; `closeOnSelect` items close as before; `loading` row after the body; long label wraps the control under it (row-gap 8). |
| Part names | First part: `ariaLabel` > its `partLabel` (after a leading control row) > none. Later parts: `partLabel` > section heading (3.50) > `partAriaLabel` fallback > none. *(Change r1, D-1: the old chain put `partLabel` first everywhere and contradicted §2; §2 is right, the menu's name must not vanish.)* |
| Brand mark | hover/ring/toggle/tooltip of the brand unchanged; nothing projected: tile (pixel-identical); a wide mark is contained in 32 × 32. |
| Rail template | app content; the class gives hover/ring/current; empty template: an empty nav. |
| Cut label | cut: tooltip shows „{label} · {tooltip}“, description = tooltip text; not cut / rail: as before. |
| Table RTL | sorted/hover/ring as LTR; busy ring of the sortable head already logical (071). |

## 5. Theming

| Element | Light | Dark | Contrast (computed, `m1.log`) |
|---|---|---|---|
| Popup control label / items `--color-text-primary` on the panel gradient (surface → surface-2) | `--color-text-primary` | same | 17.74 / 16.98 L · 15.85 / 13.16 D |
| Subtitle (`hint`) `--color-text-secondary` | | | 7.56 / 7.23 L · 11.16 / 9.26 D |
| Item focus ring `--color-primary-500` vs panel | | | 4.37 / 4.18 L · 9.13 / 7.58 D |
| Rail group button, `lc-sidenav__rail-item` | rail item tokens | | unchanged: ring 4.18 L / 10.25 D (071 r1), current/badge grids 051 |
| Brand mark | app's colours | | a logo is exempt (1.4.3/1.4.11 logotype); docs: use `currentColor` so it follows the rail ink |

No new tokens. Forced colours: rail group/template current `outline: 1px solid Highlight` (as rail items); side/popup panels keep the panel border; control rows add nothing.

## 6. Accessibility

- **Semantics:** group entry `<button type="button" aria-haspopup="menu" aria-expanded>`; `aria-current="page"` when `current: true`, `"true"` when a descendant is the current link; the menu `role="menu"` named by the group label; its current child `aria-current="true"` (MenuItem). Brand mark wrapper `aria-hidden="true"`. Template inside the rail `<nav aria-label>`. Tooltip description: `aria-describedby` → `<span id="{tooltipId}-description" hidden>` inside the tooltip (a directly referenced hidden node is read; its `textContent` = the description).
- **Keyboard:** rail group Enter/Space/ArrowRight (ArrowLeft when the menu opens left) open and focus the first enabled child; in the menu Arrow/Home/End, Enter/Space, Escape → rail item, Tab → rail item then on. Popup control rows: §1. Control keys stay the control's.
- **Focus:** open → first stop of the first part (a control row first: its first tabbable control); close from inside → `returnFocusTo` chain; a focused control in a scrolling body is revealed like an item (no page scroll: a scroll closes an overlay menu).
- **Targets:** rail group 39 × 44 (as rail items), template items 44 × 44, control rows ≥ 44 (48/52 measured), brand 44 × 44.
- **Reduced motion / announcements:** no new animation; `aria-expanded` announces the open state; busy and loading as `lc-menu`.

## 7. Texts

| Key / input | EN default | DE |
|---|---|---|
| menu `partAriaLabel` | {label}, part {n} | {label}, Teil {n} |
| group menu busy / loading | sidenav `busyLabel` / `childrenLoadingLabel` (passed through) | Wird geladen / Wird geladen … |

Story strings (DE): „Bereiche“, „Übersicht“, „Stammdaten“, „Objekte“, „Objekttypen“, „Felder“, „Zähler“, „Prüfungen“, „Archiv“ (reason „Kein Recht für diesen Bereich“), „System“, „Ansicht“, „Dichte“, „Kompakt / Normal / Weit“, „Töne“, „Konto“, „Profil“, „Abmelden“, „Fett (Strg+B)“ / „Strg+B“. At 360 the popup (≤ 320) holds „Dichte“ + the 172 px toggle group on one line (content 288).

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Rail Group Menu | `navigation-sidenav--rail-group-menu` | docked, `collapsed`, `railGroupMenu`, `railItems` (Übersicht link; Stammdaten group: Objekte › Objekttypen current via `activeRoute`, Felder; Zähler busy; Prüfungen badge 12 warning; Archiv disabled + reason; Prüfungen group; System), DE | AC-1–4; 360 = drawer |
| Rail Group Menu RTL | `navigation-sidenav--rail-group-menu-rtl` | `dir="rtl"`, EN labels, rail at the right | AC-4 (panel left of the rail) |
| Brand Mark Slot | `navigation-sidenav--brand-mark-slot` | inline SVG (`currentColor`) in `[sidenav-brand-mark]`: expanded light, expanded dark, collapsed + `brandToggle`, `brandLogoSrc` also set (mark wins) | AC-5, AC-6 |
| Rail Template | `navigation-sidenav--rail-template` | `ng-template lcSidenavRail` with 3 `lc-sidenav__rail-item` (initials, one `aria-current`, `data-tooltip`), status line „Schienenbreite: {railWidth} px“, `railItems` also set (template wins) | AC-12, AC-13 |
| Side Positions | `navigation-menu--side-positions` | three open overlay menus at anchor buttons: `right-start`, `left-start`, `right-start` at the right edge (flips) | AC-7 |
| Popup Control Rows | `navigation-menu--popup-control-rows` | open popup, `popupControls`, radios, Dichte (toggle-group sm `touchTarget`), Töne (switch), part 2 `partLabel: 'Konto'`, `minWidth="280px"`, DE | AC-9–11 |
| Part Names | `navigation-menu--part-names` | inline, `ariaLabel="Account"`, no `partLabel` (fallback „Account, part 2“) beside a DE copy with `partAriaLabel="{label}, Teil {n}"` | AC-16, AC-22 |
| Account Panel (changed) | `navigation-menu--account-panel` | + `partLabel: 'Konto'` on „Profil“ (no pixel change) | AC-16 |
| RTL Head | `data-display-table--rtl-head` | `dir="rtl"`: lc-table md (sorted asc column, sortable end column, actions `end`) + a `th[lcSortableHead]` table | AC-14 |
| Description | `feedback-tooltip--description` | icon button „Fett“, `lcTooltip="Fett (Strg+B)"`, `tooltipDescription="Strg+B"` | AC-18 (pattern) |

Baseline: `tmp/story-shots/072/baseline` = 560 shots (140 stories: sidenav 40, menu 19, table 34, tooltip 9, split-button 7, header 31; logs `baseline-a.log`, `baseline-b.log`), `--widths=360,1280 --themes=light,dark --full`. Expected to differ: `data-display-table--sortable-head-reserve-and-rtl` (RTL heads move right). All others identical. *(Change r1, D-3: shoot `rail-group-menu` and `rail-group-menu-rtl` without `--full`; the full-page capture scrolls and closes the open menu.)*

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1 | spec: opt-in group → button + menu; off → rail DOM and `railItemClick` as 3.50. Story 1024/1280 measure `panel.left − aside.right`, `panel.top − item.top` | 8 (panel x 81), 0 |
| 2 | spec: map fields; click/Enter on a link child → `Router.navigateByUrl(route)` + `itemClicked`; nested → sections | all listed fields kept |
| 3 | spec keys; Escape focus after `railItems` replaced while open; `aria-haspopup`/`aria-expanded`; menu `aria-label` | activeElement = live rail item |
| 4 | stories 1024/1280 L/D, EN/DE: panel ≤ 320, every label `scrollWidth ≤ clientWidth`; RTL `aside.left − panel.right`; `--forced-colors` border | 8; no clipped label |
| 5 | spec: mark replaces tile; empty/unset → tile, brand DOM else equal; mark kept after docked → drawer → docked (the `ng-content` sits in the re-created `brandContent` template); story 360/1024 measure | brand 44 × 44, mark box 32 × 32 at rail x + 11.5 (= tile) |
| 6 | spec: link name = `brandName`(+action), wrapper `aria-hidden`; compat/prerender: mark in server HTML | name unchanged |
| 7 | spec: position lists LTR and RTL `Directionality`; story 1024 measure | gap 8, tops equal, flip at the edge, ≥ 8 inside |
| 8 | spec: RTL `Directionality` → `right-start` still right; four old lists unchanged | — |
| 9 | spec: Tab walk order, arrows per part, Tab past last closes; story keyboard walk (Tab emulation) | parts → toggle → switch → part 2 → closed |
| 10 | spec: Escape → trigger; click in control → no `closed`; no warning; inline specs untouched | — |
| 11 | story 360/1280 L/D EN/DE measure rows, AX names | rows ≥ 44, controls named by labels |
| 12 | spec: template wins, `railItems` data in context, expanded/drawer unchanged | — |
| 13 | story 360 (drawer: items) / 1024: rail width, item rects, Tab order, axe | rail 56; items 44 × 44 at x 22.5 |
| 14 | spec: compiled CSS has the appended `:where(:dir(rtl))` rules; story 360/1280 measure computed text-align/padding (prototype `m1.log`) | th right; sortable 32 left / 12·16·20 right; `--end`, actions-end left |
| 15 | existing pin unchanged; LTR computed per size (`m1.log`: compact/default/large/number/actions) | `left`, pads as 3.50; sortable-head `left` |
| 16 | spec: every `role="menu"` named (partLabel, fallback); Account Panel AX | „Darstellung“, „Konto“ |
| 17 | spec: single part, no `ariaLabel` → no `aria-label`/`labelledby` | as 3.50 |
| 18 | spec: focus cut row → `getElementById(aria-describedby).textContent` | „Wird im Rich Client bearbeitet“ (3.50: whole „{label} · …“) |
| 19 | build.md: WebKit present? else backlog note „still open after 072“ | — |
| 20–22 | full suite, compat 21/22, lint, manifest, baseline compare, DE story strings | §8 diff list only |
