# Release 054: @lifecorner/angular-ui-kit 3.34.0

- **Version:** 3.34.0 (minor, previous 3.33.1)
- **Release commit:** see `git log -1` on `main` (`release: 3.34.0 — …`, tag `v3.34.0`)

## Gates

Code unchanged since gate commit 77fa5c7 (`git diff --stat 77fa5c7 -- libs tools` empty before the version bump); gates from `build.md` r1, CI runs them again on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 276 suites, 5968 passed, 8 skipped (build.md r1) |
| Lint | 0 errors, 162 warnings (baseline 162) |
| Production build | 121 entries; rerun after the bump 9.5 s, `dist` says 3.34.0 |
| Tool tests | tools unchanged |
| Storybook build | 1082 stories (build.md r1) |
| Consumer check Angular 22 | PASS, 101 ok (build.md r1); 21.0 · 21 · 22.0 run in CI |
| Package contents (`npm pack --dry-run`) | 426 files, 1.3 MB packed / 6.5 MB unpacked (3.33.1: 426, 1.3 MB / 6.4 MB); no component specs or stories; `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 054-n1 | `lc-alert` with an inline action at 360 px: message column about 70 px (one word per line) beside action + ×; the 3.2 layout. | review F-3 | backlog |
| 054-n2 | AC-6: the WebKit/Safari check is manual (open *Modal* and *ConfirmDialog › Focus return (3.34)* on iOS, close, `document.activeElement` must be the trigger's `<button>`). Stays under *Known* in the changelog. | build.md Deviations | backlog |
| 054-n3 | `lc-drawer`, `lc-sidenav`, `lc-gallery` have no `returnFocusTo`; in WebKit their close leaves `body` focused. | spec scope, changelog *Known* | backlog |

No `queue` items.

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.34-focus-return-alert-close`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.34.0` on the release commit, pushed alone
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.34.0` (public after the owner's approval)
- **Closes:** monatsstand-2026-11-06 rows 1 (modal/confirm `returnFocusTo`), 2 (`focusContext()`), 3 (`focusItem()`), and the alert × bug (44 px); also 018 S2 (× in dark)
- **Use it:**

```html
<lc-button (click)="trigger = $event.currentTarget; open = true">Bearbeiten</lc-button>
<lc-modal [(open)]="open" [returnFocusTo]="trigger">…</lc-modal>
```

```ts
header = viewChild.required(HeaderComponent);
list = viewChild.required(ListComponent);

onChoice() { this.header().focusContext(); }
afterSheet() { this.list().focusItem('row-3', 'action'); }
```

- **Stories:** Feedback/Modal › Focus return (3.34), Feedback/ConfirmDialog › Focus return (3.34), Navigation/Header › Focus Context (3.34), Data Display/List › Focus Item (3.34), Feedback/Alert › Close Target (3.34)
