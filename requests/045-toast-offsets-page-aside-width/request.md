# Request 045: Toast offsets in the app shell, reserved aside column, wide page content

- **From:** bundle (life-os)
- **Received:** 2026-11-03
- **Gap IDs:** AS-34, AS-35, AS-36
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/app-shell-round-11/docs/ux/concepts/app-shell.md (§5.3 'Toasts (round 11)', 'One frame for every page', rule 3 'Wide page'; §7.1 AS-34, AS-35, AS-36; canvas boards 15, 16, 18, 24, 25, 26, 27)
- **Kit version at intake:** 3.27.2
- **Bundle file:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/tmp/lc-request/bundles/20261103-184623.md

## Requirement (verbatim)

# Bundle of 3 collected requirements

Started by the owner on 2026-11-03 18:46: one request and one version for all items. Each item keeps its requester (from:), its directory (dir:) and its date.

## Item 1 (20261103-124351-6900)

from: life-os
dir: /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/app-shell-round-11
date: 2026-11-03 12:43

AS-34 (app shell round 11, approved 2026-11-03, D15 = A): lc-toast-outlet: bottom positions sit above --lc-app-shell-bottom-clearance and the safe-area inset, and top positions below lc-header (or a documented offset input), so a toast never covers the header, the page title or the floating bottom bar on a 360 px phone; story at 360 px inside lc-app-shell with the floating bar. Not blocking (WCAG 2.4.11, 1.4.4). Source: docs/ux/concepts/app-shell.md 5.3 'Toasts (round 11)', 7.1 AS-34; canvas boards 26 and 27.

## Item 2 (20261103-124351-6914)

from: life-os
dir: /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/app-shell-round-11
date: 2026-11-03 12:43

AS-35 (app shell round 11, approved 2026-11-03, D14 = A): lc-app-page: an input (e.g. reserveAside) that keeps the aside column's width, tint and hairline from 1280 px with no content and no landmark (aria-hidden), so every page has the same column. Today lc-app-shell / lc-app-page docks the aside only when asideLabelledby or asideAriaLabel names it, so a page without aside content is centred in a wider space and its column jumps. Not blocking. Source: docs/ux/concepts/app-shell.md 5.3 'One frame for every page', 7.1 AS-35; canvas boards 15, 16, 18, 24.

## Item 3 (20261103-124351-6928)

from: life-os
dir: /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/app-shell-round-11
date: 2026-11-03 12:43

AS-36 (app shell round 11, approved 2026-11-03, D14 = A): lc-app-page: a contentWidth input (default, wide); wide keeps the default column's left edge and extends the content into the aside column up to 928 px of content, with the aside's tint hidden; below 1280 px nothing changes. Used by one page in F1 (the account page with its table). Not blocking. Source: docs/ux/concepts/app-shell.md 5.3 rule 3 'Wide page', 7.1 AS-36; canvas boards 24, 25.
