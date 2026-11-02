# Spec 032: lc-skeleton applies a percentage width twice

- **Status:** ready
- **Type:** bug fix
- **Affected:** `libs/angular-ui-kit/src/lib/skeleton/` (`skeleton.component.ts`, `.html`, `skeleton.component.spec.ts`, `skeleton.stories.ts`), `CHANGELOG.md`
- **Semver impact:** patch. Only the rendered width of percentage values changes, and it changes to the documented value. No input, default or hook changes.

## Need

Finance Intelligence cockpit, loading card (found in `/prove` 2026-11-02): "name long, cost short at the right edge". The page sets `<lc-skeleton width="30%" />` in a full-width row. The fill is 9 % of the line, and `60%` is 36 %, so the short placeholders shrink to a few pixels and do not reach the edge. Fixed units (`rem`, `px`) are fine. The page keeps its percentages and wants no wrapper or override (ADR-0009).

## What the kit has today

Cause, read from the source: `host: { '[style.width]': hostWidth() }` sets the width on `<lc-skeleton>`. The inner `<div class="lc-skeleton" [style]="styles()">` gets the same `width` again. A percentage on the inner box is relative to the host, so it is the value squared (0.3 x 0.3 = 9 %). With `px`/`rem` the inner box is the same size as the host, so nothing shows. No input, hook or token can work around this from outside. `--lc-skeleton-height` only touches height.

## Scope

- In: apply `width` once. The host keeps the width (and `flex-shrink: 0`); the inner fill is always `100%` wide. Height and border radius stay on the inner box. A story and a changelog entry.
- Not in: any look change (colour, shimmer, height, radius, circle size), new inputs, a change of defaults.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `<lc-skeleton width="30%" />` in a 400 px wide block: the visible fill (`.lc-skeleton`) measures 120 px (30 %), the host 120 px. `60%` gives 240 px. | unit test with measured widths, or story measurement at 360 and 1280 px |
| AC-2 | The inner `.lc-skeleton` has an effective width equal to the host's for every width value (`%`, `px`, `rem`, and the variant defaults `100%` / `40px`). The host carries the requested width: `el.style.width` is `30%`, `120px`, `100%`, `40px`. | unit test (replaces the inner-width assertions in AC-3) |
| AC-3 | The existing spec lines that expect the inner `box().style.width` to equal the input (lines 22, 31, 47) are changed to expect `100%`. The host assertions stay as they are. This is the stated reason for changing them. | `skeleton.component.spec.ts` |
| AC-4 | No look change for fixed units and defaults: the rendered box size and position of `line`, `circle`, `rect` with default and `px`/`rem` widths are identical to 3.22.1 at 360 and 1280 px, light and dark (same shot hashes). | `story-shots.mjs --compare` against shots from the current build |
| AC-5 | A new story shows two skeletons `60%` / `30%` in a row with `justify-content: space-between`, inside a card at 360 px. Measured: 60 % and 30 % of the row width (minus the gap), and the second ends at the right edge. | story + `--measure` at 360 and 1024 px |
| AC-6 | `--lc-skeleton-height`, `height`, `borderRadius` and the reduced-motion static fill behave as before; `skeleton.height.spec.ts` and `skeleton.styles.spec.ts` pass unchanged. | existing specs |
| AC-7 | A circle with `width="40px"` stays 40 px wide and a width given in `%` in a flex row (`flex-shrink: 0`) does not shrink below the host width. | unit test or story measurement |
| AC-8 | Prerendered HTML: the host has the requested inline width (`style="width: 30%"`) and the inner box is `width: 100%` before JavaScript, so the proportions hold without hydration. | prerender check or SSR render in a spec |
| AC-9 | German and English: not applicable (no built-in text). Keyboard and screen reader: unchanged (no new semantics); light and dark covered by AC-4. | n/a |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Consumers that set `width` as a percentage get the intended proportions. This is the fix, and the changelog says it, so they can check for placeholders that were tuned around the bug (for example, a doubled-up `50%` to get 25 %).

## Assumptions

- Assumption: the fix puts the width on the host only and sets the inner width to `100%` (the requester's proposal). An inner-only fix would break flex rows, where the host must have the width.
- Assumption: other width expressions, such as `calc(100% - 2rem)` and `auto`, also fall under the fix. They were affected before in the same way; no extra criterion needed.
- Assumption: an included changelog note in "Fixed" is enough; no Migration section. Patch.

## Open questions

None.

## Resolution

Not applicable. The kit has no way to work around it.
