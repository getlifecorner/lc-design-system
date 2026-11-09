# Build 057: select clear area and focus, table action size, dl whitespace, hero slot colour and fill, list action, chart palette, dense strip, backlog

- **Branch:** `feat/3.37-select-hero-table-a11y-backlog`
- **Commit:** one commit `feat(select,table,description-list,hero,list,state-strip,charts,card): request 057` (amended; gates on tree `faf1c15`)

## Files changed

| Area | Files | Change |
|---|---|---|
| S1/S2 select | `select.component.{ts,html,scss}`, `select.stories.ts`, new `select.tap-area-focus.spec.ts` | D-1 lg `::before` 44 × 44 + `margin-right` 6 px + `:has()` padding 76 px; D-2 `close(returnFocus)`, `(overlayKeydown)` Escape; stories *Clear Tap Area*, *Focus After Tap* (play), *Touch Targets* text |
| T1 table | `table.component.{ts,html}`, `table.stories.ts`, new `table.action-size.spec.ts` | D-3 `TableAction.size?: ButtonSize`, `[size]="action.size ?? 'xs'"`; story *Action Sizes* |
| D1 dl | `description-list.component.{html,scss}`, `.stories.ts`, new `.whitespace.spec.ts`; pins in `.badge-total`, `.semantics`, `.wrap` specs | D-4 `&ngsp;` separators, `.lc-dl__sep` (0 px); story *In a Labelled Card* |
| H1/H2 hero | `hero.component.{ts,scss}`, `hero.stories.ts`, `_theme-light.scss`, new `hero.slot-fill.spec.ts`; `theme-modes.spec.ts`, `button.styles.spec.ts`, `button.inverse-outline.spec.ts` | D-5 body `color` rgba, `lc-hero lc-badge` light palette; D-6 `fill` (`booleanAttribute`, host class); stories *Badges in the Body*, *Fill*, argType `fill` |
| L1/B list | `list.component.{ts,html,scss}`, `list.stories.ts`, new `list.split-row.spec.ts`; `list.focus-item.spec.ts`, `list.chevron.spec.ts` | D-7 split row + native button; D-10 `hyphens: auto`; story *German Labels* |
| C1 charts | `internal/chart/chart-palette.ts`, `theme-contrast.spec.ts` (3.37 block), `bar-chart.label-layout.spec.ts` | D-8 entries 3/4 → `--color-text-success`/`-warning` |
| SS1 strip | `state-strip.component.{ts,html,scss}`, `.stories.ts`, new `.scrub.spec.ts` | D-9 scrub layer, `--hovered`, `segments` JSDoc, *Many Segments* text |
| B card | `card.stories.ts` | *Collapsible*: footer on the 2nd (closed) card |

## Acceptance criteria

| AC | Covered by (measured in `tmp/057/measure-a.log`, `measure-fat.log`) |
|---|---|
| 1 | spec (rules, click clears); *Clear Tap Area* 360/1024/1280: hit scan from × centre 22/21/22/21 px → area 259–303 × 16–60 (44 × 44), area right = chevron left 303, chevron left + 0.5 → combobox |
| 2 | select stories vs `proto-select`: **66/66 identical**; spec pins xs/sm/md paddings; temp DOM spec: every size, value, disabled, loading, multiple, open panel identical to 3.36 |
| 3 | `--axe` 360/1280 L/D: 0 violations, `target-size` not incomplete; `::before` content "" / no background, outline, border; ring rule unchanged |
| 4 | spec: clear → `null` and placeholder, `clearAriaLabel` EN/DE, native button |
| 5–8 | spec (body tap, handler focus kept, Escape body/trigger/modifier, keyboard, search, backdrop, multi, `change` then `closed` once, no press handler); browser replay: tap → trigger, Escape on body → trigger, backdrop → body |
| 9 | spec xs/sm/md/lg classes, icon `sm`; *Action Sizes* 360/1024/1280: sm 38 / 30, lg 48.5 / 45.59 px, icon 20 (at 360 the table scrolls, as before) |
| 10 | table stories vs baseline 150/162; the 12 others = the known random *Full Featured*, *With Filtering*, *With Pagination* 1024/1280 (pixel diff only x 826–893 / 1031–1102, the Salary column); temp DOM spec (see Deviation 3) |
| 11, 12 | spec (all cases incl. badge + suffix, total, clickable, stacked); axe pass + negative control; *In a Labelled Card*: `label-content-name-mismatch` and `nested-interactive` pass, `.lc-dl__sep` 0 px |
| 13 | card, dl, accordion, strip stories vs baseline **270/270 identical**; temp DOM spec: 16 cases identical once the added spaces are dropped |
| 14 | spec: 6 variants × 9 colours × dark + pastel × both ends, light palette in both themes: min default 6.86, primary 8.48, success 4.85, warning 5.52, error 10.97, info 9.08 |
| 15 | *Badges in the Body* `--axe` L/D: 0 violations (30 `color-contrast` incomplete = gradient text); body `rgba(255,255,255,.85)` opacity 1, light `rgba(31,41,55,.75)`; badge opaque `#855a22` on `#fdf4e4` in dark too |
| 16 | hero + inverse + character vs `proto-hero`: 114/126 identical, 12 AA-only (Deviation 7) |
| 17, 18 | spec (host class, rules, no class without `fill`); *Fill*: `updateStoryArgs` over 3 variants × 3 sizes × 9 colours at 360, 1024 and 1280, L/D: 81/81 Δ 0 each, content top = padding, footer bottom = padding; `fill` false: band 322.67 vs card 641.39 (content height) |
| 19 | spec (markup, name = 3.36 name, axe, Tab order, clicks, `focusItem`); list stories vs `proto-list` **150/150 identical** |
| 20 | `theme-contrast.spec`: 8 entries × 2 themes ≥ 3:1 on page and surface; text-success 5.29 / 8.40, text-warning 6.02 / 7.65; charts vs baseline: 16 stories differ (96 shots), all render palette entries 3/4 by default; 28 stories identical |
| 21 | spec (pick by x, slide, release focuses, beyond cells, cancel, Escape); *Many Segments* 360: scrub 328 × 32, picks at x 32/180/328 → runs 2/16/29 (30) and 4/31/58 (60), `touch-action: pan-y pinch-zoom`, axe 0 violations, **`target-size` 0 incomplete** (was 90) |
| 22 | existing strip spec 16/16 unchanged; strip shots identical; temp DOM spec identical once the scrub is dropped |
| 23 | spec (rule); *German Labels* 360 (shot read): every break ends in „-“ (Kostenstel-len, Leistungsver-rechnung, Buchungs-kreis); EN list stories identical (AC-19 row) |
| 24 | *Collapsible*: closed footer `display: none`, open `flex` 48.5 px, closed again `none` |
| 25 | No Playwright/WebKit installed: 054-n2 not checked, stays in `requests/BACKLOG.md` (release-manager re-adds it) |

