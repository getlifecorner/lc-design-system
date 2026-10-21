# Design 009: Signed-in shell at 200 % text on a phone

- **Status:** revised after review r1 (2026-10-21); baselines captured on `main` 5634b0b (§9)
- **Spec:** [spec.md](spec.md), AC-1 to AC-14

**Change notes (review r1, see review.md):**
1. Header: the `brand::after` rule is replaced by build.md Deviation 1 (zero-width `__spacer` always on row 1, title `margin-inline-end: −gap`, brand `max-width: calc(100% − gap)`). Same wrap threshold; the `::after` broke WithLongTitle and LogoSizes.
2. AC-3/AC-10 expectations (§9) were wrong: 8 shots change on purpose. FullFeatured and TranslatedLabels at 360 wrap (3.10.0 ran "LifeCorner" into the theme toggle), and LazySideNavigation EN/DE at 360 get +12 px land under an 84 px bar.
3. The §9 cause hypothesis was wrong. The items were never content-sized. AS-31's +19/+59 px is page-wide overflow on the app side (T387).
4. Bar (missing from r0): item content is **top-aligned** so that all pills sit on one line, and labels keep a **4 px gutter** from 150 % text on. Both rows are in §3.

## 1. Approach

Extend three components. No new input, output, slot or public hook, so I recommend a **patch (3.10.1)**.

| Part | Mechanism | Why |
|---|---|---|
| `lc-header` | Every header wraps (today only `--has-nav` does). The brand's flex basis is **logo + its longest title word** (`width: min-content`, the subtitle is left out through `contain: inline-size`). It grows into the free space. The end content moves into one group, `div.lc-header__end`, which goes to the end of a second row when brand and group don't fit together. | The AS-30 interim (`brand flex: 1 1 0`) never wraps, because a zero basis always fits, and that is exactly the AS-31 overlap. A basis equal to the whole content would wrap at 100 % whenever the subtitle is long (AppShellPhone), which breaks AC-3. The group keeps 2+ end items together and right-aligned. |
| `lc-bottom-nav` | The label gets `overflow-wrap: anywhere`. Its 8 px reach into neighbouring columns shrinks as the text grows (`clamp(0px, 24px - 1rem, 8px)`), and the pill gets `max-width: 100%`. | `anywhere` drops the label out of every min-content sum. The item's automatic minimum can then be no more than the pill (56 px), so the list can't widen. The reach is kept at 100 % ("Dokumente" at 360 px). At 200 % two reaching labels would overlap by 8 px. |
| `lc-app-shell` | **ResizeObserver** in `afterNextRender` measures the bar's content-box height `h` and writes it as the private `--_lc-app-shell-bar`. CSS: clearance = `max(112px, h + 40px)` + inset. With the horizon, the land grows by `h − 72px`. | CSS-only fails. A sticky bar is held inside its grid area, so one element can't both stick and reserve a row. CSS also can't make the horizon's land follow another element's height. The CSS fallback (`h` = 72) gives today's 112 px before JS (AC-9), and the existing SCSS assertions hold (AC-14). |

Patterns followed: the shell's private-variable style (`--_clearance`, `--_nav-width`), the `min`/`max` clamp hook pattern from 006, and the has-nav wrap from 3.x.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| CSS hook (meaning extended) | `--lc-app-shell-bottom-clearance` | length | `max(112px, <bar content height> + 40px) + env(safe-area-inset-bottom)` | Space kept free for the bottom bar below 1024 px. By default it follows the bar's real height (at least 112 px plus the inset). A set value still wins. |
| DOM (new) | `div.lc-header__end` | — | — | Wraps `[slot='end']`, the theme toggle, the context info and the account menu, in that order. |
| DOM (kept, hidden) | `div.lc-header__spacer` | — | — | `display: none` except in a `has-nav` header from 1024 px, where it works as before. |
| private var | `--_lc-app-shell-bar` | px | unset → 72px | Set by the shell in the browser only. It is not documented as a hook. |

The defaults render as before because at 100 % text `h` = 72 px (4 + 64 + 4), so clearance = 112 and land + 0. The brand's final width when it shares the row is `line − 2·gap − end`, the same as 3.10.0 (§3). The label reach is 8 px at a 16 px root, and the pill is 56 px wherever the column is ≥ 56 (any width ≥ 360).

