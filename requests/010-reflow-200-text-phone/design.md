# Design 010: Reflow gaps at 200 % text on a phone

- **Status:** ready
- **Spec:** [spec.md](spec.md), AC-1 to AC-12
- **Baseline:** `tmp/story-shots/010/baseline`: 79 stories, `--full`, 360/1024/1280 × light/dark, 474 shots, build of `main` 9de8ee6. The stories are badge (10), next-step-card (13), page-header (16), footer (8), button (23) and button-link (9).
- **Prototyped:** every rule below was injected as CSS into the current build, and the result was compared by hash with the baseline. Page-header and footer gave 144/144 identical shots, next-step-card 78/78, and page-header with actions 96/96 (see §9).

## 1. Approach

This request extends four components with plain CSS. It adds no JS and no DOM change, apart from the badge's new modifier class. It follows these patterns: the 009 large-text stories (`textSize` arg, `data-lc-story-text`, fullscreen), the `--lc-btn-flush-align` hook (a value set on a button or an ancestor), and the `badgeClasses()` modifiers.

| Gap | Mechanism | Why |
|---|---|---|
| AS-30 (2), title | `.lc-page-header__title { overflow-wrap: anywhere }`. `.lc-page-header__actions` gains `max-width: 100%` and sets the button hook to `anywhere`. | The title is `inline-flex`, so its text is an anonymous flex item. With `break-word`, that item can't get narrower than its longest word. `anywhere` removes that minimum, and hyphenation (`--lc-page-header-title-hyphens`) is still tried first. The title box already has `min-width: 0`, so the shrinking of the row doesn't change. The actions are `flex: 0 0 auto`: at 320 px / 200 % the default story's two actions ran 181 px past the header. The clamp makes them wrap. |
| AS-30 (2), buttons | New hook `--lc-btn-overflow-wrap` (default `break-word`). The kit sets it to `anywhere` in the wrapping rows it owns: `.footer__bottom`, `.lc-page-header__actions` and the next-step-card's narrow `__actions`. | **This deviates from the wording of AC-3.** `anywhere` drops the min-content width of *every* button to one character. In a row that doesn't wrap, at 100 % text, a button then shrinks along with its neighbours. Measured at 312 px with `<h3>` "Haushaltsmitglieder verwalten" next to a `.btn-md`: "Bearbeiten" is 116.7 × 42 with `break-word` (one line, the h3 wraps) but 93.8 × 62 with `anywhere` ("Bearbeit/en"). "Änderungen anfordern" goes from 127.4 px wide on 2 lines to 110.8 px on 3 lines. A global `anywhere` would therefore break AC-3's own clause "min-content of a normal button unchanged" and the minor-release rule. A wrapping row places its items at max-content, so there `anywhere` only acts on an item that is wider than its whole line, which is exactly the AS-30 case. All observable clauses of AC-3 hold (§9). |
| AS-32 | The narrow layout (`< 30rem`) changes from `grid` to `flex-wrap`. The title gets `flex: 1 1 0%; max-width: 100%` and keeps `break-word`. | The title's automatic minimum is its longest word. If icon, gap and that word don't fit on one line, the title wraps below the icon and takes the full width. When it fits, the flex layout gives the same boxes as the grid: 78/78 identical shots. This is pure CSS, depends on the real text width, and covers both variants. |
| SI-15 | `wrap` input → `lc-badge--wrap` | The option is opt-in, so counts and table cells keep `nowrap` (spec assumption). |

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (`lc-badge`) | `wrap` | `boolean` | `false` | "Let a long label wrap onto centred lines instead of staying on one line: the fixed height becomes a minimum height, lines are 1.25 high, and the badge is never wider than its container (a word wider than the container breaks). With `rounded`, the corners keep the one-line pill radius, so a two-line badge isn't clipped by half-circle ends. A label that fits looks as before. Use it for sentence-like status labels (SI-15), not for counts. @default false" |
| class | `lc-badge--wrap` | — | — | Set on the inner `<span>` when `wrap` is true. No other class or DOM change. |
| CSS hook | `--lc-btn-overflow-wrap` | `break-word \| anywhere` | `break-word` | Document it in the class JSDoc of `ButtonComponent` and `ButtonLinkComponent`: "`anywhere` lets a single word wider than the button's line break inside the word, so the button stays inside its container (WCAG 1.4.10 at 320 px or 200 % text). Set it on the button, the `lc-button` host or an ancestor that is a wrapping row or a column. In a non-wrapping row it lets a one-word button shrink with its neighbours, which is why the default stays `break-word`. The kit sets it in `lc-footer`'s link row, the page-header actions and the next-step-card's narrow actions." |

