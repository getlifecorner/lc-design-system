# Spec 009: Signed-in shell at 200 % text on a phone

- **Status:** ready
- **Type:** bug fix (reflow, WCAG 1.4.4 / 1.4.10) in `lc-header`, `lc-bottom-nav`, `lc-app-shell`
- **Affected:** `libs/angular-ui-kit/src/lib/header/header.component.{scss,html}`, `bottom-nav/bottom-nav.component.scss`, `app-shell/app-shell.component.{scss,html,ts}` (the bottom clearance), their stories and specs, CHANGELOG
- **Semver impact:** patch if the clearance stays CSS-only and no input is added; minor if the design needs a new optional input or public hook (e.g. a measured-height hook). Defaults at 100 % text unchanged either way. Not major.

## Need

life-os (AS-31, app-shell concept §7.1) signed-in frame on a phone set to large text (200 %), at 360 and 320 px, EN and DE:

1. `lc-header`: the `[slot='end']` content (the member trigger, AS-2) overlaps the brand. The wordmark runs under the avatar and the subtitle is cut to one letter. Today only `.lc-header--has-nav` sets `flex-wrap`; the plain header is one non-wrapping row, and the brand (`min-width: 0`) is squeezed to nothing while the end slot keeps its size.
2. `lc-bottom-nav` `floating`: the list is wider than the viewport (DE "Heute", "Haushalt": +19 px at 360 px, +59 px at 320 px). Cause to confirm: the label's `overflow-wrap: break-word` does not lower the flex min-content (`anywhere` does), and the pill is a fixed 56 px with `min-width: min(64px, 100%)` on the item. The taller bar then covers the page above it (the member row on Today). `lc-app-shell` reserves a fixed `--_clearance` (112 px + safe-area), not the bar's real height.

Measured by the requester with their AS-30 interims removed: identical, so the defect is older than AS-30.

## What the kit has today

| Existing | Why it does not suffice |
|---|---|
| `lc-header` has-nav wrap (second row for the nav) | Only with `navItems`; the signed-in frame has none, and the end slot is not part of the wrap |
| `--lc-header-subtitle-max-width`, subtitle ellipsis (AS-3) | Truncates the subtitle but the brand still loses its space to the end slot |
| Bottom-nav labels wrap, hyphenate (AS-1, 3.x changelog l. 556) | `break-word` does not shrink a flex item, so a long single word still widens the list |
| `--lc-app-shell-bottom-clearance` | The consumer must guess a height; it cannot follow the user's text size |

No input, slot or hook solves it without a kit change.

## Scope

