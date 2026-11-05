# Design 050: Overlay panel language (select, tooltip); lc-bottom-nav `moreBadge`, lc-sidenav `badgeAriaLabel`

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-16 (AC-8/AC-9 default amended by D-1)
- **Measured on:** main b911ab0 (3.30.2), Storybook rebuilt 2026-11-05. Logs and measures in `tmp/story-shots/050/`.

## 1. Approach

Extend; no new component, no CSS rule, no token. Each change follows an existing pattern:

| Part | Change | Pattern |
|---|---|---|
| `lc-select` | `.lc-select__dropdown` gets `[attr.lang]="panelLang()"`, `panelLang = computed(() => this.isOpen() ? closestLang(this.host.nativeElement) : null)` (inject the host `ElementRef`) | 049 combobox: same helper, read at every opening |
| `lcTooltip` | in `show()`, right after the `id`: `const lang = closestLang(this.elementRef.nativeElement); if (lang !== null) this.renderer.setAttribute(tooltipEl, 'lang', lang);` on the `lc-tooltip-content` host (`role="tooltip"`, the `aria-describedby` target) | spec assumption 5; the element is destroyed on hide, so the attribute goes with it |
| `lc-menu`, `lc-popover` | none, test only (AC-4) | panels are inline descendants of the host |
| `lc-bottom-nav` | input `moreBadge`; the internal More item gets `badge: this.moreBadge() ?? undefined` | the item template already renders `badge` + `badgeText()`, so More gets identical markup, classes and hidden text by construction (AC-5, AC-6) |
| `lc-sidenav` | input `badgeAriaLabel`; at every badge site the `lc-badge` gets `aria-hidden="true"`, followed by `&ngsp;<span class="lc-sidenav__sr-only">{{ badgeText(item) }}</span>` | bottom-nav `badgeText()`; the sidenav's own `.lc-sidenav__sr-only` (brand name on the rail); `&ngsp;` for the word break (015) |

**D-1, sidenav default `'{value}'`** (spec AC-8/AC-9 say `'{value} new'`). Today the expanded badged items are named "Tasks 12", "Messages New" (measured, Chromium + dom-accessibility-api). `'{value}'` keeps exactly these names, which is what the spec's Semver line ("defaults render as before"), AC-14 and the requester (row 2: "default `{value}`, so the kit reads as today") ask for. `'{value} new'` would rename every consumer's items, in English on German pages, and read text badges twice ("Messages New new"). The bottom-nav keeps its existing `'{value} new'`.

**D-2, collapsed rail.** Labels are `display: none` on the rail, so a badged rail item is named by its count alone today: "3", with the label only as description (from `title`). Measured at 1024 L/D in *Collapsed with Groups*, *Collapsed Rail — Badges* and *Sidebar-First (Collapsed)*. On the rail the hidden text starts with the label: `isRail()` (= `collapsed && !isMobile`, the same condition as `.lc-sidenav--collapsed`) → "Agent Runs 3", "Offene Zuordnungen 12 offen". `title` stays (it feeds the CSS tooltip `content: attr(title)`), so it also stays the description (L-1). Unbadged rail items are unchanged.

**D-3.** The span is rendered whenever the item has a badge; `badgeAriaLabel=''` silences the badge (the rail still reads the label). **D-4.** `export interface BottomNavBadge`; `BottomNavItem.badge?: BottomNavBadge` (same structure, no break). **D-5.** No summing (AC-7): More shows `moreBadge` only.

Sidenav badge sites in `sidenav.component.html` (3.30.2 lines). The spec counts five, but there are **six**: 175 section child with children (`button`), 203 grandchild (`a`), 224 section child (`a`), 257 top-level parent (`button`), 283 child of a top-level parent (`a`), 302 simple item (`a`). On the rail, 175, 224, 257 and 302 show; 203 and 283 sit in the hidden `.lc-sidenav__nav-children`. Markup, inline at each site (no shared `ng-template`, so no extra anchors):

```html
<span class="lc-sidenav__nav-label">{{ item.label }}</span>
@if (item.badge) {
  <lc-badge aria-hidden="true" [variant]="item.badge.variant || 'default'" size="xs" [rounded]="true" class="lc-sidenav__nav-badge">{{ item.badge.value }}</lc-badge>&ngsp;<span class="lc-sidenav__sr-only">{{ badgeText(item) }}</span>
}
```

