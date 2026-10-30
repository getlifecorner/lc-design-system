# Release 019: @lifecorner/angular-ui-kit 3.14.0

- **Version:** 3.14.0 (minor, previous 3.13.1)
- **Release commit:** `release: 3.14.0` on `feat/3.14-app-shell-full-height-nav`, then fast-forwarded to `main`

## Gates

Code (`libs`, `tools`) is unchanged since gate commit 1129403 (`git diff --quiet` holds), so the developer's results stand. The release reran the build and the pack with the new version.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 185 suites, 4412 passed, 8 skipped (build.md, 1129403) |
| Lint | 0 errors, 162 warnings (unchanged) |
| Production build | success, 9.0 s; `dist/…/package.json` says 3.14.0 |
| Tool tests | 22 / 22 |
| Storybook build | success, 920 stories (build.md) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | PASS on 21.0.9, 21.2.25, 22.0.8, 22.2.4; 74 HTML checks each |
| Package contents (`npm pack --dry-run`) | 421 files, 1.2 MB packed, 5.9 MB unpacked (3.13.1: 421 files, 1.2 MB, 5.8 MB); no stories, no specs apart from the 7 known `src/styles/*.spec.ts`; `icon-names.json` and assets present |

## Open items from review r2 (not blocking)

| # | Severity | Item |
|---|---|---|
| S2 | should-fix | full-height-nav-horizon shows "Produkt" twice (header title and rail brand). The `navPlacement` JSDoc, argType and docs should say the header's `title` then names the page |
| N3 | nit | The brand block's 1 px `border-bottom` stops at the rail edge under a header without a border in that story |

Both are in the changelog under *Known*. Follow-up for a later request: keep the header logo below 1024 px only.

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.14-app-shell-full-height-nav`, then `git push origin main`
2. Wait for CI on the release commit
3. Annotated tag `v3.14.0` on the release commit starts `publish-npm.yml`: tests, build, `npm stage publish` (OIDC, provenance)
4. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.14.0` (public after the owner's approval)
- **Closes:** rows 1–4 of app-shell-2026-10-30: navPlacement (G1), sidenav text brand (G2), shell background hooks (G3), stat-trend sentiment (G4)
- **Use it:**

```html
<lc-app-shell navPlacement="full-height" style="--lc-app-shell-bg: linear-gradient(var(--color-land-1), var(--color-land-2), var(--color-land-3))">
  <lc-header shell-header [showLogo]="false" title="Overview" />
  <lc-sidenav shell-nav theme="dark" brandName="Finance Intelligence" brandIcon="presentation-chart-line"
    [showCollapseToggle]="true" [items]="items" />
  <main>…</main>
</lc-app-shell>

<lc-stat-trend label="Costs" value="48.2 M" change="+3.1 %" sentiment="negative" />
```

- **Stories:** `layout-app-shell--full-height-nav`, `…--full-height-nav-horizon`, `…--tinted-background`; `navigation-sidenav--text-brand`, `…--text-brand-collapsed-vs-expanded`, `…--text-brand-german`, `…--text-brand-drawer-german`; `charts-stat-trend--costs`, `…--sentiment`
