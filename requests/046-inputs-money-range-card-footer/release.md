# Release 046: @lifecorner/angular-ui-kit 3.29.0

- **Version:** 3.29.0 (minor, previous 3.28.0)
- **Release commit:** see `git log` (`release: 3.29.0 — …`) on `feat/3.29-inputs-money-range-card-footer`, then `main`

## Gates

Code unchanged since the developer's gate commit 226c56d5 (`git diff --stat 226c56d5 -- libs tools` empty before the version bump), so the developer's results stand; CI runs them again on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 239 suites, 5602 passed, 8 skipped (developer, build.md) |
| Lint | 0 errors, 162 warnings (baseline) (developer) |
| Production build | success with 3.29.0 (9.7 s here); `dist/…/package.json` says 3.29.0 |
| Tool tests | 22/22 (developer) |
| Storybook build | success, 1050 stories (+9) (developer) |
| Consumer check Angular 22 | PASS, 98 HTML checks (developer; CI runs the matrix) |
| Package contents (`npm pack --dry-run`) | 426 files, 1.3 MB packed / 6.4 MB unpacked (3.28.0: 426, 1.3 / 6.3 MB); no stories; spec files are the known `src/styles/*.spec.ts`; `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 046-f1 | `lc-datepicker` clear button 20 × 20 px, axe `target-size` (WCAG 2.5.8), day and month mode, pre-existing | review finding 1 | queue |
| 046-f2 | `lc-datepicker` day mode, dark: selected day fill 2.78:1 on the surface (1.4.11), pre-existing; month mode already has an inset ring | review finding 2 | queue |
| 046-n3 | Day panel targets nav 32, today 31, days 36 px (kit rule 44; AA passes) | review finding 3 | backlog |
| 046-n4 | Month mode: Enter after a half-typed „2026-1“ keeps the half text until blur | review finding 4 | backlog |

## Release through the pipeline

1. Fast-forward `main` to the release commit, push, wait for CI
2. Annotated tag `v3.29.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.29.0` (public after the owner's approval)
- **Closes:** finance-intelligence regeln-2026-11-03 rows 1–4; life-os CC-1, CC-2
- **Use it:**

```html
<lc-datepicker granularity="month" format="YYYY-MM" [(ngModel)]="validFrom" />
<lc-combobox [options]="categories" [(selectedValue)]="categoryValue" />
<lc-number-input [(ngModel)]="rate" locale="de-DE" suffix="%" suffixAriaLabel="Prozent" size="lg" />
<lc-money [amountMinor]="999" [rangeToMinor]="1299" currency="EUR" locale="de-DE" />
<lc-card footerLayout="equal">
  <div card-footer>
    <lc-button variant="outline" size="lg" [fullWidth]="true">Stimmt</lc-button>
    <lc-button variant="outline" size="lg" [fullWidth]="true">Kein Vertrag</lc-button>
  </div>
</lc-card>
```

- **Stories:** `form-datepicker--month`, `form-datepicker--month-de`, `form-combobox--starts-with-a-choice`, `form-number-input--locale-de-with-suffix`, `form-number-input--sizes`, `data-display-money--range`, `components-card--equal-footer`, `components-card--equal-footer-german`, `components-card--equal-footer-link-card`
