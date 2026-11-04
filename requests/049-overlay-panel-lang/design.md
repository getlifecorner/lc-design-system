# Design 049: Overlay panel language (datepicker, date-range-picker, combobox)

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-11
- **Measured on:** main 1edca6b (3.30.1), Storybook rebuilt 2026-11-04. Logs and measures in `tmp/story-shots/049/`.

## 1. Approach

Extend, no new API. Each panel root gets one `[attr.lang]` binding whose value follows one rule, computed only while the panel is open:

| Component | Panel root | `lang` value | Why |
|---|---|---|---|
| `lc-datepicker` | `.lc-datepicker-calendar` (`role="dialog"`, CDK overlay under `<body>`) | the host's closest `[lang]`, else `locale`, else none | the overlay can't inherit the host's language (048 r1: `contains` = false, resolves to `<html lang="en">`) |
| `lc-combobox` | `.lc-combobox__dropdown` (`role="listbox"`, CDK overlay) | the host's closest `[lang]`, else none | no `locale` input; the option texts come from the consumer, in the host's language context |
| `lc-date-range-picker` | `.lc-drp__dropdown` (`role="dialog"`, rendered **inside** the host) | none while the host has a `[lang]` ancestor (DOM inheritance already gives it); else `locale` (default `de-DE`) | AC-5: set only what inheritance doesn't give |

"Closest `[lang]`" is `host.closest('[lang]')`, so the host's own `lang`, a wrapper and `<html lang>` all count, and the value is taken as is (`lang=""` = unknown language, as DOM inheritance would give). On a normal page `<html lang>` exists, so datepicker and combobox panels always get an explicit `lang` equal to the language they would have had in place; nothing is spoken differently except in a part with another language. The `locale` fallback only acts on pages without any `lang` (unit tests, AC-2/AC-5).

Conflict kept as the spec decides (assumption 1): `<html lang="en">` + `locale="de-DE"` without a wrapper marks the German month names `en`, as today (measured: the DRP *Default* story is this case, "Juli 2026" under `en`). No question to the spec-writer: the rule is the release note's and AC-1…AC-3 pin it.

Shared helper (internal entry, no semver): `closestLang(el)` in `src/lib/internal/a11y/content-lang.ts`, exported from `internal/a11y/index.ts` (the entry already serves `nameWithText` to five components). Sketch:

```ts
/** `lang` of the closest `[lang]` element of `el` (itself included), or `null`. `null` without a DOM `closest` (server DOM). */
export function closestLang(el: Element | null | undefined): string | null {
  return typeof el?.closest === 'function' ? (el.closest('[lang]')?.getAttribute('lang') ?? null) : null;
}
```

```ts
// datepicker (inject the host ElementRef; the component has none yet)
protected readonly panelLang = computed(() =>
  this.isOpen() ? (closestLang(this.host.nativeElement) ?? (this.locale() || null)) : null);
// combobox (existing elRef)
protected readonly panelLang = computed(() => (this.isOpen() ? closestLang(this.elRef.nativeElement) : null));
// date-range-picker (existing elRef)
protected readonly panelLang = computed(() =>
  this.isOpen() && closestLang(this.elRef.nativeElement) === null ? this.locale() || null : null);
```

**When it is read (AC-1, AC-6):** the computed depends on `isOpen`, so every opening (false → true, a new signal version) re-reads the DOM; a `lang` change while closed shows at the next opening. The combobox opens in three places (`onInput`, `onInputFocus`, ArrowDown); the computed covers all of them without touching each. A `lang` change while the panel stays open is not followed (out of scope; a `locale` change is, through the computed).

**SSR (AC-10):** `isOpen` is `false` on the server and the overlay template is never instantiated there, so the DOM is never read; `closestLang` also returns `null` where `closest` is missing. No `PLATFORM_ID` check, no change to prerendered HTML.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | — | — | — | none added, none changed in type or default |
| JSDoc only | `lc-datepicker` `locale` | `string` | `''` | append: "Also the open panel's `lang` when the host has no `[lang]` ancestor (3.30.2)." |
| JSDoc only | `lc-date-range-picker` `locale` | `string` | `'de-DE'` | append the same sentence |
| JSDoc only | `ComboboxComponent` class doc | — | — | append: "The dropdown takes the `lang` of the host's closest `[lang]` (3.30.2)." |
| internal | `closestLang` | `(el: Element \| null \| undefined) => string \| null` | — | `@lifecorner/angular-ui-kit/internal/a11y`, not re-exported by the primary entry |

No slot, no CSS hook, no exported type. Default rendering unchanged: the binding sits only on the panel roots, which don't exist while closed (no attribute or comment anchor at rest); the DRP binding renders `null` (no attribute) on every page with a `lang` ancestor. Proven before the build: 124/124 at-rest shots stable, and 28/28 opened panels with the `lang` injected identical to the baseline (§9).

## 3. Anatomy and layout

No box, spacing or type changes. Where the attribute goes (same at every width):