## 3. Anatomy and layout

Root 200 % = 32 px, so every rem value doubles. The logo (32 px), icons, pill, item min-height and insets are px and don't change.

### 360 px

```
100 % (unchanged): one row, sm 56 px                 200 %: two rows, row-gap 0
|16|[logo32]12[Produkt / Unser Haushalt…]16|16|[av48]|16|   |32|[logo32]24[LifeCorner          ]·32·|32|  row 1: max(56, 81) = 81
     brand = line − 2·16 − 48 (as 3.10.0)                   |32|    The Miller household…            |32|  title 36/43.2, sub 26/33.8
                                                           |32|                          [ avatar 96 ]|32|  row 2: 96, end group at the end
                                                           header 177 px (transparent), content 296 px
```

```
Bottom bar, floating, 5 items, DE, 200 %         clearance (no horizon) / land (horizon)
 16 ┌───────────────────────────────────────┐ 16   page …………………………… last element
    │ [pill56×32] ×5, columns 62 px          │       ↕ ≥ 24 px (40 − 16)
    │  Heu-   Haus-  Doku-  Finan-  Einstel- │      ┌ bar: list h + 2 ┐
    │  te     halt   mente  zen     lungen   │      └──────────────────┘ 16 + inset
    └───────────────────────────────────────┘      padding-bottom = max(112, h + 40) + inset
 label 24/32, reach 0, item = 8 + 32 + 4 + 32·lines (76 / 108 / 140)
```

320 px: header content 256. The brand shares the row only if `logo + 24 + longest word + 32 + end ≤ 256`. Bar columns 54 (floating) or 60.8 (docked), pill 54.

### From 1024 px

Unchanged: one row, 64 px (md). In a `has-nav` header the brand doesn't grow (`flex: 0 1 auto; width: auto`), the spacer grows and the subtitle isn't contained: today's rules. The bar is hidden.

| Element | Rule | 100 % | 200 % |
|---|---|---|---|
| `.lc-header` | `flex-wrap: wrap; row-gap: 0` | 1 row | 2 rows when needed |
| `.lc-header__brand` | `flex: 1 1 auto; width: min-content; max-width: 100%; min-width: 0; min-height: var(--lc-header-row-height, 64px)` | basis = 44 + word | basis = 56 + word |
| ~~`.lc-header__brand::after`~~ | replaced in r1 by `__spacer` `flex: 0 0 0` + title `margin-inline-end: −gap` + brand `max-width: calc(100% − gap)` (change note 1) | 2 gaps between brand and end, as 3.10.0 | — |
| `.lc-header__title-group` | `flex: 1 1 auto` (fills the brand; the subtitle uses the room) | — | — |
| `.lc-header__title` | `overflow-wrap: break-word` (min-content stays the word) | no change | breaks only a word wider than its row |
| `.lc-header__subtitle` | `contain: inline-size` | ellipsis as before | ellipsis |
| `.lc-header__end` | `display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 0 var(--lc-density-gap-md, var(--spacing-4)); margin-inline-start: auto; min-width: 0; max-width: 100%; &:empty { display: none }` | items as before | full second row |
| `@media (min-width:1024px) .lc-header--has-nav` | brand `flex: 0 1 auto; width: auto; ::after none`; title-group `flex: 0 1 auto`; subtitle `contain: none`; spacer `display: block` (flex 1) | as 3.10.0 | — |
| `.lc-bottom-nav__label` | `--_reach: clamp(-4px, 32px - 1.5rem, 8px); max-width: calc(100% + var(--_reach)); margin-inline: calc(var(--_reach) / -2); overflow-wrap: anywhere; hyphens: auto` (r1: the lower bound −4 keeps a 4 px gutter between neighbouring labels; 0 gutter put "HeuteHaus-" 1.2 px apart) | reach 8 / margin −4, as before | reach −4: label = column − 4, 2 px each side |
| `.lc-bottom-nav__pill` | adds `max-width: 100%` | 56 | 56, or 54 at 320 |
| `.lc-bottom-nav__item` | r1: `justify-content: flex-start; padding-block: 6px 2px` (was `center`, 4/4). Every pill sits 6 px below the item top, on one line across the bar. One-line items at 100 % are pixel-identical (centring gave 4 + 2 = 6), and the tallest item keeps its height (6 + content + 2 = 4 + content + 4) | one-line: unchanged; two-line bars: shorter items' pills move up to 6 | pills on one line (centred, they were ragged by up to 48 px) |
| `.lc-app-shell` `--_clearance` | `var(--lc-app-shell-bottom-clearance, max(calc(112px + env(safe-area-inset-bottom, 0px)), calc(var(--_lc-app-shell-bar, 72px) + 40px + env(safe-area-inset-bottom, 0px))))` | 112 + inset | h + 40 + inset |
| `.lc-app-shell--horizon:has(> .lc-app-shell__bottom-nav:not(:empty)) > .lc-app-shell__horizon` (< 1024) | `--_lc-horizon-land: calc(var(--lc-horizon-land, 112px) + max(0px, var(--_lc-app-shell-bar, 72px) - 72px))` | land | land + (h − 72) |

