# Release 012: @lifecorner/angular-ui-kit 3.11.2

- **Version:** 3.11.2 (patch, previous 3.11.1). By the owner's decision of 2026-10-23 (spec: the kit's own rule would make the new optional inputs a minor, 3.12.0); no API break.
- **Release commit:** on `fix/3.11.2-image-size-lazy-button-transition`, fast-forwarded to `main` (base `3974660` = `origin/main`, no rebase needed)

## Gates

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 164 suites, 4118 passed, 8 skipped (build.md; no code change since: `git diff HEAD -- libs tools` empty) |
| Lint | 0 errors, 162 warnings (build.md, r2) |
| Production build | ok, `dist/.../package.json` says 3.11.2 (`tmp/012/build.log`) |
| Tool tests | 22 / 22 (build.md, r2) |
| Storybook build | ok (build.md, r2); 516 of 516 baseline shots identical to 3.11.1 |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | PASS, PASS, PASS, PASS (21.0.9, 21.2.25, 22.0.8, 22.2.3); the 4 new rows ok (`tmp/012/compat.log`) |
| Package contents (`npm pack --dry-run`) | 418 files, 1.2 MB packed, 5.8 MB unpacked (3.11.1: 418 files, 1.1 MB, 5.7 MB); `icon-names.json`, assets and styles in; no component specs or stories (the seven `src/styles/*.spec.ts` are the known ones) |

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`
2. Wait for CI on the release commit
3. Tag `v3.11.2` on the release commit (starts `publish-npm.yml`: tests, build, `npm stage publish` with OIDC and provenance)
4. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.11.2` (public after the owner's approval)
- **Closes:** G-38, G-39, G-40, G-41
- **Use it:**

```html
<lc-character loading="lazy" />
<lc-avatar name="Test Person" src="/assets/person.jpg" loading="lazy" />
<lc-logo src="/assets/brand.svg" [srcWidth]="160" [srcHeight]="40" />
```

Built-in `lc-logo` and every `lc-avatar` image now carry `width` / `height`; `.btn` no longer animates padding or font size, so drop the page-level `G-41` rule.

- **Stories:** `components-logo--custom-lockup-with-size`, `components-logo--custom-emblem-with-size`, `data-display-avatar--image-sizes`, `data-display-avatar--lazy-image`, `components-character--lazy-loading`
