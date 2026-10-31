# Build 024: Review findings follow-up

- **Branch:** `feat/3.19-review-findings-follow-up`
- **Commit:** see `git log -1` on the branch, `feat(table,toast,drawer,notification-center,menu): review findings follow-up`

## Files changed

| File | Change |
|---|---|
| `table/table.component.{ts,html,scss}` | `pageSizeLabel` input; `paginationSize` computed; `lc-table-pagination--sm/md/lg`; `__pager` wrapper; body-cell `font-size`/`color` in `:where()` rules; `__empty` colour dropped; wrapping pager, 32/40/44 px buttons with 44 px `::before`, ring; `--lc-select-clear-display: none`; `cellClass` JSDoc |
| `toast/toast.component.scss` | close 44 × 44 (margin −12), action ≥ 44 × 44 (`margin-block: min(0px, …1lh…)`), rings offset −2, message `overflow-wrap: break-word` |
| `drawer/…html`, `notification-center/…html` | `[decorative]="true"` on the 4 icons |
| `menu/menu.component.scss` | danger `--color-text-error`, hover `--color-error-subtle`, `:not(.lc-menu__item--disabled)` |
| stories | Table *Number Columns* (DE `pageSizeLabel`), *With Cell Formatting And Styling* (`::ng-deep` token classes, Account `cellClass`), new *Pagination Sizes*; Toast *With Action*; Drawer *Without Heading* + `ariaLabel` argType; table `pageSizeLabel` argType |
| specs (new) | `table.pagination.spec.ts` (17), `toast.targets.spec.ts` (5), `drawer.icons.spec.ts` (2), `notification-center.icons.spec.ts` (2); `theme-contrast.spec.ts` + "Component pairings of 3.19" (2 + 2 × 4) |
| `tools/compat/…/home.html`, `check-angular-majors.mjs` | paginated `lc-table#compat-table-319`; check "table pagination: size class, "5 / page" and the pager group (024 AC-10)" |

No existing assertion changed (`table.align.spec.ts` still finds `.lc-table tbody tr td` padding and the sm/lg `th, td` padding rules).

## Acceptance criteria

| AC | Covered by (measured) |
|---|---|
| AC-1 | spec: only `:where(...)` rules set td colour/size, order base→sm→lg, `encapsulateStyle` scopes inside `:where()`, `__empty` has no colour. AOT consumer page (compat 22): `:where(.lc-table[_ngcontent-…] tbody[…] tr[…] td[…])`. Story 1280 L/D: Margin = `--color-text-success/-warning/-error` (5.30/5.77/12.59 L, 8.40/6.35/8.69 D), Account 16 px, other cells text-primary 14 px (unchanged), SLA opacity .85, Margin weight 700 (cellStyle) |
| AC-2 | spec: options "5 … 50 / page" default, "/ Seite", empty → "10"; story shows "5 / Seite" |
| AC-3 | spec: hook in CSS, choosing 25 → "1–25 of 30". Measure *Number Columns*, *With Pagination*, *Pagination Sizes* 360/1024/1280 L/D: × `display: none`, only the chevron visible, 0 overlaps, value ends 8 px before the chevron (md) |
| AC-4 | 32/40/44 px buttons, `::before` inset −7/−3/−1 px → 44 px hit (88 at 200 %), edge hits at ±21.5 true, 6 px clear of the select (2 at sm); ring 2 px `--color-primary-500` offset 2; forced colours: ring solid 2 px in Highlight, borders ButtonBorder/GrayText |
| AC-5 | `scrollWidth` = viewport at 360/1024/1280 L/D, 100 % and 200 %. 360: h 93, 2 rows (200 %: 3 rows, select 226 × 80, pager 252 × 80). 1024/1280: one row, h 64 (200 %: h 128) |
| AC-6 | *With Action* + *Service Call* 360/1280 L/D: close 44 × 44, action 51.4/93.7 × 44, touching (gap 0), edge hits true; toasts 328 × 78 / 320.1 × 63 (Service Call 360, = design), icon and close svg boxes as before; message never clipped; `scrollWidth` = viewport |
| AC-7 | specs on the 4 sites (all 4 fail with the old templates); axe on 4 + 1 drawer and 7 NC stories: `svg-img-alt` 11 → 0; left: color-contrast 6 (`.lc-nc__filter`), aria-input-field-name 2 (pre-existing) |
| AC-8 | theme-contrast spec + measure of the 4 opened menus: rest 12.59/12.05 L, 7.21/8.69 D; hover 10.98 L, 7.21/8.38 D; focus 11.44 L, 6.37/7.77 D; ring 3.97 L, 6.69/8.16 D. No raw colour in `menu.component.scss` |
| AC-9 | tab stops select → prev → next (× gone, as designed), names unchanged (`i18n-labels.spec.ts` untouched, DOM pins); `:focus-visible` true on pager and toast close |
| AC-10 | compat 22: 84 checks ok, incl. the new one ("5 / page", `--md`, `__pager` before JS) |
| AC-11/12 | full suite green, no assertion changed; manifest: `pageSizeLabel` default `'/ page'` with its JSDoc, the 5 stories with descriptions (temporary `test:tools` check, removed) |