The script in `AppShellComponent`, browser only:
- In `afterNextRender`, observe `slot.querySelector('.lc-bottom-nav') ?? slot.firstElementChild` with a ResizeObserver: `contentBoxSize[0].blockSize`, falling back to `contentRect.height`.
- Above 0, call `shellDiv.style.setProperty('--_lc-app-shell-bar', h + 'px')`. At 0 (hidden from 1024 px) or with no bar, remove the property.
- A MutationObserver on the slot (`childList`, `subtree`) picks the target again when the bar appears later (life-os `@if (barItems())`).
- Disconnect both in `DestroyRef`. Do nothing when `ResizeObserver` is undefined.
- No change detection is needed. CSSOM `style.setProperty` is allowed under a strict `style-src` CSP.

## 4. States

| State | Header | Bottom bar | Shell |
|---|---|---|---|
| default, hover, focus-visible, active | unchanged | unchanged (ring inset −2 px) | — |
| disabled, loading | — | — | before JS / without RO: 112 + inset (today) |
| empty | no end content: `__end` hidden, brand alone (subtitle width = line − 44 − gap, as 3.10.0) | no items: nothing new | no bar: the property is removed, land unchanged |
| error | — | — | RO missing: CSS fallback |
| overflow | long DE subtitle: "…"; a title word wider than the row breaks (CI DejaVu, 320 px); several end items wrap inside the group, right-aligned | words hyphenate (`lang`), then break anywhere; 3-line labels make every item 140 px (stretch) | the clearance and the land follow `h` |
| many items | — | 6+ → "More", as before | — |

Known and out of scope: AS-30 (2). An `a[lcButton]` whose single word is wider than its row still can't shrink (lg "Deutsch" ≈ 235 px fits 256 at 320 px; a longer word won't). A badge on the last item at 200 % may stick out past the pill. A bar together with a horizon footer covers the footer at scroll end, as in 3.10.0.

## 5. Theming

| Element | Light | Dark | Contrast |
|---|---|---|---|
| all | unchanged tokens | unchanged | no new colour pair (asserted pairs in `theme-contrast.spec.ts` stay) |

No new tokens. `forced-colors`: no new backgrounds or borders. The `::after` and `__end` are transparent.

## 6. Accessibility

- **DOM and focus order:** unchanged (hamburger, brand link, nav links, end items in order; the wrapper has no role). Bar items stay in order, `aria-current` and labels are unchanged, and no `aria-hidden` is added.
- **Reflow (1.4.10):** no horizontal scroll at 320 px / 200 % (AC-2, AC-4). Text resize (1.4.4): nothing is clipped.
- **Targets:** avatar trigger 96 × 96 at 200 %; bar items ≥ 54 × 76 at 320 px / 200 % and 62 × 64 at 360 px / 100 %.
- **Focus rings:** the member trigger's 2 px ring (offset 2) on row 2 extends 4 px below the header and paints above the page (header `z-index: 1000`), so it isn't clipped.
- **Motion and announcements:** reduced motion has nothing new to handle, and there are no announcements.

