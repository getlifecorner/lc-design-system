# Design 034: Status ink contrast follow-up 2 (F-1 to F-7 of 029)

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-15
- **Release:** patch **3.22.4** (no new token, no API change; D-1)

## 1. Approach

Extend, CSS and colour constants only. Each fix reuses a pairing the kit already asserts: the 029 status inks (`--color-on-<v>-subtle`), the lc-badge primary pair, and the text tokens `--color-text-secondary` / `--color-text-tertiary`. All values were computed in the browser on the resolved tokens (`tmp/story-shots/034/grid-measure.js`, story-shots `--measure`).

| ID | Decision | Why |
|---|---|---|
| D-1 (F-1) | On **unread** rows, every NC chip composites its own tint on `--color-surface` (an opaque base plus the tint as a one-colour gradient layer). No new token, and the ink stays the 029 ink | The cause is a translucent tint on the translucent teal row (dark). With an opaque base the chip pair reads as it does on a plain row, constant over the panel gradient (5.55). A lighter ink token would give a "High" chip two colours in one list. Same cause and same fix for the urgent, low and category chips on unread rows (low/category were 3.76 in dark) |
| D-2 (F-2) | Ring arcs take the progress-bar inks: status `--color-on-<v>-subtle`; primary unchanged; secondary `--color-secondary-600` | Secondary also fails today (2.83 L), and AC-3 covers all six variants. The hue stays recognisable |
| D-3 (F-3) | Diff line tints `--color-<v>-50` → `--color-<v>-subtle`; line numbers → `--color-text-secondary` | In light, `-50` is the saturated `-light` step (#cdd6c2, #f7a1a1): numbers were 3.88 on added lines and **2.93** on removed ones, and the `+` was 3.52. In dark, `-subtle` equals `-50` (same rgba), so the tints are unchanged; tertiary numbers there are 4.12 on surface-2, hence secondary |
| D-4 (F-4) | Card `--primary` chip = the lc-badge primary pair (`--color-primary-subtle` / `--color-on-primary-subtle`) with a `--color-primary-500` border | AC-5 asks for a border ≥ 3:1, but `--color-border-strong` is 1.37 L / 1.82 D today (the spec's "stays" is not true today), so the border has to change. Dark text and fill are unchanged |
| D-5 (F-5) | A `::before` hit area, 40 px tall (the toolbar's inner height) and 2 px into each 4 px gap. The visible pill and the toolbar are unchanged | 44 px would need a 45 px toolbar (+4 px layout). The root's `overflow: hidden` clips above, and the first log line is a target below (prototyped). 2.5.8 is met by size (≥ 24 × 24) |
| D-6 (F-6) | `uses` → `--color-text-tertiary`, `extends` → `--color-on-primary-subtle` (line, arrow, label and legend share it, as now) | These follow the 029 relation-ink family. `depends` (2.53 L) is not in F-6 and changing it would also recolour the layered structural lines that share `arrow-depends`, so it becomes follow-up F-9 |
| D-7 (F-7) | No opacity on text. Three steps: message `text-primary`; meta (number, time, source) and the debug message `text-secondary`; meta on debug lines, the debug level, the line count and the placeholder `text-tertiary`. The terminal mirrors this with Mocha Subtext0 `#a6adc8` / Overlay2 `#9399b2` | Tertiary can't carry the meta on every line: 4.32 L on an error line under hover. Debug lines have no tint, so tertiary works there (5.34) |

## 2. Public API

No input, output, slot, CSS hook, token or type changes (AC-2, AC-13). The changed declarations are listed below; the terminal hexes stay inside `.lc-log-viewer--terminal`. **Write every terminal rule as a flat top-level selector** (029 r1: a nested `&` compiled to a dead `.line--x .terminal` selector).

| F | File | Selector (compiled) | Old → new |
|---|---|---|---|
| 1 | notification-center.component.scss | `.lc-nc__item--unread .lc-nc__item-priority`, `.lc-nc__item--unread .lc-nc__item-category` | new `background-color: var(--color-surface)` |
| 1 | 〃 | `.lc-nc__item--unread .lc-nc__item-priority--high` / `--urgent` | new `background-image: linear-gradient(var(--color-warning-subtle), var(--color-warning-subtle))` / `…error-subtle…` |
| 1 | 〃 | `.lc-nc__item--unread .lc-nc__item-priority--low`, `.lc-nc__item--unread .lc-nc__item-category` | new `background-image: linear-gradient(var(--color-surface-hover), var(--color-surface-hover))`. The base rules stay as they are (029 swap rows unchanged) |
| 2 | progress-ring.component.scss | `.lc-progress-ring__value--secondary` | `--color-secondary-500` → `var(--color-secondary-600)` |
| 2 | 〃 | `--success` / `--warning` / `--error` / `--info` | `var(--color-<v>-default)` → `var(--color-on-<v>-subtle)`; `--primary` unchanged |
| 3 | diff-viewer.component.scss | `.lc-diff__line--added` / `--removed` | `var(--color-success-50, #f0fdf4)` / `var(--color-error-50, #fef2f2)` → `var(--color-success-subtle)` / `var(--color-error-subtle)` |
| 3 | 〃 | `.lc-diff__num` | `--color-text-tertiary` → `var(--color-text-secondary)`; the prefix stays the ink |
| 4 | card.component.scss | `.card__badge--primary` | `background-color: rgba(32, 132, 151, 0.16)` → `var(--color-primary-subtle)`; `color: --color-primary-500` → `var(--color-on-primary-subtle)`; `border: 1px solid var(--color-border-strong)` → `1px solid var(--color-primary-500)` |
| 5 | log-viewer.component.scss | `.lc-log-viewer__level-pill` | + `position: relative` |
| 5 | 〃 | `.lc-log-viewer__level-pill::before` | new `content: ''; position: absolute; inset-inline: -0.125rem; top: calc(50% - 20px); bottom: calc(50% - 20px)` |
| 6 | dependency-viewer.component.ts, .html | `RELATION_STYLES.uses` and `<marker id="arrow-uses">` | `var(--color-neutral-300)` → `var(--color-text-tertiary)` (tree edges keep their own `neutral-300` literal) |
| 6 | 〃 | `RELATION_STYLES.extends` and `<marker id="arrow-extends">` | `var(--color-primary-400)` → `var(--color-on-primary-subtle)` |
| 7 | log-viewer.component.scss | `.lc-log-viewer__line--debug` | `opacity: 0.6` → `color: var(--color-text-secondary)` |
| 7 | 〃 | `.lc-log-viewer__line-num`, `.lc-log-viewer__timestamp`, `.lc-log-viewer__source` | `color: inherit` + `opacity` .3 / .5 / .5 → `color: var(--color-text-secondary)` |
| 7 | 〃 | `.lc-log-viewer__line--debug .lc-log-viewer__line-num` (and the same for `__timestamp` and `__source`) | new `color: var(--color-text-tertiary)` |
| 7 | 〃 | `.lc-log-viewer__line-count` | `opacity: 0.5` → `color: var(--color-text-tertiary)` |
| 7 | 〃 | `.lc-log-viewer__search-input::placeholder` | `opacity: 0.4` → `color: var(--color-text-tertiary); opacity: 1` (Firefox's UA placeholder is 0.54) |
| 7 | 〃 | `.lc-log-viewer--terminal .lc-log-viewer__line-num` (the same for `__timestamp`, `__source`) and `.lc-log-viewer--terminal .lc-log-viewer__line--debug` | new `color: #a6adc8` (0,2,0) |
| 7 | 〃 | `.lc-log-viewer--terminal .lc-log-viewer__line--debug .lc-log-viewer__line-num` (the same for `__timestamp`, `__source`) | new `color: #9399b2` (0,3,0) |
| 7 | 〃 | `.lc-log-viewer--terminal .lc-log-viewer__line-count`, `.lc-log-viewer--terminal .lc-log-viewer__search-input::placeholder` | new `color: #9399b2` |

The default rendering is otherwise unchanged: geometry, DOM and selectors stay the same, so there is no prerender change (AC-12). The changes are colours only, plus an empty `::before`. The log-viewer spec's `not.toMatch(/#9ca3af/)` and its `--color-warning-default` assertion (search highlight) still hold.

## 3. Anatomy and layout

Geometry is unchanged except for the pills' hit area (D-5). Measured on main 72ce8b6 with the prototype injected (`tmp/story-shots/034/proto-pill`).

### 360 px (*Default*: story padding 16, viewer 328 × 400)

```
y17 ┌─ toolbar 326 × 41 (6 pad + 28 + 6 pad + 1 border) ───────────────────────────────┐
    │ [28][28][28]                ┆‹12 errors›┆‹12 warnings›┆  50 lines                     │
    │ x25  57  89                 ┆ x137 62.4 ┆ x203.4 78.3 ┆  x285.7 (tertiary)            │
y57 └─────────────────────────────┴ hit 135–201.4 ┴ 201.4–283.7 ┴──────────────────────────┘
       visible pill: 15 tall at y29.5 (11 px, pad 2/8); hit area: y17–57 = 40 tall, w + 4
DE / 4 tool buttons: the pills already wrap to 2 lines (26 tall at y24); the hit area stays y17–57
```

### From 1024 px

```
y17 ┌──────────────────────────────────────── 1246 (at 1280) ──────────────────────────┐
    │ [28][28][28]                                   ┆‹12 errors›┆‹12 warnings›┆ 50 lines │
    │                                                ┆ x1057     ┆ x1123.4     ┆ x1205.7  │
y57 └────────────────────────────────────────────────┴ hit 40 tall, touching, no overlap ┘
```

| Element | Size | Note |
|---|---|---|
| level pill (visible) | 15 tall (11 px/1, pad 2/8, r 9999) | unchanged |
| pill hit area (`::before`) | 40 × (pill + 4) | `top/bottom: calc(50% - 20px)`, `inset-inline: -0.125rem` (half the 0.25rem gap); a taller pill (2 lines, 200 %) is its own hit area |
| NC chip on an unread row | unchanged box (10 px uppercase, pad 1/5, r sm) | fill = tint over `--color-surface`, not over the row |
| card primary chip | 20 tall, border 1 px | border colour only |

## 4. States

| State | Change |
|---|---|
| default | §5 inks; light NC chips look identical (opaque tints; only the corner anti-aliasing of the two-layer paint changes: measured, `proto-ctl2`) |
| hover | log line `rgba(128,128,128,.08)` over every line tint is one of the §5 bases; NC unread hover stays `--color-surface-selected` (chips unaffected) |
| focus-visible | pills keep the UA ring on the visible pill (`::before` doesn't change the outline); the clickable-line inset ring is unchanged |
| active / pressed | pressed pill: inset 1 px `currentColor` ring; forced colours: 2 px Highlight outline (unchanged) |
| selected | card `selected` is a base of F-4; the NC unread row is the base of F-1 |
| disabled / loading / empty / error | not affected (NC empty, diff identical: no coloured parts) |
| overflow | DE pills wrap to 2 lines at 360 px (as today, no horizontal overflow: scrollWidth 326 = clientWidth); long logs, many chips and long NC titles are unchanged |

## 5. Theming

Floored WCAG ratios, old → new, light / dark. Bases: **NC** chip tint over the unread row at both ends of `--gradient-surface` (old) or over `--color-surface` (new). **Ring:** the track (`--color-surface-hover` over background, surface and surface-2) and the page itself. **Diff:** the line tint over background, surface and surface-2. **Card:** the chip over surface, surface-2, hover, selected (over background and over surface), muted tile and background. **Dependency:** the label on its surface halo; the legend line on surface-2. **Log:** surface, warn .12, error .12, each with and without hover .08; debug lines on surface and hover. **Terminal:** `#1e1e2e`, warn +.05, error +.08, each ± hover; the toolbar `#181825`.

| Element | Kind | Light | Dark |
|---|---|---|---|
| NC high chip, unread row | text | 5.52 → 5.52 | **3.67 → 5.55** |
| NC urgent / low / category chip, unread row | text | 10.97 / 5.30 / 5.30 (same) | 5.91 → 8.37 / **3.76 → 5.99** / **3.76 → 5.99** |
| Ring arc primary / secondary / success / warning / error / info vs track | graphic | 3.96 / **2.83 → 4.19** / **2.47 → 4.81** / **2.05 → 5.47** / 7.62 → 11.43 / 5.60 → 9.22 | 6.69 / 7.16 → 8.35 / 8.43 → 6.15 / 8.81 → 5.60 / 6.37 / 7.80 |
| Ring arc vs page (min per arc) | graphic | 4.17 … 12.04 | 6.34 … 9.45 |
| Diff number: added / removed / context | text | **3.88 → 6.91** / **2.93 → 6.58** / 5.58 → 7.23 | **4.12 → 6.86** / 5.56 → 9.26 / 5.56 → 9.25 |
| Diff prefix `+` / `−` | text | **3.52 → 4.85** / 6.33 → 10.97 | 5.17 / 7.21 (same) |
| Diff content on the line tints | text | 16.24 / 15.46 | 9.75 / 13.16 |
| Card primary chip text | text | **3.12 → 8.48** | 5.79 (same) |
| Card primary chip border vs card / vs chip fill | boundary | **1.37 → 3.75** / 1.14 → 4.06 | **1.82 → 6.87** / 1.54 → 5.79 |
| Dependency `uses` label / line (0.8 cross-ref) / legend | text / graphic | **1.47 → 5.83** / 3.75 / 5.58 | **2.28 → 6.70** / 4.76 / 5.56 |
| Dependency `extends` label / line (0.8) / legend | text / graphic | **1.89 → 9.13** / 5.32 / 8.74 | **3.95 → 9.12** / 6.29 / 7.57 |
| Log meta: number, time, source (every line) | text | time/source **3.21 → 5.60** (numbers were at 0.3) | **4.43 → 8.29** |
| Log debug message / debug level / debug-line meta | text | 4.66 → 6.92 / **2.53 → 5.34** / **1.94 → 5.34** | → 10.18 / **3.25 → 6.12** / **2.58 → 6.12** |
| Log line count / search placeholder | text | opacity 0.5 / 0.4 → 5.83 | → 6.70 |
| Terminal meta `#a6adc8` (every line) | text | time/source **3.64**, numbers **2.20** (1.59 on debug) **→ 5.85** (theme-independent) | same |
| Terminal debug message `#a6adc8` / debug level `#9399b2` / debug-line meta `#9399b2` | text | opacity 0.6 → 6.70 / **2.97 → 5.28** / **2.24 → 5.28** | same |
| Terminal line count, placeholder `#9399b2` on `#181825` | text | → 6.21 | same |
| Terminal levels debug / info / warn / error | text | 5.81 / 7.78 / 11.43 / 6.19 (unchanged) | same |

- **New minimum per palette:** text 4.85 L (diff `+`) / 5.17 D (diff `+`), terminal 5.28. Boundaries and graphics 3.75 L (card border on hover/selected; `uses` cross-ref line) / 4.76 D (`uses` cross-ref line).
- **Dark gets darker in places:** success ring 8.43 → 6.15 and warning 8.81 → 5.60 (as in 029's progress bar). Dark terminal and log meta get lighter (more contrast).
- **Shared values:** `--color-success/error/warning/info`, `-default` and every token value are unchanged; no token is added (AC-2).

## 6. Accessibility

- **Semantics, keyboard, names:** unchanged. No new focusable element; the `::before` has empty content, so nothing is announced (AC-10).
- **Targets:** each pill's hit area is 40 × (w + 4) ≥ 24 × 24, so WCAG 2.5.8 is met by size. A 24 px circle at the pill centre stays within its own pill horizontally and within the toolbar vertically. Hit areas touch (no gap, no overlap), and the line count starts 2 px after the last one. The 28 px tool buttons are unchanged (follow-up F-12).
- **Forced colours:** no `forced-color-adjust` is added. Gradient background images are dropped in forced colours and the system colours apply, as for every chip. The pressed-pill outline and the progress fill rules are unchanged.
- **Colour alone:** dependency relations keep dash style and label text; NC priority keeps its word; diff keeps `+` / `−`.
- **Motion / announcements:** none.

## 7. Texts

No built-in string changes (no new locale key). The new stories (§8) use German strings to check AC-11: NC `title` "Benachrichtigungen", `highPriorityLabel` "Hoch", `urgentPriorityLabel` "Dringend", `lowPriorityLabel` "Niedrig", `markAllReadLabel` "Alle als gelesen markieren", `minutesAgoLabel` "vor {n} Min.", `hoursAgoLabel` "vor {n} Std.", `daysAgoLabel` "vor {n} T."; log `errorsLabel` "Fehler", `warningsLabel` "Warnungen", `linesLabel` "Zeilen", `searchPlaceholder` "Logs durchsuchen…", `locale` "de-DE".

The CHANGELOG (AC-15) goes under **Fixed**, one line per F with the §5 old → new values (bold cells). D-1 says that light chips are unchanged in colour. Light diffs are paler (subtle tints), as in dark. The ring's dark success and warning arcs are slightly darker. **Compatibility:** no API break, no new token, selectors unchanged; one new `::before` on the log pills; consumers who restyled `.lc-diff__line--added` keep their rule.

## 8. Stories

New stories (each with a `docs.description.story`):

| Story | Expected ID | Content | Shows |
|---|---|---|---|
| All Colors | `charts-progress-ring--all-colors` | six `md` rings, value 60, flex-wrap gap 16, 12 px `text-secondary` caption with the colour name | AC-3 |
| Priority On Unread Rows | `feedback-notification-center--priority-on-unread-rows` | `showPriority`, the §7 DE labels; urgent unread (CI/CD, 5 min ago), high unread ×2 (Infrastruktur 20, Sicherheit 50), high read (Abrechnung 180), normal read (Code-Review 300), low unread (Team 1500). The sort puts the high unread rows at the gradient top and the low one at the bottom | AC-1, 11 |
| Primary Badge States | `components-card--primary-badge-states` | grid `repeat(auto-fit, minmax(200px, 1fr))`, gap 16: outlined "Members" badge 1; outlined clickable **selected** "Projects" badge 2; elevated "Teams" badge 3; all `badgeVariant="primary"`, padding md | AC-5 |
| Text Hierarchy | `data-display-logviewer--text-hierarchy` | `log` and `terminal` stacked (gap 16), 120 lines from `generateLogs` with **local** timestamps `new Date(2026, 10, 2, 9, 0, i)`, line numbers + timestamps, height 240px, the §7 DE labels ("30 Fehler", "30 Warnungen", "120 Zeilen": wraps at 360) | AC-6, 7, 8, 11 |
| All Relation Types | `data-display-dependency-viewer--all-relation-types` | layered, horizontal, height 420px: core ← api (depends), api ← web (uses), web ← admin (extends), core ← jobs (requires), api ← audit (implements), api ← docs (references), jobs ← legacy (blocks, status error); the legend lists 7 | AC-9 |

Existing review surfaces: NC `--with-priority`, `--default`; ring `--success`, `--warning`, `--dashboard`; diff `--inline`, `--side-by-side`; card `--section-cards`; log `--app-registers-no-icons` (fixed dates), `--default`, `--terminal` (by measure only: `Date.now()`); dependency `--complex-relationships`.

## 9. Verification

| AC | How | Expected |
|---|---|---|
| 1, 2, 14 | `theme-contrast.spec.ts`: new `describe('Component pairings of 3.22.4 (request 034)')`, built like the 029 block: compile the 6 sheets; (a) every §2 rule body as listed (exact `var(…)`), no `opacity` below 1 in any log rule whose selector holds `__line--debug`, `__line-num`, `__timestamp`, `__source`, `__line-count` or `::placeholder`; ring and dependency sources as in §2; (b) per palette, the §5 cells; (c) `--color-warning-default` and the other three `-default` and fill hexes equal today's. In the 029 block, the test "F-1 (known)" now composites the high and urgent chips through the new unread rule (tint over `--color-surface`) and expects `[5.52, 5.55]`, ≥ 4.5 (reason: F-1 fixed) | text min `toBeCloseTo([4.85, 5.17][i], 2)`; graphic min `[3.75, 4.76]`; terminal text min 5.28 and levels `[5.81, 7.78, 11.43, 6.19]` |
| 1 | `--measure` on *Priority On Unread Rows* at 360 and 1280, L/D: chip `background-color` + the gradient colour composited, ink ratio | high 5.52 L / 5.55 D on every row; low/category 5.30 / 5.99 |
| 3 | *All Colors*, *Dashboard*: computed `stroke` against the track composite | §5 ring row |
| 4 | *Inline*, *Side By Side*: number, prefix and line backgrounds | §5 diff rows |
| 5 | *Primary Badge States* L/D: text, `border-top-color` against the card and against the chip fill | 8.48 / 5.79; border ≥ 3.75 / 5.79 |
| 6 | *Text Hierarchy* and *App Registers No Icons* at 360/1024/1280: pill box (15, or 26 on 2 lines), `elementFromPoint` at toolbar top + 1, bottom − 2 and pill edges ± 1.5 → the pill, below the toolbar → the content; toolbar `scrollWidth = clientWidth` | hit area 40 tall, neighbours touch, no overflow EN/DE |
| 7, 8 | the spec source check (a); *Text Hierarchy* L/D: each element's computed `color`, `opacity` 1 on it and every ancestor, ratio on its real line background | §5 log/terminal rows |
| 9 | *All Relation Types*, *Complex Relationships* at 360/1280 L/D: label `fill`, path `stroke` × opacity, legend line | §5 dependency rows; dash patterns unchanged |
| 10 | full Jest run; `--forced-colors` shot of *Text Hierarchy* and *Priority On Unread Rows* | specs green; pressed-pill outline rule unchanged |
| 11 | DE shots of *Text Hierarchy* and *Priority On Unread Rows* at 360 | same wrapping as main (2-line pills), no clipping |
| 12 | `check-angular-majors.mjs` | green |
| 13 | `git diff` on the six `*.spec.ts` | no edited assertion |
| 15 | changelog review | §7 |

**Baseline** (`tmp/story-shots/034/baseline`, main 72ce8b6, 60 stories, 360/1024/1280 L/D `--full`, 360 shots; lists in `baseline-{a,b,c}.log`; re-run 120/120 identical except `components-chat--with-diff-viewer`, which renders clock times). Expected `--compare`: **96 differ / 258 identical / 6 unstable**.
- **Differ:** NC `default`, `with-priority`, `grouped-by-category` and `compact` in L+D. In light, the colours are equal and only the corner raster of the two-layer chip changes (proven: `proto-ctl` identical, `proto-ctl2` differs). Ring `success`, `warning`, `dashboard` in L+D, and `error` in L only. Diff `side-by-side`, `inline`, `context-lines` and `identical` in L+D, and `no-line-numbers` in L. Card `section-cards` in L+D. Log `streaming` and `app-registers-no-icons` in L+D. Dependency `complex-relationships` in L+D.
- **Identical:** the other NC stories (empty, all-read, errors-only); ring `default` and `all-sizes`, and `error` in D; diff `no-line-numbers` in D; the other 15 card stories; the other 22 dependency stories (their labels are status inks or `depends`).

**Follow-ups (not in this request):**
- **F-8:** NC message and time text (`text-tertiary`) on unread rows in dark: 4.23 at the surface-2 end.
- **F-9:** dependency `depends` label 2.53 L / 3.57 D, and the neutral structural and tree lines (`neutral-400` 2.53 L, `neutral-300` 1.47 L / 2.28 D).
- **F-10:** the log search match in dark: text-primary on the 45 % warning mix is 3.82–4.61.
- **F-11:** the progress-bar secondary fill is 2.83 L against its track.
- **F-12:** the log toolbar at 44 px (tool buttons 28, pills 40).
