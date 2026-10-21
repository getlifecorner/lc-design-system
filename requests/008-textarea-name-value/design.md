# Design 008: lc-textarea name and value for no-script posts

- **Status:** ready (rev. 1)
- **Spec:** [spec.md](spec.md), AC-1 to AC-12
- **Change note rev. 1 (review round 1, 2026-10-21):** D2 removed the separate `output()` and with it the public class member `valueChange` (3.9: `OutputEmitterRef<string>`). The kit listed exactly that as a break in 2.0 ("no longer class properties to `subscribe()` to"), so the design was wrong to call it break-free. Now: the component keeps `readonly valueChange: OutputRef<string> = this.value` (build.md Deviation 1, accepted). §1 D2, §2 and the changelog points are updated.
- **Measured on main 420a523** (Storybook build of 3.9.0; compat prerender output of 3.9 in `tmp/006/compat/app-22`, `tmp/005/fix/compat-all/app-21`). Baseline: `tmp/story-shots/008/baseline` (the 10 `form-textarea--*` stories × 360/1024/1280 × light/dark, `--full`, 60 shots). These must stay identical by hash.

## 1. Approach

Extend `lc-textarea`. No new element, no visual change, no new token. Each part copies what `lc-input` already does, with two deliberate exceptions (D2 and D3):

| Decision | What | Why |
|---|---|---|
| D1 `name` | `input<string>()`, bound `[attr.name]="name() ?? null"` | identical to `lc-input` (the attribute is absent when unset, AC-1, AC-9) |
| D2 `value` | `model<string>('')` replaces the public `signal`; the separate `output()` is removed (the model provides the `valueChange` output, same name and payload). The class member `valueChange` stays as `readonly valueChange: OutputRef<string> = this.value` (rev. 1), so code that subscribes to it keeps compiling | Only a model gives all of these together: `[value]`/`[(value)]`, `textarea.value()`/`.set()` still compiling (`ModelSignal` extends `WritableSignal`), a correct MCP entry (the generator knows `model()` but not input aliases), and typed Storybook args. Same pattern as `lc-input`, `lc-search-input` and `lc-radio-group`. **Emission:** see §4. |
| D3 `*` ARIA | stays `aria-hidden="true"`, as in 3.9 (and `lc-password-input`, `lc-verification-code-input`). `requiredAriaLabel` exists for API parity but is not exposed. | Measured (axe-core 4.10.2 accname): `lc-input` required → name **"Company Name required"** plus the native required state, so "required" is said twice. `lc-textarea` with the `*` hidden → name **"Nachricht"** plus the required state, said once (AC-8). |
| D4 prerender | Server-only leading-newline guard: on the server the native value is `'\n' + value` when `value` starts with `\r` or `\n` | Measured: domino in `@angular/platform-server` (21 and 22) serialises `textarea.value` as the text content, escapes `& < > U+00A0`, but **does not emit the extra LF** the HTML serialisation spec requires for `textarea`. The browser's parser drops the first LF after `<textarea>`, so a leading blank line would be lost on the 422/429/503 pages (AC-2). |

