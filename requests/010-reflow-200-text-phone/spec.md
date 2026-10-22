# Spec 010: Reflow gaps at 200 % text on a phone

- **Status:** ready
- **Type:** bug fix (AS-30 (2), AS-32) + extension of `lc-badge` (SI-15)
- **Affected:** `lc-page-header` (title), `a[lcButton]` / `lc-button` text, `lc-next-step-card` (narrow layout), `lc-badge`; stories, specs, CHANGELOG
- **Semver impact:** minor — SI-15 adds an optional `wrap` input on `lc-badge` (default off, so nothing changes). AS-30 (2) and AS-32 are patch-level fixes. If the owner prefers one patch release, SI-15 would have to be documentation only (see Questions).

## Need

life-os (signed-out pages and the signed-in Today and Household pages), phone at 320 px and 360 px with the system text at 200 %, German and English (WCAG 1.4.4, 1.4.10). Measured by the life-os e2e `as31-large-text.spec.ts` and `closed-beta.spec.ts`:

1. **AS-30 (2):** a single word wider than the line runs past the screen edge. "Hallo, Johanna-Friederike" in the `lc-page-header` title sticks out 38 px, the English title "Household" 5 px, and the sign-in title and footer links ("Datenschutz", "LifeCorner") also overflow. The cause is `overflow-wrap: break-word` on the page-header title and on `a[lcButton]`. `break-word` does not lower the min-content width, so the flex item cannot shrink.
2. **AS-32:** `lc-next-step-card` at 360 px and 200 % text. The narrow grid is `auto minmax(0,1fr)`, so the icon column takes 96 px and the title column 92 px. "Nichts zu tun" / "Nothing to do" breaks inside the word "Nichts". Life-os rule (Today 6.1): a name never breaks inside a word.
3. **SI-15:** `lc-badge` has `white-space: nowrap` and a fixed `height`, so a long label ("Geschlossene Beta, nur mit Einladung" at 320 px / 200 %) cannot wrap and runs out of its container. Kit 3.9.0 does not document a way to wrap it.

life-os works around these with interims (`auth-layout.component.ts` ~114-130, `shell.component.css` footer-link rule) and removes them after the release.

## What the kit has today

- `lc-page-header`: title has `min-width: 0`, `hyphens: var(--lc-page-header-title-hyphens, auto)`, `overflow-wrap: break-word` (scss ~124-134). Hyphens only help where the language dictionary applies; a hyphenated compound ("Johanna-Friederike") still has a break only at the hyphen.
- `button.component.scss` lines ~24-26 and ~233: `white-space: normal; overflow-wrap: break-word`.
- `lc-next-step-card`: container query `width < 30rem` with `grid-template-columns: auto minmax(0,1fr)`; no rule for large text.
- `lc-badge`: inputs `variant`, `size`, `rounded`, `dot`. No wrap option, no CSS hook for wrapping. CHANGELOG 3.10.1 already removes the header part of AS-30 (1); this request is the rest.

## Scope

