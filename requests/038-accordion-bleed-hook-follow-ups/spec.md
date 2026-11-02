# Spec 038: lc-accordion bleed hook robust to a unitless 0, scroll-container note

- **Status:** ready
- **Type:** bug fix (finding 1) + docs only (finding 2)
- **Affected:** `libs/angular-ui-kit/src/lib/accordion/accordion.component.{scss,ts}` (line ~252 `inset-inline`, JSDoc of `variant` ~l. 99), `accordion.stories.ts` (docs bullet l. 77, story text l. 297), `accordion.plain.spec.ts` (l. 104, 221-237), `libs/angular-ui-kit/CHANGELOG.md` (3.23.0 wording is history; new entry only)
- **Semver impact:** patch. No input or default changes; a value that rendered a broken box now renders correctly or is documented.

## Need

A consumer of `variant="plain"` (BA-9, life-os) who sets `--lc-accordion-header-bleed: 0` to put the hover fill and focus ring on the header edge gets `calc(-1 * 0)`, a number, not a length. `inset-inline` is then invalid and the `::before` box is 0 px wide: no focus ring (WCAG 2.4.7/2.4.11 loss) and no hover fill (measured in 035 review, finding 1, `r1-focus`). `0px` works (box = header, 328 px wide at the measured width). Separately, the guidance "keep that much room before a clipping edge" misses scroll containers: a plain accordion in an `overflow-x: auto` box with 0 inline padding scrolls 8 px horizontally; with 8 px padding it does not (finding 2, `r1-scroll`).

## What the kit has today

- Hook is read once: `inset-inline: calc(-1 * var(--lc-accordion-header-bleed, var(--spacing-2)))`. Only the SCSS comment says "`0px` not `0`"; JSDoc, docs bullet, story text and changelog do not.
- The plain spec asserts that exact declaration (l. 221-237), so a CSS change needs a stated reason in the spec edit (the reason is AC-1).
- No `@property` is used anywhere in the kit.

## Scope

- In: (1) make a unitless `0` produce a 0 px bleed if plain CSS allows it without changing the default or the behaviour for lengths; otherwise document "a length: `0px`, not `0`, which removes the ring and the hover fill" in the `variant` JSDoc, the docs bullet, the story text and the changelog. (2) Wording "clipping or scrolling edge" in the same four places, naming scroll containers.
- Not in: new inputs, new hooks, changed default (8 px), any other variant, other components' hooks.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | With `--lc-accordion-header-bleed: 0` on a plain accordion, the `::before` box is not 0 px wide: its width equals the header width (same as `0px`) and the focus ring and hover fill render. If CSS cannot do this without side effects (see Assumptions), AC-2 applies and AC-1 is dropped by the designer with a note in `design.md` | story with `--measure` of `::before` width at 360 and 1280 px; unit/spec assertion on the final declaration |
| AC-2 | If AC-1 is not achieved: JSDoc of `variant`, docs bullet (stories l. 77), story text (l. 297) and the changelog entry all state the hook takes a length and that `0px`, not `0`, is the way to zero it, and that a bare `0` removes ring and hover fill | grep of the four places; MCP manifest text via `npm run test:tools` unchanged-green |
| AC-3 | Default (hook unset) and any length value (`0px`, `4px`, `1rem`, `var(--spacing-2)`) render byte-identical box geometry to 3.24.0: `::before` width 328 at the 035 measurement setup, inset 8 px | story measure, hash compare against the 035 baselines |
| AC-4 | The sentence "keep that much room before a clipping edge" reads "clipping or scrolling edge" (or equivalent naming scroll containers, e.g. an `overflow-x: auto` box) in the `variant` JSDoc, the docs bullet, the story text and the changelog | grep of the four places |
| AC-5 | The changelog entry sits under Fixed (AC-1/2) and Changed or Fixed (AC-4) in a patch section, names BA-9 and 035, and states "no API break" | CHANGELOG review |
| AC-6 | Focus ring contrast stays ≥ 3.97:1 light (over hover fill) and ≥ 6.69:1 dark; `Highlight` in forced colours; reduced motion unaffected | existing 035 values re-measured on the plain story, light and dark |
| AC-7 | Existing accordion specs pass; the only assertion changed is the `inset-inline` declaration (l. 227) if AC-1 changes the CSS, with the reason recorded in `build.md` | `--testFile=accordion.plain.spec.ts` and full suite |
| AC-8 | Keyboard and screen reader: Tab focus ring visible around the header with `0`, `0px` and default; no markup or ARIA change. EN and DE title lengths do not change the box width relation | story at 360 px with DE title, keyboard focus shot |
| AC-9 | Prerendered HTML unchanged (pure CSS) | compat check `check-angular-majors.mjs` green |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Must work in the supported browsers without relying on a feature that fails silently; a fallback must keep the 8 px default.

## Assumptions

- Assumption: Plain CSS cannot coerce a unitless number inside `calc()` to a length, so there is no pure-`calc()` fix. The only candidate is registering the property with `@property --lc-accordion-header-bleed { syntax: '<length>'; inherits: true; initial-value: 8px }`, where `0` is a valid `<length>`. Drawbacks the designer must weigh: a literal `8px` instead of the token, the registration must be global (not component-emulated styles), and it changes the property's type for all consumers. Recommendation: if the designer finds it not clean in a quick check, take the documentation route (AC-2); do not spend a request on it.
- Assumption: The 3.23.0 changelog text stays as history; the new patch entry carries the corrected wording.
- Assumption: No consumer currently sets a bare `0` (life-os uses the default); the fix is preventive.

## Open questions

None.
