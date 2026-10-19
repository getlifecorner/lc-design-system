# Spec 006: F1 shell review gaps (LK-12, AS-25, AS-26, AS-27, AS-29)

**Change log:**
- 2026-10-19: Q1 resolved by owner — AS-22 closes with no kit change (current `lc-avatar` `color="default"` grey disc accepted; boards redrawn to build)

- **Status:** ready
- **Type:** extension of `lc-app-shell`, `lc-page-header`, `lc-button` / `button-link`, `lc-skeleton`, and global horizon styles
- **Affected:** `lc-app-shell`, `_horizon.scss`, `horizon.spec.ts`, `page-header.component.{ts,scss}`, `button-link.component.{ts,scss}`, `skeleton.component.{ts,scss,html}`
- **Semver impact:** minor — new optional inputs, slot, and changed defaults (non-breaking: existing usages render exactly as before)

## Need

**LK-12 (life-os T367, app shell):** The horizon's wide-screen land defaults (100 · 120 · 140 · 184 px at 1024 · 1280 · 1440 · 1920 px) are taller than needed for pages without footers. The app currently overrides `--lc-horizon-land` in four media queries on every page that has no footer. The kit should provide slimmer defaults (72 · 80 · 96 · 128 px) that match the design, and automatically grow the land by the footer's height when `lc-app-shell` carries a footer, so pages need no overrides.

**AS-29 (life-os T365, app shell):** The app-shell's horizon (`<div class="lc-app-shell__horizon lc-horizon"></div>`) renders with no content slot, so pages cannot place Edu's character poses (G-4, shipped in 3.8.0) on the shell's horizon. Nine of twelve "moments" in the UX concept show Edu on the shell's horizon, not inside page content. The shell needs a figure slot.

**AS-25 (life-os static error page 6.9, found in T363 build):** The bilingual error page needs a 20 px title size for the English `level=2` heading under the German 32 px `<h1>`. `lc-page-header` has `compact` (18 px) and `default` (24 px) but nothing between. The app works around this by setting `--font-size-lg` to `--font-size-xl` on the English wrapper (labelled `interim: DS gap AS-25`).

**AS-26 (life-os account-settings/sign-in, ux-reviewer re-check T362(4), T363(1)):** Link buttons need to sit flush with the content edge (padding-inline: 0) while keeping their 44 px height. `a[lcButton] variant="link" size="lg"` keeps 24 px inline padding with no input or custom property to drop it. The app works around this by setting `padding-inline: 0` directly, and in one case reaches into the kit's inner `.btn` through `::ng-deep` (labelled `interim: DS gap AS-26`).

**AS-27 (life-os today/app shell, T358 skeleton, owner 2026-10-18):** Tile skeletons need height that follows container width (88 px across, 59 px when stacked below 21.5rem list width). `lc-skeleton` `height` input applies only as an inline style on the inner fill, so a width-dependent placeholder can't follow the real tiles. The app works around this by setting `height="100%"` on the component and carrying the height on the host via container query (labelled `interim: DS gap – lc-skeleton has no width-dependent height`).

## What the kit has today

**Horizon defaults:** `_horizon.scss` sets `--_lc-horizon-land` to 112 px (phone), then 100 · 120 · 140 · 184 px in media queries from 1024 · 1280 · 1440 · 1920 px. The custom property `--lc-horizon-land` overrides these defaults. The sun radius defaults are 58 · 70 · 90 · 120 · 166 px.

**App-shell horizon:** `app-shell.component.html` line 5–7 renders `<div class="lc-app-shell__horizon lc-horizon"></div>` when `horizon()` is true. No slot inside the horizon.

**Character poses:** 3.8.0 shipped Edu's poses as static `<img>` assets in `assets/characters/edu/` with documented CSS through `.lc-horizon__figure` (G-4).

**Page-header sizes:** `PageHeaderSize` type exports `'compact' | 'default' | 'comfortable' | 'title' | 'display' | 'auth'`. Compact is 18 px, default 24 px. No 20 px size between them.

**Link button padding:** `button-link.component.scss` applies `.btn-lg` padding (24 px inline from `--spacing-6`) to `variant="link"` buttons. No input or custom property to override it.

**Skeleton height:** `skeleton.component.ts` has `height` input (CSS value string). The template applies `height` as an inline style on the inner `<div class="lc-skeleton__fill">`, not on the host. No custom property for height.

These components cover most needs but lack: slimmer horizon defaults, footer auto-grow, horizon figure slot, a 20 px page-header size, flush link buttons, and container-responsive skeleton height.

