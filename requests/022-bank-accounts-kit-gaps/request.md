# Request 022: Bank accounts kit gaps

- **From:** life-os
- **Received:** 2026-10-31
- **Gap IDs:** BA-1, BA-3, BA-4, BA-5, TD-3, TD-4
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/004-connect-bank-accounts/specs/004-connect-bank-accounts/kit-gaps.md (the requirement); concepts it cites: /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/004-connect-bank-accounts/docs/ux/concepts/bank-accounts.md (section 7), /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/004-connect-bank-accounts/docs/ux/concepts/app-shell.md (7.1), /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/004-connect-bank-accounts/docs/ux/concepts/today.md (section 7); canvas https://claude.ai/artifact/94GA7AQdZFuxe2VSjD4XR9
- **Kit version at intake:** 3.15.0

Narrowed by the caller: "BA-1, BA-3, BA-4, BA-5, TD-3, TD-4: kit gaps for spec 004 Connect bank accounts; the owner decided kit first (2026-10-31)".

## Requirement (verbatim)

# Kit gaps for spec 004 "Connect bank accounts"

Owner decision at UX gate 2 (2026-10-31): **kit first**. The screens that use these parts wait for the release. life-os pins `@lifecorner/angular-ui-kit` 3.11.4 and moves to the release that closes these gaps.

Sources: [bank-accounts concept](../../docs/ux/concepts/bank-accounts.md) section 7 (component map and gaps), [app shell](../../docs/ux/concepts/app-shell.md) 7.1 (gap register), [today](../../docs/ux/concepts/today.md) section 7. Canvas: [Bank accounts](https://claude.ai/artifact/94GA7AQdZFuxe2VSjD4XR9) (boards named below).

| Gap | Component | What is missing | Proposal | Where it is used | Interim until the release |
|---|---|---|---|---|---|
| BA-1 | `lc-switch` | A description under the label, linked by `aria-describedby`, and a guaranteed 44 px row | `helpText` input (rendered below the label, `aria-describedby` set by the kit); host min-height 44 px | Connection page: the managing switch „Andere Erwachsene dürfen verwalten“ (boards 16, 22); Settings: the health sharing switch (account-settings boards 1, 22, 23) | A `body2` paragraph under the switch, linked by our own `aria-describedby` |
| BA-3 | `lc-table` | Rows that work with the keyboard, and a table caption | Focusable rows; Enter and Space emit `rowClick`; a `caption` input (visible or visually hidden) | Account page transactions from 1024 px (board 21) | A „Details“ action in the `actions` column; a heading above the table |
| BA-4 | new `lc-money` | A money display with locale, currency, sign, tabular numbers and a spoken reading | `lc-money` with `amountMinor` (integer minor units), `currency` (ISO 4217), `locale`, `signDisplay`; tabular numbers; accessible text such as „minus 42,17 Euro“ | Balances and transaction amounts on every Finances board (4, 5, 12, 13, 14, 20, 21, 23, 24), Today's sources line | `lc-typography` with our own formatter, `font-variant-numeric: tabular-nums` and an `aria-label` with the words. Related: kit request 021 (finance-intelligence) covers number columns in `lc-table` |
| BA-5 | `lc-next-step-card` | Two equal actions (a question with two answers of the same weight) | `secondaryVariant` input, or `actionsStyle="equal"` | The one-time health question „Gesundheitsbuchungen teilen?“ (board 7) | Both actions in the `actions` slot as two `lc-button variant="outline"` |
| TD-3 | `lc-icon` (inline set) | The icons `wallet` and `building-bank` | Add both Tabler icons to the inline set (no network fetch) | `wallet`: the Finances item in `lc-bottom-nav` and `lc-sidenav`; `building-bank`: banks, connections, the connect cards on Finances and Today | Register both with `provideLcIcons` in the app |
| TD-4 | `lc-list` | A row that is a real link | `href` (and a router-friendly variant) on a list item, rendered as `<a>` with the row's full area | Today's sources line (one link to `/finances`), the account rows on Finances (boards 4, 5, 25) | Wrap a non-clickable `lc-list` in one `<a>`; account rows `clickable` with `itemClick` |

Not a gap: Edu's poses `connects`, `discovered` and `connection-paused` ship in `lc-character` (kit 3.8.0) in light and dark.
