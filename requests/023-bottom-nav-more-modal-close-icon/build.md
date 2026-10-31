# Build 023: lc-bottom-nav "More" on request; decorative lc-modal close icon

- **Branch:** `feat/3.18-bottom-nav-more-modal-close-icon` (from `main` fe4952a, 3.17.0)
- **Commit:** see `git log -1` (one commit, amended; the gates ran on the code of `3c23244`)

## Files changed

| File | Change |
|---|---|
| `lib/bottom-nav/bottom-nav.component.ts` | `showMore = input(false)` with JSDoc (§2); `entries` skips the early return when `showMore` (D2); JSDoc of `maxItems`, `moreLabel`, `moreIcon`, `moreRoute`, `moreClick` and the class bullet as in §2, `@default` on the touched inputs |
| `lib/bottom-nav/bottom-nav.component.spec.ts` | new `describe` "showMore, request 023": 9 tests (AC-1 default pin, 2, 3, 4 ×2, 5, 7, empty list, no `reselect` on "More") |
| `lib/bottom-nav/bottom-nav.stories.ts` | `showMore` argType; `maxItems`/`more*`/`moreClick` descriptions; Key Features line; stories *Show More*, *Show More (German, floating)*, *Show More with Fixed Slots*; D5 `variant: 'docked'` in *Default* and *Finance Destination* |
| `lib/modal/modal.component.html` | close icon `[decorative]="true"` (D4) |
| `lib/modal/modal.component.spec.ts` | AC-9 test (svg `aria-hidden`, no `role`/`aria-label`; button name "Close modal", then "Schließen") |
| `lib/modal/modal.stories.ts` | D5: *Destructive Confirmation* header icon `[decorative]="true"` |
| `tools/compat/template/src/app/home.html` | 2-item bar: `[showMore]="true" moreLabel="Mehr" moreRoute="/mehr"` |
| `tools/compat/check-angular-majors.mjs` | `EXPECT_IN_HTML` "bottom nav "Mehr" on request (023 AC-8)" |

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1 | existing bottom-nav spec unchanged and green; test "is off by default and renders exactly as before"; 42 of 54 nav shots identical, the 12 differing ones are exactly *Default* and *Finance Destination* (D5: docked surface and 1 px top border now render) |
| 2 | unit: 3 `li`, labels `[Heute, Haushalt, More]`, hrefs `/`, `/household`, `/more` |
| 3 | unit: 4 / 5 / 6 items at `maxItems` 5 → `[4 + More]` each (5th hidden, "More" current on its route), 3 at `maxItems` 3 → `[2 + More]`; always one "More" |
| 4 | unit: `a[href="/mehr"]` "Mehr", icons `[sun, home, bars-3]`; without `moreRoute` `button[type=button]`, `moreClick` once, never current |
| 5 | unit: `/mehr` and `/mehr/quellen` → one `aria-current` = "Mehr" with `--current`; `/` → "Heute" |
| 6 | `--measure` 360/1024/1280 × L/D: docked 114 × 64 at x 25/139/253, floating 102.67 × 64 at x 42/144.66/247.33, pills 56 × 32 (x 54/168/282; 65.33/167.98/270.66), `scrollWidth = clientWidth` (358, 324), 3 `li`; contrast below |
| 7 | unit: `A` with href / `BUTTON`, no `tabindex`, text = label, pill and svg `aria-hidden="true"`, svg without `role`; axe on the 3 new stories: 0 violations |
| 8 | compat 22: "bottom nav "Mehr" on request (023 AC-8)" ok (server HTML: `<a class="lc-bottom-nav__item" href="/mehr">` … `Mehr`); "bottom nav current item" still ok |
| 9 | unit (`modal.component.spec`); fails on the old template (checked) |
| 10 | `--axe` on 5 modal + 5 confirm-dialog stories, modal open: 40 shots, 0 violations (baseline: `svg-img-alt` in 40) |
| 11 | same run: 40 / 40 hash-identical; close button 44 × 44, svg 24, ring `solid 2px` offset 2, colours as baseline |
| 12 | changelog draft below; READMEs list components only (no change) |

