# Review 020: App shell prove gaps (page spacing, empty state, avatar, outline tone, sidenav theme)

## Round 1 — 2026-10-30, commit d4bb467 (libs/tools = gate commit 1195039)

Screenshots: my runs are in `tmp/story-shots/020/r1/` (the 11 new stories, 360 · 1024 · 1280, light · dark; buttons 360 · 1280), `r1-320` (320 px), `r1-cmp` (the noise re-shoot against `baseline`), `r1-menu` and `r1-scroll`. Logs: `tmp/story-shots/020/r1-*.log`. The Storybook build was current. I opened 12 shots: state-page-aligned 360 L and 1280 D, state-page-loading 360 L, empty-state state-page 360 L and primary-tone 360 D, avatar person-fallback 360 L, header avatar-person-fallback 360 D, button outline-primary-tone 360 L and 1280 D, hooks-on-an-ancestor 1280 L, page-header padding-top 360 L, and sidebar-first-prominent-brand 1280 L (noise check).

**Unchanged stories:** I ran `diff -rq` on the developer's `cmp` (676 shots), `cmp-full` (44) and `cmp-rerun` (13) against `baseline`, and re-shot the 4 flaky stories myself (`r1-cmp`, 24 shots). Two groups of shots differ, and both are noise:
- **Sidenav sidebar-first** (collapsed, layout, prominent-brand at 1024/1280, mostly light). The set of differing shots changes between the 3 runs: layout 1024 D differs in 2 runs, layout 1280 D in 1, and collapsed 1280 L in 2. The rails compute the 3.14 colours (bg #070e15, border rgba(255,255,255,.08), label #c4d2d9). These stories are already on the 002/019 noise list.
- **Avatar-group with-images 360 L.** This shot differs in all 3 runs, with Δ ≤ 3 inside the photos. The `fallback` default never touches an image, so this is raster noise.

The 44 tall stories match only when shot `--full`, and in `cmp-full` all 44 are identical.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | *Page Padding Per Breakpoint*: main padding-left is 16 / 32 / 32 px at 360 / 1024 / 1280, in both themes. With `paddingX="header"` it is 16 / 24 / 24. The hooks and the media-query route are documented in the `lc-app-page` JSDoc and in the app-shell docs table. |
| AC-2 | pass | The header title x equals the h1 x: 16 = 16, 24 = 24 and 24 = 24 at 360 / 1024 / 1280, in both themes (`r1-appshell.log`). |
| AC-3 | pass | The 14 app-shell stories are identical to the baseline (the tall ones in `cmp-full`). The Jest spec pins the 24/32/48/56/72/96 steps. |
| AC-4 | pass | The h1 is at y 80 and the header ends at 64, so the gap is 16 px at every width. *Padding Top*: top 40 / 0 / 8 / 16 and bottom 40 at all 3 widths. |
| AC-5 | pass | The skeleton is at (16, 80), 192×38, and at (24, 80) from 1024 px. Its top equals the h1's y of 80. `main` has `aria-busy="true"`. |
| AC-6 | pass | The 18 page-header stories are identical (*Large Text* compared in `cmp-full`). |
| AC-7 | pass | The circle is 48×48 with bg rgb(224,241,244) light and rgb(13,53,61) dark, and `aria-hidden="true"`. The svg is 24×24 in rgb(20,79,91) / rgb(193,227,233). The `lc-icon` has no `style`. The neutral tone keeps its 40 px icon, and the 7 empty-state stories are identical. |
| AC-8 | pass | Computed in the page: 7.85 light, 9.68 dark. The circle against the page is 1.16 / 1.43, which is decorative. |
| AC-9 | pass | *State Page* at 360: message 16/24 px. Circle → message 16, message → button 24. With a heading: circle → heading 16, heading (20/25) → message 8. |
| AC-10 | pass | The person glyph shows at xs–xl at 60 % of the size (14.39 … 38.39 px). With a name it shows "RB". `member-1` stays neutral (rgb(209,213,219)). A broken `src` falls back to the person. The default avatar stories are identical. |
| AC-11 | pass | Role `img`, named "Avatar". The svg has `aria-hidden="true"` and `focusable="false"`. With `decorative` it has no role and no label. The header trigger is named "Benutzermenü" and its avatar is decorative. axe 4.14 found 0 violations in 16 shots. |
| AC-12 | pass | The glyph on the disc is 7.00 light and 6.10 dark. The forced-colors rule `border: 1px solid CanvasText` is in `avatar.component.scss`. |
| AC-13 | pass | **Text:** 8.81 / 12.58 on the page, 7.86 / 10.90 on land-1. **Border:** 6.21 / 11.78 against the page, 5.50 / 10.42 against land-1. **Hover:** 7.85 / 10.57, and 9.20 on land-1 (the dark tint composited). **Active:** 6.71 / 6.71, border on primary-200 4.56 / 5.72. **Ring:** 2 px solid primary-500, offset 2. **Disabled:** opacity .5. `variant="primary"` gets no tone class. The 35 button stories are identical. |
| AC-14 | pass | The `.lc-sidenav` bg is rgb(13,53,61) in all 6 ancestor cases (dark, light and auto, for both components) at 360 and 1280 on both page themes. The element override gives rgb(26,106,121) in 2 of 2 cases. The labels are white, 13.18 / 6.21. |
| AC-15 | pass | Both JSDocs, `getting-started.mdx` (`isOpen`/`mode`) and the story docs say "element or any ancestor". 4 spec files were changed, each with the 020 reason comment. The placeholder spec l. 190 was missing from design §9 and has been added. |
| AC-16 | pass, see S1 | `scrollWidth` equals the viewport width in all 11 stories at 360, and in the state pages at 320. There are 0 `[tabindex]` attributes, and the rings are visible. |
| AC-17 | pass | Compat 22 passed 79/79 (`build.md`), and libs/tools at HEAD equal the gate commit. |
| AC-18 | pass | Names, unions, defaults and the JSDoc `@default` match design §2. The types are exported through `export *`. All 9 inputs have argTypes with a description and `table.defaultValue`. The 11 story IDs exist. |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| S1 | should-fix | `lc-empty-state messageSize="md"` heading; *State Page* at 320 px, both themes | The heading wraps inside the empty state, as the message does (`overflow-wrap: break-word`; `hyphens: auto` under `lang`) | The heading has `overflow-wrap: normal` and `hyphens: manual`. "Zugriffsberechtigungsverwaltung" at 20 px is 309 px wide, inside 288 px, so it sticks out 10.5 px on each side (the page doesn't scroll). It fits at 360 (309 ≤ 328). The `size="lg"` heading already behaved this way. This is a design gap (§3). |
| S2 | should-fix (pre-existing, follow-up request) | `lc-menu` `--danger` item (`menu.component.scss` l. 81–85), the header's "Abmelden" item, dark | Text ≥ 4.5:1. `--color-text-error` measures 12.59 / 8.69 | `color: var(--color-error)` is #9d0e0e in both themes: **2.06:1** on the dark menu (rgb(16,28,38)), 8.39 light. The hover tint is a raw `rgba(157,14,14,.14)`. "Abmelden" is the only item in finance-intelligence's no-role user menu (concept §8). Not part of 020's ACs. |
| N1 | nit | *Hooks On An Ancestor*, last pair | The element override stays distinguishable from the active item | `--lc-sidenav-bg: var(--color-primary-fill)` equals the ancestor's `--lc-sidenav-active-bg`, so the active fill is 1.00:1 against the rail and only the indicator shows. Use `--color-primary-fill-hover`, or override `active-bg` as well. |
| N2 | nit (pre-existing) | Header menu with `userName=""` | The email is centred on the 40 px avatar | The email is 17 px high at the avatar's top (both at y 106). |
| N3 | nit | `empty-state.component.scss`, `--message-md` margin rule | A separate rule for the `:has()` part | The selector list puts the message margin and the `:has()` heading rule in one rule, so a browser without `:has()` would drop both. Every browser in the Angular 21/22 support range has `:has()`. |

**Design corrections (`design.md`, change note at the top):**
- §3: the h1 → circle distance is 96 px at 360 and 112 px from 1024 px. The app-page gap was missing, which the developer also noted.
- §3: the md heading wrap (S1).
- §5: the border values at rest, as measured.
- §6: the menu-header avatar keeps role `img` "Avatar".
- §7: the DE message takes 2 lines at 360.
- §9: the placeholder spec has been added to the AC-15 list.

**Verdict:** approved. There is no must-fix. S1, S2 and N1–N3 stay open for the release notes. S2 needs its own fix request.
