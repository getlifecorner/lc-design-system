#!/usr/bin/env bash
# Collects requirements for the design-system agent pipeline (/lc-request) and runs them headless,
# from any directory, typically from a consuming project or its Claude Code session:
#
#   ../lc-design-system/scripts/lc-request.sh "lc-hero needs a media slot (G-13), see docs/ux/concepts/website-v0.md"
#   ../lc-design-system/scripts/lc-request.sh --file docs/ux/gaps/g-40.md "G-40 only"
#   ../lc-design-system/scripts/lc-request.sh --batch
#   ../lc-design-system/scripts/lc-request.sh --resume 004 "1: option A. 2: yes."
#
# A requirement is collected in the inbox (tmp/lc-request/inbox/) and the call returns at once.
# Nothing runs until the owner starts the bundle with --batch: every collected item then goes
# through the pipeline as one request and one version. Findings of a run that still need fixing
# come back into the inbox for the next bundle.
#
# Options:
#   --file <path>     the requirement is in this file (relative to the calling directory)
#   --from <name>     the requesting project (default: the calling directory's name)
#   --batch           run everything in the inbox as one bundled request
#   --now             run this requirement at once instead of collecting it (urgent: a blocked consumer)
#   --list            show the inbox
#   --resume <NNN>    continue an open request; text after it answers its questions
#   --budget <usd>    stop the run at this estimated cost
#   --no-wait         if another request is running, report it and exit with 75 instead of waiting
#
# One run at a time. While another one runs, a run waits in a queue (first come, first served) and
# starts on its turn, so start runs in the background (they can wait for hours). A request that
# passes review and every gate is released without asking (its tag starts the publish pipeline);
# the npm stage still needs the owner's 2FA approval to become public.
# The calling directory, and that of each collected item, is readable for the run (--add-dir).
# Output: the inbox entry when collecting; otherwise the pipeline's final message (released
# version and usage, or open questions).
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CALLER="$PWD"
from=""
file=""
resume=""
budget=""
no_wait=""
mode="collect"
text=()

while [ $# -gt 0 ]; do
  case "$1" in
    --file) file="$2"; shift 2 ;;
    --from) from="$2"; shift 2 ;;
    --resume) resume="$2"; mode="run"; shift 2 ;;
    --budget) budget="$2"; shift 2 ;;
    --no-wait) no_wait=1; shift ;;
    --now) mode="run"; shift ;;
    --batch) mode="batch"; shift ;;
    --list) mode="list"; shift ;;
    -h | --help) awk 'NR > 1 && /^set -e/ { exit } NR > 1 { sub(/^# ?/, ""); print }' "$0"; exit 0 ;;
    *) text+=("$1"); shift ;;
  esac
done

