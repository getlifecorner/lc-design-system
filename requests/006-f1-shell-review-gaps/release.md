# Release 006: @lifecorner/angular-ui-kit 3.9.0

- **Version:** 3.9.0 (minor, previous 3.8.0)
- **Release commit:** 8719c1a on `feat/3.9-f1-shell-review-gaps`

## Gates

All gates passed on commit `2b151d1` (libs/tools tree unchanged since then).

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 154 suites, 3945 passed, 8 skipped, 0 failed |
| Lint | 0 errors, 162 warnings, none in changed files |
| Production build | ok, 9.3 s |
| Tool tests | 22 / 22 |
| Storybook build | ok, 19.4 s |
| Consumer check Angular 22.0 · 22 | PASS (22.2.3 and 22.0, 45 and 44 checks) |
| Package contents (`npm pack --dry-run`) | 418 files, 1.1 MB (previous 3.8.0: similar size) |

Package includes: assets (character SVGs), styles, icon-names.json. No component specs or stories.

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.9-f1-shell-review-gaps`, then `git push origin main`
2. `gh workflow run publish-npm.yml --ref main -f version=3.9.0`: tests, build, `npm stage publish` (OIDC, provenance), then the tag `v3.9.0` on the release commit
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.9.0` (public after the owner's approval)
- **Closes:** LK-12, AS-25, AS-26, AS-27, AS-29
- **Use it:**

```html
<!-- Shell footer on the land (LK-12) -->
<lc-app-shell [horizon]="true">
  <div shell-horizon-figure>
    <lc-character pose="hello" size="96" />
  </div>
  <footer shell-footer>
    <lc-footer [links]="footerLinks" size="compact" />
  </footer>
</lc-app-shell>

<!-- Secondary page header (AS-25) -->
<lc-page-header 
  title="Can't reach LifeCorner right now"
  size="secondary"
  level="2" />

<!-- Flush link button (AS-26) -->
<lc-stack justify="between">
  <button lcButton variant="link" size="lg" flush>Code erneut senden</button>
  <a lcButton variant="link" size="lg" flush 
     style="--lc-btn-flush-align: end">
    Anders anmelden
  </a>
</lc-stack>

<!-- Container-driven skeleton height (AS-27) -->
<div style="container-type: inline-size; width: 328px;">
  <lc-skeleton 
    variant="rectangle" 
    style="--lc-skeleton-height: calc(26.87cqi - 0.25rem)" />
</div>
```

- **Stories:** `components-app-shell--footer-on-the-horizon`, `components-app-shell--figure-on-the-horizon`, `components-page-header--secondary-levels`, `components-page-header--bilingual-page`, `components-button--flush`, `components-button-link--flush`, `components-skeleton--height-from-container`, `docs-horizon-design-tokens--docs`

## Open findings

- **review.md nit 3:** The Flush story's end row in `button-link.stories.ts` uses the default `stretch` alignment instead of `align-items: center`, so the one-line link's focus ring is 69 px high (same as the two-line link) instead of matching the label's 46.5 px box. This affects only the story, not consumer code or the component itself.
