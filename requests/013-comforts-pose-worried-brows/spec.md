# Spec 013: Edu's "comforts" pose reads angry: worried brows

- **Status:** ready
- **Type:** bug fix (drawing of one pose, plus a brow audit of the other poses)
- **Affected:** `src/assets/character/comforts-{light,dark}.svg`, the inline strings in `src/lib/character-svg/character-svg.data.ts` (`CHARACTER_SVG_COMFORTS`, `CHARACTER_SVG.comforts`), `scripts/generate-character-assets.mjs`, specs `character.assets.spec.ts` / `character.component.spec.ts`, stories `character.stories.ts`, CHANGELOG. Other poses' files only if the audit (AC-4) finds the same fault.
- **Semver impact:** patch. Same pose name, file names, inputs and exports; only drawing paths change (owner decision 2026-10-23, release after 3.11.2).

## Need

life-os website 404 (concept `website-v0.md` §6.2.2 line 473, gap G-42): Edu is meant to be "Tröstet" (head tilted, worried brows, one arm reaching out) at 96 px. The kit's `comforts` drawing frowns, which breaks the brand core "Edu is never menacing". The website shows `shows-the-way` on the 404 until this ships (owner, 2026-10-23).

Cause in `comforts-light.svg` (read, not guessed), inside `rotate(-8 50 45)`:

| Part | Path today | Reads as |
|---|---|---|
| left brow | `M38 31 L45.5 32.5` | inner end (x 45.5) lower than outer (y 32.5 vs 31): slopes down to the centre = angry |
| right brow | `M54.5 32.5 L62 31` | same, mirrored |
| mouth | `M46 47.5 Q50 46.3 54 47.5` | control point above the ends: down-turned |

## What the kit has today

`lc-character` with `pose="comforts"`, and the strings in `character-svg`. No input changes the expression, and none should: it is a drawing fault. Nothing in the kit solves it for the consumer. For reference, `discovered` brows are `M37 30 Q41 27.5 45 29.5` (raised arcs, inner end lower than the arch but not a frown).

## Scope

- In: redraw the brows of `comforts` so the inner ends are higher than the outer ends (worried); soft, neutral-to-slightly-up mouth (not down-turned); keep head tilt (-8°), reaching arm, palette, 100 × 100 viewBox and stroke widths. Dark file stays the light file with the dark rule applied. Audit of all 14 poses' brows against the same rule.
- Not in: new poses, new inputs, renamed files, palette or rule changes, other expressions (eyes, cheeks), changes to other poses beyond a proven brow fault.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | In `comforts-light.svg` both brow paths have the inner end (x nearest 50) at a smaller y than the outer end by at least 1.5 units; today it is the opposite. | unit test on the file (parse the two brow paths) |
| AC-2 | The mouth path's control point is not above its end points' y (no down-turned curve); it stays inside the face ellipse. | unit test |
| AC-3 | `comforts-dark.svg` equals the dark rule applied to the new light file, byte for byte; `CHARACTER_SVG.comforts.light/.dark` and `CHARACTER_SVG_COMFORTS` equal the files; the generator script reproduces both files. | existing `character.assets.spec.ts` (unchanged assertions) |
| AC-4 | Audit: every pose that draws brows (at least `discovered`, `connection-paused`, `comforts`; the designer lists the rest) is checked against: brows must not slope down toward the centre unless a pose's meaning needs it, and none may read angry. Result is a table in `design.md`; poses found faulty are fixed, others stay byte-identical. | table in `design.md`, plus a spec asserting the brow rule over all light files |
| AC-5 | Existing guards hold: 28 files, each 100 × 100, safe, at most 30 KB; no new colours beyond the dark palette list; no `<script>`/external refs. | `character.assets.spec.ts` |
| AC-6 | Visual: story `comforts` at 96 px (the 404 size) and at 48 px, 360 and 1280 wide, light and dark, reads worried, not angry; tilt and reaching arm unchanged. Compared against the old render with a brief note. Contrast of brows and eyes against the head fill is unchanged (`#0c1722` on `#1a6a79` light; dark per rule). | story screenshots at 360/1280, light/dark; `--measure` or a computed ratio |
| AC-7 | Unchanged defaults: no input, output, selector, export or file name changes; other poses' output is byte-identical except those fixed under AC-4. | existing component spec; `git diff --stat` on assets |
| AC-8 | Prerendered HTML: `<lc-character pose="comforts">` still renders its inline SVG before JavaScript; `alt`/aria label text unchanged (EN and DE locale strings unaffected). | existing component spec / compat `EXPECT_IN_HTML` if the pose is used there |
| AC-9 | CHANGELOG entry under Fixed for consumers: gap G-42, the website 404, what changed, and that life-os can switch the 404 back from `shows-the-way` to `comforts`. | CHANGELOG diff |

Not applicable: keyboard and screen reader (decorative drawing, labels unchanged), EN/DE text length (no text).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Same file names and API (owner, 2026-10-23); kit first, release as a patch after 3.11.2.
- Edit the drawing by the generator script where it is the source, so assets, data file and spec stay in step.

## Assumptions

- Assumption: only `comforts` is reported; the audit (AC-4) is a check, and a fix elsewhere is made only on a clear angry reading.
- Assumption: the exact curve values are the designer's choice; AC-1 gives the minimum that makes the brows worried.
- Assumption: "soft mouth" means a gentle neutral or slight upward curve, not a smile (he is comforting).
- Assumption: the dark drawing is derived by the existing rule, not hand-drawn (the issue says "derived by the rule").

## Open questions

None.
