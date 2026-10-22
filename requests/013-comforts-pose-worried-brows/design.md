# Design 013: Edu's "comforts" pose reads angry: worried brows

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-9
- **Target:** patch 3.11.3 (owner, 2026-10-23)

## 1. Approach

Extend (a redraw), no new pattern. Three `d` values in `src/assets/character/comforts-light.svg` change; the light file is the drawing's source, and `node scripts/generate-character-assets.mjs` then writes `comforts-dark.svg` (by the rule) and `character-svg.data.ts`. Nothing else in the file changes: tag order, the `#0c1722` group (stroke 1.8, round caps), `rotate(-8 50 45)`, arms, connection points, cheeks, eyes and pupils (39.8, looking down) stay byte for byte.

Chosen by prototype (blob-URL variants in the built Storybook, faces at 480 px plus 96 and 48 px, light and dark):

| Variant | Brows | Reading | Decision |
|---|---|---|---|
| 3.11.2 | straight, inner end 1.5 *lower* | annoyed/angry; the right brow drops 2.53 to the centre after the tilt | the fault |
| A | straight, inner end 3.0 higher | concerned, calm; keeps comforts' own straight-stroke style | **chosen** |
| B, F | bent (Q), inner end 2.8–3.8 higher | anxious, distressed (hook shape) | rejected |
| C | straight, 3.5 higher, shorter | nervous with the 2.0 mouth | rejected |
| E | tilt-compensated (L 2.2, R 4.0) | symmetric on screen, but the face no longer turns with the head | rejected |

Mouth sag (control below the ends): 0.8 reads flat and lopsided under the tilt, 1.4 reads as a smile, **1.2 reads soft** (chosen; spec assumption "not a smile").

The face stays symmetric in the head's frame; the −8° tilt makes the rendered left brow steeper than the right (§3), as a real tilted face does. Both stay clearly worried.

Also: the generator's header says the light files were "copied once, unchanged" from life-os `docs/brand/character/`. Add one line: `comforts-light.svg`'s brows and mouth were redrawn in the kit in 3.11.3 (G-42), so the kit file is now the source for that pose. life-os's brand copy is behind; the changelog entry says so (AC-9).

## 2. Public API

No change: no input, output, slot, CSS hook, type, export, selector or file name. The only changes are the drawing's paths:

| Element (inside `rotate(-8 50 45)`) | 3.11.2 `d` | 3.11.3 `d` |
|---|---|---|
| left brow | `M38 31 L45.5 32.5` | `M38 32.5 L45.5 29.5` |
| right brow | `M54.5 32.5 L62 31` | `M54.5 29.5 L62 32.5` |
| mouth | `M46 47.5 Q50 46.3 54 47.5` | `M46 47.5 Q50 48.7 54 47.5` |

The light file grows by 4 bytes (≈ 1.6 KB). The dark file gets the same three values; brows and mouth stay `#0c1722` under the rule (`KEPT`).

Default rendering unchanged: the other 26 files and their 26 strings are byte-identical, and `lc-character` renders the same `<img>` elements with the same `src`. `git diff --stat main -- libs/angular-ui-kit/src` lists exactly `comforts-light.svg`, `comforts-dark.svg`, `character-svg.data.ts`, the stories and the specs.

## 3. Anatomy and layout

No layout change: the box stays 100 × 100 viewBox units, sized 48–128 px. 1 unit = 0.96 px at 96 px (the 404) and 0.48 px at 48 px.

```
head frame (before the -8° tilt), viewBox units
 x:      38        45.5   50   54.5        62
 y 29.5            ●inner        inner●              brows: stroke 1.8, round caps
                 ╱                      ╲             rise 3.0 over 7.5 = 21.8°
 y 32.5   outer●                          ●outer
 y 33.4  ─ ─ ─ top of the eye whites (r 4.6 at x 42 / 58, cy 38) ─ ─ ─
 y 38            (  ● )                ( ●  )        pupils cy 39.8 (unchanged)
 y 47.5             46 ╲___________╱ 54               mouth: control (50, 48.7),
                                                      lowest point y 48.1 (sag 0.6)
```

