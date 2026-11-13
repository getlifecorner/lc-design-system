# Release 061: @lifecorner/angular-ui-kit 3.41.0

- **Version:** 3.41.0 (minor, previous 3.40.0)
- **Release commit:** on `feat/3.41-checkbox-group-chip-story-contrast`, then fast-forwarded to `main`

## Gates

Code unchanged since the developer's gate tree (`git diff --stat 636aef3 -- libs tools` empty before the version bump), so only build and pack ran here.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 311 suites, 6486 passed, 8 skipped (build.md, 636aef3) |
| Lint | 0 errors / 160 warnings (build.md) |
| Production build | 125 entries, `dist` version 3.41.0 (9.7 s, `tmp/061/release-build.log`) |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | built (build.md) |
| Consumer check Angular 22 | PASS 22.2.6, 116 checks (build.md); CI runs the full matrix on `main` |
| Package contents (`npm pack --dry-run`) | 438 files, 1.4 MB packed / 6.8 MB unpacked (3.39.0: 435, 1.4 / 6.7); no stories or feature specs, assets and `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 061-s1 | Disabled checked `lc-checkbox` looks unchecked: white check on `#f3f4f6` at .5, 1.02:1 light (dark 5.14); keep the primary fill dimmed | review F-1 | queue |
| 061-s2 | `lc-chip` hover in `lc-hero` ignores `--lc-chip-bg`: 1.05–1.11:1 with a custom ink (component fix) | review F-2, design D-1 | queue |
| 061-s3 | `lc-checkbox` box border 2.54:1 at rest (light), error 2.24:1 on the dark page, under 3:1 (WCAG 1.4.11); `lc-radio` uses `--color-field-border` | review F-3, design D-2 | queue |
| 061-n1 | `lc-checkbox` help/error indent computes 0 (`calc(var(--checkbox-size) + .5rem)`) | review F-4, design B-1 | backlog |
| 061-n2 | Standalone `lc-checkbox lg` row is 29 px, not 44 px as in `lc-radio lg` | review F-5, design B-2 | backlog |
| 061-n3 | `lc-radio-group`: `*` is an `aria-label` on a bare span and the error sits above the options | review F-6, design B-3/B-4 | backlog |

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.41.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.41.0` (public after the owner's approval)
- **Closes:** benutzer-2026-11-12 row 1 (finance-intelligence, spec 014); 060-s1
- **Use it:**

```html
<lc-checkbox-group legend="Rollen" helpText="Mehrere Rollen sind möglich."
  size="lg" [required]="true" [error]="rolesError" [formControl]="roles">
  <lc-checkbox value="administration" label="Administration" />
  <lc-checkbox value="controlling" label="Controlling" />
  <lc-checkbox value="cfo" label="CFO" />
</lc-checkbox-group>
```

  `roles` holds a `string[]`; set `rolesError` to „Wählen Sie mindestens eine Rolle.“ (e.g. with `Validators.required`). Use `size="md"` on desktop.
- **Stories:** `Form/Checkbox Group` (Default, Hidden Legend, With Error, Required, Disabled, Phone (lg), Horizontal, Form Control) and `Form/Checkbox` → Checkbox Group; `Data Display/Chip` → Hooks On An Ancestor.
