# Spec 034: Status ink contrast follow-up 2 (F-1 to F-7 of 029)

- **Status:** ready
- **Type:** bug fix (contrast and target size), with at most one new semantic text token (F-1)
- **Affected:** `lc-notification-center`, `lc-progress-ring`, `lc-diff-viewer`, `lc-card`, `lc-log-viewer`, `lc-dependency-viewer` (`.scss`, the edge colour map in `dependency-viewer.component.ts`); `styles/_theme-dark.scss` / `_theme-light.scss` only if F-1 needs a token; `theme-contrast.spec.ts`; stories; CHANGELOG
- **Semver impact:** minor if the design adds a public token (F-1, `--color-…` in both theme files, additive); patch if F-1 is solved with a component-local value. Recommendation: minor. No input, slot or default API changes; the shared `--color-success/error/warning/info` values do not change.

## Need

Request 029 closed the status-ink swap and left seven known contrast and target-size failures (029 `design.md` §9, `release.md`, `review.md` r2). They are not tied to one consumer page; the owner asked for them on 2026-11-02. Today, measured in 029:

| # | Where | Fails today |
|---|---|---|
| F-1 | NC `--high` chip on an unread (teal-selected) row, dark | 3.67:1 text (4.26 at the other end of the row gradient) |
| F-2 | `lc-progress-ring` arc `--color-<v>-default` on the track | light success 2.47, warning 2.05 (graphic, needs 3:1) |
| F-3 | diff line numbers (`--color-text-tertiary`) on the added line, light | 3.88:1 |
| F-4 | `lc-card` `--primary` chip text `--color-primary-500` on the 16 % teal tint, light | 3.12 (selected) to 3.57:1 |
| F-5 | log-viewer level pills | 15 px high (target) |
| F-6 | dependency `uses` (`--color-neutral-300`) and `extends` (`--color-primary-400`) edge labels, light | faint text, below 4.5:1 |
| F-7 | log-viewer dims text with `opacity` | debug level 2.53 L / 3.25 D (terminal 2.97); timestamp and source 3.21 L / 4.43 D (terminal 3.64); terminal line numbers 2.20 (1.59 on debug lines); debug timestamp and source 1.94 L / 2.58 D / 2.24 T |

## What the kit has today

- `--color-on-<v>-subtle` / `--color-<v>-subtle` pairs (029) already reach 4.5:1 everywhere except F-1: dark `--color-on-warning-subtle` equals the old fill `#e1a040`, and no existing token is lighter.
- `--color-text-secondary` (L 7.14:1, D `#c4d2d9`) and `--color-text-tertiary` (L `#5c6672`, D `#93a4ad`) exist for hierarchy; the log viewer does not use them for its dims (opacity instead).
- The terminal log variant is always dark and carries its own hex palette (`#9399b2`, `#f9e2af`, `#f38ba8`, `#45202a`, `#3d3520`); 029 measured its levels at 5.81 / 7.78 / 11.43 / 6.19 and they must not regress.
- Other bases exist (`--color-primary-700`, `--color-neutral-600`, `--color-surface-hover`) but no token fixes F-1.

## Scope

- In: F-1 to F-7 as above. The design picks the tokens and values; the spec fixes the targets. The terminal palette may get new hex values only inside `.lc-log-viewer--terminal` (always-dark).
- Not in (non-goals): changing `--color-success/error/warning/info` or any shared token value; new inputs, locale strings or slots; a redesign of the log viewer's layout beyond the pill height and the dims; other components' contrast (anything not in F-1 to F-7); the dependency viewer's edge **line** colours except where they double as label ink (F-6), and edge lines keep ≥ 3:1 (see AC-9); the NC high chip on read rows (already 4.60).

## Acceptance criteria

