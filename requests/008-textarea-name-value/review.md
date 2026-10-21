# Review 008: lc-textarea name and value for no-script posts

## Round 1 — 2026-10-21, commit 106db1f (gates on 921167b; `git diff --quiet 921167b -- libs tools` holds)

Storybook: the developer's build (story-shots accepted it as current). Shots: `tmp/story-shots/008/r1/` (4 new stories × 360 · 1024 · 1280 × light · dark, with measures), `r1-axe/` (axe-core 4.10.2 + accname, 360 light), `r1-cmp/` (field metrics of `lc-input` lg vs `lc-textarea` md/lg). Unchanged stories: `diff -rq baseline existing` → 60 / 60 identical (the developer's `--full` shots from this build). Opened 8 shots: every new story at 360 light, three at 1280 light, the contact form at 360 dark. Gates were not re-run.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `name="message"` on the native textarea in prefilled-value, prefilled-german and the contact form. Unset (required-without-indicator) → `getAttribute('name') === null`. Unit test per build.md |
| AC-2 | pass | Compat row "textarea name and value before JS" on 21.0.9, 21.2.25, 22.0.8 and 22.2.3 (build.md). Server-guard unit test: `'\nHi'` → `'\n\nHi'`, unchanged in the browser |
| AC-3 | pass | Unit tests: `[(value)]`, `ngModel`, `FormControl`. The one changed assertion (`setValue` now emits once) is the emission designed in §4 (D2) and is listed under Changed |
| AC-4 | pass | Contact form, all 6 shots: `FormData` = `email="jana@example.de"`, `message="Guten Tag,\n\nich möcht…"`. build.md, JS disabled: body `message=%0D%0AErste+Zeile%0D%0A…`, with the leading break kept |
| AC-5 | pass | build.md: hydrated (`jsaction` 85 → 0), `name` and `value` intact, no `NG05xx`. Typing unit test: 1 × `valueChange('Hallo!')` |
| AC-6 | pass | Compat rows "input value before JS" and "input value escaped" (`Anna &quot;Ann&quot; &amp; Co`). `lc-input` is untouched (diff 420a523..HEAD) |
| AC-7 | pass | required-without-indicator, all 6 shots: no `.lc-textarea-required-indicator`, `required` true, `aria-required="true"`, accname "Message" |
| AC-8 | pass | axe accname: prefilled-german → "Nachricht"; contact form → "Nachricht" (role textbox, required). `*`: `aria-hidden="true"`, no `aria-label`. "Pflichtfeld" does not occur in the `lc-textarea` DOM. axe violations: only the isolated-story rules (`landmark-one-main`, `page-has-heading-one`, `region`) |
| AC-9 | pass | 60 / 60 existing shots hash-identical to the baseline. Compat row 2 (the 3.9 default textarea) passes. Unit tests: 3 keystrokes → 3 emissions; `writeValue` ×2 → 1; `[value]` → 0 |
| AC-10 | pass | Every width and theme: label x 16, y 16, h 21, 14 px / 500; field y 45, 16 / 24. Rows 6 → h 170, rows 3 → h 98. German at 360: `scrollWidth` 326 = `clientWidth` 326, `scrollHeight` 288 > 168 (it scrolls inside). Contact form w 328 / 560 / 560 (360 / 1024 / 1280). `*` 12.59 (light) / 9.48 (dark); text 17.74 / 15.85. `& < > "` show literally. All argTypes have a `description` and `table.defaultValue` |
| AC-11 | pass | build.md: `test:tools` 22 / 22, and the built `.d.ts` has the 4 inputs plus the output `{ value: 'valueChange' }`. `extract-props.mjs` reads only call initialisers (l. 147–185), so the `valueChange` class property adds no second entry |
| AC-12 | pass | Compat matrix PASS on all 4 versions (build.md) |
| API (§2) | pass (rev. 1) | `name` `input<string>()`, `value` `model('')`, `requiredIndicator` `true`, `requiredAriaLabel` `'required'`, and protected `renderedValue` using `isPlatformServer`. The JSDoc matches §2, with `@default` on every input |

**Deviation 1 (`valueChange` as a class property): accepted.** Removing the member would be a break: the 2.0 changelog lists it as one, and the owner set this as 3.10, a minor. The `OutputRef<string>` keeps `subscribe()` and `outputToObservable()`, and Angular compiles only one output, `valueChange`, which comes from the model. The only thing lost is an outside `.emit()`. That was never a supported use, so it is not treated as a break (recorded as an assumption). §2 was wrong in the design itself: design.md rev. 1 has the change note.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix (changelog, release-manager) | build.md changelog draft, Compatibility | A line saying that `TextareaComponent.valueChange` is typed `OutputRef<string>` (was `OutputEmitterRef<string>`): `subscribe()` / `outputToObservable()` work unchanged, and only an outside `.emit()` no longer compiles (design.md §2 rev. 1) | The draft says "still subscribable on the component" and "No API breaks", but it doesn't name the type change |
| 2 | nit (note for life-os, no kit change) | contact form, 360 light/dark | Text column and type match between the fields | `lc-input` lg: text at x 37, 18 / 27. `lc-textarea` md (concept row 130): text at x 33, 16 / 24. With `size="lg"` on the textarea: x 37, 18 / 27, rows 6 → 192 px. The surface is different too, as it already was in 3.9: input `rgb(249,250,251)` / `rgb(26,44,58)` vs textarea outline `#fff` / `rgb(16,28,38)` |

Follow-ups, not in 3.10 and all pre-existing in `lc-input`:
- The `*` has `aria-label`, so the accname is "E-Mail Pflichtfeld" plus the required state, and "required" is announced twice (design §6).
- The `*` has `margin-left` 2 px (the textarea's has 0).
- The lg `.input-container` is 44 px high, while the `<input>` box is 47 px.

**Verdict:** approved. All 12 AC pass. Finding 1 belongs in the changelog. Finding 2 and the follow-ups stay listed for the release-manager.
