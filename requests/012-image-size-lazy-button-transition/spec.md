# Spec 012: Intrinsic image size and lazy loading for logo, character and avatar, and a narrower button transition

- **Status:** ready
- **Type:** extension of `lc-logo`, `lc-character`, `lc-avatar`; bug fix for `.btn` (G-41)
- **Affected:** `lib/logo/` (ts, html, spec, stories), `lib/character/` (ts, html, spec, stories), `lib/avatar/` (ts, html, spec, stories), `lib/button/button.component.scss` + `button.styles.spec.ts`, `tools/compat/` (`EXPECT_IN_HTML`), `CHANGELOG.md`
- **Semver impact:** the kit's own rule makes new optional inputs a **minor** (3.12.0). The owner decided on 2026-10-23 "release as a patch after 3.11.1". Assumption: the owner's decision stands (3.11.2); the release-manager notes the deviation in `release.md`. No API break either way.

## Need

The life-os website (`docs/ux/concepts/website-v0.md` §7, §13) has build-time budget checks: every `<img>` carries `width` and `height`, every below-fold `<img>` is `loading="lazy"`. They are red today and have no interim, except G-41.

| Gap | What fails today |
|---|---|
| G-38 | `lc-logo` (inside `lc-header`) renders its `<img>`s with neither `width` nor `height`: the browser cannot reserve the space before the SVG arrives |
| G-39 | `lc-character` (Edu above the horizon, below the fold on every page) has `width="100" height="100"` but no way to load lazily |
| G-40 | `lc-avatar`'s `<img>` (person card, below the fold) has no `width`/`height` and no way to load lazily |
| G-41 | `.btn` has `transition: all`; in `lc-next-step-card` the first layout starts it and the CTA buttons grow for about 150 ms on every load (padding, font size, colours). Page height then depends on timing (measured by the requester: +22 to +84 px). Interim on the page: `transition: none`, labelled `G-41` |

## What the kit has today

- `lc-logo`: `<img>` with class `size-xs…xl` (CSS height 24/32/48/64/96 px, `width: auto`), inputs `src`, `emblemSrc`, `darkSrc`, `darkEmblemSrc`, no size attributes. Built-in files: lockup viewBox 485 × 100; emblem 100 × 100 (the small emblem at `xs`/`sm`, also 100 × 100 viewBox). In `colorMode="auto"` with a dark source, two `<img>`s are in the DOM.
- `lc-character`: both theme `<img>`s already have `width="100" height="100" decoding="async" fetchpriority="low"`; no `loading` input.
- `lc-avatar`: `<img class="lc-avatar__image">` with CSS `width/height: 100%` of the box (`xs` 1.5, `sm` 2, `md` 2.5, `lg` 3, `xl` 4 rem = 24/32/40/48/64 px); no attributes, no `loading` input.
- `.btn`: `transition: all var(--animation-duration-base) …` (`button.component.scss:18`). `.btn.btn-inline` already narrows it to `color, background-color, border-color, box-shadow` (line 256, pinned by `button.styles.spec.ts:63`), so the target list has precedent.
- Nothing solves this with existing inputs or classes: `loading` and size attributes cannot be set from outside on the inner `<img>`.

## Scope

