# Build 010: Reflow gaps at 200 % text on a phone

- **Branch:** `feat/3.11-reflow-200-text-phone` (from local `main` 9de8ee6)
- **Commit:** branch tip, `feat(badge): wrap input, and reflow at 200 % text for page-header, buttons and next-step-card`

## Files changed

| File | Change |
|---|---|
| `badge/badge.component.{ts,scss}` | `wrap` input (JSDoc, `@default false`) → `lc-badge--wrap`; wrap rules, per-size `min-height` / `padding-block` / radius at (0,2,0), dot on the first line (design §3) |
| `button/button.component.scss` | `.btn { overflow-wrap: var(--lc-btn-overflow-wrap, break-word) }` |
| `button/button{,-link}.component.ts` | class JSDoc documents the hook (design §2 text) |
| `page-header/page-header.component.scss` | title `overflow-wrap: anywhere`; actions `max-width: 100%` + hook `anywhere` |
| `footer/footer.component.scss` | `.footer__bottom { --lc-btn-overflow-wrap: anywhere }` |
| `next-step-card/next-step-card.component.scss` | narrow: grid → wrapping flex; title `flex: 1 1 0%; max-width: 100%`; full-width items `flex: 1 1 100%; min-width: 0`; actions hook `anywhere` |
| `*.stories.ts` (badge, page-header, footer, button-link, next-step-card) | the 6 stories of design §8; `wrap` argType; `--lc-btn-overflow-wrap` argType (CSS hooks) |
| `badge/badge.wrap.spec.ts`, `button/button.overflow-wrap.spec.ts` (new) | AC-6/7/8; hook contract (default, exactly 3 kit setters, JSDoc) |
| `page-header…spec.ts`, `next-step-card…spec.ts`, `button.styles.spec.ts` | cases added; 3 assertions changed (see Deviations) |
| `tools/compat/template/src/app/home.html`, `check-angular-majors.mjs` | SI-15 badge + `EXPECT_IN_HTML` entry (AC-11) |

## Acceptance criteria

Measured in `tmp/010/measure.log` (light; 320 / 360 px at 200 %).

| AC | Covered by |
|---|---|
| AC-1 | spec (title `anywhere`, actions clamp). `layout-page-header--large-text`: overflow 0 for all 6 headers and the document at 320 and 360; computed `anywhere`; DE hyphenates first ("Jo-han-na-Frie-deri-ke"); actions wrap below the title (320: x 104.6–264) |
| AC-2 | spec (`hyphens` hook unchanged); 16 page-header stories × 6: identical |
| AC-3 | `button.overflow-wrap.spec`. `links-large-text` 320: footer overflow 0, all 4 links x 48–272 in box 48–272 (DE "Datenschutz" 2 lines, 138 px). `overlong-word`: links x 24–296 (320) / 24–336 (360). `components-button--primary`: computed `break-word` at 320/360/1280. Button 23 + button-link 9 + footer 8 stories: identical |
| AC-4 | spec (AS-32 case). `feedback-next-step-card--large-text`: 0 words broken, overflow 0. Soft: icon (48, 48) 96; title (48, 172) w 216 at 360, w 176 / 2 lines at 320. Default: beside the icon at 360 (x 140, w 139), below at 320 (36, 121) w 203. Actions inside the card (36 … −33) |
| AC-5 | 13 next-step-card stories × 6: identical |
| AC-6 | `badge.wrap.spec` (default class list and DOM, base rules, `@default false`); 10 badge stories × 6: identical |
| AC-7 | `badge.wrap.spec`. 320: SI-15 badge w 288 in a 288 column, 2 lines, h 91, LH 35, min-height 56, radius 28, overflow 0 (DE and EN); dot badge 3 lines inside; "Beta" pair 98.7 × 56 both, text tops 11 / 11.5. 100 %: two-line xs/sm/md/lg 35 / 41.5 / 45.5 / 52, radii 10 / 12 / 14 / 16 |
| AC-8 | spec (no wrap rule touches border, colours, inline padding); `theme-contrast` and `badge-contrast` specs unchanged and green; computed border `1px solid` in wrap mode |
| AC-9 | all 6 IDs listed; `wrap` argType with description and `table.defaultValue` |
| AC-10 | no template change, DOM specs unchanged and green; focused first footer link at 320: `:focus-visible`, ring x 44–276 (shot `layout-footer--links-large-text--320-light.png`) |
| AC-11 | compat Angular 22: `ok badge wrap class before JS (SI-15)` |
| AC-12 | cases added; 3 assertions changed (Deviations); changelog draft below |