## Gates

All gates ran on the tree of commit `faf1c156b641009d9d05f802cdff59fe9f662c64` (skip a gate while `git diff --quiet faf1c15 -- libs tools` holds; the amend after it adds only `requests/`). Logs in `tmp/057/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 298 suites, 6230 passed, 8 skipped (`--maxWorkers=4`; +6 suites, +78 tests). One earlier run lost `icons.spec.ts` to a worker SIGSEGV; rerun clean |
| `npx nx run angular-ui-kit:lint` | 0 errors, 160 warnings (none in changed files) |
| `npx nx run angular-ui-kit:build` | green, 122 entries built |
| `npm run test:tools` | tools unchanged |
| `npx nx run angular-ui-kit:build-storybook` | green, 1116 stories (+7) |
| Story screenshots | `tmp/story-shots/057/build-{select,hero,list,charts,dl,table}` vs §header folders (above); new: `build-new` (7 × 360/1024/1280 × L/D); measures `measure-a` (`--axe`, 0 violations) |
| `node tools/compat/check-angular-majors.mjs --only=22` | PASS, 110 HTML checks (unchanged set) |

## Deviations from the design

1. D-4: the 0 px `.lc-dl__sep` also stands before a suffix after a **badge** (§3: after `<a>`/`<time>` only); without it the text read „Geladenvollständig“ (AC-11). 0 px, shots identical.
2. *In a Labelled Card*: „time + suffix“ instead of „link + suffix“ (a link in a `role="button"` card is a nested control); the link path is in the unit test. No card `title` (see F-4).
3. T1: binding `[size]` drops the static `size="xs"` attribute of the action's `<lc-button>` host (nothing reads it; classes and look identical). Otherwise the default table DOM is identical (temp spec).
4. Specs changed with reason (assertions kept): dl default-markup pins + „1 Freigegeben“, „Summe,  Gesamtkosten Ist“ (the separators are the fix); dl `wrap` allowlist + `lc-dl__sep`; `theme-modes` light rail rule is now the list `…nav-badge,\nlc-hero lc-badge`; list `focus-item`/`chevron` find a row-with-action's button as `.lc-list__item-button`; `bar-chart.label-layout` maps the palette swap back before the 3.20.0 hash; `button.styles`/`inverse-outline` keep their values at the 3.36 opacity .85 as a constant (lower bound) and assert the body has none.
5. Floored pins vs §5 rounded: badges 6.86 / 8.48 / 10.97 (§5 6.87 / 8.49 / 10.98); palette light 5.29 / 6.02 (§5 5.30 / 6.03).
6. Text beyond §8: hero component docs, *With Media* and *Stage Actions* no longer say „under the body's 85 % opacity“; 3.37 lines in the table, dl, hero, list and strip docs.
7. Hero shots vs `proto-hero`, 12 of 126 differ: button *Inverse Outline* 2 px (360) / 2144 px (1280), max Δ 1–2; character *On Dark Surface* 360 3 px (Δ ≤ 18); hero *Focus Title* ≤ 144 px (Δ ≤ 11). Deterministic over two runs; anti-aliasing, not layout.

Follow-ups for `release.md`: design §5 F-1 (hero body text < 4.5:1 on 6 bands, should-fix), F-2 and F-3 (nits); **F-4 (new, should-fix?, jsdom only):** `lc-card` with `title` runs title and body together in the text („Kostenstellenaus USM …“), so a clickable card with `title` and `ariaLabel` = visible text still fails `label-content-name-mismatch`; the requester's tiles have titles. 054-n2 (backlog, no WebKit).

## Changelog draft

```markdown
## [3.37.0] - 2026-11-10

