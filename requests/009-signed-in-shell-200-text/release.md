# Release 009: @lifecorner/angular-ui-kit 3.10.1

- **Version:** 3.10.1 (patch, previous 3.10.0)
- **Release commit:** on `fix/3.10.1-signed-in-shell-large-text`, fast-forwarded to `main`

## Gates

`git diff --quiet fd9d7fc -- libs tools` holds, so the developer's r2 gates stand (build.md); the release commit adds only the changelog, version and documents.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 157 suites, 3985 passed, 8 skipped (r2 on fd9d7fc; CI and publish rerun) |
| Lint | 0 errors, 162 warnings (baseline; r2 on fd9d7fc) |
| Production build | ok, rerun for the release: 8.3 s, `dist` version 3.10.1 |
| Tool tests | 22 / 22 (r1 on 4bd7ca6; `tools/` unchanged since) |
| Storybook build | ok (r2 on fd9d7fc) |
| Consumer check Angular 22 | PASS incl. 3 new checks (r1 on 4bd7ca6; r2 changed bar CSS only). The full matrix runs in CI before publish |
| Package contents (`npm pack --dry-run`) | 418 files, 1.1 MB packed, 5.7 MB unpacked (3.10.0: 418 files, 1.1 MB); no component specs or stories; `icon-names.json` present |

## Open items (review r2, none blocking)

| # | Item |
|---|---|
| r1-4 | Header row 1 has no room above the brand at 200 % |
| r1-5 | `layout-app-shell--signed-in-large-text-english` lacks `parameters.docs.description` |
| 6 | One-letter last lines in the narrowest columns at 200 % ("Hau·shal·t"); accepted |
| 7 | Chromium doesn't hyphenate capitalised English labels; docs note on soft hyphens later |
| 8 | LazySideNavigation DE 360 at 100 %: long labels almost touch (reach 8 px, as in 3.10.0) |

## Release through the pipeline

1. `git switch main && git merge --ff-only fix/3.10.1-signed-in-shell-large-text`, then `git push origin main`
2. Wait for CI on the release commit
3. `gh workflow run publish-npm.yml --ref main -f version=3.10.1`: tests, build, `npm stage publish` (OIDC, provenance), then the tag `v3.10.1`
4. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.10.1` (public after the owner's approval)
- **Closes:** AS-31 (header and bottom bar at 200 % text on a phone; the bar's page-wide overflow stays T387 on the app side)
- **Use it:** nothing to change in templates. Remove the AS-30 header interims in life-os and update any `.lc-header > [slot='end']` selector:

```css
/* before */ .lc-header > [slot='end'] { … }
/* after  */ .lc-header__end > [slot='end'] { … }
```

- **Stories:** `navigation-header--signed-in-large-text`, `navigation-header--signed-in-large-text-german`, `navigation-header--signed-out-large-text`, `navigation-bottom-nav--floating-large-text`, `navigation-bottom-nav--item-counts-large-text`, `layout-app-shell--signed-in-large-text`, `layout-app-shell--signed-in-large-text-english`, `layout-app-shell--today-large-text`
