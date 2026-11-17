# Build 064: USM X frame and controls (16 rows), split button

- **Branch:** `feat/3.44-usmx-frame-button-split`
- **Commit:** `feat(…): request 064 — USM X frame and controls, lc-split-button` (one commit, amended after review rounds 1 and 2; round 3 gates below)

## Round 3: review round 2 finding 10

| # | Fix | Test | Measured (r3 shots) |
|---|---|---|---|
| 10 | `tabs.component.scss`: the vertical selected rule moves out of `&--selected` to after the vertical rest rule (both 0,2,0), as `.lc-tabs--vertical .lc-tabs__tab--selected { border-right: 2px solid var(--color-primary-500) }`; its `border-bottom-color: transparent` is dropped (the rest rule's `border-bottom: none` already removes the line). The forced-colours rules (0,3,0, later) still win | `tabs.links` "vertical: the selected tab draws its right line" (+1): rule body, rest rule, order, no normal `border-right` after it outside the forced block, horizontal underline kept. Fails on the round-2 stylesheet (1 failed / 13), passes now (14) | *Vertical* 360/1280 L/D: selected `2px rgb(32, 132, 151)` L / `rgb(132, 199, 212)` D, the 3 others `rgba(0, 0, 0, 0)`; pixel-identical to the designer's `r2-proto` (4 / 4) |

Shots (`tmp/story-shots/064/`, wait 800 ms, read-only measure): `r3-c1/` vs `r2r-c1`: 8 identical (*Router Links* (+ German)), 4 differ (*Vertical* ×4). `r3-cb/` vs `r2r-cb`: 20 identical (*Default*, *Keyboard Focus*, *With Badges*, *With Disabled Tab*, *With Icons*), 4 differ (*Vertical* ×4). `r3-forced/` vs `r2r-forced` (`--forced-colors`, 5 stories × 360 × L/D): 10 / 10 identical. `r3-proto/` vs `r2-proto`: 4 / 4 identical. Opened: *Vertical* 360 L, 1280 D.

## Round 2: review round 1 findings 1–5

| # | Fix | Test | Measured (r2 shots) |
|---|---|---|---|
| 1 | `busyText(item)`: on the rail the hidden busy text leads with the label (`label busyLabel`), unless the badge text already does; drawer unchanged | `sidenav.row-states` "on the collapsed rail" (2): link, action, group → „X Wird geladen“, badge → „Incidents 56 von 60 geladen Wird geladen“, label `display: none`, `data-tooltip` unchanged | *Collapsed Rail States* L/D 360/1280: label `none`, hidden text „Berichte Wird geladen“, `title`/tooltip „Berichte“; pixel-identical to `build-new2` |
| 2 | host `lc-split-button { align-items: flex-start }`: a stretching parent stretches the host only | `split-button` stylesheet pin (host and group rules) | *Default* (200 px row): host 200 high, group 142.5 × 42, face 98.5 × 42, caret 44 × 42; the other 4 stories pixel-identical to r1 |
| 3 | `.lc-badge--wrap.lc-badge--has-icon { text-align: start }` | `badge.icon` pin (+ `wrap` alone stays centred) | *With Icon*: icon right 41, both lines at 46.6 (gap 5.6) |
| 4 | forced colours: `.lc-tabs__list .lc-tabs__tab` Canvas line, selected CanvasText (design §5), vertical on the right border | `tabs.links` forced-block pins (4 rules + order) | `--forced-colors` 360 L/D, *Default*, *Vertical*, *Router Links* (+ German), *With Badges*: selected `2px` CanvasText, others Canvas; normal-mode tabs shots identical to r1 |
| 5 | story frame `flex-wrap: wrap` (status line under the nav when it doesn't fit) | — | *Counts And Context Menu* 360: overflow 0, status at y 278, w 326; 1280 identical to r1 |

## Files changed

83 files under `libs/angular-ui-kit/src/lib/{header,page-header,card,search-input,modal,stat-trend,button,badge,split-button,tabs,sidenav,list,models,internal/navigation}`, `src/styles/_theme-{light,dark}.scss` (partial work kept), `src/index.ts`, `split-button/ng-package.json`, `src/docs/{getting-started,colors}.mdx`, both READMEs (component list), `tools/compat/{check-angular-majors,check-entries}.mjs`, `tools/compat/template/src/app/{probe-344.ts,home.ts,home.html}`. API per design §2; 13 new spec files, 33 new stories (design §8 ids). The sidenav items share one `#itemContent` template; busy/disabled router links are stopped by a capture-phase click listener (design §1).

### Changed assertions (reason)

| Spec | Was | Now | Reason |
|---|---|---|---|
| `stat-trend.component.spec.ts` "default tile" | children `header,row` | `row`, no header | AC-19 removes the empty header |
| `button.tone.spec.ts:90` | literal `rgba(132, 199, 212, 0.06)` | `var(--lc-button-outline-bg, var(--color-primary-wash))` | AC-21 (no literal); render equal, pinned in `theme-contrast` |
| `theme-contrast.spec.ts` 3.15 block | parsed the literal from the button sheet | reads the token named in the rule, per palette; `color()` reads `color-mix(… N%, transparent)` | AC-21, design §2 |
| `entries.spec.ts` | 118 public | 119 (+`split-button`) | AC-26 |
| `kit-icons.spec.ts` `NOT_ICONS` | — | `badge/badge.component.ts: error` | badge now renders `lc-icon`, so its variant literal is scanned |
| partial work: `page-header*.spec`, `focus-indicators`, `theme-modes` | old hook-less values, 173/253 tokens | hook fallbacks, 175/255 | AC-8/10, AC-1, 2 new tokens |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1, 8…11, 16…19 | specs `header.ancestor-hooks` (6), `page-header.title-aside` (6) + updated pins, `search-input.combobox` (3), `modal.keys-top` (10), `stat-trend.no-header` (4); 8 stories; measures below |
| AC-2, 3…7, 15, 32 | `tabs.links` (14), `sidenav.row-states` (18: action items, busy, lazy children, reason tooltip + `aria-describedby`, hint, `matchRoutes`, `iconUrl`, `muted`, badge name, context menu, brand), `list.row-states` (14); 12 stories; 064-n2 left-outs per design §9 |
| AC-12…14, 20…24 | `card.heading-target` (14), `button.row-access` (10), `badge.icon` (4), `theme-contrast` 3.44 block (floored: wash text 17.12 / 15.71, tile icon 3.66 / 8.65); 8 stories |
| AC-25, 26 | `split-button.component` (18, axe open and closed); 5 stories; stub, `src/index.ts`, READMEs, manifest (temp tool test `tmp/064/zz-064-manifest.test.mjs.txt`) |
| AC-27, 28 | full suite; sidenav and list default DOM identical to `main` (temp specs `tmp/064/zz-064-*-old-new.spec.ts.txt`, 4 configurations each, comments aside); `@default` on every input; argTypes |
| AC-29…31 | compat below; changelog draft; `colors.mdx`, `getting-started.mdx` |

## Gates

Round 3 gates ran on commit `89d542d` (later agents skip a gate while `git diff --quiet 89d542d -- libs tools` holds); logs in `tmp/064/r3/`. Round 2 ran on `fe790c4`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 338 suites, 6805 passed, 8 skipped (r2 6804; +1 test), no worker crash |
| `npx nx run angular-ui-kit:lint` | 0 errors, 160 warnings (unchanged) |
| `npx nx run angular-ui-kit:build` | green, 126 entries |
| `npm run test:tools` | not rerun: `tools/` unchanged since r1 (22 / 22; manifest temp test `tmp/064/zz-064-manifest.test.mjs.txt`) |
| `npx nx run angular-ui-kit:build-storybook` | green (`--skip-nx-cache`) |
| Story screenshots | round 3 above, earlier rounds below |
| `check-angular-majors.mjs --only=22` | not rerun in r3: one stylesheet rule moved, no template change, no `EXPECT_IN_HTML` pin on a tabs selector. r2: PASS (Angular 22.2.6), 125 HTML checks |
| `check-entries.mjs` | not run here (CI step); count 124 → 125 |

**Round 2 screenshots** (`tmp/story-shots/064/`, measure `tmp/064/measure/m-r2.mjs`): `r2-c1/` split button ×5, badge *With Icon*, tabs *Router Links* (+ German), *With Badges* × 360/1280 × L/D vs `r1-c1`: 28 identical, 8 differ as intended (split *Default* ×4, badge *With Icon* ×4; the story's wrapped badge is 320 wide at both widths). `r2-sidenav/` vs `r1-sidenav`: *Counts And Context Menu* 1280 identical, 360 differs (intended); *Collapsed Rail States* differs only by the reviewer's focus (tooltip) and is identical to my `build-new2` shots (`r2-sidenav-own/`). `r2-forced/` 5 tabs stories × 360 × L/D `--forced-colors`. `r2-axe/` 5 changed stories × 360/1280 × L/D: 0 violations (20 shots).

Open for the designer (r2): the vertical tabs' selected tab drew no right line in normal colours (`rgba(0, 0, 0, 0)`). Fixed in round 3 (finding 10).

**Screenshots** (`tmp/story-shots/064/`):

| Run | Result |
|---|---|
| `build-new/` 33 new stories × 360/1280 × L/D, `--axe` | 132 shots, 0 violations. Sidenav and tabs stories re-shot after fixes in `build-new2/` (32, 0 violations); tabs and dense card head final in `measure2/` (12, 0 violations) |
| `build-c1…c4/` vs designer baseline (888) | 855 identical. 33 differ: card *Primary Badge States* ×4 (intended AC-13: body-less titled cards); tabs ×16 and page-header *Full Example* / *With Body Content* ×5 (tabs list is now a scroll container: AA only, max Δ1–2, plus the inset ring of the focused tab in *Default*, and *With Badges* / *Full Example* 360 clipped at the list edge, all intended §1); sidenav ×8 (rerun: `themed-rail-badges` flips L↔D and `collapsed-vs-expanded` / `sidebar-first-prominent-brand` ≤ 2 px Δ1: flaky; `text-brand-drawer-german` 1280 D: 21 px, Δ ≤ 35, deterministic, edges of the brand glyph and of the current item's rounded border, no geometry change: for the designer). All header and app-shell shots identical (AC-1) |
| `forced/` 4 stories × 360 × L/D, `--forced-colors` | split button, sidenav hints/reasons, list tooltips and busy rows |
| `measure/`, `measure2/` | values below |

**Measured** (light, 360/768/1280): AC-1 header z 900, `elementFromPoint(header)` = `lc-modal-backdrop`; ancestor hooks → `linear-gradient(90deg, rgb(13,53,61), rgb(26,106,121))`, title `#fff`, plain header `#fff`. AC-18 top 90 before and after "Add results" (h 296 → 496), x 18 / 84 / 340, w 324 / 600. AC-2 DE 360: list 672 in 328, `scrollLeft` 246, current „Änderungsverlauf“ fully in view, page 360. AC-11: 1280 one row (aside y 37, actions y 32); 768 hook 1: aside y 83.5 full width, actions y 32; 360 hook 0: default wrap. AC-7 (360 drawer, item 264): hint 12 px before the badge, badge/chevron 10 px from the end; „Rich Client“ 60.8 untruncated, „Editor im Rich Client“ 67.9 truncated with `title`. AC-15 columns x 16 (360), 16/396 (768), 16/334/652/970 (1280), each heading at its next row's x. AC-25 caret h = face h (35.5 / 42 / 48.5), w 36 / 44 / 48. AC-14 dense head 32.4, hit 6 px above and 7 px below (44.4).

Open for the designer: in *Headings In Columns* the list's rounded `overflow: hidden` corner clips the start of the last divider of column 1 (existing list style).

## Deviations from the design

| # | Design | Built | Why |
|---|---|---|---|
| 1 | `title-aside` after the heading, before the overline (§3) | after the overline in the DOM | the 3.3 pin "overline is the heading's next sibling" (read right after it); visual order identical (overline `order: -1`) |
| 2 | Sidenav hint `flex: 0 1000 auto` (§3) | `0 100000 auto` | measured at 360: at 1000 the label still lost ~0.04 px and showed „Navigati…“ |
| 3 | Footer rule reads the divider hook | a second same-weight rule after the 3.29 footer rule | that rule is pinned whole (`card.footer-layout.spec.ts`, AC-26 of 3.29) |
| 4 | Modal: Enter/Space handled "in a keydown on the dialog element" | keydown on the × itself | same flags and order for page listeners; no lint exception for a key handler on a non-interactive div |
| 5 | Card sm toggle `::after` `inset: -6px 0` (§3) | `inset: -6px 0 -7px` | measured: the `::after` sits in the padding box, inside the 1 px rule, so `-6px` gave 43.4 px; now 44.4 |
| 6 | Tabs: scroll the selected tab in "after the first render and when it changes" | also on a `ResizeObserver` of the list and its tabs | measured: the first-render scroll ran before the web font, current tab off by 28 px at 360 |

## Changelog draft

```markdown
## [3.44.0] - 2026-11-17

The USM X frame and control gaps: header hooks from any ancestor and a header below the modal, a slot beside the page title, card tiles that follow a theme, combobox attributes on the search field, handled keys and a top placement in the modal, a row shape and access keys on the button, an icon in the badge, a tab list for the router outlet, action entries and row states in the side navigation and the list, and the new `lc-split-button`. Gap IDs: usm-x 2026-11-17 rows 4, 11, 14, 16, 17, 20–30, backlog 064-n2. No API breaks.

### Added

- **`lc-split-button`** (`@lifecorner/angular-ui-kit/split-button`, usm-x row 30): a face (`lc-button`, emits `clicked`) and a caret that opens an `lc-menu` of `items` (emits `itemClick`), in one outline; two tab stops, `aria-haspopup="menu"` and `aria-expanded` on the caret (also in prerendered HTML), `menuAriaLabel` (default "More actions"). `variant` outline (default), primary, secondary; `size` sm, md, lg (caret at least 36, 44, 48 px wide, as high as the face; in a stretching flex row it keeps its own height, md 42 px, like `lc-button`); `disabled`, `loading`.
- **`lc-tabs` `mode="links"`** and `panelId` (usm-x row 11): a tab list of links for a router outlet; `lc-tab` takes `route`, `queryParams`, `queryParamsHandling` or `href`, `current` (`aria-selected`) and `tabId`. A reload or a shared `?tab=` link shows the same tab, also before JS. Arrows, Home and End move the focus; Enter or Space follow the link.
- **`lc-sidenav`** (usm-x row 14): action items (`kind: 'action'`, a button that emits `itemClicked`; the app sets `current`); `busy` (spinner, `aria-busy`, no activation, `busyLabel`; on the rail the item reads „Berichte Wird geladen“); `disabled` with a `disabledReason` (stays focusable, the reason is its tooltip); `tooltip`; groups that load on demand (`hasChildren`, `childrenLoading`, `expandRequested`, `childrenLoadingLabel`); a right-aligned `hint` (hidden on the rail). Backlog 064-n2: `matchRoutes`, `iconUrl`, `muted`, `badge.ariaLabel` (e.g. „56 von 60 geladen“) and `badge.tooltip`, `itemContextMenu`, `brandSubtitle`, `brandLetter`.
- **`lc-list`** (usm-x row 20): `busy` rows (spinner, `aria-busy`, no `itemClick`/`linkClick`, the action shows `loading`), `tooltip` and `badgeTooltip`, `disabledReason`, heading items (`heading`, `headingLevel`), `indent` 0–4 (sm 28 / md 32 / lg 36 px a step, `--lc-list-indent-step`), `multiColumn` (`--lc-list-column-width` 18rem, `--lc-list-column-gap`; at 1280 px four columns, a heading stays with its first row). `ItemRowState` (`@lifecorner/angular-ui-kit/models`) is the shared row model.
- **`lc-page-header`** (usm-x rows 16, 25): `[slot='title-aside']` beside the heading but outside it (chips and `role="status"` are no longer part of the heading's name); `--lc-page-header-overline-color`, `--lc-page-header-title-font-size` (24 px default), `--lc-page-header-title-aside-below` (`1`: the aside wraps under the title before the actions).
- **`lc-card`** (usm-x rows 17, 24): `clickTarget="heading"` (the button sits in the heading, which stays in the page outline; one tab stop), `truncateTitle` (one line, full title in `title`), `headerSize="sm"` (8/12 px; collapsible head 32 px, hit area 44 px), `--lc-card-divider-color`.
- **`lc-search-input`** (usm-x row 21): `inputRole="combobox"`, `ariaExpanded`, `ariaControls`, `ariaActiveDescendant`, `ariaAutocomplete`, `ariaHasPopup` on the inner input.
- **`lc-modal` `placement="top"`** (usm-x row 22): anchored at `--lc-modal-top-offset` (10dvh: 90 px on a 900 px screen), grows downward, the body scrolls 16 px above the edge.
- **`lc-button`**: `shape="row"` (usm-x row 27; full width, start-aligned, no fill or pill ring, radius 10 px, inset ring; `--lc-button-row-padding`, `--lc-button-row-min-height` 44 px), `accessKey` and `ariaKeyShortcuts` (row 29), `--lc-button-outline-bg` (row 26).
- **`lc-badge` `icon`** and **`--lc-badge-gap`** (usm-x row 28): icon 1em, 0.4em from the label (md 14 / 5.6 px); with `wrap`, the icon stays on the first line and the label's lines start 5.6 px after it.
- **Tokens** `--color-primary-wash` and `--color-brand-tile-subtle` (usm-x rows 17, 26); `--gradient-brand-tile` and `--shadow-brand-glow` now derive from `--color-primary-*`, so a customer theme recolours tiles and the outline ground. Same colours as before in both themes; text on the wash 17.12:1 light, 15.71:1 dark.

### Changed

- **`lc-header`** (usm-x row 4): `--lc-header-*` set on any ancestor (`:root`, the app shell) now win over the defaults; the bar paints `background` (a gradient works). Its sticky layer is `--lc-header-z` (900, was 1000): an open `lc-modal` now covers it.
- **`lc-modal`**: Escape is marked handled (`defaultPrevented`), also with `closeOnEscape` false; Enter and Space on the × no longer reach page listeners.
- **`lc-stat-trend`** without a label and an icon renders no empty header (and its 4 px gap).
- **`lc-card`**: a titled card with neither body nor footer draws no rule and no space under its head.
- **`lc-tabs`**: a horizontal tab list that does not fit scrolls on its own instead of widening the page (WCAG 1.4.10; at 360 px the badge tabs were 557 px wide in 328 px), keeps the selected tab in view, and draws the focus ring inside the tab.

### Fixed

- **`lc-tabs` in forced colours** (Windows high contrast): only the selected tab draws its 2 px line (CanvasText), in both modes and orientations. Before, every tab's transparent line was forced to the text colour, so all tabs looked selected and the selection showed only as a heavier weight.
- **`lc-tabs` vertical**: the selected tab now draws its 2 px line on the right (`--color-primary-500`: 4.37:1 light, 9.95:1 dark against the surface), as horizontal tabs draw their underline. Before, a later rule made every vertical tab's line transparent, so the selection showed only as an ink 1.21:1 apart from the other tabs and a heavier weight.

### Compatibility

- No API breaks: every input, field, slot, hook and output is optional and renders as before when unset. `ModalPlacement` and `NavigationItem` only widen; `route` stays required (pass `''` for an action item). Visible differences only where described above (header layering under a modal, body-less titled cards, label-less stat-trends, horizontal tabs that overflow, the selected vertical tab's line).
```
