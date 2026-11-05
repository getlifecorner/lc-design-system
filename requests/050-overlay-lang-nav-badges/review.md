# Review 050: Overlay panel language (select, tooltip); lc-bottom-nav `moreBadge`, lc-sidenav `badgeAriaLabel`

## Round 1 — 2026-11-05, commit 6195529 (code = cdc4625, `git diff --quiet cdc4625 -- libs tools` holds)

Screenshots: `tmp/story-shots/050/` on the developer's Storybook build (not stale). New stories: `r1-new/` (5 stories, 360 · 1024 · 1280, light · dark, `--axe`, measure `r1-new-measure.js`, log `r1-new.log`) and `r1-new2/` (same, at rest). Unchanged stories: `r1-rest/` (16 sidenav + 12 bottom-nav, 3 widths, L/D, `rest-measure.js`), `r1-st/` (10 select + 6 tooltip, 360/1280, L/D), both `--compare=baseline`. Developer folders reused: `build-rest` (7 badged sidenav stories, 42), `build-open` (20 opened), `build-banken`.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `select.panel-lang.spec`; *Panel Language* 6/6: DE panel own `lang="de"`, search input and 6 options inside resolve `de` |
| AC-2 | pass | same spec (no wrapper → no attribute, closed → no panel); at rest 64/64 select + tooltip shots identical (`r1-st.log`) |
| AC-3 | pass | `tooltip.lang.spec`; *Language* 6/6: `LC-TOOLTIP-CONTENT#lc-tooltip-2`, `role="tooltip"`, `lang="de"`, = the host's `aria-describedby` |
| AC-4 | pass | `menu.lang.spec`, `popover.lang.spec` (no code change) |
| AC-5 | pass | *More Badge* 6/6: the More badge's markup equals the Contracts item badge (`span.lc-bottom-nav__badge > lc-badge[size=xs] > span.lc-badge.lc-badge--primary.lc-badge--rounded.lc-badge--xs`, text stripped); badge at pill centre + 6, top − 4, as items; spec covers overflow + `showMore` |
| AC-6 | pass | names "More 3 new" (`aria-current="page"`), "Mehr 1 offen"; sr span "3 new" / "1 offen"; null/unset → identical DOM (spec) |
| AC-7 | pass | `bottom-nav.more-badge.spec` (hidden items with badges, More shows only `moreBadge`); the story's hidden items carry no badge |
| AC-8 | pass | 6 sites in `sidenav.badge-name.spec`; *Badge Accessible Name (German)*: every badged item `lc-badge[aria-hidden=true]` + 1 span; "Offene Zuordnungen 12 offen" … "Kontoauszüge 2 offen" (`build-banken`), rail the same, description = label (L-1) |
| AC-9 | pass | unbadged DOM unchanged by construction; heights 44, rail 39 × 44, badge rects and contrasts = baseline log (`tmp/050/shots-rest.log`) |
| AC-10 | pass | 207/210 nav shots identical: `build-rest` 40/42 + `r1-rest` 167/168. The 3 others are flakes: *Sidebar-First Layout* 1024/1280 D (design §9 list) and *Drawer Mode* 1280 D (0 badges, 0 spans; 3 re-shoots byte-equal to each other, close button auto-focused, drawer renders as designed) |
| AC-11 | pass | 360 L/D: label `clientWidth/scrollWidth` with and without the 10 spans equal (Offene Zuordnungen 132/138 ellipsis, others fit), item boxes 223/207/39 × 44 equal; rails in one row (x 17 w 240, x 283 w 56) |
| AC-12 | pass | 0 focusables inside any item (one tab stop); ring 2 px solid: sidenav offset 2, bottom-nav offset −2, `#208497` L / `#84c7d4` D, badged = unbadged items |
| AC-13 | pass (gate) | compat 22 PASS, 100 checks; `EXPECT_IN_HTML` 050 AC-13 present |
| AC-14 | pass | only edited assertion: `kit-icons.spec` exception list (stated reason, stricter scan) |
| AC-15 | pass | 5 stories with the §8 ids; argTypes `moreBadge` (`control: 'object'`, `null`), both `badgeAriaLabel` with description + default; axe 0 violations on 30 shots |
| AC-16 | pass (draft) | build.md draft: Added, Fixed (049-f1, rail name), Compatibility (no break, D-1, `textContent` note), Known |

API (§2): `moreBadge: BottomNavBadge \| null \| undefined = null`, `BottomNavBadge` exported (`export *`), `BottomNavItem.badge?: BottomNavBadge`, bottom-nav `badgeAriaLabel` `@default '{value} new'` added, sidenav `badgeAriaLabel = '{value}'`, select/tooltip class JSDoc lines: all as designed. Rail names: "3" → "Agent Runs 3", "12" → "Two digits 12", "New" → "Text value New"; expanded names unchanged ("Tasks 12", "Messages New").

Contrast in the new stories (developer's `rest-measure.js`, matches design §5): More current primary 8.49 L / 5.79 D; DE warning on the bar 5.52 / 5.18; sidenav DE min 4.85 (Konten, current, warning, dark).

Shots opened (12): the 5 new stories at 360 L and 1280 D, *More Badge (German)* after a focus pass, *Drawer Mode* 1280 D. All as designed.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix (pre-existing, WCAG 1.4.3, design F-1) | lc-bottom-nav, badge on the current pill, dark | ≥ 4.5:1 | warning 4.03 floating / 4.26 docked, success 4.49 floating (FI: „Stammdaten“ behind „Mehr“ open) |
| 2 | should-fix (pre-existing, 1.4.3, F-2) | lc-sidenav `theme="light"` rail on a dark page | ≥ 4.5:1 | badges 1.22–1.97 (they follow the page) |
| 3 | should-fix (pre-existing, 1.4.13 + 1.3.1, F-3) | `lcTooltip` on `lc-button` (every tooltip story) | shows on keyboard focus; describes the focused button | no tooltip on focus, `aria-describedby` on the host. Same root: the tooltip anchors to the host's 18 px inline box (88–106) instead of the 42 px button (76–118), so *Language*'s bottom tooltip starts at y 114, 4 px over the button |
| 4 | nit (pre-existing, as 049-n2) | lc-select dropdown, *Panel Language* and *Default* | field-wide | content-sized `min-width: 200px`: 200 px under a 328 (360) / 400 (1280) field |
| 5 | nit (known limit L-1) | badged rail items | name only | description repeats the label (`title`): "Agent Runs 3, link, Agent Runs" |
| 6 | nit (known limit L-2) | More badge "99+" on a 5-entry bar at 360 | inside the bar | 3.6 px past the floating bar's edge, 1.2 docked; JSDoc says ≤ 2 characters |

**Verdict:** approved
