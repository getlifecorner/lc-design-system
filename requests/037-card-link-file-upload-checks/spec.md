# Spec 037: lc-card link mode; lc-file-upload rejection code, type check on drop, locale sizes and docs

- **Status:** ready
- **Type:** extension of `lc-card` and `lc-file-upload` (plus docs/stories)
- **Affected:** `lib/card/card.component.{ts,html,scss,spec.ts}`, `card.stories.ts`; `lib/file-upload/file-upload.component.{ts,html,spec.ts}`, `file-upload.stories.ts`; `CHANGELOG.md`; `tools/generate-components-manifest.mjs` only if it is the cause of the empty MCP story docs (AC-14)
- **Semver impact:** minor. All new inputs and the new event field are optional and additive; defaults render and behave as before. One behaviour change is a bug fix (type check on drop, AC-6), see Assumptions.

## Need

Finance Intelligence "Quellen" page (Angular 22, kit 3.22.2). Gap file rows 1-3 (concept quellen.md §7 rows 5, 3, 4).

1. Overview of sources: one `lc-card variant="outlined" clickable` per source, each opening its own page. Today the card is `role="button"` with `tabindex="0"`; its children are presentational, so the `h2` from `headingLevel` is not announced and heading navigation skips the cards. It is also no link: no address, no "open in new tab", no "copy link", no middle click.
2. CSV upload in an `lc-modal` with `lc-file-upload` (`accept=".csv"`, `multiple=false`, `maxSizeBytes=20971520`):
   - `fileRejected.reason` is the English text "File too large", with no code, so a German page cannot translate it safely.
   - `accept` is applied only by the native picker. A dropped `liste.xlsx` passes `processFiles`, which checks only the size.
   - `formatSize` writes "20.0 MB" with `toFixed`, not in the user's locale (German: "20,0 MB").
3. MCP `get-documentation-for-story` returns no content for the stories Default, With Restrictions, Single File, Disabled of `Form/File Upload`; the one-file behaviour is documented nowhere.

The requester works around all three in the page (own `ariaLabel`/`cardClick` navigation, own extension check, own texts).

## What the kit has today

