# Release 073: @lifecorner/angular-ui-kit 3.52.0

- **Version:** 3.52.0 (minor, previous 3.51.0)
- **Release commit:** `release: 3.52.0 — …` on `feat/3.52-combobox-stat-trend-select` (see `git log -1`)

## Gates

Code unchanged since the developer's gate commit 2220cc2 (`git diff --stat 2220cc2 -- libs tools` empty), so tests, lint, tool tests and Storybook build are taken from build.md.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | build.md: 396 suites, 7618 passed, 8 skipped |
| Lint | build.md: 0 errors, 159 warnings (baseline) |
| Production build | green, 127 entries, dist version 3.52.0 (`tmp/073/build.log`) |
| Tool tests | build.md: tools unchanged |
| Storybook build | build.md: green |
| Consumer check Angular 21 · 22 | 22: green (build.md, 144 checks). 21 (21.2.26, cdk 21.2.14): green, 144 prerender checks (`tmp/073/compat21.log`) |
| Package contents (`npm pack --dry-run`) | 444 files, 1.7 MB packed, 8.0 MB unpacked (3.51.0: 444, 1.6 MB, 8.0 MB); no stories, no specs except the 9 known `src/styles/*.spec.ts`; assets and `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 073-F1 | `lc-select multiple` shows a hard-coded English „2 selected“ (`select.component.ts:311`); needs a label input, English default, German verified. Pre-existing | review F-1 | queue |
| 073-n1 | stat-trend RTL: „+12.5%“ renders „12.5%+“ | review F-2 | backlog |
| 073-n2 | number-input label: text-secondary, 2 px lower than select/combobox | review F-3 | backlog |
| 073-n3 | combobox has no `required` / `requiredIndicator` | review F-4 | backlog |
| 073-n4 | `[stat-trend-end]` needs the consumer's leading space; kit-side `&ngsp;` to reconsider | review F-5, build X-1 | backlog |

Deviations X-1 and X-2 were agreed in review.

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.52.0` on the release commit, pushed alone
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.52.0` (public after the owner's approval)
- **Closes:** massnahmen-prove-2026-11-22 row 5; cockpit-prove-2026-11-22 (stat-trend header); simulation-2026-11-24 row 1
- **Use it:**

```html
<lc-combobox label="Status" [options]="statuses" [clearable]="false" [(selectedValue)]="status" />

<lc-stat-trend fullWidth iconPlacement="after-label" label="Offene Maßnahmen" value="27">
  <lc-badge stat-trend-end tone="warning">&ngsp;Teilweise umgesetzt</lc-badge>
</lc-stat-trend>

<lc-select label="Branche" required [options]="industries" />
```

- **Stories:** Form/Combobox *Required single choice*; Data/Stat Trend *Header Arrangement*, *KPI Tile*, *Header RTL*; Form/Select *Label States (DE)*, *Labels in a Form (DE)* on design.life-cockpit.de
