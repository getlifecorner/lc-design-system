# Spec 040: lc-file-upload without nested interactive elements

- **Status:** ready
- **Type:** bug fix (accessibility, DOM structure) of `lc-file-upload`
- **Affected:** `libs/angular-ui-kit/src/lib/file-upload/` (`.html`, `.scss`, `.ts` only if the picker wiring needs it, `.spec.ts`, `.checks.spec.ts`, `.axe.spec.ts`, `.stories.ts`), `CHANGELOG.md`
- **Semver impact:** patch. No input, output, selector, slot or CSS hook changes; the visible result and the behaviour stay the same. Only the internal DOM changes (the hidden file input leaves the `role="button"` element). Assumption: no consumer styles `.file-upload__input` through `::ng-deep` (it is `opacity: 0`, 0 x 0, and has no documented hook).

## Need

Every File Upload story fails axe `nested-interactive` on `.file-upload` (found in 037 review finding 5; also in 3.23.1 and 3.11.4). The drop zone is a `div role="button" tabindex="0"` that contains the native `<input type="file" tabindex="-1" aria-hidden="true">`. A focusable control inside a `role=button` is not exposed reliably to screen readers (the child is hidden from or merged into the button), and `aria-hidden` on a focusable element is itself a defect class. `file-upload.axe.spec.ts` carries `PRE_EXISTING = ['nested-interactive']` to hide it. The requester wants no nested interactive elements and no loss of what works today. Affected on every page that uses the upload, at all widths and in both languages; the rule fails in the DOM, not in a layout.

## What the kit has today

- `file-upload.component.html`: one `div.file-upload` (role=button, tabindex 0, `aria-label` = hint + accepted + max lines, `aria-disabled`, drag handlers, click, Enter and Space) holding the input (`#fileInput`, `.file-upload__input`) and the visible content. `openFilePicker()` calls `fileInputRef().click()` unless disabled.
- No other kit component offers a drop zone. Nothing to reuse, so the fix is inside `lc-file-upload`.
- Out of this request: the 20 px remove button (`.file-upload__file-remove`) is below the 44 px target and sits in the list, not in the zone. Not changed here (see non-goals).

## Scope