if [ -z "$from" ]; then
  if [ "$CALLER" = "$REPO" ] || [[ "$CALLER" == "$REPO"/* ]]; then from="owner"; else from="$(basename "$CALLER")"; fi
fi

path=""
if [ -n "$file" ]; then
  [ -r "$CALLER/$file" ] || [ -r "$file" ] || { echo "lc-request: cannot read $file" >&2; exit 1; }
  path="$(cd "$CALLER" && cd "$(dirname "$file")" && pwd)/$(basename "$file")"
fi

STATE="$REPO/tmp/lc-request"
LOCK="$STATE/lock"
QUEUE="$STATE/queue"
INBOX="$STATE/inbox"
BUNDLES="$STATE/bundles"
mkdir -p "$QUEUE" "$INBOX" "$BUNDLES"

# Inbox items are tmp/lc-request/inbox/<YYYYMMDD-HHMMSS>-<id>.md: header lines (from:, dir:, date:,
# optional file:), a blank line, then the requirement verbatim. Headless runs write follow-ups the same way.
inbox_items() { ls "$INBOX"/*.md 2>/dev/null | sort || true; }

if [ "$mode" = list ]; then
  n=0
  for f in $(inbox_items); do
    n=$((n + 1))
    printf '%s  %s  %s\n' "$(basename "$f" .md)" "$(sed -n 's/^from: //p' "$f" | head -n 1)" \
      "$(awk 'body && NF { print; exit } /^$/ { body = 1 }' "$f" | cut -c1-110)"
  done
  echo "lc-request: $n item(s) in the inbox; the owner starts the bundle with --batch" >&2
  exit 0
fi

if [ "$mode" = collect ]; then
  if [ ${#text[@]} -eq 0 ] && [ -z "$path" ]; then
    echo "lc-request: pass a requirement, --file <path>, --batch, --list or --resume <NNN> (see --help)" >&2
    exit 1
  fi
  item="$INBOX/$(date +%Y%m%d-%H%M%S)-$$.md"
  {
    echo "from: $from"
    echo "dir: $CALLER"
    echo "date: $(date '+%Y-%m-%d %H:%M')"
    if [ -n "$path" ]; then echo "file: $path"; fi
    echo
    if [ ${#text[@]} -gt 0 ]; then echo "${text[*]}"; fi
  } > "$item"
  n=$(inbox_items | wc -l | tr -d ' ')
  echo "lc-request: collected as $(basename "$item" .md); $n item(s) in the inbox. Nothing runs until the owner starts the bundle (scripts/lc-request.sh --batch); its release names this requirement. Urgent, because a consumer is blocked: --now."
  exit 0
fi

claude_bin="$(command -v claude)" || { echo "lc-request: Claude Code (claude) is not installed" >&2; exit 1; }

add_dirs=()
add_dir() { case " ${add_dirs[*]-} " in *" $1 "*) ;; *) add_dirs+=("$1") ;; esac; }
if [ "$CALLER" != "$REPO" ]; then add_dir "$CALLER"; fi
if [ "$mode" = batch ]; then
  [ -n "$(inbox_items)" ] || { echo "lc-request: the inbox is empty; nothing to run" >&2; exit 0; }
  args="--batch (the bundle is built on its turn)"
elif [ -n "$resume" ]; then
  args="--resume $resume"
  if [ ${#text[@]} -gt 0 ]; then args="$args ${text[*]}"; fi
elif [ -n "$path" ]; then
  args="$path --from $from"
  if [ ${#text[@]} -gt 0 ]; then args="$args ${text[*]}"; fi
elif [ ${#text[@]} -gt 0 ]; then
  args="${text[*]} --from $from"
else
  echo "lc-request: --now needs a requirement or --file <path> (see --help)" >&2
  exit 1
fi

# One run at a time: two runs in one working tree switch branches under each other and take the
# same version. The running pipeline holds tmp/lc-request/lock with the id of its Claude process
# (exec below keeps this script's id); an interactive /lc-request takes and frees the same lock.
# A later call waits with a ticket in tmp/lc-request/queue/, oldest first.

# A process id counts only while it still runs the expected command: ids get reused.
running() { [ -n "$1" ] && ps -p "$1" -o args= 2>/dev/null | grep -E -- "$2" >/dev/null; }
holder() { sed -n 's/^pid=\([0-9][0-9]*\).*/\1/p' "$LOCK" 2>/dev/null || true; }
first_ticket() {
  local t
  for t in $(ls "$QUEUE" | sort -n); do
    if running "${t#*-}" lc-request.sh; then echo "${t#*-}"; return; fi
    rm -f "$QUEUE/$t"
  done
}

ticket="$QUEUE/$(date +%s)-$$"
: > "$ticket"
trap 'rm -f "$ticket"' EXIT
trap 'exit 130' INT TERM HUP
said=""
while :; do
  if ! running "$(holder)" 'claude|lc-request\.sh' && [ "$(first_ticket)" = "$$" ]; then
    rm -f "$LOCK"
    (set -C; echo "pid=$$ since=$(date '+%Y-%m-%d %H:%M') run=/lc-request $args" > "$LOCK") 2>/dev/null && break
  fi
  now="$(cat "$LOCK" 2>/dev/null || true)"
  if [ -n "$no_wait" ]; then
    echo "lc-request: another request is running (${now:-starting}); not queued (--no-wait)" >&2
    exit 75
  fi
  if [ "$now" != "$said" ]; then
    ahead=$(( $(ls "$QUEUE" | sort -n | sed "/-$$\$/,\$d" | wc -l) ))
    echo "lc-request: another request is running (${now:-starting}); queued with $ahead call(s) ahead, checking every 30 s" >&2
    said="$now"
  fi
  sleep 30
done
rm -f "$ticket"
trap - EXIT INT TERM HUP
[ -n "$said" ] && echo "lc-request: our turn, starting" >&2

# The bundle: every item in the inbox now (also those collected while this call waited), oldest
# first, in one requirement file. The items move next to it, so the inbox starts empty again.
if [ "$mode" = batch ]; then
  items=($(inbox_items))
  if [ ${#items[@]} -eq 0 ]; then
    rm -f "$LOCK"
    echo "lc-request: the inbox is empty; nothing to run" >&2
    exit 0
  fi
  stamp="$(date +%Y%m%d-%H%M%S)"
  bundle="$BUNDLES/$stamp.md"
  mkdir -p "$BUNDLES/$stamp"
  {
    echo "# Bundle of ${#items[@]} collected requirements"
    echo
    echo "Started by the owner on $(date '+%Y-%m-%d %H:%M'): one request and one version for all items. Each item keeps its requester (from:), its directory (dir:) and its date."
    i=0
    for f in "${items[@]}"; do
      i=$((i + 1))
      echo
      echo "## Item $i ($(basename "$f" .md))"
      echo
      cat "$f"
    done
  } > "$bundle"
  for f in "${items[@]}"; do
    d="$(sed -n 's/^dir: //p' "$f" | head -n 1)"
    if [ -n "$d" ] && [ "$d" != "$REPO" ] && [ -d "$d" ]; then add_dir "$d"; fi
    mv "$f" "$BUNDLES/$stamp/"
  done
  args="$bundle --from bundle"
  echo "pid=$$ since=$(date '+%Y-%m-%d %H:%M') run=/lc-request $args" > "$LOCK"
  echo "lc-request: running ${#items[@]} collected item(s) as one request ($bundle)" >&2
fi

# The Bash rules (gates, git, the push of main, the publish pipeline) come from .claude/settings.json.
allowed=(Read Grep Glob Edit Write Agent SendMessage)

flags=(-p "/lc-request $args --headless" --permission-mode acceptEdits --allowedTools "${allowed[@]}")
if [ ${#add_dirs[@]} -gt 0 ]; then
  for d in "${add_dirs[@]}"; do flags+=(--add-dir "$d"); done
fi
[ -n "$budget" ] && flags+=(--max-budget-usd "$budget")

cd "$REPO"
# A caller's Claude Code session (another Nx workspace) exports its own root; Nx would look there for angular-ui-kit.
unset NX_WORKSPACE_ROOT_PATH
# The gates need Node 24, as in CI (.nvmrc); a caller's PATH may put an older Node first.
# Only for the run, so the script itself keeps finding the caller's claude.
node24="$(ls -d "$HOME"/.nvm/versions/node/v24.*/bin 2>/dev/null | sort -V | tail -n 1 || true)"
run_path="$PATH"
[ -n "$node24" ] && run_path="$node24:$PATH"
PATH="$run_path" exec "$claude_bin" "${flags[@]}"
