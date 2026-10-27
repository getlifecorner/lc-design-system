# Release 018: @lifecorner/angular-ui-kit 3.13.1

- **Version:** 3.13.1 (patch, previous 3.13.0)
- **Release commit:** `release: 3.13.1` on `fix/3.13.1-alert-narrow-container-words`, then fast-forwarded to `main`

## Gates

`git diff --quiet 2a742f1 -- libs tools` holds, so the developer's results (build.md, commit 2a742f1) stand. Only the version bump was built again.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 182 suites, 4368 passed, 8 skipped (build.md) |
| Lint | 0 errors, 162 warnings (build.md) |
| Production build | success after the bump, `dist` says 3.13.1 (9.1 s) |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | success, 911 stories (+3) (build.md) |
| Consumer check | Angular 22 PASS, 71 HTML checks (build.md); CI runs the matrix on `main` |
| Package contents | 421 files, 1.2 MB packed, 5.8 MB unpacked (3.13.0: the same); assets, styles, `icon-names.json` in; no component specs or stories (the 7 known `src/styles/*.spec.ts` are packed as before) |

## Review follow-ups

S1, S2, S3 are named in the changelog under Known; N1 is a Compatibility line. S1 to S3 need follow-up gaps (word breaking in the wide layout; dismiss button `color: inherit`; button hyphenation hook).

## Release through the pipeline

1. Fast-forward `main`, `git push origin main`, wait for CI.
2. Annotated tag `v3.13.1` on the release commit starts `publish-npm.yml` (tests, build, `npm stage publish`, provenance).
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`).

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.13.1` (public after the owner's approval)
- **Closes:** G-WL4 (T092's FR-017 row for the DE 503 page can follow)
- **Use it:** no change in your code. An `lc-alert` inside `lc-next-step-card` `[slot='body']` at 320 px and 200 % text now stays inside its box. Set `lang` on `<html>` so that German words hyphenate.

```html
<lc-next-step-card>
  <lc-alert slot="body" severity="error" title="Nicht eingetragen">
    Die Anmeldung ist fehlgeschlagen.
  </lc-alert>
</lc-next-step-card>
```

- **Stories:** `feedback-alert--narrow-container`, `feedback-alert--narrow-layout`, `feedback-alert--narrow-column`
- **Known:** a long compound title in a wide alert at 320 px still runs under the ×; every `lc-alert` is now a size container (give shrink-to-fit parents a width).
