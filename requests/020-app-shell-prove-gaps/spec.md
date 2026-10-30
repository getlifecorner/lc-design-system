# Spec 020: App shell prove gaps (page spacing, empty state, avatar fallback, outline tone, sidenav theme)

- **Status:** ready
- **Type:** extension of `lc-app-page`, `lc-page-header`, `lc-empty-state`, `lc-avatar`, `lc-button`; bug fix and docs for `lc-sidenav-placeholder` / `lc-sidenav`
- **Affected:** `lib/app-shell/app-page.component.{scss,ts}`, `lib/page-header/`, `lib/empty-state/`, `lib/avatar/`, `lib/button/`, `lib/sidenav/_sidenav-docked.scss`, `lib/sidenav-placeholder/`, stories, CHANGELOG, README lists if inputs are listed
- **Semver impact:** minor. Every new input is optional and its default renders as before (rows 1–6); row 7 only makes a documented use work.

## Need

Finance Intelligence (IT finance controlling) built its app shell (concept `app-shell.md` §5.4, 7, 8) on kit 3.14.0. The UX review of the build at 360 and 1280 px found seven differences from the approved design. Today the app overrides locally or lives with the kit look (column "transition" in the gap file). Problems, not solutions:

| Row | Where | Problem today |
|---|---|---|
| 1 | `lc-app-page` | Page padding-x is 24 px (phone) / 56 px (1280 px). Design: 16 / 32 px, so the page `h1` lines up with the product name in `lc-header`. `--lc-app-page-padding-x` exists but is only in an SCSS comment, and it is one value for all widths. |
| 2 | `lc-page-header` in `lc-app-page` | `h1` sits about 64 px (phone) / about 100 px (desktop) below `lc-header`. Design: 8–16 px. No input or hook controls the top space (page-header has `padding-block` from density; app-page has `--lc-app-page-padding-top`). |
| 3 | `lc-empty-state` | Icon is bare. Design: 48 px circle, `--color-primary-100`, icon `--color-primary-700`. |
| 4 | `lc-empty-state` | Message stays 14 px; little space before the projected action; `size="lg"` only adds space above the icon. |
| 5 | `lc-avatar` | Without a `name` it shows "?" on petrol (user-menu trigger while `/me` returns no name). Design: neutral grey round avatar with a person icon. |
| 6 | `lc-button` | `variant="outline"` has dark text (`--color-text-primary`). Design: text and border in the primary colour. |
| 7 | `lc-sidenav-placeholder` (and `lc-sidenav`) | The JSDoc says "set the `--lc-sidenav-*` hooks on an ancestor". Both components declare the hooks on `:host` (`_sidenav-docked.scss` `host-tokens`), and a declaration on the element beats an inherited value. The requester sees this with `theme="dark"`: the rail renders near-black `#070e15` instead of the app's colour. |

## What the kit has today

- Row 1: `--lc-app-page-padding-x` (works, undocumented, single value; breakpoint defaults 24/32/48/56/72/96). `--lc-app-page-padding-top` exists too.
- Row 2: `--lc-density-padding-md` drives page-header `padding-block`; `size` variants set it. No public hook for the top space only.
- Row 3/4: `size` (`md`/`lg`), `icon`, `message`; no tone, no message scaling.
- Row 5: `color`, `name`, `decorative`; `ɵavatarInitials` returns `?` when empty.
- Row 6: `variant` only; hooks exist for ghost (`--lc-button-ghost-*`), none for outline.
- Row 7: 3.14 (request 019) made `--lc-sidenav-*` set on `lc-sidenav` win over `theme`, through private `--_lc-sidenav-t-*` variables. Ancestor-set values were not covered. Check `sidenav.brand.spec.ts` (~l. 250–295) before changing; it pins this structure.

## Scope

