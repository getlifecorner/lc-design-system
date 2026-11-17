# Build 062: checkbox/chip contrast, select option groups, first USM X gaps

- **Branch:** `feat/3.42-checkbox-select-usmx-gaps` · **Commit:** one `feat(checkbox,select): …` commit (`git log -1`); code = `924479a`, after review r1 = `b3bc8cc`

## Files changed

| Area | Change |
|---|---|
| `checkbox/` (component, group, token), `radio.component.scss` | `readonly` (+ group flag, optional `groupReadonly?`), `(click)` cancel, `aria-readonly`; field border, error-600, disabled-checked fill, readonly look, `--checkbox-size`/`--radio-size` on siblings, lg 44 px always; radio error-600 (D-4) |
| `chip.component.scss` | hover fill reads `--lc-chip-bg` (in/out of hero); clickable sm/md 14 px, lg 16 px |
| `select/` | `visibleGroups()`, grouped branch (flat branch untouched), header + divider, D-6 `revealHighlighted()` |
| `icon.component.ts`, `icon-inline-svgs.ts`, `icons.data.ts`, `icon-inline-index.data.ts`; number-input, gallery, document-viewer, kanban | `LC_ICON_BASE_PATH`; hand-picked `minus`, `ICON_MINUS(_SOLID)` (158); registered where `minus` renders |
| `button/` | `ariaPressed/Expanded/HasPopup/Controls`, `ButtonAriaPressed/HasPopup`; AC-26 comments (+ button(-link) stories) |
| input, email, password, number, combobox, verification-code | `invalid` (D-8) |
| `badge.component.scss`, `bottom-nav.component.scss` | private `--_lc-badge-*`; bottom-nav underlay reads hook, then private |
| `spinner/` | `xs`, host `lc-spinner--inline`, forced-colours arc |
| stories, `docs/bundle-size.mdx` | the 16 stories of design §8, argTypes with defaults |
| new specs | `checkbox.readonly`, `select.groups`, `icon.base-path`, `number-input.minus`, `button.aria-state`, `input.invalid` (6 fields), `badge.hooks`, `spinner.xs` |
| `tools/compat` | `probe-342.ts`, 4 `EXPECT_IN_HTML` rows (AC-24) |
| **r1 F-1:** `checkbox.component.scss`, `radio.component.scss` + `checkbox.readonly.spec`, `radio.component.spec` | `@media (forced-colors: active)` at the file end: check / dot `CanvasText` + `forced-color-adjust: none`, disabled `GrayText`; checkbox repeats the readonly (0,3,0) selector and wins by order (design §6 r1) |

## Acceptance criteria

