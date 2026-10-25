# Release 016: @lifecorner/angular-ui-kit 3.12.0

- **Version:** 3.12.0 (minor, previous 3.11.5; not on npm, no tag)
- **Release commit:** the commit `release: 3.12.0` on `feat/3.12-contact-form-field-gaps`, fast-forwarded to `main` (base `ef17aec` = `origin/main`, no rebase needed)

## Gates

`git diff 127caeb HEAD -- libs tools` is `input.stories.ts` (*Error Summary*) only. Jest, lint and compat ran on `127caeb` and cover everything else; the story change was gated in build.md *Round 2* (Storybook build, lint, `test:tools`). CI runs tests, build and the compat matrix again on `main`.

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | build.md: 180 suites, 4316 passed, 8 skipped |
| Lint | build.md: 0 errors, 162 warnings (= baseline) |
| Production build | green, 9.7 s (this run); `dist/.../package.json` says 3.12.0 |
| Tool tests | build.md round 2: 22 / 22 |
| Storybook build | build.md round 2: green, 904 stories |
| Consumer check | build.md: Angular 22 PASS, 68 / 68 HTML checks; CI runs the full matrix |
| Package contents (`npm pack --dry-run`) | 421 files (3.11.5: 421), 1.2 MB packed, 5.8 MB unpacked (previous 1.2 / 5.8); no component specs or stories (the 7 `src/styles/*.spec.ts` are the known pre-existing ones); `icon-names.json` present (`tmp/016/pack.log`) |

Review: approved in round 2, no open must-fix.

## Open items (not in 3.12.0)

| # | Kind | What | Where to go |
|---|---|---|---|
| 2 | should-fix, follow-up | Stacked `lc-alert` actions at 360 px / 200 % text: `lc-button` lg "Erneut senden" has a min-content of 218.3 px in a 182 px column and ends 3.3 px past the alert border (doc 0, nothing clipped). Same class as `stacked-actions` (doc +14). Idea: drop the icon indent under a rem-based container width, `min-width: 0` on the action column | new request |
| 4 | nit, pre-existing | `lc-input` error sits 4 px below its field, the `lc-textarea` error 20 px (footer) | with request 017 (error height) or new |
| 5 | nit | No audible VoiceOver / NVDA pass (AX-tree pass only). Optional owner spot-check: Tab through `form-input--error-summary`; "required" and each error said once | owner |
| 6 | nit, optional | About 30 px under the last summary link in the *Error Summary* story (44 px box); consumers can use `margin-bottom: -12px` | story, when touched |
| 7 | nit, optional | `list-style: none` drops the list role in Safari/VoiceOver; add `role="list"` to the story's `<ul>` | story, when touched |

Request 017 (stopped, waits for this release) can resume on top of `main` once 3.12.0 is tagged.

## Release through the pipeline

1. `git switch main && git merge --ff-only feat/3.12-contact-form-field-gaps`, then `git push origin main`; wait for CI
2. Tag `v3.12.0` (`v3.12.0 – <summary>`) on the release commit: starts `publish-npm.yml` (tests, build, `npm stage publish`, OIDC, provenance)
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.12.0` (public after the owner's approval)
- **Closes:** G-CF4 (stable field ids), G-CF3 (reopened: `requiredAriaLabel` no effect, `*` decorative), G-CF6 (one `*` gap), G-CF7 (quiet field errors under a summary), G-CF8 (text link in `lc-alert`)
- **Use it:**

```html
<lc-alert variant="error" title="Bitte prüfen Sie zwei Angaben">
  <ul>
    <li><a lcButton variant="link" size="sm" [flush]="true" href="#contact-email">E-Mail-Adresse</a></li>
  </ul>
</lc-alert>
<lc-input controlId="contact-email" label="E-Mail-Adresse" [required]="true" [announceError]="false" [error]="emailError" />
<lc-textarea controlId="contact-message" label="Nachricht" [announceError]="false" />

<lc-alert variant="warning" title="Wir sind gerade nicht erreichbar">
  Schreiben Sie uns.
  <a slot="action" href="mailto:kontakt@example.de">kontakt@example.de</a>
</lc-alert>
```

- **Stories:** `form-input--error-summary`, `form-input--required-asterisk`, `form-textarea--error-without-alert-role`, `feedback-alert--link-action`, `feedback-alert--link-action-stacked`
