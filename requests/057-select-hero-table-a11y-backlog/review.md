# Review 057: select clear area and focus, table action size, dl whitespace, hero slot colour and fill, list action, chart palette, dense strip, backlog

## Round 1 — 2026-11-10, commit 7becac5 (gates on faf1c15, `git diff --quiet faf1c15 -- libs tools` holds)

Screenshots: `tmp/story-shots/057/` (Storybook built 00:52, newer than every source file)
- `r1-new/`: the 10 stories of the task + *Chevron Rows* at 360 · 1024 · 1280, L · D, `--axe` (66 shots, 0 violations). Measure `r1-measure.js`: the developer's `/zz-057/m.mjs` (logic reviewed) plus play phase, clear-button rings, badge contrast and opacity chain, list row button name/ring/axe rules, strip pointerup focus and axe `target-size`.
- `r1-fc/`: forced colours, *Clear Tap Area* and *German Labels* at 360 L · D. `r1-charts/`: palette use in the 16 differing chart stories (`r1-chart-measure.js`). `r1-f4*/`: F-4 probes (`r1-f4*-measure.js`).
- Unchanged stories: `diff -rq` on the developer's folders: select 66/66 = `proto-select`; dl, card, accordion, strip 270/270 = baseline; table 150/162 (the 12 others are the known random-salary shots); hero 114/126 = `proto-hero` (Deviation 7). `list.component.html` changed at 00:42, after `build-list`, so I re-shot the 25 list and focus-context stories: `r1-list` **150/150** = `proto-list`.

I opened 10 shots.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | *Clear Tap Area* 360/1024/1280 L·D: × box 269–293 × 26–50; hit scan L 22 R 21 U 22 D 21 → area 259–303 × 16–60 (44 × 44); area right 303 = chevron left; chevron left + 0.5 → `combobox`; value ends 259; long value `ellipsis` |
| AC-2 | pass | select stories 66/66 = `proto-select`. *Touch Targets*: xs/sm/md `::before` `none`, values end 303/299/295 as 3.36; lg box 24 px |
| AC-3 | pass | `--axe` 0 violations, `target-size` not incomplete (12 shots). Focus: outline solid 2 px, `:focus-visible`. `::before` `""`, transparent, no outline or border; forced colours: ring `Highlight`, `::before` unpainted |
| AC-4 | pass | names „Auswahl löschen“ (DE story), „Clear selection“ (*Touch Targets*); spec |
| AC-5–8 | pass | *Focus After Tap* play `finished` in 6/6 shots, focus on `combobox` after the option click and after Escape on `<body>`, panel closed; no `mousedown` handler in the diff; spec for backdrop, multi, order |
| AC-9 | pass | *Action Sizes* every width: sm 38 / 30, lg 48.5 / 45.59, icon 20; row 63.5 / 74; names „Herkunft von Demo Netz“ |
| AC-10 | pass | table 150/162 + 12 random-salary shots; developer's temporary DOM spec (Deviation 3) |
| AC-11, 12 | pass | *In a Labelled Card*: text „aus USM übernommen 1 im Modul gepflegt 2 Fassung 1 Freigegeben Letzter Abgleich heute 06:00 automatisch Summe, Regeln 3“; `.lc-dl__sep` 0 px; `label-content-name-mismatch` and `nested-interactive` pass in 6/6. Card without `title`: see F-4 |
| AC-13 | pass | 270/270 identical |
| AC-14, 15 | pass | *Badges in the Body* L and D, all widths: 80 badges, 0 translucent fills, opacity chain 1 for all; min default 6.87, primary 8.49, success 4.85, warning 5.52, error 10.98, info 9.08 (= design §5); body `rgba(255,255,255,.85)` / light `rgba(31,41,55,.75)`, opacity 1; axe 0 violations (30 `color-contrast` incomplete = gradient). Body text < 4.5 on 6 bands stays F-1 |
| AC-16 | pass | 114/126 = `proto-hero`; 12 differ by anti-aliasing only (Deviation 7) |
| AC-17, 18 | pass | *Fill* 81 combos (3 variants × 3 sizes × 9 colours) at 360, 1024 and 1280, L·D: Δ 0, content top = padding, footer bottom = padding; `fill` off: band 322.67 vs card 641.39 (360), 319.98 vs 389.39 (1024) |
| AC-19 | pass | *German Labels* and *Chevron Rows*, 12 shots each: row has no `role`/`tabindex`, focusables in order row button 0 → action 0; ring `inset 0 0 0 2px` primary-500 (L `rgb(32,132,151)`, D `rgb(132,199,212)`), forced colours `outline 2px Highlight, offset −2px`; button: no outline, background or border; axe `nested-interactive` 12 pass, `button-name` 8 pass, 0 violations; list stories 150/150 |
| AC-20 | pass | `theme-contrast.spec`. 15 of the 16 differing chart stories paint entries 3/4 (`rgb(95,113,80)` / `rgb(133,90,34)` L), none paints the old fills; *Scatter Plot Compact* differs because its data is `Math.random()` (not the palette) |
| AC-21 | pass | *Many Segments*: scrub 328 × 32, `pan-y pinch-zoom`, picks by x match the hovered cell; pointerup focuses cell 30/60 and the caption shows it; axe `target-size` 90 pass, 0 incomplete |
| AC-22 | pass | strip stories identical (in the 270), strip spec 16/16 |
| AC-23 | pass | *German Labels* 360 L (shot read): „Kostenstel-len“, „Leistungsver-rechnung“, „Buchungs-kreis“, „Leistungsverrech-nung“, „Kostenstellen-Einzel-posten“: every in-word break has a hyphen; EN list stories identical |
| AC-24 | pass | *Collapsible*: closed footer `none`, open `flex` 48.5 px, closed again `none` (6/6) |
| AC-25 | pass | no Playwright/WebKit in this repo: 054-n2 stays in the backlog |

