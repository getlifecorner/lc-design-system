# Release 055: @lifecorner/angular-ui-kit 3.35.0

- **Version:** 3.35.0 (minor, previous 3.34.0)
- **Release commit:** see `git log -1` on `feat/3.35-textarea-combobox-focus-backlog` (`release: 3.35.0 — …`), fast-forwarded onto `main` (branch base = `origin/main` 91e23e1)

## Gates

No code change since the developer's gates (`git diff --quiet 657b990 -- libs tools` holds), so tests, lint, tool tests, Storybook and the compat check are taken from `build.md`; CI runs them again on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 282 suites, 6026 passed, 8 skipped (build.md, 657b990) |
| Lint | 0 errors, 162 warnings (baseline) (build.md) |
| Production build | green, 121 entries; rerun here 9.8 s, `dist/…/package.json` = 3.35.0 |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | green, 1088 stories (build.md) |
| Consumer check Angular 22 | all ok, 102 HTML checks (build.md, `--only=22`); the 21 / 22.0 / 21.0 matrix runs in CI |
| Package contents (`npm pack --dry-run`) | 426 files, 1.3 MB packed / 6.5 MB unpacked (3.34.0: 426, 1.3 / 6.5 MB); no specs or stories outside the known `src/styles` specs; assets, styles, `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 055-n1 | tag-input stories bind only 3 of 8 meta args; `separator`, `maxTags`, `allowDuplicates`, `removable`, `disabled` show as controls but do nothing | review N-1 | backlog |
| 055-n2 | `alert.close-target.spec.ts` AC-15 pins length + sha1 of the whole compiled alert CSS; any unrelated alert SCSS edit fails it | review N-2 | backlog |
| 055-n3 | `lc-header` `hamburgerClick` is `output<void>`, no element for `returnFocusTo` | design F-1 | backlog |
| 055-n4 | `lc-combobox` has no `announceError`; after a 422 `focus()` the error is read twice | design F-2 | backlog |
| 054-n2 | WebKit not automated; the manual Safari/iOS check of *Focus return (3.34)* stays open (WebKit is not installed here, owner decision 2026-11-06) | 054 build.md | backlog (unchanged row) |

No open `must-fix` or `should-fix`: nothing goes to the inbox. The 8 folded rows (052-n3, 052-n4, 052-n6, 053-n1..n3, 054-n1, 054-n3) are already deleted from `BACKLOG.md`; three of them are documented limits in the changelog's *Known* section (052-n3, 052-n4 and the F-rows).

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.35-textarea-combobox-focus-backlog`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.35.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.35.0` (public after the owner's approval)
- **Closes:** monatsstand-prove-2026-11-06 row 1 (Finance Intelligence „Freigeben“, „Monat einfrieren“); backlog 052-n6, 053-n1, 053-n2, 053-n3, 054-n1, 054-n3
- **Use it:**

```ts
note = viewChild.required(TextareaComponent);
// after a 422, or when the form opens:
afterNextRender(() => this.note().focus(), { injector: this.injector });
```

```html
<lc-drawer [(open)]="filters" [returnFocusTo]="trigger"> … </lc-drawer>
```

- **Stories:** *Focus on Open (3.35)* (Textarea, Combobox), *Inline Action, Narrow (3.35)* (Alert), and the drawer and sidenav *Focus return (3.35)* stories (IDs in `design.life-cockpit.de/index.json`, checked after Deploy Docs)
