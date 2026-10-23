# Build 015: Label in Name (WCAG 2.5.3) for the remaining eight components under axe-core 4.14

- **Branch:** `fix/3.11.5-label-in-name-remaining`
- **Commit:** branch tip, `fix(a11y): name eight more controls with the text they show` (amended only to fill this line; `libs` and `tools` are identical to `2ae088e`, so `git diff --quiet 2ae088e -- libs tools` skips the gates)

## Files changed

| File | Change |
|---|---|
| `internal/a11y/ng-package.json`, `src/lib/internal/a11y/{index,label-in-name}.ts` (+ `.spec.ts`) | New internal entry: `labelWords`, `containsWords`, `nameWithText` (design §2), not in `src/index.ts` |
| `header.component.{ts,html}` | `contextButtonAriaLabel`; `&ngsp;` between label and name; `title` moved to `.lc-header__context-name`; JSDoc `contextAriaLabel` |
| `stepper.component.{ts,html,scss}` | Name = template, description, optional (+ label if `{label}` isn't last); no `aria-describedby`; number as `data-step` + `::before`; `&ngsp;` before description/optional; JSDoc |
| `pagination.component.{ts,html}` | `previousButtonAriaLabel` / `nextButtonAriaLabel` via `nameWithText`; JSDoc |
| `calendar.component.{ts,html}` | `weekDays[].ariaLabel` = visible label + the day's month and year |
| `rich-text-editor.component.{ts,html}` | `getActionName()` (= `aria-label` = `title`); JSDoc `actionTitles` |
| `gallery.component.{ts,html}` | `itemAriaLabel()`; JSDoc `showCaptions`, `imageFallbackLabel` |
| `accordion.component.{ts,html}`, `accordion-header.directive.ts` | Plain: `nameWithText(ariaLabel‖title, title)`; rich + label: hidden `{id}-label` span + `aria-labelledby` (button and panel); JSDoc |
| `file-upload.component.{ts,html}` | `dropzoneAriaLabel` = hint, accepted, max; `&ngsp;` between the lines; JSDoc |
| `src/testing/axe-jsdom.ts` | Shared Jest helpers moved out of `header.axe.spec.ts` (+ `outcomeFor`, `violations(…, except)`) |
| `*.axe.spec.ts` ×7 new, `header.axe.spec.ts` | Per-component axe 4.14 specs; header spec uses the helper and adds the context button |
| `accordion.stories.ts`, `accordion-group.stories.ts`, `stepper.stories.ts`, `header.stories.ts`, `pagination.stories.ts` | Design §8 (RichHeader `ariaLabel: 'Pipeline run'` + `&ngsp;`; RichHeaderList without `ariaLabel` + `&ngsp;`; new `Localized`); argType texts |
| `tsconfig.lib.json` / `tsconfig.spec.json` / `eslint.config.mjs` | `src/testing/**` excluded from the lib, included in specs, ignored by `@nx/dependency-checks` |
| `entries.spec.ts`, `tools/compat/check-entries.mjs` | Entry count 118 → 119 (`internal/a11y`) |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | `*.axe.spec.ts`: exact `computedName` per row (EN, DE, long DE) = design §4, `violations` = [] and per-node `outcomeFor` = pass (symbol toolbar buttons: incomplete / not violation) |
| AC-2 | Each axe spec: old name put back → `violation` (accordion: `aria-labelledby` removed, old `aria-label` set) — 8/8 |
| AC-3 | Sweep, see Gates |
| AC-4 | Sweep, see Gates |
| AC-5 | `startsWith(label)` in header, stepper, pagination, rich text (DE), gallery, accordion, file upload specs; exceptions per design §9 (calendar built-in; caption containing the alt) |
| AC-6 | Long DE rows: `split(text).length === 2` (header 50 chars, stepper 48, gallery 66) + axe pass |
| AC-7 | `setInput`/signal → `detectChanges()` → new name: header `contextName`, stepper `steps`, pagination `previousLabel`+`currentPage`, calendar `navigateNext`, gallery `showCaptions`, accordion label/template, file upload `accept`/`maxSizeBytes` |
| AC-8 | Header button has no `title`; stepper has no `aria-describedby`; rich-text `title === aria-label`; accordion label span ends with "," |
| AC-9 | Screenshots, see Gates |
| AC-10 | Changed assertions, all name strings (reasons in the spec comments): `header.public-site.spec.ts:166`, `stepper.component.spec.ts:191-212`, `pagination.component.spec.ts:434-435`, `accordion.component.spec.ts:123`; plus `entries.spec.ts` (entry list). Compat HTML: only the stepper number (text → `data-step`), as designed |
| AC-11 | JSDoc per design §2; changelog draft below |

## Gates

Ran on the working tree committed as the branch tip (newer files after lint/build: only the regenerated, unchanged token files); logs in `tmp/015/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | axe-core 4.14.0: **177 suites, 4282 passed, 8 skipped** (baseline 169 / 4207: +7 `*.axe.spec.ts`, +`label-in-name.spec.ts`, +75 tests; run after all Chromium runs) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (= baseline) |
| `npx nx run angular-ui-kit:build` | green, 120 built (119 entries + primary); dist has no `src/testing` code |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | green (17 s), 899 stories |
| Story shots (AC-9) | `tmp/story-shots/015/build/`, `--full`, 360/1024/1280 × light/dark, `--compare=tmp/story-shots/015/baseline`: 62 stories, **372 / 372 identical** (one gallery shot at 360 light differed on the first run, picsum image load; the re-shoot was identical, `tmp/015/shots-rerun.log`). New `navigation-stepper--localized`: 360/1280 × light/dark, names per §4, opened 360 and 1280 light |
| axe 4.14.0 sweep, CDN (AC-3/AC-4) | Designer's measure + baseline diff, whole Storybook, 899 stories × 360/1280 × light/dark (`tmp/015/axe-build-<w>-<theme>.log`): `label-content-name-mismatch` in **0 stories** in all four runs (baseline 31 / 31 at 1280, 23 / 23 at 360); `changed` (all other rules vs baseline) **empty** in all four; the new `Localized` story has no violation |
| `story-shots --axe` (devDependency) | 63 affected stories × 360/1024/1280 × light/dark = 378 runs (`tmp/015/axe-local-*.log`, shots `tmp/story-shots/015/axe-local/`): `label-content-name-mismatch` violations 0; the rule is only "incomplete" on rich-text single-letter/symbol buttons (design §4). Other violations are pre-existing (`color-contrast`, `nested-interactive`, `svg-img-alt`, `target-size`; unchanged per the sweep diff) |
| `check-angular-majors.mjs --only=22` | PASS, 63 HTML checks; stepper prerendered as `data-step="1"`, name "Step 1 of 2: Eins" |

## Deviations from the design

None in behaviour, names, layout or stories. These are consequences of the design, for the designer to confirm in review:

| # | What | Why |
|---|---|---|
| 1 | `src/testing/axe-jsdom.ts` is listed in `@nx/dependency-checks` `ignoredFiles` (and excluded from `tsconfig.lib.json`) | The rule treats any non-spec file under `src/` as production and wanted `axe-core` in peerDependencies. The dist has no testing code |
| 2 | `entries.spec.ts` (list, "113 public and 6 internal") and `tools/compat/check-entries.mjs` (119) | The designed `internal/a11y` entry; both hard-code the entries (AC-10 lists `entries.spec.ts`) |
| 3 | Stepper argTypes `stepAriaLabel`, `optionalLabel` added; argType descriptions for header `contextAriaLabel`, pagination `previous/nextAriaLabel`, accordion `ariaLabel` say what the name becomes | `Localized` sets `stepAriaLabel` (CLAUDE.md: every arg has a described argType); AC-11 (JSDoc and docs name the rule) |
| 4 | The accordion content span gets its `{id}-content` id only when the rich header has a label (proto: always) | No unused id; names are identical (axe specs, sweep) |

## Changelog draft

```markdown
## [3.11.5] - 2026-10-23

The remaining eight components name their controls with the text they show (AS-33 follow-up; axe-core 4.14 `label-content-name-mismatch`, WCAG 2.5.3 Label in Name). No API breaks.

### Fixed

- **`lc-header` context button**: named `contextAriaLabel`, a comma and the label and name it shows: "Context info, Tenant Acme Corp" (was "Context info"); DE "Haushalt, Familie F.". The tooltip with the full name (`title`) moved from the button to the name text, so it no longer competes with the accessible name.
- **`lc-stepper` steps**: the description and the optional label are part of the name, "Step 2 of 3: Profile, Set up your profile" (was "Step 2 of 3: Profile", with the description as `aria-describedby`); DE "Schritt 2 von 4: Persönliche Angaben, Bitte geben Sie Ihre vollständige Anschrift ein". The step number is drawn by CSS from `data-step`, so it is no longer text inside the button.
- **`lc-pagination` with localised labels**: "Vorherige Seite, Zurück" / "Nächste Seite, Weiter" (was "Vorherige Seite" / "Nächste Seite"). The English defaults are unchanged ("Previous page" already contains "Previous").
- **`lc-calendar` week view**: each column header is named with its visible label plus the day's month and year, "Mo., 19. Oktober 2026" (was "Montag, 19. Oktober 2026"); en-US "19 Mon October 2026" (was "Monday, October 19, 2026"). A week across two months names each day with its own month. Month and day views are unchanged.
- **`lc-rich-text-editor` toolbar**: buttons that show a word or number carry it: "Heading 1, H1" to "Heading 3, H3", "Ordered List, 1." (DE "Überschrift 1, H1", "Nummerierte Liste, 1."); the tooltip shows the same text. Single-letter and symbol buttons (B, I, U, S, •, ", <>, { }, link, image, rule) keep "Bold", "Fett" and so on: WCAG 2.5.3 treats them like icons, and axe reports them as "incomplete", not as violations.
- **`lc-gallery` items with `showCaptions`**: "Photo 1, Sunset over the lake" (was "Photo 1"); DE "Bild 3, Sonnenuntergang am See". When the caption already contains the alt text, the caption alone. Without captions the name is unchanged.
- **`lc-accordion` with an `lcAccordionHeader` template and `ariaLabel` or `title`**: the header button and its panel are named by the label and the template's text, "Pipeline run, Item One Complete 12:04" (was "Item one details", an `aria-label` that hid the visible text), through `aria-labelledby`. Plain-title headers and rich headers without a label are unchanged.
- **`lc-file-upload` drop zone**: hint, accepted types and maximum size, "Upload your documents (PDF, PNG, JPG), Accepted: .pdf,.png,.jpg,.jpeg, Max: 5.0 MB" (was the hint alone); DE "Dateien hierher ziehen oder zum Auswählen klicken, Erlaubt: .pdf, Max.: 10.0 MB". Without `accept` and `maxSizeBytes` the name is unchanged.
- Visible text parts now have a space between them in the DOM (header label and name, stepper description and "Optional", file-upload lines), so names no longer run together ("TenantAcme Corp").
- axe-core 4.14.0 over the whole Storybook (899 stories, 360 and 1280 px, light and dark): `label-content-name-mismatch` in 0 stories (was 31 at 1280 px and 23 at 360 px); no other rule changed. The kit's tests now run axe-core 4.14 on all eight components.

### Compatibility

- No API breaks: same inputs, outputs, selectors and exports. Only accessible names change (`aria-label`, `aria-labelledby`, where `title` sits), and all 372 screenshots of the eight components (plus three sidenav stories with a header; 360 / 1024 / 1280 px, light and dark) are identical to 3.11.4.
- Tests that match a name exactly need the new name (`{ name: 'Vorherige Seite' }` → `'Vorherige Seite, Zurück'`). Queries on the start of the name keep matching (`/^Vorherige Seite/`, `startsWith('Step 2 of 3: Profile')`), except the calendar week headers (the name now starts with the visible text) and gallery items whose caption contains the alt text.
- `lc-stepper` buttons no longer have `aria-describedby`; in prerendered HTML the number is `<span class="lc-stepper__number" data-step="1">` without text.
- In your own `lcAccordionHeader` template, put `&ngsp;` between text elements (Angular removes plain whitespace between tags), or the name runs the parts together ("Item OneComplete").
- No known axe-core 4.14 `label-content-name-mismatch` hits remain in the kit.
- New internal entry `@lifecorner/angular-ui-kit/internal/a11y` (used by the components, not public API).

### Migration

- None required. life-os uses none of these components; elsewhere, update exact-name assertions as above.
```
