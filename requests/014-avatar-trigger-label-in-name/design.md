# Design 014: lc-header avatar trigger — label in name (WCAG 2.5.3) and the kit's axe check

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-11
- **Measured on:** `main` 9300d71 (3.11.3), static Storybook, axe-core **4.14.0** (jsdelivr) injected through `story-shots --measure`.

## 1. Approach

Extend `lc-header`; no new input. What axe 4.14.0 reports today (tags `wcag2a`…`wcag22aa`, 360 and 1280, light and dark, all identical per story):

| Story | Trigger | Violations |
|---|---|---|
| `navigation-header--app-shell-desktop` ("Menü für Tom Ek", shows TE) | avatar | `label-content-name-mismatch` |
| `navigation-header--signed-in-large-text` ("Menu for Sarah Miller", SM) | avatar | `label-content-name-mismatch` |
| `navigation-header--app-shell-phone` (long DE name, JA; `play` opens the menu) | avatar | `label-content-name-mismatch`, `svg-img-alt` (the 2 menu item icons) |
| `navigation-header--default`, `--translated-labels` | icon | `svg-img-alt` (hamburger, theme, user, chevron icons) |

**How 4.14 decides** (read from `axe.js` 4.14.0, `isLabelContainedInName`): visible text and name are NFKD-normalised, **parentheticals are removed**, every non-letter/digit becomes a space, words are split with `Intl.Segmenter`; the rule passes when the visible words are a contiguous word run of the name. Visible text of one non-digit character ("J", "?") is never decided (`incomplete`). Prototypes on the TE trigger: `Menü für Tom Ek, TE` pass · `TE, Menü für Tom Ek` pass · `Menü für Tom Ek (TE)` **fail**.

**Decisions**

