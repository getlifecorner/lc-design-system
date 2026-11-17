# Design 062: checkbox/chip contrast, select option groups, first USM X gaps

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-26. Built on 3.41.0 (`37b01ef`); every value below is measured on that build (logs in `tmp/story-shots/062/probe-*.log`, `proto-select.log`, `r1-contrast.log`).
- **Resumed 2026-11-17 07:56** (run stopped at 01:58): R-1 and the chip hover computed (§5), §3 *From 1024 px* and §7 story strings added, baselines completed and recorded (§9).
- **Changed in review r1 (2026-11-17):** §3 C long header = 3 lines / 66 px at 360 (my 48 px came from a prototype with another label); §6 forced colours needs a rule for the check and the radio dot (the "no new rules" premise was wrong, measured in `062/r1-fc`); §7 story strings and layout as built (build.md Deviation 3).

## 1. Approach

| Group | Extend / pattern | Decision |
|---|---|---|
| A checkbox | Extend; `lc-radio` (field border, lg 44), `lc-input` readonly (muted fill, field border), group token pattern of 3.41 | D-1 disabled checked keeps the fill: label 1, text .5, box .75. D-2 readonly = muted box, field border, check in `--color-text-primary` (primary fill in dark is 2.31–3.03 vs pages, fails AC-3's 3:1). D-3 44 px rule = `lc-radio`: only `lg` is the touch size. |
| A' radio (parity) | Same two defects in `lc-radio`: error border `--color-error` 2.24 D (WCAG 1.4.11), help indent 0 | D-4 fixed here too, one token and one rule, so checkbox and radio stay alike in one form. |
| B chip | Extend; 3.40 private-var pattern | Hover fill reads `--lc-chip-bg` first (in and outside a hero); clickable chips restate their size's font size. |
| C select | Extend; `lc-combobox` group header look; APG "listbox with grouped options" | D-5 headers inside `role="group"`; flat index for keyboard/ids unchanged. D-6 keyboard highlight scrolls into view (measured: options 6–8 of the 3-group panel are hidden when highlighted, WCAG 2.4.11). |
| D icon | New token like `LC_LOGO_BASE_PATH`; `minus` joins the hand-picked (heroicon) map beside `plus` | D-7 the minus is the plus's horizontal stroke, so the stepper pair matches (Tabler minus is stroke 2 vs 1.5). |
| E button | Extend; `ariaDescribedBy` pattern (inner `<button>`, empty = no attribute) | No visual; pressed look stays the consumer's. |
| F input | Extend | D-8 (AC-17) `invalid` on every field whose `error` is a **message string**: lc-input, email-input, password-input, number-input, combobox, verification-code-input. Same rule each: OR into the existing invalid class + `aria-invalid`; message and `aria-describedby` follow `error` only. Fields with a boolean `error` (select, datepicker, textarea, checkbox, radio) already allow "invalid without message": nothing to add. |
| G badge | Chip pattern 1:1 | Variants set `--_lc-badge-*`; base reads `var(--lc-badge-x, var(--_lc-badge-x))`. |
| H spinner | Extend size union | `xs` = 16 px, inline, no padding; host class only for `xs`. |

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | `lc-checkbox.readonly` | `boolean` | `false` | Shows the value at full contrast but it can't be changed: click and Space do nothing (no `checkedChange`, no form write), the checkbox stays in the tab order and gets `aria-readonly="true"`. Inside an `lc-checkbox-group` the group's `readonly` sets it as well. `disabled` wins. |
| input | `lc-checkbox-group.readonly` | `boolean` | `false` | Every checkbox in the group is read-only (see `lc-checkbox` `readonly`); the value can't change. |
| type | `CheckboxGroupContext.groupReadonly` | `Signal<boolean>` **optional** (`?`) | — | Optional so an outside implementation of the exported interface still compiles. |
| token | `LC_ICON_BASE_PATH` | `InjectionToken<string>`, `providedIn: 'root'` | `'/tabler-icons'` | Base URL of the served Tabler set for names outside the inline set: `${base}/outline|filled/<name>.svg`; a trailing `/` is ignored. A relative value (`'tabler-icons'`) resolves against the document's `<base href>`. In `icon.component.ts` (exported through `index.ts`). |
| const | `ICON_MINUS`, `ICON_MINUS_SOLID` | `LcIconDefinition` | — | Generated from `INLINE_ICON_SVGS.minus` (after `plus`): outline `M19.5 12h-15` (stroke 1.5), solid `M3.75 12a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z`, same `<svg>` wrappers as `plus`. `BUNDLED_ICONS` 156 → 158. |
| input | `lc-button.ariaPressed` | `ButtonAriaPressed \| null` | `null` | `aria-pressed` on the inner `<button>` for a toggle (`false` renders `"false"`); `null` renders none. Style the pressed look yourself (`lc-button .btn[aria-pressed="true"]` or a bound `variant`). |
| input | `lc-button.ariaExpanded` | `boolean \| null` | `null` | `aria-expanded` on the inner `<button>` (disclosure, popup trigger). Inside `lc-menu` leave it unset: the menu sets it. |
| input | `lc-button.ariaHasPopup` | `ButtonAriaHasPopup \| null` | `null` | `aria-haspopup` on the inner `<button>`. Not needed inside `lc-menu`. |
| input | `lc-button.ariaControls` | `string` | `''` | Id(s) for `aria-controls` on the inner `<button>`; empty renders none. |
| type | `ButtonAriaPressed` / `ButtonAriaHasPopup` | `boolean \| 'mixed'` / `boolean \| 'menu' \| 'listbox' \| 'tree' \| 'grid' \| 'dialog'` | — | Exported from `button.component.ts`. |
| input | `invalid` on lc-input, lc-email-input, lc-password-input, lc-number-input, lc-combobox, lc-verification-code-input | `boolean` | `false` | Marks the field invalid without a message: error border and `aria-invalid="true"`; `aria-describedby` stays as it is. For a form that lists its errors once (an error summary that names and links the field), so the error is not shown by colour alone. A set `error` implies it; with both the message shows once. (email-input passes it to its lc-input.) |
| CSS hook | `--lc-badge-bg` / `-fg` / `-border` | colour | the variant's | Unchanged names; now win when set on the badge, the `lc-badge` host, any ancestor or `:root`. |
| type | `SpinnerSize` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | `xs` (16 px, inline, no padding) for a list row, a tab or a button-sized slot; a `message` sits beside it. |
| — | `lc-select` `options` | unchanged `SelectOption[] \| SelectOptionGroup[]` | — | JSDoc: groups render a header each (not selectable); with `searchable`, groups without hits are hidden. |

Default rendering unchanged: every new input defaults to "absent" (`null`/`''`/`false` = no attribute, no class); the badge's private vars resolve to the old values; flat select options take the old template branch (§3 C); the spinner host gets a class only for `xs`. The deliberate look changes: AC-1, AC-2 (checkbox rest border, dark error border), D-4 (radio), AC-4/AC-5 (indent, lg row), AC-7 (clickable chip font), the minus glyph (D-7).

## 3. Anatomy and layout

### A checkbox (360 px, measured on 3.41 + prototype)

```
size  row (label)   box  text x   help/error x   (prototype = text x)
xs    23            16   24       0 → 24
sm    23            18   26       0 → 26
md    26 (host 27)  20   28       0 → 28
lg    29 → 44       24   32       0 → 32         lg alone: min-height 2.75rem, as lc-radio lg / group lg
```
- AC-4: define `--checkbox-size` for the label's following siblings: `.checkbox-<size>, .checkbox-<size> ~ * { --checkbox-size: … }` (no DOM change; the help/error `margin-left: calc(var(--checkbox-size) + 0.5rem)` then resolves). Same for `lc-radio` (`--radio-size`).
- AC-5: `.checkbox-lg { min-height: 2.75rem }` replaces `.checkbox-lg.checkbox-in-group`. Rule (same as `lc-radio`): `lg` is the touch size (44 px row); `xs`/`sm`/`md` are dense rows (23/23/26 px) that meet WCAG 2.5.8 by spacing (group gap 8 → pitch ≥ 31).

### B chip (no geometry change)

- AC-6: quiet clickable hover → `var(--lc-chip-bg, var(--color-surface-hover))` (l. 219) and in a hero `var(--lc-chip-bg, var(--_lc-hero-glass))` (l. 321); the other variants already read the hook at rest and keep `brightness(1.06)`.
- AC-7: `font: inherit` in `&--clickable` (l. 196) beats the size rules (same weight, later). Restate after it: `&.lc-chip--sm, &.lc-chip--md { font-size: var(--typography-font-size-sm, 0.875rem) }`, `&.lc-chip--lg { font-size: var(--typography-font-size-base, 1rem) }`.

### C select panel (360 px, prototype in the opened panel; 1280: same rows, panel = field width)

```
x16 ┌ panel 328, pad 8, max-height 320, scrolls ───────────┐
    │ KUNDENART                       header 30 (12/18, pad 6/12)
    │ [ Intern                     ]  option 37 (unchanged)
    │   Extern
    │ ───────────────────────────────  group 2+: margin 4 + 1 px border + pad 4
    │ KUNDEN MIT                      header 66 (3 lines, r1: Chromium breaks at the
    │ LEISTUNGSVERRECHNUNGSVEREINBA-  space first, then hyphenates; panel lang="de")
    │ RUNG
    │   Kreissparkasse Musterstadt
    └───────────────────────────────────────────────────────┘
```
- DOM: `listbox > div.lc-select__group[role=group][aria-labelledby=<listboxId>-group-<g>] > (div.lc-select__group-label[role=presentation][id] + option…)`. `g` = index in the unfiltered groups (stable while filtering). Options keep `optionId(i)` with `i` = index in the flat filtered list, so `highlightedIndex`, `aria-activedescendant` and `selectOption` are untouched; `filteredOptions` stays flat (keyboard skips headers by construction).
- Template (AC-10): keep today's flat `@for` as the outer `@else`: `@if (filteredOptions().length === 0 || visibleGroups()) { @if (visibleGroups(); as groups) { …grouped… } @else { …no-results row… } } @else { …today's flat @for… }`. `visibleGroups()` = `null` for flat options or when nothing matches. Flat non-empty panels stay byte-identical (same anchors); the flat "no results" row gains 2 comment anchors only.
- `.lc-select__group-label`: `padding: var(--spacing-1-5) var(--lc-density-padding-sm, var(--spacing-3))`, `font-size: var(--font-size-xs)`, `font-weight: var(--font-weight-semibold)`, `line-height: 1.5`, `color: var(--color-text-tertiary)`, `text-transform: uppercase`, `letter-spacing: 0.05em`, `overflow-wrap: break-word`, `hyphens: auto`, `hyphenate-limit-chars: 12 4 3`, `cursor: default`, `user-select: none` (combobox header look, 018/024 wrap rule). `.lc-select__group + .lc-select__group { margin-top: var(--spacing-1); padding-top: var(--spacing-1); border-top: 1px solid var(--color-border) }` (requester's divider; decorative).
- D-6: after ArrowUp/ArrowDown/Home/End change the highlight, set `.lc-select__dropdown`'s `scrollTop` by the least amount that shows the option inside the panel's padding box; for the first option of a group, use the header's top as the target top. Instant, no `scrollIntoView` (page must not scroll), never on `mouseenter`.

### H spinner xs

```
44 px row:  [Belege werden geladen …                 ◌16]   host = flex item 16×16, no strut
text line:  Synchronisiere Konten ◌  (vertical-align: middle, 14/21 line unchanged)
slot 40×40: [   ◌   ]  centred
```
`.spinner--xs { display: inline-flex; flex-direction: row; padding: 0; gap: var(--spacing-2); vertical-align: middle }`, circle `1rem`, border 2 px (as sm/md); `.spinner--xs .spinner__message { font-size: inherit }`. Host: `host: { '[class.lc-spinner--inline]': "size() === 'xs'" }` + `:host(.lc-spinner--inline) { display: inline-flex; vertical-align: middle }` (an inline host in a flex row would add a line strut, 060).

### From 1024 px

No changed component has a breakpoint: checkbox, radio, chip, badge, spinner, button and the fields keep the 360 values (and the tokens in the bullets above) at 1024/1280. Select (prototype, *With Groups* at 1280):

```
x16 ┌ panel 1248 (= field), pad 8, max-height 320 ─────────────────────────────┐
    │ KUNDEN MIT LEISTUNGSVERRECHNUNGSVEREINBARUNG   header 30 (one line)      │
    └ options 37, divider as at 360; without D-6 options 7–8 stay hidden ─────┘
