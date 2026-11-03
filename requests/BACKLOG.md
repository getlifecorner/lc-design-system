# Backlog

Open findings that don't need a request of their own: nits, known limits, wording and consistency (routing in [CLAUDE.md → Follow-ups](../CLAUDE.md#agent-pipeline)). The `release-manager` appends rows from *Open items* in `release.md`. The `spec-writer` folds the rows on the components a request touches into its spec and deletes them here. To clear the backlog on purpose: `/lc-request requests/BACKLOG.md <component or IDs>`.

| ID | Component | Finding | Source |
|---|---|---|---|
| F-30 | table | The checkbox in a row sits 2.25–3 px above the row middle (pre-existing). | 043 review r2, nit 5 |
| F-32 | tag-input | A long tag chip is cut with an ellipsis at 150 px, with no `title` and no wrap, so its full text can't be read. | 043 review r2, nit 10 |
| 043-n7 | textarea | The error message ink in light differs from the other fields: `rgb(107, 9, 9)` vs `rgb(157, 14, 14)` (both at least 4.5:1). | 043 review r2, nit 7 |
| 043-n8 | tag-input | The `form-tag-input--touch-targets` story description says 4 px and 12 px; measured 5 px and 13 px. | 043 review r2, nit 8 |
