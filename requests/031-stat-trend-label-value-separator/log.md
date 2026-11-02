# Log 031: lc-stat-trend label and value without a separator

## Owner decisions

none

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-02 | spec-writer → ui-ux-designer | done | The spec is ready, and the fix needs an a11y/markup design decision before it is built. | Design the separator approach for AC-1 to AC-11 of requests/031-stat-trend-label-value-separator/spec.md. Choose a whitespace text node or a visually hidden space. Keep the pinned pill text nodes unchanged, specify the "inside a clickable card" story, and take baseline screenshots of the existing stat-trend stories. |
| 2026-11-02 | ui-ux-designer → web-developer | done | The approach is decided and verified with axe 4.14 in the browser, and baselines exist in tmp/story-shots/031/, so the fix can be built. | Implement design.md of requests/031-stat-trend-label-value-separator: three &ngsp; separators in stat-trend.component.html, the separator unit tests and stat-trend.axe.spec.ts (§9), the "Inside a clickable card" story (§8), the compat EXPECT_IN_HTML regex (AC-6), and the changelog draft (AC-11). |
| 2026-11-02 | web-developer → owner | blocked | Committing needs git, which the session refused: the dispatcher's working directory had moved to finance-intelligence/docs/ux/gaps. | Choose: 1 (recommended) re-dispatch from a session rooted in lc-design-system so web-developer branches and commits; 2 owner commits by hand; 3 review the uncommitted tree first. |
| 2026-11-02 | dispatcher → web-developer | – | Dispatcher note: the cause was the dispatcher's own `cd`, not an owner decision. The working directory is back in lc-design-system and git works, so option 1 is carried out without an owner question. | Create fix/3.22.1-stat-trend-label-value-separator from the current tree and commit with tmp/031/commit-msg.txt (build.md "Blocker"), then hand off to ui-ux-designer for the review. |
