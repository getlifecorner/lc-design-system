# LifeCorner Design System

A standalone Angular component library (`@lifecorner/angular-ui-kit`, formerly `@life-cockpit/angular-ui-kit`) with 112 accessible, themeable components built with Angular 22 (apps on Angular 21 and 22 are supported), TailwindCSS, and design tokens.

Docs and Storybook: https://design.life-cockpit.de (MCP endpoint `/mcp`). The site moves to `design.lifecorner.de` once the owner registers `lifecorner.de`; until then the domain and the CDK stack keep the old name.

## Structure

| Project | Path | Description |
|---------|------|-------------|
| `ui-kit` | `libs/angular-ui-kit/` | Publishable Angular component library |

## Quick Start

```sh
npm install

# Start Storybook
npx nx storybook angular-ui-kit

# Build the library for publishing
npx nx build angular-ui-kit
```

## Components

accordion, accordion-group, alert, app-page, app-shell, area-chart, area-map, avatar, avatar-group, badge, bar-chart, bottom-nav, breadcrumbs, button, button-link (`a[lcButton]`), calendar, callout, card, character, chat, checkbox, chip, choice-prompt, code-block, color-picker, combobox, confirm-dialog, container, copy-field, date-range-picker, datepicker, dependency-viewer, description-list, device-frame, diff-viewer, divider, document-viewer, donut-chart, drawer, email-input, empty-state, error-display, field-group, file-upload, filter-bar, footer, funnel-chart, gallery, gantt-chart, gauge, header, heatmap, hero, icon, input, kanban-board, line-chart, list, log-viewer, logo, markdown, menu, modal, money, next-step-card, notification-center, number-input, page-header, page-layout, pagination, password-input, picture, pie-chart, pipeline, popover, progress-bar, progress-ring, provider-button, radar-chart, radio, radio-group, rating, rich-text-editor, scatter-plot, search-input, section, select, sidenav, sidenav-placeholder, skeleton, slider, spacer, sparkline, spinner, split-pane, stack, stacked-bar-chart, stage-list, stat-trend, state-strip, status-dot, stepper, switch, tab, table, tabs, tag-input, textarea, timeline, toast, toast-outlet, toggle-group, toolbar, tooltip, tree-view, typography, verification-code-input, waterfall-chart

New in 3.40: `lc-area-map` (status groups with lines into one layer, for a hero band), `device="laptop"` on `lc-device-frame`, `wrap` and the `emphasis` / `quiet` variants on `lc-chip` with an on-band palette in `lc-hero`, and the icons `shopping-bag`, `target`, `heart` and `gift`.

New in 3.38: `lc-card` text with word breaks (a clickable card can be named by its visible text) and `lc-hero` label, title and body at 4.5:1 or more on every default band.

New in 3.37: `TableAction.size` on `lc-table`, `fill` on `lc-hero`, a 44 px clear target and focus return in `lc-select`, word breaks in `lc-description-list`, badges at full contrast in the `lc-hero` body, a native row button beside the action in `lc-list`, a 3:1 chart palette and a whole-strip pointer in `lc-state-strip`.

New in 3.36: `lc-state-strip` (the states of the last runs), `badge` and `total` on `lc-description-list` items, `showChevron` on `lc-list`, `contextBadge` on `lc-header`, `headingLevel` and `focusTitle()` on `lc-hero`, `variant="band"` on `lc-stacked-bar-chart`, `footerRow` and `TableAction.ariaLabel` on `lc-table`, `collapsible` on `lc-card` and `variant="inverse-outline"` on buttons.

New in 3.35: `focus()` on `lc-textarea` and `lc-combobox`, `returnFocusTo` on `lc-drawer` and `lc-sidenav`, the 2 px focus ring on `lc-combobox`, and an inline button action in `lc-alert` that moves below the text at phone width.

