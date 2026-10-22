# Review 011: lc-icon without inline styles, and footer sections at 320 px with 200 % text

## Round 1 — 2026-10-22, commit 1af3e7c

Screenshots: `tmp/story-shots/011/r1/` (icon 360 · 1280, footer 320 · 360 · 1024 · 1280 `--full`, light · dark). Storybook build 23:42 is newer than the sources (23:41). Unchanged stories: the developer's compare in `tmp/story-shots/011/{build,build-full}`, which I re-checked with `diff -rq` against `baseline`.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `icon.inline-style.spec.ts` (5 sizes × outline/solid). Story, 360/1280, L/D: 8 default icons with `styled` 0 (host, box and svg) |
| AC-2 | pass (22) | `tmp/011/compat-22.log`: 5 G-37 rows ok (index: 29 icons, `/tt`, `/tt/icons`, the size class, the `#compat-color` control). Angular 21 still needs its run in the release gates (the developer ran `--only=22`) |
| AC-3 | pass | `inherited-color`, 360/1280, L/D: boxes 16/20/24/32/40, svg `width`/`height` `16px`…`40px`, the same as 3.11.0. `components-icon--sizes` is hash-identical to the baseline |
| AC-4 | pass | svg `color` = the parent's for all 8 default icons. Light: ink rgb(17,24,39), secondary rgb(75,85,99), link rgb(26,106,121), error rgb(157,14,14). Dark: rgb(241,246,248), rgb(196,210,217), rgb(163,213,223), rgb(247,161,161). The stylesheet scan finds only `.icon-container[_ngcontent-…] svg => inherit`, plus 2 Storybook UI rules. The icon SCSS has no `forced-color-adjust` |
| AC-5 | pass | The custom svg alone has `style`: `color: var(--color-primary-500);` → rgb(32,132,151) / rgb(132,199,212), and `color: rgb(255, 87, 51);`. The unit spy sees 0 `setAttribute('style')` calls. Contrast on the background: 4.37 / 9.95 and 3.15 / 5.97 (≥ 3:1 for graphics) |
| AC-6 | pass | Unit tests: custom → default leaves no `style`, and `xl → xs` (inline and fetched icons), per build.md |
| AC-7 | pass | `tmp/011/trusted-types.log`: 8 G-37 rows ok (`/tt` and `/tt/icons` at 360/1280, both runs): 0 styled elements, `icon-md` 24 × 24 |
| AC-8 | pass | `sections-large-text`, root 32 px. 320: `scrollWidth` 320 = `clientWidth`, columns `224px`, text ink ends at 268 ≤ 272 (DE) and 233 (EN). 360: 360 = 360, `264px`, ink 298 ≤ 312. Links 88 px; titles 28/42. At 320 only, "Unter-nehmen" takes 2 lines (84). "Datenschutzerklärung" breaks inside the word: after "…erklär" at 320, and after "…erklärun" at 360, where the 266 px word overflows the 264 px column by 2 px (as designed, §3). The bottom row is 224/264, with no overflow |
| AC-9 | pass | `diff -rq baseline build`: besides the 5 `--full` stories, only `image-preview` differs (8 shots, random picsum). `diff -rq baseline build-full`: 40 of 40 identical. In total, 464 of 472 shots are identical. Columns at 100 %: 212 ×4 / 276 ×4 (build.md) |
| AC-10 | pass | `footer.component.spec.ts` is unchanged (not in `git diff ccfd164`). All footer stories are hash-identical in L/D. At 200 % the links are 88 px |
| AC-11 | pass | There is no change to inputs, outputs, selectors, hooks, `index.ts` or `package.json`. The JSDoc of `size`/`color` matches §2, and the argTypes `size`/`color` have `table.defaultValue` |
| AC-12 | pass | The changelog draft names G-37, G-36, `style-src 'self'`, 464/472, 224 px, 212/276 and "No API breaks". See nit 1 |

New stories, opened in r1: `inherited-color` 360 and 1280 light and 360 dark; `sections-large-text` 320, 360 and 1280 light. Both render as in design §8. At 360 the size row wraps after `lg` (flex-wrap), which reads fine.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | nit | Changelog draft, *Compatibility* (and design §9 AC-12, corrected below) | "A rule of your own on the inner `.icon-container` that is **more specific than (0,2,0)** now applies. An equally specific global rule still loses, because the component style loads later." | "with specificity (0,2,0) or more … now applies". In practice a global (0,2,0) rule such as `.card .icon-container` loses the tie to `.icon-md[_ngcontent-…]`, which is appended to `head` after the app's stylesheet |

**Verdict:** approved (1 nit, for the release-manager to apply in the changelog).

**Design change note (r1):** in §9 AC-12, "specificity ≥ (0,2,0)" now reads "> (0,2,0), or (0,2,0) later in the cascade". The rendering and the API are unaffected.
