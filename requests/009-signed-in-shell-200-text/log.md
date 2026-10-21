# Log 009: Signed-in shell at 200 % text on a phone

## Owner decisions

Headless run (started with `--headless`); no owner available during the run.

| Date | Question | Answer |
|---|---|---|
| 2026-10-21 | 1. How to get past the inherited `NX_WORKSPACE_ROOT_PATH` | b: the run was resumed from life-os with `NX_WORKSPACE_ROOT_PATH` unset (`env -u`). Option a (`unset` in `scripts/lc-request.sh`) is the owner's call for the kit repo, so it isn't part of this request. |
| 2026-10-21 | 2. Resume (designer captures the baselines from design.md §9 before any library change, then web-developer implements design.md) | yes |
| 2026-10-22 | 1. Push access to `getlifecorner/lc-design-system` (fix the permission, or push `main` yourself) | b: the owner pushed `main` (67846de, CI and Deploy Docs green) and started the npm publish for 3.10.1 by hand (run 39684975954); the owner approves its npm stage with 2FA. Agents only watch that run, check the tag and the docs, and record the release in log.md and the requests README. |
| 2026-10-22 | Standing: GitHub token scope for agents (life-os D2) | The machine's GitHub token covers lc-design-system with Contents and Pull requests write but only Actions read. Agents push `main`; the owner starts the publish. Change the release process (release-manager and its docs): push, wait for CI, then ask the owner to start the publish, and watch it. |
| 2026-10-22 | 2. Resume the release-manager at step 2.2 | done: the `NX_WORKSPACE_ROOT_PATH` unset is in 67846de. |

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
| 2026-10-21 | ui-ux-designer → release-manager | done | Review round 2 found no must-fix, all ACs pass, and libs/tools are unchanged since the r2 gates on fd9d7fc. | Prepare the release for request 009 (patch 3.10.1, branch fix/3.10.1-signed-in-shell-large-text). Apply review.md r2 should-fix 9 to the changelog: drop the unreleased "1.2 px apart" phrase. Carry nits r1-4, r1-5, 6, 7 and 8 as open items. |
| 2026-10-21 | release-manager → owner | blocked | Release commit `bcf2bce` (3.10.1) is merged into local `main`, but `git push origin main` returned 403 ("Permission to getlifecorner/lc-design-system.git denied to fritzcoded"), a GitHub access failure; nothing pushed, tagged, published or deployed. (The row this replaces, "→ none, released", was written before the push and is wrong.) | 1. Restore push access to `getlifecorner/lc-design-system` for `fritzcoded` (recommended: fix the GitHub permission or credential), or push `main` yourself. 2. Then resume the release-manager at step 2.2 from local `main` at `bcf2bce`: push, wait for CI, trigger `publish-npm.yml` for 3.10.1, verify the tag and docs. Open items r1-4, r1-5, 6, 7, 8 in release.md. |
| 2026-10-22 | owner → release-manager | answered | Owner answered 1: b (pushed `main` and started publish run 39684975954 by hand), 2: done (67846de); new standing decision on the token scope | Watch publish run 39684975954 for 3.10.1 (don't start another), check the tag `v3.10.1` and the docs, and record the release in log.md and requests/README.md. Change the release process (release-manager agent and its docs) to: push `main`, wait for CI, ask the owner to start `publish-npm.yml`, then watch it. |

## Release outcome

| Item | Result |
|---|---|
| Release commit | `bcf2bce`; `main` pushed by the owner at `67846de` (CI and Deploy Docs green) |
| Publish run | 39684975954 (`workflow_dispatch`, started by the owner, headSha `67846de`): *publish* success, *tag* success |
| Tag | `v3.10.1` points at `67846de` (= `main` HEAD) |
| Docs | `design.life-cockpit.de/index.json` lists the 8 new large-text stories (`layout-app-shell--signed-in-large-text`, `navigation-bottom-nav--floating-large-text`, `navigation-header--signed-in-large-text`, ...) |
| npm stage | Not read (`npm stage list` needs a local npm login). The owner approves it with 2FA |

Process change (owner, 2026-10-22): agents push `main` and wait for CI; the owner starts `publish-npm.yml`; the release manager watches the run. Updated: `README.md`, `requests/README.md`. Needs the owner (agent config writes are not permitted to the release manager): `.claude/agents/release-manager.md` (section 2, steps 4 and the description), `CLAUDE.md` (Releases, agent table, "No release gate"), `.claude/skills/lc-release/SKILL.md`, `.claude/settings.json` (drop the `gh workflow run` allow rule).

### Paste-ready replacements (owner applies; the release-manager may not write `.claude/` or `CLAUDE.md`)

**`.claude/agents/release-manager.md`, frontmatter description, the sentence "When everything is green and the review is approved, it releases without asking. It pushes ... watches CI to the end." becomes:**

> When everything is green and the review is approved, it pushes the release commit to main and waits for CI. The agents' GitHub token cannot start workflows, so it then asks the owner to start the publish pipeline and watches that run, which stages the package on npm and tags the commit.

**Same file, heading of section 2 and the line below it:**

```
## 2. Release (through the pipeline, only when step 1 is completely green)

The machine's GitHub token has Contents and Pull requests write but only Actions read (owner decision 2026-10-22). You push `main`, but you cannot start a workflow: the owner starts `publish-npm.yml`, and you watch it.
```

**Same file, step 4 (and the end of its second sentence):**

```
4. **Only then ask the owner to start the publish.** Don't run `gh workflow run` (the token cannot). Use AskUserQuestion; in a headless run end with `status: needs-owner`, `next: owner`, and a task that names the exact command `gh workflow run publish-npm.yml --ref main -f version=X.Y.Z`, the release commit SHA and the green CI run. Once the owner has started it, find the run: `gh run list --workflow=publish-npm.yml --limit 3 --json databaseId,headSha,status,event`. It must be the `workflow_dispatch` run whose `headSha` is your release commit. Never start a second run.
```

**`.claude/skills/lc-release/SKILL.md`, frontmatter description: replace "when everything is green, it pushes main and triggers the publish pipeline, which stages the package on npm and tags the commit." with:**

> when everything is green, it pushes main, waits for CI, asks the owner to start the publish pipeline and watches that run, which stages the package on npm and tags the commit.

**Same file, replace the line "Call `release-manager` ... It needs no go: when the gates are green, it ships." with:**

> Call `release-manager` (Agent tool, foreground) with the request folder or the scope and the task "Release it". It needs no go to push `main`, but the owner starts the publish workflow: when the gates and CI are green, it hands off to the owner with the exact `gh workflow run` command.

**Same file, add to the handoff list:** `next: owner` with the `gh workflow run publish-npm.yml` command: ask the owner to run it (AskUserQuestion), then call `release-manager` again with the run ID so it only watches.

**`CLAUDE.md` (also the owner's to apply):**
- Line 51: "**The normal path (release-manager):** push the release commit to `main` and wait for CI, then the owner starts `gh workflow run publish-npm.yml --ref main -f version=X.Y.Z` (the agents' token has only Actions read) and the release-manager watches the run. The *publish* job checks ... [rest unchanged]".
- Line 78, release-manager row: "... runs all gates and makes the release commit. When everything is green, without asking: pushes `main` and waits for CI, then asks the owner to start the publish, and watches that run until the package is staged and the commit tagged".
- Line 93: "**One release step needs the owner:** a request whose review is approved and whose gates are all green is pushed to `main` by the `release-manager` without asking. The owner starts `publish-npm.yml` and approves the npm stage with 2FA before the package is public."

**Owner decision for `.claude/settings.json`:** the allow rule `Bash(gh workflow run publish-npm.yml --ref main -f version=*)` can no longer succeed with the Actions-read token. Remove it, or keep it for a future token with Actions write. Not edited.
