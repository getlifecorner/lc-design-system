# Build 066: description-list item icon, accordion nested open state, timeline horizontal overflow

- **Branch:** `feat/3.46-description-icon-accordion-timeline`
- **Commit:** see `git log -1` (one commit, amended after review rounds)

## Files changed

| File | Change |
|---|---|
| `description-list.component.{ts,html,scss}` | `DescriptionListItem.icon` (JSDoc, `@default undefined`); imports `IconComponent`; icon branch inside the badge branch (D-2), the dd suffix block `&& !item.icon`; 3 rules before `.lc-dl__sep` (§3). **r2:** D-6 (3 `.lc-dl--rows` rules) and D-7 (`lc-dl__value--icon` basis) in the same section; `valueClass` appends `lc-dl__value--icon` for icon items; comments „kosten row 3“ (F-4) |
| `description-list.icon.spec.ts` (new, 30) · `.wrap.spec.ts` | AC-1…6; r2: +3 tests (D-6/D-7 rules, placement, weights, scope). Wrap spec: `lc-dl__icon` in the allowed appended selectors (Deviation 3) |
| `accordion.component.scss` | 26 rules + reduced-motion list + forced-colours rule → child chains with `:where()` (§3 map); declarations, weights and order unchanged |
| `accordion.plain.spec.ts` · `accordion.nested.spec.ts` (new, 24) | pins per §9 (new length/sha 4279 `d5516c4…`, plus: chains undone = the 3.22.4 3873 `ad61524…`); AC-7…9, 11 |
| `timeline.component.{ts,html,scss}` | `scrollLabel` input; `overflowing`/`scrollable` signals; `afterRenderEffect` + one ResizeObserver (list + items); `ol #list [attr.tabindex] [attr.aria-label]`; `.timeline--scroll` focus ring + forced colours; horizontal header `justify-content: center` |
| `timeline.scroll.spec.ts` (new, 13) | AC-12…15 with a fake ResizeObserver and stubbed widths |
| stories: dl, accordion, timeline | *Item Icons* (r2: wording per F-3, 156 px `rows` + `stacked` cards side by side), *Verschachtelt*, *Nested Variants*, *Horizontal, German* (r2: `controls.include` per F-5); `scrollLabel` argType; `items` description; meta bullets |
| `tools/compat`: `probe-336.ts`, `probe-346.ts` (new), `home.{ts,html}`, `check-angular-majors.mjs` | dl icon item; horizontal timeline; 2 `EXPECT_IN_HTML` checks |

## Acceptance criteria

| AC | Covered by | Measured |
|---|---|---|
| AC-1 | icon spec: 5 dd strings of 3.45 (anchors kept) + badge dd; r2 spec: a non-icon dd keeps its class string; temp proof `tmp/066/zz-066-dl-old-new.spec.ts.txt` | identical; 96/96 dl baseline shots (r1). r2 rules need `.lc-dl__icon-row`/`lc-dl__value--icon`, which only icon items render |
| AC-2 | icon spec; r2 `tmp/story-shots/066/r2-build.log` (`tmp/066/measure/r1.mjs`, glyph Range rects) | **glyph gap 4.0 on 150/150 icon rows** (25 per shot × 360/1024/1280 × L/D); centre − line-1 centre −0.3…0.9; 14×14 md, 12×12 sm; ink = dd ink 150/150. Rows = §9 r1 exactly: 360/1024 `59/38/38.5/38/59/62 · 62/62/62.5/62/62/66 · 45/27/27/27/45/30 · 66/45/69 · 101/79`, 1280 `sm` `…/45/48`; new 156 `stacked` 104/83. Total „+12.400,00 €“ one line at all widths (rows md and clickable dd 112.3) |
| AC-3 | icon spec: host + svg `aria-hidden`, 5 shapes same dd text and tab-stop count | — |
| AC-4 | icon spec: badge order, href (`closest('a')` null), datetime + suffix, total, clickable (ids + names equal) | — |
| AC-5 | r2 *Item Icons* 360 L/D; compat | icon top − line-1 top −2.3…−0.6 (≤ 4), glyph gap 4.0 on every row; forced colours svg = dd (r1 `build-fc`, ink rules unchanged); compat ok |
| AC-6 | icon spec: unknown name renders, no throw; axe ×3 | 0 violations; r2 story axe 0 (6 shots) |
| AC-7 | nested spec (5 configs × 3 states, descendant-space guard); measure | closed children: panel 0, body 0/0 hidden, chevron `none`, head padding 10/14/18, order −1/0 |
| AC-8 | nested spec ×2; `measure-acc8.log` | child 0 → 60 → 0 px, parent 309.6 → 369.6 → 309.6 |
| AC-9, AC-11 | nested spec (open-state matches, Tab order, `aria-expanded`, axe ×3) | 0 violations; story axe 0 |
| AC-10 | `--compare` 18 accordion stories | 108/108 identical |
| AC-12…15 | scroll spec; *Horizontal, German* | as review r1; r2: *Horizontal, German* 6/6 byte-identical to `build-new` (`r2-tl.log`) |
| AC-16 | `--compare` 264 shots (r1) | 254 identical, 10 = §9's list |

