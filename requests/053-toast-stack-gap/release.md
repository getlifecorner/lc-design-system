# Release 053: @lifecorner/angular-ui-kit 3.33.1

- **Version:** 3.33.1 (patch, previous 3.33.0)
- **Release commit:** on `fix/3.33.1-toast-stack-gap` (`release: 3.33.1 — …`)

## Gates

Code unchanged since the developer's gate commit 4bbc882 (`git diff --stat 4bbc882 -- libs tools` empty before the version bump), so tests, lint, tool tests, Storybook and compat are taken from `build.md`; CI runs them again on `main`.

| Gate | Result |
|---|---|
| Unit tests | 271 suites, 5903 passed, 8 skipped (build.md) |
| Lint | 0 errors, 162 warnings (baseline; build.md) |
| Production build | green, `dist` version 3.33.1 (9.5 s, release run) |
| Tool tests | 22 passed (build.md) |
| Storybook build | green, 1077 stories (build.md) |
| Consumer check | Angular 22 green, 101 HTML checks (build.md); full matrix in CI |
| Package contents | 426 files, 1.3 MB packed / 6.4 MB unpacked (3.33.0: same); no component specs or stories, assets, styles and `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 053-n1 | `toast-outlet.gap.spec.ts` pins length and sha1 of the rest of the compiled outlet CSS (2248, `4a24e1d9…`); fails on any later scss edit with no behaviour change. Drop it or replace it with targeted assertions. | review nit 1 | backlog |
| 053-n2 | "Top stacks the oldest at the top" holds only within a live region; in a top stack the assertive region comes first (newest Error above two Successes). Correct the wording or mirror `--latest` for top stacks. Pre-existing, not WCAG. | review nit 2 | backlog |
| 053-n3 | *Stack Spacing*, *Offsets*, *Bottom Stack Order*: `position` and `duration` controls show but do nothing on the fixed demos. | review nit 3 | backlog |

## Release through the pipeline

1. `git switch main && git merge --ff-only fix/3.33.1-toast-stack-gap`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.33.1` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.33.1` (public after the owner's approval)
- **Closes:** 052-s2
- **Use it:** nothing to change. Toasts in `lc-toast-outlet` stacks are now 8 px apart:

```html
<lc-toast-outlet />
```

- **Stories:** `feedback-toast-outlet--stack-spacing`, `feedback-toast-outlet--bottom-stack-order`
