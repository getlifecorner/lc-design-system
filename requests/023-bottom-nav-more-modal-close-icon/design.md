# Design 023: lc-bottom-nav "More" on request; decorative lc-modal close icon

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-12 (AC-3 refined for `items.length === maxItems`, see D2)

## 1. Approach

Extend both components; no new look, token or hook.

| # | Decision | Why |
|---|---|---|
| D1 | Input name `showMore` (spec assumption 1). | Sits with `moreLabel`, `moreIcon`, `moreRoute`, `moreClick`. |
| D2 | **"More" takes one of the `maxItems` entries.** With `showMore` the bar uses the overflow layout at any count: the first `maxItems − 1` destinations stay and any others move behind "More". In code, `showMore` only skips the early return `items.length <= max` in `entries`; the rest of the overflow branch runs as before (`hidden` may be empty). | `maxItems` is documented as "most entries the bar shows". The spec's "only append" (assumption 3) breaks that at `items.length === maxItems`: 5 destinations would give 6 entries (≈ 52 px columns in a floating bar at 360 px), and 6 destinations would give 5 again, which is not monotonic. Finance Intelligence's model matches D2: `BOTTOM_BAR_SLOTS = 4` plus "Mehr" with `[maxItems]="5"` (`shell/navigation/navigation.ts:213`, `shell.html:91`). For every count below `maxItems` (their case: 2 to 4), D2 and the spec give the same result. |
| D3 | The "More" entry is the existing overflow entry: same markup, classes, current rule and `moreClick` button mode. | AC-4 and AC-8 ("same markup as on overflow"); nothing new to test visually. |
| D4 | `lc-modal`: `<lc-icon name="x-mark" size="md" [decorative]="true" />`. Nothing else changes. | `decorateSvg` sets `aria-hidden="true"` and removes `role`; no CSS anywhere keys on `role="img"` or `aria-hidden` on an svg (grep), so the pixels can't change. |
| D5 | Story fixes in the same files (no component change): *Default* and *Finance Destination* get `variant: 'docked'` in their args. *Destructive Confirmation* gets `[decorative]="true"` on its projected `exclamation-triangle`. | Both bar stories bind `[variant]="variant"` without the arg, so 3.17.0 renders `lc-bottom-nav--undefined`, with no surface and no top border (measured). The modal story's own icon is the second `svg-img-alt` in its axe run. |

**Risks (from earlier rounds):** `routerLinkActive` never matches in Storybook, but the kit sets the current state from `activeRoute`, so that's fine. Bind every arg a template uses. Projected icons in stories need `[decorative]` (014). A story frame is 360 px wide at every viewport.

**Audit (report only, not in scope):** `lc-drawer` renders its two close icons (`drawer.component.html:35,45`) without `decorative`, which is the same defect. `lc-notification-center` item and empty-state icons have neither a name nor `decorative`. Proposed as a follow-up request.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | `showMore` | `boolean` | `false` | Always end the bar with the "More" entry (`moreLabel`, `moreIcon`, and `moreRoute` or `moreClick`), even when every destination fits: for a bar with fixed slots, such as two destinations plus "More". "More" takes one of the `maxItems` entries, so the first `maxItems − 1` destinations stay and any others move behind it, as on overflow. `@default false` |
| input (JSDoc only) | `maxItems` | `number` | `5` | "Most entries the bar shows, "More" included. With more destinations, or with `showMore`, the first `maxItems − 1` stay and the rest go behind the "More" entry." |
| input (JSDoc only) | `moreLabel` / `moreIcon` / `moreRoute` | — | unchanged | Replace "overflow entry" with ""More" entry (on overflow or with `showMore`)". |
| output (JSDoc only) | `moreClick` | `void` | — | "The "More" entry was tapped while it has no `moreRoute`." |
| class JSDoc | bullet | — | — | Add "- `showMore`: "More" on request, also when every destination fits (fixed slots); it takes one of the `maxItems` entries." |
| `lc-modal` | none | — | — | No API change. |

No new slot, hook or type. Write it as `readonly showMore = input(false)`, like `fixed` (the kit uses no `booleanAttribute`), so templates bind it as `[showMore]="true"`.

**Default rendering unchanged:** with `showMore` false, `entries` takes the existing path. AC-1: the existing specs stay unchanged and green, and the 7 bottom-nav stories without the D5 fix are hash-identical.

