# Release 013: @lifecorner/angular-ui-kit 3.11.3

- **Version:** 3.11.3 (patch, previous 3.11.2)
- **Release commit:** see the `release: 3.11.3` commit on `fix/3.11.3-comforts-worried-brows`, then `main`

## Gates

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | from build.md, commit 50acbb5 (`git diff --quiet 50acbb5 -- libs tools` holds): 165 suites, 4137 passed, 8 skipped |
| Lint | from build.md: 0 errors, 162 warnings (= baseline) |
| Production build | green here, 119 entries, 8.9 s; `dist` package.json says 3.11.3 |
| Tool tests | from build.md: 22 / 22 |
| Storybook build | from build.md: green |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | not run: markup unchanged (same `<img>`, same `src`); CI runs the matrix on `main` |
| Package contents (`npm pack --dry-run`) | 418 files, 1.2 MB packed, 5.8 MB unpacked (3.11.2: 418, 1.2 MB, 5.8 MB); no component specs or stories (only the known `src/styles/*.spec.ts`); assets, styles, `icon-names.json` present; both comforts SVGs 1.3 kB |

## Release through the pipeline

1. `git switch main && git merge --ff-only fix/3.11.3-comforts-worried-brows`, then `git push origin main`
2. Wait for CI, then push the annotated tag `v3.11.3`; it starts `publish-npm.yml` (tests, build, `npm stage publish` with OIDC and provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.11.3` (public after the owner's approval)
- **Closes:** G-42
- **Use it:** nothing to change in the API. Switch the 404 figure back to `comforts`:

```html
<lc-character pose="comforts" [size]="96" />
```

  Update the brand copy `docs/brand/character/comforts-light.svg` from the kit file.
- **Stories:** `components-character--comforts`, `components-character--all-poses`, new `components-character--brows`
