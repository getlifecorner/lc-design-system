# Design 029: Status ink contrast follow-up of 027 and the money Number Column caveat

- **Status:** ready (changed in review r1, see the change note)
- **Spec:** [spec.md](spec.md), AC-1 to AC-16
- **Change note (review r1, 2026-11-02):** §2 said "the terminal rules stay" for the log levels, but that block compiles to `.lc-log-viewer__line--warn .lc-log-viewer--terminal .lc-log-viewer__level` (line *outside* the terminal) and never matched, so the terminal levels read the theme colour. With the ink, light-theme terminal levels fell to info 1.61, warn 2.40, error 1.13 (were 2.65 / 6.43 / 1.70). New §2 row "terminal levels", §5 row, §9 checks; AC-15 expected count corrected to 265 / 275 (Streaming shows no line at shot time, so its 6 shots stay identical; the prototype measure had waited 400 ms).
- **Baseline:** `tmp/story-shots/029/baseline`, 90 stories at 360/1024/1280, light/dark, `--full` (540 shots, main ee0cde3; story lists in `tmp/029/baseline-{a,b,c}.log`). **Prototype:** the §2 values injected as CSS into the same stories, `tmp/story-shots/029/proto` (logs `tmp/029/proto-{a,b,c}.log`, measure `tmp/story-shots/029/proto-measure.js`): **271 different, 269 identical** (§9 AC-15). Contrast grid: `tmp/story-shots/029/grid-measure.js` (WCAG relative luminance on the resolved tokens of each theme, floored to 2 decimals).

## 1. Approach

Bug fix, no new token, the 027 pattern: every status colour that a listed element uses as **foreground** (text, icon, glyph, dot, stroke, border, progress fill) reads its ink `--color-on-<v>-subtle` in both themes. In light that is the dark step of the ramp (`#5f7150`, `#855a22`, `#6b0909`, `#27445c`); in dark the light step (`#a9bb93`, `#e1a040`, `#f7a1a1`, `#b8cee0`). One token family for text and graphics, as 027 and `colors.mdx` ("Ink on the status tints"); `--color-text-info` doesn't exist. Selectors stay as they are; only values change. Fills, rails and line tints stay (`--color-<v>` rails such as the NC urgent `border-left`, the diff and log line tints, the dependency node fills, the log search highlight). Info uses the ink too where it already passes, so each component reads one family.

Four decisions go beyond the plain swap; each is the smallest change that meets its AC:

| # | Where | Decision | Why |
|---|---|---|---|
| D-1 | lc-card status chips, lc-notification-center priority chips | The chip background moves from the raw `rgba(<v>, .18)` to the matching **`--color-<v>-subtle`** token. | The ink on the raw tint fails AC-2 in light: card success 4.53 on `--color-surface`, **4.36 on `--color-surface-2`** (the top of the default elevated card, `--gradient-surface`) and 3.97 on a selected card. On the subtle token the pair is the documented badge pair (lc-badge, lc-list), opaque in light: 4.85 / 5.52 / 10.97 on every card and row. In dark the token *is* `rgba(<v>, .18)`, so dark backgrounds are identical. The spec puts tints out of scope; this changes no shared value (AC-11) and only component-local literals. |
| D-2 | lc-log-viewer level pills | Drop the `opacity: .6` off state. At rest a pill shows its ink on its tint at full opacity; the pressed pill (`--active`, `aria-pressed="true"`) adds `box-shadow: inset 0 0 0 1px currentColor`. Forced colours: the NC filter-chip outline. | Both pills sit at rest at 60 % by default (no level filter), which is below 4.5 in light whatever the hue (warn 1.53, error 3.27; the ink alone reaches only 2.51 / 3.89) and would take dark warn **from 4.62 to 3.25**. The ring gives the pressed state a 3:1 cue (5.25 L / 5.55 D) instead of a dimmed text. Applies to the terminal variant too: its at-rest pills go 3.35 → 6.07 (error) and 5.07 → 9.56 (warn), its colours stay. |
| D-3 | lc-diff-viewer `+` / `−` prefix | Treated as a **glyph** (3:1), as the spec's AC-9 split allows: a one-character, `user-select: none` marker beside the tinted line. | Light `+` in the ink on the added line (`--color-success-50` = `#cdd6c2`) is 3.52; no success token reaches 4.5 there. Rejected: `--color-text-secondary` (5.03) drops the hue that every diff convention keeps. |
| D-4 | lc-pipeline `complete` node glyph | `color: var(--color-surface)` (was `var(--color-on-primary, #fff)`). | AC-6 asks success-like nodes for 3:1; the pipeline has no success/info status, its success node is `complete`. White on the dark-theme `--color-primary-500` (`#84c7d4`) is **1.89**; the surface colour knocks the check out: 9.12 dark, light unchanged (`#ffffff`, 4.36). `current` (primary-500 ring and glyph on the surface) already passes: 4.36 L / 9.12 D. |

