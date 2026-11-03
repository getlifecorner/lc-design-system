# Review 042: Focus indicators, focus over hover, dependency-viewer at 360 px, file-upload remove target

## Round 1 — 2026-11-03, commit c13101d (libs = gate commit 6ce0dcc; Storybook build 04:35, current)

Screenshots: `tmp/story-shots/042/` — `r1/` at-rest compare (1,090 shots vs `baseline`, logs `r1-{a..e}.log`), `r1-new/` 23 new/changed stories at 360 · 1024 · 1280, light · dark, `--axe` (138 shots, `r1-new-{a,b}.log`), `r1-kanban/` ring-offset prototype (`r1-kanban-measure.js`). 10 shots opened.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | design §6.1 rows B–F all fixed; developer's re-run of `sweep-measure.js` on this build (`tmp/042/sweep-*.log`, 04:47): no kit row without its own ring |
| AC-2 | **fail (1 state)** | 16 *Keyboard Focus* stories × 6: every focused element `:focus-visible`, ring 2 px primary-500, min **3.23** L (callout error) / **6.34** D (tag ×), room ≥ 8 for outside rings, opacity 1. D-5 panels 3.80 / 9.46 (button), 4.17 / 7.57 (tooltip), 4.36 / 9.12 (toolbar). **Kanban card on an over-limit column: 2.19:1 light** (finding 1) |
| AC-3 | pass | `tmp/042/ring-fc.log`: 38 indicators Highlight (emulated rgba(5,0,73,.8) / rgba(0,230,255,.8)); only the disabled chat send has none (Deviation 7, unfocusable) |
| AC-4 | pass | `fv true` on all 96 play-focused shots; reset `button:focus:not(:focus-visible)`; guard `focus-indicators.spec.ts` |
| AC-5 | pass | reset narrowed; at-rest compare **1,070 / 1,090 identical**; 20 differ = D-5 stories (12, intended) + chat *With File Upload* (4, `Date.now()`) + scatter *Compact* (4, `Math.random()`). The developer's header/gallery noise did not recur |
| AC-6 | pass | `tmp/042/hover-{light,dark}.log` (my `hover-measure.js`, this build): 162 field rows per theme all `SAME`; textarea/datepicker 1.89 → 4.36 L, 4.31 → 9.95 D |
| AC-7 | pass | rest/hover columns equal the before-logs (148 rows per theme); every field story hash-identical at rest |
| AC-8 | pass | *Phone Width (German)* 360 L/D: scale .83, label **10.0** px, stroke **1.25** px, node 200 px, 0 of 10 nodes outside `[0, 681]`, first node x 20 = 24 × .83, pageX 0; EN .90 / 10.76 / 1.35, scrollWidth 687 |
| AC-9 | pass | 25 dep stories × 360 / 1024 / 1280 × L/D = 150 shots identical |
| AC-10 | pass | DE: max 2 label lines, 0 labels wider than their node, no ellipsis, region "Freigabeprozess", host 720.5; 1024 / 1280: scale 1, centred (136.5 / 136.5 px each side), no region attributes; prerender height: unit spec |
| AC-11 | pass | *Remove Targets* 360 / 1024 / 1280 L/D: `::before` 44 × 44, centre ± 21.5 hits, ± 23 misses, right edge = row inner edge (343 at 360), rows 42, hit areas 6 px apart |
| AC-12 | pass | names "Remove file bericht-2026.csv" … / "Datei entfernen ist.csv"; ring 2 px offset 2, 4.17 L / 7.57 D on the row; FC Highlight |
| AC-13 | pass | API diff: only `regionLabel` (`input('Dependency graph')`, JSDoc with `@default`, argType with description + `table.defaultValue`); `removeFileAriaLabel` gains JSDoc `@default` |
| AC-14 | **fail (story-level)** | new/changed stories: 0 violations caused by this change. Pre-existing in touched D-5 stories: button *Destructive Action* `svg-img-alt` (6/6), tooltip *Toolbar* `button-name` (6/6) → finding 2. Kit findings the new stories expose (confirmed on unchanged counterparts, `tmp/042/axe-existing.log`) → F-26 |
| AC-15 | pass | 19 new stories with the designed IDs; changelog draft (kanban line to update, finding 1) |

### Decisions asked for