## 3. Anatomy and layout

### 360 px: *Show More* (docked, story frame 360 with a 1 px border; values measured on a 3-entry prototype)

```
x 17 ─────────────────────────────────────────────── x 375   border-top 1px --color-border
│ list pad 4 / inline 8                                      │
│ ┌────────────────┐┌────────────────┐┌────────────────┐     │
│ │ +6 ( sun 24 )  ││ +6 ( home 24 ) ││ +6 ((dots 24)) │  ← pill 56×32 r9999; current = surface-selected
│ │ +4   Today     ││ +4  Household  ││ +4   **More**  │  ← 12/16, 500; current 700, stroke 2.4
│ └────────────────┘└────────────────┘└────────────────┘     │
│  x 25   114×64     x 139  114×64     x 253  114×64          │
└──────────────────────────────────────────────────────────── h 73 (1 + 4 + 64 + 4)
pills x 54 / 168 / 282 (centred), labels y = pill bottom + 4, "More" 30.6 px wide
```

### 360 px: *Show More (German, floating)*, frame padding 16

```
   x 33 ╭──────────────────────────────────────────────╮ 326×74, r 28, border 1, --shadow-floating-bar
        │ ┌─────────────┐┌─────────────┐┌─────────────┐ │
        │ │ (chart 24)  ││ (notes 24)  ││ ((dots 24)) │ │  pill 56×32 at x 65.33 / 167.98 / 270.66
        │ │   Cockpit   ││   Kosten    ││  **Mehr**   │ │  "Mehr" 29.6 (500) / ≈ 31 (700)
        │ └─────────────┘└─────────────┘└─────────────┘ │
        │  x 42 102.67×64  x 144.67      x 247.33       │
        ╰───────────────────────────────────────────────╯
```

### From 1024 px

The bar is for phones and tablets; from 1024 px `lc-app-shell` hides it and the sidenav takes over. The story frames stay 360 px wide, so 1024 and 1280 px show the values above unchanged (measured: identical boxes). A fixed bar in an app spreads 3 entries evenly: docked at 768 px gives (768 − 16) / 3 = 250.67 px per entry, and floating at 320 px gives (320 − 32 − 2 − 16) / 3 = 90 px (still ≥ 64).

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Bar, docked | full width, border-top 1, pads the safe-area inset | — | `--color-surface`, `--color-border` |
| Bar, floating | inset 16, r 28, border 1 | — | `--color-floating-bar-surface`, `-border`, `--shadow-floating-bar` |
| List | pad 4 / 8 | — | — |
| Entry | `flex: 1 1 0`, item ≥ 64 × 64, pad 6/0/2, gap 4, r 20 | — | — |
| Pill | 56 × 32, r 9999 | — | `--color-surface-selected` (current), `--color-surface-hover` (hover) |
| Icon | 24 (`md`), stroke 2.4 when current | — | currentColor |
| Label | full column + reach `clamp(-4px, 32px − 1.5rem, 8px)` | `--font-size-xs` 12/16, 500 / 700 | `--color-text-secondary` / `--color-on-surface-selected` |
| Modal close (unchanged) | 44 × 44 (`min 2.75rem`), pad 8 (`--spacing-2`), margin −8, r 10 (`--border-radius-sm`), icon 24 | — | `--color-text-secondary`; ring 2 px `--color-primary-500`, offset 2 |

Measured close button (baseline): Default at 360 is x 289, y 342, 44 × 44, svg 24 at +10/+10; at 1280 it is x 887. The bottom sheet at 360 is x 308.

## 4. States

| State | "More" entry (`showMore`) | Modal close |
|---|---|---|
| default | as any destination: text-secondary icon and label, no pill fill | unchanged |
| hover | pill in `--color-surface-hover` (`hover: hover` only, not on current) | `--color-surface` bg, unchanged |
| focus-visible | 2 px `--color-primary-500`, offset −2, r 20 (inset) | 2 px, offset 2, unchanged |
| active / current | `activeRoute` matches `moreRoute` (first-segment rule, `/mehr/quellen` too) or a destination hidden behind it: pill, bold label, heavier icon, `aria-current="page"` on the link. A button is never current without hidden destinations. | — |
| disabled · loading · error | n/a (no such states on the bar) | n/a |
| empty | `items: []` + `showMore` → only "More" (as with `maxItems` 1 today); without `showMore` the list stays empty, as today | — |
| overflow: many items | D2: more than `maxItems − 1` destinations go behind "More"; never two "More" entries | — |
| overflow: long text | a long `moreLabel` wraps at word boundaries and hyphenates by `lang` (`overflow-wrap: anywhere`, `hyphens: auto`), never clipped. 200 % text with 3 entries is already covered by *Item Counts at 200 % Text*. | — |

