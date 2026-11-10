# Review 058: lc-card accessible name, lc-hero band contrast

## Round 1 — 2026-11-10, commit 2744e7c (gate tree 908f923, `git diff --quiet 908f923 -- libs tools` holds)

Screenshots: `tmp/story-shots/058/` — developer `build-*`, review `r1-card-new` (6), `r1-hero` (36, `--axe`, measure `r1-hero-measure.js`), `r1-inject-body` (18), `r1-repaint` (14; the run stalled at shot 15). Storybook build of 11:44 reused (not stale). 8 shots opened: card new 360 L, 1280 D; hero *All Colors* 360 L (build and baseline), *Badges in the Body* 360 L, *Stage Actions* 1280 D, *Focus Title* 1280 D, *Slim* 360 L.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | Card new story: `textContent` normalised = `aria-label` for both cards, at 360, 1024 and 1280, L·D. No U+00A0. `.card__title` text is exactly „Regeln“. Unit test per build.md |
| AC-2 | pass | `--axe=wcag21a` on *Clickable Named by Its Text*, 6 shots: 0 violations. The rule does run in this setup: the 3.37 control in `probe-card-axe-control.log` gives 1 `label-content-name-mismatch`. `role=button`, `tabindex=0`; `innerText` is contained in the label (true ×12) |
| AC-3 | pass | `diff -rq baseline-card build-card`: 140/140 byte-identical (with no gap, width or line change, the geometry is identical too) |
| AC-4 | pass | Name specs unchanged and green (build.md gates). The three markup pins changed with a stated reason, and the old string is still asserted without the separator nodes |
| AC-5 | pass | 360: the DE title wraps to 3 lines (232.77 px, `hyphens: auto`, „Kostenstellenverantwor-tung“), with the badge at x 273.77 (gap 8) and no overflow (scrollWidth 326 = clientWidth). The title-less and German card stories are in the 140 identical shots |
| AC-6 | pass | Measured on the live DOM (8-bit, t 0–1): body = label = title on default bands primary 4.60, secondary 4.61, neutral 7.55, success 4.69, info 6.17, warning 4.63, orange 4.62, purple 4.58, violet 8.86. Body colour `rgb(255,255,255)`, opacity 1. Light variant body 5.79 and label 5.00 (primary/L); the other light values are in `hero.contrast.spec` (design §5.2) |
| AC-7 | pass | Title 24/800 at 360 and 32/800 from 1024 (large text). *Slim*: 18/700 at 360 (small text), 4.60 ≥ 4.5; 24/700 from 1024 |
| AC-8 | pass | Badges at least 4.85 on all 10 heroes, L·D. `inverse` fill vs band ≥ 4.58, label 13.17. `inverse-outline` text ≥ 9.30 (8-bit composite, secondary band; see N-2). Ring two-tone ≥ 4.58. *Focus Title*: outline 2 px solid white + `0 0 0 2px rgb(17,24,39)` |
| AC-9 | pass | Stops on the build equal §5.1 (`0d353d>1f8092`, `2d3c46>5a798c`, `46543b>697957`, `68481d>9b6b2b`, `7a3a10>b06024`, the other four unchanged). Hue and direction are asserted in `hero.contrast.spec`. Compared with the H1 prototype: 126/138 identical, and the 12 that differ are accepted (Deviation 2 below). Look checked at 360: every band reads as its colour, dark to light |
| AC-10 | pass | Geometry (hero, label, title, body, media, footer) of the 138 build shots vs `baseline-hero.log`, paired and sorted: identical (`r1-geo-{baseline,build}-sorted.txt`). CSS only. Compat 22 green (build.md) |
| AC-11 | pass | FC: `diff -rq baseline-hero-fc build-hero-fc` shows 48 differ, exactly the 12 stories of design §9, and 24 identical. axe on 6 stories × 6 shots: 0 violations (developer: 18 stories, 0). Nothing animates |
| AC-12 | pass (draft) | build.md draft names the five bands, the before and after values, the text strength, and that success and warning look visibly darker. See N-2 for one value |

### Deviations (build.md)

| # | Decision | Why |
|---|---|---|
| 1 | accepted | The DOM is the one of §3: title, space, badge slot („Regeln 3 …“ measured). The 140 card shots are identical |
| 2 | accepted | The build is deterministic: `build-hero`, `r1-hero` (36/36), `r1-inject-body` and `r1-repaint` are byte-identical. Every differing pixel lies on the rounded ends of a pill inside the body (an `lc-badge`, or `lc-button` `inverse` or `inverse-outline`): ≤ 15 px per end, Δ ≤ 69 at 360 and ≤ 7 at 1024/1280, Δ ≤ 2 in FC. Badge, button and global styles are unchanged from main (`git diff` empty). An explicit body colour (`r1-inject-body`) and a forced band repaint (`r1-repaint`) both leave the build hash unchanged, so the difference comes from the prototype's injected render on the 3.37 build, not from a rule. The colours, contrast and geometry above all equal §5. **The build shots `058/build-hero*` replace `proto-hero*` as the reference** |
| 3 | accepted | Each spec keeps its own rounding. The values differ from §5.3 only in the second decimal |
| 4 | accepted | Story content only (`<p style="margin: 0">`) |
| 5 | accepted, nit N-1 | The old values are still lower bounds, but the consumer docs understate them (see N-1) |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| N-1 | nit (backlog) | `button.stories.ts` *Inverse* (l. 290) and *Inverse Outline* (l. 330), `button-link.stories.ts` l. 175–176 and 214, `button.component.scss` l. 217–250 | Values for the 3.38 bands at full opacity: `inverse` label 13.17 on the pill, fill and ring ≥ 4.58 on **all nine** bands; `inverse-outline` text ≥ 9.3, border and ring ≥ 4.58 | They quote 3.36 values "under the body's 85 % opacity" (3.62, 9.28, 4.66, 3.56). *Inverse* says the pill passes only on neutral, info, purple and violet |
| N-2 | nit | Changelog draft „`inverse-outline` text 9.36“, *Stage Actions* description „at least 9.36:1“ | „9.3:1 or more“ (the 8-bit composite on the build: secondary 9.30, purple 9.34) | 9.36 (float composite, design §5.3) |

**Verdict:** approved. No must-fix and no should-fix. N-1 goes to the backlog. N-2: the release-manager writes 9.3 in the changelog, and the story text goes to the backlog with N-1.
