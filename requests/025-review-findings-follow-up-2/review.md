# Review 025: Review findings follow-up 2

## Round 1 — 2026-10-31, commit db21415 (code = gate commit 763d8f3)

Screenshots: `tmp/story-shots/025/r1/` — `toast` (6 changed stories, 360/1024/1280 L/D, vs developer `after`), `toast-same` (All Variants + 4 outlet, vs `baseline`), `open-sc` / `open-many` (outlet after the design's clicks, vs `baseline-open`), `drawer` (6 stories incl. German Heading, 3 widths, `--axe`), `nc` (7 stories 360/1280 `--full --axe`), `icons` (8 stories `--axe` vs `baseline`), `icons-open*` (lightbox, listbox, create option), `forced`, `toast-close`. Measure copies: `r1/*-measure.js`. The Storybook build of 14:15 was current (story-shots accepted it).

**Unchanged stories (by hash):** All Variants + outlet at rest 30/30 and opened outlets 18/18 identical to the baselines. Icon stories 27/32 identical; the 5 others are logviewer default ×4 (timestamps relative to now) and gallery with-captions 360 L (image loading; it was identical in the developer's run). Developer `after` vs `baseline` (`diff -rq`) differs in exactly the set in design §9: toast 36, drawer 20 (+4 new), NC 26, icon noise 35.

**Changed stories:** toast 36/36 identical to `after`. Drawer: 21/24. The 3 light form shots also flip between my own two runs (`drawer-rerun`: 2/4) while the measures stay equal, so that is raster noise. NC: 24/28. The 4 shots at 360 light differ from `after`, but my re-run matches r1 8/8, so the difference came from the developer's first shots.

**Opened (12):** toast with-action 360 L, 1280 D · success 1280 L · drawer german-heading 360 L, 1280 D · filter-panel 360 D · large-form 360 L · without-heading 360 L · NC default 360 L, 360 D · compact 1280 D · forced NC default 360 D.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | Message `hyphens: auto`, `overflow-wrap: break-word`, `hyphenate-limit-chars: 12 4 3`. DE at 360: 328 × 99, 3 lines "Benachrichti-/gungseinstellun-/gen gespeichert." (hyphens seen in the shot), message not clipped, page `scrollWidth` 360. At 1024/1280: 400 × 78, 2 lines |
| AC-2 | pass | Line probe in all 30 EN toast shots: message height with `hyphens: manual` = with `auto` (23 / 44 px), so no EN line rewraps. The shots that differ are the 36 listed in design §9; single-line toasts differ only by the width cap (AC-3) |
| AC-3 | pass | Success at 1280: `block`, 400 × 58 at x 16, mb 8px (was inline 1248). At 360: 328 × 78. Error and Warning: 400 × 78 (2 lines) at 1024/1280 |
| AC-4 | pass | Outlet toasts `matches(rule)` false, mb 0. Service Call: 328 × 78 / 320.1 × 63 (360), 330.2 × 58 / 320.1 × 63 (1024/1280). 5-toast stacks: 191.9 / 192.1 × 58, touching. 18/18 + 24/24 identical |
| AC-5 | pass | 36 shots: box 44 × 44, hits 4/4 at 0.5 px inside each edge. Icon 20 px where it was: 314,22 / 1234,22; floating 322,18 / 1242,18; left 313,22. Header 65. German Heading: header 73, 2 lines, box at 302,14 (360) and 1222,14 (1280); the heading box ends 6 px before the button, the text 10 / 14.3 px. Without Heading: × bottom at 50, first button at y 64 |
| AC-6 | pass | Focused at open, `:focus-visible` true, ring 2px solid rgb(32,132,151) L / rgb(132,199,212) D, offset 2. Name "Close drawer" / "Schließen"; svg `aria-hidden`; DOM order unchanged. Icon (text-tertiary) on the panel: 5.84 L / 6.71 D |
| AC-7 | pass | Pressed chip: white on rgb(26,106,121), 6.21 L/D. Rim against the panel ends: 4.37/4.18 L, 7.58/9.13 D. Rest text: 7.56/7.23 L, 9.26/11.16 D. Badge: white on rgb(157,14,14), 8.39 L/D. axe `color-contrast` 0 in 28 NC shots. Deviation 1 (item-icon fallbacks) accepted: the `--color-*-default` tokens exist in both themes, so those fallbacks never apply |
| AC-8 | pass | Row at 360: scroll 400, client 326, h 43.5. Chips 26.5 high at x 33 / 91.1 / 161.1 / 250.1 / 339.7, as in the baseline. Target left at 26.5 px (≥ 24, design §6) |
| AC-9 | pass | axe: 0 violations in 36 drawer shots. Each label sits 4 px above its 40 px select (text-primary, 17.74 L / 15.85 D) and gives the select its name ("Status", "Role", "Priority", "Category") |
| AC-10 | pass | All 29 sites are in the diff; each sits inside a button named by `aria-label` or beside visible text (checked in the templates). 0 `svg[role=img]` in 8 stories at rest. Opened gallery lightbox: 6/6 icons hidden (buttons "Zoom out" … "Next image"). Combobox options: 4/4 hidden; Create option: 1/1 hidden. `svg-img-alt` 0 (it was in every logviewer baseline shot); the remaining violations are the same as in the baseline |
| AC-11 | pass | German Heading at 360: the heading fits (`scrollWidth` ≤ `clientWidth`), page 360. No built-in text added |
| AC-12 | pass | build.md, gate commit 763d8f3 (`git diff --quiet 763d8f3 -- libs tools` holds): 4721 tests pass and no existing assertion changed. Compat 22 PASS, 85 checks, including the standalone toast |
| AC-13 | pass | `--forced-colors`: the pressed chip gets a 2px solid Highlight outline (offset 1), rest chips none; the drawer close ring and icon use system colours. The toast's reduced-motion `animation: none` is untouched. Both themes are measured above |

**API (§2):** only templates, SCSS, stories and specs changed; no input, output, slot or hook. The German Heading story uses the existing `closeAriaLabel` argType.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix (pre-existing in 3.19.0, outside 025's scope → follow-up request) | `.lc-toast__close`, every toast in dark (standalone and outlet); With Action / Success 360 D (`r1/toast-close.log`) | × and its `currentColor` focus ring ≥ 3:1 (1.4.11). `color: var(--color-text-secondary)` gives 7.56 / 7.23 L and 9.26 / 11.16 D on the same gradient ends (measured on the NC chips) | No `color` rule: UA `buttontext` rgb(0,0,0) gives **1.47 / 1.22:1** on rgb(26,44,58) / rgb(16,28,38); the ring is black too. axe misses it (SVG). Fixing it changes the outlet stories, so it belongs in its own request |
| 2 | nit | Changelog draft (build.md) and the comment at `notification-center.component.scss:112` | "white on the old fills was as low as 1.89:1" | "white on the level colours was 1.89 to 4.37:1": wrong range, because Error (8.39) and Info (6.17) passed in light |
| 3 | nit | Story German Heading | German body text (or only German content under `lang="de"`) | `lang="de"` on `lc-drawer` also marks the English body (STATUS, "In Progress", the description) as German |

**Verdict:** approved. No must-fix; findings 1–3 stay open for the release notes and a follow-up.
