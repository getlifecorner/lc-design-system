# Build 050: overlay panel language (select, tooltip); lc-bottom-nav moreBadge, lc-sidenav badgeAriaLabel

- **Branch:** `feat/3.31-overlay-lang-nav-badges` (3.30.2 + minor)
- **Commit:** see `git log -1` on the branch, `feat(bottom-nav,sidenav,select,tooltip): …`

## Files changed

| File | Change |
|---|---|
| `select/select.component.{ts,html}` | `panelLang` (`closestLang` of the host while open) → `[attr.lang]` on `.lc-select__dropdown`; class JSDoc line (§1, §2) |
| `tooltip/tooltip.directive.ts` | in `show()` after the `id`: `lang` = host's closest `[lang]` on the `lc-tooltip-content` host, only when there is one; class JSDoc line |
| `bottom-nav/bottom-nav.component.ts` | `export interface BottomNavBadge`; `BottomNavItem.badge?: BottomNavBadge`; input `moreBadge` (`@default null`) → More item `badge`; `badgeAriaLabel` JSDoc + `@default` |
| `sidenav/sidenav.component.{ts,html}` | input `badgeAriaLabel` (`'{value}'`, D-1); `badgeText()` with the rail label prefix (D-2); at all 6 badge sites `lc-badge aria-hidden="true"` + `&ngsp;` + `.lc-sidenav__sr-only` span; features bullet |
| `*.stories.ts` (4) | the five §8 stories; argTypes `moreBadge`, `badgeAriaLabel` (both), sidenav features bullet + inputs row, *With Badges* / *Collapsed Rail — Badges* sentences |
| specs | new: `select.panel-lang`, `tooltip.lang`, `menu.lang`, `popover.lang`, `bottom-nav.more-badge`, `sidenav.badge-name`; `kit-icons.spec.ts`: stale exception removed (Deviations) |
| `tools/compat/…` | `home.html` bottom nav `moreBadge` + `badgeAriaLabel`; `probe-314.ts` Kosten badge + `badgeAriaLabel`; `EXPECT_IN_HTML` 050 AC-13 |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1, 2 | `select.panel-lang.spec` (8): `de`, `fr-CH`, search field + options inside, only `lang` added, re-read at next opening; none without wrapper; closed: no panel. Build: *Panel Language* panel `lang="de"` at 3 widths × 2 themes |
| AC-3 | `tooltip.lang.spec` (9): `aria-describedby` target `role="tooltip"` in the pane has `lang="de"` / `fr-CH`, by `show()` and `mouseenter`, re-read at next show; none without wrapper; gone on hide. Build: *Language* tooltip `lang="de"` |
| AC-4 | `menu.lang.spec`, `popover.lang.spec`: open panels inside the host, `closest('[lang]')` = `de`; no code change |
| AC-5–7, 12 | `bottom-nav.more-badge.spec` (18): overflow + `showMore` (link and button), same shape/classes as an item badge, `0`, `'9+'`, null/undefined/unset identical DOM, sr text "1 offen"/"3 new", pill `aria-hidden`, no summing, one tab stop |
| AC-8, 9, 11, 12 | `sidenav.badge-name.spec` (26): all 6 sites (text, `aria-hidden`, axe name "Offene Zuordnungen 12 offen" …), default `'{value}'` → "Offene Zuordnungen 12", `''`, `0`, rail prefix at the 4 rail sites with the compiled CSS loaded (label `display: none`), drawer without prefix, unbadged items unchanged, child order (chevron last), one space text node, sr-only rule, tab stops |
| AC-9, 10 | Temp spec (removed): 3.30.2 template vs new, `outerHTML` minus `aria-hidden`/space/span equal for expanded (6 spans), rail (5), drawer (5), unbadged; `lc-select` closed/open without `lang` equal. 7 badged sidenav stories × 360/1024/1280 × L/D `--compare=050/baseline` + `rest-measure.js`: 40/42 identical; the 2 others (*Sidebar-First Layout* 1024/1280 D, designer's flake list) are byte-equal to the designer's prototype shots. Boxes, badge rects and contrasts equal the baseline log; names change only on the rail ("3" → "Agent Runs 3", "12" → "Two digits 12", …) |
| AC-11 | Build, *Badge Accessible Name (German)* + click „Banken“: "Offene Zuordnungen 12 offen", "Stammdaten 1 offen", "Konten 1 offen", "Finanzen 3 offen", "Banken 2 offen", "Kontoauszüge 2 offen"; rail the same (description = label, L-1) |
| AC-13 | compat 22: `badge text before JS: bottom nav "Mehr" and a sidenav item (050 AC-13)` ok |
| AC-14 | full suite green; no existing assertion edited (only the kit-icons exception list, below) |
| AC-15, 16 | 5 stories with the §8 ids; new argTypes with description + `table.defaultValue`. Changelog draft below; READMEs unchanged (no new component) |

## Gates

All gates ran on commit `cdc4625d881e0dddfd73de20f7014893316a8e8d` (the amend adds only `build.md`; later agents skip a gate while `git diff --quiet cdc4625 -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 252 suites, 5751 passed, 8 skipped (was 246 / 5687) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (unchanged) |
| `npx nx run angular-ui-kit:build` | 122 "Built" |
| `npm run test:tools` | 22 / 22; temp manifest check (removed): the 5 stories have snippet + description, `moreBadge` default `null` |
| `npx nx run angular-ui-kit:build-storybook` | 1062 stories (+5) |
| Story screenshots | new: `tmp/story-shots/050/build-new/` (30); rest compare `build-rest/` (42); opened select/tooltip `build-open/` vs `baseline-open`: 20/20 identical; Banken `build-banken/` |
| `check-angular-majors.mjs --only=22` | PASS, 100 HTML checks (+1) |

## Deviations from the design

None in API, markup or stories. One spec edit: `kit-icons.spec.ts` lists literals that look like icon names; `'bottom-nav/bottom-nav.component.ts: error'` (the inline variant union) no longer occurs since `BottomNavBadge.variant` is `BadgeVariant` (D-4), and the spec's own "lists only exceptions that still occur" test requires removing it (the scan gets stricter, not weaker). Cockpit's icon in the sidenav story (not in §8) is `presentation-chart-line`, as in the bottom-nav story.

## Known limits (design.md §4–§6)

- **L-1** a badged rail item keeps the label as description (`title`): "Agent Runs 3, link, Agent Runs". **L-2** "99+" on More of a 5-entry bar at 360 ends 3.6 px past the floating bar's edge (1.2 px docked), as item badges on the last entry do.
- Pre-existing, queue: **F-1** (1.4.3) warning badge on the current bottom-nav pill in dark 4.03 floating / 4.26 docked, success 4.49 floating; **F-2** (1.4.3) `theme="light"` rail on a dark page, badges 1.22–1.97; **F-3** (1.4.13, 1.3.1) `lcTooltip` on `lc-button` never shows on keyboard focus, `aria-describedby` lands on the host.

## Changelog draft

```
## [3.31.0] - 2026-11-05

A badge on the bottom nav's "More" entry, spoken badges in the side navigation, and select and tooltip overlays in the host's language (Finance Intelligence spec 010, follow-up 049-f1). No API breaks.

### Added

- **`lc-bottom-nav` `moreBadge`** (stammdaten-2026-11-05 row 1, Finance Intelligence spec 010, navigation counter „Offene Zuordnungen“): the "More" entry the kit builds itself (on overflow or with `showMore`) takes a badge, `[moreBadge]="{ value: 1, variant: 'warning' }"`, drawn like an item badge and read after the label through `badgeAriaLabel`: „Mehr 1 offen“. The kit doesn't add up the badges behind "More"; pass the value, at most two characters (`'9+'`). Default `null`: no badge. New type `BottomNavBadge` (`{ value; variant? }`), also the type of `BottomNavItem.badge` (same shape). Stories *More Badge*, *More Badge (German, floating)*.
- **`lc-sidenav` `badgeAriaLabel`** (row 2): a badged item reads its badge from a visually hidden text after the label, at every level (items, groups, children, section children and theirs); the `lc-badge` is hidden from screen readers. Default `'{value}'` keeps today's names („Tasks 12“); `'{value} offen'` → „Offene Zuordnungen 12 offen“; `''` silences the badge. Story *Badge Accessible Name (German)*.

### Fixed

- **`lc-select` and `lcTooltip` language** (049-f1, WCAG 3.1.2): the dropdown and the tooltip render under `<body>`; they now take the `lang` of the host's closest `[lang]`, read at every opening. Stories *Panel Language* (Form/Select), *Language* (Feedback/Tooltip). `lc-menu` and `lc-popover` render inside their host and already inherit it.
- **Collapsed sidenav rail**: a badged rail item was named by its count alone („3“); its hidden text now starts with the label: „Agent Runs 3“.

### Compatibility

- No API breaks; both inputs optional. Without `moreBadge` the bottom nav renders as before. Badged sidenav items gain `aria-hidden="true"` on the `lc-badge`, a space and a `.lc-sidenav__sr-only` span, nothing else (the 3.30.2 DOM otherwise; unbadged items unchanged); item 44 px, rail 39 × 44 and badge boxes unchanged, 40 of 42 shots of the 7 badged sidenav stories hash-identical to 3.30.2 (2 known flakes). A test that pins a badged item's `textContent` now sees the hidden text. Open select and tooltip panels gain only `lang`, and only below an element with `lang`.

### Known

- A badged rail item also keeps its label as description (`title`). Pre-existing, queued: the warning badge on the current bottom-nav pill in dark is 4.03:1 (floating) / 4.26:1 (docked); a `theme="light"` rail on a dark page draws badges at 1.22–1.97:1; `lcTooltip` on `lc-button` does not show on keyboard focus.
```
