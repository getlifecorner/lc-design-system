# Review 066: description-list item icon, accordion nested open state, timeline horizontal overflow

## Round 1 — 2026-11-18, commit 18b6636

Screenshots: `tmp/story-shots/066/r1-new/` (4 new stories × 360 · 1024 · 1280 × light · dark, `--axe`, log `r1-new.log`). The developer's at-rest compares were re-checked byte for byte (`diff -rq baseline build-a|build-b`): 254 identical, and the 10 differing shots are exactly §9's list. The dl prototypes are in `r1-dlproto{,2}/` (logs `r1-dlproto{,2}.log`), and the live timeline resize is `r1-ro.log`. Storybook build 12:45 is newer than every source file, and the gate tree is unchanged since `8befc11`.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | 96/96 dl baseline shots byte-identical; icon spec (dev) |
| AC-2 | **fail** | icon box gap 4, but icon → first glyph of a wrapped `rows` value 13.6–69.8 px (F-1); total breaks „+12.400,00 \| €“ at 1280 (F-2). Size 14/12, centre on line 1 ≤ 0.9 px, inks equal: ok |
| AC-3, AC-4, AC-6 | pass | icon spec (dev, gates on `8befc11`); axe 0 on 6 *Item Icons* shots |
| AC-5 | pass (re-check after F-1) | the icon is on line 1 in every row at 360 L/D; FC svg = dd colour (dev `build-fc`); compat `--only=22` ok |
| AC-7 | pass | `r1-new.log`, all 6 shots: closed children panel 0, body 0/0 `hidden`, chevron `none`, head padding 10/14/18, order −1 leading / 0 trailing; *Verschachtelt* child chevron x 48 = parent title x 48 |
| AC-8, AC-9 | pass | `tmp/066/measure-acc8.log`: child 0 → 60 → 0, parent 309.6 → 369.6 → 309.6; closed parent hides its open child (inert); nested spec |
| AC-10 | pass | 108/108 accordion and accordion-group shots byte-identical |
| AC-11 | pass | axe 0 on 12 accordion shots; nested spec (Tab order, `aria-expanded`) |
| AC-12 | pass | 360 L/D: sw/cw 512/328, `tabindex="0"`, `aria-label="Zeitleiste"`, list role kept, outline 2 px solid `#208497` L / `#84c7d4` D, offset 2, ring x 12–348 y 12–104.5 (inside 360); axe 0. Arrow keys: native scrolling of a focused `overflow-x: auto` list; story-shots can't send real keys (limit) |
| AC-13 | pass | `r1-ro.log` live: 512/328 tab stop → host 600 px: no tabindex, name or class (focus falls to `body`, accepted in §4) → back: tab stop again → 540 px: none. 1024/1280: none |
| AC-14 | pass | title − marker centre 0.0 on all 4 items at 360/1024/1280; *Horizontal* 1280 and *Selectable Horizontal* 1024 diffs show only the centring |
| AC-15 | pass | scroll spec (dev); DE story name „Zeitleiste“ |
| AC-16 | pass | 254 identical + 10 expected; forced colours ring `rgba(5,0,73,.8)` L / `rgba(0,230,255,.8)` D (dev `shots-fc.log`) |

**API (§2):** `DescriptionListItem.icon` and `scrollLabel` match §2 in name, type, default and JSDoc; the `scrollLabel` argType has its description and `'Timeline'`; the `items` description names `icon`. **Build deviations:** 1 and 2 are F-1 and F-2 (design error, decided below). 3 (wrap spec allow-list), 4 (60 px child panel from the story's one-line body) and 5 (entry size) are accepted.

### Decisions on build.md Deviations 1 and 2

- **Deviation 1 → design was wrong; new D-6.** §3 drew „[↑]·6,7 % über“, but its rules put the icon at the start of a text box that fills the row, with line 1 right-aligned. In the requester's own case (*rows · md* at 360) the arrow stands 34.4 px from „6,7 % über“ and reads as part of the term column. In `rows` the icon row becomes inline with `white-space: nowrap`, and the text inside gets `white-space: normal`. The icon is then glued 4 px before line 1's first glyph, the lines stay right-aligned, and a long first word breaks beside it. `stacked` keeps its hanging lines. Prototype: glyph gap 4.0 on all 23 rows at 360/1024/1280, row heights unchanged.
- **Deviation 2 → new D-7.** The icon took its 18 px out of the 3.39 basis that protects short values, so the total broke before „€“ at 1280. A value with an icon gets `flex-basis: min(100%, calc(7em + var(--spacing-1)))`, the 6em of text plus the icon. Prototype: the total fits (dd 112.3), the `sm` variance fits at 360, and terms beside icon values give up ≤ 9 px. A value longer than its share still wraps, as any value does (156 px card); that part of Deviation 2 is accepted.
- design.md has a change note, D-6/D-7, the §3 rows and the §9 AC-2 values.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F-1 | must-fix | *Item Icons*, every `rows` card, 360/1024/1280 L | icon → first glyph of line 1 = 4 ± 0.5 on every row, wrapped ones included (design §3 r1 rules D-6; proto `r1-dlproto2.log`) | 360: rows md „6,7 % über \| Budget“ 34.4, „heute 06:00 \| automatisch“ 44.5; sm 45.8 / 69.8; 156 px 33.4 / 30.4; 1280: 13.6–41.8 |
| F-2 | must-fix | *Item Icons* rows md and clickable, 1280 L | the total on one line, „↑ +12.400,00 €“ (dd 112.3; D-7: `lc-dl__value--icon` + basis rule, §2/§3 r1) | „+12.400,00 \| €“, dd 109 |
| F-3 | should-fix | *Item Icons* docs, SCSS comment, changelog draft | the wording says what r1 does: in `rows` the icon stands 4 px before line 1 and the lines stay right-aligned; in `stacked` they hang after it; the icon counts toward the value's share. Add a 156 px `stacked` card beside the 156 px `rows` card, so the hanging lines (D-1) have a review surface | the story says „the value's second line hangs after the icon“ for the `rows` card, and no wrapped `stacked` value is shown |
| F-4 | nit | `description-list.component.html` comment above the icon branch | „kosten row 3“ | „kosten row 4“ (row 4 is the accordion) |
| F-5 | nit | *Horizontal, German* | controls only for what the render binds (`controls.include: ['items', 'orientation', 'scrollLabel']`), or bind every arg (pitfall 055 r1) | `compact`, `selectable` and `selectedId` show controls that do nothing |
| F-6 | nit (pre-existing, backlog) | *Item Icons* rows md clickable, 1280 L | a total row's rules run straight to the row ends | the row radius (`--border-radius-sm`) curves both ends of the 1 px rule above and of the double rule below |

**Verdict:** changes requested (F-1, F-2). In round 2, re-shoot *Item Icons* only, with r1 glyph gaps and row heights per §9 AC-2. The other three new stories and the at-rest compares stay approved as long as the timeline and accordion sources are unchanged.
