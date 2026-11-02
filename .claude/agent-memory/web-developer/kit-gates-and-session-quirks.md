---
name: kit-gates-and-session-quirks
description: lc-design-system gate commands that work reliably (Jest workers, cwd/permission limits when the session is rooted outside the repo)
metadata:
  type: project
---

- Full Jest suite: default worker count overloaded the machine (2026-11-02: 911 s, a worker SIGSEGV, divider and notification-center.icons failing, both green alone). `npx nx run angular-ui-kit:test --maxWorkers=4` ran all 212 suites in 16 s.
- Session rooted outside the repo (dispatched from finance-intelligence/docs/ux/gaps): the repo's `.claude/settings.json` allowlist does not apply. Refused: any `git` in lc-design-system (`git -C`, `cd … && git`), `mkdir`, and `>` redirects (even into the scratchpad). Worked: `cd <repo> && npx nx run angular-ui-kit:<target> … | grep/tail`, `cd <repo> && node tools/… | tail`, `npm run test:tools`, Read/Edit/Write tools. Background tasks keep their output file readable.
  **Why:** request 031 could not branch or commit; build.md recorded a Blocker and a prepared `tmp/031/commit-msg.txt`.
  **How to apply:** check `cat <repo>/.git/HEAD` and try one git command first; if refused, do the work, write the commit message file, hand off to owner.
- **Node on the PATH can change between sessions** (034, 2026-11-02: v23.10.0; CI uses 24; earlier runs had no "Type Stripping" ExperimentalWarning in Jest logs). On 23.10 `check-angular-majors.mjs` fails at prerender ("extracting routes … reading 'exports'", `@angular/build` `routes-extractor-worker.js:56` `require('@angular/compiler')`), before any kit code loads: environmental, record it in build.md as blocked. The full log is `<work>/app-22/build.log`; read it with the Grep tool (Bash `grep`/`ls` outside the repo needs approval). `node --version` passes.
- Targeted lint: `npx nx run angular-ui-kit:lint --lintFilePatterns=<file> [--lintFilePatterns=…]` passes and prints the per-file summary (the full run's static log gets cut off before its count).
- The fesm bundles are partial compilation: templates ship as strings (with `&ngsp;` and HTML comments), so Grep `dist/.../fesm2022/*.mjs` for the template text, not for `ɵɵtext`.
- axe 4.14 label-content-name-mismatch uses visibleVirtual: text nodes joined with no separator (block elements add none), then word tokens without punctuation/arrows must be a contiguous run of the name. In Jest (jsdom) component SCSS is not loaded, so sr-only text counts as visible there but not in the browser: pick names that pass both. See [[axe-jsdom-helpers]].
