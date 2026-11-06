# Design 053: lc-toast-outlet stack gap

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-12
- **Version:** patch 3.33.1. Measured on the 3.33.0 build of `main` (fd05860) with an injected CSS prototype.

## 1. Approach

Extend `toast-outlet.component.scss` only. **Every toast in a region keeps `--spacing-2` above it, and the stack's top padding gives those 8 px back.** No state selector, no template change.

| # | Rule (new or changed) | Effect |
|---|---|---|
| D-1 | New rule `.lc-toast-outlet__region > lc-toast { margin-top: var(--spacing-2); }`, placed after the region base rule as its own rule | 8 px above every toast. Regions always run top to bottom (top stacks: `inherit` → `column`; bottom stacks: `column`, 3.33), so the margin always sits between a toast and the one visually above it, including across regions in either `--latest` order. No margin below, so nothing is added after the last toast. An empty region has no toast, so it adds nothing. |
| D-2 | In `.lc-toast-outlet__stack`, keep `padding: var(--spacing-4)` and add `padding-top: calc(var(--spacing-4) - var(--spacing-2))` right after it, with a comment | The visually first toast stays 16 px from the stack's top (8 padding + 8 margin), as in 3.33. Bottom, left and right padding are unchanged. |
| D-3 | Docs only: the outlet class JSDoc, the meta docs "4. Behaviour", and the `toast.layout.spec.ts` header comment ("touching" → "8 px apart, 3.33.1") | Consumers read the new spacing. |

The pinned rules stay byte-identical: the region base rule (`toast-outlet.order.spec.ts` l. 102), the two bottom rules (l. 94, 97), and the absence of any `--top-* > .lc-toast-outlet__region` selector (l. 103). `toast.component.scss` doesn't change (AC-7).

Rejected techniques (prototyped or checked on 3.33.0):

| Technique | Why not |
|---|---|
| Stack `gap` + region `margin-top: -8px` + toast `margin-top: 8px` (keeps the padding literal) | Prototyped: a bottom stack with one empty region gets `scrollHeight` 98 > `clientHeight` 90 (8 px scroll range, and a scrollbar with classic scrollbars). The empty region's box moves into the end padding. |
| Stack/region `gap` + `.lc-toast-outlet__region:empty { … }` | `:empty` holds today (all 12 empty regions match, since Angular emits only comments), but it depends on the template's text nodes. Taking the region out of flow (`position: absolute`, `width: 100%`) overflows sideways, and a negative margin overflows as above. A region `gap` would also change the pinned base rule. |
| `display: contents` on the regions | The live regions can drop out of the accessibility tree (older WebKit), and `order: -1` on `--latest` stops working. |
| `:has()` | The spec allows it only with a fallback that gives the same layout. There isn't one here. |
| `lc-toast + lc-toast` only | Misses the gap between the two regions. |

## 2. Public API

None changed. There are no new inputs, outputs, slots, hooks or types. The template is unchanged, and the component TS changes only in its JSDoc (D-3; AC-11). The single-toast default renders as before. The prototype gave identical geometry in every single-toast case, and identical hashes in 8/8 opened shots and in the Offsets and Toasts-in-the-shell shots (see §9 for one raster note). The only box change nobody can see: an **empty** stack is 24 px high instead of 32. It has no paint and `pointer-events: none`.

## 3. Anatomy and layout

### 360 px, Stack Spacing story (top-right, `lang="de"`, light; measured on the prototype)

```
x 0                                                    360
y 0   ┌ stack (fixed, 360 × 283, padding 8/16/16/16) ───┐
      │ 8 padding + 8 margin = 16                        │
y 16  │  ┌ error · assertive · 58 ────────────────────┐ │ x 20.5, w 323.5
      │  │ (x) Synchronisierung fehlgeschlagen.   [×] │ │
y 74  │  └────────────────────────────────────────────┘ │
      │  8  (--spacing-2: margin-top of the next toast) │ ← across regions
y 82  │  ┌ success · polite · 78 (2 lines) ───────────┐ │ x 16, w 328
      │  │ (✓) Änderungen       Rückgängig        [×] │ │
      │  │     gespeichert.                           │ │
y 160 │  └────────────────────────────────────────────┘ │
      │  8                                              │ ← within a region
y 168 │  ┌ info · polite · 99 (3 lines, DE) ──────────┐ │ x 16, w 328
      │  │ (i) Kontoauszugsverarbeitung …         [×] │ │
y 267 │  └────────────────────────────────────────────┘ │
      │ 16 padding-bottom (no margin after the last)     │
y 283 └──────────────────────────────────────────────────┘
```

### From 1024 px (1280 shown; 1024 is the same minus 256 in x)