```ts
/** Visually hidden badge text: `badgeAriaLabel` with `{value}`; on the rail, where labels are hidden, after the label. */
protected badgeText(item: NavigationItem): string {
  if (!item.badge) return '';
  const text = this.badgeAriaLabel().replace('{value}', String(item.badge.value));
  return this.isRail() ? `${item.label} ${text}` : text;
}
```

On parent buttons the chevron stays last. SSR: `isMobile` is false on the server, so the span is in the server HTML (AC-13). The select panel and the tooltip are never rendered on the server.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (bottom-nav) | `moreBadge` | `BottomNavBadge \| null \| undefined` | `null` | Badge on the "More" entry (on overflow or with `showMore`), e.g. the open tasks on the pages behind it: drawn like an item badge and read after the label through `badgeAriaLabel`. The kit doesn't add up the hidden destinations' badges; pass the value to show. It sits on the bar's last entry, so keep it to two characters (`'9+'`). `null` or `undefined`: no badge. `@default null` |
| JSDoc (bottom-nav) | `badgeAriaLabel` | `string` | `'{value} new'` | Text read after an item's label, and after the "More" label with `moreBadge`, when it has a badge; `{value}` is replaced with the badge value (e.g. "3 new"). `@default '{value} new'` (the `@default` was missing) |
| type (bottom-nav) | `BottomNavBadge` | `{ value: string \| number; variant?: BadgeVariant }` | — | A count or status on a bottom-nav entry (`BottomNavItem.badge`, `moreBadge`). Field JSDoc as today; `BadgeVariant` from `@lifecorner/angular-ui-kit/badge` |
| input (sidenav) | `badgeAriaLabel` | `string` | `'{value}'` | Text read after an item's label when it has a badge, at every level. On the collapsed rail, where labels are hidden, the label and this text name the item. `{value}` is replaced with the badge value, e.g. `'{value} offen'` → "Stammdaten 1 offen". The badge itself is hidden from screen readers. Empty: the badge isn't read. `@default '{value}'` |
| JSDoc | `SelectComponent`, `TooltipDirective` class docs | — | — | append: "The dropdown (the tooltip) takes the `lang` of the host's closest `[lang]` (3.31)." |

No slot, CSS hook or new token; select and tooltip get no input (spec constraint). **Default rendering unchanged:** `moreBadge` null adds nothing. The sidenav DOM is shown in the prototype (§9): `aria-hidden`, the space and the span on badged items: 36 of 42 at-rest shots identical, and the other 6 are proven two-state flakes (an unchanged re-shoot gave the same bytes). The panel `lang` equals `<html lang="en">` in every existing story: the opened shots are identical with `lang` set (control, §9).

## 3. Anatomy and layout

No box, spacing, type or colour changes. The hidden span is `position: absolute`, 1 × 1 and clipped, so it is out of the flex flow (no `gap`, no width); the `&ngsp;` text node is whitespace in a flex container and is not rendered.

### 360 px

```
More Badge (German, floating): frame 360 × 260, bar 326 × 74, 3 entries 102.7 × 64
┌────────────────────────────────────────────────┐
│   [◫ Cockpit]      [◫ Kosten]      [ ⋯ ⁽¹⁾ ]     │  pill 56 × 32, +6 from the entry top
│                                     Mehr        │  label 12/16, 500
└────────────────────────────────────────────────┘
badge (.lc-bottom-nav__badge > lc-badge xs rounded): left = pill centre + 6, top = pill top − 4
      "1"–"9" 21.7 × 24 box (inner 20 high) · "99+" 37.4 wide
<span .lc-bottom-nav__sr-only>1 offen</span> after the label (existing item markup)

Badge Accessible Name (German): rails in one row, 242 + 24 + 58 = 324 ≤ 328
┌ expanded, width 240 (item 223 × 44) ─┐   ┌ rail 56 ┐
│ ◫ Cockpit                             │   │  ◫      │  rail item 39 × 44
│ ◫ Offene Zuordnu…               ⁽12⁾  │   │  ◫⁽¹²⁾  │  badge 16 × 16 at (+19, +4);
│ ◫ Stammdaten               ⁽1⁾  ⌄     │   │  ◫⁽¹⁾   │  2 digits 17.5 at +17.5
│    ◫ Konten                  ⁽1⁾      │   │ ─────── │
│    ◫ Kostenstellen                    │   │  ◫⁽³⁾   │
│ BEREICHE                              │   │  ◫⁽²⁾   │
│ ◫ Finanzen                      ⁽3⁾   │   └─────────┘
│ ◫ Banken                   ⁽2⁾  ⌄     │
└───────────────────────────────────────┘
expanded badge: xs rounded, right edge 10 px inside the item ("12" 27.2 × 22)
label: flex 1, nowrap, ellipsis; beside "12" the label box is 132 px
```