API (design §2): `TableAction.size?: ButtonSize` with JSDoc and `@default 'xs'`; `lc-hero` `fill = input(false, { transform: booleanAttribute })` with JSDoc `@default false`, argType with description and `table.defaultValue` `false`. Story IDs as in §8.

### Deviations (build.md)

| # | Decision | Reason |
|---|---|---|
| 1 | accepted | design §3 was incomplete: a badge + suffix also needs the 0 px separator. design.md §3 fixed with a change note |
| 2 | accepted | a link inside a `role="button"` card would nest a control; my §8 row was wrong. design.md §8 fixed with a change note |
| 3 | accepted | the static `size="xs"` attribute on the action's host is not read by the kit; the Compatibility line in the draft names it |
| 4 | accepted | every changed assertion keeps its value or is replaced by an equal or stricter one with a stated reason |
| 5 | accepted | floored pins under the rounded §5 values are the safer form |
| 6 | accepted | the removed „85 % opacity“ sentences would be false in 3.37 |
| 7 | accepted | 12 shots, max Δ 1–2 (buttons), ≤ 18 on 3 px (character), ≤ 11 (focus title), deterministic; the computed colours are equal (§5) |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F-4 | should-fix → queue | `lc-card` with `title` and `clickable` (the requester's regeln tile: title, count, dl) | A clickable card whose `ariaLabel` is its visible text passes axe `label-content-name-mismatch` also with a `title` (whitespace between the head and the body, as D-4) | Measured in Chromium, axe 4.14 (not jsdom only), *Clickable* card with one body line: `textContent` „Starteraus USM übernommen 1 …“; label „Starter aus USM übernommen 1 …“ → 1 violation; the glued label passes. The kit's tile has no title, so AC-12 passes; the requester's titled tile still can't be named by its text and keeps its transition (no `ariaLabel`) |
| C-1 | should-fix (changelog text, release-manager) | CHANGELOG draft, `lc-description-list` entry | Say what holds: „a clickable card without a `title` …“, and add under Known: a card with a `title` runs title and body together (057 F-4, queued) | The draft says „a clickable card whose `ariaLabel` is its visible text passes …“ without the limit |
| F-1 | should-fix → queue (design §5) | `lc-hero` body text, 6 of 9 bands | 4.5:1 for the body text, 3:1 for the title | primary 3.62, purple 3.81, secondary 2.70, orange 2.61, success 2.39, warning 2.01; title success 2.72, warning 2.26. Pre-existing |
| F-2 | nit → backlog (design §5) | `lc-select` xs/sm/md with a long value | the text ends before the × | ends 303/299/295, × starts 277. Pre-existing |
| F-3 | nit → backlog (design §5) | `CHART_PALETTE` secondary-500 | 3:1 on surface-2 and sunken | 2.98 / 2.83 |
| N-1 | nit → backlog | *Fill* story, 360 | the card column shows whole amounts and words | the dl in the 156 px column breaks „214.300 / ,00 €“, „175.7 / 30,00 / €“, „Reche / nzentr / um“ (2 columns at every width was my §3 choice; the dl's mid-number break is pre-existing) |
| N-2 | nit → backlog | *Action Sizes* story, 360 | the lg actions visible on a phone | the actions column is off-screen; the table scrolls (as before) |
| N-3 | nit → backlog | `lc-list` row name (*Chevron Rows*) | words separated, the action's name not inside the row's name | axe `accessibleText` of the row button: „…1000)Heute, 06:00 GeladenSAP-Ist laden“: parts run together and the action's name is part of the row name. Unchanged from 3.36 (AC-19 keeps names) |
| N-4 | nit → backlog | *Badges in the Body* | German labels | „Monatsstand · primary“ uses the token names |
| 054-n2 | stays in backlog | modal, confirm-dialog | manual Safari/iOS check | WebKit not installed (owner decision 2026-11-09) |

**Verdict:** approved. No must-fix. F-4, F-1 → queue; C-1 is a changelog correction for the release; F-2, F-3, N-1–N-4 → backlog.
