# Spec 050: overlay panel language (select, tooltip); lc-bottom-nav moreBadge, lc-sidenav badgeAriaLabel

- **Status:** ready
- **Type:** bug fix (A) + extension of `lc-bottom-nav` and `lc-sidenav` (B)
- **Affected:** `select/` (ts, html), `tooltip/tooltip.directive.ts`, `bottom-nav/`, `sidenav/` (ts, html, stories, specs), `internal/a11y` (reuse only), CHANGELOG, MCP manifest (via JSDoc)
- **Semver impact:** minor. Two new optional inputs (`moreBadge`, `badgeAriaLabel` on sidenav); defaults render as before. The language fix adds an attribute only where the host has a `lang`.

## Need

**A. 049-f1 (owner, WCAG 3.1.2, should-fix).** `lc-select` opens its listbox through `cdkConnectedOverlay` under `<body>`. Inside a `lang="de"` host the panel's `closest('[lang]')` is `html:en` (measured in 049 review at 360 px light), so German options are announced as English. 049 fixed this for datepicker, date-range-picker and combobox with `closestLang` + `[attr.lang]="panelLang()"`. The other overlays were "not measured".

**B. Finance Intelligence (spec 010, navigation counter "Offene Zuordnungen"; ADR-0009: functions only, no look change).**
1. The "More" entry that `lc-bottom-nav` creates itself (overflow or `showMore`) cannot carry a badge: `BottomNavItem.badge` exists only on the consumer's items, and the kit builds the More item internally.
2. `lc-sidenav` renders `item.badge` visually (`lc-badge`) but has no accessible name for it (no `badgeAriaLabel`, unlike `lc-bottom-nav`), so a screen reader hears "Zuordnungen" without the count.

## What the kit has today

| Area | State | Gap |
|---|---|---|
| `closestLang` (`internal/a11y`), `panelLang` in combobox, datepicker, date-range-picker | Done in 3.30.2 | not applied to select, tooltip |
| `lc-select` | `cdkConnectedOverlay`, panel `.lc-select__dropdown`, no `lang` | A |
| `lcTooltip` | `Overlay.create(...)`, tooltip element under `<body>` | A |
| `lc-menu`, `lc-popover` | Not CDK: `position: absolute` inside the host (`menu.component.scss:17`, `popover.component.scss:18`) | Panel is a descendant of the host, so it inherits `lang`. Nothing to fix; pin with a test |
| `lc-bottom-nav` | `badgeAriaLabel = input('{value} new')`, `badgeText()` renders a `.lc-bottom-nav__sr-only` span; the More entry (`moreItem`) has no badge | B1 |
| `lc-sidenav` | `lc-badge` at 5 template sites (items, children, grandchildren, collapsed rail), no accessible text | B2 |

## Scope

