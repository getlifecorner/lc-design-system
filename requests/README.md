# Requests

Every requirement for the kit that goes through the agent pipeline gets a folder `<NNN>-<slug>/` here: the requirement verbatim, then the spec, design, build report, review, release notes and a log of every handoff between the agents. How the pipeline works is described in [CLAUDE.md → Agent pipeline](../CLAUDE.md#agent-pipeline); the templates are in [`_templates/`](_templates/).

## Starting a request from another project

**One-time setup:** run `claude` once interactively in this repository and accept the trust dialog. Until then, Claude Code ignores the allow rules in `.claude/settings.json` in headless runs, and the pipeline stops at the first gate. The `gh` CLI must be logged in (`gh auth status`); to read the stage ID, `npm` must be too.

From the consuming project's directory, or from its Claude Code session through Bash:

```sh
# The requirement as text (the calling directory is readable for the run, so relative paths work)
../lc-design-system/scripts/lc-request.sh "lc-hero needs a media slot beside the text from 1024 px (G-13, see docs/ux/concepts/website-v0.md)"

# The requirement in a file, narrowed to one gap
../lc-design-system/scripts/lc-request.sh --file docs/ux/concepts/website-v0.md "G-13 only"

# Continue a request that stopped for the owner's answers
../lc-design-system/scripts/lc-request.sh --resume 004 "1: option A. 2: yes, as a major release."
```

The script runs Claude Code headless in this repository (`claude -p "/lc-request …"`). Its output is the pipeline's final message: the released version and how to use it, or the questions the owner has to answer. The requester is the name of the calling directory; `--from <name>` overrides it.

**One request at a time.** Two runs in one working tree would switch branches under each other, so while another request runs, the script waits in a queue (`tmp/lc-request/queue/`, first come, first served) and starts on its turn. Run it in the background (in Claude Code: `run_in_background`), since it can wait for hours; it prints what it waits for. `--no-wait` only reports the running request and exits with 75. If a run died without freeing `tmp/lc-request/lock` while its Claude session lives on, delete the file.

Nobody has to approve the release: once the review is approved and every gate is green, the release manager pushes `main`, waits for CI and pushes the release tag `vX.Y.Z`, which starts `publish-npm.yml` (the agents' GitHub token can't dispatch workflows). The release manager watches that run, which stages the package on npm. The package is public once the owner approves the npm stage with 2FA. The pipeline stops for the owner only for decisions agents may not make (a breaking change, a new runtime dependency, an npm or GitHub failure).

Interactively, in this repository: `/lc-request <requirement or path> [--from <project>]`.

### For a consuming project's CLAUDE.md

> **Design-system gaps** are closed in the kit, never rebuilt locally: run `../lc-design-system/scripts/lc-request.sh --file <concept file> "<gap ID>: <what is missing>"` in the background (it waits while another request runs). The pipeline answers with the kit version that closes it, or with questions for the owner.

## Index

| Request | From | Gap IDs | Status | Version |
|---|---|---|---|---|
| [001](001-f1-app-shell-gaps/) F1 app-shell gaps | life-os | AS-12, AS-14, AS-15, AS-16 (AS-13 optional) | 3.5.1 | 3.5.1 |
| [002](002-f1-bundle-size-gaps/) F1 bundle-size and link-cue gaps | life-os | AS-17, AS-18, AS-19 | 3.6.0 | 3.6.0 |
| [003](003-code-block-trusted-types/) lc-code-block under Trusted Types | life-os | AS-20 | 3.6.1 | 3.6.1 |
| [004](004-code-block-scroll-region/) lc-code-block scroll region | life-os | AS-21 | 3.7.0 | 3.7.0 |
| [005](005-edu-character-poses/) Edu's character poses | life-os | G-4 | 3.8.0 | 3.8.0 |
| [006](006-f1-shell-review-gaps/) F1 shell review gaps | life-os | AS-22–AS-29, HS-6, SI-14, LK-12 | 3.9.0 | 3.9.0 |
| [007](007-lighter-sidenav-placeholder/) Lighter sidenav placeholder | life-os | AS-28 | answered | — (measured, not worth it) |
| [008](008-textarea-name-value/) lc-textarea name and value for no-script posts | life-os | G-CF1 (G-CF2 confirm, G-CF3 optional) | 3.10.0 | 3.10.0 |
| [009](009-signed-in-shell-200-text/) Signed-in shell at 200 % text on a phone | life-os | AS-31 | 3.10.1 | 3.10.1 |
| [010](010-reflow-200-text-phone/) Reflow gaps at 200 % text on a phone | life-os | AS-30 (2), AS-32, SI-15 | 3.11.0 (staged, awaiting 2FA) | 3.11.0 |
| [011](011-icon-csp-footer-reflow/) lc-icon without inline styles, footer at 320 px with 200 % text | life-os | G-37, G-36 | 3.11.1 (staged, awaiting 2FA) | 3.11.1 |
| [012](012-image-size-lazy-button-transition/) Image size and lazy loading for logo, character, avatar; narrower button transition | life-os | G-38, G-39, G-40, G-41 | 3.11.2 (staged, awaiting 2FA) | 3.11.2 |
| [013](013-comforts-pose-worried-brows/) Edu's "comforts" pose reads angry: worried brows | life-os | G-42 | 3.11.3 (staged, awaiting 2FA) | 3.11.3 |
| [014](014-avatar-trigger-label-in-name/) lc-header avatar trigger: Label in Name under axe-core 4.14 | life-os | AS-33 | 3.11.4 | — |
| [015](015-label-in-name-remaining-components/) Label in Name for the remaining eight components under axe-core 4.14 | life-os | AS-33 (follow-up) | 3.11.5 (staged, awaiting 2FA) | 3.11.5 |
| [016](016-contact-form-field-gaps/) Contact form field and alert gaps | life-os | G-CF4, G-CF3 (reopened), G-CF6, G-CF7, G-CF8 | 3.12.0 | 3.12.0 |
| [017](017-input-error-height-band-button/) lc-input error-state height; link button on the hero band | life-os | G-WL3, G-WL1 (wish) | 3.13.0 | 3.13.0 |
| [018](018-alert-narrow-container-words/) lc-alert in a narrow container: long words and a narrow layout | life-os | G-WL4 | 3.13.1 | 3.13.1 |
| [019](019-app-shell-full-height-nav/) App shell full-height nav, sidenav text brand, shell background, stat-trend sentiment | finance-intelligence | gap file rows 1–4 (app-shell-2026-10-30) | 3.14.0 | 3.14.0 |