Thresholds everywhere: text ≥ 4.5:1, icons, graphics and boundaries ≥ 3:1, targets ≥ 44 px or the WCAG 2.5.8 spacing exception, both themes. Contrast is computed (`theme-contrast.spec.ts` style), not estimated; story values come from `story-shots.mjs --measure`.

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | F-1: the NC `--high` chip text on an unread row in dark is ≥ 4.5:1 over the whole row gradient (surface to surface-2 end, panel gradient included), at 360 and 1280 px; read rows stay ≥ 4.60; the light theme chip is unchanged (≥ 5.52) | computed pairing in `theme-contrast.spec.ts` + story measurement of the real background |
| AC-2 | F-1: the fix touches no shared status value: `--color-warning-default` and the other three keep their current hex; any new token exists in both theme files with an asserted ratio | unit test (hex equality + new token ratios) |
| AC-3 | F-2: the progress-ring arc is ≥ 3:1 against the track in all six variants, both themes (light success and warning were 2.47 / 2.05); the centre text keeps ≥ 4.5:1 | computed pairing + story shot of all variants in light and dark |
| AC-4 | F-3: diff line numbers on added, removed and context lines are ≥ 4.5:1 in both themes (light added was 3.88); the `+` / `-` prefix is ≥ 4.5:1 too, since it is text | computed pairing over the three line backgrounds |
| AC-5 | F-4: `lc-card` `--primary` chip text is ≥ 4.5:1 on its tint in both themes, also on a selected card (light was 3.12), and its border stays ≥ 3:1 | computed pairing; card story with `selected` in light and dark |
| AC-6 | F-5: each log-viewer level pill (error, warn, plus any other pill in the toolbar) has a hit area ≥ 44 × 44 px at 360 px, or ≥ 24 × 24 px with the 2.5.8 spacing exception (a 24 px circle around its centre touches no other target); the toolbar height and wrapping at 360 px stay usable in EN and DE (no horizontal overflow) | `--measure` of pill bounding box and neighbour distance at 360 / 1024 / 1280 px; story shot |
| AC-7 | F-7: no `opacity` dims text in `lc-log-viewer` (`__line--debug`, `__timestamp`, source, `__line-num`, `__line-count`): grep of the SCSS finds none on text elements; the hierarchy is carried by text tokens (`--color-text-secondary`, `--color-text-tertiary`) in the log variant | SCSS source check in a spec + review of the shot |
| AC-8 | F-7: in both variants (log and terminal) and both themes, the following are ≥ 4.5:1 against the line background, including the warn and error row tints and the hover and selected states: debug level and message, timestamp, source, line number, line count; the terminal levels keep ≥ 5.81 / 7.78 / 11.43 / 6.19 | computed pairing over all line backgrounds; terminal measured in the story |
| AC-9 | F-6: `uses` and `extends` edge labels are ≥ 4.5:1 against the viewer background and its 3 px halo in light and dark (text on `--color-surface`); the **lines** of those edges stay ≥ 3:1; the edge type is still told apart by dash style and label text, not by colour alone | computed pairing; story with all edge kinds in light and dark at 360 and 1280 px |
| AC-10 | Keyboard and screen reader unchanged: no new focusable element, tab order and accessible names as before; `:focus-visible` rings on the pills stay ≥ 3:1; `forced-colors` keeps system colours and the pressed-pill outline | existing specs green + forced-colors story check |
| AC-11 | EN and DE: the changed pills, chips and labels do not clip or wrap differently at 360 px with the long German locale strings | story shot (DE) at 360 px |
| AC-12 | Prerendered HTML: the fixes are CSS only; `EXPECT_IN_HTML` and the compat prerender stay green on Angular 21 and 22 | `check-angular-majors.mjs` |
| AC-13 | Unchanged defaults: no input, output, slot or locale key is added or renamed; existing assertions in the six components' specs are not edited (a new assertion only where the stated colour changes) | existing specs green; diff review |
| AC-14 | The 029 pairing block in `theme-contrast.spec.ts` gets a sibling block for these pairings; the known-residual entry `[5.52, 3.67]` for F-1 is replaced by a pass | unit test |
| AC-15 | The CHANGELOG entry (Fixed; Added if a token) names F-1 to F-7, the measured before and after values, and states "no API break" | changelog review |

Covered through the rows above: 360 px and desktop widths (AC-1, 3, 6, 9, 11), light and dark (all), keyboard and screen reader (AC-10), EN and DE (AC-11), prerendered HTML (AC-12), unchanged defaults (AC-13).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Colours come from tokens; a hex is allowed only inside the always-dark terminal variant (as today).
- F-5 must not enlarge the visible pill beyond what the toolbar can hold at 360 px; the design may enlarge the hit area without growing the visible pill.

## Assumptions

- Assumption: F-1 to F-7 are one request and one release (the owner asked for all seven); the design may split into commits.
- Assumption: "a dark warning text ink" (F-1) is a new token or a component-local value on `.nc__item--unread` chips; the design decides. Recommended: a token only if another component can reuse it.
- Assumption: the 2.5.8 spacing exception satisfies F-5 if 44 px would break the toolbar at 360 px; the requirement text allows it.
- Assumption: AC-8 uses the line backgrounds known from 029 (log: surface plus the 12 % warn / error tints; terminal: `#1e1e2e`-class background plus its tints); the design lists the exact bases.
- Assumption: the `--color-success-default` family stays for the progress-ring arc if a darker light-theme arc is reached by another existing token or a component-local value; the arc's variant identity (hue) must stay recognisable.
- Assumption: no consumer needs a heads-up; the visual change is limited to slightly darker ink in light and a lighter warning ink in dark.

## Open questions

None.

## Resolution

n/a (new work; nothing in the kit covers it).
