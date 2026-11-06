# Request 054: lc-modal / lc-confirm-dialog returnFocusTo, lc-header focusContext(), lc-list focusItem(), lc-alert close target

- **From:** bundle (finance-intelligence)
- **Received:** 2026-11-06
- **Gap IDs:** monatsstand-2026-11-06 rows 1–3; monatsstand-2026-11-06 bug (lc-alert close button)
- **Referenced files:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/monatsstand-2026-11-06.md (rows 1–3 and the bug)
- **Kit version at intake:** 3.33.1

## Requirement (verbatim)

Bundle `tmp/lc-request/bundles/20261106-141635.md`, started by the owner on 2026-11-06 14:16: one request and one version for all items.

### Item 1 (20261106-141256-64911)

- **From:** finance-intelligence
- **Dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence
- **Date:** 2026-11-06 14:12
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/monatsstand-2026-11-06.md

Rows 1–3 (monatsstand-2026-11-06): focus return to the trigger. 1 lc-modal / lc-confirm-dialog input returnFocusTo (WebKit does not focus a tapped button, so the auto-captured element is body); 2 lc-header public focusContext() for the context button after a choice; 3 lc-list public focusItem(id, part) for a row's button or its action. Bug riding along: lc-alert dismissible close button measures 28 x 28 px, expected a 44 px target without changing the look.

Rows 1–3 and the bug of the referenced file, verbatim:

| #   | Component                       | Gap | Proposal | Accepted when | Our transition until the release |
| --- | ------------------------------- | --- | -------- | ------------- | -------------------------------- |
| 1   | `lc-modal`, `lc-confirm-dialog` | The focus goes back to whatever was active when the dialog opened (`cdkTrapFocusAutoCapture`). In WebKit (Safari, every browser on iOS) a tap or click does not focus a `<button>`, so the active element at open is `body`, and after Schließen, Escape or „Abbrechen“ the focus falls to `body` (WCAG 2.4.3 Focus Order). The same happens when the trigger was re-rendered while the dialog was open. There is no way to name the element that should get the focus back. | An input `returnFocusTo: HTMLElement \| null` on `lc-modal`, passed through by `lc-confirm-dialog`. When it is set, the dialog focuses that element after it has closed instead of the captured one; if the element is no longer in the document, it falls back to today's behaviour. Default `null`: today's behaviour. | In WebKit, a dialog opened by tapping an `lc-button` and closed with Schließen, Escape or „Abbrechen“ leaves `document.activeElement` on that button's `<button>`; Chromium and Firefox behave as today; without the input nothing changes; a disconnected element neither throws nor leaves the focus on `body` when the captured one still exists; both placements (`center`, `auto` as a sheet) and the confirm dialog's three ways to close; a story. | The page and the shell remember the trigger themselves and focus it after the next render on `modalClosed` (`lc-modal`) or `cancelled` (`lc-confirm-dialog`); if the trigger is gone, the focus goes to the card or the page heading. |
| 2   | `lc-header`                     | The context button (`contextLabel`, `contextName`, `contextClick`) cannot be focused from outside. After a choice in the sheet „Monatsstand wählen“ the page reloads its numbers, the header shows the new `contextName`, and the focus has to go back to the context button (App-Shell 5.3: „der Fokus geht an den Knopf zurück“). The header offers no method or reference for that button. | A public method `focusContext()` that focuses the context button when it is shown (from 641 px, and at every width with `contextPlacement="below"`), and does nothing when it is not. Default: nothing changes until it is called. | After `focusContext()`, `document.activeElement` is the context button and a screen reader reads its name with the new `contextName`; it works right after `contextName` changed (after the next render); without the call the header behaves as today; at 360, 641 and 1280 px; with `contextPlacement` `inline` and `below`; a story or a documented example. | The shell looks for the `<button>` inside `lc-header` whose `aria-label` starts with our `contextAriaLabel` („Monatsstand wählen“) and focuses it after the next render. Removed when the kit has the method. |
| 3   | `lc-list`                       | A row's own button (`clickable`) or link (`href`) and its action button (`actionClick`, `actionAriaLabel`) are rendered by the kit and cannot be focused from outside. On the phone the history of the monthly snapshots is an `lc-list` whose action „Details“ opens a sheet; when the sheet closes, the focus has to go back to the „Details“ of that row (Monatsstand flow 9), and in WebKit nothing has focused it before. | A public method `focusItem(id: string, part: 'row' \| 'action' = 'row')` that focuses the row's button or link (`'row'`) or its action button (`'action'`) of the item with that `id`, and does nothing when the item or the part does not exist. Default: nothing changes until it is called. | After `focusItem(id, 'action')`, `document.activeElement` is the action button of that row, and after `focusItem(id)` the row's button or link; an unknown `id` or a row without the part neither throws nor moves the focus; it works with `size`, dividers, badges and `selected`; keyboard focus shows the kit's ring; a story or a documented example. | The history component finds the row's action `<button>` inside `lc-list` by its `aria-label` (our `actionAriaLabel`, which names the row) and the page focuses it after the next render. Removed when the kit has the method. |

## Bug, riding along (not a function)

- **`lc-alert` `dismissible`: the close button measures 28 × 28 px** (`.lc-alert__close`: `padding: var(--spacing-1)` with the same negative margin, in 3.30.0; no change to it in the changelog up to 3.33.1). That passes WCAG 2.5.8 (24 px) but not the 44 px touch target that `lc-modal`'s close (3.3) keeps and that our phone rule asks for. Seen in the app shell's note „Den gewählten Entwurf gibt es nicht mehr, gezeigt wird …“ (App-Shell Artboard 20 a) at 360 px. Expected: a 44 × 44 px target without changing the alert's look or height.

File header (context), verbatim:

- **From:** finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.30.0; checked through the `lc-design-system` MCP, in the installed package and in the changelog up to 3.33.1 on 2026-11-06)
- **Approved concepts:** [docs/ux/concepts/monatsstand.md](../concepts/monatsstand.md), flows 8, 9 and 12 and section 7 („Lücken im Design-System“, rows 2–3), and [docs/ux/concepts/app-shell.md](../concepts/app-shell.md), sections 5.3 and 7 (German), approved by the owner on 2026-11-05. Found in the phone and desktop e2e run of spec 011 (iPhone 15 / WebKit, desktop 1280 px).
- **Look:** none requested. Every sheet and dialog gives the focus back to its trigger when it closes (Schließen, Escape, „Abbrechen“, or a choice in the sheet). All items are functions (ADR-0009); one bug rides along below.
