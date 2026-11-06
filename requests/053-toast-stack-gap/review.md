# Review 053: lc-toast-outlet stack gap

## Round 1 — 2026-11-06, commit e4f3687

Screenshots: `tmp/story-shots/053/` — `r1` (90 shots at rest vs `baseline`), `r1-new` (3 new and changed stories, 360 · 1024 · 1280, light · dark, with the `gap-measure.js` measure inline, log `r1-new.log`), and `r1-scroll` (bottom stack at 200 %, log `r1-scroll.log`). The Storybook build is the developer's (not stale). `git diff --quiet 4bbc882 -- libs tools` holds, so no gate was re-run.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | Developer `tmp/053/ac1.log`: `default` with Success, Success, Error at 360: a 16–94, p 102–180, p 188–266, stack h 282; at 1280: 16–74 / 82–145 / 153–216; gaps `8 8`. Values match design §9 exactly. The gap spec pins the D-1 body `margin-top: var(--spacing-2);` with no literal value. |
| AC-2 | pass | `r1-new`: *Stack Spacing* top-right gaps `8 8` (a 16–74 / p 82–160 / p 168–267 at 360) and *Bottom Stack Order* (swapped) 674–732 / 740–818 / 826–884 at 360 (1024/1280: 694–752 / 760–818 / 826–884), in both themes. Unswapped `bottom-center` (developer `ac2.log`): p 654–732, p 740–798, a 806–884. |
| AC-3 | pass | `offsets` 360/1280 (`ac3.log`): stacks 64–154 and 720–810, h 90, sh = ch = 90, first/last 16. That is 3.33.0's geometry. The spec asserts no `gap`, `:empty` or `:has()`. |
| AC-4 | pass | `r1` vs `baseline`: **78 identical, 12 different**. The 12 are exactly the two expected stories (*Bottom Stack Order* ×6, *Toasts in the shell, large text* ×6). The developer's two `toasts-in-the-shell` dark flips are identical in r1, so they were raster flakes, as design §9 predicted. Opened shots: `diff -rq baseline-open build-open` shows no difference (8/8). |
| AC-5 | pass | `sticky` 360 × 640 at 200 % (`ac5.log`): sh 888 (was 824), first 32, gaps `16 16 16 16`, and the content ends 32 after the last toast. The bottom stack (`r1-scroll`, `bottom-center`, Show 7 at 200 %) has sh 888 / ch 640. At rest the newest toast is 32 from the edge, and scrolled to the far end (st −248) the oldest is 32 from the top. No extra scroll range. |
| AC-6 | pass | `toast-outlet.order.spec.ts` is not in `git diff main`. In *Bottom Stack Order* the newest toast (Success, polite) still sits at the edge at every width. |
| AC-7 | pass | The outlet toast has `margin-top` 8px and no bottom margin (`mt 8px/8px` in every run). The `toast.layout.spec.ts` diff touches only a comment, and the 7 standalone toast stories are identical by hash (in `r1`). |
| AC-8 | pass | *Stack Spacing* at 360: the toasts are 58 / 78 / 99 px high (the DE info toast takes 3 lines, hyphenated as „abge-schlossen“) and the gaps are `8 8`. From 1024: 58 / 63 / 78, 2 lines, gaps `8 8`. Opened at 360 L. |
| AC-9 | pass | `r1-new` gives the same rects in light and dark at all three widths. Forced colours (developer `build-fc`, opened 360 D): the 1 px borders show, the gap is Canvas, and the rects are unchanged. |
| AC-10 | pass | `toast-outlet.component.html` is not in the diff, and the TS diff is JSDoc only. Compat 22 is green (`build.md`). |
| AC-11 | pass | No input, output, hook or type changed. The gap spec pins the default DOM (6 stacks × 2 regions, `aria-atomic="false"`, no inline style). |
| AC-12 | pass | `feedback-toast-outlet--stack-spacing` shows 3 toasts in regions a, p, p, with the §7 strings and the §8 description. |

API check against design §2: nothing public changed. The outlet class JSDoc and the meta docs "4. Behaviour" describe the 8 px gap, the empty region and the 16 px padding, as in D-3.

Shots opened (6): *Stack Spacing* 360 L and 1280 D, *Bottom Stack Order* 360 L, *Toasts in the shell, large text* 360 L, and the forced-colours *Stack Spacing* 360 D. They show 8 px (16 at 200 %) of page between the cards, with no stray space at either end of a stack.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | nit | `toast-outlet.gap.spec.ts` l. 58–64 (AC-4 test) | Tests that describe behaviour. AC-4 was verified once by the shot compare (this review). | The test pins the length and sha1 of the rest of the compiled outlet CSS (2248, `4a24e1d9…`). Any later edit to `toast-outlet.component.scss`, or a change in the `sass` output format, fails it without any change in behaviour. The next request on the outlet should drop it, or replace it with the targeted assertions the other tests already make. |
| 2 | nit | `ToastOutletComponent` JSDoc and meta docs (wording since 3.33, request 052) | "top stacks the oldest at the top" should hold for the whole stack. | It holds only within a live region. In a top stack the assertive region always comes first, so with Success, Success, Error at 360 the newest toast (Error, 16–94) sits above both successes (`ac1.log`). Either correct the wording ("within each region; warnings and errors above") or mirror the `--latest` logic for top stacks. Pre-existing, not WCAG. |
| 3 | nit | *Stack Spacing* (also *Offsets*, *Bottom Stack Order*) | A fixed demo shows no controls, or only controls that act on it. | The meta's `position` and `duration` controls show up but do nothing: the demo has a fixed `top-right` position and `duration: 0`. This is the existing pattern of the other fixed demos. |

**Verdict:** approved. No must-fix or should-fix items. The three nits go to the backlog.
