# Request 039: Progress-bar dark fill, focus halos, dependency-viewer borders, description-list row semantics (036 F-14 to F-17)

- **From:** owner
- **Received:** 2026-11-02
- **Gap IDs:** F-14, F-15, F-16, F-17 (follow-ups of request 036)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/036-description-list-and-status-ink-follow-ups/design.md (§9), /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/libs/angular-ui-kit/CHANGELOG.md (3.23.1, Known line)
- **Kit version at intake:** 3.24.1

## Requirement (verbatim)

Follow-ups F-14 to F-17 of request 036 (queued by the dispatcher under the owner's standing rule of 2026-11-02 that fixable findings go into the pipeline without asking; details in requests/036-description-list-and-status-ink-follow-ups/design.md section 9 and the 3.23.1 changelog Known line). F-14: the lc-progress-bar primary fill in dark is 2.89:1 on a surface-2 track and needs at least 3:1. F-15: a 20 % focus halo (1.28:1 light, 1.50:1 dark) is the only focus indicator in several places: the notification-center title and dismiss buttons, the log-viewer jump-to-bottom button, and about 13 uses in 10 files in total; each needs a visible focus indicator of at least 3:1 (for example the 2 px --color-primary-500 outline that lc-description-list uses since 3.23.1) and Highlight in forced-colors. F-16: the lc-dependency-viewer toggle and node borders use neutral-300 and need at least 3:1 as UI boundaries. F-17: lc-description-list clickable rows use role=button inside a dl, which breaks the term and value group semantics; find semantics that keep both. Both themes; the shared status colours stay unchanged. No API break; the spec decides patch or minor. --from owner --headless
