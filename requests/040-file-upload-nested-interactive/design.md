# Design 040: lc-file-upload without nested interactive elements

- **Status:** ready
- **Spec:** [spec.md](spec.md), AC-1 … AC-17 · patch (3.25.2 unless bundled)
- **Baseline:** `tmp/story-shots/040/baseline` (7 stories × 360/1024/1280 × L/D = 42 shots, `--axe`, main 3ae03e2 = 3.25.1). The measure waits 900 ms first, so the 3 `play` stories are shot in their dropped end state. A review compare must wait just as long (see §9).
- **Prototype (proof):** `tmp/story-shots/040/proto.log`. The §2 DOM and CSS were applied in the browser to the 3.25.1 build: **42/42 identical by hash, 0 axe violations** (3.25.1: `nested-interactive` in 36/42; *Disabled* already 0).

## 1. Approach

Extend `lc-file-upload` with shape **(b)**: the native `<input type="file">` moves out of the `role="button"` zone and becomes its preceding sibling in the host. The zone element keeps everything it has now: role, `aria-label`, tab stop, `:focus-visible` ring, click, key and drag handlers, and classes. So nothing that is seen, named or focused moves.

| Option | Decision and why |
|---|---|
| (b) input beside the zone, picker opened by `input.click()` | **Chosen.** One element moves and two attributes go. The tests' selector `.file-upload[role="button"]` and the stories' `.file-upload` stay valid. The input's synthetic `click` no longer bubbles into the zone's `(click)`. Today it does, and only the "click in progress" flag stops a second `click()`. |
| (a) `<label>` zone that owns a visible-to-AT input | Rejected. The input would have to stay focusable (a label can't reach a `display:none` or `visibility:hidden` input from the keyboard), so the tab stop would become the native file input. Safari skips that with Tab by default (the `tabindex=0` div is reachable today). Its role and name vary by browser (Chrome adds "No file chosen"), which breaks AC-7. The ring would move to the label through `:has()` and would need a forced-colours `Highlight` rule (037 r1). |
| Native `<button type="button">` as the zone | Rejected for a patch. `<div>` and `<p>` are not allowed inside a button. The UA button styles (font, colour, padding, shrink-to-fit width) and any consumer `button {…}` rule would reach the zone, so AC-14's pixel identity is at risk. |

**Why the hidden input still opens the picker:** it stays rendered exactly as today (absolute, 0 × 0, `overflow: hidden`, `opacity: 0`) and only gains `visibility: hidden`. That takes it out of focus and the accessibility tree without `display: none` (dropzone.js uses the same approach). `click()` is still called synchronously inside the user's click or keydown handler, so it uses the same user activation as today.

## 2. Public API

No change. Inputs (`accept`, `multiple`, `maxSizeBytes`, `disabled`, `hint`, `acceptedLabel`, `maxSizeLabel`, `removeFileAriaLabel`, `locale`), outputs (`filesSelected`, `fileRejected`), selector, exported types and all JSDoc stay as they are (spec constraint). There are no slots and no CSS hooks, and none are added.

Internal changes (all of them):

| File | Change |
|---|---|
| `.html` | Move the `<input #fileInput …>` to before the zone `div`, keeping `type`, `class`, `[accept]`, `[multiple]`, `[disabled]` and `(change)`. **Remove** `tabindex="-1"` and `aria-hidden="true"`. Zone: `tabindex="0"` → `[attr.tabindex]="disabled() ? null : 0"`. `(keydown.enter)` and `(keydown.space)` → `onKeyActivate($event)`. Everything else is unchanged. |
| `.scss` | `.file-upload__input`: add `visibility: hidden;` (keep its 5 declarations). `.file-upload__content`: add `pointer-events: none;` |
| `.ts` | `protected onKeyActivate(event: Event): void`: `event.preventDefault()`, then `openFilePicker()` unless `(event as KeyboardEvent).repeat`. `openFilePicker()` is unchanged. |

Default rendering unchanged: the prototype gave 42/42 hashes identical to the 3.25.1 baseline. Neither added declaration paints anything.

## 3. Anatomy and layout

All values were measured on 3.25.1 (`baseline.log`) and are unchanged. The Storybook canvas padding is 16 px.

### 360 px (*Default*; *With Restrictions* adds the two lines)

```
0   16                                               344  360
│   ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐    │  div.file-upload role=button tabindex=0
│   ╎ 2 dashed border-strong · r 18 · fill surface-2 ╎    │  328 × 121 (restrictions 173, DE 194)
│   ╎                     ↕ 32                       ╎    │
│   ╎ ←24→             [☁↑] 24                  ←24→ ╎    │  lc-icon decorative, primary-500
│   ╎                     ↕ 8                        ╎    │
│   ╎   Drag & drop files here, or click to browse   ╎    │  hint 14/21, 263 wide
│   ╎                     ↕ 8                        ╎    │  (restrictions only)
│   ╎          Accepted: .pdf,.png,.jpg,.jpeg        ╎    │  12/18, 168 wide
│   ╎                     ↕ 8                        ╎    │
│   ╎                  Max: 5.0 MB                   ╎    │  12/18, 70 wide
│   ╎                     ↕ 32                       ╎    │
│   └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘    │
│   ↕ 12 · ul.file-upload__list rows 42 high (after a pick or drop)
```

DOM (the only structural change is marked ►):

```
lc-file-upload                              block, 100 %
├─ ► input.file-upload__input type=file     abs 0×0, opacity 0, visibility hidden; no tabindex, no aria-hidden
├─ div.file-upload  role=button  tabindex=0|—  aria-label  aria-disabled   ← the only tab stop of the zone
│  └─ div.file-upload__content              pointer-events: none
│     ├─ lc-icon.file-upload__icon          decorative
│     ├─ p.file-upload__hint
│     └─ p.file-upload__accept ×0–2         (accept, max)
└─ ul.file-upload__list                     unchanged; remove buttons were already outside the zone
```

### From 1024 px

The same column. The zone is as wide as its container: 992 at 1024 and 1248 at 1280 (*Default*, *With Restrictions*, *Single File*, *Disabled*), and 480 in the three `max-width: 480px` stories. In *German Locale* the DE hint fits on one line from 1024 (349 wide), so the zone is 173 high.

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Zone | padding 32 / 24, border 2 dashed, radius 18 | — | `--color-border-strong`, `--border-radius-lg`, `--color-surface-2` |
| Content column | gap 8, centred | — | — |
| Icon | host box 24 (measured) | — | `--color-primary-500` |
| Hint | line 21 | 14 px | `--color-text-secondary` |
| Accept / max lines | line 18 | 12 px | `--color-text-tertiary` |
| List | margin-top 12, gap 8, row 42 | 13 px | unchanged |

## 4. States

| State | Look (unchanged) | Behaviour (new parts are **bold**) |
|---|---|---|
| default | as §3 | 1 tab stop. The input is not focusable (prototype: `focus()` leaves it inactive). |
| hover | border `--color-primary-500`, fill `--color-surface-hover` | Over the icon or the text, the pointer now hits the zone itself (prototype `elementFromPoint` = zone on the icon, hint and lines) |
| focus-visible | 2 px solid `--color-primary-500`, offset 2 | Same element, same rule; no ring on mouse focus (`:focus-visible`) |
| active / pressed | none | click, Enter or Space → `input.click()` **once**; **Space no longer scrolls the page** (3.25.1: keydown not prevented, measured `defaultPrevented: false`); **auto-repeat ignored** |
| drag-over | `--drag-over`: border primary-500, fill `--color-surface-selected` | **No flicker over the children:** they are no hit target, so the zone gets no `dragleave` while crossing them |
| disabled | `opacity: .5`, `pointer-events: none` | `aria-disabled="true"`, input `disabled`; **the zone leaves the tab order** (`tabindex` removed; it was focusable but did nothing) |
| loading / empty | n/a: no loading state; the zone is the empty state | — |
| error | the kit shows nothing; `fileRejected` (3.24) is unchanged | — |
| overflow | DE hint wraps to 2 lines at 360 (276 wide, zone 194), page width 360; file names ellipsis | unchanged |

Side effect to document: the zone's text can no longer be selected with the mouse, as on a native button.

## 5. Theming

Unchanged tokens. Computed on 3.25.1 at 360 with the WCAG formula, translucent dark tokens composited over the page (`contrast.log`):

| Element | Light | Dark | Contrast L / D |
|---|---|---|---|
| Focus ring vs page background | `--color-primary-500` #208497 | #84c7d4 | **4.37 / 9.95** (vs `--color-surface` 4.37 / 9.13) ≥ 3 |
| Hint on surface-2 · hover · drag-over | `--color-text-secondary` | same | 7.23 · 6.87 · 6.50 / 9.26 · 11.06 · 9.29 |
| Accept lines on surface-2 · hover · drag-over | `--color-text-tertiary` | same | 5.58 · 5.30 · 5.02 / 5.56 · 6.65 · 5.58 |
| Hover and drag border vs page | `--color-primary-500` | same | 4.37 / 9.95 |
| Rest border vs page | `--color-border-strong` | rgba .28 | 1.60 / 2.45. Decorative: the zone is identified by its icon (4.37 / 9.95) and text. Pre-existing, kept (no visual change). |
| Forced colours (emulated) | ring `Highlight` rgba(5,0,73,.8), border dashed CanvasText, text CanvasText | ring rgba(0,230,255,.8), same | The focused element's own outline is forced to Highlight, so no forced-colours rule is needed (`forced.log`) |

New tokens: none.

## 6. Accessibility

- **Semantics:** `div role="button"`, named by `aria-label` = `hint`, then the shown lines, comma-separated (unchanged, AC-7). The input is out of the accessibility tree (`visibility: hidden`), so it neither adds to the name nor counts as a nested control. Expected speech: VoiceOver "Drag & drop files here, or click to browse, button"; disabled: "…, dimmed, button".
- **Keyboard and focus order:** zone (Tab) → the list's remove buttons (one stop each, unchanged, outside the zone). Enter or Space on keydown → `preventDefault`, then open once (no `repeat`). No double open: a div doesn't turn keys into clicks, and the input's click no longer bubbles into the zone.
- **Disabled:** no `tabindex` → not reachable by Tab, still exposed as a dimmed button. If the zone becomes disabled while it has focus, the browser moves focus to `body`, as for a native disabled button.
- **Target:** zone ≥ 328 × 121 at 360 (AC-9). The 20 px remove button is out of scope (spec non-goal); a follow-up remains open.
- **Forced colours:** see §5. **Reduced motion:** the 150 ms colour transitions are already shortened by the global rule; nothing new.
- **Announcements:** none added (the rejection message stays the page's own `role="status"`, as in the stories).

## 7. Texts

No new built-in strings. Only story docs change (EN; story text, not shown in the canvas):

| Where | New wording |
|---|---|
| Component description, replacing "- Keyboard accessible" | `- One control: Tab reaches the zone (one tab stop); Enter or Space opens the file picker, so does a click anywhere in the zone, or drop files on it. The native file input sits hidden beside the zone, not inside it (3.25.2).` |
| *Disabled* story | `` `disabled`: the zone is dimmed, leaves the tab order, ignores clicks, keys and drops, and reports `aria-disabled="true"`. `` |
| argType `disabled` | `Disables the drop zone: dimmed, out of the tab order, aria-disabled="true"` |

## 8. Stories

No new story: there is no new input, slot or variant. All 7 stay as they are (they are the AC-14 hash surfaces). The description edits in §7 cover AC-17.

| Story | Expected ID | Shows |
|---|---|---|
| Default | `form-file-upload--default` | 1 line, full width |
| With Restrictions | `form-file-upload--with-restrictions` | 3 lines in the name and the zone |
| Disabled | `form-file-upload--disabled` | dimmed, not tabbable |
| Single File | `form-file-upload--single-file` | accept only |
| Type Rejected On Drop | `form-file-upload--type-rejected-on-drop` | drop path (play) |
| Size Rejected | `form-file-upload--size-rejected` | drop path, code size |
| German Locale | `form-file-upload--german-locale` | DE, 2-line hint at 360, list row |

## 9. Verification

Review compare: `--stories=<the 7> --widths=360,1024,1280 --themes=light,dark --axe --compare=tmp/story-shots/040/baseline` with a measure that first runs `await new Promise(r => setTimeout(r, 900))`.

| AC | How | Expected |
|---|---|---|
| 1 | `file-upload.axe.spec.ts`: `PRE_EXISTING` and its comment deleted; every row `violations(results)` = `[]`. Negative control: append a `<button>` inside the zone → `nested-interactive` reported. The 2.5.3 negative control expects exactly `[RULE]`. | 4 rows pass, control fails as intended |
| 2 | story compare above, `--axe` | 42/42 `violations: []` |
| 3 | unit test (DOM walk) with and without files, enabled and disabled: no element matching `a[href],button,input,select,textarea,[tabindex],[role=button]` has such an ancestor inside the host; every `[aria-hidden="true"]` has no `tabindex` and is no form control | 0 hits |
| 4 | unit test: `jest.spyOn(input,'click')`; Enter keydown → 1; Space keydown → 1 and `defaultPrevented === true`; `repeat: true` → 0. Tabbables in the host = `[zone]` (+ remove buttons). The 360 story measure: focus, then the keydown | 1 · 1 · 0; prototype `opens: 2` (click + Enter) |
| 5 | unit test: `zone.click()`, `hint.click()`, `icon.click()` → 1 each; remove button click → 0 | as stated |
| 6 | unit test: dragover → `--drag-over`; dragleave → gone; drop → `filesSelected` (the existing checks spec). Story measure: `elementFromPoint` at the centres of the icon, hint and lines | the zone (prototype: `["zone","zone","zone"]`) |
| 7 | axe spec rows unchanged (4 names), `outcomeFor(RULE, zone)` = pass | the 4 strings |
| 8 | unit test: disabled → no `tabindex` attribute, `aria-disabled="true"`, Enter/click → 0 opens, input `disabled`. `review.md`: AX role and name through axe.commons (no screen reader in the headless run) | button, name, disabled |
| 9 | `baseline.log` vs. review measure, zone box | 360: 328 × 121 / 173 / 147 / 194 (DE); 1024: 992 or 480; 1280: 1248 or 480; ±1 |
| 10 | 360 L/D measure: `focus()` → `:focus-visible`, outline `solid 2px` offset `2px`, contrast vs page | 4.37 / 9.95 |
| 11 | `--forced-colors` 360 L/D, focused | outline rgba(5,0,73,.8) / rgba(0,230,255,.8), border dashed, text CanvasText |
| 12 | `file-upload.checks.spec.ts` passes without changed assertions | green, 0 edits |
| 13 | *German Locale* 360 L/D: `scrollWidth`, hint box | 360; hint 276 × 42 |
| 14 | the compare above + `git diff` of `index.ts` and the `.ts` public members | 42 identical; only `onKeyActivate` (protected) added |
| 15 | `tools/compat`: new `probe-3252.ts` (`lc-compat-3252`, in `home.html`) rendering `<lc-file-upload id="compat-upload-3252" lang="de" accept=".csv" [maxSizeBytes]="20971520" locale="de-DE" hint="CSV-Datei hierher ziehen oder zum Auswählen klicken" acceptedLabel="Erlaubt:" maxSizeLabel="Höchstens:" />`, plus an `EXPECT_IN_HTML` check, with lookaheads | in the prerendered HTML: `input type="file"` with no `tabindex` or `aria-hidden` **before** a `div` with `role="button"`, `tabindex="0"` and `aria-label="CSV-Datei hierher ziehen oder zum Auswählen klicken, Erlaubt: .csv, Höchstens: 20,0 MB"` that holds no `<input`; the hint in a `p.file-upload__hint`; Angular 21 and 22 pass |
| 16 | unit test: host in a `<form>`: `input.form === form`, `name === ''`, `new FormData(form)` has no file entry (as 3.25.1); `change` with `files` → `filesSelected`, `value` reset | as stated |
| 17 | §7 wording in the stories file; `CHANGELOG.md` *Fixed*: names 037 finding 5 and the axe rule; covers the hidden input beside the zone, 42/42 identical shots, Space no longer scrolls, the disabled zone leaves the tab order, text no longer mouse-selectable; "No API break" | present |

Changed existing assertion (must be justified in `build.md`): `file-upload.component.spec.ts` › *should have hidden file input* asserted `aria-hidden="true"`. It now asserts that the input is outside `.file-upload` and has no `aria-hidden` or `tabindex`, and, if jsdom computes it, `visibility: hidden`. Reason: AC-3, since `aria-hidden` on a focusable input was the defect class.
