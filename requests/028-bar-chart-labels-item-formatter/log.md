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
