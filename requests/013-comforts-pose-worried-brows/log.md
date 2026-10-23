# Log 013: Edu's "comforts" pose reads angry: worried brows

## Owner decisions

2026-10-23 (in the request): kit first; same file names and API; release as a patch after 3.11.2.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-23 | dispatcher → spec-writer | new | headless run from life-os | Write the spec for this request |
| 2026-10-23 | spec-writer → ui-ux-designer | done | The spec is ready, nothing needs an owner decision, and the drawing is a visual design task. | Design the new `comforts` brows and mouth for AC-1…9, raised inner brow ends and a soft mouth, keeping the tilt and the reaching arm. Audit the brows of all 14 poses (AC-4), record the table in `design.md`, and take baseline screenshots of the old `comforts` at 96 and 48 px. |
| 2026-10-23 | ui-ux-designer → web-developer | done | The design fixes the three path values, the brow rule and the new story; no API change and no owner question. | Implement design.md: the three `d` values of §2 in `comforts-light.svg`, re-run the generator, the brow-rule spec of §3.1/§9, the *Brows* story, the generator header line and the 3.11.3 changelog draft. |
| 2026-10-23 | web-developer → ui-ux-designer | done | Built on `fix/3.11.3-comforts-worried-brows`, all gates green; only the 4 comforts stories differ from the baseline. | Review request 013 (stories `components-character--brows`, `--comforts`, `--all-poses`, `design-tokens-horizon--with-figure`, `layout-app-shell--figure-on-the-horizon`; shots in `tmp/story-shots/013/r1` and `r1-comforts-48-96`). Note the deviation in build.md: the generator was not run (needs approval headless); the edits are proven by the assets spec. |
| 2026-10-23 | ui-ux-designer → release-manager | done | Review r1 approved: AC-1…9 pass, only the 4 comforts stories differ, the generator deviation is proven equivalent; no must-fix. | Prepare the release for request 013 (patch 3.11.3); write the changelog from build.md's draft with review Finding 2 applied ("3.9 / 1.8 px at 96 px"). |
| 2026-10-23 | release-manager → none | done | 3.11.3 is tagged and the publish run staged it. Only the owner's 2FA approval (`npm stage approve <id>`) is left. | Owner: log in to npm, run `npm stage list @lifecorner/angular-ui-kit`, then `npm stage approve <id>` for 3.11.3 (3.11.2 is also awaiting approval). |
