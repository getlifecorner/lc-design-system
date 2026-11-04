# Spec 047: datepicker and combobox clear targets, combobox lg input height, datepicker label, datepicker dark selected day

- **Status:** ready
- **Type:** bug fix (items 1, 2, 3) and extension of `lc-datepicker` (item 4)
- **Affected:** `lib/datepicker/` (`.ts`, `.html`, `.scss`, spec, stories), `lib/combobox/` (`.scss`, `.html` if needed, spec, stories), `CHANGELOG.md`, README component lists only if wording changes
- **Semver impact:** minor — one new optional input (`label` on `lc-datepicker`, default empty); everything else corrects sizes and a colour.

## Need

| Item | Requester | Page / problem |
|---|---|---|
| A (046-f1) | owner | `lc-datepicker` clear button is 20 × 20 px, axe `target-size` (WCAG 2.5.8), day and month mode |
| B (046-f2) | owner | `lc-datepicker` day mode, dark: selected day fill is 2.78:1 on the surface (WCAG 1.4.11); month mode already has an inset ring |
| C (regeln row 5) | finance-intelligence | `lc-combobox` clear button („Auswahl löschen“) is 20 × 20 px, no size input; needs ≥ 44 × 44 px at `size=lg` |
| D (regeln row 6) | finance-intelligence | `lc-combobox size=lg`: input is 36 px high inside a 46 px frame; a tap on the frame does not focus; needs a 44 px target |
| E (regeln row 7) | finance-intelligence | `lc-datepicker` has only `ariaLabel`; field „Gilt ab“ (`granularity=month`) needs a visible name like `lc-combobox` and `lc-number-input` |

## What the kit has today

- Datepicker: `.lc-datepicker-clear` is `1.25rem` square (`datepicker.component.scss` ~l.156); the `<input>` has `aria-label` from `ariaLabel`, no `<label>`. Selected day: `--color-primary-fill` on the panel (~l.344); month cell already has an inset ring (~l.427–451).
- Combobox: `.lc-combobox__clear` is `20px` (scss l.90); input heights `1.5/1.75/2/2.25rem` (l.81–84); `label` input renders `<label for>` (html l.2–3). `clearAriaLabel` exists on both.
- `lc-number-input` shows a visible `label` (reference for item E).
- Nothing in the kit solves A–E today; the existing inputs only allow the text of the clear label.

## Scope

- In: A–E. Fold-in from `requests/BACKLOG.md` for datepicker: **046-n3** (day panel nav 32, today 31, days 36 px, kit rule 44; AA passes) and **046-n4** (month mode: Enter after half-typed „2026-1“ keeps half text until blur; day mode shows the committed value) are folded in as AC-9 and AC-10 and deleted from the backlog.
- Not in: restyling the combobox or datepicker, new sizes, changing `ariaLabel` behaviour, other components.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 (A) | Datepicker clear button hit area ≥ 44 × 44 px in sizes md and lg and ≥ 24 × 24 px (WCAG 2.5.8) in xs and sm, in day and month mode, without growing the field frame height (visual glyph may stay 16 px; hit area may extend via padding/pseudo-element). Designer picks the technique. | story + `--measure` at 360/1280, axe `target-size` 0 violations |
| AC-2 (B) | Day mode, dark: the selected day has ≥ 3:1 against the panel surface (fill or added ring/outline), computed; its text keeps ≥ 4.5:1; light unchanged or still ≥ 3:1; `forced-colors` shows the selected day. | computed contrast in dark and light, `theme-contrast.spec.ts` or spec; story screenshot |
| AC-3 (C) | Combobox clear button hit area ≥ 44 × 44 px at `size=lg` (size xs–md at least 24 × 24 px); overlap with chips/input does not break layout; focus ring visible. | story + measure at 360 and 1280, axe |
| AC-4 (D) | At `size=lg` the focusable input/target is ≥ 44 px high (the frame stays about 46 px or grows by the same amount); a tap on any part of the frame focuses the input (click on frame → input focused). Other sizes keep their current heights. | measure, unit test (click on frame focuses input, all sizes) |
| AC-5 (E) | `lc-datepicker` has an optional `label` input (default `''`, JSDoc with `@default`). When set it renders a visible `<label for=inputId>` above the field in day and month mode, styled like `lc-combobox`/`lc-number-input` labels; `ariaLabel` still works and, if both set, the visible label wins for the name. | unit test (label text, `for`/`id`, accessible name), story |
| AC-6 (E) | With `label` empty the DOM and rendered height are identical to 3.29.0 (no empty `<label>`). | unit test, screenshot compare |
| AC-7 | Texts: German strings („Auswahl löschen“, „Datum löschen“, „Gilt ab“) do not clip or wrap badly at 360 px in stories for A, C, E. | story at 360 px EN and DE |
| AC-8 | Light and dark, keyboard (Tab reaches clear button, Enter/Space clears, focus returns sensibly), screen reader names (label, clear). Existing specs pass unchanged. | stories both themes, unit tests |
| AC-9 (046-n3) | Datepicker day panel targets (nav, today, days) are ≥ 44 px on touch widths (360 px), or the designer records why the panel keeps its size with a measured AA pass; panel stays within 360 px width. | measure at 360/1280, story |
| AC-10 (046-n4) | Month mode: Enter in the open field after half-typed text shows the committed value again, like day mode. | unit test |
| AC-11 | Unchanged defaults: no existing input changes meaning; frame heights of datepicker xs–lg and combobox xs–md are unchanged. Hit-area growth must not shift layout of other sizes. | screenshot compare with 3.29.0 baselines |
| AC-12 | Prerendered HTML: the datepicker `label` and the combobox frame render in server HTML before JS (compat check). | `check-angular-majors.mjs` / prerender spot check |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Tokens only, no raw colours; MCP JSDoc and story argTypes for `label`.

## Assumptions

- Assumption: 44 px is required at `lg` and the kit rule says 44 px generally; xs–sm get ≥ 24 px (AA minimum) so that compact toolbars keep their density. Designer may raise this.
- Assumption: item C and D together mean `lg` is the touch size; no new `size` input for the clear button.
- Assumption: the fix for D may grow the input to 2.75rem and the frame accordingly (the requester accepts „frame 46 px“ as is or larger).
- Assumption: item B is fixed with an extra ring/outline or a darker fill in the dark theme token, whichever the designer finds without touching other components using `--color-primary-fill`.
- Assumption: 046-n3 is in because the datepicker is already being touched; if the designer finds it enlarges the panel beyond 360 px, drop to a recorded limit and return the row to the backlog.

## Open questions

None.

## Resolution

Not applicable: the kit does not cover A–E.
