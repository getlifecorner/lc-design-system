# Review 048: lc-datepicker Label (DE) story description and day button names

## Round 1 — 2026-11-04, commit 392c731 (gates on a7b725db; `git diff --quiet a7b725db -- libs tools` holds)

Screenshots: `tmp/story-shots/048/` — developer: `build` (16 stories 360/1280 L/D vs `baseline`), `build-open` (*Default*, *Label (DE)*, *Day Panel* opened at July 2026, `--axe`, vs `baseline-open`); review: `r1` (*Label (DE)* „Buchungsdatum“ opened at its value, November 2026, 360/1280 L/D, `--axe`, measure in `r1.log`). 2 shots opened (`build-open` label-de 360 L, `r1` label-de 1280 D). Storybook build current (story-shots ran without a stale warning).

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `datepicker.day-names.spec.ts` (word check on 42 buttons, exact strings, revert proof: 17 misses with `toDateString()`); `build-open` *Default*/*Day Panel*: mismatch count 0 in 8 shots, "1=Wednesday, July 1, 2026", "8=Saturday, August 8, 2026" (3.30.0: 17) |
| AC-2 | pass | spec (one selected button, `ausgewählt`); *Day Panel* 360/1280 L/D: selected = "Wednesday, July 15, 2026, selected" |
| AC-3 | pass | `i18n-labels.spec` l.274 de-DE unchanged; new de-DE + `en-US` = default cases; *Label (DE)*: „1=Mittwoch, 1. Juli 2026“ (`build-open`), selected „Mittwoch, 4. November 2026, ausgewählt“ (`r1`, all 4 shots) |
| AC-4 | pass | axe 4.14: `build-open` 12 shots 0 violations (3.30.0: 8 violating), `r1` 4 shots 0; incomplete only `aria-valid-attr-value` (aria-controls, known from 046) and `bypass` |
| AC-5 | pass | `build-open` vs `baseline-open`: *Default*, *Day Panel* 8/8 identical; *Label (DE)* 4 differ only by „Heute“ (story change, design §8/§9). Panel 2,60,342,448 / 16,60,310,395, cells 44 / 36, 42 buttons; *Label (DE)* panel 2,170,342,448 / 16,170,310,395 (= §3) |
| AC-6 | pass | existing keyboard/focus specs green; new spec: `aria-current="date"` on today only, no `tabindex` on day buttons; `r1`: today (4 Nov) selected button has `aria-current="date"` |
| AC-7 | pass | story text "two lines (42 px)"; `build` *Label (DE)* 360 L/D: both sm labels 158 × 42, 21 px lines, field 158, x 16 / 186; 1280 194 × 42 (shot: „Leistungsverrech-“ break at 360) |
| AC-8 | pass | `git diff main -- datepicker.component.spec.ts` empty; no input added or removed. The one changed assertion (`i18n-labels.spec` l.253) pinned `${toDateString()}, selected`: exactly the exception AC-8 allows, stated in `build.md`. The design was wrong here, see change note in `design.md` §9 |
| AC-9 | pass | `ariaLabel` JSDoc `@default undefined`, `locale` `@default ''`; manifest (`tmp/048/manifest-props.json`): `ariaLabel` default `undefined`, `locale` `''` with the new sentence |

API check (design §2): no input, output, slot, hook or type changed; `dayAriaLabel()` uses `toLocaleDateString(this.locale() \|\| 'en-US', long)`, the same fallback as the month cells (l.337) and the same options as `lc-date-range-picker` (l.130). No other `toDateString()` left in `src/lib` outside the revert-proof spec.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix (queue; pre-existing, WCAG 3.1.2 Language of Parts, AA) | *Label (DE)*, „Buchungsdatum“ opened, 360/1280 L/D (`r1.log`, values 1–3) | The German panel („Datum wählen“, „Vorheriger Monat“, „So Mo Di …“, „Mittwoch, 4. November 2026, ausgewählt“) is in a `de` language context, e.g. the panel takes the host's closest `[lang]`, else `locale` | The CDK overlay sits under `<body>`, outside the story's `<div lang="de">` (`contains` = false); the panel's closest `[lang]` is `<html lang="en">`, so screen readers speak the German names with English rules. Same check for other overlay components with `locale` (date-range-picker, combobox) |
| 2 | nit (backlog) | *Label (DE)* story, „Gilt ab“ and both sm fields | All German, as the description now claims for „Buchungsdatum“: „Gilt ab“ with `monthDialogAriaLabel`/`previousYearAriaLabel`/`nextYearAriaLabel` (as *Month (DE)*), sm fields with `todayLabel`, `dialogAriaLabel`, month nav and `selectedAriaLabel` | Their panels use the English defaults; the sm panels show a visible "Today" in a German story, and the MCP serves that snippet |
| 3 | nit (release-manager, changelog) | `build.md` changelog draft, *Compatibility* | "Layout unchanged: the open panel keeps 342 × 448 px at 360 px and 310 × 395 px at 1280 px, and all 64 at-rest shots of the datepicker stories are hash-identical to 3.30.0." | "Layout unchanged: the open panel (342 × 448 at 360, 310 × 395 at 1280) all 64 at-rest shots …" (verb missing) |

**Verdict:** approved (no must-fix; finding 1 goes to the queue, 2 to the backlog, 3 into the release).
