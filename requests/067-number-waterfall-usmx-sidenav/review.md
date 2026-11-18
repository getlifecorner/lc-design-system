# Review 067: lc-number-input without steppers, lc-waterfall-chart long labels, USM X lc-sidenav gaps

## Round 1 — 2026-11-18, commit 8d66da8 (code = gate commit 334a293)

Storybook rebuilt (`--skip-nx-cache`; only the generated token files were newer). Shots and logs: `tmp/story-shots/067/r1-*`, `tmp/067/r1-*.log`. New stories: `r1-new` (7 × 360/1024/1280 × L/D, `--axe`, 42 shots); probes `r1-probe` (lazy load, menu, typed amounts), `r1-proto` (action focus), `r1-fc` (forced colours), `r1-px` (pixel location). 9 shots opened.

**Unchanged stories** (56 × 6 = 336 vs `baseline`, 900 ms wait): 327 identical; normalised DOM hashes 112/112 equal to `baseline-dom.log` (empty `div.lc-sidenav__top` stripped, design §9). Of the 9 differing, a rerun (`r1-re`) leaves: 4 one-pixel Δ 1 at the top-right corner (x 359/1023, y 6: sidebar-first-layout 1024/1280 L, the 1280 one byte-equal to the designer's second sample; prominent-brand 360 L; sidebar-first-collapsed 1024 L), known flakes; 3 identical on rerun; 2 deterministic AA-only (byte-equal in r1, rerun and the developer's runs): *Themed Rail Badges* 360 D, 18 px, Δ ≤ 36, x 34–37 at the right edge of the icons in item rows (`elementsFromPoint` → `a.lc-sidenav__nav-item`), and *Area Rail (German)* 360 D, 3 px, Δ ≤ 12, x 19–21 y 160, a section item's icon. Same DOM and geometry → accepted (deviation 5); re-baseline both.

