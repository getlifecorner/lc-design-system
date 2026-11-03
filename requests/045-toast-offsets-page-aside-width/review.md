# Review 045: Toast offsets in the app shell, reserved aside column, wide page content

## Round 1 — 2026-11-03, commit cf60d73 (libs/tools = 2bfae1f)

Screenshots: mine in `tmp/story-shots/045/r1-*` (logs beside them; measures = the developer's `/zz-045/m.mjs` modes `wait`, `open`, `frame`, `focus`, `kbd`, command in each log's run). The Storybook build matches the source (story-shots didn't refuse it). 11 shots opened: *Toasts in the shell* 360 L / 1280 D, *… large text* 360 L, *Offsets* 360 L, *Reserved* 1280 L / 1920 D, *Wide page* 360 L / 1280 L / 1920 D, *Wide page with a right column* 1280 L. The rest checked by measure.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `r1-open.log`: outlet *Default* / *Bottom Center* opened, 8/8 hash-identical to the designer's overflow prototype `proto-open`; rects = `baseline-open` (360: 16/16, 16/94, 328 × 78; bottom-center 806/728; 1280: 896.06/16, 910.36/74). `r1-rest-toast.log`: 44/44 at-rest toast/outlet shots identical. *Offsets* host style holds only the hooks; no shell → no frame vars |
| AC-2 | pass | `r1-toasts.log` 360 L/D: bar 16 538 328 × 86, frame bottom `102px`, bottom toast 464 + 58 = 522 = bar top − 16. Unit: bar `bottom: 50px` (inset 34) + 86 → `136px` (build.md) |
| AC-3 | pass, known limit | Header 56 → top toast y 72 at 360, 1024, 1280 (frame top `56px`). At 360 the toast (72–130, from x 103.8) covers the last letter of the h1 „Heute“ (80–117): the limit design §6 names, documented in the JSDoc and the story docs (finding 4) |
| AC-4 | pass | `r1-offsets.log` 360/1280 L/D: top toast y 80, bottom toast ends 794 = 900 − 106. Shell from 1024: frame bottom `env(safe-area-inset-bottom, 0px)`, toast ends 624 = 640 − 16. Hooks declared nowhere, `@default`s in the JSDoc (outlet spec) |
| AC-5 | pass | *Large text* 360 × 640: header 176.98, bar 442 × 182, stack 176.98…442 (265), sh 814 > ch 265, page scrollWidth 360. `r1-focus.log`: focus on „Benachrichtigung schließen“ scrolls 0 → −496, button 88 × 88 inside the stack. At 1024/1280: stack 96…640, sh 562 > ch 544. Stack padding is 1rem = 32 px at 200 % (design §3 corrected) |
| AC-6 | pass | Toast colours unchanged (44/44 identical). Prerender: compat 22 PASS with the outlet check (build.md, not re-run) |
| AC-7 | pass | `r1-page.log` *Reserved*: column 920/360, 1040/400, 1460/460; content 296/568, 320/648, 430/880; header row tint on |
| AC-8 | pass | Reserved: `DIV aria-hidden=true role=null tab=-1 kids=0`; inside `lc-app-page` 0 `aside` / `complementary` (the 1 counted is the sidenav's) |
| AC-9 | pass | *Reserved and named* = *Today (desktop)* in every rect at 360–1920 (1280: main 240/680, content 296/568, aside 920 64 360 × 501.5); 1024: 288/688, column 0 × 0. Reserved 1280 main/content = Today's |
| AC-10 | pass | `r1-rest-shell.log`: 184/190 identical; the 6 different are all *Full-height nav*, a hash-unstable story (re-run `r1-fhn.log`: again 6, a different set; build.md had 4 others). Unnamed DOM byte-identical (`tmp/045/dom-proof.txt`) |
| AC-11 | pass | Tint rgb(246,250,251) / rgb(15,28,38), hairline rgb(215,235,239) / rgba(132,199,212,.14) = named aside (design §5: 1.23 / 1.30, decorative). `r1-forced.log`: `background: none`, `border-image: none`, border black / white |
| AC-12 | pass | `AppPageContentWidth` exported (`export *`), JSDoc `@default 'default'`, argType inline-radio with description and default |
| AC-13 | pass | *Wide page* 1280/1300/1440/1920: `[page-wide]` 296/928→1224, 296/928→1224, 320/928→1248, 430/928→1358; page header and card 568/588/648/880; header tint `none`; scrollWidth = vw. Named aside: wide yields (AC-15) |
| AC-14 | pass | 360/640/1024: `[page-wide]` = content 24/312, 32/576, 288/688 |
| AC-15 | pass | *With a right column* 1280/1920: table 296/568, 430/880, aside 920/360 with tint; DOM main → aside |
| AC-16 | pass | `wideMax` spec (880px → none, 1000px, 60rem, none → 100vw); inline cap stays `880px` |
| AC-17 | pass | `r1-kbd.log` 1280 L/D: last sortable th „Kontostand“ focused, region scrolls 0 → 191, 2 px ring offset −2 #208497 / #84c7d4, page scrollX 0. FC shots: tint off, border CanvasText |
| AC-18–20 | pass | 7 stories, IDs as design §8, argTypes with description + default; JSDoc + meta docs (no `docs/app-shell.mdx`, design §8); DE toasts unclipped at 360/1280; the DE table scrolls inside its region only (1119 px in 312 / 928) |

**API check (design §2):** hooks `--lc-toast-outlet-offset-top/-bottom`, inputs `reserveAside` (`input(false)`, as `busy`) and `contentWidth`, slot `[page-wide]`, type and internal service as specified; JSDoc sentences and defaults match.

**Deviation 1 (nested `@if`): agreed.** Each branch of a chain has its own anchor, so the chain would change every page's DOM (AC-10); nested, only a named aside gains two comment nodes, which no layout, CSS or AX tree sees. My design was wrong; design.md §2/§3 fixed with a change note. Deviations 2–4 agreed (4 is the toast's own width, §3 sketch corrected).

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | nit | *Wide page*, 1280–1920, L/D | The story's table fits the 928 px it shows off (the account-page case), e.g. without „Letzte Aktualisierung“ or with wrapping headers; the long DE holder stays | Table 1119 px in a 928 region: „LETZTE AKTUALISIERUNG“ cut at the region edge, „Kontostand“ out of view at rest (content from design §7, my choice) |
| 2 | nit | `lc-toast-outlet` bottom stacks (3.27.2 behaviour, out of 045 scope) | Newest toast nearest the edge, as the SCSS comment says | Live level first, then append order: at 200 % the newest error (with its close) sits at −230…48, scrolled out, while the older warning is at the edge |
| 3 | nit | Changelog draft, Compatibility | "Every at-rest shot identical except the hash-unstable *Full-height nav* story" | "230 of 234 … the 4 others": the count changes per run (4, 6, 6) |
| 4 | nit (known limit) | Shell, `top-*` toasts at 360 | — | A top toast covers a title placed right under the header (y 72 vs h1 80); documented, `bottom-*` recommended |

**Verdict:** approved
