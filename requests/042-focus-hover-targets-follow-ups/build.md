# Build 042: Focus indicators, focus over hover, dependency-viewer at 360 px, file-upload remove target

- **Branch:** `feat/3.27-focus-hover-targets`
- **Commit:** `feat(dependency-viewer): regionLabel, sideways scroll at phone width; fix: focus rings, focus over hover, 44 px remove target (042)` (one commit, amended)

## Files changed

| File | Change |
|---|---|
| `src/styles/_reset.scss` | D-1: `button:focus:not(:focus-visible) { outline: none }` |
| rich-text-editor, document-viewer, filter-bar, select, gallery, log-viewer, callout, notification-center, tabs, chat, description-list, color-picker, table, number-input, tag-input SCSS | D-2 kit ring at the §3 offsets + Highlight; callout ×, tag × `opacity: 1` on focus; D-9 RTE frame ring via `:has()` + own Highlight rule |
| toggle-group, gantt-chart, split-pane, scatter-plot SCSS | D-3: forced-colours outline / `stroke: Highlight` only |
| kanban-board SCSS | inset ring (−2 px, design change r1) instead of the 20 % halo, border change kept, Highlight |
| header SCSS | D-4: 4 own rings read `var(--_lc-header-ring, var(--color-primary-500))`; `.lc-header--light` sets `#208497` |
| textarea, datepicker, input, select, search-input, tag-input, date-range-picker SCSS | D-6: hover rules exclude `:focus` / `:focus-within` / `--focused` |
| dependency-viewer `.ts/.html/.scss` | D-7: `regionLabel`; scroll state (class, `tabindex`/`role`/`aria-label`, `--_lc-dep-scroll-width`, pin to start, `scrollLeft` 0 per fit, drag → `scrollLeft`, sideways wheel scrolls, scrollbar height added); box-less `div.dep-viewer__stage` around the svg (Deviation 1); JSDoc `fitMode`/`minNodeSize`; inset ring + Highlight; lint directive trimmed |
| file-upload `.ts/.html/.scss` | D-8: 44 × 44 `::before`, ring + Highlight, `aria-label` = `removeFileAriaLabel + ' ' + name`, JSDoc `@default` |
| 17 `*.stories.ts` | §8: 16 *Keyboard Focus*, *Remove Targets*, *Phone Width*, *Phone Width (German)* (19 new); D-5 edits (button, tooltip, toolbar); dep argType `regionLabel`, *Fit Width*/*Minimum Node Size* texts |
| `src/docs/internationalization.mdx` | `regionLabel`; remove name + file name |
| specs | new `styles/focus-indicators.spec.ts` (105), `dependency-viewer.phone-width.spec.ts` (15), `file-upload.remove-target.spec.ts` (6); `description-list.wrap.spec.ts` (Deviation 5) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | §6.1 B–F fixed; guard `focus-indicators.spec.ts` (24 rings, 5 D-3, D-9, D-4); designer's `sweep-measure.js` re-run unchanged (`tmp/042/sweep-{1280-light,1280-dark,360-light}.log`, diff `tmp/042/sweep-compare.txt`): no kit element left without its own ring; the remaining `auto`/`NONE` rows are row G story-owned controls (icon gallery, markdown, popover/menu triggers, page-layout, stack, toolbar, money, horizon, next-step inputs), hidden checkbox/radio inputs, the slider (thumb ring, 039), cdk focus-trap anchors, and already-focused elements |
| AC-2 | `tmp/042/ring.log` (360 L/D, built stories, no injected CSS): every §5 value exact — R 4.17 / 4.36 L, 7.57 / 9.12 / 9.95 D; filter inset 3.96 / 4.17, 9.04 / 7.57; callout error 3.23 / 9.54, info 3.47 / 8.80; tag × 3.43 / 6.34; chat image 3.70 / 6.13; header `light` on dark 4.36 (was 1.89); D-3 normal look unchanged; r1: kanban inset 4.36 L / 9.12 D in any column (Round 1) |
| AC-3 | `tmp/042/ring-fc.log` (`--forced-colors`): all 38 indicators Highlight (outline rgba(5,0,73,.8) L / rgba(0,230,255,.8) D; scatter `stroke`); spec `forcedFills` |
| AC-4 | measure: `:focus-visible` true for every target; spec: no outline on a bare `:focus` rule for the 24 classes; reset narrowed |
| AC-5 | reset narrowed (spec); sweep diff: the removed/added rows (42/52 at 1280 L, 47/57 D, 42/53 at 360 L; +10 rows from the new stories) are only §6.1 B–F elements, the D-5 story buttons (dark 1.72 / 1.79 / 1.89 → 9.46 / 7.57 / 8.68) and row G raw buttons now showing the browser ring; every other kit row unchanged; at-rest compare 1,090 shots: 1,068 identical, 22 explained (Gates) |
| AC-6 | designer's `hover-measure.js` unchanged (`tmp/042/hover-{light,dark}.log`, 1280): 162 field rows per theme, all `SAME` (before 73 of 176); textarea / datepicker 1.89 → 4.36 L, 4.31 → 9.95 D; error 8.39 / 9.47; the grey-hover fields → 4.36 / 9.95 |
| AC-7 | the same rows' rest and hover columns equal the before-logs in all 148 shared rows per theme (the 28 others were button rows of an earlier script version); at-rest compare of every field story identical |
| AC-8 | `tmp/042/dep-measure.log` 360: DE scale .83, label 10.0, stroke 1.25, 0 nodes outside `[0, 681]`, first node x 20 = 24 × .83, pageX 0; EN .90 / 10.76 / 1.35, scroll 687; spec 15 tests |
| AC-9 | 25 dep stories × 360/1024/1280 × L/D (150 shots) hash-identical on the final build; spec: contain / fit-width without floor unchanged |
| AC-10 | new stories L/D EN/DE: DE labels ≤ node width, 2 lines, no ellipsis; spec: before a fit the host keeps `height`, canvas no region |
| AC-11 | `tmp/042/fu.log` 360/1024/1280 L/D: `::before` 44 × 44, centre ± 21.5 hits, ± 23 misses, right edge = row inner edge, rows 42, adjacent areas 6 px apart |
| AC-12 | spec names EN/DE; measure names per file, ring `:focus-visible`, FC Highlight |
| AC-13 | API diff: only `regionLabel` (JSDoc + `@default`, argType, 2 stories) |
| AC-14 | axe 4.14, 96 shots (19 new + 3 D-5 + German Locale): 0 violations from this change; 8 pre-existing kinds (Deviation 8), r1 fixed the 2 story-level ones (Round 1) |
| AC-15 | §8 stories (ids as designed); changelog draft below |

## Gates

Round 1 gates ran on commit `bc2de056ebeca249edc33e43f3d85bc4f35c508f` (later agents skip a gate while `git diff --quiet bc2de05 -- libs tools` holds; the final amend only adds the request documents and the agent memory). Round 0 ran on `6ce0dcc`. Logs `tmp/042/r1/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 225 suites, 5341 passed, 8 skipped (= round 0; one assertion changed, below) (`--runInBand`, 109 s) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (= baseline) |
| `npx nx run angular-ui-kit:build` | 122 entries built |
| `npm run test:tools` | not run: `tools/` unchanged since round 0 (22 / 22) |
| `npx nx run angular-ui-kit:build-storybook` | 1,016 stories (`--skip-nx-cache`: the Nx cache key ignores story-only edits) |
| Story screenshots | r0: `tmp/story-shots/042/after`, `…/new`; r1: `tmp/story-shots/042/r1-fix` (7 stories × 360/1024/1280 × L/D, `--axe`, measure `tmp/042/measure/r1.mjs`, logs `tmp/042/r1/shots*.log`) |
| `check-angular-majors.mjs --only=22` | install, build+prerender ok; 94 HTML checks ok (kanban is prerendered; only its `:focus-visible` offset changed) |

**At-rest compare** (`--compare=tmp/story-shots/042/baseline`, 1 s wait): 1,068 of 1,090 identical. Different: D-5 stories button *Destructive Action*, tooltip *Toolbar*, toolbar *Inside Card* (12, intended); chat *With File Upload* (4: Date.now() timestamps, x 262–330, y 253–293); scatter *Compact* (4: `Math.random()` data); gallery *Small Thumbnails* 360 L (49 px, Δ 3, picsum decode); header *Above Sidenav* 360 D (9 px, Δ ≤ 29, corner anti-aliasing of the active item: a no-op `<style>` injected after load reproduces the baseline byte for byte, so no computed style differs).

## Deviations from the design

1. **Stage element (D-7):** Chrome counts the svg's own, unscaled box in the canvas scroll range (848 px for 681 px of graph), so a sizer alone left 167 px of blank scroll. The svg now sits in `div.dep-viewer__stage`, `display: contents` (no box) unless the canvas scrolls, then `display: block; width: <scroll width>; overflow: hidden`. "Not scrolling: today's DOM" thus gains one box-less element; all 150 dep shots stay hash-identical.
2. **Wheel (D-7):** "wheel unchanged" and "Shift + wheel scrolls" conflict (the wheel handler prevents every wheel event). In the scroll state, Shift + wheel and a mostly sideways wheel (trackpad) scroll natively; the vertical wheel zooms as before. Outside it nothing changed (spec).
3. **D-5 inks:** with the panels on tokens, the button story's text (`#991b1b`, `#7f1d1d`) and the toolbar story's body text (`#555`) were dark on dark: now `--color-on-error-subtle` and `--color-text-secondary`.
4. **List link rows (D-3):** no change needed; the forced-colours outline exists since 3.x (`list.link-rows.spec.ts`), measured Highlight.
5. **`description-list.wrap.spec.ts`:** its "every other rule compiles exactly as in 3.25.2" hash now also strips the two 042 blocks (link ring, its forced rule); length 3081 and sha1 unchanged, each block asserted once.
6. **EN *Phone Width*:** the EN labels need 223 px nodes, so 360 px shows scale .90 / labels 10.76 px (the DE story is the design's .83 / 10.0).
7. **Chat send button:** disabled while the composer is empty, so it can't take focus in the story; its ring is pinned by the spec only.
8. **axe (AC-14), pre-existing, not from this change** (same results on the unchanged counterpart stories of this build): RTE active mode `.active` contrast, gallery active filter contrast, chat monogram contrast, tag chip text contrast, select × `target-size` (F-22), log-viewer `scrollable-region-focusable`. Accepted as follow-up **F-26** (review r1). Button *Destructive Action* `svg-img-alt` and tooltip *Toolbar* `button-name`: fixed in r1.
9. **Tooltip *Toolbar* (r1, finding 2):** `variant="text"` is no `ButtonVariant`, so the new glyphs drew in the browser's `buttontext` black: 1.46:1 on the dark panel. Now `variant="ghost"` (the kit's text-only button): glyphs `--color-text-secondary`, 7.23 L / 9.25 D on the panel; ring unchanged (4.17 / 7.57). Rest look otherwise the same (transparent fill and border); hover gets the ghost fill.

## Round 1 (review 2026-11-03)

| # | Fix | Evidence (`tmp/042/r1/shots.log`, `shots-tooltip.log`) |
|---|---|---|
| 1 | kanban `:focus-visible` `outline-offset: -2px`; spec row + assertion → `-2px` (reason in the spec: review r1); *Keyboard Focus* text; changelog "inset ring" | *With WIP Overflow* (over-limit card) and *Keyboard Focus*, 360/1024/1280: fv true, 2 px, off −2, vs card **4.36 L / 9.12 D**, no shadow; shot `r1-fix/…with-wip-overflow--360-light.png` |
| 2 | trash icon `[decorative]="true"`; toolbar buttons `ariaLabel` Bold … Align right + projected `lc-icon` (`bold`, `italic`, `underline`, `align-left/-center/-right`, Tabler, served by Storybook) | axe 0 violations on both (12 shots); 6 glyphs 20 × 20 per shot |
| 3 | *Phone Width* text: 223 → 200 px, 0.90, 10.8 px, 1.35 px | text only; 360: region "Dependency graph", scroll 687 (= r0) |
| 4 | DE graph links `relationLabel: 'hängt ab von'` (`approvalProcess(labels, relationLabel?)`) | legend "hängt ab von", 0 × "depends on"; scroll 681 (= r0) |
| 5 | tag-input play: `await setTimeout` between `input` and Enter | field value "", one tag, × focused "Entfernen Kostenstellenverantwortung", ring 2 px opacity 1 |

axe on the 7 touched stories (48 shots): 6 violations, all pre-existing and accepted: kanban over-limit title `color-contrast` (F-27, 3 L) and tag chip text (F-26, 3 L).

## Changelog draft

```markdown
## [3.27.0] - 2026-11-03

Every kit control shows a focus ring on keyboard focus, a focused field keeps its focus colour under the pointer, `lc-dependency-viewer` stays readable at 360 px, and the `lc-file-upload` remove button takes 44 px taps (039/040 follow-ups F-18 to F-21). One new optional input; no API breaks.

### Added

- **`lc-dependency-viewer` `regionLabel`** (F-20): with `fitMode="fit-width"` and a `minNodeSize` the frame can't hold, the graph is pinned to the start and the canvas scrolls sideways (touch, Shift + wheel, arrow keys once focused) instead of cutting off both ends. While it scrolls it is a focusable `role="region"` named by `regionLabel` (default `'Dependency graph'`) with a 2 px inset ring. Phone recipe `fitMode="fit-width"` + `minNodeSize` 200 (+ `direction="vertical"`): at 360 px nodes draw 200 px wide, labels ≥ 10 px, borders ≥ 1.25 px (`autoFit` alone: 5.7 px and 0.7 px). From 1024 px the same graph fits at 100 %, centred. Stories *Phone Width*, *Phone Width (German)*.

### Fixed

- **Focus rings (F-18):** 21 controls had no indicator, only the browser's (2.29:1 in dark) or only their field's: rich-text editor toolbar and mode buttons and its editing surface (frame ring), document-viewer toolbar and download buttons, filter-bar toggles, select clear, gallery filters, log-viewer level pills, callout dismiss, notification-center actions and filter chips, tab panels, chat attachments and attach, send and pending-remove buttons, description-list links, colour-picker input, table selection checkboxes, number-input steppers, tag-input ×, file-upload remove. Each draws the kit ring (2 px `--color-primary-500`; 3.23–4.36:1 light, 6.13–9.95:1 dark against its surface) on keyboard focus only, `Highlight` in forced colours. Toggle-group buttons, gantt bars, the split-pane separator and scatter dots keep their look and now show `Highlight` in forced colours; kanban cards swap the 20 % halo (1.28:1) for an inset ring (4.36:1 light, 9.12:1 dark on the card, in any column). `lc-header theme="light"` on a dark page: its own rings 4.36:1 (were 1.89). Stories *Keyboard Focus* in 16 components.
- **Focus over hover (F-19):** a focused textarea or datepicker under the pointer showed the hover border `--color-primary-400` (1.89:1 light) instead of its focus ring; input, select, search-input, tag-input and date-range-picker showed the hover grey. All keep the focus colour now (4.36:1 light, 9.95:1 dark; error fields 8.39 / 9.47). Hover on an unfocused field is unchanged.
- **`lc-file-upload` remove button (F-21):** a 44 × 44 px hit area around the 20 px circle (rows stay 42 px, neighbouring areas 6 px apart), a focus ring, and a name per file: "Remove file bericht-2026.csv" (`removeFileAriaLabel` + file name). Story *Remove Targets*.

### Changed

- The global reset `button:focus { outline: none }` is now `button:focus:not(:focus-visible)`: mouse focus stays ring-free; a keyboard-focused button with no focus style of its own shows the browser ring instead of nothing.

### Compatibility

- One new optional input (`regionLabel`); no other input, output, type, CSS hook or default changed. At rest every touched component renders as in 3.26.0: 1,068 of 1,090 shots hash-identical (the rest: three story panels moved to tokens, and timestamp, random-data and anti-aliasing noise).
- Your own `<button>`s without a focus style now show the browser's ring on keyboard focus (not on click). Give them a `:focus-visible` style if it doesn't fit.
- A test matching the remove button's old name exactly ("Remove file") needs the file name appended.
- `fitMode="fit-width"` held at `minNodeSize` used to centre the graph and cut off both ends; it now scrolls sideways from the start, inside a new box-less `div.dep-viewer__stage`. `contain`, `autoFit` and a fit-width graph that fits render as before.
- Checked on Angular 22 (AOT, strictTemplates, prerender).
```
