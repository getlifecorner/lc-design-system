# Review 022: Bank accounts kit gaps (BA-1, BA-3, BA-4, BA-5, TD-3, TD-4)

## Round 1 — 2026-10-31, commit ec72046 (libs/tools = gate commit 9a397eb)

Screenshots: my runs are in `tmp/story-shots/022/r1/` (19 new stories, 360 · 1024 · 1280, light · dark, `--axe`, 114 shots), plus `r1-ax` (AX and forced-colors probes) and `r1-hook0` (switch stories with `--lc-switch-min-height: 0`, compared with `baseline`). Logs are in `tmp/story-shots/022/r1-*.log`. The Storybook build was current. I opened 12 shots: table clickable-rows 1280 L and 360 D, money sign-display 360 L and in-text-and-rtl 360 D, switch sizes-and-positions 360 L, card equal-answers 360 L and 1280 D, list link-rows 360 L and link-rows-small 360 D, finance-icons 1280 L, sidenav finance 1280 D, and switch all-variants 360 L (from `compare`).

**Unchanged stories:** I ran `diff -rq baseline compare` (328 shots). 34 shots differ: 28 are the 7 expected switch stories, and 6 are the table *With Pagination*, *With Filtering* and *Full Featured* at 1280. Those 6 are noise from the `Math.random()` salaries at `table.stories.ts:181`, which predate this request. With `--lc-switch-min-height: 0`, all 28 switch shots are hash-identical to the 3.15 baseline (`r1-hook0`, rows 21 / 24 / 28).

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `aria-describedby` equals the help id on all 36 measured rows, and the ids are unique. `switch.help-text.spec.ts`. |
| AC-2 | pass | At 1280 the sm / md / lg rows are 45 / 46.5 / 48.5 in both positions, and the sm row without help is 44. At 360 they are 86 / 87.5 / 89.5 (2-line label) and 65 / 66.5 / 68.5. The track centre equals the centre of the label's first line (10.5 / 12 / 14). |
| AC-3 | pass | DE help: 2 lines at 360 (column x 16–284), 6 lines at 200 % (column 16–224). No help or document overflow. Contrast 7.56 light, 12.17 dark on the page. A tap on the help hits the label (`elementFromPoint`). |
| AC-4 | pass | Only the 7 listed switch stories differ, and the hook at `0` restores them exactly (above). The existing specs are unchanged. |
| AC-5 | pass | 4 rows with `tabindex` 0 and `cursor: pointer`. Focused row 2: outline 2 px solid #208497 / #84c7d4, offset −2, contrast 4.37 / 9.13. The forced-colors rule `outline: Highlight` is in the stylesheet. Enter, Space and the prevented scroll are covered in `table.clickable.spec.ts`. |
| AC-6 | pass | Jest: a button, a link or a switch in a row emits 0. Each story row holds 1 switch and 1 button. |
| AC-7 | pass | The `<caption>` is the first child: 16/600/24, a 36 px box, x = table x = 16, thead at y 52. axe name "Umsätze Oktober 2026", contrast 17.74 / 15.85. Hidden: a 1×1 clip, still the name. |
| AC-8 | pass | 19 table stories are identical apart from the noise above. *Hidden Caption* (no `clickable`) has no row tab stops. |
| AC-9, AC-10 | pass | Browser strings equal the design §9 / Jest strings: `−42,17 €`, `−€42.17`, `−$42.17`, `1.234.567,89 €`, `90.071.992.547.409,91 €`, `9.007.199.254.740.991 ¥`, `−4.217 ¥`, `−4,217 KWD`. |
| AC-11 | pass | The spoken text says "minus"/"plus" exactly where the sign shows (12 cells). The amount is `aria-hidden`. axe text of a table cell: "minus 84,50 Euro", once. Limit: VoiceOver and NVDA can't run here, so this is axe's text model only. |
| AC-12 | pass | `1.111,11 €` = `8.888,88 €` = 81.42 px, and `−42,17 €` = `+42,17 €` = 67.22. Every amount is 1 line at 360. `dir="ltr"` inside the `rtl` paragraph, `tabular-nums`, `nowrap`. |
| AC-13 | pass | The colour equals the parent's on every amount. There is no tone input. |
| AC-14 | pass (gate) | compat 22 money HTML check (build.md). Not re-run. |
| AC-15 | pass | 360: 291×48.5 at y 136 / 193 (8 apart), primary first. 1024/1280: 125.92 + 191 wide, 8 apart, at the card's end. Stacked: full width 280 / 920 / 1176. `outline lg tone-primary`, no chevron. Text 8.81 / 11.34, border 6.21 / 10.81. Soft card: 7.82 / 8.93 and 5.48 / 8.61. |
| AC-16 | pass | 14 card stories are identical. At 200 %, 360: "Ja, teilen" is 1 line (95 high) and "Nein, nicht teilen" 3 lines (185), breaking at spaces, no overflow. |
| AC-17 | pass | 0 resource entries for the 3 names. 4 distinct glyphs × 5 sizes (16–40 px), and the `shield-lock` solid glyph is inline. `icon.finance-icons.spec.ts`. |
| AC-18 | pass | Bottom nav and sidenav: "Finanzen" has `aria-current="page"` and the wallet glyph. "Banken" shows building-bank. Byte note in the changelog draft. |
| AC-19 | pass | `a[href]` in `role=listitem`, 0 nested controls, no underline, inherited colour. Inset ring 2 px, 4.37 / 9.13. Heights: sm label-only 44 (probe), sm with subtitle 59–60, md 71–96. Limit: axe's text model joins label and subtitle without a space; Chromium separates the blockified spans. This predates 022 (clickable rows). |
| AC-20 | pass | The router story prevents the navigation and logs it, and the docs show the `navigateByUrl` snippet. Jest: modifier and middle clicks are not emitted and not prevented. |
| AC-21 | pass | The disabled account is a plain `div` with `aria-disabled` and no `href`. The action is dropped with a warning (Jest). axe: 0 violations. |
| AC-22 | pass | 17 list, 3 density and 6 app-shell stories are identical, and the specs are unchanged. |
| AC-23 | pass, see S2 | 114 shots, axe 0 violations. Forced-colors rings exist for the table and the list. Nothing new animates. |
| AC-24 | pass | Every optional input has `@default`. The new argTypes have a description and a default. Both READMEs and `internationalization.mdx` list `lc-money`. Tools 22/22 (build.md). |
| AC-25 | pass (gate) | Build: 120 entries incl. `money`; compat 22 (build.md). Angular 21 runs in CI and the release gates. |

