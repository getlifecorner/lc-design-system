# Request 060: Area icons, hero area map, laptop device frame, lc-chip wrap and on-band palette

- **From:** bundle (life-os)
- **Received:** 2026-11-11
- **Gap IDs:** G-HV1, G-HV2, G-SS1 (extended), G-HV3, G-HV4
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/home-vision/docs/ux/concepts/website-home-vision.md (section 7 'Design system gaps'; sections 3.1 and 3.3)
- **Kit version at intake:** 3.39.0
- **Bundle:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/tmp/lc-request/bundles/20261111-221618.md (started by the owner on 2026-11-11 22:16)

## Requirement (verbatim)

## Item 1 (20261111-004712-12486)

from: life-os
dir: /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/home-vision
date: 2026-11-11 00:47
file: /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/home-vision/docs/ux/concepts/website-home-vision.md

Home vision (website), see section 7 'Design system gaps' of the concept. G-HV1 (blocking, owner 2026-11-11: the page waits for it): four area glyphs in the inline icon set, Tabler outline like the others: ICON_SHOPPING_BAG (shopping), ICON_TARGET (goals and big plans), ICON_HEART (health, fitness, nutrition), ICON_GIFT (people who matter). G-HV2 (not blocking, interim page-level layout CSS; updated 2026-11-11 after the owner chose visual R2): a pattern for an area map on a hero band: status groups (a badge plus chips) stacked top to bottom, thin straight lines from the chips of the first groups into one translucent layer bar with the character, quieter groups below a divider without lines; no JS (concept section 3.1). G-SS1 extended (not blocking, interim lc-card outlined): lc-device-frame device='laptop' next to the phone frame from request 059.

## Item 2 (20261111-220833-71177)

from: life-os
dir: /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/home-vision
date: 2026-11-11 22:08
file: /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/home-vision/docs/ux/concepts/website-home-vision.md

Home vision (website), concept section 7, owner decision 2026-11-11 'kit first'. G-HV3 (not blocking, interim: chips fit 320 px): lc-chip wrap, as lc-badge wrap since 3.11: long labels wrap onto centred lines, needed at 200 % text (WCAG 1.4.10). G-HV4 (not blocking, interim: page-level --lc-chip-bg/-fg/-border hooks with the values in concept section 3.3, labelled): chips on a hero band take an on-band palette like badges since 3.37: emphasis (dark fill, white ink), default (light tint), quiet (transparent, white ink, thin white border); opaque fills, at least 4.5:1 on all band colours in both themes.
