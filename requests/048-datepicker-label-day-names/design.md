# Design 048: lc-datepicker Label (DE) story description and day button names

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-9
- **Measured on:** main `d259b30` (3.30.0), Storybook rebuilt 2026-11-04, Chromium headless, axe 4.14.0

## 1. Approach

Extend, no new API. `dayAriaLabel()` drops `toDateString()` and always uses the `Intl` long form of the `locale` branch, falling back to `'en-US'`. That is the same fallback the month cells already use (`label`, `datepicker.component.ts` l.331), so day and month names in the panel follow one rule:

```ts
const name = date.toLocaleDateString(locale || 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
```

**English format confirmed:** en-US long with the weekday, "Wednesday, July 1, 2026". Measured in Chromium (`--measure`); Node's full ICU (Jest) gives the same string. Why not the alternatives:

| Option | Name for 1 July 2026 | Verdict |
|---|---|---|
| `toDateString()` (today) | "Wed Jul 01 2026" | fails 2.5.3 for days 1–9; abbreviations read badly |
| browser locale (`undefined`) | depends on the OS | breaks "English by default" (a German OS would get German names in an English UI) |
| en-GB | "Wednesday 1 July 2026" | the kit's English fallback is en-US everywhere else (month cells) |
| **en-US long** | **"Wednesday, July 1, 2026"** | contains the visible number as its own word, matches the month cells and the header ("July 2026") |

## 2. Public API

No input, output, slot, hook or type is added or removed. Only JSDoc changes:

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | `ariaLabel` | `string \| undefined` | `undefined` | unchanged sentence + `@default undefined` (AC-9; repo convention, as in stat-trend, bar-chart and logo) |
| input | `locale` | `string` | `''` | "BCP 47 locale for month and weekday names and the day buttons' accessible names (e.g. `'de-DE'`). Empty keeps the built-in English names; the days are then named in `en-US` ("Wednesday, July 1, 2026")." + `@default ''` |
| method | `dayAriaLabel()` (protected) | — | — | comment: "the long `Intl` date in `locale`, else `en-US`, plus `selectedAriaLabel` when selected" |

Default rendering unchanged: the name is an `aria-label` attribute and is never rendered. Proven before the build by rewriting the attributes in the DOM (§9 prototype): 8/8 open-panel shots are hash-identical to 3.30.0.

## 3. Anatomy and layout

No layout change. Reference values for AC-5 and AC-7 (3.30.0, `tmp/story-shots/048/baseline*.log`):

| Surface | 360 px | 1280 px |
|---|---|---|
| Day panel, *Default* (x,y,w,h) | 2,60,342,448 | 16,60,310,395 |
| Day panel, *Day Panel* | 8,60,342,448 | 24,60,310,395 |
| Day panel, *Label (DE)* („Buchungsdatum“) | 2,170,342,448 | 16,170,310,395 |
| Days grid / first cell, *Default* | 19,227,308,264 / 44 × 44 | 33,202,276,236 / 36 × 36 |
| Day buttons per month (July 2026) | 42 | 42 |
| *Label (DE)* sm labels („…ab“ / „…bis“) | x 16 / 186, **158 × 42**, 2 lines of 21 px, field 158 | x 16 / 222, 194 × 42, field 194 |
| *Label (DE)* „Gilt ab“, „Buchungsdatum“ | 328 × 21 (1 line) | 400 × 21 |

```
360 px, Label (DE), sm row (grid 1fr 1fr, gap 12)
x16                 x174 x186               x344
| Leistungsverrech- |    | Leistungsverrech- |   line 1, 21 px (14/500)
| nungsschlüssel ab |    | nungsschlüssel bis|   line 2, 21 px  → label 42
+-------------------+    +-------------------+
| Datum wählen   [c]|    | Datum wählen   [c]|   sm field 158 wide
+-------------------+    +-------------------+
```

The visible break is „Leistungsverrech-|nungsschlüssel“ at 360 (shot `baseline/form-datepicker--label-de--360-light.png`), a real hyphen from `hyphens: auto` and `lang="de"`. A per-character Range scan attributes the "n" after the soft hyphen to line 1, so read the break point from the shot, not from that scan.

## 4. States

| State | Name of the day button (EN default) |
|---|---|
| default | "Wednesday, July 1, 2026" |
| selected | "Wednesday, July 15, 2026, selected" (`, ` + `selectedAriaLabel`) |
| today | long date, plus `aria-current="date"` (unchanged) |
| other-month day | long date of its own month ("Saturday, August 1, 2026") |
| disabled | long date; `disabled` as before |
| `locale="de-DE"` | "Mittwoch, 1. Juli 2026" (unchanged) |

Hover, focus-visible, active, loading, empty and error: no visual change. Overflow: none, the name is not rendered.

## 5. Theming

No colour, token or hook changes. Contrast is unaffected (047 values stand: selected ring 4.37 L / 9.13 D).

## 6. Accessibility

- WCAG 2.5.3 Label in Name: the visible number is now a word of the name for all 42 buttons. Measured in 3.30.0: 17 mismatches per July 2026 panel (1–9 July, 1–8 August); with the prototype: 0.
- Semantics, `tabindex`, focus order, `aria-current="date"`, `disabled` and the grid's keyboard handling are untouched (AC-6).
- Screen readers now hear "Wednesday, July 1, 2026" instead of "Wed Jul 01 2026", read out as abbreviations ("Wed Jul zero one").
- forced-colors and reduced motion: not affected.

