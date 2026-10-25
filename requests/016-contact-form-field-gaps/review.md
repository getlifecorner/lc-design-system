# Review 016: Contact form field and alert gaps

## Round 1 — 2026-10-25, commit 3762413 (`libs`/`tools` = 127caeb)

Screenshots are in `tmp/story-shots/016/`:

- `r1`: the 50 unchanged stories at 360 and 1280 px, light and dark, compared against `baseline`.
- `r1-new`: the 5 new stories. The link stories were also shot at 1024 px.
- `r1-200` and `r1-200-err`: 200 % root text.
- `r1-axe`: the axe run.
- `r1-proto`: the finding 1 prototype.

Logs are in `tmp/016/r1-*.log`, and the screen-reader pass is in `tmp/story-shots/016/r1-ax-360.log`. I rebuilt Storybook once with `--skip-nx-cache`, because story-shots refused the build: the only newer source was the test-only `i18n-labels.spec.ts`. I opened 12 shots.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | **Ids:** `contact-name`, `contact-email` and `contact-message`. The label `for` matches in all 3, and `aria-describedby` = `<id>-error` (`r1-fields`). **Links:** Enter on `#contact-email` focuses `contact-email`, and on `#contact-message` it focuses `contact-message` (AX pass). |
| AC-2 | pass | Generated ids `lc-input-0…3` and `lc-textarea-0…3` follow creation order (*Required Asterisk*). `Math.random` remains only in the spec that asserts its absence. |
| AC-3 | pass (developer evidence) | Compat 22: 68/68, a second build byte-identical, 15 ids equal after hydration (build.md). Not re-run. |
| AC-4 | pass | `get inputId(): string` returns `controlId` or the generated id. The existing specs pass unchanged (Jest 4316 passed). |
| AC-5 | pass | `@deprecated` JSDoc and a "Deprecated, no effect (3.12)" argType on both fields. The manifest carries the description. |
| AC-6 | pass | All `*` have `aria-hidden="true"` and no `aria-label` (15 labels in 5 stories × 4 shots). The AX tree exposes 0 `*` text nodes. The name is the label only, and the state is `required` (see the screen-reader pass). |
| AC-7 | pass | The gap is **4.00 px** for all 11 labels (*Required Asterisk* 8, input *Required* 1, textarea *No-Script Contact Form* 2) at 360 and 1280, light and dark. The `*` sits on the label's last line in every case. |
| AC-8 | pass | `[role=alert]` count: 1 in *Error Summary* (4 shots), 0 in *Error without Alert Role*. The errors keep their ids and `aria-describedby`, with `aria-invalid="true"`. |
| AC-9 | pass | **Size:** the link is 44 px high (63 inline at 360, 3 rows) and at least 177.2 px wide. **Contrast** on the story canvas: min 4.78 light (error), 9.47 dark (warning). The design minimum of 4.56 on background-low stands. **Cues:** a 1 px underline, and a `:focus-visible` ring of 2 px solid, offset 2, ≥ 3.36 / 8.0. Link vs text: 2.86 / 1.47. |
| AC-10 | pass, finding 2 | **360, 100 %:** doc 0, alerts 0, link x 69 = text x. **200 %:** doc 0, link x 113 = text x, inline link h 294. The stacked 503 alert is +4 (finding 2). **1024 / 1280:** link right of the body, w 479 / 529.6. |
| AC-11 | pass (AX tree) | See the screen-reader pass below. |
| AC-12 | pass | Both themes are in the shots. No `forced-color-adjust` in the alert, input or textarea styles. The ring is an `outline`, which stays visible in forced colours. No transition on the link. |
| AC-13 | pass | *Error Summary*: 0 labels, errors or titles clipped at 360 in either theme. No new built-in text. |
| AC-14 | pass | **Shots:** 200 shots, 168 identical. The 32 that differ are the 8 stories with a `*`. **Pixels:** all 200 are byte-identical to the developer's `build/` shots, whose pixel diff shows only 5 px bands at each `*` (`tmp/016/diff.log`). Opened: `form-input--contact-form` 360 light. **Alerts:** all 44 shots identical. |
| AC-15 | pass | JSDoc `@default`, and argTypes with `table.defaultValue`. The manifest test (22/22) lists `controlId` and `announceError` on both fields. |

