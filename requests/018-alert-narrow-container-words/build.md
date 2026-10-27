# Build 018: lc-alert in a narrow container: long words and a narrow layout

- **Branch:** `fix/3.13.1-alert-narrow-container-words` (patch: SCSS, JSDoc and stories only)
- **Commit:** `fix(alert): narrow layout and word breaking in a narrow container (G-WL4)`

## Files changed

| File | Change |
|---|---|
| `alert/alert.component.scss` | `container: lc-alert / inline-size` on `.lc-alert`; `@container lc-alert (width < 16rem)` block after `.lc-alert__close` (design §3; R1 selector (0,6,0), R2 order, R3 word breaking only inside) |
| `alert/alert.component.ts` | class JSDoc bullet and `AlertActionsLayout` line (design §2) |
| `alert/alert.stories.ts` | component docs bullet (AC-11 text), 3 stories (design §8), `textSize` argType |
| `alert/alert.narrow.spec.ts` | new, 16 tests: AC-1, AC-4, AC-7 (base rules pinned), AC-8, AC-9 |
| `button/button.component.ts`, `button-link.component.ts`, `button-link.stories.ts` | the `--lc-btn-overflow-wrap` setter list names "the narrow alert's actions" (deviation 1) |
| `button/button.overflow-wrap.spec.ts` | setter list 3 → 4, new alert test, JSDoc sentence (deviation 1) |

## Acceptance criteria (measured: `tmp/018/measure/narrow.mjs` → `tmp/018/new.log`, `new100.log`)

| AC | Covered by |
|---|---|
| AC-1 | Jest (narrow spec); story 1 computed `break-word` / `auto`, wide alerts `normal` / `manual` |
| AC-2 | `narrow-container` at 320 / 360 / 1024 / 1280: DE alert 123 × 895, icon, title, content x = alert x + 25, w 73, over −1 (nothing right of the alert), `scrollWidth ≤ clientWidth` for alert, title, content; page `scrollWidth` 320 / 360 |
| AC-3 | same, EN 123 × 566; `lang=""` 123 × 860, breaks without hyphens, over −1 |
| AC-4 | Jest; story 2 at 360 / 200 %: alert 296, padding 24, icon x 57, title x 105 y = icon y, content x 57 w 246; at 1024 / 1280 wide (padding 32, body block). Story 3: 240 and 257 → padding 12, title x = alert x + 49; 258 → padding 16, x + 53. Story 2 at 100 %: padding 16, title x 69 |
| AC-5 | × 36 × 36 (200 %) / 28 × 28 (100 %) at the row end; inline button, link and stacked buttons x = inner start (57 / 29), right ≤ inner right; stacked 246 wide, 16 apart at 200 % (8 at 100 %); over −1 in all 6 + 6 alerts |
| AC-6, AC-7 | 27 stories × 3 widths × 2 themes `--full --compare=tmp/story-shots/018/baseline`: 158 identical, 4 different (below) |
| AC-8 | dark shots in `tmp/story-shots/018/final`; Jest: no transition, animation, forced-color in the block; no colour change |
| AC-9 | Jest: DOM order icon, body, title, content, action, close (inline, stacked, no title), roles, decorative icon, host classes unchanged |
| AC-10 | static CSS; compat 22 PASS |
| AC-11 | component docs bullet and story 1 description (design §7 text) |
| AC-12 | existing alert assertions unchanged; changelog draft below |

**Compare (AC-7):** `design-tokens-density--side-by-side` 360 light + dark: expected (51.3 px alerts, narrow; first differing row 3425, page 3461 → 3767). 1024 + 1280 light: rows 74–87 only, the breadcrumb "Profile" (weight 500) in the web font in my build and the fallback font in the baseline (same hash in two runs, 14 px / 500 stable over 1.5 s). The alerts there are 272.7 / 358 px with `body: block`, so the layout is unchanged. This is font-loading noise of the R4 kind, not the alert.

## Gates

