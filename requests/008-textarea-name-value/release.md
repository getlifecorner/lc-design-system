# Release 008: @lifecorner/angular-ui-kit 3.10.0

- **Version:** 3.10.0 (minor, previous 3.9.0; not on npm, tag v3.9.0 is the latest)
- **Release commit:** `release: 3.10.0` on `feat/3.10-textarea-name-value`, fast-forwarded to `main`

## Gates

`git diff --quiet 921167b -- libs tools` holds (libs/tools unchanged since the developer's gates), so the results are taken from build.md. CI and the publish run repeat tests, build and compat.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 155 suites, 3964 passed, 8 skipped (build.md, 921167b) |
| Lint | 0 errors, 162 warnings (= main) (build.md) |
| Production build | ok, 9.1 s here; `dist/.../package.json` has 3.10.0 |
| Tool tests | 22 / 22 (build.md) |
| Storybook build | ok (build.md) |
| Consumer check Angular 21.0 · 21 · 22.0 · 22 | PASS on 21.0.9, 21.2.25, 22.0.8, 22.2.3, 48 prerender checks each (build.md) |
| Package contents (`npm pack --dry-run`) | 418 files, 1.1 MB packed, 5.7 MB unpacked (3.9.0: 418 files, 1.1 MB); `icon-names.json` and styles in; the only specs are the five `src/styles/*.spec.ts` known since 3.4.1; no stories |

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`
2. Wait for CI, then `gh workflow run publish-npm.yml --ref main -f version=3.10.0`: tests, build, `npm stage publish` (OIDC, provenance), then the tag `v3.10.0`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## Notes from review

- Finding 1 (changelog): done, in Compatibility.
- Finding 2 (nit, for life-os): `lc-textarea` md text sits at x 33, 16 / 24 px, `lc-input` lg at x 37, 18 / 27; use `size="lg"` on the textarea to match. Surface colours differ as in 3.9. No kit change.
- Follow-ups for `lc-input`, not in 3.10: the `*` `aria-label` makes "required" announced twice; the `*` has `margin-left` 2 px (textarea 0); the lg `.input-container` is 44 px, the `<input>` box 47 px.

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.10.0` (public after the owner's approval)
- **Closes:** G-CF1, G-CF3; G-CF2 confirmed (`lc-input` `value` already prerenders, escaped)
- **Use it:**

```html
<form method="post" action="/kontakt">
  <lc-input name="email" type="email" label="E-Mail" [value]="draft.email" required />
  <lc-textarea name="message" label="Nachricht" [value]="draft.message" required [requiredIndicator]="true" size="lg" />
  <button type="submit">Senden</button>
</form>
```

- **Stories:** the new textarea stories under `Form/Textarea` (prefilled-value, prefilled-german, required-without-indicator, contact form) on design.life-cockpit.de