## 7. Texts

| Key / input | EN default | DE (from `locale` + story inputs) |
|---|---|---|
| day name (no input; `locale`) | "Wednesday, July 1, 2026" | "Mittwoch, 1. Juli 2026" |
| `selectedAriaLabel` | "selected" | „ausgewählt“ (story) |
| `todayLabel` | "Today" | „Heute“ (story) |
| `dialogAriaLabel` | "Choose date" | „Datum wählen“ (story) |
| `previousMonthAriaLabel` / `nextMonthAriaLabel` | "Previous month" / "Next month" | „Vorheriger Monat“ / „Nächster Monat“ (story) |

Not rendered (except „Heute“, which fits in the 342/310 panel), so the narrowest width does not matter here.

## 8. Stories

| Story | Expected ID | Change | Shows |
|---|---|---|---|
| Label (DE) | `form-datepicker--label-de` | description: "breaks with a hyphen over three lines (63 px)" → "**two lines (42 px)**"; no other number changes (AC-7). Template: the „Buchungsdatum“ field gets `todayLabel="Heute" selectedAriaLabel="ausgewählt" dialogAriaLabel="Datum wählen" previousMonthAriaLabel="Vorheriger Monat" nextMonthAriaLabel="Nächster Monat"`, and one sentence in the description says so. The AC-4 German review surface (and the MCP snippet) then has no English strings in its open panel. | German labels; the open panel for AC-4 |
| Day Panel | `form-datepicker--day-panel` | one sentence added to the description: "Without `locale`, each day is named with its long English date ("Wednesday, July 15, 2026, selected"), so the visible number is part of the name (WCAG 2.5.3, 3.30.1)." | the default (EN) names, opened at July 2026 |
| Default | `form-datepicker--default` | none | the EN names when the review opens it |

No new story: there is no new input, slot or variant.

## 9. Verification

Baselines: `tmp/story-shots/048/baseline` (all 16 datepicker stories, 360/1280 L/D, 64 shots, measure `label-measure.js`) and `tmp/story-shots/048/baseline-open` (*Default*, *Label (DE)* and *Day Panel* opened and navigated to July 2026, 360/1280 L/D, 12 shots, `--axe`, measure `open-measure.js`). Prototype: `proto-open` (`proto-measure.js`): 8/8 identical to `baseline-open`, axe 0.

| AC | How | Expected value |
|---|---|---|
| AC-1 | Jest: render July 2026 (42 buttons); every name has the visible number **as a word**: `name.split(/[^0-9\p{L}]+/u).includes(button.textContent.trim())`. A plain `name.includes('1')` also passes the old "Wed Jul 01 2026" and can't fail. Plus exact strings | day 1 "Wednesday, July 1, 2026", day 15 "Wednesday, July 15, 2026"; the word check fails on 3.30.0 (17 buttons) |
| AC-2 | Jest: selected 1 July; then `selectedAriaLabel="ausgewählt"` | "Wednesday, July 1, 2026, selected" / "…, ausgewählt" |
| AC-3 | Jest: existing `de-DE` assertions unchanged; new case `locale="en-US"` = default string | "Mittwoch, 1. Juli 2026"; en-US === default |
| AC-4 | **Story-level only:** jsdom has no layout, and the panel is a CDK overlay opened by a click, so the axe rule (visible text, pixel thresholds) can't run in Jest. Review: `story-shots --stories=form-datepicker--default,form-datepicker--label-de,form-datepicker--day-panel --widths=360,1280 --themes=light,dark --axe --measure=<open-measure.js>` | `{"axe":{"shots":12,"violations":0}}`; 3.30.0 had 8 violating shots (17 day buttons each in *Default* and *Day Panel*); the measure's mismatch count (6th value) is 0 everywhere |
| AC-5 | Same run with `--compare=tmp/story-shots/048/baseline-open`, plus the rects in its measure | *Default* and *Day Panel*: 8/8 identical; *Label (DE)*: 4 differ only by „Heute“ in the today button; panel/grid/cell rects as in §3 (360: 342 × 448, cells 44; 1280: 310 × 395, cells 36) |
| AC-6 | Jest (existing focus/tabindex/`aria-current` cases) | unchanged and green |
| AC-7 | grep the story; `label-measure.js` on `form-datepicker--label-de` at 360 light | text says "two lines (42 px)"; measured 158 × 42, 21 px lines |
| AC-8 | `git diff` of `datepicker.component.spec.ts`; full suite. No existing assertion pins `toDateString()` (grep: l.491 only checks truthy names) | no existing assertion changed; no input added or removed |
| AC-9 | grep `@default undefined` above `ariaLabel`; `npm run test:tools`; the manifest's `ariaLabel` default | JSDoc tag present; manifest default `undefined` |
| all at rest | `story-shots … --compare=tmp/story-shots/048/baseline` (16 stories, 360/1280 L/D, same measure) | 64/64 identical (descriptions are docs-only; the new DE strings render only in the overlay). *Month* / *Month DE* mark the current month: compare in November 2026 |
