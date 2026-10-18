# Request 005: Edu's character poses as kit assets (G-4)

- **From:** life-os (headless run, `--from life-os`)
- **Received:** 2026-10-18
- **Gap IDs:** G-4 (app part and website part)
- **Referenced files:**
  - /Users/eric/Documents/Projekte/life-cockpit/life-os/docs/ux/concepts/app-shell.md (§7.2 "G-4, app part: what the kit must deliver for Edu", line 881; G-4 row in §7.1, line 842; owner decision D10)
  - /Users/eric/Documents/Projekte/life-cockpit/life-os/docs/ux/concepts/website-v0.md (G-4 row in the gap register, line 896; colours line 1140)
  - /Users/eric/Documents/Projekte/life-cockpit/life-os/docs/brand/character/ (the approved SVG drawings; README.md has the pose table and the dark rule)
- **Kit version at intake:** 3.7.0

## Requirement (verbatim)

/Users/eric/Documents/Projekte/life-cockpit/life-os/docs/ux/concepts/app-shell.md --from life-os G-4 only: Edu's character poses as kit assets. The app part is specified in full in section 7.2 of this file: poses, sizes with a size input and the --lc-character-size hook, light and dark plus a forced on-dark drawing, static files at a stable package path, an SVG string export for inlining at build time, an optional component in its own secondary entry point, decorative by default, intrinsic 100 x 100, the .lc-horizon figure slot, and proof. The website part is the G-4 row in docs/ux/concepts/website-v0.md (calm, Hallo on-dark in both modes, sizes 48/64/96). Owner decision D10 (app-shell 1.x/7.2): static files plus an optional component in its own secondary entry point, not an lc-logo variant, so lc-header and lc-logo stay light. The approved drawings are SVG files in docs/brand/character/; its README has the pose table and the dark rule. The drawn dark pairs are authoritative; the other dark drawings follow the rule. Required now: the eight F1 app poses (hello, shows-the-way, happy, welcomes-member, resting, in-his-corner, comforts, all-done) and calm. The later poses in that folder (connects, discovered, thinking, connection-paused, see-you) may ship in the same set. The post-only poses (peeks-around-corner, amazed, looks-ahead) stay out. Not blocking: the pages work without the figure.