Rejected for D2: an aliased `input('value')` + `linkedSignal` (no emission change, but the MCP lists the wrong name and Storybook args lose their type); a private "form value" signal next to the model (`value()` would be stale after `writeValue`, which breaks AC-3); writing the model's node through `@angular/core/primitives` (framework internals).

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | `name` | `string \| undefined` | unset | Native `name` of the inner `<textarea>`, so a form posts the text without JavaScript. Unset = no attribute. A `disabled` textarea is not posted (HTML); use `readonly` to post a fixed text. |
| model | `value` | `string` | `''` | Current text, two-way bindable (`[value]` / `[(value)]`). It pre-fills the native textarea, in prerendered HTML too, so a server-rendered page can keep a visitor's text. Emits `valueChange` whenever it changes: once per keystroke that changes the text, and when a bound form control or code sets a different text. With a form control, the control's value wins; don't bind both. `@default ''` |
| output | `valueChange` | `string` | — | Now the model's output. Same name and payload, no separate `output()`. |
| class property (rev. 1) | `valueChange` | `OutputRef<string>` (was `OutputEmitterRef<string>`) | `this.value` | "The model's change output as a class property, so code that subscribes to it (`textarea.valueChange.subscribe(…)`, `outputToObservable(…)`) keeps compiling as in 3.9." Not an Angular output of its own (the extractor only reads call initialisers, so the MCP lists `valueChange` once, from the model). Calling `.emit()` from outside no longer compiles; that was never a supported use. |
| input | `requiredIndicator` | `boolean` | `true` | Show the `*` after the label of a `required` field. `false` keeps the required semantics (`required`, `aria-required`) without the asterisk, for forms where every field is required. (Same text as `lc-input`.) |
| input | `requiredAriaLabel` | `string` | `'required'` | Accessible name of the `*` marker, for API parity with `lc-input`. `lc-textarea` hides the `*` from assistive technology, because the native `required` state is announced already and naming the `*` would say "required" twice. |
| internal | `renderedValue` (protected `computed`) | `string` | — | `value()`; on the server, prefixed with `'\n'` when it starts with `\r` or `\n` (D4). Server detection: `isPlatformServer(inject(PLATFORM_ID))`, as in `theme.service`/`toast.service`. Template: `[value]="renderedValue()"`. |

No new type, slot or CSS hook. Also add `@default` to the JSDoc of the existing textarea inputs (docs only; the MCP shows them).

**Default rendering unchanged:** `name` unset → no attribute. `value` `''` → `[value]` sets `''`, so the server output stays `<textarea …></textarea>`. `requiredIndicator` `true` → the `*` shows exactly when it did in 3.9, with the same class and `aria-hidden`. Event bindings are unchanged, so `jsaction="input:;blur:;"` is unchanged too. 3.9 output (22): `<textarea _ngcontent-…="" class="lc-textarea lc-textarea--md lc-textarea--outline" id="lc-textarea-0" placeholder="" rows="3" jsaction="input:;blur:;"></textarea>`. On 21, beasties re-serialises this as bare `placeholder` and `_ngcontent-…`, without `jsaction`.

**Changelog points:** Added: `name`, `value` (model), `requiredIndicator`, `requiredAriaLabel` (G-CF1, G-CF3, life-os contact form). Changed: `valueChange` also emits when a form control or code sets a different text, as in `lc-input`; an input event that leaves the text unchanged no longer emits. Fixed/confirmed: `lc-input` `value` is in the prerendered `value` attribute (G-CF2, a check only). Compatibility (rev. 1): `TextareaComponent.valueChange` is typed `OutputRef<string>` (was `OutputEmitterRef<string>`); `subscribe()` and `outputToObservable()` work as before, and only an outside `.emit()` no longer compiles. No API break.

## 3. Anatomy and layout

There is no layout change. The measured values (Default story with `required` and `rows` 6) are the same at every width:

### 360 px

```
x16 ┌───────────────── 328 ─────────────────┐
y16 │ Nachricht *            label 14/500/21 │  * = --color-text-error, aria-hidden
    │                 gap 8 (--spacing-2)    │
y45 │┌──────────────────────────────────────┐│  textarea md: 16/24, pad 12/16, r 12
    ││Guten Tag,                            ││  rows 6 → 170 px (6×24+24+2)
    ││                                      ││  white-space pre-wrap, overflow-wrap
    ││ich möchte die Haushaltsmitglieder-   ││  break-word: no horizontal scroll
    ││verwaltung …   (scrolls inside: 288 > 168)│  (client 326 = scroll 326)
    │└──────────────────────────────────────┘│
    │ footer: error / helper / count (gap 8) │  only if set (unchanged)
    └────────────────────────────────────────┘
```

### From 1024 px

