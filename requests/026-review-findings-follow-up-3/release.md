# Release 026: @lifecorner/angular-ui-kit 3.19.2

- **Version:** 3.19.2 (patch, previous 3.19.1)
- **Release commit:** the commit tagged `v3.19.2` on `main` (`release: 3.19.2 — …`)

## Gates

Code unchanged since the developer's gate commit 80f5747 (`git diff --stat 80f5747 -- libs tools` shows only `CHANGELOG.md` and `package.json`), so their results from build.md stand. CI runs tests, build and the compat matrix again on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 208 suites, 4728 passed, 8 skipped (build.md, 80f5747) |
| Lint | 0 errors, 162 warnings (unchanged; build.md) |
| Production build | green on the release tree, 10.9 s; `dist/…/package.json` says 3.19.2 · `tmp/026/release-build.log` |
| Tool tests | unchanged (build.md) |
| Storybook build | green, 962 stories (build.md) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | not run: no template change, CSS `color` only (build.md); CI runs the matrix |
| Package contents (`npm pack --dry-run`) | 424 files, 1.2 MB packed / 6.0 MB unpacked (3.19.1: same); no stories or component specs, `icon-names.json` present · `tmp/026/pack.log` |

## Release through the pipeline

1. `git switch main && git merge --ff-only fix/3.19.2-review-findings-follow-up-3`, then `git push origin main`
2. Wait for CI, then push the annotated tag `v3.19.2`: it starts `publish-npm.yml` (tests, build, `npm stage publish` with OIDC and provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## Open follow-up

Review finding 2 (nit, pre-existing): `lc-toast` variant icons are below 3:1 on the gradient (error 1.71 / 2.06 D, info 2.32 / 2.80 D, success 2.60 / 2.72 L); `lc-alert` uses the same colours. Listed under "Known" in the changelog. Candidate for a kit-wide follow-up request.

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.19.2` (public after the owner's approval)
- **Closes:** review findings 1–3 of 025 (toast close colour, notification-center note, drawer story `lang`)
- **Use it:** nothing to change. The toast × now follows `--color-text-secondary`. To restyle it in your app, use a selector stronger than 0,1,0:

```css
lc-toast .lc-toast__close {
  color: var(--color-text-primary);
}
```

- **Stories:** Feedback/Toast (all), Feedback/Toast Outlet, Feedback/Drawer "German Heading"
