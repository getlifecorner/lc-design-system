# Design 016: Contact form field and alert gaps

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-15 · target 3.12.0 (minor)
- **Probes** (main ef17aec, Storybook build 02:04): `tmp/story-shots/016/probe-gap2`, `probe-inline2`, `probe-inline3`, `probe-stacked3`. Baselines: `tmp/story-shots/016/baseline` (50 stories, 360/1280, light/dark, 200 shots, not `--full`).
- **Change r1 (review 016 r1, 2026-10-25):** §8 *Error Summary* was wrong. Its `[inline]` summary links were 17 px high and 4 px apart, against the kit's 44 px rule, and the textarea `lg` (18 px) sat next to `md` inputs. Both are corrected in §8 and §9. §9 AC-10: the stacked 503 alert at 360 px and 200 % text overflows its own box by 3.3 px. The `lg` button causes it, not the link. It is a known limit that goes to a follow-up (review finding 2).

## 1. Approach

Extend `lc-input`, `lc-textarea` and `lc-alert`; no new component, entry or token.

- **Ids (G-CF4):** an optional `controlId` input on both fields. `inputId` (lc-input) and `textareaId`/`errorId`/`helperId` (lc-textarea) stay public `string` members and become getters that return the resolved id, so reading them works as before (AC-4). Not `id`: a static `id="x"` on the host also stays on `<lc-input>`, giving two elements with the same id (the `lc-checkbox` trap). Not an alias `inputId`: the MCP extractor doesn't read aliases. The default id uses a module counter, as in `lc-textarea`, `lc-slider` and `lc-number-input`. A per-app counter (a root service) was rejected: every Storybook story is its own app, so a Docs page would get 14 copies of `lc-input-0` and the label `for` would point at the wrong story.
- **Asterisk (G-CF3, G-CF6):** one decision for both fields. The `*` is decorative (`aria-hidden`), and the native `required` + `aria-required` carry the state, which the screen reader speaks in its own language. `requiredAriaLabel` stays accepted, is marked `@deprecated` (precedent: tabs, verification-code-input), and its JSDoc and argType say it has no effect and why. The gap comes from a token: no space before the `*`, then `margin-inline-start: var(--spacing-1)` (4 px). A side effect is that the `*` can no longer wrap onto a line by itself.
- **Quiet error (G-CF7):** an `announceError` boolean (default `true`) on both fields. `false` drops only `role="alert"`, the pattern of the existing `role` choice in `lc-alert`.
- **Alert link (G-CF8):** the existing `slot="action"`, with styles for a plain `<a>` projected there. `a[lcButton]` (ButtonLinkComponent, which the spec missed) already gives a link that looks like a button in that slot, so it keeps its `.btn` styles and is excluded from the new rule. The text-link look follows `.btn.btn-inline` (underline at rest, thicker on hover) and the 44 px flush link (`.btn-link.btn-flush`).

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (lc-input) | `controlId` | `string \| undefined` | `undefined` → generated `lc-input-<n>` | Id of the native `<input>`. The label's `for`, the error (`<id>-error`), the helper text (`<id>-helper`), the label id (`<id>-label`) and `aria-describedby` derive from it, so an error summary can link to the field (`<a href="#contact-email">`) and prerendered HTML is the same in every build. Unique in the document, no spaces. Unset (or empty) = a generated `lc-input-<n>`, which follows creation order (on the server it keeps counting across prerendered routes): set it on prerendered pages. `@default generated (lc-input-<n>)` |
| input (lc-textarea) | `controlId` | `string \| undefined` | `undefined` → `lc-textarea-<n>` | Same text, with `<textarea>` and `lc-textarea-<n>`. |
| input (both) | `announceError` | `boolean` | `true` | Announce the error message the moment it appears (`role="alert"` on the message). Set `false` when an `lc-alert` error summary above the form already announces the errors (a page re-rendered after a failed submit, e.g. 422), so they aren't read twice. The message stays visible, stays linked through `aria-describedby` (read with the field), and the control keeps `aria-invalid`. `@default true` |
| input (both), deprecated | `requiredAriaLabel` | `string` | `'required'` | `@deprecated` No effect since 3.12 (lc-input) and always (lc-textarea). The `*` is decorative and hidden from assistive technology, because the native `required` state is announced already, in the screen reader's language; a name on the `*` made fields say "required" twice. Kept so existing bindings compile. `@default 'required'` |
| member (lc-input) | `inputId` | `get inputId(): string` | — | Resolved id of the native control: `controlId`, or the generated `lc-input-<n>`. Read-only, same meaning as before. |
| member (lc-textarea) | `textareaId`, `errorId`, `helperId` | getters, `string` | — | `controlId` or `lc-textarea-<n>`; `<id>-error`; `<id>-helper`. |
| slot (lc-alert) | `a[slot="action"]` (any `<a>` without `.btn`) | — | — | 3.12: a text link as the one way forward (an address or a help page). Gets a 44 × 44 px target, link colour, an underline and a focus ring. For a link that looks like a button, use `<a lcButton slot="action">`. |
| CSS hook | none | — | — | No new hooks. The link uses existing tokens only. |
| type | none | — | — | No new exported types. |

