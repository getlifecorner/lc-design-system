# Review 060: area icons, area map, laptop frame, on-band chips

## Round 1 — 2026-11-12, commit ab58aa8 (libs/tools = c169242)

Screenshots: `tmp/story-shots/060/r1-{map,rest,320,focus,mid}/` (360 · 1024 · 1280 L/D; 320, 640, 768 extra), measure `tmp/story-shots/060/r1-measure.js`. Unchanged stories: `--compare` vs `baseline` 330/330 identical (dev run; hero *Focus Title* 1024 D flake identical on rerun).

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `icons.spec` + `icon.area-icons.spec`: 4 outline `ICON_*` (+ heart/gift solid), `currentColor`, no size |
| AC-2 | pass | *Area Icons* 20/24 px, 24 labelled, 0 placeholders, ink ≥ 6 L/D, axe 0. Generator re-run → release check (build.md Deviation 1) |
| AC-3 | pass | `isValidIconName` + inline index; the MCP has no icon list (test:tools 22 green) |
| AC-4 | pass | stories at 360/1024/1280 L/D: groups, wrapped centred chips, 5 lines, layer, divider (r1-map shots) |
| AC-5 | pass | unit spec (one named `ul role=list`, links `aria-hidden`, no `style`); axe 0 on 48 map shots; compat prerender check written, run on Node 24 at release |
| AC-6 | pass | line x vs chip centre, line top vs chip bottom, line end vs layer top: max \|Δ\| 0.01 (DE, EN, two instances, light hero; 320/360/640/768/1024/1280); lines pass only behind opaque chips (concept l. 87) |
| AC-7 | pass | *Without Lines* rects = *On Hero Band* (tops 0/120/308.19/411.19, layer 184+110.19); forced colours 0 of 5 lines |
| AC-8 | pass | layer white ≥ 6.91 on all 9 bands L/D (spec ≥ 6.40), light hero 13.63, off-band 16.12/16.60 |
| AC-9 | pass | *Two Instances* Δ 0.01 in both maps; `anchor-scope: all` |
| AC-10 | pass | 360 DE 320 × 581.19 (≤ 590), EN 551.19; 320: 280 × 631.48; 200 % at 320: 240 wide, 0 of 13 chips out of view/clipped |
| AC-11 | pass | one line 24/32/40; sm 2 lines 41.5, md 49.5; icon and × centred on line 1 (Δ 0); radius 12/16/20; 200 % at 320: 0 over (widest 288) |
| AC-12, 16, 19 | pass | baseline compare 330/330 identical |
| AC-13 | pass | emphasis band dark stop / white, default and primary/success opaque tints, quiet transparent + white 32 % border; L = D |
| AC-14 | pass | text: emphasis 8.10–17.74, default 6.87, primary 8.49, success 4.85, quiet ≥ 4.86 on bands, ≥ 11.21 light hero; quiet clickable border 5.08–6.44 (≥ 3); focus ring white 2 px + dark gap: ring/band 5.98–11.90, gap/ring 17.74; light hero ring 11.52–13.70 |
| AC-15 | pass | *Hooks On An Ancestor*: the wrapper's pair wins for every variant, off-band and in a hero (contrast of the story's values: finding 1) |
| AC-17 | pass | md 328 × 203 at 360 (screen 280 × 175), sm 320 × 197.5, lg 328 × 198.5; 1280 md 480 × 298, lg 640 × 393.5; notch 0 |
| AC-18 | pass | 0 overflow at 320/360; lid rim 4.83 L / 7.31 D, base rim 4.83 L / 7.31 D; forced colours rims CanvasText |
| AC-20 | pass | axe 0 on all new stories L/D; argTypes complete; nothing new focusable; forced-colors shots: lines hidden, layer border, rims visible; `lc-character` hides itself (its own rule) |
| AC-21 | pass | READMEs list Area Map; changelog draft in build.md |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix | `data-display-chip--hooks-on-an-ancestor`, hero row, dark, all widths | chip text ≥ 4.5:1 in both themes; story text says that theme tokens in an ancestor hook resolve in the page theme, not in the chip's in-hero light palette | default chip 4.01, quiet clickable 4.71, emphasis 4.85: `--color-info-subtle` resolves to dark `rgba(59,101,136,.2)` over the band with the dark-theme ink (light theme passes). Fix the story values (compute both themes), not the component |
| 2 | nit | `data-display-area-map--large-text`, 1024/1280 (hero, pre-existing) | the side column never exceeds the hero (e.g. `min(var(--lc-hero-media-width), 50%)`) or the hero stacks under text-only zoom | root 200 %: `--lc-hero-media-width: 34rem` = 1088 px > viewport; map 1088 × 886 clipped by the hero and over the title. Story is labelled phone-only; page zoom 200 % (1280 → 640 CSS px) holds: 544 wide, Δ 0.01, 0 over at 640/768 → backlog (hero) |
| 3 | nit | `…--large-text`, 320, root 200 % (hero title, pre-existing) | long title words hyphenate | "organisiert" cut at the hero edge (beyond 1.4.10: 320 px + 200 % text) → backlog (hero) |
| 4 | nit | `data-display-device-frame--laptop-hooks`, right frame | story says "the lid alone" at base height 0 | base still a 2 px strip (its 1 px borders, `rgb(55,65,81)`); hide the base or reword the story |

Release checks (not findings): compat on Node 24 (115 checks incl. the 2 new `EXPECT_IN_HTML`); `npm run generate:icon-names` leaves the generated files unchanged (Deviation 1). build.md open items (clickable chip `font: inherit`, 44 px chip premise) stay backlog.

**Verdict:** approved (1 should-fix → queue, 3 nits → backlog)
