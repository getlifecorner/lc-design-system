# Spec 058: lc-card accessible name, lc-hero band contrast

- **Status:** ready
- **Type:** bug fix (two WCAG 2.2 AA failures, both pre-existing; the hero item changes a default look)
- **Affected:** `lc-card` (`card.component.html/.scss/.spec.ts`, stories), `lc-hero` (`hero.component.scss`, stories, `theme-contrast.spec.ts` or a hero spec), CHANGELOG (answer both *Known* lines of 3.37.0)
- **Semver impact:** minor (3.38.0): fixes only, no API change. The hero text or band colours change on up to 6 bands (a look change forced by a measured AA failure; see Assumptions).

## Need

Source: follow-ups 057-s1, 057-s2 (release.md Open items, review F-4 and F-1 of request 057); requester: owner, from the regeln and monatsstand pages of life-os.

- **057-s1:** a clickable `lc-card` with a `title` and an `ariaLabel` equal to its visible text fails axe `label-content-name-mismatch` (WCAG 2.5.3). Measured in Chromium (axe 4.14): `textContent` reads „Starteraus USM übernommen 1 …“ (title and body glued), the label „Starter aus USM übernommen 1 …“ does not contain it. The requester's regeln tile (title, count, dl) cannot be named by its visible text and keeps its transition without `ariaLabel`. A card without `title` already passes (3.37).
- **057-s2:** `lc-hero` text on the coloured bands is below AA. Body text 2.01–3.81:1 on 6 of 9 bands (primary 3.62, purple 3.81, secondary 2.70, orange 2.61, success 2.39, warning 2.01; needs 4.5:1). Title on success 2.72 and warning 2.26:1 (needs 3:1 as large text). Pre-existing; the bands do not follow the theme.

## What the kit has today

- Card: the head, subtitle, body and footer are separate blocks with no text separator, so `textContent` and the accessible name run together. 3.37 fixed the same for the description list (D-4) and the title-less card. No input changes this.
- Hero: body colour `rgba(#fff, .85)` (variant `light`: `rgba(neutral-800, .75)`), title `#fff`, on gradients `*-800/dark` to `*-500/default` (`hero.component.scss`, `$hero-colors`). `lc-badge` in a hero already reaches 4.85:1 or more (3.37). No hook or input changes the band shade or adds a scrim.

## Scope

- In: whitespace between all text parts of the card (title, badge, subtitle, header-action text, body, footer) in `textContent`, accessible name and copied text, with no visible change. Band/text contrast on all 9 colours of the default and `light` hero variants.
- Not in: new inputs or hooks; the `light` variant look if it already passes (measure first); other 057 backlog rows (057-n6 is a hero story label and stays in the backlog); card layout changes.

## Acceptance criteria

### 057-s1 (card)

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | `textContent` of a card with `title`, `badge`, `subtitle`, body and footer separates each part by whitespace (no „Starteraus“) | unit test, exact string |
| AC-2 | A `clickable` card with `title` and `ariaLabel` = its visible text passes axe `label-content-name-mismatch` and `nested-interactive` | *Clickable* story with title + dl, Chromium axe at 360 and 1280, L and D |
| AC-3 | No visible change: card stories hash-identical to the baseline; separators add no width, gap or line | `story-shots --compare`, `--measure` of head height and title x |
| AC-4 | Collapsible and link cards keep their names (toggle name = title, link name = title or `ariaLabel`, `aria-describedby` = subtitle); existing specs unchanged | `card.collapsible`, `card.link` specs green |
| AC-5 | German long title with a badge at 360, and a card without `title`, behave as before | story at 360 |

### 057-s2 (hero)

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-6 | Body text ≥ 4.5:1 on all 9 colours in the default and `light` variants, measured at the worst gradient stop under the text (both ends and the text corners) | computed contrast (`--measure` or `theme-contrast.spec`), 18 values in build.md |
| AC-7 | Title ≥ 3:1 on all 9 colours and both variants where it is large text; ≥ 4.5:1 where it is not (sm 1.125 rem and md 1.25 rem are large only if bold ≥ 18.66 px; the designer measures per size) | same |
| AC-8 | Badges, buttons and links in the hero keep their 3.37 values (≥ 4.85:1); the focus ring keeps ≥ 3:1 (min 4.23) | *Badges in the Body* measurement, ring measurement |
| AC-9 | Each band stays recognisable as its colour (hue and lighter-to-darker direction kept); the change per colour is listed in design.md | screenshots at 360, 1024, 1280, L·D |
| AC-10 | Geometry unchanged for `fill`, `slim`, sizes, media and radius (Δ 0 in measured heights and positions); the fix is CSS only, so it holds in prerendered HTML before JavaScript | `--measure`, compat check |
| AC-11 | `forced-colors` and `prefers-reduced-motion` stories unchanged; axe `color-contrast` on the hero stories has 0 violations (the measured values replace "incomplete" where axe cannot resolve a gradient) | axe in Chromium |
| AC-12 | CHANGELOG answers both 3.37.0 *Known* lines under Fixed, with before/after values and the bands whose look changed | release check |

Always covered: 360 px and desktop, light and dark, keyboard and screen reader (AC-2, 4), EN and DE (AC-5), prerendered HTML (AC-10), unchanged defaults apart from the stated hero colours (AC-3, 9, 10).

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break, no new input. Tokens, except where the hero already uses literals (document each).
- Prefer a fix without JavaScript (darker end stops, or a CSS scrim behind the text). The designer chooses the means.

## Assumptions

- Assumption: darkening the failing bands (or a CSS scrim) needs no owner decision, because a measured WCAG 2.2 AA failure is at least should-fix (owner rule 2026-11-02). The designer keeps the hue and picks the least visible fix; if every option moves a band beyond a shade step, the designer says so in design.md and the dispatcher takes it to the owner.
- Assumption: the card fix is whitespace in the DOM (as D-4 did for the description list), not a new input.
- Assumption: the `light` variant is measured too; if it passes it stays untouched.
- Assumption: no BACKLOG row exists for `lc-card`; 057-n6 (hero) is a story label and not folded in.

## Open questions

None.
