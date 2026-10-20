# Request 007: A lighter lc-sidenav-placeholder in the initial chunk (AS-28)

- **From:** life-os (`--from life-os`)
- **Received:** 2026-10-20
- **Gap IDs:** AS-28
- **Referenced files:**
  - /Users/eric/Documents/Projekte/life-cockpit/life-os/docs/ux/concepts/app-shell.md (§7.1 "F1 gap register", line 775; AS-28 row line 851)
  - Earlier handling: `requests/006-f1-shell-review-gaps/spec.md` (AS-28 deferred, lines 56 and 119)
- **Kit version at intake:** 3.9.0

## Requirement (verbatim)

/Users/eric/Documents/Projekte/life-cockpit/life-os/docs/ux/concepts/app-shell.md --from life-os Section 7.1 of the attached concept: AS-28 only – a lighter lc-sidenav-placeholder in the initial chunk. Request 006 deferred it while the app stayed under its interim 180 kB budget; life-os T331 (plan B54) now needs it to bring the initial JS back to 150 kB. Measure the placeholder's gzip share in a shell-like app first; if it is worth it, a static placeholder that takes activeRoute only (no Router injection), or one that needs only the row and section counts. Read the AS-28 row in 7.1 (line 851) for the exact need and acceptance. The other rows of 7.1 are closed by request 006 (AS-22 to AS-24, HS-6, SI-14: no kit change) or released in 3.9.0.

### AS-28 row (app-shell.md line 851, verbatim)

| AS-28 | app shell (plan B54, T331) | no | a lighter `lc-sidenav-placeholder` in the initial chunk: since 3.6.0 it subscribes to the `Router` (rxjs `filter`) and loads the `internal/navigation` helpers, all only to mark the current row. Proposal: measure its gzip share in a shell-like app first; if it is worth it, a static placeholder that takes `activeRoute` only (no `Router` injection), or one that needs only the row and section counts | the kit's placeholder as it is; the app's budget is 180 kB until T331 is met |
