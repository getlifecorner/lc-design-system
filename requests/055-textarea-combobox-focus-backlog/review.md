# Review 055: lc-textarea / lc-combobox focus(), backlog sweep (9 rows)

## Round 1 — 2026-11-06, commit 4156f85 (gates on 657b990, `git diff --quiet 657b990 -- libs tools` holds)

Screenshots: `tmp/story-shots/055/`
- `r1/`: the 7 new or changed stories at 360 · 1024 · 1280, L · D, `--axe`, measure `r1-measure.js` (the developer's `/zz-055/{m,alert}.mjs` after a logic review, plus line counts, `aria-describedby` and a reopen at the end, so the drawer and sidenav shots show the open panel).
- `r1-200/`: the alert at 200 % text, light.
- `r1-tag/`: tag chip, `--compare=build-b`.
- `r1-fc/`: combobox in forced colours.
- `r1-axe/` and `r1-lang/`: the axe incompletes and the language context.

I did not re-shoot the unchanged stories. `diff -rq` on the developer's folders (same Storybook build) gives:
- A: 96/102 identical. The 6 that differ are `cmp`-identical to `proto-alert`.
- B: 153/168 identical. The 8 combobox shots equal `proto-b`. The tag shots at 360/1280 L equal `proto-tag`, and the dark ones were measured. The 3 remaining shots (large-form 1280 L, drawer-mode 1280 D, text-brand-drawer-german 360 D) are `cmp`-identical to `rest2`, a second at-rest run of main, so they are two-state flakes.

I opened 10 shots. Triggers are clicked with `HTMLElement.click()` and get no focus (the WebKit tap).

| AC | Result | Evidence |
|---|---|---|
| AC-1, AC-3 | pass | `focus(options?: FocusOptions): void` and its JSDoc match §2 word for word. Unit `textarea.focus.spec.ts`. `r1` 6/6: after `play` the active element is `textarea.lc-textarea`, not the modal's × |
| AC-2, AC-3 | pass | Unit `combobox.focus.spec.ts`. `r1`: *Focus on Open* `aria-expanded="false"` with 0 listboxes (6/6 after `play`, 6/6 after reopen). *List Opens* gives `"true"`, 1 listbox, and `elementFromPoint` on an option hits it (12/12) |
| AC-4 | pass | The three stories have the IDs from §8. Textarea `controls.disable`. Combobox `controls.include: ['openOnFocus']`; its meta argType has a description and default `'true'` |
| AC-5 | pass | `r1` 18/18 shots: `:focus-visible` true, 2 px ring, offset 0, no shadow. Light `#208497` 4.37 / 4.18, dark `#84c7d4` 7.58 / 9.13 against the sheet's gradient stops. Textarea error ring L 8.39 / 8.03, D 7.21 / 8.69. Forced colours: 2 px `Highlight` in L and D (`r1-fc`) |
| AC-6 | pass | No `.html` changed. The requester's `lc-textarea textarea` and `lc-combobox input` are the focused elements. Changed spec files are only those of AC-10 and AC-13 (see deviation 2) |
| AC-7 | pass | `moreBadge` JSDoc and the *More Badge, Three Characters* text carry D-6 (−3.2 / −3.4 px, 2 of 3 dots) |
| AC-8 | pass, no change | `tmp/055/ax-cdp.json` (Chrome CDP). Collapsed rail: 5/5 names come from `attribute:title`, description null. Without `title` the name is `""`. Badged items are named from their contents („One digit 3“), description null. D-2 holds |
| AC-9 | pass | `r1-tag` 4/4 identical to `build-b`. Chip 186 × 45.2, 2 lines, `lang="de"`, `hyphens: auto`. The 360 D shot shows „Kostenstellenverant-/wortung“, and the focus is on the × |
| AC-10 | pass | The whole-file hash is gone. Outlet-scoped checks are in place, and the two break checks are in `build.md` (`t5-*.log`) |
| AC-11 | pass | Class JSDoc and meta docs §7 use the §2 sentence. The order spec is untouched |
| AC-12 | pass | *Service Call*, *Offsets*, *Bottom Stack Order* and *Stack Spacing* set `argTypes.{position,duration}.table.disable`. The meta argTypes now have `defaultValue` |
| AC-13 | pass | `r1` at 360 L/D, DE retry alert: alert 149 high, body 226, button 144.3 × 35.5 at x 69 (text x 69), 16 px below the body, message on 2 lines. Without ×: body 258. EN: body 226, 128 high. The 481 box drops the button (body 379 at 1024/1280); the 482 box keeps it inline (223.7). At 1024/1280 everything is inline as before. Overflow 0. At 200 %: 1024 in the band (body 802, button x 113 = text x 113, gap 32), 1280 inline, 360 the narrow layout as before. The compat check finds the band rule before JS |
| AC-14 | pass | Unit: drawer 15, sidenav 17, gallery 4 (D-1). `r1`: drawer ×, Escape, backdrop and „Anwenden“ 24/24 on the trigger's `<button>`. Sidenav ×, Escape and backdrop, plus an item at 360, 20/20. On reopen the focus is in the panel (on ×) |
| AC-15 | pass | axe: 0 violations in 42 shots. The incompletes are CDK trap anchors (`aria-hidden-focus`) and `aria-controls` into the overlay; *Opens Above* has the same. The modal and listbox are in `lang="de"` (`r1-lang`) |

API check against §2: names, types, defaults, JSDoc, the `@default null` tags, the shared `focusReturnTarget()` (modal specs unchanged), the environment injector, the `untracked` reads, the combobox SCSS, the forced-colours list, the `theme-contrast` row and the alert band block all match. The drawer and sidenav meta `returnFocusTo` have `control: false`, a description and default `null`.

### Deviations (build.md)

| # | Ruling |
|---|---|
| 1 | **Accepted.** `open()` stays true when the drawer is destroyed while open, so the §2 guard would have skipped the destroy path that §2 promises. Internal only |
| 2 | **Accepted.** The band block is cut out before hashing, and the pinned 6722 / `11ed3a6…` values stay the same, which proves the band is the only addition. The whole-file hash pattern remains (N-2) |
| 3 | **Accepted.** `requiredAriaLabel="Pflichtfeld"` keeps the story German. „Einfrieren“ closes (F-2). The warning alert has a title only (§8 gave no message). The bar holds only the trigger |
| 4 | **The design was wrong.** The modal body padding is 16 at every width: field 328 in the 360 sheet, 566 in the 600 dialog. §3 is corrected with a change note |
| 5 | **Accepted.** Chrome's CDP tree is authoritative. The temporary spec is gone (`git status` clean in `libs`) |

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| N-1 | nit → backlog | tag-input *Keyboard Focus* (story), and since 3.27/3.33 also *Touch Targets (DE)* and *Long Tags* | Bind every meta arg, or limit `parameters.controls.include` to the bound ones (as 053-n3 did for the outlet) | The new `render` binds `label`, `placeholder` and `removeTagAriaLabel` only. `separator`, `maxTags`, `allowDuplicates`, `removable` and `disabled` still show as controls but do nothing |
| N-2 | nit → backlog | `alert.close-target.spec.ts` AC-15 | Targeted assertions on the × rules (`::before` hit area, `position`, `color: inherit`), as 053-n1 did for the outlet | It still pins the length and sha1 of the whole compiled alert CSS (minus the 3.35 band), so the next unrelated alert SCSS edit fails it again |
| F-1, F-2 | backlog (design §1) | `lc-header` `hamburgerClick`, `lc-combobox` | An element for `returnFocusTo`; an `announceError` input | `output<void>`; the error is always `role="alert"` |
| 054-n2 | stays in backlog | modal, confirm-dialog | Manual Safari/iOS check | WebKit is not installed here (owner decision 2026-11-06) |

**Verdict:** approved
