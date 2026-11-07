# Review 056: lc-state-strip, dl badge/total, list chevron, header contextBadge, hero headingLevel/focusTitle, band, table footerRow/action ariaLabel, card collapsible, inverse-outline, backlog

## Round 1 — 2026-11-07, commit e3d55a0 (gates on 4d8d21a, `git diff --quiet 4d8d21a e3d55a0 -- libs tools` holds)

Screenshots: `tmp/story-shots/056/` (Storybook built 16:25, current)
- `r1/`: the 21 new stories at 360 · 1024 · 1280, L · D, `--axe`, measure `r1-measure.js` (the developer's `/zz-056/m.mjs` after a logic review, plus h1/h2 counts, dl total text, tfoot roles, card hit tests, list row roles).
- `r1-states/`: keys, focus, clicks and story args (`r1-state-measure.js`). Triggers use `HTMLElement.click()`, which doesn't focus (the WebKit tap).
- `r1-fc/`: forced colours, 10 stories at 360 L · D (`r1-fc-measure.js`). `r1-heading/`: h1–h6 clones on 9 existing hero stories (`r1-heading-measure.js`).
- Unchanged stories: `diff -rq baseline build-1…4` gives 762/768 identical. The 6 that differ are the 6 unstable table shots of design §9 (the Salary column only, `tmp/056/table-diff.log`). `header.component.scss` and `stacked-bar-chart.stories.ts` changed at 16:24, after those shots, so I re-shot the 31 header and stacked-bar stories on the current build: `r1-cmp` gives 124/124 identical.

I opened 12 shots.

| AC | Result | Evidence |
|---|---|---|
| AC-1, AC-2 | pass | *Empty*: host `display: none`, box 0. Names „Last 10 load runs, 9 succeeded, 1 failed“, „Letzte 10 Ladeläufe, 9 geladen, 1 fehlgeschlagen“, *All States* „3 succeeded, 2 with warnings, 2 failed, 3 pending“ |
| AC-3 | pass | One `tabindex="0"` (index 9). ←, ←, Home, ←, End, →, Esc give 8, 7, 0, 0, 9, 9, and the caption hides (4/4 shots). Hover shows the caption, pointer leave + blur hides it. Ring 2 px, offset −2: 4.37 L, 9.95 D on the canvas. Forced colours: `Highlight` |
| AC-4 | pass | Marks: success top 4, h 11; error top 17, h 11; warning top 8, h 16; neutral top 15, h 2. Colours = §5 tokens. Forced colours: `CanvasText`, neutral `GrayText`, `forced-color-adjust: none` |
| AC-5 | pass | 10 runs: 240 × 32 at every width. 30 runs: cell 10.92, mark 5.48. 60 runs: 5.45 / 2.73. Host scroll 0, page overflow 0 in all 126 shots. Prerender: `EXPECT_IN_HTML` +8 (compat log). See S-1 |
| AC-6 | pass | All 6 stories have the §8 IDs. Both READMEs list the component (root l. 27, lib l. 152). Manifest: developer's temporary test. CHANGELOG: draft in build.md |
| AC-7 | pass | Badge rows: 38.5 (rows md), 62.5 (stacked), 27 (sm list, `xs` badge 20 px). „1 [Freigegeben]“ keeps the value text before the badge (D-2). axe 0 |
| AC-8 | pass | A chevron ends the 3 `role="button"` rows and the 2 link rows; the 2 plain rows have none. 20 px, `#5c6672`, svg `aria-hidden`, forced colours `CanvasText`. The disabled row dims it with the row. N-1, F-2 |
| AC-9, AC-10 | pass | 360 (`below`): button 352 × 49.61, name 252 of 422 px with „…“, badge 69.91 × 24 whole. 1024 and 1280 (inline): 303.13 / 286.97 / 340 (cap) × 49.61. Header scroll 0. Name „Monatsstand wählen, Monatsstand Oktober 2026 · Fassung 1, Freigegeben“. axe label-in-name 0 at all widths |
| AC-11, AC-12 | pass | Total rows: 41 (rows), 66 (stacked), 30 (sm). Rules 1 px solid and 3 px double `rgb(107, 114, 128)`. dt and dd 600, `tabular-nums`. Text „Summe, Gesamtkosten Ist 522.530,00 €“. Forced colours: `CanvasText`, double kept |
| AC-13, AC-14 | pass | `r1-heading`: h1–h6 clones of every hero title match in 16 properties and height (sm/md/lg, slim, light, light-slim, page band, with media) at 360/1024/1280. *Heading Level*: 1 `h1` (page header) and 1 `h2` in `#storybook-root` |
| AC-15, AC-16 | pass | Gaps left/right 0/0 at 328, 992, 1248 and 928. Height 24. Parts 41.2 / 23.0 / 18.0 / 11.0 / 6.8 %. Gap stroke = surface (forced colours: `Canvas`). Part contrast: theme-contrast spec (§5) |
| AC-17–19 | pass | `tfoot` is last. Table `treegrid`; footer `tr` = row, `th scope="row"` = rowheader, `td` = gridcell. Label x 52 = level-0 x 52. Rules 1 px / 3 px double, forced colours `CanvasText`. Below 800 px it scrolls with the table (D-7) |
| AC-20 | pass | Names „Herkunft von Demo Netz“, „… WAN-Anbindung“, „… LAN und WLAN“, each containing the visible „Herkunft“. axe 0 |
| AC-21–24 | pass | Heads at 360: 123.55 (open), 45.58 (closed), 110.55 (closed + action). Subtitle, icon tile and chevron hit the toggle in all 3 cards of all 6 shots; the action hits itself. Ring 2 px, offset 2: 4.37 L / 9.13 D against the card; forced colours `Highlight`. Tab order: toggle, action. A click flips `aria-expanded` and `hidden`. `aria-controls` resolves 3/3; described by the subtitle. Titles hyphenate („Kostenstellenverant-wortung“). N-2 |
| AC-25, AC-26 | pass | After `play`: focused, `tabindex="-1"`, `:focus-visible`, `aria-labelledby="lc-hero-label-2 lc-hero-title-1"`. Ring: white, 2 px, offset 2, plus a 2 px `#111827` band (≥ 4.23, spec). Forced colours: `Highlight`, no shadow |
| AC-27, AC-28 | pass | Both variants: lg 48.5, md 42, sm 35.5, icon-only 45.59 (24 buttons in *Stage Actions*, plus the button and link stories). Focus on the warning band: white ring + band on both. Focused loading: opacity 1. Disabled: .5, not focusable. Forced colours: border `ButtonText`, ring `Highlight`. At 360 the DE pair wraps (133 + 152 + 12 > 288); `inverse-outline` reads as the quieter one |
| AC-29 | pass | `updateStoryArgs` on *Long Tags* and *Touch Targets*: `disabled` disables the input, `removable: false` gives 0 ×, `maxTags: 3` makes it read-only (4/4). The 12 baseline shots are identical |
| AC-30 | pass | The spec pins the four × rules one by one, plus a mutation test |
| AC-31 | pass | *Hamburger Focus Return*: after `.click()` the focus is on the drawer's ×. ×, Escape and backdrop return it to the hamburger `<button>`: 12/12 |
| AC-32 | pass | No `role`, error id in `aria-describedby`, focus in the input (all 6 shots) |
| AC-33 | pass | No WebKit here: 054-n2 stays in the backlog. The release-manager adds the note (deviation 6) |
| AC-34 | pass | build.md gates on 4d8d21a. Compare as above. axe: 120/126 shots clean; the other 6 are *Chevron Rows* `nested-interactive` (F-2) |

API check against §2: names, types, defaults, JSDoc (`@default` on every input), exported types, `DEFAULT_STATE_STRIP_LABELS`, `ButtonVariant`, the new entry (stub, `index.ts`, `src/index.ts` l. 206) and the argTypes (description + default) all match.

### Deviations (build.md)

| # | Ruling |
|---|---|
| 1 (D-11) | **Accepted.** Fallbacks in `render` keep every control live (AC-29, measured) and avoid `Infinity` in the args. §1 D-11 is corrected |
| 2 (rowheader) | **The design was inconsistent.** §6 said gridcells, while §9 and AC-19 named `rowheader`. A rowheader names the row like `th scope="row"` outside tree mode. §6 is corrected |
| 3 (mark inset) | **The design was inconsistent.** §4's „30 → 9.8 px, mark 3.8“ assumed a plain 3 px inset in 294 px, while §3 specifies `min(3px, 25%)`. The build follows §3. §4 is corrected (10.92 / 5.48; 60 runs 5.45 / 2.73) |
| 4 (specs) | **Accepted.** Each change has a stated reason; the pinned values are unchanged |
| 5 (head cursor) | **Accepted.** The toggle's `::after` covers the head, so the whole head is the target. Added to §3 |
| 6, 7 | **Accepted.** Backlog note for the release-manager. The *Band* constants with `controls.include` limited to bound args |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| S-1 | should-fix → queue | `lc-state-strip`, *Many Segments*, 360 | Hover and click show the caption, so the cells are pointer targets (design §6 was wrong to call them none). Document in the `segments` JSDoc and the story that runs narrower than 24 px are below WCAG 2.5.8, then decide whether dense strips need a different pointer path | 30 runs: 10.92 × 32; 60 runs: 5.45 × 32, no spacing. axe `target-size` incomplete on 90 nodes. 10 runs (24 × 32) pass |
| F-2 | should-fix → queue | `lc-list` `clickable` + `action`, *Chevron Rows* | The row action is not nested inside `role="button"` (WCAG 4.1.2) | axe `nested-interactive` in 6/6 shots. Pre-existing since 3.3 (the developer's temporary spec shows the DOM equals main) |
| F-1 | should-fix → queue (design §1) | `CHART_PALETTE`, 13 charts | 3:1 for parts against light pages | `--color-success-default` 2.47–2.72, `--color-warning-default` 2.05–2.26 |
| N-1 | nit → backlog | `lc-list` label, *Chevron Rows*, 360, DE | German compounds break with a hyphen (`hyphens: auto` under `lang`), as the card title does | `overflow-wrap: anywhere` without `hyphens`: „USM-Leistungsverre / chnung“ (md), „…verrechnu / ng“ (sm). The chevron's 32 px makes such breaks happen more often. Pre-existing |
| N-2 | nit → backlog | card *Collapsible* story | One closed card has a `[card-footer]`, so the story shows AC-22's footer hiding | No card in the story has a footer; the behaviour is covered only by the unit test |
| 054-n2 | stays in backlog | modal, confirm-dialog | Manual Safari/iOS check | WebKit is not installed (owner decision 2026-11-07) |

**Verdict:** approved
