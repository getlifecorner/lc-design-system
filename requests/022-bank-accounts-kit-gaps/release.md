# Release 022: @lifecorner/angular-ui-kit 3.16.0

- **Version:** 3.16.0 (minor, previous 3.15.0; not on npm, no tag `v3.16.0`)
- **Release commit:** `release: 3.16.0` on `feat/3.16-bank-accounts-kit-gaps`, then fast-forwarded to `main`

## Gates

`git diff --stat 9a397eb -- libs tools` is empty: the developer's gates stand. Only the build and the pack were rerun after the version bump.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 198 suites, 4606 passed, 8 skipped (build.md, 9a397eb) |
| Lint | 0 errors, 162 warnings, unchanged (build.md) |
| Production build | ok, 9.6 s; `dist/.../package.json` says 3.16.0 (`tmp/022/build.log`) |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | ok (build.md) |
| Consumer check | Angular 22 PASS, 80 HTML checks (build.md). 21.0, 21 and 22.0 run in CI on `main` |
| Package contents (`npm pack --dry-run`) | 424 files (3.15.0: 421, +3 for the `money` entry), 1.2 MB packed, 6.0 MB unpacked (3.15.0: 1.2 / 5.9); no stories or component specs; `icon-names.json` and styles in; the 7 known `src/styles/*.spec.ts` (`tmp/022/pack.log`) |

## Review items carried in the changelog (`### Known`)

| # | Severity | Item | Where it goes |
|---|---|---|---|
| S1 | should-fix, story only | "Betrag" header left-aligned in table *Clickable Rows* and *Hidden Caption* | web-developer, next patch (story CSS) |
| S2 | should-fix, story only | money *Sign Display* is 364 px wide at 360 | web-developer, next patch (story padding) |
| N1 | nit, before 022 | `actionsAlign="end"` header does not line up with the buttons | request 021 (its `align` must beat the header rule) or a 3.16.x fix |
| N2 | nit, before 022 | phoneFrame stories are 376 px at 360 | none |

No component code is affected by S1 or S2. Build.md Deviation 1 (header aligns at the end) does not hold in the stories until S1 is fixed.

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.16-bank-accounts-kit-gaps`, then `git push origin main`
2. Wait for CI on the release commit
3. Tag `v3.16.0` on the release commit (release-manager), which starts `publish-npm.yml`: tests, build, `npm stage publish` (OIDC, provenance)
4. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.16.0` (public after the owner's approval)
- **Closes:** BA-1, BA-3, BA-4, BA-5, TD-3, TD-4
- **Use it:**

```html
<lc-money [amountMinor]="-4217" currency="EUR" />

<lc-switch label="Andere Erwachsene dürfen verwalten" helpText="Sie sehen und ändern diese Verbindung." />

<lc-table [columns]="cols" [data]="rows" [clickable]="true" caption="Umsätze Oktober 2026" (rowClick)="open($event)" />

<lc-next-step-card actionsStyle="equal" actionSize="lg" primaryLabel="Ja, teilen" secondaryLabel="Nein, nicht teilen" />
```

```ts
import { LcMoneyComponent, formatMoney } from '@lifecorner/angular-ui-kit/money';
items = [{ label: 'Girokonto', href: '/finanzen/konto/1' }]; // lc-list; (linkClick) -> router.navigateByUrl
```

- **Stories:** `form-switch--with-help-text`, `data-display-table--clickable-rows`, `data-display-table--hidden-caption`, `data-display-money--default`, `--locales-and-currencies`, `--sign-display`, `feedback-next-step-card--equal-answers`, `data-display-list--link-rows`, `data-display-list--link-rows-with-router`, `components-icon--finance-icons`, `navigation-bottom-nav--finance-destination`, `navigation-sidenav--finance-destination`
