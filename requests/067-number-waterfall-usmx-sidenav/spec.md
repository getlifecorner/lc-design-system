# Spec 067: lc-number-input without steppers, lc-waterfall-chart long labels, USM X lc-sidenav gaps

- **Status:** ready
- **Type:** extension of `lc-number-input`, `lc-waterfall-chart`, `lc-sidenav` (bundle of 3 items)
- **Affected:** `lib/number-input/`, `lib/waterfall-chart/`, `lib/sidenav/` (ts, html, scss, specs, stories), `lib/internal/navigation` (recursion helpers), `models` (`NavigationItem` only if a field is needed), CHANGELOG, both READMEs if a list changes
- **Semver impact:** minor. Every change is a new optional input, slot, output or CSS hook, or a fix. Two behaviours change for a narrow case and are called out as unchanged-default checks: sidenav Escape (AC-S9) and re-opening of groups (AC-S6). No API break.

## Need

**Item A: finance-intelligence, kosten-2026-11-18 rows 5, 6** (look and defaults unchanged, ADR-0009).

- Row 5: an euro amount that the user types (explaining a variance, up to the remaining amount, e.g. "2.960,00 €") in a bottom sheet at 360 px. `lc-number-input` always draws the "−" and "+" buttons: stepping by 1 is meaningless, and they take width and two 44 px touch targets.
- Row 6: `lc-waterfall-chart` draws each category label centred under its bar at 11 px, without wrapping. Space per bar is (width − 60) / bars: 56 px at 564 px and nine bars, while "Periodisierung" needs about 78 px and "Nicht eingetreten" about 92 px. Labels overlap. Meanwhile the page hides the waterfall above seven bars.

**Item B: usm-x, rows 38–46** (on 3.45.0). Two rails (a petrol work rail with a deep lazily loaded tree, a violet customizing rail) now run on `lc-sidenav`. Gaps remain in brand, nesting, open state, item action, hooks, Escape layering and label rendering. Per row, USM X keeps a workaround (the "Meanwhile" column in `request.md`); the kit closes the gaps.

## What the kit has today

- `lc-number-input`: inputs `min max step suffix locale size valueType …`, no way to hide the steppers (`number-input.component.html`).
- `lc-waterfall-chart`: bar labels are one `<text>` at `labelX/labelY` (`waterfall-chart.component.html:21`), no wrapping, no input; `effectiveAriaLabel` already carries full labels.
- `lc-sidenav` (3.45): default `<ng-content>` sits below the items (`.lc-sidenav__content`), brand is `brandHref` (`<a [href]>`) or a hard-coded `routerLink="/"`, items nest top level → section → group → grandchildren (hand-written per level in the template), `expandedItems` is a public writable signal but no input/model, an effect re-adds the current item's parents whenever `items` change (`activeChildParents`), `itemAction` is `output<NavigationItem>()`, the focus ring uses the private `--_lc-sidenav-t-accent`, section heads and muted items share `--lc-sidenav-section-fg`, icons are `1.25rem`, `@HostListener('document:keydown')` closes on every Escape. Nothing in the kit covers these; no Resolution.

## Scope

- In: items below. Row numbers are USM X's.
- Not in: any change of default look, a new component, a `NavigationItem` break, density-driven brand height as a new default (row 45 is a hook only), a search or area picker widget (the slot only hosts them).

## Acceptance criteria

### Item A: finance-intelligence

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-N1 | New optional `showSteppers` input, default `true`. Without it the DOM and styles equal 3.46.0 (existing specs unchanged and green). | unit test, story diff of existing stories |
| AC-N2 | With `[showSteppers]="false"` no stepper `<button>` renders and the value box fills the field width. Typing, `locale="de-DE"`, `suffix="€"`, clamping on blur, `error` with `aria-describedby`, `helperText`, `invalid`, `disabled` and the forms integration behave as with steppers. ArrowUp/ArrowDown still step (designer may keep; record it). | unit tests |
| AC-N3 | `size="lg"` field is 44 px high, `md` 40, `sm` 32, `xs` 24 without steppers (measured). | story + `--measure` at 360 |
| AC-N4 | Story "Betrag ohne Schrittknöpfe": German label, `locale="de-DE"`, `suffix="€"`, `min 0`, `max 2960`, prefilled "2.960,00"; at 360 and 1280, light and dark. No clipped text. axe passes, focus ring visible (`:focus-visible`), `forced-colors` shows a border. | story, axe, screenshots |
| AC-W1 | A category label wider than its bar's space (measured text width > (width − 60) / bars, minus a small gap) wraps at a space onto at most two lines. A second line still too wide ends with an ellipsis, and the full label is available as an SVG `<title>` child of that `<text>`. A single word too wide for one line is truncated the same way. | unit test (mock text measure), story |
| AC-W2 | Labels that fit render exactly as in 3.46.0: same markup, same chart height, no `<title>` added. Existing specs unchanged. | unit test, DOM diff of existing stories |
| AC-W3 | With nine bars at 564 px, "Periodisierung", "Nicht eingetreten", "Nicht erklärt" stand on at most two lines without overlapping a neighbour (bounding boxes measured). The chart height grows by the second line only when some label wraps. | story "German cause names" + `--measure` getBBox |
| AC-W4 | Wrapping works at 360 px with 5 and 9 bars, and in the prerendered HTML (no `getComputedTextLength`/DOM measurement at SSR: use a deterministic estimate or CSS-free fallback; no hydration mismatch). | prerender check, story at 360 |
| AC-W5 | The default `ariaLabel` still lists the full labels. Wrapped lines are not read twice (`aria-hidden` on the visual text or `<tspan>` inside one `<text>`; designer decides). Optional input (e.g. `wrapLabels`, default `true`) turns wrapping off and restores 3.46.0 drawing. Label contrast ≥ 4.5:1 in both themes. | unit test, axe, contrast |