- **Kanban ring:** inset **−2 px** for every card. Prototype on *With WIP Overflow* (`r1-kanban.log`): ring vs over-limit tint `#f7a1a1` 2.19 L (outside, offsets 2 and 0 alike), vs the card surface 4.36 L / 9.12 D; an inset ring always sits on the card, so the column tint (over-limit, drop target, surface-2) no longer matters. Shot `r1-kanban/…--1280-light.png`: clearly a 2 px edge, distinct from the 1 px rest border. design.md change r1.
- **Deviations accepted:** 1 (box-less stage; 150 dep shots identical; a generic `div` with `display: contents` has no role to lose), 2 (vertical wheel zooms, sideways wheel scrolls: resolves my contradictory §3), 3 (D-5 inks: text 10.97 L / 9.01 D on the error panel, 7.55 / 11.15 in the toolbar card), 4–8 as recorded. design.md §3 updated.
- **F-26 accepted** as a follow-up (kit contrast/region findings, out of scope). New **F-27**: kanban over-limit column title 3.80:1 light (axe `color-contrast` on *With WIP Overflow*), because `--color-error-50` is `#f7a1a1` in light; `--color-error-subtle` gives 6.58. Rest-look change, own request.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix | `kanban-board.component.scss` `.lc-kanban__card:focus-visible`; *With WIP Overflow* light | `outline-offset: -2px` (design §3 r1): ring vs card 4.36 L / 9.12 D in any column; guard `focus-indicators.spec.ts` rows/assertion → `-2px` (reason: review r1); *Keyboard Focus* description "2 px inside the card edge (4.36:1 light, 9.12:1 dark on the card)"; changelog "for an inset ring" | offset 2: 2.19:1 light on the over-limit column |
| 2 | should-fix | button *Destructive Action*; tooltip *Toolbar (Composition)* (D-5 stories, all widths/themes) | 0 axe violations (AC-14 touched stories): `[decorative]="true"` on the trash icon; each toolbar button gets an `ariaLabel` (Bold, Italic, …) and a glyph that renders (register the icons in the story like other icon stories) | `svg-img-alt`; six empty, unnamed 30 px buttons (`button-name`) |
| 3 | should-fix | dependency-viewer *Phone Width* (EN) description | EN values: nodes 223 → 200 px, scale 0.90, labels 10.8 px, borders 1.35 px (r1-new-b) | states the DE values (240 px, 0.83, 10 px, 1.25 px) |
| 4 | should-fix | *Phone Width (German)*, 360 L | no English text: `relationLabel: 'hängt ab von'` on the DE graph's `dependsOn` entries (the legend's only label source) | legend reads "depends on" |
| 5 | should-fix | tag-input *Keyboard Focus*, all widths | field empty after the tag is added, as after real typing: let change detection run between the `input` event and Enter (`await new Promise((r) => setTimeout(r))`) | field still shows "Kostenstellenverar…" (OnPush `[value]` never saw the typed value, so the reset to `''` writes nothing) |

**Verdict:** changes requested (finding 1; findings 2–5 are story-only and ride along).

## Round 2 — 2026-11-03, commit e56f61a (libs = gate commit bc2de05; Storybook build 05:17, current)

Screenshots: `tmp/story-shots/042/r2/` (the 7 touched stories × 360 · 1024 · 1280 × L · D, `--axe`, own measure, log `r2.log`), `r2-rest/` (4 kanban stories at rest vs `baseline`, 16 shots, `r2-rest.log`). Since r1 only `kanban-board.component.scss` changed in library code (`git diff c13101d bc2de05`); the rest are stories and the guard spec. 6 shots opened.

| Finding | Result | Evidence |
|---|---|---|
| 1 | fixed | *With WIP Overflow* over-limit card and *Keyboard Focus* card, all widths: `:focus-visible`, 2 px solid, offset −2 px, ring vs card **4.36 L / 9.12 D**, no shadow, opacity 1, border primary-500; shot 360 L: 2 px edge inside the card on the `#f7a1a1` column. Kanban at rest: **16 / 16 identical** to baseline. Guard spec row and assertion `-2px` with reason; story text and changelog say "inset" |
| 2 | fixed | button *Destructive Action*: trash svg `aria-hidden="true"`, texts 10.97 L / 9.01 D, ring on the panel 3.80 L / 9.46 D, axe 0 (6 shots). Tooltip *Toolbar*: 6 buttons named Bold … Align right, `btn-ghost`, 30 × 30, glyph svg 20 px `aria-hidden`, ink **7.23 L / 9.25 D** on the panel, hover (text-primary on surface-hover) 16.11 / 11.62, ring 4.17 / 7.57, axe 0 (6 shots) |
| 3 | fixed | *Phone Width* text "223 px nodes drawn 200 px wide, scale 0.90: labels 10.8 px, borders 1.35 px"; measured 360: scale .897, node 200.0, label 10.76, stroke 1.35, region "Dependency graph", scrollWidth 687, pageX 0 |
| 4 | fixed | *Phone Width (German)* legend `["hängt ab von"]`, 0 × "depends on" in the story DOM (all widths); 360: scale .833, label 10.00, stroke 1.25, region "Freigabeprozess", scrollWidth 681; 1024 / 1280: scale 1, node 240, no region |
| 5 | fixed | tag-input *Keyboard Focus*, all widths: field value "", tags `["Kostenstellenverantwortung×"]`, × focused "Entfernen Kostenstellenverantwortung", ring 2 px, 3.43 L / 6.34 D, opacity 1 |

| AC | Result | Evidence |
|---|---|---|
| AC-2 | pass | kanban 4.36 / 9.12 in any column (above); every other row as in round 1 |
| AC-14 | pass | 42 shots: 6 violations, all pre-existing and accepted: kanban over-limit title `color-contrast` (F-27, 3 L) and tag chip text (F-26, 3 L). 0 caused by this change, 0 story-level |
| AC-1, 3–13, 15 | pass | as in round 1; library code unchanged except the kanban offset |

### Decisions

- **Deviation 9 accepted.** `variant="text"` is not a `ButtonVariant`, so the buttons had no variant styles. `ghost` is the kit's text-only button: transparent at rest, `--color-text-secondary` glyphs (7.23 / 9.25), a hover fill. design.md §8 updated (change r2).

### Findings

None. Open follow-ups for the release notes: F-22 to F-27 (design.md §9).

**Verdict:** approved.
