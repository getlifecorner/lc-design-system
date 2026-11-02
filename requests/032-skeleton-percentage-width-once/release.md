# Release 032: @lifecorner/angular-ui-kit 3.22.2

- **Version:** 3.22.2 (patch, previous 3.22.1)
- **Release commit:** see `git log` (`release: 3.22.2`) on `fix/3.22.2-skeleton-percentage-width-once`, then `main`

## Gates

Code (`libs`, `tools`) is unchanged since the developer's gate commit `9508977`; those results are taken from build.md. CI repeats tests, build and the compat matrix on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 213 suites, 4922 passed, 8 skipped (build.md, `9508977`) |
| Lint | 0 errors, 162 warnings (build.md) |
| Production build | ok, 9.5 s, `dist/.../package.json` = 3.22.2 |
| Tool tests | unchanged (build.md) |
| Storybook build | 974 stories (+1) (build.md) |
| Consumer check | `--only=22` ok, 88 prerendered-HTML checks (build.md); full matrix in CI |
| Package contents | 424 files, 1.2 MB packed / 6.1 MB unpacked (3.22.1: same); no specs or stories; assets, styles, `icon-names.json` present |

## Review

Approved (round 1), no must-fix. Two nits stay visible: the byte-identical bullet moved from Fixed to Compatibility; AC-8 is shown by DOM serialisation in a unit test, not by a server render.

## Release through the pipeline

Ff-merge to `main`, push, wait for CI, annotated tag `v3.22.2` (starts `publish-npm.yml`), owner approves the npm stage with 2FA.

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.22.2` (public after the owner's approval)
- **Closes:** gap file `cockpit-2026-11-01` row 3
- **Use it:** keep your percentages, no wrapper or override.

```html
<div style="display: flex; justify-content: space-between">
  <lc-skeleton width="60%" />
  <lc-skeleton width="30%" />
</div>
```

`60%` and `30%` are now 60 % and 30 % of the row (3.22.1: 36 % and 9 %). A row whose percentages plus a `gap` exceed 100 % overflows: use `space-between`.

- **Stories:** `feedback-skeleton--percentage-widths` (Feedback/Skeleton, "Percentage widths"), `feedback-skeleton--table-loading`
