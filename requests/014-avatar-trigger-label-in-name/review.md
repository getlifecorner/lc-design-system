# Review 014: lc-header avatar trigger — label in name (WCAG 2.5.3)

## Round 1 — 2026-10-23, commit c93bfc3

Screenshots: `tmp/story-shots/014/r1/` (new story, 360 · 1024 · 1280, light · dark, `--full`, `--axe`); unchanged stories: the developer's `after/` against `baseline/` (`diff -rq`, same Storybook build, not stale). Opened 5 shots: new story 360 light, 360 dark, 1280 light; chat user-avatar 360 light baseline and after.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | r1 measure, all 6 shots: EN row `aria-label` "Menu for Johanna Müller, JM", shows "JM"; avatar `div aria-hidden="true"`; Jest `accessibleText` per build.md |
| AC-2 | pass | r1 `--axe` (4.14.0): 0 violations in 6 shots; JM/JA/TE rows not among the incompletes. Before: `tmp/014/axe-before.log` has 12 `label-content-name-mismatch` = 3 avatar stories × 2 widths × 2 themes. Jest negative control `header.axe.spec.ts:203` |
| AC-3 | pass | r1: DE "Menü für Johanna Müller, JM"; long "Menü für Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau, JA"; one word "Menü für Johanna, J"; no name "Benutzermenü öffnen" (shows "?", nothing added). axe: `label-content-name-mismatch:2` incomplete (J, ?), as design §4 |
| AC-4 | pass | r1: photo row `img` naturalWidth 100, no visible text, name "Menü für Tom Ek, TE"; broken photo shows "TE", same name |
| AC-5 | pass | build.md audit; re-grep `<lc-avatar` in `src/lib/**/*.html`: header (menu header :145, trigger :171) and avatar-group only, nothing new. Chat monogram is a `span`, not a control |
| AC-6 | pass | `tmp/014/axe-run.log`: 24 runs (6 stories × 360/1280 × light/dark, menu open), `"violations":[]` in all 24, axe 4.14.0; EN (default, signed-in-large-text, new) and DE (translated-labels, app-shell-*, new). `package.json`: `axe-core ~4.14.0` devDependency only; `libs/angular-ui-kit/package.json` untouched |
| AC-7 | pass | every name holds the person's name once, purpose first; avatar `aria-hidden`, no `role` inside the trigger; `lang` set per row in the story |
| AC-8 | pass | "JM" is a whole word of the name; r1 trigger boxes 48 × 48 in all 7 rows at 360 (x 280), 1024 (x 936), 1280 (x 1192); 200 % and icon trigger boxes covered by the identical signed-in-large-text and default shots; no SCSS in the diff |
| AC-9 | pass | `diff -rq baseline after`: 126 of 132 identical; the 6 `components-chat--user-avatar` shots differ only in the clock times (12:58/12:59/13:00 vs 13:17/13:18/13:19, story uses `new Date()`). Icon trigger name pinned (Jest); compat `--only=22` with the AS-33 prerender check (build.md) |
| AC-10 | pass | only `header.app-shell.spec.ts:59` changed, with an AS-33 comment |
| AC-11 | pass | JSDoc `userMenuAriaLabel` = design §2 text with `@default`; `userMenuTrigger` + `@default 'icon'`; argTypes and docs text describe the composition; changelog draft has Fixed (AS-33, 4.14, format, EN/DE), Compatibility (start-anchored queries, remaining 4.14 hits), Migration. None of the remaining hits (`contextName`/`contextLabel`, stepper, pagination, calendar, rich-text, gallery, accordion, file-upload) is used in life-os code (grep) |

**API (§2):** names, types and defaults as designed; `avatarTriggerAriaLabel` protected `computed`, composition as §2 (parentheticals dropped, `toLowerCase`, `?` skipped, empty label → initials); `ɵavatarInitials` exported via the entry's `export *`, the manifest extractor ignores functions; `story-shots --axe[=<tags>]` documented, violations set exit code 1. New story ID `navigation-header--avatar-trigger-names` as §8.

**Measured:** captions 12 px, `--color-text-secondary` on `--color-background` 7.56:1 light, 12.17:1 dark (computed); no `svg[role=img]` left in the story; document width = viewport at every width.

### Findings

None.

**Verdict:** approved
