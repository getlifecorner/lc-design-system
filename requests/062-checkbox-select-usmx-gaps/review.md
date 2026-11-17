# Review 062: checkbox/chip contrast, select option groups, first USM X gaps

## Round 1 — 2026-11-17, commit 9c4cc98 (libs/tools = 924479a)

Screenshots: `tmp/story-shots/062/` — developer `new/` (360 · 1280), `cmp/` + `cmp2/` (1032 shots vs `baseline/`); review runs `r1-cb`, `r1-select`, `r1-misc` (360 · 1024 · 1280, light · dark, `--axe`), `r1-chip`, `r1-fc` + `r1-fc-proto` (`--forced-colors`), `r1-noise`; measures saved as `r1-*-measure.js`. Storybook build 08:33/09:45; no non-spec source is newer than 08:33, so `cmp`/`cmp2` (from 08:34) were reused via `diff -rq`, not re-shot.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | *Read-only and Disabled* 360/1024/1280: disabled checked + indeterminate check vs fill 3.63 L / 4.84 D (box .75, text .5); disabled unchecked unchanged (1.21 L, as 3.41) |
| AC-2 | pass | rest border 4.83 L / 7.31 D, error 8.39 L / 9.48 D (`r1-cb.log`); hover/checked/focus rules unchanged (scss) |
| AC-3 | pass | readonly: click on input, label and text → state unchanged, 0 `change` events, indeterminate kept; `aria-readonly="true"`, tabIndex 0, cursor default, focus ring 2 px (FC run); check 16.98 L / 16.6 D, border vs box 4.63 / 7.02; group flag + item readonly in *Read-only (DE)*; axe 0 violations (24 shots) |
| AC-4 | pass | *Sizes with Help Text*: help/error x 24/26/28/32 = text x, all widths |
| AC-5 | pass | lg label 44; xs/sm/md 23/23/26 |
| AC-6 | pass | `:hover`→class clone with the hook pair: hover fill = `--color-surface` on all 9 bands and outside a hero; text 9.55 (sRGB) / 9.85 (linear) L, 11.81 / 11.11 D (`r1-chip.log`) |
| AC-7 | pass | *On Hero Bands* 1280: clickable sm chip 14 px in an 18 px parent (was 18); 360 parent 14 px → no change (why only 1280 differs) |
| AC-8 | pass | 3 groups, `role=group`, `aria-labelledby` = header id, header `role=presentation`; search „stadt" → 2 groups, Kundenart hidden |
| AC-9 | pass | 8 options only (headers never options); highlight never hidden at 360/1024/1280; header 5.84 L / 6.71 D; panel `lang="de"`, no overflow; axe 0 violations (incomplete `aria-valid-attr-value` as on *Panel Language*, colour-contrast on the gradient measured instead) |
| AC-10 | pass | opened listboxes vs `baseline-open`: default, disabled-options, filled identical incl. comments; searchable identical without comments (+2 anchors, as designed); with-groups changed |
| AC-11 | pass | *Base Path* (`'tabler-icons/'`): 4 fetches `/tabler-icons/outline/{rocket,flask,plant-2,compass}.svg`, all drawn |
| AC-12 | pass | unit `icon.base-path.spec`; icon baselines identical except inline-set/icon-constants (new tiles) |
| AC-13 | pass, see F-2 | number-input stories: decrement `d="M19.5 12h-15"`, no `.svg` request; generator not run (Deviation 1) |
| AC-14 | pass | attributes only on the inner `<button>`; `false` → `"false"`; unset → absent |
| AC-15 | pass | story after play: pressed true → click → false; „Spalten" expanded + controls → panel; `lc-menu` trigger keeps `aria-haspopup=menu`, expanded false/true, controls → `role=menu` while open |
| AC-16 | pass | 6 fields: `aria-invalid="true"` (6 digits on verification), no `aria-describedby`, no message, border 8.39 L / 9.48 D; summary links resolve to both inputs |
| AC-17 | pass | design D-8 list implemented 1:1 |
| AC-18 | pass | wrapper + host hooks win on all 6 variants (bg/fg/border = hook values, text 10.16 L / 10.64 D); 41 badge stories identical |
| AC-19 | pass | host 16 × 16 inline-flex, middle; text line 21, row 44 and slot 40 centred (0 px), tab row −1; arc 6.21 L / 11.78 D; `role=status`, polite, „Wird geladen"; FC arc CanvasText vs GrayText track |
| AC-20 | pass | JSDoc `@default` on every new input; argTypes with description + `table.defaultValue` (button 4, checkbox, group, 6 fields, spinner `xs` option) |
| AC-21 | pass | no new built-in text |
| AC-22 | **fail** | F-1: forced colours hide the check and the dot |
| AC-23 | pass | changed assertions listed with reasons in build.md |
| AC-24 | pass | 4 `EXPECT_IN_HTML` rows; compat ran on 22 only (CI runs 21 + 22 on `main`) |
| AC-25 | pass | draft names every ID with values; add F-1 when fixed |
| AC-26 | pass | no 3.36/3.62 numbers or `.85` opacity clauses left in button scss/stories (only `filter: brightness(0.85)` hover, unrelated) |

