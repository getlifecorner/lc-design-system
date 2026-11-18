# Spec 066: description-list item icon, accordion nested open state, timeline horizontal overflow

- **Status:** ready
- **Type:** bundle of 3: extension of `lc-description-list` (A), bug fix `lc-accordion` (B), bug fix / a11y `lc-timeline` (C)
- **Affected:** `lib/description-list/` (`DescriptionListItem`, html, scss, stories, spec), `lib/accordion/accordion.component.scss` (+ stories, spec), `lib/timeline/` (ts, html, scss, stories, spec), CHANGELOG
- **Semver impact:** minor. A: new optional item field. B: selector scoping only. C: new optional label input and a scroller role that appears only when the list overflows; no change otherwise.

## Need

- **A, finance-intelligence kosten-2026-11-17 row 3:** the fact "Abweichung zum Budget" (budget page on the phone, forecast receipt) reads "6,7 % über Budget" without the decorative arrow that `lc-hero` and the tiles show beside a variance. `DescriptionListItem` has no icon. Workaround today: text only.
- **B, row 4 (defect, kit 3.41.0):** an `lc-accordion` inside the body of another one takes the parent's open state. The open-state rules are descendant selectors (`.lc-accordion--expanded .lc-accordion__panel`, `__body`, `__icon`, the `--sm`/`--lg`/`--plain` body paddings). In an open parent a closed child shows a 36 px body (`plain`, `lg`), its chevron points up, and after closing the body stays. Workaround today: budgets stand in a separate indented `lc-accordion-group`, not in the body.
- **C, 065-s1:** a horizontal `lc-timeline` that is not `selectable` overflows at 360 px (4 × 128 px items in 328 px, 184 px hidden) and has no focusable element: axe `scrollable-region-focusable`, WCAG 2.1.1. Pre-existing.

## What the kit has today

- A: `lc-badge` is drawn in a value; no icon. Kit icons are used by `lc-hero` and the tiles through `lc-icon` (`ɵprovideKitIcons`). `TimelineItem.icon?: string` exists as a model for the field name.
- B: `AccordionGroupComponent` uses `contentChildren(AccordionComponent)` without descendants, so group logic is not affected; only the SCSS leaks (accordion.component.scss lines 133-200 and 294-320 use descendant selectors).
- C: `.timeline--horizontal { overflow-x: auto }` with `min-width: 8rem` items. Selectable timelines have focusable buttons, so they pass; a non-selectable one does not.

## Scope

- In: A item icon; B scoping of all open-state rules to the accordion's own parts; C one fix for the non-selectable overflow case.
- Also in: BACKLOG 065-n1 (timeline title centring, source 065 review r3 N3), folded as AC-14; its row is deleted from `BACKLOG.md`.
- Non-goals: a table or chart change (rows 1 and 2 are request 065/other); a stacked timeline layout; icon colour tokens beyond the value's colour; any look change to accordion in a non-nested use.

## Acceptance criteria

### A. description-list icon (kosten row 3)

