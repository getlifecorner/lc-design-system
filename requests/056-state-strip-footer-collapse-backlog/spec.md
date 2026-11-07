# Spec 056: lc-state-strip, description-list badge/total, list showChevron, header contextBadge, hero headingLevel/focusTitle, stacked-bar-chart band, table footerRow/action ariaLabel, card collapsible, button inverse-outline, backlog sweep

- **Status:** ready
- **Type:** bundle: 1 new component, 9 extensions of existing components, 3 backlog fixes (no bug fix changes behaviour for consumers)
- **Affected:** new `lib/state-strip/` (stub `libs/angular-ui-kit/state-strip/ng-package.json`, `index.ts`, line in `src/index.ts`, both READMEs, MCP manifest, tools/compat `EXPECT_IN_HTML`); `description-list`, `list`, `header`, `hero`, `stacked-bar-chart`, `table`, `card`, `button` (+ `button-link` for parity), `combobox`, `tag-input` (stories), `alert` (spec), CHANGELOG
- **Semver impact:** minor. Every change is an optional input, method or variant with an unchanged default. The only type change is `hamburgerClick` (AC-31), argued below as non-breaking.

## Need

finance-intelligence (spec 012, finance visual language, ADR-0017) builds its pages (Quellen, app shell, Cockpit, Services, Regeln, Monatsstand) from the kit and found twelve functions missing. Today it works around them (state badge above the list, text row instead of a strip, sum as a data row, a second `h1`, a 40 px margin on the band, an accordion inside a card, a `section` with `tabindex` around the stage). Details per item are in `request.md`. The owner added the whole backlog (5 rows) to this version.

## What the kit has today

Checked in source (3.35.0): `lc-hero` title is a fixed `<h1>`, no `headingLevel`, no `focusTitle()`; `lc-next-step-card` has both (3.33). `lc-card` and `lc-empty-state` have `headingLevel`. `ButtonVariant` ends at `inverse` (one dark-ground form). `DescriptionListItem` has `term/value/valueSuffix/href` and no badge or total. `TableAction` has `tooltip`, used as aria-label (`tooltip ?? label ?? key`), static for all rows. `lc-table` has no `tfoot`. `lc-textarea` has `announceError` (default `true`); `lc-combobox` always renders `role="alert"`. `lc-sparkline` draws values, not states. No other part covers the rows, so nothing is resolved by documentation. The `lc-card` + `lc-accordion variant="plain"` combination exists but is the workaround the requester wants to drop.

## Scope

- In: the 17 rows below, one AC group per item.
- Not in: new colours or looks beyond what the kit picks from tokens (ADR-0009); `lc-sparkline` changes; a vertical band; a `total` item for `lc-list`; table `footerRow` for the card/list layout below 800 px (the page builds that itself); the WebKit check of 054-n2 (see Assumptions).

## Acceptance criteria

Common to every group: the new input/method is optional, and with it unset the output (DOM, classes, computed CSS) equals 3.35.0 (the existing specs stay unchanged); both themes; EN and DE strings; every new story renders at 360 px.

