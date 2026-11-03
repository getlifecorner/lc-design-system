# Build 041: lc-button ariaDescribedBy; lc-description-list short values never break inside

- **Branch:** `feat/3.26-button-describedby-dl-value-wrap` from `main` 3c6a42b (= `origin/main`, v3.25.2). **Commit:** `feat(button,description-list): ariaDescribedBy; short values never break inside (041)`

## Files changed

| File | Change |
|---|---|
| `button/button.component.ts` | `readonly ariaDescribedBy = input('')`, JSDoc = design §2 with `@default ''` |
| `button/button.component.html` | `[attr.aria-describedby]="ariaDescribedBy() \|\| null"` after `aria-label` |
| `button/button.describedby.spec.ts` | new, 10 tests: AC-1 … AC-4 + default-rendering pin (attribute list `type, aria-disabled, aria-busy, class`, classes `btn btn-primary btn-md`) |
| `button/button.stories.ts` | argType `ariaDescribedBy` (text, `''`); stories *Disabled with a visible reason (3.26)*, *Loading with a description (3.26)* (§8, with play) |
| `button/button-link.component.ts`, `button-link.stories.ts` | §2 sentence: `aria-describedby` on the anchor itself, no input (AC-6) |
| `description-list/description-list.component.scss` | §3.1 exactly: `$_share: 1000000`; `.lc-dl--rows` term + value `flex: $_share 1 0%; max-width: max-content`; term `min-width: 0; overflow-wrap: break-word`; leader `@supports (margin-block-start: 1lh) { align-self: flex-start; margin-block-start: calc(0.5lh - 0.5px) }`. Base rules untouched (one comment reworded) |
| `description-list/description-list.component.ts` | class JSDoc bullet (§2) |
| `description-list/description-list.wrap.spec.ts` | new, 6 tests: the 3 compiled blocks, their order after the base rules, rows-only selectors, no `hyphens`, base value/term/leader rules, and every other rule = 3.25.2 (length 3081, sha1 `10ed4377…`) |
| `description-list/description-list.stories.ts` | meta bullet "3.26 (041)"; story *Long terms, short values (3.26)* (card → flat lg accordion, 280 / 312 px, `lang="de"`, NBSP amount) |

No existing assertion changed (0 edits to existing specs).

## Acceptance criteria

| AC | Covered by |
|---|---|
| 1, 2 | describedby spec: default `''`; no attribute unset, `''`, and after resetting to `''`; never on the host |
| 3 | spec: `'reason'` and `'reason hint'` while enabled / disabled / loading / both; title, aria-label, aria-disabled, aria-busy, `disabled`, classes equal with and without the input. One-off proof (temp spec, deleted): the 3.25.2 template (`git show 3c6a42b:…html`) and the new one over 60 input sets (3 variants × disabled × loading × 5 extras incl. `ariaDescribedBy: ''`) render byte-identical HTML; with `'x'` it fails |
| 4 | spec: description resolves to „Wählen Sie zuerst eine Datei.“ (and an id list in id order while loading), axe name „Hochladen“; story play `toHaveAccessibleDescription`. Browser AX tree: designer review |
| 5 | shots 360/1280 L/D (`--axe`): reason/status line 21 px (one line), both buttons on one row, 42 px high, page overflow 0, axe 0 violations in 8 |
| 6 | button-link JSDoc + story bullet |
| 7, 8 | new dl story, 360/1024/1280 L/D, measure = `story-measure.js` (log `tmp/041/shots-new-dl.log`): lists 202 / 234; "10" 17.72 px, 1 line, 0 inside; terms 152.28 / 184.28, 2 lines, 0 inside; "3"/"2" 8.86, terms 161.14 / 193.14 (2 lines); "1.234,56 €" 74.33, 1 line, term 95.67 (3 lines) / 127.67 (2 lines); row and page overflow 0; axe 0 in 6 |
| 9 | 3.3 story at 280/312/360 L/D: rows equal to `ac9-before.log` (light) and the same in dark; E-Mail value 174.09 / 206.09 / 238.09, overflow 0 (`tmp/041/ac9-after.txt`) |
| 10 | 10 dl stories `--full --compare=…/baseline`: **60 identical, 0 different**; 5 button stories `--compare=…/baseline-button`: **20 identical** |
| 11 | no template change; semantics spec (pinned HTML) green; wrap spec pins all other CSS; compat 22 green and both new rules are in the prerendered home page CSS (`dist/compat/browser/index.html`) |
| 12 | full suite green, existing specs unedited; changelog draft below |

