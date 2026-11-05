# Review 051: Badge contrast on nav pills and light rail, tooltip on lc-button focus, lc-combobox openOnFocus

## Round 1 — 2026-11-05, commit 989df6c (code = c5badc4, `git diff --quiet c5badc4 989df6c -- libs tools` holds)

Screenshots: `tmp/story-shots/051/` on the developer's Storybook build (not stale). Own runs: `r1-nav/` (current-pill-badges, more-badge, themed-rail-badges; 360/1280 L/D; `r1-nav-measure.js`: badge text vs its composite backdrop, computed per badge), `r1-ttcb/` (keyboard-focus, open-on-focus-off, -de, combobox default; 360/1280 L/D; `r1-ttcb-measure.js`: state sequences), `r1-axe/` (5 new stories, 360 L/D). Reused: developer's `build-nav` + `build-tt-cb` compares (`tmp/051/cmp-*.log`), `tmp/051/m-{bn,sn,fc,tt,cb}.log`. Opened 12 shots.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `r1-nav.log` dark: current warning **5.18** floating / **5.55** docked, success 5.82 (backdrop `393931` / `36342b` / `2a393b` = the bar's badge). 6-variant cycle `m-bn.log`: dark min warning 5.17 / 5.55; light current = non-current, min success 4.85. = design §5 A |
| AC-2 | pass | Non-current at rest dark primary 7.13 F / 7.64 D, warning 5.18 (= current); hover min 4.60 F / 4.93 D (`m-bn`, unchanged). Bottom nav 78/84 shots identical, *More Badge* 6/6 differ (design §8) |
| AC-3 | pass (D-2) | `r1-nav.log`, 360/1280: light rail 4.85–10.98 on the light **and** the dark page, expanded and collapsed; dark rail 5.63–11.49 on both pages; per badge identical across page themes. Boundaries 1.00–2.95, information only (D-2) |
| AC-4 | pass | Nav 199/228 identical; 29 differ = *More Badge* 6 + the 17 of design §8 + *collapsed-rail-badges* 360 L (4 px, Δ ≤ 4, at the drawer close ring, no badge pixel; stable on reshoot) + 5 flakes: *docked* 360 D, *drawer-mode* 1280 D, *dark-theme* 360 D identical on reshoot; *drawer-mode* 360 D and *collapsed-vs-expanded* 360 D byte-equal to main's re-shot (`diff -q` vs `probe-flaky`). `theme-modes.spec` block |
| AC-5 | pass | `r1-ttcb` *Keyboard Focus* 360/1280 L/D, both buttons: focus → 1 tooltip; Escape → 0 and describedby gone; blur + focus → shown again; blur → 0. Delay: `tooltip.focus.spec` |
| AC-6 | pass | While shown: inner `<button aria-describedby="lc-tooltip-1/-2">`, host `null` (focus and hover); *Language* the same (`m-tt`). Plain host, caller ids: spec |
| AC-7 | pass | Gap **8** to the 42 px button (112–154, 274–316; host 124–142) top and bottom, also on hover; *Language* DE tooltip y 126 (button 76–118) |
| AC-8 | pass | `tooltip.directive.spec` / `tooltip.lang.spec` not in the diff; tooltip 24/28 shots identical, *Language* 4/4 = expected; hover show/leave measured |
| AC-9 | pass | JSDoc + `@default true` = design §2 verbatim; argType `boolean`, description, `defaultValue 'true'`. *Default* story: focus/Tab-in open (8 options); after Escape a frame or input click keeps it closed, as before. Combobox 44/44 shots identical |
| AC-10 | pass | Both stories, 4 shots each: on load, refocus, Tab-in → focused, `aria-expanded="false"`, no `aria-controls`, 0 listboxes |
| AC-11 | pass | Frame click, input click, 2nd click (stays open), ArrowDown, typing ("Pro" → 1 option) open; each Escape closes; chip ×/clear/choice: `combobox.open-on-focus.spec` |
| AC-12 | pass | EN + DE (`multiple`), 360/1280 L/D: field 16,43–344,85 focused and closed, error 16,89–344,107 one line, uncovered; the opened list would cover it (covered `true`) |
| AC-13 | pass | No template change (diff has no `.html`); compat 22, 100 HTML checks (`build.md`) |
| AC-14 | pass | No new built-in text; DE tooltip 3 lines, EN 2, x 30–330 at 360 |
| AC-15 | pass | `m-fc` (`--forced-colors`): gradient `none`, Canvas fill, system-colour text and 1 px border (LinkText inside the links, as before); collapsed rails border 0 as before; no motion added |

API vs design §2: `openOnFocus` name, type, default and JSDoc as specified; tooltip class and `tooltipId` JSDoc verbatim; no new hook, type, output or slot. axe 4.14: 0 violations in 10 shots (`r1-axe.log`); 3 `color-contrast` incompletes on the bottom nav are the gradient backdrop, covered by the computed values above.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | nit | `lcTooltip` on a host with two controls (design §6, spec "a host with two controls: on the first one, whichever has focus") | On `focusin`, `aria-describedby` on the focused control when it matches `CONTROL` (hover: first control) | Always the first control, so Tab to the second control describes the first. No regression (before: the non-focusable host); no kit template uses such a host |

Design note: design §8 listed 17 changed sidenav shots; *collapsed-rail-badges* 360 L adds a sub-visible 4 px raster change (Δ ≤ 4). Not a design error.

**Verdict:** approved
