# Spec 039: Progress-bar dark fill, focus halos, dependency-viewer borders, description-list row semantics

- **Status:** ready
- **Type:** bug fix (accessibility contrast and semantics, four findings)
- **Affected:** `lc-progress-bar` (+ `lc-progress-ring` only if it shares the primary mapping), `lc-notification-center`, `lc-log-viewer`, `lc-code-block`, `lc-dependency-viewer`, `lc-description-list`, and the other halo files (inventory in AC-5); possibly `_theme-dark.scss` / `theme-contrast.spec.ts`; CHANGELOG
- **Semver impact:** patch — contrast, focus and semantics fixes; no input, default value or public hook changes. Exception: if F-17 needs a new input or a changed DOM that consumers' tests select by `role=button` (see Assumption 4), the designer must say so and this becomes minor.

## Need

Four open follow-ups of request 036 (design.md §9; CHANGELOG 3.23.1 *Known*). Found by measurement, not yet reported from a consumer page.

| ID | Failure today |
|---|---|
| F-14 | `lc-progress-bar` primary fill in dark is 2.89:1 on the `--color-surface-2` track (needs ≥ 3:1, non-text graphic). |
| F-15 | A 20 % `--color-primary-500` halo (`box-shadow: 0 0 0 3px color-mix(… 20%, transparent)`, 1.28:1 light, 1.50:1 dark) is the only focus indicator on e.g. notification-center title (scss ~221) and dismiss (~358), the log-viewer jump-to-bottom button (~367), and code-block copy (40 % halo, ~66). The 036 count is about 13 uses in 10 files. Fails WCAG 2.4.11/1.4.11; no `forced-colors` Highlight. |
| F-16 | `lc-dependency-viewer` toggle and node borders use neutral-300 (`--color-border`, lines 33, 220), below 3:1 as UI boundaries. |
| F-17 | `lc-description-list` `clickable` rows carry `role="button"` + `tabindex=0` inside a `<dl>` (html lines 6–7). A `role` on the row element breaks the term/value group semantics for assistive tech. |

## What the kit has today

- Reference focus style: `lc-description-list` since 3.23.1, a 2 px `--color-primary-500` outline (≥ 3:1 both themes). Reuse it, don't invent a new look.
- `--color-border-strong` exists (already used for dependency-viewer edges, line 173); the designer checks it for ≥ 3:1 on `--color-surface` in both themes before choosing it.
- Progress-bar primary comes from `colors.$color-primary-500` in a per-colour map (scss line 10; secondary was already fixed in 036 with a computed value).
- Form-field halos where `border-color` also changes to primary-500 (textarea, number-input, search-input, password-input, combobox, tag-input, date-range-picker, color-picker, verification-code-input) are probably acceptable because the 1 px border carries the indicator. The designer measures that border against the field background and decides per file (AC-5).

## Scope

- In: the four findings, both themes, `forced-colors` for every touched focus style, tests, stories, changelog entry (Fixed; remove the matching *Known* items).
- Not in: shared status colours (`--color-success/warning/error/info…`) stay unchanged; new inputs; other focus styles that already have ≥ 3:1; redesign of the dependency-viewer.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | Progress-bar primary fill vs `--color-surface-2` track is ≥ 3:1 in dark and still ≥ 3:1 in light; all other colours keep their ratios (never lower than today). Value change confined to the progress-bar; no global token change. | computed contrast in a spec (extend or add next to `theme-contrast.spec.ts`), measured in the primary stories, light + dark |
| AC-2 | No focus indicator on the touched controls is only a ≤ 40 % alpha halo. Each shows a solid ≥ 3:1 indicator against its adjacent background (e.g. 2 px `--color-primary-500` outline, offset so it is not clipped), in light and dark, and it is not clipped by `overflow: hidden` at 360 px. | story at 360 / 1024 with `:focus-visible` forced + `--measure` of computed outline width/colour; contrast computed |
| AC-3 | Every touched focus style resolves to `Highlight` (outline-colour) under `forced-colors: active`; no indicator relies on `box-shadow` alone. | CSS assertion in spec or story with forced-colors emulation |
| AC-4 | Focus is visible by keyboard Tab on: NC title button, NC dismiss button, log-viewer jump-to-bottom, code-block copy, and every other control of AC-5, and does not appear on mouse click. | story play/keyboard screenshot, `:focus-visible` behaviour check |
| AC-5 | `design.md` lists every halo-only focus rule in `libs/angular-ui-kit/src/lib/**/*.scss` (grep `color-mix(… primary-500 N%` with N ≤ 40, `rgba(32, 132, 151, 0.2)`, `--color-error-600) 20%`), with a keep/fix decision and the measured ratio of the remaining indicator. All "fix" rows are done; "keep" rows state the border ratio ≥ 3:1. | design.md inventory + review |
| AC-6 | Dependency-viewer toggle and node borders are ≥ 3:1 against the surface they sit on, in light and dark; edge lines, labels and panel dividers are unchanged unless they also fail (state so in design.md). | computed contrast, stories light + dark at 360 and 1280 |
| AC-7 | Clickable description-list rows keep dl group semantics: the accessibility tree shows the `dl` with its `dt`/`dd` pairs intact (no `role` override on the row wrapper, or on `dt`/`dd`), and the row is still reachable and operable by Tab, Enter and Space with an accessible name containing term and value. | unit test on DOM (no `role="button"` on a group child unless the designer shows this keeps the group) + screen-reader/a11y-tree note in review |
| AC-8 | Description-list click behaviour, `clickable` input, outputs, 44 px target and AA values from 3.23.1 are unchanged; existing specs pass without edited assertions, except any that assert `role="button"`, which change only with the stated reason of F-17. | existing spec run, diff of assertions |
| AC-9 | English and German: touched controls (NC buttons, jump-to-bottom label, dependency toggle) do not clip the indicator or text with the longer German strings. | stories with DE locale at 360 px |
| AC-10 | Prerendered HTML: the description-list markup change (if any) is present before JavaScript; layout of all touched components is unchanged (screenshots identical apart from the indicator and fill/border colour). | `check-angular-majors.mjs` EXPECT_IN_HTML if the DOM changes; `story-shots --compare` |
| AC-11 | `prefers-reduced-motion`: no new transitions on the focus indicators. Unchanged defaults: no new input, no changed default value. | review of diff |
| AC-12 | CHANGELOG entry under Fixed for F-14 to F-17 with measured ratios; the 3.23.1 *Known* line stays as history, and nothing new is added to *Known* unless a "keep" decision in AC-5 needs a note. | changelog diff |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Colours from tokens; a computed or derived ink is allowed as in 036 (progress-bar secondary), documented in the SCSS header comment.

## Assumptions

- Assumption 1: F-14 is solved inside the progress-bar (a darker or lighter primary step for the dark theme, or a track change), not by changing `--color-primary-500` or the track token globally.
- Assumption 2: The `lc-progress-ring` is covered by 034/036 already; it is only touched if it shares the same dark primary on surface-2 (the designer checks and reports).
- Assumption 3: Form fields whose border turns primary-500 on focus and measures ≥ 3:1 stay as they are (AC-5 "keep").
- Assumption 4: F-17 default direction (designer decides): keep the `dl > div > dt + dd` structure with no role override, make the interactive element a native `<button>`/focusable control inside the `dd` (or an overlay link on the value), so the group stays intact. If that needs a new DOM that breaks a consumer selector, the designer reports it back to the spec-writer for a semver call.
- Assumption 5: Headless run, no owner questions open.

## Open questions

None.
