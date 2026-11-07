# Release 056: @lifecorner/angular-ui-kit 3.36.0

- **Version:** 3.36.0 (minor, previous 3.35.0)
- **Release commit:** `release: 3.36.0` on `feat/3.36-state-strip-footer-collapse` (`git log -1`; tag target)

## Gates

Code unchanged since the developer's gates (`git diff --stat 4d8d21a -- libs tools` is empty before the version bump), so tests, lint, tools, Storybook and compat come from build.md; CI runs them again on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 292 suites, 6152 passed, 8 skipped (build.md, 4d8d21a) |
| Lint | 0 errors, 162 warnings (baseline) (build.md) |
| Production build | green, 122 entries; `dist` version 3.36.0, 9.5 s (rerun by the release) |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | green, 1109 stories (+21) (build.md) |
| Consumer check | Angular 22: all ok, 110 HTML checks (+8) (build.md); 21.0 · 21 · 22.0 run by CI on `main` |
| Package contents (`npm pack --dry-run`) | 429 files (+3 for the `state-strip` entry), 1.3 MB packed / 6.6 MB unpacked; 3.35.0: 426 files, 1.3 MB / 6.5 MB. No stories, no component specs; `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| S-1 | `lc-state-strip` with 30 / 60 runs: cells 10.92 / 5.45 px wide, below the 24 px target of WCAG 2.5.8 (hover and click show the caption; axe `target-size` incomplete on 90 nodes). Document in the `segments` JSDoc and the story; decide on another pointer path for dense strips | review S-1 | queue |
| F-2 | `lc-list` `clickable` + built-in `action`: action inside `role="button"` (axe `nested-interactive`, WCAG 4.1.2), since 3.3 | review F-2 | queue |
| F-1 | `CHART_PALETTE`: `--color-success-default` 2.47–2.72:1, `--color-warning-default` 2.05–2.26:1 against light pages in 13 charts (3:1 needed) | review F-1, design §1 | queue |
| 056-n1 | `lc-list` label breaks German compounds mid-word at 360 px (no `hyphens: auto`) | review N-1 | backlog |
| 056-n2 | card *Collapsible* story has no card with a `[card-footer]` | review N-2 | backlog |
| 054-n2 | Safari/iOS focus-return check: WebKit/Playwright not installed here, so it can't be checked; the row stays with the note "still open after 056" | review AC-33 | backlog |

The three queue items are in the changelog under *Known*. 056-n1 and 056-n2 and the 054-n2 note are in `requests/BACKLOG.md`.

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.36.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.36.0` (public after the owner's approval)
- **Closes:** quellen-2026-11-06 rows 1–3; app-shell-2026-11-07 rows 1–2; cockpit-2026-11-07 rows 1–2; services-2026-11-07 rows 1–2; regeln-2026-11-07 row 1; monatsstand-2026-11-07 rows 1–2; backlog 055-n2, 055-n3, 055-n4 and the tag-input args
- **Use it:**

```html
<lc-state-strip ariaLabel="Last 10 load runs" [segments]="runs" />
<lc-description-list [items]="[{ term: 'Status', value: 'Released', badge: 'Released', badgeVariant: 'success' }]" />
<lc-hero [headingLevel]="2" title="Month closed" />
<lc-card title="Cost centres" collapsible [(expanded)]="open">…</lc-card>
<lc-table [columns]="columns" [data]="rows" [footerRow]="{ name: 'Total', amount: 1200 }" />
```

- **Stories:** `state-strip--default`, `--all-states`, `--german`, `--keyboard-focus`, `--many-segments`, `--empty`; description-list badge and total rows; list *Chevron Rows*; header *Context Badge*, *Hamburger Focus Return*; hero *Heading Level*, *Focus Title*, *Stage Actions*; stacked-bar-chart *Band*; table *Footer Row*, *Row Action Names*; card *Collapsible*; combobox *Error After Submit*
