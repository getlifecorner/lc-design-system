# Review 049: Overlay panel language (datepicker, date-range-picker, combobox)

## Round 1 — 2026-11-05, commit 4e82620 (code = 77225f2)

Screenshots: `tmp/story-shots/049/r1/` (2 new stories, 360 · 1024 · 1280, light · dark, `--axe`; log `r1.log`). Unchanged stories: the developer's compare runs on the current Storybook build (built 23:54:10, after the last source change 23:50:54; runs 23:55–23:58), reused, not repeated.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `datepicker.panel-lang.spec` (wrapper `de` → `[role="dialog"]` `lang="de"`, month panel too); story: DE panel `lang="de"`, `:lang(de)` true, 6/6 shots |
| AC-2 | pass | same spec, no `<html lang>`, `locale="de-DE"` → `de-DE` |
| AC-3 | pass | same spec: no attribute, attributes `aria-label class id role` |
| AC-4 | pass | `combobox.panel-lang.spec` (both cases, multiple mode); story: DE listbox `lang="de"`, focus `INPUT.lc-combobox__input`, 6/6 |
| AC-5 | pass | `date-range-picker.panel-lang.spec` (inherits `de`/`en`, own `de-DE`/`en-GB` only without any `[lang]`); `build-open` DRP *Default*: own `lang` null, effective `en` |
| AC-6 | pass | datepicker + combobox specs: `de` → close → `fr` → open = `fr`; wrapper `lang` removed → `locale` / none |
| AC-7 | pass | no existing spec edited (diff: only new `*.panel-lang.spec.ts`); at rest 124/124 identical (`tmp/049/shots-rest.log`); r1: no `[lang]` in either host at rest (`0,0`) |
| AC-8 | pass | `build-open` *Label (DE)* 360/1280 L/D: panel `lang` `de`, effective `de`, attributes `aria-label class id lang role`, box 2,170,342 × 448 / 16,170,310 × 395, focus as baseline; 28/28 identical, axe 0 |
| AC-9 | pass | r1, 12 shots: datepicker EN `en,en,en,false` 2,87,342 × 448 (360) / 16,87,310 × 395 (1024, 1280); DE `de,de,de,true` 2,170 / 16,170 same sizes; combobox EN 150.31 × 240, DE 135.03 × 240 at every width; axe 0 violations |
| AC-10 | pass (by construction, CI confirms) | panels exist only while open, `panelLang` reads the DOM only when `isOpen()`; `EXPECT_IN_HTML` untouched |
| AC-11 | pass (draft) | build.md draft names 048-f1, "No API breaks", rule closest `[lang]` → `locale` → none, combobox and DRP variants |

API (§2): no input, output, hook or type added; JSDoc sentences on datepicker `locale`, DRP `locale` (plus the missing `@default 'de-DE'`) and the combobox class as designed; `closestLang` only in `internal/a11y`, not in `src/index.ts`. Stories: IDs as §8, no args, so no argTypes needed; *Label (DE)* change is docs text only (canvas hash-identical).

**Deviation 1 (combobox story text "the combobox has no `locale`"):** agreed. My §8 text was wrong for the combobox; design.md §8 is corrected with a change note.

Shots opened (4): both new stories at 360 and 1280 light. Panels and dropdowns sit under the DE field as in the baseline, German texts only in the DE panel („Juli 2026“, „Heute“, So–Sa; „Januar 2026“ …).

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix (pre-existing, WCAG 3.1.2, out of this spec's scope: assumption 4) | `lc-select`, `form-select--default`, 360 light, host given `lang="de"` in `--measure` (`r1-probe.log`) | listbox resolves to the host's `de` | `.lc-select__options` has no `lang`, `closest('[lang]')` = `HTML:en`, `:lang(de)` false (in `.cdk-overlay-container`). Same gap likely in `lc-menu`, `lc-tooltip`, `lc-popover` (not measured): next bundle, apply `closestLang` per overlay |
| 2 | nit (pre-existing, build.md known limit) | combobox dropdown, every story | field-wide (`cdkConnectedOverlayMatchWidth` is on) | content-sized: 135.03 px under the DE field of 328 (360) / 400 px (1280) (*Panel Language*), 85.92 under 328 (*Starts with a choice*) |
| 3 | nit (known limit) | datepicker, combobox | — | a host `lang` change while the panel stays open shows only at the next opening (design §1) |

**Verdict:** approved
