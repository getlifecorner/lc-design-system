# Review 021: Sources page kit gaps

## Round 1 — 2026-10-31, commit c284254 (libs/tools = gate commit af1a232)

Screenshots: `tmp/story-shots/021/r1` (5 new stories, 360 · 1024 · 1280, light · dark, with measures), `r1-table` (21 table stories `--full --compare=baseline` on the current build, because `table.stories.ts` changed after the developer's shots), `r1-changed`, `r1-zoom` (200 %), `r1-pag`; the developer's `build` folder (button, list, progress, toast; `diff -rq` against `baseline`) and `forced`.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | *Number Columns*, label text right = cell text right in every end column: 360 268.52 / 381.67 / 725.45, 1024 319.16 / 453.66 / 862.30, 1280 401.55 / 570.77 / 1084.86 (both themes); sorted asc and desc equal too. `table.align.spec.ts` |
| AC-2 | pass | `th`/`td` `tabular-nums`; "1.111" = "8.888" = 38.69 px, "1.111,11 €" = "8.888,88 €" = 72.48 px |
| AC-3 | pass | Sorted "Betrag": arrow 10.22 px wide, 8 px before the label, centred (0 px), label flush. `th` box at rest = desc (113.16 / 134.50 / 169.22); asc is narrower only because page 1 then holds smaller amounts. `paginate` and `actions` in the story; `cellClass` by unit test. See finding 1 |
| N1 | pass | "Aktionen" text right = last button right: *Number Columns* 834.53 / 992 / 1248, *With Icon Only Actions* 473.88 / 992 / 1248, *Clickable Rows*, *Hidden Caption* 776.47 / 992 / 1248 |
| AC-4 | pass | No `lc-table-story__cell--numeric`/`--end` left (grep). *With Cell Formatting and Styling* ARR/SLA flush (360 222.61 / 414.03, 1280 670.98 / 1248); *Clickable Rows*, *Hidden Caption* "Betrag" = visible `lc-money` span right (575.41 at 360, 946.23 at 1280) |
| AC-5 | pass | *Loading Keeps Focus*: no `disabled`, `aria-disabled`/`aria-busy` "true", tabIndex 0; after `focus()` and a click, `activeElement` is still the button. `button.loading.spec.ts` |
| AC-6 | pass | Click event `defaultPrevented`, host `(click)` count 0; Enter, Space, submit, reset by unit tests |
| AC-7 | pass | 148/148 button shots identical to baseline (`diff -rq`). Focused: 2 px, offset 2, rgb(17,24,39) at 0.5 = **3.39:1** light, rgb(241,246,248) = **4.85:1** dark (design ≥ 3.36 / 4.45). Title "Wird gerade geladen" |
| AC-8 | pass | `loading`/`disabled` JSDoc = design §2; argTypes with defaults; *Loading* and *Loading Keeps Focus* descriptions |
| AC-9 | pass | *Indeterminate Sizes*, *Indeterminate*: `animationName` none; fill = track (328 at 360, 400 in the 400 px story, 1248 at 1280); circles `10.472px, 10.472px`, offset 0, butt |
| AC-10 | pass | `forced/` shots: track outline 1 px CanvasText, fill Highlight, circle track GrayText; *Sizes* 360 dark forced: four bars and "60%" visible. Headless palette limit: build.md F3 |
| AC-11 | pass | Class doc and `indeterminate` JSDoc = §2; `aria-valuenow` absent on all 9 bars; role specs unchanged |
| AC-12 | pass | Minimum over both list variants: success 4.85 L / 5.17 D, warning 5.52 / 4.61, error 6.33 / 7.17, primary 7.85 / 9.68, default 6.87 / 8.18 (= §5); `theme-contrast.spec.ts` |
| AC-13 | pass | Doc checked against `toast.service.ts` (defaults, `MAX_TOASTS` 5 + `slice(1)`, browser-only timers), the outlet template (2 regions per position, `aria-atomic="false"`) and `toast.component.ts` (`announce` → role, action runs, then closes). *Service Call*: 12 regions before any toast; error in `assertive`, success and info in `polite`; icons `aria-hidden`; close "Benachrichtigung schließen"; focus stays on `body` |
| AC-14 | pass | Diffs = §10 exactly: table 30/126 on the current build (§10 + `--with-pagination`, `--with-filtering`, `--full-featured` 1024/1280, which also differ between two runs: `Math.random()` salaries); list/progress/toast as §10 |
| AC-15 | pass | `scrollWidth` = viewport for all 5 new stories at 360/1024/1280. 200 %: no `th` clips (scrollWidth = clientWidth). The page is 546 px at 200 %/360 because of the pagination row (F2, on main) |
| AC-16 | pass | compat 22 (build.md); `EXPECT_IN_HTML` lines 324 and 327 |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix | *Number Columns* story (D1) | Colour negative changes with `cellStyle: (v) => (Number(v ?? 0) < 0 ? { color: 'var(--color-text-error)' } : {})`, with no `<style>` block, and say `cellStyle` in the description. Then the colour is rgb(107,9,9) light (12.59:1) and rgb(247,161,161) dark (8.69:1), and the 4 rest shots are hash-identical to `tmp/story-shots/021/new/data-display-table--number-columns--*` | `::ng-deep .lc-table-story__cell--negative { … !important }`. A kit story would teach an override; the requester wants "no kit class overridden". My design §8 asked for `cellClass`, which can't colour a cell (F1), so I corrected design.md |
| 2 | should-fix | `TableColumn.cellClass` JSDoc, changelog draft | JSDoc adds: "A class colour or font size loses to the kit's cell rule; set them with `cellStyle`." The changelog gets a Compatibility line saying the same | Neither mentions it. The MCP shows the JSDoc to consumers |
| 3 | nit | *Status Badges*, light | The error badge now reads heavier than success and warning: it keeps the 100 fill #f7a1a1 while they moved to the pale subtle fills. This is intended (design §1, no new look for a pair that passes). No action in 021 | — |

### D1 and F1–F3

- **D1:** switch to `cellStyle` (finding 1). `!important` isn't kept.
- **F1, F2 → one follow-up request after 3.17** (spec-writer). They exist on main, are outside rows 1–5, and need an API (a page-size label) plus look changes in other stories:
  - F1: `cellClass` colour and font size never apply (the `td` rule is (0,5,3)). *With Cell Formatting and Styling* renders rgb(17,24,39).
  - F2: pagination. "/ page" is hard-coded (`table.component.ts:751`). The inner select is clearable, with an English "Clear selection": its 20×20 × (x 1063–1083) sits over "5 / page" (x 1020–1079) at 1280. Prev/next are 28×28 (< 44). At 200 % and 360 the page is 546 px wide. All of this shows in the German *Number Columns* story.
  - Also for that request: toast close 28×28 and action 94×29 (< 44 px, *Service Call*).
- **F3:** tooling note only.

**Verdict:** changes requested (finding 1; finding 2 in the same round)

## Round 2 — 2026-10-31, commit 61e6a9e (libs/tools = gate commit d927ad0, `git diff --quiet` holds)

Screenshots: the developer's `r2` (4 shots, `cmp` = `new`, 4/4 byte-identical) and `r2-review` (360 · 1024 · 1280, light · dark, `--compare=new`, with a measure). Gates not re-run (build.md, d927ad0).

| # | Result | Evidence |
|---|---|---|
| 1 | fixed | `table.stories.ts:946`: `cellStyle: (v) => Number(v ?? 0) < 0 ? { color: 'var(--color-text-error)' } : {}`; the `<style>`/`::ng-deep … !important` block is gone, and no stylesheet rule names `cell--negative` (measure). `r2-review`: 360 and 1280 light/dark `identical` to `new`. 1024 has no at-rest reference (the `new` folder has only 360/1280, and the `r1` shots were taken after my sort measure); measured instead, and 1024 light opened: 2 negative cells per page, inline `color: var(--color-text-error)`, rgb(107,9,9) **12.59:1** light, rgb(247,161,161) **8.69:1** dark (= round 1 expectation), `scrollWidth` = viewport at all 3 widths. The description names `cellStyle` and says that a class colour loses |
| 2 | fixed | `TableColumn.cellClass` JSDoc (`table.component.ts:48–52`) has the sentence word for word. build.md changelog draft, Compatibility: "`TableColumn.cellClass`: a colour or font size set by the class loses to the kit's cell rule (as in earlier versions); set them with `cellStyle`. The JSDoc now says so." |
| 3 | open (nit) | As in round 1, no action in 021 |

AC-1…16 and N1 stay as in round 1: the round 2 diff (`c284254..61e6a9e -- libs tools`) touches only the *Number Columns* story and one interface JSDoc comment. design.md has its change note (§4, §8).

**For the release-manager:** list nit 3 and the follow-up request after 3.17 (F1 `cellClass` colour and font size, F2 pagination "/ page" text, the clear × over the value, 28 px prev/next, 546 px at 200 %, toast close and action targets < 44 px) as open items.

**Verdict:** approved
