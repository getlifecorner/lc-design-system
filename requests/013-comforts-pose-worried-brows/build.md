# Build 013: Edu's "comforts" pose reads angry: worried brows

- **Branch:** `fix/3.11.3-comforts-worried-brows` (from `main` `d48b713`, 3.11.2)
- **Commit:** branch tip, `fix(character): worried brows and a soft mouth for the comforts pose`

## Files changed

| File | Change |
|---|---|
| `src/assets/character/comforts-light.svg` | the three `d` values of design §2 (brows, mouth); +4 bytes, 1308 → 1312 |
| `src/assets/character/comforts-dark.svg` | the same three values (dark rule: `#0c1722` kept) |
| `src/lib/character-svg/character-svg.data.ts` | `CHARACTER_SVG_COMFORTS.light/.dark`: the same three values |
| `scripts/generate-character-assets.mjs` | header: comforts-light.svg redrawn in the kit in 3.11.3 (G-42), the kit file is the source |
| `src/lib/character/character.brows.spec.ts` | new, 19 tests (§3.1 rule, AC-1/2/4/7, 3.11.2 fixture) |
| `src/lib/character/character.stories.ts` | new story *Brows* (design §8) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | `character.brows.spec.ts`: comforts brows, inner x 45.5 / 54.5, rise +3 both (≥ 1.5) |
| AC-2 | same spec: one mouth stroke, control (50, 48.7) ≥ end y 47.5; ends and control inside the head ellipse |
| AC-3 | `character.assets.spec.ts` unchanged and green: dark comforts = rule(light), `CHARACTER_SVG.comforts` = `CHARACTER_SVG_COMFORTS` = files (see Deviations) |
| AC-4 | brows spec: brow poses = `comforts`, `connection-paused`, `discovered` (2 each, absolute commands); rule holds over all 28 files; fixture = 3.11.2 comforts fails (rise −1.5 / −1.5, mouth control 46.3 < 47.5) |
| AC-5 | assets spec unchanged: 28 files, 100 × 100, safe, ≤ 30 KB, rule colours only |
| AC-6 | `--measure` of design §9 on Comforts (360/1280, light/dark) → `tmp/story-shots/013/r1-comforts-48-96/`, sizes [48, 96], all 4 differ from `old-comforts-48-96/`: inner ends up, mouth not down-turned, arms and tilt identical; new *Brows* at 360/1024/1280 light/dark; contrast: colours and fills unchanged (only `d` values in the diff), design §5 values hold |
| AC-7 | `git diff -U0 main` on the light file: exactly the 3 values; brows spec: the 3 values put back give the 3.11.2 blob `13e0531f…` (`git rev-parse v3.11.2:…`); other 26 files untouched (`git diff --stat main -- libs/angular-ui-kit/src`: the 3 asset/data files + stories); component specs unchanged |
| AC-8 | component specs unchanged and green; markup unchanged (`<img>` with the same `src`); compat uses `hello`, nothing to extend |
| AC-9 | changelog draft below |

## Gates

Ran on the working tree committed as the branch tip; later agents skip a gate while `git diff --quiet fix/3.11.3-comforts-worried-brows -- libs tools` holds. Logs in `tmp/013/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 165 suites, 4137 passed, 8 skipped (baseline 164 / 4118 + the 19 brow tests); first run hit the known worker SIGSEGV (`list.row-actions`), rerun green |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (= baseline) |
| `npx nx run angular-ui-kit:build` | green, 119 entries; `dist` has the new values in both SVGs and `character-svg.mjs` |
| `npm run test:tools` | 22 / 22 (tools unchanged; run for the new story) |
| `npx nx run angular-ui-kit:build-storybook` | green |
| Story screenshots | `tmp/story-shots/013/r1/` (`--full`, 360/1024/1280, light/dark, `--compare=…/baseline`): 120 identical, 24 different = exactly Comforts, All Poses, Horizon *With Figure*, App Shell *Figure On The Horizon* (design §4), 6 new = *Brows*; the 18 other character stories identical. Opened: Brows 360 light, 1280 dark; Comforts 1280 light new vs old |
| `node tools/compat/check-angular-majors.mjs` | not run: server markup unchanged (same `<img>`, same `src`) |

## Deviations from the design

- **Generator not run** (design §1, AC-3 "re-run"): `node scripts/generate-character-assets.mjs` needs approval in this headless run. Its output is a pure function of the light files (dark = rule, strings = files, `quote()` escapes only `\`, `'`, newline, none in the new values), so the same three substitutions were applied to the dark file and both strings. `character.assets.spec.ts` (unchanged) proves dark = rule(light) and strings = files byte for byte. To double-check: `node scripts/generate-character-assets.mjs && git diff --exit-code` must print nothing.
- Size note: design §2 says "≈ 1.6 KB"; the file is 1312 bytes (1.3 KB). The +4 bytes are as designed.

## Changelog draft

```markdown
## [3.11.3] - 2026-10-23

Edu's "comforts" pose looks worried instead of angry (G-42; life-os website v0, the 404). No API breaks.

### Fixed

- **`lc-character pose="comforts"` (Tröstet) is worried, no longer angry** (G-42): the inner ends of both brows now sit 3 units above the outer ends (in 3.11.2 they sat 1.5 units below, so the brows sloped down toward the centre and, with the down-turned mouth, Edu frowned on the website 404). The mouth is a soft curve that dips 0.6 units (it rose 0.6 before). After the −8° head tilt the inner ends sit 4.0 (left) and 1.9 (right) units above the outer ends, 3.8 / 1.9 px at 96 px. The tilt, the reaching arm, the eyes, the colours and the box are unchanged; the dark drawing follows the rule, and `CHARACTER_SVG.comforts` / `CHARACTER_SVG_COMFORTS` carry the new drawing. Contrast is unchanged (brows and mouth `#0c1722` on the head: 2.91 light, 9.56 dark).
- **No pose frowns** (G-42): all 14 poses were checked. Only `comforts`, `discovered` (both brows raised) and `connection-paused` (one brow arched, "hm?") draw brows, and only `comforts` broke the rule; a test now checks every drawing, light and dark.

### Compatibility

- No API breaks: same inputs, exports, selector and file names. Only the three paths of `comforts-light.svg` / `comforts-dark.svg` changed (+4 bytes each); the other 26 drawings and their strings are byte-identical to 3.11.2. Of 144 character, horizon and app-shell screenshots (360 / 1024 / 1280, light and dark), only the 24 that show `comforts` differ from 3.11.2.
- The file names are unchanged: if you serve `assets/character/comforts-*.svg` with a long cache lifetime, the old drawing can show until the cache revalidates.

### Migration

- life-os website: switch the 404 figure back from `shows-the-way` to `comforts` and drop the `G-42` label. Update the brand copy `docs/brand/character/comforts-light.svg` from the kit: the kit file is now the source for this pose.
```
