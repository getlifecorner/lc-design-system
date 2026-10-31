# Spec 021: Sources page kit gaps

- **Status:** ready
- **Type:** extension of `lc-table`, `lc-button`; bug fix `lc-progress-bar`, `lc-list`; docs only (toast)
- **Affected:** `table/` (`TableColumn`, scss, stories), `button/` (ts, html, scss, spec, stories), `progress-bar/` (scss, stories), `list/list.component.scss` (+ story), `toast/` (stories/docs), `styles/theme-contrast.spec.ts`, CHANGELOG
- **Semver impact:** minor. New optional `TableColumn.align`; the rest fixes behaviour or docs. Defaults stay as they are (see AC-14).

## Need

The Finance Intelligence sources page (concept `quellen.md` §7, §11) uses `lc-table` from 1280 px, `lc-list` below, one `lc-card` per source with a load button, and a progress bar. Five things fail or are undocumented (gap file rows 1-5):

1. Number columns cannot be right-aligned with tabular figures. The page uses `cellClass`, which only reaches body cells, not the header.
2. `[loading]` on `lc-button` sets the native `disabled`. The button loses focus in some browsers and a screen reader user hears nothing after starting a load.
3. `[indeterminate]` on `lc-progress-bar` is not documented under `prefers-reduced-motion` and `forced-colors`.
4. The call that opens a toast is not documented for page authors.
5. The `success` badge in `lc-list` has about 3.5:1 contrast at 12 px (requester measured #5F7150 on #CDD6C2).

## What the kit has today

| # | Finding in the code | Consequence |
|---|---|---|
| 1 | `TableColumn` (table.component.ts:39) has `cellClass`/`cellStyle` but no alignment. `actionsAlign` exists only for the actions column. | Gap is real. |
| 2 | `button.component.html:4`: `[disabled]="isDisabled()"` where `isDisabled = disabled() \|\| loading()`; `aria-busy` is already set. | Gap is real. A loading button is natively disabled and loses focus. |
| 3 | `progress-bar.component.scss:73-76,105`: the animation runs with no `prefers-reduced-motion` or `forced-colors` rule. The only motion rule is global (`_utilities.scss:124`), and it applies to utility classes only. The fill is a `background-color` (or SVG `stroke` for the circle). | Real bug, not only docs. Under forced colors the `background-color` is overridden and the bar can disappear. Under reduced motion the animation keeps running. |
| 4 | `ToastService.show(ToastConfig)` is exported (`toast.service.ts`). It has a JSDoc example and `toast-outlet.stories.ts` calls it. Options: message, variant, position, duration (default 3000), showCloseButton, action. | Mostly present. Missing: one page-level doc with all options, the need for `<lc-toast-outlet>`, and how it is announced (live region from `toast-outlet.component.html:6`, `ariaLive` on the toast). |
| 5 | `list.component.scss:240`: `--success` uses `--color-success-100` / `--color-success-700`. `lc-badge` success uses `--color-success-subtle` / `--color-on-success-subtle` (badge.component.scss:75-77), which passes (about 4.9:1). | Real bug. Reuse the badge pair for the list. |

## Scope

- In: the five items above.
- Not in (non-goals): new looks. Other list badge variants (`primary`, `warning`, `error`) are only measured (AC-12); they are fixed only if they fail. Row heights of `lc-list` and `lc-accordion` (the requester measures them). `ToastService` API changes. A new `ProgressBar` input.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `TableColumn.align?: 'start' \| 'end'` exists with JSDoc and `@default 'start'`. With `end`, the header `th` and body `td` text is right-aligned (physical right in LTR). | unit test (computed style/class) + story |
| AC-2 | An `end` column uses `font-variant-numeric: tabular-nums` in header and cells. Digits "1111" and "8888" render with equal width. | story + `--measure` of two cell widths |
| AC-3 | The `end` column works with `paginate`, with `actions`, with sorting (sort icon stays beside the label and does not break alignment), and with `cellClass`. | unit tests + story at 360, 1024, 1280 |
| AC-4 | A story "number column" (right-aligned amounts, German-style `1.234,56 €`, long header) shows the header and cells flush on the right. The old story class `lc-table-story__cell--numeric` is replaced by `align`. | story |
| AC-5 | With `loading=true` and the button focused, `document.activeElement` stays on the inner button. The inner button has no `disabled` attribute and has `aria-disabled="true"` and `aria-busy="true"`. | unit test |
| AC-6 | While `loading`, click, Enter and Space do not emit `clicked`, and a form button does not submit. The same holds for `disabled=true` as before (native `disabled` stays for `disabled`). | unit tests |
| AC-7 | A loading button still looks as it does today (spinner, same size and opacity). It shows no hover or active change, and `:focus-visible` shows the normal ring (3:1, light and dark). `disabledReason` still applies while loading. | story + screenshot compare, 360 and 1280, light and dark |
| AC-8 | The docs (JSDoc on `loading` and the story description) say that focus stays under `loading` and the click is ignored. They say that announcing the result is the page's job (use a live region). | JSDoc + MCP manifest text |
| AC-9 | `lc-progress-bar` `[indeterminate]` has a static, visible state under `prefers-reduced-motion: reduce`: no animation, the fill stays visible (for example a full-width or 40 % fill at rest) in the linear and circular variants. | story with emulated media + `--measure` of `animationName` = none and fill width > 0 |
| AC-10 | Under `forced-colors: active`, the track and fill of both variants stay visible and use system colours (`ButtonText`/`Highlight` for the fill, `CanvasText` for the border). Determinate values stay readable. | story with emulated forced colors + screenshot |
| AC-11 | The docs (a story description or an MDX paragraph) describe both cases. The `progress-bar` JSDoc says the bar is decoration and the text is the meaning. Role and `aria-*` are unchanged. | docs + existing spec |
| AC-12 | In `lc-list`, the `success` badge text on its background is at least 4.5:1 in light and dark. The same check is made for `primary`, `warning` and `error`; any value below 4.5:1 is fixed as well and listed in the changelog. The colours come from tokens (preferably the `lc-badge` pair), with no raw colours. | `theme-contrast.spec.ts` extension (computed ratios) |
| AC-13 | A toast doc (MDX or a docs story) shows the `ToastService.show()` call with all `ToastConfig` options and defaults, the one `<lc-toast-outlet>` in the shell, the `action` callback, and the announcement (live region politeness per variant, whether the message is read once). The statements are checked against the code, not guessed. | docs; the screen reader behaviour is read from the template/spec |
| AC-14 | Unchanged defaults: a table without `align`, a button without `loading`, a progress bar without `indeterminate`, and the existing specs pass without any changed assertion. The only list change is the badge contrast. The primary entry and the entry points are unchanged. | existing specs; `npm run test:tools`; compat check |
| AC-15 | The English and German strings (the German story uses long labels) fit at 360 px with no horizontal overflow. 200 % text in the table story does not clip the header. | story at 360 px, `--measure` of scrollWidth |
| AC-16 | The prerendered HTML contains the `align` class on the `th` and `td` before JavaScript, and the `aria-disabled` state of the button. | compat check (`EXPECT_IN_HTML`) or an SSR spec |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Only tokens and system colours; BEM class names (`lc-table__cell--end` or similar is the designer's call).

## Assumptions

- Assumption: the requester's colours (#5F7150 on #CDD6C2) come from `--color-success-700` on `--color-success-100` in light mode. The dark theme is checked in the same test.
- Assumption: for the button, `aria-disabled` plus ignoring clicks is the build, not just docs (the requester accepts either; the build gives the stronger guarantee).
- Assumption: the `disabled` input keeps the native `disabled`; only `loading` changes.
- Assumption: `align` is a column field only; a table-wide default is not needed.
- Assumption: the "static bar under reduced motion" look is for the designer to choose; it must stay visibly "busy or unknown".
- Assumption: item 4 is low priority but cheap, so it ships in the same minor.

## Open questions

None.
