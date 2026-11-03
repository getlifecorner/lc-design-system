# Spec 045: Toast offsets in the app shell, reserved aside column, wide page content

- **Status:** ready
- **Type:** extension of `lc-toast-outlet` (AS-34) and `lc-app-page` (AS-35, AS-36)
- **Affected:** `lib/toast/toast-outlet.component.{ts,scss}` and stories; `lib/app-shell/app-page.component.{ts,html,scss}`, `app-shell.component.scss` (only if it must publish a value for the toast), `app-shell.stories.ts`, `docs/app-shell.mdx`, specs, CHANGELOG
- **Semver impact:** minor. New optional inputs and hooks; with the new inputs unset, toasts outside a shell and pages without aside keep today's layout (AC-1, AC-10).

## Need

life-os app shell round 11 (approved 2026-11-03; concept `docs/ux/concepts/app-shell.md` §5.3, §7.1; boards 15, 16, 18, 24 to 27). Three things fail in the shell today:

- **AS-34:** `.lc-toast-outlet__stack` is `position: fixed` at `top: 0` / `bottom: 0`. On a 360 px phone a `bottom-center` toast covers the floating bottom bar, and a top toast covers the header and the page title. The shell's `--lc-app-shell-bottom-clearance` and the safe-area inset are not used by the outlet.
- **AS-35:** `lc-app-page` docks the aside only when `asideLabelledby` or `asideAriaLabel` is set. A page with nothing to put there is centred in the wider space, so the column "jumps" between pages from 1280 px.
- **AS-36:** one page (the account page, with a table) needs more than the 880 px content cap, extending into the aside column, without moving the content's left edge.

All three are not blocking (WCAG 2.4.11, 1.4.4 for AS-34). Requester tried nothing locally; the gaps are the ask.

## What the kit has today

| Need | Today | Why it falls short |
|---|---|---|
| AS-34 | `--lc-app-shell-bottom-clearance` (public hook, default `max(112px + inset, bar + 40px + inset)` as private `--_clearance` on `.lc-app-shell`) | Private value, set on the shell element; the fixed outlet does not read it. No top offset, no header height value. |
| AS-35 | `asideLabelledby` / `asideAriaLabel` gate `hasAside()`; `--lc-app-page-aside-width` | No way to keep the column without a landmark. |
| AS-36 | `contentMaxWidth` (any CSS length or `none`) | Centres the content in the main column; never extends into the aside, and the aside keeps its tint. |

Nothing covers the three; no BACKLOG rows on `lc-toast-outlet`, `lc-app-page` or `lc-app-shell` (grepped).

## Scope

- In: AS-34 offsets for the outlet; AS-35 reserved empty aside; AS-36 wide content.
- Not in: the toast's look, auto-dismiss, live-region logic; moving the outlet into the shell; a new aside content API; other pages' use of `wide` (life-os decides).

## Acceptance criteria

### AS-34 (life-os, toast outlet)

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | Unchanged defaults: an outlet used outside `lc-app-shell`, with no offset input or hook set, renders every position exactly as before (top stacks at `top: 0`, bottom at `bottom: 0`). | unit test on computed styles; existing outlet and layout specs unchanged |
| AC-2 | Inside `lc-app-shell` with the floating bottom bar at 360 px, a `bottom-*` toast's lower edge sits at or above the bar's top edge plus a gap of at least 8 px, and above the safe-area inset (tested with `env()` simulated at 34 px). The bar's items are never covered. | story at 360 px + `--measure` of toast and bar rects; unit test for the offset value |
| AC-3 | Inside `lc-app-shell`, a `top-*` toast's top edge sits at or below the header's bottom edge (plus the top safe-area inset), so neither header nor the page title is covered, at 360 and 1280 px. | story + `--measure` of rects at 360, 1280 |
| AC-4 | The offsets are overridable and documented: a bottom and a top offset, each as an input or a `--lc-toast-outlet-*` hook (designer decides; the hook wins over the input if both exist), each with a `@default` and a story that uses it without `lc-app-shell`. Wide screens (at 1024 px and up, where the bar is hidden) keep `bottom-right` clear of the bar-less layout. | unit test; story at 360 and 1280 |
| AC-5 | A toast stack taller than the free space (three stacked toasts at 360 px, 200 % text zoom, DE text) stays inside the viewport between the offsets and its toasts remain reachable (stack scrolls or caps; no toast is cut off without a way to reach its close button). | story at 360, DE, 200 % zoom + measure; WCAG 1.4.4, 2.4.11 |
| AC-6 | Light and dark, `prefers-reduced-motion`, `forced-colors` unchanged; live regions and focus order unchanged (existing specs green). Prerendered HTML contains the outlet stacks with the default offset CSS (no layout shift once JS runs). | existing specs; story in both themes; compat prerender check |

