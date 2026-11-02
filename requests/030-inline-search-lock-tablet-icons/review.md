# Review 030: Inline magnifying-glass, lock and device-tablet icons; search-input and log-viewer register their glyph

## Round 1 — 2026-11-02, commit dfc5ed4 (gate tree 7b1537d)

Screenshots: `tmp/story-shots/030/r1/` (my run: the icon grid at 360 · 1024 · 1280, light · dark, `--full`) and the developer's `new/`, `new-log-measure/`, `forced/`, `changed/`, `after-1/`, `after-2/` (same Storybook build, 07:46; `libs tools` unchanged since 7b1537d). 10 shots opened.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | New spec (44 tests): `resolveInlineGlyph` for 11 names, `httpMock.match` = []. r1 measure: the `magnifying-glass` and `search` rows have the same path hash (2013045737), as do `lock-closed` and `lock` (902057641); 0 `rect`/`text` |
| AC-2 | pass | `icons.data.ts`: 13 constants after `ICON_SHIELD_LOCK_SOLID`, in D2 order, and no `ICON_ARROW_DOWN_SOLID`. `icons.spec`: 150, `slice(137)`, markup = `compact(Tabler)` |
| AC-3 | pass | `kit-icons.spec`. `new/form-search-input--app-registers-no-icons` at 360/1024/1280 L/D: magnifier `pp`, `d` = `M3 10a7 7 0 1 0 14 0…`, clear drawn, 0 placeholders |
| AC-4 | pass | `kit-icons.spec`. `new-log-measure`: 4 glyphs at rest; with search open and scrolled up, 6 (pause, trash, clipboard, search ×2, arrow-down); after pausing, `player-play` (`M7 4v16l13 -8l`); 0 placeholders, all 6 `aria-hidden`. Shots 360 L and 1280 D look right |
| AC-5 | pass | Spec, plus `components-icon--registered-with-placeholder-mode` L/D at 360/1280: 3 icons, 0 placeholders, `img:Gesperrt`, `img:Tablet`, 1 decorative; axe 0 violations |
| AC-6 | pass | `tmp/030/compat.log`: Angular 22 PASS, `ok search input: the magnifier prerendered, not the placeholder`. The regex requires `aria-hidden`, `width="24px"`, the Tabler `d`, and no `rect`/`text` |
| AC-7 | pass | r1 (360/1024/1280 L/D): every row has boxes 16/20/24/32/40 with the same artwork; solids `fill="currentColor"`. Grid x 16–318: label column 130, icon columns at 154/178/206/238/278 (gap 8), so ≤ 302 of 328 at 360 and no h-scroll (360/360). Icon on the canvas 17.74 L / 17.29 D; story label 7.56 / 12.17, caption 5.84 / 7.31. `forced/` 360 L/D: CanvasText black / white, glyphs intact |
| AC-8 | pass | The developer's measure matches design §3 at 360/1024/1280 L/D: h 42, pad 8 12, icon 24×24 at +13/+9, field +45 h 23 14 px, w 270/934/1190 (242/906/1162 with a value). The DE placeholder is 186 px, under 242. Icon #5c6672 on #f9fafb and #93a4ad on #1a2c3a: the design's 5.58 / 5.56. Shots 360 L and 1280 D look right |
| AC-9 | pass | `tmp/030/sizes.json`, changelog draft "Size" (see #1) |
| AC-10 | pass | Jest 4893 passed; only the count assertions changed, with the reason stated. `diff -rq baseline after-1` (30) and `after-2` (92): 0 differ. The 6 time-driven log-viewer stories show `ppppp@16x16 pp@16x16 pp@16x16`, as expected in §9.3 |
| AC-11 | pass | All 4 IDs of §8 exist (`index.json`; my r1 run resolves the icon story) |

**API check against §2:** the constant names and variants match the table, and the six `viewProviders` lists match it entry for entry. `ICON_NAMES` is unchanged and the `NOT_ICONS` `input: search` entry is in. The docs drift is fixed: `icons/index.ts`, `bundle-size.mdx` and the story text say 150. There is no new input, so no JSDoc or argTypes were due. The args of the log-viewer story are declared in the meta's argTypes.

**Deviations (build.md): both agreed.**
- The literal "All 150 constants": the MCP manifest reads story descriptions statically, so `${BUNDLED_ICONS.length}` would show up verbatim there. The next request that appends glyphs has to update the literal, as "133" should have been.
- `lang="de"` and the captions in *Registered (placeholder mode)*: correct, because the German text needs the language for screen-reader pronunciation, and the captions are code identifiers.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix (release-manager, changelog) | CHANGELOG 3.22.0 "Size" (AC-9 asks for raw and gzip, before and after) | Lazy icon set 62,788 → 66,928 B raw (12,792 → 13,306 gzip). `icons` entry, which apps importing `BUNDLED_ICONS` pay for: 75,141 → 80,417 raw (14,963 → 15,650 gzip). `lc-icon` 32,710 → 32,843 (9,558 → 9,588), from `tmp/030/sizes.json` | Raw is given only as a delta (+4,140 / +133); the `icons` entry growth is missing |
| 2 | nit | `data-display-logviewer--app-registers-no-icons` | The same clock everywhere, e.g. `new Date(2026, 10, 2, 8, 0, i)` (local time) | `Date.UTC(…, 8, …)` renders "09:00:00" in the CET shots and "08:00:00" in a UTC CI. The hash is stable per machine, so this is not blocking |
| 3 | nit | `icon.stories.ts` `SearchLockTabletIcons` | Only the props the template uses | `caption` is passed but not used |
| 4 | nit (pre-existing, follow-up) | `components-icon--icon-constants` at 1280 | Names stay in their column | `ICON_EXCLAMATION_TRIANGLE_SOLID`, `ICON_PRESENTATION_CHART_LINE_SOLID` and `ICON_ARROW_TRENDING_DOWN_SOLID` run into the next column. This affects only the story, and the names predate 3.22 |
| 5 | nit (pre-existing, follow-up F-7) | every log-viewer story, light | axe clean | `color-contrast` on `.lc-log-viewer__line-count` (plus the debug/timestamp dims from 029 r2), and `scrollable-region-focusable` on `.lc-log-viewer__content`. At 360 the "10 errors"/"10 warnings" pills wrap to two lines |

**Verdict:** approved. There is no must-fix. #1 goes to the release-manager with the changelog; #2–#5 stay open as listed.
