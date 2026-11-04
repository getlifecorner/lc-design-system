---
name: lc-request
description: Runs a requirement for the LifeCorner Design System through the agent pipeline (spec-writer → ui-ux-designer → web-developer → design review → release-manager) until the new version is released through the publish pipeline. The agents route among themselves through their handoffs, and nobody has to approve the release. Use when a consuming project (life-os, lc-apps, …) or the owner asks for a component, input, slot, token, fix or gap (G-xx) in @lifecorner/angular-ui-kit. A requirement is collected in the inbox first; --batch runs everything collected as one request and one version, --now runs one at once. Resume an open request with --resume <NNN>.
argument-hint: <requirement text | path to a file> [--from <project>] [--now] [--headless] | --batch | --resume <NNN> [answers]
---

# Running a request through the pipeline

You (the main session) are the dispatcher. Run a request in a fresh session, such as `scripts/lc-request.sh` or a new `claude` in this repository, never at the end of a long conversation: every handoff re-reads the dispatcher's whole context. Keep your own part small. Pass tasks on verbatim, don't add what the documents already say, and tell the owner each handoff in one line.

The agents decide the route: each one ends with a HANDOFF block (format in `CLAUDE.md` → *Agent pipeline*) that names the next agent and its task. You carry out these handoffs and keep the log. Don't do the agents' work yourself, and don't rewrite their tasks. Pass them on. The release needs nobody's go: once the review is approved and every gate is green, the `release-manager` ships it through the pipeline.

Arguments: `$ARGUMENTS`

- `--from <project>`: the requester. Without it: the name of the directory a file path points into, else `owner`.
- `--headless`: nobody can answer questions (started by `scripts/lc-request.sh`). An owner question ends the run instead of asking.
- `--resume <NNN>`: continue `requests/<NNN>-*/` from the last handoff in its `log.md`. Skip step 1 (not step 0); switch to the request's branch (named in `build.md`) if it already has one. Any text after the number is the owner's answer to the open questions: record it under *Owner decisions* in `log.md` and pass it on.
- `--now`: run this requirement at once instead of collecting it (urgent: a consumer is blocked).
- `--batch`: start the bundle: run `scripts/lc-request.sh --batch` with `run_in_background`, tell the owner how many items it takes, and stop. The script runs the bundle headless in a fresh session.
- Everything else is the requirement. If it starts with a path to a readable file, the file is the requirement, and the path is recorded; text after the path narrows it (for example "G-13 only" for a concept with many gaps). A **bundle** is such a file from `tmp/lc-request/bundles/` with `--from bundle`: one request for all its items.

## Collect, don't run (the default)

The owner collects requirements and releases them together, as one request and one version per bundle (owner decision 2026-11-03). Interactive, a requirement without `--now` or `--resume` is therefore not run: write it to `tmp/lc-request/inbox/<YYYYMMDD-HHMMSS>-<slug>.md`, tell the owner how many items the inbox holds (`scripts/lc-request.sh --list`), and stop without taking the lock. The item format: the header lines `from: <requester>`, `dir: <the requester's directory>`, `date: <date '+%Y-%m-%d %H:%M'>` and, for a file, `file: <absolute path>`; then a blank line and the requirement verbatim. Headless, `scripts/lc-request.sh` has already collected everything else, so a headless run always goes on.

## 0. One run at a time

Two runs in one working tree switch branches under each other and take the same version, so only one request is dispatched at a time, also on `--resume`. The dispatching run holds `tmp/lc-request/lock` (`pid=<its Claude process, or the lc-request.sh that runs it> since=<time> run=<arguments>`); calls of `scripts/lc-request.sh` wait for it with a ticket in `tmp/lc-request/queue/`, oldest first.

- **Headless:** the script waited for its turn and holds the lock for you. Go on.
- **Interactive:** run `cat tmp/lc-request/lock; echo "self=$PPID"; ls tmp/lc-request/queue` (`$PPID` of a Bash call is your own Claude process). The run is yours when the lock names your pid, or when it is missing or its pid no longer runs `claude` or `lc-request.sh` (`ps -p <pid> -o args=`) and no ticket's pid (the part after `-`) still runs `lc-request.sh`. Then take the lock: `mkdir -p tmp/lc-request && echo "pid=$PPID since=$(date '+%Y-%m-%d %H:%M') run=/lc-request <arguments>" > tmp/lc-request/lock`. Otherwise don't start: queue the request by running `scripts/lc-request.sh <the same arguments, without --headless>` with `run_in_background` (it waits its turn, then runs headless, and you are notified when it ends), tell the owner which request is running and how many calls wait ahead, and stop.

## 1. Start

