# Backlog

Open findings that don't need a request of their own: nits, known limits, wording and consistency (routing in [CLAUDE.md → Follow-ups](../CLAUDE.md#agent-pipeline)). The `release-manager` appends rows from *Open items* in `release.md`. The `spec-writer` folds the rows on the components a request touches into its spec and deletes them here. To take rows into the next bundle on purpose: `scripts/lc-request.sh --file requests/BACKLOG.md "<component or IDs>"`.

| ID | Component | Finding | Source |
|---|---|---|---|
| 054-n2 | modal, confirm-dialog | AC-6: WebKit not automated; manual Safari/iOS check of the *Focus return (3.34)* stories (`document.activeElement` = the trigger's `<button>` after close). Still open after 055: WebKit is not installed here. Still open after 056 (2026-11-07): no Playwright/WebKit installed. Still open after 057 (2026-11-10): WebKit not installed, not checkable here. Folded into 065 AC-24 (2026-11-17); stays here if still not checkable. Still open after 068 (2026-11-18): no Playwright/WebKit. | 054 build.md, Deviations |
| 068-n1 | sortable-head | `.lc-sortable-head__busy` uses `right` and `border-right-color`; in RTL the ring sits away from the 32 px reserve (`padding-inline-end`). Use `inset-inline-end`. | 068 review N-1 |
| 068-n3 | menu | `anchor` as a point with nothing focused (`contextmenu` without focusing the target): no focus target after Tab or Escape, focus ends on `<body>`. Return to a target, or document that the target must take focus (`tabindex`). Not a WCAG failure (F85 needs a trigger in the focus order; a real right-click focuses the story's row). | 068 review N-4 |
| 069-n1 | file-upload | Image field without a rejection: the empty `role=alert` line still takes the 8 px column gap under the field. `.file-upload-image__error:empty { margin-block-start: calc(-1 * var(--spacing-2)) }` keeps the live region. | 069 review F-2 |
| 069-n2 | file-upload | *Image German* / *Image Rejected German*: hint, accepted and max lines say the same limits; give the hint other content (what the logo is used for). | 069 review F-3 |
