# Request 056: lc-state-strip, lc-description-list badge and total, lc-list showChevron, lc-header contextBadge, lc-hero headingLevel and focusTitle(), lc-stacked-bar-chart band, lc-table footerRow and per-row action ariaLabel, lc-card collapsible, lc-button inverse variant, backlog sweep (5 rows)

- **From:** bundle (finance-intelligence, owner)
- **Received:** 2026-11-07
- **Gap IDs:** quellen-2026-11-06 rows 1–3; app-shell-2026-11-07 rows 1–2; cockpit-2026-11-07 rows 1–2; services-2026-11-07 rows 1–2; regeln-2026-11-07 row 1; monatsstand-2026-11-07 rows 1–2; BACKLOG 054-n2, 055-n1, 055-n2, 055-n3, 055-n4
- **Referenced files:**
  - /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/quellen-2026-11-06.md (rows 1–3)
  - /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/app-shell-2026-11-07.md (rows 1–2)
  - /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/cockpit-2026-11-07.md (rows 1–2)
  - /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/services-2026-11-07.md (rows 1–2)
  - /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/regeln-2026-11-07.md (row 1)
  - /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/monatsstand-2026-11-07.md (rows 1–2)
  - /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/BACKLOG.md (all 5 rows)
- **Kit version at intake:** 3.35.0

## Requirement (verbatim)

Bundle `tmp/lc-request/bundles/20261107-132709.md`, started by the owner on 2026-11-07 13:27: one request and one version for all items.

### Item 1 (20261106-233342-61918)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-06 23:33
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/quellen-2026-11-06.md

Rows 1–3 (quellen-2026-11-06): a new state strip for the last ten load runs (segments by state, with a text alternative), a badge as the value of an lc-description-list item, and showChevron on clickable rows of lc-list. Functions only, look from the kit's tokens, defaults unchanged (ADR-0009). From the model page of the finance visual language, so later pages reuse them.

File header (context), verbatim:

- **From:** finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.34.0; checked through the `lc-design-system` MCP and in the changelog up to 3.34.0 on 2026-11-06)
- **Approved concept:** [docs/ux/concepts/quellen.md](../concepts/quellen.md), section 7 („Lücken im Design-System“, rows 1–3) and section 13 (German), approved by the owner on 2026-11-06 for spec 012 (finance visual language, [ADR-0017](../../adr/0017-finance-visual-language.md)). Quellen is the model page of the visual language, so every later page reuses these parts.
- **Look:** none requested. Each row asks for a missing function. Where it has a look, the kit chooses it from its own tokens, and today's default stays unchanged (ADR-0009).

Rows 1–3 of the referenced file, verbatim:

| # | Component | Gap | Proposal | Accepted when | Our transition until the release |
|---|---|---|---|---|---|
| 1   | new (e.g. `lc-state-strip`) | A source card shows the state of its last ten load runs at a glance: one segment per run, coloured by its state (loaded, partly, failed, none yet). The kit has no such part; `lc-sparkline` draws a line of values, not discrete states. | A component with `segments: { state: 'success' \| 'warning' \| 'error' \| 'neutral'; label: string }[]`, an `ariaLabel`, and a text alternative that counts the segments per state for screen readers. Size and colours from the kit's tokens. Without segments it renders nothing. | Ten segments render in order, oldest first, in the kit's state colours. A screen reader reads the `ariaLabel` and the counts per state, e.g. „9 geladen, 1 fehlgeschlagen“. Each segment's `label` is reachable without a mouse. Colours meet WCAG 2.2 AA non-text contrast and differ in more than hue. It works at 360 px. A story. | The card shows the fact „Letzte 10 Ladeläufe: 9 geladen, 1 fehlgeschlagen“ as a text row in `lc-description-list`. |
| 2   | `lc-description-list`       | A fact row cannot hold a state. `items[].value` is text only, so „Zustand: [Geladen]“ cannot be a row of the facts. The badge has to stand above the list. | An optional `badge` and `badgeVariant` on an item, using the same variants as `lc-badge`, or a value template (`lcDescriptionValue`). Without them the value stays text, as today. | An item with `badge` renders an `lc-badge` (sm, rounded) as its value in `rows`, `stacked` and `columns`. Term and value stay one `dt`/`dd` pair. A screen reader reads term and badge text together. Items without it are unchanged. A story. | The state badge stands above the description list (the pattern of the kit story „Link Cards“). „Abgewiesen“ stays text. |
| 3   | `lc-list`                   | Clickable rows (`clickable`, `itemClick`, or `href`) show no chevron. Our list pattern asks for one on rows that open details. Today a page can only add it through the `lcListItem` template, and then it has to rebuild the row. | An input `showChevron` (default `false`). When it is set, each clickable or linked row shows the kit's `chevron-right` at its end, after badge and action. The chevron is decorative (`aria-hidden`). | With `showChevron`, every clickable or linked row ends with the chevron, and rows without `clickable`/`href` do not. The row's target size, focus ring, badge and `actionClick` behave as today. The chevron is hidden from screen readers. Without the input nothing changes. A story. | An `lcListItem` template with `lc-icon name="chevron-right"`, if it works with `clickable` (checked in the build). If it does not, the chevron is left out and the drawing follows the kit. |