1. **Working tree:** run `git status --short --branch`. Uncommitted changes in `libs/` or `tools/` are someone's work in progress: stop and ask (headless: stop with status `blocked`). The exception is `tools/infra/cdk-outputs.json`, a deploy artefact. Leave alone the folders of other open requests in `requests/` (they wait for the owner) and other local files such as drafts in the root. Switch to `main`, `git fetch origin`, and if `main` is behind, `git merge --ff-only origin/main`.
2. **Folder:** the next number is the highest `requests/NNN-*` plus 1, three digits. The slug is two to five kebab-case words from the requirement. Create `requests/<NNN>-<slug>/request.md` from `requests/_templates/request.md`: the requirement **verbatim**, the requester, the date, referenced files as absolute paths, and the gap IDs. For a bundle, `request.md` holds every item verbatim with its requester, the slug names the main topics, and the README row's requester is `bundle (<requesters>)`.
3. **Register it:** add a row to `requests/README.md` (status `new`), and start `log.md` from `requests/_templates/log.md`.

## 2. Dispatch loop

Start with `next: spec-writer`, task "Write the spec for this request". Then repeat:

1. **Call the agent** named in `next` with the Agent tool (`subagent_type` = that name), in the foreground. Each step builds on the one before. The prompt:

   ```
   Request: requests/<NNN>-<slug>/ (read request.md first, then what your role needs).
   Mode: <design | review — only for ui-ux-designer>
   Task: <the task from the last handoff, verbatim>
   From: <previous agent> — <its reason>
   Owner decisions: <from log.md, or "none">
   End your reply with the HANDOFF block from CLAUDE.md.
   ```

   The mode for `ui-ux-designer` is `review` once `build.md` exists and the handoff comes from `web-developer`; otherwise it is `design`.
2. **Read the HANDOFF.** If it is missing or incomplete, ask the same agent for it with SendMessage instead of guessing.
3. **Log it:** append a row to `log.md` (time, from → to, status, reason, task) and update the status in `requests/README.md` (`spec`, `design`, `build`, `review`, `release`, `needs-owner`, the version, `answered`). Take the time from `date '+%Y-%m-%d %H:%M'` right before you write the row (also for *Owner decisions*); never estimate it or write the date alone.
4. **Route:**
   - `next: <agent>` → the next iteration.
   - `next: owner`: only for decisions agents may not make (a breaking change, a new runtime dependency, an infrastructure or npm failure in the pipeline). Ask them with AskUserQuestion (the agent's options, recommended first), write the answers under *Owner decisions* in `log.md`, and give them to the agent that asked, as its next task. In headless mode, stop with status `needs-owner`.
   - `next: none` → finish (step 3).
5. **Loop guard:** if two agents hand back and forth more than three times on the same point, or a request reaches 15 handoffs, stop and put the disagreement in front of the owner as a question. Never break a tie yourself.

## 3. Finish

**Follow-ups first** (released, or stopped after a review). Findings that need fixing go back into the pipeline without asking the owner (`CLAUDE.md` → *Follow-ups*). Take the rows routed `queue` in *Open items* of `release.md` (in a stopped run, the open `should-fix` findings in `review.md`) and skip those an open request or the inbox already covers. Write the rest as one item into the inbox (format in *Collect*, `from: owner`, `dir:` this repository), with the requirement on one line: `Follow-ups <IDs> of request <NNN>: <one clause each>; details in requests/<NNN>-<slug>/<document> <section>.` It runs with the next bundle. Name the IDs in your final message; the `backlog` rows are already in `requests/BACKLOG.md`.

**Commit the log** (every outcome). The last handoff row comes after the release commit, so it would stay uncommitted: stage `requests/<NNN>-<slug>/log.md` and, if changed, `requests/README.md` by name, and commit them on the branch the run ends on with `chore(requests): log <NNN> (<outcome>)`. Don't push it: a push of `main` runs CI and the docs deploy, and the next release push carries it.

Free the lock in every outcome (released, answered, stopped): interactive, `rm tmp/lc-request/lock` if it names your pid; headless, it is free once the process ends. The next queued call then starts by itself.

Your final message is what the requester receives. In headless runs it is all the calling project gets, so it must stand on its own:

- **Released:** the version and its tag, the closed gap IDs, what the requester can use now (from *For the requester* in `release.md`: the install line, a snippet, the story IDs), the pipeline results, and the follow-ups put into the inbox. For a bundle, group what each requester gets under its name. Say that the package is public once the npm stage is approved with 2FA, and give the stage ID.
- **Already in the kit** (`next: none` from the spec): the resolution from `spec.md`, with a snippet.
- **Stopped** (`needs-owner`, `blocked`): the reason, the open questions with options, and the exact continuation: `/lc-request --resume <NNN> <answers>` in this repository, or `scripts/lc-request.sh --resume <NNN> "<answers>"` from outside.

Always name the folder `requests/<NNN>-<slug>/`. Don't paste the documents themselves.
