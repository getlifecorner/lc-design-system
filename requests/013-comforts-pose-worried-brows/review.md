# Review 013: Edu's "comforts" pose reads angry: worried brows

## Round 1 — 2026-10-23, commit 50acbb5

Screenshots: `tmp/story-shots/013/r1/` (developer, `--full`, 360 · 1024 · 1280, light · dark, `--compare=baseline`), `r1-comforts-48-96/` vs `old-comforts-48-96/`, and mine in `r1-review/brows/` (Brows, 6 shots, measured) and `r1-review/sheet/` (3.11.2 vs 3.11.3 face, light and dark: native 96 and 48 px plus the head rasterised at native size and magnified ×5 / ×10 with nearest-neighbour). Storybook build current (story-shots accepted it); working tree = `fix/3.11.3-comforts-worried-brows` for `libs tools scripts`.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `git diff -U0 main` on `comforts-light.svg`: exactly `M38 32.5 L45.5 29.5` / `M54.5 29.5 L62 32.5`; rise +3.0 both (≥ 1.5); `character.brows.spec.ts` asserts it. Rendered after the −8° tilt (computed): L +4.015, R +1.927 units (3.11.2: −0.44 / −2.53) |
| AC-2 | pass | mouth `M46 47.5 Q50 48.7 54 47.5`: control 48.7 ≥ 47.5, sag 0.6; all points inside the head ellipse (spec) |
| AC-3 | pass (deviation accepted) | see Finding 1. Served files in the built Storybook: light and dark both 1312 bytes, both contain the 3 new values and none of the old (`--measure` fetch, every width and theme) |
| AC-4 | pass | design §3.1 table; brows spec: brow poses = comforts, connection-paused, discovered; rule holds over all 28 files; the 3.11.2 fixture fails as it should |
| AC-5 | pass | `character.assets.spec.ts` unchanged (not in `git diff --stat main`) and green: 165 suites, 4137 passed (`tmp/013/test.log`) |
| AC-6 | pass | sheet: 3.11.2 = right brow slopes to the centre, frown mouth (annoyed); 3.11.3 = both inner ends up, soft mouth, reads concerned/worried at 96 px in both themes; at 48 px the brows are 1–2 px marks, no longer angry (design §3 accepted "soft detail"). Arms, tilt, eyes identical (only `d` values in the diff). Comforts 48/96: sizes [48, 96], all 4 shots differ from `old-comforts-48-96`. Contrast measured: `#0c1722` on the head 2.91 / 9.56, on the highlight 3.96 / 11.05 (8-bit composite; design 3.95 / 11.09 from unrounded fills), pupils 18.08: colours and fills unchanged |
| AC-7 | pass | `git diff --stat main`: 2 SVGs, data file (2 lines), brows spec, stories, generator header; component code and specs unchanged; `diff -rq baseline r1`: 120 identical, 24 differ = exactly Comforts, All Poses, Horizon *With Figure*, App Shell *Figure On The Horizon* (design §4), 6 new = Brows; the 18 other character stories identical |
| AC-8 | pass | markup unchanged: Brows measure shows `<img>` with `src` `comforts-{light,dark}.svg` per theme, loaded; component spec unchanged; compat uses `hello` (design §9) |
| AC-9 | pass (draft) | build.md changelog draft: G-42, website 404, what changed, Migration "switch the 404 back to `comforts`", brand copy note, no API change. One figure to correct (Finding 2) |

Brows story (`components-character--brows`), as designed (§8): at 1024/1280 one row, figures 160 / 182.1 / 234.8 wide, gap 24, images 48 and 96 bottom-aligned, gap 16; at 360 the three figures wrap to one per row, `scrollWidth` 360 (no overflow); captions 12 px, EN id · DE name; theme-correct files at every width. Horizon 360 light and App Shell 1280 dark: same figure box, only the face changed, reads worried on the horizon.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | — (deviation confirmed) | build.md, generator not run | the generator reproduces both files (AC-3) | Accepted. `toDark()` rewrites only `fill`/`stroke`/`opacity` per tag and leaves everything else byte for byte; `d` is a plain attribute, so rule(new light) = 3.11.2 dark (generator output, spec-verified) with the same 3 substitutions = the committed dark file. `quote()` escapes only `\`, `'`, newline, none in the new values, so the 2 changed data lines are exactly quote(file). The rest of `character-svg.data.ts` is untouched. The independent rule in `character.assets.spec.ts` confirms it byte for byte. No re-run needed |
| 2 | should-fix (changelog) | build.md changelog draft, 1st Fixed bullet | "3.9 / 1.8 px at 96 px" (4.015 × 0.96 = 3.854; 1.927 × 0.96 = 1.850 → 1.8) | "3.8 / 1.9 px at 96 px" (copied from design §3, my rounding slip; design.md corrected with a change note) |
| 3 | nit | design §2 | file ≈ 1.3 KB | design said ≈ 1.6 KB (developer flagged it); corrected in design.md |

**Verdict:** approved. Release-manager: apply Finding 2 when writing the 3.11.3 changelog.