### Item 2 (20261107-000535-66592)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-07 00:05
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/app-shell-2026-11-07.md

rows 1–2 (app-shell-2026-11-07): lc-header contextBadge (state badge inside the context button, part of its accessible name); lc-description-list total item with rules and totalAriaLabel. Functions only, no new look (ADR-0009). Related: quellen-2026-11-06 row 2 (badge as a fact value).

File header (context), verbatim:

- **From:** finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.34.0; checked through the `lc-design-system` MCP and in the changelog up to 3.34.0 on 2026-11-06)
- **Approved concept:** [docs/ux/concepts/app-shell.md](../concepts/app-shell.md), section 7 („Neue Lücken im Design-System (Spec 012)“, rows 1–2) and section 13 (German), approved by the owner on 2026-11-07 for spec 012 (finance visual language, [ADR-0017](../../adr/0017-finance-visual-language.md)). The shell carries the month's state on every page with numbers and opens „Herkunft“ from every number, so every page uses both parts.
- **Look:** none requested. Each row asks for a missing function. Where it has a look, the kit chooses it from its own tokens, and today's default stays unchanged (ADR-0009).
- **Related:** a state badge as the value of a fact row (`lc-description-list` item `badge`) is already requested in [quellen-2026-11-06.md](quellen-2026-11-06.md), row 2; the shell would use it for the seal in „Herkunft“.

Rows 1–2 of the referenced file, verbatim:

| # | Component | Gap | Proposal | Accepted when | Our transition until the release |
|---|---|---|---|---|---|
| 1   | `lc-header`           | The context button cannot show the state of its context. The header shows the chosen monthly snapshot („Stand · Oktober 2026 · Fassung 1“), and the user must see whether it is released, replaced or a draft. Nothing can go into the button (no slot, no input). An `lc-badge` in slot `end` renders to the left of the button, and its word is missing from the button's accessible name unless the app adds it to `contextAriaLabel` itself. | An optional input `contextBadge: { label: string; variant?: BadgeVariant } \| undefined` (default `undefined`: nothing changes). The kit renders it as an `lc-badge` (`size="sm"`, `rounded`) inside the context button after the name, and appends the label to the button's accessible name. Look, sizes and texts of the button stay as they are. | With `contextBadge` set, the badge renders inside the context button after `contextName`, in the given variant, on every header size where the context button shows. A screen reader reads label, name and badge word as one name (WCAG 2.5.3: the visible text is part of the name). The button's target size, focus ring, `contextClick` and `focusContext()` behave as today. Without the input nothing changes. A story with `success`, `default` and `warning`. | The seal is an `lc-badge` in slot `end`, to the left of the context button and `aria-hidden`; the word goes into `contextAriaLabel` („Monatsstand wählen, Freigegeben“). |
| 2   | `lc-description-list` | There is no sum row. „Herkunft“ reckons like a receipt: parts, then their sum. The list cannot mark an item as the sum: no rule above it, no double rule below it, and a screen reader does not learn that the row is the sum of the rows above. | An optional `total?: boolean` on `DescriptionListItem` (default `false`: nothing changes). A total item gets a rule above and a double rule below from the kit's border tokens, and `emphasis: 'strong'`. Plus an input `totalAriaLabel` (default empty: nothing is added), read before the term of a total item, e.g. „Summe“. | An item with `total: true` shows a single rule above and a double rule below in `rows`, `stacked` and `columns`, with the value in tabular figures. With `totalAriaLabel` set, a screen reader reads it before the term („Summe, Gesamtkosten Ist, 522.530,00 €“). Term and value stay one `dt`/`dd` pair. Items without it are unchanged. It works at 360 px. A story. | The sum is the last item with `emphasis: 'strong'`, without rules; its term names what is summed („Gesamtkosten Ist“). The double rule in the Quellen canvas (artboard 27) stays as the target picture. |

