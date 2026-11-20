# Build 072: Backlog bundle — sidenav rail menu, brand mark, rail template, tooltip description; menu side positions, popup control rows, part names; table RTL head

- **Branch:** `feat/3.51-backlog-sidenav-menu-table`
- **Commit:** one commit `feat(sidenav,menu,tooltip,table): request 072 …` (code at `73e8851`; later amends add request docs only)

## Files changed

| File | Change |
|---|---|
| `sidenav/sidenav.component.{ts,html,scss}`, new `sidenav-rail.directive.ts`, `index.ts` | `railGroupMenu` (button + one `lc-menu`, anchor box, map, live `returnFocusTo`), `[sidenav-brand-mark]` box, `lcSidenavRail` + `SidenavRailContext` + `.lc-sidenav__rail-item`, `rowTooltipDescription` (071-n1, -n2, -n5, -n8) |
| `menu/menu.component.{ts,html,scss}` | `MenuPosition` (+`right-start`/`left-start`, physical via `Directionality`), `popupControls` (body, per-part stops, panel Tab rule), `MenuItem.partLabel`, `partAriaLabel` (071-n3, -n4, -n7) |
| `tooltip/tooltip.directive.ts` | `tooltipDescription` (hidden `{id}-description` in the tooltip) |
| `table/table.component.scss`, `sortable-head.component.scss` | RTL rules appended after `.lc-table__sr-only`; `--_lc-sortable-head-align` (071-n6) |
| 4 new specs (`*.backlog-072`, `table.rtl-head`, `tooltip.description`) | 66 tests |
| stories (sidenav, menu, table, tooltip) | the 10 stories of design §8 (+ argTypes `railGroupMenu`, `popupControls`, `partAriaLabel`, `position`, `tooltipDescription`) |
| `tools/compat` (`probe-351.ts`, home, `EXPECT_IN_HTML` +2) | brand mark and rail template prerendered |

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1–3 | `sidenav.backlog-072` (off = 3.50, press/Arrow/Escape, map, navigate + `itemClicked`, live focus after reorder, switch, lazy, disabled, axe); story 1024/1280: panel x 81, gap 8, top 0 |
| 4 | DE/EN L/D shots, no clipped label, panel 220 ≤ 320 (maxWidth 20rem); RTL gap 8 left (`left-start`); forced colours: border solid 1 px |
| 5–6 | spec (empty box, mark in all states incl. docked→drawer→docked, name „USM X“); mark 32×32 at the tile's place (rail x+6 in a 44 brand); compat check „brand mark“ |
| 7–8 | spec: lists LTR/RTL (`right-start` stays physical), four old lists equal; story 1024: gaps 8/8/8, tops 0, edge panel flipped |
| 9–11 | spec: Tab walk part→toggle→switch→part 2→closed, Shift+Tab, arrows per part, Escape→trigger, click in control open, leading row focus, no-control popup unchanged; story 360: rows 52/48, panel 280 |
| 12–13 | spec (template wins over `railItems` and group menu, context, expanded unchanged); story 1024: items 44×44 at x 22.5, 2 px apart, width 56, tab order brand→3 items→collapse; 360 = drawer |
| 14–15 | `table.rtl-head` (7 RTL rules = LTR + `:where(:dir(rtl))`, after the pin); story: th right, sortable 32 left / 16 right, actions-end left, end column arrow before label; LTR pin untouched, compare identical except the RTL table |
| 16–17, 22 | spec (partLabel, fallback EN/DE, n=3, `''`, section heading, first part, single part no attr); stories: „Account, part 2“, „Konto, Teil 2“, Account Panel „Konto“ |
| 18 | `tooltip.description` + sidenav spec: described text „Wird im Rich Client bearbeitet“, visible „{label} · …“ |
| 19 | WebKit not runnable here (no Playwright library; the browser cache is outside the session) → 054-n2 stays, note „still open after 072“ (release commit) |
| 20 | all existing specs unedited; default DOM = 3.50 (temp spec `tmp/072/zz-072-default-dom.spec.ts.txt`: menu ×2, sidenav, tooltip; only comment anchors + the empty brand-mark box) |
| 21 | JSDoc `@default` on every input; manifest check (temp test, `tmp/072/manifest-inputs.json`) |