- In: size attributes on every `lc-logo` `<img>` and `lc-avatar` `<img>`; a `loading` input on `lc-character` and `lc-avatar`; the `.btn` transition list.
- Not in (non-goals):
  - a `loading` input on `lc-logo` (not requested; the logo is above the fold)
  - changing the character's `width`/`height` (already present) or `fetchpriority`
  - narrowing `transition: all` in other components (input, select, checkbox, … carry the same pattern; separate request if wanted)
  - `NgOptimizedImage`, `srcset`, `priority`
  - changing hover/active/disabled visuals of buttons

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `lc-logo` with the built-in files: every rendered `<img>` has `width` and `height` for `variant="full"` at each size `xs…xl`; the ratio `width/height` is within 0.5 % of 4.85 (485 : 100). Both `<img>`s carry them in `colorMode="auto"` | unit test, per size |
| AC-2 | `lc-logo` built-in `variant="emblem"`: `width` = `height` = the size's CSS height (24/32/48/64/96), for the normal and the small emblem | unit test, per size |
| AC-3 | `lc-logo` with a custom `src`/`emblemSrc`: new optional inputs (names: designer) set `width` and `height`; when they are not set, no size attributes are written (the kit does not know the ratio) and the markup is as before | unit test |
| AC-4 | Layout does not shift because of the attributes: at 360 and 1280 px, light and dark, the rendered box of every `size-*` logo is the same before and after the image has loaded, within 1 px (CSS height still wins, `width: auto`); the rendered size after load equals 3.11.1 | story + `--measure` against the 3.11.1 values |
| AC-5 | `lc-character` has an input `loading: 'eager' \| 'lazy'`, default `'eager'`, written as the `loading` attribute on every theme `<img>` (both in `auto`, one when `colorMode` is pinned). Existing `width`, `height`, `decoding`, `fetchpriority` unchanged | unit test, all three colour modes |
| AC-6 | `lc-avatar` `<img>` has `width` and `height` equal to the size's pixel value (xs 24, sm 32, md 40, lg 48, xl 64); the rendered avatar is the same size as before at every size | unit test + story measurement at 360 and 1280 px |
| AC-7 | `lc-avatar` has the same `loading` input as AC-5 (same name, same type, default `'eager'`), written on the `<img>`; the initials fallback and the `(error)` fallback are unaffected | unit test |
| AC-8 | `.btn` computes `transition-property: color, background-color, border-color, box-shadow` with the duration and timing unchanged; no other property in the base rule is animated. `.btn.btn-inline` stays as is | `button.styles.spec.ts` (new assertion) + computed style in a story |
| AC-9 | Inside `lc-next-step-card`, at 360, 1024 and 1280 px (EN and DE), the CTA buttons' height and width at the first frame equal their height and width 500 ms later (difference 0 px); the card height is stable. Hover, focus and active colour changes still animate | story + `--measure` sampled at load, and after 500 ms |
| AC-10 | Prerendered HTML (SSR, before JavaScript) contains the attributes: `width`/`height` on the `lc-header` logo `<img>` and on an avatar `<img>`, `loading="lazy"` on a character and an avatar with the input set. Add a check to `EXPECT_IN_HTML` for the logo | `check-angular-majors.mjs` on Angular 21 and 22 |
| AC-11 | Unchanged defaults: without the new inputs, the character and the avatar render `loading="eager"` (or no attribute, designer's call; behaviour is eager either way); logo and avatar layout is pixel-identical to 3.11.1 | unit tests + screenshot hash compare at 360 and 1280 px, light and dark |
| AC-12 | Every new input and the changed behaviour has a story with `description` and `table.defaultValue`; the MCP manifest shows the new inputs with JSDoc and `@default` | stories + `npm run test:tools` |
| AC-13 | A11y and themes: no change to roles, `alt`, `aria-*`, focus or contrast; lazy and size attributes work in light, dark and forced-colors | unit tests on a11y attributes; one story per theme |
| AC-14 | CHANGELOG entry per gap (G-38 … G-41) with the measured values, the new input names, and a note for life-os: drop the page-level `G-41` rule | changelog review |

Not applicable: keyboard and EN/DE length for the image gaps (no text change); both apply to AC-9.

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Static attributes only (no inline style, no script): must hold under the strict CSP of the life-os app.
- The release goes after request 011: 3.11.1 is not held back. At intake the tag `v3.11.1` is not yet pushed; the release-manager releases 011 first and builds on top of its commit.
- Naming of the new `lc-logo` inputs must not collide with existing inputs; the shared `loading` input uses the same name and type on character and avatar.

## Assumptions

- Assumption: the built-in lockup keeps its 485 : 100 ratio; the attributes per size may be rounded or the nominal 485 × 100 may be used on all sizes (designer decides; AC-1 and AC-4 set the tolerance).
- Assumption: with a custom `src` and no size inputs, no attributes are written. Guessing a ratio would reserve wrong space; "unchanged defaults" outweighs the budget rule here.
- Assumption: losing the animation of `opacity` (disabled state) and any other property outside the list is acceptable; it was not designed behaviour, and `.btn-inline` already works this way.
- Assumption: `character` keeps its fixed `100 × 100` attributes (CSS sets the rendered size).
- Assumption: other `transition: all` in the kit are out of scope.

## Open questions

None for the owner. One note to the owner by way of the release-manager: the patch decision versus the kit's "new input = minor" rule (see Semver impact).

## Resolution

Not applicable; the kit does not cover this today.
