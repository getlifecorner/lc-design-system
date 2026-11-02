# Spec 033: lc-description-list resets the browser's dd margin

- **Status:** ready
- **Type:** bug fix
- **Affected:** `libs/angular-ui-kit/src/lib/description-list/description-list.component.scss` (+ spec, stories, CHANGELOG)
- **Semver impact:** patch — removes an unintended 40 px browser default; no API change. Consumers' `::ng-deep dd.lc-dl__value { margin: 0 }` workarounds stay harmless.

## Need

Gap BA-8 (life-os, bank accounts). On the connection page (managing row) and the assistant-access page, a short value beside its term wraps at 360 px ("Alle Erwachsenen", "nicht eingerichtet"). The `<dd class="lc-dl__value">` keeps the browser's `margin-inline-start: 40px`, which comes on top of the row's `gap: var(--spacing-2)`. The requester works around it with `::ng-deep dd.lc-dl__value { margin: 0 }` in both hosts.

## What the kit has today

`description-list.component.scss` sets `margin: 0` on `.lc-dl` (the `<dl>`) only. `.lc-dl__value` (the `<dd>`) and `.lc-dl__term` (the `<dt>`) have no margin rule, so the user-agent `dd` margin applies. No input or CSS hook changes it. Nothing to reuse; the kit must fix it.

## Scope

- In: `margin: 0` on `.lc-dl__value` and `.lc-dl__term`, so the row `gap` is the only horizontal space. Applies to all layouts (rows, leaders, stacked) and sizes.
- Not in: new inputs or CSS hooks, other spacing changes, other components.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | Computed `margin` of `.lc-dl__value` and `.lc-dl__term` is `0px` on all sides, in rows, leaders and stacked layouts | Jest spec (`getComputedStyle`) or story `--measure` |
| AC-2 | Row with term "Zugriff" and value "Alle Erwachsenen" (and "nicht eingerichtet") renders value on one line at 360 px, inside a 328 px container; value left edge minus term right edge equals the leader/gap, not 40 px more | story + 360 px + `--measure` (value height = one line) |
| AC-3 | Long unbroken value (IBAN, e-mail) still wraps via `overflow-wrap: anywhere` and does not overflow at 360 px | existing story/spec stays green |
| AC-4 | Same result at 1024 and 1280 px; in stacked layout the value is flush left with the term | story + `--measure` |
| AC-5 | Light and dark themes render identically apart from colours; no layout difference between themes | story, both themes |
| AC-6 | German strings (longer) checked at 360 px; no overflow, wrapping only when the text is truly too wide | story with DE items |
| AC-7 | Prerendered HTML is unchanged (style-only fix); defaults, inputs, outputs and roles unchanged; existing specs pass without edited assertions | `npx nx run angular-ui-kit:test`, compat check |
| AC-8 | Keyboard/screen reader: no change to `dl/dt/dd` semantics, clickable-row focus ring and `role="button"` | existing spec |
| AC-9 | A story shows the BA-8 case (short values at 360 px) so the review can see it | story |
| AC-10 | CHANGELOG `Fixed` entry names BA-8, the pages, and the measured before/after (value width/line count at 360 px) | CHANGELOG |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.

## Assumptions

- Assumption: the 40 px is the only cause; the "before" measurement is taken once in the build to confirm the wrap.
- Assumption: no consumer relies on the 40 px indent, since the row is a flex layout with its own gap.
- Assumption: `margin: 0` (not logical-property-only) is fine for both `dt` and `dd`.

## Open questions

None.
