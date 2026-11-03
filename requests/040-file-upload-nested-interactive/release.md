# Release 040: @lifecorner/angular-ui-kit 3.25.2

- **Version:** 3.25.2 (patch, previous 3.25.1)
- **Release commit:** see `git log` (`release: 3.25.2 — …`) on `fix/3.25.2-file-upload-nested-interactive`, then `main`

## Gates

Library code is unchanged since the developer's gate commit bf5bfd9 (`git diff --stat bf5bfd9 -- libs tools` empty), so tests, lint, tool tests and the Storybook build are taken from `build.md`; CI runs them again.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | build.md: 220 suites, 5199 passed, 8 skipped |
| Lint | build.md: 0 errors, 162 warnings (baseline 162) |
| Production build | green, 9.6 s; `dist/.../package.json` says 3.25.2 |
| Tool tests | build.md: 22 / 22 |
| Storybook build | build.md: 994 stories |
| Consumer check | Angular 22 PASS (build.md, 22.2.4, 94 checks incl. the new file-upload row); Angular 21 PASS (release run, 21.2.26, cdk 21.2.14, TS 5.9.3; `tmp/040/compat21.log`) |
| Package contents | 424 files, 1.2 MB packed / 6.2 MB unpacked (= 3.25.1); 0 stories or component specs; `icon-names.json` and 37 asset lines present |

## Open findings (none blocks the release)

| ID | What | Where |
|---|---|---|
| Nit 1 | Review data in the changelog draft | Applied: the *Fixed* bullet now states consumer facts only |
| Nit 2 | A native chooser on a real key press or click was not observed (no user activation in the headless measures); the spec accepts the `input.click()` spy | Optional owner check: `node tmp/story-shots/040/r1-picker.mjs form-file-upload--default,form-file-upload--disabled,form-file-upload--german-locale 360 light` |
| F-18 | Buttons with no focus style of their own under the global reset | 039 design §6 |
| F-19 | Textarea outline: hover beats focus | 039 design §6 |
| F-20 | `autoFit` at 360 px: 0.71 px strokes, about 5.6 px labels in the dependency viewer | 039 design §6 |
| F-21 | The list's remove button (`.file-upload__file-remove`) is 20 px, below the 44 px target (axe `target-size` passes by spacing; spec non-goal) | 040 review |

## Release through the pipeline

1. `git switch main && git merge --ff-only fix/3.25.2-file-upload-nested-interactive`, then `git push origin main`
2. Wait for CI on the release commit, then push the annotated tag `v3.25.2`; it starts `publish-npm.yml` (tests, build, `npm stage publish` with OIDC and provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.25.2` (public after the owner's approval)
- **Closes:** 037 review finding 5 (axe `nested-interactive` in `lc-file-upload`)
- **Use it:** nothing changes in your template. Update, and axe no longer reports `nested-interactive` on the zone.

```html
<lc-file-upload accept=".pdf,.png" [multiple]="true" (filesSelected)="onFiles($event)" />
```

- **Stories:** `form-file-upload--default`, `--with-restrictions`, `--disabled`, `--single-file`, `--type-rejected-on-drop`, `--size-rejected`, `--german-locale`
