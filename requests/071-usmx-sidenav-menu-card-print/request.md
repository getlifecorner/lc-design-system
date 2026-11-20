# Request 071: USM X sidenav, menu, card and badge gaps, toggle-group touch target, print rules for header and app shell, all backlog rows

- **From:** bundle (finance-intelligence, usm-x, owner)
- **Received:** 2026-11-20
- **Gap IDs:** finance-intelligence vertraege-prove-2026-11-19 row 2, app-shell-2026-11-20 row 1; usm-x 2026-11-17 rows 74–86; backlog 054-n2, 068-n1, 068-n3, 069-n1, 069-n2
- **Referenced files:**
  - /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/vertraege-prove-2026-11-19.md
  - /Users/eric/Documents/Projekte/usm/usm-x/frontend/kit-gaps/2026-11-17-lifecorner-kit.md
  - /Users/eric/Documents/Projekte/usm/finance-intelligence/.claude/worktrees/022-cockpit-report/docs/ux/gaps/app-shell-2026-11-20.md
  - /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/BACKLOG.md
- **Kit version at intake:** 3.49.1
- **Bundle file:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/tmp/lc-request/bundles/20261120-124358.md

## Requirement (verbatim)

### Item 1 (20261119-110045-63630)

from: finance-intelligence
dir: /Users/eric/Documents/Projekte/usm/finance-intelligence
date: 2026-11-19 11:00
file: /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/vertraege-prove-2026-11-19.md

row 2 (vertraege-prove-2026-11-19): lc-toggle-group has no size or input for a 44 px touch target; even lg renders 38 px on a 360 px phone. Function only, look of sm/md/lg unchanged (ADR-0009).

### Item 2 (20261119-140248-91066)

from: usm-x
dir: /Users/eric/Documents/Projekte/usm/usm-x
date: 2026-11-19 14:02
file: /Users/eric/Documents/Projekte/usm/usm-x/frontend/kit-gaps/2026-11-17-lifecorner-kit.md

Rows 74-85 only, found adopting kit 3.49.1 in usm-x (rows 38-73 are adopted): lc-sidenav collapsed keeps no top slot or per-item icon and the brand cannot toggle the rail (74), brand logo forced into a square tile (75), a cut label with a kit tooltip shows its full text nowhere (76), lc-menu has no inline mode and no control row (77), MenuItem has no current/busy state, one nesting level, no badge variant (78), lc-split-button passes no maxHeight/ariaLabel to its menu (79), MenuItem takes no id or data attributes (80), lc-avatar square takes no initials (81), sortable head reserves arrow space on unsorted heads with no hook (82), lc-badge maxWidth cuts the end instead of one marked run (83), lc-menu Enter does not preventDefault (84), muted lc-tab takes normal ink on hover (85).

### Item 3 (20261119-150647-15044)

from: usm-x
dir: /Users/eric/Documents/Projekte/usm/usm-x
date: 2026-11-19 15:06
file: /Users/eric/Documents/Projekte/usm/usm-x/frontend/kit-gaps/2026-11-17-lifecorner-kit.md

Row 86 only, in addition to rows 74-85 collected earlier today: lc-card's head never wraps and its action box never shrinks, so a search in card-header-action covers the title on a phone (390 px). Wanted: the action on a line of its own under the title on a narrow card, or a hook for the head's wrap.

### Item 4 (20261120-075735-867)

from: finance-intelligence
dir: /Users/eric/Documents/Projekte/usm/finance-intelligence
date: 2026-11-20 07:57
file: /Users/eric/Documents/Projekte/usm/finance-intelligence/.claude/worktrees/022-cockpit-report/docs/ux/gaps/app-shell-2026-11-20.md

row 1 (app-shell-2026-11-20): lc-header and lc-app-shell have no print rule; lc-sidenav and lc-bottom-nav already hide in @media print, but the header still prints and lc-app-shell keeps the bottom bar's clearance (about 112 px) and its background image, so a page cannot print as content only on one A4 sheet. A function in print only, no new look and nothing changes on screen (ADR-0009). Found in the UX concept change of finance-intelligence for spec 022 (monthly report), approved 2026-11-20.

### Item 5 (20261120-124358-backlog-all)

from: owner
dir: /Users/eric/Documents/Projekte/life-cockpit/lc-design-system
date: 2026-11-20

All 5 rows of requests/BACKLOG.md (as of 2026-11-20): 054-n2, 068-n1, 068-n3, 069-n1, 069-n2. Owner decision 2026-11-20: everything in this bundle ships as one version: usm-x rows 74-86, finance-intelligence vertraege-prove-2026-11-19 row 2 and app-shell-2026-11-20 row 1, and these backlog rows. The about-8-items bundle limit does not apply, so do not split the bundle or return anything to the inbox. 054-n2 stays in the backlog if WebKit cannot check it here. Details per row in requests/BACKLOG.md.
