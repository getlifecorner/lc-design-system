# Release 033: @lifecorner/angular-ui-kit 3.22.3

- **Version:** 3.22.3 (patch, previous 3.22.2)
- **Release commit:** on `fix/3.22.3-description-list-margin-reset`, then fast-forwarded to `main`

## Gates

Library and tools unchanged since the developer's gate commit `628200a` (`git diff --stat 628200a HEAD -- libs tools` empty), so their results come from `build.md`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 213 suites, 4924 passed, 8 skipped (build.md, 628200a) |
| Lint | 0 errors, 162 warnings, unchanged (build.md) |
| Production build | 122 entries; rerun after the version bump 9.8 s, `dist` says 3.22.3 |
| Tool tests | tools unchanged (build.md) |
| Storybook build | 975 stories, +1 (build.md) |
| Consumer check | Angular 22: install, build, prerender, 88 checks ok (build.md); CI runs the full matrix on `main` |
| Package contents (`npm pack --dry-run`) | 424 files, 1.2 MB packed / 6.1 MB unpacked (3.22.2: the same); no stories or component specs, `icon-names.json` present |

## Release through the pipeline

1. Fast-forward `main`, `git push origin main`, wait for CI on the release commit
2. Annotated tag `v3.22.3` on it starts `publish-npm.yml`: tests, build, `npm stage publish` (OIDC, provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.22.3` (public after the owner's approval)
- **Closes:** BA-8
- **Use it:** nothing to change in the markup. Remove the workaround in life-os (`connection.page.css`, `assistant-access.page.ts`):

```css
/* delete */
::ng-deep dd.lc-dl__value { margin: 0 }
```

```html
<lc-description-list [items]="items" />
```

At 360 px in a 262 px list, six short German rows sit on one line each; the list is 227 px tall instead of 290.

- **Stories:** `components-description-list--short-values-at-phone-width`

## Follow-ups (review.md, not in this release)

- Finding 2: `components-card--footer-slot` renders an empty body (the story does not import `DescriptionListComponent`).
- Finding 3: comment wording on the `&__term` block.
- Finding 4: primary/link value contrast 4.37:1, forced-colours ring, 38 px clickable rows (pre-existing).
