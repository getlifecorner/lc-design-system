# Review 005: Edu's character poses as kit assets (G-4)

## Round 1 — 2026-10-19, commit acf0e7c (gates on 34f188f; `git diff 34f188f HEAD -- libs tools` is empty)

Screenshots: the developer's `tmp/story-shots/005/` (21 Character stories at 360 · 1280, 2 Horizon at 360 · 1024 · 1280 · 1920, light · dark). Mine: `r1/` (on-dark-surface at 360 · 1024 · 1280, both themes), `r1-proto*/` (placement prototypes), `r1-horizon/`. I opened 9 shots: all-poses 360 light and dark, on-dark-surface 1280 light and 360 dark, with-figure 360 light and 1280 dark, figure-and-footer 360 dark, sizes 360 light, and prototype 3 at 1280.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | build.md: `character.assets.spec` (29); 28 files, the largest 1737 B |
| AC-2 | pass | build.md: the 4 drawn dark files are reproduced byte for byte; sha256 of the 18 copied files listed. All-poses shot: the dark drawings follow the rule (points `#0a121b`, cheeks, accent lines and dots) |
| AC-3 | pass | build.md: compat 22 copies the files and resolves them through `exports`; the docs table has the 5 forms |
| AC-4 | pass | build.md: the strings equal the files; plain-Node `import()` works; the FESM has 0 imports |
| AC-5 | pass | build.md: the header, logo and empty-state FESMs have 0 hits for `character`; the header-only bundle grows by 0 B |
| AC-6 | pass | `character.component.ts` host bindings as in §6; build.md: axe 0 violations on 5 stories |
| AC-7 | pass | build.md `--sizes` `[[48,48]…[128,128]]`; sizes shot 360: 5 squares, bottoms aligned |
| AC-8 | pass | build.md `--responsive-size` 64 / 96 / 128 |
| AC-9 | pass | build.md (light, dark, system, `''`); the all-poses shots show light and dark |
| AC-10 | pass | measured on `--on-dark-surface` at 360, 1024 and 1280, both themes: one `<img>`, `hello-dark.svg` |
| AC-11 | **fail (story)** | the spec values are right (6.21 · 5.91 · 9.14 · 9.95 · 9.13; the band 6.97 → 2.31). But the story places Hallo at t 0.815 / 0.848 (2.80 / 2.71:1) at 1024 / 1280, past its own rule t ≤ 0.75 (finding 1) |
| AC-12 | pass | build.md: no motion; the forced-colors rule is in the compiled CSS (`character.component.scss`, `_horizon.scss`) |
| AC-13 | pass | the template has no `innerHTML`; build.md: no policy under a fake `trustedTypes` |
| AC-14 | pass | build.md: compat 22, 3 new `EXPECT_IN_HTML` entries |
| AC-15 | pass | `r1-horizon` at 360 / 1024 / 1280 / 1920: gap 16 / 24 / 23.99 / 23.99; size 64 / 96 / 96 / 128; feet 0; height 192 / 204 / 232 / 372 (= §3) |
| AC-16 | pass | build.md: `pointer-events: none`, tab stops = the 2 links. figure-and-footer shot 360 dark: links clear of the figure |
| AC-17 | pass | `--list=character` 21, `--list=design-tokens-horizon` 5 (= §8); argTypes have `description` and `defaultValue` |
| AC-18 | pass | no text node; `ariaLabel` JSDoc and the docs say it is the consumer's text |
| AC-19 | pass | build.md: at 96 px, `scrollWidth` 360 and left edge 89.2; `r1-horizon` `scrollWidth` = viewport at every width |
| AC-20 | pass | `diff -rq baseline after`: 96 of 96 PNGs identical |
| AC-21 | pass | build.md: manifest, both READMEs, changelog draft |

**API against §2:** the names, types, defaults and JSDoc of `pose`, `size` (with the `Number` transform), `colorMode`, `ariaLabel`, `LC_CHARACTER_BASE_PATH`, `CharacterSize`, `CharacterColorMode` and the type-only `CharacterPose` re-export all match. The 4 argTypes have descriptions and defaults.

**Decisions asked for:**

- **Placement at 1280:** the top-right corner of the card can't meet the rule on a compact band. The top-right corner of a band sits at t = w / (w + h), which is 0.88 at 1280 × 168. I prototyped two alternatives:
  - The website geometry (`size="md"`, `contentWidth="lg"`, 84 px room, 96 px figure) gives a centre t of 0.714 / 0.794 / 0.749. With a taller text it gives 0.758 / 0.765 / 0.729, because the media column centres vertically.
  - The card's **top-left corner** (`left: 16px`, nothing else changed) gives a centre t of 0.351 / 0.587 / 0.660, which is 4.72 / 3.60 / 3.32:1. Even the box's far corner gives 4.18 / 3.39 / 3.16:1.

  Decision: the left corner. The website's top-right placement is still valid on its own band (1280 × 532, t 0.63), and it remains the requester's call. I updated design.md §5 and §8 (change note).
