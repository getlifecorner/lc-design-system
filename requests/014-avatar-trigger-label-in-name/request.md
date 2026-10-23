# Request 014: lc-header avatar trigger fails Label in Name (WCAG 2.5.3) under axe-core 4.14

- **From:** life-os
- **Received:** 2026-10-23
- **Gap IDs:** AS-33
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/life-os/docs/ux/concepts/app-shell.md (gap table, row AS-33, line 856)
- **Kit version at intake:** 3.11.3

## Requirement (verbatim)

Invocation (`/lc-request … --from life-os … --headless`):

> /Users/eric/Documents/Projekte/life-cockpit/life-os/docs/ux/concepts/app-shell.md --from life-os AS-33: lc-header's avatar trigger fails WCAG 2.5.3 Label in Name under axe-core 4.14 (label-content-name-mismatch, now in wcag21a): it shows the member's initials from a decorative lc-avatar while its accessible name is userMenuAriaLabel ('Menu for <name>'), which doesn't contain them. Fix it in the kit so the trigger's name contains what it shows, check every place a decorative lc-avatar sits inside a control that names itself, and run the kit's axe checks on axe-core 4.14. life-os holds @axe-core/playwright 4.14 back until this release.

The referenced file narrowed to AS-33 (gap table header at line 779: `| ID | Owner concept | Blocks F1 | Proposal (one line) | Merged here |`), row verbatim:

| AS-33 | app shell (Dependabot #32 CI, axe-core 4.14, 2026-10-23; owner: kit request now) | no (WCAG 2.5.3 Label in Name) | `lc-header`'s avatar trigger (`userMenuTrigger="avatar"`, AS-2): the button shows the member's initials (a `decorative` `lc-avatar`, e.g. „JM“), but its accessible name is `userMenuAriaLabel` („Menü für Johanna Müller“ / "Menu for Johanna Müller"), which doesn't contain them, so a voice-control user can't say what they see. axe-core 4.14 runs `label-content-name-mismatch` under `wcag21a` (no longer experimental) and fails it on every page with the header (54 phone tests on #32). Proposal: the trigger's accessible name contains the text it shows, and the same holds wherever a `decorative` `lc-avatar` sits inside a control that names itself; the kit's own axe check on 4.14, light and dark, EN and DE names | open: `@axe-core/playwright` 4.14 is held back in `.github/dependabot.yml` until the kit closes it; lift the hold with the kit bump |
