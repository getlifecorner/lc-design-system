# Build 058: lc-card accessible name, lc-hero band contrast

- **Branch:** `feat/3.38-card-name-hero-band-contrast` (from `main` 97e3ede)
- **Commit:** one commit `fix(card,hero): card word breaks, hero text contrast on every band (request 058)` (amended; gates on tree `908f923`)

## Files changed

| File | Change |
|---|---|
| `card/card.component.html` | 7 `&ngsp;` separators (design §3). S1 ends each of the 3 title branches (after its `@switch`), see Deviations 1 |
| `card/card.component.spec.ts` | AC-1 (plain, collapsible, link: exact text, no U+00A0, title text), AC-4, the 7 separators and their parents, title-less card, AC-2 axe pass + negative control |
| `card/card.collapsible.spec.ts`, `card/card.link.spec.ts` | 3 markup pins gain the one-space text nodes (stated reason 058 AC-1); each also asserts the markup without them is the old string, element for element |
| `card/card.stories.ts` | New *Clickable Named by Its Text* (design §8) |
| `hero/hero.component.scss` | `$hero-colors` H1 (§5.1, each literal with factor and ratio), `.hero__label` without opacity, `.hero__body` without colour; comments (ring min 4.58) |
| `hero/hero.component.ts` | Class JSDoc: 3.37 line reworded, 3.38 line (§2) |
| `hero/hero.contrast.spec.ts` (new) | AC-6/7: inks, 9 band stops, hue/sat/direction of the 5 changed bands, 9 default + 9 light values (floored = §5.1/§5.2), negative control (3.37 warning 2.01 / 1.93) |
| `hero/hero.slot-fill.spec.ts` | AC-15: body without colour, dimmed list `['.hero--light .hero__label']` (stated reason 058) |
| `hero/hero.heading-focus.spec.ts` | Ring min 4.23 → 4.58, white alone 2.26 → 4.58 (stated reason 058, design §4) |
| `button/button.styles.spec.ts`, `button/button.inverse-outline.spec.ts`, `character/character.contrast.spec.ts` | Values on the new bands (§5.3), each with the old values in a comment; Edu's band read from the hero CSS instead of the tokens |
| `hero/hero.stories.ts` | `statLabelStyle` without `opacity: 0.6`; meta 3.38 bullet; *Band Link*, *Focus Title*, *Stage Actions*, *Badges in the Body* descriptions (§8) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | `card.component.spec` „Regeln Neu 3 Fassung 1 Bearbeiten Kopf aus USM übernommen 1 Stand heute“ ×3 modes; temp old/new spec: 120 input combinations, DOM equal to main once the one-space nodes are removed (2 without title, 6 with, 7 with badge) |
| AC-2 | jsdom axe pass + control (violation without separators); Chromium `--axe=wcag21a` on the new story, 360/1280 L·D: 0 violations, visible text = `aria-label` for both cards (`tmp/058/shots-card-new.log`) |
| AC-3 | `--compare=058/baseline-card`: **140/140 identical** |
| AC-4 | Toggle/link name tests unchanged and green; badge slot keeps 0 child nodes |
| AC-5 | New story at 360: the DE title wraps and hyphenates beside the badge; *Link Cards German*, *Equal Footer German* and title-less cards identical in AC-3 |
| AC-6, AC-7 | `hero.contrast.spec`: default primary 4.60, secondary 4.61, neutral 7.55, success 4.69, info 6.17, warning 4.63, orange 4.62, purple 4.58, violet 8.86 (label = title = body); light body / label / title as §5.2 (min 5.36 / 4.68 / 10.57) — all as design |
| AC-8 | Badge spec unchanged (min 4.85); inverse-outline text 9.37, ring/keyline 4.58; ring spec 4.58 |
| AC-9 | `--compare=058/proto-hero` (H1 prototype): 126/138 identical; 12 differ by edge pixels only (Deviations 2) |
| AC-10 | Geometry of all 138 hero shots identical to `baseline-hero.log` (`tmp/058/geo-{baseline,build}.txt`, diff empty); CSS only |
| AC-11 | FC `--compare=058/proto-hero-fc`: 60/72 identical, 12 differ by Δ ≤ 2 (Deviations 2); axe on the 18 hero stories: 0 violations (Gates) |
| AC-12 | Changelog draft below |

