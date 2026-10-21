# Log 009: Signed-in shell at 200 % text on a phone

## Owner decisions

Headless run (started with `--headless`); no owner available during the run.

| Date | Question | Answer |
|---|---|---|
| 2026-10-21 | 1. How to get past the inherited `NX_WORKSPACE_ROOT_PATH` | b: the run was resumed from life-os with `NX_WORKSPACE_ROOT_PATH` unset (`env -u`). Option a (`unset` in `scripts/lc-request.sh`) is the owner's call for the kit repo, so it isn't part of this request. |
| 2026-10-21 | 2. Resume (designer captures the baselines from design.md §9 before any library change, then web-developer implements design.md) | yes |

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-21 | dispatcher → spec-writer | new | Start of the pipeline | Write the spec for this request |
| 2026-10-21 | spec-writer → ui-ux-designer | done | The spec is ready and classified as a kit bug fix with no owner decision needed, so the designer goes next. | Design the API and visuals for AC-1…14 in requests/009-signed-in-shell-200-text/spec.md. That covers the header wrap or truncation rule, the bottom-nav item sizing and label wrapping, and how `lc-app-shell` reserves the bar's real height (CSS-only preferred). Plan stories at 360 and 320 px with 200 % text in EN and DE, and baselines for the unchanged 100 % renderings. |
| 2026-10-21 | ui-ux-designer → owner | blocked | design.md is ready (patch 3.10.1, CSS for header and bar, ResizeObserver clearance), but the baselines can't be captured: the session inherits `NX_WORKSPACE_ROOT_PATH` from life-os, so `nx run angular-ui-kit:*` finds no project, and every later gate would fail the same way. | 1. Restart the run with `NX_WORKSPACE_ROOT_PATH` unset (recommended: `unset NX_WORKSPACE_ROOT_PATH` in `scripts/lc-request.sh`), or run it from this repo. 2. Then resume: ui-ux-designer captures the baselines (design.md §9) before any library change, then web-developer implements design.md. |
| 2026-10-21 | owner → ui-ux-designer | answered | Owner answered 1: b, 2: yes | Resume: capture the baselines (design.md §9) before any library change, then hand over to web-developer. |
| 2026-10-21 | ui-ux-designer → web-developer | done | The design is complete and the baselines are now captured on unchanged `main`, so the implementation can start. | Implement requests/009-signed-in-shell-200-text/design.md (AC-1 to AC-14) on a `fix/3.10.1-…` branch. Before any bottom-nav change, measure the cause on the unchanged CSS as §9 says and record it in build.md; the baselines in tmp/story-shots/009/baseline must not be overwritten. |
| 2026-10-21 | web-developer → ui-ux-designer | done | Implemented on `fix/3.10.1-signed-in-shell-large-text`, all gates green (157 suites / 3984 tests, lint 0 errors, build, tools 22/22, compat 22). Three deviations need the designer: the header mechanism (spacer + title margin instead of `brand::after`), 8 intended baseline diffs, and the refuted bar cause. | Review request 009: the 8 new stories (build.md) and the deviations in build.md; compare shots in `tmp/story-shots/009/after-4`, new shots in `tmp/story-shots/009/new`. |
| 2026-10-21 | ui-ux-designer → web-developer | changes-requested | Review r1: AC-1 to AC-14 pass and all 3 deviations are accepted (design.md change notes). Two must-fix findings in the bar: the pills zigzag (centred content) and neighbouring labels sit 1.2 px apart at 200 %. | Implement review.md r1 findings 1 and 2 (design.md §3 bar rows), plus 3 in the changelog draft. Re-shoot the new stories, re-run the baseline compare against `tmp/story-shots/009/baseline`, and update build.md. |
| 2026-10-21 | web-developer → ui-ux-designer | done | Review r1 findings 1–3 built as design.md §3 says (item top-aligned, reach clamp(-4px, 32px - 1.5rem, 8px), changelog); pills 6 px below the item top in every bar, smallest ink gap 4.6 px at 200 %; compare 184 identical + the same 8; 157 suites / 3985 tests, lint 0 errors, build ok on fd9d7fc. | Review round 2 of request 009: the bar in the 5 bar and shell large-text stories (`tmp/story-shots/009/r2-new`) and the compare in `tmp/story-shots/009/r2`; build.md Round 2. |
