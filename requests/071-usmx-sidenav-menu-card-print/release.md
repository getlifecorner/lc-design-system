# Release 071: @lifecorner/angular-ui-kit 3.50.0

- **Version:** 3.50.0 (minor, previous 3.49.1). One version for the whole bundle (owner decision 2026-11-20 12:43)
- **Release commit:** see the `release: 3.50.0` commit on `feat/3.50-usmx-sidenav-menu-card-print`

## Gates

Code (`libs`, `tools`) is unchanged since gate commit ee849fe (`git diff --stat` empty before the version bump), so the developer's results stand (`build.md` → Gates); CI repeats tests, build and the compat matrix on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 389 suites, 7513 passed, 8 skipped (developer, ee849fe) |
| Lint | 0 errors, 159 warnings (baseline 159) (developer) |
| Production build | 127 entries; rerun here after the version bump 10.2 s, `dist` says 3.50.0 |
| Tool tests | 22 / 22 (developer) |
| Storybook build | built, 1298 stories (developer) |
| Consumer check Angular 22 | PASS, 142 checks (developer); 21.0 · 21 · 22.0 run in CI |
| Package contents (`npm pack --dry-run`) | 444 files, 1.6 MB packed / 7.9 MB unpacked (3.49.1: 444 files, 1.6 MB / 7.8 MB); no specs or stories except the 9 known `src/styles/*.spec.ts`; assets, styles and `icon-names.json` in |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 071-n7 | Inline menu: the second and later `role="menu"` parts have no accessible name (only a first section names a part); an optional part name or a docs line | review N-1 | backlog |
| 071-n8 | *Cut Label With Tooltip*: `aria-describedby` reads „{label} · {tooltip}“, so the label is heard twice | review N-2 | backlog |
| 054-n2 | AC-26: WebKit not runnable here; manual Safari/iOS check of the *Focus return (3.34)* stories stays open | build.md AC-26 | backlog |
| 071-n1 … 071-n6 | Design-time scope limits (rail group menu, brand-mark slot, menu `right-start`/`left-start`, control rows in popups, free rail template, RTL table head), already in BACKLOG.md | design §1 | backlog |

No `queue` items: review round 2 has no open `must-fix` or `should-fix`.

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.50-usmx-sidenav-menu-card-print`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.50.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.50.0` (public after the owner's approval)
- **Closes:** usm-x 2026-11-17 rows 74–86; finance-intelligence vertraege-prove-2026-11-19 row 2 (`lc-toggle-group touchTarget`) and app-shell-2026-11-20 row 1 (print rules); backlog 068-n1, 068-n3, 069-n1, 069-n2
- **Use it (usm-x, collapsed rail and account panel):**

```html
<lc-sidenav [items]="items" [railItems]="railItems" brandToggle brandLogoFit="natural"
            (railItemClick)="openGroupMenu($event)">
  <lc-button sidenav-rail-top shape="square" ariaLabel="Area">…</lc-button>
</lc-sidenav>

<lc-menu inline [items]="accountItems" ariaLabel="Account">
  <ng-template lcMenuControl="density"><lc-toggle-group touchTarget [options]="density" /></ng-template>
</lc-menu>

<lc-toggle-group touchTarget [options]="contractViews" />
```

  Print: nothing to set; `lc-header` is hidden and `lc-app-shell` prints one column.
- **Stories (design.life-cockpit.de):** `navigation-sidenav--collapsed-rail-with-top-slot`, `--brand-toggle`, `--brand-logo-fit`, `--cut-label-with-tooltip`; `navigation-menu--inline`, `--account-panel`, `--current-busy-and-badges`, `--nested-sections`; `components-split-button--menu-max-height`; `data-display-avatar--square-letters`; `data-display-table--sortable-head-reserve-and-rtl`; `data-display-badge--cut-run`; `navigation-tabs--muted-tabs`; `components-card--header-action-wrap`; `form-toggle-group--touch-target`; `layout-app-shell--print`.
