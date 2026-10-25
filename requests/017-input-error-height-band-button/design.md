# Design 017: lc-input error-state height and a link button on the hero band

- **Status:** ready
- **Spec:** [spec.md](spec.md), AC-1 … AC-12
- **Measured on:** main ddbd4cb (3.12.0), static Storybook rebuilt 2026-10-25. Probes: `tmp/story-shots/017/probe-*`, measure source `tmp/story-shots/017/band-contrast-measure.js`.

## 1. Approach

- **G-WL3 (fix).** Measured cause: the container gets `flex: 1 1 0%` from the message rule. In the column-flex `.input-wrapper` a non-auto `flex-basis` replaces `height`, so the box takes its content height, which is the `<input>` box + 2 px border. Today error vs idle is xs 28/24, sm 35/32, md 42/40, lg 49/44 (the lg `<input>` box is 47 px, a known overflow since 008). The `font-size: 12px` and the error `color` also reach the container, though nothing visible inherits them. Fix: rename the **container state** only. Prototype (class swapped in the browser): 24/32/40/44 in error, light and dark, with the message 4 px below and unchanged (12 px, `--color-error-600`, `flex: 1 1 0%`).
- **G-WL1 (extend `ButtonVariant`).** AC-6 (§5.1) shows that no existing variant passes on the teal band: every fill reaches 1.00:1 against it somewhere, and the kit ring is 1.00 (light) or 2.06 (dark). Hooks on an existing variant can't fix that without redefining it. So there is one new variant `inverse`: a white pill with dark teal ink and a white ring, **independent of the theme**, because the hero bands are fixed hex values in both themes. This is the same principle as the hero's literal `#fff` ink and `.btn-warning`'s `$color-warning-default`. It follows `ghost` and `link` in having a `--lc-button-<variant>-*` hook, and `lc-button` and `a[lcButton]` share it through the one stylesheet.
- **Release:** both fit one minor (3.13.0, branch `feat/3.13-input-error-height-band-button`). G-WL3 may still ship alone as 3.12.1 (spec assumption); that is the release-manager's call.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| type | `ButtonVariant` | `… \| 'info' \| 'inverse'` | — | Gains `'inverse'` at the end. Nothing is removed. |
| input | `variant` (`lc-button`, `a[lcButton]`) | `ButtonVariant` | `'primary'` | "Visual variant. `inverse` is a white pill with dark ink and a white focus ring for dark, coloured or image backgrounds that don't follow the theme, such as the default `lc-hero` bands (primary, neutral, info, accent-purple, accent-violet). It looks the same in both themes. Not for light backgrounds or `variant="light"` heroes. CSS hook `--lc-button-inverse-fg` (default `#0d353d`) sets its ink; keep 4.5:1 on white. @default 'primary'". The text is the same on both components. `ButtonComponent.variant` has no JSDoc today, and `ButtonLinkComponent.variant` has one without `@default`; both get this text. |
| CSS hook | `--lc-button-inverse-fg` | `<color>` | `#0d353d` (`$color-primary-800`) | The inverse variant's label and icon colour. Set it on the button, the host or an ancestor. |
| class | `.btn-inverse` | — | — | Added by `variant="inverse"` on the inner `<button>` or the anchor, and present in prerendered HTML. |
| lc-input class | `input-invalid` on `.input-container` | — | — | **New name** for the container's error state. It is present exactly when `aria-invalid="true"` is (`hasError`). |
| lc-input class | `input-error` on `<p>` (the message) | — | — | **Unchanged** and documented as the stable class of the message. `input-error` is no longer on the container. |
| input JSDoc | `error` (lc-input) | `string \| undefined` | `undefined` | Append: "While it is set, the field container carries the class `input-invalid` and the message renders as `<p class="input-error">`. Before 3.13 the container also carried `input-error` (G-WL3). @default undefined". |