**Deviations (build.md):**
- (2) host `position: relative` is accepted: the document stays 360 wide at 360.
- (3) unquoted role values are accepted.
- (4) named, focusable scroll regions are accepted: axe 0.
- (1) does not hold, see S1.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| S1 | should-fix | table *Clickable Rows*, *Hidden Caption*; all widths, L/D | The "Betrag" header ends where the amounts end: 752.14 at 1024, 946.23 at 1280 (build.md Deviation 1 says it does). | The header is `text-align: left`; its text ends at 718.84 / 880.78. The kit's scoped `.lc-table thead tr th` (0,5,3 with the `_ngcontent` attributes) beats the story's global `.lc-table-story__cell--end` (0,1,0). Fix: end-align it in the story, for example `text-align: end !important` with an "until 021's `align`" comment. Also correct Deviation 1. |
| S2 | should-fix | money *Sign Display*, 360, L/D | No page overflow at 360. | `scrollWidth` is 364, and the "€" of the third column is cut at the viewport edge. Fix: th/td padding 24 → 16, or the named scroll region from *Locales and Currencies*. |
| N1 | nit (predates 022) | table `actionsAlign="end"`, e.g. *With Icon-Only Actions* 1280 | The "Aktionen" header lines up with its buttons, as the scss comment at l. 252 claims. | The header text ends at 1086 and the buttons at 1220: `.lc-table th.lc-table__actions-cell--end` (0,4,1) loses to the same (0,5,3) rule. Hand it to 021, whose `align` must beat that rule too, or a 3.16.x fix. |
| N2 | nit (predates 022) | bottom-nav *Finance Destination*, 360 | — | The document is 376 wide: the 360 px `phoneFrame` plus 16 padding, as in every phoneFrame story. |

**Verdict:** approved. There is no must-fix. S1 and S2 are story-only, and the release lists them.
