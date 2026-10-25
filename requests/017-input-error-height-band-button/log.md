# Log 017: lc-input error-state height and a link button on the hero band

## Owner decisions

- 2026-10-25 17:24: owner stopped this headless run during the design step (pid killed). Request 016 also changes lc-input and is released first as 3.12.0. Resume with `scripts/lc-request.sh --resume 017` after 3.12.0 is out; retake the baselines on that version.
- 2026-10-25 18:08: 3.12.0 is released (main at ddbd4cb), so this request resumes from the queue. Working tree note: the uncommitted owner tooling change (scripts/lc-request.sh, .claude/skills/lc-request/SKILL.md, CLAUDE.md, and in requests/README.md the paragraph "**One request at a time.** …" and the "in the background" wording in the consumer snippet) stays out of this request's commits; from requests/README.md stage only the index rows.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-25 15:10 | dispatcher → spec-writer | new | Start of the request | Write the spec for this request |
| 2026-10-25 15:12 | spec-writer → ui-ux-designer | done | The spec is ready; the designer owns the API and visual decisions, and no owner decision is needed. | Design the API and visuals for AC-1…12. First measure the class collision (G-WL3) and the contrast of all eight button variants on each hero band color (G-WL1). Then decide the new class names and whether the band button needs a new variant, new hooks, or only docs. |
| 2026-10-25 18:26 | ui-ux-designer → web-developer | done | Design ready on 3.12.0 (ddbd4cb); baselines retaken (300 shots); no breaking change, no new token, no owner decision. | Implement design.md: lc-input container state `input-invalid` (message keeps `p.input-error`), new `ButtonVariant` `inverse` with hook `--lc-button-inverse-fg`, four stories, specs and compat probe per §9. |
| 2026-10-25 18:42 | web-developer → ui-ux-designer | done | All gates are green on ae6b576, so the new stories now need the design review in the browser before release. | Review request 017 (stories form-input--error-keeps-height, components-button--inverse, components-button-link--inverse, layout-hero--band-link) against design.md; build.md has the §9 measurements, and one deviation to confirm: 20 expected screenshot diffs instead of 16 (the email-input Team Invite story also shows an error at load). |
| 2026-10-25 18:55 | ui-ux-designer → release-manager | done | All AC pass in review round 1 and there is no must-fix finding; the developer's gates are green on ae6b576. | Prepare the release for request 017 (3.13.0, branch feat/3.13-input-error-height-band-button). The three nits in review.md stay open and visible, and the changelog draft in build.md matches the measured values (280 identical, 20 expected diffs). |