| Element | Geometry | Clearance / rendered value |
|---|---|---|
| left brow | (38, 32.5) → (45.5, 29.5), 8.08 long | gap to the eye white 2.33 at the outer end (33.4 → 35.73), 4.62 at the inner end; after the tilt: inner end 4.01 higher, 29.8° |
| right brow | mirror at x 50 | after the tilt: inner end 1.93 higher, 13.8° (3.11.2: 2.53 *lower*, −19.3°) |
| mouth | (46, 47.5) Q (50, 48.7) (54, 47.5) | inside the head ellipse (max (x−50)²/22² + (y−38)²/20² = 0.29); rendered ends (46.39, 48.03) / (54.31, 46.92), as in 3.11.2 |
| at 96 px | stroke 1.73 px | brow rise 2.9 px (L 3.8, R 1.9 after the tilt) |
| at 48 px | stroke 0.86 px | brow rise 1.4 px; the expression reads, the detail is soft (checked in the prototype) |

The left brow lies on the white highlight (ellipse 43/29, 8 × 4.5) as in 3.11.2; its outer end sits on the highlight's edge (0.995). The right brow lies on the plain head, as before.

### 3.1 Brow audit (AC-4)

Brow = a `<path>` stroked `#0c1722` (own attribute or its group's) whose two end points both lie above y 34 (the eye whites' top is 33.4). Closed-eye arcs (y 37.5–38.5) and mouths (y ≥ 45) are not brows. Rise = outer y − inner y in the path's own (head) frame; inner = the end nearer x 50.

| Pose | Brows | Rise L / R (head frame) | Rendered rise L / R | Reading | Result |
|---|---|---|---|---|---|
| hello, happy, see-you | none (closed happy eyes at y 38) | — | — | happy | unchanged |
| shows-the-way, welcomes-member, in-his-corner, calm, connects, thinking | none | — | — | — | unchanged |
| resting (−5°), all-done | none (closed or winking eye) | — | — | — | unchanged |
| discovered | `M37 30 Q41 27.5 45 29.5`, mirror | +0.5 / +0.5, arched (control 2.0 above) | +0.5 / +0.5 | surprised | pass, unchanged |
| connection-paused (+4°) | `M37.5 30.5 Q41.5 29.2 45.5 30.5` / `M54.5 28.6 Q58.5 25.2 62.5 27.6` | 0 / −1.0, right arched (control 2.4 above both ends) | −0.56 / −0.44 | quizzical, one brow raised ("hm?"), not angry | pass by the arch clause, unchanged |
| **comforts** (−8°) 3.11.2 | straight | −1.5 / −1.5 | −0.44 / −2.53 | angry with the down-turned mouth | **fault** |
| **comforts** 3.11.3 | straight | +3.0 / +3.0 | +4.01 / +1.93 | worried, soft | fixed |

