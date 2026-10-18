# Release 005: @lifecorner/angular-ui-kit 3.8.0

- **Version:** 3.8.0 (minor, previous 3.7.0)
- **Release commit:** 4c0c11f on `feat/3.8-edu-character-poses`

## Gates

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 149 suites, 3906 passed, 8 skipped (from build.md, code unchanged) |
| Lint | 0 errors, 162 warnings (from build.md) |
| Production build | green; `dist/libs/angular-ui-kit/package.json` version 3.8.0 |
| Tool tests | 22/22 |
| Storybook build | green (from build.md) |
| Consumer check Angular 22 | PASS, 42/42 checks; character: decorative, in horizon slot, files from logo base path, on-dark drawing, box square and CSS-sized, assets copied, exports resolve, plain-Node import equals file |
| Package contents (`npm pack --dry-run`) | 417 files, 1.1 MB packed / 5.7 MB unpacked; 0 component specs, 28 character SVG files, styles, icon-names.json present |

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.8-edu-character-poses`, then `git push origin main`
2. `gh workflow run publish-npm.yml --ref main -f version=3.8.0`: tests, build, `npm stage publish` (OIDC, provenance), then the tag `v3.8.0` on the release commit
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.8.0` (public after the owner's approval)
- **Closes:** G-4 (life-os app-shell 7.2, website-v0)
- **Use it:**

```typescript
// As a component (in @lifecorner/angular-ui-kit/character)
import { CharacterComponent } from '@lifecorner/angular-ui-kit/character';

// In your template
<lc-character pose="hello" size="96" />

// On the horizon
<section class="lc-horizon">
  <lc-character pose="comforts" class="lc-horizon__figure" />
  <footer class="lc-horizon__land">
    <a href="/terms">Terms</a>
  </footer>
</section>

// As static files
<img src="/assets/character/calm-light.svg" alt="" width="64" height="64" />

// As SVG strings (in @lifecorner/angular-ui-kit/character-svg)
import { CHARACTER_SVG_HELLO } from '@lifecorner/angular-ui-kit/character-svg';
const svg = CHARACTER_SVG_HELLO.light; // or .dark
```

- **Stories:** `components-character--playground`, `--all-poses`, `--hello` through `--see-you` (14 poses), `--sizes`, `--responsive-size`, `--on-dark-surface`, `--with-label`, `--static-files`, `design-tokens-horizon--with-figure`, `--figure-and-footer` on design.life-cockpit.de
- **Known nits (not blocking):** All-poses story captions wrap to 2-3 lines at 360 px; on-dark-surface at 360 px, Hallo's hand touches the hero media hairline by ~0.6 px (stacked hero only, no line from 1024 px)
