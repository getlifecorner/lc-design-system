# Build 016: Contact form field and alert gaps

- **Branch:** `feat/3.12-contact-form-field-gaps`
- **Commit:** branch tip, `feat(forms): stable field ids, quiet errors, one asterisk gap and a text link in lc-alert`. Round 1: `libs` and `tools` = `127caeb`. Round 2 amended `input.stories.ts` only (see *Round 2*)

## Round 2 (review 016 r1, findings 1 and 3)

`input.stories.ts` *Error Summary* only, as design.md §8 r1: `<ul style="list-style: none; margin: 4px 0 0; padding: 0">`, links `<a lcButton variant="link" size="sm" [flush]="true">`, textarea without `size` (md). No library, spec or tools change.

| Check (`form-input--error-summary`, 360 / 1280 × light / dark, `tmp/016/r2-summary.log`) | Result |
|---|---|
| Links x / text x / title text x | **69 / 69 / 69** in all 4 shots |
| Link boxes | **h 44**, w 104 and 66.1, centres 44 px apart (were 17 px high, x 85, 21 px apart), 14 px |
| Link contrast on the alert (composited) | **4.78** light, **11.39** dark (= prototype `r1-proto`) |
| `[role=alert]` | **1**; both field errors without `role`, still in `aria-describedby`, `aria-invalid="true"` |
| Focus after the link click | **`contact-email`**, **`contact-message`** |
| Field values | all three 16 px at x 33 (textarea was 18 px at x 37) |
| Clipping / doc overflow | 0 / 0, 0 console errors |
| vs `r1-proto` (hash) | 4 differ: opened 360 light against the prototype, the alert is identical, only the textarea (md now) differs; opened 1280 dark |

Gates for round 2: Storybook build `--skip-nx-cache` green (17.7 s, `tmp/016/r2-build-storybook.log`); lint 0 errors, 162 warnings (= baseline); `test:tools` 22 / 22 (reads the stories). Jest, lib build and compat are not re-run: no spec or tool imports `input.stories.ts`, and `git diff 127caeb -- libs tools` is that file only. Shots: `tmp/story-shots/016/r2/`.

## Files changed

| File | Change |
|---|---|
| `input/input.component.ts` | `controlId`, `announceError` (JSDoc, `@default`); module counter `lc-input-<n>` instead of `Math.random`; `inputId` → getter (resolved id); `requiredAriaLabel` `@deprecated` |
| `input/input.component.html` | `*`: `aria-hidden="true"`, no `aria-label`, no whitespace before it; error `[attr.role]` from `announceError` |
| `input/input.component.scss` | `*`: `margin-inline-start: var(--spacing-1)` (was `margin-left: var(--spacing-0-5)` + a space) |
| `textarea/textarea.component.{ts,html,scss}` | Same inputs; `textareaId`/`errorId`/`helperId` → getters; `requiredAriaLabel` `@deprecated`; `*` without whitespace, same margin |
| `alert/alert.component.scss` | `.lc-alert__action > a:where(:not(.btn))` (design §3, §4); container only with such a link; inline ≤ 50 %, below the text `< 36rem`; stacked icon indent `calc(24px + gap)` (was `1.5rem`) |
| `alert/alert.component.ts` | JSDoc: text link in the action slot, example |
| `{input,textarea,alert}.stories.ts` | argTypes `controlId`, `announceError`, deprecated `requiredAriaLabel`, alert meta + `actionsLayout` text; the five stories of design §8 |
| `input.control-id.spec.ts`, `textarea.control-id.spec.ts`, `alert.link-action.spec.ts` | New, 15 + 9 + 10 tests |
| `tools/compat/template/src/app/probe-312.ts`, `home.{ts,html}`, `check-angular-majors.mjs` | 422 contact form probe; 5 `EXPECT_IN_HTML` checks |

