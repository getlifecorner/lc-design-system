# Review 069: external description-list links, single-image upload, badge labels, menu height

## Round 1 — 2026-11-19, commit 340410c (code = gate commit 2727438)

Screenshots: `tmp/story-shots/069/` — compare `r1a` (vs `baseline`, 608 shots) and `r1b` (vs `baseline-b`, 548), new stories `r1-dl`, `r1-fb` (360 · 1024 · 1280, L · D, `--axe`), `r1-menu1150` (1280 × 1150), `r1-menu900`, `r1-fc` (forced colours); logs in `review/`. Storybook rebuilt once (stale after the library build's token step).

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | *External Links*: 15 external anchors, all `target="_blank"` + `rel="noopener noreferrer"`; other places in `description-list.external.spec` (35) |
| AC-2 | pass | icon 14 × 21 (md) / 12 × 18 (sm), `aria-hidden`, colour = link colour (L 26,106,121 · D 163,213,223); glyph renders without app registration (`viewProviders` kit icons); FC LinkText 0,0,159 |
| AC-3 | pass | name from content „… 2026 (öffnet in neuem Tab)“, `aria-label` null; axe 0 violations ×6. Input named `externalLinkHint` (design D-1, as `lc-footer`) |
| AC-4 | pass | internal link `<a class="lc-dl__link" href="#vertragspartner">Muster Rechenzentrum GmbH</a>` (no target/rel/icon); all 17 older dl stories hash-identical except the 3 AC-5 ones |
| AC-5 | pass | *Item Icons* 1280 rows·md·clickable: rows 1–2 `border-bottom` 0, `::after` 1 px solid, 250 px = row width, tops 93.4 / 159.4 / 204.4; same in *Clickable Rows* (EN/DE) 360/1024/1280; shot: straight lines at the rounded ends |
| AC-6 | pass | 360/1024/1280 L/D: icon − last glyph 4.0 px, bottoms Δ 2 (same line), dd overflow 0, page = viewport; focus ring visible around all fragments and the icon (shot 360 L) |
| AC-7 | pass | *Image*: preview `object-fit: contain`, alt „Company logo“, Replace + Remove; Choose only when empty (*Image German*); unit spec (24) |
| AC-8 | pass | *Image Backgrounds* L/D: surface #fff / #101c26, light #fff, dark #070e15 (both), checks neutral-300 (209,213,219 L · 75,85,99 D); decorative alt "" — FC see F-1 |
| AC-9 | pass | *Image Rejected German*: `[role=alert]` „Diese Datei ist zu groß. Höchstens: 85,0 KB“, value kept; disabled field: both buttons disabled |
| AC-10 | pass | buttons 48.5 high; 360 actions wrap under the tile (y 128 = 16 + 96 + 16), ≥ 1024 beside it at x 192 (16 gap); axe 0 ×24; drop/focus return in the unit spec |
| AC-11 | pass | *Image German* 360: 175.7 / 159.4 / 168.3 × 48.5, `scrollWidth − clientWidth` 0; dropzone stories hash-identical |
| AC-12 | pass | *Mixed Label* gap „in“→„USM“ 3.7 px (360/1024/1280); every badge story and badge consumer (dl, table, tabs, sidenav, card, palette, timeline) hash-identical |
| AC-13 | pass | *Max Width* 360: 256 px, label sw 575 > cw 221, `title` = whole text; xs–lg at `12rem` = 192 px, dot and icon kept |
| AC-14 | pass | text stays in the label (DOM); `wrap` + `maxWidth`: no `--truncate`, no style, no title (63 px, 3 lines) |
| AC-15 | pass | FC label CanvasText (0,0,0); `badge-contrast.spec` in the dev's green suite |
| AC-16 | pass | compare: 1133 of 1156 identical; differing = the 12 AC-5 shots + known flakes (table ×6, area-map all-bands ×2, sidenav ×3: pixel diff = rail icon edges x 34–37 Δ ≤ 36 and the busy spinner Δ ≤ 2, no badge pixels) |
| AC-17 | pass | *Long Menu Room* 1280 × 1150: trigger 379.5–423.5, panel 431.5–1133.5 = 702 px (margins 8/0), `--room-below`; 900 high: 535 px; bottom margin 16 px (deviation 1, accepted) |
| AC-18 | pass | *Flips Up* 1150: below 219.5 < 240 → above, panel 8.5–854.5 = 846 px, 8 px over the trigger; 900 high: 659 px |
| AC-19 | pass | 20 of 26 items fully visible at 1150 (> 15), 15 at 900; unit minimum case 126–162 |
| AC-20 | pass | End from item 1 → „Löschen“ focused and fully inside the list (scrollTop 179 / 35); 360 L/D page = 360; reduced motion: deviation 2 |
| AC-21 | pass | `git diff --quiet 2727438 -- libs tools` holds; the dev's suite, lint, build, tools, compat 22 on 2727438; pin changes with reasons in build.md |
| AC-22 | pass | JSDoc `@default` on all 13 new inputs and `external`; argTypes with `description` + `table.defaultValue` (file-upload 12, badge 1, dl 1, menu `maxHeight` text) |
| AC-23 | pass | changelog draft names vertraege row 1 („Details“ dialog), usm-x 71 (settings logo), 72 (recording bar), 73 (catalog row menu) |

### Deviations (build.md)

| # | Decision | Reason |
|---|---|---|
| 1 | accepted; design §2/§3D/§4/§9 corrected (change note) | verified in CDK 22.2.2: `_getOverlayFit` and `_pushOverlayOnScreen` compare the viewport y with vh − 16, so 8 px at the bottom gets pushed. 8 px less room (¼ row) is invisible next to 20 vs 10 rows |
| 2 | accepted | the dropdown has no transition of its own; only the global reduced-motion rule is cut |
| 3 | accepted | as the 3.48 *Anchored Overlay* demo; open state measured stable after 1 s at every width |
| 4 | accepted | implements §4; `visibility: hidden` keeps the ground |
| 5 | accepted (accepted line, as the drop zone); the 8 px gap → F-2 | |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F-1 | should-fix | `lc-file-upload variant="image"`, forced colours (*Image Backgrounds* 360 FC) | `light` / `dark` / `checkered` grounds keep their colours (`forced-color-adjust: none` on those tiles, border CanvasText), design §5 r1 | all grounds are Canvas (255,255,255) and the checks vanish; the requester's white silhouette (`brightness(0) invert(1)` on `dark`) measures 1.00 against its ground, invisible |
| F-2 | nit | image field, no rejection | nothing under the last line (§3B) | the empty `role=alert` line still takes the 8 px column gap; e.g. `.file-upload-image__error:empty { margin-block-start: calc(-1 * var(--spacing-2)) }` keeps the live region |
| F-3 | nit | *Image German* / *Image Rejected German* | hint, accepted and max lines say different things | „SVG oder PNG, höchstens 85 kB.“ + „Erlaubt: .svg,.png“ + „Höchstens: 85,0 KB“ (+ the error's max): the story invites consumers to repeat the limits; give the hint other content (e.g. what the logo is used for) |

**Verdict:** approved (no must-fix). F-1 and the nits go to the release's open items.
