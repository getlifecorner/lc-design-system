# Request 027: lc-money and formatMoney without the currency symbol

- **From:** finance-intelligence
- **Received:** 2026-11-01
- **Gap IDs:** gap file row 1 (services-2026-11-01)
- **Referenced files:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/services-2026-11-01.md; /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/concepts/services.md (sections 5.1 and 7)
- **Kit version at intake:** 3.19.2

## Requirement (verbatim)

Source: /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/services-2026-11-01.md

# Kit request from the Finance Intelligence services page (2026-11-01)

- **From:** finance-intelligence (IT finance controlling, Angular 22, `@lifecorner/angular-ui-kit` 3.19.0)
- **Approved concept:** [docs/ux/concepts/services.md](../concepts/services.md), sections 5.1 and 7 (German)
- **Look:** none requested. The page uses the kit as it renders: KPI cards (`lc-card` + `lc-stat-trend`), one elevated `lc-card` per business service with `lc-accordion` and `lc-list` below 1024 px, `lc-table` in tree mode from 1024 px, `lc-modal placement="auto"` for the provenance. The one item is a function (ADR-0009).
- **Status:** open

| #   | Component                 | Gap                                                                                                                                                                                                                                     | Proposal                                                                                                                                                                                                                                                         | Accepted when                                                                                                                                                                                                                                                                                  | Our transition until the release                                                                                                                                                                                  |
| --- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `lc-money`, `formatMoney` | Both always show the currency symbol. In lists and tables where the unit stands once in the column header or title („Kosten in €“), every amount repeats „€“. There is no way to format an amount without the symbol and keep the rest. | An input `showCurrency: boolean` (default `true`) on `lc-money` and the same option on `formatMoney`. With `false`, only the symbol (and its space) is left out; digits, minor units, sign, tabular figures and the spoken text („42,17 Euro“) stay as they are. | `formatMoney(-4217, 'EUR', { locale: 'de-DE', showCurrency: false })` returns `{ text: '−42,17', spoken: 'minus 42,17 Euro' }`; `lc-money` with `[showCurrency]="false"` shows `−42,17` and still reads „minus 42,17 Euro“; without the option nothing changes; a story shows a number column. | A page format function with `Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` on cents / 100; a visually hidden „Euro“ after each amount. No component is rebuilt. Not urgent. |