```
<body lang inherited from <html lang="en">>
  #storybook-root … <div lang="de"> <lc-datepicker> field … </lc-datepicker> </div>
  .cdk-overlay-container
    .cdk-overlay-backdrop
    .cdk-overlay-pane
      div.lc-datepicker-calendar role=dialog  lang="de"   ← NEW (host's closest [lang])
  (combobox) .cdk-overlay-pane > div.lc-combobox__dropdown role=listbox lang="de"  ← NEW
  (drp, in the host) lc-date-range-picker > div.lc-drp__dropdown role=dialog  (no lang: inherits)
```

Measured panel boxes (baseline, unchanged by design; x, y, w, h):

| Story (opened) | 360 | 1280 |
|---|---|---|
| datepicker *Default* (day, July 2026) | 2, 60, 342 × 448 | 16, 60, 310 × 395 |
| datepicker *Label (DE)*, field 2 „Buchungsdatum“ | 2, 170, 342 × 448 | 16, 170, 310 × 395 |
| datepicker *Month* / *Month DE* (2025) | 16, 60, 310 × 350 | 16, 60, 310 × 350 |
| combobox *Default* | 16, 89, 150.31 × 240 | same |
| combobox *Starts with a choice* | 16, 89, 85.92 × 39 | same |
| date-range-picker *Default* | 16, 85, 280 × 349.28 | same |

## 4. States

