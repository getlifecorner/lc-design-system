# Build 067: lc-number-input without steppers, lc-waterfall-chart long labels, USM X lc-sidenav gaps

- **Branch:** `feat/3.47-number-waterfall-usmx-sidenav`
- **Commit:** `feat(number-input,waterfall-chart,sidenav): request 067 — no steppers, wrapped waterfall labels, USM X sidenav gaps` (one commit, amended)

## Files changed

| File | Change |
|---|---|
| `number-input/number-input.component.{ts,html,scss}` | `showSteppers` (default `true`); steppers in `@if`; `number-input--no-steppers` sets the value box height per size |
| `waterfall-chart/waterfall-labels.ts` (new, internal) | `layoutWaterfallLabels(labels, width, measure)`, char-width table, `estimateLabelWidth`, `plainLabel` |
| `waterfall-chart/waterfall-chart.component.{ts,html}` | `wrapLabels` (default `true`); `labelLayout`, `svgHeight` (+14 when a label wraps); browser measure in `afterNextRender` (+ `document.fonts.ready`); `WaterfallItem.label` JSDoc (U+00AD); aria-label drops U+00AD |
| `sidenav/sidenav.component.{ts,html,scss}`, `_sidenav-docked.scss` | `[sidenav-top]` slot, `brandRoute`, `brandLink`, `brandLogoSrc`, `[(expandedGroups)]` (`expandedItems` = `linkedSignal`), `highlight`, `itemActionClick`, `lcSidenavLabel`, title on cut labels (`pointerover`), recursive `#groupItem`/`#childItem` templates, Escape via `OverlayStackService`, six hooks (§2) |
| `sidenav/sidenav-label.directive.ts` (new), `sidenav/index.ts` | `SidenavLabelDirective`, `SidenavLabelContext` exported |
| `models/navigation-item.interface.ts` | `NavigationItemActionEvent`; `children` JSDoc (any depth) |
| `internal/navigation/navigation-current.ts` | `navigationLinks`, `currentItemParents` recurse (same result up to 3 levels) |
| specs | new `number-input.no-steppers` (13), `waterfall-labels` (17), `sidenav.usm-x-rows-38-46` (38); `sidenav.brand.spec.ts` 6 assertions updated (see Deviations) |
| stories | the 7 of design §8 (ids as listed), argTypes for every new input/output, sidenav docs table (slot, hooks, outputs); *Foldable Sections* text: deep groups now exist |
| `tools/compat/template/src/app/probe-347.ts`, `home.{ts,html}`, `check-angular-majors.mjs` | probe + 3 `EXPECT_IN_HTML` checks (waterfall tspans/title/264, no-stepper field, sidenav slot/static brand/open groups/marks/action) |
| r2 (F-1): `sidenav.component.{scss,ts}`, `sidenav.stories.ts`, `sidenav.usm-x-rows-38-46.spec.ts` | `.lc-sidenav__nav-item-row` block: `.lc-sidenav__action-btn:focus-visible, …[aria-expanded='true'] { opacity: 1 }`; `itemActionClick` JSDoc, argType, docs table and *Deep Tree* text name `aria-haspopup`/`aria-expanded`; *Deep Tree* sets them on `element` (open: `menu`/`true`, close: `false`, a previous target `false`); CSS pin (+1 test) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| N1 | unit (default 2 buttons, classes); temp old/new DOM spec 19/19 identical (`tmp/067/old-new.txt`); 14 number-input stories PNG + DOM identical |
| N2 | unit: no button, `de-DE`, clamp on blur, ArrowUp/Down (`step` 0.01), `aria-describedby` suffix+helper→error, `invalid`, disabled (input + form), axe |
| N3 | *Sizes Without Steppers* 360: control 26/34/42/46 (inner 24/32/40/44); CSS pins |
| N4 | *Betrag ohne Schrittknöpfe* 360/1024/1280 L/D: control 112.6 × 46, value box 87.2, scroll 87 = client 87, axe 0; forced colours: 1 px border |
| W1 | `layoutWaterfallLabels` unit (fits, neighbour room, space, U+00AD, „-“, longest line 1, cut + ≥ 1 char, title) |
| W2 | unit (one text node, no title, 250); 3 waterfall stories PNG + DOM identical |
| W3 | *German Cause Names* 1024/1280: lines as design §9, min gap 9.9, svg 264; jsdom estimate gives the same lines |
| W4 | 360 (W 328): every label cut ≤ 25.8 px with title, gap 4.0, 250 high; *Five Causes*; compat probe (tspan, `<title>Nicht eingetreten</title>`, 264) |
| W5 | unit: aria-label without U+00AD, `wrapLabels=false` = 3.46 markup; axe 0 (12 shots; SVG text contrast „incomplete“, computed in design §5) |
| S1 | unit (docked, drawer order brand → × → slot → items, empty → no child); *Top Slot* 360: slot top 64 + 16, content x 8 w 264, first item = slot bottom + 16; 1280: w 303; rail: hidden |
| S2, S3 | unit (`href="/start"`, static `routerlink="/"` kept by default; `div.--static` without role/tabindex/aria-label/href) |
| S4 | *Brand And Hooks*: img 24 × 24 at 4,4 in the 32 tile, `filter: brightness(0) invert(1)`; unit default none |
| S5 | unit 5 levels (open path, has-active-child, fold per level, lazy level 4 + loading row); *Deep Tree*: x 8/24/36/48/60, level-5 labels 131 (+action) / 159 |
| S6 | unit: first report, toggle, `items` update keeps fold, current change re-opens, input replaces (unknown id kept, no `expandRequested`), `expandedItems.set` reported, seed |
| S7 | unit levels 3 and 5 (`itemAction` then `itemActionClick`, `element` = button); hit test ± 21 px all sides; menu 8 px below, right-aligned, focus in menu, Escape → focus back. r2: CSS pin (rest 0, hover 1, focus-visible/expanded 1 under the row selector); `tmp/067/r2/focus.log` |
| S8 | CSS pins (fallbacks = 3.46 values, hooks never declared); ring count 9 on the hook |
| S9 | unit: plain Escape closes + `defaultPrevented`; prevented ignored; layer above ignored; real `lc-command-palette` above takes the first Escape; stack empty after close/docked/destroy |
| S10 | CSS pins 56/56/64/80/112 fallbacks, × `top: calc((h − 44)/2)`; *Brand And Hooks* block 48 |
| S11 | unit (marks every match, trimmed, template wins, context level 1–5, title only when cut, not on rail/with tooltip); *Top Slot*: 4 marks, title on the long label only |
| S12 | 7 new stories × 360/1024/1280 × L/D `--axe`: 0 violations; forced colours 10 shots; compat probe-347; r2: a focused row action has opacity 1 and its 2 px ring (also forced colours, `r2-focus`, `r2-fc`) |

