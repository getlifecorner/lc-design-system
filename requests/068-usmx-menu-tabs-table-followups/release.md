# Release 068: @lifecorner/angular-ui-kit 3.48.0

- **Version:** 3.48.0 (minor, previous 3.47.0)
- **Release commit:** on `feat/3.48-usmx-menu-tabs-table-followups`, fast-forwarded to `main` (hash in the HANDOFF reply)

## Gates

Code unchanged since gate commit 6d25ea4 (`git diff --stat 6d25ea4 -- libs tools` empty), so the developer's results stand (`build.md` → Gates, round 3 and 2); CI runs them again on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 372 suites, 7276 passed, 8 skipped (developer, 6d25ea4) |
| Lint | 0 errors, 159 warnings (developer) |
| Production build | release run: 127 entries ok, 10.9 s, `dist` version 3.48.0 (`tmp/068/release-build.log`) |
| Tool tests | 22/22 (developer, r2; tools unchanged) |
| Storybook build | built, 1272 stories, no preview error (developer, r3) |
| Consumer check Angular 22 | PASS, 139 checks (developer, r2; Angular 21 runs in CI) |
| Package contents (`npm pack --dry-run`) | 444 files (= 3.47.0), 1.6 MB packed (3.47.0: 1.5 MB), 7.7 MB unpacked (7.5 MB); no stories, no component specs; the 9 known `src/styles/*.spec.ts`; `icon-names.json` present (`tmp/068/pack.log`) |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 068-n1 | Sortable head busy ring uses `right`, not `inset-inline-end`, in RTL | review N-1 | backlog |
| 068-n2 | *Item Icons* clickable non-total dl rows: separators bend at rounded ends (pre-existing) | review N-2 | backlog |
| 068-n3 | Menu point anchor with nothing focused: no focus return target after Tab/Escape (not a WCAG failure) | review N-4 | backlog |
| 054-n2 | WebKit check of the focus-return stories not possible here (no Playwright/WebKit) | BACKLOG | backlog (stays) |

No `must-fix` or `should-fix` is open; nothing goes to the queue. N-3 was fixed in the draft.

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.48-usmx-menu-tabs-table-followups`, `git push origin main` (also carries da2c82c, the 067 log commit), wait for CI
2. Annotated tag `v3.48.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.48.0` (public after the owner's approval)
- **Closes:** usm-x 2026-11-17 rows 47–70; finance-intelligence kosten-prove-2026-11-18 row 7; 067-s1…s3; 066-n1; 067-n1…n5
- **Use it (usm-x):**

```html
<lc-menu [items]="items" [isOpen]="open()" [anchor]="anchorEl()" maxHeight="min(56vh, 420px)" ariaLabel="Aktionen für Rechnungen 2026" (closed)="open.set(false)" />

<lc-tabs ariaLabel="Facetten">
  <lc-tab label="Tickets" hint="12" [muted]="true" />
</lc-tabs>

<button lcButton variant="outline" [ariaPressed]="filterOn()">Filter</button>
```

- **Use it (finance-intelligence):** `<lc-table [data]="rows" [columns]="cols" [showActionsLabel]="false" />` keeps „Aktionen“ as the actions head's name for screen readers only.
- **Stories:** *Menu/Anchored Overlay*, *Long Menu Capped*, *Loading Items*, *Account Menu Swatches*, *Active Id And Counts*, *Hidden Actions Head*, *One Line Beside A Button*, *Deep Tree* (see `design.md` §8 for all 22 ids), on design.life-cockpit.de once Deploy Docs has run.