### AS-35 (life-os, reserved aside)

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-7 | A new optional boolean input (suggested `reserveAside`, default `false`) renders the aside column from 1280 px with the same width (360 / 400 / 460 px, `--lc-app-page-aside-width`), tint and hairline as a named aside, with no content. | unit test on class and DOM; story at 1280, 1440, 1920 with `--measure` of column width and of `main` left edge |
| AC-8 | The reserved column has `aria-hidden="true"`, no `role`, no `aria-label(ledby)`, is not in the accessibility tree and not focusable; no landmark is added (exactly one `complementary` only when `asideLabelledby` / `asideAriaLabel` is set). | unit test on attributes; a11y query in the story |
| AC-9 | With both a name and `reserveAside`, the named aside wins (a real landmark, with content). A page with `reserveAside` and one without it, at 1280 px, have the same `main` left edge and content position as a page with a named aside. Below 1280 px nothing is rendered or reserved. | story with three pages + measure at 1280 and 1024 |
| AC-10 | Unchanged defaults: without `reserveAside`, and without an aside name, the DOM and layout are identical to 3.27.2. `app-page.padding.spec.ts` and existing app-shell specs pass unchanged. | existing specs; unit test |
| AC-11 | The reserved column's tint and hairline pass the same checks as today in light, dark and `forced-colors` (no text inside; tint is decorative, hairline unchanged). | story in both themes; forced-colors rule reused |

### AS-36 (life-os, wide page)

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-12 | A new optional input `contentWidth` of an exported union type (`AppPageContentWidth = 'default' | 'wide'`), default `'default'`, with JSDoc `@default`. | unit test; MCP manifest shows it |
| AC-13 | With `wide` at 1280 px and up, the content's left edge is the same as `default` (measured), and the content extends to the right up to 928 px of content width, into the aside column. At 1280 px with a reserved or named aside, the aside's tint and hairline are hidden under the widened content while the column keeps its width; no horizontal scrollbar at 1280, 1440, 1920 px. | story + `--measure` of content left and width at 1280, 1440, 1920 |
| AC-14 | Below 1280 px `wide` renders identically to `default` (same rects at 360, 640, 1024). | story + measure |
| AC-15 | `wide` together with an aside that has real content: the content is not overlapped by the aside's content and focus order is DOM order (main, then aside); the designer states how the two combine (hide tint only, or the aside content hidden) and the story shows the account page case: a wide table in German (long headers) with an empty reserved column. | story at 1280 and 1920, DE; design review |
| AC-16 | `contentMaxWidth` set explicitly wins over `wide`'s 928 px; `--lc-app-page-content-max` stays the one cap variable. Default `contentWidth` leaves the `880px` cap. | unit test |
| AC-17 | Light and dark, keyboard (a wide table's scroll region stays focusable, focus ring visible), `forced-colors`. | story; manual keyboard walk |

### Whole bundle

| ID | Criterion | Verified by |
|---|---|---|
| AC-18 | Every new input, hook and variant has a story with `description` and `table.defaultValue`; the app-shell story with floating bar at 360 px shows a toast at top and bottom (AS-34 story). | stories |
| AC-19 | `docs/app-shell.mdx`, the JSDoc of `AppPageComponent` and `ToastOutletComponent`, and the CHANGELOG (gap IDs, consumer page, measured values, "no API break") are updated. | review |
| AC-20 | English and German text lengths: toast text and a wide-table header in DE do not clip or overlap at 360 px and 1280 px. | stories in DE |

Always covered: 360 px and desktop widths · light and dark · keyboard and screen reader · EN and DE · prerendered HTML · unchanged defaults.

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- The outlet stays a single `position: fixed` element; no JS measurement is needed to render the first frame correctly (prerendered HTML). If a measured header or bar height is used, it falls back to CSS values first (as `--_lc-app-shell-bar` does).
- The 928 px figure and the 360 / 400 / 460 px column widths come from the concept; do not change them.

## Assumptions

- Assumption: the outlet is rendered inside or next to `lc-app-shell`; the shell (or a hook on an ancestor) must pass the clearance and the header height to it, because `--_clearance` is private to `.lc-app-shell`. Mechanism (shared public hook, new shell-set variable, or input) is the designer's choice, as long as AC-1 holds.
- Assumption: `reserveAside` and `contentWidth="wide"` are on `lc-app-page` only; `lc-app-shell` forwards nothing.
- Assumption: below 1024 px the bottom bar is the only thing the bottom toast must clear; from 1024 px the bar is absent (side navigation), so the bottom offset is the safe area plus the normal padding.
- Assumption: the concept file could not be read at the path in `request.md` (the worktree no longer exists); the item texts in `request.md` and the main life-os `app-shell.md` line 11 and 278 were used.

## Open questions

None.

## Resolution

Not applicable: the kit does not cover these.
