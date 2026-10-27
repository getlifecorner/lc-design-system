# Spec 018: lc-alert in a narrow container: long words and a narrow layout

- **Status:** ready
- **Type:** bug fix (long words) + extension of `lc-alert` (narrow layout, no new input)
- **Affected:** `libs/angular-ui-kit/src/lib/alert/alert.component.{scss,spec.ts}`, `alert.stories.ts`; `CHANGELOG.md`. Possibly `alert.component.html` only if the narrow layout needs a title row (designer decides).
- **Semver impact:** patch (or minor if the designer adds an optional CSS hook only; hooks are not API breaks). Defaults at normal widths render as before. No input, no break. Same precedent as 3.11.1 (AS-32), where a narrow layout fix was a patch.

## Need

Page: life-os website waitlist, DE 503 answer (concept `website-waitlist.md` §7, row G-WL4; FR-017, board 20; T092 measured 2026-10-27). An `lc-alert` sits in `lc-next-step-card` `[slot='body']`. At 320 px viewport and 200 % text the alert is 123 px wide; padding, icon and gap leave about 30 px for the text. `.lc-alert__title` ("Nicht eingetragen") and `.lc-alert__content` ("gespeichert.") neither break a long word nor shrink, so they run up to 127 px past the alert box and 30 px past the viewport (EN fits the viewport but also leaves the box). The requester's measurement: `overflow-wrap` + `hyphens` alone removes both overflows. Owner decision (2026-10-27): kit first; no local workaround.

## What the kit has today

- `.lc-alert__body` already has `flex: 1; min-width: 0`, so the text column can shrink. Missing: `.lc-alert__title` and `.lc-alert__content` have no `overflow-wrap` or `hyphens`, so a word's minimum width still exceeds the box. (The action text link already uses `overflow-wrap: anywhere`.)
- The alert is a size container (`container: lc-alert / inline-size`) only with stacked actions or a text link in the action slot (`alert.component.scss` l. 53, 149). A plain alert has no container, so no narrow layout can key off its width yet.
- Pattern to follow: `lc-next-step-card` TD-1 (`@container lc-next-step-card (width < 30rem)`, icon beside the title, smaller padding) and AS-32 (3.11: wrap instead of breaking a word where it fits). Text-wrap hooks elsewhere: `--lc-markdown-hyphens`, `--lc-btn-overflow-wrap`.

## Scope

- In: word breaking in title and content (message and projected content); a narrow layout of the alert body below a container width, with the icon in the title row and smaller padding; stories; tests; changelog.
- Not in: new inputs, new variants, changes to colours, the action slot or the dismiss button logic beyond keeping them working in the narrow layout, any change to `lc-next-step-card`.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `.lc-alert__title` and `.lc-alert__content` compute `overflow-wrap: break-word` (or `anywhere`) and `hyphens: auto`; `.lc-alert__body` keeps `min-width: 0`. | Jest (computed/SCSS assertion) |
| AC-2 | Reproduction story: alert with title "Nicht eingetragen" and content "gespeichert." in a 123 px wide container at 200 % root text (DE): `scrollWidth <= clientWidth` for the alert and every text element; no part of the text is right of the alert's right edge. | story + `--measure` at 360 (and 320 viewport if available), light |
| AC-3 | Same with EN text ("Not registered") at 200 %: text fully inside the alert box. | story + `--measure` |
| AC-4 | A narrow layout applies when the alert's own width is below a threshold (container query on the alert, not the viewport; threshold chosen by the designer so the 123 px case and a 200 %-text phone alert trigger it, and a normal 360 px page alert, about 328 px at 100 % text, does not unless the designer justifies it with measurements). In it: icon sits in the title row, content spans the full inner width below, padding is smaller (a density-token step, no raw values). | story + `--measure` of box positions; Jest on the container query |
| AC-5 | In the narrow layout the optional parts still work: dismiss button stays reachable (44 px target kept or its existing size not reduced), action slot and text link (3.12) lay out without overflow, `actionsLayout` stacked keeps its 3.3 behaviour. | stories with each, `--measure` |
| AC-6 | Making plain alerts size containers changes no size: the alert's width at 360/1024/1280 equals 3.13.0. | screenshot hash compare of existing alert stories vs. baseline |
| AC-7 | Unchanged defaults: all existing alert stories at 360 / 1024 / 1280, light and dark, at 100 % text are pixel-identical to 3.13.0 (except where an alert is narrower than the threshold). | `story-shots --compare` |
| AC-8 | Light and dark both checked for the new layout; `forced-colors` and `prefers-reduced-motion` unaffected (no new motion). Icon contrast unchanged (3:1). | story, both themes |
| AC-9 | Screen reader/keyboard: DOM order and roles unchanged (icon decorative or labelled as before); focus order title/content, action, close unchanged by the narrow layout (no visual reorder that contradicts DOM order beyond what 3.3 already does). | Jest + review |
| AC-10 | Prerendered HTML: the new rules are static CSS, so the layout holds before JavaScript. `check-angular-majors` passes on 21 and 22. | compat check |
| AC-11 | `hyphens: auto` relies on the document `lang`; with no `lang` the word still breaks via `overflow-wrap`. Documented in the story text (EN, and DE as the other component docs do). | story docs |
| AC-12 | Existing spec assertions stay unchanged; new specs cover AC-1 and AC-4. Changelog entry names G-WL4 and the measured values (123 px alert, before/after overflow). | Jest, CHANGELOG |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Tokens only; any new public CSS hook is `--lc-alert-<property>` with a documented default (optional).

## Assumptions

- Assumption: patch release; no new input.
- Assumption: the narrow threshold is the designer's call; it must be a container width in rem or px that is checked at 200 % text and at 100 %.
- Assumption: `hyphens: auto` plus `overflow-wrap: break-word` as the requester measured; the designer may pick `anywhere` if measurements favour it.
- Assumption: icon-in-title-row follows TD-1 only when a title exists; without a title the icon stays beside the content.
- Assumption: no consumer-side workaround is needed; T092 waits for the release (owner).

## Open questions

None.