**At-rest compare:** 169 differing shots = design §9 plus chip *On Hero Bands*/*On Light Hero* 1280 (AC-7, explained). Noise, re-shot in `r1-noise` (12 shots): the set of differing shots changes between runs for *Focus After Tap* (dev 360 L; r1 360 L + 1280 D) and *Custom Hint* (dev 360 L+D; r1 360 D). Sidenav *Themed Rail Badges* 360 is byte-identical across 3 post-change runs, but its ≤ 5 px (Δ ≤ 36) sit on the active nav item's rounded corner (x 34–37, y 165/208; `r1-probe-sidenav.log`), with no 062 selector there, and 1280 flips: raster noise (sidenav is on the known noise list).

### Deviations (build.md)

| # | Ruling |
|---|---|
| 1 | Accepted for review; still to be closed by a real generator run (F-2). |
| 2 | Accepted. My §3 value came from a prototype that used a different label; Chromium breaks at the space before it hyphenates. design.md §3 corrected (66 px, 3 lines at 360; 30 from 1024). |
| 3 | Accepted (3 × 3 grid does not fit 328 px). Added strings recorded in design.md §7. |
| 4 | Accepted: D-6 was written for all lists; flat panels keep their DOM (AC-10 by hash). |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F-1 | must-fix | `checkbox.component.scss`, `radio.component.scss`; *Read-only and Disabled* + radio stories, `--forced-colors`, 360 L/D | AC-22 / design §6 (corrected): every visible check and dot is `CanvasText` (`GrayText` when disabled) in forced colours, in both page themes, readonly included | light FC: check `rgb(255,255,255)` on a `rgb(255,255,255)` box: „an"/„teilweise" read as unchecked, editable **and** disabled (AC-1's state) — shot `r1-fc/…readonly-and-disabled--360-light.png`. Radio dot forced to `Canvas` on a `Canvas` circle in light **and** dark. Pre-existing since 3.x, but in this request's components. Rule: design.md §6; prototype `r1-fc-proto` (check/dot CanvasText, disabled GrayText, both FC themes) |
| F-2 | should-fix | `ICON_MINUS` (spec constraint "from the existing generator") | `npm run generate:icon-names` run, `git diff --exit-code` on the 4 generated files | written by hand "as the script writes them"; drift specs pass. Retry in the fix round; if approval is still refused, the release-manager runs it before tagging |

**Verdict:** changes requested

## Round 2 — 2026-11-17, commit fd26cd8 (libs/tools = b3bc8cc)

Fix diff `924479a..b3bc8cc`: 4 files, only `@media (forced-colors: active)` blocks at the end of `checkbox.component.scss` / `radio.component.scss` plus 2 spec pins. No source file is newer than the developer's `r2-fc` shots (`find -newer`), so `r2-fc` and the Storybook build were reused. Review run `r2-review` (`--forced-colors`, 360 L/D, composite measure: mark colour × opacity chain up to the host, over a `Canvas` probe).

| AC | Result | Evidence |
|---|---|---|
| AC-22 | pass | `r2-fc.log` (5 stories × 360 L/D): every editable, checked, indeterminate and read-only check/dot = `CanvasText` (0 0 0 L / 255 255 255 D, i.e. system colour, not the read-only ink), 21:1 on the box; unchecked stay op 0. Disabled = `GrayText`; after the disabled dimming (`r2-review.log`): checkbox box .75 → 7.38 L / 7.81 D, radio row .5 → 3.38 L / 3.82 D (inactive controls are exempt from 1.4.11; still ≥ 3:1). Shots opened: checkbox *Read-only and Disabled* L (the F-1 shot: „an“/„teilweise“ now drawn in all three rows), radio-group *Disabled* L, radio *Payment Method* D: every dot visible |
| AC-22 (rule) | pass | matches design §6 r1: check `CanvasText` + `forced-color-adjust: none`, disabled `GrayText`; the read-only (0,3,0) selector is repeated and comes later (pinned in `checkbox.readonly.spec`); radio dot `CanvasText`, `.radio-disabled .radio-dot` `GrayText` (pinned in `radio.component.spec`). No other file styles `.checkbox-icon`/`.radio-dot` (grep) |
| AC-23 | pass | no assertion changed in r1; 2 added |
| AC-25 | pass | changelog draft *Fixed* names F-1; see N-1 for its number |
| others | pass | unchanged since round 1: at rest, `r2-rest-a|b|c` 10/10 byte-identical to round-0 `cmp`/`cmp2`/`new` (checked with `cmp`) |

| # | Severity | Status | Note |
|---|---|---|---|
| F-1 | must-fix | **closed** | as above |
| F-2 | should-fix | open → release-manager | generator still refused for the developer (build.md Deviation 1): run `npm run generate:icon-names`, then `git diff --exit-code -- libs/angular-ui-kit/src`; a diff goes back to web-developer |
| N-1 | nit | open → release-manager | changelog *Fixed* says „`GrayText` when disabled (14:1)“: that is the undimmed value. Expected wording: „`GrayText` when disabled (7.4:1 checkbox, 3.4:1 radio after the disabled dimming)“ (`r2-review.log`) |

**Verdict:** approved (F-2 and N-1 stay visible in release.md)