| ID | Criterion | Verified by |
|---|---|---|
| AC-1 | `DescriptionListItem.icon?: string` (kit icon name, JSDoc with `@default undefined`). Without it, the rendered DOM and styles of every existing story are identical. | unit test (innerHTML equal) + existing specs unchanged |
| AC-2 | With `icon`, an `lc-icon` stands before the value on the same line in `layout="rows"` and `"stacked"`, `size` sm and md; its colour is the value's colour (`currentColor`, also with `emphasis`), its size follows the value's font size. | story at 360 and 1280, `--measure` icon box vs line height |
| AC-3 | The icon is always `aria-hidden="true"`, not focusable, and adds nothing to the term/value text (`textContent` of the `dd` is unchanged; a screen reader reads the same). | unit test |
| AC-4 | Works next to a `badge`, with `href` and `datetime`, in a `total` row and in a `clickable` list (the row's `aria-labelledby` name unchanged). The icon is not part of the link. | unit tests, one per combination |
| AC-5 | Story "6,7 % über Budget" with `arrow-up` (DE text), at 360 px no wrap of the icon from its text, light and dark, `forced-colors` shows the icon in system text colour. The icon is part of the prerendered HTML. | story + prerender grep in `tools/compat` (`EXPECT_IN_HTML` if a consumer sample fits) |
| AC-6 | An unknown icon name renders as `lc-icon` does elsewhere (no new error path). axe passes. | unit + axe spec |

### B. accordion nested state (kosten row 4)

| ID | Criterion | Verified by |
|---|---|---|
| AC-7 | A closed `lc-accordion` inside the body of an open one has the height of its head (body 0 px, `inert`), its chevron points down. Check variants `plain`, `outlined`, `flat`, sizes `sm`/`md`/`lg`, `chevronPosition="leading"` and `"trailing"`. | story "Verschachtelt" with two levels (`plain`, `lg`, leading), `--measure` of child panel/body height and icon transform |
| AC-8 | Opening and closing the child changes only the child; the parent keeps its state; closing the child removes its body (no leftover 36 px). Opening the child and then closing the parent works. | unit test (jsdom classes) + story |
| AC-9 | The reverse also holds: a closed parent never makes an open child look closed (child inside parent body is only visible when parent is open, but its own rules apply). | unit test |
| AC-10 | A non-nested accordion renders pixel-identically to 3.45.0 in every existing accordion story (compare by hash, 360 and 1280, light and dark), including `--lc-accordion-body-padding` and `--lc-accordion-header-bleed` hooks and `prefers-reduced-motion`. | `story-shots --compare` |
| AC-11 | Keyboard and screen reader: nested heads are reachable in order, `aria-expanded` of each reflects its own state; axe passes. | unit + axe spec |

### C. timeline overflow (065-s1)

| ID | Criterion | Verified by |
|---|---|---|
| AC-12 | A horizontal, not selectable `lc-timeline` whose content is wider than its box at 360 px can be scrolled with the keyboard: the scroller is focusable (`tabindex="0"`), has a role and a name (`role="region"` + `aria-label`), a visible `:focus-visible` ring that is not clipped, and arrow keys scroll it. axe `scrollable-region-focusable` has 0 violations at 360 px. | story at 360 px + axe run; measured `scrollWidth > clientWidth` |
| AC-13 | When the content fits (1024 px and up in the standard story), the scroller has no `tabindex`, no role and no name (no extra tab stop); it is tested live with a resize (`ResizeObserver`), not only at first render. Prerendered HTML has no `tabindex` (nothing measurable on the server). A `selectable` timeline is unchanged (its buttons are the tab stops). | unit test with mocked sizes + story at 360/1024/1280 |
| AC-14 | Folded from BACKLOG 065-n1: in the horizontal timeline the title is centred over its marker (`.timeline__header` `justify-content: center`); 1280 px "Horizontal" item 2: title centre equals marker centre (173.7 vs 192 px before). | `--measure` of both centres, diff <= 1 px |
| AC-15 | The scroller name is a built-in text: an input (e.g. `scrollLabel`, `@default 'Timeline'`, JSDoc) lets consumers set it; German verified ("Zeitleiste"). Vertical timelines and `selectable` ones get no role or name from it. | unit test, DE story |
| AC-16 | Default look unchanged for vertical timelines and for horizontal ones that fit. Both themes and `forced-colors` show the focus ring. | `--compare` hashes |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Full test suite, lint, build and the compat check run once at the end (developer).

## Assumptions

1. Assumption: C is solved with a focusable, named scroller only when it overflows (recommended in 065 review), not a stacked layout: the stacked layout would change the default look of existing horizontal timelines (API/look break).
2. Assumption: the icon in A sits before the value inside the `dd` (after the leader), in a gap of the kit's smallest spacing token; designer decides token and size.
3. Assumption: B is fixed in SCSS only (child combinators from `.lc-accordion` to its own parts); no TS change. If the designer finds a case needing a class on `__body`, that is allowed if no API changes.
4. Assumption: the `role="region"` name input for C may use the kit's usual `locale`/label pattern; the designer picks the exact input name.
5. Assumption: 054-n2 (modal focus return, WebKit) is not touched by this request and stays in the backlog.
6. Assumption: rows 1 and 2 of kosten-2026-11-17 are other items and not in this bundle.

## Open questions

None.

## Resolution

Not applicable (all three items need kit changes).