## 7. Texts

No built-in text added. Story texts:

| Use | EN | DE |
|---|---|---|
| Bar labels | Today, Household, Documents, Finances, Settings | Heute, Haushalt, Dokumente, Finanzen, Einstellungen |
| Subtitle / menu | The Miller household · Menu for Sarah Miller | Familie Apfelbaum-Kieselbacher-Morgentau · Menü für Johanna Apfelbaum |
| Language link (signed out) | — | Deutsch (`lang="de"`) |

## 8. Stories

Every new story gets the story arg `textSize: '200%' | '100%'` (default `'200%'`, with a description and `table.defaultValue`). It renders `<div [attr.data-lc-story-text]="textSize">` plus `<style>html:has(#storybook-root [data-lc-story-text="200%"]) { font-size: 200%; }</style>`. That is root 200 % in the canvas only, so the docs page stays at 100 %. Frames are fluid (no fixed 360 px box), so the shot width is the viewport. Header and shell use `size="sm" logoSize="sm" variant="transparent" [sticky]="false" titleTag="span" userMenuTrigger="avatar"`, as life-os does.

| Story (export) | Expected ID | Args / content | Shows |
|---|---|---|---|
| `SignedInLargeText` | `navigation-header--signed-in-large-text` | title LifeCorner, EN subtitle, avatar | AC-1, AC-2: two rows, avatar at the end of row 2 |
| `SignedInLargeTextGerman` | `navigation-header--signed-in-large-text-german` | DE subtitle and labels, `lang="de"` | AC-1: subtitle "…", brand whole |
| `SignedOutLargeText` | `navigation-header--signed-out-large-text` | `showUserMenu=false`, `[slot='end']` lg ghost link "Deutsch" | AS-30 (1): link at the end of row 2 |
| `FloatingLargeText` | `navigation-bottom-nav--floating-large-text` | 5 DE items, `fixed=true`, Heute current, text above, `layout: fullscreen`, docs disabled | AC-4, AC-6, AC-11 |
| `ItemCountsLargeText` | `navigation-bottom-nav--item-counts-large-text` | docked and floating × 3 · 4 · 5 DE items, `fixed=false`, floating ones in 16 px side padding | AC-5, AC-6 |
| `SignedInLargeText` | `layout-app-shell--signed-in-large-text` | no horizon, DE, tall page (h1 + 4 placeholders, last one `data-story-last`), floating bar 5 DE | AC-7, AC-8 |
| `SignedInLargeTextEnglish` | `layout-app-shell--signed-in-large-text-english` | the same, EN | AC-7 EN |
| `TodayLargeText` | `layout-app-shell--today-large-text` | the `today()` template with horizon and member row, 5 DE items | AC-7 with the horizon: the land grows |

## 9. Verification

Measure with `story-shots --widths=320,360 --measure=…`, toggle `textSize` with `updateStoryArgs`, and scroll to the end before the shell measures.