- `lc-card`: `clickable`, `ariaLabel`, `headingLevel`, `cardClick`; the host `div` gets `role="button"` and `tabindex="0"`. No `href`/`routerLink`. A link inside a card body works for its own text but not for the whole card and does not fix the heading.
- Other components (`sidenav`, `header`, `breadcrumbs`) already use `@angular/router`, so a router-based link in the kit is not a new dependency. `href` plus `routerLink` style inputs exist as a convention in `lc-sidenav` / `lc-header` (`homeHref`).
- `lc-file-upload`: `fileRejected: {file, reason}`, `accept`, `maxSizeBytes`, `hint`, `acceptedLabel`, `maxSizeLabel`, `removeFileAriaLabel`. No `locale`, no code, no type check. `multiple=false`: `selectedFiles.set(accepted.slice(0, 1))`, so a second selection replaces the first, and a too-large file leaves `accepted` empty, which clears the current selection (the requester's "clears the selection").

None of this solves the gaps; nothing to resolve without a build.

## Scope

- In: link mode on `lc-card` (row 1); `code` on `fileRejected`, type check on drop and pick, `locale` input for sizes (row 2); stories with code and docs text for the four file-upload stories (row 3); a link-mode card story.
- Not in: new visuals for the card (look, hover, focus ring stay as for `clickable`); a rejection code for other reasons than `size`/`type`; translating `reason`; changing the one-file behaviour (documented only, AC-13); any change to the tabs (rows 1-2 of the concept are void).

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `lc-card` has an optional link input (`href`, and a router variant with optional `queryParams`; exact API is the designer's call). With it set, the card renders as a link (`<a href>`) with a real address; without it the DOM and behaviour are unchanged. | unit test |
| AC-2 | In link mode the title stays a heading of `headingLevel` in the accessibility tree, and the card is exposed as a link whose name is the card's name (`ariaLabel` if set, else the title). Screen readers list both. In link mode the host has no `role="button"`. | unit test (roles/names), story at 360 px |
| AC-3 | Enter and click follow the address; middle click, Ctrl/Cmd+click and context menu ("open in new tab", "copy link") work natively. `cardClick` behaviour in link mode is defined by the design (no double navigation) and tested. | unit test, story |
| AC-4 | Look, hover, `:focus-visible` ring and `selected` state in link mode equal those of `clickable` (same computed values for border, shadow, outline); focus ring contrast at least 3:1 in light and dark; `forced-colors` shows a visible focus indicator. | story measurement at 360 and 1280, both themes |
| AC-5 | Link text/inks and the interactive area meet AA: text 4.5:1; target at least 44 px high, no underline artefacts from the browser's default `a` style. Dashed variant stays non-interactive (as for `clickable`). | computed contrast, measurement |
| AC-6 | `fileRejected` payload is `{file, reason, code}` with `code: 'size' \| 'type'` (exported union type); `reason` text unchanged ("File too large" for size; an English text for type). Rejecting a 25 MB file with `maxSizeBytes=20971520` emits `code: 'size'`. | unit test |
| AC-7 | `accept` (comma-separated extensions such as `.csv`, exact MIME types, and `type/*` wildcards, case-insensitive, whitespace tolerant) is checked for dropped and picked files alike. Dropping `liste.xlsx` on `accept=".csv"` emits `fileRejected` with `code: 'type'` and selects nothing; dropping `ist.csv` (and `IST.CSV`) selects it. | unit tests, incl. MIME and wildcard cases |
| AC-8 | A file failing both checks emits one rejection; the order of checks is fixed and documented (type first, then size, assumption below). Empty `accept` accepts every type, as today. | unit test |
| AC-9 | New optional input `locale` (BCP 47 string, default as today: current output unchanged, "20.0 MB"). With `locale="de-DE"` the shown hint line reads "Max: 20,0 MB" (with the default label; "Höchstens: 20,0 MB" with `maxSizeLabel="Höchstens:"`), and the drop zone's accessible name carries the same string (Label in Name). The selected-file list uses the same formatting. | unit test, DE story |
| AC-10 | Invalid `locale` strings do not throw; they fall back to the default notation. | unit test |
| AC-11 | Defaults unchanged: without the new inputs, existing specs pass unmodified, and a file-upload with no `accept` behaves as before. | existing spec suite |
| AC-12 | Stories for each new case: card as three overview links in a grid at 360 / 1024 / 1280 (EN and DE titles, long German title wraps without clipping, light and dark); file-upload type rejection on drop, size rejection, and `locale="de-DE"`. Every new input has an argType `description` and `table.defaultValue`, JSDoc with `@default`. | story review, screenshots |
| AC-13 | Docs state the `multiple=false` behaviour: a second selection replaces the first; a rejected file (size or type) clears the current selection when `multiple=false`. Also document `fileRejected` (payload, codes). In the stories' description and in the component JSDoc. | story docs text |
| AC-14 | Through the MCP (`get-documentation-for-story`) the four stories Default, With Restrictions, Single File, Disabled return code and text. Cause is found first (stories have only `args`, no `render`/`docs.source`/description); fix at the stories or in the extractor, covered by a tool test if the extractor changes. | `npm run test:tools`, manifest output |
| AC-15 | Prerendered HTML: a link-mode card is a real `<a href>` in the SSR output before JavaScript (add to `EXPECT_IN_HTML` if the compat template can host it). Layout holds at 360 px without JS. | compat check or prerender test |
| AC-16 | `CHANGELOG.md` entry for consumers: what is new, gap IDs (quellen rows 1-3), the fixed drop behaviour called out, "no API break". | review |

Always covered: 360 / desktop widths (AC-4, AC-12), light and dark (AC-4), keyboard and screen reader (AC-2, AC-3), EN and DE (AC-9, AC-12), prerendered HTML (AC-15), unchanged defaults (AC-11).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged. No new runtime dependency (`@angular/router` is already used by the kit; `Intl.NumberFormat` is built in). The card's router variant must work on Angular 21 and 22 and must not make the router required for consumers that don't use it (designer to check against `tools/compat`).
- No API break: new inputs optional, existing event field `reason` kept.

## Assumptions

- Assumption: `code` is an added field, so `fileRejected` stays assignable for consumers typing the payload as `{file; reason}`.
- Assumption: the type check on drop is a behaviour change for consumers who relied on the missing check; it is the documented behaviour ("wrong type") and counts as a bug fix, minor release. Changelog says so under Fixed.
- Assumption: type check runs before the size check; one rejection per file.
- Assumption: size units stay "B/KB/MB" (binary 1024 base) as today; only the number notation is localized.
- Assumption: the requester's `ariaLabel` workaround keeps working; in link mode `ariaLabel` still applies as the link name.
- Assumption: the empty MCP docs for the four stories come from the stories carrying only `args` (no code/description); the developer confirms in AC-14.

## Open questions

None.

## Resolution

n/a (the kit does not cover the three gaps).
