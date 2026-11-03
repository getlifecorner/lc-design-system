# Design 045: Toast offsets in the app shell, reserved aside column, wide page content

- **Status:** ready
- **Spec:** [spec.md](spec.md), AC-1 … AC-20 · measured on main 7d0bd2b (3.27.2), logs in `tmp/story-shots/045/`

## 1. Approach

All three extend existing parts. Nothing is new except one internal service.

- **AS-34, how the values reach the outlet.** life-os puts `<lc-toast-outlet>` *after* `</lc-app-shell>` (`libs/ui/shell/src/shell.component.html:207`), so the outlet doesn't inherit any custom property from the shell. Moving it into the shell is out of scope, so the values travel through DI: a root service `OverlayInsetsService` in the existing `internal/overlay` entry, next to `OverlayStackService`. In the browser, the shell writes two CSS lengths there: the bottom edge of its header and the top edge of its bar. It already measures the bar with a ResizeObserver (AS-31). The outlet binds them as private custom properties on its host. Public hooks win over them. Each Storybook story is its own app with its own root injector, so stories on a docs page don't share values. Writing to `<html>` would leak between them.
- **No inputs on the outlet, only hooks.** Lengths with `env()` and `calc()`, set per breakpoint in the consumer's media queries, follow the `--lc-app-shell-*` / `--lc-app-page-*` pattern.
- **AS-34, why the bar and not the clearance.** The toast follows the bar's real top edge, not `--lc-app-shell-bottom-clearance`. The clearance is room for content and sits 22 px above the bar (memory 3.10.1). The concept (§5.3) asks for the toast 16 px above the bar, and the stack's existing 16 px padding gives exactly that gap.
- **AS-35** reuses the aside's column, tint, hairline, forced-colours rule and the shell's header-row paint (`:has(.lc-app-page__aside)`). The reserved column is an empty `<div>` with the aside's class, `aria-hidden`, and no landmark.
- **AS-36: `[page-wide]` opt-in.** `contentWidth="wide"` lays the page out like a page with a right column, leaves that column empty with no tint, and lets only children marked `[page-wide]` run over it (up to 928 px). The other children keep the standard column. This is the concept's rule 3: "a wide page keeps the page header and the next-step card in the standard column's width … so the title does not move". The concept's test checks that the header's width is identical on every page. If the whole content column widened, consumers couldn't do that, because CSS can't derive 568 / 648 px from inside a 928 px box. Prototyped: §3.
- **AS-36 with an aside that has content (AC-15): `wide` yields.** With a named aside, `wide` has no effect. The content stays in the standard column, and the aside keeps its content, tint and hairline. Hiding the aside's content would remove a landmark the page filled, and covering it would overlap. This also settles AC-13's "named aside" case: with a named aside the tint stays (§9, AC-13). For an empty column the page uses `reserveAside`.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| CSS hook | `--lc-toast-outlet-offset-top` | length | `0px`; with `lc-app-shell` in the app: the header's bottom edge (its height plus the top inset), or `env(safe-area-inset-top, 0px)` without a header | Space kept free above the `top-*` stacks. Set it on `lc-toast-outlet` or any ancestor (`:root`); it wins over the shell's value. A length: write `0px`, not `0`. |
| CSS hook | `--lc-toast-outlet-offset-bottom` | length | `0px`; with `lc-app-shell`: the shown bottom bar's top edge, measured from the viewport bottom (its `bottom` plus its height, inset included), or `env(safe-area-inset-bottom, 0px)` when no bar shows (from 1024 px) | Space kept free below the `bottom-*` stacks; same rules. |
| behaviour | stack height | — | — | Every stack is at most `100dvh − top − bottom` high and scrolls (`overflow-y: auto`, `overscroll-behavior: contain`), so a tall stack stays reachable. |
| input | `reserveAside` (lc-app-page) | `boolean` | `false` | Keeps the right column from 1280 px (360 · 400 · 460 px, `--lc-app-page-aside-width`) with its tint and hairline but no content and no landmark (`aria-hidden="true"`, no role), so pages without right-column content share one column with pages that have one. A named aside (`asideLabelledby` / `asideAriaLabel`) wins. Below 1280 px nothing shows. `@default false` |
| input | `contentWidth` (lc-app-page) | `AppPageContentWidth` | `'default'` | `'wide'`, from 1280 px: the page keeps the standard column of a page with a right column, the column stays empty and untinted, and `[page-wide]` children run over it, up to 928 px (or `contentMaxWidth` when it is not `880px`; `none` means the whole column). The other children keep the standard column. With a named aside, `'wide'` has no effect. Below 1280 px `'wide'` renders like `'default'`. `@default 'default'` |
| slot attr | `[page-wide]` | — | — | A child of the default slot (e.g. the table's wrapper) that runs over the right column's space on a `contentWidth="wide"` page from 1280 px. Elsewhere it is an ordinary child. |
| type | `AppPageContentWidth` | `'default' \| 'wide'` | — | exported from `app-shell/index.ts` |
| internal | `OverlayInsetsService` (`internal/overlay`) | `top`, `bottom`: `WritableSignal<string \| null>` | `null` | CSS lengths a fixed overlay keeps free; written by `lc-app-shell`, read by `lc-toast-outlet`. No semver guarantee. |

**Default rendering unchanged:**
- **Outlet:** without a shell the service is `null`, so the host gets no style attribute and the stacks compute `top: 0px` / `bottom: 0px`. `max-height: 100dvh` changes nothing unless a stack is taller than the screen.
- **lc-app-page:** without the new inputs, the classes, the inline style and the DOM are as in 3.27.2. Use a single `@if … @else if` chain, which keeps one comment anchor, and bind `[style.--_lc-app-page-wide-max]` to `null`.
- **lc-app-shell:** no DOM change; it only writes the service.

## 3. Anatomy and layout

### 360 px (life-os frame: `lc-header size="sm"`, floating bar, DE; story 360 × 640)

```
y   0 ┌ header 56 ───────────────────────────┐  offset-top = 56px (header box incl. top inset)
y  56 ├──────────────────────────────────────┤
y  72 │ ┌ top toast 328 (x 16) ─────────────┐ │  stack padding 16
      │ └───────────────────────────────────┘ │  h1 "Heute" at y 80 lies under it (see AC-3)
      │                …                      │
      │ ┌ bottom toast 328 ─────────────────┐ │
y 522 │ └───────────────────────────────────┘ │  gap 16 (stack padding)
y 538 │ ╭ floating bar 328 × 86 (DE, 2 lines) ╮│  offset-bottom = 16 + 86 = 102px (90 with 1-line labels)
y 624 │ ╰─────────────────────────────────────╯│  16 + env(safe-area-inset-bottom)
y 640 └──────────────────────────────────────┘
200 % text: header 177, bar 182 at y 442 → offset-bottom 198; stack box 177…442 = 265 px,
toast area 233; one DE toast at 200 % is 152–488 px (measured) → the stack scrolls.
```

### From 1280 px (page frame; 1024 px unchanged: one column, content x 288, w 688)

```
x 0      240  296               864  920            1280
┌ nav ───┬────┬──────────────────┬────┬──────────────┐
│ 240    │ 56 │ 568 standard col.│ 56 │ column 360   │  named aside or reserveAside: tint + hairline
├────────┼────┼──────────────────┴────┴───────┬──────┤
│ wide   │ 56 │ header, card: 568 (unchanged) │      │  contentWidth="wide": column empty, no tint
│        │    │ [page-wide] 928 ─────────────→ 1224 │ 56 │
└────────┴────┴───────────────────────────────┴──────┘
```

| Width | Standard column x / w (named, reserved, wide) | No column today | `[page-wide]` x / w / right | Column x / w |
|---|---|---|---|---|
| 1280 | 296 / 568 | 320 / 880 | 296 / 928 / 1224 | 920 / 360 |
| 1300 | 296 / 588 | 330 / 880 | 296 / 928 / 1224 (pad edge 1244) | 940 / 360 |
| 1440 | 320 / 648 | 404 / 880 | 320 / 928 / 1248 | 1040 / 400 |
| 1920 | 430 / 880 | 660 / 880 | 430 / 928 / 1358 | 1460 / 460 |

Measured on main (`probe.log`) and in the prototype (`proto-wide.log`: aside removed, `--aside` grid kept, child `width: min(928px, calc(100% + var(--_aside-width)))`). Document `scrollWidth` equals the viewport at all four widths, a 1,400 px table inside scrolls in its own region, and the header row's tint is `none`. The reserved prototype (`proto-reserved.log`: empty `div`, aside class) gives the named geometry at 1280/1920 (content 296/568, 430/880) and keeps the header tint.

| Element | Rule (developer sketch) |
|---|---|
| page classes | column = `hasAside \|\| reserveAside \|\| wide` → `lc-app-page--aside`; `wide && !hasAside` → `lc-app-page--wide`; reserved div only if `reserveAside && !hasAside && !wide` |
| template | `@if (hasAside()) { <aside …> } @else if (reserved()) { <div class="lc-app-page__aside lc-app-page__aside--reserved" aria-hidden="true"></div> }` with no whitespace inside |
| wide max | `wideMax()`: not wide → `null`; `contentMaxWidth() === '880px'` → `null` (CSS 928); `'none'` → `'100vw'`; else the value. Bound as `[style.--_lc-app-page-wide-max]` |
| `[page-wide]` (after the existing blocks) | `@media (min-width: 1280px) { :host ::ng-deep .lc-app-page--wide > .lc-app-page__main > .lc-app-page__content > [page-wide] { box-sizing: border-box; width: min(var(--_lc-app-page-wide-max, 928px), calc(100% + var(--_aside-width))); max-width: none; } }`. A definite width, so a host with `width: 100%` still widens; the clamp `100% + column` keeps the right padding |
| outlet stack | `@property --_lc-toast-outlet-top` / `-bottom` (`<length-percentage>`, `inherits: false`, `initial-value: 0px`; 038 pattern, so a bare `0` hook works). On the stack: `--_lc-toast-outlet-top: var(--lc-toast-outlet-offset-top, var(--_lc-toast-outlet-frame-top, 0px))`, the same for bottom; `top` / `bottom` read them; `max-height: calc(100vh − both)` then `calc(100dvh − both)`; `overflow-y: auto; overscroll-behavior: contain` |
| outlet host | `'[style.--_lc-toast-outlet-frame-top]': 'insets.top()'`, the same for bottom. Don't declare the public hooks anywhere (pitfall 020) |
| shell | add the header wrapper (`#headerSlot`) to the RO. Top = border-box height > 0 ? `${h}px` : `'env(safe-area-inset-top, 0px)'`. Bar = shown ? `${parseFloat(getComputedStyle(bar).bottom) + borderBoxHeight}px` : `'env(safe-area-inset-bottom, 0px)'`. Both `null` on destroy and without ResizeObserver |

## 4. States

| State | lc-app-page | lc-toast-outlet |
|---|---|---|
| default | as 3.27.2 | as 3.27.2 outside a shell; inside: 16 px below the header and 16 px above the bar |
| empty | reserved column: tint and hairline only, no text | empty stacks: invisible, `pointer-events: none` |
| loading / busy | `busy` unchanged; a wide page shows its skeleton in the standard column (concept: no jump when data arrives) | — |
| overflow | `[page-wide]` table: horizontal scroll inside its own region, never on the page; long DE headers wrap or scroll inside the table | stack taller than the room: scrolls; the newest toast stays at the edge (`column-reverse` scrolls from the end); Tab to an older toast's control scrolls it into view |
| named aside + wide | wide yields: standard column, aside with tint | — |
| hover, focus, active, disabled, error | no new interactive parts | toasts unchanged |

## 5. Theming

No new tokens and no colour changes. The reserved column uses the named aside's rules: tint `--color-background-low` → transparent (rgb(246,250,251) light / rgb(15,28,38) dark), hairline `--color-hairline` rgb(215,235,239) / rgba(132,199,212,.14). Against the page that is 1.23:1 light and 1.30:1 dark (WCAG formula, dark composited over rgb(10,18,27)). Both are decorative and carry no meaning or text, so 1.4.11 doesn't apply, and the values equal today's. The header row's part is painted by the shell as today. A wide page has no tint (no `.lc-app-page__aside` element). In forced colours the existing rule applies: no background, border-left `CanvasText`. The toast's colours are unchanged.

## 6. Accessibility

- **Landmarks:** the reserved `div` has `aria-hidden="true"`, no role, no name, no content and no tabindex. Exactly one `complementary` exists, and only when the page names one. DOM and tab order stay header → nav → main → aside → footer → bar, and the outlet stays where the app puts it.
- **2.4.11 / 1.4.4:** toasts never cover the bar's items or the header. A bottom stack ends 16 px above the bar, also at 200 % text, because the bar is measured.
- **AC-3 caveat:** a top toast at 360 px still covers an `h1` placed 24 px under the header (y 80 vs toast 72–150). The kit doesn't know where the title is, so the docs recommend `bottom-*` positions in the shell, as concept §5.3 does.
- **Scrolling stack:** a wheel or touch over a toast scrolls the stack (toasts are `pointer-events: auto`), and keyboard focus scrolls by itself. Known limit: toasts without any control in an overflowing stack can't be scrolled by keyboard. They are announced and close themselves (life-os: 3 s, no close button).
- **Wide table:** use sortable headers or rows as keyboard stops, so the scroll region has focusable content (axe `scrollable-region-focusable`). The kit's ring is unchanged.
- **Unchanged:** forced colours (existing rules), reduced motion (no new motion), live regions, 44 px targets (no new targets).

## 7. Texts

No built-in strings. The stories' German texts:

| Where | DE |
|---|---|
| toasts | „Link kopiert.“ · „Änderungen gespeichert.“ · „Die Verbindung zur Bank ist unterbrochen. Wir versuchen es gleich noch einmal.“ (warning) · „Konto konnte nicht geladen werden.“ (error, close) |
| outlet | `closeAriaLabel="Benachrichtigung schließen"` |
| wide page | page header „Konten“, subtitle „Alle Konten des Haushalts“ · table caption „Konten“ · columns „Kontoinhaberin oder Kontoinhaber“, „Kontobezeichnung“, „Kreditinstitut“, „Letzte Aktualisierung“, „Kontostand“ (end, tabular) · 8 rows, one holder „Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau“ |
| reserved page | Household, as *Content page* (h1 „Haushalt“, two placeholders), with `lang="de"` |

## 8. Stories

Stories with a new input get args with a `description` and `table.defaultValue`: `reserveAside` (boolean, `false`) and `contentWidth` (inline-radio, `'default'`), using the `StatePageStory` pattern. The meta's docs gain an `lc-app-page` paragraph, a hook row, and a toast paragraph covering the shell values, the hooks and "prefer `bottom-*` in the shell". `docs/app-shell.mdx` doesn't exist, so the docs for AC-19 are the stories' component description and the JSDoc.

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Toasts in the shell (phone, German) | `layout-app-shell--toasts-in-the-shell` | `textSize: '100%'`, mobile viewport | `signedIn()` frame + outlet after `</lc-app-shell>`; on init `top-center` „Link kopiert.“ and `bottom-center` „Änderungen gespeichert.“ (`duration: 0`, `showCloseButton: false`) |
| Toasts in the shell, large text (phone, German) | `layout-app-shell--toasts-in-the-shell-large-text` | `textSize: '200%'` | three `bottom-center` toasts (info, warning, error with close): the stack scrolls between header and bar |
| Offsets | `feedback-toast-outlet--offsets` | — | no shell; `--lc-toast-outlet-offset-top: 64px`, `-bottom: 90px` on the outlet; dashed fixed bands 64 / 90 px (`pointer-events: none`); one `top-right` and one `bottom-right` sticky toast on init |
| Reserved right column (desktop, Household) | `layout-app-shell--reserved-right-column` | `reserveAside: true` | empty column, same frame as *Today (desktop)* |
| Reserved and named right column | `layout-app-shell--reserved-and-named-right-column` | `reserveAside: true` + Today's named aside | the named aside wins (one landmark) |
| Wide page (desktop, accounts table, German) | `layout-app-shell--wide-page` | `reserveAside: true`, `contentWidth: 'wide'` | page header + next-step placeholder at 568; `<div page-wide>` with the table at 928; no tint |
| Wide page with a right column | `layout-app-shell--wide-page-with-right-column` | `contentWidth: 'wide'` + named members aside | wide yields: the table stays 568, the aside keeps its tint |

## 9. Verification

Baselines (main 7d0bd2b, measure = 800 ms wait):
- `045/baseline`: 234 shots, 19 app-shell + header stories at 360/1024/1280/1440/1920 L/D, and 11 toast/outlet stories at 360/1280 L/D, not `--full`. Expected **234/234 identical**.
- `045/baseline-open`: 8 shots, outlet *Default* + *Bottom Center* after clicking Success and Error, at 360/1280 L/D. Expected: toast rects identical (360: 16/16 and 16/94, 328 × 78; 1280: 896/16, 910/74), **raster-only differences allowed**. The overflow prototype gave 7/8 different, visually identical; a control without the CSS gave 8/8 identical.

| AC | How | Expected value |
|---|---|---|
| 1 | unit: outlet without shell → no host `style`; CSS contract (hook → frame → `0px` chain, `@property`); `baseline-open` re-shot | rects as listed |
| 2 | *Toasts in the shell* 360 measure; unit: stubbed bar `bottom: 50px` (inset 34) + border-box 86 | toast bottom ≤ bar top − 16 (522 vs 538); service `bottom` = `136px` |
| 3 | same story at 360 and 1280 | top toast y = header bottom + 16 (56 → 72) |
| 4 | unit (hooks win, `@default`s); *Offsets* at 360/1280 | top toast y 80; bottom toast bottom = vh − 106; in the shell from 1024: vh − 16 |
| 5 | large-text story, `--height=640` | stack 177…442, `scrollHeight > clientHeight`; `focus()` on the oldest close button changes `scrollTop` and puts it inside the stack; page `scrollWidth` 360 |
| 6 | L/D shots, `--forced-colors`, existing toast specs, compat prerender | stacks in the HTML, no host style |
| 7 | unit (class + div); reserved story at 1280/1440/1920 | column 920/360, 1040/400, 1460/460; content 296/568, 320/648, 430/880 |
| 8 | unit attrs; measure count within `lc-app-page` | 0 `aside` / `[role=complementary]`; div `aria-hidden="true"`, `tabIndex −1`, empty |
| 9 | reserved-and-named vs *Today (desktop)* at 1280; both at 1024 | identical rects, 1 `aside`; 1024: 288/688, column `display: none` |
| 10 | unit (default DOM = 3.27.2: classes, style attr, one anchor); `045/baseline` | 234/234 identical |
| 11 | reserved story L/D/FC | §5 values; FC: `background: none`, border `CanvasText` |
| 12 | unit, MCP manifest | `'default'` with `@default` |
| 13 | wide story at 1280/1300/1440/1920 | header/card = standard col.; `[page-wide]` per §3; header tint `none`; `scrollWidth` = vw. Named-aside case: see AC-15 (yields, tint stays) |
| 14 | wide story at 360/640/1024 | `[page-wide]` = siblings: 24/312, 32/576, 288/688 |
| 15 | *Wide page with a right column* at 1280/1920, DE | table 296/568 (1280) / 430/880; aside 920/360 with tint; DOM main → aside |
| 16 | unit `wideMax()` | default → no var; `'1000px'` → `1000px`; `'none'` → `100vw`; inline cap still `880px` |
| 17 | wide story L/D/FC; focus a sortable header at 1024 | kit ring visible; region scrolls to it |
| 18–20 | stories, docs, CHANGELOG; DE shots at 360/1280 | no clipped text; table scrolls only inside its wrapper |

**Pitfalls to watch:**
- `app-shell.component.spec` pins `.lc-app-shell:has(.lc-app-page__aside) > .lc-app-shell__header` and `max-width: var(--lc-app-page-content-max, 880px)`: leave both as they are.
- `app-page.padding.spec` reads the first blocks, so add new rules after them.
- Projected children need `:host ::ng-deep` (hero pattern).
- In docs, write `0px`, not `0` (Firefox < 128 has no `@property`).
- The toast's dark shadow (`0 14px 44px`) is clipped at the stack's padding box: computed ≤ 4 RGB levels.
