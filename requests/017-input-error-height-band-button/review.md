# Review 017: lc-input error-state height and a link button on the hero band

## Round 1 — 2026-10-25, commit 5fedef2 (libs/tools = ae6b576)

Screenshots: `tmp/story-shots/017/` — `r1/` (compare vs `baseline`, 75 stories, 360/1280, light/dark, `--full`, 300 shots), `r1-new/` (4 new stories, 360/1024/1280 for the band link and the input story, light/dark), `r1-focus/` (focus + axe), `r1-diffcheck/`, `r1-hook/`. Logs: `tmp/017/r1-compare-{a,b,c}.log`. Static Storybook of the developer, not stale.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | Error container `class="input-container input-lg input-invalid"`, message `class="input-error"`; `.input-container.input-error` count 0 in all 5 error stories (`r1-diffcheck`). SCSS: `&.input-invalid` for the state, `.input-error` only on the message rule. `input.error-class.spec.ts` |
| AC-2 | pass | `form-input--error-keeps-height`, 360/1024/1280 × light/dark: idle = error = error + focus = xs 24, sm 32, md 40, lg 44; row tops equal per pair (45/45 … 396/396 at 360) |
| AC-3 | pass | Border and focus outline light `rgb(157, 14, 14)` / dark `rgb(247, 161, 161)`, 2 px; message 12 px, same colour, `role="alert"`, 4 px below; `aria-invalid="true"`. Disabled/readonly stories hash-identical |
| AC-4 | pass | design §2 decision (container `input-error` not kept, `p.input-error` stable); `error` JSDoc names both classes; changelog draft Changed names old → new |
| AC-5 | pass | Only `input.component.spec.ts:325` changed, with the G-WL3 reason; `:277` unchanged (build.md: 181 suites green) |
| AC-6 | pass | design §5.1 table (9 bands × 9 variants) |
| AC-7 | pass | `layout-hero--band-link`, rendered values composited at the measured opacity 0.85 over band `rgb(13,53,61)` → `rgb(32,132,151)`, minimum over t 0–1: label 9.28 / 8.69 / 8.11, fill 3.62 / 3.39 / 3.16 (default / hover `#f0f8fa` / active `#e0f1f4`), ring `solid 2px #fff` offset 2, 3.62. Identical in light and dark |
| AC-8 | pass | 360: 320 × 71 at x 20, 2 lines; 1024/1280: 338.22 × 48.5 at x 56/176, 1 line; doc scrollWidth = clientWidth (360/1024/1280), link 318/318 and 336/336; both themes |
| AC-9 | pass | Native `<a href="#warteliste">`, tabIndex 0, no `tabindex` attribute, target exists; `focus()` → `:focus-visible`, white ring (shot `r1-focus/layout-hero--band-link--360-dark`); forced-colours rules in the page sheets (`buttontext` / `linktext` / `highlight`); spec: no listeners. axe 4.14: 0 violations on the 4 new stories (incomplete = gradient contrast only) |
| AC-10 | pass | build.md: compat 22 PASS with the 3 new `EXPECT_IN_HTML` checks; Angular 21 runs in the CI matrix on `main` |
| AC-11 | pass | `--compare`: 280 identical, 20 different, 0 missing. All 20 are the 5 stories with an error field at load (`form-input--with-error`, `--error-summary`, `form-email-input--with-error`, `--invite-form`, `feedback-alert--form-validation`), each field now 40 px (was 42). Every button, button-link and hero shot identical |
| AC-12 | pass | `variant` JSDoc with `@default 'primary'` on both components, `error` with `@default undefined`; both `variant` argTypes list `inverse` with description and `table.defaultValue`; `linkLabel` argType complete; hook `--lc-button-inverse-fg` works set on an ancestor (`rgb(13,53,61)` → `rgb(1,2,3)`); `test:tools` 22/22 |

**Deviation confirmed:** 20 expected diffs, not 16. Team Invite (`form-email-input--invite-form`) shows "Email address is required" at load (`input-md input-invalid`, 40 px; shot `r1/…invite-form--360-light`: the three fields are now equal). The design's list was incomplete, and "77 stories" was a counting error (75); design.md §9 is corrected with a change note.

**Limits:** the real-key Tab/Enter pass (`tmp/story-shots/016/ax-pass.mjs`) needed approval and wasn't run. Keyboard evidence: native anchor, tabIndex, `:focus-visible`, the unit test with no listeners.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | nit | `components-button--inverse`, 1280, both themes | The five buttons on one row, as design §8 lists them | The icon-only "Add" wraps onto its own row (x 64, y 220.48) because the `sm` hero body ends before it. Story layout only |
| 2 | nit | `layout-hero--band-link`, 360 | — | "ein" sits alone on line 2, as drawn in design §3. Not for this release: a later request could try `text-wrap: balance` on multi-line `.btn` labels (kit-wide, changes the wrapping stories). life-os can also use "Zur Warteliste" (168.8 px, 1 line) |
| 3 | nit | `layout-hero--band-link` story copy | One language in the band | English body ("Shows you every day …") next to a German label and target text |

**Verdict:** approved