### From 1024 px

Both stories render in fixed frames (phone frame 360, rails 240/56), so the 360 sketch holds at 1024 and 1280. The prototypes measured equal boxes at 360 and 1024, and the badged baseline stories measured equal ones at 1024 and 1280. Existing docked stories at 1024: item 303 × 44 (width 320), rail 39 × 44.

| Element | Size | Type | Token / source |
|---|---|---|---|
| sidenav hidden text | 1 × 1, clipped | — | `.lc-sidenav__sr-only` (existing) |
| bottom-nav hidden text | 1 × 1, clipped | — | `.lc-bottom-nav__sr-only` (existing) |
| More badge | as item badges | `lc-badge` xs rounded | `.lc-bottom-nav__badge` (existing) |

## 4. States

| State | Behaviour |
|---|---|
| default | names per §6; visuals as today |
| hover | unchanged; the rail tooltip still comes from `title` |
| focus-visible | ring on the item unchanged; one tab stop per item (the span is not focusable) |
| current | More current (hidden destination or `moreRoute`): badge over the pill; sidenav current: badge on the active fill |
| disabled, loading, empty, error | not states of nav items. Select disabled or loading: the panel never opens, so no `lang` is read |
| value `0` | shown ("0"), as item badges today; pass `null` to hide |
| `badgeAriaLabel=''` | badge silent; rail: the label only |
| drawer (< `mobileBreakpoint`) | labels visible, no prefix: "Kosten 1 offen". With `collapsed` the drawer keeps `title` (description, pre-existing) |
| overflow, long German label | "Offene Zuordnungen" beside "12" in the 240 rail: box 132 px, text 137.5 (140.4 at 600 when current), so it ends in an ellipsis with or without the span (AC-11). The full label stays in the name |
| overflow, wide More value | on a 5-entry bar at 360, "99+" ends 3.6 px past the floating bar's edge (in its 28 px corner) and 1.2 px past the docked bar. 1–2 characters stay inside (L-2). The same is true of item badges on the last entry today |
| select or tooltip open | `lang` = the host's closest `[lang]`, read at each opening or show; closed or hidden: no panel, no attribute |

## 5. Theming

No new token, no colour change. Badge text contrast, all six variants, measured (`badge-grid-measure.js`, 1024 L/D, 360 docked):

| Surface | Light min | Dark min |
|---|---|---|
| sidenav item, expanded (auto theme) | 4.85 (success) | 6.45 (warning) |
| sidenav current item | 4.85 | 4.85 (warning) |
| rail, auto or `theme="dark"` | 4.85 | 6.45 |
| bottom-nav bar, floating / docked | 4.85 | 5.18 / 5.55 (warning) |
| bottom-nav **current pill**, floating / docked | 4.85 | **4.03 / 4.26 warning, 4.49 success (floating)** |
| `theme="light"` rail on a dark page | — | **1.22–1.97** (badges follow the page) |

Pre-existing WCAG 1.4.3 failures, not fixed here because the spec scope is "no visual change to badges, pills or the rail". **F-1:** warning (and floating success) badge on the current bottom-nav pill in dark. FI hits this when „Stammdaten" behind „Mehr" is open. **F-2:** `theme="light"` rail on a dark page. The developer lists both in `build.md` → known limits. The new stories use passing pairs: EN More current with `primary` 5.79 D (docked) / 8.49 L; DE `warning` on the bar 5.52 L / 5.18 D.

## 6. Accessibility

| Item | Before (3.30.2, measured) | After |
|---|---|---|
| sidenav expanded, default | "Tasks 12" | "Tasks 12" (badge hidden, span "12") |
| sidenav expanded, `'{value} offen'` | — | "Offene Zuordnungen 12 offen" |
| sidenav rail | name "3", description "Agent Runs" | name "Agent Runs 3", description "Agent Runs" |
| bottom-nav More + `moreBadge`, `'{value} offen'` | "Mehr" | "Mehr 1 offen" |
| select panel, tooltip in `lang="de"` | `closest('[lang]')` = `html` `en` | `de` (on the panel root / tooltip element) |

