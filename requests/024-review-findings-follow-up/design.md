# Design 024: Review findings follow-up

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-12
- **Prototyped on** main 1a12739 (Storybook rebuilt 2026-10-31), CSS injected through `--measure`: `tmp/story-shots/024/proto-*`.
- **Change note (review r1, 2026-10-31):** §1 and §9 said 13 px for cells without a class; measured 14 px (`--typography-font-size-sm`) before and after, shots identical. §3 toast message lacks `hyphens: auto` (review finding 1, follow-up).

## 1. Approach

Extend, no new component. Five small fixes, each following an existing kit pattern:

| # | Fix | Pattern followed |
|---|---|---|
| 1 | Body-cell `color` and `font-size` move into zero-specificity `:where(…)` rules, so any consumer class wins and `cellStyle` (inline) still wins over both | `_horizon.scss` `:where([shell-horizon-figure])`. Angular's emulated shim scopes *inside* `:where()` (compiler `_pseudoFunctionAwareScopeSelectorPart`), so the `_ngcontent` attributes add no weight. Prototype: a global `.x { color; font-size }` (0,1,0) on a `td` now applies; cells without a class keep rgb(17,24,39) / rgb(241,246,248), 14 px |
| 2 | Pagination: the page-size select hides its × through its **existing** public hook `--lc-select-clear-display: none`; prev/next get the select's height and look, a 44 px hit area and a ring; the row wraps | lc-select's own field look (`--color-field-border`, `--border-radius-md`, `--color-surface-2`); kit ring `2px solid --color-primary-500`, offset 2 |
| 3 | Toast close and action become 44 px boxes; negative margins keep every other box where it is | lc-modal close (3.18: 44 × 44, negative margin) |
| 4 | `[decorative]="true"` on 4 `lc-icon` sites | lc-modal close icon (3.18) |
| 5 | Menu danger text `--color-text-error`, hover `--color-error-subtle` | lc-alert / badge text-on-subtle pairs |

