# Spec 052: lc-next-step-card focusTitle(), lc-header contextPlacement, lc-list aria-current, backlog sweep (20 rows)

- **Status:** ready
- **Type:** extension of `lc-next-step-card`, `lc-header`, `lc-list` (3 new public APIs) + bug fixes and docs for the 20 backlog rows
- **Affected:** next-step-card, header, list, table, tag-input, textarea, chat, notification-center, log-viewer, app-shell (story), toast-outlet, datepicker, date-range-picker (shared panel code), combobox, select, sidenav, bottom-nav, tooltip, `internal/overlay`; stories, JSDoc, CHANGELOG
- **Semver impact:** minor. Three optional additions (a method, an input with default `'inline'`, an attribute only when `selected` is true); everything else is a defect fix or docs. No API break.

Bundle of 3 items: **A** finance-intelligence, monatsstand row 1; **B** finance-intelligence, app-shell rows 1–2; **C** owner, 20 backlog rows (taken out of `requests/BACKLOG.md`; the table there is now empty). Owner decision 2026-11-05: all in one run, no size limit; fix defects, a known limit may be resolved as documented with a reason.

## Need

**A** Page "Monatsstand" (finance-intelligence): after Einfrieren / Freigeben / Verwerfen the used action disappears (the result replaces the card), focus falls back to `body` (WCAG 2.4.3). `announce` reads but moves no focus. Their transition: wrapper `div tabindex="-1"` around the card.

**B1** App-shell header at 360 px: the context button is `display: none` up to 640 px, so the phone cannot show or switch the monthly snapshot. Slot `end` does not fit (about 264 px free next to the avatar; a `lg` button needs about 285 px; `md` is 42 px, below 44 px).
**B2** `lc-list` with `selected` only tints the row; a screen reader cannot tell the current choice ("Monatsstand wählen" sheet).

**C** Review leftovers from requests 043–051 (nits and known limits), see the per-row ACs.

## What the kit has today

- `lc-next-step-card`: `announce` (aria-live on the title), `titleTag`; no focus API. `lc-header`: `contextName/Label/AriaLabel/Lines?`, `contextClick`; `.lc-header__context-info` hidden at `max-width: 640px`; `end` slot. `lc-list`: `ListItem.selected` adds only the class; rows are `a` (href), `div role=button` (clickable) or `div role=listitem`.
- Nothing solves A, B1, B2 without a change; the requesters' transitions stay valid until they adopt the release.

## Scope

- In: items A, B1, B2 and all 20 rows below.
- Not in: any look change beyond what an AC names (ADR-0009: A, B1, B2 are function only); new components; peer range; new dependency.

## Acceptance criteria

### A. Item A (monatsstand row 1)

