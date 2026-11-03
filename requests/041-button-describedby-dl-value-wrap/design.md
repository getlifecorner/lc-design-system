# Design 041: lc-button ariaDescribedBy; lc-description-list short values never break inside

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-12 · target 3.26.0 (minor) · measured on main 3c6a42b (3.25.2), Chromium, Storybook system font (SF)

## 1. Approach

**A — `lc-button` (extend).** One optional string input `ariaDescribedBy`, bound like `ariaLabel` (`[attr.aria-describedby]="ariaDescribedBy() || null"`) on the inner `<button>` only; same name as `lc-modal`'s `ariaDescribedBy`. Look, classes and every other attribute stay. `a[lcButton]` gets no input: the host *is* the anchor, so a native `aria-describedby` already lands on it (pinned in `button-link.component.spec.ts` l. 130); only its docs gain a sentence (AC-6).

**B — `lc-description-list` rows (CSS only).** Today the term never shrinks and the value takes all the missing width (`min-width: 0; overflow-wrap: anywhere`), so "10" breaks into "1"/"0". New rule, rows layout only: **term and value share a row that is too narrow.** Both grow from 0 to their max-content with equal weight; the leader keeps its 16 px minimum and still takes whatever is left once both are full. With F = row − 32 px (two 8 px gaps + 16 px leader):

| Case | Term | Value |
|---|---|---|
| term + value ≤ F (row fits) | max-content (as today) | max-content (as today) |
| value ≤ F/2 | F − value, wraps at spaces | keeps its width, one line |
| term ≤ F/2 | keeps its width | F − term, wraps (spaces; inside unbroken strings) |
| both > F/2 | F/2 | F/2 |

F/2 at the reference lists: 202 → 85 · 234 → 101 · 246 → 107 · 262 → 115 · 312 → 140 px. "1.234,56 €" is 74.33 px (md, tabular).

Rejected alternatives (prototyped in `tmp/story-shots/041/proto.log`): *term gives way first* breaks "E-Mail" of the 3.3 story at its hyphen ("E-"/"Mail"); *value floor via `min-width: auto` + `break-word`* lets an unbroken e-mail without hyphens overflow; *grid `auto 1fr auto`* shares only above min-content (1 char), so "1.234,56 €" still broke at 246; `calc-size()` has no Safari, container units need containment on the host.

**Leader (leaders mode only).** It moves from the row's centre to the middle of the first line, where the value sits (rows align on the first baseline). In a one-line row that is the same y; in a wrapped row the dots no longer float between two lines.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (`lc-button`) | `ariaDescribedBy` | `string` | `''` | Id, or space-separated ids, of elements that describe the button, set as `aria-describedby` on the inner `<button>`: a screen reader reads the button's name and then their text, also while `disabled` or `loading`. Use it to tie a visible reason line ("Wählen Sie zuerst eine Datei.") to a disabled button; `disabledReason` stays a tooltip for pointers (with both set, the description comes from the ids, so the tooltip is not read twice). Empty renders no attribute. The kit does not check that the ids exist. Don't put `aria-describedby` on `<lc-button>` itself: it would stay on the host. (3.26) `@default ''` |
| docs (`a[lcButton]`) | — | — | — | Class JSDoc, after the pass-through list: "For a description, set `aria-describedby` on the anchor itself; unlike `lc-button` there is no `ariaDescribedBy` input (3.26)." Same sentence in the bullet of `button-link.stories.ts` (l. 24–26). |
| `lc-description-list` | — | — | — | No API change, no hook, no class. Class JSDoc gains a feature bullet: "`rows`: a row that is too narrow is shared — term and value each keep their width up to half of the free width (row − 32 px); the longer one wraps in the rest: the term at spaces, the value at spaces or inside an unbroken string (3.26)." |

Default rendering unchanged: `|| null` writes no attribute when the input is `''` (AC-2/3); the dl rule keeps the boxes of every row that fits — 60/60 existing dl shots hash-identical with the rule injected (`041/proto-compare`, control `041/control-compare` also 60/60).