1. **Name = `<userMenuAriaLabel>, <initials>`** ("Menü für Johanna Müller, JM"). Suffix, not prefix (WCAG's best-practice note prefers the start), because: (a) a screen-reader user hears the purpose first and the initials as the identifier the button shows, once; (b) the name still *starts with* `userMenuAriaLabel`, so consumer queries keep matching: life-os has 9 start-anchored ones (`^Menü für `, `startsWith('Menu for ')` in `cockpit-e2e` and `libs/ui/shell`) and 2 Playwright substring names (`us3-name.spec.ts`); only exact-equality checks change (`shell.de.spec.ts:420`); (c) 2.5.3 requires "contains", and axe's whole-word check passes. Separator `", "`: punctuation, no word to translate, a pause in every screen reader; brackets are out (axe drops them).
2. **One source for the initials.** Move the avatar's algorithm verbatim into `ɵavatarInitials(name)` in the avatar entry (ɵ = kit-internal, as `ɵprovideKitIcons` in the icon entry). `AvatarComponent.initials` and the header both call it, so the name always holds exactly the text the avatar renders. No `viewChild` read (the trigger sits in nested `@if` blocks; the first update pass and the server render would miss it).
3. **The name does not depend on the photo.** With `userAvatarSrc` the name keeps the initials: the server cannot know whether the photo loads, and a name that changes on load or `error` would differ between the prerendered HTML and the page, and between two visits. With a photo nothing is visible as text, so 2.5.3 does not apply (AC-4); the initials are harmless extra identification.
4. **Header icons are decorative.** The 4 `lc-icon`s inside the header's self-named buttons (hamburger `bars-3`, theme `sun`/`moon`, `user`, `chevron-down`) and the item icon in `lc-menu` (`menu.component.html:49` and `:75`; `MenuItem.label` is required, so every item has text) get `[decorative]="true"`. Today each renders `<svg role="img">` without a name. Only ARIA attributes change (`aria-hidden="true"`, no `role`); `lc-icon` re-decorates in place, nothing is refetched.
5. **The axe check has two layers** (AC-6): a Jest spec on axe-core 4.14 (runs in CI with every test run) and a `--axe` flag in `story-shots` (widths, themes, colour contrast, which jsdom cannot compute). See §9.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (doc only) | `userMenuAriaLabel` | `string` | `'Open user menu'` | "Accessible name of the account menu trigger. With `userMenuTrigger="avatar"` the button is named this text, a comma and the initials it shows (`Menü für Johanna Müller, JM`), so a voice-control user can say what they see (WCAG 2.5.3). Nothing is added when `userName` gives no initials, or when the text already contains them as a word. The name is the same with a photo. @default 'Open user menu'" |
| export (ɵ, internal) | `ɵavatarInitials` | `(name: string \| undefined) => string` | — | "The initials `lc-avatar` shows for `name`: first and last word's first letter, upper case; one word: its first letter; empty: `?`. Kit-internal (used by `lc-header`); no semver guarantee." Lives in `avatar.component.ts` (exported by the entry's `export *`). |
| protected | `avatarTriggerAriaLabel` | `Signal<string>` (`computed`) | — | Not public. Bound as `[attr.aria-label]` on the avatar trigger only. |
| devDependency | `axe-core` | `~4.14.0` | — | Root `package.json` + `package-lock.json`. Not in `libs/angular-ui-kit/package.json` (its `peerDependencies` stay as they are). |
| tool flag | `story-shots --axe[=<tags>]` | — | tags `wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa` | §9 "Browser layer". |

`userMenuTrigger` JSDoc: append "the button is named `userMenuAriaLabel`, a comma and the initials". Also add the missing `@default 'icon'`.

**Composition** (`avatarTriggerAriaLabel`):

```
initials = ɵavatarInitials(userName())                 // exactly what the avatar renders
label    = userMenuAriaLabel()
if initials has no letter or digit (/[\p{L}\p{N}]/u)   → label            // "?" placeholder: say nothing extra
words    = label without "( … )" groups, toLowerCase() (not toLocale…: server and browser must agree), split on /[^\p{L}\p{N}]+/u
if words includes initials.toLowerCase()               → label            // "Menu for Al Lee" already holds "AL"
if label.trim() is empty                               → initials         // was a nameless button before
otherwise                                              → `${label}, ${initials}`
```

**Default rendering unchanged:** the default `userMenuTrigger="icon"` keeps `aria-label="<userMenuAriaLabel>"` byte for byte. No class, style, element or box changes anywhere; the icon change is attributes only. All 22 affected stories are baselined (§8).

## 3. Anatomy and layout

No layout change. The trigger keeps its boxes (measured, `getBoundingClientRect`):

```
360 px (AppShellPhone frame)                   1280 px (AppShellDesktop)
┌──────────────────────────────────────┐       ┌───────────────────────── … ───────────┐
│ [logo] Produkt                 ( JA )│       │ [logo] Produkt · Unser Haushalt  ( TE )│
│        Familie Apfelbaum-Kie…   48×48│       │                           x 1192 48×48 │
└──────────────────────────────────────┘       └───────────────────────── … ───────────┘
 name: "Menü für Johanna-Friederike …, JA"       name: "Menü für Tom Ek, TE"
```

| Element | Box (measured) | Notes |
|---|---|---|
| Avatar trigger, 100 % text | 48 × 48 (x 311 at 360 in the AppShellPhone frame; AppShellDesktop x 1192 at 1280) | `.lc-header__profile-trigger--avatar` 3rem × 3rem |
| Avatar trigger, 200 % text | 96 × 96 (x 232 y 81 at 360; x 1136 y 0 at 1280) | AS-31 |
| Icon trigger | 70 × 44 (x 258 at 360; x 1170 at 1280) | `--size-min-touch-height` |

## 4. States

| State | Visible | Accessible name (example) | axe 4.14 `label-content-name-mismatch` |
|---|---|---|---|
| Initials, EN | JM | `Menu for Johanna Müller, JM` | pass |
| Initials, DE | JM | `Menü für Johanna Müller, JM` | pass |
| Long DE name | JA | `Menü für Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau, JA` | pass |
| One word (`Johanna`) | J | `Menü für Johanna, J` | incomplete (single letter; axe never decides it) — no violation |
| No name (`''`) | ? | `Open user menu` (unchanged, nothing appended) | incomplete ("?") — no violation |
| Photo loaded | (image) | `Menü für Tom Ek, TE` | inapplicable (no visible text) |
| Photo broken → initials | TE | `Menü für Tom Ek, TE` (same) | pass |
| Label already holds them (`Al Lee`, `Menu for Al Lee`) | AL | `Menu for Al Lee` | pass |
| Empty label (`userMenuAriaLabel=""`, `Tom Ek`) | TE | `TE` | pass (was a nameless button) |
| Menu open | same | same name; `aria-expanded="true"` | as closed |
| hover · focus-visible · active | unchanged | unchanged | — |
| disabled · loading · error | n/a (the trigger has none) | — | — |
| Overflow | Names change only the string; no visible text grows. Long names give long names, as before. | | |

## 5. Theming

No colour, token or style changes; no new token. Colour contrast stays what it is and is checked by `--axe` in light and dark (§9). Today axe reports no `color-contrast` violation on the header stories (3–4 `incomplete` on the transparent header over the story frame, unchanged).

## 6. Accessibility

- **Semantics:** `<button type="button">` with `aria-label`, `aria-expanded`, `aria-haspopup="menu"` (from `lc-menu`), unchanged. The avatar stays `aria-hidden="true"` without role (spec assumption: the fix is in the control).
- **Screen reader:** one announcement, purpose first: NVDA/JAWS "Menü für Johanna Müller, JM, Schalter, reduziert"; VoiceOver "Menü für Johanna Müller, JM, Einblendmenü-Taste". The person's name appears once (AC-7).
- **Voice control:** "Klick JM" / "Tap JM" — "JM" is a whole word of the name (AC-8).
- **Keyboard, focus, targets:** unchanged: tab stop, Enter/Space open, focus ring as today; 48 px (96 px at 200 %), icon trigger 44 px high.
- **forced-colors, reduced motion:** unchanged (no style change).
- **Icons:** the header's and the menu items' icons leave the accessibility tree (they sit in controls that are named by text or `aria-label`), which ends `svg-img-alt` (1.1.1).

## 7. Texts

No new built-in string. The only added characters are `", "` and the initials, both language-neutral.

| Input | EN | DE |
|---|---|---|
| `userMenuAriaLabel` (consumer) | `Menu for Johanna Müller` | `Menü für Johanna Müller` |
| resulting name, avatar trigger | `Menu for Johanna Müller, JM` | `Menü für Johanna Müller, JM` |
| resulting name, icon trigger | `Menu for Johanna Müller` | `Menü für Johanna Müller` |

## 8. Stories

| Story | Expected ID | Args / content | Shows |
|---|---|---|---|
| **New:** Avatar Trigger Names | `navigation-header--avatar-trigger-names` | 7 stacked headers (`variant="transparent" size="sm" [sticky]="false" userMenuTrigger="avatar" userAvatarColor="member-1"`), each under a caption in the LogoSizes caption style (`font-size: 12px; color: var(--color-text-secondary); margin: 0 24px 4px`) giving the case and the expected name: EN `Johanna Müller`; DE `Johanna Müller`; DE long name; one word `Johanna`; no name (`userName=""`, `Benutzermenü öffnen`); photo (`userAvatarSrc="/assets/lifecorner-emblem.svg"`, `Tom Ek`); broken photo (`/assets/no-such-photo.jpg`, `Tom Ek`). Description: the composition rule and that the photo does not change the name. | AC-1, 3, 4, 7 surface for review |
| Changed text only | `navigation-header--app-shell-phone` | description `named "Menü für …"` → `named "Menü für …, JA" (the initials it shows)`; `play` regex `/^Menü für/` stays valid | — |
| Changed text only | argTypes `userMenuTrigger`, `userMenuAriaLabel`; docs text at `header.stories.ts:179` | describe the composition; `userMenuAriaLabel` keeps `table.defaultValue: 'Open user menu'` | AC-11 |
| Unchanged (pixel-identical) | 13 header/app-shell + 9 avatar/list/chat stories | — | AC-9 baseline `tmp/story-shots/014/baseline` (132 shots, 360/1024/1280, light/dark, `--full`, 9300d71) |

Baseline story list: `navigation-header--{default,full-featured,translated-labels,dark-theme,app-shell-phone,app-shell-desktop,signed-in-large-text,signed-in-large-text-german}`, `layout-app-shell--{today-desktop,today-phone,content-page,signed-in-large-text,signed-in-large-text-english}`, `data-display-avatar--{with-initials,all-sizes,member-colors,with-image,team-list}`, `data-display-avatar-group--{default,member-row}`, `data-display-list--member-avatars`, `components-chat--user-avatar`.

## 9. Verification

**Jest layer** (`header/header.axe.spec.ts`, new; `import axe from 'axe-core'`):
- `audit(el)` = `axe.run(el, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'] }, rules: { 'color-contrast': { enabled: false }, 'target-size': { enabled: false } } })` — the two layout rules jsdom cannot evaluate run in the browser layer. Await every run (axe refuses parallel runs).
- Name: `axe.setup(el)`, `axe.commons.text.accessibleText(button)`, `axe.teardown()` — the computed name, not just the attribute.
- One table-driven test per §4 row (both triggers), asserting the exact name, `violations: []`, and the §4 result of `label-content-name-mismatch` (pass / incomplete / inapplicable). The broken-photo row dispatches `error` on the `<img>` and re-runs. One more row per trigger audits with the menu open (click the trigger first), so the menu item icons are covered (`svg-img-alt`).
- **Negative control (AC-2):** render the avatar trigger, set its `aria-label` back to the bare `userMenuAriaLabel` in the DOM, expect `label-content-name-mismatch` in `violations`. If jsdom cannot make it fail (visibility heuristics), say so in `build.md` and prove the failure in the browser layer on the old name instead (same `setAttribute` in `--measure` before `--axe`).
- `ɵavatarInitials`: parity test against `AvatarComponent` for `'Johanna Müller'`, one word, `''`, `'  '`, a hyphenated long name, `'Ülrich Özdemir'`.

**Browser layer** (`tools/agents/story-shots.mjs --axe[=<tags>]`): read `node_modules/axe-core/axe.min.js` once; per shot, after `--measure` (so a measure can open the menu), evaluate it and run `axe.run(document, { runOnly: { type: 'tag', values } })`; log `"axe":{"version","violations":[{"id","targets"}],"incomplete":["id:n"]}` and count violations into the exit code. Document the flag in the script's header comment. For AC-6 pass a `--measure` that opens the account menu when no `[role="menu"]` is present (click `.lc-header__profile-trigger`, wait 300 ms); `app-shell-phone`'s `play` may already have opened it.

| AC | How | Expected value |
|---|---|---|
| AC-1 | Jest, computed name | `Menu for Johanna Müller, JM`; contains "JM" and the full label |
| AC-2 | Jest + negative control; `--axe` on the 3 avatar stories | pass after; violation with the bare label |
| AC-3 | Jest rows EN, DE, long, one word, empty; new story at 360 | names per §4; no violation; empty name = label, nothing appended |
| AC-4 | Jest photo + broken-photo rows; new story | inapplicable / pass; name `Menü für Tom Ek, TE` in both |
| AC-5 | `build.md`: copy the verdict table below; re-grep `<lc-avatar` and `aria-hidden` / `[decorative]` with text in `src/lib/**/*.html` (multi-line) to confirm nothing new | 2 rows, as below |
| AC-6 | Jest spec green; `story-shots --axe` on `navigation-header--{default,translated-labels,app-shell-phone,app-shell-desktop,signed-in-large-text,avatar-trigger-names}` at 360,1280 × light,dark, menu open | 0 violations in 24 shots; `package.json` diff: devDependency only |
| AC-7 | computed name | name contains the user's name once; avatar `aria-hidden="true"` |
| AC-8 | Jest name; `--measure` boxes | "JM" a word of the name; 48×48 / 96×96 / 70×44 as §3 |
| AC-9 | `--compare=tmp/story-shots/014/baseline` on the 22 baseline stories (`--full`, 3 widths × 2 themes); compat `EXPECT_IN_HTML` gets `['tt: avatar trigger named with its initials (AS-33)', /<button(?=[^>]*lc-header__profile-trigger--avatar)(?=[^>]*aria-label="Menü für Johanna Apfelbaum, JA")[^>]*>/, 'tt/index.html']` | 0 differing shots; check passes on 21 and 22 |
| AC-10 | spec diff | `header.app-shell.spec.ts:59` expects `Menü für ${longName}, JA` (reason: AS-33 name); no other assertion pins the old name |
| AC-11 | review | CHANGELOG *Fixed* (AS-33, axe-core 4.14, format, EN/DE examples, "queries on the start of the name keep matching; exact-equality checks need `, <initials>`"; header and menu icons now decorative, `svg-img-alt`); *Compatibility*: the components in the sweep table still fail 4.14's `label-content-name-mismatch` (named, so consumers know before lifting an axe hold); JSDoc and story texts per §2/§8 |

**AC-5 audit** (decorative text inside a self-named control; grep of `src/lib/**/*.html` plus the sweep below):

| Control | Decorative text | Verdict |
|---|---|---|
| `lc-header` avatar trigger (`header.component.html:171`) | `lc-avatar [decorative]` initials | **fixed** (§2 composition) |
| `lc-stepper` step button (`stepper.component.html:19`) | `.lc-stepper__indicator` (`aria-hidden`) step number | unaffected by this: the number is a word of the name ("Step 2 of 3: Profile"); the button fails 4.14 for its other visible text (follow-up) |
| `lc-avatar-group`, menu header avatar | `lc-avatar`, not decorative, in no control | unaffected |

**Kit-wide 4.14 sweep** (all 897 stories, `label-content-name-mismatch` only, light, 360 and 1280; `tmp/014/sweep-{360,1280}.json`). Besides the avatar trigger (4 header + 10 app-shell stories), 4.14 flags controls whose `aria-label` drops visible text. None holds an `lc-avatar`; life-os uses none of them (grep). **Out of AS-33's scope; recommend one follow-up request** ("axe 4.14 label in name, kit-wide"):

| Component | Example (visible → name) | Stories |
|---|---|---|
| `lc-header` context button | "Tenant Acme Corp" → `Context info` (1280 only) | header full-featured, with-org-info, with-org-name-only, with-tenant-info; 3 sidenav sidebar-first |
| `lc-stepper` | step label and description → `Step 2 of 3: Profile` | 6 |
| `lc-pagination` prev/next (localised, 1280 only) | visible text → `Vorherige Seite` | 1 |
| `lc-calendar` week columns | "Mo., 19." → `Montag, 19. Oktober 2026` | 1 |
| `lc-rich-text-editor` toolbar | "H1", "1." → `Heading 1`, `Ordered List` | 8 |
| `lc-gallery` items (`role="button"`) | caption or title text → `Photo 1` | 4 |
| `lc-accordion` rich header | header content → `Item one details` | 2 |
| `lc-file-upload` drop zone (`role="button"`) | instructions → `Upload a profile picture` | 2 |

**Risks:** `app-shell-phone`'s `play` opens the menu while story-shots shoots, so its shots may differ by timing alone; open only differing shots and judge the closed/open state · jsdom visibility (negative control above) · `axe.run` in parallel throws · `[decorative]` must not touch the `inline icon decorated (AS-14)` compat check (that one is an md icon on the home page, not the header) · keep `ɵavatarInitials` out of `src/index.ts`'s documented list (it is re-exported via the entry's `export *`, as `ɵprovideKitIcons` is).
