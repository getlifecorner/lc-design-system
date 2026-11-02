# Design 036: Description-list contrast and targets, 033 story and comment fixes, 034 status-ink follow-ups

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-17. Measured on main c21feeb (3.23.0), fresh Storybook build. Measures: `tmp/story-shots/036/{grid-measure,state-measure,toolbar-measure}.js`.
- **Change (review r1, 2026-11-02):** §7 assumed the NC header still fits once the story is German. It doesn't: at 360 "Alle löschen" is clipped by 13 px (54 at 320). §2 now adds a header wrap rule, and §7 and §9 give its values (prototype `tmp/story-shots/036/r1-nc-proto2`).

## 1. Approach

Extend only; no input, output, slot or class changes. Each fix reuses a kit pattern:

| Item | Fix | Pattern followed |
|---|---|---|
| A dl link / primary (BA-10, AC-1) | link → `--color-link` (hover `--color-link-hover`), `primary` value → `--color-on-primary-subtle` | kit link token (`.btn-inline`, alert links); primary ink as 034 `extends` and the card chip |
| A dl focus (AC-2) | `@include mix.focus-ring` (2 px `--color-primary-500`, offset 2) + forced-colours `outline-color: Highlight` | `_mixins.scss` focus ring; lc-list forced-colours block |
| A dl targets (AC-3) | clickable rows in `rows` layout pad to `--size-min-touch-height` with `1lh` | header 44 px rule (`--size-min-touch-height`) |
| B/C card story, dl comment (AC-5, 6) | import `DescriptionListComponent` in card meta; footer link → `a[lcButton]` flush; reword `&__term` comment | preview already imports Button/ButtonLink globally (`.storybook/preview.ts` l. 82–83) |
| F-8 NC (AC-7) | unread message + time → `--color-text-secondary` | 034 log meta step |
| F-9 dependency (AC-8) | `depends` + layered structural edges → `--color-text-secondary`; tree edges → `--color-field-border` | the old hierarchy stays: tree lines quieter than `depends` (was neutral-300 < neutral-400) |
| F-10 log match (AC-9) | opaque marker: `--color-warning` fill + `--color-on-warning` ink; terminal Mocha Yellow `#f9e2af` + Base `#1e1e2e`; forced colours `Mark` / `MarkText` | find-in-page convention; the kit's fill/on-fill pair ("amber carries dark text"); independent of line tints, hover and ANSI colours |
| F-11 bar, ring (AC-10, 11) | new token `--color-secondary-graphic` for the bar fill and the ring arc | §5: no existing token has light #5a798c and dark #7097af |
| F-12 toolbar (AC-12) | **WCAG 2.5.8 by size**, no layout change; SCSS comment records it | §6 decision table |
| F-13 ANSI gray (AC-13) | Latte `#9ca0b0` → Subtext1 `#5c5f77`; Mocha `#6c7086` → Overlay2 `#9399b2` | the terminal's own Overlay2 step (034) |
| AC-14 NC story | German built-in labels | §7 |

## 2. Public API

| Kind | Name | Type | Default | Description |
|---|---|---|---|---|
| token (new) | `--color-secondary-graphic` | colour | light `$color-secondary-600` #5a798c · dark `$color-secondary-500` #7097af | Secondary data marks (progress fill, ring arc): ≥ 3:1 against the `--color-surface-hover` track and the page in both themes. Not a text colour. Dark goes in the shared dark mixin (emitted twice). |

Semver: the token is additive and optional, like the "minor-free" hook the spec allows; the release-manager confirms patch. No other API change. Declarations (exact; the developer may only reorder for specificity):

