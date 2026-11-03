# Log 039: Progress-bar dark fill, focus halos, dependency-viewer borders, description-list row semantics (036 F-14 to F-17)

## Owner decisions

2026-11-02: standing rule — fixable review and release findings go into the pipeline without asking (queued by the dispatcher).

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-02 23:58 | dispatcher → spec-writer | new | Start of the request. | Write the spec for this request. |
| 2026-11-03 00:00 | spec-writer → ui-ux-designer | done | The spec is ready and the design step comes next in the normal route. | Design the API and visuals for AC-1…12 of requests/039-progress-focus-borders-dl-semantics/spec.md. Build the halo inventory (AC-5), pick the F-14 dark fill, and choose the F-17 row semantics that keep the dl group. Report back if F-17 needs a DOM change that makes this a minor. |
| 2026-11-03 00:25 | ui-ux-designer → web-developer | done | The design is complete and measured, and F-17's DOM change is the minor the spec's exception already allows, so no spec question is open. | Implement design.md of request 039 (D-1…D-6, §3 ring table, §5 tokens, §8 stories incl. new node-statuses, §9 expected compare 114 differ / 282 identical against tmp/story-shots/039/baseline); this is a minor (3.25.0, branch feat/3.25-…) because F-17 changes the clickable-row DOM. |
| 2026-11-03 00:54 | web-developer → ui-ux-designer | done | All gates are green on 7daee89 (libs/tools unchanged in eaa8688), so the design review of the built stories is the next step. | Review request 039 (stories data-display-dependency-viewer--node-statuses (new), components-description-list--clickable-rows and --clickable-rows-english, feedback-progress-bar--colors, data-display-logviewer--text-hierarchy, plus focus/forced-colours on the §3 ring table and the dependency-viewer stories); build.md has the measurements, the 114/282 compare and the deviations. |
| 2026-11-03 01:09 | ui-ux-designer → release-manager | done | All AC pass with measurements and there is no must-fix finding; the design corrections need no code change. | Prepare the release for request 039 (3.25.0, minor: the clickable-row DOM changed). Carry review nits 1–4 into release.md: story wording, log-viewer docs 3.23 → 3.49, changelog Compatibility (drop the shot counts, add the Safari Tab note), and the Angular 21 compat leg. |
| 2026-11-03 | release-manager → none | done | All gates green (compat Angular 21 PASS, pack 424 files 1.2 MB); released as 3.25.0 through the pipeline; the owner approves the npm stage. | Review nits 1–2 (story wording, log-viewer docs 3.23 → 3.49) are story edits and stay open for the next patch. |
