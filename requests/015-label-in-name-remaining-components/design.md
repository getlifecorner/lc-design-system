# Design 015: Label in Name (WCAG 2.5.3) for the remaining eight components under axe-core 4.14

- **Status:** ready
- **Spec:** [spec.md](spec.md), AC-1 … AC-11

## 1. Approach

This extends the existing components and adds no public input. It follows 014 (`avatarTriggerAriaLabel`): the consumer's label comes first, the visible text is appended, and nothing is appended when the label already contains the text. Measured on 3.11.4 (`tmp/015/probe.log`, plus the axe sweep below), there are two causes:

1. **The name lacks the visible text:** pagination (DE), calendar week headers, rich-text "H1"–"H3" and "1.", gallery captions, and the file-upload accept and max lines.
2. **Concatenation:** axe builds the visible text by joining child text nodes with `''`, and Angular strips whitespace-only text nodes. So "Tenant" + "Acme Corp" becomes `TenantAcme Corp`, and a step becomes `2ProfileSet up your profile`. **Fix:** put a real space (`&ngsp;`) between the parts. Every one of these parents is a flex container or holds block children, so the space renders nothing.

All controls use one shared helper, `nameWithText()`, which tests containment the same way axe 4.14 does.

**Prototype:** every change in §2–§6 was injected into the current Storybook through `--measure` (`tmp/story-shots/015/proto-measure.js`) for the 62 stories at 360, 1024 and 1280 px in light and dark: **372/372 shots hash-identical to the baseline, and 0 `label-content-name-mismatch` violations** (`tmp/015/proto-a.log`, `proto-bc.log`). The names in §4 are measured output. No control is deferred.

## 2. Public API

No input, output, slot, CSS hook or exported type is added, removed or retyped.

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| internal entry | `@lifecorner/angular-ui-kit/internal/a11y` | — | — | Stub `libs/angular-ui-kit/internal/a11y/ng-package.json` (`{"lib":{"entryFile":"../../src/lib/internal/a11y/index.ts"}}`) and `src/lib/internal/a11y/{index.ts,label-in-name.ts}`. Not in `src/index.ts`; no semver guarantee, like `internal/overlay`. |
| internal fn | `nameWithText(label: string, text: string): string` | — | — | "Accessible name that contains the visible `text` (WCAG 2.5.3): `label`, then `, text`, unless one already contains the other." |
| internal fn | `labelWords(s)`, `containsWords(h, n)` | — | — | The axe-like word split and the contiguous-run test (below). |
| JSDoc | header `contextAriaLabel` | string | `'Context info'` | "Start of the context button's accessible name. The visible `contextLabel` and `contextName` follow it (WCAG 2.5.3 Label in Name), unless the label already contains them." |
| JSDoc | stepper `stepAriaLabel` | string | `'Step {n} of {m}: {label}'` | Add: "The step's visible description and `optionalLabel` follow the filled template, comma-separated. Keep `{label}` last, so that the name contains the visible text." |
| JSDoc | stepper `optionalLabel` | string | `'Optional'` | "Text shown under optional steps; it also ends the step's accessible name." |
| JSDoc | pagination `previousAriaLabel` / `nextAriaLabel` | string | `'Previous page'` / `'Next page'` | Add: "`previousLabel` (`nextLabel`) is appended when this doesn't contain it (WCAG 2.5.3), e.g. `Vorherige Seite, Zurück`." |
| JSDoc | rich-text `actionTitles` | `Partial<Record<ToolbarAction,string>>` | `{}` | Add: "A visible button label with letters or digits that the title doesn't contain is appended (`Heading 1, H1`)." |
| JSDoc | gallery `showCaptions`, `imageFallbackLabel` | boolean / string | `false` / `'Image'` | "A shown caption is part of the item's accessible name: `alt` (or `imageFallbackLabel` + number), then the caption." |
| JSDoc | accordion `ariaLabel`, `title`, `AccordionHeaderDirective` | string | `''` | "Start of the header button's accessible name. A plain `title` is appended unless contained. With an `lcAccordionHeader` template, the name is this label (or `title`) followed by the template's text, through `aria-labelledby`. Separate the template's parts with whitespace (`&ngsp;`), and set a label only for context that the template doesn't show." |
| JSDoc | file-upload `hint`, `acceptedLabel`, `maxSizeLabel` | string | unchanged | "The drop zone's accessible name is `hint`, then the shown accepted and max lines, comma-separated." |

