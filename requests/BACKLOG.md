# Backlog

Open findings that don't need a request of their own: nits, known limits, wording and consistency (routing in [CLAUDE.md → Follow-ups](../CLAUDE.md#agent-pipeline)). The `release-manager` appends rows from *Open items* in `release.md`. The `spec-writer` folds the rows on the components a request touches into its spec and deletes them here. To take rows into the next bundle on purpose: `scripts/lc-request.sh --file requests/BACKLOG.md "<component or IDs>"`.

| ID | Component | Finding | Source |
|---|---|---|---|
| 052-n3 | bottom-nav | Known limit of D-2: More badge "99+" on a 5-entry bar at 360 px starts 3.2 / 3.4 px left of the pill centre and covers 2 of the 3 dots of the More glyph; the label names the entry. | 052 review r2, nit 3 |
| 052-n4 | sidenav | Collapsed rail, non-badged items: the label stays in the AX tree, so the identical `title` may be read as description; check the CDP AX tree and, if so, drop `title` on all rail items (`data-tooltip` carries the tooltip). | 052 review r2, nit 4 |
| 052-n6 | tag-input (story) | *Keyboard Focus* has a German tag without `lang="de"`, so it breaks mid-word with no hyphen; add `lang="de"` as in *Touch Targets (DE)*. | 052 review r2, nit 6 |
| 053-n1 | toast-outlet (spec) | `toast-outlet.gap.spec.ts` pins length and sha1 of the rest of the compiled outlet CSS (2248, `4a24e1d9…`); fails on any later scss edit with no behaviour change. Drop it or replace it with targeted assertions. | 053 review, nit 1 |
| 053-n2 | toast-outlet | "Top stacks the oldest at the top" holds only within a live region; in a top stack the assertive region comes first. Correct the wording (JSDoc, meta docs) or mirror the `--latest` logic for top stacks. Pre-existing, not WCAG. | 053 review, nit 2 |
| 053-n3 | toast-outlet (stories) | *Stack Spacing*, *Offsets*, *Bottom Stack Order*: the meta's `position` and `duration` controls show but do nothing on the fixed demos. | 053 review, nit 3 |
| 054-n1 | alert | At 360 px an inline `slot="action"` button plus × leaves the message about 70 px (one word per line); the 3.2 layout. Consider stacking below a container width. | 054 review, F-3 |
| 054-n2 | modal, confirm-dialog | AC-6: WebKit not automated; manual Safari/iOS check of the *Focus return (3.34)* stories (`document.activeElement` = the trigger's `<button>` after close). | 054 build.md, Deviations |
| 054-n3 | drawer, sidenav, gallery | No `returnFocusTo`; in WebKit their close leaves `body` focused (as before). | 054 spec, scope |
