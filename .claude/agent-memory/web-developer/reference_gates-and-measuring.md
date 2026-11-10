---
name: reference-gates-and-measuring
description: Getting real numbers from the gates (counts, story-shots compare/measure, pixel diff, CDP) and the Bash forms that pass headless
metadata:
  type: reference
---

- **Baselines after 057 (2026-11-10):** Jest 298 suites, 6230 passed, 8 skipped; Storybook 1116 stories; compat 22: 110 checks (`grep -o ", ok \|: ok " log | wc -l` − 1); lint 0 errors / 160 warnings; build 122 `Built @lifecorner` lines (`--output-style=static`, else the TUI hides them); test:tools 22. Durations here: lib build 9 s, Storybook 18 s, full Jest 25 s.
- **Order:** lib build (rewrites tokens) → `build-storybook --skip-nx-cache` (stories-only edits restore "[local cache]" otherwise) → shots → full Jest last (Chromium + Jest workers SIGSEGV). story-shots checks staleness only at start, against every file in `src` (spec edits too): finish src and spec edits first, else rebuild Storybook (wipes `zz-*`). `--testPathPattern` is ignored by the nx target (runs everything): use `--testFile`.
- **Logs:** every shot line is printed; differing ones carry `"compare":"different"` (Grep that). An `ENOTEMPTY` rmSync error at exit is the profile cleanup; the shots are written.
- **Compare:** `--compare=<designer baseline> --measure='(async () => (await new Promise(r => setTimeout(r, 800)), 1))()'`; 4 parallel background runs of 48 stories × 360/1280 × L/D (768 shots) took ~12 min. Story lists: `grep -ho '"story":"[^"]*"' logs | cut -d'"' -f4 | sort -u`, then `sed -n a,bp | paste -sd, -` and paste the ids inline (`$(cat)` needs approval). Summary line `{"identical":n,"different":n}`.
- **Measures:** module in `tmp/<NNN>/measure/m.mjs`, `cp` to `dist/storybook/angular-ui-kit/zz-<NNN>/` (a Storybook rebuild wipes it), `--measure='(await import("/zz-<NNN>/m.mjs")).default()'`; tell stories apart by DOM (location is `/`). Render errors: in `--measure` patch `console.error`, `__STORYBOOK_ADDONS_CHANNEL__.emit("forceRemount", ({ storyId }))`, wait 2 s, return the errors. Story args: `__STORYBOOK_PREVIEW__.storyStoreValue.args.argsByStoryId`.
- **Pixel diff:** `tmp/057/measure/diff.mjs` (reads `/zz-diff/names.json`, any widths) + PNGs in `dist/…/zz-diff/base|new` (`cd <dir> && cp a b <abs dir>/` passes) → count, y range, x runs per shot. Known random: table *With Pagination*, *With Filtering*, *Full Featured* 1024/1280 L/D (Salary column, x 826–893 / 1031–1102); log-viewer timestamps; sidenav logo/clock stories. Rerun with `--compare=<own first run>` to prove a diff deterministic.
- **`--axe`:** after the shot; a new story with a violation: axe the nearest existing story on the same build to prove it pre-exists.
- **CDP / Node scripts:** `node <file>`, `node -e`, `python3 -` need approval: use a temp Jest spec (jsdom, `require('<root>/node_modules/ws/lib/websocket.js')`) or a temp `tools/components-manifest/zz-*.test.mjs` (manifest: `extractComponentApi(src).classes` + `toComponentMeta`), run, delete.
- **Bash forms:** pass: nx targets, story-shots, check-angular-majors, `mkdir`/`cp`/`rm` with absolute paths, `cmd > log 2>&1; grep … log`, `git switch -c`, `git commit --amend -F tmp/x`. Need approval or rejected: `for` loops, `$(…)`, `sed -i`, `awk`, `echo ===` (zsh `=`), `{a,b}`-looking text (put a space after commas inside braces), heredocs with `{`+quotes, `cd x && … > file`, `grep -o '.\{0,N\}'` (use the Grep tool with `-o`).
- **Compat:** `--only=22 --work=<scratchpad>/compat` (~4 min, warm). New probe `probe-3NN.ts` on the home page + `EXPECT_IN_HTML`; anchor regexes on ids, allow `(?:<!--[^]*?-->|\s)*` between tags, `emptyAttr('hidden')` for empty attributes.

Related: [[feedback-build-pitfalls]]