## 3. Anatomy and layout

### 3.1 SCSS (exact; `description-list.component.scss`)

```scss
$_share: 1000000; // top of file: term and value outweigh the leader's grow factor 1

// in .lc-dl, rows section, directly after `&--rows &__row { … }`
// (after the base __term/__value blocks: the spec's indexOf('.lc-dl__value {') must still hit the base block)
&--rows &__term,
&--rows &__value {
  flex: $_share 1 0%;
  max-width: max-content;
}

&--rows &__term {
  min-width: 0;
  overflow-wrap: break-word; // no `hyphens`: terms wrap at spaces (AC-7)
}

// inside the existing `&--leaders &__leader { border-bottom …; transform … }` block
@supports (margin-block-start: 1lh) {
  align-self: flex-start;
  margin-block-start: calc(0.5lh - 0.5px); // (1lh − 1 px border) / 2 = the old centre of a one-line row
}
```

Base rules stay byte-for-byte (`.lc-dl__term { margin: 0; flex-shrink: 0 … }`, `.lc-dl__value { flex: 0 1 auto; min-width: 0; overflow-wrap: anywhere … }`): the stacked layout and the existing spec assertions use them. Without `lh` support the leader keeps `align-self: center`.

### 3.2 New story at 360 px (identical at 1024/1280: fixed card widths, left-aligned)

The requester's container (`source-card.html` before its switch to lc-list): `lc-card` (elevated, padding md, 1 px border) → `lc-accordion` flat lg, expanded (body padding 16/22/20) → list. List = card − 78. Plain md cards (lists 246/278) would not show a wrap at 312: the row needs 253.2 px.

