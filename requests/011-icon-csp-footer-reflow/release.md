# Release 011: @lifecorner/angular-ui-kit 3.11.1

- **Version:** 3.11.1 (patch, previous 3.11.0)
- **Release commit:** on `fix/3.11.1-icon-csp-footer-reflow`, then fast-forwarded to `main`

## Gates

Code unchanged since the developer's gates (`git diff --quiet 1af3e7c -- libs tools` holds), so tests, lint, tool tests and the Storybook build are taken from `build.md`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 161 suites, 4056 passed, 8 skipped (developer, same commit) |
| Lint | 0 errors, 162 warnings (developer) |
| Production build | ok, 9.3 s; `dist/.../package.json` says 3.11.1 |
| Tool tests | 22 / 22 (developer) |
| Storybook build | ok (developer) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | all PASS (21.0.9, 21.2.25, 22.0.8, 22.2.3), incl. the 5 G-37 rows; `tmp/011/compat.log` |
| Package contents (`npm pack --dry-run`) | 418 files, 1.1 MB packed, 5.7 MB unpacked (3.11.0: same); the only specs are the 7 known `src/styles/*.spec.ts`, no stories; `icon-names.json` present |

## Review

`review.md` approved, no open must-fix. Nit 1 applied to the changelog (Compatibility: "more specific than (0,2,0)").

## Release through the pipeline

1. `git merge --ff-only` into `main`, `git push origin main`
2. Wait for CI, then push the tag `v3.11.1`; it starts `publish-npm.yml` (tests, build, `npm stage publish` with provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.11.1` (public after the owner's approval)
- **Closes:** G-37, G-36
- **Use it:** nothing to change. Icons carry no `style` attribute, so `style-src 'self'` works; the footer no longer needs the page-level G-36 rule.

```html
<lc-icon name="check" size="md" />            <!-- no style attribute, inherits the text colour -->
<lc-icon name="check" color="#FF5733" />      <!-- colour set on the svg through CSSOM after hydration -->
```

- **Stories:** `components-icon--inherited-color`, `layout-footer--sections-large-text` (design.life-cockpit.de)
