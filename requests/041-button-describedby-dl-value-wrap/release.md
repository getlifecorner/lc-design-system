# Release 041: @lifecorner/angular-ui-kit 3.26.0

- **Version:** 3.26.0 (minor, previous 3.25.2)
- **Release commit:** on `feat/3.26-button-describedby-dl-value-wrap`, fast-forwarded to `main`

## Gates

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 222 suites, 5215 passed, 8 skipped (developer, `e0aff08`; `git diff --stat e0aff08 -- libs tools` is empty) |
| Lint | 0 errors, 162 warnings (baseline 162) (developer) |
| Production build | green, 9.2 s; `dist/libs/angular-ui-kit/package.json` says 3.26.0 (release run) |
| Tool tests | 22 / 22 (developer) |
| Storybook build | green, 997 stories (+3) (developer) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | 22: PASS, 94 checks (developer); the others run in CI on `main` |
| Package contents (`npm pack --dry-run`) | 424 files, 1.2 MB packed / 6.2 MB unpacked (3.25.2: same); no stories or component specs; 7 `src/styles/*.spec.ts` as before; `icon-names.json`, styles, assets present |

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`
2. Wait for CI on the release commit
3. Tag `v3.26.0` (annotated, on the release commit) starts `publish-npm.yml`: tests, build, `npm stage publish` (OIDC, provenance)
4. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.26.0` (public after the owner's approval)
- **Closes:** gap row 7 (finance-intelligence sources page, quellen-2026-11-03); the description-list wrap bug (no gap ID)
- **Use it:**

```html
<lc-button [disabled]="!file" ariaDescribedBy="upload-reason">Hochladen</lc-button>
<p id="upload-reason">Wählen Sie zuerst eine Datei.</p>
```

The description-list fix needs no change: a short value next to a long term stays whole and the term wraps.

- **Stories:** `components-button--disabled-with-visible-reason`, `components-button--loading-with-description`, `components-description-list--long-terms-short-values`
