# Request 042: Focus indicators, focus over hover, dependency-viewer at 360 px, file-upload remove target

- **From:** owner
- **Received:** 2026-11-03
- **Gap IDs:** 039/040 follow-ups F-18, F-19, F-20, F-21
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/039-progress-focus-borders-dl-semantics/design.md (section 6), /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/040-file-upload-nested-interactive/review.md
- **Kit version at intake:** 3.26.0

## Requirement (verbatim)

Follow-ups F-18 to F-21 of requests 039 and 040 (queued by the dispatcher under the owner's standing rule of 2026-11-02 that fixable findings go into the pipeline without asking, bundled into one release; details in requests/039-progress-focus-borders-dl-semantics/design.md section 6 and requests/040-file-upload-nested-interactive/review.md). F-18: a kit-wide sweep for buttons with no focus style of their own, because the global reset button:focus { outline: none } in _reset.scss:174 removes the browser ring (for example the lc-tag-input remove x; request 039 fixed three, D-4); every interactive element needs a visible focus indicator of at least 3:1 in both themes and Highlight in forced-colors. F-19: .lc-textarea--outline:hover:not(...) (specificity 0,4,0) beats :focus, so a focused field under the pointer shows --color-primary-400 (about 1.89:1 in light, derived from specificity, not measured yet); measure it and make focus win over hover in every field component that has the same pattern. F-20: at 360 px lc-dependency-viewer scales down to 47 %, so node borders draw at 0.71 px and labels at about 5.6 px; find a layout that keeps borders and labels readable at 360 px. F-21: the lc-file-upload remove button in the file list (.file-upload__file-remove) is 20 px and needs a target of at least 44 px, keeping focus-visible, the forced-colors outline, the per-file accessible name and the locale labels. Both themes, 360/1024/1280 px, EN and DE. No API break; the spec decides patch or minor.
