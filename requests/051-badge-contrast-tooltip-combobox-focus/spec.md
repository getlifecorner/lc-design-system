# Spec 051: Badge contrast on nav pills and light rail, tooltip on lc-button focus, lc-combobox openOnFocus

- **Status:** ready
- **Type:** bundle of 4 items: 3 bug fixes (050-f1, f2, f3) + extension of `lc-combobox`
- **Affected:** `lc-bottom-nav` (scss, badge on the current pill), `lc-sidenav` (scss, `theme="light"` badge colours), `lcTooltip` (`tooltip/tooltip.directive.ts`, usage on `lc-button`), `lc-combobox` (`combobox.component.{ts,html}`), their stories and specs, CHANGELOG
- **Semver impact:** minor: one new optional input (`openOnFocus`, default `true`); the three fixes change no API. Tooltip on `lc-button` now also shows on keyboard focus (behaviour fix, see AC-8).

## Need

| Item | Requester | Page / symptom |
|---|---|---|
| A. 050-f1 | owner (review 050 F-1) | `lc-bottom-nav`, dark: badge on the *current* pill measures warning 4.03:1 floating / 4.26:1 docked, success 4.49:1 floating (needs 4.5:1 for badge text, WCAG 1.4.3). |
| B. 050-f2 | owner (F-2) | `lc-sidenav theme="light"` on a dark page: badges 1.22–1.97:1 (WCAG 1.4.3). The rail theme is independent of the page theme, the badge colours follow the page. |
| C. 050-f3 | owner (F-3) | `lcTooltip` on `lc-button`: never shows on keyboard focus (WCAG 1.4.13), `aria-describedby` lands on the `lc-button` host, not on the focused inner `<button>` (WCAG 1.3.1), and the tooltip anchors to the 18 px inline host box, so a bottom tooltip starts 4 px over the 42 px button. |
| D. stammdaten-2026-11-05 row 3 | finance-intelligence | Master data form: focus put on the first field on open, or on the first invalid field after a 422, opens the `lc-combobox` list on a phone (360 px); after a 422 it covers the field's own error text. No way to focus without opening. |

## What the kit has today

- A, B: `lc-bottom-nav` / `lc-sidenav` render `lc-badge` inside; colours come from badge variants and page-theme tokens, with no override for the pill or rail background. Hook `--lc-sidenav-badge-ring` exists (ring only).
- C: `@HostListener('focus'/'blur')` on the directive host. `focus` does not bubble, so on `<lc-button lcTooltip>` it never fires; ARIA is written to `host`. The overlay origin is the host element.
- D: `onInputFocus()` opens the list when `query.length >= minChars` or options exist. No input to switch this off. Clicks on the field have no own handler (open happens through focus).

## Scope

- In: A–D as above. Backlog rows on these components: none are in scope (049-n2, 049-n3, 047-n1 touch combobox but are layout/lang, left out).
- Not in (non-goals): new badge variants or API; redesign of tooltip placement options; field-wide combobox panel width (049-n2); `lc-select` or datepicker focus behaviour.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `lc-bottom-nav` badge on the current pill: every badge variant (at least warning, success, plus danger/info/default as shipped) has text contrast ≥ 4.5:1 in dark, floating and docked, and still ≥ 4.5:1 in light. | Story at 360 px, dark+light, floating+docked; measured computed colours; contrast ratios listed in build.md |
| AC-2 | Non-current pill badges and the More badge keep their current colours (no change in measured values). | Story measurement before/after |
| AC-3 | `lc-sidenav theme="light"` on a dark page: badge text and badge boundary vs rail background ≥ 4.5:1 (text) and ≥ 3:1 (UI boundary), expanded and collapsed rail, all badge variants. The reverse case (`theme="dark"` on a light page) also holds. | Story at 360 and 1280 px, page dark/light × rail light/dark; measured |
| AC-4 | Sidenav with matching page and rail theme renders exactly as before (same computed colours). | Story measurement before/after |
| AC-5 | `<lc-button lcTooltip="…">`: Tab to the button shows the tooltip (after the existing delay); blur or Escape hides it. | Unit test (focusin/focusout) + keyboard run in story |
| AC-6 | While shown, `aria-describedby` with the tooltip id is on the inner focusable `<button>`/`<a>` of `lc-button`, not on the `lc-button` host; it is removed on hide; ids the caller set are kept. Plain elements (`<button lcTooltip>`) keep the attribute on the host as today. | Unit test; DOM snapshot in story |
| AC-7 | Anchoring: bottom tooltip on `lc-button` has a gap of 8 px (the directive's offset) from the visible button box (42 px height case), top tooltip likewise; no overlap. | Story at 360 and 1280 px, `--measure` of gap |
| AC-8 | Hover behaviour, delay, `lcTooltip` on non-`lc-button` hosts, and disabled-button handling unchanged. Tooltip stays hoverable/dismissible (WCAG 1.4.13: Escape dismisses, pointer can move onto it). | Existing tooltip specs unchanged and green; new test for Escape on focus |
| AC-9 | `lc-combobox` has input `openOnFocus: boolean`, default `true`, with JSDoc `@default true` and story argType description + `table.defaultValue`. With the default, every existing spec passes unchanged and focus behaviour is identical. | Unit test (defaults), existing specs |
| AC-10 | With `openOnFocus = false`: programmatic `focus()` and Tab focus open no listbox, `aria-expanded` stays `false`, no `aria-controls`. | Unit test |
| AC-11 | With `openOnFocus = false`, the list opens on typing, ArrowDown, and on a click/tap on the already-focused or just-focused field (pointer, touch). A second Tab-in after blur stays closed. Escape and selection behave as today. | Unit tests for each trigger; story at 360 px |
| AC-12 | Story "Open on focus off" at 360 px, light and dark, EN and DE: field focused programmatically on load with the error text visible below it; measured: error text not covered, no listbox in the DOM. Works in `multiple` mode too. | Story + `--measure` (listbox count 0, error rect not overlapped) |
| AC-13 | Prerendered HTML: combobox markup unchanged (`aria-expanded="false"`); `compat` template still passes. | `check-angular-majors.mjs` |
| AC-14 | No new built-in texts; no EN/DE string change. Tooltip text length EN/DE long strings in the AC-7 story do not overflow at 360 px. | Story with long DE text |
| AC-15 | `forced-colors` and `prefers-reduced-motion`: badges stay readable (border or system colours); no new motion. | Story check with emulated forced-colors |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Colour fixes use existing semantic tokens; add a token only if computed contrast needs one, then both themes in `theme-contrast.spec.ts`.
- Keep the public hook names; new hooks (if any) `--lc-<component>-<property>` with documented default.

## Assumptions

- Assumption: for AC-1 and AC-3 the designer may pick the fix (darker badge background pair, badge-on-surface treatment, or ring/border), as long as the measured values meet the AC; the defaults stay for non-failing cases.
- Assumption: "tap or click on the field" is implemented as a `click` on the input; this also covers a second click on an already focused field.
- Assumption: for AC-6 the directive finds the focusable inner element (`button, a, [tabindex]`) of the host; if none, it falls back to the host.
- Assumption: 050-f3 is fixed in the directive for any host wrapping a focusable element, not only `lc-button`.

## Open questions

None.

## Resolution

Not applicable: all four items need kit changes.
