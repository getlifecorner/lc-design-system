# Request 040: lc-file-upload without nested interactive elements

- **From:** owner
- **Received:** 2026-11-03
- **Gap IDs:** none (037 review finding 5)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/lc-design-system/requests/037-card-link-file-upload-checks/review.md
- **Kit version at intake:** 3.25.1

## Requirement (verbatim)

Follow-up of request 037 (queued by the dispatcher under the owner's standing rule of 2026-11-02 that fixable findings go into the pipeline without asking; details in requests/037-card-link-file-upload-checks/review.md finding 5). lc-file-upload: axe reports nested-interactive on .file-upload in every File Upload story (pre-existing, also in 3.23.1): the drop zone has role=button and holds the native file input with tabindex=-1. Find a structure without nested interactive elements that keeps keyboard access (Enter and Space open the picker), drag and drop, the accessible name, the 44 px target, focus-visible and the forced-colors outline, and the behaviour added in 3.24.0 (rejection code, type check on drop, locale sizes). Both themes. No API break; the spec decides patch or minor.
