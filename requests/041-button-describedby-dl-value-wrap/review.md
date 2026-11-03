# Review 041: lc-button ariaDescribedBy; lc-description-list short values never break inside

## Round 1 — 2026-11-03, commit 0bfaf8e

Shots: `tmp/story-shots/041/r1-dl/` (320 · 360 · 1024 · 1280, L · D), `r1-button/` (320 · 360 · 1280, L · D), `r1-ac9/` (280 · 312 · 360, L · D). Measures: `story-measure.js` + leader/line-height block (inline in `r1-dl.log`), `r1-button-measure.js`. Storybook build of 0bfaf8e (libs tree = gate commit e0aff08); my 360 L shots are byte-identical (`cmp`) to the developer's `build-new-*`. Opened 5 shots: dl 360 L, 1280 D; disabled 360 L, 1280 D; loading 360 D.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `ariaDescribedBy = input('')`, JSDoc = design §2 verbatim with `@default ''`; describedby spec AC-1 |
| AC-2 | pass | template `[attr.aria-describedby]="ariaDescribedBy() \|\| null"`; spec AC-2; in the browser the outline „Abbrechen“ (unset) has no attribute, and no host carries it (`hostAttrs`: `disabledreason` / none) |
| AC-3 | pass | browser attributes: disabled `type, disabled, title=<reason>, aria-describedby=upload-reason, aria-disabled=true, aria-busy=false, class=btn btn-primary btn-md`; loading `aria-describedby=upload-status, aria-disabled=true, aria-busy=true, … btn-loading`. 5 existing button stories 20/20 identical (`diff -rq baseline-button build-button`); build.md's 60-input byte-identical HTML proof |
| AC-4 | pass | in the page (dom-accessibility-api 0.7.0, the engine behind the play's `toHaveAccessibleDescription`): name „Hochladen“, description „Wählen Sie zuerst eine Datei.“ (disabled) / „Die Datei wird hochgeladen …“ (loading) at all 12 shots; story render phase `finished` = both play functions passed. Limit: Chrome's native AX tree (CDP) and an audible screen reader not run; `computedName` not exposed |
| AC-5 | pass | reason 187.69 px / status 191.95 px, 1 line (14/21) at 320, 360, 1280; buttons 42/42 on one row, right edges flush (344 = 344 at 360), gap 8; page overflow 0; contrast text-secondary on canvas 7.56 L / 12.17 D; axe 0 violations in 12 (only `bypass` incomplete) |
| AC-6 | pass | `button-link.component.ts` JSDoc + `button-link.stories.ts` bullet carry the §2 sentence |
| AC-7 | pass | lists 202 / 234 (cards 280 / 312) at 360, 1024, 1280 L/D: „10“ 17.72 px, 1 line, 0 inside; term 152.28 / 184.28, 2 lines, 0 inside-word breaks; row and page overflow 0; axe 0 in 8. Also at 320 (second list 210): term 160.28, „10“ 1 line |
| AC-8 | pass | „1.234,56 €“ 74.33 px, 1 line, 0 inside; NBSP present (2 dd); term 95.67 (3 lines) / 127.67 (2 lines), 0 inside |
| AC-9 | pass | 3.3 story at 280/312/360 L/D: all 6 row strings equal to `ac9-before.log` (E-Mail 174.09 / 206.09 / 238.09; lists 248/280/312, overflow 0) |
| AC-10 | pass | 10 dl stories `--full`: 60/60 identical (`diff -rq baseline build-compare`, build 03:02, shots 03:03) |
| AC-11 | pass | no dl template change; build.md: semantics spec green, compat 22 PASS with both rules in the prerendered CSS |
| AC-12 | pass | build.md: 222 suites / 5215 passed, 0 edits to existing specs; changelog draft names gap row 7, Pixel 7 / iPhone 15, „Sekundäre Kostenart (Umlage)“ / „10“, no API break |

**build.md notes confirmed.** (1) Accordion body `line-height: 1.6` (`accordion.component.scss` l. 156): dd computes 14px / 22.4px; rows 60.78 (2 lines) / 83.17 (3 lines); leaderTop 16.59 in every row. Leader centre 17.09 px from the row top = line middle 19.2 − 0.15em (2.1), the same y as a centred one-line leader. (2) Row 4 term „Abgewiesener Betrag (Umlage)“ is the prototype term (`proto2-measure.js`); the sketch's "Betrag der Zeilen mit Umlage" came from an earlier word list. Both were design errors: design.md §3.2/§9 corrected with a change note; no code change.

**API check (§2):** names, type, default, JSDoc, argType (`control: 'text'`, description, `defaultValue "''"`), story ids and titles, dl class JSDoc and meta bullet all as designed.

**Accepted, no action:** in a wrapped row the leader starts at the term box's edge, so a short last term line leaves a gap before the dots (e.g. „Periode nach dem“ at 202). A wrapped flex item fills its share; design §3.2 sketched it so.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | nit (fixed in design.md) | design §3.2, §9 AC-7/8 | row 58, leaderTop 15.9, row 4 "Betrag der …" | 60.78 / 16.59 / „Abgewiesener Betrag (Umlage)“, as built; design corrected |

**Verdict:** approved