No new types. **Default rendering stays unchanged:** the badge's default CSS and class list are untouched; `.btn` resolves the hook to `break-word`, the value it has today; and the three rows that get `anywhere` render identically wherever their items fit (prototype, §9). Argtype for `wrap`: `control: 'boolean'`, `description: 'Wrap a long label onto centred lines (min-height instead of height; with rounded, a fixed radius)'`, `table: { defaultValue: { summary: 'false' } }`.

## 3. Anatomy and layout

### Badge `wrap`: 360 px at 100 % (story box 12rem), and 320 px at 200 % (container 288)

```
100 %, md, rounded (box 192):           200 %, md, rounded (container 288):
╭──────────────────────╮ r 14           ╭───────────────────────────────────────╮ r 28
│ Geschlossene Beta,   │ 14/17.5        │    Geschlossene Beta, nur mit         │ 28/35, centred
│  nur mit Einladung   │ centred        │             Einladung                 │
╰──────────────────────╯ h 45.5         ╰───────────────────────────────────────╯ h 91, w 288
 pad 4.25 block · 10 inline              pad 9.5 block · 20 inline · border 1
```

| Size | min-height (= old height) | padding-block in wrap mode | Radius with `rounded` + `wrap` | 2 lines at 100 % |
|---|---|---|---|---|
| xs | 1.25rem (20) | `max(0px, calc((1.25rem - 2px) / 2 - var(--line-height-tight, 1.25) * 0.5em))` = 1.5 | 0.625rem (10) | 35 |
| sm | 1.5rem (24) | same formula with 1.5rem = 2.25 | 0.75rem (12) | 41.5 |
| md | 1.75rem (28) | same formula with 1.75rem = 4.25 | 0.875rem (14) | 45.5 |
| lg | 2rem (32) | same formula with 2rem = 5 | 1rem (16) | 52 |

- **Wrap rules:** `.lc-badge--wrap { height: auto; max-width: 100%; white-space: normal; text-align: center; line-height: var(--line-height-tight, 1.25); overflow-wrap: anywhere }`. The padding-inline stays per size, and so does the 640 px `lg` rule. Each radius is half the one-line height, so a one-line badge keeps the same pill shape as `9999px`.
- **Specificity:** `height: auto` has to beat `.lc-badge--md { height }`. Write the size rules as `.lc-badge--wrap.lc-badge--<size>` (0,2,0), and the radius as `.lc-badge--wrap.lc-badge--rounded.lc-badge--<size>`.
- **Dot:** `.lc-badge--wrap .lc-badge__dot { align-self: flex-start; margin-top: calc((var(--line-height-tight, 1.25) - 0.5) * 0.5em) }` (0.375em) keeps the dot centred on the first line. On one line its top is 10.5 px (21 px at 200 %), the same as without `wrap`.
- **One line:** the width and the 28 px height are the same as without `wrap`. The text rect top is 5.25 px instead of 5 px (measured), because the line box is 17.5 px instead of 14.

### Next-step-card narrow layout: 360 and 320 px at 200 % (card = viewport − 48, as on life-os Today)

```
fits (default, 360: card 312)            does not fit (soft, 320: card 272)
┌4┬───────────────── 312 ──────────┐     ┌──────────────── 272 ───────────────┐
│ │ 32 ┌72┐ 32 Wartet auf          │     │ 48 ╭──96──╮                         │ icon x 48 y 48
│ │    └──┘    Freigabe   (139 col)│     │    ╰──────╯                         │
│ │ message, actions: full row     │     │ 28 Nichts zu            (176 wide)  │ title x 48 y 172
└─┴────────────────────────────────┘     │    tun        40/48 px bold, h2     │
                                         │ message: full row                   │
                                         └─────────────────────────────────────┘
```

