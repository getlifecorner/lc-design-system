# Spec 069: external description-list links, single-image upload, badge labels, menu height by room

- **Status:** ready
- **Type:** extension of `lc-description-list`, `lc-file-upload`, `lc-badge`, `lc-menu` (bundle of 4 items, no new component)
- **Affected:** `lib/description-list/`, `lib/file-upload/`, `lib/badge/`, `lib/menu/` (component, scss, stories, specs), CHANGELOG, both READMEs only if the component lists change (not expected)
- **Semver impact:** minor. Only optional inputs and fields are added; every default renders as before. Exception to watch: AC-12 to AC-14 (badge) change the markup of the label, see AC-16.

## Need

| Item | Requester, gap | Page and failure today |
|---|---|---|
| A | finance-intelligence, vertraege-2026-11-18 row 1 | Dialog "Details" of a contract (spec 020): the contract document lives in another system (`https://`). `DescriptionListItem.href` always opens in the same tab, has no `target`/`rel`, and assistive technology is not told that it leaves the app. Look: none requested, function only (ADR-0009). |
| B | usm-x, 2026-11-17 row 71 | Settings with a logo: `lc-file-upload` is a drop zone with a file list. There is no single-image field (preview of the saved or just chosen image, a background to judge it on, e.g. dark for a dark rail, replace and remove in place). |
| C | usm-x row 72 | `lc-badge` "Aufnahme läuft in **USM-1209 Zeitbuchung**": the label loses the space between runs (inline-flex, gap 0); a user-typed name has no truncation, so a long change set name widens the badge until the row breaks. |
| D | usm-x row 73 (addendum to row 54, released 3.48) | Row menu with 25 entries on an 1150 px high screen: with `maxHeight="min(56vh, 420px)"` ten entries hid behind a scroll with half the screen free. The height should follow the room between trigger and viewport edge on the side the panel opens to, and that room should choose the side. |

## What the kit has today

- A: `DescriptionListItem.href` renders `a.lc-dl__link` in 5 places of `description-list.component.html`; no `external`, no text input (only `totalAriaLabel`). `lc-icon` has `external-link`.
- B: `lc-file-upload` inputs `accept`, `multiple`, `maxSizeBytes`, `disabled`, `hint`, labels and `locale`; outputs `filesSelected`, `fileRejected`. No preview, no value input, no remove output.
- C: `lc-badge` has `wrap` (3.11), `icon`, `dot`, `--lc-badge-gap`; label is projected straight into the `inline-flex` span, no label element, no `title`, no truncation.
- D: `lc-menu` has `maxHeight` (3.48, fixed CSS length, empty = viewport less 16 px with `anchor`) and the overlay `anchor` with flipping `ELEMENT_POSITIONS`. The flip looks only at fit, not at the larger side; the height is not derived from the room.

## Scope

- In: items A to D below as optional additions.
- Not in: a new look for the description-list link beyond the icon; crop/resize/upload transport for the image field (the app stores the file); drag and drop of several files; changes to `maxHeight` semantics when set.
- Backlog row 068-n2 (description-list, `border-bottom` of clickable non-total rows bends at the row ends, pre-existing) is folded in as AC-5 and removed from `requests/BACKLOG.md`.

## Acceptance criteria

### Item A (finance-intelligence vertraege row 1)

| ID | Criterion | Verified by |
|---|---|---|
| AC-1 | New optional `DescriptionListItem.external?: boolean` (JSDoc with `@default false`). With `true` and an `href`, the link has `target="_blank"` and `rel="noopener noreferrer"` in all 5 link places (layouts `rows` and `stacked`, with and without badge, `total`, `clickable`). | unit tests per layout |
| AC-2 | An external link shows a decorative `external-link` icon after the value (`aria-hidden`, inherits colour, 1em), the same in both themes and `forced-colors`; no other visual change. The icon is registered the way the kit's other built-in icons are, so a consumer needs no extra registration (design decides how; if registration is required, the story and JSDoc say so). | unit test, story light and dark |
| AC-3 | The accessible name of the link ends with a suffix text: new input `externalLabel` (default "opens in a new tab"; German "öffnet in neuem Tab" verified in a story). Suffix is visually hidden text inside the link, not `aria-label` on the anchor (so the visible value stays in the name, WCAG 2.5.3). | unit test on accessible name, axe |
| AC-4 | `external` without `href` is ignored. Without `external` the rendered anchor is byte-identical to 3.48 (no `target`, `rel`, icon or suffix). | unit test, snapshot of existing specs unchanged |
| AC-5 | Backlog 068-n2 (source: 068 review N-2): in *Item Icons* at 1280 px, "rows, md, clickable", the separators of clickable non-total rows are straight at the row ends, as 066-n1 did for totals. | story at 1280 with `--measure` of the border radius |
| AC-6 | Keyboard and 360 px: the link has a visible `:focus-visible`, the long German value plus icon wraps without horizontal scroll at 360 px; the icon does not sit alone on a new line (stays with the last word). | story at 360, measure `scrollWidth` |

### Item B (usm-x row 71)

