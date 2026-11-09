# Request 057: lc-select clear target and focus return, lc-description-list whitespace, lc-hero slot contrast and fill, lc-table action size, lc-list nested action, CHART_PALETTE contrast, lc-state-strip dense strips, backlog sweep (3 rows)

- **From:** bundle (owner, finance-intelligence)
- **Received:** 2026-11-09
- **Gap IDs:** 056 follow-ups S-1, F-2, F-1; services-2026-11-09 rows 1–3; regeln-2026-11-09 row 1; monatsstand-2026-11-09 row 1; cockpit-2026-11-09 row 1; BACKLOG 054-n2, 056-n1, 056-n2
- **Referenced files:**
  - /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/056-state-strip-footer-collapse-backlog/release.md (Open items S-1, F-2, F-1)
  - /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/services-2026-11-09.md (rows 1–3)
  - /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/regeln-2026-11-09.md (row 1)
  - /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/monatsstand-2026-11-09.md (row 1)
  - /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/cockpit-2026-11-09.md (row 1)
  - /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/BACKLOG.md (all 3 rows)
- **Kit version at intake:** 3.36.0

## Requirement (verbatim)

Bundle `tmp/lc-request/bundles/20261109-231613.md`, started by the owner on 2026-11-09 23:16: one request and one version for all items.

### Item 1 (20261107-170200-056-follow-ups)

- **From:** owner
- **Dir:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system
- **Date:** 2026-11-07 17:02
- **File:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/056-state-strip-footer-collapse-backlog/release.md

Follow-ups S-1, F-2, F-1 of request 056: S-1 lc-state-strip cells narrower than the 24 px WCAG 2.5.8 target at 30/60 runs (document it and decide on another pointer path for dense strips); F-2 lc-list clickable row with a built-in action nests the action inside role="button" (axe nested-interactive, WCAG 4.1.2, since 3.3); F-1 CHART_PALETTE success and warning colours below 3:1 against light pages in 13 charts; details in requests/056-state-strip-footer-collapse-backlog/release.md Open items.

Open items S-1, F-2, F-1 of the referenced file, verbatim:

| ID | Finding | Source | Route |
|---|---|---|---|
| S-1 | `lc-state-strip` with 30 / 60 runs: cells 10.92 / 5.45 px wide, below the 24 px target of WCAG 2.5.8 (hover and click show the caption; axe `target-size` incomplete on 90 nodes). Document in the `segments` JSDoc and the story; decide on another pointer path for dense strips | review S-1 | queue |
| F-2 | `lc-list` `clickable` + built-in `action`: action inside `role="button"` (axe `nested-interactive`, WCAG 4.1.2), since 3.3 | review F-2 | queue |
| F-1 | `CHART_PALETTE`: `--color-success-default` 2.47–2.72:1, `--color-warning-default` 2.05–2.26:1 against light pages in 13 charts (3:1 needed) | review F-1, design §1 | queue |

### Item 2 (20261109-000811-63212)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-09 00:08
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/services-2026-11-09.md

row 1 (services-2026-11-09): lc-select clear button takes taps on 24 px only; 44 px tap area at size lg like lc-search-input (Services toolbar, Quellen source choice)

File header (context), verbatim:

- **From:** finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.36.0; checked through the `lc-design-system` MCP, story „Touch Targets“ of `lc-select`, on 2026-11-09)
- **Approved concepts:** [docs/ux/concepts/services.md](../concepts/services.md), section 7 („Lücken im Design-System“) and [quellen.md](../concepts/quellen.md), section 7 (German), for spec 012 (finance visual language, [ADR-0017](../../adr/0017-finance-visual-language.md)). Our rule is a 44 × 44 px target for every control on the phone ([ADR-0006](../../adr/0006-mobile-first.md)).
- **Look:** none requested. The row asks for a larger tap area, not a larger icon; today's default stays unchanged (ADR-0009).
- **Related:** the clear button of `lc-search-input` already takes taps on 44 px through a `::before` around its 24 px button; the clear button of `lc-combobox` was answered in 3.30.0 ([regeln-2026-11-03.md](regeln-2026-11-03.md), row 5).
- **Status:** open; collected on 2026-11-09 in the design system's inbox (row 1: item 20261109-000811-63212; row 2: item 20261109-002940-70565; row 3: item 20261109-003350-72586).

