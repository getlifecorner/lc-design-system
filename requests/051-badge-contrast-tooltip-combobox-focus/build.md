# Build 051: Badge contrast on nav pills and light rail, tooltip on lc-button focus, lc-combobox openOnFocus

- **Branch:** `feat/3.32-badge-contrast-tooltip-combobox-focus`
- **Commit:** see `git log -1` on the branch, `feat(bottom-nav,sidenav,tooltip,combobox): …` (one commit, amended)

## Files changed

| File | Change |
|---|---|
| `bottom-nav/bottom-nav.component.scss` | Current-pill badge rule: gradient of `--lc-badge-bg` over `var(--lc-bottom-nav-bg, var(--_bg))` on the inner `.lc-badge` (design §1 A, D-1) |
| `styles/_theme-light.scss`, `_theme-dark.scss` | `.lc-sidenav-container--light/--dark .lc-sidenav__nav-badge { @include -…-theme-colors }` after the header rules (§1 B, D-3) |
| `tooltip/tooltip.directive.ts` | `focusin`/`focusout` listeners (target ≠ host, relatedTarget check, D-4); control (`CONTROL` selector) and anchor (only element child) resolved at every show, `setOrigin()`; describedby on the remembered control; JSDoc of class and `tooltipId` (§2, §6) |
| `combobox/combobox.component.ts` | Input `openOnFocus` (default `true`, JSDoc `@default true`); `onInputFocus` gated; frame `(click)` opens with `false` (input or frame, not chip ×/clear; D-5). Template unchanged |
| `*.stories.ts` (4) | *Badges on the Current Pill*, *Themed Rail Badges*, *Keyboard Focus*, *Open on focus off*, *Open on focus off (DE)*; argType `openOnFocus` |
| `styles/theme-modes.spec.ts` | New describe block (4 tests), existing blocks untouched |
| `bottom-nav.current-badge.spec.ts`, `tooltip.focus.spec.ts`, `combobox.open-on-focus.spec.ts` | New (6 + 19 + 22 tests) |

