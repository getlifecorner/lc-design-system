# Release 028: @lifecorner/angular-ui-kit 3.21.0

- **Version:** 3.21.0 (minor, previous 3.20.0)
- **Release commit:** `release: 3.21.0` on `feat/3.21-bar-chart-labels-item-formatter`

## Gates

Code (`libs`, `tools`) is unchanged since the developer's gate tree (`62014b3`), so the gates of build.md stand; CI runs them again on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | developer, 62014b3: 210 suites, 4792 passed, 8 skipped |
| Lint | developer: 0 errors, 162 warnings (baseline) |
| Production build | release run: dist version 3.21.0 (`tmp/028/build.log`) |
| Tool tests | developer: 22 passed |
| Storybook build | developer: 968 stories (+5) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | developer r1: `--only=22`, 86 HTML checks ok; CI runs the matrix on `main` |
| Package contents (`npm pack --dry-run`) | 424 files, 1.2 MB packed / 6.0 MB unpacked (3.20.0: same); no component specs or stories; 7 `src/styles/*.spec.ts` as before; `icon-names.json` present |

## Open nits (review 028 r2, in the changelog under Known)

- 3: vertical `'wrap'` at 200 % text in a 360 px card breaks words inside the word; use the horizontal ranking.
- 4: a large `--lc-bar-chart-bar-size` (from about 2rem) lets the zero tick touch label ink; a cap follows on report.

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`; wait for CI
2. Annotated tag `v3.21.0` on the release commit starts `publish-npm.yml`: tests, build, `npm stage publish` (OIDC, provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.21.0` (public after the owner's approval)
- **Closes:** gap row 1 of cockpit-2026-11-01 (cockpit.md §5.1, §7)
- **Use it:**

```html
<lc-card padding="md">
  <lc-bar-chart
    labelLayout="wrap"
    lang="de"
    [data]="services"
    [formatValue]="formatCost"
  />
</lc-card>
```

```ts
services: BarChartItem[] = [
  { label: 'Demo Applikation', value: 313000, valueText: '313.000,00 · 54,8 %' },
  { label: 'Demo Arbeitsplatz', value: 180000, valueText: '180.000,00 · 31,6 %' },
];
// or compute the text from the item (the item is undefined for an axis tick):
formatCost: BarChartValueFormatter = (value, item) => item ? `${eur.format(value)} (${item.label})` : eur.format(value);
```

- **Stories:** Charts/Bar Chart "Ranking In A Card", "Ranking In A Card English", "Ranking Long Labels", "Ranking Negative Values", "Wrapped Column Labels"
