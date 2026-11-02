# Design 030: Inline magnifying-glass, lock and device-tablet icons; search-input and log-viewer register their glyph

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-11

## 1. Approach

Extend, no new component. It follows two existing patterns: the Tabler inline list in `scripts/generate-icon-names.mjs` (`INLINE_TABLER_NAMES`, precedent 3.16 TD-3: `wallet`, `building-bank`, `shield-lock`), and the 3.6 (AS-17) rule that **a kit component registers every inline glyph its template draws** through `viewProviders: [ɵprovideKitIcons([...])]`. The static scan in `kit-icons.spec.ts` enforces that rule.

| # | Decision | Why |
|---|---|---|
| D1 | The magnifier is the Tabler key `search`, so the constant is **`ICON_SEARCH`**. There is **no `ICON_MAGNIFYING_GLASS`**. | A constant names a glyph key, never an alias: `x-circle` → `ICON_CIRCLE_X`, `envelope` → `ICON_MAIL`, `cog-6-tooth` → `ICON_SETTINGS`. None of the ~100 aliases has a constant. `icons.spec.ts` asserts one `ICON_*` per glyph. The `'placeholder'` warning for `magnifying-glass` already says "Add ICON_SEARCH" (`iconConstantName(glyph)`). `magnifying-glass` keeps resolving through `ICON_ALIASES`. |
| D2 | Append **7** Tabler keys after `shield-lock`, in this order: `search`, `lock`, `device-tablet`, `player-play`, `player-pause`, `clipboard`, `arrow-down`. | To register a glyph, a component needs its constant, and a constant exists only for an inline key. AC-4 needs all of log-viewer's glyphs (`player-play`, `player-pause`, `clipboard-document` → `clipboard`, `arrow-down`), and none of them is inline today. Appending keeps the order of the 137 existing glyphs. |
| D3 | Solids come from the generator as they are: Tabler has a filled glyph for 6 of the 7 keys (all except `arrow-down`). That makes 13 new constants, and `BUNDLED_ICONS` goes from 137 to **150**. | The `shield-lock` precedent (`ICON_SHIELD_LOCK_SOLID` was not requested either), and no generator change. The changelog says that `arrow-down` has no filled glyph. |
| D4 | Every kit component that draws a newly inline glyph registers it: search-input, log-viewer, plus the **one-line additions** to code-block, copy-field, kanban-board and tree-view (§2). `kit-icons.spec.ts` `NOT_ICONS` gets `'input/input.component.ts: search': 'enterkeyhint value'`. | Without this, those components would show the placeholder under `'placeholder'` (before, the glyph was fetched), or load the whole lazy set under `'load'`. The scan fails until these registrations are in, so this is the spec's "same one-line change". |
| D5 | **How AC-5 is read:** a glyph that the *app* draws (`<lc-icon name="lock">`) follows the app's setting. With `unregistered: 'placeholder'` it draws once the app registers `ICON_LOCK` / `ICON_DEVICE_TABLET` (life-os swaps its local definitions for them). Unregistered, it shows the placeholder and the warning names the constant. | Spec "Not in: changing `unregistered` handling"; `kit-icons.spec.ts` "a name the app passes in is the app's". |
| D6 | No layout change. The magnifier stays a 24 × 24 px box (`lc-icon` size md). | `.search-input__icon { --icon-size: 1rem }` is dead: lc-icon sizes its box only by `size`. Making it 16 px would change the md height from 42 to 41 px (AC-8). That is pre-existing, out of scope, and left as it is. |