## 2. Public API

No input, output, slot, selector, `--lc-*` hook or default changes (AC-14). Value changes (`ink(v)` = `var(--color-on-<v>-subtle)`, `sub(v)` = `var(--color-<v>-subtle)`):

| File | Rule | Property: old → new |
|---|---|---|
| `notification-center.component.scss` | `.lc-nc__item-icon--{info,success,warning,error}` | `color: var(--color-<v>-default, #hex)` → `ink(v)`; the 4 hex fallbacks go (AC-4) |
| same | `.lc-nc__item-priority--high` / `--urgent` | `background: rgba(…, .18)` → `sub(warning)` / `sub(error)`; `color: var(--color-warning)` / `var(--color-error)` → `ink(warning)` / `ink(error)` (D-1) |
| `card.component.scss` | `.card__badge--{success,warning,error}` | `background-color: rgba(…, .18)` → `sub(v)`; `color: var(--color-<v>)` → `ink(v)` (D-1) |
| `markdown.component.scss` | `.lc-markdown__mermaid-error` | `var(--color-error)` → `ink(error)` |
| `status-dot.component.scss` | `.lc-status-dot--done / --wait / --blocked` | `var(--color-success/warning/error)` → `ink(success/warning/error)`; the pulse follows (`currentColor`) |
| `pipeline.component.scss` | `__step--warning`, `__step--error` `.lc-pipeline__node` | `border-color` and `color`: `var(--color-<v>)` → `ink(v)` |
| same | `__step--complete .lc-pipeline__node` | `color: var(--color-on-primary, #fff)` → `var(--color-surface)` (D-4) |
| `file-upload.component.scss` | `.file-upload__file-remove:hover` | `color: var(--color-error)` → `ink(error)`; the hover tint stays |
| `rating.component.scss` | `.rating__icon--filled`, `.rating__icon-fill` | `var(--color-warning)` → `ink(warning)` |
| `log-viewer.component.scss` | `.lc-log-viewer__level` in `__line--info/--warn/--error` | `var(--color-<v>-default)` → `ink(info/warning/error)` (log variant) |
| same (r1) | the dead terminal block inside `.lc-log-viewer__level` | replace by `.lc-log-viewer--terminal .lc-log-viewer__line--<lv> & { color }` (0,3,0; beats the log rule's 0,2,0): debug `#9399b2` (was `#6c7086`, 3.35 in both themes), info `#89b4fa`, warn `#f9e2af`, error `#f38ba8`, the terminal's own palette in both themes, as its pills |
| same | `.lc-log-viewer__level-pill--error` / `--warn` | `color: var(--color-error/warning-default)` → `ink(error/warning)`; tints and terminal colours stay |
| same | `.lc-log-viewer__level-pill` / `--active` | remove `opacity: 0.6` and `--active { opacity: 1 }`; `--active { box-shadow: inset 0 0 0 1px currentColor }`; `transition: box-shadow 0.15s`; add `@media (forced-colors: active) { .lc-log-viewer__level-pill--active:not(:focus-visible) { outline: 2px solid Highlight; outline-offset: 1px } }` (D-2) |
| `diff-viewer.component.scss` | `.lc-diff__stat--add/--del`, `.lc-diff__line--added/--removed .lc-diff__prefix` | `var(--color-success/error-default)` → `ink(success/error)` |
| `dependency-viewer.component.ts` | `RELATION_STYLES` blocks / references / requires / implements | `var(--color-<v>-default[, #3b82f6])` → `ink(error/info/warning/success)` (edges, edge labels, legend lines) |
| same | `STATUS_COLORS` success / warning / error `.border` | `var(--color-<v>-default)` → `ink(v)`; `bg` stays |
| `dependency-viewer.component.html` | `<marker id="arrow-{blocks,references,requires,implements}">` path `fill` | same swap as `RELATION_STYLES` |
| `dependency-viewer.component.scss` | `.dep-viewer__detail-status--{success,warning,error}` | `var(--color-<v>-default)` → `ink(v)` |
| `kanban-board.component.ts` | `getPriorityColor()` critical / high / medium / low | `var(--color-<v>-default)` → `ink(error/warning/info/success)` |
| `kanban-board.component.scss` | `.lc-kanban__column-limit--over` | `var(--color-error-default)` → `ink(error)` |
| `progress-bar.component.scss` | `$progress-colors` success / warning / error / info (linear fill and circular stroke) | raw `colors.$color-<v>-default` → `var(--color-on-<v>-subtle)`; primary and secondary stay raw |

Specificity is unchanged everywhere, so consumer overrides that won before still win (no Compatibility override sentence needed beyond "selectors unchanged"). Default rendering changes in colour only; that is the fix (patch, spec semver note).

## 3. Anatomy and layout

No box changes at any width: no size, spacing, font or radius declaration is touched, and the D-2 ring is an inset `box-shadow` (no layout). The wireframes of each component stay as they are. The only new visual element is the pressed pill:

```
log-viewer toolbar, 360 and 1280 (unchanged geometry: 11 px pills, padding 2/8, radius full)
at rest (no filter):   [ 3 errors ]  [ 5 warnings ]     ink on the tint, opacity 1 (was 60 %)
pressed (errors only): [|3 errors|]  [ 5 warnings ]     + 1 px inset ring in the ink
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| all listed elements | unchanged | unchanged | `--color-on-<v>-subtle` (§2) |
| card / NC chip background | unchanged | — | `--color-<v>-subtle` (D-1) |
| pressed log pill ring | 1 px inset, follows the pill radius | — | `currentColor` |

## 4. States

| State | Change |
|---|---|
| default | ink colours of §5; card/NC chips on the subtle tint; log pills at full opacity |
| hover | file-upload ×: ink on the unchanged error tint; NC/kanban/card hover backgrounds unchanged (measured in §5 as bases) |
| focus-visible | unchanged rings everywhere; a focused pressed pill shows the UA focus ring and, in forced colours, no extra outline (`:not(:focus-visible)`) |
| active / pressed | log pill: ring (D-2); NC unread rows and selected cards are bases in §5 |
| disabled | rating disabled keeps `opacity: .5` (WCAG-exempt inactive control); file-upload disabled unchanged |
| loading / empty / error | NC empty, diff identical, kanban without cards: nothing coloured, identical shots; mermaid error text in the ink |
| overflow | colour only: long German labels, many items and long logs wrap or scroll as before |

## 5. Theming

Old → new, floored. "Base" is the spec's background (the element's surface, or its tint over `--color-surface`); "min" covers the other real backgrounds named in the note column. Targets: **text 4.5**, graphics 3.

| Element | Kind | Light base | Light min | Dark base | Dark min | Min bases |
|---|---|---|---|---|---|---|
| NC priority high | text | 1.96 → **5.52** | 1.72 → 5.52 | 5.55 → 5.55 | 4.60 → 4.60 (read) | panel ends, hover; unread = selected over both ends |
| NC priority urgent | text | 5.96 → 10.97 | 5.16 → 10.97 | 1.98 → **8.37** | 1.39 → 5.91 | same |
| NC type icon success / warning / error / info | icon | 2.72 → 5.29 / 2.25 → 6.02 / 8.39 → 12.58 / 6.17 → 10.15 | 2.33 → **4.55** / 1.94 → 5.18 / 7.21 → 10.82 / 5.30 → 8.73 | 11.5 → 8.4 / 12.01 → 7.65 / 8.68 / 10.64 | 7.27 → 5.31 / 7.59 → **4.83** / 5.49 / 6.72 | same |
| card chip success / warning / error | text | 2.32 → **4.85** / 1.96 → 5.52 / 5.96 → 10.97 | 2.04 → 4.85 / 1.72 → 5.52 / 5.16 → 10.97 | 4.72 → 6.24 / 5.55 / 1.98 → 8.37 | 3.90 → 5.17 / 4.60 → **4.60** / 1.70 → 7.21 | surface-2, hover, selected over the page, muted tile |
| markdown mermaid error | text | 8.39 → 12.58 | 7.62 → 11.43 | 2.05 → **8.68** | 1.70 → 7.21 | page, background-low, sunken, surface-2 |
| status dot done / wait / blocked | graphic | 2.72 → 5.29 / 2.25 → 6.02 / 8.39 → 12.58 | 2.60 → 5.06 / 2.15 → 5.76 / 8.02 → 12.04 | 6.34 → 8.40 / 7.65 / 2.05 → 8.68 | 5.26 → 6.97 / 6.34 / 1.70 → 7.21 | background, surface-2 |
| pipeline warning / error node (border, glyph) | graphic | 2.25 → 6.02 / 8.39 → 12.58 | 2.15 → 5.76 / 8.02 → 12.04 | 7.65 / 2.05 → 8.68 | 6.34 / 1.70 → 7.21 | same |
| pipeline complete glyph (D-4) | graphic | 4.36 → 4.36 | — | 1.89 → **9.12** | — | its node fill |
| file-upload × on hover | graphic | 5.72 → 8.59 | — | 1.70 → **7.21** | — | error tint over the row (surface-2) |
| rating filled / half star | graphic | 2.25 → **6.02** | 2.15 → 5.76 | 7.65 | 6.34 | background, surface-2 |
| log level info / warn / error | text | 6.17 → 10.15 / 2.06 → **5.50** / 6.71 → 10.07 | 5.60 → 9.22 (hover) | 10.64 / 9.84 → 6.26 / 8.52 | 9.51 (hover) | line tint .12 over the surface |
| log level, terminal variant (r1): debug / info / warn / error | text | 2.81 → 5.81 / 2.65 → 7.78 / 6.43 → 11.43 / 1.70 → 6.19 | — | 6.36 → 5.81 / 10.10 → 7.78 / 10.11 → 11.43 / 7.21 → 6.19 | — | terminal `#1e1e2e`, warn line + rgba(249,226,175,.05), error line + rgba(243,139,168,.08); same in both themes after the fix |
| log pill warn / error at rest (D-2) | text | 1.53 → 5.25 / 3.27 → 8.95 | — | 4.62 → **5.55** / 3.92 → 8.37 | — | tint .18 over the toolbar (surface); old at 60 % |
| log pill warn / error pressed, and its ring | text, state | 1.96 → 5.25 / 5.96 → 8.95 | — | 8.72 → 5.55 / 8.37 | — | same |
| diff stat add / del | text | 2.60 → 5.06 / 8.02 → 12.04 | — | 9.54 → 6.97 / 7.21 | — | surface-2 header |
| diff prefix + / − (D-3) | glyph | 1.81 → **3.52** / 4.22 → 6.33 | — | 8.55 → 6.24 / 8.37 | — | the line's `--color-<v>-50` |
| dependency edge, arrow, edge label, legend: success / warning / error / info | graphic; label text | 2.72 → 5.29 / 2.25 → 6.02 / 8.39 → 12.58 / 6.17 → 10.15 | 2.60 → 5.06 / 2.15 → 5.76 / 8.02 → 12.04 / 5.90 → 9.71 | 11.5 → 8.4 / 12.01 → 7.65 / 8.68 / 10.64 | 9.54 → 6.97 / 9.97 → 6.34 / 7.21 / 8.83 | label halo = surface; legend on surface-2 |
| dependency node border success / warning / error | boundary | 2.72 → 5.29 / 2.25 → 6.02 / 8.39 → 12.58 | 1.81 → **3.52** / 1.57 → 4.19 / 4.22 → 6.33 | 11.5 → 8.4 / 12.01 → 7.65 / 8.68 | 8.55 → 6.24 / 8.72 → 5.55 / 8.37 | against its own node fill |
| dependency detail dot | graphic | 2.60 → 5.06 / 2.15 → 5.76 / 8.02 → 12.04 | — | 9.54 → 6.97 / 9.97 → 6.34 / 7.21 | — | detail panel (surface-2) |
| kanban priority icon low / high / critical / medium | icon | 2.72 → 5.29 / 2.25 → 6.02 / 8.39 → 12.58 / 6.17 → 10.15 | — | 11.5 → 8.4 / 12.01 → 7.65 / 8.68 / 10.64 | — | card surface |
| kanban limit over | text | 4.22 → **6.33** | — | 9.01 → 9.01 | 8.37 | over-limit column (`--color-error-50`) |
| progress fill success / warning / error / info vs track | graphic | 2.47 → 4.81 / 2.05 → 5.47 / 7.62 → 11.43 / 5.60 → 9.22 | same | 5.67 → 7.51 / 6.83 / 1.83 → **7.76** / 2.50 → **9.51** | 4.65 → 6.15 / 5.60 / 1.50 → 6.37 / 2.05 → 7.80 | track over background, surface-2 |

- **New minimum per theme:** text 4.85 L (card success chip) and 4.60 D (NC high on the panel top, card warning on surface-2); graphics 3.52 L (diff `+`, dependency success border) and 4.83 D (NC warning icon).
- **Dark moves the other way in places:** where `-default` (the light step in dark) was used, the ink is a little darker (warning `#f1d3a7` → `#e1a040`, success `#cdd6c2` → `#a9bb93`): NC icons, log warn level, diff add, dependency, kanban. All stay ≥ 4.83 (graphics) and ≥ 6.24 (text). The changelog must say so (AC-16).
- **Track (AC-10):** unchanged (`--color-surface-hover`, 1.10 on the surface): the fill moves, not the track. Primary 3.96 L / 3.53 D and secondary stay raw.
- **Residual, not fixable with an existing token (follow-up F-1):** the NC high chip on an **unread** row in dark is 4.26 (surface end) to **3.67** (surface-2 end), before and after: the dark warning ink equals the old fill (`#e1a040`). AC-1 holds on the read rows and the spec's basis (5.55 / 4.60).
- **New tokens:** none. `_theme-*.scss` and `tokens.json` unchanged (AC-11).

## 6. Accessibility

- **Semantics:** unchanged. NC type icons stay `decorative`; kanban priority icons keep their `ariaLabel` ("Priority high"); the status meaning stays in text (priority labels, chip text, log level words, relation labels, pipeline icons per status, "+"/"−") as before, nothing becomes colour-only (AC-13). D-2 keeps `aria-pressed`; the ring only adds a visual cue.
- **Forced colours:** no `forced-color-adjust` is added. The UA forces `color`, `border-color`, backgrounds and SVG paints as before, so value changes are invisible there. Two rules matter: the progress fill stays `Highlight` (existing 3.17 rule), and the pressed log pill gets the NC outline (2 px `Highlight`, offset 1), because forced colours drop `box-shadow`.
- **Keyboard, targets, motion:** unchanged (no new control; the pills' 15 px height is pre-existing, F-5). Status-dot pulse already off under reduced motion.

## 7. Texts

No built-in strings change. Story and docs text:

| Where | Text (EN only; stories are English) |
|---|---|
| `money.stories.ts` Number Column `docs.description.story`, appended after the `formatMoney(...).text` sentence (AC-12) | `' That string has no spoken text, so the unit is then only in the column header; prefer `lc-money` in a cell template, as in this story.'` |
| `src/docs/colors.mdx`, "Ink on the status tints", after the 3.20 sentence | "Since 3.21.1 the status foregrounds of lc-notification-center, lc-card, lc-markdown, lc-status-dot, lc-pipeline, lc-file-upload, lc-rating, lc-log-viewer, lc-diff-viewer, lc-dependency-viewer, lc-kanban-board and lc-progress-bar use these inks too, and the card and notification chips sit on the matching `--color-*-subtle` tint." |
| `CHANGELOG.md` (AC-16) | Fixed: one line per component with the §5 base values old → new and the pressed-pill change (D-2) and the terminal levels (r1: own palette in both themes, values of §5); Compatibility: no API break, selectors unchanged, shared fills unchanged; status text and icons get darker in light and, where the light step was used, slightly darker but still ≥ 4.83:1 in dark; chip backgrounds in light are the `--color-*-subtle` tokens |

## 8. Stories

No new stories (no new input, slot or variant). Review surfaces (`--full`, 360/1024/1280, light/dark):

| Story ID | Shows | AC |
|---|---|---|
| `feedback-notification-center--with-priority`, `--default`, `--errors-only` | priority chips (urgent unread, high read), type icons | 1, 4 |
| `components-card--default` with args `badge: 'Aktiv'`, `badgeVariant: success / warning / error` (via `updateStoryArgs`; no story shows these chips at rest); `components-card--with-badge` (error chip at rest, 1024/1280) | chips | 2 |
| `components-markdown--mermaid-support` | the diagram renders, so no error at rest: append `<p class="lc-markdown__mermaid-error">` to `.lc-markdown` (encapsulation None) and read it | 3 |
| `data-display-status-dot--all-tones`, `--in-list-rows` | dots | 5 |
| `components-pipeline--all-statuses`, `--horizontal`, `--vertical`, `--compact` | warning, error, complete nodes | 6 |
| `form-file-upload--default` | × hover: resolve the `:hover` rule on a fresh probe | 7 |
| `form-rating--default`, `--half-stars` | no story sets a value: click the 4th star, then read the filled and half stars | 8 |
| `data-display-logviewer--default`, `--terminal`; `data-display-diff-viewer--inline`, `--side-by-side`; `data-display-dependency-viewer--complex-relationships`, `--layered-with-relations`; `data-display-kanban-board--with-wip-overflow`, `--default` | levels, pills at rest; pressed pill only after a click on `.lc-log-viewer__level-pill--error` (no story presses one; `--errors-only` doesn't); diff stats and prefixes; edges, labels, legend, node borders; priority icons, limit | 9, 13 |
| `feedback-progress-bar--colors`, `--circular`, `--circular-sizes` | fills vs track | 10 |
| `data-display-money--number-column` | render unchanged | 12 |

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1–10 | New `describe('Component pairings of 3.21.1 (request 029)')` in `theme-contrast.spec.ts`, built like the 027 block: compile the 9 SCSS files; (1) each §2 rule body has the ink (exact `var(--color-on-<v>-subtle)`), no `#hex`/`rgba` in the changed colour declarations, the NC/card chip backgrounds are `var(--color-<v>-subtle)`; (2) per palette, the §5 minima over the "min bases": text `toBeCloseTo([4.85, 4.60][i], 2)` and ≥ 4.5 (NC chips on unread rows excluded and asserted as the known `[5.52, 3.67][i]`, F-1), graphics `toBeCloseTo([3.52, 4.83][i], 2)` and ≥ 3; (3) a source check that `kanban-board.component.ts`, `dependency-viewer.component.{ts,html}` contain no `--color-(success|warning|error|info)-default` | all green |
| 1–10 | `story-shots` on the §8 stories, 360 and 1280, L/D, `--measure` reading the computed colour of each element and compositing its real ancestors | the rgb values of §1 (L `95,113,80` · `133,90,34` · `107,9,9` · `39,68,92`; D `169,187,147` · `225,160,64` · `247,161,161` · `184,206,224`), ratios within 0.02 of §5 |
| 9 (r1) | `theme-contrast.spec.ts` 029 block: the compiled log-viewer sheet has `.lc-log-viewer--terminal .lc-log-viewer__line--<lv> .lc-log-viewer__level` with the four hex values and no selector of the shape `.lc-log-viewer__line--<lv> .lc-log-viewer--terminal`; ratios on the three terminal backgrounds. Story: `data-display-logviewer--terminal` 360/1280 L/D, level colours (measure `tmp/story-shots/029/review-terminal-measure.js`, without its injected `<style>`) | `[5.81, 7.78, 11.43, 6.19]` in both themes; log variant unchanged (10.15 / 5.50 / 10.07 L) |
| 4 | grep `notification-center.component.scss` | no `#3b82f6`, `#22c55e`, `#f59e0b`, `#ef4444` |
| 11 | `git diff main -- libs/angular-ui-kit/src/styles/_theme-*.scss libs/angular-ui-kit/tokens.json libs/angular-ui-kit/src/styles/tokens` | empty; `theme-contrast.spec.ts` green |
| 12 | text in `money.stories.ts`; `npm run test:tools` | §7 sentence present; manifest test green; Number Column shots identical (6) |
| 13 | `--forced-colors` run on the §8 stories at 360 L/D, plus grep | no new `forced-color-adjust`; pressed pill outline `Highlight` 2 px; progress fill `Highlight` |
| 14 | full Jest run; `check-angular-majors` | all pass; only `log-viewer.component.spec.ts` l. 490 and 492 change (`--color-info-default` / `--color-error-default` → `--color-on-info-subtle` / `--color-on-error-subtle`; reason: AC-9 swap). l. 491 still holds (search highlight) |
| 15 | re-shoot the 90 baseline stories (lists in `tmp/029/baseline-{a,b,c}.log`) `--full --compare=tmp/story-shots/029/baseline` | **265 different / 275 identical** (r1; the prototype's 271 included Streaming, whose measure waited for the first line). Different: status-dot all-tones, in-list-rows; card with-badge (1024/1280 only); NC default, with-priority, grouped-by-category, all-read, compact, errors-only (light only); pipeline ×4; 6 log-viewer stories, all but Streaming (their timestamps use `Date.now()`, so they differ on every run: check them by measure); diff-viewer ×5; kanban default, with-wip-overflow; progress colors, inline-in-list-rows; 17 dependency-viewer stories. Identical: the other 15 card stories, with-badge at 360 (the colour applies, measured `rgb(107,9,9)` on `rgb(251,236,236)`, but the shot doesn't change), status-dot default, NC empty, mermaid-support, file-upload ×4, rating ×7, kanban simple/readonly, the 6 other progress stories, number-column, dependency single-node, free-form-relation-labels, typed-nodes, capped-neighbourhood, cyclic-graph, layered-cycle. Boxes of the changed elements unchanged (`getBoundingClientRect`) |
| 16 | changelog review | §7 row, §5 base values, D-1 and D-2 named, F-1 named as known |

**Follow-ups (not in this request):** F-1 a dark warning text ink for teal-selected rows (NC unread high 3.67); F-2 `lc-progress-ring` uses `--color-<v>-default` (light success 2.47, warning 2.05 vs its track); F-3 diff line numbers (`--color-text-tertiary`) on the added line, 3.88 L; F-4 card `--primary` chip text 3.12 L (selected) to 3.57; F-5 log pills are 15 px high (target size); F-6 dependency `uses` (`--color-neutral-300`) and `extends` (`--color-primary-400`) edge labels are faint text in light.

**Prototype shots looked at** (`tmp/story-shots/029/proto`): NC with-priority 360 L/D, log-viewer default 1280 L, pipeline all-statuses 1280 D, dependency complex-relationships 1280 L, progress colors 1280 L, diff inline 1280 L, kanban with-wip-overflow 1280 L. The inks read as the darker (light) or lighter (dark) step of each hue next to the unchanged fills and rails; nothing moved.
