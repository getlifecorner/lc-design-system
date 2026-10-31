# Design 026: Review findings follow-up 3: toast close colour, notification-center comment, drawer story lang

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-9
- **Measured on:** main f8ec067 (3.19.1), static Storybook rebuilt 2026-10-31; prototype = injected `.lc-toast__close { color: var(--color-text-secondary) }` (logs `tmp/026/proto*.log`)

## 1. Approach

Extend, no new API. Three edits:

1. **Toast ×:** one declaration, `color: var(--color-text-secondary)`, in the base `.lc-toast__close` rule. The × (`stroke="currentColor"`) and the `2px solid currentColor` ring follow. Same token as the toast's own action button in the same row (`.lc-toast__action`, every variant), `lc-modal` close and `lc-sidenav` close. `--color-text-tertiary` (lc-drawer close) also passes (5.58 L / 5.56 D min) but would make × and action differ inside one toast.
2. **NC comment:** wording only (§7.2). Measuring all old fills in both themes showed the lowest value was **1.44:1** (Warning, dark), not 1.89. See deviation D1.
3. **Drawer story:** a German copy of the task body for `GermanHeading` only (`taskBodyDe`). `lang="de"` stays on `lc-drawer`, because the heading is internal and needs the `lang` for `hyphens: auto`.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| — | none | — | — | No input, output, slot, hook or type changes |

Default rendering: layout, sizes, hover tints and DOM are unchanged. Only the colour of the × and its focus ring changes, from UA `buttontext` rgb(0,0,0) to `--color-text-secondary`. The owner accepted this change on 2026-10-31. It is a patch release.

**Exact SCSS** (`toast.component.scss`, base rule, after `background: transparent;`):

```scss
  // The × and its currentColor focus ring (3.19.2, request 026). Without a
  // colour the button took the UA's black buttontext: 1.47 / 1.22:1 in dark.
  color: var(--color-text-secondary);
```

No variant rule gets a colour. Specificity is (0,1,0) under `ViewEncapsulation.None`: it beats the UA rule, and the variant `:hover` rules (0,3,0) set only `background-color`.

## 3. Anatomy and layout (unchanged; reference values for the review)

### 360 px

```
 x16                                              x344
 ┌──────────────────────────────────────────────┐
 │ (i)  Message text …                 ┌──────┐ │  close 44×44 at (295, 21)
 │                                     │  ×   │ │  svg 20 at (307, 33), r 10
 │                                     └──────┘ │  ring 2 px, offset −2 (inside)
 └──────────────────────────────────────────────┘
```

### From 1024 px

