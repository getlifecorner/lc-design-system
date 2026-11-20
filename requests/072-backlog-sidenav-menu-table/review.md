# Review 072: Backlog bundle — sidenav rail menu, brand mark, rail template, tooltip description; menu side positions, popup control rows, part names; table RTL head

## Round 1 — 2026-11-21, commit a428df6 (code 73e8851)

Screenshots: `tmp/story-shots/072/r1/` (10 new/changed stories + brand-toggle, docked, cut-label, sortable-head-reserve-and-rtl; 360 · 1024 · 1280, light · dark, rail stories without `--full`; axe 84 shots, 0 violations), `r1-pc/` (popup walk), `r1-fc/` (forced colours), `r1-long/`, `r1-reason/`, `r1-tip*/` (probes). Logs `tmp/story-shots/072/review/r1-*.log`, measure `r1-m.js`. Storybook rebuilt (tokens newer than the build only).

**Unchanged stories:** menu, table, tooltip, split-button, header: the developer's `cmp1–4` stay valid (no source newer than their shots except the sidenav stories/directive and regenerated tokens). Sidenav re-compared on the current build (`r1-sidenav`, 40 stories, 160 shots): 153 identical, 7 different = spinner/raster randoms (themed-rail-badges 1280 L, 360 D, 1280 D; action-items 1280 L/D; lazy-children 1280 L/D); rerun `r1-rand`: lazy-children 1280 D and themed-rail-badges 1280 L/D identical, so they flip run to run. Expected change `sortable-head-reserve-and-rtl` 1280: RTL heads right, the LTR tables keep `left` pl16 pr32, arrow R12 (3.50).

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | rail-group-menu 1024/1280 L/D: aside 17/53 56 wide, item 25/171, panel 81/171 220×268, `panel.left − aside.right` 8, top 0; off = 3.50 (unit) |
| AC-2 | pass | panel: section „Objekte“, Objekttypen `aria-current`, Zähler busy, Prüfungen badge 12, Archiv `aria-disabled`; End → Archiv described „Kein Recht für diesen Bereich“ (`r1-reason`); router + `itemClicked` (unit) |
| AC-3 | pass | `aria-haspopup="menu"`, `aria-expanded` true/false; walk: ArrowDown → Felder, Escape → closed, focus „Stammdaten“, ArrowRight (RTL ArrowLeft) → open on Objekttypen, Tab → closed, focus next rail item, click → reopen; menu named „Stammdaten“/„Master data“; live element after reorder (unit) |
| AC-4 | pass | L/D, DE + EN (RTL): maxWidth 320px, no clipped label; RTL panel 723 (1024) / 979 (1280), `aside.left − panel.right` 8, `left-start`; forced colours: panel border solid 1 px CanvasText, open group outline 1 px Highlight (`r1-fc`) |
| AC-5 | pass | brand-mark-slot 360/1024/1280: mark 32×32 at the tile's offset (expanded brand +4/+7.5 = brand-toggle tile; rail brand 44×44, +6/+6 = tile); tile `display: none`; ring solid 2 px on all four brands |
| AC-6 | pass | mark box `aria-hidden="true"`; brand name keeps `brandName` (unit); prerender: compat „brand mark“ (build.md) |
| AC-7 | pass | side-positions 1024/1280: right-start gap 8, left-start gap 8, edge anchor flips (gap 8), tops 0; 360 see F-1 |
| AC-8 | pass | physical in LTR/RTL (unit, both `Directionality` values); four old lists equal |
| AC-9 | pass | popup walk 360/1280 L/D (`r1-pc`): Hell ↔ Dunkel (arrows stay in the part) → Tab „Normal“ → „Töne“ → „Profil“ → (ArrowDown Abmelden) Tab → closed, focus on the next page element; Shift+Tab on the first part → closed, focus „Ansicht ▾“ |
| AC-10 | pass | click „Kompakt“ and the switch: menu stays open (checked true, switch false); Escape in a control → closed, focus „Ansicht ▾“; inline specs unedited (`git diff` adds 4 spec files only) |
| AC-11 | pass | 360: panel 280×294 (≤ 320), rows 52 / 48, items 44, controls named „Dichte“ (radiogroup by label), „Töne“ (switch), no clip; EN rows in Part Names (48) |
| AC-12 | pass | template wins over `railItems` (story sets both); unit for context and expanded/drawer |
| AC-13 | pass | 1024/1280: aside 56, brand/items/collapse at x 22.5, items 44×44 pitch 46; tab brand → EM → FB → + → collapse; contrast current 7.85 L / 9.37 D, rest 7.23 / 12.53, hover 16.12 / 16.33, ring 4.18 / 10.25; tooltip „Finanzbuchhaltung“ on focus; FC current outline 1 px Highlight; 360 = drawer with `items` |
| AC-14 | pass | rtl-head 360/1280: lc-table th `right` (sortable pl32 pr16), end column `end` pl16 pr32 with the arrow before the label, actions th/td `left`; `th[lcSortableHead]` right, arrow L12; 360 wrapper starts at the right (scrollLeft 0 of 11) |
| AC-15 | pass | LTR computed values unchanged (sortable-head story LTR tables; all other table stories identical except the known randoms) |
| AC-16 | pass | Part Names „Account“ / „Account, part 2“, „Konto“ / „Konto, Teil 2“; Account Panel „Darstellung“ / „Konto“; Popup „Darstellung“ / „Konto“ |
| AC-17 | pass | unit (single part, no `ariaLabel`: no attribute) |
| AC-18 | pass | Cut Label: description „Wird im Rich Client bearbeitet“, visible „Rechnungsfreigabe Kostenstelle 4711 · Wird im Rich Client bearbeitet“; Tooltip Description: „Strg+B“ via hidden `lc-tooltip-1-description` |
| AC-19 | pass (alternative) | the Playwright cache is outside the session (my `ls` was blocked too) → 054-n2 stays with „still open after 072“ |
| AC-20 | pass | gates on 73e8851 (build.md); existing specs unedited; default DOM spec |
| AC-21 | pass | JSDoc `@default` on `railGroupMenu`, `position`, `popupControls`, `partAriaLabel`, `tooltipDescription`; argTypes with description + default; hook in JSDoc |
| AC-22 | pass | `partAriaLabel` DE „{label}, Teil {n}“ in Part Names |

