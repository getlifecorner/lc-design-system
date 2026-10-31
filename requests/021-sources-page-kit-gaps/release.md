# Release 021: @lifecorner/angular-ui-kit 3.17.0

- **Version:** 3.17.0 (minor, previous 3.16.0)
- **Release commit:** see `git log -1` on `feat/3.17-sources-page-kit-gaps`, then fast-forwarded to `main`

## Gates

Libs and tools are unchanged since the developer's gate commit `d927ad0` (`git diff --stat d927ad0 -- libs tools` is empty), so their results are taken from build.md.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 201 suites, 4650 passed, 8 skipped (d927ad0) |
| Lint | 0 errors, 162 warnings (baseline) (d927ad0) |
| Production build | ok (rerun for the version bump, 14.3 s); `dist/.../package.json` says 3.17.0 |
| Tool tests | 22 pass (d927ad0) |
| Storybook build | ok, 955 stories (+5) (d927ad0) |
| Consumer check | Angular 22 PASS, 82 checks (af1a232; later changes are a story and a JSDoc comment). CI runs the matrix on `main` |
| Package contents | 424 files, 1.2 MB packed / 6.0 MB unpacked (3.16.0: 424, 1.2 / 6.0 MB). No component specs or stories; the 7 known `src/styles/*.spec.ts`; assets, styles and `icon-names.json` present |

## Open items (not blocking)

| Item | Where |
|---|---|
| Review nit 3: error badge in *Status Badges* keeps the 100 fill and reads heavier (intended) | changelog Known |
| F1: `cellClass` colour and font size never apply | follow-up request after 3.17 |
| F2: pagination "/ page" hard-coded English, clear button over the value, prev/next 28 px, 546 px at 200 % and 360 px | follow-up request after 3.17 |
| Toast close (28 × 28) and action (94 × 29) under 44 px | follow-up request after 3.17 |
| F3: headless Chromium forces no forced-colors palette (tooling note) | none |

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.17-sources-page-kit-gaps`, then `git push origin main`
2. Wait for CI on the release commit, then push the annotated tag `v3.17.0`; the tag starts `publish-npm.yml` (tests, build, `npm stage publish`, OIDC, provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.17.0` (public after the owner's approval)
- **Closes:** gap file quellen-2026-10-31, rows 1–5
- **Use it:**

```ts
columns: TableColumn[] = [
  { key: 'name', label: 'Quelle' },
  { key: 'amount', label: 'Betrag', align: 'end', sortable: true },
];
// negatives: cellStyle, not cellClass
{ key: 'delta', label: 'Änderung', align: 'end',
  cellStyle: (v) => (Number(v ?? 0) < 0 ? { color: 'var(--color-text-error)' } : {}) }
```

```html
<lc-button [loading]="loading()" (click)="load()">Laden</lc-button>
<lc-progress-bar [indeterminate]="true" />
```

`this.toast.show({ message: 'Quelle verbunden', variant: 'success' })` needs one `<lc-toast-outlet>` in the app.

- **Stories:** `data-display-table--number-columns`, `components-button--loading-keeps-focus`, `feedback-progress-bar--indeterminate-sizes`, `data-display-list--status-badges`, `feedback-toast-outlet--service-call`
