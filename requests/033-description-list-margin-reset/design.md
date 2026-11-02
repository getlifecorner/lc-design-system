# Design 033: lc-description-list resets the browser's dd margin

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-10
- **Measured on:** `main` 15a2692 (3.22.2), Storybook system font stack, Chromium headless

## 1. Approach

Extend (bug fix), style only. `.lc-dl` already resets the `<dl>` margin; the same reset goes on its `<dt>` and `<dd>`:

- `margin: 0` as the **first declaration** of the existing `&__term` and `&__value` blocks in `description-list.component.scss`, with a one-line comment (`// No browser dd margin (40 px inline start): the row gap is the only space (BA-8).`). No new rule, no new selector.
- All four sides (`margin`, not `margin-inline-start`), as AC-1 asks, so a consumer's global `dt`/`dd` rules can't add space either.
- Scoped specificity (0,2,0) beats the user-agent `dd` rule (0,0,1). The requester's `::ng-deep dd.lc-dl__value { margin: 0 }` sets the same value and stays harmless.
- `.lc-dl__value-suffix` keeps its `margin-left: 0.375rem` (a `<span>`; not touched).
- No change in `.ts`, `.html`, inputs, outputs or markup.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| — | none | — | — | No input, output, slot, CSS hook or type changes. |

Default rendering: changes on purpose, only where the 40 px showed (this is the fix; spec semver = patch). Prototype (inline `margin: 0` on main, 42 baseline shots, `--compare`): **20 different / 22 identical**.

| Story (360/1024/1280 × L/D) | Result | Why |
|---|---|---|
| `…--with-leaders` (6) | different | the dotted leader now runs to 8 px from the value (was 48) |
| `…--stacked` (6) | different | value flush left with the term (was +40 px), width 280 (was 240) |
| `…--long-values-and-times` (6) | different | e-mail and device values 40 px wider, same 2 lines |
| `…--with-value-suffix` 360 L/D (2) | different | "example.host/group/resource" 2 → 1 line |
| `…--rows`, `…--divider-separator` (12), `…--with-value-suffix` 1024/1280 (4) | identical | the invisible leader absorbed the 40 px |
| `components-card--footer-slot` (6) | identical | its list doesn't render: `card.stories.ts` doesn't import `DescriptionListComponent` (measure: 0 rows, box 294×0). Pre-existing story bug, not evidence for this fix; follow-up |

Change note (review r1, 2026-11-02): the card footer-slot row was split out; earlier this table claimed it stayed identical because the leader absorbed the 40 px. The description-list evidence is 16 identical / 20 different of 36 shots.

## 3. Anatomy and layout

Row (unchanged except the dd margin): term (`flex-shrink: 0`, 14 px / 500, `--font-size-sm`) · gap 8 (`--spacing-2`) · leader (`flex: 1 1 auto`, min 16 = `--spacing-4`) · gap 8 · value (`flex: 0 1 auto`, `min-width: 0`, right-aligned, `overflow-wrap: anywhere`). **Minimum space term → value: 32 px (was 72 = 8 + 16 + 8 + 40).** Row 38 px (md: 21 px line + 2 × 8 + 1 px line), last row 37.

### 360 px — new story (requester geometry: `lc-app-page` content 312, outlined `lc-card padding="lg"` → list 262)

```
before (main): list 262 × 290, rows 1/4/5 on 2 lines
┌ card 312, border 1, padding 24 ──────────────────────┐
│ Umbenennen   ·8·16·8· ·40· Alle                      │
│                            Erwachsenen               │
│ Entfernen    ·8·25·8· ·40· Alle Erwachsenen          │
│ Sichtbarkeit ·8·82·8· ·40· Nur du                    │
│ Claude-App   ·8·16·8· ·40· nicht                     │
│                            eingerichtet              │
│ Claude Code  ·8·16·8· ·40· seit                      │
│                            02.11.2026                │
│ Konten       ·8·78·8· ·40· nicht erlaubt             │
└──────────────────────────────────────────────────────┘
after: list 262 × 227, 6 rows on 1 line, value.left − leader.right = 8
┌ card 312, border 1, padding 24 ──────────────────────┐
│ Umbenennen   ·8·41·8·  Alle Erwachsenen  (right edge)│
│ Entfernen    ·8·65·8·  Alle Erwachsenen              │
│ Sichtbarkeit ·8·122·8· Nur du                        │
│ Claude-App   ·8·54·8·  nicht eingerichtet            │
│ Claude Code  ·8·54·8·  seit 02.11.2026               │
│ Konten       ·8·118·8· nicht erlaubt                 │
└──────────────────────────────────────────────────────┘
```

