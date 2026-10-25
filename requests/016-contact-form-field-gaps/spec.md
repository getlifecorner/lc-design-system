# Spec 016: Contact form field and alert gaps

- **Status:** ready
- **Type:** extension of `lc-input`, `lc-textarea`, `lc-alert` (G-CF4, G-CF6, G-CF7, G-CF8), bug fix (G-CF3, G-CF6)
- **Affected:** `lib/input/*`, `lib/textarea/*`, `lib/alert/*` (component, scss, stories, specs), `CHANGELOG.md`, `tools/compat/` (only if a prerender expectation is added)
- **Semver impact:** minor. New inputs are optional and their defaults render as before. The asterisk fix removes a redundant `aria-label` (a bug fix, see AC-6). No removed input, no changed default behaviour of a public input.

## Need

Page: the life-os website contact form (`/contact`, request 002 proof, 2026-10-25, concept `website-contact-form.md` section 7). Five findings, none blocking:

| Gap | Today | Effect |
|---|---|---|
| G-CF4 | `lc-input` builds its id with `Math.random()` (`lc-input-<random>`); `lc-textarea` uses a module counter (`lc-textarea-<n>`); neither has an id input | Every prerendered build differs, so each deploy re-uploads the site and ships a new `website-api` bundle. Random ids also differ between server and client render. No in-page links to a field (error summary). |
| G-CF3 | `lc-textarea` `requiredAriaLabel` is accepted, but the `*` is `aria-hidden`, so the text never reaches any name | A consumer who sets it (e.g. German) gets no effect. |
| G-CF6 | `lc-input` `*` has `aria-label="required"` next to native `required` + `aria-required`, so "required" is said twice. Gap before the `*`: 8 px (`--spacing-0-5` on `.required-indicator`, plus the label's whitespace) in `lc-input`, about 4 px in `lc-textarea` | Redundant speech; the two fields look different. |
| G-CF7 | Each field error is `role="alert"`; with an `lc-alert` summary (also `role="alert"`) a 422 page has three alerts | Errors are announced again after the summary. |
| G-CF8 | The only way forward in the 503/429 alert is an address link, an inline link about 16 px high | Passes the WCAG 2.5.8 inline exception but is hard to hit on a phone. |

## What the kit has today

- `lc-search-input` has `inputId = input<string>('lc-search-input-<n>')` (counter), the pattern the requester names.
- `lc-textarea` already has a counter id (`textareaId`, `errorId`, `helperId` derive from it), but no way to set it.
- `lc-alert` already has a projected action slot: `<ng-content select="[slot='action']">` inside `.lc-alert__action` (3.2, `actionsLayout` since 3.3). Its styles and stories cover `lc-button` only. `lc-button` has no `href` and renders a `<button>`, so it is not a link. A projected `<a slot="action">` gets no 44 px target and no link styling there today. Slot exists, link target does not (G-CF8 is therefore a styling extension, not a new slot).
- `lc-input` `inputId` is a plain public readonly property, not an input; consumers and specs may read it.

## Scope

- In: stable id on `lc-input` and `lc-textarea`, deterministic default id on `lc-input`; `*` hidden from assistive technology in both and one gap; a way to render a field error without `role="alert"`; a 44 px link in the `lc-alert` action slot.
- Not in: a new component (`lc-link`, error summary), `href` on `lc-button`, changing `lc-alert` roles, form validation logic, other form components (select, checkbox), focus management of the summary.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `lc-input` and `lc-textarea` accept an optional id input. When set, the control's `id`, the label `for`, and the ids of the error and helper elements (and `aria-describedby`) derive from it. Example: `id="contact-email"` gives `contact-email`, `contact-email-error`, `contact-email-helper`. The in-page link `<a href="#contact-email">` focuses the control. | unit tests (both components), story |
| AC-2 | Without the id input, `lc-input` ids are deterministic: `Math.random` is gone, ids come from a per-class counter like `lc-textarea` (`lc-input-<n>`). Two fresh renders in the same order give identical ids. The id has no random part. | unit test (render twice with counter state reset or order check; grep that no `Math.random` remains in `lib/input`) |
| AC-3 | Prerender: a page with two fields with explicit ids gives byte-identical HTML across two builds and the client hydrates without an id mismatch (no NG0500-type error, ids unchanged after hydration). Fields without explicit ids: ids identical on server and client for the same order. | `tools/compat` consumer prerender grep for the explicit ids in the HTML; hydration check in the compat run |
| AC-4 | The existing `lc-input` public property `inputId` still exists with the same type and meaning (a string with the control's id). No API break: reading it in existing code and specs works. Designer decides the new input's name (it must not replace the property, see Assumptions). | existing specs pass unchanged; type check in the compat consumer |
| AC-5 | G-CF3: `lc-textarea` `requiredAriaLabel` is documented truthfully. Either it works, or its JSDoc and story say it has no effect and why (native `required` announces it). Designer chooses; the outcome must not leave an input that silently does nothing. The input stays accepted (no removal). | JSDoc / argType description review; unit test of the chosen behaviour |
| AC-6 | G-CF6: with `required` and `requiredIndicator`, the `*` in `lc-input` is `aria-hidden="true"` and has no `aria-label`, as in `lc-textarea`. The control still has `required` and `aria-required="true"`, so its accessible description/state says "required" exactly once. `requiredAriaLabel` of `lc-input` keeps being accepted (see AC-5 for its docs). | unit test (attribute asserts); screen reader check on one story (NVDA or VoiceOver says "required" once) |
| AC-7 | G-CF6: the horizontal gap between label text and `*` is the same in `lc-input` and `lc-textarea` at `xs`..`lg` sizes, measured in px (any one agreed value, recommended 4 px, the textarea's current value). | `--measure` on both stories at 360 and 1280 px; value in `build.md` |
| AC-8 | G-CF7: a new optional input on `lc-input` and `lc-textarea` renders the error message without `role="alert"`. The message stays visible, stays linked by `aria-describedby`, `aria-invalid` stays set. Default (input not set): `role="alert"` exactly as today. | unit tests (role present by default, absent with the input); story "error under a summary" with `lc-alert` plus two fields: exactly one `[role=alert]` in the DOM |
| AC-9 | G-CF8: a link `<a slot="action" href=…>` projected into `lc-alert` renders with a hit area of at least 44 px height (and 44 px width) in all four variants, link colour tokens with contrast 4.5:1 against the variant background (light and dark), a visible `:focus-visible` ring, and the underline cue (not colour alone). The visible text is the link text; no change to `lc-button` behaviour. | story at 360, 1024 and 1280 px, `--measure` of the anchor's bounding box, contrast computed per variant and theme |
| AC-10 | AC-9 holds in `actionsLayout="inline"` and `"stacked"`, with a long German address text (for example `Schreiben Sie uns direkt an kontakt-formular-adresse@beispiel-firma.example`) that wraps or breaks without horizontal scroll at 360 px, also at 200 % text size. | story at 360 px with the German text, `scrollWidth <= clientWidth` measure |
| AC-11 | Keyboard and screen reader: tab order is control, then link in DOM order; an alert with a link announces once as `role="alert"` (error, warning) or `status`; the link is reachable and activates with Enter. The `*` and errors in AC-6 and AC-8 are read once. | unit test for DOM order and roles; manual screen reader note in `review.md` |
| AC-12 | Light and dark, `forced-colors` and `prefers-reduced-motion`: the link in AC-9 and the `*` stay visible (forced-colors uses system colours), no motion added. | story in both themes, forced-colors check |
| AC-13 | EN and DE: no new built-in text. Any new label (if the designer adds one) is a `locale` or label input with an English default. German field labels and errors (`Name`, `E-Mail-Adresse`, `Nachricht`) do not clip at 360 px. | story with German strings at 360 px |
| AC-14 | Unchanged defaults: without the new inputs, existing stories and specs of `lc-input`, `lc-textarea` and `lc-alert` pass unchanged, except the asserts about the asterisk's `aria-label` and its gap (AC-6, AC-7), which change for the stated reason. Layout of existing stories at 360 and 1280 px differs only by the asterisk gap. | full unit test run, `story-shots --compare` against design baselines |
| AC-15 | Every new input has JSDoc with `@default` and a story with an argType description and `table.defaultValue`. The MCP manifest picks them up. | `npm run test:tools`, story review |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Counter ids are acceptable only because they are deterministic; the explicit id is the guarantee consumers rely on for stable builds.
- Use tokens only; the gap in AC-7 comes from a token.

## Assumptions

- Assumption: G-CF3 and G-CF6 are one decision. The `*` is decorative in both components (native `required` and `aria-required` carry the meaning), so `requiredAriaLabel` is kept for compatibility but has no visible effect; the designer documents it (AC-5). Reason: a non-hidden `*` is what makes "required" be spoken twice.
- Assumption: the new id input must not collide with the existing `inputId` property of `lc-input` (a plain field). Recommended: the designer picks a name such as `controlId` or `id` handled without a host `id` attribute, and keeps `inputId` readable; if only a rename of the property would work, that is a major and goes to the owner.
- Assumption: G-CF8 needs no new slot; the existing `slot="action"` is used and the link styling is added for an `a` child. A new component or `href` on `lc-button` is out of scope.
- Assumption: the error-without-role input is a boolean-like input on the field (name by designer). `lc-alert` is not changed for G-CF7.
- Assumption: the requester's page is built with prerendering, so AC-3 is checked with the compat consumer, not only in Storybook.

## Open questions

None.

## Resolution

Not applicable: the gaps are real. Partial: until 3.12 the contact form can already project `lc-button` in the alert's `slot="action"`, but it renders a button, not a link.
