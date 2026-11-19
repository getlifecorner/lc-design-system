# Build 069: external description-list links, single-image upload, badge labels, menu height

- **Branch:** `feat/3.49-external-link-upload-badge-menu`
- **Commit:** `feat(description-list,file-upload,badge,menu): request 069 — …` (one commit, amended with this file)

## Files changed

| File | Change |
|---|---|
| `description-list.component.{ts,html,scss}` | `external` field, `externalLinkHint`, glue span in the 4 links, `--external` basis (D-1…D-3); AC-5 `::after` separator (D-4); kit icon registration |
| `badge.component.{ts,html,scss}` | `lc-icon` slot + `.lc-badge__label`, `:empty`, `maxWidth`, `--truncate`, observed `title` (D-7) |
| `file-upload.component.{ts,html,scss}` | `variant="image"`, 11 inputs, `imageRemoved`, types, tile/actions/error (D-5, D-6); drop zone moved into `@else` |
| `menu.component.{ts,html,scss}` | `maxHeight="room"`: measure, side, `effectivePosition`, room margin classes, `--room` (D-8) |
| 4 stories files | the 9 stories of design §8, argTypes for every new input/output |
| new specs | `description-list.external` (35), `badge.max-width` (10), `file-upload.image` (24), `menu.room` (19) |
| `tools/compat/check-angular-majors.mjs` | 'badge wrap class' expects the label span (AC-16) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1–4 | `description-list.external.spec` (every link place × rows/stacked, total, clickable; name = value + hint, no `aria-label`; glyph without app registration; without `external` attributes `class, href` only); temp default-DOM proof: dl, file-upload, menu (projected, CSS cap, overlay) identical to 3.48 apart from comment anchors; badge identical once the label is unwrapped (`tmp/069/zz-069-default-dom.spec.ts.txt`) |
| 5 | rule pins in the spec; *Item Icons* 1280: rows 1–2 `border-bottom` 0, `::after` 1 px solid, 250 px = row width; with the rules deleted live: same row tops (93.4 / 159.4 / 204.4) |
| 6 | *External Links* 360/1280 L/D: icon − last glyph 4.0 px, bottoms Δ 2, dd overflow 0, page = viewport; icon colour = link colour (L 26,106,121 / D 163,213,223; forced colours LinkText) |
| 7–11 | `file-upload.image.spec`; *Image German* 360: tile 160 × 96, buttons 175.7 / 159.4 / 168.3 × 48.5, clip 0; 1280: buttons at x 192 (16 gap); *Image Rejected German*: „Diese Datei ist zu groß. Höchstens: 85,0 KB“, disabled field's buttons disabled; grounds: surface/light #fff, dark #070e15 (both themes), checks in `--color-neutral-300`; forced colours: tile border CanvasText |
| 12–16 | `badge.max-width.spec`, updated pins (below); *Mixed Label* gap „in“→„USM“ 3.7 px; *Max Width* 360: 256 px, label sw 575 > cw 221, text top Δ 0, title = whole text, `wrap` wins; forced colours label CanvasText; `badge-contrast.spec` green; live unwrap of the label in palette, badge, dl, timeline stories: badge boxes and glyph rects identical to 0.01 px |
| 17–20 | `menu.room.spec` (mocked rects: 3 origins, side rule, tie, minimum, resize, items, scroll, End reveals item 26); *Long Menu Room* 1280 × 1150: trigger 379.5–423.5, panel 431.5–1133.5, 702 px, 20 of 26 visible; *Flips Up*: panel 8.5–854.5 (8 px over the trigger), 846 px, 24 visible; 900 px high: 535 / 659 px |
| 21 | full suite; compat 22 PASS; default-DOM proof |
| 22 | JSDoc `@default` on every new input (pinned in the specs); argTypes with `description` + `table.defaultValue` |
| 23 | changelog draft below |

## Gates

