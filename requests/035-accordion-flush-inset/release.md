# Release 035: @lifecorner/angular-ui-kit 3.23.0

- **Version:** 3.23.0 (minor, previous 3.22.4)
- **Release commit:** on `feat/3.23-accordion-flush-inset`, fast-forwarded to `main`

## Gates

Code unchanged since the developer's gates (`git diff --stat bf00b8d -- libs tools` empty); results from `build.md`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 214 suites, 5004 passed, 8 skipped (bf00b8d) |
| Lint | 0 errors, 162 warnings (baseline 162) |
| Production build | green, 9.6 s here; `dist` version 3.23.0 |
| Tool tests | 22 / 22 |
| Storybook build | green, 983 stories (+3) |
| Consumer check | Angular 22 green (89 HTML checks incl. "plain accordion"); 21 and the 21.0 / 22.0 floors run in CI |
| Package contents (`npm pack --dry-run`) | 424 files, 1.2 MB packed / 6.1 MB unpacked (= 3.22.4); the 7 spec files are the known `src/styles/*.spec.ts`; assets, styles and `icon-names.json` present |

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.23-accordion-flush-inset`, then `git push origin main`
2. Wait for CI, then push the annotated tag `v3.23.0`; it starts `publish-npm.yml` (tests, build, `npm stage publish` with provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

Open review items (not blocking, listed under "Known" in the changelog): review 035 finding 1 (`--lc-accordion-header-bleed` needs a length, `0px` not `0`; JSDoc and docs bullet to follow) and finding 2 (8 px horizontal scroll in an `overflow-x: auto` box with 0 inline padding).

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.23.0` (public after the owner's approval)
- **Closes:** BA-9
- **Use it:**

```html
<lc-accordion variant="plain" title="Quelle ansehen">
  …
</lc-accordion>
```

Drop the interim `--lc-accordion-header-padding` / `--lc-accordion-body-padding` style. Title and body start at the container edge, the header is at least 44 px high, the focus ring sits 8 px outside the text (`--lc-accordion-header-bleed: 8px`; always a length, never a unitless `0`).

- **Stories:** `components-accordion--plain-variant`, `components-accordion--plain-sizes`, `components-accordion--plain-in-card`
