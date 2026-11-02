# Build 035: lc-accordion flush form without inline padding

- **Branch:** `feat/3.23-accordion-flush-inset`
- **Commit:** `feat(accordion): variant plain lines the disclosure up with the content edge (BA-9)` (amended with this file; code unchanged since `bf00b8d`)

## Files changed

| File | Change |
|---|---|
| `libs/angular-ui-kit/src/lib/accordion/accordion.component.ts` | new exported type `AccordionVariant` (`'outlined' \| 'flat' \| 'plain'`); `variant` typed with it, JSDoc per design §2 with `@default 'outlined'`. Template and logic unchanged. |
| `…/accordion/accordion.component.scss` | plain block appended after the size rules (design §3–§6): container, header (min-height 44, block padding per size, `isolation`), `::before` bleed box (`--lc-accordion-header-bleed`, default `var(--spacing-2)`), hover and ring on the bleed box, title wrap, panel/body `overflow-x: visible; overflow-y: clip`, body padding collapsed 0 / expanded per size, reduced motion `transition: none`, forced colours `Highlight`. Hook documented in the comment. |
| `…/accordion/accordion.stories.ts` | `variant` argType: `plain` option, description and default; "Plain" docs bullet; stories *Plain Variant*, *Plain Sizes and Chevron*, *Plain in a Card (Sheet Alignment)* (design §8, with story descriptions). |
| `…/accordion/accordion.plain.spec.ts` | new, 24 tests (input, classes, keyboard, stylesheet). |
| `…/accordion/accordion.axe.spec.ts` | new describe: three plain accordions (sm expanded, md collapsed DE, lg leading with `ariaLabel`), 0 violations, label-in-name pass. Existing tests untouched. |
| `tools/compat/template/src/app/home.html`, `tools/compat/check-angular-majors.mjs` | `<lc-accordion variant="plain" title="Quelle ansehen">` and `['plain accordion', /class="[^"]*lc-accordion--plain/]` (design §9 AC-11). |

## Acceptance criteria

Measured with `tmp/035/measure/m.mjs` (modes geom, focus, hover, toggle, collapse); logs `tmp/035/shots-*.log`.

| AC | Covered by | Measured |
|---|---|---|
| AC-1 | plain spec (classes at sm/md/lg; per-size header and body rules) + *Plain Sizes* | header and body `padding-inline` `0px 0px` at sm/md/lg, expanded and after collapse (`bodyPad 0px`, panel 0 px) |
| AC-2 | *Plain Variant* 360 | wrapper 328; title x 0, body x 0 |
| AC-3 | spec (min-height rule) + *Plain Sizes* 360/1280 | 44 / 50.5 / 61.5; leading 50.5 |
| AC-4 | spec (gap, order) + *Plain Sizes* | chevron end 0; leading chevron x 0, gap 12, title x 32 |
| AC-5 | spec (ring on `::before`, button `outline: none`, forced colours) + focus shots | `:focus-visible` true; ring `solid 2px` rgb(32,132,151) L / rgb(132,199,212) D, offset −2, box 8–352 (card 33–327), in viewport; vs page 4.37 L / 9.95 D, vs card 4.37 / 9.13 (bg colour; gradient ends per design §5); forced: Highlight |
| AC-6 | spec (collapsed padding 0) + toggle measure (300 ms padding transition injected) | body x 0 expanded, mid-collapse, collapsed, mid-expand, expanded |
| AC-7 | spec (hover rules, reduced-motion list) + hover measure | fill on `::before` #f3f4f6 L, button transparent; glyph 8 px from the fill edge; ring on hover 3.97 L / 9.05 D; reduced motion: transition `none` on header, `::before`, icon, panel, body |
| AC-8 | plain spec: compiled CSS before the plain block = 3.22.4 (3873 chars, sha1 `ad6152…`), later rules target plain only; default/flat classes pinned; existing specs unchanged | `--compare` 90/90 identical (`tmp/story-shots/035/compare`) |
| AC-9 | `accordion.component.spec.ts` (unchanged), plain spec keyboard test, axe plain case | 0 violations |
| AC-10 | *Plain in a Card* 360 | 2 lines (229.7 + 62.6 px in 246), 73 px, chevron end 0; text overflow none (header `scrollWidth − clientWidth` = 8 is the bleed box, page scroll width = viewport) |
| AC-11 | compat fixture + `EXPECT_IN_HTML` | `lc-accordion--plain` in the Angular 22 server HTML (21 runs in CI) |
| AC-12 | 18 shots L/D + focus L/D + forced colours | group: n/a (no `variant` input) |
| AC-13 | JSDoc, argType, *Plain in a Card* | dt x = title x = body x = link text x = 41 at 360 |