New in 3.34: `returnFocusTo` on `lc-modal` and `lc-confirm-dialog` (the focus goes back to the trigger, also in WebKit), `focusContext()` on `lc-header`, `focusItem()` on `lc-list`, and a 44 px, dark-visible close × on `lc-alert`.

New in 3.33: `focusTitle()` on `lc-next-step-card` (focus after an action), `contextPlacement="below"` on `lc-header` (the context button on the phone) and `aria-current` on the selected `lc-list` row.

New in 3.30: `label` on `lc-datepicker`, 24 px clear buttons with 44 px hit areas in `lc-datepicker` and `lc-combobox`, a 44 px `size="lg"` combobox input, a ring on the selected day in dark, and 44 px day-panel targets below 1024 px.

New in 3.29: `granularity="month"` on `lc-datepicker`, `[(selectedValue)]` on `lc-combobox`, `locale`, `suffix` and `size` (up to 44 px) on `lc-number-input`, a range (`rangeToMinor`, `formatMoneyRange()`) on `lc-money` and `footerLayout="equal"` on `lc-card`.

New in 3.28: toasts that clear the `lc-app-shell` header and floating bar (`--lc-toast-outlet-offset-top` / `-bottom`), `reserveAside` on `lc-app-page` (the right column on every page) and `contentWidth="wide"` with `[page-wide]` for a table over that column.

New in 3.27: a keyboard focus ring on every kit control (and `Highlight` in forced colours), a focused field keeps its focus colour under the pointer, `regionLabel` and sideways scrolling for `lc-dependency-viewer` at 360 px, and a 44 px remove target in `lc-file-upload`.

New in 3.26: `ariaDescribedBy` on `lc-button` (a visible reason line for a disabled or loading button) and `lc-description-list` rows where a short value such as „10“ no longer breaks inside next to a long term.

New in 3.25: clickable `lc-description-list` rows keep their `dt`/`dd` pairs (a native button per row instead of `role="button"`), solid focus rings instead of translucent halos, a 3:1 dark fill on `lc-progress-bar` and 3:1 borders in `lc-dependency-viewer`.

New in 3.24: link mode on `lc-card` (`href`, or `route` + `queryParams`; the title is a real link in its heading), and `lc-file-upload` with `fileRejected.code`, a type check on drop and `locale` for sizes.

New in 3.22: the `search`, `lock` and `device-tablet` icons are inline (`ICON_SEARCH`, `ICON_LOCK`, `ICON_DEVICE_TABLET`), and `lc-search-input` and `lc-log-viewer` register their own glyphs, so `unregistered: 'placeholder'` no longer shows "?" in them.

New in 3.21: `labelLayout="wrap"` on `lc-bar-chart` (wrapping HTML labels, a ranking in a 360 px card), `valueText` on `BarChartItem` and an item-aware `formatValue(value, item)`.

New in 3.20: `showCurrency` on `lc-money` and `formatMoney` (amounts without the currency symbol for columns whose header names the unit), and variant icons in `lc-toast` and `lc-alert` that reach 3:1 contrast.

New in 3.19: `pageSizeLabel` on `lc-table`, a table pager that fits at 360 px, 44 px close and action targets in `lc-toast`, decorative icons in `lc-drawer` and `lc-notification-center`, and a readable danger item in `lc-menu`.

New in 3.17: `align="end"` on `lc-table` columns (tabular figures), a focusable `loading` button, progress bars under reduced motion and forced colours, readable `lc-list` badges, and a page on `ToastService.show()`.

New in 3.16: `lc-money` (amounts in minor units, own entry point), `helpText` on `lc-switch`, `clickable` and `caption` on `lc-table`, `actionsStyle="equal"` on `lc-next-step-card`, `href` rows in `lc-list`, and the `wallet`, `building-bank` and `shield-lock` icons.

New in 3.13: `variant="inverse"` on buttons for the dark `lc-hero` bands, and `lc-input` keeps its height in an error.

New in 3.12: `controlId` and `announceError` on `lc-input` and `lc-textarea`, a decorative `*` with one gap, and a text link in the action slot of `lc-alert`.

