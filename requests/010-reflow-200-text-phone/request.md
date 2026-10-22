# Request 010: Reflow gaps at 200 % text on a phone

- **From:** life-os
- **Received:** 2026-10-22
- **Gap IDs:** AS-30 part (2), AS-32 (new), SI-15
- **Referenced files:** the gap rows and e2e live in the life-os worktree `as-31-large-text` (AS-32 exists only there, not yet on life-os `main`):
  - /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/as-31-large-text/docs/ux/concepts/app-shell.md (gap table near the end: AS-30 row at line 853, AS-32 at line 855, SI-15 at line 856)
  - /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/as-31-large-text/docs/ux/concepts/sign-in.md (SI-15: lines 14, 706)
  - /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/as-31-large-text/apps/cockpit-e2e/src/shell/as31-large-text.spec.ts (e2e that measures AS-30/AS-32)
  - /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/as-31-large-text/apps/cockpit-e2e/src/us1/closed-beta.spec.ts (e2e that measures SI-15)
  - /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/as-31-large-text/libs/ui/auth/src/auth-layout/auth-layout.component.ts (interims AS-30 and SI-15, about lines 114–130; removed by life-os after the release)
  - /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/as-31-large-text/libs/ui/shell/src/shell.component.css (AS-30 footer-link interim; removed by life-os after the release)
- **Kit version at intake:** 3.10.1

## Requirement (verbatim)

> Three reflow gaps at 200 % text on a phone (WCAG 1.4.4, 1.4.10), as one patch release if possible. The rows are in docs/ux/concepts/app-shell.md, in the gap table near the end: AS-30 part (2), AS-32 (new) and SI-15; SI-15 also in docs/ux/concepts/sign-in.md. (1) AS-30 (2): lc-page-header's title and a[lcButton] use overflow-wrap break-word, which doesn't let them shrink in a flex row, so one word wider than the line runs past the edge. Measured in life-os at 320 px / 200 % text: the signed-in greeting 'Hallo, Johanna-Friederike' +38 px, the English title 'Household' +5 px, plus the sign-in pages' title and footer links (Datenschutz, LifeCorner). (2) AS-32: lc-next-step-card's title at 200 % text: at 360 px the grid gives the icon 96 px and the title 92 px, so 'Nichts zu tun' / 'Nothing to do' breaks inside the word 'Nichts'. Life-os's Today concept says a name never breaks inside a word. (3) SI-15: long lc-badge labels wrap ('Geschlossene Beta, nur mit Einladung' at 320 px / 200 %). The life-os e2e that measures them: apps/cockpit-e2e/src/shell/as31-large-text.spec.ts and apps/cockpit-e2e/src/us1/closed-beta.spec.ts. Life-os interims to remove after the release: libs/ui/auth/src/auth-layout/auth-layout.component.ts (AS-30 and SI-15, about lines 114-130) and the AS-30 footer-link rule in libs/ui/shell/src/shell.component.css. Stories at 360 px and 320 px with 200 % text, German and English. --from life-os --headless