| File | Selector / constant | Before | After |
|---|---|---|---|
| `description-list.component.scss` | `@use '../../styles/mixins' as mix;` | — | added |
| 〃 | `&__value--primary` | `color: var(--color-primary-500)` | `color: var(--color-on-primary-subtle)` |
| 〃 | `&__link` / `&__link:hover` | `--color-primary-500` / underline | `var(--color-link)` / `color: var(--color-link-hover)` + underline |
| 〃 | `&__row--clickable:focus-visible` | `outline: none; box-shadow: 0 0 0 3px color-mix(… 20%, transparent)` | `@include mix.focus-ring;` on `&__row--clickable` (no box-shadow) |
| 〃 | end of sheet, new | — | `.lc-dl--rows .lc-dl__row.lc-dl__row--clickable { padding-block: max(var(--spacing-2), calc((var(--size-min-touch-height) - 1lh) / 2)); }` and `.lc-dl--rows.lc-dl--sm .lc-dl__row.lc-dl__row--clickable { padding-block: max(var(--spacing-1), calc((var(--size-min-touch-height) - 1lh) / 2)); }` (0,3,0 / 0,4,0: beat `.lc-dl--sm .lc-dl__row`) |
| 〃 | new | — | `@media (forced-colors: active) { .lc-dl__row--clickable:focus-visible { outline-color: Highlight; } }` |
| 〃 | `&__term` comment | "No browser dd margin (40 px inline start): …" | "No browser margin: the row gap is the only space (BA-8)." (`&__value` keeps the dd wording) |
| `notification-center.component.scss` | new, after `.lc-nc__item-time` | — | `.lc-nc__item--unread .lc-nc__item-message, .lc-nc__item--unread .lc-nc__item-time { color: var(--color-text-secondary); }` |
| 〃 (r1) | `.lc-nc__header` / `.lc-nc__header-actions` | — | add `flex-wrap: wrap; row-gap: var(--spacing-1);` / `margin-inline-start: auto;` with the comment "Long (German) actions move to a second line, end-aligned, instead of being clipped (request 036). No column gap: a header that fits today stays on one line." |
| `dependency-viewer.component.ts` | `RELATION_STYLES.depends.color`; structural edge (l. 1344); tree edges (l. 497, 530) | `neutral-400`; `neutral-400`; `neutral-300` ×2 | `var(--color-text-secondary)`; `var(--color-text-secondary)`; `var(--color-field-border)` ×2. Update the comment above `RELATION_STYLES`. |
| `dependency-viewer.component.html` | `#arrow-default`, `#arrow-depends` path `fill` | `var(--color-neutral-400)` | `var(--color-text-secondary)` |
| `log-viewer.component.scss` | `.lc-log-viewer__match` | `color-mix(… --color-warning-default 45% …)`, `color: inherit`; terminal `#f9e2af40` | `background-color: var(--color-warning); color: var(--color-on-warning);` terminal `background-color: #f9e2af; color: #1e1e2e;` |
| 〃 | new | — | `@media (forced-colors: active) { .lc-log-viewer__match { background-color: Mark; color: MarkText; } }` |
| 〃 | `.ansi-gray` (Mocha) / in `ansi-latte` | `#6c7086` / `#9ca0b0` | `#9399b2` / `#5c5f77` |
| 〃 | `.lc-log-viewer__tool-btn` | — | comment: "28 × 28: WCAG 2.5.8 by size (≥ 24). 44 px pitches need 160 px for four buttons and overflow the 360 px toolbar with German pills by 22 px (request 036, F-12)." |
| `progress-bar.component.scss` | `$progress-colors` `'secondary'` | `colors.$color-secondary-500` | `var(--color-secondary-graphic)` |
| `progress-ring.component.scss` | `&--secondary` | `stroke: var(--color-secondary-600)` | `stroke: var(--color-secondary-graphic)` |
| `card.stories.ts` | meta imports; `FooterSlot` link | Icon, Badge; `<a style="… color: var(--color-primary-500)">` | + `DescriptionListComponent`; `<a lcButton variant="link" size="sm" [flush]="true" href="#" style="--lc-btn-flush-align: end">Details ›</a>`. `lc-button` needs no import (preview). |

