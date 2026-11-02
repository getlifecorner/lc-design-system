# Review 037: lc-card link mode; lc-file-upload rejection code, type check, locale sizes and docs

## Round 1 — 2026-11-02, commit c4097ca (code = 4fff99e, gates in build.md)

Screenshots: mine in `tmp/story-shots/037/` — `r1-cards` (3 card stories, 360/1024/1280 L/D, `--axe`, card 2 focused for the shot), `r1-upload` (3 new File Upload stories, end state after `play`, `--axe`), `r1-forced` (*Link and Clickable* 360 L, forced colours), prototypes `r1-forced-proto`, `r1-lift`. Measures: `r1-card-measure.js`, `r1-upload-measure.js` (logs `r1-*.log`). The developer's `cmp` folder re-checked with `diff -rq`. 10 shots opened.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `r1-cards.log`: every link card is `h2.card__title > a.card__link[href]` (`#/sources/usm` …); router story `#/datenbasis/quellen/sap-ist?ansicht=laeufe`; clickable cards have no anchor; unit spec per build.md |
| AC-2 | pass | axe 4.14 `getRole`/`accessibleText`, all 18 shots: heading + link with the same name ("Actuals", "SAP-Ist", "Leistungsverrechnungsschlüssel"); `.card` `role=article`, no `tabindex`, no `aria-label` |
| AC-3 | pass | `elementFromPoint` at up to 7 points per card (centre, 4 inner corners at 14 px, badge, list row) = the anchor on all 8 link cards (3 + 3 + 2) in all 18 shots; clickable cards → the card. Projected `button`/`a` in a link card hit themselves, plain text hits the anchor (`r1-lift`). Modifier/middle clicks and router: unit spec |
| AC-4 | pass in both themes, **fail in forced colours** | rest per row equal at 360/1024/1280 L/D (border, box-shadow, background + gradient, cursor, radius 12, transform, user-select); focus `solid 2px 2px` rgb(32,132,151) 4.37 L / rgb(132,199,212) 9.95 D on all 4 cards; `:hover`/`:active` rules list both classes. Forced colours: finding 1 |
| AC-5 | pass | title 17.74 L / 15.85 D (outlined), 15.25 / 13.20 (selected); `text-decoration-line: none`; cards 107.4–222.1 px high; axe 0 violations in 18 shots (`color-contrast` incomplete ×4 on the elevated gradient, clickable cards included) |
| AC-6 | pass | *Size Rejected* status "ist.csv is larger than 20.0 MB.", list empty; unit spec |
| AC-7 | pass | *Type Rejected On Drop* status "liste.xlsx is not a CSV file.", list empty; MIME/wildcard/case cases in the unit spec |
| AC-8 | pass | unit spec (one rejection, type first; empty `accept` = every type) |
| AC-9 | pass | *German Locale* 360/1024/1280: lines "Erlaubt: .csv", "Höchstens: 20,0 MB"; list "ist.csv 9,6 KB"; zone name ends "Höchstens: 20,0 MB" |
| AC-10 | pass | unit spec |
| AC-11 | pass | `diff -rq baseline cmp`: 174/174 identical (this build) |
| AC-12 | pass | DE title 2/2/1 lines, right 290.8 ≤ 327 (360), 962.8 ≤ 991 (1024), 1203.8 ≤ 1247 (1280), hyphen seen at 360 L and 1024 D; rows equal height (184.1 / 222.1); page scroll 0; DE hint 2 lines at 360 inside the zone; every visible string German in the DE stories; status 12.59 L / 9.48 D |
| AC-13 | pass | JSDoc `multiple`, `accept`, `fileRejected`, class; meta text; *Single File* text |
| AC-14 | pass | the 4 stories have a `render` template and a story description; `extract-story-data.mjs` reads `template:` inside render functions (l. 158–179); developer's temp extractor test (build.md) |
| AC-15 | pass | compat 22 `ok link card route`, `ok link card href` (build.md) |
| AC-16 | pass with changes | finding 3 |

