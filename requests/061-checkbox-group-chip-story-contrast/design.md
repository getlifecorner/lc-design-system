# Design 061: lc-checkbox-group (new), lc-chip story contrast

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-19
- **Measured on:** Storybook build of `main` 39173f2 (3.40.0); logs in `tmp/story-shots/061/`

## 1. Approach

- **Item B, new `lc-checkbox-group`** in `lib/checkbox/` (entry `@lifecorner/angular-ui-kit/checkbox`, no new stub), a copy of the `lc-radio-group` pattern: native `<fieldset>`/`<legend>`, group help and one group error tied by `aria-describedby`, a DI context `CHECKBOX_GROUP` that `lc-checkbox` injects optionally (as `lc-radio` injects `RADIO_GROUP`), CVA on the group. Same SCSS values as `radio-group.component.scss`, so the two groups look the same in one form.
- **Array value (AC-11) is built:** cheap (one optional `value` input on `lc-checkbox`), and the requester binds roles as a form value.
- **Deliberate differences from `lc-radio-group`** (each forced by checkbox semantics or the AC):
  1. **`required` stays on the group, not on the boxes.** Native `required` on every checkbox means "every box must be checked" (the browser blocks a native submit until all three roles are ticked), and `aria-required` per box says the same; `aria-required` is not allowed on `role=group`. So the group's `required` gives the legend marker and the group's name ("Rollen Pflichtfeld"); children get no `required`/`aria-required` from it. AC-6's "children are required" is met as "the group is required"; the "no asterisk per child" part holds. A child's own `required` (e.g. "AGB akzeptieren") keeps working as before, with its own `*`.
  2. **Error below the options** (AC-4 "below the group"), as `lc-input`/`lc-checkbox` place errors; the help text stays below the legend, as in `lc-radio-group`.
  3. **Required marker markup:** `*` with `aria-hidden="true"` plus a visually hidden text span, instead of `aria-label` on a bare `<span>` (in radio-group axe reports `aria-prohibited-attr` as incomplete, measured `probe-radio-axe.log`).
  4. **`size`** (radio-group has none): the group passes it on; a `size` bound on a child wins.
- **44 px for `lg` only inside a group:** standalone `lc-checkbox lg` rows are 29 px today and stay so (AC-15, no look change; `lc-radio lg` got 44 px in 3.3 → backlog B-2).
- **Item A:** only the values and text of `HooksOnAnAncestor` change: an opaque pair (measured C1 in `chip-proto.log`).
- **Existing story `form-checkbox--checkbox-group`:** id kept; its render becomes an `lc-checkbox-group` (legend "Notification preferences", same four boxes with help text): the EN surface of the group and of child help text inside a group (AC-5). Its shot changes on purpose (not in the baseline).

## 2. Public API

`CheckboxGroupComponent`, selector `lc-checkbox-group`, standalone, OnPush. Providers: `CHECKBOX_GROUP` and `NG_VALUE_ACCESSOR` (useExisting). Class JSDoc with the example of §8 *Default*.

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | `legend` | `string` | `''` | The group's question, rendered as the `<legend>` (its accessible name). |
| input | `legendHidden` | `boolean` | `false` | Hide the legend visually; screen readers still read it. |
| input | `helpText` | `string` | `''` | Help for the whole group, below the legend; describes the group. |
| input | `error` | `string` | `''` | One error for the whole group, below the checkboxes: shown and announced once, describes the group and marks every checkbox invalid. |
| input | `required` | `boolean` | `false` | The group needs an answer: `*` after the legend, and the group's name ends in `requiredAriaLabel`. The checkboxes stay optional (a required checkbox must be checked); validate the value (e.g. `Validators.required`) and set `error`. |
| input | `requiredIndicator` | `boolean` | `true` | Show the `*` marker (and its spoken label) after the legend of a required group. |
| input | `requiredAriaLabel` | `string` | `'required'` | Spoken label of the `*` marker. |
| input | `disabled` | `boolean` | `false` | Disables the fieldset and every checkbox in it. |
| input | `orientation` | `CheckboxGroupOrientation` | `'vertical'` | `vertical` stacks the checkboxes; `horizontal` puts them in a row that wraps. |
| input | `size` | `CheckboxSize` | `'md'` | Size of every checkbox in the group; a `size` bound on a checkbox wins. `lg` rows are 44 px touch targets. |
| model | `value` | `string[]` | `[]` | The `value`s of the checked checkboxes, in the order of the checkboxes (two-way bindable, or a form control on the group). Checkboxes without a `value` are not part of it. |
| output | `valueChange` | `string[]` | — | From the model: on every toggle and every form write. |
| input (lc-checkbox, new) | `value` | `string` | `''` | The value this checkbox adds to its `lc-checkbox-group`'s `value` while checked. Without a group it has no effect. |
| type | `CheckboxGroupOrientation` | `'vertical' \| 'horizontal'` | — | Exported from `checkbox-group.component.ts`. |
| type | `CheckboxGroupContext`, `CHECKBOX_GROUP` | interface, `InjectionToken` | — | `checkbox-group.token.ts`, exported like `radio-group.token.ts`: `groupSize`, `groupDisabled`, `groupInvalid: Signal<boolean>`, `selectedValues: Signal<readonly string[]>`, `toggle(value, checked)`, `touch()`. |
| CSS hook | — | — | — | None, like `lc-radio-group`. |