- Semantics and roles unchanged. `aria-hidden="true"` on the sidenav `lc-badge` removes the double read; the bottom-nav badge is already inside the `aria-hidden` pill.
- 3.1.2: the panel's `lang` is the accessible object's language (049 §6). The select's search input and „Keine Treffer" are inside the panel, so they get it too.
- Keyboard and focus order unchanged; 44 px items unchanged. forced-colors: nothing visible is added. Reduced motion: nothing animates. Announcements: none (no live region; spec scope).
- **L-1:** a badged rail item keeps the label as its description too (`title`), so NVDA reads "Agent Runs 3, link, Agent Runs". Removing `title` would change the tooltip and the DOM rule of AC-9 (backlog).
- **F-3 (found, pre-existing, out of scope):** `lcTooltip` on `lc-button` (every tooltip story) never shows on keyboard focus. `focus` doesn't bubble from the inner `<button>` to the host, and `aria-describedby` lands on the host, not on the focused button. Measured in *Default* and *Toolbar*: focus → `.lc-tooltip` absent, both `aria-describedby` null. That fails WCAG 1.4.13 and 1.3.1 → queue (fix: `focusin`/`focusout`, describe the focusable element).

## 7. Texts

| Input | EN default | DE (stories) |
|---|---|---|
| sidenav `badgeAriaLabel` | `{value}` | `{value} offen` |
| bottom-nav `badgeAriaLabel` | `{value} new` | `{value} offen` |
| bottom-nav `moreLabel` | More | Mehr |
| select `placeholder`, `ariaLabel`, `searchPlaceholder`, `searchAriaLabel`, `noOptionsLabel`, `clearAriaLabel` | Select a country / Country / defaults | Land wählen / Land / Land suchen … / Land suchen / Keine Treffer / Auswahl löschen |
| tooltip text (consumer) | Save your current progress | Änderungen speichern, bevor du die Seite verlässt |

Checked at 360: "Mehr" fits (entries 102.7); the sidenav strings are hidden text; "Offene Zuordnungen" as in §4.

## 8. Stories

