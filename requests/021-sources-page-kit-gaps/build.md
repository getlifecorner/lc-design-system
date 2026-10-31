# Build 021: Sources page kit gaps

- **Branch:** `feat/3.17-sources-page-kit-gaps` (from main `0ce6422`, 3.16.0)
- **Commit:** see `git log -1` (one commit, amended; round 1 gates ran on the code of `d927ad0`)

## Files changed

| File | Change |
|---|---|
| `table/` component ts/html/scss, stories, `table.align.spec.ts` (new) | `TableColumn.align` + `TableColumnAlign`; `lc-table__cell--end`; `lc-table__sort-label` (arrow before the label); N1 selectors with `thead tr th` / `tbody tr td` weight; ARR/SLA and Betrag use `align`; *Number Columns* (r1: negatives via `cellStyle`, no story `<style>`); `cellClass` JSDoc (r1: colour/font size → `cellStyle`) |
| `button/` component ts/html/scss, stories, `button.loading.spec.ts` (new), 3 changed specs | `aria-disabled` loading, `handleClick` cancels; `.btn-loading` dim, 21 hover/active rules exclude it, ring, forced colours; Loading play, *Loading Keeps Focus* |
| `progress-bar/` scss, ts, stories, `.motion.spec.ts` (new) | reduced-motion and forced-colors blocks, JSDoc, *Indeterminate Sizes* |
| `list/` scss, stories · `toast/` html, spec, service, 2 stories | badge pairs (design §5), *Status Badges* · decorative icons, doc (§7 1–6), *Service Call* |
| `styles/theme-contrast.spec.ts` · `tools/agents/story-shots.mjs` · `tools/compat/` (home, checks) | 3.17 pairings · `--forced-colors` · end column + loading button, 2 `EXPECT_IN_HTML` |

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1, 4 | `table.align.spec.ts` (class only with `end`, default DOM pinned); *Number Columns*: label/cell right − content right = 0 px at 360/1024/1280 and 200 % (`tmp/021/measure-table*.log`); no `--numeric` class left |
| 2 | th/td `tabular-nums`; "1.111" = "8.888" = 38.7 px, "1.111,11 €" = "8.888,88 €" = 72.5 px |
| 3 | unit: paginate (next page), actions, cellClass (both classes), sort structure; story: arrow right = label left − 8 px (16 at 200 %), label flush (0); th width with/without arrow equal (the sorted page holds other rows) |
| N1 | `--with-icon-only-actions` diff only in the header row (y 33–44); *Number Columns* "Aktionen" text right = buttons right |
| 5, 6 | `button.loading.spec.ts` (focus stays, no `disabled`, aria "true"; click/Enter/Space, submit, reset, host click blocked; `disabled` native and wins) |
| 7 | 148/148 button shots identical to baseline; ring 3.39:1 L, 4.85–4.97:1 D, inverse white on the band ≥ 4.37:1; `disabledReason` title test |
| 8, 11, 13 | JSDoc (`loading`, `disabled`, progress class + `indeterminate`); story descriptions; role/aria specs unchanged; Toast Outlet docs + *Service Call*, toast icons `aria-hidden` (spec) |
| 9 | *Indeterminate Sizes*: `animationName` none, fill 328 = track 328 px, ring dash "10.472px, 10.472px" |
| 10 | `--forced-colors` shots `tmp/story-shots/021/forced/` (12): track outline 1 px CanvasText, fill Highlight, ring track GrayText; bars visible |
| 12 | contrast spec = design §5 (success 4.85/5.17, warning 5.52/4.61, error 6.33/7.17, primary 7.85/9.68, default 6.87/8.18) |
| 14 | baseline compare (below); default pins in the 3 new specs |
| 15 | 360: `scrollWidth` 360 (all 5 new stories); 200 %: every end `th` scrollWidth = clientWidth |
| 16 | compat 22: "table end column", "loading button" ok |

## Gates

