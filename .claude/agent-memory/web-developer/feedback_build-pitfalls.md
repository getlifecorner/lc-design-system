---
name: feedback-build-pitfalls
description: Traps hit while building kit changes (Jest fakes, compat/CSP fixtures, Storybook, entry graph, SCSS specs, flex layout in lc-header, API breaks via model())
metadata:
  type: feedback
---

- **Jest:** a fake `window.trustedTypes` must pass `angular*` policies through (JIT). `lc-icon` names outside the inline set are fetched: register a fake glyph (`provideLcIcons`). An `@if` around a projected element projects its anchor (empty-slot tests need a host without it). Host `[class]`/`[style]` order differs: compare sorted. A header without `homeHref` needs `provideRouter([])`. jsdom: `:empty` ignores Angular's comment anchors; global RO is a no-op stub (swap `global.ResizeObserver` per test, `await fixture.whenStable()` runs `afterNextRender`).
- **Compat fixtures:** no kit `<div>` inside `<p>` (NG0502). Strict CSP only in the template's `csp` config. Empty attrs are bare on 21/22.0, `=""` on 22.2 (`emptyAttr()`; run `--only=22.0` for a new HTML check). Component CSS is inlined per page with spaces kept (`max( calc(…)) ,`): use `\s*` and name the page.
- **Storybook:** story `applicationConfig` providers win over preview's. A story `<style>` is Emulated: `::ng-deep html:has(#storybook-root [data-x="200%"]) { font-size: 200% }` raises the root text. Stories-only edits: `build-storybook --skip-nx-cache`.
- **Entry graph:** `import type` and `import()` count as entry deps (cycles); `from '@lifecorner/…'` in comments trips `entries.spec.ts`.
- **Specs on SCSS text** break when rules move; new tests go in `<name>.<topic>.spec.ts`. `test:tools` needs story templates as top-level helpers with defaults, not method calls.
- **API break trap:** `x = model()` replacing `xChange = output()` drops the class member; keep `readonly xChange: OutputRef<T> = this.x`.
- **Flex rows that must stay pixel-identical (request 009, lc-header):** a `min-height` on an item holding an `<img>` re-centres it and resamples the logo sub-pixel; put the row's min-height on a zero-width sibling. Border-box `min-height` 64 with a 1 px border → item min-height 63. A wrapped group centring its items needs `align-self: stretch`. An `::after` with flex-shrink 1000 collapses whenever any sibling overflows. Line breaking uses outer hypothetical sizes, so a negative inline margin on a child is the only way to take a gap off a `min-content` basis. Probing `flex:none; width:min-content` on an item of a wrapping row returned the grown size: trust the arithmetic or the shot diff.
- **Misc:** headless Chrome in CI needs `--no-sandbox` when `CI` is set. `lc-skeleton` % widths compound (wrap it). Writing `﻿` via file tools gives a literal BOM (lint). In `<pre>` write control flow without whitespace. Regex attr parsers: names have digits (`x1`); count tags.
- **Designer's cause hypotheses can be wrong:** measure first (009: bar overflow was the page's scroll, not item min-content); record the refutation as a deviation.

**Why:** none of these show in the code; each first looked like a kit regression.
**How to apply:** check before debugging a fixture, story or shot diff; add new traps here.

Related: [[reference-gates-and-measuring]]
