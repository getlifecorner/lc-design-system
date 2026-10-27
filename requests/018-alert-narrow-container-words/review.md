# Review 018: lc-alert in a narrow container: long words and a narrow layout

## Round 1 — 2026-10-27, commit 096b7e5 (libs = 2a742f1)

Screenshots: `tmp/story-shots/018/`, all from the developer's static Storybook build, which story-shots did not report as stale:
- `r1/`: the 27 baseline stories compared against `baseline`, at 360/1024/1280 in light and dark, `--full`, 162 shots.
- `r1-new/`: the 3 new stories at 320/360/1024/1280 in light and dark, `--axe`, 24 shots. All 24 are hash-identical to the developer's `final/`.
- `r1-100/`: story 2 at 100 % text, 320/360.
- `r1-ax/`: roles and focus.
- `r1-density*`: containment probes.

Logs are in `tmp/018/review/` and the measure is in `tmp/story-shots/018/review-measure.js`. I opened 4 shots.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass (as designed) | Story 1 computes `break-word` / `auto` at 123 px, and the wide alerts in story 2 at 1024/1280 compute `normal` / `manual`. Design §1 limits the spec's unconditional wording to the narrow layout because of AC-7. The remaining wide-layout limit is S1. |
| AC-2 | pass | DE at 320/360/1024/1280: alert 123 × 895. Icon, title and content x = alert x + 25, width 73. Text right edge −28.5 px from the alert edge, elements −1. `scrollWidth − clientWidth` is 0 for the alert, title and content. Page `scrollWidth` 320 / 360. |
| AC-3 | pass | EN alert 123 × 566 (text −30.9); `lang=""` alert 123 × 860 (text −27.5), breaks without hyphens (shot `r1-new/…narrow-container--320-light`). |
| AC-4 | pass | Story 2 at 360 / 200 %: alert 296, padding 24, icon x 57, title x 105 at the icon's y (57), content x 57 width 246. At 1024/1280 the layout is wide (padding 32, body `block`). Story 3: the 240 and 257 px alerts have padding 12 and title x = alert x + 49; the 258 px alert has padding 16, x + 53. Story 2 at 100 %: padding 16, title x 69. |
| AC-5 | pass | × is 36 × 36 at 200 % (right edge = inner right + 8, as in the wide layout) and 28 × 28 at 100 % (+ 4). Inline button, link and stacked buttons start at x = inner start (57 / 29); every element right edge is −1. Stacked buttons are 246 wide and 16 apart at 200 %. The link is 206 × 294 at 320. The design values at 200 % are corrected (change note). |
| AC-6 | pass | Every alert width equals the baseline. In the density story, 0 of 249 element boxes move with or without `container-type` (0.001 px). |
| AC-7 | pass, with N1 | 159 of 162 shots identical, 3 different. The 2 expected ones are density side-by-side at 360 L/D (51.3 px alerts, narrow). The third is density 1280 light, explained in N1. |
| AC-8 | pass for the new layout | No new colour, transition or forced-colour rule (Jest and the SCSS diff). The dark shot `r1-new/…narrow-layout--360-dark` matches the §5 colours. A pre-existing failure was found (S2). |
| AC-9 | pass | Roles are `alert`/`assertive` for error and warning and `status`/`polite` for info and success. The icon is `aria-hidden` except "Warnung" (`role="img"`). With the body `display: contents`, title and content stay visible to screen readers (axe `isVisibleToScreenReaders`). Focus follows DOM order: Hinweis schließen → Erneut versuchen → link → Zweiten Passkey einrichten → Später, all `tabIndex` 0 with a solid `:focus-visible` ring. Names are intact even where the labels break visually. axe 4.14 found 0 violations in 24 shots. Limit: `016/ax-pass.mjs` needed approval and was not run, and no audible screen reader was tested. |
| AC-10 | pass (22) | build.md reports compat 22 PASS. Angular 21 is checked by the release-manager and CI. The change is static CSS. |
| AC-11 | pass | The docs bullet and the story 1 description carry the §7 text; the `lang=""` block shows it. |
| AC-12 | pass | `alert.component.spec.ts` is untouched, and `alert.narrow.spec.ts` adds 16 tests. The changelog draft names G-WL4, 123 px and +111.4 → 0. |

**API (§2):** no new input, output, slot, type or hook. The class JSDoc bullet and the `AlertActionsLayout` line match §2. Story IDs and names match §8, and `textSize` has a description and `table.defaultValue`.

**Deviations:**
1. Accepted. The exact-list assertion had to grow because the design added a setter; the reason is stated and nothing was weakened. Added to the design as R1b.
2. Accepted. "Ihre Änderungen wurden gespeichert." fits the story's Sie form. The × at + 8 is correct, and §9 is corrected.
3. Confirmed, and worse than build.md says. At 320 / 100 % the text does not stay "inside the alert": it runs under the × (S1).

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| S1 | should-fix (changelog now, follow-up gap) | story 2 at 100 %, 320, both themes (wide alert, 288 px) | No text under a control (1.4.10 at 320 CSS px) | "Benachrichtigungseinstellungen" ends at x 286.97 and the × starts at 263, so the text runs 24 px under the × and the × paints over "en" (`r1-100/…320-light`). This is pre-existing in 3.13.0: the wide layout is unchanged by design (§1 premise corrected, R3). The changelog's "Known" line must name it next to R5. The draft names only the inline button, which at 288 px gives the title a 61.7 px column and lets "fehlgeschlagen" overflow it by 41 px. Follow-up gap: word breaking in the wide layout. It needs its own diff list, because `break-word` alone orphans "fehlgeschlage\|n" in *With Action* at 360, and `hyphens` changes 6 shots. |
| S2 | should-fix (follow-up patch) | every dismissible alert, dark | × at least 3:1 (1.4.11) | `.lc-alert__close` sets no `color`, so the UA `buttontext` (rgb 0,0,0) applies. On the composited info fill rgb(18,31,44) that is **1.26:1**; light is 16.73. Pre-existing, and out of scope (no colour change). Fix: `color: inherit`, which gives text-primary at ≥ 13.6:1 (§5) and changes the dismissible shots. |
| S3 | should-fix (follow-up) | story 2 at 200 %, 320/360 | Button labels break between syllables | The stacked `lg` labels break at the last letter that fits: "einrichte\|n" at 360, and "Zweit\|en Passk\|ey einric\|hten" and "Späte\|r" at 320. It is the same mechanism as next-step-card TD-1 (`anywhere`, no hyphens). Nothing leaves the box. Follow-up: a button `hyphens` hook for the narrow rows of the alert and the next-step-card. Address links are excluded. |
| N1 | nit (changelog) | `design-tokens-density--side-by-side` 1280 light (1024 light in one run) | build.md calls this "font-loading noise" | The containment causes it. Injecting `.lc-alert { container-type: normal }` restores the baseline hash, and 0 of 249 boxes move. Rows 74–87 are breadcrumb text outside any alert, and no web font is loaded. It is a raster side effect, not layout. Possible Compatibility half-sentence: screenshot tests can show anti-aliasing changes in text elsewhere on the page, and no box moves. |
| N2 | nit (in S1's follow-up) | story 2 at 320 / 200 %, dismissible | — | The title gets a 106 px column beside the icon and the ×, giving 8 lines of 1–2 syllables ("Be-\|nach-\|richti-\|…"). Hyphens keep it beside the icon (AS-32 rule). It stays inside the box. |

**Verdict:** approved. No must-fix: G-WL4's case and every AC pass. S1–S3 are pre-existing or follow the TD-1 pattern, so they go to the release notes and into follow-up gaps.
