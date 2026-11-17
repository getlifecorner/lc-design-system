# Build 065: USM X fourth batch (command palette, menu, popover, timeline, avatar, search, sortable head) and the whole backlog

- **Branch:** `feat/3.45-usmx-command-palette-backlog`
- **Commit:** one commit on the branch, `feat(command-palette,menu,search-input,table,popover,timeline,avatar,header,sidenav,tabs,line-chart): request 065 …` (amended; round 1 code = `c978e81`, round 2 code = `7b58aaf`, round 3 code = `9adb211`, round 4 code = `fbb7852`)

## Files changed

| Area | Files | Change |
|---|---|---|
| New entry | `command-palette/` (component, html, scss, spec, stories, index), `libs/angular-ui-kit/command-palette/ng-package.json`, `src/index.ts`, `entries.spec.ts`, `tools/compat/check-entries.mjs` | `lc-command-palette` (AC-8…13), 126 subpaths |
| Menu | `menu.component.{ts,html,scss}`, `menu.toggles.spec.ts`, `menu.stories.ts` | `type`/`checked`/`radioGroup`/`closeOnSelect`, `itemToggle`, *Column Choice* |
| Search | `search-input.component.{ts,html,scss}`, `search-input.escape-description.spec.ts`, stories | `clearOnEscape`, `description`, *Description* |
| Table | `sortable-head.component.*`, `_sortable-head.scss`, `sort-state.ts`, `table.component.{ts,scss}`, `index.ts`, stories | `th[lcSortableHead]`; lc-table CSS byte-identical; *Action Sizes* lg table 1 column |
| Popover | `popover.component.{ts,html,scss}`, `popover.triggers.spec.ts`, stories | trigger kinds, delays, `open/close/toggle`, `align`, flip/shift, *Triggers*, *Placement* |
| Timeline | `timeline.component.{ts,html,scss}`, `timeline.selectable.spec.ts`, stories | `selectable`, `selectedId`, `itemClick`, `ariaLabel`, untitled items; 3 stories |
| Avatar, header | `avatar.component.{ts,scss}`, `avatar.identity.spec.ts`, `avatar.component.spec.ts`; `header.component.{ts,html,scss}`, `header.middle-slot.spec.ts`, stories | hooks, `avatarInitials`; middle slot, `userMenuItems`, `homeLink` |
| Sidenav | `navigation-item.interface.ts`, `sidenav.component.{ts,html,scss}`, `sidenav.foldable.spec.ts`, `sidenav.brand.spec.ts`, stories | `collapsible` + `collapsedSections`, `contextMenuOnLongPress`, rail dot, busy `title` |
| Tabs | `tabs.component.{ts,html,scss}`, `tabs.overflow.spec.ts`, `tabs.links.spec.ts`, stories | `showIcons`, overflow fade, stacked vertical < 31rem |
| Charts | `chart-palette.ts`, `chart-path.ts`, `line-chart.component.{ts,html,scss}`, `line-chart.dotted.spec.ts`, `bar-chart.label-layout.spec.ts`, `theme-contrast.spec.ts`, stories | entry 2 = `--color-secondary-graphic`, `dotted` series |
| Backlog fixes | radio-group, select, textarea, list, chip, hero, device-frame (+ specs/stories) | AC-26…43 |
| Docs, compat | both READMEs; `tools/compat/template/src/app/probe-345.ts`, `home.{ts,html}`, `check-angular-majors.mjs` | palette + sortable head rows; 5 new `EXPECT_IN_HTML` checks |

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1–3 | `menu.toggles.spec.ts`; *Column Choice*; menu specs unchanged; default DOM = main (temp proof) |
| 4–5 | `search-input.escape-description.spec.ts`; *Description* |
| 6–7 | `sortable-head.component.spec.ts` (parity with lc-table, labels EN/DE); table CSS hash = main; compat probe |
| 8–13 | `command-palette.component.spec.ts` (keys, scrolling and pinning on the listbox, option names + `label-content-name-mismatch`, async groups, labels, axe in jsdom), `entries.spec.ts`, manifest tests (`test:tools`), compat probe-345 (closed: host only); 5 stories |
| 14–18 | `popover.triggers.spec.ts` (fake timers, once-per-change, Escape, ARIA per kind, flip computes the new side's shift, `align="end"`); *Triggers*, *Placement*. AC-17 measured at 360 and 1280: 4/4 panels inside [8, vw − 8] (360: 16–282, 78–344, 8–274, 86–352), arrow = trigger centre ± 0 |
| 19–21 | `timeline.selectable.spec.ts`; 3 stories; compat probe (buttons, one tab stop, `aria-current`) |
| 22–23 | `avatar.identity.spec.ts` (hooks never declared, fallbacks, `avatarInitials` used by header and group) |
| 24 | **Not checkable here**: no WebKit/Playwright in `node_modules`, story-shots drives system Chrome only (2026-11-18). 054-n2 stays in the backlog (owner decision 2026-11-17). |
| 25 | `theme-contrast.spec.ts` AC-25 block (floored: surface-2 4.41 / 4.59, sunken 4.19 / 5.79) |
| 26–29 | table *Action Sizes*; hero *Badges in the Body* (German band names), *Light Slim* (`variant="light"`), *Stage Actions* („9.3:1 or more“) |
| 30, 33 | device-frame *Screenshot Row* (`4px 16px 8px`); `device-frame.laptop.spec.ts` (base rim `min(1px, h)`, clip at 0) |
| 31–32 | `hero.component.spec.ts` (62 % cap, D7), `hero.heading-focus.spec.ts` (hyphens); *Large Text* measured (D7); the English hero title now hyphenates at 360 (*English*, *Two Instances*) |
| 34 | `chip.hit-area.spec.ts` (24 × 24 `::before`, sizes unchanged, JSDoc exception) |
| 35 | `select.groups.spec.ts` (2-line clamp + `title`) |
| 36 | `radio-group.required-error.spec.ts` (`*` hidden, text in legend, error after options, axe) |
| 37 | `line-chart.dotted.spec.ts`; *Gaps And Forecast* (+DE) Plan dotted |
| 38 | `header.middle-slot.spec.ts`; *Middle Slot And Menu Entries* |
| 39, 45, 47 | `sidenav.foldable.spec.ts` (fold, unfold on current, rail ignores, long press with fake timers, Android echo, dot, busy `title`); *Foldable Sections*; `items` argType + JSDoc |
| 40, 44, 46 | `tabs.overflow.spec.ts`; *With Icons*; compat checks the container query in prerendered CSS |
| 41 | `textarea.one-line.spec.ts` (base rule `display: block`) |
| 42–43 | `list.columns.spec.ts` (groups, no group without heading, `focusItem`, axe, CSS) |

Default rendering: a temp spec (`tmp/065/zz-065-old-new.spec.ts.txt`) rendered main's and the new templates of header, line-chart, list (3 cases), menu, popover (closed/open), radio-group, search-input, select, sidenav (docked/rail), tabs (3 modes), timeline (2): 17/17 identical apart from comment anchors.

## Gates (round 1; round 2 below)

All gates ran on the code of commit `c978e8128164438410be6da2f2321acdba4b2182` (the final amend only adds this file and the message; `git diff --quiet c978e81 -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 352 suites, 6950 passed, 8 skipped (`tmp/065/test.log`) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 160 warnings (unchanged) |
| `npx nx run angular-ui-kit:build` | 127 entries built (126 + `command-palette`); only the known ng-packagr export-condition warnings |
| `npm run test:tools` | 22/22 (incl. the library-wide manifest tests: palette and sortable head props) |
| `npx nx run angular-ui-kit:build-storybook` | 1239 stories (1222 + 17 new, IDs as design §8) |
| Story screenshots | New: `tmp/story-shots/065/build-new2` (17 stories × 360/1024/1280 × L/D, `--full --axe`; axe: D1). Compare with `065/baseline`: `065/build-c1…c4`, 1510 identical, 164 different, all expected by §9 (line-chart series 2 ×18, list *Headings In Columns*, textarea ×9 stories, table *Action Sizes*, hero *Badges*/*Light Slim*, device-frame *Screenshot Row* 360 + *Laptop Hooks*, rail badges ×3 stories, tabs *With Icons* + 360 overflow/vertical, select *Search (DE)* 360, area-map *Large Text*) or attributed: English hero title hyphenates at 360 (*English*, *Two Instances*); *Two Instances* 1024 fixed by D7 (identical on rerun `065/rerun-hero`); random: *All Bands* (a different shot each run), sidenav *Action Items*/*Lazy Children* 1024 (spinner frames, differ from my own run too), table *Full Featured*/*With Filtering*/*With Pagination* 1024/1280 (known). Radio *With Error* is an `lc-radio` story: identical. |
| `node tools/compat/check-angular-majors.mjs --only=22` | PASS, Angular 22.2.6: 130 prerendered-HTML checks (125 + 5 new from `probe-345.ts`: closed palette = host only, hover/focus popover without panel, selectable timeline, sortable `th`, stacked vertical tabs CSS) |

Opened myself (6): palette *Default* 360, sidenav *Foldable* 1280, timeline *Selectable* 360, header *Middle Slot* 1280 (led to the story fix), menu *Column Choice* 360, popover *Placement* 360 (led to D6).

## Deviations from the design

| # | What | Needs |
|---|---|---|
| D1 | Decided in review r1 (design §3, §6): names = all visible parts, the listbox scrolls. Built in round 2 (M1, M2). | done |
| D2 | Stacked vertical tabs in forced colours: selected line `CanvasText`, rest `Canvas`, as 3.44's rule (§5 says "Highlight like 3.44's rule"; 3.44 uses CanvasText). | agreed r1 |
| D3 | AC-25 values are floored (4.41/4.59 surface-2, 4.19/5.79 sunken); §5 quotes them rounded. | — |
| D4 | Assertions changed, each with the reason in the spec: `avatar.component.spec` (member hooks wrap the token), `sidenav.brand.spec` (focus rings 8 → 9, the fold button), `tabs.links.spec` (the < 31rem container block may set `border-right`), `textarea.one-line.spec` (base rule is a block), `select.groups.spec` (+ clamp), `hero.component.spec` (62 % cap), `hero.heading-focus.spec` (+ hyphens), `device-frame.laptop.spec` (+ base rim/clip), `bar-chart.label-layout.spec` (palette entry 2 normalised like 3.37's entries 3/4). | — |
| D5 | Hero *Badges in the Body*: the 10th (light) hero is labelled „Monatsstand · Petrol hell“ (§7 names the 9 bands). Header *Middle Slot* story: 340 px between the two headers so the open account menu is not covered. Root README lists `sortable-head (th[lcSortableHead])`. | — |
| D6 | Found in the shots, fixed: `lc-popover` placed panels against a stale layout (a flip measured the panel in its old side's geometry; the first measurement ran before a late layout shift), so *Placement* had one panel at x −113 and every shift identical at 360 and 1280. `place()` now computes the panel's rect from the trigger rect and the panel's layout size (`offsetWidth/Height`, no transform) and re-places on page, trigger and panel resize (one `ResizeObserver`, one frame). *Placement* puts each demo in its own row (two open panels overlapped at 360). | — |
| D7 | AC-31 cap **62 %**, not 60 %: *Two Instances* has an 880 px grid at 1024, where 60 % (528) shrank the documented 34rem media (544); §1's criterion "keeps every 100 % layout" needs ≥ 61.8 %. Now identical to main at 100 %; 200 % text at 1024: media 496 of 800 px, right edge on the grid's, 112 px clear of the title (1280: 655 of 1056). | agreed r1 |

## Round 2 (review r1 findings), code = `7b58aaf`

All round-2 gates ran on this code (the final amend adds only this file's hash; `git diff --quiet 7b58aaf -- libs tools` holds).

| # | Fix | Proof |
|---|---|---|
| M1 | Item options: `aria-labelledby` = `-label -desc -hint -kbd` (present ids), no `aria-describedby`; `&ngsp;` after the label, after `__text` and inside the hint's `@if`. Retry option unchanged. | unit: name parts, DOM text spaced, `label-content-name-mismatch` pass on 5 options + negative control (spaces removed → violation); shots 0 violations |
| M2 | Listbox scrolls (§3 values); modal body `overflow: hidden; padding: 0; min-height: 0`, palette body flex column. Pinning on the listbox, and it reads the option's *old* id before the update (ids follow the position: a group above renamed `g1-o1` → `g2-o1`, so the old code read another option). | unit with a fake layout (pin Δ 0); measure *Default* 1024 (group of 2 inserted via args): active top 269 → 269, scrollTop 27 → 149 |
| M3 | DE `placeholder` „Suchen …“ | *German* 360: 63.3 px in a 123 px text box |
| M4 | `.popover__panel { text-align: start }` | *Placement* 360: all 4 panels start-aligned; unit pin |
| S1 | `reveal()`: first enabled option → scrollTop 0; last → end; first of a group → its heading in view; else nearest edge. A new query puts the list at its top. | unit (5); measure *Default* 1024/1280: ↑ wraps → 27/27 (max), Home → 0, heading 8 px below the top; group 2 heading in view |
| S2 | hint `flex: 0 0 auto; max-width: 33%`; `--reason` modifier `white-space: normal; text-align: end` | *German* 360: Stammdaten 71.6 whole, long hint 103 cut, reason 2 lines → row 48; *Default* 360: Master data 67.4, 3 days ago 61.7 whole |
| S3 | timeline `success`/`warning` → `--color-text-success`/`-warning` (ring, dot, icon) | unit pin; light 5.30 / 6.03 on the page (dark 9.16 / 8.34 on the story page) |
| N1 | header *Middle Slot* `homeAriaLabel="Zur Startseite"` | identical shots |
| N2 | D4 says 62 % | — |

Implementation notes (no design change): (a) `.lc-command-palette__heading { transition-property: none }`: under reduced motion the global `transition-duration: 0.01ms` animated the old first heading's padding (4 → 12) for a frame, so the pinning read 8 px short (measured 277 vs 269 before the rule). (b) `.lc-command-palette__listbox:has(+ .lc-command-palette__empty) { padding-block: 0 }` + empty text `margin: 8px 12px`: *No Results* stays pixel-identical. (c) jsdom audits: lc-modal sets `body { overflow: hidden }` and the modal body now clips; with 0 × 0 rects axe took every option for hidden and skipped it, so the spec lifts both before auditing (the AC-9 tag audit now checks the options too). Assertions changed: the palette naming test (M1, D1) and the DE placeholder (M3).

| Gate (round 2) | Result |
|---|---|
| test | 352 suites, 6965 passed, 8 skipped (+15: palette 12, timeline 2, popover 1) |
| lint · build · test:tools | 0 errors / 160 warnings · 127 entries · 22/22 |
| build-storybook | 1239 stories |
| shots (`--full --axe`) | `tmp/story-shots/065/r2-new` (11 stories × 3 widths × L/D, 66 shots): **0 axe violations**. Rerun of the 5 palette stories (`r2-new2`): 30/30 identical. vs `build-new2`: different = palette *Default* 360, *German* all, *Async Groups* all (1024/1280: Δ ≤ 2 AA only, geometry measured equal), popover *Placement*, timeline *Selectable* ×3; identical = *No Results*, *Shortcut And Trigger*, popover *Triggers*, header *Middle Slot*. Popover others vs `r1-c`: 24/24 identical. Timeline others vs `build-c2` (`r2-c-tl`): 36 different (6 stories with success/warning markers), *Minimal Items* identical |
| compat `--only=22` | PASS, Angular 22.2.6, 130 checks |

Opened (3): palette *German* 360, *Async Groups* 1024 (both runs, diff located), popover *Placement* 360.

## Round 3 (review r2 M5), code = `9adb211`

All round-3 gates ran on this code (the final amend adds only this hash; `git diff --quiet 9adb211 -- libs tools` holds).

| # | Fix | Proof |
|---|---|---|
| M5 | `.timeline--selectable { padding: 0.25rem 0.5rem }`, `&.timeline--horizontal { padding: 0.25rem }` (design §3 r2) | 3 CSS pins in `timeline.selectable.spec.ts` (paddings = box outsets; only these two rules pad the `ol`; base `.timeline` padding 0), failing on HEAD's SCSS (3/13). Measure `tmp/065/measure/r3.mjs` on `r3-new`, every shot: box margins in the `ol` top/bottom/first-left/last-right ≥ 0 (0 / 0–0.5; compact last 12 = its pre-existing 12 px gap), selected bar 3 of 3 px visible. *Selectable Horizontal* 360 (scroll max 64): at 0 first box left 0, at the end last box right 0, bar 3 px both. `ol` heights: *Selectable* 358 (360) / 317.5 (1280), *Compact* 226, *Horizontal* 174.5 (360) / 114.5 (1280) = review's +8 |
| S4 | open (release queue, as the review says) | — |

| Gate (round 3) | Result |
|---|---|
| test | 352 suites, 6968 passed, 8 skipped (+3 pins); one worker SIGSEGV on `notification-center` in the full run, that suite alone 38/38 (`tmp/065/r3-test*.log`) |
| lint · build | 0 errors / 160 warnings · 127 entries |
| build-storybook | 1239 stories |
| shots (`--full --axe`) | `tmp/story-shots/065/r3-new`: 3 Selectable stories × 360/1280 × L/D, 12/12 different from `r2-new` (expected: +8 height), 0 axe violations |
| compat `--only=22` | PASS, Angular 22.2.6, 130 checks |

`test:tools` not rerun (`tools/` unchanged). Opened (2): *Selectable Horizontal* 360 light, 1280 dark.

## Round 4 (review r3 M6), code = `fbb7852`

All round-4 gates ran on this code (the final amend adds only this hash; `git diff --quiet fbb7852 -- libs tools` holds).

| # | Fix | Proof |
|---|---|---|
| M6 | button `(focus)` → `onItemFocus`: `closest('li')?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })`; `.timeline--selectable .timeline__item { scroll-margin: 0.25rem 0.5rem }`, `.timeline--selectable.timeline--horizontal .timeline__item { scroll-margin: 0.25rem }` (design §6 r3) | unit: spy on `Element.prototype.scrollIntoView` (focus, →, End, Home → li 0, 1, 3, 0, options nearest/nearest), no-`scrollIntoView` guard, CSS pin (only these two rules set `scroll-margin`). Keyboard walk `tmp/065/measure/r4.mjs` (`tmp/065/r4-key.log`, columns as the designer's `r3-proto.log`): *Selectable Horizontal* 360 scrollLeft focus 0, → 0, → 64, Home 0, End 64, ← 64, ← 0, End 64; focused box margins ≥ 0 at every step (item 3 right 0, item 1 left 0); page `scrollY` 0 throughout: **equal to `r3-proto` row by row**. 1280 and vertical *Selectable* 360/1280: no scroll, margins ≥ 0 (vertical 360 = `r3-proto`) |
| S4 | open (release queue) | — |

| Gate (round 4) | Result |
|---|---|
| test | 352 suites, 6971 passed, 8 skipped (+3: spy, guard, pin) |
| lint · build | 0 errors / 160 warnings · 127 entries |
| build-storybook | 1239 stories |
| shots | at rest: 3 Selectable stories × 360/1280 × L/D vs `r3-new`: 12/12 identical, 0 axe violations (`tmp/story-shots/065/r4-new`); the other 7 timeline stories × 360/1024/1280 × L/D vs `r2-c-tl`: 42/42 identical (`065/r4-tl`). After the walk: `065/r4-key` |
| compat `--only=22` | PASS, Angular 22.2.6, 130 checks |

`test:tools` not rerun (`tools/` unchanged). Opened (1): `r4-key` *Selectable Horizontal* 360 (item 3 whole, ring on all four sides).

## Changelog draft

### Added

- **`lc-command-palette`** (`@lifecorner/angular-ui-kit/command-palette`, usm-x row 34): a search field over grouped results in a top-anchored dialog (a full-width sheet below 640 px, a 640 px panel above; `--lc-command-palette-width`, `--lc-command-palette-max-height`). `groups` (heading; items with label, icon, description, hint, shortcut, `disabled` + `disabledReason`, `keepOpen`), `[(open)]`, `[(query)]`, debounced `searchChange` (`debounceMs` 300) for a server search, `itemSelect`, async groups (`loading` with `aria-busy` and a polite status, `error` with a „Try again“ option → `groupRetry`, `emptyText`). The results list scrolls; the keyboard cursor stays on its option, in place, while results arrive; ↑/↓ across groups (a group's first option brings its heading into view), Home/End, PageUp/Down, Enter; Escape clears, then closes. Each option is named by all its visible text (WCAG 2.5.3); hints keep up to a third of the row, a disabled reason wraps. Optional `shortcut` (`'mod+k'`), `highlightMatches`, `labels` (EN, `COMMAND_PALETTE_LABELS_DE`). Fetches nothing; closed, it renders only its host (also prerendered).
- **`lc-menu` checkbox and radio items** (usm-x row 31): `MenuItem.type`, `checked`, `radioGroup`, `closeOnSelect`; `menuitemcheckbox`/`menuitemradio` with `aria-checked` and a check or dot; `itemToggle` emits `{ item, checked }`, the menu stays open and the focus stays on the item.
- **`th[lcSortableHead]`** (entry `table`, usm-x row 33): `lc-table`'s sortable header on an app's own `<th>`: same look and arrows, `aria-sort`, Enter/Space, `sortChange`, `sortedAscendingLabel`/`sortedDescendingLabel`; type `TableSortDirection`. `lc-table`'s head is unchanged (its CSS is byte-identical).
- **`lc-search-input`** (usm-x row 32): `description` (help linked by `aria-describedby`) and `clearOnEscape`.
- **`lc-popover`** (usm-x row 35): `trigger` takes `focus`, `longpress` (`longPressMs` 500; right click, Shift+F10, Menu key) or an array of kinds; `openDelay`/`closeDelay`; `open()`, `close()`, `toggle()`; `align` start/center/end; the panel flips and shifts to stay 8 px inside the viewport, its arrow on the trigger.
- **`lc-timeline`** (usm-x row 36): `selectable` (one tab stop, arrows/Home/End, Enter/Space), `[(selectedId)]` with `aria-current`, `itemClick` `{ item, index }`, `TimelineItem.ariaLabel`; `title: ''` renders no title element. A selectable list pads by its item boxes (4/8 px, horizontal 4 px), so the selected bar and the focus ring stay whole, also in a horizontal timeline that scrolls; there, the keyboard-focused item scrolls fully into view (360 px, three items: → → scrolls 64 px, item 3 whole; the page doesn't move).
- **`lc-avatar`** (usm-x row 37): `--lc-avatar-bg`/`--lc-avatar-color` on the avatar or any ancestor; `avatarInitials(name)`, the one rule of avatar, avatar group and header (`ɵavatarInitials` stays as a deprecated alias).
- **`lc-header`** (064-n1): `[slot='middle']`, `userMenuItems` + `userMenuItemClick`, `homeLink`. **`lc-sidenav`** (064-n2): `NavigationItem.collapsible` + `[(collapsedSections)]`, `contextMenuOnLongPress` (iOS). **`lc-tabs` `showIcons`** (064-n3). **`LineChartSeries.dotted`** (063-n1).

### Changed

- `lc-search-input`: Escape with text clears it (one `''`, focus stays, the key is consumed); on an empty field it passes on. Opt out: `[clearOnEscape]="false"`.
- `lc-popover`: hover/focus-only panels are `role="tooltip"` and describe the trigger (no `aria-haspopup`/`aria-expanded`); panels flip/shift into the viewport; panel text always starts (`text-align: start`), also inside a centred or end-aligned parent.
- `lc-timeline`: `success` and `warning` markers use the text inks (light 2.72 → 5.30:1 and 2.26 → 6.03:1 on the page; WCAG 1.4.11).
- Chart palette entry 2 is `--color-secondary-graphic` (057-n2): light 2.98 → 4.41:1 on `--color-surface-2`, 2.83 → 4.19:1 on sunken.
- `lc-textarea` multi-line: the host ends at the field (−6 px, 133 → 127 at md; 063-n2). `lc-radio-group`: the error moves below the options, the `*` is hidden and the legend reads „required“ (061-n3). `lc-select`: group headers at most 2 lines, full text in `title` (062-n1).
- `lc-tabs`: an overflowing list fades 24 px at the hidden side(s) (064-n6); vertical tabs stack in a container below 31rem (064-n8). `lc-sidenav` rail: badge values over 2 characters become an 8 px dot (064-n7); busy items lose the `title` (064-n9).
- `lc-list` `multiColumn` with headings: a heading and its rows stay in one column (wrapper `div.lc-list__group`), no divider at a group's foot, corners not clipped (064-n4/n5). `lc-hero`: media column at most 62 % of the row (at 200 % text on 1024 px: 496 of 800 px instead of running past the band), the title hyphenates (060-n1/n2). `lc-device-frame` laptop: base height 0 hides the base (060-n3). `lc-chip`: the × has a 24 × 24 hit area (060-n5).

### Compatibility

No API breaks: every new input is optional with an unchanged default (default DOM proven identical for 11 templates); `TimelineItem.title` stays `string`; `PopoverTrigger` unchanged. Peer range and dependencies unchanged.
