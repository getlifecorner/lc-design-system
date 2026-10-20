# Design 007: Lighter lc-sidenav-placeholder

- **Status:** blocked — the measurement contradicts the spec (Q1 below). The design for path (b) is complete and can be implemented as soon as the spec is amended.
- **Spec:** [spec.md](spec.md) — AC-1 … AC-8

## 1. Approach

**Measured first (pitfall: requester size figures).** The F1 fixture build `tmp/003/compat/bundle-next/dist/icons-defer` (config D: icons + deferred sidenav, Angular 22, production) was used for this. Its `lc-sidenav-placeholder` and `internal/navigation` sources are byte-identical to 3.9.0 (both last changed in f6f3ca8, 3.6.0). I took the module bytes from the esbuild metafile (`bytesInOutput`) and cut or rewrote the minified code in memory. The gzip -9 figures are for main + the shared initial chunk. kB = 1000 B.

| What | Raw (min.) | Gzip, in context | Note |
|---|---|---|---|
| Placeholder module (class, template, styles) | 11 362 B | — | in `main` |
| … of which the styles string (docked box partials, 76 × `[_ngcontent]`) | ≈ 7 030 B | 1 373 B on its own | needed for box parity (AC-8) |
| `internal/navigation` helpers | 763 B | 306 B | in the shared initial chunk, because the lazy sidenav reaches it too |
| `Router`, `_router_module`, rxjs `filter` | 71 586 + 11 516 + 92 B | — | **stays in the initial chunk anyway**: `provideRouter`, and the `RouterModule` of `lc-header` and `lc-bottom-nav` |
| **AC-1: the whole placeholder** (removed, helpers moved to lazy) | — | **2 500 B** | ≥ 2 kB, so by the spec AC-2 applies |
| **Path A: no Router, inline logic (§2)** | main −51 B | **saves 327 B (13 %)** | at most +0.1 kB more if `takeUntilDestroyed` leaves the initial graph |
| AC-5 target: optimized placeholder ≤ 50 % of AC-1 | — | needs ≤ 1 250 B, gets **2 173 B (87 %)** | **unreachable** without a different template or styles, which AC-8 forbids |

The "≈ 9 kB gzip" in the spec's Need is wrong. The whole placeholder is 2.5 kB, and the part that AS-28 targets (Router, rxjs and helpers) is 0.33 kB. That is 1.1 % of T331's 30 kB gap (180 → 150 kB). Router and rxjs cost nothing extra, because the app ships them anyway.

**The spec contradicts itself in two places:**