### Item 3 (20261107-010923-75922)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-07 01:09
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/cockpit-2026-11-07.md

Rows 1–2 (cockpit-2026-11-07.md): lc-hero has no headingLevel input (title always h1); lc-stacked-bar-chart has no band mode without axes and paddings. Functions only, no look change (ADR-0009). The sum row is already requested in app-shell-2026-11-07.md, row 2.

File header (context), verbatim:

- **From:** finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.34.0; checked through the `lc-design-system` MCP, the changelog up to 3.34.0 and the kit source on 2026-11-07)
- **Approved concept:** [docs/ux/concepts/cockpit.md](../concepts/cockpit.md), section 7 („Lücken im Design-System“, rows 1–2) and section 13 (German), approved by the owner on 2026-11-07 for spec 012 (finance visual language, [ADR-0017](../../adr/0017-finance-visual-language.md)). The cockpit is the start page of controlling and CFO: a stage (`lc-hero`) with the total costs and a card „Verteilung“ with a distribution band (`lc-stacked-bar-chart`) and ledger rows below it.
- **Look:** none requested. Each row asks for a missing function. Where it has a look, the kit chooses it from its own tokens, and today's default stays unchanged (ADR-0009).
- **Related:** the sum row (concept row 3) is already requested in [app-shell-2026-11-07.md](app-shell-2026-11-07.md), row 2.

Rows 1–2 of the referenced file, verbatim:

| # | Component | Gap | Proposal | Accepted when | Our transition until the release |
|---|---|---|---|---|---|
| 1   | `lc-hero`              | The title is always rendered as `<h1 class="hero__title">`; there is no input for its heading level. A page that already has its `h1` in `lc-page-header` (page title and focus target after navigation) gets a second `h1` from the stage, whose title is an amount („522.530,00 €“). A page should have exactly one `h1`. | An optional input `headingLevel: 1 \| 2 \| 3 \| 4 \| 5 \| 6` (default `1`: nothing changes), as `lc-card` and `lc-empty-state` already offer. Only the element changes; size, weight and spacing of the title stay as they are on every breakpoint. | With `headingLevel` set to 2 to 6, the title renders as that element with exactly today's look on every size and breakpoint. Without the input, it stays `h1`. The heading outline of a page with `lc-page-header` plus `lc-hero` has one `h1`. A story with `headingLevel=2`. | Two `h1` for now: the `h1` of the page header stays the page title and the focus target; the stage's `h1` reads „522.530,00 €“ with its label as text before it. When the input comes, the stage uses level 2, like the cards. |
| 2   | `lc-stacked-bar-chart` | A distribution band („where the money goes“: one horizontal bar of up to five parts, the rows below it carry names and amounts) is not possible. The chart has fixed paddings (left 40, right 10, top 10, bottom 30 px, no inputs), always draws both axis lines and scales to `niceScale(0, sum, 4)`, so the band never fills its width. | An optional mode without axes and paddings, e.g. an input `variant: 'chart' \| 'band'` (default `'chart'`: nothing changes). In `'band'`: no axis lines, no grid, no paddings, scale from 0 to the sum of the values, the bar fills the full width, `height` is the band's thickness. `ariaLabel`, `legends` colours and data stay as they are. | With `variant="band"`, horizontal and one category, the parts fill the component's width edge to edge at the given height, without axis lines, grid or empty margins, in proportion to their values. Screen readers get the `ariaLabel` as today. Without the input nothing changes. A story with five parts in token colours at 360 px and at 928 px. | The kit as it is: values in per mille (sum 1000), `showLabels`, `showGrid` and `showValues` off, `showLegend` on (legend below the band, since 2026-11-07), `barGap=0`, `height=56`. The band keeps about 40 px empty space at the left, 10 px at the right and both axis lines. The rows below are the text alternative. The cockpit canvas draws it this way. |

