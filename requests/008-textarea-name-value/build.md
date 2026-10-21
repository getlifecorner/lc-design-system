# Build 008: lc-textarea name and value for no-script posts

- **Branch:** `feat/3.10-textarea-name-value` (from `main` 420a523) · **Commit:** one, `feat(textarea): name and value for no-script posts, requiredIndicator`; gates ran on `921167b`, amended only to add this file and the log row (libs/tools unchanged)

## Files changed

| File | Change |
|---|---|
| `lib/textarea/textarea.component.ts` | `name` (D1); `value = model('')` replaces the signal + `output` (D2); `valueChange: OutputRef<string> = this.value` (see Deviations); `requiredIndicator`, `requiredAriaLabel`; protected `renderedValue` with the server-only LF guard via `isPlatformServer(PLATFORM_ID)` (D4); `@default` on every input |
| `lib/textarea/textarea.component.html` | `[attr.name]="name() ?? null"`, `[value]="renderedValue()"`, `*` only when `required() && requiredIndicator()` (still `aria-hidden`, D3) |
| `lib/textarea/textarea.name-value.spec.ts` | new, 19 tests (AC-1…5, 7…9, D4) |
| `lib/textarea/textarea.component.spec.ts` | one assertion changed, see below |
| `lib/textarea/textarea.stories.ts` | `table.defaultValue` on all argTypes, 5 new argTypes, 4 stories (§8) |
| `tools/compat/template/src/app/probe-310.ts`, `home.ts`, `home.html` | probe `lc-compat-310` (§9), secondary entries only |
| `tools/compat/check-angular-majors.mjs` | the 4 `EXPECT_IN_HTML` rows of §9, verbatim |

**Changed assertion** (`textarea.component.spec.ts`, "reflects control.setValue() in the DOM"): `host.changes` after `control.setValue('Hello from the form')` was `[]`, is now `['Hello from the form']`. Reason: D2 / §4 — `writeValue` sets the model, which emits once when the text differs (as `lc-input`); listed under Changed. Same strength (exact array).

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | unit: `name="message"`; unset → `hasAttribute('name') === false` |
| AC-2 | compat row "textarea name and value before JS (G-CF1)"; unit (`PLATFORM_ID 'server'`): `'\nHi'` → `'\n\nHi'`, `'\r\nHi'`/`'\rHi'` → `'\n\nHi'` (jsdom normalises CR), `'Hi\n'`, `''` unchanged; browser `'\nHi'` unchanged |
| AC-3 | unit: `[(value)]` host writes back; `ngModel` host shows the model, `value()` returns it, typing updates the model; `FormControl` host: control wins, `value()` readable |
| AC-4 | unit: `new FormData(form).get('message') === MESSAGE`; `DOMParser` on the server string → exactly 1 textarea, no `<p>`, FormData (CRLF→LF) `=== MESSAGE`. Browser, JS disabled: see Verification |
| AC-5 | unit: `'Hallo'` + type `'Hallo!'` → `value()`, 1 × `valueChange('Hallo!')`, name kept. Browser, JS on: see Verification |
| AC-6 | compat rows "input value before JS (G-CF2)" and "input value escaped (G-CF2)"; `lc-input` unchanged |
| AC-7 | unit: default shows `*`; `requiredIndicator=false` → no indicator, `required` + `aria-required="true"` stay; story `required-without-indicator` |
| AC-8 | unit: `*` `aria-hidden="true"`, no `aria-label`; `Pflichtfeld` nowhere in the component's DOM; label text without hidden content = "Nachricht". Note: a static template attribute `requiredAriaLabel="Pflichtfeld"` stays on the `<lc-textarea>` host element (Angular keeps static input attributes; same for `lc-input`); it is not exposed to AT |
| AC-9 | unit: default attribute names = {class, id, placeholder, rows}; 3 keystrokes → 3 emissions, unchanged input event → 0; `writeValue('x')` ×2 → 1; `setInput('value')` / parent `[value]` → 0. Compat row "textarea without name and value unchanged (AC-9)". Shots: 60/60 identical |
| AC-10 | 4 stories; shots + `--measure` (Gates) |
| AC-11 | `test:tools` 22/22; built `.d.ts` lists inputs `name`, `requiredIndicator`, `requiredAriaLabel`, `value` and outputs `{ value: 'valueChange' }`, JSDoc with `@default` |
| AC-12 | compat matrix (Gates) |

## Verification (browser)

Chrome headless shell, 22.2 prerendered `index.html` from the compat run (`tmp/008/compat/app-22`), served by `story-shots.mjs` (copy under `/c8/`, removed afterwards); `--measure` result in `tmp/008/browser-check.log`. A scratch CDP script needed approval (headless), so this used iframes plus a temporary service worker that echoed the raw POST body.

