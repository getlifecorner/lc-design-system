# Design 032: lc-skeleton applies a percentage width twice

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-9

## 1. Approach

Extend (fix) `lc-skeleton`: the requested `width` lives **once, on the host** (inline `width`, `flex-shrink: 0` as today). The inner `.lc-skeleton` fill gets an inline `width: 100%`; `height` and `border-radius` stay inline on the fill. No SCSS, no input, no hook, no token.

**Invariant (measured):** the host boxes do not move. The host already had the requested width, so layout is identical before and after; only the *painted* fill changes, and only where the width resolves against the host (`%`, `calc(% …)`). Prototype on the 3.22.1 build (CSS `.lc-skeleton{width:100% !important}` injected in `--measure`, `tmp/story-shots/032/probe-*`):

| Probe | Result |
|---|---|
| `probe-unchanged`: the 6 AC-4 stories × 360/1024/1280 × light/dark, `--full`, `--compare=baseline` | 35/36 identical. The 36th (`today-loading` 360 dark) is a **timing artefact**: a wait-only measure with no fix (`probe-stability-wait`) gives the same bytes as the fix shot (`cmp`); a no-op measure is identical to the baseline |
| `probe-fix`: the 5 percentage stories at 360/1024/1280 | every host left/width equal to `before-changed`; every fill = its host (Δ 0.00 px) |
| `probe-row`: 60 % / 30 % row, `space-between`, 400 px block (text-block at 1024) | 240 / 120 px, fills 240 / 120, second ends at the row's right edge (416 = 416), space 40 |

Rejected: inner-only width (the host must carry it in flex rows, spec assumption); `width: 100%` in SCSS only (AC-3 asserts the inline `box().style.width`, and an inline value also holds in prerendered HTML without the stylesheet).