```
labelWords(s)  = s.normalize('NFKD').replace(/\([^()]*\)/g, ' ').toLowerCase()
                  .split(/[^\p{L}\p{N}]+/u).filter(Boolean)           // toLowerCase, not toLocaleLowerCase
containsWords(h, n) = n.length > 0 && some i: n.every((w, k) => h[i + k] === w)
nameWithText(label, text):  t = text.replace(/\s+/g, ' ').trim(),  l = label.trim()
  1. t has no \p{L}|\p{N}, or t is one non-digit character  -> l   (symbol or icon: axe "incomplete")
  2. containsWords(words(l), words(t))                       -> l   (already contained: name unchanged)
  3. l === ''                                                -> t
  4. containsWords(words(t), words(l))                       -> t   (text contains the label: no stutter)
  5. otherwise                                               -> `${l}, ${t}`
```

The default rendering is unchanged. No SCSS value changes. The `&ngsp;` spaces sit only in flex or block parents. The stepper number moves to `::before` (§3). All of this was measured hash-identical, as listed above.

## 3. Anatomy and layout

There are no layout, spacing or type changes, so no wireframe changes. These are the DOM deltas.

### 360 px

```
Stepper button   [ (2) ] Profile                name "Step 2 of 3: Profile, Set up your profile"
                  │      ␠Set up your profile    (&ngsp; before description and optional; no aria-describedby)
                  └ <span class="lc-stepper__number" data-step="2"></span> + ::before{content:attr(data-step)}
Pagination       [‹] 1 2 3 [›]                  button text display:none (≤ 640 px), same name at every width
Header context   display:none (≤ 640 px)        unchanged
File upload      ⬆ hint / ␠Accepted: … / ␠Max: …   (&ngsp; between the <p>s, flex column)
```

### From 1024 px

