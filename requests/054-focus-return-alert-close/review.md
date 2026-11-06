# Review 054: returnFocusTo, focusContext(), focusItem(), 44 px alert close

## Round 1 — 2026-11-06, commit b1b7881 (gates on 938b950, `git diff --quiet 938b950 -- libs tools` holds)

Screenshots: `tmp/story-shots/054/` — `new/` (developer, at rest, 360 · 1024 · 1280, L · D), `r1/` (focus flows, 360 · 641 · 1280, L · D, measure `r1-measure.js`), `r1-ink-proto/` (D-5 prototype, 150 shots), `r1-fc-proto/` (6, forced colours). Unchanged stories: the developer's `build-alert` 150/150 and `build-other` 114/114 against `baseline` on the same Storybook build, so they were not re-shot. Opened 10 shots.

The opener is clicked with `HTMLElement.click()`, so it never gets focus (the WebKit tap). Every step waits 400 ms.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | Input and JSDoc as in design §2 (`@default null`). `r1`: 30/30 modal closes land on the trigger's `<button>` |
| AC-2 | pass | Unit `modal.return-focus` (19). `r1` at 360/641/1280 L/D: Escape, „Speichern“ (`open` false), ×, backdrop |
| AC-3 | pass | Unit: disconnected, removed while open, disabled, unfocusable `div` |
| AC-4 | pass | 24/24 modal/confirm baseline shots identical. `r1` "focused opener + Escape" 6/6 on the opener (the Chromium/keyboard case) |
| AC-5 | pass | `r1`: `center` (A) and `auto` sheet (B) at 360/641/1280 L/D, ring 4.37 L / 9.95 D on the trigger |
| AC-6 | pass (stand-in) | WebKit can't be driven here. The spec's assumption applies: unit tests start with `body` active, and the Chromium click doesn't focus. The manual Safari check is still open, and the changelog says so under *Known* |
| AC-7 | pass | `r1`: „Abbrechen“, „Löschen“ and Escape 18/18 at 3 widths L/D. Unit 10, `ConfirmService` included |
| AC-8 | pass | Unit 8. `r1` at 360: header 2 (`inline`) is `display: none`, and `focus()` moves nothing |
| AC-9 | pass | `r1`: after the row „August 2026 · Fassung 2“ the focus is on header 1's button, named „Monatsstand wählen, Monatsstand August 2026 · Fassung 2“ (360/641/1280 L/D). Header 2 reads „… Juli 2026 · Fassung 1“ at 641/1280 |
| AC-10 | pass | 36/36 header baseline shots identical. Page overflow 0 at 360/641/1280 |
| AC-11 | pass | Unit 22. `r1`: action 18/18, clickable row 12/12 |
| AC-12 | pass | Unit: unknown id, plain/disabled/href-disabled rows, no action, template, destroyed |
| AC-13 | pass | `r1`: md list with dividers, badges, `selected` and lg outline actions, plus an sm clickable list. Ring L 4.37 (selected row 4.06), D 9.13 (9.44) = design §5. 54/54 list baselines identical |
| AC-14 | pass | `r1` scan (0.25 px steps): 8 × per shot, box 28 × 28, hit 45 × 45 (44 plus one step). Developer `hit-build` 48/48 incl. 320 px and 200 % (box 36) |
| AC-15 | pass (hit area); colour see F-1 | 150/150 identical. At 1280 the action's right edge and the hit area's left edge are both 1215.00 px. The hit test gives the × the action's last < 1 px (right − 0.75 → ×, right − 1 → action), and the × is the upper layer as documented in §6. Heights equal |
| AC-16 | pass | Five stories with the IDs from §8. `returnFocusTo` argTypes have `control: false`, a description and `defaultValue` `null`. The methods are in the meta descriptions (MCP) |
| AC-17 | pass | No colour changes in 054 as built. FC shots in `new-fc/`. axe 0 violations in 30 shots. No live region. Nothing animates |
| AC-18 | pass | No new built-in strings. DE stories have no page or sheet overflow at 360 |
| AC-19 | pass | Compat 22: 101 ok (build.md). Only template refs were added |
| AC-20 | pass (draft) | Changelog draft in build.md. It needs the F-1 update |