- In: the three fixes above, stories, specs, CHANGELOG entry (with a Migration line naming the life-os interims to remove).
- Not in: the AS-30 (1) header wrapping (done in 3.10.1); the footer link's invisible `.btn-lg` padding (life-os keeps shrinking it at large text; the kit default stays); a general large-text mode for all components; the app-side Today tile and member-row fixes (life-os T387).

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `lc-page-header` title uses `overflow-wrap: anywhere` (instead of `break-word`). At 320 px and 200 % text, `scrollWidth <= clientWidth` for the page header and the document for the titles "Hallo, Johanna-Friederike" and "Household" inside a flex row (page header with and without actions). | story at 320 + 360 px, 200 % text, EN + DE, `--measure` of overflow |
| AC-2 | At 100 % text the title wraps at the same places as before: for titles whose longest word fits the line, no pixel difference at 360, 1024, 1280 px. `--lc-page-header-title-hyphens` still works. | screenshot compare of existing page-header stories |
| AC-3 | `a[lcButton]` and `lc-button` text use `overflow-wrap: anywhere`, so a link whose one word is wider than the line breaks inside the word and stays within the container (320 px / 200 %: "Datenschutz", "LifeCorner" in a flex row footer, with `max-width: 100%` only if needed). Min-content width of a normal button (words fit) is unchanged. | story with footer-link row at 320 px, 200 % text, EN + DE, overflow measure; existing button screenshots identical |
| AC-4 | `lc-next-step-card` narrow layout at 360 px and 320 px with 200 % text: the longest word of the title ("Nichts", "Nothing", "Nichts zu tun" title) is never broken inside a word. Mechanism is the designer's choice (smaller icon column or icon above the title when the title's longest word does not fit). Measured: no line of the title is a partial word, the card has no horizontal overflow. | story at 360 + 320 px, 200 % text, DE + EN, `--measure` of title text lines (Range rects) and overflow |
| AC-5 | At 100 % text and at 200 % text where it already fits, `lc-next-step-card` is unchanged at 360, 1024, 1280 px (icon beside the title, same sizes). | screenshot compare of existing next-step-card stories (light + dark) |
| AC-6 | `lc-badge` has an optional input `wrap` (boolean, default `false`, JSDoc with `@default false`). Default: `white-space: nowrap` and the fixed height as before, DOM and classes unchanged. | unit test default; screenshot compare of existing badge stories identical |
| AC-7 | With `wrap`, the label wraps (`white-space: normal`), text is centred, `height` becomes `min-height` (same value), `line-height` gives readable lines (>= 1.25), `max-width: 100%`. With `rounded` the pill radius becomes a fixed radius that looks right at two lines (no half-circle ends clipping text). "Geschlossene Beta, nur mit Einladung" at 320 px / 200 % stays inside a 288 px container, 2 or 3 lines, no clipped text. A label that fits on one line looks identical to the non-wrap badge. | unit test class/attribute; story at 320 + 360 px, 200 % text, DE + EN, light + dark, overflow and clip measure |
| AC-8 | Text and boundary contrast of the touched variants is unchanged (>= 4.5:1 text, 3:1 boundaries) in light and dark; `forced-colors` shows the badge border. | `theme-contrast.spec.ts` unchanged and green; forced-colors story check |
| AC-9 | Stories exist: page-header, button/footer links, next-step-card, badge `wrap`. Each at 320 and 360 px with 200 % text (root font-size 200 %), DE and EN; argType description and `table.defaultValue` for `wrap`. | Storybook build, story list |
| AC-10 | Keyboard and screen reader: no change to DOM order, roles or accessible names; focus ring of wrapped buttons and links still fully visible (not clipped) when the text breaks. | unit tests unchanged; story focus screenshot of a wrapped link |
| AC-11 | Prerendered HTML before JavaScript: the rules are plain CSS (no JS), the `wrap` class is in the prerendered badge HTML. | `check-angular-majors.mjs` (add `lc-badge` wrap class to `EXPECT_IN_HTML` if the designer sees fit) |
| AC-12 | Unchanged defaults: no existing input, class or hook is removed or changed; existing specs are not edited, except to add cases. CHANGELOG entry lists the measured values and the life-os interims to remove. | test run, diff of specs, CHANGELOG review |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Tokens only, BEM, both themes, `prefers-reduced-motion` unaffected. The `wrap` input and CSS hook names are the designer's to define (`--lc-badge-…` if a hook is needed).

## Assumptions

- Assumption: `overflow-wrap: anywhere` is the intended fix for AS-30 (2) (life-os proposal; verified by its interims). Browser support for `anywhere` is in the supported baseline (Safari 15.4+).
- Assumption: SI-15 uses an opt-in `wrap` input rather than changing the default, because a default change would let existing badges (counts, table cells) wrap and alter their height; "unchanged defaults" and the no-pixel-diff gate win over "patch release". life-os sets `wrap` on the closed-beta badge.
- Assumption: the AS-32 fix applies from the container query (< 30rem) and depends on actual text width, not a font-size flag, since CSS cannot read the OS text scale; the designer picks a pure-CSS mechanism (e.g. `auto` column that may shrink, or `grid-template-columns` with `min-content` for the title and wrapping the icon above it).
- Assumption: the footer link padding stays a life-os concern (non-goal).

## Open questions

1. Release shape: (a) one minor release, 3.11.0, with all three fixes (recommended: the `wrap` input is the cleaner API, the fixes are not delayed); (b) patch 3.10.2 for AS-30 (2) and AS-32 now, and SI-15 as a documented CSS-only pattern. Agents proceed with (a) unless the owner objects; not blocking.
