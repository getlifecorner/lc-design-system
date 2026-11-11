# Release 060: @lifecorner/angular-ui-kit 3.40.0

- **Version:** 3.40.0 (minor, previous 3.39.0)
- **Release commit:** `release: 3.40.0` (see `git log`)

## Gates

Code is unchanged since the developer's gate commit `c169242` (`git diff --stat c169242 -- libs tools` empty), so their results stand.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 310 suites, 6462 passed, 8 skipped (build.md, `c169242`) |
| Lint | 0 errors, 160 warnings (= baseline; build.md) |
| Production build | green on 3.40.0 (10.2 s), `dist` version 3.40.0 |
| Tool tests | 22 passed (build.md) |
| Storybook build | green, +19 stories (build.md) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | PASS on Node v24.21.0, run by the owner (log 2026-11-12): 21.0.9, 21.2.26, 22.0.8, 22.2.5; 115 checks each (Angular 22: 116 with the csp build); `tmp/060/compat.log` |
| `npm run generate:icon-names` leaves the 3 generated files unchanged | PASS, run by the owner: 5161 names, 49 inlined Tabler icons, no change in the generated files |
| Package contents (`npm pack --dry-run`) | 438 files (+3 = `area-map` entry), 1.4 MB packed / 6.7 MB unpacked (3.39.0: 435, 1.4 / 6.7); no stories or feature specs; `icon-names.json` and styles present; the known `src/styles/*.spec.ts` are packed |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 060-s1 | `Hooks On An Ancestor` story (chip): dark theme chip text 4.01 (default), 4.71 (quiet clickable), 4.85 (emphasis) over a band; fix the story values by computing both themes, not the component | review finding 1 | queue |
| 060-n1 | hero: `--lc-hero-media-width: 34rem` exceeds the viewport at root text zoom 200 % at 1024/1280 (e.g. `min(…, 50%)`); page zoom holds | review finding 2 | backlog |
| 060-n2 | hero: long title words do not hyphenate at 320 px + 200 % text („organisiert“ cut) | review finding 3 | backlog |
| 060-n3 | device-frame: `Laptop Hooks` right frame says „the lid alone“ but the base stays a 2 px strip; hide the base or reword | review finding 4 | backlog |
| 060-n4 | chip: `.lc-chip--clickable { font: inherit }` makes clickable sm/md chips use the parent font size (pre-existing) | build.md open items | backlog |
| 060-n5 | chip: 44 px target premise (design §6) unsettled | build.md open items | backlog |

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.40-area-icons-area-map-laptop-chip`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.40.0` on the release commit, pushed alone
3. Public once the npm stage is approved with 2FA

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.40.0` (public after the owner's approval)
- **Closes:** G-HV1, G-HV2, G-HV3, G-HV4, G-SS1 (extended)
- **Use it:**

```html
<lc-area-map ariaLabel="Areas and their status" layerTitle="Your life" [groups]="groups">
  <img area-map-figure src="edu.svg" alt="" />
</lc-area-map>
<lc-device-frame device="laptop" size="md"><img src="app.png" alt="App" /></lc-device-frame>
<lc-chip variant="emphasis" [wrap]="true" label="A long label that wraps" />
```

(Check input names against the stories before relying on the snippet: `data-display-area-map--*`.)

- **Stories:** `data-display-area-map--on-hero-band`, `--two-instances`, `data-display-chip--wrap`, `--on-hero-bands`, `data-display-device-frame--laptop`, `components-icon--area-icons`
