# Build 068: USM X menu, tabs, palette and form gaps, lc-table hidden actions head, 067 follow-ups, backlog

- **Branch:** `feat/3.48-usmx-menu-tabs-table-followups`
- **Commit:** `feat(menu,tabs,command-palette,table,datepicker,button): request 068 — USM X menu, tabs, palette and form gaps, hidden actions head, 067 follow-ups` (one commit, amended)

## Files changed

| File | Change |
|---|---|
| `menu/menu.component.{ts,html,scss}` | `anchor` (overlay via `cdkConnectedOverlay`, element/point positions §3A, push, margin 8, close on outside click/scroll/Tab, focus return, `lang`), `maxHeight` (column + scrolling list, `revealItem`), `loading`/`loadingLabel` (busy row, `aria-busy`, status a frame later, items arriving take focus), `ariaLabel`; `MenuItem.tooltip`/`disabledReason`/`emphasis`/`swatch`; dividers between section members; every handled key `preventDefault`+`stopPropagation`, Escape in a capture listener while open |
| `tabs/tabs.component.{ts,html,scss}` | `lc-tabs` `ariaLabel`, `replaceUrl`; `lc-tab` `tooltip`, `disabledReason` (arrow-reachable, `aria-disabled`), `muted`, `hint`; hooks `--lc-tabs-gap`, `--lc-tabs-panel-padding` |
| `command-palette/*` | `activeId` model (set → cursor + reveal, fallback + write-back; written on every move while open); `CommandPaletteItem.badge`/`badgeVariant` (lc-badge xs, in the name) |
| `table/table.component.*`, `table/sortable-head.component.*` | `showActionsLabel` (`.lc-table__sr-only`, appended); `busy` (ring, `aria-busy`, `cursor: progress`), hooks `--lc-sortable-head-padding-block/-inline`, `--lc-sortable-head-border-bottom` (sortable-head SCSS only) |
| `textarea/*`, `styles/_theme-{light,dark}.scss`, `docs/typography.mdx` | `--line-height-base: var(--line-height-normal)`; `--lc-textarea-padding`, `--lc-textarea-min-height` per size |
| `search-input`, `split-button`, `popover`, `avatar(-group)` | clear emits `''` with `force` (dedupe skipped); `tone`/`accessKey`/`ariaKeyShortcuts` (face, tone also caret) + `menuSize`/`menuMinWidth`/`menuMaxWidth`; `panelRole` (`PopoverPanelRole`, a tap outside closes a long-press tooltip); `shape` (`AvatarShape`, 25 %), `AvatarGroupItem.bg`/`fg` |
| `datepicker/*` | `mode`, `valueType`, `timeStep`, `minTime`, `maxTime`, 5 texts, `stringValueChange`, `NG_VALIDATORS`, time combobox + listbox overlay, `parseDatepickerTime` |
| `button/button.component.scss` | pressed look `outline`/`ghost` `[aria-pressed=true]`, 4 hooks, forced colours Highlight |
| `sidenav/*`, `models/navigation-item.interface.ts` | `action.hasPopup`, `expandedActionId`, `@media (hover: none)`; stories: tokens, *Deep Tree* (status above, menu via `anchor` + `expandedActionId`) |
| `number-input/*`, `waterfall-chart/*`, `description-list/*.scss`, `notification-center.icons.spec` | grouping rule (design §9) + canonical blur, FC focus outline; ≤ 5 bars note; total rules as `::before`/`::after`; fixed timestamps |
| specs (new, tests) | `menu.overlay` 26, `tabs.states` 14, `command-palette.active-id` 8, `table.hidden-head` 11, `textarea.hooks` 3, `search-input.clear` 4, `split-button.pass-through` 4, `popover.panel-role` 6, `avatar.shape` 9, `button.pressed` 10, `datepicker.modes` 36, `sidenav.action-popup` 5, `number-input.grouping` 23, `description-list.total-clickable` 3, `theme-contrast` 3.48 block 3 |
| specs (changed, reasons in Deviations) | `sortable-head.component.spec`, `textarea.one-line.spec`, `theme-modes.spec`, `number-input.locale-size.spec` |
| stories | the 22 of design §8 (ids as listed) + argTypes; sidenav 11 stories (tokens), *Deep Tree*; *Five Causes* text |
| `tools/compat/template/src/app/probe-348.ts`, `home.{ts,html}`, `check-angular-majors.mjs` | probe + 4 `EXPECT_IN_HTML` checks (square avatar, hidden actions head with width, sidenav `aria-haspopup`/`aria-expanded`, named tabs + hint + reason tab + panel hook) |
| **r2 (review r1)** `table.component.{html,scss}`, `table.hidden-head.spec` (+1, 11) | F-1: `th.lc-table__actions-cell--label-hidden { position: relative }` while the label is hidden (appended after `.lc-table__sr-only`, one class of weight); default `th` class pinned |
| **r2** `menu.component.ts`, `menu.overlay.spec` (+4, 26) | F-2: `openedAnchor` = the element anchor at open; `returnFocus()` uses the current element anchor, else that one, else `openedFrom`; cleared after close |
| **r2** `menu.stories.ts`, `check-angular-majors.mjs` | F-3: *Anchored Overlay* `<lc-menu>` inside the `lang="de"` wrapper (outer `div[lang]` around the flex row + menu, same layout); compat: the hidden head's `th` carries the modifier before JS |
| **r3 (review r2)** `menu.component.ts`, `menu.overlay.spec` (+4, 30), `menu.stories.ts` | F-4: `onPanelKeydown` `'Tab'`: `if (this.anchor()) this.returnFocus()` before `close()`, no `preventDefault`; JSDoc of `anchor` and `onPanelKeydown`; *Anchored Overlay* description: Tab moves on from the „⋯“ button (or the row), Shift+Tab before it |

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1, 2 | `command-palette.active-id.spec` (writes on moves, set → activedescendant + scroll 94 px, unknown/disabled → first + write-back, keepOpen replacement, no binding); badge after hint, name „Offene Tickets Stammdaten 56/60“, label-in-name pass, axe 0; *Active Id And Counts* |
| 3–7 | `tabs.states.spec` (aria-label both modes; reason tab `aria-disabled`, tabindex −1, tooltip on arrow focus, never selected, plain disabled skipped; links roving; `navigateByUrl(…, { replaceUrl })`, Ctrl/Meta/Shift/middle not navigated; hooks compiled; name „Ticket 12 Status 3 Treffer“ both modes; axe 0); contrast block (muted 5.84 L / 7.31 D, N-3 fixed here and in the draft); 3 stories; compat probe |
| 8 | `menu.overlay.spec` (overlay container, `lang`, at-point class, anchor/panel clicks inside, outside closes, scroll closes / list scroll not, Escape → anchor / previous focus; r2: anchor cleared in `closed`, opened from `<body>` → scroll, outside click, item close and Escape return to the anchor, a later point open returns to the previous focus; 3 of the 4 fail on the r1 code); *Anchored Overlay* panel `lang="de"` (r2 shots, 360/1280 L/D); r3 Tab (keydown → emulated focus step → CD): anchor focused right after the keydown, `defaultPrevented` false, ends on the element after it (Shift+Tab: before it), point anchor → the element focused at open, in-place unchanged (focus on the item after the keydown); the 3 overlay cases fail on the r2 code, in-place passes on both |
| 9 | spec (max-height, `--scroll` class + compiled rule, focused item scrolled 64 px); *Long Menu Capped* |
| 10 | spec (busy row outside `role="menu"`, `aria-busy`, status '' → text after a frame, items arriving take focus, not when focus inside); *Loading Items* |
| 11, 13, 14 | spec (reason item reachable, describedby on focus, click ignored; tooltip; Escape closes tooltip first; hr between members, not after the last; emphasis bold; aria-label none by default) |
| 12 | spec: later document capture listener sees `defaultPrevented`, bubbling listener not called, arrows/Home/End stopped, Tab passes, closed menu leaves Escape alone |
| 15 | spec (swatch `aria-hidden`, after the radio indicator, gradient halves); contrast rim 4.83 / 4.62 L; *Account Menu Swatches* |
| 16, 17 | `table.hidden-head.spec` (default unchanged, hidden text name „Aktionen“, width 240 px, axe + `empty-table-header` pass; r2: modifier on the `th`, compiled rule, computed `position: relative` on the `th` / `absolute` on the span, gone when shown; busy, ring, state text, click emits while busy, hooks compiled); compat probe; r2 shots: page `scrollWidth` 360 at 360 L/D (was 725), span `offsetParent` TH, wrapper scrolls 725 in 328; 1280: 1280, `th` 420 |
| 18 | `textarea.hooks.spec`, `theme-modes.spec` (256 tokens); *One Line Beside A Button* |
| 19 | `search-input.clear.spec` (fake timers: 300 ms default; Enter then Escape → `''`, no stale emit; × too; typing still dedupes) |
| 20, 21 | `split-button.pass-through.spec`; `popover.panel-role.spec` (no popup attrs, tooltip role, describedby, own click untouched, outside/Escape close, auto and click unchanged, axe 0) |
| 22, 23 | `avatar.shape.spec` (5 sizes × initials/image/person, CSS); bg/fg style vars; contrast pairs in design §5 |
| 24 | `datepicker.modes.spec` (36: parse table, keys, min/max, validators, ISO strings, group names, axe) |
| 25 | `button.pressed.spec` (7 variant/state rows, FC rule); contrast block (ink 7.85 / 10.56, border 6.21 / 11.78, ring 3.75 / 7.6) |
| 26, 28–30 | `sidenav.action-popup.spec` (hasPopup/expanded, unchanged event, axe, `hover: none` rule); stories tokens; *Deep Tree*; compat probe |
| 27, 32 | `number-input.grouping.spec` (17 locale rows, paste, string mode, FC outline) |
| 31, 33, 34 | JSDoc + story text; `description-list.total-clickable.spec`; notification-center fixed timestamps (10 runs, see Gates) |
| 35–39 | shots `--axe`; default-DOM proof 8/8 cases identical (menu, tabs ×2 modes, palette, table + sortable head, datepicker closed/open, sidenav, split button + avatar group; `tmp/068/zz-068-default-dom.spec.ts.txt`) |
| 40 | `probe-348.ts` + 4 `EXPECT_IN_HTML` checks |
| 41 | changelog draft below; READMEs unchanged (no component added) |
| 42 | **Not run:** no Playwright/WebKit in `node_modules`, the browser cache is outside the session (listing it needs approval); 054-n2 stays in `BACKLOG.md` (owner rule) |

