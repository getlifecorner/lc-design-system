# Design 051: Badge contrast on nav pills and light rail, tooltip on lc-button focus, lc-combobox openOnFocus

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-15
- **Measured on:** main 25a4902 (3.31.0), Storybook rebuilt 2026-11-05; prototypes injected in `--measure` (logs in `tmp/story-shots/051/`).

## 1. Approach

All four items extend existing parts; no new component, entry or token.

| Item | Fix | Pattern followed |
|---|---|---|
| A 050-f1 | On the **current** bottom-nav pill, the badge gets the bar colour under its own translucent fill: `.lc-bottom-nav__item--current .lc-bottom-nav__badge ::ng-deep .lc-badge { background-image: linear-gradient(var(--lc-badge-bg), var(--lc-badge-bg)); background-color: var(--lc-bottom-nav-bg, var(--_bg)); }` in `bottom-nav.component.scss`, after the `.lc-bottom-nav__badge` rule. A badge on the current pill then is pixel-for-pixel a badge on the bar. | The collapsed sidenav rail's opaque badge backdrop (no ring here: the bar badges have none). |
| B 050-f2 | A themed rail's badges take that theme's palette: in `_theme-light.scss`, right after `.lc-header--light { … }`, a new rule `.lc-sidenav-container--light .lc-sidenav__nav-badge { @include -light-theme-colors; }`; in `_theme-dark.scss`, after `.lc-header--dark`, the same with `--dark` / `-dark-theme-colors`. | `lc-header theme=` (043 F-25): the full colour set, because derived tokens (`--color-on-primary-subtle: var(--color-primary-500)` in dark) resolve where they are declared. |
| C 050-f3 | `TooltipDirective` describes and anchors to the host's **control** and also listens to `focusin`/`focusout` from inside the host (§6). | WAI-ARIA tooltip pattern: the description sits on the focused element. |
| D row 3 | `lc-combobox` input `openOnFocus` (default `true`); with `false` only a pointer press, typing or ArrowDown opens the list (§4). | `selectedValue`/`minChars`: behaviour inputs with JSDoc and an argType. |

