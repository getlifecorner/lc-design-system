# Release 064: @lifecorner/angular-ui-kit 3.44.0

- **Version:** 3.44.0 (minor, previous 3.43.0)
- **Release commit:** see the tag `v3.44.0` on `feat/3.44-usmx-frame-button-split` (merged fast-forward into `main`)

## Gates

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 338 suites, 6805 passed, 8 skipped (developer, `89d542d`; `git diff --stat 89d542d HEAD -- libs tools` is empty) |
| Lint | 0 errors, 160 warnings (unchanged) |
| Production build | green, 126 entries; rerun after the version bump 9.3 s, `dist` says 3.44.0 |
| Tool tests | 22 / 22 (r1; `tools/` unchanged since) |
| Storybook build | green (`--skip-nx-cache`, `89d542d`) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | Angular 22 PASS (r2, 125 HTML checks); one stylesheet rule moved since. Not rerun here: CI runs the full matrix and the entry checks on `main` before the tag |
| Package contents (`npm pack --dry-run`) | 441 files (3.43.0: 438; +3 = `split-button` entry), 1.5 MB packed / 7.1 MB unpacked (3.43.0: 1.4 / 6.9); no stories or component specs, `icon-names.json` and styles present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 064-n4 | list *Headings In Columns* 1280: a continued group has no heading in the next column | review 6 | backlog |
| 064-n5 | list: divider under the last row of a column; column 1's divider starts 9 px in (corner clip) | review 7 | backlog |
| 064-n6 | tabs *With Badges* 360: no overflow cue (4 px before the list edge) | review 8 | backlog |
| 064-n7 | sidenav `items` argType lists only pre-3.44 fields; rail badge „56/60“ (36 px) covers the icon | review 9 | backlog |
| 064-n8 | tabs *Vertical* 360: panel only 112 px (pre-existing) | review 11 | backlog |
| 064-n9 | sidenav rail: `title` repeats the busy item's name as its description | review 12 | backlog |
| 064-n1, 064-n2, 064-n3 | header extras, sidenav foldable sections / deep levels / long press, `lc-tab` `icon` never rendered | spec, design §1, §9 | backlog (already in `BACKLOG.md`) |

No `queue` items: no `must-fix` or `should-fix` is open.

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.44-usmx-frame-button-split`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.44.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester (usm-x)

- **Install:** `npm install @lifecorner/angular-ui-kit@3.44.0` (public after the owner's approval)
- **Closes:** usm-x 2026-11-17 rows 4, 11, 14, 16, 17, 20–30; backlog 064-n2 (built part)
- **Use it:**

```html
<lc-split-button [items]="exportItems" (clicked)="export()" (itemClick)="onFormat($event)">Export</lc-split-button>
<lc-button shape="row" accessKey="s" ariaKeyShortcuts="Alt+Shift+S">Save</lc-button>
<lc-tabs mode="links" panelId="main-panel">
  <lc-tab label="General" tabId="tab-general" route="." [queryParams]="{ tab: 'general' }" queryParamsHandling="merge" [current]="tab() === 'general'"></lc-tab>
</lc-tabs>
<div role="tabpanel" id="main-panel" [attr.aria-labelledby]="'tab-' + tab()">…</div>
<lc-modal placement="top" [open]="open()">…</lc-modal>
```

- **Stories:** `components-split-button--default`, `navigation-tabs--router-links`, `navigation-tabs--vertical`, `navigation-sidenav--collapsed-rail-states`, `navigation-sidenav--counts-and-context-menu`, `data-display-badge--with-icon` (all 33 new ids in design.md §8)