| ID | Criterion | Verified by |
|---|---|---|
| AC-7 | A single-image mode, opt-in (design names it, e.g. `variant="image"` or a separate input; no change to the default drop zone). Shows the current value (input `imageSrc`, a URL or object URL string) previewed, an `lc-button` "choose" (hidden native file input behind it, `accept` default `image/*` in this mode) and "remove" (shown only with a value). Emits `filesSelected` with the one chosen file, and a new output for remove. The component does not store or upload. | unit tests |
| AC-8 | The preview sits on a selectable background so the image can be judged on it: at least `surface` (default), `dark` and `checkered`/transparency (design picks the set; tokens only, no raw colours). Image is `object-fit: contain`, alt text from an input (`imageAlt`), empty alt = decorative. | story per background, light and dark theme |
| AC-9 | `maxSizeBytes`, `accept`, `disabled`, `locale`, `fileRejected` work as in the list mode; the rejection is shown in place and announced (`role="alert"` or live region as the list mode does). | unit tests |
| AC-10 | Without a value the empty state offers the same "choose" action and the hint; drag and drop onto the tile is supported. Keyboard: "choose" and "remove" are buttons (Tab, Enter, Space), touch targets at least 44 px, focus returns to "choose" after remove. | unit test, axe, story at 360 and 1280 |
| AC-11 | All new texts ("Choose image", "Replace image", "Remove image", preview alt fallback) are label inputs with English defaults; German verified in a story at 360 px without clipping. Default (list) mode unchanged: existing specs untouched. | story, unit tests |

### Item C (usm-x row 72)

| ID | Criterion | Verified by |
|---|---|---|
| AC-12 | Mixed content `Aufnahme läuft in <strong>USM-1209 Zeitbuchung</strong>` keeps its spaces: the projected content sits in one inline label element inside the badge so whitespace between runs is preserved. Existing badges (text only, icon, dot, `wrap`, counts) render at identical measured size. | unit test on text content, story, `--measure` width before/after for existing stories |
| AC-13 | New optional `maxWidth` input (any CSS length, `@default ''`, no cap). With a value the label is cut with an ellipsis on one line and the badge carries the whole text as `title` (plain text of the label; not set without `maxWidth`). The cut applies to the label only, icon and dot stay visible. | unit test, story at 360 with a 60-character name |
| AC-14 | The truncated text stays available to assistive technology (the full text is in the DOM, not only in `title`); `wrap` together with `maxWidth`: `wrap` wins, no ellipsis, documented. | unit test |
| AC-15 | Contrast of all variants unchanged (`badge-contrast.spec.ts` green); `forced-colors` shows the label. | existing spec |
| AC-16 | The extra label element does not break existing consumer selectors the kit documents (`.lc-badge`, `--lc-badge-*` hooks); `lc-description-list` badge and table cells render unchanged. | existing specs, story shots hash compare |

### Item D (usm-x row 73)

| ID | Criterion | Verified by |
|---|---|---|
| AC-17 | New optional `maxHeight="room"` value (or a separate boolean, design decides; the existing CSS-length `maxHeight` behaviour is unchanged). With an element anchor, the panel's max height is the room between the trigger and the viewport edge on the side it opens to, less the 8 px gap and the 8 px viewport margin, recomputed on open, resize and scroll. | unit test with mocked rects, story |
| AC-18 | That room also chooses the side: the preferred `position` is kept while its room is at least a minimum (design sets it, about 240 px or the full content height if smaller); otherwise the side with more room is used. | unit test |
| AC-19 | A minimum height (design sets it, at least 3 items and header/footer) so the panel stays usable on a short window; below it the panel scrolls. The 25-entry case on an 1150 px high viewport with a trigger at the top third shows more than 15 entries without scroll. | story at 1280x1150 with `--measure` of visible items |
| AC-20 | Items scroll inside, header and footer stay, the keyboard-focused item is scrolled into view (as 3.48 `maxHeight`). Works at 360 px, in both themes, `prefers-reduced-motion`. Without the new value nothing changes. | unit test, story |

### Cross-cutting

| ID | Criterion | Verified by |
|---|---|---|
| AC-21 | Unchanged defaults: no existing spec assertion is changed (except where a stated reason is recorded in `build.md`); prerendered HTML of the compat app unchanged unless a consumer uses a new input. | full test suite, compat check |
| AC-22 | Every new input, field and output has JSDoc with `@default`, an argType with `description` and `table.defaultValue`, and a story; German strings shown for the new texts. | lint, Storybook |
| AC-23 | CHANGELOG entry names each requester and gap ID (vertraege row 1, usm-x 71, 72, 73) and the consumer page. | review |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Tokens only; the description-list keeps its look (ADR-0009): the only visible change is the icon on `external` items.

## Assumptions

- Assumption: the suffix text is an input (`externalLabel`), not a `labels` object, as the kit's convention is flat label inputs (`totalAriaLabel`, `removeFileAriaLabel`).
- Assumption: the single-image mode is part of `lc-file-upload` (the requester's proposal), not a new component, so file validation is shared.
- Assumption: the image value is supplied by the app as a URL string; the component never reads or uploads the file.
- Assumption: the room-based height is opt-in because a fixed default would change existing menus (no API break).
- Assumption: the badge label element is added for all badges (needed for the space fix); AC-12 and AC-16 guard that nothing measurable changes.

## Open questions

None.

## Resolution

Not applicable: the kit covers none of the four.