| Element | Narrow rule (inside `@container lc-next-step-card (width < 30rem)`) |
|---|---|
| `.lc-next-step-card` | `display: flex; flex-wrap: wrap` instead of `grid`. Remove `grid-template-columns`. `align-items: center`, column-gap, row-gap and padding stay as they are. |
| `__icon` | Remove `grid-column: 1`. It already has `flex: none`. |
| `__title` | `flex: 1 1 0%; max-width: 100%` instead of `grid-column: 2`. **Keep `overflow-wrap: break-word`:** the wrap decision depends on min-content being the longest word, and `max-width` caps that minimum at the line, so a word wider than the whole line still breaks without overflowing. |
| message, custom-message, content, blockers, meta, actions | `flex: 1 1 100%; min-width: 0` instead of `grid-column: 1 / -1`. `min-width: 0` matches the grid, where an item spanning a flexible track has no automatic minimum. Without it, the actions ran 14 px past the card at 272 px. |
| `__actions` | `--lc-btn-overflow-wrap: anywhere` (the actions are stretched with `min-width: 0` already). |

From 30rem (480 px at 100 %, 960 px at 200 %) the wide layout is untouched. The gaps are the existing ones: soft 0.875rem (28 px at 200 %), default 0.5rem (16 px).

### Page header and footer at 320 px / 200 %

