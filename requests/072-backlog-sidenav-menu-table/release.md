# Release 072: @lifecorner/angular-ui-kit 3.51.0

- **Version:** 3.51.0 (minor, previous 3.50.0). One version for the whole bundle (owner decision 2026-11-20 22:43)
- **Release commit:** see the `release: 3.51.0` commit on `feat/3.51-backlog-sidenav-menu-table`

## Gates

Code (`libs`, `tools`) is unchanged since gate commit 73e8851 (`git diff --quiet 73e8851 -- libs tools` holds), so the developer's results stand (`build.md` → Gates); CI repeats tests, build and the compat matrix on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 393 suites, 7573 passed, 8 skipped (developer, 73e8851) |
| Lint | 0 errors, 159 warnings (baseline 159) (developer) |
| Production build | 127 entries; rerun here after the version bump 10 s, `dist` says 3.51.0 |
| Tool tests | 22 / 22 (developer) |
| Storybook build | built, no preview errors (developer) |
| Consumer check Angular 22 | PASS, 144 checks (+2: brand mark, rail template) (developer); 21 and 22.0 in CI on `main` |
| Package contents (`npm pack --dry-run`) | 444 files, 1.6 MB packed / 8.0 MB unpacked (3.50.0: 444 files, 1.6 MB / 7.9 MB); no specs or stories except the 9 known `src/styles/*.spec.ts`; assets, styles, `icon-names.json` in |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 072-n1 | Side positions at 360 px: CDK reserves both 8 px margins, panel pushed to gap 0.2 px | review F-1, build O-1 | backlog |
| 072-n2 | RTL sidenav: page 1 px wider (CDK focus-trap anchors), pre-existing | review F-2, build O-2 | backlog |
| 072-n3 | `lc-menu` clips one word wider than the label room (365 px in 286 px), pre-existing | review F-3 | backlog |
| 072-n4 | Rail Group Menu stories: status line „Letzte Auswahl“ shows group presses | review F-4 | backlog |
| 072-n5 | Tooltip Description story: bottom tooltip flips right at the edge, needs padding | review F-5 | backlog |
| 054-n2 | Safari focus return: WebKit not runnable here (AC-19 alternative). Still open after 072 | build.md AC-19 | backlog |

No `must-fix` or `should-fix` is open; nothing goes to the inbox. design.md carries the change notes r1 (D-1 … D-3, O-1, F-3).

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.51-backlog-sidenav-menu-table`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.51.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.51.0` (public after the owner's approval)
- **Closes:** backlog 071-n1 … 071-n8
- **Use it:**

```html
<lc-sidenav [railItems]="rail" [railGroupMenu]="true">
  <img sidenav-brand-mark src="/mark.svg" alt="" />
</lc-sidenav>
<lc-menu [items]="items" position="right-start" [popupControls]="true" partAriaLabel="{label}, part {n}" />
<button lcTooltip="Bold" tooltipDescription="Ctrl+B">B</button>
```

- **Stories:** `navigation-sidenav--rail-group-menu`, `--rail-group-menu-rtl`, `--brand-mark-slot`, `--rail-template`; `navigation-menu--side-positions`, `--popup-control-rows`, `--part-names`, `--account-panel`; `data-display-table--rtl-head`; `feedback-tooltip--description`