### Item 1, quellen rows 1-3 (state strip, description-list badge, list chevron)

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | New `lc-state-strip` (entry point `@lifecorner/angular-ui-kit/state-strip`, exported union `StateStripState = 'success' \| 'warning' \| 'error' \| 'neutral'`, `StateStripSegment {state; label}`) renders one segment per entry, in input order (oldest first). No segments: renders nothing (no host box, no a11y node). | unit test |
| AC-2 | Accessible name = `ariaLabel` + count per state, from a `locale` input with EN defaults (e.g. "9 success, 1 error"); a German locale string set reads "9 geladen, 1 fehlgeschlagen". States with count 0 are left out. | unit test (EN, DE) |
| AC-3 | Every segment `label` is reachable without a mouse and by screen reader (design decides how: one focus stop plus arrow keys, or a visually hidden list; not ten Tab stops). `:focus-visible` ring 3:1. | unit test (keyboard), story |
| AC-4 | The four states differ in more than hue (e.g. height, shape or pattern), and each segment's boundary against the page is at least 3:1 in light and dark; computed, not estimated. Colours only from tokens; `forced-colors` and `prefers-reduced-motion` hold. | contrast spec, story |
| AC-5 | Ten segments fit at 360 px without scroll or overflow, in a card of 328 px; more than 10 segments don't break the layout. Segments appear in prerendered HTML before JS (added to `EXPECT_IN_HTML`). | story at 360/1280, prerender |
| AC-6 | Stories: default (9 success, 1 error), all four states, DE locale, empty, dark. Listed in both READMEs, the MCP manifest and the CHANGELOG. | stories, `npm run test:tools` |
| AC-7 | `DescriptionListItem` gets optional `badge: string` and `badgeVariant: BadgeVariant`. With `badge`, the value is an `lc-badge` (`size="sm"`, `rounded`) in `rows`, `stacked` and `columns`; term and value stay one `dt`/`dd` pair; the accessible text is "term, badge text". Without it, the value stays text. Behaviour with `value` set together with `badge` is defined by design (assumption below). | unit test, story at 360/1280 |
| AC-8 | `lc-list` gets `showChevron` (default `false`). With it, each row that is clickable (`clickable`/`itemClick`) or has `href` ends with the kit's `chevron-right` after badge and action; other rows don't. The chevron is `aria-hidden`. Target size (44 px), focus ring, badge and `actionClick` are unchanged. It also holds with the `lcListItem` template (no chevron added there, documented). | unit test, story at 360 (EN, DE long text) |

### Item 2, app-shell rows 1-2 (header contextBadge, description-list total)

| ID | Criterion | Verified by |
|---|---|---|
| AC-9 | `lc-header` gets `contextBadge: { label: string; variant?: BadgeVariant } \| undefined` (default `undefined`). The badge (`sm`, `rounded`) renders inside the context button after the name, for `contextPlacement` "inline" and "below", on every size where the button shows. | unit test, story with `success`, `default`, `warning` |
| AC-10 | The button's accessible name contains label, name and badge word, and the visible text stays in the name (WCAG 2.5.3); the tab stop, 44 px target, focus ring, `contextClick` and `focusContext()` behave as in 3.35. A long DE name plus badge truncates or wraps without overflowing the header at 360 px. | unit test, story at 360 (DE) |
| AC-11 | `DescriptionListItem.total?: boolean` (default `false`): a total item has a rule above and a double rule below, from border tokens, `emphasis: 'strong'` and tabular figures, in `rows`, `stacked` and `columns`; `dt`/`dd` pair kept. | unit test, story at 360/1280, both themes |
| AC-12 | Input `totalAriaLabel` (default `''`, nothing added): a total's accessible text is "totalAriaLabel, term, value" (e.g. "Summe, Gesamtkosten Ist, 522.530,00 €"). The rules are visible in `forced-colors` and meet 3:1 against the surface. | unit test, contrast |

### Item 3, cockpit rows 1-2 (hero headingLevel, band chart)

| ID | Criterion | Verified by |
|---|---|---|
| AC-13 | `lc-hero` gets `headingLevel: 1\|2\|3\|4\|5\|6` (default `1`, exported type `HeroHeadingLevel`). The title renders as that element; font size, weight, line height and spacing are identical for every level at every breakpoint and `size`. | unit test, story `headingLevel=2`, computed-style comparison h1 vs h2 at 360/1280 |
| AC-14 | A page with `lc-page-header` plus `lc-hero headingLevel=2` has exactly one `h1`. | story/unit test |
| AC-15 | `lc-stacked-bar-chart` gets `variant: 'chart' \| 'band'` (default `'chart'`). In `'band'`, horizontal, one category: no axis lines, no grid, no paddings, scale 0..sum; parts fill the host width edge to edge (measured left/right gap 0 px at 360 and 928 px) at `height` px, proportional to the values. `ariaLabel`, data, legend colours and the legend itself work as today. | unit test, story with five token-coloured parts at 360 and 928, `--measure` |
| AC-16 | Band parts keep 3:1 against the surface and each other (or a gap/border from tokens says so); behaviour of `'band'` with several categories or a vertical orientation is defined and documented (assumption). | contrast, unit test |

