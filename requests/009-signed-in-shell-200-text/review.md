# Review 009: Signed-in shell at 200 % text on a phone

## Round 1 — 2026-10-21, commit 77ea842 (libs/tools = 4bd7ca6)

Screenshots: `tmp/story-shots/009/r1` (32 unchanged stories against `baseline`, `--full`, 192 shots) · `r1-new` (8 new stories, 320 · 360 · 1024 · 1280, light · dark) · `r1-proto*` (prototypes for findings 1 and 2). 200 % means a root of 32 px; every measure also toggled `textSize` to 100 % and back.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | Header EN/DE at 320/360: the brand ∩ end group is 0 px². The title is 200/200 and 240/240 (sw/cw, one line). The subtitle shows 168 / 208 px with "…" (EN 240, DE 509 px of text). The wordmark is not covered (shots 320 DE, 360 EN) |
| AC-2 | pass | Signed in, the header is 177 px: row 1 is 81 (brand) and row 2 is 96 (avatar at x 192–288 / 232–328 = vw − 32). Signed out it is 151, with the "Deutsch" link at the end of row 2 (53–288 at 320). `docSW == vw` everywhere |
| AC-3 | pass, 2 exceptions accepted | r1 compare: 184/192 identical. FullFeatured and TranslatedLabels at 360 wrap to 108 px. The 3.10.0 baseline shot shows "LifeCorner" ending at the theme toggle (the AS-31 defect at 100 %). New stories at 100 %: 56 px, one row |
| AC-4 | pass | FloatingLargeText: the nav spans 16–304 / 16–344, list sw = cw 286 / 326, items 5 × 54 / 5 × 62, pill 54 / 56 |
| AC-5 | pass | ItemCountsLargeText, docked and floating, 3/4/5 items, at 320/360/1024/1280 and 100/200 %: every list has `sw == cw` and `docSW == vw` |
| AC-6 | pass (wording); see findings 1, 2 | 0 labels clipped and 0 label-box overlaps at 200 %. At 320 with 5 floating items, words break without a hyphen where a hyphenated syllable can't fit in 54 px ("Hau·shalt"). The AC allows that, and it is the limit at 24 px text |
| AC-7 | pass | Shell DE/EN at 320/360, scrolled to the end: the last block is 38.4 px (200 %) / 38.2 (100 %) above the bar. In Today, `main` is 101.5 / 214.5 above the bar. The inset is in both terms (code) |
| AC-8 | pass | `padding-bottom` = bar + 40: DE 220 (180), EN 188 (148), DE 100 % 124 (84), EN 100 % 112 (72). An inline `--lc-app-shell-bottom-clearance: 0px` gives 0, and removing it gives 220 again. Land: `calc(112px + max(0px, 180px - 72px))`. From 1024 the var is removed and the padding is 0 |
| AC-9 | pass | compat 22 (build.md, 3 new checks). In the code, the RO runs only in `afterNextRender`, with a `typeof ResizeObserver` guard and a CSS fallback of 72 → 112 |
| AC-10 | pass, exceptions accepted | All 6 bottom-nav stories are identical. Header: 16/18. Shell: 6/8; LazySideNavigation EN/DE at 360 gets +12 px of land under its 84 px bar, keeping the 22 px of land above the bar that a 72 px bar has |
| AC-11 | pass | No colour in the diff. Trigger ring 2 px, offset 2, at 228–332 × 77–181 (360), inside the viewport. Bar items at 200 % ≥ 54 × 108, avatar 96 × 96. Nothing new for forced-colors |
| AC-12 | pass | Template order: hamburger → brand → nav → spacer → `__end`; no role and no aria-hidden. Spec in build.md |
| AC-13 | pass | 8 stories. `textSize` switches the root between 16 and 32 px in the canvas only (`#storybook-root`), and the argType has a description and a default |
| AC-14 | pass | Gates in build.md. One existing assertion changes, with its reason (`break-word` → `anywhere`) |

### Deviations in build.md

| # | Decision | Why |
|---|---|---|
| 1 Header mechanism | accepted | Same wrap threshold. WithLongTitle and LogoSizes stay identical, and the title ink keeps ≥ 16 px from the end group. design.md change note 1 |
| 2 Eight baseline diffs | accepted | Intended. Verified in the shots (FullFeatured 360 baseline vs r1, LazySideNavigation 360 baseline vs r1). Change note 2 |
| 3 Bar cause refuted | accepted | My hypothesis was wrong: entries have `min-width: 0`. Change note 3 |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix | `.lc-bottom-nav__item`; FloatingLargeText, ItemCountsLargeText and the shell stories at 320/360, 200 % (and every bar with two-line labels at 100 %, e.g. LazySideNavigation 360) | All pills on one line: `justify-content: flex-start; padding-block: 6px 2px` (design §3, r1), so `pill.top − item.top` = 6 for every item | Centred content, so the pills zigzag: 52/36/36/36/4 (360 docked, 5 items), 36/36/4/20/4 (floating, 5 items). The prototype gives 6 everywhere, with unchanged item heights (108/140/172) and unchanged one-line items at 100 % |
| 2 | must-fix | `.lc-bottom-nav__label` `--_reach`, 200 % | Neighbouring labels have ≥ 4 px of ink between them: `clamp(-4px, 32px - 1.5rem, 8px)` (still 8 at 100 %) | The reach is 0 at 200 %, so "Heute" and "Haus-" are 1.2 px apart (360 docked, 5 items) and 1.4 px apart at 320 (floating, 4 items). In German that reads as one compound. Prototype: min 4.6 px; the 320 floating 4-item bar grows 150 → 182, and the life-os bar (5 floating DE) stays 182 |
| 3 | should-fix | Changelog draft (build.md) | Compatibility: the end items now sit in `div.lc-header__end`, so a child selector like `.lc-header > [slot='end']` (life-os `shell.component.css` l. 42) no longer matches. Fixed: say that the bar itself never widened the page; AS-31's +19/+59 px is page-wide overflow (T387, app side) | Neither point is there |
| 4 | nit | Header at 200 % (all signed-in stories) | Some room above the brand | Row 1 is the brand's own height (81), so the title's line box starts at y 0 (glyph top ≈ 6 px). Readable, nothing clipped; leave it for a later request |
| 5 | nit | `layout-app-shell--signed-in-large-text-english` | `parameters.docs.description` like its siblings | Only the JSDoc line "The same in English." |

