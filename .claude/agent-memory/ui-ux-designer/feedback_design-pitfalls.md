---
name: feedback-design-pitfalls
description: Traps that decide whether a kit design is buildable (ng-packagr entries, esbuild shared chunks, @defer deps, hydration under CSP, Renderer2 on SVG, server effects, CSS specificity, spec premises)
metadata:
  type: feedback
---

- **Entries.** A stub `libs/angular-ui-kit/<entry>/ng-package.json` with `entryFile: ../src/lib/<entry>/index.ts` is the pattern. A relative import across entries fails with TS6059. The Nx lint needs `allowCircularSelfDependency`.
- **esbuild.** A file that both the initial and a lazy graph reach goes into an eagerly loaded shared chunk. Lazy data therefore needs its own entry, with its own copy.
- **`@defer` dependencies** must be imported from the secondary entry and used only inside the block.
- **Hydration.** life-os runs `withNoIncrementalHydration()` because its CSP blocks the inline script, so `hydrate` triggers aren't available and the server renders `@placeholder`. A CSP fixture needs that setting plus `inlineCritical: false`.
- **DOM.** For DOM that must equal earlier output, use `DOCUMENT` APIs, not Renderer2 (it stamps `_ngcontent`). A server-side write belongs in an `effect`, not an `afterRender` hook.
- **CSS specificity.** `a.btn` (0,1,1) beats `.btn-inline`; use `.btn.btn-inline`.
- **Spec premises.** Measure a requester's size figures before accepting a target. In 002, "136 SVGs ≈ 20 kB" turned out to be 12.0 kB; in 007, "≈ 9 kB" was 2.5 kB, and only 0.33 kB of it was removable. A dependency the app already ships (Router, rxjs) saves nothing. Check whether a removal would break an existing spec assertion (AC "tests unchanged"). Measure wrap row counts too: URL runs break only at hyphens, so the estimate of 3 rows was really 4 (004).
- **Token values.** Read the value before writing "token (N px)". `--border-radius-sm` is 10 px, and there is no 4 px radius token.
- **"Output equal to the old version."** Capture the old output in the browser before promising it. The innerHTML-era code block had quirks that came from HTML-parser recovery: SCSS showed `&amp;`, multi-line tokens were coloured on the first line only, and an empty line collapsed to 0 px (003).
- **Global element styles.** `_typography.scss` gives every `pre` `overflow-x: auto`, so inside lc-code-block the `pre` was the real scroller (axe flagged `.code-block__pre`, not the body). Measure which element scrolls before placing `tabindex`. A ring inside `overflow: hidden` must be inset.
- **Wording.** Check an AC's wording (for example "no emitted .js contains X", "file unchanged") against what the design has to move.

- **Gradient bands.** On a 135° band the top-right corner is at t = w / (w + h), which is 0.88 for 1280 × 168, so "top-right on a card" fails a t ≤ 0.75 rule on any compact band. A taller text doesn't help, because the media column centres vertically. Prototype the placement with `--measure` before you fix it in a design, and name the measuring point (the box centre).

- **CSS limits (006).** CSS can't read a sibling's height: to "grow the land by the footer", give the footer its own grid row painted in the gradient's end colour. An inline `height` can't be overridden from a stylesheet, but `min-height`/`max-height: var(--hook, 0px / none)` clamp it and leave the DOM unchanged. Injected `.btn` markup is unstyled in a story that renders no button (the stylesheet registers on first render).
- **Edge features need both edges (006 r1).** A "flush with the edge" design must cover the end edge too: grep the consumer's markup for the row (`justify="between"`) before fixing an alignment at high specificity; expose it as a hook (`--lc-btn-flush-align`). Copy the consumer's `align-items` into the story row too: the default `stretch` made a one-line link's box and focus ring 69 px instead of 46.5 (r2 nit).

