# Log 014: lc-header avatar trigger fails Label in Name (WCAG 2.5.3) under axe-core 4.14

## Owner decisions

Headless run: none.

- 2026-10-23 (resume): 1: a, installed. The owner ran `npm install -D axe-core@~4.14.0` (axe-core 4.14.0); `package.json` and `package-lock.json` changed on `fix/3.11.4-avatar-trigger-label-in-name`, uncommitted.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-10-23 | spec-writer → ui-ux-designer | done | Spec is ready; the designer chooses the mechanism before the build. | Design the accessible-name composition for the avatar trigger and the axe check setup for AC-1…11; no API break. Keep the name free of doubled words for screen readers, and the visuals pixel-identical. |
| 2026-10-23 | ui-ux-designer → web-developer | done | design.md is complete; mechanism, axe layers and baselines (tmp/story-shots/014/baseline, 132 shots) are fixed. | Implement design.md: name `<userMenuAriaLabel>, <initials>` via `ɵavatarInitials`, decorative header and menu icons, axe-core ~4.14.0 Jest spec and `story-shots --axe`, new story, spec/compat/changelog updates per §9. |
| 2026-10-23 | web-developer → owner | needs-owner | Installing the devDependency needs a permission the headless run does not have. | Run (or allow) `npm install -D axe-core@~4.14.0` on `fix/3.11.4-avatar-trigger-label-in-name`; then hand back to web-developer to run the axe spec and `story-shots --axe` and amend. |
| 2026-10-23 | owner → web-developer | answered | The owner installed axe-core 4.14.0 on the branch (1: a). | Run the axe spec and `story-shots --axe` and amend. |
| 2026-10-23 | web-developer → ui-ux-designer | done | Every gate in build.md is green on commit c93bfc3, including the axe spec and story-shots --axe on the installed axe-core 4.14.0, so the design review comes next. | Review request 014 (stories navigation-header--avatar-trigger-names (new), navigation-header--default, --translated-labels, --app-shell-phone, --app-shell-desktop, --signed-in-large-text); shots in tmp/story-shots/014/new/, after/ (compared against baseline) and axe/ (24 axe runs, 0 violations). |
| 2026-10-23 | ui-ux-designer → release-manager | done | Review round 1 passes all 11 acceptance criteria with no findings, and build.md records every gate green on c93bfc3. | Prepare the release for request 014 (patch 3.11.4 on fix/3.11.4-avatar-trigger-label-in-name, commit c93bfc3; changelog draft in build.md). There are no open should-fix or nit items. |
