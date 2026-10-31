# Design 025: Review findings follow-up 2

- **Status:** ready (prototyped in the browser on main 5ea175e; every value below is measured)
- **Spec:** [spec.md](spec.md) — AC-1 … AC-13

## 1. Approach

Fixes only, no new input, slot, hook or token (patch, 3.19.1). Patterns reused: lc-modal/lc-toast 44 px close (negative margin keeps the layout), lc-toggle-group pressed chip (`--color-primary-fill` + `--color-on-primary`), sidenav forced-colors outline, `<name>.icons.spec.ts` (024).

**Outlet check (task):** `lc-toast-outlet` depends on the dead `:host` rule *staying dead*. Its toasts are flex items (blockified), sized to content (320.1 / 330.2 px) and touching (gap 0). With the rule applied they would be 328/400 wide and 8 px apart. So the host rule applies to standalone toasts only, through `:not(lc-toast-outlet lc-toast)`. Prototype: 18/18 opened outlet shots hash-identical (`025/baseline-open`).

**Hyphens:** plain `hyphens: auto` on the `lang="en"` canvas hyphenates short EN words ("min-utes" at 360, "con-nection" at 400), which AC-2 forbids. With `hyphenate-limit-chars: 12 4 3` every EN line in the 5 EN toast stories stays as it is, and DE still breaks at syllables ("Benachrichti-/gungseinstellun-/gen gespeichert."). Chromium 109+ and Firefox honour the limit; Safari ignores it and hyphenates like lc-alert and the page-header title do today.

## 2. Public API

| Kind | Name | Change |
|---|---|---|
| CSS (toast) | `:host { … }` → `lc-toast:not(lc-toast-outlet lc-toast) { display: block; width: 100%; max-width: 400px; margin-bottom: var(--spacing-2) }` | Selector (0,0,3); a consumer class wins. Comment: dead `:host` under `ViewEncapsulation.None`; outlet toasts excluded (AC-4) |
| CSS (toast) | `.lc-toast__message` | + `hyphens: auto; hyphenate-limit-chars: 12 4 3` (keeps `overflow-wrap: break-word`) |
| CSS (drawer) | `.lc-drawer__close` | `width/height: var(--size-min-touch-width/height, 2.75rem)`, `margin: calc((2rem - var(--size-min-touch-height, 2.75rem)) / 2)` (−6 px), `flex-shrink: 0`. Absolute `--floating` keeps `top/right: .75rem` (margin moves the box, not the icon) |
| CSS (drawer) | `.lc-drawer__header` + `gap: var(--spacing-3)`; `.lc-drawer__heading` + `min-width: 0; overflow-wrap: break-word; hyphens: auto; hyphenate-limit-chars: 12 4 3` | A long DE heading wraps instead of running under the × |
| CSS (NC) | `.lc-nc__filter:hover` → `:hover:not(.lc-nc__filter--active)`; `--active`: `background: var(--color-primary-fill); color: var(--color-on-primary); border-color: var(--color-primary-500)`; delete the 4 `--{error,warning,success,info}.--active` blocks (incl. `#3b82f6`) | Modifier classes stay in the template (DOM unchanged) |
| CSS (NC) | `.lc-nc__badge`: `background: var(--color-error-fill); color: var(--color-on-error)` (was `--color-error-default` + `white`) | Found while designing: dark 1.99:1 (§5). Light renders identically |
| CSS (NC) | `@media (forced-colors: active) { .lc-nc__filter--active:not(:focus-visible) { outline: 2px solid Highlight; outline-offset: 1px } }` | Sidenav pattern; the fill is dropped there |
| Template | 29 `lc-icon` sites + `[decorative]="true"` (§6.1) | No input added |

Default rendering: the outlet, every icon story and NC Compact (light) stay hash-identical; every other change is a listed fix (§9, AC-2).

## 3. Anatomy and layout

### 360 px

