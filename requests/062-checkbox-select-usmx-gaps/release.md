# Release 062: @lifecorner/angular-ui-kit 3.42.0

- **Version:** 3.42.0 (minor, previous 3.41.0)
- **Release commit:** `release: 3.42.0` (see `git log`), on `feat/3.42-checkbox-select-usmx-gaps`

## Gates

Code unchanged since the developer's gate commit `b3bc8cc` (`git diff --stat b3bc8cc -- libs tools` empty before the version bump), so only build and pack ran here.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 319 suites, 6583 passed, 8 skipped (build.md, b3bc8cc) |
| Lint | 0 errors, 160 warnings (build.md) |
| Production build | 125 entries; `dist` has 3.42.0 (10.4 s) |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | 1175 stories (build.md) |
| Consumer check | Angular 22: 120 checks ok (build.md); 21 runs in CI on `main` |
| Package contents (`npm pack --dry-run`) | 438 files, 1.4 MB packed / 6.8 MB unpacked (3.41.0: 438, 1.4 / 6.8); 9 `src/styles/*.spec.ts` as before, no stories, `icon-names.json` and assets present |
| `generate:icon-names` + `git diff --exit-code -- libs/angular-ui-kit/src` (F-2) | green (run by the owner, 2026-11-17 10:20, Node v24.21.0): 5161 names, 49 inlined Tabler icons (39 inline); `git diff --exit-code` exit 0, no diff |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| F-2 | `ICON_MINUS` was written by hand "as the generator writes it"; generator run and diff check are clean | review F-2 | closed in this release (gate above) |
| N-1 | Changelog number `14:1` | review N-1 | fixed in this release (7.4:1 / 3.4:1) |
| 062-n1 | `lc-select` long group header is 3 lines (66 px) at 360 px, 1 line at 1280 | build.md Deviation 2 (accepted) | backlog |

## Release through the pipeline

1. F-2 is green: release commit, `git switch main && git merge --ff-only <branch>`, `git push origin main`, wait for CI
2. The annotated tag `v3.42.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.42.0` (public after the owner's approval)
- **Closes:** services-prove-2026-11-15 row 1; usm-x 2026-11-17 rows 1, 2, 3, 5, 9, 10, 15; 061-s1, 061-s2, 061-s3, 061-n1, 061-n2, 060-n4, 058-n2
- **Use it:**

```html
<lc-select [options]="groupedOptions" label="Kunde" />
<lc-checkbox label="Aktiv" [checked]="true" readonly />
<lc-button ariaPressed="true" ariaControls="panel">Spalten</lc-button>
<lc-input label="E-Mail" [invalid]="true" />
<lc-spinner size="xs" />
```

```ts
providers: [{ provide: LC_ICON_BASE_PATH, useValue: '/usmx/tabler-icons' }]
```

- **Stories:** `form-select--grouped-options-de`, `form-checkbox--readonly-and-disabled`, `form-checkbox--sizes-with-help-text`