### Item B: usm-x, `lc-sidenav`

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-S1 (38) | A content slot after the brand and before the items (e.g. `[lcSidenavBrandAfter]` or `select`; designer names it). It scrolls with, or stays above, the items (designer decides) and is also present in the drawer. Without projected content nothing renders (no empty gap). The existing default slot stays below the items. | unit test, story with a picker and a search input at 360 and 1280 |
| AC-S2 (39a) | `brandRoute` input (router link target, default `'/'`): the brand `routerLink` follows it; unset renders as before. | unit test |
| AC-S3 (39b) | A non-link brand: an input (e.g. `brandLink`, default `true`) renders the brand as a non-interactive `<div>` with no tab stop and no link role. Name and subtitle still render. | unit test, story |
| AC-S4 (39c) | The brand tile takes an image (`logoSrc` path already exists; confirm it works in the tile) and a public hook `--lc-sidenav-brand-logo-filter` (default `none`) applied to it, so a logo can be drawn as a white silhouette. Documented in JSDoc and a story with `filter: brightness(0) invert(1)` on a dark rail. | story at both themes |
| AC-S5 (40) | `NavigationItem.children` nest to any depth (tested at 5 levels), rendered by one recursive template. Each level indents, expands and collapses on its own, keeps `aria-expanded`/`aria-controls`, and `childrenLoading` and `expandRequested` work at every level. The 3-level output (top → section → group → grandchild) keeps its current DOM and classes (existing specs unchanged). | unit tests, story "Deep tree", 360 px indent measured: label ≥ 120 px wide at depth 5 |
| AC-S6 (41) | A way to start groups open: a `model` for expanded ids (e.g. `expandedGroups`, two-way; designer names it) that seeds from the input and reports user toggles. `expandedItems` stays public and compatible. Groups re-open for the current item only when the current item changes, not on every `items` update; a group the user folded stays folded after an `items` update (lazy loading). | unit test with an `items` update, story |
| AC-S7 (42) | The `action` button renders at every level, including inside groups and at depth ≥ 3, 44 px target, own accessible name. A new output (e.g. `itemActionClick`) emits `{ item, event, element }` so a menu can be anchored; `itemAction` keeps emitting the item only and fires in the same cases. | unit tests, story with an `lc-menu` anchored at depth 3 |
| AC-S8 (43) | New public hooks, each with a documented default equal to today's value: `--lc-sidenav-focus-ring` (default accent, then `--color-primary-500`; replaces all 8 outline sites), `--lc-sidenav-muted-fg` (muted items; falls back to `--lc-sidenav-section-fg`), `--lc-sidenav-icon-size` (default `1.25rem`), `--lc-sidenav-backdrop` (default today's `#00000080`; the literal moves into a token fallback). Focus ring ≥ 3:1 on the rail background in both themes with the default. | computed styles unit test, contrast, story |
| AC-S9 (44) | The drawer's Escape handler ignores events with `defaultPrevented`, and closes only when the drawer is the topmost layer (no open `lc-modal`, `lc-command-palette` or other overlay above it; designer defines the check, reusing `internal/overlay` if it has a stack). With no other layer open, Escape behaves as before. | unit tests incl. palette open above the drawer |
| AC-S10 (45) | A public hook `--lc-sidenav-brand-height` sets the brand block's height. Default stays today's `logoSize` value (56 px at `md`, no change of look). Density is not made the default. | computed style test |
| AC-S11 (46) | Label template: an optional `ng-template` input/content child (e.g. `labelTemplate`, context `{ $implicit: item, … }`) replaces the plain label at every level. A match-highlight input (e.g. `highlight: string`) wraps case-insensitive matches in `<mark>` with a token-based style that holds contrast ≥ 4.5:1 in both themes and `forced-colors`. A label truncated by ellipsis has a `title` with its full text (no `title` when it fits; designer decides detection, SSR-safe). Without these the markup is unchanged. | unit tests, story with a long German label at 360 px |
| AC-S12 | Common to AC-S1…S11: 360 px (drawer) and 1024/1280 (docked), light and dark, `forced-colors`, `prefers-reduced-motion`, keyboard (Tab order across brand, slot, items; Enter/Space; Escape), screen reader names, EN and DE strings (new built-in texts, if any, through a label input), prerendered HTML contains the slot, the brand and the open groups before JavaScript, existing specs and the compat check green. | stories + `--measure`, compat check |

Always covered: unchanged defaults, no API break, MCP manifest still extracts the new inputs (JSDoc with `@default`).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Waterfall wrapping must not need browser text measurement during prerender.
- Every new input, slot, hook and variant has a story and an argType description with `table.defaultValue`; CHANGELOG entries name USM X rows 38–46 and kosten rows 5, 6.

## Assumptions

- Assumption: `NavigationItem` needs no new field; if the label template or action event does, add it optional.
- Assumption: row 42's event goes into a new output, because changing `itemAction`'s type would break consumers.
- Assumption: row 45 gets a hook only. USM X marked its workaround "Accepted", and a density default would change the look (ADR-0009 spirit).
- Assumption: row 44 "topmost layer" is settled by the designer from existing overlay helpers; `defaultPrevented` alone is the minimum.
- Assumption: row 41's "re-open only on current-item change" is a fix of 3.45 behaviour, not an API break; apps that relied on re-opening after an `items` update with the same current item are not known.
- Assumption: no `requests/BACKLOG.md` row touches `lc-sidenav`, `lc-number-input` or `lc-waterfall-chart`; nothing folded. The bundle has 11 items in 3 components, which is within one design and review.

## Open questions

None.
