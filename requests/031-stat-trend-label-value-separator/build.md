# Build 031: lc-stat-trend label and value without a separator

- **Branch:** `fix/3.22.1-stat-trend-label-value-separator` (from `587c556`, 3.22.0)
- **Commit:** `git log -1` on the branch (`fix(stat-trend): keep a space between label, value and change in the text`)

## Blocker (resolved)

The first build session was rooted in `finance-intelligence/docs/ux/gaps`, so git was refused in this repo and gate logs could not be written to `tmp/031/` (summaries only). A follow-up session created the branch from the unchanged tree and committed `0cf895e` (the five files below plus this folder; `requests/README.md` and `lc-factory-pitch.html` left out).

## Files changed

| File | Change |
|---|---|
| `libs/angular-ui-kit/src/lib/stat-trend/stat-trend.component.html` | S1 `&ngsp;` before the row, S2 before the pill (in `@if (change())`), S3 before `lc-sparkline` (in `@if (hasSparkline())`); comment naming 031. Existing pill comment kept |
| `…/stat-trend/stat-trend.component.spec.ts` | `describe('separators (031)')`: 7 tests |
| `…/stat-trend/stat-trend.axe.spec.ts` | new: card host, 5 rows + negative control |
| `…/stat-trend/stat-trend.stories.ts` | story `InsideAClickableCard` ("Inside a clickable card"), JSDoc + `docs.description.story` with the naming rule and sparkline caveat |
| `tools/compat/check-angular-majors.mjs` | `EXPECT_IN_HTML` entry for the space after the header and before the pill on `#compat-costs` (design §9 regex, `\sclass`) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | unit "separates label and value …": normalised text `Gesamtkosten Plan 2026 571.000,00 €`; `header.nextSibling` = `row.previousSibling` = Text `" "`; "keeps S1 without a label" |
| AC-2 | unit S2 (`… 571.000,00 € ↑ +3,1 %`, `value.nextSibling.data === ' '`), sentiment (`… +3,1 %, gestiegen, ungünstig`), S3 (`… ungünstig Sparkline: `) |
| AC-3 | `stat-trend.axe.spec.ts`: plain, + icon, + change, + sentiment (DE), + sparkline (name from the svg's `aria-label`) all `pass`, no violations; S1+S2 removed → `violation` (only rule). Browser: new story 0 violations, 6 shots (360/1024/1280 × light/dark) |
| AC-4 | `--compare=tmp/story-shots/031/baseline`: 66 identical, 0 different |
| AC-5 | unit "adds text nodes only": element children header, row, `lc-sparkline`; text nodes exactly `" "`; only `svg[role=img]` has a role/tabindex. Browser `innerText` tile 2: `GESAMTKOSTEN PLAN 2026\n571.000,00 €` (as B1). VoiceOver/NVDA note: review |
| AC-6 | compat `EXPECT_IN_HTML` entry (see Gates) |
| AC-7 | new story `--measure`, 360/1024/1280: card and page overflow 0; tile 3 label 36 px (2 lines); costs shots identical to baseline |
| AC-8 | both existing specs unchanged and green (23 tests); unit "renders the default tile as before apart from S1" |
| AC-9 | `--forced-colors --compare=tmp/story-shots/031/baseline-fc`: 2 identical |
| AC-10 | story `charts-stat-trend--inside-a-clickable-card`, 3 tiles EN/DE, `icon="wallet"` |
| AC-11 | changelog draft below |

## Gates

All gates ran on the working tree `587c556` + this diff, which is the libs and tools tree of commit `0cf895e` (committed unchanged; the amend adds only `requests/031-…/build.md`). Later agents skip a gate while `git diff --quiet 0cf895e -- libs tools` holds.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 212 suites, 4906 passed, 8 skipped (4914), run with `--maxWorkers=4` (16 s). With default workers the machine was overloaded (911 s, a worker SIGSEGV; `divider` and `notification-center.icons` failed and pass alone). stat-trend: 3 suites, 36 tests (13 new) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings, none in `stat-trend/` |
| `npx nx run angular-ui-kit:build` | green |
| `npm run test:tools` | 22/22 |
| `npx nx run angular-ui-kit:build-storybook` | green |
| Story screenshots | `tmp/story-shots/031/build` (66 identical), `build-fc` (2 identical), `new/` (6 shots + measure + axe) |
| `node tools/compat/check-angular-majors.mjs --only=22` | PASS, Angular 22.2.4: install, build+prerender, every `EXPECT_IN_HTML` check ok, including "stat-trend: label, value and change separated by a space (WCAG 2.5.3)" |

## Deviations from the design

None. Note for the review: at 360 px tiles 1–2 show the wallet next to the label, not at the card's right edge as the §3 sketch draws; `.lc-stat-trend` is `inline-flex` and shrinks to its content (as in Card Wrapped today). Unchanged by this request.

## Changelog draft

### Fixed

- **`lc-stat-trend` keeps a space between label, value and change in its text** (finance-intelligence cockpit, gap file `cockpit-2026-11-01` row 2): label and value sat in two blocks with no text between them, so tools reading the DOM text got „Gesamtkosten Plan 2026571.000,00 €“. axe-core 4.14 `label-content-name-mismatch` (WCAG 2.5.3 Label in Name) failed every KPI tile built as `lc-card [clickable]="true"` named „Gesamtkosten Plan 2026: 571.000,00 €. Herkunft anzeigen“, because no name could contain the glued text. Now the text reads „Gesamtkosten Plan 2026 571.000,00 € ↑ +3,1 %“ and the tile passes. The spaces get no box: nothing moves, nothing extra is announced (68 story shots hash-identical, 360/1024/1280 px, light, dark and forced colours).
- Naming a clickable tile: its `ariaLabel` holds the visible text in order (label, value, change, then the sparkline's name if there is one); other words („Herkunft anzeigen“, the sentiment words) go before or after that run. A sparkline's generated name („Sparkline: 10 points, …“) counts as content of the card, so a tile with a sparkline repeats it in the name.
- Story: Charts/Stat Trend "Inside a clickable card".

### Compatibility

- No API breaks: no input, class or style changed, and the pill's own text (`"↑ +3.1% "`, `"↑ +3,1 %, gestiegen, ungünstig"`) is as before. The tile's raw `textContent` gains up to three spaces; a test that compares it unnormalised sees them.

### Migration

- finance-intelligence: drop the e2e exclusion of `label-content-name-mismatch` on `fi-kpi-tile`.
