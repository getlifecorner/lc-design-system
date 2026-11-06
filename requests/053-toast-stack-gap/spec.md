# Spec 053: lc-toast-outlet stack gap

- **Status:** ready
- **Type:** bug fix
- **Affected:** `lc-toast-outlet` (`toast-outlet.component.scss`, possibly `.html`), `toast.component.scss` (the outlet exclusion), specs `toast.layout.spec.ts`, `toast-outlet.order.spec.ts`, stories `toast-outlet.stories.ts`
- **Semver impact:** patch. Visual spacing fix only, no API change. Toasts that were touching now have 8 px between them.

## Need

Source: 052-s2 (review r2 finding 2, should-fix, pre-existing, not WCAG). In `lc-toast-outlet`, toasts in one stack touch each other: 0 px between cards, also across the two live regions (`polite`, `assertive`). Measured at 360 px: y 690–748, 748–826, 826–884. Expected 8 px (`--spacing-2`) between neighbours, and no extra space for an empty region (both regions are always in the DOM). The standalone `lc-toast` already has an 8 px bottom margin (3.19.1, request 025); the outlet excluded its toasts and never got a replacement.

## What the kit has today

- `.lc-toast-outlet__stack` is a flex column (`column-reverse` at the bottom) with `padding: var(--spacing-4)`, holding two `.lc-toast-outlet__region` flex containers. No `gap`, no margins.
- `lc-toast:not(lc-toast-outlet lc-toast)` carries `margin-bottom: var(--spacing-2)` for standalone toasts only. `toast.layout.spec.ts` describes the outlet as "content-wide, touching" (comment only, no assertion on the gap).
- Bottom stacks (3.33, D-1) reorder the regions with `--latest` and `order: -1`, so the gap must also hold when the regions are swapped.
- No public hook exists for the spacing, and none is requested.

## Scope

- In: an 8 px (`--spacing-2`) vertical gap between every two adjacent toasts of a stack, within a region and across the two regions, in top and bottom stacks, all six positions.
- In: no space from an empty region (no leading, trailing or doubled gap), and none after the last toast, so the stack's padding and its scroll end do not change.
- Not in: a new input or CSS hook, other spacing, enter/leave animation, the standalone toast, the stack padding, offsets.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | Two or more toasts in one region of a stack are 8 px apart (`next.top - prev.bottom`, rounded). Resolved from `--spacing-2`, not a literal. | story + `--measure` at 360 and 1280 px; scss assertion in a spec |
| AC-2 | With one toast in each live region (`polite` and `assertive`) of the same stack, the gap between the last toast of one and the first of the other is 8 px, in top and bottom stacks and when `--latest` swaps the regions. | story + `--measure` at 360 px, top-right and bottom-center |
| AC-3 | A stack with toasts in one region only (the other empty) has no extra space: the first toast sits at the stack's padding edge (`--spacing-4`) exactly as before, and the last ends at the same point as before. No leading or trailing 8 px. | `--measure` of the stack's box and first/last toast edge, compared with 3.33; spec |
| AC-4 | A single toast renders pixel-identical to 3.33 (same position, same stack box height). | `--compare` against the baseline from design |
| AC-5 | Five toasts (the service maximum) fit and scroll as before: the stack's `max-height` and scroll end are unchanged apart from the 4 gaps of 8 px, and the last toast is not clipped at 200 % text. | story at 360 px with 200 % text, `--measure` scrollHeight |
| AC-6 | Bottom stacks keep the newest toast nearest the edge (AC-18 of 052). The existing order spec passes unchanged. | `toast-outlet.order.spec.ts` unchanged |
| AC-7 | Standalone `lc-toast` still has `margin-bottom: var(--spacing-2)` and the outlet's toasts get no double spacing (no 16 px). | `toast.layout.spec.ts` AC-3 unchanged; `--measure` |
| AC-8 | German text (long compound, two-line toast) next to an English one: the gap stays 8 px regardless of height. | story with `lang="de"` message, 360 px |
| AC-9 | Light and dark, `forced-colors` and `prefers-reduced-motion`: the gap is layout only, identical in both themes. | story shots light/dark |
| AC-10 | Prerendered HTML: the layout needs no JavaScript. The spacing comes from CSS only, with no measured or script-set values. | `check-angular-majors.mjs` unaffected; no inline style set by code |
| AC-11 | Defaults unchanged: no input, output or public hook added or removed. Toasts remain `aria-live` regions with `aria-atomic="false"`; the DOM and its order are unchanged, so the screen reader announcement is unchanged. | existing specs green; DOM comparison |
| AC-12 | A story shows a stack of at least three toasts across both live regions, so the review can measure the gap. | `toast-outlet.stories.ts` |

Also covered where it applies: 360 px and desktop (1024, 1280), keyboard (toast close buttons keep their focus order and 44 px targets).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Pure CSS; must not rely on a feature that fails in the supported browsers without a fallback (e.g. `:has()` only if the fallback is the same layout).

## Assumptions

- Assumption: 8 px is `--spacing-2`, as the review states and as the standalone toast uses.
- Assumption: the exact technique (stack `gap` plus an empty-region rule, per-toast margin, or `:empty`) is the designer's decision; only the measured result is fixed here.
- Assumption: `toast.layout.spec.ts` needs no changed assertion; only its "touching" comment is out of date and may be updated.
- Assumption: no backlog rows on `toast` or `toast-outlet` exist in `requests/BACKLOG.md` (checked), so nothing is folded in.

## Open questions

None.

## Resolution

Not applicable: the kit does not cover this.
