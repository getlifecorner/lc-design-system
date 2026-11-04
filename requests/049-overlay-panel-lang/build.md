# Build 049: Overlay panel language (datepicker, date-range-picker, combobox)

- **Branch:** `fix/3.30.2-overlay-panel-lang`
- **Commit:** see `git log -1` on the branch, `fix(datepicker,combobox,date-range-picker): overlay panels take the host's language (049)`

## Files changed

| File | Change |
|---|---|
| `internal/a11y/content-lang.ts` (+ `.spec.ts`, 6 tests), `internal/a11y/index.ts` | `closestLang(el)` as design §1 (existing internal entry, no new entry) |
| `datepicker/datepicker.component.{ts,html}` | `host` ElementRef, `panelLang` computed, `[attr.lang]` on `.lc-datepicker-calendar` after `aria-label`; `locale` JSDoc sentence (§2) |
| `combobox/combobox.component.{ts,html}` | `panelLang` computed, `[attr.lang]` on `.lc-combobox__dropdown` after `aria-multiselectable`; class JSDoc sentence (§2) |
| `date-range-picker/date-range-picker.component.{ts,html}` | `panelLang` computed (only without a `[lang]` ancestor), `[attr.lang]` on `.lc-drp__dropdown`; `locale` JSDoc sentence plus the missing `@default 'de-DE'` (CLAUDE.md convention) |
| `datepicker/datepicker.stories.ts` | *Panel Language* after *Label (DE)* (§8); *Label (DE)* docs text + "The open panel is marked `lang="de"` (3.30.2)." (§7, docs only) |
| `combobox/combobox.stories.ts` | *Panel Language* after *Clear Targets (DE)* (§8) |
| `{datepicker,combobox,date-range-picker}.panel-lang.spec.ts` | new, 11 + 9 + 7 tests (below) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | `datepicker.panel-lang.spec`: wrapper `lang="de"` → overlay `[role="dialog"]` `lang="de"`; month panel too; `lang="en"` + `locale="de-DE"` → `en` (assumption 1) |
| AC-2 | same spec: no wrapper (asserts no `<html lang>`), `locale="de-DE"` → `de-DE`; a `locale` change while open follows (§4) |
| AC-3 | same spec: no wrapper, no `locale` → no attribute; attributes `aria-label class id role` (as before) |
| AC-4 | `combobox.panel-lang.spec`: focus in `lang="de"` → `role="listbox"` `lang="de"`; none → no attribute, `class id role`; multiple mode keeps `aria-multiselectable`; focus stays on the input |
| AC-5 | `date-range-picker.panel-lang.spec`: in `lang="de"` → `closest('[lang]')` = `de`, no own `lang`; `lang="en"` + `locale="de-DE"` → inherits `en`; no `[lang]` → `de-DE` (default), `en-GB` with `locale="en-GB"` |
| AC-6 | datepicker and combobox specs: open in `de`, close, wrapper → `fr`, open → `fr`; wrapper `lang` removed while closed → `locale` / no attribute. DRP: a wrapper `lang` added while closed → own `lang` dropped |
| AC-7 | full suite green, no existing assertion edited; each spec pins "no `[lang]` in the closed field, no panel at rest" (also after open + close); at-rest compare 124/124 identical (below) |
| AC-8 | `open-measure.js` (P = 0) on this build vs `baseline-open`, `--axe` (below) |
| AC-9 | `lang-measure.js` on both new stories, 360/1280 L/D (`tmp/049/shots-new-measure.log`): field 1 `en, en, en, false`, field 2 `de, de, de, true` in all 8; datepicker panels 342 × 448 (360) / 310 × 395 (1280); combobox 150.31 × 240 (EN, = *Default*) and 135.03 × 240 (DE, content-sized, see Known limits) |
| AC-10 | not run here: closed rendering and `EXPECT_IN_HTML` untouched, the panels exist only while open (never on the server); CI runs the compat matrix |
| AC-11 | changelog draft below |

## Gates

