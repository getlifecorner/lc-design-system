# Release 043: @lifecorner/angular-ui-kit 3.27.1

- **Version:** 3.27.1 (patch, previous 3.27.0)
- **Release commit:** see `git log` (`release: 3.27.1 — …`) on `fix/3.27.1-targets-hover-contrast`, then fast-forwarded to `main`

## Gates

Code unchanged since the developer's gate commit `25165b7` (`git diff --stat 25165b7 -- libs tools` empty), so only build and pack ran here; the rest is taken from `build.md`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 228 suites, 5389 passed, 8 skipped (build.md) |
| Lint | 0 errors, 162 warnings (= main) (build.md) |
| Production build | green, version 3.27.1 in `dist/libs/angular-ui-kit/package.json`, 10.9 s (rerun here) |
| Tool tests | 22 pass (build.md) |
| Storybook build | 1028 stories (build.md) |
| Consumer check Angular 22 | PASS, 94 prerender checks (build.md); CI runs the whole matrix on `main` |
| Package contents (`npm pack --dry-run`) | 426 files, 1.3 MB packed / 6.2 MB unpacked (3.27.0: 425, 1.3 MB / 6.2 MB). +1 = new `src/styles/touch-targets-contrast.spec.ts` (known glob accident); no stories; `icon-names.json` present |

## Open nits (review r2, nits 5–10)

Approved with no must-fix. These stay open for a later patch; none is a library edit by the release manager.

| # | Item | State |
|---|---|---|
| 5 | F-30: table checkbox 2.25–3 px above the row middle (pre-existing) | open; changelog "Known" |
| 6 | F-31: filled fields have a transparent border at rest and 1.23 L / 1.29 D on hover; no 3:1 boundary | open; changelog "Known" |
| 7 | Textarea error message ink in light differs from the other fields (`rgb(107, 9, 9)` vs `rgb(157, 14, 14)`, both at least 4.5:1) | open; changelog "Known" |
| 8 | Story `form-tag-input--touch-targets` description says "4 px" and "12 px"; measured 5 px and 13 px | open: story text edit for web-developer |
| 9 | Changelog shot counts | fixed here: 276 identical (3 anti-aliasing only), 174 changed |
| 10 | F-32: long tag chip cut with an ellipsis at 150 px, no `title` or wrap | open; changelog "Known" |

## Release through the pipeline

1. `git switch main && git merge --ff-only fix/3.27.1-targets-hover-contrast`, then `git push origin main`
2. Wait for CI on the release commit
3. Annotated tag `v3.27.1` on the release commit; the tag push starts `publish-npm.yml` (tests, build, `npm stage publish` with provenance)
4. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.27.1` (public after the owner's approval)
- **Closes:** F-22 to F-27 (042 follow-ups)
- **Use it:** nothing to change in templates. A themed header keeps its palette inside a page of the other theme:

```html
<lc-header theme="light">…</lc-header>
```

  If you set token overrides on `:root`, set them on `.lc-header--light` / `.lc-header--dark` too. Tests that focus `.lc-log-viewer` now focus `.lc-log-viewer__content`; `td > input` in table tests becomes `td input`.

- **Stories:** *Touch Targets* stories in 9 components (for example `form-tag-input--touch-targets`), *Input / Error State on Hover*, *Header / Theme Scope*, *Output Region Focus* (log-viewer) on design.life-cockpit.de
