# Release 015: @lifecorner/angular-ui-kit 3.11.5

- **Version:** 3.11.5 (patch, previous 3.11.4; not on npm, no tag)
- **Release commit:** the commit `release: 3.11.5` on `fix/3.11.5-label-in-name-remaining`, fast-forwarded to `main`

## Gates

`libs` and `tools` are identical to `2ae088e`, the commit of the developer's gates (`git diff --quiet` holds), so those results are taken from `build.md`; CI runs them again on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | build.md: 177 suites, 4282 passed, 8 skipped (axe-core 4.14.0) |
| Lint | build.md: 0 errors, 162 warnings (= baseline) |
| Production build | green, 9.1 s (this run); `dist/.../package.json` says 3.11.5 |
| Tool tests | build.md: 22 / 22 |
| Storybook build | build.md: green, 899 stories |
| Consumer check | build.md: Angular 22 PASS, 63 HTML checks; CI runs the full matrix |
| Package contents (`npm pack --dry-run`) | 421 files (3.11.4: 418; +3 for `internal/a11y`), 1.2 MB packed, 5.8 MB unpacked (previous 1.2 / 5.8); no stories or component specs; `icon-names.json` present (`tmp/015/pack.log`) |

Review: approved, no open must-fix. Review finding 1 (rich accordion header labels that repeat the template) is a *Compatibility* line in the changelog; nit 2 is a pointer to `tmp/015/axe-baseline-1280-light.log` (the 31 stories before) in the changelog.

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`; wait for CI
2. Tag `v3.11.5` (`v3.11.5 – <summary>`) on the release commit: starts `publish-npm.yml` (tests, build, `npm stage publish`, OIDC, provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.11.5` (public after the owner's approval)
- **Closes:** AS-33 follow-up: no `label-content-name-mismatch` (axe-core 4.14) left in the kit; 31 stories before (1280 px), 0 after
- **Use it:** nothing to change in templates. Exact-name tests need the new names; a rich accordion header should drop an `ariaLabel` that only repeats its text:

```html
<lc-accordion ariaLabel="Pipeline run">
  <ng-template lcAccordionHeader>Item One&ngsp;<strong>Complete</strong></ng-template>
  <p>Details</p>
</lc-accordion>
<!-- name: "Pipeline run, Item One Complete" -->
```

- **Stories:** `navigation-stepper--localized` (new), `components-accordion--rich-header`, `components-accordion-group--rich-header-list`
