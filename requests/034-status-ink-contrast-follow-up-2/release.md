# Release 034: @lifecorner/angular-ui-kit 3.22.4

- **Version:** 3.22.4 (patch, previous 3.22.3)
- **Release commit:** not made yet: the consumer check is blocked on this machine (see Gates)

## Gates

Code (`libs`, `tools`) is unchanged since the developer's gate commit `36f8c94` (`git diff --stat 36f8c94 -- libs tools` is empty), so tests, lint, tool tests and the Storybook build are taken from build.md.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 213 suites; 4979 passed, 8 skipped (build.md, 36f8c94) |
| Lint | 0 errors (build.md) |
| Production build | ok, 11 s; `dist/.../package.json` says 3.22.4 |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | ok, 980 stories (build.md) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | green on Node 24.21.0 (all four PASS, prerender and csp checks ok; `tmp/034/compat.log`). Node 23.10 failed earlier at route extraction, a local tooling issue |
| Package contents (`npm pack --dry-run`) | 424 files, 1.2 MB packed / 6.1 MB unpacked (3.22.3: same); no stories; `icon-names.json` present |

## Release through the pipeline

Not started. Open: the compat matrix on Node 24 (AC-12). Then: commit, `git switch main && git merge --ff-only fix/3.22.4-status-ink-contrast-2`, push `main`, wait for CI, tag `v3.22.4`, watch `publish-npm.yml`, owner approves the npm stage.

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.22.4` (public after the owner's approval)
- **Closes:** follow-ups F-1 to F-7 of request 029 (status inks and a hit area in six components)
- **Use it:** no code change; the colours improve by themselves.

```html
<lc-progress-ring [value]="72" color="success" />
<lc-card badge="New" badgeVariant="primary" />
```

- **Known follow-ups:** F-8 to F-12 (design 034 §9); F-10 now also covers debug-line and terminal search matches (dark 3.25 / 3.29); F-13 `.ansi-gray` in the log viewer (light 2.60, terminal 3.35); progress ring dark secondary vs info 1.07:1.
- **Stories:** `charts-progress-ring--all-colors`, `feedback-notification-center--priority-on-unread-rows`, `components-card--primary-badge-states`, `data-display-logviewer--text-hierarchy`, `data-display-dependency-viewer--all-relation-types`