One existing assertion changed, for the reason AC-6 / AC-14 state: `i18n-labels.spec.ts` "lc-input: requiredAriaLabel" expected the `*`'s `aria-label` (`required`, then `Pflichtfeld`); it now pins the decorative `*` (`aria-hidden`, no `aria-label`, `Pflichtfeld` nowhere) and `aria-required` on the input.

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1 | Specs (both): `controlId` → control id, label `for` (+ `-label`), `-error`, `-helper`, `aria-describedby`, change/empty fallback. Story `form-input--error-summary` 360/1280 × light/dark: summary link click → `activeElement` `contact-email` / `contact-message` |
| 2 | Spec: `lc-input-<n>`, `<n+1>`, `/^lc-input-\d+$/`, counter also past a `controlId`; no `Math.random` in `lib/input` (spec reads the sources) |
| 3 | Compat 22: `controlId` ids in the HTML, generated ids `lc-input-\d+(-label…)`; 2nd `ng build` of the same app: home `index.html` **byte-identical** (`cmp`). Browser (prerendered home, hydrated): 15 field ids server = client (5 `contact-*`, 10 generated `lc-input-0…3`, `lc-textarea-0/1`), `jsaction` 88 → 0, 0 console errors, `#contact-email` link focuses the input |
| 4 | `inputId` read in specs and stories unchanged; compat AOT/strictTemplates build green |
| 5, 6 | Specs: `*` `aria-hidden="true"`, no `aria-label`, `Pflichtfeld` in no attribute, `required` + `aria-required="true"`; axe `accessibleText`: "Company Name" (was "Company Name required"), "Nachricht". JSDoc + argTypes "Deprecated, no effect". Shots: 22 `*` all `aria-hidden`, none named |
| 7 | `--measure` gap glyph → `*`: **4.00 px** for all 11 labels (`required-asterisk` 8, `required` 1, textarea `no-script-contact-form` 2) at 360 and 1280; `*` on the label's last line in all 22. Specs pin the compiled margin |
| 8 | Specs: role by default, none with `announceError=false` (id, `aria-describedby`, `aria-invalid` kept). Story: `[role=alert]` count **1** (4 shots); compat: 1 in the 422 form |
| 9 | `--measure` both link stories 360/1024/1280 × light/dark: h ≥ 44 (min 44; 63 at 360 inline, 3 rows), w ≥ 177.2; contrast vs the story canvas min **4.78** light (error) / **9.47** dark (warning), hover ≥ 7.03 / 11.12, ring 2 px solid, visible on `.focus()`, ≥ 3.36 / 8; `underline 1px`; link vs body 2.86 / 1.47 (underline carries it). Specs pin the compiled rules |
| 10 | 360 at 100 %: doc 0, alerts 0, link x 69 = text x (inline below the text, w 258). 360 at 200 %: doc 0, link x 113 = text x, h 294 (7 rows). 1024: link right of the body, w 479, h 44; 1280: w 529.6 |
| 11 | Spec: body → link → close in DOM order, native `<a href>` (no tabindex/role), alert roles per variant, no extra live region. Screen-reader pass: designer (`review.md`) |
| 12 | Shots light + dark; spec: no `forced-color-adjust`, no `transition` on the link |
| 13 | `form-input--error-summary`: no label, error or title clipped at 360 (0); no new built-in text |
| 14 | Full Jest; shots vs `tmp/story-shots/016/baseline`, see Gates |
| 15 | JSDoc `@default` + argTypes; extractor (temporary `tmp/016/manifest-016.test.mjs` run with `test:tools`): `controlId`, `announceError`, `requiredAriaLabel` ("Deprecated, no effect …") on both components |

## Gates

