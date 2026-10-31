# Design 021: Sources page kit gaps

- **Status:** ready
- **Spec:** [spec.md](spec.md), AC-1 … AC-16 · base `main` 0ce6422 (3.16.0) → **3.17.0**
- **Measured:** prototypes in the browser (`tmp/story-shots/021/proto-*`, contrast measure `tmp/story-shots/021/contrast-measure.js`)
- **Change (review r1, 2026-10-31):** §4 and §8. *Number Columns* colours its negative changes with `cellStyle`, not `cellClass`. A `cellClass` colour never applies (F1, on main), and the build needed `::ng-deep … !important` for it (D1). The design was wrong here, not the build

## 1. Approach

| Part | Extend / pattern | Why |
|---|---|---|
| Table | `TableColumn.align` like `actionsAlign`: one BEM modifier `lc-table__cell--end` on the `th` and every `td` | Classes render on the server (AC-16). The selectors are written at the weight of the base `th` rule, (0,6,3) under emulation, because `.lc-table thead tr th { text-align: left }` is (0,5,3). The same weight also fixes **022 N1** (`actionsAlign="end"/"center"` headers stayed left; it was handed to 021) |
| Button | The busy option in `lc-choice-prompt` (`aria-disabled`, the click is guarded, focus stays) | Same kit pattern. The loading look stays at opacity 0.5 through a class next to `:disabled` |
| Progress bar | Component-level `prefers-reduced-motion` and `forced-colors` blocks, like the `forced-colors` blocks of `lc-table`, `lc-list` and `lc-button`. The reduced-motion rule comes **after** the base `--indeterminate` rule, with the same selector, because both use `width … !important` | The global `*` rule (`_utilities.scss:124`) ends the animation after 0.01 ms, so today's static look is a 40 % segment from the left (linear) or a 25 % arc (circle). Both read as a value |
| List | Status badges take `lc-badge`'s `--color-*-subtle` pair where the 100/700 pair fails | Tokens only. Error keeps its light fill and changes only its ink, so its light look stays unchanged |
| Toast | The doc goes into the *Toast Outlet* component description (the MCP reads it), plus a *Service Call* story. Both variant icons become `[decorative]` | AC-13. The announcement has to be documented, and an unnamed `role="img"` inside the live region makes it differ between screen readers |

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| type | `TableColumnAlign` | `'start' \| 'end'` | — | Horizontal alignment of a table column (3.17). |
| field | `TableColumn.align?` | `TableColumnAlign` | `'start'` | Horizontal alignment of the column's header and cells. `end` aligns both at the end edge (right in LTR) and sets `font-variant-numeric: tabular-nums`, for amounts, counts and percentages. A sort arrow then sits before the label, so the label stays flush with the figures. Adds `lc-table__cell--end` to the `th` and every `td`. It wins over a `cellClass` that sets `text-align`; use `cellStyle` to override it. A custom `lcTableCell` template inherits the alignment, but a flex or block child needs its own `justify-content: flex-end`. (3.17) `@default 'start'` |
| input | `ButtonComponent.loading` | `boolean` | `false` | *(new JSDoc, same input)* Shows a spinner in place of the icon slots and makes the button unavailable **without removing it from the focus order**. The inner `<button>` gets `aria-disabled="true"` and `aria-busy="true"` instead of the native `disabled`, so a focused button keeps focus. While it is loading, click, Enter and Space are ignored: `clicked` is not emitted, the click event stops at the button (a `(click)` on the host doesn't fire), and a `type="submit"`/`"reset"` button doesn't submit or reset its form. The look is unchanged: spinner, 50 % opacity, no hover. Screen readers may announce the state change ("unavailable"/"dimmed"), but the button doesn't announce the outcome: the page does that, for example with a polite live region ("USM wird geladen.", then the result). `disabledReason` also applies while loading. If `disabled` is set too, the native `disabled` wins. `@default false` |
| input | `ButtonComponent.disabled` | `boolean` | `false` | *(new JSDoc)* Natively disabled: the button leaves the focus order and ignores clicks. For a temporary busy state that keeps focus, use `loading`. `@default false` |
| method | `ButtonComponent.handleClick` | `(event?: Event) => void` | — | The parameter is optional, so callers without an argument still work. |
| input | `ProgressBarComponent.indeterminate` | `boolean` | `false` | *(JSDoc rewritten)* Progress of unknown length: no value (`aria-valuenow` is absent) and no label. The linear bar moves a 40 % segment across the track, and the circle spins. Under `prefers-reduced-motion: reduce` nothing moves: the linear bar shows a full-width striped fill and the circle a dashed ring, so it still reads as busy, not as a value. `@default false` |
| class doc | `ProgressBarComponent` | — | — | Add: "The bar is a visual aid; the text next to it carries the meaning. Write the status as text ('USM wird geladen …') and announce changes from a live region (`role="status"`). Screen readers don't announce a progress bar's changes by themselves. Give `ariaLabel` the same words as the status. Under `forced-colors: active` the fill is `Highlight`, the linear track gets a 1 px `CanvasText` outline and the circle's track is `GrayText`." |
| class doc | `ToastService` | — | — | Point to the *Feedback/Toast Outlet* docs (options, announcement, timing). |

**Unchanged defaults (AC-14):** without `align` neither the template nor the classes change (no `--start` class). A button without `loading` keeps its bindings (`[disabled]` = `disabled()`, `aria-disabled` = `disabled || loading`, as today). Without `indeterminate` no new rule matches. `lc-list` changes only in the three badge variants of §5. **Assertions that change, with the stated reason (AC-5):** `button.component.spec.ts:133` "should be disabled when loading" becomes "is aria-disabled, not disabled, when loading", and the `Loading` story's `play` changes from `toBeDisabled()` to `aria-disabled`. **Compatibility line:** consumer tests that assert `disabled` on a loading `lc-button` now see `aria-disabled="true"`. `actionsAlign="end"`/`"center"` headers now line up with their buttons, as documented.

## 3. Anatomy and layout

### 360 px

```
 viewport 360 (page scrollWidth 360) ── .lc-table-wrapper--responsive scrolls horizontally ──▶
 | QUELLE      | BUCHUNGEN | ↑ BETRAG |  ABWEICHUNG ZUM VORJAHRESZEITRAUM | AKTIONEN |
 | Bankkonto   |     1.111 | 1.111,11 €|                           −12,5 % |    [⋮]   |
   start         end ──────────────────────────────────────────────── end     end (N1)
 th.sortable.lc-table__cell--end (sorted), md:
 |<-32 reserve->| ↑ |<-8->| ARR |<-16->|      td: |        87.000 € |<-16->|
 prototype (With Cell Formatting And Styling): label right 222.61 = cell text right 222.61
 th box unsorted → sorted 100.47×46 → 100.47×46; indicator 10.2×18, centred on the label line
```

### From 1024 px (1280 measured)

```
 | QUELLE            | BUCHUNGEN |       ↑ BETRAG | ABWEICHUNG ZUM VORJAHRESZEITRAUM | AKTIONEN |
   the table fills the content width; every end column's label is flush with its figures
 prototype: label right 672.75 = cell text right 672.75; th 303.63×46 → 303.63×46 when sorted
```

| Element | Value | Token |
|---|---|---|
| `th`/`td.lc-table__cell--end` | `text-align: end`, `font-variant-numeric: tabular-nums` | — |
| sortable end `th` padding | inline-start 32 (the reserve moves to the start side); inline-end = the cell's: sm 12 / md 16 / lg 20 | `--spacing-8`; `--lc-density-padding-sm, --spacing-3` / `--lc-density-padding-md, --spacing-4` / `--spacing-5` |
| label wrapper (end columns only) | `<span class="lc-table__sort-label">` around the label and the indicator, `position: relative; display: inline-block`, **no whitespace** between the label and `@if` | — |
| `.sort-indicator` in an end column | stays absolute, `inset-inline-end: calc(100% + 8px)` (beside the label, 8 px gap); `top`/`transform` as today | `--spacing-2` |
| edit input in an end cell | `text-align: end; font-variant-numeric: tabular-nums` (`font` resets them on inputs) | — |
| actions alignment (N1) | rewrite as `.lc-table thead tr th.lc-table__actions-cell--{start,center,end}` and `.lc-table tbody tr td…`, (0,6,3) | — |
| digits | "1111" = "8888" = 34.67 px (proportional: 25.38 / 35.17) | — |

At 360 the table scrolls inside `.lc-table-wrapper--responsive` (default `responsive=true`), and the page does not (`scrollWidth` 360). The headers stay `nowrap`, as today.

**Button:** no geometry change at any width (same box, spinner and gap). **Progress bar, static look** (prototype `tmp/story-shots/021/proto-progress`, the same at every width, since the bar is fluid):

```
linear, reduced motion:  ////////////////////////////  full track width; 45° stripes 6 px / 6 px (0.375rem)
                         xs 2 px reads as a dashed line; the stripes stay at sm 4, md 8, lg 12
circular, reduced motion:  12 dashes of 10.472 units (C = 2π·40 = 251.33), butt caps, offset 0, on the track ring
```

## 4. States

| Component | State | Spec |
|---|---|---|
| Table end column | default · hover · focus-visible · sorted | Header colours, the hover fill and the inset 2 px ring are unchanged. Sorting doesn't change the box size (measured) |
| | overflow | A long header ("Abweichung zum Vorjahreszeitraum") widens the column (`nowrap`), and the wrapper scrolls; at 200 % no `th` clips (`scrollWidth ≤ clientWidth`) |
| | empty · paginate · actions · cellClass | Empty row unchanged; pagination footer unchanged; an end column next to `actionsAlign="end"` (both headers flush); `cellClass` adds its class next to `lc-table__cell--end` (unit test). *(r1)* A class colour loses to the kit's `td` colour (F1, on main), so the story colours a cell with `cellStyle` |
| Button loading | rest | Hash-identical to 3.16: opacity 0.5, spinner, `cursor: not-allowed`. Every `:hover:not(:disabled)` and `:active:not(:disabled)` becomes `:not(:disabled, .btn-loading)`; the specificity stays (0,1,0) inside `:not` |
| | focus-visible | Same ring geometry (2 px, offset 2). **Colour `--color-text-primary`**, because the 0.5 opacity also fades the outline: the teal ring would be 1.96:1 (light). `variant="inverse"`: `opacity: 1` while focused, white ring (no colour reaches 3:1 at 50 % on the bands) |
| | click · Enter · Space · submit | `handleClick($event)`: if `loading() && !disabled()`, then `preventDefault()` + `stopImmediatePropagation()` and return |
| | loading + disabled | Native `disabled` wins (focus can drop, as for `disabled`) |
| Progress | indeterminate (motion) | Unchanged |
| | indeterminate + reduced motion | `animation: none; transform: none; width: 100% !important;` stripe `mask-image` (also `-webkit-` if autoprefixer doesn't add it). Circle: `animation: none; stroke-dasharray: 10.472 10.472; stroke-dashoffset: 0; stroke-linecap: butt` (CSS beats the presentation attributes) |
| | forced colours | Fill `background-color`/`stroke: Highlight` with `forced-color-adjust: none` on the fill; linear track `outline: 1px solid CanvasText` (no layout change; the fill keeps its full height at xs); circle track `stroke: GrayText`. Stripes and dashes stay (masks are not forced). Labels become `CanvasText` |
| List badge | all | Geometry unchanged (padding 2/8, 12 px/500, LH 20); only the colours of §5 change |

## 5. Theming

Bases: page canvas, `--color-surface`, `--color-surface-2` (card-variant items) and `--color-surface-hover` over the surface. Translucent fills are composited first. Values are the **minimum** over the bases, from `--measure` with the WCAG formula.

| Element | Light (bg / ink) | Dark (bg / ink) | Contrast L / D | 3.16 |
|---|---|---|---|---|
| list badge success | `--color-success-subtle` #f3f6ee / `--color-on-success-subtle` #5f7150 | rgba(142,164,117,.18) / #a9bb93 | **4.85 / 5.17** | 3.53 / 1.87 |
| list badge warning | `--color-warning-subtle` #fdf4e4 / `--color-on-warning-subtle` #855a22 | rgba(225,160,64,.18) / #e1a040 | **5.52 / 4.61** | 3.23 / 2.07 |
| list badge error | `--color-error-100` #f7a1a1 (kept) / `--color-on-error-subtle` #6b0909 (= today's ink) | rgba(157,14,14,.22) / #f7a1a1 | **6.33 / 7.17** | 6.33 / 1.13 |
| list badge primary, default | unchanged | unchanged | 7.85 / 9.68 · 6.87 / 8.18 | — |
| loading ring | `--color-text-primary` #111827 at 50 % | #f1f6f8 at 50 % | 3.39 (canvas) 3.36 (surface-2) / 4.97 · 4.45 | teal at 50 %: 1.96 / 3.32 |
| stripes vs track | palette fill / `--color-surface-hover` | same | primary 3.97 / 3.54 (success 2.47 L, warning 2.05 L, error 1.84 D) | same as the determinate fill today; decoration (§6) |

Rejected: 100 bg + on-subtle ink (success 3.53 L, warning 4.20 L) and subtle bg + 700 ink (dark 1.14–2.24). No new token.

## 6. Accessibility

- **Table:** `scope`, `aria-sort` and the tab stop are unchanged. In the DOM the label still comes **before** the indicator, so the header name stays "ARR ↑" (it would read "↑ ARR" if the DOM order changed).
- **Button:** `aria-disabled` + `aria-busy`, focus stays on the button (no jump to `body` inside dialogs). Forced colours: `.btn.btn-loading { color: GrayText; border-color: GrayText }` (the native disabled look), and while focused `opacity: 1; outline-color: Highlight`. Reduced motion: the spinner keeps the global rule, unchanged.
- **Progress:** role and `aria-*` are unchanged (AC-11). It is a visual aid next to the status text (class doc).
- **Toast:** `[decorative]="true"` on the variant icon and the close icon (the close button keeps its `aria-label`). The announcement is then the message, followed by the action label and the close button's name.
- **Targets:** sortable md header 46 px, unchanged; buttons unchanged.

## 7. Texts

No new built-in strings. JSDoc as in §2. The stories use German with long words: "Abweichung zum Vorjahreszeitraum", "Daten von USM laden", "USM wird geladen …", `closeAriaLabel` "Benachrichtigung schließen".

**Toast doc (component description of `toast-outlet.stories.ts`; checked against `toast.service.ts`, `toast-outlet.component.*`, `toast.component.*`):**
1. *Setup:* `<lc-toast-outlet />` once in the shell (import `ToastOutletComponent`). Without it `show()` shows nothing.
2. *Call:* `inject(ToastService).show({…})` returns the id; `close(id)`, `closeAll()`; snippet.
3. *Options table:* `message` (required, plain text) · `variant` `'info'` (success, error, warning, info) · `position` `'top-right'` (6 values) · `duration` `3000` ms, `0` = stays until closed · `showCloseButton` `true` · `action` `{ label, onClick }` (`onClick` runs, then the toast closes).
4. *Behaviour:* at most 5 toasts in total (the oldest is removed first); timers run only in the browser; a toast never takes focus.
5. *Announcement:* per position, two live regions exist from the start: `polite` (success, info) and `assertive` (warning, error), both `aria-atomic="false"`. A new toast is read **once**, when it is inserted; closing it is not announced, and a new toast doesn't repeat the older ones. A standalone `lc-toast` (`announce` true) is its own `role="status"`/`"alert"`.
6. *Guidance:* use `duration: 0` for errors and for toasts with an action (WCAG 2.2.1); keyboard users reach an action only by tabbing to the outlet, so offer it elsewhere too. A lasting state belongs in an `lc-alert` on the page.

## 8. Stories

| Story | Expected ID | Args / content | Shows |
|---|---|---|---|
| Number Columns *(new)* | `data-display-table--number-columns` | DE, caption "Quellen, Oktober 2026"; Quelle (start, sortable) · Buchungen (end, "1.111") · Betrag (end, sortable, `Intl` de-DE EUR, rows with 1.111,11 € and 8.888,88 €) · "Abweichung zum Vorjahreszeitraum" (end, *(r1)* `cellStyle` for negatives → `color: var(--color-text-error)`, no story `<style>`); icon-only action, `actionsLabel="Aktionen"`, `actionsAlign="end"`; `paginate`, `pageSize` 5, 7 rows | AC-1–4, 15; N1 |
| With Cell Formatting And Styling *(changed)* | `…--with-cell-formatting-and-styling` | ARR and SLA: `align: 'end'`; the `.lc-table-story__cell--numeric` style is removed | AC-4 |
| Clickable Rows, Hidden Caption *(changed)* | `…--clickable-rows`, `…--hidden-caption` | `amount`: `align: 'end'` instead of `cssClass` + `::ng-deep` style; the "021" comment is removed | AC-4 |
| Loading *(changed)* | `components-button--loading` | description and `play` per §2 (focus, `aria-disabled`, no `clicked`) | AC-5–8 |
| Loading Keeps Focus *(new)* | `components-button--loading-keeps-focus` | DE source card: heading "USM", `role="status"` line "USM wird geladen …", `lc-progress-bar` indeterminate sm `ariaLabel="USM wird geladen"`, `lc-button variant="outline" [loading]="true" disabledReason="Wird gerade geladen"` "Daten von USM laden"; the description says the page announces the outcome | AC-5–8, 11, 15 |
| Indeterminate *(changed)* | `feedback-progress-bar--indeterminate` | description: motion, reduced motion, forced colours | AC-11 |
| Indeterminate Sizes *(new)* | `feedback-progress-bar--indeterminate-sizes` | linear xs/sm/md/lg + circular xs/sm/md/lg, indeterminate, `max-width: 400px` | AC-9, 10 |
| Status Badges *(new)* | `data-display-list--status-badges` | DE sources list, default and `card` variant: Geladen (success), Veraltet (warning), Fehlgeschlagen (error), Neu (primary), Entwurf (default) | AC-12 |
| Service Call *(new)* | `feedback-toast-outlet--service-call` | DE buttons: Speichern (success, 3000), Laden fehlgeschlagen (error, `duration: 0`), Mit Rückgängig (info, action, `duration: 0`); outlet `closeAriaLabel` DE; snippet in `docs.source.code` | AC-13 |

`Feedback/Toast` component description: one line pointing to *Toast Outlet*. All argTypes keep `description` and `table.defaultValue`.

**Tooling for AC-10:** `story-shots.mjs --forced-colors` adds `{ name: 'forced-colors', value: 'active' }` to `Emulation.setEmulatedMedia`, plus a usage line. If headless Chromium doesn't force the palette, record that in build.md; the review then checks the forced-colors rules in `document.styleSheets`.

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1 | unit: `th`/`td` carry `lc-table__cell--end` only with `align: 'end'`; story *Number Columns* at 360/1024/1280: the Range right of the header label vs the cell text | equal (±0.5 px) for every end column, sorted and unsorted |
| 2 | `--measure`: "1111" vs "8888" in an end `td`; computed `fontVariantNumeric` on `th` and `td` | equal widths; `tabular-nums` |
| 3 | unit: with `paginate`, `actions`, `sortable`, `cellClass` (the class string contains both); story: sort Betrag, measure the `th` box and the indicator | box unchanged; indicator right = label left − 8; actions header text right = buttons right (N1) |
| 4 | story source | no `lc-table-story__cell--numeric`/`--end` left |
| 5, 6 | unit: focus, `setInput('loading', true)` → `activeElement` stays; no `disabled` attribute; `aria-disabled`/`aria-busy` "true"; click, Enter, Space → no `clicked`; a form `submit` listener isn't called; host `(click)` not reached; `disabled=true` still native | as stated |
| 7 | `--compare` against the baseline: the loading stories at rest; `--measure` focus → `outlineColor`, composite contrast | hash-identical; ring ≥ 3.36 L / 4.45 D |
| 8 | JSDoc in `npm run test:tools` manifest output | text of §2 |
| 9 | *Indeterminate Sizes*: `animationName` | `none`; linear fill width = track width (> 0); circle `strokeDasharray` "10.472px, 10.472px" |
| 10 | *Indeterminate Sizes*, *Sizes*, *Circular Sizes* with `--forced-colors` (or a stylesheet scan) | track outline `CanvasText`, fill `Highlight`, circle track `GrayText`; bars visible |
| 11 | JSDoc/description | as §2; spec assertions on role/aria unchanged |
| 12 | `theme-contrast.spec.ts` "Component pairings of 3.17 (request 021)": the 5 list pairs over the 4 bases, both themes | ≥ 4.5; values of §5 |
| 13 | review reads the doc against the 3 toast files | statements of §7 |
| 14 | baseline compare (§10) + existing specs | only the expected diffs |
| 15 | 360: `documentElement.scrollWidth`; 200 % root: every `th.scrollWidth ≤ clientWidth` | 360; no clipping |
| 16 | compat `EXPECT_IN_HTML`: an `align: 'end'` column in `home.html`'s table → class on the `th` and a `td`; the loading button has `aria-disabled="true"` and no `disabled` | present |

## 10. Baseline and expected differences

Baseline `tmp/story-shots/021/baseline` (main 0ce6422, light/dark, `--full`): all 21 table stories at 360/1024/1280; all 25 button and 12 button-link stories, all 20 list stories, the 7 progress, 6 toast and 3 toast-outlet stories, `feedback-next-step-card--loading-primary` and `feedback-choice-prompt--busy` at 360/1280. The scope comes from a sweep of all 950 stories for the elements this request touches.

| Expected to differ | Why |
|---|---|
| `data-display-table--with-icon-only-actions`, `--clickable-rows`, `--hidden-caption` | N1: the actions header moves to the end (+ `align` in the last two) |
| `data-display-table--with-cell-formatting-and-styling` | ARR/SLA headers move to the end |
| `feedback-progress-bar--indeterminate` | story-shots emulates reduced motion → striped full bar |
| `data-display-list--with-badges`, `--rich-items`, `--notification-list`, `--large-size` | light: success/warning badges; dark: success/warning/error badges |
| **must stay identical** | every other story above, including all loading buttons at rest (`components-button--loading`, `--flush-link`, `--inverse`, `--all-variants`, `--outline-primary-tone`, `feedback-next-step-card--loading-primary`): the variant classes override the UA `button:disabled` colours |

**Risks (memory):** `_ngcontent` weight (022 r1) → measure, don't trust selectors; whitespace before the abs indicator; the reduced-motion `*` rule; a translucent dark fill must be composited; story-shots doesn't wait for `play`.