```
┌──────────── container width (contact form: max 560) ─────────────┐
│ Nachricht *                                                      │
│┌────────────────────────────────────────────────────────────────┐│  same metrics; Default story at 1280: w 1248;
││ 6 rows, 170 px                                                 ││  German text 192 > 168 → still scrolls inside
│└────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| label | h 21 | 14 px / 500 / 21 | `--font-size-sm`, `--font-weight-medium` |
| label → field | 8 | — | `--lc-density-gap-sm` → `--spacing-2` |
| field (md) | pad 12/16, r 12, border 1 | 16 / 24 | `--font-size-base`, `--line-height-base`, `--border-radius-md`, `--color-field-border` |
| rows 3 / 6 | 98 / 170 px | — | — |

## 4. States

| State | Behaviour |
|---|---|
| default, hover, focus-visible, disabled, readonly, error | unchanged (no CSS change) |
| pre-filled (`value`) | text visible from first paint (prerendered); caret at the end after focus (native) |
| empty | placeholder as before |
| typing | each `input` event that changes the text → `value.set(v)` (1 × `valueChange`) + `onChange(v)`. The disabled/readonly guard stays |
| `writeValue(v)` | `value.set(v \|\| '')` (as 3.9) → **1 emission if different, none if equal** (D2; listed under Changed) |
| parent `[value]` change | no emission (Angular input path); form control not notified, as in `lc-input` |
| code `ref.value.set(v)` | emits if different (documented) |
| no JS, required and empty | the browser blocks the post with its own message; the server's 422 remains the reference |
| typing before hydration | the first binding pass resets the field to the server value. This is Angular behaviour, the same in `lc-input` today. Not in scope; follow-up candidate (adopt `el.value` when it differs from `el.defaultValue` on first client render) |
| overflow | long German words break inside the field (UA `overflow-wrap: break-word`). "Datenschutzeinstellungsübersicht" is 246 px wide in a 294 px content box at 360. Long text scrolls inside the fixed rows (`autoResize` grows up to `maxRows`) |

## 5. Theming

No new token. Contrast computed in the browser with the WCAG formula on computed colours:

| Element | Light | Dark | Contrast (computed) |
|---|---|---|---|
| `*` (`--color-text-error`) on page | rgb(107,9,9) on #fff | rgb(247,161,161) on rgb(10,18,27) | 12.59 / 9.48 |
| pre-filled text (`--color-text-primary`) on `--color-surface` | rgb(17,24,39) on #fff | rgb(241,246,248) on rgb(16,28,38) | 17.74 / 15.85 |

## 6. Accessibility

- **Semantics:** a native `<textarea>` named by `<label for>`, with `required` + `aria-required="true"` (as in 3.9). The name is the label text only ("Nachricht"). The required state is announced once, as name + role + "required" (in German screen readers: "erforderlich").
- **`*`:** `aria-hidden="true"` (D3). `requiredIndicator=false` removes it; the semantics stay. With `requiredAriaLabel="Pflichtfeld"` the name stays "Nachricht"; nothing says "Pflichtfeld" (verified, AC-8).
- **Keyboard, focus, 44 px:** unchanged. The field is ≥ 98 px high. **forced-colors:** the `*` is text and becomes CanvasText, while the state is still carried by `required`. **Reduced motion:** no new motion.
- **No-JS form:** `name` + `required` make the native form work. Error texts stay `role="alert"` (server-rendered 422 pages announce them on load, as before).
- **Follow-up, not in 3.10:** `lc-input` and `lc-radio-group` name their `*` (`aria-label`), so "required" is announced twice (measured above). Aligning them to `aria-hidden` changes `lc-input` and is excluded by the spec. Recommend it as its own request.

## 7. Texts

| Key / input | EN default | DE |
|---|---|---|
| `requiredAriaLabel` | `required` | `Pflichtfeld` (not visible, not in the accessible name, see D3) |

No other built-in text. The story texts are below.

## 8. Stories

New stories in `textarea.stories.ts`. Add argTypes with `description` and `table.defaultValue` for `name` (unset), `value` (`''`), `required` (`false`), `requiredIndicator` (`true`) and `requiredAriaLabel` (`'required'`). Add `table.defaultValue` to the existing argTypes too (docs only; the 10 existing stories' args stay untouched, and their shots must stay hash-identical).

| Story (export) | Expected ID | Args | Shows |
|---|---|---|---|
| `PrefilledValue` "Pre-filled Value (G-CF1)" | `form-textarea--prefilled-value` | `label 'Message'`, `name 'message'`, `rows 6`, `required true`, `value` EN: `'Hello,\n\nI would like to move my household to a new account.\n\nBest regards\nLena'` | name + multi-line value + `*` |
| `PrefilledGerman` "Pre-filled, German (G-CF1, G-CF3)" | `form-textarea--prefilled-german` | `label 'Nachricht'`, `name 'message'`, `rows 6`, `required true`, `requiredAriaLabel 'Pflichtfeld'`, `value`: `'Guten Tag,\n\nich möchte die Haushaltsmitgliederverwaltung meiner Datenschutzeinstellungsübersicht auf ein neues Konto übertragen. Geht das auch für „Müller & Söhne“ mit "Zimmer <2>"?\n\nViele Grüße\nJürgen'` | German, long words, `& < > "` shown literally, scroll inside 6 rows at 360 |
| `RequiredWithoutIndicator` "Required without Asterisk (G-CF3)" | `form-textarea--required-without-indicator` | `label 'Message'`, `required true`, `requiredIndicator false`, `rows 3`, `placeholder 'Your message'` | no `*`, still required |
| `NoScriptContactForm` "Contact Form without Script (G-CF1, G-CF2)" | `form-textarea--no-script-contact-form` | render: `<form method="post" action="/kontakt" (submit)="$event.preventDefault()" style="max-width:560px;display:flex;flex-direction:column;gap:16px">` with `lc-input` (label "E-Mail", type email, size lg, name email, required, requiredAriaLabel "Pflichtfeld", value "jana@example.de"), `lc-textarea` (label "Nachricht", name message, rows 6, required, requiredAriaLabel "Pflichtfeld", value = the German text), `lc-button` (type submit, primary, lg, fullWidth, "Senden") | the life-os composition; `new FormData(form)` in review |