Round 1 (review finding 1 and 2): all gates ran on commit `d927ad0` (later agents skip a gate while `git diff --quiet d927ad0 -- libs tools` holds). Logs: `tmp/021/r1/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 201 suites, 4650 passed, 8 skipped (+3 / +44 against 3.16) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | ok, 122 "Built" lines |
| `npm run test:tools` | 22 pass |
| `npx nx run angular-ui-kit:build-storybook` | ok, 955 stories (+5) |
| Story screenshots | r1: *Number Columns* 360/1280 × L/D `--compare=tmp/story-shots/021/new` → 4/4 identical (`tmp/story-shots/021/r2/`); negatives rgb(107,9,9) light, rgb(247,161,161) dark, inline `color: var(--color-text-error)`. Build round (`af1a232`): `tmp/story-shots/021/build` vs `baseline` (`--full`): button 148/148 identical; list/progress/toast 132/152, diffs = design §10 exactly; table 96/126: §10 + `--with-pagination`, `--with-filtering`, `--full-featured` 1024/1280 (`Math.random()` salaries). New: `tmp/story-shots/021/new/` (5 stories × 360/1280 × L/D) |
| `check-angular-majors.mjs --only=22` | PASS, 82 checks (80 + 2), on `af1a232`; not rerun: `af1a232..d927ad0` changes only a story and an interface JSDoc comment, nothing that renders on the server |

**Changed assertions (reason AC-5):** `button.component.spec` "is aria-disabled, not disabled, when loading" (was "disabled when loading"); `button.styles.spec` and `button.tone.spec` selectors `:hover/:active:not(:disabled, .btn-loading)`, and a comma split that ignores commas inside `:not()`.

## Deviations from the design

- **D1 (resolved in r1):** the designer chose `cellStyle` (design.md §4, §8 corrected); the story's `::ng-deep … !important` block is gone.
- The th default branch gains one Angular comment anchor (no rendered change, pinned).

**Findings outside the scope (exist on main; changes not made):**

- **F1:** a `cellClass` colour never applies (as in D1): *With Cell Formatting and Styling* success/warning/danger cells render rgb(17,24,39).
- **F2:** table pagination: "/ page" is hard-coded English (`table.component.ts:751`); the page-size value sits under the select's clear button (x 1013–1079 vs 1063–1083, also in *With Pagination*); at 200 % text and 360 px the controls row is 546 px wide.
- **F3:** headless Chromium matches `(forced-colors: active)` but forces no palette: Highlight rgba(5,0,73,.8), GrayText rgb(96,0,0), CanvasText black.

## Changelog draft

The sources page in Finance Intelligence (gap file quellen-2026-10-31, rows 1–5): end-aligned number columns, a loading button that keeps focus, progress bars under reduced motion and forced colours, readable list badges, and the toast call documented. No API breaks.

### Added
- **`TableColumn.align: 'start' | 'end'`** (row 1, sources table from 1280 px): `end` aligns header and cells at the end edge with tabular figures ("1.111" and "8.888" both 38.7 px); a sorted end header puts the arrow 8 px before the label, so the label stays flush with the figures. Works with `paginate`, `actions`, `cellClass` and prerendering.
- Stories: Data Display/Table "Number Columns"; Components/Button "Loading Keeps Focus"; Feedback/Progress Bar "Indeterminate Sizes"; Data Display/List "Status Badges"; Feedback/Toast Outlet "Service Call" and a page on `ToastService.show()` (all options, the one outlet, the announcement).

### Changed
- **`lc-button loading`** (row 2, the source card's load button): the button stays focusable with `aria-disabled="true"` and `aria-busy="true"` instead of the native `disabled`; click, Enter and Space are ignored and a form isn't submitted. It looks as before (148 of 148 screenshots identical); the focus ring stays visible (≥ 3.39:1). Announcing the result is the page's job.

### Fixed
- `lc-table actionsAlign`: the "Aktionen" header now ends where the buttons end (Known in 3.16).
- `lc-progress-bar indeterminate` (row 3): under `prefers-reduced-motion` a static striped full bar and a dashed ring; under `forced-colors` Highlight fill, CanvasText outline, GrayText ring track.
- `lc-list` badges (row 5): success 3.53 → 4.85:1 light, 1.87 → 5.17:1 dark; warning 3.23 → 5.52 / 2.07 → 4.61; error dark 1.13 → 7.17 (the `lc-badge` pairs).
- `lc-toast` icons are decorative (`aria-hidden`); the message is the announcement.

### Compatibility
- No API breaks. A test that expects `disabled` on a loading `lc-button` now finds `aria-disabled="true"`; `disabled` itself is still native. Defaults render as in 3.16 (Jest pins the DOM); the screenshot diffs are the 4 table, 1 progress and 4 list stories named above.
- `TableColumn.cellClass`: a colour or font size set by the class loses to the kit's cell rule (as in earlier versions); set them with `cellStyle`. The JSDoc now says so.
- Consumer check (AOT, strictTemplates, prerender) passes on Angular 22.
