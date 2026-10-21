# Request 008: lc-textarea name and value for no-script posts

- **From:** life-os
- **Received:** 2026-10-21
- **Gap IDs:** G-CF1 (blocking), G-CF2 (confirm only), G-CF3 (optional, non-breaking only)
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/002-contact-form/docs/ux/concepts/website-contact-form.md (§7 *Design system gaps*, lines 139–147; component row at line 130)
- **Kit version at intake:** 3.9.0

## Requirement (verbatim)

Request text as received:

> /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/002-contact-form/docs/ux/concepts/website-contact-form.md --from life-os G-CF1 only (section 7, design system gaps): lc-textarea needs a name input and a value input (or model()) that render into the native <textarea> at prerender, so a no-script form post sends the message and the server's 422/429/503 pages can keep the text. Blocking for spec 002. Also confirm G-CF2 while you are in it: lc-input value lands in the prerendered value attribute; change nothing there unless it does not. G-CF3 (requiredIndicator / requiredAriaLabel like lc-input) is optional, only if non-breaking.

Referenced concept, §7 (line 130 and the gap rows, verbatim):

> | Message | `lc-textarea` | `label`, `size="md"`, `rows=6`, `required`, `error`, `errorMessage` | **no `name`, no `value`** → G-CF1; no `maxLength` on purpose (D-CF3) |

> | ID | Need | Proposal for lc-design-system | Interim solution | Blocking |
> |---|---|---|---|---|
> | G-CF1 | `lc-textarea` must post and pre-fill without script | `name` input and a `value` input (or `model()`) rendered into the native `<textarea>` at prerender | none acceptable locally | **yes** – without `name` a no-JS post sends no message; without `value` the 422/429/503 pages cannot keep the text (FR-006). **Owner, 2026-10-21: fixed in the kit first (3.10); the plan goes on, the form's build waits for the release** |
> | G-CF2 | proof that `lc-input` `value` serializes into the prerendered `value` attribute | – (plan test, not a kit change, unless it fails) | – | yes until proven (plan task) |
> | G-CF3 | `lc-textarea` `requiredIndicator` / `requiredAriaLabel` like `lc-input` | align the APIs | asterisk is aria-hidden; native `required` already announces "required" | no |
