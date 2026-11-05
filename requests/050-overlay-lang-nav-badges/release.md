# Release 050: @lifecorner/angular-ui-kit 3.31.0

- **Version:** 3.31.0 (minor, previous 3.30.2)
- **Release commit:** see `git log` (`release: 3.31.0 — …`) on `feat/3.31-overlay-lang-nav-badges`

## Gates

Code unchanged since the developer's gate commit cdc4625 (`git diff --stat cdc4625 -- libs tools` empty), so only build and pack ran again; the rest is taken from `build.md`. CI and the publish run repeat tests, build and the compat matrix.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 252 suites, 5751 passed, 8 skipped (build.md) |
| Lint | 0 errors, 162 warnings (build.md) |
| Production build | green, 9.3 s; `dist` version 3.31.0 |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | 1062 stories (+5) (build.md) |
| Consumer check Angular 22 | PASS, 100 HTML checks (build.md; 21 runs in CI) |
| Package contents (`npm pack --dry-run`) | 426 files, 1.3 MB packed / 6.4 MB unpacked (3.30.2: same); no component specs or stories; assets, styles, `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 050-f1 | WCAG 1.4.3: warning badge on the current bottom-nav pill in dark 4.03:1 floating / 4.26:1 docked, success 4.49:1 floating (pre-existing, design F-1) | review finding 1 | queue |
| 050-f2 | WCAG 1.4.3: `theme="light"` sidenav rail on a dark page, badges 1.22–1.97:1 (pre-existing, F-2) | review finding 2 | queue |
| 050-f3 | WCAG 1.4.13 + 1.3.1: `lcTooltip` on `lc-button` never shows on keyboard focus, `aria-describedby` on the host; tooltip anchors to the 18 px inline host box, so a bottom tooltip starts 4 px over the 42 px button (pre-existing, F-3) | review finding 3 | queue |
| 050-n4 | lc-select dropdown content-sized, `min-width: 200px`, under a 328 / 400 px field | review finding 4 | backlog |
| 050-n5 | Badged rail item keeps its label as description (`title`) (L-1) | review finding 5 | backlog |
| 050-n6 | More badge "99+" on a 5-entry bar at 360 px ends 3.6 px past the floating bar (L-2) | review finding 6 | backlog |

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.31-overlay-lang-nav-badges`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.31.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.31.0` (public after the owner's approval)
- **Closes:** 049-f1; stammdaten-2026-11-05 rows 1–2 (Finance Intelligence spec 010)
- **Use it:**

```html
<lc-bottom-nav [items]="items" [moreBadge]="{ value: 1, variant: 'warning' }" badgeAriaLabel="{value} offen" />
<lc-sidenav [items]="nav" badgeAriaLabel="{value} offen" />
<main lang="de"><lc-select ... /></main> <!-- dropdown and tooltips now carry lang="de" -->
```

- **Stories:** *More Badge*, *More Badge (German, floating)* (bottom nav); *Badge Accessible Name (German)* (sidenav); *Panel Language* (Form/Select); *Language* (Feedback/Tooltip)
