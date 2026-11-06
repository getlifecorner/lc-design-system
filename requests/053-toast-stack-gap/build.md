# Build 053: lc-toast-outlet stack gap

- **Branch:** `fix/3.33.1-toast-stack-gap`
- **Commit:** see `git log -1` (one commit, amended after review rounds): fix(toast-outlet): 8 px between the toasts of a stack (053, 052-s2)

## Files changed

| File | Change |
|---|---|
| `libs/angular-ui-kit/src/lib/toast/toast-outlet.component.scss` | D-1 rule `.lc-toast-outlet__region > lc-toast { margin-top: var(--spacing-2) }` after the region base rule; D-2 `padding-top: calc(var(--spacing-4) - var(--spacing-2))` after the stack's `padding` |
| `…/toast/toast-outlet.component.ts` | JSDoc only (D-3): 8 px apart, no space from an empty region or after the last toast |
| `…/toast/toast-outlet.stories.ts` | Docs "4. Behaviour" (D-3); demo `lc-toast-outlet-stack-spacing-demo` + story *Stack Spacing* (`StackSpacing`, design §7/§8 strings and description) |
| `…/toast/toast.layout.spec.ts` | Header comment only ("touching" → "8 px apart since 3.33.1"); no assertion changed |
| `…/toast/toast-outlet.gap.spec.ts` | New, 8 tests (see below) |

Unchanged as required: `toast-outlet.component.html`, `toast.component.scss`, `toast-outlet.order.spec.ts` (`git diff main` on them is empty).

## Acceptance criteria

Measured with the designer's `gap-measure.js` on the build (light; L = D in the new story).

| AC | Covered by | Measured |
|---|---|---|
| AC-1 | gap spec: D-1 body exactly `margin-top: var(--spacing-2);`, D-2 in the stack rule; `default` + Success, Success, Error | 360: a 16–94, p 102–180, p 188–266, h 282; 1280: 16–74, 82–145, 153–216; gaps 8 8 |
| AC-2 | gap spec (DOM: every toast a direct region child, top-right and bottom-center); `stack-spacing`, `bottom-stack-order`, `bottom-center` + Success, Info, Error | top 16–74 / 82–160 / 168–267; swapped 674–732 / 740–818 / 826–884; unswapped p 654–732, p 740–798, a 806–884; all gaps 8 |
| AC-3 | gap spec: no `gap`, `:empty`, `:has()`, only one margin; `offsets` 360/1280 | stacks 64–154 and 720–810, h 90, sh = ch = 90, first/last 16; empty stacks 24 px |
| AC-4 | gap spec pins the rest of the compiled CSS to 3.33.0 (2248 chars, sha1 `4a24e1d9…`, compared once with a copy of the 3.33.0 file); shot compare | open 8/8 identical; rest: see Gates |
| AC-5 | `sticky` 360 × 640, 200 %, "Show 7 (max 5 stack)" | sh 888 (was 824), ch 640, first 32, gaps 16 16 16 16, content end 888 − last toast 856 = 32 |
| AC-6 | `toast-outlet.order.spec.ts` unchanged and green | — |
| AC-7 | gap spec: `margin-top/bottom` in `toast.component.scss` only on `lc-toast:not(lc-toast-outlet lc-toast)`; `toast.layout.spec.ts` AC-3 unchanged | outlet toast `margin-top` 8px, no bottom margin (`mt` 8px in every run) |
| AC-8 | `stack-spacing` 360: 58 / 78 / 99 px toasts, info toast 3 lines (2 from 1024) | gaps 8 8 |
| AC-9 | `stack-spacing` 360/1024/1280 L/D + `--forced-colors` 360 L/D | the same rects in L, D and FC; FC borders visible, gap shows Canvas |
| AC-10 | template unchanged; gap spec: no `[style]` in the default DOM nor on toasts; compat 22 green | — |
| AC-11 | gap spec pins the default DOM (6 stacks × assertive/polite regions, `aria-atomic="false"`, no toast, no style); the existing outlet specs green; TS diff JSDoc only | — |
| AC-12 | `feedback-toast-outlet--stack-spacing` in the Storybook index | 3 `lc-toast`, regions a, p, p |

## Gates

All gates ran on the tree of commit `4bbc882f2d961e595a237025a570b6c7dc895fe9` (later agents skip a gate while `git diff --quiet 4bbc882f2d961e595a237025a570b6c7dc895fe9 -- libs tools` holds; the amend that added the request documents changed nothing under `libs` or `tools`).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 271 suites, 5903 passed, 8 skipped (`--runInBand`, 76 s; the new gap spec has 8 tests). The machine ran at load 55–72: default workers and `--maxWorkers=2` lost suites to SIGSEGV and timeouts (icon, input.error-class, calendar axe), all green alone and in band |
| `npm run test:tools` (stories changed) | 22 passed |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | 122 "Built" lines, green |
| `npx nx run angular-ui-kit:build-storybook` | green, 1077 stories (+1) |
| Story screenshots | New: `tmp/story-shots/053/build-new` (6, L/D × 360/1024/1280), `build-fc` (FC 360 L/D). Compare `build` vs `baseline`: 76 identical, 14 different = the 12 expected (`bottom-stack-order` ×6, `toasts-in-the-shell-large-text` ×6) + `toasts-in-the-shell` 360 D and 1024 D. Those two are raster flips (design §9 note): a rerun (`build-shell`) had 360 D and 1024 D identical and 1280 D different, with the stacks at 56–146 and 810–900 (708–798 at 360), h 90, first/last 16 in all three. Opened `build-open` vs `baseline-open`: 8/8 identical. AC measures: `build-ac1`, `-ac2`, `-ac3`, `-ac5` (logs `tmp/053/ac*.log`) |
| `node tools/compat/check-angular-majors.mjs --only=22` | green, 101 HTML checks (the outlet is prerendered on the tt page) |

## Deviations from the design

None.

## Changelog draft

### Fixed

- **Toast outlet: toasts in a stack no longer touch** (052-s2, review of request 052): the toasts of a stack are 8 px (`--spacing-2`) apart, within a live region and across the polite and assertive regions, in top and bottom stacks and in either bottom-stack order (they were 0 px apart). The first toast stays 16 px from the stack's edge, an empty region and the last toast add no space, and a single toast renders exactly as before. At 200 % text the gap is 16 px, so a full stack of 5 scrolls 64 px further (at 360 × 640: 888 instead of 824 px). CSS only, the same before JavaScript runs. Story *Stack Spacing*.

### Compatibility

- No API breaks. Visible change: toasts in a stack move apart by 8 px each. An empty stack's (invisible, click-through) box is 24 px high instead of 32.
