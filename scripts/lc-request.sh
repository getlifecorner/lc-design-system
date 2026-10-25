#!/usr/bin/env bash
# Starts the design-system agent pipeline (/lc-request) headless from any directory,
# typically from a consuming project or its Claude Code session:
#
#   ../lc-design-system/scripts/lc-request.sh "lc-hero needs a media slot (G-13), see docs/ux/concepts/website-v0.md"
#   ../lc-design-system/scripts/lc-request.sh --file docs/ux/gaps/g-40.md
#   ../lc-design-system/scripts/lc-request.sh --resume 004 "1: option A. 2: yes."
#
# Options:
#   --file <path>     the requirement is in this file (relative to the calling directory)
#   --from <name>     the requesting project (default: the calling directory's name)
#   --resume <NNN>    continue an open request; text after it answers its questions
#   --budget <usd>    stop the run at this estimated cost
#   --no-wait         if another request is running, report it and exit with 75 instead of waiting
#
# One request runs at a time. While another one runs, the call waits in a queue (first come,
# first served) and starts on its turn, so run it in the background (it can wait for hours).
# A request that passes review and every gate is released without asking (its tag starts the
# publish pipeline); the npm stage still needs the owner's 2FA approval to become public.
# The calling directory is readable for the run (--add-dir), so referenced files resolve.
# Output: the pipeline's final message (released version and usage, or open questions).
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CALLER="$PWD"
from=""
file=""
resume=""
budget=""
no_wait=""
text=()

while [ $# -gt 0 ]; do
  case "$1" in
    --file) file="$2"; shift 2 ;;
    --from) from="$2"; shift 2 ;;
    --resume) resume="$2"; shift 2 ;;
    --budget) budget="$2"; shift 2 ;;
    --no-wait) no_wait=1; shift ;;
    -h | --help) sed -n '2,21p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) text+=("$1"); shift ;;
  esac
done

command -v claude >/dev/null || { echo "lc-request: Claude Code (claude) is not installed" >&2; exit 1; }

if [ -z "$from" ]; then
  if [ "$CALLER" = "$REPO" ] || [[ "$CALLER" == "$REPO"/* ]]; then from="owner"; else from="$(basename "$CALLER")"; fi
fi

if [ -n "$resume" ]; then
  args="--resume $resume"
  [ ${#text[@]} -gt 0 ] && args="$args ${text[*]}"
elif [ -n "$file" ]; then
  [ -r "$CALLER/$file" ] || [ -r "$file" ] || { echo "lc-request: cannot read $file" >&2; exit 1; }
  path="$(cd "$CALLER" && cd "$(dirname "$file")" && pwd)/$(basename "$file")"
  args="$path --from $from"
  [ ${#text[@]} -gt 0 ] && args="$args ${text[*]}"
elif [ ${#text[@]} -gt 0 ]; then
  args="${text[*]} --from $from"
else
  echo "lc-request: pass a requirement, --file <path> or --resume <NNN> (see --help)" >&2
  exit 1
fi
args="$args --headless"

# The Bash rules (gates, git, the push of main, the publish pipeline) come from .claude/settings.json.
allowed=(Read Grep Glob Edit Write Agent SendMessage)

flags=(-p "/lc-request $args" --permission-mode acceptEdits --allowedTools "${allowed[@]}")
[ "$CALLER" != "$REPO" ] && flags+=(--add-dir "$CALLER")
[ -n "$budget" ] && flags+=(--max-budget-usd "$budget")

# One run at a time: two runs in one working tree switch branches under each other and take the
# same version. The running pipeline holds tmp/lc-request/lock with the id of its Claude process
# (exec below keeps this script's id); an interactive /lc-request takes and frees the same lock.
# A later call waits with a ticket in tmp/lc-request/queue/, oldest first.
STATE="$REPO/tmp/lc-request"
LOCK="$STATE/lock"
QUEUE="$STATE/queue"
mkdir -p "$QUEUE"

# A process id counts only while it still runs the expected command: ids get reused.
running() { [ -n "$1" ] && ps -p "$1" -o args= 2>/dev/null | grep -- "$2" >/dev/null; }
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
  if ! running "$(holder)" claude && [ "$(first_ticket)" = "$$" ]; then
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

cd "$REPO"
# A caller's Claude Code session (another Nx workspace) exports its own root; Nx would look there for angular-ui-kit.
unset NX_WORKSPACE_ROOT_PATH
exec claude "${flags[@]}"
