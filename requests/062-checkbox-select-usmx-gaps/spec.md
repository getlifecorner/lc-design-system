# Spec 062: checkbox/chip contrast, select option groups, first USM X gaps

- **Status:** ready
- **Type:** bug fix + extension of `lc-checkbox`, `lc-chip`, `lc-select`, `lc-icon`, `lc-number-input`, `lc-button`, `lc-input`, `lc-badge`, `lc-spinner`
- **Affected:** `lib/{checkbox,chip,select,icon,icons,number-input,button,input,badge,spinner}/`, `icons/icons.data.ts` (generator `scripts/generate-icon-names.mjs`), stories, `CHANGELOG.md`, `tools/compat` (icon base path under a sub-path)
- **Semver impact:** minor. New optional inputs, a token and hooks; every default renders as before except the three contrast fixes (a deliberate look change in a WCAG failure, named in the changelog as *Changed*). No API break.

## Triage (the bundle is too big for one design)

The bundle has 24 rows. Eight work items go in; the rest of item 3 goes back to the inbox unchanged (`tmp/lc-request/inbox/20261117-0123-062-usmx-rest.md`: usm-x rows 4, 6, 7, 8, 11, 12, 13, 14, 16, 17, 18, 19, 20). Reason: those are large (sidenav, header, tabs, list, theme scope, number-input string mode) or need design decisions of their own.

| Group | Requester, IDs | Component |
|---|---|---|
| A | owner 061-s1, 061-s3; usm-x row 10; backlog 061-n1, 061-n2 | `lc-checkbox` |
| B | owner 061-s2; backlog 060-n4 | `lc-chip` (in `lc-hero`) |
| C | finance-intelligence services-prove row 1 | `lc-select` |
| D | usm-x rows 1, 2 | `lc-icon`, `lc-number-input` |
| E | usm-x row 3 | `lc-button` |
| F | usm-x row 9 | `lc-input` |
| G | usm-x row 15 | `lc-badge` |
| H | usm-x row 5 | `lc-spinner` |

Folded from `BACKLOG.md` (deleted there): 061-n1, 061-n2, 060-n4. `058-n2` (button story values) is folded into AC-26. Left in the backlog: 060-n5 (the 44 px premise for chips is unsettled, no decision to make here), 061-n3 (radio group, not touched).

## Need

- **A/B (owner, from 061 review F-1..F-3):** a disabled checked `lc-checkbox` looks unchecked in light (white check on `#f3f4f6` at opacity .5, 1.02:1); the box border is 2.54:1 at rest in light and 2.24:1 in the error state in dark (WCAG 1.4.11 needs 3:1; `lc-radio` uses `--color-field-border`); `lc-chip` hover inside `lc-hero` paints `--_lc-hero-glass` (chip.component.scss l. 320) and ignores `--lc-chip-bg`, giving 1.05-1.11:1 with a custom ink.
- **A (usm-x 10):** a read-only yes/no must read as "yes", not as unavailable; today only `disabled` (opacity .5, no hook) exists.
- **C (finance-intelligence):** `SelectOptionGroup[]` is accepted and the docs say "Option groups with headers", but `select.component.html` renders no headers (`flattenOptions` only flattens for search and lookup). The Services page's customer filter shows an ungrouped list at 360 px.
- **D (usm-x 1, 2):** an app under `<base href="/usmx/">` fetches non-inline glyphs from `/tabler-icons/...` (`icon.component.ts` `iconPath`, l. 355) and shows the placeholder. `lc-number-input` renders `<lc-icon name="minus">` but registers only `ICON_PLUS` (number-input.component.ts l. 64), and `ICON_MINUS` does not exist in `icons/icons.data.ts`.
- **E (usm-x 3):** `lc-button` has no `aria-pressed/-expanded/-haspopup/-controls`, so toggles and menu triggers fail WCAG 4.1.2 as `lc-button`.
- **F (usm-x 9):** `lc-input` marks invalid only through the `error` message (`input-invalid`, `aria-invalid` derive from it, l. 314); a form that lists missing fields once below cannot mark the fields.
- **G (usm-x 15):** `--lc-badge-bg/-fg/-border` are redeclared on `.lc-badge--<variant>`, so a value set on the host or an ancestor never wins; `lc-chip` (3.40) does it right.
- **H (usm-x 5):** `lc-spinner` `sm` is 20 px in a block with `padding: 1rem 0` (~52 px); it cannot sit inline in a row, tab or button slot.