Jest and lint ran on `127caeb` (later agents: `git diff --quiet 127caeb -- libs tools`). Lib build, Storybook, shots, compat and `test:tools` ran on the content of `d608a37`, which differs from `127caeb` only in `i18n-labels.spec.ts` (test-only). Logs in `tmp/016/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | **180 suites, 4316 passed, 8 skipped** (baseline 177 / 4282: +3 suites, +34 tests); ran after all Chromium runs |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (= baseline) |
| `npx nx run angular-ui-kit:build` | green, no new entry |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | green (19 s), 904 stories (+5) |
| Story shots | `tmp/story-shots/016/build/`, 52 stories × 360/1280 × light/dark, `--compare=tmp/story-shots/016/baseline` (`tmp/016/shots-compare.log`): **168 identical, 32 different, 8 new**. The 32 are 8 stories with a `*` (input required / login-form / contact-form, email-input required / invite-form, textarea prefilled-value / prefilled-german / no-script-contact-form); in-browser pixel diff: every change is a 5 px high band at a `*` (`tmp/016/diff.log`). All 44 alert shots identical. New: the 5 stories at 360/1280 × light/dark (links also 1024, `build-200/` at 200 %); opened link-action 360 + 1280 light, link-action-stacked 360 dark, error-summary 360 light |
| `check-angular-majors.mjs --only=22` | PASS, Angular 22.2.3: 68 / 68 HTML checks (63 + 5 new) |

## Deviations from the design

None. Notes for the review:

- The error's `role` is now an attribute binding, so in the DOM it follows `id` (was before it); same attributes and values.
- Contrast is measured against the Storybook canvas (min 4.78 light); the design's minimum over all bases (4.56 on `background-low`) stands.
- Stacked 503 alert at 360 px and 200 % text: the `lc-button` lg "Erneut senden" is 3.3 px wider than its 182 px column (the button's min-content, not the link: the link itself fits, and the document does not scroll, 0). The 24 px indent gives this column 24 px more than `1.5rem` did. For comparison, the existing `stacked-actions` (3.3) overflows the document by 14 px at 200 % (not investigated here). Your call whether the story needs `--lc-btn-overflow-wrap: anywhere` or a shorter label.
- The error-summary measure also matched the field container `.input-container.input-error`: the class collision is G-WL3 (request 017), unchanged here.

## Changelog draft

Contact form fields keep their ids, field errors under a summary stay quiet, the required `*` is decorative with one gap, and `lc-alert` takes a text link as its action (G-CF3, G-CF4, G-CF6, G-CF7, G-CF8; life-os website contact form). No API breaks.

### Added

- **`controlId` on `lc-input` and `lc-textarea`** (G-CF4): the native control's id; the label `for`, `<id>-error`, `<id>-helper` (and `lc-input`'s `<id>-label`) and `aria-describedby` derive from it. An error summary can link to a field (`<a href="#contact-email">` focuses it), and prerendered pages are the same in every build: two builds of a consumer app gave a byte-identical page, and all 15 field ids were unchanged after hydration. Unset: `lc-input-<n>` / `lc-textarea-<n>` in creation order (`lc-input` ids no longer have a random part); the server keeps counting across prerendered routes, so set `controlId` on prerendered pages.
- **`announceError`** on both (G-CF7), default `true`: `false` drops only `role="alert"` from the error; it stays visible and in `aria-describedby`, and the control keeps `aria-invalid`. Under an `lc-alert` error summary a 422 page now has one alert instead of three.
- **`lc-alert`: a text link in `slot="action"`** (G-CF8), e.g. the address on a 503 / 429 page: `<a slot="action" href="mailto:…">` gets a 44 × 44 px target (was an inline link about 16 px high), link colour (≥ 4.78:1 light, ≥ 9.47:1 dark on all four variants), an underline (thicker on hover) and the focus ring. Inline it sits right of the text (up to half the row) and drops below it under 576 px of alert width; a long German address wraps without horizontal scroll at 360 px, also at 200 % text. `a[lcButton]` keeps its button look.
- Stories: Form/Input "Error Summary", "Required Asterisk"; Form/Textarea "Error without Alert Role"; Feedback/Alert "Link Action", "Link Action, Stacked".

### Changed

- **The `*` of `lc-input` is decorative** (G-CF6): `aria-hidden`, no `aria-label`, as in `lc-textarea`. The field's name is its label ("E-Mail-Adresse", was "E-Mail-Adresse required"); the native `required` state is announced once, in the screen reader's language.
- **One `*` gap**: 4 px (`--spacing-1`) in both fields at every size (was 5.69 px in `lc-input`, 3.69 px in `lc-textarea`), and the `*` can no longer wrap onto a line by itself.
- `requiredAriaLabel` (both) is deprecated and has no effect (G-CF3; `lc-textarea` never used it). It is kept so bindings compile.

### Fixed

- `lc-alert` stacked actions with an icon line up with the text at 200 % text (the indent is the 24 px icon, was `1.5rem`, 24 px too far); identical at 100 %.

### Compatibility

- No API breaks: new inputs are optional and their defaults render as before, except the `*` (name and gap above). `inputId`, `textareaId`, `errorId` and `helperId` are getters now; reading them is unchanged. Of 200 existing screenshots (alert, input, email-input, textarea) 168 are identical; the other 32 differ only where a `*` moved.
- Tests that match a required `lc-input` by `{ name: '… required' }` need the label alone. Don't rely on the format of generated ids.

### Migration

- life-os contact form: `controlId="contact-email"` / `"contact-message"` on the fields, `[announceError]="false"` under the summary, the address as `<a slot="action">` in the 503 / 429 alert; drop `requiredAriaLabel`.
