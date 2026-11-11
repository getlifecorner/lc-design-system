# Requests

Every requirement for the kit that goes through the agent pipeline gets a folder `<NNN>-<slug>/` here: the requirement verbatim, then the spec, design, build report, review, release notes and a log of every handoff between the agents. How the pipeline works is described in [CLAUDE.md → Agent pipeline](../CLAUDE.md#agent-pipeline); the templates are in [`_templates/`](_templates/).

## Starting a request from another project

**One-time setup:** run `claude` once interactively in this repository and accept the trust dialog. Until then, Claude Code ignores the allow rules in `.claude/settings.json` in headless runs, and the pipeline stops at the first gate. The `gh` CLI must be logged in (`gh auth status`); to read the stage ID, `npm` must be too.

From the consuming project's directory, or from its Claude Code session through Bash:

```sh
# Collect a requirement as text (the calling directory is readable for the run, so relative paths work)
../lc-design-system/scripts/lc-request.sh "lc-hero needs a media slot beside the text from 1024 px (G-13, see docs/ux/concepts/website-v0.md)"

# Collect a requirement in a file, narrowed to one gap
../lc-design-system/scripts/lc-request.sh --file docs/ux/concepts/website-v0.md "G-13 only"

# Show the inbox; start the bundle (owner)
../lc-design-system/scripts/lc-request.sh --list
../lc-design-system/scripts/lc-request.sh --batch

# Urgent, because a consumer is blocked: run one requirement at once
../lc-design-system/scripts/lc-request.sh --now "lc-select loses its value on submit (BA-14)"

# Continue a request that stopped for the owner's answers
../lc-design-system/scripts/lc-request.sh --resume 004 "1: option A. 2: yes, as a major release."
```

**Collect, then bundle.** A requirement goes into the inbox (`tmp/lc-request/inbox/`, one file per item), and the call returns at once with the number of items waiting. Nothing runs until the owner starts the bundle with `--batch`. All items then go through the pipeline as one request and one version: one spec, one design, one build, one review, one release. The script runs Claude Code headless in this repository (`claude -p "/lc-request <bundle file>"`). Its output is the pipeline's final message, grouped by requester: the released version and how to use it, or the questions the owner has to answer. The spec-writer may send an item back to the inbox: one that needs an owner decision, or one that makes the bundle too big for one review. `--now` and `--resume` run at once. The requester is the name of the calling directory; `--from <name>` overrides it.

**One request at a time.** Two runs in one working tree would switch branches under each other, so while another request runs, a run (`--batch`, `--now`, `--resume`) waits in a queue (`tmp/lc-request/queue/`, first come, first served) and starts on its turn. Run it in the background (in Claude Code: `run_in_background`), since it can wait for hours; it prints what it waits for. `--no-wait` only reports the running request and exits with 75. If a run died without freeing `tmp/lc-request/lock` while its Claude session lives on, delete the file.

**Follow-ups.** Findings that still need fixing (`should-fix`, a measured WCAG AA failure) go back into the inbox on their own as one item, and run with the next bundle. Nits and known limits go to [`BACKLOG.md`](BACKLOG.md) instead. The script runs the pipeline with the newest Node 24 from `~/.nvm` first on `PATH`, as CI does.

Nobody has to approve the release: once the review is approved and every gate is green, the release manager pushes `main`, waits for CI and pushes the release tag `vX.Y.Z`, which starts `publish-npm.yml` (the agents' GitHub token can't dispatch workflows). The release manager watches that run, which stages the package on npm. The package is public once the owner approves the npm stage with 2FA. The pipeline stops for the owner only for decisions agents may not make (a breaking change, a new runtime dependency, an npm or GitHub failure).

Interactively, in this repository: `/lc-request <requirement or path> [--from <project>]` collects, `/lc-request --batch` starts the bundle, `/lc-request --now <requirement>` runs at once.

### For a consuming project's CLAUDE.md

> **Design-system gaps** are closed in the kit, never rebuilt locally: run `../lc-design-system/scripts/lc-request.sh --file <concept file> "<gap ID>: <what is missing>"`. It returns at once: the gap is collected for the kit's next bundle, which its owner starts, and the release's changelog names the gap ID (the design-system MCP's `get_changelog`). Only when the gap blocks your work, add `--now` and run it in the background (it can wait hours while another request runs); it then answers with the kit version that closes the gap, or with questions for the owner.

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
| [045](045-toast-offsets-page-aside-width/) lc-toast-outlet offsets in the app shell; lc-app-page reserved aside column and wide content | bundle (life-os) | AS-34, AS-35, AS-36 | 3.28.0 | 3.28.0 |
| [046](046-inputs-money-range-card-footer/) lc-datepicker month granularity, lc-combobox two-way value, lc-number-input decimal comma, unit and size; lc-money range; lc-card equal footer | bundle (finance-intelligence, life-os) | regeln-2026-11-03 rows 1–4; CC-1, CC-2 | 3.29.0 | |
| [047](047-datepicker-combobox-targets-label/) lc-datepicker and lc-combobox clear targets, datepicker selected day in dark, combobox lg input height, datepicker label | bundle (owner, finance-intelligence) | 046-f1, 046-f2; regeln-2026-11-03 rows 5–7 | 3.30.0 | 3.30.0 |
| [048](048-datepicker-label-day-names/) lc-datepicker Label (DE) story description, day button accessible names | bundle (owner) | 047-f1, 047-f2 | 3.30.1 | 3.30.1 |
| [049](049-overlay-panel-lang/) lc-datepicker, lc-date-range-picker and lc-combobox overlay panel language | bundle (owner) | 048-f1 | 3.30.2 | 3.30.2 |
| [050](050-overlay-lang-nav-badges/) lc-select, lc-menu, lc-tooltip, lc-popover overlay language; lc-bottom-nav moreBadge, lc-sidenav badgeAriaLabel | bundle (owner, finance-intelligence) | 049-f1; stammdaten-2026-11-05 rows 1–2 | 3.31.0 | 3.31.0 |
| [051](051-badge-contrast-tooltip-combobox-focus/) lc-bottom-nav current-pill badge contrast, lc-sidenav light rail badges, lcTooltip on lc-button focus, lc-combobox openOnFocus | bundle (owner, finance-intelligence) | 050-f1, 050-f2, 050-f3; stammdaten-2026-11-05 row 3 | 3.32.0 | 3.32.0 |
| [052](052-focus-title-header-row-backlog/) lc-next-step-card focusTitle(), lc-header contextPlacement, lc-list aria-current, backlog sweep (20 rows) | bundle (finance-intelligence, owner) | monatsstand-2026-11-05 row 1; app-shell-2026-11-05 rows 1–2; BACKLOG (20 rows) | 3.33.0 | 3.33.0 |
| [053](053-toast-stack-gap/) lc-toast-outlet stack gap | bundle (owner) | 052-s2 | 3.33.1 | 3.33.1 |
| [054](054-focus-return-alert-close/) lc-modal / lc-confirm-dialog returnFocusTo, lc-header focusContext(), lc-list focusItem(), lc-alert close target | bundle (finance-intelligence) | monatsstand-2026-11-06 rows 1–3, bug | 3.34.0 | 3.34.0 |
| [055](055-textarea-combobox-focus-backlog/) lc-textarea / lc-combobox focus(), backlog sweep (9 rows) | bundle (finance-intelligence, owner) | monatsstand-prove-2026-11-06 row 1; BACKLOG (9 rows) | 3.35.0 | 3.35.0 |
| [056](056-state-strip-footer-collapse-backlog/) lc-state-strip (new), lc-description-list badge and total, lc-list showChevron, lc-header contextBadge, lc-hero headingLevel and focusTitle(), lc-stacked-bar-chart band, lc-table footerRow and TableAction ariaLabel, lc-card collapsible, lc-button inverse variant, backlog sweep (5 rows) | bundle (finance-intelligence, owner) | quellen-2026-11-06 rows 1–3; app-shell-2026-11-07 rows 1–2; cockpit-2026-11-07 rows 1–2; services-2026-11-07 rows 1–2; regeln-2026-11-07 row 1; monatsstand-2026-11-07 rows 1–2; BACKLOG (5 rows) | 3.36.0 | 3.36.0 |
| [057](057-select-hero-table-a11y-backlog/) lc-select clear target and focus return, lc-description-list whitespace, lc-hero slot contrast and fill, lc-table TableAction size, lc-list nested action, CHART_PALETTE contrast, lc-state-strip dense strips, backlog sweep (3 rows) | bundle (owner, finance-intelligence) | 056 S-1, F-2, F-1; services-2026-11-09 rows 1–3; regeln-2026-11-09 row 1; monatsstand-2026-11-09 row 1; cockpit-2026-11-09 row 1; BACKLOG (3 rows) | 3.37.0 | 3.37.0 |
| [058](058-card-name-hero-band-contrast/) lc-card accessible name, lc-hero band contrast | bundle (owner) | 057-s1, 057-s2 | 3.38.0 | 3.38.0 |
| [059](059-device-frame-picture-select-list/) lc-device-frame and lc-picture (new), lc-select clearable, lc-description-list total whitespace, lc-list item ariaLabel | bundle (life-os, finance-intelligence) | G-SS1, G-SS2; services-prove-2026-11-10 row 1 + bug; stammdaten-prove-2026-11-10 row 1 | 3.39.0 | |