## Gates

All gates ran on commit `bf00b8d5436721d3598a6d2635c7dca8e5f03a7f` (later agents skip a gate while `git diff --quiet bf00b8d -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 214 suites, 5004 passed, 8 skipped (`--maxWorkers=4`) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline 162) |
| `npx nx run angular-ui-kit:build` | green, 122 "Built" lines |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | green, 983 stories (+3) |
| Story screenshots | new: `tmp/story-shots/035/build` (18), `focus` (8), `focus-fc` (2, forced colours), `hover` (4); baseline compare `tmp/story-shots/035/compare` 90/90 identical |
| `node tools/compat/check-angular-majors.mjs --only=22` | install, build+prerender ok; 89 HTML checks ok (was 88), incl. "plain accordion" (Node 24.21) |

## Deviations from the design

None.

## Changelog draft

```markdown
## [3.23.0] - 2026-11-02

`lc-accordion` gets a flush form, `variant="plain"`: title, chevron and body line up with the content edge of the sheet or card around them (life-os BA-9, booking sheet „Quelle ansehen“). No API breaks.

### Added

- **`lc-accordion` `variant="plain"`** (BA-9): no border, background or inline inset at `sm`, `md` and `lg`, collapsed and expanded. In a 328 px container at 360 px the title and the body start at the container edge (0 px, was 18 px with `flat`), the chevron ends at the other edge. The header keeps its block padding and is at least 44 px high (`sm` 44, was 40; `md` 50.5, `lg` 61.5). The body does not move sideways while it expands. A long German title wraps and hyphenates inside the header.
- **`--lc-accordion-header-bleed`** (default `var(--spacing-2)`, 8 px; plain only): the hover background and the 2 px focus ring sit on a box that reaches this far past the text on both sides, so neither touches the glyphs. Ring contrast ≥ 3.97:1 (light, over the hover fill) and ≥ 6.69:1 (dark); `Highlight` in forced colours. Keep 8 px of room before a clipping edge. `--lc-accordion-header-bg`, `-hover-bg` and `-border` paint that box in plain.
- Type `AccordionVariant` (`'outlined' | 'flat' | 'plain'`).
- Stories: Components/Accordion "Plain Variant", "Plain Sizes and Chevron", "Plain in a Card (Sheet Alignment)".

### Compatibility

- No API breaks: `variant` stays `'outlined'` by default, the template is unchanged, and every new rule is scoped to `.lc-accordion--plain`. The compiled stylesheet before the plain block is byte-identical to 3.22.4; the 90 story shots of `lc-accordion` and `lc-accordion-group` are hash-identical. `--lc-accordion-header-padding` and `--lc-accordion-body-padding` still win in plain; set only block values there.
- With `prefers-reduced-motion`, the plain form runs no transition at all (the other variants keep today's shortened ones).

### Migration

- life-os: replace `variant="flat"` and the interim `style="--lc-accordion-header-padding: 0.875rem 0; --lc-accordion-body-padding: 0.875rem 0 1rem"` with `variant="plain"`. The interim values equal the plain `md` defaults, so leftovers render the same.
```
