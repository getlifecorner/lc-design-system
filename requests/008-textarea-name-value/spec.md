# Spec 008: lc-textarea name and value for no-script posts

- **Status:** ready
- **Type:** extension of `lc-textarea` (G-CF1, G-CF3); proof test for `lc-input` (G-CF2)
- **Affected:** `libs/angular-ui-kit/src/lib/textarea/` (ts, html, spec, stories), `tools/compat/` (prerender check), CHANGELOG, both READMEs only if they list inputs
- **Semver impact:** minor (3.10.0). New optional inputs, defaults render as before. See AC-9 for the one behaviour to keep unchanged.

## Need

life-os website contact form (spec 002, `website-contact-form.md` §7). The form must work as a plain HTML post without JavaScript, and the server's 422/429/503 pages must re-render the form with the visitor's message kept (FR-006). Today the `<textarea>` inside `lc-textarea` has no `name`, so a no-JS post sends no message, and the component only takes its text from a form control or typing, so a server-rendered page cannot pre-fill it. The requester has no acceptable local workaround. Owner decision 2026-10-21: fix in the kit first as 3.10; life-os waits for the release.

## What the kit has today

| Item | State |
|---|---|
| `lc-input` `name` | `input<string>()`, bound as `[attr.name]`, unset = no attribute |
| `lc-input` `value` | `model<string>('')`, bound as `[value]="value()"` on the native input |
| `lc-input` `requiredIndicator` (default true), `requiredAriaLabel` (default `'required'`) | exist; the `*` carries `aria-label` |
| `lc-textarea` `name` | missing |
| `lc-textarea` `value` | a public `signal<string>('')`, not an input; `valueChange` is a separate `output<string>()` emitted only on user input; `writeValue` does not emit |
| `lc-textarea` template | `[value]="value()"` on the native textarea; the `*` is always `aria-hidden`, shown whenever `required()` |

So the pieces are partly there; whether `[value]` on a `<textarea>` ends up as text content in the prerendered HTML is not proven anywhere (no existing check; the compat template only has `<lc-textarea label="Notiz" />`).

## Scope

- In: `name` input; `value` as an input (or `model()`) that pre-fills the native textarea at prerender; `requiredIndicator` and `requiredAriaLabel` aligned with `lc-input` (G-CF3, non-breaking); a prerender proof for `lc-input` `value` (G-CF2); stories; changelog.
- Not in: `maxLength` on the contact form (D-CF3, a consumer decision); `autocomplete`/`spellcheck` etc. on textarea; the form itself; server-side form handling; any change to `lc-input` unless AC-6 fails.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `<lc-textarea name="message" />` renders `<textarea name="message">`; with `name` unset there is no `name` attribute. | unit test |
| AC-2 | `<lc-textarea value="Hello" />` renders the native textarea with the text `Hello` in the prerendered HTML (inside `<textarea>…</textarea>`), before JavaScript. Multi-line text with a leading newline, `<`, `&` and quotes survives unchanged and is escaped (no HTML injection). | prerender check in `tools/compat` (`EXPECT_IN_HTML`, page with `lc-textarea` name+value) plus unit test with server rendering if feasible |
| AC-3 | `value` is two-way bindable (`[(value)]`) and still works with `ngModel` / reactive forms; the form value wins after `writeValue`. Existing consumers reading `textarea.value()` still compile and get the string. | unit tests; existing specs unchanged and green |
| AC-4 | A real no-script post works: a prerendered `<form method="post">` with `<lc-textarea name="message" value="…">` serialises (`new FormData(form)`, and the browser with JS disabled) to `message=<text>`. Line breaks arrive as given. | unit test with FormData; one browser check with JS disabled recorded in `build.md` |
| AC-5 | With JS running (hydrated), `name` and pre-filled `value` stay intact; typing updates `value` and `valueChange`. | unit test |
| AC-6 | G-CF2: `<lc-input name="email" value="a@b.de" />` prerenders with `value="a@b.de"` on the native `<input>`. If it does not, `lc-input` is fixed in this release so that it does, and the changelog says so. | prerender check in `tools/compat` |
| AC-7 | G-CF3: `requiredIndicator` (default `true`) and `requiredAriaLabel` (default `'required'`) exist on `lc-textarea` with the same semantics as `lc-input`. With `requiredIndicator=false` there is no `*`. | unit test, story |
| AC-8 | Screen reader: with defaults a required textarea is announced once as required (native `required`/`aria-required`). The `*` exposes `requiredAriaLabel` the way `lc-input` does and the announcement is not doubled (designer decides `aria-hidden` vs `aria-label`, justified against `lc-input`; the interim claim in the concept is that the asterisk stays `aria-hidden`). German `requiredAriaLabel="Pflichtfeld"` verified. | unit test, designer review |
| AC-9 | Unchanged defaults: `<lc-textarea label="Notiz" />` renders the same DOM as 3.9.0 except any added attribute that is absent when unset. `valueChange` still emits once per user keystroke with the same value. Whether `writeValue` / programmatic changes now emit `valueChange` is decided in design (prefer: no emission from `writeValue`, as today); any change is listed in the changelog. | unit tests; existing specs unchanged |
| AC-10 | Stories for `name`, `value` (pre-filled, multi-line, German text), `requiredIndicator` off and `requiredAriaLabel` in German; argTypes have `description` and `table.defaultValue`. Checked at 360 px and 1280 px, light and dark; no layout change from the new inputs. | stories + `story-shots` |
| AC-11 | MCP manifest lists the new inputs with JSDoc and `@default`. | `npm run test:tools` |
| AC-12 | Compat matrix passes on Angular 21 and 22 (AOT, strictTemplates, prerender). | `check-angular-majors.mjs` |

Keyboard behaviour is unchanged (no new interactive element).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Changing `value` from `signal` to `model` (if the designer picks it) must keep `valueChange` as an output with the current payload; a `model` named `value` generates `valueChange` itself, so the existing `output` must be replaced, not duplicated.

## Assumptions

- Assumption: `value` as an input is required; `name` is `input<string>()` with no attribute when unset, like `lc-input`.
- Assumption: the design chooses `model()` vs plain input; AC-3 and AC-9 are the contract either way.
- Assumption: G-CF2 is expected to pass already; the test is added regardless and only a failure changes `lc-input`.
- Assumption: no semver risk beyond minor; the consumers' kit-pinning tests in life-os are not affected by an additive input.

## Open questions

None.

## Resolution

Not applicable: the kit lacks `name` and an input `value` on `lc-textarea`.
