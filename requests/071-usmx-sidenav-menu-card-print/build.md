# Build 071: USM X sidenav, menu, card and badge gaps, toggle-group touch target, print rules, backlog rows

- **Branch:** `feat/3.50-usmx-sidenav-menu-card-print`
- **Commit:** `feat(sidenav,menu,card,badge,avatar,table,tabs,toggle-group,header,app-shell): request 071 — …` (one commit, amended with the round-1 fixes and this file)

## Files changed

| File | Change |
|---|---|
| `sidenav.component.{ts,html,scss}`, `models/navigation-item.interface.ts` | `[sidenav-rail-top]` (docked rail only), `railItems` + `railItemClick` (`NavigationRailItemEvent`), `NavigationItem.hasPopup`, `brandToggle`, `brandLogoFit` (`SidenavBrandLogoFit`), cut label in the row tooltip (pointer + focus capture), `--lc-sidenav-brand-logo-height`; r1: JSDoc F-3 (menu at the rail's right + 8), N-3 (action entries current only by `current`) |
| `menu.component.{ts,html,scss}`, `menu-control.directive.ts` (new, exported), `menu-item-attrs.directive.ts` (internal) | `inline`, control rows, `current`, `busy` + `busyLabel`, nested sections, `badgeVariant`, `attrs`, Enter/Space consumed, `returnFocusTo`, `--lc-menu-max-height`; r1 (F-1): inline, `lc-menu__items--has-toggles` per `role="menu"` part (the panel class stays for popups), joined to the six slot rules at the same weight |
| `split-button.component.{ts,html}` | `menuMaxHeight`; `menuAriaLabel` also on the open `role="menu"` |
| `card`, `badge`, `avatar`, `tabs`, `toggle-group`, `table/sortable-head` | `headerActionWrap`; `.lc-badge__cut`; `letters`; muted hover ink; `touchTarget`; unsorted-reserve hook + logical reserve/arrow/ring |
| `header.component.{ts,scss}`, `app-shell.component.{ts,scss}` | `@media print` rules + JSDoc; r1 (F-2): one column in print (areas header/body/end, nav wrapper not printed, footer inset), also for `navPlacement="full-height"` (same selector, later); `app-shell.full-height.spec` pin (see Gates) |
| `file-upload.component.scss`, `file-upload.stories.ts` | `:empty` error line −8 px; logo-use hints (EN/DE) |
| 12 stories files | the 16 stories of design §8, argTypes for every new input; r1: *Print* docs (no nav column), *Collapsed Rail With Top Slot* point = rail right + 8, text x 5.5–49.5 |
| new specs (12) | `app-shell.print` 5 (r1 +1), `toggle-group.touch-target` 10, `tabs.muted-hover` 3, `avatar.letters` 11, `badge.cut` 5, `card.header-wrap` 7, `sortable-head.reserve` 7, `file-upload.error-gap` 3, `menu.inline` 22 (r1 +5), `menu.items` 21, `split-button.menu-max-height` 5, `sidenav.rail-071` 25 (r0 said 26: miscount); `theme-contrast.spec` 3.50 block (2) |
| `tools/compat/template/…/probe-350.ts`, `home.{ts,html}`, `check-angular-majors.mjs` | collapsed rail + rail-top + railItems, card wrap, inline menu with a control row, server-rendered (3 checks) |

## Acceptance criteria

| AC | Covered by (specs; measured r0 `tmp/071/measure-{a,b,c}.log`, r1 `tmp/071/r1/measure-fix.log`, 360/1024/1280 L/D) |
|---|---|
| 1–2, 23 | `sidenav.rail-071`; rail-top child 44 × 44 at x 5.5–49.5, 4 rail icons, „Stammdaten“ current + `aria-haspopup`. r1 (F-3): menu at x = rail right + 8: gap 8 (was −1), 64 from the rail's left, top Δ 0; Escape → focus on „Stammdaten“, panel gone |
| 3–5 | spec (toggle, focus kept, EN/DE name, drawer = link, axe incl. label-in-name; natural logo; cut label on pointer and focus); toggle 44 × 44 at x 5.5; logo 4:1 → 96 × 24; tooltip on focus „{label} · {tooltip}“ |
| 6–7 | `menu.inline` (no overlay, never `closed`, arrows per part, rows outside `role="menu"`, Tab stops, axe); r1 (F-1, +5 tests): part classes [true, false], no slot selector matches „Profil“/„Abmelden“, a plain item beside the radios keeps the slot, popup unchanged, part selector in all 6 rules. *Account Panel*: „Profil“, „Abmelden“ labels 16 px from the panel = „Dichte“/„Töne“ (was 48), bar 3 px, label 16 px from it; „Hell“/„Dunkel“ unchanged (80) |
| 8–10, 12 | `menu.items`; current bar 3 px, 600, `attrs` (rejected names warned); busy `aria-busy`, name „Zähler Wird geladen“; badges 20 px; nested 16/32/48; contrast pinned |
| 11, 13 | `split-button.menu-max-height`, `menu.items` (hook on open, `room`; Enter/Space `defaultPrevented`, one `itemClick`, no submit) |
| 14–19 | `avatar.letters`, `sortable-head.reserve`, `badge.cut`, `tabs.muted-hover`, `card.header-wrap`, `toggle-group.touch-target` (values as in review r1) |
| 20–21 | `app-shell.print` (r1: block pinned, screen rules it overrides precede it); print rules cloned: header 0 × 0, padding-bottom 112 → 0, sky none, min-height 0. r1 (F-2): *Print*, *Full Height Nav*, *Full Height Nav Horizon* at 1024/1280 L/D: columns `1024px` / `1280px` (were 240 + 784 / 1040), body x 0 and full width, nav wrapper `none`, footer inset 0; 360 unchanged. Manifest „Print (3.50)“ in both entries |
| 22, 24–25 | RTL ring/arrow 12 px from the inline end; image field gap 0; hints name the logo's use (EN/DE) |
| 26 | WebKit not runnable here (no Playwright library, `npx playwright` needs approval): 054-n2 stays in BACKLOG.md |
| Default | temp proof `tmp/071/zz-071-default-dom.spec.ts.txt` (rerun r1: 4/4): menu (popup open/closed, toggles, sections), sidenav, split button, avatars identical to 3.49.1 apart from comment anchors and the rail's empty `.lc-sidenav__rail-top` |

## Gates

Round 1 ran on commit `ee849fe90e9e4b750e9d6488993746e1ac319550` (later agents skip a gate while `git diff --quiet ee849fe -- libs tools` holds). Round 0: `c951f0b`. Logs `tmp/071/r1/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 389 suites, 7513 passed, 8 skipped (r0 389 / 7507: +6 tests) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 159 warnings (baseline 159) |
| `npx nx run angular-ui-kit:build` | 127 entries built |
| `npm run test:tools` | 22 / 22 (tools unchanged; JSDoc read by the manifest) |
| `npx nx run angular-ui-kit:build-storybook` | built, 1298 stories |
| Story screenshots r1 | new: `tmp/story-shots/071/new-r1` (9 menu/app-shell/sidenav stories, 360/1280 L/D, `--full --axe`, vs r0 `new`): 32 identical, 4 differ = *Account Panel* (F-1); axe 0 of 36. Compare vs `baseline` (74 stories, 296 shots, `cmp-r1a`, `cmp-r1b`): 290 identical (all app-shell and menu), 6 differ = the known random sidenav *Action Items* 1280 L/D, *Lazy Children* 1280 L, *Themed Rail Badges* 1280 L/D, 360 D (sidenav template and SCSS unchanged in r1). Fix measures: `tmp/071/r1/measure-fix.log` (`tmp/071/measure/r1fix.mjs`) |
| `node tools/compat/check-angular-majors.mjs --only=22` | PASS, 142 checks (app-shell print CSS and the inline menu's parts are server-rendered) |

Spec pins changed (stated reasons): r0: `sortable-head.component.spec`, `table.hidden-head.spec` (logical properties, AC-22); `menu.sections.spec` fixture (a member's children now nest, AC-9). r1: `menu.inline.spec` panel classes lose `--has-toggles` in inline mode (F-1: the class moved to the part); `app-shell.print.spec` print block gains the one-column rules (F-2); `app-shell.full-height.spec` (019) „every full-height rule inside 1024 px“ now also allows the one print block that undoes it (F-2 names the selector to beat its weight), and asserts ≥ 4 hits in the 1024 px blocks as before plus no layout in the print block (no `nav header`, `grid-row`, `100dvh`, `display: grid`, `--_nav-width`).

## Deviations from the design

Deviations 1–6 of round 0 are accepted and written into design.md (change note). Round 1: none. Note on F-2: the one-column rules sit in the single `@media print` block, not `print and (min-width: 1024px)`; below 1024 px they equal the screen rules (360 measured unchanged). They repeat the full-height selector, because finance-intelligence's shell uses `navPlacement="full-height"`.

## Changelog draft

### Added

- **`lc-sidenav` collapsed rail** (usm-x 2026-11-17 row 74, the USM X shell): `[sidenav-rail-top]` shows content on the docked, collapsed rail only (e.g. the area picker as a 44 px icon button, x 5.5–49.5 on the 56 px rail); `railItems` is what the rail draws instead of `items` (one icon per entry, the rail's tooltip, badge dot and current bar; an action entry is current only by `current`) and `railItemClick` gives `{ item, event, element }` to open a menu 8 px beside the rail; `NavigationItem.hasPopup` puts `aria-haspopup`/`aria-expanded` on an action item; `brandToggle` makes the brand the rail toggle (44 × 44 on the rail, named „USM X Customizing, Collapse navigation to the left“, focus kept).
- **`lc-sidenav brandLogoFit="natural"`** (row 75): a wordmark at its own ratio (4:1 → 96 × 24, `--lc-sidenav-brand-logo-height`), no tile; the rail shows the letter tile.
- **`lc-menu inline`** (row 77, the account panel): the menu in the page, never closing, with control rows (`MenuItem.control` + `ng-template[lcMenuControl]`, `MenuControlDirective`) for a toggle group or switches between the menu parts, one Tab stop per part; only a part with checkbox or radio items reserves the check-mark slot, so „Profil“ starts on the „Dichte“ line (16 px).
- **`MenuItem.current`, `busy`, `badgeVariant`, `attrs`, nested sections** (rows 78, 80): a 3 px bar + semibold (3.75:1 / 5.77:1), a spinner with `aria-busy` and `busyLabel`, `lc-badge` variants (text ≥ 4.60:1), `id`/`data-*` attributes only, sections to any depth (items at 16/32/48 px).
- **`lc-menu returnFocusTo`** (backlog 068-n3) and the CSS hook **`--lc-menu-max-height`**; **`lc-split-button menuMaxHeight`** (row 79, `'room'` too).
- **`lc-card headerActionWrap`** (row 86): at 390 px a 220 px search takes its own line under the title (title column 308 px instead of 72); hook `--lc-card-header-title-min` (12rem).
- **`lc-badge` `.lc-badge__cut`** (row 83: with `maxWidth` only the marked run is cut, „· 3 Objekte“ stays visible); **`lc-avatar letters`** (row 81: „IN“, „CRM“, the name stays the accessible name); **`th[lcSortableHead]` `--lc-sortable-head-unsorted-reserve`** (row 82: `var(--spacing-4)` makes unsorted heads 16 px narrower, sorted and busy keep 32 px); **`lc-toggle-group touchTarget`** (finance-intelligence vertraege row 2, „Verträge“: every option ≥ 44 × 44 px, lg 40 → 44, without a new look).

### Changed

- `lc-menu`: Enter and Space on an item are `preventDefault`ed and stopped and activate it once (row 84). `lc-split-button`: `menuAriaLabel` also names the open menu.
- Print (finance-intelligence app-shell-2026-11-20 row 1, spec 022): `lc-header` is not printed; `lc-app-shell` drops the bottom clearance (112 → 0 px), the sky image and the screen height, and from 1024 px the nav column (one column, the page at x 0 and full width: 1040 → 1280 px at 1280, also with `navPlacement="full-height"`). Screen unchanged.
- `lc-sidenav`: a cut label with a kit tooltip shows its full text in the tooltip (row 76). `lc-tabs`: a muted tab keeps its muted ink on hover (row 85; 5.30:1 / 6.64:1).

### Fixed

- `th[lcSortableHead]` in RTL: reserve, arrow and busy ring at the inline end (068-n1). `lc-file-upload variant="image"`: no 8 px gap under the field without a rejection (069-n1).

### Compatibility

- No API breaks; every new input defaults to the 3.49.1 rendering (DOM identical apart from comment anchors and the collapsed rail's empty slot wrapper). `MenuItem.children` on a member now nests instead of being ignored.
