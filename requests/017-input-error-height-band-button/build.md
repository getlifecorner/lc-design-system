# Build 017: lc-input error-state height and a link button on the hero band

- **Branch:** `feat/3.13-input-error-height-band-button` (from `main` d73b7e2)
- **Commit:** branch tip, `feat(forms): lc-input keeps its height in an error; inverse button variant for the hero bands`. `libs` and `tools` = `ae6b576`

## Files changed

| File | Change |
|---|---|
| `lib/input/input.component.{html,scss}` | Container state `[class.input-invalid]` (was `input-error`); `p.input-error` and its rule unchanged, commented as the message's stable class |
| `lib/input/input.component.ts` | `error` JSDoc per design §2, `@default undefined` |
| `lib/input/input.component.spec.ts` | `:325` asserts `input-invalid` (stated reason G-WL3, AC-5); `:277` unchanged |
| `lib/input/input.error-class.spec.ts` | New: AC-1 classes, `aria-invalid` parity, 3.12 default classes, message id/role, compiled-CSS selectors |
| `lib/input/input.stories.ts` | `ErrorKeepsHeight` ("Error Keeps the Height (G-WL3)") |
| `lib/button/button.component.{ts,html}`, `button-link.component.ts` | `ButtonVariant` + `'inverse'`; `btn-inverse` in the class map; `variant` JSDoc per §2 on both |
| `lib/button/button.component.scss` | `.btn-inverse` (white fill, ink `var(--lc-button-inverse-fg, #0d353d)`, hover `$color-primary-50`, active `$color-primary-100`, white ring after `.btn:focus-visible`), forced-colours rule per §5.2 |
| `lib/button/button.styles.spec.ts` | New `inverse variant (G-WL1)` block: values from the compiled button, theme and hero CSS; WCAG ratios at `#208497` × .85 and over the whole band; four other bands; forced colours; no motion |
| `lib/button/button.component.spec.ts`, `button-link.component.spec.ts` | Variant list + `inverse` (also in the class filter, `:75`), default class pin, AC-9 anchor test |
| `lib/button/button{,-link}.stories.ts`, `lib/hero/hero.stories.ts` | `Inverse` ×2, `BandLink`; `variant` argTypes gain `inverse`; meta docs list 9 variants |
| `tools/compat/template/src/app/probe-313.ts`, `home.{ts,html}`, `check-angular-majors.mjs` | Band probe; 3 `EXPECT_IN_HTML` checks (inverse class, inverse rule in page CSS, `input-invalid` without container `input-error`) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1 | `input.error-class.spec.ts` (classes both ways; `input-error` only in the `.input-error` selector) |
| 2 | `form-input--error-keeps-height` measure, 360/1280, light/dark: idle = error = error+focus = xs 24, sm 32, md 40, lg 44 (`tmp/017/m-height.log`) |
| 3 | Measure: border/outline light `rgb(157, 14, 14)`, dark `rgb(247, 161, 161)`, message 12 px, `role="alert"`, 4 px below; disabled/readonly shots identical |
| 4 | §2 decision implemented; changelog Changed (below) |
| 5 | Full Jest green; only `input.component.spec.ts:325` changed |
| 6 | design.md §5.1 |
| 7 | `button.styles.spec.ts`: 9.28/8.69/8.11, 3.62/3.39/3.16, ring 3.62 (exact); rendered bg `#fff`, ink `rgb(13, 53, 61)`, ring `solid 2px #fff` offset 2 in both themes |
| 8 | `layout-hero--band-link`: 360 = 320 × 71 at x 20, 2 lines; 1024/1280 = 338.2 × 48.5 at x 56/176, 1 line; doc = client at all widths, both themes |
| 9 | Spec: href, no listeners, `btn btn-inverse btn-lg`; measure: `:focus-visible` true, white ring; forced-colours rules found in the page sheets; no new motion (spec) |
| 10 | Compat 22: `class="btn btn-inverse btn-lg"` in the hero, `.btn-inverse` rule in page CSS, `input-invalid` and no container `input-error` |
| 11 | Shots vs baseline: 280 identical, 20 differ (see Deviations); spec lists extended |
| 12 | JSDoc + argTypes; `test:tools` 22/22 |

