# Release 049: @lifecorner/angular-ui-kit 3.30.2

- **Version:** 3.30.2 (patch, previous 3.30.1)
- **Release commit:** see `git log` on `main`, `release: 3.30.2 — overlay panels take the host's language`

## Gates

Code unchanged since the developer's gate commit 77225f2 (`git diff --stat 77225f2 -- libs tools` empty before the version bump), so only build and pack ran here; tests, lint, Storybook and tools are taken from build.md. CI runs tests, build and the compat matrix again on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 246 suites, 5687 passed, 8 skipped (build.md) |
| Lint | 0 errors / 162 warnings, none new (build.md) |
| Production build | green, 9.3 s; `dist/.../package.json` says 3.30.2 |
| Tool tests | tools unchanged (build.md) |
| Storybook build | 1057 stories (+2 *Panel Language*) (build.md) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | not rerun: server rendering unchanged (AC-10); CI runs the matrix |
| Package contents (`npm pack --dry-run`) | 426 files, 1.3 MB packed / 6.4 MB unpacked (3.30.1: 426, 1.3 / 6.4); no stories or component specs; `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 049-f1 | `lc-select` listbox has no `lang` (`closest('[lang]')` = `html:en` inside a `lang="de"` host, 360 light); likely the same in `lc-menu`, `lc-tooltip`, `lc-popover` (not measured). WCAG 3.1.2: apply `closestLang` per overlay | review F-1, should-fix | queue |
| 049-n2 | Combobox dropdown content-sized, not field-wide (135.03 px under 328 px; pre-existing) | review F-2, nit | backlog |
| 049-n3 | Host `lang` change while a panel stays open shows at the next opening | review F-3, nit | backlog |

## Release through the pipeline

1. Fast-forward `main`, push, wait for CI
2. Annotated tag `v3.30.2` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.30.2` (public after the owner's approval)
- **Closes:** 048-f1 (WCAG 3.1.2 for the datepicker panel, the combobox dropdown and the date-range-picker panel)
- **Use it:** no new API. Set `lang` on the wrapper as before; the open panels now follow it.

```html
<main lang="de">
  <lc-datepicker ariaLabel="Buchungsdatum" />   <!-- panel: lang="de" -->
  <lc-combobox ariaLabel="Konto" [options]="accounts" /> <!-- listbox: lang="de" -->
</main>
```

Without a `[lang]` ancestor the datepicker panel takes its `locale` (for example `de-DE`).

- **Stories:** `form-datepicker--panel-language`, `form-combobox--panel-language`