## Gates

Ran on the working tree committed as the branch tip; later agents skip a gate while `git diff --quiet feat/3.11-reflow-200-text-phone -- libs tools` holds.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 159 suites, 4011 passed, 8 skipped (was 157 / 3985); two earlier runs hit the known worker SIGSEGV while Chromium ran |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | green |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | green |
| Story screenshots | 474 / 474 existing shots identical to `tmp/story-shots/010/baseline` (`build`, `build2`, `build3`); new: `tmp/story-shots/010/new/` (6 stories × 320/360/1280, light) |
| `node tools/compat/check-angular-majors.mjs --only=22` | PASS (22.2.3), all `EXPECT_IN_HTML` ok incl. SI-15 |

## Deviations from the design

- **None in behaviour.** Sass writes `padding-block: max(0px, (1.75rem - 2px) / 2 - …)` without the inner `calc()`: same math, valid CSS.
- **AC-12 ("existing specs are not edited")**: three assertions pinned the mechanism the design replaces; each now pins the new one, none is weaker. `button.styles.spec` `.btn` `break-word` → `var(--lc-btn-overflow-wrap, break-word)` (same default); `page-header.component.spec` title `break-word` → `anywhere` (AC-1); `next-step-card.component.spec` narrow `grid-template-columns` / actions `grid-column: 1 / -1` → `display: flex; flex-wrap: wrap` / actions `flex: 1 1 100%` (design §3). Designer to confirm.

## Changelog draft

```markdown
## [3.11.0] - <date>

Reflow at 200 % text on a phone for life-os's sign-in, Today and Household pages (AS-30 (2), AS-32, SI-15; WCAG 1.4.4, 1.4.10). No API breaks.

### Added

- **`wrap` on `lc-badge`** (SI-15, default `false`): a sentence-like label wraps onto centred lines instead of running out of its container. The fixed height becomes a minimum height, lines are 1.25 high, and the badge is never wider than its container. With `rounded`, the corners keep the one-line pill radius (md: 14 px), so a second line isn't clipped. "Geschlossene Beta, nur mit Einladung" at 320 px / 200 % text: 288 px wide in a 288 px column, 2 lines, 91 px high. A label that fits looks as before (same width and height).
- **CSS hook `--lc-btn-overflow-wrap`** on `lc-button` and `a[lcButton]` (default `break-word`): `anywhere` lets a one-word label wider than its line break inside the word. Set it on wrapping rows and columns; in a non-wrapping row a one-word button would shrink with its neighbours ("Bearbeiten" 116.7 → 93.8 px), which is why it isn't the default.

### Fixed

- **`lc-page-header` titles stay on screen** (AS-30): the title uses `overflow-wrap: anywhere`, so a word wider than the whole line breaks after hyphenation was tried. At 320 px / 200 % text "Hallo, Johanna-Friederike" (+38 px) and "Household" (+5 px) no longer overflow; the actions are never wider than the row and wrap below the title.
- **Footer links and page-header actions stay inside** (AS-30): `lc-footer`'s bottom row, the page-header actions and the narrow next-step-card actions set `--lc-btn-overflow-wrap: anywhere`. A `link`/`lg` "Datenschutz" at 320 px / 200 % ran from x 8 to 312; it now spans the footer's 48–272 on two lines, with the focus ring at 44–276.
- **`lc-next-step-card` never breaks a title word** (AS-32): below 30rem of card width the card is a wrapping row; when icon, gap and the title's longest word don't fit, the title moves below the icon at full width. "Nichts zu tun" at 360 px / 200 %: 216 px wide under the 96 px icon (it was 92 px beside it and broke inside "Nichts").

### Compatibility

- No API breaks. At 100 % text all 474 badge, button, button-link, footer, page-header and next-step-card screenshots (360 / 1024 / 1280, light and dark) are pixel-identical to 3.10.1.
- The new rules are plain CSS and hold in prerendered HTML; the `lc-badge--wrap` class is written by the server (Angular 21 and 22).

### Migration

- life-os: in `auth-layout.component.ts` remove the SI-15 rule (white-space, height, text-align, line-height on `.lc-auth-title > lc-badge .lc-badge`) and set `[wrap]="true"` on the closed-beta badge; remove `overflow-wrap: anywhere` from the AS-30 H1 rule (`text-align: center` is SI-12). In `shell.component.css`, remove `max-width` and `overflow-wrap` from `.footer__bottom > a`; the padding rule stays yours.
```
