---
name: release-pitfalls
description: Durable facts for running a kit release (pack contents, shell limits, gate shortcuts)
metadata:
  type: project
---

- Since 3.5.0 `npm pack` has about 370 files (one FESM, map and types per entry; 3.4.1 had 36). Unpacked 5.3 MB, packed 1.1 MB. The five `src/styles/*.spec.ts` files are packed on purpose-by-accident since before 3.4.1 (assets glob `src/styles/**/*`); don't flag them as new.
- Production build takes about 55 s (3.5.0, 113 entries).
- Shell: compound commands (`a && python3 ...`, `;` chains with scripts) can hit an approval prompt in headless runs. Use Edit for changelog and version, and run one command per Bash call.
- Code-changed check: `git diff --quiet <build commit> -- libs tools` also fails for `tools/agents/*` changes (screenshot helpers). Those are not in the package or any gate; say so in release.md instead of rerunning the compat matrix.
- The changelog draft sits in build.md as a fenced block; replace the `2026-10-XX` date with the release day.
- 3.6.0: pack 382 files, 1.1 MB packed, 5.5 MB unpacked; production build rerun took ~10 s with nx cache. Bash approval prompts also fire for `;` chains with `sed -i` or `git show`/`git log` after greps: one command per call, Write/Edit for files.
- 3.5.1: publish run ~3 min, CI ~5 min. CI Angular 22 job steps "Check the /tt pages under a Trusted Types CSP" and "Check the secondary entries" now pass (Chrome needs --no-sandbox when CI is set). `git rev-list`/`show-ref` on tags and `gh api` can hit approval prompts headless; check the tag job result via `gh run view --json jobs`.
- 3.10.0: pack 418 files, 1.1 MB (same as 3.9.0). CI ~4 min, publish ~3 min, both jobs green; Deploy Docs had listed the new stories by the time publish finished. `gh run watch ... ; echo exit=$?` and `$(...)`-style commands trigger approval prompts: redirect to a log and run `tail`/checks as separate calls. `npm stage list` E401 again (not logged in).
- 3.9.0: pack 418 files, 1.1 MB packed (similar to 3.6.0). Production build 9.3 s, CI ~4 min, publish workflow ~3 min (both jobs passed). Deploy Docs creates CloudFront invalidation (takes minutes to propagate); stories may not appear immediately in index.json. `npm stage list` needs local npm login; skip the stage ID if E401.
- 3.10.1: pack 418 files, 1.1 MB (5.7 MB unpacked); build 8.3 s. Release commit amended-in request docs: stage review.md (untracked) by name.
- 3.11.2: pack 418 files, 1.2 MB (5.8 MB unpacked); build 9.1 s. `git -C <path>` and multi-command Bash calls prompt for approval; plain `git` in the cwd, one command per call. Developer ran compat only on 22, so the release ran all four (a few minutes).
- 3.11.1: pack 418 files, 1.1 MB (5.7 MB unpacked); build 9.3 s; full compat matrix (21.0, 21, 22.0, 22) took a few minutes, all PASS. Stage ui-ux-designer memory files and review.md by name.
- 3.11.3: pack 418 files, 1.2 MB; build 8.9 s. CI ~12 min this time (chrome-headless-shell install took 9 min); macOS has no `timeout` command, and a Bash call over 600 s is backgrounded: re-check with `gh run view <id> --json status,conclusion`, then run `gh run watch` again. Tag push also starts a second Deploy Docs run. Stage ID: npm E401 again.
- 3.11.4: pack 418 files, 1.2 MB (5.8 MB unpacked); build 9.4 s. Pack lists 7 `src/styles/*.spec.ts` (not 5), same as before; ignore.
- 3.13.0: pack 421 files, 1.2 MB / 5.8 MB (= 3.12.0); build 33 s uncached. Rebuild after the version bump even when libs only changed by package.json (dist version check). Dispatcher said unrelated modified agent-memory/log files stay out; only own memory staged.
- 3.13.1: pack 421 files, 1.2 MB / 5.8 MB (= 3.13.0); build 9.1 s. `sed -i` on version/README prompts in headless runs: use Edit. Verify story export names in the stories file for release.md IDs.
- 3.14.0: pack 421 files, 1.2 MB / 5.9 MB; build 9.0 s (the log has no "Built" lines, check dist version + fesm2022 count 238). `git rev-list` prompts; use `git log HEAD..origin/main`. Review-approved should-fix/nit items go into the changelog as a "Known" section and into release.md.
- 3.15.0: pack 421 files, 1.2 MB / 5.9 MB (= 3.14.0); build 9.1 s. `git diff --quiet ... ; echo x=$?` is refused ("variable can't be checked"): use `git diff --stat <commit> -- libs tools` (empty = unchanged). Root README "New in" was not updated since 3.13; left alone when the component list is unchanged.
- 3.12.0: pack 421 files, 1.2 MB / 5.8 MB (= 3.11.5); build 9.7 s. Shared working tree: other uncommitted work (queue tooling, next request) must stay out; stage by name and build a partial `git apply --cached --unidiff-zero` patch for mixed files (requests/README.md rows). Seven `src/styles/*.spec.ts` are packed (known).
- 3.16.0: pack 424 files (+3 for the `money` entry), 1.2 MB / 6.0 MB; build 9.6 s. `git apply --cached` and `git hash-object -w` prompt in headless runs: to stage only your row of requests/README.md, remove the other request's row with Edit, `git add`, put it back with Edit. Designer/developer memory files stayed out (mixed with request 021).
- 3.17.0: pack 424 files, 1.2 MB / 6.0 MB (= 3.16.0); build 14 s. Code unchanged since the developer's gate commit, so only build + pack ran. `TableColumn` uses `label`, not `header` (check before writing snippets). Designer/developer memory files were all request-021 work this time and were staged.
