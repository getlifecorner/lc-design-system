# Request 050: overlay panel language (select, menu, tooltip, popover); lc-bottom-nav moreBadge, lc-sidenav badgeAriaLabel

- **From:** bundle (owner, finance-intelligence)
- **Received:** 2026-11-05 (bundle tmp/lc-request/bundles/20261105-133712.md, started 13:37)
- **Gap IDs:** 049-f1 (owner follow-up); stammdaten-2026-11-05 rows 1, 2 (finance-intelligence)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/049-overlay-panel-lang/release.md (Open items); /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/stammdaten-2026-11-05.md (rows 1–2)
- **Kit version at intake:** 3.30.2

## Requirement (verbatim)

### Item 1 (20261105-001300-follow-ups-049)

- **From:** owner · **dir:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system · **date:** 2026-11-05 00:13

Follow-ups 049-f1 of request 049: the `lc-select` listbox (and probably `lc-menu`, `lc-tooltip`, `lc-popover`, not measured) renders under `<body>` without the host's `lang`, so German texts are marked as the page's `en` (WCAG 3.1.2, should-fix, pre-existing), apply `closestLang` per overlay; details in requests/049-overlay-panel-lang/release.md Open items.

### Item 2 (20261105-133412-84191)

- **From:** finance-intelligence · **dir:** /Users/eric/Documents/Projekte/usm/finance-intelligence · **date:** 2026-11-05 13:34
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/stammdaten-2026-11-05.md

rows 1–2 (stammdaten-2026-11-05.md): lc-bottom-nav needs a moreBadge input so the kit-made 'More' entry can carry a badge (read via badgeAriaLabel); lc-sidenav needs badgeAriaLabel like lc-bottom-nav so a badge gets an accessible name. Functions only, no look change (ADR-0009). Consumer: Finance Intelligence spec 010, navigation counter 'Offene Zuordnungen'.
