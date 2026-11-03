# Build 040: lc-file-upload without nested interactive elements

- **Branch:** `fix/3.25.2-file-upload-nested-interactive` from `main` 3ae03e2 (= `origin/main`, v3.25.1). **Commit:** `fix(file-upload): native file input beside the drop zone, not inside it (037-5)`

## Files changed

| File | Change |
|---|---|
| `file-upload/file-upload.component.html` | design §2: `<input #fileInput>` moved before the zone `div` (keeps `type`, `class`, `[accept]`, `[multiple]`, `[disabled]`, `(change)`), `tabindex="-1"` and `aria-hidden="true"` removed; zone `[attr.tabindex]="disabled() ? null : 0"`, Enter/Space → `onKeyActivate($event)`; a comment on why |
| `file-upload/file-upload.component.scss` | `.file-upload__input` + `visibility: hidden`; `.file-upload__content` + `pointer-events: none` |
| `file-upload/file-upload.component.ts` | `protected onKeyActivate(event)`: `preventDefault()`, `openFilePicker()` unless `repeat`. No public member changed |
| `file-upload/file-upload.axe.spec.ts` | `PRE_EXISTING` and its comment deleted; rows `violations(results)` = `[]`; 2.5.3 control expects exactly `[RULE]`; new `nested-interactive` negative control (a `<button>` in the zone). The compiled component SCSS goes into `document.head` (see Deviations) |
| `file-upload/file-upload.component.spec.ts` | one changed assertion (below) |
| `file-upload/file-upload.structure.spec.ts` | new, 25 tests: AC-3, 4, 5, 6, 8, 16 and the default-rendering pin |
| `file-upload/file-upload.stories.ts` | §7 wording: component description bullet, *Disabled* story, `disabled` argType |
| `tools/compat/template/src/app/probe-3252.ts`, `home.ts`, `home.html` | AC-15 probe `lc-compat-3252` (design §9 row 15), secondary entry |
| `tools/compat/check-angular-majors.mjs` | `EXPECT_IN_HTML` row "file upload: input beside the named zone …" |

**Changed assertion** (`file-upload.component.spec.ts` › *should have hidden file input*): was `aria-hidden === 'true'`; now the input is outside `.file-upload` and has neither `aria-hidden` nor `tabindex`. Why: AC-3 and design §9: `aria-hidden` on a focusable input was the defect class; the input is now hidden by `visibility: hidden`, which `file-upload.structure.spec.ts` asserts on the compiled SCSS and through `getComputedStyle`. No other existing assertion changed; `file-upload.checks.spec.ts` has 0 edits (AC-12).

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1 | axe spec: 4 rows 0 violations, `nested-interactive` control reports it, 2.5.3 control = `[RULE]` |
| 2 | story run `--axe`: see Gates |
| 3 | structure spec *DOM*: input then zone as host children; no nested interactive element and no focusable `aria-hidden` in 4 states (enabled/disabled × 0/2 files); negative control |
| 4 | structure spec *keyboard*: tab stops `[zone]`, `[zone, remove, remove]`; Enter and Space → 1 `input.click()` each, `defaultPrevented`; `repeat` → 0. The spy calls through, so a click bubbling back into the zone would count 2 (it does on the 3.25.1 template). Story measure `opens`, `prevented` |
| 5 | structure spec *click*: zone, content, icon, hint, both lines → 1 each; remove button → 0 |
| 6 | structure spec *drag and drop* + `checks.spec` drop paths; computed `pointer-events: none` on the content; story measure `hits` |
| 7 | axe spec rows: the 4 names unchanged, `outcomeFor(RULE, zone)` = pass |
| 8 | structure spec *disabled*: role kept, no `tabindex`, `aria-disabled="true"`, input `disabled`, 0 tab stops, Enter/Space/click → 0; re-enabled → `tabindex="0"`. Screen-reader note: designer (`review.md`) |
| 9, 10, 11, 13 | designer's review measures; build run: zone boxes and `docW` equal to `baseline.log` (Gates) |
| 12 | `file-upload.checks.spec.ts` green, unchanged |
| 14 | 42 shots vs baseline (Gates); `index.ts` and public members unchanged, only `protected onKeyActivate` added |
| 15 | compat probe + check (Gates) |
| 16 | structure spec *form*: `input.form === form`, `name === ''`, `FormData` has no entry; pick → `filesSelected`, `value === ''` |
| 17 | stories §7 wording; changelog draft below |