```
x16 ┌ lc-card 280 ─────────────────────────┐ x296
    │ Abgewiesene Zeilen               ˅   │  accordion header (lg, 17/600)
    │ x55 ┌ dl 202 ─────────────────┐ x257 │
    │     │Sekundäre Kostenart  ··· 10│     │  term 152.28 · 8 · leader 16 · 8 · value 17.72
    │     │(Umlage)                   │     │  row 8 + 2×21 + 8 = 58 (separator none)
    │     │Periode nach dem      ··· 3│     │  term 161.14 (2 lines), value 8.86
    │     │Monat des Ladens           │     │
    │     │„Gültig bis“ liegt vor ··· 2│    │  term 161.14 (2 lines), value 8.86
    │     │„Gültig ab“                │     │
    │     │Betrag der  ··· 1.234,56 € │     │  term 95.67 (3 lines), value 74.33 (1 line)
    │     │Zeilen mit / Umlage        │     │
    └─────┴───────────────────────────┴─────┘
      gap 16
x16 ┌ lc-card 312, list 234 (x55–289) ─────┐ x328  terms 184.28 / 193.14 / 193.14 (2 lines), 127.67 (2 lines)
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| row | padding-block 8 (md) / 4 (sm); gap 8 | md 14/21 | `--spacing-2`, `--spacing-1`, `--font-size-sm` |
| term | grows 0 → max-content; min 0 | 500, secondary | `--color-text-secondary` |
| leader | min 16; dotted 1 px; y = 0.5lh − 0.5 px − 0.15em | — | `--spacing-4`, `--color-border-strong` |
| value | grows 0 → max-content; min 0; anywhere | 500 tabular, primary | `--color-text-primary` |

3.25.2 in the same container: value 0 px wide, "10" on 2 lines, row overflow 42 px (202) / 10 px (234); in a plain 280 card (246) value 10.52 px, "1"/"0" (`041/proto.log`, `proto2.log`).

## 4. States

| State | lc-button | lc-description-list |
|---|---|---|
| default / hover / focus-visible / active | unchanged; attribute only if set | unchanged (clickable rows keep 45/44 px, ring) |
| disabled | `aria-describedby` kept; found in browse mode | — |
| loading | kept; read on focus with `aria-busy`/`aria-disabled` | — |
| empty | `''` → no attribute | no rows: unchanged |
| error | n/a | n/a |
| row fits | — | boxes identical (measured at 230–312, 60 shots) |
| long term + short value | — | value one line, term wraps at spaces (AC-7/8) |
| short term + long value (3.3) | — | identical to today: E-Mail value 174.09 / 206.09 / 238.09 at lists 248/280/312 |
| both long | — | F/2 each; e.g. 278: term 129.34 (2 lines), "Alle Erwachsenen" 116.66 (1 line) |
| overflow: one word wider than the term's share | — | breaks inside without hyphen ("Leistungsverrechnungsschlüssel" + "10" at 246: 196.28 box); 3.25.2 overflowed 11 px. Consumers can put U+00AD soft hyphens into such compounds |
| overflow: unbroken token > F/2 next to a long term | — | both F/2, value breaks inside, no overflow (term of 248 px + e-mail at 230: 99 / 99, 3 lines each; 3.25.2: 63 px overflow) |
| leaders + `mono` value, one line | — | dots 0.5 px higher (16.4 → 15.9 px from the row top, now equal to every other row); row height 39 unchanged |

## 5. Theming

No colour or token change. Existing pairs the new stories show: dl term `--color-text-secondary` on the elevated card's `--gradient-surface` ends 7.56 / 7.23 L, 9.26 / 11.16 D; value text-primary on surface 17.74 L / 15.85 D; button story reason line text-secondary on the canvas 7.56 L / 12.17 D (computed in 012/025, unchanged tokens). Leader dots are decorative (`aria-hidden`).

## 6. Accessibility

- **Button:** `aria-describedby` on the native `<button>`; accessible description = text of the referenced elements in id order; name stays the content ("Hochladen"). A natively disabled button is skipped by Tab but read in browse mode with its description; a loading button keeps focus and is read on focus. Description beats `title`, so `disabledReason` is not announced twice. SSR writes the attribute only when set. Keyboard, focus ring, 44 px: unchanged (md button is 42 px high, pre-existing and look-frozen by the gap).
- **DL:** no markup, role or order change (`dl > div > dt + leader + dd`). Reflow (1.4.10) improves: no row overflows at 202–312 px. Forced colours: no new colour; the leader keeps its forced border. Reduced motion: no motion. Announcements: none.

## 7. Texts

No built-in strings. Story texts (DE, `lang="de"` on the wrapper; widths at 14 px):

| Story | Text | Width |
|---|---|---|
| button disabled | "Abbrechen", "Hochladen", reason "Wählen Sie zuerst eine Datei." | reason 187.67 (400) ≤ 328 (360) / 288 (320): one line |
| button loading | status "Die Datei wird hochgeladen …" (`role="status"`) | 191.94 (400): one line |
| dl | accordion "Abgewiesene Zeilen"; terms as §3.2; "1.234,56 €" with U+00A0 (what `Intl.NumberFormat('de-DE', {style:'currency',currency:'EUR'})` writes) | §3.2 |

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Button: Disabled with a visible reason (3.26) | `components-button--disabled-with-visible-reason` | `variant: 'primary', disabled: true, ariaDescribedBy: 'upload-reason'` | Row (flex-wrap, end, gap 8): outline "Abbrechen" + primary "Hochladen" (`disabledReason` = same text); below it `<p id="upload-reason">` (14 px, text-secondary, `text-align: end`, margin 0, gap 8). Play: disabled, `aria-describedby="upload-reason"`, `toHaveAccessibleName('Hochladen')`, `toHaveAccessibleDescription('Wählen Sie zuerst eine Datei.')` |
| Button: Loading with a description (3.26) | `components-button--loading-with-description` | `variant: 'primary', loading: true, ariaDescribedBy: 'upload-status'` | Same row; status line `<p id="upload-status" role="status">`. Play: not disabled, `aria-disabled`/`aria-busy` true, describedby + description |
| Button meta `argTypes.ariaDescribedBy` | — | `control: 'text'`, `table.defaultValue.summary: "''"` | description = §2 JSDoc, short form |
| DL: Long terms, short values (3.26) | `components-description-list--long-terms-short-values` | `items` = §3.2 rows; template fixed: `[leaders]="true" separator="none" size="md"`; imports Card + Accordion | Two wrappers `max-width: 280px` / `312px` (grid gap 16) with `<lc-card>` → `<lc-accordion title="Abgewiesene Zeilen" variant="flat" size="lg" [expanded]="true">` → list. Description: the bug, the share rule, F/2, NBSP |
| DL meta description | — | — | Bullet "3.26 (041): …" = §2 sentence |
| All 10 existing dl stories, 5 button stories | unchanged | — | AC-10 / AC-3 by hash |

## 9. Verification

Measure for the dl stories: `tmp/story-shots/041/story-measure.js` (paste inline; per list `x/width/overflow`, per row `term/tW/tLines/tInside/vW/vLines/vInside/leaderW/leaderTop/rowH/overflow`).

| AC | How | Expected value |
|---|---|---|
| AC-1/2/3 | unit tests: input default `''`; no attribute for unset and `''`; `'reason'` and `'a b'` while `disabled`, `loading`, both; attribute-name list and classes of a default button equal to 3.25.2's; existing assertions untouched | pass |
| AC-4 | unit: ids resolve to the `<p>`; story play `toHaveAccessibleDescription`; review: AX description via `--measure` | "Wählen Sie zuerst eine Datei.", name "Hochladen" |
| AC-5 | 2 button stories + argType at 360/1280 L/D | reason one line, row one line, no overflow at 360 |
| AC-6 | read JSDoc + button-link story text | sentence of §2 present |
| AC-7 | new dl story, 360/1024/1280 L/D | lists 202 / 234; row 1 value 17.72, vLines 1, vInside 0; term 152.28 / 184.28, tLines 2, tInside 0; leaderTop 15.9; overflow 0 |
| AC-8 | same story, row 4 | value 74.33, 1 line, 0 inside; term 95.67 (3 lines) / 127.67 (2 lines), tInside 0 |
| AC-9 | 3.3 story at 280/312/360 L/D | lists 248/280/312, overflow 0, rows equal to `041/ac9-before.log` (E-Mail value 174.09 / 206.09 / 238.09) |
| AC-10 | 10 dl stories `--full --compare=tmp/story-shots/041/baseline` (60 shots); 5 button stories `--compare=tmp/story-shots/041/baseline-button` (360/1280 L/D, not `--full`, 20 shots) | 60/60 and 20/20 identical |
| AC-11 | markup untouched: semantics spec (pinned HTML) passes; compat prerender unchanged | pass |
| AC-12 | full suite; CHANGELOG 3.26.0 — Added (`ariaDescribedBy`, gap row 7, sources upload dialog), Fixed (dl short values, Pixel 7 / iPhone 15, "Sekundäre Kostenart (Umlage)" / "10", values above), Compatibility (no API break; fitting rows unchanged; wrapped rows now wrap the term; leaders: dots on the first line, mono rows 0.5 px) | pass |

**Risks for the build:** (1) `description-list.component.spec.ts` l. 168 finds the *first* `.lc-dl__value {` — the new grouped rule must compile after the base block. (2) `clickable.spec.ts` needs exactly one `.lc-dl--rows .lc-dl__row` rule: don't add a second. (3) Its regex strips only `@media`, so the `@supports` leader rule shows up as a second `.lc-dl--leaders .lc-dl__leader` rule; no spec reads that selector, a new pin must parse `@supports` itself. (4) Lowering `$_share` below ~1e5 lets the leader take a fraction of a px from the value (rounding): keep 1000000. (5) Only Chromium is testable here; the rule is plain flex-grow + `max-content` (Safari ≥ 11) + `lh` behind `@supports` (Safari ≥ 16.4).
