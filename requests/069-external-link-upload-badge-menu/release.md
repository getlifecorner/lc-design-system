# Release 069: @lifecorner/angular-ui-kit 3.49.0

- **Version:** 3.49.0 (minor, previous 3.48.0)
- **Release commit:** see `git log` (`release: 3.49.0 — …`) on `feat/3.49-external-link-upload-badge-menu`, then ff-merged to `main`

## Gates

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 376 suites, 7364 passed, 8 skipped (gate commit 2727438; `git diff --stat 2727438 -- libs tools` empty, so taken from build.md) |
| Lint | 0 errors, 159 warnings (baseline 159), same commit |
| Production build | 127 entries; rerun after the version bump 28 s; `dist/…/package.json` = 3.49.0 |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | built, 1281 stories (+9) (build.md); review rebuilt once |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | 22 PASS, 139 checks (build.md); CI runs the full matrix on `main` |
| Package contents (`npm pack --dry-run`) | 444 files (= 3.48.0), 1.6 MB packed / 7.8 MB unpacked (3.48.0: 1.6 / 7.7); no component specs or stories, `icon-names.json` present, 9 `src/styles/*.spec.ts` (known) |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 069-s1 | `lc-file-upload variant="image"`, forced colours: `light`/`dark`/`checkered` grounds all render as Canvas; a white silhouette on `dark` measures 1.00 against its ground. Needs `forced-color-adjust: none` on those tiles, border CanvasText (design §5 r1). Listed as Known in the changelog | review F-1 | queue |
| 069-n1 | image field without a rejection: the empty `role=alert` line still takes the 8 px column gap (`.file-upload-image__error:empty` negative margin) | review F-2 | backlog |
| 069-n2 | *Image German* / *Image Rejected German*: hint, accepted and max lines repeat the limits; give the hint other content | review F-3 | backlog |

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.49-external-link-upload-badge-menu`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.49.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.49.0` (public after the owner's approval)
- **Closes:** finance-intelligence vertraege-2026-11-18 row 1; usm-x 2026-11-17 rows 71, 72, 73; backlog 068-n2

finance-intelligence (contract „Details“ dialog): set `external: true` on an item with `href`; it opens in a new tab, with the icon and the hint read by screen readers (`externalLinkHint` for German).

usm-x (logo, recording bar, row menu):

```html
<lc-file-upload variant="image" accept=".svg,.png" imageSrc="/logo.svg" imageAlt="Company logo"
  imageBackground="dark" (filesSelected)="onLogo($event[0])" (imageRemoved)="onLogoRemoved()" />

<lc-badge maxWidth="16rem">Aufnahme läuft in <strong>USM-1209 Zeitbuchung</strong></lc-badge>

<lc-menu [items]="rowActions" maxHeight="room" />
```

- **Stories:** `form-file-upload--image`, `--image-backgrounds`, `--image-german`, `--image-rejected-german`; `components-description-list--external-links`; `data-display-badge--mixed-label`, `--max-width`; `navigation-menu--long-menu-room`, `--long-menu-room-flips-up`