| State | Behaviour |
|---|---|
| closed (all states at rest: default, hover, focus-visible, disabled, readonly, error, filled) | no panel, no `lang` anywhere; DOM identical |
| open | panel `lang` per §1, read at this opening |
| reopened after a host `lang` change | the new value (AC-6) |
| `locale` changed while open (datepicker) | follows when no `[lang]` ancestor exists |
| disabled / readonly | the panel never opens, nothing read |
| loading, empty (combobox) | spinner and „Keine Treffer“ sit inside the dropdown and are marked with its `lang` |
| month mode (datepicker) | same root element, same rule |
| overflow | none at 100 %. Side effect: the month cells (`.lc-datepicker-month`, `hyphens: auto`, the only hyphenation rule in the panels; the combobox group header's `uppercase` has no German-specific case mapping) now hyphenate with the panel's language; at 360/1280 nothing breaks (hash-identical); at 200 % German month names break by German rules (correct, not baselined). The field label is in the host and unaffected |

Found while measuring, out of scope (developer: list in `build.md` → known limits for the backlog): the combobox dropdown is content-sized, not field-wide, although `cdkConnectedOverlayMatchWidth` is on: 85.92 px under a 328 px field (*Starts with a choice*, *Clear Targets (DE)* xs–lg at 360), 150.31 in *Default*. The dropdown is a flex item of the CDK pane without a width. Other CDK overlays (tooltip, menu, select, dialog, …) have the same `lang` gap (spec assumption 4).

## 5. Theming

No colour, token or theme change; contrast unchanged in light and dark (rasters identical, §9). No new token.

## 6. Accessibility

- **3.1.2 Language of Parts:** the panel's `lang` is what browsers expose as the accessible object's language (Chromium AXLanguage / IA2 `language`), so screen readers switch the voice for „Mittwoch, 4. November 2026, ausgewählt“, „Vorheriger Monat“, the `aria-live` month title and the listbox options.
- Roles, `aria-*`, names, focus order and keyboard are untouched (the measure lists the panel attributes: `aria-label class id role` → `aria-label class id lang role`; combobox `class id role` → `class id lang role`). Focus stays on the combobox input (`INPUT.lc-combobox__input`), datepicker focus as before.
- 44 px targets, `forced-colors`, `prefers-reduced-motion`: no change.
- axe: `valid-lang` must stay clean (baseline and prototype: 0 violations in 28 opened shots; incomplete only `aria-valid-attr-value:1`, `bypass:1`, plus DRP `color-contrast:51`, `label-content-name-mismatch:2`, all pre-existing).

## 7. Texts

No built-in string added or changed. Story strings (EN default → DE in the new stories):

| Input | EN (field 1) | DE (field 2, in `lang="de"`) |
|---|---|---|
| datepicker `label` / `placeholder` | Start date / default | Buchungsdatum / Datum wählen |
| datepicker `clearAriaLabel`, `todayLabel`, `selectedAriaLabel`, `dialogAriaLabel`, `previousMonthAriaLabel`, `nextMonthAriaLabel` | defaults | Datum löschen, Heute, ausgewählt, Datum wählen, Vorheriger Monat, Nächster Monat |
| combobox `label`, `placeholder`, `emptyMessage`, `clearAriaLabel` | Select a fruit, defaults | Gilt ab, Monat suchen …, Keine Treffer, Auswahl löschen |

*Label (DE)* stays unchanged (it is the AC-8 hash reference); its docs description may add "the open panel is marked `lang="de"` (3.30.2)" (docs text is not in the canvas). 048-n2 stays in the backlog.

## 8. Stories

| Story | Expected ID | Args / template | Shows |
|---|---|---|---|
| Datepicker *Panel Language* (new, after *Label (DE)*) | `form-datepicker--panel-language` | flex column, gap 16, max-width 400: field 1 `label="Start date"` `[ngModel]="'2026-07-15'"` (no wrapper, no `locale`); `<div lang="de">` field 2 with `locale="de-DE"`, the §7 strings, `[ngModel]="'2026-07-15'"`. `play`: in story view, wait 50 ms, click `[lang="de"] lc-datepicker input` | EN panel `lang="en"`, DE panel `lang="de"`; both open at July 2026 (no today marker, hash-stable) |
| Combobox *Panel Language* (new, after *Clear Targets (DE)*) | `form-combobox--panel-language` | same column: field 1 `fruitOptions`, `label="Select a fruit"`; `<div lang="de">` field 2 `monthOptions` with the §7 strings. `play`: in story view, wait 50 ms, focus `[lang="de"] lc-combobox input` | EN dropdown `lang="en"`, DE dropdown `lang="de"` (12 German months) |
| Description of both | — | "3.30.2 (request 049, 048-f1): the panel renders under `<body>`, outside the page's `lang` wrapper; it now takes the host's closest `[lang]` (else `locale`), so screen readers read the German panel with German rules. Layout unchanged." Combobox: "(the combobox has no `locale`)" instead of "(else `locale`)". | AC-9 docs |

*Change note (review r1, 2026-11-05):* the shared description gave the combobox a `locale` fallback it doesn't have (§1, spec assumption 2). The developer's wording (build.md deviation 1) is the correct one and is adopted here.

AC-9 says "a story … shows both panels": one story per component instead, because only one overlay is open at a time (the datepicker has a backdrop) and each docs page should show its own panel. Both stories are listed in `build.md`.

## 9. Verification

Baselines (main 1edca6b, don't open the shots): `tmp/story-shots/049/baseline` = all 31 stories of the three components at rest, 360/1280 L/D, 124 shots, measure = 800 ms wait, stable twice (`stability.log` 124/124). `baseline-open` = 7 stories opened by `open-measure.js` (P = 0: datepicker Default, Month, Month DE, Label (DE) field 2, combobox Default, Starts with a choice, DRP Default; day panels navigated to July 2026, month panels to 2025), 360/1280 L/D, `--axe`, 28 shots. Prototype `proto-open` (same measure, P = 1 sets the rule's `lang` before the shot): **28/28 identical**, axe 0.

| AC | How | Expected value |
|---|---|---|
| AC-1 | unit (datepicker spec): host in `<div lang="de">`, `open()`, query `.cdk-overlay-container [role="dialog"]` | `lang="de"` |
| AC-2 | unit: no wrapper, `locale="de-DE"` (assert `document.documentElement` has no `lang`) | `lang="de-DE"` |
| AC-3 | unit: no wrapper, no `locale` | `hasAttribute('lang') === false` |
| AC-4 | unit (combobox spec): focus the input in `<div lang="de">` / without wrapper | `lang="de"` / no attribute |
| AC-5 | unit (DRP spec): in `<div lang="de">` → `panel.closest('[lang]').lang === 'de'` and `!panel.hasAttribute('lang')`; no wrapper → `lang="de-DE"`; `locale="en-GB"` → `en-GB` | as stated |
| AC-6 | unit (datepicker + combobox): open in `lang="de"`, close, set wrapper `lang="fr"`, open | `lang="fr"` |
| AC-7 | full suite with no edited assertion (grepped: no spec pins the panel roots' attributes; `day-names.spec` pins day buttons only, `i18n-labels.spec` the panel `aria-label`); review: `--compare=…/baseline` | 124/124 identical |
| AC-8 | `open-measure.js` (P = 0) on the build, `--compare=…/baseline-open`, `--axe` | 28/28 identical; measure `[1]` (panel `lang`) = `de` for Month DE, Label (DE), Starts with a choice; `en` for Default, Month, combobox Default; `null` for DRP; `[2]` effective = same, DRP `en`; `[7]` attributes + `lang`; `[8]` boxes as §3; `[10]` focus unchanged; axe 0 |
| AC-9 | `lang-measure.js` (opens every field in turn) on both new stories, 360/1280 L/D | per field `[host lang, panel lang, effective, :lang(de)]`: field 1 `en, en, en, false`, field 2 `de, de, de, true`; datepicker boxes 342 × 448 (360) / 310 × 395 (1280); combobox widths content-sized as §3; open 2 shots per story (360 and 1280 light) |
| AC-10 | CI compat check | `EXPECT_IN_HTML` untouched, output unchanged |
| AC-11 | changelog review | *Fixed* entry names 048-f1, states "no API break", gives the rule "closest `[lang]`, else `locale`" (combobox: closest `[lang]` only; DRP: inherits, `locale` only without any `lang`) |

`lang-measure.js` probe on 3.30.1 (`lang-probe.log`, 360 light): *Label (DE)* 4 fields, *Month DE*, *Clear Targets (DE)* 5 fields: host `de`, panel `null`, effective `en`, `:lang(de)` false: the bug as filed.