All gates ran on commit `77225f20d85a89c9cb8ea034bbed63ddf754f133` (code; the amend adds only `build.md`, so `git diff --quiet 77225f2 -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 246 suites, 5687 passed, 8 skipped (048: 242 / 5654; +4 suites, +33 tests). `tmp/049/test.log` |
| `npx nx run angular-ui-kit:lint` | 0 errors / 162 warnings (baseline; none new) |
| `npx nx run angular-ui-kit:build` | 122 "Built" lines; `closestLang` in the datepicker, combobox and DRP fesm |
| `npm run test:tools` | tools unchanged |
| `npx nx run angular-ui-kit:build-storybook` | 1057 stories (+2: `form-datepicker--panel-language`, `form-combobox--panel-language`) |
| Story screenshots | see below |
| `node tools/compat/check-angular-majors.mjs` | server rendering unchanged (AC-10) |

Screenshots (measure scripts served from `dist/storybook/angular-ui-kit/zz-049/`):

| Run | Result |
|---|---|
| `tmp/story-shots/049/build` (31 stories at rest × 360/1280 × L/D vs `baseline`, 800 ms) | 124/124 identical (`{"identical":124,"different":0,"missing":0}`), incl. the play-opened *Month*, *Month DE*, *Day Panel*. `tmp/049/shots-rest.log` |
| `tmp/story-shots/049/build-open` (7 opened stories × 4 vs `baseline-open`, `--axe`) | 28/28 identical, axe 0 violations (incomplete as baseline). Measure `[1]` panel `lang`: `de` for *Month DE*, *Label (DE)*, *Starts with a choice*; `en` for datepicker *Default*, *Month*, combobox *Default*; `null` for DRP *Default* (effective `en`, inherited). Attributes `… lang role`, boxes as design §3, focus unchanged. `tmp/049/shots-open.log` |
| `tmp/story-shots/049/build-new` (2 new stories × 4, DE panel open, `--axe`) | 8 shots, axe 0 violations; DE panel `lang="de"`, attributes `aria-label class id lang role` / `class id lang role`, focus `INPUT` (combobox); opened 360 + 1280 light of the datepicker, 1280 light of the combobox |

## Deviations from the design

| # | What | Why (needs the designer's agreement) |
|---|---|---|
| 1 | Combobox *Panel Language* description says "(the combobox has no `locale`)" where §8 gives "(else `locale`)" for both | the combobox has no `locale` input; the story text reaches consumers through the MCP |

## Known limits (for the backlog)

| Item | Detail |
|---|---|
| Combobox dropdown width | content-sized, not field-wide, although `cdkConnectedOverlayMatchWidth` is on: 85.92 px under the 328 px field (*Starts with a choice*, *Clear Targets (DE)*), 150.31 (*Default*), 135.03 (*Panel Language* DE). The dropdown is a flex item of the CDK pane without a width (design §4) |
| Other overlays, same `lang` gap | not checked one by one: `lc-select` (`cdkConnectedOverlay`), `lc-tooltip`, `lc-menu`, `lc-popover`, `lc-modal`, `lc-drawer`, `lc-toast-outlet` use the CDK overlay or `internal/overlay` (spec assumption 4) |
| `lang` change while open | not followed until the next opening (design §1) |

## Changelog draft

```md
## [3.30.2] - 2026-11-04

Overlay panels that speak the page's language (follow-up 048-f1). No API breaks.

### Fixed

- **`lc-datepicker` and `lc-combobox` panel language** (048-f1, WCAG 3.1.2 Language of Parts): the datepicker panel and the combobox dropdown render in the CDK overlay under `<body>`, outside your `lang` wrapper (`<main lang="de">`), so screen readers read „Juli 2026“, „Heute“ and the German day names with the page's `en` rules. The panel root now takes the host's closest `[lang]`, else the datepicker's `locale`, else none (combobox: the closest `[lang]` only; it has no `locale`). The value is read at every opening. Stories *Panel Language* (Form/Datepicker, Form/Combobox): the English field's panel is `lang="en"`, the German one's `lang="de"`.
- **`lc-date-range-picker`**: its panel is in the host and already inherits a `[lang]` ancestor; on a page without any `lang` it now gets `lang` from `locale` (default `de-DE`).

### Compatibility

- No API breaks, no new input. Closed fields render as before (no `lang` attribute); the open panels gain only `lang`. Layout unchanged: the datepicker panel keeps 342 × 448 px at 360 px and 310 × 395 px at 1280 px, and all 124 at-rest and 28 opened shots of the three components' stories are hash-identical to 3.30.1. If a page sets `lang="en"` around a field with `locale="de-DE"`, the panel is marked `en`: the page's `lang` wins.
```
