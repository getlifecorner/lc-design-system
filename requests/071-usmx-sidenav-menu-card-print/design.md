# Design 071: USM X sidenav, menu, card and badge gaps, toggle-group touch target, print rules, backlog rows

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-26
- **Measured on:** 3.49.1 (`07b834d`), Storybook rebuilt 2026-11-20; logs `tmp/story-shots/071/design/m1.log` (toggle-group, card), `m2.log` (contrast grid), `proto.log` (§3 prototypes)
- **Change note (review r1, 2026-11-20):** build.md deviations 1–6 accepted and written in (§2 `brandToggle`, `touchTarget`; §3 brand x 5.5; §4 cut-label events; §8 rail story; §9 AC-1/3/13). Added after measuring the build: the toggle column is reserved per inline menu part (§3, review F-1), print drops the nav column from 1024 px (§3, F-2), the rail menu's point sits 8 px beside the rail edge (§8, F-3).
- **Change note (review r2, 2026-11-20):** §3 Print as built: in the one-column print layout the nav wrapper isn't printed either, and the footer drops its nav inset (`padding-left: env(safe-area-inset-left, 0px)`). The rule repeats the full-height selector at the same weight, after the screen rules.

## 1. Approach

Extend only; every new input is optional. Patterns followed: `brandLink`/`brandLetter` (sidenav inputs that change the brand), `returnFocusTo` (sidenav 3.35, same name and contract on `lc-menu`), `NavigationItemActionEvent` (an event with the element to anchor a menu to), `lcSidenavLabel` (an `ng-template` directive), `lc-badge` pairs for any coloured badge, `--lc-<component>-<property>` hooks read where used, never declared on the host.

**Minimum scope for the big rows** (owner: one version, no split):

| Row | Built | Left out → backlog (reason) |
|---|---|---|
| 74 | `[sidenav-rail-top]` slot; `railItems` (data, kit look) + `railItemClick` with the element; `NavigationItem.hasPopup`; `brandToggle`; `brandLogoFit` (row 75) | 071-n1 a built-in group menu on the rail (needs a NavigationItem→MenuItem map and routing; the app opens `lc-menu` at a point beside the rail with this release's menu features). 071-n2 a projected brand-mark slot (`brandLogoSrc` takes an SVG data URI). 071-n5 a free rail template (`railItems` keeps the kit's rail look, names and current mark). |
| 77 | `inline` mode; control rows (`MenuItem.control` + `ng-template[lcMenuControl]`) between top-level entries, inline only | 071-n4 control rows in a popup (Tab closes a popup, so a control would be unreachable). 071-n3 menu positions beside an element (`right-start`): a point anchor covers it. |
| 78 | `current`, `busy`, sections nested to any depth, `badgeVariant` | — |

