# Review 071: USM X sidenav, menu, card and badge gaps, toggle-group touch target, print rules, backlog rows

## Round 1 — 2026-11-20, commit 92c1b00 (`libs`, `tools` = gate commit c951f0b)

Screenshots: `tmp/story-shots/071/r1` (16 new stories, 360 · 1024 · 1280, light · dark, `--full --axe`; measures `tmp/071/measure/m.mjs` + `tmp/story-shots/071/review/r1.mjs`, log `review/r1-new.log`), forced colours `r1-fc`, print columns `r1-print`. Storybook rebuilt once (the library build had rewritten the token files' mtime only).

**Unchanged stories:** the sidenav SCSS/HTML and 6 story files changed after the developer's compare shots (16:41–16:44), so I re-compared those 6 components (`r1-cmp`, 145 stories, 580 shots): **570 identical**; the 10 others are known flakes: table *Full Featured* / *With Filtering* / *With Pagination* 1280 L/D (random data), sidenav *Action Items* 1280 D and *Themed Rail Badges* 1280 D (byte-equal to the developer's `build-d` and `rerun3`, the 069 r1 outliers), *Themed Rail Badges* 1280 L (= `rerun3`/`zz`, two states) and 360 D (flips since 064). Menu, card, avatar, tabs, toggle-group, file-upload: the developer's `build-a…d` by `diff -rq`: only the 20 expected file-upload image shots differ. axe: 0 violations in all 96 new shots.

| AC | Result | Evidence (r1 unless noted) |
|---|---|---|
| AC-1 | pass | rail-top child 44 × 44 at x 5.5–49.5 on the 56 px rail (1024/1280 L/D), ring not clipped; 360 = drawer, no wrapper box |
| AC-2 | pass | 4 rail icons; „Stammdaten“ `aria-current="page"`, `aria-haspopup="menu"`, expanded false → true → false; menu „Stammdaten“ opens at the item's top (Δ 0); sidenav baseline identical |
| AC-3 | pass | `<button type="button">` 223 × 47 expanded, 44 × 44 at x 5.5 on the rail; names „USM X Customizing, Navigation nach links einklappen“ / „…, Navigation ausklappen“; ring 2 px offset 2: 4.18 L / 10.25 D, forced colours Highlight; tooltip „USM X“ |
| AC-4 | pass | 4:1 → 96 × 24 (4.0), 1:1 → 24 × 24, tile 24 in 32, rail tile „X“, L/D |
| AC-5 | pass | pointer and focus both show „Rechnungsfreigabe Kostenstelle 4711 · Wird im Rich Client bearbeitet“, inside the viewport at 360 (x 12–288); plain row `title` = label (N-2) |
| AC-6 | pass | static, border 0, no shadow, one Tab stop, focus not taken, `role="menu"` „Account“ |
| AC-7 | pass (keys, semantics) · layout F-1 | rows 52/48/48, controls outside `role="menu"`, named „Dichte“ (radiogroup), „Töne“, „Tastenkürzel anzeigen“ (switch); Tab: Hell → Normal → Töne → Tastenkürzel anzeigen → Profil |
| AC-8 | pass | 3 px bar, 600, `aria-current`; label 15.25 L / 11.94 D, bar on fill 3.76 L / 6.88 D; busy: spinner, `aria-busy` + `aria-disabled`, name „Zähler Wird geladen“; forced colours: bar Highlight, `forced-color-adjust: none` |
| AC-9 | pass | groups Stammdaten › Objekte › Felder, nested and named; items sm 12/24/36, md 16/32/48, lg 20/40/60; headings 7.56 L / 11.16 D; menu baseline 60/60 |
| AC-10 | pass | 6 variants, 20 px high; text lowest 4.85 L (success) / 5.55 D (warning) on the panel |
| AC-11 | pass | hook panel 200 px, `room` 546 of 556 px; both open menus named „Weitere Aktionen“ |
| AC-12 | pass | `id="menu-objekttypen"`, `data-testid="objekttypen"`; rejected names in `menu.items` spec |
| AC-13 | pass (spec) | deviation 6 |
| AC-14 | pass | 10 three-letter avatars xs–xl, overflow 0; names stay „CRM-System“, „Incident Nord“ (`role="img"`) |
| AC-15 | pass | hook: unsorted „Team“/„Alter“ reserve 32 → 16 px; sorted „Titel“ and busy „Status“ keep 32 |
| AC-16 | pass | 360: badge 328 (100 %), cut runs 133 / 97 px of 269 / 298, „· 3 objects/Objekte“ 1 px inside, gap 4.2 px, `title` whole; ≥ 1024: 352 (22rem) |
| AC-17 | pass | hover ink stays tertiary on surface-hover: 5.30 L / 6.65 D (rest 5.84 / 7.31), weight 400 |
| AC-18 | pass | 360: title line 278 (full), search line 12 px below; 390 (dev): 308; 1024/1280 one line, head 51 = default card |
| AC-19 | pass | lg 40 / md 33 / sm 26 high, hit 44 (1.5 px outside top and bottom hits), sm options 44 wide, labels centred (≤ 0.5 px); forced colours ring 2 px Highlight |
| AC-20 | pass · F-2 | print rules cloned at 360/1024/1280 L/D: header 0 × 0, padding-bottom 112 → 0, sky none, min-height 900 → 0; screen: app-shell 92 + header 124 shots identical |
| AC-21 | pass | *Print* story + JSDoc; manifest „Print (3.50)“ in both entries (`tmp/071/manifest-print.json`) |
| AC-22 | pass | RTL: ring and arrow 12 px from the inline end inside the 32 px reserve; LTR stories identical |
| AC-23 | pass | rail story: Escape in the open menu → focus on „Stammdaten“ (`returnFocusTo`), panel gone, `aria-expanded="false"` |
| AC-24 | pass | dev `measure-c.log`: gap 0, margin −8 px, `role="alert"` kept |
| AC-25 | pass | „Shown at the top of the side navigation and on invoices.“ / „Erscheint oben in der Seitenleiste und auf Rechnungen.“ |
| AC-26 | n/a | WebKit not runnable here; 054-n2 stays in `BACKLOG.md` (owner rule) |

