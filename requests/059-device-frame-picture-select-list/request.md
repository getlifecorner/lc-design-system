# Request 059: lc-device-frame and lc-picture, lc-select clearable, lc-description-list total whitespace, lc-list item ariaLabel

- **From:** bundle (life-os, finance-intelligence); started by the owner on 2026-11-10 22:56 from `tmp/lc-request/bundles/20261110-225642.md`
- **Received:** 2026-11-10
- **Gap IDs:** G-SS1, G-SS2 (life-os website-screenshots); services-prove-2026-11-10 row 1 + bug; stammdaten-prove-2026-11-10 row 1 (finance-intelligence)
- **Referenced files:**
  - /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/business-vision/docs/ux/concepts/website-screenshots.md
  - /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/services-prove-2026-11-10.md
  - /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/stammdaten-prove-2026-11-10.md
- **Kit version at intake:** 3.38.0

## Requirement (verbatim)

### Item 1 (20261110-135344-93741)

from: life-os
dir: /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/business-vision
date: 2026-11-10 13:53
file: /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/business-vision/docs/ux/concepts/website-screenshots.md

G-SS1: device frame (lc-device-frame) – a phone bezel around projected media: radius, bezel colour per theme, shadow token, optional notch; inputs device=phone, size. G-SS2: responsive picture (lc-picture / lc-image) – <picture> with AVIF/WebP sources, light/dark variants, srcset/sizes, required width/height, loading, decoding, required alt. Not blocking: the website ships with lc-card outlined + native <picture> now (owner, 2026-11-10); see section 7 of the concept.

### Item 2 (20261110-150058-37078)

from: finance-intelligence
dir: /Users/eric/Documents/Projekte/usm/finance-intelligence
date: 2026-11-10 15:00
file: /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/services-prove-2026-11-10.md

row 1 (services-prove-2026-11-10): lc-select needs a way to leave out the clear button (clearable, default true) for selects that always have a value; today the button cuts the label at 360 px and overlaps it at 192 px. Bug riding along (3.37.0/3.38.0): the total row of lc-description-list has a double space in its textContent between its parts; our tests normalise whitespace to compare it.

### Item 3 (20261110-153705-53494)

from: finance-intelligence
dir: /Users/eric/Documents/Projekte/usm/finance-intelligence
date: 2026-11-10 15:37
file: /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/stammdaten-prove-2026-11-10.md

row 1 (stammdaten-prove-2026-11-10): lc-list needs ListItem.ariaLabel so an href or clickable row can carry its own accessible name (jump marks 'Zu Lücken, 3 offen'); default unchanged.
