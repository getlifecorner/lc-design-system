# Release 052: @lifecorner/angular-ui-kit 3.33.0

- **Version:** 3.33.0 (minor, previous 3.32.0)
- **Release commit:** see `git log` (`release: 3.33.0 — …`) on `feat/3.33-focus-title-header-row-backlog`

## Gates

Code unchanged since the developer's gate commit 66e903d (`git diff --stat 66e903d -- libs tools` was empty before the version bump), so only build and pack ran again; the rest is taken from `build.md`. CI and the publish run repeat tests, build and the compat matrix.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 270 suites, 5895 passed, 8 skipped (build.md) |
| Lint | 0 errors, 162 warnings (build.md) |
| Production build | green, 9.8 s, `dist` version 3.33.0 |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | 1076 stories (+9) (build.md) |
| Consumer check Angular 22 | PASS, 101 HTML checks (build.md, on 99a2eaf; r1 changed one chip CSS declaration the page doesn't render; CI runs 21 and 22) |
| Package contents (`npm pack --dry-run`) | 426 files, 1.3 MB packed / 6.4 MB unpacked (3.32.0: same); no component specs or stories (only the known `src/styles/*.spec.ts`); assets, styles, `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 052-s2 | Toasts in a stack touch: 0 px between cards, also across the two live regions (y 690–748, 748–826, 826–884 at 360); expected 8 px (`--spacing-2`), none for an empty region. Pre-existing, not WCAG | review r2 finding 2 (should-fix) | queue |
| 052-n3 | Bottom-nav "99+" on a 5-entry bar at 360 px starts 3.2 / 3.4 px left of the pill centre and covers 2 of the 3 dots of the More glyph (known limit of D-2) | review r2 finding 3 | backlog |
| 052-n4 | Sidenav collapsed rail, non-badged items: the label stays in the AX tree and the identical `title` may be read as description; check the CDP AX tree and drop `title` on all rail items if so (`data-tooltip` carries the tooltip) | review r2 finding 4 | backlog |
| 052-n6 | tag-input *Keyboard Focus* story has no `lang="de"` on its German tag, so it breaks mid-word without a hyphen (story only) | review r2 finding 6 | backlog |

Queue for the next bundle: 052-s2 (toast gap).

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.33-focus-title-header-row-backlog`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.33.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.33.0` (public after the owner's approval)
- **Closes:** monatsstand-2026-11-05 row 1; app-shell-2026-11-05 rows 1–2 (Finance Intelligence); the 20 backlog rows of requests 043–051
- **Use it:**

```html
<lc-next-step-card #card [announce]="true" ... />
<!-- after the action: afterNextRender(() => this.card().focusTitle(), { injector }) -->

<lc-header contextName="Monatsstand September 2026" contextPlacement="below" (contextClick)="openSheet()" />
<!-- the context button stays visible at 360 px, as a full-width row under the title -->

<lc-list [items]="months" /> <!-- the row with selected: true now has aria-current="true" -->
```

- **Stories:** *Focus After Action* (next-step-card), *Context Below* (header), *Current Choice* (list), *Long Tags (DE)* (tag-input), *Bottom Stack Order* (toast-outlet), *Opens Above* (datepicker, combobox), *More Badge, Three Characters* (bottom-nav), *Host with Two Controls* (tooltip)
