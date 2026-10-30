# Spec 019: App shell full-height nav, sidenav text brand, shell background, stat-trend sentiment

- **Status:** ready
- **Type:** extension of `lc-app-shell`, `lc-sidenav`, `lc-stat-trend` (rows 1, 2, 4); docs only (row 3)
- **Affected:** `lib/app-shell/` (ts, html, scss, stories, spec), `lib/sidenav/` (ts, html, scss, stories, spec), `lib/stat-trend/` (ts, html, scss, stories, spec), `src/docs/full-height-layouts.mdx` or a new app-shell page, `CHANGELOG.md`, both READMEs only if a component list changes (none does)
- **Semver impact:** minor. Four optional inputs and new optional CSS hooks; every default renders as before.

Sources: `finance-intelligence/docs/ux/gaps/app-shell-2026-10-30.md` (rows 1–4; the concept file is German and only the gap table was needed). Rows are numbered G1–G4 below.

## Need

Finance Intelligence (IT finance controlling) wants a petrol navigation column over the full height with the product brand at its top, a tinted page background and white elevated cards.

1. **G1.** From 1024 px `[shell-header]` spans the whole width (grid areas `header header / nav body`), so `[shell-nav]` always starts below the header. A sidebar-first shell is impossible. Today they use the header across the full width, with the nav below it.
2. **G2.** `lc-sidenav` has only an image logo (`logo…Src`, an `lc-logo` inside a collapse button). There is no icon tile plus product name. Today the name stays in `lc-header` with `showLogo=false`.
3. **G3.** `--lc-app-shell-bg` and `--lc-app-shell-bg-image` exist in `app-shell.component.scss` (only in a code comment) but are not in the docs, so the app can't rely on them.
4. **G4.** `lc-stat-trend` colours the change by `direction` (up = green, down = red). For costs a rise is bad, so "Costs +3.1 %" shows a misleading green.

## What the kit has today

| Gap | Existing | Why it falls short |
|---|---|---|
| G1 | `lc-app-shell` has only input `horizon`; `[shell-nav]` is sticky `top:0`, `max-height:100dvh`, with a 240/248/280 px column (`--lc-app-shell-nav-width`) | The grid fixes the header over both columns |
| G2 | `showLogo`, `logoSrc`, `logoEmblemSrc`, `logoSize` (md = 64 px, matches `lc-header size="md"`), `collapsed` state and the collapse toggle | Images only. The logo button *toggles collapse*, so a home link needs its own interaction rule |
| G3 | Both variables are used in the SCSS with fallbacks `--color-background` and `--app-background-image` | Not documented, no story. `--color-land-1..3` already exist as tokens |
| G4 | `direction` drives the arrow, the colour class and the default sparkline colour | No input to decouple the colour from the direction |

## Scope

