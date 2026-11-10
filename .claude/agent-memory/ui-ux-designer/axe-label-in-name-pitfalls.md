---
name: axe-label-in-name-pitfalls
description: How axe-core 4.14 label-content-name-mismatch treats hidden text, svg images and whitespace in lc-design-system tiles; probe technique via story-shots
metadata:
  type: project
---

Measured in the browser on kit 3.22.0 (request 031, 2026-11-02):
- axe 4.14 `label-content-name-mismatch` ignores visually hidden (sr-only, clipped) text; an sr-only space separates nothing.
- It counts an `svg role="img"` name (lc-sparkline's "Sparkline: N points, …") as content of a clickable card.
- A plain `" "` text node between flex items passes and is not rendered (Δ height 0). Write it `&ngsp;` (kit pattern); never `&nbsp;` (forms an anonymous flex item, visible).
- `lc-card` `clickable` has no booleanAttribute transform: bind `[clickable]="true"`.
- 057 (3.37): `lc-card` with a `title` glues title and body in the DOM („Starteraus USM …“); the rule then fails a correctly spaced `aria-label` and passes the glued one, although `axe.commons.text.subtreeText` returns the spaced text. Judge by running the rule (`runOnly`), never by subtreeText. Probe: `tmp/story-shots/057/r1-f4c` on *Clickable*.

**Why:** these decide markup options for "Label in Name" fixes without guessing.
**How to apply:** test markup options before designing: `story-shots --measure` may mutate the DOM (wrap in role=button, insert nodes), then `--axe=wcag21a` runs on the result. See [[story-shots-usage]].
