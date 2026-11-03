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

**Follow-ups.** Findings that still need fixing (`should-fix`, a measured WCAG AA failure) come back as one bundled follow-up request without anyone asking: the run leaves it in `tmp/lc-request/follow-ups/<NNN>.md`, and the script starts it after the run, behind the calls already waiting. The script's output then goes on with the follow-up's final message. At most 3 follow-ups run in a row; the next ones wait in that folder for the owner. Nits and known limits go to [`BACKLOG.md`](BACKLOG.md) instead. The script runs the pipeline with the newest Node 24 from `~/.nvm` first on `PATH`, as CI does.

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
| [020](020-app-shell-prove-gaps/) App shell prove gaps: page spacing, empty state, avatar fallback, outline tone, sidenav theme | finance-intelligence | gap file rows 1–7 (app-shell-prove-2026-10-30) | 3.15.0 | 3.15.0 |
| [021](021-sources-page-kit-gaps/) Sources page kit gaps: table number columns, button loading focus, progress-bar and toast docs, list success badge contrast | finance-intelligence | gap file rows 1–5 (quellen-2026-10-31) | 3.17.0 | 3.17.0 |
| [022](022-bank-accounts-kit-gaps/) Bank accounts kit gaps: switch help text, keyboard table rows and caption, lc-money, equal next-step actions, wallet and bank icons, link list rows | life-os | BA-1, BA-3, BA-4, BA-5, TD-3, TD-4 | 3.16.0 | 3.16.0 |
| [023](023-bottom-nav-more-modal-close-icon/) lc-bottom-nav "More" on request; decorative lc-modal close icon | finance-intelligence | gap file rows 6 and 8 (quellen-2026-10-31) | 3.18.0 | 3.18.0 |
| [024](024-review-findings-follow-up/) Review findings follow-up: table cellClass and pagination, toast targets, decorative icons, menu danger contrast | owner | review findings (020 S2, 021 F1/F2, 023 svg-img-alt) | 3.19.0 | 3.19.0 |
| [025](025-review-findings-follow-up-2/) Review findings follow-up 2: toast wrapping and host layout, drawer close targets, axe findings, unlabelled icons | owner | review findings 1–4 of 024, 024 build.md line 59 | 3.19.1 | 3.19.1 |
| [026](026-review-findings-follow-up-3/) Review findings follow-up 3: toast close colour, notification-center comment, drawer story lang | owner | review findings 1–3 of 025 | 3.19.2 | 3.19.2 |
| [027](027-money-without-currency-symbol/) lc-money and formatMoney without the currency symbol; toast and alert variant icon contrast | finance-intelligence | gap file row 1 (services-2026-11-01) | 3.20.0 | – |
| [028](028-bar-chart-labels-item-formatter/) lc-bar-chart label band and item-aware value formatter | finance-intelligence | gap file row 1 (cockpit-2026-11-01) | 3.21.0 | 3.21.0 |
| [029](029-status-ink-contrast-follow-up/) Status ink contrast follow-up of 027 (notification-center, card, markdown, status-dot, pipeline, file-upload, rating, viewers, kanban, progress) and the money Number Column caveat | owner | 027 review finding 2, 027 design §5 | 3.21.1 | 3.21.1 |
| [030](030-inline-search-lock-tablet-icons/) Inline magnifying-glass, lock and device-tablet icons; lc-search-input and lc-log-viewer register their glyph | life-os | BA-6, BA-7 | 3.22.0 | 3.22.0 |
| [031](031-stat-trend-label-value-separator/) lc-stat-trend label and value without a separator | finance-intelligence | gap file row 2 (cockpit-2026-11-01) | 3.22.1 | 3.22.1 |
| [032](032-skeleton-percentage-width-once/) lc-skeleton applies a percentage width twice | finance-intelligence | gap file row 3 (cockpit-2026-11-01) | 3.22.2 | 3.22.2 |
| [033](033-description-list-margin-reset/) lc-description-list keeps the browser's dd margin | life-os | BA-8 | 3.22.3 | 3.22.3 |
| [034](034-status-ink-contrast-follow-up-2/) Status ink contrast follow-up 2: notification-center high chip, progress-ring, diff-viewer, card primary chip, log-viewer pills and dimmed text, dependency-viewer edge labels | owner | F-1 to F-7 of 029 | 3.22.4 | 3.22.4 |
| [035](035-accordion-flush-inset/) lc-accordion flush form without inline padding | life-os | BA-9 | 3.23.0 | 3.23.0 |
| [036](036-description-list-and-status-ink-follow-ups/) Description-list contrast and targets, 033 story and comment fixes, 034 status-ink follow-ups (notification-center, dependency-viewer, log-viewer, progress-bar, progress-ring) | owner | BA-10; 033 review findings 2–4; 034 F-8 to F-13 | 3.23.1 | 3.23.1 |
| [037](037-card-link-file-upload-checks/) lc-card link mode; lc-file-upload rejection code, type check on drop, locale sizes and docs | finance-intelligence | gap file rows 1–3 (quellen-2026-11-02) | 3.24.0 | 3.24.0 |
| [038](038-accordion-bleed-hook-follow-ups/) lc-accordion bleed hook robust to a unitless 0, scroll-container note | owner | 035 review findings 1–2 (BA-9) | 3.24.1 | 3.24.1 |
| [039](039-progress-focus-borders-dl-semantics/) Progress-bar dark fill, focus halos (≥ 3:1, Highlight), dependency-viewer borders, description-list row semantics | owner | 036 F-14 to F-17 | 3.25.1 | 3.25.0, 3.25.1 |
| [040](040-file-upload-nested-interactive/) lc-file-upload without nested interactive elements | owner | 037 review finding 5 | 3.25.2 | 3.25.2 |
| [041](041-button-describedby-dl-value-wrap/) lc-button ariaDescribedBy; lc-description-list short values never break inside | finance-intelligence | gap file row 7 (quellen-2026-11-03); description-list bug | 3.26.0 | 3.26.0 |
| [042](042-focus-hover-targets-follow-ups/) Focus indicators kit-wide, focus over hover in fields, dependency-viewer at 360 px, file-upload remove target | owner | 039/040 F-18 to F-21 | 3.27.0 | 3.27.0 |
| [043](043-targets-hover-contrast-follow-ups/) Targets, hover borders and contrast follow-ups (notification-center, log-viewer, callout, select, tag, rich-text-editor, document-viewer, chat, table, fields, header, gallery, kanban) | owner | 042 F-22 to F-27 | 3.27.1 | 3.27.1 |
| [044](044-chat-editor-filled-field-follow-ups/) Chat remove target, rich-text-editor mode state, filled-field boundary | owner | 043 F-28, F-29, F-31 | 3.27.2 | 3.27.2 |
