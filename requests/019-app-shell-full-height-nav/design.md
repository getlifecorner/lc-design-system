# Design 019: App shell full-height nav, sidenav text brand, shell background, stat-trend sentiment

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-22

## 1. Approach

Extend three components, add no new component and no new token.

- **G1 `lc-app-shell`:** a new input switches a modifier class. Every rule for it sits inside the existing `@media (min-width: 1024px)` block, so the layout is CSS only (AC-8) and below 1024 px it is identical to today (AC-3). **The DOM order is unchanged** (header → nav → body → horizon → footer → bar). It follows the `--horizon` modifier pattern.
- **G2 `lc-sidenav`:** the text brand reuses the `lc-sidenav__logo` block box (`logoSize` heights 56/64/80/112 = `lc-header` sizes), so it lines up with the header the way the image logo does. The link follows `lc-header` exactly: a plain `<a href>` from `brandHref`, else `routerLink="/"` (the sidenav already depends on Router). **The brand never toggles.** Collapsing gets its own opt-in button at the bottom of the rail, on the icon column. That keeps every nav icon at the same x and y in both states.
- **Theme-hook fix (prerequisite for AC-7):** `theme="dark"`/`"light"` writes literal `--lc-sidenav-*` values on the *inner* `.lc-sidenav`. That overrides anything the app sets on the host, so `theme="dark"` plus hooks is impossible today (measured: a host `--lc-sidenav-bg: red` leaves the rail at #070e15). The same bug leaves the badge ring in the auto colour (#f9fafb on the dark rail, #070e15 on the light one). Fix: move the literals to private host variables (see §5). Record it as **Fixed**.
- **G3:** docs and a story only. The CSS already reads `--lc-app-shell-bg` and `--lc-app-shell-bg-image` on `.lc-app-shell` with no `:host` declaration, so they can be set on `lc-app-shell` or any ancestor.
- **G4 `lc-stat-trend`:** `sentiment` overrides only the colour class and the default sparkline colour. A hidden text names direction and sentiment. **Fix in the same release:** the default `--up` text measures 2.33:1 in light and `--down` 1.98:1 in dark. Both join the sentiment colours (§5) and become AA. Class derivation is unchanged (AC-17).

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (shell) | `navPlacement` | `AppShellNavPlacement` | `'below-header'` | Where the side navigation sits from 1024 px. `'below-header'`: the header spans the full width and the nav starts below it. `'full-height'`: the nav runs from the top to the bottom of the viewport, with the header beside it. Below 1024 px both render the same. |
| type | `AppShellNavPlacement` | `'below-header' \| 'full-height'` | — | exported from `app-shell/index.ts` |
| CSS hook (shell, now documented) | `--lc-app-shell-bg` | color | `var(--color-background)` | Page colour behind everything (the "sky"). Set it on `lc-app-shell` or higher. |
| CSS hook (shell, now documented) | `--lc-app-shell-bg-image` | image | `var(--app-background-image, none)` | Layer over the page colour, e.g. `linear-gradient(to bottom, var(--color-land-1), var(--color-land-2), var(--color-land-3))`. The horizon's land still paints over it. |
| input (sidenav) | `brandName` | `string` | `''` | Product name shown as a text brand at the top: an icon tile and the name, one link to home. Replaces the image logo (`showLogo`). Empty: no text brand. |
| input (sidenav) | `brandIcon` | `string` | `''` | `lc-icon` name in the brand tile. Empty: the tile shows the name's first letter. |
| input (sidenav) | `brandHref` | `string` | `''` | Plain URL of the brand link (a native `<a href>`, no router). Empty: `routerLink="/"`. |
| input (sidenav) | `brandAriaLabel` | `string` | `''` | Accessible name of the brand link. Empty: the brand name. Start it with the visible name, e.g. `'Finance Intelligence – home'`. |
| input (sidenav) | `showCollapseToggle` | `boolean` | `false` | Docked mode: a button at the bottom of the rail collapses and expands it. Independent of the brand. With `showLogo` the image logo toggles already, so use one of the two. |
| input (sidenav) | `expandAriaLabel` | `string` | `'Expand navigation'` | Accessible name of that button while the rail is collapsed. Expanded, it uses `collapseAriaLabel`. |
| CSS hook (sidenav) | `--lc-sidenav-brand-tile-bg` | color | `var(--color-primary-fill)` | Brand tile fill. Theme-stable, read where used, so it can be set on any ancestor. |
| CSS hook (sidenav) | `--lc-sidenav-brand-tile-fg` | color | `var(--color-on-primary)` | Icon or letter colour in the tile. |
| CSS hook (sidenav) | `--lc-sidenav-active-indicator` | color | `var(--color-primary-500)` | The 2 px bar on the active item (until now hard-coded). Needed when `--lc-sidenav-active-bg` is close to `--color-primary-500`. |
| input (stat-trend) | `sentiment` | `StatTrendSentiment \| undefined` | `undefined` | Whether the change is good or bad, independent of its direction (a rise in costs is negative). Colours the change and the default sparkline; the arrow keeps the direction. Unset: derived from the direction. |
| input (stat-trend) | `labels` | `Partial<StatTrendLabels>` | `{}` | Words of the screen-reader text added to the change when `sentiment` is set (§7). Follows `lc-calendar`'s `labels`. |
| type | `StatTrendSentiment` | `'positive' \| 'negative' \| 'neutral'` | — | exported |
| type | `StatTrendLabels` | `{ up; down; unchanged; positive; negative; neutral: string }` | — | exported |

**Default rendering unchanged:**
- **Shell:** the class `lc-app-shell--nav-full-height` is added only for `'full-height'`.
- **Sidenav:** the brand block renders only when `brandName` is non-empty (`brandIcon` alone renders nothing, so a link can never be nameless). The bottom row renders only with `showCollapseToggle`. The new hooks are read with today's values as fallbacks.
- **Stat-trend:** with `sentiment` unset, the classes, text and sparkline are as today, and no hidden span is rendered.
- **Expected hash diffs, both intended fixes:**
  - The theme-hook fix: `navigation-sidenav--collapsed-rail-badges` (light and dark), `--collapsed-with-groups` (light) and `--sidebar-first-collapsed` (light). This list was measured, not guessed.
  - The stat-trend contrast fix: the 7 stories with an up or down pill. That is every stat-trend story except `--neutral` and `--value-only`.

## 3. Anatomy and layout

### 360 px

```
lc-app-shell full-height = below-header (nav display:none)   lc-sidenav drawer, text brand (width 320)
┌──────────────── 360 ────────────────┐                      x0 8 12   44 56                  254 262 266   310 320
│ skip link (off-screen until focus)  │                      ┌─┬─┬──────┬──┬─────────────────────┬──┬────┬─────┬───┐
│ lc-header md 64: "Übersicht" … (A)  │                      │8│4│tile32│12│name 198, ≤2 lines   │8 │ 4  │✕ 44 │10 │ 64
├─────────────────────────────────────┤                      └─┴─┴──────┴──┴─────────────────────┴──┴────┴─────┴───┘
│ main, page gutters 16               │                      border-bottom 1 · nav padding-top 16 (not 4rem)
│ … clearance 112 + inset             │                      close: 44×44 at top 10 / right 10 (was 40 at 16/16)
│ [ bottom bar, fixed ]               │
└─────────────────────────────────────┘
```

### From 1024 px (1280 shown; 1024 and 1920 only change the widths)

```
x0          240(248@1440,280@1920)                    920 (aside 360@1280)  1280
y0 ┌──────────┬────────────────────────────────────────┬──────────────┐
   │▣ Finance │ lc-header md 64 (padding-left 0)        │ aside band   │  brand block 64 = header 64
64 ├──────────┼────────────────────────────────────────┴──────────────┤
   │ items    │ main (lc-app-page)                      │ aside        │
   │ sticky   │                                         │              │
   │ top 0,   ├──────────────────────────────────────────────────────┤
   │ 100dvh   │ footer: grid-column 1/-1, padding-left = nav width   │
   │ [⟨] row  │ (horizon: the land runs under the nav, full width)   │
900└──────────┴──────────────────────────────────────────────────────┘

Brand block, 240 docked (default variant)          Collapsed rail 56
x0 8 12   44 56                     224 232 240        x0 6 12  44 50 56
┌─┬─┬──────┬──┬─────────────────────┬──┬──┐           ┌─┬─────────┬─┐ 64
│8│4│tile32│12│name 168, ≤2 lines   │8 │8 │ 64        │ │tile 32  │ │  link 44×44 at x 6
└─┴─┴──────┴──┴─────────────────────┴──┴──┘           ├─┴─────────┴─┤
link x 8–232 (≥44 high); tile centre x 28 = icon column│ items …     │
bottom row (showCollapseToggle): border-top 1, padding │ ⟩ 44 at x 6 │ (margin-top:auto)
8px 6px → button 44×44 at x 6 (centre 28)              └─────────────┘
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| shell ≥1024 full-height | areas `'nav header' 'nav body' 'end end'`; nav `grid-row: 1 / -1; grid-column: 1; height: 100vh; height: 100dvh; max-height: none; box-sizing: border-box; z-index: 2; padding-top: env(safe-area-inset-top)`. It stays `sticky; top: 0; align-self: start; overflow-y: auto` and takes the left inset as today. It also gets `display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(100%, auto)`, so a `<div shell-nav>` around `@defer` also fills the height (measured: lazy story 240×900 before and after the swap, `scrollWidth` 240; without it the rail was 256 high). Header `padding-left: 0`. Footer `grid-column: 1 / -1; padding-left: var(--_nav-width)` (the inset is inside the column), with or without horizon | — | `--_nav-width` steps unchanged |
| scope | all full-height rules on `.lc-app-shell--nav-full-height:not(:has(> .lc-app-shell__nav:empty))` inside `@media (min-width: 1024px)`; an empty nav falls back to one column | — | — |
| brand block | `lc-sidenav__logo lc-sidenav__logo--brand` + size class; `padding-inline: 8px` (transparent: `24px 16px`); `gap: 4px`; border-bottom 1 | — | `--spacing-2`, `--spacing-1` |
| brand link `a.lc-sidenav__brand` | flex, `align-items: center`, gap 12, `min-height: 44px`, padding `6px 8px 6px 4px` (transparent: `6px 8px 6px 10px` → tile centre 50 = transparent icon column), `flex: 1 1 auto; min-width: 0`, radius 12 | — | `--spacing-3`, `--border-radius-md` |
| tile `span.lc-sidenav__brand-tile` | 32×32, `flex: none`, radius 10, `place-items: center`; icon `lc-icon size="sm"` (20) `[decorative]="true"`; letter 16/700/1 | 16 px bold | `--border-radius-sm`, `--font-weight-bold` |
| name `span.lc-sidenav__brand-name` | `min-width: 0`; `display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: break-word; hyphens: auto` | 16/600/1.25 | `--font-size-base`, `--font-weight-semibold`, `--line-height-tight` |
| collapsed | block `padding: 0` (existing), link padding 6 (44×44 at x 6); name visually hidden (scoped `.lc-sidenav__sr-only` clip pattern, not `display: none`) | — | — |
| bottom row `div.lc-sidenav__collapse-row` | after `<nav>`, `margin-top: auto`, `border-top: 1px solid var(--lc-sidenav-border)`, `padding: 8px calc(var(--lc-sidenav-nav-padding-x) - 2px)` (transparent `8px 28px`); collapsed `padding: 8px 0; justify-content: center` | — | — |
| collapse button `button.lc-sidenav__collapse-toggle` | 44×44, radius 12, chevron `lc-icon sm` decorative: expanded ⟨ (⟩ for `position="right"`), collapsed ⟩ (⟨) | — | — |
| drawer with brand | `.lc-sidenav__logo--brand ~ .lc-sidenav__close`: 44×44, top 10, right 10; brand block `padding-inline-end: 58px`; `.lc-sidenav__logo--brand ~ .lc-sidenav__nav` padding-top 16 | — | — |

Measured name widths at 16/600 (break-word, hyphens, clamp 2, no overflow in any case):

| Name | Width on one line | 168 (240 docked) | 198 (drawer 320) | 208 (280 docked) |
|---|---|---|---|---|
| "Finance Intelligence" | 151.2 | 1 line | 1 line | 1 line |
| "Finanz-Controlling Cockpit" | 202.8 | 2 lines | 2 lines | 1 line |
| "Haushaltsmitgliederverwaltung" | 237.7 | 2 lines (hyphenated) | 2 lines | 2 lines |

## 4. States

| Element | default | hover | focus-visible | active / current | disabled · loading · empty · error | overflow |
|---|---|---|---|---|---|---|
| shell full-height | §3 | — | — | — | Empty nav → one column. A deferred nav keeps the 240×900 box (the placeholder fills the grid row) | Tall nav content scrolls inside the 100dvh column. A long page leaves the nav at top 0 (after 800 px of scroll: 0; at the end: −0.5) |
| brand link | name `--lc-sidenav-fg-active` | bg `--lc-sidenav-hover-bg`, radius 12 | `outline: 2px solid var(--color-primary-500); outline-offset: 2px` (inside the rail: 8 / 6 px room) | No `aria-current`: the home item in the nav carries it | — | 2-line clamp; the full name stays the accessible name. In the collapsed rail, hover or focus shows a tooltip: the item tooltip's declarations with `content: attr(data-tooltip)`, not `title`, so a label different from the name doesn't add a description |
| collapse button | `--lc-sidenav-fg` | `--lc-sidenav-hover-bg` | same ring | — | — | — |
| tile | icon, or the first letter (`[...name.trim()][0]`, upper-cased) | — | — | — | — | — |
| stat-trend change | as today | — | — | sentiment class wins over direction | `labels` partial → merged with the EN defaults | Unchanged |

In drawer mode a click on the brand closes the drawer, the same way the item clicks do (existing close handler, `isMobile`).

## 5. Theming

**Theme-hook fix.**
- In `host-tokens`, each themed hook reads a private variable first, for example `--lc-sidenav-bg: var(--_lc-sidenav-t-bg, var(--color-sidebar, var(--color-surface)))`. This applies to bg, fg, fg-active, border, hover-bg, section-fg, active-bg, active-fg and active-icon.
- New `:host(.lc-sidenav-container--light)` / `:host(.lc-sidenav-container--dark)` rules hold today's literals as `--_lc-sidenav-t-*`. The host classes are bound from `theme()`.
- The inner `.lc-sidenav--light/--dark` *variable blocks* are removed. The classes stay.
- The placeholder does the same through `host-tokens-boxes` and `themes-boxes`, with bg, fg and border and host classes from its `theme`.
- The public hooks stay at `:host` specificity (0,1,0). The documented "`.x lc-sidenav`" contract therefore holds, and app rules on the inner element still work.

| Element | Light | Dark | Contrast (computed) |
|---|---|---|---|
| brand name | `--lc-sidenav-fg-active`: #111827 on #f9fafb (auto) | #f1f6f8 on #070e15 | 16.98 · 17.81 |
| tile fill / icon | #1a6a79 / #fff (theme-stable) | same | icon 6.21; tile vs rail 5.94 (#f9fafb), 6.21 (#fff), 3.12 (#070e15) |
| focus ring | #208497 on #f9fafb | #84c7d4 on #070e15; #208497 on a `theme="dark"` rail in a light root | 4.18 · 10.25 · 4.44 |
| focus ring + active bar, `theme="light"` rail (review r1) | #208497 (private `--_lc-sidenav-t-accent`) on #fff / on #f0f8fa | same, on a dark page as well (before: #84c7d4, 1.89 / 1.76) | 4.37 · 4.06 |
| petrol story (AC-7): `--lc-sidenav-bg: var(--color-primary-fill-active)` #0d353d, `--lc-sidenav-border: transparent` | fg #c4d2d9 8.51 · name/fg-active #f1f6f8 12.1 · section #93a4ad 5.12 · hover text 10.7 | identical (all theme-stable) | ≥ 4.5 everywhere |
| petrol active item: `--lc-sidenav-active-bg: var(--color-primary-fill)`, `-active-fg`, `-active-icon`, `-active-indicator: var(--color-on-primary)` | white on #1a6a79 | same | 6.21 (text and bar) |
| petrol tile: `--lc-sidenav-brand-tile-bg: var(--color-on-primary)`, `-fg: var(--color-primary-fill)` | #1a6a79 on #fff; tile vs rail | same | 6.21 · 13.18 |
| petrol focus ring `--color-primary-500` | #208497 on #0d353d | #84c7d4 on #0d353d | 3.02 · 6.97 (≥ 3, no hook needed) |
| shell tint (land-1 at the top) | primary 15.72 · secondary 6.69 · tertiary 5.17 · link 5.5 · ring 3.87 | 15.29 · 10.76 · 6.47 · 10.42 · 8.81 | AA |
| stat-trend positive (+ `--up`) | `--color-text-success` #5f7150 on `--color-success-subtle` #f3f6ee | #a9bb93 on 18 % tint over the card surface (#101c26) / raised | 4.85 · 6.25 / 5.17 (before: `--up` light 2.33) |
| stat-trend negative (+ `--down`) | `--color-text-error` #6b0909 on `--color-error-subtle` #fbecec | #f7a1a1 on 18 % tint over surface / raised | 10.98 · 8.38 / 7.21 (before: `--down` dark 1.98) |
| stat-trend neutral | unchanged | unchanged | 6.87 · 9.97 |

Note for the consumer, to go into the changelog: `--color-primary-100…900` invert in dark. A petrol palette built from them (primary-800/100/300/700/200) turns light in dark mode. Use the theme-stable `--color-primary-fill*` and `--color-on-primary`.

Informational only: in dark, the petrol column against the dark tint is 1.26:1. That is a region boundary, not a UI component.

New tokens: none.

**Change note (review r1, 2026-10-30).** §5 missed the pair `theme="light"` rail on a dark page: the ring and the bar kept the page's `--color-primary-500` (#84c7d4), 1.89 / 1.76 on the white rail (AC-13 fail). The light theme now adds `--_lc-sidenav-t-accent: #208497` to its host rule. All sidenav `:focus-visible` outlines read `var(--_lc-sidenav-t-accent, var(--color-primary-500))`, and the bar default is `var(--lc-sidenav-active-indicator, var(--_lc-sidenav-t-accent, var(--color-primary-500)))`. The dark theme gets no accent, because it measures ≥ 3.98 on both pages and setting one would change the active bar in the light shots of the 8 existing `theme: 'dark'` sidenav stories. §8: the horizon story gets a rail brand, so its first item sits at y 112 as in `below-header` (it was at y 48, beside the header).

## 6. Accessibility

- **Landmarks (AC-5):**
  - Unchanged in both placements: `lc-header`'s `<header>` (banner), the sidenav's docked `<aside>` (complementary, pre-existing) holding the brand and `<nav aria-label>`, and `lc-app-page`'s `<main id="main">`.
  - From 1024 px the bottom bar is `display: none`, and below 1024 px the shell nav is. Exactly one banner, one navigation and one main are exposed.
- **Tab order (decided):**
  - The order is skip link (`<a class="skip-to-content" href="#main">`, the app's first element) → header controls → brand → nav items → collapse button → main → footer.
  - In full-height the header comes before the brand while the brand sits visually top-left. This order is identical at every width and in both placements, and the reading sequence (banner, then navigation, then content) stays meaningful (WCAG 1.3.2, 2.4.3). Moving the nav first would put every nav item before the header actions.
  - Documented in the JSDoc and the story description.
- **Brand:**
  - One `<a>`, never a button. The tile is `aria-hidden="true"` and its icon `[decorative]`.
  - Name: `brandAriaLabel || brandName` via `aria-label` only when the label is set. The text name is the accessible name otherwise and stays in the AX tree when collapsed (sr-only).
  - The link is ≥ 44×44.
- **Collapse button:** a `type="button"`, 44×44, `aria-label` = `collapseAriaLabel ||` the existing position text when expanded, `expandAriaLabel` when collapsed. No `title`. The focus stays on the button after a toggle (same element).
- **Drawer:** DOM brand → close → items. `cdkFocusInitial` stays on close, so Shift+Tab reaches the brand.
- **forced-colors:**
  - The tile gets `border: 1px solid CanvasText`. Its fill is dropped and the icon or letter stays in CanvasText.
  - Focus outlines stay system-coloured.
  - The active item, which today relies on the fill, also gets `outline: 1px solid Highlight` inside `@media (forced-colors: active)`.
- **Reduced motion:** nothing animates. The collapse width change uses the existing rail transition, which already honours it.
- **Stat-trend (AC-19):**
  - With `sentiment` set, the arrow span gets `aria-hidden="true"`.
  - A span `.lc-stat-trend__sr-only` (scoped clip pattern) is appended inside `.lc-stat-trend__change`, joined as `, {up|down|unchanged}, {positive|negative|neutral}`. A screen reader hears "+3,1 %, gestiegen, ungünstig".
  - The visible sign, arrow and text carry the direction, so meaning never rests on colour alone. Recommend naming the measure in `label`.

## 7. Texts

| Key / input | EN default | DE (checked) |
|---|---|---|
| sidenav `expandAriaLabel` | Expand navigation | Navigation ausklappen |
| sidenav `collapseAriaLabel` (existing, empty → position text) | Collapse navigation to the left | Navigation nach links einklappen |
| sidenav `closeAriaLabel` (existing) | Close navigation | Navigation schließen |
| sidenav `brandAriaLabel` (no default text) | — (story: "Finance Intelligence – home") | Finanz-Controlling Cockpit – Startseite |
| stat-trend `labels.up` / `down` / `unchanged` | up / down / unchanged | gestiegen / gesunken / unverändert |
| stat-trend `labels.positive` / `negative` / `neutral` | favourable / unfavourable / neutral | günstig / ungünstig / neutral |

None of these strings is visible except the tooltips. Long visible German strings come from the consumer: brand names (§3 table) and nav items ("Einstellungen", "Kostenstellen") at 360 and 240 px.

## 8. Stories

Every new input gets an argType with `description` and `table.defaultValue`: `navPlacement`, the six sidenav inputs, `sentiment` and `labels`.

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Full Height Nav | `layout-app-shell--full-height-nav` | Petrol palette (§5) set in a story `<style>` on `.fi-shell lc-sidenav`. The shell has `navPlacement="full-height"` and the tint on `lc-app-shell`. `lc-sidenav theme="dark"` with brand "Finance Intelligence" and `presentation-chart-line`, aria "Finance Intelligence – Startseite", `showCollapseToggle`. German items (Übersicht, Kosten, Budgets, Verträge, Berichte, Einstellungen). Skip link "Zum Inhalt springen". `lc-header size="md" [showLogo]="false" title="Übersicht"`. `lc-app-page` with white cards and a "Kosten" stat-trend (negative). `lc-bottom-nav` below 1024 | AC-2, 4, 5, 7, 11; 360 = phone layout |
| Full Height Nav Horizon | `layout-app-shell--full-height-nav-horizon` | full-height, `horizon`, footer, `lc-app-page` with aside, default transparent rail with a brand block (`brandName` or `showLogo`, header `[showLogo]="false"`; r1 S1: first item y 112). The header title names the page, "Heute", not the product (§9 risk 3; r2) | AC-6: land under a transparent nav, aside band at 1280, footer beside the nav at 1920 |
| Tinted Background | `layout-app-shell--tinted-background` | below-header, `horizon`, the gradient, bottom bar | AC-15, 16 |
| Text Brand | `navigation-sidenav--text-brand` | Two docked 240 rails side by side, `theme="light"` and `theme="dark"`, EN | AC-9, 10, 13 |
| Text Brand Collapsed Vs Expanded | `navigation-sidenav--text-brand-collapsed-vs-expanded` | `showCollapseToggle`; rails expanded, collapsed, and collapsed without `brandIcon` (letter) | AC-12 |
| Text Brand German | `navigation-sidenav--text-brand-german` | `lang="de"`, docked 240 dark. Rail 1: "Finanz-Controlling Cockpit" with the aria above and `showCollapseToggle`. Rail 2: "Haushaltsmitgliederverwaltung" | AC-14 docked |
| Text Brand Drawer German | `navigation-sidenav--text-brand-drawer-german` | `lang="de"`, drawer, `isOpen`, fullscreen layout, "Finanz-Controlling Cockpit", German close label | AC-14 at 360 |
| Costs | `charts-stat-trend--costs` | `lang="de"`, label "Kosten (Monat)", "48,2 Mio. €", "+3,1 %", `sentiment="negative"`, DE `labels`, rising sparkline | AC-18, 19 |
| Sentiment | `charts-stat-trend--sentiment` | EN row: Costs +3.1 % negative, Churn −0.8 % positive, Budget variance +0.4 % neutral | AC-18, 20 |

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1 | Unit test: the class is absent by default and present for `'full-height'`. Hash compare: 11 shell and 2 header-shell stories vs `tmp/story-shots/019/baseline` | 0 diffs |
| 2 | `--measure` on full-height-nav at 1024, 1280 and 1920: nav rect; scroll 800; header x | nav 0,0,240×900 (280 at 1920); after scroll, top 0; header x = nav width; brand 64 = header 64 |
| 3 | Style spec: every compiled selector containing `--nav-full-height` sits inside `@media (min-width: 1024px)`. `--measure` at 360 and 768: rects of header, body and bar with and without the class | All inside; rects equal |
| 4 | Measure with `--lc-app-shell-nav-width: 300px`; unit/story with empty `[shell-nav]`; inset by style spec (header `padding-left: 0`, nav keeps the left inset) | 300; one column; inset once |
| 5 | Unit test: DOM order and landmark counts. Keyboard walk in the story (Tab ×n, `document.activeElement`) | Order as in §6; 1 banner, 1 navigation, 1 main |
| 6 | full-height-nav-horizon at 1280 and 1920, light and dark: horizon and footer rects; aside band x | Footer x 0 with content at the nav width; band x = aside x (920 at 1280); no gap |
| 7 | Contrast measure (`tmp/story-shots/019/contrast.js`) on rail texts, active item and tile | Values from §5, each ≥ 4.5 |
| 8 | Compat probe (pattern `probe-39`): full-height shell, sidenav `brandName` + `brandHref="/"`, stat-trend negative. `EXPECT_IN_HTML`: `lc-app-shell--nav-full-height`, `class="lc-sidenav__brand"` with `href="/"`, `lc-stat-trend__change--negative` | Present on 21 and 22 |
| 9 | Unit test: default DOM has no `.lc-sidenav__brand` and no `.lc-sidenav__collapse-row`; `brandIcon` alone renders nothing. Sidenav baselines | 0 diffs except the 3 listed |
| 10 | Unit test: one `a`, tile `aria-hidden`, name. Measure the link rect | ≥ 44 high; 224 wide expanded, 44×44 collapsed |
| 11 | full-height-nav at 1280: brand block height vs `lc-header header` height; centre y of the name vs the header title | 64 = 64; centres 32 ± 1 |
| 12 | Unit test: collapsed name sr-only, the link is still `a[href]`, the button is reachable and its label switches | — |
| 13 | text-brand light and dark; style spec for the forced-colors rule; ring contrast | §5 values; ring ≥ 3 |
| 14 | German stories at 360 (drawer) and 1280 (240 docked): `scrollWidth ≤ clientWidth` on the name, the link, the rail and `documentElement`; line count | No overflow; ≤ 2 lines; accessible name = full name |
| 15 | Class JSDoc "CSS hooks" list (all 4 shell hooks), hooks table in the app-shell docs, `colors.mdx` "Page sky" paragraph; `get_components` text | Both hooks with defaults and the gradient |
| 16 | tinted-background at 360, 1024 and 1280, light and dark; existing shell stories hash compare | Land over the tint, bar clearance intact; 0 diffs |
| 17 | Unit test: unset sentiment for up, down and neutral gives today's classes, text and sparkline | Unchanged |
| 18 | Unit test: up + negative gives ↑, `--negative`, sparkline `error`; an explicit `sparklineColor` wins | — |
| 19 | Unit test: the DOM text of the sr span in EN and DE, the arrow `aria-hidden` | ", gestiegen, ungünstig" |
| 20 | Contrast measure on costs and sentiment, light and dark | ≥ 4.5 (§5) |
| 21 | Story review; `npm run test:tools` (manifest lists the new inputs) | — |
| 22 | build.md gates | Green |

**Risks and pitfalls for the build:**
1. The placeholder spec requires every placeholder rule to be a subset of a sidenav rule with the *same selector*. Move the theme rules to `:host(.lc-sidenav-container--*)` in both, through the shared partial. Projected `[shell-nav]` children don't carry the shell's `_ngcontent`, so use the grid row from §3, not `> *`.
2. In `@defer`, the placeholder needs `[showLogo]="true"` and the same `logoSize` to reserve the 64 px brand box. Say so in the JSDoc. `hyphens` needs `lang`. In the stories, `brandAriaLabel` starts with the name (axe label-in-name).
3. **F1, follow-up, not in scope:** in full-height an app's header title can repeat the brand from 1024 px. The story uses the page title instead.