- In: G1–G4 as above; a CHANGELOG entry that names the finance-intelligence page.
- Not in: a themed petrol palette (the consumer supplies it with the sidenav hooks and tokens); a header redesign; a change of the 1024 px breakpoint; a new dependency; routing logic for the brand link beyond a plain `href` or `routerLink`.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | New optional input `navPlacement` on `lc-app-shell` (`'below-header' \| 'full-height'`, JSDoc `@default 'below-header'`). With the default, the DOM, classes and computed layout are identical to 3.13.1 | unit test (classes) plus story-shots hash compare with the existing shell stories at 360/1024/1280 |
| AC-2 | `full-height` at ≥ 1024 px: the nav column starts at y=0 and spans the viewport height; it stays sticky while the document scrolls (nav top = 0 after scrolling 800 px); the header sits right of the nav in the body column and scrolls away as before | story + `--measure` at 1024, 1280, 1920 (nav rect top/height, header left = nav right) |
| AC-3 | `full-height` below 1024 px renders exactly as `below-header` (bottom bar, no nav) | hash compare at 360 and 768 px |
| AC-4 | With `full-height` the nav width follows `--lc-app-shell-nav-width` and the 240/248/280 px steps. An empty `[shell-nav]` falls back to the one-column layout. Safe-area insets are applied once (nav takes the left inset, header does not double it) | measure + unit/story with empty nav |
| AC-5 | Landmark order and keyboard order stay correct with `full-height`: the DOM and tab order are decided in design.md (the skip link, header, nav and main are reachable, and visual order matches reading order or the difference is documented). Exactly one `header`, one `nav` and one `main` landmark are exposed | unit test on the rendered DOM plus a keyboard walk in the story |
| AC-6 | `horizon` and the `[shell-footer]` row, the 1280 px right-column band behind the header (`.lc-app-page__aside`) and the bottom bar keep working with `full-height` (footer and horizon either span all columns or are placed per design.md, with no seam and no overlap with the nav) | stories at 1280 and 1920, light and dark |
| AC-7 | A story "full-height nav" uses `lc-sidenav theme="dark"` with the sidenav hooks (`--lc-sidenav-*`) set to a petrol look and the `--lc-app-shell-bg*` tint. Text and active-item contrast in it is computed ≥ 4.5:1 | story + contrast values in review |
| AC-8 | Prerendered HTML: the full-height layout comes from CSS only, so it holds before JavaScript (no input-dependent JS layout) | compat prerender (`EXPECT_IN_HTML` adds the class for a `full-height` shell, if the compat app uses one) or a SSR spec |
| AC-9 | `lc-sidenav` gets optional `brandName` (string, default `''`), `brandIcon` (Tabler icon name, default `''`), `brandHref` or an equivalent link target (name decided in design.md; must work with a plain `href` and with the consumer's router), and `brandAriaLabel`. All have JSDoc `@default`. With `brandName` and `brandIcon` empty, the sidenav renders exactly as before | unit test (default DOM unchanged) |
| AC-10 | The brand renders as one link element: the icon tile has `aria-hidden="true"`, the name is text, and the accessible name is `brandAriaLabel` or the name. The link is ≥ 44 px high and its width never falls below 44 px | unit test (DOM, aria) + measure of the link rect |
| AC-11 | The brand block's height equals the `lc-header` `size` scale: with the default `logoSize` it measures 64 px, matching `lc-header size="md"`, and next to a header at the same size the baselines line up (full-height story) | measure at 1280 (brand rect height = header height) |
| AC-12 | Collapsed rail (`collapsed`) shows only the tile (name visually hidden or not rendered, accessible name kept). The relation to the collapse toggle (`lc-sidenav__logo-toggle`) is defined in design.md. The toggle stays keyboard-reachable and the link never becomes a button | unit test + story collapsed |
| AC-13 | Brand colours only from tokens and sidenav hooks, including a new documented `--lc-sidenav-brand-tile-bg` (and fg if needed) with documented defaults. Works in light and dark, `forced-colors` (visible tile and focus), and `:focus-visible` is visible with ≥ 3:1 | story light/dark/forced-colors; contrast values |
| AC-14 | A German story shows a long brand name (for example "Finanz-Controlling Cockpit") at 360 px in the drawer and 240 px docked. The name truncates with an ellipsis or wraps without overflow, and the full name stays available (title or accessible name). No horizontal scroll | story `de` + measure (scrollWidth ≤ clientWidth) |
| AC-15 | `--lc-app-shell-bg` and `--lc-app-shell-bg-image` are documented as public hooks of `lc-app-shell`: in the component JSDoc (so the MCP shows them), in a docs page with their defaults (`--color-background`, `--app-background-image`), and in a story with the example gradient `linear-gradient(to bottom, var(--color-land-1), var(--color-land-2), var(--color-land-3))`. Behaviour of the code is unchanged | docs page, story, `get_components` manifest text |
| AC-16 | The documented tint keeps working with `horizon` on (the land stays painted over it as today) and with the bottom bar at 360 px. Verified in light and dark | story-shots, hash compare of the existing shell stories unchanged |
| AC-17 | `lc-stat-trend` gets optional `sentiment: 'positive' \| 'negative' \| 'neutral' \| undefined` (JSDoc `@default undefined`; exported union type). If unset, the colour class and sparkline colour are derived from `direction` exactly as today | unit test (default unchanged, all three direction values) |
| AC-18 | With `direction="up" sentiment="negative"`: the arrow stays ↑, the change text and the default sparkline colour use the negative (error) colours; `positive` uses success, `neutral` uses the neutral colours. An explicit `sparklineColor` still wins | unit test + story "Costs" |
| AC-19 | The meaning is not carried by colour alone (WCAG 1.4.1) and a screen reader hears it: the arrow glyph stays, and the change carries a text alternative that includes direction and sentiment (for example visually hidden text), localised through a `locale`/label input with English defaults and German checked. The decorative arrow is `aria-hidden` if the text covers it | unit test (DOM text) + German story |
| AC-20 | Colours for all three sentiments in light and dark meet 4.5:1 on the card surface | computed contrast in review |
| AC-21 | Storybook stories for every new input or slot variant (G1: full-height; G2: brand, collapsed, DE; G3: tint; G4: costs), each argType with `description` and `table.defaultValue`. The MCP manifest picks up the new inputs | story review, `npm run test:tools` |
| AC-22 | No existing assertion changes; the full test suite, lint, the build and the compat check (Angular 21 and 22, strictTemplates) pass | gates in build.md |

Always covered unless not applicable: 360 px and desktop widths (AC-3, AC-14) · light and dark (AC-7, AC-13, AC-20) · keyboard and screen reader (AC-5, AC-10, AC-12, AC-19) · EN and DE (AC-14, AC-19) · prerendered HTML (AC-8) · unchanged defaults (AC-1, AC-9, AC-17).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break. Input names above are working names; the designer may rename them (one consistent family).
- Breakpoints stay fixed in CSS (1024/1440/1920 px).

## Assumptions

- Assumption: all four rows ship in one minor release, since they serve one page. The designer may split the stories but not the release.
- Assumption: row 3 needs no behaviour change, only documentation and a story. If the CSS fallback chain turns out not to work with `horizon`, that becomes a bug fix inside this request.
- Assumption: "home link" supports a plain `href` and a router link without a router dependency in the kit (as other kit components do; the designer checks how `lc-header` or `lc-breadcrumb` solve it).
- Assumption: `sentiment` affects the change text and the default sparkline colour, not the arrow direction.
- Assumption: the "petrol" colours are the consumer's own token overrides; the kit adds no new palette.
- Assumption: the brand block applies to docked and drawer modes alike; the collapsed state only exists docked.

## Open questions

None that block the design. For design.md to decide: the DOM and tab order for `full-height` (AC-5), the brand link versus the collapse toggle (AC-12), and the input names.

## Resolution

Not applicable: the kit does not cover this.
