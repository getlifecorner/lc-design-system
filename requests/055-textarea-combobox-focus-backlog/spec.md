# Spec 055: lc-textarea / lc-combobox focus(), backlog sweep (9 rows)

- **Status:** ready
- **Type:** extension of `lc-textarea`, `lc-combobox`, `lc-drawer`, `lc-gallery`, `lc-sidenav`; bug fixes in `lc-alert`, `lc-sidenav`; docs/stories/spec cleanups in `lc-bottom-nav`, `lc-toast-outlet`, `lc-tag-input`
- **Affected:** `textarea/`, `combobox/`, `drawer/`, `gallery/`, `sidenav/`, `alert/`, `bottom-nav/`, `toast/` (`toast-outlet.component.ts`, `.stories.ts`, `.gap.spec.ts`), `tag-input/` stories, CHANGELOG
- **Semver impact:** minor. New public methods and inputs only; defaults render as before (only the 054-n1 narrow-alert layout changes, a defect fix).

## Need

**Item 1 (finance-intelligence, row 1 of monatsstand-prove-2026-11-06).** Forms that open ("Monat einfrieren", "Freigeben") must focus their first field, and after a 422 the field with the error (WCAG 2.4.3). `lc-textarea` and `lc-combobox` have no public way to focus their native field, so the page queries `lc-textarea textarea` / `lc-combobox input` itself. Proposal in the requester's words: a public `focus()` on both.

**Item 2 (owner).** The whole backlog (9 rows) in one bundle. Rows below are folded in and deleted from `BACKLOG.md`, except 054-n2.

## What the kit has today

- `lc-textarea`: private `textareaElement` viewChild (line 58), no public focus. `lc-combobox`: private `inputEl`, `openOnFocus` input (3.32) opens the list in `onInputFocus()`; so a plain `inputEl.focus()` already opens the list when `openOnFocus` is true.
- Pattern to copy: `focusTitle()` (052), `focusContext()`, `focusItem()` (054).
- `returnFocusTo` exists on `lc-modal` and `lc-confirm-dialog` only (054). `lc-gallery` restores to the captured `document.activeElement`; `lc-drawer` and `lc-sidenav` (overlay) have no restore logic found by grep.
- `lc-alert` already has a stacked-actions layout (`lc-alert--actions-stacked`, 3.3), not triggered by width for the inline `slot="action"` button.

## Scope

