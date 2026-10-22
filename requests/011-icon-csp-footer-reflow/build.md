# Build 011: lc-icon without inline styles, and footer sections at 320 px with 200 % text

- **Branch:** `fix/3.11.1-icon-csp-footer-reflow`
- **Commit:** branch tip, `fix(icon): no inline style for the default icon, and footer sections reflow at 200 % text`

## Files changed

| File | Change |
|---|---|
| `lib/icon/icon.component.{html,scss,ts}` | `[style.width/height]` removed; `.icon-xs…xl` = 16/20/24/32/40 px (`@each`); `svg { color: inherit }`; JSDoc per design §2 |
| `lib/icon/icon-dom.ts` | `decorateSvg`: default colour (`isDefaultIconColor`: `currentColor` any case, empty) writes nothing and takes back an earlier custom one (`removeProperty`, empty attribute removed); custom stays `style.color` (CSSOM) |
| `lib/icon/icon.stories.ts`, `lib/footer/footer.stories.ts` | argTypes `size`/`color` with default; new `InheritedColor`, `SectionsLargeText` (DE with U+00AD, EN) |
| `lib/footer/footer.component.scss` | `.footer__sections`: `minmax(min(10rem, 100%), 1fr)`, `overflow-wrap: anywhere` |
| new `icon.inline-style.spec.ts` (42), `footer.reflow.spec.ts` (3) | AC-1, 2, 5, 6, 11, compiled-stylesheet contracts (AC-3, 4, 8, 9) |
| 5 icon specs | assertions that pinned the old mechanism, see Deviations |
| `tools/compat/`: `check-angular-majors.mjs`, new `probe-311.ts`, `home.{ts,html}`, `check-trusted-types.mjs` | 5 `EXPECT_IN_HTML` rows (`iconsWithoutStyle`, control `#compat-color`); `ICONS` reports styled elements, size class, box |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | `icon.inline-style.spec.ts` AC-1: 10 cases (5 sizes × outline/solid) + decorative, labelled, placeholder, `CURRENTCOLOR`, `' '`, fetched (during and after load) |
| AC-2 | compat 22: 3 no-style rows (index: ≥ 3 icons incl. `#compat-registered`, `check`; `/tt`: `clock`, `shield-check`; `/tt/icons`: ≥ 101) + size-class row + control row; unit: server platform, 3 cases |
| AC-3, AC-4 | stylesheet contract (5 sizes; `color: inherit` the only colour declaration); story measure below |
| AC-5 | custom assertions kept; new `setAttribute('style')` spy: 0 calls (inline, fetched, hex, var) |
| AC-6 | custom → default and `xl → xs`, inline and fetched; other inline properties kept |
| AC-7 | `check-trusted-types.mjs` after hydration: 0 styled, `icon-md` 24 × 24, 0 NG05xx (`/tt`, `/tt/icons`, 360/1280) |
| AC-8, AC-9, AC-10 | story measure below; `footer.reflow.spec.ts`; hash compare (light/dark); footer spec unchanged |
| AC-11, AC-12 | full suite green, exports unchanged; changelog draft below |

## Gates

