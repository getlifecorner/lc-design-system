# Release 014: @lifecorner/angular-ui-kit 3.11.4

- **Version:** 3.11.4 (patch, previous 3.11.3)
- **Release commit:** `release: 3.11.4` on `fix/3.11.4-avatar-trigger-label-in-name`, fast-forwarded to `main`

## Gates

Code (`libs`, `tools`) unchanged since the developer's gates on `c93bfc3`; their results are taken from `build.md`, CI repeats tests, build and the compat matrix on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 169 suites, 4207 passed, 8 skipped (build.md, axe-core 4.14.0) |
| Lint | 0 errors, 162 warnings (= baseline) |
| Production build | green (9.4 s, release run); `dist/…/package.json` = 3.11.4 |
| Tool tests | 22 / 22 |
| Storybook build | green |
| Consumer check | `--only=22` PASS, 63 HTML checks incl. AS-33 (build.md); the full matrix runs in CI |
| Package contents (`npm pack --dry-run`) | 418 files, 1.2 MB packed, 5.8 MB unpacked (3.11.3: 418, 1.2 MB); `icon-names.json` in, no component specs or stories (the 7 `src/styles/*.spec.ts` are the known glob side effect) |

## Release through the pipeline

1. `git switch main && git merge --ff-only fix/3.11.4-avatar-trigger-label-in-name`, `git push origin main`
2. Wait for CI on the release commit, then push the annotated tag `v3.11.4`; it starts `publish-npm.yml` (tests, build, `npm stage publish`, OIDC, provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.11.4` (public after the owner's approval)
- **Closes:** AS-33
- **Use it:** nothing to change in templates; the avatar trigger now has the name "Menu for Johanna Müller, JM".

```html
<lc-header userMenuTrigger="avatar" userName="Johanna Müller" userMenuAriaLabel="Menu for Johanna Müller" />
```

- **Migration:** lift the `@axe-core/playwright` 4.14 hold in `.github/dependabot.yml`; exact-name assertions (`shell.de.spec.ts:420`) become `…, JM`.
- **Stories:** `navigation-header--avatar-trigger-names`