## 9. Verification

Compat probe `tools/compat/template/src/app/probe-310.ts` (`lc-compat-310`, on the home page after `lc-compat-39`, secondary entries only): `<form id="compat-contact" method="post" action="/kontakt">` with `<lc-input name="email" type="email" value="a@b.de" label="E-Mail" />`, `<lc-input name="name" [value]="person" label="Name" />` (`person = 'Anna "Ann" & Co'`), `<lc-textarea name="message" [value]="message" label="Nachricht" [required]="true" requiredAriaLabel="Pflichtfeld" />` and a plain `<button type="submit">Senden</button>` (implicit submission needs it), where `message = '\nErste Zeile\nZweite Zeile: <b> & "zitiert"\n</textarea><p>x</p>\n'`. Attribute regexes must accept both `required=""` (22, domino) and bare `required` (21, re-serialised by beasties with `decodeEntities: false`, so entities and LFs pass through unchanged). New `EXPECT_IN_HTML` rows (comment `// 3.10 (request 008), on the home page (probe-310.ts)`):

```js
['textarea name and value before JS (G-CF1)', /<textarea(?=[^>]*\sname="message")(?=[^>]*\srequired(?:=""|[\s>]))[^>]*>\n\nErste Zeile\nZweite Zeile: &lt;b&gt; &amp; "zitiert"\n&lt;\/textarea&gt;&lt;p&gt;x&lt;\/p&gt;\n<\/textarea>/],
['textarea without name and value unchanged (AC-9)', /<textarea _ngcontent-[^\s=>]+(?:="")? class="lc-textarea lc-textarea--md lc-textarea--outline" id="lc-textarea-\d+" placeholder(?:="")? rows="3"(?: jsaction="input:;blur:;")?><\/textarea>/],
['input value before JS (G-CF2)', /<input(?=[^>]*\sname="email")(?=[^>]*\stype="email")(?=[^>]*\svalue="a@b\.de")[^>]*>/],
['input value escaped (G-CF2)', /<input(?=[^>]*\sname="name")(?=[^>]*\svalue="Anna &quot;Ann&quot; &amp; Co")[^>]*>/],
```