Row 1 of the referenced file, verbatim:

| # | Component | Gap | Proposal | Accepted when | Our transition until the release |
|---|---|---|---|---|---|
| 1 | `lc-select` | A select with a value always shows its clear button, and it takes taps on 24 × 24 px only (3.27.1, request 043: WCAG 2.5.8 met by size). On the phone our toolbar selects (`size="lg"`, 48 px field: sort and level on „Services“, the choice on „Quellen“) need 44 × 44 px targets. | Widen the area that takes the tap to 44 × 44 px where the field allows it (`size="lg"`), as `lc-search-input` does with a `::before` around the button; the visible 24 px button, the chevron and the layout stay. Other sizes stay as today. | With `size="lg"` and a value, a tap anywhere in a 44 × 44 px area around the clear button clears, without covering the chevron's tap area; axe `target-size` passes; a story at 360 px. Without `size="lg"` nothing changes. | The e2e target check measures this button against WCAG 2.5.8 (24 px and spacing) instead of 44 px, like the tree toggle of `lc-table`; `clearAriaLabel` is „Auswahl löschen“, clearing sets the default back. |

### Item 3 (20261109-000811-63239)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-09 00:08
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/regeln-2026-11-09.md

row 1 (regeln-2026-11-09), bug: lc-description-list renders no whitespace between dt/dd and rows; text runs together (axe label-content-name-mismatch, copy)

File header (context), verbatim:

- **From:** finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.36.0; checked with axe 4 in Chromium and WebKit on 2026-11-09)
- **Approved concept:** [docs/ux/concepts/regeln.md](../concepts/regeln.md), section 7 („Lücken im Design-System“) (German), for spec 012 (finance visual language, [ADR-0017](../../adr/0017-finance-visual-language.md)). The page opens with five tiles, one per kind of rule; each tile is a clickable `lc-card` holding a title, a count and an `lc-description-list` of the ways of maintenance („aus USM übernommen 1“, „im Modul gepflegt 2“).
- **Look:** none requested. This is a bug report: the rendered text has no word breaks; nothing visible changes (ADR-0009).
- **Related:** the same kind of fix as request 031 for `lc-stat-trend` (whitespace between its parts).
- **Status:** open; collected on 2026-11-09 in the design system's inbox (item 20261109-000811-63239).

Row 1 of the referenced file, verbatim:

| # | Component | Gap | Proposal | Accepted when | Our transition until the release |
|---|---|---|---|---|---|
| 1 | `lc-description-list` | The rendered DOM has no whitespace between `dt` and `dd` and between rows. Text taken from it runs together („aus USM übernommen1im Modul gepflegt2“): axe `label-content-name-mismatch` (WCAG 2.5.3) fails for a labelled card that holds a list, and copied text has no word breaks. | Render a whitespace text node between term and value and between rows (as `lc-stat-trend` does since request 031). The layout stays as it is. | The `textContent` of a list reads „Term Value Term Value“ with single spaces; a clickable `lc-card` with `ariaLabel` = its visible text and a list inside passes axe `label-content-name-mismatch`; the look is unchanged. | The tile has no `ariaLabel` and is named by its content (owner decision 2026-11-09); the rule does not apply then. With the fix, a named tile becomes possible again. |

### Item 4 (20261109-000811-63259)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-09 00:08
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/monatsstand-2026-11-09.md

row 1 (monatsstand-2026-11-09), bug: lc-hero default slot at opacity .85 drops lc-badge sm warning/success below 4.5:1 on the hero gradient

File header (context), verbatim:

- **From:** finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.36.0; checked with axe 4 in Chromium and WebKit on 2026-11-09)
- **Approved concept:** [docs/ux/concepts/monatsstand.md](../concepts/monatsstand.md), section 7 („Lücken im Design-System“) (German), for spec 012 (finance visual language, [ADR-0017](../../adr/0017-finance-visual-language.md)). The stage of the page is an `lc-hero`; its default slot carries the name of the month, the seal (`lc-badge` `size="sm"`, `rounded`, variant `warning` „Entwurf“, `success` „Freigegeben“) and the total. The concept keeps the seal in the default slot (`hero-footer` and `hero-media` have other jobs).
- **Look:** none requested. This is a bug report: a kit component in a kit slot falls below WCAG 2.2 AA; the kit chooses the fix from its own tokens (ADR-0009).
- **Status:** open; collected on 2026-11-09 in the design system's inbox (item 20261109-000811-63259). Owner decision 2026-11-09: no local recolour; the build waits for the kit.

Row 1 of the referenced file, verbatim:

| # | Component | Gap | Proposal | Accepted when | Our transition until the release |
|---|---|---|---|---|---|
| 1 | `lc-hero`, `lc-badge` | `lc-hero` renders `.hero__body` (the default slot) at `opacity: .85`. An `lc-badge` in it blends with the teal gradient (#0d353d → #208497): `warning` drops from 5.52:1 to about 4.6:1 and `success` from 4.85:1 to 3.98–4.22:1; axe `color-contrast` fails for the small badge text. `error` passes. | Keep components in the default slot at full opacity (soften only the body text, e.g. through a text colour token instead of `opacity` on the container), or give `lc-badge` an appearance for the hero surface. | Every `lc-badge` variant at `size="sm"` in the default slot of `lc-hero` meets 4.5:1 on each hero gradient; axe `color-contrast` passes; a story with the badges in the hero. | None. The seal stays as designed; the ten Monatsstand e2e checks with axe stay red until the release. |

### Item 5 (20261109-002940-70565)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-09 00:29
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/services-2026-11-09.md

Row 2 only (lc-select: focus returns to the trigger after a tap on an option); row 1 is already collected as item 20261109-000811-63212

Row 2 of the referenced file, verbatim (file header under item 2):

| # | Component | Gap | Proposal | Accepted when | Our transition until the release |
|---|---|---|---|---|---|
| 2 | `lc-select` | After a pointer or touch tap on an option, the focus lands on `body`, not on the trigger (3.36.0). The options are `div`s without `tabindex`, so the press moves the focus out of the trigger before `selectOption()`, and `close()` returns the focus only when it is inside the panel (`restoreFocusFromPanel`). Keyboard choice keeps it. Our concept says that changing sort or level does not move the focus („Services“, S33); a screen reader and the keyboard lose their place after every tap. | Return the focus to the trigger on every close that follows a choice or `Escape`, also when the focus is on `body` (for example by keeping the trigger focused on `mousedown`/`pointerdown` inside the panel, or by focusing the trigger in `selectOption()` for a single select). A click on the backdrop outside keeps today's behaviour. | With a single select, a tap or click on an option closes the panel and `document.activeElement` is the trigger, on Chromium and WebKit; keyboard choice and `Escape` stay as today; a story with a play test. | None: the e2e check of S19 (`services.spec.ts`, focus after choosing the level) stays red until the release; we do not set the focus from outside the kit. |

### Item 6 (20261109-003350-72586)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-09 00:33
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/services-2026-11-09.md

Row 3 only (lc-table: optional size on TableAction, default xs); rows 1 and 2 are already collected

Row 3 of the referenced file, verbatim (file header under item 2):

| # | Component | Gap | Proposal | Accepted when | Our transition until the release |
|---|---|---|---|---|---|
| 3 | `lc-table` | The built-in row action (`TableAction`) has no size input; the kit draws it as `xs` (about 25 px high, read in the 3.36.0 source) at every width. Our ADR-0020 sizes actions inside tables as `lg` (44 px targets) below 1024 px and `sm` from 1024 px. On „Services“ the table stands from 800 px, so between 800 and 1023 px its „Herkunft“ action is below 44 px; on „Quellen“, „Regeln“ and „Monatsstand“ the tables start at 1280 px. | An optional `size` on `TableAction` (`ButtonSize`), default `xs`, so nothing changes for existing tables. | A `TableAction` with `size: 'lg'` or `'sm'` renders its button at that kit size, with text and icon as today; the default stays `xs`; a story with `sm` and `lg`. | The e2e target check measures the table action against WCAG 2.5.8 (24 px and spacing) instead of 44 px, like the tree toggle of `lc-table`; no override of kit internals. |

### Item 7 (20261109-064903-19886)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-09 06:49
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/cockpit-2026-11-09.md

lc-hero: optional input to fill the height of its container (grid row beside a card), see row 1

File header (context), verbatim:

- **From:** finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.36.0; checked through the `lc-design-system` MCP, component „Hero“, and the installed 3.36.0 source on 2026-11-09)
- **Concept:** [docs/ux/concepts/cockpit.md](../concepts/cockpit.md), section 7 („Lücken im Design-System“, German), desktop composition after [ADR-0021](../../adr/0021-the-desktop-is-designed-for-its-space.md): from 1024 px the stage (`lc-hero` `size="sm"`) stands on a grid beside the card „Verteilung“ (`lc-card`), two cells of one row.
- **Look:** none requested. The hero keeps its gradient, paddings, type and slots; it only takes the height its container gives it (ADR-0009).
- **Status:** open; collected on 2026-11-09 in the design system's inbox (item 20261109-064903-19886).

