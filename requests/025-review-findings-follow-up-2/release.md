# Release 025: @lifecorner/angular-ui-kit 3.19.1

- **Version:** 3.19.1 (patch, previous 3.19.0)
- **Release commit:** `release: 3.19.1` on `fix/3.19.1-review-findings-follow-up-2`, then fast-forward to `main`

## Gates

Code (`libs`, `tools`) is unchanged since the developer's gate commit 763d8f3 (`git diff --stat 763d8f3 -- libs tools` empty before the version bump), so the developer's results stand; CI runs tests, build and the compat matrix again on `main`.

| Gate | Result |
|---|---|
| Unit tests | 208 suites, 4721 passed, 8 skipped (build.md, 763d8f3) |
| Lint | 0 errors, 162 warnings (baseline; build.md) |
| Production build | green after the version bump, 16 s, `dist` says 3.19.1 |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | green, 962 stories (build.md) |
| Consumer check | Angular 22 PASS, 85 checks (build.md); the full matrix runs in CI |
| Package contents | 424 files, 1.2 MB packed / 6.0 MB unpacked (= 3.19.0); assets, styles and `icon-names.json` in; the only specs are the 7 known `src/styles/*.spec.ts` |

## Open items (not blockers)

| # | Severity | Item | Route |
|---|---|---|---|
| 1 | should-fix, pre-existing since 3.19.0 | Toast close × in dark: 1.47 / 1.22:1 (UA `buttontext`, black focus ring); changes the outlet stories | Follow-up request (changelog "Known") |
| 2 | nit, fixed in the changelog | "1.89 to 4.37:1" corrected to "1.89:1 at its lowest". The same wording remains in a comment at `notification-center.component.scss:113`; not changed here (no library edits by the release-manager, comment only) | Next change to that file |
| 3 | nit | Story German Heading: `lang="de"` also marks the English body as German | Follow-up request (changelog "Known") |

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`
2. Wait for CI on the release commit, then push the annotated tag `v3.19.1` on it; the tag starts `publish-npm.yml` (tests, build, `npm stage publish` with provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.19.1` (public after the owner's approval)
- **Closes:** the open findings F1 to F4 of request 024 (toast wrapping and host width, drawer close target and heading, notification-center chip and badge contrast, unlabelled icons)
- **Use it:** a toast placed directly is now a block card, at most 400 px wide; to fill the parent:

```html
<lc-toast class="my-toast" [toast]="savedToast" />
```

```css
.my-toast { max-width: none; }
```

- **Stories:** `feedback-toast--with-action`, `feedback-toast--success`, `feedback-toast--all-variants`, `feedback-toast-outlet--service-call`, Feedback/Drawer "German Heading", "Filter Panel", "Large Form", Feedback/Notification Center stories
