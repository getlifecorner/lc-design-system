# Release 045: @lifecorner/angular-ui-kit 3.28.0

- **Version:** 3.28.0 (minor, previous 3.27.2)
- **Release commit:** see `git log` (`release: 3.28.0 — …`) on `feat/3.28-toast-offsets-page-aside-width`, then `main`

## Gates

Code unchanged since the developer's gates (`git diff --stat 2bfae1f -- libs tools` empty before the version bump), so only build and pack ran here.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 234 suites, 5513 passed, 8 skipped (build.md, 2bfae1f) |
| Lint | 0 errors, 162 warnings (baseline; build.md) |
| Production build | green, `dist` version 3.28.0 (9.7 s, `tmp/045/rel-build.log`) |
| Tool tests | 22/22 (build.md) |
| Storybook build | 1041 stories, +7 (build.md) |
| Consumer check | Angular 22 PASS, 97 HTML checks (build.md); CI runs the full matrix on `main` |
| Package contents (`npm pack --dry-run`) | 426 files, 1.3 MB packed / 6.3 MB unpacked (3.27.2: 426, 1.3 MB / 6.3 MB); no stories or component specs, `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 045-n1 | *Wide page* story table is 1119 px in 928 px: last column cut at rest | review r1, nit 1 | backlog |
| 045-n2 | Bottom toast stack order: newest error scrolled out at 200 % (3.27.2 behaviour) | review r1, nit 2 | backlog |
| 045-n4 | `top-*` toast covers a title under the header at 360 px (documented limit) | review r1, nit 4 | backlog |

Review nit 3 (changelog count) is fixed in the changelog. No `queue` items.

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.28.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.28.0` (public after the owner's approval)
- **Closes:** AS-34, AS-35, AS-36
- **Use it:**

```html
<lc-app-shell>…</lc-app-shell>
<lc-toast-outlet />   <!-- clears header and floating bar; toasts via ToastService, prefer bottom-* -->

<lc-app-page [reserveAside]="true">…</lc-app-page>

<lc-app-page contentWidth="wide">
  <lc-table page-wide [data]="accounts" [columns]="columns" />
</lc-app-page>
```

```css
lc-toast-outlet { --lc-toast-outlet-offset-top: 64px; --lc-toast-outlet-offset-bottom: 90px; }
```

- **Stories:** `app-shell` *Toasts in the shell*, *Reserved right column*, *Wide page*, *Wide page with a right column* (see Storybook IDs under Layout/App Shell); `toast-outlet` *Offsets*.
