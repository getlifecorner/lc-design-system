# Release 058: @lifecorner/angular-ui-kit 3.38.0

- **Version:** 3.38.0 (minor, previous 3.37.0)
- **Release commit:** see `git log` (`release: 3.38.0`) on `feat/3.38-card-name-hero-band-contrast`

## Gates

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 299 suites, 6273 passed, 8 skipped (build.md, tree 908f923) |
| Lint | 0 errors, 160 warnings (baseline; build.md) |
| Production build | green, 9.3 s, `dist` version 3.38.0 |
| Tool tests | tools unchanged (build.md) |
| Storybook build | green (build.md) |
| Consumer check Angular 22 | green, 110 checks (build.md); CI runs the full matrix on `main` |
| Package contents (`npm pack --dry-run`) | 429 files, 1.3 MB / 6.6 MB (3.37.0: same); 9 `styles/*.spec.ts` as before, `icon-names.json` present |

`git diff --quiet 908f923 -- libs tools` holds, so only build and pack ran again. Version 3.38.0 is not tagged or on npm.

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 058-n1 | *Light Slim* story renders the dark info band (`variant="slim light"` is no valid single value) | design.md N-1 | backlog |
| 058-n2 | Button stories and SCSS comments quote 3.36 values for `inverse` and `inverse-outline` (3.62, 9.28, 4.66, 3.56) | review N-1 | backlog |
| 058-n3 | *Stage Actions* text says 9.36:1; measured 9.30 to 9.34 | review N-2 | backlog |
| 054-n2 | WebKit not automated (unchanged) | BACKLOG | backlog |

No open `must-fix` or `should-fix`; nothing for the queue.

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.38-card-name-hero-band-contrast`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.38.0` on the release commit, pushed alone
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.38.0` (public after the owner's approval)
- **Closes:** 057-s1 (regeln page, WCAG 2.5.3), 057-s2 (monatsstand page, WCAG 1.4.3)
- **Use it:**

```html
<lc-card title="Regeln" ariaLabel="Regeln 3 aus USM übernommen 1 im Modul gepflegt 2" (click)="open()">
  …
</lc-card>
<lc-hero color="warning" title="Monatsstand">Text in white, 4.63:1 or more</lc-hero>
```

No code change is needed: the card name now matches its text, and the hero bands darken on their own (success and warning visibly).

- **Stories:** `card--clickable-named-by-its-text`, `hero--all-colors`, `hero--badges-in-the-body`, `hero--stage-actions`
