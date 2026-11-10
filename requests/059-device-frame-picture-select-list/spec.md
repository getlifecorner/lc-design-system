# Spec 059: lc-device-frame and lc-picture, lc-select clearable, lc-description-list total whitespace, lc-list item ariaLabel

- **Status:** ready
- **Type:** bundle of 4 items: 2 new components, 2 extensions, 1 bug fix
- **Affected:** new `lib/device-frame/`, new `lib/picture/` (each: stub `ng-package.json`, `index.ts`, line in `src/index.ts`, stories, spec, both READMEs, MCP manifest); `lib/select/`, `lib/description-list/`, `lib/list/`; theme tokens in `_theme-light.scss` / `_theme-dark.scss` only if the bezel needs a new token
- **Semver impact:** minor. New components and optional inputs, defaults render as before. The one text change (AC-17) fixes a bug and is not an API break.

## Need

**A. life-os website, home "screenshots" section (website-screenshots.md §6, §7; G-SS1, G-SS2).** Four app screenshots (PNG 720x1560, DSF 2) at 360 px and 1280 px, DE/EN, light/dark. Today an `lc-card` outlined with `borderRadius="xl"` stands in for a phone frame (no bezel), and a native `<picture>` stands in for the image (no styling, no kit contract). `lc-gallery` is unsuitable (lightbox needs JS, no srcset/`<source>`, no width/height, 1:1 crop). Not blocking.

**B. finance-intelligence services page (services-prove row 1).** `lc-select` always has a value there, but the clear button is shown anyway; it cuts the label at 360 px and overlaps it at 192 px. Bug: the total row of `lc-description-list` has a double space in `textContent` between its parts (3.37/3.38); their tests normalise whitespace to compare.

**C. finance-intelligence Stammdaten page (stammdaten-prove row 1).** Jump-mark rows (`href` or `clickable`) need their own accessible name, for example "Zu Lücken, 3 offen", different from the visible text parts.

## What the kit has today

- `lc-card` (`variant=outlined`, `padding=none`): no bezel, no notch, no media slot. Not a device frame.
- `lc-select`: `clearAriaLabel` exists, but no way to remove the button (`select.component.html` l. 49: `@else if (value() && !isDisabled() && !multiple())`).
- `ListItem`: `actionAriaLabel` only for the action. Link rows (`<a>`) have no `aria-label`; the split row's button uses `aria-labelledby` the row (l. 90); the `role="button"` row has no label hook.
- `lc-description-list` total row (`description-list.component.html` l. 12): `@if (total && totalPrefix()) {<span sr-only>}&ngsp;` plus the `&ngsp;` between dt, leader and dd. Request 057 added the `&ngsp;` words breaks (D-4); the extra space is a side effect.

## Scope

- In: items A (two new components), B (select input, dl fix), C (list input), folded backlog rows (below).
- Not in: other device types (tablet, laptop, desktop) beyond what `device` union leaves room for; image editing, lightbox, lazy-load libraries, CDN/format conversion; changing the `lc-gallery`.
- Backlog rows folded and deleted from `BACKLOG.md`: 057-n1 (select, AC-19), 057-n3 (description-list, AC-18), 057-n5 (list, AC-14).

## Acceptance criteria

### Item A: lc-device-frame (G-SS1, life-os website-screenshots)

