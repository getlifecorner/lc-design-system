# Spec 070: lc-file-upload image grounds in forced colours

- **Status:** ready
- **Type:** bug fix
- **Affected:** `libs/angular-ui-kit/src/lib/file-upload/` (`file-upload.component.scss`, new/extended spec, story, `CHANGELOG.md` Known entry); item 069-s1 (release.md Open items, design 069 §5 r1)
- **Semver impact:** patch. Only the forced-colours block changes; no input, class or default is touched. The standard colour modes render as before.

## Need

`lc-file-upload variant="image"` (usm-x row 71, settings logo) has `imageBackground` `surface | light | dark | checkered`. The ground exists so a logo with a white or transparent silhouette can be judged on the ground it will sit on. In Windows High Contrast (`forced-colors: active`) the browser replaces every tile background with Canvas and drops the checks, so `light`, `dark` and `checkered` all look alike, and a white silhouette on `dark` measures 1.00 against its ground (069 review F-1). The image already has `forced-color-adjust: none` (069); its ground does not.

## What the kit has today

- `.file-upload-image__tile--dark` sets `var(--color-sidebar)`, `--checkered` a `repeating-conic-gradient`, `light`/`dark` also add the class `lc-theme-light`/`lc-theme-dark` (component.ts `tileClasses`). All are overridden in forced colours.
- The last `@media (forced-colors: active)` block (scss l. 249) sets the tile border to CanvasText, the drag outline to Highlight and `forced-color-adjust: none` on the image only. Nothing for the grounds.
- `file-upload.remove-target.spec.ts` already compiles the SCSS and reads rules from the forced-colours block: a pattern for the unit check.
- Backlog rows 069-n1 and 069-n2 on `file-upload` are cosmetic (empty alert gap, story wording) and not part of this fix; they stay in `requests/BACKLOG.md`.

## Scope

- In: in the forced-colours block, tiles with `--light`, `--dark` or `--checkered` that show an image keep their own ground (`forced-color-adjust: none`); the border stays CanvasText; the drag ring stays Highlight; a forced-colours story for the three grounds; a Known-entry removal or update in the changelog.
- Not in: new inputs, new tokens, other variants (`dropzone`), the `surface` ground, backlog rows 069-n1/n2, changes outside forced colours.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | In forced colours, a tile with `imageBackground` `light`, `dark` or `checkered` and an image has `forced-color-adjust: none`, so its computed background is the ground of the normal mode (dark: `--color-sidebar` #070e15; light: the light scope surface; checkered: the check gradient is present). | Unit: compiled SCSS rule inside the forced block, as in `remove-target.spec`; story with `--forced-colors` measured by `story-shots --measure` (computed `background-color` / `background-image`) |
| AC-2 | The three grounds differ from each other in forced colours, and the `dark` ground differs from Canvas. A white silhouette image on `dark` has contrast ≥ 3:1 against the ground (was 1.00; computed from the measured ground colour). | Story at 360 and 1280, `--forced-colors`, computed colours and ratio |
| AC-3 | The tile border is CanvasText on every ground in forced colours; the `drag-over` outline is Highlight (unchanged). | Unit (rules in the forced block) + measure |
| AC-4 | `surface` tiles and empty tiles (no image) keep the system colours in forced colours (no `forced-color-adjust: none` on them); the empty hint stays readable. | Unit (selector does not match `--surface` or `--empty`); screenshot of an empty `dark` tile |
| AC-5 | Without forced colours the three grounds, border, drag ring, light and dark page themes render unchanged (pixel hash equal to baseline for the existing image stories, both themes, 360 and 1280). | `story-shots --compare` against the baseline taken before the change |
| AC-6 | No new input, class, token or markup; the existing assertions of `file-upload*.spec.ts` pass unchanged; prerendered HTML is unchanged. | Full file-upload specs; compat `EXPECT_IN_HTML` untouched |
| AC-7 | A story (or the existing *Image* story with the `forced-colors` parameter, as other kit stories do) shows `light`, `dark` and `checkered` with a white-on-transparent logo, in EN and DE labels, so the design review can look at them. | Story exists, `--list=file-upload` |
| AC-8 | The 3.49 Known note about the forced-colours grounds in `CHANGELOG.md` is replaced by a Fixed entry that names 069-s1 and the measured values. | Release step, changelog diff |

Keyboard, screen reader and German lengths: no change (no markup or text is touched); AC-6 covers that.

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Only colours: `forced-color-adjust: none` must not leak to the buttons, hint or error lines beside the tile.

## Assumptions

- Assumption: the fix applies only to tiles with an image. An empty `light`/`dark`/`checkered` tile already shows the surface in normal mode for `checkered`, and shows no image to judge; system colours are the safer choice there. If the designer finds the `dark` empty tile should keep its ground, that is a design call within AC-4's reason.
- Assumption: `forced-color-adjust: none` on the tile also keeps the `lc-theme-light/dark` scope's custom properties; the border is set explicitly to CanvasText so the edge still follows the system.
- Assumption: patch, since the change is only visible in forced colours and fixes a measured WCAG failure (the owner rule says such a finding is at least should-fix).

## Open questions

None.