| Check | Result |
|---|---|
| AC-4, JS disabled (`<iframe sandbox="allow-forms allow-same-origin">`: the event-dispatch inline script did not run, 85 `jsaction` left) | before submit `textarea.value === message`. Click on "Senden" → `POST /kontakt`, `application/x-www-form-urlencoded`, body `email=a%40b.de&name=Anna+%22Ann%22+%26+Co&message=%0D%0AErste+Zeile%0D%0AZweite+Zeile%3A+%3Cb%3E+%26+%22zitiert%22%0D%0A%3C%2Ftextarea%3E%3Cp%3Ex%3C%2Fp%3E%0D%0A`: leading break kept, line breaks as CRLF (HTML), CRLF→LF equals the probe text |
| AC-5, JS on (`/c8/`, `<base href>` rewritten, console hook in `<head>`) | `jsaction` 85 → 0 (hydrated), `name="message"`, `value === message`, `required`; console errors/warnings: none, no `NG05xx`; typing still edits the field |

## Gates

All gates ran on the libs/tools tree of commit `921167b` (later agents skip a gate while `git diff --quiet 921167b -- libs tools` holds). Logs: `tmp/008/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 155 suites, 3964 passed, 8 skipped (3.9: 154 / 3945 / 8) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (= main) |
| `npx nx run angular-ui-kit:build` | ok, 15.6 s |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | ok, 29 s |
| Story shots, existing | 10 stories × 3 widths × 2 themes `--full` vs `tmp/story-shots/008/baseline`: 60 identical, 0 different |
| Story shots, new | `tmp/story-shots/008/new/` (24). All widths: label y 16 h 21, field y 45; rows 6 → h 170, rows 3 → 98. German at 360: scrollWidth = clientWidth = 326 (scrolls inside, 288 > 168). Contact form: w 328 at 360, 560 at 1024/1280. FormData in the story: `email`, `message` (`Guten Tag,\n\n…`) |
| `check-angular-majors.mjs` (full matrix, `--work=tmp/008/compat`) | PASS on 21.0.9, 21.2.25, 22.0.8, 22.2.3: 48 prerender checks each (+1 csp check on 22), incl. the 4 new rows |

## Deviations from the design

1. **`valueChange` kept as a class property** (needs the designer's agreement). Removing the separate `output()` (D2) also removes the public class member `valueChange` (3.9: `OutputEmitterRef<string>`). The kit's own changelog lists exactly this as a **breaking change** (2.0, "Models instead of output properties … no longer class properties to `subscribe()` to"), and the spec forbids an API break in 3.10. So the component keeps `readonly valueChange: OutputRef<string> = this.value` (the model is an `OutputRef`). It is not an Angular output (the compiled outputs are only `{ value: 'valueChange' }`), not in the MCP inputs, and `subscribe()` / `outputToObservable()` keep compiling; only `.emit()` from outside is gone. Unit test: subscribing to `valueChange` sees `writeValue` emissions. If the designer rejects it, delete the 6 lines; then the changelog needs a break (owner, 4.0).

## Changelog draft

```md
## [3.10.0] - 2026-10-2x

`lc-textarea` posts and pre-fills without JavaScript, for life-os's contact form (G-CF1, G-CF3; website-contact-form §7). No API breaks.

### Added

- **`name` and `value` on `lc-textarea`** (G-CF1, blocking for the life-os contact form, spec 002): `name` sets the native `name` (unset = no attribute), so a plain `<form method="post">` sends the message without JavaScript. `value` is a model (`[value]` / `[(value)]`) and is written into the prerendered `<textarea>`, so the server's 422/429/503 pages keep the visitor's text. Text is escaped (`<`, `&`, `</textarea>` stay text) and a leading line break survives: posted with JavaScript disabled as `message=%0D%0AErste+Zeile%0D%0A…`, identical after hydration, on Angular 21 and 22.
- **`requiredIndicator`** (default `true`) and **`requiredAriaLabel`** (default `'required'`) on `lc-textarea`, as on `lc-input` (G-CF3). `false` hides the `*` and keeps `required` / `aria-required`. The `*` stays `aria-hidden`, so a screen reader says "required" once (the name stays the label, e.g. "Nachricht").

### Changed

- **`lc-textarea` `valueChange`** is the `value` model's output (same name and payload, still subscribable on the component). It now also emits when a form control or code sets a different text, as `lc-input` does; an input event that leaves the text unchanged no longer emits.

### Compatibility

- No API breaks. The default textarea renders the same attributes as 3.9; the 10 existing textarea stories are pixel-identical (60 of 60 screenshots).
- G-CF2 confirmed, no change: `lc-input`'s `value` is in the prerendered `value` attribute, escaped (`Anna &quot;Ann&quot; &amp; Co`), on Angular 21 and 22.

### Migration

- life-os: bind `name="message"` and `[value]` on the contact form's `lc-textarea`; no interim needed.
```
