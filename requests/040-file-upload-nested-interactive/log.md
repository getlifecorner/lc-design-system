# Log 040: lc-file-upload without nested interactive elements

## Owner decisions

2026-11-02 (standing rule): fixable review and release findings go into the pipeline without asking.

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-03 | spec-writer → ui-ux-designer | done | The spec is ready and the structure choice is a design decision. | Design the structure and visuals for AC-1…17 of request 040. Choose a zone structure without nested interactive elements, and state why Enter, Space, the name, the focus ring and the drag handling still work. Keep the look identical to 3.25.1. |
| 2026-11-03 | ui-ux-designer → web-developer | done | The structure is decided and proven by an in-browser prototype (42/42 shots identical to 3.25.1, 0 axe violations), so it is ready to implement. | Implement design.md for request 040: the internal HTML/SCSS/TS changes in §2, the test changes and new unit tests in §9 (AC-1, 3–8, 12, 16), the compat probe for AC-15, the story wording in §7 and the Fixed changelog draft; justify the one changed assertion in build.md. |
