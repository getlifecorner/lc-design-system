# Build 034: Status ink contrast follow-up 2 (F-1 to F-7 of 029)

- **Branch:** `fix/3.22.4-status-ink-contrast-2`
- **Commit:** `36f8c94` (first; amended with this file), fix(status-inks): F-1 to F-7 of 029 reach AA in six components

## Files changed

| File | Change |
|---|---|
| `notification-center.component.scss` | F-1: unread-row chips: `background-color: var(--color-surface)` + one-colour gradient of their tint (§2 rows 1–3); base rules untouched |
| `progress-ring.component.scss` | F-2: secondary `--color-secondary-600`, status arcs `--color-on-<v>-subtle` |
| `diff-viewer.component.scss` | F-3: line tints `--color-<v>-subtle`, `.lc-diff__num` `--color-text-secondary` |
| `card.component.scss` | F-4: `.card__badge--primary` = `--color-primary-subtle` / `--color-on-primary-subtle`, border `--color-primary-500` |
| `log-viewer.component.scss` | F-5: pill `position: relative` + `::before` hit area; F-7: opacities → text steps, flat terminal rules (§2 rows 7) |
| `dependency-viewer.component.{ts,html}` | F-6: `uses` / `extends` in `RELATION_STYLES` and their arrow markers |
| `styles/theme-contrast.spec.ts` | new block "Component pairings of 3.22.4 (request 034)" (55 tests); 029 "F-1 (known)" → "F-1 (fixed in 3.22.4)" |
| `*.stories.ts` (5) | the five §8 stories |

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1, 2, 14 | spec: unread chips high 5.52 / 5.55, urgent 10.97 / 8.37, low + category 5.30 / 5.99; shared `--color-<v>` / `-default` hexes pinned; 029 F-1 test now composites through the unread rule, `[5.52, 5.55]`, ≥ 4.5. Story measure (360/1024/1280 L/D): identical values on every unread row |
| 3 | spec: arc vs track L 3.96 / 4.19 / 4.81 / 5.47 / 11.43 / 9.22, D 6.69 / 8.35 / 6.15 / 5.60 / 6.37 / 7.80; vs page ≥ 3; centre text ≥ 4.5. *All Colors* measure: same track values, page 4.36–12.58 L |
| 4 | spec: numbers L 6.91 / 6.58 / 7.23, D 6.86 / 9.26 / 9.25; `+` 4.85 / 5.17, `−` 10.97 / 7.21; content 16.24 / 15.46, 9.75 / 13.16 |
| 5 | spec: text 8.48 / 5.79, border on card 3.75 / 6.87, on chip 4.05 / 5.79. Measure: selected card 8.48, border 3.75 (L) |
| 6 | measure *Text Hierarchy* + *App Registers No Icons* 360/1280: hit area 40 tall (y17–57), w + 4; top + 1, bottom − 2, left − 1.5 hit the pill, below the toolbar does not; between two pills every point hits one of them; toolbar `scrollWidth = clientWidth` (326) EN and DE |
| 7, 8 | spec: §2 declarations, no `opacity` < 1 on any debug/meta/count/placeholder rule, no inverted terminal selector; log meta 5.60 / 8.29, debug message 6.92 / 10.18, debug dims 5.34 / 6.12, count/placeholder 5.83 / 6.70; terminal 5.85 / 6.70 / 5.28 / 6.21, levels 5.81 / 7.78 / 11.43 / 6.19. Measure: same values, opacity 1 up to the viewer |
| 9 | spec: `uses` label 5.83 / 6.70, line (0.8) 3.75 / 4.76, legend 5.58 / 5.56; `extends` 9.13 / 9.12, 5.32 / 6.29, 8.74 / 7.57; dash styles pinned. Measure *All Relation Types*: same labels, dashes `6px, 3px` |
| 10, 13 | full Jest green; no assertion of the six components' specs edited; no new focusable element |
| 11 | *Text Hierarchy* 360: DE pills wrap to 2 lines (26 tall), no overflow; *Priority On Unread Rows* 360 shot |
| 12 | blocked locally (see Gates); CSS + two marker `fill` values only |
| 15 | changelog draft below |

## Gates