**AC-4 decision:** the container's old `input-error` is **not** kept. It is the cause of the bug, it was never a documented hook, and life-os uses only `p.input-error` (grep across life-os and its worktrees: one agent note, `docs/dev/agent-notes/test-writer.md:848`). Keeping `p.input-error` means two kit specs stay as they are: `input.component.spec.ts:277` and `input.control-id.spec.ts:30`, which the spec didn't list. Only `:325` changes, to `input-invalid`. The changelog **Changed** entry names the old → new pair.

**Default rendering unchanged:** `inverse` is a new value, so no existing variant, size or modifier rule changes. The SCSS gains rules for `.btn-inverse` only. The lc-input change alters only stories that show an error at load (expected diffs listed in §9).

## 3. Anatomy and layout

### 360 px

```
lc-input lg, error                         lc-hero primary md, radius none, contentWidth lg (360 × ~633)
Label 14/500 · gap 4+4                     | 20 | LABEL 11/600                          | 20 |
┌──────────────────────────────┐           |    | Title 28/800 LH 1.1                   |    |
│ jana.mueller@                │ 44 (=idle) |    | body 14/1.6, opacity .85              |    |
└──────────────────────────────┘           |    | ↕ 16 (consumer gap)                   |    |
  .input-container.input-invalid           |    | ╭────────────────────────────────────╮ |    |
  border 1 --color-error-600               |    | │ Trag dich jetzt in die Warteliste  │ |    |  a[lcButton] inverse lg
↕ 4 (wrapper gap --spacing-1)              |    | │                ein                 │ |    |  x 20, 320 × 71, 2 lines
Geben Sie eine E-Mail-Adresse wie …        |    | ╰────────────────────────────────────╯ |    |  pad 12/24, 18/600, LH 22.5
  p.input-error 12 px --color-error-600    |    | ─── media (rule, below 1024) ───      |    |
xs 24 · sm 32 · md 40 · lg 44, idle = error
```

### From 1024 px (1280 the same, column re-centred)

