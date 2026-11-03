# Spec 044: Chat remove target, editor mode state, filled-field boundary

- **Status:** ready
- **Type:** bug fix (three WCAG 2.2 AA findings, no new API)
- **Affected:** `lc-chat` (`chat.component.{scss,html}`, `__pending-remove`), `lc-rich-text-editor` (`.html`, `.scss`, `__mode-btn`), `lc-select`, `lc-textarea`, `lc-datepicker` (`--filled` variant, `.scss`), specs `focus-indicators.spec.ts` and `touch-targets-contrast.spec.ts`, the stories of the five components, `CHANGELOG.md`
- **Semver impact:** patch. Findings F-28/F-29/F-31 are conformance fixes with no new input, no changed default value and no removed hook. Visible change: the `--filled` border is now drawn (1 px), the remove hit area is larger, mode buttons get `aria-pressed`. Consumers who pin the old look through `lc-*` hooks have none to lose (none exist for these properties).

## Need

Follow-ups of request 043 (queued under the owner rule of 2026-11-02; a measured WCAG 2.2 AA failure is at least should-fix). No consumer page is named; the findings come from the 043 review.

| ID | Failure today | Source |
|---|---|---|
| F-28 | `lc-chat` pending-attachment remove button is 20 × 20 px (`width/height: 1.25rem`); it was missed in the F-22 sweep. WCAG 2.5.8 (target size minimum) | 043 design.md §6, line 118 |
| F-29 | `lc-rich-text-editor` mode buttons (Rich / Markdown / Split) have no `aria-pressed`: a screen reader cannot tell the active mode. In forced colours the `.active` fill is removed and no other mark remains (WCAG 1.4.1, 4.1.2) | 043 design.md lines 121, 177 |
| F-31 | `--filled` fields have `border-color: transparent` at rest and `--color-border` on hover (1.23:1 light, 1.29:1 dark): no 3:1 boundary (WCAG 1.4.11 non-text contrast) | 043 release.md, Open nits 6 |

## What the kit has today