Tapping a current "More" doesn't emit `reselect`, the same as on overflow (`onItemClick` excludes `more`).

## 5. Theming

No new tokens. Contrast was computed in the browser with the WCAG formula; translucent fills are composited over the bar.

| Element | Light | Dark | Contrast L / D |
|---|---|---|---|
| "More" label + icon on the docked bar | rgb(75,85,99) on #fff | rgb(196,210,217) on #101c26 | 7.56 / 11.16 |
| … on the floating bar | on #fff | on rgb(20,34,46) | 7.56 / 10.45 |
| Current label on the pill, docked | rgb(20,79,91) on rgb(224,241,244) | rgb(163,213,223) on rgb(20,53,65) | 7.85 / 8.13 |
| … floating | same | on rgb(23,58,71) | 7.85 / 7.58 |
| Icon on the hover pill (non-text ≥ 3) | on rgb(243,244,246) | rgb(23,38,48) docked / rgb(27,44,56) floating | 6.87 / 10.00 docked, 9.27 floating |
| Focus ring on the bar / on the current pill | #208497 | #84c7d4 | 4.37 / 3.76 L; 9.13 / 6.87 D docked, 8.55 / 6.41 D floating |
| Modal close icon and ring | unchanged (the baseline measures rgb(75,85,99) / rgb(196,210,217) and #208497 / #84c7d4) | | AC-11: hash-identical |

## 6. Accessibility

- **Semantics:** "More" is `<li><a routerLink>` with `moreRoute`, or `<li><button type="button">` without it. The icon pill is `aria-hidden="true"` and the svg is decorative, so the accessible name is the label only ("More" / "Mehr"). The landmark stays `<nav aria-label>`, with 3 `li`.
- **Keyboard:** "More" comes last in the tab order. Enter follows the link; Enter and Space press the button (native). Space on a link scrolls, as for every destination, which is how AC-7 reads for links.
- **Targets:** 114 × 64 (docked) and 102.67 × 64 (floating) at 360, 90 × 64 at 320 floating: above 44 and above AS-1's 48 × 64.
- **forced-colors:** the pill fill is replaced, as for every destination, so current stays legible through the bold label, the 2.4 stroke and `aria-current`. Nothing new.
- **Reduced motion:** the pill transition is off already.
- **Modal:** the close button keeps its name from `closeAriaLabel` ("Close modal" / "Schließen"). The svg leaves the accessibility tree (`aria-hidden="true"`, no `role`), so axe's `svg-img-alt` disappears (baseline: 1 hit per open modal, and 2 in *Destructive Confirmation*, the story's own icon, D5). `lc-confirm-dialog` inherits the fix.
- **Announcements:** none new.

## 7. Texts

| Key / input | EN default | DE |
|---|---|---|
| `moreLabel` (exists) | More | Mehr (29.6 px at 12/500; fits every column ≥ 64 px) |
| `closeAriaLabel` (exists, modal) | Close modal | Schließen |

No new built-in text.

## 8. Stories

`navigation-bottom-nav-*`, all in a `phoneFrame`, `fixed: false`, with every arg the template binds set explicitly. Add a `showMore` argType (`control: 'boolean'`, description from §2, `table.defaultValue: 'false'`), update the `maxItems` description, and add a Key Features line.

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Show More | `navigation-bottom-nav--show-more` | `items` Today `/` (sun), Household `/household` (home); `showMore: true`; `moreRoute: '/more'`; `activeRoute: '/more/settings'`; `variant: 'docked'`; `ariaLabel: 'Main navigation'`; lang en | AC-2/5/6: 2 destinations + "More", current on a sub-page of `moreRoute` |
| Show More (German, floating) | `navigation-bottom-nav--show-more-german` | `items` Cockpit `/cockpit` (`presentation-chart-line`), Kosten `/kosten` (`banknotes`); `showMore: true`; `moreLabel: 'Mehr'`; `moreRoute: '/mehr'`; `activeRoute: '/mehr'`; `variant: 'floating'`; `ariaLabel: 'Hauptnavigation'`; frame padding 16, lang de | the requester's bar (AC-6 German) |
| Show More with Fixed Slots | `navigation-bottom-nav--show-more-fixed-slots` | `items` Today, Household, Finances `/finances` (wallet); `maxItems: 3`; `showMore: true`; no `moreRoute`; `activeRoute: '/'`; `variant: 'docked'`; `(moreClick)` wired | D2 (Finances goes behind "More") and button mode (AC-4); Today current |

