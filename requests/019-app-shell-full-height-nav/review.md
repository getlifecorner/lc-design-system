# Review 019: App shell full-height nav, sidenav text brand, shell background, stat-trend sentiment

## Round 1 — 2026-10-30, commit 8e1035b (libs/tools = gate commit 5bc951a)

Screenshots: the developer's `tmp/story-shots/019/new` (9 stories) and `…/build` (270 compare shots), from the static build story-shots accepted as current. My runs are in `tmp/story-shots/019/r1/`: `axe` (9 stories, 360/1280, light/dark, 36 shots), `sticky`, `ring` (measure: `r1/ring-measure.js`), `collapsed*`, `badge*`, `pill`. Logs: `tmp/019/r1/`. I opened 12 shots: full-height-nav 1280 L/D and 360 L, horizon 1920 L, tinted 360 L and 1280 D, text-brand 1280 D, collapsed 1280 L, German 1280 D, drawer German 360 L, costs 360 L, sentiment 1280 D.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | Jest pins the class. `diff -rq baseline build`: 191 of 270 identical. The 79 that differ are 42 stat-trend shots (the AA fix), 8 badge-ring shots (the §2 list), and 26 shots of 7 tall stories that the build compare took without `--full`; `tmp/019/full` re-shot them `--full`, and all 42 are identical. The other 3 are flaky: sidebar-first-layout 1024/1280 D are identical in `reshoot`, and drawer-mode 1280 D is identical in `reshoot2`. |
| AC-2 | pass | `r1/sticky` adds a 2,400 px spacer in main. After an 800 px scroll the nav is at 0,0, 240×900 (280 at 1920), and it is still there at the end (y 2,583–2,647). The header is at y −800, x 240/280. The developer's `fh.log` could only scroll 183–247 px. |
| AC-3 | pass | `fh2.log`: rects are equal with and without the class at 360/768. The 360 shot shows the header and the bottom bar, with no nav. |
| AC-4 | pass | A hook value of 300 px gives a 300 px nav with the header at x 300 (`fh2.log`). Jest covers the empty-nav fallback and the inset (header `padding-left: 0`). |
| AC-5 | pass | The skip link "Zum Inhalt springen" is the first focusable and points to `#main`, which exists. Tab order: skip → header → brand → items → collapse. There is 1 banner, 1 navigation and 1 main at every width. axe 4.14 found 0 violations in 36 shots. |
| AC-6 | pass, see S1 | The footer is at x 0 and full width, with its content at x 240/280. The horizon spans the full width under the transparent rail. The aside is at x 920 (1280) and 1460 (1920). The 1920 shot shows no seam. |
| AC-7 | pass | Petrol rail: name 12.1, items 8.51, active text and bar 6.21, tile 6.21, toggle 8.51. Ring 3.02 L / 6.97 D (`r1/ring`). |
| AC-8 | pass (22) | compat 22 passes, with 3 new checks. Angular 21 was not run (`--only=22`); see the task. |
| AC-9 | pass | Jest pins the default DOM. Sidenav baselines: 0 diffs outside the §2 list. |
| AC-10 | pass | The link is 223×44 (223×52 with 2 lines), and 44×44 at x 5.5 when collapsed. The tile is `aria-hidden` (Jest). The only axe `label-content-name-mismatch` result is *incomplete*, on the letter tile "F": one-character text is always incomplete. |
| AC-11 | pass | The brand block is 64 px, the same as the header's 64. The name's centre is at 31.5 and the title's at 32. |
| AC-12 | pass, see N1 | The toggle is 44×44 at x 23 (story x 17 + 6) in both states. Its label switches between "Collapse navigation to the left" and "Expand navigation", and focus stays on it after both clicks. The collapsed link stays an `a`. Its `::after` reads "Finance Intelligence" on `:focus-visible`. |
| AC-13 | **fail** | F1. A `theme="light"` rail on a dark page: brand and item ring 1.89:1, active bar 1.76:1. The other pairs measure 4.37 / 4.44 / 10.25. The forced-colors rules are present (Jest, scss 664–675). |
| AC-14 | pass | The DE names wrap to 2 lines. `scrollWidth = clientWidth` holds for the name, the rail and the document at 240 docked and in the drawer at 280 (360) / 320 (1280). Close is 44×44 at 10/10, 4 px after the link. |
| AC-15 | pass | The 4 hooks are in the class JSDoc and the app-shell docs table (the MCP reads the stories' description). They are also in `colors.mdx` › Page sky. |
| AC-16 | pass | `tint.log`: the gradient shows in both themes and the land paints over it. The bar is at y 810 and the last content ends at 567.5. Shell baselines: 0 diffs. |
| AC-17–19 | pass, see N2 | Jest covers these. Costs shows "↑ +3,1 %" with the hidden text ", gestiegen, ungünstig", and the arrow is `aria-hidden`. |
| AC-20 | pass | Negative 10.98 / 8.38, positive 4.85 / 6.25, neutral 6.87 / 9.97 (light / dark). |
| AC-21 | pass | The 9 stories have the §8 IDs. The 9 new inputs each have `description` and `table.defaultValue`. `test:tools` passes 22/22. |
| AC-22 | pass (22) | The gates ran on 5bc951a, and libs/tools are unchanged at HEAD. The changed AS-4 assertion is stricter and keeps the same fallback, so it is accepted. |

**API (§2):** names, types, defaults and JSDoc match. `AppShellNavPlacement`, `StatTrendSentiment` and `StatTrendLabels` are exported.

**Decision on build.md's open point (1.89:1 ring):** fix it in this release (F1). The brand link is new and AC-13 requires a ring of at least 3:1 on the very story that shows this pair. §5 missed the pair, and design.md now has a change note for it.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F1 | must-fix | text-brand 1280 dark; collapsed-rail-badges dark; any `theme="light"` rail on a dark page | `:host(.lc-sidenav-container--light)` sets `--_lc-sidenav-t-accent: #208497`. Every sidenav `:focus-visible` outline reads `var(--_lc-sidenav-t-accent, var(--color-primary-500))`. The bar default becomes `var(--lc-sidenav-active-indicator, var(--_lc-sidenav-t-accent, var(--color-primary-500)))`. A light rail then measures ring 4.37 and bar 4.06 on either page. The dark theme gets no accent: it measures 4.44 / 3.98 on a light page and 10.25 / 9.2 on a dark one, so its light shots stay as they are. Update the hook docs (stories l. 185, JSDoc l. 70) and add a Fixed line to the changelog | The ring is #84c7d4 on #fff, 1.89:1. The bar is #84c7d4 on #f0f8fa, 1.76:1 |
| S1 | should-fix | full-height-nav-horizon 1024–1920 | First item at y 112, as in `below-header`: a brand block of 64 plus the 48 px padding. The story puts a brand at the top of the rail (`brandName` or `showLogo`, same `logoSize` as the header) and turns the header's logo off. The `navPlacement` JSDoc and argType say that full-height expects a brand block at the top of the rail | The first pill is at y 48 (192×48), straddling the 64 px header. The eyebrow is at y 120 |
| N1 | nit | text-brand-collapsed-vs-expanded | The collapsed tooltips (brand and items) are visible on hover/focus | The story's frame `div` (`overflow: hidden`, 58 px) clips them. Use `overflow: visible` on the rail frames |
| N2 | nit | costs, sentiment | The change text reads "+3,1 %, gestiegen, ungünstig" (braille) | It reads "+3,1 % , gestiegen", with a space before the comma from the template whitespace. Put the sr `<span>` straight after `{{ change() }}` |

**Follow-up (pre-existing, not this request):** `lc-badge` inside a `theme="light"` rail on a dark page keeps the page's dark badge colours. axe reports a `color-contrast` violation on 3 badges (error, warning, success) in collapsed-rail-badges 1280 dark. This build left the badge and rail colours unchanged: badge styles are untouched, the rail was #fff before, and the 2 px ring is ignored by axe. A fix needs theme scoping below `:root`, and the themes are `:root`-only today.

**Round 2 checks:** `ring-measure.js` on text-brand 1280 L/D gives the light rail 4.37 / 4.06 on both pages, and the values above for the dark rail. Hash, vs `019/build` and `019/new`: diffs only in collapsed-rail-badges 1024/1280 D, text-brand D and full-height-nav-horizon (S1). Compat on 21 and 22.

**Verdict:** changes requested

## Round 2 — 2026-10-30, commit f8bfaa4 (libs/tools = gate commit 1129403)

Inputs: the developer's `019/r2/*` and `tmp/019/r2/*.log`. My runs are in `tmp/story-shots/019/r2-review/` (`ring`, `fh-ring`, `s1`, `n2`, `flaky`). I opened 8 shots: horizon 1280 L, 1920 D and 360 L; text-brand 1280 D (light rail focused); collapsed-rail-badges 1280 D; n1-brand 1280 L; full-height-nav 1280 D, r1 and r2.

| AC | Result | Evidence |
|---|---|---|
| AC-1, 9 | pass | `diff -rq 019/build r2/build`: 10 of 270 differ. collapsed-rail-badges 360/1024/1280 D = F1 (light rail bar, drawer close ring #208497). sidebar-first-collapsed and -prominent-brand 1024/1280 L (1 px scrollbar edge, auto-theme rails that F1 doesn't touch), sidebar-first-layout 1024/1280 D and with-badges 360 D: known noise |
| AC-6 | pass, S1 closed | `s1`: nav 0,0,240×900 (280 at 1920), brand block 64 = header 64, brand link 200×44 at x 24, **first item y 112** at 1024/1280/1920, header x 240/280, no header logo |
| AC-7 | pass | `fh-ring`: petrol rail as in r1: ring (brand, item, toggle) 3.02 L / 6.97 D, bar 6.21 |
| AC-8 | pass | compat PASS on 21.0.9, 21.2.25, 22.0.8 and 22.2.4 (`tmp/019/r2/compat.log`, c9fd0be; only `sidenav.stories.ts` changed after) |
| AC-10, 12 | pass, N1 closed | The collapsed brand tooltip (134.5×28) and the item tooltip paint above the next rail, and no ancestor clips them (`n1b.log`, shot n1-brand 1280 L) |
| AC-13 | pass, F1 closed | `ring` 1280: the `theme="light"` rail has ring (brand, item) 4.37 and bar 4.06 on the light and on the dark page. The `theme="dark"` rail measures 4.44 / 3.98 on the light page and 10.25 / 9.2 on the dark one. collapsed-rail-badges gives the same pairs. The hook docs and the changelog Fixed line are in |
| AC-19 | pass, N2 closed | `n2`: Costs reads "↑ +3,1 %, gestiegen, ungünstig" with the arrow `aria-hidden`. Without a sentiment (up-trend) the text is still " +12.5% " |
| AC-22 | pass | The gates ran on 1129403, and `git diff 1129403 HEAD -- libs tools` is empty |
| others | pass | Unchanged since r1 |

**`019/new` vs `r2/final`** (18 differ): horizon 8 (S1), text-brand 360/1280 D (F1), collapsed-vs-expanded 4 (N1 frames), and noise. My re-shoot (`flaky`) gives full-height-nav 1024 L identical again, while drawer-german 1280 D now differs. full-height-nav 360/1280 D still differ from r1, but the rail colours equal r1 (`fh-ring`), and the 1280 D pair shows no visible change, so these are raster diffs.

**Deviation 8 (answer):** yes. In full-height the brand sits in the rail, so the header names the page, not the product (design §9 risk 3, as in Full Height Nav with "Übersicht"). In the Horizon story the header title becomes "Heute" (the current item), and the subtitle "Unser Haushalt" stays. design.md §8 is updated.

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| S2 | should-fix | full-height-nav-horizon 1024–1920; `navPlacement` JSDoc, argType, docs paragraph | The header title is "Heute", so "Produkt" shows once (in the rail). The guidance adds: "the header's `title` then names the page" | "Produkt" shows twice: `lc-header__title` at x 264 and `lc-sidenav__brand-name` at x 78, both at y ≈ 32 |
| N3 | nit | full-height-nav-horizon 1024–1920 | No divider that stops at the rail edge: the story sets `--lc-sidenav-border: transparent` (the transparent rail has no border-right anyway) | The brand block's 1 px `border-bottom` (pre-existing on `.lc-sidenav__logo`) runs x 0–240/280 at y 64, under a header that has no border |

**Follow-ups (not this request):** the r1 badge note stands. Full-height guidance turns the header logo off, so below 1024 px, where the rail is hidden, no brand shows (Full Height Nav and Horizon at 360). A way to keep the header logo below 1024 px only is a candidate for a later request. The consumer's concept decides the phone header until then.

**Verdict:** approved. No must-fix; S2 and N3 stay open for the release notes.
