# Release 024: @lifecorner/angular-ui-kit 3.19.0

- **Version:** 3.19.0 (minor, previous 3.18.0)
- **Release commit:** `release: 3.19.0` on `feat/3.19-review-findings-follow-up`, then fast-forwarded to `main`

## Gates

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 205 suites, 4696 passed, 8 skipped (developer, `6482296`; `libs`/`tools` unchanged since) |
| Lint | 0 errors, 162 warnings (baseline; developer) |
| Production build | green, `dist` version 3.19.0 (release run, 11 s) |
| Tool tests | 22 / 22 (developer) |
| Storybook build | 961 stories (+3) (developer) |
| Consumer check Angular 22 | 84 checks ok (developer, `f2efc10`); CI runs the full matrix on `main` |
| Package contents (`npm pack --dry-run`) | 424 files, 1.2 MB packed / 6.0 MB unpacked (3.18.0: same); no stories; 7 `src/styles/*.spec.ts` as before; `icon-names.json` present |

## Open follow-ups (review.md, listed in the changelog as "Known issues")

| # | Severity | What |
|---|---|---|
| 1 | should-fix | `lc-toast` message: long German compounds break without a hyphen; needs `hyphens: auto` with its own baseline compare |
| 2 | nit | `lc-toast` `:host` rules are dead under `ViewEncapsulation.None`; fixing changes standalone toast widths |
| 3 | nit | `lc-drawer` close is 32 × 32, not 44 × 44 |
| 4 | nit | pre-existing axe hits (`.lc-nc__filter` contrast, drawer form input names); about 30 `lc-icon` sites without `decorative`/`ariaLabel` |

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.19-review-findings-follow-up`, `git push origin main`
2. Wait for CI on the release commit, then push the annotated tag `v3.19.0` (starts `publish-npm.yml`: tests, build, `npm stage publish` with provenance)
3. Public once the owner approves the npm stage with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.19.0` (public after the owner's approval)
- **Closes:** 020 S2 (menu danger contrast), 021 F1 (`cellClass`), 021 F2 (pagination, `pageSizeLabel`, toast targets), 023 follow-up (`svg-img-alt`)
- **Use it:**

```html
<lc-table [columns]="columns" [data]="rows" [paginate]="true" pageSizeLabel="/ Seite" />
```

```ts
columns: TableColumn[] = [{ key: 'account', label: 'Konto', cellClass: 'account-name' }];
```

- **Stories:** `data-display-table--pagination-sizes`, `feedback-toast--with-action`, `feedback-drawer--without-heading` on design.life-cockpit.de