- In: header reflow so the brand keeps its own space and the end slot goes to the end of a second row when it does not fit (the AS-30 (1) proposal, which AS-31 (1) cites; the same mechanism, so it is closed here for the signed-in and signed-out header alike); bottom-nav items sharing the width, labels wrapping, no overflow of the viewport; `lc-app-shell` clearance equal to the bar's real height; stories.
- Not in (non-goals): the rest of AS-30 (`a[lcButton]` / `lc-page-header` title `anywhere`, footer link padding); app-side T387 (Today tiles, member row); docked bottom-nav redesign; new icons or visuals at 100 % text.

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | Signed-in header (brand + subtitle, end slot with the member trigger) at 360 and 320 px with 200 % text, EN and DE: the brand's box and the end slot's box do not intersect; the wordmark is fully visible (wraps or truncates with "…", never under another element); the subtitle shows more than one character or is fully truncated by ellipsis rules | story at 360/320 + `--measure` (`getBoundingClientRect` intersection = 0) |
| AC-2 | At 200 % text the header grows to a second row with the end slot at the end of that row; `document.documentElement.scrollWidth <= innerWidth` | story + measure |
| AC-3 | At 360 px / 100 % text the header is one row with the unchanged height (56/64/80/112 per `size`), pixel-identical to 3.10.0 (screenshot compare) | story `--compare` baseline |
| AC-4 | `lc-bottom-nav` `floating` with 5 items, DE labels ("Heute", "Haushalt", "Dokumente"), 200 % text at 360 and 320 px: the bar's right edge <= viewport width minus the 16 px inset; the list's `scrollWidth == clientWidth` | story + measure |
| AC-5 | Same at `docked` variant and with 3, 4 and 5 items | story + measure |
| AC-6 | No label is clipped at 200 % text (label `scrollHeight <= clientHeight`); long words break only when they cannot fit (`overflow-wrap: anywhere` or equal), otherwise words stay whole | story + measure |
| AC-7 | `lc-app-shell` below 1024 px: the last content element's bottom edge is above the bottom bar's top edge at scroll end, at 100 % and 200 % text, 360 and 320 px, EN and DE, with and without `env(safe-area-inset-bottom)` | story with a tall page, scrolled to end + measure |
| AC-8 | Clearance follows the bar's real height when the bar grows; the consumer sets nothing. A consumer-set `--lc-app-shell-bottom-clearance` still wins | story + unit test (if script is used: jsdom `ResizeObserver` stub) |
| AC-9 | Prerendered HTML before JavaScript: header and bar do not overlap or overflow at 360 px / 100 % text; if the clearance needs JavaScript, the CSS fallback (112 px + inset) keeps today's result without JavaScript and the technique is SSR-safe (no `window` / `document` access on the server) | prerender check (`tools/compat`) + code review |
| AC-10 | 100 % text, 360 / 1024 / 1280 px, light and dark: bottom-nav, header and shell render as in 3.10.0 (item size 64 px high, pill 56 x 32, header heights) | screenshot compare |
| AC-11 | Both themes and `forced-colors`: no new colour values; focus rings of the bar items and the member trigger are not clipped in the wrapped layout; every touch target >= 44 px (items stay >= 48 x 64 px where width allows, >= 44 px otherwise) | story light/dark + measure |
| AC-12 | Keyboard and screen reader: DOM and focus order unchanged (brand, nav, end slot; bar items in order); `aria-current` and the labels unchanged; no `aria-hidden` on wrapped text | unit test + manual |
| AC-13 | Stories: header "signed in, 200 % text" at 360 and 320 px; bottom-nav floating "DE labels, 200 % text" at 360 and 320 px; app-shell "signed in, large text" with a tall page. The stories raise the text size the way a phone does (root `font-size: 200 %`, not browser zoom) | Storybook + `story-shots.mjs` |
| AC-14 | Existing specs unchanged and green; new specs for anything testable in jsdom; CHANGELOG entry names AS-31, the consumer page and the measured values | `nx test`, changelog |

Always covered: 360 px and desktop widths (AC-3, AC-10) · light and dark (AC-10, AC-11) · keyboard and screen reader (AC-12) · EN and DE (AC-1, AC-4, AC-7) · prerendered HTML (AC-9) · unchanged defaults (AC-3, AC-10).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break. A new input or hook is optional and its default renders as before.
- Tokens only; no raw colours. Hooks named `--lc-<component>-<property>`.
- The consumer's AS-30 interims (life-os `shell.component.css`, `auth-layout`) stay valid; the kit change must not fight them (wrap with no row gap is what they do).

## Assumptions

- Assumption: AS-31 (1) cites the AS-30 header proposal, so the header wrap is delivered here as one rule for signed-in and signed-out bars; the other AS-30 parts are a separate request.
- Assumption: "200 % text" is a root font-size of 200 % (phone large-text setting), not page zoom; at zoom the viewport in CSS px shrinks and 320 px is the equivalent.
- Assumption: the exact mechanism (wrap vs. truncation for the header, CSS-only vs. measured clearance) is the designer's choice, provided AC-1 to AC-9 hold. Preference: CSS-only for the clearance if it works (e.g. the bar taking part in the shell grid flow); a ResizeObserver in a browser-only guard is acceptable otherwise.
- Assumption: the bar's real height includes the 16 px floating inset and the safe-area inset.
- Assumption: the 19 px / 59 px overflow figures are from the requester's DE app; a kit story with the same labels reproduces them (the developer confirms the cause first).

## Open questions

None.

## Resolution

Not applicable: the kit does not cover it.
