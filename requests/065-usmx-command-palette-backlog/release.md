# Release 065: @lifecorner/angular-ui-kit 3.45.0

- **Version:** 3.45.0 (minor, previous 3.44.0)
- **Release commit:** see `git log` (`release: 3.45.0 — …`) on `feat/3.45-usmx-command-palette-backlog`, fast-forwarded to `main`

## Gates

Code unchanged since the developer's round-4 gates (`git diff --stat fbb7852 -- libs tools` is empty before the version bump), so tests, lint, tool tests, Storybook and compat are taken from `build.md`; the release ran build and pack on the final tree.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 352 suites, 6971 passed, 8 skipped (build.md, round 4) |
| Lint | 0 errors, 160 warnings (unchanged) |
| Production build | 127 entries (126 + `command-palette`), `dist` version 3.45.0, 9.8 s |
| Tool tests | 22/22 (build.md; `tools/` unchanged since) |
| Storybook build | 1239 stories (build.md) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | 22: PASS, Angular 22.2.6, 130 prerendered-HTML checks (build.md); the full matrix runs in CI on `main` |
| Package contents (`npm pack --dry-run`) | 444 files (+3 `command-palette` entry), 1.5 MB packed / 7.4 MB unpacked (3.44.0: 441, 1.5 / 7.1 MB); only the 9 known `src/styles/*.spec.ts`, no stories, `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 065-s1 (S4) | `lc-timeline` horizontal, not selectable: 4 × 128 px items in 328 px at 360, 184 px hidden, no focusable element (axe `scrollable-region-focusable`, WCAG 2.1.1; pre-existing). Needs a design decision: a focusable named scroller only when it overflows, or a stacked layout. | review r2 S4 | queue |
| 065-n1 (N3) | `lc-timeline` horizontal: the title is start-aligned in `.timeline__header`; centre it over its marker (`justify-content: center`; *Horizontal* 1280 item 2: 173.7 vs 192 px). Pre-existing. | review r3 N3 | backlog |
| 054-n2 | Modal / confirm-dialog focus return in WebKit: not checkable here (no WebKit); stays in the backlog (owner 2026-11-17). | spec AC-24 | backlog (already in `BACKLOG.md`) |

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.45-usmx-command-palette-backlog`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.45.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.45.0` (public after the owner's approval)
- **Closes:** usm-x 2026-11-17 rows 31–37; backlog 057-n2, 057-n4, 057-n6, 058-n1, 058-n3, 059-n1, 060-n1, 060-n2, 060-n3, 060-n5, 061-n3, 062-n1, 063-n1, 063-n2, 064-n1 … 064-n9 (064-n2 except the second collapsible level, which `lc-tree-view` covers)
- **Use it:**

```html
<lc-command-palette
  [groups]="groups()"
  [(open)]="paletteOpen"
  [(query)]="query"
  shortcut="mod+k"
  (searchChange)="search($event)"
  (itemSelect)="run($event)"
/>
```

```ts
groups = signal<CommandPaletteGroup[]>([
  { id: 'pages', heading: 'Pages', items: [{ id: 'dashboard', label: 'Dashboard', icon: 'home' }] },
]);
```

- **Stories:** `navigation-command-palette--default` (and *German*, *Async Groups*, *No Results*, *Shortcut And Trigger*), menu *Column Choice*, popover *Triggers* / *Placement*, timeline *Selectable* / *Selectable Compact* / *Selectable Horizontal*, header *Middle Slot And Menu Entries*, sidenav *Foldable Sections*, tabs *With Icons*, search-input *Description*

| Gap | Result |
|---|---|
| usm-x 31–37 | closed in 3.45.0 |
| backlog (23 of 24 rows) | closed; 054-n2 open |
