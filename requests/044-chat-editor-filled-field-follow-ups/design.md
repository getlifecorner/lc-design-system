# Design 044: Chat remove target, editor mode state, filled-field boundary

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-16 · kit 3.27.1 (main e87c98f) → patch 3.27.2
- Every value below was measured on main with story-shots (logs in `tmp/story-shots/044/`); the CSS was prototyped in the page (chat: injected rules; fields: the existing CSSOM rules edited in place, so order and weight are the real ones).

## 1. Approach

Extend, no new API. Each fix copies a pattern the kit already has:

| Fix | Pattern followed | Why |
|---|---|---|
| F-28 chat `__pending-remove` | the send/attach hit area in the same file (043 F-22): `position: relative` + `::before` with `inset: calc((size − touch) / 2)` | the button is a fixed 1.25rem square, so 043's `min(0px, …)` form (for chips wider than 44) reduces to this one |
| F-29 RTE mode buttons | `[attr.aria-pressed]` as in lc-calendar's view toggle (same day/week/month shape) | kit convention for a set of toggle buttons |
| F-31 filled select/textarea/datepicker | the outline variant's boundary and hover (`--color-field-border` at rest, `--color-text-secondary` on hover, 043 F-23) | one boundary rule for every field variant |

**Decisions (measured):**