Finance Intelligence's toolbars, tiles and stages without workarounds: a 44 px clear target and focus that stays on the select, a size for table actions, word breaks in description lists, badges at full contrast on the hero and a hero that fills its row, plus the three open items of 3.36 (list row actions, chart palette, dense state strips). No API breaks.

### Added

- **`TableAction.size`** (services-2026-11-09 row 3): `ButtonSize`, default `xs`. `lg` is 48.5 px high with a label and 45.6 px icon-only (a 44 px target), `sm` 38 / 30 px; the icon stays 20 px. Pass the size per breakpoint yourself.
- **`lc-hero` `fill`** (cockpit-2026-11-09 row 1): in a grid or flex row that stretches its items the band ends at the row's bottom edge (0 px over every size, colour and variant at 360 and 1280 px); content stays at the top, `[hero-footer]` at the bottom. Without it the hero is as tall as its content.

### Fixed

- **`lc-select` `size="lg"` clear button** (services-2026-11-09 row 1): takes taps on 44 × 44 px; the area ends at the chevron's left edge, so the chevron still opens the list. The × sits 8 px further from the chevron and the text ends 76 px before the field's edge. The 24 px button, its ring and axe `target-size` are as before; xs, sm, md and a select without a value are unchanged.
- **`lc-select` focus after a tap** (services row 2): a tap or click on an option of a single select returns the focus to the trigger (it fell to `<body>`), and so does `Escape` when the focus is on `<body>`. Keyboard choice, the search field, a backdrop click and multi-select behave as before; `selectionChange` still comes before `closed`.
- **`lc-description-list` word breaks** (regeln-2026-11-09 row 1, WCAG 2.5.3): the text reads „aus USM übernommen 1 im Modul gepflegt 2“ (was „…übernommen1im Modul gepflegt2“) in `textContent`, accessible names and copied text, also with badges, suffixes, links, times and totals; a clickable card whose `ariaLabel` is its visible text passes axe `label-content-name-mismatch`. Nothing visible changes.
- **`lc-hero` default slot** (monatsstand-2026-11-09 row 1, WCAG 1.4.3): the body softens its text through its colour (85 % white; 75 % neutral-800 in `light`) instead of `opacity: .85`, so badges, buttons and links in it keep full opacity, and `lc-badge` in a hero takes the light palette in both themes. Every badge variant reaches 4.85:1 or more on all nine bands (success 4.85, warning 5.52; before 3.83–4.67 in light, down to 1.00 in dark). The body text looks as before.
- **`lc-list` `clickable` row with an `action`** (3.36 Known, WCAG 4.1.2): the action is no longer inside the row's `role="button"`; the row holds a native button, named by the row, beside the action. axe `nested-interactive` passes; one Tab stop for the row, then the action; names, keys and look unchanged.
- **`lc-state-strip` with 13 or more runs** (3.36 Known, WCAG 2.5.8): the pointer uses the whole strip: pointing at it or sliding a pressed finger along it shows that run, releasing focuses it; vertical scroll and zoom stay. axe `target-size` no longer reports the 30 / 60 narrow cells.
- **`lc-list` labels** hyphenate long German compounds in the page's `lang` instead of breaking inside a word at 360 px.

### Changed

- **Chart palette** (3.36 Known, WCAG 1.4.11): entries 3 and 4 are now `--color-text-success` and `--color-text-warning` (light 5.30 and 6.03:1, dark 8.40 and 7.65:1 on page and surface; were 2.47–2.72 and 2.05–2.26:1 light). The third and fourth default series of the chart family change colour; series with their own colour don't.

### Compatibility

- No API breaks: an optional field and an optional input. Defaults render as 3.36.0, apart from the fixes: spaces in the description list's DOM (no visual change), the native button of a clickable list row with an action, the state strip's pointer layer, the hero body's text colour instead of opacity (same look), the lg select clear position with a value, and the two palette entries. A table action's `<lc-button>` no longer carries a static `size="xs"` attribute.

### Known

- WebKit is not automated here: the focus return of the select and the *Focus return (3.34)* stories are checked in Chromium only.
```