## Gates

All gates ran on the tree of commit `908f923` (skip a gate while `git diff --quiet 908f923 -- libs tools` holds; the amend adds only `requests/`). Logs in `tmp/058/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 299 suites, 6273 passed, 8 skipped (was 298 / 6230: +1 suite, +43 tests) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 160 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | green, 122 entries built |
| `npm run test:tools` | tools unchanged |
| `npx nx run angular-ui-kit:build-storybook` | green |
| Story screenshots | `tmp/story-shots/058/build-card` (140), `build-card-new` (4), `build-hero` (138), `build-hero-fc` (72), `build-hero-axe` (72) |
| Story axe | hero 18 stories × 360/1280 × L·D: 72 shots, 0 violations (`color-contrast` incomplete on the gradients, values in AC-6); new card story 4 shots, 0 |
| `check-angular-majors.mjs --only=22` | green, 110 checks ok (as 3.37) |

## Deviations from the design

1. **S1 position:** after the `@if` chain Angular drops a whitespace-only text while it looks for `@else` (`findConnectedBlocks`), so S1 ends each of the three branches, after its `@switch`. The DOM is the one of §3 (title, space, badge slot).
2. **Hash vs prototype (AC-9, AC-11):** deterministic (rerun identical), geometry identical, only anti-aliasing pixels: *Badges in the Body* 6 shots at the `sm` badge edges (≤ 15 px per badge, Δ ≤ 7 at 1024/1280, ≤ 69 at 360); *Focus Title* 1024/1280 dark 1 px (Δ 11); *Stage Actions* 1024/1280 ≈ 56 px (Δ 1); forced colours 12 shots Δ ≤ 2. Designer: please confirm in review.
3. **Spec values** use each spec's own rounding (design §9): button.styles 9.32 / 8.72 / 8.14, fill 3.80 / 3.55 / 3.32, ring 3.80; inverse-outline 6.96 / 9.37, 3.80 / 4.58; Edu 6.97 / 3.68 / 3.14 / 2.43 (no 8-bit rounding). Design §5.3 quotes them floored.
4. *Clickable Named by Its Text* card 2: `<p style="margin: 0;">` (the browser margin of `<p>` otherwise).
5. Not changed (outside §8): button stories and `button.component.scss` comments still quote the 3.36 values under the old body opacity (4.66, 3.56, 3.62 …); they stay true as lower bounds.

## Changelog draft

### Fixed

- **`lc-card` with a `title`: word breaks** (3.37 Known, 057-s1, regeln row 1, WCAG 2.5.3): the text reads „Regeln 3 aus USM übernommen 1 im Modul gepflegt 2“ (was „Regeln3aus USM …“) in `textContent`, accessible names and copied text; one space separates title, badge, subtitle, header action, `[card-header]`, body and footer. A clickable card with a `title` whose `ariaLabel` is its visible text passes axe `label-content-name-mismatch` (Chromium, 360 and 1280 px, light and dark). Nothing visible changes (140 card shots identical); toggle and link names are as before.
- **`lc-hero` text contrast** (3.37 Known, 057-s2, monatsstand row 1, WCAG 1.4.3): label, title and body are white at full strength on every default band (were 80 % and 85 %), and five bands are darker at their light end: primary `#1f8092` (was primary-500), secondary `secondary-600` (was 500), accent-orange `#b06024`; success (`#46543b → #697957`) and warning (`#68481d → warning-dark`) at both ends, so these two look visibly darker. Minimum over each band: primary 4.60, secondary 4.61, success 4.69, warning 4.63, orange 4.62, purple 4.58:1 (body before 3.63, 2.69, 2.38, 2.01, 2.60, 3.82; title on success and warning 2.72 and 2.25). Neutral, info, purple and violet bands and the `light` variant (≥ 4.68) are unchanged. White content on a band gains too: the `inverse` pill stands out at 4.58:1 or more (was 2.25), `inverse-outline` text 9.36, the title's focus ring 4.58 (was 4.23). Sizes and positions are unchanged.

### Compatibility

- No API breaks. Defaults render as 3.37.0 apart from the fixes: one-space text nodes in `lc-card`'s DOM (no visual change), the colours of five hero bands and full-strength label and body text on default bands.