axe 4.14 on the 5 new stories × 360/1280 × light/dark: **0 violations** (20 shots).

### Screen-reader pass (AC-6, AC-8, AC-11)

Method: `tmp/story-shots/016/ax-pass.mjs`, at 360 px.

- Chromium's accessibility tree over CDP (`Accessibility.getFullAXTree`), which is what VoiceOver and NVDA read through the platform API.
- Real Tab key presses from the top of the page.
- Enter on every link.

No audible screen reader was run (finding 5).

| Story | What the reader gets | Tab order | Enter |
|---|---|---|---|
| Error Summary | **Live regions:** one, alert "Bitte prüfen Sie zwei Angaben" (assertive), which holds the 2 links. **Fields:** textbox "Name" [required]. Textbox "E-Mail-Adresse" [required, invalid], description "Geben Sie eine E-Mail-Adresse wie name@beispiel.de ein". Textbox "Nachricht" [required, invalid], description = its error. **Errors:** no live region, so each is read once, with its field. | 2 summary links → Name → E-Mail-Adresse → Nachricht | focus lands on `contact-email` / `contact-message` |
| Required Asterisk | 8 textboxes, each named by its label alone, with `required`. "Required" is spoken once, from the state; until 3.11 the name was "… required". | DOM order | — |
| Error without Alert Role | Textbox "Nachricht" [required, invalid], with the error as its description. 0 live regions. | the one field | — |
| Link Action / Stacked | 2 × `status` (polite) and 2 × `alert` (assertive). Each holds its title, message and link, and the link is not a live region of its own. | Body → link → close (info). 503: "Erneut senden" → link. | all 8 links activated |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix | `form-input--error-summary`, all widths | The summary links are 44 px targets (the kit rule, as for the alert's own link), flush with the title. Prototype (`r1-proto`): `<ul style="list-style: none; margin: 4px 0 0; padding: 0">` with `<a lcButton variant="link" size="sm" [flush]="true" href="#…">` gives x 69, h 44, 14 px, 4.78 : 1 light / 11.39 : 1 dark. The design was wrong here (design.md change r1). | The `[inline]` links are 17 px high, 4 px apart and indented to x 85 (title x 69) in a list without markers. Their centres are 21 px apart, so the 24 px circles of WCAG 2.5.8 overlap. axe doesn't flag it. |
| 2 | should-fix (follow-up) | `feedback-alert--link-action-stacked` 503, 360, 200 % text | Nothing crosses the alert's border. | **Button:** `lc-button lg` "Erneut senden" has a min-content of 218.3 (48 px padding on each side + "senden") in a 182 px column (113–295). It is 36.3 px over the column, and its right edge at 331.3 is **3.3 px past the border** (328). The link's column grows with it, so the address ink ends at 328. **Impact:** doc 0, nothing clipped; AC-10's "no horizontal scroll" holds. **Pre-existing class:** `stacked-actions` (3.3) at 360 / 200 % is doc +14 and alert +47; 3.12's px indent already took 24 px off. **Decision on build.md's note:** the story stays as it is, because it is the real 503 case. A story workaround makes it worse: `anywhere` breaks "Erneut" mid-word, and `md` is 40 px high. **Follow-up request:** stacked actions at large text, e.g. drop the icon indent under a rem-based container width, and `min-width: 0` on the action column. build.md's "3.3 px wider than its column" is really 36.3 px; the 3.3 px is past the border. |
| 3 | nit | `form-input--error-summary` | The textarea has the inputs' size (md). | `size="lg"` from design §8: the value is 18 px at x 37 next to 16 px at x 33. Fix it with finding 1 (design change r1). |
| 4 | nit (pre-existing, follow-up) | lc-textarea vs lc-input errors | The same distance below the field. | The input error is 4 px below its field, the textarea error 20 px (lc-textarea footer). Not in 016's scope. |
| 5 | nit | AC-6, AC-11 | An audible VoiceOver or NVDA check. | AX-tree pass only: an agent can't drive a screen reader without changing system settings. Optional owner spot-check: Tab through `form-input--error-summary` with VoiceOver and confirm that "required" and each error are said once. |

API check against §2: names, types, defaults, JSDoc, `@deprecated`, getters, argTypes and story ids all match. No other deviation.

**Verdict:** changes requested (finding 1; nit 3 goes in the same edit). The fix is story-only and touches no library code. Afterwards, re-shoot `form-input--error-summary` at 360 and 1280, light and dark, and measure: links x 69, h ≥ 44, `[role=alert]` 1, focus after the click on `contact-email` / `contact-message`.

## Round 2 — 2026-10-25, commit e79a794 (`libs`/`tools` = 127caeb + `input.stories.ts` *Error Summary* only)

Scope: the story change for findings 1 and 3. `git diff 127caeb e79a794 -- libs tools` is that one template (4 lines), so the round 1 compare, the API check and the other ACs stand. The Storybook build was current, so I reused it. Shots are in `tmp/story-shots/016/r2-review/` (360/1024/1280 × light/dark, with `--axe`), and the AX pass is in `tmp/story-shots/016/r2-ax-360.log`. I opened 2 shots (360 light and dark).

| AC / finding | Result | Evidence (all 6 shots unless noted) |
|---|---|---|
| Finding 1 | fixed | **Links:** x 69 = text x = title text x 69. **Boxes:** h 44, w 104 / 66.1, y 54.5 / 98.5 (centres 44 apart, no overlap). Text 14 px / 600. **Contrast:** 4.78 light / 11.39 dark (composited on the alert). **Ring:** solid 2 px, offset 2, 3.36 / 9.62. **200 % at 360:** text x 113 = title x, h 102 / 88 ("E-Mail-Adresse" wraps at its hyphen), doc 0, alert 0, clipped 0 |
| Finding 3 | fixed | All three values 16 px at x 33. The textarea is md (h 98) |
| AC-1 | pass | Enter on each link (AX pass, real keys) focuses `contact-email` / `contact-message`, and so does `click()` in all 6 shots. Tab order: the 2 links → Name → E-Mail-Adresse → Nachricht |
| AC-8 | pass | `[role=alert]` 1. Both errors have no `role`, are in `aria-describedby` and have `aria-invalid="true"`. AX: one live region, assertive, holding the title and the 2 links |
| AC-11 | pass (AX tree) | Names, descriptions and states are as in round 1. 0 `*` text nodes |
| AC-13 | pass | 0 labels, errors, title or links clipped, doc 0, at every width |
| axe 4.14 | 0 violations, 0 incomplete | 6 shots |
| build.md *Round 2* | confirmed | All values match: x 69, h 44, 4.78 / 11.39, 1 alert, focus, 16 px at x 33 |

### Findings (round 2)

Findings 1 and 3 are closed. Findings 2 and 4 (follow-up) and 5 (an optional spot-check by the owner) stay open as written in round 1.

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 6 | nit (optional) | `form-input--error-summary`, alert spacing | The space below the last link matches the 16 px above the title. | About 30 px from the "Nachricht" ink to the border, because a 44 px box around 14 px text leaves about 15 px of slack under it, plus the 16 px padding. This is the cost of the target, the same as for the 006 flush link. A consumer can use `margin-bottom: -12px` on the list: the box then reaches into the padding and stays 4 px inside the border. No change needed for 3.12 |
| 7 | nit (optional) | the same list | The list is announced as "list, 2 items" in every browser. | `list-style: none` makes Safari/VoiceOver drop the list role. Chromium keeps it (`list ""` in the AX log). Add `role="list"` to the `<ul>` the next time the story is touched |

**Verdict:** approved. No must-fix. The library code is unchanged since round 1, where every AC passed. Next is the release of 3.12.0, with should-fix 2 and nits 4–7 listed in it.
