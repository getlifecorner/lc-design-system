# Request 009: Signed-in shell at 200 % text on a phone

- **From:** life-os
- **Received:** 2026-10-21
- **Gap IDs:** AS-31 (AS-30 referenced by it, not in scope unless the spec decides otherwise)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/life-os/docs/ux/concepts/app-shell.md (§7.1 *F1 gap register*, AS-31 row at line 854; AS-30 row at line 853)
- **Kit version at intake:** 3.10.0

## Requirement (verbatim)

Request text as received:

> /Users/eric/Documents/Projekte/life-cockpit/life-os/docs/ux/concepts/app-shell.md --from life-os AS-31 only (row in 7.1): the signed-in frame at 200 % text on a phone – lc-header's end slot (member trigger) overlaps the brand; lc-bottom-nav floating grows wider than the viewport and covers the page above it. Stories at 360 and 320 px with 200 % text, signed in. --headless

Referenced concept, §7.1, AS-31 row (verbatim):

> | AS-31 | app shell (proof of the V1 pipeline branch, 2026-10-21, ux-reviewer U1; owner: kit request now) | no (WCAG 1.4.4, 1.4.10; 4 "200 % text or 320 px": the bar grows, no horizontal scroll) | the signed-in frame at 200 % text on a phone (360 px; a phone set to large text). (1) `lc-header`: the end slot (the member trigger, AS-2) overlaps the brand: the wordmark runs under the avatar and the subtitle is cut to one letter; proposal: the brand keeps its own space, so the row wraps (the end slot to the end of a second row, as AS-30 asks for the signed-out bar) or the subtitle truncates, never an overlap. (2) `lc-bottom-nav` `floating` (AS-1, LK-5): its list grows wider than the viewport (DE „Heute“, „Haushalt“: 19 px past the edge at 360 px, 59 px at 320 px) and the bar, taller with its larger labels, covers the page above it (Today's member row); proposal: the items share the width and their labels wrap, and `lc-app-shell` reserves the bar's real height (not a fixed inset) at the end of the scroll area. Stories at 360 px and 320 px with 200 % text, signed in. Measured with the AS-30 interims removed: identical, so older than AS-30 | none; the app side (Today's tiles break mid-word, the member row 9 px too wide in EN) is T387 |

Context referenced by AS-31, the AS-30 row (verbatim):

> | AS-30 | app shell (T381 CI, Linux WebKit, 2026-10-21) | no (WCAG 1.4.4, 1.4.10; 4 "200 % text or 320 px") | reflow of the shell and the auth title at 320 px and 200 % text. (1) `lc-header` is one flex row with no `flex-wrap`, so the `[slot='end']` language link ran past the screen edge; proposal: wrap with no row gap, the brand counting as zero width when the row breaks and taking the free space (not the spacer), the end slot keeping to the end, so at 360 px / 100 % the bar stays one row. (2) `a[lcButton]` and `lc-page-header`'s title set `overflow-wrap: break-word`, which doesn't let them shrink in a flex row: one word wider than the line ("Datenschutz", "LifeCorner" at 200 %) runs past the edge; proposal: `anywhere`, and the footer's link padding not growing with the text. Stories at 320 px and 200 % text. Found with CI's DejaVu Sans (wider than SF) | interims in `libs/ui/shell/src/shell.component.css` (header, footer links) and `libs/ui/auth/src/auth-layout/auth-layout.component.ts` (H1), labelled AS-30; at 360 px and 100 % nothing changes (bar 56 px, footer link padding 24 px); covered by the 320 px / 200 % e2e of the four sign-in pages (`closed-beta.spec.ts`) and the header-height check at 360 px (`shell.spec.ts`) |
