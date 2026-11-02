# Build 033: lc-description-list resets the browser's dd margin

- **Branch:** `fix/3.22.3-description-list-margin-reset`
- **Commit:** `628200a` (first; amended with this file), fix(description-list): reset the browser margin of term and value

## Files changed

| File | Change |
|---|---|
| `description-list/description-list.component.scss` | `margin: 0` as the first declaration of `&__term` and `&__value`, with the §1 comment |
| `description-list/description-list.component.spec.ts` | +2 tests in the 3.3 `describe`: compiled `.lc-dl__term {` / `.lc-dl__value {` blocks hold `margin: 0;` (AC-1); default markup pinned: `dl` classes, `div.lc-dl__row` without role/tabindex, `dt` + `span[aria-hidden]` + `dd` (AC-7, AC-8). No existing assertion edited |
| `description-list/description-list.stories.ts` | new `ShortValuesAtPhoneWidth` per §8 (args, render, `moduleMetadata` with `CardComponent`, docs text); key-features bullet in the meta description |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | spec (stylesheet); measure: every row `m0` in rows, leaders and stacked of the new story (6 shots) and in all 7 existing stories (42 shots) |
| AC-2 | new story, all 6 widths/themes: rows `m0 1 8 <dx> 0` × 6, box `262x227`; value widths 116.7 / 116.7 / 44.5 / 113.1 / 107.1 / 81.2 |
| AC-3 | `…--long-values-and-times` 360: e-mail 2 lines, width 238.1, overflow 0; 3.3 stylesheet test green |
| AC-4 | new story identical at 360/1024/1280; stacked toggle `m0 1 - 0 0` × 6 (box 262x372); `…--stacked` 360: value − term 0, width 280 × 5 |
| AC-5 | measure output identical light vs dark (new story and the 7 existing); L and D differ from the baseline in the same shots |
| AC-6 | new story (all German) 6/6 one line |
| AC-7 | full Jest suite green, only the 2 new tests added; compat 22 green; `--full --compare=tmp/story-shots/033/baseline`: **20 different / 22 identical**, exactly the §2 list (leaders 6, stacked 6, long values 6, value suffix 360 L/D) |
| AC-8 | existing "makes rows keyboard-operable when clickable" unchanged, green; markup pin |
| AC-9 | `components-description-list--short-values-at-phone-width` renders (index.json) |
| AC-10 | changelog draft below |

The 42 shots are also byte-identical to the designer's prototype (`--compare=tmp/story-shots/033/prototype`: 42/42 identical).

## Gates

All gates ran on commit `628200a006c2fc491f45d2589ff6bdd8e915e0a6` (later agents skip a gate while `git diff --quiet 628200a -- libs tools` holds).

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 213 suites, 4924 passed, 8 skipped (`--maxWorkers=2`); was 4922 + 2 |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (unchanged) |
| `npx nx run angular-ui-kit:build` | 122 entries built |
| `npm run test:tools` | tools unchanged |
| `npx nx run angular-ui-kit:build-storybook` | 975 stories (+1) |
| Story screenshots | new story `tmp/story-shots/033/build/` (6, `--full`, log `tmp/033/shots-new.log`); compare `tmp/story-shots/033/compare/` (42, log `tmp/033/shots-compare.log`); measure module `tmp/033/measure/m.mjs` (= `review-measure.js` + `valueWidths`; copied to `dist/storybook/angular-ui-kit/zz-033/`, run with `--measure='(await import("/zz-033/m.mjs")).default()'`) |
| `node tools/compat/check-angular-majors.mjs --only=22` | install, build+prerender ok; 88 prerendered-HTML checks ok (unchanged; the compat home page renders `lc-description-list`) |

## Deviations from the design

None.

Note for the review: the module form detects the new story by its first term („Umbenennen“), because story-shots evaluates at the server root URL (`location.href` has no story id).

## Changelog draft

```markdown
## [3.22.3] - 2026-11-02

`lc-description-list` drops the browser's `<dd>` margin, so a short value stays on one line beside its term at 360 px (life-os bank accounts, gap BA-8). No API breaks.

### Fixed

- **`lc-description-list` term and value have no browser margin**: the value (`<dd class="lc-dl__value">`) kept the browser's `margin-inline-start: 40px` on top of the row gap, so term and value were at least 72 px apart instead of 32 px. On the life-os connection page (the managing row) and the assistant-access page, „Alle Erwachsenen“, „nicht eingerichtet“ and „seit 02.11.2026“ wrapped to two lines at 360 px. Now `.lc-dl__term` and `.lc-dl__value` have `margin: 0` and the row gap is the only space: in a 262 px list (an outlined `lc-card padding="lg"` in `lc-app-page` at 360 px) all six rows of the BA-8 story sit on one line, and the list is 227 px tall instead of 290. With `leaders` the dotted line runs to 8 px from the value (was 48). In the `stacked` layout the value is flush left with the term (it was indented 40 px). Long unbroken values still wrap: an e-mail address at 360 px keeps 2 lines and gets 238 px instead of 198.
- Story: Components/Description List "Short values at a phone width (BA-8)".

### Compatibility

- No API breaks: no input, output, class, hook or markup changed. Lists whose values already fitted beside the 40 px render pixel-identical (`rows`, dashed separator, a card footer, and wide value-suffix rows: 22 of 42 story shots at 360, 1024 and 1280 px, light and dark). The other 20 change as described above.
- A consumer rule `::ng-deep dd.lc-dl__value { margin: 0 }` sets the same value and stays harmless.

### Migration

- life-os: remove the `::ng-deep dd.lc-dl__value { margin: 0 }` workaround from `connection.page.css` and `assistant-access.page.ts`.
```
