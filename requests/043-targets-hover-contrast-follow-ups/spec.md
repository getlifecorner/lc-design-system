# Spec 043: Targets, hover borders and contrast follow-ups of 042

- **Status:** ready
- **Type:** bug fix (accessibility and styles across components, no new API)
- **Affected:** notification-center, log-viewer, callout, select, tag, rich-text-editor, document-viewer, chat, table, input, textarea, datepicker, header (+ child button/primary inks), gallery, kanban-board; their stories and specs; `libs/angular-ui-kit/CHANGELOG.md`; `requests/042-…/release.md` (typo)
- **Semver impact:** patch. No new input, slot or hook; defaults keep their API. Rest looks change only where a measured contrast fails (F-24, F-26, F-27), which is a fix. Raising to minor is not needed (same precedent as 3.23.1, 3.25.1).

## Need

The 042 sweep and its review found controls and colours that fail WCAG 2.2 AA in the kit's own stories (source: 042 design.md section 9, F-22 to F-27). The consumer is every page using these components, in life-os among others. Today: small targets, hover that lowers field-border contrast or hides the error state, a field frame under 3:1, a light header that turns dark inside a dark page, and axe findings.

## What the kit has today

Nothing covers this by API. Existing precedents: the `::before` 44 px hit-area pattern (file-upload remove, 042 F-21; AC-11 measure `fu-proto`), `--color-error-subtle` (6.58 L / 5.42 D on kanban), and the focus-over-hover rules from 042 (`hover-measure.js`). Reuse them; add nothing new.

## Scope

- In: F-22 to F-27 below, plus the story-ID typo in 042 `release.md` line 43 (`dependency-viewer--phone-width-german` becomes `data-display-dependency-viewer--phone-width-de`).
- Not in: new inputs or hooks; redesign of the components; other targets that the sweep did not list.

## Decisions (made here, see Assumptions)

| Item | Decision |
|---|---|
| F-22 log-viewer pills (15 px, hit 40) | Do not rely on the 2.5.8 exception from 034/036: raise the hit area to 44 x 44 without changing the pill's look |
| F-22 remove x (callout, select, tag) | Keep the glyph size, hit area 44 x 44 through `::before`; neighbours may not overlap (6 px apart as in AC-11 of 042), or document exception 2.5.8 "spacing" where 24 px circles fit with 24 px spacing |
| F-22 NC action/chips, RTE toolbar/mode, doc-viewer, chat, table checkbox | `min-block-size`/`min-inline-size` 44 px (checkbox: hit area 44 via label/`::before`, box stays 16 px) |
| F-23 | Hover never changes a field border below 3:1; an error field keeps its error border and colour on hover |
| F-24 | Frame border uses the field-boundary token the input uses (>= 3:1 on its surface, both themes) |
| F-27 | Over-limit column background `--color-error-subtle` |

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | Each F-22 control has an effective hit area >= 44 x 44: `elementFromPoint` at centre +/- 21.5 hits it, +/- 23 does not (or the neighbour); adjacent hit areas do not overlap | `--measure` on the touched stories, 360/1024/1280, L/D, EN/DE |
| AC-2 | Visible look of pills, x buttons and checkbox box is unchanged where only the hit area grows (pixel compare); controls that grow (toolbar, mode switch, chips, actions) do not break their row at 360 px (no horizontal overflow, German labels wrap or scroll as before) | `--compare=<baseline>`, `scrollWidth <= clientWidth` |
| AC-3 | Textarea, datepicker (and input, select) border on `:hover` (unfocused) is >= 3:1 against the surface in both themes; not `--color-primary-400` at 1.89:1 | computed contrast in `hover-measure.js` |
| AC-4 | Error state (`invalid`) on input, select, textarea, datepicker: border and message colour on `:hover` equal the rest state | `hover-measure.js` rest vs hover = SAME |
| AC-5 | Rich-text-editor frame border >= 3:1 against the page/surface, light and dark | computed contrast; assertion in a spec |
| AC-6 | `lc-header theme="light"` inside a dark page: child `lc-button`s and primary inks use the light-theme values (same as in a light page) | story *light header in dark page*, measured colours of 2 button variants and a primary link |
| AC-7 | The same for `theme="dark"` in a light page (symmetry) | same story |
| AC-8 | axe: 0 violations (beyond the 3 isolated-story landmark rules) for RTE mode `.active`, gallery `__filter-btn--active`, chat monogram, tag chip text in light and dark, 360/1280 | `--axe` |
| AC-9 | Log-viewer scroll region is keyboard focusable (`tabindex="0"`, accessible name, visible focus ring from 042) without a second tab stop when it already contains a focusable | unit test + `--axe` |
| AC-10 | Kanban over-limit column title >= 4.5:1 (expected 6.58 L / 5.42 D) and the 042 card ring (inset) is still >= 3:1 there | contrast measure, `kanban-board--keyboard-focus` |
| AC-11 | `requests/042-…/release.md` names `data-display-dependency-viewer--phone-width-de`; ID checked against `index.json` | grep |
| AC-12 | Unchanged defaults: no changed public input, output or hook; at-rest compare identical except the rows named in AC-5, AC-8, AC-10 | API diff, baseline compare |
| AC-13 | Keyboard and forced-colors: new hit areas add no focus-ring regression (ring still around the visible control, Highlight in forced colors); tab order unchanged | 042 focus measure, `--forced-colors` run |
| AC-14 | Prerendered HTML: no layout depends on JS for these fixes (CSS only) | compat prerender check unchanged |
| AC-15 | CHANGELOG 3.27.1 (or the bundle's version): Fixed per finding F-22 to F-27 with measured values; Compatibility notes that larger toolbar/chip targets can shift rows by a few px | CHANGELOG |

New or extended stories are required for: the 44 px targets (one *Touch targets* story per component where none exists), the light-header-in-dark-page case, and the error-hover case.

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break. Tokens only, no raw colours. Both themes, `forced-colors`, reduced motion.

## Assumptions

- Assumption: the log-viewer pills lose the 034/036 exception because a hit-area-only fix costs no visual change.
- Assumption: where a larger visible size would break a dense layout (checkbox, x buttons, pills) the hit area is enlarged and the glyph stays; the sizes in 042 AC-11 are the reference.
- Assumption: F-24 uses the same token as the input border; if none reaches 3:1 in light, the designer picks the nearest existing token (no new palette value).
- Assumption: patch release, bundled with whatever else is queued.

## Open questions

None.