**Changelog points (for the developer's draft, *Fixed*):** a percentage `width` is now applied once: `width="30%"` is 30 % of the line (was 9 %), `60%` is 60 % (was 36 %); `calc(100% - 2rem)` is likewise exact now. `px`/`rem`/defaults render byte-identical (AC-4). Placeholders tuned around the bug (`50%` to get 25 %, a wrapper `div` holding the percentage) can be simplified. If a row's percentages plus its `gap` exceed 100 %, the fills now overflow where the hosts already did (see *Table Rows Loading*, §8). Gap: finance-intelligence cockpit row 3. No API change.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | `width` | `string \| undefined` | unchanged: `'100%'` line/rect, `'40px'` circle | "Width (CSS value), applied once, to the host: a percentage is a share of the containing block and the fill always spans the host (since 3.22.2; before, a percentage applied twice, so `30%` drew 9 %). `@default '100%' for line and rect, '40px' for circle`" |
| input | `variant`, `height`, `borderRadius` | unchanged | unchanged | Text unchanged; add the missing `@default` tags (kit convention): `'line'` · `'0.875rem' for line, '40px' for circle, '100px' for rect` · `'0.25rem' for line, '50%' for circle, '0.5rem' for rect` |
| CSS hook | `--lc-skeleton-bg`, `--lc-skeleton-highlight`, `--lc-skeleton-height` | — | unchanged | — |
| type | `SkeletonVariant` | `'line' \| 'circle' \| 'rect'` | — | unchanged |

DOM contract after the fix (prerendered HTML is the same, AC-8):

```html
<lc-skeleton style="width: 30%; flex-shrink: 0;">
  <div class="lc-skeleton lc-skeleton--line" style="width: 100%; height: 0.875rem; border-radius: 0.25rem;"></div>
</lc-skeleton>
```

Default rendering unchanged: for `px`/`rem`/`em`/`vw` and the defaults `100%`/`40px`, the fill's old width equalled the host's content width, which is exactly `100%` of the host (no padding or border on the host). Proved by hash in §1. The host comment in `skeleton.component.ts` ("mirrors the box width") becomes "takes the width once; the fill spans it". The "3.22.2" in texts is the expected patch number; the release-manager confirms it.

## 3. Anatomy and layout

New story *Percentage widths*: the cockpit's loading card (finance-intelligence `cockpit-page.html` 30–47), in a wrapper `max-width: 30rem`. Canvas padding 16 px. Card: `lc-card variant="outlined" padding="md" borderRadius="md"` (measured: border 1 px, padding 16 px, radius 12 px).

### 360 px

```
x=16                                                         x=344
┌ lc-card outlined · border 1 · padding 16 · radius 12 ───────┐ 328 wide
│ x=33 (content 294)                                  x=327   │
│ ███████████████                 45 % → 132.3 · h 20          │
│                                  gap 12 (--spacing-3)        │
│ ██████████                      30 % → 88.2 · h 14 (default) │
│                                  gap 12                      │
│ ████████████████████ ‹29.4› ██████████   60 % 176.4 | 30 % 88.2 · h 20   row A
│                                  gap 8 (--spacing-2)         │
│ ███████████████████████████ ‹14.7› █████ 80 % 235.2 | 15 % 44.1 · h 12   row B
│ … item ×3 (rows A + B), gap 12 between items               │
└──────────────────────────────────────────────────────────────┘ height 236
```

### From 1024 px (1280 px identical: wrapper capped at 480)

```
x=16                                                                  x=496
┌ lc-card 480 wide · content 446 (x 33 … 479) ──────────────────────────┐
│ ██████████████████████            45 % → 200.7 · h 20                  │
│ ██████████████                    30 % → 133.8 · h 14                  │
│ ██████████████████████████████ ‹44.6› ███████████████  267.6 | 133.8    │
│ ████████████████████████████████████████ ‹22.3› ███████  356.8 | 66.9   │
│ … ×3                                                                   │
└────────────────────────────────────────────────────────────────────────┘
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| wrapper `.story-pw` | `max-width: 30rem` (480 px) | — | — |
| card | outlined, padding md 16, radius md 12, border 1 | — | `lc-card` inputs |
| column `.story-pw__lines` | flex column, gap 12 | — | `--spacing-3` |
| item `.story-pw__item` | flex column, gap 8 | — | `--spacing-2` |
| row `.story-pw__row` | flex, `justify-content: space-between`, `align-items: center`, **no gap** (the free 10 % / 5 % is the space) | — | — |
| heading line | `width="45%" height="1.25rem"` | — | — |
| sub line | `width="30%"` (line default 0.875rem) | — | — |
| row A | `60%` + `30%`, `height="1.25rem"` | — | — |
| row B | `80%` + `15%`, `height="0.75rem"` | — | — |

Before the fix (3.22.1, same geometry): row A fills 105.8 / 26.5 px at 360 — the short one stops 61.7 px short of the edge.

## 4. States

| State | Behaviour |
|---|---|
| default (loading) | shimmer as today; under `prefers-reduced-motion` the static fill (AC-6, unchanged) |
| hover, focus-visible, active, disabled, error | n/a: not interactive, no states |
| empty | `width="0"` or `auto` in a flex row → 0 px, as before (intrinsic size of an empty fill is 0 in both versions) |
| overflow | percentages + `gap` > 100 % in a `flex-shrink: 0` row overflow; the hosts did so before, now the fills show it. Use `space-between` instead of a gap (§8 Table Rows Loading). No text, so no long words |

## 5. Theming

| Element | Light | Dark | Contrast (computed) |
|---|---|---|---|
| fill / shimmer | `--color-skeleton` `#e6eff1` / `--color-skeleton-highlight` `#f2f7f8` | `rgba(132,199,212,.07)` / `.13` | unchanged, no colour touched; asserted in `theme-contrast.spec.ts` |
| card (story only) | `lc-card outlined` as shipped | as shipped | unchanged |

New tokens: none.

## 6. Accessibility

Unchanged (AC-9). `lc-skeleton` is a `div` without role or text, decorative; the page owns `aria-busy` and the status message (pattern: `layout-app-shell--today-loading`). No focus, no target size. `forced-colors`: no rule today, no change. Reduced motion: static fill, unchanged.

## 7. Texts

| Key / input | EN default | DE |
|---|---|---|
| — | none (no built-in text) | — |

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| **Percentage widths** (new, export `PercentageWidths`, after *Dashboard Loading*) | `feedback-skeleton--percentage-widths` | none (render; `moduleMetadata` imports `SkeletonComponent`, `CardComponent` from `'../card/card.component'`); scoped `<style>` with `.story-pw*` classes, tokens only | §3; AC-1, AC-5, AC-7. Docs text: "Since 3.22.2 a percentage `width` is applied once, on the host, and the fill spans it: in this 294 px row (360 px) `60%` is 176.4 px and `30%` is 88.2 px and ends at the card's content edge (3.22.1: 105.8 / 26.5 px)." Items written out ×3 or `@for` over a 3-item prop |
| **Table Rows Loading** (template change) | `feedback-skeleton--table-loading` | the 3 rows: `gap: 16px` → `justify-content: space-between` | at 360 the 15 % fill would end at 359.2 px, 15.2 px past the 328 px row and its border line; after: last column ends at 344 (360) / 516 (1024), spaces 10.9 / 16.7 px |
| Text Block, User Card, Article Card, Dashboard Loading | `…--text-block`, `…--user-card`, `…--article-card`, `…--dashboard-grid` | unchanged | fills grow to their hosts (e.g. text-block at 1024: 70 % 196 → 280, 45 % 81 → 180) |
| Meta | — | `width` description: "Custom width (CSS value, e.g. "200px" or "60%"), applied once on the host"; add `table.defaultValue` to the 4 argTypes (values = §2 `@default`) | docs only; story canvases unchanged |
| Component docs | — | one paragraph **Width (3.22.2)** as the JSDoc sentence | docs only |
| app-shell `todayLoadingTemplate` | `layout-app-shell--today-loading` | only the HTML comment at lines 226–227: "The wrappers hold the widths (written when lc-skeleton applied a percentage twice; `width="45%"` on the skeleton gives the same box since 3.22.2)" | Angular drops comments: hash-neutral (AC-4) |

Unchanged (AC-4 baseline, `--full`): `feedback-skeleton--{line,circle,rectangle,height-from-container}`, `layout-app-shell--today-loading`, `layout-app-shell--state-page-loading` — 36 shots in `tmp/story-shots/032/baseline` (3.22.1 build). Host/fill geometry of the 5 percentage stories before the fix: `tmp/story-shots/032/before-changed.log`. If `today-loading` 360 dark differs, `cmp` it with `tmp/story-shots/032/probe-stability-wait/` (the same frame 2 rAF later) before calling it a change.

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| AC-1 | story measure, `percentage-widths` and `text-block` at 1024 | row A 267.6 / 133.8 of 446 (ratio 0.6000 / 0.3000 ± 0.0005); text-block (400 px block) 70 % = 280, 45 % = 180 host and fill. 400 px × 30 % = 120 proved in `probe-row` |
| AC-2 | unit test + measure | `el.style.width` = `30%`, `120px`, `100%` (line/rect default), `40px` (circle default); `box().style.width` = `100%` in every case; measure: every `lc-skeleton` in all 10 skeleton stories, fill width = host width ± 0.01 |
| AC-3 | `skeleton.component.spec.ts` | lines 22, 31, 47 expect `'100%'`; host lines 24, 34, 50 unchanged |
| AC-4 | `--stories=<6 ids> --widths=360,1024,1280 --themes=light,dark --full --compare=tmp/story-shots/032/baseline` | 36/36 identical (see §8 note on `today-loading` 360 dark) |
| AC-5 | measure on `.story-pw__row` (`[...r.children].map(h => [host width, fill width, host right])`) at 360, 1024, 1280 | 360: row 294 (x 33–327), A 176.4 / 88.2, second right = 327, space 29.4; B 235.2 / 44.1, space 14.7. 1024/1280: row 446 (x 33–479), A 267.6 / 133.8, right = 479; B 356.8 / 66.9. Card height 236 |
| AC-6 | `skeleton.height.spec.ts`, `skeleton.styles.spec.ts` unchanged and green; `height-from-container` in the AC-4 hash set | pass, identical |
| AC-7 | unit test: circle `width="40px"` → host `40px`, fill `100%`, `el.style.flexShrink` = `0`; measure: user-card circle 48 × 48 at 360, `percentage-widths` hosts keep 60/30 % | as stated |
| AC-8 | unit test on the serialised attributes | `el.getAttribute('style')` contains `width: 30%` and `flex-shrink: 0`; `box().getAttribute('style')` contains `width: 100%` |
| AC-9 | n/a | no text, no semantics change |
| Table Rows Loading | measure at 360 / 1024 | max host right ≤ row right: 344 / 516 |