## Gates

All gates ran on `ae6b576` (later agents: `git diff --quiet ae6b576 -- libs tools`). Logs in `tmp/017/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 181 suites, 4351 passed, 8 skipped (was 180 / 4316) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (= baseline) |
| `npx nx run angular-ui-kit:build` | green, 120 entries built |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | green, 908 stories (+4) |
| Story screenshots | New: `tmp/story-shots/017/new/` (4 stories; band link at 360/1024/1280). Compare: `tmp/story-shots/017/after/` vs `baseline` (`tmp/017/compare.log`) |
| `check-angular-majors.mjs --only=22` | PASS, Angular 22.2.3; 71 checks (68 + 3), all ok |

## Deviations from the design

- **Expected diffs: 20, not 16.** `form-email-input--invite-form` (Team Invite) shows "Email address is required" at load, so its md field is 2 px shorter too (same cause, not listed in §9). A shift-aware pixel diff (`tmp/017/measure/shift.mjs`) explains all 20: each has one 16-row band (the field box) and below it rows equal to the baseline 2 px lower (4 px below the second field in `feedback-alert--form-validation`).
- Baseline is 75 stories (300 shots = 75 × 4), not 77; nothing missing. None in the API, visuals or tokens.

## Changelog draft

## [3.13.0] - 2026-10-25

`lc-input` keeps its height when it shows an error, and the new `inverse` button variant gives a link button a visible boundary on the dark `lc-hero` bands (G-WL3, G-WL1; life-os website waitlist). No API breaks.

### Added

- **`variant="inverse"` on `lc-button` and `a[lcButton]`** (G-WL1): a white pill with dark ink (`#0d353d`) and a white focus ring for dark, coloured or image backgrounds that don't follow the theme, such as the default `lc-hero` bands; the same in both themes. On the teal (`primary`) band, under the hero body's 85 % opacity at the band's light end: label 9.28:1, fill 3.62:1, ring 3.62:1 (hover 8.69 / 3.39, active 8.11 / 3.16). Before, no variant had a boundary there (every fill reached 1.00:1, the ring 1.00 light / 2.06 dark). It also passes on the neutral, info, accent-purple and accent-violet bands, not on secondary, success, warning, accent-orange or light backgrounds. CSS hook `--lc-button-inverse-fg` (default `#0d353d`) sets the ink. In forced colours the border is `ButtonText` (`LinkText` on links) and the ring `Highlight`. With `size="lg"` (48.5 px), "Trag dich jetzt in die Warteliste ein" wraps onto two lines at 360 px (320 × 71 px) without horizontal scroll and stays on one from 1024 px.
- Stories: Components/Button and Components/Button Link "Inverse (G-WL1)", Layout/Hero "Band Link (G-WL1)", Form/Input "Error Keeps the Height (G-WL3)".

### Changed

- **`lc-input`: the field container's error-state class is `input-invalid`** (was `input-error`, G-WL3). The message keeps `<p class="input-error">`, now documented as its stable class. CSS on `.input-container.input-error` must use `.input-container.input-invalid`.

### Fixed

- **`lc-input` no longer grows when it shows an error** (G-WL3; life-os waitlist and the contact form's 422 answer). The container shared the message's class and took its `flex: 1`: xs 24 → 28, sm 32 → 35, md 40 → 42, lg 44 → 49 px. Now xs 24, sm 32, md 40, lg 44 px idle, in error and in error with focus (360 and 1280 px, light and dark). Border, focus outline, message colour, 12 px size and `role="alert"` are unchanged.

### Compatibility

- No API breaks: `ButtonVariant` gains `'inverse'`, nothing is removed, defaults render as before. Of 300 screenshots (button, button link, hero, input, email input, and the error stories of alert, password and verification-code input) 280 are identical; 20 differ only because an error field shown at load is 2 px shorter, so the content below it moves up.
- `lc-password-input` and `lc-verification-code-input` were not affected (own class names).