### Deviations (build.md)

| # | Decision |
|---|---|
| D-1 | **Accepted as built** (§2): the first part keeps `ariaLabel`, so the menu's name never disappears; `partLabel` names it only without `ariaLabel`. design.md §4 corrected (change note). |
| D-2 | **Accepted**: `position: relative` carries the `::after` tooltip, `font`/`text-decoration`/`cursor` make links and buttons equal; compiled weight (0,1,0) + state. design.md §3 updated. |
| D-3 | **Accepted**: a full-page capture scrolls, and a scroll closes an overlay menu by design. Later compares of the two rail-group stories run without `--full` (design §8 note). |
| O-1 | **Accepted as a known limit** → F-1 (nit). |
| O-2 | **Not caused by 072** → F-2 (nit, pre-existing). |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F-1 | nit | side-positions 360 L/D | design §4: flip, then shift inside the 8 px margin; a panel that fits with 8 px keeps its 8 px gap | CDK's fit test reserves both margins (needs 16 px): the right-start panel is pushed to gap 0.2 (edge 24); centred and edge anchors are covered (no room on either side). Docs line in the `position` JSDoc; backlog |
| F-2 | nit | rail-group-menu-rtl 360/1024/1280 | page as wide as the viewport | `scrollWidth` 361 / 1025 / 1281: CDK focus-trap anchors (`.cdk-visually-hidden`, `margin: -1px`, `right: 0` in RTL) reach 1 px past the edge in every RTL sidenav (pre-existing; no content lost). Backlog: clip or place the anchors |
| F-3 | nit | lc-menu (exposed by `railGroupMenu`), 1024 L | a label wider than the panel wraps (design §4 assumed spaces) | a 44-letter compound (365 px in a 286 px label, panel 320) is clipped at the panel edge without ellipsis (`overflow-wrap: normal`); pre-existing in every lc-menu, `r1-long`. Backlog: `overflow-wrap: anywhere` on `.lc-menu__item-label` |
| F-4 | nit | Rail Group Menu stories | the status line „Letzte Auswahl“ shows menu choices | after the play it reads „Stammdaten“ / „Master data“: a group press emits `itemClicked` like any rail entry (3.50 contract, correct). Story: log only entries without children, or name the line „Letztes Ereignis“ |
| F-5 | nit | Tooltip Description 360/1280 | tooltip below the button (`tooltipPosition="bottom"`, as the story says) | opens on the right: the 30 px button sits 16 px from the edge, a centred 109 px tooltip would start at x −7.5, so CDK flips. Story: more inline padding (e.g. `72px 64px`) |

**Verdict:** approved (no must-fix; F-1 … F-5 go to the backlog).
