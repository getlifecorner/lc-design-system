# Request 067: lc-number-input without steppers, lc-waterfall-chart long labels, USM X lc-sidenav gaps

- **From:** bundle (finance-intelligence, usm-x)
- **Received:** 2026-11-18 (bundle `tmp/lc-request/bundles/20261118-140110.md`, started by the owner 2026-11-18 14:01)
- **Gap IDs:** kosten-2026-11-18 rows 5, 6; usm-x 2026-11-18 rows 38–46
- **Referenced files:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/kosten-2026-11-18.md (rows 5 and 6)
- **Kit version at intake:** 3.46.0

## Requirement (verbatim)

### Item 1 (20261118-115746-68467)

- **From:** finance-intelligence (`/Users/eric/Documents/Projekte/usm/finance-intelligence`), 2026-11-18 11:57
- **File:** /Users/eric/Documents/Projekte/usm/finance-intelligence/docs/ux/gaps/kosten-2026-11-18.md

rows 5–6 (kosten-2026-11-18): lc-number-input without steppers (optional showSteppers, default true) for a typed euro amount; lc-waterfall-chart wraps or truncates category labels wider than their bar's space (German cause names overlap at nine bars, 564 px). Functions only, no change of look or defaults (ADR-0009).

### Item 2 (20261118-130032-26885)

- **From:** usm-x (`/Users/eric/Documents/Projekte/usm/usm-x`), 2026-11-18 13:00

#### Kit requests from USM X, fifth batch (2026-11-18)

From usm-x on 3.45.0, after moving both rails (a petrol work rail with a deep, lazily loaded tree of workflow entries, and a violet customizing rail with greyed areas) onto `lc-sidenav`. Thank you for 3.43-3.45, which closed every earlier row.

| #   | Component | Gap | Needed | Meanwhile |
| --- | --------- | --- | ------ | --------- |
| 38  | `lc-sidenav` | No slot between the brand and the items (an area picker and a search belong there); its only slot is below the items, and its drawer would hold only the items. | A slot after the brand. | Our column keeps brand, picker, search and the drawer; the kit is docked inside it. |
| 39  | `lc-sidenav` | The brand is always a link (`routerLink="/"` or a reloading `href`) and its tile takes no image or CSS filter (a customer's logo drawn as a white silhouette). | `brandRoute`, a non-link brand, an image tile with a filter hook. | Our own brand block while a theme names a logo. |
| 40  | `lc-sidenav` | Groups hold entries only - no group inside a group (USM navigations nest folders three levels deep). | Recursive children. | A nested folder drawn as its own group after its parent, with the parent's name as hint. |
| 41  | `lc-sidenav` | No input for which groups start open (the backend says so per folder), and the current item's group is re-opened on every items update, not only when the current item changes. | An expanded-groups input/model; re-open only on a current-item change. | `expandedItems` written through `viewChild`; no current mark inside a folded group. |
| 42  | `lc-sidenav` | The `action` button renders only for top-level items and direct section children, not inside a group; `itemAction` emits the item only, so a menu cannot be anchored to the button. | `action` at every level; the event/element with `itemAction`. | Menu reachable by right-click, long press and Shift+F10 inside groups; anchored by reading a kit class. |
| 43  | `lc-sidenav` | No public hook for the focus-ring colour (private `--_lc-sidenav-t-accent`, falling back to `--color-primary-500`), no separate ink for muted items (shares `--lc-sidenav-section-fg` with section heads and the brand subtitle), no icon-size hook (20 px fixed), a literal `#00000080` backdrop. | `--lc-sidenav-focus-ring`, a muted-item ink, an icon-size hook, a backdrop hook. | Section heads share the muted ink; icons stay 20 px. |
| 44  | `lc-sidenav` | The drawer closes on every Escape, ignoring `defaultPrevented` and anything standing above it (a command palette). | Respect `defaultPrevented`; close only when the drawer is the topmost layer. | A guard in the app's close handler. |
| 45  | `lc-sidenav` | The brand's height follows `logoSize` only, not the density (56 px beside a 48 px compact top row). | Brand height from the density or a hook. | Accepted. |
| 46  | `lc-sidenav` | Labels are plain text: no label template, no match highlighting while searching, and a truncated label has no `title`. | A label template or highlight input; `title` on truncated labels. | The full text as the row tooltip for long labels. |
