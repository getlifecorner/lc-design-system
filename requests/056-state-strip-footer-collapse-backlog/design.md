# Design 056: lc-state-strip, dl badge/total, list chevron, header contextBadge, hero headingLevel/focusTitle, band chart, table footerRow/action ariaLabel, card collapsible, inverse-outline, backlog

- **Status:** ready
- **Change note (review r1, 2026-11-07):** the build exposed four inconsistencies in this design, now corrected: D-11 (fallbacks in `render`, no meta args), §3 card head (`cursor: pointer`), §4 strip numbers (they now follow §3's `min(3px, 25%)`), and §6 (tree-mode footer `rowheader`; strip cells *are* pointer targets, review S-1).
- **Spec:** [spec.md](spec.md), AC-1 … AC-34. Kit 3.35.0 (main 6dd4cdc); release 3.36.0 (minor).
- **Prototypes (Chromium, story-shots `--measure`, logs in `tmp/story-shots/056/`):** `proto-math` (all contrast below), `proto-dl`, `proto-header2`, `proto-card2`, `proto-strip`, `proto-btn`.

## 1. Approach

| Item | Extend / new | Pattern followed, why |
|---|---|---|
| State strip (AC-1–6) | new entry `state-strip` | Win/loss sparkline: the state is a **shape** (up block, down block, centred block, flat dash), so it reads without hue and in forced colours. APG single-row **grid** with a roving tab stop: one Tab stop, arrows walk the runs, screen readers read it as a table in browse mode. Caption in the lc-tooltip look, but inside the host and `aria-hidden` (lcTooltip would describe the cell with its own name). |
| dl badge / total (AC-7, 11, 12) | extend | `lc-badge` as the value; its host cancels its extra height with block margins (row 38 → 38.5, plain badge 41). Ledger rules in `--color-field-border`, the only border token ≥ 3:1 (`--color-border-strong` 1.45 L / 1.85 D). |
| List chevron (AC-8) | extend | lc-icon `chevron-right` (registered in lc-table already), built-in row content only. |
| Header badge (AC-9, 10) | extend | `lc-badge sm rounded` after the name; block margins keep the button 49.58 → 49.61 (55.39 without them). |
| Hero (AC-13, 14, 25, 26) | extend | `headingLevel` as lc-card / lc-empty-state (`@switch`); `focusTitle()` as lc-next-step-card 3.33. Ring = WCAG technique **C40** two-tone (white + `#111827`, 17.74:1 to each other). |
| Band (AC-15, 16) | extend | Bar lengths as `%` SVG attributes (028 pattern): exact before JS and CSP-safe, no ResizeObserver needed. |
| Table (AC-17–20) | extend | `<tfoot>` with the dl total's ledger rules; `ariaLabel` beside `tooltip`. |
| Card collapsible (AC-21–24) | extend | Stretched button inside the heading, the link-card pattern of 3.24 (`::after` over the head, `:has()` ring, controls lifted above); chevron as lc-accordion. |
| `inverse-outline` (AC-27, 28), backlog (AC-29–34) | extend | D-9; D-10, D-11; the rest as the spec says. |

**Decisions (no owner question):**
- **D-1 (AC-2):** the state words are an input **`stateLabels`**, not `locale`: in the kit `locale` is a BCP 47 tag (calendar, money, number-input, file-upload). Counts in fixed order success, warning, error, neutral; 0 left out.
- **D-2 (AC-7):** `value` stays required (making it optional breaks consumers that read `item.value` from `itemClick`). With `badge`, a `value` that is empty or equals `badge` (trimmed, case-insensitive) is not rendered; any other value stays as text before the badge („1“ [Freigegeben]). `href`/`datetime` wrap that text only. md list → badge `sm` (14 px, the list's text size); **sm list → `xs`** (12 px, its text size; the same margins keep its row). Deviation from AC-7's "sm" for `size="sm"` lists only.
- **D-3 (AC-7, 11):** dl has no `columns` layout (`rows | stacked`). "Columns" = lists in a multi-column grid (the *Link and primary values* grid); the stories show both features there.
- **D-4 (AC-9):** with a badge the button's `max-width` is 340 px (220 without): at 220 the name „September 2026 · Fassung 1“ (192 px) kept 89 px beside „Freigegeben“ (100.6); at 320 it had 189 of 192, at 340 it fits.
- **D-5 (AC-26):** `focusTitle()` with a `label` also sets `aria-labelledby="<label id> <title id>"` on the title (ids set at call time, module counter), so the focused heading is read „Monatsstand Oktober 2026 522.530,00 €“. Without the call nothing changes (no ids, no tabindex).
- **D-6 (AC-16):** `band` is always horizontal (`orientation` ignored); with ≠ 1 category it renders as `chart` plus a dev-mode warning. Negative values draw 0 wide; sum 0 draws no parts.
- **D-7 (AC-17–19):** the footer's first column is `<th scope="row">`; callbacks (`cellClass`, `cellStyle`, `formatter`) get `rowIndex = -1`; `lcTableCell` templates get `footer: true` in their context. lc-table has no card layout below 800 px (it scrolls), so the footer scrolls with it; documented (the requester uses lc-list there).
- **D-8 (AC-21–23):** `collapsible` needs the built-in `title` (else ignored, dev warning) and wins over `clickable`, `href`, `route` (ignored, dev warning); ignored on `dashed`. No `role="region"` on the body (five cards on a page = landmark noise).
- **D-9 (AC-27):** **`inverse-outline`, not `inverse-ghost`.** A ghost (white text, no fill) measures 2.26:1 on the warning band (2.72 success, 3.04 orange, 3.12 secondary) and has no boundary. The outline form carries a `#111827` scrim at 50 % (text ≥ 4.66 on every band under the body's .85 opacity) and a two-tone keyline (1 px white border + 1 px `#111827` shadow, ≥ 3.56). The **existing `inverse` ring gets the same dark inner band**: its white-only ring measures 2.01 (warning), 2.39 (success), 2.61 (orange), 2.70 (secondary) at .85, a measured AA failure on the same element pair (AC-28); now ≥ 3.56. At rest `inverse` is unchanged.
- **D-10 (AC-31):** `hamburgerClick` emits the hamburger's native `<button>` (not the `<lc-button>` host), the element that gets focus.
- **D-11 (AC-29):** *Keyboard Focus* binds the five args; *Touch Targets (DE)* and *Long Tags* bind them too and `controls.exclude` `label`, `placeholder`, `removeTagAriaLabel` (fixed German texts). ~~The meta `args` must hold the five component defaults~~ (r1: each `render` falls back to the component defaults, since meta args would bind the 6 other stories and `maxTags: Infinity` doesn't survive the args round trip), so the 3 stories stay hash-identical (12 shots).

**Follow-up found (release.md → Open items, queue):** F-1 the default chart palette (`CHART_PALETTE`, 13 charts) has `--color-success-default` 2.47–2.72 and `--color-warning-default` 2.05–2.26 against the light pages and surfaces (1.4.11). The band story uses passing tokens (§5).

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| type | `StateStripState` | `'success' \| 'warning' \| 'error' \| 'neutral'` | — | State of one run. |
| type | `StateStripSegment` | `{ state: StateStripState; label: string }` | — | One run; `label` names it („Mo 06.10., 06:00“). |
| type | `StateStripLabels` | `Record<StateStripState, string>` | — | State words; `DEFAULT_STATE_STRIP_LABELS` exported (§7). |
| input | `lc-state-strip` `segments` | `readonly StateStripSegment[]` | `[]` | Runs in order, oldest first, one segment each. Empty: renders nothing (no box, no accessibility node). |
| input | `ariaLabel` | `string` | `''` | Start of the strip's name; the counts per state follow: „Letzte 10 Ladeläufe, 9 geladen, 1 fehlgeschlagen“. |
| input | `stateLabels` | `Partial<StateStripLabels>` | `{}` | Words for the counts and the segment names, over the English defaults. |
| CSS hook | `--lc-state-strip-height` | length | `2rem` | Strip height. |
| CSS hook | `--lc-state-strip-segment-max-width` | length | `1.5rem` | Widest segment; segments share narrower strips. |
| field | `DescriptionListItem.badge` | `string?` | — | Shows the value as an `lc-badge` (rounded; `sm` in md lists, `xs` in sm lists). A `value` that is empty or the same word is not shown; another value stays as text before the badge. Term and value stay one `dt`/`dd` pair. |
| field | `.badgeVariant` | `BadgeVariant?` | `'default'` | Variant of that badge. |
| field | `.total` | `boolean?` | `false` | The sum item: a rule above and a double rule below (`--color-field-border`), term and value semibold with tabular figures; its `emphasis` is ignored. |
| input | `lc-description-list` `totalAriaLabel` | `string` | `''` | Read before the term of a total item, not shown: „Summe“ → „Summe, Gesamtkosten Ist“. |
| input | `lc-list` `showChevron` | `boolean` | `false` | Ends every `clickable` or `href` row with a decorative `chevron-right` after badge, metadata and action. Plain rows and `lcListItem` templates get none. |
| type | `HeaderContextBadge` | `{ label: string; variant?: BadgeVariant }` | — | |
| input | `lc-header` `contextBadge` | `HeaderContextBadge \| undefined` | `undefined` | State of the context, as an `lc-badge` (`sm`, rounded) inside the context button after `contextName`; its label ends the button's name („…, Fassung 1, Freigegeben“). Keep it to one or two words. |
| output | `hamburgerClick` | `OutputEmitterRef<HTMLElement>` | — | Emits the hamburger's `<button>`, e.g. for `lc-sidenav [returnFocusTo]`. Handlers without `$event` work as before. |
| type | `HeroHeadingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | — | |
| input | `lc-hero` `headingLevel` | `HeroHeadingLevel` | `1` | Element of the title (`h1`–`h6`); the look is the same at every level, size and breakpoint. Use 2 under an `lc-page-header`. |
| method | `focusTitle()` | `() => void` | — | Moves focus to the title (`tabindex="-1"`, out of the Tab order) after an action replaced the stage (WCAG 2.4.3). With a `label`, the title is named „label title“. Call after render, as `lc-next-step-card.focusTitle()`. |
| type | `StackedBarVariant` | `'chart' \| 'band'` | — | |
| input | `lc-stacked-bar-chart` `variant` | `StackedBarVariant` | `'chart'` | `band`: one horizontal bar edge to edge, `height` thick, no axes, grid, labels or paddings, scale 0 … sum; parts split by a 2 px surface gap. One category only (else `chart`); `orientation` ignored. |
| CSS hook | `--lc-stacked-bar-chart-band-gap` / `-gap-color` | length / color | `2px` / `var(--color-surface)` | Gap between band parts; set the colour to the band's background off a card. |
| input | `lc-table` `footerRow` | `Record<string, unknown> \| undefined` | `undefined` | One `<tfoot>` row below all data rows, with the columns, `lcTableCell` templates (`footer: true`), `cellClass`/`cellStyle`/`formatter` (`rowIndex` −1). Never sorted, filtered, searched, paged, selected or counted. First column is the row header. |
| field | `TableAction.ariaLabel` | `string \| ((row, rowIndex) => string)` | — | Accessible name per row („Herkunft von Demo Netz“); wins over `tooltip`, `label`, `key`; '' falls back. Must contain the visible label (2.5.3). |
| input | `lc-card` `collapsible` | `boolean` | `false` | The head (icon, title, subtitle) becomes one toggle: the title's button with `aria-expanded`, its hit area the whole head; body and footer hide when closed. Needs `title`; overrides `clickable`/`href`/`route`; ignored on `dashed`. |
| model | `expanded` / `expandedChange` | `ModelSignal<boolean>` | `true` | Open state of a `collapsible` card (`[(expanded)]`). |
| type | `ButtonVariant` | `… \| 'inverse' \| 'inverse-outline'` | — | `inverse-outline`: the quieter action on a dark band, beside `inverse` (same sizes, height, slots, states). Class `btn-inverse-outline`, also on `a[lcButton]`. |
| input | `lc-combobox` `announceError` | `boolean` | `true` | As lc-textarea: `false` drops `role="alert"`; the error stays visible and in `aria-describedby`. For a focus moved to the field after a 422 with an error summary. |

**Defaults unchanged:** every input is opt-in; unset, elements, attributes, classes and computed styles equal 3.35.0. Only Angular's empty `<!---->` anchors of the new `@if`/`@switch` branches differ (the kit specs that compare markup strip comments). New CSS only matches new classes, except the `inverse` focus ring (D-9).

## 3. Anatomy and layout

### 360 px (story canvas: card 328 at x 16, content 294 at x 33)

```
STATE STRIP (card content)                    DESCRIPTION LIST (md, 294)
x 33                                          Zustand ................ (Freigegeben)   row 38.5, badge 24 (margins −1.5)
▀▀ ▀▀ ▀▀ ▀▀ ▀▀ ▀▀ ▀▀ ▀▀ ▄▄ ▀▀   240 × 32       Fassung ................ 1 (Freigegeben)  value 6 px before the badge
┌─────────────────────────────┐  +4           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  1 px field-border (margin-top −1)
│ Mo 06.10., 06:00, fehlges-  │ caption       Gesamtkosten Ist          522.530,00 €     600 / tabular
│ chlagen                     │ max 294       ════════════════════════════════════════  3 px double field-border
└─────────────────────────────┘
cell 24 × 32, mark inset-inline min(3px,25%) → 18 wide
success top 4 h 11 · error top 17 h 11 · warning top 8 h 16 · neutral top 15 h 2

CARD collapsible (open / closed, padding 16)   HERO stage (sm, pad 24/20)              HEADER below (≤ 640)
┌───────────────────────────────────┐          MONATSSTAND OKTOBER 2026                 Finance Intelligence   (●)
│[▣] Umlageschlüssel nach Kosten-  ⌃│ ≥44      522.530,00 €   ← h2, ring 2+2 px         MONATSSTAND
│    stellenverantwortung           │          body …                                   Oktober 2026 · Fass… (Freigegeben)
│    13 Regeln · Verteilung …       │          [ Freigeben ] [ Herkunft ]  48.5 / 48.5   button 352 × 49.61
├───────────────────────────────────┤          inverse       inverse-outline, gap 12
│ body                               │
└───────────────────────────────────┘          LIST row:  [icon] Label ………… [badge]   ›   chevron 20, gap 12 (sm 8, lg 16)
┌───────────────────────────────────┐
│[▣] Direkte Zuordnung       [+]   ⌄│ closed: no divider, margin, padding-bottom; [+] = header action above the toggle
└───────────────────────────────────┘
```

### From 1024 px

```
HEADER inline: … MONATSSTAND ┐ end group, max-width 340 with badge     BAND (928 wrapper): x 0 … 928, h = height
     Oktober 2026 · Fassung 1 (Freigegeben)  49.61 high                 |██████████|██████|████|███|██|   gaps 2 px at boundaries
TABLE (800 / 1280):                                                      legend centred 8 px below (as chart)
 NAME              IST           PLAN        ·
 ▸ Demo Netz       …             …           [Herkunft]
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  1 px field-border on tfoot tr
 Gesamtkosten Ist  522.530,00    600.000,00  (empty)    th scope=row, label x = level-0 labels (indentSize spacer)
 ═══════════════════════════════════════════  3 px double
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| strip grid / row | block / flex, h `--lc-state-strip-height` 2rem | — | — |
| strip cell | `flex: 1 1 0; min-inline-size: 0; max-inline-size: var(--…-segment-max-width, 1.5rem)`, `position: relative` | — | hover bg `--color-surface-hover` |
| strip mark | absolute, `inset-inline: min(3px, 25%)`, geometry above | — | success `--color-text-success`, warning `--color-text-warning`, error `--color-text-error`, neutral `--color-field-border` |
| strip caption | absolute, top `calc(100% + 4px)`, start 0, `max-inline-size: 100%`, pad 4/8, r md, z 1, `overflow-wrap: break-word; hyphens: auto` | 12/18 | bg `--color-text-primary`, ink `--color-surface`, `--elevation-2` |
| dl badge host | `lc-badge.lc-dl__badge { display: inline-flex; margin-block: calc((1lh - 1.5rem) / 2) }` (sm list: 1.25rem); 6 px (`--spacing-1-5`) after a value | badge 14 / 12 | lc-badge variant |
| dl total row | `border-top: 1px solid`, `border-bottom: 3px double`, `margin-top: -1px` in `sep-line`/`sep-divider`; term + value 600, term `--color-text-primary` | list size | `--color-field-border` |
| list chevron | `lc-icon size="sm"` 20, `flex-shrink: 0`, after `.lc-list__trailing`; `:dir(rtl)` mirrored | — | `--color-text-tertiary` |
| header badge | row span `display:flex; align-items:center; gap: var(--spacing-1-5); min-width:0`; name `flex: 0 1 auto; min-width:0` (ellipsis as today); badge host `flex-shrink:0; margin-block: calc(0.65 * var(--font-size-sm) - 0.75rem)` (−2.9) | 14 | lc-badge |
| hero title ring | `outline: 2px solid currentColor; outline-offset: 2px; box-shadow: 0 0 0 2px #111827` (`$color-neutral-900`); light variant shadow `#fff`; r sm | — | palette (bands are theme-independent) |
| band | `<svg width=100% height=…>`, `rect x/width` in %, y 0 h 100%; gap = `<line>` at each inner boundary, `stroke-width: var(--…-band-gap, 2px)`; svg `overflow: hidden` | — | parts: `legends[].color` / palette |
| tfoot cells | padding as tbody td per size; `text-align: start`; 600; tabular; `:where()` font size/colour as tbody | 14 (sm 12, lg 16) | rules `--color-field-border`; bordered: column lines `--color-divider` |
| card head (collapsible) | `position: relative; isolation: isolate; min-height: 44px; align-items: center; cursor: pointer` (r1); toggle reset (font/colour inherit, no padding/border/bg, `text-align: start`) + `::after { inset: 0; z-index: 1 }`; header action `position: relative; z-index: 2`; chevron `lc-icon chevron-down sm` last, rotates −180° when open (200 ms) | title as today | chevron `--color-text-secondary`, hover `--color-text-primary` |
| inverse-outline | `.btn` box (1 px border) → same heights as `inverse` (lg 48.5, icon-only 45.59, measured) | as `.btn` | bg `rgba($color-neutral-900, .5)`, border + ink `--color-neutral-white`, `box-shadow: 0 0 0 1px $color-neutral-900` |

## 4. States

| Component | hover | focus-visible | active | disabled / loading | empty / error / overflow |
|---|---|---|---|---|---|
| state strip | cell bg surface-hover, caption shows its name | cell ring 2 px primary-500 offset −2, caption shows; Esc hides it | — | — | empty: nothing; > 10: cells shrink (r1, 328 px: 30 → 10.92 px, mark 5.48; 60 → 5.45 / 2.73 = cell − 2 × `min(3px, 25%)`), never overflow; long label: caption wraps |
| dl badge / total | clickable row as today | as today | — | — | long value + badge: value wraps (`anywhere`), badge stays one line |
| list chevron | row hover as today | inset ring as today (chevron inside) | — | disabled row: chevron dims with the row (.5) | DE long label wraps beside it |
| header badge | button hover as today | ring as today (2 px offset 2) | — | — | long name: ellipsis, badge stays (360 below: 252 of 431 px, no overflow) |
| hero title | — | two-tone ring, only after `focusTitle()` from a keyboard action | — | — | long title wraps as today |
| band | part opacity .8 (as chart) | — | — | — | sum 0: no parts; 1 part: full width, no gap |
| table footer | none (not a data row) | none | — | — | stays last under sort/filter/search/page/tree; empty result: footer still shows |
| card toggle | chevron → text-primary | ring on the head (`:has`) | — | — | closed: head only; DE compounds hyphenate (`lang="de"`) |
| inverse-outline | scrim .62 | white ring + 2 px `#111827` band | scrim .74 | `.btn` .5; focused loading opacity 1 | label wraps as `.btn` |

## 5. Theming (computed: WCAG formula on resolved tokens; minima over background, surface, surface-2, hover, sunken; hero values over t 0…1 on all 9 bands)

| Element | Light | Dark | Contrast (computed) |
|---|---|---|---|
| strip marks | `#5f7150` / `#855a22` / `#6b0909` / neutral-500 | `#a9bb93` / `#e1a040` / error-light / `#93a4ad` | L 4.81 / 5.48 / 11.44 / 4.39 · D 6.97 / 6.35 / 7.21 / 5.56 |
| strip ring, caption | primary-500; surface on text-primary | same tokens | ring L 3.97 / D 7.58; caption 17.74 / 15.85 |
| dl total + tfoot rules | `--color-field-border` | same | L 4.39 / D 5.56 (border-strong would be 1.45 / 1.85) |
| band story parts | primary-700, primary-500, info-default, secondary-700, neutral-500 | same tokens | L 8.30 / 3.97 / 5.61 / 6.49 / 4.39 · D 10.53 / 7.58 / 8.83 / 10.94 / 5.64 (each part meets only the surface and the surface-coloured gaps) |
| card ring | primary-500 | same | 4.37 L / 9.13 D on the card (037 values) |
| hero title ring (two-tone) | white + `#111827`, light variant neutral-800 + white | same (bands fixed) | min 4.23 (secondary, warning, orange); light variant 10.57 |
| inverse-outline text (.85 / 1.0) | white on scrim .5 | same | min 4.66 (warning) / 6.19; secondary 5.61, success 5.20, orange 5.61 |
| inverse-outline keyline + ring (.85 / 1.0) | white + `#111827` | same | min 3.56 / 4.23 (white alone 2.01 / 2.26) |
| `inverse` ring (D-9) | white + `#111827` | same | 2.01 → 3.56 at .85 |
| header badge (text on its fill over header bg / hover, both headers of *Context Below*) | lc-badge pairs | same | L min 4.85 (success, all backdrops) · D min 4.93 (warning on hover), default 8.83+, primary 6.81+ |
| list chevron | text-tertiary | same | L 5.30 / D 5.56 (decorative) |

No new token. Hero values use SCSS palette values as `inverse` does (bands don't follow the theme).

## 6. Accessibility

| Component | Semantics / ARIA | Keyboard / focus | Forced colours, motion |
|---|---|---|---|
| state strip | `div role="grid" aria-label="<ariaLabel>, 9 …, 1 …"` > `div role="row"` > `div role="gridcell"` per run with a visually hidden name `nameWithText(label, stateWord)`; caption `aria-hidden` | one Tab stop (roving `tabindex`, initial = newest/last); ←/→ ±1, Home/End, no wrap; Esc hides the caption; click focuses | marks `forced-color-adjust: none; background: CanvasText` (neutral `GrayText`); ring `Highlight`; no motion |
| dl | badge inside `dd`; total prefix as visually hidden text in `dt` („Summe, “); clickable row name = dt + dd as today | unchanged | rules are borders (forced to CanvasText, double kept) |
| list | chevron `lc-icon [decorative]` (aria-hidden) | unchanged | currentColor |
| header | badge inside the button; name = `nameWithText(contextAriaLabel, label + name)` + `, <badge>` unless already contained; `&ngsp;` between name and badge | unchanged (one stop, 44 px, `focusContext()`) | lc-badge border |
| hero | `h1`…`h6`; label read first via D-5 | `focusTitle()`: tabindex −1, not in Tab order | `outline-color: Highlight; box-shadow: none` |
| band | svg `role="img"` + `<title>` as today | none | parts keep author colours (SVG paint isn't forced); gaps `stroke: Canvas` |
| table | `tfoot` rowgroup, `th scope="row"`, in tree mode `role="row"`, the `th` `rowheader` and the `td`s gridcells (r1, as §9 and AC-19); not in the roving model | no stops of its own | borders forced |
| table action | `[ariaLabel]` = fn result | unchanged | — |
| card | heading keeps level; `button aria-expanded aria-controls=<body id> aria-describedby=<subtitle id>`; closed body `hidden`, footer `display: none` | Tab: toggle → header action → body; Enter/Space native | head ring `outline-color: Highlight` (ancestor ring, 037 r1); chevron `transition: none` under reduced motion |
| inverse-outline | as `inverse` | ring above; focused loading opacity 1 | border `ButtonText` / `LinkText`, ring `Highlight` |
| combobox | `role="alert"` only with `announceError` | unchanged | — |
| targets | the hero title is no pointer control. ~~Strip cells are none~~ (r1: hover and click show the caption, so they are pointer targets: 24 × 32 up to 13 runs per 328 px, narrower beyond, review S-1); card head ≥ 44 (58.58 with icon md + subtitle); all others unchanged | | |

## 7. Texts

| Key / input | EN default | DE (stories) |
|---|---|---|
| `stateLabels.success / warning / error / neutral` | succeeded / with warnings / failed / pending | geladen / teilweise geladen / fehlgeschlagen / ausstehend |
| strip name (example) | „Last 10 load runs, 9 succeeded, 1 failed“ | „Letzte 10 Ladeläufe, 9 geladen, 1 fehlgeschlagen“ |
| story strings | — | `totalAriaLabel` „Summe“; badges „Freigegeben“, „Ersetzt“, „Entwurf“; hero „Monatsstand Oktober 2026“ / „522.530,00 €“ / „Freigeben“ / „Herkunft“; action `ariaLabel` „Herkunft von {name}“; card titles „Umlageschlüssel nach Kostenstellenverantwortung“, „Direkte Zuordnung“, „Verteilung nach Leistungsverrechnungsschlüssel“ |

Every DE story sits in `lang="de"`. At 360: caption wraps inside 294, header name ellipsis, card titles hyphenate.

## 8. Stories (each binds all its args or limits `controls.include`; argTypes with description + `table.defaultValue`. AC-6 "dark" = every story in the dark theme; themes are `:root`-only, so no separate story)

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Default | `data-display-state-strip--default` | segments 9 success + 1 error, ariaLabel | AC-1, 2, 5 |
| All States | `…state-strip--all-states` | 3 neutral, 3 success, 2 warning, 2 error | AC-4 shapes |
| German | `…state-strip--german` | DE labels, in a 328 card with a dl („Zustand“ badge) | AC-2 DE, AC-5 |
| Keyboard Focus | `…state-strip--keyboard-focus` | play focuses cell 9 | ring + caption |
| Many Segments | `…state-strip--many-segments` | 30 and 60 | AC-5 > 10 |
| Empty | `…state-strip--empty` | `[]` | AC-1 (shot shows only the story note) |
| Badge Values | `components-description-list--badge-values` | rows, stacked, sm list, value + badge, all variants | AC-7, D-2 |
| Total Row | `…description-list--total-row` | DE, rows/stacked/2-column grid, `totalAriaLabel` | AC-11, 12 |
| Chevron Rows | `data-display-list--chevron-rows` | DE long, clickable + link + plain, badge + action, sm/md | AC-8 |
| Context Badge | `navigation-header--context-badge` | success / default / warning, inline + below, DE long name | AC-9, 10 |
| Hamburger Focus Return | `navigation-header--hamburger-focus-return` | header + sidenav drawer, `$event` → `returnFocusTo` | AC-31 |
| Heading Level | `layout-hero--heading-level` | page header (h1) + hero `headingLevel=2` | AC-13, 14 |
| Focus Title | `layout-hero--focus-title` | `color` bound; „Freigeben“ replaces the stage → `focusTitle()` | AC-25, 26 |
| Stage Actions | `layout-hero--stage-actions` | 9 colours, `inverse` + `inverse-outline` lg; sm/md/lg row | AC-27, 28 |
| Inverse Outline | `components-button--inverse-outline`, `components-button-link--inverse-outline` | like *Inverse*: default, icon, loading, disabled, icon-only | AC-27 |
| Band | `charts-stacked-bar-chart--band` | 5 token parts (§5), height 24, legend; full width + 928 wrapper | AC-15, 16 |
| Footer Row | `data-display-table--footer-row` | tree + sort + footer; `align: 'end'` amounts | AC-17–19 |
| Row Action Names | `data-display-table--row-action-names` | `ariaLabel: (row) => 'Herkunft von ' + row.name` | AC-20 |
| Collapsible | `components-card--collapsible` | DE, 3 cards (open, closed, closed + header action), icon sm | AC-21–24 |
| Error After Submit | `form-combobox--error-after-submit` | lc-alert summary + `announceError=false` | AC-32 |

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1, 2, 3 | unit: order, empty host (`display: none`, no grid), names EN/DE, roving keys | „Letzte 10 Ladeläufe, 9 geladen, 1 fehlgeschlagen“; one `tabindex="0"` |
| 4, 5 | contrast spec (marks, §5); story 360/1280 `--measure` strip width, `scrollWidth − clientWidth`; `--forced-colors` shot; `EXPECT_IN_HTML` `role="grid"` + 10 gridcells | 240 × 32 at 360; 0 overflow at 10/30/60 |
| 6 | stories §8, READMEs, manifest (`npm run test:tools`), CHANGELOG | present |
| 7, 11, 12 | unit (dt/dd pairs, names, D-2 rule); story `--measure` row heights; contrast spec | badge row 38.5 (md); total rules 1 / 3 px double field-border; „Summe, Gesamtkosten Ist“ |
| 8 | unit (chevron only on clickable/href rows, `aria-hidden`); 360 DE shot | row heights and action unchanged |
| 9, 10 | unit (name, focusContext); `--measure` + axe label-in-name at 360 (below) / 1024 | button h 49.61, max-w 340, header `scrollWidth = clientWidth` |
| 13, 14 | unit; computed-style compare h1 vs h2 (font-size, weight, line-height, margin, letter-spacing) at 360/1280 for sm/md/lg/slim/light; `h1` count | identical; 1 `h1` |
| 15, 16 | unit (rect % geometry, fallback); `--measure` first rect left − host left, last right − host right | 0 / 0 at 360 and 928 |
| 17–19 | unit (sort/filter/search/page/tree/select/count); AX roles (`rowgroup`, `rowheader`) | footer last in every state |
| 20 | unit (3 names differ); axe/AX names in story | „Herkunft von Demo Netz“ |
| 21–24 | unit (model, keys, `hidden`, ids, no nested button); `--measure` head ≥ 44, `elementFromPoint` head = toggle, action = action; ring; prerender `hidden` | head 58.58 (icon md + subtitle) |
| 25, 26 | unit (tabindex, activeElement, labelledby); §5 ring | ring ≥ 4.23 |
| 27, 28 | contrast spec (§5 values from the compiled SCSS, as 017's spec); `--measure` heights | lg 48.5 = 48.5; text ≥ 4.66, keyline/ring ≥ 3.56 |
| 29–34 | story controls check; alert spec mutation; `strictTemplates` compat; unit; build.md (WebKit); gates | per spec |

**Baselines:** `tmp/story-shots/056/baseline`, 192 stories (button 28, button-link 12, card 23, dl 12, combobox 16, tag-input 9, list 23, table 25, stacked-bar 5, header 26, hero 13) at 360/1280 L/D = 768 shots (logs `baseline-{a,a2,b,b2,b3}.log`), 800 ms wait measure `(async () => (await new Promise(r => setTimeout(r, 800)), 1))()`, Storybook built from main 6dd4cdc. **Expected after the build: all identical** (nothing renders differently at rest), except 6 unstable shots: table *With Pagination*, *With Filtering*, *Full Featured* at 1280 L/D (random data; a re-shoot today differed 6/6, `stability.log`, while the 3 tag-input stories of D-11 were 12/12 identical). Compare those 6 by measure.

**Risks (pitfalls):** comment anchors (strip before comparing); `button:focus { outline: none }` reset, so the card ring lives on the head; ancestor ring needs `Highlight` (037 r1); `1lh` only on the badge host (the badge's own `line-height: 1`); `button.styles.spec.ts` matches every `btn-inverse*` selector (no `filter`/`transition` in the new rules; `.btn-inverse:focus-visible` keeps `outline-color: var(--color-neutral-white)`); `.btn.btn-loading:focus-visible` (0,3,0) needs the (0,4,0) inverse-outline loading rule; `ɵprovideKitIcons([ICON_CHEVRON_RIGHT])` in lc-list, `[ICON_CHEVRON_DOWN]` in lc-card; story args bound (055 r1).
