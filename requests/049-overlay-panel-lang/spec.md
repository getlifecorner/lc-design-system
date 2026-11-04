# Spec 049: Overlay panel language (datepicker, date-range-picker, combobox)

- **Status:** ready
- **Type:** bug fix (accessibility, WCAG 3.1.2)
- **Affected:** `lc-datepicker` (`datepicker.component.{ts,html}`, spec, story), `lc-combobox` (`combobox.component.{ts,html}`, spec, story), `lc-date-range-picker` (verify only, see AC-5), `CHANGELOG.md`
- **Semver impact:** patch. No new input, no API change; only a `lang` attribute is added to existing panels. Rendered text and layout stay the same.

## Need

Source: follow-up 048-f1 (review of 048, owner rule: fixable findings go into the pipeline). Consumer pages set the language on a wrapper (`<main lang="de">`) or pass `locale="de-DE"` to `lc-datepicker`. The panel of `lc-datepicker` and the dropdown of `lc-combobox` are rendered by the CDK into `.cdk-overlay-container` under `<body>`, outside that wrapper. Their German texts (month and day names, "Heute", nav and clear labels) are therefore announced with the page's `en` rules by screen readers (WCAG 3.1.2 Language of Parts, AA). Pre-existing; the 3.30.1 day-button names made it more audible. No width or theme dependence; this is DOM and ARIA only.

## What the kit has today

| Item | State |
|---|---|
| `lc-datepicker` | `locale` input (default `''`) drives month and weekday names and day-button names. The panel is a `cdkConnectedOverlay` (`datepicker.component.html:71`) with no `lang`. |
| `lc-combobox` | Overlay at `combobox.component.html:66`. It has **no** `locale` input; its texts (`clearAriaLabel`, `createOptionLabel`, option labels) are set by the consumer. No `lang` on the dropdown. |
| `lc-date-range-picker` | `locale` input (default `de-DE`). No `cdkConnectedOverlay` in its template: the panel is rendered inside the host, so it inherits the host's `lang` through the DOM. |
| Resolution by the consumer | Possible only with a global `OverlayContainer` `lang` workaround, which a consumer should not need. |

## Scope

- In: the datepicker panel and the combobox dropdown carry a `lang` attribute that matches the host's language context. Specs and a story or measure per AC. Changelog entry (*Fixed*).
- Not in: a new `lang` or `locale` input; a `locale` input on the combobox; localising the English defaults (backlog 048-n2); an app-wide `OverlayContainer` change; other overlay components (tooltip, menu, dialog, etc.; see the assumption below).

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | With an ancestor `[lang="de"]` of `lc-datepicker`, the open panel root (the `role="dialog"` element in the overlay) has `lang="de"`. The value is the closest `[lang]` of the host, read when the panel opens. | unit test (host inside `<div lang="de">`, open, query the overlay container) |
| AC-2 | With no `[lang]` ancestor and `locale="de-DE"`, the panel has `lang="de-DE"`. | unit test |
| AC-3 | With no `[lang]` ancestor and no `locale`, the panel has **no** `lang` attribute (it inherits the document language, as before). | unit test |
| AC-4 | `lc-combobox` dropdown (`.lc-combobox__dropdown`, `role="listbox"`) has the closest `[lang]` of the host, and no `lang` attribute when there is none. | unit test, both cases |
| AC-5 | `lc-date-range-picker`: a test pins that the open panel's computed language is the host's closest `[lang]`, and `de-DE` where none exists and `locale` is the default. The `lang` is set on the panel only if this does not already hold through DOM inheritance. | unit test (`el.closest('[lang]')` check on the panel) |
| AC-6 | A host `lang` change while the panel is closed shows in the next opening (no stale value). | unit test |
| AC-7 | Unchanged defaults: no other attribute, class or text changes on the three components. The existing specs pass without edited assertions; the datepicker snapshot of the closed field has no new `lang`. | existing tests green; no assertion edits |
| AC-8 | Keyboard and screen reader: focus order, `aria-*`, roles and labels are unchanged. The `lang` on a panel with German content is exposed in the accessibility tree. | story `form-datepicker--label-de` measured with `--measure` (`panel.getAttribute('lang')` and `closest('[lang]')`) at 360 and 1280, light and dark |
| AC-9 | EN and DE: story with an English page plus a `lang="de"` wrapper shows both panels (datepicker and combobox) with the right `lang`. Layout at 360 and 1280 is unchanged (same panel box size as before). | story + `story-shots --measure`; compare by hash with the baseline |
| AC-10 | Prerendered HTML before JavaScript: the overlay is not rendered on the server; the compat check output is unchanged (`EXPECT_IN_HTML` untouched). | `check-angular-majors.mjs` in CI |
| AC-11 | The changelog has a *Fixed* entry that names 048-f1, states there is no API break, and shows the closest-`[lang]`-then-`locale` rule. | changelog review |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break. The lookup uses the DOM (`closest('[lang]')` on the host element) with SSR safety, since there is no document on the server (guard with the platform check or run it only when the panel opens).
- No new public input or CSS hook.

## Assumptions

- Assumption: the closest `[lang]` of the host wins over `locale`, as the release note of 048-f1 states ("the host's closest `[lang]`, else `locale`"). If a consumer sets `lang="en"` and `locale="de-DE"` on purpose, month names stay German but are marked `en`; that conflict is the consumer's. The designer may suggest otherwise only through a question to me.
- Assumption: `lc-combobox` is in scope for `lang` only (no `locale` input); its dropdown text is consumer-supplied, so the host's context is the right source. The request text says "combobox with `locale`", but there is no such input.
- Assumption: `lc-date-range-picker` needs no code change if its panel is in the host (AC-5 proves this); the developer sets the attribute only if the test shows it fails.
- Assumption: other CDK overlays in the kit (tooltip, menu, select, dialog) are the same class of bug but are not named by the request. The developer lists them in `build.md` → known limits so the release-manager can route them to the backlog. Not in this version.
- Assumption: no backlog row for these components is folded in as an AC. The rows 047-n1/n2/n3 (panel gap, 8 px push, 200 % text) are layout nits; 048-n2 (story English defaults) is a story fix. They are left in `requests/BACKLOG.md`, because folding them would widen a patch. If the developer touches the *Label (DE)* story for AC-8/AC-9, adding 048-n2's German labels there is welcome but not required.

## Open questions

None.
