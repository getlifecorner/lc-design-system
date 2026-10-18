# Spec 005: Edu's character poses as kit assets (G-4)

- **Status:** ready
- **Type:** new component (own secondary entry) + static assets + global style (`.lc-horizon__figure`)
- **Affected:** new folder `lib/character/` (stub `character/ng-package.json`, `index.ts`, line in `src/index.ts`); `src/assets/character/*.svg`; `package.json` `exports` (asset path); `src/styles/_horizon.scss`; stories/MDX; README (both) and CHANGELOG; `tools/compat` (`EXPECT_IN_HTML`). NOT touched: `lc-logo`, `lc-header`, `lc-empty-state`.
- **Semver impact:** minor. Everything is additive: new entry point, new files, new optional class. No existing default changes. (Adding an `exports` key does not restrict existing deep imports.)

## Need

life-os (app-shell 7.2, website-v0 G-4) wants Edu, the brand character, on the horizon block of the F1 app pages (offline, "can't reach", empty and done states, card corners) and on the website (Hallo on the band, calm at page end, Tröstet on the 404). Today the kit has no figure: the pages ship without it and reserve the space (5.4), so nothing is blocking. Constraints from the pages: no JavaScript may be needed for the initial paint (AS-15 budget), the static error page has no JavaScript at all, sizes change by breakpoint in CSS (inputs are frozen in prerendered HTML), and the figure must not cause layout shift. The owner decided (D10, 2026-10-18): static files plus an optional component in its own secondary entry, **not** an `lc-logo` variant.

## What the kit has today

| Existing | Why it does not suffice |
|---|---|
| `lc-logo` (emblem, lockup, `size` xs to xl) | flat brand mark only; D10 keeps it light. Its `assets/` file convention (`lifecorner-emblem*.svg`) is the model for the static files |
| `lc-icon` (Tabler glyphs, `lc-icon` Trusted Types policy, `offerIconSvgs`) | 24 px glyph set, not illustrations; its policy is the route for inline SVG without `[innerHTML]` |
| `lc-empty-state` | `icon` only, no figure slot (and not requested here) |
| `.lc-horizon` (3.3, LK-1) | no figure slot; sun radius/land custom properties exist, to be reused for placement |
| `package.json` `exports` | exposes `./styles/*` and `./icon-names.json`, but no asset path; `ng-package.json` copies `src/assets/**` |

## Scope

- In:
  1. **Poses (light + dark drawing each).** Required: `hello`, `shows-the-way`, `happy`, `welcomes-member`, `resting`, `in-his-corner`, `comforts`, `all-done`, `calm`. May ship in the same set: `connects`, `discovered`, `thinking`, `connection-paused`, `see-you`. Out: `peeks-around-corner`, `amazed`, `looks-ahead`.
  2. **Static files** per pose and drawing at a stable package path (`<pose>-light.svg`, `<pose>-dark.svg`), usable in `<img>` / `<picture>` with `prefers-color-scheme`.
  3. **SVG string export** for build-time inlining (no Angular needed to import it).
  4. **`lc-character`** in `@lifecorner/angular-ui-kit/character`: `pose`, `size` (logo scale 48/64/96 plus the larger steps below), `colorMode` (`auto` | `dark`), optional `ariaLabel`; hook `--lc-character-size`.
  5. **`.lc-horizon__figure`** slot in `_horizon.scss`.
  6. Stories, docs, tests (Proof).
