# Spec 015: Label in Name (WCAG 2.5.3) for the remaining eight components under axe-core 4.14

- **Status:** ready
- **Type:** bug fix (accessible names of eight components)
- **Affected:** `lc-header` (context button), `lc-stepper`, `lc-pagination`, `lc-calendar`, `lc-rich-text-editor`, `lc-gallery`, `lc-accordion`, `lc-file-upload`; their specs and stories; `CHANGELOG.md`
- **Semver impact:** patch. Only accessible-name strings change, no input, default visual or API changes (same class as 014 / 3.11.4). The designer must list every changed default name so the changelog can warn consumers whose tests match names exactly (see AC-11).

## Need

life-os (AS-33 follow-up, low priority, owner approved 2026-10-23). Request 014 swept all 897 stories with axe-core 4.14 (`label-content-name-mismatch`, tag `wcag21a`, light, 360 and 1280 px; `tmp/014/sweep-{360,1280}.json`, `requests/014-…/design.md` lines 158-169). Besides the avatar trigger (fixed in 3.11.4), eight components still have controls whose `aria-label` does not contain their visible text. Voice-control users who say what they see cannot activate them (WCAG 2.5.3). life-os uses none of them today, so nothing is blocked: the goal is that every story is clean under 4.14 before a consumer lifts an axe hold.

## What the kit has today

Failing controls, from 014's sweep (visible text → current name):

| Component | Control (visible → name) | Stories |
|---|---|---|
| `lc-header` | context button: "Tenant Acme Corp" → `Context info` (1280 only) | header full-featured, with-org-info, with-org-name-only, with-tenant-info; 3 sidenav sidebar-first |
| `lc-stepper` | step button: label and description → `Step 2 of 3: Profile` | 6 |
| `lc-pagination` | prev/next with localised labels (1280 only) → `Vorherige Seite` | 1 |
| `lc-calendar` | week column: "Mo., 19." → `Montag, 19. Oktober 2026` | 1 |
| `lc-rich-text-editor` | toolbar: "H1", "1." → `Heading 1`, `Ordered List` | 8 |
| `lc-gallery` | item `role="button"`: caption or title → `Photo 1` | 4 |
| `lc-accordion` | rich header content → `Item one details` | 2 |
| `lc-file-upload` | drop zone `role="button"`: instructions → `Upload a profile picture` | 2 |

014 added the pattern to follow: the name starts with the consumer's label and appends the visible text (`Menu for Johanna Müller, JM`), start-anchored queries keep matching. `header.axe.spec.ts` shows how to run axe 4.14 in Jest (canvas stub, `computedName`, `outcome`, a negative control). `story-shots --axe` runs the real rule in the browser. No existing input solves this: the names are built-in or come from label inputs that consumers set without the visible text in mind.

## Scope

- In: each control in the table gets an accessible name that contains its visible text (the text as rendered, case-insensitively normalised as axe does), in EN and DE; a Jest axe spec per component; the changelog entry.
- Not in: `lc-avatar` / header avatar trigger (done in 014); other axe rules except that no new violation may appear; new inputs unless the designer shows a name cannot be built from existing inputs and locale strings (then optional, default renders as before); consumer migration.
- Not allowed: disabling or excluding `label-content-name-mismatch`; hiding visible text with `aria-hidden` merely to make the rule inapplicable when sighted voice users still see and say it (designer decides per control and records why in `design.md`).

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | Every one of the 8 controls in the table has an accessible name containing its visible text, EN and DE, for default and localised label inputs. `label-content-name-mismatch` is not a violation. | Jest axe spec per component (axe 4.14, tags `wcag21a`), exact name asserted per row |
| AC-2 | Each spec has a negative control: the old name is put back in the DOM and the rule reports a violation (or `build.md` states why jsdom cannot and the browser layer proves it). | Jest / `--measure` + `--axe` |
| AC-3 | Sweep over all stories (the 897 count may have grown) at 360 and 1280 px, light and dark, `story-shots --axe` with `wcag21a`: 0 `label-content-name-mismatch` violations. The 31 stories named in the table are listed with before/after. | `story-shots --axe` log in `build.md` |
| AC-4 | No new axe violation with tags wcag2a/2aa/21a/21aa/22aa in the same sweep, other than ones that already existed at 3.11.4 and are named in `build.md`. | same log vs baseline |
| AC-5 | Names stay start-anchored where a consumer label exists: an existing label (e.g. `Step 2 of 3: Profile`, `Heading 1`, `Photo 1`, `Upload a profile picture`, `Context info`) is still the prefix of the new name, or the designer records why not and AC-11 lists it. | unit test per control |
| AC-6 | Long text: very long visible text (DE, 40+ characters, e.g. a gallery caption or stepper description) is not duplicated into an unreadable name; the designer states a rule (truncate, or name only the label part when axe accepts it) and the specs prove it passes. | unit test + axe |
| AC-7 | Dynamic text: when visible text changes at run time (calendar month, pagination page, stepper state) the name updates in the same change detection pass. | unit test |
| AC-8 | Screen reader: no control announces the same text twice in a way that reads as a stutter; names stay in the component's locale (EN defaults, DE verified through the existing `locale`/label inputs). | unit test on computed name; designer reviews strings |
| AC-9 | Visual output is unchanged: screenshots of the affected stories at 360 and 1280 px, light and dark, hash-identical to the 3.11.4 baseline, except where a change in visible text is deliberate and listed. Keyboard behaviour, focus ring and 44 px targets unchanged. | `story-shots --compare` |
| AC-10 | Unchanged defaults: no input removed or retyped, no existing assertion changed except for a name string with a stated reason. Prerendered HTML of the compat app is unchanged except for `aria-label` values. | Jest, compat check |
| AC-11 | CHANGELOG *Fixed* (AS-33 follow-up, axe 4.14, per component old → new default name, EN/DE example), *Compatibility* (exact-equality name queries need the new name; start-anchored keep matching), no remaining known 4.14 hits. JSDoc of any input whose text now appears in the name says so. | review |

Covered by AC-1/3/9: 360 px and desktop widths, light and dark, keyboard (unchanged), EN and DE, prerendered HTML.

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency (axe-core stays a devDependency), no API break.
- Test-only helpers (canvas stub) may be shared between specs, not exported from the library.

## Assumptions

- Assumption: patch, as 014 was, because names of controls are changed without an API change; one release for all eight, one branch (`fix/<x.y.z>-label-in-name-remaining`).
- Assumption: the 31 story count is 014's (4+3 header, 6, 1, 1, 8, 4, 2, 2); the sweep in AC-3 is authoritative if it finds more.
- Assumption: low priority, so no split by component; if one control cannot be fixed without an API decision, the designer may defer only that one, name it in `design.md`, and send a question back instead of widening the API silently.
- Assumption: icon-only buttons and visible text that is a single character stay "incomplete" in axe (as in 014) and count as clean.

## Open questions

None.
