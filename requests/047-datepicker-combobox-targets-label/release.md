# Release 047: @lifecorner/angular-ui-kit 3.30.0

- **Version:** 3.30.0 (minor, previous 3.29.0)
- **Release commit:** see `git log` on `feat/3.30-datepicker-combobox-targets-label` (`release: 3.30.0 — …`)

## Gates

Code unchanged since the developer's gate commit f60cec39 (`git diff --stat f60cec39 -- libs tools` empty, before the version bump), so only build and pack ran here.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 241 suites, 5645 passed, 8 skipped (build.md) |
| Lint | 0 errors, 162 warnings (baseline; build.md) |
| Production build | success, dist version 3.30.0 (9.8 s, `tmp/047/build.log`) |
| Tool tests | 22/22 (build.md) |
| Storybook build | success, 1055 stories (+5; build.md) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | 22 PASS, 99 HTML checks (build.md); CI runs the matrix again on `main` |
| Package contents (`npm pack --dry-run`) | 426 files, 1.3 MB packed / 6.4 MB unpacked (3.29.0: 426, 1.3 / 6.4); no component specs or stories, `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 047-f1 | *Label (DE)* story description (`datepicker.stories.ts` l.260) says three lines (63 px); measured 2 lines, 42 px | review finding 1 | queue |
| 047-f2 | Day buttons 1–9 are named "Wed Jul 01 2026" (`dayAriaLabel()` = `toDateString()`) for visible "1": axe `label-content-name-mismatch`, WCAG 2.5.3 A, pre-existing; use the long `Intl` date, English by default | review finding 2 | queue |
| 047-n1 | Datepicker panel opened above the field has gap 0 instead of 4 px (margin sits inside the pane; lc-combobox's list does the same) | review finding 3 | backlog |
| 047-n2 | *Default* open at 360 (field 16–344): panel end-aligned at x 2, since the CDK fit check ignores the left margin; Known in changelog | review finding 4 | backlog |
| 047-n3 | 200 % text, 360: day panel 360 × 626 at x 8, 8 px past the right edge inside its padding; Known in changelog | review finding 5 | backlog |
| 047-n4 | `ariaLabel` JSDoc on `lc-datepicker` has no `@default` (pre-existing) | review finding 6 | backlog |

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.30-datepicker-combobox-targets-label`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.30.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.30.0` (public after the owner's approval)
- **Closes:** finance-intelligence rules page rows 5, 6, 7; 046-f1, 046-f2, 046-n3, 046-n4
- **Use it:**

```html
<lc-datepicker label="Gilt ab" ariaLabel="Gültig ab" granularity="month" [(ngModel)]="validFrom" />
<lc-combobox size="lg" label="Konto" [options]="accounts" [(selectedValue)]="accountId" />
```

- **Stories:** `form-datepicker--with-label`, `form-datepicker--label-de`, `form-datepicker--clear-targets`, `form-datepicker--day-panel`, `form-combobox--clear-targets-de` on design.life-cockpit.de
