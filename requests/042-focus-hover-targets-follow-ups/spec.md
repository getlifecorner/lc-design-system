# Spec 042: Focus indicators, focus over hover, dependency-viewer at 360 px, file-upload remove target

- **Status:** ready
- **Type:** bug fix (F-18, F-19, F-21) + extension of `lc-dependency-viewer` or docs (F-20)
- **Affected:** `src/styles/_reset.scss:174`; every component SCSS with a bare `button`/`[role=button]` and no `:focus-visible` rule (found by sweep, e.g. `lc-tag-input` remove x); field components with `:hover:not(...)` border/background rules (`textarea`, `input`, `number-input`, `search-input`, `select`, `combobox`, `datepicker`, `date-range-picker`, `color-picker`, `chip`, `rich-text-editor` — the designer confirms the list by measuring); `lc-dependency-viewer`; `lc-file-upload` (`.file-upload__file-remove`, scss:119); stories, CHANGELOG
- **Semver impact:** patch — only visual corrections of missing or losing focus indicators and a larger target; no input, output or default changes. Exception: if F-20 needs a new optional input, it becomes **minor** (new input, default renders as before).

## Need

Four open follow-ups of requests 039/040 (owner, 2026-11-03):

- **F-18:** the global `button:focus { outline: none }` removes the browser ring from every button without its own rule (e.g. the `lc-tag-input` remove x). Request 039 fixed three (D-4). Keyboard users get no visible focus.
- **F-19:** `.lc-textarea--outline:hover:not(:disabled):not(:read-only)` (specificity 0,4,0) beats `:focus` (0,2,0), so a focused field under the pointer shows `--color-primary-400` (about 1.89:1 light, derived, not measured). The same pattern probably exists in other fields.
- **F-20:** at 360 px `lc-dependency-viewer` with `autoFit` (fit mode `contain`) scales to about 47 %: node borders draw at 0.71 px, labels at about 5.6 px.
- **F-21:** `.file-upload__file-remove` is 20 px (1.25 rem); the kit minimum is 44 px.

## What the kit has today

- F-18/F-19: 039 added per-component focus rules and `Highlight` forced-colors outlines (039 design §4-§6); the pattern to reuse is there. No kit-wide guarantee exists.
- F-20: `fitMode="fit-width"` and `minNodeSize` (dependency-viewer.component.ts:1580/1590) already keep nodes at a chosen minimum and turn overflow into page scroll. `autoFit` alone (= `contain`) has no floor beyond `MIN_FIT_SCALE`. So a readable 360 px layout may already be available by configuration; the default `autoFit` is what fails.
- F-21: native `<button>` with focus-visible, forced-colors outline, per-file accessible name and locale labels (040 AC) — all must stay.

## Scope

- In: sweep and fix F-18; measure and fix F-19 wherever the pattern exists; F-20 layout at 360 px; F-21 target.
- Not in: redesign of focus style tokens, new components, changing default look at rest or hover, changing the peer range, other 44 px targets found by chance (list them in `design.md` as new follow-ups).

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | Sweep list: `design.md` lists every kit button / `role=button` / link / custom control and states whether it has its own `:focus-visible` rule. None stays without one. | grep + table in design.md |
| AC-2 | Every interactive element has a focus indicator of at least 3:1 against its adjacent colours, light and dark, computed from resolved tokens (values in design.md). | measure script, WCAG formula |
| AC-3 | In forced colors every new or changed focus rule resolves to `Highlight` and never relies on `box-shadow` alone. | scss review + forced-colors story shot |
| AC-4 | Keyboard Tab through each fixed component shows the ring; mouse click does not show a new ring where it did not before (`:focus-visible`). | story shots + unit test where DOM-testable |
| AC-5 | The reset in `_reset.scss` is either kept (each component owns its ring) or narrowed to `:focus:not(:focus-visible)` without regressing any component; the decision is recorded and justified. | design.md + full story-shot comparison |
| AC-6 | F-19: measured border contrast of a focused field with the pointer over it, for every field with the hover pattern, light and dark, is at least 3:1 (the focus colour), and equals the non-hover focused state. | `--measure` with hover forced, table in design.md |
| AC-7 | Hover on a field that is not focused is visually unchanged (hover colour, rest colour, `--filled`, `--error` and disabled/readonly states identical). | screenshot hash compare |
| AC-8 | F-20: at 360 px, in a story with a representative graph, node borders render at >= 1 px and node labels at >= 10 px effective size, with no clipping of the graph (it scrolls in the page or is pannable). Measured as rendered stroke and font size after scale. | story at 360, `--measure` |
| AC-9 | F-20: 1024 and 1280 px renders of existing `autoFit` stories are unchanged; the `autoFit` default is unchanged unless the designer proves a floor is needed and records the new rendering as a Changed note. | shot hash compare |
| AC-10 | F-20: the 360 px solution works in both themes, with EN and DE node labels (long DE label does not overlap), and in prerendered HTML the viewer has its frame height before JavaScript. | story + prerender check |
| AC-11 | F-21: `.file-upload__file-remove` has a hit area of at least 44 x 44 px at 360, 1024, 1280; the visible glyph circle may stay small. File rows keep their height rhythm (no row taller than before by more than needed) and adjacent targets do not overlap. | `--measure` getBoundingClientRect |
| AC-12 | F-21: `:focus-visible` ring, forced-colors outline, per-file accessible name (`aria-label` with file name) and `locale` labels remain, EN and DE. | existing spec passes; unit test for name; DE story |
| AC-13 | No input, output or default changes (except an optional new F-20 input if the designer needs one, with `@default`, JSDoc and story). | API diff, existing specs unchanged |
| AC-14 | axe-core: 0 violations on touched stories, 360 and 1280 px, light and dark. | story-shots axe run |
| AC-15 | Every fixed behaviour has a story at 360 px (focus state forced via play function or class) and a CHANGELOG entry under Fixed naming F-18 to F-21. | stories, CHANGELOG |

Always covered: 360 px and desktop widths · light and dark · keyboard and screen reader · EN and DE · prerendered HTML (AC-10) · unchanged defaults (AC-7, AC-9, AC-13).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Tokens only, no raw colours; BEM; both themes; `prefers-reduced-motion` respected (no new transitions).

## Assumptions

- Assumption: bundled in one release; patch unless F-20 adds an input.
- Assumption: for F-20 the designer first tries existing inputs (`fitMode="fit-width"`, `minNodeSize`) in a documented 360 px story; a change of the `autoFit` default is avoided to keep 3.x consumers (life-os) unchanged.
- Assumption: the hit area for F-21 may be enlarged with a pseudo-element or padding, as long as AC-11 measures 44 px.
- Assumption: the F-19 pattern list above is a guess from grep; the measured list in design.md is authoritative.

## Open questions

None.