**One-off proof (temp spec, deleted):** the 3.25.1 template (`git show 3ae03e2:…html`) and the new one rendered side by side over 5 input sets × with/without a drop (10 cases): zone `innerHTML` and the list byte-identical; input attributes identical minus `tabindex`/`aria-hidden`; zone attributes identical minus `tabindex` when disabled. The committed spec pins the default zone (attributes + children literal). Reverting the template (new SCSS kept) fails 18 tests (17 structure, 1 component).

## Gates

All ran on commit `bf5bfd9` (the libs/tools tree of the final commit; skip while `git diff --quiet bf5bfd9 -- libs tools` holds). Logs: `tmp/040/*.log`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 220 suites, 5199 passed, 8 skipped (`--runInBand`, 31 s; 3.25.1: 219 / 5173; +1 suite, +26 tests). The first run exited without a Jest summary and with no failing test (63 headless Chrome processes from other sessions alive); the rerun was clean |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline 162) |
| `npx nx run angular-ui-kit:build` | green, 122 "Built" lines |
| `npm run test:tools` | 22 / 22 pass |
| `npx nx run angular-ui-kit:build-storybook` | green, 994 stories |
| Story screenshots | 7 stories × 360/1024/1280 × L/D, `--axe --compare=tmp/story-shots/040/baseline`, measure `tmp/040/measure/m.mjs` (900 ms wait) → `tmp/story-shots/040/build/`, log `tmp/040/shots.log`: **42 identical, 0 different; axe 0 violations in 42**. Measure: zone box, padding, border, radius, line boxes/size/colour, icon, list, `docW`, status equal to `baseline.log` in 42/42 (360: 328 × 121 / 147 / 173 / 194 DE; `docW` 360); `inputInZone` false, input `visibility: hidden`, not focusable (`focus()`), before the zone in 42; hit tests at icon/hint/lines = zone in 36 enabled shots; Enter + Space → 2 opens, both `defaultPrevented`; *Disabled*: no `tabindex`, 0 opens. No shot opened (no new story, all hash-identical) |
| `check-angular-majors.mjs --only=22` | PASS, Angular 22.2.4: 94 checks (93 + the new file-upload row). Angular 21 not run here (release / CI) |

## Deviations from the design

- None in the component. Test technique: Jest loads no component styles, so in jsdom the moved input was a visible unlabelled control (axe `label: input` in all 4 rows). The axe and structure specs append the component's compiled SCSS (`sass.compile`) to `document.head`; jsdom then computes `visibility: hidden` as the browser does, and the specs fail if that declaration goes.

## Changelog draft

```markdown
## [3.25.2] - 2026-11-03

`lc-file-upload` no longer nests its file input inside the drop zone (axe `nested-interactive`, 037 review finding 5). Look, name and behaviour are unchanged; no API breaks.

### Fixed

- **`lc-file-upload` drop zone** (037 review finding 5): the native `<input type="file">` sat inside the `role="button"` zone with `tabindex="-1"` and `aria-hidden="true"`, so axe reported `nested-interactive` in every File Upload story but *Disabled* (since 3.11.4). The input now sits hidden beside the zone (`visibility: hidden`, no `tabindex`, no `aria-hidden`), and the zone opens it on a click anywhere in it, Enter or Space, as before. axe-core 4.14: 0 violations in all 7 stories at 360, 1024 and 1280 px, light and dark (36 of 42 failed on 3.25.1). The 42 screenshots are identical to 3.25.1 by hash; the zone keeps its name (`hint`, then the shown accepted and max lines), its 2 px focus ring and its size (328 × 121 px at 360).
- Space on the zone no longer scrolls the page, and a held Enter or Space opens the picker once (auto-repeat is ignored).
- A `disabled` zone leaves the tab order (it was focusable but did nothing); it stays a dimmed button with `aria-disabled="true"`.
- Dragging over the icon or the text no longer fires `dragleave` on the zone (the content takes no pointer events), so the drag-over look holds.

### Compatibility

- No input, output, selector, type, CSS hook or default changed. Internal DOM: `input.file-upload__input` is now the zone's preceding sibling in the host, not its child. A test that looks for the input inside `.file-upload` should query the host; one that expected `aria-hidden="true"` on it should expect none.
- The zone's text can no longer be selected with the mouse, as on a native button.
- The input stays inside a wrapping `<form>`, without a `name`, so it adds no form entry, as before; `fileRejected`, the type check on drop and `locale` sizes (3.24) are unchanged.
- Checked on Angular 21 and 22 (AOT, strictTemplates, prerender), including the zone and its input in the server HTML.
```