Decisions on defaults: AC-3 opt-in (`brandToggle`; tying it to `showCollapseToggle` would turn today's home-link brands into toggles). AC-4 opt-in (`brandLogoFit`, a wide logo would change look). AC-15 hook with the old 32 px default. AC-18 opt-in (`headerActionWrap`: an automatic wrap would move actions on today's phone cards, e.g. *With Header Action* at 360 has 154.7 px title / 107.3 px action). AC-14 input is named **`letters`, not `initials`**: the public computed `initials()` is pinned by `avatar.component.spec.ts` and `avatar.initials.spec.ts` (consumers read it). Bug-fix class (default changes, listed in the changelog): AC-5 tooltip text, AC-13 keys, AC-17 muted hover, AC-20 print, AC-24 gap, `menuAriaLabel` also names the split button's open panel. 068-n1: only the sortable head's reserve, arrow and ring become logical (`text-align: left` stays, 071-n6; `lc-table`'s own head stays byte-identical, pinned).

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| sidenav slot | `[sidenav-rail-top]` | — | — | Content on the collapsed rail only, between the brand and the items (e.g. the area picker as a 44 px icon button); centred, at most 44 px wide. Not shown expanded or as a drawer. |
| sidenav input | `railItems` | `NavigationItem[] \| null` | `null` | The collapsed rail draws these, by `displayOrder`, one icon each (`children`, `isSection`, `action` ignored), instead of `items`. Current: the first with `current`, else `route`/`matchRoutes` as for `items`. `null`: as before. |
| sidenav output | `railItemClick` | `NavigationRailItemEvent` (new type in `models/navigation-item.interface.ts`: `{ item; event: MouseEvent; element: HTMLElement }`) | — | A press on a `railItems` entry, with its link or button (anchor a menu beside the rail; pass it as the menu's `returnFocusTo`). `itemClicked` is still emitted. |
| model field | `NavigationItem.hasPopup` | `'menu' \| 'dialog'` | — | On a `kind: 'action'` item: `aria-haspopup`, and `aria-expanded` (`true` while `expandedActionId` is its id). |
| sidenav input | `brandToggle` | `boolean` | `false` | Docked: the brand is a `<button>` that collapses and expands the rail, whatever it shows (letter, icon, `brandLogoSrc`); name „{name[ subtitle]}, {expandAriaLabel or collapse label}“ from its content plus a hidden „, {action}“ (r1: keeps the visible text in the name, axe label-in-name); with `brandAriaLabel` an `aria-label` „{brandAriaLabel}, {action}“. Drawer mode: the brand stays as `brandLink` says. Works beside `showCollapseToggle`. |
| sidenav input | `brandLogoFit` | `SidenavBrandLogoFit` = `'tile' \| 'natural'` | `'tile'` | `natural`: `brandLogoSrc` at its own aspect ratio, `--lc-sidenav-brand-logo-height` high, no tile, at most the brand's width (contained); on the rail the tile with `brandIcon`/letter shows instead. `tile`: 24 px in the 32 px tile, as before. Hook `--lc-sidenav-brand-logo-height` (default `24px`). |
| menu input | `inline` | `boolean` | `false` | The menu in the page: the panel renders always (also prerendered), no trigger slot, no overlay, no border/shadow; `isOpen`, `position`, `anchor`, `maxHeight`, `minWidth`, `maxWidth`, `closeOnSelect` are ignored; Tab, Escape, outside clicks and scrolling never close it (nothing emits `closed`). `role="menu"`, roving tabindex and Arrow/Home/End stay. |
| field | `MenuItem.control` | `string` | — | Inline, top level only: the entry is a control row filled by the `lcMenuControl` template of that name, outside `role="menu"`; `label` is drawn before the control (`''`: the template fills the row). Ignored in a popup. New exported `MenuControlDirective` (`ng-template[lcMenuControl]`, input `lcMenuControl: string`), context `MenuControlContext = { $implicit: MenuItem; labelId: string }` (give the control `aria-labelledby="labelId"`). |
| field | `MenuItem.current` | `boolean` | — | `aria-current="true"`, a 3 px bar at the start and a semibold label. |
| field | `MenuItem.busy` | `boolean` | — | A 16 px spinner at the end (the badge's place; the badge hides), `aria-busy`, `aria-disabled`; activation ignored, still in the arrow order; `busyLabel` read after the label. |
| field | `MenuItem.badgeVariant` | `BadgeVariant` | — | The badge (`metadata.badge`) as `lc-badge size="xs" rounded` in that variant. Unset: today's span. |
| field | `MenuItem.attrs` | `Readonly<Record<string, string>>` | — | Attributes on the item element: `id` and `data-*` (lower case, `/^(id\|data-[a-z0-9][a-z0-9._-]*)$/`) only; any other name is dropped (dev mode: `console.warn` with the name). |
| field | `MenuItem.children` | doc change | — | A member with `children` is a section again, to any depth: a `role="group"` named by its heading, indented one step per level. |
| menu input | `busyLabel` | `string` | `'Loading'` | Hidden text after a busy item's label. German: „Wird geladen“. |
| menu input | `returnFocusTo` | `HTMLElement \| null` | `null` | Gets the focus when the menu closes from inside (Escape, Tab, an item), before the trigger, the anchor element and the element focused at open. Use it with a point `anchor` when nothing was focused (068-n3). `null`: as before. |
| menu hook | `--lc-menu-max-height` | length or `room` | unset | Read from the host when the menu opens; used as `maxHeight` when that input is empty (items scroll, header and footer stay). Reaches an `anchor` overlay too. |
| split-button input | `menuMaxHeight` | `string` | `''` | Passed to the menu's `maxHeight` (`'room'` included). `menuAriaLabel` now also names the open `role="menu"`. |
| card input | `headerActionWrap` | `boolean` | `false` | The head may wrap: when the title would get less than `--lc-card-header-title-min`, `[card-header-action]` takes a line of its own under the title at full width. Wide cards look as before. Hook `--lc-card-header-title-min` (default `12rem`). |
| badge class | `lc-badge__cut` | on one projected element | — | With `maxWidth`: only that run is cut with an ellipsis; the text before and after (end, count) stays. Whole text stays in `title`. Without `maxWidth`: no effect. |
| avatar input | `letters` | `string` | `''` | Shown instead of the name's initials, at most 3 characters (3 at 0.75 em), e.g. `'IN'`. The accessible name stays `alt` / `name`. |
| sortable-head hook | `--lc-sortable-head-unsorted-reserve` | length | `32px` (`--spacing-8`) | Arrow space of a sortable head while neither sorted nor busy; `var(--spacing-4)` reserves it only while sorted. |
| toggle-group input | `touchTarget` | `boolean` | `false` | Each option gets a hit area of at least 44 × 44 px: a transparent extension above and below (lg 2, md 5.5, sm 9 px; keep that clear), and options narrower than 44 px grow to 44 with the label centred (short `sm`/`md` labels; `lg` options measure ≥ 50.8). Height, padding, type and colours of `sm`/`md`/`lg` unchanged. |

Default rendering unchanged: every field and input is optional with a no-op default; `railItems` null, `brandToggle` false, `brandLogoFit` `tile`, `inline` false, `headerActionWrap` false, `touchTarget` false keep today's DOM; hooks fall back to today's values. Baseline `tmp/story-shots/071/baseline` (236 stories of the 12 touched components, 360/1280, L/D, `--full`) must compare identical except the image stories of `form-file-upload` (§8).

## 3. Anatomy and layout

### 360 px

```
Menu "Account Panel" (inline, md) in a 328 px panel      Card head, headerActionWrap, 390 viewport (card 358, head 308)
┌ header slot (app's identity block) ───────────┐        ┌─────────────────────────────────────┐
├ role=menu #1 (ariaLabel) ─────────────────────┤        │ Objekttypen [128]   line 1: 308, h 45.6│
│ ◉ ▣ Hell                    row 44, pad 12/16 │        │ [Suchen …  220 ]    line 2 at y 57.6 │
│ ○ ▣ Dunkel                                    │        │  row-gap 12, action box 308 wide     │
├ control row (no role) min-h 44, pad 12/16 ────┤        ├─────────────────────────────────────┤
│ Dichte        [Kompakt|Normal|Weit] gap 12    │        Today: title 72 px beside the 220 field.
│  (wraps under the label when narrower, gap 8) │
├ control row ──────────────────────────────────┤        Toggle group lg + touchTarget
│ Töne                              [switch]    │         ┌──────┬───────┬───────────┐ visible 40 (Storybook)
├ role=menu #2 ─────────────────────────────────┤         ┊ hit 44: ::before 2 px above/below (38 in app: 3)
│ ▍Profil (current: 3px bar, semibold)          │
│   Abmelden                                    │        Badge cut (maxWidth min(22rem, 100%))
└───────────────────────────────────────────────┘        [Aufnahme läuft in Änderungspaket Jahres… · 3 Objekte]
```

### From 1024 px (rail at 1280)

```
Rail (collapsed, docked, 56)          Expanded 280, brandLogoFit natural          Menu beside the rail (point anchor x 64)
x0 6     50 56                         ┌───────────────────────────────────┐       ┌ RailGroups (popup, md, 280) ──────┐
┌──┬──────┬──┐ y0                      │ [▬▬▬ 96×24 ▬▬▬] USM X             │       │ STAMMDATEN          heading L1    │
│  │ [X]  │  │ brand button 44×44 y10  │                 Customizing       │       │   Objekte           L2 (+16, 12/600)│
│  ├──────┤  │ 64 (logoSize md)        │ pad 6/8/6/4, gap 12, min-h 44      │       │ ▍ Objekttypen        current       │
│  │ [⌖]  │  │ rail-top: pad 8/6/0      ├ [sidenav-top] (full picker) ─────┤       │     Felder           L3 (+32)      │
│  │ [⌂]  │  │ rail items 40 at x8      │ items …                           │       │   Zähler      ◌ spinner (busy)    │
│  │ [▦]• │  │ (42 high, gap 2)         └───────────────────────────────────┘       │   Prüfungen   [12] badge warning  │
│  │ [»]  │  │ collapse row                                                         └───────────────────────────────────┘
└──┴──────┴──┘
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| `.lc-sidenav__rail-top` (collapsed only) | flex column, align centre, gap 8; pad 8 / 6 / 0; child max 44 wide | — | `--spacing-2`, `--spacing-1-5` |
| Brand toggle (button) | the brand link's box: min-h 44, pad 6/8/6/4, radius md; rail 44 × 44 at x 5.5 (centred in the 55 px inner rail; rail-top child and brand share this column) | name 16/600 | brand tokens, ring `--lc-sidenav-focus-ring` |
| `natural` logo | h 24 (hook), w auto (4:1 → 96), `flex: none`, `max-inline-size: 100%`, `object-fit: contain` | — | `--lc-sidenav-brand-logo-filter` still applies |
| Menu inline panel | position static, width 100 %, border 0, shadow none, radius 0, bg transparent, pad 0, no animation | items as `size` | — |
| Control row | flex, wrap, align centre, gap 12 (row-gap 8), min-h 44, pad 12/16 (sm 8/12, lg 16/20) | label 16/500 primary | `--lc-density-padding-*` |
| Inline parts (r1) | the toggle column (`--has-toggles`: md 48, sm 40, lg 56) is reserved per `role="menu"` part: a part without toggle items starts its labels at the item padding (md 16), on the control labels' line | — | — |
| Current item | `::before` 3 px at inline start, full height, radius 0 2 2 0; label 600 | — | `--color-surface-selected`, `--color-primary-500` |
| Busy item | `lc-spinner xs` at the end; cursor progress; no dimming | — | lc-spinner |
| Nested heading L2+ | +1 step per level (md 16, sm 12, lg 20) for heading and items; 12/600, no capitals, letter-spacing 0 | xs/600 | `--color-text-secondary` |
| Badge with variant | `lc-badge xs rounded`, 20 high (= old span) | 12/500 | badge pairs |
| Card wrap | head `flex-wrap: wrap; row-gap 12`; left `flex: 1000000 1 var(--lc-card-header-title-min, 12rem)`; action `flex: 1 1 auto; min-width: 0; max-width: 100%` | — | `--spacing-3` |
| Badge cut | label `:has(> .lc-badge__cut)` in truncate mode: `display: flex; column-gap: 0.3em` (a space: 4.2 px at 14 px; flex drops the runs' edge spaces), `min-width: 0`, own clip off; cut run `flex: 0 1 auto; min-width: 2em; overflow: hidden; text-overflow: ellipsis; padding-block: .2em; margin-block: -.2em`; text runs are anonymous items that can't shrink (`nowrap`) | — | — |
| Avatar `letters` 3 chars | `.lc-avatar__initials` font-size 0.75 em | — | — |
| Sortable head | reserve `padding-inline-end` (end-aligned: `-start`) = hook while unsorted, 32 px while sorted/busy; arrow and ring `inset-inline-end: 12px`, ring `border-inline-end-color: transparent` | — | `--spacing-8`, `--spacing-3` |
| Toggle `touchTarget` | group `overflow: visible`; first/last option radius `calc(var(--border-radius-md) - 1px)` on the outer corners; option `position: relative; min-inline-size: 44px`; `::before` `inset-block: min(0px, calc((100% - 44px) / 2))`, inline 0 | — | — |
| Print | `lc-header { display: none }`; shell `min-height: 0`, `--_clearance: var(--lc-app-shell-bottom-clearance, 0px)`, `background-image: var(--lc-app-shell-bg-image, none)`; r1: from 1024 px one column (`grid-template-columns: minmax(0, 1fr)`, areas header / body / end), so the hidden sidenav leaves no empty nav column (A4 landscape ≈ 1046 px) | — | — |

## 4. States

| Part | default · hover · focus-visible · active · disabled · loading · empty · error · overflow |
|---|---|
| Rail top / rail items / brand toggle | rail items: today's rail item states (hover fill, ring, current inset bar, badge dot > 2 chars, busy spinner); empty slot: `:empty`, no space; `railItems: []`: an empty rail nav. Brand toggle: hover fill `--lc-sidenav-hover-bg`, ring 2 px offset 2, name tooltip on the rail (`data-tooltip`), focus stays on the same button across collapse/expand. |
| Cut label (AC-5) | label cut (`truncatedLabel`, checked on `pointerover` **and `focus` in the capture phase**, r1: before the tooltip reads its text): row with kit tooltip → tooltip text „{label} · {tooltip}“; row without → `title` as before; not cut → unchanged. |
| Inline menu | items as popup items; no focus taken on render; first reachable item of each segment holds tabindex 0 until arrows move it; `loading` row after the last segment; `items: []` renders the header/footer only. |
| Current / busy / badge | current + hover: fill stays selected; busy + hover: hover fill, cursor progress, click ignored; disabled + current: disabled look wins, `aria-current` kept. Long German labels wrap (existing), badge never wraps. Nested: an empty section is a heading without group role (as level 1 today); depth 3+ keeps indenting. |
| Card wrap | wraps only when title share < 12rem; collapsible chevron follows the action on line 2 (documented). Print: header hidden, no end strip, no sky image; screen unchanged. |
| Badge cut | fits: no ellipsis (0.3 em gap instead of a space glyph, ±0.5 px); 40-char run: cut, end visible (proto: 16rem badge, run 28 px with „…“, „· 3 Objekte“ ends 8.9 px inside). |
| Toggle `touchTarget` | hover/active/focus unchanged; inset ring keeps the rounded outer corners. |
| Muted tab (AC-17) | hover: fill `--color-surface-hover`, ink stays `--color-text-tertiary`, weight 400; selected and focus unchanged. |

## 5. Theming

| Element | Light | Dark | Contrast (computed, `m2.log`) |
|---|---|---|---|
| Menu current label on `--color-surface-selected` over the panel | `--color-text-primary` | same | 15.25 L / 11.94 (surface) – 10.02 (surface-2) D |
| Current bar `--color-primary-500` vs selected fill | | | 3.76 L / 6.88 – 5.77 D (fill alone vs panel 1.16 L / 1.33 D: not relied on) |
| Menu badge variants (on-*-subtle on *-subtle over panel) | | | primary 8.49/7.64–6.35, success 4.85/6.25–5.17, warning 5.52/5.55–4.61, error 10.98/8.38–7.21, info 9.08/8.99–7.55, default 6.87/9.97–8.18 |
| Muted tab hover: tertiary on surface-hover over page | | | 5.30 L / 6.65 D (at rest 5.84 / 7.31) |
| Nested heading L2+ `--color-text-secondary` on panel; brand toggle ring (as the link) | | | 7.56 L / 9.26 D (3.43); ring 4.18 L / 10.25 D (067) |

No new tokens. Forced colours: current bar `background: Highlight; forced-color-adjust: none`; busy spinner keeps lc-spinner's GrayText/CanvasText (as sidenav); toggle `touchTarget` outline rule unchanged.

## 6. Accessibility

- **Semantics:** brand toggle `<button type="button">` (no `aria-expanded`, the name says what a press does, as the bottom button); rail items keep link/button semantics, `hasPopup` adds `aria-haspopup`/`aria-expanded`. Inline menu: each segment `role="menu"` (first carries `aria-label`; later segments are named by their first section group); control rows sit **outside** any `role="menu"` (axe `aria-required-children` fails on a radiogroup/switch/button inside a menu). Nested sections: `role="group"` + `aria-labelledby` per level (headings stay `aria-hidden`, a heading role is not allowed in a menu). `aria-current="true"` on a current item; busy: `aria-busy="true"` + `aria-disabled="true"` + hidden `busyLabel`.
- **Keyboard:** inline: Arrow/Home/End inside a segment (wrap), Enter/Space activate, Tab/Shift+Tab: segment → control row's own controls → next segment (one stop per segment), Escape not handled (the surrounding panel takes it). Every menu: Enter and Space are `preventDefault`ed + stopped and the item is activated once by `click()` (also links on Space, as today) (AC-13). Toggle group keys unchanged. Brand toggle Enter/Space native.
- **Focus:** `returnFocusTo` first (AC-23); brand toggle keeps focus across states.
- **Targets:** brand 44 × 44, rail-top child max 44 (app's control must be 44), rail items 40 × 42 as today, toggle `touchTarget` ≥ 44 × 44, control row min-h 44.
- **Reduced motion / forced colours / announcements:** no new animation (the inline panel drops `slideDown`); forced colours per §5; busy text via the name (no live region), the menu `loading` row unchanged.

## 7. Texts

| Key / input | EN default | DE |
|---|---|---|
| menu `busyLabel` | Loading | Wird geladen |
| brand toggle name (composed) | USM X, Collapse navigation to the left / USM X, Expand navigation | USM X, Navigation nach links einklappen / USM X, Navigation ausklappen (via `collapseAriaLabel`, `expandAriaLabel`) |
| file-upload story hint (AC-25) | Shown at the top of the side navigation and on invoices. | Erscheint oben in der Seitenleiste und auf Rechnungen. |

Story strings (DE): „Dichte“, „Kompakt / Normal / Weit“, „Töne“, „Tastenkürzel anzeigen“, „Objekttypen“, „Suchen …“, „Aufnahme läuft in Änderungspaket Jahresabschluss 2026 Nord · 3 Objekte“ (run 40 chars; EN „Recording in … · 3 objects“), toggle „Alle / Aktiv / Gekündigt“. At 360: `Dichte` + 3 options (~210 px) fit the 296 px row, longer labels wrap the control under the label.

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Collapsed Rail With Top Slot | `navigation-sidenav--collapsed-rail-with-top-slot` | docked, `collapsed`, `[sidenav-top]` + `[sidenav-rail-top]`, `railItems` (Übersicht, 3 groups, „Stammdaten“ `current: true` — r1: an action entry is current only by `current`, links by route — one badge), `hasPopup`; press opens RailGroups menu at a point 8 px beside the rail edge (r1: x = rail right + 8 = 64 from the rail's left, not item right + 8) with `returnFocusTo` | AC-1, AC-2, AC-23; 360 = drawer |
| Brand Toggle | `navigation-sidenav--brand-toggle` | `brandToggle`, `showCollapseToggle`, collapsed + expanded side by side, DE labels | AC-3 |
| Brand Logo Fit | `navigation-sidenav--brand-logo-fit` | 4:1 wordmark `natural`, 1:1 `natural`, 1:1 `tile`; light + dark rail; one collapsed | AC-4 |
| Cut Label With Tooltip | `navigation-sidenav--cut-label-with-tooltip` | width 240px, DE long labels, rows with `tooltip` and without | AC-5 |
| Inline | `navigation-menu--inline` | `inline`, EN, items + section + divider | AC-6 |
| Account Panel | `navigation-menu--account-panel` | `inline`, header, swatch radios, control rows (`lc-toggle-group touchTarget`, `lc-switch` ×2), DE | AC-7 |
| Current, Busy And Badges | `navigation-menu--current-busy-and-badges` | open popup, `current`, `busy`, `badgeVariant` × 6, `attrs` (docs line), DE | AC-8, AC-10, AC-12 |
| Nested Sections | `navigation-menu--nested-sections` | three levels, sm/md/lg side by side, DE | AC-9 |
| Menu Max Height | `components-split-button--menu-max-height` | `menuMaxHeight="room"` and one with `--lc-menu-max-height: 200px`, open; `menuAriaLabel` docs line | AC-11 |
| Square Letters | `data-display-avatar--square-letters` | square + circle, `letters` IN / CI / CRM, all sizes | AC-14 |
| Sortable Head Reserve And RTL | `data-display-table--sortable-head-reserve-and-rtl` | hook `var(--spacing-4)` vs default, sorted + busy heads; second table `dir="rtl"` busy | AC-15, AC-22 |
| Cut Run | `data-display-badge--cut-run` | `maxWidth="min(22rem, 100%)"`, `.lc-badge__cut`, EN + DE, dot | AC-16 |
| Muted Tabs | `navigation-tabs--muted-tabs` | muted + hint tabs, DE; docs: hover keeps the muted ink | AC-17 |
| Header Action Wrap | `components-card--header-action-wrap` | 220 px search, DE title + count badge, plain + collapsible, default card for comparison | AC-18 |
| Touch Target | `form-toggle-group--touch-target` | `touchTarget` lg + md, DE options | AC-19 |
| Print | `layout-app-shell--print` | today-phone shell with header and bottom nav; docs state the print rules | AC-20, AC-21 |

Baseline: `tmp/story-shots/071/baseline` = 944 shots (236 stories, logs `baseline-a.log`, `baseline-b.log`; ids are the 12 components' full lists), `--widths=360,1280 --themes=light,dark --full`. Expected to differ: `form-file-upload--image`, `--image-german`, `--image-rejected-german`, `--image-grounds-white-logo` (hint text) and `--image-backgrounds` (−8 px gap). Every other shot identical.

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1 | story 1280 L/D, measure `.lc-sidenav__rail-top > *` rect; spec: slot hidden expanded, no box without content | child x ≥ 5.5, right ≤ 49.5 (r1); expanded `display: none` |
| 2 | spec: `railItems` null → rail DOM as today; rail renders railItems only; `railItemClick` element; story | baseline identical; 4 rail icons, current mark on the group |
| 3 | spec click/Enter/Space toggles `collapsed`, one button, name; axe; measure | 44 × 44 at x 5.5 (rail, r1), ≥ 44 high expanded; focus kept |
| 4 | story L/D measure `img` width/height | natural 4:1 → 96 × 24 (4.0); 1:1 → 24 × 24; tile 24 in 32 |
| 5 | spec both row kinds (pointerenter and focusin) | tooltip „Label · tooltip“; plain row `title` = label |
| 6 | spec: inline renders closed, no `closed` on Escape/Tab/outside/scroll, arrows; axe | 0 axe violations; panel static, border 0 |
| 7 | story 360/1280, axe, Tab walk measure | Tab order seg1 → toggle → switch → seg2; no control inside `role=menu`; r1: „Profil“/„Abmelden“ labels on the „Dichte“ line (16 px from the panel) |
| 8 | spec `aria-current`, `aria-busy`, ignored click; contrast | bar 3.76 L / 5.77 D min; label 10.02 min |
| 9 | spec three levels, groups nested, one-level DOM unchanged | indent md 16/32/48 at L1/L2/L3 items; baseline identical |
| 10 | spec no variant = span; variant = lc-badge | lowest pair 4.61 (warning, dark over surface-2) |
| 11 | spec maxHeight passed incl. `room`, hook read on open; story | panel ≤ 200 px with hook; aria-label on `role=menu` |
| 12 | spec incl. rejected `onclick`, `class`, `style`, `aria-x`, `Data-X`, `href` | only `id`, `data-*` rendered |
| 13 | spec: form with menu, Enter/Space → `defaultPrevented`, no submit, one `itemClick` (r1: spec only, story-shots has no trusted keys) | 1 activation |
| 14 | spec `letters` wins, name unchanged; story measure | CRM fits every size (scrollWidth ≤ clientWidth) |
| 15 | spec hook default; story measure head widths | unsorted head −16 px with hook; sorted/busy keep 32 |
| 16 | story EN/DE (`maxWidth="min(22rem, 100%)"`) measure: last run's right ≤ badge right − padding; cut run scrollWidth > clientWidth; gaps; `title` whole | end „· 3 Objekte“ visible; gaps 0.3 em |
| 17 | `:hover` by rule cloning, computed colour; spec class | hover ink = tertiary; 5.30 L / 6.65 D |
| 18 | story 390/1280 DE measure head parts | 390: left 308, action 308 at y 57.6 (proto); 1280: left 314 / action 220 on one line = no wrap |
| 19 | story 360 measure `elementFromPoint` 1.5 px outside top/bottom; rects; axe; spec default classes | lg 40 + 2 × 2 = 44 high, widths unchanged (proto); sm 44 × 26 + 9 + 9 |
| 20 | print emulation by cloning `@media print` rules into a screen sheet (measure), 360/720/1280; hash compare | header 0 × 0, shell padding-bottom 0, bg-image none, min-height 0; r1: at 1024/1280 `.lc-app-shell__body` x 0, full width; screen identical |
| 21 | Print story docs + header/app-shell class JSDoc; `npm run test:tools` manifest | „print“ in both manifest entries |
| 22 | RTL story measure ring rect | ring inside the reserve (left 12 px from the inline end); LTR identical |
| 23 | spec: point anchor, nothing focused, Escape/Tab → `returnFocusTo` focused | activeElement = given element |
| 24 | measure image field height without rejection; `role=alert` present | gap 0 (−8 px), region in DOM |
| 25 | story text | hint names the logo's use, no limits |
| 26 | build.md: `npx playwright` WebKit present? | else row stays in BACKLOG.md |
| Prerender | rail-top wrapper, rail items and `headerActionWrap` are CSS states in server HTML; `EXPECT_IN_HTML` += `lc-sidenav__rail-top` only if the compat app renders a collapsed rail | holds before JS |