- In: `focus()` on both components (item 1); the nine rows (items 2): 052-n3, 052-n4, 052-n6, 053-n1, 053-n2, 053-n3, 054-n1, 054-n3.
- Not in: 054-n2 stays in `BACKLOG.md` (WebKit is not installed here, so the Safari/iOS check of the *Focus return (3.34)* stories can't be done; manual check remains open). No new runtime dependency, no peer change, no new `returnFocusTo` behaviour on modal/confirm-dialog.

## Acceptance criteria

### Item 1: finance-intelligence, monatsstand-prove row 1

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `lc-textarea` has a public `focus(options?: FocusOptions): void` that focuses the native `<textarea>`; JSDoc names the use (form opens, field with error). Before the view exists it does nothing and doesn't throw. | unit test: `viewChild(TextareaComponent).focus()` gives `document.activeElement` = the inner textarea |
| AC-2 | `lc-combobox` has the same `focus(options?)` that focuses the inner `<input>`. With `openOnFocus=true` the list opens as for a user focus; with `openOnFocus=false` the list stays closed (`aria-expanded="false"`, no panel). | unit tests, both values |
| AC-3 | `focus()` on a disabled or readonly component doesn't throw and leaves the focus where it is for disabled; readonly textarea/input takes focus (native behaviour). | unit test |
| AC-4 | Stories "Focus on open" for both: a form opens with focus in its first field (textarea; combobox with `openOnFocus` off and on). argTypes with `description` and `table.defaultValue`. | Storybook |
| AC-5 | Focus ring visible (`:focus-visible` style as for user focus when called from a key event) at 360 and 1280 px, light and dark. | story + shot |
| AC-6 | Defaults unchanged: no existing assertion changes; the `lc-textarea textarea` / `lc-combobox input` DOM stays as is (the requester's transition keeps working). | existing specs |

### Backlog rows

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-7 (052-n3) | Resolved as a documented known limit: the `moreBadge` JSDoc and the bottom-nav story state that "99+" on a 5-entry bar at 360 px sits 3.2 / 3.4 px off the pill centre and covers 2 of 3 dots, and that the label names the entry. No visual change. If a CSS-only fix of a few lines removes the offset without harm elsewhere, the developer may do it instead and records the measured offset. | JSDoc/story text; if fixed, `--measure` at 360 px |
| AC-8 (052-n4) | The CDP accessibility tree of the collapsed rail (non-badged items) is checked and recorded in `build.md`. If the `title` string appears as accessible description duplicating the name, `title` is removed from all rail items (lines 169, 219, 255, 301) and `data-tooltip` still shows the tooltip on hover and keyboard focus. If it does not, no change, reason recorded. | AX tree dump; unit test that no `title` attribute remains (if changed) |
| AC-9 (052-n6) | The *Keyboard Focus* story of `lc-tag-input` sets `lang="de"` on its German tag, as *Touch Targets (DE)* does; the tag hyphenates at 360 px. | story shot at 360 px |
| AC-10 (053-n1) | `toast-outlet.gap.spec.ts` no longer pins the length and sha1 of the compiled CSS. Replaced by targeted assertions on the rules it protected (8 px gap, 16 px padding, first/last no extra space); a later unrelated scss edit does not fail it. | unit test; break-check by a no-op scss edit |
| AC-11 (053-n2) | The wording is corrected (decision below): JSDoc (`toast-outlet.component.ts` line 43) and the meta docs say that the order holds within a live region and that in a top stack the assertive region comes first. No behaviour change. | grep of JSDoc and docs; existing order spec unchanged |
| AC-12 (053-n3) | In *Stack Spacing*, *Offsets*, *Bottom Stack Order* the meta controls `position` and `duration` either work on the demo or are disabled for it (`argTypes.<x>.control: false`) so none shows that does nothing. | Storybook controls panel |
| AC-13 (054-n1) | `lc-alert` with an inline `slot="action"` button plus the close × at 360 px leaves the message at least about 200 px wide (no one-word lines); below a container width the actions move to their own row (reusing the stacked layout of 3.3). At 1024 and 1280 px the layout is unchanged. Works in EN and DE, light and dark. | story at 360/1024/1280 with `--measure` of message width; existing alert specs unchanged |
| AC-14 (054-n3) | `lc-drawer`, `lc-gallery` and the `lc-sidenav` overlay get an optional `returnFocusTo: HTMLElement \| null` (default `null`, JSDoc `@default null`) with the semantics of AC-1..AC-4 of spec 054: when set and connected, it has focus after close; if not connected, fall back to the captured element, never `body` when one exists. Unset: behaviour as in 3.34.0. Sidenav applies where it has a closing overlay; if it has none, the developer records it and drops it from this AC. | unit tests per component; stories per component |
| AC-15 | Keyboard and screen reader: no change to the roles or names of any touched component, except AC-8. | existing specs |

Always covered: 360 px and desktop · light and dark · EN and DE · prerendered HTML (AC-13: the stacking uses a container query or a class, no JS needed for first layout) · unchanged defaults (AC-6, AC-14).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Rows folded in and deleted from `BACKLOG.md`: 052-n3, 052-n4, 052-n6, 053-n1, 053-n2, 053-n3, 054-n1, 054-n3. 054-n2 stays.

## Assumptions

- Assumption: `focus()` takes optional `FocusOptions` (like `HTMLElement.focus`), as it costs nothing and lets pages pass `preventScroll`.
- Assumption: `focus()` on the combobox needs no special `openOnFocus` code; the existing focus handler already behaves as the requester asks. The test fixes this.
- Assumption (053-n2): correct the wording; mirroring `--latest` for top stacks would change the order of toasts for consumers, and the finding is not a WCAG issue.
- Assumption (052-n3): a documented limit is allowed by the owner decision; a cheap CSS fix is optional.
- Assumption (054-n3): the WebKit symptom is `body` focus because Safari doesn't focus buttons on click; `returnFocusTo` is the same remedy as in 054. It can't be verified in WebKit here, so the ACs are unit-tested in jsdom only.
- Assumption (054-n2): WebKit is unavailable, so the row is kept in the backlog unchanged, as the owner decided.

## Open questions

None.
