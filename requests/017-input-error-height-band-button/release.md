# Release 017: @lifecorner/angular-ui-kit 3.13.0

- **Version:** 3.13.0 (minor, previous 3.12.0)
- **Release commit:** `release: 3.13.0` on `feat/3.13-input-error-height-band-button`, then fast-forwarded to `main`

## Gates

`libs` and `tools` are unchanged since the developer's gates (`ae6b576`), so those results come from build.md; CI repeats them on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 181 suites, 4351 passed, 8 skipped (build.md) |
| Lint | 0 errors, 162 warnings = baseline (build.md) |
| Production build | green with version 3.13.0, 33 s uncached; `dist/.../package.json` says 3.13.0 |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | green, 908 stories (build.md) |
| Consumer check Angular 22 | PASS, 71 checks (build.md); 21 runs in CI on `main` |
| Package contents (`npm pack --dry-run`) | 421 files, 1.2 MB packed, 5.8 MB unpacked (3.12.0: same); no stories or component specs; `icon-names.json` present; the known `src/styles/*.spec.ts` are packed as before |

Open review nits (not blocking): 1 story layout (icon-only button wraps at 1280), 2 "ein" alone on line 2 at 360 (a later `text-wrap: balance` request), 3 English band copy next to a German label.

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, `git push origin main`
2. Wait for CI, then push the annotated tag `v3.13.0`; it starts `publish-npm.yml` (tests, build, `npm stage publish` with provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.13.0` (public after the owner's approval)
- **Closes:** G-WL3 (lc-input keeps its height in an error), G-WL1 (link button on the hero band)
- **Use it:** rename any CSS on `.input-container.input-error` to `.input-container.input-invalid`.

```html
<lc-hero>
  <a lcButton variant="inverse" size="lg" href="#warteliste">Trag dich jetzt in die Warteliste ein</a>
</lc-hero>
```

- **Stories:** `components-button--inverse`, `components-button-link--inverse`, `layout-hero--band-link`, `form-input--error-keeps-height`