No lc-select input is needed (the spec's fallback assumption), so `pageSizeLabel` is the only new API (AC-11 holds as written).

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (lc-table) | `pageSizeLabel` | `string` | `'/ page'` | "Pagination: the text after the number in each page-size option (`10 / page`). German: `'/ Seite'`. (3.19)" + `@default '/ page'`. Option label = `` `${n} ${pageSizeLabel()}`.trim() `` |
| JSDoc (changed) | `TableColumn.cellClass` | — | — | Replace the 3.17 sentence with: "Since 3.19 a class colour or font size wins over the kit's cell defaults; `cellStyle` still wins over the class." |
| existing hook, used | `--lc-select-clear-display` | — | `flex` | Set to `none` on `.lc-table-pagination__size` (the lc-select host) |
| internal class | `.lc-table-pagination--sm/--md/--lg` | — | md | On the pagination `div`, from the same mapping as the select's `[size]` (move it into one `computed`) |
| internal element | `div.lc-table-pagination__pager` | — | — | Wraps prev, page, next so they wrap as one group |
| private var | `--_lc-table-pagination-btn` | length | `var(--size-interactive-md-height)` | sm → `-sm-height` (32), lg → `-lg-height` (44) |

No output, slot, type or public hook is added. **Default rendering:** unchanged except the bug fixes listed in §9 "Expected diffs" (pagination look and wrap, the story that uses `cellClass`). The 4 icon sites change only ARIA. The toast's rest pixels are identical (the controls are transparent). The menu changes only when open.

**Compatibility lines for the changelog:** (a) a `cellClass` colour or font size that a consumer set before now shows (the fix); so does any consumer rule that targets lc-table body cells by element. (b) The pagination gains a `__pager` wrapper; prev/next grow 28 → 32/40/44 px; the × is gone from the page-size select. Choosing it used to show the placeholder "Select an option" while the table kept its page size. (c) The kit's `.lc-table__empty { color: --color-text-secondary }` never applied (the old (0,5,3) cell rule won). Remove the declaration so the empty cell stays text-primary, as today.

## 3. Anatomy and layout

### 360 px (*Number Columns*, DE, md; pagination 328 wide, padding 12 / 4)

```
x16                                                     x344
┌──────────────────────────────────────────────────────┐  100 %: 2 rows, h 93 (12+21+8+40+12)
│ 1–5 von 7                                            │  info x 20, 14 px, text-secondary
│                                    row gap 8         │
│      ┌──────────────┐ ┌────┐           ┌────┐        │  controls end-aligned, right x 340
│      │ 5 / Seite  ⌄ │ │ ‹  │   1 / 2   │ ›  │        │  select h 40 · gap 8 · btn 40×40 (hit 44)
│      └──────────────┘ └────┘  60 wide  └────┘        │  pager 156 wide = 40+8+60+8+40
└──────────────────────────────────────────────────────┘
200 % text: 3 rows (info / select 245.8×80 / pager 252×80), all but info at the end; scrollWidth 360.
```

### From 1024 px (1280 shown)

```
x16                                                                              x1264
┌────────────────────────────────────────────────────────────────────────────────────┐ h 64, one row
│ 1–5 von 7                               ┌──────────────┐ ┌────┐         ┌────┐      │
│ x 20                                    │ 5 / Seite  ⌄ │ │ ‹  │  1 / 2  │ ›  │      │ next right x 1260
│                                         └──────────────┘ └────┘         └────┘      │
└────────────────────────────────────────────────────────────────────────────────────┘
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| `.lc-table-pagination` | `flex-wrap: wrap`; gap 8 / 16 (row / column); padding 12 / 4 (as today) | 14 px | `--spacing-2`, `--spacing-4` |
| `__controls` | `flex-wrap: wrap`, `justify-content: flex-end`, `margin-inline-start: auto`, gap 8 | — | `--spacing-2` |
| `__pager` | flex, `align-items: center`, gap 8, no wrap | — | `--spacing-2` |
| `__btn` | `position: relative`; width = height = `--_lc-table-pagination-btn` (32 / 40 / 44); border 1 px; radius 12; bg surface-2; glyph `‹ ›` 20 px, `line-height: 1` | 20 px | `--color-field-border`, `--border-radius-md`, `--color-surface-2`, `--typography-font-size-xl` |
| `__btn::before` | `content: ''`, `position: absolute`, `inset: min(0px, calc((100% - var(--size-min-touch-height, 2.75rem)) / 2))`: 44 px square hit area (88 at 200 %), unpainted | — | `--size-min-touch-height` |
| `__size` | keep `min-width: 110px`; add `--lc-select-clear-display: none`. Value text ends 8 px before the chevron (md) | — | — |
| `:where(.lc-table tbody tr td)` | `font-size` sm, `color` text-primary; `:where(.lc-table--sm …td)` xs, `:where(.lc-table--lg …td)` base, in that order. Padding stays in the existing rules; `th` rules unchanged | — | as today |
| Toast close | `width/height: var(--size-min-touch-width/-height, 2.75rem)`, `padding: 0`, `margin: calc((20px - var(--size-min-touch-height, 2.75rem)) / 2)` (−12 px: the 20 px icon keeps its slot) | — | — |
| Toast action | `display: inline-flex; align-items: center; justify-content: center`; `min-width/min-height` 44; `margin-block: min(0px, calc((1lh + 2 * var(--spacing-1) - var(--size-min-touch-height, 2.75rem)) / 2))` (−7.5 px: centred on the old 29 px box) | 14 px | — |
| Toast message | add `overflow-wrap: break-word` (no change for text that fits) | — | — |

Measured with the prototype (360, Service Call, 2 toasts): toast boxes 328 × 78 and 320.1 × 63, message, icon and close-svg boxes **identical** before and after; close 44 × 44 at x 295 (icon still at 307 / 33); action 93.7 × 44 at y 103.5 (was 111, h 29); the action's right edge = the close's left edge (295.0), touching, not overlapping.

## 4. States

| State | Pagination prev/next | Toast close / action | Menu danger item |
|---|---|---|---|
| default | field look (above) | transparent | `--color-text-error` |
| hover | bg `--color-surface-hover` (as today) + border `--color-text-secondary` (as the select) | existing tints, now on the 44 box | bg `--color-error-subtle` (was raw `rgba(157,14,14,.14)`); fix the selector to `:not(.lc-menu__item--disabled)` (the nested `&--disabled` compiles to `--danger--disabled`) |
| focus-visible | **new** `outline: 2px solid --color-primary-500; offset 2px` (was the UA ring) | `outline-offset: -2px` (inset: an offset-2 ring on the corner box would touch the toast border) | unchanged (ring + surface-hover) |
| active / loading / error | unchanged | unchanged | unchanged |
| disabled | `opacity: .4` as today (prev on page 1) | — | `opacity: .5` as today |
| empty | table without rows: pagination as today ("0–0 of 0") | — | — |
| overflow | DE "50 / Seite": select 126.8, no overlap; 320 px or 200 %: select and pager on separate rows | "Benachrichtigungseinstellungen" breaks inside the message column (122 px at 360 next to the action) | — |

## 5. Theming (computed with the WCAG formula in the browser, `tmp/story-shots/024/probe-*`)

| Element | Light | Dark | Contrast L / D |
|---|---|---|---|
| Menu danger text at rest, over the panel gradient (`--gradient-surface`, top → bottom) | #6b0909 on #fff → #f9fafb | #f7a1a1 on #1a2c3a → #101c26 | 12.59–12.05 / **7.21**–8.69 (was 8.39–8.03 / **1.71**–2.06) |
| … hover (`--color-error-subtle` composited) | on #fbecec | on rgba(157,14,14,.18) | 10.98 / 7.21–8.38 |
| … focus (`--color-surface-hover`) + ring `--color-primary-500` | on #f3f4f6 | on rgba(132,199,212,.06) | text 11.44 / **6.37**–7.77; ring 3.97 / 6.69–8.16 |
| Pagination btn border `--color-field-border` vs canvas | | | 4.83 / 7.31 (was `--color-border` 1.23 L) |
| Glyph text-primary on surface-2 | | | 16.98 / 13.16 |
| Pagination ring `--color-primary-500` on canvas | | | 4.37 / 9.95 |
| Story `cellClass` colours (`--color-text-success/-warning/-error`) on surface, striped surface-2, row hover | | | min 4.81 (success on hover) / 5.61 (warning on hover over stripe) |
| Toast controls | colours unchanged; ring = `currentColor` | | as the text |

No new token.

## 6. Accessibility

- **Pagination:** tab order select → prev → next; the × was a stop between select and prev and is now `display: none` (AC-3), so AC-9's "unchanged" excludes that one stop. Names unchanged (`rowsPerPageAriaLabel`, `previous/nextPageAriaLabel`); the select still reads "Rows per page, 10 / page". Hit areas: 44 px pseudo square, 6 px clear of the select at md (2 px at sm), never overlapping. Hit-test with `elementsFromPoint` at centre ± 21.5 px.
- **Toast:** 44 × 44 close, action ≥ 44 × 44; boxes touch, don't overlap. Radius 10 px: rounded corners are not hit-tested, so test the edge midpoints, not the corners.
- **Drawer / notification center (AC-7):** `[decorative]="true"` on `drawer.component.html` l. 35 and 45 and `notification-center.component.html` l. 83 and 103 → `aria-hidden="true"`, no `role`. The buttons keep "Close drawer" / `closeAriaLabel`. The item's type (error, warning…) wasn't announced before either (an unnamed `role="img"`); naming it would need a type-label API, so it's a follow-up idea, not part of 024.
- **Forced colours:** the outlines are forced to system colours and stay; the `::before` hit area paints nothing; the danger hue becomes system text (its label carries the meaning). **Reduced motion:** no new motion.

## 7. Texts

| Key / input | EN default | DE | Checked at 360 |
|---|---|---|---|
| lc-table `pageSizeLabel` | `/ page` → "10 / page" | `/ Seite` → "10 / Seite" | "50 / Seite" select 126.8 px, one controls row at 100 % |
| (existing, story) `rangeOfLabel` / toast `closeAriaLabel` | of / Close notification | von / Benachrichtigung schließen | — |

## 8. Stories

| Story | Expected ID | Args / change | Shows |
|---|---|---|---|
| Table · Number Columns (changed) | `data-display-table--number-columns` | add `pageSizeLabel="/ Seite"`; description: drop "a class colour loses to the kit's cell rule", say the pager wraps on a phone | AC-2–5 (DE, 360/1024/1280, 200 %) |
| Table · With Cell Formatting And Styling (changed) | `data-display-table--with-cell-formatting-and-styling` | `<style>` rules become `::ng-deep .lc-table-story__cell--success/--warning/--danger { color: var(--color-text-success/-warning/-error) }` (the kit's story pattern for global CSS; a plain template `<style>` is scoped to the story and never reaches a `td`); Account column gets `cellClass: 'lc-table-story__cell--account'` = `::ng-deep … { font-size: var(--typography-font-size-base) }`; no `!important`; description says cellClass wins since 3.19 and cellStyle wins over it | AC-1 |
| Table · Pagination Sizes (new) | `data-display-table--pagination-sizes` | 3 tables `size` sm / md / lg, 12 rows, `[paginate]="true" [pageSize]="5"`, EN defaults | 32 / 40 / 44 px buttons beside 32 / 40 / 44 px selects; default "5 / page" |
| Toast · With Action (new) | `feedback-toast--with-action` | 2 `lc-toast`, column gap 8: EN "Source archived." + action "Undo"; inside `lang="de"`: "Benachrichtigungseinstellungen gespeichert." + "Rückgängig", `closeAriaLabel="Benachrichtigung schließen"`; variant info, `showCloseButton: true` | AC-6 at rest, long DE compound |
| Drawer · Without Heading (new) | `feedback-drawer--without-heading` | `open: true, position: 'right', size: 'sm', heading: '', ariaLabel: 'Quick actions'` | the floating close (site 2 of AC-7; no story had it) |
| existing | `navigation-menu--default`, `--with-dividers`, `--file-menu`, `--compact-size` (opened by the trigger); `feedback-toast-outlet--service-call`; 4 drawer + 7 notification-center stories | — | AC-6–8 |

Add `pageSizeLabel` to the table meta's argTypes (`description`, `table.defaultValue: "'/ page'"`).

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| AC-1 | Unit: sass-compile `table.component.scss` (as `horizon.shell.spec.ts`): every rule that sets `color`/`font-size` on `tbody tr td` starts with `:where(`; `.lc-table__empty` has no `color`. Story measure 1280 L/D | margin `td` colour = resolved `--color-text-success/-warning/-error`; account `td` 16 px; cells without a class rgb(17,24,39) / rgb(241,246,248) and 14 px as today; SLA `cellStyle` opacity applies |
| AC-2 | Unit: option labels "10 / page" by default, "10 / Seite" with the input; *Number Columns* shows "5 / Seite" | — |
| AC-3 | Unit: compiled CSS has `--lc-select-clear-display: none` on `.lc-table-pagination__size`; choosing 25 sets the page size. Measure *Number Columns*, *With Pagination* at 360/1024/1280 | `.lc-select__clear` `display: none`; value Range right ≤ chevron left − 8 (md); no box intersects |
| AC-4 | Measure at 360 and 1280; `--forced-colors` run | buttons 40 × 40 (md; 32 / 44 in *Pagination Sizes*); `elementsFromPoint` at centre ± 21.5 → the button; ring 2 px `--color-primary-500` offset 2 when `:focus-visible` |
| AC-5 | `html { font-size: 200% }` in `--measure` (the 021 method behind 546 px; the device scale factor doesn't change CSS px) at 360/1024/1280, L/D | `scrollWidth` = viewport at 100 % and 200 %; 1280: one row (h 64); 360 100 %: 2 rows (h 93); 360 200 %: 3 rows |
| AC-6 | *With Action* at rest + *Service Call* (click buttons 2 and 3), 360/1280, L/D | close 44 × 44; action ≥ 44 × 44; edge-midpoint hits; toast/message/icon boxes = baseline (360: 78 / 63 high); message `scrollWidth ≤ clientWidth`; `scrollWidth` 360 |
| AC-7 | Unit: the 4 icons have `aria-hidden="true"` and no `role`; buttons keep `aria-label`. `--axe` on the 4 drawer, the new drawer and the 7 notification-center stories | svg-img-alt 0 (before: 11 of 11 stories, `axe-before.log`); color-contrast 6 and aria-input-field-name 2 are pre-existing, out of scope |
| AC-8 | Unit in `theme-contrast.spec.ts` ("Component pairings of 3.19"): text-error on surface, surface-2, error-subtle and surface-hover (composited over both surfaces), ≥ 4.5 L/D; regex: no `rgba(` in `menu.component.scss`. Measure the 4 opened danger menus L/D | §5 values; min 6.37 |
| AC-9 | Measure tab sequence and `:focus-visible` after `focus()`; names via `axe.commons.text.accessibleText` | select → prev → next; names unchanged |
| AC-10 | Compat template: a second `lc-table` with `[paginate]="true"`; `EXPECT_IN_HTML` for `lc-table-pagination__pager` and "/ page" | both on 21 and 22 |
| AC-11 / 12 | full test run; changelog lines (§2 Compatibility); manifest test sees `pageSizeLabel` | — |

**Baselines** (main 1a12739, `--full`, L/D): `tmp/story-shots/024/baseline` = 22 table stories + `layout-page-header--comfortable` at 360/1024/1280, and toast 6, toast-outlet 4, drawer 4, notification-center 7, menu 5 at 360/1280. `baseline-open` = the 5 menus opened at 360 (not at rest).
**Expected diffs** in `baseline`: table `--with-pagination`, `--with-filtering`, `--full-featured`, `--number-columns` (pagination) and `--with-cell-formatting-and-styling` at every width and theme; all others identical. The first three also differ between runs at 1024/1280 (random salaries). In `baseline-open`: the 4 menus with a danger item.

**Risks:** `_ngcontent` specificity (022 pitfall); story `<style>` scoping; rounded corners aren't hit-tested; `1lh` needs Safari 16.4+ (without it the declaration drops and the toast grows 15 px, no overlap); at 200 % the toast close box reaches 1 px over the toast border (transparent at rest).