1. AC-5 (≥ 50 %) can't be met by AC-2/AC-3. The measured removable share is 13 %.
2. Question A (the spec's recommendation) breaks AC-7. `sidenav-placeholder.component.spec.ts:150` "follows the router when activeRoute is empty (3.5 rules)" asserts the Router fallback. B fails that test too: reading `router.url` once, with no subscription, misses the `navigateByUrl` that runs after creation. Only today's subscription passes it, and keeping it leaves nothing to save.

**Q1 for spec-writer:** which resolution?

- **(a) Recommended: resolve AS-28 with no kit change ("measured, not worth it").** The requester's AS-28 row asks for exactly this measurement ("if it is worth it") and names "the kit's placeholder as it is" as the fallback. Give life-os the table above. Its 30 kB has to come from elsewhere: the placeholder as a whole is 8 % of the gap.
- **(b) Ship path A anyway (0.33 kB).** This needs three spec changes: AC-5 becomes "saves ≥ 0.3 kB gzip in the fixture"; AC-7 allows replacing the test at line 150 with "an empty activeRoute expands no group"; and a Changed entry, because the documented `activeRoute` fallback goes away (visual only, inert skeleton). life-os is unaffected: it binds `[activeRoute]="activeRoute()"`, and its items are flat (`libs/ui/shell/src/shell.component.html:69`).
- (c) Path B: keeps `inject(Router)`, saves ≤ the subscription (~130 B raw), still breaks the line-150 test. Not worth a change.

**A vs B (the task's question):** if the code changes at all, choose **A**. B keeps the cost of the fallback (path parsing, longest-prefix matching) but drops the live updates. That is the worst of both: a smaller saving and behaviour that is still different from today. Under A, when `activeRoute` is empty no group expands. This is what `lc-sidenav` does without a router, so it is the honest fallback. "Always expand the first group" matches neither `lc-sidenav` mode.

## 2. Public API

Unchanged: the same 10 inputs, types and defaults (AC-6). No new input, hook or type. Under path (b), only this JSDoc changes:

| Kind | Name | Type | Default | Description (JSDoc, path b) |
|---|---|---|---|---|
| input | `activeRoute` | `string` | `''` | The current route, the same value as on `lc-sidenav`. It decides which group starts expanded: the parents of the first link, in display order, whose `route` equals it. When it is empty, no group starts expanded; bind it whenever the items have groups. |

Internals under path (b) (AC-2, AC-3): no `inject(Router)`, no `@angular/router`, `rxjs` or `rxjs-interop` import, no `internal/navigation` import, no constructor. The class JSDoc `@example` already binds `[activeRoute]`. `lc-sidenav` keeps the helpers, which move into its lazy chunk (esbuild shared-chunk rule).

```ts
protected readonly sortedItems = computed(() => [...this.items()].sort((a, b) => a.displayOrder - b.displayOrder));
/** The groups lc-sidenav opens on load: every collapsible parent of the current link (3.5 rules, activeRoute only). @internal */
private readonly expanded = computed(() => {
  const route = this.activeRoute();
  const groups = this.sortedItems().flatMap((item) => (item.isSection ? (item.children ?? []) : [item]));
  const current = route === '' ? undefined
    : groups.flatMap((g) => (g.children?.length ? g.children : [g])).find((link) => link.route === route);
  return new Set(current ? groups.filter((g) => g.children?.includes(current)).map((g) => g.id) : []);
});
```

Equivalence for every non-empty `activeRoute`: `groups` → `links` visits the links in the same order as `navigationLinks(sortNavigationItems(items))`. `find` is `currentNavigationItem`'s first match. The filter finds the same set as `currentItemParents`, which looks by reference over all parents, so iteration order doesn't matter for a `Set`. `Array.prototype.sort` is stable, as before. Default rendering is unchanged: the DOM, classes and styles are untouched, and the `expanded` set is identical whenever `activeRoute` is set.

## 3. Anatomy and layout

No change at any width. The template, SCSS and host bindings stay byte-identical (see design 002 §3 for the anatomy). Baseline values from 3.9.0 main (`tmp/story-shots/007/baseline.log`):

| Story | Placeholder rows / expanded groups | lc-sidenav rows / groups |
|---|---|---|
| `…--next-to-the-sidenav`, `--transparent`, `--collapsed` | 5 / 0 | 5 / 0 |
| `…--sections-groups-and-logo` (`/money/accounts`) | 6 / 1 | 6 / 1 |
| `layout-app-shell--lazy-side-navigation(-german)`, 1024–1920 | 3 / 0, host 256 px high | — (not loaded when the shot is taken) |

## 4. States

Default, collapsed, closed, logo, sections, expanded group: unchanged. Hover, focus, active and disabled don't exist (inert). Empty `items`: unchanged (no nav block). **Empty `activeRoute`:** today the router's URL decides; under (b) no group expands. Overflow: none, because the labels are fixed-width bars.

## 5. Theming

Unchanged. No new token. `--lc-sidenav-placeholder-fill` and the GrayText forced-colours rule stay as they are, so no contrast changes.

## 6. Accessibility

Unchanged: the host is `aria-hidden="true"` and `inert`, with no landmark, no tab stop and nothing announced. Targets, motion and forced colours are unaffected.

## 7. Texts

None: the placeholder has no built-in text.

## 8. Stories

No new or changed story. The 6 stories that render the placeholder are the review surface. Storybook has no router, so it can't show the empty-`activeRoute` difference; the unit test covers it.

| Story | Expected ID | Args | Shows |
|---|---|---|---|
| Next to the sidenav | `navigation-sidenav-placeholder--next-to-the-sidenav` | as is | box parity |
| Transparent | `navigation-sidenav-placeholder--transparent` | as is | 48 px pills |
| Collapsed | `navigation-sidenav-placeholder--collapsed` | as is | 56 px rail |
| Sections, groups and logo | `navigation-sidenav-placeholder--sections-groups-and-logo` | `activeRoute: '/money/accounts'` | inline logic expands the group |
| Lazy side navigation (EN/DE) | `layout-app-shell--lazy-side-navigation`, `…-german` | as is | swap in the shell |

**Baseline:** `tmp/story-shots/007/baseline`. 48 shots: the 6 stories above at 360/1024/1280/1920 px, light and dark, `--full`, taken on main ddd3a62 (= 3.9.0 libs), with the rows/groups measure.

## 9. Verification (path b)

| AC | How | Expected value |
|---|---|---|
| AC-1 | `bundle-size.mjs`: new config "defer + empty `@placeholder`" vs D | ≈ 2.50 kB gzip (simulated 2 500 B) |
| AC-2 | grep the component source | no `Router`, `rxjs` or `internal/navigation` |
| AC-3 | source + unit test | local `expanded` as in §2; the 8 AC-9 cases unchanged and green |
| AC-4 | `story-shots --compare=tmp/story-shots/007/baseline` + the same measure | 0 differing shots (ignore known hash noise), rows/groups as in §3 |
| AC-5 (amended) | bundle-size: D before − D after | ≥ 0.30 kB gzip (simulated 327 B) |
| AC-6 | source | 10 inputs, same `@default` values |
| AC-7 (amended) | `--testFile=sidenav-placeholder.component.spec.ts` | all green; line-150 test replaced by "empty activeRoute → 0 `.lc-sidenav__nav-children`" |
| AC-8 | same compare as AC-4, 360 px shots | hash-identical |

Risks: the helpers move into `lc-sidenav`'s lazy chunk (shared-chunk rule), so check that the fixture's lazy chunk now holds `displayOrder-`. Keep the `type`-only imports from `sidenav` so it isn't pulled in eagerly (the `@defer` dependency rule).
