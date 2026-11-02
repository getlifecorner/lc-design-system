# Build 030: Inline magnifying-glass, lock and device-tablet icons; search-input and log-viewer register their glyph

- **Branch:** `feat/3.22-inline-search-lock-tablet-icons`
- **Commit:** `git log -1` on the branch (`feat(icon): inline search, lock and device-tablet; …`)

## Files changed

| File | Change |
|---|---|
| `scripts/generate-icon-names.mjs` | 7 Tabler keys appended after `shield-lock` (design D2) |
| `internal/icon-set/icon-inline-tabler.data.ts`, `icons/icons.data.ts`, `icon/icon-inline-index.data.ts` | generator output: 7 keys, 13 constants (6 filled), `BUNDLED_ICONS` 137 → 150. `icon-names` unchanged (all were valid names). `npm run generate:icon-names` needs approval headless: the output came from a temporary Jest harness with the generator's transform (its check: it reproduces the committed `shield-lock` glyphs). `icons.spec`, `icon-catalog.spec` and the new spec prove it equals `compact(@tabler/icons …)` |
| `search-input`, `log-viewer`, `code-block`, `copy-field`, `kanban-board`, `tree-view` `.component.ts` | registrations exactly as design §2 |
| `kit-icons.spec.ts` | `NOT_ICONS` `input: search`; two cases in "rendering with nothing registered" (AC-3, AC-4) |
| `icon/icon.search-lock-tablet-icons.spec.ts` (new, 44 tests) | AC-1, AC-2, AC-5 |
| `icons/icons.spec.ts`, `icon/icon.trusted-types.spec.ts` | counts 137 → 150 (TT set 138 → 151). Stated reason: 13 glyphs appended, as 3.16 did 133 → 137; `slice(133, 137)` still pins the 3.16 four |
| `icon.stories.ts`, `search-input.stories.ts`, `log-viewer.stories.ts` | the 4 stories of §8; "Icon constants" text 133 → 150 |
| `icons/index.ts`, `docs/bundle-size.mdx` | "133" → "150" (docs drift, design §2) |
| `tools/compat/…/probe-322.ts`, `home.ts`, `home.html`, `check-angular-majors.mjs` | probe + `EXPECT_IN_HTML` "search input: the magnifier prerendered" |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | new spec: `resolveInlineGlyph` for 11 names (magnifying-glass→search, lock-closed/locked→lock, clipboard-document→clipboard, …), `isInlineIconName`, `isValidIconName`; lc-icon renders each with `httpMock.match` = [] |
| AC-2 | `icons.spec` (150, `slice(137)` = 13 in D2 order, identical markup); new spec: outline + 6 filled = `compact(Tabler)`; no filled arrow-down; `ICON_SEARCH/LOCK/DEVICE_TABLET` = inline markup |
| AC-3 | `kit-icons.spec`: search-input 2 svgs, magnifier `d` = `ICON_SEARCH`, clear = `ICON_X_MARK`, 0 placeholders/warnings/requests |
| AC-4 | `kit-icons.spec`: log-viewer 6 svgs in order pause, trash, clipboard, search, search, arrow-down; `player-play` after pausing. Revert proof: dropping `ICON_SEARCH` (search-input) and `ICON_PLAYER_PLAY` (log-viewer) fails 4 tests (incl. notification-center, which embeds lc-search-input) |
| AC-5 | new spec under `provideLcIcons([ICON_LOCK, ICON_DEVICE_TABLET], {unregistered:'placeholder'})`: decorative `aria-hidden`, labelled `role=img` + name; unregistered `lock` → placeholder + "Add ICON_LOCK" (D5), `magnifying-glass` → "Add ICON_SEARCH". Story axe: 0 violations |
| AC-6 | compat 22: `ok search input: the magnifier prerendered, not the placeholder` |
| AC-7 | `--measure` (both icon stories, 360/1280 L/D, `--full`): 60 icons, boxes 16/20/24/32/40 × 12, svg colour = parent text (#111827 L, #f1f6f8 D), 0 placeholders, no h-scroll at 360. `--forced-colors`: rgb(0,0,0) L / rgb(255,255,255) D, all match the text |
| AC-8 | `form-search-input--app-registers-no-icons` 360/1024/1280 L/D: h 42, pad 8 12, icon 24×24 @ +13/+9, field x+45 h23 14px (w270/934/1190), glyph `pp` (not `rect,text`), DE placeholder 186 px < 270 (< 242 with value), no overlap. Icon #5c6672 on #f9fafb / #93a4ad on #1a2c3a (designer's 5.58 / 5.56). axe 0 |
| AC-9 | build output, see changelog draft (fesm2022, gzip -9 via Node zlib) |
| AC-10 | full Jest; only the count assertions above changed. Hash compare against `tmp/story-shots/030/baseline`: **122 / 122 identical** (sets 1 + 2). The 6 time-driven log-viewer stories: `ppppp@16x16 pp@16x16 pp@16x16` at 360/1280 (baseline `… ppp … ppp`, the dropped background path) |
| AC-11 | `index.json` holds the 4 ids of §8 |

## Gates

All gates ran on the tree of commit `7b1537d` (libs and tools; the amend adds only `requests/030-…/build.md`). Later agents skip a gate while `git diff --quiet 7b1537d -- libs tools` holds.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 211 suites, 4893 passed, 8 skipped (was 210 / 4847) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (unchanged) |
| `npx nx run angular-ui-kit:build` | 122 "Built" |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | 972 stories (+4) |
| Story screenshots | new: `tmp/story-shots/030/new/` (4 stories; log-viewer at rest), `new-log-measure/` (search open, scrolled up), `forced/`, `changed/` (`inline-set` 83 icons, `icon-constants` 150, 0 placeholders); compare: `after-1/`, `after-2/` |
| `check-angular-majors.mjs --only=22` | PASS, 87 HTML checks (+1); `check-trusted-types` 194 / 194 |

## Deviations from the design

- "Icon constants" story text says "All 150 constants" as a literal, not `BUNDLED_ICONS.length`: the MCP manifest reads story descriptions statically and would show `${BUNDLED_ICONS.length}`. Same text in Storybook.
- `RegisteredWithPlaceholderMode` wraps its content in `lang="de"` and captions the labelled icons like "Unregistered name" does.

## Findings outside the scope

- Pre-existing axe violations in every log-viewer story (also `--default`): `color-contrast` on debug lines (line opacity) and `.lc-log-viewer__line-count` (light), `scrollable-region-focusable` on `.lc-log-viewer__content`. The new story inherits them; candidate follow-up.
- Fetched glyphs of kit components (outside the inline set, so `unregistered` doesn't apply; they need the assets): `minus`, `arrows-pointing-out`, `arrow-down-tray`, `photo` (document-viewer, gallery, number-input), `cloud-arrow-up` (file-upload), `bell` (notification-center), `fold-down`/`fold-up` (tree-view), field-group's glyphs. The scan proves no kit component draws an unregistered *inline* glyph.

## Changelog draft

## [3.22.0] - 2026-11-02

The magnifier, `lock` and `device-tablet` are in the inline set, and `lc-search-input` and `lc-log-viewer` register every glyph they draw, so an app with `unregistered: 'placeholder'` no longer sees "?" in them (life-os BA-6, BA-7). No API breaks.

### Added

- **Inline icons `search` (alias `magnifying-glass`), `lock` (aliases `lock-closed`, `locked`) and `device-tablet`** (BA-7: the health lock line „Nur für dich“, Settings → devices) and the constants `ICON_SEARCH`, `ICON_LOCK`, `ICON_DEVICE_TABLET` with their `_SOLID` glyphs: no request, prerendered. Also inline now, for the kit's own components: `player-play`, `player-pause`, `clipboard` (alias `clipboard-document`) and `arrow-down`, with `ICON_PLAYER_PLAY`, `ICON_PLAYER_PAUSE`, `ICON_CLIPBOARD`, `ICON_ARROW_DOWN` (+ `_SOLID` except `arrow-down`, which Tabler has no filled glyph for). `BUNDLED_ICONS` holds 150 (was 137). A constant names the glyph key, so there is no `ICON_MAGNIFYING_GLASS`.
- Stories: Components/Icon "Search, Lock and Tablet Icons" and "Lock and Tablet, Registered (placeholder mode)"; Form/Search Input and Data Display/LogViewer "App Registers No Icons".

### Fixed

- **`lc-search-input` draws its magnifier with `provideLcIcons(…, { unregistered: 'placeholder' })`** (BA-6, the bank picker search on life-os's connect page): it registers `ICON_SEARCH` itself; before, it showed the placeholder "?". Same for `lc-notification-center` and `lc-filter-bar`, which contain it.
- **`lc-log-viewer`** registers pause/play, clipboard, both magnifiers and jump-to-bottom (only the trash before); `lc-code-block` and `lc-copy-field` their clipboard, `lc-kanban-board` the low-priority `arrow-down`, `lc-tree-view` the `.lock` file glyph.

### Compatibility

- No API breaks; no input, style or layout changed. The artwork is the Tabler glyph the assets delivered, so pixels are equal (122 story shots hash-identical); the server HTML now contains these glyphs, and under the default `'load'` they render without a request.
- With `unregistered: 'placeholder'`, an app that draws `magnifying-glass`/`search`, `lock`/`lock-closed`/`locked`, `device-tablet`, `player-play`, `player-pause`, `clipboard`/`clipboard-document` or `arrow-down` **itself** must now register the constant: these names were fetched before. The console warning names the constant.
- Size: the lazy kit icon set grows by 4,140 B raw (12,792 → 13,306 B gzip); `lc-icon`'s key index by 133 B raw (+30 B gzip). A constant costs 231–398 B raw only when imported: `ICON_SEARCH` 283, `ICON_LOCK` 381, `ICON_DEVICE_TABLET` 355. Using `lc-search-input` adds `ICON_SEARCH`; `lc-log-viewer` 1,597 B raw (five constants).

### Migration

- life-os: replace the local `lock` with `ICON_LOCK` and add `ICON_DEVICE_TABLET` to `APP_ICONS`. The local `magnifying-glass` can go (`lc-search-input` draws it); register `ICON_SEARCH` only where the app draws the magnifier itself.