Counter: `let nextUniqueId = 0` in `input.component.ts`, incremented once per instance in a field initialiser (always, even with `controlId`), giving `lc-input-${n}` from 0, like `lc-textarea`. `Math.random` is gone from `lib/input` (AC-2).

**Default rendering unchanged:** without the new inputs, the DOM is identical except (a) generated `lc-input` ids, a counter instead of random (not visible), (b) the `*` in lc-input: `aria-hidden="true"` instead of `aria-label`, and (c) the `*` gap, which is 4.00 px in both fields (was 5.69 in lc-input and 3.69 in lc-textarea, `probe-gap2`). The colour of the `*` is unchanged (lc-input `--color-error-600` 8.39:1, lc-textarea `--color-text-error` 12.59:1 light; both #f7a1a1 9.48:1 dark), so this request does not unify it. Alert rules match only `.lc-alert__action > a` without `.btn`, so alerts with `lc-button` or `a[lcButton]` render as before.

## 3. Anatomy and layout

### Fields: label and `*` (all sizes, 360 and 1280 alike)

```
E-Mail-Adresse␣*      today: lc-input text┊␣(3.69)+2 px┊*  = 5.69 · lc-textarea text┊␣┊* = 3.69
E-Mail-Adresse·*      new (both): text┊4 px margin┊*  = 4.00 px, no text node between them
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Label (both) | lc-input mb 4, lc-textarea gap 8 (unchanged) | 14 / 500 | `--font-size-sm`, `--font-weight-medium` |
| `*` gap | `margin-inline-start` 4 px, no space before it | inherits the label | `--spacing-1` |
| Template | `{{ label() }}@if (required() && requiredIndicator()) {<span … aria-hidden="true">*</span>}`, so no whitespace between the text and the `@if` | — | — |

### Alert with a link, 360 px (alert 328 wide, content 258 at x 69)

```
inline (alert < 36rem: the link drops below)  │  stacked (and inline < 36rem: the same row)
┌──────────────────────────────────────┐      │  ┌──────────────────────────────────────┐
│16│(i)24│12│Wir können … nicht    │×│16│      │  │ (i) Title / message (x 69, w 258)    │
│  │     │  │senden. (x 69, w 258) │ │  │      │  │     [  Erneut senden  ] 48.5 full w  │ ← lc-button
│  │     │  ↓ 12 gap + 4 margin            │      │  │     ↓ 8                              │
│  │     │  Schreiben Sie uns direkt an │      │  │     Schreiben Sie uns direkt an      │
│  │     │  kontakt-formular-adresse@   │ 63   │  │     kontakt-formular-adresse@        │
│  │     │  beispiel-firma.example      │      │  │     beispiel-firma.example (fit, ≤258)
└──────────────────────────────────────┘      │  └──────────────────────────────────────┘
```

### From 1024 px (alert ≥ 36rem, inline): the link is right of the body

```
┌ 16 ─(i)─12─ body (flex 1) ─────────────12─ link (≤ 50 % of the content box, centred) ─16┐
1024: alert 992, link x 512, w 479 (2 rows, h 44) · 1280: alert 1248, link x 717.4, w 529.6 (1 row)
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Link box `.lc-alert__action > a:where(:not(.btn))` | `display:flex; align-items:center; width:fit-content; max-width:100%; min-height 44; min-width 44`; no padding (text flush with the body text) | 14 / 600 / 21 | `--size-min-touch-height/-width`, `--font-size-sm`, `--font-weight-semibold`, `--line-height-normal` |
| Underline | `underline`, `max(1px, 0.0625em)`, offset `0.15em`; on hover `max(2px, 0.125em)` | — | as `.btn.btn-inline` |
| Breaking | `overflow-wrap: anywhere`, `text-align: start` (addresses break at `-`/`@` first) | — | — |
| Focus ring | `outline 2px solid`, offset 2, radius 10 | — | `mix.focus-ring`, `--color-primary-500`, `--border-radius-sm` |
| Inline ≥ 36rem | `.lc-alert__action:has(> a…)`: `flex-shrink:1; min-width:0; max-width:50%`, still `align-self:center` | — | — |
| Inline < 36rem | host `container: lc-alert / inline-size` only when such a link is present (`.lc-alert:has(> .lc-alert__container > .lc-alert__action > a…)`). In `@container lc-alert (width < 36rem)`: container `flex-wrap:wrap`, body `flex:1 1 0`, action `order:1; flex:1 1 100%; max-width:none; margin-top 4`, and with an icon `padding-inline-start: calc(24px + gap)` | — | `--spacing-1`, `--spacing-3` |
| Stacked | existing rules; the link hugs its text (`fit-content` beats `align-items: stretch`); next to buttons from 36rem, centred | — | — |
| Icon indent, fix | stacked `padding-inline-start: calc(1.5rem + gap)` → `calc(24px + gap)`: the md icon is 24 px at any text size, so at 200 % the action row was 24 px right of the text (113 vs 137, `probe-inline3`). Identical at 100 %. | — | — |

## 4. States

| State | Fields | Alert link |
|---|---|---|
| default | the `*` hidden from AT, 4 px gap; error `role="alert"` unless `announceError=false` | `--color-link`, 1 px underline |
| hover | — | `--color-link-hover`, 2 px underline, no transition |
| focus-visible | unchanged | 2 px ring `--color-primary-500`, offset 2, radius 10 |
| active / visited | — | as hover / as default (no `:visited` rule, the `mailto:` stays as it is) |
| disabled / loading | unchanged; a link has neither (use plain text) | — |
| error | quiet error: same pixels, no role | — |
| overflow | a long German label wraps, and the `*` stays on the word ("Nachricht*"). DE errors wrap in `.input-footer` | address: 3 rows at 360 (63 px), 7 rows at 200 %, no horizontal scroll (doc 0, alert 0 in all probes) |
| many items | — | stacked: a button and a link in one row from 36rem, gap 8 |

## 5. Theming

Contrast computed in the browser (WCAG), translucent variant fills composited over each base: canvas / surface / surface-2 / raised / background-low (`probe-inline2`).

| Element | Light | Dark | Contrast light · dark (min over bases) |
|---|---|---|---|
| Link on info | `--color-link` #1a6a79 | #a3d5df | 4.73 · 7.91 |
| Link on success | ″ | ″ | 5.35 · 7.38 |
| Link on warning | ″ | ″ | 5.34 · 7.03 |
| Link on error | ″ | ″ | **4.56** (bg-low) · 9.01 |
| Hover `--color-link-hover` | #144f5b | #c1e3e9 | ≥ 6.70 · ≥ 8.25 |
| Focus ring `--color-primary-500` | | | ≥ 3.21 · ≥ 5.94 (3:1 needed) |
| Link vs body text | | | 2.86 · 1.47, so the underline carries the difference (1.4.1) |
| `*` | unchanged (see §2) | | 8.39 / 12.59 · 9.48 |

No new tokens.

## 6. Accessibility

- **Names:** lc-input `required` gives the name "E-Mail-Adresse" and the state "required" once (today axe gives "Company Name required" plus the state). The `*` is `aria-hidden="true"` with no `aria-label` in both fields.
- **Errors:** `announceError=false` → the `<p>`/`<span>` has no `role`, keeps its id, and stays in `aria-describedby`; `aria-invalid="true"` stays. On a 422 page the only `[role=alert]` is the `lc-alert` summary.
- **In-page links:** `href="#<controlId>"` scrolls to and focuses the native control (the HTML "scroll to the fragment" steps). With `readonlyWrap` the `<input>` is hidden, so don't link to a read-only field.
- **Keyboard:** the link is a native `<a href>`, so Enter activates it. Tab order follows the DOM: body content links → action link → close button. When the link drops below at < 36rem, the close button sits top right but comes after the link, as in the existing stacked layout.
- **Targets:** the link box is ≥ 44 × 44 (177.2 × 44 for a short address).
- **forced-colors:** nothing is overridden. `a[href]` → LinkText, the underline stays, and the outline maps to a system colour. The `*` → CanvasText. No `forced-color-adjust: none`.
- **Reduced motion:** no transition or animation is added.
- **Announcement:** the alert's role stays `alert` (error, warning) or `status`, and its link text is part of the alert's content.

## 7. Texts

No new built-in text (AC-13). The story strings: Name, E-Mail-Adresse, Nachricht; summary "Bitte prüfen Sie zwei Angaben"; errors "Geben Sie eine E-Mail-Adresse wie name@beispiel.de ein", "Schreiben Sie uns mindestens 20 Zeichen"; link "Schreiben Sie uns direkt an kontakt-formular-adresse@beispiel-firma.example". `requiredAriaLabel` EN `required`, DE `Pflichtfeld` is now inert (documented).

## 8. Stories

| Story | Expected ID | Args / content | Shows |
|---|---|---|---|
| Error Summary (G-CF4, G-CF7) | `form-input--error-summary` | `max-width:560px`. An `lc-alert variant="error" title="Bitte prüfen Sie zwei Angaben"` with a `<ul style="list-style: none; margin: 4px 0 0; padding: 0">` of `<a lcButton variant="link" size="sm" [flush]="true" href="#contact-email">E-Mail-Adresse</a>` and `…#contact-message">Nachricht</a>` (r1: each a 44 px target, flush with the title, as the 006 flush link). Then lc-input Name (`controlId="contact-name"`, required, value), lc-input E-Mail-Adresse (`contact-email`, type email, required, error, `[announceError]="false"`), lc-textarea Nachricht (`contact-message`, default size md (r1), required, error, errorMessage, `[announceError]="false"`) | AC-1, AC-8, AC-11, AC-13: exactly one `[role=alert]`, ids from controlId, the links focus the fields |
| Required Asterisk (G-CF6) | `form-input--required-asterisk` | lc-input xs/sm/md/lg required (Name, E-Mail-Adresse, Telefonnummer, "Ihre vollständige Postanschrift für die Rücksendung"), then lc-textarea xs/sm/md/lg required (Nachricht ×4 with the size in the label); a single column, `max-width:400px` | AC-6, AC-7, AC-13: 4 px everywhere, the `*` never alone on a line |
| Error without Alert Role (G-CF7) | `form-textarea--error-without-alert-role` | args: label Nachricht, `controlId: 'contact-message'`, required, error, errorMessage, `announceError: false` | AC-1, AC-8 on lc-textarea; controls for the new inputs |
| Link Action (G-CF8) | `feedback-alert--link-action` | four variants, inline (default), German titles and messages, each with `<a slot="action" href="mailto:…">` + the long German text; info `dismissible` | AC-9, AC-10 inline: the link right of the body ≥ 36rem, dropped below < 36rem |
| Link Action, Stacked (G-CF8) | `feedback-alert--link-action-stacked` | four variants, `actionsLayout="stacked"`. Error = 503: `lc-button variant="outline" size="lg"` "Erneut senden" plus the long link; warning = 429: the long link; info and success: short link `kontakt@beispiel.example` | AC-9, AC-10 stacked, a button next to a link |

argTypes: `controlId` (text, `table.defaultValue: 'generated (lc-input-<n>)'`) and `announceError` (boolean, `'true'`) in both metas. The `requiredAriaLabel` description becomes "Deprecated, no effect (3.12): …" in both. The alert meta's description and `actionsLayout` text mention the link (inline drops below at < 576 px). Existing stories stay unchanged.

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1 | unit (both): `controlId="contact-email"` → control `id`, label `for`, `-error`/`-helper` ids, `aria-describedby`. Story `form-input--error-summary` 360: `link.click()`, then `document.activeElement.id` | `contact-email`, `contact-email-error`, `contact-email-helper`; activeElement `contact-email` / `contact-message`; r1: summary links x 69 (= title x), h 44, 14 px, ≥ 4.78 : 1 light / 11.39 : 1 dark (prototype `r1-proto`) |
| 2 | unit: two fixtures in order, ids `lc-input-<n>` and `<n+1>`, matching `/^lc-input-\d+$/`; grep `Math.random` in `lib/input` | no random part; 0 hits |
| 3 | compat consumer: page with `controlId` fields, `EXPECT_IN_HTML` `id="contact-email"`, `for="contact-email"`, `id="contact-email-error"`; ids are the same after hydration, and there is no NG05xx in the console | present on 21 and 22. Unset ids: equal for the first route rendered (see §1 caveat) |
| 4 | the existing specs that read `inputId` pass unchanged; `tsc` in compat | green |
| 5, 6 | unit: the `*` has `aria-hidden="true"` and no `aria-label` (both); `requiredAriaLabel="Pflichtfeld"` is in no DOM attribute; the control has `required` + `aria-required="true"`. axe accname in `form-input--required` | name "Company Name" (was "Company Name required") |
| 7 | `--measure`: `ind.left − Range(last label char).right` on `form-input--required-asterisk`, `form-input--required`, `form-textarea--no-script-contact-form`, at 360 and 1280 | 4.00 ± 0.01 for all 8 + 3 labels |
| 8 | unit: role present by default and absent with `announceError=false` (id, describedby, aria-invalid kept); story: `document.querySelectorAll("[role=alert]").length` | 1 |
| 9 | `--measure` on both link stories at 360/1024/1280, light and dark: anchor rect, computed colour and contrast per variant (as `probe-inline2`), `textDecorationLine`, ring after `.focus()` | h ≥ 44, w ≥ 44; contrast ≥ §5 values (≥ 4.5); `underline`; outline 2px |
| 10 | `--measure` at 360, at 100 % and with `html{font-size:200%}`: `scrollWidth − clientWidth` of the document and of each alert; link x = text x | 0 / 0; link x 69 (100 %), 113 (200 %). r1: at 200 % the stacked 503 alert is +4. Its `lg` button's min-content (218.3) is wider than its 182 px column. The document stays at 0, and the fix goes to a follow-up |
| 11 | unit: the alert DOM order is body → action → close; the error role is `alert`, `status` for info. Note a screen-reader pass in `review.md` | order holds |
| 12 | both themes in the shots. Stylesheet scan: no `forced-color-adjust` on `.lc-alert__action a` or the `*`; `getAnimations()` empty after hover | none |
| 13 | `form-input--error-summary` 360: each label's and error's `scrollWidth ≤ clientWidth` | no clip |
| 14 | full Jest run (only the lc-input `*` aria-label asserts change); `story-shots --stories=<50 ids from tmp/016/baseline-*.log> --widths=360,1280 --compare=tmp/story-shots/016/baseline` (no `--full`) | differs only where a `*` shows (input required/login-form/contact-form, textarea prefilled-value/prefilled-german/no-script-contact-form, email-input required/invite-form …); all alert shots identical |
| 15 | JSDoc `@default` on `controlId`, `announceError`; argTypes; `npm run test:tools` | green; the manifest lists both inputs on both components |

**Risks (from earlier requests):** the accessible-name change in AC-6 breaks consumer e2e queries such as `getByRole('textbox', { name: 'E-Mail required' })`, so it needs a Compatibility line. `:has()` and container queries are already in the kit (`_horizon.scss`, the stacked alert). The selector is `a:where(:not(.btn))` (0,1,1): it beats the reset `a` (0,0,1), while a consumer's scoped class (0,2,0) still wins. Changelog: `requiredAriaLabel` deprecated; `inputId`, `textareaId`, `errorId` and `helperId` become accessors (reading them is unchanged).