### Item 4 (20261107-021541-84454)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-07 02:15
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/services-2026-11-07.md

rows 1–2 (services-2026-11-07): lc-table has no footer/sum row (proposal footerRow) and TableAction has no per-row ariaLabel; functions only, no look requested (ADR-0009)

File header (context), verbatim:

- **From:** finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.34.0; checked through the `lc-design-system` MCP, the changelog up to 3.34.0 and the kit source on 2026-11-07)
- **Approved concept:** [docs/ux/concepts/services.md](../concepts/services.md), section 7 („Lücken im Design-System“, rows 1–2) and section 13 (German), approved by the owner on 2026-11-07 for spec 012 (finance visual language, [ADR-0017](../../adr/0017-finance-visual-language.md)). The page shows the costs per service in one card: a distribution band, a toolbar, a tree table (`lc-table`, from 800 px) or a list (`lc-list`, below), the row „Keinem Service zugeordnet“ and a sum row; every row ends with the action „Herkunft“. Up to 128 business services and more.
- **Look:** none requested. Each row asks for a missing function. Where it has a look, the kit chooses it from its own tokens, and today's default stays unchanged (ADR-0009).
- **Related:** the borderless band is already requested in [cockpit-2026-11-07.md](cockpit-2026-11-07.md), row 2, and the sum row of `lc-description-list` in [app-shell-2026-11-07.md](app-shell-2026-11-07.md), row 2.

Rows 1–2 of the referenced file, verbatim:

| # | Component | Gap | Proposal | Accepted when | Our transition until the release |
|---|---|---|---|---|---|
| 1   | `lc-table`                 | There is no sum or footer row. A total below the data („Gesamtkosten Ist“, with the actual and plan columns filled) can only be built as an ordinary data row: it is sorted, filtered, searched and counted with the data, sits inside the tree, and cannot carry the separating rule of a ledger total. | An optional input, e.g. `footerRow` (default: none, nothing changes), that renders one row with the same columns and the same `lcTableCell` templates as a `tfoot` below the data. It is excluded from sorting, tree, search and paging, and the kit draws its separation from its own tokens. | With `footerRow` set, the row renders in `tfoot` below all data rows with the table's columns and cell templates, stays last under every sort, search and tree state, and is announced as a footer row by screen readers. Without the input nothing changes. A story with a tree table, sorting and a footer row at 800 px and at 1280 px. | The sum as the last row in `data`, bold through `cellClass`, kept behind the shown rows by the page and never sorted with them; no ledger rule beyond what `cellStyle` allows. The services canvas draws it this way. |
| 2   | `lc-table` (`TableAction`) | A row action has one fixed text for every row. With 128 rows a screen reader hears „Herkunft“ 128 times without saying which row it belongs to; WCAG 4.1.2 (name, role, value) needs the name of the object, e.g. „Herkunft von Demo Netz“. | An optional `ariaLabel` on `TableAction` that may be a string or a function of the row (default: the action's text, nothing changes). The visible text, icon and look stay as they are. | With `ariaLabel` as a function, each row's action button has its own accessible name, e.g. „Herkunft von Demo Netz“, while the visible text stays the same. Without the input nothing changes. A story with a row-specific `ariaLabel`, checked with a screen reader or an accessibility tree snapshot. | A template `lcTableCell="provenance"` with `lc-button` (`variant="ghost"`, `iconOnly`, `size="lg"`, `ariaLabel` per row) in the last column; the list (`lc-list`) uses the same template through `lcListItem`. |

### Item 5 (20261107-080936-16349)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-07 08:09
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/regeln-2026-11-07.md

Row 1 (regeln-2026-11-07.md): lc-card cannot collapse; optional input collapsible with [(expanded)] and expandedChange, head as one button with aria-expanded, default unchanged. Look chosen by the kit from its tokens (ADR-0009). The row-action name per row (lc-table TableAction ariaLabel) is already collected as item 20261107-021541-84454 and is not requested again.

File header (context), verbatim:

- **From:** finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.34.0; checked through the `lc-design-system` MCP and the changelog up to 3.34.0 on 2026-11-07)
- **Approved concept:** [docs/ux/concepts/regeln.md](../concepts/regeln.md), section 7 („Lücken im Design-System“, row 8) and section 13, question 14 (German), approved by the owner on 2026-11-07 for spec 012 (finance visual language, [ADR-0017](../../adr/0017-finance-visual-language.md)). The page lists the allocation rules in one card per kind (five kinds, up to 13 rules each). Each card has an icon tile, a title and one sentence (`lc-card` with `icon`). On the phone the rules of three kinds stay closed so the page stays short. Only the rules collapse, the card head stays visible.
- **Look:** none requested. The row asks for a missing function. The kit chooses the toggle's look from its own tokens, and today's default stays unchanged (ADR-0009).
- **Related:** row 9 of the concept (`lc-table`: an accessible name per row for a row action) is the same request as [services-2026-11-07.md](services-2026-11-07.md), row 2, already collected (item 20261107-021541-84454). It is not requested again.

