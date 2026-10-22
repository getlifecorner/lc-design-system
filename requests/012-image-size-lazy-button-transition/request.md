# Request 012: Intrinsic image size and lazy loading for logo, character and avatar, and a narrower button transition

- **From:** life-os
- **Received:** 2026-10-23
- **Gap IDs:** G-38, G-39, G-40, G-41 (owner: kit first, 2026-10-23)
- **Referenced files:**
  - /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/website-v0/docs/ux/concepts/website-v0.md (section 7, gap table: G-38 at line 915, G-39 at line 916, G-40 at line 917, G-41 at line 918; budget rules in §13)
- **Kit version at intake:** 3.11.1 (release commit `3974660` on `main`; the tag `v3.11.1` was not yet pushed at intake)

## Requirement (verbatim)

Invocation text (after the file path):

> G-38, G-39, G-40 and G-41 only (section 7, gap table; owner: kit first, 2026-10-23). The website budget checks require every <img> to carry width and height and every below-fold image to be loading=lazy. G-38: lc-logo renders both lockup <img>s without width/height; write them from the built-in file per size, inputs for a custom src. G-39: lc-character needs a loading input ('eager' | 'lazy', default eager) on both theme images. G-40: lc-avatar <img> needs width/height from size and the same loading input. G-41: .btn has transition: all, so buttons inside lc-next-step-card grow for ~150 ms on first layout; transition only color, background-color, border-color, box-shadow. Release as a patch after 3.11.1 (request 011), do not hold 3.11.1 back. --headless

Gap rows from `website-v0.md` §7 (columns: gap · what the website needs · interim):

| Gap | Need | Interim |
|---|---|---|
| **G-38** `lc-logo` `<img>` without intrinsic size (new in the build, 2026-10-23; owner: kit first) | `lc-logo` (inside `lc-header`) renders both lockup `<img>`s without `width` and `height`, so the browser cannot reserve their space before the SVG loads (budget rule "every `<img>` with `width` and `height`", §13). Proposal: write `width`/`height` from the built-in file's aspect ratio per size (lockup 485 : 100), and inputs for them when a custom `src` is set | none: the budget check stays red until the kit ships it |
| **G-39** `lc-character` has no `loading` input (new in the build, 2026-10-23; owner: kit first) | Edu above the horizon sits below the fold on every page but loads eagerly (budget rule "below-fold images lazy", §13); the `<img>`s already carry `width`, `height`, `decoding="async"` and `fetchpriority="low"`. Proposal: `loading: 'eager' \| 'lazy'` (default `eager`), applied to both theme images | none: the budget check stays red until the kit ships it |
| **G-40** `lc-avatar` `<img>` without intrinsic size or `loading` (new in the build, 2026-10-23; owner: kit first) | the how-we-build person card's photo has no `width`/`height` and loads eagerly below the fold (§13). Proposal: `width`/`height` from `size` (`lg` = 48), plus a `loading` input as in G-39 | none: the budget check stays red until the kit ships it |
| **G-41** `.btn` animates every property (new in the build, 2026-10-23; owner: kit first) | the kit's `.btn` has `transition: all`; inside `lc-next-step-card` the first layout starts it, so the CTA buttons grow for about 150 ms on every load (padding, font size, colours) and the page height depends on timing (measured: +22 to +84 px). Proposal: transition only `color`, `background-color`, `border-color` and `box-shadow` | page-level `transition: none` on the CTA buttons, labelled `G-41` |
