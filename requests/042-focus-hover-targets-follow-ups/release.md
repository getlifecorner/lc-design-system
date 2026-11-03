# Release 042: @lifecorner/angular-ui-kit 3.27.0

- **Version:** 3.27.0 (minor: one new optional input `regionLabel`; previous 3.26.0)
- **Release commit:** the `release: 3.27.0` commit on `feat/3.27-focus-hover-targets`, on top of `e56f61a` (fast-forward onto `main`, which had not moved)

## Gates

Code (`libs`, `tools`) is unchanged since gate commit `bc2de05` (`git diff` empty), so the developer's results stand; only build and pack ran here.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 225 suites, 5341 passed, 8 skipped (build.md, `bc2de05`) |
| Lint | 0 errors, 162 warnings (= baseline) (build.md) |
| Production build | ok, 18.5 s uncached; `dist/libs/angular-ui-kit/package.json` = 3.27.0 (`tmp/042/build-release.log`) |
| Tool tests | not run: `tools/` unchanged (22 / 22 in 3.26.0) |
| Storybook build | 1,016 stories (build.md) |
| Consumer check Angular 22 | install, build + prerender ok, 94 HTML checks ok (build.md); CI runs the matrix on `main` |
| Package contents (`npm pack --dry-run`) | 425 files, 1.3 MB packed / 6.2 MB unpacked (3.26.0: 424, 1.2 MB / 6.2 MB). The +1 file is `src/styles/focus-indicators.spec.ts`, packed by the existing `src/styles/**/*` assets glob like the other 7 style specs; no component specs or stories; `icon-names.json` present (`tmp/042/pack.log`) |

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.27-focus-hover-targets`, then `git push origin main`
2. Wait for CI, then push the annotated tag `v3.27.0`; it starts `publish-npm.yml` (tests, build, `npm stage publish` with provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.27.0` (public after the owner's approval)
- **Closes:** 039/040 follow-ups F-18 (focus rings), F-19 (focus over hover), F-20 (dependency-viewer at 360 px), F-21 (file-upload remove target). Open: F-22 to F-27 (design.md §9).
- **Use it:**

```html
<lc-dependency-viewer
  [graph]="graph"
  fitMode="fit-width"
  [minNodeSize]="200"
  direction="vertical"
  regionLabel="Abhängigkeitsgraph" />
```

At 360 px nodes draw 200 px wide and the canvas scrolls sideways; from 1024 px the graph fits at 100 %. Focus rings, the field hover fix and the 44 px remove target need no code.

- **Stories:** `data-display-dependency-viewer--phone-width`, `data-display-dependency-viewer--phone-width-de`, `form-file-upload--remove-targets`, and a *Keyboard Focus* story in 16 components (e.g. `data-display-kanban-board--keyboard-focus`); IDs checked against `index.json` (request 043, AC-11: the German story was misnamed `phone-width-german`).
