# Release 039: @lifecorner/angular-ui-kit 3.25.0

- **Version:** 3.25.0 (minor: the clickable-row DOM of `lc-description-list` changed; previous 3.24.1)
- **Release commit:** see `git log -1` on `feat/3.25-progress-focus-borders-dl-semantics`, then fast-forwarded to `main`

## Gates

Code (`libs`, `tools`) is unchanged since the developer's gate commit 7daee89 (`git diff --stat 7daee89 -- libs tools` is empty), so tests, lint, tool tests and the Storybook build are taken from build.md.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 219 suites, 5173 passed, 8 skipped (build.md, 7daee89) |
| Lint | 0 errors, 162 warnings = baseline (build.md) |
| Production build | green, 10 s; `dist/libs/angular-ui-kit/package.json` says 3.25.0 (`tmp/039/build.log`) |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | green, 994 stories (build.md) |
| Consumer check Angular 21 | PASS on Angular 21.2.26 with the clickable-dl check (`--only=21`, `tmp/039/compat21.log`); 22: 93 HTML checks ok incl. the clickable dl (build.md) |
| Package contents (`npm pack --dry-run`) | 424 files, 1.2 MB packed / 6.2 MB unpacked (= 3.24.1); no component specs or stories; the 7 `src/styles/*.spec.ts` are the known ones; `icon-names.json`, styles and assets present |

## Review nits (review.md round 1, approved)

| # | Nit | Handled |
|---|---|---|
| 1 | dl story wording "native button per row" repeats "row" (`description-list.stories.ts` l. 58, 268) | Not fixed here: a library edit would void the gates. Open for the next patch (web-developer) |
| 2 | log-viewer *Text Hierarchy* docs say "3.23 / 7.47", the corrected bound is 3.49 / 7.47 (the changelog already uses the measured values) | Same: open for the next patch |
| 3 | Changelog Compatibility: shot counts dropped, Safari Tab note added | Done in CHANGELOG.md 3.25.0 |
| 4 | Angular 21 compat leg | Run in the release, see the gate table |

Follow-ups F-18, F-19, F-20 stay open (design §6).

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.25.0` (public after the owner's approval)
- **Closes:** F-14, F-15, F-16, F-17 (036 follow-ups)
- **Use it:** clickable rows now keep `dt`/`dd`; tests should select `button.lc-dl__action` instead of `role="button"`.

```html
<lc-description-list [items]="items" clickable (itemClick)="open($event)" />
```

- **Stories:** `data-display-dependency-viewer--node-statuses` (new), `components-description-list--clickable-rows`, `feedback-progress-bar--colors`, `data-display-logviewer--text-hierarchy`
