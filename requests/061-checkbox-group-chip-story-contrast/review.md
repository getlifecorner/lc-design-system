# Review 061: lc-checkbox-group (new), lc-chip story contrast

## Round 1 — 2026-11-13, commit a474549 (gate tree = 636aef3)

Screenshots: `tmp/story-shots/061/r1/` (10 stories at 320 · 360 · 1024 · 1280, light · dark, `--axe`, 80 shots). Measure: `tmp/story-shots/061/r1-measure.js`, log `r1.log`. Disabled probe: `r1-disabled.log`. Unchanged stories: `diff -rq 061/baseline 061-build/compare` = 0 differing of 96.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | name `[Rollen]` (dom-accessibility-api on the `fieldset`), 3 inputs; play of *Default* passes |
| AC-2 | pass | *Hidden Legend*: legend 1×1 at x15 y15, help y16, name still `Rollen`, all widths |
| AC-3 | pass | description starts with "Mehrere Rollen sind möglich."; help y45 = legend + 21 + 8 |
| AC-4 | pass | *With Error*: 1 `[role=alert]` on the page, error x16 y178, 8 below the options, `ownMsg 0`, `invalid 3`, description "Mehrere Rollen sind möglich. Wählen Sie mindestens eine Rolle." |
| AC-5 | pass | *(Checkbox) Checkbox Group*: each child described by its own help ("Receive updates via email" …); spec |
| AC-6 | pass | `*` at x62.3 (space + 2 after the text), `aria-hidden="true"`, name `Rollen Pflichtfeld`; `req 0` on all children |
| AC-7 | pass | *Disabled*: fieldset `disabled`, 3/3 inputs disabled, tabindex −1, labels at opacity .5; legend/help keep 17.74 / 7.56 (see F-1) |
| AC-8 | pass | *Phone (lg)* 360: rows 328×44 at y73/125/177, box 24 at +10, text x48 18 px; `checkbox-lg checkbox-in-group` |
| AC-9 | pass | *Horizontal*: 360 and 320 Administration x16 + Controlling x172.52 on row 1, CFO row 2 at +35 (fieldset 119); 1024/1280 one row (fieldset 84); overflow 0 at all 4 widths |
| AC-10 | pass | `.focus()` → `:focus-visible`, ring solid 2 px offset 2: 4.37 L / 9.95 D in every story and width |
| AC-11 | pass | *Form Control* after its play: Administration + Controlling checked, "Wert: administration, controlling", play phase `finished`; spec (8 tests) |
| AC-12 | pass | 8 group stories DE at 320–1280 L/D, overflow 0, fieldset `scrollWidth` 0; error one line (20 px) at 320 |
| AC-13 | pass | legend 17.74 L / 17.29 D, help 7.56 / 12.17, `*` and error 12.59 / 9.48 at all widths; forced colours 21:1 (`061-build/forced.log`) |
| AC-14 | pass | compat Angular 22, `checkbox group legend` row (build.md gates on 636aef3, tree unchanged) |
| AC-15 | pass | 96/96 baseline shots byte-identical; default DOM 7/7 (`tmp/061/old-new.txt`); checkbox spec unchanged |
| AC-16 | pass | axe 4.14: 0 violations in 80 shots; incomplete only `bypass` and chip `color-contrast` (gradient) |
| AC-17 | pass | §2 names, types, defaults and JSDoc match; `@default` on all 11 group and 14 checkbox inputs (manifest); argTypes with `description` + `table.defaultValue`; both READMEs |
| AC-18 | pass | all 6 chips 10.16 L / 10.64 D at 320–1280, fill `rgb(255,255,255)` / `rgb(16,28,38)`; dark on-band border 4.74–7.22; story text as §8 |
| AC-19 | pass | commit touches only `chip.stories.ts` under `chip/` |

**Build deviations:** 1 confirmed: the design was wrong (I took the 26 px label for the row); `design.md` §3/§9 corrected with a change note: md rows 27, pitch 35, error y178. 2 (group wins over `[checked]`) is the §2 outcome. 3 (a value from a checkbox outside `contentChildren` is appended) follows "kept, never dropped".

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F-1 | should-fix (queue, pre-existing `lc-checkbox`) | *Disabled* (value `administration`), 360, light; any disabled checked `lc-checkbox` | a disabled checked box still shows it is checked | `.checkbox-disabled .checkbox-box` (neutral-100 fill, neutral-300 border) overrides the checked fill, so the white check sits on `#f3f4f6` at .5: **1.02:1** in light (dark 5.14). The checked and unchecked boxes look the same, so a disabled "Rollen ändern" group hides the assigned roles. Inactive controls are exempt from 1.4.11, but the state is lost. Keep the primary fill (dimmed) for checked/indeterminate while disabled |
| F-2 | should-fix (queue, design D-1, pre-existing `lc-chip`) | *Hooks on an Ancestor*, quiet clickable in `lc-hero`, hover, light | hover fill follows `--lc-chip-bg` | hover fill = `--_lc-hero-glass`, ink keeps `--lc-chip-fg`: 1.05–1.11:1 (`061/chip-proto.log` QH). Component fix, excluded here by AC-19 |
| F-3 | should-fix (queue, design D-2, pre-existing `lc-checkbox`, WCAG 1.4.11) | every `lc-checkbox` box | box boundary ≥ 3:1 | rest `--color-neutral-400` 2.54 on white (2.31 sunken); error `--color-error` 2.24 on the dark page (2.06 surface, 1.71 raised). `lc-radio` uses `--color-field-border` (4.39+ L) |
| F-4 | nit (backlog) | `lc-checkbox` help/error | indent under the label text | `margin-left: calc(var(--checkbox-size) + .5rem)` computes 0 (design B-1) |
| F-5 | nit (backlog) | standalone `lc-checkbox lg` | 44 px row as `lc-radio lg` | 29 px outside a group (design B-2) |
| F-6 | nit (backlog) | `lc-radio-group` | `*` as `aria-hidden` + hidden text, error below the options | `aria-label` on a bare span (axe incomplete), error above the options (design B-3, B-4) |

No must-fix. F-1 to F-3 are pre-existing component issues that the spec's "no look change to `lc-checkbox`" and AC-19 keep out of this request.

**Verdict:** approved
