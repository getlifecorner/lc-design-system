# Build 014: lc-header avatar trigger — label in name (WCAG 2.5.3)

- **Branch:** `fix/3.11.4-avatar-trigger-label-in-name` (from `main` `9300d71`, 3.11.3)
- **Commit:** branch tip, `fix(header): name the avatar trigger with the initials it shows` (amended with the devDependency; `libs` and `tools` unchanged since `f02d352`)
- **Resume (owner, 1: a):** the owner installed `axe-core` 4.14.0; the axe spec, `story-shots --axe` and the full Jest suite ran on it (below).

## Files changed

| File | Change |
|---|---|
| `avatar/avatar.component.ts` | `ɵavatarInitials(name)` (algorithm moved verbatim, exported via the entry's `export *`, not in the docs); `initials` calls it |
| `header/header.component.ts` | `avatarTriggerAriaLabel` (`computed`, design §2); JSDoc `userMenuAriaLabel` (§2 text, `@default`), `userMenuTrigger` (+ `@default 'icon'`) |
| `header/header.component.html` | avatar trigger `[attr.aria-label]="avatarTriggerAriaLabel()"`; `[decorative]="true"` on `bars-3`, `sun`/`moon`, `user`, `chevron-down` |
| `menu/menu.component.html` | `[decorative]="true"` on the item icon (link and button items) |
| `header/header.stories.ts` | new *Avatar Trigger Names* (§8, 7 rows); argTypes `userMenuTrigger`, `userMenuAriaLabel`; docs text; *App Shell on a Phone* description |
| `header/header.app-shell.spec.ts` | `:59` expects `Menü für ${longName}, JA` (AC-10; the only changed assertion) |
| `header/header.trigger-name.spec.ts` | new, 31 tests: §4 rows × both triggers, photo / broken photo, icon trigger pinned, decorative icons |
| `header/header.axe.spec.ts` | new, 22 tests on axe-core 4.14 (§9 Jest layer) incl. the negative control |
| `avatar/avatar.initials.spec.ts` | new, 16 tests: `ɵavatarInitials` = what the avatar renders |
| `menu/menu.icons.spec.ts` | new, 1 test: item icons `aria-hidden`, no role |
| `tools/agents/story-shots.mjs` | `--axe[=<tags>]` (§9 browser layer), documented in the header comment |
| `tools/compat/check-angular-majors.mjs` | `EXPECT_IN_HTML` `tt: avatar trigger named with its initials (AS-33)` |
| `package.json`, `package-lock.json` | `axe-core ~4.14.0` devDependency (4.14.0, MPL-2.0; installed by the owner); no change to `libs/angular-ui-kit/package.json` |

## Acceptance criteria

| AC | Covered by |
|---|---|
| AC-1 | trigger-name spec (attribute) and axe spec (`axe.commons.text.accessibleText`): `Menu for Johanna Müller, JM` |
| AC-2 | axe spec: `pass` per row; negative control (bare label put back in the DOM) → `label-content-name-mismatch` on the trigger. Browser: axe 4.14.0 passes the rule on the 3 avatar stories (below) |
| AC-3 | both specs: EN, DE, long DE, one word (`J`, incomplete), no name (`Open user menu` / `Benutzermenü öffnen`, nothing appended); new story |
| AC-4 | photo: `Menü für Tom Ek, TE`, rule inapplicable; broken photo (`error`): `TE` shows, same name, pass |
| AC-5 | audit below |
| AC-6 | axe spec (both triggers, EN/DE, menu open), 22 / 22 on 4.14.0; `story-shots --axe`: 24 runs, 0 violations (below) |
| AC-7 | spec: the person's name once; avatar `aria-hidden="true"`, no role |
| AC-8 | `JM` is a word of the name (spec); new story: every trigger 48 × 48; 200 % and icon boxes unchanged (pixel-identical shots) |
| AC-9 | icon trigger pinned (spec); 132-shot compare; compat `--only=22` |
| AC-10 | only `header.app-shell.spec.ts:59`; `header.public-site.spec.ts` pins the icon trigger, unchanged |
| AC-11 | JSDoc, argTypes, docs text, story descriptions; changelog draft |

**AC-5 audit** (grep `<lc-avatar` and `aria-hidden="true"` / `[decorative]="true"` with text, `src/lib/**/*.html`, multi-line): `lc-header` avatar trigger → **fixed**. `lc-stepper` indicator → unaffected (number is a word of the name; fails 4.14 for other text, follow-up). Menu header avatar, `lc-avatar-group` → not decorative, in no control. `lc-breadcrumbs` ellipsis/separator, `lc-password-input` requirement icon → `aria-hidden` text in no control. `[decorative]` `lc-icon`s → no text.

## Gates

Ran on the working tree committed as the branch tip; logs in `tmp/014/`.

| Gate | Result |
|---|---|
| `npx nx run angular-ui-kit:test` | on axe-core 4.14.0: **169 suites, 4207 passed, 8 skipped** (baseline 165 / 4137 + 70 new); `header.axe.spec.ts` alone 22 / 22 (`tmp/014/test-axe.log`) |
| `npx nx run angular-ui-kit:lint` | 0 errors, 162 warnings (= baseline) |
| `npx nx run angular-ui-kit:build` | green, 119 entries |
| `npm run test:tools` | 22 / 22 |
| `npx nx run angular-ui-kit:build-storybook` | green |
| Story shots | `tmp/story-shots/014/after/` (`--full`, 3 widths × 2 themes, `--compare=…/baseline`): 126 identical, 6 different = `components-chat--user-avatar` only; pixel diff at 360 light: rows 117–127, 147–157, 271–281, x 264–330 = the three `.lc-chat__time` boxes (story times relative to `now`). New story: `tmp/story-shots/014/new/` (6), names per §4, all 48 × 48; opened 360 light, 1280 dark |
| axe 4.14.0 in the browser | CDN copy via `--measure` (as the design baseline), menu opened: `tmp/story-shots/014/axe-cdn/`, 6 stories × 360/1280 × light/dark = 24 runs, **0 violations** (before, `tmp/014/axe-before.log`: all 20 runs of the 5 existing stories had violations). Rule: pass on app-shell-phone/-desktop, signed-in-large-text; new story 4 pass, 2 incomplete (`J`, `?`). Incompletes unchanged from the baseline (`aria-valid-attr-value` with the menu open, `bypass`, `color-contrast`) |
| `story-shots --axe` (devDependency) | same 6 stories × 360/1280 × light/dark, `--measure` opens the menu: `tmp/story-shots/014/axe/`, log `tmp/014/axe-run.log`: `{"axe":{"shots":24,"violations":0}}`, version 4.14.0 in all 24, menu open in all 24; same incompletes as the CDN run (`label-content-name-mismatch:2` only on the new story, `J` and `?`) |
| `check-angular-majors.mjs --only=22` | PASS, 63 HTML checks incl. the new AS-33 one; `check-trusted-types.mjs` 194 / 194 |

## Deviations from the design

- None in the code. The jsdom layer needs a fake 2D canvas for axe's icon-ligature check (jsdom has none; without it the rule errors into `incomplete`); documented in the spec.

## Changelog draft

```markdown
## [3.11.4] - 2026-10-23

The avatar account button is named with the initials it shows (AS-33; life-os app shell, axe-core 4.14). No API breaks.

### Fixed

- **`lc-header` `userMenuTrigger="avatar"`: the button's name contains its initials** (AS-33, WCAG 2.5.3 Label in Name): it is named `userMenuAriaLabel`, a comma and the initials the avatar shows, "Menü für Johanna Müller, JM" / "Menu for Johanna Müller, JM" (was "Menü für Johanna Müller", which axe-core 4.14 fails as `label-content-name-mismatch`, now under `wcag21a`). Voice-control users can say "JM"; screen readers announce the person's name once, purpose first. Nothing is appended for the "?" of a missing name or when the label already holds the initials as a word ("Menu for Al Lee"); an empty label gives the initials alone. The name is the same with a photo, loaded or broken, and is in the prerendered HTML.
- **Header and menu icons are decorative** (`svg-img-alt`, WCAG 1.1.1): the hamburger, theme, user and chevron icons of `lc-header` and the item icons of `lc-menu` are `aria-hidden` instead of unnamed `<svg role="img">`.
- axe-core 4.14.0 on the header stories (both triggers, EN and DE, menu open, light and dark, 360 and 1280 px): 0 violations in 24 runs; the kit's tests now run axe-core 4.14 on the header.

### Compatibility

- No API breaks: same inputs, outputs and exports; only the avatar trigger's `aria-label` and the icons' ARIA attributes change, and 126 of 132 header, app-shell, avatar, list and chat screenshots are identical (the other 6 differ in the chat story's clock times). The icon trigger's name is unchanged. Queries on the start of the name keep matching (`/^Menü für/`, `startsWith('Menu for ')`); exact-name checks need `, <initials>`.
- Still failing axe-core 4.14's `label-content-name-mismatch` (follow-up): `lc-header`'s context button, `lc-stepper` steps, `lc-pagination` with localised labels, `lc-calendar` week columns, the `lc-rich-text-editor` toolbar, `lc-gallery` items, `lc-accordion` rich headers, the `lc-file-upload` drop zone. None holds an `lc-avatar`; life-os uses none of them.

### Migration

- life-os: lift the `@axe-core/playwright` 4.14 hold with this bump; update exact-name assertions (`shell.de.spec.ts:420`) to `…, <initials>`.
```
