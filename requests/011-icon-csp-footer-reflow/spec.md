# Spec 011: lc-icon without inline styles, and footer sections at 320 px with 200 % text

- **Status:** ready
- **Type:** bug fix (G-37, G-36); G-37 also removes a style mechanism, defaults must render the same
- **Affected:** `lib/icon/` (`icon.component.html`, `.scss`, `.ts`, `icon-dom.ts`, specs `icon.component.spec.ts`, `icon.registry.spec.ts`, `icon.production.spec.ts`, `icon.trusted-types.spec.ts`, story), `lib/footer/footer.component.scss`, `tools/compat/` (`EXPECT_IN_HTML` or a new no-style check), CHANGELOG
- **Semver impact:** patch for G-36. G-37: patch if only the default (`color="currentColor"`) path loses its style attributes and a custom `color` keeps working; the rendered size and colour do not change. If the designer chooses to drop the custom `color` string, that is major: send to the owner.

## Need

life-os website v0 (`docs/ux/concepts/website-v0.md` §7) ships under CSP `style-src 'self'` without `unsafe-inline` or hashes (plan W4).

- **G-37 (blocking):** every prerendered `lc-icon` carries `style=""` attributes, which the browser blocks: `.icon-container` gets `style="width:24px;height:24px"` from `[style.width]/[style.height]` (`icon.component.html:4-5`), and the `<svg>` gets `style="color: currentcolor;"` from `decorateSvg` (`icon-dom.ts:67-68`). The next-step card's eye and home bubble are on every page, so the website's build check is red until this ships. (Browser-side CSSOM writes are allowed under this CSP; serialised `style` attributes in the prerendered HTML are not.)
- **G-36:** `lc-footer__sections` uses `repeat(auto-fit, minmax(10rem, 1fr))` (`footer.component.scss:16`). At 320 px with 200 % text, 10rem (= 320 px at 200 %) plus the footer padding exceeds the container, so the page scrolls sideways (WCAG 1.4.10). The website carries a page-level rule labelled `G-36` meanwhile.

## What the kit has today

- `lc-icon` already puts `icon-<size>` classes on the container, but their rules are empty comments ("actual sizing is inline"). `size` maps xs/sm/md/lg/xl to 16/20/24/32/40 px.
- `color` input (default `'currentColor'`) accepts any CSS string (`#FF5733`, `var(--color-primary-500)`); tests pin it on `svg.style.color`.
- `width`/`height` attributes on the `<svg>` are presentation attributes, not `style`, and are allowed by this CSP.
- Footer: no hook for the minimum column width. Reflow fixes from 3.11.0 (request 010) used the same pattern.

## Scope

- In: size through classes in the stylesheet; no `style` attribute in the prerendered or hydrated HTML for the default colour; footer grid minimum that cannot exceed the container.
- Not in: new inputs, other components' inline styles (only report them if found), the stories' own `style=` demo markup, how the consumer ships component CSS.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `<lc-icon name="home" />` for each size xs/sm/md/lg/xl renders with no `style` attribute on `lc-icon`, `.icon-container` or `<svg>`: `querySelectorAll('[style]')` inside the host is empty | unit test, all sizes, outline and solid |
| AC-2 | Same on the server: the prerendered HTML of an `lc-icon` (registered glyph, bundled set and decorative and labelled) contains no `style=` | compat check in `tools/compat` (extend the expectations to assert no `style=` in `lc-icon` output), Angular 21 and 22 |
| AC-3 | Rendered box is unchanged: container is 16/20/24/32/40 px wide and high per size at 360 and 1280 px, light and dark, computed from the `icon-<size>` class; svg `width`/`height` attributes keep their px values | story + `--measure` before/after, and unit assertion of `getComputedStyle` where jsdom allows |
| AC-4 | Default colour is `currentColor` through the stylesheet: the svg inherits the text colour of its parent (checked in light and dark, in `forced-colors`, where it follows `CanvasText`/link colour) | story + `--measure` of computed `color` |
| AC-5 | A custom `color` (`#FF5733`, `var(--color-primary-500)`) still colours the icon, with the existing values. Only this opt-in path may set a style, and only when `color` differs from `currentColor`. Setting it must not run in a way that a `style-src 'self'` CSP blocks in the browser (CSSOM, not `setAttribute('style')` or markup parsing); the designer documents that on the server it appears as a `style` attribute for custom colours only | unit test (existing assertions on `svg.style.color` for custom values stay); `color` JSDoc and story say so |
| AC-6 | Switching `color` from custom back to default, or `size` between values, leaves no stale `style` or size class | unit test |
| AC-7 | Hydration: after hydration of a prerendered icon there is still no `style` attribute and no flicker or size change | compat check or unit test with `provideClientHydration` |
| AC-8 | Footer: `lc-footer` with 4 sections at 320 px viewport and 200 % text has `document.documentElement.scrollWidth <= clientWidth`, no section wider than the container; same at 360 px, English and German section titles | story + width 320/360 + `--measure`, 200 % text via root font-size |
| AC-9 | Footer at 1024 and 1280 px: column count and widths are identical to 3.11.0 (min column still 10rem when it fits) | story + `--measure` against the baseline |
| AC-10 | Footer links keep 44 px targets, focus-visible, and the heading level behaviour; light and dark unchanged | existing footer spec and story pass |
| AC-11 | No input, selector, output or public CSS hook is removed or renamed; defaults render as before; peer range unchanged | existing specs pass; only assertions that read `container.style.width/height` change (see Assumptions) |
| AC-12 | CHANGELOG entry (Fixed) names G-37 and G-36, the website's CSP, measured values, and says "no API break" | review |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Icons registered via `provideIcons` and the Trusted Types path (request 003) keep working; log nothing CSP- or Trusted-Types-like on success (life-os e2e listener fails on such text).

## Assumptions

- Assumption: only the default `currentColor` must be style-free; a custom `color` is an explicit opt-in and may keep a style written through CSSOM. Rationale: the website uses the default, and dropping the custom colour would be a major change.
- Assumption: the container size comes from `.icon-<size>` rules (width/height) in the component stylesheet; a custom property set by those classes is equally acceptable, designer's choice.
- Assumption: existing specs that assert `container.style.width/height` (`icon.registry.spec.ts:193-194,241-248`, `icon.production.spec.ts:98-104`) and the `style="color: currentcolor;"` snapshots in `icon.trusted-types.spec.ts:93,100` change, because they pin the mechanism and not the behaviour; they move to class and computed-size assertions. This is the stated reason for changing them.
- Assumption: how component CSS reaches the page (external file vs `<style>` tags) is the consumer's build setting and out of scope.
- Assumption: the footer minimum is `minmax(min(10rem, 100%), 1fr)`, as proposed, unless the designer finds a better one; the 10rem desktop layout stays.

## Open questions

None.

## Resolution

Not applicable: the kit has no way to render these two without change.
