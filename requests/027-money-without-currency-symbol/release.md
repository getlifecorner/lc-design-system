# Release 027: @lifecorner/angular-ui-kit 3.20.0

- **Version:** 3.20.0 (minor, previous 3.19.2)
- **Release commit:** the commit `release: 3.20.0 — …` on `feat/3.20-money-without-currency-symbol`, then fast-forwarded to `main`

## Gates

Code unchanged since the developer's gate commit `30d328b` (`git diff --stat 30d328b -- libs tools` empty), so tests, lint, tool tests, Storybook build and compat are taken from `build.md`; CI runs them again on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 209 suites, 4762 passed, 8 skipped (build.md, 30d328b) |
| Lint | 0 errors, 162 warnings (baseline) (build.md) |
| Production build | ok, 9.2 s here; `dist/.../package.json` says 3.20.0 |
| Tool tests | 22/22 (build.md) |
| Storybook build | ok, 963 stories (+1) (build.md) |
| Consumer check | Angular 22: 85 HTML checks ok incl. `compat-money-bare` (build.md); 21.0, 21 and 22.0 run in CI |
| Package contents (`npm pack --dry-run`) | 424 files, 1.2 MB packed / 6.0 MB unpacked (3.19.2: same); no specs or stories except the 7 known `src/styles/*.spec.ts`; assets (37 entries) and `icon-names.json` present |

## Open review items (should-fix, not blocking)

| # | Item | Handling |
|---|---|---|
| 1 | Last sentence of "Added" must not promise that the page drops the hidden „Euro“ everywhere | Fixed in the changelog (review wording) |
| 2 | `money.stories.ts` Number Column description: add that a `formatMoney(…).text` formatter string has no spoken text | Open, docs only; listed as "Known" in the changelog; `web-developer` in the next release |

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.20-money-without-currency-symbol`, then `git push origin main` (also pushes the local docs commit 321214d)
2. Wait for CI, then the annotated tag `v3.20.0` on the release commit starts `publish-npm.yml`: tests, build, `npm stage publish` (OIDC, provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.20.0` (public after the owner's approval)
- **Closes:** gap file row 1 (services-2026-11-01, `services.md` §5.1 and §7); 026 review finding 2 (toast and alert variant icon contrast)
- **Use it:**

```html
<lc-table [columns]="columns" [data]="data" caption="Services">
  <ng-template lcTableCell="cost" let-row>
    <lc-money [amountMinor]="row.cost" currency="EUR" locale="de-DE" [showCurrency]="false" />
  </ng-template>
</lc-table>
```

```ts
formatMoney(-4217, 'EUR', { locale: 'de-DE', showCurrency: false });
// { text: '−42,17', spoken: 'minus 42,17 Euro' }
```

  The column header names the unit („Kosten in €“); the spoken text still says „Euro“. A `formatMoney(…).text` string in a table `formatter` has no spoken text, so prefer `lc-money` in a cell template.
- **Stories:** `data-display-money--number-column`, `feedback-toast--all-variants`, `feedback-alert--all-variants`
