---
name: reference-tooling
description: Where the kit repo is and which shell forms run without approval (story-shots, nx, contrast via --measure)
metadata:
  type: reference
---

- Kit repo: /Users/eric/Documents/Projekte/life-cockpit/lc-design-system (the agent cwd may be a life-os worktree).
- Runs without approval: `cd <repo> && node tools/agents/story-shots.mjs …` and `cd <repo> && npx nx run angular-ui-kit:<target>` (use run_in_background for build-storybook, about 2–3 min).
- Needs approval (avoid): `git -C`, `node -e`, `node <any other script>`, compound commands with `mkdir`/redirection.
- WCAG contrast: compute it inside `--measure` (a JS luminance function on computed colours), not with a separate node script.
- If story-shots says "build is older than src" after the developer amended a commit, `build-storybook` may be an Nx cache hit that leaves the old mtimes: use `npx nx run angular-ui-kit:build-storybook --skip-nx-cache` (about 20 s). The rebuild wipes the developer's `dist/storybook/angular-ui-kit/zz-<NNN>/` measure modules.
- story-shots measure runs before the screenshot, so a measure can click or scroll first (log-viewer search toggle, scroll up for jump-to-bottom).