Decisions:
- **D-1** (A) The backdrop sits on the inner `.lc-badge`, not on `.lc-bottom-nav__badge`: the `lc-badge` host is 24 px high around the 20 px badge (line box), so a wrapper backdrop shows a 4 px strip. Only the current pill gets it; non-current badges stay one layer (hash-identical, AC-2).
- **D-2** (B, AC-3 boundary clause) A badge is non-interactive text; WCAG 1.4.11 asks 3:1 only for boundaries needed to identify a component or state. No kit badge has a 3:1 boundary: on matching rails today (AC-4 keeps them) fill/border vs rail measure 1.00–2.48 (light) and 1.00–2.95 (dark). Meeting 3:1 only on mismatched rails would make one rail's badges look different on the two pages. AC-3 is therefore verified as: text ≥ 4.5 against the badge's own fill in every rail × page × state, and badge colours **equal to the matching-page rail**; the boundary values are reported in §5 for information. The reviewer applies this reading.
- **D-3** (B) The rule is scoped to `.lc-sidenav__nav-badge` (the `lc-badge` host) only, so the collapsed rail's label tooltip and projected content keep the page palette (they float over the page). Cost: +13.0 kB raw, **+231 B gzip** in the global CSS (measured: sheet gzip 7,102 → 7,333 with both rules after their header rules). No existing assertion changes (`theme-modes.spec` still finds `.lc-header--light {` once).
- **D-4** (C) `focus`/`blur` host listeners stay (the existing specs dispatch `new FocusEvent('focus')` on the host); `focusin`/`focusout` act only when `event.target !== host`, so a plain `<button lcTooltip>` runs exactly once per focus, as today.
- **D-5** (D) The pointer trigger lives in the existing frame `(click)` handler (clicks on the input bubble to it), so the template gets no new listener and the prerendered markup is unchanged (AC-13).

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | `openOnFocus` (lc-combobox) | `boolean` | `true` | Whether the list opens when the field gets focus (3.32, request 051). With `false`, focus alone (`focus()` from the page, Tab) leaves the list closed and `aria-expanded="false"`; a click or tap on the field, typing or ArrowDown opens it. Use it in forms that move focus into the field themselves, on open or to the first invalid field after a rejected save. Escape and choosing an option work as before. `@default true` |
| JSDoc | `tooltipId` (lcTooltip) | — | — | "Id of the tooltip element; while shown, the `aria-describedby` of the described element (the host, or the focusable element it wraps, such as `lc-button`'s `<button>`) points at it." |
| JSDoc | `TooltipDirective` class doc | — | — | Add: "Shows on hover and on keyboard focus of the host or of an element inside it (3.32). On a wrapper such as `lc-button`, the tooltip describes and anchors to the wrapped `<button>`." |
| CSS hook | none new | — | — | Bottom-nav backdrop reads the existing `--lc-bottom-nav-bg` (else the bar's own colour). |

No new types, outputs or slots. Default rendering unchanged: `openOnFocus` defaults to `true` and the click branch runs only for `false`; the bottom-nav rule matches only a badge on the current pill; the theme rules match only badges inside `theme="light"`/`"dark"` rails, whose values equal the root's of that theme (matching page = same computed colours, AC-4); tooltips are not shown at rest.

Compatibility lines for the changelog (no API break): a tooltip on a wrapper now also shows on keyboard focus inside it, describes the wrapped control, and anchors to it when it is the wrapper's only child (on an `lc-button` inside text or a block, whose host is an 18 px inline box, top and bottom tooltips move 12 px outwards at md and no longer overlap the button; in flex rows the host box already equals the button, except when the row stretches it); a themed rail's badges, like a themed header, no longer follow root-level token overrides; an app's `--lc-bottom-nav-bg` now also paints under the current pill's badge.

## 3. Anatomy and layout

No geometry changes anywhere (badge boxes, pills, rails, fields stay as measured in 050/047). Wireframes are of the new stories.

### 360 px

```
Bottom nav, Badges on the Current Pill (lang="de", column, gap 16, max-width 360)
┌ floating bar (fixed=false) ────────────────────────────────┐  ← Mehr current, moreBadge 1 warning
│  [▤] Cockpit      [₪]² Kosten        (pill 56×32[⋯]¹) Mehr │     badge xs 20 h, left pill-centre+6, top pill-top−4
└────────────────────────────────────────────────────────────┘     fill = --lc-badge-bg OVER bar colour (new)
┌ docked bar, same items ───────────────────────────────────┐
┌ floating bar: Kosten current, badge 4 success ─────────────┐

Sidenav, Themed Rail Badges (flex-wrap, gap 16; frames 1 px border, r 8, height 320)
┌ theme="light" 240 ──────┐ 16 ┌ 56 ┐   row 1: 242 + 16 + 58 = 316 ≤ 328
│ ⌂ Dashboard         (7) │    │⌂(7)│   rows 44, badge xs rounded
│ ▤ Tasks            (12) │    │ …  │
│ ✉ Messages        (New) │    │    │
│▌✓ Approvals         (3) │    │    │   ← current (activeRoute /approvals)
│ 🔔 Notifications     (2) │    │    │
│ 📁 Documents         (5) │    │    │
└─────────────────────────┘    └────┘
(row 2: the same pair with theme="dark")

Tooltip, Keyboard Focus (column of two block divs, gap 120, padding 96 16 120, text-align center)
        ┌ EN tooltip, top, ≤ 300 wide ┐
        └─────────────┬───────────────┘   8 px (CDK offset) to the 42 px button's top
                  [  Save  ]               lc-button md, inline host inside a block div
                  [Speichern]              lang="de"; focused by the play function
        ┌─────────────┴───────────────┐   8 px below the button's bottom (was 8 below the 18 px host = −4)
        └ DE tooltip, bottom, 2 lines ┘   x within 0…360 (CDK push, max-width 300)

Combobox, Open on focus off (column, gap 16, max-width 400)
y 16   Cost centre                         label 14/500/21
y 43   ┌ Search cost centres… ──────────┐  md frame 328×42, focused (field focus border), list closed
y 85   └────────────────────────────────┘
y 89   Select a cost centre from the list.  error 12/18 --color-text-error, role=alert, not covered
       [ Save ]                            lc-button md, 16 below the combobox host
```

### From 1024 px

Same stories; the sidenav pairs sit in one row (316 + 16 + 316 = 648); the bars keep `max-width: 360`; the tooltip column centres in the canvas; the combobox column stays 400 wide.

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Bottom-nav badge | xs 20 h, pad 2/6, r full; pill 56×32 | 12 px / 500 | `--lc-badge-bg/-fg`, new backdrop `--lc-bottom-nav-bg` → `--_bg` |
| Rail badge | xs; collapsed 16 h, 10 px/600 | as today | theme set on `.lc-sidenav__nav-badge` |
| Tooltip | pad 8/12, r md, max 300, offset 8 | 14/20 | unchanged |
| Combobox error | 4 below the 42 frame | 12/18 | `--color-text-error` (unchanged) |

## 4. States

| Part | States |
|---|---|
| Bottom-nav badge | Rest, non-current hover (pill `--_hover-bg`, unchanged), current (new backdrop), focus ring on the item unchanged (2 px, −2). Long values: "99+" unchanged (050: 3.6 / 1.2 px clearance). |
| Rail badge | Rest, hover, current (bar + tint), collapsed (backdrop + ring), every variant; light and dark rail × light and dark page. |
| Tooltip | Hover (unchanged). **Focus:** Tab into the host or into its control → shows after `tooltipShowDelay`; focus moving between two controls inside one host keeps it; `focusout` to outside → hides after `tooltipHideDelay`. Escape hides (existing listener); Tab away and back shows again. `tooltipDisabled`: never. Disabled `lc-button`: hover shows as today (no focus possible); loading `lc-button` (focusable, `aria-disabled`): shows on focus. Long text wraps at 300 px. |
| Combobox `openOnFocus=false` | Focus by `focus()` or Tab: closed, `aria-expanded="false"`, no `aria-controls`. Click or tap on the input or the frame beside it (not on a chip × or the clear button): opens when `query.length >= minChars` or `options` is not empty (the same condition as focus). Typing: opens as today. ArrowDown: opens as today. Escape, Tab, Enter, choosing: as today. Blur and Tab back in: closed. Clear / chip ×: focus returns to the input, list stays closed. Disabled: nothing opens. Multiple mode: the same. |

Click on the already open list's input keeps it open (no toggle). With the default `true`, a click on a focused field with a closed list (after Escape) still does nothing, as today (AC-9).

## 5. Theming

**A. Badge text on the current bottom-nav pill**, all six variants (`proto-bn.log`, 360; min in bold):

| Bar | Light (before = after) | Dark before | Dark after (= badge on the bar) |
|---|---|---|---|
| floating #14222e | def 6.86 · pri 8.48 · **suc 4.85** · war 5.52 · err 10.97 · inf 9.08 | def 6.96 · pri 5.46 · suc 4.48 · **war 4.03** · err 6.44 · inf 6.57 | def 9.28 · pri 7.13 · suc 5.82 · **war 5.17** · err 7.94 · inf 8.42 |
| docked #101c26 | as floating | def 7.42 · pri 5.79 · suc 4.75 · **war 4.26** · err 6.78 · inf 6.94 | def 9.97 · pri 7.63 · suc 6.24 · **war 5.55** · err 8.37 · inf 8.98 |

Non-current badges unchanged: rest = "after" column; on hover (pill tint) dark min warning 4.60 floating / 4.93 docked. Light: fills are opaque, so text is identical; only the translucent 1 px border now blends with the bar instead of the pill.

**B. Rail badges** (`proto-sn.log`, text on own fill; rail light #ffffff, dark #070e15):

| Rail | Page | Before | After |
|---|---|---|---|
| light | light | 4.85–10.97 (all states) | identical |
| light | dark | **1.11–1.96** (expanded), 1.21–1.96 (collapsed) | 4.85–10.97, = light page |
| dark | dark | rest 6.45–11.49 · hover 5.73+ · current 5.63+ · collapsed 6.45+ | identical |
| dark | light | 4.85+ text, but light chips on the dark rail (fill vs rail 15–18) | = dark page (min 5.63, warning on the current item) |

Boundary (fill or border vs item backdrop, max of both; D-2, information): light rail 1.00–2.48, dark rail 1.00–2.95, the same on both pages after the fix.

Forced colours (emulated, `proto-fc.log`): the gradient computes to `none`, fill Canvas, text and 1 px border CanvasText, in both rails and on the current pill; readable (AC-15). No new token.

C, D: no colour change (tooltip keeps its inverted surface; the combobox field states are unchanged).

## 6. Accessibility

- **Tooltip control** (resolved at every show): the host if it matches `CONTROL = 'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'`; else the host's first descendant matching `CONTROL`; else the host. `aria-describedby` is added to the control (ids already there are kept and restored on hide, also ids from `lc-button`'s `ariaDescribedBy`); the directive remembers the element so hide cleans the same one.
- **Anchor:** the control when it is the host's only element child (a wrapper: `lc-button`, `<span lcTooltip><a href>`), else the host (containers, fields with a label: unchanged). Set with `FlexibleConnectedPositionStrategy.setOrigin()` at every show. Plain `<button lcTooltip>`: control = anchor = host, as today (AC-6, AC-8).
- **Keyboard:** `focusin` (target ≠ host) → `showWithDelay()`; `focusout` (target ≠ host, `relatedTarget` outside the host) → `hideWithDelay()`. Escape: the existing document listener (top-most overlay only). WCAG 1.4.13: dismissible (Esc), hoverable (unchanged overlay, no pointer-events change), persistent until blur/leave/Esc.
- **Combobox:** `role="combobox"`, `aria-expanded` false while closed, `aria-controls` only while open (template unchanged); the error stays referenced by `aria-describedby` and announced by its `role="alert"` when it appears. A pointer opens because a sighted pointer user has asked for the list; keyboard users keep ArrowDown and typing.
- **44 px targets, reduced motion:** nothing new; no new motion (the badge backdrop is static; tooltip and list have no animation).
- **Forced colours:** see §5; tooltip and field unchanged.

## 7. Texts

No new built-in strings (AC-14). Story strings:

| Story | EN | DE |
|---|---|---|
| Badges on the Current Pill | — | Cockpit · Kosten · Mehr; `badgeAriaLabel` "{value} offen"; bar names "Hauptnavigation, schwebend" / "…, angedockt" / "…, Kosten aktuell" |
| Themed Rail Badges | Dashboard · Tasks · Messages · Approvals · Notifications · Documents; badges 7, 12, New, 3, 2, 5; `ariaLabel` "Light rail" / "Dark rail" (+ ", collapsed") | — |
| Keyboard Focus | Button "Save", tooltip "Saves your changes and keeps this page open, so you can carry on editing" (top) | Button "Speichern", tooltip "Speichert die Änderungen an der Kostenstellenzuordnung und lässt die Seite geöffnet" (bottom) |
| Open on focus off | Label "Cost centre", placeholder "Search cost centres…", error "Select a cost centre from the list.", options "4711 Administration", "4712 Sales", "4713 Production", "4714 Research and development", "4715 Human resources", button "Save" | — |
| Open on focus off (DE) | — | `lang="de"`, `multiple`, label "Kostenstellen", placeholder "Kostenstelle suchen …", `emptyMessage` "Keine Treffer", `clearAriaLabel` "Auswahl löschen", error "Wählen Sie mindestens eine Kostenstelle aus.", options "4711 Verwaltung", "4712 Vertrieb", "4713 Produktion", "4714 Forschung und Entwicklung", "4715 Personalabteilung", button "Speichern" |

At 360 every string fits its box (tooltip max 300 wraps; error 12 px ≈ 250 px in 328).

## 8. Stories

| Story | Expected ID | Args / template | Shows |
|---|---|---|---|
| Badges on the Current Pill (`CurrentPillBadges`) | `navigation-bottom-nav--current-pill-badges` | Three bars, `[fixed]="false"`: floating and docked with `showMore`, `moreRoute="/mehr"`, `activeRoute="/mehr/stammdaten"`, `moreBadge {1, warning}`, Kosten badge `{2, primary}`; third floating bar `activeRoute="/kosten"`, Kosten `{4, success}`. Description with the §5 A values. | AC-1 (FI case), AC-2 (Kosten badge off the pill) |
| Themed Rail Badges (`ThemedRailBadges`) | `navigation-sidenav--themed-rail-badges` | Four docked rails, `[mobileBreakpoint]="0"`, `activeRoute="/approvals"`: light 240, light collapsed, dark 240, dark collapsed; items §7 with variants default, primary, success, warning (current), error, info. | AC-3, AC-4, AC-15 |
| Keyboard Focus (`KeyboardFocus`) | `feedback-tooltip--keyboard-focus` | §3 template; `play` (story view only, after 50 ms) focuses `[lang="de"] lc-button button`. Description: focus shows it, Esc/blur hide it, it describes the inner button and sits 8 px from it. | AC-5–AC-7, AC-14 |
| Open on focus off (`OpenOnFocusOff`) | `form-combobox--open-on-focus-off` | §7 EN, `[openOnFocus]="false"`, `error` set; `play` focuses the input. | AC-10–AC-12 |
| Open on focus off (DE) (`OpenOnFocusOffDe`) | `form-combobox--open-on-focus-off-de` | §7 DE, `multiple`, `[openOnFocus]="false"`; `play` focuses the input. | AC-12 (multiple) |
| Combobox meta | — | argType `openOnFocus`: `control: 'boolean'`, the JSDoc sentence as `description`, `table.defaultValue.summary: 'true'`. | AC-9 |

Existing stories, expected shot changes (prototype `--compare` vs `051/baseline`): bottom-nav **more-badge** 6/6 (the only story with a badge on a current pill, L+D × 3); sidenav **collapsed-with-groups** L×3, **collapsed-rail-badges** L 1024/1280 + D×3 (at 360 the two drawers overlap and the light one is on top), **sidebar-first-layout / -collapsed / -prominent-brand** L×3 each = 17; tooltip **language** 4/4 (DE tooltip y 114 → 126 at 360 and 1280). All other shots identical (bottom-nav 78/84). Flaky without any change (re-shot): sidenav drawer-mode 360 D, collapsed-vs-expanded 360 D, sidebar-first-layout 1280 D, collapsed-icon-rail 360 D; docked 360 D differed only with the injected `<style>` (not with non-matching rules): re-check on the real build.

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| AC-1 | New story + `more-badge`, 360, L/D, floating/docked: 6-variant cycle on the current badge (`bn-proto-measure.js` without the CSS part); unit: the compiled bottom-nav CSS has the current-badge rule (gradient of `--lc-badge-bg` over `var(--lc-bottom-nav-bg, var(--_bg))`) | dark ≥ 5.17 floating / 5.55 docked, light ≥ 4.85 (§5 A) |
| AC-2 | `--compare=051/baseline` of the 14 bottom-nav stories + rest grid | only more-badge differs; non-current values = §5 A rest/hover |
| AC-3 | New sidenav story, 360/1280, L/D page: `sn-proto-measure.js` (no injection) | light rail ≥ 4.85, dark rail ≥ 5.63 on both pages; boundaries per D-2 (information) |
| AC-4 | Same grid + compare of the 24 sidenav stories; unit: a `theme-modes.spec` block like AC-6/7 for `.lc-sidenav-container--light .lc-sidenav__nav-badge` and `--dark` (172 colour tokens, equal to the root's), emitted once each, after the header rule | matching rail = baseline values; only the 17 listed shots differ |
| AC-5 | Unit: `focusin` from the inner button shows (with and without delay), `focusout` to outside hides, Escape hides; story measure: focus each button | tooltip present after focus, absent after Escape/blur |
| AC-6 | Unit: lc-button host → describedby on the inner `<button>`, none on the host, caller ids kept/restored; `<button lcTooltip>` → host. Story: DOM attributes | as stated |
| AC-7 | Keyboard Focus at 360/1280: `tooltip.top − button.bottom` (bottom), `button.top − tooltip.bottom` (top); Language story | 8 ± 0.5 px; Language DE tooltip y 126 (button 76–118) |
| AC-8 | `tooltip.directive.spec.ts` and `tooltip.lang.spec.ts` unchanged and green; new Escape-on-focus test | all pass |
| AC-9 | Unit: default `true`; all combobox specs unchanged; argType present | pass |
| AC-10 | Unit (`openOnFocus=false`): `input.focus()` → `aria-expanded="false"`, no `aria-controls`, no `[role=listbox]` | as stated |
| AC-11 | Unit: click on the input (focused or not), click on the frame, input event, ArrowDown → open; blur + focus → closed; Escape/selection as today; clear/chip × → closed | as stated |
| AC-12 | Both new combobox stories, 360, L/D: measure listbox count, `aria-expanded`, error rect vs any overlay; then click the input → listbox 1 | 0 / "false" / error at y 89, not covered; after click 1 |
| AC-13 | `check-angular-majors.mjs` (no template change) | passes |
| AC-14 | Keyboard Focus at 360: tooltip rect within 0…360 for EN and DE | both inside |
| AC-15 | `--forced-colors` on the new nav stories: badge bg/text/border computed | gradient `none`, Canvas/CanvasText, 1 px border |

Baselines (main 25a4902): `tmp/story-shots/051/baseline` — 38 nav stories (bottom-nav 14, sidenav 24) at 360/1024/1280 L/D with `050/rest-measure.js` (228 shots, `baseline-nav.log`) + tooltip 7 and combobox 11 at 360/1280 L/D with an 800 ms wait (72, `baseline-tt-cb.log`). Before-evidence for AC-12: *With Error* at 360, focus opens a 150.3 × 240 list at y 89 over the 18 px error (`probe-cb.log`).

Pitfalls to watch (memory): two-layer fills change the corner raster (light current-pill shots differ by design); subtree themes need the full set (043); `focus` doesn't bubble (050); CDK origin is fixed at overlay creation unless `setOrigin` (047); no new combobox template listener (compat `jsaction`); grep all of `src/lib` for specs that pin tooltip or combobox focus behaviour before changing them (048).
