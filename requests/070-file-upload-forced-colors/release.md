# Release 070: @lifecorner/angular-ui-kit 3.49.1

- **Version:** 3.49.1 (patch, previous 3.49.0)
- **Release commit:** see `git log` (`release: 3.49.1 — …`) on `fix/3.49.1-file-upload-forced-colors`

## Gates

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 377 suites, 7386 passed, 8 skipped (developer, commit 50914b8; `git diff --stat 50914b8 -- libs tools` empty) |
| Lint | 0 errors, 159 warnings (unchanged) |
| Production build | green after the version bump, 10.8 s, 127 entries; `dist/…/package.json` says 3.49.1 · `tmp/070/rel-build.log` |
| Tool tests | tools unchanged |
| Storybook build | green (developer, 50914b8) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | not run: no markup change, only CSS inside `@media (forced-colors: active)`; CI runs the matrix on `main` |
| Package contents (`npm pack --dry-run`) | 444 files, 1.6 MB packed / 7.8 MB unpacked (3.49.0: 444, 1.6 MB / 7.8 MB); 9 styles specs as before, no stories; `icon-names.json` present · `tmp/070/pack.log` |

## Open items

None. Review round 1 has no findings; the 3.49.0 *Known* line is removed from the changelog (AC-8). Open backlog rows 069-n1 and 069-n2 stay in `requests/BACKLOG.md` unchanged.

| ID | Finding | Source | Route |
|---|---|---|---|
| – | – | – | – |

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.49.1` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.49.1` (public after the owner's approval)
- **Closes:** 069-s1 (usm-x row 71 in forced colours)
- **Use it:** nothing to change. `lc-file-upload variant="image"` with `imageBackground="dark"` now keeps its ground in Windows high contrast:

```html
<lc-file-upload variant="image" imageBackground="dark" [imageSrc]="logoUrl" imageAlt="Company logo" />
```

- **Stories:** `form-file-upload--image-grounds-white-logo`
