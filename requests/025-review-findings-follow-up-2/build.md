# Build 025: Review findings follow-up 2

- **Branch:** `fix/3.19.1-review-findings-follow-up-2` · **Commit:** `git log -1` (`fix(toast,drawer,notification-center): review findings follow-up 2`)

## Files changed

| File | Change |
|---|---|
| `toast/toast.component.scss` | dead `:host` → `lc-toast:not(lc-toast-outlet lc-toast)` (block, 100 %, max 400 px, mb `--spacing-2`); message + `hyphens: auto; hyphenate-limit-chars: 12 4 3` |
| `toast/toast.stories.ts` | With Action / All Variants drop `gap: 8px`; component + With Action descriptions (design §8) |
| `drawer/drawer.component.scss` | close 44 × 44 (`--size-min-touch-*`), margin `calc((2rem − 44px) / 2)`, `flex-shrink: 0`; header `gap: var(--spacing-3)`; heading `min-width: 0`, break-word, hyphens, limit |
| `drawer/drawer.stories.ts` | Filter Panel, Large Form: visible label + `ariaLabel` per select (no `label=`); new **German Heading**; Default's body shared as `taskBody` (renders as before) |
| `notification-center/…component.scss` | active chip `--color-primary-fill` / `--color-on-primary` / rim `--color-primary-500`; hover only on non-active chips; 4 per-level active blocks (incl. `#3b82f6`) removed; badge `--color-error-fill` / `--color-on-error`; forced-colors Highlight outline |
| 6 templates (log-viewer 6, document-viewer 9, gallery 7, combobox 3, file-upload 3, field-group 1) | 29 × `[decorative]="true"` (design §6.1) |
| `styles/theme-contrast.spec.ts` | "Component pairings of 3.19.1 (request 025)": source check + chip/badge pairings L/D |
| `kit-icons.spec.ts` | static scan: every `<lc-icon>` tag in kit sources has `decorative` or `ariaLabel` (107 tags) |
| `kit-icons.decorative.spec.ts` (new) | render check per component: all icons aria-hidden, no role/name (6 + 3 states + 7 + 3 + 3 + 1) |
| `toast/toast.layout.spec.ts`, `drawer/drawer.close-target.spec.ts` (new) | compiled-CSS and selector checks for AC-1/3/4/5/6 |
| `tools/compat/template/…/home.{ts,html}`, `check-angular-majors.mjs` | standalone `<lc-toast id="compat-toast-3191">` + `EXPECT_IN_HTML` (AC-12) |
| Existing specs | none changed |

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1 | `toast.layout.spec` (break-word, hyphens, limit); With Action 360 L/D: DE 328 × 99, 3 lines "Benachrichti-/gungseinstellun-/gen gespeichert.", no clipping, `scrollWidth` 360; 1280: 400 × 78 |
| 2 | `--compare=baseline` 66 shots: 36 differ (Success, Error, Warning, Info, Without Close, With Action × 6: block card, 400 cap, DE hyphen), 30 identical (All Variants 6, outlet 24). Line probe (`hyphens: manual` vs `auto`, 360/400/1024/1280): every EN message keeps its line count and height |
| 3 | `toast.layout.spec` (rule + `matches()`); Success 1280 `block` 400 × 58 at x 16, mb 8px (was inline 1248); 360: 328 × 78 |
| 4 | `toast.layout.spec` (outlet toast does not match); `--compare=baseline-open` 18/18 identical; Service Call 328 × 78 / 320.1 × 63 (360), 330.2 × 58 / 320.1 × 63 (1280), mb 0 |
| 5 | `drawer.close-target.spec`; shots: box 44 × 44, icon at baseline position (314,22 · 313,22 · floating 322,18), header 65 (German Heading 73, 2 lines), edge hits at 0.5 px true (24/24), heading→hit 6 px, Without Heading content y 64 vs × bottom 50 |
| 6 | spec (ring unchanged); shots: focused at open, `:focus-visible` true, 2px solid primary-500 offset 2px, name `closeAriaLabel` ("Schließen" in German Heading) |
| 7 | `theme-contrast.spec` (rest 7.23/9.26, active 6.21/6.21, rim 4.18/7.58, badge 8.39/8.39; no raw colour); click-each-chip probe: every pressed chip 6.21:1 L/D; axe `color-contrast` 0 on 28 NC shots (+4 click-probe shots) |
| 8 | NC 360: row 400 / 326 / 43.5, chips 26.5 high at x 33 / 91.1 / 161.1 / 250.1 / 339.7 (= baseline); chip target left at 26.5 px (design §6) |
| 9 | `--axe` drawer 24 shots: 0 violations (`aria-input-field-name` was 8 shots) |
| 10 | static scan + render spec (reverting 2 sites fails 3 tests); `--axe` icon stories: see Gates |
| 11 | German Heading 360: 2 lines, `scrollWidth` 360; no built-in text added |
| 12 | full Jest suite; compat 22 with the new toast check |
| 13 | `--forced-colors`: pressed chip outline 2px solid Highlight offset 1px; drawer close ring + icon (currentColor) visible; reduced motion unchanged (`animation: none` rule untouched) |

