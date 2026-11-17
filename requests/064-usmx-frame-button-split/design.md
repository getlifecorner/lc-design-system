# Design 064: USM X frame and controls (header, tabs, sidenav, page-header, card, list, search-input, modal, stat-trend, button, badge, split button)

- **Status:** revised (change note below)
- **Spec:** [spec.md](spec.md) — AC-1…32, all 16 rows (4, 11, 14, 16, 17, 20–30).
- **Change note (2026-11-17 21:18, review r2):** §5 left the vertical tabs' normal-mode line open. A selected vertical tab draws `border-right: 2px solid var(--color-primary-500)` (4.37:1 light, 9.95:1 dark on the surface), the others `transparent`, as the horizontal underline does; on `main` a later same-weight rule hides it (review finding 10).
- **Change note (2026-11-17 20:57, review r1):** build deviations 1–6 are the design now: `title-aside` after the overline in the DOM; hint `flex: 0 100000 auto`; the footer reads `--lc-card-divider-color` in its own rule; the modal handles Enter/Space on the ×; card sm toggle `::after` `inset: -6px 0 -7px` (44.4 px); tabs also scroll the current tab in on a `ResizeObserver`. Added, because §3–§5 left them open: the split button keeps its intrinsic height in a stretching flex parent (as `lc-button`); a `wrap` badge with an icon start-aligns its label; in forced colours only the selected tab shows the underline (`transparent` borders are forced to the text colour).
- **Change note (2026-11-17 19:33):** owner decision 19:08 puts rows 11, 14 and 20 back. Added the tabs link mode (AC-2), one shared row model, the sidenav items (AC-3…7) with the AC-32 choices, and the list rows (AC-15), plus one measured WCAG fix on `lc-tabs` (§1). The 13-row design of 16:15 is unchanged, and so is the branch's partial work that follows it (header, page-header, theme tokens).

## 1. Approach

**Scope.** All 16 rows ship in one version, 3.44.0 (owner, 19:08). That is about 33 new stories: 21 for the frame and control rows and 12 for rows 11, 14 and 20. A review round opens 12 shots, so the review opens the new stories at 360 and 1280 px in one theme and checks the rest through `--measure`. Nothing returns to the inbox. **Folded in:** at 360 px the horizontal `lc-tabs` list overflows the page (`navigation-tabs--with-badges`: list scrollWidth 557 in 328, page 573 in 360). That is a pre-existing WCAG 1.4.10 failure, so the horizontal list now scrolls on its own (§3). **Found:** `lc-tab`'s `icon` input never renders (0 icons in *With Icons*). That goes to the backlog as 064-n3, because fixing it changes tab widths for consumers who set `icon`.

