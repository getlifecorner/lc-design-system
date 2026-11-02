# Spec 030: Inline magnifying-glass, lock and device-tablet icons; search-input and log-viewer register their glyph

- **Status:** ready
- **Type:** extension of `lc-icon` (inline set, `ICON_*` constants) and bug fix in `lc-search-input` and `lc-log-viewer`
- **Affected:** `lib/icon/icon-inline-index.data.ts` (and the lazy inline set it indexes), the `icons` entry (`ICON_*` constants, `BUNDLED_ICONS`), `lib/search-input/search-input.component.ts`, `lib/log-viewer/log-viewer.component.ts`, `icon.stories.ts`, CHANGELOG, MCP manifest
- **Semver impact:** minor. New inline glyphs and exported constants; every other icon renders as before. A glyph that showed the "?" placeholder now draws.

## Need

life-os (spec 004, gaps BA-6, BA-7; `kit-gaps.md` "Found in /lifecorner-prove") registers its icons with `provideLcIcons(APP_ICONS, { unregistered: 'placeholder' })`. Under that setting a glyph that is neither in the kit's inline set nor registered shows the placeholder "?" instead of being fetched.

- Bank picker search (`connect.page.ts:109`): `lc-search-input` draws `magnifying-glass`, which is not inline and which the component does not register (it registers only `ICON_X_MARK`). The search field shows "?".
- Health lock line "Nur für dich" (`account.page.ts`, `account-settings.page.ts`): `lock` is not available without a fetch.
- Settings -> devices: `device-tablet` is not available without a fetch (`device-mobile`, `-desktop`, `-laptop` already are).

The app carries local definitions as a stopgap; a consumer must not rebuild kit glyphs.

## What the kit has today

- `ICON_ALIASES` maps `magnifying-glass` to the Tabler key `search` (`icon-aliases.ts:31`). `search` and `device-tablet` are not in `INLINE_TABLER_OUTLINE_KEYS`. `lock` is the alias target of `lock-closed` and `locked` (lines 94, 96); the intake grep found no bare `lock` key in the inline lists (the developer confirms).
- Kit components register their own glyphs with `viewProviders: [ɵprovideKitIcons([...])]`. `lc-search-input` registers `ICON_X_MARK` only; `lc-log-viewer` registers `ICON_TRASH` only, although its template also draws `magnifying-glass` (lines 50, 85), `player-play`/`player-pause`, `clipboard-document` and `arrow-down`.
- Precedent: the CHANGELOG entry for spec 004 added `wallet`, `building-bank`, `shield-lock` with `ICON_WALLET`, `ICON_BUILDING_BANK`, `ICON_SHIELD_LOCK` and reported the inline-set size cost.

Nothing covers this today, so there is no Resolution.

## Scope

- In: `search`, `lock`, `device-tablet` (Tabler outline) in the inline set, unaliased (no network fetch); constants `ICON_SEARCH`, `ICON_LOCK`, `ICON_DEVICE_TABLET` in `BUNDLED_ICONS`; `lc-search-input` and `lc-log-viewer` register every glyph their templates draw; stories.
- Not in: solid variants (record in the changelog if Tabler has none, as for `wallet`); renaming glyphs; changing `unregistered` handling; other kit components with unregistered glyphs (the developer lists them in build.md; fix only if it is the same one-line change).

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `lc-icon` with `magnifying-glass`, `search`, `lock`, `lock-closed`, `device-tablet` renders a Tabler outline svg with no network request and no registration (the inline lookup resolves them) | unit test (`resolveInlineGlyph` returns a key; fetch spy not called) |
| AC-2 | `@lifecorner/angular-ui-kit/icons` exports `ICON_SEARCH`, `ICON_LOCK`, `ICON_DEVICE_TABLET`, all in `BUNDLED_ICONS`; their path data equals the Tabler outline icons | `icon-catalog.spec.ts` / constants spec |
| AC-3 | With `provideLcIcons([], { unregistered: 'placeholder' })` (the life-os setting), `lc-search-input` draws the magnifier, not the placeholder; the clear button still draws `x-mark` | unit test comparing the svg to `ICON_SEARCH` |
| AC-4 | Same setup: every glyph in `lc-log-viewer`'s default template (magnifier at both places, play/pause, trash, clipboard, arrow-down) is drawn; none is the placeholder | unit test enumerating its `lc-icon`s |
| AC-5 | Same setup: `lc-icon` `lock` and `device-tablet` draw the glyph; decorative icons keep `aria-hidden`, labelled ones keep their name | unit test; axe in the story |
| AC-6 | Prerendered HTML contains the svgs before JavaScript (no empty icon box); an `EXPECT_IN_HTML` entry if the compat page draws icons | prerender spec or `check-angular-majors.mjs` |
| AC-7 | The three glyphs look right at 16/20/24/32/40 px, light and dark, in forced-colors (CanvasText); stroke follows `currentColor` | `Icon` story, `story-shots.mjs` at 360 and 1280, both themes |
| AC-8 | `lc-search-input` at 360 and 1280 px, light and dark, EN and DE placeholder: the magnifier box is as designed for the existing story, does not overlap the text, and the input height and padding are unchanged | story shots, `--measure` |
| AC-9 | The inline-set size change is measured (raw and gzip, before and after) and reported in build.md and the CHANGELOG | build output |
| AC-10 | Defaults unchanged: existing icon, search-input and log-viewer specs pass with no changed assertion; fetched names behave as before | full Jest suite |
| AC-11 | Stories: the icon story lists the three names; search-input and log-viewer get a variant running with `unregistered: 'placeholder'` so a regression shows | stories |

Keyboard and screen reader: both components keep their icons decorative, with no new focus stops or names (AC-5). DE lengths: no new text.

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- The glyphs come from the Tabler set the kit already bundles; no new licence.

## Assumptions

- Assumption: the Tabler key of the magnifier is `search`, and `magnifying-glass` stays an alias, so the constant is `ICON_SEARCH`. The requester's `ICON_MAGNIFYING_GLASS` is exported only if the designer finds a convention for constants of alias names; then as a re-export of the same value, with no second copy of the path data. `magnifying-glass` must keep resolving.
- Assumption: outline only; no solid variants were requested.
- Assumption: BA-6 and BA-7 ship together in one minor release. life-os may keep or remove its local `APP_ICONS` definitions afterwards.

## Open questions

None.
