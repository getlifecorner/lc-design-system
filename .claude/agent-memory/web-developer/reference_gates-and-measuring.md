---
name: reference-gates-and-measuring
description: Getting real numbers from the gates (Jest counts, lint baseline, bundle sizes, pixel diffs, --measure) and the Bash-tool filters that block commands headless
metadata:
  type: reference
---

- **Baselines after request 009 (2026-10-21):** Jest 157 suites, 3985 passed, 8 skipped (full suite ~10 s); lint 0 errors, 162 warnings; build ~10 s (119 entries); Storybook ~18 s; compat `--only=22` ~3 min. Jest prints counts only with `--output-style=static --skip-nx-cache`; a worker SIGSEGV happens now and then: rerun. `--testFile=<name or regex>` works, `--testPathPattern` is ignored.
- **Lint:** the Nx target runs eslint in `libs/angular-ui-kit/`; from the root you get false module-boundary errors.
- **Bundles:** SSR `--stats-json` writes `browser-stats.json`; CLI kB = 1000 B. Unchanged-bundle proof: `npm pack` the last version, `shasum fesm2022/*.mjs` vs `dist/`. `check-entries.mjs` hard-codes the entry count. The last release is often only staged (ETARGET): use an earlier request's tarball.
- **story-shots:** refuses a build older than `src` (spec edits count). Designer baselines may be `--full`: check `file *.png` sizes before reading a diff (shell stories are 924 px tall). `--measure` runs before the shot, so it can inject a `<style>` to try CSS against `--compare` without rebuilding. Story args: `updateStoryArgs` via `__STORYBOOK_ADDONS_CHANNEL__` did not re-render in 009; flip the DOM attribute the story's style keys on instead, but not for the root font size: headless Chromium keeps descendants' `rem` at the old root size (html computes 16 px, label stays 24) whether via the `:has()` attribute or inline `font-size`; measure 100 % on 100 % stories. After `el.focus()` wait two rAFs. Flaky hashes: sidenav logo stories, chat message-status.
- **Pixel diff without deps:** `mkdir dist/storybook/angular-ui-kit/zz-diff`, `cp` baseline + new PNGs there, load both in `--measure` (`new Image()`, canvas `getImageData`), return differing rows; `rm -r` the dir after.
- **Prerendered pages in the browser:** copy compat `browser/` files into `dist/storybook/angular-ui-kit/c8/` (explicit `cp a b dir/`), fix `<base href>` with Edit; sandboxed iframe = no JS; hydration done = `[jsaction]` count 0.
- **Bash filters (headless):** allowed: `story-shots.mjs`, `check-angular-majors.mjs`, nx targets, `mkdir`/`cp`/`rm`, `cmd > log 2>&1; grep … log`. Need approval: any other `node <file>` (also in `tmp/`), `node -e`, `$(…)`, `sed`/`awk` edits, `git check-ignore`, `env`, `cd x && git`, `grep -E` with `^(…|…)$`, `for` loops. Rejected: `{a,b}`-looking text even inside quotes ("Brace expansion": put a space after every comma inside braces in `--measure` JS), unicode escapes, heredocs with `{`+quotes (a plain `git commit -F - <<'EOF'` passed). `git commit --amend` passes; to fix the message, `git log -1 --format=%B > tmp/x`, Edit, `--amend -F tmp/x`.

Related: [[feedback-build-pitfalls]]