(`·8·n·8·` = gap, measured leader width, gap in px; `·40·` = the old dd margin; values are right-aligned.) The values that wrapped measured 101.9 / 110.9 / 105.3 px wide × 42 tall; after, 116.7 / 113.1 / 107.1 × 21.

### From 1024 px (and 1280)

The story column stays 312 px (a phone-width card), so 1024 and 1280 measure exactly as 360. Existing stories keep their own `max-width` (Rows/Leaders 420, Stacked 280, suffix 460, long values 312): only the rows that were tight change (table in §2).

Stacked (all widths): term above value, column gap 4 (`--spacing-1`), padding-block 8; value x = term x (was +40).

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| dt / dd margin | 0 on all sides | — | — |
| row gap | 8 px | — | `--spacing-2` |
| leader min | 16 px | — | `--spacing-4` |
| stacked gap | 4 px | — | `--spacing-1` |
| term / value | — | 14 px / 500 (md), 12 px (sm) | `--font-size-sm` / `--font-size-xs` |

## 4. States

| State | Result |
|---|---|
| default | §3 |
| hover / focus-visible (clickable) | unchanged: background and 3 px ring sit on the row, whose box doesn't change |
| active, disabled, loading, error | n/a (component has none) |
| empty (`items: []`) | empty `<dl>`, unchanged |
| overflow: long unbroken value | still wraps via `anywhere`, 40 px more room: e-mail at 360 2 lines, width 198.1 → 238.1, row overflow 0 |
| overflow: long German term | term keeps `flex-shrink: 0`; value shrinks and wraps (unchanged rule) |
| many items | unchanged |

## 5. Theming