## Scope

- In:
  - **LK-12, AS-29:** Change `.lc-horizon` default land heights to 72 · 80 · 96 · 128 px at 1024 · 1280 · 1440 · 1920 px (phone 112 px and sun radii unchanged)
  - **LK-12:** Auto-grow `lc-app-shell`'s horizon land by the footer's height when a `[shell-footer]` is projected
  - **AS-29:** Add `ng-content` slot inside the shell's horizon for `[shell-horizon-figure]`
  - **AS-25:** Add a 20 px title size to `lc-page-header` (between `compact` 18 px and `default` 24 px), e.g. `size="medium"` or similar
  - **AS-26:** Add a way to make link buttons flush (padding-inline: 0) while keeping 44 px height, e.g. `flush` input or `--lc-btn-padding-inline` custom property
  - **AS-27:** Let `lc-skeleton` height follow its container, either by taking `height="100%"` and applying it to the host, or via a `--lc-skeleton-height` custom property
  - Update `horizon.spec.ts`, component specs, and Storybook stories for all changes

- Not in (non-goals):
  - Phone land default stays 112 px (only wide screens change)
  - No `horizonFigure` input on the shell (a slot is simpler and keeps character images out of the shell's JavaScript)
  - No change to sun radius defaults or sun position
  - AS-22, AS-23, AS-24, HS-6 (accepted: boards redrawn to match current kit behavior)
  - SI-14 (resolved: use existing `lc-icon` `size="xs" variant="outline"`)
  - AS-28 (sidenav-placeholder optimization deferred: app's bundle is under budget until T331)

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| **AC-1** | `.lc-horizon` default land is 112 px (phone), 72 px from 1024, 80 px from 1280, 96 px from 1440, 128 px from 1920 | `horizon.spec.ts` reads compiled CSS at each breakpoint |
| **AC-2** | Sun radius defaults unchanged: 58 · 70 · 90 · 120 · 166 px | `horizon.spec.ts` assertion unchanged from 3.8.0 |
| **AC-3** | `--lc-horizon-land` custom property still overrides the default at every width | `horizon.spec.ts` + Storybook control |
| **AC-4** | `lc-app-shell` with `[shell-footer]` grows the horizon land by the footer's height automatically | Storybook story at 360, 1024, 1280 px: footer height + land = total horizon land |
| **AC-5** | `lc-app-shell` without footer uses the default land (no auto-grow) | Storybook story + browser measurement |
| **AC-6** | `<ng-content select="[shell-horizon-figure]">` inside the shell's `.lc-horizon`, so projected figure is a direct child of `.lc-horizon` | `app-shell.component.html` + prerendered HTML |
| **AC-7** | A character pose projected as `<img shell-horizon-figure>` renders correctly with `.lc-horizon__figure` positioning | Storybook story with Edu pose at 360, 1024, 1280 px |
| **AC-8** | Existing pages that set `--lc-horizon-land` render exactly as before (unchanged defaults) | Unit test with custom property override |
| **AC-9** | `lc-page-header` has a new size (e.g. `size="medium"`) that renders a 20 px title | Unit test + Storybook story at 360, 1024 px |
| **AC-10** | The new page-header size works with all levels (1–6), with/without subtitle, in EN and DE | Storybook story + measurement |
| **AC-11** | Existing `lc-page-header` without the new size renders exactly as before (no API break) | Unit test asserts default size unchanged |
| **AC-12** | Link buttons (`a[lcButton] variant="link"` or `lc-button variant="link"`) can be flush (padding-inline: 0) while keeping 44 px height | Storybook story at 360 px: button width = text width, height ≥ 44 px |
| **AC-13** | Flush link button maintains focus ring, hover state, and 44 px touch target | Storybook + keyboard/pointer interaction at 360 px |
| **AC-14** | Non-flush link buttons render exactly as before (24 px padding, 44 px height) | Unit test asserts default padding unchanged |
| **AC-15** | `lc-skeleton` with `height="100%"` or via custom property follows its container height (through host styling or CSS property) | Storybook story + container query: skeleton height changes with container |
| **AC-16** | Skeleton height mechanism works for all shapes (`line`, `circle`, `rect`) | Unit test + Storybook at 360, 1024 px |
| **AC-17** | Existing `lc-skeleton` with explicit `height` input renders exactly as before | Unit test asserts behavior unchanged when height is set |
| **AC-18** | All changes work at 360, 1024, 1280 px in light and dark themes | Visual review in Storybook |
| **AC-19** | All changes work with keyboard, screen reader, `forced-colors`, `prefers-reduced-motion` | Accessibility review + visual check |
| **AC-20** | Prerendered HTML (before JavaScript runs) has correct structure for all changes | Static Storybook build inspection |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency.
- No API break: existing pages using `--lc-horizon-land` render exactly as before (AC-8).
- The shell's `horizon` input default remains `true` (no change to existing behavior for pages without explicit `[horizon]="false"`).

## Assumptions

- Assumption: The auto-grow for footer height can be achieved with CSS alone (e.g., container-relative height or flex layout), avoiding JavaScript measurement and change detection overhead.
- Assumption: The figure slot accepts any content (`[shell-horizon-figure]`), not just `<img>` tags, so pages can project SVG or other decorative elements if needed.
- Assumption: The new horizon land defaults (72 · 80 · 96 · 128 px) match the consuming app's design measurements; no further adjustment needed after this change.
- Assumption: The 20 px page-header title size is needed only at the stated size, not responsive across breakpoints (the bilingual error page uses it at all widths).
- Assumption: Flush link buttons are needed only for `variant="link"`, not other button variants (the gap register shows only link button cases).
- Assumption: Container-responsive skeleton height is an opt-in (via `height="100%"` or custom property), not automatic behavior (existing skeletons with explicit heights must not change).

## Open questions

**Q1 (AS-22, neutral avatar) — RESOLVED 2026-10-19:** The gap register decision says "the kit's grey disc (initials stay readable); boards to be redrawn to the build unless the owner wants the outline." Does the owner want an outlined neutral avatar variant?
- ~~**Option A (recommended):** Accept the current filled grey disc. Boards are redrawn to match the build. No kit change for AS-22.~~
- ~~**Option B:** Add `lc-avatar` `variant="outline"` or `color="neutral"` that renders a white disc with a link-colored ring and initials (as originally drawn). This would be a minor enhancement in a follow-up request.~~
- **Owner decision:** Option A. Keep the filled grey disc (`lc-avatar` `color="default"`). Boards are redrawn to the build. No kit change for AS-22.

## Gaps closing with no kit change

The following gaps from the request close without kit changes, per explicit acceptance in the gap register's decision column:

**SI-14 (sign-in, passkey icon):** Proposal asked for the passkey key icon to match the drawn size (16 px outline). Decision: "`size="xs"` outline where the icon is ours; otherwise accepted" (app-shell.md line 847). Resolution: `lc-icon` already has `size="xs"` (16 px) and `variant="outline"`. Use `<lc-icon name="key" size="xs" variant="outline" />`. No kit change needed.

**AS-22 (app shell, neutral avatar):** Proposal drew a white disc with link-colored ring and initials for people without a member colour. Decision: "the kit's grey disc (initials stay readable); boards to be redrawn to the build unless the owner wants the outline" (line 843). The current `lc-avatar` `color="default"` (filled grey disc with readable initials) is accepted. **Owner confirmed 2026-10-19:** Keep the filled grey disc; boards are redrawn to the build. No kit change needed.

**AS-23 (app shell, footer links):** Proposal drew small (14–16 px), regular-weight, underlined legal links in `--color-text-secondary`. Decision: "the build as it is (the footer's link ink is 5.50:1 on the land); boards to be redrawn" (line 844). The current projected `a[lcButton] variant="link" size="lg"` (bold, 18 px) meets contrast requirements and is accepted. No kit change needed.

**AS-24 (app shell, compact alert):** Proposal requested 16 px vertical padding for one-line notices (~52 px total height). Decision: "accepted: the notice is taller than drawn; boards drawn to the build" (line 845). The current `lc-alert` with 24 px vertical padding is accepted. No kit change needed.

**HS-6 (household-setup, description list):** Proposal requested no inline-start indent on `dd` values in stacked layout. Decision: "the build as it is (the value is indented); boards drawn to the build" (line 846). The current `lc-description-list` stacked layout with ~38 px indent is accepted. No kit change needed.

**AS-28 (app shell, sidenav-placeholder bundle):** Proposal requested measuring the gzip share of `lc-sidenav-placeholder` in the initial chunk, and if worthwhile, a lighter static placeholder. Decision: "the kit's placeholder as it is; the app's budget is 180 kB until T331 is met" (line 851). The current `lc-sidenav-placeholder` (imports `Router` and `internal/navigation` helpers, about 9 kB gzip) is accepted because the app's initial chunk is under budget. Optimization deferred until T331 requires it. No kit change needed now.
