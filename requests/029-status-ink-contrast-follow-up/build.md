# Build 029: Status ink contrast follow-up of 027 and the money Number Column caveat

- **Branch:** `fix/3.21.1-status-ink-contrast` (from `main` ee0cde3)
- **Commit:** `git log -1` on the branch (`fix(status-inks): status foregrounds in the inks …`), amended in round 2 (review finding 1)

## Files changed (under `libs/angular-ui-kit/src/`; values as design §2, selectors and specificity unchanged)

| File | Change |
|---|---|
| `lib/notification-center/…scss` | type icons → `--color-on-<v>-subtle`, 4 hex fallbacks gone; priority high/urgent: background `--color-<v>-subtle`, text ink (D-1) |
| `lib/card/card.component.scss` | `.card__badge--success/warning/error`: background `--color-<v>-subtle`, text ink (D-1) |
| `lib/markdown/…scss`, `lib/status-dot/…scss`, `lib/rating/…scss`, `lib/file-upload/…scss` | mermaid error, dots done/wait/blocked, filled + half star, × on hover → ink |
| `lib/pipeline/…scss` | warning/error node border + glyph → ink; complete glyph `var(--color-surface)` (D-4) |
| `lib/log-viewer/…scss` | level info/warn/error and pill error/warn → ink; pill `opacity` removed, `--active` = `inset 0 0 0 1px currentColor`, `transition: box-shadow`; forced-colours outline 2 px `Highlight`, offset 1 (D-2). **r2:** the dead nested terminal block → `.lc-log-viewer--terminal .lc-log-viewer__line--<lv> &` (0,3,0): debug `#9399b2` (was `#6c7086`), info `#89b4fa`, warn `#f9e2af`, error `#f38ba8` |
| `lib/diff-viewer/…scss` | stats and `+`/`−` prefixes → ink (D-3) |
| `lib/dependency-viewer/…{ts,html,scss}` | `RELATION_STYLES` blocks/references/requires/implements, 4 arrow markers, `STATUS_COLORS` borders, detail dots → ink; `#3b82f6` fallbacks gone |
| `lib/kanban-board/…{ts,scss}` | `getPriorityColor()` and the over-limit count → ink |
| `lib/progress-bar/…scss` | `$progress-colors` success/warning/error/info → `var(--color-on-<v>-subtle)` (linear + circular); primary/secondary raw |
| `lib/money/money.stories.ts` | Number Column description: the §7 sentence appended (AC-12) |
| `docs/colors.mdx` | "Ink on the status tints": the §7 3.21.1 sentence |
| `styles/theme-contrast.spec.ts` | new block "Component pairings of 3.21.1 (request 029)", 55 tests (r2: +2 terminal-level tests, design §9 r1) |
| `lib/log-viewer/log-viewer.component.spec.ts` | l. 490/492 `--color-info-default`/`--color-error-default` → `--color-on-info-subtle`/`--color-on-error-subtle` (design §9 AC-14: the level ink moved by AC-9; l. 491 still holds via the search highlight) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1–10 | spec: 41 rule checks on the compiled SCSS (exact `var(--color-on-<v>-subtle)` / `var(--color-<v>-subtle)` per §2 rule); minima over the §5 bases per palette: text **4.85 L / 4.60 D** (≥ 4.5), graphics **3.52 L / 4.83 D** (≥ 3), pipeline complete glyph 4.36 / 9.12, F-1 known 5.52 / 3.67. Story values: the review r1 AC table (`review.md`, finding 2: NC high D **4.97** at 1280 on the panel gradient, kanban priority 5.29–12.58 / 7.65–10.64, half star 6.02 / 8.34); my r1 measure `tmp/029/measure/ink.mjs` read 5.55, 17.73 / 15.85 and 4 full stars there (backdrop without the gradient, text instead of icon, `click()` with `detail: 0`) |
| AC-9 (r2) | spec: the 4 terminal rules exist exactly as `.lc-log-viewer--terminal .lc-log-viewer__line--<lv> .lc-log-viewer__level { color: <hex> }`, no `.lc-log-viewer__line--<lv> .lc-log-viewer--terminal` shape left; ratios on `#1e1e2e` and the warn/error line tints floor to **5.81 / 7.78 / 11.43 / 6.19**. Story measure `tmp/029/measure/levels.mjs` (`tmp/029/r2-shots.log`), 7 stories × 3 widths × L/D: terminal (terminal, with-ansi-colors, large-buffer) debug/info/warn/error **5.81 / 7.78 / 11.43 / 6.19** in L and D, fg `147,153,178` · `137,180,250` · `249,226,175` · `243,139,168`; streaming (4 info lines after 1.5 s) 7.78; log variant (default, errors-only, flex-parent) unchanged: 10.15 / 5.50 / 10.07 L, 10.64 / 6.26 / 8.52 D; pills at rest 5.25 / 8.95 L, 5.55 / 8.37 D, terminal 9.56 / 6.07, opacity 1; pressed probe: `aria-pressed=true`, ring `rgb(107, 9, 9) 0px 0px 0px 1px inset` (L) / `rgb(247, 161, 161) …` (D) / `rgb(243, 139, 168) …` (terminal) |
| AC-4 | spec: no `#3b82f6/#22c55e/#f59e0b/#ef4444` in the compiled NC sheet; no `-default` status token or `#3b82f6` in kanban ts, dependency ts/html |
| AC-11 | `git diff main -- _theme-*.scss tokens.json src/styles/tokens`: empty; `theme-contrast.spec.ts` green |
| AC-12 | sentence in `money.stories.ts`; `test:tools` 22 passed; Number Column 6/6 shots identical |
| AC-13 | `--forced-colors` measure `tmp/029/forced.log` (6 stories, 360 L/D): pressed pill `solid 2px Highlight 1px`, others none; progress fill `Highlight`; `forced-color-adjust: none` only on the existing `progress-bar__fill`; no `forced-color-adjust` added in the diff |
| AC-14 | full Jest; compat 22; no input/output/selector/hook change |
| AC-15 | see Story screenshots |
| AC-16 | changelog draft below |

