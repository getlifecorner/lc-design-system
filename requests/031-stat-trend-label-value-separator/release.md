# Release 031: @lifecorner/angular-ui-kit 3.22.1

- **Version:** 3.22.1 (patch, previous 3.22.0)
- **Release commit:** see `git log` (`release: 3.22.1 — …`) on `fix/3.22.1-stat-trend-label-value-separator`, then `main`

## Gates

Library and tools unchanged since the developer's gate commit `df5d8c3` (review nit 3: `0cf895e` has the same libs and tools tree), so only build and pack ran again.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | developer, `df5d8c3`: 212 suites, 4906 passed, 8 skipped (stat-trend 36 tests). CI reruns |
| Lint | developer: 0 errors, 162 warnings, none in `stat-trend/` |
| Production build | green, `dist/…/package.json` says 3.22.1 (85 s wall, uncached) |
| Tool tests | developer: 22/22 |
| Storybook build | developer: green; 66 + 2 shots identical, new story 0 axe violations |
| Consumer check | developer: `--only=22` PASS incl. the new stat-trend check; CI runs the full matrix on `main` |
| Package contents | 424 files, 1.2 MB packed / 6.1 MB unpacked (3.22.0: 424, 1.2 / 6.1); no stories or component specs, `icon-names.json` present |

Review: approved round 1, no must-fix; three nits (the icon's x depends on label length goes into the changelog as Known; the other two are documentation).

## Release through the pipeline

1. ff-merge the branch into `main`, push `main`, wait for CI.
2. Tag `v3.22.1` on the release commit starts `publish-npm.yml`.
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`).

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.22.1` (public after the owner's approval)
- **Closes:** finance-intelligence gap file `cockpit-2026-11-01` row 2 (`label-content-name-mismatch` on KPI tiles)
- **Use it:** no code change. Name the clickable tile with the visible text in order, and add words before or after it:

```html
<lc-card [clickable]="true" ariaLabel="Gesamtkosten Plan 2026 571.000,00 €. Herkunft anzeigen">
  <lc-stat-trend label="Gesamtkosten Plan 2026" value="571.000,00 €" />
</lc-card>
```

  Then drop the e2e exclusion of `label-content-name-mismatch` on `fi-kpi-tile`. A tile with a sparkline repeats the sparkline's name in the card name.
- **Stories:** `charts-stat-trend--inside-a-clickable-card`
