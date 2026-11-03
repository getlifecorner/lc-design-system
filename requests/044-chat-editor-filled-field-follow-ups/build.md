# Build 044: Chat remove target, editor mode state, filled-field boundary

- **Branch:** `fix/3.27.2-chat-editor-filled-field-follow-ups` (from `main` e87c98f)
- **Commit:** one commit `fix: 44 px chat remove target, editor aria-pressed, filled-field boundary (044)` (amended with the docs; gates on the code of `eba7ac1`)

## Files changed

| File | Change |
|---|---|
| `chat.component.scss` | D-1: `.lc-chat__pending-attachments` `gap: 0.875rem 0.375rem`. F-28: `__pending-remove` `position: relative` + transparent `::before`, `inset: calc((1.25rem - var(--size-min-touch-height, 2.75rem)) / 2)` |
| `rich-text-editor.component.html` | `[attr.aria-pressed]="activeMode() === '…'"` after `[class.active]` on the 3 mode buttons (lc-calendar's pattern) |
| `rich-text-editor.component.scss` | forced-colors block: `__mode-btn[aria-pressed='true']` underline 2 px, offset 4 px, `Highlight` (D-2) |
| `select.component.scss` | `--filled` rest `--color-field-border` (was transparent), hover `--color-text-secondary` (was `--color-border`) |
| `textarea.component.scss` | `--filled` rest `--color-field-border`, hover adds `--color-text-secondary` (disabled and read-only inherit the rest border, D-5/D-6) |
| `datepicker.component.scss` | `--filled` rest/hover as above; `:disabled` `--color-border` (D-5); last rule `.lc-datepicker--filled.lc-datepicker--error` error-600 (D-4) |
| 5 `*.stories.ts` | the 6 stories of §8, IDs as designed (checked in `index.json`) |
| Specs, new | `chat.pending-remove.spec.ts` (6), `rich-text-editor.pressed-mode.spec.ts` (13), `lib/filled-field-boundary.spec.ts` (67: cascade per state, filled + outline), `theme-contrast.spec.ts` 044 block (9) |
| Specs, changed | `focus-indicators.spec.ts` D-6: the 3 filled hover rows get `border-color: var(--color-text-secondary)` (was `--color-border` / none; design §9 AC-10). `touch-targets-contrast.spec.ts` AC-3: `--color-border` (1.23:1) left the allow-list, plus `borders.length > 0` (stronger) |
| `tools/compat/` | `probe-3272.ts` (DE editor, secondary entry), `home.{ts,html}`, `EXPECT_IN_HTML` "rich-text editor: aria-pressed on the three mode buttons" |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | `044/measure/chat.mjs` on both chat stories, 360/1024/1280 L/D (12): every × 20 × 20; scan L/R/T/B 23/22/23/22 (first miss, 0.5 px steps) = 44 × 44; at 360 the stacked × of chips 1–2 meet at y 324/324.5 (scan 21.5 below ×1 = the later sibling wins the shared half pixel; CSS boxes 281–325 / 325–369, 0 overlap); areas ≥ 1 px clear of other chips (6/7.5/14/10 at 360, 1 at 1024/1280), 5 px above the input, inside the composer. Spec: `::before` box |
| AC-2 | Same measure: chips 254.44×30 / 251.86×30 / 256×46 / 172.58×38, names 144/144/144/56.64 (scroll 270/245/265/57) at every width, EN = DE. `touch-targets` vs `baseline-chat`: see Gates |
| AC-3 | Measure: first × `:focus-visible`, 2px solid offset 2, ring box inside chip 1 (L/D); `::before` paints nothing (bg transparent, no border/outline/shadow). Spec: ring + forced `Highlight`, no paint on `::before` in either block |
| AC-4, AC-5 | `rich-text-editor.pressed-mode.spec.ts`: one `"true"` per mode input, click on each moves it, follows `.active`, native `type="button"`, titles/labels EN and DE, `aria-pressed` the only new attribute. Story play: Space on B, Enter on C → `expect` patterns pass; `rte.mjs` reads them in all 6 shots, focus on C "Geteilt" |
| AC-6 | `--forced-colors` run (Gates): only pressed buttons underlined `Highlight` 2 px / 4 px; ring separate |
| AC-7, AC-12 | Compare vs `044/baseline` (Gates); spec: no normal-colours rule keys on `aria-pressed`, `.active` fill pair unchanged; outline rows of the cascade matrix |
| AC-8, AC-9 | `theme-contrast.spec.ts` 044 block = design §5 to the hundredth (rest 4.83/4.83/4.62 L, 7.31/6.70/5.56 D on the pages, 4.39 L / 7.02 D on the fill; hover 7.55/7.55/7.23 L, 12.16/11.15/9.25 D; on the hover fill 6.86 L, 11.05/9.97/8.17 D), hover ≥ rest everywhere. `fields.mjs` on the 3 new stories: the same values in the browser |
| AC-10 | Cascade matrix (`filled-field-boundary.spec.ts`), 11 states × 3 fields: error E-600 at rest, hover and focus (datepicker D-4 fixed: was transparent / primary on focus), focus primary + ring, disabled D-5, read-only D-6. Against the main SCSS 19 filled cells fail, every outline cell passes (revert proof) |
| AC-11 | `fields.mjs`: select / datepicker xs–lg 24/32/40/44, textarea per size; = main |
| AC-13 | `--forced-colors` compare vs `baseline-fc` (Gates) |
| AC-14 | 6 new stories × 360/1024/1280 × L/D: `tmp/story-shots/044/new/` (36) |
| AC-15 | No `.ts` change; compat 22: the new check passes (`true false false`, titles, `type="button"`) |
| AC-16 | Gates below; changelog draft |

## Gates

All gates ran on the code of `eba7ac109b5ba2332af140dd9d32b76b45e5b2de` (`git diff --quiet eba7ac1 -- libs tools` holds for the amended commit).

| Gate | Result |
|---|---|
| `test` (`--runInBand`) | 231 suites, 5484 passed, 8 skipped (65 s); +95 tests, +3 suites |
| `lint` | 0 errors, 162 warnings (= main) |
| `build` | 122 entries built |
| `npm run test:tools` | 22 pass |
| `build-storybook` | 1034 stories (+6) |
| Shots vs `baseline` | 252 (63 stories × 360/1280 × L/D, 1 s wait) → `044/build/`: **240 identical, 12 different** = exactly `form-select--filled`, `form-textarea--filled-variant`, `form-datepicker--filled-variant` × 4 (AC-7, AC-12) |
| Shots, other | `chat-tt/` (touch-targets + `chat-pending-measure.js ""`) vs `baseline-chat`: 1280 L/D identical, 360/1024 differ; chips/names as main, rows y 148/192/236/296 at 360 (= §9). `fc-build/` vs `baseline-fc`: 6/6 identical. `fc-rte/` (16): 24 pressed buttons underlined `Highlight` 2px/4px, 48 unpressed none, ring on the focused "Geteilt". `fc-new/` (6): borders CanvasText at rest and hover, disabled GrayText. `new/` (36, textarea `--full`): all six stories; play patterns in 6/6 RTE shots. `axe/`: the 6 new stories at 360 L/D, 0 violations in 12 shots |
| Compat `--only=22` | PASS, 95 prerender checks (+1) |

## Deviations from the design

None in the component CSS, template or story IDs. Story details §8 left open, chosen: EN chat messages in English; DE `ariaLabel`s with the size or state (`Land (xs)`, `Datum (Fehler)`) on the select and datepicker fields and the same suffix on the textarea labels, so the six fields of a story are told apart; textarea read-only text "Die Reisekosten wurden am 3. November geprüft und freigegeben."; every textarea of the story 2 rows. The theme-contrast block also pins the error border on surface and surface-2 (8.39/8.02 L, 8.68/7.21 D), which §5 does not quote.

## Changelog draft

```markdown
## [3.27.2] - 2026-11-03

A 44 px remove target on pending chat attachments, a pressed state the rich-text editor's mode buttons announce, and a 3:1 boundary on filled select, textarea and datepicker fields (043 follow-ups F-28, F-29, F-31). No API breaks.

### Fixed

- **`lc-chat` pending attachments (F-28, WCAG 2.5.8):** each remove × keeps its 20 px look but takes taps in a 44 × 44 px area, centred and without paint (hover fill anywhere in it; the focus ring stays round the 20 px button, `Highlight` in forced colours). Wrapped chip rows are 14 px apart (were 6), so two stacked areas meet instead of overlapping by 8 px, where the lower × took a tap on the upper chip. Chips, names and sizes are unchanged. Stories *Pending Attachments (DE)* and *(EN)*.
- **`lc-rich-text-editor` mode buttons (F-29, WCAG 4.1.2, 1.4.1):** each has `aria-pressed` ("true" on the active mode, "false" on the others, also in prerendered HTML), so screen readers announce which mode is on. In forced colours, which remove the pressed fill, the pressed mode is underlined in `Highlight` (2 px, 4 px below the text), a different shape from the focus ring. The normal look is unchanged. Story *Pressed Mode (DE)*.
- **Filled `lc-select`, `lc-textarea`, `lc-datepicker` (F-31, WCAG 1.4.11):** the border was transparent at rest and `--color-border` on hover (1.23:1 light, 1.29:1 dark; the textarea none). It is now the outline variant's boundary: `--color-field-border` at rest, 4.83 / 4.83 / 4.62:1 light and 7.31 / 6.70 / 5.56:1 dark on the page, surface and surface-2, 4.39:1 / 7.02:1 on the field's own fill; `--color-text-secondary` on hover, at least 6.86:1 light and 8.17:1 dark on the hover fill. Read-only fields keep it (no hover change). A filled datepicker with an error now shows its `--color-error-600` border, also on focus (it was transparent: the filled rule came after the error rule). Stories *Filled States (DE)* in the three components.

### Compatibility

- No input, output, type, CSS hook or default value changed. Filled fields now draw a 1 px border that was already there transparent: no size changes (select and datepicker xs to lg 24/32/40/44 px). Disabled filled datepicker uses `--color-border` and disabled filled textarea `--color-field-border`, as their outline variants (both under the 0.6 opacity). Pending chat chips that wrap sit 8 px further apart per row; on one row nothing moves. Of the 252 at-rest shots of the touched components' stories, 240 are hash-identical; the 12 others are the three *Filled* stories.
- Checked on Angular 22 (AOT, strictTemplates, prerender).
```
