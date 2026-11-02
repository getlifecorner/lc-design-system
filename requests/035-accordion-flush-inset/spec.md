# Spec 035: lc-accordion flush form without inline padding

- **Status:** ready
- **Type:** extension of `lc-accordion`
- **Affected:** `libs/angular-ui-kit/src/lib/accordion/` (`accordion.component.{ts,scss,spec.ts}`, `accordion.stories.ts`), CHANGELOG; MCP manifest follows from JSDoc
- **Semver impact:** minor — one new optional input or value, the default renders exactly as before.

## Need

life-os feature 004 (BA-9), booking sheet "Quelle ansehen": an `lc-accordion variant="flat"` sits inside a bottom sheet. At 360 px the header text starts about 43 px from the sheet edge, while the description list above it starts at 24 px, so the disclosure is about 19 px further in. The header's inline padding (1.125rem at `md`) plus the sheet's own padding add up. The requester wants the disclosure to line up with the surrounding content. Content inside a sheet or card already has its own gutter.

## What the kit has today

- `variant="flat"` removes border and background only; header and body keep their padding (`accordion.component.scss`, `__header` and `__body` rules per size).
- Public hooks `--lc-accordion-header-padding` and `--lc-accordion-body-padding` can set the padding to `0.875rem 0`. This nearly solves it, but it is not a documented flush form, and these gaps remain:
  - The collapsed body still carries inline padding (`0 1.125rem`, `0 0.875rem`, `0 1.375rem`) and animates it to the hook value on open, so the body content shifts sideways while expanding.
  - The focus ring is `outline-offset: -2px` inside the header; with zero inline padding it lies on the glyphs and is not visibly separated from the text. Nothing is defined for `forced-colors`.
  - The flat container keeps `overflow: hidden` with a large radius, which can clip text or ring at the start edge.
  - A consumer needs two hooks, sized per `size`, to get what the proposal asks for.

So the gap is real but narrow: the existing hooks are a workaround, not a supported flush form.

## Scope

- In: a flush form for the flat accordion (input name and shape decided by the designer: `variant="plain"`, `inset="none"` or similar, requester's own suggestions) with zero inline padding on header and body for all three sizes and in collapsed and expanded states; touch height, chevron at the end edge, visible focus ring in all modes.
- Not in (non-goals): changes to `outlined` or the existing `flat`; `lc-accordion-group` behaviour beyond passing the new value through if it forwards `variant`; BA-10 (description list, request 033 follow-up); new colours or tokens unless the focus ring needs one.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | The flush form is selectable through one new optional input or value; with it, header and body have 0 inline padding at `sm`, `md` and `lg`, collapsed and expanded. | unit test (computed class) + story with measured padding |
| AC-2 | In a 328 px wide container at a 360 px viewport, the header title's left edge (start edge in RTL) is at the container's start edge (0 px offset, +/- 0.5 px), and the body text starts at the same x. | story at 360 px with `--measure` |
| AC-3 | The header's height is at least 44 px at every size (including `sm`), also with a one-line title. | story measurement of the header button at 360 and 1280 px |
| AC-4 | The chevron stays at the end edge (trailing) and at the start edge with `chevronPosition="leading"`, with a gap to the text that does not change versus today. | story measurement |
| AC-5 | The focus ring is visible on `:focus-visible`: 2 px, 3:1 against the adjacent background in light and dark, not covering text (a visible separation of at least 2 px between ring and glyphs, or the ring drawn outside the text box), and not clipped by the container. In `forced-colors: active` the ring remains visible (system colour). | story with keyboard focus at 360 px, light/dark, forced-colors screenshot; contrast computed |
| AC-6 | Expanding does not move the body content sideways: its inline start x is identical collapsed and expanded, and during the transition. | story measurement before and after toggle |
| AC-7 | Hover background in the flush form does not leave glyphs touching a clipped edge; with `prefers-reduced-motion` no transition runs. | story, visual review |
| AC-8 | Existing `outlined`, `flat` and all sizes render pixel-identical to 3.22.4 when the new input is not set; the existing hooks `--lc-accordion-header-padding` and `--lc-accordion-body-padding` still win where set. | existing specs unchanged and green; `--compare` shots of current stories identical |
| AC-9 | Keyboard and screen reader unchanged: Enter and Space toggle, `aria-expanded`/`aria-controls`, heading level, `inert` collapsed panel; axe spec passes for the new form. | `accordion.component.spec.ts`, `accordion.axe.spec.ts` |
| AC-10 | German title of about 40 characters wraps inside the header at 360 px without overflow and keeps AC-3 and AC-4. | story with DE text at 360 px |
| AC-11 | Layout holds in prerendered HTML before JavaScript: the flush class is on the host element's template in the server render. | compat check (`check-angular-majors.mjs`) or prerender grep for the class |
| AC-12 | Both themes: light and dark story shots of the flush form (collapsed, expanded, focused). If `lc-accordion-group` forwards `variant`, the new value works there too. | stories, group spec if applicable |
| AC-13 | JSDoc with `@default` on the new input, story with argType `description` and `table.defaultValue`, a story "inside a card/sheet" aligned with a text line above, CHANGELOG entry citing BA-9, README component lists need no change. | review |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Use tokens, no raw colours; BEM naming; any new CSS hook named `--lc-accordion-<property>` with a documented default.

## Assumptions

- Assumption: a minor release; the new input is optional and defaults to today's behaviour.
- Assumption: the name and shape (new `variant` value versus a separate `inset` input) is the designer's decision; a separate input is preferable if combining with `outlined` makes sense, a `variant` value if it only ever applies to flat.
- Assumption: the requester's 328 px container is the 360 px viewport minus 2 x 16 px sheet gutter; the measurement counts from the container's edge, not the viewport.
- Assumption: RTL is not tested by the kit elsewhere in this component; use logical properties for the new rules, so no extra RTL AC is needed.

## Open questions

None.

## Resolution

Interim for life-os until the release (not a fix of the listed gaps, since the ring and body shift remain):

```html
<lc-accordion variant="flat" title="Quelle ansehen"
  style="--lc-accordion-header-padding: 0.875rem 0; --lc-accordion-body-padding: 0.875rem 0 1rem">
```
