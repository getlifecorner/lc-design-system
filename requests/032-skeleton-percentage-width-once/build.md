# Build 032: lc-skeleton applies a percentage width twice

- **Branch:** `fix/3.22.2-skeleton-percentage-width-once`
- **Commit:** `9508977` (first; amended with this file), fix(skeleton): apply a percentage width once, on the host

## Files changed

| File | Change |
|---|---|
| `skeleton/skeleton.component.ts` | fill `styles()` width always `'100%'`; `hostWidth()` = `width() ?? variant default`; defaults moved to a module `SKELETON_DEFAULTS`; host comment; JSDoc per design §2 (`@default` on all 4 inputs) |
| `skeleton/skeleton.component.spec.ts` | AC-3: inner `box().style.width` `'40px'` (l. 31) and `'120px'` (l. 47) → `'100%'` (l. 22 was already `'100%'`); host assertions unchanged |
| `skeleton/skeleton.height.spec.ts` | circle row of the AC-17 table: fill `width` `'40px'` → `'100%'` (see Deviations) |
| `skeleton/skeleton.width.spec.ts` (new) | AC-2 matrix (10 cases), AC-7 (2), AC-8 serialised `style` attributes, default markup pinned for line/rect/circle (3) |
| `skeleton/skeleton.stories.ts` | new *Percentage widths* (§3, §8); *Table Rows Loading* rows `gap: 16px` → `justify-content: space-between`; argTypes `table.defaultValue` ×4, `width` description; docs paragraph **Width (3.22.2)** |
| `app-shell/app-shell.stories.ts` | `todayLoadingTemplate` HTML comment only (§8) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | measure: text-block (400 px block) 70 % = 280, 45 % = 180 host and fill at 1024; percentage-widths row A 267.59 / 133.8 of 446 (ratio 0.6000 / 0.3000) |
| AC-2 | `skeleton.width.spec.ts` (host `30%`, `60%`, `120px`, `12rem`, `calc(100% - 2rem)`, `45%`, `40px`, defaults `100%`/`100%`/`40px`; fill `100%` each); measure: all 10 skeleton stories × 360/1024/1280 × light/dark, max \|fill − host\| = 0.00 px (60 shots) |
| AC-3 | `skeleton.component.spec.ts` l. 22/31/47 expect `'100%'`, host lines unchanged |
| AC-4 | `--full --compare=tmp/story-shots/032/baseline`, 6 stories × 3 widths × 2 themes: **36/36 identical** (incl. `today-loading` 360 dark) |
| AC-5 | measure, percentage-widths: 360 row 294 (x 33–327), A 176.39 / 88.19, B 235.19 / 44.09, second right = 327 (end gap 0); 1024 + 1280 row 446 (x 33–479), A 267.59 / 133.8, B 356.8 / 66.89, right = 479; card 236 high; no page scroll |
| AC-6 | `skeleton.height.spec.ts` (height/radius assertions unchanged), `skeleton.styles.spec.ts` unchanged, green; `height-from-container` in the AC-4 hash set |
| AC-7 | spec: circle `40px` → host `40px`, `flex-shrink: 0`, fill `100%`; `30%` host keeps `flex-shrink: 0`; measure: user-card circle 48 wide, hosts as before (`before-changed.log`) |
| AC-8 | spec: host `style="width: 30%; flex-shrink: 0;"`, fill `style` holds `width: 100%` (Angular's map order: `border-radius; height; width`) |
| AC-9 | n/a |
| Table Rows Loading | measure: max host right = row right 344 (360) / 516 (1024, 1280), ratios 0.30/0.20/0.25/0.15 |

The 12 light shots of text-block, user-card, article-card, dashboard-grid are byte-identical (`cmp`) to the designer's prototype `tmp/story-shots/032/probe-fix/`.

## Gates

All gates ran on commit `9508977ee138e24328f2ac6a85a352bbe36fd51a` (later agents skip a gate while `git diff --quiet 9508977 -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 213 suites, 4922 passed, 8 skipped (`--maxWorkers=2`); was 4893 + 031 |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (unchanged) |
| `npx nx run angular-ui-kit:build` | 122 entries built |
| `npm run test:tools` | tools unchanged |
| `npx nx run angular-ui-kit:build-storybook` | 974 stories (+1) |
| Story screenshots | `tmp/story-shots/032/build/` (10 stories × 3 × 2, measures in `tmp/032/measure.log`, module `tmp/032/measure/m.mjs`); AC-4 `tmp/story-shots/032/ac4/` |
| `node tools/compat/check-angular-majors.mjs --only=22` | install, build+prerender ok; 88 prerendered-HTML checks ok |

## Deviations from the design

| # | What | Why |
|---|---|---|
| 1 | `skeleton.height.spec.ts` l. 48 (circle defaults) changes its fill `width` from `'40px'` to `'100%'`, although AC-6 says the file passes unchanged | It is a fourth "inner width = input" assertion the AC-3 list missed; AC-2 and §9 require `100%` on every fill. Height, radius, class and host width in that test are unchanged. **Designer: please confirm in review.** |
| 2 | §2 DOM contract shows the fill as `width: 100%; height …; border-radius …`; Angular serialises the `[style]` map as `border-radius; height; width` (as in 3.22.1) | Order only; the AC-8 test pins the real string |

## Changelog draft

```markdown
## [3.22.2] - 2026-11-02

`lc-skeleton` applies a percentage `width` once, so `width="30%"` is 30 % of the line (finance-intelligence cockpit, gap file `cockpit-2026-11-01` row 3). No API breaks.

### Fixed

- **`lc-skeleton` applies a percentage `width` once, to the host**: the host and the inner fill both took the width, so a percentage resolved against the already-shrunk host: `width="30%"` drew 9 % of the line and `60%` drew 36 %. Now the host takes the width and the fill always spans it: `30%` is 30 %, `60%` is 60 %, and `calc(100% - 2rem)` is exact too. In a 294 px card row (360 px) `60%` / `30%` with `justify-content: space-between` measure 176.4 / 88.2 px and the second ends at the row's right edge (3.22.1: 105.8 / 26.5 px). The inline width is in the prerendered HTML, so the proportions hold before JavaScript.
- `px`, `rem` and the defaults (`100%`, a circle's `40px`) render byte-identical (36 story shots at 360, 1024 and 1280 px, light and dark).
- Stories: Feedback/Skeleton "Percentage widths" (the cockpit's loading card); "Table Rows Loading" spaces its columns with `space-between` instead of a 16 px gap, which no longer fits beside 100 % of percentages.

### Compatibility

- No API breaks: no input, default, class or hook changed. The fill's inline `width` is now always `100%`; a test that reads `.lc-skeleton`'s `style.width` sees `100%` instead of the input.
- Percentage widths now draw what they say. Placeholders tuned around the bug (`50%` to get 25 %, a wrapper `div` holding the percentage) can be simplified. A row whose percentages plus its `gap` exceed 100 % now overflows visibly; the hosts already did before: use `justify-content: space-between` instead of a gap.
```