## Gates

**Round 2 (F-1):** all gates ran on commit `f5756e32bb2968e5992995004cf9b9e74d1e7d3d` (later agents skip a gate while `git diff --quiet <hash> -- libs tools` holds; the amend after it only adds this file's results). Logs `tmp/067/r2/`. Round 1 ran on `334a293` (Jest 358 / 7106, compat 135, unchanged numbers below unless noted).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 358 suites, 7107 passed, 8 skipped (+1: the F-1 CSS pin; `sidenav.usm-x-rows-38-46` 39) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 160 warnings (unchanged) |
| `npx nx run angular-ui-kit:build` | 127 entries built |
| `npm run test:tools` | 22/22 (round 1; `tools/` unchanged in round 2) |
| `npx nx run angular-ui-kit:build-storybook` | built (`--skip-nx-cache`) |
| Story screenshots | F-1 measure `r2-focus` / `r2-fc` (*Deep Tree*, *With Groups And Actions* 1280 L, also forced colours; module `tmp/067/measure/r2.mjs`); at rest vs the review run: `r2-ca`, `r2-cb1`, `r2-cb2` vs `r1-ca`/`r1-cb`, `r2-new` (18, `--axe`) vs `r1-new`; reruns `r2-re-*`, `r2-drop`/`r2-keep` |
| `node tools/compat/check-angular-majors.mjs --only=22` | PASS, 135 checks, log `tmp/067/r2/compat-22.log` |

**F-1 measured** (1280 L, same in forced colours): rest `opacity` 0 on every row action; focused 1, `:focus-visible`, ring 2 px solid; blurred 0; *Deep Tree* menu open → `aria-haspopup="menu"`, `aria-expanded="true"`, 1 (focus in the menu); Escape → `"false"`, focus back, `:focus-visible`, 1; blurred 0. *With Groups And Actions* `aria-expanded="true"` set by hand → 1, removed → 0.

**At rest vs the review run** (42 sidenav stories × 360/1024/1280 × L/D = 252, load 10–15): 239 identical, 13 differing, all attributed, none to the rule: 6 identical on rerun; *Docked* 360 D and *Prominent Brand* 1024 L equal the designer's `baseline` (review shot the outlier); *Sidebar First Layout* 1024 L 1 px Δ 1 at the top-right corner (known flake); *Drawer Mode* 1024 D and *Themed Rail Badges* 360 L (AA, Δ 29/36, x 17–20 / 34–37 device px) identical to the review shot after a 1.8 s wait, with the rule kept (`r2-keep*`) and deleted live (`r2-drop*`) alike; *Top Slot* 360 L/D identical to round 1's `build-new` (the review's `r1-new` shot carries its measure's state). axe 0 violations (18 new-story shots).

Round 1 baseline compare (336 shots): 323 identical; DOM hash 112/112 identical to `baseline-dom.log`; of 13 differing 10 identical on rerun, 1 to the designer's second sample, 2 AA-only (Deviation 5).

## Deviations from the design

1. `brandRoute` default keeps the static `routerLink="/"` branch: the default DOM stays byte-identical (design §2 expected an inert `routerlink` difference; there is none).
2. `sidenav.brand.spec.ts`: three DOM assertions now include the always-rendered, empty `div.lc-sidenav__top` (design §2/§3) and assert it has no children; three CSS pins read the new hook first (`min-height: var(--lc-sidenav-brand-height, 64px)`, outline `var(--lc-sidenav-focus-ring, <3.46 value>)` ×2). Fallback values unchanged.
3. Collapsed rail with a filled slot: `.lc-sidenav--collapsed .lc-sidenav__top:not(:empty) ~ .lc-sidenav__nav { padding-top: 0.5rem }` keeps the rail's 8 px (not specified).
4. Stories: *Brand And Hooks* adds `--lc-sidenav-hover-bg: var(--color-primary-fill-hover)` to the petrol recipe (§5 measured the ring on fill-hover). *Deep Tree*'s `lc-menu` has no trigger element (a trigger span drew axe `aria-allowed-attr`, lc-menu mirrors `aria-expanded` onto it); a fixed box at the button's right edge, as high as the button, places the panel. The fading button while its menu is open is fixed in r2 (F-1: `aria-expanded="true"` → opacity 1).
5. AA-only, deterministic over 3 reruns: *Themed Rail Badges* 1280 light (9 px, Δ 36, the current item's rounded 2 px inset bar, x 17–18.5, y 82–104) and *Area Rail (German)* 360 dark (3 px, Δ 12). The designer's two samples agree; reverting the hit-area rule, removing the slot wrapper or pinning the icon sizes inline does not remove it. Same geometry, same DOM.

## Changelog draft

A typed amount without steppers, waterfall labels that wrap instead of overlapping, and the USM X fifth batch for `lc-sidenav`. Gap IDs: finance-intelligence kosten-2026-11-18 rows 5 and 6, usm-x 2026-11-18 rows 38–46. No API breaks.

### Added

- **`lc-number-input` `showSteppers`** (`true`; kosten row 5, variance sheet): `false` draws only the value box and the unit, as high as with steppers (xs 24 · sm 32 · md 40 · lg 44 px inside the border); ArrowUp/ArrowDown still step. „2960,00 €“ in `lg` with `--lc-number-input-value-width: calc(7ch + 0.5rem)`: 112.6 × 46 px, no clipping.
- **`lc-waterfall-chart` `wrapLabels`** (`true`; kosten row 6, nine causes at 564 px): a label that would run into a neighbour wraps at a space, after „-“ or at a soft hyphen (U+00AD, drawn „-“); a line still too wide ends in „…“ with the full label as SVG `<title>`. The chart grows by one line (250 → 264 px) only when a label wraps; at 564 px the closest labels stay 9.9 px apart. Widths are estimated on the server (no hydration change) and measured in the browser. Labels that fit draw as before; `false` restores the one-line drawing.
- **`lc-sidenav`** (usm-x rows 38–46): a `[sidenav-top]` slot between the brand and the items (docked and in the drawer, hidden on the rail, no box when empty); `brandRoute`, `brandLink` (`false`: a plain block, no tab stop), `brandLogoSrc` (24 px in the tile); groups nested to any depth (12 px more indent per level; a level-5 label keeps 131 px with an action in a 280 px rail); `[(expandedGroups)]` (open groups seeded by the backend, toggles reported, also prerendered); the `action` button at every level, 44 × 44 px to hit, and `itemActionClick` `{ item, event, element }` (`NavigationItemActionEvent`) to anchor a menu (set `aria-haspopup="menu"` and `aria-expanded` on `element` while it is open: the button stays visible); `lcSidenavLabel` (`SidenavLabelDirective`, context `{ $implicit, level, highlight }`) and `highlight` (bold, underlined `<mark>`, every match); a label cut by its ellipsis shows its full text as `title`. CSS hooks, read on any ancestor, defaults = 3.46: `--lc-sidenav-focus-ring` (all 9 rings), `--lc-sidenav-muted-fg`, `--lc-sidenav-icon-size` (20px), `--lc-sidenav-backdrop` (`rgba(0, 0, 0, 0.5)`), `--lc-sidenav-brand-height` (56 · 56 · 64 · 80 · 112 px by `logoSize`), `--lc-sidenav-brand-logo-filter` (`none`).

### Changed

- `lc-sidenav`: the current item's groups re-open only when the current item changes, not on every `items` update, so a group the user folded stays folded while children load (row 41). Every group above the current item is marked, at any depth.
- `lc-sidenav` drawer: Escape is ignored when another handler prevented it or when a modal, `lc-command-palette`, menu, popover or tooltip stands above the drawer; with nothing above, it closes as before and now prevents the default (row 44).

### Fixed

- `lc-sidenav`: an item row's action button is visible on keyboard focus (WCAG 2.4.7) and while it carries `aria-expanded="true"`; since 3.0 the hidden-at-rest rule outweighed its `:focus-visible`, so a focused action stayed at opacity 0 with its ring unseen. Rest (0) and hover (1) unchanged.

### Compatibility

- No API breaks. New exports: `SidenavLabelDirective`, `SidenavLabelContext` (`/sidenav`), `NavigationItemActionEvent` (`/models`).
- The sidenav panel gains an empty `div.lc-sidenav__top` (no box) between the close button and the nav. A level-3 item with `children` was drawn as a link (its children ignored) and is now a group. Default DOM of all 56 existing number-input, waterfall, sidenav and placeholder stories otherwise identical (112/112 DOM hashes).
