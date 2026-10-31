# Spec 025: Review findings follow-up 2

- **Status:** ready
- **Type:** bug fix (several components, no new API)
- **Affected:** `toast` (scss), `drawer` (scss, stories), `notification-center` (scss, stories), `log-viewer`, `document-viewer`, `gallery`, `combobox`, `file-upload`, `field-group` (templates), `theme-contrast.spec.ts` if a pairing is added, CHANGELOG
- **Semver impact:** patch. No input, slot or hook is added or removed. Visible changes: standalone toast width, drawer close size, hyphenated toast text, filter chip colours. Each is a fix of behaviour that never worked as documented. Documented as "Changed" in the changelog. A standalone toast that relied on filling its parent is called out under Compatibility (see Assumptions).

## Need

Open findings 1 to 4 of request 024 (`024/review.md`, `024/build.md` line 59), found on main 3.19.0 by the review. No consumer gap file.

| # | Problem today |
|---|---|
| F1 | `lc-toast` message: German compound at 360 px splits one letter after the joint, no hyphen ("Benachrichtigung" / "seinstellungen"). Only `overflow-wrap: break-word` is set (toast.component.scss:43). |
| F2 | `toast.component.scss` `:host { display: block; width: 100%; max-width: 400px; margin-bottom }` is dead under `ViewEncapsulation.None` (toast.component.ts:46). A standalone `lc-toast` is `display: inline` and spans the canvas (1248 px at 1280). |
| F3 | `.lc-drawer__close` (both sites, drawer.component.html:31 and :41) is 2rem = 32 x 32 px (drawer.component.scss:75). |
| F4 | axe: `color-contrast` on `.lc-nc__filter` and `.lc-nc__filter--active` (6 notification-center stories); `aria-input-field-name` in 2 drawer form stories. |
| F5 | 30 `lc-icon` without `decorative` or `ariaLabel`: log-viewer 6, document-viewer 10, gallery 7, combobox 3, file-upload 3, field-group 1. |

## What the kit has today

- `lc-alert` since 3.13 uses `overflow-wrap: break-word` + `hyphens: auto`; the toast host takes `lang` (024 deviation 1).
- `lc-modal` (3.18) and `lc-toast` (3.19) close buttons are already 44 x 44; the same technique applies to the drawer.
- `lc-icon` has `decorative` and `ariaLabel`. Colour tokens and `theme-contrast.spec.ts` exist for pairings.
- For F2 the host styles must move to a rule that works without encapsulation (element selector `lc-toast` or a host class) instead of `:host`. Whether `lc-toast-outlet` stacks depend on the dead rule is to be checked by the designer.

## Scope

- In: F1 to F5 above.
- Not in: new inputs, new tokens (unless F4 needs a contrast token, designer decides), toast outlet redesign, changing icon names or sizes, other axe rules outside the stories listed.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `.lc-toast__message` has `overflow-wrap: break-word` and `hyphens: auto`. With `lang="de"` and "Benachrichtigungseinstellungen gespeichert." at 360 px the break shows a hyphen at a syllable boundary, no line is clipped, `scrollWidth` = 360. | Story With Action (DE) 360 L/D, `--measure`, screenshot |
| AC-2 | New baseline for wrapped EN toast lines: all toast and toast-outlet stories at 360/1024/1280 L/D compared with `--compare`. Every differing shot is listed in `build.md` with the reason; EN lines may rewrap only where a hyphen was added to a word longer than the line. Single-line toasts are identical. | story-shots `--compare` against pre-change baseline taken first |
| AC-3 | A standalone `lc-toast` in a block parent computes `display: block`, `width` = min(100 % of parent, 400 px), `margin-bottom` as the old rule intended. At 1280 the Success story is at most 400 px wide (was 1248). | `--measure getComputedStyle` + bounding box, 360/1280 |
| AC-4 | Toasts inside `lc-toast-outlet` keep their size: Service Call 328 x 78 / 320.1 x 63 at 360 (024 AC-6) and outlet stories hash-identical or explained. No double margin or gap change in the outlet stack. | outlet stories 360/1280 L/D, measure |
| AC-5 | Both drawer close buttons (header and `--floating`) are at least 44 x 44; the hit area under `elementFromPoint` is the button at 0.5 px inside each edge. The visible icon size and the header height are unchanged or the change is listed (heading row must not grow beyond what 44 px forces). No overlap with the heading or the content at 360, DE heading. | drawer stories incl. Without Heading, 360/1280 L/D, measure |
| AC-6 | Drawer close keeps `:focus-visible` ring, forced-colors border, accessible name `closeAriaLabel`, and the existing tab order. | spec + story, keyboard |
| AC-7 | `.lc-nc__filter` (rest, hover, `--active`, and the `--error/--warning/--success/--info` active variants) has text contrast at least 4.5:1 in light and dark, computed (font-size 0.6875rem is small text). Pairings added to `theme-contrast.spec.ts` where tokens are used. No raw colour fallback (`#3b82f6` in `--info`) is left. | `theme-contrast.spec.ts`, axe `color-contrast` = 0 on all 7 NC stories L/D |
| AC-8 | Notification-center filter chips remain usable: no layout shift at 360, horizontal scroll still works, touch target is addressed or explicitly left (see Assumptions). | story 360, measure |
| AC-9 | Drawer form stories: axe `aria-input-field-name` = 0. Fix is in the stories (label or `ariaLabel` on the field); if the cause is a kit field not forwarding its label, that is fixed in the component and reported. | `--axe` on the 2 drawer form stories |
| AC-10 | All 30 listed `lc-icon` sites have either `decorative` (icon next to visible text or inside a named button) or a translatable `ariaLabel` (icon is the only content and carries meaning). No new hard-coded English string: a label comes from the component's existing `locale`/label input or a new optional one with an English default (this makes it a minor, see Assumptions). A list of the 30 sites with the decision is in `design.md`. | grep of `<lc-icon` without either attribute = 0 in the 6 components; unit test for the decisions; axe `svg-img-alt` = 0 on their stories |
| AC-11 | German verified for every label added in AC-10 and AC-9 (long strings do not clip). | story with `lang="de"` 360 |
| AC-12 | Defaults unchanged: no existing spec assertion changed without a stated reason; full suite green. Prerendered HTML (compat 22) shows the toast host block layout before JavaScript. | Jest, `check-angular-majors.mjs --only=22`, `EXPECT_IN_HTML` if a class is added |
| AC-13 | Both themes, `forced-colors` and `prefers-reduced-motion` unaffected. | stories L/D, forced-colors measure on drawer close and NC chips |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no input removed or renamed.
- Take the "before" baseline (AC-2, AC-4, AC-5) before changing any file.

## Assumptions

- Assumption: patch release. If AC-10 needs a new optional label input with an English default, it is minor; the designer decides per site and prefers `decorative` so that no input is needed.
- Assumption: F2 is fixed (the documented intent: block, 100 %, max 400 px). The old behaviour (canvas-wide inline toast) was never intended; the changelog lists it under Changed with the consumer-visible width.
- Assumption: the 44 px target for the NC filter chips is not required here (inline filter, WCAG 2.2 AA target size 24 px minimum is already met by a chip of about 24 px height; the designer verifies and may raise it).
- Assumption: contrast failures in F4 are fixed by choosing existing tokens (for example `--color-text-primary` on the chip, on-colour tokens for the active variants), not by new tokens.
- Assumption: `hyphens: auto` needs a `lang` on the page; without it the browser only breaks by `overflow-wrap` as today. No `lang` input is added.

## Open questions

None.