All gates ran on commit `2727438263dee47c837688e674eef43eab03ed47` (later agents skip a gate while `git diff --quiet 2727438 -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 376 suites, 7364 passed, 8 skipped (tabs suite SIGSEGV at load 25, rerun alone: 39 passed) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 159 warnings (baseline 159) |
| `npx nx run angular-ui-kit:build` | 127 entries built |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | built, 1281 stories (+9) |
| Story screenshots | new: `tmp/story-shots/069/build-new` (9 stories, 360/1280 L/D, axe 0), `build-new-menu-1150`, `build-new-fc` (forced colours). Compare vs `baseline` + `baseline-b`: 1156 shots, 1121 identical; differing: the 3 expected AC-5 stories (12), known random table ×6 / sidenav ×5, palette ×11 (AA only, Δ ≤ 3, deterministic, geometry identical, see AC-12), timeline *Horizontal German* 1280 light (the baseline shot is dark: baseline outlier). Menu + header-menu stories (60 shots) identical on the final build (`rerun-menu`) |
| `node tools/compat/check-angular-majors.mjs --only=22` | PASS, 139 checks (badge wrap class with the label) |

Spec pins changed (stated reasons): `description-list.icon.spec` 'href' row (one `<!--container-->` before `</a>`, design §9 AC-4) and badge row (label span, D-7); `badge.icon.spec` children (0 → label, dot → dot + label, dot/icon/label); `badge.wrap.spec` ×2 (children 0 → the label); `description-list.wrap.spec` allow-list of appended selectors + `lc-dl__external` (rules before `.lc-dl__sep`; the pinned 3.25.2 length/hash unchanged). `file-upload` forced-colours rules merged into one last block (`remove-target.spec` reads the last block; no assertion changed).

## Deviations from the design (need the designer's agreement)

| # | Design | Built | Why (measured) |
|---|---|---|---|
| 1 | §3D room below = vh − r.bottom − 8 − 8 (overlay) | 8 px more below an overlay origin (element or point): panel ends 16 px above the viewport edge; 702 px instead of 710 | CDK's fit test compares the pane's viewport y with the narrowed height (vh − 16), so a 710 px panel overflows by 7.5 px and CDK pushes it 7.5 px into the gap (pane top 416, gap 0.5 px). Measured: a stale-cap run placed the pane at 400 = 423.5 − 23.5, the band [0, vh − 16]. §9's unit case moved to anchor 126–162 (with 130–166 below is 110 < above 114 and it flips). Projected trigger keeps 8 px (no CDK) |
| 2 | — | `lc-menu__dropdown--room` with `transition-property: none` | under reduced motion the global 0.01 ms duration with `transition-property: all` made CDK read the old height right after the change (computed max-height 1118 px while the inline value was 702 px) |
| 3 | §8 stories with args (`isOpen` …) | a demo component opens the menu 100 ms after render; the button toggles it; controls `position`, `maxHeight` | the canvas padding arrives after the first render: a menu open at render measured 16 px too high (726 px) and the room is measured on open, resize and items only |
| 4 | §4 failed URL shows the ground | `.file-upload-image__img--failed { visibility: hidden }`, reset per `imageSrc`; image/empty text `pointer-events: none` | the mechanism for §4; no dragleave flicker over the children (as the drop zone) |
| 5 | §3B sketch without an accepted line | the accepted line shows when `accept` is set (as the drop zone); the always-rendered empty alert keeps the 8 px column gap under the field | §2 `imageHint` names the accepted and max lines |

## Changelog draft

### Added

- **`lc-description-list` external links** (finance-intelligence vertraege-2026-11-18 row 1, the contract „Details“ dialog): `DescriptionListItem.external` opens `href` in a new tab (`target="_blank"`, `rel="noopener noreferrer"`), draws a decorative `external-link` icon 4 px after the value's last word (1em, the link's colour, LinkText in forced colours, registered by the kit, never alone on a line) and reads `externalLinkHint` after the value (default „(opens in a new tab)“, as `lc-footer`; German „(öffnet in neuem Tab)“). Ignored without `href`; in `rows` the icon counts toward the value's share.
- **`lc-file-upload variant="image"`** (usm-x 2026-11-17 row 71, the logo in the settings): one image field with the current image (`imageSrc`, `imageAlt`) in a 160 × 96 tile (`--lc-file-upload-image-width` / `-height` / `-radius` / `-filter`) on a ground to judge it on (`imageBackground`: `surface`, `light`, `dark` = the dark rail, `checkered`), „Choose/Replace image“ and „Remove image“ buttons (48.5 px, `imageRemoved`, focus back on choose) and an announced in-place rejection (`typeRejectedLabel`, `sizeRejectedLabel` + max). Empty `accept` means `image/*`; one file, `filesSelected` emits `[file]`. Every text is an input; German fits at 360 px.
- **`lc-badge maxWidth`** (usm-x row 72, the recording bar): cuts the label on one line with an ellipsis (dot and icon stay), sets the whole text as `title` and keeps it in the DOM; `wrap` wins.
- **`lc-menu maxHeight="room"`** (usm-x row 73, addendum to row 54, the catalog row menu): the panel's height follows the room between its origin and the viewport edge on the side it opens to (8 px gap; 8 px margin, 16 px below an overlay), at least 3 items plus header and footer; that room picks the side (the `position` side while it holds min(240 px, the whole panel)). 26 entries on a 1150 px screen: 20 visible instead of 10.

### Changed

- `lc-badge`: the projected content sits in one inline `.lc-badge__label`, so mixed content keeps its spaces („Aufnahme läuft in **USM-1209**“, gap 3.7 px instead of 0). Boxes and glyphs measure the same; a projected `lc-icon` keeps its slot before the label (also inside an `@if`), a trailing one moves before it.

### Fixed

- `lc-description-list`: the separators of clickable rows stay straight at their rounded corners (068-n2).

### Compatibility

- No API breaks; every new input defaults to the 3.48 rendering. Badges have one more element (`.lc-badge__label`); selectors that expect the text as the badge span's direct child need it.