**`lc-checkbox` internals (no public change but `value`):** `group = inject(CHECKBOX_GROUP, { optional: true })`; `isDisabled` adds `group.groupDisabled()`; `isInvalid = error() || group.groupInvalid()` drives `aria-invalid` and `checkbox-error`; own message/help ids stay keyed on the own `error()` (AC-5). Effective size = `size()` if the input was ever bound (record it in `ngOnChanges`, which signal inputs trigger), else `group.groupSize()`, else `size()`. Class `checkbox-in-group` when a group exists; SCSS `.checkbox-lg.checkbox-in-group { min-height: 2.75rem }` (same value as `.radio-lg`). With a group and a non-empty `value`: an effect sets `checked` from `selectedValues().includes(value)` (`untracked` set); `handleChange` calls `group.toggle(value, checked)` after its own `onChange`; `handleBlur` calls `group.touch()`. Add JSDoc with `@default` to every existing checkbox input (docs only); `size`/`error`/`disabled` mention the group.

**Group value:** `toggle` builds the next array from `contentChildren(CheckboxComponent, { descendants: true })` in DOM order (each child with a value: checked ones), then appends written values that match no child (kept, never dropped), de-duplicated; `value.set(next)`, `onChange(next)`. `writeValue(v)` = `Array.isArray(v) ? [...v] : []`; `setDisabledState` → `groupDisabled`. A disabled child can't toggle but still shows the value. Inside a group with a value, set the selection on the group (the group wins over a child's `[checked]`).

Default rendering unchanged: without a group `group` is `null`, so `isInvalid = error()`, size = `size()`, no new class, `value` is not rendered; proof = `--compare` of 96 baseline shots (§9).

## 3. Anatomy and layout

DOM: `fieldset.lc-checkbox-group[aria-describedby][disabled]` > `legend` (text, space, `span.__required[aria-hidden]` `*`, `span.__required-text` visually hidden) > `p.__help#…-help` > `div.__options.__options--{orientation}` (`<ng-content />`) > `p.__error#…-error[role=alert]`. Values measured on `lc-radio-group` (same CSS) and `lc-checkbox` rows (`probe-radio.log`, `probe-cb.log`).

### 360 px (canvas 16, column 328; 320: 288)

```
x16                                   x344     md (Default)        lg (Phone Large)
┌ fieldset, border 0, padding 0, min-width 0 ┐ y16
│ Rollen *                                   │ legend 14/500/21     y16–37
│   8                                        │
│ Mehrere Rollen sind möglich.               │ help 14/400/20       y45–65
│   8                                        │
│ [ ] Administration                         │ row md 26 / lg 44    y73–99   | y73–117
│   8                                        │ box md 20 / lg 24 at row top +3 / +10
│ [x] Controlling                            │                      y107–133 | y125–169
│   8                                        │ label text x44 (md) / x48 (lg)
│ [ ] CFO                                    │                      y141–167 | y177–221
│   8                                        │
│ Wählen Sie mindestens eine Rolle.          │ error 14/400/20      y175–195 | y229–249
└────────────────────────────────────────────┘
Horizontal md 360/320: row 1 Administration 132.52 + 24 + Controlling 107.06 = 263.58; CFO on row 2 (+34)
Horizontal lg 360: 147.73 + 24 + 119.47 = 291.2, CFO row 2 · 320: Administration / Controlling + CFO (211.14)
```