| ID | Criterion | Verified by |
|---|---|---|
| AC-1 | `lc-device-frame` (standalone, OnPush, own secondary entry) projects any media (`<ng-content>`) inside a phone bezel. Inputs: `device` (union type, `'phone'` default and only value now) and `size` (union type with `@default`, all with JSDoc). | unit test, MCP manifest lists it |
| AC-2 | Bezel radius, bezel colour per theme and shadow come from tokens or `--lc-device-frame-*` hooks with documented defaults. No raw colours. | scss review, story light and dark |
| AC-3 | Optional notch via an input (default off); it is decorative (`aria-hidden`) and never covers projected content. | unit test, story |
| AC-4 | Projected 720x1560 media keeps its aspect ratio (no crop, no stretch) and the frame's inner screen radius clips it; no layout shift (frame reserves the ratio before the image loads). | story 360/1280, measured box ratio within 1 px |
| AC-5 | At 360 px the frame is never wider than its container (no horizontal scroll); `size` steps measured at 360 and 1280. Two frames side by side (248 px each, board 7) fit at 2 x 248 px. | story, `--measure` |
| AC-6 | Bezel vs page background boundary is at least 3:1 in light and dark, computed; `forced-colors` shows a visible border. | contrast calc, forced-colors story |
| AC-7 | The frame itself is not focusable and has no role; the screen reader reads only the projected content (the image's `alt`). | unit test |
| AC-8 | Works in prerendered HTML: frame markup and size are in the HTML before JavaScript. | compat prerender `EXPECT_IN_HTML` |

### Item A: lc-picture (G-SS2)

| ID | Criterion | Verified by |
|---|---|---|
| AC-9a | `lc-picture` renders `<picture>` with `<source>` elements from a `sources` input (type such as `image/avif`, `image/webp`, `srcset`, optional `sizes`) before the fallback `<img>`. | unit test |
| AC-9b | Light/dark variants: sources can carry `theme: 'light' \| 'dark'`; the variant for the active theme shows without a flash on the prerendered HTML (no JS needed; use `media="(prefers-color-scheme)"` or CSS, designer decides, must also follow the kit's manual theme service). | unit test, prerendered HTML, story both themes |
| AC-10 | `src`, `alt`, `width` and `height` are required inputs (`input.required`); `alt=""` is allowed and marks the image decorative. `loading` (`lazy` default, `eager`), `decoding` (`async` default), `fetchpriority` optional, and `srcset` / `sizes` for the `<img>`. | unit test, strictTemplates compile in compat check |
| AC-11 | The `<img>` has `width`/`height` attributes and CSS `max-width: 100%; height: auto`, so no layout shift; measured aspect ratio before and after load is equal. | story at 360/1280 |
| AC-12 | Composes inside `lc-device-frame` and `lc-card` (story with the 720x1560 shot), with an optional `<figcaption>` pattern documented. Defaults: the kit adds no border/radius unless set by an input or hook. | story |
| AC-13 | German/English `alt` and caption lengths (about 120 chars) do not break the layout at 360 px. | story |

### Item B: lc-select `clearable`, lc-description-list (services-prove row 1 + bug)

| ID | Criterion | Verified by |
|---|---|---|
| AC-19 | `lc-select` input `clearable` (boolean, `@default true`). With `false` no clear button is rendered and the label can use the full width; with default the DOM and CSS are unchanged. Folds 057-n1: for long values at xs/sm/md the text no longer runs under the x (reserve the button's space only while the button is shown). | unit test, story at 360 and 192 px, measured text end less than x start |
| AC-20 | Keyboard (Esc / Backspace behaviour, if any, unchanged) and screen reader name of the select unchanged; with `clearable=false` the tab order has one stop less. | unit test |
| AC-17 | The total row of `lc-description-list` has single spaces only in `textContent` (`/\s{2,}/` does not match) with `totalPrefix`, with and without; sr-only prefix is still read, the leader stays `aria-hidden`; word breaks of 3.37 (D-4) preserved. Their spec that normalises whitespace can compare directly. | unit test (assert exact string) |
| AC-18 | Folds 057-n3: in the 156 px column at 360 px (table *Fill* story) amounts and currency do not break inside a number ("214.300,00 €" stays on one line or breaks only at the space before the currency); long words may wrap only at word breaks first. Layout otherwise unchanged. | story at 360, `--measure` of line boxes |

### Item C: lc-list `ListItem.ariaLabel` (stammdaten-prove row 1)

| ID | Criterion | Verified by |
|---|---|---|
| AC-14 | New optional `ListItem.ariaLabel` (JSDoc, no default): when set, it is the accessible name of the row's control: `aria-label` on the `<a>` (href), on the native `<button>` of the split row (replaces `aria-labelledby`), on the `role="button"` row. The visible label should be part of it (WCAG 2.5.3, documented as `actionAriaLabel` is). Folds 057-n5: without `ariaLabel`, the default accessible name of a row separates its parts (label, subtitle, badge, metadata) with spaces or commas and does not contain the action's name. | unit tests per row kind, accessible-name check |
| AC-15 | Without `ariaLabel` the markup of href and `role="button"` rows is byte-identical to 3.38; only the split row's name text changes (AC-14, folded fix). | unit test, existing assertions unchanged |
| AC-16 | Story with German jump marks ("Zu Lücken, 3 offen") at 360 px, a href row and a clickable row; no visual change; `ariaLabel` on a non-interactive row (neither `href` nor `clickable`) is not rendered (no role-less aria-label), or a dev warning. | story, unit test |

### Always

- 360 px and 1280 px (page-level frame at 1920 px); light and dark; EN and DE; forced-colors and reduced motion (no motion needed); every built-in text overridable (none expected).
- Docs: stories for every new input, both READMEs list the new components, CHANGELOG (Added: device frame, picture, `clearable`, `ariaLabel`; Fixed: total-row space, n1/n3/n5 findings), MCP manifest builds.
- `check-angular-majors.mjs` passes on 21 and 22 (AOT, strictTemplates, prerender); add `lc-device-frame` / `lc-picture` to the compat template if the designer sees fit.

## Constraints

- Peer range unchanged, no new runtime dependency, no API break. New names must not collide with existing selectors (`lc-image`, `lc-picture` not in the kit today).

## Assumptions

- Assumption: component name `lc-picture` (the native element's name); `lc-image` is not added. G-SS2 allowed either.
- Assumption: `device` has the single value `phone` now; the union leaves room for more without a break.
- Assumption: the picture's theme variants are chosen in the designer's step; the owner's constraint is no flash in prerendered HTML.
- Assumption: `ariaLabel` on a split row replaces the `aria-labelledby`, so the action's name drops out of the row button's name (this is the n5 fix); a consumer without `ariaLabel` sees only that change.
- Assumption: the 057-n3 fix stays inside `lc-description-list` styles; the table is not changed.

## Open questions

None.
