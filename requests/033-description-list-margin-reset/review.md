# Review 033: lc-description-list resets the browser's dd margin

## Round 1 — 2026-11-02, commit c120aa2 (libs/tools = gate commit 628200a, `git diff --stat 628200a HEAD -- libs tools` empty)

Screenshots: `tmp/story-shots/033/r1/` (48 shots: new story + the 7 baseline stories, 360 · 1024 · 1280, light · dark, `--full`, `--compare=tmp/story-shots/033/baseline`, measure `/zz-033/m.mjs` = `review-measure.js` + value widths). Result: **20 different / 22 identical / 6 new**, the same set as `build.md` and design §2. Opened 7 shots: new story 360 L + 1280 L; leaders, stacked, long values, value suffix 360 L; card footer-slot 360 L. Dark not opened: no colour change, and every measure line is identical in light and dark.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | every row of all 8 stories `m0` (4 sides 0 px) in rows, leaders and stacked (new story toggles), 360/1024/1280 × L/D; spec `resets the browser margin of term and value (BA-8)`; SCSS `margin: 0` first in `&__term` / `&__value` |
| AC-2 | pass | new story 360: rows `m0 1 8 <dx> 0` × 6, list `262x227` (baseline design: 290, rows 1/4/5 on 2 lines); value widths 116.7 / 116.7 / 44.5 / 113.1 / 107.1 / 81.2. Width 262 instead of the spec's 328 as argued in design §9 (the requester's real list; 328 fitted before too) |
| AC-3 | pass | `…--long-values-and-times` 360: e-mail 2 lines, width 238.1, row overflow 0 (shot: wraps at "brandt-", no overflow); 3.3 stylesheet test unchanged |
| AC-4 | pass | new story 1024/1280 = 360 strings; stacked toggle `m0 1 - 0 0` × 6 (262x372); `…--stacked` value − term 0, width 280 × 5 at all widths; shot: values flush left under the terms |
| AC-5 | pass | measure output identical light vs dark in all 48 shots; L and D differ from the baseline in the same 20 shots (10 pairs) |
| AC-6 | pass | 6/6 German values on one line at 360; shot 360 L |
| AC-7 | pass | markup pinned by the new spec; compat 22: 88 prerendered-HTML checks ok; Jest 4924 passed (+2, none edited) per `build.md`; no `.ts`/`.html` change in the component |
| AC-8 | pass | "makes rows keyboard-operable when clickable" unchanged; row box unchanged (38 px rows), so the ring geometry can't move |
| AC-9 | pass | `components-description-list--short-values-at-phone-width` renders; name, args, render, `moduleMetadata` and docs text as design §8; key-features bullet present |
| AC-10 | pass (draft) | `build.md` draft names BA-8, both pages, 2 → 1 line, 290 → 227 px, 72 → 32 px, leaders 48 → 8, stacked flush, e-mail 198 → 238, migration line. One wording fix: finding 1 |

API (§2): no input, output, slot, hook or type change; argTypes untouched; the new story adds no argType. Matches.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix | CHANGELOG draft (`build.md`), Compatibility bullet | "… render pixel-identical (`rows`, dashed separator and wide value-suffix rows: 16 of 36 description-list story shots at 360, 1024 and 1280 px, light and dark). The other 20 change as described above." | names "a card footer" and "22 of 42": `components-card--footer-slot` is identical only because its list doesn't render (finding 2), so it is no evidence. Design §2 was wrong here and is corrected (change note) |
| 2 | nit (follow-up, out of scope) | `components-card--footer-slot`, all widths | the card body shows the 3-row description list | empty body between header and footer: `card.stories.ts` imports only `IconComponent`, `BadgeComponent`; measure 0 rows, list box 294×0. Fix in a separate request (add `DescriptionListComponent`, check `ButtonComponent`) |
| 3 | nit | `description-list.component.scss` l. 29 (`&__term`) | comment fits a `<dt>`, e.g. "No browser margin: the row gap is the only space (BA-8)." | "No browser dd margin (40 px inline start)" on the term block (wording came from design §1) |
| 4 | nit (follow-up, pre-existing, design §5) | description list, light | primary/link value ≥ 4.5:1; clickable-row ring survives forced colours; clickable rows ≥ 44 px | 4.37:1 at 14 px; ring is a `box-shadow`; rows 38 px |

**Verdict:** approved. No must-fix; finding 1 is a text change for the release-manager's changelog entry, findings 2–4 stay listed as follow-ups.