### Item 4, services rows 1-2 (table footerRow, action ariaLabel)

| ID | Criterion | Verified by |
|---|---|---|
| AC-17 | `lc-table` gets an optional `footerRow` (record of the data shape, default none). It renders one `tr` in `tfoot` with the table's columns, `lcTableCell` templates and `cellClass`/`cellStyle`, below all data rows. | unit test, story (tree + sort + footer) at 800 and 1280 |
| AC-18 | The footer row stays last and unchanged under every sort, search, filter, tree expand/collapse and page; it is not counted in row totals, selection or "n rows" texts. | unit test |
| AC-19 | The footer row is a footer row for assistive technology (`tfoot` rowgroup semantics, cells keep column association); a rule from border tokens separates it, visible in `forced-colors`. At 360 px the card/list layout (if the table has one) shows the footer row or documents the limit. | unit test, story |
| AC-20 | `TableAction.ariaLabel?: string \| ((row, rowIndex) => string)`. The row button's accessible name is its result ("Herkunft von Demo Netz") while label, icon and look stay; precedence: `ariaLabel` over `tooltip` over `label` over `key`. Without it the name is as today. | unit test (names of 3 rows differ), story with accessibility-tree snapshot |

### Item 5, regeln row 1 (card collapsible)

| ID | Criterion | Verified by |
|---|---|---|
| AC-21 | `lc-card` gets `collapsible` (default `false`), `expanded = model(true)`-style two-way input (`[(expanded)]`, output `expandedChange`). Initial `expanded` default must show the body so a plain `collapsible` doesn't hide content unexpectedly (assumption below). | unit test |
| AC-22 | With `collapsible`, the head (icon, title, sentence) is one `button` of at least 44 px height with `aria-expanded` and `aria-controls` pointing to the body region; Enter, Space and click toggle it and emit `expandedChange`. Closed: only the head shows (body and footer not rendered visibly, not in the a11y tree, not focusable). | unit test, story at 360 |
| AC-23 | `icon`, `iconSize`, `headingLevel` keep working (the title stays a heading; the button sits inside it or the heading keeps its level). The `card-header-action` slot stays a separate interactive element outside the toggle button (no button in button). The toggle sign comes from tokens, rotates unless `prefers-reduced-motion`, and is hidden from screen readers. | unit test, story |
| AC-24 | Story at 360 px: three cards, one open and two closed, light and dark, DE long titles; focus ring 3:1. Prerendered HTML shows the open state defined by the input. | story, prerender |

### Item 6, monatsstand rows 1-2 (hero focusTitle, button inverse-outline)

| ID | Criterion | Verified by |
|---|---|---|
| AC-25 | `lc-hero.focusTitle()`: sets `tabindex="-1"` on the title and focuses it; `document.activeElement` is the title; the title is not in the tab order before or after. Works in every `color`, `variant`, `size` and `headingLevel`. Without a call, no `tabindex` is rendered. | unit test |
| AC-26 | The focus ring on the title is visible on every `color` gradient at 3:1 (computed) and the label is read before the title (accessible name/DOM order documented). | contrast, story |
| AC-27 | New `ButtonVariant` `inverse-outline` (the designer may choose `inverse-ghost` and must justify it in design.md), also in `lc-button-link`: same sizes, icon slots, `loading`, `disabled`, `ariaDescribedBy` as `inverse`. Text 4.5:1 and outline/focus ring 3:1 on every `lc-hero` `color`, light and dark; hover, focus, disabled, loading distinct. | contrast spec, story on `lc-hero` |
| AC-28 | Next to an `inverse` button in one row: equal height at all sizes, and it is visibly the quieter one; `forced-colors` holds. | `--measure`, story at 360 |