| AC | Covered by (measured in the stories, `tmp/062/measure.log`) |
|---|---|
| 1–3 | `checkbox.readonly.spec` (click, label, Space, indeterminate kept, FormControl/ngModel unchanged, no output, tabindex 0, disabled wins, group + item, axe, rule pins). Disabled checked: check 3.63 L / 4.84 D (box .75, text .5). Rest border 4.83 L / 7.31 D. Readonly: border vs box 4.63 / 7.02, check 16.98 / 16.6, cursor default |
| 4–5 | *Sizes with Help Text* 360: help/error x 24/26/28/32 = text x; label 23/23/26/**44** |
| 6–7 | `chip.on-band.spec`; clickable md 14 px in a 16 px parent; in *On Hero Bands* 1280 the quiet clickable sm chip 18 → 14 px |
| 8–10 | `select.groups.spec` (16); headers 5.84 L / 6.71 D vs panel fill, no overflow, no highlighted option hidden (360/1280); opened listboxes vs `baseline-open`: default, disabled-options, filled identical incl. comments, searchable "no results" identical without comments (+2 anchors), with-groups changed; `tmp/062/old-new.txt` |
| 11–13 | `icon.base-path.spec`, `number-input.minus.spec` (no request, no warning under `placeholder`), `icons`/`kit-icons` specs, compat |
| 14–15 | `button.aria-state.spec` (16: values, `"false"`, removal, host clean, link variant, toggle, lc-menu trigger keeps its attributes, axe); story play |
| 16–17 | `input.invalid.spec` × 6 (look, `aria-invalid`, no message, describedby unchanged, message once, axe) |
| 18 | `badge.hooks.spec`; all 41 badge stories + consumers identical |
| 19 | `spinner.xs.spec`; host 16 × 16, text line 21 px kept, row 44, slot 40 centred, arc 6.21 L / 11.78 D |
| 20–21 | JSDoc `@default` (manifest extraction checked with a temp tools test, `tmp/062/manifest.txt`); no new built-in text |
| 22 (r1) | specs pin both forced blocks (and order after the readonly rule). `--forced-colors` 360 L/D (`tmp/story-shots/062/r2-fc`, `tmp/062/measure/fc.mjs`): every check/dot editable, readonly, checked, indeterminate = `CanvasText` on Canvas 21:1 L/D; disabled = `GrayText` 14.02 L / 13.98 D (box .75); unchecked stay op 0 |
| 22–26 | screenshots below; full suite; compat; changelog draft; no 3.6x/.85-opacity numbers left in button scss/stories |

**Changed assertions (AC-23):** `checkbox-group.component.spec` AC-8 `.checkbox-lg.checkbox-in-group` → `.checkbox-lg {… min-height: 2.75rem}` (AC-5) · `chip.on-band.spec` 2 hover rules now `var(--lc-chip-bg, …)` (AC-6) · `icons.spec` 156 → 158, Tabler slices +2 (hand-picked glyphs come first) and `icon.trusted-types.spec` 156/157 → 158/159 (AC-13) · `badge-contrast.spec`, `hero.slot-fill.spec` regex `--lc-badge-*` → `--_lc-badge-*` and `bottom-nav.current-badge.spec` gradient `var(--lc-badge-bg, var(--_lc-badge-bg))` (AC-18; else the current-pill underlay vanishes).

## Gates

All gates ran on commit `924479af92cde04a8b49956d251dae2dd4d2074d` (skip while `git diff --quiet 924479a -- libs tools` holds). Build and compat ran on `d32f4b7`, which differs only in `chip.on-band.spec.ts`.

| Gate | Result |
|---|---|
| test | 319 suites, 6581 passed, 8 skipped (2 suites hit a worker SIGSEGV, rerun alone: 67 + 25 passed) |
| lint | 0 errors, 160 warnings (= 3.41) |
| build | 125 entries |
| test:tools | 22 / 22 |
| build-storybook | 1175 stories (+16) |
| Screenshots | baseline compare `tmp/story-shots/062/cmp` + `cmp2`: 1032 shots, 863 identical, 169 different (below). New stories `tmp/story-shots/062/new`: 64 shots, axe 0 violations |
| compat `--only=22` | 120 checks ok (116 + 4), `tmp/062/compat-22.log` |

**Round 1 (F-1) — gates on `b3bc8cc5815eecd8bc86ff43b7aa1358d20a8be6`** (skip while `git diff --quiet b3bc8cc -- libs tools` holds): test 319 suites, 6583 passed (+2), 8 skipped (3 suites hit the worker SIGSEGV, rerun alone: 14 + 4 + 27 passed; `tmp/062/r1-test.log`) · lint 0 errors / 160 warnings · build 125 entries · build-storybook 1175 stories · shots `tmp/story-shots/062/r2-fc` (`--forced-colors`, 5 stories × 360 L/D) and at rest `r2-rest-a|b|c`: 10 shots byte-identical to r0 `cmp`/`cmp2`/`new` · test:tools not rerun (`tools/` unchanged since 924479a) · compat not rerun: no template or markup change, the CSS sits inside `forced-colors` (CI runs 21 + 22 on `main`).

**Differing shots:** as design §9 expects: checkbox 7 + checkbox-group 8 stories (group error: dark only), radio 4 + radio-group with-help-and-error (dark), chip clickable, clickable-removable, wrap, emphasis-and-quiet, hooks-on-an-ancestor, number-input 11, icon inline-set and icon-constants (1280: grid after the new tiles), document-viewer touch-targets, kanban default + with-wip-overflow (`minus`). Not listed in §9: chip *On Hero Bands* / *On Light Hero* 1280 (AC-7, one chip per band). Noise: sidenav *Themed Rail Badges* (Δ ≤ 36 on ≤ 5 px, flips between runs), verification *Custom Hint* 360 and select *Focus After Tap* 360 L (1 px Δ5 at the focused control's corner).

## Deviations from the design (for the designer)

1. **ICON_MINUS by the generator's transform, not by its run:** `npm run generate:icon-names` needs approval in this session. Source `icon-inline-svgs.ts` + the 3 generated places written exactly as the script writes them; the drift specs (`icons.spec`: markup, order, key index, line format) pass; `ICON_NAMES`/`icon-names.json` unchanged (`minus` was a Tabler name). **r1 (F-2): refused again** (`npm run generate:icon-names` and `node scripts/generate-icon-names.mjs` both "requires approval"; not worked around, the script writes files at load). **Release-manager:** run `npm run generate:icon-names`, then `git diff --exit-code -- libs/angular-ui-kit/src` (its outputs: `icon-inline-tabler.data.ts`, `icons.data.ts`, `icon-inline-index.data.ts`, `icon-names.data.ts`, `assets/icon-names.json`) before tagging; a diff goes back to web-developer.
2. **Long select header 3 lines at 360 (66 px), not 2 (48):** Chromium breaks at the space first, then hyphenates („KUNDEN MIT / LEISTUNGSVERRECHNUNGSVEREINBA- / RUNG“). No overflow; 1 line at 1280.
3. **Story layouts:** *Read-only and Disabled (DE)* = three horizontal `lc-checkbox-group`s (legend = row, labels aus/an/teilweise): three columns of full labels don't fit 328 px. Added strings: „Projektrollen“ (second group), panel „Sichtbare Spalten“ with Name/Status/Geändert. `lc-menu` opens only through `isOpen`, so the story binds it; the trigger carries none of the new inputs.
4. D-6 scrolling also applies to flat lists (no DOM change). Open-select stories keep axe's pre-existing `aria-valid-attr-value` *incomplete* (same on *Panel Language*).

## Changelog draft

See the commit body; consumer text for `CHANGELOG.md` 3.42.0:

- **Added:** `lc-select` option-group headers (services-prove row 1): one `role="group"` per group named by its header (12 px uppercase, 5.84:1 L / 6.71:1 D), divider between groups, hidden while a search has no hit in it; arrow keys skip headers and the highlighted option scrolls into view (also in flat lists). `lc-checkbox` / `lc-checkbox-group` `readonly` (usm-x 10): full contrast (check 16.98:1 / 16.6:1), focusable, `aria-readonly`, click and Space change nothing. `LC_ICON_BASE_PATH` (`@lifecorner/angular-ui-kit/icon`, default `/tabler-icons`, trailing `/` ignored, relative values follow `<base href>`; usm-x 1). `ICON_MINUS`, `ICON_MINUS_SOLID` (158 glyphs; usm-x 2). `lc-button` `ariaPressed`, `ariaExpanded`, `ariaHasPopup`, `ariaControls` on the inner `<button>` (usm-x 3). `invalid` on lc-input, -email-input, -password-input, -number-input, -combobox, -verification-code-input (usm-x 9). `lc-spinner` `size="xs"`: 16 px, inline, no padding (usm-x 5).
- **Changed:** disabled checked/indeterminate `lc-checkbox` keeps its fill, check 3.63:1 L / 4.84:1 D (was 1.02:1; 061-s1). Checkbox box border `--color-field-border` 4.83:1 L / 7.31:1 D on the page (was 2.54:1 L), error border `--color-error-600` in dark (was 1.71–2.24:1; 061-s3), same error colour on `lc-radio`. Help/error text of checkbox and radio starts under the label text; a standalone `lg` checkbox row is 44 px (061-n1/n2). `lc-chip`: hover keeps `--lc-chip-bg` (061-s2: was 1.05–1.11:1 with a custom ink in `lc-hero`); clickable sm/md chips are 14 px, not the parent's size (060-n4). `--lc-badge-bg/-fg/-border` win from the host, an ancestor or `:root` (usm-x 15). `lc-number-input`, gallery, document-viewer and kanban draw `minus` inline (stroke 1.5, no request). Spinner arc visible in forced colours.
- **Fixed:** in forced colours (Windows contrast themes) the `lc-checkbox` check and the `lc-radio` dot are `CanvasText` (21:1 on the box), `GrayText` when disabled (14:1), read-only included; before, a checked or indeterminate checkbox read as unchecked on a light contrast theme and a checked radio on every contrast theme (062 review F-1, since 3.x).
- **Compatibility:** no API breaks; `CheckboxGroupContext.groupReadonly` is optional. `minus` is now an inline name: under `unregistered: 'placeholder'` register `ICON_MINUS` (it was fetched before). CSS that read `--lc-badge-bg` from a badge to reuse its variant fill now gets it only when set. The checkbox's `click` listener adds `click:` to its `jsaction` under event replay. Defaults otherwise render as in 3.41 (863 of 1032 screenshots identical; the rest are the changes above).
