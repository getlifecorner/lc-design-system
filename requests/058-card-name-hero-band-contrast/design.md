# Design 058: lc-card accessible name, lc-hero band contrast

- **Status:** ready. **Q1 decided** by the owner on 2026-11-10 11:28 (log.md): **1a = option H1**, darker success and warning bands with white text, like the other seven. H2 is rejected (§5.4).
- **Change note (2026-11-10):** settled on H1 after the owner's answer; §1 flag, §5.4 and §8 N-1 updated, N-1 added to `requests/BACKLOG.md` as `058-n1`. No value in §2–§9 changed.
- **Spec:** [spec.md](spec.md) — AC-1 … AC-12
- **Measured on:** main f7c3684 (3.37.0), static Storybook built 2026-11-10. Contrast = WCAG formula in `story-shots --measure` (8-bit sRGB composite, min over the band t 0–1 in 0.01 steps, floored to 2 decimals). Measures: `tmp/story-shots/058/design-{contrast,final}-measure.js`.

## 1. Approach

**Card (057-s1): extend, the D-4 pattern of `lc-description-list` 3.37.** Seven `&ngsp;` spaces in the template, each a whitespace-only text run between **flex items** (`.card`, `.card__header`, `.card__title-row` are flex), so they never render, also under an inherited `white-space: pre*` (Flexbox §4). None goes inside a block container (`.card__header-left`), inside an element whose text a spec pins (`.card__title`, toggle, link) or inside an `:empty` slot (`.card__badge-slot`). Prototype (spaces injected on main): 140/140 shots hash-identical to the baseline, geometry identical in all 140, axe `label-content-name-mismatch` 1 violation → 0 (§9).

