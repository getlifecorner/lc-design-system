# Design 043: Targets, hover borders and contrast follow-ups of 042

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-15
- **Semver:** patch (3.27.1). No input, output, slot, hook or type changes. Prototyped by CSS injection on 87 baseline stories (§9).

## 1. Approach

Fixes in existing components, with the kit's own patterns: the `::before` hit area of file-upload remove (042 F-21) and pagination (024), `mix.focus-ring` rings (unchanged), the fill/on-fill pair `--color-primary-fill` + `--color-on-primary` (NC filter chips, 025) and the subtle ink `--color-on-primary-subtle` (029).

| ID | Decision | Why (measured, 3.27.0) |
|---|---|---|
| D-1 | **Hit area, look unchanged** (`::before`, transparent) where a centred 44 × 44 area fits beside every neighbour: NC actions and chips, log pills, callout ×, chat send/attach, table checkbox | Neighbours ≥ 2 px clear (§3); file-upload precedent |
| D-2 | **Real 44 × 44** where the pitch leaves no room: RTE toolbar buttons (32, 2 px apart, rows 2 px apart) and mode buttons (26 high, own row 4 px under the actions at 360); doc-viewer buttons (32, 2–4 px apart) | A hit area would overlap the neighbour |
| D-3 | **Documented exception (WCAG 2.5.8 met by size, 24 × 24 hit area)** for the select × and the tag-input ×; spec Decisions row "remove x" allows it | Select: a 44 px area is taller than the md field (40), leaves xs/sm fields by 10/6 px and covers 8 px of the chevron, which opens the list. Tag: chip rows are 29.6 px apart and the text input starts 12 px after the last × (`form-tag-input--keyboard-focus`), so 44 overlaps the input and the row below |
| D-4 | Spec deviation: NC, chat use D-1 instead of `min-*-size` | Same AC-1 result without a visible change; NC chips need only 1 px more row padding (§3) |
| D-5 | **F-23:** every field hover rule that sets `border-color` gets `:not(<error class>)`; outline hover of textarea and datepicker becomes `--color-text-secondary` (lc-input/select pattern) | Hover 1.89 L (primary-400) → 7.55; error borders 8.39 L / 9.47 D on hover too |
| D-6 | **F-24:** RTE frame `border: 1px solid var(--color-field-border)` (lc-input's token) | 1.23 L / 1.29 D → 4.83 / 7.31 |
| D-7 | **F-25 theme scope:** the theme files emit their colour tokens a second time on `.lc-header--light` / `.lc-header--dark` | Themes are `:root`-only; derived tokens (`--color-primary: var(--color-primary-500)`) resolve at the root, so only a full re-declaration makes children match the other theme. 172 declarations per theme; +0.2 kB gzip global CSS in the build (r1: the prototype's 2.46 kB was the block compressed on its own). A curated subset (138) is fragile |
| D-8 | **F-26 inks:** RTE mode `.active` and gallery `--active` → fill pair; tag chip text and chat monogram → `--color-on-primary-subtle` (dark value = today's, so dark is unchanged); gallery hover ink → `--color-link` | §5 |
| D-9 | **F-26 log scroll region:** the tab stop moves from the log-viewer root to `.lc-log-viewer__content` (`tabindex="0"` unless `clickableLines`); `(keydown)` shortcuts stay on the root (bubbling) | Arrow/Page keys now scroll the output; still one tab stop; axe `scrollable-region-focusable` passes |
| D-10 | **F-27:** over-limit column `background: var(--color-error-subtle)` | Title 3.80 → 6.58 L; dark is the same colour (11.57 measured on the canvas, not the spec's 5.42) |
| D-11 | AC-11 done in this step: `requests/042-…/release.md` line 43 now names the four index IDs | Checked against `tmp/043/all-ids.txt` (index.json) |

## 2. Public API

No change. Implementation notes that touch markup or global CSS (not API):

| Where | Change |
|---|---|
| `table.component.html` (2 checkboxes) | wrap each `input.lc-table__checkbox` in `<label class="lc-table__select-hit" (click)="$event.stopPropagation()">`; the input keeps its `aria-label`, `(change)`, `(click)` |
| `log-viewer.component.html` | root `div`: drop `tabindex="0"`, keep `(keydown)`; `.lc-log-viewer__content`: `[attr.tabindex]="clickableLines() ? null : 0"` (role `log` + `aria-label` stay) |
| `_theme-light.scss` / `_theme-dark.scss` | move every `--color-*`, `--gradient-*`, `--shadow-*`, `--elevation-*`, `--accent-line`, `--app-background-image` declaration into a private mixin (`-light-theme-colors`, `-dark-theme-colors`, the latter included by `dark-theme-tokens`); root rules emit the same declarations; add `.lc-header--light { @include -light-theme-colors; }` and `.lc-header--dark { @include -dark-theme-colors; }` with a comment (F-25). Existing `theme-modes.spec.ts` / `theme-contrast.spec.ts` assertions stay unedited; new ones per §9 AC-6/7 |

Default rendering: unchanged except the rows of §9 (AC-2/AC-15 growth and the AC-5/8/10 colour fixes), proved by the prototype compare.

## 3. Anatomy and layout

Hit-area CSS (all `position: relative` on the control, `::before { content: ''; position: absolute; … }`, no paint, `pointer-events` inherited):

| Control | Box today | Rule | Hit area / room (360 = 1280) |
|---|---|---|---|
| NC `__action-btn` | 90.6 / 62.9 × 26, 8 apart | `inset-inline: min(0px, calc((100% - var(--size-min-touch-height, 2.75rem)) / 2)); top/bottom: calc(50% - 1.375rem)` | 44 high, header padding 12 ≥ 9 |
| NC `__filter` | 42.2–86 × 26.5, 4 apart | same; `.lc-nc__filters { padding-block: 9px }` (was 8) | 44 high = chip ± 8.75 inside the scroll box; DE "Alle" 42.2 → hit 44 wide; row 43.5 → 45.5 |
| log `__level-pill` | 57–86 × 15 (26 when the DE label wraps), 4 apart | `inset-inline: min(-0.125rem, calc((100% - 2.75rem) / 2)); top/bottom: calc(50% - 1.375rem)`; `.lc-log-viewer__toolbar { padding-block: 0.5rem }` (was 0.375) | toolbar 41 → 45; hit 44 high inside it, pills touch, line count not a target |
| callout `__dismiss` | 24, padding 14 / 16 | `inset: calc((1.5rem - 2.75rem) / 2)` (−10) | 44, 4 px from the callout top, 6 px from its end |
| select `__clear` | 20, chevron 4 px right | **r1:** no `::before`; the box itself is 24: `width/height: 1.5rem; margin: -0.125rem; padding: 0.125rem; background-clip: content-box; border-radius: calc(var(--border-radius-sm) + 0.125rem)`, `mix.focus-ring($offset: 0)` (axe reads the box; layout, hover fill and ring unchanged) | 24 × 24, 2 px clear of the chevron, inside xs–lg fields |
| tag-input `__tag-remove` | 16 in a 25.6 chip (padding 8) | `inset: -0.25rem` | 24 × 24 inside the chip (0.8 px from its top, **r2:** 5 px from its outer end: padding 8 + border 1 − 4); input 13 px after the × (area 9) |
| chat `__send-btn` / `__attach-btn` | 32, composer padding 8, input 8 above | `inset: -0.375rem` | 44, 2 px clear of the input |
| table checkbox | 16 in a 40-px cell (32 at 360, squeezed) | `.lc-table__select-cell { position: relative; width: 2.75rem; padding: var(--spacing-2) calc((2.75rem - 1rem) / 2) !important }`; `.lc-table__select-hit { cursor: pointer; &::before { inset: 0 } }`, **inline** (r1; the cell is its containing block); `.lc-table__checkbox { position: relative }` (above the overlay) | 44 × row height: md 44 × 45.5 net, sm 44 × 37 (2.5.8 by size, §6); column 44 at every width |

Real-size controls (D-2): RTE `__toolbar-btn` `width/height: var(--size-min-touch-height, 2.75rem)`; `__mode-btn` `min-width/min-height` the same; doc-viewer `__btn` 44 × 44 plus wrap.

### 360 px

```
RTE default (14 actions)                      Doc viewer, image (5 tools), DE name
┌ frame 1px field-border ──────────────┐     ┌ toolbar pad 8/12, gap 12 ──────────────┐
│8 [B][I][U][S][H1][H2]  44, gap 2      │     │ [▣] Kostenstellen-Übersicht-2026.png Bild│ row 1: name 210.9 (today 0 px)
│  [H3][•][1.]["][<>][{}] pitch 46      │     │ [−] 100 % [+] [⤢] │ [↓] [⛶]   (299, end) │ row 2
│  [🔗][—]                              │     └──────────────────────────────────────────┘ 49 → 95
│ │[Rich■][MD][Split]  44 high          │      320: [⛶] wraps inside the group → 143, no overflow
└──────────────────────────────────────┘      1 tool (markdown, code, text): one row 61
 toolbar 113 → 201 (DE modes 220 wide fit at 320)
NC 360: header 51 (EN) / 75 (DE, actions on row 2) · filters 45.5 · chips scroll as today (EN 74 px)
Log 360: toolbar 45 · Table 360: select column 44, checkbox x = cell + 14
```

### From 1024 px (1280 the same)

```
RTE  [B][I] … 14 × 44 …                                  │[Rich■][MD][Split]   toolbar 49 → 61
Doc  [▣] name  Bild ……………………… [−] 100 % [+] [⤢] │ [↓] [⛶]                 toolbar 49 → 61, one row
     doc toolbar: flex-wrap: wrap; left flex: 1 1 10rem; right margin-inline-start: auto,
     flex-wrap: wrap, justify-content: flex-end, row-gap: var(--spacing-1), flex-shrink: 1, min-width: 0
```

| Element | Spacing / size | Token |
|---|---|---|
| Touch size | 44 | `--size-min-touch-height` (2.75rem, both themes) |
| NC filters padding-block | 9 px (raw px like the file's 8/12/16) | — |
| Log toolbar padding-block | 8 | `0.5rem` |
| Doc tool group row gap / wrap basis | 4 / 160 | `--spacing-1` / `10rem` |

## 4. States

| State | Rule |
|---|---|
| Rest | §3; hit areas invisible; NC/log/RTE/doc/table grow as listed |
| Hover | field borders (§5): outline/default variants → `--color-text-secondary`; `--filled` keeps its fill change (its border goes transparent → `--color-border`, never lower than rest); error fields: no hover change at all (`:not(.input-invalid / .lc-select--error / .lc-textarea--error / .lc-datepicker--error)` on base and filled hover rules); gallery inactive chip ink `--color-link`, active chip `--color-primary-fill-hover` |
| Focus-visible | unchanged rings (042), drawn round the visible control, not the hit area; log output region: new inset ring `outline: 2px solid var(--color-primary-500); outline-offset: -2px` (root clips) |
| Active / pressed | RTE mode `.active` and gallery `--active`: fill pair; NC/log pressed unchanged |
| Disabled / readonly | RTE disabled (opacity .6, `pointer-events: none`) also blocks the bigger buttons; select × absent when disabled |
| Error | border and message colours equal rest under hover (AC-4) |
| Overflow | DE: NC actions wrap to row 2 (360) and to 2-line labels 44 high (320); chips scroll; log pills wrap to 26 high; RTE DE modes fit at 320; doc name ellipsizes in row 1; table column fixed 44 |
| Header scope | everything inside `theme="light"` / `"dark"` (slot content, theme toggle, account menu panel) takes that theme's tokens |

## 5. Theming (computed, WCAG formula; L / D)

| Element | Before | After |
|---|---|---|
| Field hover border (textarea, datepicker) vs page | 1.89 / 4.31 (primary-400) | 7.55 / 12.16 (text-secondary), 7.23 / 9.25 vs surface-2 |
| Error border on hover (4 fields) | 7.55 or 1.89 / 12.16 or 4.31 | 8.39 / 9.47 (= rest) |
| RTE frame vs page / surface | 1.23 / 1.29 | 4.83 / 7.31 · 4.83 / 6.70 |
| RTE mode `.active` / gallery `--active` text | 4.36 / 1.89 (white on primary) | 6.21 / 6.21; gallery hover-on-active 9.13; rim primary-500 4.36 / 9.95 |
| Gallery inactive hover ink vs page | 4.36 / 9.95 | 6.21 / 11.78 (`--color-link`) |
| Chat monogram on its 18 % tint | 3.34 / 5.11 | 7.00 / 5.11 |
| Tag chip text on its .16 tint (surface-2) · × glyph at rest (opacity .7) | 3.43 / 6.34 · 2.29 / 3.96 | 7.18 / 6.34 · 3.59 / 3.96; × hover 5.76 / 5.18 |
| Kanban over-limit title / limit / count | 3.80 / 6.33 / 6.86 L | 6.58 / 10.97 / 6.86 L; dark 11.57 / 9.01 / 10.49 unchanged |
| `theme="light"` header on a dark page: primary / outline / link button text | 6.21 / 1.05 / 1.59 | 6.21 / 17.12 / 6.21 (= light page) |
| `theme="dark"` header on a light page: primary / outline / link · header ring | 6.21 / 1.00 / 3.12 · 4.44 | 6.21 / 16.32 / 12.13 (= dark page) · 10.25 |
| Rings on the grown controls (surface) | 4.36 / 9.12 | unchanged; new log output inset ring 4.36 / 9.12 (surface), 3.75 / 8.67 (terminal `#1e1e2e`) |

No new tokens.

## 6. Accessibility

- **Targets (AC-1):** 44 × 44 for every F-22 control except select × and tag × (24 × 24, WCAG 2.5.8 by size; D-3) and the checkbox in a `size="sm"` table (cell 44 × 37: the row is the consumer's density choice; 2.5.8 by size, documented in the story and changelog; r1). Chat `__pending-remove` (20) was not in F-22: follow-up **F-28**.
- **Keyboard:** tab order unchanged except D-9: the log viewer's single stop moves from the whole viewer (first) to its output region (after toolbar, pills and search). `/`, `g`, `G` work from any control inside. Table: label click never reaches a clickable row.
- **Names:** unchanged (table checkboxes keep `aria-label`; the label element adds no text). Log output: `role="log"`, `outputAriaLabel`.
- **Forced colours:** hit areas paint nothing; rings stay Highlight (042 rules cover the grown buttons); new log output ring gets `@media (forced-colors: active) { outline-color: Highlight }`. RTE mode `.active` loses its fill there and has no `aria-pressed` (pre-existing): follow-up **F-29**.
- **Reduced motion:** no transition added. **Prerender:** CSS and static attributes only (AC-14).

## 7. Texts (stories only; no new built-in strings)

| Story | DE strings (every visible built-in string) |
|---|---|
| NC *Touch Targets* | title Benachrichtigungen · Alle als gelesen markieren · Alle löschen · Benachrichtigungen durchsuchen … · Alle · Fehler · Warnung · Erfolg · Info · Gerade eben · vor {n} Min. · vor {n} Std. · vor {n} T. · Keine Benachrichtigungen · dismiss „Benachrichtigung schließen:“ |
| Log *Touch Targets* | Fehler · Warnungen · Zeilen · Pausieren / Fortsetzen · Leeren · Alles kopieren · Suchen (/) · Protokoll durchsuchen · Protokoll durchsuchen … · Protokollausgabe · Zum Ende springen |
| RTE *Touch Targets* | Formatiert · Markdown · Geteilt (titles Formatierter Text · Markdown · Geteilte Ansicht) · Wörter · Zeichen · placeholder „Notiz schreiben …“ · `actionTitles` Fett, Kursiv, Unterstrichen, Durchgestrichen, Überschrift 1–3, Aufzählung, Nummerierung, Zitat, Code, Codeblock, Link, Trennlinie |
| Doc *Touch Targets* | Kostenstellen-Übersicht-2026.png · Bild · Verkleinern · Vergrößern · Zoom zurücksetzen · Herunterladen · Vollbild |
| Tag *Touch Targets* | label Schlagwörter · Schlagwort hinzufügen … · Entfernen · tags Kostenstellenverantwortung, Budget, Freigabe, Reisekosten, Personal, Quartal |

## 8. Stories

All new stories: fixed local dates (`new Date(2026, 10, 3, 9, 15)`), no `Date.now()` in rendered times except NC offsets (`Date.now() - n * 60000`, labels stable); description names the hit area and the measured value.

| Story | Expected ID | Args / setup | Shows |
|---|---|---|---|
| NC: Touch Targets (DE) | `feedback-notification-center--touch-targets` | §7 labels, 5 items incl. error/warning | actions + chips hit 44, filters 45.5 |
| Log: Touch Targets (DE) | `data-display-logviewer--touch-targets` | §7 labels, 30 fixed lines with 3 errors / 5 warnings | toolbar 45, pills hit 44 |
| Log: Output Region Focus | `data-display-logviewer--output-region-focus` | play focuses `.lc-log-viewer__content` | inset ring, tab stop (AC-9) |
| Callout: Touch Targets | `feedback-callout--touch-targets` | error with title + neutral without title, both dismissible | × hit 44 |
| Select: Touch Targets | `form-select--touch-targets` | xs/sm/md/lg, clearable, value set, 16 px apart | × 24 inside each field |
| Tag input: Touch Targets (DE) | `form-tag-input--touch-targets` | §7, 6 tags → **3 rows at 360 (r2; field 328 × 98.8)**, 1 row from 1024 | × 24, no overlap with the next row or the input |
| RTE: Touch Targets (DE) | `editors-rich-text-editor--touch-targets` | §7 | 44 buttons, toolbar 201 (360) / 61, frame border |
| Doc viewer: Touch Targets (DE) | `data-display-document-viewer--touch-targets` | `type: 'image'`, inline SVG `data:` src (stable), §7 | 44 tools, wrap at 360/320, name visible |
| Chat: Touch Targets | `components-chat--touch-targets` | attachments on, 2 fixed-time messages with monogram | send/attach hit 44, monogram ink |
| Table: Touch Targets | `data-display-table--touch-targets` | `selectable`, md table + `size="sm"` table, 4 rows | column 44, cell-wide hit |
| Header: Theme Scope | `navigation-header--theme-scope` | two `[sticky]="false"` headers, `theme="light"` then `theme="dark"`, each with `[slot='end']` lc-button primary „Anmelden“, outline „Registrieren“, `a lcButton variant="link"` „Hilfe“, `showThemeButton` | AC-6 (dark shots) and AC-7 (light shots) |
| Input: Error State on Hover | `form-input--error-state-on-hover` | lc-input, lc-select, lc-textarea, lc-datepicker, each `error` set, EN | AC-4 surface (hover forced in the measure) |

## 9. Verification

Baseline: `tmp/story-shots/043/baseline` = 87 stories (`baseline-ids.txt`, sweep `sweep-list.txt`), 360/1024/1280 L/D, 522 shots, measure `baseline-measure.js` (1 s wait), main 7297430. Prototype (`proto-all.js`, all CSS above + header scope) `--compare`: **174 differ** = RTE all 10 stories ×6 (60), doc viewer markdown/code/text/unsupported/error-state/keyboard-focus ×6 (36), NC with filters 8 stories ×6 (48; `--compact` identical), table with-selection/keyboard-focus ×6 (12), gallery with-categories/keyboard-focus ×6 (12), kanban with-wip-overflow light ×3, tag-input keyboard-focus light ×3; **275 identical** (callout, select, filter bar, table pagination/number-columns, all field stories, header dark-theme/light-theme-explicit, chat empty, page-layout chat, NC compact); **73 unstable** (12 chat stories with clock times ×6, doc no-toolbar 1024 L; control run `control.log`). Log-viewer stories are not in the baseline (`Date.now()`).

| AC | How | Expected |
|---|---|---|
| AC-1 | hit measure (`proto-measure.js` without injection) on the 10 *Touch Targets* stories + NC/log/RTE/doc/chat/table/callout existing stories, 360/1024/1280 L, DE stories too: `elementFromPoint` centre ± 21.5 = control, ± 23 ≠ (table: ± 21, collapsed cell edges; select/tag: ± 11 in, ± 13 out) | all pass; neighbours: none hit inside another's area |
| AC-2 | at-rest `--compare=043/baseline` | exactly the 174 above differ, 275 identical; `scrollWidth − clientWidth` 0 on NC header, log/RTE/doc toolbars at 320/360 (NC filters scroll as today) |
| AC-3 / AC-4 | `042/hover-measure.js` L/D | outline hover 7.55 / 12.16; every error row rest = hover = 8.39 / 9.47, message colour equal |
| AC-5 | measure + spec: RTE `.lc-rich-text-editor` rule reads `var(--color-field-border)`; field-border vs surface ≥ 3 both themes | 4.83 / 6.70 |
| AC-6 / AC-7 | *Theme Scope* L/D: computed `color`/`background`/`border` of the 3 slot controls and the toggle per header equal the same header's values in the page theme it names; `theme-modes.spec.ts`: `.lc-header--light` colour tokens = `:root,` colour tokens, `.lc-header--dark` = `:root.dark,` | §5 rows |
| AC-8 | `--axe` on gallery/RTE/chat/tag/kanban/log stories + new stories, 360/1280 L/D | 0 violations beyond the 3 isolated-story rules |
| AC-9 | unit: content `tabindex` 0 / null with `clickableLines`, root without `tabindex`, role + name; measure on *Output Region Focus*: `:focus-visible`, ring 4.36 / 9.12 (terminal 3.75 / 8.67); `--axe` 0 `scrollable-region-focusable` | pass |
| AC-10 | kanban measure on *With WIP Overflow* + *Keyboard Focus* | 6.58 L / 11.57 D; inset card ring 4.36 / 9.12 |
| AC-11 | grep | done (D-11) |
| AC-12 | API diff empty; AC-2 compare | as AC-2 (the AC-2 growth rows join the spec's AC-5/8/10 exceptions) |
| AC-13 | 042 `r1-new-measure.js` on the *Keyboard Focus* stories + `--forced-colors` | rings unchanged, Highlight; tab order as §6 |
| AC-14 | compat prerender check | unchanged expectations |
| AC-15 | CHANGELOG 3.27.1: Fixed F-22 (per control, §3), F-23, F-24, F-25, F-26, F-27 with §5 values; Compatibility: RTE toolbar +88 px at 360 / +12 px from 1024 (14 actions), doc toolbar +12 (wraps at 360 with zoom), NC filters +2, log toolbar +4, table selection column 44; log tab stop moved (D-9); themed header re-declares the colour tokens (root-level token overrides don't reach inside a themed header; its account menu follows the header theme); +0.2 kB gzip global CSS; sm table checkbox area 44 × 37 (2.5.8 by size) | — |

**Change notes (review r1, 2026-11-03):** §3 table: my `inline-flex; vertical-align: middle` was never in the prototype (no label there) and was wrong: it moves the box 4.3 px down, past the middle, and shrinks `sm` rows 38 → 35 (`flex` centring too, even with `min-block-size: 1lh`); the inline label keeps the 3.27.0 box position and row heights (Deviation 1 agreed). §3 select: 24 px box instead of the `::before` (Finding A; prototype `r1-select2`: rest and ring hash-identical, axe 0). §6: sm table exception (Finding B). D-7/AC-15: gzip cost corrected.

**Change notes (review r2, 2026-11-03):** §8 tag story: my "2 rows at 360" ignored the chip's `max-width: 150px` and 1 px border; measured 3 rows (y 48 / 77.6 / 107.2, field 98.8 high), which tests two row boundaries instead of one, so accepted. §3 tag row: the area ends 5 px (not 4) before the chip's outer edge, and the input starts 13 px after the × (9 after its area).

**Risks (my pitfalls):** `min-inline-size` on a nowrap flex chip removed its auto minimum and squeezed text (prototype; use the `min()` inset instead); `<input>` has no `::before`; story times must be fixed; prototype rules needed ×3 classes. **Follow-ups:** F-28 chat pending-remove 20 px; F-29 RTE mode buttons: `aria-pressed` and a forced-colours pressed mark.