```
Header  … ┊ TENANT      ┊   <button aria-label="Context info, Tenant Acme Corp">        (no title)
          ┊ Acme Corp…  ┊     <span label>Tenant</span>␠<span name title="Acme Corp">…</span>
Calendar week  │ Mo., 19. │ Di., 20. │ …         aria-label = day.label + " " + month/year of that day
Rich text  [H1][H2][H3][1.]                      aria-label = title = "Heading 1, H1" …
Accordion (rich + label)  <button aria-labelledby="{id}-label {id}-content">
                            <span hidden id="{id}-label">{label},</span>
                            <span class="lc-accordion__header-content" id="{id}-content">…</span>
                          panel role=region: aria-labelledby = the same list (otherwise {id}, as before)
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| all controls | unchanged | unchanged | unchanged; the only CSS added is `.lc-stepper__number::before { content: attr(data-step) }` |

## 4. States and names (old → new; also the changelog list)

| Control | Visible text | Old name | New name, EN | DE example |
|---|---|---|---|---|
| header context | Tenant · Acme Corp | `Context info` | `Context info, Tenant Acme Corp` (without a label: `Context info, Acme Corp`) | `Haushalt` → `Haushalt, Familie F.` |
| stepper step | Profile · Set up your profile | `Step 2 of 3: Profile` + description | `Step 2 of 3: Profile, Set up your profile` | `Schritt 2 von 4: Persönliche Angaben, Bitte geben Sie Ihre vollständige Anschrift ein` |
| stepper optional | Photo Upload · Optional | `Step 2 of 4: Photo Upload, Optional` | unchanged | `Schritt 3 von 4: Foto, Optionaler Schritt` |
| pagination prev/next | Zurück / Weiter | `Vorherige Seite` / `Nächste Seite` | EN unchanged (`Previous page` contains "Previous") | `Vorherige Seite, Zurück` / `Nächste Seite, Weiter` |
| calendar week header | Mo., 19. | `Montag, 19. Oktober 2026` | en-US `19 Mon October 2026` (old `Monday, October 19, 2026`) | `Mo., 19. Oktober 2026` |
| rich-text H1–H3, 1. | H1 / 1. | `Heading 1` / `Ordered List` | `Heading 1, H1` … `Heading 3, H3`, `Ordered List, 1.` | `Überschrift 1, H1`, `Nummerierte Liste, 1.` |
| rich-text B I U S • " <> { } 🔗 🖼 — | symbol | `Bold` … | unchanged (symbols: WCAG 2.5.3 treats them like icons; axe reports "incomplete") | `Fett` |
| gallery item (caption shown) | Sunset over the lake | `Photo 1` | `Photo 1, Sunset over the lake`; when the caption contains the alt, the caption alone (`Photo 1 — Sample image from Picsum`) | `Bild 3, Sonnenuntergang am See` |
| accordion rich header | Item One · Complete · 12:04 | `Item one details` | `<label>, Item One Complete … 12:04` (via labelledby); plain title unchanged | `Pipeline-Lauf, Schritt Eins Fertig 12:04` |
| file upload | hint · Accepted: … · Max: … | `Upload your documents (PDF, PNG, JPG)` | `Upload your documents (PDF, PNG, JPG), Accepted: .pdf,.png,.jpg,.jpeg, Max: 5.0 MB`; without accept or max unchanged | `Dateien hierher ziehen oder zum Auswählen klicken, Erlaubt: .pdf, Max.: 10.0 MB` |

**Per-control rules:**

- **Header:** `nameWithText(contextAriaLabel, [contextLabel, contextName].filter(Boolean).join(' '))`.
- **Stepper:** `[filled template, description, optional ? optionalLabel : ''].filter(Boolean).join(', ')`. If the raw template doesn't end with `{label}`, `label` is inserted after the filled template (safety net; it may stutter for such custom templates).
- **Pagination:** `nameWithText(previousAriaLabel, previousLabel)`, and the same for next.
- **Calendar:** in `weekDays`, ``ariaLabel: `${label} ${day.toLocaleDateString(loc, { month: 'long', year: 'numeric' })}` ``. It is built from the visible text, so it always starts with it. Each day uses its own month: `So., 1. November 2026` in a week that spans two months. The month and day views keep `dateLabel` and pass already.
- **Rich text:** `nameWithText(getActionTitle(a), getActionLabel(a))`, bound to both `aria-label` and `title`.
- **Gallery:** `nameWithText(alt || imageFallbackLabel + ' ' + (i + 1), showCaptions ? caption : '')`.
- **Accordion:**
  - Plain title: `nameWithText(ariaLabel || title, title)`.
  - Rich template with a label: no `aria-label`; the label's hidden span and the content's id are linked through `aria-labelledby`.
  - Rich template without a label: as before (name from content).
- **File upload:** `[hint, accept && `${acceptedLabel} ${accept}`, max > 0 && `${maxSizeLabel} ${formatSize(max)}`].filter(Boolean).join(', ')`.

**States:**

- Hover, focus-visible, active and disabled are unchanged; disabled steps and buttons keep their new names.
- Loading: the gallery placeholder doesn't change the name.
- Empty: a file upload without accept or max keeps the name `hint`.
- Error: n/a.
- **Overflow and long text (AC-6):** the visible text appears exactly once, complete, and is never truncated. A truncated name no longer contains the visible text and fails 2.5.3; the CSS ellipsis on the header name and the captions hides only pixels. If either part contains the other, only one is used (rules 2 and 4). Many items: one name per item, with no extra work.

## 5. Theming

| Element | Light | Dark | Contrast (computed) |
|---|---|---|---|
| stepper number (`::before`) | inherits `.lc-stepper__number` (unchanged) | inherits (unchanged) | unchanged: the glyph pixels are hash-identical in 372/372 shots |
| all other elements | unchanged | unchanged | n/a: no colour, token or SCSS value change |

No new tokens.

## 6. Accessibility

- **Semantics and roles** are unchanged (button, `role="button"` div, list, heading, region).
- **Avoiding a stutter (AC-8):**
  - The header's `title` moves from the button to `.lc-header__context-name`. Otherwise `title` ≠ name becomes the accessible description, and "Acme Corp" would be read twice. The tooltip still shows on the truncated name.
  - The stepper drops `aria-describedby` because the description is now in the name. The description element keeps its id.
  - The rich-text `title` equals the name, so there is no description.
  - The accordion's hidden label span ends with "," so the joined name reads as two phrases.
- **Stepper number (spec "Not allowed"):** the number becomes CSS-generated content, not `aria-hidden` text, and this doesn't hide anything voice users need.
  - The indicator was already `aria-hidden`.
  - The name contains the number ("Step **2** of 3"), so saying "click 2", "click Profile" or "click Step 2" all still match.
  - As DOM text, axe joined it to the title as `2Profile`, which no name can contain without reading "2 Profile".
  - The number still renders in prerendered HTML (CSS `attr()`) and in forced colours (text, so system colours apply).
- **Symbol labels:** B, I, U, S and the punctuation and emoji labels keep their names. They are single or non-letter glyphs, so axe returns "incomplete" (spec assumption).
- Keyboard, focus order, focus ring, 44 px targets and reduced motion are unchanged; there are no new elements in the tab order (the hidden span isn't focusable).
- **Announcement (NVDA-like):** "Step 2 of 3: Profile, Set up your profile, button, current step"; "Vorherige Seite, Zurück, Schaltfläche".

## 7. Texts

No new strings. These existing inputs now appear in the name (EN default / DE). At 360 px, no visible text changes.

| Input | EN default | DE |
|---|---|---|
| header `contextAriaLabel` | Context info | Kontext (consumer: Haushalt) |
| stepper `stepAriaLabel`, `optionalLabel` | Step {n} of {m}: {label} · Optional | Schritt {n} von {m}: {label} · Optional |
| pagination `previousLabel`/`previousAriaLabel` | Previous / Previous page | Zurück / Vorherige Seite |
| rich-text `actionTitles` h1, ol | Heading 1, Ordered List | Überschrift 1, Nummerierte Liste |
| gallery `imageFallbackLabel` | Image | Bild |
| file-upload `hint`, `acceptedLabel`, `maxSizeLabel` | Drag & drop files here, or click to browse · Accepted: · Max: | Dateien hierher ziehen oder zum Auswählen klicken · Erlaubt: · Max.: |
| calendar `locale` | de-DE (built-in) | Mo., 19. Oktober 2026 |

## 8. Stories

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Accordion RichHeader (changed) | `components-accordion--rich-header` | `ariaLabel: 'Pipeline run'` (was 'Item one details'); `&ngsp;` between the template parts | label plus rich content through labelledby, with no "Item one … Item One" stutter |
| Accordion group RichHeaderList (changed) | `components-accordion-group--rich-header-list` | drop `ariaLabel` per item; `&ngsp;` between the parts | name from content |
| Stepper Localized (new) | `navigation-stepper--localized` | `orientation: 'vertical'`, `activeStep: 1`, `stepAriaLabel: 'Schritt {n} von {m}: {label}'`, steps Konto · Persönliche Angaben (description "Bitte geben Sie Ihre vollständige Anschrift ein", 48 chars) · Zahlungsmethode (optional) · Bestätigung | DE names and AC-6 long text in the browser |

Baseline (hash): `tmp/story-shots/015/baseline`. It holds 62 stories (every story of the 8 components plus `navigation-sidenav--sidebar-first-{layout,collapsed,prominent-brand}`) at 360, 1024 and 1280 px, light and dark, `--full`, taken on main 0a712a1. All 62 must stay identical (AC-9), the two changed accordion stories included. **Risks:**

- Calendar stories render `new Date()`, so a review on a later day than 2026-10-23 must compare the calendar by `--measure` names, not by hash.
- The gallery loads its images from picsum over the network.

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| AC-1 | `<name>.axe.spec.ts` per component (the header context goes into `header.axe.spec.ts`), axe 4.14, `wcag21a`; rows EN, DE and long DE (≥ 40 chars); `computedName` exact as in §4, and `outcome` ≠ `violation` | §4 names; the symbol rows give `incomplete` |
| AC-2 | Per spec: restore the old name (`setAttribute('aria-label', old)`; for the accordion, remove `aria-labelledby`) → `violation` | `violation` in 8/8 |
| AC-3 | Whole-Storybook sweep, `--measure` = `tmp/story-shots/015/axe-sweep-measure.js` (as for the baseline), 360 and 1280 px, light and dark; compare with `tmp/015/axe-baseline-<w>-<theme>.log` | before: 31 stories at 1280 and 23 at 360 (no header, pagination or sidenav at 360; 898 stories); after: 0 |
| AC-4 | Same logs, per story, all rules except the label rule | identical strings. Pre-existing at 3.11.4, 1280 light: color-contrast 76, svg-img-alt 50, scrollable-region-focusable 14, aria-input-field-name 9, aria-prohibited-attr 6, target-size 5, aria-toggle-field-name 4, button-name 4, nested-interactive 3 (file-upload ×3), and 1 each for aria-allowed-attr, aria-hidden-focus, label and link-in-text-block |
| AC-5 | Unit tests: `startsWith(label)` for header, stepper, pagination, rich text, gallery (alt), file upload (hint), accordion (label) | Exceptions, recorded: the calendar name is built in (no consumer label); a gallery caption that contains the alt is used alone (rule 4) |
| AC-6 | Long DE rows: the name contains the text exactly once (`split(text).length === 2`), and the axe outcome ≠ `violation` | gallery caption "Blick vom Hochplateau über den nebligen Bodensee bei Sonnenaufgang", stepper description (§8) |
| AC-7 | `setInput` / navigate → `detectChanges()` → new name in the same pass | calendar `navigateNext` → `Mo., 26. Oktober 2026`; header `contextName` → new name; stepper `steps`; gallery `showCaptions`; file-upload `accept`; accordion host signal (labelledby follows by itself) |
| AC-8 | Unit: the header button has no `title`; no stepper `aria-describedby`; rich-text `title === aria-label`; reviewer reads the §4 strings | as stated |
| AC-9 | `story-shots --compare=tmp/story-shots/015/baseline`, 62 stories; new story at 360 and 1280 px | 372/372 identical |
| AC-10 | Assertions changed, with reasons: `header.public-site.spec.ts:166` → `Haushalt, Familie F.`; `stepper.component.spec.ts:191-207` → names with the description, and the describedby test → "the description is in the name, no describedby" (AC-8); `pagination.component.spec.ts:434-435` → `Vorherige Seite, Zurück` / `Nächste Seite, Weiter`; `accordion.component.spec.ts:123` → computed name starts with `fallback-label, ` | Compat HTML: deliberate deviation, the stepper number moves from text to `data-step` (§6); otherwise only `aria-label` |
| AC-11 | The changelog's Fixed list is §4; under Compatibility, exact-equality name queries need updating; the JSDoc is §2 | review |

**Jest plan:**

- Move the helpers from `header.axe.spec.ts` (the `fakeCanvasContext` stub, `audit`, `violations`, `outcome`, `computedName`) to `libs/angular-ui-kit/src/testing/axe-jsdom.ts`.
  - Add `"src/testing/**"` to the `exclude` of `tsconfig.lib.json` and `"src/testing/**/*.ts"` to the `include` of `tsconfig.spec.json`.
  - The helper is not exported. Check: grep `dist/libs/angular-ui-kit` for `axe` → 0 hits.
- Each spec has one `describe.each` row table plus the AC-2, AC-6 and AC-7 cases.
- **Calendar:** set the protected `currentDate` signal to 2026-10-21 (no fake timers, because axe needs real timers).
- jsdom ignores media queries, so the pagination text and the header context count as visible, which is the strict case.
- Run the specs serially; axe refuses parallel `run` calls in one file.