## Gates

Round 2 gates ran on the tree of commit `0c1e511` (libs and tools; the final amend adds only `requests/029-…`). Later agents skip a gate while `git diff --quiet 0c1e511 -- libs tools` holds. r2 changed only `log-viewer.component.scss` and `theme-contrast.spec.ts` against r1's `891cb2a`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | r2: 210 suites, **4847 passed**, 8 skipped (+2 terminal tests; r1 4845, was 4792), `--maxWorkers=2` (`tmp/029/r2-test.log`) |
| `npx nx run angular-ui-kit:lint` | r2: 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | r2: 122 "Built" lines |
| `npm run test:tools` | r1: 22 passed; not rerun (no story or `tools/` change in r2) |
| `npx nx run angular-ui-kit:build-storybook` | r2: 968 stories |
| Story screenshots r1 | 90 baseline stories × 360/1024/1280 × L/D `--full` vs `tmp/story-shots/029/baseline` (`tmp/029/build-{a,b,c}.log`, shots `tmp/story-shots/029/build`): **265 different / 275 identical**, as design §9 AC-15 (r1). vs the prototype `proto`: 497 identical; 42 = log-viewer timestamps, 1 = prototype flake (NC all-read 1024 L) |
| Story screenshots r2 | the 7 log-viewer stories × 360/1024/1280 × L/D `--full`, shots `tmp/story-shots/029/r2`: 42 different vs `build` (timestamps; terminal levels), values in AC-9 (r2). The other 83 stories: their CSS is unchanged since r1 (review r2 scope) |
| `check-angular-majors.mjs --only=22` | r1: 86 HTML checks ok; not rerun (`lc-log-viewer` is on no compat page, and r2 changed only its stylesheet) |

## Deviations from the design

None open. r1's AC-15 count (265 / 275 instead of 271 / 269: Streaming shows no line at shot time) was accepted in review r1; design §9 now says 265 / 275.

