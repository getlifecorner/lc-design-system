# Build 061: lc-checkbox-group (new), lc-chip story contrast

- **Branch:** `feat/3.41-checkbox-group-chip-story-contrast` (from `main` 39173f2)
- **Commit:** one commit `feat(checkbox,chip): request 061` (amended; gates on `636aef3`, same `libs`/`tools` tree)

## Files changed

| File | Change |
|---|---|
| `checkbox/checkbox-group.component.{ts,html,scss}` (new), `checkbox-group.token.ts` (new), `checkbox/index.ts` | §2–§4: fieldset/legend, help, options, one error; `CHECKBOX_GROUP` context; CVA `string[]`; SCSS = radio-group values, error below the options |
| `checkbox/checkbox.component.{ts,html,scss}` | `value` input; optional group injection: `isDisabled` + group, `isInvalid` (aria-invalid, `checkbox-error`), effective size (bound `size` wins via `ngOnChanges`), `checkbox-in-group`, value effect, `toggle`/`touch`; `.checkbox-lg.checkbox-in-group { min-height: 2.75rem }`; JSDoc + `@default` on every input |
| `checkbox/checkbox-group.component.spec.ts` (new, 23) | AC-1…11, 15 (incl. axe, names, a byte pin of the standalone DOM) |
| `i18n-labels.spec.ts` (+1) | `requiredAriaLabel` "Pflichtfeld" reaches the group name |
| `checkbox/checkbox-group.stories.ts` (new, 8), `checkbox.stories.ts` | §8 stories; *Checkbox Group* (id kept) renders an `lc-checkbox-group`; argType `value` |
| `chip/chip.stories.ts` | *Hooks on an Ancestor*: C1 values on both wrappers, story text (§5, §8) |
| `tools/compat/template/…/home.{ts,html}`, `check-angular-majors.mjs` | group "Rollen" with 2 checkboxes, 1 `EXPECT_IN_HTML` check |
| `README.md`, `libs/angular-ui-kit/README.md`, `internationalization.mdx` | `checkbox-group` listed, "New in 3.41"; `requiredAriaLabel` row |

No existing assertion changed. Default DOM: a temp spec rendered `lc-checkbox` with the `main` template and the branch template for 7 input sets: 7/7 identical (`tmp/061/old-new.txt`).

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1 | spec: one `fieldset`, legend "Rollen", 3 checkboxes, axe name "Rollen"; play *Default* `getByRole('group', { name: 'Rollen' })` |
| 2 | spec: `--hidden` class, name kept; *Hidden Legend* 360: legend 1×1, help y16 |
| 3 | spec: help once, right after the legend, `aria-describedby` = help id; 360: help y45 |
| 4 | spec: 1 `.lc-checkbox-group__error[role=alert]` after the options, 0 child messages, 3× `aria-invalid`, ids help + error; *With Error*: invalid 3, gap 8 |
| 5 | spec: child help (id `<id>-help`, described) and child error message inside a group; standalone help unchanged |
| 6 | spec: `*` `aria-hidden`, hidden text, name "Rollen Pflichtfeld", off with `requiredIndicator=false`; no child `required`/`aria-required`/`.checkbox-required`; own `required` keeps its `*`; play *Required* |
| 7 | spec: fieldset `disabled`, inputs disabled + tabindex −1, `.checkbox-disabled`; *Disabled* opacity 0.5 |
| 8 | spec: group `lg` → `checkbox-lg` + `checkbox-in-group`, bound `md` wins, SCSS pin; *Phone (lg)* 360: rows y73/125/177 × 44, box 24 at +10, text x48 |
| 9 | *Horizontal*: 360 CFO on row 2 (y108), 1024/1280 one row x16/172.52/303.58; overflow 0 at 320/360/1024/1280 |
| 10 | spec: tabindex 0 ×3, focus, click toggles; ring 2 px `--color-primary-500` offset 2: 4.37 L / 9.95 D |
| 11 | spec (8): `[(value)]` follows/writes in DOM order, `valueChange`, group wins over `[checked]`; FormControl write, toggle, `Validators.required` on `[]`, unknown values kept, value-less box outside the value, disable/enable, touched on blur; play *Form Control* "Wert: administration, controlling" |
| 12 | 8 stories 320/360/1024/1280 L/D, DE (`lang="de"`), overflow 0 everywhere |
| 13 | legend 17.74 L / 17.29 D, help 7.56 / 12.17, `*` and error 12.59 / 9.48; `--forced-colors` *With Error* 360: legend and error 21:1 (CanvasText) |
| 14 | compat `checkbox group legend` (see Gates) |
| 15 | baseline `--compare`: **96/96 identical**; default-DOM proof 7/7; byte pin in the group spec; checkbox spec unchanged |
| 16 | `--axe` on 10 stories × 3 widths × 2 themes: **0 violations** in 60 shots (incomplete only `bypass`, chip `color-contrast`); no `aria-prohibited-attr` (also asserted in the spec) |
| 17 | JSDoc + `@default` on all group and checkbox inputs, class example; argTypes with defaults; READMEs; manifest: 11 group props, 14 checkbox props with defaults (`tmp/061/manifest.txt`); `test:tools` 22 |
| 18 | measure at 360/1024/1280 L/D: all 6 chips **10.16 L / 10.64 D** (fill `rgb(255,255,255)` L, `rgb(16,28,38)` D); story text as §8 |
| 19 | `git diff main -- libs/angular-ui-kit/src/lib/chip/chip.component.* 'libs/angular-ui-kit/src/lib/chip/*.spec.ts'` empty |

