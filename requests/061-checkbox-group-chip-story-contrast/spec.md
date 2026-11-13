# Spec 061: lc-checkbox-group (new), lc-chip story contrast

- **Status:** ready
- **Type:** bundle of 2: new component (item 2), story fix (item 1)
- **Affected:** `lib/checkbox/` (new `checkbox-group.component.{ts,html,scss,spec.ts}`, `checkbox.component.ts` for the group context, `checkbox.stories.ts`, `index.ts`), `lib/chip/chip.stories.ts` (story only), README (root and lib), MCP manifest (automatic), `CHANGELOG.md`
- **Semver impact:** minor: a new component and an optional new context injection in `lc-checkbox`; nothing changes without the group. The story fix is docs only.

## Item A: 060-s1 (owner, request 060 review finding 1)

### Need
Story `Data Display/Chip` "Hooks on an Ancestor" sets `--lc-chip-bg: var(--color-info-subtle)`, `--lc-chip-fg: var(--color-on-info-subtle)` on a wrapper inside `lc-hero`. In the dark theme the subtle tint resolves to the page theme over the band, so chip text reaches 4.01 (default), 4.71 (quiet clickable), 4.85 (emphasis) instead of 4.5:1. Component is correct; the story's values are the problem (also noted in CHANGELOG 3.40 as "queued").

### Scope
- In: change the values (and story text) of `HooksOnAnAncestor` so every chip text is at least 4.5:1 in light and dark, in the off-band row and the hero row.
- Not in: any component change, the on-band palette, other chip stories.

## Item B: benutzer-2026-11-12 row 1 (finance-intelligence, spec 014)

### Need
Forms "Benutzer anlegen" and "Rollen ändern" choose one or more roles (Administration, Controlling, CFO) at `lg` on phones (44 px targets) and `md` on desktop, in German. `lc-radio-group` does not fit (roles combine). The kit has no group for `lc-checkbox`: the legend, the one group error and the required marker are missing. The requester wraps a native fieldset and puts `error` on every checkbox and `errorMessage` on the last one; the message is then tied to one checkbox only.

### What the kit has today
- `lc-checkbox` (selector, `size`, `error`, `errorMessage`, `helpText`, `required`, `disabled`, CVA, `checked` model): each box has its own error text; no group concept.
- `lc-radio-group` (`lib/radio/`, with token `RADIO_GROUP` injected by `lc-radio`): the pattern to follow (fieldset, `legend`, `legendHidden`, `helpText`, `error` string, `required`, `requiredIndicator`, `requiredAriaLabel`, `disabled`, `orientation`, hooks through a token context).
- The checkbox story `CheckboxGroup` is only a loose `div` of checkboxes with a `<p>` title (no semantics); it stays or is replaced by a story of the new component (designer decides, keep the story id stable if possible).

### Scope
- In: `lc-checkbox-group` in the existing entry `@lifecorner/angular-ui-kit/checkbox` (no new stub); inputs analogous to `lc-radio-group`: `legend`, `legendHidden`, `helpText`, `error` (string), `required`, `requiredIndicator`, `requiredAriaLabel`, `disabled`, `orientation` (`vertical` | `horizontal`), `size` (passed to children); a group context token that `lc-checkbox` injects optionally (as `lc-radio` does).
- Optional per requester: an array value (`ControlValueAccessor`). Assumption below.
- Not in: any visual change to `lc-checkbox`; select-all; min/max count validation (the consumer sets `error`); a change to `lc-radio-group`.

### Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | Group with three `lc-checkbox` renders one `<fieldset>` whose `<legend>` holds `legend`; the fieldset is the accessible group name | unit test; axe |
| AC-2 | `legendHidden` hides the legend visually, it stays in the accessibility tree | unit test; story |
| AC-3 | `helpText` renders once, linked to the fieldset by `aria-describedby` | unit test |
| AC-4 | With `error` set the message renders exactly once below the group (`role="alert"`, announced once), the fieldset is described by it, and every checkbox inside is invalid (`aria-invalid`, error styling) without rendering its own message | unit test (count of message nodes = 1) |
| AC-5 | Child `errorMessage`/`helpText` of a checkbox still work outside a group and inside a group unchanged | unit test |
| AC-6 | `required` shows `*` after the legend (labelled by `requiredAriaLabel`, off by `requiredIndicator=false`); children are `required` without each showing its own asterisk | unit test; story |
| AC-7 | `disabled` disables the fieldset and every child (native `disabled`, disabled look) | unit test |
| AC-8 | `size` set on the group reaches every child; an explicit `size` on a child wins (assumption). `lg` boxes have a 44 px target | unit test; story at 360 px, measured |
| AC-9 | `orientation` `vertical` (default) stacks, `horizontal` wraps without overflow | story at 360 and 1280 px, measured |
| AC-10 | Keyboard: Tab visits each checkbox in order, Space toggles; focus ring visible; no key trap | unit test; story |
| AC-11 | If the array value is built: `[(value)]` and a form control hold the checked values; toggling emits the new array; `writeValue`, `setDisabledState`, touched work. Both the group value and a checkbox's own `checked` stay consistent | unit test |
| AC-12 | Stories under `Forms/Checkbox` (or the checkbox's category): default (3 roles, German texts), error, required, disabled, horizontal, `lg` at 360 px, `md` at 1280 px, legend hidden; all with German legend/error ("Wählen Sie mindestens eine Rolle.") and no overflow at 360 and 320 px | story shots, light and dark |
| AC-13 | Colours from tokens only; legend, help and error text meet 4.5:1 in light and dark (measured); `forced-colors` shows the fieldset content and the error | contrast measure; forced-colors shot |
| AC-14 | Layout of the group holds in prerendered HTML before JavaScript (fieldset, legend, children in order) | prerender check; add to `EXPECT_IN_HTML` if the compat app uses the group |
| AC-15 | Unchanged defaults: all existing `lc-checkbox` specs and story shots (baseline compare) are identical when no group is present; no change to the public inputs of `lc-checkbox` other than optional additions | existing specs; `--compare` |
| AC-16 | axe has 0 violations on all new stories in both themes | story-shots axe |
| AC-17 | Every input has JSDoc with `@default`, a usage example in the class JSDoc; every argType has `description` and `table.defaultValue`; component appears in both READMEs and the MCP manifest (`npm run test:tools`) | review; tools test |
| AC-18 (item A) | In "Hooks on an Ancestor", chip text is at least 4.5:1 in light and dark for all six chips (off-band and hero), values from tokens, measured with `--measure` at 360 and 1280 px; the story text says that ancestor tokens resolve in the page theme | story-shots measure, both themes |
| AC-19 (item A) | No change under `chip.component.*`; chip specs untouched | `git diff` |

Always covered: 360 px and desktop, light and dark, keyboard and screen reader (AC-1…4, 10), EN and DE (AC-12), prerendered HTML (AC-14), unchanged defaults (AC-15).

## Constraints
- Peer range `^21.0.0 || ^22.0.0` unchanged, no runtime dependency, no API break.
- No look change to `lc-checkbox` (finance-intelligence ADR-0009).

## Assumptions
- Assumption: the group lives in `lib/checkbox/` (like `lc-radio-group` in `lib/radio/`), exported from the existing entry; no new `ng-package.json` stub.
- Assumption: the array value (CVA) is in scope, because the requester's forms bind roles and radio-group has the equivalent; the value is `string[]` of each child's `value`, which needs an optional `value` input on `lc-checkbox` (designer decides the name and the no-group behaviour). If the designer finds it too costly, AC-11 may be dropped with a note in design.md and the consumer keeps per-box `[(checked)]`.
- Assumption: `error` is a string, as on `lc-radio-group` (the requester's "text").
- Assumption: no BACKLOG rows for `checkbox` or the chip story exist (only 060-n4, 060-n5 on chip component behaviour, left out as non-goals of a story-only item).

## Open questions
None.