- In: `lang` on select panel and tooltip; `moreBadge` on bottom-nav; `badgeAriaLabel` on sidenav; stories and tests for each.
- Not in: menu/popover code changes; the 049 backlog rows (049-n2 combobox width, 049-n3 live lang change, 048-n2 are other components); any visual change to badges, pills or the rail (ADR-0009); a live-region/count announcement.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | Open `lc-select` inside `lang="de"`: `.lc-select__dropdown.closest('[lang]')` has `lang="de"`. Inside `lang="fr-CH"` it is `fr-CH`. | unit test (pattern of `combobox.panel-lang.spec.ts`) |
| AC-2 | `lc-select` without any ancestor `lang`: the panel gets no `lang` attribute (page language applies). Closed: no panel in the DOM. | unit test |
| AC-3 | Show a `lcTooltip` on a host inside `lang="de"`: the tooltip element (id in `aria-describedby`) has `lang="de"` on it or an ancestor inside the overlay pane. No ancestor `lang`: no attribute added. Hide: removed with the tooltip. | unit test (open overlay, query `document.body`) |
| AC-4 | `lc-menu` and `lc-popover` panels inside `lang="de"` resolve `closest('[lang]')` to `de` (descendants of the host). Test only, no code change unless it fails. | unit test |
| AC-5 | `moreBadge` (`{ value: string \| number; variant?: BadgeVariant }`, default `null`/unset) renders the badge on the More entry, in overflow and with `showMore`, with the same markup and classes as item badges (`.lc-bottom-nav__badge`, `lc-badge` xs rounded). | unit test + story |
| AC-6 | The More entry with `moreBadge` has hidden text `badgeAriaLabel` with `{value}` replaced (e.g. `3 offen`), same `.lc-bottom-nav__sr-only` span as items; link name = label + badge text. Badge visuals stay `aria-hidden`. Without `moreBadge`: no badge, no extra text. | unit test |
| AC-7 | `moreBadge` rendered on the More entry in overflow does not add the hidden items' badges implicitly (no summing). Consumer passes the value. | unit test |
| AC-8 | `lc-sidenav` input `badgeAriaLabel` (default `'{value} new'`, `{value}` placeholder, JSDoc `@default`). Every item with a `badge` (all five template sites incl. collapsed rail) exposes visually hidden text built from it; the `lc-badge` itself stays out of the accessibility tree (no double read). | unit test per site (item, child, grandchild, collapsed) |
| AC-9 | Item without badge: no extra text. Sidenav DOM/classes without `badgeAriaLabel` set: only the new hidden span appears on badged items (default `'{value} new'`); computed layout of badged and unbadged items identical to before. | unit test; story measure at 360/1280 of item height and badge rect, before = after |
| AC-10 | No look change: badge position, size and colours in light and dark, collapsed rail and expanded, unchanged (compare screenshots by hash). The hidden span takes no layout space (sr-only technique already used in bottom-nav). | `story-shots --compare`, widths 360, 1024, 1280, light and dark |
| AC-11 | German text: stories with `badgeAriaLabel="{value} offen"` and a long label ("Offene Zuordnungen") at 360 px show no overflow or truncation change. Accessible name verified as "Offene Zuordnungen 12 offen". | story at 360 + unit test |
| AC-12 | Keyboard and SR: the badged More entry and sidenav items stay one tab stop; focus ring unchanged; the name is exposed via the hidden text (computed accessible name asserted). | unit test |
| AC-13 | Prerendered HTML (`tools/compat`): hidden badge text is present in the server HTML for a badged bottom-nav More entry and a sidenav item. | `EXPECT_IN_HTML` in `check-angular-majors.mjs` |
| AC-14 | Unchanged defaults: existing specs of select, tooltip, bottom-nav, sidenav pass without edited assertions; no input removed or retyped. | full suite |
| AC-15 | Stories: one per new input (bottom-nav `moreBadge` overflow + `showMore`, EN and DE; sidenav badge accessible name, expanded and collapsed; select and tooltip in a `lang="de"` wrapper). Each argType has `description` and `table.defaultValue`. | story review |
| AC-16 | CHANGELOG entry (Added, Fixed, Compatibility) names 049-f1 and the Finance Intelligence consumer; component lists in READMEs unchanged (no new component). | review |

Always covered: 360 px and desktop widths (AC-10, 11) · light and dark (AC-10) · keyboard and SR (AC-12) · EN and DE (AC-11) · prerendered HTML (AC-13) · unchanged defaults (AC-14).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Reuse `closestLang` and the `panelLang` pattern from 049; do not add a `lang` input to select or tooltip.
- Placeholder syntax `{value}` identical to `lc-bottom-nav`.

## Assumptions

- Assumption: `lc-menu` and `lc-popover` are inline (no CDK, no body portal), hence not affected; AC-4 proves it.
- Assumption: `moreBadge` takes the same shape as `BottomNavItem.badge`, and the More entry shares `badgeAriaLabel` (no separate label input).
- Assumption: sidenav hidden text is added after the label inside the link/button, as in bottom-nav; the designer picks the exact placement for the collapsed rail (label hidden there, so the name must still include it).
- Assumption: no `requests/BACKLOG.md` row concerns select, tooltip, bottom-nav or sidenav; nothing to fold.
- Assumption: tooltip `lang` is set on the tooltip element (the component the kit owns), not on the CDK pane.

## Open questions

None.

## Resolution

Not applicable: the kit does not cover these.
