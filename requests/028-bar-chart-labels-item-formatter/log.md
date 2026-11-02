# Log 028: lc-bar-chart label band and item-aware value formatter

## Owner decisions

none

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 23:12 | spec-writer → ui-ux-designer | done | The spec is ready, and the API and visual choices belong to the designer. | Design the API and visuals for AC-1…15 in requests/028-bar-chart-labels-item-formatter/spec.md. Choose the label solution (a label position with the label above each bar, or a label width), the vertical-label fix, the final input names, and how the bar and its value text fit inside the card at 360 px. Take screenshot baselines of the current look. |
| 23:32 | ui-ux-designer → web-developer | done | The API, layout, states, contrast and verification plan are fixed and prototyped, and nothing needs an owner decision. | Implement design.md for request 028 (labelLayout 'axis'|'wrap', BarChartItem.valueText, BarChartValueFormatter with the optional item, the two CSS hooks, 5 new stories, compat-app entries and the changelog draft), keeping the default SVG byte-identical to tmp/story-shots/028/baseline. |
| 23:54 | web-developer → ui-ux-designer | done | The build matches design.md and all gates are green; only the designer can accept the Custom Format change, and the stories need a visual review. | Review request 028 (stories charts-bar-chart--ranking-in-a-card, --ranking-in-a-card-english, --ranking-long-labels, --ranking-negative-values, --wrapped-column-labels; shots in tmp/story-shots/028/new, measures in tmp/028/new.log) and decide on deviation 1 in build.md: the 6 Custom Format shots now show the formatter the story always passed. |
| 00:03 | ui-ux-designer → web-developer | changes-requested | The zero line from my design is covered by the bars and invisible; design.md is corrected, the rest of the build passes all AC, and deviation 1 is accepted. | Fix review.md round 1 finding 1 per the corrected design.md §3/§5/§9: zero line y1="-25%" y2="125%", stroke var(--color-text-tertiary), plus spec assertions; fold finding 2 into the changelog draft. Re-shoot charts-bar-chart--ranking-negative-values (360/1024/1280 L/D), confirm the 48 baseline shots stay identical, and check the other 4 new stories by measure. |
| 00:59 | web-developer → ui-ux-designer | done | Finding 1 is fixed and measured to the design's values; the 48 baseline shots and the other 4 new stories are unchanged; all gates are green on 62014b3. | Review request 028 round 2 (stories charts-bar-chart--ranking-negative-values; zero line per design §3/§5/§9, shots tmp/story-shots/028/r2-new, measures tmp/028/r2/new.log) and the revised changelog draft in build.md (finding 2). |
| 01:49 | ui-ux-designer → release-manager | done | Round 2 has no must-fix, every acceptance criterion passes with measured evidence, and build.md records all gates green on the tree of 62014b3, which is HEAD's tree for libs and tools. | Prepare the release for request 028 (3.21.0). Use the changelog draft in build.md, which already covers review finding 2, and keep the two open nits (3 and 4 in review.md) visible. |
| 02:20 | release-manager → owner | done | 3.21.0 is prepared, the build and pack are green and the release commit is made; the npm stage needs the owner's 2FA approval. | Approve the staged 3.21.0 with `npm stage approve <id>` once the publish run has finished. |