Row 1 of the referenced file, verbatim:

| # | Component | Gap | Proposal | Accepted when | Our transition until the release |
|---|---|---|---|---|---|
| 1   | `lc-card` | A card cannot collapse. `lc-card` has no expanded state and no toggle. A card with an icon tile, a title and a sentence whose body can close needs two components: the card, and inside it an `lc-accordion` (`variant="plain"`) with its own header line („13 Regeln“). The closed card then shows its head plus an extra accordion row. | An optional input `collapsible` (default `false`, nothing changes) with a two-way input `[(expanded)]` and the output `expandedChange`. With `collapsible`, the card head (icon, title, sentence) becomes one button with `aria-expanded` and `aria-controls`, and the body and footer open and close. The kit draws the toggle sign from its tokens. | With `collapsible` and `expanded = false`, only the head shows. Tapping it or pressing Enter or Space opens the body and emits `expandedChange(true)`. The head is one button of at least 44 px height with `aria-expanded`. `icon`, `iconSize`, `headingLevel` and `card-header-action` keep working. Without the input nothing changes. A story at 360 px with three cards, one open and two closed, in light and dark. | The card (`lc-card` with `icon`, `iconSize="sm"` on the tiles) keeps its head always visible. Below 1024 px it holds an `lc-accordion` `variant="plain"` „{n} Regeln“ with the rules, from 1024 px the rules stand without the accordion. The canvas draws it this way (artboards 1 and 2). |

### Item 6 (20261107-081106-16751)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-07 08:11
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/monatsstand-2026-11-07.md

Rows 1–2 (monatsstand-2026-11-07): lc-hero focusTitle() so focus can move to the stage after the action that was used disappears; lc-button variant for a dark ground (inverse-outline or inverse-ghost) so a secondary action on the lc-hero stage is quieter than the inverse main action. Functions only, no look requested (ADR-0009). Related: cockpit-2026-11-07 row 1 (lc-hero headingLevel) can ship with row 1.

File header (context), verbatim:

- **From:** finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.34.0; checked through the `lc-design-system` MCP and the changelog up to 3.35.0 on 2026-11-07)
- **Approved concept:** [docs/ux/concepts/monatsstand.md](../concepts/monatsstand.md), section 7 („Lücken im Design-System“, rows 5–6), section 8 (focus) and section 13 (German), approved by the owner on 2026-11-07 for spec 012 (finance visual language, [ADR-0017](../../adr/0017-finance-visual-language.md)). With a draft, the page leads with a stage (`lc-hero`): the draft's total costs as the title, its state as a badge, the main action „Freigeben“ (release) and „Herkunft“ (provenance) as `inverse` buttons on the stage. Without a draft it leads with `lc-next-step-card`, as before.
- **Look:** none requested. Each row asks for a missing function. Where it has a look, the kit chooses it from its own tokens, and today's default stays unchanged (ADR-0009).
- **Related:** the heading level of the `lc-hero` title is already requested in [cockpit-2026-11-07.md](cockpit-2026-11-07.md), row 1. Row 1 here only asks for focus; both can ship together.

Rows 1–2 of the referenced file, verbatim:

