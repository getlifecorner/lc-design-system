# Release 038: @lifecorner/angular-ui-kit 3.24.1

- **Version:** 3.24.1 (patch, previous 3.24.0)
- **Release commit:** see `git log -1` on `fix/3.24.1-accordion-bleed-hook-follow-ups`, then `main`

## Gates

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 217 suites, 5115 passed, 8 skipped (developer, commit ae8abba; libs and tools unchanged since, so not rerun) |
| Lint | 0 errors, 162 warnings (= baseline) (developer) |
| Production build | green, 48 s uncached; `dist/.../package.json` = 3.24.1 |
| Tool tests | 22 / 22 (developer) |
| Storybook build | 993 stories (developer) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | 22: 92 HTML checks (developer); 21.0 (core 21.0.9) and 21 (core 21.2.25) PASS in the release run, each with "plain accordion bleed @property" (review finding 2); CI runs the full matrix on main |
| Package contents (`npm pack --dry-run`) | 424 files, 1.2 MB packed / 6.2 MB unpacked (= 3.24.0); the 7 `src/styles/*.spec.ts` are the known ones, no stories; assets and styles present |

## Release through the pipeline

1. ff-merge the branch into `main`, `git push origin main`
2. Wait for CI on the release commit
3. Push the annotated tag `v3.24.1`; `publish-npm.yml` stages the package (OIDC, provenance)
4. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.24.1` (public after the owner's approval)
- **Closes:** BA-9 follow-ups (035 review findings 1 and 2)
- **Use it:** a bare `0` now works on the hook; keep 8 px of room before a clipping or scrolling edge, or set the hook to `0px`/`0`.

```html
<lc-accordion variant="plain" title="Details" style="--lc-accordion-header-bleed: 0">…</lc-accordion>
```

- **Stories:** `components-accordion--plain-variant`, `components-accordion--plain-in-card`
