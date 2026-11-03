# Design 039: Progress-bar dark fill, focus halos, dependency-viewer borders, description-list row semantics

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-12
- **Semver:** **minor (3.25.0)**: the spec's exception applies. F-17 changes the clickable-row DOM: the row loses `role="button"` and `tabindex`, and a native button is added. There is no input, output, default or hook change.
- **Change notes (review r1, 2026-11-03):** §5 log-tint ring light 3.23 → 3.49; §4 dependency nodes in forced colours keep their SVG colours; §4 select option ring also follows the pointer; §6 F-20. No code change follows from them.
- **Measured on:** main 31a3d7d (3.24.1), Storybook rebuilt 2026-11-03. Contrast comes from the WCAG formula on resolved tokens (`tmp/story-shots/039/grid-measure.js`), floored to 2 decimals, given as light / dark.

## 1. Approach

Extend only; every fix reuses a kit pattern.

| ID | Finding | Pattern reused |
|---|---|---|
| D-1 | F-14 | `'primary': var(--color-primary-500)` in the progress-bar map, the token `lc-progress-ring` already uses (so the bar and the ring match). Light is the same hex (#208497); dark becomes #84c7d4. No token changes. |
| D-2 | F-15 | `mix.focus-ring` (2 px `--color-primary-500` outline, offset 2, as dl 3.23.1, stepper, swatches). Where the room to a clipping ancestor is under 4 px, it is inset at offset −2 (code-block body pattern). Fields with an unchanged border follow lc-input's error pattern: a 2 px outline at offset 0 in the border colour. Each fix gets `outline-color: Highlight` in forced colours. |
| D-3 | F-15 keep rows | The border turns `--color-primary-500` (≥ 4.17 / 7.57), so the row stays as it is (spec Assumption 3). Emulated forced colours already switch the focused border from CanvasText to Highlight: textarea and digit probe rgb(0,0,0) → rgba(5,0,73,.8). Keep rows get no edit. |
| D-4 | F-15 extra | Three buttons in touched files have **no** focus indicator: the global reset `button:focus { outline: none }` (`_reset.scss:174`) wins because they have no rule of their own. They are fixed here: NC item action, log tool buttons, dependency toolbar buttons. The kit-wide sweep is F-18 (§6). |
| D-5 | F-16 | Node and toggle boundaries use `--color-field-border`, the colour the tree edges have used since 036. Active nodes use `--color-primary-600`. |
| D-6 | F-17 | dl rows keep `dl > div > dt + dd`. The last child of the `dd` is an empty native `<button>` that covers the row (`position: absolute; inset: 0`). It has `pointer-events: none`, so mouse behaviour, text selection and links stay as they are, and `aria-labelledby` names it "term value". This is the stretched-control idea of lc-card's link (037) without a z-index lift. |

## 2. Public API

No input, output, CSS hook or type changes.

| Kind | Name | Change |
|---|---|---|
| input | `clickable` (dl) | JSDoc only: "Whether rows are interactive. When set, each row holds a native button, named by its term and value, that Tab reaches; Enter, Space and a click anywhere on the row emit `itemClick`. The `dl` keeps its term and value pairs. Set this whenever you handle `itemClick`. @default false" |
| DOM | dl clickable row | `div.lc-dl__row` without `role`/`tabindex`. With `clickable`: `dt[id=lc-dl-<n>-t<i>]` and `dd[id=lc-dl-<n>-v<i>]` (`[attr.id]`, null otherwise), and as the last child of the `dd`, `<button type="button" class="lc-dl__action" aria-labelledby="lc-dl-<n>-t<i> lc-dl-<n>-v<i>">`. `<n>` comes from a module counter (`let nextUniqueId = 0`, as lc-input; pitfall 016). |
| behaviour | dl | `(click)` and `(keydown)` stay on the row. A click on the button (Enter / Space) bubbles to the row and emits once. The row keydown path still serves programmatic keydown in consumers' tests (target = row). |

Default rendering unchanged: the non-clickable markup is identical (spec test "keeps the default markup" stays). Light progress fills use the same hex. A prototype of the D-6 DOM in both clickable stories compared **8/8 identical** against the baseline (`039/proto-dl`).

## 3. Anatomy and layout

No layout changes; only rings, fills and strokes. Ring geometry, measured at 360 (room = distance to the nearest clipping ancestor; an outside ring needs 4):

| Control | Box at 360 | Room | Ring |
|---|---|---|---|
| NC title `.lc-nc__item-title` | 75×21 | 10 | 2 px, offset 2, `border-radius: var(--border-radius-sm)` (kept) |
| NC dismiss / NC action (D-4) | 24×24 / 53×17 | 10 / 70.8 | 2 px, offset 2 (action: radius sm in the focus rule) |
| Log jump-to-bottom (pill) | 138×30 | 16 | 2 px, offset 2 |
| Log tool button (D-4) | 28×28 | 6 | 2 px, offset 2, plus **`opacity: 1` on focus** (at 0.7 the ring is 2.66 L) |
| Log clickable line | full × 22 | 0 | 2 px, offset −2 (replaces the inset 60 % shadow) |
| Code-block copy | 77×44 | **0** | 2 px, offset −2 (`mix.focus-ring($offset: -2px)`; the ink change stays) |
| Tree tool button / tree item | 96×26 / 326×26 | 6 / 0 | offset 2 / offset −2 (item: `--color-primary-500`, was `-400`) |
| Slider thumb | 18 px | — | `box-shadow: 0 1px 3px rgba(0,0,0,.15), 0 0 0 3px var(--color-primary-500)` (solid, same extent as today). Forced colours: `.slider__input:focus-visible { outline: 2px solid Highlight; outline-offset: 8px }` (the thumb overhangs the 6 px track by 6) |
| Select highlighted option | full × option | inset | `outline: 2px solid var(--color-primary-500); outline-offset: -2px`, replacing the 40 % inset shadow |
| Dependency toolbar button (D-4) | 28×28 | 8 | 2 px, offset 2 |
| Digit input (focus) | 48×56 | — | `outline: 2px solid var(--color-primary-500); outline-offset: 0`, no halo; error `outline-color: var(--color-error-600)` |
| Error focus: password `.lc-input`, textarea, number-input `__control`, combobox wrapper | field | — | `outline: 2px solid <the file's error border token>; outline-offset: 0; box-shadow: none` (combobox `--color-error-default`, others `--color-error-600`) |
| dl `.lc-dl__action` | = row padding box 278×44 | 999 | `mix.focus-ring` (2/2), `border-radius: var(--border-radius-sm)`; the bottom edge sits 1 px above the old row ring (padding box, not the hairline) |

```
360 px, card lg (content 278)                 1024+ px: same box, wider column
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ ← 2 px ring, 2 px out, r sm (focus only)
│ Bank            Sparkasse KölnBonn │ 44–45 px row (unchanged)
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   button.lc-dl__action = row padding box
───────────────────────────────────── 1 px divider (unchanged)
```

Dependency viewer: the node rect keeps stroke-width 1.5 and the selected node 2.5 in `--color-primary-500`. The toggle circle (r 8, stroke 1) keeps its `--color-neutral-100` fill and gets the `--color-field-border` stroke. CSS for D-6: `.lc-dl__row--clickable { position: relative }`; `.lc-dl__action { position: absolute; inset: 0; margin: 0; padding: 0; border: 0; background: none; border-radius: var(--border-radius-sm); pointer-events: none; @include mix.focus-ring }`, plus forced colours `.lc-dl__action:focus-visible { outline-color: Highlight }`. The old `.lc-dl__row--clickable:focus-visible` rules go (the row can't be focused any more).

## 4. States

| Element | Default | Hover | Focus-visible (Tab) | Mouse click | Forced colours | Reduced motion |
|---|---|---|---|---|---|---|
| dl clickable row | unchanged | row fill `--color-surface-hover` (unchanged) | ring on the button | emits; the button never takes focus (`pointer-events: none`) | ring Highlight | no transition |
| Fix-row buttons | unchanged | unchanged | ring per §3 | no ring (`:focus-visible`) | Highlight | none added |
| Error fields | 1 px error border | unchanged | 1 + 2 px error edge (3 px) | text fields always match focus | border and outline Highlight | `transition: all` (password, textarea, digits) also eases the outline over 200 ms; the global rule makes it 0.01 ms |
| Progress primary | dark #84c7d4 | — | — | — | Highlight (unchanged) | stripes (unchanged) |
| Dependency nodes | default, muted: field-border; active: primary-600 | brightness filter (unchanged) | n/a | selected: 2.5 px primary-500 + detail panel | authored SVG colours (fill and stroke are not forced; *r1 change note*); toolbar ring Highlight | — |
| Select option (`--highlighted`) | unchanged | `mouseenter` sets the highlight, so the inset ring follows the pointer too (*r1 change note*: accepted, one highlight at a time, the option Enter picks) | ring on the active descendant | — | Highlight | — |

Muted nodes now share the default border; muted stays recognisable by `--color-text-tertiary` on the `--color-neutral-100` fill. Selected stays apart from active through the 2.5 px stroke (active vs selected colour 1.42 / 1.18, as close as today in dark). Typed nodes (`typeColors`) carry the consumer's colours and are out of scope. Overflow: no box changes size; German NC titles ellipsize as today (ring outside the title box), and "Zum Ende springen" fits the jump pill at 360 (§7).

## 5. Theming (light / dark, computed)

| Element | Token (light / dark value) | Before | After |
|---|---|---|---|
| Bar primary fill vs track (`surface-hover` over bg / surface / surface-2) | `--color-primary-500` #208497 / #84c7d4 | 3.96 / **2.89** (bg 3.91, surface 3.53) | 3.96 / **6.69** (bg 9.04, surface 8.16) |
| Ring on the page (bg, surface, surface-2) | `--color-primary-500` | halo 20 % 1.28 / 1.50; 25 % 1.36 / 1.73; 30 % 1.46 / 1.95 | 4.17 / 7.57 |
| Ring on hovered rows / select highlighted option (`surface-hover`) | same | 40 % inset 1.65 / 2.49 | 3.96 / 6.69 |
| Ring on NC unread rows (`surface-selected` over surface / -2) | same | 1.28 / 1.50 | 3.75 / 5.77 |
| Ring on the log tints (warn, error, hover) / terminal #1e1e2e incl. tints | same | 60 % line 2.17 / 4.00 | **3.49** / 7.47 · 3.28 / 7.58 (*r1 change note*: was 3.23 L, which composited the hover over a tint; the tint rule wins over `:hover`, measured in review r1) |
| Ring on the log toolbar: surface / terminal #181825 | same | none | 4.36 / 9.12 · 4.02 / 9.28 |
| Ring on the code-block header (rgba(0,0,0,.25) over #0c1722, + hover) | same | 40 % 1.66 / 2.55 | 3.78 / 8.74 |
| Tree item ring on rows (surface, hover, primary-50/-100) | was `--color-primary-400` | 1.62 / 3.01 | 3.75 / 6.96 |
| Error outline vs pages | `--color-error-600` = `--color-error-default` #9d0e0e / #f7a1a1 | halo 1.45 / 1.46 | 8.02 / 7.21 |
| Keep rows: focus border vs field and page | `--color-primary-500` | — | ≥ 4.17 / 7.57 (rest → focus border 1.10 / 1.36: hue only, 2.4.13 AAA) |
| Dep default / muted node border vs surface | `--color-field-border` #6b7280 / #93a4ad | n-300 1.47 / 2.28 · n-200 1.23 / 1.67 | 4.83 / 6.70 (vs own fill 4.39 / 5.69) |
| Dep active node border (vs surface, primary-50) | `--color-primary-600` #1a6a79 / #a3d5df | primary-400 1.89 / 3.95 | 5.77 / 10.80 |
| Dep toggle stroke vs surface (vs its n-100 fill) | `--color-field-border` | n-300 1.47 / 2.28 | 4.83 / 6.70 (4.39 / 5.69) |
| Unchanged: toolbar button and detail-panel borders `--color-border` | — | 1.18 / 1.35 on surface-2 | not a required boundary: the glyph (text-secondary) names the button, and the panel is no control |

No new tokens; the shared status colours are untouched. Edge lines, labels and legend keep their 036 values.

## 6. Accessibility

- **F-17 semantics (axe 4.14 on *Clickable rows*, 360):** before: `definition-list` 4 and `dlitem` 24 violations (the `role="button"` div makes dt/dd presentational children). With the D-6 prototype: 0 violations; `definition-list`, `dlitem`, `button-name` (12) and `nested-interactive` pass. Names: "Bank Sparkasse KölnBonn", "Freigabe Alle Erwachsenen", "Letzter Abruf heute 09:14". A hit test at the row centre lands on the `dt` (the click bubbles to the row).
- **Keyboard:** Tab reaches one button per row in DOM order. Native Enter / Space give one `itemClick`. With `href` (discouraged, story note) the order becomes link → row button (was row → link); this goes in a Compatibility line. Screen readers read the term, the value, then "button, term value".
- **Targets:** 44 px rows unchanged. NC dismiss 24, log/dep tool buttons 28: 2.5.8 by size, unchanged.
- **Forced colours:** each fix rule gets `outline-color: Highlight`; the slider gets an input outline, because the thumb shadow is dropped. No indicator relies on `box-shadow` alone (the slider thumb shadow has the forced-colours outline).
- **Reduced motion:** no transition is added (see §4).
- **Follow-ups (not here):** **F-18** a kit-wide element sweep for buttons with no focus style of their own under the global `button:focus { outline: none }` (e.g. the tag-input remove ×; three were fixed here, D-4). **F-19** `.lc-textarea--outline:hover:not(…)` (0,4,0) beats `:focus`, so a hovered focused field shows `--color-primary-400` (1.89 L); derived from specificity, not measured yet. **F-20** (review r1): `autoFit` at 360 scales the dependency viewer to 47 % (*Node statuses*), so the 1.5 node stroke renders 0.71 px and the labels about 5.6 px; consider `vector-effect: non-scaling-stroke` and a minimum scale. Pre-existing, not caused by F-16.

## 7. Texts

No new built-in strings. *Text Hierarchy* (log viewer, `locale="de-DE"`) sets every remaining built-in string, so the shot isn't mixed (pitfall 034 r1):

| Input | EN default | DE (story) |
|---|---|---|
| `jumpToBottomLabel` | Jump to bottom | Zum Ende springen |
| `pauseLabel` / `resumeLabel` | Pause / Resume | Pausieren / Fortsetzen |
| `pauseAriaLabel` / `resumeAriaLabel` | Pause stream / Resume stream | Stream pausieren / Stream fortsetzen |
| `clearLabel` / `clearAriaLabel` | Clear / Clear log | Leeren / Log leeren |
| `copyLabel` / `copyAriaLabel` | Copy all / Copy all lines | Alle kopieren / Alle Zeilen kopieren |
| `searchLabel` / `searchAriaLabel` / `searchInputLabel` | Search (/) / Search log / Search logs | Suchen (/) / Log durchsuchen / Logs durchsuchen |
| `outputAriaLabel` | Log output | Log-Ausgabe |

All of these are attributes or hidden text, except the jump label, which shows only after scrolling up. So the at-rest shots stay identical.

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Clickable rows (BA-10) / English | `components-description-list--clickable-rows`, `--clickable-rows-english` | unchanged | Docs text and the `clickable` argType description: "native button per row, named term + value; the `dl` keeps its pairs (F-17, 3.25)"; ring values as §5 |
| Colors | `feedback-progress-bar--colors` | unchanged | Docs: "primary reads `--color-primary-500`: 3.96 light, 6.69 dark on a surface-2 track (was 2.89)" |
| Text Hierarchy | `data-display-logviewer--text-hierarchy` | + §7 labels | German jump-to-bottom, focus on the pill |
| **Node statuses (F-16)** (new) | `data-display-dependency-viewer--node-statuses` | `root`: "Standard" (default) with children Aktiv, Erfolg, Warnung, Fehler, Gedämpft (muted, with one default child, so it shows a toggle); `direction: 'horizontal'`, `autoFit: true`, `height: '360px'` | Every node status and a toggle in one frame at 360 / 1280; docs list the §5 border ratios |

## 9. Verification

Baseline: `tmp/story-shots/039/baseline` (99 stories at 360 / 1280, L/D, `--full`, 396 shots, 31a3d7d; logs `baseline-{a,b,c}.log`): progress-bar 8, progress-ring 7, button *loading-keeps-focus*, dl 10, NC 8, dependency-viewer 24, log-viewer 10, code-block 10, tree-view 4, slider 6, select 7, kanban 4. **Expected `--compare`:** 114 differ (progress-bar dark 16, button dark 2, dependency 96 in both themes: every story has an affected node or toggle, counted in `039/probe-count`), 282 identical. Log-viewer shots that differ must be re-shot against a second main run (the stories use `Date.now()`). Focus: `tmp/story-shots/039/focus-measure.js` (focus, room, outline, shadow, border).

| AC | How | Expected |
|---|---|---|
| AC-1 | spec: the progress map declares `var(--color-primary-500)` (linear and circular), with track ratio floors; dark shots of *Colors* | 3.96 / 6.69; the other colours unchanged; theme-contrast `AC-10 … primary stays raw` (l. 746–749) changes with reason F-14 |
| AC-2 | `focus-measure.js` on NC default + DE (*priority-on-unread-rows*), log default / terminal / text-hierarchy (scroll up), code-block type-script, tree default, slider default, select (open, ArrowDown), dl clickable, dep horizontal, digit + error stories, at 360 and 1024, L/D | outline 2 px solid rgb(32,132,151) / rgb(132,199,212), offsets per §3, room ≥ 4 (outside) or inset; no `color-mix` box-shadow on any fix row |
| AC-3 | `--forced-colors` run of the same measure; a spec scans the forced-colours blocks | outline colour rgba(5,0,73,.8) L / rgba(0,230,255,.8) D on every fix row |
| AC-4 | measure: `focus()` → `:focus-visible` true; `.click()` on the NC title or dl row → no outline on the clicked control | as stated |
| AC-5 | §3/§5 tables + `design.md` inventory below; spec guard: no `:focus*`, `--focused` or `--highlighted` rule in `lib/**/*.scss` has a ≤ 40 % primary/error halo without `border-color` or `outline` in the same rule | all fix rows done |
| AC-6 | node-statuses + horizontal stories, stroke attributes + ratios in `--measure`, 360 / 1280 L/D | §5 values |
| AC-7 | unit: no `role`/`tabindex` on the row, dt/dd ids, button `aria-labelledby`, `click()` on the button emits once; review: CDN axe `definition-list`/`dlitem` pass, names | 0 violations, "term value" |
| AC-8 | full suite; edited assertions only: dl spec l. 103–104, clickable spec l. 51–52 and 88–89, theme-contrast l. 1328, 1349–1354, 1419 (row focus selector → `.lc-dl__action:focus-visible`), all for F-17 | 44 px rows and 4.17 / 7.57 ring unchanged |
| AC-9 | DE stories at 360: NC *priority-on-unread-rows*, log *text-hierarchy*, code *long-command-german* | `scrollWidth − clientWidth` 0 on toolbars and rows; rings unclipped |
| AC-10 | `--compare` as above; compat home gets a `[clickable]="true"` dl, and `EXPECT_IN_HTML` gets `class="lc-dl__action"` and `aria-labelledby="lc-dl-\d+-t0 lc-dl-\d+-v0"` | 114 / 282 |
| AC-11 | diff review: no new `transition`, no new input | — |
| AC-12 | CHANGELOG 3.25.0 Fixed (F-14…F-17 with §5 values, D-4 buttons); Compatibility: the dl DOM change, the name "term value", Tab order with `href`; the 3.23.1 Known line stays | — |

**Inventory (AC-5)**, grep `color-mix(… primary-500|error N%)` N ≤ 40 (plus 60 %), `rgba(32,132,151,≤.4)` on focus rules:

| File:line | Selector | Remaining indicator | Decision |
|---|---|---|---|
| notification-center:224, 360 | title, dismiss `:focus-visible` | none | fix |
| log-viewer:369, 234 | jump-bottom; clickable line (60 %) | none | fix |
| code-block:69 | copy | ink change only | fix (inset) |
| tree-view:46 (+71 primary-400) | tool button (+ item) | none | fix |
| slider:99, 104 | thumb | none | fix |
| select:293 | `--highlighted` option | fill only (`surface-hover` 1.10 L) | fix (inset) |
| verification-code:46, 59 | digit focus, error | filled digits keep the same border | fix |
| password:72 · textarea:115 · number-input:104 · combobox:43 | error focus | border unchanged | fix |
| password:58 · textarea:39, 78, 93 · number-input:28 · combobox:36 · date-range:30 · search-input:25 · tag-input:34 · color-picker:69 · kanban:96 | focus / `--focused` | border → primary-500 ≥ 4.17 / 7.57; forced colours: border Highlight | keep |
| stepper:99 · chat:215–219 · other hits (fills) | active step, streaming pulse, backgrounds | not focus styles | n/a |
