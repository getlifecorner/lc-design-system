# Build 026: Review findings follow-up 3: toast close colour, notification-center comment, drawer story lang

- **Branch:** `fix/3.19.2-review-findings-follow-up-3` · **Commit:** `git log -1` (`fix(toast,notification-center,drawer): review findings follow-up 3`)

## Files changed

| File | Change |
|---|---|
| `libs/angular-ui-kit/src/lib/toast/toast.component.scss` | `.lc-toast__close`: `color: var(--color-text-secondary)` plus the comment, exactly as design §2 (base rule, after `background`) |
| `libs/angular-ui-kit/src/lib/notification-center/notification-center.component.scss` | Comment at 110–115 as worded in design §7.2. No other change |
| `libs/angular-ui-kit/src/lib/drawer/drawer.stories.ts` | New `taskBodyDe` (design §7.1, same markup as `taskBody`); `GermanHeading` uses it, and its description gets the §7.1 sentence. `taskBody` untouched |
| `libs/angular-ui-kit/src/styles/theme-contrast.spec.ts` | New `describe('Component pairings of 3.19.2 (request 026)')`: 3 tests plus 2 per palette (+7) |

## Acceptance criteria

| AC | Covered by | Measured |
|---|---|---|
| AC-1 | Unit: the compiled `.lc-toast__close` body has `color: var(--color-text-secondary)` and no hex or rgb; no other close rule sets `color`. It fails with the line reverted (checked once). Story measure | rgb(75,85,99) L / rgb(196,210,217) D on all 100 closes (was rgb(0,0,0)) |
| AC-2 | Unit, per palette: text-secondary over the parsed `--gradient-surface` stops. Measure `tmp/026/measure/toast.mjs` on the 6 toast stories plus the 4 outlet stories opened, at 360/1280 in light and dark (24 + 16 shots, 40 + 60 closes) | Unit min 7.23 L / 9.26 D. Story 7.56 / 7.23 L, 9.26 / 11.16 D on every close |
| AC-3 | Unit: ring `2px solid currentColor`, offset −2px; no `forced-color-adjust` in the toast CSS. Same measure after `focus()`; `--forced-colors` probe (`forced.mjs`) | `:focus-visible` true 100/100; ring `solid 2px −2px` in the × colour, 7.23 / 9.26 min. Forced: × and stroke black on white (L) and white on black (D), ring visible, 0 of 32 toast rules opt out |
| AC-4 | Unit: the 4 hover tints read from the compiled CSS (pinned to the 3.19.1 literals) and composited over both ends | Unit and story min 6.02 L (error) / 7.82 D (warning); the full table matches design §5 |
| AC-5 | Hash proof with `button.lc-toast__close { color: buttontext }` injected (`open.mjs`, revert = true) | **82/82 identical** (66 at rest + 16 opened). Without the revert: toast 36 differ, without-close 6 and outlet at rest 24 identical, opened 16/16 differ. Close 44×44 at (295, 21) / (367, 21), at (1215, …) in the outlet |
| AC-6 | `git diff` of the NC SCSS: comment lines only, text from §7.2 | 2 lines → 4 lines |
| AC-7 | `drawer.mjs` on German Heading, 360/1280 L/D | 8/8 text nodes `de`, all German or a name; h2 2 lines, fits, `hyphens: auto`; header 73; close (302, 14) / (1222, 14); gap 6; description 3 lines (327 / 287 px); sw 360 / 1280 |
| AC-8 | Story description: the old text plus the §7.1 sentence | — |
| AC-9 | Full suite; no existing assertion changed. Drawer compare | Other 5 drawer stories: 20/20 identical after one re-shoot (filter-panel 1280 L, large-form 360 L flipped on the first run; large-form 1280 L flipped twice: 4 px at row 437, max Δ 15, noise). German Heading: 4 differ |

## Gates

All gates ran on commit `80f5747` (code; the amend adds only `requests/026-…`), so later agents skip a gate while `git diff --quiet 80f5747 -- libs tools` holds. Logs in `tmp/026/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 208 suites, 4728 passed, 8 skipped (was 4721: +7) · `test.log` |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (unchanged) · `lint.log` |
| `npx nx run angular-ui-kit:build` | green, 122 "Built" · `build.log` |
| `npm run test:tools` | tools unchanged (no extractor fixture names these stories) |
| `npx nx run angular-ui-kit:build-storybook` | green, 962 stories · `build-storybook.log` |
| Story screenshots | `tmp/story-shots/026/build` (rest), `build-open` (opened), `revert` + `revert-open` (AC-5 proof), `measure`, `forced`. Logs: `build-*.log`, `revert-*.log`, `measure-*.log` |
| `node tools/compat/check-angular-majors.mjs` | not run: no template change. The only CSS change is a `color` on a button the outlet renders only after a click |

Measure modules: `tmp/026/measure/{open,toast,drawer,forced}.mjs` (also in `dist/storybook/angular-ui-kit/zz-026/` until the next Storybook build). For the review: `--measure='(await import("/zz-026/toast.mjs")).default([0, 1, 2, 3])'`.

## Deviations from the design

None in the code. Two notes:

1. **AC-5 recipe (§9):** the revert `.lc-toast__close { color: buttontext }` at (0,1,0), read right away, painted the new × anyway (36 + 16 shots differed, Δ 99 only in the × box). Two rAFs were not enough before the shot. With `button.lc-toast__close` and a 300 ms settle, all 82 shots are identical.
2. D1 stands as designed (1.44, not 1.89). The spec comment in `theme-contrast.spec.ts` (3.19.1 block, "1.89 to 4.37:1", the axe findings of review 024) was left alone: changing it is outside §7.2.

## Changelog draft

```markdown
## [3.19.2] - 2026-10-31

The open review findings of 3.19.1 (request 025): toast close colour, a notification-center note, the German drawer story. No API breaks.

### Fixed

- **`lc-toast` close button** (025 review finding 1, WCAG 1.4.11): the × and its focus ring now use `--color-text-secondary`, the colour of the toast's action button. Before, they took the browser's black `buttontext`. Contrast on the toast gradient: 7.56 / 7.23:1 in light and 9.26 / 11.16:1 in dark (was 1.47 / 1.22:1 in dark); at least 6.02:1 (light) and 7.82:1 (dark) on the hover tints. This holds for a toast placed directly and in `lc-toast-outlet`. Size (44 × 44), position and layout are unchanged: the shots are hash-identical once the old colour is put back. In forced colours the × and the ring follow the system colours.
- Stories: Feedback/Drawer "German Heading" now has a German body, so `lang="de"` on `lc-drawer` marks only German text (025 review finding 3).
- 3.19.1 note corrected: white on the old notification-center level fills went as low as 1.44:1 (Warning, dark), not 1.89:1 (025 review finding 2).

### Compatibility

- No API breaks, no new input. The toast × is now grey (#4b5563) in light and light grey (#c4d2d9) in dark instead of black. The kit rule `.lc-toast__close` has specificity 0,1,0: an override of your own wins if it is stronger or loaded later.
```
