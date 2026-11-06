# Build 054: returnFocusTo, focusContext(), focusItem(), 44 px alert close

- **Branch:** `feat/3.34-focus-return-alert-close` (from `main` c3d20c5)
- **Commit:** see `git log -1` on the branch, `feat(modal,confirm-dialog,header,list,alert): …` (one commit, amended)

## Files changed

| File | Change |
|---|---|
| `modal/modal.component.ts` | input `returnFocusTo` (JSDoc §2, `@default null`); `shown` flag; `hideModal()` → `untracked` read → `afterNextRender` on the `EnvironmentInjector`; custom-element descendant rule (`FOCUSABLE`, unquoted attr values) |
| `confirm-dialog/confirm-dialog.component.{ts,html}`, `confirm.service.ts` | input `returnFocusTo` passed to `lc-modal`; `ConfirmOptions.returnFocusTo` → `setInput` |
| `header/header.component.{ts,html}` | `#contextButton`, `viewChild`, public `focusContext()` (node injector, pending ref replaced) |
| `list/list.component.{ts,html}` | `#listEl`, type `ListItemPart`, public `focusItem(id, part = 'row')` |
| `alert/alert.component.scss` | inside `.lc-alert__close {`: `position: relative` + transparent `&::before` (`inset: min(0px, calc((100% - 44px) / 2))`); r1 (F-1, D-5): `color: inherit` after `border: none` |
| `*.stories.ts` (5) | the 5 stories of design §8; `returnFocusTo` argTypes (modal, confirm); 3.34 lines in the meta descriptions (MCP). r1: alert meta + *Close Target* text "glyph in the text colour" with the values; header *Focus Context* (F-2): `snapshotChoicesFor(month)`, so „Gewählt“ and `selected` follow the choice |
| new specs | `modal.return-focus` (19), `confirm-dialog.return-focus` (10), `header.focus-context` (8), `list.focus-item` (22), `alert.close-target` (6; r1: pins `color: inherit` and that no variant rule sets the × colour; the 3.33.1 sha1 now excludes 3 additions) |

No existing assertion changed. In my own new `alert.close-target` (round 0), only the AC-15 test title dropped "paint" ("hover fill and ring" now), and the sha1 test also removes `color: inherit` before it hashes. The pinned value (6722, `11ed3a6…`) is the same. README/docs: no new component, token or global class.

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1, 2 | `modal.return-focus`: ×, Escape, backdrop, `[(open)]` false, `closeModal()`, `setInput('open', false)`, destroy while open, reopen cycle; `body` active at open |
| 3 | never connected, removed while open (opener kept), disabled target, non-custom unfocusable `div` (no hand-off) |
| 4 | `null` → `body` / opener as 3.33; one `push`, no extra `remove` when the input changes (revert proof: a tracked read fails it); existing modal specs unchanged |
| 5 | measure `focus-build.log`: A + Escape/Speichern/Abbrechen, B + ×/backdrop/Übernehmen at 360 (sheet) and 1280, L/D: 24/24 on the trigger's `<button>` (design baseline: `body`) |
| 6 | WebKit not drivable here (no `playwright` package; the cached `webkit-2370` needs its protocol driver). Stand-ins per spec: unit tests start with `body` active; the Chromium measure opens with `HTMLElement.click()` (no focus = the WebKit tap). **Manual Safari check open** (steps in *Deviations*) |
| 7 | `confirm-dialog.return-focus`: Löschen, Abbrechen, Escape, × + `ConfirmService` with/without the option (revert proof: removing the `setInput` fails 3); measure 16/16 at 360/1280 L/D |
| 8, 9 | `header.focus-context`: inline/below, not synchronous, new `contextName` in name, button created in the same render, no `contextName`, destroyed first, double call = 1 focus; measure `focus-build-header.log`: row choice + Escape, header 1 at 360/641/1280, header 2 at 641/1280: 10/10 on that header's button, `aria-label` „Monatsstand wählen, Monatsstand August 2026 · Fassung 2“ (resp. „Juli …“) |
| 10 | 36/36 header baseline shots identical; the button keeps exactly `aria-label, class, type`; header 2 (`inline`) at 360: `display: none`, `focus()` moves nothing |
| 11, 12 | `list.focus-item`: action, clickable row, href row, sizes sm/md/lg + dividers/badges/selected, horizontal/card, replaced items, duplicates, double call; unknown id, plain/disabled/disabled-href rows, no action, empty, `undefined` items, template controls, destroyed |
| 13 | measure at 360/1280 L/D: Details + Escape/Schließen → action `<button>` (outline 2 px), choice row 3 + Schließen/× → row (inset 2 px `#208497` L / `#84c7d4` D) 16/16; 54/54 list baselines identical |
| 14 | `alert.close-target` (CSS pin) + hit scan `hit-build.log` (5 stories × 320/360/1024/1280): 48/48 × at 44 × 44 (box 28 × 28; 36 × 36 at 200 %) |
| 15 | r1 (D-5): of the 150 alert/error-display/density shots, 84 are identical to `baseline` and 66 differ, exactly the 11 stories with a × (`r2-build.log`); 150/150 equal `r1-ink-proto` (the 66 by `--compare`, `r2-vs-proto.log`; the 84 by hash, since the prototype's 84 equal `baseline` too). Compiled CSS minus the 3 additions = 3.33.1 (6722 chars, sha1 pinned); inline action/link: touching (scan −0.5, the shared half pixel), never covered |
| 16 | 5 stories, ids as §8; new argTypes with description + `defaultValue` |
| 17 | r1: the × glyph takes `--color-text-primary` (D-5), measured in `r2-build.log` with the designer's ink script (no CSS injected), rest / hover: L `#111827` error 13.66 / 9.59, info 14.13 / 10.59, warning 15.95 / 13.94; D `#f1f6f8` warning 13.90 / 9.45, info 15.28 / 12.66, error 16.70 / 15.32 (= `r1-ink-proto`; success, which has no × in these stories, from the designer's `r1-success-probe`). No `rgb(0, 0, 0)` glyph left. FC 6/6 identical to `fc0` (`r2-fc/`). No live region; FC/dark shots of the new stories in `new-fc/`, `new/` |
| 18 | no new built-in strings; `pageOverflow` 0 and `sheetOverflow` 0 in every focus step at 360 |
| 19 | compat 22: 101 checks ok (unchanged count), HTML unchanged |
| 20 | changelog draft below; manifest: `returnFocusTo` inputs from JSDoc, methods via the meta descriptions and the story descriptions |