- **Card in the dark theme:** `--color-surface` is correct. It is white in light and `#101c26` in dark, which is the website's next-step card (website-v0 colours table). My "white card" in §8 was wrong; design.md is corrected. The text uses the standard `--color-text-primary` on `--color-surface` pair.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix | `character.stories.ts` OnDarkSurface, 1024 and 1280, both themes | Hallo on the card's **top-left** corner: `left: 16px` instead of `right: 16px`, with the same 24 px room and top. The figure's x is card x + 16: 36 / 624 / 880 at 360 / 1024 / 1280. Box centre t 0.351 / 0.587 / 0.660 (4.72 / 3.60 / 3.32:1). Update the story description to match ("top-left corner"; t ≤ 0.75 at every width) | `right: 16px`: x 260 / 896 / 1152; t 0.718 / 0.815 / 0.848 (3.12 / 2.80 / 2.71:1) |
| 2 | should-fix | docs page "On the hero band" (`character.stories.ts`) and the changelog draft | "Keep the box's centre where t = (x + y) / (width + height) ≤ 0.75. A band's top-right corner is at t = w / (w + h) (0.88 for 1280 × 168), so on a short, wide band stand him left of the right end." The card-corner recipe should name `left: 16px` as the alternative to `right: 16px` | "Keep the figure where … t ≤ 0.75" doesn't say which point of the figure, or that the right end of a short band is past 0.75 |
| 3 | nit | all-poses at 360 | — | Captions wrap to 2–3 lines ("welcomes-member · Begrüßt ein Mitglied"). Acceptable for a catalogue; no change needed |

**Verdict:** changes requested (finding 1; fix 2 in the same round). After the fix, re-shoot `components-character--on-dark-surface` at 360 / 1024 / 1280 with the measure from finding 1. No other story needs a new shot.

## Round 2 — 2026-10-19, commit 3c993d8 (story fix in b32be26; `git diff --quiet b32be26 -- libs tools` holds)

Screenshots: mine in `r2/` (on-dark-surface at 360 · 1024 · 1280, both themes, with the measure below; the Storybook build was current). I opened 2 shots: 1280 light and 360 dark. No other story changed (b32be26 touches only `OnDarkSurface` and the docs text in `character.stories.ts`), so AC-20 from round 1 stands.

| AC | Result | Evidence |
|---|---|---|
| AC-10 | pass | all 6 shots: one visible `<img>` `/assets/character/hello-dark.svg`, host `aria-hidden="true"` |
| AC-11 | pass | box centre t **0.351 / 0.587 / 0.660** → 4.72 / 3.60 / 3.32:1 at 360 / 1024 / 1280; the far corner t 0.456 / 0.641 / 0.704 → 4.18 / 3.39 / 3.16:1. Same in both themes; the band is `linear-gradient(135deg, rgb(13,53,61), rgb(32,132,151))` as in §5 |
| AC-1 … 9, 12 … 21 | pass | unchanged since round 1 |

Placement (finding 1): figure x **36 / 624 / 880** = card x (20 / 608 / 864) + 16; feet on the card's top edge (0 px) at every width; `scrollWidth` = viewport. Card `--color-surface`: `rgb(255,255,255)` light, `rgb(16,28,38)` dark, text `rgb(17,24,39)` / `rgb(241,246,248)` (the standard text-primary on surface pair). The story description says "top-left corner … box centre t ≤ 0.75 at every width". Finding 1 is closed.

Docs (finding 2): the "On the hero band" paragraph names the box centre, gives t = w / (w + h) (0.88 at 1280 × 168) and says to stand him left of the right end on a short, wide band. The card-corner recipe names `left: 16px` as the alternative. The changelog draft in build.md says the same and adds the measured 0.35 / 0.59 / 0.66. Finding 2 is closed.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 3 | nit | all-poses at 360 | — | as in round 1, accepted |
| 4 | nit | `OnDarkSurface` at 360 (stacked hero) | Hallo's raised hand clear of the `hero__media` hairline (1 px `rgba(255,255,255,0.2)` at y 120.78), for example room 32 px instead of 24 px below 1024 (about 8 px clear) | the box top is at y 113.78, so the hand ring's outer edge (viewBox y 11.5 → 7.36 px) is at y 121.14, which touches the line by about 0.6 px. Story-only, no AC is affected, and from 1024 there is no line. Can wait for a later story pass |

**Verdict:** approved. No must-fix is open. Before the release, squash `b32be26`, `c96cd18` and `3c993d8` into `acf0e7c` (one `feat(character)` commit), then commit the request documents (`review.md` is still untracked).