## Gates

All gates ran on commit `763d8f3` (code; the amend adds only `requests/025-…`), so later agents skip a gate while `git diff --quiet 763d8f3 -- libs tools` holds. Logs in `tmp/025/build/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 208 suites, 4721 passed, 8 skipped (was 205 / 4696 / 8; +3 suites, +25 tests) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | green, 122 "Built" |
| `npm run test:tools` | 22 / 22 pass |
| `npx nx run angular-ui-kit:build-storybook` | green, 962 stories (+1 German Heading) |
| Story screenshots | `tmp/story-shots/025/after` (vs `baseline`) and `after-open` (vs `baseline-open`), same flags and clicks. Toast 66: 36 differ as designed, 30 identical. Open outlet 18/18 identical. Drawer 20 differ (as designed) + 4 new, axe 0 / 24. NC 28: 26 differ, Compact light 2 identical, axe 0 / 28. Icon stories 160: 125 identical; 35 differ only in noise (pixel diff: log-viewer 24 = timestamp digits relative to `now`; document-viewer image-preview 4 and gallery default/small-thumbnails 3 = image loading; chat with-file-upload 4 = clock times); axe `svg-img-alt` 84 → 0 shots, the rest (`color-contrast` 33/6, `scrollable-region-focusable`, `nested-interactive` 12) unchanged vs baseline. Probes: `probe-hyph-after`, `probe-nc-click`, `forced`. Measures in `tmp/025/measure/` |
| `node tools/compat/check-angular-majors.mjs --only=22` | PASS, 85 HTML checks (+1: standalone toast classes and block rule) |

## Deviations from the design

- The source check of AC-7 covers the chip and badge rules, not the whole stylesheet: the item icons keep their `var(--color-*-default, #hex)` fallbacks (out of scope, design §2 lists only chip and badge rules).
- Design §6.1 says "115 kit tags"; the static scan finds 107 `<lc-icon>` tags in kit sources (the 8 others are JSDoc examples in `icon/`, which the scan excludes). All comply.

## Changelog draft

```markdown
## [3.19.1] - 2026-10-31

The open review findings of 3.19 (request 024): toast wrapping and width, drawer close targets, notification-center contrast, unlabelled icons. No API breaks.

### Changed

- **`lc-toast` placed directly** (024 review F2): it is now the block card its stylesheet always meant, at most 400 px wide with an 8 px bottom margin (the `:host` rule never applied under `ViewEncapsulation.None`; a toast was `display: inline` and 1248 px wide at 1280). Toasts in `lc-toast-outlet` keep their sizes (hash-identical).
- **`lc-notification-center` filter chips and badge** (024 review F4): the pressed chip, for every level, is `--color-primary-fill` with `--color-on-primary`, 6.21:1 in both themes (white on the level colours was 1.89 to 4.37:1), with a `--color-primary-500` rim (4.18 / 7.58:1) and a Highlight outline in forced colours; the unread badge is `--color-error-fill` / `--color-on-error`, 8.39:1 (was 1.99:1 dark). axe `color-contrast` 24 → 0 shots.
- **`lc-drawer` close button** (024 review F3): 32 × 32 → 44 × 44 px in its old slot; the header stays 65 px and the icon where it was. A long heading wraps and hyphenates instead of running under the button.

### Fixed

- **`lc-toast` message** (024 review F1): a long German compound breaks at a syllable with a hyphen ("Benachrichti-/gungseinstellun-/gen gespeichert." at 360 px, needs `lang`); short English words stay whole.
- **Decorative icons** in `lc-log-viewer` (6), `lc-document-viewer` (9), `lc-gallery` (7), `lc-combobox` (3), `lc-file-upload` (3) and `lc-field-group` (1): each sits in a named button or beside its text; axe `svg-img-alt` 84 → 0 shots.
- Stories: Feedback/Drawer "Filter Panel" and "Large Form" show a label above each `lc-select` and name it with `ariaLabel` (axe `aria-input-field-name` 0); new story Feedback/Drawer "German Heading".

### Compatibility

- No API breaks, no new input. A toast placed directly is now at most 400 px wide and has 8 px below it; to fill the parent, give it a class: `.my-toast { max-width: none }` (the kit rule's specificity is 0,0,3). A pressed notification-center chip no longer takes its level's colour.
```