## Gates

All gates ran on commit `73e8851d6dd889d33b63ff066e50662831490bd0`.

| Gate | Result |
|---|---|
| test | 393 suites, 7573 passed, 8 skipped |
| lint | 0 errors, 159 warnings (baseline) |
| build | 127 entries |
| test:tools | 22/22 |
| build-storybook | ok (no preview errors) |
| Story shots | new: `tmp/story-shots/072/*.png` (36 + rail ×8 without `--full`, axe 0 violations); forced colours `…/072/fc`; baseline compare `…/072/cmp1–4`: 549 identical, 11 different = expected `sortable-head-reserve-and-rtl` 1280 L/D (RTL head line, y 381–392) + known random (table full-featured/with-filtering/with-pagination 1280: Salary column x 1031–1101; sidenav action-items 1280, themed-rail-badges: 18 AA px) |
| compat 22 | PASS, 144 checks (+2) |

## Deviations from the design

| # | Item | Note for the designer |
|---|---|---|
| D-1 | `partLabel` vs `ariaLabel` on the first part | §2 JSDoc applied (first part: `ariaLabel`, else its `partLabel` when a control row precedes it; elsewhere partLabel only after a control row); §4's chain lists partLabel first. Differs only for a menu that starts with a control row and sets both. |
| D-2 | `.lc-sidenav__rail-item` | adds `position: relative`, `font: inherit`, `text-decoration: none`, `cursor: pointer` (links/buttons, tooltip); unscoped (`::ng-deep`, app markup); its ring joins the item ring's selector (keeps the 9-ring pin). Tooltip only with `[data-tooltip]`. |
| D-3 | Rail stories in `--full` shots | the full-page capture fires a scroll, which closes the anchored menu (by design); rail-group shots are taken without `--full`. |
| O-1 | Side Positions at 360 | CDK's horizontal fit test narrows by both margins (as 069 vertically): first panel pushed, gap 0.2 px; centred anchor's panel overlaps it. 1024/1280 as designed. |
| O-2 | sidenav in `dir="rtl"` (pre-existing) | page 1 px wider (CDK focus-trap anchors, `.cdk-visually-hidden` `right: 0; margin: -1px`), border and current bar stay physical. Not caused by 072. |

## Changelog draft

### Added
- **`lc-sidenav railGroupMenu`** (backlog 071-n1): a `railItems` group opens its children in an `lc-menu` beside the collapsed rail (8 px outside its edge, top aligned with the item, side by the rail's place), named by the group; label, icon, disabled reason, tooltip, busy, hint, badge, current and nested groups kept; a link entry navigates with the router; Escape returns the focus to the rail item. Hook `--lc-sidenav-rail-menu-max-width` (20rem).
- **`[sidenav-brand-mark]`** (071-n2): the app's own mark instead of the brand tile (32 × 32, decorative, also prerendered). **`ng-template[lcSidenavRail]`** with `SidenavRailContext` and the class `lc-sidenav__rail-item` (071-n5): your own collapsed rail in the rail's look (44 × 44).
- **`lc-menu position="right-start" | "left-start"`** (071-n3, `MenuPosition`): beside the anchor, 8 px, tops aligned, flips at the edge; physical in RTL. **`popupControls`** (071-n4): control rows in a popup; Tab walks parts and controls. **`MenuItem.partLabel`, `partAriaLabel`** (071-n7, „{label}, part {n}“).
- **`lcTooltip` `tooltipDescription`** (071-n8): a description that does not repeat the name.

### Changed
- `lc-sidenav`: a cut label's tooltip is described by the tooltip text alone (the label is heard once). Every text brand has an empty `.lc-sidenav__brand-mark` box (`display: none`). Inline menus with control rows and `ariaLabel` name later parts „{label}, part 2“.

### Fixed
- `lc-table` and `th[lcSortableHead]` heads align to the inline start in RTL; the sortable arrow and its reserve sit at the inline end; `actionsAlign` start/end follow (071-n6). LTR unchanged.

### Compatibility
- No API breaks; defaults render the 3.50 DOM (comment anchors and the empty brand-mark box aside). 054-n2 (Safari focus return) still open.