**Observation for the designer (no code change, outside §2/§5):** debug lines keep `opacity: 0.6` on the whole line, so the debug level's effective contrast is lower than its colour's: terminal `#9399b2` 5.81 → **2.97** with the opacity, log variant 5.83 → 2.53 L, 6.70 → 3.25 D (`eff` in `tmp/029/r2-shots.log`). Unchanged by 029; a follow-up candidate if debug text should reach 4.5:1.

## Changelog draft

### Fixed

- **Status colours as text, icons and fills now reach WCAG 2.2 AA in both themes** (follow-up of 3.20, request 027 design §5): the status foreground of twelve components uses its ink `--color-on-<status>-subtle` instead of the fill `--color-<status>` or `--color-<status>-default`, as the toast and alert icons since 3.20. Old → new on the element's real background, light / dark:
  - `lc-notification-center`: priority chips high 1.96 → 5.52 (L), urgent 1.98 → 8.37 (D); type icons success 2.72 → 5.29 and warning 2.25 → 6.02 (L), lowest 4.83 (D, warning on an unread row). The raw hex fallbacks of the icons are gone.
  - `lc-card` status chips success 2.32 → 4.85, warning 1.96 → 5.52 (L), error 1.98 → 8.37 (D).
  - `lc-markdown` mermaid error text 2.05 → 8.68 (D).
  - `lc-status-dot` done 2.72 → 5.29, wait 2.25 → 6.02 (L), blocked 2.05 → 8.68 (D).
  - `lc-pipeline` warning node 2.25 → 6.02 (L), error node 2.05 → 8.68 (D), border and glyph; the check on a complete node 1.89 → 9.12 (D).
  - `lc-file-upload` remove × on hover 1.70 → 7.21 (D).
  - `lc-rating` filled and half star 2.25 → 6.02 (L).
  - `lc-log-viewer` warn level 2.06 → 5.50 (L); level pills no longer sit at 60 % opacity (warn 1.53 → 5.25 L, 4.62 → 5.55 D); the pressed pill shows a 1 px ring in its ink (forced colours: a 2 px `Highlight` outline). In the terminal variant the level colours now use the terminal's own palette in both themes (the rule never matched, so they followed the page theme): light info 2.65 → 7.78, warn 6.43 → 11.43, error 1.70 → 6.19, debug 2.81 → 5.81; dark 10.10 → 7.78, 10.11 → 11.43, 7.21 → 6.19, 6.36 → 5.81.
  - `lc-diff-viewer` stats add 2.60 → 5.06, `+` marker 1.81 → 3.52 (L).
  - `lc-dependency-viewer` edges, arrows, edge labels, legend, node borders and detail dots: lowest 3.52 (L, success border on its node), was 1.81.
  - `lc-kanban-board` priority icons low 2.72 → 5.29, high 2.25 → 6.02 (L); over-limit count 4.22 → 6.33 (L).
  - `lc-progress-bar` status fills against the track: success 2.47 → 4.81, warning 2.05 → 5.47 (L), error 1.83 → 7.76, info 2.50 → 9.51 (D), linear and circular.
- Story Data Display/Money "Number Column": the tip now says that a `formatMoney(...).text` string has no spoken text, so prefer `lc-money` in a cell template (027 review finding 2).

### Compatibility

- No API breaks: no input, output, selector, `--lc-*` hook or default changed, and every selector keeps its specificity, so your overrides still win. Exception: in the terminal variant, a level-colour override needs `.lc-log-viewer--terminal .lc-log-viewer__line--<level> .lc-log-viewer__level` (0,3,0). `--color-success/-error/-warning/-info` and their steps are unchanged; the rails, line tints and node fills keep them. Status text and icons get darker in light; in dark they get lighter where the fill was used, and slightly darker (still at least 4.83:1) where the light step `-default` was used (notification icons, log warn level, diff add, dependency viewer, kanban). In light, the card and notification chips sit on the opaque `--color-<status>-subtle` tint (dark is unchanged). Layout is unchanged.

### Known

- `lc-notification-center`: the high chip on an unread row in dark stays at 3.67–4.26:1 (the dark warning ink equals the old fill); read rows reach 4.60 (F-1).