| AC | How | Expected |
|---|---|---|
| AC-1 | header stories at 320/360: rect of `.lc-header__brand` vs `.lc-header__end`; title `scrollWidth ≤ clientWidth`; subtitle `scrollWidth > clientWidth` → `text-overflow` | intersection 0; brand row 1, end row 2; subtitle shows > 1 char |
| AC-2 | the same + `documentElement.scrollWidth` | end `right` = innerWidth − 32 (padding at 200 %); scrollWidth ≤ innerWidth |
| AC-3 | baseline compare of all header stories at 360 | identical; heights 56/64/80/112. r1: except FullFeatured and TranslatedLabels at 360, which wrap to 108 because their title ran into the toggle |
| AC-4 | `FloatingLargeText`: nav rect, list `scrollWidth`/`clientWidth` | nav right = innerWidth − 16; equal widths; item widths 62 (360) / 54 (320) ±0.5 |
| AC-5 | `ItemCountsLargeText`, every list | `scrollWidth == clientWidth`; columns = list content / n |
| AC-6 | every label | `scrollHeight ≤ clientHeight`; no label wider than its column + reach. r1: in every bar, `pill.top − item.top` = 6 for all items; the smallest ink gap between neighbouring labels on a shared line (Range rects) is ≥ 4 px at 200 % |
| AC-7 | shell stories, 100 % and 200 %, 320/360, scrolled to end: `[data-story-last]` bottom vs `.lc-bottom-nav` top. The inset is checked by formula: both sides carry `+ inset` | last bottom ≤ bar top − 24 (no horizon); with the horizon, `main` bottom ≤ bar top |
| AC-8 | computed `padding-bottom` = max(112, list h + 40); with an inline `--lc-app-shell-bottom-clearance: 0px` → 0. Unit test: RO stub reports 116 → `--_lc-app-shell-bar: 116px`; no RO → no throw; bar removed → property removed; destroy → disconnect | as stated |
| AC-9 | compat prerender: header and bar markup as today, no `--_lc-app-shell-bar` in the HTML; code review: only in `afterNextRender` | — |
| AC-10 | baseline compare of all header, bottom-nav and shell stories (360/1024/1280 × light/dark, `--full`) | 0 different. r1: except the 8 in change note 2, plus any bar with mixed line counts at 100 %, where the pills move up into one line |
| AC-11 | light + dark shots of the new stories; ring rect of the focused trigger; item rects | no new colours; ring inside the viewport; items ≥ 54 × 76 |
| AC-12 | existing DOM-order spec (`header.public-site.spec.ts` l. 106–112) + new: `__end` children in order | unchanged |
| AC-14 | full suite. **One assertion changes, for a stated reason:** `bottom-nav.component.spec.ts` l. 209 `break-word` → `anywhere` (AC-6 asks for it). Add SCSS assertions for `width: min-content`, `contain: inline-size`, `--_clearance` | green |

**Cause first (spec):** before changing the bottom nav, measure `FloatingLargeText` at 320/360 on the unchanged CSS (per-item `getBoundingClientRect().width`, list scrollWidth) and record the cause in build.md. My reading: the item's automatic minimum falls back to the label's min-content. The constant right edge 379 = 16 + 2 + 16 + 5 × 69 points to content-sized items, and only `anywhere` lowers that minimum.

**Risks:**
- The life-os interim `lc-shell .lc-header__brand { flex: 1 1 0 }` (0,1,1) beats the kit rule and keeps today's overlap. The changelog Migration must say: remove the three AS-30 header rules.
- `.lc-header > [slot='end']` selectors in consumers no longer match.
- CI DejaVu: "LifeCorner" breaks at 320 px / 200 % (title 212 px > 200).

**Baselines (captured 2026-10-21):** Storybook rebuilt on `main` 5634b0b (`libs`, `tools` clean) after the owner resumed the run with `NX_WORKSPACE_ROOT_PATH` unset. 192/192 shots in `tmp/story-shots/009/baseline`, exit 0, not opened. Known hash noise from 002 doesn't apply to these 32 stories. The review compares with `--compare=tmp/story-shots/009/baseline`. Command:
`node tools/agents/story-shots.mjs --stories=navigation-header--default,navigation-header--with-hamburger,navigation-header--above-sidenav,navigation-header--with-theme-toggle,navigation-header--full-featured,navigation-header--minimal,navigation-header--with-long-title,navigation-header--dark-theme,navigation-header--light-theme-explicit,navigation-header--with-org-info,navigation-header--with-tenant-info,navigation-header--with-org-name-only,navigation-header--logo-sizes,navigation-header--public-site,navigation-header--public-site-phone,navigation-header--translated-labels,navigation-header--app-shell-phone,navigation-header--app-shell-desktop,navigation-bottom-nav--default,navigation-bottom-nav--floating,navigation-bottom-nav--five-destinations,navigation-bottom-nav--overflow-more,navigation-bottom-nav--with-badges,navigation-bottom-nav--fixed-to-viewport,layout-app-shell--today-desktop,layout-app-shell--today-phone,layout-app-shell--content-page,layout-app-shell--today-loading,layout-app-shell--lazy-side-navigation,layout-app-shell--lazy-side-navigation-german,layout-app-shell--footer-on-the-horizon,layout-app-shell--figure-on-the-horizon --full --out=tmp/story-shots/009/baseline` (32 stories, 192 shots).
