# Spec 007: Lighter lc-sidenav-placeholder

- **Status:** closed — measured, not worth optimizing (resolution §10)
- **Type:** measurement, no kit change
- **Affected:** none
- **Semver impact:** none

## Need

The life-os app shell must reduce its initial JavaScript bundle from 180 kB back to 150 kB (T331, plan B54, a 30 kB gap). The requester estimated that `lc-sidenav-placeholder` (3.6.0, AS-18) contributes approximately 9 kB gzip to the initial chunk by importing `Router` from `@angular/router`, rxjs `filter`, and five helpers from `@lifecorner/angular-ui-kit/internal/navigation`. AS-28 asked to "measure its gzip share in a shell-like app first; if it is worth it" optimize it to a static placeholder or one with inline logic.

## What the kit has today

`lc-sidenav-placeholder` (3.6.0, AS-18) matches `lc-sidenav`'s full current-item logic:
- Injects `Router` (line 69 of the component)
- Subscribes to `NavigationEnd` events (lines 161–166)
- Imports five navigation helpers from `internal/navigation`: `sortNavigationItems`, `navigationLinks`, `navigationPath`, `currentNavigationItem`, `currentItemParents` (lines 8–14)
- Computes which groups to expand based on `activeRoute` input or the router's URL (lines 140–145)

This prevents CLS at 1024–1920 px but loads dependencies a static skeleton doesn't need.

## Scope

- **In:** Measure the placeholder's gzip contribution in a shell-like app (two builds: defer with placeholder vs defer with empty placeholder). If ≥ 2 kB gzip, implement a lighter version that removes `Router` injection and `internal/navigation` imports while still preventing CLS.
- **Not in:** Changes to `lc-sidenav` itself. Removing the placeholder's expansion logic entirely (groups would never be expanded, causing visible shifts). Breaking the existing API (all current inputs remain, with the same defaults).

## Acceptance criteria (AC-1 only)

AC-2 through AC-8 were not executed because AC-1 showed optimization is not worthwhile.

| ID | Criterion (observable) | Result |
|---|---|---|
| AC-1 | The placeholder's gzip contribution is measured in the bundle fixture (defer + placeholder vs defer + empty placeholder) | **2.50 kB gzip total; removable part (Router+helpers) = 0.33 kB (13%)** — measured in design.md §1 using Angular 22 fixture D |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- If the gzip contribution is < 2 kB, no change is made (optimization not worthwhile).
- The placeholder must still expand the correct groups to prevent CLS; removing expansion logic entirely is not acceptable.

## Assumptions

- **Assumption:** The placeholder's contribution is ≥ 2 kB gzip based on its imports (Router, rxjs, navigation helpers). If measurement shows < 2 kB, the request resolves with no change.
- **Assumption:** Expansion logic can be simplified to a local function that walks the `items` array to find the parent group of an item whose `route` matches `activeRoute`. This avoids `navigationLinks`, `currentNavigationItem`, `navigationPath` and `sortNavigationItems`.
- **Assumption:** When `activeRoute` is empty, the placeholder can fall back to not expanding any groups (or expand the first group by default). Without Router injection, it cannot read the current URL, so the app shell must pass `activeRoute` explicitly for correct expansion.
- **Assumption:** The bundle measurement fixture (`tools/compat/bundle`) can be extended with a new configuration ("defer-no-placeholder") that uses `@defer` with an empty `@placeholder` block.

## Open questions

None. Question A was resolved by the measurement (see resolution).

## Resolution

**Measurement shows optimization is not worthwhile.** Close AS-28 with no kit change. The requester's AS-28 row asked to "measure first; if it is worth it" and named "the kit's placeholder as it is" as the fallback.

### Measured values (design.md §1 table)

Using the F1 fixture build `tmp/003/compat/bundle-next/dist/icons-defer` (config D: icons + deferred sidenav, Angular 22, production):

| Component | Gzip contribution |
|---|---|
| **Whole placeholder** (module, template, styles) | **2.50 kB** |
| Removable part: `internal/navigation` helpers only | 0.33 kB (13% of whole) |
| Router, rxjs: **stay in initial chunk anyway** | 0 kB saving (used by `provideRouter`, `lc-header`, `lc-bottom-nav`) |

The requester's estimate of "~9 kB gzip" was incorrect by 3.6×. The whole placeholder is 8% of T331's 30 kB gap (180 → 150 kB). The part AS-28 targeted (Router subscription and helpers) saves only 0.33 kB (1.1% of the gap).

### Why no optimization

1. **Too small to matter:** 0.33 kB is not worth the complexity and churn of changing a component that works correctly today. Life-os needs 30 kB; this provides 1%.
2. **Breaks existing behavior:** the "no Router" path would remove the documented fallback (when `activeRoute` is empty, read `router.url`). This is a visual change (no group expands vs today's router-based expansion) and breaks test `sidenav-placeholder.component.spec.ts:150`. AC-7 forbade test changes.
3. **AC-5 unreachable:** the spec required ≥50% reduction (≥1.25 kB saved). The measured maximum is 13% (0.33 kB).

### What life-os should do

The 30 kB has to come from elsewhere. Candidates with larger impact:
- Audit Angular router configuration (tree-shake unused guards, resolvers)
- Defer more components in the initial shell (hero, cards, modals)
- Check for duplicate dependencies in the bundle (moment, lodash, chart libs)
- Use `ng-package.json` sideEffects flags to improve tree-shaking

The placeholder as designed prevents CLS at a reasonable cost (2.5 kB for a component that swaps in after 1–2 seconds). Keep `lc-sidenav-placeholder` as it is.
