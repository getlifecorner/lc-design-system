# Build 037: lc-card link mode; lc-file-upload rejection code, type check, locale sizes and docs

- **Branch:** `feat/3.24-card-link-file-upload-checks` (from `main` at 780d910, 3.23.1), one commit `feat(card): link mode …`, amended per round
- **Round 2 (review r1 findings 1–4, design C-1 to C-3):** forced-colours ring `Highlight`; lift rule in `:where()`; `accept` JSDoc `*/*` + RFC 9110 token check; changelog lines. Finding 5 stays for a follow-up.

## Files changed

| File | Change |
|---|---|
| `card/card.component.ts` | inputs `href`, `route`, `queryParams` (type-only `Params`); `linkMode` (`href` wins, `''`/`null` route = none, `dashed` never); `isClickable` false on a link card; `cardAriaLabel` (label moves to the anchor); dev-mode warnings (href + route; no title and no `ariaLabel`); imports `NgTemplateOutlet`, `RouterLink`; JSDoc §2 |
| `card/card.component.html` | bare anchor (title-less); link branch with the 5 headings around `ng-template #cardLink` (`href` anchor or `RouterLink` anchor); the 3.23.1 `@switch` untouched in the `@else` |
| `card/card.component.scss` | `.card-clickable, .card-linked` grouped (cursor, hover, active, same place); focus-ring mixin on `.card-clickable` only; `.card-linked` `isolation` + `:has(.card__link:focus-visible)` ring, `Highlight` in forced colours (r2, C-1); `.card__link` + `::after` overlay; `.card__title` `hyphens: auto; hyphenate-limit-chars: 12 4 3`; `::ng-deep :where(…)` lift of projected controls (z 2, (0,1,0); r2, C-2) |
| `card/card.link.spec.ts` (new, 35 tests) | AC-1/2/3/5/11 + compiled-CSS contract; r2: forced `Highlight` pinned, lift assertion now expects the `:where()` selector (C-2: the old (0,4,1) overrode a control's own `position: absolute`) |
| `card/card.stories.ts` | argTypes `href`, `route`, `queryParams` (+ `clickable` text/default); "Link mode (3.24)" bullet; stories *Link Cards*, *Link Cards (German, router)*, *Link and Clickable* |
| `file-upload/file-upload.component.ts` | types `FileUploadRejectionCode`, `FileUploadRejection`; input `locale`; `acceptTokens` + `rejectionOf` (type, then size) for drop and pick; `sizeFormats` (`Intl.NumberFormat` in `try`, else `toFixed`); JSDoc of class, `accept`, `multiple`, `fileRejected`; r2 (C-3): MIME tokens are RFC 9110 `tchar` only, `accept` JSDoc names `*/*` and the ignored parameterised types |
| `file-upload/file-upload.checks.spec.ts` (new, 36 tests) | AC-6 to AC-11, AC-13; r2: 4 cases for `text/csv;charset=utf-8` (alone = every type; beside `.csv` = ignored) |
| `file-upload/file-upload.stories.ts` | component text (checks, `fileRejected`, one-file rules); argTypes with text + default, `locale`; `render` + description on Default, With Restrictions, Disabled, Single File; stories *Type Rejected On Drop*, *Size Rejected*, *German Locale* (`play` drops files) |
| `src/docs/internationalization.mdx` | Locales table: `lc-file-upload` `locale` row |
| `tools/compat/template/src/app/home.html`, `check-angular-majors.mjs` | a `route` + `queryParams` card (h2) and an `href` card; `EXPECT_IN_HTML` `link card route`, `link card href` |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | `card.link.spec` AC-1 block: `h3.card__title > a.card__link[href]`; route + queryParams → `/quellen/usm?ansicht=laeufe`, array route; href wins (+ warning); `''`/`null`/none → no anchor |
| AC-2 | spec: axe `getRole`/`accessibleText` heading "SAP-Ist" (h2) + link "SAP-Ist"; `.card` article, no tabindex/aria-label; `ariaLabel` on the anchor; h2–h6; bare anchor; axe audit no violations. Story 360: role article, h2 holds the anchor (measure) |
| AC-3 | spec: href click/Enter/Space → `cardClick` 0, not prevented; route plain click → `navigateByUrl` 1× (`/quellen/usm?ansicht=laeufe`), prevented; Ctrl, Cmd, Shift, button 1 → 0×, not prevented. Story: centre + 2 corners = anchor on every outlined card (18 runs) |
| AC-4 | *Link and Clickable* 360/1024/1280 L/D: border, box-shadow, background, cursor equal per row; focus outline `solid 2px 2px` rgb(32,132,151) L / rgb(132,199,212) D on both; hover/active rules list both classes (CSSOM). `--forced-colors` (r2): all 4 cards `solid 2px 2px rgba(5,0,73,.8)` (emulated `Highlight`; r1 link cards rgb(0,0,0)), title LinkText rgb(0,0,159); spec pins the media rule |
| AC-5 | anchor `text-decoration-line: none`, colour = title colour (rgb 17,24,39 L); link cards 107.4 to 222.1 px high; `--axe` on the 3 card stories at 360/1280 L/D: 0 violations (12 shots); spec: dashed + href/route → no anchor |
| AC-6 to AC-10 | `file-upload.checks.spec` (blocks named by AC); story measure: type → "liste.xlsx is not a CSV file.", size → "ist.csv is larger than 20.0 MB.", DE → "Höchstens: 20,0 MB", list "9,6 KB", zone name ends "Höchstens: 20,0 MB" |
| AC-11 | existing specs unmodified and green; spec pins the default card DOM; 3.23.1 template rendered side by side (temp spec, removed) over 86 input combinations ×3 (none / empty link inputs / `route: null`): identical; 174 baseline shots identical |
| AC-12 | 6 new stories × 360/1024/1280 × L/D: `tmp/story-shots/037/build` (36). DE title lines 2/2/1, right 290.8 ≤ 327 (360), 962.8 ≤ 991 (1024); page `scrollWidth` = width everywhere |
| AC-13 | JSDoc `multiple`, `accept`, `fileRejected`, class; meta text; *Single File* story text; spec AC-13 block (replace; size and type clear) |
| AC-14 | cause as design §1 (stories had only args). `extractStoryData` on the stories file (temp tool test, removed): all 7 File Upload stories and the 3 card stories have snippet + description; extractor unchanged |
| AC-15 | compat 22: `ok link card route`, `ok link card href`; server HTML `<h2 class="card__title"><!----><a class="card__link" href="/quellen/usm?ansicht=laeufe">Quelle</a>` |
| AC-16 | changelog draft below |

## Gates

Round 2 gates ran on commit `c9dbdbfca4fdbe2b952e13acfcbef7fb8147b964` (the code amend, kept in the object store; the final amend adds only request documents). Later agents skip a gate while `git diff --quiet c9dbdbf -- libs tools` holds. Round 1 ran on 4fff99e (test:tools, compat, the 174-shot compare).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` (`--runInBand`; `--maxWorkers=4` and `=2` each lost suites to a worker SIGSEGV) | 217 suites, 5114 passed, 8 skipped (r2 +5: card 1, file-upload 4), 59 s; log `tmp/037/r2-test.log` |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | 122 "Built" lines; fesm holds `:where(.card-linked …)` and the forced `Highlight` rule |
| `npm run test:tools` | r1: 22 / 22 (`tools/` unchanged in r2) |
| `npx nx run angular-ui-kit:build-storybook` | 993 stories (rebuilt for r2) |
| Story screenshots r2 | `tmp/story-shots/037/r2-cards` (3 card stories × 360/1024/1280 × L/D, `--axe`, `m.mjs`): 0 violations / 18; rings rgb(32,132,151) L / rgb(132,199,212) D on every card; vs r1 `build`: 16 identical, 2 differ (*Link and Clickable* 360 D + 1280 D, 5 and 2 px: the measure's focus/blur; re-shot without measure `r2-plain`: 2 / 2 identical). `r2-forced` (360 L, `--forced-colors`): 4 / 4 rings rgba(5,0,73,.8). `r2-lift` (`tmp/037/measure/lift.mjs`): plain button relative/2, own (0,2,0) absolute button absolute/2, both hit themselves; scoped rule `[_nghost-…] :where(.card-linked …)`. The 174-shot baseline needs no rerun: both rules match only under `.card-linked` |
| `check-angular-majors.mjs --only=22` | r1: PASS, 91 checks; not rerun: r2 changes only CSS under `.card-linked`, which no `EXPECT_IN_HTML` check reads |

## Deviations from the design

| # | What | Why |
|---|---|---|
| D-1 | `accept` token `*/*` matches every file (the contract's `type/*` rule would reject every file for it) | `*/*` was harmless before 3.24 (no type check); the picker also accepts everything for it. Agreed in review r1 (design C-3); pinned in the checks spec |
| D-2 | Content choices the design left open: *Link Cards* EN subtitles "USU Service Management", "Allocation keys from SAP CO"; dl `margin-top: var(--spacing-3)`; *Link and Clickable* body "Opens the details." on all four | the design named only titles and parts |
| D-3 | The existing File Upload argTypes and card `clickable` got description + `table.defaultValue` | house convention; no arg values, shots identical |
| D-4 | `accept` JSDoc writes `*\/*` (review: "`*/*` accepts every type"), so the MCP shows the backslash | a literal `*/` ends the JSDoc comment; the manifest also re-emits descriptions inside `/** … */` (`extract-props.mjs` l. 274). Needs the designer's agreement |

Notes: the 3 px corner probe on the elevated, selected link card hits the card or host, not the anchor: `overflow: hidden` + radius 12 clips there, as for `clickable`. Pre-existing, out of scope: axe `nested-interactive` on `.file-upload` (role=button zone holding the file input) in every File Upload story, 3.23.1 *Default* and *With Restrictions* too.

## Changelog draft

`lc-card` gets a link mode, and `lc-file-upload` rejects with a code, checks `accept` on drop and writes sizes in the page's locale (finance-intelligence, sources page „Quellen“, rows 1–3). No API breaks.

### Added
- **`lc-card` link mode** (quellen row 1): `href` (plain URL) or `route` + `queryParams` (Angular router) make the whole card a real link: click, Enter, middle click, Ctrl/Cmd+click, "open in new tab", "copy link". The title is an `<a>` inside its `h2`–`h6`, so screen readers list the heading and the link (name: the title, or `ariaLabel`); the card is no longer `role="button"`. Look, hover, press, `selected` and focus ring (2 px `--color-primary-500`, 4.37:1 light, 9.95:1 dark; `Highlight` in forced colours) are those of `clickable`; `cardClick` is not emitted (one navigation). Projected links and buttons stay clickable; the link is in the prerendered HTML.
- **`lc-file-upload` `fileRejected.code`** `'type' | 'size'` (`FileUploadRejectionCode`, payload `FileUploadRejection`, quellen row 2a): translate from `code`; `reason` keeps its English text.
- **`lc-file-upload` `locale`** (quellen row 2c): `de-DE` writes „Höchstens: 20,0 MB“, „9,6 KB“, „1.023,9 KB“ in the max line, the zone's name and the list. Empty keeps „20.0 MB“; an invalid locale falls back.
- Stories: Card *Link Cards*, *Link Cards (German, router)*, *Link and Clickable*; File Upload *Type Rejected On Drop*, *Size Rejected*, *German Locale*. The four older File Upload stories carry code and text, so the MCP returns them; the one-file behaviour is documented (quellen row 3).

### Fixed
- **`lc-file-upload` checks `accept` for dropped files** (quellen row 2b): before, only the picker applied it, so a dropped `liste.xlsx` on `accept=".csv"` was selected. Dropped and picked files are checked alike (extensions, MIME types, `type/*`, case-insensitive; `*/*` accepts every type, and a MIME type with parameters such as `text/csv;charset=utf-8` is ignored, as by the picker): type first, then size, one `fileRejected` per file.
- **`lc-card` long titles** hyphenate in the page's `lang` (words of 12+ characters): „Leistungsverrechnungsschlüssel“ ran 17 px past the card at 360 px, now 2 lines inside it. Other titles unchanged (174 story shots identical).

### Compatibility
- No API breaks: new inputs are optional and the default DOM is unchanged; `FileUploadRejection` stays assignable to `{ file; reason }`. The `card` entry imports `RouterLink`, created only with `route` (no router provider needed otherwise; `@angular/router` was already a peer).
- With a MIME-only `accept`, a file whose system type differs (a CSV as `application/vnd.ms-excel` on Windows) is now rejected: list the extension too (`.csv,text/csv`). A dropped file of another type now emits `fileRejected` and, with `multiple=false`, clears the selection.
- Card titles use `hyphens: auto`; Safari ignores `hyphenate-limit-chars`, so a wrapping title there can also hyphenate words under 12 characters (as lc-accordion and lc-toast titles).

### Migration
- Overview cards: replace `[clickable]` + `(cardClick)` navigation with `route` (+ `queryParams`) or `href`, and shorten `ariaLabel` (it now names the link and the heading).
