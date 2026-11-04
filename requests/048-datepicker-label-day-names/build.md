# Build 048: lc-datepicker Label (DE) story description and day button names

- **Branch:** `fix/3.30.1-datepicker-label-day-names`
- **Commit:** `fix(datepicker): day button names contain the visible number; Label (DE) story text (048)` (one commit, amended)

## Files changed

| File | Change |
|---|---|
| `lib/datepicker/datepicker.component.ts` | `dayAriaLabel()`: `toLocaleDateString(locale \|\| 'en-US', long)` replaces `toDateString()` (design §1); JSDoc: `ariaLabel` `@default undefined` (AC-9), `locale` text + `@default ''`, method comment (§2) |
| `lib/datepicker/datepicker.stories.ts` | *Label (DE)*: "two lines (42 px)", German panel texts on „Buchungsdatum“ + one sentence; *Day Panel*: one sentence on the EN names (§8) |
| `lib/datepicker/datepicker.day-names.spec.ts` | new, 9 tests (AC-1 … AC-3, AC-6, unchanged rendering) |
| `lib/i18n-labels.spec.ts` | l.253: the pinned `toDateString()` form → `'Saturday, October 10, 2026, selected'` (see Deviations) |
| `requests/BACKLOG.md` | row 047-n4 removed (spec Assumption; the edit was already in the tree) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | `day-names.spec`: all 42 July 2026 buttons have the visible number as a word (`split(/[^0-9\p{L}]+/u)`); exact day 1, 15, 28 June, 1 and 8 August; a test shows the word check catches the old form (17 misses). Revert proof: with `toDateString()` back, 7 tests fail (6 new + i18n-labels), AC-1 lists the 17 buttons |
| AC-2 | `day-names.spec`: "Wednesday, July 1, 2026, selected" on one button only; `selectedAriaLabel="ausgewählt"` |
| AC-3 | existing de-DE assertions unchanged (`i18n-labels.spec` l.274, "Samstag, 10. Oktober 2026, ausgewählt"); new de-DE day 1/15 and `locale="en-US"` = default (42 names) |
| AC-4 | `build-open` run (*Default*, *Label (DE)*, *Day Panel*, 360/1280 L/D, `open-measure.js`), `--axe`: `{"shots":12,"violations":0}` (3.30.0: 8); measure mismatch count 0 in all 12 (was 17) |
| AC-5 | same run, `--compare=baseline-open`: 8 identical (*Default*, *Day Panel*), 4 different (*Label (DE)*): pixel diff only in the today button text („Heute“), x 153–192 y 264–277 at 360, x 151–190 y 245–258 at 1280. Rects as §3: panel 342 × 448 / 310 × 395, cells 44 / 36, 42 buttons |
| AC-6 | existing keyboard/focus specs green; new: today alone has `aria-current="date"`, long en-US name, no `tabindex` on day buttons |
| AC-7 | story text "two lines (42 px)"; `build` run, `label-de` 360 light: 158 × 42, line-height 21 px, `hyphens: auto`, field 158, 2 lines |
| AC-8 | `git diff main -- datepicker.component.spec.ts` empty; no input added or removed; one assertion changed (Deviations) |
| AC-9 | JSDoc tag present; manifest (temp `zz-048.test.mjs` via `test:tools`, removed): `ariaLabel` default `undefined`, `locale` default `''` with the new description; 23/23 |

## Gates

All gates ran on commit `a7b725dbc2e260f13bb6e8355aa40b422ca8b2c6` (later agents skip a gate while `git diff --quiet a7b725db -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 242 suites, 5654 passed, 8 skipped (+1 suite, +9 tests; `--maxWorkers=2`) |
| `npx nx run angular-ui-kit:lint` | 0 errors / 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | 122 "Built" lines |
| `npm run test:tools` | tools unchanged; 23/23 with the temp AC-9 check |
| `npx nx run angular-ui-kit:build-storybook` | 1055 stories |
| Story screenshots | `tmp/story-shots/048/build` (16 stories × 360/1280 × L/D vs `baseline`, `label-measure.js`): 64/64 identical. `tmp/story-shots/048/build-open`: see AC-4/AC-5. Logs `tmp/048/shots-{rest,open}.log` |
| `node tools/compat/check-angular-majors.mjs` | server rendering unchanged (only an `aria-label` in the overlay, not prerendered) |

## Deviations from the design

- `i18n-labels.spec.ts` l.253 pinned the old form (`${new Date(2026, 9, 10).toDateString()}, selected`); design §9 AC-8 grepped only `datepicker.component.spec.ts`. Changed to the new string, as AC-8 allows for `toDateString()` pins. No other assertion changed.

## Changelog draft

```markdown
## [3.30.1] - 2026-11-04

Day buttons whose names contain the number you see, and a corrected story text (follow-ups 047-f1, 047-f2). No API breaks.

### Fixed

- **`lc-datepicker` day names** (047-f2, WCAG 2.5.3): without `locale`, each day button is named with its long English date, "Wednesday, July 1, 2026" (was "Wed Jul 01 2026", read as abbreviations, and for days 1 to 9 not containing the visible "1"), plus ", selected" on the selected day. The same `Intl` long form as with `locale` (`de-DE`: „Mittwoch, 1. Juli 2026“, unchanged), with `en-US` as the fallback, as the month cells already use. axe `label-content-name-mismatch`: 0 on the open panel (3.30.0: 17 day buttons per July 2026 panel). Story *Day Panel*.
- **`lc-datepicker` *Label (DE)* story** (047-f1, also served by the MCP): „Leistungsverrechnungsschlüssel ab“ takes two lines (42 px) in the 158 px field at 360 px, not three (63 px). The „Buchungsdatum“ field's open panel is German too („Heute“, „Datum wählen“, „Vorheriger Monat“, „Nächster Monat“, „ausgewählt“).
- `lc-datepicker` `ariaLabel`: its JSDoc (and the MCP) now states the default, `undefined`.

### Compatibility

- No API breaks. Only the day buttons' `aria-label` text changed; if a test of yours pins "Wed Jul 01 2026", expect "Wednesday, July 1, 2026". Layout unchanged: the open panel (342 × 448 at 360, 310 × 395 at 1280) all 64 at-rest shots of the datepicker stories are hash-identical to 3.30.0.
```
