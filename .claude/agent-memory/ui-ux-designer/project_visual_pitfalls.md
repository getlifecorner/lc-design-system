---
name: project-visual-pitfalls
description: Stories that are not hash-stable for --compare, and story-grid width pitfalls at 360 px
metadata:
  type: project
---

- Not hash-stable (checked 2026-11-02 with two runs on the same build): `data-display-logviewer--{default,terminal,with-ansi-colors,errors-only,flex-parent,large-buffer}`, because their stories use `new Date()` timestamps. `--streaming` was stable, and so are `--app-registers-no-icons` (fixed dates) and all NC stories (034 re-run 120/120); `components-chat--with-diff-viewer` is not stable (clock times). Review them by `--measure`, and ask for fixed timestamps in new log-viewer stories.
- Stable: search-input, the icon stories (except inline-set and icon-constants when the set changes), code-block, copy-field, kanban, treeview, filter-bar, input with-icon, empty-state no-results, list with-disabled.
- `layout-app-shell--today-loading` at 360 **dark** is timing-sensitive: a `--measure` that waits (2 rAF) or injects a `<style>` shifts the frame, so it differs from a shot without one (all shifted shots are byte-identical; light and the other widths are stable; 032). To prove a change hash-neutral, re-shoot with a wait-only measure (no CSS) and `cmp` both: equal bytes = timing, not the change.
- Icon size grids (label + 16/20/24/32/40 px) overflow 328 px at 360 with a 24 px column gap; use an 8 px gap and labels of at most 18 monospace characters.

**Why:** a hash diff on an unstable story wastes a shot opening in review.
**How to apply:** do a quick stability re-run when capturing baselines (`--compare` against the fresh baseline).