| # | Component | Gap | Proposal | Accepted when | Our transition until the release |
|---|---|---|---|---|---|
| 1   | `lc-hero`   | The stage cannot take focus. After „Einfrieren“ (freeze), „Freigeben“ (release) and „Verwerfen“ (discard) the action that was used disappears, because the result replaces the first block of the page. With a draft, the stage is that block, and focus must move to it, or it falls back to `body` (WCAG 2.2, 2.4.3 Focus Order). The title has no `tabindex`, and the hero has no method for it and no `announce` input like `lc-next-step-card`. | A public method `focusTitle()` that gives the title element `tabindex="-1"` and moves focus to it, as `lc-next-step-card.focusTitle()` does since 3.33.0. Default: nothing changes until it is called; the title stays out of the tab order. | After `focusTitle()`, `document.activeElement` is the hero's title and a screen reader reads it (with the label before it); the title is not reachable with Tab; the focus ring is visible on the dark gradient; without the call the hero behaves as today; it works in every `color`, `variant` and `size`; there is a story or a documented example. | A `section` around the stage with `tabindex="-1"`, its name taken from the title (`aria-labelledby`), without styles; the page moves focus to it after each action. Removed when the kit has the method. |
| 2   | `lc-button` | On a dark ground (the stage of `lc-hero`) the kit offers only one button form, `inverse` (a light pill). A second, quieter form for a dark ground is missing. The stage carries the main action „Freigeben“ and the secondary „Herkunft“ (provenance), so both look the same, and only their order shows which one is the main action. The cockpit stage has the same gap with its one secondary action. | An optional variant for a dark ground, e.g. `variant="inverse-outline"` or `variant="inverse-ghost"`: outline or text in the foreground colour of the dark ground, with the same sizes, icon slots, `loading`, `disabled` and `ariaDescribedBy` as `inverse`. Default: nothing changes; the kit chooses the look from its tokens. | With the new variant on the `lc-hero` gradient (every `color`), the button meets WCAG 2.2 AA for text (4.5:1) and for its outline or focus ring (3:1), in light and dark mode; hover, focus, disabled and loading are distinct; it stands next to an `inverse` button in one row with the same height and is clearly the quieter of the two; without the variant nothing changes. A story on `lc-hero`. | Both buttons `inverse`, „Freigeben“ first, „Herkunft“ with its icon and name. The further draft actions („Neu einfrieren“, „Verwerfen“) stand below the stage on the light ground as `outline` and `ghost`. When the variant comes, „Herkunft“ uses it on the stage (monthly snapshot and cockpit). |

### Item 7 (20261107-132709-36153)

- **From:** owner
- **Dir:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system
- **Date:** 2026-11-07 13:27
- **File:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/BACKLOG.md

All 5 rows of the backlog (054-n2, 055-n1..n4). Owner decision 2026-11-07: all collected requests and the backlog in this one run and one version; the bundle-size limit of about 8 items does not apply, so no item goes back to the inbox for size. Fix what is a defect; a known limit may be resolved as documented with a reason. 054-n2 needs WebKit, which is not installed here: if it can't be checked, keep it in the backlog and say so.

The 5 backlog rows at intake, verbatim:

| ID | Component | Finding | Source |
|---|---|---|---|
| 054-n2 | modal, confirm-dialog | AC-6: WebKit not automated; manual Safari/iOS check of the *Focus return (3.34)* stories (`document.activeElement` = the trigger's `<button>` after close). Still open after 055: WebKit is not installed here. | 054 build.md, Deviations |
| 055-n1 | tag-input (stories) | *Keyboard Focus*, *Touch Targets (DE)*, *Long Tags*: the `render` binds only `label`, `placeholder` and `removeTagAriaLabel`, so `separator`, `maxTags`, `allowDuplicates`, `removable` and `disabled` show as controls but do nothing. Bind them or limit `parameters.controls.include` (as 053-n3 did for the outlet). | 055 review r1, N-1 |
| 055-n2 | alert (spec) | `alert.close-target.spec.ts` AC-15 pins length and sha1 of the whole compiled alert CSS (minus the 3.35 band), so the next unrelated alert SCSS edit fails it. Replace with targeted assertions on the × rules (`::before` hit area, `position`, `color: inherit`), as 053-n1 did for the outlet. | 055 review r1, N-2 |
| 055-n3 | header | `hamburgerClick` is an `output<void>`, so a page can't hand the hamburger to `lc-sidenav` `returnFocusTo` without querying `.lc-header__hamburger button`. Consider emitting the trigger element. | 055 design §1, F-1 |
| 055-n4 | combobox | No `announceError` input (as `lc-textarea` has): the error is always `role="alert"`, so a focus moved to the combobox after a 422 reads the error twice (alert and `aria-describedby`). | 055 design §1, F-2 |
