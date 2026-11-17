---
name: story-shots-usage
description: Permission-safe way to run story-shots and the Storybook build from this agent, plus measured stat-trend/card reference values
metadata:
  type: project
---

The agent's cwd is outside lc-design-system. Run as `cd /Users/eric/Documents/Projekte/life-cockpit/lc-design-system && node tools/agents/story-shots.mjs …` and `cd … && npx nx run angular-ui-kit:build-storybook` (~20 s). Absolute-path invocation, `2>&1 |`, redirects after `cd`, `${…}` and `node -e` need approval; `| wc -l` is fine (baseline runs print one line per shot).
**037 r2:** when cwd is the repo, `node tools/agents/story-shots.mjs … --measure='<file pasted inline>' > tmp/story-shots/<NNN>/x.log` (no `cd`, `run_in_background`) ran without a prompt; `--measure="$(cat file)"` is refused. Wait with `until grep -q '^{"identical"' log; do sleep 3; done` (a bare `"identical"` matches each shot's compare key). With `--axe`, any violation makes the run exit 1 (a "failed" background task): read the log, not the status. `$(…)` inside an until-loop is refused; wait on the last shot's file name instead.
**059 r2:** a run can exit 1 with `ENOTEMPTY` (rmSync of its temp dir, l. 305) after the last shot: the shot lines are complete, only the summary lines are missing. `node -e` and Bash `grep -o` patterns with `{` need approval; use the Grep tool with `-o` on the log.
**062 (resume):** a run without `--compare` prints no summary line, so a log cut off by a stopped run looks complete. Check it with `grep -o '"story":"[a-z-]*--' <logs> | sort | uniq -c` (shots per component = stories × widths × themes) against the same count over `--list=- > scratchpad file`. `node -e` is refused: compute contrast grids as a pure-math `--measure` on any one story.
**062 r1:** a `label.click()` in a measure focuses the input, so a later "ring before/after `focus()`" compare reads no change: blur first or test the ring in a separate pass. Reuse a developer's compare folders only after `find libs/angular-ui-kit/src -newer <first shot> -not -name '*.spec.ts'` is empty. Byte-identical diffs across 3 post-change runs can still be raster noise (sidenav active-pill corner): locate the pixels with `elementsFromPoint` before calling it a change.

Reference values (3.22.0, 360 px): Storybook canvas padding 16 px (card 328 wide); lc-card padding md 16 + border 1; stat-trend label 12 px / 18 px line, row 31.38 px, column gap 4 px, sparkline 28 px.

**Why:** saves trial and error on permissions and re-measuring.
**How to apply:** use these forms first; re-measure if the kit version changed. Related: [[axe-label-in-name-pitfalls]].