Row 1 of the referenced file, verbatim:

| # | Component | Gap | Proposal | Accepted when | Our transition until the release |
|---|---|---|---|---|---|
| 1 | `lc-hero` | The hero cannot fill the height of its container. The host is `display: block` and the inner `.hero` has no height (3.36.0 source), so in a grid row beside a taller `lc-card` the gradient ends early and the row looks uneven. Giving the host `height: 100%` from outside does not reach `.hero`; the kit's own `justify-content: space-between` and `.hero__inner { flex: 1 }` show that a taller hero is intended. | An optional input, for example `fill` (boolean, default `false`): with `true` the hero takes the full height of its container (host as a flex column, `.hero` grows), the content stays at the top, a `hero-footer` sits at the bottom. Without it nothing changes. | In a CSS grid row with `align-items: stretch` and a taller sibling, `lc-hero` with `fill` ends exactly at the row's bottom edge on every size and variant; without `fill` the height is as today; a story „Fill“ with a hero beside a card. | None: the stage keeps its content height until the release; we do not change the hero's host or inner styles from outside. |

### Item 8 (20261109-231612-62547)

- **From:** owner
- **Dir:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system
- **Date:** 2026-11-09 23:16
- **File:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/BACKLOG.md

All 3 rows of the backlog (054-n2, 056-n1, 056-n2). Owner decision 2026-11-09: the whole queue and the backlog in this one run and one version; the bundle-size limit of about 8 items does not apply, so no item goes back to the inbox for size. 054-n2 needs WebKit, which is not installed here: if it can't be checked, keep it in the backlog and say so.

The 3 rows of the referenced file, verbatim:

| ID | Component | Finding | Source |
|---|---|---|---|
| 054-n2 | modal, confirm-dialog | AC-6: WebKit not automated; manual Safari/iOS check of the *Focus return (3.34)* stories (`document.activeElement` = the trigger's `<button>` after close). Still open after 055: WebKit is not installed here. Still open after 056 (2026-11-07): no Playwright/WebKit installed. | 054 build.md, Deviations |
| 056-n1 | list | `lc-list` label has `overflow-wrap: anywhere` without `hyphens: auto`: German compounds break mid-word at 360 px („USM-Leistungsverre / chnung“, md; „…verrechnu / ng“, sm), more often with the 32 px chevron. The card title hyphenates. Pre-existing. | 056 review.md N-1 |
| 056-n2 | card | *Collapsible* story: no card has a `[card-footer]`, so the footer hiding (AC-22) is covered only by the unit test. Give one closed card a footer. | 056 review.md N-2 |
