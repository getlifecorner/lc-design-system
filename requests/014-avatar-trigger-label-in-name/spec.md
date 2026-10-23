# Spec 014: lc-header avatar trigger fails Label in Name (WCAG 2.5.3)

- **Status:** ready
- **Type:** bug fix (accessibility), plus a dev-only axe check in the kit
- **Affected:** `lc-header` (`header.component.{html,ts}`, stories, specs); audit of every `lc-avatar` inside a control (`avatar-group`, `list`, any other); `libs/angular-ui-kit/package.json` devDependencies and test setup (axe-core 4.14); CHANGELOG
- **Semver impact:** patch. Visuals and inputs are unchanged; only the accessible name of the avatar trigger changes so that it contains the visible initials. No new input is required (a new optional input would make it minor; see Assumptions).

## Need

life-os app shell (AS-2, `userMenuTrigger="avatar"`, gap AS-33). The account button shows the member's initials ("JM") through a `decorative` `lc-avatar` (`aria-hidden`), but its `aria-label` is `userMenuAriaLabel` ("Menu for Johanna Müller" / "Menü für Johanna Müller"), which does not contain "JM". axe-core 4.14 runs `label-content-name-mismatch` under `wcag21a` and fails it on every page with the header (54 phone tests on Dependabot #32). A voice-control user cannot say what they see. life-os holds `@axe-core/playwright` 4.14 back until this release.

## What the kit has today

- `header.component.html:162-178`: `<button [attr.aria-label]="userMenuAriaLabel()">` wrapping `<lc-avatar [decorative]="true">`. `lc-avatar` with `decorative` sets `aria-hidden="true"` and renders `.lc-avatar__initials` (text) or an `<img>` when `src` loads.
- The `icon` trigger (`:180-190`) has only icons, no visible text: not affected.
- `lc-avatar` in `avatar-group.component.html` is not decorative and sits in no control; the menu header avatar (`:145`) is not in a control. No other `lc-avatar` use in kit templates was found by grep; AC-5 requires the audit to confirm it.
- The kit has **no axe tooling today** (no `axe-core`, `jest-axe` or Storybook a11y addon in package.json, tools or `.storybook`). "Run the kit's axe checks" therefore means adding one (AC-6).
- Nothing to configure at the consumer: `userMenuAriaLabel` alone cannot fix it, since the kit knows the initials and the consumer does not.

## Scope

- In: the avatar trigger's accessible name contains the visible initials text (literal, as axe compares); same guarantee for any other control containing a decorative `lc-avatar` with initials; an axe 4.14 check in the kit; stories and docs wording.
- Not in: changing the visible look, the initials algorithm, the `icon` trigger, `lc-avatar`'s non-decorative behaviour, or life-os's dependabot file (life-os lifts its own hold after the release).

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | With `userMenuTrigger="avatar"`, `userName="Johanna Müller"`, no photo: the trigger's computed accessible name contains the visible initials "JM" (case-insensitive, whitespace-normalised) AND the full `userMenuAriaLabel` text still. | unit test (name computed from DOM) |
| AC-2 | axe-core 4.14 `label-content-name-mismatch` (tags `wcag21a`) passes on the header story with the avatar trigger; fails on the pre-fix code (the test proves it can fail). | axe run in Jest or story, before/after |
| AC-3 | EN `userMenuAriaLabel="Menu for Johanna Müller"`, DE `"Menü für Johanna Müller"`, a long name (e.g. the one in `header.app-shell.spec.ts`), one-word name, and an empty `userName` (no initials): all pass AC-2; with no initials nothing stray is added to the name. | unit tests + stories |
| AC-4 | With `userAvatarSrc` and a loaded image (no visible text): no mismatch, and the name still contains `userMenuAriaLabel`. If the image fails and initials appear, AC-1 holds again. | unit test, both states |
| AC-5 | Audit: every `lc-avatar` (and any other `decorative` element showing text) inside a button, link or other self-naming control in `libs/angular-ui-kit/src/lib` is listed in the build notes with the verdict; every hit is fixed or shown to be unaffected. | grep result in `build.md` |
| AC-6 | A dev-only axe check (axe-core 4.14, `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) runs in the kit's tests or Storybook for the header (avatar and icon trigger, `userMenuTrigger` both values), in light and dark, EN and DE names, at 360 and 1280 px where the runner supports widths. No violations. axe-core is a devDependency only. | test run; `package.json` diff |
| AC-7 | Screen reader: the button is announced once, with the account name and "menu" context (no doubled "Johanna Müller Johanna Müller"); the avatar stays hidden from AT. Designer decides the wording; reviewer checks the computed name string. | computed name + review |
| AC-8 | Voice control: saying the visible initials activates the button (name contains them, 2.5.3); keyboard focus ring and 44 px (48 px) target unchanged. | unit test on name; story measure of size |
| AC-9 | Defaults unchanged: icon trigger renders and is named as before (same `aria-label`); avatar trigger looks pixel-identical in light and dark at 360, 1024, 1280 px; prerendered HTML still contains the button with the new name before JavaScript. | story-shots hash compare; prerender check in compat run |
| AC-10 | Existing assertions that pin the old name (header specs, `header.app-shell.spec.ts`) change only where they asserted the exact old `aria-label`; each change is noted with the reason. | spec diff |
| AC-11 | CHANGELOG (Fixed, with AS-33, axe-core 4.14, the name format, EN/DE examples) and the `userMenuAriaLabel` JSDoc and story text describe the new name composition. | review |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency (axe-core as devDependency is fine), no API break.
- The accessible-name text is built from existing inputs; the kit must not hard-code English words (texts stay consumer-supplied).

## Assumptions

- Assumption: fix inside `lc-header` with no new input, composing the name from the displayed initials plus `userMenuAriaLabel` (or equivalent that satisfies AC-1/AC-7); exact mechanism (aria-label prefix, visible-text-in-name via hidden text, `aria-labelledby`) is the designer's call.
- Assumption: where the photo shows, no text is visible, so 2.5.3 does not apply (AC-4).
- Assumption: `lc-avatar` keeps `decorative` semantics; the fix lives in the control, not the avatar.
- Assumption: a changed accessible-name string is a patch, not a break, because no input, class or visual changes; consumers who assert the exact old label in their own tests (life-os) are told in the changelog.
- Assumption: the dependabot hold is life-os's file; no kit action.

## Open questions

None.
