# Request 023: lc-bottom-nav "More" on request; decorative lc-modal close icon

- **From:** finance-intelligence
- **Received:** 2026-10-31
- **Gap IDs:** gap file rows 6 and 8 (quellen-2026-10-31)
- **Referenced files:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/quellen-2026-10-31.md (concept: /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/concepts/quellen.md, sections 7 and 11, German)
- **Kit version at intake:** 3.17.0

## Requirement (verbatim)

Narrowing given with the call:

> Rows 6 and 8 only (rows 1-5 are request 021, row 7 is covered by request 022 TD-4): 6 lc-bottom-nav renders the More entry on request, independent of the number of items; 8 lc-modal close icon is decorative, so axe reports no svg-img-alt in the close button

From the gap file (header and rows 6 and 8, unedited):

# Kit requests from the Finance Intelligence sources page (2026-10-31)

- **From:** finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.15.0)
- **Approved concept:** [docs/ux/concepts/quellen.md](../concepts/quellen.md), sections 7 and 11 (German)
- **Look:** none requested. The page uses the kit as it renders: KPI cards (`lc-card` + `lc-stat-trend`), one elevated `lc-card` per source with `card-badge` and `card-header-action`, `lc-accordion`, `lc-description-list`, `lc-list` below 1280 px, `lc-table` from 1280 px, `lc-modal placement="auto"`. All eight items are functions, accessibility or documentation (ADR-0009).
- **Status:** 1–5 sent 2026-10-31 as lc-design-system request 021. 7 is covered by request 022 from life-os (TD-4, a list row that is a real link). 6 and 8 were found in the build and sent 2026-10-31 as a new request.

| #   | Component                            | Gap                                                                                                                                                                                                                                                       | Proposal                                                                                                                                                                                   | Accepted when                                                                                                                                                                                      | Our transition until the release                                                                                                                                                                                          |
| --- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6   | `lc-bottom-nav`                      | The "More" entry only appears from `maxItems + 1` destinations. A product whose bar slots are fixed (two targets plus "More") cannot ask for it explicitly.                                                                                               | An input such as `showMore: boolean` that renders the "More" entry with `moreLabel`, `moreIcon` and `moreRoute` regardless of the number of items. Without it, nothing changes.            | With two items and `showMore`, the bar shows both and "More"; "More" is current on `moreRoute`; a story shows it.                                                                                  | "Mehr" is passed as a regular `BottomNavItem` (`icon="dots"`, `route="/mehr"`); the shell sets `activeRoute` to `/mehr` on pages reached through it.                                                                      |
| 8   | `lc-modal`                           | The close button renders `<lc-icon name="x-mark">` without `decorative`, so the icon is an `svg role="img"` without a name inside a button that `closeAriaLabel` already names. axe reports `svg-img-alt` (serious, WCAG 1.1.1) whenever a modal is open. | Render the close icon as `decorative` (hidden from assistive technology); the button keeps its name from `closeAriaLabel`. Accessibility only, no new look.                                | With a modal open, axe (WCAG 2.2 AA) reports no violation inside the close button, and a screen reader announces the button only by its name.                                                      | Our axe check skips only `svg-img-alt`, and only for `.lc-modal__close svg` (`KIT_DEFECTS` in `apps/web-e2e/support/evidence.ts`); every other rule still checks the button. We remove the entry with the fixing release. |
