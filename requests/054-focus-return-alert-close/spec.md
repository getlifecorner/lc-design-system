# Spec 054: returnFocusTo, focusContext(), focusItem(), 44 px alert close

- **Status:** ready
- **Type:** extension of `lc-modal`, `lc-confirm-dialog`, `lc-header`, `lc-list`; bug fix in `lc-alert`
- **Affected:** `modal/` (ts, html, spec, stories), `confirm-dialog/` (pass-through), `header/`, `list/`, `alert/alert.component.scss`, CHANGELOG, MCP manifest (JSDoc)
- **Semver impact:** minor. New optional input and two public methods; defaults render and behave as before. The alert fix changes only the hit area, not the look.

## Need

finance-intelligence (Monatsstand, App-Shell; e2e of spec 011 on iPhone 15 / WebKit and desktop 1280 px). In WebKit a tap does not focus a `<button>`, so the element active at dialog open is `body`. After Schließen, Escape or "Abbrechen" the focus falls to `body` (WCAG 2.4.3). The same happens when the trigger was re-rendered while the dialog was open. The shell also cannot focus the header's context button after a choice, or a list row's button or action after a sheet closes; both are rendered by the kit. Today the consumer searches the DOM by `aria-label`. Bug: `lc-alert` `dismissible` close measures 28 x 28 px (`.lc-alert__close`: `padding: var(--spacing-1)`, margin `-spacing-1`), seen at 360 px; a 44 px target is expected without a visual change.

## What the kit has today

- `lc-modal` uses `cdkTrapFocus` with `[cdkTrapFocusAutoCapture]="true"`, which restores the captured element. No input names another element.
- `lc-header` has `contextPlacement` (3.33) but no focus method. `lc-list` has `aria-current` (3.33) but no focus method. `lc-next-step-card` has `focusTitle()` (3.33): the precedent for the method style.
- No backlog rows exist for these components (grep of `requests/BACKLOG.md`: none).

## Scope

- In: items 1 to 3 and the bug, as in `request.md`.
- Not in: new visuals, new focus-return behaviour for `lc-drawer`, `lc-sidenav` or `lc-gallery` (same flaw, not requested; mention in the changelog as a known limit), automatic trigger tracking.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `lc-modal` has the input `returnFocusTo: HTMLElement \| null`, default `null`, with JSDoc `@default null`. When set and connected, the element has the focus after the modal closed, instead of the captured one. | unit test |
| AC-2 | Holds for all close paths: close button, Escape, backdrop click (when enabled), `open` set to false or `close()` from outside, `[(open)]`. | unit tests |
| AC-3 | When `returnFocusTo` is not connected (or removed while open), nothing throws. The focus goes to the captured element if it still exists, else as today. It never stays on `body` when a captured element exists. | unit test |
| AC-4 | With `returnFocusTo` unset, behaviour is identical to 3.33.1. Existing modal specs unchanged. | existing specs |
| AC-5 | Placements `center` and `auto` as a sheet both return the focus. The element is focused after the close transition and removal of the trap, so the trap does not take it back. | story at 360 and 1280 px, `--measure` of `document.activeElement` |
| AC-6 | In WebKit, a dialog opened by tapping an `lc-button` and closed by Schließen, Escape or "Abbrechen" leaves `document.activeElement` on that `<button>`. Chromium and Firefox as today. | Playwright WebKit check in a story, or documented manual check in `build.md` if WebKit is not available |
| AC-7 | `lc-confirm-dialog` has the same input `returnFocusTo`, passed through to `lc-modal`. It works for confirm, "Abbrechen" and Escape/close. | unit test per way to close |
| AC-8 | `lc-header.focusContext()` is public with JSDoc. It focuses the context button when it is rendered (from 641 px, and at every width with `contextPlacement="below"`) and does nothing otherwise (no `contextName`, hidden, no throw). | unit test |
| AC-9 | Called right after `contextName` changed, it works after the next render. `document.activeElement` is the button, and its accessible name contains the new `contextName`. | unit test, story measured |
| AC-10 | Header without the call behaves as today. Checked at 360, 641, 1280 px, with `contextPlacement` `inline` and `below`. | story + width |
| AC-11 | `lc-list.focusItem(id: string, part: 'row' \| 'action' = 'row')` is public. `'row'` focuses the row's button or link (`clickable`/`href`), `'action'` the action button (`actionClick`). | unit test |
| AC-12 | An unknown `id`, or a row without the requested part, does not throw and does not move the focus. | unit test |
| AC-13 | Works with `size`, dividers, badges and `selected`. The kit's focus ring shows on keyboard focus. Programmatic focus after a pointer event does not show a wrong ring, as `:focus-visible` rules decide. | story at 360 px, light and dark |
| AC-14 | `.lc-alert__close` has a hit area of at least 44 x 44 px (measured with `getBoundingClientRect` of the button or its `::after`), at 360 and 1280 px, in all variants (with and without title, icon, actions, narrow container `< 16rem`). | story + `--measure` |
| AC-15 | The alert's look and height are unchanged: icon glyph, hover area and focus ring look as before, and the alert height differs by 0 px in every existing alert story (hash comparison). The larger target must not overlap the neighbouring action or link target; where it does, the order of layers is documented. | `--compare` shots, measurement |
| AC-16 | Stories: `returnFocusTo` (modal and confirm dialog), `focusContext()`, `focusItem()` each get a story or a documented example. Every argType has `description` and `table.defaultValue`. | Storybook |
| AC-17 | Light and dark, `forced-colors`, `prefers-reduced-motion` unaffected. Screen reader: no new announcement beyond focus landing on the named control. | story, review |
| AC-18 | EN and DE labels: no new built-in texts. Existing German strings still fit. | story |
| AC-19 | Prerendered HTML before JavaScript is unchanged (no new markup; the compat check passes). | `check-angular-majors.mjs` |
| AC-20 | CHANGELOG entry (Added: three APIs, Fixed: alert target) with gap IDs, measured values, the note "no API break" and the known limit for drawer, sidenav and gallery. MCP manifest shows the new inputs and methods. | changelog, manifest |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.

## Assumptions

- Assumption: the focus return applies to every close path, not only the three named by the requester, so that the behaviour is consistent.
- Assumption: methods follow the `focusTitle()` precedent of `lc-next-step-card`. Names and signatures are as the requester proposed; the designer decides internals (`viewChild`, timing).
- Assumption: the 44 px target is reached with the existing negative-margin technique or a pseudo-element, whichever keeps the height. The designer decides.
- Assumption: if WebKit cannot run in the pipeline, the unit tests with a `body`-active start state stand in for AC-6, and the manual check is recorded in `build.md`.

## Open questions

None.
