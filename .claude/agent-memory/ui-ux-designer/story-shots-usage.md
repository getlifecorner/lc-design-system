---
name: story-shots-usage
description: Permission-safe way to run story-shots and the Storybook build from this agent, plus measured stat-trend/card reference values
metadata:
  type: project
---

The agent's cwd is outside lc-design-system. Run as `cd /Users/eric/Documents/Projekte/life-cockpit/lc-design-system && node tools/agents/story-shots.mjs …` and `cd … && npx nx run angular-ui-kit:build-storybook` (~20 s). Absolute-path invocation, `2>&1 |`, redirects after `cd`, `${…}` and `node -e` need approval; `| wc -l` is fine (baseline runs print one line per shot).

Reference values (3.22.0, 360 px): Storybook canvas padding 16 px (card 328 wide); lc-card padding md 16 + border 1; stat-trend label 12 px / 18 px line, row 31.38 px, column gap 4 px, sparkline 28 px.

**Why:** saves trial and error on permissions and re-measuring.
**How to apply:** use these forms first; re-measure if the kit version changed. Related: [[axe-label-in-name-pitfalls]].
