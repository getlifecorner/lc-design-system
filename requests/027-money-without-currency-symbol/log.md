# Log 027: lc-money and formatMoney without the currency symbol

## Owner decisions

- 2026-11-01 14:15: the headless run (pid 65418) ended after the spec handoff with no design output. The owner resumes it interactively in the dispatching session and widens the scope: also include the variant icon contrast of `lc-toast` and `lc-alert` (below 3:1: toast dark error 1.71, dark info 2.32, light success 2.60; `lc-alert` the same; requests/026-review-findings-follow-up-3/review.md finding 2). The spec gets this scope before the design starts.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 12:13 | spec-writer → ui-ux-designer | done | This is a small extension of an existing component and needs the design step before the build. | Design the API and visuals for AC-1…11 of request 027. That means the `showCurrency` input and option, how the symbol and its space are removed per locale, and the number-column story with measurements at 360 and 1280 px in both themes. |
| 14:15 | dispatcher → spec-writer | changes-requested | The owner widened the scope after the spec handoff, so the spec needs the new part before the design. | Add the owner's scope extension (log.md, Owner decisions 2026-11-01 14:15) to spec.md: the variant icon contrast of lc-toast and lc-alert, with acceptance criteria and the semver impact. |
| 14:16 | spec-writer → ui-ux-designer | done | The spec now covers the owner's widened scope and has no open questions, so the design step can start. | Design the API and visuals for AC-1 to AC-19 in spec.md. For Part B, choose an icon-only colour route for the lc-toast and lc-alert variant icons that reaches at least 3:1 in all 4 variants and both themes without changing the shared --color-success/error/warning/info values. Specify the token and its contrast assertion, and list any other components that use the same icon colours as follow-up candidates. |
| 14:33 | ui-ux-designer → web-developer | done | The design covers all 19 ACs with no open questions and no new token or API break, so the build can start. | Implement design.md for request 027: showCurrency on formatMoney and lc-money using the parts filter in §2, the Number Column story, the probe-316 line, and the toast/alert icon swap to --color-on-<variant>-subtle with the 3.20 block in theme-contrast.spec.ts; draft the changelog as in §9 (AC-11, AC-19). |