**API vs §2:** names, types, defaults and JSDoc match (`href`, `route`, `queryParams` with type-only `Params`, `locale`, `FileUploadRejection(Code)` exported through `export *`); new argTypes have `description` and `table.defaultValue`; story IDs as §8. **Deviations:** D-1 agreed (`*/*` = every type; design C-3), D-2 and D-3 accepted.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix | `card.component.scss`, *Link and Clickable* 360 L, `--forced-colors` | link card ring = clickable's: rgba(5,0,73,.8) (emulated `Highlight`); design C-1: `@media (forced-colors: active) { outline-color: Highlight; }` inside `&:has(.card__link:focus-visible)`, pinned in `card.link.spec` | link rgb(0,0,0) (CanvasText, the border's colour: a double black line), clickable rgba(5,0,73,.8). Prototype with the rule: rgba(5,0,73,.8). My §4 left this to the browser |
| 2 | should-fix | `card.component.scss` lift rule | `:host ::ng-deep :where(.card-linked :is(a[href], button, input, select, textarea, summary, [tabindex]):not(.card__link))` (0,1,0), design C-2; update the selector assertion in `card.link.spec` (l. 372) with that reason | (0,4,1) overrides a projected control's own `position: absolute` (prototype: a (0,2,0) absolute button became `relative`; kit cases: password toggle, checkbox/radio native inputs lose `clip`). With `:where()`: plain button relative/2, absolute button stays absolute/2, both hit themselves |
| 3 | should-fix | changelog draft | Added: ring "… `Highlight` in forced colours, as `clickable`"; Compatibility: "Card titles use `hyphens: auto`; Safari ignores `hyphenate-limit-chars`, so a wrapping title there can also hyphenate words under 12 characters (as lc-accordion and lc-toast titles)." | neither stated |
| 4 | nit | `file-upload.component.ts` `accept` | JSDoc: "`*/*` accepts every type"; `isAcceptToken`: type and subtype are RFC 9110 `tchar` only, so `text/csv;charset=utf-8` is ignored as Chromium's picker ignores it (design C-3), plus a unit test | `*/*` undocumented; a parameterised token counts as MIME and rejects every file |
| 5 | nit (pre-existing, follow-up) | every File Upload story, 3.23.1 too | no axe violation | `nested-interactive` on `.file-upload` (role=button holding the native input, `tabindex=-1`). Out of 037's scope: a follow-up request |

**Verdict:** changes requested (finding 1). Do 2–4 in the same round; 5 stays for a follow-up. Round 2 re-checks `r1-forced` and the 3 card stories by hash (only the forced ring should change).

## Round 2 — 2026-11-02, commit 608ea40 (code = c9dbdbf: `git diff --quiet c9dbdbf -- libs tools` holds)

Screenshots in `tmp/story-shots/037/`: `r2-review-cards` (3 card stories, 360/1024/1280 L/D, the r1 measure unchanged, `--axe`, `--compare=r1-cards`), `r2-review-forced` (*Link and Clickable* 360 L/D, `--forced-colors`, `r2-review-forced-measure.js`: rings, served rules, injected-control lift probe). 1 shot opened.

| AC | Result | Evidence |
|---|---|---|
| AC-1, 2, 3, 5, 12 | pass (as r1) | 18 / 18 shots identical to `r1-cards` by hash, 18 / 18 measure lines identical (names, roles, 7-point hits, title contrast, rings 4.37 L / 9.95 D, DE line counts); axe 0 violations in 18 |
| AC-4 | **pass** (r1: fail in forced colours) | forced colours, 4 / 4 cards `solid 2px 2px` `Highlight`: rgba(5,0,73,.8) L, rgba(0,230,255,.8) D; borders CanvasText; link titles LinkText rgb(0,0,159) L / rgb(255,255,0) D. 360 L shot: the focused link card's ring is the Highlight line outside the black border (r1: black on black) |
| AC-6–11, 13–15 | pass (as r1) | r2 touched only the forced rule, the lift selector and the `accept` token filter; the filter's cases are in `file-upload.checks.spec` l. 135–140, `.csv` stories unaffected |
| AC-16 | pass | changelog draft (finding 3) |

### Round 1 findings

| # | Result | Evidence |
|---|---|---|
| 1 | fixed | served rule `@media (forced-colors: active) .card-linked[_ngcontent-…]:has(.card__link:focus-visible) { outline-color: highlight }`; values above; pinned in `card.link.spec` l. 362 |
| 2 | fixed | served selector `[_nghost-…] :where(.card-linked :is(a[href], button, input, select, textarea, summary, [tabindex]):not(.card__link))` = (0,1,0); injected plain button `relative/2`, hit itself; button with a (0,2,0) `position: absolute` rule stays `absolute/2`, hit itself (L and D); spec l. 378 states the reason |
| 3 | fixed | build.md Added: "`Highlight` in forced colours"; Compatibility: the Safari `hyphenate-limit-chars` line, as asked |
| 4 | fixed | `MIME_PART` = RFC 9110 `tchar`; `text/csv;charset=utf-8` ignored (alone = every type, beside `.csv` = `.csv` only), `*/*` = every type; JSDoc l. 102–108 |
| 5 | open | pre-existing `nested-interactive` on `.file-upload`: a follow-up request |

**D-4 (`*\/*` in the `accept` JSDoc): approved.** A block comment can't contain `*/`. `*\/` is the usual JSDoc escape, and the manifest re-emits each description inside `/** … */` (`extract-props.mjs` l. 274), so the backslash keeps that block valid. Writing it any other way would need a tools change for a single occurrence. If a consumer copies `*\/*` literally, the result is the same: it isn't an RFC 9110 token, so both the kit and the browser's picker ignore it, and an `accept` holding only that accepts every type, as `*/*` does. The Storybook `accept` argType doesn't mention `*/*`, so it needs no escape.

**Verdict:** approved. There are no new findings, and finding 5 stays open as a follow-up request.
