# Spec 048: lc-datepicker Label (DE) story description and day button names

- **Status:** ready
- **Type:** bug fix (047-f2) + docs only (047-f1)
- **Affected:** `libs/angular-ui-kit/src/lib/datepicker/datepicker.component.ts` (`dayAriaLabel()`), `datepicker.stories.ts` (*Label (DE)* description, l.260), `datepicker.component.spec.ts`, `CHANGELOG.md`
- **Semver impact:** patch — no API change; one accessible name changes to a form that contains the visible text, one story text is corrected.

## Need

Both items come from the 047 release (follow-ups, no external requester).

- **047-f1:** the *Label (DE)* story description (also served by the MCP `get_component`) says „Leistungsverrechnungsschlüssel ab“ breaks over three lines (63 px) in the 158 px `size="sm"` field at 360 px. Measured: two lines, 42 px.
- **047-f2:** without `locale`, a day button gets `aria-label="Wed Jul 01 2026"` (`toDateString()`) for the visible text "1". For days 1–9 the visible number is not contained in the name ("01"): axe `label-content-name-mismatch`, WCAG 2.5.3 Label in Name (A). Pre-existing; found in the 047 review. Days 10–31 happen to match.

## What the kit has today

- `dayAriaLabel()` (`datepicker.component.ts` l.527): with `locale` it already uses `toLocaleDateString(locale, { weekday:'long', day:'numeric', month:'long', year:'numeric' })`, which contains the visible number ("Mittwoch, 1. Juli 2026"). Only the no-`locale` branch uses `toDateString()`.
- The month grid and the header already fall back to `'en-US'` / built-in English names when `locale` is empty (l.331), so an English `Intl` default is consistent.
- Nothing is missing in the API; no Resolution-only case, because the defect is real.

## Scope

- In: the no-`locale` branch of `dayAriaLabel()` uses the same long `Intl` format with `'en-US'` ("Wednesday, July 1, 2026"); the *Label (DE)* story text states two lines (42 px).
- Not in (non-goals): new inputs; changing the `locale` branch; the open datepicker backlog rows 047-n1 to n4 (different areas: panel gap, panel offset at 360, 200 % text, `ariaLabel` `@default`). Assumption: they are not folded in, since this request touches only `dayAriaLabel()` and a story text, not their code paths. 047-n4 (`ariaLabel` JSDoc `@default`) is the one cheap exception: see the Assumption below.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | Without `locale`, every day button's accessible name contains its visible day number: for 1 July 2026 the name is "Wednesday, July 1, 2026" (not "Wed Jul 01 2026"), for 15 July "Wednesday, July 15, 2026". | Jest: all buttons of a month, `name.includes(String(date.getDate()))`; exact strings for day 1 and 15 |
| AC-2 | Selected day without `locale`: name is the long date plus `, ` + `selectedAriaLabel` ("Wednesday, July 1, 2026, selected"); with a custom `selectedAriaLabel` it is used. | Jest |
| AC-3 | With `locale="de-DE"` the names are unchanged ("Mittwoch, 1. Juli 2026"); `en-US` explicitly set gives the same string as the default. | Jest (existing assertions unchanged) + one new case |
| AC-4 | axe reports no `label-content-name-mismatch` on the open day panel (default and `locale="de-DE"`), light and dark, at 360 and 1280 px. | axe run via `story-shots.mjs --measure` or equivalent on the *Default* and *Label (DE)* stories |
| AC-5 | The long names do not change the layout: day cell size and panel width are identical before and after (the name is not rendered). | `--measure` of panel and cell width at 360 and 1280, compared with 3.30.0 |
| AC-6 | Keyboard and screen reader: day buttons stay focusable with the same order, `aria-current="date"` on today is kept. | Jest (existing) |
| AC-7 | The *Label (DE)* story description says „Leistungsverrechnungsschlüssel ab“ breaks with a hyphen over **two lines (42 px)** in the 158 px fields at 360 px; no other number in the text changes. The number matches a measurement taken in the story at 360 px. | grep of the story text; `--measure` at 360, light |
| AC-8 | Defaults and API unchanged: no input added or removed, no change to existing assertions except any that pinned the `toDateString()` form (state which in `build.md`). | `git diff` of the spec file; full suite green |

Not applicable: prerendered HTML (no layout change; the names appear only in the open overlay).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, `Intl` is built in.
- English only by default; German strings come from `locale`.

## Assumptions

- Assumption: the English default is the long `en-US` form with weekday ("Wednesday, July 1, 2026"), matching the `locale` branch's options, as 047-f2 proposed ("long `Intl` date, English by default").
- Assumption: the current `ariaLabel` JSDoc `@default` gap (047-n4, backlog) is folded in as AC-9 because the `datepicker.component.ts` is touched; delete the row from `requests/BACKLOG.md`.
- Assumption: no consumer pins the old "Wed Jul 01 2026" string; a changelog note under *Changed* tells consumers the accessible names changed.

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-9 (047-n4, 047 review r1 nit 6) | The `ariaLabel` input JSDoc has `@default undefined` (or the repo's convention for an empty default) and the MCP manifest shows it. | `npm run test:tools` / manifest grep |

## Open questions

None.
