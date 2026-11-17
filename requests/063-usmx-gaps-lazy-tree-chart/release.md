# Release 063: @lifecorner/angular-ui-kit 3.43.0

- **Version:** 3.43.0 (minor, previous 3.42.0)
- **Release commit:** see `git log` (`release: 3.43.0 — …`) on `feat/3.43-usmx-gaps-lazy-tree-chart`, fast-forwarded to `main`

## Gates

Code unchanged since the developer's gate commit `bc926d2` (`git diff --stat bc926d2 -- libs tools` empty before the version bump), so tests, lint, tool tests and the Storybook build are taken from build.md.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | build.md r2: 326 suites, 6677 passed, 8 skipped |
| Lint | build.md r2: 0 errors, 160 warnings (= 3.42) |
| Production build | 3.43.0 in `dist/libs/angular-ui-kit/package.json`; 125 entries; 9.4 s |
| Tool tests | build.md r2: 22 / 22 |
| Storybook build | build.md r2: built, 1189 stories (+14) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | PASS on 21.0 (core 21.0.9), 21 (21.2.26), 22.0 (22.0.8), 22 (22.2.6); `tmp/063/compat.log` |
| Package contents (`npm pack --dry-run`) | 438 files, 1.4 MB packed / 6.9 MB unpacked (3.42.0: 438 files, 1.4 MB / 6.8 MB); no stories or component specs; assets, styles and `icon-names.json` (80 kB) present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 063-n1 | *Gaps And Forecast*: Plan and Ist differ by hue only (1.40:1 light, 1.07:1 dark luminance); default chart palette | review F4 | backlog |
| 063-n2 | Multi-line `lc-textarea` keeps a 6 px line gap below the field (pre-existing; fix moves every host −6 px) | review F5 | backlog |

Both are in `requests/BACKLOG.md` and in the changelog under *Known*. Nothing for `queue`. Usm-x rows 4, 11, 14, 16, 17, 20 were already returned to the inbox.

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.43-usmx-gaps-lazy-tree-chart`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.43.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.43.0` (public after the owner's approval)
- **Closes:** kosten-2026-11-17 rows 1, 2 (finance-intelligence "Kosten"); usm-x 2026-11-17 rows 6, 7, 8, 12, 13, 18, 19
- **Use it:**

```html
<lc-table [data]="budgets" idKey="id" parentKey="parentId" hasChildrenKey="hasPlanItems" (rowToggle)="loadPlanItems($event)" />

<lc-line-chart [series]="[
  { label: 'Actual', data: [40, 44, 47, null, null] },
  { label: 'Forecast', data: [null, null, 47, 50, 52], dashed: true }
]" />

<lc-number-input valueType="string" [(ngModel)]="amount" style="--lc-number-input-value-width: calc(7ch + 0.5rem)" />
<lc-alert role="alertdialog" variant="warning"
  style="--lc-alert-bg: color-mix(in srgb, var(--color-accent-yellow) 16%, transparent); --lc-alert-border: var(--color-accent-yellow)" />
<lc-icon name="x" style="--lc-icon-size: 18px" />
```

- **Stories:** `data-display-table--tree-lazy-rows`, `charts-line-chart--gaps-and-forecast`, `form-textarea--one-line`, `form-textarea--one-line-chat-de`, `feedback-alert--blocking-question`, `feedback-alert--custom-colors-de`, `navigation-menu--sections-de`, `navigation-menu--light-panel-in-dark-scope`, `form-number-input--string-mode`, `components-icon--size-hook`