| AC | How | Expected value |
|---|---|---|
| AC-1 | unit | `name="message"` on `<textarea>`; unset → `hasAttribute('name') === false` |
| AC-2 | row 1 above (21 and 22). Unit test with `{ provide: PLATFORM_ID, useValue: 'server' }`: the native value for `'\nHi'` is `'\n\nHi'`, for `'Hi'` it is `'Hi'`; in the browser it is `'\nHi'` | regex matches on both majors |
| AC-3 | unit: `[(value)]` host, `ngModel` and `FormControl` hosts | form value shown after `writeValue`; `textarea.value()` returns it; existing specs untouched and green |
| AC-4 | unit: (a) `<form><lc-textarea name="message" [value]="m">` → `new FormData(form).get('message') === m`. (b) jsdom `DOMParser` on the exact server string from AC-2 inside `<form>` → `FormData.get('message')`, with CRLF normalised to LF, `=== message`. Browser with JS **disabled** on the 22 prerendered `index.html`: submit `#compat-contact` and record the posted body from the network log in `build.md` | body has `message=%0D%0AErste+Zeile%0D%0A…` (the leading break kept) |
| AC-5 | unit: `value 'Hallo'`, type `'Hallo!'` → `value() === 'Hallo!'`, 1 × `valueChange('Hallo!')`. The same browser session with JS on: after hydration, `textarea[name=message].value === message`, no `NG05xx` in the console | as stated |
| AC-6 | rows 3 and 4 above | match (3.9 already writes `value=""`); `lc-input` unchanged |
| AC-7 | unit + story `required-without-indicator` | `requiredIndicator=false` → no `.lc-textarea-required-indicator`; `required` attr still set |
| AC-8 | unit; review: axe-core accname in story `prefilled-german` | `*` has `aria-hidden="true"` and no `aria-label`; with `requiredAriaLabel 'Pflichtfeld'` the string occurs nowhere in the component DOM; `aria-required="true"`; accname = "Nachricht" |
| AC-9 | unit: attribute names of the default `<textarea>` = {id, class, placeholder, rows} (3.9 set); typing 3 chars → 3 emissions; `writeValue('x')` → 1, again → 0; `setInput('value', …)` → 0. Row 2 above (the Notiz field). Story shots of the 10 existing stories `--compare=tmp/story-shots/008/baseline` | 60/60 identical |
| AC-10 | story-shots of the 4 new stories at 360/1024/1280 × light/dark, `--measure` | label y 16 h 21, field y 45; rows 6 → h 170; German at 360: `scrollWidth === clientWidth` (326); contact form at 1280: form w 560; `*` contrast 12.59 / 9.48 |
| AC-11 | `npm run test:tools` + manifest grep | `name`, `value` (kind model), `requiredIndicator`, `requiredAriaLabel` with JSDoc and `@default` |
| AC-12 | `check-angular-majors.mjs` | all checks ok on 21 and 22 |

**Risks** (from earlier requests): the server write lives in a template binding, not in `afterRender` (no DOM work on the server); there is no `Renderer2`. The text inside `<textarea>` isn't a template node, so hydration doesn't visit it, but confirm there's no `NG05xx` (AC-5). The 3.9 default output differs between 21 and 22 (beasties), so write every regex to accept both forms.