**Changelog notes (for the developer's draft):**
- **Compatibility:** with `unregistered: 'placeholder'`, an app that draws `magnifying-glass`/`search`, `lock`/`lock-closed`/`locked`, `device-tablet`, `player-play`, `player-pause`, `clipboard-document`/`clipboard` or `arrow-down` *itself* must now register the constant. These names were fetched before. The console warning names the constant.
- **Migration (life-os):** replace the local `lock` with `ICON_LOCK` and add `ICON_DEVICE_TABLET`. The local `magnifying-glass` can go, because `lc-search-input` draws it; keep `ICON_SEARCH` only where the app draws the magnifier itself.

## 2. Public API

No new input, output, slot, CSS hook or type. New exports from `@lifecorner/angular-ui-kit/icons` (type `LcIconDefinition`, generated plain literals, all in `BUNDLED_ICONS`):

| Kind | Name | Glyph (`name` · `variant`) | Notes |
|---|---|---|---|
| const | `ICON_SEARCH`, `ICON_SEARCH_SOLID` | `search` · outline / solid | aliases `magnifying-glass` |
| const | `ICON_LOCK`, `ICON_LOCK_SOLID` | `lock` | aliases `lock-closed`, `locked` |
| const | `ICON_DEVICE_TABLET`, `ICON_DEVICE_TABLET_SOLID` | `device-tablet` | joins `device-mobile/-desktop/-laptop` |
| const | `ICON_PLAYER_PLAY`, `ICON_PLAYER_PLAY_SOLID`, `ICON_PLAYER_PAUSE`, `ICON_PLAYER_PAUSE_SOLID` | `player-play`, `player-pause` | log-viewer |
| const | `ICON_CLIPBOARD`, `ICON_CLIPBOARD_SOLID` | `clipboard` | aliases `clipboard-document` |
| const | `ICON_ARROW_DOWN` | `arrow-down` · outline only | Tabler has no filled glyph |
| behaviour | `isInlineIconName()` | `true` for the 7 keys and their aliases | `ICON_NAMES` is unchanged (all names were already valid) |

Kit registrations (`viewProviders: [ɵprovideKitIcons([...])]`), all outline:

| Component | Today | After |
|---|---|---|
| `lc-search-input` | `ICON_X_MARK` | `ICON_X_MARK, ICON_SEARCH` |
| `lc-log-viewer` | `ICON_TRASH` | `ICON_TRASH, ICON_SEARCH, ICON_PLAYER_PLAY, ICON_PLAYER_PAUSE, ICON_CLIPBOARD, ICON_ARROW_DOWN` |
| `lc-code-block`, `lc-copy-field` | `ICON_CHECK` | `+ ICON_CLIPBOARD` |
| `lc-kanban-board` | `ICON_EXCLAMATION_CIRCLE` | `+ ICON_ARROW_DOWN` (priority `low`) |
| `lc-tree-view` | 6 glyphs | `+ ICON_LOCK` (`.lock` files, `file-icons.ts`) |

**Default rendering unchanged:** each glyph has the same Tabler artwork the asset fetch delivered. The generator only drops the invisible `M0 0h24v24H0z` background path, so the pixels are equal. That is verified by hash against the baselines (§9), and the boxes are unchanged (`size` input). Under `'load'`, kit components now render synchronously and in prerendered HTML instead of after a fetch. Docs drift to fix while there: `icons/index.ts` says "all 133" (wrong since 3.16), and the "Icon constants" story says "All 133 constants" (use `BUNDLED_ICONS.length`).

## 3. Anatomy and layout

`lc-search-input`, measured on `main` (baseline). The values are the same at 360, 1024 and 1280 px and in both themes. Only the glyph's source changes.

### 360 px (story padding 16 px → 328 px field)

```
x=16 ┌─ 1px --color-field-border, --border-radius-md ──────────────────────┐ h 42
     │ 12 │ ⌕ 24×24 @x29 │ 8 │ Search banks…  field @x61 w270 h23 14px │ 12 │
     └────────────────────────────────────────────────────────────────────┘
with value: … field w242 │ 8 │ (×) 20×20 clear │ 12 │
```

### From 1024 px

Same box. The field grows: w934 at 1024 and w1190 at 1280 (Default story, full width).

| Element | md (sm / lg) | Token / source |
|---|---|---|
| Wrapper | h 42 (38 / 48), padding 8 12 (6 10 / 10 16), gap 8 | `.search-input--<size>` |
| Magnifier box | 24 × 24 at wrapper +13 / +9 (sm +11/+7, lg +17/+12) | `lc-icon` md |
| Field | x = wrapper +45 (sm +43, lg +49), h 23 (21.5 / 26), 14 px (13 / 16) | inherit |

New icon story grid (`SearchLockTabletIcons`): `display:grid; grid-template-columns: max-content repeat(5, auto); gap: 12px 8px; align-items:center; justify-content:start`. The label column is 12 px monospace in `--color-text-secondary`, with the variant as an 11 px caption line in `--color-text-tertiary`. The icons are 16, 20, 24, 32 and 40 px, in `--color-text-primary`.

```
360: │ label ≤130 │8│ xs16 │8│ sm20 │8│ md24 │8│ lg32 │8│ xl40 │ ≤ 302 px of 328, no h-scroll
rows: magnifying-glass · search · search/solid · lock · lock-closed · lock/solid ·
      device-tablet · device-tablet/solid · ── kit components ── · player-play ·
      player-pause · clipboard-document · arrow-down
```

## 4. States

| State | Behaviour |
|---|---|
| default / hover / focus-visible / active | Unchanged in search-input and log-viewer; the icons are decorative and inherit colour. |
| disabled | search-input keeps `opacity: .5` and the glyph is drawn (not the placeholder). |
| loading | Registered glyphs render synchronously; there is no empty box while a fetch runs. |
| empty / error | No value → no clear button. An app-drawn unregistered name under `'placeholder'` shows the placeholder, same box (D5). |
| overflow | The DE placeholder clips inside the field and never overlaps the icon (separate flex items). log-viewer with 40+ lines: the jump-to-bottom `arrow-down` is drawn. |

## 5. Theming

| Element | Light | Dark | Contrast (computed, WCAG) |
|---|---|---|---|
| Magnifier `--color-text-tertiary` on `--color-surface-2` | #5c6672 on #f9fafb | #93a4ad on #1a2c3a | **5.58:1** / **5.56:1** (≥ 3:1, measured via `--measure`) |
| New glyphs in other places | `currentColor` of the host | same | unchanged from the fetched glyphs |

No new tokens. In forced colours the svg inherits `CanvasText` (`color: inherit`, stroke `currentColor`).

## 6. Accessibility

- All the glyphs that search-input and log-viewer draw stay `[decorative]="true"`: `aria-hidden="true"`, no role, no name. There are no new focus stops and no new announcements. Each button keeps its `aria-label` (log-viewer `Pause stream`, `Clear log`, `Copy all lines`, `Search log`), and the field keeps `aria-label` "Search".
- An app-labelled `lock` / `device-tablet` keeps `role="img"` and `aria-label`.
- Targets are unchanged (not part of this request). forced-colors: `CanvasText`. Reduced motion: no motion added.

## 7. Texts

There are no new built-in strings. Strings used in the stories:

| Use | EN | DE |
|---|---|---|
| search-input placeholder / ariaLabel | Search banks… / Search banks | Bank, BIC oder Ort suchen … / Banken durchsuchen |
| search-input clearAriaLabel | Clear search (default) | Suche leeren |
| lock line (icon story) | — | Nur für dich |

## 8. Stories

| Story | Expected ID | Args / setup | Shows |
|---|---|---|---|
| Components/Icon "Search, Lock and Tablet Icons" (`SearchLockTabletIcons`) | `components-icon--search-lock-tablet-icons` | no providers (`'load'`); the grid of §3 | AC-7, AC-11: the 3 names plus aliases plus solids, and the 4 kit-component glyphs, at 16–40 px |
| Components/Icon "Lock and Tablet, Registered (placeholder mode)" (`RegisteredWithPlaceholderMode`) | `components-icon--registered-with-placeholder-mode` | `applicationConfig({ providers: [provideLcIcons([ICON_LOCK, ICON_DEVICE_TABLET], { unregistered: 'placeholder' })] })`; `<p><lc-icon name="lock" size="xs" decorative/> Nur für dich</p>`, `lock-closed` md `ariaLabel="Gesperrt"`, `device-tablet` md `ariaLabel="Tablet"` | AC-5: the life-os setup; the alias finds `ICON_LOCK`; decorative and labelled icons; 0 placeholders |
| Form/Search Input "App Registers No Icons" (`AppRegistersNoIcons`) | `form-search-input--app-registers-no-icons` | `provideLcIcons([], { unregistered: 'placeholder' })`; a column with gap 12 of three md inputs: EN placeholder; DE placeholder + DE ariaLabel; DE with `value="Sparkasse"` + `clearAriaLabel="Suche leeren"` | AC-3, AC-8, AC-11: magnifier and x-mark are drawn, not "?" |
| Data Display/LogViewer "App Registers No Icons" (`AppRegistersNoIcons`) | `data-display-logviewer--app-registers-no-icons` | the same provider; 40 lines with **fixed** timestamps (no `new Date()`, so the hash is stable); `stream$: NEVER`; `height: '240px'` | AC-4, AC-11: all 6 glyphs once search is open and the view is scrolled up |

The existing `inline-set` and `icon-constants` stories change on purpose (7 names / 13 constants are appended). Every other story stays unchanged.

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| AC-1 | New `icon.search-lock-tablet-icons.spec.ts`, mirroring `icon.finance-icons.spec.ts` | `resolveInlineGlyph`: `magnifying-glass`→`search`, `lock-closed`→`lock`, `device-tablet`; `isInlineIconName` true; `HttpTestingController.match` → [] |
| AC-2 | `icons.spec.ts` | 137 → **150** (stated reason: 13 appended glyphs); `slice(137)` lists the 13 in D2 order; markup equals `compact(@tabler/icons outline/filled)` |
| AC-3, AC-4 | Add two cases to the `kit-icons.spec.ts` "rendering with nothing registered by the app" block (`expectOwnGlyphs`). For log-viewer, set `showSearch`/`atBottom` as `kit-icons.decorative.spec.ts` does, and toggle `paused` | search-input: 2 svgs, the magnifier's `d` equals `ICON_SEARCH`; log-viewer: 6 svgs and `player-play` after the toggle; 0 placeholders, 0 warnings, 0 requests |
| AC-5 | Unit: `provideLcIcons([ICON_LOCK, ICON_DEVICE_TABLET], {unregistered:'placeholder'})`; story `--axe` | drawn; decorative `aria-hidden="true"`; labelled `role="img"` + name; axe 0 violations |
| AC-6 | Compat probe: `lc-search-input` in a probe component with `providers: [provideLcIcons([], { unregistered: 'placeholder' })]` plus an `EXPECT_IN_HTML` entry | prerendered `.search-input__icon` → `<svg … aria-hidden="true"><path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/>`. Compat pages with code-block, copy-field, tree-view and kanban now prerender their glyphs, so update any count with the reason |
| AC-7 | `--stories=components-icon--search-lock-tablet-icons --widths=360,1280 --themes=light,dark --full`, plus one `--forced-colors` run (own `--out`); `--measure` of box sizes, svg `color` vs the text colour, and `scrollWidth ≤ innerWidth` | boxes 16/20/24/32/40; svg colour = text colour (CanvasText when forced); no horizontal scroll at 360 |
| AC-8 | `form-search-input--app-registers-no-icons` at 360/1024/1280 × light/dark, with `--measure` as in the baseline | wrapper h 42, pad 8 12, icon 24×24 at +13/+9, field at +45, h 23, 14 px; glyph `path,path` (not `rect,text`); DE placeholder `measureText` < field width (270 at 360) |
| AC-9 | Build output (developer) | lazy `internal/icon-set` raw and gzip, before → after; bytes per new constant (format as in 3.16) |
| AC-10 | Full Jest suite plus the hash comparison below | no changed assertion except the AC-2 counts (and a compat count, if any) with a stated reason |
| AC-11 | `--list=search-lock-tablet`, `--list=app-registers-no-icons` | the 4 IDs of §8 exist |

**Baselines** (main @ `4769e7a`, Storybook rebuilt 2026-11-02), in `tmp/story-shots/030/baseline`. A second run on the same build was identical for these 122 shots (`tmp/story-shots/030/stability`):

1. `form-search-input--{default,sizes,disabled,with-preset-value}`, `data-display-logviewer--streaming` at 360,1024,1280 × light,dark (30).
2. `components-icon--{default,sizes,unknown-name-fallback,finance-icons,registered-icons,unregistered-name,inherited-color}`, `data-display-code-block--{type-script,no-header,long-command-german}`, `form-copy-field--{default,on-a-phone,inline}`, `data-display-kanban-board--{default,simple}`, `components-treeview--{default,file-types}`, `data-display-filter-bar--{default,with-preset-values,small-size}`, `form-input--with-icon`, `feedback-empty-state--no-results`, `data-display-list--with-disabled` at 360,1280 × light,dark (92). Expected: **0 different**.
3. **Not hash-stable:** the other 6 `data-display-logviewer--*` stories (`new Date()` timestamps differed between two runs). Check them with `--measure` of each `lc-log-viewer lc-icon`, svg children plus box. Baseline `ppppp@16x16 ppp@16x16 ppp@16x16` (the fetched glyphs carry the background path); expected `ppppp@16x16 pp@16x16 pp@16x16`.