### Deviations 1–6 (build.md): all accepted, written into design.md (change note)

| # | Decision | Why |
|---|---|---|
| 1 | accept | same name string, visible text stays in it; label-in-name 0 violations in 96 shots |
| 2 | accept | action entries follow `items` rules; JSDoc must say it (N-3) |
| 3 | accept | pointer and focus paths both measured with the full text |
| 4 | accept | 5.5 centres the 44 px column in the 55 px inner rail, shared with brand and toggle |
| 5 | accept | labels centred within 0.5 px in grown options |
| 6 | accept | spec pins `defaultPrevented`, one `itemClick`, no submit; a real key press stays unmeasured |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F-1 | must-fix | `navigation-menu--account-panel`, all widths, L/D | design §3 (r1) / §9 AC-7: a part without toggle items starts its labels at the item padding, on the control labels' line: „Profil“, „Abmelden“ 16 px from the panel (360: x 33 like „Dichte“), the current bar beside its label | `.lc-menu__dropdown--has-toggles` reserves the 48 px toggle column for every item of the panel: „Profil“/„Abmelden“ `padding-inline-start: 48px`, labels at x 65; three start lines (33 controls, 65 part 2, 97 swatch radios), current bar 48 px from its label. Fix per `role="menu"` part in inline mode (sm 40 / md 48 / lg 56 only where the part has a toggle item); popup unchanged; spec + re-shoot |
| F-2 | should-fix | `layout-app-shell--print` ≥ 1024 (A4 landscape ≈ 1046 px) | §3 Print (r1): one column, `.lc-app-shell__body` x 0, full width | emulated print at 1280: `grid-template-columns: 240px 1040px`, empty nav column (sidenav hidden), body x 240 (`r1-print.log`) |
| F-3 | should-fix | `railItemClick` JSDoc + *Collapsed Rail With Top Slot* 1024/1280 | §3/§8: menu point 8 px beside the rail edge (64 from the rail's left) | `rect.right + 8` of the item (item right 47 on the 56 px rail): panel at 55, 1 px over the rail border (gap −1). Example and story: the rail's right edge + 8 |
| N-1 | nit | *Account Panel*, second `role="menu"` | a name | "" (later parts are only named by a first section, §6); backlog: optional part name or a docs line |
| N-2 | nit | *Cut Label With Tooltip* | description = tooltip text | `aria-describedby` reads „{label} · {tooltip}“, so the label is heard twice; backlog |
| N-3 | nit | `railItems` JSDoc | „`kind: 'action'` entries are current only by `current`“ | not stated (deviation 2; usm-x's group icons are actions) |

**Verdict:** changes requested (F-1; fix F-2, F-3, N-3 in the same round; N-1, N-2 go to the backlog).

## Round 2 — 2026-11-20, commit e1070bb (`libs`, `tools` = gate commit ee849fe)

Storybook rebuilt once (story-shots called it stale: only `app-shell.full-height.spec.ts` was newer). Shots `tmp/story-shots/071/r2` (account panel, print, rail story; 360 · 1024 · 1280 L/D, `--full --axe`, `--compare=new-r1`), mutating measures `r2-m` (print emulation, rail menu open, size sweep), measures `review/r2-a.js`, `review/r2-m.js`, logs `review/r2-a.log`, `r2-m.log`. Print emulation, done in place this time: `@media print` → `all` and `@media screen` → `not all` on the same rules, so source order and weight stay as in a real print (r1 cloned the rules to the end of the page). axe: 0 violations in 47 shots.

**Unchanged stories:** r2 vs the developer's `new-r1`: 12 / 12 identical at 360/1280 (rail 360 D timed out once in `r2`; `r2-m` rendered it). The developer's compare (`cmp-r1a/b`, 74 stories, built from the same source): 290 identical; the 6 sidenav differences re-shot against the baseline (`r2-cmp`, `r2-cmp2`): *Action Items* 1280 L/D and *Lazy Children* 1280 L identical now; *Themed Rail Badges* 1280 D and 360 D are byte-equal to `cmp-r1b`/`r1-cmp` (the known outliers), 360 L identical when re-shot. The sidenav template and SCSS haven't changed since r1 (only `.ts` JSDoc and stories): flakes.

| Finding | Result | Evidence |
|---|---|---|
| F-1 | fixed | *Account Panel* 360/1024/1280 L/D: labels from the panel's edge: „Dichte“, „Töne“, „Tastenkürzel anzeigen“ 16, „Profil“ 16, „Abmelden“ 16 (r1: 48), panel x 17 → x 33 at 360. Parts: `lc-menu__items--has-toggles` („Darstellung“) and `lc-menu__items`; „Hell“/„Dunkel“ unchanged at 80 (swatch 48/20). Current bar `::before` 3 × 44 at x 0, label 13 px beside it, 600; rows 44 high; scrollWidth = viewport. sm/lg class prototype: items and control labels both at 12 / 20. Shots 360 L and 1280 D viewed |
| F-2 | fixed | emulated print, *Print*, *Full Height Nav*, *Full Height Nav Horizon* at 1024/1280 L/D: columns `1024px` / `1280px` (screen 240 + 784 / 1040), areas header / body / end, `.lc-app-shell__body` x 0, width 1024 / 1280, nav wrapper `none`, `lc-header` `none` 0 × 0, scrollWidth = viewport; 360 one column as before. *Full Height Nav* keeps its tint in print because the story sets `--lc-app-shell-bg-image` (documented: a set hook wins); *Print* `none`. Print shot of *Full Height Nav* at 1280 L viewed: no empty nav column |
| F-3 | fixed | rail 1024/1280 L/D: rail (`aside` = `.lc-sidenav`) 17–73, item 25–64, panel x 81: 8 px from the rail's edge (r1: −1), 64 from its left, top Δ 0, `aria-expanded="true"`, panel 220 × 284 inside the viewport. JSDoc (`railItemClick`) and story description and code use `closest('.lc-sidenav')…right + 8`. Shot 1280 L viewed |
| N-3 | fixed | `railItems` JSDoc: „a `kind: 'action'` entry … is current only by `current`, never by a route“ |

AC-7 is now a pass on layout too (it was „layout F-1“ in round 1), and AC-20 passes without F-2. Every other AC row from round 1 is unchanged; r1 touched only the menu part class, the app-shell print block and JSDoc/stories.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| — | — | — | — | no new findings |

Still open for the release (backlog): N-1 (the second `role="menu"` part has no name), N-2 (cut-label description repeats the label), AC-26 / 054-n2 (WebKit not runnable here).

**Verdict:** approved. design.md change note r2 records the print block as built (nav wrapper not printed, footer inset 0).
