# Backlog

Open findings that don't need a request of their own: nits, known limits, wording and consistency (routing in [CLAUDE.md → Follow-ups](../CLAUDE.md#agent-pipeline)). The `release-manager` appends rows from *Open items* in `release.md`. The `spec-writer` folds the rows on the components a request touches into its spec and deletes them here. To take rows into the next bundle on purpose: `scripts/lc-request.sh --file requests/BACKLOG.md "<component or IDs>"`.

| ID | Component | Finding | Source |
|---|---|---|---|
| F-30 | table | The checkbox in a row sits 2.25–3 px above the row middle (pre-existing). | 043 review r2, nit 5 |
| F-32 | tag-input | A long tag chip is cut with an ellipsis at 150 px, with no `title` and no wrap, so its full text can't be read. | 043 review r2, nit 10 |
| 043-n7 | textarea | The error message ink in light differs from the other fields: `rgb(107, 9, 9)` vs `rgb(157, 14, 14)` (both at least 4.5:1). | 043 review r2, nit 7 |
| 043-n8 | tag-input | The `form-tag-input--touch-targets` story description says 4 px and 12 px; measured 5 px and 13 px. | 043 review r2, nit 8 |
| 044-n1 | textarea | Focus is a border hue change plus a 20 % halo, while select and datepicker add a 2 px solid ring (not an AA failure: focused border 3.96:1 L / 9.55:1 D on the fill). | 044 review r1, N1 |
| 044-n2 | chat | The pending chip size label "240.0 KB" is not localised and wraps in the 256 px chip (pre-existing). | 044 review r1, N2 |
| 044-n3 | notification-center, log-viewer | The pressed mark in forced colours (filters, level pills) is a 2 px `Highlight` outline, the same shape as the focus ring; the rich-text-editor has a different one. | 044 review r1, N3 |
| 045-n1 | app-shell (story) | *Wide page* at 1280 to 1920: the story's table is 1119 px in a 928 px region, so „Letzte Aktualisierung“ is cut at the region edge and „Kontostand“ is out of view at rest; the story should show a table that fits. | 045 review r1, nit 1 |
| 045-n2 | toast-outlet | Bottom stacks order the live level first, then append order, so at 200 % text the newest error (with its close) sits at −230…48 px, scrolled out, while the older warning is at the edge; the SCSS comment says newest nearest the edge (3.27.2 behaviour). | 045 review r1, nit 2 |
| 045-n4 | app-shell, toast-outlet | Known limit: at 360 px a `top-*` toast (y 72) covers a title placed right under the header (h1 at y 80); documented, `bottom-*` recommended. | 045 review r1, nit 4 |
| 046-n3 | datepicker | Day panel targets are below the kit's 44 px rule: nav 32, today 31, days 36 px (pre-existing, AA 2.5.8 passes). | 046 review r1, nit 3 |
| 046-n4 | datepicker | Month mode: Enter in the open field after a half-typed „2026-1“ leaves the half text until blur; day mode's Enter shows the committed value again. | 046 review r1, nit 4 |
