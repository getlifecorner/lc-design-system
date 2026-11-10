---
name: kit-gates-and-session-quirks
description: lc-design-system session limits (rooted outside the repo, Node version, WebKit) that decide what a run can do
metadata:
  type: project
---

- Session rooted outside the repo (dispatched from another project): the repo's allowlist doesn't apply; `git`, `mkdir`, `>` redirects get refused. Check one git command first; if refused, do the work, write `tmp/<NNN>/msg.txt`, hand off to owner (031).
- Node on the PATH changes between sessions (v23.10 broke compat prerender in 034; v24 works). Record an environmental compat failure as blocked, not as a kit bug.
- No Playwright/WebKit in `node_modules` (checked 2026-11-07 and 2026-11-10; the browser cache is outside the session's folders): WebKit checks (054-n2) stay in BACKLOG; Chromium `HTMLElement.click()` without focus stands in for a WebKit tap.

**Why:** these decide whether a gate can run at all.
**How to apply:** check them at the start of a run; say "blocked" with the reason instead of retrying.
