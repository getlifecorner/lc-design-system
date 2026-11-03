# Spec 041: lc-button ariaDescribedBy; lc-description-list short values never break inside

- **Status:** ready
- **Type:** extension of `lc-button` (new optional input) + bug fix in `lc-description-list`
- **Affected:** `lib/button/button.component.{ts,html,spec.ts}`, `button.stories.ts`; `lib/description-list/description-list.component.scss`, `description-list.stories.ts`, spec; `CHANGELOG.md`
- **Semver impact:** minor. One new optional input (default renders as before); the wrap fix changes layout only for rows that overflow today.

## Need

**A (gap row 7, finance-intelligence sources page).** The upload dialog has a disabled primary button "Hochladen" with a visible reason line under the drop zone ("Wählen Sie zuerst eine Datei."). `disabledReason` is only a `title` tooltip: never shown on a phone, not announced reliably. The visible line cannot be tied to the button, because `lc-button` has no way to set `aria-describedby` on its inner `<button>` (a host attribute lands on `<lc-button>`, not on the button). Look is unchanged; this is a function only.

**B (bug, no gap ID).** `lc-description-list` in the rows layout with leaders, in an `lc-card` at phone width (Pixel 7, iPhone 15), kit 3.24.0: term "Sekundäre Kostenart (Umlage)" with value "10" showed "1" and "0" on two lines. Cause (checked in `description-list.component.scss` lines 46-75): `__term` has `flex-shrink: 0`, `__value` has `flex: 0 1 auto; min-width: 0; overflow-wrap: anywhere`, so all missing width is taken from the value, and `anywhere` breaks inside "10". The requester needs no change for B (it now uses `lc-list`); it is a kit defect.

## What the kit has today

- A: `ariaLabel`, `disabledReason`, `loading` exist; no describedby input. `a[lcButton]` (`ButtonLinkComponent`) is an attribute selector on the anchor, so a native `aria-describedby` on it already works; no input is needed there.
- B: `--lc-btn-overflow-wrap` exists for buttons only. The 3.3 story "Long values and times (3.3)" (312 px card) covers long unbroken values and must keep wrapping.

## Scope

- In: `ariaDescribedBy` input on `lc-button`; short values in `lc-description-list` rows never break inside; the term gives way first (wraps at word boundaries).
- Not in: visual changes to the button; a describedby input on `a[lcButton]`; changes to `stacked` layout, separators, clickable rows, or `lc-list`; auto-generated reason ids.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `lc-button` has an optional input `ariaDescribedBy` (string, default `''`, JSDoc with `@default`) that sets `aria-describedby` on the inner `<button>`. | unit test |
| AC-2 | With the input unset or empty the rendered `<button>` has no `aria-describedby` attribute. | unit test |
| AC-3 | The attribute is present with the given id(s) (also a space-separated list) while `disabled` and while `loading`; `disabledReason`/`title`, `aria-label`, `aria-disabled`, `aria-busy`, classes and layout are unchanged (rendered HTML identical to before when the input is unset). | unit test (existing assertions untouched) |
| AC-4 | Next to `<p id="reason">`, the accessible description of the disabled button computes to the paragraph text; name stays the button text. | unit test (`aria-describedby` resolves) + story check with the accessibility tree |
| AC-5 | Stories: a disabled button with a visible reason line below, and a loading button with `ariaDescribedBy`; argTypes entry with `description` and `table.defaultValue`. DE text length fits at 360 px. | Storybook, 360 px |
| AC-6 | `a[lcButton]` docs (JSDoc/story note) say a native `aria-describedby` on the anchor works; no new input there. | review of docs |
| AC-7 | In `lc-card` at 280 px and 312 px, `leaders` true, term "Sekundäre Kostenart (Umlage)" with value "10": the value is on one line (value box height equals one line height; text "10" not split) and the term wraps at word boundaries (at least two lines, no break inside a word). | new story + `--measure` at 280 and 312 px, light and dark |
| AC-8 | Short unbreakable values (numbers, amounts such as "1.234,56 €") never break inside in a tight row, while the term can shrink and wrap. | story + measure |
| AC-9 | Long unbroken values (e-mail, IBAN; the 3.3 story) still wrap and the row does not overflow: `scrollWidth <= clientWidth` of the row/host at 280, 312 and 360 px. | 3.3 story + measure |
| AC-10 | Rows that fit look as today: existing description-list stories at 360 / 1024 / 1280 px, light and dark, are hash-identical to the baseline (leaders, separators, sm, stacked, clickable rows). | story-shots `--compare` |
| AC-11 | Prerendered HTML: the layout fix is pure CSS and holds without JavaScript; no new element or class is required for unchanged output of `lc-description-list` markup. | compat prerender check / DOM comparison |
| AC-12 | Existing specs for both components pass unchanged; the CHANGELOG entry (Added: ariaDescribedBy, Fixed: value wrap, Compatibility: no API break) names the gap row 7 and the Pixel 7 / iPhone 15 case. | test run, changelog review |

Not applicable: keyboard/focus changes (none); contrast (no colour change).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Both components keep working in `forced-colors` and with `prefers-reduced-motion` (no change expected).

## Assumptions

- Assumption: `ariaDescribedBy` is a plain string passed through (`|| null` as for `ariaLabel`); the kit does not validate that the id exists.
- Assumption: `a[lcButton]` needs no input; native `aria-describedby` already reaches the anchor.
- Assumption: the 280 px story uses the card's default padding so the card content is narrower than 280 px; the measurement is taken as given in the story, not recomputed.
- Assumption: how the term yields and how "short" is decided (for example by not allowing a break inside the value until it is wider than the row) is the designer's choice, as long as AC-7 to AC-10 hold.

## Open questions

None.