## Gates

All gates ran on commit `4eb369abccf640664dd2c22917e4087dcf4c649e` (WIP; the amended commit has the same `libs`/`tools`; later agents skip a gate while `git diff --quiet 4eb369a -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 355 suites, 7038 passed, 8 skipped (+3 in r2; `button.inverse-outline` hit a worker SIGSEGV in the full run, 12/12 alone) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 160 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | ok, 127 entries |
| `npm run test:tools` | tools unchanged since r1 (22/22 on `8befc11`) |
| `npx nx run angular-ui-kit:build-storybook` | ok (`--skip-nx-cache`) |
| Story screenshots | r2: `tmp/story-shots/066/r2-build/` (*Item Icons* 360/1024/1280 L/D, `--axe` 0), full page `r2-build-full/`; `r2-tl/` (6/6 identical) |
| `check-angular-majors.mjs --only=22` | PASS, 132 checks (`tmp/066/r1/compat.log`) |

## Deviations from the design

1. r1 Deviations 1 and 2 are closed by D-6/D-7 (review r1). The two className assertions in `description-list.icon.spec.ts` (rows · md AC-2, total AC-4) now include `lc-dl__value--icon`; both pinned this request's own unreleased output, and jsdom lists `[class]` classes sorted.
2. `description-list.wrap.spec.ts`: `lc-dl__icon` in the allowed appended selectors (accepted r1).
3. AC-8 open child panel 60 px (§9: 52.4; one-line lg body; accepted r1).
4. Size: the dl entry imports the icon entry (accepted r1).

## Changelog draft

### Added
- **`DescriptionListItem.icon`** (finance-intelligence kosten-2026-11-17 row 3, budget page): a kit icon before an item's value, decorative (`aria-hidden`), in the value's colour and at its text size (14 px in `md`, 12 px in `sm`), centred on the first line within 0.9 px and 4 px before its first glyph, never alone on a line. In `rows` a wrapped value stays right-aligned with the icon before line 1, and the icon counts toward the value's share (`min(100%, 7em + 4 px)` instead of 6em), so „+12.400,00 €“ stays on one line at 1280 px; in `stacked` the lines hang after the icon. It stays outside a link, before a badge, works with `datetime`, `valueSuffix`, `total` and `clickable` (the row's name is unchanged). Forced colours draw it in the text colour. Without `icon` the list renders exactly as before.
- **`lc-timeline` `scrollLabel`** (`'Timeline'`; follow-up 065-s1, WCAG 2.1.1): a horizontal timeline without `selectable` that is wider than its box becomes a tab stop named `scrollLabel` that the arrow keys scroll, with a 2 px focus ring 2 px outside (Highlight in forced colours). 360 px, four items: 512 px in 328, axe `scrollable-region-focusable` 0 violations. Measured live (ResizeObserver); while it fits, on the server, vertical and `selectable`: nothing is added.

### Fixed
- `lc-accordion` in the body of another one (kosten-2026-11-17 row 4, since 3.41.0) took the parent's open state, size and chevron side: a closed child showed a 36 px body and an upturned chevron. Each accordion now styles only its own parts (child selectors; weights unchanged). Non-nested accordions are pixel-identical (108/108 shots).

### Compatibility
- `@lifecorner/angular-ui-kit/description-list` now imports `@lifecorner/angular-ui-kit/icon`; an item with `icon` needs `HttpClient`, as any `lc-icon`. A value with `icon` carries the class `lc-dl__value--icon`.
- Horizontal timelines centre each title over its marker (065-n1; was 173.7 vs 192 px on item 2 at 1280 px); a header with `meta` still spreads.
- No API breaks.