New in 3.11: `wrap` on `lc-badge` and the `--lc-btn-overflow-wrap` hook on buttons; page-header, footer and next-step-card reflow at 200 % text on a phone.

New in 3.10: `name`, `value` (model) and `requiredIndicator` on `lc-textarea`, for forms that post and pre-fill without JavaScript.

New in 3.9: `[shell-horizon-figure]` on `lc-app-shell`, the shell footer on the land, `size="secondary"` on `lc-page-header`, `flush` on buttons, `--lc-skeleton-height`, and slimmer horizon land from 1024 px.

New in 3.8: character (Edu in 14 poses, also as files and as SVG strings in `@lifecorner/angular-ui-kit/character-svg`) and the horizon figure slot `.lc-horizon__figure`.

New in 3.6: sidenav-placeholder, tree-shakable icons (`provideLcIcons` with the constants of `@lifecorner/angular-ui-kit/icons`) and underlined inline links.

New in 3.3: app-shell, app-page, bottom-nav, provider-button, radio-group, copy-field. Plus theme (`ThemeService`), design tokens and global classes (`.lc-horizon`, `.lc-display`, `.lc-title`, `.lc-overline`).

Since 3.5 each component folder of `libs/angular-ui-kit/src/lib/` is a secondary entry, `@lifecorner/angular-ui-kit/<folder>` (for example `import { IconComponent } from '@lifecorner/angular-ui-kit/icon'`), built from a one-line `ng-package.json` stub in `libs/angular-ui-kit/<folder>/`. Entries import each other by package path (`@lifecorner/angular-ui-kit/icon`), never by a relative path; the primary entry `@lifecorner/angular-ui-kit` re-exports every public entry and keeps working. `internal/{overlay,chart,url}` are the kit's own shared helpers (formerly `lib/shared/`).

## Design Tokens

Design tokens are managed via [Style Dictionary](https://amzn.github.io/style-dictionary/) and generate both TypeScript constants and SCSS variables from `libs/angular-ui-kit/tokens.json`.

```sh
cd libs/angular-ui-kit && npx style-dictionary build
```

## Requesting a change (agent pipeline)

A consuming project hands a requirement or gap to four Claude Code agents in this repository: spec, UI/UX design, development, release. They take it all the way to a staged npm release:

```sh
../lc-design-system/scripts/lc-request.sh "lc-hero needs a media slot beside the text (G-13)"
```

In this repository: `/lc-request <requirement>`. How it works: [CLAUDE.md](CLAUDE.md#agent-pipeline) and [requests/](requests/README.md).

## Publishing

Releases go through `.github/workflows/publish-npm.yml`. It tests, builds and **stages** the package with npm trusted publishing (OIDC, no npm token, with provenance). There are two ways to start it:

- Pushing the annotated tag `v<version>` on the release commit, once it is on `main` and CI is green. This is the normal path: the `release-manager` agent pushes the tag and watches the run, because the agents' token can't dispatch workflows (see [CLAUDE.md](CLAUDE.md#agent-pipeline)). A failed run leaves the tag behind; that version is spent.
- `gh workflow run publish-npm.yml --ref main -f version=<version>` (the owner, by hand). It also checks the changelog and the existing tags, and tags the commit `v<version>` once staging succeeded.

In both cases `<version>` is the version in `libs/angular-ui-kit/package.json`. It becomes public only after a maintainer approves it with 2FA:

```sh
npm stage list @lifecorner/angular-ui-kit
npm stage approve <stage-id>   # asks for 2FA
```

## Tech Stack

- **Angular** 22 (standalone components, signals, OnPush); peer range `^21.0.0 || ^22.0.0`
- **TailwindCSS** 3.4 with custom theme
- **Nx** 23 monorepo tooling (Node.js 24)
- **ng-packagr** for library builds

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/angular:app <app-name>
```

To generate a new library, use:

```sh
npx nx g @nx/angular:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
