# Build 039: Progress-bar dark fill, focus halos, dependency-viewer borders, description-list row semantics

- **Branch:** `feat/3.25-progress-focus-borders-dl-semantics`
- **Commit:** see `git log -1` on the branch, `feat(description-list): clickable rows keep their dt/dd pairs; fix: progress-bar dark fill, solid focus rings, dependency-viewer borders (F-14 to F-17)`

## Files changed

Paths under `libs/angular-ui-kit/src/lib/` unless named.

| File | Change |
|---|---|
| `progress-bar/*.{scss,stories.ts}` | D-1 `'primary': var(--color-primary-500)` (was raw `colors.$color-primary-500`), comment; unused `@use …/colors` dropped; *Colors* docs |
| `notification-center/*.scss`, `tree-view/*.scss` | `@use mixins`; NC title, action (D-4), dismiss and tree tool button `mix.focus-ring` (title/action radius sm on focus); tree item `mix.focus-ring($offset: -2px)` in primary-500 (was inset primary-400); forced-colours blocks |
| `log-viewer/*.{scss,stories.ts}` | tool button (D-4) ring 2/2 + `opacity: 1` on focus; clickable line outline −2 (was 60 % inset); jump pill ring 2/2; forced block; *Text Hierarchy* gets the 13 §7 German labels + docs |
| `code-block`, `slider`, `select`, `verification-code-input` `*.scss` | copy `mix.focus-ring($offset: -2px)`, ink kept, forced block at the file end; thumb ring solid primary-500, forced: input outline Highlight offset 8; option outline 2/−2 (was 40 % inset); digit outline 2/0, error `outline-color: error-600`, forced names both |
| `password-input`, `textarea`, `number-input`, `combobox` `*.scss` | error focus: outline 2 px in the error border token, offset 0, `box-shadow: none`; forced block each |
| `dependency-viewer/*.{ts,html,scss,stories.ts}` | D-5 `STATUS_COLORS` default/muted `--color-field-border`, active `--color-primary-600`; both toggle strokes field border; D-4 toolbar `mix.focus-ring` + forced; new *Node statuses (F-16)* |
| `description-list/*.{html,ts,scss,stories.ts}` | D-6: row without `role`/`tabindex`; `dt`/`dd` `[attr.id]` when clickable; last in the `dd` `button.lc-dl__action` (`type=button`, `aria-labelledby`), counter `lc-dl-<n>`; JSDoc §2; CSS §3 + forced on the button; two eslint-disable lines with reasons (house pattern); docs, argType, *Clickable rows* text |
| `description-list/*.{semantics,axe}.spec.ts` (new) | AC-7/AC-8 DOM, ids, tab stop, one emission, default-markup pin; axe 4.14 `definition-list`, `dlitem`, `button-name` pass, names |
| dl specs, `styles/theme-contrast.spec.ts` | edited assertions in Deviations; new 039 block (17 rings, forced colours, AC-5 guard, §5 ratios) |
| `tools/compat/template/…/home.html`, `tools/compat/check-angular-majors.mjs` | clickable dl `#compat-dl-325`; `EXPECT_IN_HTML` check of the ids, the button, no `role`/`tabindex` |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | theme-contrast 039: bar + circle `var(--color-primary-500)`, no `#208497`; track ratio 3.96 / 6.69 (was 2.89 dark); shots: progress-bar dark 16 differ, light identical |
| AC-2 | theme-contrast 039 `rings` (17 rows: outline, offset, no halo); measure `tmp/039/focus.log` (§Gates) |
| AC-3 | theme-contrast 039 forced rows (17 + error digit + slider); `--forced-colors` measure `tmp/039/focus-fc.log` |
| AC-4 | measure: `fv true` after `focus()` on every row, `afterBlur none`; dl button takes no pointer events (hit test lands on `dt`/`dd`) |
| AC-5 | design §9 inventory, all fix rows done; guard test "AC-5: no focus style is a translucent halo alone" (all non-partial `lib/**/*.scss`, proven to fail on a re-added NC halo) |
| AC-6 | theme-contrast 039: field border 4.83 / 6.70 (own fill 4.39 / 5.69), active 5.77 / 10.80; `STATUS_COLORS` + toggle strokes pinned; shots dep 96 differ |
| AC-7 | semantics spec (no role/tabindex on row, dt, dd; ids; `aria-labelledby`; one tab stop; one emission); axe spec 0 violations, names "Bank Sparkasse KölnBonn" …; proven to fail with the old `role="button"` row (`definition-list`, `dlitem`) |
| AC-8 | full suite; edited assertions only those of §9 AC-8 (Deviations); 44 px rows and 4.17 / 7.57 ring unchanged (036 block green) |
| AC-9 | measure overflow on DE stories (§Gates) |
| AC-10 | compat 22 new check ok; `--compare` 114 differ / 282 identical (§Gates) |
| AC-11 | theme-contrast 039 "the rings add no transition"; no input added |
| AC-12 | changelog draft below (release-manager writes CHANGELOG.md) |