**Hero (057-s2): CSS only, two moves.**
1. **One ink on a default band:** label, title and body are all `#fff` at full strength. Today the body is 85 % white and the label 80 % (`opacity`); both fail on six bands, and no band change within a shade step can carry them (§5.3).
2. **Five bands get a darker light end**, the ones where even full white fails (primary 4.36, secondary 3.11, orange 3.03, success 2.72, warning 2.25). Each new light end is the lightest shade **of the same hue** that carries white at ≥ 4.6:1: the channels scaled by k (the kit's own recipe: `secondary-600` = `secondary-500` × 0.8). A token is used where it lands there (`secondary-600`, `warning-dark`). Where the dark end would then equal the light end (success, warning), both ends scale, so the band keeps its light-to-dark run.
3. Untouched: neutral, info, purple (white 4.58), violet; the **light variant** (all text ≥ 4.68, §5.2); geometry, focus ring, slots.

Rejected: keeping 85 %/80 % text (secondary and orange then need 2 steps, success and warning 2+, and warning's dark end fails too); a `#111827` scrim (α .37 on warning greys it, saturation .71 → .62, and it darkens the bands that pass); per-band text alpha (two inks for one component).

**Q1, decided: H1 (owner, 2026-11-10).** Success and warning move beyond a shade step under every darker-band or scrim option (light end 1.72 / 2.05:1 against the old stop; the kit's own steps are 1.42–1.54; their mean luminance halves). Per spec Assumption 1 that went to the owner, who accepted it over H2 (dark text on those two bands, within a step, but a change of the documented "default: dark gradient with white text"). Prototype shots: today `tmp/story-shots/058/baseline-hero/`, H1 `058/proto-hero/` (the build must match these by hash, AC-9), H2 `058/proto-hero-h2/` (discarded).

**Why H1:** one rule for all nine bands (dark band, white text, as documented), and everything white that consumers put on a band passes with it: the `inverse` pill (2.25 → 4.58 against the band), footer stats, Edu's on-dark drawing. The changelog (AC-12) states that success and warning look visibly darker.

## 2. Public API

No change: no input, output, slot, hook or type is added, renamed or retyped. Changed rendering, all stated: card none (DOM spaces only, AC-3); hero colours of five bands and the text strength of the default variant (§5). JSDoc: append to the class comment of `hero.component.ts` a line `3.38: label, title and body are white at full strength on every default band (4.58:1 or more); five bands are darker at their light end`, and change "only the body text is softened, through its colour" (3.37 line) accordingly.

## 3. Anatomy and layout

### Card: where the spaces go (`card.component.html`)

```
.card (flex col)
├─ [bare link]
├─ .card__header (flex row)                       @if (title())
│  ├─ .card__icon (aria-hidden, no text)
│  ├─ .card__header-left (BLOCK: no space here)
│  │  ├─ .card__title-row (flex row)
│  │  │  ├─ h2–h6.card__title …  ␣S1               after the @if/@switch chain
│  │  │  ├─ span.card__badge-slot ␣S2
│  │  │  └─ span.card__badge      ␣S3              inside @if (badge())
│  │  └─ p.card__subtitle
│  ├─ ␣S4 .card__header-action
│  └─ lc-icon.card__chevron (no text)
├─ ␣S5                                              after .card__header, inside @if (title())
├─ <ng-content [card-header]> ␣S6
├─ .card__body ␣S7
└─ <ng-content [card-footer]>
```

| Space | Container | Separates |
|---|---|---|
| S1 | `.card__title-row` | title ↔ projected badge, badge, subtitle |
| S2 | `.card__title-row` | projected `[card-badge]` ↔ badge, subtitle |
| S3 | `.card__title-row` | badge ↔ subtitle |
| S4 | `.card__header` | subtitle (or title) ↔ header-action text |
| S5 | `.card` | head ↔ `[card-header]` or body |
| S6 | `.card` | `[card-header]` ↔ body |
| S7 | `.card` | body ↔ `[card-footer]` |

Layout Δ 0: header, title and body rects identical in all 140 prototype shots (360 and 1280, L·D). Two spaces may meet (S5 + S6 without `[card-header]`); names and axe collapse runs, tests normalise them.

### Hero: geometry unchanged

```
360 (md, padding 32/20)                    t = (x + y) / (w + h), 135°
┌──────────────────────────────┐ t 0  dark end (from)
│ LABEL  11/600 +0.15em  #fff  │      every text box lies in t 0 … ~0.95;
│ Title  28/800 lh 1.1   #fff  │      the table in §5 takes t 0 … 1
│ Body   14/400 lh 1.6   #fff  │      (both ends), so it holds for fill,
│ ── footer stats       #fff ──│      slim, media and content-lg alike
└──────────────────────────────┘ t 1  light end (to): the minimum
```

No size, padding, radius or gap changes; the slim title stays 18 / 20 / 24 px (700), which is **not large text below 640 px** (< 18.66 px bold), so it needs 4.5:1; after H1 every band gives ≥ 4.58.

## 4. States

- **Card:** hover, focus-visible, selected, collapsed and link states unchanged (no style change). Empty parts: no title → only S6 and S7 exist; empty badge slot keeps `:empty` (`display: none`). Long German title with a badge (*Clickable Named by Its Text*, card 2) wraps and hyphenates as before. Consumer content inside the body keeps its own spacing (*Clickable* reads "$9/mo5 projects"): out of scope; kit content (`lc-description-list`) already separates.
- **Hero:** title focus ring (C40 two-tone: white outline + 2 px `#111827`) min over all nine new bands **4.58** (was 4.23); light variant unchanged. Label, title, body and footer text all at the band ink. Overflow, long German titles, media and fill: unchanged (geometry Δ 0, §9).

## 5. Theming

The bands do not follow the theme; every value is the same in light and dark.

### 5.1 Default variant (H1)

| Colour | Band before (from → to) | Band after | Body .85 / label .8 / title — before | Label, title, body after (#fff) | Step to (from) |
|---|---|---|---|---|---|
| primary | `primary-800` → `primary-500` | `primary-800` → **`#1f8092`** (500 × 0.97) | 3.63 / 3.37 / 4.36 | **4.60** | 1.05 |
| secondary | `secondary-800` → `secondary-500` | `secondary-800` → **`secondary-600`** | 2.69 / 2.56 / 3.11 | **4.61** | 1.48 |
| neutral | `neutral-900` → `neutral-600` | unchanged | 6.03 / 5.55 / 7.55 | 7.55 | — |
| success | `success-dark` → `success-default` | **`#46543b` → `#697957`** (both × 0.74) | 2.38 / 2.28 / 2.72 | **4.69** | **1.72** (1.52) |
| info | `info-dark` → `info-default` | unchanged | 4.99 / 4.62 / 6.17 | 6.17 | — |
| warning | `warning-dark` → `warning-default` | **`#68481d` → `warning-dark`** (× 0.67) | 2.01 / 1.93 / 2.25 | **4.63** | **2.05** (1.78) |
| accent-orange | `#7a3a10` → `accent-orange` | `#7a3a10` → **`#b06024`** (× 0.79) | 2.60 / 2.47 / 3.03 | **4.62** | 1.52 |
| accent-purple | `#3a2a52` → `accent-purple` | unchanged | 3.82 / 3.57 / 4.58 | 4.58 | — |
| accent-violet | `#221a42` → `accent-violet` | unchanged | 6.92 / 6.38 / 8.86 | 8.86 | — |

SCSS (H1), `hero.component.scss`:

| Rule | Today | After |
|---|---|---|
| `$hero-colors` `primary.to` | `colors.$color-primary-500` | `#1f8092` (comment: primary-500 × 0.97, white 4.60:1) |
| `secondary.to` | `colors.$color-secondary-500` | `colors.$color-secondary-600` |
| `success` | `success-dark` → `success-default` | `#46543b` → `#697957` (comment: the 3.37 band × 0.74) |
| `warning` | `warning-dark` → `warning-default` | `#68481d` → `colors.$color-warning-dark` (comment: one step down, × 0.67) |
| `accent-orange.to` | `colors.$color-accent-orange` | `#b06024` (comment: × 0.79) |
| `.hero__label` | `opacity: 0.8` | removed (`.hero--light .hero__label { opacity: 0.7 }` stays) |
| `.hero__body` | `color: rgba(#fff, 0.85)` | removed: inherits the band's `#fff` (`.hero--light .hero__body` stays) |

Keep every stop a 6-digit hex in the compiled CSS (three specs read the bands with `#[0-9a-f]{6}`); no `color.mix()` (Dart Sass may print fractional `rgb()`). Update the 3.37 comment above `.hero__body`.

Step = contrast between old and new stop; the kit's neighbouring steps measure primary 500→600 1.42, 600→700 1.47, 700→800 1.44, secondary 500→600 1.48, 600→700 1.54 (success/warning default → dark: 1.94 / 2.05). Hue / saturation (HSV) of the light end kept: primary 190°/.78 → 189°/.78, secondary 203°/.36 → 203°/.35, success 88°/.28 → 88°/.28, warning 36°/.71 → 34°/.72, orange 25°/.79 → 26°/.79. Mean band luminance: success 24.2 % → 12.7 %, warning 29.6 % → 12.7 %, orange 18.4 → 12.5, secondary 16.5 → 11.0, primary 11.0 → 10.4. Literals follow the map's existing literal stops (`#7a3a10`, `#3a2a52`, `#221a42`); each gets a comment with its factor and ratio.

### 5.2 Light variant (unchanged, passes)

Body `rgba(neutral-800,.75)` / label (opacity .7) / title `neutral-800`: primary 5.79 / 5.00 / 12.03, secondary 5.74 / 4.98 / 11.91, neutral 5.72 / 4.98 / 11.85, success 6.06 / 5.17 / 12.94, info 5.79 / 5.00 / 12.03, warning 6.10 / 5.24 / 13.18, orange 6.04 / 5.18 / 12.81, purple 5.44 / 4.71 / 10.78, violet 5.36 / 4.68 / 10.57.

### 5.3 Other values on the new bands (AC-8)

Badges: opaque light palette, independent of the band: unchanged (min success 4.85). Inverse-outline text 6.19 → 9.36 (under the 3.36 body opacity .85: 4.66 → 6.95); keyline and ring two-tone 4.23 → 4.58 (.85: 3.56 → 3.79); white alone 2.26 → 4.58 (.85: 2.01 → 3.79). Inverse pill fill vs band 2.25 → 4.58 (min). At the primary light end under .85 (button.styles spec): text 9.28 / 8.69 / 8.11 → 9.31 / 8.72 / 8.13, fill 3.62 / 3.39 / 3.16 → 3.79 / 3.55 / 3.31, ring 3.62 → 3.79. Edu `#84c7d4` on the primary band at t 0 / .6 / .75 / 1: 6.97 / 3.55 / 3.01 / 2.31 → 6.96 / 3.67 / 3.13 / 2.43 (the docs rule "≥ 3 where t ≤ 0.75" still holds). Why 85 % can't stay: at .85 secondary-600 gives 3.84, orange ×0.79 3.80, success 3.91, warning 3.90.

### 5.4 Alternative H2 (rejected by the owner, 2026-11-10; not to be built)

Was: success `#738961` → `success-default`, warning `#ae7830` → `warning-default`, with `neutral-900` text on those two bands (4.62–6.51 / 4.67–7.85). Rejected for two inks on the default variant, a JSDoc contract change, and white consumer content (the `inverse` pill 2.25) still failing on warning.

## 6. Accessibility

- **Card names:** `textContent` and axe's visible text separate every part (AC-1, 2). Toggle name = title, link name = title or `ariaLabel`, `aria-describedby` = subtitle: unchanged (spaces outside `.card__title`, the toggle and the link). Chrome's own name-from-content already spaced block children; the fix serves axe, Firefox/Safari name computation and `textContent` consumers.
- **Hero:** WCAG 1.4.3 for body and label (small text, 4.5) and the title (large from sm/md/lg; slim below 640 px is small, 4.5) on all nine bands, both variants. No semantics or focus change.
- **Forced colours:** gradients compute to `none` and text to `CanvasText` (emulated, measured), so band and ink changes don't show; the label loses its 0.8 opacity and is full `CanvasText` (an improvement). Expected FC diffs = shots with a default-variant label or story stat labels (list in §9).
- **Reduced motion:** nothing animates in either component.

## 7. Texts

No built-in text. New story text (German, the requester's): §8.

## 8. Stories

| Story | Expected ID | Args / content | Shows |
|---|---|---|---|
| Clickable Named by Its Text (new, card) | `components-card--clickable-named-by-its-text` | `lang="de"`, grid `repeat(auto-fit, minmax(240px, 1fr))`, gap 16, max-width 640. Card 1: outlined, `[clickable]="true"`, padding md, title „Regeln“, badge „3“ (`badgeVariant="primary"`), `lc-description-list size="sm"` rows „aus USM übernommen“ 1, „im Modul gepflegt“ 2; `ariaLabel` „Regeln 3 aus USM übernommen 1 im Modul gepflegt 2“. Card 2: same, title „Umlageschlüssel nach Kostenstellenverantwortung“, badge „Entwurf“ (`warning`), subtitle „Fassung 1“, body `<p>4 Regeln</p>`, `<div card-footer><span>Stand heute 06:00</span></div>`; `ariaLabel` „Umlageschlüssel nach Kostenstellenverantwortung Entwurf Fassung 1 4 Regeln Stand heute 06:00“ | AC-2, AC-5: named by the visible text, axe passes; long DE title with badge at 360 |
| All existing card stories | unchanged | — | AC-3 |
| Hero: all 18 stories | same IDs | `statLabelStyle`: drop `opacity: 0.6` (stat labels at 60 % fail on every band); update the numbers in the descriptions of the meta (3.38 bullet), *Band Link*, *Stage Actions* and *Badges in the Body* to §5 (no "under the body's 85 %", no "body text looks as before") | AC-6–9, 11 |

Review surfaces: *All Colors* (title + body, 9 bands), *Badges in the Body* and *Stage Actions* (label + title + body + buttons on 9 bands), *Slim* (18 px title), *All Light Colors*.

**N-1 (nit, pre-existing; in `requests/BACKLOG.md` as `058-n1`, owner 2026-11-10):** *Light Slim* passes `variant="slim light"` (`hero.stories.ts:323`); `HeroVariant` is one value, so the host gets the classes `hero--slim light` and renders the **dark** info band, not a light one. Out of scope here: don't fix it in this request; the story changes with H1 only through its body text (AC-9 compare).

## 9. Verification

| AC | How | Expected |
|---|---|---|
| AC-1 | Unit test (`card.component.spec.ts`): card with title „Regeln“, `badge` „3“, `<span card-badge>Neu</span>`, subtitle „Fassung 1“, `<span card-header-action>Bearbeiten</span>`, `<div card-header>Kopf</div>`, body `<p>aus USM übernommen 1</p>`, `<div card-footer>Stand heute</div>`; `textContent` normalised (`/\s+/g` → " ", trim); repeat as collapsible and as link card | „Regeln Neu 3 Fassung 1 Bearbeiten Kopf aus USM übernommen 1 Stand heute“ in all three; no U+00A0; `.card__title` text exactly „Regeln“ |
| AC-2 | *Clickable Named by Its Text*, `--axe=wcag21a`, 360 + 1280, L·D | 0 violations (`label-content-name-mismatch`, `nested-interactive`); prototype on main: control 1 violation → 0 in 4/4 (`058/probe-card-axe*`) |
| AC-3 | `story-shots --compare=tmp/story-shots/058/baseline-card` (35 stories, 360/1280 L·D, measure `(await new Promise(r => setTimeout(r, 800)), 1)`, list in `058/baseline-card.log`) + header/title/body rect measure (`058/proto-card.log`) | 140/140 identical (prototype: 140/140, "geom same" 140) |
| AC-4 | `card.collapsible`, `card.link` specs green | every name assertion unchanged. **Note:** three exact-markup pins (`card.collapsible.spec.ts` „renders as in 3.35“, `card.link.spec.ts` „as in 3.23.1“ ×2) gain the separator text nodes (stated reason 058 AC-1; elements and attributes unchanged), as the dl pins did in 3.37 |
| AC-5 | New story at 360 DE; existing *Link Cards German*, *Equal Footer German*, title-less cards in the AC-3 compare | wraps as card 1 of *Link Cards German*; compare identical |
| AC-6, 7 | New `hero.contrast.spec.ts`: compile `hero.component.scss`, read the 9 default and 9 light bands, assert min over t ≥ 4.5 for body, label and title inks (floored values = §5.1 / §5.2); `.hero__body` without `color` (inherits `#fff`), `.hero__label` without `opacity`; build.md lists the 18 band values | as §5.1, §5.2 |
| AC-8 | `button.styles` / `button.inverse-outline` specs (values updated, stated reason 058) + *Badges in the Body* measure | §5.3; badges unchanged (min 4.85) |
| AC-9 | `--compare=tmp/story-shots/058/baseline-hero` (23 stories, 360/1024/1280 L·D, 800 ms measure); the build shots should equal the H1 prototype `058/proto-hero/` by hash; §5.1 hue/saturation | prototype: 126 differ, 12 identical (*Light*, *All Light Colors*); hue Δ ≤ 2°, sat Δ ≤ .01, direction dark → light kept |
| AC-10 | Geometry measure of `058/baseline-hero.log` (`.hero`, label, title, body, media, footer rects per hero) re-run on the build; compare the `"measure"` parts (`grep -o '"measure":.*'` of both logs, `diff -q`) | identical (prototype: 138/138, `058/geo-{baseline,proto}.txt`) |
| AC-11 | `--forced-colors --compare=tmp/story-shots/058/baseline-hero-fc` (18 stories, 360/1280 L·D, 800 ms) + `--axe` on the hero stories | prototype: 48 differ = the 12 stories with a default-variant label (*Default, With Label, Large, Slim, With Media, Page Band, Band Link, Heading Level, Focus Title, Stage Actions, Badges in the Body, Fill*), 24 identical (*Minimal, No Radius, All Colors, Light, Light Slim, All Light Colors*); axe 0 violations (`color-contrast` incomplete on gradients is replaced by §5) |
| AC-12 | release check | changelog names the five bands, before/after values of §5.1, the text strength, and that success and warning look visibly darker (owner Q1 → H1) |

**Spec updates with stated reasons (developer):** `hero.slot-fill.spec.ts` AC-15 (body rule, dimmed list → `['.hero--light .hero__label']`); `button.styles.spec.ts` (primary light end `#1f8092`, values §5.3); `button.inverse-outline.spec.ts` (`[6.95, 9.36]`, `[3.79, 4.58]` ×2, white alone `[3.79, 4.58]`; recompute with the spec's own rounding); `character.contrast.spec.ts` (band end `#1f8092`, values §5.3). Baselines: `058/baseline-card` (140), `058/baseline-hero` (138, geometry in the log), `058/baseline-hero-fc` (72), all from main f7c3684.