Story fixes (D5): *Default* and *Finance Destination* get `variant: 'docked'`. In *Destructive Confirmation* (`feedback-modal--destructive-confirmation`), the header icon gets `[decorative]="true"`.

## 9. Verification

Baseline: `tmp/story-shots/023/baseline` (94 shots, main fe4952a). It holds 9 bottom-nav stories at 360/1024/1280, light and dark, `--full` (54). It also holds 5 modal and 5 confirm-dialog stories at 360/1280, light and dark, taken with the modal open through the measure in `tmp/story-shots/023/open-modal.js` plus `--axe` (40); the log is `tmp/023/baseline-modal.log`.

| AC | How | Expected value |
|---|---|---|
| AC-1 | existing `bottom-nav.component.spec.ts` unchanged and green; `--compare` of the 9 bottom-nav stories | 42 identical; exactly the 12 shots of *Default* and *Finance Destination* differ (D5: top border and surface) |
| AC-2 | unit: `showMore`, 2 items, `maxItems` 5 | 3 `li`; labels `[a, b, 'More']` |
| AC-3 (D2) | unit: `showMore` with 4 / 5 / 6 items at `maxItems` 5, and 3 items at `maxItems` 3 | `[4 + More]`, `[4 + More]` (5th hidden; More current on its route), `[4 + More]`, `[2 + More]`; always exactly one `.lc-bottom-nav__item` with the More label |
| AC-4 | unit: `moreLabel: 'Mehr'`, `moreIcon: 'bars-3'`, `moreRoute: '/mehr'` | `a[href="/mehr"]`, text "Mehr", `lc-icon` name `bars-3`; without `moreRoute`: `button[type=button]`, click emits `moreClick` once |
| AC-5 | unit: `activeRoute` `/mehr` and `/mehr/quellen`, then `/` | exactly one `[aria-current="page"]` = "Mehr" with `--current`; at `/` "More" is not current |
| AC-6 | `--measure` on the 3 new stories, 360 + 1024, light + dark | entries equal ±0.01: docked 114 × 64 at x 25/139/253, floating 102.67 × 64 at x 42/144.67/247.33; pill 56 × 32; `nav.scrollWidth === nav.clientWidth`; contrast as in §5 |
| AC-7 | unit: the "More" element is `A` (href) or `BUTTON`, not `tabindex=-1`; its `textContent.trim()` equals the label; the pill has `aria-hidden="true"` and the svg has `aria-hidden` | as stated; review: `focus()` → `:focus-visible` ring 2 px |
| AC-8 | compat: on the 2-item bar in `tools/compat/template/src/app/home.html:105` add `[showMore]="true" moreLabel="Mehr" moreRoute="/mehr"`, plus an `EXPECT_IN_HTML` entry `bottom nav "Mehr" on request (023)`: nav `aria-label="Hauptnavigation unten"` … `<a … href="…/mehr"` … `Mehr` | present in the prerendered HTML on 21 and 22; the existing "bottom nav current item" still passes |
| AC-9 | unit (`modal.component.spec.ts`): open; `.lc-modal__close svg` | `aria-hidden="true"`, no `role`; button `aria-label` "Close modal", and "Schließen" after `setInput` |
| AC-10 | the baseline command with `--compare` and `--axe` on the 10 modal/confirm stories | 0 violations in 40 shots (baseline: `svg-img-alt` in all 40) |
| AC-11 | same run | 40 / 40 identical to the baseline; measure: box 44 × 44, svg 24, ring `solid 2px` offset 2 |
| AC-12 | review `CHANGELOG.md` | Added `showMore` (row 6; D2 spelled out; requester hint: drop the own "Mehr" item, bind `[showMore]`, keep `[maxItems]="5"`). Fixed: the modal (and confirm-dialog) close icon is decorative (row 8; the `KIT_DEFECTS` entry can go). Compatibility: no API break |
