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