No existing assertion changed. No new token, entry, dependency or built-in text; READMEs and mdx unchanged (no new component, token or global class).

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | `bottom-nav.current-badge.spec` (compiled rule; matches the current badge only). `m-bn.log` (360, 6 variants): dark current pill def 9.28 · pri 7.13 · suc 5.82 · **war 5.17** · err 7.94 · inf 8.42 floating, **war 5.55** docked (= design §5 A "after"); light min suc 4.85, current = non-current |
| AC-2 | Same spec (only rule reaching `.lc-badge`, never off the current item). Non-current rest = bar values; hover dark min war 4.60 floating / 4.93 docked (unchanged). Bottom nav 78/84 shots identical, only *More Badge* 6/6 differs |
| AC-3 | `theme-modes.spec` (172 colour tokens = the theme root's). `m-sn.log` (360/1280, both pages, rest/hover/active, expanded + collapsed, 6 variants): text min **4.85** (light rail, success), dark rail min 5.63 (current warning); dark page = light page. Boundaries 1.00–2.95 (information, D-2) |
| AC-4 | Same block (values equal to the root's); nav compare: only the 17 shots design §8 lists differ |
| AC-5 | `tooltip.focus.spec` (focus shows, with delay; focusout hides; Escape hides; Tab back shows; within-host move keeps). `m-tt.log`: shown on focus, gone after Escape |
| AC-6 | `tooltip.focus.spec` (inner `<button>` only, never the host; `ariaDescribedBy` ids kept/restored; plain host as before; field host → input). `m-tt.log`: `onBtn` = tooltip id, `onHost` null |
| AC-7 | `tooltip.focus.spec` (`setOrigin` = inner button / host). `m-tt.log` Keyboard Focus 360/1280 L/D: gap **8.0** top and bottom (button 42 px, host 18 px); Language DE tooltip top y **126** (button 76–118) |
| AC-8 | `tooltip.directive.spec` and `tooltip.lang.spec` unchanged and green; plain host runs `show`/`hide` once per focus/blur (D-4 tests) |
| AC-9 | `combobox.open-on-focus.spec` (default `true`; `true` renders like unset; opens on focus); all combobox specs unchanged; 44/44 combobox shots hash-identical; argType with description + `table.defaultValue` |
| AC-10 | Spec: `focus()` → `aria-expanded="false"`, no `aria-controls`, no listbox (single and multiple) |
| AC-11 | Spec: click on unfocused/focused input, frame click, typing, ArrowDown, multiple → open; second click keeps open; blur + focus → closed; Escape, click/Enter choice, clear, chip × as before; disabled → nothing |
| AC-12 | `m-cb.log` both stories, 360/1280 L/D: on load focused, `"false"`, 0 listboxes, error y 89–107 (1 line) not covered; click → 1 listbox; Escape → 0; ArrowDown → 1; refocus → 0 |
| AC-13 | Template unchanged (D-5); compat 22 green, 100 HTML checks |
| AC-14 | No new built-in text. `m-tt.log`: EN 2 lines, DE 3 lines, both x 30–330 at 360 (inside) |
| AC-15 | `m-fc.log` (`--forced-colors`, 360 L/D): every badge `background-image: none`, fill Canvas, text CanvasText, 1 px CanvasText border (bars, expanded rails); collapsed-rail badges no border, as before (`border: 0` there). No new motion |

## Gates

All gates ran on commit `c5badc4410e2ec88a99ecaad69e3d648bcc5742d` (later agents skip a gate while `git diff --quiet c5badc4 -- libs tools` holds). The amend that added this file changed nothing under `libs/` or `tools/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 255 suites, 5802 passed, 8 skipped (was 252 / 5751) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | 122 entries built |
| `npm run test:tools` | 22 / 22 (tools unchanged; run for the story manifest) |
| `npx nx run angular-ui-kit:build-storybook` | 1067 stories (+5) |
| Story screenshots | New: `tmp/story-shots/051/build-new/` (5 stories × 360/1024/1280 × L/D). Compare vs `051/baseline`: tooltip + combobox 68 identical, 4 different = *Language* 4/4 (expected); nav (38 stories × 360/1024/1280 × L/D) 199 identical, 29 different = bottom-nav *More Badge* 6/6 + the 17 sidenav shots of design §8 + 6 noise: `docked` 360 D, `drawer-mode` 1280 D, `dark-theme` 360 D identical on re-shoot; `drawer-mode` 360 D and `collapsed-vs-expanded` 360 D hash-equal to the designer's re-shot of main (`probe-flaky`); `collapsed-rail-badges` 360 L 4 px Δ ≤ 4 at the drawer close ring (x 220–232, y 12–27), no badge pixel. Other widths of that story hash-equal to the prototype (`proto-cmp`). Measures: `m-tt`, `m-cb`, `m-bn`, `m-sn`, `m-fc` (`tmp/051/m-*.log`) |
| `node tools/compat/check-angular-majors.mjs --only=22` | install, build+prerender ok; 100 HTML checks ok |

## Deviations from the design

None. Notes: (1) the Language story's English button (flex row, host = button) falls back to the right side at x 32 (centred 199 px tooltip would start at −32); pre-existing, its tooltip isn't shown in that story. (2) The CDK's geometry doesn't resolve in jsdom, so AC-7's gap is measured in the story; the unit tests pin the origin through `setOrigin`.

## Changelog draft

## [3.32.0] - 2026-11-xx

Badges that keep their contrast on the current bottom-nav pill and on themed sidenav rails, tooltips on keyboard focus of `lc-button`, and a combobox that can stay closed on focus (Finance Intelligence master data, follow-ups 050-f1 … f3). No API breaks.

### Added

- **`lc-combobox` `openOnFocus`** (stammdaten-2026-11-05 row 3, Finance Intelligence master data page on the phone): with `[openOnFocus]="false"`, focus alone (`focus()` from your form on open, or into the first invalid field after a 422, or Tab) leaves the list closed: `aria-expanded="false"`, no listbox, so it no longer covers the field's error text (measured at 360 px: error at y 89, uncovered). A click or tap on the field, typing or ArrowDown opens it; Escape and choosing work as before. Default `true`: unchanged. Stories *Open on focus off*, *Open on focus off (DE)*.

### Fixed

- **`lcTooltip` on `lc-button`** (050-f3, WCAG 1.4.13, 1.3.1): the tooltip now also shows when focus lands on an element inside the host (Tab to `lc-button`), hides on Escape or when focus leaves, puts `aria-describedby` on the focused inner `<button>` (your `ariaDescribedBy` ids are kept) instead of the host, and anchors to the button: 8 px above or below its 42 px box (it started 4 px over it). Story *Keyboard Focus*.
- **`lc-bottom-nav` badge on the current pill** (050-f1, WCAG 1.4.3): in dark, warning text measured 4.03:1 floating and 4.26:1 docked, success 4.49:1; the badge now has the bar colour under its fill and reads like a badge on the bar (lowest: warning 5.17:1 floating, 5.55:1 docked). Light unchanged (lowest 4.85:1). Story *Badges on the Current Pill*.
- **`lc-sidenav theme="light"` / `"dark"` badges** (050-f2, WCAG 1.4.3): the badges took the page's palette (1.11–1.96:1 on a light rail on a dark page); they now take the rail's, as on a page of that theme (light rail 4.85–10.97:1, dark rail lowest 5.63:1). Story *Themed Rail Badges*.

### Compatibility

- No API breaks; `openOnFocus` is optional. A tooltip on a wrapper now also shows on keyboard focus inside it, describes the wrapped control, and anchors to it when it is the wrapper's only child: on an `lc-button` in text or a block (an 18 px inline host), top and bottom tooltips move 12 px outwards; in flex rows nothing moves. A themed rail's badges, like a themed header's content, no longer follow root-level token overrides. Your `--lc-bottom-nav-bg` now also paints under the current pill's badge. Combobox markup and prerendered HTML unchanged; the global stylesheet grows by about 231 B gzip.
