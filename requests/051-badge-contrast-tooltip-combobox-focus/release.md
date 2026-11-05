# Release 051: @lifecorner/angular-ui-kit 3.32.0

- **Version:** 3.32.0 (minor, previous 3.31.0)
- **Release commit:** see `git log` (`release: 3.32.0 — …`) on `feat/3.32-badge-contrast-tooltip-combobox-focus`

## Gates

Code unchanged since the developer's gate commit c5badc4 (`git diff --quiet c5badc4 -- libs tools` holds on HEAD 989df6c), so only build and pack ran again; the rest is taken from `build.md`. CI and the publish run repeat tests, build and the compat matrix.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 255 suites, 5802 passed, 8 skipped (build.md) |
| Lint | 0 errors, 162 warnings (build.md) |
| Production build | green, 9.5 s, 122 entries; `dist` version 3.32.0 |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | 1067 stories (+5) (build.md) |
| Consumer check Angular 22 | PASS, 100 HTML checks (build.md; 21 runs in CI) |
| Package contents (`npm pack --dry-run`) | 426 files, 1.3 MB packed / 6.4 MB unpacked (3.31.0: same); no component specs or stories (only the known `src/styles/*.spec.ts`); assets, styles, `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 051-n1 | `lcTooltip` on a host with several controls always describes the first control, so Tab to the second describes the first (no regression; no kit template uses such a host) | review finding 1 | backlog |

No open `must-fix` or `should-fix`; nothing to queue.

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.32-badge-contrast-tooltip-combobox-focus`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.32.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.32.0` (public after the owner's approval)
- **Closes:** 050-f1, 050-f2, 050-f3; stammdaten-2026-11-05 row 3 (Finance Intelligence master data)
- **Use it:**

```html
<lc-combobox [options]="options" [openOnFocus]="false" /> <!-- focus() leaves the list closed; click, typing, ArrowDown open it -->
<lc-button lcTooltip="Save the draft">Save</lc-button> <!-- now also on Tab -->
```

- **Stories:** *Open on focus off*, *Open on focus off (DE)* (Form/Combobox); *Keyboard Focus* (Feedback/Tooltip); *Badges on the Current Pill* (bottom nav); *Themed Rail Badges* (sidenav)
