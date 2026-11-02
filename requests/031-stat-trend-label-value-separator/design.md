# Design 031: lc-stat-trend label and value without a separator

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-11

## 1. Approach

Extend `stat-trend.component.html` only: three **static whitespace text nodes** (one U+0020 each, written `&ngsp;`) between the blocks of the tile. `&ngsp;` is the kit's pattern for exactly this (`header.component.html:126`, `stepper.component.html:39/44`, `file-upload.component.html:31/34`, accordion request 015): Angular keeps it although whitespace removal is on and emits one plain space. No SCSS, no TS, no input.

**Decision: text node, not a visually hidden space.** Probed on 3.22.0 in the browser (`story-shots --axe=wcag21a`, axe-core 4.14.0, card made `role="button"` with `aria-label`, 360 px light; shots in `tmp/story-shots/031/probe-*`):

| Probe | Markup | `label-content-name-mismatch` | Layout |
|---|---|---|---|
| A1 | today: `…2026</span></div><div row>…` | **violation** (`textContent` "Gesamtkosten Plan 2026571.000,00 €") | — |
| B1 | `" "` text node between header and row | **pass** | root height 50.80 → 50.80 px; `innerText` identical |
| C1 | `<span>` with the kit's sr-only CSS holding `" "` | **violation**: axe drops clipped text from the visible text | unchanged |
| B2 | B1 + `" "` before the pill (5 stories) | pass without sparkline; violation with sparkline | Δ height 0 in all 5 |
| B3 | B2, name also holds the sparkline's `aria-label` | pass (card-wrapped, with-icon); costs fails when the sentiment words sit between change and sparkline name | — |
| B5/B6 | costs: name order label, value, change, sparkline name, sentiment words | pass, with and without a separator before the sparkline | — |

Findings for axe 4.14 in the browser: (1) visually hidden text is not "visible text", so an sr-only space cannot separate anything; (2) the sparkline's `role="img"` name counts as content of the card; (3) axe already pads the `svg`, but `textContent` still glues "…ungünstigSparkline: …" (sentiment case), so a third separator is added for the `textContent`-based tools the spec names.

Rejected: `&nbsp;`/`&#160;` (not CSS white space: it would form an anonymous flex item and add a visible line and a 4 px gap), `{{ ' ' }}` (works, but a binding where static text suffices, and it yields three spaces after whitespace collapsing), `preserveWhitespaces`/`ngPreserveWhitespaces` (would change the pinned pill text node `" +3.1% "`), CSS `::before` (excluded by the spec).

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| — | none | — | — | No input, output, slot, class, CSS hook or type changes. |

Default rendering unchanged: each separator is a white-space-only text run whose parent is a flex container (`.lc-stat-trend` is `inline-flex`, `.lc-stat-trend__row` is `flex`). CSS Flexbox §4: such runs are not rendered, so they get no box, no paint and no accessibility node (B1, B2: Δ height 0). The pill's internal text nodes are not touched.

## 3. Anatomy and layout

DOM contract (S1 to S3 are the new nodes, each exactly `" "`):

```
div.lc-stat-trend                       inline-flex, column, gap 0.25rem (4 px)
├─ div.lc-stat-trend__header            flex, space-between, gap 0.5rem
│   ├─ span.lc-stat-trend__label        "Gesamtkosten Plan 2026"
│   └─ lc-icon (optional, decorative)
├─ #text " "                            S1  always, between header and row
├─ div.lc-stat-trend__row               flex, baseline, gap 0.5rem
│   ├─ span.lc-stat-trend__value        "571.000,00 €"
│   ├─ #text " "                        S2  inside @if (change()), before the pill
│   └─ span.lc-stat-trend__change       unchanged: [↑]" +3,1 %"[sr-only ", gestiegen, ungünstig"]
├─ #text " "                            S3  inside @if (hasSparkline()), before lc-sparkline
└─ lc-sparkline
```

Template shape (the developer keeps the existing comment and adds one that names request 031):

```html
  </div>
  &ngsp;
  <div class="lc-stat-trend__row">
    <span class="lc-stat-trend__value">{{ value() }}</span>
    @if (change()) {
      &ngsp;<span class="lc-stat-trend__change" …>   <!-- pill body unchanged -->
    }
  </div>
  @if (hasSparkline()) {
    &ngsp;<lc-sparkline …></lc-sparkline>
  }
```

Normalised host text (`textContent.replace(/\s+/g, ' ').trim()`): "Gesamtkosten Plan 2026 571.000,00 € ↑ +3,1 %, gestiegen, ungünstig Sparkline: 3 points, …".

### 360 px — new story "Inside a clickable card" (canvas padding 16 px)