```

## 4. States

**Checkbox matrix** (tokens; "—" = unchanged):

| State | Label op. | Text op. | Box bg | Box border | Check | Box op. | Cursor |
|---|---|---|---|---|---|---|---|
| rest (unchecked) | — | — | — | `--color-field-border` (was neutral-400) | — | — | — |
| hover / checked / focus | — | — | — | — | — | — | — |
| error (every state, also readonly) | — | — | — | `--color-error-600` (was `--color-error`: dark only changes) | — | — | — |
| disabled unchecked | .5 | — | — | — | — | — | — |
| disabled checked / indeterminate | 1 | .5 | `--color-primary-fill` | `--color-primary-fill` | `--color-on-primary` | .75 | not-allowed |
| readonly unchecked | 1 | 1 | `--color-surface-muted` | `--color-field-border` | — | 1 | default, no hover |
| readonly checked / indeterminate | 1 | 1 | `--color-surface-muted` | `--color-field-border` | `--color-text-primary` | 1 | default, no hover |
| readonly + disabled | = disabled (no `aria-readonly`) |

Readonly blocks the toggle with `(click)` → `preventDefault()` on the input (Space and label clicks fire `click`), so no `change`/`input` event, model or group write happens; the indeterminate state is kept. `handleChange` keeps its guard.

**Select:** empty group list while filtering → hidden (header too); nothing matches → today's "no results" row; one-option group → header + 1 option; multiple mode → same headers, checkboxes in the options; long group label → wraps (hyphenated); many options → scrolls, highlight followed (D-6). **Chip:** hover with `--lc-chip-bg` set = that fill (+ the existing `brightness(1.06)`); without it as before. **Spinner xs:** reduced motion = the global rule stops it as a static arc (as sm–lg). **Fields:** `invalid` + `readonly`/`disabled` behave as `error` does today.

## 5. Theming

| Element | Light | Dark | Contrast (computed, 3.41 tokens; min over pages) |
|---|---|---|---|
| Checkbox rest border | `--color-field-border` | same | L 4.39 (sunken)–4.83, D 5.56 (s2/raised)–7.31; old neutral-400 2.31 / 2.96 |
| Checkbox error border | `--color-error-600` | same | L 7.62–8.39 (unchanged), D 7.21–9.48 (old 1.71–2.24) |
| Disabled checked check vs fill (box .75) | on-primary / primary-fill | same | L 3.63–3.68, D 4.67–4.84 (old 1.05 L) |
| Readonly box border vs muted box | field-border | same | L 4.63, D 5.26 (raised)–7.01 (page); muted dark = 2 % white composited on each page |
| Readonly check vs box | text-primary on surface-muted | same | L 16.98, D 12.43 (raised)–16.57 (page) (R-1, ≥ 4.5 required) |
| Select header text | `--color-text-tertiary` on the panel gradient | same | measured at each header: L 5.58–5.82, D 5.65–6.71 |
| Spinner xs arc / track | primary-600 / primary-200 | same tokens | arc L 5.64–6.21, D 8.97–11.78; track decorative |
| Chip hover in hero, hook pair (story) | `--color-surface` + `--color-on-info-subtle` | same | rest 10.16 L / 10.64 D; hover (`brightness(1.06)` on fill and ink, sRGB and linear) L 9.56–9.85, D 11.09–11.75; band-independent (opaque fill) |
| Badge hook story | same pair as chip story | same | 10.16 / 10.64 |

No new token. `lc-radio` error border → `--color-error-600` (same values as the checkbox row).

## 6. Accessibility

- Checkbox readonly: native checkbox, `aria-readonly="true"` (axe 4.14: no violation, probed), focusable, `aria-checked` from the native state. Group: no ARIA on the fieldset (`aria-readonly` is not allowed on `group`).
- Select: listbox → `group` (named by its header via `aria-labelledby`) → `option`; header `role="presentation"` (APG). Screen readers announce the group on entry; "x of y" counts options only. Highlight stays visible (D-6).
- Button: attributes only on the inner `<button>`; host untouched. With `lc-menu`, its imperative attributes survive (a `null` binding never writes after the first pass): unit-test lc-menu + lc-button trigger.
- Input `invalid`: `aria-invalid` without description; the JSDoc requires a summary that names the field (WCAG 1.4.1, 3.3.1).
- Spinner xs: `role="status"`, `aria-live="polite"`, `loadingLabel` as before. Forced colours: add `@media (forced-colors: active) { .spinner__circle { border-color: GrayText; border-top-color: CanvasText } }` for every size (today both forced to one colour, the arc is invisible).
- Forced colours (r1): box border, focus ring, select header and divider follow system colours, but the check (SVG `color: var(--color-on-primary)`, kept by Chromium's `preserve-parent-color`) is white on a white `Canvas` box in light FC, and the radio dot (`background-color`, forced to `Canvas` like its circle) vanishes in both. Add `@media (forced-colors: active)` to checkbox and radio: check and dot `CanvasText` (`forced-color-adjust: none`), disabled `GrayText`. The check rule must beat `.checkbox-label.checkbox-readonly .checkbox-icon` (0,3,0) by weight or order, else a light page under a dark FC theme keeps the dark readonly ink. Expected in `--forced-colors` 360 L/D: every check/dot `CanvasText`, disabled `GrayText` (prototype `062/r1-fc-proto`).
- Targets: checkbox lg 44; select options 37 high, full panel width (unchanged).

## 7. Texts

No new built-in text (AC-21): group labels are data, `loadingLabel` exists. DE is verified in the stories of §8 with these story strings (every visible string, 034 r1):

| Story | DE strings |
|---|---|
| Checkbox *Read-only and Disabled* / group *Read-only* | three horizontal groups (legends Bearbeitbar, Schreibgeschützt, Deaktiviert) × aus, an, teilweise · legends „Rollen“ and „Projektrollen“: Lesen, Bearbeiten, Verwalten (r1: as built) |
| Select *Grouped Options (DE)* / *Search* | label „Kunde“, placeholder „Kunde wählen“, `searchPlaceholder` „Kunde suchen …“, `searchAriaLabel` „Kunde suchen“, `noOptionsLabel` „Keine Treffer“, `clearAriaLabel` „Auswahl löschen“ |
| Button *Toggle / Menu Trigger* | Assistent · Spalten (panel „Sichtbare Spalten“: Name, Status, Geändert) · Ansicht (menu: Liste, Karten, Tabelle) |
| Input *Invalid Without Message* | Kostenstelle, Projektnummer · alert „Bitte füllen Sie zwei Pflichtfelder aus“ with links to both fields |
| Spinner *Inline (xs)* | „Synchronisiere Konten“, „Belege werden geladen …“, tab „Buchungen“, `loadingLabel` „Wird geladen“ |

AC-26 replacements (button.component.scss l. 213–220, 233–238, 245–252; button.stories.ts *Inverse*/*Inverse Outline*; button-link.stories.ts l. 175–176, 214): "on every band the label reads 13.17:1 on the pill, the pill and the two-tone ring at least 4.58:1" and "text at least 9.30:1, border and two-tone ring at least 4.58:1 on all nine bands". Drop the per-state hover/active numbers and every "under the body's .85 opacity" clause (3.38 removed the opacity). `9.28` at l. 119 (outline primary) stays.

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Read-only | `form-checkbox--readonly` | `readonly: true, checked: true`, label | AC-3, controls work |
| Read-only and Disabled (DE) | `form-checkbox--readonly-and-disabled` | `controls.include: ['size']` | 3 × 3: Bearbeitbar / Schreibgeschützt / Deaktiviert × aus / an / teilweise (AC-1, AC-3) |
| Sizes with Help Text | `form-checkbox--sizes-with-help-text` | — | xs–lg with help, md with error (AC-4), lg row 44 (AC-5) |
| Read-only (DE) | `form-checkbox-group--readonly` | — | group `readonly` „Rollen“ (2 of 3 checked) + editable group with one readonly item |
| Grouped Options | `form-select--with-groups` | unchanged | docs text only |
| Grouped Options (DE) | `form-select--grouped-options-de` | `size: 'lg'` | §3 C data: Kundenart (Intern, Extern) · Kunden (Allianz Lebensversicherungs-AG, Bayerische Landesbank, Stadtwerke Musterstadt Versorgungs- und Verkehrsgesellschaft mbH, Universitätsklinikum Musterstadt) · Kunden mit Leistungsverrechnungsvereinbarung (Kreissparkasse Musterstadt, Deutsche Bahn AG); `lang="de"`, searchable, DE search/clear/no-results labels; play opens it (story view) |
| Grouped Options, Search (DE) | `form-select--grouped-options-search-de` | `size: 'md'` | same data, play opens and types „stadt“ → 2 groups, Kundenart hidden |
| Base Path | `components-icon--base-path` | `applicationConfig` `LC_ICON_BASE_PATH: 'tabler-icons/'` | 4 non-inline glyphs load (relative + trailing slash) |
| Toggle / Menu Trigger (DE) | `components-button--toggle-and-menu-trigger` | — | „Assistent“ toggle (`ariaPressed`, variant outline ↔ secondary), „Spalten“ disclosure (`ariaExpanded` + `ariaControls` → a panel), „Ansicht“ `lc-menu` trigger without the inputs |
| Invalid Without Message (DE) | `form-input--invalid-without-message` | `invalid: true` | two empty required fields + an `lc-alert` summary below naming them |
| Invalid Without Message | `form-{email-input,password-input,number-input,combobox,verification-code-input}--invalid-without-message` | `invalid: true` | one field each |
| Hooks on an Ancestor | `data-display-badge--hooks-on-an-ancestor` | — | wrapper with the chip story's pair: all 6 variants; one badge with the hook on its host |
| Inline (xs, DE) | `feedback-spinner--inline-xs` | — | text line, 44 px row, 40 px slot, tab-like row (§3 H) |

Every new story binds all its args or sets `controls.include` (055 r1). Chip: descriptions of *Clickable* and *Hooks on an Ancestor* get the 3.42 notes; spinner `size` argType gains `xs`; button/input argTypes get the new inputs with `table.defaultValue`.

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1 | *Read-only and Disabled* 360 L/D, colours composited | check vs fill ≥ 3.63 L / 4.67 D; unchecked disabled = baseline pixels |
| 2 | border/computed colour on page, surface-2, sunken (L) / page, surface, raised (D) | ≥ 4.39 / 5.56; error dark ≥ 7.21; hover/checked/focus unchanged |
| 3 | unit (click, Space, `ngModel`, group value, `aria-readonly`, tabindex 0); story L/D + `--axe` | no change, no output; check ≥ 12.43 (D raised), border ≥ 4.63 |
| 4 | *Sizes with Help Text* 360: help/error x − host x | 24 / 26 / 28 / 32 (= text x) |
| 5 | same story: lg label height; xs/sm/md | 44; 23 / 23 / 26 |
| 6 | `hooks-on-an-ancestor` hover (`:hover`→class clone) + hook pair injected into `on-hero-bands`, 360/1280 L/D | hover fill = hook fill; text ≥ 9.56 L / 11.09 D on all 9 bands |
| 7 | font-size of `.lc-chip--clickable` | sm/md 14 px in a 16 px parent; lg 16; non-clickable unchanged |
| 8–9 | unit DOM/keyboard; DE stories 360/1280 L/D, `--axe`; scroll check | headers per group, hidden when empty; header ≥ 5.58; highlight always inside the panel; no overflow at 360 |
| 10 | baseline-open listbox `outerHTML` (`062/baseline-open.log`) | flat panels identical; no-results identical without comments |
| 11–12 | unit: `/usmx/tabler-icons/` → `/usmx/tabler-icons/outline/x.svg`; default exact `/tabler-icons/outline/x.svg` | as stated |
| 13 | generator run; unit (no request, svg present); resources in number-input stories | no `minus.svg` fetch |
| 14–15 | unit (`false` → `"false"`, `null` → absent, host clean, variant link); story play | as stated |
| 16–17 | unit (class, `aria-invalid`, describedby unchanged, message once) ×6 fields | border ≥ 7.21 (error-600) |
| 18 | badge baselines (41 stories) + hook story | all identical; hooks win from wrapper and host |
| 19 | *Inline (xs)* 360: circle 16 × 16, host 16 high, row 44 | `--forced-colors` arc visible |
| 20–26 | lint, manifest, Jest, compat, changelog review, grep | below |

- **R-1 (computed, `062/r1-contrast.log`):** readonly check L 16.98, D 12.43–16.57; box border L 4.63, D ≥ 5.26. The developer re-measures in the story.
- **AC-24 premise:** the select panel is an overlay and never prerenders. Prerender instead a grouped select with value `extern` (trigger text „Extern“), the number-input with the inline minus `<path … d="M19.5 12h-15"`, `class="spinner spinner--xs"` + host `lc-spinner--inline`, and a disabled checked checkbox (`checkbox-checked checkbox-disabled` + check path).
- **Changed assertions (AC-23, each with its reason):** checkbox lg/disabled/border (AC-1/2/5); `chip.on-band.spec` l. 99–101, 114–116 (AC-6); `icons.spec` 156 → 158 and the slice indices +2, `icon.trusted-types.spec` 156 → 158 (AC-13, minus is a hand-picked key); `badge-contrast.spec` l. 72–73 and `hero.slot-fill.spec` l. 72–73 regexes to `--_lc-badge-*`, `bottom-nav.current-badge.spec` l. 42 (AC-18: bottom-nav's `linear-gradient(var(--lc-badge-bg), …)` must become `var(--lc-badge-bg, var(--_lc-badge-bg))` or the current-pill underlay disappears). Docs: `bundle-size.mdx` (156 → 158, `LC_ICON_BASE_PATH` paragraph beside `provideLcIcons`), icon stories „All 156 constants“, `icons/index.ts` comment.
- **Kit glyph registration:** `ICON_MINUS` in number-input, gallery, document-viewer, kanban-board (`kit-icons.spec` static scan requires it once `minus` is hand-picked).
- **Compatibility lines:** `minus` is inline now (apps' own `minus` draws the heroicon stroke; under `unregistered: 'placeholder'` register `ICON_MINUS`); the checkbox's new `(click)` listener adds `click:` to its prerendered `jsaction` under event replay.
- **Baselines** (3.41.0 build, 360/1280 L/D, measure `'(await new Promise(r => setTimeout(r, 800))) || "ok"'`; complete, every story has its 4 shots): `062/baseline` = 258 stories, 1032 shots — `baseline-a.log` 124 (checkbox 8, checkbox-group 8, select 14, chip 17, badge 12 + 29 badge consumers, spinner 5, number-input 11, icon 4, document-viewer 8, gallery 3, kanban 5), `baseline-b.log` 97 (button 29, input 18, email 11, password 12, combobox 17, verification 10), `baseline-radio.log` 12, `baseline-c.log` 25 (added on resume: the other 12 icon stories for AC-12, button-link 13 for the shared button stylesheet). `062/baseline-open` (5 opened listboxes at 360 L, measure = `062/open-measure.js` pasted inline; `hash`/`hashNoComments` per story, AC-10). `062/baseline-geo` (28 checkbox/radio geometry rows, 360 L) is a measurement reference for AC-4/5, not a hash baseline. Expected to differ at rest: all checkbox/checkbox-group/radio shots with an enabled box or help text; chip *clickable*, *clickable-removable*, *wrap*, *emphasis-and-quiet*, *hooks-on-an-ancestor*; number-input (all 11); icon *inline-set*, *icon-constants*; document-viewer and kanban shots that show `minus`. Everything else identical (select 14, badge 41, button 29, button-link 13, input/email/password/combobox/verification 78, spinner 5, gallery 3, the other 12 icon stories; *all-icons* loads the Tabler catalogue over the network, a diff there is timing unless it shows the `minus` tile).
- **Risks:** 045 r1 anchors (§3 C), 020/051 ancestor hooks (badge), dead `var(--lc-badge-bg)` reader (bottom-nav), 024 `hyphens` with `break-word`, 060 inline-host strut (spinner), 037 r1 forced-colour rings (none new), 012 binding order (none: attributes only).