## Gates

**Round 3 (F-4):** on commit `6d25ea42615128fc56a1c54decfe8fa46b6680ea` (logs `tmp/068/r3/`): Jest 372 suites, **7276 passed**, 8 skipped (+4 menu), no SIGSEGV; lint 0 errors / 159 warnings; build 127 entries; Storybook built (`--skip-nx-cache`, no preview error). *Anchored Overlay* 360/1280 L/D `--axe` vs `tmp/story-shots/068/r2`: 4/4 identical, axe 0, measure unchanged (panel `lang` de, rect 35,143,255,354) → `tmp/story-shots/068/r3/`. Tab measure `tmp/068/measure/r3-tab.mjs` (zoneless, `typeof Zone` undefined), same at all 4: story state Tab → after keydown „Aktionen für Rechnungen 2026“, not prevented, ends on row „Verträge“ (r2: `<body>`); Shift+Tab → row „Rechnungen 2026“; Shift+F10 at row „Archiv“ and right-click on it, Tab → row „Archiv“ after keydown, ends on „Aktionen für Archiv“; menu closed each time, page 360/1280 → `tmp/story-shots/068/r3-tab.log`. Not rerun: `test:tools` (tools unchanged), compat (nothing renders differently on the server; r2: 139 checks).

**Round 2:** all gates ran on commit `d492453241d646c67886de4b4f6b6f9056364525` (later agents skip a gate while `git diff --quiet <hash> -- libs tools` holds; the amend after it only adds the request documents). Logs `tmp/068/r2/`. Round 1 ran on `c04e353` (screenshot compare below still holds: r2 changes only render with `showActionsLabel=false` and in *Anchored Overlay*, both pixel-identical to r1).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 372 suites, 7272 passed, 8 skipped (r1: 7267; +1 table, +4 menu). Two worker SIGSEGVs (`list.link-rows`, `popover.triggers`), rerun alone: 17/17, 20/20 |
| `npx nx run angular-ui-kit:lint` | 0 errors, 159 warnings (unchanged) |
| `npx nx run angular-ui-kit:build` | 127 entries built |
| `npm run test:tools` | 22/22 |
| `npx nx run angular-ui-kit:build-storybook` | built (`--skip-nx-cache`, no preview error), 1272 stories |
| Story screenshots r2 | `tmp/story-shots/068/r2/` (*Hidden Actions Head*, *Anchored Overlay*, 360/1280 L/D, `--axe` 0 violations, measure `tmp/068/measure/r2.mjs`, values in AC 8, 16). Pixel diff (`r2-diff.log`) vs own r1 `build-new2/`: 0 px in all 4 light shots; vs reviewer `r1-misc` table 360/1280: 0 px |
| Story screenshots r1 | compare vs `tmp/story-shots/068/baseline` (1060 shots): differ as design §9 expects (11 AC-28 sidenav stories + *Deep Tree*, *Item Icons*), plus the known random set; new stories `build-new2/` 88 shots, axe 0 |
| `node tools/compat/check-angular-majors.mjs --only=22` | PASS, 139 checks (the hidden-head check now also requires `lc-table__actions-cell--label-hidden` on the `th`) |
| 054-n2 (WebKit) | not run: no Playwright in `node_modules`, the cache is outside the session; row stays in `BACKLOG.md` (2026-11-18) |