Ran on the working tree committed as the branch tip; later agents skip a gate while `git diff --quiet fix/3.11.1-icon-csp-footer-reflow -- libs tools` holds. Logs in `tmp/011/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 161 suites, 4056 passed, 8 skipped (new: 2 suites, 45 tests) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (unchanged) |
| `npx nx run angular-ui-kit:build` | ok; fesm has `.icon-xs{width:16px;height:16px}` … `xl` 40px, `svg{…;color:inherit}`, `minmax(min(10rem,100%),1fr)` |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | ok |
| Story compare, 59 stories × 320/360/1024/1280 × light/dark vs `tmp/story-shots/011/baseline` | **464 of 472 identical**; the 8 that differ are `data-display-document-viewer--image-preview` (random picsum image). 5 stories whose baselines are `--full` were re-shot `--full`: 40/40 identical (`build-full/`). New stories: `tmp/story-shots/011/new/` (320–1280, light/dark; footer `--full`) |
| `check-angular-majors.mjs --only=22` | PASS, Angular 22.2.3; 58 HTML checks ok incl. the 5 new (index: 29 lc-icons without `style=`; control: `style="color: var(--color-primary-500);"` on the svg only) |
| `check-trusted-types.mjs` (same app) | PASS 194 / 194, incl. 8 new G-37 checks (0 styled elements, `icon-md` 24 × 24, both runs, 360/1280) |

Measured in the stories (`--measure`, 360 and 1280, light and dark):

| What | Value |
|---|---|
| `inherited-color`: box per class / svg `width` | xs 16×16 / 16px, sm 20, md 24, lg 32, xl 40, as 3.11.0 |
| `style` attributes | default icons 0 (host, box, svg); custom: `svg` only |
| svg colour = parent (light / dark) | ink rgb(17,24,39) / rgb(241,246,248), secondary, link, error equal too; custom primary-500 rgb(32,132,151) / rgb(132,199,212), `#FF5733` rgb(255,87,51) |
| svg colour rules (AC-4) | only `.icon-container[_ngcontent-…] svg => inherit` (plus Storybook's UI) |
| `sections-large-text` 320 / 360 (root 32 px) | `scrollWidth` = `clientWidth`; 1 column 224 / 264 px; visible text ends 268 ≤ 272 / 298 ≤ 312; links 88 px; "Unter-nehmen" 2 lines at 320 only; "Datenschutzerklärung" breaks in the word. Hidden "(opens in a new tab)" spans reach x 303 as a range but paint nothing |
| 1024 / 1280 | new story 2 × 432 / 3 × 352 px; `default` 212 ×4 / 276 ×4, `public-site` 293.33 ×3 / 378.66 ×3 (AC-9, hash-identical) |

## Deviations from the design

None in what renders. Notes:

- Spec assertions changed, each because it pinned the mechanism (as design §9 AC-11 lists): `icon.registry.spec.ts` (2 tests), `icon.production.spec.ts` (1), `icon.set-failure.spec.ts` (1): `container.style.width/height` → `icon-<size>` class, no `style` attribute, svg `width`; `icon.trusted-types.spec.ts` `ICON_DOM_341`: container `style` → `null`, `style="color: currentcolor;"` dropped from 3 svg strings (the custom `rgb(255, 87, 51)` stays); `icon.component.spec.ts` (3): default `style.color` `'currentcolor'` → `''` plus no attribute.
- AC-2 checks every `lc-icon` of each page (except `#compat-color`) and requires the design's named ones (`#compat-registered`, `check`, `clock`, `shield-check`): a superset that also covers the next-step card's icons named in G-37.

## Changelog draft

```markdown
## [3.11.1] - 2026-10-22

lc-icon under a strict style CSP, and lc-footer sections at 320 px with 200 % text (G-37, G-36; life-os website v0). No API breaks.

### Fixed

- **`lc-icon` renders no `style` attribute** (G-37): the box size comes from the `icon-<size>` class (16 / 20 / 24 / 32 / 40 px) and the default colour from the stylesheet (`color: inherit`), so icons render under `style-src 'self'` without `unsafe-inline` or hashes, as the life-os website ships. Before, every prerendered icon carried `style="width: 24px; height: 24px;"` on its box and `style="color: currentcolor;"` on its svg, which that CSP blocks. Prerendered pages of the consumer check (Angular 22): 29 icons on the broad page and every icon of the bundled set without `style=`; after hydration still none, boxes 24 × 24. Size and colour are unchanged (the icon takes its parent's text colour in both themes, CanvasText or LinkText in forced colours); 464 of 472 icon, next-step-card, empty-state, document-viewer, kanban, header and footer screenshots are identical to 3.11.0 (the 8 others show a random image).
- **`lc-footer` sections fit at 320 px with 200 % text** (G-36, WCAG 1.4.10): the column minimum is `min(10rem, 100%)`, so the sections stack in one 224 px column instead of a 320 px (10rem) column that scrolled the page sideways; a word wider than the column breaks inside the word ("Datenschutzerklärung"). Put a soft hyphen (U+00AD) into a compound to choose where. From 10rem up the columns are as before (1024 / 1280: 212 / 276 px × 4).

### Compatibility

- No API breaks. A custom `color` (`#FF5733`, `var(--…)`) is still the svg's inline colour, now set through CSSOM only, which a `style-src 'self'` CSP allows in the browser; in prerendered HTML it is a `style` attribute that such a CSP blocks until the app hydrates (the icon shows the parent's colour until then). Under a strict CSP, colour icons from your stylesheet: set `color` on `lc-icon` or its parent.
- Tests that read `container.style.width` or the default `svg.style.color` now get `''`: read the `icon-<size>` class, the svg's `width` attribute or the computed style. A rule of your own with specificity (0,2,0) or more on the inner `.icon-container` now applies (the inline size used to win).

### Migration

- life-os website: drop the `G-36` page-level footer rule; the G-37 build check needs no change.
```