- **Prerender serialisers (008).** Domino (platform-server 21/22) writes `textarea.value` as text and escapes `& < >`, but omits the spec's extra LF after `<textarea>`/`<pre>`: a leading newline is lost. Angular 21's default build re-serialises through beasties (`decodeEntities: false`): bare empty attributes (`placeholder`, `required`), no `jsaction`. Compat regexes must accept both forms.
- **output() → model() is a member removal (008 r1).** Replacing `xChange = output()` with a model drops the public class member `xChange`; the 2.0 changelog calls that a break. In a minor, keep `readonly xChange: OutputRef<T> = this.x` (no duplicate output, no MCP duplicate) and give the type narrowing a line under Compatibility.

- **Flex wrap and 200 % text (009).** A flex basis of 0 never wraps (the AS-30 `brand flex: 1 1 0` overlap); a basis of the full content wraps at 100 % with a long subtitle. Use `width: min-content` plus `contain: inline-size` on the shrinkable text. `overflow-wrap: break-word` doesn't lower min-content; `anywhere` does. A sticky grid item is held inside its grid area, so a bar can't both stick and reserve its own row: clearance from a bar's real height needs a ResizeObserver. **Wrapping labels in nav columns (009 r1):** specify the vertical alignment and a minimum gutter. Centred columns made the icons zigzag by up to 48 px, and a reach of 0 put two German labels 1.2 px apart, so they read as one compound. Use `flex-start` with the old centring offset as padding. Chromium hyphenates capitalised German labels but not capitalised English ones (`lang="en"`), so EN nav labels at 200 % break without hyphens. Expect it; don't file it as a kit bug.

- **`anywhere` is not free (010).** It lowers min-content to one character, so in a *non-wrapping* row a one-word button shrinks with its neighbours at 100 % ("Bearbeiten" 116.7 → 93.8 px, 2 lines). Apply it to boxes that already have `min-width: 0` (titles) or through a hook in wrapping rows, columns and block flow, never globally on `.btn`. Content-dependent "icon above the title" = flex-wrap with the title `flex: 1 1 0%; max-width: 100%` and `break-word` (its auto-minimum is the longest word); a grid can't wrap.

- **CSP `style-src` without `'unsafe-inline'` (011).** On the server (domino), `[style.x]` bindings and CSSOM writes are both serialised as `style=""`. In the browser, CSSOM is allowed and parsed or `setAttribute` styles are blocked. Moving an inline style into a class drops its precedence from "beats everything" to the class's specificity, so restate the property (`svg { color: inherit }`) to keep global rules out. `min()` alone doesn't stop text overflowing a column; add `anywhere` in boxes whose tracks have a definite minimum. Component styles are appended to `head` after the app's stylesheet, so a global rule needs *more* specificity than the component rule to win: an equal one loses the tie (011 r1).

- **Template binding order (012).** Angular applies every property binding before any attribute binding (`UPDATE_ORDERING` in @angular/compiler), so `[src]` lands before `[attr.loading]`. For lazy images, bind `[attr.loading]` and then `[attr.src]`. `[width]="undefined"` writes `width="0"`, so use `[attr.width]` (null means absent). The `loading` name collides with the kit's boolean busy flag (button, select); a `'eager' | 'lazy'` union keeps them apart. **Story assets (012 r1):** the Storybook preview defaults to dark (canvas rgb(10,18,27)), so a custom-src story needs a dark partner: the mono emblem (#111827) was 1.06:1 and cost a round. In timing protocols, toggle every element first, then read: toggle-and-read in turn measures a half-toggled wrapping row.

- **axe 4.14 label in name (014).** `label-content-name-mismatch` is in `wcag21a` and matches whole words (NFKD, **parentheticals dropped**, non-letters → space): `Label, JM` passes, `Label (JM)` fails; one-character visible text ("J", "?") is always `incomplete`. It counts `aria-hidden` text as visible. An `lc-icon` without `decorative`/`ariaLabel` renders an unnamed `svg role="img"` (`svg-img-alt`): inside named controls use `[decorative]`. Before promising "no violations", run the full tag set on the stories: 014 found `svg-img-alt` and 8 other components the spec didn't know about.

**Why:** each of these cost a round trip or would have broken the build.

**How to apply:** name the relevant ones in the design's risk list.

Related: [[reference-measured-values]], [[reference-review-techniques]]