- **D-1 Chat row gap 6 → 14 px.** A 44 px area on a 20 px × reaches 7 px past a 30 px chip. With the 6 px row gap, two chips whose × line up (two long names at 360) overlap by **8 px**, and the later chip's × wins the band: a click on the bottom edge of chip 1 removes file 2. Measured on main: rows at y 172/208, × at x 265.44/262.86. With `row-gap: 0.875rem` the two areas meet at the gap's middle (scan 23/22/23/21.5–22 px from the centre; 1 px clear of the input below, 1 px inside the composer padding above). Columns stay 6 px (area ends 1 px before the next chip). Chip sizes, wrapping and name widths are identical (AC-2); only rows 2+ move down by 8 px each.
- **D-2 Forced-colours mark = Highlight underline, not the NC/log outline.** The kit's other pressed marks (NC filter, log pill) are a 2 px Highlight outline, which looks like the 2 px Highlight focus ring: with focus on "Markdown" and "Formatiert" pressed, two rings show and neither reads as focus. An underline is a different shape, coexists with the ring and needs no layout (prototype: button boxes 77/76/54 × 44 unchanged).
- **D-3 Filled hover border = `--color-text-secondary`.** In light, `--color-surface-hover` = `--color-surface-sunken` (#f3f4f6), so with `--color-field-border` on both rest and hover the light hover would show no change at all. text-secondary is the outline variant's hover too.
- **D-4 Filled datepicker error (spec premise false).** AC-10 assumes the error border is kept; on main the filled datepicker error border is **transparent** (L and D): `.lc-datepicker.lc-datepicker--filled` comes after `.lc-datepicker.lc-datepicker--error` with the same weight. Fix: an error rule last in the filled block, so a filled error field shows `--color-error-600` like select and textarea (also on focus: border and outline error, as every other error field).
- **D-5 Disabled filled = the component's disabled outline look.** Select keeps `--color-border` (unchanged). Datepicker: `--color-border` (was transparent). Textarea: `--color-field-border` under the existing 0.6 opacity (was transparent). The muted look (opacity 0.6, `--color-surface-muted`) stays; disabled is exempt from 1.4.11.
- **D-6 Read-only filled gets the boundary** (it is focusable; the datepicker comment already says so): textarea/datepicker transparent → `--color-field-border`; no hover change (existing `:not(:read-only)` / `:not([readonly])`).

## 2. Public API

No input, output, slot, hook or type changes (AC-15). File changes:

| File | Change |
|---|---|
| `chat.component.scss` `.lc-chat__pending-attachments` | `gap: 0.875rem 0.375rem` (was `0.375rem`), comment D-1 |
| `chat.component.scss` `.lc-chat__pending-remove` | add `position: relative`; `&::before { content: ''; position: absolute; inset: calc((1.25rem - var(--size-min-touch-height, 2.75rem)) / 2); }` with the send-button comment pattern (request 044 F-28) |
| `rich-text-editor.component.html` | each mode button: `[attr.aria-pressed]="activeMode() === 'rich'"` (`'markdown'`, `'split'`) after `[class.active]`; `.active`, `type`, `title`, labels unchanged |
| `rich-text-editor.component.scss` (forced-colors block) | `.lc-rich-text-editor__mode-btn[aria-pressed='true'] { text-decoration-line: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; text-decoration-color: Highlight; }` |
| `select.component.scss` `&.lc-select--filled` | `border-color: var(--color-field-border)` (was `transparent`); its hover `border-color: var(--color-text-secondary)` (was `--color-border`) |
| `textarea.component.scss` `&--filled` | `border-color: var(--color-field-border)` (was `transparent`); its hover adds `border-color: var(--color-text-secondary)` |
| `datepicker.component.scss` `&.lc-datepicker--filled` | rest `--color-field-border`; hover `--color-text-secondary`; `&:disabled` adds `border-color: var(--color-border)`; new last rule `&.lc-datepicker--error { border-color: var(--color-error-600); }` (D-4) |

Default rendering: unchanged for every outline field, lc-input, every RTE story in normal colours and every chat story at load (no story shows pending chips today): 240 of the 252 baseline shots identical (§9). The 12 filled-story shots change by design.

## 3. Anatomy and layout

### 360 px (chat composer, *Pending Attachments*, 4 files; story canvas 328, composer content 284)

```
┌ composer pad 8 ───────────────────────────────┐  area top 1 px inside the padding
│ [▯ Quarterly-travel-expen… 1.2 MB  ×]  254×30   │  × 20 at x+227; area 44×44 (dashed, unpainted)
│                  14 px row gap (was 6)          │  areas meet at the gap middle
│ [▯ Kostenstellen-Übersich… 5.0 KB  ×]  252×30   │
│ [▯ Reisekostenabrechnun… 240.0 ×]      256×46   │  size wraps to 2 lines (pre-existing)
│                          KB                     │
│ [■ beleg.png 255 B ×]                  173×38   │  image row 38; area 5 px above the input
│ gap 8                                           │
│ Nachricht eingeben…                    textarea │  y 342, unchanged
│ (📎)                               (➤)          │
└─────────────────────────────────────────────────┘
```

### From 1024 px (1280 the same pattern)

```
1024: [EN 254×46][DE 252×46][DE 256×46]   ← row 1 stretches to 46 (wrapped size)
      14 px
      [■ beleg.png 173×38]
1280: all four chips in one row (46 high): hash-identical to main (nothing painted)
```

| Element | Size / spacing | Token |
|---|---|---|
| Remove × | 20 × 20 visible, 44 × 44 hit (±12 px) | `1.25rem`, `--size-min-touch-height` |
| Pending rows / columns | 14 / 6 px | `0.875rem` / `0.375rem` (file uses raw rem) |
| × focus ring | 2 px, offset 2 → 28 px circle, 4 px past ×, inside the chip padding (5 / 7) | `mix.focus-ring` (unchanged) |
| RTE mode underline (forced colours only) | 2 px, 4 px below baseline, label width | system `Highlight` |
| Filled field border | 1 px (already 1 px transparent: no shift) | `--color-field-border` / `--color-text-secondary` |

Heights unchanged (AC-11, measured): filled datepicker xs/sm/md/lg 24/32/40/44, select md 40 / lg 44, textarea md rows 3 = 98.

## 4. States

| State | Chat × | RTE mode button | Filled field |
|---|---|---|---|
| Rest | as today; area unpainted | pressed = fill pair (normal); `aria-pressed="true"` on one, `"false"` on two | border `--color-field-border`, fill sunken |
| Hover | fill `--color-surface-hover` anywhere in the 44 px area | unchanged | border `--color-text-secondary`, fill `--color-surface-hover` |
| Focus-visible | kit ring round the 20 px × (not the area) | kit ring; in FC the pressed underline stays visible beside it | primary border + ring (unchanged) |
| Active / pressed | — | fill pair; FC: Highlight underline | — |
| Disabled | composer disabled: chips as today | editor disabled (opacity .6) as today | D-5 |
| Read-only | — | — | D-6: boundary, no hover change |
| Error | — | — | `--color-error-600`, no hover change; datepicker fixed (D-4) |
| Overflow | DE/EN long names ellipsize at 144 (unchanged); many files wrap in rows 14 apart | DE labels as in *Touch Targets (DE)* | — |

## 5. Theming (computed, WCAG formula, floor 2 dp; L / D; pages = background, surface, surface-2)

| Element | Before | After (min over the pages) |
|---|---|---|
| Filled rest border vs page | transparent (none) | 4.83 / 4.83 / 4.62 L · 7.31 / 6.70 / 5.56 D |
| Filled rest border vs own fill (sunken) | — | 4.39 L · 7.02 D |
| Filled hover border vs page | 1.23 / 1.23 / 1.18 L · 1.29 / 1.33 / 1.35 D | 7.55 / 7.55 / 7.23 L · 12.16 / 11.15 / 9.25 D |
| Filled hover border vs hover fill (over the page) | 1.12 L · 1.33–1.35 D | 6.86 L · 11.05 / 9.97 / 8.17 D |
| Filled error border vs page / fill | datepicker: none | 8.39 / 7.62 L · 9.47 / 9.09 D (= select/textarea) |
| Filled disabled (exempt) | datepicker/textarea none | `--color-border` 1.23 L / 1.29 D; textarea field-border × 0.6 |
| RTE pressed (normal) | 6.21 / 6.21 | unchanged |
| Forced colours: field border | forced CanvasText (black L / white D) | same (AC-13) |

No new token. The rest minimum (4.39 L on the fill, 5.56 D on surface-2) and hover minimum (6.86 L, 8.17 D) are ≥ 3:1, and hover ≥ rest in every cell (AC-9).

## 6. Accessibility

- **Chat ×:** native `<button type="button">`, name "Entfernen: <file>" (unchanged); 44 × 44 target (kit rule, WCAG 2.5.8); areas never overlap (D-1); ring unchanged, `Highlight` in forced colours (existing rule); the `::before` has no background or border, so it paints nothing in forced colours.
- **RTE:** `aria-pressed` true/false on the three `type="button"` buttons: announced as "Formatiert, toggle button, pressed" (wording per screen reader). Keyboard: Enter and Space activate a native button (click), which updates the attribute. Forced colours: underline (D-2). No group role or new label (no new input; the visible labels name the buttons).
- **Filled fields:** 3:1 boundary at rest and on hover (§5); focus, error and forced colours as before.
- Reduced motion: nothing animated is added.

## 7. Texts

No built-in string changes. Story strings: chat DE uses the defaults (title "Assistent"); chat EN sets `title` "Assistant", `placeholder` "Type a message…", `inputLabel` "Message", `attachAriaLabel` "Attach file", `sendAriaLabel` "Send", `removeAttachmentAriaLabel` "Remove:". RTE DE copies *Touch Targets (DE)* labels ("Formatiert", "Markdown", "Geteilt" and titles). Filled stories DE: placeholders "Land wählen" / "Datum wählen", textarea label "Kommentar", errors "Bitte ein Land wählen" / "Bitte ein gültiges Datum wählen" / "Bitte mindestens 20 Zeichen schreiben". Known, out of scope: the chat size label is not localised ("240.0 KB") and wraps in a 256 px chip.

## 8. Stories

| Story (name) | Expected ID | Content | Shows |
|---|---|---|---|
| Pending Attachments (DE) | `components-chat--pending-attachments` | wrapper 560 px; *Touch Targets* messages (fixed dates); `play` adds via `DataTransfer` + `change` on `.lc-chat__file-input`: "Quarterly-travel-expense-report-2026-final.pdf" (1,258,291 B), "Kostenstellen-Übersicht-Oktober-2026.pdf" (5,120 B), "Reisekostenabrechnung-Q3-2026-Entwurf.pdf" (245,760 B), "beleg.png" (56×56 canvas PNG, fill `#208497`) — the exact set of `tmp/story-shots/044/chat-pending-measure.js` | AC-1/2/3 |
| Pending Attachments (EN) | `components-chat--pending-attachments-english` | same files, EN texts (§7) | AC-2 EN |
| Pressed Mode (DE) | `editors-rich-text-editor--pressed-mode` | 3 editors, gap 16, `toolbar: { actions: ['bold','italic','link'] }`, minHeight 80, DE labels; A `mode: 'rich'`; B and C start `'rich'`; `play` (`storybook/test` `userEvent`, `focus({ preventScroll: true })`): Space on B "Markdown", Enter on C "Geteilt", `expect` the three `aria-pressed` patterns | AC-4/5/6 (rich, markdown, split; FC underline beside a ring) |
| Filled States (DE) | `form-select--filled-states` | `variant="filled"`, DE options, max-width 320: xs, sm, md, lg, error + message, disabled | AC-8–11, 13 |
| Filled States (DE) | `form-textarea--filled-states` | sizes xs–lg (rows 2), error + message, disabled, read-only with text | same |
| Filled States (DE) | `form-datepicker--filled-states` | sizes xs–lg, error + message, disabled, read-only | same, D-4 |

Each new story gets a `docs.description` with the measured values of §5/D-1, as *Touch Targets* does.

## 9. Verification

Baselines (main e87c98f, measure = 1 s wait): `044/baseline` 63 stories (`baseline-ids.txt`) × 360/1280 × L/D = 252 shots, re-shot once: 252/252 identical (all hash-stable). `044/baseline-fc` (3 filled stories, 360, `--forced-colors`, 6). `044/baseline-chat` (`components-chat--touch-targets` + `chat-pending-measure.js` with `""`, 360/1024/1280 L/D, 6).

| AC | How | Expected |
|---|---|---|
| 1 | `chat-pending-measure.js` (hit-area scan) on both new chat stories after a 1.5 s wait, 360/1024 | every × 20×20; scan 23,22,23,22 (±0.5 snapping) = 44×44; vertically adjacent areas touch, never overlap; areas ≥ 1 px clear of the next chip and of the textarea, inside the composer |
| 2 | same measure on `touch-targets` with `--compare=044/baseline-chat` | 1280 identical; 360/1024 differ; chips 254.44×30, 251.86×30, 256×46, 172.58×38, names 144/144/144/56.64 (scroll 270/245/265/57) at every width, as on main; rows y 148/192/236/296 at 360 |
| 3 | focus the first × in the measure; `--forced-colors` run | outline 2px offset 2, `:focus-visible`; ring box inside the chip; FC outline Highlight; no FC paint from `::before` |
| 4, 5 | unit tests: initial `aria-pressed` per `mode` input (one `"true"`), after `click()` on each; `type="button"`, text and `title` unchanged; EN/DE label inputs. Keyboard: native button + the story's `play` (Space/Enter) with `phase === "finished"` | exactly one `"true"` |
| 6 | `--forced-colors` on `--default`, `--markdown-mode`, `--split-mode`, `--pressed-mode`, L/D, 360/1280 | only the pressed button has `textDecorationLine: underline`, colour Highlight; focus ring separate |
| 7, 12 | `--compare=044/baseline` (252) | identical except the 12 shots of `form-select--filled`, `form-textarea--filled-variant`, `form-datepicker--filled-variant` |
| 8, 9 | `theme-contrast.spec.ts` block (rest token + ratio vs sunken and the 3 pages; hover token + ratio vs hover fill over the pages, both themes); `filled-proto-measure.js` with first argument `false` (no CSSOM edits; hover by `:hover` rule clones) on the 3 new stories, selector and state list per component as in `proto-filled-{select,textarea}.log` runs | §5 values; hover ≥ rest |
| 10 | edit only the 3 filled rows of `focus-indicators.spec.ts` D-6 (new `border-color`) and, optionally, drop `--color-border` from the AC-3 allow-list in `touch-targets-contrast.spec.ts`; list both in `build.md` | error/focus as §4; D-4/D-5/D-6 as measured |
| 11 | heights in the 3 new stories (EN = DE: fixed-height fields) | 24/32/40/44; textarea per rows |
| 13 | `--forced-colors --compare=044/baseline-fc` + border colour at rest and hover | light identical; dark may differ by raster only (the CSSOM prototype did, with equal colours rgb(255,255,255)) |
| 14 | the six stories at 360/1024/1280 L/D | as §8 |
| 15, 16 | compat template gets an `lc-rich-text-editor` + `EXPECT_IN_HTML` for one `aria-pressed="true"` and two `"false"` on `lc-rich-text-editor__mode-btn`; gates; changelog (Fixed, F-28/29/31 with §5 values; Compatibility: the filled border is now drawn, chat rows 8 px further apart when chips wrap, filled datepicker error now red) | pass |

**Risks (my pitfalls):** prototype rule order matters (the datepicker error bug only shows with in-place edits); the 044 hit area changes nothing at 1280 but moves wrapped rows; play-based stories need a 1.5 s wait in every measure; RTE prerender may need the server check (`document` only in handlers).

**Follow-ups (backlog nits):** chat size label not localised and wraps; NC filter / log pill FC marks look like the focus ring (D-2).
