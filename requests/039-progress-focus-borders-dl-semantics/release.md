# Release 039: @lifecorner/angular-ui-kit 3.25.1

- **Version:** 3.25.1 (patch: story-docs wording, review 039 nits 1 and 2; previous 3.25.0)
- **Release commit:** see `git log -1` on `fix/3.25.1-progress-focus-borders-dl-semantics`, then fast-forwarded to `main`

## Gates

Code (`libs`, `tools`) is unchanged since the developer's gate commit 1e071d3 (`git diff --stat 1e071d3 -- libs tools` is empty), so tests, lint, tool tests, the Storybook build and compat are taken from build.md "Patch 3.25.1".

| Gate | Result |
|---|---|
| Unit tests | 219 suites, 5173 passed, 8 skipped (build.md) |
| Lint | 0 errors, 162 warnings = baseline (build.md) |
| Production build | green, 9 s; `dist/libs/angular-ui-kit/package.json` says 3.25.1 (`tmp/039/build-r.log`) |
| Storybook build | green, 994 stories; 12/12 story shots identical (build.md) |
| Tool tests, compat | not rerun: `tools/` and rendered output unchanged (stories are docs-page text only) |
| Package contents (`npm pack --dry-run`) | 424 files, 1.2 MB packed / 6.2 MB unpacked (= 3.25.0); no component specs or stories; `icon-names.json`, styles and assets present (`tmp/039/pack.log`) |

## Review nits closed

| # | Nit | Result |
|---|---|---|
| 1 | dl story wording "native button per row" | Fixed in `description-list.stories.ts` |
| 2 | log-viewer *Text Hierarchy* docs "3.23 / 7.47" | Now 3.49 / 7.47 |

Follow-ups F-18, F-19, F-20 stay open (design §6).

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.25.1` (public after the owner's approval)
- **Closes:** nothing new; corrects two story texts that the MCP serves. Gap IDs of 3.25.0 (F-14 to F-17) are unchanged.
- **Use it:** nothing to change; the same API as 3.25.0.

```html
<lc-description-list [items]="items" clickable (itemClick)="open($event)" />
```