**Patterns followed.**
- Header hooks (AC-1): private resolved values (`--_lc-header-*: var(--lc-header-*, <variant default>)`), as `lc-badge` 3.42 and `lc-chip` 3.40. A hook declared on the element can never be inherited from an ancestor, and `:where()` does not change that, so the defaults move into the fallback.
- Tints (AC-12, AC-21): **semantic theme tokens derived from the scale** (precedent: `--color-primary: var(--color-primary-500)`), not `var(--color-primary-400)` in the component. The dark theme flips the scale: `#84c7d4` is light `-400` and dark `-500`. A component-level `-400` mix would render dark `(11,25,34)` instead of `(17,29,38)` (measured, 6/4/4 RGB steps off). Tokens declared in the theme blocks follow a customer theme written on `<html>` (usm-x `theme.service.ts` writes `--color-primary-*` there) and the `.lc-theme-*` scopes. A **subtree** accent re-points them, as usm-x's `.usmx-custom-scope` already does for 20 tokens: custom properties inherit computed values, so nothing resolved at `:root` can follow a subtree override of the scale alone (pitfall 043). Story scopes copy the light declaration verbatim. This defines "scoped accent" in AC-12 and AC-21.
- Clickable card heading (AC-20): the stretched control of the link card (3.24) and the collapsible card (3.36).
- Page-header hooks: consumed with a fallback and never declared, like `--lc-page-header-subtitle-*`.
- Split button (AC-26): a **new `lc-split-button`** made of an `lc-button` face and an `lc-menu` around a caret. A group mode would add a third layout model to `lc-button`'s 30 inputs, and the menu state, its ARIA and its keys would leak into every button.
- **Shared row model (rows 14, 20):** one exported interface, `ItemRowState` in `@lifecorner/angular-ui-kit/models` (`busy`, `disabled`, `disabledReason`, `tooltip`). `NavigationItem` and `ListItem` both extend it, with one behaviour contract (§4 *Row states*) and the same `busyLabel` input. Precedents: `lc-button` `loading` (`aria-busy` plus `aria-disabled`, keeps focus, the page announces the outcome) and `disabledReason` (lc-button, choice-prompt). **`indent` is list-only:** a sidenav's depth is its `children` (groups with `aria-expanded`), so a flat indent there would draw a hierarchy that assistive technology can't see.
- **One tooltip per row:** the kit `lcTooltip` on the row's single focus target. It shows on hover and on focus, Escape dismisses it, and it sets `aria-describedby` while shown (3.32/3.33). Its text is `disabledReason` while disabled, otherwise `tooltip`, followed by the badge tooltip after " · ". The badge can't be a hover or focus target of its own: it sits inside the row's link or button, or under the split row's stretched button.
- **Tabs link mode (row 11):** follows Angular Material's `mat-tab-nav-bar` with a tab panel. The list has `role="tablist"`, each link has `role="tab"`, and the app sets `aria-selected`. Activation is **manual**: arrow keys move focus, and Enter or Space follows the link. Reason: a route load has latency (APG, "selection follows focus"). The inputs are `route` + `queryParams` and never an input named `routerLink` (pitfall 037). `RouterLink` is used only inside the route branch.
- **Sidenav action items:** a new `kind: 'action'` instead of an optional `route`. `route: string` is required and consumers read it (`router.navigate([item.route])`), so widening it to `string | undefined` would break their builds (pitfall 063). Action items pass `route: ''`.
- **Blocking a busy or disabled router link:** `RouterLink.onClick` navigates whatever `defaultPrevented` says (checked in the router's `_router_module-chunk.mjs` l. 355), so a template handler can't stop it. One capture-phase `click` listener on the `lc-sidenav` host, added in code rather than as a template binding, calls `preventDefault` and `stopPropagation` for clicks inside items with `aria-disabled="true"`, so the event never reaches the link.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| CSS hook | `--lc-header-bg`, `-fg`, `-fg-secondary`, `-border`, `-hover-bg`, `-trigger-border`, `-trigger-fg` | colour; `bg` any `background` | per variant, as today | Now settable on any ancestor (`:root`, shell) or the host, and they win over the variant defaults. `bg` is painted with `background`, so a gradient works. `variant="transparent"` still wins (it declares its own). |
| CSS hook | `--lc-header-z` | integer | `900` | Stack level of the sticky header: below `lc-modal` (999/1000), drawer (1100), toasts (1200) and above content (≤ 100). Was `1000`. |
| slot | `[slot='title-aside']` | — | — | Beside the heading and **outside** it: status chips and live regions here are not in the heading's name. Hidden when empty. `title-suffix` stays as is (inside the heading). |
| CSS hook | `--lc-page-header-overline-color` | colour | `var(--color-overline)` | Overline ink. |
| CSS hook | `--lc-page-header-title-font-size` | length | the size's value (default 24 px) | Title size for every `size` (as `--lc-page-header-subtitle-font-size`). |
| CSS hook | `--lc-page-header-title-aside-below` | `0` \| `1` | `0` | `1` puts `title-aside` on its own line under the title row; the actions keep the title's line. Set it in a container query where the row gets tight. `0`: the actions wrap first (as before). |
| input | `lc-card` `clickTarget` | `CardClickTarget` = `'card' \| 'heading'` | `'card'` | Where the button role sits on a `clickable` card with a `title`. `'heading'`: a `<button>` inside the title's heading, stretched over the card. The heading stays in the page outline, one tab stop, Enter/Space/click emit `cardClick` once. Without a title, `'card'` applies. |
| input | `lc-card` `truncateTitle` | boolean | `false` | Title on one line with "…"; the full title is the heading's `title` attribute. |
| input | `lc-card` `headerSize` | `CardHeaderSize` = `'md' \| 'sm'` | `'md'` | `sm`: the head's padding-bottom 8 px and margin-bottom 12 px (was 12/16); a collapsible head is at least 32 px high, and its toggle's hit area is still 44 px. |
| CSS hook | `--lc-card-divider-color` | colour | head `--color-border`; `[card-header]`/`[card-footer]` `--color-divider` | One colour for every card rule; each default stays as it is. |
| token | `--color-brand-tile-subtle` | colour | L `color-mix(in srgb, var(--color-primary-500) 14%, transparent)` · D `… var(--color-primary-400) 14% …` | Ground of the `subtle` icon tile (card, page-header); both render `rgba(32,132,151,.14)`. |
| token (changed) | `--gradient-brand-tile` · `--shadow-brand-glow` | — | L `linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600))` · D `… -500, -300`; glow L `0 0 0 1px color-mix(… -500 18% …)` · D `… -500 30% …` | Same render; now derived from the scale. |
| input | `lc-search-input` `inputRole` | `SearchInputRole` = `'combobox'` \| `null` | `null` | `role` on the inner `<input>`. Not `role` itself: a static `role` would also stay on the host. |
| input | `ariaExpanded` · `ariaControls` · `ariaActiveDescendant` | `boolean\|null` · string · string | `null` · `''` · `''` | Forwarded to the inner `<input>`; unset renders no attribute. |
| input | `ariaAutocomplete` · `ariaHasPopup` | `SearchInputAriaAutocomplete` = `'list'\|'inline'\|'both'\|'none'` · `SearchInputAriaHasPopup` = `'listbox'\|'grid'\|'tree'\|'dialog'`, each `\|null` | `null` | Forwarded; unset renders nothing. |
| type (widened) | `ModalPlacement` | `+ 'top'` | `'center'` | `top`: anchored at the top offset, centred horizontally, grows downward only; `full` ignores it. Widened as `ButtonVariant` was in 3.36. |
| CSS hook | `--lc-modal-top-offset` | length | `10dvh` | Top edge of `placement="top"`; never less than `env(safe-area-inset-top) + 16px`. |
| behaviour | `lc-modal` keys | — | — | Escape: `preventDefault()` + `stopPropagation()` when claimed (also with `closeOnEscape=false`). Enter/Space on the ×: `preventDefault()` + `stopPropagation()` in a keydown on the dialog element, then close. |
| input | `lc-button` `shape` | `ButtonShape` = `'pill' \| 'row'` | `'pill'` | `row`: a bare row body: full width, start-aligned, inherited font and ink, no fill, border or hover/active fill in any variant, radius `--border-radius-sm`, inset focus ring. Overrides `size` padding/font, `inline`, `flush`, `iconOnly`, `fullWidth`. |
| CSS hook | `--lc-button-row-padding` · `--lc-button-row-min-height` | length | `var(--spacing-2) var(--spacing-3)` · `44px` | Row shape only. Keep at least 24 px (WCAG 2.5.8), and padding ≥ 4 px where content touches the edge (inset ring). |
| CSS hook | `--lc-button-outline-bg` | colour | `var(--color-primary-wash)` | Ground of `variant="outline"`, both tones; active = this ground under the `brightness(.92)`. |
| token | `--color-primary-wash` | colour | L `color-mix(in srgb, var(--color-primary-400) 6%, transparent)` · D `… var(--color-primary-500) 6% …` | Renders `rgba(132,199,212,.06)` in both themes (the old literal). |
| input | `lc-button` `accessKey` · `ariaKeyShortcuts` | string | `''` | `accesskey` / `aria-keyshortcuts` on the inner `<button>`; empty renders none. On `a[lcButton]` set the attributes directly (the host is the link). |
| input | `lc-badge` `icon` | `string \| undefined` | `undefined` | Leading decorative `lc-icon` (after the dot), `1em` square. |
| CSS hook | `--lc-badge-gap` | length | `0`; `0.4em` with `icon` | Space between dot/icon, projected elements and the label; settable from any ancestor. |
| component | `lc-split-button` (`SplitButtonComponent`, entry `@lifecorner/angular-ui-kit/split-button`) | — | — | Face plus menu caret in one outline. Default content = face label; `[slot='icon-before']` = face icon. |
| input | `items` · `variant` · `size` | `MenuItem[]` · `SplitButtonVariant` = `'primary'\|'secondary'\|'outline'` · `SplitButtonSize` = `'sm'\|'md'\|'lg'` | `[]` · `'outline'` · `'md'` | `outline` is the default: a toolbar group should not compete with the page's primary action. |
| input | `disabled` · `loading` · `menuAriaLabel` · `menuPosition` | boolean · boolean · string · `SplitButtonMenuPosition` (lc-menu's four values) | `false` · `false` · `'More actions'` · `'bottom-right'` | `loading`: face as `lc-button loading`; caret `aria-disabled`, keeps focus, no spinner. `bottom-right` puts the panel's end edge at the group's end edge. |
| output | `clicked` · `itemClick` | `void` · `MenuItem` | — | Face activation; menu item activation (the menu then closes, focus goes back to the caret). |

**Rows 11, 14, 20.** Inputs carry JSDoc with `@default`; fields carry JSDoc.

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| type | `ItemRowState` (models) | `{ busy?, disabled?, disabledReason?: string, tooltip?: string }` | — | `busy`: spinner in the leading slot, `aria-busy` and `aria-disabled`, activation ignored, focus kept. `disabled`: the row stays in place with `aria-disabled` and can't be activated. It is out of the tab order unless it has a `disabledReason`, which is its tooltip while disabled. `tooltip`: the kit tooltip on hover and on focus. |
| input (sidenav, list) | `busyLabel` | string | `'Loading'` | Read after a busy row's text. Sidenav: "Berichte Wird geladen". List rows that have an `aria-label` get ", Wird geladen" appended to it. |
| input (tabs) | `mode` | `TabsMode` = `'panels' \| 'links'` | `'panels'` | `links`: a tab list of links for content shown elsewhere (a router outlet). The kit renders no panels. The current tab is the `lc-tab` with `current`, and clicks don't change it. `selectedIndex` is ignored. |
| input (tabs) | `panelId` | string | `''` | `links` mode: the `aria-controls` of every tab, i.e. the id of the element that shows the tab content. |
| inputs (lc-tab) | `route` · `queryParams` · `queryParamsHandling` | `string \| readonly unknown[] \| null` · `Params \| null` · `QueryParamsHandling \| null` | `null` | `links` mode: the tab's router link (`RouterLink`), e.g. `route="."` `[queryParams]="{ tab: 'kosten' }"` `queryParamsHandling="merge"`. |
| input (lc-tab) | `href` | string | `''` | `links` mode without the router (plain link). `route` wins. |
| input (lc-tab) | `current` | boolean | `false` | `links` mode: the app's current tab (`aria-selected="true"`, the selected look). If several tabs have it, the first wins. |
| input (lc-tab) | `tabId` | string | `''` | Id of the tab element, so an app panel can use `aria-labelledby`. In panels mode the kit's own panel follows it. Empty: the generated `lc-tab-N`. |
| fields (NavigationItem) | `kind` | `NavigationItemKind` = `'link' \| 'action'` | `'link'` | `action`: a `<button>` that emits `itemClicked` only, and `route` is ignored (pass `''`). Routes never make an action item current. |
| | `current` | boolean | — | Current item: `aria-current="page"` and the current look. The first such item in display order wins over `activeRoute` and the router. |
| | `hasChildren` · `childrenLoading` | boolean | — | A group whose children load on demand. It shows the chevron with no children yet, and opening it emits `expandRequested` while it has none. `childrenLoading`: the open group shows a loading row and `aria-busy`. One level, as today. |
| | `hint` | string | — | Right-aligned text beside the label (12 px), in the item's accessible name. Hidden on the rail. Ellipsis, with the full text in `title`. |
| | `matchRoutes` · `iconUrl` · `muted` | `string[]` · string · boolean | — | AC-32. `matchRoutes`: further routes the item is current for, matched like `route` (exact, then the longest prefix). `iconUrl`: an image instead of `icon` (`alt=""`, 20 px, 22 px on the rail). `muted`: a quieter ink at rest; the item is still a link. |
| | `badge.ariaLabel` · `badge.tooltip` | string | — | AC-32. Read after the label instead of `badgeAriaLabel` (e.g. "56/60" → "56 von 60 geladen"). The tooltip joins the row's tooltip. |
| inputs (sidenav) | `childrenLoadingLabel` | string | `'Loading…'` | Text of the loading row. |
| | `brandSubtitle` · `brandLetter` | string | `''` | AC-32. A second line under `brandName` (the name then has one line), and the tile's letter instead of the name's first one. `brandIcon` wins over the letter. |
| outputs (sidenav) | `expandRequested` · `itemContextMenu` | `NavigationItem` · `NavigationItemContextMenuEvent` = `{ item; event: MouseEvent }` | — | A lazy group was opened without children. A `contextmenu` event on an item (right click, Shift+F10, the Menu key, an Android long press); the kit doesn't call `preventDefault`. Not emitted for disabled items. |
| fields (ListItem) | `badgeTooltip` · `heading` · `indent` | string · boolean · number | — · — · `0` | The badge's text in the row tooltip. `heading`: the row is a sub-heading (label only, see §3). `indent`: 0–4, floored and clamped. |
| inputs (list) | `headingLevel` · `multiColumn` | `ListHeadingLevel` = `2\|3\|4\|5\|6` · boolean | `3` · `false` | The `h2`–`h6` of heading items. `multiColumn`: a vertical list flows into as many columns as fit. Rows never split, and a heading stays with its first row. |
| CSS hooks (list) | `--lc-list-column-width` · `--lc-list-column-gap` · `--lc-list-indent-step` | length | `18rem` · `var(--spacing-6)` · sm 28 / md 32 / lg 36 px (20 px icon + the size's row gap) | Column width (`multiColumn`), gap between columns, and indent per level (a child's icon lands at its parent's label x). |

**Defaults of rows 11, 14 and 20.** Every new attribute binding is `null` when unset. In the sidenav, the item content moves into one shared `<ng-template>` (icon, spinner or image, label, hint, badge and its hidden text, busy text) used by every item site; it adds comment nodes only. Keep `</lc-badge>&ngsp;<span class="lc-sidenav__sr-only">` together: `check-angular-majors.mjs` l. 596 reads it. `lcTooltip` with `''` adds nothing. The capture listener is code. `lc-tabs` `links` mode is its own branch, and the panels template is unchanged. The `lc-list` heading, indent and columns parts render only when set. **Intended change:** horizontal tab lists (both modes) scroll and draw an inset ring (WCAG 1.4.10, §1). Expected diffs: `navigation-tabs--with-badges` at 360 L/D, plus any tabs shot that shows a focused tab. `NavigationItem` fields are ignored by `lc-bottom-nav`. The placeholder follows the new current rules through `internal/navigation`, and its boxes are unchanged.

**Default rendering unchanged (the frame and control rows of the first table).** No template adds an `@if`/`@else` branch on a default path: badge `@if (dot() || icon()) { @if (dot()) … @if (icon()) … }` (pitfall 045 r1). Card: switch the template via the existing `@else if (linkMode())` outlet, so the `card.link` and `card.collapsible` innerHTML pins hold. New attribute bindings are `null` when unset. **Intended changes:** a titled card with no body and no footer loses its rule, padding-bottom and margin (AC-13). A label- and icon-less stat-trend loses its empty header and 4 px gap (AC-19, +1 comment anchor before every header; grep the pins). The header's z-index 1000 → 900 shows only where layers overlap (a modal or an overlay sidenav now covers the header). Ancestor header hooks that were ignored now apply. `button.tone.spec.ts:90` pins the literal `rgba(132, 199, 212, 0.06)`: change that assertion (reason: AC-21). `theme-contrast.spec.ts` `parse()` must read `color-mix(in srgb, var(--x) N%, transparent)`.

## 3. Anatomy and layout

Measured on 3.43 (`tmp/shots-064-m1.log`): `lc-button` heights xs 25 · sm 35.5 · md 42 · lg 48.5. Page-header title 24 px, title-row gap 16/16. Card head mb 16 / pb 12, collapsible head ≥ 44 (closed 45.6). Badge md 28 high, 14 px. Header 64 high, z 1000. Storybook canvas padding 16.

### 360 px

```
Split button, sm, outline, DE (toolbar at x 16)            Card, clickTarget="heading", truncateTitle, DE (w 328)
╭───────────────────────┬──────╮  h 35.5 (md 42, lg 48.5)  ┌──────────────────────────────────────┐
│ ▣ Speichern            │  ⌄   │  face pad 8/12, gap 8      │ ▣ Rechnungsübersicht Jan…  (Neu)     │ h3>button, 1 line,
╰───────────────────────┴──────╯  caret ≥ 36 (44, 48) wide   │   Stand 17. November                 │ title= full text
  outline: divider = face end border (caret start border 0)  │ ─────────────────────────────────── │ rule: --lc-card-divider-color
  filled: 1 px gap · radius full outside, 0 inside           │ …                                    │ ring on the card (:has), 2/+2
             ┌───────────────────────┐ +8 px (lc-menu)       └──────────────────────────────────────┘
             │ Speichern unter …      │ end = caret end, min-w 220
             │ Als Vorlage speichern  │                       Badge with icon: │▣ Entwurf│ icon 1em, gap .4em
             └───────────────────────┘                        (xs 12/4.8 · sm, md 14/5.6 · lg 16/6.4)
Modal placement="top", md: top max(16 + safe-area, 10dvh) = 90 at the 900 px shot height (64 on a 640 px phone);
  w 90 % = 324; max-h 100dvh − top − 16 (794 / 560); body scrolls inside; the top edge stays put while the body grows.
Button shape="row" inside a consumer row: w 100 %, pad 8/12, min-h 44, radius 10, ink/font inherited, ring 2 px at offset −2.
```

### 768 / 1024 / 1280 px

```
Page header, size default, DE, story container query (30rem ≤ w < 56rem → aside-below 1):
1280: Rechnungsübersicht  (Entwurf)(Geändert)  ·························  [Teilen] [Neu ▾]   one line; aside 16 from h1
 768: Rechnungsübersicht  ·············································  [Teilen] [Neu ▾]   h1 + actions keep line 1
      (Entwurf)(Geändert)                                                                  own line, 16 below, x = h1 x
 360: (hook 0 again) natural wrap: h1 / aside, then actions: the default flow, measured in the review.
Modal top at 1280×900: top 90, md 600 wide, x 340; Header: z 900; an open modal backdrop covers it.
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Split face | lc-button size padding; inner end corners 0 | label as lc-button | — |
| Split caret | min-inline-size sm 2.25rem · md 2.75rem · lg 3rem; stretches to face height (also when the face label wraps); chevron 16/16/20 | — | `--border-radius-full` outer end |
| Split group | `inline-flex`, `align-items: stretch`, gap 0 (outline) / 1px (filled) | — | — |
| Page-header aside | `div.lc-page-header__title-aside` inside `@if (title())`, after the heading `@switch`, before the overline; `inline-flex`, wrap, centred; `order: var(hook,0)`; `min-inline-size: calc(var(hook,0) * 100%)`; gap inside `--lc-density-gap-sm`; `:empty` → none | — | — |
| Card body-less head | as the collapsed head: mb 0, pb 0, border 0 (`.card:has(> .card__body:empty):not(:has(> :is([card-footer],.card-footer)))`) | — | — |
| Card sm head | pb `--spacing-2`, mb `--spacing-3`; collapsible min-h 32, toggle `::after` `inset: -6px 0` | — | — |
| Badge icon | `--lc-icon-size: 1em` on `.lc-badge__icon`; `wrap`: `align-self: flex-start; margin-top: .125em` | — | — |
| Modal top | `top` above; `left: 50%`; `transform: translateX(-50%)`; enter: opacity + `translateY(-.5rem)` → 0 | — | — |

### Rows 11, 14, 20 (measured on the 19:24 working-tree build, `tmp/story-shots/064/d2-*.log`)

Measured at the start: sidenav items are 264 × 44 in the 360 drawer and 303 × 44 docked at 1280 (padding 10, icon 20, gap 12), so the label area is 212 / 251. The xs badge is 27 × 22, the chevron 16. Text widths (14/500): Kostenstellen 89, Leistungsverrechnung 147. Text widths (12/400): Rich Client 61, kein Recht 59, Editor im Rich Client 114. A list md row has its icon at x 16 and its label at x 48 (sm: 12 / 40). Tabs: 39 high, padding 8/16, gap 8. DE tab texts (14/500): Übersicht 64, Kostenstellen 89, Leistungsverrechnung 147, Anhänge 59.

```
Sidenav drawer, 360, DE (item 264)                 List, multiColumn, DE, 1280 (canvas 1248 → 4 × 294, gap 24)
┌──────────────────────────────────────┐          Arbeit                   │ Customizing            │ …
│ ▣ Kostenstellen          Rich Client │ hint     ▣ Incidents        (12)   │ ▣ Klassen              │
│ ▣ Navigation   Editor im R… (3)   ⌄  │          ··▣ Offen          (5)    │ ▣ Oberfläche           │
│ ◌ Berichte                           │ busy     ··▣ Überfällig     (2)    │ Nachschlagen  ← moves  │
│ ▣ Verträge                    (.5)   │ disabled heading 14/20 semibold, pad 12 · row-x · 4, no rule;
│   ◌ Wird geladen …                   │ lazy     indent n: padding-start = row pad + n × step (md 16 + 32n)
└──────────────────────────────────────┘          360: 1 column (328 < 2 × 288 + 24)
Rail (56): spinner / icon in the 22 box at x 28; hint hidden; kit tooltip below the item, the label tooltip right (CSS, as today)
Tabs, links, 360, DE: [Übersicht][Kostenstellen][Leistungsverrechnung][Ände…→   list scrolls (328); current tab scrolled in
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Sidenav hint | `flex: 0 1000 auto; min-width: 3em`; nowrap ellipsis; `text-align: end`. With a hint the label is `flex: 1 1 auto` (class `--hint`), so the hint shrinks first. Badge and chevron `flex-shrink: 0` as today. At 360: Kostenstellen + Rich Client + badge fit (201 ≤ 212); with a chevron the hint shrinks to 43 | 12 px / 400 | `--lc-sidenav-section-fg` at rest; the item ink on hover and when current |
| Busy spinner | `lc-spinner size="xs"` (16) `aria-hidden`, centred in the icon box (20; rail 22; list avatar 40, whose fill and content give way). Rows without an icon or avatar: before the label (the label moves 28 / 24 px while busy). Sidenav arc `currentColor`, track 30 % `currentColor` (`::ng-deep` on `.spinner__circle`) | — | list: lc-spinner's own tokens |
| Lazy loading row | a child-item box (min-h 44, the item padding); spinner on the icon column, text at the label x | 14 px | `--lc-sidenav-section-fg` |
| Disabled content | `opacity: .5` on icon, label, hint, badge (list: the row's children), not on the control, so the ring keeps full contrast. No hover fill; cursor `not-allowed` (busy: `progress`) | — | — |
| Muted item | label and icon in section-fg, weight 400 at rest | 14 px | `--lc-sidenav-section-fg` |
| Brand subtitle | under the name, one line each (ellipsis); block height unchanged (64 for md) | 12 px | name `--lc-sidenav-fg-active`, subtitle section-fg |
| List heading item | `div[role=listitem].lc-list__heading-item > hN.lc-list__heading`; padding `--spacing-3` · row inline padding · `--spacing-1`; no divider, no hover; 36 px | 14/20 semibold | `--color-text-secondary` |
| List columns | `.lc-list--columns { display: block; column-width: hook; column-gap: hook }`; rows `break-inside: avoid`; headings `break-after: avoid` (prototype: Chromium keeps the heading with its first row with fixed and with balanced fill; Firefox ignores it, a known limit); card variant: `margin-bottom: .5rem` instead of the flex gap | — | — |
| Tabs list (horizontal, both modes) | `overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: thin`; tab ring `outline-offset: -2px`. The current or selected tab is scrolled fully into view after the first render and when it changes, by setting `scrollLeft` only (never `scrollIntoView`, which would scroll the page) | as today | `--color-primary-500` ring |

## 4. States

| Part | States |
|---|---|
| Split button | rest · hover (each part on its own: the lc-button look) · focus-visible (own ring per part, raised `z-index: 1` so the 2 px offset ring draws over the neighbour) · active · disabled (both parts native `disabled`) · loading (face spinner; caret 50 %, `aria-disabled`, no spinner, Enter/Space/click ignored) · menu open (`aria-expanded="true"`) · disabled item (lc-menu) · long DE face label wraps, caret stretches · no items: caret `disabled`. |
| Button row | rest/hover/active: no fill (row container paints); focus-visible inset ring; disabled/loading 50 % as today; long text wraps start-aligned. |
| Outline | rest ground = token; hover/active unchanged (primary-600 fill, brightness .92); tone primary on the same ground. |
| Card heading target | hover/active = link card look; focus ring on the card; selected as today; truncation with badge: badge never shrinks; 200 % text still one line. |
| Page-header aside | empty → `display: none` (no gap); hook 1 + no actions → aside still on its own line. |
| Modal top | grows → top fixed, bottom moves; taller than max-h → body scrolls; soft keyboard shrinks `dvh` → body scrolls. |
| Stat-trend | label and icon both missing → no header element, value row at top. |
| Badge icon | with dot: dot, icon, label; `wrap`: icon on the first line. |
| Row states (sidenav, list) | **busy:** spinner (§3), `aria-busy="true"` and `aria-disabled="true"`; click, Enter and Space are ignored (no `itemClicked`/`itemClick`/`linkClick`, no navigation); focus stays on the same element (never swap the element on toggle); the list row's built-in action gets `loading`. **disabled:** dimmed content, no hover, not activatable; focusable only with a `disabledReason` (else `tabindex="-1"`, the list as in 3.43). **busy + disabled:** disabled's tab rule and dim apply, and the spinner shows. **tooltip:** on hover anywhere on the row and on keyboard focus, Escape hides it; text = reason or tooltip, then " · " and the badge tooltip; `tooltipPosition` is sidenav `right` (rail `bottom`, clear of the CSS label tooltip) and list `top` (it flips when there is no room). |
| Sidenav | action item: hover, focus and current look as a link item; the drawer closes on a phone, as for links. Lazy group: closed → chevron, `aria-expanded="false"`; open + `childrenLoading` → loading row and `aria-busy`; open, no children, not loading → nothing below; children arrive → rendered, focus unchanged. Hint: long German text ellipsis plus `title`; hidden on the rail. Muted: quieter at rest, normal on hover and current. Context menu: one event, nothing prevented. |
| List | heading: label only (other fields ignored), no hover, focus or divider, wraps with `hyphens` in the page `lang`. Columns: rows whole; a heading never ends a column (Chromium, Safari). Indent: hover, divider and ring stay full width. Plain row with a tooltip: `tabindex="0"`. |
| Tabs `links` | current set by the app (click → navigation only); hover and focus as tabs; disabled: `aria-disabled`, no `href`, not focusable, skipped by the arrows; no current: the tab stop is on the first enabled tab; many tabs: the list scrolls, the current one in view. |

## 5. Theming

| Element | Light | Dark | Contrast (computed, WCAG) |
|---|---|---|---|
| Outline ground `--color-primary-wash` | 6 % `-400` = composite (248,252,252) on white | 6 % `-500` = (17,29,38) on bg, (23,38,48) on surface | text-primary 17.12 · 15.71 / 14.17; tone-primary ink 8.81 · 12.58 |
| Row ring (inset) | `--color-primary-500` #208497 | #84c7d4 | 4.37 on white · 9.95 bg / 9.13 surface |
| Brand tile / icon | `-400 → -600` | `-500 → -300` (same colours) | icon #fff on #1a6a79 6.21 |
| Subtle tile / icon | `--color-brand-tile-subtle`, ink `-500` | same render | icon (graphic) 3.67 · 7.83 |
| Header ancestor demo | `--lc-header-bg: linear-gradient(90deg, var(--color-primary-fill-active), var(--color-primary-fill))`, fg/fg-secondary/trigger-fg `var(--color-on-primary)`, border transparent | same tokens (fill steps don't flip) | #fff on #0d353d 13.18 → on #1a6a79 6.21 |
| Split parts, badge icon, overline | existing lc-button / badge ink / `--color-overline` values | same | unchanged (overline 7.85 / 7.27 per colors.mdx) |
| Sidenav hint, muted label, brand subtitle, loading text (rest) | section-fg: auto #5c6672 on #f9fafb **5.58** (hover 5.30, current 5.02); `theme="light"` #6b7280 on #fff **4.83**; transparent on page 5.84 | #93a4ad on #070e15 **7.53** (hover 6.91, current 5.81, `theme="dark"` current 6.76); transparent 7.31, current 5.58 | `theme="light"` hover 4.39 and current 4.49 would fail, so on hover and when current the hint takes the item ink: #111827 / #144f5b (current 7.85 auto L, 9.37 auto D) |
| Sidenav busy spinner | arc = item ink: #4b5563 on #f9fafb 7.23 | #c4d2d9 on #070e15 12.53 | graphic ≥ 3 on any rail hook, because it follows the item's fg |
| List busy spinner | lc-spinner xs arc #1a6a79 on #fff **6.21** (selected #f0f8fa 5.77) | #a3d5df on #101c26 **10.81** | graphic ≥ 3 |
| List heading | `--color-text-secondary` #4b5563 on #fff **7.56** | #c4d2d9 on #101c26 **11.16** | text |
| Tabs (both modes) | as today: selected ink #144f5b on #fff 9.13; inset ring #208497 on #fff 4.37 | ring #84c7d4 on #0a121b 9.95 | ring ≥ 3 |
| Disabled rows | content at .5 (inactive control, 1.4.3 exempt); the ring at full contrast | same | — |

**Forced colours (rows 11, 14, 20):** disabled content `color: GrayText; opacity: 1`. The spinner keeps lc-spinner's GrayText/CanvasText rule (the sidenav's `currentColor` arc is a colour, so it is forced). The tooltip, hint and heading take system text colours. Link-mode tabs are links, so their ink is LinkText and the selected underline is a border (CanvasText). The current action item keeps the existing `outline: 1px solid Highlight` rule.

**Story scope (AC-12, AC-21):** `.story-accent` re-points `--color-primary-300…600` to `color-mix(in srgb, var(--color-accent-violet) 45/65/85/100 %, white)`, then copies the light declarations of `--color-primary-wash`, `--color-brand-tile-subtle`, `--gradient-brand-tile` and `--shadow-brand-glow` verbatim. Expected light outline ground: 6 % of the violet 400 step. **Forced colours:** the split parts get `border-color: ButtonText` (filled parts have transparent borders), and the card's `:has` ring keeps its `Highlight` rule (pitfall 037 r1). The row ring and the face/caret rings are the elements' own outlines (Highlight). Tile tokens are backgrounds (dropped).

## 6. Accessibility

- **Split button:** `role="group"` around two native buttons and two tab stops. The caret is named by `menuAriaLabel` and has `aria-haspopup="menu"` and `[attr.aria-expanded]` **in the template** (present in prerendered HTML; lc-menu then writes the same values) plus `aria-controls` while open. Enter, Space and ArrowDown on the caret open the menu with its first item focused, ArrowUp too (lc-menu has no "focus last"). Escape and Tab close it (lc-menu); after an item the menu closes and focus returns to the caret. Targets: caret ≥ 36 × 35.5 (sm), 44 × 42 (md), 48 × 48.5 (lg); the face as lc-button. The kit's sm/md button rule; ≥ 24 px everywhere (2.5.8).
- **Card heading target:** no `role`/`tabindex` on the card div (role `article`), `aria-label` names the button (must contain the title, 2.5.3). Nested controls are lifted with the existing `:where(.card-linked …)` rule. `getByRole('heading')` finds the title.
- **Page-header aside:** outside `h1`–`h3`, so the heading's name = title (+ `badge`). With the hook at 1 the visual order is title → actions → aside and DOM order is title → aside → actions: the aside should hold no focusable content (chips, `role="status"`) — documented.
- **Search input:** combobox attributes on the `<input>`; ArrowUp/Down/Enter/Escape stay the page's, through the host's bubbling `keydown`. Note in the JSDoc: `type="search"` clears on Escape unless the page calls `preventDefault()`.
- **Modal:** `defaultPrevented` on handled keys; an Escape inside a search field no longer clears the field before the modal closes. `placement="top"` respects reduced motion (no transform animation).
- **Row shape:** inset ring (`outline-offset: -2px`) is not clipped by a row's `overflow: hidden`; min-height 44 by default.
- **Access keys:** forwarded only. Docs: avoid letters taken by the browser or a screen reader, and pair with `ariaKeyShortcuts` for announcement.
- **Badge icon / stat-trend / header:** the icon is decorative (`[decorative]="true"`). Removing the header doesn't change the AX tree. The modal covers the header (it is inert under the veil anyway through `aria-modal`).
- **Tabs `links` (AC-2):** `div[role=tablist]` (with `aria-orientation`) containing `a[role=tab]`, each with `aria-selected` from `current`, `aria-controls` = `panelId`, and `id` = `tabId`. The app wraps its outlet in `<div role="tabpanel" [id]="panelId" [attr.aria-labelledby]="currentTabId">` (story and JSDoc). Keys: ←/→ (↑/↓ vertical), Home and End move focus only, skipping disabled tabs and wrapping; Enter follows the link natively; Space calls `click()` with `preventDefault` (no page scroll). Tab stop: `tabindex="0"` on the current tab (or the first enabled one), and on the focused tab while focus is inside the list; on `focusout` from the list it returns to the current tab. Prerendered HTML already carries `aria-selected` and the `href`.
- **Sidenav (AC-3…7):** action items are native buttons in the nav list, so Enter and Space work, and the name comes from the content, as for links. The current action item has `aria-current="page"`. The name of a busy item is label, hint, badge text, then `busyLabel`, from hidden text after a `&ngsp;` (pitfall 015). The disabled `aria-disabled="true"` item gets `tabindex="-1"` when it has no reason. The reason (tooltip) describes the item on focus. A lazy group keeps `aria-expanded`. While loading, its children container has `aria-busy="true"` and the loading row is plain text. The app announces "loaded" in its own `role="status"` (precedent: 063 lazy rows). The hint is in the name after the label and is hidden on the rail (`display: none`, so the rail name is as today). `iconUrl` images get `alt=""`. The brand subtitle joins the link name after a `&ngsp;`; `brandAriaLabel` still wins. Context menu: keyboard users trigger it with Shift+F10 or the Menu key on the focused item. iOS fires no `contextmenu`, so pair it with the item's `action` button (documented).
- **List (AC-15):** a heading `hN` inside `role="listitem"` keeps axe `aria-required-children` and `listitem` passing, and keeps one DOM child per item (`focusItem` indexing). Screen readers count the headings as items, which is accepted. Plain rows with a tooltip or reason get `tabindex="0"`. The busy text is hidden text in the content, or appended to the computed `aria-label` (split rows, `ariaLabel`). An `lcListItem` template draws its own spinner and text; the row still gets `aria-busy`, the tooltip and the blocking. Column reading order = DOM order (down each column).
- **Targets and motion:** sidenav items and list link rows ≥ 44 as today. Tabs stay 39 px high, as today (≥ 24, 2.5.8). Spinners use lc-spinner's reduced-motion rule. The tab list never scrolls smoothly.

## 7. Texts

| Key / input | EN default | DE (checked at 360) |
|---|---|---|
| `lc-split-button` `menuAriaLabel` | More actions | Weitere Aktionen |
| Story strings (split) | Save · Save as … · Save as template · Discard | Speichern · Speichern unter … · Als Vorlage speichern · Verwerfen |
| Story strings (page-header, card) | — | „Rechnungsübersicht", „Entwurf", „Geändert", „Teilen", „Neu"; card „Rechnungsübersicht Januar bis Dezember" |
| `busyLabel` (sidenav, list) | Loading | Wird geladen |
| `childrenLoadingLabel` (sidenav) | Loading… | Wird geladen … |
| Sidenav DE stories (also `ariaLabel` „Bereiche“, `closeAriaLabel` „Navigation schließen“, `expandAriaLabel` „Navigation ausklappen“, `collapseAriaLabel` „Navigation einklappen“) | — | items Kostenstellen, Leistungsverrechnung, Navigation, Darstellungen, Verträge, Berichte; hints „Rich Client“, „kein Recht“, „Editor im Rich Client“; reason „Kein Recht für diesen Bereich“; brand „USM X“ / „Customizing“, letter „X“ |
| List DE stories | — | headings „Arbeit“, „Customizing“, „Nachschlagen“; tooltip „Zuletzt geladen heute, 06:00“; badge tooltip „12 offen, davon 3 überfällig“; reason „Planwerte erst ab 1. Dezember“ |
| Tabs DE story | — | Übersicht, Kostenstellen, Leistungsverrechnung, Änderungsverlauf, Anhänge; panel text „Inhalt: ‹Tab›“ |

## 8. Stories

All new stories bind every arg or use `controls.include` (pitfall 055 r1); DE stories set `lang="de"` and list every visible string.

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Hooks On An Ancestor | `navigation-header--hooks-on-an-ancestor` | hooks of §5 on a wrapper | AC-1 inheritance, gradient |
| Under A Modal | `navigation-header--under-a-modal` | header + open md modal as siblings | AC-1 layering |
| Title Aside | `layout-page-header--title-aside` | DE, chips + `role="status"` in aside | AC-9 |
| Aside Wrap Order | `layout-page-header--aside-wrap-order` | container query band of §3, DE | AC-11 at 360/768/1280 |
| Overline And Title Hooks | `layout-page-header--overline-and-title-hooks` | overline colour, title size 20/32 px | AC-8, AC-10 |
| Scoped Accent Tiles | `components-card--scoped-accent-tiles` | brand + subtle tiles, default and `.story-accent` | AC-12 |
| Divider Hook And No Body | `components-card--divider-hook-and-no-body` | hook set; titled card without body | AC-13 |
| Dense Collapsible Head | `components-card--dense-collapsible-head` | `headerSize="sm"`, collapsible, open/closed | AC-14 |
| Clickable Heading | `components-card--clickable-heading` | `clickTarget="heading"`, `truncateTitle`, DE | AC-20 |
| Combobox | `form-search-input--combobox` | listbox, ArrowDown moves `aria-activedescendant` | AC-16 |
| Top Placement | `feedback-modal--top-placement` | open, md, "Add results" button grows the body | AC-18 |
| Without Header | `charts-stat-trend--without-header` | value + change only | AC-19 |
| Outline In A Scoped Accent | `components-button--outline-in-a-scoped-accent` | neutral + primary tone, default and `.story-accent` | AC-21 |
| Row Shape | `components-button--row-shape` | three rows in a bordered list, one focused, one disabled | AC-22 |
| Access Keys | `components-button--access-keys` | `accessKey="s"`, `ariaKeyShortcuts="Alt+Shift+S"` | AC-24 |
| With Icon | `data-display-badge--with-icon` | xs–lg, dot+icon, wrap, gap hook on an ancestor | AC-23 |
| Default · Variants And Sizes · States · German · Menu Open | `components-split-button--default`, `--variants-and-sizes`, `--states`, `--german`, `--menu-open` | §2 inputs; states: disabled, loading, disabled item | AC-25 |
| Router Links | `navigation-tabs--router-links` | `mode="links"`, own router (`withHashLocation`, as *Router-matched*); 4 tabs `route="."` + `?tab=`; the story reads `?tab=` and sets `current` (default: the first); panel `div[role=tabpanel]` | AC-2 at 360/1280, keys |
| Router Links (German) | `navigation-tabs--router-links-german` | `lang="de"`, the 5 DE tabs of §7; default current „Änderungsverlauf“ (off-screen at 360 before the scroll-in) | AC-2 DE, scroll, current in view |
| Action Items | `navigation-sidenav--action-items` | docked, `isOpen` (drawer at 360); 2 links + 3 `kind: 'action'` items, one `current`, one `busy` | AC-3, AC-4 (drawer and docked) |
| Collapsed Rail States | `navigation-sidenav--collapsed-rail-states` | `collapsed`, frame `overflow: visible`; busy, disabled with reason, hint, badge „56/60“ | AC-4, AC-6, AC-7 on the rail |
| Lazy Children | `navigation-sidenav--lazy-children` | group A open with `childrenLoading`; group B closed, `expandRequested` adds 3 children after 600 ms | AC-5 |
| Hints And Reasons (German) | `navigation-sidenav--hints-and-reasons-german` | §7 DE strings, docked `isOpen` (drawer at 360); hints with badge and chevron, 2 disabled with reason, 1 muted | AC-6, AC-7 (widths), AC-32 muted |
| Area Rail (German) | `navigation-sidenav--area-rail-german` | `theme="dark"`, `brandName` „USM X“ + `brandSubtitle` + `brandLetter`; sections; `matchRoutes` (current through an extra route); tooltips; one `iconUrl` (data-URI SVG) | AC-32 |
| Counts And Context Menu | `navigation-sidenav--counts-and-context-menu` | badge „56/60“ with `ariaLabel` „56 of 60 loaded“ and tooltip; `itemContextMenu` writes to a `role=status` line | AC-32 |
| Busy Rows | `data-display-list--busy-rows` | clickable list: icon, avatar, action and no-leading rows busy; link list: one busy `href` row | AC-15 busy |
| Tooltips And Reasons | `data-display-list--tooltips-and-reasons` | `lang="de"`; `tooltip`, `badgeTooltip`, disabled + `disabledReason` in a clickable, a link and a plain list | AC-15 tooltips |
| Headings In Columns | `data-display-list--headings-in-columns` | `lang="de"`, `multiColumn`, 3 headings, 14 link rows with badges, dividers; no `max-width` wrapper | AC-15 headings, columns (1 col at 360, 4 at 1280) |
| Indented Rows | `data-display-list--indented-rows` | indent 0–3, `showDividers`, `clickable`, sm / md / lg side by side, one indented heading | AC-15 indent |

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| AC-1 | unit (computed style on a wrapper value); *Hooks On An Ancestor* + *Under A Modal* 360/1280 `getComputedStyle`, `elementFromPoint(header centre)` | bg = gradient, fg #fff; header z 900; point → `.lc-modal-backdrop`; the 184 baseline header/app-shell shots identical |
| AC-8/10 | computed style | overline = hook; title 24 px default, = hook when set (all 7 sizes) |
| AC-9 | unit: accessible name of `h1` | = title only; aside chips outside the heading |
| AC-11 | *Aside Wrap Order* 360/768/1280 rects | 1280 one line; 768 aside top ≥ actions bottom, actions top = h1 row; DE title |
| AC-12 | sample tile pixels default vs baseline; `.story-accent` | default within 1 RGB step (none expected); accent tile = violet |
| AC-13 | computed style | rules = hook; body-less head: border 0, mb 0, pb 0 |
| AC-14 | `elementFromPoint` scan over the sm head | visible ≥ 32; hit area 44 |
| AC-16 | unit | attributes on `<input>` only when set |
| AC-17 | unit: event flags | `defaultPrevented` on Escape and on Enter/Space at ×; no page listener call |
| AC-18 | *Top Placement* rects before/after "Add results" (also `--height=640` at 360) | top 90 (900 high) / 64 (640 high), unchanged after growing; bottom ≤ vh − 16; no clipping at 360 |
| AC-19 | unit + *Without Header* height | no header element; height = row height |
| AC-20 | unit `getByRole('heading')`, one tab stop, one emit; 360 DE shot | title one line, `title` attr = full |
| AC-21 | grep (no literal in `.btn-outline`); pixel default (248,252,252) / (17,29,38); accent | identical to baseline; accent violet |
| AC-22 | computed style + focus shot | radius 10, ring offset −2, contrast as §5 |
| AC-23 | unit + rects | icon 1em, gap 5.6 px (md); decorative |
| AC-24 | unit | attributes forwarded, none when empty |
| AC-25 | unit + stories 360/1280 L/D, keyboard play, `--axe`, `--forced-colors` | caret h = face h ±0.5; 0 axe violations; FC borders visible |
| AC-26–31 | build, manifest test, compat, changelog/docs review | new entry in both READMEs and `EXPECT_IN_HTML` (`lc-split-button`, `aria-haspopup="menu"`) |
| AC-2 | unit (tabs): `links` renders `a[role=tab]` with `href`, `aria-selected` only on `current`, `aria-controls` = `panelId`, no kit `tabpanel`; click, ←/→ change no `aria-selected` and emit no `selectedIndexChange`; Space clicks; tab stop rule. Stories 360/1280 L, `--axe`, plus compat `EXPECT_IN_HTML` (`role="tab"` + `aria-selected="true"` + `href="…?tab=…"`) | DE at 360: list `scrollWidth` > 328, page `scrollWidth` 360; current tab rect inside the list rect; 0 axe violations |
| AC-3 | unit (sidenav) | `kind: 'action'` → `button.lc-sidenav__nav-item`, no `href`; one `itemClicked` per click; `current` → `aria-current="page"` on it alone; route items' specs unchanged |
| AC-4 | unit + *Action Items* 360/1280, *Collapsed Rail States* | `aria-busy`/`aria-disabled` `"true"`; spinner, no icon; click/Enter → 0 emits, `router.navigateByUrl` not called; `activeElement` unchanged after toggling `busy`; name ends „Wird geladen“; item rect identical busy vs idle (±0) |
| AC-5 | unit + *Lazy Children* | lazy group `aria-expanded="false"` + chevron; open → `"true"`, one `expandRequested`; `childrenLoading` → `[aria-busy=true]` children container with a loading row; children added → rendered, focus on the group button |
| AC-6 | unit + *Hints And Reasons (German)* at 360 | disabled + reason: `aria-disabled`, tabbable, 0 emits; focus → tooltip with the reason, `aria-describedby` = its id; without reason `tabindex="-1"` |
| AC-7 | story rects 360 drawer / 1280, rail, contrast §5 | hint right ≤ badge left − 12; badge and chevron right ≤ item right − 10; hint `scrollWidth` > `clientWidth` only when truncated; rail hint `display: none`; rest contrast ≥ 4.83 |
| AC-15 | unit (list) + 4 stories 360/1280 L/D, `--axe` | busy: as AC-4 for list rows (no `itemClick`/`linkClick`); tooltip on the focus target; heading `hN` in `role=listitem`, no control; indent padding = pad + n × 28/32/36; columns: 1280 → 4 distinct column x, each heading x = its next row x; 360 → 1 column; 0 axe violations |
| AC-32 | unit per built item + *Area Rail (German)*, *Counts And Context Menu* | `matchRoutes` current; `img[alt=""]` 20 px; muted ink = section-fg; badge name „Incidents 56 of 60 loaded“; one `itemContextMenu` per `contextmenu`; brand name „USM X Customizing“, tile „X“ |
| AC-31 (rows 11/14/20) | `--compare=tmp/story-shots/064/baseline` | sidenav, placeholder, list and tabs stories identical, except `navigation-tabs--with-badges` 360 (and any focused-tab shot) and the known flaky sidenav shots |

**AC-32 decision.** Built: several routes (`matchRoutes`), image icons (`iconUrl`), badge with two numbers (`badge.ariaLabel`) and a tooltip, per-item tooltip (shared model), a context-menu hook (`itemContextMenu`), dimmed but clickable (`muted`), and a brand second line and chosen letter. **Left out, back in BACKLOG as 064-n2:** *foldable sections*, which are a disclosure model for section headings that no requester screen uses yet. *Deeper children*, which need a recursive item template and tree semantics; `lc-tree-view` is the deep-tree component. *Long press on iOS*, where Safari fires no `contextmenu`, so a timer-based press would fight scrolling.

**Baselines (rows 11/14/20):** 252 shots (sidenav 26 and placeholder 5 stories, list 26, tabs 6; 360/1280 × L/D) were added to `tmp/story-shots/064/baseline`, which now holds 888. They were taken from the 19:24 build of the working tree, so they include the branch's partial header, page-header and theme work. The `main` baseline of header and app-shell covers that work.

**Risks (rows 11/14/20):** `lib/i18n-labels.spec.ts` may list label inputs (048: grep `src/lib`). `check-angular-majors.mjs` l. 593–596 reads the sidenav badge's hidden text. Two outerHTML comparisons compare the same build (`sidenav.return-focus`, `list.chevron` strips comments). `lcTooltip` brings CDK overlay into the list and sidenav entries (bundle fixture D: sidenav stays lazy). Story rails need `overflow: visible` for tooltips (019 r2). Opacity on a focus target dims its ring (021): dim the children instead. Ancestor `lang` for the tooltip (3.31). Known-flaky sidenav shots (memory: collapsed-vs-expanded 360 L, collapsed-rail-badges 360, drawer-mode 1280 D, sidebar-first 1024/1280).

**Risks (pitfalls):** innerHTML pins (058, card/badge/stat-trend); `@if` anchors (045 r1); ancestor rings need FC `Highlight` (037 r1); `:where` lift for projected controls (037 r1); color-mix reads are 0–1 floats in measures (034); compute hook demos in both themes (060 r1); header layering of the existing app-shell/sidenav stories: compare against `tmp/story-shots/064/baseline` (632 shots, 360/1280 × L/D: button, badge, card, stat-trend, search-input, pipeline, header, page-header, modal, app-shell without its 5 unstable stories: today-loading, full-height-nav(-horizon), toasts-in-the-shell(-large-text)).
