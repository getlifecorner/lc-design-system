# Log 050: overlay panel language (select, menu, tooltip, popover); lc-bottom-nav moreBadge, lc-sidenav badgeAriaLabel

## Owner decisions

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-05 13:39 | spec-writer → ui-ux-designer | done | The spec is ready and needs the API and anatomy design before the build. | Design the API and visuals for AC-1…16 in requests/050-overlay-lang-nav-badges/spec.md. Cover the lang placement for the select panel and the tooltip, the `moreBadge` shape on the lc-bottom-nav More entry, and the hidden badge text placement in lc-sidenav at all five badge sites including the collapsed rail. No visual change (ADR-0009); stories in EN and DE. |
| 2026-11-05 14:05 | ui-ux-designer → web-developer | done | API, anatomy, states, contrast and stories are fixed, the DOM change was prototyped against the baselines (36/42 identical, the other 6 proven flakes), and no question needs the spec-writer or the owner. | Implement design.md: select and tooltip `lang` (§1), bottom-nav `moreBadge` + `BottomNavBadge`, sidenav `badgeAriaLabel` (default `'{value}'`, D-1) at all six badge sites with the rail label prefix (D-2), the five §8 stories and the AC-13 compat entries; list F-1–F-3 and L-1, L-2 as known limits in build.md. |