For round 2 the bar must render as follows: in every bar, `pill.top − item.top` = 6; the smallest ink gap is ≥ 4 px at 200 %; item heights are unchanged except where the gutter adds a line. The baseline compare may show the 8 accepted diffs plus bars with mixed line counts at 100 %, and nothing else. Update the changelog's bar values.

**Verdict:** changes requested

## Round 2 — 2026-10-21, libs/tools = fd9d7fc (HEAD db301ab, `git diff --quiet fd9d7fc -- libs tools` holds)

Scope: only what r2 changed (`bottom-nav.component.{scss,spec.ts}`, changelog draft). No re-shoot: `r2` (compare against `baseline`, `tmp/009/r2-compare.log`), `r2-new` (8 stories, `tmp/009/r2-new-measure.log`). Opened 7 shots: ItemCounts 320, shell DE 360, shell EN 360, Today 320, FloatingLargeText 1280 dark (`r2-new`), LazySideNavigation DE 360 (`r2`), plus EN 360 and Today 320 from `r1-new` for comparison. ACs not listed are unchanged from r1 (header and shell code untouched).

| AC | Result | Evidence |
|---|---|---|
| AC-3, AC-10 | pass | r2 compare: 184 identical, the same 8 different. `cmp` r1 vs r2: the 4 header diffs are byte-identical; LazySideNavigation EN/DE 360 changed again, and the shot shows why: the pills of the 1-line and 2-line items now sit on one line. All 6 bottom-nav stories identical to 3.10.0 (one-line bars unchanged) |
| AC-4, AC-5 | pass | Every bar at 320/360/1024/1280: distinct `pill.top − item.top` = {6}, one item height per bar (108/140/172 at 360 and below, 76 from 1024), `of` 0, `docSW` 0 |
| AC-6 | pass, see nit 6 | 0 labels clipped. Smallest ink gap at 200 %: 4.6 (5 floating DE, 320), 5.1 (5 docked, 320), 6.3 (360), EN 4.9 / 7.1. The r1 cases: 360 docked 5 = 13.1 (was 1.2), 320 floating 4 = 11.8 (was 1.4; items 140 → 172, as prototyped). In the shots, every label column reads as its own word |
| AC-7, AC-8 | pass | Bar heights in the shell stories are unchanged (DE 172, EN 140 items), so clearance 220 / 188 holds; the shell code is untouched |
| AC-11 | pass | No colour change; items keep ≥ 54 × 108 at 200 % |
| AC-14 | pass | build.md r2: 157 suites, 3985 passed; lint 0 errors; build ok. The r1 reach assertion was replaced because finding 2 changed the value, and the new one pins the new clamp. Item alignment has a new test |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| r1-1 | resolved | `.lc-bottom-nav__item` | pills on one line | `flex-start` + `6px 2px`; off = 6 in every bar and story |
| r1-2 | resolved | `.lc-bottom-nav__label` | ink ≥ 4 px at 200 % | `clamp(-4px, 32px - 1.5rem, 8px)`; min 4.6 px |
| r1-3 | resolved, see 9 | changelog draft | end group + "bar never widened the page" | both there |
| r1-4, r1-5 | nit, open | header row 1, EN story docs | see round 1 | not part of r2 |
| 6 | nit (accepted) | 200 %, narrowest columns | AC-6: break only where a word can't fit | The 4 px gutter sometimes leaves a one-letter last line: "Hau·shal·t" (Today 320, floating 5 DE; r1 "Hau·shalt"), "Do-ku-ment·e" (ItemCounts 320, docked 5), "Hous·ehol·d" (EN 360; r1 "Hous·ehold"). Item heights are unchanged. This is the limit at 24 px text in a 50–58 px column, and the gutter is what keeps two German words from reading as one compound. No change |
| 7 | nit (kit-wide, later) | EN labels at 200 % | hyphenated breaks | Chromium doesn't hyphenate the capitalised English labels (German ones it does), so EN breaks without a hyphen ("Toda·y", "Setti·ngs"), as in r1 and 3.10.0. CSS can't fix this; a docs note could tell consumers to use soft hyphens (`Set­tings`) in long labels |
| 8 | nit (pre-existing) | LazySideNavigation DE 360, 100 % | ink gap ≥ 4 px | "Haushaltsübersich·t" and "Benachrichtigungs…" almost touch. The reach at 100 % is still 8 px, as in 3.10.0, and AC-6 covers 200 % only. Leave it for a later request |
| 9 | should-fix | changelog draft, Fixed, `lc-bottom-nav` | Compare with 3.10.0 only | The parenthesis "'Heute' and 'Haus-' were 1.2 px apart and read as one word" describes the unreleased r1 state. Keep "(they overlapped by 8 px)" and drop the rest |

**Verdict:** approved. No must-fix. Should-fix 9 (one phrase in the changelog) and nits r1-4, r1-5, 6, 7 and 8 go to the release-manager as open items.
