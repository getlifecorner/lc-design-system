# Release 036: @lifecorner/angular-ui-kit 3.23.1

- **Version:** 3.23.1 (patch, previous 3.23.0)
- **Release commit:** see `git log` on `main` (`release: 3.23.1 — …`)

## Gates

Library and tools code equals the developer's gate commit `cfcccde` (`git diff --stat cfcccde -- libs tools` is empty), so only build and pack ran here; the rest is from build.md.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 215 suites, 5043 passed, 8 skipped (build.md, cfcccde) |
| Lint | 0 errors, 162 warnings (baseline) |
| Production build | green, 9.7 s; `dist/…/package.json` says 3.23.1 |
| Tool tests | 22 passed |
| Storybook build | 987 stories |
| Consumer check | Angular 22 PASS (22.2.4, 89 checks); CI runs the full matrix on `main` |
| Package contents | 424 files, 1.2 MB packed / 6.1 MB unpacked (= 3.23.0); no stories or component specs; assets, styles, `icon-names.json` present |

## Release through the pipeline

1. ff-merge to `main`, push, wait for CI
2. annotated tag `v3.23.1` on the release commit starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.23.1` (public after the owner's approval)
- **Closes:** BA-10 (life-os bank accounts page); 033 review findings 2–4; 034 follow-ups F-8 to F-13. Known and open: F-14 to F-17.
- **Use it:** nothing to change; clickable rows are now 45 px (was 38) and have a focus outline.

```html
<lc-description-list [items]="items" [clickable]="true" (itemClick)="open($event)" />
```

- **Stories:** `components-description-list--link-and-primary-values`, `--clickable-rows`, `--clickable-rows-english`, `data-display-logviewer--ansi-gray-on-every-line`, `components-card--footer-slot`, `feedback-notification-center--priority-on-unread-rows`
