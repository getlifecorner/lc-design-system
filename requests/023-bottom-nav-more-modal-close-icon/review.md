# Review 023: lc-bottom-nav "More" on request; decorative lc-modal close icon

## Round 1 — 2026-10-31, commit 399098c (code identical to 3c23244: `git diff --quiet 3c23244 -- libs tools`)

Screenshots: `tmp/story-shots/023/new` (5 stories × 360 · 1024 · 1280 × light · dark, developer), `nav` and `modal` (compare runs, developer), `r1-probe` (review probes; not at rest). Logs: `tmp/023/shots-*.log`, `tmp/023/review-r1-probe-{de,fixed}.log`. The developer's Storybook build was current (story-shots didn't call it stale). 12 shots opened.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `diff -rq baseline nav`: 42 of 54 bottom-nav shots identical; the 12 that differ are exactly *Default* and *Finance Destination* (D5). Shots `new/…default--360-light`, `…finance-destination--360-dark`: docked surface and 1 px top border now render. Spec diff: additions only (plus the `Router` import). Unit "is off by default and renders exactly as before" |
| AC-2 | pass | *Show More*: 3 `li`, Today / Household / More; unit `[Heute, Haushalt, More]` |
| AC-3 (D2) | pass | unit 4 / 5 / 6 items at `maxItems` 5 → 4 + More, 3 at `maxItems` 3 → 2 + More. Probe *Fixed Slots*: `nav.textContent` has no "Finances", 3 `li`. Code: `showMore` only skips the early return (`bottom-nav.component.ts:190`) |
| AC-4 | pass | *Show More German*: `A` href `/mehr`, label "Mehr". Probe *Fixed Slots*: `BUTTON type="button"`, never current (`aria-current` null); unit: `moreClick` once, icon `bars-3` |
| AC-5 | pass | *Show More* at `/more/settings` and *German* at `/mehr`: exactly one `aria-current="page"` = More/Mehr, `--current`, bold, pill; *Fixed Slots* at `/`: only "Today" current |
| AC-6 | pass | 360 / 1024 / 1280 × L / D, all equal: docked 114 × 64 at x 25 / 139 / 253, floating 102.67 × 64 at x 42 / 144.66 / 247.33 (±0.01), pills 56 × 32, `scrollWidth = clientWidth` (358, 324). Contrast: label 7.56 L / 11.16 D docked, 10.45 D floating; current on pill 7.85 L / 8.14 D docked / 7.63 D floating (all ≥ 4.5) |
| AC-7 | pass | probes: "Mehr" `A`, tabIndex 0, tab order Cockpit → Kosten → Mehr; `focus()` → `:focus-visible`, ring `solid 2px` #208497 offset −2 (L); button ring #84c7d4 (D), shot `r1-probe/…fixed-slots--360-dark`. Name = label only; pill and svg `aria-hidden="true"`, svg no `role`. axe on the 3 new stories: 0 violations in 18 shots |
| AC-8 | pass | `compat-22.log`: "bottom nav "Mehr" on request (023 AC-8)" ok, "bottom nav current item" ok. Angular 21 runs in the release gates and CI |
| AC-9 | pass | `modal.component.spec.ts`: svg `aria-hidden="true"`, no `role`; button "Close modal", then "Schließen"; fails on the old template (`spec-neg.log`: 1 failed, 48 passed) |
| AC-10 | pass | `shots-modal.log`: 40 shots with the modal open, `violations: []` in 40; baseline `svg-img-alt` in 40 |
| AC-11 | pass | `diff -rq baseline modal`: 40 / 40 identical (modal + confirm-dialog, 360 / 1280, L / D, focused close button). Measure: 44 × 44 at x 289 (360) / 887 (1280), svg 24 at +10, ring `solid 2px` offset 2, colours as baseline |
| AC-12 | pass with F1 | changelog draft (`build.md`): Added (row 6, D2 spelled out), Fixed (row 8, confirm-dialog, `KIT_DEFECTS`), Compatibility (no break, role-based test note). One requester hint is wrong (F1) |

**API (§2):** `showMore = input(false)`, JSDoc word for word with `@default false`; JSDoc of `maxItems`, `moreLabel`, `moreIcon`, `moreRoute`, `moreClick` and the class bullet as in §2. argType `showMore`: `control: 'boolean'`, description, `defaultValue 'false'`; `moreRoute` gained `defaultValue "''"`. Story IDs as in §8. Modal: one attribute, no API change.

**Overflow:** probe `moreLabel: "Weitere Datenbasisbereiche"` in the floating German bar: 3 lines, hyphenated "Datenbasisbe-rei-che" (shot `r1-probe/…german--360-light`), no clipping (label 111 / 111, nav 324 / 324), all 3 entries grow equally to 92 px.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| F1 | should-fix (release-manager, changelog) | `build.md` changelog draft, Added, requester hint | Finance Intelligence keeps its `bottomNavActivePath` (`shell.ts:107`): the pages reached through "Mehr" are `/datenbasis/…` and `/verwaltung/…` (`navigation.ts:103–157`), not under `/mehr`, so the kit marks "Mehr" current only on `/mehr` and `/mehr/…` by itself. Bind `[showMore]` to "the role has targets beyond the bar" (`shell.ts:87–92`), not to `true` | "bind `[showMore]="true"` …; the hand-set `activeRoute` for pages reached through "Mehr" is no longer needed." Following it, "Mehr" would lose its current state on `/datenbasis/quellen`, and controllers without more targets would get a "Mehr" entry |

Corrected hint for the changelog: *Finance Intelligence: drop the own "Mehr" item, bind `[showMore]` where the role has targets beyond the bar, with `moreLabel="Mehr" moreRoute="/mehr"`, and keep `[maxItems]="5"`. "Mehr" is current on `/mehr` and its sub-pages; keep mapping other pages reached through "Mehr" (such as `/datenbasis/quellen`) to `/mehr` in `activeRoute`.*

**Follow-up (not in scope, design §1 audit):** `lc-drawer` close icons (`drawer.component.html:35,45`) and `lc-notification-center` item and empty-state icons have the same `svg-img-alt` defect; propose as a new request.

**Verdict:** approved (no must-fix; F1 goes to the release-manager with the changelog)
