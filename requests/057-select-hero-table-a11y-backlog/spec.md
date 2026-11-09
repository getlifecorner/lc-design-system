# Spec 057: select, hero, table, list, description-list, charts, state-strip, backlog sweep

- **Status:** ready
- **Type:** bundle of 12 items: 4 bug fixes, 4 extensions, 1 token/global fix, 1 docs, 2 story/CSS nits (1 row stays open)
- **Affected:** `lc-select`, `lc-description-list`, `lc-hero` (+ `lc-badge` inside it), `lc-table` (`TableAction`), `lc-list`, `lc-state-strip`, `internal/chart/chart-palette.ts` (13 charts), `lc-card` story; `modal`/`confirm-dialog` only as a backlog row
- **Semver impact:** minor. Every new input is optional with an unchanged default (`size` on `TableAction`, `fill` on `lc-hero`); the rest are fixes. The chart palette change alters default colours of two series (no API change, see Assumption A-4).

BACKLOG rows folded and deleted there: 054-n2 (kept, see B-1), 056-n1, 056-n2. Items are named after requester and gap ID.

## Need

All checked on 3.36.0.

| Group | Page / requester | What fails today |
|---|---|---|
| S1 | finance-intelligence services row 1 (Services toolbar, Quellen) | `lc-select` clear button takes taps on 24 x 24 px; the phone rule is 44 px at `size="lg"` (48 px field) |
| S2 | services row 2 (S19 e2e, S33) | tap on an option leaves `document.activeElement` = `body`: options are `div`s, the press blurs the trigger, `close()` restores focus only when it is inside the panel (`restoreFocusFromPanel`, `select.component.ts:513`) |
| T1 | services row 3 | `lc-table` row action is fixed at `size="xs"` (`table.component.html:193`, ~25 px); between 800 and 1023 px it is below their 44 px rule |
| D1 | regeln row 1 | `lc-description-list` renders no whitespace between `dt`/`dd`/rows: text runs together, axe `label-content-name-mismatch` (2.5.3) fails for a labelled card holding a list |
| H1 | monatsstand row 1 | `.hero__body` has `opacity: .85` (`hero.component.scss:374`); `lc-badge` sm `warning` falls 5.52 to ~4.6:1, `success` 4.85 to 3.98-4.22:1 on the gradient (axe `color-contrast`) |
| H2 | cockpit row 1 | `lc-hero` (host `display:block`, `.hero` without height) cannot fill a grid row beside a taller card; gradient ends early |
| L1 | 056 F-2 | `lc-list` `clickable` + `action`: action button nested in `role="button"` (axe `nested-interactive`, 4.1.2) since 3.3 |
| C1 | 056 F-1 | `CHART_PALETTE`: `--color-success-default` 2.47-2.72:1, `--color-warning-default` 2.05-2.26:1 on light pages in 13 charts (3:1 needed for graphical objects, 1.4.11) |
| SS1 | 056 S-1 | `lc-state-strip` with 30/60 runs: cells 10.92/5.45 px wide, below 24 px (2.5.8); axe `target-size` incomplete on 90 nodes |
| B | BACKLOG | 056-n1 list hyphenation at 360 px; 056-n2 card story without footer; 054-n2 WebKit check |

## What the kit has today

