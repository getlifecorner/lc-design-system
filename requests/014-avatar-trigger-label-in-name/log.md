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
