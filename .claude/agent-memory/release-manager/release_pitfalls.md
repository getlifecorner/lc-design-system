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
- 3.11.1: pack 418 files, 1.1 MB (5.7 MB unpacked); build 9.3 s; full compat matrix (21.0, 21, 22.0, 22) took a few minutes, all PASS. Stage ui-ux-designer memory files and review.md by name.
