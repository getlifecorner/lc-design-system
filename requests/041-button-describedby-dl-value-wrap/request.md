# Request 041: lc-button ariaDescribedBy; lc-description-list short values never break inside

- **From:** finance-intelligence
- **Received:** 2026-11-03
- **Gap IDs:** gap file row 7 (quellen-2026-11-03); plus a bug from the same review (no gap ID)
- **Referenced files:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/quellen-2026-11-03.md (row 7); /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/concepts/quellen.md (section 7, row 7)
- **Kit version at intake:** 3.25.2

## Requirement (verbatim)

Arguments as received:

> /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/quellen-2026-11-03.md --from finance-intelligence Row 7 of this gap file: lc-button ariaDescribedBy (a function, look unchanged). Plus a bug from the same review, not a gap: lc-description-list in the rows layout breaks a short value between its characters when the term is long. Seen with leaders on kit 3.24.0 in a card at phone width (Pixel 7, iPhone 15): the row with term 'Sekundäre Kostenart (Umlage)' and value '10' showed '1' and '0' on two lines. Cause in description-list.component.scss: __term has flex-shrink: 0, __value has flex: 0 1 auto, min-width: 0 and overflow-wrap: anywhere, so all missing width comes out of the value and 'anywhere' breaks it inside '10'. Expected: a short value such as a number or an amount never breaks inside; in a tight row the term wraps at word boundaries first; long unbroken values (e-mail, IBAN, the 3.3 story) still wrap instead of overflowing. Accepted when: a story in an lc-card at 280 px and 312 px with leaders shows the term 'Sekundäre Kostenart (Umlage)' with the value '10' on one line and the term wrapped; the 3.3 story still wraps without overflow; rows that fit look as today. Finance Intelligence needs no change for the bug: since the review the rejection reasons use lc-list (text left, number right).

### Gap file header (quellen-2026-11-03.md, lines 1–6)

# Kit request from the Finance Intelligence sources page (2026-11-03)

- **From:** finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.22.2 in the project; docs checked against 3.24.1 through the `lc-design-system` MCP on 2026-11-03)
- **Approved concept:** [docs/ux/concepts/quellen.md](../concepts/quellen.md), section 7 („Lücken im Design-System“, row 7) (German), decided by the owner after the /prove review of spec 007 on 2026-11-03
- **Look:** none requested. The upload dialog uses `lc-button` as it renders (primary „Hochladen“, outline „Abbrechen“). The request is a function only (ADR-0009).
- **Status:** open

### Row 7 (verbatim)

| #   | Component   | Gap | Proposal | Accepted when | Our transition until the release |
| --- | ----------- | --- | -------- | ------------- | -------------------------------- |
| 7   | `lc-button` | `lc-button` has no `ariaDescribedBy` input (props: `variant`, `tone`, `size`, `disabled`, `loading`, `iconOnly`, `fullWidth`, `ariaLabel`, `type`, `title`, `disabledReason`, `inline`, `flush`). The lock reason of a disabled button („Wählen Sie zuerst eine Datei.“) therefore cannot be linked to the button for assistive technology. `disabledReason` is only a tooltip: it shows on hover and focus of a pointer device and never on a phone, so a reason shown on the page cannot be tied to the button it explains. | An input `ariaDescribedBy` (string, default empty) that sets `aria-describedby` on the inner `<button>` (also on `a[lcButton]`, if it is cheap to share). Look, hover, focus ring, `disabledReason` and every default stay as they are; without the new input nothing changes. Stories: a disabled button whose reason is a visible line below, and a loading button. | An `lc-button` with `ariaDescribedBy="reason"` next to a `<p id="reason">`: a screen reader reads the button's name and then the text of the paragraph, also while `disabled` and `loading`. With the input unset the rendered `<button>` has no `aria-describedby`. | The reason is a visible line under the drop zone in the upload dialog (concept sections 4 H and 10), so it also helps on a phone. `disabledReason` stays as an extra tooltip for pointers. The line is found by reading the dialog; it is not linked to the button. |
