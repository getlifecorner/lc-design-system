# Spec 036: Description-list contrast and targets, 033 story and comment fixes, 034 status-ink follow-ups

- **Status:** ready
- **Type:** bug fix (contrast, target size, forced-colors) plus docs/story fixes
- **Affected:** `description-list` (scss, stories, spec), `card` (stories), `notification-center` (scss, stories), `dependency-viewer` (scss), `log-viewer` (scss), `progress-bar` (scss), `progress-ring` (scss), `CHANGELOG.md`. Not touched: the shared `--color-success/-error/-warning/-info` values and `_theme-*.scss` semantic tokens they come from.
- **Semver impact:** patch. Colours, a larger hit area on clickable description-list rows and a forced-colors outline are fixes; no input, slot or class is added or removed, and non-clickable layouts are unchanged (same reasoning as 3.22.4). If the designer must add a public `--lc-*` hook, that is still minor-free (optional); anything that changes a default token value goes back to me.

## Need

Bundled follow-ups, queued under the owner's standing rule of 2026-11-02. Sources: life-os gap BA-10 (bank accounts page, `specs/004-connect-bank-accounts/kit-gaps.md`; that file was not readable from this checkout, so the row text is taken from the request), review 033 findings 2-4, design 034 §9 (F-8 to F-12), review 034 nits 1, 3, 4 (F-10 extension, ring, F-13), and one German story. Measured values below are the ones those documents record; the designer re-measures before and after.

## What the kit has today

- `description-list.component.scss`: `__link` and `--primary` use `--color-primary-500` (4.37:1 at 14 px in light). Clickable row focus is `box-shadow` (gone in forced-colors). Clickable rows are 38 px (`padding-block: spacing-2` plus line height).
- `card.stories.ts` (l. 10) imports only `IconComponent`, `BadgeComponent`; `FooterSlot` (l. 285) uses `lc-description-list` and `lc-button`, so the body renders empty (list box 294x0).
- Existing accessible-ink tokens from 029/034 (`--color-text-tertiary`, `--color-on-primary-subtle`) are the preferred source for new inks; the designer decides, no raw colours.

## Scope

- In: items A to F below, with CHANGELOG entry (gap IDs BA-10, F-8 to F-13).
- Not in: new inputs; changing shared status colours; redesigning the log toolbar beyond the F-12 decision; other stories' translations.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `lc-description-list` link (`__link`) and `--primary` value reach >= 4.5:1 against the card/page surface in light and dark, at the rendered 14 px (and `--sm` 12 px) | story + `--measure` contrast, both themes; extend contrast assertion if a token changes |
| AC-2 | Clickable-row focus has a visible indicator in `forced-colors: active`: `outline` using `Highlight` (>= 2 px); the normal-mode focus ring stays visible at >= 3:1 | story under forced-colors emulation, screenshot + computed style |
| AC-3 | Clickable rows are >= 44 px tall at 360, 1024 and 1280 px, EN and DE, `rows` and `stacked` layouts, `sm` and `md` | `--measure` of row height |
| AC-4 | Non-clickable rows: height, spacing and colours of everything except link/primary ink are pixel-identical to 3.23.0 (no layout shift) | `--compare` hashes of existing stories; existing description-list specs unchanged |
| AC-5 | `components-card--footer-slot` renders the 3-row description list and both footer buttons at 360 and 1280 px; `ButtonComponent` import checked (added only if missing); no other card story changes | story shot + measured row count = 3 |
| AC-6 | Comment on `&__term` in `description-list.component.scss` describes a `dt` (e.g. "No browser margin: the row gap is the only space (BA-8)."); the `&__value` comment keeps the dd wording | diff review |
| AC-7 | F-8: notification-center message and time text on unread rows >= 4.5:1 in dark at the lightest end of the row background (was 4.23); light not worse | measured contrast, `Priority On Unread Rows` and default stories |
| AC-8 | F-9: dependency-viewer `depends` label >= 4.5:1 (was 2.53 L / 3.57 D); `depends` line/arrow and neutral structural and tree lines (was neutral-400 2.53 L; neutral-300 1.47 L / 2.28 D) >= 3:1 against their surface, both themes; `uses`/`extends` inks from 034 unchanged | measured contrast; all dependency-viewer stories |
| AC-9 | F-10: log-viewer search match text >= 4.5:1 in dark, at rest and on hover, for normal lines, debug lines (3.25) and terminal mode (3.29); light stays >= 4.5 (5.03) | measured contrast per state |
| AC-10 | F-11: progress-bar secondary fill >= 3:1 against its track in light (was 2.83), dark still >= 3:1; other variants unchanged | measured contrast |
| AC-11 | Progress-ring `secondary` and `info` are distinguishable in dark: the two colours differ by >= 1.5:1 from each other, each >= 3:1 against the ring track; light unchanged or still >= 3:1; "All Colors" story reviewed | measured contrast, story shot |
| AC-12 | F-12 decision recorded in `design.md` with the rule used. Either log tool buttons reach 44 px, or the WCAG 2.5.8 exception is documented (>= 24 px target or 24 px circle spacing) and measured; pills (40 px) follow the same decision. Toolbar must not overflow at 360 px, EN and DE | `--measure` of hit areas and overflow |
| AC-13 | F-13: `.ansi-gray` >= 4.5:1 in light (was 2.60) and on the terminal background (was 3.35, 3.35 Mocha); other ANSI colours unchanged | measured contrast |
| AC-14 | Story `Priority On Unread Rows` in notification-center shows German `clearAllLabel`, `searchPlaceholder`, filter labels and any other built-in text visible in it; no English left | story shot at 360 and 1280 px |
| AC-15 | Unchanged defaults: no input/output removed or retyped, no shared `--color-success/-error/-warning/-info` value changed, `theme-contrast.spec.ts` and all existing specs pass without edited assertions (new assertions allowed) | test run, `git diff` of `_theme-*.scss` |
| AC-16 | All changed components work in light, dark, `forced-colors`, `prefers-reduced-motion`; keyboard focus order unchanged; prerendered HTML check (`check-angular-majors.mjs`) still passes | story shots, compat run at release |
| AC-17 | CHANGELOG entry (Fixed; Compatibility: no API break) names BA-10, 033 findings 2-4 and F-8 to F-13 with old and new measured values | diff review |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Tokens only, no raw colours; both themes in `theme-contrast.spec.ts` when a semantic token is touched. Prefer component-local ink choices over editing theme tokens used elsewhere.

## Assumptions

- Assumption: patch release, one bundled version (owner rule allows bundling).
- Assumption: where the F-12 exception is cheaper than 44 px, the designer may choose it if it is measured and documented; 44 px stays the default target.
- Assumption: a link/primary ink fix may use an existing token (for example `--color-on-primary-subtle`) rather than a new one.
- Assumption: ring dark fix changes only the ring's own variant colours, not `--color-secondary-*` globally.

## Open questions

None.
