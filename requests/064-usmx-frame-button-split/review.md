# Review 064: USM X frame and controls (16 rows), split button

## Round 1 — 2026-11-17, commit 5e08801 (gate tree = f7577f6)

Storybook rebuilt (`--skip-nx-cache`: regenerated token files had a newer mtime; tabs and card source changed after the developer's compare runs). Shots in `tmp/story-shots/064/`: `r1-ca`, `r1-cb` (888-shot compare against `baseline`), `r1-flake` (re-run of the differing sidenav and app-shell shots), `r1-{sidenav,list,c1,c2}` (33 new stories plus *With Badges*, 360/1280 × L/D, `--axe`, measures `r1-*-measure.js`), `r1-tabsgeo`, `r1-locate`, `r1-extra`, `r1-forced`, `r1-forced2`, `r1-modal640`. 12 shots opened. axe: 0 violations in all 152 new-story shots.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | header z 900; hooks on the wrapper → `linear-gradient(90deg, rgb(13,53,61), rgb(26,106,121))`, title #fff, plain header unchanged; `elementFromPoint` = `lc-modal-backdrop` (360/1280 L/D); 184 header and app-shell shots identical (wide-page 360 D flaked once, identical on re-run) |
| AC-2 | pass | `a[role=tab]`, `aria-selected` and `tabindex=0` only on `current`, `aria-controls` = panel, panel `aria-labelledby` = current id; DE 360: list 672 in 328, `scrollLeft` 246, current in view, page 360; selected ink 9.13 L / 9.95 D. Forced colours: finding 4 |
| AC-3 | pass | action items are `BUTTON`, current one `aria-current="page"`, others none; links unchanged |
| AC-4 | **fail** | drawer: name „Berichte erzeugen Wird geladen“, `aria-busy`/`aria-disabled` true, spinner, rect 264 × 44 as idle, focusable, arc 7.23 L / 12.53 D. Rail: finding 1 |
| AC-5 | pass | open lazy group `aria-expanded=true`, children container `aria-busy=true`, loading row 44 high at the label x, text 5.58 L / 7.53 D; closed group `false` + chevron |
| AC-6 | pass | DE 360: disabled + reason tabbable, focus → tooltip „Kein Recht für diesen Bereich“ via `aria-describedby` (flips above the item at 360, right at 1280); ring 2 px, 4.18 L / 10.25 D |
| AC-7 | pass | 360 drawer: hint → badge 12.0, badge/chevron → item end 10; „Rich Client“ 60.8 whole, „Editor im Rich Client“ and „kein Recht“ ellipsis + `title`; labels never truncated; rail `display: none`; rest 5.58 L / 7.53 D, current 7.85 / 9.37 |
| AC-8, AC-10 | pass | overline = hook (#144f5b, 9.13); title 24 px default, 20 / 32 px with the hook |
| AC-9 | pass | `h1` name „Rechnungsübersicht“ (aside chips outside); `title-suffix` still inside („… Entwurf“) |
| AC-11 | pass | 1280 one line, aside x = h1 end + 16; 768 (build.md) aside under the title, actions on line 1; 360 natural wrap |
| AC-12 | pass | default tile `linear-gradient(135deg, rgb(132,199,212), rgb(26,106,121))` L and D, subtle `rgba(32,132,151,.14)`, ink #208497 L / #84c7d4 D; `.story-accent` tiles violet |
| AC-13 | pass | head, `[card-header]` and footer rules = hook rgb(163,213,223); body-less titled card: border 0, mb 0, pb 0; *Primary Badge States* ×4 differ as intended |
| AC-14 | pass | sm head 32.4 open / 32 closed, hit area 44.4 (6 above, 7 below, inside the 12 px margin) |
| AC-15 | pass | busy rows `aria-busy`/`aria-disabled`, names end „Wird geladen“, arc 6.21; tooltip on the focus target; `h3` in `role=listitem` 14/600, 7.56; indent 28/32/36 per step, child icon x = parent label x; columns 1280 x 16/334/652/970, each heading x = next row x; 360 one column |
| AC-16 | pass | `role=combobox`, `aria-expanded`, `-controls`, `-activedescendant`, `-autocomplete` on the `<input>`; host has no role |
| AC-17 | pass | unit `modal.keys-top` (10) |
| AC-18 | pass | top 90 before and after „Add results“ (h 296 → 496) at 900 high, 64 at 640 high (bottom 560 ≤ 624); x 18 / w 324 at 360, x 340 / w 600 at 1280 |
| AC-19 | pass | header-less tile has only `__row`, 31.4 high; labelled tile keeps its header |
| AC-20 | pass | `h3 > button`, one line 23.4, `title` = full DE title, ellipsis; card role `article`, no tabindex; FC ring 2 px Highlight |
| AC-21 | pass | no literal in `button.component.scss`; ground (248,252,252) L / (17,29,38) D, text 17.12 / 15.71, tone 8.81 / 12.58; accent violet |
| AC-22 | pass | radius 10, padding 8/12, min-h 44, start-aligned, ring 2 px at −2 px 4.37 L / 9.95 D, not clipped; FC Highlight |
| AC-23 | pass | icon 12 / 14 / 14 / 16 px, gap 4.8 / 5.6 / 6.4 px, decorative. `wrap`: finding 3 |
| AC-24 | pass | `accesskey="s"`, `aria-keyshortcuts="Alt+Shift+S"` on the inner button |
| AC-25 | **fail** | caret 36 / 44 / 48 wide, height = face (35.5 / 42 / 48.5; DE wrapped face 82); outline divider 1 px, filled gap 1 px; menu end = caret end (±1), +8 px, first item focused; loading caret `aria-disabled`; no items → disabled. Stretch: finding 2 |
| AC-26 | pass | stub, `index.ts`, `src/index.ts`, both READMEs; manifest per build.md |
| AC-27 | pass | 851 / 888 identical; 37 differ as explained below |
| AC-28 | pass | every §2 input has JSDoc `@default` and an argType with description and default (nit 9) |
| AC-29, AC-30 | pass (22) | build.md: compat Angular 22 PASS, 125 HTML checks; Angular 21 left to the release gates |
| AC-31 | pass | changelog draft per row; `colors.mdx` / `getting-started.mdx` name the header, page-header, tile, badge-gap and outline hooks |
| AC-32 | pass | `matchRoutes` current („Klassen“), `img alt=""` 20 px, muted 400 at 5.58 L / 7.53 D, badge name „Incidents 56 of 60 loaded“, brand „USM X Customizing“ + tile „X“, subtitle 7.53 |

**Baseline diffs (37):** card *Primary Badge States* ×4 (AC-13); tabs ×16 and page-header *Full Example* ×3 / *With Body Content* ×2: tab rects unchanged (39 high, same x and widths, `r1-tabsgeo`), *Default* shows the inset ring of its focused tab, *With Badges* 360 now scrolls (557 in 328, page 360), the rest is the new scroll layer; sidenav ×11: the set moves between runs (5 runs) except known flakes and *Text Brand Drawer German* 1280 D, whose 21 px are the anti-aliased corners of the brand tile (r 10) and the current item (r 12), byte-equal in all runs, fills and rects unchanged (`r1-locate`): accepted as raster. App-shell *Wide Page* 360 D: flake.

**Deviations 1–6 (build.md): all agreed.** 1: visual order unchanged, aside holds no focusable content. 2: labels measured whole at 360. 3: footer rule reads the hook (measured). 4: same event flags, unit-tested. 5: 44.4 measured, no overlap with the body. 6: current tab in view after the font load, `scrollLeft` only. Recorded in design.md (change note 20:57).

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix | sidenav rail, *Collapsed Rail States* 360/1280 L/D (AC-4, WCAG 4.1.2, 2.5.3) | busy rail item named „Berichte Wird geladen“ (label then `busyLabel`, design §6), for links, actions and groups; plus a unit test for the rail name | name „Wird geladen“: the label is `display: none` on the rail and `title` no longer names the item once the hidden busy text exists; the visible label tooltip says „Berichte“ |
| 2 | must-fix | split button, *Default* 360/1280 (AC-25, design §3) | in a stretching flex parent the group keeps its intrinsic height like `lc-button`: face 42, caret 44 × 42 (md); keep the story's `min-height: 200px` row as the regression surface | face 98.5 × 200 and caret 44 × 200: the host and the group stretch to the row's height |
| 3 | should-fix | badge, *With Icon* 360 (`wrap`, design §4) | with an icon, the wrapped label is start-aligned: line 1 starts 0.4em (5.6 px) after the icon | label centred: icon right 41, text line 1 at 75.7 (≈ 35 px gap) |
| 4 | should-fix | tabs, both modes, `--forced-colors` (design §5; also before 3.44) | only the selected tab shows the 2 px underline (selected `Highlight` or `CanvasText`, others `Canvas`); vertical tabs likewise | every tab has `2px solid` LinkText / ButtonText (the `transparent` border is forced); selected differs by weight 500 → 600 only |
| 5 | should-fix | story *Counts And Context Menu* 360 L/D | page `scrollWidth` 360 (the status line wraps under the nav, e.g. `flex-wrap: wrap` or `min-width: 0` on the `p`) | 382: `p[role=status]` at x 277, w 104.8 |
| 6 | nit | list *Headings In Columns* 1280 | backlog: keep a group whole or repeat its heading | „Leistungsverrechnung“ and „Navigation“ continue at the top of columns 2 and 3 without their heading (AC met) |
| 7 | nit | list *Headings In Columns* 1280 (build.md open item) | backlog: no divider under the last row of a column, no corner clip in `--columns` | rows at the foot of columns 1–3 draw a divider; column 1's starts 9 px in (rounded `overflow: hidden`) |
| 8 | nit | tabs *With Badges* 360 | backlog: an overflow cue (edge fade or scroll buttons) | „Errors“ ends 4 px before the list edge; the tabs behind it give no hint on touch |
| 9 | nit | sidenav stories `items` argType (`sidenav.stories.ts:76`); rail badge | backlog: list the 3.44 fields; long rail badge values | description lists only pre-3.44 fields; „56/60“ (36 px) covers the rail icon |

**Verdict:** changes requested (findings 1–2; fix 3–5 in the same round).

## Round 2 — 2026-11-17, commit 52a7d02 (gate tree = fe790c4)

Developer's Storybook build (newer than the source). Since r1 only `tabs.scss`, `split-button.scss`, `badge.scss` and `sidenav.{ts,html,stories}` changed (`find -newer` r1 shots). Shots in `tmp/story-shots/064/`: `r2r-sidenav` (6 new sidenav stories vs `r1-sidenav`, same measure, `--axe`), `r2r-c1` (split ×5, badge *With Icon*, tabs *Router Links* (+ German), *Vertical* vs `r1-c1`, `--axe`), `r2r-cb` + `r2r-flake` (37 sidenav/placeholder/tabs and 13 badge baseline stories vs `r1-cb`/`r1-ca`), `r2r-forced` (5 tabs stories, `--forced-colors`), `r2-proto` (finding 10). Measures `r2-sidenav-measure.js`, `r2-c-measure.js`. 6 shots opened. axe: 0 violations in 60 shots.

| AC / finding | Result | Evidence |
|---|---|---|
| AC-4 / 1 | pass | rail (360/1280 L/D): busy link name „Berichte Wird geladen“, label `display: none`, tooltip and `title` „Berichte“; unit covers link, action, group and badge item; shots identical to r1 (hidden text only) |
| AC-25 / 2 | pass | *Default*: row 200, host 142.5 × 200, group 142.5 × 42, face 98.5 × 42, caret 44 × 42; *German* wrapped face 82 = caret 82; other 4 stories identical to r1 |
| AC-23 / 3 | pass | *With Icon* `wrap`: icon right 41, lines 1 and 2 at 46.6 (gap 5.6), `text-align: start`, text 5.52 L / 6.18 D; badge without icon stays centred (52 badge baseline shots identical) |
| AC-2 / 4 | pass | forced colours, *Default*, *Vertical*, *Router Links* (+ German), *With Badges*, L/D: selected 2 px CanvasText (black L / white D), the others Canvas (= page); vertical on the right border; normal-mode tabs shots identical to r1 (24 + 8) |
| AC-32 / 5 | pass | *Counts And Context Menu* 360: overflow 0, status y 278, w 326 (7.56 L / 12.17 D) under the nav; 1280 identical to r1 |
| AC-27 | pass | sidenav baseline: 7 → 4 differing shots on re-run, set moves (collapsed-rail-badges, collapsed-vs-expanded, sidebar-first*, themed-rail-badges: known flakes, no busy items); *Area Rail (German)* 360 D differed once, re-run identical to r1 |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 10 | must-fix | tabs *Vertical* 360/1280 L/D, normal colours (build.md r2 open item; on `main` too) | the selected vertical tab draws its right line `2px solid var(--color-primary-500)`: rgb(32,132,151) L (4.37:1 on the surface) / rgb(132,199,212) D (9.95:1); the others stay `transparent`; horizontal and forced colours unchanged; a pin for the rule order; changelog *Fixed* line. Prototype `r2-proto` (injected rule): exactly these values | `border-right: 2px solid transparent` on every tab: `.lc-tabs--vertical .lc-tabs__tab` comes after the selected rule at the same weight. Selection shows only as ink 1.21:1 against the other tabs (L and D) plus weight 500 → 600, while forced colours (finding 4) now draw the line |
| 11 | nit | tabs *Vertical* 360 | backlog: below a container width, stack the list above the panel (or go horizontal) | list `min-width: 200px` leaves the panel 112 px, inputs 46 px wide („Jo“ clipped); pre-existing |
| 12 | nit | sidenav rail, busy and badge items | backlog: drop `title` once the hidden text names the item, or keep it out of the description | description „Berichte“ repeats the name („Berichte Wird geladen“), so it is read twice |

**Decision on the vertical line:** fix now (finding 10). It is one rule in a file this release changes, this round's forced-colour rule already draws the line, and queueing it would cost a separate pipeline pass. Recorded in design.md (change note 21:18). Round 3 needs only `navigation-tabs--vertical` ×4 to differ (by the line) and every other tabs shot identical to `r2r-c1`/`r2r-cb`/`r2r-forced`.

**Verdict:** changes requested (finding 10). Findings 6–9, 11, 12 stay open as nits for the backlog.