API check against §2: names, types, defaults, JSDoc, `ListItemPart` export (`export *`), the `untracked` read, the environment injector, the pending-ref replacement and the `::before` inside the block all match. The story names follow each file's casing („Focus return“ in modal/confirm, as „Bottom sheet on phones“).

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F-1 | must-fix | `lc-alert` and `lc-error-display` dismissible ×, dark, all widths | Glyph ≥ 3:1 (1.4.11) at rest and on hover. Add `color: inherit;` inside `.lc-alert__close {` (design D-5). Prototype (`r1-ink-proto`, `r1-success-probe`): L 13.66–16.00 at rest, 9.59–13.94 on hover; D 13.90–16.70 at rest, 9.45–15.32 on hover. Compare: 84 identical, 66 differ (exactly the shots with a ×); FC 6/6 identical | UA `buttontext` black. D: error 1.15, info 1.26, warning 1.39 at rest; 1.26 / 1.52 / 2.04 on hover. This is pre-existing (018 S2, in 3.13.1's *Known*, never queued). It goes into 054 because 054 makes this × the 44 px target: in dark the new target can't be seen |
| F-2 | nit | `navigation-header--focus-context`, sheet | „Gewählt“ and `selected` follow `month` (derive `snapshotChoices` from it) | After a choice of August the sheet still marks September as „Gewählt“ (story data only) |
| F-3 | nit → backlog | `lc-alert` with an inline `slot="action"` button at 360 | The message keeps a readable column, e.g. auto-stacking below a container width | Body 69.7 px wide beside „Erneut versuchen“ + × (101.7 px without ×, *With Action*), one word per line. This is the 3.2 layout, not changed by 054 |

**F-1 tasks for the developer:**
1. Make the SCSS change in D-5.
2. In `alert.close-target.spec.ts`, pin `color: inherit` and exclude the 3 additions from the 3.33.1 sha1.
3. Change the *Close Target* story text: "look unchanged" becomes "glyph in the text colour".
4. Update the changelog's *Fixed* entry. It may no longer say "pixel-identical". Use 84/150 identical, 66 differ only by the × colour, the values above, and both themes.
5. Gates: alert specs, then the full suite once, lint, build and build-storybook. Then `--compare=tmp/story-shots/054/baseline` on the 25 stories, expecting 84/66 as above, and `--compare=tmp/story-shots/054/r1-ink-proto`, expecting 150/150. A difference here is accepted only when the × colours are equal.

F-2 is optional in the same round.

**Verdict:** changes requested (F-1)

## Round 2 — 2026-11-06, commit 0e0b408 (gates on 77fa5c7, `git diff --quiet 77fa5c7 -- libs tools` holds)

The diff since round 1 (938b950..77fa5c7) touches only `alert.component.scss` (`color: inherit` after `border: none`), `alert.close-target.spec.ts`, `alert.stories.ts` and `header.stories.ts`. The ACs not listed below keep their round-1 result. Developer's Storybook build, not stale. Shots: `r2/` (25 stories × 360/1024/1280 × L/D), `r2-revert/`, `r2-f2-review/`. Opened 1 shot (*Close Target* 360 dark: the × is visible).

| AC / finding | Result | Evidence |
|---|---|---|
| F-1 / AC-17 (× glyph ≥ 3:1) | pass | `r2/` ink measure (no CSS injected), 66 shots with a ×, rest / hover: L `#111827` error 13.66 / 9.59, info 14.13 / 10.59, warning 15.95 / 13.94; D `#f1f6f8` warning 13.90 / 9.45, info 15.28 / 12.66, error 16.70 / 15.32. No `rgb(0, 0, 0)` glyph left. Success (no × in these stories) from `r1-success-probe`, as in design §5 |
| AC-15 (only the glyph colour changes) | pass | `r2/` vs `r1-ink-proto`: 150 identical / 0 differ (the proto's 84 equal `baseline`). Revert proof: *Close Target* with `color: revert !important` injected is hash-identical to round 0's `new/` 6/6 (glyph back to `#000`, D 1.26), so the round-1 change is the glyph colour only. Box 28 px. FC: developer `r2-fc` 6/6 = `fc0` |
| F-1 spec pin | pass | `alert.close-target.spec.ts`: `color: inherit` right after `border: none` in `.lc-alert__close`, no variant rule sets the × `color` (regex skips `background-color`), the 3.33.1 sha1 (6722, `11ed3a6…`) after removing all 3 additions. `test-alert-r1.log`: 4 suites, 71 tests |
| F-1 story texts | pass | Meta: "its glyph is in the text colour". *Close Target*: "at least 13.66:1 at rest and 9.45:1 on hover (it was 1.15–1.39:1 in dark)" = the minima above over both themes |
| AC-20 (changelog draft) | pass | build.md: *Fixed* split into "44 × 44 px target" (no "look unchanged"; box, hover fill, ring and height) and "visible in dark" with 018 S2, the before/after ranges per theme, 84 identical / 66 differ by the glyph colour, FC `ButtonText`. Summary line and *Compatibility* name `color: inherit` |
| F-2 / AC-9 story | pass | `r2-f2-review` measure, 360 + 1280 L: at first September `aria-current` + „Gewählt“; after the row August the focus is on header 1's button („… August 2026 · Fassung 2“) and the reopened sheet marks August only; Escape → header 1's button, sheet empty. At 1280 via header 2: Juli → focus on header 2's button, both names „… Juli 2026 · Fassung 1“, sheet marks Juli only. At 360 header 2 is hidden |

API: unchanged since round 1 (no input, output or type added in r1).

### Findings

| # | Severity | Status |
|---|---|---|
| F-1 | must-fix | fixed (above) |
| F-2 | nit | fixed (above) |
| F-3 | nit → backlog | open: message column beside an inline action + × at 360 (69.7 px), 3.2 layout |

Notes for the release-manager: the AC-6 manual Safari/iOS check stays open (build.md *Deviations*, changelog *Known*). The r1 test gate is two runs: the full suite lost `datepicker.month` (untouched) to a worker SIGSEGV, and it passed alone 28/28 (`tmp/054/test.log`, `test-datepicker-month.log`).

**Verdict:** approved