## Gates

All ran on commit `e0aff08` (the libs/tools tree of the final commit; skip while `git diff --quiet e0aff08 -- libs tools` holds). Logs: `tmp/041/*.log`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 222 suites, 5215 passed, 8 skipped (`--runInBand`, 41 s; 3.25.2: 220 / 5199; +2 suites, +16 tests). The first run exited without a Jest summary; the rerun was clean |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline 162) |
| `npx nx run angular-ui-kit:build` | green, 122 "Built" lines |
| `npm run test:tools` | 22 / 22 pass (tools unchanged; run because the extractor reads the new stories) |
| `npx nx run angular-ui-kit:build-storybook` | green, 997 stories (+3) |
| Story screenshots | `tmp/story-shots/041/build-compare/` (60), `build-button/` (20), `build-new-button/` (8), `build-new-dl/` (6), `build-ac9/` (6). Opened: dl 360 L, 1280 D; disabled 360 L; loading 1280 D |
| `check-angular-majors.mjs --only=22` | PASS, 94 checks (unchanged count). Angular 21: release / CI |

## Deviations from the design

None in code. Two notes on §3.2 / §9 values:

1. Row 4's term: the §3.2 sketch reads "Betrag der / Zeilen mit / Umlage", but §9's values (95.67 px, 3 lines / 127.67, 2 lines) belong to the prototype term „Abgewiesener Betrag (Umlage)“ (`proto2-measure.js`); the story uses that and measures exactly those values.
2. In the accordion body `line-height` is 1.6 (22.39 px lines at 14 px), not 21: rows are 60.78 px (2 lines) / 83.17 (3), not 58, and `leaderTop` is 16.59, not 15.9. That is the middle of the first line, the same y as a one-line row's centred leader in that container ((22.39 − 1) / 2 − 2.1 + 8); all widths match §9.

## Changelog draft

```markdown
## [3.26.0] - 2026-11-03

`lc-button` can point at a visible description (`ariaDescribedBy`, gap row 7), and a short `lc-description-list` value no longer breaks inside next to a long term (Pixel 7, iPhone 15). No API breaks.

### Added

- **`lc-button` `ariaDescribedBy`** (finance-intelligence sources page, gap row 7): id, or space-separated ids, set as `aria-describedby` on the inner `<button>`, also while `disabled` or `loading`. Tie a visible reason line to a disabled button: a screen reader reads „Hochladen“, then „Wählen Sie zuerst eine Datei.“. `disabledReason` stays the pointer tooltip and is not read twice. Default `''` renders no attribute; the button's HTML is byte-identical to 3.25.2 without it. Stories *Disabled with a visible reason* and *Loading with a description* (axe: 0 violations at 360 and 1280 px, light and dark). `a[lcButton]` needs no input: put `aria-describedby` on the anchor.

### Fixed

- **`lc-description-list` rows** (finance-intelligence, Pixel 7 and iPhone 15): with a long term the value took all the missing width, so „Sekundäre Kostenart (Umlage)“ showed „10“ as „1“ / „0“ and the row overflowed (42 px in a 202 px list). A row that is too narrow is now shared: term and value each keep their width up to half of the free width (row − 32 px), and the longer one wraps in the rest. In an `lc-card` with a flat accordion at 280 / 312 px (lists 202 / 234): „10“ stays on one line and the term wraps at spaces (152 / 184 px, 2 lines); „1.234,56 €“ (74 px) stays on one line; no row overflows. Long unbroken values still wrap: the *Long values and times (3.3)* story measures as before (e-mail value 174 / 206 / 238 px at lists 248 / 280 / 312, no overflow). New story *Long terms, short values*.
- With `leaders`, the dots sit in the middle of the first line, next to the value, instead of between two lines of a wrapped row.

### Compatibility

- New optional input only; no selector, output, CSS hook or default changed. Rows that fit look as before: the 10 existing description-list stories are hash-identical at 360, 1024 and 1280 px, light and dark (60 shots), and the 5 existing button stories too (20 shots).
- Only rows that did not fit change: the term now wraps (at spaces; a single word wider than its half breaks inside, where 3.25 overflowed: add U+00AD soft hyphens to long compounds). Write amounts with a no-break space before the currency sign, as `Intl.NumberFormat` does. A one-line `mono` row with leaders draws its dots 0.5 px higher.
- Checked on Angular 21 and 22 (AOT, strictTemplates, prerender); the rule is CSS only and holds in prerendered HTML. Without `lh` support (Safari < 16.4) the dots stay centred.
```