The page header has three changes: title `overflow-wrap: anywhere`, and actions `max-width: 100%` plus the hook. The footer has one: `.footer__bottom { --lc-btn-overflow-wrap: anywhere }`. The footer is emulated-encapsulated; an inherited custom property reaches the projected `a[lcButton]` without `::ng-deep`. Measured in the app-shell footer: a `link`/`lg` link at 200 % (36 px, padding 24/48) goes from x 8–312 (overflowing the footer's 48–272 content box) to 48–272, 2 lines.

### From 1024 px

Nothing changes at any width. The rules act only where a single word, or a row of actions, is wider than its line, which at 1024 and 1280 px doesn't happen in any existing story (§9).

## 4. States

| State | Behaviour |
|---|---|
| default, hover, active, disabled, loading | Unchanged. The hook only changes line breaking, and the spinner and icons stay flex items. |
| focus-visible (wrapped link) | The kit's focus ring follows the taller box. At 320 px it spans x 45–275, inside the viewport, and nothing in the footer, page header or card clips it (`overflow` visible). *Change note (review r1): it was given as 2 px solid, 2 px offset, 44–276; the measured ring is 3 px solid, offset 0, 45–275.* |
| empty | An empty badge with `wrap` keeps its min-height and min-width, the same as without. |
| overflow: long German words | These break inside the word only when the word is wider than the whole line ("Datenschutz" in a `lg` link at 320/200 %, "Household" at 48 px on a 232 px line). Hyphenation comes first where `lang` allows it (DE capitalised words, not EN, see the 009 pitfall). |
| many items | Page-header actions and footer links wrap onto more lines. The card's actions stay stretched, one row each. |

## 5. Theming

No new token and no colour change. Line height uses `--line-height-tight` (1.25). Badge text contrast, computed with WCAG on the composited fill, is unchanged and is asserted by `badge-contrast.spec.ts`:

| Variant | Light (on #fff) | Dark (on rgb 10/18/27) |
|---|---|---|
| default / primary / info | 6.87 / 8.49 / 9.08 | 11.06 / 8.45 / 9.89 |
| success / warning / error | 4.85 / 5.52 / 10.98 | 6.96 / 6.18 / 9.01 |

`forced-colors`: the 1 px solid border stays in wrap mode and is forced to a system colour, so no extra rule is needed.

## 6. Accessibility

DOM order, roles, `aria-*` and accessible names are unchanged (AC-10), and `role="region"` on the card is untouched. The badge stays non-interactive, a plain `<span>`. Touch targets keep their size: a wrapped link only grows taller. `prefers-reduced-motion` is unaffected, since nothing new animates. Nothing new is announced. Reflow (WCAG 1.4.10): no horizontal scroll at 320 px / 200 % in any new story. Text resize (1.4.4): every text keeps its rem size.

## 7. Texts

No built-in strings. The story texts are below, each language in its own block with `lang`.

| Use | EN | DE |
|---|---|---|
| greeting (display, h1) | Hello, Johanna-Friederike | Hallo, Johanna-Friederike |
| page title + action (title, h2) | Household / Invite | Haushalt / Einladen |
| auth title (auth, h2, `noPaddingX`) | Sign in to LifeCorner | Bei LifeCorner anmelden |
| footer links (`link`, `lg`) + copyright | Privacy policy · LifeCorner · © 2026 LifeCorner | Datenschutz · LifeCorner · © 2026 LifeCorner |
| soft card (h2, neutral, icon `check`) | Nothing to do / Everything is done for today. | Nichts zu tun / Für heute ist alles erledigt. |
| default card (warning, `clock`) | Waiting for approval / The draft is ready for review. / Approve · Request changes | Wartet auf Freigabe / Der Entwurf ist fertig und kann geprüft werden. / Freigeben · Änderungen anfordern |
| badge (info, md, rounded, wrap) | Closed beta, invitation only | Geschlossene Beta, nur mit Einladung |
| badge with dot (warning, wrap, not rounded) | Waiting for the household to approve | Wartet auf die Freigabe durch den Haushalt |
| hook demo (secondary `lg` link) | Privacy statement | Datenschutzerklärung |

## 8. Stories

The 200 % stories copy the `header.stories.ts` pattern: the `textSize` arg (`'200%' | '100%'`, default `'200%'`, the same argType text), the `html:has([data-lc-story-text="200%"])` style and `layout: 'fullscreen'`. The wrapper is `background: var(--color-background)` with padding in **px**, so it doesn't double: 16px 24px (badge 16px 16px, footer 0), with a DE block and an EN block 32 px apart.

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Badge `Wrap`, "Wrap (long label)" | `data-display-badge--wrap` | variant info, size md, rounded, wrap (controls) | At 100 %: one badge driven by the args in a 12rem box, then the SI-15 label at xs, sm, md and lg (`wrap`, `rounded`) in 12rem boxes. Shows centred lines and the radius per size. |
| Badge `WrapLargeText` | `data-display-badge--wrap-large-text` | textSize 200% | A centred column like life-os `.lc-auth-title`: the SI-15 badge; "Beta" with and without `wrap` side by side (they look the same); the dot badge on 2+ lines. DE and EN. |
| Page header `LargeText` | `layout-page-header--large-text` | textSize 200% | The three headers from §7: no actions, with one `lc-button` action (secondary, sm), and auth. DE and EN. |
| Footer `LinksLargeText` | `layout-footer--links-large-text` | textSize 200% | The life-os shell footer (`compact`, `showBorder=false`) with two `a[lcButton]` `link`/`lg` links and the copyright. DE and EN footers stacked. |
| Button-link `OverlongWord` | `components-button-link--overlong-word` | textSize 200% | The DE and EN hook-demo links, each alone in a block with `--lc-btn-overflow-wrap: anywhere`: "Datenschutzerklärung" breaks inside the word and stays on screen. The description explains why the default stays `break-word` (the 116.7 → 93.8 px measurement from §1). A tight row at 200 % isn't shown, because no pair of words fits 272 px there. |
| Next-step-card `LargeText` | `feedback-next-step-card--large-text` | textSize 200% | The soft card (as on Today: `variant="soft"`, `titleTag="h2"`, `actionSize="lg"`, no actions) and the default card with two actions. DE and EN. |

These six new stories make 12 review shots (360 and 1280, light). No existing story changes.

## 9. Verification

Measurements on the new stories run at 320 and 360 px, light, unless stated otherwise. "Overflow" means `scrollWidth - clientWidth` of the element and of `document.documentElement`.

| AC | How | Expected value |
|---|---|---|
| AC-1 | `large-text`: overflow of every `.lc-page-header` and of the document. Computed `overflow-wrap` of the title. | Overflow 0 and 0 (prototype: 0 for "Hallo, Johanna-Friederike" display, "Household" with 1 or 2 actions, and the auth title, at both widths). `anywhere`. |
| AC-2 | Unit test: title `overflow-wrap: anywhere`, `hyphens` reads the hook. Hash-compare the 16 page-header stories against the baseline. | 96/96 identical. |
| AC-3 | `links-large-text`: overflow 0. Every link box inside the footer content box (DE `lg` link 48–272 at 320). `overlong-word`: the links inside the viewport. "Min-content unchanged": computed `overflow-wrap` of a `.btn` outside the three rows is `break-word` (e.g. `components-button--primary`). Button and button-link stories (192) and footer stories (48) against the baseline. | Overflow 0. `break-word`. 240/240 identical. |
| AC-4 | `large-text` (card): the 009 `brokenWords` measure on `.lc-next-step-card__title`, icon and title rects relative to the card, and overflow. | No broken words; overflow 0. Soft "Nichts zu tun" / "Nothing to do": title below the icon. At 360: icon (48, 48) 96, title (48, 172) width 216. At 320: title width 176, 2 lines. Default "Wartet auf Freigabe": beside the icon at 360 (title x 140, width 139), below it at 320 (x 36, y 121, width 203). |
| AC-5 | Hash-compare the 13 next-step-card stories (light and dark) against the baseline. | 78/78 identical. |
| AC-6 | Unit test: with `wrap` unset, the class list equals today's (no `lc-badge--wrap`). Compare the 10 badge stories. | 60/60 identical. |
| AC-7 | Unit test: `[wrap]=true` adds `lc-badge--wrap`. `wrap-large-text`: the SI-15 badge's rect, line count, computed `line-height`, `min-height`, radius and overflow. The "Beta" pair's width, height and text top. `wrap` at 100 %: md two-line height. | At 320: width ≤ 288, 2–3 lines, LH 35 px (≥ 1.25), radius 28 px, overflow 0. The pair has equal width and height, and text tops differ by ≤ 0.5 px. md two-line height at 100 %: 45.5. |
| AC-8 | `theme-contrast.spec.ts` and `badge-contrast.spec.ts` green and unchanged. In wrap mode the computed border is `1px solid`. | §5 values. |
| AC-9 | Story list, plus the `wrap` argType with description and `table.defaultValue`. | All 6 IDs from §8 are listed. |
| AC-10 | Existing specs unchanged. `links-large-text` at 320: focus the first link, read the ring (outline width + offset) against the viewport, and take a shot. | Ring x ≥ 0 and right edge ≤ 320 (prototype 44–276). |
| AC-11 | Add `<lc-badge variant="info" [rounded]="true" [wrap]="true">Geschlossene Beta, nur mit Einladung</lc-badge>` to `tools/compat/template/src/app/home.html`. Add an `EXPECT_IN_HTML` entry: a `<span>` whose class contains `lc-badge--wrap` and that holds the label (allow `<!--…-->` comments before it). | The compat check finds it on Angular 21 and 22. |
| AC-12 | Spec diff adds cases only. CHANGELOG with the values above. **Migration for life-os:** in `auth-layout.component.ts`, remove the SI-15 rule (lines 114–121, use `[wrap]="true"`) and the `overflow-wrap` of the AS-30 H1 rule (125–128); `text-align: center` is SI-12. In `shell.component.css` (51–55), remove `max-width` and `overflow-wrap`; the padding rule stays theirs. | — |

**Risks** (from the pitfall list):

1. Specificity of `height: auto` against the size rules (§3).
2. The next-step-card title must stay `break-word`. The body is `display: contents`, so its children are the card's flex items.
3. In life-os CI (DejaVu Sans Bold), "Nothing" at 40 px with −1 px tracking is 172.4 px against a 176 px line at 320 px, which fits by 3.6 px. A longer Today title word can still break at 320/200 %, because the soft padding (48 px) is outside AC-4/AC-5.
4. Injected `.btn` markup in a story without a button is unstyled. The footer story must use real `a[lcButton]`.