- `lc-search-input` already widens its clear tap area to 44 px with a `::before` (reference pattern for S1). `lc-select` deliberately uses a real 24 px box (axe `target-size` reads the element's own box; request 043); 44 px must not cover the chevron or enlarge the field.
- `lc-stat-trend` has the whitespace fix of request 031 (reference for D1).
- `ButtonSize` exists on `lc-button`; `TableAction` has `variant`, no `size`.
- `.hero__media` and `[hero-footer]` sit outside the 85 % opacity (comment `hero.component.scss:395`); the default slot does not. `.hero` already is a flex column with `.hero__inner { flex: 1 }`.
- `lc-state-strip` has keyboard path (roving tabindex, arrows, Home/End), a hover caption via `pointerenter` and a `<lc-tooltip>`-like caption; no pointer path other than hovering/clicking the narrow cell.
- Nothing already covers any item: no Resolution section.

## Scope

- In: the 12 items below. Out: any new look for hero, table action, select or list; any new component; a new dependency.
- Not in (non-goals): changing the 24 px visible clear button, icon or field size; a recolour in the consumer; changing `error` badge or other palette entries beyond what C1 measures; automating WebKit (B-1).

## Acceptance criteria

### finance-intelligence services row 1 (S1)

| ID | Criterion | Verified by |
|---|---|---|
| AC-1 | With `size="lg"` and a value, a tap/click anywhere in a 44 x 44 px area centred on the clear button clears the value; the area does not overlap the chevron's tap area (measured rects) | unit test + story at 360 px, `--measure` rects |
| AC-2 | Other sizes (`xs`,`sm`,`md`) and the no-value state: DOM, box sizes and hit areas identical to 3.36.0; `lg` visible button stays 24 px, field and layout unchanged (before/after screenshot hash, 360 and 1280, light and dark) | story shots `--compare` |
| AC-3 | axe `target-size` passes for the lg select with a value (button's own box stays >= 24 px); focus ring unchanged; forced-colors shows no extra outline from the enlarged area | axe in story at 360 px |
| AC-4 | Clear still sets the default back, uses `clearAriaLabel` (EN default, DE verified), keyboard clear unchanged | existing + new spec |

### finance-intelligence services row 2 (S2)

| ID | Criterion | Verified by |
|---|---|---|
| AC-5 | Single select: pointer/touch tap on an option closes the panel and `document.activeElement` is the trigger (Chromium; WebKit see B-1 note) | Jest + story play test |
| AC-6 | `Escape` returns focus to the trigger also when focus is on `body`; keyboard choice, search input focus and tab-away behave as in 3.36.0 | spec |
| AC-7 | Click on the backdrop outside keeps today's behaviour (focus not forced to the trigger); multi-select keeps the panel open and focus unchanged | spec |
| AC-8 | `closed`/`selectionChange` emission order and counts unchanged; no `mousedown` default prevention that breaks text selection in the search field | spec |

### finance-intelligence services row 3 (T1)

| ID | Criterion | Verified by |
|---|---|---|
| AC-9 | Optional `TableAction.size?: ButtonSize` (JSDoc with `@default 'xs'`); `'sm'` and `'lg'` render the `lc-button` at that kit size with text and icon as today; icon size follows the button size sensibly | unit test + story "Action sizes" (sm and lg) at 360 and 1024, measured heights (lg >= 44 px) |
| AC-10 | Without `size`, markup and heights are identical to 3.36.0; row-click isolation and `ariaLabel` function unchanged | existing specs, shot compare |

### finance-intelligence regeln row 1 (D1)

| ID | Criterion | Verified by |
|---|---|---|
| AC-11 | `textContent` of a list reads "Term Value Term Value" with single spaces (also with badge, `valueSuffix`, `total` prefix, `clickable`, `href`) | unit test |
| AC-12 | A clickable `lc-card` with `ariaLabel` equal to its visible text and a list inside passes axe `label-content-name-mismatch` | axe spec |
| AC-13 | Look unchanged: before/after shots identical at 360 and 1280, light/dark; the whitespace does not become a flex/grid item and the leader dots stay in place | shot compare |

### finance-intelligence monatsstand row 1 (H1)

| ID | Criterion | Verified by |
|---|---|---|
| AC-14 | Every `lc-badge` variant at `size="sm"` (and `xs`) in the default slot meets 4.5:1 on every hero colour's gradient (both ends, all 9 colours, rounded and not) | computed contrast over tokens, in spec |
| AC-15 | Body text stays softened (visually as today, still >= 4.5:1), but components in the slot are not dimmed; axe `color-contrast` passes in a story with badges in the hero | story axe + `--measure` |
| AC-16 | Default look of a hero with plain text unchanged (colour compare); no change to `hero-media`/`hero-footer` | shot compare |

### finance-intelligence cockpit row 1 (H2)

| ID | Criterion | Verified by |
|---|---|---|
| AC-17 | Optional `fill` input (boolean, JSDoc `@default false`; name is a recommendation, the designer may rename): in a grid row with `align-items: stretch` and a taller sibling, the hero ends exactly at the row's bottom edge (rect diff 0 px) for every size and colour at 360, 1024, 1280 | story "Fill" + `--measure` |
| AC-18 | With `fill`, content stays at the top and `[hero-footer]` sits at the bottom; without `fill` height is as today | story + shot compare |

### 056 follow-ups

| ID | Criterion | Verified by |
|---|---|---|
| AC-19 | L1: `clickable` row with `action` has no interactive element nested in `role="button"`: axe `nested-interactive` passes; the row stays one Tab stop with Enter/Space activation, the action stays a reachable, named button with its own click not activating the row; names and visible look unchanged | axe spec + keyboard spec + shot compare |
| AC-20 | C1: every `CHART_PALETTE` entry meets 3:1 against `--color-surface`/page background in light, and dark; series stay distinguishable (not by colour alone: existing legend/label behaviour unchanged) | computed contrast test over the 8 entries x 2 themes; story shots of the 13 charts |
| AC-21 | SS1: `segments` JSDoc and the story document the target-size limit for dense strips (30/60 runs) and name the pointer path; dense strips offer a pointer path that does not need a 24 px cell (e.g. pointer position on the strip picks the nearest run, or a tooltip/caption that is reachable by pointer), and the 90 axe incomplete nodes are resolved or justified (exempt via the inline/equivalent control rule) | story at 360 px, axe result recorded |
| AC-22 | SS1: strips with few runs, keyboard grid behaviour, caption and aria semantics unchanged | existing spec |

### Backlog sweep

| ID | Criterion | Verified by |
|---|---|---|
| AC-23 | 056-n1: the `lc-list` label hyphenates German compounds (`hyphens: auto`, `lang` from the page) in sm and md at 360 px with and without chevron: no mid-word break without a hyphen in "USM-Leistungsverrechnung"; no change in EN | story DE at 360 px |
| AC-24 | 056-n2: one closed card of the *Collapsible* story has a `[card-footer]`; the story shows the footer hidden when closed and visible when open | story + screenshot |
| AC-25 | 054-n2 (WebKit): checked only if WebKit/Safari is available in the run; otherwise the row stays in `requests/BACKLOG.md` (re-added by the release-manager) and `release.md` says so. Not a blocker for the release | build.md note |

Always covered where relevant: 360 px and 1024/1280 px; light and dark; keyboard and screen reader; EN and DE; prerendered HTML before JavaScript (D1 whitespace in prerendered output, H2/T1 layout); unchanged defaults. Add the new strings/expectations to `EXPECT_IN_HTML` only if the designer adds markup that layout depends on.

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break. New CSS hooks (if any) named `--lc-<component>-<property>` with documented default.
- Update CHANGELOG, component READMEs not needed unless inputs are listed; MCP manifest picks up JSDoc.

## Assumptions

- A-1: The `lg` clear target is made with a pseudo-element or equivalent that does not change layout; the chevron's area keeps priority where they overlap (designer chooses the mechanism).
- A-2: S2 applies to the single select (and to `Escape` for all); multi-select keeps focus where it is.
- A-3: H1 is fixed in the kit for all slotted components (not by a badge-only appearance), because other components in the slot have the same problem; the body text look is kept via a colour, not `opacity`.
- A-4: C1 fixes the palette by choosing darker existing tokens for entries 3 and 4 (e.g. the `-dark` variants), accepting a small default colour change in 13 charts. Tokens may differ per theme; if the designer finds the chart look must stay, a decision for the owner is not needed (still minor).
- A-5: L1 fixes the nesting by markup (action as a sibling of the row's button, same visual layout); no new input.
- A-6: SS1 is not a new component or input unless the designer needs one; hover/click on cells stays.
- A-7: The WebKit check (054-n2) is not possible here (no Playwright/WebKit installed, per owner); the row stays in the backlog.

## Open questions

None for the owner.

## Resolution

Not applicable: nothing is covered by the kit today.
