# Spec 017: lc-input error-state height and a link button on the hero band

- **Status:** ready
- **Type:** bug fix (G-WL3) + extension of `lcButton` / `lc-button` (G-WL1, wish)
- **Affected:** `lib/input/input.component.{html,scss,spec.ts}` and its stories; `lib/button/button.component.{ts,scss}`, `button-link.component.ts` and button stories; `lib/hero` story (band example); `CHANGELOG.md`, README component lists only if a variant is listed there
- **Semver impact:** minor. G-WL3 is a patch-level fix (no public input changes). G-WL1 adds an optional value or hook; a wider `ButtonVariant` union and a new CSS hook break nobody, and the default renders as before.

## Need

life-os website, waitlist page (concept `website-waitlist.md` §6.10, §7). The build waits for G-WL3.

- **G-WL3 (blocking):** `lc-input size="lg"` is 44 px high idle and 49 px high in the error state. The container gets class `input-error` (`input.component.html:19`, rule `input.component.scss:51`), and the error text `<p class="input-error">` (`html:88`) uses the same name, so the global-looking rule `.input-error { flex: 1; font-size: xs; color: error; margin: 0 }` (`scss:221`) also hits the container. The field jumps 5 px on a refusal. Seen on the waitlist boards and on the live contact form's 422 answer (360 px, German).
- **G-WL1 (wish, not blocking):** in the home band, `a[lcButton] size="lg"` sits in the default body of `lc-hero` on the teal band. Measured by the requester: `primary` text 5.17:1 but shape 1.2:1 against the band; `secondary`, `outline`, `ghost`, `link` fail text contrast. D-WL1 A already chose `primary` for now, so the page ships either way; the requester wants one link button whose boundary is visible on the band.

## What the kit has today

- `.input-error` is one class name for two things (container state, error text). Specs read both: `input.component.spec.ts:277` (`p.input-error[role="alert"]`) and `:325` (container has `input-error`). `lc-password-input` uses `lc-input-error` and `lc-verification-code-input` `lc-digit-input-error`: already distinct, not affected.
- Button variants: `primary | secondary | outline | ghost | link | danger | warning | info` (`ButtonVariant`). Public hooks exist only for `ghost` (`--lc-button-ghost-*`) and `link` (`--lc-button-link-*`). `primary` and `outline` have none, so a consumer cannot fix the band locally with a hook (and must not rebuild the button). `lc-hero` text is `#fff` on gradient bands (`hero.component.scss:59`).
- No inverse / on-dark variant exists. Whether a documented existing variant passes was not measured by the requester beyond the five above; the designer measures `danger`, `warning`, `info` too (AC-6).

## Scope

- In: distinct class names for container state and error text in `lc-input`; one way to get a link button with visible boundary and passing text on the hero bands; stories and changelog.
- Not in: G-CF4 and the other `lc-input` work of request 016; the errors' `role`/id behaviour; any other `lc-input` size or layout change; changing hero band colours; a general on-dark theme for all components.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | The field container's error state class and the error text's class are different names. The container state selector no longer matches the error `<p>`, and the `<p>` rules (`flex`, `font-size`, `color`, `margin`) no longer apply to the container. | unit test (container has the state class, `<p>` does not have it, and the reverse); grep of the stylesheet |
| AC-2 | Height is the same idle and in error for `xs sm md lg`: `lg` 44 px in both, and every other size equal to its idle height in error and in error + focus. Border height and total box measured with the footer present. | story + `--measure` on the bounding box of the field container (not the host) at 360 and 1280 px, light and dark; values in `build.md` |
| AC-3 | Error visuals unchanged: border `--color-error-600`, focus outline error colour, message colour, size and `role="alert"` as today. Disabled and readonly states unchanged. | `story-shots --compare` against the baseline; existing assertions pass |
| AC-4 | The previous container class name is kept only if the designer decides consumers could depend on it (document either way). The error `<p>` keeps a documented, stable class for CSS hooks if the designer keeps one; the rename is recorded in the changelog Changed section with the old and new names. | design.md decision; changelog entry |
| AC-5 | Specs that name the old classes (`input.component.spec.ts:277`, `:325`) change only for this stated reason. All other `lc-input`, `lc-password-input` and `lc-verification-code-input` specs pass unchanged. | full unit test run |
| AC-6 | G-WL1: measured contrast on each `lc-hero` colour variant's band (the teal one used by life-os first, then the others, at the gradient's worst point) for every existing `lcButton` variant, written into `design.md` as a table: text ratio and boundary ratio. | `--measure` / computed ratios, not estimates |
| AC-7 | Outcome: an `a[lcButton]` (and `lc-button`) can be drawn so that on the teal band the label has at least 4.5:1 and the button's boundary or fill at least 3:1 against the band, in default, hover, active and focus-visible states (focus ring 3:1 against the band). Either a new variant value (recommended name from the designer, for example an inverse) or documented hooks on an existing variant. If an existing variant already passes, the spec is met by docs alone (Resolution), with a story. | computed contrast per state; story on the hero band |
| AC-8 | The solution works with `size="lg"` as a link in the default `lc-hero` body at 360 px, 1024 px and 1280 px, in light and dark theme, with a German label of about 35 characters that wraps without horizontal scroll and keeps a 44 px minimum height. | story at the three widths; `scrollWidth <= clientWidth` and height measure |
| AC-9 | Keyboard and forced-colors: Tab reaches the link, Enter follows `href="#id"`, focus ring visible; in `forced-colors` the boundary uses system colours and stays visible; `prefers-reduced-motion` adds no motion. | story + forced-colors check; unit test for the anchor |
| AC-10 | Prerender: the new variant class (or documented markup) is in the prerendered HTML before JavaScript, with no layout shift of the band. | compat consumer prerender grep for the class |
| AC-11 | Unchanged defaults: every existing variant renders pixel-identical in existing stories; `ButtonVariant` only gains a member (if any); `lc-button` and `a[lcButton]` accept it equally (`button-link.component.spec.ts:75` list extended); a new hook has a documented default equal to today's look. | `story-shots --compare`; specs |
| AC-12 | Every new input value, hook or class has JSDoc with `@default`, an argType description and `table.defaultValue`; the MCP manifest shows it. | `npm run test:tools`; story review |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- Tokens only, no raw colours; a new inverse look uses existing or new semantic tokens in both theme files, with contrast asserted in `theme-contrast.spec.ts` if tokens are added.
- Request 016 (build stage) also edits `lib/input`. Whoever builds second rebases; no behaviour of 016 changes. Branch `fix/3.11.6-...` or one release with 016 is the release-manager's call.

## Assumptions

- Assumption: G-WL3 ships as a fix and may release before G-WL1 is settled; the requester's build is blocked only by G-WL3 (D-WL8 A). If G-WL1 is slow, the two can be released separately (3.11.6 patch, then minor).
- Assumption: "teal band" is one of the `lc-hero` `color` variants; the designer identifies which from the concept §6.10 and measures all of them.
- Assumption: the 5 px jump comes from the container receiving `margin: 0`/`flex: 1`/`font-size` of the error text; the designer/developer confirms the exact cause by measuring, the fix being the rename in AC-1.
- Assumption: the band link is one link button, not a general on-dark system; a single variant or hook set is enough.

## Open questions

None.

## Resolution

Not applicable yet; becomes the answer for G-WL1 only if AC-6 shows an existing variant passing on the band.
