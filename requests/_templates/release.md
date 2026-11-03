# Release <NNN>: @lifecorner/angular-ui-kit <X.Y.Z>

- **Version:** <X.Y.Z> (<patch | minor | major>, previous <A.B.C>)
- **Release commit:** <short hash> on `<branch>`

## Gates

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | <suites / tests> |
| Lint | |
| Production build | |
| Tool tests | |
| Storybook build | |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | |
| Package contents (`npm pack --dry-run`) | <files, size; previous size> |

## Open items

Every finding this release doesn't fix. `queue` = open `must-fix` or `should-fix` (a measured WCAG 2.2 AA failure counts); `backlog` = nits, known limits, wording (also appended to `requests/BACKLOG.md`).

| ID | Finding | Source | Route |
|---|---|---|---|
| <F-n> | <one line, with the measured value> | <review.md finding n> | <queue \| backlog> |

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`, and wait for CI
2. The annotated tag `v<X.Y.Z>` on the release commit, pushed alone: starts `publish-npm.yml` (tests, build, `npm stage publish` with OIDC and provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@<X.Y.Z>` (public after the owner's approval)
- **Closes:** <gap IDs>
- **Use it:**

```html
<snippet>
```

- **Stories:** <story IDs on design.life-cockpit.de>
