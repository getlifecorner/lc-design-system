# Build 020: app-shell prove gaps (rows 1–7)

- **Branch:** `feat/3.15-app-shell-prove-gaps`, one commit `feat(app-shell,page-header,empty-state,avatar,button,sidenav): line state pages up with the header, primary empty state, person avatar, outline tone, ancestor sidenav hooks`

## Files changed

| File | Change |
|---|---|
| `app-shell/app-page.component.{ts,scss}` | `paddingX` (`AppPagePaddingX`), `paddingTop` (`AppPagePaddingTop`); `.lc-app-page--pad-x-header` / `--pad-top-*` at (0,2,0) behind the hooks; JSDoc lists the 4 hooks + per-breakpoint route |
| `page-header/page-header.component.{ts,scss}` | `paddingTop` (`PageHeaderPaddingTop`), `.lc-page-header--pad-top-{none,sm,md}` (top only) |
| `empty-state/empty-state.component.{ts,html,scss}` | `iconTone` (`EmptyStateIconTone`), `messageSize` (`EmptyStateMessageSize`); circle in the same `@if` chain, so the default DOM is unchanged |
| `avatar/avatar.component.{ts,html,scss}` | `fallback` (`AvatarFallback`), inline `ICON_USER_SOLID` svg, `.lc-avatar--person`, forced-colors border |
| `header/header.component.{ts,html}` | `userAvatarFallback`, passed to both avatars |
| `button/button.component.{ts,html,scss}`, `button-link.component.ts` | `tone` (`ButtonTone`) → `btn-tone-primary` on outline only |
| `sidenav/_sidenav-docked.scss`, `sidenav.component.scss`, `sidenav-placeholder.component.scss` | defaults in `--_lc-sidenav-t-*`; no `:host` declares a public hook; every read `var(--lc-sidenav-X, var(--_lc-sidenav-t-X))` |
| docs | sidenav + placeholder JSDoc and story docs, `getting-started.mdx` (element or ancestor; `isOpen`/`mode`), app-shell and page-header story docs |
| specs (new) | `app-page.padding`, `page-header.padding-top`, `empty-state.tone`, `avatar.fallback`, `header.avatar-fallback`, `button.tone`, `sidenav.ancestor-hooks`; `theme-contrast.spec.ts` describe "3.15 (020)" |
| stories | the 11 of design §8 (ids exact); argTypes for the 9 inputs |
| `tools/compat` | `probe-315.ts` on the home page, 5 `EXPECT_IN_HTML` checks |