```
                                     x 864 ───────────── 1264 (= 1280 − 16)
y 16–74    error   (1 line)          x 940.5  w 323.5
y 82–145   success (1 line + action) x 889.6  w 374.4
y 153–231  info    (2 lines, DE)     x 864    w 400 (max)
stack 0–247; gaps 8 / 8; first 16, last 16
```

### Bottom stacks (Bottom Stack Order story, 360 × 900; `--latest` = polite, i.e. swapped)

```
y 658  stack top (was 674)    16 = 8 + 8
y 674–732  Warning  (assertive)            8
y 740–818  Error    (assertive)            8   ← across regions
y 826–884  Success  (polite, --latest, at the edge; unchanged)
y 900  viewport bottom (padding 16, unchanged)
```

| Element | Value | Token |
|---|---|---|
| Gap between two toasts (in a region and across regions) | 8 px (16 px at 200 % text; rem token) | `margin-top: var(--spacing-2)` on each outlet toast |
| Stack top padding | 8 px + the first toast's 8 = 16 (32 at 200 %) | `calc(var(--spacing-4) - var(--spacing-2))` |
| Stack right, bottom and left padding | 16 px, unchanged | `--spacing-4` |
| Toast widths, x positions, alignment | unchanged (content-sized, ≤ 400) | — |

## 4. States

| State | Behaviour |
|---|---|
| Default, hover, focus-visible, active | Unchanged. The close and action rings sit inside their own boxes. |
| Enter | `slideIn` is transform only (and none with reduced motion), so the new toast takes its 8 px at once. Layout isn't animated. |
| Leave | The toast is removed together with the 8 px above it (each toast owns the space above it), so no double or missing gap is left. |
| Empty (no toasts) | The stack box is 24 px, invisible and click-through. |
| One region empty | No leading, trailing or doubled gap (AC-3). Measured: Offsets, and BottomCenter after one click. |
| Many items | 5 toasts at 200 % text, 360 × 640: `scrollHeight` 824 → 888 (+4 × 16). The first toast is at 32 at rest. Scrolled to the end, the last toast ends 32 above the stack's end, as before. |
| Long German / different heights | The gap is 8 px between 58, 78 and 99 px toasts (§3). |
| Hit areas | 8 px of click-through page between the toasts, which used to touch. That's better for WCAG 2.5.8, and the 44 px targets are unchanged. |

## 5. Theming

Layout only. No colour, token or theme rule changes. The gap shows the page between two cards, whose borders and shadows already meet the page at the outer edges, so there's no new colour pair to compute. In both themes the gap is identical (`--spacing-2` is theme-independent).

## 6. Accessibility

- **Semantics, ARIA, announcements:** the DOM, the two `aria-live` regions per stack, `aria-atomic="false"` and the append order are all unchanged. The template isn't touched, so what screen readers announce doesn't change.
- **Keyboard and focus order:** unchanged, and the toasts never take focus. Focus scrolling in a scrolling stack is unchanged (the margins are inside the scrollable area).
- **Targets:** close and action stay 44 × 44, now with 8 px between neighbouring toasts.
- **forced-colors:** the 1 px toast borders separate the cards, and the gap shows `Canvas`. There's no FC rule to add.
- **Reduced motion:** nothing animated is added.

## 7. Texts

