# Spec 029: Status ink contrast follow-up of 027 and the money Number Column caveat

- **Status:** ready
- **Type:** bug fix (colour) plus docs only
- **Affected:** `lc-notification-center`, `lc-card`, `lc-markdown`, `lc-status-dot`, `lc-pipeline`, `lc-file-upload`, `lc-rating`, `lc-log-viewer`, `lc-diff-viewer`, `lc-dependency-viewer`, `lc-kanban-board`, `lc-progress` (SCSS only; hex fallbacks in notification-center); `money.stories.ts` (Number Column description); `CHANGELOG.md`
- **Semver impact:** patch. No input, slot, hook or default changes. Only the computed foreground colour of status elements changes, toward the darker (light) or lighter (dark) step of the same hue, as in 3.19.2 (toast close colour) and the colour half of 3.20.0. Consumers who pin these colours with their own overrides are unaffected.

## Need

Request 027 fixed the toast and alert icons and listed more places where a status fill (`--color-success/-error/-warning/-info`) is used as text, icon or boundary (027 design §5, "Follow-up candidates"). The consuming pages show them today with ratios below WCAG 2.2 AA. 027 review finding 2 also left a docs caveat open: the Number Column story tip suggests `formatMoney(...).text` in a table `formatter` right after saying screen readers still hear the currency, which holds only for `lc-money`.

## What the kit has today

- Ink tokens exist in both themes: `--color-on-<success|warning|error|info>-subtle` (light `_theme-light.scss` l. 327–332: success/error/info dark steps, warning `#855a22`; dark `_theme-dark.scss` l. 318–321: `#a9bb93`, `$color-warning-default`, `$color-error-light`, `$color-info-light`). `--color-text-<warning|success|error>` alias them.
- The fix of 027 (icon colour swap, shared fills untouched) is the pattern. No new token is needed. If a cell has no fitting ink (for example `info` as a graphic, or `-default` steps), the developer picks the nearest existing ink and records it in `build.md`.

## Scope

- In: the ink swap for the elements in the table below; the Number Column caveat; changelog entry.
- Not in: changing `--color-success/-error/-warning/-info` values or the `-default/-light/-dark` steps; fills, tints and rails (keep the fill, as the toast rail); new tokens, inputs or CSS hooks; other components not listed (a full-kit grep for further status-as-foreground uses is a separate request).

## Acceptance criteria

Ratios are computed (WCAG relative luminance) on the element's real background (`--color-surface`, the tint over it, the progress track), light and dark, and asserted in a spec or a measured story.

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `lc-notification-center` priority labels `--high` and `--urgent` (10 px text) reach >= 4.5:1 on their tint in both themes (was warning L 1.97, urgent D 1.98). | contrast computation + story measure, both themes |
| AC-2 | `lc-card` status chips `--success`, `--warning`, `--error` text reaches >= 4.5:1 on the tint in both themes (was 2.33, 1.97, 1.98). | same |
| AC-3 | `lc-markdown` `__mermaid-error` text >= 4.5:1 in dark (was 2.06) and still >= 4.5:1 in light. | same |
| AC-4 | `lc-notification-center` type icons (`.lc-nc__item-icon--*`) >= 3:1 in both themes; the raw hex fallbacks (`#3b82f6` …) are removed, only tokens remain. | grep shows no hex in the file's icon rules; contrast |
| AC-5 | `lc-status-dot` `done/wait/blocked` >= 3:1 against `--color-surface` and `--color-background`, both themes (was success L 2.72, warning L 2.26, error D 2.06). | contrast |
| AC-6 | `lc-pipeline` warning and error node border and glyph >= 3:1, both themes (was 2.26 L, 2.06 D); success and info nodes also >= 3:1. | contrast |
| AC-7 | `lc-file-upload` remove x on hover >= 3:1 on the error tint, both themes (was D 1.98). | contrast |
| AC-8 | `lc-rating` filled star >= 3:1 on the surface, both themes (was warning L 2.26). | contrast |
| AC-9 | Level and diff colours in `lc-log-viewer`, `lc-diff-viewer`, `lc-dependency-viewer`, `lc-kanban-board` reach 4.5:1 where they are text, 3:1 where they are glyph or boundary, both themes (was success L 2.72, warning L 2.26). Dark keeps passing. | contrast per component |
| AC-10 | `lc-progress` fill >= 3:1 against its track in both themes for every variant (was success L 2.47, warning L 2.05, error D 1.84, info D 2.5). The track itself must stay >= 3:1 against the surface or be unchanged. | contrast |
| AC-11 | `--color-success/-error/-warning/-info` and their `-default/-light/-dark` steps have identical values before and after; no new global token. | diff of `_theme-*.scss` and token files; `theme-contrast.spec.ts` green |
| AC-12 | The Number Column story description, after the `formatMoney(...).text` sentence, says: that string has no spoken text, so the unit is then only in the column header; prefer `lc-money` in a cell template, as in this story. No story render changes. | text in `money.stories.ts`; MCP manifest test green |
| AC-13 | Changed colours hold in `forced-colors` (no colour-only meaning added or lost) and with status meaning also carried by text, icon shape or label as before. | story with forced-colors emulation for the changed components |
| AC-14 | No API break: all inputs, outputs, selectors, `--lc-*` hooks and defaults unchanged; existing specs pass without edited assertions (colour assertions excepted, with the reason in `build.md`). | full Jest run, `check-angular-majors` |
| AC-15 | Layout is unchanged at 360, 1024 and 1280 px in EN and DE (colour only; no size or spacing change). | story shots compared by hash, expected diffs only in the changed colours |
| AC-16 | Changelog (Fixed + Compatibility) lists old to new ratios per component, says shared fills are unchanged and notes that consumers see darker (light) / lighter (dark) status text and icons. | `CHANGELOG.md` |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Keep specificity so a consumer override of `--lc-*` hooks or component rules still wins as before (027 used a 0-3-0 override sentence; repeat the note if relevant).

## Assumptions

- Assumption: patch, not minor, because there is no new API surface; the visual change is a contrast fix like 026.
- Assumption: where the 027 table gives only the failing theme, both themes are re-measured and the fix must not regress the passing one.
- Assumption: for the progress fill, the fill colour moves to the ink (not the track), so the fill stays recognisably the status hue.
- Assumption: the Number Column caveat wording is taken from 027 review finding 2.

## Open questions

None.