## Gates

All gates ran on commit `7daee89b0d569151db59781052e9847c2e21827c` (later agents skip a gate while `git diff --quiet 7daee89 -- libs tools` holds; the amend only adds this file and the test counts to the message).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 219 suites (+2), 5173 passed (+58), 8 skipped (`--runInBand`, 62 s) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline 162) |
| `npx nx run angular-ui-kit:build` | green, 122 "Built" lines |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | green, 994 stories (+1 *Node statuses (F-16)*) |
| Story screenshots | `--full --compare=tmp/story-shots/039/baseline`, the designer's 99 stories × 360/1280 × L/D → `tmp/story-shots/039/build-{a,b,c}`: A 18 differ (progress-bar dark 16, button *loading-keeps-focus* dark 2) / 118 identical; B 96 differ (every dependency-viewer shot) / 0; C 24 differ / 140 identical, all 24 log-viewer shots with `Date.now()` timestamps: pixel diff (`tmp/039/logdiff.log`) only in two ~15 px digit runs (x 52–90, 86–124 or 93–132), every other pixel equal. **= 114 differ / 282 identical as design §9.** New story `tmp/story-shots/039/new/` (4). Focus measure `tmp/039/focus.log` + `focus2.log` (17 stories, 360/1024 L/D), forced colours `tmp/039/focus-fc.log` (13 stories, 360 L/D), held focus `tmp/story-shots/039/hold/`. Opened 3: node-statuses 360 L and 1280 D, slider held focus 360 L |
| `node tools/compat/check-angular-majors.mjs --only=22` | install, build+prerender ok; 93 HTML checks ok (was 92), incl. "clickable description list: dt/dd pair and a named row button" (Node 24.21, Angular 22.2.4) |

Measured (AC-2…AC-4, AC-9): every §3 row `:focus-visible` true after `focus()`, `none` after blur, no box-shadow; outline 2 px `rgb(32, 132, 151)` L / `rgb(132, 199, 212)` D, offset 2 (NC title 75×21 room 10, dismiss 24×24 room 10, action 53×17, jump 138×30 / DE 158×30 room 16, log tool 28×28 room 6, tree tool 96×26 room 6, dep toolbar 28×28 room 8, dl button 278×44 = row padding box, row 278×45) or −2 (code copy 77×44, tree item, select option 182×37 on `surface-hover`); error fields 2 px `rgb(157, 14, 14)` L / `rgb(247, 161, 161)` D, offset 0. Forced colours: all `rgba(5, 0, 73, 0.8)` L / `rgba(0, 230, 255, 0.8)` D, slider input offset 8. dl hit tests at the row centre and term land on the row / `dt` / `dd` (never the button), labelledby name "Bank Sparkasse KölnBonn". Overflow 0 on page, log toolbars and NC rows, DE included.

## Deviations from the design

None in the rendering. Notes for the review:

| Item | What | Why |
|---|---|---|
| §5 log tints, light | pinned 3.49, design 3.23 | the design composited the hover over the warn/error tints; both are `background-color` on the line and the tint rule (0,2,0, later) wins, so a tinted line never shows the hover. Real lowest = error tint. Dark 7.47 and terminal 3.28 / 7.58 as designed |
| code-block copy forced colours | a top-level `@media` block at the file end, not nested in `&__copy` | `code-block.region.spec` reads only the first forced-colours block (the body's); same compiled rule, no assertion edited |
| dl default markup | one more `<!--container-->` anchor per `dd` (from `@if (clickable())`) | no element, attribute, text or layout change; pinned with comments stripped and proven equal to 3.24.1 over 24 layout × size × leaders × separator cases (temporary old-template spec) |
| dl template | two `eslint-disable-next-line` lines with reasons | the row keeps handlers without a tab stop, the button has no text (named by `aria-labelledby`): the house pattern of 18 templates |
| progress-bar | unused `@use '../../styles/tokens/colors'` removed | the module only holds variables; compiled CSS otherwise equal |
| Edited assertions (§9 AC-8 list, all F-14/F-17) | dl spec l. 103–104 (+ button exists); clickable spec l. 51–52, 88–89 (+ one button); theme-contrast l. 749 (+ title), 1328, 1349–1354, 1419 | the row lost `role`/`tabindex` and the ring moved to the button; primary is no longer a raw hex |
| Log clickable line | not in any story (`clickableLines` is a control only) | covered by the spec (outline −2, Highlight); review via Controls |
| Slider thumb | `getComputedStyle(…, '::-webkit-slider-thumb')` returns the input's style | ring proven by the spec and the held-focus shot |

Follow-ups from the design stay open: F-18 (kit-wide buttons with no own focus style, e.g. tag-input remove ×), F-19 (textarea outline hover beats focus).

## Changelog draft

```markdown
## [3.25.0] - 2026-11-03

Clickable `lc-description-list` rows keep their term and value pairs for assistive tech, and the open follow-ups of 3.23.1 close: the dark `lc-progress-bar` primary fill, solid focus rings instead of 20–40 % halos, and 3:1 borders in `lc-dependency-viewer` (036 F-14 to F-17). No API breaks.

### Changed

- **`lc-description-list` `clickable` rows** (F-17): a row is no longer a `role="button"` div with `tabindex="0"`, which turned its `dt` and `dd` into presentational children (axe `definition-list` and `dlitem` failed). It keeps `dl > div > dt + dd`, and the last child of each `dd` is a native `<button type="button" class="lc-dl__action">`, named by the term and the value (`aria-labelledby`, e.g. „Bank Sparkasse KölnBonn“). Tab reaches one button per row; Enter and Space emit `itemClick` once; a click anywhere on the row emits as before (the button covers the row and takes no pointer events, so text stays selectable). Look, 44 px rows and the 2 px ring (4.17:1 light, 7.57:1 dark, `Highlight` in forced colours) are unchanged; the markup is in the prerendered HTML.

### Fixed

- **`lc-progress-bar` primary in dark** (F-14): the fill reads `--color-primary-500`, as `lc-progress-ring` does: 6.69:1 against the surface-2 track (was 2.89:1); light keeps #208497 (3.96:1). Linear and circular.
- **Focus rings instead of halos** (F-15): a 2 px `--color-primary-500` outline (4.17:1 light, 7.57:1 dark on the page; ≥ 3.28 / 5.77 on hovered, unread, tinted and terminal rows) replaces the 20–40 % halos (1.28–1.66:1) on the `lc-notification-center` title and dismiss buttons, the `lc-log-viewer` jump-to-bottom pill and clickable lines (inset), the `lc-code-block` copy button (inset), `lc-tree-view` tool buttons and items (inset; primary-400 was 1.62:1), the `lc-slider` thumb (a solid ring), the `lc-select` highlighted option (inset, 3.96 / 6.69 on its fill) and `lc-verification-code-input` digits. Error fields (`lc-password-input`, `lc-textarea`, `lc-number-input`, `lc-combobox`, digits) draw a 2 px outline in the error colour (8.02:1 / 7.21:1) instead of a 20 % error halo. Every ring is `Highlight` in forced colours; the slider outlines its input there.
- **Buttons without a focus style**: the notification action, the log-viewer tool buttons (now at full opacity while focused; 0.7 gave 2.66:1) and the dependency-viewer toolbar buttons lost their focus to the global `button:focus { outline: none }`; they get the same ring.
- **`lc-dependency-viewer` borders** (F-16): default and muted nodes and the collapse toggle use `--color-field-border`, 4.83:1 light and 6.70:1 dark on the surface (neutral-300 was 1.47 / 2.28, neutral-200 1.23); active nodes `--color-primary-600`, 5.77 / 10.80 (primary-400 was 1.89 / 3.95). Muted nodes stay apart by their fill and tertiary label; typed nodes keep your colours.
- Stories: Dependency Viewer *Node statuses (F-16)*; Log Viewer *Text Hierarchy* sets every built-in string in German.

### Compatibility

- No input, output, CSS hook, token or default changed; the shared status colours stay. The clickable-row DOM changed: a test that finds a clickable row by `role="button"` or focuses it should use `.lc-dl__row` or `button.lc-dl__action`; a `keydown` dispatched on the row still emits. Non-clickable lists render as before. With an `href` inside a clickable row (discouraged), Tab now reaches the link, then the row button (was row, then link).
- Fields whose border turns `--color-primary-500` on focus (≥ 4.17:1) keep their halo next to that border. 114 of 396 story shots differ (progress-bar dark 16, the button story with a bar 2, dependency viewer 96); the other 282 are identical apart from log-viewer clock digits.
```