| Story | Expected ID | Args / template | Shows |
|---|---|---|---|
| Bottom-nav *More Badge* (new, after *With Badges*) | `navigation-bottom-nav--more-badge` | `phoneFrame` en, docked; items Today `sun` /, Contracts `file-text` /contracts with `badge {2, primary}`, Finances `wallet`, Documents `folder`, Calendar `calendar`, Household `home` /household; `activeRoute '/household'`, `moreRoute '/more'`, `moreBadge {value: 3, variant: 'primary'}`, `ariaLabel 'Main navigation'` | overflow: 4 + More (current, badge on the pill); names "Contracts 2 new", "More 3 new" |
| Bottom-nav *More Badge (German, floating)* | `navigation-bottom-nav--more-badge-german` | `phoneFrame(…, '16px', 'de')`; `showMore`; Cockpit `presentation-chart-line` /cockpit, Kosten `banknotes` /kosten; `moreLabel 'Mehr'`, `moreRoute '/mehr'`, `activeRoute '/kosten'`, `moreBadge {1, warning}`, `badgeAriaLabel '{value} offen'`, `ariaLabel 'Hauptnavigation'` | the FI bar; "Mehr 1 offen" |
| Sidenav *Badge Accessible Name (German)* (new, after *Collapsed Rail — Badges*) | `navigation-sidenav--badge-accessible-name-german` | `<div lang="de" style="display: flex; flex-wrap: wrap; gap: 24px;">` + `brandRail('badgeAriaLabel="{value} offen" ariaLabel="Hauptnavigation"', '240px', 'overflow: visible; position: relative; z-index: 2;')` + the same with `[collapsed]="true"` (z-index 1). Items: Cockpit; Offene Zuordnungen `clipboard-document-list` /zuordnungen {12, warning}; Stammdaten `folder` {1, warning} with children Konten `building-bank` /stammdaten/konten {1, warning} and Kostenstellen `calculator`; section Bereiche: Finanzen `wallet` /finanzen {3, primary}, Banken `building-bank` {2, error} with child Kontoauszüge `document-text` /banken/auszuege {2, error}. `activeRoute '/stammdaten/konten'` | all six sites (grandchild after a click on „Banken"), expanded and rail; no theme input (follows the page) |
| Select *Panel Language* (new, last) | `form-select--panel-language` | column, gap 16, max-width 400: EN field (`countryOptions`, §7 EN); `<div lang="de">` field with Deutschland, Österreich, Schweiz, Frankreich, Italien, Spanien, `searchable`, §7 DE strings. `play`: in story view, wait 50 ms, click `[lang="de"] lc-select [role="combobox"]` | DE panel `lang="de"`, EN panel `lang="en"` |
| Tooltip *Language* (new, last) | `feedback-tooltip--language` | `display: flex; gap: 24px; padding: 60px 16px`: EN `lc-button` "Save" with §7 EN text; `<div lang="de">` `lc-button` "Speichern", `tooltipPosition="bottom"`, §7 DE text. `play`: in story view, wait 50 ms, `mouseenter` on the DE host | tooltip `lang="de"` |

Each new story has a docs description with the request number. Update the docs too: bottom-nav argTypes `moreBadge` (`control: 'object'`, `table.defaultValue: 'null'`) and the `badgeAriaLabel` description (+ More); sidenav argType `badgeAriaLabel` (`'{value}'`) and its features bullet "Badges … read with `badgeAriaLabel`"; *With Badges* and *Collapsed Rail — Badges* descriptions get one sentence on the names (the canvas doesn't change).

## 9. Verification

Baselines (main b911ab0, don't open the shots). `050/baseline`: 23 sidenav + 12 bottom-nav stories at 360/1024/1280 L/D with `rest-measure.js` (800 ms, names, boxes, contrast), plus 10 select + 6 tooltip at 360/1280 L/D (800 ms wait), 274 shots. `050/baseline-open`: select Default, Searchable, Filled States and tooltip Default, Long Content opened with `open-measure.js` (P = ""), 360/1280 L/D, 20 shots. **Flaky** (byte-equal two-state flips in unchanged re-shoots, `stability/`): sidenav *Sidebar-First Layout* 1024/1280 L/D, *Sidebar-First (Prominent Brand)* 1024/1280 L, *Collapsed Rail — Badges* 360 L/D. Judge those by measure. Prototype: `proto-measure.js` (sidenav DOM injected): 42 shots of the 7 badged stories, identical except the flakes. `open-measure.js` with P = "en": identical; P = "de" changed only the glyph raster of tooltip *Default* (same box).

| AC | How | Expected value |
|---|---|---|
| AC-1, 2 | unit `select.panel-lang.spec.ts` (pattern `combobox.panel-lang.spec.ts`) | `de`, `fr-CH`; no wrapper → no attribute; closed → no `.lc-select__dropdown` |
| AC-3 | unit (tooltip spec): `show()` in `lang="de"` | `#<tooltipId>` has `lang="de"`; no wrapper → none; `hide()` → element gone |
| AC-4 | unit: open menu and popover in `lang="de"` | `closest('[lang]').lang === 'de'`, no code change |
| AC-5–7 | unit (bottom-nav): `moreBadge` on overflow and `showMore`; hidden items with badges | `.lc-bottom-nav__badge lc-badge` xs rounded inside the More pill; sr text "3 neu"; null → none; only the `moreBadge` value |
| AC-8 | unit per site (6) + rail (`collapsed`, jsdom `isMobile` false): sr span text, `lc-badge[aria-hidden="true"]` | expanded "12 offen"; rail "Offene Zuordnungen 12 offen"; default "12" |
| AC-9, 10 | review: `rest-measure.js` on all 35 nav stories, `--compare=050/baseline` | 210 identical but the flakes; heights 44 / rail 39 × 44, badge rects = baseline log; names as §6 (rail now "Agent Runs 3") |
| AC-11 | new DE story at 360: names (click „Banken" for the grandchild); label `clientWidth/scrollWidth` with and without the spans (remove them in the measure) | "Offene Zuordnungen 12 offen" …, "Kontoauszüge 2 offen"; widths equal |
| AC-12 | unit: `computeAccessibleName` + `tabIndex`; review: focus each item, read the ring | one tab stop; ring as today |
| AC-13 | `EXPECT_IN_HTML`: home.html bottom nav gets `[moreBadge]="{ value: 1, variant: 'warning' }" badgeAriaLabel="{value} offen"`; probe-314 Kosten gets `badge {1, warning}` + `badgeAriaLabel="{value} offen"` | `<span class="lc-bottom-nav__sr-only">1 offen</span>` in the `/mehr` link; `lc-badge aria-hidden="true"` then `<span class="lc-sidenav__sr-only">1 offen</span>` in the `/kosten` link |
| AC-14 | full suite; grepped: no spec pins the More item, sidenav badge attributes or item `textContent` of badged items | no edited assertion |
| AC-15 | review of the §8 stories at 360/1024/1280 L/D | names §6, panels `lang` |
| AC-16 | changelog | Added `moreBadge`, `BottomNavBadge`, sidenav `badgeAriaLabel`; Fixed 049-f1 (select, tooltip) and the rail name ("3" → "Agent Runs 3"); Compatibility: no break, D-1, panels carry `lang`; Known: L-1, L-2, F-1–F-3 |