| AC | Result | Evidence |
|---|---|---|
| N1 | pass | 14 number-input stories PNG + DOM identical; unit |
| N2 | pass | no `button` (btn 0); `aria-describedby` suffix + helper; unit (clamp, ArrowUp/Down, forms) |
| N3 | pass | *Sizes Without Steppers* 360 = 1280: control 26 / 34 / 42 / 46, inner 24 / 32 / 40 / 44 |
| N4 | pass | 360/1024/1280 L/D: control 112.6 × 46, value box 87.2, scroll 87 = client 87, „2960,00" 18 px, contrast 16.98 / 13.16; axe 0; FC border 1 px solid CanvasText |
| W1 | pass | unit; 564 px: Nicht/eingetr… with `<title>Nicht eingetreten</title>` |
| W2 | pass | 3 waterfall stories PNG + DOM identical |
| W3 | pass | *German Cause Names* 1024/1280: Periodi-/sierung, Verschie-/bung, Unge-/plant, Nicht/eingetr… [title], Preis, Menge, Einmalig, Nicht/erklärt, Summe; min gap 9.9; svg 264 |
| W4 | pass | 360 (W 328): 9 labels cut to 19.5–25.8 ≤ 25.8, all with `<title>`, gap 4.0, 250 high; *Five Causes* 360: as design §9, gap 10.1, 264; 1024/1280 one line (U+00AD invisible, „Periodisierung" 75.4); compat probe (developer) |
| W5 | pass | aria-label without U+00AD (`shy:false`); label 11 px, contrast 7.56 / 12.17; axe 0 |
| S1 | pass | *Top Slot* 360: slot at brand bottom 64 + 16, x 8, w 264, gap 8, first item = slot bottom + 16 (186); 1280: w 303; empty → no box (DOM hashes) |
| S2, S3 | pass | brand `href` …/start; static brand `DIV`, tabIndex −1, no role / aria-label |
| S4 | pass | *Brand And Hooks*: img 24 × 24 at 4,4 in the 32 tile, `filter: brightness(0) invert(1)`, `alt=""` |
| S5 | pass | *Deep Tree*: x 8/24/36/48/60, level-5 labels 131 (+ action) / 159; every ancestor `has-active-child`; loading row at x 60, 211 × 44 |
| S6 | pass | probe: fold „Ausgangsrechnungen", open „Archiv" → after the 600 ms `items` update it stays folded, Archiv 2024–2026 shown, status reports `archive`; seed `outgoing` open at start |
| S7 | **fail** | hit test ± 21 px 5/5 on both actions; menu 8 px below, right-aligned, focus in menu, Escape → focus back to `element` — but that button is invisible (F-1) |
| S8 | pass | ring 4.18 / 10.25 on the rail, 3.76 / 7.91 on the current item; petrol story ring 13.18 / 6.21; muted 5.58 / 7.53, section 7.23 / 12.53; icons 18 with the hook |
| S9 | pass | unit (palette, modal, menu, tooltip, `defaultPrevented`) |
| S10 | pass | *Brand And Hooks* brand 48; default 64 (DOM/PNG unchanged) |
| S11 | pass | marks „Rech ×3, rech" (bold 700, underline; FC underline + CanvasText); title only on the cut „Rechnungseingangsprüfung Lieferantenstammdaten"; template codes C11…C22 |
| S12 | fail (F-1) | axe 0 on 42 shots; Tab order 360 drawer: brand → × → Bereich → search → Suche leeren → items; DE strings; FC marks/border ok; keyboard focus on row actions invisible |

Deviations 1–3 accepted. 4: the hover-bg in the petrol recipe and the trigger-less menu box are fine; the fading button is F-1. 5: accepted (my run located it at 360 D, not 1280 L).

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | must-fix | sidenav row action buttons (every level since 3.47); *Deep Tree*, *With Groups And Actions*, 1280 L and FC | Design §4: focus → opacity 1 (WCAG 2.4.7); the anchor of an open menu stays visible | Focused with `:focus-visible` true → opacity **0** (both stories, also FC); after Escape the focus returns to an invisible button; opacity 0 while its menu is open. Cause: `.lc-sidenav__nav-item-row[_ngcontent] .lc-sidenav__action-btn[_ngcontent]` (0,4,0) beats `.lc-sidenav__action-btn[_ngcontent]:focus-visible` (0,3,0); pre-existing since 3.0 for top-level rows. Fix (in-place prototype `r1-proto`: focused 1, expanded 1, rest 0): in the `.lc-sidenav__nav-item-row` block add `.lc-sidenav__action-btn:focus-visible, .lc-sidenav__action-btn[aria-expanded='true'] { opacity: 1; }`; *Deep Tree* sets `aria-haspopup="menu"` and `aria-expanded` true/false on `element` on open/close; JSDoc + argType of `itemActionClick` say so (design §2/§4/§6 change note r1); a CSS pin in the spec |
| 2 | should-fix | sidenav row actions on touch (`hover: none`), 360 drawer | an action that answers taps is drawn | opacity 0 with no hover to reveal it, yet a 44 × 44 box at the row end answers taps, now at every level. Proposal: `@media (hover: none)` → opacity 1. Changes the touch look of existing apps → next bundle |
| 3 | should-fix | number-input `locale="de-DE"` (kosten row 5, euro amounts shown as „2.960,00 €") | „2.960,00" → 2960; „1.234" → 1234 (a point before 3 digits in a `,` locale groups) | typed „2.960,00" → „2,96000" = 2,96; „1.234" → 1,234 (probe `r1-probe`); pre-existing since 3.29, silent |
| 4 | nit | *Deep Tree* 360 | the status line (open ids, last action) visible | wraps below the 560 px frame (`overflow: hidden`), not visible |
| 5 | nit | waterfall, 9 bars at 360 | value labels readable | „+25200/-2400" and „+6370/43830" overlap (pre-existing, not in spec); category labels there are 2–3 letters („Ni…" twice, design §4 limit): docs could advise ≤ 5 bars below ~480 px |
| 6 | nit | number-input, forced colours | a focus mark | only the caret: halo dropped, border forced, input `outline: none`; add `:focus-within` `outline: 2px solid Highlight` as for the error state (pre-existing, all stories) |
| 7 | nit | sidenav API | declarative popup state | after F-1 the app sets `aria-expanded` on `element`; an `action.hasPopup` + open-id input would make it declarative and prerenderable |
| 8 | nit | `notification-center.icons.spec.ts` | stable | failed once under load (build.md gates) |

**Verdict:** changes requested (F-1). Round 2 checks: *Deep Tree* and *With Groups And Actions* 1280 L — focused action opacity 1 and a visible ring, `aria-expanded="true"` without hover → 1, rest 0; the sidenav stories at rest identical to `r1-ca`/`r1-cb`.
