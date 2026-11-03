# Review 040: lc-file-upload without nested interactive elements

## Round 1 — 2026-11-03, commit 6c441b4

Screenshots: `tmp/story-shots/040/` (widths 360 · 1024 · 1280, light · dark). Storybook build of the branch (not stale; `git diff --quiet bf5bfd9 -- libs tools` holds).

| Run | Folder · log | Result |
|---|---|---|
| At rest, 7 stories × 3 widths × L/D, `--axe --compare=baseline`, AX measure (CDN axe 4.14 commons, 900 ms wait, blur at end) | `r1/` · `r1.log` | **42 identical, 0 differ; axe 0 violations in 42.** `diff -rq baseline build` (developer's run) also identical |
| Keyboard focus (`focus()`), 4 stories × 3 widths × L/D | `r1-focus/` · `r1-focus.log`, measure `r1-focus-measure.js` | ring and boxes below; shots opened: *Default* 360 L, *German Locale* 360 D |
| `--forced-colors`, focused, 3 stories × 360 × L/D | `r1-forced/` · `r1-forced.log` | below; shot opened: *Default* 360 D |

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `file-upload.axe.spec.ts`: `PRE_EXISTING` gone, 4 rows `[]`, `nested-interactive` and 2.5.3 negative controls (build.md, suite green on bf5bfd9) |
| AC-2 | pass | `r1.log`: 42 shots, `violations: []` (tags wcag2a … wcag22aa, so `nested-interactive`, `label-content-name-mismatch` and `target-size` ran) |
| AC-3 | pass | structure spec *DOM* (4 states + negative control). Browser, 42 shots: interactive descendants of an interactive element = 0; input `visibility: hidden`, not focusable by `focus()`, `isVisibleToScreenReaders` false; no `aria-hidden` |
| AC-4 | pass | Tab stops in the browser (focusable with `tabIndex ≥ 0`): `[file-upload]`, *German Locale* `[file-upload, file-upload__file-remove]`, *Disabled* `[]`. Enter, Space → 2 opens, both `defaultPrevented` (developer measure, 36 enabled shots); structure spec: 1 · 1 · repeat 0. Limit: a real chooser on a real key press was not observed (nit 2) |
| AC-5 | pass | structure spec *click* (zone, content, icon, hint, lines 1 each; remove 0); hit tests at icon, hint, lines = zone in 36 enabled shots |
| AC-6 | pass | structure spec *drag and drop*, `checks.spec` drop paths; content `pointer-events: none`, so the zone is the only hit target (no child `dragleave`) |
| AC-7 | pass | Names (axe `accessibleText`, every width and theme): "Drag & drop files here, or click to browse" · "Upload your documents (PDF, PNG, JPG), Accepted: .pdf,.png,.jpg,.jpeg, Max: 5.0 MB" · "Upload a profile picture, Accepted: image/*" · "CSV-Datei hierher ziehen oder zum Auswählen klicken, Erlaubt: .csv, Höchstens: 20,0 MB"; *Disabled* "Upload disabled". 2.5.3 rule passes (0 violations) |
| AC-8 | pass | role `button` in all 42; *Disabled*: `aria-disabled="true"`, no `tabindex`, `focus()` fails, input `disabled`, 0 opens. Screen-reader note below |
| AC-9 | pass | zone at 360: 328 × 121 (Default, Disabled) / 147 (Single File) / 173 (restrictions, rejected) / 194 (DE); 1024: 992 or 480; 1280: 1248 or 480. Equal to `baseline.log`, ≥ 44 |
| AC-10 | pass | `:focus-visible` matches, `solid 2px` #208497 L / #84c7d4 D, offset 2 px, **4.37 L / 9.95 D** vs page, all widths; the rule is `&:focus-visible` (SCSS l. 25), so no ring on mouse focus. Shots show the ring clear of the dashed border |
| AC-11 | pass | forced colours: ring `rgba(5,0,73,.8)` L / `rgba(0,230,255,.8)` D (Highlight), border `2px dashed` black / white, hint black / white; disabled zone not focusable |
| AC-12 | pass | `file-upload.checks.spec.ts` not in `git diff 3ae03e2 HEAD`, green; *Type/Size Rejected* status texts unchanged ("liste.xlsx is not a CSV file.", "ist.csv is larger than 20.0 MB.") |
| AC-13 | pass | *German Locale* 360 L/D: `docW` 360, hint 276 × 42 (2 lines), zone 194 high, list row present |
| AC-14 | pass | 42/42 identical twice (build, r1); `index.ts`, inputs, outputs, types and JSDoc untouched; only `protected onKeyActivate` added |
| AC-15 | pass | `check-angular-majors.mjs --only=22` PASS with the new row (input before the zone, no `tabindex`/`aria-hidden`, zone `tabindex="0"`, DE name, hint and lines in `p`, inlined `visibility`/`pointer-events`). The Angular 21 leg is the release gate's |
| AC-16 | pass | structure spec *form*: `input.form === form`, `name === ''`, no `FormData` entry, pick → `filesSelected`, `value === ''` |
| AC-17 | pass | design §7 wording in `file-upload.stories.ts` (component bullet, *Disabled*, `disabled` argType with `table.defaultValue`); changelog draft (build.md) *Fixed* names 037 finding 5 and the rule, "no API breaks" |

### AC-8 screen-reader note

No audible VoiceOver or NVDA run is possible in the headless pipeline. What follows is what Chromium exposes to the platform API (axe 4.14 `aria.getRole`, `text.accessibleText`, `isVisibleToScreenReaders`, `focus()` in the story) and the speech that follows from it.

| Story | Exposed | Expected speech (VoiceOver · NVDA) |
|---|---|---|
| *Default* | button, name as AC-7, focusable; nothing else in the zone (the input is out of the tree, the content is presentational under `role=button`) | "Drag & drop files here, or click to browse, button" · "Drag & drop files here, or click to browse, button" |
| *With Restrictions* | button, hint + both lines | "Upload your documents (PDF, PNG, JPG), Accepted: .pdf,.png,.jpg,.jpeg, Max: 5.0 MB, button" |
| *German Locale* (DE voice) | button, DE name; then the remove button (own tab stop) | "CSV-Datei hierher ziehen oder zum Auswählen klicken, Erlaubt: .csv, Höchstens: 20,0 MB, Taste" · "… Schalter" |
| *Disabled* | button, `aria-disabled="true"`, not in the Tab order (reachable with the virtual cursor only) | "Upload disabled, dimmed, button" · "Upload disabled, button, unavailable" |

On 3.25.1 the same zone also held a focusable file input (`tabindex=-1`, `aria-hidden`); that node is gone from the tree, so a reader can no longer land on an unnamed, hidden "Choose File" control.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | nit | Changelog draft (build.md), *Fixed* first bullet | Consumer facts only, as in 039 nit 3: "axe-core 4.14 reports no violation in any File Upload story (360, 1024, 1280 px, light and dark); the zone looks exactly as in 3.25.1" | "(36 of 42 failed on 3.25.1). The 42 screenshots are identical to 3.25.1 by hash" is review data |
| 2 | nit | AC-4 evidence | A native chooser counted on a real Enter, Space, held Enter and click (CDP `Input.*` + `Page.fileChooserOpened`) | Not observed: in-page measures have no user activation, and `node tmp/story-shots/040/r1-picker.mjs` (prepared, untested) needed approval. The spec accepts the spy; `visibility: hidden` doesn't block the activation behaviour (HTML spec; dropzone.js uses it). Optional owner check: `node tmp/story-shots/040/r1-picker.mjs form-file-upload--default,form-file-upload--disabled,form-file-upload--german-locale 360 light` |

New follow-up **F-21**: the list's remove button (`.file-upload__file-remove`) is 20 px, below the kit's 44 px target (axe `target-size` passes by spacing; spec non-goal). F-18, F-19 and F-20 stay open.

**Verdict:** approved
