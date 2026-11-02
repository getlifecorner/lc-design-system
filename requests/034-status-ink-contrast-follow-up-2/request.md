# Request 034: Status ink contrast follow-up 2 (F-1 to F-7 of 029)

- **From:** owner
- **Received:** 2026-11-02
- **Gap IDs:** none (follow-ups F-1 to F-7 of request 029)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/029-status-ink-contrast-follow-up/release.md, /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/029-status-ink-contrast-follow-up/review.md
- **Kit version at intake:** 3.22.3

## Requirement (verbatim)

Follow-ups F-1 to F-7 of request 029 (no consumer gap file; the owner asked for them on 2026-11-02; details in requests/029-status-ink-contrast-follow-up/release.md and review.md). Target: text at least 4.5:1, icons, graphics and boundaries at least 3:1, targets at least 44 px or the WCAG 2.5.8 spacing exception, in both themes. F-1: the high priority chip in lc-notification-center on unread (teal-selected) rows in the dark theme is 3.67:1; no existing token is light enough, so the design decides on a dark warning text ink. F-2: lc-progress-ring still uses --color-<variant>-default against its track (light success 2.47, warning 2.05). F-3: diff-viewer line numbers (--color-text-tertiary) on added lines are 3.88:1 in light. F-4: the lc-card --primary chip text is 3.12 to 3.57:1 in light. F-5: the lc-log-viewer level pills are 15 px high. F-6: the lc-dependency-viewer uses edge label (--color-neutral-300) and extends edge label (--color-primary-400) are faint text in light. F-7: lc-log-viewer dims text with opacity (debug level 2.53 light / 3.25 dark, terminal 2.97; timestamps 3.21 / 4.43, terminal 3.64; terminal line numbers 2.20); replace the opacities with text tokens that reach 4.5:1. The shared --color-success, --color-error, --color-warning and --color-info values must not change. No API break; the spec decides patch or minor.
