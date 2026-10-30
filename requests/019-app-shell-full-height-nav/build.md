# Build 019: App shell full-height nav, sidenav text brand, shell background, stat-trend sentiment

- **Branch:** `feat/3.14-app-shell-full-height-nav` (minor: optional inputs and hooks, defaults unchanged)
- **Commit:** one commit, amended after review r1 (code as of `1129403`; the last amend adds only the request documents), `feat(app-shell,sidenav,stat-trend): full-height nav, text brand, documented shell background, sentiment`

## Files changed

| File | Change |
|---|---|
| `app-shell/app-shell.component.{ts,scss}`, `.stories.ts`, `src/docs/colors.mdx` | `AppShellNavPlacement`, `navPlacement`, `--nav-full-height` grid in `@media (min-width: 1024px)`; hooks JSDoc and docs table; stories Full Height Nav, … Horizon, Tinted Background. **r2 (S1):** JSDoc, argType and docs say full-height expects a rail brand (header `showLogo` off, matching `logoSize`); the Horizon story has `brandName="Produkt"`, header `[showLogo]="false"` (`today()` got `headerAttrs`/`navAttrs`, empty = as before) |
| `sidenav/sidenav.component.{ts,html,scss}`, `_sidenav-docked.scss`, `sidenav-placeholder` | 6 inputs, brand link, collapse row, hooks, forced colours; theme values as private `--_lc-sidenav-t-*` on the host. **r2 (F1):** light host adds `--_lc-sidenav-t-accent: #208497`; all 8 `:focus-visible` outlines read `var(--_lc-sidenav-t-accent, var(--color-primary-500[, rgb(…)]))`, the bar default `var(--lc-sidenav-active-indicator, var(--_lc-sidenav-t-accent, var(--color-primary-500)))`; JSDoc l. 70, stories docs l. 185 |
| `sidenav/sidenav.stories.ts` | 4 text-brand stories. **r2 (N1):** `brandRail(attrs, width, frame)`; Collapsed Vs Expanded frames `overflow: visible; position: relative; z-index: 3/2/1` |
| `stat-trend/stat-trend.component.{ts,html,scss}`, `.stories.ts` | `sentiment`, `labels`, sr text, AA pills; stories Costs, Sentiment. **r2 (N2):** `@if (sentiment()) { {{ change() }}<span sr-only>…</span> } @else { {{ change() }} }` |
| specs | `app-shell.full-height`, `sidenav.brand`, `stat-trend.sentiment` (new), `i18n-labels` +2, `sidenav.app-shell` (deviation 1). **r2:** `sidenav.brand` +2 tests (8 outlines read the accent; only the light host sets it, 4.37 / 4.06), 2 assertions tightened (deviation 5); `stat-trend.sentiment`: default text node pinned untrimmed, N2 text pinned |
| `tools/compat/…` | `probe-314.ts`, `home.{ts,html}`, 3 `EXPECT_IN_HTML` checks. **r2:** the G4 check allows only comments between "+3,1 %" and the sr span |

## Acceptance criteria (measure modules `tmp/019/measure/*.mjs`, logs `tmp/019/*.log`, r2: `tmp/019/r2/`)

