# Build 045: Toast offsets in the app shell, reserved aside column, wide page content

- **Branch:** `feat/3.28-toast-offsets-page-aside-width` (from `main` 7d0bd2b, 3.27.2)
- **Commit:** one commit `feat(app-shell): toast offsets in the shell, reserved right column, wide page (045)` (amended with the docs; gates on the code of `2bfae1f`)

## Files changed

| File | Change |
|---|---|
| `internal/overlay/overlay-insets.service.ts` (new), `index.ts` | `OverlayInsetsService` (root): `top`, `bottom` signals, `null` = no shell |
| `app-shell/app-shell.component.{ts,html}` | `#headerSlot`; in the browser writes the service: header border box (own RO), bar `bottom` + border box (existing RO); insets until measured; `null` on destroy / without RO. JSDoc paragraph |
| `toast/toast-outlet.component.{ts,scss}` | host binds `--_lc-toast-outlet-frame-top/-bottom`; `@property` `--_lc-toast-outlet-top/-bottom`; hook → frame → `0px`; stack `max-height` 100vh/100dvh − both, `overflow-y: auto`, `overscroll-behavior: contain`. JSDoc with both hooks |
| `app-shell/app-page.component.{ts,html,scss}` | `reserveAside`, `contentWidth`, `AppPageContentWidth`; `wide`/`reserved`/`wideMax` computeds; reserved `div`; `[page-wide]` rule (after the existing blocks) |
| `app-shell/app-shell.stories.ts`, `toast/toast-outlet.stories.ts` | the 7 stories of design §8, `lc-story-toasts` helper, meta docs (page paragraph, toast paragraph + hook table, outlet item 7) |
| specs (new) | `app-page.width.spec.ts` (15), `app-shell.toast-offsets.spec.ts` (7), `toast-outlet.offsets.spec.ts` (7) |
| `tools/compat/…` | `probe-328.ts` (reserved + wide page), `home.{ts,html}`, 2 `EXPECT_IN_HTML` checks (tt outlet, home pages) |

## Acceptance criteria

| AC | Covered by | Measured |
|---|---|---|
| 1 | outlet spec (no host style, CSS chain); `baseline-open` re-shot | rects = baseline: 360 16/16, 16/94 (328 × 78); bottom-center 806/728; 1280 896/16, 910/74 |
| 2 | shell spec (bar `bottom: 50px` + border box 86 → `136px`); *Toasts in the shell* 360 | bar y 538 h 86 → offset 102; bottom toast ends 522 (16 above) |
| 3 | shell spec (header border box → top); same story 360/1024/1280 | top toast y 72 = header 56 + 16; h1 y 80 under it (design §6 caveat) |
| 4 | outlet spec (hooks win, declared nowhere, `@property`, JSDoc defaults); *Offsets* 360/1280 | top toast y 80; bottom toast ends 794 = vh 900 − 106; shell ≥ 1024: ends vh − 16 |
| 5 | *… large text* 360 × 640, focus probe | stack 176.98…442 (265), sh 814 > ch 265; focus close → scrollTop 0 → −496, button inside, page scrollWidth 360 |
| 6 | existing toast specs green; L/D shots; compat check (tt) | prerendered: 6 stacks, no host style, chain + `@property` in the page CSS |
| 7 | page spec (class, div); *Reserved right column* | column 920/360, 1040/400, 1460/460; content 296/568, 320/648, 430/880 |
| 8 | page spec (attrs, `tabIndex −1`, no aside/complementary); compat | div `aria-hidden="true"`, no role, 0 children; the page adds 0 landmarks |
| 9 | page spec; *Reserved and named* vs designer's proto on *Today (desktop)* | 1280: content 296 120 568, aside 920 64 360 501.5 (identical); 1024: 288/688, column `display: none` |
| 10 | page spec pins the 3.27.2 DOM; old-vs-new render proof; `baseline` | 4/4 unnamed input sets byte-identical (one anchor); 230/234 at-rest shots identical (see Gates) |
| 11 | reserved story L/D/`--forced-colors` | tint rgb(246,250,251) / rgb(15,28,38), hairline rgb(215,235,239) / rgba(132,199,212,.14); FC: `none`, border-image none, CanvasText |
| 12 | page spec (`@default 'default'`, union type) | — |
| 13 | *Wide page* 1280/1300/1440/1920 + spec (rule) | `[page-wide]` 296/928→1224, 296/928→1224, 320/928→1248, 430/928→1358; header/card 568/588/648/880; header tint `none`; scrollWidth = vw |
| 14 | *Wide page* 360/640/1024 | `[page-wide]` = siblings: 24/312, 32/576, 288/688 |
| 15 | *Wide page with a right column* 1280/1920 + spec (yields, DOM order) | table 296/568, 430/880; aside 920/360 with tint |
| 16 | page spec (`wideMax`: 880px → none, 1000px, 60rem, none → 100vw; cap unchanged) | — |
| 17 | *Wide page* kbd probe 1024/1280 L/D; FC shots | last sortable `th` focused: 2 px inset ring (rgb(32,132,151) L, rgb(132,199,212) D), region scrolls 0 → 431 / 191, page scrollX 0 |
| 18–20 | stories with argTypes (description + default); docs; DE stories 360/1280 | axe: 0 violations in 28 shots (7 stories × 360/1280 × L/D) |

## Gates