## Deviations from the design

For the designer's review (none changes an API or a default):

| # | Where | What and why |
|---|---|---|
| D-1 | menu overlay, element anchor | `max-height: calc(100dvh - 32px)` (design 16 px): the panel's 8 px margins are inside the pane, so a 100dvh − 16 panel never fits the 8 px viewport margin. Point mode keeps `- 16px` (no margins). |
| D-2 | menu focus return | The fallback "element focused at open" also applies to a default menu without trigger (before: focus fell to `<body>`). |
| D-3 | menu sections | `dividerAfter` on the *last* member draws nothing ("between members"; the section's own `dividerAfter` follows the group). |
| D-4 | menu Escape with an item tooltip shown | The first Escape closes the tooltip (its listener stops but does not prevent it); the menu's own Escape is prevented + stopped (AC-12). |
| D-5 | tabs | `.lc-tabs__tab--disabled:focus-visible { opacity: 1 }`: a focused reason tab's ring is drawn at full opacity (the 0.5 would halve the ring). |
| D-6 | datepicker string mode | A typed date on a `disabledDates` / weekend day is not committed (as before) and reports `lcDatepickerParse` on blur; a typed time outside `minTime`/`maxTime` is committed and reports `lcDatepickerMin`/`Max`. Wrapped datetime rows keep the wrapper's 4 px row gap (design 8). |
| D-7 | sidenav stories | `#eee` frame borders became `--color-border` too (same 11 stories). |
| D-8 | changed assertions | `sortable-head.component.spec` (border reads the hook over the same value; table hash taken before the appended `.lc-table__sr-only`), `textarea.one-line.spec` (`min-height: var(--lc-textarea-min-height, 0)`), `theme-modes.spec` (255 → 256 tokens), `number-input.locale-size.spec` l. 92/99 (as typed until blur, design §9). Each carries its reason in the spec. |

## Changelog draft

```markdown
## [3.48.0] - 2026-11-18

USM X's menu, tabs, palette and form gaps, a screen-reader-only actions head for lc-table, the 067 follow-ups and the backlog. Gap IDs: usm-x 2026-11-17 rows 47–70, finance-intelligence kosten-prove-2026-11-18 row 7, 067-s1…s3, backlog 066-n1, 067-n1…n5. No API breaks.

### Added

- **`lc-menu`** (usm-x rows 53–58, 68): `anchor` (an element or `{ x, y }`) opens the panel in an overlay under `<body>`: it escapes scrolling and `overflow: hidden` containers, flips and shifts to stay 8 px inside the viewport (a context menu at the pointer), and closes on Escape, Tab, a click outside or any scroll outside it; focus returns to the trigger, else the anchor element given at open (also when the app clears `anchor` in `closed`), else where it was, and Tab moves on from there (Shift+Tab before it) instead of leaving the page. `maxHeight` caps the panel (26 items at 360 × 640 with `min(56vh, 420px)`: 358.4 px), the items scroll inside and the keyboard-focused item is scrolled fully in. `loading` + `loadingLabel` („Wird geladen …“): a busy row, `aria-busy`, a polite status; items that arrive take the focus. `ariaLabel` names `role="menu"`. `MenuItem`: `tooltip`, `disabledReason` (the item stays in the arrow order as `aria-disabled` and shows the reason on hover and focus), `emphasis` (bold, visual only), `swatch` (a 20 px colour sample or two halves, rim 4.62:1+). `dividerAfter` now also draws between members of a section. New types `MenuAnchor`, `MenuPoint`.
- **`lc-tabs`** (rows 49, 51, 52): `ariaLabel` (the tablist's name), `replaceUrl` (links mode: Back leaves the tool; modified and middle clicks stay the browser's), CSS hooks `--lc-tabs-gap` and `--lc-tabs-panel-padding` (16 px each by default). **`lc-tab`** (rows 50, 69): `tooltip`, `disabledReason` (arrow-reachable, never selected), `muted` (tertiary ink, 5.84:1 light / 7.31:1 dark), `hint` (12 px quiet text before the badge: „Ticket 12 Status 3 Treffer“).
- **`lc-command-palette`** (rows 47, 48): `[(activeId)]` (set the cursor, e.g. on the line that replaced a `keepOpen` item; unknown ids fall back to the first enabled line); `CommandPaletteItem.badge` / `badgeVariant` („56/60“ at the line's end, never shrinks, in the option's name).
- **`lc-table` `showActionsLabel`** (finance-intelligence kosten-prove row 7): `false` keeps „Aktionen“ as the actions head's name for screen readers only, with its `actionsWidth`; the hidden text stays inside the scrolling table (no page overflow at 360 px). **`th[lcSortableHead]`** (row 60): `busy` (`aria-busy`, a static-under-reduced-motion 12 px ring instead of the arrow, clicks still emit) and hooks `--lc-sortable-head-padding-block`, `--lc-sortable-head-padding-inline`, `--lc-sortable-head-border-bottom` (`none` for an own sticky head shadow).
- **`lc-datepicker`** (row 67): `mode="time"` (24 h combobox with a list of `timeStep` options, typed `930` / `9.30` → 09:30, `minTime` / `maxTime`) and `mode="datetime"` (a date and a time field in one value and one `role="group"`, wrapping below 19.5 rem); `valueType="string"` with ISO 8601 local text (`YYYY-MM-DD`, `HH:mm`, `YYYY-MM-DDTHH:mm`), `stringValueChange` and validators `lcDatepickerParse`, `lcDatepickerMin`, `lcDatepickerMax`, `lcDatepickerIncomplete`; `parseDatepickerTime`. Texts: `timePlaceholder`, `dateAriaLabel`, `timeAriaLabel`, `timeListAriaLabel`, `clearTimeAriaLabel`.
- **`lc-button` pressed look** (row 70): `ariaPressed` `true` on `outline` / `ghost` draws the selected tint, a 2 px primary border and primary ink (7.85:1 light, 10.56:1 dark; border 6.21 / 11.78 on the page; Highlight in forced colours); hooks `--lc-button-pressed-bg`, `-fg`, `-border`, `--lc-button-pressed-hover-bg`.
- `lc-split-button` `tone`, `accessKey`, `ariaKeyShortcuts`, `menuSize`, `menuMinWidth`, `menuMaxWidth` (row 63); `lc-popover` `panelRole="tooltip"` for a long press that only shows a card (row 64); `lc-avatar` `shape="square"` (25 %: 6–16 px, row 65); `AvatarGroupItem.bg` / `fg` (row 66); `lc-textarea` hooks `--lc-textarea-padding`, `--lc-textarea-min-height` (one line at 36 px: `5px 12px`, row 61); `NavigationItem.action.hasPopup` and `lc-sidenav` `expandedActionId` (`aria-haspopup` / `aria-expanded`, prerendered; 067-n4).

### Changed

- `--line-height-base` is defined in both themes as `var(--line-height-normal)` (1.5): the value lc-textarea and lc-list inherited from `body` (row 61; 12/18 … 18/27 px unchanged).
- `lc-menu`: every key it handles is `preventDefault`ed as well as stopped; Escape is taken in the capture phase while the menu is open (row 59, as `lc-modal` in row 22).
- `lc-number-input` with `de-DE` / `en-US`: the typed separators stay as typed until blur and are read as a whole: „2.960,00“ → 2960, „1.234“ → 1234, „7.5“ → 7.5; blur shows the canonical text (067-s2).

### Fixed

- `lc-search-input`: Escape or × inside the 300 ms debounce after Enter emits `''` again and no stale value follows (row 62).
- `lc-sidenav` row actions are visible on touch screens (`hover: none`), at every level (067-s1). Sidenav stories use theme tokens (dark *With Groups And Actions* heading now ≥ 4.5:1; 067-s3); *Deep Tree*'s status line shows at 360 px (067-n1).
- `lc-number-input`: a focused field shows a 2 px Highlight outline in forced colours (067-n3). `lc-description-list`: a clickable total row's rules stay straight at its rounded corners (066-n1). `lc-waterfall-chart` docs: at most five bars below about 480 px (067-n2).

### Compatibility

- No API breaks; every input defaults to the 3.47 rendering (default DOM of the changed templates identical apart from comment anchors).
- A consumer's own pressed rule `lc-button .btn[aria-pressed="true"]` (0,2,1) still wins over the kit's (0,2,0) at rest; drop it or set the hooks.
- `--line-height-base` makes lc-textarea and lc-list 1.5 also where an ancestor sets another line height (e.g. 1.6 → 1.5).
- `lc-menu` Escape: a document listener now sees `defaultPrevented` and no longer receives an Escape the menu used.
```