All gates ran on commit `2a742f17193e1851f363bf2c2049b8039fc3aca5` (later agents skip a gate while `git diff --quiet 2a742f1 -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 182 suites, 4368 passed, 8 skipped (was 181 / 4351) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (unchanged) |
| `npx nx run angular-ui-kit:build` | success, 121 "Built" lines |
| `npm run test:tools` | 22 / 22 (tools unchanged, run for the story parsing) |
| `npx nx run angular-ui-kit:build-storybook` | success, 911 stories (+3) |
| Story screenshots | new: `tmp/story-shots/018/final` (3 stories × 320/360/1024/1280 × light/dark = 24, identical to the measured run `…/new`); 100 %: `…/new100`; compare: `…/build` (alert sources identical to 2a742f1) |
| `check-angular-majors.mjs --only=22` | PASS, 71 HTML checks |

## Deviations from the design

1. **Button docs and spec:** `button.overflow-wrap.spec.ts` pins the exact list of stylesheets that set `--lc-btn-overflow-wrap`. Design §3 adds a fourth one (the alert), so the list is now 4 entries (still exact), with a new test that pins it inside the 16rem query. The JSDoc of `lc-button` / `a[lcButton]` and the button-link argType now say "… and the narrow alert's actions". The assertion on that sentence follows. Nothing was weakened.
2. Story 2, the alert without a title: "Ihre Änderungen wurden gespeichert." (§7 gives no DE string). The × right edge is inner right + 4 at 100 % and + 8 at 200 % (the −`spacing-1` margin doubles, as in the wide layout).
3. For the review, not changed (R3, wide layout as in 3.13): story 2 at 100 % and 320 px. There, "Benachrichtigungseinstellungen" is wider than its 186 px title column (`scrollWidth > clientWidth`, still inside the alert), and the *With Action* title overflows by 1.3 px (R5).

## Changelog draft

```
## [3.13.1] - 2026-10-27

`lc-alert` fits a narrow container: below 16rem of inner width it switches to a narrow layout, and long words hyphenate or break instead of leaving the box (G-WL4; life-os website waitlist). No API breaks.

### Fixed

- **`lc-alert` in a narrow container** (G-WL4; the DE 503 answer of the life-os waitlist, an alert in `lc-next-step-card` `[slot='body']` at 320 px and 200 % text). The alert was 123 px wide there, and "Nicht eingetragen" ran 111.4 px past the alert box (EN "Not registered" 87.5 px). Now no text leaves the alert in DE, EN or without `lang` (0 px; the page stays 320 px wide). When the space inside the border is below 16rem (alerts under 258 px at 100 % text, 514 px at 200 %), the alert uses a narrow layout like `lc-next-step-card`:
  - The icon shares the first row with the title. A title whose longest word doesn't fit beside the icon moves below it.
  - The message and the actions take the full width below, starting at the inner edge. Inline buttons, text links (3.12) and stacked actions (3.3) all line up there, and their labels break within the line.
  - The padding is one density step smaller (`--lc-density-padding-sm`: 12 px, 24 px at 200 %).
  - Title and message use `overflow-wrap: break-word` and `hyphens: auto`. Hyphens need the page's `lang` (`<html lang="de">`); without one, a word wider than the line breaks without a hyphen.
  - The × stays at the end of the first row, the same size as before.

  DOM, roles and focus order are unchanged. In a 240 px side column at 100 % text a plain alert is 96 px tall (was 118.5).

### Added

- Stories: Feedback/Alert "Narrow Container at 200 % Text (G-WL4)", "Narrow Layout (phone at 200 % text)", "Narrow Layout in a Side Column (100 % text)".

### Compatibility

- No API breaks: no new input, slot, type or hook. Alerts at or above the threshold render as before: of 162 screenshots of the 27 stories that show an alert, the only alert change is the density docs' 51.3 px alerts at 360 px, which now use the narrow layout.
- Every `lc-alert` is now a size container (`container: lc-alert / inline-size`; before, only stacked and text-link alerts were). In a shrink-to-fit box (`inline-block`, a float, an absolutely positioned box without a width, `width: fit-content`, a grid `auto` / `max-content` track) the alert no longer takes its width from its text, so give that box a width. A `position: fixed` descendant is placed relative to the alert, and the alert has no baseline for `align-items: baseline`.
- Known: between 258 px and about 400 px at 100 % text, an inline button action still narrows the text column (61.7 px in a 288 px alert), as in 3.13.0. `actionsLayout="stacked"` avoids it.
```