Default rendering unchanged for: non-clickable rows (geometry), every non-link non-primary dl value, NC read rows, ring light and bar dark (same hex), `uses`/`extends`/status relations, all ANSI colours but gray, the toolbar, NC headers that fit on one line (r1). `lh` needs Chrome 109 / Safari 16.4 / Firefox 120 (all in Angular 21's browserslist); without it the declaration drops and the row keeps 38 px.

## 3. Anatomy and layout

### 360 px (clickable rows story: canvas 16 + outlined card `padding="lg"`, list 278 wide)

```
┌ lc-card outlined, pad 24 ─────────────────────────── 328 ┐
│ ╭ ring 2 px, offset 2 (row − 4 … row + 4) ─────────────╮ │
│ │ ↕ 11.5                                              │ │
│ │ Bank 14/500 text-secondary       Sparkasse KölnBonn │ │ lh 21
│ │ ↕ 11.5                          ── 1 px divider ─── │ │ = 45 (last 44)
│ ╰─────────────────────────────────────────────────────╯ │
│  Freigabe                          Alle Erwachsenen  ← primary ink
│  sm: lh 18 + 2 × 13 (+1) = 45; stacked md 62, sm 48 (unchanged)
└──────────────────────────────────────────────────────────┘
```

### From 1024 px

Same row geometry (component-level, no breakpoint). Story grid `repeat(auto-fill, minmax(280px, 1fr))`, gap 16: 1 column at 360, 3 at 1024, 4 at 1280.

| Element | Size (measured in prototype) | Type | Token |
|---|---|---|---|
| clickable row, rows md / sm | 45 / 45 (last 44); pad 11.5 / 13; text 11.5 from top | 14 / 12 px, 500 | `--size-min-touch-height`, `1lh`, `--spacing-2/1` |
| clickable row at 200 % | pad 23 / 26 → ≥ 88 (one line) | 28 / 24 px | same |
| non-clickable rows | md 38 / 37, sm 27 / 26, stacked 62 / 48 (= 3.23.0) | — | — |
| focus ring | outline 2 px, offset 2, radius 10 | — | `--color-primary-500` |
| log toolbar (unchanged) | 326 × 41 at 360; buttons 28 × 28; pill hit 40 × (w + 4) | — | — |

## 4. States

| Component | default | hover | focus-visible | other |
|---|---|---|---|---|
| dl link | `--color-link` | `--color-link-hover` + underline | UA ring (unchanged) | — |
| dl clickable row | 44/45 px | `--color-surface-hover` (unchanged) | 2 px ring outside the row, also on hover | forced colours: Highlight outline. Long German values wrap (existing `anywhere`), the row grows; empty: no row |
| NC unread row | message/time secondary | unchanged | unchanged | read rows keep tertiary |
| log match | opaque marker in every line state | same | — | forced colours `Mark`; ANSI colour inside a match is replaced by the marker ink |
| dependency | — | node hover unchanged | — | tree / structural / depends lines; dash patterns unchanged |
| bar / ring secondary | token | — | — | indeterminate, reduced-motion and forced-colours rules unchanged (fill Highlight) |

## 5. Theming

Floored WCAG ratios, old → new, light / dark. Bases: page = background, surface, surface-2; hover = `--color-surface-hover` over those; NC unread = `--color-surface-selected` over surface and surface-2; dependency on surface (labels on the surface halo, legend on surface-2, cross-refs × 0.8); log lines = surface, warn .12, error .12, ± hover .08; terminal `#1e1e2e`, warn +.05, error +.08, ± hover; track = `--color-surface-hover` over the pages.

| Element | Kind | Light | Dark |
|---|---|---|---|
| dl link, page / hover | text | **4.17 / 3.96 → 5.94 / 5.64** (canvas 4.37 → 6.21) | 7.57 / 6.69 → 8.96 / 7.92 (canvas 11.78) |
| dl link hover ink | text | 8.74 / 8.29 | 10.53 / 9.30 |
| dl `primary` value, page / hover | text | **4.17 / 3.96 → 8.74 / 8.29** | 7.57 / 6.69 (same value #84c7d4) |
| dl clickable focus ring vs page | boundary | **1.28 → 4.17** | **1.50 → 7.57** |
| NC unread message + time | text | 5.01 → 6.49 | **4.23 → 7.05** |
| dep `depends` label / line / cross-ref 0.8 / legend / arrow | text / graphic | **2.53 / 2.53 / 2.05 / 2.42 / 2.53 → 7.55 / 7.55 / 4.52 / 7.23 / 7.55** | **3.57 / 3.57 / 2.75 / 2.96 → 11.15 / 11.15 / 7.55 / 9.25** |
| dep layered structural line | graphic | **2.53 → 7.55** | 3.57 → 11.15 |
| dep tree line (S / S2) | graphic | **1.47 → 4.83 / 4.62** | **2.28 → 6.70 / 5.56** |
| dep `depends` vs `uses` ink | distinct | 1.29 + solid vs dashed + label | 1.66 + same cues |
| log match text (every line state) | text | 10.42 → 7.85 (debug lines 5.03 → 7.85) | **3.82 / debug 3.25 → 7.85** |
| log match vs line (min) | boundary | 1.30 → 1.67 | 3.22 → 5.69 |
| terminal match text / vs line | text | **4.52 / debug 3.29 → 12.90** / 2.02 → 10.25 | same |
| ANSI gray, Latte (light log) plain / worst line | text | **2.60 / 1.92 → 6.25 / 4.63** | — |
| ANSI gray, Mocha (terminal) plain / worst | text | **3.35 / 2.66 → 5.81 / 4.61** | same |
| ANSI gray, Mocha on the dark log variant (worst) | text | — | **2.63 → 4.55** |
| bar secondary vs track / page | graphic | **2.83 / 2.98 → 4.19 / 4.41** | 4.05 / 4.59 (same #7097af) |
| ring secondary vs track / page | graphic | 4.19 / 4.41 (same #5a798c) | 8.35 / 9.45 → 4.05 / 4.59 |
| ring secondary vs info | distinct | 2.19 (same) | **1.07 → 1.92** |

- **New token:** `--color-secondary-graphic` (§2): light 4.19 track / 4.41 page; dark 4.05 / 4.59; vs info 2.19 / 1.92. Shared `--color-success/-error/-warning/-info` and every existing token keep their values.
- **Collisions (documented, not fixed):** Latte gray now equals Latte bright-white (`#5c5f77`; vs black 1.27); Mocha gray vs bright-white 1.59. Ring dark primary vs info 1.16, light secondary vs primary 1.05 (the All Colors story labels each ring).
- **Known, out of scope (follow-ups, §9):** bar *primary* in dark 2.89 vs a surface-2 track (raw `#208497`); 20 % `box-shadow` focus halos as the only indicator (1.28 L / 1.50 D) in NC title + dismiss and log jump-to-bottom; dependency toggle circle and default node border `neutral-300` (1.47 L; the glyph and label carry them).

## 6. Accessibility

- **F-12 decision (AC-12): WCAG 2.5.8 by size, no change.** Measured at 360 (`tb-rest`, `tb-proto`):

| Option | Toolbar | 3 buttons, DE | 4 buttons, DE |
|---|---|---|---|
| today | 41 high; buttons 28 × 28 (≥ 24: 2.5.8 met by size); pill hit 40 × (w + 4) | fits, pills wrap to 2 lines | fits |
| 44 px (hit 44, gap 16, pad 8) | 45 high | fits (right group 186) | **overflows by 22 px** (`scrollWidth − clientWidth`) |

  44 px would need a wrapping toolbar (a redesign the spec rules out). No consumer uses lc-log-viewer (life-os: none). Pills follow the same rule. The dependency viewer's 28 px zoom buttons are the same case.
- **dl:** `role="button"`, `tabindex=0`, Enter/Space unchanged; focus order unchanged. The ring sits outside the row, so it reads against the card, also on a hovered row. Forced colours: outline Highlight (system colours survive forcing). Pre-existing, not changed: `role="button"` on the `dl` row group flattens dt/dd for AT, and a `href` inside a clickable row is a nested interactive; the stories don't combine them.
- **Log match:** `<mark>` keeps its semantics; forced colours `Mark`/`MarkText`.
- **Colour alone:** dependency relations keep dash and label; ring captions; NC unread keeps weight 600 on the title.
- **Motion / announcements:** none added (no transitions on the new declarations).

## 7. Texts

No built-in string changes. *Priority On Unread Rows* adds the German args (every visible built-in string): `clearAllLabel` "Alle löschen", `searchPlaceholder` "Benachrichtigungen durchsuchen…", `filterAllLabel` "Alle", `filterErrorLabel` "Fehler", `filterWarningLabel` "Warnung", `filterSuccessLabel` "Erfolg", `filterInfoLabel` "Info", `dismissAriaLabel` "Benachrichtigung schließen:", `otherCategoryLabel` "Sonstige", `justNowLabel` "Gerade eben", `emptyMessage` "Keine Benachrichtigungen" (title, mark-all-read, priorities and time labels are already German). **r1:** the German header doesn't fit at 360: title + badge (180.9) plus the actions at min-content (143) need 324 of 294 px, so the actions are clipped (scroll 14 at 360, 54 at 320). With the §2 wrap rule, the actions move to line 2, end-aligned: header 87 → 75 at 360 (title y 29, actions y 53, each 26 high, "Alle löschen" 240.9–327) and 93 at 320 (the first label breaks once); scroll 0. EN at 360, 1024 and 1280, and DE from 1024, stay on one line: 46/46 shots are hash-identical to `build-c` with the rule injected. EN at 320 goes from 69 to 75 (one-line labels).

Description-list stories (DE): `Bank` "Sparkasse KölnBonn", `Freigabe` "Alle Erwachsenen" (`primary`), `Einwilligung` "Details ansehen" (`href: '#'`, link story only), `Letzter Abruf` "heute 09:14" (`datetime: '2026-11-02T09:14:00+01:00'`). EN: `Bank` "Northwind Savings", `Shared with` "All adults" (`primary`), `Consent` "View details" (link story only), `Last sync` "today 09:14".

## 8. Stories

| Story | Expected ID | Args / content | Shows |
|---|---|---|---|
| Link and primary values (BA-10) | `components-description-list--link-and-primary-values` | DE items with link, primary, default, muted; outlined `lc-card` xl `padding="lg"` at `max-width: 312px`; the list twice, `md` then `sm` (16 px apart) | AC-1 |
| Clickable rows (BA-10) | `components-description-list--clickable-rows` | DE items (no link), `[clickable]="true"`; four outlined cards titled `rows · md`, `rows · sm`, `stacked · md`, `stacked · sm`, grid `repeat(auto-fill, minmax(280px, 1fr))` gap 16; `itemClick` as an action | AC-2, 3 |
| Clickable rows, English | `components-description-list--clickable-rows-english` | same render, EN items | AC-3 |
| ANSI gray on every line | `data-display-logviewer--ansi-gray-on-every-line` | `log` and `terminal` stacked (gap 16), height 160px, timestamps, local dates `new Date(2026, 10, 2, 9, 0, i)`; lines debug `\x1b[90m[debug]\x1b[0m cache warm-up`, info `Request served \x1b[90m· 34 ms\x1b[0m`, warn `Slow query \x1b[90m· 812 ms\x1b[0m`, error `Upstream timeout \x1b[90m· 30 s\x1b[0m`, info `\x1b[30mblack\x1b[0m \x1b[90mgray\x1b[0m \x1b[37mwhite\x1b[0m \x1b[97mbright white\x1b[0m` | AC-13 |
| Footer slot (changed) | `components-card--footer-slot` | list renders (3 rows); flush link | AC-5 |
| Priority On Unread Rows (changed) | `feedback-notification-center--priority-on-unread-rows` | §7 args | AC-7, 14 |
| All Colors (text only) | `charts-progress-ring--all-colors` | description: secondary reads `--color-secondary-graphic` (dark vs info 1.07 → 1.92) | AC-11 |

Each new story gets a `docs.description.story` with the §5 values. Search matches have no at-rest story: measure them (§9).

## 9. Verification

| AC | How | Expected |
|---|---|---|
| 1 | *Link and primary values*, *Rows* at 360/1280 L/D: computed `color` of `.lc-dl__link`, `.lc-dl__value--primary` vs the card/canvas | §5 dl rows; ≥ 4.5 |
| 2 | *Clickable rows*: focus row 1 (`:focus-visible` true), `outline` 2px solid, ratio vs card; `--forced-colors` shot + `outlineColor` | 4.37 L / 9.95 D on the canvas; Highlight |
| 3 | *Clickable rows* (+ English) at 360/1024/1280 L: every row's `getBoundingClientRect().height` | rows 45 (last 44), stacked 62 / 48; ≥ 44 everywhere |
| 4 | `--compare=tmp/story-shots/036/baseline`; for the 4 dl link stories re-shoot with `.lc-dl__link` ×5 `{ color: var(--color-primary-500) }` injected (class weight beats `_ngcontent`) | 3 dl stories identical; link stories identical with the old ink |
| 5 | *Footer slot* 360/1280: `.lc-dl__row` count, `lc-button` + `a[lcButton]` present, link height | 3 rows; link ≥ 44; other 16 card stories identical |
| 6 | diff review | §2 wording |
| 7 | `state-measure.js` on *Priority On Unread Rows*, *Default* L/D | unread ≥ 6.49 L / 7.05 D (story values higher) |
| 8 | `state-measure.js` on *All Relation Types*, *Horizontal*, *Layered Layout*, *Complex Relationships* 360/1280 L/D | §5 dep rows; dash arrays unchanged |
| 9 | 034 `r1-state-measure.js` (open search, type a term hitting info, debug, warn and error lines) on *Text Hierarchy*, both viewers, at rest and with `:hover` composited | 7.85 / 12.90 every state |
| 10, 11 | *Colors*, *All Colors* L/D: fill vs track, arc vs track, secondary vs info | §5 bar/ring rows |
| 12 | `toolbar-measure.js` on *Text Hierarchy*, *App Registers No Icons* 360/1280 | unchanged: 41 high, 28 × 28, pill hit 40, scroll 0 |
| 13 | `state-measure.js` on *ANSI gray on every line*, *With Ansi Colors* L/D | §5 ANSI rows; other ANSI colours unchanged |
| 14 | *Priority On Unread Rows* 360/1280 shots; r1: header `scrollWidth − clientWidth` at 320/360/1024/1280; 8 NC stories `--full --compare=tmp/story-shots/036/build-c` | no English string; scroll 0 everywhere, header 93 / 75 / 51 / 51; only this story's 360 L/D differ from `build-c` |
| 15 | full Jest; `git diff -- libs/angular-ui-kit/src/styles/_theme-*.scss` shows only the new token | green |
| 16 | `--forced-colors` shots of *Clickable rows*, *ANSI gray on every line*; compat at release | outline Highlight; prerender passes |
| 17 | changelog review | Fixed per item with §5 bold cells; Added: the token; Compatibility: no break, F-12 decision |

**Unit tests:** new block `describe('Component pairings of <version> (request 036)')` in `theme-contrast.spec.ts`, built like 034: (a) the §2 declarations; (b) per palette the §5 cells from tokens (dl link/primary/ring, NC unread, dep depends/structural/tree, match `--color-on-warning` on `--color-warning` 7.85, bar/ring secondary 4.19 / 4.05, secondary vs info ≥ 1.5); (c) the shared hexes unchanged; terminal match and ANSI gray as literals. `description-list.component.spec.ts`: a clickable row renders `lc-dl__row--clickable` (existing) — no geometry in Jest.

**AC-15 reading (recorded assumption):** six existing assertions pin exactly the values F-9, F-10, F-11 and the ring fix replace; they are updated with that reason (as 034 did for 029's F-1 test), none is weakened: `theme-contrast.spec.ts` l. 750 (secondary "stays raw" → `var(--color-secondary-graphic)`), l. 970 (ring secondary token), l. 1025–1026 ("out of scope F-9" → text-secondary / field-border), l. 1049 `graphic` dark 4.76 → 4.05 and l. 1051 `ringTrack.secondary` [4.19, 8.35] → [4.19, 4.05]; `log-viewer.component.spec.ts` l. 491 `/--color-warning-default/` → `/var\(--color-warning\)/`.

**Baseline** `tmp/story-shots/036/baseline` (c21feeb, 79 stories: dl 7, card 17, ring 7, NC 8, log 9, bar 8, dependency 24; 360/1024/1280 L/D `--full`, 480 shots). Expected `--compare`: **210 differ / 234 identical / 36 unstable**.
- **Differ:** dl rows, with-leaders, stacked, divider-separator (L+D, link colour); card footer-slot; ring all-colors D; NC default, with-priority, grouped-by-category, errors-only, priority-on-unread-rows, compact (L+D); log with-ansi-colors (L+D); bar colors L; dependency: all but single-node and layered-with-relations (L+D).
- **Identical:** the other 3 dl, 16 card, 6 ring stories (+ all-colors L), NC empty and all-read, log text-hierarchy and app-registers-no-icons, the other 7 bar stories (+ colors D), dependency single-node and layered-with-relations.
- **Unstable** (`Date.now()`): log default, terminal, errors-only, streaming, flex-parent, large-buffer: check by measure.

**Follow-ups (not here):** F-14 bar primary dark 2.89 on surface-2 tracks; F-15 20 % focus halos as the only focus indicator (NC title, dismiss, log jump-to-bottom; check the other 7 files); F-16 dependency toggle and node borders `neutral-300`; F-17 `role="button"` on dl rows (group semantics).
