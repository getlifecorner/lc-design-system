# Release 057: @lifecorner/angular-ui-kit 3.37.0

- **Version:** 3.37.0 (minor, previous 3.36.0; 3.36.0 is the newest tag and npm version)
- **Release commit:** see the `release: 3.37.0` commit on `feat/3.37-select-hero-table-a11y-backlog`, fast-forwarded to `main`

## Gates

Code unchanged since the developer's gate tree `faf1c15` (`git diff --stat faf1c15 -- libs tools` is empty), so the gates come from `build.md`; the release ran build and pack.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 298 suites, 6230 passed, 8 skipped (build.md, faf1c15) |
| Lint | 0 errors, 160 warnings, none in changed files (build.md) |
| Production build | green, 122 entries, 9.4 s; `dist/…/package.json` says 3.37.0 (`tmp/057/build-release.log`) |
| Tool tests | tools unchanged (build.md) |
| Storybook build | green, 1116 stories (+7) (build.md) |
| Consumer check | Angular 22 PASS, 110 HTML checks (build.md); CI runs the full matrix on `main` |
| Package contents (`npm pack --dry-run`) | 429 files, 1.3 MB packed / 6.6 MB unpacked (3.36.0: 429, 1.3 MB / 6.6 MB); 9 spec files, all the known `src/styles/*.spec.ts`, no stories; `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 057-s1 | F-4: `lc-card` with `title` runs title and body together („Kostenstellenaus USM …“); clickable card with `title` + `ariaLabel` = visible text fails axe `label-content-name-mismatch` (2.5.3), measured in Chromium. In the changelog under Known | review F-4 | queue |
| 057-s2 | F-1: `lc-hero` body text 2.01–3.81:1 on 6 of 9 bands (primary 3.62, purple 3.81, secondary 2.70, orange 2.61, success 2.39, warning 2.01), title on success/warning 2.72 / 2.26:1. Pre-existing. In the changelog under Known | review F-1, design §5 | queue |
| 057-n1 | F-2 select xs/sm/md long value runs under the × (303/299/295 vs 277 px) | review F-2 | backlog |
| 057-n2 | F-3 `CHART_PALETTE` secondary-500 2.98 / 2.83:1 on surface-2 / sunken | review F-3 | backlog |
| 057-n3 | N-1 *Fill* story at 360: dl breaks amounts mid-number | review N-1 | backlog |
| 057-n4 | N-2 *Action Sizes* story at 360: actions column off-screen | review N-2 | backlog |
| 057-n5 | N-3 list row button name runs parts together and includes the action's name | review N-3 | backlog |
| 057-n6 | N-4 *Badges in the Body* uses token names as labels | review N-4 | backlog |
| 054-n2 | Safari/iOS check of the *Focus return (3.34)* stories: WebKit is not installed here, so it could not be checked; stays in the backlog (owner decision 2026-11-09). In the changelog under Known | 054 build.md | backlog |

Review C-1 (changelog text) is done: the description-list line says „a clickable card without a `title`“ and Known names F-4.

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.37.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.37.0` (public after the owner's approval)
- **Closes:** services-2026-11-09 rows 1–3, regeln-2026-11-09 row 1, monatsstand-2026-11-09 row 1, cockpit-2026-11-09 row 1; 056 S-1, F-1 (palette), F-2 (list)
- **Use it:**

```html
<lc-table [data]="rows" [columns]="cols" [actions]="[{ key: 'source', label: 'Source', icon: 'eye', size: 'lg', ariaLabel: 'Source of row' }]" />

<div class="grid-row">
  <lc-hero fill title="Monatsstand">
    <lc-badge variant="warning" size="sm">Open</lc-badge>
  </lc-hero>
  <lc-card title="Costs"><lc-description-list [items]="items" /></lc-card>
</div>
```

- **Stories:** `form-select--clear-tap-area`, `form-select--focus-after-tap`, `data-display-table--action-sizes`, `components-description-list--in-a-labelled-card`, `layout-hero--badges-in-the-body`, `layout-hero--fill`, `data-display-list--german-labels`, `data-display-state-strip--many-segments`, `components-card--collapsible`