| ID | Criterion | Verified by |
|---|---|---|
| AC-1 | Public method `focusTitle()` on `NextStepCardComponent`: sets `tabindex="-1"` on the title element and focuses it; afterwards `document.activeElement` is the title element (`div`, `h2` and `h3` via `titleTag`). | unit test |
| AC-2 | Without the call the title has no `tabindex` and is not reachable with Tab; the rendered markup and styles are unchanged (same snapshot and `next-step-card.*.spec.ts` unchanged). | unit test, existing specs |
| AC-3 | Works in every `tone`, with and without `announce`, with `blockers` and `meta`; focus ring on the title is visible (`:focus-visible` or programmatic focus shows a 2 px ring, 3:1) in light and dark and does not shift layout. Screen reader reads the title (it is also the region's label). | unit test per tone; story at 360 and 1280 px, light/dark, ring measured |
| AC-4 | A story or documented JSDoc example shows the call after an action replaces the card (`viewChild` + `focusTitle()`); method has JSDoc. | story, MCP manifest contains the method |

### B. Item B (app-shell rows 1–2)

| ID | Criterion | Verified by |
|---|---|---|
| AC-5 | `lc-header` input `contextPlacement: 'inline' \| 'below'` (exported union type `HeaderContextPlacement`), default `'inline'`, JSDoc with `@default`. | unit test, MCP |
| AC-6 | With `'below'` at 360 px: row 1 holds title, `end` slot and avatar; row 2 holds the context button at full header width (within header padding), at least 44 px high, `contextLabel` over `contextName`, named by `contextAriaLabel` (existing name rule, WCAG 2.5.3), emits `contextClick`. Long `contextName` truncates with `title` as today. | story at 360 px (DE text "September 2026 · Fassung 1"), measured height and widths, unit test |
| AC-7 | From 641 px `'below'` renders exactly as `'inline'` (context button inline in the end group). With the default, nothing changes at any width (existing header specs and screenshots unchanged at 360, 641, 1024, 1280). | measurement, specs |
| AC-8 | Header keeps its height rules elsewhere (no second row without `contextName`); works with `theme` light/dark, `forced-colors`, 200 % text without clipping; button keeps focus ring and hover. Prerendered HTML contains the button once (no duplicate for the two placements). | story light/dark, `large-text` spec, prerender check in `EXPECT_IN_HTML` if layout-relevant |
| AC-9 | `lc-list`: `ListItem.selected === true` sets `aria-current="true"` on the row element (button row, link row, plain row); others carry no attribute; `selected: false/undefined` renders no attribute. Look unchanged. | unit tests for all three row kinds, axe spec, story with one selected row |

### C. Backlog rows

Rows marked *fix* are defects; *documented* are known limits resolved by text and a reason.

| ID | Criterion | Verified by |
|---|---|---|
| AC-10 (F-30, table, fix) | Row checkbox centre is within 0.5 px of the row middle (today 2.25–3 px above), all densities; row height unchanged. | story measure, 360/1280 |
| AC-11 (F-32, tag-input, fix) | A long chip text is readable in full: wraps (up to a stated max lines) or, if still truncated, carries `title` with the full text. Chip remove target stays at least 44 px / the 042 rule. DE long tag at 360 px. | story, unit test for `title`, measure |
| AC-12 (043-n7, textarea, fix) | Error message ink in light equals the other fields' (`rgb(157, 14, 14)` or the shared token), at least 4.5:1 on the fill; dark unchanged or checked. | computed style, contrast |
| AC-13 (043-n8, tag-input story, fix) | `form-tag-input--touch-targets` description states the measured values (5 px and 13 px) or the layout matches the stated ones; text and measurement agree. | story description vs measure |
| AC-14 (044-n1, textarea, fix) | Textarea focus shows the same 2 px solid ring as select and datepicker (token-driven), in light, dark and `forced-colors`; focused border/ring at least 3:1. No layout shift. | screenshot, contrast, computed style |
| AC-15 (044-n2, chat, fix) | Pending-chip size label is formatted with the host language (e.g. "240,0 KB" in `de`) via the existing locale/`lang` mechanism or a label input; English default text unchanged; does not wrap in the 256 px chip. | unit test en/de, story at 360 px |
| AC-16 (044-n3, notification-center, log-viewer, fix) | The pressed mark in `forced-colors` is distinguishable from the focus ring by shape (not the same 2 px `Highlight` outline), for filters and level pills; same mark in both components; rich-text-editor's mark is named in design as the reference or aligned. | forced-colors emulation screenshots, pressed vs focused vs both |
| AC-17 (045-n1, app-shell story, fix) | *Wide page* story shows a table that fits the 928 px region at 1280–1920 (no cut „Letzte Aktualisierung“, „Kontostand“ visible at rest) or scrolls inside its own region by design. | story at 1280/1920 measured |
| AC-18 (045-n2, toast-outlet, fix) | In `bottom-*` stacks at 200 % text and 360 px the newest toast (with its close) is within the viewport; the SCSS comment and behaviour agree (newest nearest the edge). Live-level order for assistive tech stays correct. | story at 360, 200 % text, boundingBox |
| AC-19 (047-n1, datepicker and combobox list, fix) | A panel opened above the field has a 4 px gap to the field (not 0), as below; margin is outside the pane. | measure above/below in both components |
| AC-20 (047-n2, datepicker, fix) | *Default* open at 360 with field 16–344: panel left edge is at x 8 (viewport margin respected), not 2. | measure x |
| AC-21 (047-n3, datepicker, fix) | At 200 % text and 360 px the day panel stays inside the 8 px viewport margins on both sides (right edge ≤ 352) and scrolls inside if needed. | measure, story |
| AC-22 (048-n2, datepicker story, fix) | *Label (DE)* story and both sm fields pass German `todayLabel`, `dialogAriaLabel`, month/year nav labels, `selectedAriaLabel` (or `lang="de"` when already supported); no English visible in the open panel. | story screenshot, DOM text check |
| AC-23 (049-n2 combobox, 050-n4 select, fix) | The dropdown is at least as wide as the field (e.g. 328 px under a 328 px field at 360, 400 at 1280; combobox *Panel Language* DE and *Starts with a choice*). A wider content may grow the panel to a stated max. Combobox `min-width: 80px` and select `min-width: 200px` remain only as floor. | measure panel vs field width, 360/1280 |
| AC-24 (049-n3, datepicker, combobox, fix) | A host `lang` change while the panel is open updates the panel texts without reopening. | unit test (change `lang`, panel open) |
| AC-25 (045-n4, app-shell, toast-outlet, documented) | Known limit stays: a `top-*` toast at 360 px covers a title right under the header. Documented in the toast-outlet JSDoc and docs/story with the reason (stacking above content is the purpose) and `bottom-*` as recommendation. Row closed as documented. | JSDoc and story text present |
| AC-26 (050-n5, sidenav, fix) | A badged rail item's accessible description no longer repeats the label ("Agent Runs 3, link, Agent Runs"): `title` equals the full name or is not set for badged items. Tooltip for sighted users stays. Collapsed and expanded rail. | unit test on name/description, screen-reader text |
| AC-27 (050-n6, bottom-nav, fix) | More badge "99+" on a 5-entry bar at 360 px (floating and docked) ends within the bar edge (today 3.6 px / 1.2 px past); JSDoc length statement matches. If not fixable without a look change, designer proposes clamp and JSDoc; reason recorded. | measure 360, floating/docked |
| AC-28 (051-n1, tooltip, fix) | `lcTooltip` on a host with several controls describes the control that has focus: Tab to the second control sets `aria-describedby` on that one, not the first. Single-control hosts and `lc-button` behave as in 3.32.0. | unit test with host of 2 buttons |

### Cross-cutting (apply to every AC that changes rendering)

| ID | Criterion | Verified by |
|---|---|---|
| AC-29 | Every changed rendering checked at 360 and 1280 px (1920 where a page layout), light and dark, EN and DE strings. | story-shots, measurements in `build.md` |
| AC-30 | Keyboard and screen reader: focus visible, names/states as ACs say; `forced-colors` and reduced motion unaffected unless an AC says otherwise. | unit/axe tests |
| AC-31 | Unchanged defaults: no existing spec assertion changes without a reason in `build.md`; new inputs optional; peer range, dependencies and public exports otherwise identical. Every new input/method has JSDoc, a story and an argType description; CHANGELOG lists each gap ID. | full test, lint, build, compat matrix |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- A, B1, B2: function only (ADR-0009), look changes only where the AC says so (AC-6).
- Shared overlay code (`internal/overlay`) changes must keep select, menu, popover, tooltip, datepicker, date-range-picker and combobox specs green.

## Assumptions

- Assumption: `focusTitle()` is a no-op when the title is not rendered; it needs no `preventScroll` option (browser default scroll-into-view is wanted after an action).
- Assumption: `contextPlacement` is also honoured when `contextName` is set only; with an empty name there is no row 2. The header look at ≥ 641 px is untouched, the breakpoint stays 640/641.
- Assumption: `aria-current="true"` (not `"page"`/`"step"`) as requested; the visible "Gewählt" badge stays the consumer's choice.
- Assumption: 045-n2 changes visible order only in stacks that overflow; the live-level-first rule can be kept for the DOM/ARIA order while visual order puts the newest at the edge, designer decides how. This is a behaviour correction of a 3.27.2 rule, still patch-level for the API.
- Assumption: 049-n2/050-n4 widening the panel to the field width is a defect fix (the input `cdkConnectedOverlayMatchWidth` already promises it); consumers with panels sized by CSS hooks keep their hook. Worst case a panel is wider than before, never narrower than the field.
- Assumption: 044-n3 the owner's "fix what is a defect" covers forced colours where the pressed state shares the focus shape (a 1.4.1/2.4.7 distinguishability issue).
- Assumption: 050-n6 may end as clamp plus JSDoc if the fix needs a look change; the designer records the reason in `design.md`.
- Assumption: this bundle is large (about 29 ACs); the designer may group the work by component, and the developer may implement in several commits on one branch, one version.

## Open questions

None.

## Resolution

Not applicable (nothing is already covered). Consumer transitions stay valid until adoption: wrapper `div tabindex="-1"` (A), `subtitle` plus `end` icon button (B1), "Gewählt" badge (B2, stays as the visible mark).