```
|16|┌───────────── lc-card 328 (border 1, padding 16) ─────────────┐|16|
    │ TOTAL COST PLAN 2026                               [wallet16]│  label 12/18 px, 500, uppercase
    │ 4 px                                                          │
    │ €571,000.00                                                   │  value 24 px, 700, row 31.38 px
    └───────────────────────────────────────────────────────────────┘
    gap 16
    ┌ lang=de ─ GESAMTKOSTEN PLAN 2026 [wallet] / 571.000,00 € ─────┐
    gap 16
    ┌ lang=de ──────────────────────────────────────────────────────┐
    │ GESAMTKOSTEN PLAN 2026 EINSCHLIESSLICH             [wallet16]│  2 lines, 36 px, no overflow
    │ RÜCKSTELLUNGEN                                                │
    │ 1.234.567,89 €  (↑ +3,1 %)                                    │  pill: 14 px, 600, error pair
    └───────────────────────────────────────────────────────────────┘
```

### From 1024 px (and 1280 px)

```
|16| [card 320] 16 [card 320] 16 [card 320] |16|     1024: grid auto-fit minmax(200px, 1fr), 3 tracks
|16| [card 405.33] 16 [card 405.33] 16 [card 405.33] |16|   1280
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Card | padding 16, border 1, radius md | — | `--lc-density-padding-md` / `--spacing-4` (lc-card) |
| Label | — | 0.75rem / 18 px line, 500, +0.05em | `--typography-font-size-xs`, `--color-text-tertiary` |
| Header → row | 4 px | — | `.lc-stat-trend` gap (unchanged) |
| Value | row 31.38 px | 1.5rem, 700, lh 1.2 | `--typography-font-size-2xl`, `--color-text-primary` |
| Separators S1–S3 | 0 × 0 (no box) | — | — |
| Grid | gap 16 px | — | story layout, as `CardDashboard` |

Measured 3.22.0 reference (`tmp/story-shots/031/baseline-long`, costs story with label "Gesamtkosten Plan 2026 einschließlich Rückstellungen" and value "1.234.567,89 €"): 360 → label 294 × 36 (2 lines), header 36, row 31.38, root 294 × 103.38, card 328 × 142.38; 1024/1280 → label 426.34 × 18, root 85.38, card 460.34 × 124.38; card and page overflow 0 at all widths.

## 4. States

| State | Behaviour |
|---|---|
| default | S1 always; normalised text "label value". |
| no label | S1 still rendered; normalised text is the value alone (trim). |
| change / sentiment | S2 before the pill; the pill keeps `"↑ +3.1% "` and `"↑ +3,1 %, gestiegen, ungünstig"` (pinned). |
| sparkline | S3 before `lc-sparkline`; raw `textContent` may show two spaces after a pill without sentiment (pill text ends in a space). Collapsed by every normaliser; not rendered. |
| hover / focus-visible / active | Belong to `lc-card` (clickable); unchanged. |
| disabled / loading / empty / error | The component has none; unchanged. |
| overflow | Long German label wraps at word boundaries as before (reference values §3); no horizontal scroll. |

## 5. Theming

| Element | Light | Dark | Contrast (computed) |
|---|---|---|---|
| Separators S1–S3 | not painted | not painted | n/a: no box, no colour |
| Everything else | unchanged | unchanged | unchanged; pills asserted in `theme-contrast.spec.ts` (019, 027) |

No new token. The new story uses only existing component colours; its `color-contrast` is checked by the review's `--axe` run in light and dark.

## 6. Accessibility

- **Semantics:** no element, `role`, `tabindex` or ARIA attribute added (text nodes only). Browsers create no accessibility node for a white-space run without a layout box, so a standalone tile reads as today ("Gesamtkosten Plan 2026", "571.000,00 €"); proxy: `innerText` identical with and without S1 (B1: "GESAMTKOSTEN PLAN 2026\n571.000,00 €").
- **Inside `lc-card [clickable]="true"`:** `role="button"`, children presentational, name = `ariaLabel`. Rule for consumers (story description and changelog): the `ariaLabel` must contain the tile's visible text in order (label, value, change, then the sparkline's name if there is one); words such as "Herkunft anzeigen" or the sentiment words go before or after that run, not inside it.
- **Sparkline caveat:** axe counts the sparkline's English, auto-generated name ("Sparkline: 10 points, min 20, max 42, last 42") as content, and `lc-stat-trend` has no input for it. Tiles with a sparkline in a clickable card must repeat it in the name (B3). Not fixable by whitespace; possible follow-up request (sparkline label input, or a decorative sparkline inside `lc-stat-trend`). The requester's tiles have no sparkline.
- **Story pitfall:** `clickable` has no `booleanAttribute` transform; a bare `clickable` attribute passes `''` (falsy). The story binds `[clickable]="true"`.
- **Keyboard, targets:** unchanged (the card is the target, ≥ 44 px high).
- **forced-colors, reduced motion:** nothing painted or animated; verified by hash against `tmp/story-shots/031/baseline-fc` (card-wrapped, costs, 360, `--forced-colors`).

## 7. Texts

No built-in string is added. Story strings:

| Use | EN | DE |
|---|---|---|
| Label | Total cost plan 2026 | Gesamtkosten Plan 2026 |
| Value | €571,000.00 | 571.000,00 € |
| Card name | Total cost plan 2026: €571,000.00. Show source | Gesamtkosten Plan 2026: 571.000,00 €. Herkunft anzeigen |
| Long label (DE tile 3) | — | Gesamtkosten Plan 2026 einschließlich Rückstellungen |
| Tile 3 value, change | — | 1.234.567,89 €, +3,1 % (`sentiment="negative"`, `DE_LABELS`) |
| Tile 3 name | — | Gesamtkosten Plan 2026 einschließlich Rückstellungen: 1.234.567,89 €, +3,1 %, gestiegen, ungünstig. Herkunft anzeigen |

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Inside a clickable card (new, export `InsideAClickableCard`, `name: 'Inside a clickable card'`) | `charts-stat-trend--inside-a-clickable-card` | render only; grid as `CardDashboard`; three `lc-card variant="outlined" padding="md" borderRadius="md" [clickable]="true" [ariaLabel]` tiles from §7 (tile 1 EN, tiles 2–3 `lang="de"`), all with `icon="wallet"`, tile 3 with change and sentiment; `props: { de: DE_LABELS }` | AC-3, AC-7, AC-10: the tile passes `label-content-name-mismatch`; long German label wraps. Story JSDoc and `docs.description.story` state the naming rule and the sparkline caveat (§6). |
| 11 existing stories | `charts-stat-trend--{up-trend, down-trend, neutral, no-sparkline, value-only, dashboard-row, with-icon, card-wrapped, card-dashboard, costs, sentiment}` | unchanged | AC-4: hash-identical to `tmp/story-shots/031/baseline` (66 shots, 360/1024/1280 × light/dark, from main at 3.22.0). |

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| AC-1 | Unit (`stat-trend.component.spec.ts`, new `describe('separators (031)')`) | normalised host text "Gesamtkosten Plan 2026 571.000,00 €"; `header.nextSibling` is a Text node with `data === ' '` and equals `row.previousSibling` |
| AC-2 | Unit | change "+3,1 %": "… 571.000,00 € ↑ +3,1 %"; + `sentiment="negative"`, DE labels, no sparkline: ends "571.000,00 € ↑ +3,1 %, gestiegen, ungünstig"; value's `nextSibling.data === ' '`; with sparkline: `lc-sparkline` `previousSibling.data === ' '` and text "… ungünstig Sparkline: …" |
| AC-3 | New `stat-trend.axe.spec.ts` with `testing/axe-jsdom` (as `accordion.axe.spec.ts`): host `lc-card [clickable]="true" [ariaLabel]` around the tile; rows: plain, + icon, + change, + sentiment (DE), + sparkline (name built from the svg's `aria-label`, B3 order); negative control: remove S1 and S2 → `violation`. Browser: review runs `--axe` on the new story | every row `outcomeFor(…, LABEL_IN_NAME, card) === 'pass'`, no violations; control `'violation'`; story: 0 violations at 360 and 1280, light and dark |
| AC-4 | `story-shots --stories=<11 ids> --widths=360,1024,1280 --themes=light,dark --compare=tmp/story-shots/031/baseline` | 66 identical, 0 different |
| AC-5 | Unit: `.lc-stat-trend` element children are exactly header, row (+ `lc-sparkline`); no `[role]`/`[tabindex]` inside except the sparkline's `svg[role=img]`; S1–S3 are `nodeType === 3`. Review: `innerText` of the new story's tile 2 | `innerText` "GESAMTKOSTEN PLAN 2026\n571.000,00 €" (as B1) |
| AC-6 | `tools/compat/check-angular-majors.mjs`: new `EXPECT_IN_HTML` regex on the existing `#compat-costs` tile (`probe-314.ts`) | `Kosten \(Monat\)<\/span>(?:<!--[^]*?-->)*<\/div> <div[^>]*class="lc-stat-trend__row"[^>]*><span[^>]*>48,2 Mio\. €<\/span>(?:<!--[^]*?-->)* <span[^>]*class="lc-stat-trend__change` (attribute order as rendered; the developer adjusts only the `[^>]*` parts) |
| AC-7 | Review: re-run the `baseline-long` measure (§3) on costs; `--measure` on the new story at 360: tile 3 label height, card and page overflow | costs values equal to §3; new story: tile 3 label 36 px (2 lines), `scrollWidth - clientWidth` 0 for every card and the page |
| AC-8 | Existing specs unchanged | all pass, no edited assertion |
| AC-9 | `story-shots --stories=charts-stat-trend--card-wrapped,charts-stat-trend--costs --widths=360 --themes=light --forced-colors --compare=tmp/story-shots/031/baseline-fc` | 2 identical |
| AC-10 | Story exists with the ID in §8 | three tiles, EN and DE, icon, 360 px shot |
| AC-11 | Changelog draft (Fixed): finance-intelligence cockpit, gap file `cockpit-2026-11-01` row 2; axe-core `label-content-name-mismatch`, WCAG 2.5.3; no visual change, no API break; the naming rule and the sparkline caveat from §6 | review of `build.md` draft |