```
 x16                                    x416 (max-width 400)
 ┌──────────────────────────────────────┐
 │ (i)  Message text …       ┌──────┐   │  close 44×44 at (367, 21) at 1024 and 1280
 │                           │  ×   │   │  svg 20 at (379, 33)
 └───────────────────────────┴──────┴───┘
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Toast × | 20 px icon in a 44×44 box, margin −12 | — | `--color-text-secondary` (new) |
| Focus ring | 2 px solid, offset −2, radius 10 | — | currentColor = `--color-text-secondary` |
| Drawer `GermanHeading` (§7.1) | aside 360 (360 px) / 320 (1280); header 73; h2 2 lines x 21–296; close 44 at (302, 14) / (1222, 14); gap 6 | h2 unchanged; body labels 12 px uppercase, text 14/1.5 | unchanged |
| Drawer German description | 3 lines, 327 px wide (360) / 287 px (1280), no overflow | 14 px | `--color-text-primary` |

## 4. States

| State | Toast close |
|---|---|
| default | × `--color-text-secondary`: 7.56 / 7.23 L, 9.26 / 11.16 D (top / bottom of the gradient) |
| hover | Variant tint unchanged (rgba at 0.1). × on the tint: min 6.02 L (error), 7.82 D (warning) |
| focus-visible | Ring = × colour, same contrast. On the hover tint: min 6.02 L / 7.82 D. `:focus-visible` true after `focus()` (prototype, every toast) |
| active | No own style (as before) |
| disabled · loading · empty · error | n/a: the close has no such state; the error variant is covered above |
| overflow | Unchanged: DE With Action at 360 = 3 lines, 99 high; × stays top-right |
| forced colors | `color` is forced to ButtonText and the svg stroke follows (currentColor). The ring stays a solid 2 px outline in the forced focus colour (change note, review r1: not ButtonText as first written; emulated rgba(5,0,73,.8) L / rgba(0,230,255,.8) D, visible). The toast SCSS has no `forced-color-adjust`, so no rule is needed |
| no close button | Unchanged (`without-close-button` identical by hash) |

## 5. Theming (computed in the browser with the WCAG formula; ends = `--gradient-surface`)

| Element | Light | Dark | Contrast L / D (top / bottom) |
|---|---|---|---|
| Toast ends | #fff → #f9fafb | rgb(26,44,58) → rgb(16,28,38) | — |
| × and ring before | rgb(0,0,0) | rgb(0,0,0) | 21 / 20.1, **1.47 / 1.22** |
| × and ring `--color-text-secondary` | #4b5563 | #c4d2d9 | **7.56 / 7.23**, **9.26 / 11.16** |
| × on hover, success rgba(142,164,117,.1) | | | 6.94 / 6.66, 7.89 / 9.58 |
| × on hover, error rgba(157,14,14,.1) | | | 6.28 / **6.02**, 9.32 / 11.00 |
| × on hover, warning rgba(225,160,64,.1) | | | 7.01 / 6.73, **7.82** / 9.49 |
| × on hover, info rgba(59,101,136,.1) | | | 6.57 / 6.30, 8.57 / 10.30 |
| (rejected) `--color-text-tertiary` | #5c6672 | #93a4ad | 5.84 / 5.58, 5.56 / 6.71 |

The values are the same in all 6 standalone stories and the 4 outlet stories (opened) at 360 and 1280. No new token.

## 6. Accessibility

- Semantics unchanged: `<button type="button">` named by `closeAriaLabel` ("Close notification" / "Benachrichtigung schließen"), svg `aria-hidden`, DOM and tab order unchanged, 44×44 box unchanged.
- WCAG 1.4.11: × and ring ≥ 3:1 in every state (min 6.02). axe does not check SVG icons, so the review measures (025 lesson).
- Drawer story: no English text under `lang="de"` (8/8 text nodes German or a name, §7.1). The dialog name is the German heading, and the close name is "Schließen".
- Reduced motion: no change (no motion added).

## 7. Texts

### 7.1 `GermanHeading` body (`taskBodyDe`, same markup as `taskBody`)

| EN (`taskBody`, stays for the other stories) | DE (`taskBodyDe`) |
|---|---|
| Status | Status |
| In Progress (badge) | In Bearbeitung |
| Assignee | Zuständig |
| Alice Johnson | Alice Johnson (a name, unchanged) |
| Description | Beschreibung |
| Implement the new authentication flow including OAuth2 support, refresh token handling, and session management. | Neuen Anmeldeablauf umsetzen: OAuth2-Unterstützung, Umgang mit Refresh-Tokens und Sitzungsverwaltung. |

The prototype was checked at 360 px: "Haushaltsmitgliederverwaltungsein-/stellungen bearbeiten" (2 lines), and the body fits (3 description lines, no overflow, page `scrollWidth` 360).

`GermanHeading` docs description (AC-8). Keep the current text and append: ` The body is German too, so \`lang="de"\` on \`lc-drawer\` marks only German text (3.19.2).`

### 7.2 Notification-center comment (`notification-center.component.scss` 110–113 → 110–115)

```scss
  // The pressed chip (3.19.1, request 025), as in lc-toggle-group: white on
  // --color-primary-fill is 6.21:1 in both themes, and the rim keeps 3:1
  // against the panel. Every level (error, warning, …) uses it. White on the
  // old fills passed only for Error (8.39:1) and Info (6.17:1) in light; it
  // was 4.37 (All), 2.72 (Success) and 2.26 (Warning) in light and 1.44 to
  // 1.99:1 in dark.
```

Measured values for white on the old fills (`tmp/026/probe-nc.log`):

| Level | Light | Dark |
|---|---|---|
| All | 4.37 | 1.89 |
| Error | 8.39 | 1.99 |
| Warning | 2.26 | 1.44 |
| Success | 2.72 | 1.50 |
| Info | 6.17 | 1.62 |