```
Toast, standalone (Success)            Drawer header (unchanged 65 px)          NC filter row (unchanged)
x16 ┌─────────── 328 ───────────┐      ┌──────────── 360 ─────────────┐         x33 54.1  x91.1 66  x161.1 85 …
    │ icon 24 · msg 223 · × 44  │ 78   │ pad 16/20  Heading 16/600    │         ( All (7) )( Error (1) )( Warning (2) )…
    └───────────────────────────┘      │ gap 12  [×]: box 44 @302,10  │ 65      chips 26.5 high, gap 4, row 43.5,
      margin-bottom 8                  │        icon 20 @314,22 (=)   │         scroll 400 / client 326
With Action DE: 328 × 99, 3 lines      └──────────────────────────────┘
"Benachrichti-|gungseinstellun-|       Floating (no heading): box 44 @310,6, icon @322,18 (=), content y 64
 gen gespeichert."                     German Heading: heading 21–296, 2 lines, header 73, × @302,14, heading→hit 6
```

### From 1024 px

```
Toast, standalone: 400 max (was 992 / 1248), x 16, 58 high (1 line) / 78 (2 lines).
With Action: 400 × 63 (EN) and 400 × 78 (DE: "Benachrichtigungseinstellun-|gen gespeichert.").
Outlet (unchanged): 330.2 × 58 / 320.1 × 63 at x 933.8 / 943.9 (1280), touching.
Drawer 1280: md panel 880–1280, × box @1222,10; sm German Heading: 981–1216, 2 lines, header 73.
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Standalone toast | ≤ 400 px, mb 8 | 14/21 | `--spacing-2` |
| Drawer close | 44 × 44, −6 margin, ring 2 px offset 2 (52 px) | icon sm 20 | `--size-min-touch-*`, `--spacing-3` |
| Drawer heading | min-width 0, wraps | 16/600, LH 20 | — |
| NC chip | 26.5 × ≥ 54, pad 4/10, r full | 11/500 | as before |

## 4. States

| Element | default · hover · focus · active · overflow |
|---|---|
| Toast | Standalone: card block, slide-in animation now runs (an inline box ignored `transform`; `none` under reduced motion). Long DE word: syllable hyphen; unbreakable string: `break-word` |
| Drawer close | Rest invisible box; hover `--color-surface-hover` now 44 px; focus ring around 44 (52 px); the close is focused at open (cdk auto-capture), so the ring shows in every at-rest shot. Floating ring 2 px inside the panel's top/right edge |
| Drawer heading | 1 line as before; a 43-letter DE compound hyphenates (2 lines, header 65 → 73) |
| NC chip | Rest unchanged; hover only on non-active chips; active: teal fill, white text, teal rim; active + hover: no change; forced colors: Highlight outline unless focused |

## 5. Theming (computed, WCAG formula in the browser; panel = `--gradient-surface`, both ends)

| Element | Light | Dark | Contrast L / D |
|---|---|---|---|
| NC chip rest text `--color-text-secondary` on panel | #4b5563 on #fff / #f9fafb | #c4d2d9 on #101c26 / #1a2c3a | 7.23 min / 9.26 min |
| NC chip rest hover on `--color-surface-2` | #f9fafb | #1a2c3a | 7.23 / 9.26 |
| NC chip active text `--color-on-primary` on `--color-primary-fill` | #fff on #1a6a79 | same | **6.21 / 6.21** (was 4.37 / 1.89) |
| NC chip active rim `--color-primary-500` vs panel | #208497 | #84c7d4 | 4.18 / 7.58 (fill alone vs dark panel 2.31) |
| NC active error/warning/success/info | same as active | same | 6.21 / 6.21 (were 8.39 / 1.99, 2.26 / –, 2.72 / –, 6.17 / –) |
| NC badge `--color-on-error` on `--color-error-fill` | #fff on #9d0e0e | same | 8.39 / **8.39** (was 1.99 dark) |
| Drawer ring `--color-primary-500` on panel | | | 4.18 / 7.58 (unchanged) |

No new token. Pairings to add to `theme-contrast.spec.ts` ("3.19.1, request 025"): chip active text, rim, rest + hover (min over both panel ends), badge; plus a source check that `notification-center.component.scss` has no `#hex`/`white` and reads those tokens (024 menu pattern).

## 6. Accessibility

