# Spec 026: Review findings follow-up 3: toast close colour, notification-center comment, drawer story lang

- **Status:** ready
- **Type:** bug fix (toast close colour), docs only (comment, story)
- **Affected:** `lib/toast/toast.component.scss` (`.lc-toast__close`), `lib/toast/toast.stories.ts` (only if a story needs a changed note), `lib/notification-center/notification-center.component.scss` (comment, line 110–113), `lib/drawer/drawer.stories.ts` (`GermanHeading`), `CHANGELOG.md` (release-manager)
- **Semver impact:** patch. No input, output, slot or hook changes. The × and its focus ring get a visible colour; the owner accepted that this changes the look of the toast outlet (2026-10-31).

## Need

Review 025 findings 1–3 (no consumer page; the owner asked for the follow-up).

1. `.lc-toast__close` has no `color` rule. The browser's `buttontext` (black) renders the × at 1.47:1 and 1.22:1 on the dark toast gradient ends rgb(26,44,58) / rgb(16,28,38). The focus ring is `currentColor`, so it is black too. WCAG 1.4.11 needs 3:1. axe misses it (SVG icon).
2. The comment at `notification-center.component.scss:112` says white on the level colours "was 1.89 to 4.37:1". That range is wrong: Error (8.39) and Info (6.17) passed in light.
3. Story `feedback-drawer--german-heading` puts `lang="de"` on `lc-drawer`, so the English body text (STATUS, "In Progress", the description) is also marked German.

## What the kit has today

`var(--color-text-secondary)` was measured in review 025 on the same gradient ends: 7.56 / 7.23 light, 9.26 / 11.16 dark. It is a token that exists in both themes, so no new token is needed. The drawer heading's `hyphens: auto` needs a `lang` that reaches the heading, so `lang` must stay on the drawer (or the heading's ancestor) in that story.

## Scope

- In: a `color` rule on `.lc-toast__close` (the focus ring follows via `currentColor`); the corrected comment; the story fix.
- Not in (non-goals): new inputs or CSS hooks; changing the toast gradients, sizes, hover tints or the 44 px target; other toast variants' text colours; the `lang` handling of `lc-drawer` itself.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `.lc-toast__close` has an explicit `color` from a semantic token (`var(--color-text-secondary)`, no raw colour); computed colour is not `buttontext` | Unit test (computed style or SCSS source) + story measure |
| AC-2 | The × (SVG stroke/fill) contrast is ≥ 3:1 against the toast background at both gradient ends, for every variant (success, error, warning, info, with action), light and dark, at 360 and 1280 px | Story + `--measure` on the standalone and outlet stories; values recorded in `build.md` |
| AC-3 | The `:focus-visible` ring is ≥ 3:1 against the toast background in light and dark, standalone and in the outlet, and stays visible in `forced-colors` | Story with forced focus + measure; keyboard Tab check |
| AC-4 | Hover tint stays visible and the × keeps ≥ 3:1 on it in both themes (re-measure the four `:hover` overrides at toast.component.scss 129–201) | Measure on hover |
| AC-5 | Close button size (44 × 44 px), position, 20 px icon slot and toast layout unchanged: no shift of the toast height or text at 360 / 1280 px, EN and DE (`Schließen`) | Story screenshot compare of the toast stories; only the × colour differs |
| AC-6 | The comment at `notification-center.component.scss:110–113` states the range correctly: white on the old level fills was 1.89:1 at the lowest; Error (8.39) and Info (6.17) already passed in light (state which levels failed, with measured values taken from review 025 / the 3.19.1 build notes). No code change in that file | Diff shows comment lines only |
| AC-7 | In `GermanHeading`, no English text is under `lang="de"`: either the body is German, or `lang` is on German content only, and the heading is still hyphenated at a syllable (heading wraps, no overflow under the close button, 360 px) | Story at 360 px + `--measure`; `lang` attributes in the rendered DOM |
| AC-8 | The `GermanHeading` docs description still matches the story (header height, 44 px target, `closeAriaLabel`) after the change | Read of the story text |
| AC-9 | Unchanged defaults: no API change, existing toast, drawer and NC specs pass unmodified, tests green | `npx nx run angular-ui-kit:test`, lint, build |

Not applicable: prerendered HTML layout (colour only, no layout change); screen reader (no semantics change; the close button keeps its accessible name).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- The changelog entry (Fixed) names the visible change of the outlet and gives the measured contrast values.

## Assumptions

- Assumption: `var(--color-text-secondary)` is the colour, because it was already measured on the same backgrounds at ≥ 7.2:1 in both themes; the designer may pick another semantic token if it reaches ≥ 3:1 and fits better.
- Assumption: the × only needs 3:1 (UI component, 1.4.11), but the chosen token gives far more, so no further tuning.
- Assumption: for finding 3, translating the English body of `GermanHeading` to German and keeping `lang="de"` on `lc-drawer` is the simplest fix (the heading hyphenation needs the `lang`); the designer decides the exact wording.
- Assumption: other toasts' hover tint `rgba(0,0,0,0.05)` is not part of the finding; only re-measured (AC-4).

## Open questions

None.
