---
name: project-visual-pitfalls
description: Stories that are not hash-stable for --compare, and story-grid width pitfalls at 360 px
metadata:
  type: project
---

- Not hash-stable (checked 2026-11-02 with two runs on the same build): `data-display-logviewer--{default,terminal,with-ansi-colors,errors-only,flex-parent,large-buffer}`, because their stories use `new Date()` timestamps. `--streaming` was stable, and so are `--app-registers-no-icons` (fixed dates) and all NC stories (034 re-run 120/120); `components-chat--with-diff-viewer` is not stable (clock times). Review them by `--measure`, and ask for fixed timestamps in new log-viewer stories.
- Stable: search-input, the icon stories (except inline-set and icon-constants when the set changes), code-block, copy-field, kanban, treeview, filter-bar, input with-icon, empty-state no-results, list with-disabled.
- `layout-app-shell--today-loading` at 360 **dark** is timing-sensitive: a `--measure` that waits (2 rAF) or injects a `<style>` shifts the frame, so it differs from a shot without one (all shifted shots are byte-identical; light and the other widths are stable; 032). To prove a change hash-neutral, re-shoot with a wait-only measure (no CSS) and `cmp` both: equal bytes = timing, not the change.
- `layout-app-shell--full-height-nav` is not hash-stable (045, 3.27.2–3.28): 4–6 of its 10 shots (360–1920 L/D) differ per run, a different set each time (sidenav icon pixels at x 17–21 / 34–38). Exclude it from "N/N identical" claims or re-run it once to show the set moves.
- `navigation-sidenav--drawer-mode` 1280 **dark** (050 r1): baseline differs from 3 later re-shoots that are byte-equal to each other, with an unchanged DOM (close button auto-focused at open). Also flaky: sidenav sidebar-first-layout 1024/1280, prominent-brand 1024/1280 L, collapsed-rail-badges 360. Shots taken after a `.focus()`/`.blur()` pass in `--measure` differ in bytes from at-rest shots (floating bar, sidenav at 1024+) with no computed-style change: keep focus passes out of compare runs.
- Icon size grids (label + 16/20/24/32/40 px) overflow 328 px at 360 with a 24 px column gap; use an 8 px gap and labels of at most 18 monospace characters.

**Why:** a hash diff on an unstable story wastes a shot opening in review.
**How to apply:** do a quick stability re-run when capturing baselines (`--compare` against the fresh baseline).
