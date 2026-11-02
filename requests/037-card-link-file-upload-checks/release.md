# Release 037: @lifecorner/angular-ui-kit 3.24.0

- **Version:** 3.24.0 (minor, previous 3.23.1)
- **Release commit:** on `feat/3.24-card-link-file-upload-checks` (hash in the push reply)

## Gates

Code unchanged since the developer's gate commit c9dbdbf (`git diff --stat c9dbdbf -- libs tools` empty), so only build and pack ran here; the rest is taken from build.md.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | build.md: 217 suites, 5114 passed, 8 skipped |
| Lint | build.md: 0 errors, 162 warnings (baseline) |
| Production build | green, 9.2 s; `dist/.../package.json` says 3.24.0 |
| Tool tests | build.md: 22 / 22 |
| Storybook build | build.md: 993 stories |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | build.md: 22 PASS (91 checks); CI runs the matrix on `main` |
| Package contents (`npm pack --dry-run`) | 424 files, 1.2 MB packed / 6.2 MB unpacked (3.23.1: 424, 1.2 MB / 6.1 MB); no stories, no component specs; `icon-names.json` present |

## Release through the pipeline

1. ff-merge to `main`, push, wait for CI
2. Tag `v3.24.0` on the release commit starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.24.0` (public after the owner's approval)
- **Closes:** finance-intelligence "Quellen" rows 1–3 (concept quellen.md §7 rows 5, 3, 4)
- **Known:** axe `nested-interactive` on `.file-upload` (pre-existing), follow-up request
- **Use it:**

```html
<lc-card variant="outlined" title="SAP-Ist" headingLevel="h2"
         route="/quellen/usm" [queryParams]="{ ansicht: 'laeufe' }" />

<lc-file-upload accept=".csv" [multiple]="false" [maxSizeBytes]="20971520" locale="de-DE"
                (fileRejected)="onRejected($event)" />
```

```ts
onRejected(e: FileUploadRejection) {
  this.error.set(e.code === 'type' ? 'Nur CSV-Dateien.' : 'Die Datei ist zu groß.');
}
```

- **Stories:** `components-card--link-cards`, `components-card--link-cards-german`, `components-card--link-and-clickable`, `form-file-upload--type-rejected-on-drop`, `form-file-upload--size-rejected`, `form-file-upload--german-locale`
