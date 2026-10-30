# Release 020: @lifecorner/angular-ui-kit 3.15.0

- **Version:** 3.15.0 (minor, previous 3.14.0)
- **Release commit:** on `feat/3.15-app-shell-prove-gaps`, then fast-forwarded to `main`

## Gates

`git diff 1195039 -- libs tools` is empty (the developer's gate commit), so the code gates are taken from `build.md`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 192 suites, 4493 passed, 8 skipped (developer, `1195039`) |
| Lint | 0 errors, 162 warnings (baseline) |
| Production build | 121 entries; rerun after the version bump 9.1 s; `dist/.../package.json` says 3.15.0 |
| Tool tests | 22 / 22 |
| Storybook build | 931 stories (920 + 11) |
| Consumer check Angular 22 | PASS, 79 / 79 HTML checks (developer); CI runs the full matrix on `main` |
| Package contents (`npm pack --dry-run`) | 421 files, 1.2 MB packed / 5.9 MB unpacked (3.14.0: 421, 1.2 / 5.9); `icon-names.json` in; the only `.spec.ts` files are the 7 known `src/styles/*.spec.ts`; no stories |

## Open review findings (no must-fix)

| # | Severity | Note |
|---|---|---|
| S1 | should-fix | `messageSize="md"` heading does not wrap at 320 px for a 31-letter word (fits at 360); in the changelog "Known" |
| S2 | should-fix, pre-existing | `lc-menu` `--danger` item 2.06:1 in dark; needs its own fix request; in the changelog "Known" |
| N1 | nit | *Hooks On An Ancestor*, last pair: the override equals the active fill |
| N2 | nit, pre-existing | header menu with `userName=""`: email not centred on the avatar |
| N3 | nit | `:has()` rule shares a selector list in `empty-state.component.scss` |

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.15-app-shell-prove-gaps`, then `git push origin main`
2. Wait for CI, then push the annotated tag `v3.15.0`; it starts `publish-npm.yml` (tests, build, `npm stage publish` with provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.15.0` (public after the owner's approval)
- **Closes:** gap file rows 1–7 (app-shell-prove-2026-10-30)
- **Use it:**

```html
<lc-app-page paddingX="header" paddingTop="md">
  <lc-page-header paddingTop="none" title="No role yet" />
  <lc-empty-state iconTone="primary" messageSize="md" icon="lock" heading="No access yet" message="Ask your administrator.">
    <a lcButton variant="outline" tone="primary" href="/help">Get help</a>
  </lc-empty-state>
</lc-app-page>
<lc-header userAvatarFallback="person" />
<lc-avatar fallback="person" />
```

  Sidenav rail colour on a wrapper: `--lc-sidenav-bg: var(--color-primary-fill-active)` now reaches `lc-sidenav` and `lc-sidenav-placeholder`.

- **Stories:** `layout-app-shell--state-page-aligned`, `--state-page-loading`, `--page-padding-per-breakpoint`; Layout/Page Header "Padding Top"; Feedback/Empty State "Primary Tone", "State Page"; Data Display/Avatar "Person Fallback"; Navigation/Header "Avatar Person Fallback"; Button and Button Link "Outline Primary Tone"; Navigation/Sidenav Placeholder "Hooks On An Ancestor"
