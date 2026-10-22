# Release 010: @lifecorner/angular-ui-kit 3.11.0

- **Version:** 3.11.0 (minor, previous 3.10.1)
- **Release commit:** see the tag `v3.11.0` on `main` (branch `feat/3.11-reflow-200-text-phone`, code unchanged since 64343ea)

## Gates

`git diff --quiet 64343ea -- libs tools` holds, so the developer's results from build.md stand; CI runs tests, build and the compat matrix again on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | build.md: 159 suites, 4011 passed, 8 skipped |
| Lint | build.md: 0 errors, 162 warnings (baseline) |
| Production build | green here, 9.2 s; `dist/.../package.json` says 3.11.0 |
| Tool tests | build.md: 22 / 22 |
| Storybook build | build.md: green |
| Consumer check Angular 22 | build.md: PASS (22.2.3), SI-15 entry ok; the full matrix runs in CI |
| Package contents (`npm pack --dry-run`) | 418 files, 1.1 MB packed, 5.7 MB unpacked (3.10.1: 418, 1.1 MB, 5.7 MB); no stories; assets, styles and `icon-names.json` in; the 7 `src/styles/*.spec.ts` are the known pre-existing leftovers |

## Release through the pipeline

1. Fast-forward `main`, `git push origin main`, wait for CI
2. Tag `v3.11.0` (starts `publish-npm.yml`): tests, build, `npm stage publish` (OIDC, provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

Follow-ups left open (review nits 2-3, no code impact for this release).

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.11.0` (public after the owner's approval)
- **Closes:** AS-30 (2), AS-32, SI-15
- **Use it:**

```html
<lc-badge [wrap]="true" rounded>Geschlossene Beta, nur mit Einladung</lc-badge>
```

Remove your local SI-15, AS-30 H1 and footer-link overrides (see Migration in the changelog).

- **Stories:** the six stories of design §8 (badge wrap, page-header, footer links, button-link, next-step-card at large text) on design.life-cockpit.de