## Gates

Jest, lint, test:tools and Storybook ran on the `libs`/`tools` tree of the request commit (the branch head; skip while `git diff --quiet feat/3.19-review-findings-follow-up -- libs tools` holds). Build and compat ran on the WIP commit `f2efc10`, which differs only in `toast/toast.stories.ts` (`lang="de"` moved onto the toast, see Deviations; stories are not in the package).

| Gate | Result |
|---|---|
| test | 205 suites, 4696 passed, 8 skipped (was 201 / 4660) |
| lint | 0 errors, 162 warnings (baseline) |
| build | 122 "Built" (f2efc10; stories are not in the package) |
| test:tools | 22 / 22 |
| build-storybook | 961 stories (+3) |
| Story shots | `tmp/story-shots/024/after` vs `baseline` (`--full`): table 30 of 138 differ = the 5 expected stories × 6; others 16 of 104 differ = 4 open danger menus × 4, pixel diff confined to the danger label. New: `tmp/story-shots/024/new`. Measures: `tmp/story-shots/024/m-*`, modules `tmp/024/measure/` |
| compat `--only=22` | 84 checks ok (f2efc10) |

## Deviations from the design

| # | What | Why |
|---|---|---|
| 1 | *With Action*: `lang="de"` on the second `lc-toast`, not on a wrapper `div` | In a block wrapper the toast host is `display: inline` (`:host { display: block }` is dead under `ViewEncapsulation.None`) and lost its card look. Pre-existing for every standalone toast (Success: `inline`); follow-up |
| 2 | §9 missed the 4 menu stories in `baseline`: they render open (`isOpen: true`) | Expected AC-8 change |
| 3 | §9 "13 px" for plain cells: 14 px measured, shots identical to baseline | Design typo |
| 4 | Drawer `ariaLabel` argType; *Pagination Sizes* captions "size sm/md/lg" | Story conventions / telling the tables apart |

Note: *With Action* is canvas-wide at 1280 (1248 px), like the other single-toast stories. Not fixed (spec scope, design §6): 30 `lc-icon` sites without `decorative`/`ariaLabel` in log-viewer 6, document-viewer 10, gallery 7, combobox 3, file-upload 3, field-group 1.

## Changelog draft

The review findings of 3.15–3.18 (requests 020, 021, 023): table cell classes and pagination, toast tap targets, decorative icons, menu danger contrast. No API breaks.

### Added
- **`lc-table pageSizeLabel`** (021 review F2, sources page): the text after the number in each page-size option, default `'/ page'`; German `pageSizeLabel="/ Seite"` → "10 / Seite".
- Stories: Data Display/Table "Pagination Sizes"; Feedback/Toast "With Action"; Feedback/Drawer "Without Heading".

### Fixed
- **`TableColumn.cellClass`** (021 review F1): a class colour or font size now applies to its cells (the kit's cell defaults have zero specificity); `cellStyle` still wins over the class. Cells without a class look as before.
- **`lc-table` pagination** (021 review F2): the page-size select has no clear (×) control any more (it sat over "5 / page" at 1280); previous/next are 32/40/44 px like the select, with a 44 px tap area and a 2 px focus ring; the row wraps, so the page stays 360 px wide at 360 px and 200 % text (was 546 px).
- **`lc-toast`** (021 review, Service Call): close 28 × 28 → 44 × 44, action 94 × 29 → 93.7 × 44 px; the toast keeps its size (328 × 78 at 360). A long word breaks inside the message.
- **`lc-drawer`, `lc-notification-center`** (023 follow-up): the close, empty-state and item icons are decorative; axe `svg-img-alt` 11 → 0 stories.
- **`lc-menu` danger item** (020 review S2): `--color-text-error` text, 2.06 → 7.21:1 dark (≥ 6.37 focused), 8.03 → 12.05:1 light; the hover tint is `--color-error-subtle`.

### Compatibility
- No API breaks; `pageSizeLabel` is optional. A `cellClass` colour or font size set before 3.19, and any consumer rule on table body cells by element, now shows. The pagination gains a `lc-table-pagination__pager` wrapper and a `lc-table-pagination--<size>` class; the × (which emptied the select while the page size stayed) is gone. The empty-state cell stays text-primary (its secondary colour never applied).