**Changed assertions (AC-15, each with the comment "020: hooks are no longer declared on `:host` …"):** `sidenav.app-shell.spec.ts` l. 91–92 and `sidenav.brand.spec.ts` l. 228, 293–296 (design list), plus `sidenav-placeholder.component.spec.ts` l. 190 (missing from the design's list): the fill now reads `var(--lc-sidenav-fg, var(--_lc-sidenav-t-fg))`, because the host no longer declares `--lc-sidenav-fg`. Each asserts the same default colour one level deeper, and adds that the host does not declare the hook.

## Acceptance criteria

| AC | Covered by (measured: 360 / 1024 / 1280, light and dark) |
|---|---|
| AC-1 | spec (JSDoc hooks, route); *Page Padding Per Breakpoint* main padding-left 16 / 32 / 32; *State Page Aligned* 16 / 24 / 24 |
| AC-2 | *State Page Aligned*: header title x = h1 x: 16 = 16, 24 = 24, 24 = 24 |
| AC-3 | spec: steps 24/32/48/56/72/96 (top …/112), default class `lc-app-page`; the 14 app-shell stories: 84 / 84 shots identical (26 re-shot `--full`, as their baselines) |
| AC-4, AC-5 | specs; h1.top − header.bottom = 16 (h1 y 80) at all widths; *Padding Top* top 40 / 0 / 8 / 16, bottom 40; *State Page Loading*: skeleton y 80 = h1 y 80 |
| AC-6 | spec (default classes, density padding); 17 page-header stories + breadcrumbs *In Page Header*: 72 / 72 identical (4 `--full`) |
| AC-7, AC-8 | spec; circle 48 × 48, bg rgb(224,241,244) / rgb(13,53,61), svg 24 × 24, colour rgb(20,79,91) / rgb(193,227,233); `theme-contrast.spec.ts` 7.85 / 9.68 |
| AC-9 | *State Page* and *State Page Aligned*: message 16 / 24 px, circle → text 16, text → action 24, heading 20 / 25 px, heading → message 8; 7 empty-state stories: 28 / 28 identical |
| AC-10, AC-11 | `avatar.fallback.spec`, `header.avatar-fallback.spec`; *Person Fallback*: role img, label "Avatar", name → "RB", member-1 neutral, broken src → person, decorative → no role |
| AC-12 | contrast spec 7.00 / 6.10; forced-colors CSS spec; disc rgb(209,213,219) / rgb(75,85,99), glyph rgb(55,65,81) / rgb(229,231,235), 60 % (14.4 … 38.4 px) |
| AC-13 | `button.tone.spec`; contrast spec (active 6.71 / 6.71); text rgb(20,79,91) / rgb(193,227,233), border rgb(26,106,121) / rgb(163,213,223); `variant="primary"` ignores it; 35 button / button-link stories: 140 / 140 identical |
| AC-14 | `sidenav.ancestor-hooks.spec`; *Hooks On An Ancestor*: `.lc-sidenav` bg rgb(13,53,61) in 36 of 36 ancestor cases, rgb(26,106,121) in 12 of 12 override cases |
| AC-15 | docs above; specs changed only as listed; 26 sidenav + placeholder stories: 152 / 156 identical (13 `--full`), 4 known flakes (1 px scrollbar thumb, x 1279, in *Sidebar First Collapsed* / *Prominent Brand* 1024 / 1280 light; Δ ≤ 4 at the active item of *Sidebar First Layout* 1024 dark; they flip between runs) |
| AC-16 | DE at 360: scrollWidth = viewport in all 11 new stories; 0 `[tabindex]`; tab order "Benutzermenü" → "Abmelden"; trigger ring 2 px solid rgb(32,132,151) / rgb(132,199,212) |
| AC-17, AC-18 | compat 22: the 5 new checks (7 classes + the person svg in the trigger and alone) pass; gates below; manifest extractor: 9/9 inputs with `@default` (temporary node test, removed) |

## Gates

Jest, lint, build, `test:tools` and Storybook ran on `1195039d68316497aac04dfe7ce10e356b57b809` (later agents skip a gate while `git diff --quiet 1195039 -- libs tools` holds). Compat and the shots ran on the same package; the only later change, `sidenav-placeholder.stories.ts` (150 px columns), was in the Storybook build the shots used and is not in the package.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | 192 suites, 4493 passed, 8 skipped (was 185 / 4412); run with `--maxWorkers=4`, the default worker count hit the known worker SIGSEGV twice |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (baseline) |
| `npx nx run angular-ui-kit:build` | 121 entries built |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | 931 stories (920 + 11) |
| Story screenshots | new: `tmp/story-shots/020/new` (66 shots, `tmp/020/shots-*.log`). Compare against the designer's baseline (`tmp/story-shots/020/cmp`, `cmp-full`, `tmp/020/compare-*.log`): 138 unchanged stories, 676 shots, 671 identical (43 re-shot `--full`), 5 known noise (4 above, plus *Avatar Group With Images* 360 light: 34 px with Δ ≤ 3 inside the photos, both runs; 360 dark and 1280 identical), 0 real differences. Header 22 stories 132 / 132, avatar + group 16 stories 63 / 64 |
| `check-angular-majors.mjs --only=22` | PASS, 79 / 79 HTML checks (74 + 5) |

## Deviations from the design

None. Notes: (1) `messageSize="md"` also sets `gap: 8px`, so the 16 / 24 spacing of §3 holds for `size="sm"` too (the md/lg gap is already 8). (2) *Padding Top*: the `md` frame follows the `paddingTop` control (default `md`), so the arg does something. (3) *Hooks On An Ancestor* columns are 150 px, so a pair fits 360 px; "Einstellungen" truncates with an ellipsis there. (4) §3 shows 72 px from the h1 to the circle at 1024; measured 112 (page-header bottom 40 + app-page gap 40 + empty-state padding 32; 96 at 360). No AC measures it. (5) The DE message takes 2 lines at 360, not 3 (§7).

## Changelog draft

```markdown
## [3.15.0] - 2026-10-30

State pages ("no role yet", "sign-in failed") line up with the header without local CSS: `lc-app-page` takes the header's padding and a set top spacing, `lc-empty-state` gets a primary icon and a larger message, `lc-avatar` a person fallback, outline buttons a primary tone, and `--lc-sidenav-*` hooks work when set on a layout wrapper (finance-intelligence app-shell prove, rows 1–7, docs/ux/gaps/app-shell-prove-2026-10-30.md). No API breaks.

### Added

- **`lc-app-page paddingX`** (`'default'` | `'header'`, default `'default'`, row 1): `'header'` uses `lc-header`'s padding, so the page title starts where the header title does (x 16 / 24 / 24 at 360 / 1024 / 1280). The hooks `--lc-app-page-padding-x`, `--lc-app-page-padding-top`, `--lc-app-page-gap` and `--lc-app-page-aside-width` are documented with their defaults; set your own per-breakpoint values in a media query (a fixed 16 / 32 px does not line up with the header's 24 px).
- **`paddingTop` on `lc-app-page` and `lc-page-header`** (`'default'` | `'none'` | `'sm'` | `'md'`, default `'default'`, row 2): `lc-app-page paddingTop="md"` with `lc-page-header paddingTop="none"` puts the h1 16 px below the header (y 80) at every width; a skeleton in the breadcrumbs slot starts at the same y.
- **`lc-empty-state iconTone`** (`'neutral'` | `'primary'`, row 3): a 48 px primary circle with a 24 px icon, 7.85 / 9.68:1 (light / dark). **`messageSize`** (`'sm'` | `'md'`, row 4): the message at 16 / 24 px, 16 px below the icon and 24 px above the action.
- **`lc-avatar fallback`** (`'initials'` | `'person'`, row 5) and **`lc-header userAvatarFallback`**: without a name, or when the image fails, a person glyph on the neutral disc at 60 % of the size, 7.00 / 6.10:1, still named "Avatar" unless decorative. A name still shows its initials.
- **`tone` on `lc-button` and `a[lcButton]`** (`'neutral'` | `'primary'`, default `'neutral'`, outline only, row 6): primary text ≥ 7.86:1 on the page and the land tints, border ≥ 5.34:1, hover 7.85 / 10.57:1, pressed 6.71 / 6.71:1. Other variants ignore it.
- Stories: Layout/App Shell "State Page Aligned", "State Page Loading", "Page Padding Per Breakpoint"; Layout/Page Header "Padding Top"; Feedback/Empty State "Primary Tone", "State Page"; Data Display/Avatar "Person Fallback"; Navigation/Header "Avatar Person Fallback"; Components/Button and Button Link "Outline Primary Tone"; Navigation/Sidenav Placeholder "Hooks On An Ancestor".

### Fixed

- **`--lc-sidenav-*` hooks set on an ancestor reach `lc-sidenav` and `lc-sidenav-placeholder`** (row 7). The host declared its own defaults, so a value on the layout wrapper was ignored. Now `--lc-sidenav-bg: var(--color-primary-fill-active)` on a wrapper gives #0d353d with `theme` dark, light and auto, for both components; a value on the element still wins (#1a6a79), and both win over `theme`. Without hooks the colours are unchanged.

### Compatibility

- No API breaks: every new input is optional and renders as before (Jest pins the default DOM). 676 screenshots of 138 unchanged shell, header, page-header, empty-state, avatar, button and sidenav stories are identical apart from known noise.
- `--lc-sidenav-*` rules an app set on an ancestor before, which had no effect, now apply: check such rules.
- For a rail colour use the theme-stable `--color-primary-fill*` and `--color-on-primary`: the `--color-primary-100…900` scale inverts in dark.
- Consumer check (AOT, strictTemplates, prerender) passes on Angular 22.

### Known

- The default (neutral) outline button's hover in dark is white on #a3d5df, 1.60:1 (pre-existing, unchanged here).
```