No colour or token changes. Computed on the Rows story at 360 (WCAG formula in `--measure`; light page = surface #fff, dark page 10/18/27, surface 16/28/38):

| Element | Light | Dark (page / card surface) | Token |
|---|---|---|---|
| term | 7.56 | 12.17 / 11.16 | `--color-text-secondary` |
| value, strong | 17.74 | 17.29 / 15.85 | `--color-text-primary` |
| muted value ("nicht eingerichtet") | 5.84 | 7.31 / 6.71 | `--color-text-tertiary` |
| link / primary value | **4.37** | 9.95 / 9.13 | `--color-primary-500` |

Out of scope, pre-existing, for a follow-up request (not this fix): the light link/primary value at 14 px is 4.37:1 (< 4.5); the clickable-row ring is a `box-shadow`, which forced colours drop; clickable rows are 38 px tall (< 44).

## 6. Accessibility

Semantics unchanged: `dl > div.lc-dl__row > dt + span[aria-hidden] + dd`; clickable rows keep `role="button"`, `tabindex="0"`, Enter/Space. Focus order and reading order unchanged. Margins don't affect forced colours, reduced motion (no motion) or announcements. Targets: see the out-of-scope note in §5.

## 7. Texts

No built-in strings. Story strings are the requester's German (life-os `messages.de.json`):

| Term | Value | Source key |
|---|---|---|
| Umbenennen / Entfernen | Alle Erwachsenen | `connection.rename/remove`, `connection.who.all` |
| Sichtbarkeit | Nur du | `settings.visibility`, `connection.who.you` |
| Claude-App | nicht eingerichtet (`muted`) | `assistant.clients.app/notSetUp` |
| Claude Code | seit 02.11.2026 | `assistant.clients.code/since` |
| Konten | nicht erlaubt (`muted`) | `assistant.newData.row/notAllowed` |

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| `ShortValuesAtPhoneWidth`, name "Short values at a phone width (BA-8)" (new) | `components-description-list--short-values-at-phone-width` | `items` = the 6 rows of §7, `layout: 'rows'`, `leaders: false`, `size: 'md'` | the BA-8 case at the requester's 262 px list; one line per value |
| existing 6 + `components-card--footer-slot` | unchanged code | — | expected diffs in §2 |

New story render: `<div style="max-width: 312px;"><lc-card variant="outlined" borderRadius="xl" padding="lg"><lc-description-list [items]="items" [layout]="layout" [leaders]="leaders" [size]="size" /></lc-card></div>`, with `decorators: [moduleMetadata({ imports: [CardComponent] })]` (relative import `../card/card.component`, as card.stories imports icon). Bind `layout` and `leaders` so the review can toggle them through `updateStoryArgs`. Docs description: "BA-8 (life-os connection and assistant pages): short German values in an outlined `lc-card padding="lg"` at the 312 px content width of `lc-app-page` at 360 px (262 px list). Term and value have no browser margin, so the row gap is the only space and each value stays on one line." Add a key-features bullet to the meta description: "- Term and value carry no browser margin; the row gap is the only space (BA-8)".

## 9. Verification

Review measure: `tmp/story-shots/033/review-measure.js` (pass its text as `--measure`). Each row prints `m0|MARGIN lines value−leader value−term overflow`; it toggles leaders and stacked and restores the args before the shot. Baseline: `tmp/story-shots/033/baseline` (the 7 stories of §2, 360/1024/1280 × L/D, `--full`, 42 shots; stability re-run 42/42 identical).

| AC | How | Expected value |
|---|---|---|
| AC-1 | Jest: new `it('resets the browser margin of term and value (BA-8)')` in the 3.3 `describe`, compiling the SCSS like the existing stylesheet test; `.lc-dl__term {` and `.lc-dl__value {` blocks match `/margin:\s*0/`. Story: review measure | every row `m0` in rows, leaders and stacked, 360/1024/1280 × L/D |
| AC-2 | New story, 360 | rows `m0 1 8 <dx> 0` × 6, box `262x227` (before: 290 tall, rows 1/4/5 two lines). The spec's 328 px container: the BA-8 rows fit there even before (Umbenennen row needs 276.8 px with the margin, 236.8 without), so the story uses the requester's real 262 px; "value − leader = 8, not 48" is the discriminating value at any width |
| AC-3 | `…--long-values-and-times` 360 | e-mail 2 lines, value width 238.1, row overflow 0; 3.3 stylesheet test green |
| AC-4 | New story 1024/1280; `…--stacked` 360/1024/1280 | same strings as 360; stacked value − term = 0 (was 40), value width 280 |
| AC-5 | Review measure L vs D | identical measure output; L and D differ from baseline in the same shots |
| AC-6 | New story 360 (all German) | 6/6 one line; a value wraps only when term + 32 + value width > row width |
| AC-7 | Full Jest suite (only the added test new); compat check; `--compare` vs baseline | no assertion edited; markup unchanged; exactly 20 different / 22 identical as in §2 |
| AC-8 | Existing spec "makes rows keyboard-operable when clickable" | unchanged and green |
| AC-9 | Story exists | §8 ID renders |
| AC-10 | CHANGELOG `Fixed` | names BA-8, the connection page (managing row) and the assistant-access page; before/after: at 360 px in the 262 px card list "Alle Erwachsenen", "nicht eingerichtet", "seit 02.11.2026" 2 → 1 line, list 290 → 227 px; min space term → value 72 → 32 px; leaders run to 8 px from the value (was 48); stacked value flush left (was +40); no API change; the `::ng-deep` workaround can be removed |

## Assumptions

- The requester's 262 px comes from `lc-app-page` content 312 at 360 (memory, 3.5) minus the outlined card's 2 × 1 border and 2 × 24 padding (measured 262 on `components-card--weite-content-card`). The assistant card (`padding="md"`, 278 px) already fits "nicht eingerichtet" in the Storybook font (needs 264.2 px with the margin); the requester's wrap there likely comes from its font or container. The fix covers both.
