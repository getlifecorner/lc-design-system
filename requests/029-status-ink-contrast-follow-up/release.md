# Release 029: @lifecorner/angular-ui-kit 3.21.1

- **Version:** 3.21.1 (patch, previous 3.21.0)
- **Release commit:** `release: 3.21.1 — …` on `fix/3.21.1-status-ink-contrast`, on top of ef908a9 (libs/tools tree = 0c1e511); fast-forwarded to `main`

## Gates

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | developer, tree 0c1e511 (`git diff --stat 0c1e511 -- libs tools` empty): 210 suites, 4847 passed, 8 skipped; not rerun |
| Lint | 0 errors, 162 warnings (baseline); not rerun |
| Production build | release run: green, `dist/libs/angular-ui-kit/package.json` = 3.21.1, 9.0 s |
| Tool tests | 22 passed (developer r1; no `tools/` change since); not rerun |
| Storybook build | 968 stories (developer r2); not rerun |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | developer: 22, 86 HTML checks ok (r1); `lc-log-viewer` is on no compat page. CI runs the full matrix on `main` |
| Package contents (`npm pack --dry-run`) | 424 files, 1.2 MB packed / 6.1 MB unpacked (3.21.0: 424, 1.2 MB / 6.0 MB); no component specs or stories (the 7 known `src/styles/*.spec.ts` are packed as before); assets, styles and `icon-names.json` present |
| Design review | approved r2 (`review.md`); no open must-fix; finding 3 (should-fix) is in the changelog Known |

## Release through the pipeline

1. `git switch main && git merge --ff-only fix/3.21.1-status-ink-contrast`, `git push origin main`
2. Wait for CI on the release commit, then push the annotated tag `v3.21.1`; the tag starts `publish-npm.yml` (tests, build, `npm stage publish` with provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.21.1` (public after the owner's approval)
- **Closes:** the status-ink follow-up candidates of 027 design §5 (twelve components) and 027 review finding 2 (Number Column tip)
- **Use it:** nothing to change. Status text, icons and fills now read `--color-on-<status>-subtle` and reach 4.5:1 (text) / 3:1 (graphics) in both themes. Terminal log viewer overrides need the longer selector:

```css
.lc-log-viewer--terminal .lc-log-viewer__line--warn .lc-log-viewer__level { color: #f9e2af; }
```

- **Stories:** `feedback-notification-center--with-priority`, `components-card--with-badge`, `data-display-status-dot--all-tones`, `components-pipeline--all-statuses`, `data-display-logviewer--default`, `data-display-logviewer--terminal`, `data-display-diff-viewer--inline`, `data-display-dependency-viewer--complex-relationships`, `data-display-kanban-board--with-wip-overflow`, `feedback-progress-bar--colors`

## Known and follow-ups (not in this release)

| ID | What |
|---|---|
| Known | `lc-log-viewer` opacity dims (debug 60 %, timestamp and source 50 %, line number 30 %) stay below 4.5:1 effective; in the changelog Known (review r2 finding 3) |
| F-1 | Dark warning text ink for teal-selected rows (NC unread high 3.67) |
| F-2 | `lc-progress-ring` uses `--color-<v>-default` (light success 2.47, warning 2.05 vs its track) |
| F-3 | Diff line numbers (`--color-text-tertiary`) on the added line, 3.88 L |
| F-4 | Card `--primary` chip text 3.12 L (selected) to 3.57 |
| F-5 | Log pills are 15 px high (target size) |
| F-6 | Dependency `uses` (`--color-neutral-300`) and `extends` (`--color-primary-400`) edge labels are faint text in light |
| F-7 | `lc-log-viewer` dims text with `opacity`: debug level effective 2.53 L / 3.25 D, terminal 2.97; timestamps 3.21 L / 4.43 D, terminal 3.64; terminal line numbers 2.20; replace the opacities with text tokens that reach 4.5:1 |
