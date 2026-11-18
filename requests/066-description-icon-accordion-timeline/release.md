# Release 066: @lifecorner/angular-ui-kit 3.46.0

- **Version:** 3.46.0 (minor, previous 3.45.0)
- **Release commit:** see `git log` (`release: 3.46.0`) on `feat/3.46-description-icon-accordion-timeline`

## Gates

Code unchanged since gate commit `4eb369a` (`git diff --stat 4eb369a -- libs tools` is empty before the version bump), so the developer's results stand; the release ran build and pack.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 355 suites, 7038 passed, 8 skipped (build.md, 4eb369a) |
| Lint | 0 errors, 160 warnings (baseline) |
| Production build | ok, 127 entries; 9.9 s; `dist` version 3.46.0 |
| Tool tests | 22/22 (tools unchanged) |
| Storybook build | ok (build.md) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | `--only=22` PASS, 132 checks (developer); CI runs the matrix on `main` |
| Package contents (`npm pack --dry-run`) | 444 files, 1.5 MB packed / 7.4 MB unpacked (3.45.0: 444, 1.5 / 7.4 MB); 9 styles specs (known), no stories; `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 066-n1 | A total row's 1 px rule above and double rule below run to the row ends, so they bend at the clickable row's rounded corners (`--border-radius-sm`; *Item Icons* rows md clickable, 1280 L). Pre-existing. | review.md F-6 | backlog |

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.46.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.46.0` (public after the owner's approval)
- **Closes:** kosten-2026-11-17 rows 3 and 4; 065-s1; 065-n1
- **Use it:**

```ts
items: DescriptionListItem[] = [
  { term: 'Forecast', value: '+12.400,00 €', icon: 'arrow-up' },
];
```

```html
<lc-description-list [items]="items" />
<!-- an lc-accordion inside another one's body keeps its own state -->
<lc-timeline [items]="steps" orientation="horizontal" scrollLabel="Steps" />
```

- **Stories:** *Item Icons* (description-list), *Verschachtelt* and *Nested Variants* (accordion), *Horizontal, German* (timeline)
