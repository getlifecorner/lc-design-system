---
name: feedback-build-pitfalls
description: Traps hit while building kit changes (Trusted Types fakes in Jest, hydration and CSP in the compat fixture, lc-skeleton widths, literal BOM from \u escapes, Storybook story-level providers)
metadata:
  type: feedback
---

Traps from request 001 (2026-10-17), each cost a debugging round:

- **Fake `window.trustedTypes` in Jest:** Angular's JIT compiler creates its own `angular#unsafe-jit` policy through it and calls `createScript`. A fake factory must return pass-through rules for `angular*` names and count only the kit's policies.
- **`lc-icon` (or any kit component rendering a `<div>`) inside a `<p>`** breaks hydration of prerendered HTML (NG0502): the HTML parser closes the `<p>`. Use `<div>`/`<span>` wrappers in fixtures.
- **Strict CSP fixtures:** Angular 22's default incremental hydration writes an inline event-dispatch script, and critical-CSS inlining an inline `<script>` / `onload`; `script-src 'self'` blocks both. The life-os settings (`withNoIncrementalHydration()`, `inlineCritical: false`) live only in the compat template's `csp` configuration (`app.config.csp.ts` via `fileReplacements`, built for Angular 22 by `check-angular-majors.mjs`); the matrix build keeps Angular's defaults (review finding in 3.5.0, fixed in 3.5.1).
- **Chrome in CI:** GitHub's Ubuntu runners block Chrome's sandbox (AppArmor userns). Any headless-Chrome tool that runs in CI needs `--no-sandbox` when `CI` is set; local runs keep the sandbox.
- **`ConfirmService`** mounts the dialog on a plain `<div>` host, so there is no `lc-confirm-dialog` element to query.
- **`lc-skeleton` with a percentage width** applies it to host and box, so it compounds (45 % → 20 %). Put the percentage on a wrapper.
- **Unicode escapes in written files:** writing `﻿` through the file tools produced a literal BOM, and eslint failed with `no-irregular-whitespace`. Grep for the escape after writing such code.
- **Storybook:** a story-level `applicationConfig` appends its providers after the global ones, so a story's `provideRouter(…, withHashLocation())` wins over preview's `provideRouter([])`. `@defer (on timer(…))` works in the JIT stories.
- **Entry graph (request 002):** ng-packagr finds entry dependencies with `ts.preProcessFile`, which counts `import type` and dynamic `import()`; a type-only import back from a lazily imported entry is a cycle. Comments with `from '@lifecorner/…'` trip `entries.spec.ts` (cycle/self-import regex).
- **AC "existing spec files unchanged" (request 004):** put new tests in a new `<name>.<topic>.spec.ts`. Compiled-CSS rule lookups (`sass.compile`): match selectors with a lookbehind `(?<=^|\})`, since `matchAll` consumes the previous rule's `}`; Angular merges same-selector rules in the browser.
- **Specs that read SCSS source text** (`sidenav.app-shell.spec.ts`) break when rules move to a partial; inline the partial's mixins in the spec setup instead of touching assertions. `--border-radius-sm` is 10 px in DS 2.0 (designs sometimes say 4 px).

- **`lc-icon` in Jest (request 003):** names outside the inline set (`clipboard-document` → Tabler `clipboard`) are fetched; the fetch cache is module-level and `resetIconCache` is not public. Register a fake glyph in the TestBed (`provideLcIcons([{ name, variant: 'outline', svg }])`) so it renders synchronously.
- **Text runs inside `<pre>`:** `@else{{{ x }}}}` compiles fine; write control flow with no whitespace. `[attr.class]` renders 10,000 token spans faster than `[class]` (115 vs 123 ms long task). Prerendered HTML gets a `<!---->` per `@for`/`@if` anchor.
- **Regex SVG/attr parsers (request 005):** attribute names carry digits (`x1`, `y2`); `[a-zA-Z-]+` silently skipped a whole tag. Count matched tags against `<[a-z]` and fail on a mismatch. A global slot rule like `.x__figure > img` also hits a component host's own images when the host carries the class: check the component's `display:none` still wins (it does at (0,2,0)).
- **Prerendered HTML differs per Angular line (3.8.0 CI failure):** 21.x and 22.0 build with Beasties 0.4.2 (dom-serializer 2), which writes empty attributes bare (`alt`, `_nghost-…`); 22.2 writes `alt=""`. An `EXPECT_IN_HTML` regex must accept both (`emptyAttr()` in check-angular-majors.mjs). `--only=22` alone misses it: for a new HTML check also run `--only=22.0` (≈1 min warm).
- **Request 006:** `test:tools`' manifest extractor fails "snippet for every story with a template" when a story's `template` is a method call (`tpl.replace(…)`); use a top-level helper with a default parameter (`const today = (figure = '') => \`…${figure}…\``). An `@if` around a projected element in a Jest host projects its `<!--container-->` anchor into that slot (an "empty slot" test needs a host without the `@if`). Angular serialises host `[class]` / `[style]` in its own order: compare sorted `classList` or style by property. A `<button>` with `display: inline` still lays out as inline-block (min-width applies). A JSDoc spec regex with `\s*\*` at fixed breaks fails on any rewrap: capture the `/** … */` above the input and compare it as one line (`replace(/\s*\n\s*\*\s?/g, ' ')`). A `--measure` probe that turns a story wrapper into a row must hide its other children (a `<p>` took the space).
- **Request 008:** replacing a separate `xChange = output()` with `x = model()` removes the public class member `xChange`; the kit's 2.0 changelog calls exactly that a breaking change. Keep `readonly xChange: OutputRef<T> = this.x` (not compiled as an output; outputs stay `{ x: 'xChange' }`) and flag it to the designer. jsdom normalises CR/CRLF in `textarea.value`; a static template attribute for an input (`requiredAriaLabel="…"`) stays on the host element.
**Why:** these are not visible in the code and each looked like a kit regression at first.
**How to apply:** check this list before debugging a failing fixture, browser check or story; add new traps here.

Related: [[reference-gates-and-measuring]]
