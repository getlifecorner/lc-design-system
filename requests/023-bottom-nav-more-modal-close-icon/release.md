# Release 023: @lifecorner/angular-ui-kit 3.18.0

- **Version:** 3.18.0 (minor, previous 3.17.0; npm lists up to 3.16.0 public, 3.17.0 staged, tag v3.17.0 exists)
- **Release commit:** the commit `release: 3.18.0` on `feat/3.18-bottom-nav-more-modal-close-icon`, fast-forwarded to `main`

Review F1 (wrong Finance Intelligence hint) applied in the changelog and in the `build.md` draft before writing the entry.

## Gates

`git diff --stat 3c23244 -- libs tools` is empty: the code is the code of the developer's gates, so they are taken from `build.md`. CI runs them again on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 201 suites, 4660 passed, 8 skipped (developer, 3c23244) |
| Lint | 0 errors, 162 warnings (baseline; developer) |
| Production build | ok, 19 s uncached; `dist/libs/angular-ui-kit/package.json` says 3.18.0 (`tmp/023/release-build.log`) |
| Tool tests | 22 pass (developer) |
| Storybook build | ok, 958 stories (+3) (developer) |
| Consumer check Angular 22 | PASS, 83 checks (developer); 21 and the full matrix run in CI |
| Package contents (`npm pack --dry-run`) | 424 files, 1.2 MB packed / 6.0 MB unpacked; 3.17.0 was 424 files, 1.2 MB / 6.0 MB. No stories; the 7 known `src/styles/*.spec.ts` are packed as before; `icon-names.json` present (`tmp/023/pack.log`) |

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`
2. Wait for CI, then push the annotated tag `v3.18.0` on the release commit; it starts `publish-npm.yml` (tests, build, `npm stage publish` with OIDC and provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.18.0` (public after the owner's approval)
- **Closes:** gap file quellen-2026-10-31, rows 6 and 8
- **Use it:**

```html
<lc-bottom-nav
  [items]="items"
  [maxItems]="5"
  [showMore]="roleHasMoreTargets"
  moreLabel="Mehr"
  moreRoute="/mehr" />
```

  "Mehr" is current on `/mehr` and its sub-pages. Keep mapping other pages reached through "Mehr" (such as `/datenbasis/quellen`) to `/mehr` in `activeRoute`. The modal needs no change; remove the `.lc-modal__close svg` entry from `KIT_DEFECTS`.

- **Stories:** `navigation-bottom-nav--show-more`, `navigation-bottom-nav--show-more-german`, `navigation-bottom-nav--show-more-fixed-slots` on design.life-cockpit.de

## Not in this release

`lc-drawer` close icons and `lc-notification-center` icons have the same `svg-img-alt` defect (review follow-up); propose as a new request.
