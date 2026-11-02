# Build 038: lc-accordion bleed hook robust to a unitless 0, scroll-container note

- **Branch:** `fix/3.24.1-accordion-bleed-hook-follow-ups`
- **Commit:** see `git log -1` on the branch, `fix(accordion): a unitless 0 on --lc-accordion-header-bleed keeps the ring and hover fill; scroll-container note`

## Files changed

| File | Change |
|---|---|
| `libs/angular-ui-kit/src/lib/accordion/accordion.component.scss` | `@property --_lc-accordion-header-bleed` (`<length-percentage>`, `inherits: false`, `initial-value: 0px`) with the §2 comment, right before the `::before` rule; `::before` declares the private property first and reads only it in `inset-inline`; header comment l. 204–207 as §2 |
| `libs/angular-ui-kit/src/lib/accordion/accordion.component.ts` | `variant` JSDoc as §7 ("clipping or scrolling edge (`overflow: hidden` or `overflow-x: auto`)", "The hook takes a length; `0px` puts them on the edge.") |
| `libs/angular-ui-kit/src/lib/accordion/accordion.stories.ts` | docs bullet (l. 77) and *Plain Variant* description (l. 297) as §7; no canvas change |
| `libs/angular-ui-kit/src/lib/accordion/accordion.plain.spec.ts` | JSDoc test +2 `toContain`; `::before` list changed (see Deviations); new test pins the `@property` block; "every later rule targets plain" filter skips exactly the one `@property` |
| `tools/compat/check-angular-majors.mjs` | `EXPECT_IN_HTML` entry "plain accordion bleed @property" after "plain accordion" |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | spec `038 AC-1, AC-3` (at-rule text, one `@property`, private declared once / read once) + `::before` list; measure (`tmp/038/shots-measure.log`): `0` → `328px 0px` / `560px 0px` (plain-variant 360 / 1280), `278px 0px` / `430px 0px` (plain-in-card), L and D; `rules` = `["--_lc-accordion-header-bleed <length-percentage> false 0px"]`; focus with `0`: `fv: true`, `w` = header, `solid 2px rgb(32, 132, 151) -2px` |
| AC-2 | dropped by the designer (AC-1 met, design D-3); `0px` still named in JSDoc, docs bullet, story text, changelog draft |
| AC-3 | measure table equals the `before` column of `proto.log` for every valid value at all 8 setups (360: unset 344/−8, `0px` 328/0, `4px` 336/−4, `1rem` 360/−16, `var(--spacing-2)` 344/−8, `5%` 360.781/−16.3906, `-4px` 320/4, `0.5em` 343/−7.5, `initial` 344/−8; 1280: 576, 560, 568, 592, 576, 616, 552, 575, 576); hash compare §Gates |
| AC-4 | grep `clipping or scrolling edge`: ts 1, stories 2, changelog draft 1; spec `toContain` |
| AC-5 | changelog draft below: Fixed + Changed + Compatibility, BA-9, 035, "No API break" |
| AC-6 | ring L `rgb(32, 132, 151)`, D `rgb(132, 199, 212)` (035 contrasts, colours unchanged); forced colours with `0` (`tmp/038/shots-fc.log`): `rgba(5, 0, 73, 0.8)` L / `rgba(0, 230, 255, 0.8)` D, box 278; reduced-motion block untouched (spec AC-7 test green) |
| AC-7 | `--testFile=accordion`: 4 suites, 61 tests; full suite §Gates; changed assertions in Deviations |
| AC-8 | focus shot `tmp/story-shots/038/measure/components-accordion--plain-in-card--360-light.png`: ring around the 2-line DE title, box 278 = header; EN plain-variant 328 / 560; no markup or ARIA change |
| AC-9 | compat 22 incl. the new `@property` check §Gates |

## Gates

All gates ran on commit `ae8abba8db9b306aa0b917534af0cbc5f91657d0` (later agents skip a gate while `git diff --quiet ae8abba -- libs tools` holds; the amend only added this file and the message).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 217 suites, 5115 passed (+1), 8 skipped (`--runInBand`, 203 s) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline 162) |
| `npx nx run angular-ui-kit:build` | green, 122 "Built" lines; fesm keeps `@property --_lc-accordion-header-bleed{…initial-value: 0px;}` |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | green, 993 stories (unchanged) |
| Story screenshots | `--compare=tmp/story-shots/038/baseline` on all 18 accordion + accordion-group stories, 360/1024/1280 L/D → `tmp/story-shots/038/build`: 108 identical, 0 different, 0 missing. Measure `tmp/story-shots/038/measure` (8), forced colours `measure-fc` (2); opened 2 (plain-in-card 360 L focus with `0`, plain-variant 1280 D) |
| `node tools/compat/check-angular-majors.mjs --only=22` | install, build+prerender ok; 92 HTML checks ok (was 91), incl. "plain accordion bleed @property" (Node 24.21, Angular 22.2.4) |

## Deviations from the design

None in the rendering. Spec assertion changes (AC-7), each because the mechanism changed (AC-1):

| Test | Change | Why |
|---|---|---|
| `AC-5, AC-7: the bleed box reaches …` | `::before` list: new first line `--_lc-accordion-header-bleed: var(--lc-accordion-header-bleed, var(--spacing-2));`, `inset-inline: calc(-1 * var(--_lc-accordion-header-bleed));` | design §9 AC-7; the hook-count lines (1 read, never declared) still hold unchanged |
| `AC-8: everything before the plain block …` | the selector filter also skips exactly `@property --_lc-accordion-header-bleed` | not listed in design §9: the at-rule sits after the cut and is not a `.lc-accordion--plain` selector. The skip names the one at-rule, and the new test pins it as the only `@property`; the before-cut hash (3873 chars) is unchanged |

## Changelog draft

```markdown
## [3.24.1] - 2026-11-02

`--lc-accordion-header-bleed: 0` (unitless) keeps the focus ring and hover fill of `lc-accordion` `variant="plain"`, and the docs name scroll containers (life-os BA-9, review 035 findings 1 and 2). No API breaks.

### Fixed

- **`--lc-accordion-header-bleed: 0`** (unitless) now puts the hover background and focus ring of `variant="plain"` on the header edge, like `0px` (BA-9, review 035 finding 1). In 3.23.0–3.24.0 `calc(-1 * 0)` was a number, the bleed box lost `inset-inline` and was 0 px wide: no ring, no hover fill. A value that is neither a length nor a percentage (`8`, `auto`) now also gives 0 px instead of no box. Measured in *Plain Variant*: `0` 328 / 560 px at 360 / 1280 (= header, was 0); default 344 / 576 and `0px`, `4px`, `1rem`, `5%`, `-4px`, `0.5em` unchanged.

### Changed

- The `variant` JSDoc, the accordion docs and the *Plain Variant* story say to keep 8 px of room before a clipping or scrolling edge: in an `overflow-x: auto` box with 0 inline padding a plain accordion scrolls 8 px sideways, with 8 px of padding it does not (review 035 finding 2).

### Compatibility

- No API break: no input, output, class, template or default changed; the hook stays unregistered with default `var(--spacing-2)`. The fix registers a private `--_lc-accordion-header-bleed` with `@property` (Chrome 85, Safari 16.4, Firefox 128); older browsers render as 3.24.0, where only `0px` zeroes the hook. Resolves the two *Known* items of 3.23.0. The 108 story shots of `lc-accordion` and `lc-accordion-group` are hash-identical.
```
