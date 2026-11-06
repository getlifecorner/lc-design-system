# Backlog

Open findings that don't need a request of their own: nits, known limits, wording and consistency (routing in [CLAUDE.md → Follow-ups](../CLAUDE.md#agent-pipeline)). The `release-manager` appends rows from *Open items* in `release.md`. The `spec-writer` folds the rows on the components a request touches into its spec and deletes them here. To take rows into the next bundle on purpose: `scripts/lc-request.sh --file requests/BACKLOG.md "<component or IDs>"`.

| ID | Component | Finding | Source |
|---|---|---|---|
| 054-n2 | modal, confirm-dialog | AC-6: WebKit not automated; manual Safari/iOS check of the *Focus return (3.34)* stories (`document.activeElement` = the trigger's `<button>` after close). Still open after 055: WebKit is not installed here. | 054 build.md, Deviations |
| 055-n1 | tag-input (stories) | *Keyboard Focus*, *Touch Targets (DE)*, *Long Tags*: the `render` binds only `label`, `placeholder` and `removeTagAriaLabel`, so `separator`, `maxTags`, `allowDuplicates`, `removable` and `disabled` show as controls but do nothing. Bind them or limit `parameters.controls.include` (as 053-n3 did for the outlet). | 055 review r1, N-1 |
| 055-n2 | alert (spec) | `alert.close-target.spec.ts` AC-15 pins length and sha1 of the whole compiled alert CSS (minus the 3.35 band), so the next unrelated alert SCSS edit fails it. Replace with targeted assertions on the × rules (`::before` hit area, `position`, `color: inherit`), as 053-n1 did for the outlet. | 055 review r1, N-2 |
| 055-n3 | header | `hamburgerClick` is an `output<void>`, so a page can't hand the hamburger to `lc-sidenav` `returnFocusTo` without querying `.lc-header__hamburger button`. Consider emitting the trigger element. | 055 design §1, F-1 |
| 055-n4 | combobox | No `announceError` input (as `lc-textarea` has): the error is always `role="alert"`, so a focus moved to the combobox after a 422 reads the error twice (alert and `aria-describedby`). | 055 design §1, F-2 |
