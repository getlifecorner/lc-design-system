# Review 035: lc-accordion flush form without inline padding

## Round 1 — 2026-11-02, commit 6548981 (code = bf00b8d)

Screenshots: `tmp/story-shots/035/` — `r1` (3 new stories × 360 · 1024 · 1280 × L · D, at rest, measure `r1-measure.js`), `r1-focus` (focus + bleed-hook probe, 360 · 1280 L · D), `r1-fc` (forced colours, 360 L · D), `r1-scroll` (scroll-container probe), `r1-cmp` (15 existing stories). Storybook build from the developer (fresh). Developer logs reused after reading `tmp/035/measure/m.mjs`: hover, toggle, collapse.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `r1.log` *Plain Sizes* all widths: header and body `padding-inline` `0px 0px` at sm/md/lg; collapsed body `0px` (`shots-collapse.log`, panel 0 px) |
| AC-2 | pass | *Plain Variant* 360: wrapper 328, title text x 0, body x 0 (also 1024/1280, L/D) |
| AC-3 | pass | header 44 / 50.5 / 61.5, leading 50.5 at 360, 1024, 1280 |
| AC-4 | pass | trailing: chevron end 0, gap 12; leading: chevron x 0, title x 32, gap 12 |
| AC-5 | pass | `:focus-visible` true, button `outline: none`, `::before` `solid 2px` rgb(32,132,151) L / rgb(132,199,212) D, offset −2; ring 6 px from the glyphs inline, ≥ 11.25 px vertically (sm); box 8–352 (card 33–327), inside viewport and card; contrast 4.37 / 9.95 (page), 4.37 / 9.13 (card), over hover 3.97 L / 8.16 D measured (≥ 6.69 D at the gradient end, design §5); all ≥ 3; forced colours: Highlight (`r1-fc`, shot checked) |
| AC-6 | pass | `shots-toggle.log`: x 0 expanded, mid-collapse (padTop 7.78, so mid-transition), collapsed, mid-expand, expanded |
| AC-7 | pass | hover fill on `::before` #f3f4f6 L, button transparent, glyph 8 px from the fill edge (`hover` shot checked); reduced motion: transition `none` on header, `::before`, icon, panel, body |
| AC-8 | pass | `r1-cmp --compare=baseline`: 90/90 identical (42 + 48); `accordion.component.spec.ts` untouched |
| AC-9 | pass | axe plain describe in `accordion.axe.spec.ts` (gate on bf00b8d); no template change |
| AC-10 | pass | *Plain in a Card* 360: 2 lines (229.73 + 62.55 in 246), header 73, chevron end 0, page scroll width 360; 1 line (295.88) from 1024 |
| AC-11 | pass | compat fixture + `EXPECT_IN_HTML` entry in the diff; 22 green (build.md), 21 in CI |
| AC-12 | pass | 18 L/D shots + focus L/D; group has no `variant` input (grep: 0) |
| AC-13 | pass | JSDoc `@default 'outlined'`, argType options/description/`defaultValue`, docs bullet; card: dt x = title x = body x = link text x = 41 (360), content 41–471 (1280) |

API vs design §2: `AccordionVariant` exported through `index.ts`, `variant` typed with it, JSDoc as designed; `--lc-accordion-header-bleed` read at the use site only; existing hooks still win (plain rules use them as the outer `var()`). Type sizes 13/15/17 title, 13/14/15 body, weight 600; colours text-primary / text-secondary per theme.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix | `--lc-accordion-header-bleed`, consumer docs (CHANGELOG entry; JSDoc of `variant` / docs bullet later) | Consumers learn the hook needs a length: `0px` puts the box on the header (measured width 328 = header) | A unitless `0` makes `calc(-1 * 0)` a number, `inset-inline` invalid → `::before` width **0 px**: no focus ring, no hover fill (`r1-focus`, all 8 shots). Only the SCSS comment says "`0px` not `0`". Design §2 had it wrong ("0 puts it on the text"), now corrected. Release-manager: add to the hook line "set a length; `0px`, not `0`, which removes the ring". |
| 2 | nit | CHANGELOG draft, "Keep 8 px of room before a clipping edge" | Also name scroll containers | Plain accordion in an `overflow-x: auto` box with 0 inline padding: 8 px horizontal scroll; with 8 px padding: 0 (`r1-scroll`). Suggested: "before a clipping or scrolling edge". |

**Verdict:** approved. No must-fix; findings 1 and 2 are wording for the release notes (1 also for a later JSDoc touch).