**D1 (deviation from AC-6's wording):** AC-6 asks for "1.89:1 at the lowest", but the lowest was 1.44 (Warning, dark). 025 measured dark only for All and Error. The comment uses the measured values. The released 3.19.1 changelog line "as low as 1.89:1" has the same error: release-manager, correct it to "as low as 1.44:1" (documentation only), or add a note under 3.19.2.

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Success, Error, Warning, Info, With Action, All Variants (changed: × colour) | `feedback-toast--success` … `--all-variants` | unchanged | × in `--color-text-secondary`, both themes |
| Without Close Button (unchanged) | `feedback-toast--without-close-button` | unchanged | identical by hash |
| Outlet Default, Bottom Center, Sticky, Service Call | `feedback-toast-outlet--default` … `--service-call` | unchanged | at rest identical; opened: × colour changed |
| German Heading (changed: body + description) | `feedback-drawer--german-heading` | unchanged | German body under `lang="de"`, heading hyphenated |
| Drawer Default, Left Position, Filter Panel, Without Heading, Large Form | `feedback-drawer--…` | unchanged | identical by hash (`taskBody` untouched) |

No new story: no new input, slot or variant.

## 9. Verification

Baselines (f8ec067): `tmp/story-shots/026/baseline` holds 90 shots: the 7 toast and 4 outlet stories at rest at 360/1024/1280, and the 6 drawer stories at 360/1280, light and dark. `tmp/story-shots/026/baseline-open` holds 16 shots: the 4 outlet stories opened, at 360/1280 L/D, with the measure in `tmp/story-shots/026/open-measure.js` (clicks `[0,1,2,3]`, service-call `[0,1,2]`).

| AC | How | Expected value |
|---|---|---|
| AC-1 | Unit: new `describe('Component pairings of 3.19.2 (request 026)')` in `theme-contrast.spec.ts`. The compiled `.lc-toast__close` body matches `/\scolor: var\(--color-text-secondary\);/` and has no `#hex`/`rgb(`. Story measure: computed `color` | rgb(75,85,99) L / rgb(196,210,217) D (was rgb(0,0,0)) |
| AC-2 | Unit, per palette: text-secondary min over `--color-surface` / `--color-surface-2` ≥ 3. Story `--measure` (`tmp/story-shots/026/proto-measure.js` without the injected style) on the 6 toast stories and the 4 outlet stories opened, 360/1280 L/D | 7.23 L / 9.26 D (unit); story: 7.56 / 7.23 L, 9.26 / 11.16 D for every toast |
| AC-3 | Same measure: `focus()` each close, read `:focus-visible` and the outline. `--forced-colors` run plus a stylesheet scan: no `forced-color-adjust` in the toast CSS | true; `solid 2px −2px`, colour = ×; ring ≥ 7.23 / 9.26, on hover ≥ 6.02 / 7.82 |
| AC-4 | Unit: composite the 4 literal hover tints over both ends, × ≥ 3. Diff: tint lines unchanged | min 6.02 L / 7.82 D (§5 table) |
| AC-5 | Hash proof: re-shoot baseline and baseline-open with `.lc-toast__close { color: buttontext }` injected first, `--compare` | 106/106 identical (only the colour changed). Without the revert: toast 36 differ, without-close 6 identical, outlet at rest 24 identical, baseline-open 16 differ. Close 44×44 at (295, 21) / (367, 21) |
| AC-6 | `git diff` of the NC SCSS | comment lines only, text as in §7.2 |
| AC-7 | German Heading at 360/1280: text nodes and their `closest("[lang]")`, h2 lines and overflow, header height, close box. Shot at 360 | 8/8 nodes `de`, German; h2 2 lines, fits; header 73; close (302, 14) / (1222, 14); gap 6; sw 360 |
| AC-8 | Read the story description | as in §7.1 |
| AC-9 | Full tests, lint, build; no existing assertion changed. Drawer compare | the other 5 drawer stories: 20/20 identical; german-heading: 4 differ |

**Risks (from earlier rounds):** `taskBody` is shared with Default, so add `taskBodyDe` and do not edit `taskBody`. The toast uses `ViewEncapsulation.None`, so no `:host` and no `_ngcontent`. Keep the hover tints (raw rgba) as they are (non-goal). Light shots of the drawer stories can flip between runs (025 r1): re-shoot before calling a diff real.