```
| 56 (1024) / 176 (1280) | LABEL · Title 44/800 · body 18/1.6     | 56 | media 368 |
|                        | ╭─────────────────────────────────────╮ |    |           |
|                        | │ Trag dich jetzt in die Warteliste ein│ |    |           |   338.2 × 48.5, 1 line
|                        | ╰─────────────────────────────────────╯ |    |           |
|                        | "Zur Warteliste" 168.8 × 48.5 · "To the waitlist" 166.2 × 48.5   |
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| `.btn-inverse` lg | pad 12/24, border 1 transparent, r full, min 48.5 high | 18/600, LH 1.25 | `--spacing-3/6`, `--font-size-lg`, `--border-radius-full` (all inherited from `.btn`/`.btn-lg`) |
| focus ring | 2 px solid, offset 2 | — | `--color-neutral-white` (replaces `--color-primary-500` for this variant) |
| lc-input container | height `--lc-input-height` again in error | unchanged | `--size-interactive-*-height` |

The measured link boxes (prototype with the planned styles in the `layout-hero--page-band` body) put the link at gradient t 0.25–0.66. The design passes over the whole band (t 0–1), so it doesn't depend on that placement.

## 4. States

| State | `inverse` (both themes) | lc-input |
|---|---|---|
| default | fill `#ffffff`, ink `#0d353d`, border 1 px transparent | idle unchanged |
| hover | fill `$color-primary-50` `#f0f8fa`, ink unchanged, colour transition 150 ms (existing list) | unchanged |
| active | fill `$color-primary-100` `#e0f1f4` | — |
| focus-visible | ring 2 px white, offset 2 (`.btn-inverse:focus-visible`, later than the mixin's `.btn:focus-visible` at equal specificity, so it wins) | unchanged (error outline `--color-error-600`) |
| disabled / loading (lc-button) | existing `.btn:disabled` opacity .5; spinner `currentColor` = ink | unchanged |
| error | — | border and outline `--color-error-600`; **height = idle** (AC-2) |
| overflow | label wraps (`.btn` `white-space: normal`, `break-word`); the 37-char DE label is 2 lines at 360, 1 from 1024; no h-scroll (doc 360/360) | long DE errors wrap in the footer as today |

## 5. Theming

### 5.1 AC-6: existing variants on the hero bands

Method: computed colours of each `a[lcButton]` variant (story `components-button-link--variants`), composited the way the default body draws them: group opacity .85 over the band, band = sRGB lerp at t = (x+y)/(w+h). The minimum over t 0–1 in 0.01 steps is given as **text / boundary**, where boundary = max(fill, border) against the band. Light theme first; dark only where it differs (outline, ghost and link use theme tokens).

| Variant | primary (teal) | secondary | neutral | success | info | warning | orange | purple | violet |
|---|---|---|---|---|---|---|---|---|---|
| primary | 4.87 / 1.00 | 4.84 / 1.00 | 5.13 / 1.17 | 4.84 / 1.16 | 5.03 / 1.00 | 4.91 / 1.33 | 5.08 / 1.00 | 5.04 / 1.00 | 5.20 / 1.33 |
| secondary | 3.82 / 1.00 | 3.76 / 1.00 | 3.95 / 1.52 | 3.74 / 1.00 | 3.90 / 1.28 | 3.74 / 1.01 | 3.83 / 1.01 | 3.86 / 1.00 | 3.99 / 1.74 |
| outline (L) | 1.44 / 2.38 | 1.64 / 1.78 | 1.09 / 3.91 | 3.10 / 1.58 | 1.81 / 3.26 | 3.45 / 1.32 | 2.06 / 1.70 | 1.47 / 2.49 | 1.19 / 4.49 |
| outline (D) | 3.20 / 1.28 | 2.43 / 1.16 | 5.12 / 1.54 | 2.18 / 1.10 | 4.30 / 1.44 | 1.86 / 1.02 | 2.39 / 1.08 | 3.37 / 1.29 | 5.88 / 1.59 |
| ghost: text L · D | 1.00 · 2.44 | 1.00 · 1.83 | 1.00 · 4.03 | 1.35 · 1.62 | 1.00 · 3.35 | 1.53 · 1.37 | 1.00 · 1.76 | 1.00 · 2.57 | 1.14 · 4.63 |
| link: text L · D | 1.00 · 2.38 | 1.00 · 1.78 | 1.17 · 3.91 | 1.16 · 1.58 | 1.00 · 3.26 | 1.33 · 1.32 | 1.00 · 1.70 | 1.00 · 2.49 | 1.33 · 4.49 |
| danger | 7.38 / 1.00 | 7.08 / 1.00 | 7.12 / 1.00 | 6.92 / 1.62 | 7.27 / 1.00 | 6.44 / 1.74 | 6.35 / 1.00 | 6.84 / 1.01 | 7.03 / 1.00 |
| warning | 5.89 / 1.70 | 5.95 / 1.30 | 5.98 / 2.84 | 6.00 / 1.16 | 5.98 / 2.35 | 6.09 / 1.00 | 6.17 / 1.29 | 6.04 / 1.83 | 6.00 / 3.26 |
| info | 4.86 / 1.00 | 4.79 / 1.00 | 5.07 / 1.19 | 4.78 / 1.14 | 4.99 / 1.00 | 4.81 / 1.31 | 4.95 / 1.00 | 4.95 / 1.01 | 5.13 / 1.35 |
| **inverse (new)** | **9.28 / 3.62** | 9.18 / 2.70 | 9.74 / 6.02 | 9.15 / 2.39 | 9.57 / 4.99 | 9.22 / 2.01 | 9.55 / 2.61 | 9.56 / 3.81 | 9.87 / 6.94 |

Ghost and link have no boundary (1.00 on every band), so their cells give only the text ratio, light · dark. On the teal band the kit focus ring is 1.00 in light (`#208497` is the band's end colour) and 2.06 in dark (`#84c7d4`). On the half of the band where the life-os link sits (t ≤ 0.5): primary 5.05 / 1.17, which matches the requester's 5.17 / 1.2. Hover and active don't rescue any variant on teal: the best is ghost hover in light, 11.47 / 3.32, but its default is 1.00. The only existing pass is `warning` on `accent-violet` (6.00 / 3.26), and its ring fails there. **No existing variant meets AC-7, so there is no docs-only resolution.**

### 5.2 `inverse`

| Element | Light | Dark | Contrast (computed), teal band worst point t = 1 `#208497`, body opacity .85 · without opacity (footer, media) |
|---|---|---|---|
| fill default / hover / active vs band | `#ffffff` / `#f0f8fa` / `#e0f1f4` | same | 3.62 / 3.39 / 3.16 · 4.37 / 4.06 / 3.76 |
| ink on fill (default / hover / active) | `#0d353d` | same | 9.28 / 8.69 / 8.11 · 13.18 / 12.24 / 11.33 |
| focus ring vs band | `#ffffff` | same | 3.62 · 4.37 |

On the other bands, the fill and ring reach ≥ 3:1 on neutral 6.02, info 4.99, accent-purple 3.81 (active 3.32) and accent-violet 6.94. They don't on secondary 2.70, success 2.39, warning 2.01 and accent-orange 2.61, whose light ends also fail the hero's own white text (3.12 / 2.72 / 2.26 / 3.04 at full opacity). The JSDoc names the five bands it passes on. **No new semantic token:** the values are SCSS palette tokens (`$color-primary-800/-50/-100`) plus `--color-neutral-white` (`#fff` in both theme files). `button.styles.spec.ts` asserts the ratios above (§9).

**Forced colours:** an explicit rule `@media (forced-colors: active) { .btn-inverse { border-color: ButtonText } a.btn-inverse { border-color: LinkText } .btn-inverse:focus-visible { outline-color: Highlight } }`. The shared 1 px transparent border becomes a system-colour boundary.

## 6. Accessibility

- **Semantics:** `a[lcButton]` stays a native link (Tab reaches it, Enter follows `href="#…"`, no listeners), and `lc-button` stays a `<button>`. The variant adds no ARIA and no text.
- **Targets:** lg is 48.5 high (2 lines: 71). sm and md stay below 44 px as on every variant, so the docs recommend lg on bands.
- **Focus:** white 2 px ring, offset 2, ≥ 3.62:1 on the band (§5.2). The 2 px band-coloured gap separates it from the white fill.
- **Reduced motion:** no new motion. The colour transition is the existing `.btn` list, which the global reduced-motion rule cuts to 0.01 ms.
- **lc-input:** `role="alert"` / `announceError`, the ids and `aria-invalid` / `aria-describedby` are untouched. Only a class name moves.

## 7. Texts

No built-in strings: a variant and a class rename. Story labels are checked at 360:

| Use | EN | DE |
|---|---|---|
| band link (life-os R-053) | To the waitlist (166.2 px, 1 line) | Zur Warteliste (168.8 px, 1 line) |
| AC-8 long label | — | Trag dich jetzt in die Warteliste ein (37 chars: 2 lines at 360, 1 from 1024) |
| G-WL3 story error | Please enter a valid email address | Bitte gib eine gültige E-Mail-Adresse ein |

## 8. Stories

Existing stories stay as they are (no new button in *All Variants*), so AC-11 can compare by hash. `variant` argTypes in both button story files gain `inverse` in `options` and in the description.

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Error Keeps the Height (G-WL3) | `form-input--error-keeps-height` | none (render) | Two columns × xs/sm/md/lg: idle and with an error (DE message). The rows line up because the boxes are equal. |
| Inverse (G-WL1) | `components-button--inverse` | `variant: 'inverse'`, `size: 'lg'` | `lc-button` in an `lc-hero color="primary" size="sm"` body: default, with an icon before it, loading, disabled, and icon-only (`ariaLabel`). |
| Inverse (G-WL1) | `components-button-link--inverse` | — | `a[lcButton] variant="inverse"` sm, md and lg in a primary `lc-hero` body, and one with `slot="icon-after"`. |
| Band Link (G-WL1) | `layout-hero--band-link` | `linkLabel` (string, default `Trag dich jetzt in die Warteliste ein`; argType description and `table.defaultValue`), the `PageBand` args, `layout: fullscreen` | The life-os home band: label, title, body `<p>`, then a `display:flex; align-items:flex-start; margin-top:16px` row with `<a lcButton variant="inverse" size="lg" href="#warteliste">`, `[hero-media]` card, `<div id="warteliste">` below. The story imports `ButtonLinkComponent`. |

## 9. Verification

Baseline: `tmp/story-shots/017/baseline` (75 stories, 360/1280, light/dark, `--full`, 300 shots, ddbd4cb). The stories are all form-input (16) and form-email-input (11), `feedback-alert--form-validation`, `form-password-input--with-error` and `form-verification-code-input--with-error`, all components-button (23) and components-button-link (10), and all layout-hero (12). **Expected diffs: 20 shots, and no others.** They are `form-input--with-error`, `form-input--error-summary`, `form-email-input--with-error`, `form-email-input--invite-form` and `feedback-alert--form-validation` (a md field 2 px shorter, so everything below it moves up 2 px).

> **Change note (review r1, 2026-10-25):** the first version said 77 stories and 16 expected diffs. The sum of the list is 75, and `form-email-input--invite-form` also shows an error at load ("Email address is required"), so it differs too: 20 diffs, 280 identical. Found by the developer (build.md Deviations) and confirmed in review r1.

| AC | How | Expected value |
|---|---|---|
| 1 | Unit test: with an error, the container has `input-invalid` and not `input-error`, `p.input-error` doesn't have `input-invalid`, and with no error the container has neither. A grep finds `input-error` in the SCSS only in the message rule. | pass |
| 2 | `form-input--error-keeps-height` at 360/1280, light and dark: `--measure` on each `.input-container` rect, idle, error and error + focus (`input.focus()`) | xs 24, sm 32, md 40, lg 44 in all three |
| 3 | `--compare` against the baseline, plus a measure on `form-input--with-error`: border, outline when focused, message colour and size, `role` | light `rgb(157,14,14)`, dark `rgb(247,161,161)`, 12 px, `role="alert"`; disabled/readonly stories identical |
| 4 | Changelog Changed: "`.input-container` error-state class `input-error` → `input-invalid`; `p.input-error` unchanged" | present |
| 5 | Full unit run. Only `input.component.spec.ts:325` changes (stated reason G-WL3), and `:277` and `input.control-id.spec.ts:30` stay. | all green |
| 6 | §5.1 table (this document) | done |
| 7 | `button.styles.spec.ts`: the WCAG formula on the SCSS values, composited at .85 over `#208497`; plus a review measure of the rendered `layout-hero--band-link` colours | text ≥ 9.28/8.69/8.11, fill ≥ 3.62/3.39/3.16, ring ≥ 3.62 |
| 8 | `layout-hero--band-link` at 360/1024/1280, light and dark: link rect, line count, `scrollWidth <= clientWidth` | 360: 320 × 71, 2 lines; 1024/1280: 338.2 × 48.5 at x 56/176; doc 360/1024/1280 = client |
| 9 | Unit test: the anchor has `href`, no listeners, and class `btn-inverse`. Story: `a.focus()` → `:focus-visible`, ring 2 px white. A stylesheet scan finds the `forced-colors` rule from §5.2. | pass |
| 10 | Compat: a probe page with `<a lcButton variant="inverse" size="lg" href="#warteliste">` inside an `lc-hero`, and `EXPECT_IN_HTML` `class="btn btn-inverse btn-lg"`. probe-312's error field prerenders `input-container[^"]*input-invalid` and has no container `input-error`. | in both prerender outputs (21, 22) |
| 11 | `--compare` (above); `button-link.component.spec.ts:75` list plus `'inverse'`, and the same `it.each` for `lc-button` | 280 identical, 20 expected diffs |
| 12 | JSDoc per §2, argTypes, `npm run test:tools`; the MCP manifest shows `inverse` and the hook text | pass |

**Risks:** a hero story that renders no button doesn't register `.btn` styles, so `BandLink` must render a real `a[lcButton]`. `outlineColor` read back from a `var()` shorthand can come back as `currentColor`, so trust the rule or the shot. The `.btn-inverse:focus-visible` rule must come after `@include mix.focus-ring` in source order.