All gates ran on commit `36f8c94ca5b0946e1e9616d39183834c32dd80b2` (later agents skip a gate while `git diff --quiet 36f8c94 -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 213 suites; 4979 passed, 8 skipped (+55, `--maxWorkers=4`) |
| `npx nx run angular-ui-kit:lint` | 0 errors; touched files: no new warning (2 old non-null warnings in `dependency-viewer.component.ts`) |
| `npx nx run angular-ui-kit:build` | ok, 122 "Built" |
| `npm run test:tools` | 22 / 22 (tools unchanged; run for the new stories) |
| `npx nx run angular-ui-kit:build-storybook` | ok, 980 stories (+5) |
| Story screenshots | `tmp/story-shots/034/new/` (30 shots + measures, `tmp/034/new.log`, module `tmp/034/measure/m.mjs`); `--full --compare=tmp/story-shots/034/baseline` → `tmp/story-shots/034/build/`: **96 different / 258 identical / 6 unstable** (chat `with-diff-viewer`), exactly the §9 lists (logs `tmp/034/compare-{a,b,c}.log`) |
| `check-angular-majors.mjs --only=22` | **blocked by the local Node** (v23.10.0; CI uses 24): install ok, prerender fails at `@angular/build` `routes-extractor-worker.js:56`, `require('@angular/compiler')` inside Node's ESM translator, before the app or the kit loads (twice, scratchpad and default temp dir; `tmp/034/compat*.log`). Earlier runs today (032, 033) had no Node type-stripping warning, so another Node was on the PATH |

## Deviations from the design

- Card border on the chip fill (light) computes to **4.05** from the tokens; §5 gives 4.06 (browser value). The spec pins 4.05; nothing visible changes.
- Spec values are floored and compared with `toBe` (as the 029 block), not `toBeCloseTo(…, 2)`.
- Pill hit areas: the boundary between two pills goes to the later pill at sub-pixel level (error pill right edge + 1.5 px hits the warn pill), so the areas touch with no gap and no overlap, as designed.

## Changelog draft

### Fixed
- **Seven contrast and target gaps left by 3.21.1 reach WCAG 2.2 AA in both themes** (follow-ups F-1 to F-7 of request 029). Old → new, light / dark:
  - `lc-notification-center` (F-1): chips on an unread row paint their tint over an opaque `--color-surface`, so the teal row no longer shows through: dark „High“ 3.67 → 5.55, low and category 3.76 → 5.99, urgent 5.91 → 8.37, the same on every row of the panel gradient. Light colours unchanged (5.52 / 10.97 / 5.30).
  - `lc-progress-ring` (F-2): arcs use the progress-bar inks (`--color-on-<status>-subtle`, secondary `--color-secondary-600`): against the track, light success 2.47 → 4.81, warning 2.05 → 5.47, secondary 2.83 → 4.19, error 7.62 → 11.43, info 5.60 → 9.22; dark success 8.43 → 6.15 and warning 8.81 → 5.60 get slightly darker.
  - `lc-diff-viewer` (F-3): line numbers use `--color-text-secondary` and the line tints `--color-success-subtle` / `--color-error-subtle`: numbers light added 3.88 → 6.91, removed 2.93 → 6.58, dark added 4.12 → 6.86; the `+` 3.52 → 4.85 (L). Light diffs are paler, as in dark (dark tints unchanged).
  - `lc-card` `badgeVariant="primary"` (F-4): the lc-badge primary pair with a `--color-primary-500` border: text 3.12 → 8.48 (L, selected card), border 1.37 → 3.75 (L) / 1.82 → 6.87 (D). Dark text unchanged (5.79).
  - `lc-log-viewer` level pills (F-5): a 40 px tall hit area (WCAG 2.5.8 by size); the visible pill and the toolbar keep their size.
  - `lc-dependency-viewer` (F-6): `uses` reads `--color-text-tertiary`, `extends` `--color-on-primary-subtle` (edge, arrow, label, legend): labels `uses` 1.47 → 5.83 (L) / 2.28 → 6.70 (D), `extends` 1.89 → 9.13 / 3.95 → 9.12; lines ≥ 3.75 / 4.76. Dash styles unchanged.
  - `lc-log-viewer` text (F-7): no `opacity` on text any more. Line number, time and source `--color-text-secondary` (time/source 3.21 → 5.60 L, 4.43 → 8.29 D); on debug lines they, the debug level, the line count and the search placeholder use `--color-text-tertiary` (debug level 2.53 → 5.34 L, 3.25 → 6.12 D; debug-line meta 1.94 → 5.34 / 2.58 → 6.12). Terminal: `#a6adc8` for meta and debug text (numbers 2.20, time 3.64 → 5.85), `#9399b2` for the debug level and debug-line meta (2.97 → 5.28), line count and placeholder 6.21; level colours unchanged (5.81 / 7.78 / 11.43 / 6.19).
- Stories: Charts/Progress Ring "All Colors", Feedback/Notification Center "Priority On Unread Rows", Components/Card "Primary Badge States", Data Display/LogViewer "Text Hierarchy", Data Display/Dependency Viewer "All Relation Types".

### Compatibility
- No API breaks and no new token: no input, output, slot, class, `--lc-*` hook or default changed; `--color-success/-error/-warning/-info` and their `-default` steps keep their values. Selectors keep their specificity; the log pills gain `position: relative` and an empty `::before`. A consumer rule on `.lc-diff__line--added` still wins. 96 of 360 story shots of the six components change colour only; 258 are pixel-identical.

### Known
- Follow-ups F-8 to F-12 (design 034 §9): NC message/time on unread rows in dark 4.23; `depends` label 2.53 L and the neutral tree lines; the log search match in dark 3.82; the progress-bar secondary fill 2.83 L; the 28 px log tool buttons.