## Gates

All gates ran on commit `636aef3f19413d8449cefc193ebb35bf2173e2a2` (later agents skip a gate while `git diff --quiet 636aef3 -- libs tools` holds). Node 24.21.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 311 suites, 6486 passed, 8 skipped (+1 suite, +24 tests). `chip.wrap.spec` hit the known worker SIGSEGV in the full run and passed alone (17/17) |
| `npx nx run angular-ui-kit:lint` | 0 errors / 160 warnings (unchanged) |
| `npx nx run angular-ui-kit:build` | 125 entries built |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | built (`--skip-nx-cache`) |
| Story screenshots | `tmp/story-shots/061-build/new/` (360/1024/1280 L/D, axe), `w320/`, `forced/`, `focus/`; compare `compare.log` 96/96 |
| `node tools/compat/check-angular-majors.mjs --only=22` | PASS Angular 22.2.6: 116 checks ok (+1 `checkbox group legend`), `tmp/061/compat-22.log` |

## Deviations from the design

1. **md rows are 27 px, not 26:** the `lc-checkbox` host (block, unchanged) puts its 26 px inline-flex label on a 27 px line box, alone and in a group. So md rows are y73/108/143, the error y178 at 360 (§3: 175) and the horizontal row 2 +35 (§3: +34). `lg` rows match §3 exactly (44, the label fills the line). Not changed: it would change the standalone checkbox (AC-15, no look change). Designer to confirm.
2. **Group wins over `[checked]`:** the child's value effect also reads `checked`, so a later `[checked]` binding on a child with a `value` is reset to the group value (§2 states the outcome).
3. **Value of a checkbox the group can't see:** a checkbox inside another component's template injects the group but is not in its `contentChildren`; its value is added at the end instead of being dropped ("kept, never dropped").

## Changelog draft

### Added

- **`lc-checkbox-group`** (`@lifecorner/angular-ui-kit/checkbox`; finance-intelligence benutzer-2026-11-12 row 1, forms „Benutzer anlegen“ and „Rollen ändern“): a multiple choice as a native `<fieldset>` named by its `<legend>` (`legend`, `legendHidden`), `helpText` below the legend and one `error` below the checkboxes: shown and announced once (`role="alert"`), linked by `aria-describedby`, every checkbox `aria-invalid` with the error border and no message of its own. `required` puts `*` after the legend and adds `requiredAriaLabel` (default `required`) to the group's name, e.g. „Rollen Pflichtfeld“; the checkboxes stay optional, so validate the value (`Validators.required`) and set `error`. `disabled` disables the fieldset and every checkbox, `orientation` `vertical` | `horizontal` (wraps), `size` for every checkbox (a `size` bound on a checkbox wins); in a group `lg` rows are 44 px touch targets, 8 px apart. `[(value)]` or a form control on the group holds the `value`s of the checked checkboxes as `string[]`, in the order of the checkboxes; written values that match no checkbox are kept. Same spacing and type as `lc-radio-group`. Legend 17.74:1 (light) / 17.29:1 (dark), help 7.56 / 12.17, error and `*` 12.59 / 9.48; no overflow at 320 px.
- **`lc-checkbox` `value`**: the value a checkbox adds to its `lc-checkbox-group`'s value while checked; no effect without a group.

### Changed

- **`lc-checkbox` in an `lc-checkbox-group`** takes the group's size, disabled and invalid state. Outside a group nothing changes: same DOM, 96 of 96 checkbox and chip screenshots identical.
- **Docs, chip story „Hooks on an Ancestor“** (060-s1): an opaque pair (`--color-surface` fill, `--color-on-info-subtle` ink, `--color-info-default` border) gives chip text 10.16:1 (light) and 10.64:1 (dark), off a hero band and on it (before: 4.01:1 in dark). Theme tokens in an ancestor hook resolve in the page theme, also inside `lc-hero`: pick an opaque fill.

### Compatibility

No API breaks: one new component, one new optional input. Peer range and dependencies unchanged.