- Drawer close: name `closeAriaLabel`, focus first in the panel and tab order unchanged (DOM unchanged); 44 × 44 hit area, `elementFromPoint` hits at 0.5 px inside all 4 edges (prototype: true, 20/20 shots). No border in any mode (an icon button like lc-modal's); forced colors keep the icon (currentColor) and the ring.
- NC chips: `aria-pressed` unchanged. Target 26.5 × ≥ 54, 4 px apart: meets WCAG 2.5.8 (24 px); **left** below the kit's 44 px (raising it grows the row 43.5 → 61, AC-8 forbids a shift). Follow-up candidate.
- AC-9: `lc-select` has no `label` input; the stories' `label="…"` renders nothing and names nothing (no forwarding bug). Fix in the stories: a visible label (`<span>` styled like `.input-label`: `--font-size-sm`, `--font-weight-medium`, `--color-text-primary`, `margin-bottom: var(--spacing-1)`) above each select plus `ariaLabel` with the same word (label in name).

### 6.1 The 29 icon sites (grep finds 29, not 30: document-viewer has 9) — all `[decorative]="true"`

| Component (line) | Icon | Why decorative |
|---|---|---|
| log-viewer 20, 30, 39, 50 | play/pause, trash, clipboard, search | Inside a button named by `aria-label` |
| log-viewer 85 | magnifying-glass | Next to the labelled search input |
| log-viewer 162 | arrow-down | Button has visible text `jumpToBottomLabel` |
| document-viewer 5 | type icon | Filename and type badge carry it |
| document-viewer 18, 27, 35, 46, 55 | minus, plus, reset, download, fullscreen | Buttons named by `aria-label` |
| document-viewer 72 | exclamation-triangle | Error text beside it |
| document-viewer 127 | document | "Preview unavailable" title beside it |
| document-viewer 132 | arrow-down-tray | Button text `downloadFileLabel` |
| gallery 78, 82, 85, 88, 91, 104, 114 | lightbox zoom, reset, download, close, prev, next | Buttons named by `aria-label` |
| combobox 53 | x-mark | Clear button named by `clearAriaLabel` |
| combobox 95 | option icon | Option label beside it |
| combobox 118 | plus | Visible "Create …" text |
| file-upload 26 | cloud-arrow-up | Drop zone named by `dropzoneAriaLabel` |
| file-upload 43 | document | File name beside it |
| file-upload 52 | x-mark | Remove button named by `removeFileAriaLabel` |
| field-group 2 | icon | Visible label beside it |

Test: extend `kit-icons.spec.ts`'s static scan: every `<lc-icon …>` tag in `src/lib/**` (templates and inline templates; not `icon/`, stories, specs) contains `decorative` or `ariaLabel` (all 115 kit tags comply after this change), plus a render check per component that no `lc-icon svg[role="img"]` is left.

## 7. Texts

No built-in text added or changed (AC-11: n/a). Story texts: select labels "Status", "Role", "Priority", "Category" (EN stories); the German Heading story uses `heading="Haushaltsmitgliederverwaltungseinstellungen bearbeiten"`, `closeAriaLabel="Schließen"`.

## 8. Stories

| Story | Expected ID | Change | Shows |
|---|---|---|---|
| Toast With Action | `feedback-toast--with-action` | wrapper keeps `display: flex; flex-direction: column`, **drops `gap: 8px`** (the margin spaces them; a block wrapper changed the dark raster); description: hyphenation + 400 px | AC-1, AC-3 |
| Toast All Variants | `feedback-toast--all-variants` | same: drop `gap: 8px` | hash-identical (proved) |
| Toast docs | — | component description: standalone toasts are blocks ≤ 400 px with an 8 px bottom margin; outlet unchanged | |
| Drawer Filter Panel, Large Form | `feedback-drawer--filter-panel`, `--large-form` | visible label + `ariaLabel` per select (§6) | AC-9 |
| Drawer **German Heading** (new) | `feedback-drawer--german-heading` | `size: 'sm'`, heading/closeAriaLabel §7, `lang="de"` on `lc-drawer`, Default's body | AC-5, AC-11 |

## 9. Verification

Baselines (main 5ea175e, not opened): `tmp/story-shots/025/baseline` — toast 7 + outlet 4 at 360/1024/1280 L/D (66, no `--full`); drawer 5 at 360/1280 L/D (`--axe`); NC 7 at 360/1280 L/D (`--full --axe`); icons 40 stories (log-viewer 7, document-viewer 7, field-group 5, gallery 8, combobox 8, file-upload 4, chat with-file-upload) at 360/1280 L/D (`--axe`). `baseline-open`: outlet Default/Bottom Center after "Show 7" (button 4) and Service Call after buttons 1+2, 360/1024/1280 L/D (18). Logs `tmp/025/baseline-*.log`. Re-shoot with the same flags.

| AC | How | Expected |
|---|---|---|
| 1 | With Action 360/1280 L/D, measure + shot | msg `hyphens auto`, `overflow-wrap break-word`, limit `12 4 3`; DE 360: 328 × 99, 3 lines, hyphens visible; 1280: 400 × 78; `scrollWidth` = width |
| 2 | `--compare=baseline` (66) | Differ (36): Success, Error, Warning, Info, Without Close × 6 (block card, 400 cap; Error/Warning 2 lines at 400), With Action × 6 (400 cap; DE hyphen at 360). Identical (30): All Variants 6, outlet 24. No EN line changes from hyphens (line probe: EN lines equal the width-only layout) |
| 3 | Success measure | 1280: `block`, 400 × 58, x 16, mb 8px (was inline 1248 × 100); 360: 328 × 78 |
| 4 | `--compare=baseline-open` + measure (same clicks) | 18/18 identical; 328 × 78 / 320.1 × 63 (360), 330.2 × 58 / 320.1 × 63 (1280), mb 0, y 16/94 |
| 5 | drawer 5 + German Heading, 360/1280 L/D | box 44 × 44, icon positions equal baseline (e.g. 314,22 / 322,18), header 65 (German Heading 73, 2 lines), edge hits true, heading→hit ≥ 6 px, content y 64 vs × bottom 50 |
| 6 | focus at load + `--forced-colors` shot | `:focus-visible` true, ring 2 px solid primary-500 offset 2, name = `closeAriaLabel`; forced: icon + ring visible |
| 7 | Jest pairings + click-each-chip measure | §5 values; axe `color-contrast` 0 on 28 NC shots (prototype: 0, was 24) |
| 8 | NC 360 measure | row 400 / 326 / 43.5, chips 26.5 high at x 33 / 91.1 / 161.1 / 250.1 / 339.7 |
| 9 | `--axe` 2 stories × 4 | `aria-input-field-name` 0 (was 8 shots) |
| 10 | static scan + render spec; `--axe` | 0 unlabelled tags; `svg-img-alt` 0 on 21 stories (was 84 shots); icon stories hash-identical (noise: document-viewer image-preview) |
| 11 | German Heading 360 | no clipping, `scrollWidth` 360 |
| 12 | Jest; compat 22 | add a standalone `<lc-toast>` to `tools/compat/template` home and `EXPECT_IN_HTML`: `<lc-toast…class="lc-toast lc-toast--…"` and `lc-toast:not(lc-toast-outlet lc-toast)\s*\{\s*display:\s*block` |
| 13 | shots L/D, `--forced-colors` NC + drawer, stylesheet scan | NC forced rule present; reduced motion: toast `animation: none` |

Expected diffs besides AC-2: drawer 20/20 (ring now around the focused 44 px box; Filter Panel and Large Form also gain labels); NC 26/28 (active chip; Compact dark: badge), Compact light 2 identical. Changelog: Changed (standalone toast width/margin, NC chip and badge colours, drawer close size), Compatibility (standalone toast ≤ 400 px + 8 px margin; override with a class: `.my-toast { max-width: none }`).

**Risks:** Safari ignores `hyphenate-limit-chars`; injected-CSS prototypes needed ×3 class specificity to beat `_ngcontent` rules (the real SCSS doesn't). **Out of scope, seen:** outlet toasts touch (gap 0); axe color-contrast on `.gallery__filter-btn--active`, `.lc-log-viewer__level-pill--error`, doc-viewer download/text, chat monogram; tabs story `lc-select label=`; lc-select has no visible-label input.
