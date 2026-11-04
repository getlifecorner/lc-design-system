# Release 048: @lifecorner/angular-ui-kit 3.30.1

- **Version:** 3.30.1 (patch, previous 3.30.0)
- **Release commit:** see `git log` (`release: 3.30.1`) on `fix/3.30.1-datepicker-label-day-names`, then `main`

## Gates

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 242 suites, 5654 passed, 8 skipped (developer, gate commit a7b725db; libs and tools unchanged since: `git diff --stat` empty) |
| Lint | 0 errors / 162 warnings (baseline; developer) |
| Production build | green, 9.1 s; `dist/.../package.json` says 3.30.1 (release run) |
| Tool tests | tools unchanged; 23/23 (developer) |
| Storybook build | 1055 stories (developer) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | not rerun: server rendering unchanged (only an overlay `aria-label`); CI runs the matrix on `main` |
| Package contents (`npm pack --dry-run`) | 426 files, 1.3 MB packed / 6.4 MB unpacked (3.30.0: same); no stories, no feature specs; the 9 spec files are the known `src/styles/*.spec.ts`; `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 048-f1 | The overlay panel of the datepicker (and date-range-picker, combobox with `locale`) sits under `<body>`, outside the host's `lang`: the German panel texts and day names are spoken with the page's `en` rules (WCAG 3.1.2, AA). Expected: the panel takes the host's closest `[lang]`, else `locale`. | review.md finding 1 | queue |
| 048-n2 | *Label (DE)* story: „Gilt ab“ and both sm fields still use English panel defaults (visible "Today" in a German story, served by the MCP); add `todayLabel`, `dialogAriaLabel`, month/year nav labels and `selectedAriaLabel`. | review.md finding 2 | backlog |

Review finding 3 (changelog wording) is fixed in this release. Both rows are also in the changelog (*Known*) and 048-n2 in `requests/BACKLOG.md`.

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.30.1` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.30.1` (public after the owner's approval)
- **Closes:** 047-f1, 047-f2
- **Use it:** no code change. Day buttons now read "Wednesday, July 1, 2026" (with `locale="de-DE"`: „Mittwoch, 1. Juli 2026“); a test that pins "Wed Jul 01 2026" must expect the new form.

```html
<lc-datepicker locale="de-DE" label="Buchungsdatum" [(ngModel)]="date" />
```

- **Stories:** `form-datepicker--day-panel`, `form-datepicker--label-de`, `form-datepicker--default`