- Not in (non-goals): `lc-logo` variant; changes to `lc-header`/`lc-logo`/`lc-empty-state`; the post-only poses; animation; speech/objects in a drawing; Open Graph images, favicon, touch icons (listed as open in G-4, separate request); card-corner placement (page-level, a documented recipe in the docs is enough); a `light` forced mode (not requested).

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | Files exist in the built package for all 9 required poses, each as `<pose>-light.svg` and `<pose>-dark.svg` (18 files minimum). Each has `width="100" height="100" viewBox="0 0 100 100"`, no `<script>`, no `<style>`, no `on*` attribute, no animation element (`animate*`, `set`), no external `href`, no `<text>`, size <= 30 KB (expected ~1.5 KB) | Jest over `src/assets/character/` plus a check on `dist/` after the build |
| AC-2 | Light files are the approved drawings from `life-os/docs/brand/character/` (same geometry; colours lower-case hex). Where a dark pair is drawn there (`hello`, `shows-the-way`, `happy`, `calm`) the dark file is that drawing, unchanged. Every other dark file follows the README rule (body/arms/rings `#84c7d4`, head highlight 0.22, cheeks `#1a6a79` at 0.55, open points `#0a121b`, accent lines `#4f9aaa`, walls `#2a4250`/`#13222e`; eyes, mouth, gold unchanged) | Jest compares each non-drawn dark file with the rule applied to its light file (colour map), and compares drawn pairs with the sources byte for byte after whitespace normalisation |
| AC-3 | The file path is stable and documented, and resolves for a consumer: either through an `exports` entry (e.g. `@lifecorner/angular-ui-kit/assets/character/hello-light.svg`) or the documented copy of the package `assets/` folder; the docs page names the exact URL form for `<img>`, `<picture>`, Angular `assets` config and a bundler import. The chosen form is checked on the compat consumer | `tools/compat` consumer build resolves one file; docs page |
| AC-4 | A typed SVG string export exists (e.g. `EDU_POSES` list, `EDU_SVG[pose].light/.dark`), importable without instantiating Angular and tree-shakeable per pose or lazily; the strings equal the files (AC-1/2) | Jest: string equals file; a small Node script imports it and prints one string |
| AC-5 | `lc-character` lives only in `@lifecorner/angular-ui-kit/character`; importing `@lifecorner/angular-ui-kit/header`, `/logo` or `/empty-state` does not pull it in (no import edge), and the root `src/index.ts` re-exports it as for every other entry | build (no TS6059), a spec/madge-style check of imports, bundle diff of a header-only consumer unchanged |
| AC-6 | Default render is decorative: host and inner `<svg>`/`<img>` carry `aria-hidden="true"` (and `alt=""` if an `<img>`), no `role`, no `tabindex`, no `<title>`. With `ariaLabel="Edu waves"` it becomes `role="img"` with that `aria-label` and drops `aria-hidden`. Never focusable in either state | unit test; axe on the story: no unnamed image, no violations |
| AC-7 | Intrinsic box: host is `aspect-ratio: 1` with a width/height set before JavaScript; measured box is the requested square at 48, 64, 96 and no layout shift when the SVG is added (`getBoundingClientRect` unchanged before/after) | story with `--measure` at 360 and 1280; unit test of the host style |
| AC-8 | Size: `size` accepts the logo scale values 48, 64, 96 (and 80, 128 needed by the app; design decides the exact union) and `--lc-character-size` overrides it, so a page can set 64 on the phone, 96 from 1024 and 128 from 1920 in CSS only. Documented default; with neither set, the size is the documented default | unit test of host style; story with a media-query wrapper measured at 360, 1024, 1920 |
| AC-9 | Theme: both drawings are in the DOM (or a `<picture>`), and the visible one follows the root theme `light`/`dark` and `system` (G-6) without JavaScript after hydration; only one is rendered visible, the hidden one is `display: none` (not announced) | story toggled light/dark and `:root.system` with emulated `prefers-color-scheme`; measure computed `display` |
| AC-10 | `colorMode="dark"` shows the dark drawing in both themes (Hallo on the website band), and still decorative. Default `auto` renders as AC-9 | unit test; story on a fixed dark surface in light and dark theme |
| AC-11 | Contrast of the body fill against its intended surface, computed: light body `#1a6a79` on white >= 4.5:1 (concept says 6.2) and on the sky low end >= 4.5 (5.9); dark body `#84c7d4` on the night sky >= 4.5 (9.1); Hallo `#84c7d4` on the band >= 3:1 (concept says 3.5 to 3.6, non-text graphic) | computed ratio test with the real theme tokens/backgrounds, reported in `build.md` |
| AC-12 | Nothing moves: no animation or transition in any file or in the component CSS; `prefers-reduced-motion: reduce` produces an identical render. `forced-colors: active`: the figure stays visible and unrecoloured only if readable, else documented (design decides; decorative, so hiding is allowed) | grep of files/CSS; story with emulated reduced motion and forced colours |
| AC-13 | No `[innerHTML]` binding. If the component renders inline SVG, it goes through the `lc-icon` Trusted Types policy (`offerIconSvgs`) and works under `require-trusted-types-for 'script'`. If it renders `<img>`, it needs no policy and the static path of AC-3 is used | the existing Trusted Types spec pattern (`icon.trusted-types.spec.ts`) extended to `lc-character`, or a spec asserting no policy is used |
| AC-14 | Prerendered HTML: the compat consumer's output contains the figure's markup, the size/aspect style, and `aria-hidden="true"`, with no hydration needed to be visible. Added to `EXPECT_IN_HTML` | `node tools/compat/check-angular-majors.mjs` on 21 and 22 |
| AC-15 | `.lc-horizon__figure`: positioned left of the sun with its feet on the line; its right edge is 16 px (phone) or 24 px (from 1024) left of the sun's left edge, derived from `--lc-horizon-sun-x` and `--lc-horizon-sun-radius`; the block's minimum height above the line becomes `max(sun radius + 22 px, figure + 8 px)`. A block without the figure keeps its current `min-height` and rendering exactly | story at 360, 1024, 1280, 1920 with measured figure right edge vs. sun left edge, feet at the line, block height; a screenshot comparison of an unchanged `.lc-horizon` against 3.7.0 |
| AC-16 | The figure in the slot is `aria-hidden` and does not receive pointer events or push the footer on the land; content on the land stays reachable | story with a footer on the land; keyboard tab order unchanged |
| AC-17 | One story per shipped pose, light and dark, at 64 and 96 px (stories title `Illustrations/Character` or as designer decides), plus the horizon and `colorMode` stories. Each argType has `description` and `table.defaultValue` | Storybook build; `story-shots` lists them |
| AC-18 | German and English: the component has no built-in text (decorative); `ariaLabel` is consumer text and the docs say so. No locale input is needed | docs; statement in design |
| AC-19 | 360 px and 1024/1280/1920: no horizontal overflow at 360 with the figure at 96 in the horizon (document width = 360) | story with `--measure='document.documentElement.scrollWidth'` |
| AC-20 | Unchanged defaults: existing specs and stories for `lc-logo`, `lc-header`, `lc-empty-state` and `.lc-horizon` pass unchanged; the primary-entry bundle does not grow unless the `character` entry is imported; the production build and `test:tools` stay green | full Jest, build, bundle size of a header-only consumer before/after |
| AC-21 | The MCP manifest lists the new component, inputs with `@default`, and the pose names; README (both) and CHANGELOG (Added; gap G-4, the consumer's pages, measured values; "no API break") are updated | `npm run test:tools`; diff review |

Always covered unless not applicable: 360 px and desktop widths (AC-7, 8, 15, 19) · light and dark (AC-9..11) · keyboard and screen reader (AC-6, 16) · EN and DE lengths (n/a, no text: AC-18) · prerendered HTML (AC-14) · unchanged defaults (AC-20).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency (no SVG library, no build-time dependency on the life-os folder at consumers' side), no API break.
- The kit holds its own copy of the drawings (the life-os folder is the brand source, the kit is the single delivery); the files are copied unchanged, not redrawn.
- Poses never hold, guard or reach for objects, never speak, are still.
- Each file at most 30 KB; the whole set (assets plus string export) is not loaded by any entry other than `character`.

## Assumptions

- Assumption: a "dark pair is authoritative where drawn" means the four drawn pairs in scope (`hello`, `shows-the-way`, `happy`, `calm`); the other required poses get a generated dark file by the README rule, committed as a file, and generated deterministically by a script (design/build choose where it lives, in `tools/`).
- Assumption: later poses (`connects`, `discovered`, `thinking`, `connection-paused`, `see-you`) ship in the same release because the files are small and the pose union is cheaper to open once; if the designer finds a drawing problem they can be deferred without failing this spec (AC-1..4 then apply to the shipped set, and AC-17 to the same set).
- Assumption: the component's `colorMode` values are `auto` (default) and `dark`, mirroring the website's G-4 wording; no forced `light`.
- Assumption: `size` also needs 80 and 128 (card corner 80, horizon 128 from 1920), because the app concept lists them; the `--lc-character-size` hook covers anything else.
- Assumption: delivering the files via `exports` or the copied `assets/` folder is the designer's call (AC-3 only requires one documented, tested stable path).
- Assumption: the horizon figure slot is a CSS class on a child element, like `.lc-horizon__land`, with no new component.
- Assumption: the Open Graph image and favicon items in G-4 are out of this request ("still open" in the concept).

## Open questions

None that block. (Headless run; every decision above is recorded as an assumption.)

## Resolution

Not applicable: the kit has nothing for it today.
