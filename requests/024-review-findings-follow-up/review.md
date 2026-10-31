# Review 024: Review findings follow-up

## Round 1 — 2026-10-31, commit 6482296

Screenshots: `tmp/story-shots/024/` — developer `after/` (vs `baseline`, `--full`) and `new/`; review runs `r1-pag/` (3 table stories, 360/1024/1280 L/D, 100 % and 200 % text), `r1-toast/`, `r1-menu-cell/`, `r1-ax/` (`--axe`). Storybook build of 13:13 is current (story-shots accepted it). Measure copy: `tmp/story-shots/024/r1-pag.js`.

**Unchanged stories (by hash, developer's `after` vs `baseline`):** table 108/138 identical, others 88/104 identical. The differing set is exactly design §9's expectation: table `--with-pagination`, `--with-filtering`, `--full-featured`, `--number-columns`, `--with-cell-formatting-and-styling` (6 each) and the 4 menus with a danger item (4 each). Toast 6, toast-outlet 4, drawer 4, notification-center 7 and `--with-disabled` menu identical.

**Opened (12):** pagination-sizes 360 L, 1280 L, 1280 D · toast with-action 360 L, 1280 L · drawer without-heading 360 L, 1280 L · number-columns 360 L · cell-formatting 1280 L, 1280 D · menu default 360 L, 360 D.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `r1-menu-cell` 1280 L/D: Margin `td` colours = resolved `--color-text-success/-warning/-error` (L rgb(95,113,80) / (133,90,34) / (107,9,9); D (169,187,147) / (225,160,64) / (247,161,161)); Account `td` 16 px; plain cells text-primary 14 px; SLA `cellStyle` opacity .85, Margin weight 700. `table.pagination.spec.ts`: only `:where()` rules set td colour/size; 17 unchanged table stories identical by hash |
| AC-2 | pass | Number Columns shows "5 / Seite" at all widths; EN stories "5 / page", "10 / page"; JSDoc `@default '/ page'`, argType with `table.defaultValue` |
| AC-3 | pass | `.lc-select__clear` `display: none` in 3 stories × 3 widths × 2 themes; value ends 8 px (md) / 11.6 (sm) / 16 (200 %) before the chevron, 0 overlaps (`m-pag*.log`) |
| AC-4 | pass | buttons 32/40/44 (sm/md/lg), hit area 44 (88 at 200 %): `elementFromPoint` 0.5 px inside each edge → the button, 1 px outside → not; hit clear of the select 2 / 6 / 8 px (sm/md/lg); `:focus-visible` ring 2 px solid primary-500 offset 2 (rgb(32,132,151) L, rgb(132,199,212) D); forced colours: ring + ButtonBorder/GrayText (`m-forced.log`) |
| AC-5 | pass | `scrollWidth` = viewport at 360/1024/1280 L/D, 100 % and 200 %. 360: h 93, 2 rows (200 %: h 282, 3 rows). 1024/1280: one row h 64 (200 %: h 128, one row) |
| AC-6 | pass | With Action 360/1280 L/D: close 44 × 44 at x 295 (inside the toast, 5 px from its border), action 51.4 / 93.7 × 44, touching (gap 0), edge hits true; message not clipped; `scrollWidth` 360. Service Call: toasts 328 × 78 / 320.1 × 63 = design §3 (`m-toast-call.log`). See finding 1 for the DE break |
| AC-7 | pass | `r1-ax`: drawer close and NC item/empty icons `aria-hidden="true"`, no `role`; button name "Close drawer"; axe `svg-img-alt` 0 (developer: 11 → 0 over 12 stories). Remaining violations pre-existing (finding 4) |
| AC-8 | pass | `r1-menu-cell` (gradient ends): rest 12.59/12.05 L, 7.21/8.69 D; hover (`--color-error-subtle` composited) 10.98 L, 7.18/8.41 D; focus 11.44 L, 6.40/7.79 D. No `rgba(` left in `menu.component.scss`; `theme-contrast.spec.ts` pairings |
| AC-9 | pass | tab stops select → (prev when enabled) → next, names unchanged ("Zeilen pro Seite", "Nächste Seite"); `:focus-visible` true on next and toast close; no new motion |
| AC-10 | pass | compat 22: 84 checks incl. "5 / page", `--md`, `__pager` before JS (f2efc10; head differs only in `toast.stories.ts`) |
| AC-11 | pass | no existing spec line changed (`git diff main --stat` on specs: 4 new files, `theme-contrast.spec.ts` +69 / −0); 4696 passed |
| AC-12 | pass | changelog draft in `build.md` lists 021 F1/F2, 023 follow-up, 020 S2 with values and `pageSizeLabel`; manifest check per build |

### Deviations (build.md)

| # | Decision |
|---|---|
| 1 | **Accepted.** `lang="de"` on the `lc-toast` host is valid (global attribute) and scopes exactly the German content (message, action, close name); a wrapper is not needed. Root cause is pre-existing (finding 2), not part of 024 |
| 2, 4 | Accepted |
| 3 | Accepted: design typo; `design.md` §1 and §9 corrected to 14 px (change note) |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix | `.lc-toast__message`, With Action 360 L/D | A long German compound wraps with a hyphen, as in lc-alert since 3.13 (`overflow-wrap: break-word` + `hyphens: auto`, needs `lang`) | Lines "Benachrichtigung" / "seinstellungen" / "gespeichert." — split one letter after the joint, no hyphen. Design §3 asked only for `overflow-wrap` (my omission). Adding `hyphens: auto` can change wrapped EN toast lines, so it needs its own baseline compare: follow-up |
| 2 | nit (follow-up) | `toast.component.scss` `:host { display: block; width: 100%; max-width: 400px; margin-bottom }` | Applies to the host | Dead under `ViewEncapsulation.None`: a standalone `lc-toast` in a block parent is `display: inline` (Success story) and spans the canvas (1248 at 1280). Fixing it changes standalone toast widths, so it's a separate request |
| 3 | nit (follow-up) | `lc-drawer` close (both sites), Without Heading 360 | ≥ 44 × 44 like lc-modal (3.18) and lc-toast (3.19) | 32 × 32 |
| 4 | nit (follow-up) | notification-center 6 stories, drawer 2 stories | axe clean | pre-existing `color-contrast` on `.lc-nc__filter(--active)`, `aria-input-field-name` in drawer forms; 30 `lc-icon` sites without `decorative`/`ariaLabel` (build.md note) |

**Verdict:** approved (no must-fix). Findings 1–4 go into the release notes as open items.
