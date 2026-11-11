# Release 059: @lifecorner/angular-ui-kit 3.39.0

- **Version:** 3.39.0 (minor, previous 3.38.0; npm lists 3.38.0 as the latest, tag v3.38.0 the latest tag)
- **Release commit:** see `git log` (`release: 3.39.0`) on `feat/3.39-device-frame-picture-select-list`, then fast-forwarded to `main`

## Gates

Library code is unchanged since the developer's round 2 (`git diff 48decdc HEAD -- libs tools` is empty apart from this release's version and changelog), so their results stand (`build.md` → Gates).

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 305 suites, 6351 passed, 8 skipped (build.md, `48decdc`) |
| Lint | 0 errors, 160 warnings (baseline) |
| Production build | green on the release tree, 124 entries, `dist/…/package.json` says 3.39.0 (`tmp/059/rel-build.log`) |
| Tool tests | 22 passed (build.md) |
| Storybook build | green, 1132 stories (+15) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | `--only=22` PASS, 113 checks (build.md); the matrix runs again in CI on `main` |
| Package contents (`npm pack --dry-run`) | 435 files, 1.4 MB packed, 6.7 MB unpacked (`tmp/059/pack.log`); 2 new entries (device-frame, picture) with fesm, map and types; `icon-names.json` and styles present; no component specs or stories (only the known `src/styles/*.spec.ts`) |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 059-n1 | Device Frame *Screenshot Row* below 1024 px: the inset focus ring covers the frames' top rim by 1.66 px; set `.shots__row { padding: 4px 16px 8px }` below 1024 px (life-os copies this pattern). Not a WCAG failure (ring 4.06:1 or more) | review F-4 | backlog |

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.39.0` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.39.0` (public after the owner's approval)
- **Closes:** G-SS1, G-SS2; services-prove-2026-11-10 row 1 and bug; stammdaten-prove-2026-11-10 row 1; 057-n1, 057-n3, 057-n5
- **Use it:**

```html
<lc-device-frame size="md" [notch]="true">
  <lc-picture [src]="'/shots/home.png'" [srcset]="'/shots/home.png 1x, /shots/home@2x.png 2x'"
    darkSrc="/shots/home-dark.png" alt="Home" [width]="360" [height]="780" />
</lc-device-frame>
<lc-select [options]="sorts" [(value)]="sort" [clearable]="false" />
```

`ListItem`: `{ label: 'Lücken', badge: '3 offen', href: '#luecken', ariaLabel: 'Zu Lücken, 3 offen' }`.

- **Stories:** Components/Device Frame, Components/Picture, Select *Without Clear Button*, List *Jump Marks*, Description List *Narrow Column* on design.life-cockpit.de
