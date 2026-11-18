# Release 067: @lifecorner/angular-ui-kit 3.47.0

- **Version:** 3.47.0 (minor, previous 3.46.0)
- **Release commit:** see `git log` (`release: 3.47.0`) on `feat/3.47-number-waterfall-usmx-sidenav`

## Gates

Code unchanged since the developer's gate commit f5756e3 (`git diff --quiet f5756e3 -- libs tools` holds), so results come from `build.md`; the release reran build and pack.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 358 suites, 7107 passed, 8 skipped (f5756e3) |
| Lint | 0 errors, 160 warnings (unchanged) |
| Production build | 127 entries; rerun 10.2 s, `dist/.../package.json` = 3.47.0 |
| Tool tests | 22/22 |
| Storybook build | built |
| Consumer check Angular 22 | PASS, 135 checks (CI runs the full matrix on `main`) |
| Package contents (`npm pack --dry-run`) | 444 files, 1.5 MB packed / 7.5 MB unpacked (3.46.0: 444, 1.5 MB / 7.4 MB); no component specs or stories; 9 packed styles specs as before; `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 067-s1 | Sidenav row actions are invisible on touch (`hover: none`) at every level yet a 44 × 44 box answers taps; proposal `@media (hover: none)` → opacity 1 | review F-2 | queue |
| 067-s2 | `lc-number-input` `locale="de-DE"`: typed „2.960,00“ becomes 2,96 and „1.234“ becomes 1,234 (grouping point misread; since 3.29, silent) | review F-3 | queue |
| 067-s3 | Sidenav stories with hard-coded content box colours (`#f9fafb`, `#666`, `#333`): *With Groups And Actions* dark h3 contrast 1.04, axe `color-contrast`; docs surface only | review F-9 | queue |
| 067-n1 | *Deep Tree* 360 status line not visible | review F-4 | backlog |
| 067-n2 | Waterfall 9 bars at 360: value labels overlap; docs advice | review F-5 | backlog |
| 067-n3 | number-input forced-colours focus mark | review F-6 | backlog |
| 067-n4 | Declarative popup state for sidenav actions | review F-7 | backlog |
| 067-n5 | `notification-center.icons.spec.ts` flake under load | review F-8 | backlog |

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.47.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.47.0` (public after the owner's approval)
- **Closes:** finance-intelligence kosten-2026-11-18 rows 5, 6; usm-x 2026-11-18 rows 38–46
- **Use it:**

```html
<lc-number-input [showSteppers]="false" locale="de-DE" suffix="€" [(value)]="amount" />
<lc-waterfall-chart [items]="causes" [wrapLabels]="true" />
<lc-sidenav [items]="items" [highlight]="query" [(expandedGroups)]="open" (itemActionClick)="openMenu($event)">
  <div sidenav-top><lc-search-input /></div>
</lc-sidenav>
```

- **Stories:** `form-number-input--amount-without-steppers`, `form-number-input--sizes-without-steppers`, `charts-waterfall-chart--german-cause-names`, `charts-waterfall-chart--five-causes`, `navigation-sidenav--top-slot`, `navigation-sidenav--brand-and-hooks`, `navigation-sidenav--deep-tree`