| AC | Covered by |
|---|---|
| 1, 9 | Jest pins default class / DOM. r2 hash compare vs `019/build` (45 stories × 6): 260 identical, 10 different, all explained below |
| 2, 3, 4, 11 | r1: `fh.log`, `fh2.log` (rects, sticky, hook 300 px, 360/768 unchanged); brand block 64 = header 64 |
| 5, 6 | Jest region/tab order; `fhh.log`. r2 `s1.log`: Horizon story nav 240 (280 at 1920), brand block 64, header x 240/280 h 64, **first item y 112** at 1024/1280/1920, no header logo |
| 7, 13, 20 | r2 `ring.log` (designer's `ring-measure.js`, as module `ring.mjs`), text-brand 1280: `theme="light"` rail ring 4.37, bar 4.06 on the light **and** the dark page; `theme="dark"` rail 4.44 / 3.98 (light page), 10.25 / 9.2 (dark page). Jest: accent only on the light host, every outline reads it, forced colours |
| 8 | compat 21.0, 21, 22.0, 22: PASS, 74 HTML checks each (G4 check stricter) |
| 10, 12 | Jest; r1 `brand.log`. r2 `n1b.log`: collapsed brand ("Finance Intelligence", 134.5 × 28) and item ("Dashboard") tooltips `:focus-visible`, no clipping ancestor, painted above the next rail (360/1280, L/D) |
| 14–19, 21, 22 | r1 logs; Jest (N2: pill text `↑ +3,1 %, gestiegen, ungünstig`; default `↑ +3.1% ` byte-identical); stories; gates below |

**Compare r2 vs `019/build`** (`tmp/story-shots/019/r2/build`): collapsed-rail-badges 360/1024/1280 D (F1: the light rail's bar and, at 360, the focused drawer close ring, #84c7d4 → #208497); sidebar-first-collapsed and -prominent-brand 1024/1280 L (1 px: x 1279 y 6, grey 109 → 110, the native scrollbar thumb's edge); sidebar-first-layout 1024/1280 D and with-badges 360 D (flaky: a reshoot of the same build gives other shots).
**Compare r2 vs `019/new`** (`…/r2/final`, 72 shots, 44 with a baseline): 26 identical, 18 different. Horizon 8 (S1); text-brand 360/1280 D (F1: left rail bar x 24–48 and the inset-shadow slivers at the item's right corners); Collapsed Vs Expanded 4 (N1: frame corners plus icon anti-aliasing once the rounded clip is gone, Δ ≤ 40); full-height-nav 3 and drawer-german 360 D (flaky: 21 px at the icon column x 17–38. full-height-nav 1280 L and 360 D differ between two shots of the same build, and the set changes from run to run; both rails are `theme="dark"`, whose values are unchanged).

## Gates

Jest, lint, build, `test:tools`, Storybook and shots ran on `1129403318c9be608877efffb1dea2a39415f990`. Compat ran on `c9fd0be` (the only later change is `sidenav.stories.ts`, which is not in the package).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 185 suites, 4412 passed, 8 skipped (r1: 4410) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (unchanged) |
| `npx nx run angular-ui-kit:build` | success, 121 "Built" lines |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | success, 920 stories |
| Story screenshots | `tmp/story-shots/019/r2/{final,build,ring,s1,n1-brand,n1-item}` |
| `check-angular-majors.mjs` (all four lines) | PASS on 21.0.9, 21.2.25, 22.0.8, 22.2.4; 74 HTML checks each |

## Deviations from the design

1. r1: `sidenav.app-shell.spec.ts` AS-4 (a) pins `var(--_lc-sidenav-t-active-fg, var(--color-on-surface-selected, var(--color-link)))`: stricter, same fallback.
2. r1: collapse row after `.lc-sidenav__content`; drawer `~ .lc-sidenav__nav` padding scoped to `--drawer`. 3. Drawer 280 at 360 (existing `max-width`), link 223 wide. 4. Brand frames 480 px high.
5. r2: in `sidenav.brand.spec.ts` (new in 3.14, unreleased) the brand-ring regex and the bar-default string now include `--_lc-sidenav-t-accent`, as F1 requires (stricter, same fallback).
6. r2 N1: `overflow: visible` alone was not enough. The next rail (24 px to the right) painted over the tooltip, so the frames also stack left over right (z-index 3/2/1). Story only.
7. r2 N2: an `@if`/`@else` with `{{ change() }}` in both branches. Moving only the span would have dropped the default text node's trailing space (" +3.1% "), so the default DOM would no longer match 3.13.
8. r2 S1, **for the designer:** I chose the text brand (`brandName="Produkt"`, letter tile), because `showLogo` makes the logo a collapse button (§2). The header keeps its title "Produkt" / "Unser Haushalt", so "Produkt" appears twice from 1024 px. At 360 the header has no logo, the same as Full Height Nav. Should the header title become the page title ("Heute")?

## Changelog draft

```
## [3.14.0] - <date>

A sidebar-first shell: `lc-app-shell navPlacement="full-height"` runs the side navigation from the top to the bottom of the viewport, `lc-sidenav` shows a text brand and a collapse button, the shell background hooks are documented, and `lc-stat-trend` colours a change by its meaning (G1–G4; finance-intelligence overview, docs/ux/gaps/app-shell-2026-10-30.md). No API breaks.

### Added

- **`lc-app-shell navPlacement`** (`'below-header'` | `'full-height'`, default `'below-header'`, G1). From 1024 px the nav is 240 × 900 at the top left (280 at 1920), stays at top 0 while the page scrolls, and the header starts beside it (x 240). Put the brand at the top of the rail (`lc-sidenav brandName` or `showLogo`, `logoSize` matching the header's `size`) and turn the header's logo off: the first item then sits at y 112, as below the header. The footer spans the full width with its content beside the nav; the horizon runs under a transparent nav. Below 1024 px both placements render the same (measured at 360 and 768); an empty nav falls back to one column. CSS only, holds in prerendered HTML.
- **`lc-sidenav` text brand** (G2): `brandName`, `brandIcon` (or the first letter), `brandHref` (default `routerLink="/"`), `brandAriaLabel`. One home link, 44 px high, a 32 px tile on the icon column, the name in at most two lines (German names at 240 px: two lines, no overflow); it never toggles. Collapsed: the tile, with the name as tooltip and accessible name. In the drawer it shares the 64 px block with the close button.
- **`lc-sidenav showCollapseToggle`** and **`expandAriaLabel`**: a 44 × 44 button at the bottom of a docked rail that collapses and expands it (labels `collapseAriaLabel` / `expandAriaLabel`, focus stays).
- Hooks `--lc-sidenav-brand-tile-bg`, `--lc-sidenav-brand-tile-fg` (default `--color-primary-fill` / `--color-on-primary`) and `--lc-sidenav-active-indicator` (default `--color-primary-500`; `#208497` on a `theme="light"` rail). A petrol rail (`--lc-sidenav-bg: var(--color-primary-fill-active)`) measures text 8.51, name 12.1, active item 6.21, tile 6.21, focus ring 3.02 / 6.97 (light / dark).
- **`lc-stat-trend sentiment`** (`'positive'` | `'negative'` | `'neutral'`, default unset) and **`labels`** (G4): the colour and the default sparkline follow the meaning, the arrow the direction ("Costs +3.1 %" negative = red). With a sentiment, screen readers hear "+3.1%, up, unfavourable" (German via `labels`: "+3,1 %, gestiegen, ungünstig").
- **Documented:** `--lc-app-shell-bg` (default `var(--color-background)`) and `--lc-app-shell-bg-image` (default `var(--app-background-image, none)`) in the JSDoc, the app-shell docs and Colors › Page sky, with the land gradient example (G3).
- Stories: Layout/App Shell "Full Height Nav", "Full Height Nav Horizon", "Tinted Background"; Navigation/Sidenav "Text Brand", "Text Brand Collapsed Vs Expanded", "Text Brand German", "Text Brand Drawer German"; Charts/Stat Trend "Costs", "Sentiment".

### Fixed

- **`lc-sidenav theme` no longer overrides the app's hooks.** `theme="dark"` plus `--lc-sidenav-bg` on `lc-sidenav` stayed #070e15; the theme values are now private host variables that every `--lc-sidenav-*` hook reads first. The collapsed-rail badge ring now follows `theme`.
- **A `theme="light"` sidenav keeps visible focus rings and current-item bar on a dark page.** They took the page's `--color-primary-500` (#84c7d4): ring 1.89:1 on the white rail, bar 1.76:1 on the current item. A light rail now uses #208497 on any page: ring 4.37:1, bar 4.06:1. `theme="dark"` and `"auto"` are unchanged (dark rail 4.44 / 3.98 on a light page, 10.25 / 9.2 on a dark one).
- **`lc-stat-trend` pills meet AA.** Up was 2.33:1 (light), down 1.98:1 (dark); now positive / up 4.85 · 6.25, negative / down 10.98 · 8.38, neutral 6.87 · 9.97 (light · dark).

### Compatibility

- No API breaks: every new input is optional and renders as before (Jest pins the default DOM, including the stat-trend text node). Of 270 screenshots of the shell, header, sidenav and stat-trend stories, only the stat-trend pills (42) and three collapsed-rail stories differ, as intended: the badge ring follows `theme`, and on a dark page the light rail's bar and focus ring are #208497.
- For a theme-stable brand colour use `--color-primary-fill*` and `--color-on-primary`: the `--color-primary-100…900` scale inverts in dark.
```