Rule (the spec's test): every brow has rise ≥ 0, **or** is a `Q` arch whose control point is at least 2 units above both ends (an arched brow reads raised whatever its chord). Only `comforts` changes.

## 4. States

A still drawing: no hover, focus, active, disabled, loading, empty or error state, no overflow. Unchanged around it: light and dark files picked by the root theme or `colorMode`; `loading="lazy"`; sizes 48–128 and `--lc-character-size`; the horizon figure (64/96/128). Stories that render `comforts` change on purpose: Comforts, All Poses, Horizon *With Figure*, App Shell *Figure On The Horizon*.

## 5. Theming

| Element | Light | Dark (rule) | Contrast (WCAG, computed in the browser) |
|---|---|---|---|
| brows, mouth on the head | `#0c1722` on `#1a6a79` | `#0c1722` on `#84c7d4` | 2.91 / 9.56 |
| left brow on the highlight | on rgb(58,127,140) (white 0.14) | on rgb(159,211,221) (white 0.22) | 3.95 / 11.09 |
| pupils on the eye white | `#0c1722` on `#ffffff` | same | 18.08 |

All unchanged from 3.11.2: same colours, and each brow lies on the same fill as before. The light 2.91 is the existing palette on a decorative graphic (palette out of scope). No new token.

## 6. Accessibility

Unchanged: decorative by default (`aria-hidden`, `alt=""`); with `ariaLabel`, `role="img"` and that name (DE consumer text "Edu tröstet" in the component spec). `forced-colors`: a decorative figure is hidden, box kept. Reduced motion: nothing moves. No keyboard or announcement surface. The spec's AC-8 says "inline SVG": `lc-character` renders two `<img>` (since 3.8); its prerendered HTML is unchanged. The inline route is `CHARACTER_SVG_COMFORTS`, covered by AC-3.

## 7. Texts

No built-in text. Story captions only (docs, not UI): `comforts · Tröstet`, `discovered · Hat etwas entdeckt`, `connection-paused · Verbindung pausiert` (from the stories' `DE` map).

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Comforts (code unchanged) | `components-character--comforts` | `pose: 'comforts'` | the new face at 64 and 96 px; differs from the baseline by design |
| **Brows** (new) | `components-character--brows` | none | the three poses that draw brows, each at 48 and 96 px, captioned; the AC-4 rule in the description |
| All Poses | `components-character--all-poses` | — | only the comforts cell differs |
| With Figure / Figure On The Horizon | `design-tokens-horizon--with-figure`, `layout-app-shell--figure-on-the-horizon` | — | only the figure differs |

*Brows*: `props: { poses: ['comforts', 'discovered', 'connection-paused'], de: DE, caption }`; outer `<div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--spacing-6)">`; per pose a `<figure>` styled like *All Poses* (column, centred, `gap: var(--spacing-2)`, no fixed width) holding a row `display: flex; align-items: flex-end; gap: var(--spacing-4)` with `<lc-character [pose]="pose" [size]="48" />` and `[size]="96"`, then `<figcaption [style]="caption">{{ pose }} · {{ de[pose] }}</figcaption>`. Description: "The three poses that draw brows, at 48 and 96 px. No pose frowns: brows never slope down toward the centre unless they arch. Tröstet (`comforts`) is worried, inner ends raised (3.11.3, G-42); Hat etwas entdeckt (`discovered`) raises both; Verbindung pausiert (`connection-paused`) arches one."

All other character stories stay identical by hash.

**Baselines (main d48b713, Storybook rebuilt 2026-10-23):**
- `tmp/story-shots/013/baseline/`: 24 stories (all 22 character stories, horizon *With Figure*, app-shell *Figure On The Horizon*), 360/1024/1280, light/dark, `--full`, 144 shots.
- `tmp/story-shots/013/old-comforts-48-96/`: the 3.11.2 face at 48 and 96 px (Comforts story, 360/1280, light/dark), made with the measure in §9 AC-6.

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| AC-1 | new spec block (e.g. `describe('Edu: brows (013)')` in `character.assets.spec.ts` or `character.brows.spec.ts`): parse the brows by §3.1 (DOMParser works, Jest runs jsdom; or the regex style of `darkTag`) | comforts: rise +3.0 both (≥ 1.5) |
| AC-2 | same block: the `#0c1722` path with end points below y 44 | control y 48.7 ≥ end y 47.5; all three points inside the head ellipse |
| AC-3 | re-run the generator; existing assets spec unchanged; `git diff --exit-code` after a second run | dark = rule(light), strings = files |
| AC-4 | same block over all 14 light files: brow poses = `['comforts', 'connection-paused', 'discovered']`, every brow passes the §3.1 rule; plus a fixture with the 3.11.2 comforts brows that must **fail** (proves the test catches the fault) | table §3.1 |
| AC-5 | existing assets spec | 28 files, 100 × 100, ≤ 30 KB, rule colours only |
| AC-6 | `--compare=tmp/story-shots/013/baseline` (only the 4 stories of §4 differ); new *Brows* at 360/1280 light/dark; Comforts with `--measure='(document.querySelector("lc-character").style.setProperty("--lc-character-size", "48px"), await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))), { sizes: [...document.querySelectorAll("lc-character")].map((e) => e.getBoundingClientRect().width) })'` → `r1-comforts-48-96/`, against `old-comforts-48-96/` | sizes [48, 96]; inner brow ends visibly up, mouth not down-turned, arms and tilt identical; contrast §5 unchanged (only `d` values differ in the file diff) |
| AC-7 | component spec unchanged; `git diff -U0 main -- …/comforts-light.svg` | exactly the 3 `d` values of §2; 18 unchanged character stories identical by hash |
| AC-8 | component spec unchanged; compat `EXPECT_IN_HTML` uses `hello`, so nothing to change | same `<img>` output |
| AC-9 | CHANGELOG `### Fixed` under 3.11.3 | G-42, the website 404: comforts no longer frowns (inner brow ends raised 3 units, soft mouth; tilt, arm, palette, files unchanged); life-os can switch the 404 from `shows-the-way` back to `comforts` and update its brand copy `docs/brand/character/comforts-light.svg`; no API change |

Risks: editing the dark file or the data file by hand (the generator overwrites both, and the spec fails on drift); touching any other byte of the light file (AC-7 diff check).
