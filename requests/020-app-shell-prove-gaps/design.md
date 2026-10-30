# Design 020: App shell prove gaps (page spacing, empty state, avatar fallback, outline tone, sidenav theme)

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-18
- **Baseline:** `tmp/story-shots/020/baseline` (main db2da64, 676 shots, §9). Expected diffs: **0**.

## 1. Approach

All seven rows extend existing components. There is no new component, no new token and no new built-in text.

| Row | Mechanism | Pattern followed |
|---|---|---|
| 1 | `lc-app-page` `paddingX: 'default' \| 'header'`, plus the existing hooks, now documented (one value, or per breakpoint in the app's CSS) | the private `--_pad-*` vars the hooks already feed; lc-header's own padding vars |
| 2 | `paddingTop: 'default' \| 'none' \| 'sm' \| 'md'` on `lc-app-page` **and** on `lc-page-header` | page-header `noPaddingX`; unions such as `HeroSize` |
| 3 | `lc-empty-state` `iconTone: 'neutral' \| 'primary'` | `lc-next-step-card` `tone` (an icon in a bubble) |
| 4 | `lc-empty-state` `messageSize: 'sm' \| 'md'`, a second axis beside `size` (padding), so no `size` default moves | — |
| 5 | `lc-avatar` `fallback: 'initials' \| 'person'`; `lc-header` passes it through as `userAvatarFallback` | `userAvatarColor` pass-through |
| 6 | `tone: 'neutral' \| 'primary'` on `lc-button` and `a[lcButton]`, read only by `variant="outline"` | `tone` in next-step-card and status-dot |
| 7 | The kit no longer declares the 10 public colour hooks on `:host`. Their defaults move into the private `--_lc-sidenav-t-*` vars, and every read becomes `var(--lc-sidenav-X, var(--_lc-sidenav-t-X))` | 019's private theme vars, one step further |

**A1: the requester's 32 px can't align (measured).** `lc-header` pads 16 px up to 768 px and 24 px above (`header.component.scss` l. 25, 51), so 32 px puts the `h1` 8 px right of the header title at 1280 and AC-1 (16/32) and AC-2 can't hold with one setting. `paddingX="header"` mirrors the header's padding (same breakpoint and density vars), so AC-2 holds at every width; the literal 16/32 is the documented hook route of §2 (AC-1 through the spec's "documented per-breakpoint route"). The changelog recommends `header`; `lc-header` stays as it is (out of scope).

**Rejected:** `--lc-app-page-padding-x-{sm,md,lg}` (five hooks for one consumer) · `paddingX="aligned"` at a fixed 16/32 (aligns with nothing in the kit) · row 7 as a resolved private var on `:host` (`--_bg: var(--lc-sidenav-bg, …)`), which would ignore hooks set on inner elements, including the kit's own `transparent` rule on `.lc-sidenav--docked`.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | `lc-app-page` `paddingX` | `AppPagePaddingX` | `'default'` | Horizontal page padding. `'default'`: 24/32/48/56/72/96 px from 0/640/1024/1280/1440/1920 px. `'header'`: the same padding as `lc-header` (16 px up to 768 px, 24 px above, from `--lc-density-padding-md`/`-lg`), so the content lines up with the header title and the user menu. Combine it with `contentMaxWidth="none"` (or a page narrower than the cap). `--lc-app-page-padding-x` wins over both. |
| input | `lc-app-page` `paddingTop` | `AppPagePaddingTop` | `'default'` | Space above the page content. `'default'`: 24/32/48/56/72/112 px by width. `'none'` 0, `'sm'` 8 px, `'md'` 16 px at every width. `--lc-app-page-padding-top` wins. |
| input | `lc-page-header` `paddingTop` | `PageHeaderPaddingTop` | `'default'` | Space above the header content. `'default'`: the size's block padding (24, comfortable 40, compact/secondary 12). `'none'` 0, `'sm'` 8 px, `'md'` 16 px. The bottom padding is unchanged. Use `'none'` with `lc-app-page` `paddingTop="md"` to put the `h1` 16 px below `lc-header`. |
| input | `lc-empty-state` `iconTone` | `EmptyStateIconTone` | `'neutral'` | `'neutral'`: the bare 40 px icon in `--color-text-tertiary`. `'primary'`: a 24 px icon in `--color-primary-700` on a 48 px `--color-primary-100` circle. Decorative in both tones. |
| input | `lc-empty-state` `messageSize` | `EmptyStateMessageSize` | `'sm'` | `'sm'`: 14 px message. `'md'`, for a state page: 16/24 px message, 20 px heading, 16 px below the icon and 24 px before the projected action. |
| input | `lc-avatar` `fallback` | `AvatarFallback` | `'initials'` | What shows with no image and no name: `'initials'` shows "?"; `'person'` shows a person symbol on a neutral disc (`color` is ignored while it shows). With a `name`, both show the initials. |
| input | `lc-header` `userAvatarFallback` | `AvatarFallback` | `'initials'` | Passed to the trigger avatar and the menu avatar as `fallback`. |
| input | `lc-button`, `a[lcButton]` `tone` | `ButtonTone` | `'neutral'` | Colour tone of `variant="outline"`: `'primary'` sets text and border to the primary colour. Other variants ignore it. |
| CSS hook | `--lc-app-page-padding-x` / `-padding-top` | length | unset (see the inputs) | One value at every width. Set it on `lc-app-page` or an ancestor; for per-breakpoint values, put it inside your own `@media`. Documented now. |
| CSS hook | `--lc-app-page-gap` / `-aside-width` | length | 24 (40 from 1024) / 360, 400, 460 px | Documented now (they were only in an SCSS comment). |
| CSS hook | `--lc-sidenav-{bg, fg, fg-active, border, hover-bg, section-fg, active-bg, active-fg, active-icon, badge-ring}` | colour | unchanged | Now read from the element **or any ancestor**. A value set on the element wins, and both win over `theme`. |
| type | `AppPagePaddingX` · `AppPagePaddingTop` | `'default' \| 'header'` · `'default' \| 'none' \| 'sm' \| 'md'` | — | `app-shell` entry |
| type | `PageHeaderPaddingTop` | `'default' \| 'none' \| 'sm' \| 'md'` | — | `page-header` entry (entries don't share types) |
| type | `EmptyStateIconTone` · `EmptyStateMessageSize` | `'neutral' \| 'primary'` · `'sm' \| 'md'` | — | `empty-state` entry |
| type | `AvatarFallback` | `'initials' \| 'person'` | — | `avatar` entry; header imports it from `@lifecorner/angular-ui-kit/avatar` |
| type | `ButtonTone` | `'neutral' \| 'primary'` | — | `button` entry |

**Per-breakpoint route (docs, AC-1):** `lc-app-page { --lc-app-page-padding-x: 16px }` plus `@media (min-width: 1024px) { lc-app-page { --lc-app-page-padding-x: 32px } }`.

**Default rendering unchanged:** a default value adds no class and no DOM. Modifiers: `lc-app-page--pad-x-header`, `lc-app-page--pad-top-{none|sm|md}`, `lc-page-header--pad-top-{none|sm|md}`, `empty-state--tone-primary`, `empty-state--message-md`, `lc-avatar--person`, `btn-tone-primary` (outline only). The neutral empty state keeps `<lc-icon size="xl" color="var(--color-text-tertiary)">` as a direct child; row 7 computes the same values for every existing story. Proved by the hash compare.

**CSS notes:** `.lc-app-page.lc-app-page--pad-x-header { --_pad-x: var(--lc-app-page-padding-x, var(--lc-density-padding-lg, var(--spacing-6))) }`, and in `@media (max-width: 768px)` the same with `-md` / `--spacing-4`; (0,2,0) beats every breakpoint block (0,1,0). `pad-top-*` does the same on `--_pad-top`. Page-header: `.lc-page-header.lc-page-header--pad-top-* { padding-top: … }` after the base `padding-block`.

## 3. Anatomy and layout

### 360 px (`layout-app-shell--state-page-aligned`, header md, light)

```
x 0 |16|                 content 328                 |16| 360
┌──────────────────────────────────────────────────────┐ y 0
│  Finance Intelligence                       (◐ 40)   │ lc-header md 64, transparent; title x 16; trigger 48×48 at x 296–344
├──────────────────────────────────────────────────────┤ y 64
│  ↕ 16  app-page paddingTop="md"                      │
│  Noch keine Rolle                                    │ h1 x 16, y 80; 30/37.5, 700 (comfortable, noPaddingX, paddingTop="none")
│  ↕ 40 page-header bottom + 32 empty-state md         │
│                    ( ⊘ 48 )                          │ circle centred (x 156–204), icon 24
│  ↕ 16                                                │
│       Ihrem Konto ist noch keine Rolle               │ message 16/24, text-tertiary, centred
│       zugeordnet. Bitte wenden Sie sich an           │
│       die Administration.                            │
│  ↕ 24                                                │
│                 [ ⇥  Abmelden ]                      │ outline primary lg, 48 high
└──────────────────────────────────────────────────────┘
```

### 1024 / 1280 px (no nav column, as on "sign-in failed")

```
x 0 |24|                         content 1232 (at 1280)                          |24| 1280
┌───────────────────────────────────────────────────────────────────────────────────┐ y 0
│ Finance Intelligence                                                     (◐)     │ title x 24; trigger x 1208–1256
├───────────────────────────────────────────────────────────────────────────────────┤ y 64
│ ↕ 16                                                                              │
│ Noch keine Rolle                                                                  │ h1 x 24, y 80
│ ↕ 72                                                                              │
│                                    ( ⊘ )                                          │ centred on x 640
│                  Ihrem Konto ist noch keine Rolle zugeordnet. Bitte …             │ max-width 32rem (512); 16 / 24 as at 360
│                                 [ ⇥ Abmelden ]                                    │
└───────────────────────────────────────────────────────────────────────────────────┘
```

At 1024 px: the title and the h1 are at x 24, the trigger at x 952–1000. With a nav column (019 full-height), the page starts at x 240, so the h1 is at x 264, which is the header title's x.

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| app-page main (`header`, `md`) | pad-x 16 (≤ 768) / 24; pad-top 16 | — | `--lc-density-padding-md`/`-lg`, `--spacing-4` |
| page-header (`paddingTop="none"`) | top 0, bottom 40 (comfortable), inline 0 | h1 30/37.5, 700 | `--font-size-3xl` |
| icon circle (primary) | 48 × 48, radius full, icon 24 centred | — | `--color-primary-100`, `color: --color-primary-700`, `--border-radius-full` |
| icon → first text (md) | 16 = gap 8 + circle `margin-bottom` 8 | — | `--spacing-2` |
| heading (md) | 8 to the message | 20/25, 600 | `--font-size-xl`, `--line-height-tight` |
| message (md) | `max-width: 32rem`, `overflow-wrap: break-word` | 16/24, 400 | `--font-size-base`, `--line-height-normal` |
| last text → action (md) | 24 = gap 8 + `margin-bottom` 16 on the message (or on the heading when there is no message), only when it isn't `:last-child` | — | `--spacing-4` |
| avatar person | box 24/32/40/48/64; glyph 60 % (14.4/19.2/24/28.8/38.4) | — | `--color-neutral-300` disc, `--color-neutral-700` glyph |
| outline primary | geometry unchanged | unchanged | border `--color-primary-600`, text `--color-primary-700` |

- The action spacing sits on the kit's text element, because projected children carry no `_ngcontent` (pitfall 019). Several actions: wrap them in one row element.
- Primary icon: `<span class="empty-state__icon empty-state__icon--primary" aria-hidden="true"><lc-icon [name] size="md" [decorative]="true"/></span>`, no `color` input, so no inline style (CSP). Person glyph: inline `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">` with the `ICON_USER_SOLID` path, `fill: currentColor`, in the template (no icon registration).

## 4. States

| Component | State | Spec |
|---|---|---|
| outline primary | default · hover · active | bg = outline tint `rgba(132,199,212,.06)`, border `--color-primary-600`, text `--color-primary-700` · bg `--color-surface-selected`, text and border unchanged · bg `--color-primary-200`, `filter: none` |
| outline primary | focus-visible · disabled · loading | kit ring unchanged (2 px `--color-primary-500`, offset 2) · `opacity: .5`, no hover · the spinner is `currentColor` (primary-700); `aria-busy` as today |
| outline primary | overflow | a long DE label ("Berechtigungsanfrage zurückziehen") wraps by the existing `.btn` rules |
| empty state | no icon · no message · no action · long text | no circle; the text starts at the top padding · the heading takes the action margin · no margin at all (`:last-child`) · "Zugriffsberechtigungsverwaltung" (16 px ≈ 250 px) fits in 328 px, and `break-word` covers longer ones |
| avatar person | image error · `status` · `ring` · `decorative` | an image error falls back to person when there is no name · the dot and the ring stay · no role and no label |
| app-page / page-header | centred content · breadcrumbs slot · `showDivider` | alignment needs `contentMaxWidth="none"` (documented) · breadcrumbs start at the new top · the divider at the bottom is unaffected |
| page-header | loading (skeleton in `slot="breadcrumbs"`, no title) | same `paddingTop`, so the skeleton top = the h1 top (AC-5) |
| sidenav / placeholder | the order in which a hook wins | set on the element > set on an ancestor > `theme` > auto default. `transparent` keeps `bg: transparent` (inner rule, as today). The geometry vars stay on `:host`. |

## 5. Theming

| Element | Light | Dark | Contrast (computed, WCAG) |
|---|---|---|---|
| empty-state icon on circle | `#144f5b` on `#e0f1f4` | `#c1e3e9` on `#0d353d` | **7.85** / **9.68** (≥ 3) |
| circle vs the page (decorative, not required) | — | — | 1.16 / 1.43 |
| message `--color-text-tertiary` (16 px) on background, land-1…3, surface | min `#5c6672` on land-1 | min on land-1 | ≥ **5.17** / ≥ **6.47** |
| avatar person glyph on disc | `#374151` on `#d1d5db` | `#e5e7eb` on `#4b5563` | **7.00** / **6.10**; disc vs the page 1.47 / 2.49 (the glyph carries the meaning) |
| outline primary text on the tint (over bg, land-1, land-3, surface) | `#144f5b` | `#c1e3e9` | 8.81 / 7.86 / 8.57 / 8.81 · 12.58 / 10.90 / 12.47 / 11.34 |
| outline primary border vs the page | `#1a6a79` | `#a3d5df` | 5.99 / 5.34 · 10.71 / 9.28 |
| hover: text on `--color-surface-selected`; border vs the page | | | 7.85; 6.21 / 5.50 · 10.57 / 9.20; 11.78 / 10.42 |
| active: text on `--color-primary-200`; border vs `--color-primary-200` | `#c1e3e9` bg | `#144f5b` bg | 6.71 / 6.71; 4.56 / 5.72 |
| focus ring `--color-primary-500` vs bg / land-1 | `#208497` | `#84c7d4` | 4.37 / 3.87 · 9.95 / 8.81 |
| sidenav story rail (ancestor hooks) | `--color-primary-fill-active` `#0d353d`, fg `--color-on-primary` | same (theme-stable) | white on `#0d353d` 13.18; active white on `#1a6a79` 6.21 |

New tokens: none. A solid `primary-fill` hover was rejected (3.03:1 against the dark page, 2.68 on land-1). **Pre-existing, out of scope:** the default outline hover in dark is white on `#a3d5df`, **1.60:1** (F1).

## 6. Accessibility

- **Empty state:** `role="status"` container unchanged; the circle `span` is `aria-hidden="true"`, the `lc-icon` `decorative`; nothing new is focusable.
- **Avatar:** the root keeps `role="img"` and `aria-label = alt || name || 'Avatar'`; the `svg` is `aria-hidden="true" focusable="false"`; `decorative` drops role and label. In the header both avatars stay decorative and the trigger name stays `userMenuAriaLabel` ("?" adds no initials, 3.11.4).
- **Button:** native semantics and the ring unchanged. **Targets:** lg buttons 48 px, header trigger 48.
- **Forced colours:** outline border and text become ButtonText (UA, no `forced-color-adjust`); the person glyph (`currentColor`) becomes CanvasText, plus `border: 1px solid CanvasText` on `.lc-avatar--person` (border-box, size unchanged); the circle becomes Canvas with the icon in CanvasText.
- **Reduced motion:** no new transition (the outline hover uses the existing `.btn` transition). **Prerender:** classes, static SCSS and template SVG only, so the server HTML is final (AC-17).

## 7. Texts

No new built-in strings. The avatar's existing default name is used when there is no `alt` and no `name`.

| Key / input | EN default | DE |
|---|---|---|
| `lc-avatar` name (person, no `alt`) | "Avatar" (unchanged) | "Avatar" (same word); apps may pass `alt`, e.g. "Kein Profilname" |
| story h1 | "No role yet" | "Noch keine Rolle" |
| story message | "Your account has no role yet. Please contact your administration." | "Ihrem Konto ist noch keine Rolle zugeordnet. Bitte wenden Sie sich an die Administration." (3 lines at 360) |
| story action | "Sign out" | "Abmelden" |
| story `userMenuAriaLabel` | "User menu" | "Benutzermenü" |

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| State Page Aligned | `layout-app-shell--state-page-aligned` | `locale` de/en (default de), `paddingX` (`header`), `paddingTop` (`md`) | the §3 frame: header md transparent, `showLogo=false`, title, trigger without a name plus `userAvatarFallback="person"`; app-page `contentMaxWidth="none"`; page-header comfortable, `noPaddingX`, `paddingTop="none"`; empty state `iconTone="primary"`, `messageSize="md"`, icon `user-x`, action `lc-button outline tone="primary" size="lg"` with the `logout` icon |
| State Page Loading | `layout-app-shell--state-page-loading` | — | the same frame with the skeleton page-header (`paddingTop="none"`, `lc-skeleton slot="breadcrumbs"` 12rem × 2.375rem) |
| Page Padding Per Breakpoint | `layout-app-shell--page-padding-per-breakpoint` | — | the documented 16/32 hook route (`<style>` in the story, the CSS in the docs), with a header and an h1 |
| Padding Top | `layout-page-header--padding-top` | `paddingTop` | default/none/sm/md comfortable headers, each in a 1 px dashed frame |
| Primary Tone | `feedback-empty-state--primary-tone` | `iconTone`, `messageSize` | neutral vs primary at sm/md/lg |
| State Page | `feedback-empty-state--state-page` | `iconTone: 'primary'`, `messageSize: 'md'` | no heading, DE message + "Abmelden"; a second one with a heading and the long compound |
| Person Fallback | `data-display-avatar--person-fallback` | `fallback` | xs–xl person; with a name it shows initials; `color="member-1"` stays neutral; a broken `src`; `decorative` |
| Avatar Person Fallback | `navigation-header--avatar-person-fallback` | — | `userName=''` with an email: the trigger and the open menu show the person |
| Outline Primary Tone | `components-button--outline-primary-tone` | `tone` | neutral vs primary rows: sm/md/lg, with an icon, disabled, loading; `tone` on `primary` is ignored |
| Outline Primary Tone | `components-button-link--outline-primary-tone` | `tone` | the same for anchors |
| Hooks On An Ancestor | `navigation-sidenav-placeholder--hooks-on-an-ancestor` | — | 4 pairs (sidenav + placeholder) for dark, light and auto with all 9 colour hooks on a wrapper (bg `fill-active`, hover `fill-hover`, active `fill`, fg/section/active `on-primary`, border transparent), plus a dark pair with an element override `--lc-sidenav-bg: var(--color-primary-fill)` |

Every new input gets an argType with `description` and `table.defaultValue`. **Docs (AC-15):** the `lc-app-page` JSDoc and the app-shell meta docs list the hooks with defaults, the per-breakpoint route and A1. The `lc-sidenav` JSDoc (l. 67–75), the placeholder JSDoc and story docs (the wrong "ancestor of both" line) and `getting-started.mdx` l. 186–202 say "set on the element or any ancestor; the element wins; both win over `theme`"; the mdx example moves from `isOpenInput`/`modeInput` to `isOpen`/`mode`.

## 9. Verification

`story-shots.mjs` at 360/1024/1280, light and dark where colours apply; unchanged stories with `--compare=tmp/story-shots/020/baseline`.

| AC | How | Expected value |
|---|---|---|
| AC-1 | page-padding-per-breakpoint and state-page-aligned: `.lc-app-page__main` `padding-left` | 16 / 32 / 32 · 16 / 24 / 24 (360 / 1024 / 1280) |
| AC-2 | state-page-aligned: `.lc-header__title` x vs `h1` x | 16 = 16 (360), 24 = 24 (1280), ± 0.5 |
| AC-3 | content-page padding-left; CSS spec (24/32/48/56/72/96, hook first in every block); compare | 24 / 48 / 56; 14 app-shell stories identical |
| AC-4 | state-page-aligned: `h1.top − .lc-header.bottom`; padding-top story `padding-top` | 16 at 360 and 1280 (h1 y 80); 40 (default, comfortable) / 0 / 8 / 16 |
| AC-5 | state-page-loading: `lc-skeleton` top vs the h1 top in AC-4 | 80 = 80 at 360 and 1280 |
| AC-6 | compare the 18 page-header stories; page-header spec | 0 diffs; specs green |
| AC-7 | unit test: primary → `.empty-state__icon--primary[aria-hidden=true]` with a decorative lc-icon and no `style`; neutral → the lc-icon is a direct child. Measure the circle | 48 × 48, bg rgb(224,241,244) / rgb(13,53,61), svg 24 × 24, colour rgb(20,79,91) / rgb(193,227,233) |
| AC-8 | §5 | 7.85 / 9.68 |
| AC-9 | state page at 360: message font/LH; circle bottom → message top; message bottom → button top; compare the 7 empty-state stories | 16 px / 24 px; 16; 24; 0 diffs |
| AC-10 | unit test: `fallback="person"` + no name → `.lc-avatar--person` + svg; + name → initials; + `src` → img; default → "?" | as stated |
| AC-11 | unit test: `role="img"`, `aria-label` "Avatar" / the `alt`; svg `aria-hidden`; `decorative` → no role | as stated |
| AC-12 | §5; CSS spec for the forced-colors rule; measure the disc and glyph colours | 7.00 / 6.10; rgb(209,213,219) / rgb(75,85,99) disc |
| AC-13 | unit test: outline + primary → `btn-tone-primary`; primary variant + primary tone → no class; §5; measure text/border at rest and on hover; compare 35 button(-link) stories | text rgb(20,79,91) / rgb(193,227,233), border rgb(26,106,121) / rgb(163,213,223); 0 diffs |
| AC-14 | hooks-on-an-ancestor: computed `background-color` of `.lc-sidenav` in each component; spec: no host rule declares the 10 hooks, and no read lacks a fallback (regex over both stylesheets) | rgb(13,53,61) for the 6 ancestor cases, rgb(26,106,121) for the 2 override cases, in both page themes |
| AC-15 | read-through (§8 docs); specs changed only at brand spec l. 228 and 293–296, app-shell spec l. 91–92, each with a comment "020: hooks are no longer declared on `:host`, so ancestor values reach the rail"; compare the 26 sidenav/placeholder stories + full-height-nav | 0 diffs (019 element-over-theme kept) |
| AC-16 | state-page-aligned DE at 360: `scrollWidth`; `[tabindex]` count; tab order | 360; no new tabindex; trigger → "Abmelden"; ring 2 px visible |
| AC-17 | compat template: one page with every new modifier; `EXPECT_IN_HTML` gets the 7 class names + the `lc-avatar--person` svg | present in the prerendered HTML |
| AC-18 | tests, lint; the MCP manifest lists the 9 inputs (`tone` on both button classes) with `@default` | green; 9/9 |

**Risks and follow-ups:** **F1** dark default outline hover 1.60:1 (pre-existing, not changed here). **R1** FI's rail uses the `--color-primary-800/100…` scale, which inverts in dark; recommend the theme-stable fill tokens (as `full-height-nav`). **R2** ancestor-set sidenav hooks that apps wrote earlier (silently ignored) now apply: Compatibility line. **R3** ~33 read sites (`sidenav.component.scss`, `_sidenav-docked.scss`, placeholder fill `color-mix(… var(--lc-sidenav-fg, var(--_lc-sidenav-t-fg)) 16% …)`; badge ring `var(--lc-sidenav-badge-ring, var(--lc-sidenav-bg, var(--_lc-sidenav-t-bg)))`); the regex spec catches a missed one. **R4** `header` aligns only when the content isn't centred (JSDoc).