### From 1024 px (1280: column 1248)

```
┌ fieldset 1248 ──────────────────────────────────────────────┐
│ Rollen *                                                    │  same vertical rhythm as 360
│ Mehrere Rollen sind möglich.                                │
│ [ ] Administration  [x] Controlling  [ ] CFO                │  horizontal md: one row, 347.6 wide
│ Wählen Sie mindestens eine Rolle.                           │  (x16 / 172.52 / 303.58)
└─────────────────────────────────────────────────────────────┘
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| fieldset | margin 0, padding 0, border 0, `min-width: 0` | — | — |
| legend | `display: block`, padding 0, margin-bottom 8 | 14/500, line-height 21 | `--font-size-sm`, `--font-weight-medium`, `--line-height-normal`, `--spacing-2` |
| `*` | margin-left 2 after one space | inherits | `--spacing-0-5`, `--color-text-error` |
| required text, hidden legend | clip pattern of `.lc-radio-group__legend--hidden` | — | — |
| help | margin 0 0 8 | 14/400/20 | `--font-size-sm`, line-height `1.25rem`, `--spacing-2` |
| options vertical | flex column, gap 8 | — | `--lc-density-gap-sm` |
| options horizontal | flex row wrap, column-gap 24, row-gap 8 | — | `--lc-density-gap-lg`, `--lc-density-gap-sm` |
| error | margin 8 0 0 | 14/400/20 | as help |
| child rows | md 26, lg 44 in a group (29 alone), sm 23 | md 16, lg 18 | unchanged `lc-checkbox` |

## 4. States

| State | Behaviour |
|---|---|
| default / hover / active / focus-visible | each checkbox's own (hover box primary-400/600; ring 2 px `--color-primary-500`, offset 2, round the box; 44 px row leaves room) |
| checked | from the group value for children with `value`, else own |
| disabled | fieldset `disabled`; every child `isDisabled` → opacity .5, `not-allowed`, native disabled, out of the Tab order; legend, help and error keep full colour |
| error | one `p[role=alert]` after the options; every child `aria-invalid="true"` + error border; no child message; child help stays |
| empty | no legend text: the group has no name — document "always set `legend`, hide it with `legendHidden`" |
| loading | none |
| overflow | legend/help/error wrap (block `<p>`, no `nowrap`); fieldset `min-width: 0` stops the UA `min-content` overflow; long labels wrap inside the row (existing `lc-checkbox`); "Kostenstellenverantwortliche" lg = 263.5 fits 288 (320). An unbreakable word wider than the column overflows as in `lc-checkbox` today (not changed) |
| many items | vertical list; horizontal wraps by row-gap 8 |

**Pre-existing, out of scope (the review carries them as findings):**
- **D-1 (should-fix, queue):** `lc-chip` quiet clickable in `lc-hero` with ancestor hooks: hover fill = `--_lc-hero-glass` ignores `--lc-chip-bg` while the ink keeps `--lc-chip-fg`: hover text 1.05–1.11 light (every candidate, `chip-proto.log` "QH"); dark 6.58+. Component fix, excluded here by AC-19.
- **D-2 (should-fix, queue):** `lc-checkbox` box boundary: rest `--color-neutral-400` vs white **2.54** (sunken 2.31), error `--color-error` vs dark page **2.24** (surface 2.06, raised 1.71) < 3:1 (1.4.11). `lc-radio` uses `--color-field-border` (4.39+ L). Excluded here by "no look change".

## 5. Theming

Measured on the page (`grid.log`, `probe-radio.log`); light `surface` = page.

| Element | Token | Light (page / sunken) | Dark (page / surface / raised) |
|---|---|---|---|
| legend | `--color-text-primary` | 17.74 / 16.12 | 17.29 / 15.85 / 13.16 |
| help | `--color-text-secondary` | 7.56 / 6.87 | 12.17 / 11.16 / 9.26 |
| `*`, error | `--color-text-error` | 12.59 / 11.44 | 9.48 / 8.69 / 7.21 |
| focus ring | `--color-primary-500` | 4.37 / 3.97 | 9.95 / 9.13 / 7.58 |
| child box, error border | unchanged (D-2) | 2.54 rest, 8.39 error | 3.89 rest, 2.24 error |

No new tokens. **Chip story (item A), C1:** `--lc-chip-bg: var(--color-surface)`, `--lc-chip-fg: var(--color-on-info-subtle)`, `--lc-chip-border: var(--color-info-default)`, `--lc-chip-gap: 0.5rem` on both wrappers. Text of all six chips **10.16 light / 10.64 dark** (opaque fill, so the band can't change it; before 4.01/4.71/4.85 dark). Boundary: light fill vs band 8.04–11.71, dark border vs band 4.95–7.22, off-band border 6.17 L / 11.61 D.

## 6. Accessibility

- **Semantics:** `fieldset` = `role=group`, named by the legend ("Rollen Pflichtfeld" when required); `aria-describedby` = help id, then error id (only rendered ones). Children: native checkboxes, unchanged.
- **Error:** `role="alert"` inserted with its text → announced once; changing the text re-announces; the group's description repeats it on entry; no per-checkbox message.
- **Keyboard:** Tab visits each enabled checkbox in DOM order, Space toggles, no roving tabindex, no trap; disabled group = no stop.
- **Targets:** `lg` rows 44 px (label = target, e.g. Administration 147.73 × 44), rows 8 apart; `md` 26-px rows with 8 gap meet 2.5.8 by spacing.
- **forced-colors:** no backgrounds of its own; legend/help/error become `CanvasText`, the error stays readable as text; child boxes as today.
- **Reduced motion:** the group adds no motion.

## 7. Texts

| Input | EN default | DE (stories) |
|---|---|---|
| `requiredAriaLabel` | `required` | `Pflichtfeld` |
| `legend` | — | `Rollen` |
| `helpText` | — | `Mehrere Rollen sind möglich.` |
| `error` | — | `Wählen Sie mindestens eine Rolle.` (≈ 220 px at 14 px, one line at 320) |
| child labels / values | — | Administration `administration`, Controlling `controlling`, CFO `cfo` |

## 8. Stories

New file `checkbox-group.stories.ts`, `title: 'Form/Checkbox Group'`, `component: CheckboxGroupComponent`, imports `CheckboxComponent`; component docs as radio-group (pattern, example, touch-target note, "required stays on the group"). Meta `args`: legend `Rollen`, legendHidden `false`, helpText `Mehrere Rollen sind möglich.`, error `''`, required `false`, requiredIndicator `true`, requiredAriaLabel `Pflichtfeld`, disabled `false`, orientation `vertical`, size `md`, value `['controlling']`; every argType with `description` + `table.defaultValue` (§2 defaults). Meta `render` binds **all** args on `<lc-checkbox-group lang="de" … [(value)]="value">` with the three children of §7 (no child `size`).

| Story (export) | Expected ID | Args | Shows |
|---|---|---|---|
| Default | `form-checkbox-group--default` | meta | md at 1280, DE; play: `getByRole('group', { name: 'Rollen' })` holds 3 checkboxes |
| WithError | `form-checkbox-group--with-error` | required, error DE, value `[]` | one message below, 3× `aria-invalid` |
| Required | `form-checkbox-group--required` | required | legend `*`, name "Rollen Pflichtfeld" |
| Disabled | `form-checkbox-group--disabled` | disabled, value `['administration']` | disabled look |
| Horizontal | `form-checkbox-group--horizontal` | orientation `horizontal` | wrap at 360, one row at 1280 |
| PhoneLarge (name "Phone (lg)") | `form-checkbox-group--phone-large` | size `lg`, required | 44 px rows at 360 |
| HiddenLegend | `form-checkbox-group--hidden-legend` | legendHidden | help at the top, name kept |
| FormControl | `form-checkbox-group--form-control` | own render: `FormControl<string[]>(['controlling'], Validators.required)` on the group, `[error]` from `touched && invalid`, `<p>` "Wert: {{ value.join(', ') }}"; hide meta controls | CVA; play: click Administration → text `administration, controlling` (DOM order) |
| (Form/Checkbox) CheckboxGroup | `form-checkbox--checkbox-group` | id kept, render = group "Notification preferences" + 4 boxes with help, EN | EN, child help in a group |
| (Data Display/Chip) HooksOnAnAncestor | `data-display-chip--hooks-on-an-ancestor` | C1 values (§5) on both wrappers | text says: theme tokens in an ancestor hook resolve in the page theme, also in `lc-hero`; pick an opaque pair (10.16 / 10.64); a translucent fill like `--color-info-subtle` let the band through (4.01 dark) |

`lc-checkbox` meta: add argType `value` (description, default `''`). Compat app: one `<lc-checkbox-group legend="Rollen" [(value)]="roles">` with two children in `tools/compat/template/src/app/home.html`, and `['checkbox group legend', /<fieldset[^>]*class="lc-checkbox-group"[^]*?<legend[^>]*>\s*Rollen/]` in `EXPECT_IN_HTML`. READMEs: a line for `lc-checkbox-group`. `i18n-labels.spec.ts`: `requiredAriaLabel` "Pflichtfeld" reaches the group's name.

## 9. Verification

Review shots: new stories at 320 (overflow only), 360, 1024, 1280, L/D, `--axe`. Unchanged: `--stories=<the 24 ids in baseline.log> --widths=360,1280 --themes=light,dark --measure='new Promise(r => setTimeout(r, 800)).then(() => 1)' --compare=tmp/story-shots/061/baseline` → 96/96 identical (baseline stable twice, `baseline-check.log`).

| AC | How | Expected value |
|---|---|---|
| 1 | unit: one `fieldset`, legend text; axe; AX name (dom-accessibility-api) | name `Rollen` |
| 2 | unit + *Hidden Legend*: legend clipped 1×1, name kept | help top y16 at 360 |
| 3 | unit: help once, id in `aria-describedby` | description starts with the help |
| 4 | unit: 1 node `.lc-checkbox-group__error[role=alert]`, 0 `.checkbox-error-message`, 3× `aria-invalid="true"`, error id in `aria-describedby`; *With Error* 360 | error y = options end + 8 (175 at 360) |
| 5 | unit: child `errorMessage`/`helpText` alone and in a group, ids unchanged | existing assertions pass |
| 6 | unit: `*` `aria-hidden`, hidden text = `requiredAriaLabel`, none when `requiredIndicator=false`; no child `required`/`aria-required`/`.checkbox-required` from the group; child's own `required` keeps its `*` | name "Rollen Pflichtfeld" (story) |
| 7 | unit: fieldset `disabled`, every input `disabled`, `.checkbox-disabled` | opacity .5 |
| 8 | unit: group `lg` → children `checkbox-lg`; child bound `md` stays `md`; *Phone (lg)* 360 measured | rows 44, y 73/125/177, box 24 at +10 |
| 9 | *Horizontal* 360/320/1280 measured, `scrollWidth` | 360: CFO on row 2 (+34); 1280: one row 347.6; overflow 0 |
| 10 | unit: Tab order, Space toggles; ring at 360 | ring 4.37 L / 9.95 D |
| 11 | unit: `[(value)]`, `FormControl` (write, toggle emits ordered array, disabled, touched on blur, unknown written values kept); *Form Control* play | `administration, controlling` |
| 12 | stories §8 at 320/360/1280 L/D | DE strings, no overflow |
| 13 | `--measure` contrast on legend/help/error; `--forced-colors` *With Error* 360 | ≥ §5 values; text visible |
| 14 | compat `EXPECT_IN_HTML` row | prerendered fieldset + legend "Rollen" |
| 15 | existing checkbox specs unchanged; baseline compare | 96/96 identical |
| 16 | `--axe` all new stories, both themes | 0 violations, no `aria-prohibited-attr` |
| 17 | review of JSDoc/argTypes; `npm run test:tools` | group in both READMEs and the manifest |
| 18 | measure (`chip-proto.log` method) at 360/1280 L/D | all 6 chips ≥ 10.16 L / 10.64 D; story text as §8 |
| 19 | `git diff main -- libs/angular-ui-kit/src/lib/chip/chip.component.* chip*.spec.ts` | empty |

**Backlog (release-manager → `BACKLOG.md`):** B-1 `lc-checkbox` help/error `margin-left: calc(var(--checkbox-size) + .5rem)` computes 0 (the var lives on the label; measured help x16 vs text x44). B-2 standalone `lg` row 29 px vs `lc-radio lg` 44. B-3 `lc-radio-group` `*` with `aria-label` on a span (axe incomplete), align with §3 markup. B-4 radio-group shows its error above the options, checkbox-group below.
