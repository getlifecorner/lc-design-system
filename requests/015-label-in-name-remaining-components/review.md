# Review 015: Label in Name (WCAG 2.5.3) for the remaining eight components under axe-core 4.14

## Round 1 — 2026-10-23, commit 3c3d2a8

Screenshots: `tmp/story-shots/015/r1/` (new stepper story at 360 · 1024 · 1280 px, both changed accordion stories at 360 · 1280 px; light · dark; `--axe` and axe 4.14.0 `accessibleText` in `--measure`), plus `r1-expanded/` (RichHeader opened, 1280 light). The Storybook build (14:57) is the developer's, and story-shots did not report it stale. For the unchanged stories I re-checked the developer's `build/` folder with `diff -rq` against `baseline/` instead of re-shooting. Opened 2 shots: Localized at 360 light and 1280 dark. No colours changed.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | r1, all 6 Localized shots: names match §4 exactly ("Schritt 2 von 4: Persönliche Angaben, Bitte geben Sie Ihre vollständige Anschrift ein", "Schritt 3 von 4: Zahlungsmethode, Optional"), and `aria-label` = axe name. RichHeader: "Pipeline run, Item One Complete Meta · detail · info 12:04", where the axe visible text "Item One Complete Meta · detail · info 12:04" is a contiguous run. RichHeaderList: the name equals the visible text in all 3 rows. Jest rows per build.md |
| AC-2 | pass | build.md: old name restored → `violation` in 8/8 axe specs (not re-run) |
| AC-3 | pass | `tmp/015/axe-build-{360,1280}-{light,dark}.log`: `n` 899, `labelBefore` 23 (360) / 31 (1280), `label: []` in all four. See nit 2 |
| AC-4 | pass | same logs: `changed: {}` in all four. r1 `--axe`: `violations: []` in all 14 shots. The only incomplete is `bypass` (isolated story) |
| AC-5 | pass | r1: the stepper name starts with the filled `stepAriaLabel` and the accordion name with `ariaLabel`. Jest `startsWith` per build.md. Exceptions as recorded in §9: calendar (built-in name) and a gallery caption that contains the alt |
| AC-6 | pass | r1: the 48-character DE description appears once and complete in the 87-character name. Jest long rows: header 50, stepper 48, gallery 66 characters (build.md) |
| AC-7 | pass | code: the names are `computed` (header, pagination, file upload, accordion, calendar `weekDays`) or template methods (stepper, gallery, rich text), so they update in the same pass. Jest per build.md |
| AC-8 | pass | r1: no `aria-describedby` on any step. Diff: the header button has no `title` (it moved to the name span), and the rich-text `title` equals its `aria-label`. The accordion label span ends in ",", so the name reads as two phrases. The opened region gets the same name (`r1-expanded`). I checked every string in §4. See finding 1 for consumer labels |
| AC-9 | pass | `diff -rq baseline build`: 371 of 372 identical. The 372nd, `gallery--custom-columns` 360 light (a picsum load), is identical in `build-rerun/` (`cmp`). The shots were taken on the baseline day, so the calendar hashes are valid. New story at 360 and 1280: numbers drawn from `data-step`, layout as in the vertical story |
| AC-10 | pass | Diff: 4 changed assertions, each with an AS-33 comment (`header.public-site:166`, `stepper.component.spec:191-212`, `pagination.component.spec:434`, `accordion.component.spec:123`), plus the entry list. Compat 22: PASS, with the stepper `data-step` change as designed in §9 (build.md) |
| AC-11 | pass | JSDoc for every §2 row is present, with `@default`. The changelog draft has *Fixed* per component (old → new, EN/DE), *Compatibility* (exact vs. start-anchored queries, no remaining 4.14 hits) and *Migration*. Finding 1 adds one Compatibility line |

**API (§2):** No input, output, slot, hook or type is added, removed or retyped: the diff adds only JSDoc and protected members. The `internal/a11y` stub is exactly as in §2, and the entry is not in `src/index.ts`. The dist `package.json` exports `./internal/a11y`. `nameWithText` implements §2 rules 1–5 in order, and `labelWords` uses `toLowerCase` with parentheticals dropped. The argTypes have a description and `table.defaultValue` (stepper `stepAriaLabel` and `optionalLabel`, accordion `ariaLabel`). The story IDs match §8.

**Build-consequence deviations (build.md):** all four confirmed.

| # | Verdict | Why |
|---|---|---|
| 1 | confirmed | `src/testing/**` is excluded from `tsconfig.lib.json` (as designed) and sits outside every entry's root, so a component import would fail with TS6059. The lint ignore only exempts Jest helpers. In dist, the only "axe-core" matches are JSDoc comments, and there is no helper code |
| 2 | confirmed | It follows from the designed entry: 119 subpaths = dist `exports` (113 public, 6 internal) |
| 3 | confirmed | CLAUDE.md requires a described argType for every arg a story sets (`Localized` sets `stepAriaLabel`). The texts match the §2 JSDoc |
| 4 | confirmed | r1: RichHeaderList has no `aria-labelledby` and is named from its content. RichHeader `aria-labelledby` = `…-label …-content`. The names equal design §4 |

**Observation (pre-existing, not part of 015):** the vertical stepper's step buttons are 32 px tall without a description and 41 px with one (r1 measure). That is below the kit's 44 px rule, and 015 didn't change it (hash-identical). It is a candidate for a separate request.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix | build.md changelog draft, *Compatibility* (`lc-accordion`) | A line for rich headers. The 3.11.4 docs told consumers to set `ariaLabel` (or `title`) on every `lcAccordionHeader`, and the old RichHeaderList story did exactly that (`ariaLabel="Item one"` over "Item One …"). Such a label now starts the name and repeats the template's text: "Item one, Item One Complete … 12:04". Remove it, or keep only context the template doesn't show | Only the `&ngsp;` advice; the stutter for existing labels isn't mentioned |
| 2 | nit | build.md, AC-3 | The spec asks for the 31 stories with before and after. Point to `tmp/015/axe-baseline-1280-light.log` (per-story `label-content-name-mismatch` counts in `out`) next to `label: []` after, or list the IDs in release.md | Only the counts (31 / 23 → 0) |

**Verdict:** approved. Finding 1 is a changelog line for the release-manager. No library change is needed.
