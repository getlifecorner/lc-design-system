# Design 037: lc-card link mode; lc-file-upload rejection code, type check, locale sizes and docs

- **Status:** ready (changed after review r1)
- **Spec:** [spec.md](spec.md) — AC-1 … AC-16
- **Changes (review r1, 2026-11-02):** C-1 link-card ring in forced colours is `Highlight` (§3, §4, §9; my design left it to the browser, which forces an outline on a non-focused ancestor to CanvasText). C-2 the lift rule for projected controls drops to (0,1,0) with `:where()` (§3). C-3 `accept`: `*/*` matches every file (build D-1, agreed) and MIME tokens are token characters only (§2).
- **Prototype:** stretched link injected into `components-card--clickable` at 3.23.1 (`tmp/story-shots/037/proto-link`): card outline on link focus `solid 2px 2px rgb(32,132,151)` L / `rgb(132,199,212)` D, identical to the clickable card's; centre and both corners hit the link; axe AX: heading "Pro" + link "Pro". Title wrap prototype (`probe-title`): "Leistungsverrechnungsschlüssel" today ends at x 361 at 360 px (17 px past the card edge 344); with the rule in §3 and `lang="de"` it hyphenates ("Leistungsverrechnungs-/schlüssel") to 2 lines inside 226 px. Title sweep over all 987 stories (21 render `.card__title`) at 360/1024/1280: `tmp/story-shots/037/sweep-*.log`.

## 1. Approach

**lc-card: extend with a link mode (stretched link).** Two inputs, `href` (plain URL) and `route` (+ `queryParams`, through `RouterLink`), switch the card to a link:

- The built-in title becomes `<hN class="card__title"><a class="card__link" href>…</a></hN>`; the anchor's `::after` (absolute, `inset: 0`) covers the card, so the whole card is the link (click, Enter, middle click, Ctrl/Cmd+click, context menu: native). The heading stays a heading, the link sits inside it: screen readers list both (prototype). This is the Inclusive Components card pattern, and it follows lc-list's `href` rows (3.16, TD-4): real link semantics, the click output (`itemClick` there, `cardClick` here) is not emitted on a link.
- `.card` keeps `role="article"` (today's non-clickable role), never `role="button"`, no `tabindex`. The only tab stop is the anchor.
- Hover, press, cursor and `selected` reuse the `clickable` rules (one grouped selector); the focus ring is drawn on `.card` with `:has(.card__link:focus-visible)` and the `focus-ring` mixin values, so the computed outline is the same element and value as for `clickable`.
- `route` uses `RouterLink`, as lc-header, lc-sidenav, lc-breadcrumbs and lc-bottom-nav already do (`@angular/router` is a required peer). The directive is created only inside the `route` branch, so cards without `route` never inject `Router` (no provider needed, existing specs run without `provideRouter`).
- Rejected: an `<a>` around the whole card (its name would be all card text; projected links or buttons would nest, and the HTML parser splits nested `<a>` in prerendered pages, so hydration breaks); an input named `routerLink` (the consumer's own imported `RouterLink` matches `[routerLink]` on the `lc-card` host too: a second navigation and a stray `tabindex="0"` on the host); a `linkClick` output as in lc-list (`route` covers in-app navigation, including base href and hash location).

**lc-file-upload: extend.** `code` in `fileRejected`, one shared check for picked and dropped files (type, then size), and `locale` following lc-datepicker (`''` keeps the built-in notation, so the default output is unchanged). No visual change; the component still shows no rejection message (the consumer does, by `code`).

**MCP docs (AC-14).** Cause, from `tools/components-manifest/extract-story-data.mjs`: it reads a story's `template:` and `parameters.docs.description.story` only. The four stories have neither (args only), so the manifest entry has no snippet and no description. Fix in the stories (template + description); the extractor stays unchanged, so no tool test. The developer confirms with `node tools/generate-components-manifest.mjs` after the Storybook build (the four entries get `snippet` and `description`).

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (new) | `href` | `string \| undefined` | `undefined` | URL the card links to (3.24, quellen row 1). The card becomes a real link: the built-in `title` is an `<a href>` inside its heading, and the link covers the whole card (click, Enter, middle click, "open in new tab", "copy link"). No router needed; works in prerendered HTML. Wins over `route`. Ignored by `dashed`. On a link card `clickable` has no effect and `cardClick` is not emitted. @default undefined |
| input (new) | `route` | `string \| readonly unknown[] \| null \| undefined` | `undefined` | In-app route the card links to through the Angular router (`RouterLink` commands: `'/quellen/usm'` or `['/quellen', id]`), relative to the consumer's route, rendered as a real `<a href>` like `href`. Needs the app's router (`provideRouter`); without one, use `href`. `''` and `null` mean no link. @default undefined |
| input (new) | `queryParams` | `Params \| null \| undefined` (type-only import from `@angular/router`) | `undefined` | Query parameters of `route`, as `RouterLink`'s `queryParams` (`{ ansicht: 'laeufe' }`). Ignored with `href` (write the query into the URL). @default undefined |
| input (JSDoc only) | `ariaLabel` | unchanged | `undefined` | Accessible name. On a link card it names the link instead of the card; it must contain the visible title (WCAG 2.5.3) and the heading reads it too, so keep it short. Without it the link is named by the title, and the card's content (badge, list) is read as normal content. On other cards it labels the card. |
| input (JSDoc only) | `clickable`, `variant` | unchanged | — | Add: "Has no effect on a link card (`href`/`route`)"; `dashed`: "`href` and `route` are ignored too". |
| output (JSDoc only) | `cardClick` | unchanged | — | Emitted when a `clickable` card is clicked or activated with Enter or Space. Not emitted on a link card: the link navigates by itself (one navigation); bind the native `(click)` for analytics. |
| input (new) | `locale` (file-upload) | `string` | `''` | BCP 47 locale of the shown sizes (max line, drop zone name, file list): `'de-DE'` gives "20,0 MB". Units stay B/KB/MB (1024 base). Empty keeps the built-in notation ("20.0 MB"); an invalid locale falls back to it. @default '' |
| output (type widened) | `fileRejected` | `FileUploadRejection` | — | Emitted once per rejected file, before `filesSelected`. `code`: `'type'` (matches no `accept` token; checked first) or `'size'` (over `maxSizeBytes`). `reason` is a fixed English text ("File type not accepted", "File too large"); translate from `code`. |
| type (new) | `FileUploadRejectionCode` | `'size' \| 'type'` | — | Why `lc-file-upload` rejected a file. |
| type (new) | `FileUploadRejection` | `{ file: File; reason: string; code: FileUploadRejectionCode }` | — | Payload of `fileRejected`. |
| input (JSDoc only) | `accept` | unchanged | `''` | Accepted types, comma-separated, case-insensitive: extensions (`.csv`), MIME types (`text/csv`), wildcards (`image/*`). Since 3.24 checked for picked and dropped files alike; a file matching no token is rejected with `code: 'type'`. `*/*` accepts every type. Tokens that are neither are ignored, as by the browser's picker; none left = every type. Prefer extensions: systems report MIME types differently (a CSV can arrive as `application/vnd.ms-excel`). |
| input (JSDoc only) | `multiple` | unchanged | `false` | Add: "`false`: one file. A new pick or drop replaces the selection with its first accepted file; if all its files are rejected (size or type), the selection is cleared and `filesSelected` emits `[]`." |

Type check (developer contract): tokens = `accept.split(',')`, trimmed, lower-cased; valid are `.x…` (dot + ≥ 1 char), `type/subtype`, `type/*`, where type and subtype are token characters (RFC 9110 `tchar`, so `text/csv;charset=utf-8` is dropped, as Chromium's picker drops it; C-3); others dropped. `*/*` matches every file (C-3, build D-1). No valid token → pass. A file passes if any token matches: `.ext` → `name.toLowerCase().endsWith(token)`; `type/*` → `file.type.toLowerCase()` starts with `type/`; else `file.type.toLowerCase() === token`. Order per file: type, then size, at most one `fileRejected`. Sizes: `Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d })` with d = 0 for B and 1 for KB/MB, created in a `computed` inside `try`; failure or `''` → today's `toFixed` path. One U+0020 between number and unit, as today.

Default rendering unchanged: without `href`/`route` the card template, classes, `role`, `aria-label` placement and keyboard handling are as today (Angular comment anchors aside); the new CSS applies only under `.card-linked`/`.card__link`, except the title wrap rule (§3, measured in §9 AC-11). File upload: `locale` `''` keeps `toFixed`; with `accept` empty no file is rejected for type. Semver: minor (3.24.0).

## 3. Anatomy and layout

Link-mode DOM (title-less cards: the anchor is the first child of `.card`, empty, `class="card__link card__link--bare"`, named by `ariaLabel`; dev-mode `console.warn` when both `title` and `ariaLabel` are missing, and when `href` and `route` are both set: "href wins"):

```
lc-card
└ div.card.card-outlined.card-padding-md.card-radius-md.card-linked   role="article" (no tabindex, no aria-label)
  └ div.card__header > … div.card__title-row
      └ h2.card__title > a.card__link[href="/datenbasis/quellen/sap-ist?ansicht=laeufe"]  "SAP-Ist"
                           ::after  position:absolute, inset:0, z-index:1 → covers .card (padding box)
```

### 360 px (story *Link Cards*, canvas padding 16)

```
x16                                             x344
┌──────────────────────────────────────────────┐ outlined, radius md 12, border 1 --color-border
│ ┌──┐  Actuals                                 │ content x33; tile 36 (x33–69); gap 16
│ │▣ │  Ledger actuals from SAP                 │ title x85 w226: 18/23.4 600 (h2>a)
│ └──┘                                          │ subtitle 13/18.2 --color-text-secondary
│ ──────────────────────────────────────────── │ header rule: pad 12, rule 1, margin 16
│ ● Loaded                                      │ lc-badge success sm [dot] (body, first)
│ Last loaded               02/11/2026, 09:14   │ lc-description-list rows
└──────────────────────────────────────────────┘ whole box = link (hover, press, ring 2/2 outside)
  gap 16 (--spacing-4)
┌ Leistungsverrechnungs-          (DE story)    ┐ 30-char title: 2 lines, hyphen, x85 w226
│ schlüssel                                     │
```

### 1024 / 1280 px

```
grid: repeat(auto-fit, minmax(min(100%, 280px), 1fr)), gap 16, align stretch (rows equal height)
1024: 3 × 320    title width 320-2-32-36-16-16 = 218 (the DE long title wraps)
1280: 3 × 405.33 title width 303.33 (one line, 276 px)
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ▣ USM        │ │ ▣ SAP-Ist    │ │ ▣ Leistungs… │
│ ─────────── │ │ ─────────── │ │ ─────────── │
│ ● Loaded     │ │ ● Loaded     │ │ ● Running    │
│ Last loaded… │ │ Last loaded… │ │ Last loaded… │
└──────────────┘ └──────────────┘ └──────────────┘
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| Link overlay | `inset: 0` of `.card` (padding box); `.card-linked { isolation: isolate }` keeps `z-index: 1` inside the card | — | — |
| Controls projected into a link card | `position: relative; z-index: 2` via `:host ::ng-deep :where(.card-linked :is(a[href], button, input, select, textarea, summary, [tabindex]):not(.card__link))` — they stay clickable above the overlay; (0,1,0), so a component's own `position: absolute` control (password toggle, hidden native input) keeps it (C-2, prototyped in review r1) | — | — |
| `.card__link` | inline; `color: inherit; text-decoration: none; outline: none` (no UA underline or ring; consumers' `a:hover` (0,1,1) loses to (0,2,0)) | as title | `--color-text-primary` |
| `.card__title` (all cards) | `hyphens: auto; hyphenate-limit-chars: 12 4 3` only. Not `min-width: 0` / `overflow-wrap`: the sweep (§9 AC-11) showed they break short squeezed titles mid-word ("Proj\|ects" in *Section Cards* 360). Hyphenation lowers the flex item's min-content only for words ≥ 12 chars in the page's `lang`; with `lang="de"` the 30-char title wraps (226 × 47 px, right 291 ≤ content edge 327); on a `lang="en"` page a German word overflows as today (known; consumers set `lang`) | 18/23.4 600 | `--lc-card-title-size` |
| Focus ring | `.card-linked:has(.card__link:focus-visible)`: `outline: 2px solid var(--color-primary-500); outline-offset: 2px`; inside it `@media (forced-colors: active) { outline-color: Highlight }` (C-1) | — | as `focus-ring` mixin |
| Hover, press, cursor | one rule `.card-clickable, .card-linked` in today's place (cascade order vs `.card-selected` unchanged): `cursor: pointer; user-select: none`, `:hover` bg `--color-surface-hover` + border `--color-border-strong`, `:active` `scale(0.98)` | — | as today |
| File upload | unchanged: zone at 360 x 16, 328 × 121, dashed 2 px, padding 32/24, hint 14 px (263 px wide), lines 12 px, list rows 13 px | — | — |

## 4. States

| State | Link card | File upload |
|---|---|---|
| default | the variant's look (outlined: surface, 1 px `--color-border`) | unchanged |
| hover | pointer anywhere on the card (overlay): as `clickable` (elevated also `--elevation-2`) | unchanged |
| focus-visible | Tab reaches the anchor; the ring is drawn on `.card` (2 px, offset 2); the anchor draws none | unchanged |
| active | `scale(0.98)`, 150 ms (0.01 ms under reduced motion) | unchanged |
| selected | `.card-selected` as today (primary border, `--color-surface-selected`, brand glow) | — |
| disabled | n/a; `dashed` stays the non-interactive tile: no anchor, plain heading, no `card-linked` | unchanged (`pointer-events: none`, 0.5) |
| loading / empty | n/a (consumer: lc-skeleton / lc-empty-state); title-less link card = bare anchor named by `ariaLabel` | empty list = no `ul` |
| error | n/a | type/size rejection: no built-in message (as today); with `multiple=false` the list is cleared; the stories show a consumer status line by `code` |
| overflow | 30-char DE title hyphenates (2 lines at 360/1024, 1 at 1280); subtitle wraps (as today); many cards: the grid adds rows, cards in a row stretch to equal height (`:host` and `.card` `height: 100%`) | long names ellipsis (as today); DE hint wraps centred; sizes like "1.023,9 KB" |
| forced colours | ring 2 px `Highlight`, as the focused clickable card's (C-1: without it the ring computes to CanvasText, the border's colour); title in `LinkText` (the system's link cue) | unchanged |

## 5. Theming

No new tokens. Computed with the WCAG formula in the browser (`tmp/story-shots/037/contrast-measure.js`, 3.23.1; dark translucent fills composited over `--color-background`):

| Element | Light | Dark | Contrast L / D |
|---|---|---|---|
| Title (link text) on outlined card | `--color-text-primary` #111827 on `--color-surface` #fff | #f1f6f8 on #101c26 | 17.74 / 15.85 |
| … on hover | on `--color-surface-hover` #f3f4f6 | on rgba(132,199,212,.06) | 16.12 / 15.71 |
| … on selected | on `--color-surface-selected` #e0f1f4 | on rgba(32,132,151,.24) | 15.25 / 13.20 |
| Subtitle `--color-text-secondary` (rest / hover / selected) | | | 7.56 / 6.87 / 6.50 · 11.16 / 11.06 / 9.29 |
| Focus ring `--color-primary-500` vs `--color-background` | #208497 on #fff | #84c7d4 on #0a121b | 4.37 / 9.95 |
| … vs `--color-surface-2` (card on a sheet) | | | 4.18 / 7.58 |
| Story status line `--color-text-error` vs background | #6b0909 | #f7a1a1 | 12.59 / 9.48 |

## 6. Accessibility

- **Semantics:** `.card` `role="article"`; `h{headingLevel}` holds the link; the link's name is its text (the title) or `ariaLabel`. Prototype (axe-core 4.14 `getRole`/`accessibleText`): heading "Pro", link "Pro". With `ariaLabel`, heading and link both read the label (name from content takes a descendant's `aria-label`); the JSDoc says so and advises dropping a long label in link mode, since the badge and list are now read as content.
- **Keyboard:** one tab stop per card (the anchor), in DOM order; Enter follows the link; Space scrolls the page (native link; the `clickable` Enter/Space handler is inactive, nothing calls `preventDefault`). Projected controls follow as their own tab stops; none is nested in the anchor (siblings), so no `nested-interactive`.
- **One navigation:** `cardClick` is never emitted in link mode. `href`: the browser navigates. `route`: `RouterLink` navigates on a plain primary click or Enter (and prevents the default), and leaves Ctrl/Cmd/Shift/Alt and middle clicks to the browser.
- **Target:** the whole card (overlay); the review measures every link card ≥ 44 px high. axe `target-size` sees only the anchor's inline box (21 px high): in the prototype (3 link cards, 360 and 1280) it passed 3/3 by spacing, with `link-name` 3/3, `heading-order` 3/3, `color-contrast` 11/11 and no violations (`proto-link-axe`).
- **forced-colors / reduced motion:** see §4; no new motion.
- **Announcements:** none for the card (navigation). File upload: the zone's name carries the localized size (same string as the line, Label in Name holds); rejections stay silent in the kit as today; the stories' status line uses `role="status"` (rendered empty at load) to show the consumer pattern.

## 7. Texts

| Key / input | EN default | DE (stories) |
|---|---|---|
| `fileRejected.reason` (fixed, not an input) | "File too large" / "File type not accepted" | — translate from `code` |
| `hint` | "Drag & drop files here, or click to browse" | "CSV-Datei hierher ziehen oder zum Auswählen klicken" |
| `acceptedLabel` / `maxSizeLabel` | "Accepted:" / "Max:" | "Erlaubt:" / "Höchstens:" |
| `removeFileAriaLabel` | "Remove file" | "Datei entfernen" |
| `locale` | `''` → "20.0 MB", "9.6 KB" | `'de-DE'` → "20,0 MB", "9,6 KB" |
| Story status, `type` | "liste.xlsx is not a CSV file." | "„liste.xlsx“ ist keine CSV-Datei." |
| Story status, `size` | "ist.csv is larger than 20.0 MB." | "„ist.csv“ ist größer als 20,0 MB." |

lc-card has no built-in text. DE card story: titles "USM", "SAP-Ist", "Leistungsverrechnungsschlüssel"; subtitles "USU Service Management", "Ist aus dem SAP-Hauptbuch", "Schlüssel aus SAP CO"; badges "Geladen", "Geladen", "Läuft"; list "Zuletzt geladen" "31.10.2026, 14:35" (SAP-Ist adds "Abdeckung bis Oktober 2026" "99,4 %"). Every visible string is German (034 r1).

## 8. Stories

| Story | Expected ID | Args / content | Shows |
|---|---|---|---|
| Link Cards | `components-card--link-cards` | grid `repeat(auto-fit, minmax(min(100%, 280px), 1fr))`, gap `var(--spacing-4)`; 3 × `variant="outlined" [headingLevel]="2"`, icons `chart-bar`/`banknotes`/`building-library`, titles "Service management", "Actuals", "Cost centres", subtitles, body `lc-badge size="sm" [dot]` (Loaded, Loaded, Running=primary) + `lc-description-list` "Last loaded"; `href="#/sources/usm"` etc. (a click stays in the canvas) | link mode, `href`, grid 1/3/3 columns, equal heights |
| Link Cards (German, router) | `components-card--link-cards-german` | `<div lang="de">`, texts §7; `[route]="['/datenbasis/quellen', 'sap-ist']" [queryParams]="{ ansicht: 'laeufe' }"` on SAP-Ist, string routes on the others; story `applicationConfig` `provideRouter([{ path: '**', children: [] }], withHashLocation())` → `href="#/datenbasis/quellen/sap-ist?ansicht=laeufe"` | `route` + `queryParams`, long title wrap |
| Link and Clickable | `components-card--link-and-clickable` | `repeat(2, minmax(0, 1fr))`, gap 16; row 1 outlined: `[clickable]="true"` "Clickable" vs `href="#/parity"` "Link"; row 2 the same `variant="elevated" [selected]="true"` | AC-4 parity surface |
| Default, With Restrictions, Disabled, Single File | existing IDs | same args; add `render` with a template binding only the story's own args (023) and `docs.description.story`; Single File's text states the one-file rules (AC-13) | MCP snippet + text; render hash-identical |
| Type Rejected On Drop | `form-file-upload--type-rejected-on-drop` | `accept=".csv" [multiple]="false" [maxSizeBytes]="20971520"`, status line; `play` drops `liste.xlsx` (DataTransfer + `drop`) | `code: 'type'`, nothing selected |
| Size Rejected | `form-file-upload--size-rejected` | same; `play` drops `ist.csv` with `size` 26 214 400 (`Object.defineProperty`, no 25 MB buffer) | `code: 'size'` |
| German Locale | `form-file-upload--german-locale` | `<div lang="de">`, `locale="de-DE"`, DE labels §7; `play` drops `ist.csv` of 9 830 B | "Höchstens: 20,0 MB", list "9,6 KB" |

New argTypes with `description` and `table.defaultValue`: `href`, `route`, `queryParams` (`undefined`), `locale` (`''`). Component descriptions: card gains a "Link mode (3.24)" bullet; file upload gains the one-file behaviour and `fileRejected` (payload, codes, order). `src/docs/internationalization.mdx`: the `lc-file-upload` row adds `locale` (sizes, `''` = "20.0 MB"). story-shots doesn't wait for `play`: the review polls for the status text.

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| AC-1 | unit (`card.link.spec.ts`): `href` → `h3.card__title > a.card__link[href="/x"]`; `route` + `queryParams` under `provideRouter([])` → `href="/quellen/usm?ansicht=laeufe"`; neither → no `a` (existing spec untouched) | as stated |
| AC-2 | unit: `.card` `role="article"`, no `tabindex`, no `aria-label`; link name = title, or `aria-label` on the anchor. Story 360: axe `getRole`/`accessibleText` on heading and link | heading "SAP-Ist" (h2), link "SAP-Ist" |
| AC-3 | unit: anchor click → `cardClick` 0× (href, route); Enter keydown not prevented by the card; route: plain click → `navigateByUrl` 1×, prevented; `ctrlKey`, `metaKey`, `button: 1` → 0×, not prevented. Story: `elementFromPoint` at centre and 2 corners = anchor | 1 / 0 / anchor |
| AC-4 | *Link and Clickable* 360/1280 L/D: rest/selected border, box-shadow, background equal per row; focus → `.card` outline equal; `:hover` rule selector list holds both classes; `--forced-colors`: outline solid 2 px on focus, same colour on both cards | `solid 2px 2px` #208497 / #84c7d4; forced rgba(5,0,73,.8) (emulated Highlight) on both (C-1) |
| AC-5 | measure: title colour = text-primary, anchor `text-decoration-line: none`; every link card ≥ 44 px high; `--axe` on the 3 card stories: no violations beyond the isolated-story trio; unit: `dashed` + `href` → no anchor | 17.74 / 15.85 |
| AC-6 | unit: 25 MB (`defineProperty` size) at 20971520 | `{ code: 'size', reason: 'File too large' }` |
| AC-7 | unit (`file-upload.checks.spec.ts`; jsdom has no `DragEvent`: `new Event('drop')` + `dataTransfer` property): liste.xlsx on `.csv` → `type`, `filesSelected([])`; ist.csv, IST.CSV pass; `text/csv` exact; `application/vnd.ms-excel` vs `text/csv` → `type`; `image/*` vs png pass / pdf `type`; `' .PDF , image/* '`; picked file (change) same | as stated |
| AC-8 | unit: 25 MB xlsx on `.csv`/20 MB → 1 rejection `type`; `accept=''` and `accept='csv'` → no type rejection | 1 |
| AC-9 | unit: de-DE → lines "Max: 20,0 MB" / "Höchstens: 20,0 MB", `aria-label` ends with it; list "9,6 KB", "512 B". Story *German Locale* 360 | as stated |
| AC-10 | unit: `'de_DE'`, `'not a locale!'` → no throw | "20.0 MB" |
| AC-11 | existing specs unchanged (card, file-upload, axe, `i18n-labels` "Max: 1.0 MB"); `--compare=tmp/story-shots/037/baseline`: 29 stories × 3 widths × 2 themes (174 shots: 17 card stories, the 7 other stories with a card title, `charts-stat-trend--inside-a-clickable-card`, the 4 file-upload stories) | 174 identical |
| AC-12 | §8 stories at 360/1024/1280 L/D; DE title lines 2 / 2 / 1, text right ≤ card content right; argTypes present | no overflow |
| AC-13 | read: `multiple`, `accept`, `fileRejected` JSDoc, class doc, *Single File* / rejection story texts | stated |
| AC-14 | `node tools/generate-components-manifest.mjs` after the Storybook build: the four `form-file-upload` entries have `snippet` and `description` | 4 / 4 |
| AC-15 | compat `home.html`: `<lc-card title="Quelle" [headingLevel]="2" route="/quellen/usm" [queryParams]="{ ansicht: 'laeufe' }">` and `<lc-card title="Hilfe" href="/de/hilfe">`; `EXPECT_IN_HTML`: `h2.card__title` then `<a … class="card__link" … href="/quellen/usm?ansicht=laeufe">` (lookaheads, both serialisers, 008) and `href="/de/hilfe"` | both in SSR HTML |
| AC-16 | changelog: Added (link mode, `code`, `locale`), Fixed (type check on drop and on picked "All files" choices; long card titles hyphenate with the page `lang`), Compatibility (no API break; `FileUploadRejection` stays assignable to `{ file; reason }`; `card` entry imports `RouterLink`, created only with `route`; with a MIME-only `accept` a picked file whose system type differs, a CSV as `application/vnd.ms-excel` on Windows, is now rejected: list the extension too, `.csv,text/csv`) | review |

Risks: input name `routerLink` (avoided, §1); a static `href="…"` attribute stays on the `lc-card` host (016) — tests query `a.card__link`; story args bound but undeclared render `undefined` (023); `hyphenate-limit-chars` is ignored by Safari (EN titles may hyphenate there, as in lc-accordion/toast); `play` timing in shots.