All gates ran on the code of `2bfae1fda81468f68a2a2e3be10635d2729ccca7` (`git diff --quiet 2bfae1f -- libs tools` holds for the amended commit).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 234 suites, 5513 passed, 8 skipped (`--runInBand`; +3 suites, +29 tests; no existing assertion changed) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | 122 "Built" lines |
| `npm run test:tools` | 22/22 |
| `npx nx run angular-ui-kit:build-storybook` | 1041 stories (+7) |
| Story screenshots | at rest vs `045/baseline`: 230/234 identical; the 4 different are `full-height-nav` 1024 L, 1280 L/D, 1920 D, each 21 px at x 17–21, 34–38 (the known sidenav icon noise). Opened vs `baseline-open`: rects identical, 7/8 raster-different (max Δ 8), and 8/8 hash-identical to the designer's overflow prototype (`proto-open`). New: `tmp/story-shots/045/build-{toasts,toasts-rest,page,page-extra,kbd,forced}/` + logs (`build-toasts/…large-text…` is after the focus probe, scrolled to the close button; at rest: `build-toasts-rest/`; `build-kbd/` keeps the header focus) |
| `check-angular-majors.mjs --only=22` | PASS, 97 HTML checks (2 new) |
| Measure modules | `tmp/045/measure/m.mjs` (modes `wait`, `open`, `frame`, `focus`, `kbd`), `diff.mjs`; copy to `dist/storybook/angular-ui-kit/zz-045/` |

## Deviations from the design

| # | What | Why |
|---|---|---|
| 1 | `@if (hasAside() \|\| reserved()) { @if (hasAside()) {aside} @else {div} }` instead of `@if … @else if` | the chain renders 2 comment anchors (measured), so AC-10's "one anchor" fails. Nested: every page without a named aside is byte-identical to 3.27.2; a named aside gains 2 comment nodes (3 vs 1), elements and attributes identical (8/8 with comments stripped). **Needs the designer's agreement** |
| 2 | compiled `width: min(var(--_lc-app-page-wide-max, 928px), 100% + var(--_aside-width))` | Sass drops `calc()` inside `min()`; same value, geometry as §3 |
| 3 | stories: table caption hidden (`[showCaption]="false"`, the page header shows „Konten“); toast stories render in their own frame on the docs page (`docs.story.inline: false`); bands in *Offsets* labelled with the hook; account page nav = the five life-os destinations, „Finanzen“ active | unspecified details |
| 4 | centred toasts at 360 are content-wide (152 / 237 px), not 328 as sketched | the toast's own width for short messages, unchanged (out of scope) |

## Changelog draft

```md
## [3.28.0] - 2026-11-03

Toasts clear the app shell's header and floating bar, every page can keep the same right column, and one page can run a table over it (life-os app shell round 11: AS-34, AS-35, AS-36). New optional inputs and CSS hooks; no API breaks.

### Added

- **Toasts in `lc-app-shell`** (AS-34, life-os shell; WCAG 2.4.11, 1.4.4): the shell tells `lc-toast-outlet` where its header ends and where the shown bar starts, also when the outlet sits after `</lc-app-shell>`. At 360 × 640 with the German floating bar: a top toast starts at y 72 (header 56 + 16), a bottom toast ends at y 522, 16 px above the bar (538); from 1024 px, with the bar hidden, 16 px above the bottom inset. At 200 % text the stack stays between header (177) and bar (442) and scrolls (814 px of toasts in 265 px); Tab to a close button scrolls it into view. In the shell, prefer `bottom-*`: a top toast can still cover a title right under the header. Stories *Toasts in the shell*, *… large text*.
- **`--lc-toast-outlet-offset-top` / `-bottom`** (default `0px`): the space kept free above the top and below the bottom stacks; on `lc-toast-outlet` or any ancestor, they win over the shell's values. Write lengths (`0px`). Story *Offsets* (64 / 90 px: toasts at y 80 and ending at vh − 106).
- **`lc-app-page` `reserveAside`** (AS-35, life-os "one frame for every page"): keeps the right column from 1280 px on a page with nothing for it: width (360 · 400 · 460 px), tint and hairline, also behind the header, as an empty `<div aria-hidden="true">` with no role and no landmark. Content sits where a page with a named aside has it: 296 / 568 px at 1280, 320 / 648 at 1440, 430 / 880 at 1920. A named aside wins. Story *Reserved right column*.
- **`lc-app-page` `contentWidth="wide"` and `[page-wide]`** (AS-36, life-os account page; type `AppPageContentWidth`): from 1280 px the page keeps the standard column of a page with a right column, leaves the column empty and untinted, and lets `[page-wide]` children run over it, up to 928 px: 296 → 1224 px at 1280, 320 → 1248 at 1440, 430 → 1358 at 1920, while the page header and the next-step card stay at 568 / 648 / 880. No page scroll; a wider table scrolls in its own region. `contentMaxWidth` other than `880px` caps it instead. Next to a named aside, and below 1280 px, it renders like `'default'`. Stories *Wide page*, *Wide page with a right column*.

### Compatibility

- New optional inputs, type, slot attribute and CSS hooks only. Defaults render as in 3.27.2: an outlet outside a shell has no style attribute and its stacks sit at `0px`; a page without the new inputs has 3.27.2's DOM. A page with a named aside gains two comment nodes (Angular's control-flow anchors), nothing else. At rest, 230 of 234 shots of the app-shell, header and toast stories are hash-identical (the 4 others: the known 21 px sidenav icon noise); opened toasts sit at the same positions.
- Every toast stack is now a scroll container (`max-height: 100dvh` minus the offsets, `overflow-y: auto`): a stack that fits never scrolls, but its toasts' pixels rasterise slightly differently (≤ 8 RGB levels) and the dark shadow ends at the stack's 16 px padding.
- The shell measures in the browser only; prerendered HTML keeps the `0px` offsets until it hydrates. Checked on Angular 22 (AOT, strictTemplates, prerender).
```
