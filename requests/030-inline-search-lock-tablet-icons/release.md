# Release 030: @lifecorner/angular-ui-kit 3.22.0

- **Version:** 3.22.0 (minor, previous 3.21.1)
- **Release commit:** see `git log` (`release: 3.22.0 — …`) on `feat/3.22-inline-search-lock-tablet-icons`, fast-forwarded to `main`

## Gates

Code unchanged since the developer's gate commit 7b1537d (`git diff --stat 7b1537d -- libs tools` empty), so only build and pack ran here; the rest is from `build.md`.

| Gate | Result |
|---|---|
| Unit tests | 211 suites, 4893 passed, 8 skipped (build.md, 7b1537d) |
| Lint | 0 errors, 162 warnings, unchanged (build.md) |
| Production build | green, 18.6 s; `dist/…/package.json` says 3.22.0 |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | 972 stories, +4 (build.md) |
| Consumer check | Angular 22 PASS, 87 HTML checks (build.md); CI runs the full matrix on `main` |
| Package contents | 424 files, 1.2 MB packed / 6.1 MB unpacked (3.21.1: 424, 1.2 / 6.1); no stories or component specs; `icon-names.json` present |

## Open review items (visible, not blocking)

Nits 2–5 of `review.md` stay open: log-viewer story clock (`Date.UTC`), unused `caption` arg in `SearchLockTabletIcons`, long names in the "Icon constants" story at 1280, log-viewer axe findings (F-7). Nits 4 and 5 are listed under Known in the changelog. Finding 1 (size line) is fixed in the changelog.

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`
2. Wait for CI, then push the annotated tag `v3.22.0`, which starts `publish-npm.yml`: tests, build, `npm stage publish` (OIDC, provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.22.0` (public after the owner's approval)
- **Closes:** BA-6 (search-input placeholder "?"), BA-7 (`lock`, `device-tablet` inline)
- **Use it:**

```ts
import { provideLcIcons, ICON_LOCK, ICON_DEVICE_TABLET } from '@lifecorner/angular-ui-kit/icons';

provideLcIcons([ICON_LOCK, ICON_DEVICE_TABLET], { unregistered: 'placeholder' });
```

```html
<lc-search-input />  <!-- draws its own magnifier, no ICON_SEARCH needed -->
<lc-icon name="lock" />
```

- **Stories:** `components-icon--registered-with-placeholder-mode`, `form-search-input--app-registers-no-icons`, `data-display-logviewer--app-registers-no-icons`, plus Components/Icon "Search, Lock and Tablet Icons"
