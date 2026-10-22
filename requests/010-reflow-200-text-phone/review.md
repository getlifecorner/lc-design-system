# Review 010: Reflow gaps at 200 % text on a phone

## Round 1 — 2026-10-22, commit 64343ea

Screenshots: `tmp/story-shots/010/r1` (79 existing stories, `--full`, 360 · 1024 · 1280, light · dark, compared by hash with `010/baseline`) and `tmp/story-shots/010/r1-new` (the 6 new stories at 320 · 360 · 1024 · 1280, light · dark). The Storybook build (03:02) is newer than the last source change, and `git diff --quiet 64343ea -- libs tools` holds. 9 shots opened.

| AC | Result | Evidence |
|---|---|---|
| AC-1 | pass | `layout-page-header--large-text` at 320 and 360, light and dark: document overflow 0, and every `.lc-page-header` has overflow 0. The title's computed `overflow-wrap` is `anywhere`. Every title line ends at or before 264 (320) or 304 (360). DE hyphenates first ("Jo-han-na-Frie-deri-ke", shot 320 light). The actions wrap below the title: DE x 104.6–264, EN 143.9–264 at 320. |
| AC-2 | pass | All 16 page-header stories × 6 shots are identical to the baseline. The hyphens hook is unchanged in the spec. |
| AC-3 | pass | `layout-footer--links-large-text` at 320: the row box is 48–272, every link is 48–272 (138 px high, 2 lines), and overflow is 0 in DE and EN. At 360 the links are 48–312. `components-button-link--overlong-word`: links 24–296 (320) and 24–336 (360), overflow 0. The `.btn` default stays `break-word` (the hook default is pinned in `button.overflow-wrap.spec`). The 23 button, 9 button-link and 8 footer stories (240 shots) are identical. |
| AC-4 | pass | `feedback-next-step-card--large-text`. Soft card at 360: icon (48, 48) 96, title (48, 172) w 216. At 320: w 176, lines "Nichts zu / tun" and "Nothing / to do". Default card at 360: title beside the icon (x 140, w 139, lines "Wartet / auf / Freigabe"). At 320: below it at (36, 121), w 203. No title word is broken. Card and document overflow 0 at 320, 360, 1024 and 1280. |
| AC-5 | pass | All 13 next-step-card stories × 6 shots are identical. |
| AC-6 | pass | `badge.wrap.spec` covers the default class list and DOM. All 10 badge stories × 6 shots are identical. |
| AC-7 | pass | `wrap-large-text` at 320: the SI-15 badge is 288 wide in a 288 column, 91 high, 2 lines, LH 35, min-height 56, radius 28, overflow 0 in x and y (DE and EN). The "Beta" pair is 98.7 × 56 for both, text tops 11 / 11.5. The dot badge has 3 lines with the dot on the first line (shot 320 dark). `wrap` at 100 %: xs/sm/md/lg 35 / 41.5 / 45.5 / 52 high, radii 10 / 12 / 14 / 16. |
| AC-8 | pass | Computed border `1px solid` in every wrap badge. No colour rule is touched (diff); the contrast specs are unchanged and green (build.md). |
| AC-9 | pass | All 6 IDs from design §8 render. The `wrap` argType has its description and `table.defaultValue` `false`. The `--lc-btn-overflow-wrap` argType is under "CSS hooks". |
| AC-10 | pass | No template change. At 320, the first footer link is focused programmatically: `:focus-visible` matches, and the ring is x 45–275 (3 px solid, offset 0), fully visible (shot 320 light). |
| AC-11 | pass | `tmp/010/compat.log`: "ok badge wrap class before JS (SI-15)" (Angular 22). |
| AC-12 | pass | 3 changed assertions confirmed (below). The changelog draft is in build.md; see finding 1. |

**API (design §2):** `wrap = input<boolean>(false)`, JSDoc verbatim with `@default false`, class `lc-badge--wrap`, hook `--lc-btn-overflow-wrap` (default `break-word`). The class JSDoc of `ButtonComponent` and `ButtonLinkComponent` is verbatim. The three setters are `.footer__bottom`, `.lc-page-header__actions` and the narrow `.lc-next-step-card__actions`. All of these match.

**The 3 changed spec assertions are confirmed.** Each one pinned the mechanism that design §1 and §3 replace, and each now pins its replacement with the same strength:
- `.btn`: `break-word` → `var(--lc-btn-overflow-wrap, break-word)`. The resolved default is the same.
- Page-header title: `break-word` → `anywhere`. This is AC-1.
- Narrow next-step-card: the grid → `display: flex; flex-wrap: wrap`, and the actions' `grid-column: 1 / -1` → `flex: 1 1 100%`. The box identity is proven by AC-5.

None of them is weaker, and the behaviour consumers rely on is covered by the identical shots.

### Findings

| # | Severity | Where | Expected | Actual |
|---|---|---|---|---|
| 1 | should-fix (changelog text, release-manager) | build.md changelog draft, "Fixed" › footer links; design §4 | Focus ring "at 45–275" (outline 3 px solid, offset 0, measured) | The draft says "44–276", copied from design §4, which assumed 2 px + 2 px offset. Design §4 is corrected below. |
| 2 | nit (follow-up, not this release) | `layout-footer--links-large-text` 320, `components-button-link--overlong-word` 320, `feedback-next-step-card--large-text` 320 (actions) | DE button labels that must break would ideally hyphenate, like the page-header title ("Da-ten-schutz") | `.btn` has no `hyphens`, so they break at the last glyph that fits: "Datens/chutz", "Datensch/utzerkläru/ng", "Änderun/gen/anforder/n" (a lone "n"). This is within AC-3 (everything stays inside). A future `--lc-btn-hyphens` hook, or `hyphens: auto` in the three `anywhere` rows, needs its own baseline check. |
| 3 | nit (no action) | `layout-page-header--large-text` 320, EN | — | Chrome doesn't hyphenate capitalised English words, so "House/hold" and "Sign in to LifeCorne/r" break without a hyphen. This is as design §4 expects, and matches life-os's own interim. |

**Design change note (round 1):** in design §4, "focus-visible (wrapped link)", the ring is the kit's focus ring on `a[lcButton]` link: 3 px solid, offset 0, x 45–275 at 320 px. It was not 2 px / 2 px / 44–276. No code impact.

**Verdict:** approved