- In: a zone structure in which no interactive element contains another, and the axe `nested-interactive` finding is gone from the component, its stories and the jsdom audit.
- In: remove `PRE_EXISTING` from `file-upload.axe.spec.ts`, so any violation fails the test.
- In: stories, tests and the changelog entry (Fixed).
- Not in (non-goals): new inputs or outputs; a visual redesign; the remove button size; the paste or camera features; changing rejection, type check or size messages (3.24.0), except that they must keep working.
- The structure is the designer's decision. Two shapes the spec rules neither in nor out: (a) the zone is a `<label>` or other native control that owns the real, visually hidden file input, or (b) the input is a sibling outside the `role=button` element and only the picker is triggered programmatically. The design must state which and why it still gives Enter and Space, the name and the focus ring.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | axe-core (version of `axe-jsdom`, 4.14) reports no `nested-interactive` and no other violation for `lc-file-upload` in every row of `file-upload.axe.spec.ts`; the `PRE_EXISTING` allowance is deleted | unit test (`file-upload.axe.spec.ts`) |
| AC-2 | `story-shots.mjs --axe` on every File Upload story at 360, 1024 and 1280 px, light and dark: 0 violations | story run, axe log |
| AC-3 | No focusable or interactive element is a descendant of another interactive element in the component's DOM (checked on the zone with and without files, enabled and disabled); no `aria-hidden="true"` on a focusable element | unit test (DOM walk) |
| AC-4 | Exactly one tab stop for the zone (the list's remove buttons are separate); Tab reaches it, and Enter and Space each open the native picker once (spy on `input.click` or the `change` path), with no double open | unit test + story at 360 px |
| AC-5 | Click on the zone, including on the icon and the text lines, opens the picker once; a click on a remove button does not open it | unit test |
| AC-6 | Drag and drop: `dragover` sets the drag-over class, `dragleave` clears it (also when moving over child nodes: no flicker), `drop` adds the files through the same path as `change` | unit test (`file-upload.component.spec.ts` unchanged assertions pass, or each changed assertion is justified in `build.md`) |
| AC-7 | The accessible name of the zone is unchanged: `computedName` equals the four strings in the axe spec rows (EN default, EN with restrictions, EN accept only, DE); the hint stays the prefix; the visible text is in the name (WCAG 2.5.3, `label-content-name-mismatch` passes) | unit test (axe spec) |
| AC-8 | The role is exposed as a button or equivalent that a screen reader announces as an actionable control with that name; `aria-disabled` or native `disabled` is set when `disabled()` is true and the zone is then neither focusable by Tab nor able to open the picker | unit test; manual note in `review.md` (VoiceOver or NVDA name and role as spoken) |
| AC-9 | Touch target of the zone is at least 44 px high and wide at 360 px (measured, EN and DE), and it keeps its current size within 1 px at 360, 1024 and 1280 px (padding, border, dashed look, icon, lines) | story + `--measure` |
| AC-10 | `:focus-visible` shows the current 2 px `--color-primary-500` ring with 2 px offset on the zone, 3:1 against its surroundings in both themes (computed); the ring is visible when focus is placed through the keyboard and absent on mouse click | story, light and dark, measured contrast |
| AC-11 | `forced-colors: active`: the focus ring, the dashed border and the text stay visible (outline uses a system colour); checked in light and dark with `--forced-colors` | story with forced colours |
| AC-12 | The 3.24.0 behaviour is intact: `fileRejected` emits with its code (size, type), the type is checked on drop as well as on change, sizes use the `locale` (DE: "Erlaubt: .csv", "Höchstens: 20,0 MB"); `file-upload.checks.spec.ts` passes without changed assertions | unit test |
| AC-13 | DE strings at 360 px: the zone wraps inside the viewport (no horizontal page scroll, text not cut off), as at 3.25.1 | story at 360 px, DE Locale story |
| AC-14 | Unchanged defaults: for the default inputs and every existing story, screenshots at 360, 1024 and 1280 px, L and D, are identical by hash to the 3.25.1 baseline, or differ only in documented sub-pixel focus-ring detail; no input, output, selector or CSS hook is added or removed | `story-shots.mjs --compare`, exported API diff |
| AC-15 | Prerendered HTML before JavaScript: the zone with its hint, accept and max lines is in the server HTML, and the layout is the same without hydration; the compat check (Angular 21 and 22, AOT, strictTemplates, prerender) passes | `check-angular-majors.mjs` |
| AC-16 | No consumer-visible regression with a form: the file input is still submitted or readable where it is today (a wrapping `<form>` and `name`-less use unchanged), and reading `files` after a pick works | unit test |
| AC-17 | Stories: each File Upload story renders without an axe violation; one story or description states how the picker is reached (keyboard, click, drop); `CHANGELOG.md` Fixed entry names finding 037-5 and says no API break | story + changelog |

Always covered: 360 px and desktop widths (AC-9, 13, 14) · light and dark (AC-2, 10, 14) · keyboard and screen reader (AC-4, 8) · EN and DE (AC-7, 13) · prerendered HTML (AC-15) · unchanged defaults (AC-14).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Tokens only; no raw colours. BEM names: keep `file-upload`, `file-upload__input`, `--drag-over`, `--disabled` where the DOM still has those parts.
- `lc-file-upload`'s exported types, `FileUploadRejection(Code)` and JSDoc stay as they are.

## Assumptions

- Assumption: patch, not minor: an internal DOM change that fixes a defect, with no new feature.
- Assumption: the visible design and the accessible name stay exactly as in 3.25.1 (the owner asks for the same behaviours, so no visual change is wanted).
- Assumption: a jsdom axe audit plus the Storybook axe runs are enough; no browser-level screen reader test is required beyond one manual note.
- Assumption: the 20 px remove button is out of scope (a different finding class: target size, not nesting). Record it in `review.md` if the reviewer wants a follow-up.

## Open questions

None.

## Resolution

Not applicable: the kit does not cover this; the defect is in the component.