## Gates

**Round 1:** all gates ran again on the tree of commit `77fa5c752b5584b13fefb4a23e83c72c2438a88b` (later agents skip a gate while `git diff --quiet 77fa5c7 -- libs tools` holds; the amend after it adds only `requests/`). Logs in `tmp/054/`.

| Gate (r1) | Result |
|---|---|
| test | 276 suites, 5968 passed, 8 skipped (+1 test). `--maxWorkers=4`, 23 s: 275 suites, 5940 passed; `datepicker.month` lost to a worker SIGSEGV, alone 28/28 (`test-datepicker-month.log`). The run before lost `alert.close-target` the same way; the alert specs alone 4 suites, 71 tests. `--runInBand` died twice without output |
| lint | 0 errors, 162 warnings (baseline 162) |
| build | 121 of 121 entries (one per `ng-package.json`; round 0's "122" was a miscount) |
| test:tools | tools unchanged |
| build-storybook | 1082 stories (unchanged), built after the lib build |
| story shots | `r2-build/` 150: 84 identical / 66 differ vs `baseline`; `r2-vs-proto/` 66/66 identical vs `r1-ink-proto` (so 150/150); `r2-new/` 12 vs `new/`: *Close Target* 6 differ (glyph), *Focus Context* 6 identical; `r2-fc/` 6/6 = `fc0`; `r2-f2.log` |
| compat 22 | PASS, 101 ok, 0 failed |

Round 0 (938b950, still valid for everything outside the alert × colour and the *Focus Context* story data): Jest 5967 passed (+5 suites, +64 tests), Storybook 1082 (+5); `build-other` 114/114 identical; measures `focus-build.log` 56/56, `focus-build-header.log` 10/10, `hit-build.log` 48/48 at 44 × 44; `new/` 30 shots with axe 0 violations, `new-fc/` 5.

## Deviations from the design

- **AC-6 WebKit:** not run (see AC table). Manual Safari/iOS check for the reviewer or owner: open *Feedback/Modal › Focus return (3.34)* and *Feedback/ConfirmDialog › Focus return (3.34)*, tap the trigger, close with Schließen / Escape (hardware keyboard) / „Abbrechen“; `document.activeElement` must be the trigger's `<button>`.
- Story content not listed in §7, reusing existing story strings: modal bodies „August 2026 · Fassung 1“ / „September 2026 · Fassung 1“; list sheet title „Details“ with the row label as body; alert *Close Target* titles „Monatsstand“, „Laden fehlgeschlagen“, „Lieber direkt?“, „Du hast nur einen Passkey“ (from *With Action*, *Link Action*, *Stacked actions*). The requester's note has no title in the app (app-shell §7), so it appears with and without one.
- Story props `renameOpen`, `chooseTrigger`, `deleteTrigger`, … instead of §8's `t` / `open` (`open` is a modal input).
- The modal measure reports `:focus-visible` true after pointer closes: synthetic `click()` doesn't update Chromium's modality heuristic. Real pointer behaviour is not measurable here.

## Found while building (pre-existing)

The alert × in dark (1.15–1.39:1) is fixed in round 1 (F-1, D-5). The ~90 px message column beside an inline action at 360 px is the 3.2 layout, not touched (F-3 → backlog).

## Round 1 (review F-1, F-2)

| Finding | Change | Measured |
|---|---|---|
| F-1 | `color: inherit` in `.lc-alert__close {`; spec pin; story texts; changelog *Fixed* split into "44 px target" and "visible in dark" | 84 / 66 vs `baseline`, 150/150 = `r1-ink-proto`; *Close Target* 8 × per shot: L `#111827` 14.13 (hover 10.59), D `#f1f6f8` 15.28 (12.66); 6/6 differ from `new/` (the CSS change is the glyph colour only); FC 6/6 = `fc0` |
| F-2 | *Focus Context* rows from `snapshotChoicesFor(month)` | `r2-f2.log` at 360: before September `current` + „Gewählt“; after choosing August the reopened sheet marks August, September plain. Shots 6/6 identical to `new/` |

## Changelog draft

```markdown
## [3.34.0] - 2026-11-06

The focus goes back to the trigger after a dialog, the header's context button and a list row can be focused from outside, and the alert's × is a 44 px target that can also be seen in dark (Finance Intelligence Monatsstand and app shell). No API breaks.

### Added

- **`lc-modal` / `lc-confirm-dialog` `returnFocusTo`** (monatsstand-2026-11-06 row 1, Finance Intelligence „Monatsstand“ and App-Shell 5.3): pass the trigger, e.g. `$event.currentTarget` of an `lc-button` click (the `<lc-button>` host hands the focus to its `<button>`). After ×, Escape, the backdrop, `open` false, `closeModal()`, confirm, „Abbrechen“ or destroying an open dialog, the focus is on it again after the render that removes the dialog. Before, a WebKit tap (Safari, every iOS browser) didn't focus the button, so the focus fell to `body` (WCAG 2.4.3). Measured with a click that doesn't focus (the WebKit case) at 360 px (bottom sheet) and 1280 px, light and dark: 40 of 40 closes land on the trigger (before: `body`). `ConfirmOptions.returnFocusTo` does the same for `ConfirmService`. An element that is no longer in the document or can't take focus is ignored, and the element focused at open keeps it. Default `null`: unchanged. Stories *Focus return (3.34)* (Modal, ConfirmDialog). Your remember-and-refocus on `modalClosed` / `cancelled` can go.
- **`lc-header` `focusContext()`** (row 2, App-Shell 5.3): call it right after a choice in the sheet „Monatsstand wählen“, or when that sheet closes. After the next render the focus is on the context button, and its name already holds the new `contextName` („Monatsstand wählen, Monatsstand August 2026 · Fassung 2“). Measured at 360, 641 and 1280 px with `contextPlacement` `below` and `inline`. It does nothing while the button isn't shown (no `contextName`, or up to 640 px with `inline`). Story *Focus Context (3.34)*. Your `aria-label` lookup can go.
- **`lc-list` `focusItem(id, part = 'row')`** and the type `ListItemPart` (row 3, Monatsstand flow 9): `'action'` focuses the row's „Details“ button, `'row'` the row's button (`clickable`) or link (`href`), after the next render. It works with every `size`, dividers, badges and `selected`. Keyboard focus shows the kit's ring: action outline, row inset 2 px (`#208497` light, `#84c7d4` dark). An unknown `id`, a plain or disabled row, a row without an action, or your own `lcListItem` controls: nothing happens. Story *Focus Item (3.34)*. Your `aria-label` lookup can go.

### Fixed

- **Alert ×: a 44 × 44 px target** (monatsstand-2026-11-06 bug, App-Shell Artboard 20 a): the × of a `dismissible` alert (and of `lc-error-display`) takes taps on 44 × 44 px at 100 % and 200 % text. It was 28 × 28 px. The box (28 × 28 px; 36 × 36 px at 200 %), hover fill, focus ring and the alert's height are unchanged. The area touches the action or link beside the × without covering it. In a compact alert narrower than 16rem it reaches 3 px past the border. Story *Close Target (3.34)*.
- **Alert ×: visible in dark** (018 S2, open since 3.13.1's *Known*): the × glyph had no colour of its own, so it was the browser's button black, 1.15:1 (error), 1.26:1 (info) and 1.39:1 (warning) on the dark tints, and 1.26–2.04:1 on hover (WCAG 1.4.11 needs 3:1). It now takes the alert's text colour (`--color-text-primary`). In all four variants, light: 13.66–16.00:1 at rest, 9.59–13.94:1 on hover (the glyph goes from #000 to #111827); dark: 13.90–16.70:1 at rest, 9.45–15.32:1 on hover. Of 150 alert, error-display and density shots in both themes, the 84 without a × are pixel-identical to 3.33.1, and the 66 with a × differ only in the glyph colour. Forced colours are unchanged (`ButtonText`).

### Compatibility

- No API breaks: the input, the option and both methods are optional, and the defaults render and behave as in 3.33.1. The DOM and the prerendered HTML are unchanged. `.lc-alert__close` is now `position: relative` with a transparent `::before`, and `color: inherit`.

### Known

- `lc-drawer`, `lc-sidenav` and `lc-gallery` restore the focus as before (no `returnFocusTo`): in WebKit their close still leaves `body` focused.
- WebKit itself was not automated for this release. The Chromium measurements use a click that doesn't focus the trigger, as WebKit does.
```