- F-28: 043 solved the same problem for other controls with a grown hit area (a `::before` inset using `min()`, 043 design.md §6: `min-inline-size` on a nowrap flex chip squeezed text). Reuse that pattern; the chat button was not part of it.
- F-29: `.active` class only; the active fill is `--color-primary-fill` / `--color-on-primary` (6.21:1). Other toggle-like components in the kit already use `aria-pressed` and a forced-colours mark (designer to reuse the existing convention, grep `aria-pressed`).
- F-31: `--color-field-border` (light neutral-500, dark #93a4ad) is the kit's 3:1 field boundary, already used by `lc-input`, outline select/textarea/datepicker (asserted in `theme-contrast.spec.ts`). `lc-input` has no filled variant. Filled variants exist only in select, textarea and datepicker (grep `variant = input<'outline' | 'filled'>`). Hover on filled sets `--color-border` (select, datepicker) or leaves the border transparent (textarea).
- BACKLOG: `requests/BACKLOG.md` has no row on chat, rich-text-editor, select, textarea or datepicker. Nothing to fold in.

## Scope

- In: the three fixes above, their stories and tests, a changelog entry (Fixed; Compatibility: no API change; note the now-visible filled border).
- Not in (non-goals): new inputs or hooks; resizing other chat controls; redesigning the filled look beyond the boundary (fill colours, focus ring and error states stay); `lc-input` (no filled variant); changing the select/tag 24 × 24 size exception of 043 D-3.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `lc-chat` `__pending-remove` has an interactive hit area of at least 44 × 44 CSS px, centred on the visible 20 px glyph button; the visible size stays 20 px. Measured with `getBoundingClientRect` of the button plus its hit-area pseudo (or via the 043 pattern's `--measure`). Hit areas of neighbouring remove buttons and the attachment chip do not overlap in a way that steals clicks from the chip body | story + `--measure`, 360 and 1024 px |
| AC-2 | The pending chips do not change size, wrap or squeeze their filename text compared with today (no `min-inline-size` on the nowrap chip) in EN and DE with a long file name, at 360 px | story + screenshot hash compare at 360/1024 |
| AC-3 | Remove button: `:focus-visible` ring and forced-colours `Highlight` ring still present and not clipped by the grown area or the chip's overflow; the hit area paints nothing in forced colours | story, forced-colors emulation, measure |
| AC-4 | Each of the three mode buttons has `aria-pressed="true"` exactly when it is the active mode, otherwise `"false"`; the attribute updates after click and keyboard (Enter/Space) activation | unit test |
| AC-5 | The three buttons are still `type="button"`, keep their accessible name (visible label, `title` unchanged) and EN/DE label inputs work | unit test, story EN/DE |
| AC-6 | In `forced-colors: active` the active mode button has a mark that does not depend on a background fill (e.g. a system-colour border/underline such as `Highlight`/`ButtonText`), distinguishable from the inactive two; the mark holds in the rich, markdown and split modes | story with forced-colors emulation + screenshot |
| AC-7 | Normal-colours look of the mode buttons is unchanged: same fill pair (`--color-primary-fill` / `--color-on-primary`), same 44 px size, hover unchanged | existing assertions + screenshot hash compare light/dark |
| AC-8 | `lc-select`, `lc-textarea`, `lc-datepicker` with `variant="filled"` show a field boundary of at least 3:1 against the field's own fill and the page surface at rest, in light and dark, computed from the final tokens (target `--color-field-border`). Contrast is asserted for the fill (`--color-surface-sunken`) and the surface the field sits on | `theme-contrast.spec.ts` assertion + story measurement |
| AC-9 | The same boundary holds on hover (the hover border is not lower than rest and is at least 3:1; today 1.23:1 / 1.29:1) in light and dark, for all three components | spec on the hover rule + story hover measure |
| AC-10 | Error, disabled, read-only and focus states of filled fields are unchanged: error keeps `--color-error-600` with no hover change, focus keeps its primary border/ring, disabled keeps its muted look. The existing 043 hover assertions (`AC-4`, `AC-6` in `touch-targets-contrast.spec.ts`/`focus-indicators.spec.ts`) change only where the filled hover border value is the stated reason | existing specs, with edits listed in `build.md` |
| AC-11 | Field heights are unchanged (the border is already 1 px transparent, so layout does not shift): measured heights of filled select, textarea and datepicker for each size equal the heights today, in EN and DE | story `--measure` before/after |
| AC-12 | `outline` variants and `lc-input` render exactly as before (screenshot hash equal) | hash compare |
| AC-13 | Forced colours: filled fields keep a visible border (system colour) at rest and on hover | story with forced-colors emulation |
| AC-14 | A story per fix shows it: chat with pending attachments (long name, EN/DE), editor in each mode, filled select/textarea/datepicker at rest and hover; widths 360, 1024, 1280, light and dark | stories |
| AC-15 | No new input, output, hook or runtime dependency; peer range unchanged; Angular 21 and 22 compat check and prerender pass; the prerendered HTML of the editor contains `aria-pressed` on the mode buttons | compat check, prerendered HTML grep |
| AC-16 | The full unit suite, lint, library build pass; `CHANGELOG.md` has a consumer-facing entry naming F-28, F-29, F-31 and the measured values | gates, changelog |

Covered throughout: 360 px and desktop widths, light and dark, keyboard and screen reader (AC-4, AC-3), EN/DE (AC-2, AC-5, AC-11), unchanged defaults (AC-7, AC-10, AC-12, AC-15).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Tokens only, no raw colours; forced-colours and reduced-motion must keep working.
- Do not weaken an existing assertion except where AC-10 says so.

## Assumptions

- Assumption: the owner's 2026-11-02 rule settles that these are fixed now, not documented as exceptions. For F-28 a 44 px hit area is chosen over a 2.5.8 exception because a spacing exception does not apply (neighbouring targets are within 24 px of the chip body); the designer may still document a exception if the 044 grown area measurably cannot fit and must then say why.
- Assumption: F-31 target is `--color-field-border` for rest and hover on the filled variants (consistent with outline). The designer may propose a different token if the hover differentiation (fill change plus border) needs it, as long as AC-8/AC-9 hold.
- Assumption: "wherever a filled variant exists" means select, textarea, datepicker only (`lc-input` and others have none; verified by grep).
- Assumption: the visible change of a drawn filled border is acceptable in a patch because it fixes a conformance failure and the layout does not shift (AC-11).

## Open questions

None.