Contrast (AC-6, composited): label 7.56 L / 11.16 D docked, 10.45 D floating; current on pill 7.85 L, 8.14 D docked, 7.63 D floating (§5: 8.13 / 7.58, the same rgb values; the composite is rounded differently).

## Gates

All gates ran on the code of `3c23244` (later agents skip a gate while `git diff --quiet 3c23244 -- libs tools` holds). Logs: `tmp/023/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 201 suites, 4660 passed, 8 skipped (+10 tests against 3.17) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | ok, 122 "Built" lines |
| `npm run test:tools` | 22 pass |
| `npx nx run angular-ui-kit:build-storybook` | ok, 958 stories (+3) |
| Story screenshots | nav `tmp/story-shots/023/nav` vs `baseline` (`--full`): 42 identical, 12 different (D5 only); modal `tmp/story-shots/023/modal` (`--axe`, open-modal measure `tmp/023/measure/open-modal.mjs`): 40/40 identical, 0 violations; new `tmp/story-shots/023/new` (3 new + 2 D5 stories × 360/1024/1280 × L/D, `tmp/023/measure/nav.mjs`, `--axe`): 30 shots, 0 violations |
| `check-angular-majors.mjs --only=22` | PASS, 83 checks (82 + 1) |

No existing assertion changed. The new "no `reselect` on More" test stubs `Router.navigateByUrl`: `provideRouter([])` has no `/more` route, and the rejected navigation crashed the Jest worker.

## Deviations from the design

None.

**Findings outside the scope (design §1 audit; not changed):** `lc-drawer` close icons (`drawer.component.html:35,45`) and `lc-notification-center` item and empty-state icons have the same `svg-img-alt` defect: proposed as a follow-up request.

## Changelog draft

The Finance Intelligence sources page (gap file quellen-2026-10-31, rows 6 and 8): a "More" entry on request in the bottom bar, and a modal close button that axe accepts. No API breaks.

### Added
- **`lc-bottom-nav showMore`** (row 6, a bar with fixed slots: two destinations plus "Mehr"): ends the bar with the "More" entry (`moreLabel`, `moreIcon`, and `moreRoute` or `moreClick`) even when every destination fits. "More" takes one of the `maxItems` entries, so with `showMore` the first `maxItems − 1` destinations stay and any others move behind it, as on overflow. "More" is current on `moreRoute` and its sub-pages (`/mehr/quellen`). Three entries at 360 px: 114 × 64 px docked, 102.67 × 64 px floating; labels 7.56:1 light, 11.16:1 dark. Finance Intelligence: drop the own "Mehr" item, bind `[showMore]` where the role has targets beyond the bar, with `moreLabel="Mehr" moreRoute="/mehr"`, and keep `[maxItems]="5"`. "Mehr" is current on `/mehr` and its sub-pages; keep mapping other pages reached through "Mehr" (such as `/datenbasis/quellen`) to `/mehr` in `activeRoute`.
- Stories: Navigation/Bottom Nav "Show More", "Show More (German, floating)", "Show More with Fixed Slots". *Default* and *Finance Destination* now show the docked bar they describe.

### Fixed
- **`lc-modal` close button** (row 8): the `x-mark` icon is decorative (`aria-hidden="true"`, no `role="img"`), so axe no longer reports `svg-img-alt` (WCAG 1.1.1) with a modal open; the button keeps its name from `closeAriaLabel`. `lc-confirm-dialog` gets the same fix. Looks as before (40 of 40 screenshots identical, 0 axe violations in 10 modal and confirm-dialog stories). Finance Intelligence can remove the `.lc-modal__close svg` entry from `KIT_DEFECTS`.

### Compatibility
- No API breaks. `showMore` defaults to `false`, and the bar renders as in 3.17 (Jest pins it). A test that finds the modal close icon by `role="img"` now finds it by `aria-hidden="true"`.