### Item 7, backlog

| ID | Criterion | Verified by |
|---|---|---|
| AC-29 | 055-n1: the tag-input stories *Keyboard Focus*, *Touch Targets (DE)*, *Long Tags* bind `separator`, `maxTags`, `allowDuplicates`, `removable`, `disabled` in `render`, or `parameters.controls.include` lists only bound controls. No control stays that does nothing. | story check in Storybook |
| AC-30 | 055-n2: `alert.close-target.spec.ts` AC-15 no longer pins length/sha1 of the whole CSS; it asserts the × rules (`::before` hit area, `position`, `color: inherit`, the 28 px box). An unrelated alert SCSS edit doesn't fail it. | spec; mutation by adding an unrelated rule |
| AC-31 | 055-n3: `hamburgerClick` emits the hamburger `<button>` element (`output<HTMLElement>`), so `[returnFocusTo]` of `lc-sidenav` can take it from `$event`. Handlers without argument still compile and run. Story/doc snippet of the pairing with `lc-sidenav`. | unit test, strictTemplates compat check |
| AC-32 | 055-n4: `lc-combobox` gets `announceError` (default `true`, as `lc-textarea`). `false`: the error is not `role="alert"` but is in `aria-describedby`; `true`: as today. Documented for the focus-after-422 case. | unit test, story |
| AC-33 | 054-n2: if WebKit (Playwright) can be run here, the *Focus return (3.34)* stories of modal and confirm-dialog are checked (`activeElement` = trigger `<button>` after close) and the row is deleted. If it can't, the row stays in `BACKLOG.md` with the reason and the date, and `build.md`/`release.md` say so. Not a blocker for release. | build.md |
| AC-34 | Whole bundle: full Jest suite, lint, library build, Storybook build, compat matrix (Angular 21 and 22, AOT, strictTemplates, prerender) green; CHANGELOG entry per gap ID (Added/Changed), README lists, MCP manifest includes `lc-state-strip` and the new inputs. | gates |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged; no new runtime dependency; no API break. New text defaults are English, German verified.
- Pure SCSS from tokens; public hooks `--lc-<component>-<property>` with documented defaults where a new look can be tuned.

## Assumptions

- Assumption: `BACKLOG.md` rows 055-n1..n4 are folded here and deleted; 054-n2 stays there (no WebKit here; AC-33).
- Assumption: `hamburgerClick: output<void>` to `output<HTMLElement>` is not a break: template handlers ignore or take `$event`; nobody can subscribe with a type that fails except code that declares the parameter as `void`. Noted in the CHANGELOG *Compatibility*.
- Assumption: `badge` on a description-list item replaces the value text visually but `value` stays required (screen-reader fallback and sorting); the badge text is `badge`, not `value`. The designer may propose making `value` optional if it is non-breaking.
- Assumption: `lc-card` `expanded` defaults to `true` (a collapsible card is open unless told otherwise); the page sets `[expanded]="false"` for closed ones.
- Assumption: `band` supports horizontal, one category; other settings fall back to `chart` behaviour with a documented note, because the requester only needs the band.
- Assumption: the state strip's text alternative uses a `locale` input like the other kit components; state words come from it and the requester passes the German set.
- Assumption: `focusTitle()` on `lc-hero` is the same pattern as `lc-next-step-card.focusTitle()` (3.33); no `announce` input is added.
- Assumption: footer row at 360 px follows the table's existing small-width behaviour; if the table has none, the limit is documented (AC-19), because the Services page uses `lc-list` below 800 px.

## Open questions

None for the owner. Design choices left to the `ui-ux-designer`: state-strip keyboard model and non-hue distinction (AC-3, AC-4), `inverse-outline` vs `inverse-ghost` (AC-27), card toggle sign and heading/button nesting (AC-23).