There are no built-in strings. The story strings (DE, `lang="de"` on the outlet's wrapper; close label `Benachrichtigung schließen`):

| Toast | Variant (region) | Text |
|---|---|---|
| 1 | error (assertive) | `Synchronisierung fehlgeschlagen.` |
| 2 | success (polite), action | `Änderungen gespeichert.` · action `Rückgängig` |
| 3 | info (polite) | `Kontoauszugsverarbeitung abgeschlossen: 12 Buchungen übernommen.` (3 lines at 360, 2 from 1024) |

Assumption (AC-8): the toast has no per-toast `lang`, so the story is German throughout (as life-os is). What AC-8 tests is that the gap doesn't depend on height next to a one-line toast, and toast 1 is that one-line toast.

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| **Stack Spacing** (new, export `StackSpacing`) | `feedback-toast-outlet--stack-spacing` | none (fixed `top-right`, like *Bottom Stack Order*) | A demo `lc-toast-outlet-stack-spacing-demo` shows toasts 1–3 of §7 on init, in that order, with `duration: 0`, inside `<div lang="de">` around `<lc-toast-outlet closeAriaLabel="Benachrichtigung schließen" />`. Docs: `story: { inline: false, height: '480px' }`. Description: "3.33.1 (request 053, 052-s2): toasts in a stack are 8 px (`--spacing-2`) apart, within a live region and across the two (assertive: the error; polite: the success and the info toast), with no extra space for an empty region or after the last toast. The German info toast wraps to 3 lines at 360 px and to 2 from 1024 px; the gap stays 8 px. For bottom stacks, see *Bottom Stack Order*." |
| Bottom Stack Order (code unchanged) | `feedback-toast-outlet--bottom-stack-order` | — | Now shows 8 px gaps (expected diff). |
| Toasts in the shell, large text (unchanged) | `layout-app-shell--toasts-in-the-shell-large-text` | — | 3 bottom toasts, now 16 px apart at 200 % (expected diff). |
| All other toast, outlet and shell toast stories | — | — | Identical (single toasts or none at rest). |

## 9. Verification

Baselines (3.33.0, fd05860, built 2026-11-06):
- **`tmp/story-shots/053/baseline`:** 90 shots = toast ×7, outlet ×6 (no stack-spacing), and `layout-app-shell--toasts-in-the-shell{,-large-text}`; 360/1024/1280, L/D; `--measure='new Promise(r => setTimeout(r, 800)).then(() => "waited")'`.
- **`…/baseline-open`:** 8 shots = outlet default + bottom-center, 360/1280, L/D, one toast opened with `--measure='(async b => (b.click(), await new Promise(r => setTimeout(r, 600)), document.querySelectorAll("lc-toast-outlet lc-toast").length))([...document.querySelectorAll("button")].find(x => x.textContent.trim() === "Error"))'`.
- **Geometry measure:** `tmp/story-shots/053/gap-measure.js` (brace-free; replace `CSSARG` with `""`, `CLICKSARG` with the button labels, e.g. `["Success", "Success", "Error"]`, and `REMARG` with `""` or `"200%"`). It returns the boxes of the non-empty stacks plus `first`, `last`, `gaps`, the toast rects and `margin-top/padding-top`.

| AC | How | Expected (prototype values) |
|---|---|---|
| AC-1 | `gap-measure` on `default` with clicks Success, Success, Error at 360/1280; new spec `toast-outlet.gap.spec.ts` (compiled CSS: the D-1 rule body is exactly `margin-top: var(--spacing-2);`, and the stack rule has `padding-top: calc(var(--spacing-4) - var(--spacing-2));`) | gaps `8 8`; 360: a 16–94, p 102–180, p 188–266, stack h 282; 1280: 16–74, 82–145, 153–216 |
| AC-2 | `stack-spacing` 360 (top-right, across regions); `bottom-stack-order` 360 (swapped); `bottom-center` with clicks Success, Info, Error (assertive `--latest`, unswapped) | top: 16–74 / 82–160 / 168–267; swapped: 674–732 / 740–818 / 826–884; unswapped: p 654–732, p 740–798, a 806–884; all gaps 8 |
| AC-3 | `offsets` (one toast per stack, other region empty) at 360/1280; spec: no stack or region `gap`, no `:empty` | stacks 64–154 and 720–810, h 90, `scrollHeight` = `clientHeight` = 90; first/last 16 |
| AC-4 | `--compare` with `baseline` (rest) and `baseline-open` (opened, same measure) | open 8/8 identical (prototype 8/8). Rest: identical except the two expected stories (12 shots). **Raster note:** the injected prototype changed one hash (`toasts-in-the-shell` 1280 dark) with identical geometry. The diff lay outside the stack (top half, also with the toasts hidden, and an inside-stack clip window was identical), so it's an artefact of injecting CSS after load. If the real build shows it, the reviewer checks geometry (stacks 56/810, h 90) and a clip-window compare. |
| AC-5 | `sticky` at `--widths=360 --height=640`, `REMARG "200%"`, click "Show 7 (max 5 stack)", then `scrollTop = scrollHeight` | sh 888 (was 824), ch 640, first 32, gaps `16 16 16 16`, last toast ends 32 above the stack's end |
| AC-6 | `toast-outlet.order.spec.ts` unchanged and green; `git diff` on it is empty | — |
| AC-7 | `toast.layout.spec.ts` assertions unchanged (comment only); measure `getComputedStyle(outlet toast).marginBottom` | `0px` (no 16 px); standalone toast stories identical by hash |
| AC-8 | `stack-spacing` at 360 L, `gap-measure` with no clicks | gaps `8 8` between 58 / 78 / 99 px toasts; info toast 3 lines |
| AC-9 | `stack-spacing` 360/1024/1280 L/D, plus one `--forced-colors` shot at 360 | the same rects in L and D; FC borders visible |
| AC-10 | `toast-outlet.component.html` not in the diff; no `[style]` or host binding added (the TS diff is JSDoc only) | — |
| AC-11 | `git diff main -- libs/angular-ui-kit/src/lib/toast/`: the `.html` is unchanged, the `.ts` component diff is comments only, and the rest is the stories and specs; the existing outlet specs stay green | — |
| AC-12 | `--list=toast-outlet` lists `feedback-toast-outlet--stack-spacing`, which shows 3 toasts in 2 regions | 3 `lc-toast`, regions `a`, `p`, `p` |
