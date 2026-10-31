# Spec 023: lc-bottom-nav "More" on request; decorative lc-modal close icon

- **Status:** ready
- **Type:** extension of `lc-bottom-nav` (new optional input) + bug fix in `lc-modal` (accessibility)
- **Affected:** `libs/angular-ui-kit/src/lib/bottom-nav/` (ts, html, spec, stories), `libs/angular-ui-kit/src/lib/modal/modal.component.html` (+ spec), CHANGELOG
- **Semver impact:** minor — one new optional input with a default that renders as before; the modal change only adds `aria-hidden` to an svg.

## Need

Finance Intelligence, sources page (concept `quellen.md` §7, §11; gap rows 6 and 8).

- **Row 6:** the app's bottom bar has fixed slots: two targets plus "More". `lc-bottom-nav` renders the overflow entry only when `items.length > maxItems` (`bottom-nav.component.ts`, `entries`). The product cannot ask for "More" explicitly. Today it passes "More" as a normal `BottomNavItem` (`icon="dots"`, `route="/mehr"`) and sets `activeRoute` by hand.
- **Row 8:** the close button of `lc-modal` renders `<lc-icon name="x-mark" size="md" />` without `decorative` (`modal.component.html:32`). The result is an `svg role="img"` without a name inside a button that `closeAriaLabel` already names. axe reports `svg-img-alt` (serious, WCAG 1.1.1) whenever a modal is open. The requester skips that rule for `.lc-modal__close svg` in its own e2e check.

## What the kit has today

- `moreLabel`, `moreIcon`, `moreRoute`, `moreClick` and the "More" entry exist, but are reached only on overflow. With `moreRoute`, "More" is current when `moreRoute` matches or a hidden item matches. Nothing forces the entry. A regular item cannot be "More" with the right semantics (`moreClick` button mode, label/icon defaults, current via `moreRoute`).
- `lc-icon` has `decorative` (used by `lc-bottom-nav`). The modal does not use it. Nothing else in the kit solves either row, so there is no Resolution.

## Scope

- In: `showMore` input on `lc-bottom-nav`; `decorative` close icon in `lc-modal`; stories, specs, changelog.
- Not in: other modal icons or other components' icons (a quick audit is allowed, but only report it; do not change them); a new look; changing `maxItems` logic when `showMore` is off.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | New input `showMore` (boolean, `@default false`, JSDoc). With `showMore` false, the rendered output is identical to 3.17.0 for every existing spec case, with and without overflow. | existing bottom-nav specs unchanged and green |
| AC-2 | `showMore` true with 2 items and `maxItems` 5: the bar renders 2 destinations plus the "More" entry (3 `li`), all items shown, none hidden. | unit test |
| AC-3 | `showMore` true with items at or below `maxItems` hides no item; with items above `maxItems`, the existing overflow rule applies and exactly one "More" entry is rendered (never two). | unit test |
| AC-4 | The "More" entry uses `moreLabel`, `moreIcon` and `moreRoute`. With `moreRoute` it is a link, and without it a button that emits `moreClick`, as on overflow. | unit test |
| AC-5 | The "More" entry is current (`aria-current="page"` on the link, current class) when `activeRoute` matches `moreRoute` by the existing first-segment rule. Exactly one entry is current. | unit test |
| AC-6 | A story "ShowMore" shows two items plus "More", one with "More" current, at 360 px; and in German ("Mehr"). Touch targets stay at least 48 × 64 px and the layout of 3 entries is even (no overflow at 360 px). | story at 360, 1024 px, measured sizes, light and dark |
| AC-7 | Keyboard: Tab reaches "More"; Enter/Space triggers the link or `moreClick`. A screen reader reads the label, and the icon stays hidden. | unit test (button/link, no icon name in the accessible name) |
| AC-8 | The "More" entry renders in the prerendered HTML before JavaScript (same markup as on overflow). | compat check or SSR render test |
| AC-9 | `lc-modal` close icon is rendered `decorative`: the svg inside `.lc-modal__close` has `aria-hidden="true"` and no `role="img"`; the button keeps its accessible name from `closeAriaLabel`. | unit test on the DOM |
| AC-10 | With a modal open in a story, axe (WCAG 2.2 AA) reports no violation (no `svg-img-alt`) inside the close button. | story with axe run, or a spec using the axe checks the repo already uses |
| AC-11 | The modal look is unchanged: close button size, position and focus ring are identical to 3.17.0 in light and dark and at 360 and 1280 px. | story-shots `--compare` with no differing shot |
| AC-12 | CHANGELOG entry (Added: `showMore`; Fixed: modal close icon), with the requester's gap rows; the README and component docs are updated if they list inputs. Compat: no API break. | review of the changelog |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Every new text is changeable through the existing `moreLabel`; no new built-in text.

## Assumptions

- Assumption: the input is named `showMore`, as the requester proposed (it matches `moreLabel`, `moreIcon`, `moreRoute`). The designer may rename it only if there is a clear reason.
- Assumption: with `showMore` and more items than `maxItems`, the normal overflow applies and one "More" entry results. The requester's page has only two items, so this case is a defined edge, not a use case.
- Assumption: with `showMore` and `items.length <= maxItems`, no items move behind "More"; "More" is only appended (the current when `moreRoute` matches). The `hidden.some(...)` current rule applies only on real overflow.
- Assumption: the requester's `maxItems` is left at the default; the spec does not require changing `maxItems` for the fixed-slot case.

## Open questions

None.