## What the kit has today

Checked in source: no `readonly`/`invalid` on `lc-checkbox`/`lc-input` (input has `readonly` for the text value only), no ARIA state inputs on `lc-button` (only `ariaLabel`, `ariaDescribedBy`), `LC_LOGO_BASE_PATH` exists for logos only, `ICON_*` constants and `provideLcIcons` exist (`icons/`, `icon-registry.ts`). Nothing resolves these; no *Resolution* section.

## Scope

- In: groups A-H as acceptance criteria below.
- Not in: usm-x rows 4, 6-8, 11-14, 16-20 (inbox); a new look for any component; `lc-radio-group` (061-n3); the 44 px chip target (060-n5).

## Acceptance criteria

| ID | Criterion (observable) | Verified by |
|---|---|---|
| AC-1 | A (061-s1): a disabled checked `lc-checkbox` keeps the primary fill and a visible check mark; check against fill ≥ 3:1 after dimming, also disabled indeterminate; unchecked disabled unchanged | story, light + dark, measured colours; unit test class/state |
| AC-2 | A (061-s3): the box border at rest is ≥ 3:1 against page, surface-2 and sunken in light and dark (use `--color-field-border` like `lc-radio`); the error border is ≥ 3:1 on dark page, surface and raised; hover/checked/focus keep their look | computed contrast on all backgrounds, both themes; `theme-contrast.spec.ts` if a token changes |
| AC-3 | A (usm-x 10): new `readonly` input (`boolean`, default `false`): shows the checked/unchecked state at full contrast (≥ 4.5:1 for the check, ≥ 3:1 box), not operable (click and Space do nothing, no value change, no output), stays focusable, `aria-readonly="true"`; works in `lc-checkbox-group` per item and as group flag; not dimmed | unit tests (click, Space, `ngModel`/forms value), story light/dark, axe |
| AC-4 | A (061-n1): help and error text sit under the label text (indent = box width + gap, not 0) in all sizes | story measured x-offset of text vs label, 360 px |
| AC-5 | A (061-n2): a standalone `lc-checkbox size="lg"` row is ≥ 44 px high, as in `lc-radio lg`; sm/md unchanged unless below 44 px by the same rule as `lc-radio` (state the rule in the design) | story measured height at 360 px |
| AC-6 | B (061-s2): in `lc-hero`, a hovered clickable `lc-chip` fill follows `--lc-chip-bg` when set on host or ancestor; with a custom ink (`--lc-chip-fg`) text contrast ≥ 4.5:1 on hover in all hero bands | story at 360 and 1280, light + dark, measured |
| AC-7 | B (060-n4): clickable sm/md chips keep the chip font size (14 px), not the parent's 16 px; no change for non-clickable chips | measured `font-size` in story |
| AC-8 | C: `lc-select` with `SelectOptionGroup[]` renders a header per group (non-selectable, `role="group"` with `aria-labelledby`), in the panel and in the search-filtered list (empty groups are hidden while filtering) | unit test DOM; story *Grouped Options* at 360/1280 |
| AC-9 | C: keyboard and screen reader: arrow keys skip headers, `aria-activedescendant` and `aria-selected` stay correct, option count announces options only; header contrast ≥ 4.5:1 light/dark; DE long group labels truncate or wrap without overflow at 360 | unit test, axe, story DE |
| AC-10 | C: flat `SelectOption[]` renders byte-identical to 3.41.0; a group with a single option or `disabled` group (if the type has it) behaves as documented | existing select specs unchanged + new |
| AC-11 | D (usm-x 1): new `LC_ICON_BASE_PATH` injection token (string, default `/tabler-icons`, exported from `@lifecorner/angular-ui-kit/icon`), documented beside `provideLcIcons`; `iconPath` builds `${base}/<variant>/<name>.svg`; trailing slash tolerated | unit test with `/usmx/tabler-icons`; docs page/story |
| AC-12 | D: with the default token the requested URL is exactly `/tabler-icons/outline/<name>.svg` as before; prerendered HTML unchanged | unit test, compat check |
| AC-13 | D (usm-x 2): `ICON_MINUS` (outline + solid like the other pairs) is generated into `icons.data.ts` and exported from `@lifecorner/angular-ui-kit/icons`; `lc-number-input` registers it with `ɵprovideKitIcons([ICON_PLUS, ICON_MINUS])`; the decrement button shows the glyph with no network fetch | unit test (no fetch, svg present), generator run, prerendered HTML contains the svg |
| AC-14 | E (usm-x 3): `lc-button` gets optional inputs `ariaPressed` (`boolean \| 'mixed' \| null`), `ariaExpanded` (`boolean \| null`), `ariaHasPopup` (`'menu' \| 'listbox' \| 'tree' \| 'grid' \| 'dialog' \| boolean \| null`), `ariaControls` (`string`); default `null`/`''` renders no attribute; set values reach the inner `<button>` and not the host | unit tests incl. `false` renders `"false"`, `link` variant with `href` |
| AC-15 | E: a toggle styled via these inputs has a keyboard-operable state change announced by SR; pressed styling is the consumer's (no new visual); defaults unchanged | unit test, story *Toggle / menu trigger* |
| AC-16 | F (usm-x 9): `lc-input` gets `invalid` (`boolean`, default `false`): red border and `aria-invalid="true"` without printing a message; `error` set implies invalid as before; `invalid` + `error` shows the message once; `aria-describedby` unchanged when only `invalid` | unit tests, story light/dark, border ≥ 3:1 |
| AC-17 | F: the same `invalid` input is offered on the other text-field family components only if it costs no design decision (design decides; list in `design.md`); otherwise noted for the backlog | design.md |
| AC-18 | G (usm-x 15): `lc-badge` variants set private variables; `--lc-badge-bg/-fg/-border` set on host, ancestor or `:root` win over every variant; defaults pixel-identical | story with hook on an ancestor, light/dark; screenshot compare of all variants; unit/CSS test |
| AC-19 | H (usm-x 5): `lc-spinner` size `xs` (12-16 px, no padding, `display: inline-block`, vertical-align middle) sits inline in a 44 px row, a tab and a button-sized slot; `sm`/`md`/`lg` unchanged; keeps `role="status"` with accessible label; `prefers-reduced-motion` and `forced-colors` work | story measured size and box height at 360, light/dark |
| AC-20 | All new inputs have JSDoc with `@default`, story argTypes with `description` and `table.defaultValue`, and a story each | lint, MCP manifest build |
| AC-21 | EN and DE strings: every new built-in text (if any) is changeable through `locale` or a label input; DE verified | unit test, story DE |
| AC-22 | 360 px and 1024/1280 px, light and dark, `forced-colors`, `prefers-reduced-motion` checked for each changed component | story-shots measurements |
| AC-23 | Unchanged defaults: the unit suite of the touched components passes with no changed assertion except those for AC-1, AC-2, AC-5, AC-7 (stated in `build.md`) | full Jest run |
| AC-24 | Prerendered HTML before JavaScript: the compat consumer prerenders select groups, `ICON_MINUS` stepper, spinner `xs` and a disabled checked checkbox (add to `EXPECT_IN_HTML`) | `check-angular-majors.mjs` on 21 and 22 |
| AC-25 | CHANGELOG entry names each ID (061-s1..s3, services-prove row 1, usm-x rows 1, 2, 3, 5, 9, 10, 15), measured values, and lists the three contrast fixes under *Changed*; README component lists need no change | review of changelog |
| AC-26 | `058-n2` (button): stories and `button.component.scss` comments that still quote 3.36/3.62 values under old body opacity quote the current values (inverse label 13.17, fill/ring ≥ 4.58; inverse-outline text ≥ 9.3, border/ring ≥ 4.58) | grep in stories/scss, no old numbers left |

## Constraints

- Peer range `^21.0.0 || ^22.0.0` unchanged, no new runtime dependency, no API break.
- `ICON_MINUS` must come from the existing generator, not hand-edited.

## Assumptions

- Assumption: the usm-x rows were checked by the requester against the installed package; I verified rows 1, 2, 3, 5, 9, 10, 15 against source.
- Assumption: `readonly` on `lc-checkbox` also gives the read-only look in a group (item-level and group-level).
- Assumption: `LC_ICON_BASE_PATH` default `/tabler-icons` (not `document.baseURI`) keeps all current apps unchanged; usm-x provides `'/usmx/tabler-icons'` or equivalent. Design may add baseURI resolution only if the default stays identical.
- Assumption: raising the checkbox border to `--color-field-border` is accepted as a look change because it is a WCAG 1.4.11 failure (owner rule 2026-11-02: at least should-fix).
- Assumption: the group header for `lc-select` follows the kit look; no consumer look is requested (finance-intelligence ADR-0009).

## Open questions

None.