- In: the seven rows above, each with a story and a CHANGELOG entry (gap IDs: none given; cite "finance-intelligence app-shell-prove 1–7").
- Not in: changing any default value; new tokens for brand colours; redesigning `lc-header`; other variants' tones (`tone` only needs to work on `outline`, but the designer may generalise if it costs nothing).

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | A consumer can set the page padding-x to 16 px below 640 px and 32 px from 1024 px using only documented API (hook(s) or input), without `::ng-deep`. The hook(s) are listed in the component JSDoc/story docs with defaults. | story + measure `.lc-app-page__main` padding at 360, 1024, 1280 |
| AC-2 | With that setting, the page `h1` left edge equals the `lc-header` product-name left edge (tolerance 0.5 px) at 360 and 1280 px. | story with `lc-header`, `--measure` |
| AC-3 | Default `lc-app-page` padding is unchanged (24/32/48/56/72/96 px at 360/640/1024/1280/1440/1920). | unit/CSS spec + story measure |
| AC-4 | `lc-page-header` has a documented way to set the space above it (input or hook). Inside `lc-app-page` with transparent `lc-header`, the `h1` can start 8–16 px below the header at 360 and 1280 px, no overrides. The value covers the case where `lc-app-page` top padding also applies. | story + measure of header bottom to `h1` top |
| AC-5 | The `loading`/skeleton variant of `lc-page-header` (if present) uses the same top space as the loaded header. | story + measure, both states equal |
| AC-6 | Default `lc-page-header` spacing is unchanged. | existing specs green + measure |
| AC-7 | `lc-empty-state` has an optional tone input (neutral default = today's look). The primary tone renders the icon in a 48 px circle, background `--color-primary-100`, icon `--color-primary-700`, from tokens only. The icon stays `aria-hidden`. | unit test (class, aria-hidden) + story + measure 48x48 |
| AC-8 | Primary-tone icon contrast against its circle is at least 3:1 in light and dark, computed; in dark the tokens are theme-aware (no raw colours). | computed contrast, both themes |
| AC-9 | An empty state with message and a projected action matches the design at 360 px without overrides: message size and space before the action are scaled (by `size` or a new optional input). The designer fixes the target values from `app-shell.md` §8; the story measures them. Defaults unchanged for existing `size` values. | story at 360 + measure, existing specs green |
| AC-10 | `lc-avatar` without a `name` (and no `src`) can render a person icon on a neutral token background through an optional input (e.g. `fallback="person"`); default still shows "?"/initials as today. | unit test + story |
| AC-11 | The person fallback has an accessible name (from `alt` or a locale/label input, English default, German verified) unless `decorative` is set; the icon glyph itself is `aria-hidden`. With a `name` present, initials render as before. | unit test + screen-reader semantics in spec |
| AC-12 | Neutral avatar background and icon meet 3:1 (UI) in light and dark; `forced-colors` is readable. | computed contrast + forced-colors story/CSS spec |
| AC-13 | `lc-button` `variant="outline"` has an optional primary tone. Text and border come from primary tokens, hover/active/focus/disabled states defined. Text contrast at least 4.5:1, border at least 3:1, in light and dark, default and hover. Default outline unchanged. | computed contrast table in design + story + unit test for the class |
| AC-14 | Row 7: a rail colour (`--lc-sidenav-bg`, and the other documented hooks) set on an **ancestor** shows in both `lc-sidenav` and `lc-sidenav-placeholder` with `theme="dark"` and with `theme="light"`/`auto`. Values set on the element itself still win (019 contract). The two components render the same colour. | story/CSS spec with ancestor + element cases, measure both |
| AC-15 | The JSDoc and the sidenav docs state where to set the hooks, matching AC-14. Default rail colours are unchanged. | read-through + existing `sidenav.brand.spec.ts` / `sidenav.app-shell.spec.ts` updated only where the structure reason is stated |
| AC-16 | New text and layouts hold in German and English lengths; keyboard: nothing new becomes focusable (empty-state icon, avatar icon) and focus rings stay visible; `prefers-reduced-motion` unaffected. | stories with long DE strings at 360 |
| AC-17 | Prerendered HTML before JavaScript shows the new tones, spacing and fallback (classes/static styles), no layout shift. | `check-angular-majors.mjs` or prerender check of one story-like page |
| AC-18 | No API break: existing specs unchanged except AC-15; new inputs optional with `@default` JSDoc; every new input/variant has a story and `argTypes` description. | test run, lint, MCP manifest includes new inputs |

Always covered: 360 px and desktop widths, light and dark, keyboard and screen reader, EN and DE, prerendered HTML, unchanged defaults.

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Row 7 must not break the 019 behaviour (hooks on `lc-sidenav` beat `theme`) or the sidenav/placeholder box parity spec.

## Assumptions

- Assumption: rows 1–2 may be solved by hooks, inputs or both; the designer picks. The requester allows either.
- Assumption: row 1 "per breakpoint" means the consumer can get 16 px phone and 32 px desktop without media queries of their own (an input such as `paddingX: 'default' | 'aligned'` or per-breakpoint hooks). A single global hook alone does not meet AC-1 unless the designer shows a documented per-breakpoint route.
- Assumption: row 7 is both a docs and a code issue: the docs are wrong today for every theme, so the docs are corrected and ancestor-set values are made to work (AC-14). The mechanism is the designer's.
- Assumption: no gap IDs exist; the changelog cites the finance-intelligence gap file name and row numbers.
- Assumption: the design values for row 4 are taken from `app-shell.md` §8 (German); the designer reads that section.

## Open questions

None.

## Resolution

Not applicable: none of the seven is solvable with the current API, except a partial transition for row 1 (`--lc-app-page-padding-x` can be set per breakpoint in the app's own CSS today; the gap asks for a documented, supported route).
