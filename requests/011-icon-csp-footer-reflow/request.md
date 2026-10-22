# Request 011: lc-icon without inline styles, and footer sections at 320 px with 200 % text

- **From:** life-os
- **Received:** 2026-10-22
- **Gap IDs:** G-37 (blocking for the website build), G-36
- **Referenced files:**
  - /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/website-v0/docs/ux/concepts/website-v0.md (section 7, gap table: G-36 at line 913, G-37 at line 914)
- **Kit version at intake:** 3.11.0

## Requirement (verbatim)

Invocation text (after the file path):

> G-37 and G-36 only (section 7, gap table). G-37 is blocking for the website build: lc-icon must render without any style attribute (size via the icon-<size> classes, colour via currentColor in CSS), because the website ships under CSP style-src 'self' without unsafe-inline or hashes. G-36: lc-footer section grid minmax(10rem, 1fr) overflows at 320 px with 200 % text; use a minimum that cannot exceed the container. --headless

Gap rows from `website-v0.md` §7 (columns: gap · what the website needs · interim):

| Gap | Need | Interim |
|---|---|---|
| **G-36** Footer sections at 320 px with 200 % text (new in the build, 2026-10-22) | `lc-footer`'s section grid uses `minmax(10rem, 1fr)`, so at 320 px with 200 % text the page scrolls sideways (WCAG 1.4.10). Proposal: a minimum that cannot exceed the container (e.g. `minmax(min(10rem, 100%), 1fr)`) | page-level rule, labelled `G-36` |
| **G-37** `lc-icon` writes inline styles (new in the build, 2026-10-22; **blocking**, owner: kit first) | `lc-icon` binds `[style.width]` and `[style.height]` on `.icon-container` and sets `style.color` on the SVG, so every prerendered icon (the next-step card's eye and home bubble on every page) carries `style=""` attributes; the website's CSP is `style-src 'self'` without `unsafe-inline` or hashes (plan W4). Proposal: size icons through the existing `icon-<size>` classes (or a CSS custom property set by a class) and leave the colour to `currentColor` in the stylesheet, so `lc-icon` renders without any `style` attribute | none: the build check stays red until the kit ships it |
